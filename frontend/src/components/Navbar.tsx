import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  ArrowRight,
  LogOut,
  User,
  ChevronDown,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../lib/language-context";

interface NavbarProps {
  onOpenChecker: () => void;
  onOpenTemplates: () => void;
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenChecker,
  onOpenTemplates,
  onOpenAuth,
}) => {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light") {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
      } else {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      }
    } catch {
      // ignore in SSR
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        try {
          localStorage.setItem("theme", "dark");
        } catch {}
      } else {
        document.documentElement.classList.remove("dark");
        try {
          localStorage.setItem("theme", "light");
        } catch {}
      }
      return next;
    });
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#070e1b]/90 border-b border-[#e2e8f0] dark:border-[#1a2d4b] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <Image
            src="/Logo WeebLegit.png"
            alt="WeebLegit Logo"
            width={130}
            height={130}
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
          <span className="hidden sm:inline-block text-xs font-semibold text-[#475569] dark:text-[#8fa3bf] border-l border-[#cbd5e1] dark:border-[#1e3458] pl-3">
            {t("nav.platform_sub")}
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-[#334155] dark:text-[#94a9c9]">
          <button
            onClick={() => scrollToSection("templates-section")}
            className="hover:text-[#8a6834] dark:hover:text-[#EAD7B8] transition-colors cursor-pointer"
          >
            {t("nav.templates")}
          </button>
          <button
            onClick={() => scrollToSection("process-section")}
            className="hover:text-[#8a6834] dark:hover:text-[#EAD7B8] transition-colors cursor-pointer"
          >
            {t("nav.process")}
          </button>
          <button
            onClick={() => scrollToSection("sources-section")}
            className="hover:text-[#8a6834] dark:hover:text-[#EAD7B8] transition-colors cursor-pointer"
          >
            {t("nav.sources")}
          </button>
        </nav>

        {/* Action Buttons — Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] dark:border-[#1a2d4b] hover:border-[#EAD7B8] hover:bg-[#FAF6EF] dark:hover:bg-[#12223c] text-xs font-bold text-[#0f172a] dark:text-[#94a9c9] transition-all cursor-pointer"
            title={`${t("dock.toggle_lang")} (${lang})`}
          >
            <Globe className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
            <span>{lang}</span>
          </button>

          {/* Theme Switcher (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center p-2 rounded-xl border border-[#cbd5e1] dark:border-[#1a2d4b] hover:border-[#EAD7B8] hover:bg-[#FAF6EF] dark:hover:bg-[#12223c] text-[#0f172a] dark:text-[#94a9c9] transition-all cursor-pointer"
            title={isDark ? t("nav.theme_light") : t("nav.theme_dark")}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#EAD7B8]" />
            ) : (
              <Moon className="w-4 h-4 text-[#0f172a]" />
            )}
          </button>

          {user ? (
            /* ── Logged in: avatar + dropdown ── */
            <div className="relative ml-1">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#cbd5e1] dark:border-[#1a2d4b] hover:border-[#EAD7B8] hover:bg-[#FAF6EF] dark:hover:bg-[#12223c] transition-all text-xs font-bold text-[#0f172a] dark:text-white cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#EAD7B8] to-[#d8bf97] flex items-center justify-center text-[#10253f] text-xs font-bold uppercase">
                  {(user.full_name ?? user.email).charAt(0)}
                </div>
                <span className="max-w-[120px] truncate">
                  {user.full_name ?? user.email}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#64748b] dark:text-[#8fa3bf] transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#0b1424] border border-[#e2e8f0] dark:border-[#1a2d4b] rounded-xl shadow-2xl py-1 z-50">
                  <div className="px-3 py-2 border-b border-[#e2e8f0] dark:border-[#1a2d4b]">
                    <p className="text-xs font-bold text-[#0f172a] dark:text-white truncate">
                      {user.full_name ?? "Người dùng"}
                    </p>
                    <p className="text-xs text-[#64748b] dark:text-[#8fa3bf] truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={onOpenChecker}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#334155] dark:text-[#94a9c9] hover:bg-slate-50 dark:hover:bg-[#12223c] hover:text-[#8a6834] dark:hover:text-[#EAD7B8] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4" /> {t("nav.verify_contract")}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#e4534b] dark:text-[#f87171] hover:bg-[#fff1f0] dark:hover:bg-[#3f1619]/40 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Not logged in: Đăng nhập & Đăng ký ── */
            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs font-bold text-[#334155] dark:text-[#94a9c9] hover:text-[#0f172a] dark:hover:text-white px-2.5 py-2 transition-colors cursor-pointer"
              >
                {t("nav.login")}
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="text-xs font-bold text-[#0f172a] dark:text-[#EAD7B8] hover:text-[#8a6834] dark:hover:text-white px-3 py-1.5 rounded-xl border border-[#cbd5e1] dark:border-[#1a2d4b] hover:border-[#EAD7B8] hover:bg-slate-50 dark:hover:bg-[#12223c] transition-all cursor-pointer"
              >
                {t("nav.register")}
              </button>

              <button
                onClick={onOpenChecker}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-xl shadow-md shadow-[#EAD7B8]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ml-1"
              >
                <span>{t("nav.try_free")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#334155] dark:text-[#94a9c9] hover:text-[#0f172a] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#12223c] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#e2e8f0] dark:border-[#1a2d4b] bg-white dark:bg-[#070e1b] px-4 pt-3 pb-5 space-y-3 shadow-2xl">
          <button
            onClick={() => scrollToSection("templates-section")}
            className="block w-full text-left px-3 py-2 text-sm font-semibold text-[#0f172a] dark:text-[#e2e8f0] hover:bg-slate-50 dark:hover:bg-[#12223c] rounded-lg"
          >
            {t("nav.templates")}
          </button>
          <button
            onClick={() => scrollToSection("process-section")}
            className="block w-full text-left px-3 py-2 text-sm font-semibold text-[#0f172a] dark:text-[#e2e8f0] hover:bg-slate-50 dark:hover:bg-[#12223c] rounded-lg"
          >
            {t("nav.process")}
          </button>
          <button
            onClick={() => scrollToSection("sources-section")}
            className="block w-full text-left px-3 py-2 text-sm font-semibold text-[#0f172a] dark:text-[#e2e8f0] hover:bg-slate-50 dark:hover:bg-[#12223c] rounded-lg"
          >
            {t("nav.sources")}
          </button>

          {/* Mobile Quick Lang & Theme */}
          <div className="flex items-center gap-2 px-1 py-2 border-t border-[#e2e8f0] dark:border-[#1a2d4b]">
            <button
              onClick={toggleLang}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#cbd5e1] dark:border-[#1a2d4b] text-xs font-bold text-[#0f172a] dark:text-[#94a9c9]"
            >
              <Globe className="w-3.5 h-3.5 text-[#8a6834] dark:text-[#EAD7B8]" />
              <span>Ngôn ngữ: {lang}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#cbd5e1] dark:border-[#1a2d4b] text-xs font-bold text-[#0f172a] dark:text-[#94a9c9]"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-[#EAD7B8]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#0f172a]" />
              )}
              <span>{isDark ? "Giao diện: Tối" : "Giao diện: Sáng"}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#e2e8f0] dark:border-[#1a2d4b] flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-xs text-[#475569] dark:text-[#8fa3bf]">
                  {t("nav.welcome")}{" "}
                  <strong className="text-[#0f172a] dark:text-white">
                    {user.full_name ?? user.email}
                  </strong>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenChecker();
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-xl"
                >
                  {t("nav.verify_contract")}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-[#e4534b] dark:text-[#f87171] border border-[#ffd1cc] dark:border-[#7f1d1d] rounded-xl"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full text-center py-2 text-xs font-bold text-[#0f172a] dark:text-[#94a9c9] hover:bg-slate-100 dark:hover:bg-[#12223c] rounded-xl border border-[#cbd5e1] dark:border-[#1a2d4b]"
                >
                  {t("nav.login")}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full text-center py-2 text-xs font-bold text-[#0f172a] dark:text-[#EAD7B8] hover:bg-slate-100 dark:hover:bg-[#12223c] rounded-xl border border-[#cbd5e1] dark:border-[#1a2d4b]"
                >
                  {t("nav.register")}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenChecker();
                  }}
                  className="col-span-2 w-full py-2.5 text-center text-xs font-bold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-xl"
                >
                  {t("nav.try_free")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
