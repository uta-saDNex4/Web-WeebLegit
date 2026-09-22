import React, { useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Palette,
  Home,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  FileCheck,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import { CONTRACT_TEMPLATES } from "../data/contractTemplates";
import { ContractTemplate } from "../types";
import { useLanguage } from "../lib/language-context";

interface TemplateCatalogProps {
  onSelectTemplate: (template: ContractTemplate) => void;
}

export const TemplateCatalog: React.FC<TemplateCatalogProps> = ({
  onSelectTemplate,
}) => {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: lang === "EN" ? "All Templates (6)" : "Tất Cả Mẫu (6)" },
    { id: "work", label: lang === "EN" ? "Jobs & Internships" : "Việc Làm & Thực Tập" },
    { id: "housing", label: lang === "EN" ? "Room & Apartment Rental" : "Thuê Phòng Trọ & Nhà Ở" },
    { id: "freelance", label: lang === "EN" ? "Freelance & Service" : "Cộng Tác & Freelance" },
  ];

  const filteredTemplates = CONTRACT_TEMPLATES.filter((tmpl) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "work")
      return tmpl.category === "work" || tmpl.category === "internship";
    if (selectedCategory === "housing") return tmpl.category === "housing";
    if (selectedCategory === "freelance") return tmpl.category === "freelance";
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "work":
        return <Briefcase className="w-5 h-5 text-[#8A6731] dark:text-[#EAD7B8]" />;
      case "internship":
        return <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case "housing":
        return <Home className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case "freelance":
        return <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <FileCheck className="w-5 h-5 text-[#8A6731] dark:text-[#EAD7B8]" />;
    }
  };

  return (
    <section
      id="templates-section"
      className="py-16 sm:py-24 border-t border-[#E6DEC8] dark:border-[#1A2D49] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF5ED] dark:bg-[#15233C] border border-[#D6C5A2] dark:border-[#22395D] text-xs font-black text-[#8A6731] dark:text-[#EAD7B8] uppercase tracking-wider mb-3">
              <Bookmark className="w-3.5 h-3.5 text-[#8A6731] dark:text-[#EAD7B8]" />
              <span>{lang === "EN" ? "STANDARDIZED TEMPLATE REPOSITORY" : "THƯ VIỆN HỢP ĐỒNG MẪU CHUẨN"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F1E36] dark:text-white tracking-tight mb-3">
              {lang === "EN"
                ? "Safe Contracts with Built-in Risk Annotations"
                : "Hợp Đồng Mẫu An Toàn Kèm Chú Thích Bẫy Gài"}
            </h2>

            <p className="text-sm sm:text-base text-[#465A75] dark:text-[#9FB3CF] font-medium leading-relaxed">
              {lang === "EN"
                ? "Curated by legal experts and vetted against Vietnam current labor & civil statutory codes. Click any template to inspect clauses."
                : "Biên soạn theo quy định pháp luật hiện hành, bôi đỏ các điểm câu chữ dễ bị chèn ép để bạn nhận diện rủi ro ngay từ đầu."}
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0F223D] text-[#EAD7B8] border border-[#EAD7B8] shadow-sm scale-102"
                      : "bg-white dark:bg-[#0D1829] text-[#1E324F] dark:text-[#CAD8ED] border border-[#DDD3BE] dark:border-[#1E3558] hover:border-[#8A6731] hover:text-[#0F1E36] dark:hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const riskyCount = template.clauses.filter((c) => c.isRisky).length;

            return (
              <div
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="group cursor-pointer bg-white dark:bg-[#0D1829] rounded-2xl border-2 border-[#E3D8C3] dark:border-[#1E3456] p-6 shadow-xs hover:shadow-xl hover:border-[#8A6731] dark:hover:border-[#EAD7B8] transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 text-left"
              >
                <div>
                  {/* Top Bar: Icon + Risk Badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#FAF5ED] dark:bg-[#162744] border border-[#E0D5BE] dark:border-[#274068] flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getCategoryIcon(template.category)}
                    </div>

                    {riskyCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{riskyCount} {lang === "EN" ? "risky clauses" : "điều cần lưu ý"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{lang === "EN" ? "Standardized" : "Chuẩn an toàn"}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base sm:text-lg font-black text-[#0F1E36] dark:text-white mb-1.5 group-hover:text-[#8A6731] dark:group-hover:text-[#EAD7B8] transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-xs text-[#65778F] dark:text-[#8FA3BF] font-medium leading-relaxed mb-4">
                    {template.subtitle}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {template.clauses.slice(0, 3).map((clause, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#FAF6EF] dark:bg-[#12223C] text-[#334764] dark:text-[#B6C9E3] border border-[#E7DEC8] dark:border-[#22395D]"
                      >
                        {clause.title.split(":")[0]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* HIGH-CONTRAST ACTION BUTTON */}
                <div className="pt-4 border-t border-[#EFE8D8] dark:border-[#1A2D49] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8A6731] dark:text-[#EAD7B8]">
                    {template.clauses.length} {lang === "EN" ? "clauses verified" : "điều khoản chuẩn"}
                  </span>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F223D] hover:bg-[#162E52] text-[#EAD7B8] border border-[#EAD7B8]/80 text-xs font-black shadow-xs group-hover:scale-103 transition-transform"
                  >
                    <span>{lang === "EN" ? "Inspect" : "Xem chi tiết"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
