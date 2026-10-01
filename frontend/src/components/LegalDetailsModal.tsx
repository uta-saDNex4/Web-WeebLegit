import React, { useEffect } from 'react';
import { LegalSource } from '../types';
import { Scale, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/language-context';

interface LegalDetailsModalProps {
  source: LegalSource | null;
  onClose: () => void;
}

export const LegalDetailsModal: React.FC<LegalDetailsModalProps> = ({ source, onClose }) => {
  const { lang } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!source) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto cursor-pointer"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="cursor-default bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6edf4] dark:border-[#1a2d4b] flex items-center justify-between bg-[#f8fafd] dark:bg-[#0f1b2f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f]">
              <Scale className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#10253f] dark:text-white">{source.title}</h3>
              <p className="text-xs text-[#8297ac] dark:text-[#8fa3bf]">
                {lang === 'EN'
                  ? 'Official Statutory Source & Legal Reference'
                  : 'Nguồn pháp lý & Dẫn chứng tham khảo chính thống'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8297ac] hover:text-[#10253f] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#12223c] transition-colors cursor-pointer"
            title={lang === 'EN' ? 'Close' : 'Đóng'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <p className="text-sm text-[#49627d] dark:text-[#c4d5ea] leading-relaxed">
            {source.description}
          </p>

          <h4 className="text-xs font-bold text-[#8297ac] dark:text-[#8fa3bf] uppercase tracking-wider pt-2">
            {lang === 'EN'
              ? 'Key Statutory Articles & Provisions (Click to view directly):'
              : 'Các quy định & điều luật trọng tâm (Bấm để xem trực tiếp điều khoản):'}
          </h4>

          <div className="space-y-3">
            {(
              source.articleLinks ||
              source.articles.map((text) => ({
                text,
                url: source.url || "#",
                govUrl: source.govUrl,
              }))
            ).map((art, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#f8fafd] dark:bg-[#0e192c] rounded-xl border border-[#e6edf4] dark:border-[#1a2d4b] text-xs text-[#10253f] dark:text-[#e2e8f0] leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8] shrink-0 mt-0.5" />
                  <span>{art.text}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-6 sm:pl-0">
                  {art.govUrl && (
                    <a
                      href={art.govUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F223D] hover:bg-[#162E52] text-[#EAD7B8] border border-[#EAD7B8]/40 text-[11px] font-bold transition-all"
                      title={
                        lang === 'EN'
                          ? 'View article on National Legal Database (vbpl.vn)'
                          : 'Xem điều khoản trên Cổng dữ liệu Pháp luật Quốc gia (vbpl.vn)'
                      }
                    >
                      <span>{lang === 'EN' ? 'Gov Portal' : 'Cổng Nhà nước'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {art.url && (
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF5ED] dark:bg-[#162744] hover:bg-[#EAD7B8]/30 text-[#8a6834] dark:text-[#EAD7B8] border border-[#D6C5A2] dark:border-[#274068] text-[11px] font-bold transition-all"
                      title={lang === 'EN' ? 'Look up on Thư viện Pháp luật' : 'Tra cứu văn bản trên Thư viện Pháp luật'}
                    >
                      <span>{lang === 'EN' ? 'Quick Lookup' : 'Tra cứu nhanh'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {source.govUrl && (
              <a
                href={source.govUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-3 rounded-xl bg-[#0F223D] hover:bg-[#162E52] border border-[#EAD7B8]/60 text-xs text-[#EAD7B8] flex items-center justify-between transition-all group cursor-pointer shadow-xs"
              >
                <span className="font-bold group-hover:underline">
                  {lang === 'EN'
                    ? 'Full Text on National Legal Portal (vbpl.vn)'
                    : 'Toàn văn trên Cổng VBQPPL Nhà nước (vbpl.vn)'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-3 rounded-xl bg-[#FAF5ED] dark:bg-[#12223c] border border-[#EAD7B8]/70 dark:border-[#1f3557] hover:border-[#8a6834] dark:hover:border-[#EAD7B8] hover:bg-[#EAD7B8]/20 dark:hover:bg-[#1a2f50] text-xs text-[#8a6834] dark:text-[#EAD7B8] flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
              >
                <span className="font-bold group-hover:underline">
                  {lang === 'EN' ? `Browse Index (${source.title})` : `Tra cứu mục lục (${source.title})`}
                </span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#f8fafd] dark:bg-[#0f1b2f] border-t border-[#e6edf4] dark:border-[#1a2d4b] flex items-center justify-between">
          <span className="text-xs text-[#8297ac] dark:text-[#8fa3bf]">
            {lang === 'EN'
              ? 'Standardized Legal Citations • Direct links to National Legal Database'
              : 'Dẫn chứng chuẩn hóa • Liên kết trực tiếp Cơ sở dữ liệu Quốc gia về VBQPPL'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
