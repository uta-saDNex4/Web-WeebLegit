"""SQLAlchemy models for the empty Contract Verifier schema."""
from __future__ import annotations
from datetime import datetime
from typing import Any
from uuid import UUID
from sqlalchemy import Boolean, CHAR, CheckConstraint, DateTime, ForeignKey, Index, Integer, JSON, String, Text, UniqueConstraint, Uuid, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    __table_args__ = (CheckConstraint("role IN ('user', 'admin')", name="ck_users_role"),)
    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(32), nullable=False, default="user", server_default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="1")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

class Contract(Base):
    __tablename__ = "contracts"
    __table_args__ = (
        CheckConstraint("file_size_bytes > 0", name="ck_contracts_file_size"),
        CheckConstraint("status IN ('uploaded', 'verifying', 'verified', 'mismatch', 'failed')", name="ck_contracts_status"),
        CheckConstraint("length(sha256_hash) = 64", name="ck_contracts_hash_length"),
    )
    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    uploaded_by: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(1024), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(127), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(nullable=False)
    sha256_hash: Mapped[str] = mapped_column(CHAR(64), nullable=False, index=True)
    contract_type: Mapped[str | None] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="uploaded", server_default="uploaded", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

class VerificationLog(Base):
    __tablename__ = "verification_logs"
    __table_args__ = (
        CheckConstraint("result IN ('matched', 'mismatched', 'failed')", name="ck_verification_result"),
        CheckConstraint("length(expected_sha256) = 64 AND length(actual_sha256) = 64", name="ck_verification_hash_length"),
        CheckConstraint("duration_ms IS NULL OR duration_ms >= 0", name="ck_verification_duration"),
    )
    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    contract_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("contracts.id", ondelete="RESTRICT"), nullable=False, index=True)
    requested_by: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    expected_sha256: Mapped[str] = mapped_column(CHAR(64), nullable=False)
    actual_sha256: Mapped[str] = mapped_column(CHAR(64), nullable=False)
    result: Mapped[str] = mapped_column(String(32), nullable=False)
    error_code: Mapped[str | None] = mapped_column(String(64))
    error_message: Mapped[str | None] = mapped_column(Text)
    duration_ms: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


Index("idx_contracts_user_date", Contract.uploaded_by, Contract.created_at.desc())
Index("idx_contracts_status_date", Contract.status, Contract.created_at.desc())
Index("idx_logs_contract_date", VerificationLog.contract_id, VerificationLog.created_at.desc())

class ContractClause(Base):
    __tablename__ = "contract_clauses"
    __table_args__ = (UniqueConstraint("contract_id", "clause_order", name="uq_contract_clause_order"), CheckConstraint("clause_order > 0", name="ck_clause_order"))
    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    contract_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("contracts.id", ondelete="RESTRICT"), nullable=False, index=True)
    clause_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    clause_order: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str | None] = mapped_column(String(255))
    content: Mapped[str | None] = mapped_column(Text)
    dynamic_metadata: Mapped[dict[str, Any]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=False, default=dict, server_default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class LegalReference(Base):
    """Imported legal-reference rows used by contract analysis."""
    __tablename__ = "legal_references"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    clause_category: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    rule_name: Mapped[str] = mapped_column(String(255), nullable=False)
    standard_value: Mapped[str] = mapped_column(Text, nullable=False)
    unit: Mapped[str] = mapped_column(String(64), nullable=False)
    reference: Mapped[str] = mapped_column(String(2048), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class RiskRule(Base):
    """Imported keyword rules used to scan contract text."""
    __tablename__ = "risk_rules"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    target_section: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    keyword_trigger: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    risk_level: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    default_warning_message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ContractImage(Base):
    """Metadata for contract or receipt images stored outside PostgreSQL."""
    __tablename__ = "contract_images"
    __table_args__ = (
        CheckConstraint("file_size_bytes > 0", name="ck_contract_images_file_size"),
        CheckConstraint("mime_type IN ('image/jpeg', 'image/png')", name="ck_contract_images_mime_type"),
        CheckConstraint("length(sha256_hash) = 64", name="ck_contract_images_hash_length"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    uploaded_by: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    contract_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("contracts.id", ondelete="RESTRICT"), nullable=True, index=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(1024), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(127), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(nullable=False)
    sha256_hash: Mapped[str] = mapped_column(CHAR(64), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
