import React, { useState } from 'react';
import { CONTRACT_TEMPLATES } from '../data/contractTemplates';
import { ContractTemplate } from '../types';
import {
  Briefcase,
  GraduationCap,
  Home,
  ArrowRight,
  AlertCircle,
  BookOpen,
  CreditCard,
  Landmark,
  Building,
  ExternalLink,
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
    case 'housing':
      return <Home className="w-5 h-5 text-[#d77714]" />;
    case 'course':
      return <BookOpen className="w-5 h-5 text-[#2563eb]" />;
    case 'installment':
      return <CreditCard className="w-5 h-5 text-[#7c3aed]" />;
    case 'loan':
      return <Landmark className="w-5 h-5 text-[#b91c1c]" />;
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
    case 'housing':
      return 'bg-[#fff4e6] border-[#ffd8a8]';
    case 'course':
      return 'bg-[#eff6ff] border-[#bfdbfe]';
    case 'installment':
      return 'bg-[#f5f3ff] border-[#ddd6fe]';
    case 'loan':
      return 'bg-[#fef2f2] border-[#fecaca]';
    default:
      return 'bg-[#FAF5ED] border-[#EAD7B8]/70';
  }
};

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả 7 mẫu' },
    { id: 'work', label: 'Làm thêm & CTV' },
    { id: 'internship', label: 'Thực tập sinh' },
    { id: 'housing', label: 'Thuê trọ & Căn hộ' },
    { id: 'course', label: 'Khóa học kỹ năng' },
    { id: 'financial', label: 'Trả góp & Vay tiêu dùng' },
  ];

  const filteredTemplates = CONTRACT_TEMPLATES.filter((tmpl) => {
    if (selectedCat === 'all') return true;
    if (selectedCat === 'financial') return tmpl.category === 'installment' || tmpl.category === 'loan';
    return tmpl.category === selectedCat;
  });

  return (
    <section id="templates-section" className="py-16 sm:py-24 border-t border-[#d8e3ef]/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8a6834] mb-2">
              THƯ VIỆN BẮT ĐẦU CHUẨN LUẬT
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#10253f] tracking-tight mb-3">
              Bảy tình huống hợp đồng sinh viên hay ký nhất.
            </h2>
            <p className="text-base text-[#49627d]">
              Mỗi mẫu đều liên kết trực tiếp tới văn bản nguồn của Cổng Thư viện Pháp luật, sẵn sàng để AI đối chiếu bẫy điều khoản.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCat === cat.id
                  ? 'bg-[#10253f] text-white shadow-sm'
                  : 'bg-white text-[#49627d] border border-[#d8e3ef] hover:border-[#EAD7B8] hover:text-[#10253f]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tmpl, idx) => (
            <motion.div
              key={tmpl.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              onClick={() => onSelectTemplate(tmpl)}
              className="group cursor-pointer bg-white rounded-2xl border border-[#d8e3ef] p-5 sm:p-6 shadow-sm transition-all hover:border-[#EAD7B8] hover:shadow-lg hover:shadow-[#113d64]/8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getCategoryBg(tmpl.category)}`}>
                    {getTemplateIcon(tmpl.category)}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#bf3b35] bg-[#fff1f0] border border-[#ffd1cc] px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{tmpl.riskCount} điểm bẫy</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#10253f] mb-1.5 group-hover:text-[#8a6834] transition-colors line-clamp-1">
                  {tmpl.title}
                </h3>
                
                <p className="text-xs font-semibold text-[#8a6834] mb-3">
                  {tmpl.subtitle}
                </p>

                <p className="text-xs text-[#8297ac] line-clamp-2 leading-relaxed mb-4">
                  {tmpl.description}
                </p>
              </div>

              {/* Tags & Action */}
              <div className="pt-3 border-t border-[#e6edf4] flex flex-col gap-2.5">
                <div className="flex flex-wrap gap-1">
                  {tmpl.tags.slice(0, 2).map((tag, tIdx) => (
                    <span 
                      key={tIdx}
                      className="text-[10px] font-medium text-[#49627d] bg-[#f2f7fc] px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-semibold text-[#8a6834]">
                  <span className="group-hover:underline flex items-center gap-1">
                    Xem & Quét thử <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {tmpl.officialUrl && (
                    <span className="text-[10px] text-[#8297ac] flex items-center gap-0.5">
                      Nguồn chuẩn <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
