"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { logAction } from './audit';

export async function getStaffList(locationId?: string) {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        isDeleted: false,
        ...(locationId ? { locationId } : {}),
      },
      include: {
        location: true,
        services: {
          include: {
            service: {
              include: {
                translations: {
                  where: { language: 'TR' }, // Varsayılan TR veya dilde
                },
              },
            },
          },
        },
        workingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        leaves: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: JSON.parse(JSON.stringify(staff)) };
  } catch (error: any) {
    console.error('Personel listeleme hatası:', error);
    return { success: false, error: 'Personeller listelenirken bir hata oluştu.' };
  }
}

export async function createStaff(data: {
  name: string;
  image?: string;
  specialty?: string;
  locationId?: string;
  commissionRate?: number;
  serviceIds: string[];
}) {
  if (!data.name) {
    return { success: false, error: 'Personel adı zorunludur!' };
  }

  try {
    const newStaff = await prisma.$transaction(async (tx) => {
      // 1. Personel kaydını oluştur
      const staff = await tx.staff.create({
        data: {
          name: data.name,
          image: data.image || null,
          specialty: data.specialty || null,
          locationId: data.locationId || null,
          commissionRate: data.commissionRate != null ? new Prisma.Decimal(data.commissionRate) : null,
        },
      });

      // 2. Yetkin olduğu hizmetleri bağla
      if (data.serviceIds && data.serviceIds.length > 0) {
        await tx.staffService.createMany({
          data: data.serviceIds.map((serviceId) => ({
            staffId: staff.id,
            serviceId,
          })),
        });
      }

      // 3. Varsayılan çalışma saatlerini (7 gün için) oluştur
      // Haftanın günleri: 0 (Pazar) - 6 (Cumartesi)
      const defaultHours = [];
      for (let day = 0; day <= 6; day++) {
        defaultHours.push({
          staffId: staff.id,
          dayOfWeek: day,
          openTime: '09:00',
          closeTime: '19:00',
          isClosed: day === 0, // Pazar günleri varsayılan kapalı
          breakStart: '13:00',
          breakEnd: '14:00',
        });
      }

      await tx.staffWorkingHours.createMany({
        data: defaultHours,
      });

      return staff;
    });

    revalidatePath('/[locale]/admin/staff', 'page');
    await logAction('Personel Eklendi', `İsim: ${data.name}, Uzmanlık: ${data.specialty || 'Belirtilmemiş'}`);
    return { success: true, data: JSON.parse(JSON.stringify(newStaff)) };
  } catch (error: any) {
    console.error('Personel oluşturma hatası:', error);
    return { success: false, error: 'Personel eklenirken bir hata oluştu.' };
  }
}

export async function updateStaff(
  id: string,
  data: {
    name: string;
    image?: string;
    specialty?: string;
    locationId?: string;
    commissionRate?: number;
    isActive: boolean;
    serviceIds: string[];
  }
) {
  if (!data.name) {
    return { success: false, error: 'Personel adı zorunludur!' };
  }

  try {
    const updatedStaff = await prisma.$transaction(async (tx) => {
      // 1. Personel bilgilerini güncelle
      const staff = await tx.staff.update({
        where: { id },
        data: {
          name: data.name,
          image: data.image || null,
          specialty: data.specialty || null,
          locationId: data.locationId || null,
          commissionRate: data.commissionRate != null ? new Prisma.Decimal(data.commissionRate) : null,
          isActive: data.isActive,
        },
      });

      // 2. Mevcut hizmet yetkinliklerini sil
      await tx.staffService.deleteMany({
        where: { staffId: id },
      });

      // 3. Yeni hizmet yetkinliklerini bağla
      if (data.serviceIds && data.serviceIds.length > 0) {
        await tx.staffService.createMany({
          data: data.serviceIds.map((serviceId) => ({
            staffId: id,
            serviceId,
          })),
        });
      }

      return staff;
    });

    revalidatePath('/[locale]/admin/staff', 'page');
    await logAction('Personel Güncellendi', `Personel ID: ${id}, İsim: ${data.name}, Durum: ${data.isActive ? 'Aktif' : 'Pasif'}`);
    return { success: true, data: JSON.parse(JSON.stringify(updatedStaff)) };
  } catch (error: any) {
    console.error('Personel güncelleme hatası:', error);
    return { success: false, error: 'Personel güncellenirken bir hata oluştu.' };
  }
}

export async function deleteStaff(id: string) {
  try {
    // Kurallar gereği doğrudan veritabanından silme yapılmayacak, soft-delete yapılacak
    await prisma.staff.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });

    revalidatePath('/[locale]/admin/staff', 'page');
    await logAction('Personel Silindi (Soft-Delete)', `Personel ID: ${id}`);
    return { success: true };
  } catch (error: any) {
    console.error('Personel silme hatası:', error);
    return { success: false, error: 'Personel silinirken bir hata oluştu.' };
  }
}

export async function updateStaffWorkingHours(
  staffId: string,
  hours: {
    id?: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
    breakStart?: string | null;
    breakEnd?: string | null;
  }[]
) {
  try {
    await prisma.$transaction(
      hours.map((h) => {
        if (h.id) {
          return prisma.staffWorkingHours.update({
            where: { id: h.id },
            data: {
              openTime: h.openTime,
              closeTime: h.closeTime,
              isClosed: h.isClosed,
              breakStart: h.breakStart || null,
              breakEnd: h.breakEnd || null,
            },
          });
        } else {
          return prisma.staffWorkingHours.create({
            data: {
              staffId,
              dayOfWeek: h.dayOfWeek,
              openTime: h.openTime,
              closeTime: h.closeTime,
              isClosed: h.isClosed,
              breakStart: h.breakStart || null,
              breakEnd: h.breakEnd || null,
            },
          });
        }
      })
    );

    revalidatePath('/[locale]/admin/staff', 'page');
    await logAction('Personel Çalışma Saatleri Güncellendi', `Personel ID: ${staffId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Personel çalışma saatleri güncelleme hatası:', error);
    return { success: false, error: 'Çalışma saatleri güncellenirken bir hata oluştu.' };
  }
}

export async function addStaffLeave(
  staffId: string,
  data: {
    date: Date;
    isFullDay: boolean;
    startTime?: string;
    endTime?: string;
  }
) {
  try {
    const leave = await prisma.staffLeave.create({
      data: {
        staffId,
        date: data.date,
        isFullDay: data.isFullDay,
        startTime: data.isFullDay ? null : (data.startTime || null),
        endTime: data.isFullDay ? null : (data.endTime || null),
      },
    });

    revalidatePath('/[locale]/admin/staff', 'page');
    await logAction('Personel İzin Eklendi', `Personel ID: ${staffId}, İzin Günü: ${new Date(data.date).toLocaleDateString()}`);
    return { success: true, data: JSON.parse(JSON.stringify(leave)) };
  } catch (error: any) {
    console.error('Personel izin ekleme hatası:', error);
    return { success: false, error: 'İzin eklenirken bir hata oluştu.' };
  }
}

export async function deleteStaffLeave(leaveId: string) {
  try {
    // İzin kayıtlarında soft-delete alanı yoktur (doğrudan silme yapılabilir)
    await prisma.staffLeave.delete({
      where: { id: leaveId },
    });

    revalidatePath('/[locale]/admin/staff', 'page');
    await logAction('Personel İzni Silindi', `İzin ID: ${leaveId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Personel izin silme hatası:', error);
    return { success: false, error: 'İzin silinirken bir hata oluştu.' };
  }
}
