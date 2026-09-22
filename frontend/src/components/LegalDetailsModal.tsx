import React, { useEffect } from 'react';
import { LegalSource } from '../types';
import { Scale, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { motion } from 'motion/react';

interface LegalDetailsModalProps {
  source: LegalSource | null;
  onClose: () => void;
}

export const LegalDetailsModal: React.FC<LegalDetailsModalProps> = ({ source, onClose }) => {
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
              <p className="text-xs text-[#8297ac] dark:text-[#8fa3bf]">Nguồn pháp lý & Dẫn chứng tham khảo chính thống</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8297ac] hover:text-[#10253f] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#12223c] transition-colors cursor-pointer"
            title="Đóng"
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
            Các quy định & điều luật trọng tâm:
          </h4>

          <div className="space-y-3">
            {source.articles.map((art, idx) => (
              <div key={idx} className="p-3.5 bg-[#f8fafd] dark:bg-[#0e192c] rounded-xl border border-[#e6edf4] dark:border-[#1a2d4b] text-xs text-[#10253f] dark:text-[#e2e8f0] leading-relaxed flex gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#8a6834] dark:text-[#EAD7B8] shrink-0 mt-0.5" />
                <span>{art}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#FAF5ED] dark:bg-[#12223c] border border-[#EAD7B8]/70 dark:border-[#1f3557] text-xs text-[#8a6834] dark:text-[#EAD7B8] flex items-center justify-between mt-4">
            <span className="font-semibold">{source.linkText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Footer — Xóa nút Đóng */}
        <div className="px-6 py-3.5 bg-[#f8fafd] dark:bg-[#0f1b2f] border-t border-[#e6edf4] dark:border-[#1a2d4b] flex items-center justify-between">
          <span className="text-xs text-[#8297ac] dark:text-[#8fa3bf]">
            Dẫn chứng chuẩn hóa • WeebLegit (Bấm Esc hoặc nhấp ra ngoài để thoát)
          </span>
        </div>
      </motion.div>
    </div>
  );
};
