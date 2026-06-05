"use client";

import { useState } from 'react';
import { loginAdmin } from '@/app/actions/auth';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await loginAdmin(formData);

    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Giriş başarısız.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gray-50">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-rose-400)]/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="glass-panel p-8 md:p-12 rounded-3xl w-full max-w-md animate-in fade-in zoom-in-95 duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 bg-white/60">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-rose-100)] text-[var(--color-rose-600)] rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 text-center tracking-tight">Yönetim Paneli</h1>
          <p className="text-gray-500 text-sm mt-2 text-center">Devam etmek için yönetici şifrenizi girin.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                name="password"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border-none bg-white/80 focus:ring-2 focus:ring-[var(--color-rose-400)] focus:bg-white outline-none transition-all shadow-sm" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-in fade-in">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin" /> Doğrulanıyor...</>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
