import React from 'react';
import { UploadCloud, Sparkles, BookCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface VerificationProcessProps {
  onStartProcess: () => void;
}

export const VerificationProcess: React.FC<VerificationProcessProps> = ({ onStartProcess }) => {
  const steps = [
    {
      number: '01',
      title: 'Tải lên hoặc bắt đầu từ mẫu',
      description: 'Chọn tài liệu có sẵn hoặc thêm biểu mẫu mới của bạn vào thư viện cá nhân.',
      icon: <UploadCloud className="w-6 h-6 text-[#8a6834]" />,
      badgeColor: 'bg-[#FAF5ED] text-[#8a6834] border-[#EAD7B8]/60'
    },
    {
      number: '02',
      title: 'AI chỉ ra các điểm cần hỏi',
      description: 'Nhận giải thích dễ hiểu về lương, thời hạn, bảo mật, phạt vi phạm và quyền lợi.',
      icon: <Sparkles className="w-6 h-6 text-[#159f7b]" />,
      badgeColor: 'bg-[#eafbf7] text-[#159f7b] border-[#b7f6e5]'
    },
    {
      number: '03',
      title: 'Đối chiếu nguồn đáng tin cậy',
      description: 'Mở nhanh các liên kết luật, nghị định và hướng dẫn chính thức liên quan đến điều khoản.',
      icon: <BookCheck className="w-6 h-6 text-[#7652cc]" />,
      badgeColor: 'bg-[#f3eeff] text-[#7652cc] border-[#d8cbf5]'
    }
  ];

  return (
    <section id="process-section" className="py-16 sm:py-24 bg-white border-y border-[#d8e3ef]/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8a6834] mb-2">
            TỪ BẢN NHÁP ĐẾN TỰ TIN KÝ
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#10253f] tracking-tight mb-3">
            Một quy trình ngắn. Một lớp bảo vệ rõ ràng.
          </h2>
          <p className="text-base text-[#49627d]">
            Mỗi bước đều giúp bạn thấy điều khoản nào ổn, điều khoản nào cần trao đổi thêm.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="bg-[#f7fafc] rounded-2xl border border-[#d8e3ef] p-6 sm:p-7 flex flex-col justify-between relative hover:border-[#EAD7B8] transition-all hover:bg-white hover:shadow-md"
            >
              <div>
                {/* Step number and icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black tracking-tight text-[#b9cadd]">
                    {step.number}
                  </span>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.badgeColor}`}>
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#10253f] mb-3 leading-snug">
                  {step.title}
                </h3>

                <p className="text-sm text-[#49627d] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Bottom decorative indicator */}
              <div className="pt-6 mt-4 border-t border-[#e6edf4]/80 flex items-center justify-between text-xs font-semibold text-[#8297ac]">
                <span>Bước {idx + 1} của 3</span>
                <span className="w-2 h-2 rounded-full bg-[#EAD7B8]"></span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
