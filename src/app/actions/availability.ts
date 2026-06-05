"use server";

import { prisma } from '@/lib/prisma';
import { ApptStatus } from '@prisma/client';

// Saati dakika cinsine çeviren yardımcı fonksiyon (örn: "09:30" -> 570)
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Dakika cinsini saat formatına çeviren yardımcı fonksiyon (örn: 570 -> "09:30")
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export async function getAvailableTimeSlots(
  locationId: string,
  serviceId: string,
  dateStr: string,
  staffId?: string
) {
  try {
    if (!locationId || !serviceId || !dateStr) {
      return { success: false, error: 'Şube, hizmet ve tarih seçilmesi zorunludur!' };
    }

    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 (Pazar) - 6 (Cumartesi)

    // 1. Hizmetin süresini öğrenelim
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || service.isDeleted || !service.isActive) {
      return { success: false, error: 'Hizmet bulunamadı veya pasif.' };
    }

    const duration = service.duration;

    // 2. Şube çalışma saatlerini alalım
    const shopHours = await prisma.workingHours.findFirst({
      where: {
        locationId,
        dayOfWeek,
        isClosed: false,
      },
    });

    if (!shopHours) {
      return { success: true, slots: [] }; // Şube o gün kapalı
    }

    // 3. Şubenin o gün resmi tatilde/kapalı olup olmadığını kontrol edelim
    const isHoliday = await prisma.holiday.findFirst({
      where: {
        locationId,
        date: dateObj,
      },
    });

    if (isHoliday) {
      return { success: true, slots: [] }; // Resmi tatil, şube kapalı
    }

    // 4. Hizmeti verebilen aktif personelleri bulalım
    const qualifiedStaff = await prisma.staff.findMany({
      where: {
        locationId,
        isActive: true,
        isDeleted: false,
        services: {
          some: {
            serviceId,
          },
        },
        ...(staffId && staffId !== 'ANY' ? { id: staffId } : {}),
      },
      include: {
        workingHours: {
          where: { dayOfWeek },
        },
        leaves: {
          where: {
            date: dateObj,
          },
        },
        appointments: {
          where: {
            date: dateObj,
            status: {
              in: [ApptStatus.PENDING, ApptStatus.CONFIRMED, ApptStatus.RESCHEDULED],
            },
          },
        },
        timeBlocks: {
          where: {
            date: dateObj,
          },
        },
      },
    });

    if (qualifiedStaff.length === 0) {
      return { success: true, slots: [] }; // O gün o şubede bu hizmeti verebilecek kimse yok
    }

    // Ortak müsait slotları toplayacağımız küme (Unique list)
    const allAvailableSlots = new Set<string>();

    const shopOpenMin = timeToMinutes(shopHours.openTime);
    const shopCloseMin = timeToMinutes(shopHours.closeTime);
    const shopBreakStartMin = shopHours.breakStart ? timeToMinutes(shopHours.breakStart) : null;
    const shopBreakEndMin = shopHours.breakEnd ? timeToMinutes(shopHours.breakEnd) : null;

    // 5. Her personel için müsait aralıkları hesaplayalım
    for (const staff of qualifiedStaff) {
      // Personel o gün için tamamen izinli mi?
      const fullDayLeave = staff.leaves.find((l) => l.isFullDay);
      if (fullDayLeave) {
        continue; // İzinli, bu çalışanı geç
      }

      // Personelin o günkü çalışma saati ayarı var mı ve kapalı mı?
      const staffDayHours = staff.workingHours[0];
      if (staffDayHours && staffDayHours.isClosed) {
        continue; // Çalışan o gün çalışmıyor
      }

      // Kesişen çalışma saatlerini hesapla (Şube saatleriyle çalışanın saatlerini daralt)
      let openMin = shopOpenMin;
      let closeMin = shopCloseMin;

      if (staffDayHours) {
        const staffOpenMin = timeToMinutes(staffDayHours.openTime);
        const staffCloseMin = timeToMinutes(staffDayHours.closeTime);
        openMin = Math.max(openMin, staffOpenMin);
        closeMin = Math.min(closeMin, staffCloseMin);
      }

      // Bloke aralıkları oluştur
      const blocks: { start: number; end: number }[] = [];

      // Şube molası
      if (shopBreakStartMin !== null && shopBreakEndMin !== null) {
        blocks.push({ start: shopBreakStartMin, end: shopBreakEndMin });
      }

      // Personel molası
      if (staffDayHours && staffDayHours.breakStart && staffDayHours.breakEnd) {
        blocks.push({
          start: timeToMinutes(staffDayHours.breakStart),
          end: timeToMinutes(staffDayHours.breakEnd),
        });
      }

      // Kısmi İzinler
      staff.leaves.forEach((leave) => {
        if (!leave.isFullDay && leave.startTime && leave.endTime) {
          blocks.push({
            start: timeToMinutes(leave.startTime),
            end: timeToMinutes(leave.endTime),
          });
        }
      });

      // Zaman Blokları (Toplantı, Bakım vb.)
      staff.timeBlocks.forEach((block) => {
        blocks.push({
          start: timeToMinutes(block.startTime),
          end: timeToMinutes(block.endTime),
        });
      });

      // Mevcut onaylı randevuları
      staff.appointments.forEach((appt) => {
        blocks.push({
          start: timeToMinutes(appt.startTime),
          end: timeToMinutes(appt.endTime),
        });
      });

      // Zaman dilimlerini tara (15'er dakikalık adımlarla)
      const stepMinutes = 15;
      for (let current = openMin; current + duration <= closeMin; current += stepMinutes) {
        const slotStart = current;
        const slotEnd = current + duration;

        // Herhangi bir bloke süreyle çakışma var mı?
        const isBlocked = blocks.some((b) => {
          return slotStart < b.end && slotEnd > b.start;
        });

        if (!isBlocked) {
          allAvailableSlots.add(minutesToTime(slotStart));
        }
      }
    }

    // Sıralı diziye çevir
    const sortedSlots = Array.from(allAvailableSlots).sort((a, b) => {
      return timeToMinutes(a) - timeToMinutes(b);
    });

    return { success: true, slots: sortedSlots };
  } catch (error: any) {
    console.error('Müsaitlik slot hesaplama hatası:', error);
    return { success: false, error: 'Müsaitlik saatleri hesaplanırken bir hata oluştu.' };
  }
}
