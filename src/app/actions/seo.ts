"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// REDIRECT (YÖNLENDİRME) ACTIONS
export async function createRedirect(formData: FormData) {
  const oldUrl = (formData.get('oldUrl') as string).trim();
  const newUrl = (formData.get('newUrl') as string).trim();
  const statusCode = parseInt(formData.get('statusCode') as string || '301');
  const isActive = formData.get('isActive') === 'true';

  if (!oldUrl || !newUrl) {
    return { success: false, error: 'Eski URL ve Yeni URL zorunludur!' };
  }

  try {
    const existing = await prisma.redirect.findUnique({
      where: { oldUrl },
    });

    if (existing) {
      return { success: false, error: 'Bu Eski URL için zaten bir yönlendirme kuralı mevcut!' };
    }

    const newRedirect = await prisma.redirect.create({
      data: {
        oldUrl,
        newUrl,
        statusCode,
        isActive,
      },
    });

    revalidatePath('/[locale]/admin/seo', 'page');
    return { success: true, data: newRedirect };
  } catch (error: any) {
    console.error('Yönlendirme oluşturma hatası:', error);
    return { success: false, error: 'Yönlendirme oluşturulurken bir hata oluştu.' };
  }
}

export async function updateRedirect(id: string, formData: FormData) {
  const oldUrl = (formData.get('oldUrl') as string).trim();
  const newUrl = (formData.get('newUrl') as string).trim();
  const statusCode = parseInt(formData.get('statusCode') as string || '301');
  const isActive = formData.get('isActive') === 'true';

  if (!oldUrl || !newUrl) {
    return { success: false, error: 'Eski URL ve Yeni URL zorunludur!' };
  }

  try {
    const existing = await prisma.redirect.findFirst({
      where: {
        oldUrl,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, error: 'Bu Eski URL başka bir yönlendirme kuralında kullanılıyor!' };
    }

    const updated = await prisma.redirect.update({
      where: { id },
      data: {
        oldUrl,
        newUrl,
        statusCode,
        isActive,
      },
    });

    revalidatePath('/[locale]/admin/seo', 'page');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Yönlendirme güncelleme hatası:', error);
    return { success: false, error: 'Yönlendirme güncellenirken bir hata oluştu.' };
  }
}

export async function deleteRedirect(id: string) {
  // Kurallar gereği fiziksel silme yapmıyoruz, isActive = false yapıyoruz (soft-delete).
  try {
    await prisma.redirect.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/[locale]/admin/seo', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Yönlendirme pasifleştirme hatası:', error);
    return { success: false, error: 'Yönlendirme silinirken bir hata oluştu.' };
  }
}
