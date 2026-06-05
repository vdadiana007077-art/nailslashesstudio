import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['tr', 'en', 'ru', 'de'],
  defaultLocale: 'tr',
  localePrefix: 'as-needed',
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
    '/booking': {
      tr: '/randevu',
      en: '/booking',
      de: '/termin',
      ru: '/zapis'
    },
    '/galeri': {
      tr: '/galeri',
      en: '/gallery',
      de: '/galerie',
      ru: '/galereya'
    },
    '/iletisim': {
      tr: '/iletisim',
      en: '/contact',
      de: '/kontakt',
      ru: '/kontakty'
    },
    '/portfolio': {
      tr: '/portfolyo',
      en: '/portfolio',
      de: '/portfolio',
      ru: '/portfolio'
    }
  }
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
