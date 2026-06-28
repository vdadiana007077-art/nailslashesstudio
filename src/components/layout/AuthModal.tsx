"use client";

import { useState } from 'react';
import { loginCustomer, registerCustomer } from '@/app/actions/customerAuth';
import { X, Sparkles, Mail, Lock, User, Phone, CheckSquare, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, locale, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Checkbox states
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const t = useTranslations('Auth');

  if (!isOpen) return null;

  const handleOAuth = (provider: 'google' | 'apple') => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rzwagnztdyrvjrzbrlxb.supabase.co";
    const redirectUrl = `${window.location.origin}/${locale}/auth/callback`;
    // Giriş sonrası dönülecek sayfayı kaydet
    localStorage.setItem('auth_redirect_path', window.location.pathname);
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUrl)}`;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMsg(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    if (password.length < 6) {
      setError(t('errPasswordLength'));
      return;
    }

    if (password !== passwordConfirm) {
      setError(t('errPasswordMismatch'));
      return;
    }

    if (!kvkkConsent) {
      setError(t('errKvkkRequired'));
      return;
    }

    setLoading(true);

    formData.append('kvkkConsent', kvkkConsent ? 'true' : 'false');
    formData.append('newsletterConsent', newsletterConsent ? 'true' : 'false');
    formData.append('locale', locale);

    const res = await registerCustomer(formData);
    setLoading(false);

    if (res.success) {
      setMsg(t('msgRegisterSuccess'));
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } else {
      setError(res.error || t('msgDefaultError'));
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await loginCustomer(formData);
    setLoading(false);

    if (res.success) {
      setMsg(t('msgLoginSuccess'));
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        if (res.data?.role === 'STAFF') {
          window.location.href = `/${locale}/staff`;
        } else {
          window.location.reload();
        }
      }, 1500);
    } else {
      setError(res.error || t('msgDefaultError'));
    }
  };

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    const email = new FormData(e.currentTarget).get('email') as string;
    setTimeout(() => {
      setLoading(false);
      setMsg(`Şifre sıfırlama bağlantısı ${email} adresine gönderildi.`);
    }, 1500);
  };

  const switchTab = (tab: 'login' | 'register' | 'forgot') => {
    setActiveTab(tab);
    setError(null);
    setMsg(null);
    setShowPassword(false);
    setShowPasswordConfirm(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-[420px] shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Decorative gradient top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--color-rose-400)] via-[var(--color-rose-500)] to-[var(--color-rose-600)]"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center pt-8 pb-2 px-8 shrink-0">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[var(--color-rose-100)] to-[var(--color-rose-200)] rounded-2xl mb-4 shadow-inner">
            <Sparkles size={24} className="text-[var(--color-rose-600)]" />
          </div>
          <h3 className="text-xl font-serif font-bold text-gray-900 tracking-tight">
            Nails & Lashes Studio
          </h3>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
            {activeTab === 'login' ? t('loginSubtitle') : activeTab === 'register' ? t('registerSubtitle') : t('forgotSubtitle')}
          </p>
        </div>

        {/* Sosyal Giriş Butonları — Formun Üstünde */}
        {activeTab !== 'forgot' && (
          <div className="px-8 pt-4 pb-2 shrink-0 space-y-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all text-gray-700 shadow-sm hover:shadow-md group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 transition-transform group-hover:scale-110">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>\n              {t('continueWithGoogle')}
            </button>

            {/* Apple ile giriş henüz yapılandırılmadığı için geçici olarak gizlenmiştir */}
            {/* 
            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              className="w-full flex items-center justify-center gap-3 py-3 bg-gray-950 border border-gray-950 rounded-2xl text-sm font-semibold hover:bg-black cursor-pointer transition-all text-white shadow-sm hover:shadow-md group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-5 h-5 fill-white transition-transform group-hover:scale-110">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
              Apple ile Devam Et
            </button>
            */}

            {/* Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative bg-white px-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {t('orWithEmail')}
              </div>
            </div>
          </div>
        )}

        {/* Tab Buttons */}
        {activeTab !== 'forgot' && (
          <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 mx-8 mb-4 shrink-0">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >\n              {t('loginTab')}
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >\n              {t('registerTab')}
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-8 pb-8 custom-scrollbar space-y-4">
          {/* Info & Error Messages */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-2xl flex items-start gap-2.5 leading-relaxed" style={{ animation: 'slideUp 0.3s ease-out' }}>
              <span className="shrink-0 mt-0.5">⚠️</span> {error}
            </div>
          )}
          {msg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium rounded-2xl flex items-start gap-2.5 leading-relaxed" style={{ animation: 'slideUp 0.3s ease-out' }}>
              <span className="shrink-0 mt-0.5">✅</span> {msg}
            </div>
          )}

          {/* Form 1: Giriş Yap */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t('emailLabel')}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={t('emailPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-300)] focus:border-transparent focus:bg-white transition-all text-sm text-gray-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('passwordLabel')}</label>
                  <button 
                    type="button" 
                    onClick={() => switchTab('forgot')}
                    className="text-[10px] text-[var(--color-rose-600)] hover:text-[var(--color-rose-700)] hover:underline font-bold transition-colors"
                  >
                    Şifremi Unuttum
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-300)] focus:border-transparent focus:bg-white transition-all text-sm text-gray-800"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-600)] hover:from-[var(--color-rose-600)] hover:to-[var(--color-rose-700)] disabled:from-gray-300 disabled:to-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> {t('loginLoading')}</>
                ) : (
                  <>{t('loginButton')} <ArrowRight size={14} /></>
                )}
              </button>
            </form>
          )}

          {/* Form 2: Üye Ol */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Ad Soyad *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={t('fullNamePlaceholder')}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-300)] focus:border-transparent focus:bg-white transition-all text-sm text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">E-Posta Adresi *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={t('emailPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-300)] focus:border-transparent focus:bg-white transition-all text-sm text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t('phoneLabel')}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone size={16} />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+90 5xx xxx xx xx"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-300)] focus:border-transparent focus:bg-white transition-all text-sm text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Şifre *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder={t('passwordMin')}
                      className="w-full px-3.5 pr-9 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-300)] focus:border-transparent focus:bg-white transition-all text-sm text-gray-800"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tekrar *</label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      name="passwordConfirm"
                      required
                      placeholder={t('passwordConfirmPlaceholder')}
                      className="w-full px-3.5 pr-9 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-300)] focus:border-transparent focus:bg-white transition-all text-sm text-gray-800"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showPasswordConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* KVKK Consent */}
              <div 
                className="flex items-start gap-3 text-[11px] text-gray-500 select-none p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setKvkkConsent(!kvkkConsent)}
              >
                <div className={`shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-md transition-all border-2 mt-0.5 ${kvkkConsent ? 'bg-[var(--color-rose-600)] border-[var(--color-rose-600)]' : 'bg-white border-gray-300'}`}>
                  {kvkkConsent && <CheckSquare size={12} className="text-white stroke-[3]" />}
                </div>
                <span className="leading-relaxed" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/${locale}/kvkk`} target="_blank" className="text-[var(--color-rose-600)] hover:text-[var(--color-rose-700)] hover:underline font-bold transition-colors">{t('kvkkLink')}</Link>{t('kvkkConsent')} <span className="text-rose-500">*</span>
                </span>
              </div>

              {/* Newsletter Consent */}
              <div 
                className="flex items-start gap-3 text-[11px] text-gray-500 select-none p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setNewsletterConsent(!newsletterConsent)}
              >
                <div className={`shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-md transition-all border-2 mt-0.5 ${newsletterConsent ? 'bg-[var(--color-rose-600)] border-[var(--color-rose-600)]' : 'bg-white border-gray-300'}`}>
                  {newsletterConsent && <CheckSquare size={12} className="text-white stroke-[3]" />}
                </div>
                <span className="leading-relaxed">{t('newsletterConsent')}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-600)] hover:from-[var(--color-rose-600)] hover:to-[var(--color-rose-700)] disabled:from-gray-300 disabled:to-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> {t('registerLoading')}</>
                ) : (
                  <>{t('registerButton')} <ArrowRight size={14} /></>
                )}
              </button>
            </form>
          )}

          {/* Form 3: Şifremi Unuttum */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-50 rounded-2xl mb-3">
                  <Lock size={22} className="text-amber-500" />
                </div>
                <h4 className="font-bold text-gray-900 text-base">Şifrenizi mi Unuttunuz?</h4>
                <p className="text-[11px] text-gray-400 mt-1.5">{t('forgotDesc')}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t('emailLabelForgot')}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={t('emailPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-300)] focus:border-transparent focus:bg-white transition-all text-sm text-gray-800"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-2xl transition-colors cursor-pointer text-center bg-white uppercase tracking-widest"
                >\n                  {t('goBack')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-600)] hover:from-[var(--color-rose-600)] hover:to-[var(--color-rose-700)] disabled:from-gray-300 disabled:to-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md cursor-pointer"
                >
                  {loading ? 'GÖNDERİLİYOR...' : 'SIFIRLA'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
