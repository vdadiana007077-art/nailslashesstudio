import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Language } from '@prisma/client';
import Link from 'next/link';
import { CalendarDays, Sparkles } from 'lucide-react';
import { resolvePageBySlug, resolveLandingPageBySlug, createLocalizedUrl, buildHreflangAlternates } from '@/lib/page-resolver';

// Page bileşenleri artık _pages/ klasöründe (underscore prefix = Next.js route DEĞİL)
import ServicesPageContent from '../_pages/ServicesPage';
import GalleryPageContent from '../_pages/GalleryPage';
import ContactPageContent from '../_pages/ContactPage';
import PortfolioPageContent from '../_pages/PortfolioPage';
import BookingPageContent from '../_pages/BookingPage';
import BlogPageContent from '../_pages/BlogPage';

type Props = {
  params: Promise<{ locale: string; landingSlug: string }>;
};

// ─────────────────────────────────────────
// SEO METADATA
// ─────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale, landingSlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;

  try {
    // 1. PageTranslation'da slug ara
    const pageResult = await resolvePageBySlug(landingSlug, languageEnum);
    
    if (pageResult) {
      const { translation, pageGroup, allTranslations } = pageResult;
      
      // Sistem sayfaları için orijinal sayfanın metadata'sını delegele
      if (pageGroup === 'SERVICES' || pageGroup === 'CONTACT' || pageGroup === 'GALLERY' || 
          pageGroup === 'PORTFOLIO' || pageGroup === 'BOOKING' || pageGroup === 'BLOG') {
        // Bu sayfaların kendi generateMetadata'ları var, ama biz daha iyi bir metadata üretebiliriz
        const title = translation.seoTitle || `${translation.title} | Nails & Lashes Studio`;
        const desc = translation.seoDesc || translation.title;
        const hreflang = buildHreflangAlternates(allTranslations);
        const currentUrl = createLocalizedUrl(locale, landingSlug);

        return {
          title,
          description: desc,
          alternates: {
            canonical: translation.canonical || `https://nailslashesstudio.com${currentUrl}`,
            languages: hreflang
          },
          openGraph: {
            title: translation.ogTitle || title,
            description: translation.ogDesc || desc,
            images: [{ url: translation.ogImage || translation.headerImage || 'https://nailslashesstudio.com/images/luxury_salon_hero.png' }],
          },
          twitter: {
            card: 'summary_large_image',
            title: translation.ogTitle || title,
            description: translation.ogDesc || desc,
          },
          robots: {
            index: translation.index ?? true,
            follow: translation.index ?? true,
          }
        };
      }

      // Normal CMS sayfaları
      const title = translation.seoTitle || `${translation.title} | Nails & Lashes Studio`;
      const desc = translation.seoDesc || translation.title;
      const hreflang = buildHreflangAlternates(allTranslations);
      const currentUrl = createLocalizedUrl(locale, landingSlug);

      return {
        title,
        description: desc,
        alternates: {
          canonical: translation.canonical || `https://nailslashesstudio.com${currentUrl}`,
          languages: hreflang
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
          index: translation.index ?? true,
          follow: translation.index ?? true,
        }
      };
    }

    // 2. LandingPageTranslation'da ara
    const landingResult = await resolveLandingPageBySlug(landingSlug, languageEnum);

    if (landingResult) {
      const { translation, allTranslations } = landingResult;
      const title = translation.seoTitle || `${translation.title} | Nails & Lashes Studio`;
      const desc = translation.seoDesc || translation.title;
      const hreflang = buildHreflangAlternates(allTranslations);
      const currentUrl = createLocalizedUrl(locale, landingSlug);

      return {
        title,
        description: desc,
        alternates: {
          canonical: translation.canonical || `https://nailslashesstudio.com${currentUrl}`,
          languages: hreflang
        },
        openGraph: {
          title: translation.ogTitle || title,
          description: translation.ogDesc || desc,
          images: translation.ogImage ? [{ url: translation.ogImage }] : [{ url: 'https://nailslashesstudio.com/images/luxury_salon_hero.png' }],
        },
        robots: {
          index: translation.index ?? true,
          follow: translation.index ?? true,
        }
      };
    }
  } catch (error) {
    console.error("Slug metadata hatası:", error);
  }

  return { title: 'Sayfa Bulunamadı' };
}

// ─────────────────────────────────────────
// PAGE RENDER
// ─────────────────────────────────────────
export default async function DynamicSlugPage({ params }: Props) {
  const resolvedParams = await params;
  const { locale, landingSlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;

  try {
    // 1. PageTranslation'da slug + language ara
    const pageResult = await resolvePageBySlug(landingSlug, languageEnum);

    if (pageResult) {
      const { translation, pageGroup } = pageResult;

      // ─── HEADLESS ROUTER: pageGroup'a göre doğru bileşeni render et ───
      // Hangi slug ile gelinirse gelinsin, pageGroup "SERVICES" ise
      // Hizmetler sayfasının tam tasarımı render edilir.
      
      if (pageGroup === 'SERVICES') {
        return <ServicesPageContent params={Promise.resolve({ locale })} />;
      }
      if (pageGroup === 'CONTACT') {
        return <ContactPageContent params={Promise.resolve({ locale })} />;
      }
      if (pageGroup === 'GALLERY') {
        return <GalleryPageContent params={Promise.resolve({ locale })} />;
      }
      if (pageGroup === 'PORTFOLIO') {
        return <PortfolioPageContent params={Promise.resolve({ locale })} />;
      }
      if (pageGroup === 'BOOKING') {
        return <BookingPageContent params={Promise.resolve({ locale })} />;
      }
      if (pageGroup === 'BLOG') {
        return <BlogPageContent params={Promise.resolve({ locale })} />;
      }

      // ─── ABOUT, LEGAL ve diğer CMS sayfaları genel şablonla render edilir ───
      return renderCmsPage(translation, locale, landingSlug, true);
    }

    // 2. LandingPageTranslation'da ara
    const landingResult = await resolveLandingPageBySlug(landingSlug, languageEnum);

    if (landingResult) {
      return renderCmsPage(landingResult.translation, locale, landingSlug, false);
    }

  } catch (error) {
    console.error("Slug sayfa çekme hatası:", error);
  }

  // Hiçbir eşleşme bulunamadı
  notFound();
}

// ─────────────────────────────────────────
// CMS / Landing Page Render Helper
// ─────────────────────────────────────────
function renderCmsPage(translation: any, locale: string, slug: string, isCmsPage: boolean) {
  const titleText = translation.title || translation.h1Title || '';

  const webpageSchema = isCmsPage ? {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": titleText,
    "url": `https://nailslashesstudio.com${createLocalizedUrl(locale, slug)}`,
    "description": translation.seoDesc || titleText
  } : null;

  const businessSchema = !isCmsPage ? {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": `Nails & Lashes Studio - ${titleText}`,
    "image": "https://nailslashesstudio.com/images/luxury_salon_hero.png",
    "url": `https://nailslashesstudio.com${createLocalizedUrl(locale, slug)}`,
    "description": translation.seoDesc || titleText,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Antalya",
      "addressCountry": "TR"
    }
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": locale === 'tr' ? 'Ana Sayfa' : 'Home',
        "item": `https://nailslashesstudio.com/${locale === 'tr' ? '' : locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": titleText,
        "item": `https://nailslashesstudio.com${createLocalizedUrl(locale, slug)}`
      }
    ]
  };

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#faf8f7]">
      {businessSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
      )}
      {webpageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/5 rounded-full blur-3xl -z-10 animate-glow"></div>

      <div className="max-w-4xl mx-auto px-6 z-10">
        <div className="bg-white border border-[var(--color-rose-100)] rounded-[2.5rem] p-8 md:p-16 shadow-sm relative overflow-hidden">
          {!isCmsPage && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--color-rose-300)] via-[var(--color-rose-500)] to-[var(--color-rose-300)]"></div>
          )}

          <div className="mb-10 text-center">
            {isCmsPage ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                Kurumsal Bilgi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-rose-50)] text-[var(--color-rose-700)] rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                <Sparkles size={12} /> Özel Kampanya & Hizmet
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-serif italic font-bold text-gray-950 leading-tight mb-4">
              {titleText}
            </h1>
            <div className="w-16 h-1 bg-[var(--color-rose-200)] mx-auto rounded-full"></div>
          </div>

          <article className="prose max-w-none text-gray-700 leading-relaxed text-sm md:text-base mb-12 prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-[var(--color-rose-600)] hover:prose-a:text-[var(--color-rose-800)] prose-img:rounded-3xl">
            <div 
              className="whitespace-pre-line text-left"
              dangerouslySetInnerHTML={{ __html: translation.content }} 
            />
          </article>

          {!isCmsPage && (
            <div className="mt-12 p-8 rounded-3xl bg-[var(--color-light-200)] border border-[var(--color-primary-300)]/30 text-center space-y-6">
              <h3 className="text-xl font-serif font-bold text-gray-950">
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
          )}
        </div>
      </div>
    </main>
  );
}
