"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  RefreshCw,
  MessageCircle,
  ShieldCheck,
  Lock,
  List,
  BarChart2,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../lib/auth-context";
import * as api from "../lib/api";
import {
  RiskGaugeAndHeatmap,
  RiskFilterType,
  getClauseBucket,
} from "./RiskGaugeAndHeatmap";

interface ContractCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNeedAuth: () => void;
}

type Stage = "upload" | "uploading" | "verifying" | "result";
type ActiveTab = "check" | "history" | "market";

interface UploadedContract {
  id: string;
  filename: string;
  sha256_hash: string;
  file_size_bytes: number;
  status: string;
}

interface VerifyResult {
  result: "matched" | "mismatched" | "failed";
  expected_sha256: string;
  actual_sha256: string;
  duration_ms: number | null;
  verification_log_id: string;
}

export const ContractCheckerModal: React.FC<ContractCheckerModalProps> = ({
  isOpen,
  onClose,
  onNeedAuth,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("check");
  const [stage, setStage] = useState<Stage>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedContract, setUploadedContract] =
    useState<UploadedContract | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // AI Analysis state
  const [aiResult, setAiResult] = useState<api.AiAnalysisResult | null>(null);
  const [aiPolling, setAiPolling] = useState(false);
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskFilterType>("all");
  const [showHashDetails, setShowHashDetails] = useState(false);

  // History tab state
  const [contracts, setContracts] = useState<api.ContractResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Market compare tab state
  const [marketResult, setMarketResult] = useState<api.MarketComparisonResponse | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [marketDistrict, setMarketDistrict] = useState("");
  const [marketRent, setMarketRent] = useState("");

  const resetAll = () => {
    setStage("upload");
    setSelectedFile(null);
    setUploadedContract(null);
    setVerifyResult(null);
    setError(null);
    setAiResult(null);
    setAiPolling(false);
    setExpandedRisk(null);
    setRiskFilter("all");
    setShowHashDetails(false);
    setMarketResult(null);
    setMarketError(null);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // Poll AI analysis result every 3s up to 10 tries
  const pollAiAnalysis = (contractId: string, logId: string) => {
    setAiPolling(true);
    let attempts = 0;
    const maxAttempts = 10;
    const poll = async () => {
      if (attempts >= maxAttempts) { setAiPolling(false); return; }
      attempts++;
      try {
        const result = await api.getAiAnalysis(contractId, logId);
        if (result.status === "completed") {
          setAiResult(result);
          setAiPolling(false);
        } else {
          setTimeout(poll, 3000);
        }
      } catch { setAiPolling(false); }
    };
    setTimeout(poll, 2000);
  };

  const handleUploadAndVerify = async () => {
    if (!user) { onNeedAuth(); return; }
    if (!selectedFile) return;
    setError(null);
    try {
      setStage("uploading");
      const contract = await api.uploadContract(selectedFile);
      setUploadedContract({
        id: contract.id,
        filename: contract.original_filename,
        sha256_hash: contract.sha256_hash,
        file_size_bytes: contract.file_size_bytes,
        status: contract.status,
      });
      setStage("verifying");
      const vResult = await api.verifyContract(contract.id);
      setVerifyResult({
        result: vResult.result,
        expected_sha256: vResult.expected_sha256,
        actual_sha256: vResult.actual_sha256,
        duration_ms: vResult.duration_ms,
        verification_log_id: vResult.verification_log_id,
      });
      setStage("result");
      // Start polling AI analysis in background
      pollAiAnalysis(contract.id, vResult.verification_log_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setStage("upload");
    }
  };

  // Load history when switching to history tab
  useEffect(() => {
    if (activeTab === "history" && user) {
      setHistoryLoading(true);
      setHistoryError(null);
      api.listContracts({ limit: 20 })
        .then((res) => setContracts(res.items))
        .catch((err) => setHistoryError(err instanceof Error ? err.message : "Không tải được lịch sử"))
        .finally(() => setHistoryLoading(false));
    }
  }, [activeTab, user]);

  const handleMarketCompare = async () => {
    if (!uploadedContract) return;
    setMarketLoading(true);
    setMarketError(null);
    try {
      const res = await api.marketCompare(uploadedContract.id, {
        district: marketDistrict || undefined,
        base_rent: marketRent ? parseFloat(marketRent) : undefined,
      });
      setMarketResult(res);
    } catch (err: unknown) {
      setMarketError(err instanceof Error ? err.message : "Không thể so sánh");
    } finally {
      setMarketLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: "check", label: "Kiểm tra", icon: <ShieldCheck className="w-4 h-4" /> },
    { key: "history", label: "Lịch sử", icon: <List className="w-4 h-4" /> },
    ...(uploadedContract ? [{ key: "market" as ActiveTab, label: "Thị trường", icon: <BarChart2 className="w-4 h-4" /> }] : []),
  ];

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl border border-[#d8e3ef] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-6"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e6edf4] flex items-center justify-between bg-[#f8fafd]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#10253f]">Trình kiểm tra & Xác thực hợp đồng</h3>
              <p className="text-xs text-[#8297ac]">Upload hợp đồng để tính SHA-256 & phân tích AI</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-[#8297ac] hover:text-[#10253f] hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs — only shown when logged in */}
        {user && (
          <div className="px-6 flex gap-1 bg-[#f8fafd] border-b border-[#e6edf4]">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer border-b-2 -mb-px ${activeTab === tab.key ? "border-[#8a6834] text-[#8a6834]" : "border-transparent text-[#49627d] hover:text-[#10253f]"
                  }`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">

          {/* ── Chưa đăng nhập ── */}
          {!user && (
            <div className="p-5 rounded-xl bg-[#f2f7fc] border border-[#d8e3ef] flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#EAD7B8]/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#8a6834]" />
              </div>
              <div>
                <p className="font-semibold text-[#10253f] text-sm">Cần đăng nhập để sử dụng</p>
                <p className="text-xs text-[#8297ac] mt-0.5">Tạo tài khoản miễn phí để upload và xác thực hợp đồng</p>
              </div>
              <button onClick={onNeedAuth} className="inline-flex items-center gap-2 px-4 py-2 bg-[#EAD7B8] text-[#10253f] text-sm font-semibold rounded-xl shadow-sm hover:bg-[#dfc59f] transition-colors cursor-pointer">
                <ShieldCheck className="w-4 h-4" /> Đăng nhập / Đăng ký
              </button>
            </div>
          )}

          {/* ═══ TAB: CHECK ═══ */}
          {user && activeTab === "check" && (
            <>
              {/* 4-Step Progress Stepper (DocuSign / Ironclad style) */}
              {(() => {
                const currentStep =
                  stage === "upload"
                    ? 1
                    : stage === "uploading" || stage === "verifying"
                      ? 2
                      : aiPolling && !aiResult
                        ? 3
                        : 4;
                const steps = [
                  { id: 1, label: "1. Tải hợp đồng" },
                  { id: 2, label: "2. Xác thực SHA-256" },
                  { id: 3, label: "3. Chấm điểm Hybrid AI" },
                  { id: 4, label: "4. Báo cáo điều khoản" },
                ];
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-xl bg-[#f8fafd] border border-[#e6edf4]">
                    {steps.map((s) => {
                      const isDone = currentStep > s.id || (s.id === 4 && stage === "result" && Boolean(aiResult));
                      const isActive = currentStep === s.id && !isDone;
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isDone
                              ? "bg-[#eafbf7] text-[#0d7a5f] border border-[#b7f6e5]"
                              : isActive
                                ? "bg-[#10253f] text-white shadow-2xs"
                                : "bg-white text-[#94a3b8] border border-[#e6edf4]"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                              isDone
                                ? "bg-[#159f7b] text-white"
                                : isActive
                                  ? "bg-[#EAD7B8] text-[#10253f]"
                                  : "bg-[#f1f5f9] text-[#94a3b8]"
                            }`}
                          >
                            {isDone ? "✓" : s.id}
                          </span>
                          <span className="truncate">{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {stage === "upload" && (
                <>
                  <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging ? "border-[#EAD7B8] bg-[#EAD7B8]/10" : selectedFile ? "border-[#159f7b] bg-[#eafbf7]" : "border-[#b9cadd] hover:border-[#EAD7B8] bg-[#f8fafd]/80"}`}>
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                    {selectedFile ? (<>
                      <FileText className="w-9 h-9 text-[#159f7b] mx-auto mb-2" />
                      <p className="font-bold text-sm text-[#10253f]">{selectedFile.name}</p>
                      <p className="text-xs text-[#8297ac] mt-1">{formatBytes(selectedFile.size)} • Nhấn để đổi file</p>
                    </>) : (<>
                      <UploadCloud className="w-9 h-9 text-[#8a6834] mx-auto mb-2" />
                      <p className="font-bold text-sm text-[#10253f] mb-1">Kéo thả hoặc nhấn để chọn file</p>
                      <p className="text-xs text-[#8297ac]">Hỗ trợ PDF, DOCX, DOC, TXT (tối đa 20MB)</p>
                    </>)}
                  </div>
                  {error && <div className="px-3 py-2 bg-[#fff1f0] border border-[#ffd1cc] rounded-lg text-xs text-[#e4534b] font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
                  {selectedFile && user && (
                    <button onClick={handleUploadAndVerify} className="w-full py-3 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer">
                      <ShieldCheck className="w-4 h-4" /> Upload & Xác thực SHA-256 <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}

              {(stage === "uploading" || stage === "verifying") && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative w-16 h-16">
                    <div className="w-16 h-16 rounded-full border-4 border-[#d8e3ef]" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#EAD7B8] border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {stage === "uploading" ? <UploadCloud className="w-6 h-6 text-[#8a6834]" /> : <ShieldCheck className="w-6 h-6 text-[#8a6834]" />}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-[#10253f] text-sm">{stage === "uploading" ? "Đang tải lên & tính SHA-256..." : "Đang xác thực toàn vẹn file..."}</p>
                    <p className="text-xs text-[#8297ac] mt-1">{stage === "uploading" ? "Server đang hash file của bạn" : "So sánh hash constant-time"}</p>
                  </div>
                </div>
              )}

              {stage === "result" && uploadedContract && verifyResult && (
                <div className="space-y-5">
                  {/* Verification badge with Progressive Disclosure toggle for SHA-256 */}
                  <div className={`p-4 rounded-xl border space-y-3 ${verifyResult.result === "matched" ? "bg-[#eafbf7] border-[#b7f6e5]" : verifyResult.result === "mismatched" ? "bg-[#fff1f0] border-[#ffd1cc]" : "bg-[#fff8e6] border-[#ffe3a3]"}`}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${verifyResult.result === "matched" ? "bg-[#159f7b]/15" : verifyResult.result === "mismatched" ? "bg-[#e4534b]/15" : "bg-[#d77714]/15"}`}>
                          {verifyResult.result === "matched" ? <CheckCircle2 className="w-6 h-6 text-[#159f7b]" /> : verifyResult.result === "mismatched" ? <ShieldAlert className="w-6 h-6 text-[#e4534b]" /> : <AlertTriangle className="w-6 h-6 text-[#d77714]" />}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${verifyResult.result === "matched" ? "text-[#0d7a5f]" : verifyResult.result === "mismatched" ? "text-[#b91c1c]" : "text-[#7d480e]"}`}>
                            {verifyResult.result === "matched" && "✅ File hợp lệ — SHA-256 khớp"}
                            {verifyResult.result === "mismatched" && "⚠️ Cảnh báo — File đã bị thay đổi"}
                            {verifyResult.result === "failed" && "❌ Xác thực thất bại"}
                          </p>
                          <p className="text-xs text-[#49627d] mt-0.5">
                            📁 <strong>{uploadedContract.filename}</strong> ({formatBytes(uploadedContract.file_size_bytes)})
                            {verifyResult.duration_ms != null ? ` • ${verifyResult.duration_ms}ms` : ""}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowHashDetails((v) => !v)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/90 hover:bg-white text-[#10253f] border border-[#d8e3ef] transition-colors cursor-pointer shrink-0"
                      >
                        {showHashDetails ? "Ẩn mã SHA-256" : "Chi tiết SHA-256"}
                      </button>
                    </div>

                    {showHashDetails && (
                      <div className="p-3.5 rounded-xl bg-white/95 border border-[#d8e3ef] space-y-2 text-left">
                        <div>
                          <p className="text-[11px] font-semibold text-[#49627d] mb-1">Hash lưu trữ (expected):</p>
                          <code className="text-[10px] font-mono text-[#10253f] bg-[#f8fafd] px-2 py-1 rounded-lg border border-[#d8e3ef] break-all block">{verifyResult.expected_sha256}</code>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-[#49627d] mb-1">Hash xác thực (actual):</p>
                          <code className={`text-[10px] font-mono px-2 py-1 rounded-lg border break-all block ${verifyResult.result === "matched" ? "text-[#159f7b] bg-[#eafbf7] border-[#b7f6e5]" : "text-[#e4534b] bg-[#fff1f0] border-[#ffd1cc]"}`}>{verifyResult.actual_sha256}</code>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Analysis Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#8a6834]" />
                        <h4 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">Báo cáo Chấm điểm Rủi ro &amp; Điều khoản</h4>
                      </div>
                      {aiPolling && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fff8e6] text-[#d77714] text-[11px] font-semibold border border-[#ffe3a3]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d77714] animate-pulse" /> AI đang phân tích...
                        </span>
                      )}
                    </div>

                    {aiPolling && !aiResult && (
                      <div className="p-4 rounded-xl bg-[#fff8e6] border border-[#ffe3a3] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-[#d77714] border-t-transparent animate-spin shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-[#7d480e]">AI đang quét từng điều khoản hợp đồng...</p>
                          <p className="text-xs text-[#996324] mt-0.5">Đối chiếu Bộ luật Dân sự 2015 &amp; Bộ luật Lao động 2019</p>
                        </div>
                      </div>
                    )}

                    {aiResult && aiResult.status === "completed" && (() => {
                      const findingsList = aiResult.findings ?? aiResult.ai_findings ?? [];
                      const overviewText = aiResult.overview ?? aiResult.ai_overview ?? "";
                      const scoreVal = Math.round(aiResult.risk_score ?? 0);

                      const filteredFindings = findingsList
                        .map((item, originalIdx) => ({ item, originalIdx }))
                        .filter(({ item }) =>
                          riskFilter === "all" ? true : getClauseBucket(item) === riskFilter
                        );

                      return (
                        <>
                          {/* Circular SVG Risk Gauge + Interactive Clause Heatmap */}
                          <RiskGaugeAndHeatmap
                            score={scoreVal}
                            riskLabel={aiResult.risk_label}
                            overview={overviewText}
                            analysisSource={aiResult.analysis_source}
                            findings={findingsList}
                            activeFilter={riskFilter}
                            onFilterChange={setRiskFilter}
                            onSelectClauseIndex={(idx) => {
                              setRiskFilter("all");
                              setExpandedRisk(idx);
                            }}
                          />

                          {filteredFindings.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">
                                  Chi tiết mức độ rủi ro từng điều khoản ({filteredFindings.length}/{findingsList.length})
                                </h4>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedRisk(expandedRisk === -99 ? null : -99)
                                  }
                                  className="text-xs font-semibold text-[#8a6834] hover:underline cursor-pointer"
                                >
                                  {expandedRisk === -99 ? "Thu gọn bớt" : "Mở tất cả điều khoản"}
                                </button>
                              </div>

                              {filteredFindings.map(({ item: risk, originalIdx: idx }) => {
                                const level = (risk.risk_level ?? risk.severity ?? "medium").toLowerCase();
                                const clauseScore = risk.clause_risk_score ?? (level === "critical" ? 90 : level === "high" ? 70 : level === "medium" ? 45 : 20);
                                const titleText = risk.title ?? risk.target_section ?? risk.matched_term ?? `Điều khoản #${idx + 1}`;
                                const quoteText = risk.clause_text ?? risk.matched_term;
                                const analysisText = risk.analysis ?? risk.warning;
                                const lawRef = risk.law_reference ?? risk.reference;
                                const isOpen =
                                  expandedRisk === -99 ||
                                  expandedRisk === idx ||
                                  (expandedRisk === null && idx === 0);

                                return (
                                  <div key={idx} className="p-4 rounded-xl bg-white border border-[#d8e3ef] shadow-sm">
                                    <div
                                      className="flex items-center justify-between cursor-pointer gap-2"
                                      onClick={() => setExpandedRisk(isOpen && expandedRisk !== -99 ? -1 : idx)}
                                    >
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {level === "critical" ? (
                                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fff1f0] text-[#c92a2a] border border-[#ffa8a8]">
                                            Rủi ro nghiêm trọng
                                          </span>
                                        ) : level === "high" ? (
                                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fff1f0] text-[#e4534b] border border-[#ffd1cc]">
                                            Mức rủi ro cao
                                          </span>
                                        ) : level === "medium" ? (
                                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fff4e6] text-[#d77714] border border-[#ffd8a8]">
                                            Cần làm rõ
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f2f7fc] text-[#49627d] border border-[#d8e3ef]">
                                            Lưu ý nhẹ
                                          </span>
                                        )}
                                        <span
                                          className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${
                                            clauseScore >= 70
                                              ? "bg-[#fff1f0] text-[#e4534b] border-[#ffd1cc]"
                                              : clauseScore >= 40
                                                ? "bg-[#fff4e6] text-[#d77714] border-[#ffd8a8]"
                                                : "bg-[#eafbf7] text-[#159f7b] border-[#b7f6e5]"
                                          }`}
                                        >
                                          Điểm rủi ro: {Math.round(clauseScore)}/100
                                        </span>
                                        <h5 className="text-sm font-bold text-[#10253f]">{titleText}</h5>
                                      </div>
                                      {isOpen ? (
                                        <ChevronUp className="w-4 h-4 text-[#8297ac] shrink-0" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-[#8297ac] shrink-0" />
                                      )}
                                    </div>
                                    {/* Clause risk progress bar */}
                                    <div className="mt-2.5 h-1.5 bg-[#f0f4f8] rounded-full overflow-hidden">
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
                                          <div className="pt-3 space-y-3">
                                            {quoteText && (
                                              <div className="p-3 bg-[#f8fafd] rounded-lg text-xs text-[#26435e] italic border-l-2 border-[#EAD7B8]">
                                                &quot;{quoteText}&quot;
                                              </div>
                                            )}
                                            {analysisText && (
                                              <div className="text-xs text-[#49627d] leading-relaxed">
                                                <strong>Phân tích:</strong> {analysisText}
                                              </div>
                                            )}
                                            {lawRef && (
                                              <div className="text-xs text-[#8a6834] font-medium flex items-center justify-between gap-2 flex-wrap bg-[#FAF5ED] px-3 py-2 rounded-lg border border-[#EAD7B8]/70">
                                                <span className="flex items-center gap-1.5">
                                                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                                                  <span>Căn cứ pháp lý: <strong>{lawRef}</strong></span>
                                                </span>
                                                <a
                                                  href={`https://thuvienphapluat.vn/page/tim-van-ban.aspx?keyword=${encodeURIComponent(lawRef)}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10253f] hover:text-[#8a6834] underline"
                                                >
                                                  <span>Tra cứu điều luật</span>
                                                  <ExternalLink className="w-3 h-3" />
                                                </a>
                                              </div>
                                            )}
                                            {risk.negotiation_script && (
                                              <div className="pt-2 border-t border-[#e6edf4]">
                                                <div className="flex items-center justify-between text-[11px] font-bold text-[#159f7b] mb-1.5">
                                                  <span className="flex items-center gap-1">
                                                    <MessageCircle className="w-3 h-3" />
                                                    Gợi ý câu trao đổi:
                                                  </span>
                                                  <button
                                                    onClick={() => handleCopy(`risk-${idx}`, risk.negotiation_script ?? "")}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#eafbf7] hover:bg-[#d0f5ec] text-[#159f7b] border border-[#b7f6e5] transition-colors cursor-pointer"
                                                  >
                                                    {copiedId === `risk-${idx}` ? (
                                                      <>
                                                        <Check className="w-3 h-3" />
                                                        <span>Đã sao chép</span>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Copy className="w-3 h-3" />
                                                        <span>Sao chép</span>
                                                      </>
                                                    )}
                                                  </button>
                                                </div>
                                                <p className="text-xs text-[#26435e] bg-[#f7fafc] p-2.5 rounded-lg border border-[#e6edf4]">
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
                              })}
                            </div>
                          )}

                          {findingsList.length === 0 && (
                            <div className="p-4 rounded-xl bg-[#eafbf7] border border-[#b7f6e5] flex items-center gap-3">
                              <CheckCircle2 className="w-6 h-6 text-[#159f7b] shrink-0" />
                              <p className="text-sm font-semibold text-[#0d7a5f]">
                                Không phát hiện điều khoản rủi ro đáng kể.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Link
                      href={`/history/${uploadedContract.id}`}
                      onClick={handleClose}
                      className="py-2.5 px-4 bg-[#10253f] hover:bg-[#1e3a5f] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Mở trang báo cáo đầy đủ</span>
                    </Link>
                    <button onClick={resetAll} className="py-2.5 px-4 border border-[#d8e3ef] text-sm font-semibold text-[#49627d] hover:text-[#10253f] hover:border-[#EAD7B8] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                      <RefreshCw className="w-4 h-4" /> Kiểm tra file khác
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══ TAB: HISTORY ═══ */}
          {user && activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Lịch sử hợp đồng của bạn
                </h4>
                <Link
                  href="/history"
                  onClick={handleClose}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#8a6834] hover:text-[#10253f] bg-[#FAF5ED] px-3 py-1.5 rounded-lg border border-[#EAD7B8]/60 transition-colors"
                >
                  <span>Mở trang Lịch sử đầy đủ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {historyLoading && (
                <div className="flex items-center justify-center py-10 gap-3 text-[#8297ac]">
                  <div className="w-6 h-6 rounded-full border-2 border-[#EAD7B8] border-t-transparent animate-spin" />
                  <span className="text-sm">Đang tải...</span>
                </div>
              )}
              {historyError && <div className="px-3 py-2 bg-[#fff1f0] border border-[#ffd1cc] rounded-lg text-xs text-[#e4534b] font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {historyError}</div>}
              {!historyLoading && !historyError && contracts.length === 0 && (
                <div className="p-8 rounded-xl bg-[#f8fafd] border border-[#d8e3ef] text-center text-sm text-[#8297ac]">
                  Bạn chưa upload hợp đồng nào. Hãy dùng tab <strong>Kiểm tra</strong> để bắt đầu.
                </div>
              )}
              {!historyLoading && contracts.map((contract) => (
                <div key={contract.id} className="p-4 rounded-xl bg-white border border-[#d8e3ef] hover:border-[#EAD7B8] shadow-sm space-y-2.5 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#8a6834] shrink-0" />
                      <p className="text-sm font-semibold text-[#10253f] truncate max-w-[260px]">{contract.original_filename}</p>
                    </div>
                    <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded border ${contract.status === "verified" ? "bg-[#eafbf7] text-[#0d7a5f] border-[#b7f6e5]" : "bg-[#f2f7fc] text-[#49627d] border-[#d8e3ef]"}`}>
                      {contract.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#8297ac]">
                    <span>{formatBytes(contract.file_size_bytes)}</span>
                    <span>{contract.mime_type}</span>
                    {contract.contract_type && <span>Loại: {contract.contract_type}</span>}
                    <span>{formatDate(contract.created_at)}</span>
                  </div>
                  <code className="text-[10px] font-mono text-[#49627d] bg-[#f8fafd] px-2 py-1 rounded border border-[#e6edf4] block truncate">SHA-256: {contract.sha256_hash}</code>
                  <div className="pt-1 flex items-center justify-end gap-2">
                    <button
                      onClick={async () => {
                        setUploadedContract({
                          id: contract.id,
                          filename: contract.original_filename,
                          sha256_hash: contract.sha256_hash,
                          file_size_bytes: contract.file_size_bytes,
                          status: contract.status,
                        });
                        setVerifyResult({
                          result: contract.status === "verified" ? "matched" : contract.status === "mismatch" ? "mismatched" : "failed",
                          expected_sha256: contract.sha256_hash,
                          actual_sha256: contract.sha256_hash,
                          duration_ms: null,
                          verification_log_id: "",
                        });
                        setStage("result");
                        setActiveTab("check");
                        setAiPolling(true);
                        try {
                          const hist = await api.getContractAnalysisHistory(contract.id);
                          if (hist.length > 0) {
                            setAiResult({
                              status: "completed",
                              risk_score: hist[0].risk_score,
                              risk_label: hist[0].risk_label,
                              overview: hist[0].overview,
                              ai_overview: hist[0].ai_overview,
                              findings: hist[0].findings,
                              ai_findings: hist[0].ai_findings,
                            });
                          }
                        } finally {
                          setAiPolling(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f8fafd] hover:bg-[#eef3f8] text-[#10253f] border border-[#d8e3ef] transition-colors cursor-pointer"
                    >
                      Xem nhanh tại đây
                    </button>
                    <Link
                      href={`/history/${contract.id}`}
                      onClick={handleClose}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#10253f] hover:bg-[#1e3a5f] text-white transition-colors"
                    >
                      <span>Xem chi tiết phần chấm</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ TAB: MARKET COMPARE ═══ */}
          {user && activeTab === "market" && uploadedContract && (
            <div className="space-y-5">
              <h4 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> So sánh giá thị trường
              </h4>
              <div className="p-4 rounded-xl bg-[#f8fafd] border border-[#d8e3ef] space-y-3">
                <p className="text-xs text-[#49627d]">So sánh điều khoản giá thuê trong hợp đồng <strong className="text-[#10253f]">{uploadedContract.filename}</strong> với giá thị trường sinh viên.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#49627d] mb-1">Quận / Khu vực</label>
                    <input type="text" placeholder="Ví dụ: Quận 1, Thủ Đức..." value={marketDistrict} onChange={(e) => setMarketDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#d8e3ef] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f] placeholder-[#8297ac]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#49627d] mb-1">Giá thuê / tháng (VNĐ)</label>
                    <input type="number" placeholder="Ví dụ: 3500000" value={marketRent} onChange={(e) => setMarketRent(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#d8e3ef] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f] placeholder-[#8297ac]" />
                  </div>
                </div>
                <button onClick={handleMarketCompare} disabled={marketLoading}
                  className="w-full py-2.5 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60">
                  {marketLoading ? <span className="w-4 h-4 border-2 border-[#10253f]/30 border-t-[#10253f] rounded-full animate-spin" /> : <BarChart2 className="w-4 h-4" />}
                  So sánh ngay
                </button>
              </div>
              {marketError && <div className="px-3 py-2 bg-[#fff1f0] border border-[#ffd1cc] rounded-lg text-xs text-[#e4534b] font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {marketError}</div>}
              {marketResult && (
                <div className="p-4 rounded-xl bg-white border border-[#d8e3ef] shadow-sm space-y-4">
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${marketResult.price_evaluation === "fair" ? "bg-[#eafbf7] border-[#b7f6e5]" : marketResult.price_evaluation === "high" ? "bg-[#fff1f0] border-[#ffd1cc]" : "bg-[#fff8e6] border-[#ffe3a3]"}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${marketResult.price_evaluation === "fair" ? "bg-[#159f7b]" : marketResult.price_evaluation === "high" ? "bg-[#e4534b]" : "bg-[#d77714]"}`}>
                      {marketResult.price_difference_percent != null ? `${marketResult.price_difference_percent > 0 ? "+" : ""}${Math.round(marketResult.price_difference_percent)}%` : "—"}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#10253f]">
                        {marketResult.price_evaluation === "fair" && "✅ Giá hợp lý so với thị trường"}
                        {marketResult.price_evaluation === "high" && "⚠️ Giá cao hơn thị trường"}
                        {marketResult.price_evaluation === "low" && "💡 Giá thấp hơn thị trường"}
                      </p>
                      {marketResult.market_average != null && <p className="text-xs text-[#49627d] mt-0.5">Trung bình thị trường: {marketResult.market_average.toLocaleString("vi-VN")} VNĐ/tháng</p>}
                      {marketResult.district && <p className="text-xs text-[#8297ac]">Khu vực: {marketResult.district}</p>}
                    </div>
                  </div>
                  {marketResult.recommendations.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-[#49627d]">Khuyến nghị:</p>
                      {marketResult.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#26435e]">
                          <ArrowRight className="w-3.5 h-3.5 text-[#8a6834] mt-0.5 shrink-0" /><span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#f8fafd] border-t border-[#e6edf4] flex items-center justify-between">
          <span className="text-xs text-[#8297ac]">WeebLegit AI • Bảo mật 100% dữ liệu</span>
          <button onClick={handleClose} className="px-4 py-2 bg-[#10253f] hover:bg-[#173d5a] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer">
            Đóng bảng kiểm tra
          </button>
        </div>
      </motion.div>
    </div>
  );
};

