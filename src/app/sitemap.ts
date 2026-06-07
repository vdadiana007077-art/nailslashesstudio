import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { routing } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nailslashesstudio.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];

  // Sabit Sayfalar
  const staticPages = [
    '',
    '/hakkimizda',
    '/iletisim',
    '/services',
    '/galeri',
    '/portfolio',
    '/blog',
    '/booking'
  ];

  for (const page of staticPages) {
    for (const locale of routing.locales) {
      const url = locale === routing.defaultLocale 
        ? `${SITE_URL}${page}` 
        : `${SITE_URL}/${locale}${page}`;
        
      routes.push({
        url: url.endsWith('/') && url.length > SITE_URL.length ? url.slice(0, -1) : url,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  try {
    // Helper function to extract correct slug for a given locale
    const getSlug = (translations: any[], locale: string) => {
      const langEnum = locale.toUpperCase();
      const trans = translations.find((t: any) => t.language === langEnum);
      return trans?.slug || translations[0]?.slug;
    };

    // 1. Landing Pages
    const landingPages = await prisma.landingPage.findMany({
      where: { isActive: true },
      include: { translations: { select: { slug: true, language: true } } }
    });

    for (const page of landingPages) {
      for (const locale of routing.locales) {
        const slug = getSlug(page.translations, locale);
        if (!slug) continue;
        routes.push({
          url: `${SITE_URL}${locale === routing.defaultLocale ? '' : `/${locale}`}/${slug}`,
          lastModified: page.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
    }

    // 2. Kategoriler ve Hizmetler
    const serviceCategories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      include: {
        translations: { select: { slug: true, language: true } },
        services: {
          where: { isActive: true },
          include: { translations: { select: { slug: true, language: true } } }
        }
      }
    });

    for (const cat of serviceCategories) {
      for (const locale of routing.locales) {
        const catSlug = getSlug(cat.translations, locale);
        if (!catSlug) continue;
        const catUrl = `${SITE_URL}${locale === routing.defaultLocale ? '' : `/${locale}`}/services/${catSlug}`;
        
        routes.push({
          url: catUrl,
          lastModified: new Date(), // updated at doesn't exist on ServiceCategory
          changeFrequency: 'weekly',
          priority: 0.7,
        });

        for (const service of cat.services) {
          const srvSlug = getSlug(service.translations, locale);
          if (!srvSlug) continue;
          routes.push({
            url: `${catUrl}/${srvSlug}`,
            lastModified: new Date(), // updated at doesn't exist on Service
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      }
    }

    // 3. Blog Kategorileri ve Bloglar
    const blogCategories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      include: {
        translations: { select: { slug: true, language: true } },
        posts: {
          include: {
            post: {
              include: { translations: { select: { slug: true, language: true } } }
            }
          }
        }
      }
    });

    for (const cat of blogCategories) {
      for (const locale of routing.locales) {
        const catSlug = getSlug(cat.translations, locale);
        if (!catSlug) continue;
        const catUrl = `${SITE_URL}${locale === routing.defaultLocale ? '' : `/${locale}`}/blog/${catSlug}`;
        
        routes.push({
          url: catUrl,
          lastModified: new Date(), 
          changeFrequency: 'weekly',
          priority: 0.7,
        });

        for (const postLink of cat.posts) {
          if (postLink.post.isActive) {
            const postSlug = getSlug(postLink.post.translations, locale);
            if (!postSlug) continue;
            routes.push({
              url: `${catUrl}/${postSlug}`,
              lastModified: postLink.post.updatedAt,
              changeFrequency: 'daily',
              priority: 0.8,
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('Sitemap oluşturulurken hata:', error);
  }

  return routes;
}
