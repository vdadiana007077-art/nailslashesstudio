"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logAction } from './audit';

export async function createLocation(formData: FormData) {
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const phone = formData.get('phone') as string || null;
  const email = formData.get('email') as string || null;
  const branchName = formData.get('branchName') as string || null;
  const city = formData.get('city') as string || null;
  const country = formData.get('country') as string || null;
  const latitudeStr = formData.get('latitude') as string || null;
  const longitudeStr = formData.get('longitude') as string || null;
  const googlePlaceId = formData.get('googlePlaceId') as string || null;
  const googleMapsUrl = formData.get('googleMapsUrl') as string || null;
  const seoTitle = formData.get('seoTitle') as string || null;
  const seoDesc = formData.get('seoDesc') as string || null;
  const canonical = formData.get('canonical') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDesc = formData.get('ogDesc') as string || null;
  const ogImage = formData.get('ogImage') as string || null;

  const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
  const longitude = longitudeStr ? parseFloat(longitudeStr) : null;

  if (!name || !address) {
    return { success: false, error: 'Şube adı ve adres zorunludur!' };
  }

  try {
    const newLocation = await prisma.location.create({
      data: {
        name,
        branchName,
        address,
        city,
        country,
        latitude,
        longitude,
        googlePlaceId,
        googleMapsUrl,
        phone,
        email,
        seoTitle,
        seoDesc,
        canonical,
        ogTitle,
        ogDesc,
        ogImage,
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
  const branchName = formData.get('branchName') as string || null;
  const city = formData.get('city') as string || null;
  const country = formData.get('country') as string || null;
  const latitudeStr = formData.get('latitude') as string || null;
  const longitudeStr = formData.get('longitude') as string || null;
  const googlePlaceId = formData.get('googlePlaceId') as string || null;
  const googleMapsUrl = formData.get('googleMapsUrl') as string || null;
  const seoTitle = formData.get('seoTitle') as string || null;
  const seoDesc = formData.get('seoDesc') as string || null;
  const canonical = formData.get('canonical') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDesc = formData.get('ogDesc') as string || null;
  const ogImage = formData.get('ogImage') as string || null;

  const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
  const longitude = longitudeStr ? parseFloat(longitudeStr) : null;

  if (!name || !address) {
    return { success: false, error: 'Şube adı ve adres zorunludur!' };
  }

  try {
    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        name,
        branchName,
        address,
        city,
        country,
        latitude,
        longitude,
        googlePlaceId,
        googleMapsUrl,
        phone,
        email,
        isActive,
        seoTitle,
        seoDesc,
        canonical,
        ogTitle,
        ogDesc,
        ogImage,
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

export async function updateLocationWorkingHours(locationId: string, workingHoursList: any[]) {
  try {
    await prisma.$transaction(
      workingHoursList.map((wh) =>
        prisma.workingHours.update({
          where: { id: wh.id },
          data: {
            openTime: wh.openTime,
            closeTime: wh.closeTime,
            isClosed: wh.isClosed,
            breakStart: wh.breakStart,
            breakEnd: wh.breakEnd
          }
        })
      )
    );
    
    revalidatePath('/[locale]/iletisim', 'page');
    revalidatePath('/[locale]/booking', 'page');
    await logAction('Şube Çalışma Saatleri Güncellendi', `Şube ID: ${locationId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Şube çalışma saatleri güncelleme hatası:', error);
    return { success: false, error: 'Çalışma saatleri güncellenirken bir hata oluştu.' };
  }
}
