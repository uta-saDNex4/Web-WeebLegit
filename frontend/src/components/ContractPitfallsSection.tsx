import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Scale,
  Sparkles,
  Briefcase,
  Home,
  CreditCard,
  Palette,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/language-context";

interface ContractPitfallsSectionProps {
  onOpenChecker: () => void;
}

interface PitfallItem {
  id: string;
  category: "work" | "housing" | "loan" | "freelance";
  title: string;
  riskLevel: "critical" | "warning" | "illegal";
  riskLabel: string;
  contractSnippet: string;
  lawRef: string;
  advice: string;
}

export const ContractPitfallsSection: React.FC<ContractPitfallsSectionProps> = ({
  onOpenChecker,
}) => {
  const { lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<
    "all" | "work" | "housing" | "loan" | "freelance"
  >("all");

  const categories = [
    { id: "all", label: lang === "EN" ? "All Traps" : "Tất cả", icon: Sparkles },
    { id: "work", label: lang === "EN" ? "Jobs & Probation" : "Đi làm & Thử việc", icon: Briefcase },
    { id: "housing", label: lang === "EN" ? "Room Rentals" : "Thuê phòng trọ", icon: Home },
    { id: "loan", label: lang === "EN" ? "Consumer Loans" : "Vay tiêu dùng", icon: CreditCard },
    { id: "freelance", label: lang === "EN" ? "Freelance & Gig" : "Làm cộng tác", icon: Palette },
  ];

  const pitfalls: PitfallItem[] = [
    {
      id: "p1",
      category: "work",
      title:
        lang === "EN"
          ? "Disguising wage retention as 'Tenure Training Assurance Fund'"
          : "Lập 'Quỹ đào tạo cam kết gắn bó' để giữ 50% lương tháng đầu",
      riskLevel: "illegal",
      riskLabel: lang === "EN" ? "Strictly Illegal" : "Luật nghiêm cấm",
      contractSnippet:
        lang === "EN"
          ? '"To ensure onboarding training investment, Employee voluntarily authorizes 50% first-month salary retention into a 12-month tenure bond, refunded strictly upon contract maturity."'
          : '"Nhằm bảo đảm kinh phí đào tạo nghiệp vụ chuyên sâu, Người lao động tự nguyện trích 50% thù lao tháng đầu vào Quỹ cam kết gắn bó 12 tháng; khoản này chỉ được tất toán khi hoàn tất đầy đủ thời hạn hợp đồng."',
      lawRef:
        lang === "EN"
          ? "Article 17.2, Vietnam Labor Code 2019"
          : "Khoản 2 Điều 17 Bộ luật Lao động 2019",
      advice:
        lang === "EN"
          ? "Employers are strictly forbidden from withholding wages or requiring cash deposits under any pretext. Request a separate Article 62 vocational training agreement instead."
          : "Khoản 2 Điều 17 BLLĐ cấm tuyệt đối việc giữ lương hoặc yêu cầu tiền đặt cọc dưới danh nghĩa 'quỹ tự nguyện'. Hãy yêu cầu tách riêng Hợp đồng đào tạo nghề theo Điều 62 BLLĐ (chỉ hoàn trả chi phí khi đơn phương chấm dứt trái luật, không được giữ tiền trước).",
    },
    {
      id: "p2",
      category: "housing",
      title:
        lang === "EN"
          ? "Tacit lease auto-rollover clause triggering total deposit forfeiture"
          : "Gài điều khoản 'Mặc nhiên gia hạn kỳ hạn mới' kèm mất 100% tiền cọc",
      riskLevel: "critical",
      riskLabel: lang === "EN" ? "High Risk" : "Dễ mất cọc",
      contractSnippet:
        lang === "EN"
          ? '"If Tenant fails to provide written non-renewal notice 45 days prior to expiry, lease automatically extends for an identical term; vacating during rollover forfeits entire deposit."'
          : '"Trường hợp Bên thuê không gửi văn bản báo chấm dứt trước 45 ngày trước ngày kết thúc thời hạn, hợp đồng mặc nhiên gia hạn thêm 01 chu kỳ tương đương; việc dọn đi trong kỳ gia hạn xem như vi phạm và mất toàn bộ tiền đặt cọc."',
      lawRef:
        lang === "EN"
          ? "Articles 328 & 474 Civil Code 2015, Article 163 Housing Law 2023"
          : "Điều 328 & Điều 474 BLDS 2015, Điều 163 Luật Nhà ở 2023",
      advice:
        lang === "EN"
          ? "Notice windows over 30 days are designed to trap tenants. Amend to: 'Lease expires naturally at term end. Tenant provides 15-30 days notice to vacate and receives full deposit refund within 3 business days of handover.'"
          : "Thời hạn thông báo 45-60 ngày là bẫy cố tình để người thuê lỡ hạn và bị tịch thu cọc. Hãy sửa lại: 'Hết thời hạn thuê, hợp đồng tự động chấm dứt trừ khi hai bên ký phụ lục mới; Bên thuê báo trước 15-30 ngày và nhận lại đầy đủ tiền cọc trong vòng 03 ngày làm việc sau khi bàn giao phòng.'",
    },
    {
      id: "p3",
      category: "loan",
      title:
        lang === "EN"
          ? "'0% Promotional Interest' obscured by compounding monthly platform fees"
          : "Mác 'Lãi suất 0%' nhưng gài 'Phí quản lý tài sản & dịch vụ' hàng tháng",
      riskLevel: "critical",
      riskLabel: lang === "EN" ? "Disguised Usury" : "Phí lách luật",
      contractSnippet:
        lang === "EN"
          ? '"Promotional interest rate is 0%/year for the full tenure. Borrower is obligated to disburse a monthly Account Management & Service Fee of 4.5% computed on the original principal balance."'
          : '"Lãi suất vay ưu đãi 0%/năm áp dụng suốt kỳ hạn. Bên vay có nghĩa vụ thanh toán định kỳ Phí quản lý dịch vụ nền tảng tương đương 4.5%/tháng tính trên dư nợ gốc ban đầu."',
      lawRef:
        lang === "EN"
          ? "Article 468 Civil Code 2015 (20%/year statutory interest cap)"
          : "Điều 468 Bộ luật Dân sự 2015 (Trần lãi suất 20%/năm)",
      advice:
        lang === "EN"
          ? "A 4.5%/month fee on original principal equates to an effective APR above 54%/year, circumventing the statutory 20% interest cap. Demand a comprehensive cashflow schedule detailing all recurring charges."
          : "Mức phí 4.5%/tháng trên gốc ban đầu tương đương lãi suất thực tế trên 54%/năm (vượt xa trần lãi suất 20%/năm theo Điều 468 BLDS). Đòi hỏi bên cho vay cung cấp bảng tính tổng số tiền thực trả hàng tháng và lãi suất thực tế (APR) trước khi ký kết.",
    },
    {
      id: "p4",
      category: "freelance",
      title:
        lang === "EN"
          ? "Discretionary acceptance clause permitting infinite unpaid revisions"
          : "Bẫy nghiệm thu 'Đến khi Bên A hoàn toàn chấp thuận' để ép sửa vô hạn",
      riskLevel: "warning",
      riskLabel: lang === "EN" ? "Unfair Terms" : "Bị ép công sức",
      contractSnippet:
        lang === "EN"
          ? '"Deliverables acceptance occurs strictly upon Client\'s discretionary written sign-off. Contractor must implement unlimited revisions until meeting Client\'s subjective expectations without fee adjustments."'
          : '"Biên bản bàn giao chỉ có giá trị khi Bên A xác nhận hoàn toàn chấp thuận bằng văn bản. Bên B có nghĩa vụ hiệu chỉnh không giới hạn cho đến khi đạt tiêu chuẩn thẩm mỹ của Bên A mà không phát sinh thêm thù lao."',
      lawRef:
        lang === "EN"
          ? "Articles 513 & 519 Vietnam Civil Code 2015"
          : "Điều 513 & Điều 519 Bộ luật Dân sự 2015",
      advice:
        lang === "EN"
          ? "Subjective satisfaction criteria allow clients to stall payments indefinitely. Amend to: 'Acceptance is evaluated against agreed technical specifications in Appendix 1. Maximum 2 feedback rounds within original scope; out-of-scope revisions incur additional fees.'"
          : "Tiêu chí nghiệm thu cảm tính 'hoàn toàn chấp thuận' trao toàn quyền giữ tiền cho bên thuê. Hãy yêu cầu sửa: 'Nghiệm thu căn cứ vào bản mô tả yêu cầu công việc (Phụ lục 1). Tối đa 02 đợt chỉnh sửa trong phạm vi yêu cầu ban đầu; các yêu cầu thay đổi mới phát sinh ngoài bản mô tả phải được tính thêm phụ phí.'",
    },
  ];

  const filteredPitfalls =
    activeCategory === "all"
      ? pitfalls
      : pitfalls.filter((p) => p.category === activeCategory);

  return (
    <section
      id="pitfalls-section"
      className="py-12 sm:py-16 bg-[#FAF6EF]/60 dark:bg-[#0A1322]/60 border-t border-[#E6DEC8] dark:border-[#1A2D49] relative overflow-hidden transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#8A6731] dark:text-[#EAD7B8] bg-[#FAF5ED] dark:bg-[#15233C] border border-[#D6C5A2] dark:border-[#22395D] mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-[#8A6731] dark:text-[#EAD7B8]" />
            <span>
              {lang === "EN" ? "CONTRACT RISKS" : "CẢNH BÁO RỦI RO"}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#0F1E36] dark:text-white tracking-tight">
            {lang === "EN"
              ? "Common Unfair Contract Clauses"
              : "Điều Khoản Bất Lợi Thường Gặp"}
          </h2>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0F223D] text-[#EAD7B8] border border-[#EAD7B8] shadow-sm scale-102"
                    : "bg-white dark:bg-[#0D1829] text-[#1E324F] dark:text-[#CAD8ED] border border-[#DDD3BE] dark:border-[#1E3558] hover:border-[#8A6731] hover:text-[#0F1E36] dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Pitfalls Grid (Compact 2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPitfalls.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#0D1829] rounded-2xl border-2 border-[#E3D8C3] dark:border-[#1E3456] p-6 sm:p-7 shadow-xs hover:border-[#8A6731] dark:hover:border-[#EAD7B8] transition-all flex flex-col justify-between text-left hover:-translate-y-0.5"
            >
              <div>
                {/* Top status bar */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-md ${
                      item.riskLevel === "illegal"
                        ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                        : item.riskLevel === "critical"
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
                        : "bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{item.riskLabel}</span>
                  </span>

                  <span className="text-[11px] font-black text-[#8A6731] dark:text-[#EAD7B8] flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>{item.lawRef}</span>
                  </span>
                </div>

                {/* Trap Title */}
                <h3 className="text-base sm:text-lg font-black text-[#0F1E36] dark:text-white mb-3">
                  {item.title}
                </h3>

                {/* Contract Snippet Callout */}
                <div className="p-3.5 rounded-xl bg-[#FAF6EF] dark:bg-[#12223C] border-l-4 border-[#8A6731] text-xs italic text-[#1E324F] dark:text-[#CAD8ED] leading-relaxed mb-4">
                  {item.contractSnippet}
                </div>
              </div>

              {/* Actionable Advice */}
              <div className="pt-3.5 border-t border-[#EFE8D8] dark:border-[#1A2D49] flex items-start gap-2.5 text-xs text-[#465A75] dark:text-[#9FB3CF]">
                <div className="w-6 h-6 rounded-lg bg-[#FAF5ED] dark:bg-[#162744] border border-[#E0D5BE] dark:border-[#274068] flex items-center justify-center text-[#8A6731] dark:text-[#EAD7B8] shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-[#0F1E36] dark:text-white">
                    {lang === "EN" ? "How to counter: " : "Cách đàm phán: "}
                  </strong>
                  {item.advice}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
