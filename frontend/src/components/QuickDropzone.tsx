import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "../lib/language-context";

interface QuickDropzoneProps {
  onOpenChecker: () => void;
}

export const QuickDropzone: React.FC<QuickDropzoneProps> = ({ onOpenChecker }) => {
  const { lang } = useLanguage();
  const [sampleQuery, setSampleQuery] = useState("");

  const sampleClauses = [
    lang === "EN"
      ? "Retaining 50% first-month salary into a 12-month 'Onboarding Training Fund'"
      : "Trích 50% thù lao tháng đầu vào 'Quỹ cam kết đào tạo hội nhập' 12 tháng",
    lang === "EN"
      ? "Automatic lease rollover forfeiting 100% deposit if no notice 45 days prior"
      : "Mặc nhiên gia hạn hợp đồng thuê nếu không báo trước 45 ngày kèm mất 100% cọc",
    lang === "EN"
      ? "Surrendering original diploma / ID card as 'confidentiality guarantee deposit'"
      : "Nộp bản chính bằng tốt nghiệp / CCCD để 'đảm bảo trách nhiệm bảo mật'",
  ];

  return (
    <section id="check-section" className="py-8 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#FAF6EE] via-white to-[#FAF6EE] dark:from-[#0E1A2D] dark:via-[#0A1424] dark:to-[#0E1A2D] rounded-3xl border-2 border-[#E5DBCA] dark:border-[#1E3558] p-6 sm:p-9 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-3 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAD7B8]/30 dark:bg-[#EAD7B8]/10 text-[#8A6731] dark:text-[#EAD7B8] text-xs font-black uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>{lang === "EN" ? "Quick Check" : "Kiểm Tra Nhanh"}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#0F1E36] dark:text-white tracking-tight">
                {lang === "EN"
                  ? "Drop your contract or test a sample trap"
                  : "Thử Kiểm Tra Hợp Đồng Ngay Tại Đây"}
              </h2>

              <p className="text-xs sm:text-sm text-[#465A75] dark:text-[#9FB3CF] leading-relaxed font-medium">
                {lang === "EN"
                  ? "Upload your contract or click any sample trap below to see how the system spots unfair terms."
                  : "Tải file hợp đồng của bạn lên hoặc bấm vào các câu bẫy mẫu bên dưới để xem hệ thống chỉ ra điểm vô lý theo luật."}
              </p>

              {/* Sample Clause Badges */}
              <div className="pt-1">
                <p className="text-[11px] font-bold text-[#65778F] dark:text-[#8FA3BF] uppercase tracking-wider mb-2">
                  {lang === "EN" ? "Or try clicking these common traps:" : "Hoặc thử bấm vào các câu bẫy hay gặp:"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sampleClauses.map((clause, idx) => (
                    <button
                      key={idx}
                      onClick={() => onOpenChecker()}
                      className="text-left text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#12223C] border border-[#DDD2BC] dark:border-[#22395D] hover:border-[#8A6731] dark:hover:border-[#EAD7B8] text-[#1E324F] dark:text-[#CAD8ED] transition-all cursor-pointer shadow-2xs hover:scale-101"
                    >
                      ⚠️ "{clause}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Dropzone Area */}
            <div className="lg:col-span-7">
              <div
                onClick={onOpenChecker}
                className="group border-2 border-dashed border-[#D6C7A8] dark:border-[#2A446D] hover:border-[#8A6731] dark:hover:border-[#EAD7B8] rounded-2xl p-6 sm:p-8 bg-white/80 dark:bg-[#0A1424]/80 text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-white dark:hover:bg-[#0D192C]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FAF5ED] dark:bg-[#162744] border border-[#E0D5BE] dark:border-[#274068] text-[#8A6731] dark:text-[#EAD7B8] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7 stroke-[2.2]" />
                </div>

                <h3 className="text-base sm:text-lg font-black text-[#0F1E36] dark:text-white mb-1">
                  {lang === "EN" ? "Click or Drag & Drop PDF, Word here" : "Bấm vào đây hoặc kéo thả file PDF, Word"}
                </h3>

                <p className="text-xs text-[#65778F] dark:text-[#8FA3BF] mb-4 font-medium">
                  {lang === "EN"
                    ? "File up to 25MB • SHA-256 Verified • Account-Bound Privacy"
                    : "File tối đa 25MB • Kiểm tra toàn vẹn SHA-256 • Bảo mật dữ liệu cá nhân"}
                </p>

                {/* HIGH-CONTRAST PRIMARY ACTION BUTTON */}
                <button
                  type="button"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#0F223D] hover:bg-[#162E52] text-[#EAD7B8] border border-[#EAD7B8] text-xs sm:text-sm font-black shadow-md shadow-[#0F223D]/25 transition-all group-hover:scale-104 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#EAD7B8]" />
                  <span>{lang === "EN" ? "Select Contract From Device" : "Chọn File Hợp Đồng Từ Máy"}</span>
                  <ArrowRight className="w-4 h-4 text-[#EAD7B8]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
