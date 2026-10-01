"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Check,
  X,
  Building2,
  GraduationCap,
  Crown,
  Zap,
  Lock,
  Server,
  KeyRound,
  CreditCard,
  Scale,
  Handshake,
  Megaphone,
  Layers,
  AlertCircle,
  User as UserIcon,
  History,
  Settings,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Globe,
  FileStack,
  GitCompare,
  FileCheck2,
  Bot,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../lib/language-context";
import { useTheme } from "../../lib/theme-context";
import { FloatingAiWidget } from "../../components/FloatingAiWidget";

export default function UpgradePage() {
  const { user, logout, login } = useAuth();
  const { lang: rawLang, toggleLang } = useLanguage();
  const lang = rawLang.toLowerCase();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"individual" | "enterprise">("individual");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedPlanModal, setSelectedPlanModal] = useState<{
    id: string;
    name: string;
    price: string;
    isEnterprise?: boolean;
  } | null>(null);
  const [switchingEmail, setSwitchingEmail] = useState<string | null>(null);

  const currentTier = user?.plan_tier || (user?.role === "admin" ? "pro" : "free");
  const tierBadge = user?.role === "admin" ? "pro/ad" : currentTier;
  const displayName = user ? user.full_name || user.email.split("@")[0] : "";

  const handleQuickSwitchAccount = async (email: string, password: string) => {
    try {
      setSwitchingEmail(email);
      await login(email, password);
    } catch {
      // ignore
    } finally {
      setSwitchingEmail(null);
    }
  };

  const individualPlans = [
    {
      id: "free",
      badge: "-free-",
      name: lang === "vi" ? "Free" : "Free",
      target: lang === "vi" ? "Mọi người dùng" : "All Users",
      price: lang === "vi" ? "0đ / tháng" : "0 VND / month",
      subtitle:
        lang === "vi"
          ? "Trải nghiệm rà soát hợp đồng & xác thực SHA-256 cơ bản."
          : "Basic contract risk score & SHA-256 integrity verification.",
      highlight: false,
      accentColor: "slate",
      features: [
        {
          included: true,
          text:
            lang === "vi"
              ? "Tải lên tối đa 1 hợp đồng / lần"
              : "Upload 1 contract at a time",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Giới hạn 5 hợp đồng / ngày (30 hợp đồng / tháng)"
              : "Quota: 5 contracts / day (30 / month)",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Chấm điểm rủi ro tổng quát & xác thực mã băm SHA-256"
              : "Overall risk score & SHA-256 hash verification",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Truy cập kho hợp đồng mẫu có chú giải cơ bản"
              : "Access annotated sample contract library",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Trợ lý AI tốc độ chuẩn (tối đa 3 câu/phút, ngữ cảnh 2.500 ký tự)"
              : "Standard AI Assistant (3 req/min, 2,500 chars context)",
        },
        {
          included: false,
          text:
            lang === "vi"
              ? "Đánh giá rủi ro chi tiết từng điều khoản & Heatmap"
              : "Clause-by-clause risk breakdown & Heatmap",
        },
        {
          included: false,
          text:
            lang === "vi"
              ? "So sánh 2 hợp đồng cùng loại & So sánh giá thị trường"
              : "Same-type contract comparison & Market price benchmark",
        },
        {
          included: false,
          text:
            lang === "vi"
              ? "Xuất báo cáo pháp lý PDF chuyên sâu"
              : "Export full PDF legal verification report",
        },
      ],
    },
    {
      id: "medium",
      badge: "-medium-",
      name: lang === "vi" ? "Medium" : "Medium",
      target:
        lang === "vi"
          ? "Sinh viên & Cá nhân (Khuyên dùng)"
          : "Students & Individuals (Recommended)",
      price:
        lang === "vi"
          ? "33.000đ / tháng"
          : "33,000 VND / month",
      priceNote:
        lang === "vi"
          ? "Miễn phí cho sinh viên đã xác thực (.edu.vn)"
          : "Free for verified students (.edu.vn)",
      subtitle:
        lang === "vi"
          ? "Mở khóa phân tích từng điều khoản, tải nhiều file và so sánh hợp đồng."
          : "Unlocks per-clause risk breakdown, batch upload & contract comparison.",
      highlight: true,
      accentColor: "indigo",
      features: [
        {
          included: true,
          text:
            lang === "vi"
              ? "Tải lên hàng loạt nhiều hợp đồng 1 lúc (tối đa 5 file/lần)"
              : "Batch upload multiple contracts at once (up to 5 files/batch)",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Mở rộng hạn mức: 25 hợp đồng / ngày (200 hợp đồng / tháng)"
              : "Expanded quota: 25 contracts / day (200 / month)",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Mở khóa Đánh giá rủi ro từng điều khoản (Clause Risk & Heatmap)"
              : "Unlocks Clause-by-clause Risk Evaluation & Heatmap",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Mở khóa So sánh 2 hợp đồng cùng loại (Contract Comparison)"
              : "Unlocks side-by-side comparison for same-type contracts",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Mở khóa So sánh giá thuê thị trường & gợi ý đàm phán"
              : "Unlocks Market Price Benchmark & negotiation scripts",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Trợ lý AI nâng cao: đính kèm tệp/ảnh (+), 15 câu/phút, 6.000 ký tự"
              : "Enhanced AI: file/image (+) upload, 15 req/min, 6,000 chars",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Lưu trữ lịch sử tra cứu đầy đủ theo tài khoản"
              : "Full persistent analysis & chat history",
        },
        {
          included: false,
          text:
            lang === "vi"
              ? "Xuất / In Báo cáo Pháp lý PDF chuyên sâu & Không giới hạn lượt"
              : "Unlimited quota & Full PDF Legal Certificate Export",
        },
      ],
    },
    {
      id: "pro",
      badge: "-pro-",
      name: lang === "vi" ? "Pro" : "Pro",
      target:
        lang === "vi"
          ? "Người đi làm / Freelancer / Chuyên gia"
          : "Professionals / Freelancers / Legal Experts",
      price: lang === "vi" ? "100.000đ / tháng" : "100,000 VND / month",
      subtitle:
        lang === "vi"
          ? "Xóa bỏ mọi giới hạn, tốc độ AI tối đa và xuất hồ sơ pháp lý PDF."
          : "Removes all limits, maximum AI context & PDF legal report export.",
      highlight: false,
      accentColor: "amber",
      features: [
        {
          included: true,
          text:
            lang === "vi"
              ? "Xóa bỏ giới hạn: KHÔNG GIỚI HẠN số hợp đồng ngày & tháng"
              : "UNLIMITED daily and monthly contract analyses",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Tải lên hàng loạt tới 20 hợp đồng / lần"
              : "Batch upload up to 20 contracts at once",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Toàn bộ tính năng gói Medium (Từng điều khoản, Heatmap, So sánh)"
              : "All Medium features (Per-clause breakdown, Heatmap, Compare)",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Mở khóa Xuất / In Báo cáo Pháp lý PDF kèm chứng thực SHA-256"
              : "Unlocks PDF Legal Report Export with SHA-256 certificate",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Trợ lý AI Pro không giới hạn tốc độ (ngữ cảnh sâu 16.000 ký tự)"
              : "Unlimited Pro AI Assistant (16,000 chars deep context)",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Soạn thảo văn bản / phụ lục đàm phán lại điều khoản tự động"
              : "Automated counter-offer & addendum drafting",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Ưu tiên kết nối luật sư / cố vấn pháp lý đối tác"
              : "Priority legal advisor & partner lawyer referral",
        },
        {
          included: true,
          text:
            lang === "vi"
              ? "Hỗ trợ kỹ thuật & kiểm định chuyên sâu 24/7"
              : "24/7 priority verification & support",
        },
      ],
    },
  ];

  const enterpriseStreams = [
    {
      icon: Scale,
      title:
        lang === "vi"
          ? "Tư vấn pháp lý cho bên đề xuất hợp đồng"
          : "Legal Advisory for Contract Issuers",
      desc:
        lang === "vi"
          ? "Chủ trọ, công ty tuyển CTV/thực tập, trung tâm khoá học, đơn vị cho vay muốn chuẩn hoá hợp đồng minh bạch, đúng luật."
          : "Landlords, internship/freelance employers, course centers, and lenders standardizing transparent, compliant contracts.",
    },
    {
      icon: Handshake,
      title:
        lang === "vi"
          ? "Phí giới thiệu (Referral Fees)"
          : "Partner Legal Referral Fees",
      desc:
        lang === "vi"
          ? "Kết nối người dùng và doanh nghiệp có nhu cầu tư vấn chuyên sâu với văn phòng luật / cố vấn pháp lý đối tác."
          : "Connects users and businesses needing specialized legal counsel with vetted partner law firms.",
    },
    {
      icon: Megaphone,
      title:
        lang === "vi"
          ? "Affiliate Marketing đã kiểm duyệt"
          : "Verified Affiliate Marketing",
      desc:
        lang === "vi"
          ? "Giới thiệu dịch vụ tài chính, bảo hiểm, ký túc xá / chỗ ở hoặc khoá học uy tín đã qua kiểm duyệt hợp đồng an toàn."
          : "Promotes trusted housing, financial, insurance, and educational services whose contracts pass strict safety audits.",
    },
    {
      icon: Layers,
      title:
        lang === "vi"
          ? "White-label cho Doanh nghiệp / Trường ĐH"
          : "White-label for Universities & Enterprises",
      desc:
        lang === "vi"
          ? "Cung cấp cổng rà soát hợp đồng nội bộ mang thương hiệu riêng cho phòng công tác sinh viên, CLB khởi nghiệp, SME."
          : "Branded internal contract auditing portals for university student affairs offices, startup incubators, and SMEs.",
    },
  ];

  const enterpriseProCapabilities = [
    {
      icon: Server,
      title:
        lang === "vi"
          ? "Trang Quản trị (Admin Portal) riêng biệt"
          : "Dedicated Enterprise Admin Portal",
      desc:
        lang === "vi"
          ? "Quản lý danh sách nhân sự, phân quyền phòng ban, cấu hình bộ quy tắc rủi ro (Risk Rules) và tham chiếu pháp lý riêng của doanh nghiệp."
          : "Manage team members, role permissions, custom enterprise Risk Rules, and private legal reference datasets.",
    },
    {
      icon: KeyRound,
      title:
        lang === "vi"
          ? "Cổng API & Webhook riêng (Dedicated API)"
          : "Dedicated REST API & Webhooks",
      desc:
        lang === "vi"
          ? "Tích hợp trực tiếp engine chấm điểm rủi ro và đối chiếu SHA-256 vào hệ thống ERP, HRM, CRM hoặc cổng tuyển dụng của công ty."
          : "Embed SHA-256 verification and AI clause auditing directly into your ERP, HRM, CRM, or onboarding workflows.",
    },
    {
      icon: CreditCard,
      title:
        lang === "vi"
          ? "Cơ chế tính tiền & Hóa đơn riêng (Custom Billing)"
          : "Custom Billing & Multi-Currency Invoicing",
      desc:
        lang === "vi"
          ? "Thanh toán linh hoạt theo sản lượng API, gói thuê bao năm, xuất hóa đơn VAT điện tử và hỗ trợ đa tiền tệ (VND / USD / SGD)."
          : "Volume-based API billing, annual enterprise contracts, VAT e-invoicing, and custom currency settlement (VND / USD / SGD).",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {lang === "vi" ? "Trang chủ" : "Home"}
              </span>
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0f172a] dark:bg-amber-500 flex items-center justify-center text-white dark:text-slate-950 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-400 dark:text-slate-950" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {lang === "vi" ? "Nâng Cấp Gói (Upgrade)" : "Subscription & Upgrade"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Legal Studio Link */}
            <Link
              href="/workspace"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Legal Studio</span>
            </Link>
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{lang === "vi" ? "VI" : "EN"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 flex items-center justify-center text-[11px] font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[140px] truncate">{displayName}</span>
                  <span className="text-[11px] font-normal opacity-55 lowercase">
                    -{tierBadge}-
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-20 text-sm">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <span>{displayName}</span>
                          <span className="text-xs font-normal opacity-55 lowercase">
                            -{tierBadge}-
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>
                          {lang === "vi" ? "Hồ sơ cá nhân" : "My Profile"}
                        </span>
                      </Link>

                      <Link
                        href="/upgrade"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50/60 dark:bg-amber-950/30"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {lang === "vi" ? "Nâng cấp gói (Upgrade)" : "Upgrade Plan"}
                        </span>
                      </Link>

                      <Link
                        href="/workspace"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>
                          {lang === "vi" ? "Legal Studio (/workspace)" : "Legal Studio (/workspace)"}
                        </span>
                      </Link>

                      <Link
                        href="/history"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      >
                        <History className="w-4 h-4 text-slate-400" />
                        <span>
                          {lang === "vi" ? "Lịch sử kiểm tra" : "Audit History"}
                        </span>
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-slate-800/70 font-medium"
                        >
                          <Settings className="w-4 h-4" />
                          <span>
                            {lang === "vi" ? "Quản trị hệ thống" : "Admin Panel"}
                          </span>
                        </Link>
                      )}

                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{lang === "vi" ? "Đăng xuất" : "Sign Out"}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/"
                className="px-3.5 py-1.5 rounded-xl bg-[#0f172a] dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                {lang === "vi" ? "Đăng nhập" : "Sign In"}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === "vi"
                ? "Mô Hình Kinh Doanh & Phân Quyền Tính Năng"
                : "Subscription Tiers & B2B Enterprise Solutions"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {lang === "vi"
              ? "Miễn phí để giữ chân sinh viên, giải pháp chuyên sâu cho cá nhân & doanh nghiệp"
              : "Accessible for Students, Powerful Legal Auditing for Individuals & Enterprises"}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {lang === "vi"
              ? "Chọn gói phù hợp với nhu cầu rà soát hợp đồng của bạn hoặc giải pháp API & Admin riêng cho doanh nghiệp."
              : "Choose the plan that fits your contract auditing needs or explore our dedicated Enterprise B2B platform."}
          </p>

          {/* Current Account Status Banner */}
          {user && (
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {lang === "vi" ? "Tài khoản hiện tại:" : "Current account:"}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {user.email}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold lowercase">
                -{tierBadge}-
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 dark:text-slate-300">
                {lang === "vi" ? "Hôm nay:" : "Today:"}{" "}
                <strong>
                  {currentTier === "pro" || user.daily_limit === -1
                    ? (user.daily_used ?? 0)
                    : `${user.daily_used ?? 0}/${user.daily_limit ?? 5}`}
                </strong>
              </span>
              <span className="text-slate-600 dark:text-slate-300">
                {lang === "vi" ? "Tháng này:" : "Month:"}{" "}
                <strong>
                  {currentTier === "pro" || user.monthly_limit === -1
                    ? (user.monthly_used ?? 0)
                    : `${user.monthly_used ?? 0}/${user.monthly_limit ?? 30}`}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* 2 Main Category Tabs: Cá nhân vs Doanh nghiệp */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab("individual")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === "individual"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-amber-400" />
              <span>
                {lang === "vi"
                  ? "Cá nhân & Sinh viên"
                  : "Individual & Students"}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("enterprise")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === "enterprise"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>
                {lang === "vi"
                  ? "Doanh nghiệp & Chủ hợp đồng"
                  : "Enterprise & B2B"}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: CÁ NHÂN & SINH VIÊN */}
        {activeTab === "individual" && (
          <div>
            {/* 3 Pricing Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
              {individualPlans.map((plan) => {
                const isCurrent = currentTier === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all border ${
                      plan.highlight
                        ? "bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-amber-500 shadow-xl shadow-indigo-500/10"
                        : "bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm"
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 dark:bg-amber-500 text-white dark:text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow">
                        {lang === "vi"
                          ? "Phổ biến nhất cho Sinh viên"
                          : "Most Popular for Students"}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-amber-400">
                          {plan.target}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono">
                          {plan.badge}
                        </span>
                      </div>

                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{plan.name}</span>
                        {plan.id === "pro" && (
                          <Crown className="w-5 h-5 text-amber-500" />
                        )}
                      </h2>

                      <div className="mt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                          {plan.price}
                        </div>
                        {plan.priceNote && (
                          <p className="mt-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            ★ {plan.priceNote}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {plan.subtitle}
                        </p>
                      </div>

                      <ul className="mt-5 space-y-3 text-sm">
                        {plan.features.map((f, idx) => (
                          <li
                            key={idx}
                            className={`flex items-start gap-2.5 ${
                              f.included
                                ? "text-slate-700 dark:text-slate-200"
                                : "text-slate-400 dark:text-slate-600 line-through"
                            }`}
                          >
                            {f.included ? (
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0 mt-0.5" />
                            )}
                            <span className="text-xs sm:text-sm leading-snug">
                              {f.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                      {isCurrent ? (
                        <button
                          onClick={() =>
                            setSelectedPlanModal({
                              id: plan.id,
                              name: plan.name,
                              price: plan.price,
                            })
                          }
                          className="w-full py-3 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>
                            {lang === "vi"
                              ? `Đang sử dụng gói ${plan.name}`
                              : `Current Plan (${plan.name})`}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setSelectedPlanModal({
                              id: plan.id,
                              name: plan.name,
                              price: plan.price,
                            })
                          }
                          className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            plan.highlight
                              ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 shadow-md"
                              : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white"
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          <span>
                            {lang === "vi"
                              ? `Nâng cấp lên ${plan.name}`
                              : `Upgrade to ${plan.name}`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Small Note Below Prices (Required by Pitch Slide) */}
            <div className="mt-6 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-center">
              <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                {lang === "vi"
                  ? "💡 Chiến lược: giữ chi phí cho sinh viên ở mức thấp/miễn phí để tối đa hoá số người dùng và dữ liệu hợp đồng; doanh thu chính đến từ phía doanh nghiệp và chủ hợp đồng (theo Business Model Canvas của nhóm)."
                  : "💡 Strategy: Keep costs low/free for students to maximize user adoption and contract dataset growth; primary revenue is generated from enterprises and contract issuers (per our Business Model Canvas)."}
              </p>
            </div>

            {/* Feature Matrix Table */}
            <div className="mt-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {lang === "vi"
                      ? "Bảng phân quyền chức năng chi tiết theo từng bản Upgrade"
                      : "Detailed Feature Allocation by Upgrade Tier"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {lang === "vi"
                      ? "Các giới hạn được kiểm soát trực tiếp trên cả Giao diện và Backend API."
                      : "All limits are enforced across both the UI and Backend API."}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3.5 px-5 font-bold">
                        {lang === "vi" ? "Tính năng hệ thống" : "System Feature"}
                      </th>
                      <th className="py-3.5 px-4 font-bold text-center">
                        Free <span className="font-normal opacity-60">-free-</span>
                      </th>
                      <th className="py-3.5 px-4 font-bold text-center text-indigo-600 dark:text-amber-400">
                        Medium <span className="font-normal opacity-60">-medium-</span>
                      </th>
                      <th className="py-3.5 px-4 font-bold text-center text-amber-600 dark:text-amber-400">
                        Pro <span className="font-normal opacity-60">-pro-</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    <tr>
                      <td className="py-3.5 px-5 font-medium flex items-center gap-2">
                        <FileStack className="w-4 h-4 text-slate-400" />
                        <span>
                          {lang === "vi"
                            ? "Số hợp đồng tải lên cùng lúc (Batch Upload)"
                            : "Simultaneous Contract Upload (Batch)"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">1 file / lần</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-indigo-600 dark:text-amber-400">
                        Tối đa 5 file / lần
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        Tối đa 20 file / lần
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-5 font-medium">
                        {lang === "vi"
                          ? "Giới hạn lượt phân tích Trong ngày / Trong tháng"
                          : "Daily / Monthly Analysis Quota"}
                      </td>
                      <td className="py-3.5 px-4 text-center">5 / ngày • 30 / tháng</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-indigo-600 dark:text-amber-400">
                        25 / ngày • 200 / tháng
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        Không giới hạn (Unlimited)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-5 font-medium flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-slate-400" />
                        <span>
                          {lang === "vi"
                            ? "Mức độ hiển thị báo cáo rủi ro"
                            : "Risk Evaluation Depth"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500">
                        {lang === "vi"
                          ? "Chỉ điểm tổng quát & SHA-256 (Khóa chi tiết điều khoản)"
                          : "Overall score & SHA-256 only (Clauses locked)"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-indigo-600 dark:text-amber-400">
                        {lang === "vi"
                          ? "Mở khóa đánh giá từng điều khoản & Heatmap"
                          : "Full per-clause evaluation & Heatmap"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {lang === "vi"
                          ? "Toàn diện + Xuất báo cáo PDF Pháp lý"
                          : "Full + Legal PDF Certificate Export"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-5 font-medium flex items-center gap-2">
                        <GitCompare className="w-4 h-4 text-slate-400" />
                        <span>
                          {lang === "vi"
                            ? "So sánh 2 hợp đồng cùng loại (Contract Compare)"
                            : "Side-by-Side Same-Type Contract Comparison"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400">
                        <Lock className="w-4 h-4 inline" />
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ {lang === "vi" ? "Mở khóa (Cùng loại HĐ)" : "Unlocked (Same type)"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ {lang === "vi" ? "Mở khóa toàn bộ" : "Fully Unlocked"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-5 font-medium flex items-center gap-2">
                        <Bot className="w-4 h-4 text-slate-400" />
                        <span>
                          {lang === "vi"
                            ? "Tốc độ xử lý AI & Đính kèm tệp (+) trong Chat"
                            : "AI Processing Rate & Chat File (+) Upload"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500">
                        3 câu/phút • Khóa nút (+)
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-indigo-600 dark:text-amber-400">
                        15 câu/phút • Mở khóa nút (+)
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        Không giới hạn • Ngữ cảnh 16k ký tự
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3 Dedicated Accounts Switcher Box for Evaluators */}
            <div className="mt-10 p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    {lang === "vi"
                      ? "Tài khoản kiểm thử 3 gói (Đã cấu hình sẵn)"
                      : "Pre-seeded Tier Accounts for Evaluation"}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold">
                    {lang === "vi"
                      ? "Chuyển nhanh giữa 3 tài khoản riêng biệt tương ứng 3 bản Upgrade"
                      : "Switch between the 3 dedicated accounts for each Upgrade Tier"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === "vi"
                      ? "Mật khẩu chung: User@123456 (Ghi chú đầy đủ trong README.md)"
                      : "Common password: User@123456 (Documented in README.md)"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { email: "free@weeblegit.vn", label: "USER -free-", tier: "free" },
                    { email: "medium@weeblegit.vn", label: "USER -medium-", tier: "medium" },
                    { email: "pro@weeblegit.vn", label: "USER -pro-", tier: "pro" },
                  ].map((acc) => {
                    const active = user?.email === acc.email;
                    return (
                      <button
                        key={acc.email}
                        disabled={switchingEmail !== null}
                        onClick={() => handleQuickSwitchAccount(acc.email, "User@123456")}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          active
                            ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        }`}
                      >
                        {switchingEmail === acc.email
                          ? lang === "vi"
                            ? "Đang đăng nhập..."
                            : "Signing in..."
                          : `${acc.label} (${acc.email})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOANH NGHIỆP & CHỦ HỢP ĐỒNG (ENTERPRISE) */}
        {activeTab === "enterprise" && (
          <div className="space-y-10">
            {/* Enterprise Hero Card */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 border border-slate-800 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>WeebLegit Enterprise & B2B</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                    {lang === "vi"
                      ? "Toàn bộ sức mạnh của bản Pro + Trang Admin riêng, Cổng API & Cơ chế tính phí riêng"
                      : "Full Pro Capabilities + Dedicated Admin Portal, Custom API & Tailored Billing"}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {lang === "vi"
                      ? "Dành cho trường Đại học, chuỗi căn hộ/ký túc xá, doanh nghiệp tuyển dụng CTV/Intern, trung tâm đào tạo và tổ chức tài chính muốn chuẩn hoá hợp đồng và tích hợp AI rà soát tự động."
                      : "Built for Universities, housing operators, employers, training institutions, and financial organizations seeking automated contract compliance."}
                  </p>

                  {/* Enterprise Capabilities List */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                    {enterpriseProCapabilities.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={i}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10"
                        >
                          <Icon className="w-5 h-5 text-amber-400 mb-2" />
                          <h3 className="text-xs font-bold text-white">
                            {item.title}
                          </h3>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Pricing hidden -> Red Contact Link & Pending Update Note */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 border-2 border-red-500/80 shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {lang === "vi"
                        ? "Báo giá Doanh nghiệp & Tổ chức"
                        : "Enterprise & Institutional Pricing"}
                    </span>
                    <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                      {lang === "vi"
                        ? "Thiết kế riêng theo quy mô & sản lượng API"
                        : "Custom Quote by Scale & API Volume"}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {lang === "vi"
                        ? "Bao gồm toàn bộ tính năng gói Pro không giới hạn, triển khai trang Admin riêng, tiền tệ thanh toán riêng và tích hợp API."
                        : "Includes unlimited Pro features, dedicated Admin instance, custom billing currency, and API integration."}
                    </p>

                    {/* RED CONTACT LINK WITH PENDING UPDATE NOTE (Exact user requirement) */}
                    <div className="mt-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <button
                            onClick={() =>
                              setSelectedPlanModal({
                                id: "enterprise",
                                name:
                                  lang === "vi"
                                    ? "Gói Doanh Nghiệp (Enterprise B2B)"
                                    : "Enterprise B2B Plan",
                                price:
                                  lang === "vi"
                                    ? "Liên hệ báo giá riêng"
                                    : "Custom Enterprise Quote",
                                isEnterprise: true,
                              })
                            }
                            className="text-left text-sm font-extrabold text-red-600 dark:text-red-400 underline hover:text-red-700"
                          >
                            {lang === "vi"
                              ? "👉 Đường dẫn liên hệ Phòng Kinh Doanh & Đối Tác B2B (Nhấn để mở)"
                              : "👉 Contact Enterprise Sales & B2B Partnership (Click to open)"}
                          </button>
                          <p className="mt-1 text-xs font-bold text-red-600 dark:text-red-400">
                            {lang === "vi"
                              ? "Ghi chú: (Chờ cập nhật — Đang hoàn thiện cổng kết nối & biểu phí B2B)"
                              : "Note: (Pending Update — Enterprise portal & B2B pricing link awaiting update)"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedPlanModal({
                          id: "enterprise",
                          name:
                            lang === "vi"
                              ? "Gói Doanh Nghiệp (Enterprise B2B)"
                              : "Enterprise B2B Plan",
                          price:
                            lang === "vi"
                              ? "Liên hệ báo giá riêng"
                              : "Custom Enterprise Quote",
                          isEnterprise: true,
                        })
                      }
                      className="mt-4 w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
                    >
                      {lang === "vi"
                        ? "Liên hệ nhận báo giá & Demo Admin riêng (Chờ cập nhật)"
                        : "Contact for Custom Quote & Dedicated Admin (Pending Update)"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 B2B Revenue Streams from Pitch Slide */}
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-5">
                {lang === "vi"
                  ? "Các hạng mục hợp tác Doanh nghiệp & Chủ hợp đồng (B2B)"
                  : "Enterprise & Contract Issuer Partnership Solutions (B2B)"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enterpriseStreams.map((stream, idx) => {
                  const Icon = stream.icon;
                  return (
                    <div
                      key={idx}
                      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {stream.title}
                        </h4>
                        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {stream.desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() =>
                            setSelectedPlanModal({
                              id: `b2b-${idx}`,
                              name: stream.title,
                              price:
                                lang === "vi"
                                  ? "Liên hệ đối tác B2B"
                                  : "Contact B2B Partner",
                              isEnterprise: true,
                            })
                          }
                          className="text-xs font-extrabold text-red-600 dark:text-red-400 underline hover:opacity-80"
                        >
                          {lang === "vi"
                            ? "Liên hệ hợp tác ngay (Chờ cập nhật)"
                            : "Contact for Partnership (Pending Update)"}
                        </button>
                        <span className="text-[11px] font-bold text-red-500">
                          * {lang === "vi" ? "Chờ cập nhật" : "Pending update"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PAYMENT / UPGRADE CLICK MODAL (Shows red notice and "Chờ cập nhật" note as required) */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 text-xs font-bold uppercase">
                  {selectedPlanModal.isEnterprise
                    ? lang === "vi"
                      ? "Liên hệ Doanh nghiệp"
                      : "Enterprise Inquiry"
                    : lang === "vi"
                    ? "Cổng Thanh Toán & Nâng Cấp"
                    : "Payment & Upgrade"}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {selectedPlanModal.name}
                </h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedPlanModal.price}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlanModal(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* RED NOTICE & NOTE CHỜ UPDATE (Exact user requirement) */}
            <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border-2 border-red-500 text-red-700 dark:text-red-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <p className="font-extrabold text-red-600 dark:text-red-400">
                    {lang === "vi"
                      ? "🔴 THÔNG BÁO: Cổng thanh toán trực tuyến & Đường dẫn liên hệ đang chờ cập nhật (Chờ update)"
                      : "🔴 NOTICE: Online Payment Gateway & Contact Link are Pending Update"}
                  </p>
                  <p className="font-medium leading-relaxed">
                    {lang === "vi"
                      ? "Tính năng thanh toán tự động qua VNPay / MoMo / Chuyển khoản QR và biểu mẫu liên hệ B2B đang trong giai đoạn tích hợp (Chờ cập nhật)."
                      : "Automated payment via VNPay / MoMo / QR Transfer and the B2B inquiry portal are currently awaiting integration (Pending update)."}
                  </p>
                  <p className="font-bold text-red-600 dark:text-red-400 underline">
                    {lang === "vi"
                      ? "Đường dẫn liên hệ: https://weeblegit.vn/contact-b2b (Chờ cập nhật)"
                      : "Contact Link: https://weeblegit.vn/contact-b2b (Pending update)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions to use the 3 dedicated accounts */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p className="font-bold text-slate-900 dark:text-white">
                {lang === "vi"
                  ? "💡 Hướng dẫn trải nghiệm ngay các gói bằng 3 tài khoản riêng biệt:"
                  : "💡 Test each tier immediately using our 3 dedicated accounts:"}
              </p>
              <ul className="space-y-1 font-mono text-[11px]">
                <li>
                  • <strong>free@weeblegit.vn</strong> (MK: User@123456) →{" "}
                  <span className="opacity-70">-free-</span>
                </li>
                <li>
                  • <strong>medium@weeblegit.vn</strong> (MK: User@123456) →{" "}
                  <span className="opacity-70">-medium-</span>
                </li>
                <li>
                  • <strong>pro@weeblegit.vn</strong> (MK: User@123456) →{" "}
                  <span className="opacity-70">-pro-</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedPlanModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold hover:opacity-90"
              >
                {lang === "vi" ? "Đã hiểu & Đóng" : "Got it & Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingAiWidget />
    </div>
  );
}
