"""AI Engine supporting DeepSeek LLM analysis with fallback to local rule-based scanner."""
from __future__ import annotations

import base64
import json
import os
import re
import urllib.request
from typing import Any

# Default risk patterns and legal references
DEFAULT_RISK_PATTERNS = {
    "critical": {
        "chuyển tiền trước": ("Không nên chuyển tiền cọc trước khi xem phòng trực tiếp và ký hợp đồng.", "Điều 328 Bộ luật Dân sự 2015"),
        "không hoàn cọc": ("Điều khoản tịch thu cọc cần rà soát quy định bồi thường.", "Điều 328 Bộ luật Dân sự 2015"),
        "phạt tiền": ("Mức phạt hợp đồng phải thỏa thuận hợp pháp và không vượt quá giới hạn luật định.", "Điều 418 Bộ luật Dân sự 2015"),
        "giữ căn cước": ("Bên cho thuê/tuyển dụng không được phép giữ bản gốc giấy tờ tùy thân của cá nhân.", "Điều 7 Luật Căn cước 2023"),
        "nộp cccd": ("Tuyệt đối không để phía đối tác giữ bản gốc CCCD/CMND.", "Điều 7 Luật Căn cước 2023"),
        "thu hồi nợ": ("Cần rà soát phương thức đôn đốc nợ có đúng quy định pháp luật.", "Thông tư 18/2019/TT-NHNN"),
        "tùy ý chấm dứt": ("Cần quy định thời hạn báo trước tối thiểu (thường 30 ngày) khi đơn phương chấm dứt.", "Điều 428 Bộ luật Dân sự 2015"),
    },
    "high": {
        "tăng giá tùy ý": ("Giá thuê/dịch vụ chỉ được thay đổi theo thỏa thuận và chu kỳ ghi trong hợp đồng.", "Điều 482 Bộ luật Dân sự 2015"),
        "tự ý tăng giá": ("Chủ nhà/đối tác không được tự ý tăng giá khi chưa hết thời hạn thỏa thuận.", "Điều 482 Bộ luật Dân sự 2015"),
        "lãi suất điều chỉnh": ("Kiểm tra kỹ biên độ và công thức điều chỉnh lãi suất định kỳ.", "Điều 468 Bộ luật Dân sự 2015"),
        "phí ẩn": ("Yêu cầu minh bạch toàn bộ danh mục phí dịch vụ trước khi ký.", "Luật Bảo vệ quyền lợi người tiêu dùng 2023"),
        "tịch thu": ("Việc xử lý tài sản cọc phải tuân thủ quy trình thỏa thuận ban đầu.", "Điều 328 Bộ luật Dân sự 2015"),
        "thử việc không lương": ("Người lao động/thực tập sinh trong thời gian thử việc phải nhận ít nhất 85% mức lương.", "Điều 26 Bộ luật Lao động 2019"),
    },
    "medium": {
        "đặt cọc": ("Nên lập biên bản giao nhận tiền cọc có chữ ký hai bên.", "Điều 328 Bộ luật Dân sự 2015"),
        "phí môi giới": ("Xác định rõ ai là bên có nghĩa vụ chi trả phí môi giới.", "Luật Kinh doanh bất động sản 2023"),
        "phạt trả trước": ("Kiểm tra mức phí phạt khi thanh toán trước hạn hợp đồng.", "Điều 468 Bộ luật Dân sự 2015"),
        "bảo hiểm": ("Lưu ý các khoản phí bảo hiểm tự nguyện không bắt buộc.", "Luật Kinh doanh bảo hiểm 2022"),
        "làm thêm": ("Quy định giờ làm thêm phải đúng giới hạn pháp luật quy định.", "Điều 107 Bộ luật Lao động 2019"),
        "phần trăm doanh thu": ("Kiểm tra công thức tính và thời điểm đối soát doanh thu.", "Bộ luật Dân sự 2015"),
    },
}


def _extract_clause_snippet(contract_text: str, term: str, window: int = 90) -> str:
    """Extract a readable snippet from contract_text around the matched term."""
    if not contract_text or not term:
        return term
    idx = contract_text.lower().find(term.lower())
    if idx == -1:
        return term
    start = max(0, idx - 30)
    end = min(len(contract_text), idx + len(term) + window)
    snippet = " ".join(contract_text[start:end].split())
    if start > 0:
        snippet = "..." + snippet
    if end < len(contract_text):
        snippet = snippet + "..."
    return snippet


def _default_negotiation_script(matched_term: str, warning: str, reference: str) -> str:
    """Generate a polite, practical negotiation script for a risky clause."""
    return (
        f"Dạ anh/chị ơi, về điều khoản liên quan đến \"{matched_term}\", em tìm hiểu theo {reference} "
        f"thì có lưu ý: {warning} Nhờ bên mình xem xét điều chỉnh rõ ràng hơn trong hợp đồng để hai bên cùng yên tâm hợp tác ạ!"
    )


def normalize_finding(item: dict[str, Any], contract_text: str = "") -> dict[str, Any]:
    """Ensure every finding has both backend and frontend keys and a numeric clause_risk_score."""
    _default_clause_scores = {"critical": 90.0, "high": 70.0, "medium": 45.0, "low": 20.0}
    risk_level = str(item.get("risk_level") or item.get("severity") or "medium").lower()
    if risk_level not in _default_clause_scores:
        risk_level = "medium"

    raw_score = item.get("clause_risk_score")
    try:
        clause_score = float(raw_score) if raw_score is not None else _default_clause_scores[risk_level]
    except (ValueError, TypeError):
        clause_score = _default_clause_scores[risk_level]
    clause_score = round(max(0.0, min(100.0, clause_score)), 1)

    matched_term = str(item.get("matched_term") or item.get("clause_text") or "Nội dung cần lưu ý")
    target_section = str(item.get("target_section") or item.get("title") or f"Điều khoản: {matched_term[:45]}")
    warning = str(item.get("warning") or item.get("analysis") or "Khuyên bạn rà soát lại điều khoản này trước khi ký.")
    reference = str(item.get("reference") or item.get("law_reference") or "Tham chiếu Bộ luật Dân sự 2015 & quy định hiện hành")
    clause_text = str(item.get("clause_text") or _extract_clause_snippet(contract_text, matched_term))
    negotiation_script = str(
        item.get("negotiation_script")
        or _default_negotiation_script(matched_term, warning, reference)
    )
    severity = "high" if risk_level in ("critical", "high") else ("medium" if risk_level == "medium" else "low")

    return {
        "risk_level": risk_level,
        "severity": severity,
        "clause_risk_score": clause_score,
        "target_section": target_section,
        "title": target_section if target_section != "Điều khoản rủi ro" else f"Phát hiện rủi ro: {matched_term}",
        "matched_term": matched_term,
        "clause_text": clause_text,
        "warning": warning,
        "analysis": warning,
        "reference": reference,
        "law_reference": reference,
        "negotiation_script": negotiation_script,
    }


def _call_deepseek_api(contract_text: str, metadata: dict[str, Any] | None = None) -> dict[str, Any] | None:
    """Call DeepSeek API (OpenAI-compatible) for deep legal risk analysis of student contracts."""
    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    if not api_key:
        return None

    prompt = (
        f"Bạn là chuyên gia pháp lý tư vấn hợp đồng cho sinh viên (thuê trọ, thực tập, CTV, khóa học, vay tiêu dùng).\n"
        f"Hãy rà soát văn bản hợp đồng sau và phát hiện các bẫy điều khoản, chi phí bất hợp lý, hoặc rủi ro pháp lý.\n\n"
        f"Nội dung hợp đồng:\n{contract_text[:4000]}\n"
        f"Metadata: {metadata or {}}\n\n"
        f"Trả về kết quả chuẩn JSON duy nhất với các trường:\n"
        f"- risk_score (float 0-100, tổng điểm rủi ro toàn hợp đồng)\n"
        f"- risk_label ('Chưa phát hiện dấu hiệu nổi bật' | 'Cần rà soát thêm' | 'Rủi ro trung bình-cao' | 'Rủi ro cao')\n"
        f"- ai_overview (chuỗi tóm tắt đánh giá ngắn 2-3 câu)\n"
        f"- ai_findings (danh sách object {{'risk_level': 'critical'|'high'|'medium'|'low', 'clause_risk_score': float 0-100 cho điều khoản này, 'title': 'tên điều khoản rủi ro', 'matched_term': 'trích dẫn câu chữ rủi ro', 'warning': 'phân tích và lời khuyên cho sinh viên', 'reference': 'Điều luật tham chiếu (VD: Điều 62 Bộ luật Lao động 2019)', 'negotiation_script': 'câu gợi ý đàm phán lịch sự'}})\n"
        f"\nLƯU Ý: Mỗi finding PHẢI có trường clause_risk_score là số float từ 0 đến 100 thể hiện mức độ rủi ro riêng của điều khoản đó.\n"
        f"CHỈ trả về JSON thuần túy, KHÔNG bọc trong markdown code block.\n"
    )

    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://vibi.top/v1").rstrip("/")
    model_name = os.getenv("DEEPSEEK_MODEL", "deepseek-v4.1-flash")
    url = base_url if base_url.endswith("/chat/completions") else f"{base_url}/chat/completions"

    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "system",
                "content": "Bạn là AI phân tích pháp lý chuyên sâu. Luôn trả về JSON thuần túy không bọc markdown.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.0,
        "max_tokens": 4096,
        "thinking": {"type": "disabled"},
        "response_format": {"type": "json_object"},
    }
    body_bytes = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=body_bytes,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WeebLegit-AI/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=35) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            raw_text = (data["choices"][0]["message"].get("content") or "").strip()
            # Strip markdown code fences if present
            if raw_text.startswith("```"):
                lines = raw_text.split("\n")
                lines = [l for l in lines if not l.strip().startswith("```")]
                raw_text = "\n".join(lines).strip()
            result = json.loads(raw_text)
            if "risk_score" in result and "ai_findings" in result:
                findings = [
                    normalize_finding(item, contract_text)
                    for item in result.get("ai_findings", [])
                ]
                overview_str = f"[DeepSeek AI]: {result.get('ai_overview', '')}"
                result["ai_findings"] = findings
                result["findings"] = findings
                result["ai_overview"] = overview_str
                result["overview"] = overview_str
                result["model_version"] = model_name
                return result
    except Exception as exc:
        print(f"[AI] DeepSeek API failed: {exc}")

    return None


def ocr_image_with_vision(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Extract full Vietnamese text from an image or scanned document using Multimodal Vision."""
    if not image_bytes:
        return ""

    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    if not api_key:
        return ""

    b64 = base64.b64encode(image_bytes).decode("ascii")
    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://vibi.top/v1").rstrip("/")
    url = f"{base_url}/chat/completions"

    # Multimodal vision models on vibi.top: gemini-3.7-flash, gemini-3.6-flash, qwen3.8-flash
    vision_models = ["gemini-3.7-flash", "gemini-3.6-flash", "qwen3.8-flash"]

    prompt = (
        "Bạn là chuyên gia OCR văn bản pháp lý tiếng Việt và hợp đồng.\n"
        "Nhiệm vụ: Hãy đọc và trích xuất TOÀN BỘ nội dung chữ trong hình ảnh này một cách chính xác tuyệt đối từng từ ngữ, số tiền, ngày tháng, tên các bên và các điều khoản.\n"
        "Giữ nguyên cấu trúc phân đoạn, tiêu đề (Điều 1, Điều 2...), danh sách liệt kê.\n"
        "Chỉ trả về nội dung văn bản thuần túy trích xuất được từ ảnh, KHÔNG thêm lời chào, không giải thích hay nhận xét nào khác."
    )

    for model in vision_models:
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{b64}"},
                        },
                    ],
                }
            ],
            "temperature": 0.0,
            "max_tokens": 4096,
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WeebLegit-OCR/1.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=35) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = (data["choices"][0]["message"].get("content") or "").strip()
                if text:
                    return text
        except Exception as exc:
            print(f"[OCR] Vision model {model} failed: {exc}")
            continue

    return ""


def local_rule_analysis(contract_text: str, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    """Deterministic local rule engine fallback."""
    context = f"{contract_text or ''} {metadata or {}}".lower()
    findings: list[dict[str, Any]] = []
    weights = {"critical": 35, "high": 20, "medium": 8, "low": 3}
    clause_scores = {"critical": 90.0, "high": 70.0, "medium": 45.0, "low": 20.0}

    for level, patterns in DEFAULT_RISK_PATTERNS.items():
        for pattern, (warning_msg, ref_law) in patterns.items():
            if re.search(re.escape(pattern), context):
                findings.append(
                    normalize_finding(
                        {
                            "risk_level": level,
                            "clause_risk_score": clause_scores.get(level, 45.0),
                            "matched_term": pattern,
                            "warning": warning_msg,
                            "reference": ref_law,
                            "target_section": f"Điều khoản: {pattern}",
                        },
                        contract_text,
                    )
                )

    score = min(100.0, round(sum(weights.get(item["risk_level"], 10) for item in findings), 2))
    if score >= 70:
        label = "Rủi ro cao"
    elif score >= 35:
        label = "Rủi ro trung bình-cao"
    elif score > 0:
        label = "Cần rà soát thêm"
    else:
        label = "Chưa phát hiện dấu hiệu rủi ro nổi bật"

    overview_str = f"Hệ thống tự động: {label}. Báo cáo rà soát dựa trên danh mục các điều khoản bất lợi phổ biến với sinh viên."
    return {
        "risk_score": score,
        "risk_label": label,
        "ai_overview": overview_str,
        "overview": overview_str,
        "ai_findings": findings,
        "findings": findings,
    }


def ai_analyze_contract_context(contract_text: str, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    """Analyze contract text using hybrid Rule + DeepSeek AI scoring for deterministic consistency."""
    rule_report = local_rule_analysis(contract_text, metadata)
    deepseek_report = _call_deepseek_api(contract_text, metadata)

    if deepseek_report is None:
        return rule_report

    # Merge findings from deterministic rules and DeepSeek without duplicating matched terms
    merged_findings = list(rule_report.get("ai_findings", []))
    seen_terms = {f.get("matched_term", "").lower().strip() for f in merged_findings}
    for gf in deepseek_report.get("ai_findings", []):
        term_key = gf.get("matched_term", "").lower().strip()
        if term_key and term_key not in seen_terms:
            merged_findings.append(gf)
            seen_terms.add(term_key)

    rule_score = float(rule_report.get("risk_score", 0.0))
    ai_score = float(deepseek_report.get("risk_score", 0.0))

    if rule_score > 0 and ai_score > 0:
        hybrid_score = round(min(100.0, 0.6 * rule_score + 0.4 * ai_score), 1)
    elif rule_score > 0:
        hybrid_score = rule_score
    else:
        hybrid_score = ai_score

    if hybrid_score >= 70:
        label = "Rủi ro cao"
    elif hybrid_score >= 35:
        label = "Rủi ro trung bình-cao"
    elif hybrid_score > 0:
        label = "Cần rà soát thêm"
    else:
        label = "Chưa phát hiện dấu hiệu rủi ro nổi bật"

    overview_str = deepseek_report.get("ai_overview") or rule_report.get("ai_overview", "")
    return {
        "risk_score": hybrid_score,
        "risk_label": label,
        "ai_overview": overview_str,
        "overview": overview_str,
        "ai_findings": merged_findings,
        "findings": merged_findings,
        "model_version": deepseek_report.get("model_version"),
        "analysis_source": "hybrid",
    }


def _call_deepseek_quick_check(contract_text: str, metadata: dict[str, Any] | None = None) -> dict[str, Any] | None:
    """Call DeepSeek API for low-token, highly consistent Quick Check contract assessment."""
    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    if not api_key:
        return None

    prompt = (
        f"Bạn là AI chuyên gia pháp lý thẩm định nhanh rủi ro hợp đồng (WeebLegit Quick Check).\n"
        f"Nhiệm vụ: Đánh giá độ rủi ro tổng quát và liệt kê tối đa 3-5 bẫy pháp lý hoặc điều khoản bất lợi nghiêm trọng nhất.\n"
        f"Nội dung hợp đồng:\n{contract_text[:3500]}\n"
        f"Metadata: {metadata or {}}\n\n"
        f"Định dạng trả về DUY NHẤT một JSON object không markdown:\n"
        f"{{\n"
        f'  "risk_score": <float 0-100>,\n'
        f'  "risk_label": "Chưa phát hiện rủi ro nổi bật" | "Cần rà soát thêm" | "Rủi ro trung bình-cao" | "Rủi ro cao",\n'
        f'  "ai_overview": "<tóm tắt 2-3 câu đánh giá rủi ro pháp lý>",\n'
        f'  "key_risks": ["<bẫy rủi ro 1 kèm căn cứ luật ngắn gọn>", "<bẫy rủi ro 2>", ...],\n'
        f'  "high_risk_count": <số lượng điều khoản rủi ro cao>\n'
        f"}}"
    )

    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://vibi.top/v1").rstrip("/")
    model_name = os.getenv("DEEPSEEK_MODEL", "deepseek-v4.1-flash")
    url = base_url if base_url.endswith("/chat/completions") else f"{base_url}/chat/completions"

    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "system",
                "content": "Bạn là AI thẩm định hợp đồng chính xác cao, nhiệt độ 0.0, luôn trả JSON thuần túy.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.0,
        "max_tokens": 450,
        "thinking": {"type": "disabled"},
        "response_format": {"type": "json_object"},
    }
    body_bytes = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=body_bytes,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WeebLegit-AI/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            raw_text = (data["choices"][0]["message"].get("content") or "").strip()
            if raw_text.startswith("```"):
                lines = raw_text.split("\n")
                lines = [l for l in lines if not l.strip().startswith("```")]
                raw_text = "\n".join(lines).strip()
            result = json.loads(raw_text)
            if "risk_score" in result:
                result["risk_score"] = round(float(result.get("risk_score", 0.0)), 1)
                result["model_version"] = model_name
                return result
    except Exception as exc:
        print(f"[QuickCheck AI] DeepSeek quick check failed: {exc}")

    return None


def local_quick_check(contract_text: str, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    """Deterministic, zero-cost legal rule scanner for Quick Check with minimal score variance."""
    rule_res = local_rule_analysis(contract_text, metadata)
    findings = rule_res.get("findings", [])
    high_findings = [f for f in findings if f.get("severity") == "high"]
    
    key_risks: list[str] = []
    for f in (high_findings if high_findings else findings)[:4]:
        term = f.get("matched_term", "")
        warn = f.get("warning", "")
        ref = f.get("reference", "")
        key_risks.append(f"{term.capitalize()}: {warn} ({ref})")

    if not key_risks:
        key_risks = ["Chưa phát hiện bẫy điều khoản nguy hiểm điển hình trong danh mục quy tắc."]

    return {
        "risk_score": rule_res.get("risk_score", 0.0),
        "risk_label": rule_res.get("risk_label", "Chưa phát hiện dấu hiệu rủi ro nổi bật"),
        "ai_overview": rule_res.get("ai_overview", ""),
        "key_risks": key_risks,
        "high_risk_count": len(high_findings),
        "analysis_source": "rule-based",
    }


def quick_check_contract_skill(contract_text: str, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    """Specialized AI Quick Check Skill ensuring low token usage and minimal variance between runs."""
    local_res = local_quick_check(contract_text, metadata)
    ai_res = _call_deepseek_quick_check(contract_text, metadata)

    if not ai_res:
        return {
            **local_res,
            "analysis_source": "rule-based",
        }

    rule_score = float(local_res.get("risk_score", 0.0))
    ai_score = float(ai_res.get("risk_score", 0.0))

    if rule_score > 0 and ai_score > 0:
        hybrid_score = round(min(100.0, 0.6 * rule_score + 0.4 * ai_score), 1)
    elif rule_score > 0:
        hybrid_score = rule_score
    else:
        hybrid_score = ai_score

    if hybrid_score >= 70:
        label = "Rủi ro cao"
    elif hybrid_score >= 35:
        label = "Rủi ro trung bình-cao"
    elif hybrid_score > 0:
        label = "Cần rà soát thêm"
    else:
        label = "Chưa phát hiện dấu hiệu rủi ro nổi bật"

    overview = ai_res.get("ai_overview") or local_res.get("ai_overview", "")
    key_risks = ai_res.get("key_risks") or local_res.get("key_risks", [])

    return {
        "risk_score": hybrid_score,
        "risk_label": label,
        "ai_overview": overview,
        "overview": overview,
        "key_risks": key_risks,
        "high_risk_count": ai_res.get("high_risk_count", local_res.get("high_risk_count", 0)),
        "analysis_source": "quick-check",
        "model_version": ai_res.get("model_version"),
    }



def ai_chat_response(
    message: str,
    contract_context: str | None = None,
    stage: str | None = None,
    history: list[dict[str, str]] | None = None,
    image_base64: str | None = None,
    image_mime_type: str | None = None,
    attachment_filename: str | None = None,
    attachment_text: str | None = None,
) -> dict[str, Any]:
    """Interactive multi-turn chat response using DeepSeek LLM (with File context) and intelligent legal fallback."""
    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()

    combined_context = contract_context or ""
    if attachment_text:
        combined_context = (
            f"{combined_context}\n\n[Nội dung file đính kèm '{attachment_filename or 'tài liệu'}']:\n{attachment_text}"
        ).strip()

    system_prompt = (
        "Bạn là Trợ lý Pháp lý Thông minh của WeebLegit – chuyên gia tư vấn bảo vệ học sinh, sinh viên và người đi thuê/đi làm trẻ tuổi "
        "khi ký kết các loại hợp đồng (thuê phòng trọ, căn hộ, thực tập, làm thêm, CTV, khóa học, vay tiêu dùng, trả góp).\n\n"
        "QUY TẮC PHÂN TÍCH & TRẢ LỜI:\n"
        "1. NHẬN DIỆN VÀ SUY LUẬN NGỮ CẢNH (RẤT QUỌNG TRỌNG):\n"
        "   - Khi người dùng hỏi ngắn gọn hoặc gửi kèm hình ảnh/tệp hợp đồng:\n"
        "     BẠN PHẢI ĐỌC KỸ HÌNH ẢNH HOẶC VĂN BẢN ĐÍNH KÈM, chỉ ra cụ thể các điều khoản rủi ro, mức phí bất hợp lý, bẫy tiền cọc, phạt vi phạm và giải thích rõ cho sinh viên.\n"
        "   - Cụ thể về TIỀN ĐIỆN, NƯỚC: Mặc định hiểu là chi phí thuê nhà trọ/phòng trọ của người thuê tại Việt Nam.\n"
        "2. ĐỘ SÂU & TÍNH CHÍNH XÁC PHÁP LÝ:\n"
        "   - Đánh giá trực diện: Vấn đề đó là HỢP LÝ hay BẤT THƯỜNG / TRÁI QUY ĐỊNH.\n"
        "   - Trích dẫn chính xác Điều, Khoản và Văn bản pháp luật hiện hành của Việt Nam (VD: Thông tư 25/2018/TT-BCT & Thông tư 09/2023/TT-BCT, Nghị định 17/2022/NĐ-CP; Điều 7 Luật Căn cước 2023; Điều 26 và Điều 62 Bộ luật Lao động 2019; Điều 328 và Điều 468 Bộ luật Dân sự 2015).\n"
        "3. ĐÀM PHÁN:\n"
        "   - Cung cấp kịch bản tin nhắn/trao đổi khéo léo, lịch sự để gửi cho chủ trọ hoặc nhà tuyển dụng.\n"
        "4. ĐỊNH DẠNG ĐẦU RA:\n"
        "Trả về DUY NHẤT một JSON object chuẩn với các trường:\n"
        "{\n"
        '  "reply": "Nội dung phân tích chi tiết, dễ hiểu bằng tiếng Việt",\n'
        '  "citations": ["Tên văn bản pháp luật 1", "Tên văn bản 2"],\n'
        '  "negotiation_script": "Đoạn tin nhắn mẫu để trao đổi lịch sự (nếu có, ngược lại để null)"\n'
        "}"
    )

    if stage:
        system_prompt += f"\nNgữ cảnh công đoạn xử lý hiện tại: '{stage}'."
    if combined_context:
        system_prompt += f"\nNội dung/Thông tin hợp đồng đang xét:\n{combined_context[:4000]}\n"

    if api_key:
        # Build OpenAI-compatible messages list for DeepSeek
        chat_messages: list[dict[str, Any]] = [
            {"role": "system", "content": system_prompt},
        ]
        if history:
            for turn in history[-10:]:
                role = "user" if turn.get("role") == "user" else "assistant"
                chat_messages.append({"role": role, "content": turn.get("content", "")})

        # If an image is attached, switch to multimodal vision model gemini-3.7-flash
        user_message = message
        model_name = os.getenv("DEEPSEEK_MODEL", "deepseek-v4.1-flash")

        if image_base64 and image_mime_type:
            model_name = "gemini-3.7-flash"
            chat_messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": f"[Người dùng đã gửi kèm ảnh tài liệu: {attachment_filename or 'ảnh hợp đồng'}]:\n{user_message}"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{image_mime_type};base64,{image_base64}"},
                    },
                ],
            })
        else:
            chat_messages.append({"role": "user", "content": user_message})

        base_url = os.getenv("DEEPSEEK_BASE_URL", "https://vibi.top/v1").rstrip("/")
        url = base_url if base_url.endswith("/chat/completions") else f"{base_url}/chat/completions"
        try:
            payload: dict[str, Any] = {
                "model": model_name,
                "messages": chat_messages,
                "temperature": 0.2,
                "max_tokens": 2048,
                "response_format": {"type": "json_object"},
            }
            if "deepseek" in model_name.lower():
                payload["thinking"] = {"type": "disabled"}
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WeebLegit-AI/1.0",
                },
            )
            with urllib.request.urlopen(req, timeout=35) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                raw_text = (data["choices"][0]["message"].get("content") or "").strip()
                # Strip markdown code fences if present
                if raw_text.startswith("```"):
                    lines = raw_text.split("\n")
                    lines = [l for l in lines if not l.strip().startswith("```")]
                    raw_text = "\n".join(lines).strip()
                if raw_text:
                    try:
                        parsed = json.loads(raw_text)
                        if isinstance(parsed, dict) and str(parsed.get("reply") or "").strip():
                            return {
                                "reply": str(parsed.get("reply", "")).strip(),
                                "citations": parsed.get("citations", []),
                                "negotiation_script": parsed.get("negotiation_script"),
                                "source": "deepseek-live",
                                "model": model_name,
                            }
                    except json.JSONDecodeError:
                        return {
                            "reply": raw_text,
                            "citations": [],
                            "negotiation_script": None,
                            "source": "deepseek-live",
                            "model": model_name,
                        }
        except Exception as exc:
            print(f"[AI] DeepSeek chat failed: {exc}")

    # If an attachment text was uploaded and DeepSeek is offline, analyze the attachment text using local_rule_analysis!
    if attachment_text:
        rule_res = local_rule_analysis(attachment_text)
        findings = rule_res.get("findings", [])
        score = rule_res.get("risk_score", 0)
        label = rule_res.get("risk_label", "")
        if findings:
            bullet_lines = [
                f"• **{f['title']}** (Điểm rủi ro: {int(f['clause_risk_score'])}/100): {f['warning']} *(Căn cứ: {f['reference']})*"
                for f in findings[:5]
            ]
            reply = (
                f"Tôi đã đọc tệp đính kèm **{attachment_filename or 'hợp đồng'}** của bạn.\n"
                f"**Đánh giá tổng quan:** Điểm rủi ro **{score}/100 ({label})** với **{len(findings)} điều khoản cần lưu ý**:\n\n"
                + "\n".join(bullet_lines)
            )
            citations = list({f["reference"] for f in findings[:4]})
            negotiation_script = findings[0].get("negotiation_script")
        else:
            reply = (
                f"Tôi đã đọc nội dung tệp **{attachment_filename or 'hợp đồng'}** ({len(attachment_text)} ký tự). "
                "Chưa phát hiện từ khóa bẫy nghiêm trọng nào theo bộ quy tắc chuẩn. Tuy nhiên bạn vẫn nên kiểm tra kỹ số tiền đặt cọc, thời hạn báo trước và biên bản bàn giao trước khi ký."
            )
            citations = ["Bộ luật Dân sự 2015"]
            negotiation_script = None
        return {
            "reply": reply,
            "citations": citations,
            "negotiation_script": negotiation_script,
            "source": "weebforce-file-analyzer",
        }

    if image_base64:
        return {
            "reply": (
                f"Tôi đã nhận được hình ảnh **{attachment_filename or 'trang hợp đồng'}** của bạn. "
                "Khi kiểm tra trang chụp hợp đồng, bạn hãy đối chiếu ngay 4 điểm quan trọng nhất:\n"
                "1. **Tiền đặt cọc & Điều kiện hoàn cọc** (Điều 328 BLDS 2015): Có ghi rõ hoàn trả 100% khi báo trước đúng hạn không?\n"
                "2. **Đơn giá điện, nước & phí dịch vụ** (Thông tư 25/2018/TT-BCT): Có niêm yết cố định hay ghi 'tăng tùy ý'?\n"
                "3. **Giấy tờ tùy thân** (Điều 7 Luật Căn cước 2023): Tuyệt đối không giao bản gốc CCCD.\n"
                "4. **Cam kết phạt vi phạm / đào tạo** (Điều 62 BLLĐ 2019): Kiểm tra có điều khoản phạt nghỉ sớm bất hợp lý không."
            ),
            "citations": [
                "Điều 328 Bộ luật Dân sự 2015",
                "Điều 7 Luật Căn cước 2023",
                "Thông tư 25/2018/TT-BCT",
            ],
            "negotiation_script": (
                '"Dạ anh/chị ơi, em vừa xem qua trang hợp đồng này, nhờ bên mình làm rõ thêm điều kiện hoàn trả tiền cọc và ghi cố định biểu phí dịch vụ trong suốt thời hạn hợp đồng giúp em ạ!"'
            ),
            "source": "weebforce-image-guide",
        }

    # Intelligent legal rule-based fallback if no DeepSeek key or connection failed
    msg_lower = f"{message} {combined_context}".lower()
    citations = []
    negotiation_script = None

    if any(k in msg_lower for k in ["điện", "tiền điện", "giá điện", "kwh", "bình thạnh", "4k", "số điện"]):
        reply = (
            "Theo **Thông tư 25/2018/TT-BCT** (được sửa đổi bổ sung bởi **Thông tư 09/2023/TT-BCT**) của Bộ Công Thương:\n"
            "- Sinh viên và người lao động thuê trọ được áp dụng giá bán lẻ điện sinh hoạt theo quy định của Nhà nước.\n"
            "- Trường hợp chủ nhà trọ chưa kê khai hoặc không tính được số người, phải áp dụng mức giá bán lẻ điện bậc 3 "
            "(khoảng 2.527đ/kWh chưa VAT, tương đương khoảng 2.700đ - 2.800đ/kWh sau thuế).\n"
            "- Mức giá **4.000đ/kWh (hoặc trên 4k)** tại các khu trọ (như quận Bình Thạnh) là **cao hơn nhiều so với quy định pháp luật**. "
            "Theo **Nghị định 17/2022/NĐ-CP**, hành vi thu tiền điện của người thuê trọ cao hơn giá quy định có thể bị phạt tiền từ 20 đến 30 triệu đồng."
        )
        citations = ["Thông tư 25/2018/TT-BCT", "Thông tư 09/2023/TT-BCT", "Nghị định 17/2022/NĐ-CP"]
        negotiation_script = (
            "\"Dạ thưa anh/chị chủ nhà, em tìm hiểu theo quy định của Bộ Công Thương (Thông tư 09/2023/TT-BCT) thì giá bán điện cho người thuê trọ "
            "áp dụng theo bậc 3 chỉ khoảng 2.800đ/kWh. Mức giá 4.000đ/kWh hiện tại hơi cao so với quy định và chi phí sinh hoạt của em. "
            "Em xin phép hỏi bên mình có thể tính theo công tơ thực tế hoặc điều chỉnh hỗ trợ sinh viên được không ạ?\""
        )
    elif any(k in msg_lower for k in ["nước", "tiền nước", "giá nước", "khối nước", "m3"]):
        reply = (
            "Về tiền nước sinh hoạt tại phòng trọ:\n"
            "- Sinh viên và người thuê trọ có đăng ký tạm trú (từ 12 tháng trở lên) được cấp định mức nước sinh hoạt "
            "theo biểu giá nhà nước (thường 7.000đ - 15.000đ/m3 tùy bậc tiêu thụ).\n"
            "- Nếu chủ nhà thu cố định 30.000đ - 50.000đ/m3 hoặc thu theo đầu người 100.000đ/tháng mà không qua đồng hồ riêng, "
            "đây là mức phụ phí tự đặt. Bạn nên yêu cầu chủ nhà hỗ trợ làm thủ tục tạm trú để được cấp định mức nước theo đúng quy định."
        )
        citations = ["Biểu giá nước sạch sinh hoạt địa phương", "Bộ luật Dân sự 2015"]
        negotiation_script = (
            "\"Dạ em nhờ bên mình hỗ trợ làm thủ tục đăng ký tạm trú để xin cấp định mức nước sinh hoạt theo quy định địa phương, giúp tiết kiệm chi phí đôi bên ạ!\""
        )
    elif any(k in msg_lower for k in ["cccd", "căn cước", "cmnd", "giữ giấy tờ", "giữ cccd", "giữ cmnd"]):
        reply = (
            "Theo **Điều 7 Luật Căn cước 2023** và **Điều 17 Bộ luật Lao động 2019**:\n"
            "- **Tuyệt đối nghiêm cấm** mọi cá nhân, chủ nhà trọ, hay người sử dụng lao động giữ bản chính giấy tờ tùy thân (CCCD, CMND, Hộ chiếu) của bạn.\n"
            "- Chủ nhà hoặc công ty chỉ có quyền yêu cầu bạn xuất trình bản gốc để đối chiếu và giữ lại bản photocopy (hoặc bản quét) phục vụ khai báo tạm trú hoặc ký hợp đồng."
        )
        citations = ["Điều 7 Luật Căn cước 2023", "Điều 17 Bộ luật Lao động 2019"]
        negotiation_script = (
            "\"Dạ theo quy định của Luật Căn cước, em xin phép gửi lại bản photocopy CCCD có công chứng để bên mình làm thủ tục tạm trú/hồ sơ, còn bản gốc em xin giữ lại để giải quyết các việc cá nhân ạ!\""
        )
    elif any(k in msg_lower for k in ["đào tạo", "nghỉ sớm", "nghỉ việc", "bồi thường", "phạt"]):
        reply = (
            "Theo **Điều 62 Bộ luật Lao động 2019**, bên tuyển dụng chỉ được quyền yêu cầu bồi hoàn "
            "chi phí đào tạo nếu có ký 'Hợp đồng đào tạo nghề riêng biệt' và công ty thực tế có chi trả học phí, "
            "có hóa đơn chứng từ hợp lệ từ cơ sở đào tạo. Việc công ty tự đào tạo nội bộ hoặc 'hướng dẫn công việc' "
            "rồi bắt bồi thường khoản tiền phạt vô lý (như 10-20 triệu) khi nghỉ sớm là hoàn toàn trái luật."
        )
        citations = ["Điều 62 Bộ luật Lao động 2019"]
        negotiation_script = (
            "\"Dạ em chào anh/chị, em rất hào hứng với cơ hội được học hỏi tại công ty. "
            "Về điều khoản cam kết bồi hoàn đào tạo, theo quy định của Bộ luật Lao động 2019, "
            "em xin phép đề xuất điều chỉnh chỉ áp dụng bồi hoàn đối với các khóa đào tạo có chứng chỉ "
            "và chứng từ chi phí thực tế phát sinh để cả hai bên cùng rõ ràng ạ!\""
        )
    elif any(k in msg_lower for k in ["cọc", "thuê", "chuyển đi", "phòng", "trả phòng"]):
        reply = (
            "Theo **Điều 328 Bộ luật Dân sự 2015** và **Điều 132 Luật Nhà ở 2023**:\n"
            "- Tiền cọc là biện pháp bảo đảm thực hiện hợp đồng. Nếu bạn thông báo trước theo đúng thời hạn thỏa thuận "
            "(thường là 30 ngày) và thanh toán đầy đủ tiền điện nước, chủ nhà có nghĩa vụ hoàn trả lại tiền cọc.\n"
            "- Mọi điều khoản ghi 'chủ nhà có quyền tịch thu toàn bộ tiền cọc mà không cần lý do' là điều khoản bất lợi, cần thương lượng sửa lại."
        )
        citations = ["Điều 328 BLDS 2015", "Điều 132 Luật Nhà ở 2023"]
        negotiation_script = (
            "\"Dạ thưa chủ nhà, cháu dự kiến sẽ trả phòng vào cuối tháng tới. Cháu gửi thông báo trước 30 ngày đúng quy định. "
            "Sau khi hai bên đối soát hóa đơn điện nước và hiện trạng phòng, nhờ bên mình hoàn lại tiền cọc cho cháu vào ngày bàn giao phòng ạ!\""
        )
    elif any(k in msg_lower for k in ["thử việc", "lương", "phụ cấp"]):
        reply = (
            "Theo **Điều 26 Bộ luật Lao động 2019**, tiền lương của người lao động trong thời gian thử việc "
            "do hai bên thỏa thuận nhưng **ít nhất phải bằng 85% mức lương** của công việc đó.\n"
            "Mức lương thử việc 70% hay 50% là trái với quy định pháp luật lao động."
        )
        citations = ["Điều 26 Bộ luật Lao động 2019"]
        negotiation_script = (
            "\"Dạ anh/chị cho em hỏi rõ thêm về mức phụ cấp/lương thử việc hàng tháng. "
            "Để bảo đảm chi phí sinh hoạt, em xin phép đề xuất mức lương thử việc tối thiểu 85% "
            "theo đúng khung quy định của Bộ luật Lao động ạ!\""
        )
    elif any(k in msg_lower for k in ["lãi suất", "vay", "trả góp", "app vay"]):
        reply = (
            "Theo **Điều 468 Bộ luật Dân sự 2015**, lãi suất vay do các bên thỏa thuận nhưng **không được vượt quá 20%/năm** "
            "của khoản tiền vay. Các loại 'phí dịch vụ', 'phí quản lý hồ sơ' làm lãi suất thực tế đội lên 30-50%/năm là dấu hiệu bẫy tín dụng đen, sinh viên tuyệt đối không nên vay."
        )
        citations = ["Điều 468 Bộ luật Dân sự 2015"]
        negotiation_script = (
            "\"Dạ em nhờ bên mình cung cấp bảng tính tổng chi phí (gồm lãi suất + tất cả các loại phí) theo năm "
            "để em tính toán tổng số tiền phải trả trước khi quyết định ký hợp đồng ạ!\""
        )
    else:
        reply = (
            f"Chào bạn! Đối với câu hỏi về: '{message}'. Trong quan hệ hợp đồng (thuê trọ, làm việc, vay mượn), "
            "nguyên tắc vàng là: **Mọi cam kết, chi phí và trách nhiệm phải được ghi rõ ràng thành văn bản**; "
            "không tin vào lời hứa miệng. Hãy kiểm tra kỹ số tiền, thời hạn, điều kiện bồi thường trước khi ký."
        )
        citations = ["Bộ luật Dân sự 2015"]
        negotiation_script = (
            "\"Em xin phép nhờ bên mình bổ sung cụ thể nội dung này vào phụ lục hoặc điều khoản hợp đồng để hai bên cùng rõ ràng trách nhiệm ạ!\""
        )

    return {
        "reply": reply,
        "citations": citations,
        "negotiation_script": negotiation_script,
        "source": "weebforce-legal-rules",
    }


