"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

type MenuItemProp = {
  name: string;
  href: string;
};

type ContactProp = {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  youtube: string;
};

export default function Footer({ menus, legalMenus, contact }: { menus: MenuItemProp[], legalMenus: MenuItemProp[], contact: ContactProp }) {
  const t = useTranslations('Index');
  const pathname = usePathname();

  if (pathname.includes('/admin')) {
    return null;
  }

  return (
    <footer className="w-full mt-24 border-t border-[var(--color-primary-300)]/30 relative z-10 bg-white/40">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-3xl font-serif italic font-bold text-[var(--color-primary-500)] tracking-widest mb-6">N&L</h2>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
              {t('brandDescription')}
            </p>
            <div className="flex gap-4 mt-6">
              {contact.instagram && (
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] hover:bg-[var(--color-primary-300)]/20 transition-all duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {contact.facebook && (
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] hover:bg-[var(--color-primary-300)]/20 transition-all duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {contact.youtube && (
                <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--color-text-main)] hover:text-[var(--color-primary-500)] hover:bg-[var(--color-primary-300)]/20 transition-all duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.72.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[var(--color-text-main)] font-bold mb-6 text-sm uppercase tracking-wider">{t('quickMenu')}</h3>
            <ul className="flex flex-col gap-4 text-sm text-[var(--color-text-muted)]">
              {menus.map((menu, idx) => (
                <li key={idx}>
                  <Link href={menu.href as any} className="hover:text-[var(--color-primary-500)] transition-colors">
                    {menu.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-[var(--color-text-main)] font-bold mb-6 text-sm uppercase tracking-wider">{t('contact')}</h3>
            <ul className="flex flex-col gap-4 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary-500)] shrink-0 mt-0.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary-500)] shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{contact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary-500)] shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>{contact.email}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-[var(--color-primary-300)]/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <p>© {new Date().getFullYear()} Nails & Lashes Studio. {t('allRightsReserved')}</p>
          <div className="flex gap-4">
            {legalMenus.map((menu, idx) => (
              <Link key={idx} href={menu.href as any} className="hover:text-[var(--color-text-main)] transition-colors">
                {menu.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
