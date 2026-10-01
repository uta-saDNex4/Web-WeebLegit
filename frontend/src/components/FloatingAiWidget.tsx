import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Loader2,
  Minimize2,
  Copy,
  Check,
  Plus,
  Image as ImageIcon,
  FileText,
  History,
  RotateCcw,
  Trash2,
  Lock,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as api from "../lib/api";
import { useLanguage } from "../lib/language-context";
import { useAuth } from "../lib/auth-context";
import {
  ChatSession,
  getOrCreateCurrentSession,
  createNewSession,
  addMessageToSession,
  getChatSessions,
  setActiveSessionId,
  deleteSession,
  CHAT_HISTORY_EVENT,
} from "../lib/chat-history";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  citation?: string | null;
  citations?: string[];
  negotiationScript?: string | null;
  timestamp: string;
  attachmentName?: string | null;
  attachmentType?: "image" | "document" | null;
  imagePreviewUrl?: string | null;
}

interface PendingAttachment {
  filename: string;
  fileType: "image" | "document";
  mimeType: string;
  fileSizeBytes: number;
  imageBase64: string | null;
  extractedText: string | null;
  previewUrl: string | null;
}

export const FloatingAiWidget: React.FC = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const planTier = user?.plan_tier || (user?.role === "admin" ? "pro" : "free");
  const canAttachFiles = user ? (user.can_attach_chat_files ?? planTier !== "free") : false;

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Attachment & Menu state
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);

  // Session state (synced with localStorage chat-history.ts + backend)
  const [localSessionId, setLocalSessionId] = useState<string>("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [localSessions, setLocalSessions] = useState<ChatSession[]>([]);
  const [sessions, setSessions] = useState<api.AiChatSessionSummary[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Close plus menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load or initialize current localStorage session & listen for external open events
  useEffect(() => {
    const current = getOrCreateCurrentSession(t("ai.initial_msg"));
    setLocalSessionId(current.id);
    setMessages(
      current.messages.length > 0
        ? current.messages.map((m) => ({
            ...m,
            citations: m.citation ? [m.citation] : [],
          }))
        : [
            {
              id: "1",
              sender: "ai",
              text: t("ai.initial_msg"),
              timestamp: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ],
    );
    setLocalSessions(getChatSessions());
  }, []);

  // Listen to custom events from /profile ("weeb_open_chat_session") and Navbar ("weeblegit:open-ai-chat")
  useEffect(() => {
    const handleUpdate = () => {
      setLocalSessions(getChatSessions());
    };

    const handleOpenSession = (e: any) => {
      const targetId = e.detail?.sessionId;
      if (targetId) {
        const list = getChatSessions();
        const found = list.find((s) => s.id === targetId);
        if (found) {
          setActiveSessionId(targetId);
          setLocalSessionId(targetId);
          setMessages(
            found.messages.map((m) => ({
              ...m,
              citations: m.citation ? [m.citation] : [],
            })),
          );
          setIsOpen(true);
          setShowHistoryDrawer(false);
          return;
        }
      }
      setIsOpen(true);
    };

    const handleOpenWidget = () => {
      setIsOpen(true);
    };

    window.addEventListener(CHAT_HISTORY_EVENT, handleUpdate);
    window.addEventListener("weeb_open_chat_session" as any, handleOpenSession);
    window.addEventListener("weeblegit:open-ai-chat", handleOpenWidget);
    return () => {
      window.removeEventListener(CHAT_HISTORY_EVENT, handleUpdate);
      window.removeEventListener("weeb_open_chat_session" as any, handleOpenSession);
      window.removeEventListener("weeblegit:open-ai-chat", handleOpenWidget);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages]);

  const loadSessions = async () => {
    setLocalSessions(getChatSessions());
    if (!user) return;
    setLoadingSessions(true);
    try {
      const list = await api.listChatSessions();
      setSessions(list || []);
    } catch {
      // ignore if unauthorized
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSelectLocalSession = (targetSession: ChatSession) => {
    setActiveSessionId(targetSession.id);
    setLocalSessionId(targetSession.id);
    setMessages(
      targetSession.messages.map((m) => ({
        ...m,
        citations: m.citation ? [m.citation] : [],
      })),
    );
    setShowHistoryDrawer(false);
  };

  const handleDeleteLocalSession = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    deleteSession(targetId);
    const updated = getChatSessions();
    setLocalSessions(updated);
    if (localSessionId === targetId) {
      if (updated.length > 0) {
        handleSelectLocalSession(updated[0]);
      } else {
        handleNewChat();
      }
    }
  };

  const handleNewChat = () => {
    const newSession = createNewSession(t("ai.initial_msg"));
    setLocalSessionId(newSession.id);
    setCurrentSessionId(null);
    setPendingAttachment(null);
    setAttachmentError(null);
    setShowHistoryDrawer(false);
    setMessages(
      newSession.messages.map((m) => ({
        ...m,
        citations: m.citation ? [m.citation] : [],
      })),
    );
    setLocalSessions(getChatSessions());
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPlusMenuOpen(false);
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setAttachmentError(
        lang === "EN"
          ? "File too large (Max 10MB)."
          : "Tệp vượt quá giới hạn 10MB.",
      );
      e.target.value = "";
      return;
    }

    setAttachmentError(null);
    setUploadingAttachment(true);

    try {
      const uploaded = await api.uploadChatAttachment(file);
      const previewUrl =
        uploaded.file_type === "image" && uploaded.image_base64
          ? `data:${uploaded.mime_type};base64,${uploaded.image_base64}`
          : null;

      setPendingAttachment({
        filename: uploaded.filename,
        fileType: uploaded.file_type,
        mimeType: uploaded.mime_type,
        fileSizeBytes: uploaded.file_size_bytes,
        imageBase64: uploaded.image_base64,
        extractedText: uploaded.extracted_text,
        previewUrl,
      });
    } catch (err: unknown) {
      setAttachmentError(
        err instanceof Error
          ? err.message
          : lang === "EN"
            ? "Could not process file."
            : "Không thể đọc tệp đính kèm.",
      );
    } finally {
      setUploadingAttachment(false);
      e.target.value = "";
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend ?? inputValue).trim();
    const attachment = pendingAttachment;

    if ((!rawText && !attachment) || isTyping || uploadingAttachment) return;

    const displayText =
      rawText ||
      (attachment?.fileType === "image"
        ? lang === "EN"
          ? `Please analyze the contract image "${attachment.filename}" and point out any legal risks.`
          : `Hãy phân tích ảnh hợp đồng "${attachment.filename}" và chỉ ra các điều khoản bất lợi hoặc rủi ro pháp lý.`
        : lang === "EN"
          ? `Please review the attached contract file "${attachment?.filename}" and highlight risky clauses.`
          : `Hãy kiểm tra tệp hợp đồng "${attachment?.filename}" và phân tích các điều khoản cần lưu ý.`);

    let activeLocalSid = localSessionId;
    if (!activeLocalSid) {
      const created = getOrCreateCurrentSession(t("ai.initial_msg"));
      activeLocalSid = created.id;
      setLocalSessionId(created.id);
    }

    const userMsg: Message = {
      id: "u_" + Date.now().toString(),
      sender: "user",
      text: displayText,
      attachmentName: attachment?.filename ?? null,
      attachmentType: attachment?.fileType ?? null,
      imagePreviewUrl: attachment?.previewUrl ?? null,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    addMessageToSession(activeLocalSid, {
      id: userMsg.id,
      sender: "user",
      text: userMsg.text,
      timestamp: userMsg.timestamp,
    });
    setLocalSessions(getChatSessions());
    setInputValue("");
    setPendingAttachment(null);
    setAttachmentError(null);
    setIsTyping(true);

    const historyForAi: api.AiChatMessage[] = messages.slice(-6).map((m) => ({
      role: m.sender === "ai" ? "model" : "user",
      content: m.text,
    }));

    try {
      const res = await api.aiChat(displayText, undefined, historyForAi, {
        sessionId: currentSessionId,
        attachmentName: attachment?.filename ?? null,
        attachmentText: attachment?.extractedText ?? null,
        imageBase64: attachment?.imageBase64 ?? null,
        imageMimeType: attachment?.mimeType ?? null,
      });

      if (res?.session_id) {
        setCurrentSessionId(res.session_id);
      }

      const aiReply =
        res?.reply ??
        res?.answer ??
        (lang === "EN"
          ? "This clause requires careful verification. Under prevailing statutes, you should request clear written stipulations before signing."
          : "Điều khoản này cần được kiểm tra kỹ. Theo quy định pháp luật hiện hành, bạn nên thỏa thuận bằng văn bản rõ ràng trước khi đặt bút ký.");
      const citationsList =
        res?.citations && res.citations.length > 0
          ? res.citations
          : res?.citation
            ? [res.citation]
            : [];

      const aiMsg: Message = {
        id: "ai_" + (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReply,
        citations: citationsList,
        citation: citationsList[0] ?? null,
        negotiationScript: res?.negotiation_script,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      addMessageToSession(activeLocalSid, {
        id: aiMsg.id,
        sender: "ai",
        text: aiMsg.text,
        citation: aiMsg.citation,
        negotiationScript: aiMsg.negotiationScript,
        timestamp: aiMsg.timestamp,
      });
      setLocalSessions(getChatSessions());
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.message.includes("giới hạn") ||
          err.message.includes("tốc độ") ||
          err.message.includes("rate") ||
          err.message.includes("Gói") ||
          err.message.includes("Nâng cấp"))
      ) {
        const rateLimitMsg: Message = {
          id: "ai_" + (Date.now() + 1).toString(),
          sender: "ai",
          text: `⚠️ ${err.message}`,
          timestamp: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, rateLimitMsg]);
        return;
      }

      let fallbackText =
        lang === "EN"
          ? "Article 17 of the Labor Code strictly prohibits withholding workers' money or property as a guarantee for contract performance."
          : "Khoản 2 Điều 17 Bộ luật Lao động nghiêm cấm giữ tiền hoặc tài sản của người lao động để bảo đảm thực hiện hợp đồng. Bạn hãy yêu cầu sửa đổi điều khoản này.";
      let fallbackCitation =
        lang === "EN"
          ? "Article 17, Labor Code 2019"
          : "Điều 17 Bộ luật Lao động 2019";

      if (
        displayText.toLowerCase().includes("cọc") ||
        displayText.toLowerCase().includes("trọ") ||
        displayText.toLowerCase().includes("deposit") ||
        displayText.toLowerCase().includes("rent")
      ) {
        fallbackText =
          lang === "EN"
            ? "Under Article 328 of the Civil Code 2015, the security deposit must be refunded upon expiration if the tenant has not breached the contract."
            : "Theo Điều 328 Bộ luật Dân sự 2015, tiền đặt cọc phải được hoàn trả khi hết hạn hợp đồng nếu bên thuê không vi phạm. Chủ nhà không được tự ý tịch thu nếu bạn đã báo trước 30 ngày.";
        fallbackCitation =
          lang === "EN"
            ? "Article 328, Civil Code 2015"
            : "Điều 328 Bộ luật Dân sự 2015";
      } else if (
        displayText.toLowerCase().includes("thử việc") ||
        displayText.toLowerCase().includes("lương") ||
        displayText.toLowerCase().includes("probation") ||
        displayText.toLowerCase().includes("wage")
      ) {
        fallbackText =
          lang === "EN"
            ? "Article 26 of the Labor Code 2019 specifies that wages during probation must be at least 85% of official salary."
            : "Điều 26 Bộ luật Lao động 2019 quy định tiền lương của người lao động trong thời gian thử việc ít nhất phải bằng 85% mức lương chính thức của công việc đó.";
        fallbackCitation =
          lang === "EN"
            ? "Article 26, Labor Code 2019"
            : "Điều 26 Bộ luật Lao động 2019";
      }

      const aiMsg: Message = {
        id: "ai_" + (Date.now() + 1).toString(),
        sender: "ai",
        text: fallbackText,
        citations: [fallbackCitation],
        citation: fallbackCitation,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      addMessageToSession(activeLocalSid, {
        id: aiMsg.id,
        sender: "ai",
        text: aiMsg.text,
        citation: aiMsg.citation,
        timestamp: aiMsg.timestamp,
      });
      setLocalSessions(getChatSessions());
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "EN" ? "en-US" : "vi-VN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const sampleQuestions = [t("ai.q1"), t("ai.q2"), t("ai.q3")];

  return (
    <>
      {/* Hidden File Inputs for '+' Multimodal Upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileSelected}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* ─── CHAT BUBBLE POPUP WINDOW ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-22 right-4 sm:right-6 z-[80] w-[92vw] sm:w-[420px] h-[575px] max-h-[84vh] bg-white dark:bg-[#0b1424] rounded-2xl border border-[#cbd5e1] dark:border-[#1a2d4b] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-slate-50 dark:bg-[#08101e] border-b border-[#e2e8f0] dark:border-[#1a2d4b] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#FAF5ED] dark:bg-[#13233f] border border-[#EAD7B8]/60 dark:border-[#EAD7B8]/40 flex items-center justify-center text-[#8a6834] dark:text-[#EAD7B8] shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-[#0f172a] dark:text-white truncate">
                      {t("ai.title")}
                    </h3>
                    {user && (
                      <span className="text-[11px] font-normal opacity-55 lowercase shrink-0">
                        -{user?.role === "admin" ? "pro/ad" : planTier}-
                      </span>
                    )}
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-[#8fa3bf] font-medium truncate">
                    {t("ai.subtitle")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleNewChat}
                  className="p-1.5 rounded-lg text-[#64748b] dark:text-[#8fa3bf] hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-[#13233f] transition-colors cursor-pointer"
                  title={lang === "EN" ? "New Chat" : "Cuộc trò chuyện mới"}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const next = !showHistoryDrawer;
                    setShowHistoryDrawer(next);
                    if (next) loadSessions();
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showHistoryDrawer
                      ? "bg-[#FAF5ED] dark:bg-[#162744] text-[#8a6834] dark:text-[#EAD7B8]"
                      : "text-[#64748b] dark:text-[#8fa3bf] hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-[#13233f]"
                  }`}
                  title={lang === "EN" ? "Saved Chat History" : "Lịch sử phiên hỏi đáp"}
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748b] dark:text-[#8fa3bf] hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-[#13233f] transition-colors cursor-pointer"
                  title={lang === "EN" ? "Minimize" : "Thu nhỏ"}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748b] dark:text-[#8fa3bf] hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-[#13233f] transition-colors cursor-pointer"
                  title={lang === "EN" ? "Close" : "Đóng"}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Saved Sessions Drawer (when toggled) */}
            {showHistoryDrawer ? (
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50/90 dark:bg-[#070e1b] space-y-2.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-wider">
                    {lang === "EN" ? "Saved Conversations" : "Lịch sử cuộc trò chuyện"}
                  </span>
                  <button
                    onClick={() => setShowHistoryDrawer(false)}
                    className="text-xs font-semibold text-[#8a6834] dark:text-[#EAD7B8] hover:underline cursor-pointer"
                  >
                    {lang === "EN" ? "Back to chat" : "Quay lại chat"}
                  </button>
                </div>

                {loadingSessions && localSessions.length === 0 ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-xs text-[#64748b]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === "EN" ? "Loading history..." : "Đang tải lịch sử..."}</span>
                  </div>
                ) : localSessions.length === 0 ? (
                  <div className="p-6 rounded-xl bg-white dark:bg-[#101e35] border border-[#e2e8f0] dark:border-[#1d3356] text-center text-xs text-[#64748b] dark:text-[#8fa3bf]">
                    {lang === "EN"
                      ? "No saved conversations yet."
                      : "Chưa có phiên trò chuyện nào được lưu."}
                  </div>
                ) : (
                  localSessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectLocalSession(s)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        localSessionId === s.id
                          ? "bg-[#FAF5ED] dark:bg-[#162744] border-[#EAD7B8]"
                          : "bg-white dark:bg-[#101e35] border-[#e2e8f0] dark:border-[#1d3356] hover:border-[#EAD7B8]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0f172a] dark:text-white truncate">
                          {s.title || (lang === "EN" ? "Conversation" : "Cuộc trò chuyện")}
                        </p>
                        <p className="text-[10px] text-[#64748b] dark:text-[#8fa3bf]">
                          {new Date(s.updatedAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          • {s.messages.length} {lang === "EN" ? "messages" : "tin nhắn"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteLocalSession(e, s.id)}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
                        title={lang === "EN" ? "Delete conversation" : "Xóa phiên chat"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Messages Body */
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 dark:bg-[#070e1b]/60">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm space-y-2 ${
                        msg.sender === "user"
                          ? "bg-[#EAD7B8] text-[#10253f] font-semibold rounded-br-none"
                          : "bg-white dark:bg-[#101e35] text-[#0f172a] dark:text-[#e2e8f0] border border-[#cbd5e1] dark:border-[#1d3356] font-medium rounded-bl-none"
                      }`}
                    >
                      {/* Attachment inside User Bubble */}
                      {msg.imagePreviewUrl && (
                        <div className="rounded-xl overflow-hidden border border-[#10253f]/15 bg-black/5">
                          <img
                            src={msg.imagePreviewUrl}
                            alt={msg.attachmentName || "Contract image"}
                            className="max-h-36 w-auto object-contain rounded-lg"
                          />
                        </div>
                      )}
                      {msg.attachmentName && !msg.imagePreviewUrl && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-[#0c182c] text-[#10253f] dark:text-[#EAD7B8] text-[11px] font-bold border border-[#10253f]/15">
                          <FileText className="w-3.5 h-3.5 shrink-0 text-[#8a6834]" />
                          <span className="truncate">{msg.attachmentName}</span>
                        </div>
                      )}

                      <p className="whitespace-pre-line">{msg.text}</p>

                      {msg.negotiationScript && (
                        <div className="mt-2 pt-2 border-t border-[#e2e8f0] dark:border-[#22395d]">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#159f7b] mb-1">
                            <span>
                              💬 {lang === "EN" ? "Negotiation Script:" : "Gợi ý câu trao đổi:"}
                            </span>
                            <button
                              onClick={() => handleCopy(msg.id, msg.negotiationScript ?? "")}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#eafbf7] hover:bg-[#d0f5ec] text-[#159f7b] border border-[#b7f6e5] transition-colors cursor-pointer"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-2.5 h-2.5" />
                                  <span>{lang === "EN" ? "Copied" : "Đã chép"}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5" />
                                  <span>{lang === "EN" ? "Copy" : "Sao chép"}</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] italic text-[#26435e] dark:text-[#cad8ed] bg-slate-50 dark:bg-[#0c182c] p-2 rounded-lg border border-[#e2e8f0] dark:border-[#1d3356]">
                            &quot;{msg.negotiationScript}&quot;
                          </p>
                        </div>
                      )}

                      {(msg.citations && msg.citations.length > 0) ? (
                        <div className="mt-2 pt-1.5 border-t border-[#e2e8f0] dark:border-[#22395d] flex flex-wrap gap-1.5">
                          {msg.citations.map((cit, cIdx) => (
                            <a
                              key={cIdx}
                              href={`https://thuvienphapluat.vn/page/tim-van-ban.aspx?keyword=${encodeURIComponent(cit)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-[#8a6834] dark:text-[#EAD7B8] hover:underline flex items-center gap-1"
                            >
                              <span>⚖️ {cit} ↗</span>
                            </a>
                          ))}
                        </div>
                      ) : msg.citation ? (
                        <div className="mt-2 pt-1.5 border-t border-[#e2e8f0] dark:border-[#22395d] text-[11px] font-bold text-[#8a6834] dark:text-[#EAD7B8] flex items-center gap-1">
                          <span>⚖️ {msg.citation}</span>
                        </div>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-[#64748b] dark:text-[#64748b] mt-1 px-1 font-medium">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8a6834] dark:text-[#EAD7B8] bg-white dark:bg-[#101e35] border border-[#cbd5e1] dark:border-[#1d3356] rounded-2xl rounded-bl-none px-3.5 py-2 w-fit">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("ai.analyzing")}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Quick Sample Questions */}
            {!showHistoryDrawer && (
              <div className="px-3 py-2 bg-slate-100/80 dark:bg-[#091222] border-t border-[#e2e8f0] dark:border-[#1a2d4b] overflow-x-auto scrollbar-none flex items-center gap-1.5">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="shrink-0 text-[11px] font-semibold text-[#334155] dark:text-[#94a9c9] hover:text-[#0f172a] dark:hover:text-white bg-white dark:bg-[#12223c] border border-[#cbd5e1] dark:border-[#1f3557] px-2.5 py-1 rounded-full hover:border-[#EAD7B8] transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Attachment Error or Preview Bar */}
            {attachmentError && (
              <div className="px-3 py-1.5 bg-red-50 dark:bg-red-950/50 border-t border-red-200 dark:border-red-800/60 text-[11px] text-red-600 dark:text-red-300 flex items-center justify-between">
                <span className="truncate">{attachmentError}</span>
                <button
                  onClick={() => setAttachmentError(null)}
                  className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {(uploadingAttachment || pendingAttachment) && (
              <div className="px-3 py-2 bg-[#FAF5ED] dark:bg-[#122038] border-t border-[#EAD7B8] dark:border-[#243b61] flex items-center justify-between gap-2">
                {uploadingAttachment ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8a6834] dark:text-[#EAD7B8]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      {lang === "EN"
                        ? "Reading attached file..."
                        : "Đang trích xuất tệp đính kèm..."}
                    </span>
                  </div>
                ) : pendingAttachment ? (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {pendingAttachment.previewUrl ? (
                        <img
                          src={pendingAttachment.previewUrl}
                          alt={pendingAttachment.filename}
                          className="w-9 h-9 rounded-lg object-cover border border-[#EAD7B8] shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#0b1424] border border-[#EAD7B8]/70 flex items-center justify-center text-[#8a6834] dark:text-[#EAD7B8] shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#10253f] dark:text-white truncate">
                          {pendingAttachment.filename}
                        </p>
                        <p className="text-[10px] text-[#8a6834] dark:text-[#EAD7B8] font-medium">
                          {pendingAttachment.fileType === "image"
                            ? lang === "EN"
                              ? "Contract photo ready for AI analysis"
                              : "Ảnh chụp hợp đồng sẵn sàng gửi AI"
                            : pendingAttachment.extractedText
                              ? lang === "EN"
                                ? `${pendingAttachment.extractedText.length} characters extracted`
                                : `${pendingAttachment.extractedText.length} ký tự đã trích xuất`
                              : lang === "EN"
                                ? "Contract document"
                                : "Tài liệu hợp đồng"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPendingAttachment(null)}
                      className="p-1 rounded-lg text-[#64748b] hover:text-red-600 hover:bg-white/60 dark:hover:bg-[#1a2f52] transition-colors cursor-pointer shrink-0"
                      title={lang === "EN" ? "Remove attachment" : "Xóa tệp đính kèm"}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : null}
              </div>
            )}

            {/* Input Bar with '+' Multimodal Button */}
            <div className="p-3 bg-white dark:bg-[#08101e] border-t border-[#e2e8f0] dark:border-[#1a2d4b]">
              <div className="relative flex items-center gap-1.5 bg-[#f1f5f9] dark:bg-[#0f1d35] rounded-xl px-2 py-1.5 border border-[#cbd5e1] dark:border-[#1e3458] focus-within:border-[#EAD7B8]">
                {/* '+' Attachment Button & Popover */}
                <div className="relative" ref={plusMenuRef}>
                  <button
                    type="button"
                    onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                    disabled={isTyping || uploadingAttachment}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      plusMenuOpen
                        ? "bg-[#10253f] text-[#EAD7B8] rotate-45"
                        : "bg-white dark:bg-[#162744] text-[#10253f] dark:text-[#EAD7B8] border border-[#cbd5e1] dark:border-[#274068] hover:border-[#8a6834]"
                    }`}
                    title={
                      lang === "EN"
                        ? "Attach contract file or photo (+)"
                        : "Đính kèm tệp hoặc ảnh chụp hợp đồng (+)"
                    }
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <AnimatePresence>
                    {plusMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-10 left-0 w-64 bg-white dark:bg-[#0d1829] rounded-xl border border-[#d8e3ef] dark:border-[#243b61] shadow-xl p-2 z-50 space-y-1.5"
                      >
                        {!canAttachFiles ? (
                          <div className="p-2.5 rounded-lg bg-[#FAF5ED] dark:bg-[#162744] border border-[#EAD7B8] dark:border-[#2c4670] space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8]">
                              <Lock className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {lang === "EN"
                                  ? "Locked on -free- plan"
                                  : "Đang khóa ở gói -free-"}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#49627d] dark:text-[#94a9c9] leading-relaxed">
                              {lang === "EN"
                                ? "Upgrade to Medium or Pro to attach contract photos & PDF/DOCX files directly in AI chat."
                                : "Nâng cấp gói Medium hoặc Pro để đính kèm ảnh chụp & file hợp đồng trực tiếp vào khung chat AI."}
                            </p>
                            <Link
                              href="/upgrade"
                              onClick={() => setPlusMenuOpen(false)}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#10253f] dark:bg-[#EAD7B8] text-white dark:text-[#0b1424] text-[11px] font-bold hover:opacity-90 transition-all"
                            >
                              <Crown className="w-3 h-3" />
                              <span>
                                {lang === "EN" ? "Upgrade Plan" : "Nâng cấp gói ngay"}
                              </span>
                            </Link>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => imageInputRef.current?.click()}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF5ED] dark:hover:bg-[#162744] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-lg bg-[#FAF5ED] dark:bg-[#162744] border border-[#EAD7B8]/70 flex items-center justify-center text-[#8a6834] dark:text-[#EAD7B8] shrink-0">
                                <ImageIcon className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#0f172a] dark:text-white">
                                  {lang === "EN" ? "Upload Photo" : "Gửi ảnh hợp đồng"}
                                </p>
                                <p className="text-[10px] text-[#64748b] dark:text-[#8fa3bf]">
                                  {lang === "EN" ? "PNG, JPG, WEBP (Max 10MB)" : "PNG, JPG, WEBP (Tối đa 10MB)"}
                                </p>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => docInputRef.current?.click()}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF5ED] dark:hover:bg-[#162744] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-lg bg-[#eff6ff] dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#0f172a] dark:text-white">
                                  {lang === "EN" ? "Upload Document" : "Gửi tệp hợp đồng"}
                                </p>
                                <p className="text-[10px] text-[#64748b] dark:text-[#8fa3bf]">
                                  {lang === "EN" ? "PDF, DOCX, TXT (Auto-read)" : "PDF, DOCX, TXT (Tự động đọc)"}
                                </p>
                              </div>
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    pendingAttachment
                      ? lang === "EN"
                        ? "Add a question about this file or press Send..."
                        : "Nhập câu hỏi kèm tệp hoặc bấm Gửi ngay..."
                      : t("ai.placeholder")
                  }
                  className="flex-1 bg-transparent border-0 text-xs sm:text-[13px] text-[#0f172a] dark:text-white placeholder-[#64748b] dark:placeholder-[#64748b] focus:outline-none focus:ring-0 font-medium min-w-0"
                />

                {/* Voice Mic button */}
                <button
                  onClick={toggleVoiceRecording}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    isRecording
                      ? "text-red-500 bg-red-100 dark:bg-red-950/40 animate-pulse"
                      : "text-[#475569] dark:text-[#8fa3bf] hover:text-[#0f172a] dark:hover:text-white"
                  }`}
                  title={
                    isRecording
                      ? lang === "EN" ? "Recording..." : "Đang ghi âm..."
                      : lang === "EN" ? "Speak to ask" : "Nói để hỏi"
                  }
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {/* Send button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={
                    (!inputValue.trim() && !pendingAttachment) ||
                    isTyping ||
                    uploadingAttachment
                  }
                  className="p-1.5 rounded-lg bg-[#EAD7B8] text-[#10253f] hover:bg-[#dfc59f] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                  title={lang === "EN" ? "Send message" : "Gửi câu hỏi"}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FLOATING TOGGLE BUBBLE (BOTTOM RIGHT — KHÔNG PHÁT QUANG) ─── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-110 active:scale-95 shadow-xl ${
            isOpen
              ? "bg-[#10253f] dark:bg-[#EAD7B8] text-white dark:text-[#10253f] border-2 border-[#EAD7B8]"
              : "bg-[#FAF5ED] dark:bg-[#101f38] border-2 border-[#EAD7B8] text-[#10253f] dark:text-[#EAD7B8]"
          }`}
          title={t("ai.title")}
          aria-label={t("ai.title")}
        >
          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <Bot className="w-6 h-6 stroke-[2.2] group-hover:scale-110 transition-transform" />
          )}

          {/* Green online pulse status dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-[#091222]"></span>
            </span>
          )}
        </button>
      </div>
    </>
  );
};
