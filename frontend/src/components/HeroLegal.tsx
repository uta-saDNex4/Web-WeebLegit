import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Scale,
  FileCheck,
  Fingerprint,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/language-context";

interface HeroLegalProps {
  onOpenChecker: () => void;
  onOpenPitfalls?: () => void;
}

export const HeroLegal: React.FC<HeroLegalProps> = ({
  onOpenChecker,
  onOpenPitfalls,
}) => {
  const { lang, t } = useLanguage();

  return (
    <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
      {/* Subtle Background Glows (Không chói, chuẩn màu #EAD7B8) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1560px] h-96 bg-gradient-to-b from-[#EAD7B8]/20 via-[#EAD7B8]/5 to-transparent pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading, Value Props & High-Contrast CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-5 text-left"
          >
            {/* Pill Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5ED] dark:bg-[#15233C] border border-[#D6C5A2] dark:border-[#22395D] shadow-2xs">
              <Scale className="w-3.5 h-3.5 text-[#8A6731] dark:text-[#EAD7B8]" />
              <span className="text-xs font-black text-[#8A6731] dark:text-[#EAD7B8] uppercase tracking-wider">
                {lang === "EN"
                  ? "Safe Contracts & Transactions For Everyone"
                  : "Bảo Vệ Quyền Lợi Trong Mọi Giao Kết Hợp Đồng"}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F1E36] dark:text-white tracking-tight leading-[1.2]">
              {lang === "EN" ? (
                <>
                  Sign with Peace of Mind. <br />
                  <span className="text-[#8A6731] dark:text-[#EAD7B8]">
                    Catch Hidden Traps Before Signing.
                  </span>
                </>
              ) : (
                <>
                  Ký Hợp Đồng Yên Tâm Hơn. <br />
                  <span className="text-[#8A6731] dark:text-[#EAD7B8]">
                    Không Lo Bị Gài Bẫy Bất Lợi.
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-[#334764] dark:text-[#9FB3CF] font-medium leading-relaxed max-w-2xl">
              {lang === "EN"
                ? "Upload your contract document across diverse civil, commercial, or service transactions. Get plain-language advice on unfair clauses and simple scripts to negotiate back (continuously expanding)."
                : "Hệ thống tự động đọc hiểu từng câu chữ trên đa dạng các loại giao dịch và hợp đồng, chỉ ra những điều khoản bất lợi, trái luật và gợi ý cách thương lượng lại (đang tiếp tục mở rộng)."}
            </p>

            {/* Key Trust Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E324F] dark:text-[#CAD8ED]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{lang === "EN" ? "Strict Data Privacy" : "Bảo mật dữ liệu nghiêm ngặt"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E324F] dark:text-[#CAD8ED]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{lang === "EN" ? "Vietnam Law Aligned" : "Đúng theo luật Việt Nam"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E324F] dark:text-[#CAD8ED]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{lang === "EN" ? "Friendly Counter Tips" : "Có sẵn mẹo thương lượng"}</span>
              </div>
            </div>

            {/* HIGH-CONTRAST ACTION BUTTONS */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/workspace"
                className="group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 text-sm sm:text-base font-black text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] active:bg-[#d4b78c] rounded-2xl border-2 border-[#10253f] dark:border-[#EAD7B8] shadow-lg shadow-[#EAD7B8]/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#10253f] group-hover:rotate-12 transition-transform" />
                <span>{lang === "EN" ? "Open Legal Studio (/workspace)" : "Vào Legal Studio Thẩm Định"}</span>
                <ArrowRight className="w-4 h-4 text-[#10253f] group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={onOpenChecker}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-[#0F1E36] dark:text-[#CAD8ED] bg-[#FAF5ED] dark:bg-[#15233C] hover:bg-[#EFE8D8] dark:hover:bg-[#1E3558] rounded-2xl border border-[#D6C5A2] dark:border-[#22395D] shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#8A6731] dark:text-[#EAD7B8]" />
                <span>{lang === "EN" ? "Quick Check (Modal)" : "Kiểm Tra Nhanh (Modal)"}</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Live Interactive Legal Contract Scanner Mockup (Cửa sổ nhỏ xem trước) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div
              onClick={onOpenChecker}
              className="relative group cursor-pointer bg-white dark:bg-[#0D1829] rounded-3xl border-2 border-[#E0D5BE] dark:border-[#1E3456] p-6 sm:p-7 shadow-xl shadow-[#0F1E36]/8 dark:shadow-2xl transition-all duration-300 hover:border-[#8A6731] dark:hover:border-[#EAD7B8] hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Document Header Bar */}
              <div className="flex items-center gap-3 border-b border-[#EFE8D8] dark:border-[#1C3252] pb-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FAF5ED] dark:bg-[#192B47] border border-[#D8C7A5] flex items-center justify-center text-[#8A6731] dark:text-[#EAD7B8] font-black shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold text-[#0F1E36] dark:text-white uppercase tracking-wider truncate">
                    {lang === "EN" ? "CONTRACT ANALYSIS PREVIEW" : "BẢN XEM TRƯỚC PHÂN TÍCH ĐIỀU KHOẢN"}
                  </h3>
                  <p className="text-[11px] text-[#65778F] dark:text-[#8FA3BF] truncate">
                    {lang === "EN" ? "Subtle trap detection • Statutory audit" : "Ví dụ minh họa • Bóc tách điều khoản bất lợi"}
                  </p>
                </div>
              </div>

              {/* Simulated Document Scanning Lines */}
              <div className="space-y-3">
                {/* Clause 1: Safe */}
                <div className="p-3 rounded-xl bg-[#F8FAF8] dark:bg-[#0F221D] border border-[#D5EED8] dark:border-[#164235] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#0F1E36] dark:text-white">
                      {lang === "EN" ? "Clause 2: Base Salary & Payment" : "Điều 2: Tiền lương & Kỳ hạn chi trả"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> {lang === "EN" ? "COMPLIANT" : "HỢP LÝ"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3A4E66] dark:text-[#9FB3CF] italic">
                    {lang === "EN"
                      ? '"Base salary: 11,500,000 VND/month (excl. 730,000 VND lunch stipend). Remuneration is disbursed on the 5th of each month via bank transfer."'
                      : '"Mức lương cơ bản: 11.500.000 VNĐ/tháng (chưa bao gồm phụ cấp ăn trưa 730.000 VNĐ). Tiền lương được chi trả vào ngày 05 hàng tháng qua tài khoản ngân hàng."'}
                  </p>
                </div>

                {/* Clause 2: TRAP DETECTED (Red Flag) */}
                <div className="p-3 rounded-xl bg-[#FFF6F5] dark:bg-[#251317] border border-[#FFD0CC] dark:border-[#4E1E26] text-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#0F1E36] dark:text-white">
                      {lang === "EN"
                        ? "Clause 4: Onboarding Training Commitment Fund"
                        : "Điều 4: Thỏa thuận đào tạo & Quỹ cam kết gắn bó"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 font-extrabold text-[10px] animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> {lang === "EN" ? "UNLAWFUL" : "PHẠM LUẬT"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#782823] dark:text-[#FCA5A5] italic mb-1.5 leading-relaxed">
                    {lang === "EN"
                      ? '"To secure specialized onboarding training resources, Employee voluntarily authorizes the retention of 50% of first month compensation into a 12-month tenure bond, refunded strictly upon successful contract maturity."'
                      : '"Nhằm bảo đảm kinh phí đào tạo nghiệp vụ chuyên sâu, Người lao động tự nguyện trích 50% thù lao tháng đầu vào Quỹ cam kết gắn bó 12 tháng; khoản này chỉ được tất toán khi hoàn thành đầy đủ thời hạn hợp đồng."'}
                  </p>
                  <div className="text-[10px] font-bold text-[#8A6731] dark:text-[#EAD7B8] flex items-start gap-1">
                    <Scale className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      {lang === "EN"
                        ? "Art. 17.2 Labor Code 2019: Strictly bans withholding wages or requiring monetary deposits under any guarantee guise."
                        : "Trái Khoản 2 Điều 17 Bộ luật Lao động 2019: Nghiêm cấm giữ tiền lương hoặc yêu cầu nộp tiền cam kết dưới mọi hình thức."}
                    </span>
                  </div>
                </div>

                {/* Clause 3: Caution */}
                <div className="p-3 rounded-xl bg-[#FFFBF0] dark:bg-[#231E12] border border-[#FFE7B3] dark:border-[#4B3B18] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#0F1E36] dark:text-white">
                      {lang === "EN"
                        ? "Clause 6: Milestone-Based All-Inclusive Package"
                        : "Điều 6: Chế độ thù lao trọn gói theo tiến độ"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 font-extrabold text-[10px]">
                      {lang === "EN" ? "DISADVANTAGEOUS" : "CẦN NÓI LẠI"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C4516] dark:text-[#FDE68A] italic mb-1.5 leading-relaxed">
                    {lang === "EN"
                      ? '"Agreed compensation constitutes all-inclusive remuneration for all working hours required to deliver project milestones; Employee fulfills off-hour coordination without separate overtime pay."'
                      : '"Thù lao đã bao gồm toàn bộ thời gian làm việc cần thiết để bàn giao dự án; Người lao động có trách nhiệm phối hợp ngoài giờ theo phát sinh mà không áp dụng đơn giá làm thêm giờ."'}
                  </p>
                  <div className="text-[10px] font-semibold text-[#8A6731] dark:text-[#EAD7B8] flex items-start gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <span>
                      {lang === "EN"
                        ? "Art. 98 Labor Code 2019: Fixed packages cannot bypass mandatory overtime wage rates (150% - 200%)."
                        : "Trái Điều 98 BLLĐ 2019: Trả lương trọn gói không được triệt tiêu quyền hưởng tiền làm thêm giờ (tối thiểu 150% - 200%)."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="mt-4 pt-3 border-t border-[#EFE8D8] dark:border-[#1C3252] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#65778F] dark:text-[#8FA3BF] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{lang === "EN" ? "100% Client-side preview" : "Bản xem trước bảo mật 100%"}</span>
                </div>

                <div className="font-extrabold text-[#8A6731] dark:text-[#EAD7B8] group-hover:underline flex items-center gap-1">
                  <span>{lang === "EN" ? "Try scanning contract" : "Bấm để thử kiểm tra"}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
