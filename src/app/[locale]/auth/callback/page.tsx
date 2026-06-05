"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string || 'tr').toLowerCase();
  const [statusMsg, setStatusMsg] = useState('Girişiniz doğrulanıyor, lütfen bekleyin...');

  useEffect(() => {
    async function handleAuth() {
      // Supabase hash parametrelerini çöz
      // Örnek: #access_token=...&refresh_token=...&token_type=bearer
      const hash = window.location.hash;
      if (!hash) {
        setStatusMsg('Oturum anahtarı bulunamadı. Ana sayfaya yönlendiriliyorsunuz...');
        setTimeout(() => router.replace(`/${locale}`), 2000);
        return;
      }

      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (!accessToken) {
        setStatusMsg('Oturum token doğrulaması başarısız. Ana sayfaya yönlendiriliyorsunuz...');
        setTimeout(() => router.replace(`/${locale}`), 2000);
        return;
      }

      try {
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken }),
        });

        const result = await response.json();

        if (result.success) {
          setStatusMsg('Giriş başarılı! Yönlendiriliyorsunuz...');
          // URL hash'ini temizle
          window.history.replaceState(null, '', window.location.pathname);
          // Ana sayfaya veya randevu sayfasına yönlendir
          router.replace(`/${locale}`);
          router.refresh();
        } else {
          setStatusMsg(`Giriş hatası: ${result.error || 'Doğrulanamadı.'}`);
          setTimeout(() => router.replace(`/${locale}`), 3000);
        }
      } catch (err) {
        console.error(err);
        setStatusMsg('Bağlantı hatası oluştu.');
        setTimeout(() => router.replace(`/${locale}`), 3000);
      }
    }

    handleAuth();
  }, [router, locale]);

  return (
    <main className="min-h-screen bg-[#faf8f7] flex items-center justify-center p-6 text-center">
      <div className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-8 max-w-sm w-full shadow-md space-y-4">
        {/* Lüks Loading Animasyonu */}
        <div className="w-12 h-12 border-4 border-pink-100 border-t-[var(--color-primary-500)] rounded-full animate-spin mx-auto"></div>
        <h1 className="text-lg font-serif italic font-bold text-gray-800">
          Oturum Açılıyor
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          {statusMsg}
        </p>
      </div>
    </main>
  );
}
