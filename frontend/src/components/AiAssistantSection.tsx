import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  MessageSquare,
  Mic,
  MicOff,
  Camera,
  Send,
  Sparkles,
  ArrowRight,
  Paperclip,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import * as api from "../lib/api";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  tag?: string;
  citation?: string | null;
  negotiationScript?: string | null;
  fileName?: string;
  error?: boolean;
}

export const AiAssistantSection: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "user",
      text: "Điều khoản \"chi phí đào tạo\" này có nghĩa là gì?",
    },
    {
      id: "2",
      sender: "ai",
      tag: "GỢI Ý CỦA AI",
      text: "Đây thường là khoản hoàn trả nếu bạn nghỉ sớm. Hãy hỏi rõ: chi phí nào được tính, thời hạn cam kết và cách tính hoàn trả.",
      citation: "Điều 62 Bộ luật Lao động 2019",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    name: string;
    contentPreview?: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Tệp quá lớn. Vui lòng tải file dưới 10MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const isTextReadable =
      file.name.endsWith(".txt") ||
      file.name.endsWith(".json") ||
      file.name.endsWith(".md") ||
      file.type.startsWith("text/");

    if (isTextReadable) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || "";
        setSelectedFile({
          file,
          name: file.name,
          contentPreview: text.slice(0, 3000),
        });
      };
      reader.readAsText(file);
    } else {
      setSelectedFile({
        file,
        name: file.name,
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleRecording = () => {
    setSpeechError(null);

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        "Trình duyệt của bạn không hỗ trợ nhận diện giọng nói Web Speech API (Hãy dùng Chrome hoặc Edge).",
      );
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      const initialInput = inputValue.trim();

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript;
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        const speechText = (finalTranscript + " " + interimTranscript).trim();
        if (speechText) {
          setInputValue(
            initialInput ? `${initialInput} ${speechText}` : speechText,
          );
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError("Vui lòng cấp quyền truy cập Microphone trong trình duyệt.");
        } else if (event.error !== "no-speech") {
          setSpeechError(`Lỗi giọng nói: ${event.error}`);
        }
        setIsRecording(false);
        setTimeout(() => setSpeechError(null), 4000);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsRecording(false);
      setSpeechError("Không thể kích hoạt microphone.");
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputValue;
    const currentFile = selectedFile;

    if (!q.trim() && !currentFile) return;
    if (isTyping) return;

    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsRecording(false);
    }

    const promptText = q.trim()
      ? q.trim()
      : `Hãy đọc và phân tích các rủi ro, bẫy điều khoản trong tệp hợp đồng "${currentFile?.name}" này giúp em.`;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: promptText,
      fileName: currentFile?.name,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setSelectedFile(null);
    setIsTyping(true);

    const historyForAi: api.AiChatMessage[] = messages.slice(-6).map((m) => ({
      role: m.sender === "ai" ? "assistant" : "user",
      content: m.text,
    }));

    try {
      const contractContext = currentFile?.contentPreview
        ? `Tên file: ${currentFile.name}\nNội dung văn bản trích xuất:\n${currentFile.contentPreview}`
        : currentFile
        ? `Tệp đính kèm: ${currentFile.name}`
        : undefined;

      const result = await api.aiChat(promptText, contractContext, historyForAi);
      const replyContent = result.reply || result.answer || "Không có phản hồi từ trợ lý.";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        tag: "GỢI Ý CỦA AI",
        text: replyContent,
        citation: result.citation || (result.citations && result.citations[0]),
        negotiationScript: result.negotiation_script,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        tag: "THÔNG BÁO",
        text: "Hiện tại không thể kết nối AI. Vui lòng thử lại sau.",
        error: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section id="ai-section" className="py-16 sm:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Descriptions and features */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#8a6834] mb-2">
                TRỢ LÝ BÊN CẠNH BẠN
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#10253f] tracking-tight mb-4">
                Không hiểu điều khoản? <br />
                Hỏi theo cách của bạn.
              </h2>
              <p className="text-base text-[#49627d] leading-relaxed">
                Chat, nói hoặc gửi ảnh chụp. WeebLegit sẽ giúp bạn biến phần
                ngôn ngữ pháp lý phức tạp thành những câu hỏi cụ thể để trao đổi
                với bên còn lại.
              </p>
            </div>

            {/* 3 bullet points */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#FAF5ED] flex items-center justify-center text-[#8a6834] shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-[#10253f]">
                  Hỏi trực tiếp từng điều khoản bằng tiếng Việt.
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#eafbf7] flex items-center justify-center text-[#159f7b] shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-[#10253f]">
                  Ghi âm câu hỏi khi bạn đang di chuyển.
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#f3eeff] flex items-center justify-center text-[#7652cc] shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-[#10253f]">
                  Chụp lại trang hợp đồng và nhận hướng dẫn.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive AI Chat Box */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-[#d8e3ef] shadow-xl shadow-[#113d64]/6 overflow-hidden flex flex-col h-[480px]">
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-[#e6edf4] bg-[#f8fafd] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f] shadow-sm shadow-[#EAD7B8]/40">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#10253f]">
                      WeebLegit AI
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[#159f7b] bg-[#eafbf7] border border-[#b7f6e5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#159f7b] animate-pulse" />
                  <span>Sẵn sàng đọc cùng bạn</span>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div ref={chatContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className="space-y-2">
                    {m.sender === "user" ? (
                      <div className="flex flex-col items-end gap-1">
                        {m.fileName && (
                          <div className="flex items-center gap-1 text-[11px] text-[#8a6834] font-medium bg-[#FAF5ED] px-2.5 py-1 rounded-lg border border-[#EAD7B8]/60">
                            <FileText className="w-3 h-3" />
                            <span>{m.fileName}</span>
                          </div>
                        )}
                        <div className="user-message-bubble bg-[#FAF5ED] text-[#10253f] text-sm font-medium px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] border border-[#EAD7B8]/70 shadow-sm">
                          {m.text}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1">
                        {m.tag && (
                          <div className={`text-[11px] font-bold uppercase tracking-wider pl-1 flex items-center gap-1 ${m.error ? "text-[#e4534b]" : "text-[#8a6834]"}`}>
                            <Sparkles className="w-3 h-3" />
                            <span>{m.tag}</span>
                          </div>
                        )}
                        <div className={`ai-message-bubble text-[#10253f] text-sm p-4 rounded-2xl rounded-tl-sm border leading-relaxed max-w-[92%] shadow-sm ${m.error ? "bg-[#fff1f0] border-[#ffd1cc]" : "bg-[#f2f7fc] border-[#d8e3ef]"}`}>
                          <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                          {m.negotiationScript && (
                            <div className="mt-3 p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-[#8a6834]/30 text-xs">
                              <span className="font-bold text-[#8a6834] block mb-1">
                                💬 Mẫu tin nhắn đàm phán gợi ý:
                              </span>
                              <span className="italic text-[#10253f] dark:text-[#f1f5f9]">
                                {m.negotiationScript}
                              </span>
                            </div>
                          )}
                          {m.citation && (
                            <div className="mt-2.5 pt-2 border-t border-[#d8e3ef]/60 dark:border-[#2a4369] text-xs font-medium text-[#49627d] dark:text-[#94a3b8] flex items-center gap-1">
                              <span>Tham chiếu:</span>
                              <span className="font-semibold text-[#8a6834] dark:text-[#e3bc83]">
                                {m.citation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8297ac] dark:text-[#94a3b8] p-2 bg-[#f8fafd] dark:bg-[#0d1625] rounded-lg w-fit border border-[#d8e3ef]/40 dark:border-[#1e2f47]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a6834] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a6834] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a6834] animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1">
                      AI đang phân tích điều khoản...
                    </span>
                  </div>
                )}
              </div>

              {/* Speech Error Banner */}
              {speechError && (
                <div className="px-4 py-1.5 bg-[#fff1f0] border-t border-[#ffd1cc] text-[#e4534b] text-xs flex items-center justify-between">
                  <span>{speechError}</span>
                  <button onClick={() => setSpeechError(null)} className="cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Uploaded File Chip in Chatbox */}
              {selectedFile && (
                <div className="px-4 py-2 bg-[#FAF5ED] dark:bg-[#1c1912] border-t border-[#EAD7B8]/70 dark:border-[#3d2f1a] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#8a6834] dark:text-[#e3bc83] font-medium truncate">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate max-w-[280px]">Đính kèm: {selectedFile.name}</span>
                    {selectedFile.contentPreview && (
                      <span className="text-[10px] bg-[#EAD7B8]/50 dark:bg-[#594424] px-1.5 py-0.5 rounded text-[#10253f] dark:text-[#fef08a]">
                        Đã đọc nội dung
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="p-1 text-[#8a6834] hover:text-[#e4534b] rounded-lg transition-colors cursor-pointer"
                    title="Gỡ tệp"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Preset quick questions */}
              <div className="px-4 py-2 bg-[#f8fafd] dark:bg-[#0d1625] border-t border-[#e6edf4] dark:border-[#1e2f47] flex gap-2 overflow-x-auto text-xs no-scrollbar">
                <button
                  onClick={() =>
                    handleSend("Tiền cọc phòng trọ có được lấy lại không?")
                  }
                  disabled={isTyping}
                  className="whitespace-nowrap bg-white dark:bg-[#132037] border border-[#d8e3ef] dark:border-[#243a5e] hover:border-[#EAD7B8] text-[#49627d] dark:text-[#94a3b8] hover:text-[#8a6834] px-2.5 py-1 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  💡 Tiền cọc phòng trọ?
                </button>
                <button
                  onClick={() =>
                    handleSend("Lương thử việc 70% có đúng luật không?")
                  }
                  disabled={isTyping}
                  className="whitespace-nowrap bg-white dark:bg-[#132037] border border-[#d8e3ef] dark:border-[#243a5e] hover:border-[#EAD7B8] text-[#49627d] dark:text-[#94a3b8] hover:text-[#8a6834] px-2.5 py-1 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  ⚖️ Lương thử việc 70%?
                </button>
                <button
                  onClick={() =>
                    handleSend("Chủ nhà có được giữ CCCD của tôi không?")
                  }
                  disabled={isTyping}
                  className="whitespace-nowrap bg-white dark:bg-[#132037] border border-[#d8e3ef] dark:border-[#243a5e] hover:border-[#EAD7B8] text-[#49627d] dark:text-[#94a3b8] hover:text-[#8a6834] px-2.5 py-1 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  🪪 Giữ CCCD có hợp pháp?
                </button>
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3.5 border-t border-[#e6edf4] dark:border-[#1e2f47] bg-white dark:bg-[#132037] flex items-center gap-2"
              >
                {/* Hidden File Input for Left Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.json,.md,image/*"
                  className="hidden"
                />

                {/* Left Button: Upload file */}
                <button
                  type="button"
                  title="Tải tệp hợp đồng/tài liệu lên để AI đọc"
                  disabled={isTyping}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 ${
                    selectedFile
                      ? "bg-[#EAD7B8] text-[#10253f]"
                      : "text-[#49627d] dark:text-[#94a3b8] hover:text-[#8a6834] hover:bg-[#FAF6EF] dark:hover:bg-[#182740]"
                  }`}
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isRecording
                      ? "Đang lắng nghe giọng nói của bạn..."
                      : selectedFile
                      ? `Đã chọn "${selectedFile.name}". Nhập câu hỏi hoặc ấn Gửi...`
                      : "Hỏi về một điều khoản hợp đồng…"
                  }
                  disabled={isTyping}
                  className={`flex-1 text-sm bg-[#f2f7fc] dark:bg-[#0f1828] border rounded-xl px-3.5 py-2.5 text-[#10253f] dark:text-[#f1f5f9] placeholder-[#8297ac] dark:placeholder-[#64748b] focus:outline-none focus:border-[#EAD7B8] transition-all disabled:opacity-60 ${
                    isRecording
                      ? "border-[#e4534b] animate-pulse ring-1 ring-[#e4534b]"
                      : "border-[#d8e3ef] dark:border-[#243a5e]"
                  }`}
                />

                {/* Voice Recording Button */}
                <button
                  type="button"
                  title={isRecording ? "Dừng ghi âm" : "Ghi âm / Nói để chat"}
                  disabled={isTyping}
                  onClick={toggleRecording}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 relative ${
                    isRecording
                      ? "bg-[#fff1f0] text-[#e4534b] ring-2 ring-[#e4534b]/50 animate-pulse"
                      : "text-[#49627d] dark:text-[#94a3b8] hover:text-[#8a6834] hover:bg-[#FAF6EF] dark:hover:bg-[#182740]"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4 text-[#e4534b]" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  {isRecording && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#e4534b] rounded-full animate-ping" />
                  )}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={(!inputValue.trim() && !selectedFile) || isTyping}
                  className="p-2.5 bg-[#EAD7B8] disabled:bg-[#d8e3ef] dark:disabled:bg-[#1e2f47] text-[#10253f] rounded-xl hover:bg-[#dfc59f] transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#8a6834]" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
