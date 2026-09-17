"""AI Chat endpoint — answer legal questions about student contracts."""
from __future__ import annotations

import json
import os
import urllib.request
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/ai", tags=["ai"])

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    citation: str | None = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_FALLBACK_QA: list[dict[str, str | None]] = [
    {
        "keywords": r"^(chào|xin chào|hello|hi|hey|alo|ê|halo)\b|\b(chào bạn|chào ad|chào bot|xin chào bot|chào ai)\b",
        "answer": (
            "Xin chào bạn! Tôi là trợ lý AI của WeebLegit, đồng hành hỗ trợ bạn kiểm tra hợp đồng sinh viên "
            "(thuê trọ, thực tập, làm thêm, CTV, vay tiêu dùng) và giải thích các quyền lợi pháp lý. "
            "Bạn đang băn khoăn về điều khoản nào hoặc cần tôi kiểm tra hợp đồng nào không?"
        ),
        "citation": None,
    },
    {
        "keywords": r"bạn là ai|bạn có thể làm gì|hướng dẫn|chức năng|giới thiệu|ai là bạn",
        "answer": (
            "Tôi là trợ lý AI của WeebLegit. Tôi có thể hỗ trợ bạn: "
            "(1) Giải thích các điều khoản hợp đồng bằng ngôn ngữ dễ hiểu, "
            "(2) Nhận diện các bẫy điều khoản phổ biến (mất cọc, thử việc không lương, giữ CCCD), "
            "(3) Đối chiếu với Bộ luật Dân sự 2015, Bộ luật Lao động 2019 và các văn bản luật hiện hành. "
            "Bạn có thể dán nội dung điều khoản vào đây hoặc dùng tính năng 'Kiểm tra hợp đồng' phía trên nhé!"
        ),
        "citation": None,
    },
    {
        "keywords": "cọc|tiền cọc|đặt cọc|hoàn cọc",
        "answer": (
            "Tiền đặt cọc phải được hoàn lại đầy đủ nếu bên cho thuê là người vi phạm hợp đồng. "
            "Nếu bên thuê vi phạm, chủ nhà được giữ lại cọc. "
            "Hãy lập biên bản giao nhận tiền cọc có chữ ký hai bên để có bằng chứng pháp lý."
        ),
        "citation": "Điều 328 Bộ luật Dân sự 2015",
    },
    {
        "keywords": "thử việc|lương thử việc|85%|70%",
        "answer": (
            "Theo pháp luật Việt Nam, lương trong thời gian thử việc phải đạt ít nhất 85% mức lương của công việc đó. "
            "Thời gian thử việc tối đa là 60 ngày với công việc đòi hỏi chuyên môn cao, 30 ngày với công việc bình thường. "
            "Bạn có quyền yêu cầu điều chỉnh nếu mức lương thử việc thấp hơn quy định."
        ),
        "citation": "Điều 24–26 Bộ luật Lao động 2019",
    },
    {
        "keywords": "giữ cccd|giữ cmnd|giữ căn cước|nộp giấy tờ|giữ hộ chiếu",
        "answer": (
            "Bên cho thuê hoặc tuyển dụng KHÔNG được phép giữ bản gốc CCCD, CMND, hộ chiếu hoặc bất kỳ giấy tờ tùy thân nào của bạn. "
            "Đây là hành vi vi phạm pháp luật. "
            "Nếu gặp trường hợp này, bạn có thể từ chối và báo cáo với cơ quan chức năng."
        ),
        "citation": "Điều 7 Luật Căn cước 2023",
    },
    {
        "keywords": "phạt|vi phạm|bồi thường|phạt hợp đồng",
        "answer": (
            "Mức phạt vi phạm hợp đồng phải được hai bên thỏa thuận rõ ràng và ghi trong hợp đồng. "
            "Pháp luật không quy định mức phạt tối đa cho hợp đồng dân sự, nhưng mức phạt quá cao có thể bị tòa án điều chỉnh nếu có tranh chấp. "
            "Hãy đàm phán để mức phạt hợp lý trước khi ký."
        ),
        "citation": "Điều 418 Bộ luật Dân sự 2015",
    },
    {
        "keywords": "tăng giá|tăng tiền thuê|điều chỉnh giá",
        "answer": (
            "Giá thuê chỉ được thay đổi theo đúng thỏa thuận ghi trong hợp đồng (ví dụ: điều chỉnh định kỳ theo chu kỳ nhất định). "
            "Chủ nhà không được tự ý tăng giá khi chưa hết hạn hợp đồng. "
            "Hãy yêu cầu ghi rõ chu kỳ và biên độ tăng giá trong hợp đồng."
        ),
        "citation": "Điều 482 Bộ luật Dân sự 2015",
    },
    {
        "keywords": "làm thêm|giờ làm thêm|overtime|ngoài giờ",
        "answer": (
            "Giờ làm thêm tối đa là 40 giờ/tháng và 200 giờ/năm (trường hợp đặc biệt không quá 300 giờ/năm). "
            "Lương làm thêm ngày thường ít nhất 150%, ngày nghỉ 200%, ngày lễ 300% so với lương giờ thường. "
            "Bạn có quyền từ chối làm thêm nếu vượt giới hạn pháp luật."
        ),
        "citation": "Điều 107–108 Bộ luật Lao động 2019",
    },
]


def _gemini_chat(question: str) -> dict[str, Any] | None:
    """Call Gemini API for legal Q&A."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None

    prompt = (
        "Bạn là trợ lý pháp lý WeebLegit chuyên tư vấn hợp đồng cho sinh viên Việt Nam "
        "(thuê trọ, thực tập, cộng tác viên, khóa học, vay tiêu dùng).\n"
        "Nếu người dùng chào hỏi, hãy chào lại thân thiện, tự nhiên và ngắn gọn, giới thiệu bạn có thể giúp gì về hợp đồng.\n"
        "Nếu người dùng hỏi về điều khoản hợp đồng hoặc quyền lợi, hãy trả lời ngắn gọn, thực tế và dễ hiểu bằng tiếng Việt.\n"
        "Nêu rõ điều luật tham chiếu nếu có (VD: Điều 328 Bộ luật Dân sự 2015), nếu câu hỏi thông thường/chào hỏi thì citation là null.\n\n"
        f"Câu hỏi của người dùng: {question}\n\n"
        "Trả về JSON duy nhất với 2 trường: answer (chuỗi câu trả lời) và citation (điều luật tham chiếu hoặc null)."
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.3, "maxOutputTokens": 512},
    }
    body_bytes = json.dumps(payload).encode("utf-8")

    models = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-2.5-flash"]
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        req = urllib.request.Request(
            url,
            data=body_bytes,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                result = json.loads(text)
                if "answer" in result:
                    return result
        except Exception:
            continue

    return None


def _fallback_chat(question: str) -> dict[str, str | None]:
    """Rule-based fallback using keyword matching."""
    import re
    q = question.lower()
    for item in _FALLBACK_QA:
        if re.search(item["keywords"], q):
            return {"answer": item["answer"], "citation": item["citation"]}

    return {
        "answer": (
            "Cảm ơn câu hỏi của bạn! Để đảm bảo an toàn khi ký hợp đồng, bạn lưu ý: "
            "(1) Yêu cầu làm rõ bằng văn bản mọi điều khoản chưa rõ ràng, "
            "(2) Tuyệt đối không giao bản gốc CCCD/CMND hoặc chuyển tiền cọc khi chưa có biên nhận, "
            "(3) Bạn có thể hỏi cụ thể về điều khoản bạn gặp phải (tiền cọc, thử việc, làm thêm...) hoặc dùng tính năng 'Kiểm tra hợp đồng' để tôi phân tích toàn bộ nhé!"
        ),
        "citation": "Bộ luật Dân sự 2015 & Bộ luật Lao động 2019",
    }


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(payload: ChatRequest) -> ChatResponse:
    """Answer a legal question about student contracts using Gemini AI with rule-based fallback."""
    question = payload.question.strip()
    if not question:
        raise HTTPException(400, "Câu hỏi không được để trống")
    if len(question) > 2000:
        raise HTTPException(400, "Câu hỏi quá dài (tối đa 2000 ký tự)")

    # Try Gemini first
    gemini = _gemini_chat(question)
    if gemini:
        return ChatResponse(
            answer=str(gemini.get("answer", "")),
            citation=gemini.get("citation") or None,
        )

    # Fallback to local rules
    fallback = _fallback_chat(question)
    return ChatResponse(answer=fallback["answer"], citation=fallback["citation"])
