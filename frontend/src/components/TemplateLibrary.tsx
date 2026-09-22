import React, { useState } from "react";
import { CONTRACT_TEMPLATES } from "../data/contractTemplates";
import { ContractTemplate } from "../types";
import {
  Briefcase,
  GraduationCap,
  Palette,
  Home,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/language-context";

interface TemplateLibraryProps {
  onSelectTemplate: (template: ContractTemplate) => void;
}

const getTemplateIcon = (category: string) => {
  switch (category) {
    case "work":
      return <Briefcase className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />;
    case "internship":
      return <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case "freelance":
      return <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    case "housing":
      return <Home className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    default:
      return <Briefcase className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />;
  }
};

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onSelectTemplate,
}) => {
  const { t, lang } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filterTabs = [
    { id: "all", label: t("tpl.tab_all") },
    { id: "labor", label: t("tpl.tab_labor") },
    { id: "housing", label: t("tpl.tab_housing") },
    { id: "freelance", label: t("tpl.tab_freelance") },
  ];

  const filteredTemplates = CONTRACT_TEMPLATES.filter((tmpl) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "labor")
      return tmpl.category === "work" || tmpl.category === "internship";
    if (selectedFilter === "housing") return tmpl.category === "housing";
    if (selectedFilter === "freelance") return tmpl.category === "freelance";
    return true;
  });

  return (
    <section
      id="templates-section"
      className="py-16 sm:py-24 border-t border-[#e2e8f0] dark:border-[#1a2d4b]/60 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header & Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#8a6834] dark:text-[#EAD7B8] bg-[#FAF5ED] dark:bg-[#EAD7B8]/10 border border-[#EAD7B8]/60 dark:border-[#EAD7B8]/30 mb-4 shadow-none">
              <Sparkles className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
              <span>{t("tpl.badge")}</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] dark:text-white tracking-tight mb-3">
              {t("tpl.title")}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#334155] dark:text-[#94a9c9] leading-relaxed font-medium">
              {t("tpl.subtitle")}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => {
              const isActive = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#EAD7B8] text-[#10253f] shadow-sm scale-102"
                      : "bg-white dark:bg-[#0c1628] text-[#334155] dark:text-[#8fa3bf] border border-[#cbd5e1] dark:border-[#1a2d4b] hover:border-[#EAD7B8] hover:text-[#0f172a] dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Cards Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((tmpl, idx) => (
            <motion.div
              key={tmpl.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              onClick={() => onSelectTemplate(tmpl)}
              className="group cursor-pointer bg-white dark:bg-[#0b1424]/90 backdrop-blur-md rounded-2xl border border-[#cbd5e1] dark:border-[#1a2d4b] hover:border-[#EAD7B8] p-6 sm:p-7 shadow-sm dark:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#FAF5ED] dark:bg-[#12223c] border border-[#EAD7B8]/60 dark:border-[#22395d] group-hover:border-[#EAD7B8] flex items-center justify-center transition-colors">
                    {getTemplateIcon(tmpl.category)}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#e4534b] dark:text-[#f87171] bg-[#fff1f0] dark:bg-[#3f1619]/50 border border-[#ffd1cc] dark:border-[#7f1d1d]/60 px-3 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{tmpl.riskCount} {t("tpl.risk_badge")}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-1.5 group-hover:text-[#8a6834] dark:group-hover:text-[#EAD7B8] transition-colors">
                  {tmpl.title}
                </h3>

                {/* Subtitle */}
                <p className="text-sm font-semibold text-[#334155] dark:text-[#94a9c9] mb-3">
                  {tmpl.subtitle}
                </p>

                {/* Description */}
                <p className="text-xs text-[#475569] dark:text-[#8fa3bf] leading-relaxed mb-6 font-medium">
                  {tmpl.description}
                </p>
              </div>

              {/* Tags & Action Row */}
              <div className="pt-4 border-t border-[#e2e8f0] dark:border-[#1a2d4b]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {tmpl.tags.slice(0, 3).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[11px] font-semibold text-[#334155] dark:text-[#94a9c9] bg-[#f1f5f9] dark:bg-[#12223c] border border-[#cbd5e1] dark:border-[#1e3458] px-2.5 py-1 rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#8a6834] dark:text-[#EAD7B8] group-hover:translate-x-1 transition-transform whitespace-nowrap">
                  <span>{t("tpl.btn_detail")}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
