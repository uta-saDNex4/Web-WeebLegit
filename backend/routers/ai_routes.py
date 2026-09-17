"""AI interactive chat router for contract analysis and negotiation assistance."""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..ai_engine import ai_chat_response

router = APIRouter(prefix="/api/ai", tags=["ai"])


class ChatMessage(BaseModel):
    role: str = "user"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    contract_context: str | None = None
    stage: str | None = None
    history: list[ChatMessage] | None = None


class ChatResponse(BaseModel):
    reply: str
    citations: list[str] = Field(default_factory=list)
    negotiation_script: str | None = None
    source: str = "ai-engine"
    model: str | None = None


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(payload: ChatRequest) -> dict[str, Any]:
    """Interact with real AI assistant for contract questions and negotiation scripting."""
    history_dicts = None
    if payload.history:
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in payload.history]

    return ai_chat_response(
        message=payload.message,
        contract_context=payload.contract_context,
        stage=payload.stage,
        history=history_dicts,
    )
