import React from "react";
import Image from "next/image";
import { ShieldCheck, Scale, Heart, Sparkles } from "lucide-react";
import { useLanguage } from "../lib/language-context";

interface FooterProps {
  onOpenNextjsCode: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenNextjsCode }) => {
  const { lang } = useLanguage();

  return (
    <footer className="bg-[#0A1526] dark:bg-[#060D18] text-[#9FB3CF] pt-14 pb-10 border-t border-[#1C3252]">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#1A2D49]">
          {/* Brand & Mission */}
          <div className="md:col-span-7 space-y-3.5 text-left">
            <div className="flex items-center gap-2.5">
              <Image
                src="/Logo WeebLegit.png"
                alt="WeebLegit Logo"
                width={130}
                height={130}
                className="h-10 w-auto object-contain"
              />
              <span className="text-xs font-black text-[#EAD7B8] px-2.5 py-0.5 rounded bg-[#EAD7B8]/10 border border-[#EAD7B8]/30 uppercase tracking-wider">
                LegalTech Vietnam
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#879DBB] max-w-lg leading-relaxed">
              {lang === "EN"
                ? "WeebLegit is a statutory verification platform designed to protect users across diverse civil, commercial, and service contracts from hidden pitfalls (continuously expanding)."
                : "WeebLegit giúp bạn kiểm tra nhanh đa dạng các loại hợp đồng và giao dịch, phát hiện ngay các điều khoản bất lợi và hướng dẫn bạn cách bảo vệ quyền lợi chính đáng (đang tiếp tục mở rộng)."}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-[#65778F]">
              <Scale className="w-3.5 h-3.5 text-[#EAD7B8]" />
              <span>
                {lang === "EN"
                  ? "Aligned with prevailing Vietnamese statutory codes & regulations (continuously expanding)"
                  : "Đối chiếu hệ thống văn bản pháp luật Việt Nam hiện hành (đang tiếp tục mở rộng)"}
              </span>
            </div>
          </div>

          {/* Commitment & Disclaimer */}
          <div className="md:col-span-5 space-y-2.5 text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              {lang === "EN" ? "Data Privacy & Integrity Policy" : "Chính Sách Bảo Mật & Toàn Vẹn Dữ Liệu"}
            </h4>
            <p className="text-xs text-[#879DBB] leading-relaxed">
              {lang === "EN"
                ? "Your contracts and personal data are strictly isolated under your authorized account. We never sell, share, or monetize your documents, and file integrity is preserved."
                : "Hợp đồng và thông tin tài khoản được quản lý phân quyền nghiêm ngặt, chỉ thuộc về bạn. WeebLegit cam kết không bán, không chia sẻ dữ liệu cho bên thứ ba, tính toàn vẹn của tệp được bảo toàn."}
            </p>
          </div>
        </div>

        {/* Current Orientation & Scope Note (Focused on Students & Current Contract Categories) */}
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-[#0F1E36]/90 dark:bg-[#0B1526] border border-[#243B61] text-left space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EAD7B8] shrink-0" />
              <h4 className="text-xs font-black text-[#EAD7B8] uppercase tracking-wider">
                {lang === "EN"
                  ? "Current Orientation & Scope Note"
                  : "Ghi Chú Định Hướng Hiện Tại & Phạm Vi Hợp Đồng"}
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              {lang === "EN" ? "Continuously Expanding" : "Đang tiếp tục mở rộng"}
            </span>
          </div>

          <p className="text-xs text-[#B0C2DECc] leading-relaxed">
            {lang === "EN"
              ? "In our current phase, WeebLegit focuses primarily on protecting students, interns, and young people against common real-world contract traps. Our rule engine and sample templates currently cover key student-centric contract groups — while our legal references and supported contract categories are continuously being expanded to broader civil and commercial transactions."
              : "Trong giai đoạn hiện tại, định hướng trọng tâm của WeebLegit là đồng hành và bảo vệ sinh viên, thực tập sinh và người trẻ trước những rủi ro pháp lý thường gặp nhất. Hệ thống đang tập trung chuyên sâu vào các nhóm hợp đồng sát sườn với sinh viên dưới đây, đồng thời cơ sở dữ liệu điều khoản và các dạng hợp đồng hỗ trợ vẫn đang được đội ngũ tiếp tục cập nhật, mở rộng liên tục:"}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {(lang === "EN"
              ? [
                  "Internship (Intern)",
                  "Freelance / Collaborator (CTV)",
                  "Student Room Rental (Thuê trọ)",
                  "Apartment Lease (Thuê chung cư)",
                  "Training & Courses (Khóa học)",
                  "Installment Purchase (Trả góp)",
                  "Consumer Loan (Vay tiêu dùng)",
                ]
              : [
                  "Hợp đồng Thực tập (Intern)",
                  "Hợp đồng Cộng tác viên (CTV)",
                  "Hợp đồng Thuê trọ",
                  "Hợp đồng Thuê chung cư",
                  "Hợp đồng Khóa học & Cam kết việc làm",
                  "Hợp đồng Mua trả góp",
                  "Hợp đồng Vay tiêu dùng",
                ]
            ).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#152744] border border-[#2A436C] text-[11px] font-bold text-[#DCE6F5]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EAD7B8]" />
                {item}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAD7B8]/10 border border-dashed border-[#EAD7B8]/40 text-[11px] font-bold text-[#EAD7B8] italic">
              {lang === "EN" ? "+ Expanding to new categories..." : "+ Đang mở rộng thêm các dạng hợp đồng mới..."}
            </span>
          </div>
        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#65778F]">
          <p>
            {lang === "EN"
              ? "© 2026 WeebLegit. LegalTech platform empowering students & young people."
              : "© 2026 WeebLegit. Nền tảng công nghệ pháp lý đồng hành cùng sinh viên & người trẻ."}
          </p>
          <p className="text-center sm:text-right">
            ⚠️ <em>
              {lang === "EN"
                ? "Statutory reference and informational assistance; not a substitute for formal legal representation."
                : "Thông tin hỗ trợ tham khảo & đối chiếu luật, không thay thế dịch vụ tranh tụng của Luật sư."}
            </em>
          </p>
        </div>
      </div>
    </footer>
  );
};
