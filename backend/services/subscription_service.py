"""Subscription tier and quota management service for Free, Medium, and Pro accounts."""
from __future__ import annotations

import time
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Contract, User, UserSubscription

TIER_CONFIG: dict[str, dict[str, Any]] = {
    "free": {
        "daily_limit": 5,
        "monthly_limit": 30,
        "max_batch_files": 1,
        "can_view_clauses": False,
        "can_compare_contracts": False,
        "can_export_pdf": False,
        "ai_rpm_limit": 3,
        "ai_context_chars": 2500,
        "can_attach_chat_files": False,
    },
    "medium": {
        "daily_limit": 25,
        "monthly_limit": 200,
        "max_batch_files": 5,
        "can_view_clauses": True,
        "can_compare_contracts": True,
        "can_export_pdf": False,
        "ai_rpm_limit": 15,
        "ai_context_chars": 6000,
        "can_attach_chat_files": True,
    },
    "pro": {
        "daily_limit": -1,
        "monthly_limit": -1,
        "max_batch_files": 20,
        "can_view_clauses": True,
        "can_compare_contracts": True,
        "can_export_pdf": True,
        "ai_rpm_limit": -1,
        "ai_context_chars": 16000,
        "can_attach_chat_files": True,
    },
}

_AI_RATE_TIMESTAMPS: dict[str, list[float]] = defaultdict(list)


def _resolve_default_tier(user: User) -> str:
    email = (user.email or "").strip().lower()
    if user.role == "admin" or email == "pro@weeblegit.vn":
        return "pro"
    if email == "medium@weeblegit.vn":
        return "medium"
    return "free"


def get_user_subscription_info(db: Session, user: User) -> dict[str, Any]:
    """Retrieve or initialize the user's subscription tier and compute live daily/monthly usage."""
    sub = db.scalars(
        select(UserSubscription).where(UserSubscription.user_id == user.id)
    ).first()

    default_tier = _resolve_default_tier(user)
    if not sub:
        sub = UserSubscription(
            id=uuid4(),
            user_id=user.id,
            plan_tier=default_tier,
            is_student_verified=(default_tier == "medium"),
        )
        try:
            db.add(sub)
            db.commit()
            db.refresh(sub)
        except Exception:
            db.rollback()
            plan_tier = default_tier
        else:
            plan_tier = sub.plan_tier
    else:
        # Ensure admin or dedicated tier accounts always match their designated tier
        if user.role == "admin" and sub.plan_tier != "pro":
            sub.plan_tier = "pro"
            db.commit()
        plan_tier = sub.plan_tier if sub.plan_tier in TIER_CONFIG else default_tier

    cfg = TIER_CONFIG.get(plan_tier, TIER_CONFIG["free"])

    now_utc = datetime.now(timezone.utc)
    start_of_day = now_utc.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_month = now_utc.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    daily_used = int(
        db.scalar(
            select(func.count())
            .select_from(Contract)
            .where(
                Contract.uploaded_by == user.id,
                Contract.created_at >= start_of_day,
            )
        )
        or 0
    )

    monthly_used = int(
        db.scalar(
            select(func.count())
            .select_from(Contract)
            .where(
                Contract.uploaded_by == user.id,
                Contract.created_at >= start_of_month,
            )
        )
        or 0
    )

    return {
        "plan_tier": plan_tier,
        "daily_used": daily_used,
        "daily_limit": cfg["daily_limit"],
        "monthly_used": monthly_used,
        "monthly_limit": cfg["monthly_limit"],
        "max_batch_files": cfg["max_batch_files"],
        "can_view_clauses": cfg["can_view_clauses"],
        "can_compare_contracts": cfg["can_compare_contracts"],
        "can_export_pdf": cfg["can_export_pdf"],
        "ai_rpm_limit": cfg["ai_rpm_limit"],
        "ai_context_chars": cfg["ai_context_chars"],
        "can_attach_chat_files": cfg["can_attach_chat_files"],
    }


def enrich_user_response(db: Session, user: User) -> dict[str, Any]:
    """Build a dictionary matching UserResponse schema with subscription & quota metadata."""
    sub_info = get_user_subscription_info(db, user)
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "plan_tier": sub_info["plan_tier"],
        "daily_used": sub_info["daily_used"],
        "daily_limit": sub_info["daily_limit"],
        "monthly_used": sub_info["monthly_used"],
        "monthly_limit": sub_info["monthly_limit"],
        "max_batch_files": sub_info["max_batch_files"],
        "can_view_clauses": sub_info["can_view_clauses"],
        "can_compare_contracts": sub_info["can_compare_contracts"],
        "can_export_pdf": sub_info["can_export_pdf"],
    }


def check_contract_quota(db: Session, user: User) -> dict[str, Any]:
    """Raise HTTP 429 if the user has reached their daily or monthly contract upload limit."""
    info = get_user_subscription_info(db, user)
    plan_tier = info["plan_tier"]
    daily_limit = info["daily_limit"]
    monthly_limit = info["monthly_limit"]

    if daily_limit != -1 and info["daily_used"] >= daily_limit:
        raise HTTPException(
            status_code=429,
            detail=(
                f"Tài khoản gói -{plan_tier}- đã đạt giới hạn {daily_limit} hợp đồng/ngày "
                f"({info['daily_used']}/{daily_limit}). Vui lòng nâng cấp gói tại trang /upgrade để tiếp tục."
            ),
        )

    if monthly_limit != -1 and info["monthly_used"] >= monthly_limit:
        raise HTTPException(
            status_code=429,
            detail=(
                f"Tài khoản gói -{plan_tier}- đã đạt giới hạn {monthly_limit} hợp đồng/tháng "
                f"({info['monthly_used']}/{monthly_limit}). Vui lòng nâng cấp gói tại trang /upgrade để tiếp tục."
            ),
        )

    return info


def check_ai_rate_limit(user_key: str, plan_tier: str) -> dict[str, Any]:
    """Enforce per-minute AI request rate limits according to the user's tier."""
    cfg = TIER_CONFIG.get(plan_tier, TIER_CONFIG["free"])
    rpm_limit = cfg["ai_rpm_limit"]
    if rpm_limit == -1:
        return cfg

    now = time.monotonic()
    window_start = now - 60.0
    timestamps = [ts for ts in _AI_RATE_TIMESTAMPS[user_key] if ts > window_start]
    if len(timestamps) >= rpm_limit:
        _AI_RATE_TIMESTAMPS[user_key] = timestamps
        raise HTTPException(
            status_code=429,
            detail=(
                f"Gói -{plan_tier}- giới hạn tốc độ xử lý AI tối đa {rpm_limit} lượt hỏi/phút. "
                "Vui lòng chờ giây lát hoặc nâng cấp lên gói Medium / Pro tại /upgrade."
            ),
        )
    timestamps.append(now)
    _AI_RATE_TIMESTAMPS[user_key] = timestamps
    return cfg
