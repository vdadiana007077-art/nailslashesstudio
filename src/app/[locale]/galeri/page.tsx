import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { Language } from '@prisma/client';
import GalleryClient from '@/components/layout/GalleryClient';

type Props = {
  params: Promise<{ locale: string }>;
};

// Dinamik SEO Tanımı
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  
  // Dil bazlı başlık ve açıklamalar
  const titles: Record<string, string> = {
    tr: 'Fotoğraf Galerisi | Nails & Lashes Studio',
    en: 'Photo Gallery | Nails & Lashes Studio',
    de: 'Fotogalerie | Wimpern- und Nagelstudio',
    ru: 'Фотогалерея | Студия Маникюра и Ресниц'
  };

  const descriptions: Record<string, string> = {
    tr: 'Antalya Nails & Lashes Studio şubelerimizde yapılan protez tırnak, kalıcı oje, ipek kirpik ve nail art uygulamalarımızın yüksek kaliteli görselleri.',
    en: 'High-quality photos of acrylic nails, gel polish, eyelash extensions, and nail art applications made in Antalya Nails & Lashes Studio.',
    de: 'Hochwertige Fotos von Acrylnägeln, Gellack, Wimpernverlängerung und Nail Art in unserem Studio in Antalya.',
    ru: 'Высококачественные фотографии наращивания ногтей, гель-лака, наращивания ресниц и нейл-арта в нашей студии в Анталии.'
  };

  const title = titles[locale] || titles.en;
  const desc = descriptions[locale] || descriptions.en;

  return {
    title,
    description: desc,
    alternates: {
      canonical: `https://nailslashesstudio.com/${locale}/galeri`,
      languages: {
        'tr': `https://nailslashesstudio.com/tr/galeri`,
        'en': `https://nailslashesstudio.com/en/galeri`,
        'de': `https://nailslashesstudio.com/de/galeri`,
        'ru': `https://nailslashesstudio.com/ru/galeri`,
      }
    },
    openGraph: {
      title,
      description: desc,
      images: [{ url: 'https://nailslashesstudio.com/images/luxury_salon_hero.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
    }
  };
}

export default async function GalleryPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const languageEnum = locale.toUpperCase() as Language;

  // 1. GalleryImage tablosundan aktif olanları çek
  let galleryImages: Array<{ id: string; url: string; altText: string | null; order: number; isActive: boolean; createdAt: Date }> = [];
  let mediaImages: Array<{ id: string; url: string; title: string | null; altText: string | null; caption: string | null; fileName: string; fileSize: number; mimeType: string; createdAt: Date }> = [];

  try {
    galleryImages = await prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    // 2. MediaItem tablosundan resim formatındaki dosyaları çek
    mediaImages = await prisma.mediaItem.findMany({
      where: {
        mimeType: {
          startsWith: 'image/'
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Galeri veri çekme hatası:", error);
  }

  // Verileri birleştirelim
  const items = galleryImages.map(img => ({
    id: img.id,
    url: img.url,
    alt: img.altText || 'Nails & Lashes Studio Uygulaması',
    title: img.altText || 'Nails & Lashes Studio Uygulaması',
  }));

  mediaImages.forEach(med => {
    if (!items.some(item => item.url === med.url)) {
      items.push({
        id: med.id,
        url: med.url,
        alt: med.altText || med.title || 'Nails & Lashes Studio',
        title: med.title || med.altText || 'Nails & Lashes Studio',
      });
    }
  });

  // Varsayılan / Fallback görseller (eğer veritabanı tamamen boşsa)
  const fallbacks = [
    { id: 'f1', url: '/images/nail_art_1.png', alt: 'Premium Minimal Nail Art Uygulaması', title: 'Minimal Nail Art' },
    { id: 'f2', url: '/images/nail_art_2.png', alt: 'Lüks Düğün Manikürü ve Nail Art', title: 'Luxury Wedding Manicure' },
    { id: 'f3', url: '/images/lash_art_1.png', alt: 'Doğal Hacimli İpek Kirpik Uygulaması', title: 'Natural Volume Lashes' },
    { id: 'f4', url: '/images/lash_art_2.png', alt: 'Kirpik Lifting ve Vitamin Bakımı', title: 'Premium Lash Lift' },
    { id: 'f5', url: '/images/luxury_salon_hero.png', alt: 'Antalya Güzellik Salonu İç Tasarım', title: 'Luxury Beauty Studio' },
  ];

  const finalImages = items.length > 0 ? items : fallbacks;

  // Structured Data: ImageGallery Schema
  const gallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "Nails & Lashes Studio Fotoğraf Galerisi",
    "description": "Protez tırnak, kalıcı oje, nail art, ipek kirpik ve kirpik lifting uygulamalarımızın güncel görselleri.",
    "url": `https://nailslashesstudio.com/${locale}/galeri`,
    "image": finalImages.map(img => ({
      "@type": "ImageObject",
      "url": img.url.startsWith('/') ? `https://nailslashesstudio.com${img.url}` : img.url,
      "caption": img.title
    }))
  };

  // Structured Data: BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": locale === 'tr' ? 'Ana Sayfa' : 'Home',
        "item": `https://nailslashesstudio.com/${locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": locale === 'tr' ? 'Galeri' : 'Gallery',
        "item": `https://nailslashesstudio.com/${locale}/galeri`
      }
    ]
  };

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#faf8f7]">
      {/* Structured Data Script Embed */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gallerySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Decorative Lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/5 rounded-full blur-3xl -z-10 animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-rose-300)]/5 rounded-full blur-3xl -z-10 animate-glow" style={{ animationDelay: '1.5s' }}></div>

      <div className="max-w-7xl mx-auto px-6 z-10">
        <div className="text-center mb-16">
          <span className="text-[var(--color-rose-600)] text-xs font-bold uppercase tracking-widest block mb-3">
            {locale === 'tr' ? 'Sanat ve Estetik' : 'Art & Aesthetics'}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-gray-950 mb-4">
            {locale === 'tr' ? 'Görsel Galeri' : 'Visual Gallery'}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {locale === 'tr' 
              ? 'Tırnak sanatı, protez tırnak, kirpik ve kaş uygulamalarımızın gerçek ve taze fotoğraflarıyla çalışmalarımızı inceleyin.'
              : 'Explore our latest work with real photos of nail art, acrylic nails, and eyelash extensions.'}
          </p>
        </div>

        <GalleryClient images={finalImages} locale={locale} />
      </div>
    </main>
  );
}
