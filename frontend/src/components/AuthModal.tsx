'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setEmail(''); setPassword(''); setFullName('');
    setError(null); setSuccess(null); setLoading(false);
  };

  const switchTab = (t: Tab) => { setTab(t); reset(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
        setSuccess('Đăng nhập thành công!');
        setTimeout(onClose, 800);
      } else {
        await register(email, password, fullName || undefined);
        setSuccess('Đăng ký thành công! Đang đăng nhập...');
        setTimeout(onClose, 800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl border border-[#d8e3ef] shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EAD7B8] to-[#d8bf97] flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5 text-[#10253f]" />
              </div>
              <div>
                <h2 className="font-bold text-[#10253f] text-base">WeebLegit</h2>
                <p className="text-xs text-[#8297ac]">Nền tảng xác thực hợp đồng</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-[#8297ac] hover:text-[#10253f] hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab switcher */}
          <div className="px-6 pb-4">
            <div className="flex bg-[#f2f7fc] rounded-xl p-1 gap-1">
              {(['login', 'register'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    tab === t
                      ? 'bg-white text-[#8a6834] shadow-sm'
                      : 'text-[#49627d] hover:text-[#10253f]'
                  }`}
                >
                  {t === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
            {tab === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8297ac]" />
                <input
                  type="text"
                  placeholder="Họ và tên (tuỳ chọn)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#d8e3ef] text-sm text-[#10253f] placeholder:text-[#8297ac] focus:outline-none focus:border-[#EAD7B8] focus:ring-2 focus:ring-[#EAD7B8]/20 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8297ac]" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#d8e3ef] text-sm text-[#10253f] placeholder:text-[#8297ac] focus:outline-none focus:border-[#EAD7B8] focus:ring-2 focus:ring-[#EAD7B8]/20 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8297ac]" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Mật khẩu (ít nhất 8 ký tự)"
                value={password}
                required
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#d8e3ef] text-sm text-[#10253f] placeholder:text-[#8297ac] focus:outline-none focus:border-[#EAD7B8] focus:ring-2 focus:ring-[#EAD7B8]/20 transition-all"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8297ac] hover:text-[#10253f] transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="px-3 py-2 bg-[#fff1f0] border border-[#ffd1cc] rounded-lg text-xs text-[#e4534b] font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="px-3 py-2 bg-[#eafbf7] border border-[#b7f6e5] rounded-lg text-xs text-[#159f7b] font-medium">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#EAD7B8] hover:bg-[#dfc59f] text-[#10253f] text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#10253f]/40 border-t-[#10253f] rounded-full animate-spin" />
              ) : tab === 'login' ? (
                <><LogIn className="w-4 h-4" /> Đăng nhập</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Tạo tài khoản</>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
