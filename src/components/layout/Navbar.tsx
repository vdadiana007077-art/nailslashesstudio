"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { getCurrentCustomer } from '@/app/actions/customerAuth';
import { useParams, usePathname as useNextPathname } from 'next/navigation';
import { User, Globe } from 'lucide-react';
import AuthModal from './AuthModal';
import AccountPopup from './AccountPopup';
import Link from 'next/link';

type MenuItemProp = {
  name: string;
  href: string;
};

/**
 * Dil bazlı URL oluşturma (client-side).
 * TR varsayılan dil (prefix yok), diğer diller prefix alır.
 */
function buildLocalizedUrl(lang: string, slug: string): string {
  if (lang === 'tr') return `/${slug}`;
  return `/${lang}/${slug}`;
}

export default function Navbar({ menus }: { menus: MenuItemProp[] }) {
  const t = useTranslations('Index');
  const rawPathname = useNextPathname();
  const params = useParams();
  const locale = (params.locale as string || 'tr').toLowerCase();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<any | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountPopupOpen, setAccountPopupOpen] = useState(false);

  // Dil değiştirici için: mevcut sayfanın tüm dillerdeki slug'ları
  const [pageSlugs, setPageSlugs] = useState<Record<string, string> | null>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobil menü açıkken arkadaki sayfanın kaydırılmasını (body scroll) engelle
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Müşteri oturumunu yükle
  const loadCustomer = async () => {
    const data = await getCurrentCustomer();
    setCustomer(data);
  };

  useEffect(() => { loadCustomer(); }, []);

  // Mevcut sayfa slug'ından tüm dillerin slug'larını çek
  const resolvePageSlugs = useCallback(async () => {
    // URL'den slug'ı çıkar
    let currentSlug = '';
    const pathParts = rawPathname.split('/').filter(Boolean);
    
    // locale prefix'ini atla
    if (pathParts.length > 0 && ['tr', 'en', 'de', 'ru'].includes(pathParts[0])) {
      currentSlug = pathParts.slice(1).join('/');
    } else {
      currentSlug = pathParts.join('/');
    }

    // Ana sayfa ise slug yoktur
    if (!currentSlug || currentSlug === '') {
      setPageSlugs(null);
      return;
    }

    // Admin, auth, blog gibi özel yolları atla
    if (currentSlug.startsWith('admin') || currentSlug.startsWith('auth') || currentSlug.startsWith('hesabim')) {
      setPageSlugs(null);
      return;
    }

    try {
      const res = await fetch(`/api/page-slugs?slug=${encodeURIComponent(currentSlug)}&lang=${locale.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.slugs) {
          setPageSlugs(data.slugs);
        } else {
          setPageSlugs(null);
        }
      }
    } catch {
      setPageSlugs(null);
    }
  }, [rawPathname, locale]);

  useEffect(() => {
    resolvePageSlugs();
  }, [resolvePageSlugs]);

  /**
   * Hedef dil için doğru URL'yi oluştur.
   * pageSlugs varsa: aynı Page ID'nin hedef dildeki slug'ını kullan.
   * pageSlugs yoksa: ana sayfa URL'sine git.
   */
  function getLanguageSwitchUrl(targetLang: string): string {
    if (pageSlugs && pageSlugs[targetLang]) {
      return buildLocalizedUrl(targetLang, pageSlugs[targetLang]);
    }
    
    // Ana sayfa veya çözümlenemeyen sayfalar
    if (targetLang === 'tr') return '/';
    return `/${targetLang}`;
  }

  if (rawPathname.includes('/admin') || rawPathname.includes('/staff')) {
    return null;
  }

  const langLinks = ['tr', 'en', 'de', 'ru'];
  const langLabels: Record<string, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch', ru: 'Русский' };

  return (
    <>
      <nav className={`fixed w-full z-40 transition-all duration-500 ${isScrolled ? 'glass-panel py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link href={locale === 'tr' ? '/' : `/${locale}`} className="text-3xl font-serif italic font-bold text-[var(--color-primary-500)] tracking-widest hover:opacity-80 transition-opacity">
            N&L
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {menus.map((menu, idx) => (
              <Link 
                key={idx} 
                href={menu.href} 
                className="text-sm font-semibold tracking-wide text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] transition-all duration-300"
              >
                {menu.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-6">
            {customer ? (
              <button
                onClick={() => setAccountPopupOpen(true)}
                className="flex items-center gap-2 text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center font-bold text-sm border border-[var(--color-rose-200)] shadow-inner">
                  {customer.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold">{customer.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <User size={15} /> {t('login')}
              </button>
            )}

            {/* Dil Seçimi - Artık Page ID bazlı doğru slug ile çalışıyor */}
            <div className="group relative cursor-pointer flex items-center gap-1.5 text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] transition-colors">
              <Globe size={15} />
              <span className="text-xs font-bold uppercase tracking-wider">{locale}</span>
              
              <div className="absolute top-full right-0 mt-4 w-32 glass-panel rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl">
                {langLinks.map(lang => (
                  <a 
                    key={lang}
                    href={getLanguageSwitchUrl(lang)} 
                    className="block px-4 py-2 text-xs font-semibold text-[var(--color-text-main)] hover:bg-[var(--color-primary-300)]/40 rounded-lg mx-1"
                  >
                    {langLabels[lang]}
                  </a>
                ))}
              </div>
            </div>
            
            <Link href={`/${locale === 'tr' ? '' : locale + '/'}booking`} className="px-6 py-2.5 bg-[var(--color-primary-500)] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[var(--color-primary-600)] transition-all duration-300 shadow-[0_6px_20px_rgba(197,139,139,0.25)] hover:shadow-[0_8px_25px_rgba(197,139,139,0.4)] hover:-translate-y-0.5 cursor-pointer">
              {t('bookNow')}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            )}
          </button>

        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full glass-panel border-t border-[var(--color-primary-300)]/15 p-6 flex flex-col gap-4 md:hidden animate-fade-up shadow-2xl">
            {menus.map((menu, idx) => (
              <Link 
                key={idx} 
                href={menu.href} 
                className="text-base font-bold text-[var(--color-text-main)] hover:text-[var(--color-primary-500)]" 
                onClick={() => setMobileMenuOpen(false)}
              >
                {menu.name}
              </Link>
            ))}
            <div className="h-px bg-[var(--color-primary-300)]/20 my-2"></div>
            
            {customer ? (
              <button
                onClick={() => { setAccountPopupOpen(true); setMobileMenuOpen(false); }}
                className="flex items-center gap-2.5 text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] text-left py-2 font-bold cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center font-bold text-sm border border-[var(--color-rose-200)]">
                  {customer.name.substring(0, 2).toUpperCase()}
                </div>
                <span>{customer.name}</span>
              </button>
            ) : (
              <button
                onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                className="text-base font-bold text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] text-left py-2 flex items-center gap-2 cursor-pointer"
              >
                <User size={18} /> {t('loginSignup')}
              </button>
            )}

            <div className="h-px bg-[var(--color-primary-300)]/20 my-2"></div>

            <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">{t('languageSelection')}</p>
            <div className="flex gap-4">
              {langLinks.map(lang => (
                <a 
                  key={lang}
                  href={getLanguageSwitchUrl(lang)} 
                  className="text-[var(--color-text-main)] font-bold hover:text-[var(--color-primary-500)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {lang.toUpperCase()}
                </a>
              ))}
            </div>
            
            <Link href={`/${locale === 'tr' ? '' : locale + '/'}booking`} className="mt-4 w-full text-center py-3 bg-[var(--color-primary-500)] text-white font-bold rounded-full block shadow-lg" onClick={() => setMobileMenuOpen(false)}>
              {t('bookNow')}
            </Link>
          </div>
        )}
      </nav>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        locale={locale}
        onSuccess={loadCustomer} 
      />
      
      <AccountPopup 
        isOpen={accountPopupOpen} 
        onClose={() => setAccountPopupOpen(false)} 
        locale={locale} 
      />
    </>
  );
}
