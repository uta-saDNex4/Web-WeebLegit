import React from "react";
import { LEGAL_SOURCES } from "../data/legalReferences";
import { LegalSource } from "../types";
import {
  Scale,
  BookOpen,
  Home,
  Fingerprint,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/language-context";

interface LegalReferencesProps {
  onSelectSource: (source: LegalSource) => void;
  onOpenChecker: () => void;
}

const getSourceIcon = (iconType: string) => {
  switch (iconType) {
    case "civil":
      return <Scale className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />;
    case "labor":
      return <BookOpen className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />;
    case "housing":
      return <Home className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />;
    case "security":
      return <Fingerprint className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />;
    default:
      return <BookOpen className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />;
  }
};

export const LegalReferences: React.FC<LegalReferencesProps> = ({
  onSelectSource,
  onOpenChecker,
}) => {
  const { t, lang } = useLanguage();

  return (
    <section
      id="sources-section"
      className="py-16 sm:py-24 border-t border-[#e2e8f0] dark:border-[#1a2d4b]/60 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#8a6834] dark:text-[#EAD7B8] bg-[#FAF5ED] dark:bg-[#EAD7B8]/10 border border-[#EAD7B8]/60 dark:border-[#EAD7B8]/30 mb-4 shadow-none">
            <BookOpen className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
            <span>{t("legal.badge")}</span>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] dark:text-white tracking-tight mb-3">
            {t("legal.title")}
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#334155] dark:text-[#94a9c9] leading-relaxed font-medium">
            {t("legal.subtitle")}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {LEGAL_SOURCES.map((source, idx) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              onClick={() => {
                if (source.actionType === "checker") {
                  onOpenChecker();
                } else {
                  onSelectSource(source);
                }
              }}
              className="group cursor-pointer bg-white dark:bg-[#0b1424]/90 backdrop-blur-md rounded-2xl border border-[#cbd5e1] dark:border-[#1a2d4b] hover:border-[#EAD7B8] p-6 flex flex-col justify-between shadow-sm dark:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <div>
                {/* Icon & Code Badge Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#FAF5ED] dark:bg-[#12223c] border border-[#EAD7B8]/60 dark:border-[#22395d] group-hover:border-[#EAD7B8] flex items-center justify-center transition-colors">
                    {getSourceIcon(source.iconType)}
                  </div>

                  {source.codeBadge && (
                    <span className="text-[11px] font-bold text-[#334155] dark:text-[#8fa3bf] bg-[#f1f5f9] dark:bg-[#12223c] border border-[#cbd5e1] dark:border-[#1e3458] px-2.5 py-1 rounded-md tracking-wider">
                      {source.codeBadge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-[#0f172a] dark:text-white mb-2.5 group-hover:text-[#8a6834] dark:group-hover:text-[#EAD7B8] transition-colors leading-snug">
                  {source.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#475569] dark:text-[#8fa3bf] leading-relaxed mb-6 line-clamp-4 font-medium">
                  {source.description}
                </p>
              </div>

              {/* Action Link */}
              <div className="pt-4 border-t border-[#e2e8f0] dark:border-[#1a2d4b]/80 flex items-center justify-between text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8]">
                <span>
                  {source.actionType === "checker"
                    ? lang === "EN" ? "Scan Contract" : "Quét hợp đồng"
                    : lang === "EN" ? "View Clause Details" : "Xem điều khoản chi tiết"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
