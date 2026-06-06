import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['tr', 'en', 'ru', 'de'],
  defaultLocale: 'tr',
  localePrefix: 'as-needed',
  localeDetection: false,
  // SİSTEM DİNAMİK URL (HEADLESS) MİMARİSİNE GEÇTİĞİ İÇİN
  // SABİT (HARDCODED) PATHNAMES SİLİNMİŞTİR.
  // TÜM URL YÖNETİMİ VERİTABANI ÜZERİNDEN (MENU & PAGE SLUG) [landingSlug] İLE YAPILMAKTADIR.
  pathnames: {
    '/': '/',
  }
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
