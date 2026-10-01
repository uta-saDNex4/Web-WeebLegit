"""Contract upload, SHA-256 verification, clauses, AI analysis polling and market comparison."""
from __future__ import annotations

import os
import secrets
from pathlib import Path
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, Header, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..ai_engine import normalize_finding, quick_check_contract_skill
from ..auth import _decode_access_token, check_admin_role, get_current_user
from ..database import get_db
from ..models import AnalysisResult, Contract, ContractClause, ContractImage, User
from ..repositories import ContractRepository, VerificationRepository
from ..schemas import (
    ClauseCreate,
    ClauseResponse,
    ContractCompareRequest,
    ContractContentResponse,
    ContractImageResponse,
    ContractListResponse,
    ContractResponse,
    MarketComparisonResponse,
    QuickCheckResponse,
    VerificationLogResponse,
    VerificationResponse,
)
from ..services import AIService, ContractService, MarketService
from ..services.ai_service import get_analysis_result_from_db
from ..services.contract_service import extract_text_from_file
from ..services.subscription_service import check_contract_quota, get_user_subscription_info

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
    contract_type_form: Annotated[str | None, Form(alias="contract_type")] = None,
    db: Session = Depends(get_db),
):
    """Upload a new contract file and calculate initial SHA-256 hash after verifying subscription quota."""
    from urllib.parse import unquote
    raw_type = contract_type_form or contract_type
    actual_contract_type = unquote(raw_type) if raw_type else None

    check_contract_quota(db, current)
    service = ContractService(db)
    return await service.upload_contract(file, current, contract_type=actual_contract_type)


@router.post("/compare", response_model=dict)
def compare_two_contracts(
    payload: ContractCompareRequest,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Compare two contracts of the same contract_type side-by-side (Medium & Pro tiers only)."""
    sub_info = get_user_subscription_info(db, current)
    if not sub_info["can_compare_contracts"]:
        raise HTTPException(
            status_code=403,
            detail="Tính năng So sánh 2 Hợp đồng yêu cầu gói Medium hoặc Pro. Vui lòng nâng cấp tại /upgrade.",
        )

    if payload.contract_id_a == payload.contract_id_b:
        raise HTTPException(status_code=400, detail="Vui lòng chọn 2 hợp đồng khác nhau để so sánh.")

    repo = ContractRepository(db)
    contract_a = repo.get_by_id(payload.contract_id_a)
    contract_b = repo.get_by_id(payload.contract_id_b)
    if not contract_a or not contract_b:
        raise HTTPException(status_code=404, detail="Không tìm thấy một trong hai hợp đồng.")

    ContractService(db).check_ownership(contract_a, current)
    ContractService(db).check_ownership(contract_b, current)

    type_a = (contract_a.contract_type or "chung").strip().lower()
    type_b = (contract_b.contract_type or "chung").strip().lower()
    if type_a != type_b:
        raise HTTPException(
            status_code=400,
            detail=f"Chỉ cho phép so sánh 2 hợp đồng cùng loại (Hợp đồng A: '{contract_a.contract_type or 'Chung'}' ≠ Hợp đồng B: '{contract_b.contract_type or 'Chung'}').",
        )

    def _get_or_create_latest_analysis(c: Contract) -> AnalysisResult | None:
        res = db.scalars(
            select(AnalysisResult)
            .where(AnalysisResult.contract_id == c.id)
            .order_by(AnalysisResult.created_at.desc())
        ).first()
        if not res:
            storage_path = Path(c.storage_key)
            if storage_path.is_file():
                text = extract_text_from_file(storage_path)
                latest_log = VerificationRepository(db).get_by_contract(c.id)
                log_id = latest_log[0].id if latest_log else uuid4()
                AIService().analyze_contract_with_db_rules(
                    db=db,
                    log_id=log_id,
                    contract_text=text,
                    contract_id=c.id,
                    user_id=c.uploaded_by,
                    metadata={"contract_type": c.contract_type},
                )
                res = db.scalars(
                    select(AnalysisResult)
                    .where(AnalysisResult.contract_id == c.id)
                    .order_by(AnalysisResult.created_at.desc())
                ).first()
        return res

    res_a = _get_or_create_latest_analysis(contract_a)
    res_b = _get_or_create_latest_analysis(contract_b)

    def _summarize(c: Contract, r: AnalysisResult | None) -> dict:
        findings = [normalize_finding(f) for f in (r.findings if r and r.findings else [])]
        high_cnt = sum(1 for f in findings if str(f.get("severity", "")).lower() in ("high", "critical", "cao"))
        med_cnt = sum(1 for f in findings if str(f.get("severity", "")).lower() in ("medium", "trung bình"))
        low_cnt = max(0, len(findings) - high_cnt - med_cnt)
        return {
            "contract_id": str(c.id),
            "original_filename": c.original_filename,
            "contract_type": c.contract_type or "Chung",
            "sha256_hash": c.sha256_hash.strip() if c.sha256_hash else "",
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "risk_score": float(r.risk_score) if r else 0.0,
            "risk_label": r.risk_label if r else "Chưa phân tích",
            "overview": (r.ai_overview or "") if r else "",
            "findings_count": len(findings),
            "high_risk_count": high_cnt,
            "medium_risk_count": med_cnt,
            "low_risk_count": low_cnt,
            "findings": findings,
        }

    sum_a = _summarize(contract_a, res_a)
    sum_b = _summarize(contract_b, res_b)

    score_a = sum_a["risk_score"]
    score_b = sum_b["risk_score"]
    diff = round(abs(score_a - score_b), 1)

    if score_a <= score_b:
        safer = sum_a
        riskier = sum_b
    else:
        safer = sum_b
        riskier = sum_a

    return {
        "contract_type": contract_a.contract_type or "Chung",
        "contract_a": sum_a,
        "contract_b": sum_b,
        "score_difference": diff,
        "safer_contract_id": safer["contract_id"],
        "safer_filename": safer["original_filename"],
        "recommendation_vi": (
            f"Hợp đồng '{safer['original_filename']}' an toàn hơn với điểm rủi ro {safer['risk_score']}/100 "
            f"({safer['high_risk_count']} điều khoản nguy hiểm cao), thấp hơn {diff} điểm so với "
            f"'{riskier['original_filename']}' ({riskier['risk_score']}/100, {riskier['high_risk_count']} điều khoản nguy hiểm cao). "
            f"Khuyến nghị ưu tiên ký hoặc dùng '{safer['original_filename']}' làm chuẩn đàm phán."
        ),
        "recommendation_en": (
            f"Contract '{safer['original_filename']}' is safer with a risk score of {safer['risk_score']}/100 "
            f"({safer['high_risk_count']} high-risk clauses), which is {diff} points lower than "
            f"'{riskier['original_filename']}' ({riskier['risk_score']}/100, {riskier['high_risk_count']} high-risk clauses). "
            f"We recommend prioritizing '{safer['original_filename']}' as your negotiation baseline."
        ),
    }



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


@router.post("/{contract_id}/quick-check", response_model=QuickCheckResponse)
def quick_check_contract(
    contract_id: UUID,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Execute AI Quick Check skill: constant-time SHA-256 + deterministic low-token risk check."""
    service = ContractService(db)
    contract, log, analysis_text = service.verify_contract(contract_id, current)

    metadata = {"contract_type": contract.contract_type}
    report = quick_check_contract_skill(analysis_text, metadata)

    # Save to AnalysisResult for permanent history
    findings_formatted = [
        {"title": f"Cảnh báo: {r[:40]}", "warning": r, "severity": "high", "matched_term": r}
        for r in report.get("key_risks", [])
    ]
    try:
        from ..services.ai_service import save_analysis_result_to_db
        save_analysis_result_to_db(
            db=db,
            contract_id=contract.id,
            user_id=current.id,
            log_id=log.id,
            report={
                "risk_score": report["risk_score"],
                "risk_label": report["risk_label"],
                "ai_overview": report["ai_overview"],
                "ai_findings": findings_formatted,
            },
            analysis_source="hybrid",
            model_version=report.get("model_version"),
            duration_ms=log.duration_ms,
        )
    except Exception as exc:
        print(f"[QuickCheck] Failed to save analysis result: {exc}")

    return QuickCheckResponse(
        contract_id=contract.id,
        expected_sha256=contract.sha256_hash.strip(),
        actual_sha256=log.actual_sha256.strip(),
        result=log.result,
        verification_log_id=log.id,
        duration_ms=log.duration_ms,
        risk_score=float(report["risk_score"]),
        risk_label=report["risk_label"],
        ai_overview=report["ai_overview"],
        key_risks=report.get("key_risks", []),
        high_risk_count=report.get("high_risk_count", 0),
    )


@router.get("/{contract_id}/content", response_model=ContractContentResponse)
def get_contract_content(
    contract_id: UUID,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve full extracted text and metadata of a contract for Legal Studio display."""
    repo = ContractRepository(db)
    contract = repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")
    ContractService(db).check_ownership(contract, current)

    storage_path = Path(contract.storage_key)
    text = ""
    if storage_path.is_file():
        text = extract_text_from_file(storage_path)

    ext = Path(contract.original_filename).suffix.lower()
    is_image = ext in {".jpg", ".jpeg", ".png", ".webp"} or (contract.mime_type or "").startswith("image/")

    return ContractContentResponse(
        contract_id=contract.id,
        original_filename=contract.original_filename,
        mime_type=contract.mime_type,
        file_size_bytes=contract.file_size_bytes,
        sha256_hash=contract.sha256_hash.strip(),
        contract_type=contract.contract_type or "Chung",
        created_at=contract.created_at,
        text=text,
        char_count=len(text),
        is_image=is_image,
        file_url=f"/api/contracts/{contract.id}/raw",
    )


@router.get("/{contract_id}/raw")
def get_contract_raw_file(
    contract_id: UUID,
    token: str | None = Query(None),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    """Serve the raw original contract file (Image, PDF, Word) with owner authentication via header or token query."""
    raw_token = token
    if not raw_token and authorization and authorization.startswith("Bearer "):
        raw_token = authorization.split("Bearer ", 1)[1].strip()

    user = None
    if raw_token:
        payload = _decode_access_token(raw_token)
        uid = payload.get("sub")
        if uid:
            user = db.get(User, UUID(str(uid)))

    repo = ContractRepository(db)
    contract = repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")

    if not user or (contract.uploaded_by != user.id and user.role != "admin"):
        raise HTTPException(403, "Not allowed to access this contract file")

    storage_path = Path(contract.storage_key)
    if not storage_path.is_file():
        raise HTTPException(404, "File not found on storage")

    mime = contract.mime_type or "application/octet-stream"
    return FileResponse(
        path=str(storage_path),
        media_type=mime,
        filename=contract.original_filename,
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
            try:
                analysis_text = extract_text_from_file(storage_path)
                latest_log = VerificationRepository(db).get_by_contract(contract_id)
                log_id = latest_log[0].id if latest_log else None
                AIService().analyze_contract_with_db_rules(
                    db=db,
                    log_id=log_id,
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
            except Exception as exc:
                db.rollback()
                print(f"[AnalysisHistory] Auto-analysis fallback failed: {exc}")

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
    sub_info = get_user_subscription_info(db, current)
    if sub_info["plan_tier"] == "free":
        raise HTTPException(
            status_code=403,
            detail="Tính năng So sánh Giá Thị Trường yêu cầu gói Medium hoặc Pro. Vui lòng nâng cấp tại /upgrade.",
        )

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
