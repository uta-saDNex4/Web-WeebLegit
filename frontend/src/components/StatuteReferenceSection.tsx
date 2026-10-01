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
      className="py-12 sm:py-16 border-t border-[#E6DEC8] dark:border-[#1A2D49] relative scroll-mt-24"
    >
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 text-left">
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
                ? "Official provisions enacted by the State to give you firm ground when negotiating. Click any article or portal button to view the original statutory text directly on the National Legal Database (continuously expanding)."
                : "Các quy định pháp luật rõ ràng từ Nhà nước giúp bạn có căn cứ vững chắc khi trao đổi. Bạn có thể bấm trực tiếp vào từng điều khoản hoặc nút Cổng VBQPPL Quốc gia để xem toàn văn trên trang Nhà nước (danh mục luật đang tiếp tục mở rộng):"}
            </p>
          </div>

          <a
            href="https://vbpl.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#15233C] hover:bg-[#EAD7B8]/30 dark:hover:bg-[#1E3456] border border-[#D6C5A2] dark:border-[#274068] text-xs font-black text-[#8A6731] dark:text-[#EAD7B8] shrink-0 transition-all shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>
              {lang === "EN"
                ? "National Legal Portal (vbpl.vn)"
                : "Cổng Cơ Sở Dữ Liệu Luật Quốc Gia (vbpl.vn)"}
            </span>
          </a>
        </div>

        {/* Statute Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* Articles preview with direct State Portal jump links */}
                <div className="space-y-2 mb-5">
                  {(source.articleLinks || source.articles.map((text) => ({ text, url: source.url || "#", govUrl: source.govUrl }))).slice(0, 3).map((art, idx) => (
                    <a
                      key={idx}
                      href={art.govUrl || art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Bấm để xem trực tiếp điều khoản trên Cổng Pháp luật Nhà nước (vbpl.vn)"
                      className="group/art p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#122038] hover:bg-[#FAF5ED] dark:hover:bg-[#182B49] border border-transparent hover:border-[#D6C5A2] dark:hover:border-[#2B4670] text-[11px] font-semibold text-[#1E324F] dark:text-[#CAD8ED] flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="flex items-start gap-1.5 min-w-0">
                        <span className="text-[#8A6731] dark:text-[#EAD7B8] shrink-0">•</span>
                        <span className="truncate group-hover/art:text-[#8A6731] dark:group-hover/art:text-[#EAD7B8] group-hover/art:underline">
                          {art.text}
                        </span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-[#8A6731] dark:text-[#EAD7B8] shrink-0 opacity-70 group-hover/art:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions: Modal Summary + Direct State Portal Link */}
              <div className="pt-3.5 border-t border-[#EFE8D8] dark:border-[#1A2D49] flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSource(source);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0F1E36] dark:text-[#CAD8ED] hover:text-[#8A6731] dark:hover:text-[#EAD7B8] cursor-pointer"
                >
                  <span>{lang === "EN" ? "View Summary" : source.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {(source.govUrl || source.url) && (
                  <a
                    href={source.govUrl || source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0F223D] hover:bg-[#162E52] text-[#EAD7B8] border border-[#EAD7B8]/50 text-[11px] font-bold shadow-2xs transition-all hover:scale-102"
                    title="Mở trực tiếp văn bản gốc trên Cổng thông tin Pháp luật Quốc gia (vbpl.vn)"
                  >
                    <span>{lang === "EN" ? "State Portal (vbpl.vn)" : "Trang Nhà nước (vbpl.vn)"}</span>
                    <ExternalLink className="w-3 h-3 text-[#EAD7B8]" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
