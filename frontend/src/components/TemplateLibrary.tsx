import React from 'react';
import { CONTRACT_TEMPLATES } from '../data/contractTemplates';
import { ContractTemplate } from '../types';
import { Briefcase, GraduationCap, Palette, Home, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
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
    default:
      return 'bg-[#FAF5ED] border-[#EAD7B8]/70';
  }
};

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  return (
    <section id="templates-section" className="py-16 sm:py-24 border-t border-[#d8e3ef]/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8a6834] mb-2">
            THƯ VIỆN BẮT ĐẦU
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#10253f] tracking-tight mb-3">
            Bốn tình huống sinh viên gặp nhiều nhất.
          </h2>
          <p className="text-base text-[#49627d]">
            Chọn một mẫu, thêm điều khoản của bạn và để AI cùng kiểm tra.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CONTRACT_TEMPLATES.map((tmpl, idx) => (
            <motion.div
              key={tmpl.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={() => onSelectTemplate(tmpl)}
              className="group cursor-pointer bg-white rounded-2xl border border-[#d8e3ef] p-6 sm:p-7 shadow-sm transition-all hover:border-[#EAD7B8] hover:shadow-lg hover:shadow-[#113d64]/8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${getCategoryBg(tmpl.category)}`}>
                    {getTemplateIcon(tmpl.category)}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#bf3b35] bg-[#fff1f0] border border-[#ffd1cc] px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{tmpl.riskCount} điểm lưu ý</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#10253f] mb-2 group-hover:text-[#8a6834] transition-colors">
                  {tmpl.title}
                </h3>
                
                <p className="text-sm font-medium text-[#49627d] mb-4">
                  {tmpl.subtitle}
                </p>

                <p className="text-xs text-[#8297ac] line-clamp-2 leading-relaxed mb-6">
                  {tmpl.description}
                </p>
              </div>

              {/* Tags & Action */}
              <div className="pt-4 border-t border-[#e6edf4] flex items-center justify-between">
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

                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8a6834] group-hover:translate-x-1 transition-transform">
                  <span>Mở mẫu</span>
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
