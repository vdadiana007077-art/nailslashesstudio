"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Language } from '@prisma/client';

export async function createFaq(formData: FormData) {
  const question = formData.get('question') as string;
  const answer = formData.get('answer') as string;
  const language = formData.get('language') as Language;
  const isActive = formData.get('isActive') === 'true';
  const schemaActive = formData.get('schemaActive') === 'true';
  const order = parseInt(formData.get('order') as string || '0');
  
  const pageId = formData.get('pageId') as string || null;
  const serviceId = formData.get('serviceId') as string || null;
  const blogPostId = formData.get('blogPostId') as string || null;

  if (!question || !answer || !language) {
    return { success: false, error: 'Soru, cevap ve dil alanları zorunludur!' };
  }

  try {
    const newFaq = await prisma.faq.create({
      data: {
        question,
        answer,
        language,
        isActive,
        schemaActive,
        order,
        pageId,
        serviceId,
        blogPostId,
      },
    });

    revalidatePath('/[locale]/admin/faq', 'page');
    revalidatePath('/[locale]/faq', 'page');
    return { success: true, data: newFaq };
  } catch (error: any) {
    console.error('FAQ oluşturma hatası:', error);
    return { success: false, error: 'Soru oluşturulurken bir hata oluştu.' };
  }
}

export async function updateFaq(id: string, formData: FormData) {
  const question = formData.get('question') as string;
  const answer = formData.get('answer') as string;
  const language = formData.get('language') as Language;
  const isActive = formData.get('isActive') === 'true';
  const schemaActive = formData.get('schemaActive') === 'true';
  const order = parseInt(formData.get('order') as string || '0');
  
  const pageId = formData.get('pageId') as string || null;
  const serviceId = formData.get('serviceId') as string || null;
  const blogPostId = formData.get('blogPostId') as string || null;

  if (!question || !answer || !language) {
    return { success: false, error: 'Soru, cevap ve dil alanları zorunludur!' };
  }

  try {
    const updatedFaq = await prisma.faq.update({
      where: { id },
      data: {
        question,
        answer,
        language,
        isActive,
        schemaActive,
        order,
        pageId,
        serviceId,
        blogPostId,
      },
    });

    revalidatePath('/[locale]/admin/faq', 'page');
    revalidatePath('/[locale]/faq', 'page');
    return { success: true, data: updatedFaq };
  } catch (error: any) {
    console.error('FAQ güncelleme hatası:', error);
    return { success: false, error: 'Soru güncellenirken bir hata oluştu.' };
  }
}

export async function deleteFaq(id: string) {
  // Kurallar gereği fiziksel silme yapmıyoruz, isActive = false yapıyoruz (soft-delete).
  try {
    await prisma.faq.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/[locale]/admin/faq', 'page');
    revalidatePath('/[locale]/faq', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('FAQ pasifleştirme hatası:', error);
    return { success: false, error: 'Soru silinirken bir hata oluştu.' };
  }
}
