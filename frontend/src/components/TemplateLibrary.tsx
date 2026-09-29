import React, { useMemo, useState } from 'react';
import { CONTRACT_TEMPLATES } from '../data/contractTemplates';
import { ContractTemplate } from '../types';
import {
  Briefcase,
  GraduationCap,
  Palette,
  Home,
  BookOpen,
  CreditCard,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Link2,
} from 'lucide-react';
import { motion } from 'motion/react';

interface TemplateLibraryProps {
  onSelectTemplate: (template: ContractTemplate) => void;
}

const getTemplateIcon = (category: string) => {
  switch (category) {
    case 'work':
      return <Briefcase className="w-5 h-5 text-[#8a6834]" />;
    case 'internship':
      return <GraduationCap className="w-5 h-5 text-[#159f7b]" />;
    case 'freelance':
      return <Palette className="w-5 h-5 text-[#7652cc]" />;
    case 'housing':
      return <Home className="w-5 h-5 text-[#d77714]" />;
    case 'education':
      return <BookOpen className="w-5 h-5 text-[#2563eb]" />;
    case 'finance':
      return <CreditCard className="w-5 h-5 text-[#e4534b]" />;
    default:
      return <Briefcase className="w-5 h-5 text-[#8a6834]" />;
  }
};

const getCategoryBg = (category: string) => {
  switch (category) {
    case 'work':
      return 'bg-[#FAF5ED] border-[#EAD7B8]/70';
    case 'internship':
      return 'bg-[#eafbf7] border-[#b7f6e5]';
    case 'freelance':
      return 'bg-[#f3eeff] border-[#d8cbf5]';
    case 'housing':
      return 'bg-[#fff4e6] border-[#ffd8a8]';
    case 'education':
      return 'bg-[#eff6ff] border-[#bfdbfe]';
    case 'finance':
      return 'bg-[#fff1f0] border-[#ffd1cc]';
    default:
      return 'bg-[#FAF5ED] border-[#EAD7B8]/70';
  }
};

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const filteredTemplates = useMemo(() => {
    if (selectedCat === 'all') return CONTRACT_TEMPLATES;
    return CONTRACT_TEMPLATES.filter((t) => t.category === selectedCat);
  }, [selectedCat]);

  return (
    <section id="templates-section" className="py-16 sm:py-24 border-t border-[#d8e3ef]/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8a6834] mb-2">
              THƯ VIỆN MẪU HỢP ĐỒNG &amp; NGUỒN PHÁP LÝ
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#10253f] tracking-tight mb-3">
              6 nhóm hợp đồng sinh viên gặp nhiều nhất.
            </h2>
            <p className="text-base text-[#49627d]">
              Mỗi mẫu đều đính kèm liên kết văn bản gốc trên Thư viện Pháp luật / Cổng Chính phủ và gắn link điều luật cho từng điều khoản.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tất cả (6)' },
              { id: 'housing', label: 'Thuê trọ & Chung cư' },
              { id: 'work', label: 'Làm thêm' },
              { id: 'internship', label: 'Thực tập' },
              { id: 'freelance', label: 'CTV / Freelance' },
              { id: 'education', label: 'Khóa học' },
              { id: 'finance', label: 'Vay & Trả góp' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCat === cat.id
                    ? 'bg-[#10253f] text-white shadow-sm'
                    : 'bg-white text-[#49627d] hover:bg-[#FAF5ED] border border-[#d8e3ef]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bento-inspired Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tmpl, idx) => (
            <motion.div
              key={tmpl.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.07 }}
              onClick={() => onSelectTemplate(tmpl)}
              className={`group cursor-pointer bg-white rounded-2xl border p-6 shadow-sm transition-all hover:border-[#EAD7B8] hover:shadow-lg hover:shadow-[#113d64]/8 flex flex-col justify-between ${
                tmpl.featured ? 'border-[#EAD7B8] ring-1 ring-[#EAD7B8]/40' : 'border-[#d8e3ef]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${getCategoryBg(tmpl.category)}`}>
                    {getTemplateIcon(tmpl.category)}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {tmpl.sourceUrls && tmpl.sourceUrls.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8a6834] bg-[#FAF5ED] border border-[#EAD7B8]/70 px-2.5 py-1 rounded-full">
                        <Link2 className="w-3 h-3" />
                        <span>{tmpl.sourceUrls.length} văn bản gốc</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#bf3b35] bg-[#fff1f0] border border-[#ffd1cc] px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      <span>{tmpl.riskCount} bẫy lưu ý</span>
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#10253f] mb-1.5 group-hover:text-[#8a6834] transition-colors">
                  {tmpl.title}
                </h3>

                <p className="text-xs font-semibold text-[#49627d] mb-2.5">
                  {tmpl.subtitle}
                </p>

                <p className="text-xs text-[#8297ac] line-clamp-2 leading-relaxed mb-4">
                  {tmpl.description}
                </p>

                {/* Quick External Source Links on Card */}
                {tmpl.sourceUrls && tmpl.sourceUrls.length > 0 && (
                  <div
                    className="mb-4 p-2.5 rounded-xl bg-[#f8fafd] border border-[#e6edf4] space-y-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-[10px] font-bold text-[#8297ac] uppercase tracking-wider">
                      Link văn bản gốc tham khảo:
                    </div>
                    {tmpl.sourceUrls.slice(0, 2).map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-1.5 text-[11px] font-semibold text-[#10253f] hover:text-[#8a6834] transition-colors truncate"
                      >
                        <span className="truncate">• {src.title}</span>
                        <ExternalLink className="w-3 h-3 text-[#8a6834] shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags & Action */}
              <div className="pt-3.5 border-t border-[#e6edf4] flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {tmpl.tags.slice(0, 2).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[11px] font-medium text-[#49627d] bg-[#f2f7fc] px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#8a6834] group-hover:translate-x-1 transition-transform shrink-0">
                  <span>Xem điều khoản &amp; luật</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
