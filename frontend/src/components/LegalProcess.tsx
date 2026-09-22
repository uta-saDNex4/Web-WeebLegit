import React from "react";
import {
  UploadCloud,
  Fingerprint,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../lib/language-context";

interface LegalProcessProps {
  onStartProcess: () => void;
}

export const LegalProcess: React.FC<LegalProcessProps> = ({ onStartProcess }) => {
  const { lang } = useLanguage();

  return (
    <section
      id="process-section"
      className="py-12 sm:py-16 bg-[#FAF6EF]/60 dark:bg-[#0A1322]/60 border-t border-[#E6DEC8] dark:border-[#1A2D49] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 text-left">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-[#15233C] border border-[#D6C5A2] dark:border-[#22395D] text-xs font-black text-[#8A6731] dark:text-[#EAD7B8] uppercase tracking-wider mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8A6731] dark:text-[#EAD7B8]" />
              <span>{lang === "EN" ? "SIMPLE 3 STEPS" : "CÁCH DÙNG ĐƠN GIẢN"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F1E36] dark:text-white tracking-tight mb-2.5">
              {lang === "EN"
                ? "3 Simple Steps to Check Any Contract"
                : "3 Bước Rất Dễ Để Kiểm Tra Hợp Đồng"}
            </h2>

            <p className="text-sm sm:text-base text-[#465A75] dark:text-[#9FB3CF] font-medium leading-relaxed">
              {lang === "EN"
                ? "No legal jargon needed. Anyone can verify terms and negotiate back with confidence."
                : "Không cần am hiểu luật phức tạp, ai cũng có thể tự bảo vệ quyền lợi của mình chỉ qua 3 bước:"}
            </p>
          </div>

          {/* HIGH-CONTRAST ACTION BUTTON */}
          <button
            onClick={onStartProcess}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0F223D] hover:bg-[#162E52] text-[#EAD7B8] border-2 border-[#EAD7B8] text-xs sm:text-sm font-black shadow-md shadow-[#0F223D]/20 transition-all hover:scale-103 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-[#EAD7B8]" />
            <span>{lang === "EN" ? "Try It Now Free" : "Thử Ngay Miễn Phí"}</span>
            <ArrowRight className="w-4 h-4 text-[#EAD7B8]" />
          </button>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              icon: UploadCloud,
              title: lang === "EN" ? "Upload Your Contract" : "Tải Hợp Đồng Lên",
              badge: lang === "EN" ? "Step 1" : "Bước 1",
              desc:
                lang === "EN"
                  ? "Select a PDF or Word document from your phone or computer."
                  : "Chọn file PDF hoặc Word (hợp đồng đi làm, thuê nhà, vay mượn...) từ máy của bạn.",
            },
            {
              num: "02",
              icon: Fingerprint,
              title: lang === "EN" ? "AI Trap & Error Detection" : "AI Tự Động Bắt Lỗi & Bẫy",
              badge: lang === "EN" ? "Step 2" : "Bước 2",
              desc:
                lang === "EN"
                  ? "AI scans each sentence, identifying unfair penalties, hidden fees, and unlawful terms."
                  : "AI đọc từng câu, tìm ngay những điều khoản ép buộc bạn, bẫy phạt vô lý hoặc sai quy định luật.",
            },
            {
              num: "03",
              icon: FileCheck2,
              title: lang === "EN" ? "Get Clear Advice & Negotiation Tips" : "Xem Lời Khuyên & Mẹo Đàm Phán",
              badge: lang === "EN" ? "Step 3" : "Bước 3",
              desc:
                lang === "EN"
                  ? "Understand what is lawful and learn polite scripts to negotiate amendments with the other party."
                  : "Biết rõ câu nào trái luật và xem gợi ý cách đàm phán lịch sự để yêu cầu bên kia sửa lại.",
            },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white dark:bg-[#0D1829] rounded-2xl border-2 border-[#E3D8C3] dark:border-[#1E3456] p-6 sm:p-7 shadow-xs hover:border-[#8A6731] dark:hover:border-[#EAD7B8] transition-all duration-200 text-left flex flex-col justify-between hover:-translate-y-0.5"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-4xl font-black text-[#EAD7B8] dark:text-[#EAD7B8]/40 select-none">
                      {step.num}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF5ED] dark:bg-[#162744] border border-[#E0D5BE] dark:border-[#274068] flex items-center justify-center text-[#8A6731] dark:text-[#EAD7B8]">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                  </div>

                  {/* Badge */}
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FAF5ED] dark:bg-[#15233C] text-[#8A6731] dark:text-[#EAD7B8] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#E8DEC7] dark:border-[#20375C]">
                    {step.badge}
                  </span>

                  {/* Title & Desc */}
                  <h3 className="text-lg font-black text-[#0F1E36] dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#465A75] dark:text-[#9FB3CF] font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#EFE8D8] dark:border-[#1A2D49] flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === "EN" ? "Easy & Safe" : "Đơn giản & Yên tâm"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
