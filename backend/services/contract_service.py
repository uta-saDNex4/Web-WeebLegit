"""Service layer for contract operations, security validation, and integrity checks."""
from __future__ import annotations

import hashlib
import hmac
import os
import secrets
from pathlib import Path
from time import perf_counter
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..models import Contract, ContractClause, ContractImage, User, VerificationLog
from ..repositories import ContractRepository, VerificationRepository

PROJECT_ROOT = Path(__file__).resolve().parents[2]
STORAGE_ROOT = Path(os.getenv("STORAGE_ROOT", str(PROJECT_ROOT / "storage")))
SECURE_STORAGE_ROOT = Path(os.getenv("SECURE_STORAGE_ROOT", str(PROJECT_ROOT / "secure_storage")))

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MiB
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MiB
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt", ".json"}
CHUNK_SIZE = 1024 * 1024


def validate_magic_bytes(header: bytes, ext: str) -> bool:
    """Verify standard magic numbers for supported document formats."""
    if ext == ".pdf":
        return header.startswith(b"%PDF")
    if ext == ".docx" or ext == ".doc":
        # DOCX is zip archive starting with PK\x03\x04 or legacy OLE Compound File \xd0\xcf\x11\xe0
        return header.startswith(b"PK\x03\x04") or header.startswith(b"\xd0\xcf\x11\xe0")
    if ext == ".txt" or ext == ".json":
        # ASCII / UTF-8 text file check
        try:
            header.decode("utf-8")
            return True
        except UnicodeDecodeError:
            return False
    return True


class ContractService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.contract_repo = ContractRepository(db)
        self.verification_repo = VerificationRepository(db)

    def check_ownership(self, contract: Contract, user: User) -> None:
        if contract.uploaded_by != user.id and user.role != "admin":
            raise HTTPException(403, "Not allowed to access this contract")

    async def upload_contract(
        self,
        file: UploadFile,
        user: User,
        contract_type: str | None = None,
    ) -> Contract:
        raw_name = Path(file.filename or "").name.strip()
        if not raw_name:
            raise HTTPException(400, "Filename cannot be empty")

        ext = Path(raw_name).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(415, "Unsupported contract file type")

        # Sanitize filename length for DB column VARCHAR(255)
        filename = raw_name[:255]

        # Sanitize contract_type header for DB column VARCHAR(64)
        clean_contract_type = (
            contract_type.strip().lower()[:64]
            if contract_type and contract_type.strip()
            else None
        )

        # Read first chunk to inspect header magic bytes
        header = await file.read(512)
        if not validate_magic_bytes(header, ext):
            raise HTTPException(400, "Invalid file format or corrupted magic signature")
        await file.seek(0)

        contract_id = uuid4()
        key = STORAGE_ROOT / "contracts" / str(uuid4()) / (secrets.token_hex(16) + ext)
        key.parent.mkdir(parents=True, exist_ok=True)

        digest = hashlib.sha256()
        size = 0

        try:
            with key.open("wb") as output:
                while chunk := await file.read(CHUNK_SIZE):
                    size += len(chunk)
                    if size > MAX_FILE_SIZE:
                        raise HTTPException(413, "File exceeds the 20 MiB limit")
                    digest.update(chunk)
                    output.write(chunk)
        except Exception:
            key.unlink(missing_ok=True)
            raise

        if size == 0:
            key.unlink(missing_ok=True)
            raise HTTPException(400, "File must not be empty")

        contract = Contract(
            id=contract_id,
            uploaded_by=user.id,
            original_filename=filename,
            storage_key=str(key),
            mime_type=file.content_type or "application/octet-stream",
            file_size_bytes=size,
            sha256_hash=digest.hexdigest(),
            contract_type=clean_contract_type,
            status="uploaded",
        )

        try:
            return self.contract_repo.save_contract(contract)
        except Exception:
            key.unlink(missing_ok=True)
            raise HTTPException(500, "Unable to persist contract metadata") from None

    def verify_contract(self, contract_id: UUID, user: User) -> tuple[Contract, VerificationLog, str]:
        """Re-read stored binary from server storage key and compute SHA-256 (AGENTS.md rule compliant)."""
        contract = self.contract_repo.get_by_id_for_update(contract_id)
        if not contract:
            raise HTTPException(404, "Contract not found")

        self.check_ownership(contract, user)

        started = perf_counter()
        contract.status = "verifying"

        storage_path = Path(contract.storage_key)
        actual_hash = ""
        result = "failed"
        error_code = None
        analysis_text = ""

        try:
            if not storage_path.is_file():
                raise FileNotFoundError(contract.storage_key)

            digest = hashlib.sha256()
            captured = bytearray()

            with storage_path.open("rb") as stored_file:
                while chunk := stored_file.read(CHUNK_SIZE):
                    digest.update(chunk)
                    if len(captured) < 512 * 1024:
                        captured.extend(chunk[: 512 * 1024 - len(captured)])

            analysis_text = bytes(captured).decode("utf-8", errors="ignore")
            actual_hash = digest.hexdigest()

            if hmac.compare_digest(actual_hash, contract.sha256_hash.strip()):
                result = "matched"
                contract.status = "verified"
            else:
                result = "mismatched"
                contract.status = "mismatch"

        except OSError:
            actual_hash = "0" * 64
            result = "failed"
            error_code = "FILE_NOT_FOUND"
            contract.status = "failed"

        duration = int((perf_counter() - started) * 1000)

        log = VerificationLog(
            id=uuid4(),
            contract_id=contract.id,
            requested_by=user.id,
            expected_sha256=contract.sha256_hash.strip(),
            actual_sha256=actual_hash,
            result=result,
            error_code=error_code,
            duration_ms=duration,
        )

        self.verification_repo.save_log(log)
        self.contract_repo.save_contract(contract)

        return contract, log, analysis_text
