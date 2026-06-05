"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { GiftCardStatus } from '@prisma/client';

export async function createGiftCard(formData: FormData) {
  const code = (formData.get('code') as string).toUpperCase().trim();
  const amount = parseFloat(formData.get('amount') as string);
  const expiryDateStr = formData.get('expiryDate') as string;

  if (!code || isNaN(amount)) {
    return { success: false, error: 'Kod ve Tutar zorunludur!' };
  }

  const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;

  try {
    const existing = await prisma.giftCard.findUnique({
      where: { code },
    });

    if (existing) {
      return { success: false, error: 'Bu hediye kartı kodu zaten mevcut!' };
    }

    const newGiftCard = await prisma.giftCard.create({
      data: {
        code,
        amount,
        balance: amount, // Başlangıçta bakiye tutara eşittir
        expiryDate,
        status: GiftCardStatus.ACTIVE,
      },
    });

    revalidatePath('/[locale]/admin/giftcards', 'page');
    return { success: true, data: newGiftCard };
  } catch (error: any) {
    console.error('Hediye kartı oluşturma hatası:', error);
    return { success: false, error: 'Hediye kartı oluşturulurken bir hata oluştu.' };
  }
}

export async function updateGiftCard(id: string, formData: FormData) {
  const status = formData.get('status') as GiftCardStatus;
  const balance = parseFloat(formData.get('balance') as string);
  const expiryDateStr = formData.get('expiryDate') as string;

  if (isNaN(balance)) {
    return { success: false, error: 'Bakiye zorunludur!' };
  }

  const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;

  try {
    const updatedGiftCard = await prisma.giftCard.update({
      where: { id },
      data: {
        status,
        balance,
        expiryDate,
      },
    });

    revalidatePath('/[locale]/admin/giftcards', 'page');
    return { success: true, data: updatedGiftCard };
  } catch (error: any) {
    console.error('Hediye kartı güncelleme hatası:', error);
    return { success: false, error: 'Hediye kartı güncellenirken bir hata oluştu.' };
  }
}

export async function deleteGiftCard(id: string) {
  // Kurallar gereği fiziksel silme yapmıyoruz, durumu EXPIRED olarak işaretliyoruz (soft-delete).
  try {
    const updated = await prisma.giftCard.update({
      where: { id },
      data: { status: GiftCardStatus.EXPIRED },
    });

    revalidatePath('/[locale]/admin/giftcards', 'page');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Hediye kartı pasifleştirme hatası:', error);
    return { success: false, error: 'Hediye kartı silinirken bir hata oluştu.' };
  }
}
