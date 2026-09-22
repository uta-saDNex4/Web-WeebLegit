import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Lock, Scale } from "lucide-react";
import { useLanguage } from "../lib/language-context";

interface CtaLegalBannerProps {
  onStart: () => void;
}

export const CtaLegalBanner: React.FC<CtaLegalBannerProps> = ({ onStart }) => {
  const { lang } = useLanguage();

  return (
    <section className="pt-12 sm:pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#0F223D] dark:bg-[#091424] border-2 border-[#EAD7B8] p-8 sm:p-14 text-center shadow-2xl">
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-[#EAD7B8]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-[#EAD7B8]/15 blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAD7B8]/15 border border-[#EAD7B8]/40 text-[#EAD7B8] text-xs font-black uppercase tracking-wider mb-5">
            <Scale className="w-3.5 h-3.5 text-[#EAD7B8]" />
            <span>{lang === "EN" ? "AUTHENTICATED LEGAL & INTEGRITY STANDARDS" : "CĂN CỨ PHÁP LÝ & BẢO MẬT ĐÃ CHỨNG THỰC"}</span>
          </div>

          {/* Title */}
          <h2 className="relative text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto mb-4 leading-tight">
            {lang === "EN"
              ? "Verify Contract Legality & Integrity Before Signing"
              : "Xác Thực Tính Pháp Lý & Toàn Vẹn Của Hợp Đồng"}
          </h2>

          {/* Subtitle with Certified Information */}
          <p className="relative text-sm sm:text-base text-[#D0DDF0] font-medium max-w-3xl mx-auto mb-8 leading-relaxed">
            {lang === "EN"
              ? "Referenced directly against the Labor Code (Law 45/2019/QH14), Civil Code (Law 91/2015/QH13), and Housing Law (Law 27/2023/QH15). File integrity verified via independent SHA-256 byte-stream checksums."
              : "Hệ thống đối chiếu trực tiếp theo Bộ luật Lao động (Luật số 45/2019/QH14), Bộ luật Dân sự (Luật số 91/2015/QH13) và Luật Nhà ở (Luật số 27/2023/QH15). Xác thực tính toàn vẹn độc lập bằng thuật toán mã băm SHA-256."}
          </p>

          {/* Certified Technical & Statutory Points */}
          <div className="relative flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-[#EAD7B8] mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#EAD7B8]" />
              <span>
                {lang === "EN"
                  ? "Referenced to Labor Code 2019, Civil Code 2015 & Housing Law 2023"
                  : "Căn cứ Bộ luật Lao động 2019, Bộ luật Dân sự 2015 & Luật Nhà ở 2023"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#EAD7B8]" />
              <span>Mã băm SHA-256 kiểm tra toàn vẹn byte gốc (FIPS 180-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#EAD7B8]" />
              <span>Tự hủy dữ liệu tạm sau phiên quét, không lưu trữ tệp</span>
            </div>
          </div>

          {/* HIGH-CONTRAST GOLD CALL TO ACTION BUTTON */}
          <div className="relative inline-block">
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-3 px-8 py-4.5 rounded-2xl bg-[#EAD7B8] hover:bg-[#F2E5CE] text-[#0F223D] font-black text-sm sm:text-base shadow-xl shadow-black/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-[#0F223D] group-hover:rotate-12 transition-transform" />
              <span>{lang === "EN" ? "Verify Contract Legality — Free" : "Tải Lên Đối Chiếu Hợp Đồng — Miễn Phí"}</span>
              <ArrowRight className="w-5 h-5 text-[#0F223D] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
