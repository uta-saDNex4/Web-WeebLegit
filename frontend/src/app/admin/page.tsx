"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  FileText,
  Activity,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  LogOut,
  Sliders,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  User,
} from "lucide-react";
import * as api from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";
import { useLanguage } from "../../lib/language-context";

type AdminTab = "overview" | "contracts" | "users" | "logs" | "rules";

export default function AdminPage() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const isDark = theme === "dark";
  const isEn = lang === "EN";

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<api.AdminStatsResponse | null>(null);
  const [contracts, setContracts] = useState<api.AdminContractItem[]>([]);
  const [usersList, setUsersList] = useState<api.AdminUserResponse[]>([]);
  const [logs, setLogs] = useState<api.AdminLogItem[]>([]);
  const [rules, setRules] = useState<api.AdminRiskRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User dropdown state
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

  // Admin login form state for guest / non-admin
  const [loginEmail, setLoginEmail] = useState("admin@weeblegit.vn");
  const [loginPassword, setLoginPassword] = useState("Admin@123456");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Add rule state + inline feedback (replaces window.alert)
  const [showAddRule, setShowAddRule] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newLevel, setNewLevel] = useState<"critical" | "high" | "medium" | "low">("high");
  const [newWarning, setNewWarning] = useState("");
  const [newSection, setNewSection] = useState("Điều khoản rủi ro");
  const [addingRule, setAddingRule] = useState(false);
  const [ruleFeedback, setRuleFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // User management action state (tier upgrade & status toggle)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [userActionFeedback, setUserActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleUpdateUserTier = async (userId: string, newTier: "free" | "medium" | "pro") => {
    setUpdatingUserId(userId);
    setUserActionFeedback(null);
    try {
      const res = await api.updateAdminUserTier(userId, newTier);
      setUserActionFeedback({
        type: "success",
        message: isEn
          ? `Updated plan tier to ${newTier.toUpperCase()} successfully (active instantly, no server restart needed)!`
          : `Đã nâng cấp gói thành công sang ${newTier.toUpperCase()} (áp dụng ngay lập tức, không cần khởi động lại web)!`,
      });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan_tier: res.plan_tier } : u))
      );
    } catch (err: unknown) {
      setUserActionFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : isEn
              ? "Failed to update plan tier"
              : "Cập nhật gói thất bại",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentActive: boolean) => {
    setUpdatingUserId(userId);
    setUserActionFeedback(null);
    try {
      const res = await api.updateAdminUserStatus(userId, !currentActive);
      setUserActionFeedback({
        type: "success",
        message: isEn
          ? `User account ${res.is_active ? "activated" : "disabled"} successfully!`
          : `Đã ${res.is_active ? "mở khóa" : "khóa"} tài khoản thành công!`,
      });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: res.is_active } : u))
      );
    } catch (err: unknown) {
      setUserActionFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : isEn
              ? "Failed to change user status"
              : "Thay đổi trạng thái thất bại",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const loadData = async () => {
    if (!user || user.role !== "admin") return;
    setLoading(true);
    setError(null);
    try {
      const [sData, cData, uData, lData, rData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminContracts(),
        api.getAdminUsers(),
        api.getAdminLogs(),
        api.getAdminRiskRules(),
      ]);
      setStats(sData);
      setContracts(cData || []);
      setUsersList(uData || []);
      setLogs(lData || []);
      setRules(rData || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
            ? "Failed to load admin dashboard data"
            : "Lỗi khi tải dữ liệu quản trị"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      void loadData();
    }
  }, [user]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: unknown) {
      setLoginError(
        err instanceof Error
          ? err.message
          : isEn
            ? "Admin sign-in failed"
            : "Đăng nhập admin thất bại"
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newWarning.trim()) return;
    setAddingRule(true);
    setRuleFeedback(null);
    try {
      await api.createAdminRiskRule({
        keyword_trigger: newKeyword.trim(),
        risk_level: newLevel,
        default_warning_message: newWarning.trim(),
        target_section: newSection.trim() || undefined,
      });
      setNewKeyword("");
      setNewWarning("");
      setShowAddRule(false);
      setRuleFeedback({
        type: "success",
        message: isEn
          ? "Risk rule created successfully!"
          : "Đã tạo quy tắc nhận diện rủi ro mới thành công!",
      });
      await loadData();
    } catch (err: unknown) {
      setRuleFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : isEn
              ? "Failed to create risk rule"
              : "Lỗi khi tạo quy tắc",
      });
    } finally {
      setAddingRule(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (iso: string) => {
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
  };

  // ─── Render Loading ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] dark:bg-[#060d1b] flex items-center justify-center transition-colors">
        <div className="flex items-center gap-3 text-[#10253f] dark:text-[#e2e8f0]">
          <div className="w-6 h-6 border-2 border-[#EAD7B8] border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-sm">
            {isEn ? "Checking authentication..." : "Đang tải xác thực..."}
          </span>
        </div>
      </div>
    );
  }

  // ─── Render Login for non-admins ──────────────────────────────────────────
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FAF6EF] dark:bg-[#060d1b] flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-xl p-8 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAD7B8] flex items-center justify-center text-[#10253f] shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#10253f] dark:text-white">
                  WeebLegit Admin Portal
                </h2>
                <p className="text-xs text-[#8297ac] dark:text-[#8fa3bf]">
                  {isEn ? "System Administration Area" : "Khu vực quản trị hệ thống"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleLang}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#d8e3ef] dark:border-[#1a2d4b] bg-[#FAF6EF] dark:bg-[#12223c] text-xs font-bold text-[#10253f] dark:text-[#94a9c9] cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
                <span>{lang}</span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-[#d8e3ef] dark:border-[#1a2d4b] bg-[#FAF6EF] dark:bg-[#12223c] text-[#8a6834] dark:text-[#EAD7B8] cursor-pointer"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {user && user.role !== "admin" && (
            <div className="p-3 bg-[#fff1f0] dark:bg-[#3f1619]/50 border border-[#ffd1cc] dark:border-[#7f1d1d] rounded-xl text-xs text-[#e4534b] dark:text-[#fca5a5]">
              {isEn ? (
                <>
                  Current account (<strong>{user.email}</strong>) does not have Admin privileges.
                  Please sign in with an Administrator account.
                </>
              ) : (
                <>
                  Tài khoản hiện tại (<strong>{user.email}</strong>) không có quyền Quản trị viên
                  (Admin). Vui lòng đăng nhập tài khoản Admin.
                </>
              )}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#49627d] dark:text-[#94a9c9] mb-1">
                {isEn ? "Administrator Email" : "Email Quản trị viên"}
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] rounded-xl focus:outline-none focus:border-[#EAD7B8] text-[#10253f] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#49627d] dark:text-[#94a9c9] mb-1">
                {isEn ? "Password" : "Mật khẩu"}
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] rounded-xl focus:outline-none focus:border-[#EAD7B8] text-[#10253f] dark:text-white"
              />
            </div>

            {loginError && (
              <div className="p-2.5 bg-[#fff1f0] dark:bg-[#3f1619]/50 border border-[#ffd1cc] dark:border-[#7f1d1d] rounded-lg text-xs text-[#e4534b] dark:text-[#fca5a5]">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 bg-[#10253f] dark:bg-[#EAD7B8] hover:bg-[#173d5a] dark:hover:bg-[#d8bf97] text-[#EAD7B8] dark:text-[#0b1424] text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {isEn ? "Sign In as Administrator" : "Đăng nhập Quản trị"}
            </button>
          </form>

          <div className="pt-2 border-t border-[#e6edf4] dark:border-[#1a2d4b] flex justify-between items-center text-xs">
            <Link
              href="/"
              className="text-[#8a6834] dark:text-[#EAD7B8] font-semibold hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {isEn ? "Back to Home" : "Về trang chủ"}
            </Link>
            <span className="text-[#8297ac] dark:text-[#8fa3bf]">
              {isEn ? "Internal Portal" : "Cổng nội bộ"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Admin Dashboard ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF6EF] dark:bg-[#060d1b] text-[#10253f] dark:text-[#e2e8f0] flex flex-col transition-colors duration-300">
      {/* Top Header */}
      <header className="bg-white/95 dark:bg-[#0b1424]/95 backdrop-blur-md border-b border-[#d8e3ef] dark:border-[#1a2d4b] px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-2xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6EF] dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] hover:border-[#EAD7B8] text-xs font-semibold text-[#10253f] dark:text-white transition-all shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
              <span className="hidden sm:inline">{isEn ? "Home" : "Trang chủ"}</span>
            </Link>
            <div className="w-9 h-9 rounded-xl bg-[#EAD7B8] flex items-center justify-center text-[#10253f] shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-sm sm:text-base text-[#10253f] dark:text-white truncate">
                WeebLegit Admin Dashboard
              </h1>
              <p className="text-[11px] text-[#8297ac] dark:text-[#8fa3bf] truncate">
                {isEn
                  ? "Contract Verification & AI Risk Rules Monitor"
                  : "Hệ thống giám sát xác thực hợp đồng & luật AI"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#d8e3ef] dark:border-[#1a2d4b] bg-white dark:bg-[#12223c] hover:border-[#EAD7B8] text-xs font-bold text-[#10253f] dark:text-[#94a9c9] transition-all cursor-pointer"
              title={isEn ? "Switch language" : "Đổi ngôn ngữ"}
            >
              <Globe className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
              <span>{lang}</span>
            </button>

            {/* Theme Switcher (Light <-> Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#d8e3ef] dark:border-[#1a2d4b] bg-white dark:bg-[#12223c] text-[#8a6834] dark:text-[#EAD7B8] hover:border-[#EAD7B8] transition-colors cursor-pointer"
              title={
                isDark
                  ? isEn
                    ? "Switch to Light Mode"
                    : "Chuyển sang Giao diện Sáng"
                  : isEn
                    ? "Switch to Dark Mode"
                    : "Chuyển sang Giao diện Tối"
              }
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#EAD7B8]" />
              ) : (
                <Moon className="w-4 h-4 text-[#8a6834]" />
              )}
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-3 py-1.5 border border-[#d8e3ef] dark:border-[#1a2d4b] rounded-xl text-xs font-semibold text-[#49627d] dark:text-[#94a9c9] hover:text-[#10253f] dark:hover:text-white hover:border-[#EAD7B8] bg-white dark:bg-[#12223c] transition-colors cursor-pointer flex items-center gap-1.5"
              title={isEn ? "Refresh data" : "Làm mới dữ liệu"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isEn ? "Refresh" : "Làm mới"}</span>
            </button>

            {/* Unified User Dropdown Menu */}
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
                <span className="text-[11px] font-normal opacity-55 lowercase">
                  -{user.role === "admin" ? "pro/ad" : (user.plan_tier || "free")}-
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8297ac]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0b1424] border border-[#d8e3ef] dark:border-[#1a2d4b] rounded-xl shadow-xl py-1 z-50">
                  <div className="px-3.5 py-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]">
                    <p className="text-xs font-bold text-[#10253f] dark:text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{user.full_name ?? (isEn ? "Administrator" : "Quản trị viên")}</span>
                      <span className="text-[11px] font-normal opacity-55 lowercase shrink-0">
                        -{user.role === "admin" ? "pro/ad" : (user.plan_tier || "free")}-
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
                    href="/upgrade"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8] hover:bg-[#FAF6EF] dark:hover:bg-[#12223c] flex items-center gap-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]"
                  >
                    <span>✨ {isEn ? "Upgrade Plan (/upgrade)" : "Nâng Cấp Gói (/upgrade)"}</span>
                  </Link>
                  <Link
                    href="/history"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#10253f] dark:text-[#e2e8f0] hover:bg-[#FAF6EF] dark:hover:bg-[#12223c] flex items-center gap-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]"
                  >
                    <Clock className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                    <span>{isEn ? "Contract History" : "Lịch Sử Hợp Đồng"}</span>
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8] bg-[#FAF5ED]/70 dark:bg-[#12223c] hover:bg-[#FAF6EF] dark:hover:bg-[#162a47] flex items-center justify-between gap-2 border-b border-[#e6edf4] dark:border-[#1a2d4b]"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                      <span>{isEn ? "Admin Dashboard" : "Trang Quản Trị Admin"}</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#159f7b]" />
                  </Link>
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
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-8">
        {error && (
          <div className="p-4 bg-[#fff1f0] dark:bg-[#3f1619]/50 border border-[#ffd1cc] dark:border-[#7f1d1d] rounded-xl text-xs text-[#e4534b] dark:text-[#fca5a5] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ─── Metric Cards ─── */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase tracking-wider">
                  {isEn ? "Total Users" : "Tổng người dùng"}
                </p>
                <p className="text-2xl font-black text-[#10253f] dark:text-white mt-1">
                  {stats.total_users}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#EAD7B8]/20 dark:bg-[#12223c] flex items-center justify-center text-[#8a6834] dark:text-[#EAD7B8]">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase tracking-wider">
                  {isEn ? "Total Contracts" : "Tổng hợp đồng"}
                </p>
                <p className="text-2xl font-black text-[#10253f] dark:text-white mt-1">
                  {stats.total_contracts}
                </p>
                <div className="flex items-center gap-2 text-[11px] font-semibold mt-1">
                  <span className="text-[#159f7b] dark:text-[#6ee7b7]">
                    {stats.verified_contracts} {isEn ? "verified" : "chuẩn"}
                  </span>
                  <span className="text-[#8297ac]">•</span>
                  <span className="text-[#e4534b] dark:text-[#f87171]">
                    {stats.mismatch_contracts} {isEn ? "mismatched" : "lệch"}
                  </span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase tracking-wider">
                  {isEn ? "Audit Log Entries" : "Lượt Audit Log"}
                </p>
                <p className="text-2xl font-black text-[#10253f] dark:text-white mt-1">
                  {stats.total_verifications}
                </p>
                <p className="text-[11px] text-[#8297ac] dark:text-[#8fa3bf] mt-1">
                  {isEn ? "Immutable SHA-256 trail" : "Lưu vết SHA-256"}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase tracking-wider">
                  {isEn ? "Laws & Risk Rules" : "Bộ luật & Quy tắc"}
                </p>
                <p className="text-2xl font-black text-[#10253f] dark:text-white mt-1">
                  {stats.total_risk_rules + stats.total_legal_references}
                </p>
                <p className="text-[11px] text-[#8297ac] dark:text-[#8fa3bf] mt-1">
                  {stats.total_risk_rules} {isEn ? "rules" : "rules"} •{" "}
                  {stats.total_legal_references} {isEn ? "articles" : "điều luật"}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Sliders className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* ─── Navigation Tabs ─── */}
        <div className="flex border-b border-[#d8e3ef] dark:border-[#1a2d4b] gap-2 overflow-x-auto">
          {[
            {
              key: "overview",
              label: isEn ? "Overview" : "Tổng quan",
              icon: Activity,
            },
            {
              key: "contracts",
              label: isEn
                ? `Contracts (${contracts.length})`
                : `Hợp đồng (${contracts.length})`,
              icon: FileText,
            },
            {
              key: "users",
              label: isEn ? `Users (${usersList.length})` : `Người dùng (${usersList.length})`,
              icon: Users,
            },
            {
              key: "logs",
              label: isEn ? `Audit Logs (${logs.length})` : `Nhật ký (${logs.length})`,
              icon: Clock,
            },
            {
              key: "rules",
              label: isEn
                ? `Risk Rules (${rules.length})`
                : `Quy tắc rủi ro (${rules.length})`,
              icon: Sliders,
            },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px cursor-pointer shrink-0 ${
                  active
                    ? "border-[#10253f] dark:border-[#EAD7B8] text-[#10253f] dark:text-[#EAD7B8]"
                    : "border-transparent text-[#8297ac] dark:text-[#8fa3bf] hover:text-[#10253f] dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ═══ TAB 1: OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Contracts */}
              <div className="bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#10253f] dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8]" />
                    {isEn ? "Recently Uploaded Contracts" : "Hợp đồng tải lên gần nhất"}
                  </h3>
                  <button
                    onClick={() => setActiveTab("contracts")}
                    className="text-xs font-semibold text-[#8a6834] dark:text-[#EAD7B8] hover:underline cursor-pointer"
                  >
                    {isEn ? "View all" : "Xem tất cả"}
                  </button>
                </div>
                <div className="divide-y divide-[#f0f4f8] dark:divide-[#1a2d4b]">
                  {contracts.slice(0, 5).map((c) => (
                    <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-[#10253f] dark:text-white truncate max-w-[220px]">
                          {c.original_filename}
                        </p>
                        <p className="text-[11px] text-[#8297ac] dark:text-[#8fa3bf]">
                          {c.uploader_email} • {formatBytes(c.file_size_bytes)}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.status === "verified"
                            ? "bg-[#eafbf7] dark:bg-[#063328] text-[#0d7a5f] dark:text-[#6ee7b7] border-[#b7f6e5] dark:border-[#115e49]"
                            : "bg-[#f2f7fc] dark:bg-[#12223c] text-[#49627d] dark:text-[#94a9c9] border-[#d8e3ef] dark:border-[#1a2d4b]"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))}
                  {contracts.length === 0 && (
                    <p className="text-xs text-[#8297ac] dark:text-[#8fa3bf] py-4 text-center">
                      {isEn ? "No contracts yet." : "Chưa có hợp đồng nào."}
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Audit Logs */}
              <div className="bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#10253f] dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#159f7b] dark:text-[#6ee7b7]" />
                    {isEn ? "Recent Integrity Verifications" : "Lịch sử kiểm tra toàn vẹn gần nhất"}
                  </h3>
                  <button
                    onClick={() => setActiveTab("logs")}
                    className="text-xs font-semibold text-[#8a6834] dark:text-[#EAD7B8] hover:underline cursor-pointer"
                  >
                    {isEn ? "View all" : "Xem tất cả"}
                  </button>
                </div>
                <div className="divide-y divide-[#f0f4f8] dark:divide-[#1a2d4b]">
                  {logs.slice(0, 5).map((l) => (
                    <div key={l.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-[#10253f] dark:text-white truncate max-w-[220px]">
                          {l.contract_filename}
                        </p>
                        <p className="text-[11px] text-[#8297ac] dark:text-[#8fa3bf]">
                          {l.requested_by_email} • {l.duration_ms ? `${l.duration_ms}ms` : "—"}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1 text-[11px] font-bold ${
                          l.result === "matched"
                            ? "text-[#159f7b] dark:text-[#6ee7b7]"
                            : "text-[#e4534b] dark:text-[#f87171]"
                        }`}
                      >
                        {l.result === "matched" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {l.result}
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <p className="text-xs text-[#8297ac] dark:text-[#8fa3bf] py-4 text-center">
                      {isEn ? "No verification logs yet." : "Chưa có nhật ký xác thực nào."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: CONTRACTS ═══ */}
        {activeTab === "contracts" && (
          <div className="bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e6edf4] dark:border-[#1a2d4b] flex items-center justify-between bg-[#f8fafd] dark:bg-[#12223c]">
              <h3 className="font-bold text-sm text-[#10253f] dark:text-white">
                {isEn
                  ? `System Contracts (${contracts.length})`
                  : `Danh sách hợp đồng trên hệ thống (${contracts.length})`}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f2f7fc] dark:bg-[#060d1b] text-[#49627d] dark:text-[#94a9c9] uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">{isEn ? "Filename" : "Tên File"}</th>
                    <th className="px-4 py-3">{isEn ? "Uploaded By" : "Người tải lên"}</th>
                    <th className="px-4 py-3">{isEn ? "Type" : "Loại"}</th>
                    <th className="px-4 py-3">{isEn ? "Size" : "Dung lượng"}</th>
                    <th className="px-4 py-3">{isEn ? "SHA-256 Hash" : "Mã SHA-256"}</th>
                    <th className="px-4 py-3">{isEn ? "Status" : "Trạng thái"}</th>
                    <th className="px-4 py-3">{isEn ? "Created At" : "Thời gian"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6edf4] dark:divide-[#1a2d4b]">
                  {contracts.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#12223c]/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-[#10253f] dark:text-white max-w-[200px] truncate">
                        {c.original_filename}
                      </td>
                      <td className="px-4 py-3 text-[#49627d] dark:text-[#94a9c9]">
                        {c.uploader_email}
                      </td>
                      <td className="px-4 py-3 text-[#8297ac] dark:text-[#8fa3bf]">
                        {c.contract_type || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#49627d] dark:text-[#94a9c9]">
                        {formatBytes(c.file_size_bytes)}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-[10px] text-[#8297ac] dark:text-[#8fa3bf] max-w-[140px] truncate"
                        title={c.sha256_hash}
                      >
                        {c.sha256_hash}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            c.status === "verified"
                              ? "bg-[#eafbf7] dark:bg-[#063328] text-[#0d7a5f] dark:text-[#6ee7b7] border-[#b7f6e5] dark:border-[#115e49]"
                              : "bg-[#f2f7fc] dark:bg-[#12223c] text-[#49627d] dark:text-[#94a9c9] border-[#d8e3ef] dark:border-[#1a2d4b]"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8297ac] dark:text-[#8fa3bf]">
                        {formatDate(c.created_at)}
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-[#8297ac] dark:text-[#8fa3bf]"
                      >
                        {isEn ? "No contracts found." : "Không có hợp đồng nào."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: USERS ═══ */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {userActionFeedback && (
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
                  userActionFeedback.type === "success"
                    ? "bg-[#e8f8f2] dark:bg-[#0c2a20] border-[#9fe1cb] dark:border-[#159f7b]/40 text-[#0d6e53] dark:text-[#6ee7b7]"
                    : "bg-[#fdedec] dark:bg-[#341818] border-[#f8b4b0] dark:border-[#e4534b]/40 text-[#b52d25] dark:text-[#f87171]"
                }`}
              >
                <div className="flex items-center gap-2">
                  {userActionFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-[#159f7b] dark:text-[#6ee7b7] shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#e4534b] dark:text-[#f87171] shrink-0" />
                  )}
                  <span>{userActionFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUserActionFeedback(null)}
                  className="opacity-70 hover:opacity-100 text-xs px-2 py-0.5"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#e6edf4] dark:border-[#1a2d4b] flex items-center justify-between bg-[#f8fafd] dark:bg-[#12223c]">
                <div>
                  <h3 className="font-bold text-sm text-[#10253f] dark:text-white">
                    {isEn
                      ? `Registered Users & Subscriptions (${usersList.length})`
                      : `Quản lý người dùng & Gói cước (${usersList.length})`}
                  </h3>
                  <p className="text-[11px] text-[#8297ac] dark:text-[#8fa3bf] mt-0.5">
                    {isEn
                      ? "Upgrade or adjust user plans in real-time. Changes take effect instantly without restarting the web."
                      : "Tự động nâng cấp hoặc đổi gói cước người dùng tức thì. Có hiệu lực ngay lập tức mà không cần khởi động lại web."}
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="p-1.5 rounded-lg border border-[#d8e3ef] dark:border-[#1a2d4b] hover:bg-[#eef4fb] dark:hover:bg-[#1a2d4b] text-[#49627d] dark:text-[#94a9c9] transition-colors"
                  title={isEn ? "Refresh list" : "Tải lại danh sách"}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f2f7fc] dark:bg-[#060d1b] text-[#49627d] dark:text-[#94a9c9] uppercase tracking-wider font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">{isEn ? "Full Name" : "Họ và tên"}</th>
                      <th className="px-4 py-3">{isEn ? "Role" : "Vai trò"}</th>
                      <th className="px-4 py-3">{isEn ? "Current Plan" : "Gói hiện tại"}</th>
                      <th className="px-4 py-3">{isEn ? "Change Plan (Instant)" : "Đổi gói (Áp dụng ngay)"}</th>
                      <th className="px-4 py-3">{isEn ? "Status" : "Trạng thái"}</th>
                      <th className="px-4 py-3 text-right">{isEn ? "Actions" : "Hành động"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6edf4] dark:divide-[#1a2d4b]">
                    {usersList.map((u) => {
                      const tier = (u.plan_tier || (u.role === "admin" ? "pro" : "free")).toLowerCase();
                      const isUpdating = updatingUserId === u.id;

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50 dark:hover:bg-[#12223c]/60 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-[#10253f] dark:text-white">
                            {u.email}
                          </td>
                          <td className="px-4 py-3 text-[#49627d] dark:text-[#94a9c9]">
                            {u.full_name || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === "admin"
                                  ? "bg-[#FAF5ED] dark:bg-[#12223c] text-[#8a6834] dark:text-[#EAD7B8] border border-[#EAD7B8] dark:border-[#8a6834]"
                                  : "bg-[#f2f7fc] dark:bg-[#12223c] text-[#49627d] dark:text-[#94a9c9]"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {tier === "pro" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-600/40">
                                👑 PRO (VIP)
                              </span>
                            ) : tier === "medium" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                ⚡ MEDIUM
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                FREE
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={tier}
                                disabled={isUpdating}
                                onChange={(e) =>
                                  handleUpdateUserTier(
                                    u.id,
                                    e.target.value as "free" | "medium" | "pro"
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-[#d8e3ef] dark:border-[#1a2d4b] bg-white dark:bg-[#0b1424] text-[#10253f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0070f3] disabled:opacity-50 cursor-pointer shadow-2xs transition-all hover:border-[#0070f3]"
                              >
                                <option value="free">Miễn phí (Free)</option>
                                <option value="medium">Sinh viên (Medium)</option>
                                <option value="pro">👑 Chuyên gia (Pro)</option>
                              </select>
                              {isUpdating && (
                                <RefreshCw className="w-3.5 h-3.5 text-[#0070f3] animate-spin shrink-0" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.is_active
                                  ? "text-[#159f7b] dark:text-[#6ee7b7] bg-emerald-50 dark:bg-emerald-950/40"
                                  : "text-[#e4534b] dark:text-[#f87171] bg-rose-50 dark:bg-rose-950/40"
                              }`}
                            >
                              {u.is_active
                                ? isEn
                                  ? "Active"
                                  : "Hoạt động"
                                : isEn
                                  ? "Disabled"
                                  : "Bị khóa"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              disabled={isUpdating || u.role === "admin"}
                              onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40 cursor-pointer ${
                                u.is_active
                                  ? "border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  : "border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              }`}
                              title={
                                u.role === "admin"
                                  ? isEn
                                    ? "Cannot disable admin"
                                    : "Không thể khóa tài khoản Admin"
                                  : undefined
                              }
                            >
                              {u.is_active
                                ? isEn
                                  ? "Khóa"
                                  : "Khóa"
                                : isEn
                                  ? "Mở khóa"
                                  : "Mở khóa"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 4: LOGS ═══ */}
        {activeTab === "logs" && (
          <div className="bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e6edf4] dark:border-[#1a2d4b] flex items-center justify-between bg-[#f8fafd] dark:bg-[#12223c]">
              <h3 className="font-bold text-sm text-[#10253f] dark:text-white">
                {isEn
                  ? `Immutable Verification Audit Logs (${logs.length})`
                  : `Nhật ký xác thực bất biến (Audit Logs: ${logs.length})`}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f2f7fc] dark:bg-[#060d1b] text-[#49627d] dark:text-[#94a9c9] uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">{isEn ? "Contract" : "Hợp đồng"}</th>
                    <th className="px-4 py-3">{isEn ? "Requested By" : "Người yêu cầu"}</th>
                    <th className="px-4 py-3">{isEn ? "Result" : "Kết quả"}</th>
                    <th className="px-4 py-3">
                      {isEn ? "Expected SHA-256" : "Mã SHA-256 Chuẩn"}
                    </th>
                    <th className="px-4 py-3">{isEn ? "Actual SHA-256" : "Mã SHA-256 Đo lại"}</th>
                    <th className="px-4 py-3">{isEn ? "Duration" : "Thời gian xử lý"}</th>
                    <th className="px-4 py-3">{isEn ? "Timestamp" : "Thời điểm"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6edf4] dark:divide-[#1a2d4b]">
                  {logs.map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#12223c]/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-[#10253f] dark:text-white max-w-[180px] truncate">
                        {l.contract_filename}
                      </td>
                      <td className="px-4 py-3 text-[#49627d] dark:text-[#94a9c9]">
                        {l.requested_by_email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.result === "matched"
                              ? "bg-[#eafbf7] dark:bg-[#063328] text-[#0d7a5f] dark:text-[#6ee7b7]"
                              : "bg-[#fff1f0] dark:bg-[#3f1619] text-[#e4534b] dark:text-[#fca5a5]"
                          }`}
                        >
                          {l.result}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-[10px] text-[#8297ac] dark:text-[#8fa3bf] max-w-[120px] truncate"
                        title={l.expected_sha256}
                      >
                        {l.expected_sha256}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-[10px] text-[#8297ac] dark:text-[#8fa3bf] max-w-[120px] truncate"
                        title={l.actual_sha256}
                      >
                        {l.actual_sha256}
                      </td>
                      <td className="px-4 py-3 text-[#49627d] dark:text-[#94a9c9]">
                        {l.duration_ms != null ? `${l.duration_ms}ms` : "—"}
                      </td>
                      <td className="px-4 py-3 text-[#8297ac] dark:text-[#8fa3bf]">
                        {formatDate(l.created_at)}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-[#8297ac] dark:text-[#8fa3bf]"
                      >
                        {isEn ? "No audit logs yet." : "Chưa có lượt audit nào."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 5: RISK RULES ═══ */}
        {activeTab === "rules" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-sm text-[#10253f] dark:text-white">
                  {isEn
                    ? `Contract Risk Detection Rules (${rules.length})`
                    : `Quy tắc nhận diện rủi ro hợp đồng (${rules.length})`}
                </h3>
                <p className="text-xs text-[#8297ac] dark:text-[#8fa3bf]">
                  {isEn
                    ? "Keywords & automated warnings triggered during hybrid contract analysis"
                    : "Các từ khóa & cảnh báo tự động được kích hoạt khi phân tích"}
                </p>
              </div>
              <button
                onClick={() => {
                  setRuleFeedback(null);
                  setShowAddRule(!showAddRule);
                }}
                className="px-3 py-2 bg-[#10253f] dark:bg-[#EAD7B8] hover:bg-[#173d5a] dark:hover:bg-[#d8bf97] text-[#EAD7B8] dark:text-[#0b1424] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {showAddRule
                  ? isEn
                    ? "Close Form"
                    : "Đóng form"
                  : isEn
                    ? "Add New Rule"
                    : "Thêm quy tắc mới"}
              </button>
            </div>

            {ruleFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
                  ruleFeedback.type === "success"
                    ? "bg-[#eafbf7] dark:bg-[#063328] border-[#b7f6e5] dark:border-[#115e49] text-[#0d7a5f] dark:text-[#6ee7b7]"
                    : "bg-[#fff1f0] dark:bg-[#3f1619]/60 border-[#ffd1cc] dark:border-[#7f1d1d] text-[#e4534b] dark:text-[#fca5a5]"
                }`}
              >
                <span className="flex items-center gap-2">
                  {ruleFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  {ruleFeedback.message}
                </span>
                <button
                  type="button"
                  onClick={() => setRuleFeedback(null)}
                  className="text-xs underline opacity-80 hover:opacity-100 cursor-pointer"
                >
                  {isEn ? "Dismiss" : "Đóng"}
                </button>
              </div>
            )}

            {showAddRule && (
              <form
                onSubmit={handleCreateRule}
                className="p-5 bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-sm space-y-4"
              >
                <h4 className="text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8] uppercase tracking-wider">
                  {isEn ? "Create New Risk Rule" : "Tạo mới quy tắc rủi ro"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#49627d] dark:text-[#94a9c9] mb-1">
                      {isEn
                        ? "Trigger Keyword"
                        : "Từ khóa kích hoạt (Trigger keyword)"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        isEn
                          ? "e.g., training reimbursement, arbitrary price increase..."
                          : "Ví dụ: bồi hoàn đào tạo, tự ý tăng giá..."
                      }
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#49627d] dark:text-[#94a9c9] mb-1">
                      {isEn ? "Risk Level" : "Mức độ rủi ro"}
                    </label>
                    <select
                      value={newLevel}
                      onChange={(e) =>
                        setNewLevel(
                          e.target.value as "critical" | "high" | "medium" | "low"
                        )
                      }
                      className="w-full px-3 py-2 text-xs border border-[#d8e3ef] dark:border-[#1a2d4b] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f] dark:text-white bg-white dark:bg-[#12223c]"
                    >
                      <option value="critical">
                        {isEn ? "Critical (35 pts)" : "Critical (Nghiêm trọng - 35 điểm)"}
                      </option>
                      <option value="high">
                        {isEn ? "High (20 pts)" : "High (Cao - 20 điểm)"}
                      </option>
                      <option value="medium">
                        {isEn ? "Medium (8 pts)" : "Medium (Trung bình - 8 điểm)"}
                      </option>
                      <option value="low">
                        {isEn ? "Low (3 pts)" : "Low (Nhẹ - 3 điểm)"}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#49627d] dark:text-[#94a9c9] mb-1">
                    {isEn ? "Target Section / Clause" : "Phần / Điều khoản áp dụng"}
                  </label>
                  <input
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#49627d] dark:text-[#94a9c9] mb-1">
                    {isEn ? "Default Warning Message" : "Nội dung cảnh báo mặc định"}
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder={
                      isEn
                        ? "Describe the clause trap and recommendation for students..."
                        : "Mô tả bẫy điều khoản và khuyến nghị cho sinh viên..."
                    }
                    value={newWarning}
                    onChange={(e) => setNewWarning(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1a2d4b] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f] dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingRule}
                  className="px-4 py-2 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {addingRule
                    ? isEn
                      ? "Saving..."
                      : "Đang lưu..."
                    : isEn
                      ? "Save Rule"
                      : "Lưu quy tắc"}
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.risk_level === "critical"
                            ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                            : r.risk_level === "high"
                              ? "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300"
                              : r.risk_level === "medium"
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {r.risk_level}
                      </span>
                      <p className="font-bold text-sm text-[#10253f] dark:text-white">
                        &quot;{r.keyword_trigger}&quot;
                      </p>
                    </div>
                    <span className="text-[10px] text-[#8297ac] dark:text-[#8fa3bf]">
                      {r.target_section}
                    </span>
                  </div>
                  <p className="text-xs text-[#49627d] dark:text-[#94a9c9] leading-relaxed">
                    {r.default_warning_message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
