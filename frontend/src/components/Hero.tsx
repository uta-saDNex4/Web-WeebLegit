import React from "react";
import {
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  FileSearch,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/language-context";

interface HeroProps {
  onOpenChecker: () => void;
  onOpenTemplates: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenChecker,
  onOpenTemplates,
}) => {
  const { t } = useLanguage();

  return (
    <section
      id="hero-section"
      className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20"
    >
      {/* Ambient background subtle radial glow (no harsh bleeding) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-[#EAD7B8]/20 via-[#FAF5ED]/30 dark:via-[#1c3050]/20 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#8a6834] dark:text-[#EAD7B8] bg-[#FAF5ED] dark:bg-[#EAD7B8]/10 border border-[#EAD7B8]/60 dark:border-[#EAD7B8]/30 mb-6 shadow-none"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
          <span>{t("hero.badge")}</span>
        </motion.div>

        {/* Main Title — High contrast in both light and dark */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0f172a] dark:text-white leading-[1.15] mb-6"
        >
          {t("hero.title_p1")} <br className="hidden sm:inline" />
          <span className="text-[#8a6834] dark:text-[#EAD7B8]">{t("hero.title_p2")}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-[#334155] dark:text-[#94a9c9] max-w-2xl mx-auto leading-relaxed mb-8 font-medium"
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-6"
        >
          <button
            onClick={onOpenChecker}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-bold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-xl shadow-md shadow-[#EAD7B8]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <FileSearch className="w-5 h-5" />
            <span>{t("hero.btn_check")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenTemplates}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-[#0f172a] dark:text-[#e2e8f0] bg-white dark:bg-[#0b1424] hover:bg-slate-50 dark:hover:bg-[#12223c] rounded-xl border border-[#cbd5e1] dark:border-[#1a2d4b] hover:border-[#EAD7B8] transition-all cursor-pointer shadow-sm"
          >
            <span>{t("hero.btn_templates")}</span>
          </button>
        </motion.div>

        {/* Reassurance text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xs sm:text-sm text-[#475569] dark:text-[#8fa3bf] flex items-center justify-center gap-1.5 font-medium"
        >
          <HelpCircle className="w-4 h-4 text-[#64748b] dark:text-[#8fa3bf]" />
          <span>{t("hero.disclaimer")}</span>
        </motion.p>

        {/* Hero Interactive Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <div
            onClick={onOpenChecker}
            className="group cursor-pointer text-left bg-white dark:bg-[#0b1424]/90 backdrop-blur-md rounded-2xl border border-[#cbd5e1] dark:border-[#1a2d4b] p-5 sm:p-7 shadow-lg dark:shadow-2xl transition-all hover:border-[#EAD7B8]"
          >
            {/* Document Header Bar */}
            <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-[#1a2d4b] pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#FAF5ED] dark:bg-[#12223c] border border-[#EAD7B8]/60 dark:border-[#22395d] flex items-center justify-center text-[#8a6834] dark:text-[#EAD7B8]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0f172a] dark:text-white">
                    {t("hero.card_file")}
                  </div>
                  <div className="text-[11px] text-[#475569] dark:text-[#8fa3bf] font-medium">
                    {t("hero.card_sub")}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#159f7b] dark:text-emerald-400 bg-[#eafbf7] dark:bg-emerald-950/50 border border-[#b7f6e5] dark:border-emerald-800/60">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t("hero.card_verified")}</span>
              </div>
            </div>

            {/* Document Mockup Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base sm:text-lg text-[#0f172a] dark:text-white uppercase tracking-wide">
                  {t("hero.card_title")}
                </h3>
                <span className="text-xs font-bold text-[#8a6834] dark:text-[#EAD7B8] flex items-center gap-1 group-hover:underline">
                  <span>{t("hero.card_view")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Highlighted Warning Box */}
              <div className="rounded-xl bg-[#fff1f0] dark:bg-[#3f1619]/40 border border-[#ffd1cc] dark:border-[#7f1d1d]/60 p-4 sm:p-4.5 transition-colors">
                <div className="flex items-center gap-2 text-xs font-bold text-[#e4534b] dark:text-[#f87171] uppercase tracking-wider mb-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t("hero.warn_badge")}</span>
                </div>
                <p className="text-sm font-bold text-[#7d342f] dark:text-[#fecaca] leading-snug mb-2">
                  {t("hero.warn_title")}
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-[#bf3b35] dark:text-[#fca5a5] bg-white/70 dark:bg-[#1a0f12]/60 rounded-lg px-2.5 py-1.5 border border-[#ffd1cc]/60 dark:border-[#7f1d1d]/40">
                  <Sparkles className="w-3.5 h-3.5 text-[#e4534b] dark:text-[#f87171] shrink-0" />
                  <span>{t("hero.warn_ai")}</span>
                </div>
              </div>

              {/* Skeleton doc lines */}
              <div className="space-y-2 pt-1">
                <div className="h-2 bg-slate-200 dark:bg-[#1a2d4b] rounded-full w-full"></div>
                <div className="h-2 bg-slate-200 dark:bg-[#1a2d4b] rounded-full w-5/6"></div>
                <div className="h-2 bg-slate-200 dark:bg-[#1a2d4b] rounded-full w-4/6"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
