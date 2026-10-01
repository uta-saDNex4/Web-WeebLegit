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
  FileText,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/language-context';

interface TemplateLibraryProps {
  onSelectTemplate: (template: ContractTemplate) => void;
}

const getTemplateIcon = (category: string) => {
  switch (category) {
    case 'work':
      return <Briefcase className="w-5 h-5 text-[#8A6731] dark:text-[#EAD7B8]" />;
    case 'internship':
      return <GraduationCap className="w-5 h-5 text-[#159f7b] dark:text-emerald-400" />;
    case 'freelance':
      return <Palette className="w-5 h-5 text-[#7652cc] dark:text-purple-400" />;
    case 'housing':
      return <Home className="w-5 h-5 text-[#d77714] dark:text-amber-400" />;
    case 'education':
      return <BookOpen className="w-5 h-5 text-[#2563eb] dark:text-blue-400" />;
    case 'finance':
      return <CreditCard className="w-5 h-5 text-[#e4534b] dark:text-rose-400" />;
    default:
      return <Briefcase className="w-5 h-5 text-[#8A6731] dark:text-[#EAD7B8]" />;
  }
};

const getCategoryBg = (category: string) => {
  switch (category) {
    case 'work':
      return 'bg-[#FAF5ED] dark:bg-[#162744] border-[#E0D5BE] dark:border-[#274068]';
    case 'internship':
      return 'bg-[#eafbf7] dark:bg-emerald-950/40 border-[#b7f6e5] dark:border-emerald-800/60';
    case 'freelance':
      return 'bg-[#f3eeff] dark:bg-purple-950/40 border-[#d8cbf5] dark:border-purple-800/60';
    case 'housing':
      return 'bg-[#fff4e6] dark:bg-amber-950/40 border-[#ffd8a8] dark:border-amber-800/60';
    case 'education':
      return 'bg-[#eff6ff] dark:bg-blue-950/40 border-[#bfdbfe] dark:border-blue-800/60';
    case 'finance':
      return 'bg-[#fff1f0] dark:bg-rose-950/40 border-[#ffd1cc] dark:border-rose-800/60';
    default:
      return 'bg-[#FAF5ED] dark:bg-[#162744] border-[#E0D5BE] dark:border-[#274068]';
  }
};

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const { lang } = useLanguage();
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const filteredTemplates = useMemo(() => {
    if (selectedCat === 'all') return CONTRACT_TEMPLATES;
    return CONTRACT_TEMPLATES.filter((t) => t.category === selectedCat);
  }, [selectedCat]);

  const categories = [
    { id: 'all', label: lang === 'EN' ? 'All Categories' : 'Tất cả danh mục' },
    { id: 'housing', label: lang === 'EN' ? 'Rent & Housing' : 'Thuê trọ & Chung cư' },
    { id: 'work', label: lang === 'EN' ? 'Part-time / Work' : 'Làm thêm & Lao động' },
    { id: 'internship', label: lang === 'EN' ? 'Internship' : 'Thực tập' },
    { id: 'freelance', label: lang === 'EN' ? 'Freelance / CTV' : 'CTV / Freelance' },
    { id: 'education', label: lang === 'EN' ? 'Courses & Training' : 'Khóa học & Đào tạo' },
    { id: 'finance', label: lang === 'EN' ? 'Loans & Installments' : 'Vay & Trả góp' },
  ];

  return (
    <section
      id="templates-section"
      className="py-12 sm:py-16 border-t border-[#E6DEC8] dark:border-[#1A2D49] relative scroll-mt-24 transition-colors"
    >
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 text-left">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF5ED] dark:bg-[#15233C] border border-[#D6C5A2] dark:border-[#22395D] text-xs font-black text-[#8A6731] dark:text-[#EAD7B8] uppercase tracking-wider mb-2.5">
              <FileText className="w-3.5 h-3.5 text-[#8A6731] dark:text-[#EAD7B8]" />
              <span>
                {lang === 'EN'
                  ? 'CONTRACT TEMPLATE LIBRARY'
                  : 'THƯ VIỆN HỢP ĐỒNG MẪU & NGUỒN PHÁP LÝ'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F1E36] dark:text-white tracking-tight mb-2.5">
              {lang === 'EN'
                ? 'Reference Contract Templates & Clauses'
                : 'Thư Viện Hợp Đồng Mẫu Tham Chiếu'}
            </h2>

            <p className="text-sm sm:text-base text-[#465A75] dark:text-[#9FB3CF] font-medium leading-relaxed">
              {lang === 'EN'
                ? 'Explore standard contract templates attached with direct source links and statutory references for each clause. Continuously updated and expanding to cover new transaction types.'
                : 'Mỗi mẫu hợp đồng đều đính kèm liên kết văn bản gốc trên cổng pháp luật chính thống, hỗ trợ tải về và gắn link điều luật cụ thể cho từng điều khoản. Danh mục đang tiếp tục được cập nhật và mở rộng.'}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCat === cat.id
                    ? 'bg-[#0F223D] dark:bg-[#EAD7B8] text-[#EAD7B8] dark:text-[#0F1E36] border border-[#EAD7B8] shadow-xs'
                    : 'bg-white dark:bg-[#0D1829] text-[#465A75] dark:text-[#9FB3CF] hover:bg-[#FAF5ED] dark:hover:bg-[#162744] border border-[#E3D8C3] dark:border-[#1E3456]'
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
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              onClick={() => onSelectTemplate(tmpl)}
              className={`group cursor-pointer bg-white dark:bg-[#0D1829] rounded-2xl border-2 p-6 shadow-xs transition-all duration-200 hover:border-[#8A6731] dark:hover:border-[#EAD7B8] hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between text-left ${
                tmpl.featured
                  ? 'border-[#D6C5A2] dark:border-[#2C4875] ring-1 ring-[#EAD7B8]/30'
                  : 'border-[#E3D8C3] dark:border-[#1E3456]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border ${getCategoryBg(
                      tmpl.category
                    )}`}
                  >
                    {getTemplateIcon(tmpl.category)}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {tmpl.sourceUrls && tmpl.sourceUrls.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A6731] dark:text-[#EAD7B8] bg-[#FAF5ED] dark:bg-[#15233C] border border-[#E8DEC7] dark:border-[#20375C] px-2.5 py-1 rounded-full">
                        <Link2 className="w-3 h-3" />
                        <span>
                          {tmpl.sourceUrls.length}{' '}
                          {lang === 'EN' ? 'official sources' : 'văn bản gốc'}
                        </span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#bf3b35] dark:text-rose-300 bg-[#fff1f0] dark:bg-rose-950/50 border border-[#ffd1cc] dark:border-rose-800/60 px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      <span>
                        {tmpl.riskCount}{' '}
                        {lang === 'EN' ? 'key checkpoints' : 'điểm cần lưu ý'}
                      </span>
                    </span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-black text-[#0F1E36] dark:text-white mb-1.5 group-hover:text-[#8A6731] dark:group-hover:text-[#EAD7B8] transition-colors">
                  {tmpl.title}
                </h3>

                <p className="text-xs font-bold text-[#465A75] dark:text-[#9FB3CF] mb-2.5">
                  {tmpl.subtitle}
                </p>

                <p className="text-xs text-[#65778F] dark:text-[#8FA3BF] line-clamp-2 leading-relaxed mb-4">
                  {tmpl.description}
                </p>

                {/* Quick External Source Links on Card */}
                {tmpl.sourceUrls && tmpl.sourceUrls.length > 0 && (
                  <div
                    className="mb-4 p-2.5 rounded-xl bg-[#FAF6EF] dark:bg-[#122038] border border-[#E6DEC8] dark:border-[#1E3456] space-y-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-[10px] font-bold text-[#8A6731] dark:text-[#EAD7B8] uppercase tracking-wider">
                      {lang === 'EN'
                        ? 'Direct Official Document Links:'
                        : 'Link văn bản gốc tham khảo:'}
                    </div>
                    {tmpl.sourceUrls.slice(0, 2).map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-1.5 text-[11px] font-semibold text-[#0F1E36] dark:text-[#CAD8ED] hover:text-[#8A6731] dark:hover:text-[#EAD7B8] transition-colors truncate"
                      >
                        <span className="truncate">• {src.title}</span>
                        <ExternalLink className="w-3 h-3 text-[#8A6731] dark:text-[#EAD7B8] shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags & Action */}
              <div className="pt-3.5 border-t border-[#EFE8D8] dark:border-[#1A2D49] flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {tmpl.tags.slice(0, 2).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[11px] font-semibold text-[#465A75] dark:text-[#9FB3CF] bg-[#F2F6FA] dark:bg-[#152540] px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#8A6731] dark:text-[#EAD7B8] group-hover:translate-x-1 transition-transform shrink-0">
                  <span>{lang === 'EN' ? 'View Sample & Laws' : 'Xem mẫu & điều luật'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Continuous Expansion Note */}
        <div className="mt-8 p-4 rounded-2xl bg-[#FAF5ED]/80 dark:bg-[#0D1829] border border-[#E6DEC8] dark:border-[#1E3456] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#465A75] dark:text-[#9FB3CF]">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="w-4 h-4 text-[#8A6731] dark:text-[#EAD7B8] shrink-0" />
            <span>
              {lang === 'EN'
                ? 'Our template repository and statutory clause mappings are continuously updated and expanding to support diverse contract types.'
                : 'Kho dữ liệu hợp đồng mẫu và hệ thống điều khoản tham chiếu đang tiếp tục được cập nhật, mở rộng cho nhiều lĩnh vực giao dịch mới.'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#8A6731] dark:text-[#EAD7B8] shrink-0">
            {lang === 'EN' ? 'Continuously Expanding' : 'Liên tục cập nhật & mở rộng'}
          </span>
        </div>
      </div>
    </section>
  );
};
