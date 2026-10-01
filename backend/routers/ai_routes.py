"""AI interactive chat router with file/image attachment support and persistent chat sessions per account."""
from __future__ import annotations

import base64
import tempfile
from pathlib import Path
from typing import Annotated, Any
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..ai_engine import ai_chat_response
from ..auth import _decode_access_token, get_current_user, oauth2_scheme
from ..database import get_db
from ..models import AiChatSession, User
from ..services.contract_service import extract_text_from_file
from ..services.subscription_service import check_ai_rate_limit, get_user_subscription_info

router = APIRouter(prefix="/api/ai", tags=["ai"])

MAX_CHAT_ATTACHMENT_BYTES = 10 * 1024 * 1024
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_DOC_EXTENSIONS = {".pdf", ".docx", ".txt"}


class ChatMessage(BaseModel):
    role: str = "user"
    content: str


class ChatRequest(BaseModel):
    message: str | None = Field(default=None, max_length=5000)
    question: str | None = Field(default=None, max_length=5000)
    contract_context: str | None = None
    stage: str | None = None
    history: list[ChatMessage] | None = None
    session_id: UUID | None = None
    attachment_name: str | None = None
    attachment_text: str | None = None
    image_base64: str | None = None
    image_mime_type: str | None = None


class ChatResponse(BaseModel):
    reply: str
    answer: str | None = None
    citations: list[str] = Field(default_factory=list)
    citation: str | None = None
    negotiation_script: str | None = None
    source: str = "ai-engine"
    model: str | None = None
    session_id: UUID | None = None


def _get_optional_user(token: str | None, db: Session) -> User | None:
    if not token:
        return None
    payload = _decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        return None
    try:
        user = db.get(User, UUID(str(user_id)))
        return user if user and user.is_active else None
    except Exception:
        return None


@router.post("/chat-upload", response_model=dict)
async def upload_chat_attachment(
    file: Annotated[UploadFile, File(...)],
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Parse an uploaded file or image from the AI chat input (+) button (Medium & Pro tiers only)."""
    user = _get_optional_user(token, db)
    if not user:
        raise HTTPException(
            status_code=403,
            detail="Vui lòng đăng nhập tài khoản gói Medium hoặc Pro để đính kèm tệp/hình ảnh trong Trợ lý AI.",
        )
    sub_info = get_user_subscription_info(db, user)
    if not sub_info["can_attach_chat_files"]:
        raise HTTPException(
            status_code=403,
            detail="Tính năng đính kèm tệp/hình ảnh (+) trong Trợ lý AI yêu cầu gói Medium hoặc Pro. Vui lòng nâng cấp tại /upgrade.",
        )

    filename = Path(file.filename or "attachment").name[:255]
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_IMAGE_EXTENSIONS and ext not in ALLOWED_DOC_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Chỉ hỗ trợ tệp hợp đồng (.pdf, .docx, .txt) hoặc hình ảnh (.jpg, .png, .webp)",
        )

    raw_bytes = await file.read(MAX_CHAT_ATTACHMENT_BYTES + 1)
    if len(raw_bytes) > MAX_CHAT_ATTACHMENT_BYTES:
        raise HTTPException(status_code=413, detail="Tệp đính kèm vượt quá giới hạn 10 MB")
    if len(raw_bytes) == 0:
        raise HTTPException(status_code=400, detail="Tệp đính kèm rỗng")

    if ext in ALLOWED_IMAGE_EXTENSIONS:
        mime_map = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
        }
        mime_type = mime_map.get(ext, "image/jpeg")
        b64_str = base64.b64encode(raw_bytes).decode("ascii")
        return {
            "filename": filename,
            "file_type": "image",
            "mime_type": mime_type,
            "file_size_bytes": len(raw_bytes),
            "image_base64": b64_str,
            "extracted_text": None,
        }

    # Document (.pdf, .docx, .txt) -> write to temp file and extract text
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(raw_bytes)
        tmp_path = Path(tmp.name)

    try:
        extracted_text = extract_text_from_file(tmp_path)
    finally:
        tmp_path.unlink(missing_ok=True)

    return {
        "filename": filename,
        "file_type": "document",
        "mime_type": file.content_type or "application/octet-stream",
        "file_size_bytes": len(raw_bytes),
        "image_base64": None,
        "extracted_text": extracted_text[:8000],
    }


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    payload: ChatRequest,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Interact with AI assistant for contract questions, file/image attachments, and save session per account."""
    user = _get_optional_user(token, db)
    if user is not None:
        sub_info = get_user_subscription_info(db, user)
        plan_tier = sub_info["plan_tier"]
        user_key = str(user.id)
    else:
        plan_tier = "free"
        user_key = "anonymous"

    tier_cfg = check_ai_rate_limit(user_key, plan_tier)
    max_ctx_chars = int(tier_cfg.get("ai_context_chars", 2500))

    user_query = (payload.message or payload.question or "").strip()
    if not user_query:
        user_query = "Xin chào, hãy giải thích các bẫy điều khoản trong hợp đồng."

    history_dicts = None
    if payload.history:
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in payload.history]

    trimmed_ctx = payload.contract_context[:max_ctx_chars] if payload.contract_context else None
    trimmed_attach_text = payload.attachment_text[:max_ctx_chars] if payload.attachment_text else None
    allowed_image_b64 = payload.image_base64 if tier_cfg.get("can_attach_chat_files") else None

    ai_res = ai_chat_response(
        message=user_query,
        contract_context=trimmed_ctx,
        stage=payload.stage,
        history=history_dicts,
        image_base64=allowed_image_b64,
        image_mime_type=payload.image_mime_type,
        attachment_filename=payload.attachment_name,
        attachment_text=trimmed_attach_text,
    )

    saved_session_id: UUID | None = payload.session_id

    if user is not None:
        try:
            session_obj = None
            if payload.session_id:
                session_obj = db.scalars(
                    select(AiChatSession).where(
                        AiChatSession.id == payload.session_id,
                        AiChatSession.user_id == user.id,
                    )
                ).first()

            user_entry: dict[str, Any] = {
                "role": "user",
                "content": user_query,
                "attachment_name": payload.attachment_name,
                "has_image": bool(payload.image_base64),
            }
            ai_entry: dict[str, Any] = {
                "role": "assistant",
                "content": ai_res.get("reply", ""),
                "citations": ai_res.get("citations", []),
                "negotiation_script": ai_res.get("negotiation_script"),
            }

            if session_obj is None:
                title_seed = payload.attachment_name or user_query
                session_obj = AiChatSession(
                    id=uuid4(),
                    user_id=user.id,
                    session_title=title_seed[:80],
                    messages=[user_entry, ai_entry],
                )
                db.add(session_obj)
            else:
                existing_msgs = list(session_obj.messages or [])
                existing_msgs.extend([user_entry, ai_entry])
                session_obj.messages = existing_msgs

            db.commit()
            db.refresh(session_obj)
            saved_session_id = session_obj.id
        except Exception as exc:
            print(f"[AI Chat] Failed to persist chat session: {exc}")

    reply_text = ai_res.get("reply", "")
    citations_list = ai_res.get("citations", [])
    first_citation = citations_list[0] if citations_list else None

    ai_res["answer"] = reply_text
    ai_res["citation"] = first_citation
    ai_res["session_id"] = saved_session_id
    return ai_res


@router.get("/sessions", response_model=list[dict])
def list_chat_sessions(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """List saved AI chat sessions for the current authenticated user."""
    sessions = list(
        db.scalars(
            select(AiChatSession)
            .where(AiChatSession.user_id == current.id)
            .order_by(AiChatSession.updated_at.desc())
            .limit(30)
        ).all()
    )
    return [
        {
            "id": str(s.id),
            "session_title": s.session_title,
            "message_count": len(s.messages or []),
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None,
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}", response_model=dict)
def get_chat_session(
    session_id: UUID,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Get a specific AI chat session's messages."""
    s = db.scalars(
        select(AiChatSession).where(
            AiChatSession.id == session_id,
            AiChatSession.user_id == current.id,
        )
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return {
        "id": str(s.id),
        "session_title": s.session_title,
        "messages": s.messages or [],
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None,
    }


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(
    session_id: UUID,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a saved AI chat session."""
    s = db.scalars(
        select(AiChatSession).where(
            AiChatSession.id == session_id,
            AiChatSession.user_id == current.id,
        )
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Chat session not found")
    db.delete(s)
    db.commit()
