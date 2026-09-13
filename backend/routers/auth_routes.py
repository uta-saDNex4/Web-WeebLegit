"""Authentication and user management endpoints with strict input validation."""
from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import check_admin_role, create_access_token, get_current_user, get_password_hash, verify_password
from ..database import get_db
from ..models import User
from ..schemas import TokenResponse, UserRegistration, UserResponse, UserUpdate

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/auth/register", response_model=UserResponse, status_code=201)
@router.post("/users/register", response_model=UserResponse, status_code=201)
def register(payload: UserRegistration, db: Session = Depends(get_db)):
    """Register a new user account."""
    email = str(payload.email).strip().lower()
    if not email or "@" not in email or len(email) > 320:
        raise HTTPException(400, "Invalid email address format")

    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "Email already registered")

    full_name = payload.full_name.strip() if payload.full_name else None
    user = User(
        id=uuid4(),
        email=email,
        password_hash=get_password_hash(payload.password),
        full_name=full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/login", response_model=TokenResponse)
@router.post("/users/login", response_model=TokenResponse)
async def login(request: Request, db: Session = Depends(get_db)):
    """Accept both JSON and Form login payloads with payload type safety."""
    content_type = request.headers.get("content-type", "").lower()
    email, password = "", ""

    if content_type.startswith("application/x-www-form-urlencoded") or content_type.startswith("multipart/form-data"):
        try:
            form = await request.form()
            email = str(form.get("username", form.get("email", "")))
            password = str(form.get("password", ""))
        except Exception:
            raise HTTPException(422, "Invalid form data login payload") from None
    else:
        try:
            body = await request.json()
            if not isinstance(body, dict):
                raise HTTPException(422, "JSON payload must be an object")
            email = str(body.get("email", body.get("username", "")))
            password = str(body.get("password", ""))
        except (ValueError, TypeError, AttributeError, HTTPException) as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(422, "Invalid JSON login payload") from None

    email = email.strip().lower()[:320]
    password = password[:256]

    if not email or not password:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    user = db.scalar(select(User).where(User.email == email))
    if not user or not user.is_active or not verify_password(password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    return TokenResponse(access_token=create_access_token({"sub": str(user.id)}))


@router.get("/auth/me", response_model=UserResponse)
def me(current: User = Depends(get_current_user)):
    """Get current user details."""
    return current


@router.put("/users/me", response_model=UserResponse)
@router.put("/auth/me", response_model=UserResponse)
def update_me(
    payload: UserUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user full_name or password."""
    if payload.full_name is not None:
        current.full_name = payload.full_name.strip() or None
    if payload.password is not None:
        current.password_hash = get_password_hash(payload.password)
    current.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(current)
    return current


@router.delete("/users/{user_id}", response_model=UserResponse)
def deactivate_user(
    user_id: UUID,
    current: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
):
    """Deactivate a user account (Admin only)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = False
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user
