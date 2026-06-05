"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Instagram, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('Index');

  return (
    <footer className="w-full mt-24 border-t border-white/5 relative z-10 bg-black/50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">Nails & Lashes</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium güzellik, tırnak ve kirpik tasarımında en yüksek kalite standartları ile hizmetinizdeyiz. 
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-[#D4AF37] hover:bg-white/10 transition-all">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Hızlı Menü</h3>
            <ul className="flex flex-col gap-4 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-[#D4AF37] transition-colors">Ana Sayfa</Link></li>
              <li><Link href="/hizmetler" className="hover:text-[#D4AF37] transition-colors">{t('services')}</Link></li>
              <li><Link href="/galeri" className="hover:text-[#D4AF37] transition-colors">Galeri</Link></li>
              <li><Link href="/yorumlar" className="hover:text-[#D4AF37] transition-colors">Yorumlar</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-semibold mb-6">İletişim</h3>
            <ul className="flex flex-col gap-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Atatürk Caddesi, Güzellik Plaza No:123, Muratpaşa / Antalya</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#D4AF37] shrink-0" />
                <span>+90 555 123 45 67</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#D4AF37] shrink-0" />
                <span>info@nailslashesstudio.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Nails & Lashes Studio. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Gizlilik Politikası</a>
            <a href="#" className="hover:text-gray-300">KVKK Aydınlatma Metni</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
