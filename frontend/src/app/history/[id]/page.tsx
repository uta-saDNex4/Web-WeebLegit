"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  LogOut,
  Globe,
  Sun,
  Moon,
  User,
  Crown,
  ArrowLeftRight,
  Printer,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../../lib/auth-context";
import { useLanguage } from "../../../lib/language-context";
import { useTheme } from "../../../lib/theme-context";
import * as api from "../../../lib/api";
import { AuthModal } from "../../../components/AuthModal";
import { FloatingAiWidget } from "../../../components/FloatingAiWidget";
import { ContractCompareModal } from "../../../components/ContractCompareModal";
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

function formatDate(iso: string | null | undefined, isEn = false): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(isEn ? "en-US" : "vi-VN", {
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

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const contractId = params?.id ?? "";

  const { user, logout, loading: authLoading } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const isEn = lang === "EN";

  const planTier = user?.plan_tier || (user?.role === "admin" ? "pro" : "free");
  const canViewClauses = user?.can_view_clauses ?? planTier !== "free";
  const canCompareContracts = user?.can_compare_contracts ?? planTier !== "free";
  const canExportPdf = user?.can_export_pdf ?? planTier === "pro";

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setError(
        err instanceof Error
          ? err.message
          : isEn
            ? "Could not load contract analysis details"
            : "Không thể tải chi tiết phần chấm của hợp đồng"
      );
    } finally {
      setLoading(false);
    }
  }, [user, contractId, isEn]);

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
      // Poll up to 12 times for the background AI task (deepseek-v4.1-flash) to persist
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 1200));
        const res = await api.getAiAnalysis(contractId, vRes.verification_log_id);
        if (res.status === "completed") break;
      }
      await loadContractDetail();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
            ? "Error while re-analyzing contract"
            : "Lỗi khi chấm lại hợp đồng"
      );
    } finally {
      setReVerifying(false);
    }
  };

  const selectedAnalysis = analyses[selectedRunIdx] ?? null;
  const findingsList =
    selectedAnalysis?.findings ?? selectedAnalysis?.ai_findings ?? [];
  const scoreVal = Math.round(selectedAnalysis?.risk_score ?? 0);

  return (
    <div className="min-h-screen bg-[#FAF6EF] dark:bg-[#060d1b] text-[#10253f] dark:text-[#e2e8f0] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF6EF]/90 dark:bg-[#0b1424]/90 backdrop-blur-md border-b border-[#d8e3ef] dark:border-[#1a2d4b] transition-colors">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/history"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] hover:border-[#EAD7B8] text-xs sm:text-sm font-semibold text-[#10253f] dark:text-white transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
              <span>{isEn ? "Back to History" : "Quay lại Lịch sử"}</span>
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase tracking-wider">
                {isEn ? "Contract Analysis Report" : "Chi tiết kết quả chấm hợp đồng"}
              </p>
              <h1 className="text-sm sm:text-base font-extrabold text-[#10253f] dark:text-white truncate">
                {contract?.original_filename ??
                  (isEn ? "Loading contract..." : "Đang tải hợp đồng...")}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] hover:border-[#EAD7B8] text-xs font-bold text-[#10253f] dark:text-[#94a9c9] transition-all cursor-pointer"
              title={isEn ? "Switch language" : "Đổi ngôn ngữ"}
            >
              <Globe className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
              <span>{lang}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] hover:border-[#EAD7B8] text-[#10253f] dark:text-[#94a9c9] transition-all cursor-pointer"
              title={
                isDark
                  ? isEn
                    ? "Switch to Light Mode"
                    : "Chuyển sang giao diện Sáng"
                  : isEn
                    ? "Switch to Dark Mode"
                    : "Chuyển sang giao diện Tối"
              }
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#EAD7B8]" />
              ) : (
                <Moon className="w-4 h-4 text-[#8a6834]" />
              )}
            </button>

            {user ? (
              <>
                <Link
                  href={`/workspace?contractId=${contractId}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10253f] hover:bg-[#1e3a5f] dark:bg-[#FAF5ED] dark:hover:bg-[#EAD7B8] text-white dark:text-[#10253f] text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#EAD7B8] dark:text-[#10253f]" />
                  <span className="hidden sm:inline">
                    {isEn ? "Open in Legal Studio" : "Mở trong Legal Studio"}
                  </span>
                </Link>

                {contract && (
                  <button
                    onClick={handleReVerifyAndAnalyze}
                    disabled={reVerifying}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAD7B8] hover:bg-[#d8bf97] disabled:opacity-60 text-xs font-bold text-[#10253f] transition-all cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${reVerifying ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">
                      {reVerifying
                        ? isEn
                          ? "Re-analyzing..."
                          : "Đang chấm lại..."
                        : isEn
                          ? "Re-verify & Score"
                          : "Chấm & Xác thực lại"}
                    </span>
                  </button>
                )}

                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] hover:border-[#8a6834] dark:hover:border-[#EAD7B8] text-xs font-bold text-[#10253f] dark:text-white shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#EAD7B8] flex items-center justify-center text-[#10253f] text-[11px] font-black uppercase">
                      {(user.full_name ?? user.email).charAt(0)}
                    </div>
                    <span className="hidden md:inline max-w-[110px] truncate">
                      {user.full_name ?? user.email}
                    </span>
                    <span className="text-[11px] font-medium opacity-55 lowercase tracking-tight">
                      -{user?.role === "admin" ? "pro/ad" : planTier}-
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8297ac]" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] rounded-xl shadow-xl py-1 z-50">
                      <div className="px-3.5 py-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]">
                        <p className="text-xs font-bold text-[#10253f] dark:text-white truncate flex items-center gap-1.5">
                          <span className="truncate">
                            {user.full_name ?? (isEn ? "User" : "Người dùng")}
                          </span>
                          <span className="text-[11px] font-normal opacity-55 lowercase shrink-0">
                            -{user?.role === "admin" ? "pro/ad" : planTier}-
                          </span>
                        </p>
                        <p className="text-[11px] text-[#8297ac] dark:text-[#8fa3bf] truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#10253f] dark:text-[#e2e8f0] hover:bg-[#FAF6EF] dark:hover:bg-[#12223c] flex items-center gap-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]"
                      >
                        <FileText className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                        <span>
                          {isEn ? "Home & Check Contract" : "Trang Chủ & Kiểm Tra Hợp Đồng"}
                        </span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#10253f] dark:text-[#e2e8f0] hover:bg-[#FAF6EF] dark:hover:bg-[#12223c] flex items-center gap-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]"
                      >
                        <User className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                        <span>{isEn ? "Profile & AI History" : "Hồ Sơ & Lịch Sử AI"}</span>
                      </Link>
                      <Link
                        href="/workspace"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8] hover:bg-[#FAF6EF] dark:hover:bg-[#12223c] flex items-center gap-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]"
                      >
                        <Sparkles className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                        <span>{isEn ? "Legal Studio (/workspace)" : "Legal Studio (/workspace)"}</span>
                      </Link>
                      <Link
                        href="/history"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8] hover:bg-[#FAF6EF] dark:hover:bg-[#12223c] flex items-center gap-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]"
                      >
                        <Clock className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                        <span>{isEn ? "Contract History" : "Lịch Sử Hợp Đồng"}</span>
                      </Link>
                      <Link
                        href="/upgrade"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8] hover:bg-[#FAF6EF] dark:hover:bg-[#12223c] flex items-center justify-between gap-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]"
                      >
                        <span className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                          <span>{isEn ? "Upgrade Plan" : "Nâng Cấp Gói"}</span>
                        </span>
                        <span className="text-[10px] font-medium opacity-60 lowercase">
                          -{user?.role === "admin" ? "pro/ad" : planTier}-
                        </span>
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8] hover:bg-[#FAF6EF] dark:hover:bg-[#12223c] flex items-center gap-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                          <span>{isEn ? "Admin Dashboard" : "Trang Quản Trị Admin"}</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#e4534b] dark:text-[#f87171] hover:bg-[#fff1f0] dark:hover:bg-[#3f1619]/40 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{isEn ? "Log out" : "Đăng xuất"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#EAD7B8] hover:bg-[#d8bf97] text-[#10253f] font-bold text-xs transition-all cursor-pointer"
              >
                {isEn ? "Sign In" : "Đăng nhập"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {authLoading || loading ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] flex items-center justify-center gap-3 text-[#8297ac]">
            <div className="w-6 h-6 rounded-full border-2 border-[#EAD7B8] border-t-transparent animate-spin" />
            <span className="text-sm font-medium">
              {isEn
                ? "Loading contract analysis data..."
                : "Đang tải dữ liệu phân tích hợp đồng..."}
            </span>
          </div>
        ) : !user ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] text-center max-w-md mx-auto space-y-4">
            <Lock className="w-8 h-8 text-[#8a6834] dark:text-[#EAD7B8] mx-auto" />
            <h2 className="text-lg font-extrabold text-[#10253f] dark:text-white">
              {isEn
                ? "Please sign in to view this contract report"
                : "Vui lòng đăng nhập để xem báo cáo chấm hợp đồng"}
            </h2>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-2.5 bg-[#EAD7B8] hover:bg-[#d8bf97] text-[#10253f] font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              {isEn ? "Sign In Now" : "Đăng nhập ngay"}
            </button>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-[#fff1f0] dark:bg-[#3f1619]/50 border border-[#ffd1cc] dark:border-[#7f1d1d] text-sm text-[#e4534b] dark:text-[#fca5a5] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : contract ? (
          <>
            {/* Contract Overview Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF5ED] dark:bg-[#12223c] border border-[#EAD7B8]/60 dark:border-[#1a2d4b] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#10253f] dark:text-white">
                      {contract.original_filename}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8297ac] dark:text-[#8fa3bf] mt-1">
                      <span>
                        {isEn ? "Size" : "Kích thước"}: {formatBytes(contract.file_size_bytes)}
                      </span>
                      <span>MIME: {contract.mime_type}</span>
                      {contract.contract_type && (
                        <span>
                          {isEn ? "Type" : "Loại"}: {contract.contract_type}
                        </span>
                      )}
                      <span>
                        {isEn ? "Uploaded" : "Ngày tải lên"}:{" "}
                        {formatDate(contract.created_at, isEn)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                      contract.status === "verified"
                        ? "bg-[#eafbf7] dark:bg-[#063328] text-[#0d7a5f] dark:text-[#6ee7b7] border-[#b7f6e5] dark:border-[#115e49]"
                        : "bg-[#f2f7fc] dark:bg-[#12223c] text-[#49627d] dark:text-[#94a9c9] border-[#d8e3ef] dark:border-[#1a2d4b]"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isEn ? "Status" : "Trạng thái"}: {contract.status}
                    </span>
                  </span>
                  <button
                    onClick={() => setShowHashDetails(!showHashDetails)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#f8fafd] dark:bg-[#12223c] hover:bg-[#eef3f8] dark:hover:bg-[#1a2d4b] text-[#49627d] dark:text-[#94a9c9] border border-[#d8e3ef] dark:border-[#1a2d4b] cursor-pointer"
                  >
                    {showHashDetails
                      ? isEn
                        ? "Hide SHA-256"
                        : "Ẩn SHA-256"
                      : isEn
                        ? "View SHA-256"
                        : "Xem SHA-256"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompareModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#FAF5ED] dark:bg-[#162744] text-[#8a6834] dark:text-[#EAD7B8] border border-[#EAD7B8] dark:border-[#2c4670] hover:bg-[#EAD7B8] hover:text-[#10253f] transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>{isEn ? "Compare 2 Contracts" : "So sánh 2 hợp đồng cùng loại"}</span>
                    {!canCompareContracts && <Lock className="w-3 h-3 opacity-75" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canExportPdf) {
                        window.location.href = "/upgrade";
                        return;
                      }
                      window.print();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#12223c] text-[#10253f] dark:text-white border border-[#d8e3ef] dark:border-[#1a2d4b] hover:border-[#EAD7B8] transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
                    <span>{isEn ? "Export PDF Report" : "Xuất báo cáo PDF"}</span>
                    {!canExportPdf && <Lock className="w-3 h-3 text-[#8a6834] opacity-75" />}
                  </button>
                </div>
              </div>

              {showHashDetails && (
                <div className="p-3.5 rounded-xl bg-[#f8fafd] dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] space-y-2">
                  <p className="text-[11px] font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase">
                    {isEn
                      ? "File Integrity Hash (SHA-256)"
                      : "Mã băm toàn vẹn tệp (SHA-256)"}
                  </p>
                  <code className="text-xs font-mono text-[#10253f] dark:text-[#EAD7B8] bg-white dark:bg-[#0b1424] px-3 py-1.5 rounded-lg border border-[#d8e3ef] dark:border-[#1a2d4b] block break-all">
                    {contract.sha256_hash}
                  </code>
                </div>
              )}
            </div>

            {/* Multiple Analysis Runs Selector (Timeline) */}
            {analyses.length > 1 && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-sm space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
                    <span>
                      {isEn
                        ? `Analysis History for this Contract (${analyses.length} runs)`
                        : `Lịch sử các lần chấm của hợp đồng này (${analyses.length} lần)`}
                    </span>
                  </h3>
                  <span className="text-[11px] text-[#159f7b] dark:text-[#6ee7b7] font-semibold">
                    {isEn
                      ? "✓ Deterministic score via Hybrid & SHA-256"
                      : "✓ Điểm số đồng nhất nhờ cơ chế Hybrid & SHA-256"}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {analyses.map((run, idx) => (
                    <button
                      key={run.id}
                      onClick={() => setSelectedRunIdx(idx)}
                      className={`px-3.5 py-2 rounded-xl text-left border transition-all shrink-0 cursor-pointer ${
                        selectedRunIdx === idx
                          ? "bg-[#10253f] dark:bg-[#EAD7B8] text-white dark:text-[#0b1424] border-[#10253f] dark:border-[#EAD7B8]"
                          : "bg-[#f8fafd] dark:bg-[#12223c] text-[#49627d] dark:text-[#94a9c9] border-[#d8e3ef] dark:border-[#1a2d4b] hover:border-[#EAD7B8]"
                      }`}
                    >
                      <div className="text-xs font-bold">
                        {isEn ? `Run #${analyses.length - idx}` : `Lần chấm #${analyses.length - idx}`}{" "}
                        {idx === 0 ? (isEn ? "(Latest)" : "(Mới nhất)") : ""} —{" "}
                        {Math.round(run.risk_score)}/100
                      </div>
                      <div
                        className={`text-[10px] ${
                          selectedRunIdx === idx
                            ? "text-slate-300 dark:text-[#1e293b]"
                            : "text-[#8297ac] dark:text-[#8fa3bf]"
                        }`}
                      >
                        {formatDate(run.created_at, isEn)}
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
                  findings={canViewClauses ? findingsList : []}
                  activeFilter={riskFilter}
                  onFilterChange={setRiskFilter}
                  onSelectClauseIndex={(idx) => {
                    setRiskFilter("all");
                    setExpandedRisk(idx);
                  }}
                />

                {/* Per-Clause Breakdown (Locked for -free- tier) */}
                {!canViewClauses ? (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FAF5ED] to-white dark:from-[#12223c] dark:to-[#0b1424] border border-[#EAD7B8] dark:border-[#2c4670] text-center space-y-3 shadow-sm">
                    <div className="w-11 h-11 rounded-2xl bg-[#EAD7B8]/30 dark:bg-[#162744] border border-[#EAD7B8] flex items-center justify-center mx-auto text-[#8a6834] dark:text-[#EAD7B8]">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-[#10253f] dark:text-white">
                      {isEn
                        ? `Per-Clause Risk Breakdown & Heatmap (${findingsList.length} Clauses) — Locked on -free-`
                        : `Chi tiết rủi ro từng điều khoản & Bản đồ nhiệt (${findingsList.length} điều khoản) — Đang khóa ở gói -free-`}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#49627d] dark:text-[#94a9c9] max-w-xl mx-auto">
                      {isEn
                        ? "The Free plan shows Overall Risk Score, Label, Executive Summary, and SHA-256 verification. Upgrade to Medium (Free for verified students) or Pro to unlock clause-by-clause statutory citations, risk heatmaps, and negotiation scripts."
                        : "Gói Free cung cấp Điểm rủi ro tổng quát, Nhãn đánh giá, Tổng quan hợp đồng và Xác thực SHA-256. Nâng cấp lên gói Medium (Miễn phí cho sinh viên xác thực) hoặc Pro để mở khóa phân tích từng điều khoản, căn cứ pháp lý và câu gợi ý đàm phán."}
                    </p>
                    <div className="pt-1">
                      <Link
                        href="/upgrade"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10253f] dark:bg-[#EAD7B8] text-white dark:text-[#0b1424] text-xs font-bold hover:opacity-90 transition-all"
                      >
                        <Crown className="w-4 h-4" />
                        <span>
                          {isEn
                            ? "Upgrade to Medium / Pro Plan"
                            : "Nâng cấp gói Medium / Pro để mở khóa"}
                        </span>
                      </Link>
                    </div>
                  </div>
                ) : (() => {
                  const filteredFindings = findingsList
                    .map((item, originalIdx) => ({ item, originalIdx }))
                    .filter(({ item }) =>
                      riskFilter === "all" ? true : getClauseBucket(item) === riskFilter
                    );

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                          <h3 className="text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase tracking-wider">
                            {isEn
                              ? `Per-Clause Risk Breakdown (${filteredFindings.length}/${findingsList.length})`
                              : `Chi tiết mức độ rủi ro từng điều khoản (${filteredFindings.length}/${findingsList.length})`}
                          </h3>
                        </div>
                        {findingsList.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRisk(expandedRisk === -99 ? null : -99)
                            }
                            className="text-xs font-semibold text-[#8a6834] dark:text-[#EAD7B8] hover:underline cursor-pointer"
                          >
                            {expandedRisk === -99
                              ? isEn
                                ? "Collapse All"
                                : "Thu gọn bớt"
                              : isEn
                                ? "Expand All Clauses"
                                : "Mở tất cả điều khoản"}
                          </button>
                        )}
                      </div>

                      {filteredFindings.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-[#eafbf7] dark:bg-[#063328]/60 border border-[#b7f6e5] dark:border-[#115e49] flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-[#159f7b] dark:text-[#6ee7b7] shrink-0" />
                          <p className="text-sm font-semibold text-[#0d7a5f] dark:text-[#6ee7b7]">
                            {isEn
                              ? "No clauses match this filter category."
                              : "Không có điều khoản nào thuộc nhóm bộ lọc này."}
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
                            (isEn ? `Clause #${idx + 1}` : `Điều khoản #${idx + 1}`);
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
                              className="p-5 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-sm"
                            >
                              <div
                                className="flex items-center justify-between cursor-pointer gap-3"
                                onClick={() =>
                                  setExpandedRisk(isOpen && expandedRisk !== -99 ? -1 : idx)
                                }
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  {level === "critical" ? (
                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#fff1f0] dark:bg-[#3f1619]/70 text-[#c92a2a] dark:text-[#fca5a5] border border-[#ffa8a8] dark:border-[#7f1d1d]">
                                      {isEn ? "Critical Risk" : "Rủi ro nghiêm trọng"}
                                    </span>
                                  ) : level === "high" ? (
                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#fff1f0] dark:bg-[#3f1619]/70 text-[#e4534b] dark:text-[#fca5a5] border border-[#ffd1cc] dark:border-[#7f1d1d]">
                                      {isEn ? "High Risk" : "Mức rủi ro cao"}
                                    </span>
                                  ) : level === "medium" ? (
                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#fff4e6] dark:bg-[#3d260b]/70 text-[#d77714] dark:text-[#fdba74] border border-[#ffd8a8] dark:border-[#78350f]">
                                      {isEn ? "Needs Clarification" : "Cần làm rõ"}
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#f2f7fc] dark:bg-[#12223c] text-[#49627d] dark:text-[#94a9c9] border border-[#d8e3ef] dark:border-[#1a2d4b]">
                                      {isEn ? "Minor Note" : "Lưu ý nhẹ"}
                                    </span>
                                  )}

                                  <span
                                    className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold border ${
                                      clauseScore >= 70
                                        ? "bg-[#fff1f0] dark:bg-[#3f1619]/70 text-[#e4534b] dark:text-[#fca5a5] border-[#ffd1cc] dark:border-[#7f1d1d]"
                                        : clauseScore >= 40
                                          ? "bg-[#fff4e6] dark:bg-[#3d260b]/70 text-[#d77714] dark:text-[#fdba74] border-[#ffd8a8] dark:border-[#78350f]"
                                          : "bg-[#eafbf7] dark:bg-[#063328]/70 text-[#159f7b] dark:text-[#6ee7b7] border-[#b7f6e5] dark:border-[#115e49]"
                                    }`}
                                  >
                                    {isEn
                                      ? `Clause Score: ${Math.round(clauseScore)}/100`
                                      : `Điểm điều khoản: ${Math.round(clauseScore)}/100`}
                                  </span>

                                  <h4 className="text-sm sm:text-base font-bold text-[#10253f] dark:text-white">
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
                              <div className="mt-3 h-2 bg-[#f0f4f8] dark:bg-[#12223c] rounded-full overflow-hidden">
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
                                        <div className="p-3.5 bg-[#f8fafd] dark:bg-[#12223c] rounded-xl text-xs sm:text-sm text-[#26435e] dark:text-[#cbd5e1] italic border-l-3 border-[#EAD7B8]">
                                          &quot;{quoteText}&quot;
                                        </div>
                                      )}
                                      {analysisText && (
                                        <div className="text-xs sm:text-sm text-[#49627d] dark:text-[#94a9c9] leading-relaxed">
                                          <strong className="text-[#10253f] dark:text-white">
                                            {isEn
                                              ? "Analysis & Recommendation:"
                                              : "Phân tích & Khuyến nghị:"}
                                          </strong>{" "}
                                          {analysisText}
                                        </div>
                                      )}
                                      {lawRef && (
                                        <div className="text-xs sm:text-sm text-[#8a6834] dark:text-[#EAD7B8] font-semibold flex items-center justify-between gap-2 flex-wrap bg-[#FAF5ED] dark:bg-[#12223c] px-3.5 py-2.5 rounded-xl border border-[#EAD7B8]/70 dark:border-[#1a2d4b]">
                                          <span className="flex items-center gap-1.5">
                                            <BookOpen className="w-4 h-4 shrink-0" />
                                            <span>
                                              {isEn ? "Legal Reference:" : "Căn cứ pháp lý:"}{" "}
                                              <strong>{lawRef}</strong>
                                            </span>
                                          </span>
                                          <a
                                            href={`https://thuvienphapluat.vn/page/tim-van-ban.aspx?keyword=${encodeURIComponent(lawRef)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-bold text-[#10253f] dark:text-white hover:text-[#8a6834] dark:hover:text-[#EAD7B8] underline"
                                          >
                                            <span>
                                              {isEn
                                                ? "Look up original law"
                                                : "Tra cứu điều luật gốc"}
                                            </span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        </div>
                                      )}
                                      {risk.negotiation_script && (
                                        <div className="pt-3 border-t border-[#e6edf4] dark:border-[#1a2d4b]">
                                          <div className="flex items-center justify-between text-xs font-bold text-[#159f7b] dark:text-[#6ee7b7] mb-1.5">
                                            <span className="flex items-center gap-1.5">
                                              <MessageCircle className="w-3.5 h-3.5" />
                                              {isEn
                                                ? "Suggested Negotiation Script:"
                                                : "Gợi ý câu trao đổi / đàm phán:"}
                                            </span>
                                            <button
                                              onClick={() =>
                                                handleCopy(
                                                  `risk-${idx}`,
                                                  risk.negotiation_script ?? ""
                                                )
                                              }
                                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#eafbf7] dark:bg-[#063328] hover:bg-[#d0f5ec] dark:hover:bg-[#115e49] text-[#159f7b] dark:text-[#6ee7b7] border border-[#b7f6e5] dark:border-[#115e49] transition-colors cursor-pointer"
                                            >
                                              {copiedId === `risk-${idx}` ? (
                                                <>
                                                  <Check className="w-3.5 h-3.5" />
                                                  <span>{isEn ? "Copied" : "Đã sao chép"}</span>
                                                </>
                                              ) : (
                                                <>
                                                  <Copy className="w-3.5 h-3.5" />
                                                  <span>
                                                    {isEn ? "Copy script" : "Sao chép mẫu câu"}
                                                  </span>
                                                </>
                                              )}
                                            </button>
                                          </div>
                                          <p className="text-xs sm:text-sm text-[#26435e] dark:text-[#cbd5e1] bg-[#f7fafc] dark:bg-[#12223c] p-3 rounded-xl border border-[#e6edf4] dark:border-[#1a2d4b]">
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
              <div className="p-8 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] text-center space-y-3">
                <p className="text-sm text-[#49627d] dark:text-[#94a9c9]">
                  {isEn ? (
                    <>
                      This contract does not have a saved analysis report yet. Click{" "}
                      <strong>&quot;Re-verify &amp; Score&quot;</strong> at the top right to
                      generate one now.
                    </>
                  ) : (
                    <>
                      Hợp đồng này chưa có bản lưu kết quả chấm. Hãy bấm nút{" "}
                      <strong>&quot;Chấm &amp; Xác thực lại&quot;</strong> ở góc trên để tạo báo
                      cáo ngay.
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Audit Log History (SHA-256 Verifications) */}
            {verifications.length > 0 && (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#159f7b] dark:text-[#6ee7b7]" />
                  <span>
                    {isEn
                      ? `SHA-256 Integrity Verification Audit Log (${verifications.length} runs)`
                      : `Nhật ký xác thực toàn vẹn SHA-256 (${verifications.length} lượt)`}
                  </span>
                </h3>
                <div className="space-y-2">
                  {verifications.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl bg-[#f8fafd] dark:bg-[#12223c] border border-[#e6edf4] dark:border-[#1a2d4b] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            v.result === "matched"
                              ? "bg-[#eafbf7] dark:bg-[#063328] text-[#0d7a5f] dark:text-[#6ee7b7]"
                              : "bg-[#fff1f0] dark:bg-[#3f1619] text-[#e4534b] dark:text-[#fca5a5]"
                          }`}
                        >
                          {v.result === "matched"
                            ? isEn
                              ? "SHA-256 Matched"
                              : "Khớp SHA-256"
                            : v.result}
                        </span>
                        <span className="text-[#49627d] dark:text-[#94a9c9] font-mono truncate max-w-[260px]">
                          {v.actual_sha256}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[#8297ac] dark:text-[#8fa3bf]">
                        {v.duration_ms != null && <span>{v.duration_ms} ms</span>}
                        <span>{formatDate(v.created_at, isEn)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>

      <ContractCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        initialContractAId={contract?.id}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <FloatingAiWidget />
    </div>
  );
}
