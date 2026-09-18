import React from "react";
import {
  ShieldCheck,
  Heart,
  Code2,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface FooterProps {
  onOpenNextjsCode: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenNextjsCode }) => {
  return (
    <footer className="bg-[#10253f] text-white pt-14 pb-10 border-t border-[#173d5a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-[#26435e]">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f] shadow-sm shadow-[#EAD7B8]/30">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                WeebLegit
              </span>
            </div>
            <p className="text-sm text-[#8297ac]">
              WeebLegit — demo xác thực hợp đồng thông minh cho sinh viên.
            </p>
          </div>

          {/* Quick links & Next.js Action */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#b9cadd]">
            <a
              href="#templates-section"
              className="hover:text-white transition-colors"
            >
              Thư viện mẫu
            </a>
            <a
              href="#ai-section"
              className="hover:text-white transition-colors"
            >
              Trợ lý AI
            </a>
            <a
              href="#sources-section"
              className="hover:text-white transition-colors"
            >
              Nguồn luật
            </a>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8297ac]">
          <p>⚠️ Thông tin hỗ trợ tham khảo, không thay thế tư vấn pháp lý.</p>
        </div>
      </div>
    </footer>
  );
};
