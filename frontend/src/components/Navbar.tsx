import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  ArrowRight,
  Code2,
  LogOut,
  User,
  ChevronDown,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../lib/auth-context";

interface NavbarProps {
  onOpenChecker: () => void;
  onOpenTemplates: () => void;
  onOpenNextjsCode: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenChecker,
  onOpenTemplates,
  onOpenNextjsCode,
  onOpenAuth,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [lang, setLang] = useState<"VI" | "EN">("VI");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // ignore in SSR
    }
  }, []);

  const toggleLang = () => {
    setLang((prev) => (prev === "VI" ? "EN" : "VI"));
  };

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#f7fafc]/90 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <Image
            src="/Logo WeebLegit.png"
            alt="WeebLegit Logo"
            width={120}
            height={120}
            className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[16px] font-medium text-[#49627d]">
          <button
            onClick={() => scrollToSection("templates-section")}
            className="hover:text-[#10253f] transition-colors cursor-pointer"
          >
            Mẫu hợp đồng
          </button>
          <button
            onClick={() => scrollToSection("ai-section")}
            className="hover:text-[#10253f] transition-colors cursor-pointer"
          >
            Hỏi AI
          </button>
          <button
            onClick={() => scrollToSection("process-section")}
            className="hover:text-[#10253f] transition-colors cursor-pointer"
          >
            Quy trình
          </button>
          <button
            onClick={() => scrollToSection("sources-section")}
            className="hover:text-[#10253f] transition-colors cursor-pointer"
          >
            Nguồn luật
          </button>
        </nav>

        {/* Action Buttons — Desktop */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* 2 buttons nằm cạnh nhau, sát bên trái button Đăng nhập: Ngôn ngữ & Light/Dark mode */}
          <button
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d8e3ef] hover:border-[#EAD7B8] hover:bg-[#FAF6EF] text-[16px] font-medium text-[#49627d] hover:text-[#10253f] transition-all cursor-pointer"
            title="Chuyển đổi ngôn ngữ (VI / EN)"
          >
            <Globe className="w-4 h-4 text-[#8a6834]" />
            <span>{lang}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center p-2 rounded-xl border border-[#d8e3ef] hover:border-[#EAD7B8] hover:bg-[#FAF6EF] text-[16px] font-medium text-[#49627d] hover:text-[#10253f] transition-all cursor-pointer"
            title={isDark ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-[#49627d]" />
            )}
          </button>

          {user ? (
            /* ── Đã đăng nhập: hiển thị avatar + dropdown ── */
            <div className="relative ml-1">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#d8e3ef] hover:border-[#EAD7B8] hover:bg-[#FAF6EF] transition-all text-[16px] font-medium text-[#10253f] cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#EAD7B8] to-[#d8bf97] flex items-center justify-center text-[#10253f] text-xs font-bold uppercase">
                  {(user.full_name ?? user.email).charAt(0)}
                </div>
                <span className="max-w-[120px] truncate">
                  {user.full_name ?? user.email}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#8297ac] transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#d8e3ef] rounded-xl shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-[#e6edf4]">
                    <p className="text-xs font-semibold text-[#10253f] truncate">
                      {user.full_name ?? "Người dùng"}
                    </p>
                    <p className="text-xs text-[#8297ac] truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={onOpenChecker}
                    className="w-full text-left px-3 py-2 text-[15px] text-[#49627d] hover:bg-slate-50 hover:text-[#10253f] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4" /> Kiểm tra hợp đồng
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-[15px] text-[#e4534b] hover:bg-[#fff1f0] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Chưa đăng nhập ── */
            <>
              <button
                onClick={onOpenAuth}
                className="text-[16px] font-medium text-[#49627d] hover:text-[#10253f] px-3 py-2 transition-colors cursor-pointer ml-1"
              >
                Đăng nhập
              </button>

              <button
                onClick={onOpenChecker}
                className="inline-flex items-center gap-2 px-4 py-2 text-[16px] font-semibold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-xl shadow-sm shadow-[#EAD7B8]/40 transition-all hover:shadow-md hover:shadow-[#EAD7B8]/50 cursor-pointer active:scale-[0.98]"
              >
                <span>Dùng thử miễn phí</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenNextjsCode}
            className="p-2 text-xs font-medium text-[#8a6834] bg-[#FAF5ED] rounded-lg border border-[#EAD7B8]/60"
          >
            <Code2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#49627d] hover:text-[#10253f] rounded-lg hover:bg-slate-100 transition-colors"
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
        <div className="md:hidden border-b border-[#d8e3ef] bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <button
            onClick={() => scrollToSection("templates-section")}
            className="block w-full text-left px-3 py-2 text-[16px] font-medium text-[#10253f] hover:bg-slate-50 rounded-lg"
          >
            Mẫu hợp đồng
          </button>
          <button
            onClick={() => scrollToSection("ai-section")}
            className="block w-full text-left px-3 py-2 text-[16px] font-medium text-[#10253f] hover:bg-slate-50 rounded-lg"
          >
            Hỏi AI
          </button>
          <button
            onClick={() => scrollToSection("process-section")}
            className="block w-full text-left px-3 py-2 text-[16px] font-medium text-[#10253f] hover:bg-slate-50 rounded-lg"
          >
            Quy trình
          </button>
          <button
            onClick={() => scrollToSection("sources-section")}
            className="block w-full text-left px-3 py-2 text-[16px] font-medium text-[#10253f] hover:bg-slate-50 rounded-lg"
          >
            Nguồn luật
          </button>

          {/* Quick Language & Theme in Mobile */}
          <div className="flex items-center gap-2 px-1 py-2 border-t border-slate-100">
            <button
              onClick={toggleLang}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#d8e3ef] text-[16px] font-medium text-[#49627d]"
            >
              <Globe className="w-4 h-4 text-[#8a6834]" />
              <span>Ngôn ngữ: {lang}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#d8e3ef] text-[16px] font-medium text-[#49627d]"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-[#49627d]" />
              )}
              <span>{isDark ? "Giao diện: Tối" : "Giao diện: Sáng"}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-[16px] text-[#49627d]">
                  Xin chào,{" "}
                  <strong className="text-[#10253f]">
                    {user.full_name ?? user.email}
                  </strong>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenChecker();
                  }}
                  className="w-full py-2.5 text-center text-[16px] font-semibold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-xl"
                >
                  Kiểm tra hợp đồng
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 text-center text-[16px] font-semibold text-[#e4534b] border border-[#ffd1cc] rounded-xl"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full text-center py-2 text-[16px] font-medium text-[#49627d] hover:text-[#10253f]"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenChecker();
                  }}
                  className="w-full py-2.5 text-center text-[16px] font-semibold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-xl"
                >
                  Dùng thử miễn phí
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
