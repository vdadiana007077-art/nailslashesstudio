"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { TransType, PaymentMethod, Prisma } from '@prisma/client';
import { logAction } from './audit';

export async function createTransaction(data: {
  categoryName: string;
  type: TransType;
  amount: number;
  paymentMethod: PaymentMethod;
  description?: string;
  staffId?: string;
}) {
  if (!data.categoryName || !data.amount) {
    return { success: false, error: 'Kategori adı ve tutar zorunludur!' };
  }

  try {
    // 1. Kategoriyi bul veya yoksa oluştur
    let category = await prisma.transactionCategory.findFirst({
      where: { name: data.categoryName, type: data.type }
    });

    if (!category) {
      category = await prisma.transactionCategory.create({
        data: {
          name: data.categoryName,
          type: data.type,
          isActive: true
        }
      });
    }

    // 2. İşlemi oluştur
    const transaction = await prisma.transaction.create({
      data: {
        categoryId: category.id,
        type: data.type,
        amount: new Prisma.Decimal(data.amount),
        paymentMethod: data.paymentMethod,
        date: new Date(),
        description: data.description || null,
        staffId: data.staffId || null
      }
    });

    // 3. Eylemi logla
    const actionName = data.type === TransType.INCOME ? 'Gelir İşlemi Girildi' : 'Gider İşlemi Girildi';
    await logAction(actionName, `${data.amount} ₺ - Kategori: ${data.categoryName} - Yöntem: ${data.paymentMethod}`);

    revalidatePath('/[locale]/admin/accounting', 'page');
    return { success: true, data: JSON.parse(JSON.stringify(transaction)) };
  } catch (error: any) {
    console.error('İşlem kaydetme hatası:', error);
    return { success: false, error: 'Muhasebe işlemi kaydedilirken bir hata oluştu.' };
  }
}
