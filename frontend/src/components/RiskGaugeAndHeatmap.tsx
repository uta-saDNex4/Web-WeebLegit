"use client";
import React from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import * as api from "../lib/api";
import { useLanguage } from "../lib/language-context";

export type RiskFilterType = "all" | "high" | "medium" | "low";

interface RiskGaugeAndHeatmapProps {
  score: number;
  riskLabel?: string | null;
  overview?: string | null;
  analysisSource?: string | null;
  findings: api.AiFindingItem[];
  activeFilter?: RiskFilterType;
  onFilterChange?: (filter: RiskFilterType) => void;
  onSelectClauseIndex?: (index: number) => void;
}

export function getClauseScore(item: api.AiFindingItem): number {
  if (typeof item.clause_risk_score === "number") {
    return Math.round(item.clause_risk_score);
  }
  const level = (item.risk_level ?? item.severity ?? "medium").toLowerCase();
  if (level === "critical") return 90;
  if (level === "high") return 72;
  if (level === "medium") return 45;
  return 20;
}

export function getClauseBucket(item: api.AiFindingItem): "high" | "medium" | "low" {
  const score = getClauseScore(item);
  const level = (item.risk_level ?? item.severity ?? "medium").toLowerCase();
  if (level === "critical" || level === "high" || score >= 70) return "high";
  if (level === "medium" || score >= 40) return "medium";
  return "low";
}

export const RiskGaugeAndHeatmap: React.FC<RiskGaugeAndHeatmapProps> = ({
  score,
  riskLabel,
  overview,
  analysisSource,
  findings,
  activeFilter = "all",
  onFilterChange,
  onSelectClauseIndex,
}) => {
  const { lang } = useLanguage();
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score || 0)));

  // SVG circle geometry
  const size = 116;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (normalizedScore / 100) * circumference;

  const gaugeColor =
    normalizedScore >= 70
      ? "#e4534b"
      : normalizedScore >= 35
        ? "#d77714"
        : "#159f7b";

  const gaugeTrackColor =
    normalizedScore >= 70
      ? "rgba(228, 83, 75, 0.22)"
      : normalizedScore >= 35
        ? "rgba(215, 119, 20, 0.22)"
        : "rgba(21, 159, 123, 0.22)";

  const badgeStyle =
    normalizedScore >= 70
      ? "bg-[#fff1f0] dark:bg-red-950/50 text-[#c83a32] dark:text-red-300 border-[#ffd1cc] dark:border-red-800/60"
      : normalizedScore >= 35
        ? "bg-[#fff8e6] dark:bg-amber-950/50 text-[#b8620d] dark:text-amber-300 border-[#ffe3a3] dark:border-amber-800/60"
        : "bg-[#eafbf7] dark:bg-emerald-950/50 text-[#0d7a5f] dark:text-emerald-300 border-[#b7f6e5] dark:border-emerald-800/60";

  const highCount = findings.filter((f) => getClauseBucket(f) === "high").length;
  const mediumCount = findings.filter(
    (f) => getClauseBucket(f) === "medium"
  ).length;
  const lowCount = findings.filter((f) => getClauseBucket(f) === "low").length;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1829] border border-[#d8e3ef] dark:border-[#1e3456] shadow-xs space-y-4">
      {/* Top Row: Circular SVG Gauge + Executive Summary */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* SVG Circular Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90 transform"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={gaugeTrackColor}
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={gaugeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="text-2xl font-extrabold leading-none"
              style={{ color: gaugeColor }}
            >
              {normalizedScore}
            </span>
            <span className="text-[10px] font-bold text-[#8297ac] dark:text-[#94a3b8] mt-0.5">
              {lang === "EN" ? "/ 100 PTS" : "/ 100 ĐIỂM"}
            </span>
          </div>
        </div>

        {/* Summary Info */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${badgeStyle}`}
            >
              {normalizedScore >= 70 ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : normalizedScore >= 35 ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>
                {riskLabel ||
                  (normalizedScore >= 70
                    ? lang === "EN" ? "High Risk" : "Rủi ro cao"
                    : normalizedScore >= 35
                      ? lang === "EN" ? "Needs Review" : "Cần lưu ý"
                      : lang === "EN" ? "Safe Level" : "Mức độ an toàn")}
              </span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF5ED] dark:bg-[#162744] text-[#8a6834] dark:text-[#EAD7B8] border border-[#EAD7B8] dark:border-[#274068]">
              <Sparkles className="w-3 h-3" />
              <span>
                {analysisSource === "hybrid" || !analysisSource
                  ? lang === "EN"
                    ? "Hybrid Scoring (60% Law + 40% AI)"
                    : "Chấm điểm Hybrid (60% Luật + 40% AI)"
                  : `${lang === "EN" ? "Source" : "Nguồn"}: ${analysisSource}`}
              </span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#334e68] dark:text-[#cbd5e1] leading-relaxed">
            {overview ||
              (lang === "EN"
                ? "This report cross-checked every clause in the contract against Vietnamese statutory regulations."
                : "Báo cáo đã đối chiếu từng điều khoản trong hợp đồng với hệ thống văn bản quy phạm pháp luật Việt Nam.")}
          </p>

          {/* Mini Severity Counters */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-[#fff1f0]/70 dark:bg-red-950/35 border border-[#ffd1cc] dark:border-red-900/50 text-center">
              <div className="text-sm font-extrabold text-[#c83a32] dark:text-red-400">
                {highCount}
              </div>
              <div className="text-[10px] font-semibold text-[#a6312b] dark:text-red-300">
                {lang === "EN" ? "High Risk" : "Rủi ro cao"}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#fff8e6]/80 dark:bg-amber-950/35 border border-[#ffe3a3] dark:border-amber-900/50 text-center">
              <div className="text-sm font-extrabold text-[#b8620d] dark:text-amber-400">
                {mediumCount}
              </div>
              <div className="text-[10px] font-semibold text-[#996324] dark:text-amber-300">
                {lang === "EN" ? "Clarify" : "Cần làm rõ"}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#eafbf7]/70 dark:bg-emerald-950/35 border border-[#b7f6e5] dark:border-emerald-900/50 text-center">
              <div className="text-sm font-extrabold text-[#0d7a5f] dark:text-emerald-400">
                {lowCount}
              </div>
              <div className="text-[10px] font-semibold text-[#159f7b] dark:text-emerald-300">
                {lang === "EN" ? "Low Note" : "Lưu ý nhẹ"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clause Heatmap Bar (Interactive Clause Map) */}
      {findings.length > 0 && (
        <div className="pt-3 border-t border-[#e6edf4] dark:border-[#1e3456] space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-[#94a3b8]">
              {lang === "EN"
                ? `Clause Risk Heatmap (${findings.length} items)`
                : `Bản đồ nhiệt rủi ro theo từng điều khoản (${findings.length} mục)`}
            </span>
            <span className="text-[11px] text-[#8297ac] dark:text-[#94a3b8]">
              {lang === "EN"
                ? "Click a color block to jump to that clause"
                : "Nhấn vào ô màu để mở nhanh điều khoản tương ứng"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 h-3.5 w-full rounded-lg overflow-hidden bg-[#f1f5f9] dark:bg-[#13233f] p-0.5">
            {findings.map((item, idx) => {
              const bucket = getClauseBucket(item);
              const cScore = getClauseScore(item);
              const title =
                item.title ??
                item.target_section ??
                item.matched_term ??
                (lang === "EN" ? `Clause #${idx + 1}` : `Điều khoản #${idx + 1}`);
              const bgClass =
                bucket === "high"
                  ? "bg-[#e4534b] hover:bg-[#c83a32]"
                  : bucket === "medium"
                    ? "bg-[#d77714] hover:bg-[#b8620d]"
                    : "bg-[#159f7b] hover:bg-[#0d7a5f]";

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectClauseIndex?.(idx)}
                  title={`${title} — ${lang === "EN" ? "Risk Score" : "Điểm rủi ro"}: ${cScore}/100`}
                  className={`h-full flex-1 rounded-xs transition-all cursor-pointer ${bgClass}`}
                />
              );
            })}
          </div>

          {/* Filter Pills */}
          {onFilterChange && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => onFilterChange("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  activeFilter === "all"
                    ? "bg-[#10253f] dark:bg-[#EAD7B8] text-white dark:text-[#10253f] border-[#10253f] dark:border-[#EAD7B8]"
                    : "bg-[#f8fafd] dark:bg-[#13233f] text-[#49627d] dark:text-[#cbd5e1] border-[#d8e3ef] dark:border-[#243d63] hover:border-[#EAD7B8]"
                }`}
              >
                {lang === "EN" ? `All (${findings.length})` : `Tất cả (${findings.length})`}
              </button>
              <button
                type="button"
                onClick={() => onFilterChange("high")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  activeFilter === "high"
                    ? "bg-[#e4534b] text-white border-[#e4534b]"
                    : "bg-[#fff1f0] dark:bg-red-950/40 text-[#c83a32] dark:text-red-300 border-[#ffd1cc] dark:border-red-900/50 hover:bg-[#ffe3e0]"
                }`}
              >
                {lang === "EN" ? `High Risk (${highCount})` : `Rủi ro cao (${highCount})`}
              </button>
              <button
                type="button"
                onClick={() => onFilterChange("medium")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  activeFilter === "medium"
                    ? "bg-[#d77714] text-white border-[#d77714]"
                    : "bg-[#fff8e6] dark:bg-amber-950/40 text-[#b8620d] dark:text-amber-300 border-[#ffe3a3] dark:border-amber-900/50 hover:bg-[#ffe8cc]"
                }`}
              >
                {lang === "EN" ? `Clarify (${mediumCount})` : `Cần làm rõ (${mediumCount})`}
              </button>
              <button
                type="button"
                onClick={() => onFilterChange("low")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  activeFilter === "low"
                    ? "bg-[#159f7b] text-white border-[#159f7b]"
                    : "bg-[#eafbf7] dark:bg-emerald-950/40 text-[#0d7a5f] dark:text-emerald-300 border-[#b7f6e5] dark:border-emerald-900/50 hover:bg-[#d3f9eb]"
                }`}
              >
                {lang === "EN" ? `Low Note (${lowCount})` : `Lưu ý nhẹ (${lowCount})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
