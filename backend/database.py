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

def _resolve_database_url() -> str:
    env_url = os.getenv("DATABASE_URL", "").strip()
    if env_url:
        if env_url.startswith("postgres://"):
            env_url = env_url.replace("postgres://", "postgresql://", 1)
        return env_url

    # Check if local PostgreSQL on port 5432 is reachable
    import socket
    try:
        with socket.create_connection(("127.0.0.1", 5432), timeout=0.5):
            return "postgresql://admin:matkhau_xinfu@localhost:5432/contract_verifier_db"
    except OSError:
        sqlite_path = (PROJECT_ROOT / "contract_verifier.db").as_posix()
        return f"sqlite:///{sqlite_path}"


SQLALCHEMY_DATABASE_URL = _resolve_database_url()

# Create engine with pre-ping and recycle to handle cloud database connection drops
_connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=_connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
)

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

    # Ensure default admin account and 3 upgrade tier accounts (free, medium, pro) exist
    try:
        from datetime import datetime, timezone
        from uuid import uuid4
        from .models import User, UserSubscription
        from .auth import get_password_hash

        default_accounts = [
            ("admin@weeblegit.vn", "Admin@123456", "Quản trị viên Hệ thống", "admin", "pro", False),
            ("free@weeblegit.vn", "User@123456", "Sinh Viên (Gói Free)", "user", "free", False),
            ("medium@weeblegit.vn", "User@123456", "Sinh Viên Xác Thực (Gói Medium)", "user", "medium", True),
            ("pro@weeblegit.vn", "User@123456", "Freelancer Chuyên Nghiệp (Gói Pro)", "user", "pro", False),
        ]

        with SessionLocal() as db:
            now = datetime.now(timezone.utc)
            for email, raw_pwd, full_name, role, tier, student_verified in default_accounts:
                acct = db.query(User).filter(User.email == email).first()
                if not acct:
                    acct = User(
                        id=uuid4(),
                        email=email,
                        password_hash=get_password_hash(raw_pwd),
                        full_name=full_name,
                        role=role,
                        is_active=True,
                        created_at=now,
                        updated_at=now,
                    )
                    db.add(acct)
                    db.flush()
                    print(f"[Database] Default account ({email} | tier={tier}) initialized.")

                sub = db.query(UserSubscription).filter(UserSubscription.user_id == acct.id).first()
                if not sub:
                    sub = UserSubscription(
                        id=uuid4(),
                        user_id=acct.id,
                        plan_tier=tier,
                        is_student_verified=student_verified,
                        created_at=now,
                        updated_at=now,
                    )
                    db.add(sub)
                elif sub.plan_tier != tier:
                    sub.plan_tier = tier
                    sub.is_student_verified = student_verified
                    sub.updated_at = now
            db.commit()
    except Exception as e:
        print(f"[Database] Notice: Default accounts check skipped: {e}")


def get_db() -> Generator[Session, None, None]:
    """Dependency to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
