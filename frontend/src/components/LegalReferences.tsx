import React from 'react';
import { LEGAL_SOURCES } from '../data/legalReferences';
import { LegalSource } from '../types';
import { Scale, Home, CloudUpload, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface LegalReferencesProps {
  onSelectSource: (source: LegalSource) => void;
  onOpenChecker: () => void;
}

const getSourceIcon = (type: string) => {
  switch (type) {
    case 'labor':
      return <Scale className="w-6 h-6 text-[#8a6834]" />;
    case 'housing':
      return <Home className="w-6 h-6 text-[#159f7b]" />;
    case 'storage':
      return <CloudUpload className="w-6 h-6 text-[#7652cc]" />;
    default:
      return <Scale className="w-6 h-6 text-[#8a6834]" />;
  }
};

const getSourceBadgeBg = (type: string) => {
  switch (type) {
    case 'labor':
      return 'bg-[#FAF5ED] border-[#EAD7B8]/70';
    case 'housing':
      return 'bg-[#eafbf7] border-[#b7f6e5]';
    case 'storage':
      return 'bg-[#f3eeff] border-[#d8cbf5]';
    default:
      return 'bg-[#FAF5ED] border-[#EAD7B8]/70';
  }
};

export const LegalReferences: React.FC<LegalReferencesProps> = ({ onSelectSource, onOpenChecker }) => {
  return (
    <section id="sources-section" className="py-16 sm:py-24 bg-white border-t border-[#d8e3ef]/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8a6834] mb-2">
            DẪN CHỨNG MINH BẠCH
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#10253f] tracking-tight mb-3">
            Mỗi cảnh báo đều có điểm tựa để bạn tự kiểm chứng.
          </h2>
          <p className="text-base text-[#49627d]">
            Thay vì chỉ nhận một câu trả lời, bạn được dẫn đến các nguồn thông tin chính thống liên quan để đọc thêm và đối chiếu.
          </p>
        </div>

        {/* 3 Source Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LEGAL_SOURCES.map((source, idx) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              onClick={() => {
                if (source.iconType === 'storage') {
                  onOpenChecker();
                } else {
                  onSelectSource(source);
                }
              }}
              className="group cursor-pointer bg-[#f7fafc] rounded-2xl border border-[#d8e3ef] p-6 sm:p-7 flex flex-col justify-between hover:bg-white hover:border-[#EAD7B8] hover:shadow-lg transition-all"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 ${getSourceBadgeBg(source.iconType)}`}>
                  {getSourceIcon(source.iconType)}
                </div>

                <h3 className="text-lg font-bold text-[#10253f] mb-3 group-hover:text-[#8a6834] transition-colors leading-snug">
                  {source.title}
                </h3>

                <p className="text-sm text-[#49627d] leading-relaxed mb-6">
                  {source.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#e6edf4] flex items-center justify-between text-xs font-semibold text-[#8a6834]">
                <span>{source.iconType === 'storage' ? 'Tải lên & Quét ngay' : 'Xem các điều luật'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
