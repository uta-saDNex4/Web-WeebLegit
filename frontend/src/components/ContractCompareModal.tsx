"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  X,
  GitCompare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  Sparkles,
  FileText,
} from "lucide-react";
import * as api from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../lib/language-context";

interface ContractCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts?: api.ContractResponse[];
  initialContractAId?: string;
}

export const ContractCompareModal: React.FC<ContractCompareModalProps> = ({
  isOpen,
  onClose,
  contracts: externalContracts,
  initialContractAId,
}) => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const isEn = lang === "EN";

  const [contracts, setContracts] = useState<api.ContractResponse[]>(
    externalContracts || [],
  );
  const [loadingList, setLoadingList] = useState(false);
  const [contractIdA, setContractIdA] = useState<string>(initialContractAId || "");
  const [contractIdB, setContractIdB] = useState<string>("");
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<api.ContractComparisonResponse | null>(
    null,
  );

  const planTier = user?.plan_tier || (user?.role === "admin" ? "pro" : "free");
  const canCompare =
    user?.can_compare_contracts ?? (planTier === "medium" || planTier === "pro");

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setResult(null);
    if (externalContracts && externalContracts.length > 0) {
      setContracts(externalContracts);
      if (initialContractAId) {
        setContractIdA(initialContractAId);
      } else if (!contractIdA && externalContracts[0]) {
        setContractIdA(externalContracts[0].id);
      }
      return;
    }
    if (!user) return;
    setLoadingList(true);
    api
      .listContracts({ limit: 100 })
      .then((res) => {
        setContracts(res.items);
        if (initialContractAId) {
          setContractIdA(initialContractAId);
        } else if (res.items.length > 0) {
          setContractIdA(res.items[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, [isOpen, externalContracts, initialContractAId, user]);

  const selectedContractA = useMemo(
    () => contracts.find((c) => c.id === contractIdA) || null,
    [contracts, contractIdA],
  );

  // Filter Contract B candidates to ONLY contracts with the SAME contract_type as Contract A
  const matchingTypeContractsB = useMemo(() => {
    if (!selectedContractA) return [];
    const typeA = (selectedContractA.contract_type || "chung")
      .trim()
      .toLowerCase();
    return contracts.filter(
      (c) =>
        c.id !== selectedContractA.id &&
        (c.contract_type || "chung").trim().toLowerCase() === typeA,
    );
  }, [contracts, selectedContractA]);

  useEffect(() => {
    if (matchingTypeContractsB.length > 0) {
      const stillValid = matchingTypeContractsB.some((c) => c.id === contractIdB);
      if (!stillValid) {
        setContractIdB(matchingTypeContractsB[0].id);
      }
    } else {
      setContractIdB("");
    }
  }, [matchingTypeContractsB, contractIdB]);

  if (!isOpen) return null;

  const handleCompare = async () => {
    if (!contractIdA || !contractIdB) {
      setError(
        isEn
          ? "Please select two contracts of the same type to compare."
          : "Vui lòng chọn đủ 2 hợp đồng cùng loại để so sánh.",
      );
      return;
    }
    setComparing(true);
    setError(null);
    try {
      const res = await api.compareContracts(contractIdA, contractIdB);
      setResult(res);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
          ? "Failed to compare contracts"
          : "Không thể so sánh 2 hợp đồng này",
      );
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-[#0b1424] border border-slate-200 dark:border-[#1a2d4b] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1a2d4b] flex items-center justify-between bg-slate-50/70 dark:bg-[#0f1c33]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/15 dark:bg-amber-500/20 text-indigo-600 dark:text-amber-400 flex items-center justify-center">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>
                  {isEn
                    ? "Compare Two Same-Type Contracts"
                    : "So Sánh 2 Hợp Đồng Cùng Loại"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-amber-500/20 text-indigo-700 dark:text-amber-300 uppercase">
                  Medium / Pro
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? "Side-by-side risk score & clause evaluation for contracts of the same category."
                  : "Đối chiếu điểm rủi ro và điều khoản giữa 2 bản hợp đồng cùng phân loại."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {!canCompare ? (
            <div className="p-8 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {isEn
                  ? "Contract Comparison Requires Medium or Pro Plan"
                  : "Tính năng So Sánh Hợp Đồng thuộc gói Medium & Pro"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                {isEn
                  ? "Your current account is on the -free- plan. Upgrade to Medium (Free for verified students) or Pro to compare multiple contracts of the same type side-by-side."
                  : "Tài khoản hiện tại của bạn đang ở gói -free-. Hãy nâng cấp lên gói Medium (Miễn phí cho sinh viên xác thực) hoặc Pro để mở khóa so sánh 2 hợp đồng cùng loại."}
              </p>
              <Link
                href="/upgrade"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold shadow hover:opacity-90"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isEn ? "View Upgrade Plans (/upgrade)" : "Xem gói Nâng cấp (/upgrade)"}
                </span>
              </Link>
            </div>
          ) : loadingList ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-semibold">
                {isEn ? "Loading your contracts..." : "Đang tải danh sách hợp đồng..."}
              </span>
            </div>
          ) : (
            <>
              {/* Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#101e36] border border-slate-200 dark:border-[#1f3557]">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                    {isEn ? "1. Select Contract A" : "1. Chọn Hợp đồng A (Gốc)"}
                  </label>
                  <select
                    value={contractIdA}
                    onChange={(e) => {
                      setContractIdA(e.target.value);
                      setResult(null);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0b1424] border border-slate-300 dark:border-[#243b61] text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {contracts.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.contract_type || "Chung"}] {c.original_filename}
                      </option>
                    ))}
                  </select>
                  {selectedContractA && (
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {isEn ? "Category:" : "Phân loại:"}{" "}
                      <strong className="text-indigo-600 dark:text-amber-400 uppercase">
                        {selectedContractA.contract_type || "Chung"}
                      </strong>
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#101e36] border border-slate-200 dark:border-[#1f3557]">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                    {isEn
                      ? "2. Select Contract B (Same Category Only)"
                      : "2. Chọn Hợp đồng B (Cùng loại với Hợp đồng A)"}
                  </label>
                  {matchingTypeContractsB.length === 0 ? (
                    <div className="px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                      {isEn
                        ? `No other contract found with category "${selectedContractA?.contract_type || "Chung"}". Please upload another contract of the same category first.`
                        : `Chưa có hợp đồng thứ 2 cùng loại "${selectedContractA?.contract_type || "Chung"}". Hãy tải thêm ít nhất 1 hợp đồng cùng loại để đối chiếu.`}
                    </div>
                  ) : (
                    <select
                      value={contractIdB}
                      onChange={(e) => {
                        setContractIdB(e.target.value);
                        setResult(null);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0b1424] border border-slate-300 dark:border-[#243b61] text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      {matchingTypeContractsB.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.contract_type || "Chung"}] {c.original_filename}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCompare}
                  disabled={
                    comparing || !contractIdA || !contractIdB || matchingTypeContractsB.length === 0
                  }
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-amber-500 dark:hover:bg-amber-400 disabled:opacity-50 text-white dark:text-slate-950 text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer"
                >
                  {comparing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {isEn ? "Comparing contracts..." : "Đang đối chiếu 2 hợp đồng..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <GitCompare className="w-4 h-4" />
                      <span>
                        {isEn ? "Run Side-by-Side Comparison" : "Bắt đầu So sánh 2 Hợp đồng"}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Comparison Result */}
              {result && (
                <div className="space-y-5 pt-2">
                  {/* Recommendation Banner */}
                  <div className="p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          {isEn
                            ? `AI Comparison Verdict • Category: ${result.contract_type}`
                            : `Kết luận đối chiếu AI • Loại hợp đồng: ${result.contract_type}`}
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 leading-relaxed">
                          {isEn ? result.recommendation_en : result.recommendation_vi}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Side by side cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: "A", data: result.contract_a },
                      { label: "B", data: result.contract_b },
                    ].map(({ label, data }) => {
                      const isSafer = result.safer_contract_id === data.contract_id;
                      return (
                        <div
                          key={data.contract_id}
                          className={`p-5 rounded-2xl border ${
                            isSafer
                              ? "border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/15"
                              : "border-slate-200 dark:border-[#1f3557] bg-white dark:bg-[#101e36]"
                          } space-y-4`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                {isEn ? `Contract ${label}` : `Hợp đồng ${label}`}
                              </span>
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate flex items-center gap-1.5 mt-0.5">
                                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span className="truncate">{data.original_filename}</span>
                              </h4>
                            </div>
                            {isSafer && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase shrink-0">
                                ★ {isEn ? "Safer Choice" : "An toàn hơn"}
                              </span>
                            )}
                          </div>

                          {/* Score & Clause Counts */}
                          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1424] border border-slate-200/70 dark:border-[#1a2d4b]">
                            <div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                {isEn ? "Overall Risk Score" : "Điểm rủi ro tổng"}
                              </span>
                              <div
                                className={`text-2xl font-black mt-0.5 ${
                                  data.risk_score >= 70
                                    ? "text-red-600 dark:text-red-400"
                                    : data.risk_score >= 40
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {data.risk_score}/100
                              </div>
                              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                {data.risk_label}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-red-600 dark:text-red-400 font-semibold">
                                  {isEn ? "High risk:" : "Rủi ro cao:"}
                                </span>
                                <strong>{data.high_risk_count}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                  {isEn ? "Medium risk:" : "Trung bình:"}
                                </span>
                                <strong>{data.medium_risk_count}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  {isEn ? "Low risk:" : "Rủi ro thấp:"}
                                </span>
                                <strong>{data.low_risk_count}</strong>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                            {data.overview}
                          </p>

                          {/* Top 3 findings */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1a2d4b]">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                              {isEn
                                ? `Key Clauses (${data.findings_count})`
                                : `Điều khoản nổi bật (${data.findings_count})`}
                            </span>
                            {data.findings.slice(0, 3).map((f, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b1424] text-xs space-y-0.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {f.title}
                                  </span>
                                  {typeof f.clause_risk_score === "number" && (
                                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                                      {f.clause_risk_score} pts
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {f.analysis || f.warning || f.clause_text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
