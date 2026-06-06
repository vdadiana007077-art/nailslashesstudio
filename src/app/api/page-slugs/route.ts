import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * Navbar dil değiştirici için: Mevcut slug'ın hedef dildeki karşılığını bulur.
 * 
 * GET /api/page-slugs?slug=uslugi&lang=RU
 * → { pageId: "...", slugs: { tr: "hizmetlerimiz", en: "services", de: "dienstleistungen", ru: "uslugi" } }
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const lang = searchParams.get('lang')?.toUpperCase();

  if (!slug || !lang) {
    return NextResponse.json({ error: 'slug ve lang parametreleri gerekli' }, { status: 400 });
  }

  try {
    // 1. PageTranslation'da ara
    const pageTranslation = await prisma.pageTranslation.findFirst({
      where: {
        slug,
        language: lang as any,
        page: { isActive: true, isDeleted: false }
      },
      include: {
        page: {
          include: {
            translations: {
              select: { language: true, slug: true }
            }
          }
        }
      }
    });

    if (pageTranslation) {
      const slugs: Record<string, string> = {};
      for (const t of pageTranslation.page.translations) {
        slugs[t.language.toLowerCase()] = t.slug;
      }
      return NextResponse.json({
        pageId: pageTranslation.page.id,
        type: 'page',
        slugs
      });
    }

    // 2. LandingPageTranslation'da ara
    const landingTranslation = await prisma.landingPageTranslation.findFirst({
      where: {
        slug,
        language: lang as any,
        landingPage: { isActive: true, isDeleted: false }
      },
      include: {
        landingPage: {
          include: {
            translations: {
              select: { language: true, slug: true }
            }
          }
        }
      }
    });

    if (landingTranslation) {
      const slugs: Record<string, string> = {};
      for (const t of landingTranslation.landingPage.translations) {
        slugs[t.language.toLowerCase()] = t.slug;
      }
      return NextResponse.json({
        pageId: landingTranslation.landingPage.id,
        type: 'landing',
        slugs
      });
    }

    // 3. Blog, services gibi hardcoded sayfalar için statik mapping
    // Bu sayfaların slug'ları her dilde aynı olabilir
    return NextResponse.json({ pageId: null, type: null, slugs: null });

  } catch (error: any) {
    console.error('Page slug çözümleme hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
