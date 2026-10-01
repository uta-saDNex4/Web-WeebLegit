"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Search,
  Sparkles,
  BarChart2,
  Lock,
  RefreshCw,
  ChevronDown,
  LogOut,
  Globe,
  Sun,
  Moon,
  User,
  Crown,
  ArrowLeftRight,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../lib/language-context";
import { useTheme } from "../../lib/theme-context";
import * as api from "../../lib/api";
import { AuthModal } from "../../components/AuthModal";
import { FloatingAiWidget } from "../../components/FloatingAiWidget";
import { ContractCompareModal } from "../../components/ContractCompareModal";

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
    });
  } catch {
    return iso;
  }
}

export default function HistoryPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const isEn = lang === "EN";

  const planTier = user?.plan_tier || (user?.role === "admin" ? "pro" : "free");
  const canViewClauses = user?.can_view_clauses ?? planTier !== "free";
  const canCompareContracts = user?.can_compare_contracts ?? planTier !== "free";

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

  const [contracts, setContracts] = useState<api.ContractResponse[]>([]);
  const [analyses, setAnalyses] = useState<api.AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "safe">("all");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [contractRes, analysisRes] = await Promise.all([
        api.listContracts({ limit: 50 }),
        api.getMyAnalysisHistory({ limit: 100 }),
      ]);
      setContracts(contractRes.items);
      setAnalyses(analysisRes.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
            ? "Could not load contract analysis history"
            : "Không thể tải lịch sử chấm hợp đồng"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void fetchData();
    }
  }, [user]);

  // Group analyses by contract_id
  const analysesByContract = useMemo(() => {
    const map = new Map<string, api.AnalysisHistoryItem[]>();
    for (const item of analyses) {
      const list = map.get(item.contract_id) ?? [];
      list.push(item);
      map.set(item.contract_id, list);
    }
    return map;
  }, [analyses]);

  const enrichedContracts = useMemo(() => {
    return contracts
      .map((c) => {
        const contractAnalyses = analysesByContract.get(c.id) ?? [];
        const latestAnalysis = contractAnalyses[0] ?? null;
        return {
          contract: c,
          latestAnalysis,
          analysisCount: contractAnalyses.length,
        };
      })
      .filter(({ contract, latestAnalysis }) => {
        if (
          searchQuery.trim() &&
          !contract.original_filename.toLowerCase().includes(searchQuery.trim().toLowerCase())
        ) {
          return false;
        }
        if (riskFilter === "all") return true;
        if (!latestAnalysis) return false;
        const score = latestAnalysis.risk_score;
        if (riskFilter === "high") return score >= 70;
        if (riskFilter === "medium") return score >= 35 && score < 70;
        if (riskFilter === "safe") return score < 35;
        return true;
      });
  }, [contracts, analysesByContract, searchQuery, riskFilter]);

  const stats = useMemo(() => {
    const totalContracts = contracts.length;
    const totalAnalyses = analyses.length;
    const latestScores = contracts
      .map((c) => analysesByContract.get(c.id)?.[0]?.risk_score)
      .filter((s): s is number => s != null);
    const avgScore =
      latestScores.length > 0
        ? Math.round(latestScores.reduce((a, b) => a + b, 0) / latestScores.length)
        : 0;
    const highRiskCount = latestScores.filter((s) => s >= 70).length;
    return { totalContracts, totalAnalyses, avgScore, highRiskCount };
  }, [contracts, analyses, analysesByContract]);

  return (
    <div className="min-h-screen bg-[#FAF6EF] dark:bg-[#060d1b] text-[#10253f] dark:text-[#e2e8f0] transition-colors duration-300">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF6EF]/90 dark:bg-[#0b1424]/90 backdrop-blur-md border-b border-[#d8e3ef] dark:border-[#1a2d4b] transition-colors">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] hover:border-[#EAD7B8] dark:hover:border-[#EAD7B8] text-xs sm:text-sm font-semibold text-[#10253f] dark:text-white transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
              <span>{isEn ? "Home" : "Trang chủ"}</span>
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8] shrink-0" />
              <h1 className="text-sm sm:text-lg font-extrabold text-[#10253f] dark:text-white truncate">
                {isEn
                  ? "Contract Verification & AI Scoring History"
                  : "Lịch sử kiểm tra & chấm điểm hợp đồng"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
                <button
                  onClick={fetchData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] hover:border-[#EAD7B8] text-xs font-semibold text-[#49627d] dark:text-[#94a9c9] hover:text-[#10253f] dark:hover:text-white transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">{isEn ? "Refresh" : "Làm mới"}</span>
                </button>

                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] hover:border-[#8a6834] dark:hover:border-[#EAD7B8] text-xs font-bold text-[#10253f] dark:text-white shadow-2xs transition-all cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#EAD7B8] flex items-center justify-center text-[#10253f] text-[11px] font-black uppercase">
                      {(user.full_name ?? user.email).charAt(0)}
                    </div>
                    <span className="hidden md:inline max-w-[120px] truncate">
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
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8] bg-[#FAF5ED]/70 dark:bg-[#12223c] hover:bg-[#FAF6EF] dark:hover:bg-[#162a47] flex items-center justify-between gap-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]"
                      >
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                          <span>{isEn ? "Contract History" : "Lịch Sử Hợp Đồng"}</span>
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[#159f7b]" />
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

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {authLoading ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] flex items-center justify-center gap-3 text-[#8297ac]">
            <div className="w-6 h-6 rounded-full border-2 border-[#EAD7B8] border-t-transparent animate-spin" />
            <span className="text-sm font-medium">
              {isEn ? "Checking account session..." : "Đang kiểm tra tài khoản..."}
            </span>
          </div>
        ) : !user ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF5ED] dark:bg-[#12223c] border border-[#EAD7B8]/50 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-[#8a6834] dark:text-[#EAD7B8]" />
            </div>
            <h2 className="text-lg font-extrabold text-[#10253f] dark:text-white">
              {isEn
                ? "Sign in to view your contract history"
                : "Đăng nhập để xem lịch sử chấm hợp đồng"}
            </h2>
            <p className="text-sm text-[#49627d] dark:text-[#94a9c9]">
              {isEn
                ? "All AI risk analysis reports and SHA-256 verification logs are securely saved per account."
                : "Mọi kết quả phân tích AI và đối chiếu SHA-256 đều được lưu trữ riêng cho từng tài khoản."}
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-2.5 bg-[#EAD7B8] hover:bg-[#d8bf97] text-[#10253f] font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              {isEn ? "Sign In / Register Now" : "Đăng nhập / Đăng ký ngay"}
            </button>
          </div>
        ) : (
          <>
            {/* Summary Bento Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase">
                  <span>{isEn ? "Total Contracts" : "Tổng hợp đồng"}</span>
                  <FileText className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#10253f] dark:text-white">
                  {stats.totalContracts}
                </div>
                <p className="text-xs text-[#8297ac] dark:text-[#8fa3bf] mt-0.5">
                  {isEn ? "Uploaded to your account" : "Đã tải lên tài khoản"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase">
                  <span>{isEn ? "AI Analysis Runs" : "Số lượt chấm AI"}</span>
                  <Sparkles className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#10253f] dark:text-white">
                  {stats.totalAnalyses}
                </div>
                <p className="text-xs text-[#8297ac] dark:text-[#8fa3bf] mt-0.5">
                  {isEn ? "Persisted in database" : "Lưu trữ bền vững trong DB"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase">
                  <span>{isEn ? "Avg Risk Score" : "Điểm rủi ro TB"}</span>
                  <BarChart2 className="w-4 h-4 text-[#d77714]" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#10253f] dark:text-white">
                  {stats.avgScore}/100
                </div>
                <p className="text-xs text-[#8297ac] dark:text-[#8fa3bf] mt-0.5">
                  {isEn ? "Hybrid scale 0–100" : "Thang điểm Hybrid 0–100"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase">
                  <span>{isEn ? "High Risk Contracts" : "Hợp đồng rủi ro cao"}</span>
                  <AlertTriangle className="w-4 h-4 text-[#e4534b]" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#e4534b] dark:text-[#f87171]">
                  {stats.highRiskCount}
                </div>
                <p className="text-xs text-[#8297ac] dark:text-[#8fa3bf] mt-0.5">
                  {isEn ? "Risk score ≥ 70/100" : "Điểm rủi ro ≥ 70/100"}
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8297ac] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isEn
                      ? "Search by contract filename..."
                      : "Tìm kiếm theo tên file hợp đồng..."
                  }
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-[#12223c] text-[#10253f] dark:text-white placeholder:text-[#8297ac] border border-[#d8e3ef] dark:border-[#1a2d4b] focus:outline-none focus:border-[#EAD7B8]"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { key: "all", label: isEn ? "All" : "Tất cả" },
                    { key: "high", label: isEn ? "High Risk (≥70)" : "Rủi ro cao (≥70)" },
                    { key: "medium", label: isEn ? "Caution (35–69)" : "Cần lưu ý (35–69)" },
                    { key: "safe", label: isEn ? "Safe (<35)" : "An toàn (<35)" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setRiskFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      riskFilter === tab.key
                        ? "bg-[#10253f] dark:bg-[#EAD7B8] text-white dark:text-[#0b1424]"
                        : "bg-[#f8fafd] dark:bg-[#12223c] text-[#49627d] dark:text-[#94a9c9] hover:bg-[#eef3f8] dark:hover:bg-[#1a2d4b] border border-[#d8e3ef] dark:border-[#1a2d4b]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCompareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF5ED] dark:bg-[#162744] text-[#8a6834] dark:text-[#EAD7B8] border border-[#EAD7B8] dark:border-[#2c4670] hover:bg-[#EAD7B8] hover:text-[#10253f] transition-all cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>
                    {isEn ? "Compare 2 Contracts" : "So sánh 2 hợp đồng cùng loại"}
                  </span>
                  {!canCompareContracts && (
                    <Lock className="w-3 h-3 opacity-75" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-[#fff1f0] dark:bg-[#3f1619]/50 border border-[#ffd1cc] dark:border-[#7f1d1d] text-sm text-[#e4534b] dark:text-[#fca5a5] font-medium">
                {error}
              </div>
            )}

            {loading ? (
              <div className="p-12 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] flex items-center justify-center gap-3 text-[#8297ac]">
                <div className="w-6 h-6 rounded-full border-2 border-[#EAD7B8] border-t-transparent animate-spin" />
                <span className="text-sm font-medium">
                  {isEn ? "Loading contracts..." : "Đang tải danh sách hợp đồng..."}
                </span>
              </div>
            ) : enrichedContracts.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] text-center space-y-3">
                <FileText className="w-10 h-10 text-[#8297ac] mx-auto" />
                <h3 className="text-base font-bold text-[#10253f] dark:text-white">
                  {isEn
                    ? "No contracts match the selected filter"
                    : "Chưa có hợp đồng nào khớp bộ lọc"}
                </h3>
                <p className="text-sm text-[#8297ac] dark:text-[#8fa3bf]">
                  {isEn
                    ? "Return to the homepage and upload a contract for AI risk scoring and permanent history storage."
                    : "Hãy quay về trang chủ và tải hợp đồng lên để AI chấm điểm và lưu trữ vào lịch sử của bạn."}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EAD7B8] hover:bg-[#d8bf97] text-sm font-bold text-[#10253f] transition-all"
                >
                  <span>{isEn ? "Go to Homepage & Check Now" : "Về trang chủ kiểm tra ngay"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrichedContracts.map(({ contract, latestAnalysis, analysisCount }) => {
                  const score = Math.round(latestAnalysis?.risk_score ?? 0);
                  const findings =
                    latestAnalysis?.findings ?? latestAnalysis?.ai_findings ?? [];

                  return (
                    <div
                      key={contract.id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] hover:border-[#EAD7B8] dark:hover:border-[#EAD7B8] shadow-sm transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <FileText className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8] shrink-0" />
                            <h3 className="text-base font-extrabold text-[#10253f] dark:text-white">
                              {contract.original_filename}
                            </h3>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                contract.status === "verified"
                                  ? "bg-[#eafbf7] dark:bg-[#063328] text-[#0d7a5f] dark:text-[#6ee7b7] border-[#b7f6e5] dark:border-[#115e49]"
                                  : "bg-[#f2f7fc] dark:bg-[#12223c] text-[#49627d] dark:text-[#94a9c9] border-[#d8e3ef] dark:border-[#1a2d4b]"
                              }`}
                            >
                              {contract.status === "verified" ? (
                                <span className="inline-flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />{" "}
                                  {isEn ? "SHA-256 Verified" : "Đã xác thực SHA-256"}
                                </span>
                              ) : (
                                contract.status
                              )}
                            </span>
                            {analysisCount > 0 && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF5ED] dark:bg-[#12223c] text-[#8a6834] dark:text-[#EAD7B8] border border-[#EAD7B8]/60 dark:border-[#1a2d4b]">
                                {isEn
                                  ? `Analyzed ${analysisCount}x`
                                  : `Đã chấm ${analysisCount} lần`}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8297ac] dark:text-[#8fa3bf]">
                            <span>
                              {isEn ? "Size" : "Kích thước"}: {formatBytes(contract.file_size_bytes)}
                            </span>
                            <span>
                              {isEn ? "Format" : "Định dạng"}: {contract.mime_type}
                            </span>
                            {contract.contract_type && (
                              <span>
                                {isEn ? "Type" : "Loại"}: {contract.contract_type}
                              </span>
                            )}
                            <span>
                              {isEn ? "Uploaded" : "Tải lên"}:{" "}
                              {formatDate(contract.created_at, isEn)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {latestAnalysis ? (
                            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#fff8e6] dark:bg-[#12223c] border border-[#ffe3a3] dark:border-[#1a2d4b]">
                              <div
                                className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-extrabold text-xs shrink-0 ${
                                  score >= 70
                                    ? "bg-[#e4534b]"
                                    : score >= 35
                                      ? "bg-[#d77714]"
                                      : "bg-[#159f7b]"
                                }`}
                              >
                                {score}/100
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#7d480e] dark:text-[#EAD7B8]">
                                  {latestAnalysis.risk_label}
                                </div>
                                <div className="text-[11px] text-[#996324] dark:text-[#94a9c9]">
                                  {isEn
                                    ? `${findings.length} clauses flagged`
                                    : `${findings.length} điều khoản lưu ý`}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#8297ac] dark:text-[#8fa3bf] italic">
                              {isEn
                                ? "Not yet scored (Open to analyze now)"
                                : "Chưa có bản chấm lưu sẵn (Mở để chấm ngay)"}
                            </span>
                          )}

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href={`/workspace?contractId=${contract.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#162744] hover:bg-[#EAD7B8] dark:hover:bg-[#203a63] text-[#8a6834] dark:text-[#EAD7B8] border border-[#EAD7B8] dark:border-[#2f4973] text-xs font-bold transition-all shadow-2xs"
                              title="Open in Legal Studio"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Legal Studio</span>
                            </Link>

                            <Link
                              href={`/history/${contract.id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10253f] dark:bg-[#EAD7B8] hover:bg-[#1e3a5f] dark:hover:bg-[#d8bf97] text-white dark:text-[#0b1424] text-xs font-bold transition-all shrink-0"
                            >
                              <span>{isEn ? "View Analysis" : "Xem lại phần chấm"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Quick preview of top risky clauses if available (gated for -free-) */}
                      {findings.length > 0 && (
                        <div className="pt-3 border-t border-[#e6edf4] dark:border-[#1a2d4b] flex flex-wrap items-center justify-between gap-2">
                          {canViewClauses ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase">
                                {isEn ? "Flagged Clauses:" : "Điều khoản phát hiện:"}
                              </span>
                              {findings.slice(0, 4).map((f, idx) => {
                                const cScore = Math.round(f.clause_risk_score ?? 45);
                                return (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                      cScore >= 70
                                        ? "bg-[#fff1f0] dark:bg-[#3f1619]/60 text-[#e4534b] dark:text-[#fca5a5] border-[#ffd1cc] dark:border-[#7f1d1d]"
                                        : cScore >= 40
                                          ? "bg-[#fff4e6] dark:bg-[#3d260b]/60 text-[#d77714] dark:text-[#fdba74] border-[#ffd8a8] dark:border-[#78350f]"
                                          : "bg-[#eafbf7] dark:bg-[#063328]/60 text-[#159f7b] dark:text-[#6ee7b7] border-[#b7f6e5] dark:border-[#115e49]"
                                    }`}
                                  >
                                    <span>{f.title ?? f.matched_term}</span>
                                    <span className="font-extrabold">({cScore}/100)</span>
                                  </span>
                                );
                              })}
                              {findings.length > 4 && (
                                <span className="text-[11px] text-[#8297ac] dark:text-[#8fa3bf] font-medium">
                                  {isEn
                                    ? `+${findings.length - 4} more clauses`
                                    : `+${findings.length - 4} điều khoản khác`}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1.5 text-xs text-[#8a6834] dark:text-[#EAD7B8] font-medium">
                                <Lock className="w-3.5 h-3.5" />
                                <span>
                                  {isEn
                                    ? `Detailed clause breakdown (${findings.length} clauses) is locked on -free- plan`
                                    : `Chi tiết từng điều khoản rủi ro (${findings.length} mục) đang khóa ở gói -free-`}
                                </span>
                              </span>
                              <Link
                                href="/upgrade"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF5ED] dark:bg-[#162744] text-[#8a6834] dark:text-[#EAD7B8] border border-[#EAD7B8] text-[11px] font-bold hover:bg-[#EAD7B8] hover:text-[#10253f] transition-colors"
                              >
                                <Crown className="w-3 h-3" />
                                <span>{isEn ? "Unlock Medium / Pro" : "Mở khóa gói Medium / Pro"}</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <ContractCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <FloatingAiWidget />
    </div>
  );
}
