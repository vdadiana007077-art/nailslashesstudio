import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

const fontSerif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import CookieConsentBanner from '@/components/layout/CookieConsentBanner';
import SupportWidget from '@/components/widget/SupportWidget';
import "../globals.css";

export const metadata = {
  title: 'Nails & Lashes Beauty Studio',
  description: 'Premium Beauty & Spa Services',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'N&L Studio',
  },
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  const messages = await getMessages();

  // Veritabanından o dile ait aktif menü elemanlarını çekelim
  const languageEnum = locale.toUpperCase() as Language;
  
  let menuItems: Array<{ id: string; menuType: any; title: string; url: string; order: number; isActive: boolean }> = [];
  let settings: Array<{ id: string; key: string; value: string; language: Language | null }> = [];
  try {
    const rawMenuItems = await prisma.menuItem.findMany({
      where: { 
        isActive: true,
        translations: {
          some: {
            language: languageEnum
          }
        }
      },
      include: {
        translations: {
          where: {
            language: languageEnum
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    menuItems = rawMenuItems.map(item => {
      const trans = item.translations[0];
      return {
        id: item.id,
        menuType: item.menuType,
        title: trans?.title || '',
        url: trans?.url || '',
        order: item.order,
        isActive: item.isActive
      };
    });

    settings = await prisma.setting.findMany({
      where: {
        OR: [
          { language: languageEnum },
          { language: null }
        ]
      }
    });
  } catch (error) {
    console.error("Layout veri çekme hatası:", error);
  }

  // Header ve Footer menüleri filtrele
  // Menü URL'leri veritabanında /${slug} formatında kayıtlı.
  // Frontend'e aktarırken locale prefix ekliyoruz.
  const addLocalePrefix = (url: string) => {
    if (!url || url.startsWith('http')) return url; // external linkler olduğu gibi kalır
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    if (locale === 'tr') return cleanUrl;
    return `/${locale}${cleanUrl}`;
  };

  // Mükerrer menü kayıtlarını URL bazında filtrele (aynı URL'yi bir kez göster)
  const deduplicateMenus = (items: typeof menuItems) => {
    const seen = new Set<string>();
    return items.filter(m => {
      const key = `${m.menuType}_${m.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const uniqueMenuItems = deduplicateMenus(menuItems);

  const headerMenus = uniqueMenuItems.filter(m => m.menuType === 'HEADER').map(m => ({
    name: m.title,
    href: addLocalePrefix(m.url)
  }));

  const footerMenus = uniqueMenuItems.filter(m => m.menuType === 'FOOTER').map(m => ({
    name: m.title,
    href: addLocalePrefix(m.url)
  }));

  const legalMenus = uniqueMenuItems.filter(m => m.menuType === 'LEGAL_FOOTER').map(m => ({
    name: m.title,
    href: addLocalePrefix(m.url)
  }));

  // Güvenli Fallback Menü Linkleri (İlk Kurulum Güvenliği)
  const fallbackHeader = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Hizmetler', href: '/services' },
    { name: 'Galeri', href: '/galeri' },
    { name: 'Portföy', href: '/portfolio' },
    { name: 'Blog', href: '/blog' },
    { name: 'İletişim', href: '/iletisim' },
  ];

  const fallbackFooter = [
    { name: 'Hakkımızda', href: '/hakkimizda' },
    { name: 'Hizmetler', href: '/services' },
    { name: 'Portföy', href: '/portfolio' },
    { name: 'İletişim', href: '/iletisim' },
  ];

  const fallbackLegal = [
    { name: 'Gizlilik Politikası', href: '/gizlilik' },
    { name: 'KVKK Aydınlatma Metni', href: '/kvkk' },
  ];

  const finalHeader = headerMenus.length > 0 ? headerMenus : fallbackHeader;
  const finalFooter = footerMenus.length > 0 ? footerMenus : fallbackFooter;
  const finalLegal = legalMenus.length > 0 ? legalMenus : fallbackLegal;

  const getSetting = (key: string, def: string = '') => {
    return settings.find(s => s.key === key)?.value || def;
  };

  const footerContact = {
    phone: getSetting('contact_phone', '+90 242 000 0000'),
    email: getSetting('contact_email', 'info@nailslashesstudio.com'),
    address: getSetting('contact_address', 'Muratpaşa, Antalya'),
    whatsapp: getSetting('whatsapp_number', ''),
    instagram: getSetting('instagram_url', ''),
    facebook: getSetting('facebook_url', ''),
    youtube: getSetting('youtube_url', ''),
  };
 
  return (
    <html lang={locale} className={`${fontSerif.variable} ${fontSans.variable}`}>
      <body className="antialiased bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <Navbar menus={finalHeader} />
          {children}
          <Footer menus={finalFooter} legalMenus={finalLegal} contact={footerContact} />
          <CookieConsentBanner />
          <SupportWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
