"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('Index');

  return (
    <footer className="w-full mt-24 border-t border-black/5 relative z-10 bg-white/50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold text-[var(--color-rose-500)] mb-6">Nails & Lashes</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Premium güzellik, tırnak ve kirpik tasarımında en yüksek kalite standartları ile hizmetinizdeyiz. 
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-700 hover:text-[var(--color-rose-500)] hover:bg-black/5 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-6">Hızlı Menü</h3>
            <ul className="flex flex-col gap-4 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-[var(--color-rose-500)] transition-colors">Ana Sayfa</Link></li>
              <li><Link href="/hizmetler" className="hover:text-[var(--color-rose-500)] transition-colors">{t('services')}</Link></li>
              <li><Link href="/galeri" className="hover:text-[var(--color-rose-500)] transition-colors">Galeri</Link></li>
              <li><Link href="/yorumlar" className="hover:text-[var(--color-rose-500)] transition-colors">Yorumlar</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-gray-800 font-semibold mb-6">İletişim</h3>
            <ul className="flex flex-col gap-4 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-rose-500)] shrink-0 mt-0.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Atatürk Caddesi, Güzellik Plaza No:123, Muratpaşa / Antalya</span>
              </li>
              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-rose-500)] shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>+90 555 123 45 67</span>
              </li>
              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-rose-500)] shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>info@nailslashesstudio.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Nails & Lashes Studio. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-800">Gizlilik Politikası</a>
            <a href="#" className="hover:text-gray-800">KVKK Aydınlatma Metni</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
