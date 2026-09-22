import React from "react";
import { ArrowRight, Scale, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/language-context";

interface CallToActionProps {
  onStart: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({ onStart }) => {
  const { t } = useLanguage();

  const guarantees = [
    t("cta.c1"),
    t("cta.c2"),
    t("cta.c3"),
  ];

  return (
    <section
      id="cta-section"
      className="py-20 sm:py-28 relative overflow-hidden border-t border-[#e2e8f0] dark:border-[#1a2d4b]/70"
    >
      {/* Background ambient gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#EAD7B8]/20 dark:bg-[#EAD7B8]/10 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#8a6834] dark:text-[#EAD7B8] bg-[#FAF5ED] dark:bg-[#EAD7B8]/10 border border-[#EAD7B8]/60 dark:border-[#EAD7B8]/30 mb-8 shadow-none"
        >
          <Scale className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
          <span>{t("cta.badge")}</span>
        </motion.div>

        {/* Main Title */}
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] dark:text-white tracking-tight mb-6 leading-tight max-w-3xl mx-auto"
        >
          {t("cta.title")}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-[#334155] dark:text-[#94a9c9] max-w-2xl mx-auto mb-8 leading-relaxed font-medium"
        >
          {t("cta.subtitle")}
        </motion.p>

        {/* 3 Checklist Items */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-10 text-xs sm:text-sm font-bold"
        >
          {guarantees.map((item, idx) => (
            <div key={idx} className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
              <span className="text-[#0f172a] dark:text-[#e2e8f0]">{item}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-xl shadow-xl shadow-[#EAD7B8]/25 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            <span>{t("cta.btn")}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
