import React from 'react';
import { LegalSource } from '../types';
import { X, Scale, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface LegalDetailsModalProps {
  source: LegalSource | null;
  onClose: () => void;
}

export const LegalDetailsModal: React.FC<LegalDetailsModalProps> = ({ source, onClose }) => {
  if (!source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl border border-[#d8e3ef] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6edf4] flex items-center justify-between bg-[#f8fafd]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f]">
              <Scale className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#10253f]">{source.title}</h3>
              <p className="text-xs text-[#8297ac]">Nguồn pháp lý & Dẫn chứng tham khảo chính thống</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8297ac] hover:text-[#10253f] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <p className="text-sm text-[#49627d] leading-relaxed">
            {source.description}
          </p>

          <h4 className="text-xs font-bold text-[#8297ac] uppercase tracking-wider pt-2">
            Các quy định & điều luật trọng tâm:
          </h4>

          <div className="space-y-3">
            {source.articles.map((art, idx) => (
              <div key={idx} className="p-3.5 bg-[#f8fafd] rounded-xl border border-[#e6edf4] text-xs text-[#10253f] leading-relaxed flex gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#8a6834] shrink-0 mt-0.5" />
                <span>{art}</span>
              </div>
            ))}
          </div>

          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl bg-[#FAF5ED] hover:bg-[#faeedd] border border-[#EAD7B8] text-xs text-[#8a6834] flex items-center justify-between mt-4 transition-all shadow-sm group cursor-pointer"
          >
            <span className="font-semibold group-hover:underline flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {source.linkText}
            </span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#f8fafd] border-t border-[#e6edf4] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#10253f] hover:bg-[#173d5a] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
