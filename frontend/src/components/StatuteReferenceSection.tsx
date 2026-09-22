import React from "react";
import { Scale, BookOpen, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";
import { LEGAL_SOURCES } from "../data/legalReferences";
import { LegalSource } from "../types";
import { useLanguage } from "../lib/language-context";

interface StatuteReferenceSectionProps {
  onSelectSource: (source: LegalSource) => void;
  onOpenChecker?: () => void;
}

export const StatuteReferenceSection: React.FC<StatuteReferenceSectionProps> = ({
  onSelectSource,
}) => {
  const { lang } = useLanguage();

  return (
    <section
      id="sources-section"
      className="py-12 sm:py-16 border-t border-[#E6DEC8] dark:border-[#1A2D49] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 text-left">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF5ED] dark:bg-[#15233C] border border-[#D6C5A2] dark:border-[#22395D] text-xs font-black text-[#8A6731] dark:text-[#EAD7B8] uppercase tracking-wider mb-2.5">
              <Scale className="w-3.5 h-3.5 text-[#8A6731] dark:text-[#EAD7B8]" />
              <span>{lang === "EN" ? "LEGAL PROTECTIONS" : "CĂN CỨ PHÁP LUẬT"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F1E36] dark:text-white tracking-tight mb-2.5">
              {lang === "EN"
                ? "How Vietnam Laws Protect You"
                : "Luật Pháp Bảo Vệ Bạn Như Thế Nào?"}
            </h2>

            <p className="text-sm sm:text-base text-[#465A75] dark:text-[#9FB3CF] font-medium leading-relaxed">
              {lang === "EN"
                ? "Clear provisions enacted by Vietnam National Assembly to give you firm ground when negotiating."
                : "Các quy định pháp luật rõ ràng từ Nhà nước giúp bạn có căn cứ vững chắc khi trao đổi với chủ nhà hoặc người tuyển dụng:"}
            </p>
          </div>
        </div>

        {/* 4 Statute Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LEGAL_SOURCES.map((source) => (
            <div
              key={source.id}
              onClick={() => onSelectSource(source)}
              className="group cursor-pointer bg-white dark:bg-[#0D1829] rounded-2xl border-2 border-[#E3D8C3] dark:border-[#1E3456] p-6 shadow-xs hover:border-[#8A6731] dark:hover:border-[#EAD7B8] hover:shadow-xl transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 text-left"
            >
              <div>
                {/* Top Code Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF5ED] dark:bg-[#162744] border border-[#E0D5BE] dark:border-[#274068] flex items-center justify-center text-[#8A6731] dark:text-[#EAD7B8]">
                    <BookOpen className="w-5 h-5" />
                  </div>

                  <span className="px-2.5 py-1 rounded-md bg-[#FAF5ED] dark:bg-[#15233C] text-[11px] font-black text-[#8A6731] dark:text-[#EAD7B8] border border-[#E8DEC7] dark:border-[#20375C]">
                    {source.codeBadge || "CHÍNH THỐNG"}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="text-base font-black text-[#0F1E36] dark:text-white mb-2 group-hover:text-[#8A6731] dark:group-hover:text-[#EAD7B8] transition-colors">
                  {source.title}
                </h3>
                <p className="text-xs text-[#465A75] dark:text-[#9FB3CF] font-medium leading-relaxed mb-4 line-clamp-3">
                  {source.description}
                </p>

                {/* Articles preview */}
                <div className="space-y-1.5 mb-5">
                  {source.articles.slice(0, 2).map((art, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] font-semibold text-[#1E324F] dark:text-[#CAD8ED] flex items-start gap-1.5 line-clamp-1"
                    >
                      <span className="text-[#8A6731] dark:text-[#EAD7B8]">•</span>
                      <span className="truncate">{art}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="pt-3.5 border-t border-[#EFE8D8] dark:border-[#1A2D49] flex items-center justify-between text-xs font-bold text-[#8A6731] dark:text-[#EAD7B8] group-hover:underline">
                <span>{source.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
