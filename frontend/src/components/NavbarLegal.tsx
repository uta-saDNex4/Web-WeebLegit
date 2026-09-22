import React, { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  FileSearch,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../lib/auth-context";
import { useLanguage } from "../lib/language-context";

interface NavbarLegalProps {
  onOpenChecker: () => void;
  onOpenAuth: (tab?: "login" | "register") => void;
  onScrollToSection: (id: string) => void;
}

export const NavbarLegal: React.FC<NavbarLegalProps> = ({
  onOpenChecker,
  onOpenAuth,
  onScrollToSection,
}) => {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setIsDark(nextDark);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF9F5]/92 dark:bg-[#09111E]/92 border-b border-[#E6DEC8] dark:border-[#1A2D49] transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo - Co giãn mượt mà khi ở cửa sổ nhỏ (không che các thành phần khác) */}
        <div className="flex items-center shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <Image
              src="/Logo WeebLegit.png"
              alt="WeebLegit Logo"
              width={140}
              height={44}
              className="h-8 sm:h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-103"
              priority
            />
          </a>
        </div>

        {/* Desktop Navigation Links (Từ ngữ toàn dân, dễ hiểu) */}
        <nav className="hidden lg:flex items-center gap-2 text-sm font-bold text-[#1E324F] dark:text-[#A9BCD6]">
          <button
            onClick={() => onScrollToSection("check-section")}
            className="px-3.5 py-2 rounded-xl hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] hover:text-[#8A6731] dark:hover:text-[#EAD7B8] transition-all cursor-pointer"
          >
            {lang === "EN" ? "Check" : "Kiểm Tra"}
          </button>
          <button
            onClick={() => onScrollToSection("process-section")}
            className="px-3.5 py-2 rounded-xl hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] hover:text-[#8A6731] dark:hover:text-[#EAD7B8] transition-all cursor-pointer"
          >
            {lang === "EN" ? "How it works" : "Cách Dùng"}
          </button>
          <button
            onClick={() => onScrollToSection("pitfalls-section")}
            className="px-3.5 py-2 rounded-xl hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] hover:text-[#8A6731] dark:hover:text-[#EAD7B8] transition-all cursor-pointer"
          >
            {lang === "EN" ? "Common Traps" : "Bẫy Hay Gặp"}
          </button>
          <button
            onClick={() => onScrollToSection("sources-section")}
            className="px-3.5 py-2 rounded-xl hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] hover:text-[#8A6731] dark:hover:text-[#EAD7B8] transition-all cursor-pointer"
          >
            {lang === "EN" ? "Legal References" : "Luật Tham Chiếu"}
          </button>
        </nav>

        {/* Right Action Tools: Language, Theme & High-Contrast Buttons */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] hover:border-[#8A6731] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] text-xs font-extrabold text-[#0F1E36] dark:text-[#CAD8ED] transition-all cursor-pointer shadow-2xs"
            title={lang === "EN" ? "Switch to Vietnamese" : "Chuyển sang Tiếng Anh"}
          >
            <Globe className="w-3.5 h-3.5 text-[#8A6731] dark:text-[#EAD7B8]" />
            <span>{lang}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] hover:border-[#8A6731] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] text-[#0F1E36] dark:text-[#CAD8ED] transition-all cursor-pointer shadow-2xs"
            title={isDark ? "Giao diện Sáng" : "Giao diện Tối"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#EAD7B8]" />
            ) : (
              <Moon className="w-4 h-4 text-[#0F1E36]" />
            )}
          </button>

          {/* User Auth Controls */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#11213A] border border-[#DCD3BE] dark:border-[#22395D] text-xs font-bold text-[#0F1E36] dark:text-white shadow-xs cursor-pointer hover:border-[#8A6731]"
              >
                <div className="w-6 h-6 rounded-full bg-[#EAD7B8] flex items-center justify-center text-[#0F1E36] text-[11px] font-black uppercase">
                  {(user.full_name ?? user.email).charAt(0)}
                </div>
                <span className="max-w-[110px] truncate">{user.full_name ?? user.email}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#65778F]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0D1829] border border-[#E6DEC8] dark:border-[#1F3557] rounded-xl shadow-xl py-1 z-50">
                  <div className="px-3.5 py-2 border-b border-[#EFE8D8] dark:border-[#1F3557]">
                    <p className="text-xs font-bold text-[#0F1E36] dark:text-white truncate">
                      {user.full_name ?? "Người dùng"}
                    </p>
                    <p className="text-[11px] text-[#65778F] dark:text-[#8FA3BF] truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenChecker();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#1E324F] dark:text-[#CAD8ED] hover:bg-[#FAF6EF] dark:hover:bg-[#162744] flex items-center gap-2 cursor-pointer"
                  >
                    <FileSearch className="w-4 h-4 text-[#8A6731]" />
                    <span>{lang === "EN" ? "Open Contract Checker" : "Bảng Soát Lỗi"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{lang === "EN" ? "Sign Out" : "Đăng xuất"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth("login")}
                className="text-xs font-bold text-[#1E324F] dark:text-[#CAD8ED] hover:text-[#0F1E36] dark:hover:text-white px-2.5 py-2 cursor-pointer transition-colors"
              >
                {lang === "EN" ? "Sign In" : "Đăng nhập"}
              </button>

              <button
                onClick={() => onOpenAuth("register")}
                className="px-3 py-1.5 rounded-xl border border-[#D4C8AE] dark:border-[#22395D] hover:border-[#8A6731] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] text-xs font-bold text-[#0F1E36] dark:text-[#EAD7B8] transition-all cursor-pointer"
              >
                {lang === "EN" ? "Register" : "Đăng ký"}
              </button>
            </div>
          )}

          {/* HIGH-CONTRAST PRIMARY CTA BUTTON */}
          <button
            onClick={onOpenChecker}
            className="group relative inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#0F223D] hover:bg-[#162D4F] text-[#EAD7B8] border border-[#EAD7B8]/80 text-xs font-black shadow-md shadow-[#0F223D]/25 transition-all duration-200 hover:scale-103 active:scale-97 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EAD7B8] group-hover:rotate-12 transition-transform" />
            <span>{lang === "EN" ? "Check Contract Free" : "Kiểm Tra Miễn Phí"}</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#0F1E36] dark:text-white rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E6DEC8] dark:border-[#1A2D49] bg-[#FAF9F5] dark:bg-[#09111E] px-4 py-4 space-y-3 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#EFE8D8] dark:border-[#162744]">
            <button
              onClick={toggleLang}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] text-xs font-bold text-[#0F1E36] dark:text-white"
            >
              <Globe className="w-3.5 h-3.5 text-[#8A6731]" />
              <span>Ngôn ngữ: {lang}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] text-xs font-bold text-[#0F1E36] dark:text-white"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-[#EAD7B8]" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDark ? "Chế độ Tối" : "Chế độ Sáng"}</span>
            </button>
          </div>

          <div className="space-y-2 text-sm font-bold text-[#1E324F] dark:text-[#CAD8ED]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToSection("check-section");
              }}
              className="w-full text-left py-1.5 hover:text-[#8A6731]"
            >
              🔍 Kiểm Tra Hợp Đồng
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToSection("process-section");
              }}
              className="w-full text-left py-1.5 hover:text-[#8A6731]"
            >
              🛡️ Cách Dùng
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToSection("pitfalls-section");
              }}
              className="w-full text-left py-1.5 hover:text-[#8A6731]"
            >
              ⚠️ Bẫy Hay Gặp
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToSection("sources-section");
              }}
              className="w-full text-left py-1.5 hover:text-[#8A6731]"
            >
              ⚖️ {lang === "EN" ? "Legal References" : "Luật Tham Chiếu"}
            </button>
          </div>

          <div className="pt-3 border-t border-[#EFE8D8] dark:border-[#162744] flex flex-col gap-2">
            {!user ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("login");
                  }}
                  className="py-2.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] text-xs font-bold text-[#0F1E36] dark:text-white text-center"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("register");
                  }}
                  className="py-2.5 rounded-xl border border-[#8A6731] bg-[#FAF5ED] dark:bg-[#12223C] text-xs font-bold text-[#8A6731] dark:text-[#EAD7B8] text-center"
                >
                  Đăng ký
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="py-2 text-xs font-bold text-red-600 text-center"
              >
                Đăng xuất ({user.email})
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenChecker();
              }}
              className="w-full py-3 rounded-xl bg-[#0F223D] text-[#EAD7B8] border border-[#EAD7B8] font-black text-xs uppercase tracking-wider text-center shadow-md"
            >
              🚀 Bắt Đầu Kiểm Tra Hợp Đồng Ngay
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
