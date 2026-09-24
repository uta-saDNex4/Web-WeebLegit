"use client";
import React, { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../lib/auth-context";
import * as api from "../lib/api";

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
  const [contractType, setContractType] = useState<string>("thuê trọ");

  // AI Analysis state
  const [aiResult, setAiResult] = useState<api.AiAnalysisResult | null>(null);
  const [aiPolling, setAiPolling] = useState(false);
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null);

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

  // Poll AI analysis result every 2.5s up to 15 tries (~37s)
  const pollAiAnalysis = (contractId: string, logId: string) => {
    setAiPolling(true);
    let attempts = 0;
    const maxAttempts = 15;
    const poll = async () => {
      if (attempts >= maxAttempts) { setAiPolling(false); return; }
      attempts++;
      try {
        const result = await api.getAiAnalysis(contractId, logId);
        if (result.status === "completed") {
          setAiResult(result);
          setAiPolling(false);
        } else {
          setTimeout(poll, 2500);
        }
      } catch { setAiPolling(false); }
    };
    setTimeout(poll, 1500);
  };

  const handleUploadAndVerify = async () => {
    if (!user) { onNeedAuth(); return; }
    if (!selectedFile) return;
    setError(null);
    try {
      setStage("uploading");
      const chosenType = contractType && contractType !== "other" ? contractType : undefined;
      const contract = await api.uploadContract(selectedFile, chosenType);
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
        .then((res) => setContracts(res?.items || []))
        .catch((err) => setHistoryError(err instanceof Error ? err.message : "Không tải được lịch sử"))
        .finally(() => setHistoryLoading(false));
    }
  }, [activeTab, user]);

  const handleMarketCompare = async () => {
    if (!uploadedContract) return;
    setMarketLoading(true);
    setMarketError(null);
    try {
      const cleanRent = marketRent
        ? parseFloat(marketRent.replace(/[^0-9.]/g, ""))
        : undefined;
      const res = await api.marketCompare(uploadedContract.id, {
        district: marketDistrict || undefined,
        base_rent: cleanRent && !isNaN(cleanRent) ? cleanRent : undefined,
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto cursor-pointer"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="cursor-default bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-6"
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
                    <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#d8e3ef] space-y-1.5">
                      <label className="block text-xs font-semibold text-[#49627d]">
                        Loại hợp đồng (định tuyến quy tắc rủi ro & giá thị trường):
                      </label>
                      <select
                        value={contractType}
                        onChange={(e) => setContractType(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold border border-[#d8e3ef] rounded-lg bg-white text-[#10253f] focus:outline-none focus:border-[#EAD7B8] cursor-pointer"
                      >
                        <option value="thuê trọ">Thuê phòng trọ / Căn hộ</option>
                        <option value="ctv">Cộng tác viên (CTV)</option>
                        <option value="intern">Thực tập sinh (Intern)</option>
                        <option value="khóa học">Khóa học đào tạo / Học nghề</option>
                        <option value="vay tiêu dùng">Vay tiêu dùng</option>
                        <option value="trả góp">Mua hàng trả góp</option>
                        <option value="other">Hợp đồng khác</option>
                      </select>
                    </div>
                  )}
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
                  {/* Verification badge */}
                  <div className={`p-4 rounded-xl border flex items-center gap-4 ${verifyResult.result === "matched" ? "bg-[#eafbf7] border-[#b7f6e5]" : verifyResult.result === "mismatched" ? "bg-[#fff1f0] border-[#ffd1cc]" : "bg-[#fff8e6] border-[#ffe3a3]"}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${verifyResult.result === "matched" ? "bg-[#159f7b]/15" : verifyResult.result === "mismatched" ? "bg-[#e4534b]/15" : "bg-[#d77714]/15"}`}>
                      {verifyResult.result === "matched" ? <CheckCircle2 className="w-7 h-7 text-[#159f7b]" /> : verifyResult.result === "mismatched" ? <ShieldAlert className="w-7 h-7 text-[#e4534b]" /> : <AlertTriangle className="w-7 h-7 text-[#d77714]" />}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${verifyResult.result === "matched" ? "text-[#0d7a5f]" : verifyResult.result === "mismatched" ? "text-[#b91c1c]" : "text-[#7d480e]"}`}>
                        {verifyResult.result === "matched" && "✅ File nguyên vẹn — Giữ đúng bản gốc"}
                        {verifyResult.result === "mismatched" && "⚠️ Cảnh báo — File đã bị chỉnh sửa"}
                        {verifyResult.result === "failed" && "❌ Chưa thể xác thực file"}
                      </p>
                      <p className="text-xs text-[#49627d] mt-0.5">
                        {verifyResult.result === "matched" && "File hoàn toàn nguyên bản, không bị ai sửa đổi hay tráo trang."}
                        {verifyResult.result === "mismatched" && "Mã kiểm tra không trùng — nội dung file đã bị thay đổi so với bản ban đầu."}
                        {verifyResult.result === "failed" && "Không thể đọc file từ hệ thống để kiểm tra."}
                      </p>
                      {verifyResult.duration_ms != null && <p className="text-xs text-[#8297ac] mt-1">Thời gian xử lý: {verifyResult.duration_ms}ms</p>}
                    </div>
                  </div>

                  {/* Hash details */}
                  <div className="p-4 rounded-xl bg-[#f8fafd] border border-[#d8e3ef] space-y-3">
                    <h4 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">Mã Kiểm Tra Toàn Vẹn (Dấu Vân Tay SHA-256)</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[11px] font-semibold text-[#49627d] mb-1">📁 File: {uploadedContract.filename}</p>
                        <p className="text-[11px] text-[#8297ac]">Dung lượng: {formatBytes(uploadedContract.file_size_bytes)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#49627d] mb-1">Mã file ban đầu (lúc tải lên):</p>
                        <code className="text-[10px] font-mono text-[#10253f] bg-white px-2 py-1 rounded-lg border border-[#d8e3ef] break-all block">{verifyResult.expected_sha256}</code>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#49627d] mb-1">Mã file kiểm tra lại thực tế:</p>
                        <code className={`text-[10px] font-mono px-2 py-1 rounded-lg border break-all block ${verifyResult.result === "matched" ? "text-[#159f7b] bg-[#eafbf7] border-[#b7f6e5]" : "text-[#e4534b] bg-[#fff1f0] border-[#ffd1cc]"}`}>{verifyResult.actual_sha256}</code>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#8a6834]" />
                      <h4 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">Phân tích AI điều khoản rủi ro</h4>
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
                          <p className="text-sm font-semibold text-[#7d480e]">AI đang quét điều khoản...</p>
                          <p className="text-xs text-[#996324] mt-0.5">Kết quả sẽ hiện sau vài giây</p>
                        </div>
                      </div>
                    )}

                    {aiResult && aiResult.status === "completed" && (
                      <>
                        {aiResult.risk_score != null && (() => {
                          const score = Math.round(aiResult.risk_score ?? 0);
                          const isHigh = score >= 70;
                          const isMedHigh = score >= 35 && score < 70;
                          const isLow = score > 0 && score < 35;
                          const isSafe = score === 0;

                          const badgeBg = isHigh
                            ? "bg-[#e4534b]"
                            : isMedHigh
                            ? "bg-[#d77714]"
                            : isLow
                            ? "bg-[#eab308]"
                            : "bg-[#159f7b]";

                          const boxStyle = isHigh
                            ? "bg-[#fff1f0] border-[#ffd1cc]"
                            : isMedHigh
                            ? "bg-[#fff8e6] border-[#ffe3a3]"
                            : isLow
                            ? "bg-[#fefce8] border-[#fef08a]"
                            : "bg-[#eafbf7] border-[#b7f6e5]";

                          const titleColor = isHigh
                            ? "text-[#b91c1c]"
                            : isMedHigh
                            ? "text-[#7d480e]"
                            : isLow
                            ? "text-[#854d0e]"
                            : "text-[#0d7a5f]";

                          const descColor = isHigh
                            ? "text-[#991b1b]"
                            : isMedHigh
                            ? "text-[#996324]"
                            : isLow
                            ? "text-[#a16207]"
                            : "text-[#047857]";

                          const findingsCount =
                            (aiResult.findings?.length ?? aiResult.ai_findings?.length ?? 0);

                          return (
                            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${boxStyle}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm ${badgeBg}`}>
                                  {score}%
                                </div>
                                <div>
                                  <div className={`text-sm font-bold ${titleColor}`}>
                                    Đánh giá rủi ro: {aiResult.risk_label || (isSafe ? "An toàn" : "Cần lưu ý")}
                                  </div>
                                  <div className={`text-xs mt-0.5 ${descColor}`}>
                                    {aiResult.ai_overview || aiResult.overview || aiResult.summary || ""}
                                  </div>
                                </div>
                              </div>
                              {findingsCount > 0 && (
                                <div className="text-xs font-bold text-[#d77714] bg-white px-2.5 py-1 rounded-lg border border-[#ffe3a3] shrink-0">
                                  {findingsCount} Điểm lưu ý
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {(() => {
                          const findings = aiResult.findings || aiResult.ai_findings || [];
                          if (findings.length === 0) {
                            return (
                              <div className="p-4 rounded-xl bg-[#eafbf7] border border-[#b7f6e5] flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-[#159f7b] shrink-0" />
                                <p className="text-sm font-semibold text-[#0d7a5f]">
                                  Hợp đồng không phát hiện điều khoản rủi ro hoặc bẫy pháp lý nổi bật.
                                </p>
                              </div>
                            );
                          }
                          return (
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">
                                Chi tiết điều khoản rủi ro ({findings.length})
                              </h4>
                              {findings.map((risk, idx) => {
                                const isRiskHigh =
                                  risk.severity === "high" ||
                                  risk.risk_level === "critical" ||
                                  risk.risk_level === "high";
                                const isRiskMed =
                                  risk.severity === "medium" ||
                                  risk.risk_level === "medium";

                                const title =
                                  risk.title ||
                                  risk.target_section ||
                                  (risk.matched_term ? `Điều khoản: ${risk.matched_term}` : "Điều khoản rủi ro");
                                const clauseSnippet = risk.clause_text || risk.matched_term;
                                const analysisSnippet = risk.analysis || risk.warning;
                                const lawSnippet = risk.law_reference || risk.reference;

                                return (
                                  <div key={idx} className="p-4 rounded-xl bg-white border border-[#d8e3ef] shadow-sm">
                                    <div
                                      className="flex items-center justify-between cursor-pointer"
                                      onClick={() => setExpandedRisk(expandedRisk === idx ? null : idx)}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isRiskHigh ? (
                                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fff1f0] text-[#e4534b] border border-[#ffd1cc]">
                                            Mức rủi ro cao
                                          </span>
                                        ) : isRiskMed ? (
                                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fff4e6] text-[#d77714] border border-[#ffd8a8]">
                                            Cần làm rõ
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f2f7fc] text-[#49627d] border border-[#d8e3ef]">
                                            Lưu ý nhẹ
                                          </span>
                                        )}
                                        <h5 className="text-sm font-bold text-[#10253f]">{title}</h5>
                                      </div>
                                      {expandedRisk === idx ? (
                                        <ChevronUp className="w-4 h-4 text-[#8297ac]" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-[#8297ac]" />
                                      )}
                                    </div>
                                    <AnimatePresence>
                                      {expandedRisk === idx && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="pt-3 space-y-3">
                                            {clauseSnippet && (
                                              <div className="p-3 bg-[#f8fafd] rounded-lg text-xs text-[#26435e] italic border-l-2 border-[#EAD7B8]">
                                                &quot;{clauseSnippet}&quot;
                                              </div>
                                            )}
                                            {analysisSnippet && (
                                              <div className="text-xs text-[#49627d] leading-relaxed">
                                                <strong>Phân tích:</strong> {analysisSnippet}
                                              </div>
                                            )}
                                            {lawSnippet && (
                                              <div className="text-xs text-[#8a6834] font-medium flex items-center gap-1.5">
                                                <BookOpen className="w-3.5 h-3.5" />
                                                <span>{lawSnippet}</span>
                                              </div>
                                            )}
                                            {risk.negotiation_script && (
                                              <div className="pt-2 border-t border-[#e6edf4]">
                                                <div className="flex items-center justify-between text-[11px] font-bold text-[#159f7b] mb-1.5">
                                                  <span className="flex items-center gap-1">
                                                    <MessageCircle className="w-3 h-3" />
                                                    Gợi ý câu trao đổi đàm phán:
                                                  </span>
                                                  <button
                                                    onClick={() =>
                                                      handleCopy(`risk-${idx}`, risk.negotiation_script ?? "")
                                                    }
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
                          );
                        })()}
                      </>
                    )}
                  </div>

                  <button onClick={resetAll} className="w-full py-2.5 border border-[#d8e3ef] text-sm font-semibold text-[#49627d] hover:text-[#10253f] hover:border-[#EAD7B8] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                    <RefreshCw className="w-4 h-4" /> Kiểm tra file khác
                  </button>
                </div>
              )}
            </>
          )}

          {/* ═══ TAB: HISTORY ═══ */}
          {user && activeTab === "history" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" /> Lịch sử hợp đồng của bạn
              </h4>
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
                <div key={contract.id} className="p-4 rounded-xl bg-white border border-[#d8e3ef] shadow-sm space-y-2">
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

