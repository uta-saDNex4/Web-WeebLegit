"""SQLAlchemy connection configuration and empty schema creation."""
from __future__ import annotations

import os
from collections.abc import Generator
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from .models import Base

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = PROJECT_ROOT / ".env"

if ENV_FILE.is_file():
    with ENV_FILE.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:matkhau_xinfu@localhost:5432/contract_verifier_db",
)

# Create engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

# Create session factory
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def create_empty_database(max_retries: int = 10, delay_seconds: float = 2.0) -> None:
    """Create schema with retry mechanism. Ensures default admin account exists."""
    import time
    from sqlalchemy.exc import OperationalError

    for attempt in range(1, max_retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            for table in Base.metadata.tables.values():
                for index in table.indexes:
                    index.create(bind=engine, checkfirst=True)
            print("[Database] Schema verified and indexes ready.")
            break
        except OperationalError as e:
            if attempt < max_retries:
                print(f"[Database] Connection not ready (attempt {attempt}/{max_retries}). Retrying in {delay_seconds}s...")
                time.sleep(delay_seconds)
            else:
                print(f"[Database] Could not connect to database after {max_retries} attempts: {e}")
                raise

    # Ensure default admin account exists for admin dashboard access
    try:
        from datetime import datetime, timezone
        from uuid import uuid4
        from .models import User
        from .auth import get_password_hash

        with SessionLocal() as db:
            admin_user = db.query(User).filter(User.email == "admin@weeblegit.vn").first()
            if not admin_user:
                now = datetime.now(timezone.utc)
                admin_user = User(
                    id=uuid4(),
                    email="admin@weeblegit.vn",
                    password_hash=get_password_hash("Admin@123456"),
                    full_name="Quản trị viên Hệ thống",
                    role="admin",
                    is_active=True,
                    created_at=now,
                    updated_at=now,
                )
                db.add(admin_user)
                db.commit()
                print("[Database] Default admin account (admin@weeblegit.vn) initialized.")
    except Exception as e:
        print(f"[Database] Notice: Default admin check skipped: {e}")


def get_db() -> Generator[Session, None, None]:
    """Dependency to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
