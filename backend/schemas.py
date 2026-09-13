"""Pydantic request/response contracts exposed by the API."""
from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UserRegistration(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=8, max_length=256)
    full_name: str | None = Field(None, max_length=255)


class UserLogin(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=256)


class UserUpdate(BaseModel):
    full_name: str | None = Field(None, max_length=255)
    password: str | None = Field(None, min_length=8, max_length=256)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str | None
    role: str
    is_active: bool
    created_at: datetime


class ContractResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    uploaded_by: UUID
    original_filename: str
    mime_type: str
    file_size_bytes: int
    sha256_hash: str
    contract_type: str | None
    status: str
    created_at: datetime
    updated_at: datetime


class ContractListResponse(BaseModel):
    items: list[ContractResponse]
    total: int
    page: int
    limit: int


class VerificationResponse(BaseModel):
    contract_id: UUID
    expected_sha256: str
    actual_sha256: str
    result: str
    verification_log_id: UUID
    duration_ms: int | None
    risk_score: float = 0
    risk_label: str = ""
    ai_overview: str = ""
    ai_findings: list[dict[str, Any]] = Field(default_factory=list)


class ClauseCreate(BaseModel):
    clause_type: str = Field(min_length=1, max_length=64)
    clause_order: int = Field(gt=0)
    title: str | None = Field(None, max_length=255)
    content: str | None = None
    dynamic_metadata: dict[str, Any] = Field(default_factory=dict)


class ClauseResponse(ClauseCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    contract_id: UUID
    created_at: datetime
    updated_at: datetime


class VerificationLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    contract_id: UUID
    requested_by: UUID
    expected_sha256: str
    actual_sha256: str
    result: str
    error_code: str | None
    error_message: str | None
    duration_ms: int | None
    created_at: datetime


class ContractImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    uploaded_by: UUID
    contract_id: UUID | None
    original_filename: str
    mime_type: str
    file_size_bytes: int
    sha256_hash: str
    created_at: datetime
    updated_at: datetime


class MarketComparisonResponse(BaseModel):
    contract_id: UUID
    contract_type: str | None
    district: str | None
    price_evaluation: str
    price_difference_percent: float | None
    market_average: float | None
    recommendations: list[str] = Field(default_factory=list)
