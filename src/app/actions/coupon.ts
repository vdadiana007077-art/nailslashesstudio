"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { DiscountType } from '@prisma/client';

export async function createCoupon(formData: FormData) {
  const code = (formData.get('code') as string).toUpperCase().trim();
  const discountType = formData.get('discountType') as DiscountType;
  const value = parseFloat(formData.get('value') as string);
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const usageLimitStr = formData.get('usageLimit') as string;

  if (!code || !discountType || isNaN(value)) {
    return { success: false, error: 'Kod, İndirim Tipi ve Değer zorunludur!' };
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const usageLimit = usageLimitStr ? parseInt(usageLimitStr) : null;

  try {
    const existing = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existing) {
      return { success: false, error: 'Bu kupon kodu zaten mevcut!' };
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        value,
        startDate,
        endDate,
        usageLimit,
        isActive: true,
      },
    });

    revalidatePath('/[locale]/admin/coupons', 'page');
    return { success: true, data: newCoupon };
  } catch (error: any) {
    console.error('Kupon oluşturma hatası:', error);
    return { success: false, error: 'Kupon oluşturulurken bir hata oluştu.' };
  }
}

export async function updateCoupon(id: string, formData: FormData) {
  const code = (formData.get('code') as string).toUpperCase().trim();
  const discountType = formData.get('discountType') as DiscountType;
  const value = parseFloat(formData.get('value') as string);
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const usageLimitStr = formData.get('usageLimit') as string;
  const isActive = formData.get('isActive') === 'true';

  if (!code || !discountType || isNaN(value)) {
    return { success: false, error: 'Kod, İndirim Tipi ve Değer zorunludur!' };
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const usageLimit = usageLimitStr ? parseInt(usageLimitStr) : null;

  try {
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        discountType,
        value,
        startDate,
        endDate,
        usageLimit,
        isActive,
      },
    });

    revalidatePath('/[locale]/admin/coupons', 'page');
    return { success: true, data: updatedCoupon };
  } catch (error: any) {
    console.error('Kupon güncelleme hatası:', error);
    return { success: false, error: 'Kupon güncellenirken bir hata oluştu.' };
  }
}

export async function deleteCoupon(id: string) {
  // Kurallar gereği fiziksel silme yapmıyoruz, isActive = false yapıyoruz (soft-delete).
  try {
    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/[locale]/admin/coupons', 'page');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Kupon silme (pasifleştirme) hatası:', error);
    return { success: false, error: 'Kupon silinirken bir hata oluştu.' };
  }
}
