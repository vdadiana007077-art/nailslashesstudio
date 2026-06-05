"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Language } from '@prisma/client';

export async function createSubscriber(email: string, language: Language) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Geçersiz e-posta adresi!' };
  }

  try {
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (!existing.isActive) {
        // Yeniden aktive et
        const updated = await prisma.subscriber.update({
          where: { email },
          data: { isActive: true, language },
        });
        revalidatePath('/[locale]/admin/subscribers', 'page');
        return { success: true, data: updated };
      }
      return { success: false, error: 'Bu e-posta adresi zaten kayıtlı!' };
    }

    const newSubscriber = await prisma.subscriber.create({
      data: {
        email,
        language,
        isActive: true,
      },
    });

    revalidatePath('/[locale]/admin/subscribers', 'page');
    return { success: true, data: newSubscriber };
  } catch (error: any) {
    console.error('Abone ekleme hatası:', error);
    return { success: false, error: 'Abonelik işlemi başarısız oldu.' };
  }
}

export async function toggleSubscriberStatus(id: string, isActive: boolean) {
  try {
    const updated = await prisma.subscriber.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath('/[locale]/admin/subscribers', 'page');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Abone durum güncelleme hatası:', error);
    return { success: false, error: 'Abone durumu güncellenirken bir hata oluştu.' };
  }
}

export async function unsubscribe(id: string) {
  // Kurallar gereği doğrudan silmek yerine isActive = false yapıyoruz (soft-delete).
  return toggleSubscriberStatus(id, false);
}
