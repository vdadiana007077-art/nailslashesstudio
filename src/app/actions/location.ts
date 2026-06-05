"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logAction } from './audit';

export async function createLocation(formData: FormData) {
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const phone = formData.get('phone') as string || null;
  const email = formData.get('email') as string || null;

  if (!name || !address) {
    return { success: false, error: 'Şube adı ve adres zorunludur!' };
  }

  try {
    const newLocation = await prisma.location.create({
      data: {
        name,
        address,
        phone,
        email,
      },
    });

    revalidatePath('/[locale]/admin/locations', 'page');
    revalidatePath('/[locale]/booking', 'page');
    await logAction('Şube Oluşturuldu', `İsim: ${name}, Adres: ${address}`);
    return { success: true, data: newLocation };
  } catch (error: any) {
    console.error('Şube ekleme hatası:', error);
    return { success: false, error: 'Şube eklenirken bir hata oluştu.' };
  }
}

export async function updateLocation(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const phone = formData.get('phone') as string || null;
  const email = formData.get('email') as string || null;
  const isActive = formData.get('isActive') === 'true';

  if (!name || !address) {
    return { success: false, error: 'Şube adı ve adres zorunludur!' };
  }

  try {
    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        name,
        address,
        phone,
        email,
        isActive,
      },
    });

    revalidatePath('/[locale]/admin/locations', 'page');
    revalidatePath('/[locale]/booking', 'page');
    await logAction('Şube Güncellendi', `Şube ID: ${id}, İsim: ${name}, Durum: ${isActive ? 'Aktif' : 'Pasif'}`);
    return { success: true, data: updatedLocation };
  } catch (error: any) {
    console.error('Şube güncelleme hatası:', error);
    return { success: false, error: 'Şube güncellenirken bir hata oluştu.' };
  }
}

export async function deleteLocation(id: string) {
  try {
    // Kurallar gereği kalıcı silme yapılmayacak, soft-delete uygulanacak
    await prisma.location.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false
      },
    });

    // İlgili şubeye bağlı çalışanları da pasife çek (soft delete)
    await prisma.staff.updateMany({
      where: { locationId: id },
      data: {
        isActive: false
      }
    });

    revalidatePath('/[locale]/admin/locations', 'page');
    revalidatePath('/[locale]/booking', 'page');
    await logAction('Şube Silindi (Soft-Delete)', `Şube ID: ${id}`);
    return { success: true };
  } catch (error: any) {
    console.error('Şube silme hatası:', error);
    return { success: false, error: 'Şube silinirken bir hata oluştu.' };
  }
}
