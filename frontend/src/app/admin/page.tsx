"use client";

import React, { useEffect, useState } from "react";
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
  Monitor,
} from "lucide-react";
import * as api from "../../lib/api";
import { AuthProvider, useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";

type AdminTab = "overview" | "contracts" | "users" | "logs" | "rules";

function AdminDashboardInner() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<api.AdminStatsResponse | null>(null);
  const [contracts, setContracts] = useState<api.AdminContractItem[]>([]);
  const [usersList, setUsersList] = useState<api.AdminUserResponse[]>([]);
  const [logs, setLogs] = useState<api.AdminLogItem[]>([]);
  const [rules, setRules] = useState<api.AdminRiskRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin login form state for guest / non-admin
  const [loginEmail, setLoginEmail] = useState("admin@weeblegit.vn");
  const [loginPassword, setLoginPassword] = useState("Admin@123456");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Add rule state
  const [showAddRule, setShowAddRule] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newLevel, setNewLevel] = useState<"critical" | "high" | "medium" | "low">("high");
  const [newWarning, setNewWarning] = useState("");
  const [newSection, setNewSection] = useState("Điều khoản rủi ro");
  const [addingRule, setAddingRule] = useState(false);

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
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu quản trị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Đăng nhập admin thất bại");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newWarning.trim()) return;
    setAddingRule(true);
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
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi khi tạo quy tắc");
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
      return new Date(iso).toLocaleString("vi-VN", {
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

  // ─── Render Login for non-admins ──────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#10253f]">
          <div className="w-6 h-6 border-2 border-[#10253f] border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-sm">Đang tải xác thực...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#d8e3ef] shadow-xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAD7B8] flex items-center justify-center text-[#10253f] shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#10253f]">WeebLegit Admin Portal</h2>
              <p className="text-xs text-[#8297ac]">Khu vực quản trị hệ thống</p>
            </div>
          </div>

          {user && user.role !== "admin" && (
            <div className="p-3 bg-[#fff1f0] border border-[#ffd1cc] rounded-xl text-xs text-[#e4534b]">
              Tài khoản hiện tại (<strong>{user.email}</strong>) không có quyền Quản trị viên (Admin). Vui lòng đăng nhập tài khoản Admin.
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#49627d] mb-1">Email Quản trị viên</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#d8e3ef] rounded-xl focus:outline-none focus:border-[#EAD7B8] text-[#10253f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#49627d] mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#d8e3ef] rounded-xl focus:outline-none focus:border-[#EAD7B8] text-[#10253f]"
              />
            </div>

            {loginError && (
              <div className="p-2.5 bg-[#fff1f0] border border-[#ffd1cc] rounded-lg text-xs text-[#e4534b]">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 bg-[#10253f] hover:bg-[#173d5a] text-[#EAD7B8] text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loginLoading ? <span className="w-4 h-4 border-2 border-[#EAD7B8]/40 border-t-[#EAD7B8] rounded-full animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Đăng nhập Quản trị
            </button>
          </form>

          <div className="pt-2 border-t border-[#e6edf4] flex justify-between items-center text-xs">
            <Link href="/" className="text-[#8a6834] font-semibold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Về trang chủ
            </Link>
            <span className="text-[#8297ac]">Cổng nội bộ</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Admin Dashboard ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#10253f] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-[#d8e3ef] px-6 py-4 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAD7B8] flex items-center justify-center text-[#10253f] shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-[#10253f]">WeebLegit Admin Dashboard</h1>
              <p className="text-xs text-[#8297ac]">Hệ thống giám sát xác thực hợp đồng & luật AI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <div className="flex items-center bg-[#FAF6EE] dark:bg-[#12223C] border border-[#E5DBCA] dark:border-[#1F3557] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  theme === "light"
                    ? "bg-white dark:bg-[#1E324F] shadow-xs text-[#8A6731] dark:text-[#EAD7B8]"
                    : "text-[#8297ac] hover:text-[#10253f] dark:hover:text-white"
                }`}
                title="Giao diện Sáng"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  theme === "dark"
                    ? "bg-white dark:bg-[#1E324F] shadow-xs text-[#8A6731] dark:text-[#EAD7B8]"
                    : "text-[#8297ac] hover:text-[#10253f] dark:hover:text-white"
                }`}
                title="Giao diện Tối"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  theme === "system"
                    ? "bg-white dark:bg-[#1E324F] shadow-xs text-[#8A6731] dark:text-[#EAD7B8]"
                    : "text-[#8297ac] hover:text-[#10253f] dark:hover:text-white"
                }`}
                title="Giao diện Hệ thống"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-3 py-1.5 border border-[#d8e3ef] dark:border-[#1F3557] rounded-lg text-xs font-semibold text-[#49627d] dark:text-[#CAD8ED] hover:text-[#10253f] hover:border-[#EAD7B8] bg-white dark:bg-[#12223C] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>

            <Link
              href="/"
              className="px-3 py-1.5 bg-[#FAF6EE] border border-[#E5DBCA] rounded-lg text-xs font-semibold text-[#8a6834] hover:bg-[#EAD7B8]/20 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Trang người dùng
            </Link>

            <button
              onClick={logout}
              className="p-1.5 text-[#e4534b] hover:bg-[#fff1f0] rounded-lg transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {error && (
          <div className="p-4 bg-[#fff1f0] border border-[#ffd1cc] rounded-xl text-xs text-[#e4534b] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ─── Metric Cards ─── */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-[#d8e3ef] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">Tổng người dùng</p>
                <p className="text-2xl font-black text-[#10253f] mt-1">{stats.total_users}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#EAD7B8]/20 flex items-center justify-center text-[#8a6834]">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#d8e3ef] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">Tổng hợp đồng</p>
                <p className="text-2xl font-black text-[#10253f] mt-1">{stats.total_contracts}</p>
                <div className="flex items-center gap-2 text-[11px] font-semibold mt-1">
                  <span className="text-[#159f7b]">{stats.verified_contracts} chuẩn</span>
                  <span>•</span>
                  <span className="text-[#e4534b]">{stats.mismatch_contracts} lệch</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#d8e3ef] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">Lượt Audit Log</p>
                <p className="text-2xl font-black text-[#10253f] mt-1">{stats.total_verifications}</p>
                <p className="text-[11px] text-[#8297ac] mt-1">Lưu vết SHA-256</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#d8e3ef] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">Bộ luật & Quy tắc</p>
                <p className="text-2xl font-black text-[#10253f] mt-1">{stats.total_risk_rules + stats.total_legal_references}</p>
                <p className="text-[11px] text-[#8297ac] mt-1">{stats.total_risk_rules} rules • {stats.total_legal_references} điều luật</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Sliders className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* ─── Navigation Tabs ─── */}
        <div className="flex border-b border-[#d8e3ef] gap-2">
          {[
            { key: "overview", label: "Tổng quan", icon: Activity },
            { key: "contracts", label: `Hợp đồng (${contracts.length})`, icon: FileText },
            { key: "users", label: `Người dùng (${usersList.length})`, icon: Users },
            { key: "logs", label: `Nhật ký (${logs.length})`, icon: Clock },
            { key: "rules", label: `Quy tắc rủi ro (${rules.length})`, icon: Sliders },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px cursor-pointer ${
                  active
                    ? "border-[#10253f] text-[#10253f]"
                    : "border-transparent text-[#8297ac] hover:text-[#10253f]"
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
              <div className="bg-white rounded-2xl border border-[#d8e3ef] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#10253f] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#8a6834]" />
                    Hợp đồng tải lên gần nhất
                  </h3>
                  <button onClick={() => setActiveTab("contracts")} className="text-xs font-semibold text-[#8a6834] hover:underline">
                    Xem tất cả
                  </button>
                </div>
                <div className="divide-y divide-[#f0f4f8]">
                  {contracts.slice(0, 5).map((c) => (
                    <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-[#10253f] truncate max-w-[220px]">{c.original_filename}</p>
                        <p className="text-[11px] text-[#8297ac]">{c.uploader_email} • {formatBytes(c.file_size_bytes)}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${c.status === "verified" ? "bg-[#eafbf7] text-[#0d7a5f] border-[#b7f6e5]" : "bg-[#f2f7fc] text-[#49627d] border-[#d8e3ef]"}`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                  {contracts.length === 0 && <p className="text-xs text-[#8297ac] py-4 text-center">Chưa có hợp đồng nào.</p>}
                </div>
              </div>

              {/* Recent Audit Logs */}
              <div className="bg-white rounded-2xl border border-[#d8e3ef] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#10253f] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#159f7b]" />
                    Lịch sử kiểm tra toàn vẹn gần nhất
                  </h3>
                  <button onClick={() => setActiveTab("logs")} className="text-xs font-semibold text-[#8a6834] hover:underline">
                    Xem tất cả
                  </button>
                </div>
                <div className="divide-y divide-[#f0f4f8]">
                  {logs.slice(0, 5).map((l) => (
                    <div key={l.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-[#10253f] truncate max-w-[220px]">{l.contract_filename}</p>
                        <p className="text-[11px] text-[#8297ac]">{l.requested_by_email} • {l.duration_ms ? `${l.duration_ms}ms` : "—"}</p>
                      </div>
                      <span className={`flex items-center gap-1 text-[11px] font-bold ${l.result === "matched" ? "text-[#159f7b]" : "text-[#e4534b]"}`}>
                        {l.result === "matched" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {l.result}
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-xs text-[#8297ac] py-4 text-center">Chưa có nhật ký xác thực nào.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: CONTRACTS ═══ */}
        {activeTab === "contracts" && (
          <div className="bg-white rounded-2xl border border-[#d8e3ef] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e6edf4] flex items-center justify-between bg-[#f8fafd]">
              <h3 className="font-bold text-sm text-[#10253f]">Danh sách hợp đồng trên hệ thống ({contracts.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f2f7fc] text-[#49627d] uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Tên File</th>
                    <th className="px-4 py-3">Người tải lên</th>
                    <th className="px-4 py-3">Loại</th>
                    <th className="px-4 py-3">Dung lượng</th>
                    <th className="px-4 py-3">Mã SHA-256</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6edf4]">
                  {contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#10253f] max-w-[200px] truncate">{c.original_filename}</td>
                      <td className="px-4 py-3 text-[#49627d]">{c.uploader_email}</td>
                      <td className="px-4 py-3 text-[#8297ac]">{c.contract_type || "—"}</td>
                      <td className="px-4 py-3 text-[#49627d]">{formatBytes(c.file_size_bytes)}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#8297ac] max-w-[140px] truncate" title={c.sha256_hash}>
                        {c.sha256_hash}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${c.status === "verified" ? "bg-[#eafbf7] text-[#0d7a5f] border-[#b7f6e5]" : "bg-[#f2f7fc] text-[#49627d] border-[#d8e3ef]"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8297ac]">{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[#8297ac]">Không có hợp đồng nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: USERS ═══ */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-[#d8e3ef] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e6edf4] flex items-center justify-between bg-[#f8fafd]">
              <h3 className="font-bold text-sm text-[#10253f]">Người dùng đã đăng ký ({usersList.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f2f7fc] text-[#49627d] uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Họ và tên</th>
                    <th className="px-4 py-3">Vai trò (Role)</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6edf4]">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#10253f]">{u.email}</td>
                      <td className="px-4 py-3 text-[#49627d]">{u.full_name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === "admin" ? "bg-[#FAF5ED] text-[#8a6834] border border-[#EAD7B8]" : "bg-[#f2f7fc] text-[#49627d]"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.is_active ? "text-[#159f7b]" : "text-[#e4534b]"}`}>
                          {u.is_active ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8297ac]">{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 4: LOGS ═══ */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-2xl border border-[#d8e3ef] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e6edf4] flex items-center justify-between bg-[#f8fafd]">
              <h3 className="font-bold text-sm text-[#10253f]">Nhật ký xác thực bất biến (Audit Logs: {logs.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f2f7fc] text-[#49627d] uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Hợp đồng</th>
                    <th className="px-4 py-3">Người yêu cầu</th>
                    <th className="px-4 py-3">Kết quả</th>
                    <th className="px-4 py-3">Mã SHA-256 Chuẩn</th>
                    <th className="px-4 py-3">Mã SHA-256 Đo lại</th>
                    <th className="px-4 py-3">Thời gian xử lý</th>
                    <th className="px-4 py-3">Thời điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6edf4]">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#10253f] max-w-[180px] truncate">{l.contract_filename}</td>
                      <td className="px-4 py-3 text-[#49627d]">{l.requested_by_email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.result === "matched" ? "bg-[#eafbf7] text-[#0d7a5f]" : "bg-[#fff1f0] text-[#e4534b]"}`}>
                          {l.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#8297ac] max-w-[120px] truncate" title={l.expected_sha256}>
                        {l.expected_sha256}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#8297ac] max-w-[120px] truncate" title={l.actual_sha256}>
                        {l.actual_sha256}
                      </td>
                      <td className="px-4 py-3 text-[#49627d]">{l.duration_ms != null ? `${l.duration_ms}ms` : "—"}</td>
                      <td className="px-4 py-3 text-[#8297ac]">{formatDate(l.created_at)}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[#8297ac]">Chưa có lượt audit nào.</td>
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#10253f]">Quy tắc nhận diện rủi ro hợp đồng ({rules.length})</h3>
                <p className="text-xs text-[#8297ac]">Các từ khóa & cảnh báo tự động được kích hoạt khi phân tích</p>
              </div>
              <button
                onClick={() => setShowAddRule(!showAddRule)}
                className="px-3 py-2 bg-[#10253f] hover:bg-[#173d5a] text-[#EAD7B8] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {showAddRule ? "Đóng form" : "Thêm quy tắc mới"}
              </button>
            </div>

            {showAddRule && (
              <form onSubmit={handleCreateRule} className="p-5 bg-white rounded-2xl border border-[#d8e3ef] shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-[#8a6834] uppercase tracking-wider">Tạo mới quy tắc rủi ro</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#49627d] mb-1">Từ khóa kích hoạt (Trigger keyword)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: bồi hoàn đào tạo, tự ý tăng giá..."
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#d8e3ef] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#49627d] mb-1">Mức độ rủi ro</label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-[#d8e3ef] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f] bg-white"
                    >
                      <option value="critical">Critical (Nghiêm trọng - 35 điểm)</option>
                      <option value="high">High (Cao - 20 điểm)</option>
                      <option value="medium">Medium (Trung bình - 8 điểm)</option>
                      <option value="low">Low (Nhẹ - 3 điểm)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#49627d] mb-1">Phần / Điều khoản áp dụng</label>
                  <input
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#d8e3ef] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#49627d] mb-1">Nội dung cảnh báo mặc định</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Mô tả bẫy điều khoản và khuyến nghị cho sinh viên..."
                    value={newWarning}
                    onChange={(e) => setNewWarning(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#d8e3ef] rounded-lg focus:outline-none focus:border-[#EAD7B8] text-[#10253f]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingRule}
                  className="px-4 py-2 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {addingRule ? "Đang lưu..." : "Lưu quy tắc"}
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((r) => (
                <div key={r.id} className="p-4 bg-white rounded-2xl border border-[#d8e3ef] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.risk_level === "critical" ? "bg-red-100 text-red-700" :
                        r.risk_level === "high" ? "bg-orange-100 text-orange-700" :
                        r.risk_level === "medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {r.risk_level}
                      </span>
                      <p className="font-bold text-sm text-[#10253f]">&quot;{r.keyword_trigger}&quot;</p>
                    </div>
                    <span className="text-[10px] text-[#8297ac]">{r.target_section}</span>
                  </div>
                  <p className="text-xs text-[#49627d] leading-relaxed">{r.default_warning_message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminDashboardInner />
    </AuthProvider>
  );
}
