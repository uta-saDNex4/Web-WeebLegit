import React, { useState, useEffect } from "react";
import {
  Sparkles,
  FileText,
  ShieldCheck,
  BookOpen,
  FileSearch,
  Clock,
  ArrowUp,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { useLanguage } from "../lib/language-context";

interface FloatingNavProps {
  onOpenChecker: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ onOpenChecker }) => {
  const { lang, toggleLang, t } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>("hero-section");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    if (isCurrentlyDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "hero-section",
        "templates-section",
        "process-section",
        "sources-section",
        "cta-section",
      ];
      const scrollPos = window.scrollY + 250;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveSection("hero-section");
  };

  return (
    <aside
      aria-label="Floating Bubble Navigation"
      className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 flex-col items-center bg-white/90 dark:bg-[#0a1426]/95 backdrop-blur-xl border border-[#d8e3ef] dark:border-[#1c3050] rounded-full py-3.5 px-2.5 shadow-xl gap-3 transition-all"
    >
      {/* Top Brand / Nav Bubble Indicator (không phát quang) */}
      <div className="flex flex-col items-center justify-center pb-1.5 border-b border-[#e2e8f0] dark:border-[#1c3050]/80">
        <span className="w-2 h-2 rounded-full bg-[#EAD7B8] mb-1" />
        <span className="text-[9px] font-black tracking-widest text-[#64748b] dark:text-[#8fa3bf]">
          NAV
        </span>
      </div>

      {/* 1. Trang chủ (Sparkles Bubble — Xóa hoàn toàn phát quang) */}
      <button
        onClick={() => scrollToSection("hero-section")}
        className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-130 active:scale-95 shadow-none ${
          activeSection === "hero-section"
            ? "bg-[#EAD7B8] text-[#10253f] border border-[#d8bf97] scale-105"
            : "bg-slate-100/90 dark:bg-[#12223c]/90 text-[#49627d] dark:text-[#8fa3bf] hover:text-[#10253f] dark:hover:text-white hover:bg-slate-200/90 dark:hover:bg-[#182a4a] border border-[#e2e8f0] dark:border-[#1f3557]"
        }`}
        title={t("dock.home")}
      >
        <Sparkles className="w-4 h-4" />
        <span className="absolute left-full ml-3.5 px-2.5 py-1 bg-white dark:bg-[#0b1424] text-[#10253f] dark:text-[#e2e8f0] text-xs font-semibold rounded-lg shadow-xl border border-[#d8e3ef] dark:border-[#1e3458] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          {t("dock.home")}
        </span>
      </button>

      {/* 2. Mẫu hợp đồng (FileText Bubble — Xóa phát quang) */}
      <button
        onClick={() => scrollToSection("templates-section")}
        className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-130 active:scale-95 shadow-none ${
          activeSection === "templates-section"
            ? "bg-[#EAD7B8] text-[#10253f] border border-[#d8bf97] scale-105"
            : "bg-slate-100/90 dark:bg-[#12223c]/90 text-[#49627d] dark:text-[#8fa3bf] hover:text-[#10253f] dark:hover:text-white hover:bg-slate-200/90 dark:hover:bg-[#182a4a] border border-[#e2e8f0] dark:border-[#1f3557]"
        }`}
        title={t("dock.templates")}
      >
        <FileText className="w-4 h-4" />
        <span className="absolute left-full ml-3.5 px-2.5 py-1 bg-white dark:bg-[#0b1424] text-[#10253f] dark:text-[#e2e8f0] text-xs font-semibold rounded-lg shadow-xl border border-[#d8e3ef] dark:border-[#1e3458] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          {t("dock.templates")}
        </span>
      </button>

      {/* 3. Quy trình xác thực (ShieldCheck Bubble — Xóa phát quang) */}
      <button
        onClick={() => scrollToSection("process-section")}
        className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-130 active:scale-95 shadow-none ${
          activeSection === "process-section"
            ? "bg-[#EAD7B8] text-[#10253f] border border-[#d8bf97] scale-105"
            : "bg-slate-100/90 dark:bg-[#12223c]/90 text-[#49627d] dark:text-[#8fa3bf] hover:text-[#10253f] dark:hover:text-white hover:bg-slate-200/90 dark:hover:bg-[#182a4a] border border-[#e2e8f0] dark:border-[#1f3557]"
        }`}
        title={t("dock.process")}
      >
        <ShieldCheck className="w-4 h-4" />
        <span className="absolute left-full ml-3.5 px-2.5 py-1 bg-white dark:bg-[#0b1424] text-[#10253f] dark:text-[#e2e8f0] text-xs font-semibold rounded-lg shadow-xl border border-[#d8e3ef] dark:border-[#1e3458] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          {t("dock.process")}
        </span>
      </button>

      {/* 4. Căn cứ pháp lý (BookOpen Bubble — Xóa phát quang) */}
      <button
        onClick={() => scrollToSection("sources-section")}
        className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-130 active:scale-95 shadow-none ${
          activeSection === "sources-section"
            ? "bg-[#EAD7B8] text-[#10253f] border border-[#d8bf97] scale-105"
            : "bg-slate-100/90 dark:bg-[#12223c]/90 text-[#49627d] dark:text-[#8fa3bf] hover:text-[#10253f] dark:hover:text-white hover:bg-slate-200/90 dark:hover:bg-[#182a4a] border border-[#e2e8f0] dark:border-[#1f3557]"
        }`}
        title={t("dock.sources")}
      >
        <BookOpen className="w-4 h-4" />
        <span className="absolute left-full ml-3.5 px-2.5 py-1 bg-white dark:bg-[#0b1424] text-[#10253f] dark:text-[#e2e8f0] text-xs font-semibold rounded-lg shadow-xl border border-[#d8e3ef] dark:border-[#1e3458] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          {t("dock.sources")}
        </span>
      </button>

      {/* Divider */}
      <div className="w-6 h-px bg-[#e2e8f0] dark:bg-[#1c3050]" />

      {/* 5. Quét hợp đồng (FileSearch Bubble) */}
      <button
        onClick={onOpenChecker}
        className="group relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-100/90 dark:bg-[#12223c]/90 text-[#49627d] dark:text-[#8fa3bf] hover:text-[#8a6834] dark:hover:text-[#EAD7B8] hover:bg-slate-200/90 dark:hover:bg-[#182a4a] border border-[#e2e8f0] dark:border-[#1f3557] transition-all duration-300 ease-out cursor-pointer hover:scale-130 active:scale-95 shadow-none"
        title={t("dock.scan")}
      >
        <FileSearch className="w-4 h-4" />
        <span className="absolute left-full ml-3.5 px-2.5 py-1 bg-white dark:bg-[#0b1424] text-[#8a6834] dark:text-[#EAD7B8] text-xs font-semibold rounded-lg shadow-xl border border-[#d8e3ef] dark:border-[#1e3458] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          {t("dock.scan")}
        </span>
      </button>

      {/* 6. Lịch sử kiểm tra (Clock Bubble) */}
      <button
        onClick={onOpenChecker}
        className="group relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-100/90 dark:bg-[#12223c]/90 text-[#49627d] dark:text-[#8fa3bf] hover:text-[#10253f] dark:hover:text-white hover:bg-slate-200/90 dark:hover:bg-[#182a4a] border border-[#e2e8f0] dark:border-[#1f3557] transition-all duration-300 ease-out cursor-pointer hover:scale-130 active:scale-95 shadow-none"
        title={t("dock.history")}
      >
        <Clock className="w-4 h-4" />
        <span className="absolute left-full ml-3.5 px-2.5 py-1 bg-white dark:bg-[#0b1424] text-[#10253f] dark:text-[#e2e8f0] text-xs font-semibold rounded-lg shadow-xl border border-[#d8e3ef] dark:border-[#1e3458] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          {t("dock.history")}
        </span>
      </button>

      {/* 7. Đổi ngôn ngữ (Globe Bubble) */}
      <button
        onClick={toggleLang}
        className="group relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-100/90 dark:bg-[#12223c]/90 text-[#49627d] dark:text-[#8fa3bf] hover:text-[#8a6834] dark:hover:text-[#EAD7B8] hover:bg-slate-200/90 dark:hover:bg-[#182a4a] border border-[#e2e8f0] dark:border-[#1f3557] transition-all duration-300 ease-out cursor-pointer hover:scale-130 active:scale-95 shadow-none"
        title={`${t("dock.toggle_lang")} (${lang})`}
      >
        <span className="flex items-center gap-0.5">
          <Globe className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
          <span className="text-[10px] font-bold">{lang}</span>
        </span>
        <span className="absolute left-full ml-3.5 px-2.5 py-1 bg-white dark:bg-[#0b1424] text-[#10253f] dark:text-[#e2e8f0] text-xs font-semibold rounded-lg shadow-xl border border-[#d8e3ef] dark:border-[#1e3458] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          {t("dock.toggle_lang")} ({lang})
        </span>
      </button>

      {/* 8. Chế độ Sáng / Tối (Theme Bubble) */}
      <button
        onClick={toggleTheme}
        className="group relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-100/90 dark:bg-[#12223c]/90 text-[#49627d] dark:text-[#8fa3bf] hover:text-[#8a6834] dark:hover:text-[#EAD7B8] hover:bg-slate-200/90 dark:hover:bg-[#182a4a] border border-[#e2e8f0] dark:border-[#1f3557] transition-all duration-300 ease-out cursor-pointer hover:scale-130 active:scale-95 shadow-none"
        title={isDark ? t("nav.theme_light") : t("nav.theme_dark")}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-[#EAD7B8]" />
        ) : (
          <Moon className="w-4 h-4 text-[#10253f]" />
        )}
        <span className="absolute left-full ml-3.5 px-2.5 py-1 bg-white dark:bg-[#0b1424] text-[#10253f] dark:text-[#e2e8f0] text-xs font-semibold rounded-lg shadow-xl border border-[#d8e3ef] dark:border-[#1e3458] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          {isDark ? t("nav.theme_light") : t("nav.theme_dark")}
        </span>
      </button>

      {/* 9. Cuộn lên đầu trang (ArrowUp Bubble) */}
      <button
        onClick={scrollToTop}
        className="group relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-100/90 dark:bg-[#12223c]/90 text-[#49627d] dark:text-[#8fa3bf] hover:text-[#8a6834] dark:hover:text-[#EAD7B8] hover:bg-slate-200/90 dark:hover:bg-[#182a4a] border border-[#e2e8f0] dark:border-[#1f3557] transition-all duration-300 ease-out cursor-pointer hover:scale-130 active:scale-95 shadow-none mt-1"
        title={t("dock.to_top")}
      >
        <ArrowUp className="w-4 h-4" />
        <span className="absolute left-full ml-3.5 px-2.5 py-1 bg-white dark:bg-[#0b1424] text-[#10253f] dark:text-[#e2e8f0] text-xs font-semibold rounded-lg shadow-xl border border-[#d8e3ef] dark:border-[#1e3458] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          {t("dock.to_top")}
        </span>
      </button>
    </aside>
  );
};
