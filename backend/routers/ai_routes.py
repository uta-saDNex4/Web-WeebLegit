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
    message: str | None = Field(default=None, max_length=5000)
    question: str | None = Field(default=None, max_length=5000)
    contract_context: str | None = None
    stage: str | None = None
    history: list[ChatMessage] | None = None


class ChatResponse(BaseModel):
    reply: str
    answer: str | None = None
    citations: list[str] = Field(default_factory=list)
    citation: str | None = None
    negotiation_script: str | None = None
    source: str = "ai-engine"
    model: str | None = None


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(payload: ChatRequest) -> dict[str, Any]:
    """Interact with real AI assistant for contract questions and negotiation scripting."""
    user_query = payload.message or payload.question or ""
    if not user_query.strip():
        user_query = "Xin chào, hãy giải thích các bẫy điều khoản trong hợp đồng."

    history_dicts = None
    if payload.history:
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in payload.history]

    res = ai_chat_response(
        message=user_query,
        contract_context=payload.contract_context,
        stage=payload.stage,
        history=history_dicts,
    )
    reply_text = res.get("reply", "")
    citations_list = res.get("citations", [])
    first_citation = citations_list[0] if citations_list else None

    return {
        **res,
        "reply": reply_text,
        "answer": reply_text,
        "citations": citations_list,
        "citation": first_citation,
    }
