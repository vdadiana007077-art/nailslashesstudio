"use server";

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function logAction(action: string, details?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  // Yalnızca oturumu doğrulanmış admin işlemlerini loglayalım
  if (!token || token.value !== 'authenticated') {
    return { success: false, error: 'Oturum doğrulanmadı.' };
  }

  try {
    const newLog = await prisma.auditLog.create({
      data: {
        userEmail: 'admin@nailslashesstudio.com',
        action,
        details: details || null,
      }
    });
    return { success: true, data: newLog };
  } catch (error: any) {
    console.error('Audit log kaydı sırasında hata:', error);
    return { success: false, error: 'İşlem günlüğü kaydedilemedi.' };
  }
}
