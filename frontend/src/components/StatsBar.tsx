import React from "react";
import { Fingerprint, Scale, FileText, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/language-context";

export const StatsBar: React.FC = () => {
  const { t } = useLanguage();

  const stats = [
    {
      id: "hash-speed",
      icon: <Fingerprint className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />,
      value: t("stats.s1_val"),
      label: t("stats.s1_lbl"),
    },
    {
      id: "law-compliance",
      icon: <Scale className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />,
      value: t("stats.s2_val"),
      label: t("stats.s2_lbl"),
    },
    {
      id: "contracts-reviewed",
      icon: <FileText className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />,
      value: t("stats.s3_val"),
      label: t("stats.s3_lbl"),
    },
    {
      id: "bank-grade-security",
      icon: <Lock className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />,
      value: t("stats.s4_val"),
      label: t("stats.s4_lbl"),
    },
  ];

  return (
    <section className="relative z-10 pt-4 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group relative bg-white dark:bg-[#0b1424]/90 backdrop-blur-md rounded-2xl border border-[#cbd5e1] dark:border-[#1a2d4b] hover:border-[#EAD7B8] p-6 flex flex-col items-center text-center shadow-sm dark:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Icon circle */}
              <div className="w-10 h-10 rounded-full bg-[#FAF5ED] dark:bg-[#13233f] border border-[#EAD7B8]/50 dark:border-[#22395d] group-hover:border-[#EAD7B8] flex items-center justify-center mb-3.5 transition-colors">
                {item.icon}
              </div>

              {/* Stat Value — High contrast */}
              <div className="text-3xl sm:text-4xl font-black text-[#0f172a] dark:text-white tracking-tight mb-1.5 group-hover:text-[#8a6834] dark:group-hover:text-[#EAD7B8] transition-colors">
                {item.value}
              </div>

              {/* Stat Label — High contrast dark grey in light mode */}
              <div className="text-xs sm:text-[13px] text-[#334155] dark:text-[#8fa3bf] leading-snug font-semibold max-w-[200px]">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
