"""Contract upload, SHA-256 verification, clauses, AI analysis polling and market comparison."""
from __future__ import annotations

import os
import secrets
from pathlib import Path
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, File, Header, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..ai_engine import normalize_finding
from ..auth import check_admin_role, get_current_user
from ..database import get_db
from ..models import AnalysisResult, Contract, ContractClause, ContractImage, User
from ..repositories import ContractRepository, VerificationRepository
from ..schemas import (
    ClauseCreate,
    ClauseResponse,
    ContractImageResponse,
    ContractListResponse,
    ContractResponse,
    MarketComparisonResponse,
    VerificationLogResponse,
    VerificationResponse,
)
from ..services import AIService, ContractService, MarketService
from ..services.ai_service import get_analysis_result_from_db
from ..services.contract_service import extract_text_from_file

router = APIRouter(prefix="/api/contracts", tags=["contracts"])

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SECURE_STORAGE_ROOT = Path(os.getenv("SECURE_STORAGE_ROOT", str(PROJECT_ROOT / "secure_storage")))
MAX_IMAGE_SIZE = 10 * 1024 * 1024


def _run_ai_task(db_factory, log_id: UUID, contract_text: str, metadata: dict, contract_id: UUID = None, user_id: UUID = None) -> None:
    db = next(db_factory())
    try:
        ai_svc = AIService()
        ai_svc.analyze_contract_with_db_rules(db, log_id, contract_text, contract_id=contract_id, user_id=user_id, metadata=metadata)
    finally:
        db.close()


@router.get("", response_model=ContractListResponse)
def list_contracts(
    current: User = Depends(get_current_user),
    status: str | None = Query(None),
    contract_type: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List contracts owned by the current authenticated user with pagination and filters."""
    repo = ContractRepository(db)
    offset = (page - 1) * limit
    items, total = repo.list_by_user(
        user_id=current.id,
        status=status,
        contract_type=contract_type,
        offset=offset,
        limit=limit,
    )
    return ContractListResponse(items=items, total=total, page=page, limit=limit)


@router.post("", response_model=ContractResponse, status_code=201)
async def upload_contract(
    file: Annotated[UploadFile, File(...)],
    current: User = Depends(get_current_user),
    contract_type: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
):
    """Upload a new contract file and calculate initial SHA-256 hash."""
    service = ContractService(db)
    return await service.upload_contract(file, current, contract_type=contract_type)


def _serialize_analysis_result(r: AnalysisResult, contract: Contract | None = None) -> dict:
    findings = [normalize_finding(f) for f in (r.findings or [])]
    return {
        "id": str(r.id),
        "contract_id": str(r.contract_id),
        "user_id": str(r.user_id),
        "verification_log_id": str(r.verification_log_id) if r.verification_log_id else None,
        "risk_score": r.risk_score,
        "risk_label": r.risk_label,
        "ai_overview": r.ai_overview or "",
        "overview": r.ai_overview or "",
        "findings": findings,
        "ai_findings": findings,
        "analysis_source": r.analysis_source,
        "model_version": r.model_version,
        "analysis_duration_ms": r.analysis_duration_ms,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "original_filename": contract.original_filename if contract else None,
        "contract_type": contract.contract_type if contract else None,
        "file_size_bytes": contract.file_size_bytes if contract else None,
        "sha256_hash": contract.sha256_hash.strip() if contract and contract.sha256_hash else None,
        "contract_status": contract.status if contract else None,
    }


@router.get("/analysis-history/me", response_model=dict)
def get_my_analysis_history(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all AI analysis results belonging to the current user across all contracts."""
    offset = (page - 1) * limit
    total = db.scalar(
        select(func.count()).select_from(AnalysisResult).where(AnalysisResult.user_id == current.id)
    ) or 0
    rows = db.execute(
        select(AnalysisResult, Contract)
        .join(Contract, Contract.id == AnalysisResult.contract_id)
        .where(AnalysisResult.user_id == current.id)
        .order_by(AnalysisResult.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    items = [_serialize_analysis_result(r, c) for r, c in rows]
    return {"items": items, "total": total, "page": page, "limit": limit}


@router.get("/analysis-results/{result_id}", response_model=dict)
def get_analysis_result_detail(
    result_id: UUID,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single AI analysis result by its ID."""
    r = db.scalars(select(AnalysisResult).where(AnalysisResult.id == result_id)).first()
    if not r:
        raise HTTPException(404, "Analysis result not found")
    contract = ContractRepository(db).get_by_id(r.contract_id)
    if r.user_id != current.id and current.role != "admin":
        if not contract or contract.uploaded_by != current.id:
            raise HTTPException(403, "Not allowed to access this analysis result")
    return _serialize_analysis_result(r, contract)


@router.get("/{contract_id}", response_model=ContractResponse)
def contract_detail(
    contract_id: UUID,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get metadata for a specific contract."""
    repo = ContractRepository(db)
    contract = repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")
    ContractService(db).check_ownership(contract, current)
    return contract


@router.post("/{contract_id}/verify", response_model=VerificationResponse)
def verify_contract(
    contract_id: UUID,
    background_tasks: BackgroundTasks,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verify SHA-256 integrity by re-reading the stored file from server storage (AGENTS.md compliant)."""
    service = ContractService(db)
    contract, log, analysis_text = service.verify_contract(contract_id, current)

    metadata = {"contract_type": contract.contract_type}
    background_tasks.add_task(_run_ai_task, get_db, log.id, analysis_text, metadata, contract_id=contract.id, user_id=current.id)

    return VerificationResponse(
        contract_id=contract.id,
        expected_sha256=contract.sha256_hash.strip(),
        actual_sha256=log.actual_sha256.strip(),
        result=log.result,
        verification_log_id=log.id,
        duration_ms=log.duration_ms,
        risk_score=0,
        risk_label="processing",
        ai_overview="Hệ thống AI đang quét các điều khoản rủi ro ở background.",
        ai_findings=[],
    )


@router.get("/{contract_id}/analysis", response_model=dict)
def get_ai_analysis(
    contract_id: UUID,
    log_id: UUID = Query(...),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Poll AI analysis result for a given verification log."""
    repo = ContractRepository(db)
    contract = repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")
    ContractService(db).check_ownership(contract, current)

    db_result = get_analysis_result_from_db(db, log_id)
    if not db_result:
        # If background task is still running or not saved yet
        return {
            "status": "processing",
            "message": "AI analysis is still processing. Please try again shortly.",
        }

    return {"status": "completed", **db_result}


@router.get("/{contract_id}/analysis-history", response_model=list[dict])
def get_contract_analysis_history(
    contract_id: UUID,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all stored AI analysis results for a specific contract."""
    repo = ContractRepository(db)
    contract = repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")
    ContractService(db).check_ownership(contract, current)

    results = list(
        db.scalars(
            select(AnalysisResult)
            .where(AnalysisResult.contract_id == contract_id)
            .order_by(AnalysisResult.created_at.desc())
        ).all()
    )

    # If this contract was uploaded previously and has no stored analysis yet,
    # run analysis on the stored file automatically so the user can view its report.
    if not results:
        storage_path = Path(contract.storage_key)
        if storage_path.is_file():
            analysis_text = extract_text_from_file(storage_path)
            latest_log = VerificationRepository(db).get_by_contract(contract_id)
            log_id = latest_log[0].id if latest_log else None
            AIService().analyze_contract_with_db_rules(
                db=db,
                log_id=log_id or uuid4(),
                contract_text=analysis_text,
                contract_id=contract.id,
                user_id=contract.uploaded_by,
                metadata={"contract_type": contract.contract_type},
            )
            results = list(
                db.scalars(
                    select(AnalysisResult)
                    .where(AnalysisResult.contract_id == contract_id)
                    .order_by(AnalysisResult.created_at.desc())
                ).all()
            )

    return [_serialize_analysis_result(r, contract) for r in results]


@router.post("/{contract_id}/market-compare", response_model=MarketComparisonResponse)
def compare_market(
    contract_id: UUID,
    district: str | None = Query(None),
    base_rent: float | None = Query(None),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Compare contract terms (pricing, deposit) against student market benchmarks."""
    repo = ContractRepository(db)
    contract = repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")
    ContractService(db).check_ownership(contract, current)

    # Check if rental clauses exist in DB
    clauses = repo.get_clauses(contract_id)
    rental_rent = base_rent
    rental_district = district

    for clause in clauses:
        meta = clause.dynamic_metadata or {}
        if not rental_rent and "gia_thue" in meta:
            try:
                rental_rent = float(meta["gia_thue"])
            except (ValueError, TypeError):
                pass
        if not rental_district and "district" in meta:
            rental_district = str(meta["district"])

    market_svc = MarketService()
    comparison = market_svc.compare_rent_price(
        contract_id=contract.id,
        contract_type=contract.contract_type,
        district=rental_district,
        base_rent=rental_rent,
    )
    return MarketComparisonResponse(**comparison)


@router.post("/upload-image", response_model=ContractImageResponse, status_code=201)
async def upload_image(
    file: Annotated[UploadFile, File(...)],
    contract_id: UUID | None = Query(None),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload supplementary images/receipts for contracts."""
    if file.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(415, "Only image/jpeg and image/png are supported")

    header = await file.read(512)
    if file.content_type == "image/jpeg" and not header.startswith(b"\xff\xd8\xff"):
        raise HTTPException(400, "Corrupted or invalid JPEG image header")
    if file.content_type == "image/png" and not header.startswith(b"\x89PNG\r\n\x1a\n"):
        raise HTTPException(400, "Corrupted or invalid PNG image header")
    await file.seek(0)

    repo = ContractRepository(db)
    if contract_id is not None:
        contract = repo.get_by_id(contract_id)
        if not contract:
            raise HTTPException(404, "Contract not found")
        ContractService(db).check_ownership(contract, current)

    filename = Path(file.filename or "image").name[:255]
    extension = ".jpg" if file.content_type == "image/jpeg" else ".png"
    image_id = uuid4()
    target = SECURE_STORAGE_ROOT / "images" / str(image_id) / (secrets.token_hex(16) + extension)
    target.parent.mkdir(parents=True, exist_ok=True)

    import hashlib
    digest = hashlib.sha256()
    size = 0

    try:
        with target.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_IMAGE_SIZE:
                    raise HTTPException(413, "Image exceeds the 10 MiB limit")
                digest.update(chunk)
                output.write(chunk)
    except Exception:
        target.unlink(missing_ok=True)
        raise

    if size == 0:
        target.unlink(missing_ok=True)
        raise HTTPException(400, "Image must not be empty")

    image = ContractImage(
        id=image_id,
        uploaded_by=current.id,
        contract_id=contract_id,
        original_filename=filename,
        storage_key=str(target),
        mime_type=file.content_type,
        file_size_bytes=size,
        sha256_hash=digest.hexdigest(),
    )
    return repo.save_image(image)


@router.post("/{contract_id}/clauses", response_model=ClauseResponse, status_code=201)
def create_clause(
    contract_id: UUID,
    payload: ClauseCreate,
    current: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
):
    """Add a structured clause to a contract (Admin only)."""
    repo = ContractRepository(db)
    contract = repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")

    clause = ContractClause(
        id=uuid4(),
        contract_id=contract_id,
        **payload.model_dump(),
    )
    try:
        return repo.save_clause(clause)
    except IntegrityError:
        raise HTTPException(409, "Clause order already exists for this contract")


@router.get("/{contract_id}/clauses", response_model=list[ClauseResponse])
def get_clauses(
    contract_id: UUID,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all structured clauses of a contract."""
    repo = ContractRepository(db)
    contract = repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")
    ContractService(db).check_ownership(contract, current)
    return repo.get_clauses(contract_id)


@router.put("/{contract_id}/clauses/{clause_id}", response_model=ClauseResponse)
def update_clause(
    contract_id: UUID,
    clause_id: UUID,
    payload: ClauseCreate,
    current: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
):
    """Update a contract clause (Admin only)."""
    repo = ContractRepository(db)
    clause = repo.get_clause_by_id(clause_id)
    if not clause or clause.contract_id != contract_id:
        raise HTTPException(404, "Clause not found")

    clause.clause_type = payload.clause_type
    clause.clause_order = payload.clause_order
    clause.title = payload.title
    clause.content = payload.content
    clause.dynamic_metadata = payload.dynamic_metadata

    try:
        return repo.save_clause(clause)
    except IntegrityError:
        raise HTTPException(409, "Clause order already exists for this contract")


@router.delete("/{contract_id}/clauses/{clause_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_clause(
    contract_id: UUID,
    clause_id: UUID,
    current: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
):
    """Delete a contract clause (Admin only)."""
    repo = ContractRepository(db)
    clause = repo.get_clause_by_id(clause_id)
    if not clause or clause.contract_id != contract_id:
        raise HTTPException(404, "Clause not found")
    repo.delete_clause(clause)


@router.get("/{contract_id}/verifications", response_model=list[VerificationLogResponse])
def verification_history(
    contract_id: UUID,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get audit verification log history for a contract (Accessible by contract owner or Admin)."""
    repo = ContractRepository(db)
    contract = repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")
    ContractService(db).check_ownership(contract, current)

    verif_repo = VerificationRepository(db)
    return verif_repo.get_by_contract(contract_id)
