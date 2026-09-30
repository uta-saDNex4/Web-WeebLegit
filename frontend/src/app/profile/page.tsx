"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Bot,
  ArrowLeft,
  Sun,
  Moon,
  Globe,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Search,
  Plus,
  Scale,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import * as api from "../../lib/api";
import { AuthProvider, useAuth } from "../../lib/auth-context";
import { LanguageProvider, useLanguage } from "../../lib/language-context";
import { useTheme } from "../../lib/theme-context";
import {
  ChatSession,
  getChatSessions,
  deleteSession,
  clearAllChatSessions,
  createNewSession,
  setActiveSessionId,
  CHAT_HISTORY_EVENT,
} from "../../lib/chat-history";
import { FloatingAiWidget } from "../../components/FloatingAiWidget";

type ProfileTab = "profile" | "ai-history" | "contracts";

function ProfilePageInner() {
  const { user, loading: authLoading, logout, updateMe } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();

  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  // Profile edit states
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // AI Chat History states
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  // Contracts list states
  const [contracts, setContracts] = useState<api.ContractResponse[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [contractsError, setContractsError] = useState<string | null>(null);

  // Sync user state into forms
  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user]);

  // Load chat history
  const reloadChatSessions = () => {
    const sessions = getChatSessions();
    setChatSessions(sessions);
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
    } else if (selectedSessionId && !sessions.some((s) => s.id === selectedSessionId)) {
      setSelectedSessionId(sessions.length > 0 ? sessions[0].id : null);
    }
  };

  useEffect(() => {
    reloadChatSessions();
    const handleUpdate = () => reloadChatSessions();
    window.addEventListener(CHAT_HISTORY_EVENT, handleUpdate);
    return () => window.removeEventListener(CHAT_HISTORY_EVENT, handleUpdate);
  }, []);

  // Load user contracts
  const loadContracts = async () => {
    if (!user) return;
    setLoadingContracts(true);
    setContractsError(null);
    try {
      const res = await api.listContracts({ limit: 50 });
      setContracts(res.items || []);
    } catch (err: unknown) {
      setContractsError(err instanceof Error ? err.message : "Không thể tải danh sách hợp đồng");
    } finally {
      setLoadingContracts(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === "contracts") {
      loadContracts();
    }
  }, [user, activeTab]);

  // Copy helper
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  // Profile update submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setSavingProfile(true);
    try {
      await updateMe({ full_name: fullName.trim() || null });
      setProfileSuccess(
        lang === "EN" ? "Profile updated successfully!" : "Cập nhật họ tên thành công!"
      );
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Cập nhật hồ sơ thất bại");
    } finally {
      setSavingProfile(false);
    }
  };

  // Password change submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError(
        lang === "EN"
          ? "Password must be at least 8 characters"
          : "Mật khẩu mới phải có ít nhất 8 ký tự"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        lang === "EN"
          ? "Password confirmation does not match"
          : "Mật khẩu nhập lại không trùng khớp"
      );
      return;
    }

    setChangingPassword(true);
    try {
      await updateMe({ password: newPassword });
      setPasswordSuccess(
        lang === "EN" ? "Password changed successfully!" : "Đổi mật khẩu thành công!"
      );
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Đổi mật khẩu thất bại");
    } finally {
      setChangingPassword(false);
    }
  };

  // Delete chat session
  const handleDeleteSession = (sessionId: string) => {
    if (confirm(lang === "EN" ? "Delete this conversation?" : "Xóa cuộc trò chuyện này?")) {
      deleteSession(sessionId);
      reloadChatSessions();
    }
  };

  // Clear all chat sessions
  const handleClearAllSessions = () => {
    if (confirm(lang === "EN" ? "Clear all chat history?" : "Xóa toàn bộ lịch sử trò chuyện AI?")) {
      clearAllChatSessions();
      reloadChatSessions();
      setSelectedSessionId(null);
    }
  };

  // Start new chat from profile
  const handleStartNewChat = () => {
    const greeting =
      lang === "EN"
        ? "Hello! I am your WeebLegit Legal AI Assistant. How can I help you today?"
        : "Xin chào! Tôi là Trợ lý Pháp lý WeebLegit. Bạn có thắc mắc gì về hợp đồng hôm nay?";
    const newSession = createNewSession(greeting);
    reloadChatSessions();
    setSelectedSessionId(newSession.id);
    // Open in widget
    window.dispatchEvent(
      new CustomEvent("weeb_open_chat_session", {
        detail: { sessionId: newSession.id },
      })
    );
  };

  // Resume session in floating widget
  const handleOpenInWidget = (sessionId: string) => {
    setActiveSessionId(sessionId);
    window.dispatchEvent(
      new CustomEvent("weeb_open_chat_session", {
        detail: { sessionId },
      })
    );
  };

  // Filtered chat sessions based on search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return chatSessions;
    const q = searchQuery.toLowerCase();
    return chatSessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [chatSessions, searchQuery]);

  const activeSession = useMemo(() => {
    return chatSessions.find((s) => s.id === selectedSessionId) || null;
  }, [chatSessions, selectedSessionId]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF5ED] dark:bg-[#070E1B] text-[#0F1E36] dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-[#8A6731] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-[#8A6731] dark:text-[#EAD7B8]">
            {lang === "EN" ? "Loading profile..." : "Đang tải hồ sơ người dùng..."}
          </p>
        </div>
      </div>
    );
  }

  // Guest view if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF5ED] dark:bg-[#070E1B] text-[#0F1E36] dark:text-white flex flex-col justify-between">
        <header className="px-6 py-4 border-b border-[#E6DEC8] dark:border-[#1F3354] bg-white/80 dark:bg-[#0B1526]/80 backdrop-blur-md flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-base tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#EAD7B8] to-[#d8bf97] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#10253f]" />
            </div>
            <span className="text-[#0F1E36] dark:text-white font-extrabold text-lg">WeebLegit</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] text-[#0F1E36] dark:text-[#EAD7B8] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] text-xs font-bold text-[#0F1E36] dark:text-[#CAD8ED]"
            >
              {lang}
            </button>
          </div>
        </header>

        <main className="max-w-md mx-auto p-6 text-center my-auto">
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0B1526] border border-[#E6DEC8] dark:border-[#1F3354] shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EAD7B8]/20 flex items-center justify-center mx-auto text-[#8A6731] dark:text-[#EAD7B8]">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-[#0F1E36] dark:text-white">
              {lang === "EN" ? "Sign In Required" : "Yêu Cầu Đăng Nhập"}
            </h2>
            <p className="text-sm text-[#65778F] dark:text-[#8FA3BF] leading-relaxed">
              {lang === "EN"
                ? "Please log in to manage your account profile, review saved contracts, and inspect your AI chat consultations."
                : "Vui lòng đăng nhập để xem thông tin hồ sơ, quản lý các bản hợp đồng đã tải lên và xem lại lịch sử hỏi đáp với AI."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0F223D] dark:bg-[#EAD7B8] text-[#EAD7B8] dark:text-[#0F223D] font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === "EN" ? "Back to Homepage" : "Về Trang Chủ Đăng Nhập"}</span>
            </Link>
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-[#8A9EB5]">
          © {new Date().getFullYear()} WeebLegit. Bảo mật thông tin & pháp lý Việt Nam.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5ED] dark:bg-[#070E1B] text-[#0F1E36] dark:text-white flex flex-col font-sans transition-colors duration-200">
      {/* ─── Top Navbar ─── */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 py-3.5 border-b border-[#E6DEC8] dark:border-[#1F3354] bg-white/85 dark:bg-[#0B1526]/85 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] text-xs font-bold text-[#65778F] dark:text-[#CAD8ED] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === "EN" ? "Homepage" : "Trang chủ"}</span>
          </Link>
          <div className="h-4 w-px bg-[#E6DEC8] dark:bg-[#1F3354] hidden sm:block" />
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#EAD7B8] to-[#d8bf97] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#10253f]" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#0F1E36] dark:text-white">
              WeebLegit
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] text-[#0F1E36] dark:text-[#EAD7B8] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] transition-colors cursor-pointer"
            title="Đổi giao diện Sáng / Tối"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            className="px-2.5 py-1.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] text-xs font-bold text-[#0F1E36] dark:text-[#CAD8ED] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] transition-colors cursor-pointer flex items-center gap-1"
          >
            <Globe className="w-3 h-3 text-[#8A6731] dark:text-[#EAD7B8]" />
            <span>{lang}</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100/60 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === "EN" ? "Sign Out" : "Đăng xuất"}</span>
          </button>
        </div>
      </header>

      {/* ─── Hero User Card ─── */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-8 pt-8 pb-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0B1526] border border-[#E6DEC8] dark:border-[#1F3354] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#EAD7B8]/10 dark:bg-[#EAD7B8]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#EAD7B8] to-[#ceb188] flex items-center justify-center text-2xl sm:text-3xl font-black text-[#0F1E36] shadow-md uppercase">
                {(user.full_name || user.email).charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#0F1E36] dark:text-white">
                    {user.full_name || (lang === "EN" ? "Verified User" : "Người dùng hệ thống")}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                      user.role === "admin"
                        ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                    }`}
                  >
                    {user.role === "admin" ? "Admin" : lang === "EN" ? "Member" : "Thành viên"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#65778F] dark:text-[#8FA3BF] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8A6731] dark:text-[#EAD7B8]" />
                  <span>{user.email}</span>
                </p>
                <p className="text-[11px] text-[#8A9EB5] dark:text-[#64748B] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {lang === "EN" ? "Joined:" : "Ngày tham gia:"}{" "}
                    {new Date(user.created_at).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick stats badges */}
            <div className="grid grid-cols-2 gap-3 sm:w-auto w-full">
              <div className="p-3.5 rounded-2xl bg-[#FAF5ED] dark:bg-[#11213A] border border-[#E6DEC8] dark:border-[#1F3354] text-center">
                <span className="block text-2xl font-black text-[#8A6731] dark:text-[#EAD7B8]">
                  {contracts.length}
                </span>
                <span className="text-[11px] font-semibold text-[#65778F] dark:text-[#8FA3BF]">
                  {lang === "EN" ? "Contracts Uploaded" : "Hợp đồng đã quét"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF5ED] dark:bg-[#11213A] border border-[#E6DEC8] dark:border-[#1F3354] text-center">
                <span className="block text-2xl font-black text-[#159F7B] dark:text-emerald-400">
                  {chatSessions.length}
                </span>
                <span className="text-[11px] font-semibold text-[#65778F] dark:text-[#8FA3BF]">
                  {lang === "EN" ? "AI Chat Sessions" : "Phiên tư vấn AI"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-t border-[#EFE8D8] dark:border-[#1F3354] pt-4 mt-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "profile"
                  ? "bg-[#0F223D] dark:bg-[#EAD7B8] text-[#EAD7B8] dark:text-[#0F223D] shadow-sm"
                  : "text-[#65778F] dark:text-[#8FA3BF] hover:bg-[#FAF5ED] dark:hover:bg-[#12223C]"
              }`}
            >
              <User className="w-4 h-4" />
              <span>{lang === "EN" ? "Account & Security" : "Thông tin cá nhân & Bảo mật"}</span>
            </button>

            <button
              onClick={() => setActiveTab("ai-history")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "ai-history"
                  ? "bg-[#0F223D] dark:bg-[#EAD7B8] text-[#EAD7B8] dark:text-[#0F223D] shadow-sm"
                  : "text-[#65778F] dark:text-[#8FA3BF] hover:bg-[#FAF5ED] dark:hover:bg-[#12223C]"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>{lang === "EN" ? "AI Chat History" : "Lịch sử AI Chat"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#EAD7B8]/30 dark:bg-[#0F223D]/30 font-bold">
                {chatSessions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("contracts")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "contracts"
                  ? "bg-[#0F223D] dark:bg-[#EAD7B8] text-[#EAD7B8] dark:text-[#0F223D] shadow-sm"
                  : "text-[#65778F] dark:text-[#8FA3BF] hover:bg-[#FAF5ED] dark:hover:bg-[#12223C]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{lang === "EN" ? "My Contracts" : "Hợp đồng của tôi"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Main Content Tabs ─── */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 flex-1">
        {/* ═══ TAB 1: PROFILE & SECURITY ═══ */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Info Form */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1526] border border-[#E6DEC8] dark:border-[#1F3354] shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#EFE8D8] dark:border-[#1F3354]">
                <div className="w-8 h-8 rounded-xl bg-[#EAD7B8]/20 flex items-center justify-center text-[#8A6731] dark:text-[#EAD7B8]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0F1E36] dark:text-white">
                    {lang === "EN" ? "Personal Details" : "Thông tin tài khoản"}
                  </h3>
                  <p className="text-[11px] text-[#65778F] dark:text-[#8FA3BF]">
                    {lang === "EN" ? "Update your personal profile information" : "Cập nhật tên hiển thị và định danh"}
                  </p>
                </div>
              </div>

              {profileSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4B5E76] dark:text-[#CAD8ED] mb-1.5">
                    {lang === "EN" ? "Email Address (Read-only)" : "Địa chỉ Email (Định danh cố định)"}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9EB5]" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] bg-[#F7F4EE] dark:bg-[#07101E] text-xs font-semibold text-[#8A9EB5] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5E76] dark:text-[#CAD8ED] mb-1.5">
                    {lang === "EN" ? "Full Name" : "Họ và tên hiển thị"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6731] dark:text-[#EAD7B8]" />
                    <input
                      type="text"
                      placeholder={lang === "EN" ? "Enter your full name" : "Nhập họ và tên đầy đủ của bạn"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] bg-white dark:bg-[#07101E] text-xs font-semibold text-[#0F1E36] dark:text-white focus:outline-none focus:border-[#8A6731]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5E76] dark:text-[#CAD8ED] mb-1.5">
                    {lang === "EN" ? "System Role" : "Vai trò hệ thống"}
                  </label>
                  <input
                    type="text"
                    value={user.role === "admin" ? "Quản trị viên (Admin)" : "Thành viên người dùng (User)"}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] bg-[#F7F4EE] dark:bg-[#07101E] text-xs font-semibold text-[#8A9EB5] cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-2.5 rounded-xl bg-[#0F223D] dark:bg-[#EAD7B8] text-[#EAD7B8] dark:text-[#0F223D] text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{lang === "EN" ? "Save Profile Changes" : "Lưu Thay Đổi Hồ Sơ"}</span>
                </button>
              </form>
            </div>

            {/* Security & Password Form */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1526] border border-[#E6DEC8] dark:border-[#1F3354] shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#EFE8D8] dark:border-[#1F3354]">
                <div className="w-8 h-8 rounded-xl bg-[#EAD7B8]/20 flex items-center justify-center text-[#8A6731] dark:text-[#EAD7B8]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0F1E36] dark:text-white">
                    {lang === "EN" ? "Security & Password" : "Bảo mật & Đổi mật khẩu"}
                  </h3>
                  <p className="text-[11px] text-[#65778F] dark:text-[#8FA3BF]">
                    {lang === "EN" ? "Ensure your account has a strong password" : "Đặt mật khẩu an toàn với tối thiểu 8 ký tự"}
                  </p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4B5E76] dark:text-[#CAD8ED] mb-1.5">
                    {lang === "EN" ? "New Password" : "Mật khẩu mới (tối thiểu 8 ký tự)"}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6731] dark:text-[#EAD7B8]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] bg-white dark:bg-[#07101E] text-xs font-semibold text-[#0F1E36] dark:text-white focus:outline-none focus:border-[#8A6731]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9EB5] hover:text-[#0F1E36] dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5E76] dark:text-[#CAD8ED] mb-1.5">
                    {lang === "EN" ? "Confirm New Password" : "Nhập lại mật khẩu mới"}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A6731] dark:text-[#EAD7B8]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] bg-white dark:bg-[#07101E] text-xs font-semibold text-[#0F1E36] dark:text-white focus:outline-none focus:border-[#8A6731]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF5ED] dark:bg-[#07101E] border border-[#E6DEC8] dark:border-[#1F3354] text-[11px] text-[#65778F] dark:text-[#8FA3BF]">
                  💡 <strong>Gợi ý an toàn:</strong> Sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt để đảm bảo an toàn tuyệt đối.
                </div>

                <button
                  type="submit"
                  disabled={changingPassword || !newPassword}
                  className="w-full py-2.5 rounded-xl bg-[#8A6731] dark:bg-[#B38C4F] text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {changingPassword ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{lang === "EN" ? "Update Password" : "Cập Nhật Mật Khẩu"}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: AI CHAT HISTORY ═══ */}
        {activeTab === "ai-history" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1526] border border-[#E6DEC8] dark:border-[#1F3354] shadow-sm space-y-6">
            {/* Header action bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE8D8] dark:border-[#1F3354]">
              <div>
                <h3 className="font-extrabold text-base text-[#0F1E36] dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#8A6731] dark:text-[#EAD7B8]" />
                  <span>{lang === "EN" ? "AI Legal Chat Consultations" : "Lịch Sử Đoạn Hội Thoại Pháp Lý AI"}</span>
                </h3>
                <p className="text-xs text-[#65778F] dark:text-[#8FA3BF] mt-0.5">
                  {lang === "EN"
                    ? "Review all your previous legal Q&A sessions and negotiation advice"
                    : "Lưu trữ toàn bộ các câu hỏi đối chiếu luật, bẫy điều khoản và kịch bản đàm phán"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartNewChat}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F223D] dark:bg-[#EAD7B8] text-[#EAD7B8] dark:text-[#0F223D] text-xs font-bold shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === "EN" ? "Start New Chat" : "Tạo cuộc trò chuyện mới"}</span>
                </button>

                {chatSessions.length > 0 && (
                  <button
                    onClick={handleClearAllSessions}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors cursor-pointer"
                    title="Xóa tất cả lịch sử chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === "EN" ? "Clear All" : "Xóa tất cả"}</span>
                  </button>
                )}
              </div>
            </div>

            {chatSessions.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF5ED] dark:bg-[#11213A] border border-[#E6DEC8] dark:border-[#1F3354] flex items-center justify-center mx-auto text-[#8A6731] dark:text-[#EAD7B8]">
                  <MessageSquare className="w-8 h-8 opacity-60" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F1E36] dark:text-white">
                    {lang === "EN" ? "No chat history recorded yet" : "Chưa có cuộc trò chuyện nào"}
                  </h4>
                  <p className="text-xs text-[#65778F] dark:text-[#8FA3BF] max-w-sm mx-auto mt-1">
                    {lang === "EN"
                      ? "Ask questions in the floating widget or click 'Start New Chat' to analyze contract clauses with our AI."
                      : "Hãy gửi câu hỏi qua trợ lý AI nổi ở góc dưới hoặc nhấn nút Tạo cuộc trò chuyện mới để bắt đầu."}
                  </p>
                </div>
                <button
                  onClick={handleStartNewChat}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F223D] dark:bg-[#EAD7B8] text-[#EAD7B8] dark:text-[#0F223D] text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === "EN" ? "Ask AI Now" : "Hỏi AI Ngay"}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left column: Sessions List */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9EB5]" />
                    <input
                      type="text"
                      placeholder={lang === "EN" ? "Search conversations..." : "Tìm kiếm cuộc trò chuyện..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] bg-[#FAF5ED]/50 dark:bg-[#07101E] text-xs font-semibold text-[#0F1E36] dark:text-white focus:outline-none focus:border-[#8A6731]"
                    />
                  </div>

                  <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                    {filteredSessions.map((s) => {
                      const isSelected = s.id === selectedSessionId;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSessionId(s.id)}
                          className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                            isSelected
                              ? "bg-[#FAF5ED] dark:bg-[#12223C] border-[#8A6731] dark:border-[#EAD7B8] shadow-sm"
                              : "bg-white dark:bg-[#07101E] border-[#E6DEC8] dark:border-[#1F3354] hover:border-[#8A6731]/50"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected
                                  ? "bg-[#8A6731] text-white"
                                  : "bg-[#EAD7B8]/30 dark:bg-[#1A2D4B] text-[#8A6731] dark:text-[#EAD7B8]"
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5
                                className={`text-xs font-bold truncate ${
                                  isSelected ? "text-[#0F1E36] dark:text-white" : "text-[#2C3E55] dark:text-[#CAD8ED]"
                                }`}
                              >
                                {s.title}
                              </h5>
                              <div className="flex items-center gap-2 text-[10px] text-[#65778F] dark:text-[#8FA3BF] mt-1">
                                <span>
                                  {new Date(s.updatedAt).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                  })}
                                </span>
                                <span>•</span>
                                <span>{s.messages.length} tin nhắn</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(s.id);
                            }}
                            className="p-1 rounded-lg text-[#8A9EB5] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Xóa phiên này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right column: Detailed conversation viewer */}
                <div className="lg:col-span-8 p-5 rounded-2xl bg-[#FAF5ED]/50 dark:bg-[#07101E] border border-[#E6DEC8] dark:border-[#1F3354] flex flex-col min-h-[500px]">
                  {activeSession ? (
                    <>
                      {/* Session Header */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-[#E6DEC8] dark:border-[#1F3354]">
                        <div>
                          <h4 className="font-extrabold text-sm text-[#0F1E36] dark:text-white flex items-center gap-2">
                            <span>{activeSession.title}</span>
                          </h4>
                          <p className="text-[11px] text-[#65778F] dark:text-[#8FA3BF] mt-0.5">
                            {lang === "EN" ? "Updated:" : "Cập nhật lần cuối:"}{" "}
                            {new Date(activeSession.updatedAt).toLocaleString("vi-VN")}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenInWidget(activeSession.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F223D] dark:bg-[#EAD7B8] text-[#EAD7B8] dark:text-[#0F223D] text-xs font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                            title="Mở tiếp tục đoạn chat này trong khung chat nổi"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{lang === "EN" ? "Open in Widget" : "Tiếp tục trong Widget"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Messages Flow */}
                      <div className="flex-1 py-4 space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {activeSession.messages.map((msg, idx) => (
                          <div
                            key={msg.id || idx}
                            className={`flex flex-col ${
                              msg.sender === "user" ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                                msg.sender === "user"
                                  ? "bg-[#EAD7B8] text-[#10253f] font-semibold rounded-br-none"
                                  : "bg-white dark:bg-[#0B1526] text-[#0F1E36] dark:text-[#E2E8F0] border border-[#E6DEC8] dark:border-[#1F3354] font-medium rounded-bl-none"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 font-bold text-[10px] text-[#8A6731] dark:text-[#EAD7B8]">
                                {msg.sender === "user" ? (
                                  <span>👤 Bạn</span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Bot className="w-3 h-3" /> Trợ lý Pháp lý WeebLegit
                                  </span>
                                )}
                              </div>
                              <p className="whitespace-pre-line">{msg.text}</p>

                              {msg.negotiationScript && (
                                <div className="mt-2.5 pt-2 border-t border-[#E6DEC8] dark:border-[#1F3354]">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-[#159F7B] dark:text-emerald-400 mb-1">
                                    <span>💬 Gợi ý câu trao đổi đàm phán:</span>
                                    <button
                                      onClick={() => handleCopy(msg.id, msg.negotiationScript ?? "")}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                                    >
                                      {copiedTextId === msg.id ? (
                                        <>
                                          <Check className="w-2.5 h-2.5" />
                                          <span>Đã chép</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-2.5 h-2.5" />
                                          <span>Sao chép</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-[11px] italic text-[#26435E] dark:text-[#CAD8ED] bg-[#FAF5ED] dark:bg-[#07101E] p-2.5 rounded-xl border border-[#E6DEC8] dark:border-[#1F3354]">
                                    &quot;{msg.negotiationScript}&quot;
                                  </p>
                                </div>
                              )}

                              {msg.citation && (
                                <div className="mt-2 pt-1.5 border-t border-[#E6DEC8] dark:border-[#1F3354] text-[11px] font-bold text-[#8A6731] dark:text-[#EAD7B8] flex items-center gap-1.5">
                                  <Scale className="w-3.5 h-3.5 shrink-0" />
                                  <span>{msg.citation}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8A9EB5] dark:text-[#64748B] mt-1 px-1">
                              {msg.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-[#E6DEC8] dark:border-[#1F3354] flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[#65778F] dark:text-[#8FA3BF]">
                          {activeSession.messages.length} tin nhắn trong phiên này
                        </span>
                        <button
                          onClick={() => {
                            const fullTranscript = activeSession.messages
                              .map((m) => `[${m.timestamp}] ${m.sender === "user" ? "User" : "AI"}:\n${m.text}`)
                              .join("\n\n");
                            handleCopy("full_transcript", fullTranscript);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] bg-white dark:bg-[#0B1526] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] text-xs font-bold text-[#0F1E36] dark:text-[#CAD8ED] transition-colors cursor-pointer"
                        >
                          {copiedTextId === "full_transcript" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedTextId === "full_transcript" ? "Đã sao chép!" : "Sao chép hội thoại"}</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20 text-[#8A9EB5] text-xs">
                      {lang === "EN" ? "Select a conversation from the left to view." : "Chọn một cuộc trò chuyện ở cột bên trái để xem nội dung."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB 3: MY CONTRACTS ═══ */}
        {activeTab === "contracts" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0B1526] border border-[#E6DEC8] dark:border-[#1F3354] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE8D8] dark:border-[#1F3354]">
              <div>
                <h3 className="font-extrabold text-base text-[#0F1E36] dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#8A6731] dark:text-[#EAD7B8]" />
                  <span>{lang === "EN" ? "Uploaded Contracts & SHA-256 Logs" : "Hợp Đồng Của Bạn & Mã Kiểm Tra SHA-256"}</span>
                </h3>
                <p className="text-xs text-[#65778F] dark:text-[#8FA3BF] mt-0.5">
                  {lang === "EN"
                    ? "Tamper-proof records of all contract files uploaded and verified by your account"
                    : "Lưu trữ vân tay mã hóa điện tử chống tráo trang và báo cáo bẫy điều khoản"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadContracts}
                  disabled={loadingContracts}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] text-xs font-bold text-[#0F1E36] dark:text-[#CAD8ED] transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingContracts ? "animate-spin" : ""}`} />
                  <span>{lang === "EN" ? "Refresh" : "Tải lại"}</span>
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F223D] dark:bg-[#EAD7B8] text-[#EAD7B8] dark:text-[#0F223D] text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === "EN" ? "Scan New Contract" : "Kiểm tra hợp đồng mới"}</span>
                </Link>
              </div>
            </div>

            {loadingContracts ? (
              <div className="flex items-center justify-center py-16 gap-3 text-[#8A6731] dark:text-[#EAD7B8]">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-xs font-semibold">{lang === "EN" ? "Loading your contracts..." : "Đang tải danh sách hợp đồng..."}</span>
              </div>
            ) : contractsError ? (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{contractsError}</span>
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF5ED] dark:bg-[#11213A] border border-[#E6DEC8] dark:border-[#1F3354] flex items-center justify-center mx-auto text-[#8A6731] dark:text-[#EAD7B8]">
                  <FileText className="w-7 h-7 opacity-60" />
                </div>
                <h4 className="font-bold text-sm text-[#0F1E36] dark:text-white">
                  {lang === "EN" ? "No contracts uploaded yet" : "Bạn chưa upload hợp đồng nào"}
                </h4>
                <p className="text-xs text-[#65778F] dark:text-[#8FA3BF] max-w-sm mx-auto">
                  {lang === "EN"
                    ? "Upload contracts on the homepage to inspect risks, view SHA-256 hashes, and compare market prices."
                    : "Hãy tải lên file hợp đồng tại Trang chủ để hệ thống tính mã SHA-256 và phát hiện điều khoản rủi ro."}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F223D] dark:bg-[#EAD7B8] text-[#EAD7B8] dark:text-[#0F223D] text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === "EN" ? "Upload Contract Now" : "Tải Lên Ngay"}</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-4 rounded-2xl bg-[#FAF5ED]/50 dark:bg-[#07101E] border border-[#E6DEC8] dark:border-[#1F3354] hover:border-[#8A6731]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileText className="w-4 h-4 text-[#8A6731] dark:text-[#EAD7B8] shrink-0" />
                        <h5 className="font-bold text-xs sm:text-sm text-[#0F1E36] dark:text-white truncate max-w-md">
                          {contract.original_filename}
                        </h5>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            contract.status === "verified"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {contract.status}
                        </span>
                        {contract.contract_type && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5ED] dark:bg-[#12223C] text-[#8A6731] dark:text-[#EAD7B8] border border-[#E6DEC8] dark:border-[#1F3354]">
                            {contract.contract_type}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#65778F] dark:text-[#8FA3BF] flex-wrap">
                        <span>{(contract.file_size_bytes / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{contract.mime_type}</span>
                        <span>•</span>
                        <span>
                          {new Date(contract.created_at).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <code className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#0B1526] text-[#4B5E76] dark:text-[#CAD8ED] border border-[#E6DEC8] dark:border-[#1F3354] truncate max-w-sm sm:max-w-md">
                          SHA-256: {contract.sha256_hash}
                        </code>
                        <button
                          onClick={() => handleCopy(`hash_${contract.id}`, contract.sha256_hash)}
                          className="p-1 rounded text-[#8A9EB5] hover:text-[#0F1E36] dark:hover:text-white transition-colors cursor-pointer"
                          title="Sao chép mã SHA-256"
                        >
                          {copiedTextId === `hash_${contract.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] bg-white dark:bg-[#0B1526] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] text-xs font-bold text-[#0F1E36] dark:text-[#CAD8ED] transition-colors cursor-pointer shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{lang === "EN" ? "View in Checker" : "Kiểm tra lại"}</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating AI chat widget available on profile page */}
      <FloatingAiWidget />

      {/* Footer */}
      <footer className="border-t border-[#E6DEC8] dark:border-[#1F3354] py-6 px-4 text-center text-xs text-[#8A9EB5] dark:text-[#64748B]">
        WeebLegit • Nền tảng pháp lý & bảo mật số cho người dùng trẻ Việt Nam.
      </footer>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ProfilePageInner />
      </LanguageProvider>
    </AuthProvider>
  );
}
