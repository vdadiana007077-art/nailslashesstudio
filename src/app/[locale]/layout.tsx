import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import "../globals.css";

export const metadata = {
  title: 'Nails & Lashes Beauty Studio',
  description: 'Premium Beauty & Spa Services',
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
  
  let menuItems: Array<{ id: string; menuType: any; language: Language; title: string; url: string; order: number; isActive: boolean; createdAt: Date }> = [];
  let settings: Array<{ id: string; key: string; value: string; language: Language | null }> = [];
  try {
    menuItems = await prisma.menuItem.findMany({
      where: { 
        isActive: true,
        language: languageEnum
      },
      orderBy: { order: 'asc' }
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
  const headerMenus = menuItems.filter(m => m.menuType === 'HEADER').map(m => ({
    name: m.title,
    href: m.url
  }));

  const footerMenus = menuItems.filter(m => m.menuType === 'FOOTER').map(m => ({
    name: m.title,
    href: m.url
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

  const finalHeader = headerMenus.length > 0 ? headerMenus : fallbackHeader;
  const finalFooter = footerMenus.length > 0 ? footerMenus : fallbackFooter;

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
    <html lang={locale}>
      <body className="antialiased bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <Navbar menus={finalHeader} />
          {children}
          <Footer menus={finalFooter} contact={footerContact} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
