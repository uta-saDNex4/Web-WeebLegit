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

    models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]
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


def ai_chat_response(
    message: str,
    contract_context: str | None = None,
    stage: str | None = None,
    history: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    """Interactive multi-turn chat response using Gemini LLM with intelligent legal fallback."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    system_prompt = (
        "Bạn là Trợ lý Pháp lý Thông minh của WeebLegit – nền tảng bảo vệ học sinh, sinh viên "
        "khi ký kết các loại hợp đồng (thuê trọ, thực tập, làm thêm, CTV, khóa học, vay tiêu dùng).\n"
        "Nhiệm vụ của bạn:\n"
        "1. Giải thích các điều khoản bằng ngôn ngữ dễ hiểu, thân thiện, không dùng thuật ngữ quá hàn lâm.\n"
        "2. Luôn trích dẫn rõ ràng các căn cứ pháp luật Việt Nam (Bộ luật Lao động 2019, Bộ luật Dân sự 2015, Luật Nhà ở 2023, Thông tư 25/2018/TT-BCT,...).\n"
        "3. Khi người dùng cần, hãy soạn giúp một đoạn kịch bản tin nhắn/email đàm phán lịch sự, khéo léo để gửi cho nhà tuyển dụng hoặc chủ nhà.\n"
    )

    if stage:
        system_prompt += f"\nNgữ cảnh công đoạn xử lý hiện tại: '{stage}'."
    if contract_context:
        system_prompt += f"\nNội dung/Thông tin hợp đồng đang xét:\n{contract_context[:2500]}\n"

    if api_key:
        models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]
        chat_contents = [{"parts": [{"text": system_prompt}]}]
        if history:
            for turn in history[-6:]:
                role = "user" if turn.get("role") == "user" else "model"
                chat_contents.append({"role": role, "parts": [{"text": turn.get("content", "")}]})
        chat_contents.append({"role": "user", "parts": [{"text": message}]})

        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps({"contents": chat_contents}).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                )
                with urllib.request.urlopen(req, timeout=12) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    answer = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "reply": answer,
                        "source": "gemini-live",
                        "model": model,
                    }
            except Exception:
                continue

    # Intelligent legal rule-based fallback if no Gemini key or connection failed
    msg_lower = message.lower()
    citations = []
    negotiation_script = None

    if "đào tạo" in msg_lower or "nghỉ sớm" in msg_lower or "bồi thường" in msg_lower:
        reply = (
            "Theo **Điều 62 Bộ luật Lao động 2019**, bên tuyển dụng chỉ được quyền yêu cầu bồi hoàn "
            "chi phí đào tạo nếu có ký 'Hợp đồng đào tạo nghề riêng biệt' và công ty thực tế có chi trả học phí, "
            "có hóa đơn chứng từ hợp lệ từ cơ sở đào tạo. Việc công ty tự đào tạo nội bộ hoặc 'hướng dẫn công việc' "
            "rồi bắt bồi thường khoản tiền phạt vô lý (như 10-20 triệu) khi nghỉ sớm là hoàn toàn trái luật."
        )
        citations.append("Điều 62 Bộ luật Lao động 2019")
        negotiation_script = (
            "\"Dạ em chào anh/chị, em rất hào hứng với cơ hội được học hỏi tại công ty. "
            "Về điều khoản cam kết bồi hoàn đào tạo, theo quy định của Bộ luật Lao động 2019, "
            "em xin phép đề xuất điều chỉnh chỉ áp dụng bồi hoàn đối với các khóa đào tạo có chứng chỉ "
            "và chứng từ chi phí thực tế phát sinh để cả hai bên cùng rõ ràng ạ!\""
        )
    elif "cọc" in msg_lower or "thuê" in msg_lower or "chuyển đi" in msg_lower or "phòng" in msg_lower:
        reply = (
            "Theo **Điều 328 Bộ luật Dân sự 2015** và **Điều 132 Luật Nhà ở 2023**:\n"
            "- Tiền cọc là biện pháp bảo đảm thực hiện hợp đồng. Nếu bạn thông báo trước theo đúng thỏa thuận "
            "(thường là 30 ngày) và thanh toán đầy đủ tiền điện nước, chủ nhà có nghĩa vụ hoàn trả lại tiền cọc.\n"
            "- Về tiền điện: Theo **Thông tư 25/2018/TT-BCT**, sinh viên thuê nhà trọ được áp dụng giá điện sinh hoạt "
            "bậc thang theo biểu giá của nhà nước, chủ trọ không được tùy tiện thu giá quá cao trái quy định."
        )
        citations.append("Điều 328 BLDS 2015")
        citations.append("Thông tư 25/2018/TT-BCT")
        negotiation_script = (
            "\"Dạ thưa cô/chú chủ nhà, cháu dự kiến sẽ kết thúc hợp đồng thuê vào cuối tháng tới. "
            "Cháu xin gửi thông báo trước 30 ngày đúng như quy định để cô/chú tiện sắp xếp khách mới. "
            "Sau khi cháu đối soát và thanh toán hết hóa đơn điện nước tháng cuối, nhờ cô/chú hoàn lại tiền đặt cọc "
            "cho cháu vào ngày bàn giao phòng ạ!\""
        )
    elif "thử việc" in msg_lower or "lương" in msg_lower or "phụ cấp" in msg_lower:
        reply = (
            "Theo **Điều 26 Bộ luật Lao động 2019**, tiền lương của người lao động trong thời gian thử việc "
            "do hai bên thỏa thuận nhưng **ít nhất phải bằng 85% mức lương** của công việc đó.\n"
            "Ngoài ra, **Điều 17 BLLĐ 2019** nghiêm cấm doanh nghiệp giữ bản chính giấy tờ tùy thân (CCCD) "
            "hoặc thu bất kỳ khoản tiền đặt cọc giữ chỗ nào của bạn."
        )
        citations.append("Điều 26 Bộ luật Lao động 2019")
        citations.append("Điều 17 Bộ luật Lao động 2019")
        negotiation_script = (
            "\"Dạ anh/chị cho em hỏi rõ thêm về mức phụ cấp/lương thử việc hàng tháng. "
            "Để bảo đảm chi phí sinh hoạt đi lại, em xin phép đề xuất mức lương thử việc tối thiểu 85% "
            "theo đúng khung quy định của Bộ luật Lao động ạ!\""
        )
    elif "sha" in msg_lower or "hash" in msg_lower or "mã băm" in msg_lower or "toàn vẹn" in msg_lower:
        reply = (
            "Mã băm **SHA-256** hoạt động như một 'dấu vân tay kỹ thuật số' độc nhất của tệp hợp đồng. "
            "Chỉ cần 1 ký tự, 1 dấu chấm hoặc 1 con số trong hợp đồng bị thay đổi trái phép sau khi lưu, "
            "mã SHA-256 tính lại sẽ hoàn toàn khác biệt (Mismatched). Nhờ vậy, WeebLegit giúp bạn "
            "chứng minh và bảo đảm 100% tài liệu không hề bị ai âm thầm chỉnh sửa."
        )
        citations.append("Tiêu chuẩn FIPS 180-4 NIST (Secure Hash Standard)")
    else:
        reply = (
            f"Cảm ơn bạn đã hỏi về: '{message}'. Đối với điều khoản này trong hợp đồng, "
            "nguyên tắc quan trọng nhất là: **Mọi cam kết đều phải ghi rõ bằng văn bản**, tránh các cụm từ "
            "mập mờ như 'tùy tình hình', 'theo quyết định công ty'. Hãy yêu cầu ghi rõ số tiền, thời hạn "
            "và trách nhiệm của các bên trước khi đặt bút ký."
        )
        citations.append("Bộ luật Dân sự 2015")
        negotiation_script = (
            "\"Em xin phép nhờ bên mình bổ sung cụ thể mốc thời gian và phương thức thực hiện "
            "của điều khoản này vào phụ lục/văn bản hợp đồng để hai bên cùng thuận tiện theo dõi ạ!\""
        )

    return {
        "reply": reply,
        "citations": citations,
        "negotiation_script": negotiation_script,
        "source": "weebforce-legal-rules",
    }

