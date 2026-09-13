"""Repository layer for database operations on Verification Logs."""
from __future__ import annotations

from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import VerificationLog


class VerificationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def save_log(self, log: VerificationLog) -> VerificationLog:
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_by_contract(self, contract_id: UUID) -> list[VerificationLog]:
        return list(
            self.db.scalars(
                select(VerificationLog)
                .where(VerificationLog.contract_id == contract_id)
                .order_by(VerificationLog.created_at.desc())
            ).all()
        )

    def get_by_id(self, log_id: UUID) -> VerificationLog | None:
        return self.db.get(VerificationLog, log_id)
