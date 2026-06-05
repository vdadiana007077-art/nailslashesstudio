"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { getCurrentCustomer } from '@/app/actions/customerAuth';
import { useParams } from 'next/navigation';
import { User, Globe } from 'lucide-react';
import AuthModal from './AuthModal';
import AccountPopup from './AccountPopup';

type MenuItemProp = {
  name: string;
  href: string;
};

export default function Navbar({ menus }: { menus: MenuItemProp[] }) {
  const t = useTranslations('Index');
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string || 'tr').toLowerCase();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<any | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountPopupOpen, setAccountPopupOpen] = useState(false);

  // Scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Müşteri oturumunu yükle
  const loadCustomer = async () => {
    const data = await getCurrentCustomer();
    setCustomer(data);
  };

  useEffect(() => {
    loadCustomer();
  }, []);

  if (pathname.includes('/admin')) {
    return null;
  }

  return (
    <>
      <nav className={`fixed w-full z-40 transition-all duration-500 ${isScrolled ? 'glass-panel py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="text-3xl font-serif italic font-bold text-[var(--color-primary-500)] tracking-widest hover:opacity-80 transition-opacity">
            N&L
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {menus.map((menu, idx) => (
              <Link 
                key={idx} 
                href={menu.href as any} 
                className="text-sm font-semibold tracking-wide text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] transition-all duration-300"
              >
                {menu.name}
              </Link>
            ))}
          </div>

          {/* Right Actions: Auth + Lang + Booking */}
          <div className="hidden md:flex items-center gap-6">
            {/* Müşteri Giriş / Hesap Alanı */}
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
                <User size={15} /> Giriş Yap
              </button>
            )}

            {/* Dil Seçimi */}
            <div className="group relative cursor-pointer flex items-center gap-1.5 text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] transition-colors">
              <Globe size={15} />
              <span className="text-xs font-bold uppercase tracking-wider">{locale}</span>
              
              {/* Lang Dropdown */}
              <div className="absolute top-full right-0 mt-4 w-32 glass-panel rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl">
                <Link href={pathname as any} locale="tr" className="block px-4 py-2 text-xs font-semibold text-[var(--color-text-main)] hover:bg-[var(--color-primary-300)]/40 rounded-lg mx-1">Türkçe</Link>
                <Link href={pathname as any} locale="en" className="block px-4 py-2 text-xs font-semibold text-[var(--color-text-main)] hover:bg-[var(--color-primary-300)]/40 rounded-lg mx-1">English</Link>
                <Link href={pathname as any} locale="de" className="block px-4 py-2 text-xs font-semibold text-[var(--color-text-main)] hover:bg-[var(--color-primary-300)]/40 rounded-lg mx-1">Deutsch</Link>
                <Link href={pathname as any} locale="ru" className="block px-4 py-2 text-xs font-semibold text-[var(--color-text-main)] hover:bg-[var(--color-primary-300)]/40 rounded-lg mx-1">Русский</Link>
              </div>
            </div>
            
            <Link href="/booking" className="px-6 py-2.5 bg-[var(--color-primary-500)] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[var(--color-primary-600)] transition-all duration-300 shadow-[0_6px_20px_rgba(197,139,139,0.25)] hover:shadow-[0_8px_25px_rgba(197,139,139,0.4)] hover:-translate-y-0.5 cursor-pointer">
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

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full glass-panel border-t border-[var(--color-primary-300)]/15 p-6 flex flex-col gap-4 md:hidden animate-fade-up shadow-2xl">
            {menus.map((menu, idx) => (
              <Link 
                key={idx} 
                href={menu.href as any} 
                className="text-base font-bold text-[var(--color-text-main)] hover:text-[var(--color-primary-500)]" 
                onClick={() => setMobileMenuOpen(false)}
              >
                {menu.name}
              </Link>
            ))}
            <div className="h-px bg-[var(--color-primary-300)]/20 my-2"></div>
            
            {/* Müşteri Giriş / Hesap - Mobil */}
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
                <User size={18} /> Giriş Yap / Üye Ol
              </button>
            )}

            <div className="h-px bg-[var(--color-primary-300)]/20 my-2"></div>

            <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Dil Seçimi</p>
            <div className="flex gap-4">
              <Link href={pathname as any} locale="tr" className="text-[var(--color-text-main)] font-bold hover:text-[var(--color-primary-500)]" onClick={() => setMobileMenuOpen(false)}>TR</Link>
              <Link href={pathname as any} locale="en" className="text-[var(--color-text-main)] font-bold hover:text-[var(--color-primary-500)]" onClick={() => setMobileMenuOpen(false)}>EN</Link>
              <Link href={pathname as any} locale="de" className="text-[var(--color-text-main)] font-bold hover:text-[var(--color-primary-500)]" onClick={() => setMobileMenuOpen(false)}>DE</Link>
              <Link href={pathname as any} locale="ru" className="text-[var(--color-text-main)] font-bold hover:text-[var(--color-primary-500)]" onClick={() => setMobileMenuOpen(false)}>RU</Link>
            </div>
            
            <Link href="/booking" className="mt-4 w-full text-center py-3 bg-[var(--color-primary-500)] text-white font-bold rounded-full block shadow-lg" onClick={() => setMobileMenuOpen(false)}>
              {t('bookNow')}
            </Link>
          </div>
        )}
      </nav>

      {/* Modallar */}
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
