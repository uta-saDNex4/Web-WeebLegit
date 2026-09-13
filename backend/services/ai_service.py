"""AI Analysis Service using DB Risk Rules and caching."""
from __future__ import annotations

import re
import threading
from typing import Any
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import RiskRule, LegalReference
from ..ai_engine import ai_analyze_contract_context

# Cache for AI results (max 500 items to prevent memory leaks)
_ai_result_cache: dict[UUID, dict[str, Any]] = {}
_ai_cache_lock = threading.Lock()
_MAX_CACHE_SIZE = 500


def get_cached_ai_analysis(log_id: UUID) -> dict[str, Any] | None:
    with _ai_cache_lock:
        return _ai_result_cache.get(log_id)


def store_cached_ai_analysis(log_id: UUID, report: dict[str, Any]) -> None:
    with _ai_cache_lock:
        if len(_ai_result_cache) >= _MAX_CACHE_SIZE:
            # Remove oldest 100 entries
            keys_to_remove = list(_ai_result_cache.keys())[:100]
            for k in keys_to_remove:
                _ai_result_cache.pop(k, None)
        _ai_result_cache[log_id] = report


class AIService:
    def analyze_contract_with_db_rules(
        self,
        db: Session,
        log_id: UUID,
        contract_text: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Perform risk scan combining DB rules and AI engine logic."""
        rules = list(db.scalars(select(RiskRule)).all())
        legal_refs = list(db.scalars(select(LegalReference)).all())
        findings: list[dict[str, Any]] = []
        weights = {"critical": 35, "high": 20, "medium": 8, "low": 3}
        context = f"{contract_text or ''} {metadata or {}}".lower()

        if rules:
            for rule in rules:
                keyword = rule.keyword_trigger.lower().strip()
                if keyword and re.search(re.escape(keyword), context):
                    # Match legal reference from DB if available
                    matched_ref = "Bộ luật Dân sự 2015 & Quy định pháp luật hiện hành"
                    for ref in legal_refs:
                        if ref.clause_category.lower() in rule.target_section.lower() or rule.target_section.lower() in ref.clause_category.lower():
                            matched_ref = f"{ref.rule_name} ({ref.reference})"
                            break

                    findings.append({
                        "risk_level": rule.risk_level.lower(),
                        "target_section": rule.target_section,
                        "matched_term": rule.keyword_trigger,
                        "warning": rule.default_warning_message,
                        "reference": matched_ref,
                    })

        # Fallback to local AI engine if no rules match or no DB rules found
        if not findings:
            fallback_report = ai_analyze_contract_context(contract_text, metadata)
            findings = fallback_report.get("ai_findings", [])

        # Ensure all findings items contain 'reference' field
        for item in findings:
            if "reference" not in item or not item["reference"]:
                item["reference"] = "Bộ luật Dân sự 2015 & Quy định pháp luật hiện hành"

        score = min(
            100.0,
            round(
                sum(weights.get(item.get("risk_level", "medium"), 10) for item in findings),
                2,
            ),
        )

        if score >= 70:
            label = "Rủi ro cao"
        elif score >= 35:
            label = "Rủi ro trung bình-cao"
        elif score > 0:
            label = "Cần rà soát thêm"
        else:
            label = "Chưa phát hiện dấu hiệu rủi ro nổi bật"

        report = {
            "risk_score": score,
            "risk_label": label,
            "ai_overview": f"Hệ thống phân tích rủi ro hợp đồng sinh viên: {label}. Cảnh báo tự động dựa trên quy định pháp luật và mẫu quy tắc rủi ro phổ biến.",
            "ai_findings": findings,
        }

        store_cached_ai_analysis(log_id, report)
        return report
