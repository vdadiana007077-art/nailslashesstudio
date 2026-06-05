"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Language } from '@prisma/client';

export async function createLandingPage(formData: FormData) {
  const isActive = formData.get('isActive') === 'true';
  const language = formData.get('language') as Language;
  const title = formData.get('title') as string;
  const slug = (formData.get('slug') as string).toLowerCase().trim();
  const content = formData.get('content') as string;

  const seoTitle = formData.get('seoTitle') as string || null;
  const seoDesc = formData.get('seoDesc') as string || null;
  const canonical = formData.get('canonical') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDesc = formData.get('ogDesc') as string || null;
  const ogImage = formData.get('ogImage') as string || null;
  const index = formData.get('index') !== 'false';
  const sitemap = formData.get('sitemap') !== 'false';

  if (!title || !slug || !language) {
    return { success: false, error: 'Başlık, slug ve dil alanları zorunludur!' };
  }

  try {
    // Dil bazında benzersiz slug kontrolü
    const existingSlug = await prisma.landingPageTranslation.findFirst({
      where: { slug, language },
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug zaten kullanılıyor!' };
    }

    const newLandingPage = await prisma.landingPage.create({
      data: {
        isActive,
        translations: {
          create: {
            language,
            slug,
            title,
            content,
            seoTitle,
            seoDesc,
            canonical,
            ogTitle,
            ogDesc,
            ogImage,
            index,
            sitemap,
          },
        },
      },
      include: {
        translations: true,
      },
    });

    revalidatePath('/[locale]/admin/landing-pages', 'page');
    return { success: true, data: newLandingPage };
  } catch (error: any) {
    console.error('Landing page oluşturma hatası:', error);
    return { success: false, error: 'SEO sayfası oluşturulurken bir hata oluştu.' };
  }
}

export async function updateLandingPage(
  id: string,
  translationId: string | null,
  formData: FormData
) {
  const isActive = formData.get('isActive') === 'true';
  const language = formData.get('language') as Language;
  const title = formData.get('title') as string;
  const slug = (formData.get('slug') as string).toLowerCase().trim();
  const content = formData.get('content') as string;

  const seoTitle = formData.get('seoTitle') as string || null;
  const seoDesc = formData.get('seoDesc') as string || null;
  const canonical = formData.get('canonical') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDesc = formData.get('ogDesc') as string || null;
  const ogImage = formData.get('ogImage') as string || null;
  const index = formData.get('index') !== 'false';
  const sitemap = formData.get('sitemap') !== 'false';

  if (!title || !slug || !language) {
    return { success: false, error: 'Başlık, slug ve dil alanları zorunludur!' };
  }

  try {
    // Dil bazında benzersiz slug kontrolü (kendisi hariç)
    const existingSlug = await prisma.landingPageTranslation.findFirst({
      where: {
        slug,
        language,
        NOT: translationId ? { id: translationId } : undefined,
      },
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug başka bir sayfada kullanılıyor!' };
    }

    // Ana kaydı güncelle
    await prisma.landingPage.update({
      where: { id },
      data: { isActive },
    });

    // Çeviri kaydını oluştur veya güncelle
    if (translationId) {
      await prisma.landingPageTranslation.update({
        where: { id: translationId },
        data: {
          slug,
          title,
          content,
          seoTitle,
          seoDesc,
          canonical,
          ogTitle,
          ogDesc,
          ogImage,
          index,
          sitemap,
        },
      });
    } else {
      await prisma.landingPageTranslation.create({
        data: {
          landingPageId: id,
          language,
          slug,
          title,
          content,
          seoTitle,
          seoDesc,
          canonical,
          ogTitle,
          ogDesc,
          ogImage,
          index,
          sitemap,
        },
      });
    }

    revalidatePath('/[locale]/admin/landing-pages', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Landing page güncelleme hatası:', error);
    return { success: false, error: 'SEO sayfası güncellenirken bir hata oluştu.' };
  }
}

export async function deleteLandingPage(id: string) {
  try {
    // Kurallar gereği soft delete uyguluyoruz
    await prisma.landingPage.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });

    revalidatePath('/[locale]/admin/landing-pages', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Landing page silme hatası:', error);
    return { success: false, error: 'SEO sayfası silinirken bir hata oluştu.' };
  }
}
