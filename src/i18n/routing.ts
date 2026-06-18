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
    '/services': {
      tr: '/hizmetler',
      en: '/services',
      de: '/dienstleistungen',
      ru: '/uslugi'
    },
    '/services/[categorySlug]': {
      tr: '/hizmetler/[categorySlug]',
      en: '/services/[categorySlug]',
      de: '/dienstleistungen/[categorySlug]',
      ru: '/uslugi/[categorySlug]'
    },
    '/services/[categorySlug]/[serviceSlug]': {
      tr: '/hizmetler/[categorySlug]/[serviceSlug]',
      en: '/services/[categorySlug]/[serviceSlug]',
      de: '/dienstleistungen/[categorySlug]/[serviceSlug]',
      ru: '/uslugi/[categorySlug]/[serviceSlug]'
    },
    '/booking': '/booking'
  }
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
