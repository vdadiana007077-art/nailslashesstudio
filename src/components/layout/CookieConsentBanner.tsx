"use client";

import { useState, useEffect } from 'react';
import { saveCookieConsent } from '@/app/actions/customerAuth';
import { ShieldCheck, Settings, CheckSquare, Square } from 'lucide-react';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        document.documentElement.classList.add('has-cookie-banner');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  const hideBanner = () => {
    setIsVisible(false);
    document.documentElement.classList.remove('has-cookie-banner');
  };

  const handleAcceptAll = async () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true
    }));
    
    await saveCookieConsent(true, true, true);
    hideBanner();
  };

  const handleSaveSettings = async () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      necessary: true,
      analytics,
      marketing
    }));

    await saveCookieConsent(true, analytics, marketing);
    hideBanner();
  };

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-50 animate-slide-up">
      <div className="glass-panel border border-[var(--color-rose-100)] rounded-3xl p-6 shadow-2xl relative overflow-hidden bg-white/95">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--color-rose-300)] via-[var(--color-rose-500)] to-[var(--color-rose-300)]"></div>
        
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-serif italic font-bold text-gray-900 text-sm">Çerez Tercihleriniz</h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Size daha iyi, kişiselleştirilmiş ve güvenli bir güzellik deneyimi sunmak için çerezleri kullanıyoruz.
            </p>
          </div>
        </div>

        {showSettings ? (
          <div className="mt-6 space-y-3 pt-4 border-t border-gray-100">
            {/* Zorunlu Çerezler */}
            <div className="flex items-start justify-between text-xs">
              <div>
                <p className="font-bold text-gray-800">Zorunlu Çerezler</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Sitenin çalışması için temel çerezler.</p>
              </div>
              <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-lg font-bold">Her Zaman Aktif</span>
            </div>

            {/* Analiz Çerezleri */}
            <div className="flex items-start justify-between text-xs">
              <div>
                <p className="font-bold text-gray-800">Analiz Çerezleri</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Ziyaretçi hareketlerini analiz etmek için.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setAnalytics(!analytics)}
                className="text-[var(--color-primary-600)] cursor-pointer"
              >
                {analytics ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
            </div>

            {/* Pazarlama Çerezleri */}
            <div className="flex items-start justify-between text-xs">
              <div>
                <p className="font-bold text-gray-800">Pazarlama Çerezleri</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Size özel kampanyaları gösterebilmek için.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setMarketing(!marketing)}
                className="text-[var(--color-primary-600)] cursor-pointer"
              >
                {marketing ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white cursor-pointer"
              >
                Geri Dön
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 py-2 bg-gray-950 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-black cursor-pointer"
              >
                Tercihleri Kaydet
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setShowSettings(true)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer bg-white"
            >
              <Settings size={12} /> Özelleştir
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2.5 bg-gray-950 hover:bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Kabul Et
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
