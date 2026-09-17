'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Users,
  AlertTriangle,
  History,
  Scale,
  RefreshCw,
  Plus,
  Trash2,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import * as api from '../../lib/api';

type AdminTab = 'overview' | 'contracts' | 'logs' | 'rules' | 'users';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<api.AdminStats | null>(null);
  const [contracts, setContracts] = useState<api.AdminContract[]>([]);
  const [logs, setLogs] = useState<api.AdminLog[]>([]);
  const [rules, setRules] = useState<api.RiskRuleItem[]>([]);
  const [users, setUsers] = useState<api.AdminUser[]>([]);

  // Add rule state
  const [newKeyword, setNewKeyword] = useState('');
  const [newLevel, setNewLevel] = useState('medium');
  const [newWarning, setNewWarning] = useState('');
  const [newSection, setNewSection] = useState('Điều khoản rủi ro');
  const [addingRule, setAddingRule] = useState(false);

  // Copy feedback
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const loadData = async () => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [statsData, contractsData, logsData, rulesData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminContracts(),
        api.getAdminLogs(),
        api.getAdminRiskRules(),
        api.getAdminUsers(),
      ]);
      setStats(statsData);
      setContracts(contractsData);
      setLogs(logsData);
      setRules(rulesData);
      setUsers(usersData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newWarning.trim()) return;
    setAddingRule(true);
    try {
      await api.createRiskRule({
        keyword_trigger: newKeyword.trim(),
        risk_level: newLevel,
        default_warning_message: newWarning.trim(),
        target_section: newSection.trim() || 'Điều khoản rủi ro',
      });
      setNewKeyword('');
      setNewWarning('');
      const updatedRules = await api.getAdminRiskRules();
      setRules(updatedRules);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi tạo quy tắc');
    } finally {
      setAddingRule(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa quy tắc rủi ro này?')) return;
    try {
      await api.deleteRiskRule(id);
      setRules(rules.filter((r) => r.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa quy tắc');
    }
  };

  const handleToggleUser = async (userId: string, currentStatus: boolean) => {
    try {
      await api.toggleUserStatus(userId, !currentStatus);
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u)),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái');
    }
  };

  // ── Access Denied View ──
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f7fafc] text-[#10253f] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#d8e3ef] p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#fff1f0] text-[#e4534b] mx-auto flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-[#10253f] mb-2">Quyền truy cập Quản trị viên</h1>
          <p className="text-sm text-[#49627d] mb-6 leading-relaxed">
            Trang này chỉ dành cho tài khoản có quyền <strong>Admin</strong> để quản lý dữ liệu hợp đồng, quy tắc rủi ro và audit log hệ thống.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10253f] text-white text-sm font-semibold rounded-xl hover:bg-[#173d5a] transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#10253f]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#d8e3ef]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl text-[#49627d] hover:text-[#10253f] hover:bg-[#f2f7fc] transition-colors"
              title="Về trang chủ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#10253f] text-[#EAD7B8] flex items-center justify-center font-bold text-sm shadow-sm">
                W
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base text-[#10253f]">WeebLegit Admin Dashboard</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAD7B8] text-[#10253f]">
                    SYSTEM ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-[#8297ac]">Quản lý Hợp đồng, Quy tắc Bẫy pháp lý & Audit Logs</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d8e3ef] hover:border-[#EAD7B8] text-xs font-semibold text-[#10253f] hover:bg-[#FAF5ED] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#10253f]">{user.full_name || 'Admin'}</p>
              <p className="text-[10px] text-[#8297ac]">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto border-t border-[#f2f7fc]">
          {[
            { id: 'overview', label: 'Tổng quan & Metrics', icon: ShieldCheck },
            { id: 'contracts', label: `Hợp đồng (${contracts.length})`, icon: FileText },
            { id: 'logs', label: `Nhật ký Kiểm tra (${logs.length})`, icon: History },
            { id: 'rules', label: `Quy tắc Rủi ro (${rules.length})`, icon: Scale },
            { id: 'users', label: `Người dùng (${users.length})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'border-[#8a6834] text-[#8a6834]'
                    : 'border-transparent text-[#49627d] hover:text-[#10253f]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#fff1f0] border border-[#ffd1cc] text-[#e4534b] text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Tab: Overview ── */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="flex items-center justify-between mb-3 text-[#49627d]">
                  <span className="text-xs font-bold uppercase tracking-wider">Tổng Người dùng</span>
                  <Users className="w-4 h-4 text-[#8a6834]" />
                </div>
                <div className="text-3xl font-black text-[#10253f]">{stats.total_users}</div>
                <p className="text-[11px] text-[#8297ac] mt-1">Tài khoản trong DB</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="flex items-center justify-between mb-3 text-[#49627d]">
                  <span className="text-xs font-bold uppercase tracking-wider">Hợp đồng tải lên</span>
                  <FileText className="w-4 h-4 text-[#2563eb]" />
                </div>
                <div className="text-3xl font-black text-[#10253f]">{stats.total_contracts}</div>
                <p className="text-[11px] text-[#8297ac] mt-1">Đã lưu trữ metadata & hash</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="flex items-center justify-between mb-3 text-[#0d7a5f]">
                  <span className="text-xs font-bold uppercase tracking-wider">Khớp SHA-256</span>
                  <CheckCircle2 className="w-4 h-4 text-[#159f7b]" />
                </div>
                <div className="text-3xl font-black text-[#159f7b]">{stats.verified_contracts}</div>
                <p className="text-[11px] text-[#8297ac] mt-1">Toàn vẹn tuyệt đối</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="flex items-center justify-between mb-3 text-[#b91c1c]">
                  <span className="text-xs font-bold uppercase tracking-wider">Lệch Hash / Can thiệp</span>
                  <ShieldAlert className="w-4 h-4 text-[#e4534b]" />
                </div>
                <div className="text-3xl font-black text-[#e4534b]">{stats.mismatch_contracts}</div>
                <p className="text-[11px] text-[#8297ac] mt-1">Cảnh báo sửa đổi</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="flex items-center justify-between mb-3 text-[#7c3aed]">
                  <span className="text-xs font-bold uppercase tracking-wider">Lượt xác thực Audit</span>
                  <History className="w-4 h-4 text-[#7c3aed]" />
                </div>
                <div className="text-3xl font-black text-[#7c3aed]">{stats.total_verifications}</div>
                <p className="text-[11px] text-[#8297ac] mt-1">Lịch sử audit log</p>
              </div>
            </div>

            {/* Quick Actions & Rule Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm space-y-4">
                <h3 className="font-bold text-base text-[#10253f] flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#8a6834]" />
                  <span>Cơ sở Dữ liệu Pháp lý & Quy tắc Rủi ro</span>
                </h3>
                <p className="text-xs text-[#49627d] leading-relaxed">
                  Hệ thống kết hợp kiểm tra từ khóa rủi ro (`risk_rules` Master) và đối chiếu nguồn tham chiếu pháp lý (`legal_references`) cùng trợ lý Google Gemini.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#FAF5ED] border border-[#EAD7B8] flex-1">
                    <span className="text-xs text-[#8a6834] font-semibold">Quy tắc bẫy rủi ro</span>
                    <p className="text-2xl font-black text-[#10253f]">{stats.total_risk_rules}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#eafbf7] border border-[#b7f6e5] flex-1">
                    <span className="text-xs text-[#159f7b] font-semibold">Tham chiếu luật VN</span>
                    <p className="text-2xl font-black text-[#10253f]">{stats.total_legal_references}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm space-y-4">
                <h3 className="font-bold text-base text-[#10253f] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#159f7b]" />
                  <span>Trạng thái Database & Storage</span>
                </h3>
                <div className="space-y-2.5 text-xs text-[#49627d]">
                  <div className="flex justify-between py-2 border-b border-[#f2f7fc]">
                    <span>Hệ quản trị Database:</span>
                    <strong className="text-[#10253f]">PostgreSQL 16</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#f2f7fc]">
                    <span>Lưu trữ file nhị phân:</span>
                    <strong className="text-[#10253f]">/data/storage & /data/secure_storage</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#f2f7fc]">
                    <span>Chuẩn kiểm tra toàn vẹn:</span>
                    <strong className="text-[#10253f]">SHA-256 Stream Constant-Time</strong>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Trợ lý AI:</span>
                    <strong className="text-[#10253f]">Gemini LLM + Local Legal Rules</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Contracts ── */}
        {activeTab === 'contracts' && (
          <div className="bg-white rounded-2xl border border-[#d8e3ef] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#e6edf4] flex items-center justify-between">
              <h3 className="font-bold text-base text-[#10253f]">Danh sách Hợp đồng Tải lên ({contracts.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafd] text-[#8297ac] font-bold uppercase tracking-wider border-b border-[#e6edf4]">
                  <tr>
                    <th className="p-4">Tên file</th>
                    <th className="p-4">Người tải (Email)</th>
                    <th className="p-4">Loại hợp đồng</th>
                    <th className="p-4">Kích thước</th>
                    <th className="p-4">Mã SHA-256</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6edf4]">
                  {contracts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#8297ac]">
                        Chưa có hợp đồng nào được tải lên.
                      </td>
                    </tr>
                  ) : (
                    contracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-[#10253f] flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#8a6834]" />
                          <span>{c.original_filename}</span>
                        </td>
                        <td className="p-4 text-[#49627d]">{c.uploader_email}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f2f7fc] text-[#10253f]">
                            {c.contract_type || 'Chưa phân loại'}
                          </span>
                        </td>
                        <td className="p-4 text-[#8297ac]">{(c.file_size_bytes / 1024).toFixed(1)} KB</td>
                        <td className="p-4 font-mono text-[10px] text-[#49627d]">
                          <button
                            onClick={() => handleCopy(c.sha256_hash)}
                            className="flex items-center gap-1 hover:text-[#10253f] cursor-pointer"
                            title="Click để sao chép hash"
                          >
                            <span>{c.sha256_hash.slice(0, 14)}...</span>
                            {copiedHash === c.sha256_hash ? (
                              <Check className="w-3 h-3 text-[#159f7b]" />
                            ) : (
                              <Copy className="w-3 h-3 text-[#8297ac]" />
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              c.status === 'verified'
                                ? 'bg-[#eafbf7] text-[#0d7a5f]'
                                : c.status === 'mismatch'
                                ? 'bg-[#fff1f0] text-[#b91c1c]'
                                : 'bg-[#fff8e6] text-[#7d480e]'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-[#8297ac]">{new Date(c.created_at).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: Logs ── */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-[#d8e3ef] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#e6edf4] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#10253f]">Nhật ký Kiểm tra Toàn vẹn (Audit Logs)</h3>
                <p className="text-xs text-[#8297ac]">Append-only audit log: Mỗi lần bấm verify đều được lưu vĩnh viễn để kiểm toán</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafd] text-[#8297ac] font-bold uppercase tracking-wider border-b border-[#e6edf4]">
                  <tr>
                    <th className="p-4">Thời gian</th>
                    <th className="p-4">Hợp đồng</th>
                    <th className="p-4">Người yêu cầu</th>
                    <th className="p-4">Kết quả</th>
                    <th className="p-4">Expected Hash</th>
                    <th className="p-4">Actual Hash</th>
                    <th className="p-4">Xử lý (ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6edf4]">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#8297ac]">
                        Chưa có lượt kiểm tra nào được ghi log.
                      </td>
                    </tr>
                  ) : (
                    logs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-[#8297ac]">{new Date(l.created_at).toLocaleString('vi-VN')}</td>
                        <td className="p-4 font-bold text-[#10253f]">{l.contract_filename}</td>
                        <td className="p-4 text-[#49627d]">{l.requested_by_email}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              l.result === 'matched'
                                ? 'bg-[#eafbf7] text-[#0d7a5f]'
                                : l.result === 'mismatched'
                                ? 'bg-[#fff1f0] text-[#b91c1c]'
                                : 'bg-[#fff8e6] text-[#7d480e]'
                            }`}
                          >
                            {l.result}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-[#49627d]">{l.expected_sha256.slice(0, 10)}...</td>
                        <td className="p-4 font-mono text-[10px] text-[#49627d]">{l.actual_sha256.slice(0, 10)}...</td>
                        <td className="p-4 text-[#8297ac]">{l.duration_ms != null ? `${l.duration_ms} ms` : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: Risk Rules ── */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            {/* Create Rule Form */}
            <div className="bg-white rounded-2xl border border-[#d8e3ef] p-6 shadow-sm">
              <h3 className="font-bold text-base text-[#10253f] mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#8a6834]" />
                <span>Thêm Quy tắc Rủi ro Mới vào Database</span>
              </h3>
              <form onSubmit={handleCreateRule} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#49627d] mb-1">Từ khóa kích hoạt:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: giữ cccd, phạt vi phạm..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3ef] text-xs focus:outline-none focus:border-[#8a6834]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#49627d] mb-1">Mức độ rủi ro:</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3ef] text-xs focus:outline-none focus:border-[#8a6834] bg-white"
                  >
                    <option value="critical">Critical (Nghiêm trọng)</option>
                    <option value="high">High (Rủi ro cao)</option>
                    <option value="medium">Medium (Trung bình / Cần làm rõ)</option>
                    <option value="low">Low (Lưu ý nhẹ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#49627d] mb-1">Khu vực điều khoản:</label>
                  <input
                    type="text"
                    placeholder="VD: Tiền cọc, Thử việc, Bồi hoàn..."
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3ef] text-xs focus:outline-none focus:border-[#8a6834]"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={addingRule}
                    className="w-full py-2 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    {addingRule ? 'Đang thêm...' : 'Lưu quy tắc'}
                  </button>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-[#49627d] mb-1">Lời khuyên & Cảnh báo pháp lý:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nội dung cảnh báo chi tiết sẽ hiển thị cho sinh viên khi phát hiện từ khóa này..."
                    value={newWarning}
                    onChange={(e) => setNewWarning(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8e3ef] text-xs focus:outline-none focus:border-[#8a6834]"
                  />
                </div>
              </form>
            </div>

            {/* Rules List */}
            <div className="bg-white rounded-2xl border border-[#d8e3ef] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#e6edf4]">
                <h3 className="font-bold text-base text-[#10253f]">Danh sách Quy tắc Rủi ro Đang áp dụng ({rules.length})</h3>
              </div>
              <div className="divide-y divide-[#e6edf4]">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rule.risk_level === 'critical'
                              ? 'bg-[#fff1f0] text-[#b91c1c]'
                              : rule.risk_level === 'high'
                              ? 'bg-[#fff4e6] text-[#d77714]'
                              : 'bg-[#f2f7fc] text-[#49627d]'
                          }`}
                        >
                          {rule.risk_level.toUpperCase()}
                        </span>
                        <strong className="text-xs text-[#10253f] font-bold">Từ khóa: &quot;{rule.keyword_trigger}&quot;</strong>
                        <span className="text-[11px] text-[#8297ac]">({rule.target_section})</span>
                      </div>
                      <p className="text-xs text-[#49627d]">{rule.default_warning_message}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-[#8297ac] hover:text-[#e4534b] hover:bg-[#fff1f0] rounded-lg transition-colors cursor-pointer"
                      title="Xóa quy tắc"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Users ── */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-[#d8e3ef] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#e6edf4]">
              <h3 className="font-bold text-base text-[#10253f]">Quản lý Tài khoản Người dùng ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafd] text-[#8297ac] font-bold uppercase tracking-wider border-b border-[#e6edf4]">
                  <tr>
                    <th className="p-4">Email</th>
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4">Vai trò (Role)</th>
                    <th className="p-4">Trạng thái kích hoạt</th>
                    <th className="p-4">Ngày đăng ký</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6edf4]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-[#10253f]">{u.email}</td>
                      <td className="p-4 text-[#49627d]">{u.full_name || '-'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'admin' ? 'bg-[#FAF5ED] text-[#8a6834] border border-[#EAD7B8]' : 'bg-[#f2f7fc] text-[#49627d]'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.is_active ? 'bg-[#eafbf7] text-[#0d7a5f]' : 'bg-[#fff1f0] text-[#b91c1c]'
                          }`}
                        >
                          {u.is_active ? 'Đang hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td className="p-4 text-[#8297ac]">{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleUser(u.id, u.is_active)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            u.is_active
                              ? 'bg-[#fff1f0] text-[#e4534b] hover:bg-[#ffe5e3]'
                              : 'bg-[#eafbf7] text-[#0d7a5f] hover:bg-[#d5f7ee]'
                          }`}
                        >
                          {u.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
