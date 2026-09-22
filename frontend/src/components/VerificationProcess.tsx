import React from "react";
import {
  UploadCloud,
  Fingerprint,
  Scale,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/language-context";

interface VerificationProcessProps {
  onStartProcess: () => void;
}

export const VerificationProcess: React.FC<VerificationProcessProps> = ({
  onStartProcess,
}) => {
  const { t } = useLanguage();

  const steps = [
    {
      number: "01",
      tag: t("proc.s1_tag"),
      title: t("proc.s1_title"),
      description: t("proc.s1_desc"),
      icon: <UploadCloud className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />,
      phase: t("proc.s1_phase"),
      isHighlighted: false,
    },
    {
      number: "02",
      tag: t("proc.s2_tag"),
      title: t("proc.s2_title"),
      description: t("proc.s2_desc"),
      icon: <Fingerprint className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />,
      phase: t("proc.s2_phase"),
      isHighlighted: true,
    },
    {
      number: "03",
      tag: t("proc.s3_tag"),
      title: t("proc.s3_title"),
      description: t("proc.s3_desc"),
      icon: <Scale className="w-5 h-5 text-[#8a6834] dark:text-[#EAD7B8]" />,
      phase: t("proc.s3_phase"),
      isHighlighted: false,
    },
  ];

  return (
    <section
      id="process-section"
      className="py-16 sm:py-24 border-t border-[#e2e8f0] dark:border-[#1a2d4b]/60 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header with Title & Action Button */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#8a6834] dark:text-[#EAD7B8] bg-[#FAF5ED] dark:bg-[#EAD7B8]/10 border border-[#EAD7B8]/60 dark:border-[#EAD7B8]/30 mb-4 shadow-none">
              <span>{t("proc.badge")}</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] dark:text-white tracking-tight mb-3">
              {t("proc.title")}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#334155] dark:text-[#94a9c9] leading-relaxed font-medium">
              {t("proc.subtitle")}
            </p>
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={onStartProcess}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-xl shadow-md shadow-[#EAD7B8]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t("proc.btn_start")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between backdrop-blur-md transition-all duration-300 ${
                step.isHighlighted
                  ? "bg-[#FAF5ED]/60 dark:bg-[#0c1628] border-2 border-[#EAD7B8] shadow-md dark:shadow-xl dark:shadow-[#EAD7B8]/10"
                  : "bg-white dark:bg-[#0b1424]/90 border border-[#cbd5e1] dark:border-[#1a2d4b] hover:border-[#EAD7B8] shadow-sm dark:shadow-lg"
              }`}
            >
              <div>
                {/* Number & Icon Row */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-300 dark:text-[#22395d]">
                    {step.number}
                  </span>
                  <div className="w-11 h-11 rounded-full bg-[#FAF5ED] dark:bg-[#12223c] border border-[#EAD7B8]/60 dark:border-[#22395d] flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                {/* Sub-label Tag */}
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8a6834] dark:text-[#8fa3bf] mb-2">
                  {step.tag}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-3 leading-snug">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-[13px] text-[#334155] dark:text-[#94a9c9] leading-relaxed mb-6 font-medium">
                  {step.description}
                </p>
              </div>

              {/* Footer Indicator */}
              <div className="pt-4 border-t border-[#e2e8f0] dark:border-[#1a2d4b]/80 flex items-center justify-between text-xs font-bold text-[#475569] dark:text-[#8fa3bf]">
                <span>{step.phase}</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t("proc.standardized")}</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
