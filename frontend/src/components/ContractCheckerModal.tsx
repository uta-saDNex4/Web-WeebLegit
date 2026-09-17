"use client";
import React, { useEffect, useRef, useState } from "react";
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
  Send,
  Bot,
  User as UserIcon,
  CornerDownLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../lib/auth-context";
import * as api from "../lib/api";
import { ContractTemplate } from "../types";

interface ContractCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNeedAuth: () => void;
  initialTemplate?: ContractTemplate | null;
}

type Stage = "upload" | "uploading" | "verifying" | "result";
type ResultViewTab = "verification" | "risks" | "ai_chat";

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

interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  negotiationScript?: string | null;
}

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
  initialTemplate,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<Stage>("upload");
  const [activeResultTab, setActiveResultTab] =
    useState<ResultViewTab>("verification");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedContract, setUploadedContract] =
    useState<UploadedContract | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // AI Chat States
  const [chatMessages, setChatMessages] = useState<ChatTurn[]>([
    {
      id: "init",
      role: "assistant",
      content:
        "Xin chào bạn! Mình là Trợ lý AI Pháp lý WeebLegit. Bạn có thể hỏi bất kỳ câu hỏi nào về các điều khoản, tiền cọc, lương thử việc hoặc yêu cầu mình soạn kịch bản đàm phán lịch sự gửi đối tác nhé!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Handle template pre-population
  useEffect(() => {
    if (initialTemplate && isOpen) {
      const templateContent =
        `${initialTemplate.title}\n${initialTemplate.subtitle}\n\n` +
        initialTemplate.clauses
          .map((c) => `${c.title}\n${c.content}`)
          .join("\n\n");
      const blob = new Blob([templateContent], { type: "text/plain" });
      const file = new File(
        [blob],
        `${initialTemplate.id}_sample_contract.txt`,
        { type: "text/plain" },
      );
      setSelectedFile(file);
      setChatMessages([
        {
          id: "template-init",
          role: "assistant",
          content: `Đã nạp mẫu: **${initialTemplate.title}**. Bạn hãy nhấn nút "Upload & Xác thực SHA-256" để tiến hành rà soát bẫy điều khoản và kiểm tra mã hash toàn vẹn nhé!`,
        },
      ]);
    }
  }, [initialTemplate, isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const resetAll = () => {
    setStage("upload");
    setActiveResultTab("verification");
    setSelectedFile(null);
    setUploadedContract(null);
    setVerifyResult(null);
    setError(null);
    setChatMessages([
      {
        id: "init",
        role: "assistant",
        content:
          "Xin chào bạn! Mình là Trợ lý AI Pháp lý WeebLegit. Bạn có thể hỏi bất kỳ câu hỏi nào về các điều khoản hoặc yêu cầu mình soạn tin nhắn đàm phán nhé!",
      },
    ]);
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

      // Add context to AI chat
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `✅ File **${contract.original_filename}** đã được tải lên và xác thực mã băm SHA-256 (${vResult.result === "matched" ? "Khớp hoàn toàn 100%" : "Có cảnh báo lệch hash"}). Bạn có thể chuyển sang Tab **"Phân tích Bẫy Rủi ro"** hoặc hỏi mình bất cứ điều gì về hợp đồng này!`,
        },
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi xử lý");
      setStage("upload");
    }
  };

  const handleSendChatMessage = async (presetText?: string) => {
    const text = presetText || chatInput;
    if (!text.trim() || chatLoading) return;

    const userMsg: ChatTurn = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const history = chatMessages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const context = uploadedContract
        ? `Hợp đồng: ${uploadedContract.filename}, SHA256: ${uploadedContract.sha256_hash}`
        : selectedFile
          ? `File: ${selectedFile.name}`
          : "Hợp đồng sinh viên";

      const res = await api.chatWithAi(text, context, stage, history);

      const aiMsg: ChatTurn = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.reply,
        citations: res.citations,
        negotiationScript: res.negotiation_script,
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Không thể kết nối đến máy chủ AI. Bạn hãy thử lại hoặc kiểm tra kết nối mạng nhé.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl border border-[#d8e3ef] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-4"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#e6edf4] flex items-center justify-between bg-[#f8fafd]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#10253f]">
                Trình kiểm tra & Phân tích Hợp đồng AI
              </h3>
              <p className="text-[11px] text-[#8297ac]">
                Xác thực toàn vẹn SHA-256 • Nhận diện bẫy pháp lý • Soạn kịch bản đàm phán
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#8297ac] hover:text-[#10253f] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subheader Navigation (when in result stage) */}
        {stage === "result" && (
          <div className="px-5 border-b border-[#e6edf4] bg-white flex items-center gap-2 overflow-x-auto">
            {[
              { id: "verification", label: "Kết quả SHA-256", icon: ShieldCheck },
              { id: "risks", label: "Phân tích Rủi ro & Bẫy", icon: AlertTriangle },
              { id: "ai_chat", label: "Trợ lý AI Đàm phán", icon: Bot },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeResultTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveResultTab(tab.id as ResultViewTab)}
                  className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "border-[#8a6834] text-[#8a6834]"
                      : "border-transparent text-[#49627d] hover:text-[#10253f]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* ── Need Auth Banner ── */}
          {!user && (
            <div className="p-4 rounded-xl bg-[#FAF5ED] border border-[#EAD7B8] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EAD7B8]/40 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-[#8a6834]" />
                </div>
                <div>
                  <p className="font-bold text-[#10253f] text-xs sm:text-sm">
                    Đăng nhập để lưu trữ kết quả & bảo mật file
                  </p>
                  <p className="text-[11px] text-[#8297ac]">
                    Miễn phí 100% cho học sinh, sinh viên khi tải lên đối chiếu
                  </p>
                </div>
              </div>
              <button
                onClick={onNeedAuth}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#10253f] text-white text-xs font-semibold rounded-xl hover:bg-[#173d5a] transition-colors cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Đăng nhập ngay
              </button>
            </div>
          )}

          {/* ── Stage: Upload ── */}
          {stage === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-[#8a6834] bg-[#FAF5ED]/50"
                    : selectedFile
                      ? "border-[#159f7b] bg-[#eafbf7]/50"
                      : "border-[#b9cadd] hover:border-[#8a6834] bg-[#f8fafd]/80"
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
                    <FileText className="w-10 h-10 text-[#159f7b] mx-auto mb-2" />
                    <p className="font-bold text-sm text-[#10253f]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-[#8297ac] mt-1">
                      {formatBytes(selectedFile.size)} • Nhấn để chọn file khác
                    </p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-[#8a6834] mx-auto mb-2" />
                    <p className="font-bold text-sm text-[#10253f] mb-1">
                      Kéo thả hoặc nhấn để tải hợp đồng lên
                    </p>
                    <p className="text-xs text-[#8297ac]">
                      Hỗ trợ PDF, DOCX, DOC, TXT (tối đa 20MB)
                    </p>
                  </>
                )}
              </div>

              {error && (
                <div className="px-3 py-2 bg-[#fff1f0] border border-[#ffd1cc] rounded-xl text-xs text-[#e4534b] font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {/* Quick AI Pre-upload Advices */}
              <div className="p-4 rounded-xl bg-[#f8fafd] border border-[#d8e3ef] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a6834]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mẹo từ WeebLegit trước khi ký:</span>
                </div>
                <ul className="text-xs text-[#49627d] space-y-1 list-disc list-inside">
                  <li>Tuyệt đối không giao bản gốc CCCD/CMND cho chủ nhà hoặc nhà tuyển dụng (Điều 7 Luật Căn cước 2023).</li>
                  <li>Không chuyển tiền cọc giữ phòng trước khi xem phòng trực tiếp và đối chiếu giấy tờ chủ sở hữu.</li>
                  <li>Mọi thỏa thuận miệng về tiền điện nước, thời gian làm việc đều phải ghi rõ vào hợp đồng.</li>
                </ul>
              </div>

              {selectedFile && user && (
                <button
                  onClick={handleUploadAndVerify}
                  className="w-full py-3 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Upload & Xác thực Toàn vẹn SHA-256
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* ── Stage: Loading ── */}
          {(stage === "uploading" || stage === "verifying") && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-[#d8e3ef]" />
                <div className="absolute inset-0 rounded-full border-4 border-[#8a6834] border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {stage === "uploading" ? (
                    <UploadCloud className="w-6 h-6 text-[#8a6834]" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-[#8a6834]" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-[#10253f] text-sm">
                  {stage === "uploading"
                    ? "Đang lưu trữ & tính mã băm SHA-256..."
                    : "Đang đọc lại byte file & đối chiếu constant-time..."}
                </p>
                <p className="text-xs text-[#8297ac] mt-1">
                  {stage === "uploading"
                    ? "Tạo bản sao bảo mật trong hệ thống"
                    : "Kiểm tra từng byte để phát hiện can thiệp chỉnh sửa"}
                </p>
              </div>
            </div>
          )}

          {/* ── Stage: Result View (Tabbed) ── */}
          {stage === "result" && uploadedContract && verifyResult && (
            <div>
              {/* Tab 1: Verification & Hashes */}
              {activeResultTab === "verification" && (
                <div className="space-y-4">
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
                          ? "bg-[#159f7b]/20 text-[#159f7b]"
                          : verifyResult.result === "mismatched"
                            ? "bg-[#e4534b]/20 text-[#e4534b]"
                            : "bg-[#d77714]/20 text-[#d77714]"
                      }`}
                    >
                      {verifyResult.result === "matched" ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : (
                        <ShieldAlert className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <h4
                        className={`font-bold text-sm ${
                          verifyResult.result === "matched"
                            ? "text-[#0d7a5f]"
                            : "text-[#b91c1c]"
                        }`}
                      >
                        {verifyResult.result === "matched"
                          ? "✅ Toàn vẹn 100% — Mã SHA-256 khớp tuyệt đối"
                          : "⚠️ Cảnh báo — Tệp đã bị can thiệp chỉnh sửa!"}
                      </h4>
                      <p className="text-xs text-[#49627d] mt-0.5">
                        {verifyResult.result === "matched"
                          ? "Tệp hợp đồng trên máy chủ hoàn toàn nguyên bản so với thời điểm bạn tải lên."
                          : "Mã hash hiện tại không khớp với bản gốc. Tệp có thể đã bị sửa đổi nội dung!"}
                      </p>
                      {verifyResult.duration_ms != null && (
                        <span className="text-[11px] text-[#8297ac] mt-1 block">
                          Thời gian xác thực: {verifyResult.duration_ms} ms
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hash Details Block */}
                  <div className="p-4 rounded-xl bg-[#f8fafd] border border-[#d8e3ef] space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#8297ac] uppercase tracking-wider text-[10px]">
                        Thông tin tệp & Mã băm SHA-256
                      </span>
                      <span className="text-[#8297ac]">
                        {uploadedContract.filename} ({formatBytes(uploadedContract.file_size_bytes)})
                      </span>
                    </div>

                    <div>
                      <p className="font-semibold text-[#49627d] mb-1">
                        Mã hash chuẩn lưu trữ (Expected SHA-256):
                      </p>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#d8e3ef] font-mono text-[11px] text-[#10253f] break-all">
                        <span>{verifyResult.expected_sha256}</span>
                        <button
                          onClick={() => handleCopy("exp", verifyResult.expected_sha256)}
                          className="ml-2 text-[#8a6834] hover:text-[#10253f] cursor-pointer shrink-0"
                        >
                          {copiedId === "exp" ? <Check className="w-3.5 h-3.5 text-[#159f7b]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-[#49627d] mb-1">
                        Mã hash tính lại từ bộ nhớ (Actual SHA-256):
                      </p>
                      <div className={`flex items-center justify-between p-2 rounded-lg border font-mono text-[11px] break-all ${
                        verifyResult.result === "matched"
                          ? "bg-[#eafbf7] border-[#b7f6e5] text-[#159f7b]"
                          : "bg-[#fff1f0] border-[#ffd1cc] text-[#e4534b]"
                      }`}>
                        <span>{verifyResult.actual_sha256}</span>
                        <button
                          onClick={() => handleCopy("act", verifyResult.actual_sha256)}
                          className="ml-2 cursor-pointer shrink-0"
                        >
                          {copiedId === "act" ? <Check className="w-3.5 h-3.5 text-[#159f7b]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setActiveResultTab("risks")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <span>Xem phân tích bẫy rủi ro</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Risks & Clause Breakdown */}
              {activeResultTab === "risks" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#fff8e6] border border-[#ffe3a3] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d77714] text-white flex items-center justify-center font-black text-xs">
                        74%
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#7d480e]">
                          Điểm an toàn: Cần trao đổi làm rõ thêm
                        </div>
                        <div className="text-[11px] text-[#996324]">
                          Phát hiện 3 điều khoản có nguy cơ gây bất lợi cho sinh viên.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveResultTab("ai_chat")}
                      className="px-3 py-1.5 bg-white text-[#d77714] border border-[#ffe3a3] text-xs font-bold rounded-lg hover:bg-[#FAF5ED] transition-all shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      Hỏi AI đàm phán
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sampleRisks.map((risk) => (
                      <div
                        key={risk.id}
                        className="p-4 rounded-xl bg-white border border-[#d8e3ef] shadow-sm space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                risk.severity === "high"
                                  ? "bg-[#fff1f0] text-[#e4534b] border border-[#ffd1cc]"
                                  : "bg-[#fff4e6] text-[#d77714] border border-[#ffd8a8]"
                              }`}
                            >
                              {risk.severity === "high" ? "Rủi ro cao" : "Cần làm rõ"}
                            </span>
                            <h5 className="text-xs sm:text-sm font-bold text-[#10253f]">
                              {risk.title}
                            </h5>
                          </div>
                          <button
                            onClick={() => {
                              setActiveResultTab("ai_chat");
                              handleSendChatMessage(
                                `Hãy giải thích chi tiết bẫy rủi ro và soạn tin nhắn đàm phán cho điều khoản: "${risk.clauseText}"`,
                              );
                            }}
                            className="text-[11px] font-semibold text-[#8a6834] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Bot className="w-3 h-3" /> Hỏi AI
                          </button>
                        </div>

                        <div className="p-2.5 bg-[#f8fafd] rounded-lg text-xs text-[#26435e] italic border-l-2 border-[#EAD7B8]">
                          &quot;{risk.clauseText}&quot;
                        </div>

                        <p className="text-xs text-[#49627d] leading-relaxed">
                          <strong>Phân tích:</strong> {risk.analysis}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-[#e6edf4] text-[11px]">
                          <span className="font-semibold text-[#8a6834] flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> {risk.law}
                          </span>
                          <button
                            onClick={() => handleCopy(risk.id, risk.negotiationScript)}
                            className="text-[#159f7b] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === risk.id ? (
                              <>
                                <Check className="w-3 h-3" /> Đã sao chép kịch bản
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Sao chép tin nhắn đàm phán
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Live Interactive AI Chat */}
              {activeResultTab === "ai_chat" && (
                <div className="flex flex-col h-[460px] bg-[#f8fafd] rounded-2xl border border-[#d8e3ef] overflow-hidden">
                  {/* Messages list */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-lg bg-[#EAD7B8] text-[#10253f] flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-[#10253f] text-white rounded-br-none"
                              : "bg-white text-[#10253f] border border-[#d8e3ef] rounded-bl-none shadow-sm"
                          }`}
                        >
                          <div className="whitespace-pre-line">{msg.content}</div>

                          {/* Citations */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-[#e6edf4] flex flex-wrap gap-1">
                              {msg.citations.map((c, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded bg-[#FAF5ED] text-[#8a6834] font-semibold text-[10px]"
                                >
                                  ⚖️ {c}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Negotiation Script Card */}
                          {msg.negotiationScript && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-[#eafbf7] border border-[#b7f6e5] text-[#0d7a5f]">
                              <div className="flex items-center justify-between font-bold text-[10px] uppercase mb-1">
                                <span>Kịch bản tin nhắn đàm phán:</span>
                                <button
                                  onClick={() => handleCopy(msg.id, msg.negotiationScript!)}
                                  className="text-[11px] underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  {copiedId === msg.id ? "Đã copy!" : "Copy mẫu"}
                                </button>
                              </div>
                              <p className="italic text-[11px]">{msg.negotiationScript}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {chatLoading && (
                      <div className="flex gap-2 items-center text-xs text-[#8297ac] p-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8a6834]" />
                        <span>Trợ lý AI đang tra cứu luật và soạn câu trả lời...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Suggested quick pills */}
                  <div className="px-3 py-2 bg-white border-t border-[#e6edf4] flex gap-1.5 overflow-x-auto text-[11px]">
                    {[
                      "Soạn tin nhắn xin giảm tiền cọc",
                      "Nghỉ việc có phải đền tiền đào tạo không?",
                      "Lương thử việc tối thiểu bao nhiêu?",
                      "Ý nghĩa của mã hash SHA-256?",
                    ].map((pill, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendChatMessage(pill)}
                        className="px-2.5 py-1 rounded-full bg-[#f2f7fc] hover:bg-[#FAF5ED] hover:text-[#8a6834] text-[#49627d] transition-all whitespace-nowrap border border-[#d8e3ef] cursor-pointer"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>

                  {/* Chat input form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage();
                    }}
                    className="p-3 bg-white border-t border-[#e6edf4] flex gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Hỏi AI về hợp đồng hoặc yêu cầu soạn tin đàm phán..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#d8e3ef] focus:outline-none focus:border-[#8a6834]"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatInput.trim()}
                      className="p-2 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                      title="Gửi câu hỏi"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-5 py-3 bg-[#f8fafd] border-t border-[#e6edf4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {stage === "result" && (
              <button
                onClick={resetAll}
                className="px-3 py-1.5 rounded-xl border border-[#d8e3ef] text-xs font-semibold text-[#49627d] hover:text-[#10253f] hover:bg-white transition-all cursor-pointer"
              >
                Quét tệp khác
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-1.5 bg-[#10253f] hover:bg-[#173d5a] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
