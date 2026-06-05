"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Language } from '@prisma/client';

export async function createPortfolioItem(formData: FormData) {
  const beforeImage = formData.get('beforeImage') as string;
  const afterImage = formData.get('afterImage') as string;
  const category = formData.get('category') as string;
  const isFeatured = formData.get('isFeatured') === 'true';
  const isActive = formData.get('isActive') === 'true';
  const order = parseInt(formData.get('order') as string || '0');
  const language = formData.get('language') as Language;

  const title = formData.get('title') as string;
  const description = formData.get('description') as string || null;

  if (!beforeImage || !afterImage || !category || !title || !language) {
    return { success: false, error: 'Öncesi resim, sonrası resim, kategori, başlık ve dil alanları zorunludur!' };
  }

  try {
    const newItem = await prisma.portfolioItem.create({
      data: {
        beforeImage,
        afterImage,
        category,
        isFeatured,
        isActive,
        order,
        translations: {
          create: {
            language,
            title,
            description,
          },
        },
      },
    });

    revalidatePath('/[locale]/admin/portfolio', 'page');
    revalidatePath('/[locale]/portfolio', 'page');
    return { success: true, data: newItem };
  } catch (error: any) {
    console.error('Portföy öğesi oluşturma hatası:', error);
    return { success: false, error: 'Portföy çalışması oluşturulurken bir hata oluştu.' };
  }
}

export async function updatePortfolioItem(
  id: string,
  translationId: string | null,
  formData: FormData
) {
  const beforeImage = formData.get('beforeImage') as string;
  const afterImage = formData.get('afterImage') as string;
  const category = formData.get('category') as string;
  const isFeatured = formData.get('isFeatured') === 'true';
  const isActive = formData.get('isActive') === 'true';
  const order = parseInt(formData.get('order') as string || '0');
  const language = formData.get('language') as Language;

  const title = formData.get('title') as string;
  const description = formData.get('description') as string || null;

  if (!beforeImage || !afterImage || !category || !title || !language) {
    return { success: false, error: 'Öncesi resim, sonrası resim, kategori, başlık ve dil alanları zorunludur!' };
  }

  try {
    // Ana kaydı güncelle
    await prisma.portfolioItem.update({
      where: { id },
      data: {
        beforeImage,
        afterImage,
        category,
        isFeatured,
        isActive,
        order,
      },
    });

    // Çeviri kaydını oluştur veya güncelle
    if (translationId) {
      await prisma.portfolioItemTranslation.update({
        where: { id: translationId },
        data: {
          title,
          description,
        },
      });
    } else {
      await prisma.portfolioItemTranslation.create({
        data: {
          portfolioItemId: id,
          language,
          title,
          description,
        },
      });
    }

    revalidatePath('/[locale]/admin/portfolio', 'page');
    revalidatePath('/[locale]/portfolio', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Portföy öğesi güncelleme hatası:', error);
    return { success: false, error: 'Portföy çalışması güncellenirken bir hata oluştu.' };
  }
}

export async function deletePortfolioItem(id: string) {
  // Kurallar gereği fiziksel silme yapmıyoruz, isActive = false yapıyoruz (soft-delete).
  try {
    await prisma.portfolioItem.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/[locale]/admin/portfolio', 'page');
    revalidatePath('/[locale]/portfolio', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Portföy öğesi pasifleştirme hatası:', error);
    return { success: false, error: 'Portföy çalışması silinirken bir hata oluştu.' };
  }
}
