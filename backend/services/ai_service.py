"""AI Analysis Service using DB Risk Rules, hybrid AI scoring, and persistent DB storage."""
from __future__ import annotations

import re
import threading
from time import perf_counter
from typing import Any
from uuid import UUID, uuid4
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import RiskRule, LegalReference, AnalysisResult, Contract
from ..ai_engine import ai_analyze_contract_context, normalize_finding

# In-memory mirror cache alongside DB storage for fast lookup and test compatibility
_ai_result_cache: dict[UUID, dict[str, Any]] = {}
_ai_cache_lock = threading.Lock()
_MAX_CACHE_SIZE = 500


def get_cached_ai_analysis(log_id: UUID) -> dict[str, Any] | None:
    with _ai_cache_lock:
        return _ai_result_cache.get(log_id)


def store_cached_ai_analysis(log_id: UUID, report: dict[str, Any]) -> None:
    with _ai_cache_lock:
        if len(_ai_result_cache) >= _MAX_CACHE_SIZE:
            keys_to_remove = list(_ai_result_cache.keys())[:100]
            for k in keys_to_remove:
                _ai_result_cache.pop(k, None)
        _ai_result_cache[log_id] = report


def get_analysis_result_from_db(db: Session, log_id: UUID) -> dict[str, Any] | None:
    """Retrieve a stored analysis result from the database by verification_log_id (with RAM fallback)."""
    result = db.scalars(
        select(AnalysisResult).where(AnalysisResult.verification_log_id == log_id)
    ).first()
    if result:
        normalized_findings = [normalize_finding(f) for f in (result.findings or [])]
        return {
            "id": str(result.id),
            "risk_score": result.risk_score,
            "risk_label": result.risk_label,
            "ai_overview": result.ai_overview or "",
            "overview": result.ai_overview or "",
            "ai_findings": normalized_findings,
            "findings": normalized_findings,
            "analysis_source": result.analysis_source,
            "model_version": result.model_version,
            "analysis_duration_ms": result.analysis_duration_ms,
            "created_at": result.created_at.isoformat() if result.created_at else None,
        }
    return get_cached_ai_analysis(log_id)


def save_analysis_result_to_db(
    db: Session,
    contract_id: UUID,
    user_id: UUID,
    log_id: UUID | None,
    report: dict[str, Any],
    analysis_source: str = "hybrid",
    model_version: str | None = None,
    duration_ms: int | None = None,
) -> AnalysisResult:
    """Persist an analysis result to the database for permanent history."""
    if analysis_source not in ("deepseek", "rule-based", "hybrid"):
        analysis_source = "hybrid"
    record = AnalysisResult(
        id=uuid4(),
        contract_id=contract_id,
        user_id=user_id,
        verification_log_id=log_id,
        risk_score=float(report.get("risk_score", 0.0)),
        risk_label=str(report.get("risk_label", "")),
        ai_overview=report.get("ai_overview") or report.get("overview"),
        findings=report.get("ai_findings") or report.get("findings") or [],
        analysis_source=analysis_source,
        model_version=model_version,
        analysis_duration_ms=duration_ms,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


class AIService:
    def analyze_contract_with_db_rules(
        self,
        db: Session,
        log_id: UUID,
        contract_text: str,
        contract_id: UUID | None = None,
        user_id: UUID | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Perform risk scan combining DB rules and hybrid AI engine logic, saving result to DB."""
        started = perf_counter()

        # 1. Check if the exact same contract file (by sha256_hash) already has an analysis result
        # to guarantee 100% deterministic score consistency across repeated runs of the same file.
        if contract_id is not None:
            current_contract = db.scalars(
                select(Contract).where(Contract.id == contract_id)
            ).first()
            if current_contract and current_contract.sha256_hash:
                existing_analysis = db.scalars(
                    select(AnalysisResult)
                    .join(Contract, Contract.id == AnalysisResult.contract_id)
                    .where(Contract.sha256_hash == current_contract.sha256_hash)
                    .order_by(AnalysisResult.created_at.desc())
                ).first()
                if existing_analysis and existing_analysis.findings is not None:
                    normalized_findings = [
                        normalize_finding(f, contract_text)
                        for f in (existing_analysis.findings or [])
                    ]
                    duration_ms = int((perf_counter() - started) * 1000)
                    overview_str = existing_analysis.ai_overview or ""
                    reused_report = {
                        "risk_score": existing_analysis.risk_score,
                        "risk_label": existing_analysis.risk_label,
                        "ai_overview": overview_str,
                        "overview": overview_str,
                        "ai_findings": normalized_findings,
                        "findings": normalized_findings,
                        "analysis_source": existing_analysis.analysis_source,
                        "model_version": existing_analysis.model_version,
                    }
                    if user_id:
                        try:
                            saved = save_analysis_result_to_db(
                                db=db,
                                contract_id=contract_id,
                                user_id=user_id,
                                log_id=log_id,
                                report=reused_report,
                                analysis_source=existing_analysis.analysis_source,
                                model_version=existing_analysis.model_version,
                                duration_ms=duration_ms,
                            )
                            reused_report["id"] = str(saved.id)
                        except Exception as exc:
                            print(f"[AIService] Failed to persist reused analysis result: {exc}")
                    store_cached_ai_analysis(log_id, reused_report)
                    return reused_report

        # 2. Scan deterministic DB rules
        rules = list(db.scalars(select(RiskRule)).all())
        legal_refs = list(db.scalars(select(LegalReference)).all())
        db_findings: list[dict[str, Any]] = []
        weights = {"critical": 35, "high": 20, "medium": 8, "low": 3}
        clause_scores_map = {"critical": 90.0, "high": 70.0, "medium": 45.0, "low": 20.0}
        context = f"{contract_text or ''} {metadata or {}}".lower()

        if rules:
            for rule in rules:
                keyword = rule.keyword_trigger.lower().strip()
                if keyword and re.search(re.escape(keyword), context):
                    matched_ref = "Bộ luật Dân sự 2015 & Quy định pháp luật hiện hành"
                    for ref in legal_refs:
                        if (
                            ref.clause_category.lower() in rule.target_section.lower()
                            or rule.target_section.lower() in ref.clause_category.lower()
                        ):
                            matched_ref = f"{ref.rule_name} ({ref.reference})"
                            break

                    risk_level = rule.risk_level.lower()
                    db_findings.append(
                        normalize_finding(
                            {
                                "risk_level": risk_level,
                                "clause_risk_score": clause_scores_map.get(risk_level, 45.0),
                                "target_section": rule.target_section,
                                "title": rule.target_section,
                                "matched_term": rule.keyword_trigger,
                                "warning": rule.default_warning_message,
                                "reference": matched_ref,
                            },
                            contract_text,
                        )
                    )

        # 3. Also run hybrid AI + local rule engine and merge unique findings
        engine_report = ai_analyze_contract_context(contract_text, metadata)
        engine_findings = [
            normalize_finding(f, contract_text)
            for f in engine_report.get("ai_findings", [])
        ]

        merged_findings = list(db_findings)
        seen_terms = {f.get("matched_term", "").lower().strip() for f in merged_findings}
        for ef in engine_findings:
            term_key = ef.get("matched_term", "").lower().strip()
            if term_key and term_key not in seen_terms:
                merged_findings.append(ef)
                seen_terms.add(term_key)

        db_rule_score = min(
            100.0,
            round(
                sum(weights.get(item.get("risk_level", "medium"), 10) for item in db_findings),
                2,
            ),
        )
        engine_score = float(engine_report.get("risk_score", 0.0))

        if db_rule_score > 0 and engine_score > 0:
            score = round(min(100.0, 0.6 * db_rule_score + 0.4 * engine_score), 1)
            analysis_source = "hybrid"
        elif db_rule_score > 0:
            score = db_rule_score
            analysis_source = "rule-based"
        else:
            score = engine_score
            analysis_source = str(engine_report.get("analysis_source") or "rule-based")

        model_version = engine_report.get("model_version")

        if score >= 70:
            label = "Rủi ro cao"
        elif score >= 35:
            label = "Rủi ro trung bình-cao"
        elif score > 0:
            label = "Cần rà soát thêm"
        else:
            label = "Chưa phát hiện dấu hiệu rủi ro nổi bật"

        duration_ms = int((perf_counter() - started) * 1000)
        overview_str = (
            engine_report.get("ai_overview")
            or f"Hệ thống phân tích rủi ro hợp đồng sinh viên: {label}. Đã rà soát {len(merged_findings)} điều khoản cần lưu ý."
        )

        report = {
            "risk_score": score,
            "risk_label": label,
            "ai_overview": overview_str,
            "overview": overview_str,
            "ai_findings": merged_findings,
            "findings": merged_findings,
            "analysis_source": analysis_source,
            "model_version": model_version,
            "analysis_duration_ms": duration_ms,
        }

        if contract_id and user_id:
            try:
                saved = save_analysis_result_to_db(
                    db=db,
                    contract_id=contract_id,
                    user_id=user_id,
                    log_id=log_id,
                    report=report,
                    analysis_source=analysis_source,
                    model_version=model_version,
                    duration_ms=duration_ms,
                )
                report["id"] = str(saved.id)
            except Exception as exc:
                print(f"[AIService] Failed to persist analysis result: {exc}")

        store_cached_ai_analysis(log_id, report)
        return report
