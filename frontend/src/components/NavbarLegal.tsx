import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  Check,
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
import { useTheme } from "../lib/theme-context";

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
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF9F5]/92 dark:bg-[#09111E]/92 border-b border-[#E6DEC8] dark:border-[#1A2D49] transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
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

        {/* Desktop Navigation Links */}
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
            className="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] hover:border-[#8A6731] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] text-xs font-extrabold text-[#0F1E36] dark:text-[#CAD8ED] transition-colors cursor-pointer shadow-2xs shrink-0"
            title={lang === "EN" ? "Switch to Vietnamese" : "Chuyển sang Tiếng Anh"}
          >
            <Globe className="w-3.5 h-3.5 text-[#8A6731] dark:text-[#EAD7B8]" />
            <span>{lang}</span>
          </button>

          {/* Theme Switcher (1 click: Light <-> Dark) */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] hover:border-[#8A6731] hover:bg-[#F2ECE0] dark:hover:bg-[#12223C] text-[#0F1E36] dark:text-[#CAD8ED] transition-colors cursor-pointer shadow-2xs shrink-0"
            title={
              theme === "dark"
                ? (lang === "EN" ? "Switch to Light mode" : "Chuyển sang Giao diện Sáng")
                : (lang === "EN" ? "Switch to Dark mode" : "Chuyển sang Giao diện Tối")
            }
            aria-label="Toggle dark/light mode"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#E5A93C]" />
            ) : (
              <Moon className="w-4 h-4 text-[#49627D]" />
            )}
          </button>

          {/* User Auth Controls */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
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
                  {user.role === "admin" && (
                    <a
                      href="/admin"
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#8A6731] dark:text-[#EAD7B8] hover:bg-[#FAF6EF] dark:hover:bg-[#162744] flex items-center gap-2 cursor-pointer border-b border-[#EFE8D8] dark:border-[#1F3557]"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#8A6731] dark:text-[#EAD7B8]" />
                      <span>{lang === "EN" ? "Admin Dashboard" : "Trang Quản Trị Admin"}</span>
                    </a>
                  )}
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
                className="inline-flex items-center px-3.5 h-9 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] bg-white/70 dark:bg-[#0F1B2E]/70 hover:border-[#8A6731] hover:bg-[#F2ECE0] dark:hover:bg-[#142642] text-xs font-bold text-[#0F1E36] dark:text-[#CAD8ED] transition-colors cursor-pointer shadow-2xs shrink-0"
              >
                {lang === "EN" ? "Sign In" : "Đăng nhập"}
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="inline-flex items-center px-4 h-9 rounded-xl border border-[#8A6731] bg-[#FAF5ED] dark:bg-[#12223C] text-xs font-extrabold text-[#8A6731] dark:text-[#EAD7B8] hover:bg-[#8A6731] hover:text-white dark:hover:bg-[#EAD7B8] dark:hover:text-[#09111E] transition-colors cursor-pointer shadow-xs shrink-0"
              >
                {lang === "EN" ? "Register" : "Đăng ký"}
              </button>
            </div>
          )}

          {/* High-Contrast Main Action Button */}
          <button
            onClick={onOpenChecker}
            className="flex items-center gap-2 px-4.5 h-9 rounded-xl bg-[#0F223D] hover:bg-[#152e50] text-[#EAD7B8] border border-[#EAD7B8] hover:border-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-98 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EAD7B8] animate-pulse" />
            <span>{lang === "EN" ? "Check Contract" : "Kiểm Tra Ngay"}</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="lg:hidden flex items-center gap-2">
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
          {/* Mobile Lang & 3-segment Theme Selector */}
          <div className="pb-3 border-b border-[#EFE8D8] dark:border-[#162744] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#65778F] dark:text-[#8FA3BF]">
                {lang === "EN" ? "Interface theme" : "Chế độ giao diện"}:
              </span>
              <button
                onClick={toggleLang}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#DCD3BE] dark:border-[#1F3354] text-xs font-bold text-[#0F1E36] dark:text-white"
              >
                <Globe className="w-3.5 h-3.5 text-[#8A6731]" />
                <span>{lang}</span>
              </button>
            </div>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#DCD3BE] dark:border-[#1F3354] bg-[#F0EAE0]/60 dark:bg-[#0D1829] text-xs font-bold text-[#0F1E36] dark:text-[#CAD8ED] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-[#E5A93C]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#49627D]" />
                )}
                <span>
                  {theme === "dark"
                    ? (lang === "EN" ? "Dark theme" : "Giao diện: Tối")
                    : (lang === "EN" ? "Light theme" : "Giao diện: Sáng")}
                </span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1B2F4E] text-[11px] font-extrabold text-[#8A6731] dark:text-[#EAD7B8] shadow-2xs">
                {theme === "dark"
                  ? (lang === "EN" ? "Switch Light" : "Chuyển Sáng")
                  : (lang === "EN" ? "Switch Dark" : "Chuyển Tối")}
              </span>
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
