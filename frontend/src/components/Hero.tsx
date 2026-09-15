import React from 'react';
import { ShieldCheck, ArrowRight, FileText, CheckCircle2, AlertTriangle, Sparkles, HelpCircle, FileSearch, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onOpenChecker: () => void;
  onOpenTemplates: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenChecker, onOpenTemplates }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24">
      {/* Subtle background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-gradient-to-tr from-[#EAD7B8]/25 via-[#f5ede1]/20 to-transparent blur-3xl -z-10 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Eyebrow Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#8a6834] bg-[#FAF5ED] border border-[#EAD7B8]/60 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8a6834]" />
          <span>XÁC THỰC HỢP ĐỒNG CHO SINH VIÊN</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#10253f] leading-[1.15] mb-6"
        >
          Ký đúng điều. <br className="hidden sm:inline" />
          <span className="text-[#8a6834]">Tự tin bắt đầu.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-[#49627d] max-w-2xl mx-auto leading-relaxed mb-8"
        >
          Đọc hiểu điều khoản, đối chiếu nguồn tin cậy và hỏi AI bằng ngôn ngữ dễ hiểu — trước khi bạn đặt bút ký.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-5"
        >
          <button
            onClick={onOpenChecker}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-semibold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-xl shadow-lg shadow-[#EAD7B8]/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <FileSearch className="w-5 h-5" />
            <span>Kiểm tra hợp đồng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onOpenTemplates}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-[#10253f] bg-white hover:bg-[#FAF6EF] rounded-xl border border-[#d8e3ef] shadow-sm transition-all hover:border-[#EAD7B8] cursor-pointer"
          >
            <span>Xem mẫu hợp đồng</span>
          </button>
        </motion.div>

        {/* Reassurance text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xs sm:text-sm text-[#8297ac] flex items-center justify-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4 text-[#8297ac]" />
          <span>Không thay thế tư vấn pháp lý — giúp bạn biết điều cần hỏi.</span>
        </motion.p>

        {/* Hero Interactive Preview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <div 
            onClick={onOpenChecker}
            className="group cursor-pointer text-left bg-white rounded-2xl border border-[#d8e3ef] p-5 sm:p-7 shadow-xl shadow-[#113d64]/6 transition-all hover:border-[#EAD7B8] hover:shadow-2xl hover:shadow-[#EAD7B8]/20"
          >
            {/* Document Header Bar */}
            <div className="flex items-center justify-between border-b border-[#e6edf4] pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#FAF5ED] flex items-center justify-center text-[#8a6834]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#10253f]">Hợp đồng thực tập.pdf</div>
                  <div className="text-[11px] text-[#8297ac]">Tài liệu mẫu sinh viên • 3 trang</div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#159f7b] bg-[#eafbf7] border border-[#b7f6e5]">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Đã kiểm tra</span>
              </div>
            </div>

            {/* Document Mockup Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base sm:text-lg text-[#10253f] uppercase tracking-wide">
                  THỎA THUẬN THỰC TẬP
                </h3>
                <span className="text-xs font-medium text-[#8a6834] flex items-center gap-1 group-hover:underline">
                  <span>Xem chi tiết</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Highlighted Warning Box (matching Framer component exactly) */}
              <div className="rounded-xl bg-[#fff1f0] border border-[#ffd1cc] p-4 sm:p-4.5 transition-colors">
                <div className="flex items-center gap-2 text-xs font-bold text-[#e4534b] uppercase tracking-wider mb-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Điều khoản cần làm rõ</span>
                </div>
                <p className="text-sm font-semibold text-[#7d342f] leading-snug mb-2">
                  Điều khoản thử việc không nêu rõ phụ cấp.
                </p>
                <div className="flex items-center gap-2 text-xs text-[#bf3b35] bg-white/70 rounded-lg px-2.5 py-1.5 border border-[#ffd1cc]/60">
                  <Sparkles className="w-3.5 h-3.5 text-[#e4534b] shrink-0" />
                  <span>AI đã tìm thấy <strong>2 điểm</strong> bạn nên hỏi lại trước khi ký.</span>
                </div>
              </div>

              {/* Skeleton doc lines representing contract paragraphs */}
              <div className="space-y-2 pt-1">
                <div className="h-2.5 bg-[#e6edf4] rounded-full w-full"></div>
                <div className="h-2.5 bg-[#e6edf4] rounded-full w-5/6"></div>
                <div className="h-2.5 bg-[#e6edf4] rounded-full w-4/6"></div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
