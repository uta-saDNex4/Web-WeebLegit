import React from "react";
import { Zap, Scale, ShieldCheck, Lock } from "lucide-react";
import { useLanguage } from "../lib/language-context";

export const LegalMetricsBar: React.FC = () => {
  const { lang } = useLanguage();

  const metrics = [
    {
      icon: Zap,
      val: "< 1s",
      title: lang === "EN" ? "Verification Speed" : "Tốc Độ Xác Thực",
      desc:
        lang === "EN"
          ? "Instant SHA-256 calculation ensuring original, untampered files"
          : "Tính toán mã SHA-256 tức thì để bảo đảm tệp nguyên bản, không bị chỉnh sửa",
    },
    {
      icon: Scale,
      val: "3 Bộ Luật",
      title: lang === "EN" ? "Statutory Database" : "Cơ Sở Đối Chiếu",
      desc: lang === "EN" ? "Labor Code 2019, Civil Code 2015 & Housing Law" : "Bộ luật Lao động 2019, Dân sự 2015 & Luật Nhà ở 2023",
    },
    {
      icon: Lock,
      val: "256-bit",
      title: lang === "EN" ? "Integrity Standard" : "Chuẩn Mật Mã Học",
      desc: lang === "EN" ? "FIPS PUB 180-4 standard to preserve document integrity" : "Chuẩn FIPS PUB 180-4 bảo toàn tính toàn vẹn văn bản",
    },
    {
      icon: ShieldCheck,
      val: "100%",
      title: lang === "EN" ? "In-Memory Privacy" : "Bảo Mật Bộ Nhớ Tạm",
      desc: lang === "EN" ? "Automatic temporary buffer wipe, no file retention" : "Tự động hủy vùng nhớ tạm, không lưu trữ tệp trên máy chủ",
    },
  ];

  return (
    <section className="pt-0 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#0D1829] rounded-2xl border border-[#E4D9C4] dark:border-[#1E3558] p-5 sm:p-6 shadow-2xs hover:border-[#8A6731] dark:hover:border-[#EAD7B8] transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF5ED] dark:bg-[#162744] border border-[#E0D5BE] dark:border-[#274068] flex items-center justify-center text-[#8A6731] dark:text-[#EAD7B8]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-[#0F1E36] dark:text-white tracking-tight">
                    {m.val}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-black text-[#0F1E36] dark:text-white mb-1">
                  {m.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-[#65778F] dark:text-[#8FA3BF] font-medium leading-relaxed">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
