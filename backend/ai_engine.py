"""AI Engine supporting real Google Gemini LLM analysis with fallback to local rule-based scanner."""
from __future__ import annotations

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


def _call_gemini_api(contract_text: str, metadata: dict[str, Any] | None = None) -> dict[str, Any] | None:
    """Call Google Gemini API for deep legal risk analysis of student contracts."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None

    models = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-2.5-flash"]
    prompt = (
        f"Bạn là chuyên gia pháp lý tư vấn hợp đồng cho sinh viên (thuê trọ, thực tập, CTV, khóa học, vay tiêu dùng).\n"
        f"Hãy rà soát văn bản hợp đồng sau và phát hiện các bẫy điều khoản, chi phí bất hợp lý, hoặc rủi ro pháp lý.\n\n"
        f"Nội dung hợp đồng:\n{contract_text[:3000]}\n"
        f"Metadata: {metadata or {}}\n\n"
        f"Trả về kết quả chuẩn JSON duy nhất với các trường:\n"
        f"- risk_score (float 0-100)\n"
        f"- risk_label ('Chưa phát hiện dấu hiệu nổi bật' | 'Cần rà soát thêm' | 'Rủi ro trung bình-cao' | 'Rủi ro cao')\n"
        f"- ai_overview (chuỗi tóm tắt đánh giá ngắn 2-3 câu)\n"
        f"- ai_findings (danh sách object {{'risk_level': 'critical'|'high'|'medium'|'low', 'matched_term': 'nội dung bẫy', 'warning': 'lời khuyên cho sinh viên', 'reference': 'Điều luật tham chiếu (VD: Điều 62 Bộ luật Lao động 2019)'}})\n"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2},
    }
    body_bytes = json.dumps(payload).encode("utf-8")

    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        req = urllib.request.Request(
            url,
            data=body_bytes,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                result = json.loads(text)
                if "risk_score" in result and "ai_findings" in result:
                    # Sanitize findings to guarantee no missing fields
                    findings = []
                    for item in result.get("ai_findings", []):
                        findings.append({
                            "risk_level": str(item.get("risk_level", "medium")).lower(),
                            "matched_term": str(item.get("matched_term", "Nội dung cần lưu ý")),
                            "warning": str(item.get("warning", "Khuyên bạn rà soát lại điều khoản này trước khi ký.")),
                            "reference": str(item.get("reference", "Tham chiếu Bộ luật Dân sự 2015 & quy định hiện hành")),
                            "target_section": str(item.get("target_section", "Điều khoản hợp đồng")),
                        })
                    result["ai_findings"] = findings
                    result["ai_overview"] = f"[Gemini AI Real-time]: {result.get('ai_overview', '')}"
                    return result
        except Exception:
            continue

    return None


def local_rule_analysis(contract_text: str, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    """Deterministic local rule engine fallback."""
    context = f"{contract_text or ''} {metadata or {}}".lower()
    findings: list[dict[str, Any]] = []
    weights = {"critical": 35, "high": 20, "medium": 8}

    for level, patterns in DEFAULT_RISK_PATTERNS.items():
        for pattern, (warning_msg, ref_law) in patterns.items():
            if re.search(re.escape(pattern), context):
                findings.append({
                    "risk_level": level,
                    "matched_term": pattern,
                    "warning": warning_msg,
                    "reference": ref_law,
                    "target_section": "Điều khoản rủi ro",
                })

    score = min(100.0, round(sum(weights[item["risk_level"]] for item in findings), 2))
    if score >= 70:
        label = "Rủi ro cao"
    elif score >= 35:
        label = "Rủi ro trung bình-cao"
    elif score > 0:
        label = "Cần rà soát thêm"
    else:
        label = "Chưa phát hiện dấu hiệu rủi ro nổi bật"

    return {
        "risk_score": score,
        "risk_label": label,
        "ai_overview": f"Hệ thống tự động: {label}. Báo cáo rà soát dựa trên danh mục các điều khoản bất lợi phổ biến với sinh viên.",
        "ai_findings": findings,
    }


def ai_analyze_contract_context(contract_text: str, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    """Analyze contract text using Gemini API when available, falling back seamlessly to local rules."""
    gemini_report = _call_gemini_api(contract_text, metadata)
    if gemini_report is not None:
        return gemini_report

    return local_rule_analysis(contract_text, metadata)
