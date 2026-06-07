import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Language } from '@prisma/client';
import Link from 'next/link';
import GalleryClient from '@/components/layout/GalleryClient';

type Props = {
  params: Promise<{ locale: string; categorySlug: string }>;
};

// SEO METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, categorySlug } = await params;
  const lang = locale.toUpperCase() as Language;

  const translation = await prisma.galleryCategoryTranslation.findFirst({
    where: { slug: categorySlug, language: lang },
    include: { category: { include: { translations: true } } }
  }).catch(() => null);

  if (!translation || !translation.category?.isActive || translation.category?.isDeleted) {
    return { title: 'Kategori Bulunamadı' };
  }

  const cat = translation.category;
  const title = translation.seoTitle || `${translation.name} Galeri | Nails & Lashes Studio`;
  const desc = translation.seoDescription || translation.description || translation.name;

  // Hreflang alternates
  const alternates: Record<string, string> = {};
  cat.translations.forEach((t: any) => {
    const l = t.language.toLowerCase();
    const prefix = l === 'tr' ? '' : `/${l}`;
    const gallerySlug = l === 'tr' ? 'galeri' : l === 'de' ? 'galerie' : 'gallery';
    alternates[l] = `https://nailslashesstudio.com${prefix}/${gallerySlug}/${t.slug}`;
  });

  return {
    title,
    description: desc,
    alternates: {
      canonical: cat.canonical || alternates[locale] || undefined,
      languages: alternates,
    },
    openGraph: {
      title,
      description: desc,
      images: cat.ogImage ? [{ url: cat.ogImage }] : [{ url: 'https://nailslashesstudio.com/images/luxury_salon_hero.png' }],
    },
    robots: {
      index: !cat.noIndex,
      follow: !cat.noIndex,
    }
  };
}

// PAGE RENDER
export default async function GalleryCategoryPage({ params }: Props) {
  const { locale, categorySlug } = await params;
  const lang = locale.toUpperCase() as Language;

  const translation = await prisma.galleryCategoryTranslation.findFirst({
    where: { slug: categorySlug, language: lang },
    include: {
      category: {
        include: {
          translations: true,
          items: {
            where: { isActive: true, isDeleted: false },
            include: { translations: { where: { language: lang } } },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  }).catch(() => null);

  if (!translation || !translation.category?.isActive || translation.category?.isDeleted) {
    notFound();
  }

  const cat = translation.category;
  const catName = translation.name;
  const catDesc = translation.description || '';

  // Galeri sayfası slug (ana galeri)
  const gallerySlug = locale === 'tr' ? 'galeri' : locale === 'de' ? 'galerie' : 'gallery';
  const galleryLabel = locale === 'tr' ? 'Galeri' : locale === 'de' ? 'Galerie' : locale === 'ru' ? 'Галерея' : 'Gallery';
  const homeLabel = locale === 'tr' ? 'Ana Sayfa' : locale === 'de' ? 'Startseite' : locale === 'ru' ? 'Главная' : 'Home';
  const localePrefix = locale === 'tr' ? '' : `/${locale}`;

  const images = cat.items.map((item: any) => ({
    id: item.id,
    url: item.imageUrl,
    alt: item.translations?.[0]?.altText || item.translations?.[0]?.title || catName,
    title: item.translations?.[0]?.title || '',
    description: item.translations?.[0]?.description || '',
    categoryId: item.categoryId,
    categoryName: catName,
  }));

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": homeLabel, "item": `https://nailslashesstudio.com${localePrefix || '/'}` },
      { "@type": "ListItem", "position": 2, "name": galleryLabel, "item": `https://nailslashesstudio.com${localePrefix}/${gallerySlug}` },
      { "@type": "ListItem", "position": 3, "name": catName, "item": `https://nailslashesstudio.com${localePrefix}/${gallerySlug}/${categorySlug}` }
    ]
  };

  // ImageGallery Schema
  const gallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": catName,
    "description": catDesc,
    "url": `https://nailslashesstudio.com${localePrefix}/${gallerySlug}/${categorySlug}`,
    "image": images.slice(0, 10).map((img: any) => ({
      "@type": "ImageObject",
      "url": img.url.startsWith('http') ? img.url : `https://nailslashesstudio.com${img.url}`,
      "name": img.title || catName,
      "description": img.alt
    }))
  };

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#faf8f7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gallerySchema) }} />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/5 rounded-full blur-3xl -z-10 animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-rose-300)]/5 rounded-full blur-3xl -z-10 animate-glow" style={{ animationDelay: '1.5s' }}></div>

      <div className="max-w-7xl mx-auto px-6 z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-10">
          <Link href={`${localePrefix || '/'}`} className="hover:text-[var(--color-rose-600)] transition-colors">{homeLabel}</Link>
          <span>/</span>
          <Link href={`${localePrefix}/${gallerySlug}`} className="hover:text-[var(--color-rose-600)] transition-colors">{galleryLabel}</Link>
          <span>/</span>
          <span className="text-gray-700 font-semibold">{catName}</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-16">
          {cat.image && (
            <div className="w-full max-w-3xl mx-auto mb-8 rounded-3xl overflow-hidden shadow-lg border border-[var(--color-rose-100)]">
              <Image width={800} height={800} src={cat.image} alt={catName} className="w-full h-48 md:h-64 object-cover" />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-gray-950 mb-4">{catName}</h1>
          {catDesc && <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">{catDesc}</p>}
          <p className="text-xs text-gray-400 mt-3">{images.length} {locale === 'tr' ? 'fotoğraf' : locale === 'de' ? 'Fotos' : locale === 'ru' ? 'фотографий' : 'photos'}</p>
        </div>

        {/* Galeri Grid — tüm fotoğraflar bu kategoriye ait, filtre gerekmez */}
        <GalleryClient images={images} categories={[]} locale={locale} />

        {/* Tüm galeriye dön */}
        <div className="text-center mt-16">
          <Link href={`${localePrefix}/${gallerySlug}`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-950 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-black transition-all shadow-md hover:-translate-y-0.5">
            ← {locale === 'tr' ? 'Tüm Galeriye Dön' : locale === 'de' ? 'Zur gesamten Galerie' : locale === 'ru' ? 'Вернуться в галерею' : 'Back to Full Gallery'}
          </Link>
        </div>
      </div>
    </main>
  );
}
