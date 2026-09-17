import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  MessageSquare,
  Mic,
  Camera,
  Send,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import * as api from "../lib/api";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  tag?: string;
  citation?: string | null;
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

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

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputValue;
    if (!q.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const result = await api.aiChat(q);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        tag: "GỢI Ý CỦA AI",
        text: result.answer,
        citation: result.citation,
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
                      <div className="flex justify-end">
                        <div className="bg-[#FAF5ED] text-[#10253f] text-sm font-medium px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] border border-[#EAD7B8]/70">
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
                        <div className={`text-[#10253f] text-sm p-4 rounded-2xl rounded-tl-sm border leading-relaxed max-w-[92%] ${m.error ? "bg-[#fff1f0] border-[#ffd1cc]" : "bg-[#f2f7fc] border-[#d8e3ef]"}`}>
                          <p>{m.text}</p>
                          {m.citation && (
                            <div className="mt-2.5 pt-2 border-t border-[#d8e3ef]/60 text-xs font-medium text-[#49627d] flex items-center gap-1">
                              <span>Tham chiếu:</span>
                              <span className="font-semibold text-[#8a6834]">
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
                  <div className="flex items-center gap-1.5 text-xs text-[#8297ac] p-2 bg-[#f8fafd] rounded-lg w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a6834] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a6834] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a6834] animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1">
                      AI đang đối chiếu điều khoản...
                    </span>
                  </div>
                )}
              </div>

              {/* Preset quick questions */}
              <div className="px-4 py-2 bg-[#f8fafd] border-t border-[#e6edf4] flex gap-2 overflow-x-auto text-xs no-scrollbar">
                <button
                  onClick={() =>
                    handleSend("Tiền cọc phòng trọ có được lấy lại không?")
                  }
                  disabled={isTyping}
                  className="whitespace-nowrap bg-white border border-[#d8e3ef] hover:border-[#EAD7B8] text-[#49627d] hover:text-[#8a6834] px-2.5 py-1 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  💡 Tiền cọc phòng trọ?
                </button>
                <button
                  onClick={() =>
                    handleSend("Lương thử việc 70% có đúng luật không?")
                  }
                  disabled={isTyping}
                  className="whitespace-nowrap bg-white border border-[#d8e3ef] hover:border-[#EAD7B8] text-[#49627d] hover:text-[#8a6834] px-2.5 py-1 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  ⚖️ Lương thử việc 70%?
                </button>
                <button
                  onClick={() =>
                    handleSend("Chủ nhà có được giữ CCCD của tôi không?")
                  }
                  disabled={isTyping}
                  className="whitespace-nowrap bg-white border border-[#d8e3ef] hover:border-[#EAD7B8] text-[#49627d] hover:text-[#8a6834] px-2.5 py-1 rounded-full transition-colors cursor-pointer disabled:opacity-50"
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
                className="p-3.5 border-t border-[#e6edf4] bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Hỏi về một điều khoản…"
                  disabled={isTyping}
                  className="flex-1 text-sm bg-[#f2f7fc] border border-[#d8e3ef] rounded-xl px-3.5 py-2.5 text-[#10253f] placeholder-[#8297ac] focus:outline-none focus:border-[#EAD7B8] focus:bg-white transition-all disabled:opacity-60"
                />

                <button
                  type="button"
                  title="Ghi âm câu hỏi"
                  disabled={isTyping}
                  onClick={() =>
                    handleSend(
                      "Tóm tắt những bẫy pháp lý trong hợp đồng này giúp em.",
                    )
                  }
                  className="p-2.5 text-[#49627d] hover:text-[#8a6834] hover:bg-[#FAF6EF] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2.5 bg-[#EAD7B8] disabled:bg-[#d8e3ef] text-[#10253f] rounded-xl hover:bg-[#dfc59f] transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
