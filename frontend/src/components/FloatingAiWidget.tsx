import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Loader2,
  Minimize2,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as api from "../lib/api";
import { useLanguage } from "../lib/language-context";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  citation?: string | null;
  negotiationScript?: string | null;
  timestamp: string;
}

export const FloatingAiWidget: React.FC = () => {
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Initialize initial message with translated string
  useEffect(() => {
    setMessages([
      {
        id: "1",
        sender: "ai",
        text: t("ai.initial_msg"),
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }, [lang]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    const historyForAi: api.AiChatMessage[] = messages.slice(-6).map((m) => ({
      role: m.sender === "ai" ? "model" : "user",
      content: m.text,
    }));

    try {
      const res = await api.aiChat(text, undefined, historyForAi);
      const aiReply =
        res?.reply ??
        res?.answer ??
        (lang === "EN"
          ? "This clause requires careful verification. Under prevailing statutes, you should request clear written stipulations before signing."
          : "Điều khoản này cần được kiểm tra kỹ. Theo quy định pháp luật hiện hành, bạn nên thỏa thuận bằng văn bản rõ ràng trước khi đặt bút ký.");
      const citation =
        res?.citation ??
        res?.citations?.[0] ??
        (lang === "EN"
          ? "Labor Code 2019, Civil Code 2015 & Housing Law 2023"
          : "Bộ luật Lao động 2019, Bộ luật Dân sự 2015 & Luật Nhà ở 2023");

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReply,
        citation,
        negotiationScript: res?.negotiation_script,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      let fallbackText =
        lang === "EN"
          ? "Article 17 of the Labor Code strictly prohibits withholding workers' money or property as a guarantee for contract performance."
          : "Khoản 2 Điều 17 Bộ luật Lao động nghiêm cấm giữ tiền hoặc tài sản của người lao động để bảo đảm thực hiện hợp đồng. Bạn hãy yêu cầu sửa đổi điều khoản này.";
      let fallbackCitation =
        lang === "EN"
          ? "Article 17, Labor Code 2019"
          : "Điều 17 Bộ luật Lao động 2019";

      if (
        text.toLowerCase().includes("cọc") ||
        text.toLowerCase().includes("trọ") ||
        text.toLowerCase().includes("deposit") ||
        text.toLowerCase().includes("rent")
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
        text.toLowerCase().includes("thử việc") ||
        text.toLowerCase().includes("lương") ||
        text.toLowerCase().includes("probation") ||
        text.toLowerCase().includes("wage")
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
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: fallbackText,
        citation: fallbackCitation,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
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

  const sampleQuestions = [
    t("ai.q1"),
    t("ai.q2"),
    t("ai.q3"),
  ];

  return (
    <>
      {/* ─── CHAT BUBBLE POPUP WINDOW ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-22 right-4 sm:right-6 z-[80] w-[92vw] sm:w-[410px] h-[550px] max-h-[82vh] bg-white dark:bg-[#0b1424] rounded-2xl border border-[#cbd5e1] dark:border-[#1a2d4b] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-slate-50 dark:bg-[#08101e] border-b border-[#e2e8f0] dark:border-[#1a2d4b] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FAF5ED] dark:bg-[#13233f] border border-[#EAD7B8]/60 dark:border-[#EAD7B8]/40 flex items-center justify-center text-[#8a6834] dark:text-[#EAD7B8]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-[#0f172a] dark:text-white">
                      {t("ai.title")}
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-[#8fa3bf] font-medium">
                    {t("ai.subtitle")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748b] dark:text-[#8fa3bf] hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-[#13233f] transition-colors cursor-pointer"
                  title="Thu nhỏ"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748b] dark:text-[#8fa3bf] hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-[#13233f] transition-colors cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 dark:bg-[#070e1b]/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-[#EAD7B8] text-[#10253f] font-semibold rounded-br-none"
                        : "bg-white dark:bg-[#101e35] text-[#0f172a] dark:text-[#e2e8f0] border border-[#cbd5e1] dark:border-[#1d3356] font-medium rounded-bl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.negotiationScript && (
                      <div className="mt-2 pt-2 border-t border-[#e2e8f0] dark:border-[#22395d]">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#159f7b] mb-1">
                          <span>💬 Gợi ý câu trao đổi:</span>
                          <button
                            onClick={() => handleCopy(msg.id, msg.negotiationScript ?? "")}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#eafbf7] hover:bg-[#d0f5ec] text-[#159f7b] border border-[#b7f6e5] transition-colors cursor-pointer"
                          >
                            {copiedId === msg.id ? (
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
                        <p className="text-[11px] italic text-[#26435e] dark:text-[#cad8ed] bg-slate-50 dark:bg-[#0c182c] p-2 rounded-lg border border-[#e2e8f0] dark:border-[#1d3356]">
                          &quot;{msg.negotiationScript}&quot;
                        </p>
                      </div>
                    )}
                    {msg.citation && (
                      <div className="mt-2 pt-1.5 border-t border-[#e2e8f0] dark:border-[#22395d] text-[11px] font-bold text-[#8a6834] dark:text-[#EAD7B8] flex items-center gap-1">
                        <span>⚖️ {msg.citation}</span>
                      </div>
                    )}
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

            {/* Quick Sample Questions */}
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

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-[#08101e] border-t border-[#e2e8f0] dark:border-[#1a2d4b]">
              <div className="flex items-center gap-1.5 bg-[#f1f5f9] dark:bg-[#0f1d35] rounded-xl px-2.5 py-1.5 border border-[#cbd5e1] dark:border-[#1e3458] focus-within:border-[#EAD7B8]">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("ai.placeholder")}
                  className="flex-1 bg-transparent border-0 text-xs sm:text-[13px] text-[#0f172a] dark:text-white placeholder-[#64748b] dark:placeholder-[#64748b] focus:outline-none focus:ring-0 font-medium"
                />

                {/* Voice Mic button */}
                <button
                  onClick={toggleVoiceRecording}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isRecording
                      ? "text-red-500 bg-red-100 dark:bg-red-950/40 animate-pulse"
                      : "text-[#475569] dark:text-[#8fa3bf] hover:text-[#0f172a] dark:hover:text-white"
                  }`}
                  title={isRecording ? "Đang ghi âm..." : "Nói để hỏi"}
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
                  disabled={!inputValue.trim() || isTyping}
                  className="p-1.5 rounded-lg bg-[#EAD7B8] text-[#10253f] hover:bg-[#dfc59f] disabled:opacity-50 transition-colors cursor-pointer"
                  title="Gửi câu hỏi"
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

          {/* Badge "N" at bottom right */}
          {!isOpen && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#0a1220] border border-[#cbd5e1] dark:border-[#2b446c] flex items-center justify-center text-[10px] font-black text-[#10253f] dark:text-white shadow">
              N
            </span>
          )}
        </button>
      </div>
    </>
  );
};
