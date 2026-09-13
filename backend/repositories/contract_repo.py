"""Repository layer for database operations on Contracts and Clauses."""
from __future__ import annotations

from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from ..models import Contract, ContractClause, ContractImage


class ContractRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, contract_id: UUID) -> Contract | None:
        return self.db.get(Contract, contract_id)

    def get_by_id_for_update(self, contract_id: UUID) -> Contract | None:
        return self.db.scalar(
            select(Contract).where(Contract.id == contract_id).with_for_update()
        )

    def list_by_user(
        self,
        user_id: UUID,
        status: str | None = None,
        contract_type: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Contract], int]:
        stmt = select(Contract).where(Contract.uploaded_by == user_id)
        if status:
            stmt = stmt.where(Contract.status == status)
        if contract_type:
            stmt = stmt.where(Contract.contract_type == contract_type)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        stmt = stmt.order_by(Contract.created_at.desc()).offset(offset).limit(limit)
        items = list(self.db.scalars(stmt).all())
        return items, total

    def save_contract(self, contract: Contract) -> Contract:
        self.db.add(contract)
        self.db.commit()
        self.db.refresh(contract)
        return contract

    def save_image(self, image: ContractImage) -> ContractImage:
        self.db.add(image)
        self.db.commit()
        self.db.refresh(image)
        return image

    def get_clauses(self, contract_id: UUID) -> list[ContractClause]:
        return list(
            self.db.scalars(
                select(ContractClause)
                .where(ContractClause.contract_id == contract_id)
                .order_by(ContractClause.clause_order.asc())
            ).all()
        )

    def get_clause_by_id(self, clause_id: UUID) -> ContractClause | None:
        return self.db.get(ContractClause, clause_id)

    def save_clause(self, clause: ContractClause) -> ContractClause:
        self.db.add(clause)
        self.db.commit()
        self.db.refresh(clause)
        return clause

    def delete_clause(self, clause: ContractClause) -> None:
        self.db.delete(clause)
        self.db.commit()
