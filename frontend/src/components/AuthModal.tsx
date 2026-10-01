import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { useLanguage } from '../lib/language-context';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

type Tab = 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register } = useAuth();
  const { lang } = useLanguage();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [socialPendingProvider, setSocialPendingProvider] = useState<'Gmail' | 'Facebook' | null>(null);
  const [socialPulseKey, setSocialPulseKey] = useState(0);

  React.useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      reset();
    }
  }, [isOpen, initialTab]);

  const reset = () => {
    setEmail(''); setPassword(''); setFullName('');
    setError(null); setSuccess(null); setLoading(false);
    setSocialPendingProvider(null);
  };

  const switchTab = (t: Tab) => { setTab(t); reset(); };

  const handleSocialClick = (provider: 'Gmail' | 'Facebook') => {
    setSocialPendingProvider(provider);
    setSocialPulseKey((k) => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
        setSuccess(lang === 'EN' ? 'Logged in successfully!' : 'Đăng nhập thành công!');
        setTimeout(onClose, 800);
      } else {
        await register(email, password, fullName || undefined);
        setSuccess(lang === 'EN' ? 'Registered successfully! Signing in...' : 'Đăng ký thành công! Đang đăng nhập...');
        setTimeout(onClose, 800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (lang === 'EN' ? 'An error occurred' : 'Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="cursor-default bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1e3558] shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EAD7B8] to-[#d8bf97] flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5 text-[#10253f]" />
              </div>
              <div>
                <h2 className="font-bold text-[#10253f] dark:text-white text-base">WeebLegit</h2>
                <p className="text-xs text-[#8297ac] dark:text-[#94a3b8]">
                  {lang === 'EN' ? 'Contract Verification Platform' : 'Nền tảng xác thực hợp đồng'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8297ac] dark:text-[#94a3b8] hover:text-[#10253f] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#162744] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab switcher */}
          <div className="px-6 pb-4">
            <div className="flex bg-[#f2f7fc] dark:bg-[#13233f] rounded-xl p-1 gap-1 border border-transparent dark:border-[#1e3558]">
              {(['login', 'register'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchTab(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    tab === t
                      ? 'bg-white dark:bg-[#1b3155] text-[#8a6834] dark:text-[#EAD7B8] shadow-sm'
                      : 'text-[#49627d] dark:text-[#94a3b8] hover:text-[#10253f] dark:hover:text-white'
                  }`}
                >
                  {t === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {t === 'login'
                    ? (lang === 'EN' ? 'Log In' : 'Đăng nhập')
                    : (lang === 'EN' ? 'Sign Up' : 'Đăng ký')}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
            {tab === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8297ac] dark:text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder={lang === 'EN' ? 'Full name (optional)' : 'Họ và tên (tuỳ chọn)'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#13233f] border border-[#d8e3ef] dark:border-[#243d63] text-sm text-[#10253f] dark:text-white placeholder:text-[#8297ac] dark:placeholder:text-[#64748b] focus:outline-none focus:border-[#EAD7B8] focus:ring-2 focus:ring-[#EAD7B8]/20 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8297ac] dark:text-[#94a3b8]" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#13233f] border border-[#d8e3ef] dark:border-[#243d63] text-sm text-[#10253f] dark:text-white placeholder:text-[#8297ac] dark:placeholder:text-[#64748b] focus:outline-none focus:border-[#EAD7B8] focus:ring-2 focus:ring-[#EAD7B8]/20 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8297ac] dark:text-[#94a3b8]" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder={lang === 'EN' ? 'Password (min. 8 characters)' : 'Mật khẩu (ít nhất 8 ký tự)'}
                value={password}
                required
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#13233f] border border-[#d8e3ef] dark:border-[#243d63] text-sm text-[#10253f] dark:text-white placeholder:text-[#8297ac] dark:placeholder:text-[#64748b] focus:outline-none focus:border-[#EAD7B8] focus:ring-2 focus:ring-[#EAD7B8]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8297ac] dark:text-[#94a3b8] hover:text-[#10253f] dark:hover:text-white transition-colors cursor-pointer"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="px-3 py-2 bg-[#fff1f0] dark:bg-red-950/50 border border-[#ffd1cc] dark:border-red-900/60 rounded-lg text-xs text-[#e4534b] dark:text-red-300 font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="px-3 py-2 bg-[#eafbf7] dark:bg-emerald-950/50 border border-[#b7f6e5] dark:border-emerald-900/60 rounded-lg text-xs text-[#159f7b] dark:text-emerald-300 font-medium">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#10253f]/40 border-t-[#10253f] rounded-full animate-spin" />
              ) : tab === 'login' ? (
                <><LogIn className="w-4 h-4" /> {lang === 'EN' ? 'Log In' : 'Đăng nhập'}</>
              ) : (
                <><UserPlus className="w-4 h-4" /> {lang === 'EN' ? 'Create Account' : 'Tạo tài khoản'}</>
              )}
            </button>

            {/* Social Registration / Login (Gmail & Facebook) */}
            <div className="pt-2">
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-[#d8e3ef] dark:border-[#1e3558] w-full" />
                <span className="bg-white dark:bg-[#0b1424] px-3 text-[11px] font-medium text-[#8297ac] dark:text-[#94a3b8] shrink-0">
                  {tab === 'register'
                    ? (lang === 'EN' ? 'Or sign up quickly with' : 'Hoặc đăng ký bằng')
                    : (lang === 'EN' ? 'Or continue with' : 'Hoặc tiếp tục với')}
                </span>
                <div className="border-t border-[#d8e3ef] dark:border-[#1e3558] w-full" />
              </div>

              <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                <button
                  type="button"
                  onClick={() => handleSocialClick('Gmail')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#d8e3ef] dark:border-[#243d63] bg-white dark:bg-[#13233f] hover:bg-red-50/50 dark:hover:bg-red-950/30 hover:border-red-400 text-xs font-bold text-[#10253f] dark:text-white transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.9 7.4 24 12 24z"
                    />
                  </svg>
                  <span>Gmail</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('Facebook')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#d8e3ef] dark:border-[#243d63] bg-white dark:bg-[#13233f] hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-400 text-xs font-bold text-[#10253f] dark:text-white transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 text-[#1877F2] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              {socialPendingProvider && (
                <motion.div
                  key={socialPulseKey}
                  initial={{ scale: 0.96, opacity: 0.5 }}
                  animate={{ scale: [1, 1.03, 1], opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className="mt-3 p-3 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold text-center shadow-sm animate-pulse"
                >
                  🔴{" "}
                  {lang === 'EN'
                    ? `${socialPendingProvider} Login / Sign Up is currently pending update (Coming Soon). Please use email & password above.`
                    : `Tính năng đăng ký / đăng nhập bằng ${socialPendingProvider} hiện ĐANG CHỜ UPDATE (Chờ cập nhật). Vui lòng sử dụng tài khoản Email phía trên.`}
                </motion.div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
