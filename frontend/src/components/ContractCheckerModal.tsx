"use client";
import React, { useRef, useState } from "react";
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
}

// ─── Sample risks (static analysis demo) ─────────────────────────────────────
const sampleRisks = [
  {
    id: "risk-1",
    severity: "high",
    title: "Khoản phạt vô lý nếu nghỉ việc trước hạn",
    clauseText:
      "Thực tập sinh phải bồi thường 15.000.000 VNĐ chi phí đào tạo nếu không làm việc chính thức tại công ty sau khi kết thúc đợt thực tập.",
    analysis:
      "Điều khoản này không hợp lệ nếu công ty không cung cấp khóa đào tạo cấp chứng chỉ và không có hóa đơn chứng từ chi phí thực tế.",
    law: "Điều 62 Bộ luật Lao động 2019",
    negotiationScript:
      "Dạ anh/chị ơi, theo quy định về thỏa thuận đào tạo, chi phí bồi hoàn cần căn cứ theo chứng từ đào tạo thực tế. Em xin phép đề xuất điều chỉnh điều khoản này để phù hợp với quy định của Bộ luật Lao động ạ.",
  },
  {
    id: "risk-2",
    severity: "medium",
    title: "Chưa làm rõ mức phụ cấp hàng tháng",
    clauseText:
      "Phụ cấp thực tập sẽ được xem xét tùy theo kết quả kinh doanh vào cuối kỳ.",
    analysis:
      "Bạn làm việc 40h/tuần nhưng không có phụ cấp cố định tối thiểu bảo đảm chi phí đi lại và ăn trưa.",
    law: "Khuyến nghị tiêu chuẩn quyền lợi thực tập",
    negotiationScript:
      "Em muốn xin phép hỏi rõ hơn về mức hỗ trợ phụ cấp cố định hàng tháng (như tiền ăn trưa, xăng xe) trong suốt thời gian thực tập 3 tháng để em chủ động kế hoạch sinh hoạt ạ.",
  },
  {
    id: "risk-3",
    severity: "low",
    title: "Bảo mật thông tin (NDA) quá rộng",
    clauseText:
      "Thực tập sinh không được làm việc trong cùng ngành nghề trong vòng 2 năm sau khi rời công ty.",
    analysis:
      "Điều khoản cấm làm việc sau nghỉ việc (Non-compete) thường không áp dụng cho vị trí thực tập sinh chưa tiếp cận bí mật kinh doanh cốt lõi.",
    law: "Quyền tự do làm việc - Hiến pháp & BLLĐ 2019",
    negotiationScript:
      "Em cam kết bảo mật 100% dữ liệu nội bộ của công ty, tuy nhiên điều khoản hạn chế công việc sau này hơi rộng so với vị trí thực tập, em xin phép bỏ phần giới hạn tìm việc sau tốt nghiệp ạ.",
  },
];

export const ContractCheckerModal: React.FC<ContractCheckerModalProps> = ({
  isOpen,
  onClose,
  onNeedAuth,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedContract, setUploadedContract] =
    useState<UploadedContract | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const resetAll = () => {
    setStage("upload");
    setSelectedFile(null);
    setUploadedContract(null);
    setVerifyResult(null);
    setError(null);
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

  const handleUploadAndVerify = async () => {
    if (!user) {
      onNeedAuth();
      return;
    }
    if (!selectedFile) return;

    setError(null);

    try {
      // Step 1: Upload
      setStage("uploading");
      const contract = await api.uploadContract(selectedFile);
      setUploadedContract({
        id: contract.id,
        filename: contract.original_filename,
        sha256_hash: contract.sha256_hash,
        file_size_bytes: contract.file_size_bytes,
        status: contract.status,
      });

      // Step 2: Verify (server re-reads stored file)
      setStage("verifying");
      const vResult = await api.verifyContract(contract.id);
      setVerifyResult({
        result: vResult.result,
        expected_sha256: vResult.expected_sha256,
        actual_sha256: vResult.actual_sha256,
        duration_ms: vResult.duration_ms,
      });
      setStage("result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setStage("upload");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl border border-[#d8e3ef] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-6"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e6edf4] flex items-center justify-between bg-[#f8fafd]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#10253f]">
                Trình kiểm tra & Xác thực hợp đồng
              </h3>
              <p className="text-xs text-[#8297ac]">
                Upload hợp đồng để tính SHA-256 & xác thực tính toàn vẹn
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#8297ac] hover:text-[#10253f] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* ── Chưa đăng nhập ── */}
          {!user && (
            <div className="p-5 rounded-xl bg-[#f2f7fc] border border-[#d8e3ef] flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#EAD7B8]/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#8a6834]" />
              </div>
              <div>
                <p className="font-semibold text-[#10253f] text-sm">
                  Cần đăng nhập để sử dụng
                </p>
                <p className="text-xs text-[#8297ac] mt-0.5">
                  Tạo tài khoản miễn phí để upload và xác thực hợp đồng
                </p>
              </div>
              <button
                onClick={onNeedAuth}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#EAD7B8] text-[#10253f] text-sm font-semibold rounded-xl shadow-sm hover:bg-[#dfc59f] transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Đăng nhập / Đăng ký
              </button>
            </div>
          )}

          {/* ── Upload stage ── */}
          {stage === "upload" && (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-[#EAD7B8] bg-[#EAD7B8]/10"
                    : selectedFile
                      ? "border-[#159f7b] bg-[#eafbf7]"
                      : "border-[#b9cadd] hover:border-[#EAD7B8] bg-[#f8fafd]/80"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileSelect(e.target.files[0])
                  }
                />
                {selectedFile ? (
                  <>
                    <FileText className="w-9 h-9 text-[#159f7b] mx-auto mb-2" />
                    <p className="font-bold text-sm text-[#10253f]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-[#8297ac] mt-1">
                      {formatBytes(selectedFile.size)} • Nhấn để đổi file
                    </p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-9 h-9 text-[#8a6834] mx-auto mb-2" />
                    <p className="font-bold text-sm text-[#10253f] mb-1">
                      Kéo thả hoặc nhấn để chọn file
                    </p>
                    <p className="text-xs text-[#8297ac]">
                      Hỗ trợ PDF, DOCX, DOC, TXT (tối đa 20MB)
                    </p>
                  </>
                )}
              </div>

              {error && (
                <div className="px-3 py-2 bg-[#fff1f0] border border-[#ffd1cc] rounded-lg text-xs text-[#e4534b] font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {selectedFile && user && (
                <button
                  onClick={handleUploadAndVerify}
                  className="w-full py-3 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Upload & Xác thực SHA-256
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* ── Loading stages ── */}
          {(stage === "uploading" || stage === "verifying") && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-[#d8e3ef]" />
                <div className="absolute inset-0 rounded-full border-4 border-[#EAD7B8] border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {stage === "uploading" ? (
                    <UploadCloud className="w-6 h-6 text-[#8a6834]" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-[#8a6834]" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#10253f] text-sm">
                  {stage === "uploading"
                    ? "Đang tải lên & tính SHA-256..."
                    : "Đang xác thực toàn vẹn file..."}
                </p>
                <p className="text-xs text-[#8297ac] mt-1">
                  {stage === "uploading"
                    ? "Server đang hash file của bạn"
                    : "So sánh hash constant-time"}
                </p>
              </div>
            </div>
          )}

          {/* ── Result stage ── */}
          {stage === "result" && uploadedContract && verifyResult && (
            <div className="space-y-5">
              {/* Verification result badge */}
              <div
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  verifyResult.result === "matched"
                    ? "bg-[#eafbf7] border-[#b7f6e5]"
                    : verifyResult.result === "mismatched"
                      ? "bg-[#fff1f0] border-[#ffd1cc]"
                      : "bg-[#fff8e6] border-[#ffe3a3]"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    verifyResult.result === "matched"
                      ? "bg-[#159f7b]/15"
                      : verifyResult.result === "mismatched"
                        ? "bg-[#e4534b]/15"
                        : "bg-[#d77714]/15"
                  }`}
                >
                  {verifyResult.result === "matched" ? (
                    <CheckCircle2 className="w-7 h-7 text-[#159f7b]" />
                  ) : verifyResult.result === "mismatched" ? (
                    <ShieldAlert className="w-7 h-7 text-[#e4534b]" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-[#d77714]" />
                  )}
                </div>
                <div>
                  <p
                    className={`font-bold text-sm ${
                      verifyResult.result === "matched"
                        ? "text-[#0d7a5f]"
                        : verifyResult.result === "mismatched"
                          ? "text-[#b91c1c]"
                          : "text-[#7d480e]"
                    }`}
                  >
                    {verifyResult.result === "matched" &&
                      "✅ File hợp lệ — SHA-256 khớp"}
                    {verifyResult.result === "mismatched" &&
                      "⚠️ Cảnh báo — File đã bị thay đổi"}
                    {verifyResult.result === "failed" && "❌ Xác thực thất bại"}
                  </p>
                  <p className="text-xs text-[#49627d] mt-0.5">
                    {verifyResult.result === "matched" &&
                      "File chưa bị chỉnh sửa kể từ khi upload lên hệ thống."}
                    {verifyResult.result === "mismatched" &&
                      "Hash không khớp — nội dung file khác với bản đã lưu."}
                    {verifyResult.result === "failed" &&
                      "Không thể đọc file từ storage để xác thực."}
                  </p>
                  {verifyResult.duration_ms != null && (
                    <p className="text-xs text-[#8297ac] mt-1">
                      Thời gian xử lý: {verifyResult.duration_ms}ms
                    </p>
                  )}
                </div>
              </div>

              {/* Hash details */}
              <div className="p-4 rounded-xl bg-[#f8fafd] border border-[#d8e3ef] space-y-3">
                <h4 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">
                  Chi tiết SHA-256
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-[11px] font-semibold text-[#49627d] mb-1">
                      📁 File: {uploadedContract.filename}
                    </p>
                    <p className="text-[11px] text-[#8297ac]">
                      Kích thước:{" "}
                      {formatBytes(uploadedContract.file_size_bytes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#49627d] mb-1">
                      Hash lưu trữ (expected):
                    </p>
                    <code className="text-[10px] font-mono text-[#10253f] bg-white px-2 py-1 rounded-lg border border-[#d8e3ef] break-all block">
                      {verifyResult.expected_sha256}
                    </code>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#49627d] mb-1">
                      Hash xác thực (actual):
                    </p>
                    <code
                      className={`text-[10px] font-mono px-2 py-1 rounded-lg border break-all block ${
                        verifyResult.result === "matched"
                          ? "text-[#159f7b] bg-[#eafbf7] border-[#b7f6e5]"
                          : "text-[#e4534b] bg-[#fff1f0] border-[#ffd1cc]"
                      }`}
                    >
                      {verifyResult.actual_sha256}
                    </code>
                  </div>
                </div>
              </div>

              {/* AI Risk Analysis (static demo) */}
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-[#fff8e6] border border-[#ffe3a3] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#d77714] text-white flex items-center justify-center font-extrabold text-xs">
                      72%
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#7d480e]">
                        Điểm an toàn: Cần làm rõ thêm
                      </div>
                      <div className="text-xs text-[#996324]">
                        Tìm thấy 3 điểm mập mờ cần trao đổi trước khi ký.
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[#d77714] bg-white px-2.5 py-1 rounded-lg border border-[#ffe3a3]">
                    3 Lưu ý
                  </div>
                </div>

                <h4 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider">
                  Chi tiết các điều khoản có rủi ro
                </h4>

                {sampleRisks.map((risk) => (
                  <div
                    key={risk.id}
                    className="p-4 rounded-xl bg-white border border-[#d8e3ef] shadow-sm space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      {risk.severity === "high" ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fff1f0] text-[#e4534b] border border-[#ffd1cc]">
                          Mức rủi ro cao
                        </span>
                      ) : risk.severity === "medium" ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fff4e6] text-[#d77714] border border-[#ffd8a8]">
                          Cần làm rõ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f2f7fc] text-[#49627d] border border-[#d8e3ef]">
                          Lưu ý nhẹ
                        </span>
                      )}
                      <h5 className="text-sm font-bold text-[#10253f]">
                        {risk.title}
                      </h5>
                    </div>
                    <div className="p-3 bg-[#f8fafd] rounded-lg text-xs text-[#26435e] italic border-l-2 border-[#EAD7B8]">
                      &quot;{risk.clauseText}&quot;
                    </div>
                    <div className="text-xs text-[#49627d] leading-relaxed">
                      <strong>Phân tích:</strong> {risk.analysis}
                    </div>
                    <div className="text-xs text-[#8a6834] font-medium flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{risk.law}</span>
                    </div>
                    <div className="pt-2 border-t border-[#e6edf4]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#159f7b] mb-1.5">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          Gợi ý câu nhắn tin/trao đổi lịch sự:
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(risk.id, risk.negotiationScript)
                          }
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#eafbf7] hover:bg-[#d0f5ec] text-[#159f7b] border border-[#b7f6e5] transition-colors cursor-pointer"
                        >
                          {copiedId === risk.id ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Đã sao chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Sao chép câu hỏi</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-[#26435e] bg-[#f7fafc] p-2.5 rounded-lg border border-[#e6edf4]">
                        &quot;{risk.negotiationScript}&quot;
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reset button */}
              <button
                onClick={resetAll}
                className="w-full py-2.5 border border-[#d8e3ef] text-sm font-semibold text-[#49627d] hover:text-[#10253f] hover:border-[#EAD7B8] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Kiểm tra file khác
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#f8fafd] border-t border-[#e6edf4] flex items-center justify-between">
          <span className="text-xs text-[#8297ac]">
            Contractly AI • Bảo mật 100% dữ liệu
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[#10253f] hover:bg-[#173d5a] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng bảng kiểm tra
          </button>
        </div>
      </motion.div>
    </div>
  );
};
