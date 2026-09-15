import React, { useState } from "react";
import {
  Bot,
  MessageSquare,
  Mic,
  Camera,
  Send,
  Sparkles,
  User,
  HelpCircle,
  Check,
  ArrowRight,
  CornerDownLeft,
} from "lucide-react";
import { SAMPLE_AI_QUESTIONS } from "../data/legalReferences";
import { motion } from "motion/react";

export const AiAssistantSection: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "user",
      text: "Điều khoản “chi phí đào tạo” này có nghĩa là gì?",
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

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputValue;
    if (!q.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      // Find matching sample answer or generate standard student response
      const matched = SAMPLE_AI_QUESTIONS.find(
        (sq) =>
          sq.question.toLowerCase().includes(q.toLowerCase().slice(0, 10)) ||
          (q.toLowerCase().includes("cọc") && sq.question.includes("cọc")) ||
          (q.toLowerCase().includes("thử việc") &&
            sq.question.includes("lương")),
      );

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        tag: "GỢI Ý CỦA AI",
        text: matched
          ? matched.answer
          : `Đối với điều khoản này: Bạn nên yêu cầu bên đối tác làm rõ văn bản về nghĩa vụ, các mốc thời gian hoàn thành và chế tài phạt nếu có phát sinh tranh chấp. Tránh các thỏa thuận miệng hoặc từ ngữ chung chung như "tùy quyết định công ty".`,
        citation: matched?.citation || "Bộ luật Dân sự & Lao động 2019",
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
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
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-semibold text-[#10253f]">
                  Hỏi trực tiếp từng điều khoản bằng tiếng Việt.
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#eafbf7] flex items-center justify-center text-[#159f7b] shrink-0">
                  <Mic className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-semibold text-[#10253f]">
                  Ghi âm câu hỏi khi bạn đang di chuyển.
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-[#d8e3ef] shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#f3eeff] flex items-center justify-center text-[#7652cc] shrink-0">
                  <Camera className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-semibold text-[#10253f]">
                  Chụp lại trang hợp đồng và nhận hướng dẫn.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive AI Chat Box (exact Framer design) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-[#d8e3ef] shadow-xl shadow-[#113d64]/6 overflow-hidden flex flex-col h-[480px]">
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-[#e6edf4] bg-[#f8fafd] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f] shadow-sm shadow-[#EAD7B8]/40">
                    <Bot className="w-4.5 h-4.5" />
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
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
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
                          <div className="text-[11px] font-bold text-[#8a6834] uppercase tracking-wider pl-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>{m.tag}</span>
                          </div>
                        )}
                        <div className="bg-[#f2f7fc] text-[#10253f] text-sm p-4 rounded-2xl rounded-tl-sm border border-[#d8e3ef] leading-relaxed max-w-[92%]">
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
                  className="whitespace-nowrap bg-white border border-[#d8e3ef] hover:border-[#EAD7B8] text-[#49627d] hover:text-[#8a6834] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  💡 Tiền cọc phòng trọ?
                </button>
                <button
                  onClick={() =>
                    handleSend("Lương thử việc 70% có đúng luật không?")
                  }
                  className="whitespace-nowrap bg-white border border-[#d8e3ef] hover:border-[#EAD7B8] text-[#49627d] hover:text-[#8a6834] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  ⚖️ Lương thử việc 70%?
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
                  className="flex-1 text-sm bg-[#f2f7fc] border border-[#d8e3ef] rounded-xl px-3.5 py-2.5 text-[#10253f] placeholder-[#8297ac] focus:outline-none focus:border-[#EAD7B8] focus:bg-white transition-all"
                />

                <button
                  type="button"
                  title="Ghi âm câu hỏi"
                  onClick={() =>
                    handleSend(
                      "Tóm tắt những bẫy pháp lý trong hợp đồng này giúp em.",
                    )
                  }
                  className="p-2.5 text-[#49627d] hover:text-[#8a6834] hover:bg-[#FAF6EF] rounded-xl transition-colors cursor-pointer"
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>

                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="p-2.5 bg-[#EAD7B8] disabled:bg-[#d8e3ef] text-[#10253f] rounded-xl hover:bg-[#dfc59f] transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
