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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
                ? "WeebLegit is a specialized statutory verification platform designed to protect students, interns, and young professionals from contract pitfalls."
                : "WeebLegit giúp bạn kiểm tra nhanh hợp đồng đi làm, thuê nhà, phát hiện ngay các điều khoản bất lợi và hướng dẫn bạn cách bảo vệ quyền lợi chính đáng."}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-[#65778F]">
              <Scale className="w-3.5 h-3.5 text-[#EAD7B8]" />
              <span>
                {lang === "EN"
                  ? "Aligned with Labor Code 2019, Civil Code 2015 & Housing Law 2023"
                  : "Đối chiếu Bộ luật Lao động 2019, Bộ luật Dân sự 2015 & Luật Nhà ở 2023"}
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

        {/* Bottom Legal Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#65778F]">
          <p>
            {lang === "EN"
              ? "© 2026 WeebLegit. LegalTech platform empowering young people."
              : "© 2026 WeebLegit. Nền tảng công nghệ pháp lý hỗ trợ người trẻ."}
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
