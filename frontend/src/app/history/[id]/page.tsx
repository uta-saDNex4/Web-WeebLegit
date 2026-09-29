"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Sparkles,
  BookOpen,
  MessageCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AuthProvider, useAuth } from "../../../lib/auth-context";
import * as api from "../../../lib/api";
import { AuthModal } from "../../../components/AuthModal";
import {
  RiskGaugeAndHeatmap,
  RiskFilterType,
  getClauseBucket,
} from "../../../components/RiskGaugeAndHeatmap";

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function HistoryDetailContent() {
  const params = useParams<{ id: string }>();
  const contractId = params?.id ?? "";

  const { user, loading: authLoading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [contract, setContract] = useState<api.ContractResponse | null>(null);
  const [analyses, setAnalyses] = useState<api.AnalysisHistoryItem[]>([]);
  const [selectedRunIdx, setSelectedRunIdx] = useState(0);
  const [verifications, setVerifications] = useState<api.VerificationLogResponse[]>([]);

  const [loading, setLoading] = useState(false);
  const [reVerifying, setReVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskFilterType>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHashDetails, setShowHashDetails] = useState(false);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadContractDetail = useCallback(async () => {
    if (!user || !contractId) return;
    setLoading(true);
    setError(null);
    try {
      const [c, aList, vList] = await Promise.all([
        api.getContract(contractId),
        api.getContractAnalysisHistory(contractId),
        api.getVerificationHistory(contractId),
      ]);
      setContract(c);
      setAnalyses(aList);
      setSelectedRunIdx(0);
      setVerifications(vList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải chi tiết phần chấm của hợp đồng");
    } finally {
      setLoading(false);
    }
  }, [user, contractId]);

  useEffect(() => {
    if (user && contractId) {
      void loadContractDetail();
    }
  }, [user, contractId, loadContractDetail]);

  const handleReVerifyAndAnalyze = async () => {
    if (!contractId) return;
    setReVerifying(true);
    setError(null);
    try {
      const vRes = await api.verifyContract(contractId);
      // Poll up to 6 times for the background AI task to persist
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => setTimeout(r, 1200));
        const res = await api.getAiAnalysis(contractId, vRes.verification_log_id);
        if (res.status === "completed") break;
      }
      await loadContractDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi chấm lại hợp đồng");
    } finally {
      setReVerifying(false);
    }
  };

  const selectedAnalysis = analyses[selectedRunIdx] ?? null;
  const findingsList =
    selectedAnalysis?.findings ?? selectedAnalysis?.ai_findings ?? [];
  const scoreVal = Math.round(selectedAnalysis?.risk_score ?? 0);

  return (
    <div className="min-h-screen bg-[#FAF6EF] text-[#10253f]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF6EF]/90 backdrop-blur-md border-b border-[#d8e3ef]">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/history"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#d8e3ef] hover:border-[#EAD7B8] text-xs sm:text-sm font-semibold text-[#10253f] transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#8a6834]" />
              <span>Quay lại Lịch sử</span>
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#8297ac] uppercase tracking-wider">
                Chi tiết kết quả chấm hợp đồng
              </p>
              <h1 className="text-sm sm:text-base font-extrabold text-[#10253f] truncate">
                {contract?.original_filename ?? "Đang tải hợp đồng..."}
              </h1>
            </div>
          </div>

          {user && contract && (
            <button
              onClick={handleReVerifyAndAnalyze}
              disabled={reVerifying}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAD7B8] hover:bg-[#d8bf97] disabled:opacity-60 text-xs font-bold text-[#10253f] transition-all cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reVerifying ? "animate-spin" : ""}`} />
              <span>{reVerifying ? "Đang chấm lại..." : "Chấm & Xác thực lại"}</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {authLoading || loading ? (
          <div className="p-12 rounded-2xl bg-white border border-[#d8e3ef] flex items-center justify-center gap-3 text-[#8297ac]">
            <div className="w-6 h-6 rounded-full border-2 border-[#EAD7B8] border-t-transparent animate-spin" />
            <span className="text-sm font-medium">Đang tải dữ liệu phân tích hợp đồng...</span>
          </div>
        ) : !user ? (
          <div className="p-12 rounded-2xl bg-white border border-[#d8e3ef] text-center max-w-md mx-auto space-y-4">
            <Lock className="w-8 h-8 text-[#8a6834] mx-auto" />
            <h2 className="text-lg font-extrabold text-[#10253f]">
              Vui lòng đăng nhập để xem báo cáo chấm hợp đồng
            </h2>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-2.5 bg-[#EAD7B8] hover:bg-[#d8bf97] text-[#10253f] font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-[#fff1f0] border border-[#ffd1cc] text-sm text-[#e4534b] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : contract ? (
          <>
            {/* Contract Overview Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF5ED] border border-[#EAD7B8]/60 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#8a6834]" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#10253f]">
                      {contract.original_filename}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8297ac] mt-1">
                      <span>Kích thước: {formatBytes(contract.file_size_bytes)}</span>
                      <span>MIME: {contract.mime_type}</span>
                      {contract.contract_type && <span>Loại: {contract.contract_type}</span>}
                      <span>Ngày tải lên: {formatDate(contract.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                      contract.status === "verified"
                        ? "bg-[#eafbf7] text-[#0d7a5f] border-[#b7f6e5]"
                        : "bg-[#f2f7fc] text-[#49627d] border-[#d8e3ef]"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Trạng thái: {contract.status}
                    </span>
                  </span>
                  <button
                    onClick={() => setShowHashDetails(!showHashDetails)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#f8fafd] hover:bg-[#eef3f8] text-[#49627d] border border-[#d8e3ef] cursor-pointer"
                  >
                    {showHashDetails ? "Ẩn SHA-256" : "Xem SHA-256"}
                  </button>
                </div>
              </div>

              {showHashDetails && (
                <div className="p-3.5 rounded-xl bg-[#f8fafd] border border-[#d8e3ef] space-y-2">
                  <p className="text-[11px] font-bold text-[#8297ac] uppercase">
                    Mã băm toàn vẹn tệp (SHA-256)
                  </p>
                  <code className="text-xs font-mono text-[#10253f] bg-white px-3 py-1.5 rounded-lg border border-[#d8e3ef] block break-all">
                    {contract.sha256_hash}
                  </code>
                </div>
              )}
            </div>

            {/* Multiple Analysis Runs Selector (Timeline) */}
            {analyses.length > 1 && (
              <div className="p-4 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8a6834]" />
                    <span>Lịch sử các lần chấm của hợp đồng này ({analyses.length} lần)</span>
                  </h3>
                  <span className="text-[11px] text-[#159f7b] font-semibold">
                    ✓ Điểm số đồng nhất nhờ cơ chế Hybrid &amp; SHA-256
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {analyses.map((run, idx) => (
                    <button
                      key={run.id}
                      onClick={() => setSelectedRunIdx(idx)}
                      className={`px-3.5 py-2 rounded-xl text-left border transition-all shrink-0 cursor-pointer ${
                        selectedRunIdx === idx
                          ? "bg-[#10253f] text-white border-[#10253f]"
                          : "bg-[#f8fafd] text-[#49627d] border-[#d8e3ef] hover:border-[#EAD7B8]"
                      }`}
                    >
                      <div className="text-xs font-bold">
                        Lần chấm #{analyses.length - idx}{" "}
                        {idx === 0 ? "(Mới nhất)" : ""} — {Math.round(run.risk_score)}/100 điểm
                      </div>
                      <div
                        className={`text-[10px] ${
                          selectedRunIdx === idx ? "text-slate-300" : "text-[#8297ac]"
                        }`}
                      >
                        {formatDate(run.created_at)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main AI Risk Report Section */}
            {selectedAnalysis ? (
              <div className="space-y-5">
                {/* Circular SVG Risk Gauge + Clause Heatmap Bar */}
                <RiskGaugeAndHeatmap
                  score={scoreVal}
                  riskLabel={selectedAnalysis.risk_label}
                  overview={selectedAnalysis.overview || selectedAnalysis.ai_overview}
                  analysisSource={selectedAnalysis.analysis_source}
                  findings={findingsList}
                  activeFilter={riskFilter}
                  onFilterChange={setRiskFilter}
                  onSelectClauseIndex={(idx) => {
                    setRiskFilter("all");
                    setExpandedRisk(idx);
                  }}
                />

                {/* Per-Clause Breakdown */}
                {(() => {
                  const filteredFindings = findingsList
                    .map((item, originalIdx) => ({ item, originalIdx }))
                    .filter(({ item }) =>
                      riskFilter === "all" ? true : getClauseBucket(item) === riskFilter
                    );

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#8a6834]" />
                          <h3 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">
                            Chi tiết mức độ rủi ro từng điều khoản ({filteredFindings.length}/{findingsList.length})
                          </h3>
                        </div>
                        {findingsList.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRisk(expandedRisk === -99 ? null : -99)
                            }
                            className="text-xs font-semibold text-[#8a6834] hover:underline cursor-pointer"
                          >
                            {expandedRisk === -99 ? "Thu gọn bớt" : "Mở tất cả điều khoản"}
                          </button>
                        )}
                      </div>

                      {filteredFindings.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-[#eafbf7] border border-[#b7f6e5] flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-[#159f7b] shrink-0" />
                          <p className="text-sm font-semibold text-[#0d7a5f]">
                            Không có điều khoản nào thuộc nhóm bộ lọc này.
                          </p>
                        </div>
                      ) : (
                        filteredFindings.map(({ item: risk, originalIdx: idx }) => {
                          const level = (risk.risk_level ?? risk.severity ?? "medium").toLowerCase();
                          const clauseScore =
                            risk.clause_risk_score ??
                            (level === "critical"
                              ? 90
                              : level === "high"
                                ? 70
                                : level === "medium"
                                  ? 45
                                  : 20);
                          const titleText =
                            risk.title ??
                            risk.target_section ??
                            risk.matched_term ??
                            `Điều khoản #${idx + 1}`;
                          const quoteText = risk.clause_text ?? risk.matched_term;
                          const analysisText = risk.analysis ?? risk.warning;
                          const lawRef = risk.law_reference ?? risk.reference;
                          const isOpen =
                            expandedRisk === -99 ||
                            expandedRisk === idx ||
                            (expandedRisk === null && idx === 0);

                          return (
                            <div
                              key={idx}
                              className="p-5 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm"
                            >
                              <div
                                className="flex items-center justify-between cursor-pointer gap-3"
                                onClick={() =>
                                  setExpandedRisk(isOpen && expandedRisk !== -99 ? -1 : idx)
                                }
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  {level === "critical" ? (
                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#fff1f0] text-[#c92a2a] border border-[#ffa8a8]">
                                      Rủi ro nghiêm trọng
                                    </span>
                                  ) : level === "high" ? (
                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#fff1f0] text-[#e4534b] border border-[#ffd1cc]">
                                      Mức rủi ro cao
                                    </span>
                                  ) : level === "medium" ? (
                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#fff4e6] text-[#d77714] border border-[#ffd8a8]">
                                      Cần làm rõ
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#f2f7fc] text-[#49627d] border border-[#d8e3ef]">
                                      Lưu ý nhẹ
                                    </span>
                                  )}

                                  <span
                                    className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold border ${
                                      clauseScore >= 70
                                        ? "bg-[#fff1f0] text-[#e4534b] border-[#ffd1cc]"
                                        : clauseScore >= 40
                                          ? "bg-[#fff4e6] text-[#d77714] border-[#ffd8a8]"
                                          : "bg-[#eafbf7] text-[#159f7b] border-[#b7f6e5]"
                                    }`}
                                  >
                                    Điểm điều khoản: {Math.round(clauseScore)}/100
                                  </span>

                                  <h4 className="text-sm sm:text-base font-bold text-[#10253f]">
                                    {titleText}
                                  </h4>
                                </div>

                                {isOpen ? (
                                  <ChevronUp className="w-4 h-4 text-[#8297ac] shrink-0" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-[#8297ac] shrink-0" />
                                )}
                              </div>

                              {/* Progress bar */}
                              <div className="mt-3 h-2 bg-[#f0f4f8] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    clauseScore >= 70
                                      ? "bg-[#e4534b]"
                                      : clauseScore >= 40
                                        ? "bg-[#d77714]"
                                        : "bg-[#159f7b]"
                                  }`}
                                  style={{ width: `${Math.min(100, clauseScore)}%` }}
                                />
                              </div>

                              <AnimatePresence>
                                {isOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pt-4 space-y-3">
                                      {quoteText && (
                                        <div className="p-3.5 bg-[#f8fafd] rounded-xl text-xs sm:text-sm text-[#26435e] italic border-l-3 border-[#EAD7B8]">
                                          &quot;{quoteText}&quot;
                                        </div>
                                      )}
                                      {analysisText && (
                                        <div className="text-xs sm:text-sm text-[#49627d] leading-relaxed">
                                          <strong>Phân tích &amp; Khuyến nghị:</strong> {analysisText}
                                        </div>
                                      )}
                                      {lawRef && (
                                        <div className="text-xs sm:text-sm text-[#8a6834] font-semibold flex items-center justify-between gap-2 flex-wrap bg-[#FAF5ED] px-3.5 py-2.5 rounded-xl border border-[#EAD7B8]/70">
                                          <span className="flex items-center gap-1.5">
                                            <BookOpen className="w-4 h-4 shrink-0" />
                                            <span>Căn cứ pháp lý: <strong>{lawRef}</strong></span>
                                          </span>
                                          <a
                                            href={`https://thuvienphapluat.vn/page/tim-van-ban.aspx?keyword=${encodeURIComponent(lawRef)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-bold text-[#10253f] hover:text-[#8a6834] underline"
                                          >
                                            <span>Tra cứu điều luật gốc</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        </div>
                                      )}
                                  {risk.negotiation_script && (
                                    <div className="pt-3 border-t border-[#e6edf4]">
                                      <div className="flex items-center justify-between text-xs font-bold text-[#159f7b] mb-1.5">
                                        <span className="flex items-center gap-1.5">
                                          <MessageCircle className="w-3.5 h-3.5" />
                                          Gợi ý câu trao đổi / đàm phán:
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleCopy(`risk-${idx}`, risk.negotiation_script ?? "")
                                          }
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#eafbf7] hover:bg-[#d0f5ec] text-[#159f7b] border border-[#b7f6e5] transition-colors cursor-pointer"
                                        >
                                          {copiedId === `risk-${idx}` ? (
                                            <>
                                              <Check className="w-3.5 h-3.5" />
                                              <span>Đã sao chép</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3.5 h-3.5" />
                                              <span>Sao chép mẫu câu</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <p className="text-xs sm:text-sm text-[#26435e] bg-[#f7fafc] p-3 rounded-xl border border-[#e6edf4]">
                                        &quot;{risk.negotiation_script}&quot;
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })()}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white border border-[#d8e3ef] text-center space-y-3">
                <p className="text-sm text-[#49627d]">
                  Hợp đồng này chưa có bản lưu kết quả chấm. Hãy bấm nút{" "}
                  <strong>&quot;Chấm &amp; Xác thực lại&quot;</strong> ở góc trên để tạo báo cáo ngay.
                </p>
              </div>
            )}

            {/* Audit Log History (SHA-256 Verifications) */}
            {verifications.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#159f7b]" />
                  <span>Nhật ký xác thực toàn vẹn SHA-256 ({verifications.length} lượt)</span>
                </h3>
                <div className="space-y-2">
                  {verifications.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl bg-[#f8fafd] border border-[#e6edf4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            v.result === "matched"
                              ? "bg-[#eafbf7] text-[#0d7a5f]"
                              : "bg-[#fff1f0] text-[#e4534b]"
                          }`}
                        >
                          {v.result === "matched" ? "Khớp SHA-256" : v.result}
                        </span>
                        <span className="text-[#49627d] font-mono truncate max-w-[260px]">
                          {v.actual_sha256}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[#8297ac]">
                        {v.duration_ms != null && <span>{v.duration_ms} ms</span>}
                        <span>{formatDate(v.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function HistoryDetailPage() {
  return (
    <AuthProvider>
      <HistoryDetailContent />
    </AuthProvider>
  );
}
