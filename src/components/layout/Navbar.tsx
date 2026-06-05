"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const t = useTranslations('Index');
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-panel py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-[#D4AF37] tracking-wider">
          N&L
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">
            Ana Sayfa
          </Link>
          <Link href="/hizmetler" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">
            {t('services')}
          </Link>
          <Link href="/galeri" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">
            Galeri
          </Link>
          <Link href="/iletisim" className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors">
            İletişim
          </Link>
        </div>

        {/* Right Actions: Lang + Booking */}
        <div className="hidden md:flex items-center gap-6">
          <div className="group relative cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
            <span className="text-sm font-medium uppercase">TR</span>
            
            {/* Lang Dropdown */}
            <div className="absolute top-full right-0 mt-4 w-32 glass-panel rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <Link href={pathname} locale="tr" className="block px-4 py-2 text-sm hover:bg-white/10">Türkçe</Link>
              <Link href={pathname} locale="en" className="block px-4 py-2 text-sm hover:bg-white/10">English</Link>
              <Link href={pathname} locale="de" className="block px-4 py-2 text-sm hover:bg-white/10">Deutsch</Link>
              <Link href={pathname} locale="ru" className="block px-4 py-2 text-sm hover:bg-white/10">Русский</Link>
            </div>
          </div>
          
          <button className="px-6 py-2.5 bg-[#D4AF37] text-black text-sm font-semibold rounded-full hover:bg-[#AA882E] transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] cursor-pointer">
            {t('bookNow')}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full glass-panel border-t-0 p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-2">
          <Link href="/" className="text-lg font-medium text-white hover:text-[#D4AF37]">Ana Sayfa</Link>
          <Link href="/hizmetler" className="text-lg font-medium text-white hover:text-[#D4AF37]">{t('services')}</Link>
          <div className="h-px bg-white/10 my-2"></div>
          <p className="text-sm text-gray-400 mb-2">Dil Seçimi</p>
          <div className="flex gap-4">
            <Link href={pathname} locale="tr" className="text-white font-medium hover:text-[#D4AF37]">TR</Link>
            <Link href={pathname} locale="en" className="text-white font-medium hover:text-[#D4AF37]">EN</Link>
            <Link href={pathname} locale="de" className="text-white font-medium hover:text-[#D4AF37]">DE</Link>
            <Link href={pathname} locale="ru" className="text-white font-medium hover:text-[#D4AF37]">RU</Link>
          </div>
          <button className="mt-4 w-full py-3 bg-[#D4AF37] text-black font-semibold rounded-full">
            {t('bookNow')}
          </button>
        </div>
      )}
    </nav>
  );
}
