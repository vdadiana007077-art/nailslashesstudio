// Merkezi slug çözümleme ve URL yardımcı fonksiyonları
import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';

/**
 * Verilen slug ve dil için PageTranslation kaydını bulur.
 * Aynı Page ID altındaki tüm dillerin slug bilgilerini döndürür.
 */
export async function resolvePageBySlug(slug: string, language: Language) {
  // 1. PageTranslation tablosunda slug + language ile ara
  const translation = await prisma.pageTranslation.findFirst({
    where: {
      slug,
      language,
      page: {
        isActive: true,
        isDeleted: false
      }
    },
    include: {
      page: {
        include: {
          translations: {
            select: {
              language: true,
              slug: true,
              seoTitle: true,
              seoDesc: true,
              ogTitle: true,
              ogDesc: true,
              ogImage: true,
              headerImage: true,
              h1Title: true,
              introText: true,
              title: true,
              canonical: true,
              index: true,
            }
          }
        }
      }
    }
  });

  if (!translation) return null;

  return {
    translation,
    page: translation.page,
    pageGroup: translation.page.pageGroup,
    allTranslations: translation.page.translations,
  };
}

/**
 * Verilen slug ve dil için LandingPageTranslation kaydını bulur.
 */
export async function resolveLandingPageBySlug(slug: string, language: Language) {
  const translation = await prisma.landingPageTranslation.findFirst({
    where: {
      slug,
      language,
      landingPage: {
        isActive: true,
        isDeleted: false
      }
    },
    include: {
      landingPage: {
        include: {
          translations: {
            select: {
              language: true,
              slug: true,
              seoTitle: true,
              seoDesc: true,
              ogTitle: true,
              ogDesc: true,
              ogImage: true,
              title: true,
              canonical: true,
              index: true,
            }
          }
        }
      }
    }
  });

  if (!translation) return null;

  return {
    translation,
    landingPage: translation.landingPage,
    allTranslations: translation.landingPage.translations,
  };
}

/**
 * Dil bazlı URL oluşturma.
 * TR varsayılan dil olduğu için prefix kullanılmaz.
 */
export function createLocalizedUrl(language: string, slug: string): string {
  const lang = language.toLowerCase();
  if (lang === 'tr') {
    return `/${slug}`;
  }
  return `/${lang}/${slug}`;
}

/**
 * Tüm dillerdeki slug'lardan hreflang alternates nesnesi oluşturur.
 */
export function buildHreflangAlternates(
  allTranslations: Array<{ language: string; slug: string }>,
  domain: string = 'https://nailslashesstudio.com'
) {
  const languages: Record<string, string> = {};
  
  for (const t of allTranslations) {
    const lang = t.language.toLowerCase();
    const url = createLocalizedUrl(t.language, t.slug);
    languages[lang] = `${domain}${url}`;
  }
  
  return languages;
}

/**
 * Slug normalizasyonu: Admin'den gelen slug'ı temizler.
 */
export function normalizeSlug(input: string): string {
  let slug = input.trim();
  
  // Baştaki / kaldır
  slug = slug.replace(/^\/+/, '');
  
  // Dil prefix'i varsa kaldır (tr/, en/, de/, ru/)
  slug = slug.replace(/^(tr|en|de|ru)\//i, '');
  
  // Sondaki / kaldır
  slug = slug.replace(/\/+$/, '');
  
  // Küçük harfe çevir
  slug = slug.toLowerCase();
  
  // Türkçe karakterleri latinleştir
  const turkishMap: Record<string, string> = {
    'ö': 'o', 'ü': 'u', 'ş': 's', 'ç': 'c', 'ğ': 'g', 'ı': 'i',
    'Ö': 'o', 'Ü': 'u', 'Ş': 's', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i'
  };
  slug = slug.replace(/[öüşçğıÖÜŞÇĞİ]/g, (char) => turkishMap[char] || char);
  
  // Boşlukları tireye çevir
  slug = slug.replace(/\s+/g, '-');
  
  // Alfanumerik olmayan karakterleri kaldır (tire hariç)
  slug = slug.replace(/[^a-z0-9-]/g, '');
  
  // Çift tireleri temizle
  slug = slug.replace(/-+/g, '-');
  
  // Baştaki ve sondaki tireleri kaldır
  slug = slug.replace(/^-+|-+$/g, '');
  
  return slug;
}
