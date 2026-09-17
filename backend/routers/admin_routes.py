"""Admin dashboard management endpoints for contracts, users, audit logs, and risk rules."""
from __future__ import annotations

from typing import Any
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import check_admin_role
from ..database import get_db
from ..models import Contract, ContractClause, LegalReference, RiskRule, User, VerificationLog

router = APIRouter(prefix="/api/admin", tags=["admin"])


class AdminStatsResponse(BaseModel):
    total_users: int
    total_contracts: int
    verified_contracts: int
    mismatch_contracts: int
    total_verifications: int
    total_risk_rules: int
    total_legal_references: int


class AdminUserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str | None
    role: str
    is_active: bool
    created_at: Any


class AdminContractItem(BaseModel):
    id: UUID
    uploader_email: str
    original_filename: str
    file_size_bytes: int
    sha256_hash: str
    contract_type: str | None
    status: str
    created_at: Any


class AdminLogItem(BaseModel):
    id: UUID
    contract_id: UUID
    contract_filename: str
    requested_by_email: str
    expected_sha256: str
    actual_sha256: str
    result: str
    duration_ms: int | None
    created_at: Any


class RiskRuleCreate(BaseModel):
    keyword_trigger: str = Field(..., min_length=1)
    risk_level: str = Field("medium", pattern="^(critical|high|medium|low)$")
    default_warning_message: str
    target_section: str = "Điều khoản rủi ro"


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    """Return platform statistics for the admin dashboard."""
    total_users = db.scalar(select(func.count()).select_from(User)) or 0
    total_contracts = db.scalar(select(func.count()).select_from(Contract)) or 0
    verified = db.scalar(select(func.count()).select_from(Contract).where(Contract.status == "verified")) or 0
    mismatched = db.scalar(select(func.count()).select_from(Contract).where(Contract.status == "mismatch")) or 0
    total_verifs = db.scalar(select(func.count()).select_from(VerificationLog)) or 0
    total_rules = db.scalar(select(func.count()).select_from(RiskRule)) or 0
    total_refs = db.scalar(select(func.count()).select_from(LegalReference)) or 0

    return {
        "total_users": total_users,
        "total_contracts": total_contracts,
        "verified_contracts": verified,
        "mismatch_contracts": mismatched,
        "total_verifications": total_verifs,
        "total_risk_rules": total_rules,
        "total_legal_references": total_refs,
    }


@router.get("/users", response_model=list[AdminUserResponse])
def get_all_users(
    admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
):
    """List all registered users (Admin only)."""
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: UUID,
    is_active: bool = Query(...),
    admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
):
    """Toggle user active status."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = is_active
    db.commit()
    return {"message": "User status updated", "is_active": user.is_active}


@router.get("/contracts", response_model=list[AdminContractItem])
def get_all_contracts(
    admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
):
    """List all contracts with uploader info for admin review."""
    query = (
        select(Contract, User.email)
        .join(User, Contract.uploaded_by == User.id)
        .order_by(Contract.created_at.desc())
    )
    rows = db.execute(query).all()
    return [
        {
            "id": c.id,
            "uploader_email": email,
            "original_filename": c.original_filename,
            "file_size_bytes": c.file_size_bytes,
            "sha256_hash": c.sha256_hash,
            "contract_type": c.contract_type,
            "status": c.status,
            "created_at": c.created_at,
        }
        for c, email in rows
    ]


@router.get("/logs", response_model=list[AdminLogItem])
def get_all_verification_logs(
    admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
):
    """List verification audit logs across the entire platform."""
    query = (
        select(VerificationLog, Contract.original_filename, User.email)
        .join(Contract, VerificationLog.contract_id == Contract.id)
        .join(User, VerificationLog.requested_by == User.id)
        .order_by(VerificationLog.created_at.desc())
        .limit(100)
    )
    rows = db.execute(query).all()
    return [
        {
            "id": log.id,
            "contract_id": log.contract_id,
            "contract_filename": filename,
            "requested_by_email": email,
            "expected_sha256": log.expected_sha256,
            "actual_sha256": log.actual_sha256,
            "result": log.result,
            "duration_ms": log.duration_ms,
            "created_at": log.created_at,
        }
        for log, filename, email in rows
    ]


@router.get("/risk-rules")
def get_risk_rules(
    admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
):
    """List all risk rules configured in the database."""
    rules = db.scalars(select(RiskRule).order_by(RiskRule.created_at.desc())).all()
    return [
        {
            "id": r.id,
            "keyword_trigger": r.keyword_trigger,
            "risk_level": r.risk_level,
            "default_warning_message": r.default_warning_message,
            "target_section": r.target_section,
        }
        for r in rules
    ]


@router.post("/risk-rules", status_code=201)
def create_risk_rule(
    payload: RiskRuleCreate,
    admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
):
    """Create a new risk keyword rule."""
    rule = RiskRule(
        id=uuid4(),
        keyword_trigger=payload.keyword_trigger.strip(),
        risk_level=payload.risk_level,
        default_warning_message=payload.default_warning_message.strip(),
        target_section=payload.target_section.strip(),
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/risk-rules/{rule_id}", status_code=204)
def delete_risk_rule(
    rule_id: UUID,
    admin: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
):
    """Delete a risk rule."""
    rule = db.get(RiskRule, rule_id)
    if not rule:
        raise HTTPException(404, "Risk rule not found")
    db.delete(rule)
    db.commit()
