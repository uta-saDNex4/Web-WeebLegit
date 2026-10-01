import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Scale,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  FileCheck,
  Lock,
  Zap,
  Layers,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/language-context";

interface FeaturePromoBannerProps {
  onOpenChecker: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const FeaturePromoBanner: React.FC<FeaturePromoBannerProps> = ({
  onOpenChecker,
  onScrollToSection,
}) => {
  const { lang } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slides = [
    {
      id: "check",
      badge: lang === "EN" ? "Instant Verification" : "Rà Soát Tức Thì",
      name: lang === "EN" ? "Quick Check" : "Kiểm Tra Nhanh",
      headline:
        lang === "EN"
          ? "Scan risks & verify document integrity in under 1 second"
          : "Phát hiện rủi ro và xác thực toàn vẹn hợp đồng trong tích tắc",
      description:
        lang === "EN"
          ? "Analyze clauses against Vietnam law with SHA-256 hash matching to verify document integrity before signing."
          : "Tự động phân tích điều khoản đối chiếu chuẩn luật, kết hợp mã băm SHA-256 kiểm chứng tính toàn vẹn trước khi ký.",
      ctaText: lang === "EN" ? "Quick Check Now" : "Kiểm Tra Nhanh Ngay",
      ctaAction: () => onOpenChecker(),
      tags:
        lang === "EN"
          ? ["< 1s Analysis Speed", "SHA-256 FIPS 180-4", "Risk Highlighting"]
          : ["Tốc độ quét < 1s", "Chuẩn SHA-256 FIPS 180-4", "Chỉ rõ rủi ro ẩn"],
      targetSection: "check-section",
      themeColor: "from-[#8A6731]/15 via-[#8A6731]/5 to-transparent",
    },
    {
      id: "process",
      badge: lang === "EN" ? "User Flow" : "Quy Trình Dễ Dàng",
      name: lang === "EN" ? "How To Use" : "Cách Sử Dụng",
      headline:
        lang === "EN"
          ? "Protect your legal rights in 3 incredibly simple steps"
          : "Bảo vệ quyền lợi chính đáng chỉ qua 3 bước cực kỳ đơn giản",
      description:
        lang === "EN"
          ? "Zero legal background required: Upload file ➔ AI inspects statutory risks ➔ Receive straightforward explanations with clever negotiation scripts to negotiate back."
          : "Không cần am hiểu luật phức tạp: Tải tệp lên ➔ AI tự động bắt lỗi và bẫy phạt ➔ Nhận bảng tóm tắt dễ hiểu kèm sẵn mẫu câu thương lượng khéo léo để sửa lại hợp đồng.",
      ctaText: lang === "EN" ? "Explore 3 Steps" : "Xem Hướng Dẫn 3 Bước",
      ctaAction: () => onScrollToSection("process-section"),
      tags:
        lang === "EN"
          ? ["1. Upload Document", "2. Statutory Audit", "3. Counter Script"]
          : ["1. Tải tệp lên", "2. Rà soát luật", "3. Mẹo thương lượng"],
      targetSection: "process-section",
      themeColor: "from-blue-600/15 via-blue-500/5 to-transparent",
    },
    {
      id: "pitfalls",
      badge: lang === "EN" ? "Trap Radar" : "Cảnh Báo Sớm",
      name: lang === "EN" ? "Common Traps" : "Bẫy Thường Gặp",
      headline:
        lang === "EN"
          ? "Smart radar exposing hidden traps & unfair contract terms"
          : "Radar thông minh vạch trần các điều khoản và bẫy phạt bất lợi",
      description:
        lang === "EN"
          ? "Instantly spot wage withholding, arbitrary rental penalties, and ambiguous clauses to protect your rights."
          : "Tự động nhận diện các chiêu trò giam thù lao, phạt cọc vô lý và điều khoản mập mờ giúp bạn tự tin làm chủ hợp đồng.",
      ctaText: lang === "EN" ? "Expose Common Traps" : "Xem Các Bẫy Thường Gặp",
      ctaAction: () => onScrollToSection("pitfalls-section"),
      tags:
        lang === "EN"
          ? ["Unfair Penalties", "Wage Withholding", "Ambiguous Clauses"]
          : ["Phạt bất công", "Giam thù lao", "Điều khoản mập mờ"],
      targetSection: "pitfalls-section",
      themeColor: "from-amber-600/15 via-amber-500/5 to-transparent",
    },
    {
      id: "sources",
      badge: lang === "EN" ? "Official Codes" : "Căn Cứ Chuẩn",
      name: lang === "EN" ? "Legal References" : "Luật Tham Chiếu",
      headline:
        lang === "EN"
          ? "Direct benchmark against prevailing Vietnamese statutory regulations"
          : "Cơ sở đối chiếu vững chắc từ hệ thống văn bản pháp luật hiện hành của Việt Nam",
      description:
        lang === "EN"
          ? "Every warning and negotiation advice is grounded in official Vietnamese legislation, decrees, and circulars (continuously updated & expanding across fields)."
          : "Mọi cảnh báo và lời khuyên thương lượng đều được đối chiếu trực tiếp từ hệ thống bộ luật, luật chuyên ngành, nghị định và thông tư hiện hành (đang tiếp tục mở rộng).",
      ctaText: lang === "EN" ? "Browse Statutory Codes" : "Tra Cứu Nguồn Luật",
      ctaAction: () => onScrollToSection("sources-section"),
      tags:
        lang === "EN"
          ? ["Labor & Civil Law", "Housing & Consumer", "Continuously Expanding"]
          : ["Dân sự & Lao động", "Nhà ở & Tiêu dùng", "Đang tiếp tục mở rộng"],
      targetSection: "sources-section",
      themeColor: "from-emerald-600/15 via-emerald-500/5 to-transparent",
    },
  ];

  // 5s Autoplay rotation
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const activeSlide = slides[currentSlide];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      // Swiped left -> next slide
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else if (diff < -50) {
      // Swiped right -> prev slide
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
    touchStartX.current = null;
  };

  return (
    <section className="pt-6 sm:pt-8 pb-10 scroll-mt-24">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6">
        {/* Main Promotional Feature Card */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative bg-gradient-to-br from-white via-[#FCFCFD] to-[#F9FAFB] dark:from-[#0D1829] dark:via-[#0B1524] dark:to-[#09111E] rounded-3xl border-2 border-[#E5DBCA] dark:border-[#1E3558] p-6 sm:p-9 lg:p-11 shadow-xl overflow-hidden transition-all duration-300"
        >
          {/* Dynamic Background Glow per Slide */}
          <div
            className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${activeSlide.themeColor} rounded-full blur-3xl pointer-events-none transition-colors duration-700`}
          />

          {/* 5-second Progress Bar with High-Contrast Colors */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#E2D6BE] dark:bg-[#162744]">
            <motion.div
              key={currentSlide}
              initial={{ width: "0%" }}
              animate={{ width: isPaused ? undefined : "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-gradient-to-r from-[#6E4F1F] via-[#8A6731] to-[#B38B46] dark:from-[#8A6731] dark:via-[#D4B57E] dark:to-[#EAD7B8] shadow-xs"
            />
          </div>

          {/* ─── HORIZONTAL SLIDING ADVERTISEMENT CAROUSEL TRACK ─── */}
          <div className="overflow-hidden w-full relative z-10">
            <motion.div
              className="flex w-full"
              animate={{ x: `-${currentSlide * 100}%` }}
              transition={{
                ease: [0.25, 1, 0.5, 1], // Smooth advertisement slide deceleration
                duration: 0.65,
              }}
            >
              {slides.map((s, idx) => (
                <div key={s.id} className="w-full shrink-0 flex-none px-1">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* ─── LEFT COLUMN: BIG FEATURE NAME & PROMO CONTENT ─── */}
                    <div className="lg:col-span-7 space-y-4 text-left flex flex-col justify-center min-h-[300px] sm:min-h-[340px]">
                      {/* Category Badge */}
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5ED] dark:bg-[#162744] border border-[#E0D5BE] dark:border-[#274068] text-xs font-black uppercase tracking-wider text-[#8A6731] dark:text-[#EAD7B8]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{s.badge}</span>
                        </span>
                      </div>

                      {/* BIG FEATURE TITLE ON THE LEFT */}
                      <div className="space-y-1.5">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F1E36] dark:text-white tracking-tight leading-[1.15]">
                          {s.name}
                        </h2>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#8A6731] dark:text-[#EAD7B8] min-h-[2.75rem] sm:min-h-[3.25rem] flex items-center">
                          {s.headline}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-[#465A75] dark:text-[#9FB3CF] font-medium leading-relaxed max-w-xl min-h-[2.5rem] sm:min-h-[3rem] flex items-center">
                        {s.description}
                      </p>

                      {/* Feature Highlights Pills */}
                      <div className="flex flex-wrap gap-2 pt-1 min-h-[2rem]">
                        {s.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#12223C] border border-[#E2D7C2] dark:border-[#20375C] text-[11px] sm:text-xs font-bold text-[#1E324F] dark:text-[#CAD8ED] shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        <button
                          onClick={s.ctaAction}
                          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0F223D] hover:bg-[#162E52] text-[#EAD7B8] border-2 border-[#EAD7B8] text-xs sm:text-sm font-black shadow-md shadow-[#0F223D]/20 transition-all hover:scale-102 cursor-pointer"
                        >
                          <span>{s.ctaText}</span>
                          <ArrowRight className="w-4 h-4 text-[#EAD7B8]" />
                        </button>
                      </div>
                    </div>

                    {/* ─── RIGHT COLUMN: RICH VISUAL ILLUSTRATION BANNER COVER (ALL 4 SLIDES) ─── */}
                    <div className="lg:col-span-5 relative flex items-center justify-center min-h-[300px] sm:min-h-[340px]">
                      {idx === 0 && (
                        /* 1. KIỂM TRA: Live Integrity Verification Card */
                        <div className="w-full max-w-md bg-white dark:bg-[#0D1829] rounded-2xl border-2 border-[#E5DBCA] dark:border-[#1E3558] p-5 sm:p-6 shadow-xl space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-[#F0E8D8] dark:border-[#192B47]">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-xs font-black text-[#0F1E36] dark:text-white">
                                {lang === "EN"
                                  ? "Integrity Verification Benchmark"
                                  : "Kết Quả Xác Thực Toàn Vẹn"}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {lang === "EN" ? "Verified" : "Đã đối chiếu"}
                            </span>
                          </div>

                          {/* Row 1: Document */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white truncate">
                              <FileCheck className="w-4 h-4 text-[#8A6731] dark:text-[#EAD7B8] shrink-0" />
                              <span className="truncate">Hop_Dong_Lao_Dong_2026.pdf</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                              100%
                            </span>
                          </div>

                          {/* Row 2: Hash Seal */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white shrink-0">
                              <Lock className="w-4 h-4 text-[#8A6731] dark:text-[#EAD7B8] shrink-0" />
                              <span>SHA-256:</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#8A6731] dark:text-[#EAD7B8] font-bold truncate max-w-[150px]">
                              e3b0c44298fc1c14...
                            </span>
                          </div>

                          {/* Row 3: Speed */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white">
                              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>
                                {lang === "EN" ? "Inspection Speed" : "Thời gian rà soát"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              &lt; 0.5s ({lang === "EN" ? "Instant" : "Tức thì"})
                            </span>
                          </div>
                        </div>
                      )}

                      {idx === 1 && (
                        /* 2. CÁCH SỬ DỤNG: 3-Step Process Card */
                        <div className="w-full max-w-md bg-white dark:bg-[#0D1829] rounded-2xl border-2 border-[#E5DBCA] dark:border-[#1E3558] p-5 sm:p-6 shadow-xl space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-[#F0E8D8] dark:border-[#192B47]">
                            <div className="flex items-center gap-2">
                              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-black text-[#0F1E36] dark:text-white">
                                {lang === "EN"
                                  ? "Standard 3-Step Process"
                                  : "Quy Trình Chuẩn 3 Bước"}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              {lang === "EN" ? "Automated" : "Tự động"}
                            </span>
                          </div>

                          {/* Step 1 */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white">
                              <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                                1
                              </span>
                              <span>
                                {lang === "EN" ? "Upload Contract File" : "Tải tệp hợp đồng"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#8A6731] dark:text-[#EAD7B8] font-bold">
                              PDF • DOCX • IMG
                            </span>
                          </div>

                          {/* Step 2 */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white">
                              <span className="w-5 h-5 rounded-md bg-amber-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                                2
                              </span>
                              <span>
                                {lang === "EN" ? "AI Scans Legal Rules" : "AI rà soát hệ thống quy định"}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              {lang === "EN" ? "Catch Traps" : "Bắt lỗi ẩn"}
                            </span>
                          </div>

                          {/* Step 3 */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white">
                              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                                3
                              </span>
                              <span>
                                {lang === "EN" ? "Negotiation Scripts" : "Nhận mẹo thương lượng"}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              {lang === "EN" ? "Negotiate Back" : "Sửa điều khoản"}
                            </span>
                          </div>
                        </div>
                      )}

                      {idx === 2 && (
                        /* 3. BẪY THƯỜNG GẶP: Identified Pitfalls Card */
                        <div className="w-full max-w-md bg-white dark:bg-[#0D1829] rounded-2xl border-2 border-[#E5DBCA] dark:border-[#1E3558] p-5 sm:p-6 shadow-xl space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-[#F0E8D8] dark:border-[#192B47]">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                              <span className="text-xs font-black text-[#0F1E36] dark:text-white">
                                {lang === "EN"
                                  ? "Identified Contract Pitfalls"
                                  : "Các Điểm Bẫy Đã Nhận Diện"}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                              {lang === "EN" ? "High Risk" : "Rủi ro cao"}
                            </span>
                          </div>

                          {/* Pitfall 1 */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white">
                              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                              <span>
                                {lang === "EN" ? "Wage Withholding" : "Giam thù lao"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-red-600 dark:text-red-400 font-bold">
                              Trái Đ.17 Luật LĐ
                            </span>
                          </div>

                          {/* Pitfall 2 */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white">
                              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                              <span>
                                {lang === "EN" ? "Unfair Penalties" : "Phạt bất công"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-red-600 dark:text-red-400 font-bold">
                              Trái Đ.328 BLDS
                            </span>
                          </div>

                          {/* Pitfall 3 */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white">
                              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>
                                {lang === "EN" ? "Ambiguous Clauses" : "Điều khoản mập mờ"}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                              {lang === "EN" ? "Needs Revision" : "Cần thương lượng"}
                            </span>
                          </div>
                        </div>
                      )}

                      {idx === 3 && (
                        /* 4. LUẬT THAM CHIẾU: Statutory Codes & Scales of Justice */
                        <div className="w-full max-w-md bg-white dark:bg-[#0D1829] rounded-2xl border-2 border-[#E5DBCA] dark:border-[#1E3558] p-5 sm:p-6 shadow-xl space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-[#F0E8D8] dark:border-[#192B47]">
                            <Scale className="w-5 h-5 text-[#8A6731] dark:text-[#EAD7B8]" />
                            <span className="text-xs font-black text-[#0F1E36] dark:text-white">
                              {lang === "EN"
                                ? "Statutory Benchmark Database (Expanding)"
                                : "Hệ Thống Văn Bản Luật Hiện Hành (Đang Mở Rộng)"}
                            </span>
                          </div>

                          {/* Law 1 */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white">
                              <BookOpen className="w-4 h-4 text-[#8A6731] dark:text-[#EAD7B8]" />
                              <span>
                                {lang === "EN" ? "Labor Code 2019" : "Bộ luật Lao động 2019"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#8A6731] dark:text-[#EAD7B8] font-bold">
                              Luật số 45/2019/QH14
                            </span>
                          </div>

                          {/* Law 2 */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white">
                              <BookOpen className="w-4 h-4 text-[#8A6731] dark:text-[#EAD7B8]" />
                              <span>
                                {lang === "EN" ? "Civil Code 2015" : "Bộ luật Dân sự 2015"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#8A6731] dark:text-[#EAD7B8] font-bold">
                              Luật số 91/2015/QH13
                            </span>
                          </div>

                          {/* Law 3 */}
                          <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E0D5BE] dark:border-[#274068] text-left flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#0F1E36] dark:text-white">
                              <BookOpen className="w-4 h-4 text-[#8A6731] dark:text-[#EAD7B8]" />
                              <span>
                                {lang === "EN" ? "Housing Law 2023" : "Luật Nhà ở 2023"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#8A6731] dark:text-[#EAD7B8] font-bold">
                              Luật số 27/2023/QH15
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ─── BOTTOM CAROUSEL SELECTOR TABS (4 FEATURES) ─── */}
          <div className="mt-8 pt-6 border-t border-[#EAE3D2] dark:border-[#1E3558] grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 relative z-10">
            {slides.map((s, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`text-left p-3.5 rounded-2xl transition-all cursor-pointer border relative overflow-hidden ${
                    isActive
                      ? "bg-white dark:bg-[#13233F] border-[#8A6731] dark:border-[#EAD7B8] shadow-md"
                      : "bg-[#FAF8F3] dark:bg-[#0B1524] border-transparent hover:bg-white dark:hover:bg-[#101D33] opacity-75 hover:opacity-100"
                  }`}
                >
                  {/* Perfectly corner-aligned live pulsing indicator */}
                  {isActive && (
                    <span className="absolute top-3.5 right-3.5 flex h-2 w-2 items-center justify-center pointer-events-none">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8A6731] dark:bg-[#EAD7B8] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#8A6731] dark:bg-[#EAD7B8]" />
                    </span>
                  )}

                  <div className="mb-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isActive
                          ? "text-[#8A6731] dark:text-[#EAD7B8]"
                          : "text-[#65778F] dark:text-[#8EA5C4]"
                      }`}
                    >
                      0{idx + 1}
                    </span>
                  </div>
                  <div
                    className={`text-xs sm:text-sm font-black truncate pr-4 ${
                      isActive
                        ? "text-[#0F1E36] dark:text-white"
                        : "text-[#4A5D75] dark:text-[#9FB3CF]"
                    }`}
                  >
                    {s.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
