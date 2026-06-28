"use server";

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { decryptSession } from '@/lib/auth-helpers';
import { Role } from '@prisma/client';

/**
 * Mevcut oturumdaki personeli döndürür. Yoksa null döner.
 */
export async function getCurrentStaff() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token');
    
    if (!token) return null;

    const session = decryptSession(token.value);
    if (!session || !session.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        staff: true,
      }
    });

    if (!user || user.role !== Role.STAFF || !user.staff) {
      return null;
    }

    return user.staff;
  } catch (error) {
    console.error('Staff auth hatası:', error);
    return null;
  }
}

/**
 * Sadece STAFF rolüne sahip kullanıcıların erişimini sağlar.
 * Değilse hata fırlatır. (Server action'lar için)
 */
export async function requireStaff() {
  const staff = await getCurrentStaff();
  if (!staff) {
    throw new Error('Yetkisiz erişim: Bu işlemi yapmak için personel olmalısınız.');
  }
  return staff;
}

/**
 * Sistem adminini doğrular. (Server action'lar için)
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  
  if (!token || token.value !== 'authenticated') {
    throw new Error('Yetkisiz erişim: Bu işlemi yapmak için admin olmalısınız.');
  }
  return true;
}
