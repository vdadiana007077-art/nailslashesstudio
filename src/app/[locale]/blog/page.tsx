import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import BlogClient from './BlogClient';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const languageEnum = locale.toUpperCase() as Language;

  const page = await prisma.pageTranslation.findFirst({
    where: { slug: 'blog', language: languageEnum }
  });

  const titles: Record<string, string> = {
    tr: 'Blog | Nails & Lashes Studio',
    en: 'Blog | Nails & Lashes Studio',
    de: 'Blog | Nails & Lashes Studio',
    ru: 'Блог | Nails & Lashes Studio'
  };

  const descriptions: Record<string, string> = {
    tr: 'Güzellik, manikür trendleri ve bakım sırları hakkında en güncel yazılar.',
    en: 'The latest articles about beauty, manicure trends, and care secrets.',
    de: 'Die neuesten Artikel über Schönheit, Maniküre-Trends und Pflegegeheimnisse.',
    ru: 'Последние статьи о красоте, тенденциях маникюра и секретах ухода.'
  };

  const title = page?.seoTitle || titles[locale] || titles.en;
  const desc = page?.seoDesc || descriptions[locale] || descriptions.en;

  return {
    title,
    description: desc,
    alternates: {
      canonical: `https://nailslashesstudio.com/${locale}/blog`,
      languages: {
        'tr': `https://nailslashesstudio.com/tr/blog`,
        'en': `https://nailslashesstudio.com/en/blog`,
        'de': `https://nailslashesstudio.com/de/blog`,
        'ru': `https://nailslashesstudio.com/ru/blog`,
      }
    },
    openGraph: {
      title,
      description: desc,
      images: [{ url: page?.ogImage || page?.headerImage || 'https://nailslashesstudio.com/images/luxury_salon_hero.png' }],
    }
  };
}

export const revalidate = 3600;

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale.toUpperCase() as Language;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "Blog" });

  const pageContent = await prisma.pageTranslation.findFirst({
    where: { slug: 'blog', language: locale }
  });

  const heroTitle = pageContent?.h1Title || t('blogCorner');
  const introText = pageContent?.introText || t('blogCornerDesc');

  // 1. Aktif blog yazılarını çek (çevirileri ve bağlı kategorileri ile)
  const posts = await prisma.blogPost.findMany({
    where: { 
      isActive: true, 
      isDeleted: false 
    },
    include: {
      translations: {
        where: { language: locale },
      },
      categories: {
        include: {
          category: {
            include: {
              translations: {
                where: { language: locale },
              },
            },
          },
        },
      },
    },
    orderBy: { 
      publishedAt: 'desc' 
    },
  });

  // 2. Aktif blog kategorilerini çek
  const categories = await prisma.blogCategory.findMany({
    where: { isActive: true },
    include: {
      translations: {
        where: { language: locale },
      },
    },
    orderBy: { order: 'asc' },
  });

  // Verileri formatlayıp temiz JSON olarak client component'e aktaralım
  const formattedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.translations[0]?.name || t('other'),
    slug: cat.translations[0]?.slug || '',
  }));

  const formattedPosts = posts.map(post => {
    const translation = post.translations[0];
    const category = post.categories[0]?.category;
    const categoryTranslation = category?.translations[0];

    return {
      id: post.id,
      image: post.image || '',
      authorName: post.authorName || t('author'),
      isFeatured: post.isFeatured,
      publishedAt: post.publishedAt ? post.publishedAt.toISOString().split('T')[0] : post.createdAt.toISOString().split('T')[0],
      title: translation?.title || t('untitledArticle'),
      slug: translation?.slug || '',
      excerpt: translation?.excerpt || '',
      categoryName: categoryTranslation?.name || t('beauty'),
      categorySlug: categoryTranslation?.slug || 'beauty',
    };
  });

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#faf8f7]">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/5 rounded-full blur-3xl -z-10 animate-glow"></div>
      
      <div className="max-w-6xl mx-auto px-6 z-10">
        <div className="text-center mb-12">
          <span className="text-[var(--color-rose-600)] text-xs font-bold uppercase tracking-widest block mb-3">{t('beautySecrets')}</span>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-gray-950 mb-4">{heroTitle}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            {introText}
          </p>
        </div>

        <BlogClient 
          initialPosts={formattedPosts} 
          categories={formattedCategories} 
          locale={resolvedParams.locale}
        />
      </div>
    </main>
  );
}
