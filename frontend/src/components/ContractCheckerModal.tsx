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
  GitCompare,
  Printer,
  FileStack,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../lib/language-context";
import * as api from "../lib/api";
import {
  RiskGaugeAndHeatmap,
  RiskFilterType,
  getClauseBucket,
} from "./RiskGaugeAndHeatmap";
import { ContractCompareModal } from "./ContractCompareModal";

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
  contract_type?: string | null;
}

interface VerifyResult {
  result: "matched" | "mismatched" | "failed";
  expected_sha256: string;
  actual_sha256: string;
  duration_ms: number | null;
  verification_log_id: string;
}

interface BatchUploadedItem {
  contract: UploadedContract;
  verify: VerifyResult;
  quickCheck?: api.QuickCheckResponse | null;
}

export const ContractCheckerModal: React.FC<ContractCheckerModalProps> = ({
  isOpen,
  onClose,
  onNeedAuth,
}) => {
  const { user, refreshUser } = useAuth();
  const { lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollStoppedRef = useRef(false);

  const planTier = user?.plan_tier || (user?.role === "admin" ? "pro" : "free");
  const tierBadge = user?.role === "admin" ? "pro/ad" : planTier;
  const maxBatchFiles =
    user?.max_batch_files ??
    (planTier === "pro" ? 20 : planTier === "medium" ? 5 : 1);
  const canViewClauses = user?.can_view_clauses ?? planTier !== "free";
  const canCompareContracts =
    user?.can_compare_contracts ?? planTier !== "free";
  const canExportPdf = user?.can_export_pdf ?? planTier === "pro";

  const [activeTab, setActiveTab] = useState<ActiveTab>("check");
  const [stage, setStage] = useState<Stage>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedContractType, setSelectedContractType] =
    useState<string>("thuê trọ");
  const [batchItems, setBatchItems] = useState<BatchUploadedItem[]>([]);
  const [activeBatchIdx, setActiveBatchIdx] = useState<number>(0);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const [uploadedContract, setUploadedContract] =
    useState<UploadedContract | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [quickCheckResult, setQuickCheckResult] =
    useState<api.QuickCheckResponse | null>(null);
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
    pollStoppedRef.current = true;
    setStage("upload");
    setSelectedFile(null);
    setSelectedFiles([]);
    setBatchItems([]);
    setActiveBatchIdx(0);
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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFilesSelect = (fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    if (arr.length === 0) return;
    setError(null);

    if (arr.length > maxBatchFiles) {
      setError(
        lang === "EN"
          ? `Your -${planTier}- plan allows uploading up to ${maxBatchFiles} contract(s) at a time. Upgrade at /upgrade to batch upload more files.`
          : `Gói -${planTier}- hiện tại chỉ cho phép tải tối đa ${maxBatchFiles} hợp đồng / lần. Vui lòng nâng cấp lên gói Medium (5 file) hoặc Pro (20 file) tại /upgrade.`,
      );
      const sliced = arr.slice(0, maxBatchFiles);
      setSelectedFiles(sliced);
      setSelectedFile(sliced[0] || null);
      return;
    }

    setSelectedFiles(arr);
    setSelectedFile(arr[0] || null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  // Poll AI analysis result every 3s up to 12 tries with network error resilience
  const pollAiAnalysis = (contractId: string, logId: string) => {
    pollStoppedRef.current = false;
    setAiPolling(true);
    let attempts = 0;
    let consecutiveErrors = 0;
    const maxAttempts = 12;
    const poll = async () => {
      if (pollStoppedRef.current || attempts >= maxAttempts) {
        setAiPolling(false);
        return;
      }
      attempts++;
      try {
        const result = await api.getAiAnalysis(contractId, logId);
        consecutiveErrors = 0;
        if (pollStoppedRef.current) return;
        if (result.status === "completed") {
          setAiResult(result);
          setAiPolling(false);
        } else {
          setTimeout(poll, 3000);
        }
      } catch {
        consecutiveErrors++;
        if (pollStoppedRef.current || consecutiveErrors >= 3) {
          setAiPolling(false);
        } else {
          setTimeout(poll, 3000);
        }
      }
    };
    setTimeout(poll, 1800);
  };

  const handleUploadAndVerify = async () => {
    if (!user) {
      onNeedAuth();
      return;
    }
    const filesToProcess =
      selectedFiles.length > 0
        ? selectedFiles
        : selectedFile
        ? [selectedFile]
        : [];
    if (filesToProcess.length === 0) return;

    setError(null);
    try {
      setStage("uploading");
      const uploadedBatch: BatchUploadedItem[] = [];

      for (let i = 0; i < filesToProcess.length; i++) {
        const fileItem = filesToProcess[i];
        const contract = await api.uploadContract(
          fileItem,
          selectedContractType || undefined,
        );
        if (i === 0) setStage("verifying");
        const qc = await api.quickCheckContract(contract.id);

        uploadedBatch.push({
          contract: {
            id: contract.id,
            filename: contract.original_filename,
            sha256_hash: qc.actual_sha256 || contract.sha256_hash,
            file_size_bytes: contract.file_size_bytes,
            status: contract.status,
            contract_type: contract.contract_type,
          },
          verify: {
            result: qc.result as any,
            expected_sha256: qc.expected_sha256,
            actual_sha256: qc.actual_sha256,
            duration_ms: qc.duration_ms,
            verification_log_id: qc.verification_log_id,
          },
          quickCheck: qc,
        });
      }

      await refreshUser();

      setBatchItems(uploadedBatch);
      setActiveBatchIdx(0);
      const first = uploadedBatch[0];
      setUploadedContract(first.contract);
      setVerifyResult(first.verify);
      setQuickCheckResult(first.quickCheck || null);
      setStage("result");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : lang === "EN"
          ? "An error occurred"
          : "Có lỗi xảy ra",
      );
      setStage("upload");
    }
  };

  const handleSelectBatchItem = (idx: number) => {
    const item = batchItems[idx];
    if (!item) return;
    setActiveBatchIdx(idx);
    setUploadedContract(item.contract);
    setVerifyResult(item.verify);
    setQuickCheckResult(item.quickCheck || null);
  };

  // Load history when switching to history tab
  useEffect(() => {
    if (activeTab === "history" && user) {
      setHistoryLoading(true);
      setHistoryError(null);
      api.listContracts({ limit: 20 })
        .then((res) => setContracts(res.items))
        .catch((err) => setHistoryError(err instanceof Error ? err.message : (lang === "EN" ? "Failed to load history" : "Không tải được lịch sử")))
        .finally(() => setHistoryLoading(false));
    }
  }, [activeTab, user, lang]);

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
      setMarketError(err instanceof Error ? err.message : (lang === "EN" ? "Comparison failed" : "Không thể so sánh"));
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
    new Date(iso).toLocaleDateString(lang === "EN" ? "en-US" : "vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: "check", label: lang === "EN" ? "Verify" : "Kiểm tra", icon: <ShieldCheck className="w-4 h-4" /> },
    { key: "history", label: lang === "EN" ? "History" : "Lịch sử", icon: <List className="w-4 h-4" /> },
    ...(uploadedContract ? [{ key: "market" as ActiveTab, label: lang === "EN" ? "Market" : "Thị trường", icon: <BarChart2 className="w-4 h-4" /> }] : []),
  ];

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto cursor-pointer"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="cursor-default bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1e3558] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-6"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e6edf4] dark:border-[#1a2d49] flex items-center justify-between bg-[#f8fafd] dark:bg-[#0d1829]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#10253f] dark:text-white">
                {lang === "EN" ? "Contract Quick Check & Integrity Audit" : "Kiểm Tra Nhanh Hợp Đồng (Quick Check)"}
              </h3>
              <p className="text-xs text-[#8297ac] dark:text-[#94a3b8]">
                {lang === "EN"
                  ? "Instant cryptographic SHA-256 verification & concise AI legal risk scoring"
                  : "Kiểm tra toàn vẹn SHA-256 & Chấm điểm rủi ro tổng quát bằng AI Quick Check"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#8297ac] dark:text-[#94a3b8] hover:text-[#10253f] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#162744] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs — only shown when logged in */}
        {user && (
          <div className="px-6 flex gap-1 bg-[#f8fafd] dark:bg-[#0d1829] border-b border-[#e6edf4] dark:border-[#1a2d49]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "border-[#8a6834] dark:border-[#EAD7B8] text-[#8a6834] dark:text-[#EAD7B8]"
                    : "border-transparent text-[#49627d] dark:text-[#94a3b8] hover:text-[#10253f] dark:hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* ── Chưa đăng nhập ── */}
          {!user && (
            <div className="p-5 rounded-xl bg-[#f2f7fc] dark:bg-[#111f36] border border-[#d8e3ef] dark:border-[#213a60] flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#EAD7B8]/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#8a6834] dark:text-[#EAD7B8]" />
              </div>
              <div>
                <p className="font-semibold text-[#10253f] dark:text-white text-sm">
                  {lang === "EN" ? "Sign in required" : "Cần đăng nhập để sử dụng"}
                </p>
                <p className="text-xs text-[#8297ac] dark:text-[#94a3b8] mt-0.5">
                  {lang === "EN"
                    ? "Create a free account to upload and verify contracts"
                    : "Tạo tài khoản miễn phí để upload và xác thực hợp đồng"}
                </p>
              </div>
              <button
                onClick={onNeedAuth}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#EAD7B8] text-[#10253f] text-sm font-semibold rounded-xl shadow-sm hover:bg-[#dfc59f] transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                {lang === "EN" ? "Log In / Sign Up" : "Đăng nhập / Đăng ký"}
              </button>
            </div>
          )}

          {/* ═══ TAB: CHECK ═══ */}
          {user && activeTab === "check" && (
            <>
              {/* 4-Step Progress Stepper */}
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
                  { id: 1, label: lang === "EN" ? "1. Upload File" : "1. Tải hợp đồng" },
                  { id: 2, label: lang === "EN" ? "2. SHA-256 Check" : "2. Xác thực SHA-256" },
                  { id: 3, label: lang === "EN" ? "3. Hybrid AI Scan" : "3. Chấm điểm Hybrid AI" },
                  { id: 4, label: lang === "EN" ? "4. Clause Report" : "4. Báo cáo điều khoản" },
                ];
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-xl bg-[#f8fafd] dark:bg-[#0f1d33] border border-[#e6edf4] dark:border-[#1e3558]">
                    {steps.map((s) => {
                      const isDone = currentStep > s.id || (s.id === 4 && stage === "result" && Boolean(aiResult));
                      const isActive = currentStep === s.id && !isDone;
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isDone
                              ? "bg-[#eafbf7] dark:bg-emerald-950/50 text-[#0d7a5f] dark:text-emerald-300 border border-[#b7f6e5] dark:border-emerald-800/60"
                              : isActive
                                ? "bg-[#10253f] dark:bg-[#EAD7B8] text-white dark:text-[#10253f] shadow-2xs"
                                : "bg-white dark:bg-[#13233f] text-[#94a3b8] border border-[#e6edf4] dark:border-[#243d63]"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                              isDone
                                ? "bg-[#159f7b] text-white"
                                : isActive
                                  ? "bg-[#EAD7B8] dark:bg-[#10253f] text-[#10253f] dark:text-[#EAD7B8]"
                                  : "bg-[#f1f5f9] dark:bg-[#1b3155] text-[#94a3b8]"
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
                  {/* Subscription Tier & Quota Bar */}
                  <div className="p-3.5 rounded-xl bg-[#FAF5ED] dark:bg-[#12223C] border border-[#E6DEC8] dark:border-[#1F3557] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#0F1E36] dark:text-white">
                        {lang === "EN" ? "Current Plan:" : "Bản đang dùng:"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#0F1E36] dark:bg-[#EAD7B8] text-white dark:text-[#0F1E36] font-bold lowercase">
                        -{tierBadge}-
                      </span>
                      <span className="text-[#65778F] dark:text-[#8FA3BF]">
                        • {lang === "EN" ? "Today:" : "Hôm nay:"}{" "}
                        <strong>
                          {planTier === "pro" || user.daily_limit === -1
                            ? (user.daily_used ?? 0)
                            : `${user.daily_used ?? 0}/${user.daily_limit ?? 5}`}
                        </strong>
                      </span>
                      <span className="text-[#65778F] dark:text-[#8FA3BF]">
                        • {lang === "EN" ? "Month:" : "Tháng:"}{" "}
                        <strong>
                          {planTier === "pro" || user.monthly_limit === -1
                            ? (user.monthly_used ?? 0)
                            : `${user.monthly_used ?? 0}/${user.monthly_limit ?? 30}`}
                        </strong>
                      </span>
                      <span className="text-[#8A6731] dark:text-[#EAD7B8] font-semibold">
                        •{" "}
                        {lang === "EN"
                          ? `Max ${maxBatchFiles} file(s)/upload`
                          : `Tối đa ${maxBatchFiles} hợp đồng/lần`}
                      </span>
                    </div>
                    <Link
                      href="/upgrade"
                      onClick={handleClose}
                      className="text-xs font-extrabold text-[#8A6731] dark:text-[#EAD7B8] underline hover:opacity-80"
                    >
                      {lang === "EN" ? "Upgrade Plan →" : "Nâng cấp gói →"}
                    </Link>
                  </div>

                  {/* Contract Type Selector (Supports Same-Type Comparison) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#f8fafd] dark:bg-[#0f1d33] border border-[#e6edf4] dark:border-[#1e3558]">
                    <label className="text-xs font-bold text-[#10253f] dark:text-white">
                      {lang === "EN"
                        ? "Contract Category (used for same-type comparison):"
                        : "Phân loại hợp đồng (dùng để đối chiếu & so sánh cùng loại):"}
                    </label>
                    <select
                      value={selectedContractType}
                      onChange={(e) => setSelectedContractType(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#13233f] border border-[#d8e3ef] dark:border-[#243d63] text-xs font-bold text-[#10253f] dark:text-white"
                    >
                      <option value="thuê trọ">Thuê trọ / Phòng trọ</option>
                      <option value="thuê chung cư">Thuê chung cư / Căn hộ</option>
                      <option value="ctv">Cộng tác viên (CTV / Freelance)</option>
                      <option value="intern">Thực tập sinh (Internship)</option>
                      <option value="khóa học">Khóa học / Cam kết việc làm</option>
                      <option value="vay tiêu dùng">Vay tiêu dùng / Tín dụng</option>
                      <option value="trả góp">Mua trả góp</option>
                    </select>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      isDragging
                        ? "border-[#EAD7B8] bg-[#EAD7B8]/10"
                        : selectedFile
                          ? "border-[#159f7b] bg-[#eafbf7] dark:bg-emerald-950/30"
                          : "border-[#b9cadd] dark:border-[#243d63] hover:border-[#EAD7B8] bg-[#f8fafd]/80 dark:bg-[#0f1d33]/80"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files &&
                        e.target.files.length > 0 &&
                        handleFilesSelect(e.target.files)
                      }
                    />
                    {selectedFiles.length > 1 ? (
                      <>
                        <FileStack className="w-9 h-9 text-[#159f7b] mx-auto mb-2" />
                        <p className="font-bold text-sm text-[#10253f] dark:text-white">
                          {lang === "EN"
                            ? `Selected ${selectedFiles.length} contracts for batch analysis`
                            : `Đã chọn ${selectedFiles.length} hợp đồng để tải lên cùng lúc`}
                        </p>
                        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                          {selectedFiles.map((f, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#13233f] border border-[#b7f6e5] dark:border-emerald-800 text-[11px] font-semibold text-[#10253f] dark:text-emerald-200"
                            >
                              {i + 1}. {f.name} ({formatBytes(f.size)})
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-[#8297ac] dark:text-[#94a3b8] mt-2">
                          {lang === "EN"
                            ? "Click to re-select files"
                            : "Nhấn để chọn lại danh sách file"}
                        </p>
                      </>
                    ) : selectedFile ? (
                      <>
                        <FileText className="w-9 h-9 text-[#159f7b] mx-auto mb-2" />
                        <p className="font-bold text-sm text-[#10253f] dark:text-white">{selectedFile.name}</p>
                        <p className="text-xs text-[#8297ac] dark:text-[#94a3b8] mt-1">
                          {formatBytes(selectedFile.size)} • {lang === "EN" ? "Click to change file" : "Nhấn để đổi file"}
                        </p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-9 h-9 text-[#8a6834] dark:text-[#EAD7B8] mx-auto mb-2" />
                        <p className="font-bold text-sm text-[#10253f] dark:text-white mb-1">
                          {maxBatchFiles > 1
                            ? lang === "EN"
                              ? `Drag & drop or click to choose up to ${maxBatchFiles} files at once`
                              : `Kéo thả hoặc nhấn để chọn tối đa ${maxBatchFiles} hợp đồng cùng lúc`
                            : lang === "EN"
                            ? "Drag & drop or click to choose 1 contract file (-free- plan)"
                            : "Kéo thả hoặc nhấn để chọn 1 file hợp đồng (Gói -free-)"}
                        </p>
                        <p className="text-xs text-[#8297ac] dark:text-[#94a3b8]">
                          {lang === "EN" ? "Supports PDF, DOCX, DOC, TXT (max 20MB)" : "Hỗ trợ PDF, DOCX, DOC, TXT (tối đa 20MB)"}
                        </p>
                      </>
                    )}
                  </div>
                  {error && (
                    <div className="px-3 py-2 bg-[#fff1f0] dark:bg-red-950/50 border border-[#ffd1cc] dark:border-red-900/60 rounded-lg text-xs text-[#e4534b] dark:text-red-300 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                  )}
                  {selectedFile && user && (
                    <button
                      onClick={handleUploadAndVerify}
                      className="w-full py-3 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {selectedFiles.length > 1
                        ? lang === "EN"
                          ? `Batch Upload & Verify ${selectedFiles.length} Contracts`
                          : `Tải lên & Phân tích hàng loạt (${selectedFiles.length} hợp đồng)`
                        : lang === "EN"
                        ? "Upload & Verify SHA-256"
                        : "Upload & Xác thực SHA-256"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}

              {(stage === "uploading" || stage === "verifying") && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative w-16 h-16">
                    <div className="w-16 h-16 rounded-full border-4 border-[#d8e3ef] dark:border-[#1e3558]" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#EAD7B8] border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {stage === "uploading" ? (
                        <UploadCloud className="w-6 h-6 text-[#8a6834] dark:text-[#EAD7B8]" />
                      ) : (
                        <ShieldCheck className="w-6 h-6 text-[#8a6834] dark:text-[#EAD7B8]" />
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-[#10253f] dark:text-white text-sm">
                      {stage === "uploading"
                        ? lang === "EN" ? "Uploading & computing SHA-256..." : "Đang tải lên & tính SHA-256..."
                        : lang === "EN" ? "Verifying file integrity..." : "Đang xác thực toàn vẹn file..."}
                    </p>
                    <p className="text-xs text-[#8297ac] dark:text-[#94a3b8] mt-1">
                      {stage === "uploading"
                        ? lang === "EN" ? "Server is streaming & hashing your file" : "Server đang hash file của bạn"
                        : lang === "EN" ? "Constant-time SHA-256 comparison" : "So sánh hash constant-time"}
                    </p>
                  </div>
                </div>
              )}

              {stage === "result" && uploadedContract && verifyResult && (
                <div className="space-y-5">
                  {/* Batch Upload Switcher Bar (When user uploaded multiple contracts at once in Medium / Pro) */}
                  {batchItems.length > 1 && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                          <FileStack className="w-4 h-4" />
                          <span>
                            {lang === "EN"
                              ? `Batch Uploaded Contracts (${batchItems.length})`
                              : `Danh sách hợp đồng tải lên hàng loạt (${batchItems.length} file)`}
                          </span>
                        </span>
                        {canCompareContracts && (
                          <button
                            type="button"
                            onClick={() => setCompareModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                            <span>
                              {lang === "EN"
                                ? "Compare Same-Type Contracts"
                                : "So sánh 2 hợp đồng cùng loại"}
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {batchItems.map((b, idx) => (
                          <button
                            key={b.contract.id}
                            type="button"
                            onClick={() => handleSelectBatchItem(idx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer truncate max-w-[220px] ${
                              idx === activeBatchIdx
                                ? "bg-indigo-600 text-white shadow"
                                : "bg-white dark:bg-[#13233f] text-slate-700 dark:text-slate-200 border border-indigo-200 dark:border-slate-700"
                            }`}
                          >
                            {idx + 1}. {b.contract.filename}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification badge with Progressive Disclosure toggle for SHA-256 */}
                  <div
                    className={`p-4 rounded-xl border space-y-3 ${
                      verifyResult.result === "matched"
                        ? "bg-[#eafbf7] dark:bg-emerald-950/35 border-[#b7f6e5] dark:border-emerald-800/60"
                        : verifyResult.result === "mismatched"
                          ? "bg-[#fff1f0] dark:bg-red-950/35 border-[#ffd1cc] dark:border-red-800/60"
                          : "bg-[#fff8e6] dark:bg-amber-950/35 border-[#ffe3a3] dark:border-amber-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                            verifyResult.result === "matched"
                              ? "bg-[#159f7b]/15"
                              : verifyResult.result === "mismatched"
                                ? "bg-[#e4534b]/15"
                                : "bg-[#d77714]/15"
                          }`}
                        >
                          {verifyResult.result === "matched" ? (
                            <CheckCircle2 className="w-6 h-6 text-[#159f7b]" />
                          ) : verifyResult.result === "mismatched" ? (
                            <ShieldAlert className="w-6 h-6 text-[#e4534b]" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-[#d77714]" />
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-bold text-sm ${
                              verifyResult.result === "matched"
                                ? "text-[#0d7a5f] dark:text-emerald-300"
                                : verifyResult.result === "mismatched"
                                  ? "text-[#b91c1c] dark:text-red-300"
                                  : "text-[#7d480e] dark:text-amber-300"
                            }`}
                          >
                            {verifyResult.result === "matched" &&
                              (lang === "EN" ? "✅ Valid File — SHA-256 Matched" : "✅ File hợp lệ — SHA-256 khớp")}
                            {verifyResult.result === "mismatched" &&
                              (lang === "EN" ? "⚠️ Warning — File Modified (SHA-256 Mismatch)" : "⚠️ Cảnh báo — File đã bị thay đổi")}
                            {verifyResult.result === "failed" &&
                              (lang === "EN" ? "❌ Verification Failed" : "❌ Xác thực thất bại")}
                          </p>
                          <p className="text-xs text-[#49627d] dark:text-[#cbd5e1] mt-0.5">
                            📁 <strong>{uploadedContract.filename}</strong> ({formatBytes(uploadedContract.file_size_bytes)})
                            {verifyResult.duration_ms != null ? ` • ${verifyResult.duration_ms}ms` : ""}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowHashDetails((v) => !v)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/90 dark:bg-[#13233f] hover:bg-white dark:hover:bg-[#1b3155] text-[#10253f] dark:text-[#EAD7B8] border border-[#d8e3ef] dark:border-[#243d63] transition-colors cursor-pointer shrink-0"
                      >
                        {showHashDetails
                          ? lang === "EN" ? "Hide SHA-256" : "Ẩn mã SHA-256"
                          : lang === "EN" ? "SHA-256 Details" : "Chi tiết SHA-256"}
                      </button>
                    </div>

                    {showHashDetails && (
                      <div className="p-3.5 rounded-xl bg-white/95 dark:bg-[#0d1829] border border-[#d8e3ef] dark:border-[#1e3558] space-y-2 text-left">
                        <div>
                          <p className="text-[11px] font-semibold text-[#49627d] dark:text-[#94a3b8] mb-1">
                            {lang === "EN" ? "Stored Hash (expected):" : "Hash lưu trữ (expected):"}
                          </p>
                          <code className="text-[10px] font-mono text-[#10253f] dark:text-[#e2e8f0] bg-[#f8fafd] dark:bg-[#13233f] px-2 py-1 rounded-lg border border-[#d8e3ef] dark:border-[#243d63] break-all block">
                            {verifyResult.expected_sha256}
                          </code>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-[#49627d] dark:text-[#94a3b8] mb-1">
                            {lang === "EN" ? "Computed Hash (actual):" : "Hash xác thực (actual):"}
                          </p>
                          <code
                            className={`text-[10px] font-mono px-2 py-1 rounded-lg border break-all block ${
                              verifyResult.result === "matched"
                                ? "text-[#159f7b] dark:text-emerald-300 bg-[#eafbf7] dark:bg-emerald-950/40 border-[#b7f6e5] dark:border-emerald-800/60"
                                : "text-[#e4534b] dark:text-red-300 bg-[#fff1f0] dark:bg-red-950/40 border-[#ffd1cc] dark:border-red-800/60"
                            }`}
                          >
                            {verifyResult.actual_sha256}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Check AI Risk Scoring Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                        <h4 className="text-xs font-bold text-[#8297ac] dark:text-[#94a3b8] uppercase tracking-wider">
                          {lang === "EN"
                            ? "AI Quick Risk Assessment"
                            : "Đánh Giá Nhanh Rủi Ro (Quick Check AI)"}
                        </h4>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eafbf7] dark:bg-emerald-950/40 text-[#159f7b] dark:text-emerald-300 border border-[#b7f6e5] dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {lang === "EN" ? "Fast Deterministic + LLM" : "Phản hồi chuẩn xác & siêu tốc"}
                      </span>
                    </div>

                    {/* Quick Check Result Card */}
                    {quickCheckResult ? (
                      <div className="p-5 rounded-2xl bg-[#FAF5ED]/80 dark:bg-[#111f36] border border-[#EAD7B8] dark:border-[#243d63] space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#EAD7B8]/60 dark:border-[#1e3558]">
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-xl shadow-sm ${
                                quickCheckResult.risk_score >= 70
                                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                                  : quickCheckResult.risk_score >= 35
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              <span>{Math.round(quickCheckResult.risk_score)}</span>
                              <span className="text-[10px] font-bold tracking-tight opacity-75">/100</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#10253f] dark:text-white">
                                  {quickCheckResult.risk_label}
                                </span>
                                {quickCheckResult.high_risk_count > 0 && (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                                    {quickCheckResult.high_risk_count} {lang === "EN" ? "critical" : "điều khoản cảnh báo"}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#5f758d] dark:text-[#94a3b8] mt-0.5">
                                {lang === "EN"
                                  ? `Verification took ${quickCheckResult.duration_ms ?? 0}ms with SHA-256 hash match`
                                  : `Đã đối chiếu SHA-256 & tính điểm trong ${quickCheckResult.duration_ms ?? 0}ms`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* AI Overview paragraph */}
                        {quickCheckResult.ai_overview && (
                          <div className="p-3.5 rounded-xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1e3558] text-xs text-[#2c4460] dark:text-[#cbd5e1] leading-relaxed">
                            <p className="font-semibold text-[#10253f] dark:text-white mb-1 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
                              {lang === "EN" ? "Summary Assessment:" : "Nhận định tổng quan của AI:"}
                            </p>
                            {quickCheckResult.ai_overview}
                          </div>
                        )}

                        {/* Key risks flags */}
                        {quickCheckResult.key_risks && quickCheckResult.key_risks.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#e4534b] dark:text-red-400 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {lang === "EN" ? "Key Red Flags Detected:" : "Các điều khoản có rủi ro đáng ngờ:"}
                            </h5>
                            <div className="space-y-1.5">
                              {quickCheckResult.key_risks.slice(0, 4).map((risk, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 p-2 rounded-lg bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-200"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                                  <span className="line-clamp-2">{risk}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#FAF5ED] dark:bg-[#111f36] border border-[#EAD7B8] dark:border-[#243d63] flex items-center justify-center gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-[#10253f] dark:border-[#EAD7B8] border-t-transparent animate-spin" />
                        <span className="text-xs font-semibold text-[#10253f] dark:text-white">
                          {lang === "EN" ? "Running AI Quick Check..." : "Đang kiểm tra nhanh rủi ro với AI..."}
                        </span>
                      </div>
                    )}

                    {/* Dedicated Legal Studio / Workspace CTA Banner */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#10253f] to-[#1c385c] text-white border border-[#2c4d79] shadow-lg relative overflow-hidden">
                      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#EAD7B8]/15 rounded-full blur-2xl pointer-events-none" />
                      <div className="relative z-10 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EAD7B8] text-[#10253f] text-[10px] font-black tracking-wide uppercase">
                            Legal Studio
                          </span>
                          <span className="text-xs text-[#EAD7B8] font-medium">
                            {lang === "EN" ? "Interactive IDE Workspace" : "Không gian làm việc & Soạn thảo AI"}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {lang === "EN"
                              ? "Need deep clause-by-clause analysis & AI Copilot assistance?"
                              : "Xem phân tích chi tiết từng điều khoản, đối chiếu luật & đàm phán cùng AI Copilot?"}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1">
                            {lang === "EN"
                              ? "Open Legal Studio to inspect full text, cite Vietnamese laws (Civil Code, Land Law), and interact with the split-pane AI Copilot."
                              : "Mở Legal Studio để chia đôi màn hình, đọc văn bản gốc được tô màu điều khoản rủi ro, tra cứu luật và chat trực tiếp với trợ lý pháp lý."}
                          </p>
                        </div>
                        <div className="pt-1">
                          <Link
                            href={uploadedContract?.id ? `/workspace?contractId=${uploadedContract.id}` : "/workspace"}
                            onClick={handleClose}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-xs font-bold rounded-xl transition-all shadow-md group cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-[#10253f]" />
                            <span>
                              {lang === "EN"
                                ? "Open in Legal Studio (/workspace)"
                                : "Mở trong Legal Studio (/workspace)"}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {uploadedContract?.id ? (
                      <Link
                        href={`/history/${uploadedContract.id}`}
                        onClick={handleClose}
                        className="py-2.5 px-4 bg-[#10253f] dark:bg-[#EAD7B8] hover:bg-[#1e3a5f] dark:hover:bg-[#dfc59f] text-white dark:text-[#10253f] text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{lang === "EN" ? "Open Full Report Page" : "Mở trang báo cáo đầy đủ"}</span>
                      </Link>
                    ) : null}
                    <button
                      onClick={resetAll}
                      className="py-2.5 px-4 border border-[#d8e3ef] dark:border-[#243d63] text-sm font-semibold text-[#49627d] dark:text-[#cbd5e1] hover:text-[#10253f] dark:hover:text-white hover:border-[#EAD7B8] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {lang === "EN" ? "Verify Another File" : "Kiểm tra file khác"}
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
                <h4 className="text-xs font-bold text-[#8297ac] dark:text-[#94a3b8] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {lang === "EN" ? "Your Contract History" : "Lịch sử hợp đồng của bạn"}
                </h4>
                <Link
                  href="/history"
                  onClick={handleClose}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8] hover:text-[#10253f] dark:hover:text-white bg-[#FAF5ED] dark:bg-[#162744] px-3 py-1.5 rounded-lg border border-[#EAD7B8]/60 dark:border-[#274068] transition-colors"
                >
                  <span>{lang === "EN" ? "Open Full History Page" : "Mở trang Lịch sử đầy đủ"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {historyLoading && (
                <div className="flex items-center justify-center py-10 gap-3 text-[#8297ac]">
                  <div className="w-6 h-6 rounded-full border-2 border-[#EAD7B8] border-t-transparent animate-spin" />
                  <span className="text-sm">{lang === "EN" ? "Loading..." : "Đang tải..."}</span>
                </div>
              )}
              {historyError && (
                <div className="px-3 py-2 bg-[#fff1f0] dark:bg-red-950/50 border border-[#ffd1cc] dark:border-red-900/60 rounded-lg text-xs text-[#e4534b] dark:text-red-300 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {historyError}
                </div>
              )}
              {!historyLoading && !historyError && contracts.length === 0 && (
                <div className="p-8 rounded-xl bg-[#f8fafd] dark:bg-[#0f1d33] border border-[#d8e3ef] dark:border-[#1e3558] text-center text-sm text-[#8297ac] dark:text-[#94a3b8]">
                  {lang === "EN" ? (
                    <>You have not uploaded any contracts yet. Use the <strong>Verify</strong> tab to start.</>
                  ) : (
                    <>Bạn chưa upload hợp đồng nào. Hãy dùng tab <strong>Kiểm tra</strong> để bắt đầu.</>
                  )}
                </div>
              )}
              {!historyLoading &&
                contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#0d1829] border border-[#d8e3ef] dark:border-[#1e3558] hover:border-[#EAD7B8] shadow-sm space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8] shrink-0" />
                        <p className="text-sm font-semibold text-[#10253f] dark:text-white truncate max-w-[260px]">
                          {contract.original_filename}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded border ${
                          contract.status === "verified"
                            ? "bg-[#eafbf7] dark:bg-emerald-950/40 text-[#0d7a5f] dark:text-emerald-300 border-[#b7f6e5] dark:border-emerald-800/60"
                            : "bg-[#f2f7fc] dark:bg-[#13233f] text-[#49627d] dark:text-[#cbd5e1] border-[#d8e3ef] dark:border-[#243d63]"
                        }`}
                      >
                        {contract.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#8297ac] dark:text-[#94a3b8]">
                      <span>{formatBytes(contract.file_size_bytes)}</span>
                      <span>{contract.mime_type}</span>
                      {contract.contract_type && (
                        <span>
                          {lang === "EN" ? "Type" : "Loại"}: {contract.contract_type}
                        </span>
                      )}
                      <span>{formatDate(contract.created_at)}</span>
                    </div>
                    <code className="text-[10px] font-mono text-[#49627d] dark:text-[#cbd5e1] bg-[#f8fafd] dark:bg-[#13233f] px-2 py-1 rounded border border-[#e6edf4] dark:border-[#243d63] block truncate">
                      SHA-256: {contract.sha256_hash}
                    </code>
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
                            result:
                              contract.status === "verified"
                                ? "matched"
                                : contract.status === "mismatch"
                                  ? "mismatched"
                                  : "failed",
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
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f8fafd] dark:bg-[#13233f] hover:bg-[#eef3f8] dark:hover:bg-[#1b3155] text-[#10253f] dark:text-white border border-[#d8e3ef] dark:border-[#243d63] transition-colors cursor-pointer"
                      >
                        {lang === "EN" ? "Quick Preview" : "Xem nhanh tại đây"}
                      </button>
                      <Link
                        href={`/history/${contract.id}`}
                        onClick={handleClose}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#10253f] dark:bg-[#EAD7B8] hover:bg-[#1e3a5f] text-white dark:text-[#10253f] transition-colors"
                      >
                        <span>{lang === "EN" ? "View Full Details" : "Xem chi tiết phần chấm"}</span>
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
              <h4 className="text-xs font-bold text-[#8297ac] dark:text-[#94a3b8] uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                {lang === "EN" ? "Market Rent Comparison" : "So sánh giá thị trường"}
              </h4>
              <div className="p-4 rounded-xl bg-[#f8fafd] dark:bg-[#0d1829] border border-[#d8e3ef] dark:border-[#1e3558] space-y-3">
                <p className="text-xs text-[#49627d] dark:text-[#cbd5e1]">
                  {lang === "EN" ? (
                    <>Compare rent clauses in <strong className="text-[#10253f] dark:text-white">{uploadedContract.filename}</strong> against student market averages.</>
                  ) : (
                    <>So sánh điều khoản giá thuê trong hợp đồng <strong className="text-[#10253f] dark:text-white">{uploadedContract.filename}</strong> với giá thị trường sinh viên.</>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#49627d] dark:text-[#cbd5e1] mb-1">
                      {lang === "EN" ? "District / Area" : "Quận / Khu vực"}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === "EN" ? "E.g., District 1, Thu Duc..." : "Ví dụ: Quận 1, Thủ Đức..."}
                      value={marketDistrict}
                      onChange={(e) => setMarketDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-[#13233f] border border-[#d8e3ef] dark:border-[#243d63] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f] dark:text-white placeholder-[#8297ac]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#49627d] dark:text-[#cbd5e1] mb-1">
                      {lang === "EN" ? "Monthly Rent (VND)" : "Giá thuê / tháng (VNĐ)"}
                    </label>
                    <input
                      type="number"
                      placeholder={lang === "EN" ? "E.g., 3500000" : "Ví dụ: 3500000"}
                      value={marketRent}
                      onChange={(e) => setMarketRent(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-[#13233f] border border-[#d8e3ef] dark:border-[#243d63] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f] dark:text-white placeholder-[#8297ac]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleMarketCompare}
                  disabled={marketLoading}
                  className="w-full py-2.5 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {marketLoading ? (
                    <span className="w-4 h-4 border-2 border-[#10253f]/30 border-t-[#10253f] rounded-full animate-spin" />
                  ) : (
                    <BarChart2 className="w-4 h-4" />
                  )}
                  {lang === "EN" ? "Compare Now" : "So sánh ngay"}
                </button>
              </div>
              {marketError && (
                <div className="px-3 py-2 bg-[#fff1f0] dark:bg-red-950/50 border border-[#ffd1cc] dark:border-red-900/60 rounded-lg text-xs text-[#e4534b] dark:text-red-300 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {marketError}
                </div>
              )}
              {marketResult && (
                <div className="p-4 rounded-xl bg-white dark:bg-[#0d1829] border border-[#d8e3ef] dark:border-[#1e3558] shadow-sm space-y-4">
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      marketResult.price_evaluation === "fair"
                        ? "bg-[#eafbf7] dark:bg-emerald-950/35 border-[#b7f6e5] dark:border-emerald-800/60"
                        : marketResult.price_evaluation === "high"
                          ? "bg-[#fff1f0] dark:bg-red-950/35 border-[#ffd1cc] dark:border-red-800/60"
                          : "bg-[#fff8e6] dark:bg-amber-950/35 border-[#ffe3a3] dark:border-amber-800/60"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                        marketResult.price_evaluation === "fair"
                          ? "bg-[#159f7b]"
                          : marketResult.price_evaluation === "high"
                            ? "bg-[#e4534b]"
                            : "bg-[#d77714]"
                      }`}
                    >
                      {marketResult.price_difference_percent != null
                        ? `${marketResult.price_difference_percent > 0 ? "+" : ""}${Math.round(marketResult.price_difference_percent)}%`
                        : "—"}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#10253f] dark:text-white">
                        {marketResult.price_evaluation === "fair" &&
                          (lang === "EN" ? "✅ Fair market rent" : "✅ Giá hợp lý so với thị trường")}
                        {marketResult.price_evaluation === "high" &&
                          (lang === "EN" ? "⚠️ Above market average" : "⚠️ Giá cao hơn thị trường")}
                        {marketResult.price_evaluation === "low" &&
                          (lang === "EN" ? "💡 Below market average" : "💡 Giá thấp hơn thị trường")}
                      </p>
                      {marketResult.market_average != null && (
                        <p className="text-xs text-[#49627d] dark:text-[#cbd5e1] mt-0.5">
                          {lang === "EN" ? "Market average:" : "Trung bình thị trường:"}{" "}
                          {marketResult.market_average.toLocaleString("vi-VN")} {lang === "EN" ? "VND/month" : "VNĐ/tháng"}
                        </p>
                      )}
                      {marketResult.district && (
                        <p className="text-xs text-[#8297ac] dark:text-[#94a3b8]">
                          {lang === "EN" ? "Area:" : "Khu vực:"} {marketResult.district}
                        </p>
                      )}
                    </div>
                  </div>
                  {marketResult.recommendations.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-[#49627d] dark:text-[#cbd5e1]">
                        {lang === "EN" ? "Recommendations:" : "Khuyến nghị:"}
                      </p>
                      {marketResult.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#26435e] dark:text-[#cbd5e1]">
                          <ArrowRight className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8] mt-0.5 shrink-0" />
                          <span>{rec}</span>
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
        <div className="px-6 py-3.5 bg-[#f8fafd] dark:bg-[#0d1829] border-t border-[#e6edf4] dark:border-[#1a2d49] flex items-center justify-between">
          <span className="text-xs text-[#8297ac] dark:text-[#94a3b8]">
            {lang === "EN" ? "WeebLegit AI • 100% Data Privacy" : "WeebLegit AI • Bảo mật 100% dữ liệu"}
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[#10253f] dark:bg-[#EAD7B8] hover:bg-[#173d5a] dark:hover:bg-[#dfc59f] text-white dark:text-[#10253f] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {lang === "EN" ? "Close Verifier" : "Đóng bảng kiểm tra"}
          </button>
        </div>
      </motion.div>

      <ContractCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        initialContractAId={uploadedContract?.id}
      />
    </div>
  );
};

