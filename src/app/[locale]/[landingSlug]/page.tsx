import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Language } from '@prisma/client';
import Link from 'next/link';
import { CalendarDays, Sparkles } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string; landingSlug: string }>;
};

// Dinamik SEO Metadata Üretimi
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale, landingSlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;

  // Bilinen statik rotaları filtrele
  const staticRoutes = ['galeri', 'iletisim', 'blog', 'services', 'booking', 'admin'];
  if (staticRoutes.includes(landingSlug)) {
    return {};
  }

  let translation = null;
  try {
    translation = await prisma.landingPageTranslation.findFirst({
      where: {
        slug: landingSlug,
        language: languageEnum,
        landingPage: {
          isActive: true,
          isDeleted: false
        }
      }
    });
  } catch (error) {
    console.error("SEO Landing metadata hatası:", error);
  }

  if (!translation) {
    return { title: 'Sayfa Bulunamadı' };
  }

  const title = translation.seoTitle || `${translation.title} | Nails & Lashes Studio`;
  const desc = translation.seoDesc || translation.title;

  return {
    title,
    description: desc,
    alternates: {
      canonical: translation.canonical || `https://nailslashesstudio.com/${locale}/${landingSlug}`,
      languages: {
        'tr': `https://nailslashesstudio.com/tr/${landingSlug}`,
        'en': `https://nailslashesstudio.com/en/${landingSlug}`,
        'de': `https://nailslashesstudio.com/de/${landingSlug}`,
        'ru': `https://nailslashesstudio.com/ru/${landingSlug}`,
      }
    },
    openGraph: {
      title: translation.ogTitle || title,
      description: translation.ogDesc || desc,
      images: translation.ogImage ? [{ url: translation.ogImage }] : [{ url: 'https://nailslashesstudio.com/images/luxury_salon_hero.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: translation.ogTitle || title,
      description: translation.ogDesc || desc,
    },
    robots: {
      index: translation.index,
      follow: translation.index,
    }
  };
}

export default async function LandingPageDetail({ params }: Props) {
  const resolvedParams = await params;
  const { locale, landingSlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;

  // Bilinen statik rotaları filtrele
  const staticRoutes = ['galeri', 'iletisim', 'blog', 'services', 'booking', 'admin'];
  if (staticRoutes.includes(landingSlug)) {
    notFound();
  }

  let translation = null;
  try {
    translation = await prisma.landingPageTranslation.findFirst({
      where: {
        slug: landingSlug,
        language: languageEnum,
        landingPage: {
          isActive: true,
          isDeleted: false
        }
      }
    });
  } catch (error) {
    console.error("Landing page çekme hatası:", error);
  }

  if (!translation) {
    notFound();
  }

  // Structured Data: BeautySalon Schema (Bölgesel hedefleme için)
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": `Nails & Lashes Studio - ${translation.title}`,
    "image": "https://nailslashesstudio.com/images/luxury_salon_hero.png",
    "url": `https://nailslashesstudio.com/${locale}/${landingSlug}`,
    "description": translation.seoDesc || translation.title,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Antalya",
      "addressCountry": "TR"
    }
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
        "name": translation.title,
        "item": `https://nailslashesstudio.com/${locale}/${landingSlug}`
      }
    ]
  };

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#faf8f7]">
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Decorative Lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/5 rounded-full blur-3xl -z-10 animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-rose-300)]/5 rounded-full blur-3xl -z-10 animate-glow" style={{ animationDelay: '1.5s' }}></div>

      <div className="max-w-4xl mx-auto px-6 z-10">
        <div className="bg-white border border-[var(--color-rose-100)] rounded-[2.5rem] p-8 md:p-16 shadow-sm relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--color-rose-300)] via-[var(--color-rose-500)] to-[var(--color-rose-300)]"></div>

          {/* Heading */}
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-rose-50)] text-[var(--color-rose-700)] rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
              <Sparkles size={12} /> Özel Kampanya & Hizmet
            </span>
            <h1 className="text-3xl md:text-5xl font-serif italic font-bold text-gray-950 leading-tight mb-4">
              {translation.title}
            </h1>
            <div className="w-16 h-1 bg-[var(--color-rose-200)] mx-auto rounded-full"></div>
          </div>

          {/* Rich content display */}
          <article className="prose max-w-none text-gray-700 leading-relaxed text-sm md:text-base mb-12 prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-[var(--color-rose-600)] hover:prose-a:text-[var(--color-rose-800)] prose-img:rounded-3xl">
            <div 
              className="whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: translation.content }} 
            />
          </article>

          {/* Call To Action Banner */}
          <div className="mt-12 p-8 rounded-3xl bg-[var(--color-light-200)] border border-[var(--color-primary-300)]/30 text-center space-y-6">
            <h3 className="text-xl font-serif font-bold text-gray-900">
              {locale === 'tr' ? 'Bu Hizmet İçin Hemen Randevunuzu Alın' : 'Book Your Appointment Now'}
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              {locale === 'tr' 
                ? 'İstediğiniz şube, tarih, uzman ve saati seçerek 2 dakikada kolayca randevunuzu oluşturabilirsiniz.'
                : 'Select your preferred branch, date, staff, and time slot to easily book in just 2 minutes.'}
            </p>
            <div className="flex justify-center">
              <Link
                href={`/${locale}/booking`}
                className="px-10 py-4 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-md hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <CalendarDays size={16} />
                {locale === 'tr' ? 'HEMEN RANDEVU AL' : 'BOOK AN APPOINTMENT'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
