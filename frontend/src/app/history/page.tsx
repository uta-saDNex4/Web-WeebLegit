"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  Sparkles,
  BarChart2,
  Lock,
  RefreshCw,
} from "lucide-react";
import { AuthProvider, useAuth } from "../../lib/auth-context";
import * as api from "../../lib/api";
import { AuthModal } from "../../components/AuthModal";

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
    });
  } catch {
    return iso;
  }
}

function HistoryPageContent() {
  const { user, loading: authLoading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
      setError(err instanceof Error ? err.message : "Không thể tải lịch sử chấm hợp đồng");
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
        const score = latestAnalysis?.risk_score ?? 0;
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
    <div className="min-h-screen bg-[#FAF6EF] text-[#10253f]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF6EF]/90 backdrop-blur-md border-b border-[#d8e3ef]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#d8e3ef] hover:border-[#EAD7B8] text-sm font-semibold text-[#10253f] transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-[#8a6834]" />
              <span>Trang chủ</span>
            </Link>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#8a6834]" />
              <h1 className="text-base sm:text-lg font-extrabold text-[#10253f]">
                Lịch sử kiểm tra &amp; chấm điểm hợp đồng
              </h1>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#d8e3ef] hover:border-[#EAD7B8] text-xs font-semibold text-[#49627d] hover:text-[#10253f] transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#d8e3ef] text-xs font-semibold text-[#10253f]">
                <span className="w-2 h-2 rounded-full bg-[#159f7b]" />
                <span>{user.full_name ?? user.email}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {authLoading ? (
          <div className="p-12 rounded-2xl bg-white border border-[#d8e3ef] flex items-center justify-center gap-3 text-[#8297ac]">
            <div className="w-6 h-6 rounded-full border-2 border-[#EAD7B8] border-t-transparent animate-spin" />
            <span className="text-sm font-medium">Đang kiểm tra tài khoản...</span>
          </div>
        ) : !user ? (
          <div className="p-12 rounded-2xl bg-white border border-[#d8e3ef] text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF5ED] border border-[#EAD7B8]/50 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-[#8a6834]" />
            </div>
            <h2 className="text-lg font-extrabold text-[#10253f]">
              Đăng nhập để xem lịch sử chấm hợp đồng
            </h2>
            <p className="text-sm text-[#49627d]">
              Mọi kết quả phân tích AI và đối chiếu SHA-256 đều được lưu trữ riêng cho từng tài khoản.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-2.5 bg-[#EAD7B8] hover:bg-[#d8bf97] text-[#10253f] font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              Đăng nhập / Đăng ký ngay
            </button>
          </div>
        ) : (
          <>
            {/* Summary Bento Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#8297ac] uppercase">
                  <span>Tổng hợp đồng</span>
                  <FileText className="w-4 h-4 text-[#8a6834]" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#10253f]">
                  {stats.totalContracts}
                </div>
                <p className="text-xs text-[#8297ac] mt-0.5">Đã tải lên tài khoản</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#8297ac] uppercase">
                  <span>Số lượt chấm AI</span>
                  <Sparkles className="w-4 h-4 text-[#8a6834]" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#10253f]">
                  {stats.totalAnalyses}
                </div>
                <p className="text-xs text-[#8297ac] mt-0.5">Lưu trữ bền vững trong DB</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#8297ac] uppercase">
                  <span>Điểm rủi ro TB</span>
                  <BarChart2 className="w-4 h-4 text-[#d77714]" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#10253f]">
                  {stats.avgScore}/100
                </div>
                <p className="text-xs text-[#8297ac] mt-0.5">Thang điểm Hybrid 0–100</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-[#8297ac] uppercase">
                  <span>Hợp đồng rủi ro cao</span>
                  <AlertTriangle className="w-4 h-4 text-[#e4534b]" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#e4534b]">
                  {stats.highRiskCount}
                </div>
                <p className="text-xs text-[#8297ac] mt-0.5">Điểm rủi ro &ge; 70/100</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-white border border-[#d8e3ef] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8297ac] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên file hợp đồng..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#d8e3ef] focus:outline-none focus:border-[#EAD7B8]"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { key: "all", label: "Tất cả" },
                    { key: "high", label: "Rủi ro cao (≥70)" },
                    { key: "medium", label: "Cần lưu ý (35–69)" },
                    { key: "safe", label: "An toàn (<35)" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setRiskFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      riskFilter === tab.key
                        ? "bg-[#10253f] text-white"
                        : "bg-[#f8fafd] text-[#49627d] hover:bg-[#eef3f8] border border-[#d8e3ef]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-[#fff1f0] border border-[#ffd1cc] text-sm text-[#e4534b] font-medium">
                {error}
              </div>
            )}

            {loading ? (
              <div className="p-12 rounded-2xl bg-white border border-[#d8e3ef] flex items-center justify-center gap-3 text-[#8297ac]">
                <div className="w-6 h-6 rounded-full border-2 border-[#EAD7B8] border-t-transparent animate-spin" />
                <span className="text-sm font-medium">Đang tải danh sách hợp đồng...</span>
              </div>
            ) : enrichedContracts.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white border border-[#d8e3ef] text-center space-y-3">
                <FileText className="w-10 h-10 text-[#8297ac] mx-auto" />
                <h3 className="text-base font-bold text-[#10253f]">
                  Chưa có hợp đồng nào khớp bộ lọc
                </h3>
                <p className="text-sm text-[#8297ac]">
                  Hãy quay về trang chủ và tải hợp đồng lên để AI chấm điểm và lưu trữ vào lịch sử của bạn.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EAD7B8] hover:bg-[#d8bf97] text-sm font-bold text-[#10253f] transition-all"
                >
                  <span>Về trang chủ kiểm tra ngay</span>
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
                      className="p-5 rounded-2xl bg-white border border-[#d8e3ef] hover:border-[#EAD7B8] shadow-sm transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <FileText className="w-5 h-5 text-[#8a6834] shrink-0" />
                            <h3 className="text-base font-extrabold text-[#10253f]">
                              {contract.original_filename}
                            </h3>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                contract.status === "verified"
                                  ? "bg-[#eafbf7] text-[#0d7a5f] border-[#b7f6e5]"
                                  : "bg-[#f2f7fc] text-[#49627d] border-[#d8e3ef]"
                              }`}
                            >
                              {contract.status === "verified" ? (
                                <span className="inline-flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> Đã xác thực SHA-256
                                </span>
                              ) : (
                                contract.status
                              )}
                            </span>
                            {analysisCount > 0 && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF5ED] text-[#8a6834] border border-[#EAD7B8]/60">
                                Đã chấm {analysisCount} lần
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8297ac]">
                            <span>Kích thước: {formatBytes(contract.file_size_bytes)}</span>
                            <span>Định dạng: {contract.mime_type}</span>
                            {contract.contract_type && (
                              <span>Loại: {contract.contract_type}</span>
                            )}
                            <span>Tải lên: {formatDate(contract.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {latestAnalysis ? (
                            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#fff8e6] border border-[#ffe3a3]">
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
                                <div className="text-xs font-bold text-[#7d480e]">
                                  {latestAnalysis.risk_label}
                                </div>
                                <div className="text-[11px] text-[#996324]">
                                  {findings.length} điều khoản lưu ý
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#8297ac] italic">
                              Chưa có bản chấm lưu sẵn (Mở để chấm ngay)
                            </span>
                          )}

                          <Link
                            href={`/history/${contract.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10253f] hover:bg-[#1e3a5f] text-white text-xs font-bold transition-all shrink-0"
                          >
                            <span>Xem lại phần chấm</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Quick preview of top risky clauses if available */}
                      {findings.length > 0 && (
                        <div className="pt-3 border-t border-[#e6edf4] flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold text-[#8297ac] uppercase">
                            Điều khoản phát hiện:
                          </span>
                          {findings.slice(0, 4).map((f, idx) => {
                            const cScore = Math.round(f.clause_risk_score ?? 45);
                            return (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                  cScore >= 70
                                    ? "bg-[#fff1f0] text-[#e4534b] border-[#ffd1cc]"
                                    : cScore >= 40
                                      ? "bg-[#fff4e6] text-[#d77714] border-[#ffd8a8]"
                                      : "bg-[#eafbf7] text-[#159f7b] border-[#b7f6e5]"
                                }`}
                              >
                                <span>{f.title ?? f.matched_term}</span>
                                <span className="font-extrabold">({cScore}/100)</span>
                              </span>
                            );
                          })}
                          {findings.length > 4 && (
                            <span className="text-[11px] text-[#8297ac] font-medium">
                              +{findings.length - 4} điều khoản khác
                            </span>
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

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function HistoryPage() {
  return (
    <AuthProvider>
      <HistoryPageContent />
    </AuthProvider>
  );
}
