"use client";

import { useState } from 'react';
import { loginCustomer, registerCustomer } from '@/app/actions/customerAuth';
import { X, Sparkles, Mail, Lock, User, Phone, CheckSquare, Square, Globe } from 'lucide-react';
import Link from 'next/link';

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

  if (!isOpen) return null;

  const handleOAuth = (provider: 'google' | 'apple') => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rzwagnztdyrvjrzbrlxb.supabase.co";
    const redirectUrl = `${window.location.origin}/${locale}/auth/callback`;
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUrl)}`;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.append('kvkkConsent', kvkkConsent ? 'true' : 'false');
    formData.append('newsletterConsent', newsletterConsent ? 'true' : 'false');
    formData.append('locale', locale);

    const res = await registerCustomer(formData);
    setLoading(false);

    if (res.success) {
      setMsg('Kayıt başarılı! Oturum açılıyor...');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(res.error || 'Bir hata oluştu.');
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
      setMsg('Giriş başarılı! Yönlendiriliyorsunuz...');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(res.error || 'Bir hata oluştu.');
    }
  };

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    // Gerçek bir SMTP sıfırlama mektubu veya test simülasyonu
    const email = new FormData(e.currentTarget).get('email') as string;
    setTimeout(() => {
      setLoading(false);
      setMsg(`Şifre sıfırlama bağlantısı ${email} adresine gönderildi (Simüle edildi).`);
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Brand Title */}
        <div className="text-center mb-6 shrink-0">
          <h3 className="text-2xl font-serif font-bold text-gray-950 flex items-center justify-center gap-1.5">
            <Sparkles size={22} className="text-[var(--color-rose-600)]" />
            Nails & Lashes Studio
          </h3>
          <p className="text-xs text-gray-400 mt-1">Bakımlı eller ve çarpıcı bakışlar dünyasına hoş geldiniz.</p>
        </div>

        {/* Tab Buttons */}
        {activeTab !== 'forgot' && (
          <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 mb-6 shrink-0">
            <button
              onClick={() => { setActiveTab('login'); setError(null); setMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(null); setMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Üye Ol
            </button>
          </div>
        )}

        {/* Info & Error Messages */}
        <div className="space-y-4 overflow-y-auto flex-1 px-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-2xl">
              {error}
            </div>
          )}
          {msg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-2xl">
              {msg}
            </div>
          )}

          {/* Form 1: Giriş Yap */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">E-Posta Adresi</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="ornek@mail.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Şifre</label>
                  <button 
                    type="button" 
                    onClick={() => { setActiveTab('forgot'); setError(null); setMsg(null); }}
                    className="text-[10px] text-[var(--color-rose-600)] hover:underline font-bold"
                  >
                    Şifremi Unuttum
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gray-950 hover:bg-black disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
              </button>
            </form>
          )}

          {/* Form 2: Üye Ol */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ad Soyad *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Adınız Soyadınız"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">E-Posta Adresi *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="ornek@mail.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Telefon</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone size={16} />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+90 5xx xxx xx xx"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Şifre *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Şifre Tekrar *</label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              {/* KVKK Consent */}
              <div className="flex items-start gap-2 text-xs text-gray-500 select-none">
                <button
                  type="button"
                  onClick={() => setKvkkConsent(!kvkkConsent)}
                  className="text-[var(--color-rose-600)] shrink-0 mt-0.5"
                >
                  {kvkkConsent ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <span>
                  <Link href={`/${locale}/kvkk`} target="_blank" className="text-[var(--color-rose-600)] hover:underline font-bold">KVKK Aydınlatma Metnini</Link> okudum ve onaylıyorum.
                </span>
              </div>

              {/* Newsletter Consent */}
              <div className="flex items-start gap-2 text-xs text-gray-500 select-none">
                <button
                  type="button"
                  onClick={() => setNewsletterConsent(!newsletterConsent)}
                  className="text-[var(--color-rose-600)] shrink-0 mt-0.5"
                >
                  {newsletterConsent ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <span>Kampanyalardan, indirimlerden haberdar olmak için e-bültene abone olmak istiyorum.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gray-950 hover:bg-black disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'ÜYE KAYDEDİLİYOR...' : 'ÜYE OL'}
              </button>
            </form>
          )}

          {/* Form 3: Şifremi Unuttum */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">E-Posta Adresiniz</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="ornek@mail.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setError(null); setMsg(null); }}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-2xl transition-colors cursor-pointer text-center bg-white uppercase tracking-widest"
                >
                  Geri Dön
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gray-950 hover:bg-black disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md cursor-pointer"
                >
                  {loading ? 'GÖNDERİLİYOR...' : 'Sıfırla'}
                </button>
              </div>
            </form>
          )}

          {/* Sosyal Girişler */}
          {activeTab !== 'forgot' && (
            <div className="pt-6 border-t border-gray-100 space-y-3 shrink-0">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200/60"></div>
                <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">veya</span>
                <div className="flex-grow border-t border-gray-200/60"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl text-xs font-bold hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Globe size={16} className="text-red-500" /> Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('apple')}
                  className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl text-xs font-bold hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Sparkles size={16} className="text-black" /> Apple
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
