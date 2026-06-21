"use server";

import { prisma } from '@/lib/prisma';
import { ApptStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { logAction } from './audit';

// ═══════════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════════

/** Saati dakika cinsine çevir (ör: "09:30" → 570) */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Dakikayı saat formatına çevir (ör: 570 → "09:30") */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════════════════════════
// ANA MÜSAİTLİK MOTORU
// ═══════════════════════════════════════════════════════════════════

export type SlotInfo = {
  time: string;
  available: boolean;
  remainingCapacity: number;
  totalCapacity: number;
  bookedCount: number;
  isBlocked: boolean;
  blockReason?: string;
  availableStaffIds: string[];
};

export async function getAvailableTimeSlots(
  locationId: string,
  serviceId: string,
  dateStr: string,
  staffId?: string
): Promise<{
  success: boolean;
  error?: string;
  slots: string[];
  slotDetails: SlotInfo[];
  shopOpenTime: string;
  shopCloseTime: string;
}> {
  const emptyResult = { success: true, slots: [] as string[], slotDetails: [] as SlotInfo[], shopOpenTime: '10:00', shopCloseTime: '19:00' };
  
  try {
    if (!locationId || !serviceId || !dateStr) {
      return { ...emptyResult, success: false, error: 'Şube, hizmet ve tarih seçilmesi zorunludur!' };
    }

    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 (Pazar) - 6 (Cumartesi)

    // 1. Hizmet kontrolü
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.isDeleted || !service.isActive) {
      return { ...emptyResult, success: false, error: 'Hizmet bulunamadı veya pasif.' };
    }
    const duration = service.duration;

    // 2. Hizmet bu şubede veriliyor mu? (LocationService kontrolü)
    const locationService = await prisma.locationService.findUnique({
      where: { locationId_serviceId: { locationId, serviceId } },
    });
    if (!locationService) {
      return { ...emptyResult, success: false, error: 'Bu hizmet seçilen şubede verilmemektedir.' };
    }

    // 3. Şube çalışma saatleri
    const shopHours = await prisma.workingHours.findFirst({
      where: { locationId, dayOfWeek },
    });
    if (shopHours && shopHours.isClosed) {
      return emptyResult;
    }
    const effectiveShopHours = shopHours || {
      openTime: '10:00', closeTime: '19:00', breakStart: null, breakEnd: null,
    };

    // 4. Şube tatil kontrolü
    const isHoliday = await prisma.holiday.findFirst({
      where: { locationId, date: dateObj },
    });
    if (isHoliday) {
      return { ...emptyResult, shopOpenTime: effectiveShopHours.openTime, shopCloseTime: effectiveShopHours.closeTime };
    }

    // 5. Hizmeti verebilen aktif personelleri bul
    const staffFilter: any = {
      locationId,
      isActive: true,
      isDeleted: false,
      services: { some: { serviceId } },
    };
    if (staffId && staffId !== 'ANY') {
      staffFilter.id = staffId;
    }

    let qualifiedStaff = await prisma.staff.findMany({
      where: staffFilter,
      include: {
        workingHours: { where: { dayOfWeek } },
        leaves: { where: { date: dateObj } },
        appointments: {
          where: {
            date: dateObj,
            status: { in: [ApptStatus.PENDING, ApptStatus.CONFIRMED, ApptStatus.RESCHEDULED] },
          },
        },
        timeBlocks: { where: { date: dateObj } },
      },
    });

    // StaffService ataması yoksa fallback: şubedeki tüm aktif personeller
    if (qualifiedStaff.length === 0 && (!staffId || staffId === 'ANY')) {
      qualifiedStaff = await prisma.staff.findMany({
        where: {
          locationId,
          isActive: true,
          isDeleted: false,
          ...(staffId && staffId !== 'ANY' ? { id: staffId } : {}),
        },
        include: {
          workingHours: { where: { dayOfWeek } },
          leaves: { where: { date: dateObj } },
          appointments: {
            where: {
              date: dateObj,
              status: { in: [ApptStatus.PENDING, ApptStatus.CONFIRMED, ApptStatus.RESCHEDULED] },
            },
          },
          timeBlocks: { where: { date: dateObj } },
        },
      });
    }

    if (qualifiedStaff.length === 0) {
      return { ...emptyResult, shopOpenTime: effectiveShopHours.openTime, shopCloseTime: effectiveShopHours.closeTime };
    }

    // 6. AppointmentSlot kurallarını çek
    const customSlots = await prisma.appointmentSlot.findMany({
      where: { locationId, date: dateObj, isActive: true },
    });

    // 7. Şube genel blokelerini çek
    const locationTimeBlocks = await prisma.timeBlock.findMany({
      where: { locationId, staffId: null, date: dateObj },
    });

    // 8. Slot hesaplama
    const shopOpenMin = timeToMinutes(effectiveShopHours.openTime);
    const shopCloseMin = timeToMinutes(effectiveShopHours.closeTime);
    const shopBreakStartMin = effectiveShopHours.breakStart ? timeToMinutes(effectiveShopHours.breakStart) : null;
    const shopBreakEndMin = effectiveShopHours.breakEnd ? timeToMinutes(effectiveShopHours.breakEnd) : null;

    const STEP_MINUTES = 30; // 30 dakikalık slot adımı
    const now = new Date();
    const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    const slotDetailsMap = new Map<string, SlotInfo>();

    // Her slot zamanı için
    for (let current = shopOpenMin; current + duration <= shopCloseMin; current += STEP_MINUTES) {
      const slotTime = minutesToTime(current);
      const slotStart = current;
      const slotEnd = current + duration;

      // Geçmiş saat kontrolü
      const slotDateTime = new Date(`${dateStr}T${slotTime}:00`);
      if (slotDateTime < fourHoursLater) {
        slotDetailsMap.set(slotTime, {
          time: slotTime, available: false, remainingCapacity: 0,
          totalCapacity: 0, bookedCount: 0, isBlocked: false, availableStaffIds: [],
        });
        continue;
      }

      // Şube genelindeki bloke kontrolü
      const locationBlockExists = locationTimeBlocks.some(b =>
        slotStart < timeToMinutes(b.endTime) && slotEnd > timeToMinutes(b.startTime)
      );

      // Şube molası kontrolü
      const shopBreakOverlap = shopBreakStartMin !== null && shopBreakEndMin !== null &&
        slotStart < shopBreakEndMin && slotEnd > shopBreakStartMin;

      // AppointmentSlot bloke kontrolü (şube geneli)
      const generalSlotRule = customSlots.find(s => s.staffId === null && s.time === slotTime);
      const isSlotBlocked = generalSlotRule?.isBlocked || locationBlockExists || shopBreakOverlap;

      if (isSlotBlocked) {
        slotDetailsMap.set(slotTime, {
          time: slotTime, available: false, remainingCapacity: 0,
          totalCapacity: generalSlotRule?.capacity || 0, bookedCount: 0,
          isBlocked: true, blockReason: generalSlotRule?.blockReason || 'Kapalı',
          availableStaffIds: [],
        });
        continue;
      }

      // Her personel için müsaitlik hesapla
      const availableStaffIds: string[] = [];

      for (const staff of qualifiedStaff) {
        // Tam gün izin kontrolü
        if (staff.leaves.some(l => l.isFullDay)) continue;

        // Personel o gün kapalı mı?
        const staffDayHours = staff.workingHours[0];
        if (staffDayHours && staffDayHours.isClosed) continue;

        // Personel çalışma saatleri kesişimi
        let staffOpenMin = shopOpenMin;
        let staffCloseMin = shopCloseMin;
        if (staffDayHours) {
          staffOpenMin = Math.max(staffOpenMin, timeToMinutes(staffDayHours.openTime));
          staffCloseMin = Math.min(staffCloseMin, timeToMinutes(staffDayHours.closeTime));
        }
        if (slotStart < staffOpenMin || slotEnd > staffCloseMin) continue;

        // Personel bloke aralıkları
        const staffBlocks: { start: number; end: number }[] = [];

        // Personel molası
        if (staffDayHours?.breakStart && staffDayHours?.breakEnd) {
          staffBlocks.push({ start: timeToMinutes(staffDayHours.breakStart), end: timeToMinutes(staffDayHours.breakEnd) });
        }

        // Kısmi izinler
        staff.leaves.forEach(leave => {
          if (!leave.isFullDay && leave.startTime && leave.endTime) {
            staffBlocks.push({ start: timeToMinutes(leave.startTime), end: timeToMinutes(leave.endTime) });
          }
        });

        // TimeBlocks
        staff.timeBlocks.forEach(block => {
          staffBlocks.push({ start: timeToMinutes(block.startTime), end: timeToMinutes(block.endTime) });
        });

        // Mevcut randevular
        staff.appointments.forEach(appt => {
          staffBlocks.push({ start: timeToMinutes(appt.startTime), end: timeToMinutes(appt.endTime) });
        });

        // Çakışma kontrolü
        const hasConflict = staffBlocks.some(b => slotStart < b.end && slotEnd > b.start);
        if (hasConflict) continue;

        // Personel bazlı AppointmentSlot kapasitesi
        const staffSlotRule = customSlots.find(s => s.staffId === staff.id && s.time === slotTime);
        if (staffSlotRule?.isBlocked) continue;

        availableStaffIds.push(staff.id);
      }

      // Genel kapasite hesaplama
      const totalCapacity = generalSlotRule?.capacity || qualifiedStaff.length;
      
      // Gerçek randevu sayısını direkt Appointment tablosundan da kontrol et
      const actualBookedCount = qualifiedStaff.reduce((count, staff) => {
        return count + staff.appointments.filter(a =>
          timeToMinutes(a.startTime) < slotEnd && timeToMinutes(a.endTime) > slotStart
        ).length;
      }, 0);

      const slotBookedCount = generalSlotRule?.bookedCount || 0;
      const effectiveBooked = Math.max(actualBookedCount, slotBookedCount);
      const remainingCapacity = Math.max(0, totalCapacity - effectiveBooked);
      const isAvailable = availableStaffIds.length > 0 && remainingCapacity > 0;

      slotDetailsMap.set(slotTime, {
        time: slotTime,
        available: isAvailable,
        remainingCapacity,
        totalCapacity,
        bookedCount: effectiveBooked,
        isBlocked: false,
        availableStaffIds,
      });
    }

    // Sonuçları sırala
    const slotDetails = Array.from(slotDetailsMap.values())
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    
    const availableSlots = slotDetails.filter(s => s.available).map(s => s.time);

    return {
      success: true,
      slots: availableSlots,
      slotDetails,
      shopOpenTime: effectiveShopHours.openTime,
      shopCloseTime: effectiveShopHours.closeTime,
    };
  } catch (error: any) {
    console.error('Müsaitlik slot hesaplama hatası:', error);
    return { success: false, error: 'Müsaitlik saatleri hesaplanırken bir hata oluştu.', slots: [], slotDetails: [], shopOpenTime: '10:00', shopCloseTime: '19:00' };
  }
}

// ═══════════════════════════════════════════════════════════════════
// ŞUBE ÇALIŞMA SAATLERİ
// ═══════════════════════════════════════════════════════════════════

export async function getLocationWorkingHours(locationId: string) {
  try {
    const hours = await prisma.workingHours.findMany({
      where: { locationId },
      orderBy: { dayOfWeek: 'asc' },
    });
    return { success: true, data: JSON.parse(JSON.stringify(hours)) };
  } catch (error: any) {
    console.error('Şube çalışma saatleri getirme hatası:', error);
    return { success: false, error: 'Çalışma saatleri getirilemedi.' };
  }
}

export async function updateLocationWorkingHours(
  locationId: string,
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
    for (const h of hours) {
      if (h.id) {
        await prisma.workingHours.update({
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
        await prisma.workingHours.create({
          data: {
            locationId,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
            breakStart: h.breakStart || null,
            breakEnd: h.breakEnd || null,
          },
        });
      }
    }
    revalidatePath('/admin/availability');
    await logAction('Şube Çalışma Saatleri Güncellendi', `Şube ID: ${locationId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Şube çalışma saatleri güncelleme hatası:', error);
    return { success: false, error: 'Çalışma saatleri güncellenirken hata oluştu.' };
  }
}

// ═══════════════════════════════════════════════════════════════════
// ŞUBE TATİL GÜNLERİ
// ═══════════════════════════════════════════════════════════════════

export async function getLocationHolidays(locationId: string) {
  try {
    const holidays = await prisma.holiday.findMany({
      where: { locationId },
      orderBy: { date: 'asc' },
    });
    return { success: true, data: JSON.parse(JSON.stringify(holidays)) };
  } catch (_) {
    return { success: false, error: 'Tatil günleri getirilemedi.' };
  }
}

export async function addLocationHoliday(locationId: string, dateStr: string, description: string) {
  try {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const existing = await prisma.holiday.findFirst({
      where: { locationId, date: dateObj },
    });
    if (existing) return { success: false, error: 'Bu tarihte zaten bir tatil kaydı var.' };

    const holiday = await prisma.holiday.create({
      data: { locationId, date: dateObj, description },
    });
    revalidatePath('/admin/availability');
    await logAction('Şube Tatil Günü Eklendi', `Şube ID: ${locationId}, Tarih: ${dateStr}`);
    return { success: true, data: JSON.parse(JSON.stringify(holiday)) };
  } catch (_) {
    return { success: false, error: 'Tatil günü eklenirken hata oluştu.' };
  }
}

export async function deleteLocationHoliday(holidayId: string) {
  try {
    await prisma.holiday.delete({ where: { id: holidayId } });
    revalidatePath('/admin/availability');
    await logAction('Şube Tatil Günü Silindi', `Tatil ID: ${holidayId}`);
    return { success: true };
  } catch (_) {
    return { success: false, error: 'Tatil günü silinirken hata oluştu.' };
  }
}

// ═══════════════════════════════════════════════════════════════════
// SLOT YÖNETİMİ
// ═══════════════════════════════════════════════════════════════════

export async function getSlots(locationId: string, dateStr: string) {
  try {
    if (!locationId || !dateStr) {
      return { success: false, error: 'Şube ve tarih bilgisi zorunludur.' };
    }
    const dateObj = new Date(dateStr + 'T00:00:00');
    const slots = await prisma.appointmentSlot.findMany({
      where: { locationId, date: dateObj, isActive: true },
      include: { staff: true },
    });
    return { success: true, slots: JSON.parse(JSON.stringify(slots)) };
  } catch (_) {
    return { success: false, error: 'Slotlar getirilemedi.' };
  }
}

export async function blockSlot(
  locationId: string,
  staffId: string | null,
  dateStr: string,
  time: string,
  isBlocked: boolean,
  reason?: string
) {
  try {
    if (!locationId || !dateStr || !time) {
      return { success: false, error: 'Şube, tarih ve saat bilgileri zorunludur.' };
    }
    const dateObj = new Date(dateStr + 'T00:00:00');

    const existingSlot = await prisma.appointmentSlot.findFirst({
      where: { locationId, staffId: staffId || null, date: dateObj, time },
    });

    let slot;
    if (existingSlot) {
      slot = await prisma.appointmentSlot.update({
        where: { id: existingSlot.id },
        data: { isBlocked, blockReason: reason || null },
      });
    } else {
      slot = await prisma.appointmentSlot.create({
        data: {
          locationId, staffId: staffId || null, date: dateObj, time,
          isBlocked, blockReason: reason || null, capacity: 1,
        },
      });
    }
    revalidatePath('/admin/availability');
    return { success: true, slot: JSON.parse(JSON.stringify(slot)) };
  } catch (_) {
    return { success: false, error: 'Slot güncellenirken hata oluştu.' };
  }
}

export async function updateSlotCapacity(
  locationId: string,
  staffId: string | null,
  dateStr: string,
  time: string,
  capacity: number
) {
  try {
    if (!locationId || !dateStr || !time || capacity < 1) {
      return { success: false, error: 'Geçersiz parametreler.' };
    }
    const dateObj = new Date(dateStr + 'T00:00:00');

    const existingSlot = await prisma.appointmentSlot.findFirst({
      where: { locationId, staffId: staffId || null, date: dateObj, time },
    });

    let slot;
    if (existingSlot) {
      slot = await prisma.appointmentSlot.update({
        where: { id: existingSlot.id },
        data: { capacity },
      });
    } else {
      slot = await prisma.appointmentSlot.create({
        data: {
          locationId, staffId: staffId || null, date: dateObj, time,
          capacity, isBlocked: false,
        },
      });
    }
    revalidatePath('/admin/availability');
    return { success: true, slot: JSON.parse(JSON.stringify(slot)) };
  } catch (_) {
    return { success: false, error: 'Slot kapasitesi güncellenirken hata oluştu.' };
  }
}

// ═══════════════════════════════════════════════════════════════════
// TIMEBLOCK YÖNETİMİ
// ═══════════════════════════════════════════════════════════════════

export async function getTimeBlocks(locationId: string, dateStr: string, staffId?: string) {
  try {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const blocks = await prisma.timeBlock.findMany({
      where: {
        locationId,
        date: dateObj,
        ...(staffId ? { staffId } : {}),
      },
      include: { staff: true },
      orderBy: { startTime: 'asc' },
    });
    return { success: true, data: JSON.parse(JSON.stringify(blocks)) };
  } catch (_) {
    return { success: false, error: 'Blokeler getirilemedi.' };
  }
}

export async function addTimeBlock(
  locationId: string,
  staffId: string | null,
  dateStr: string,
  startTime: string,
  endTime: string,
  reason: string
) {
  try {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const block = await prisma.timeBlock.create({
      data: {
        locationId, staffId: staffId || null, date: dateObj,
        startTime, endTime, reason,
      },
    });
    revalidatePath('/admin/availability');
    await logAction('TimeBlock Eklendi', `Şube: ${locationId}, Tarih: ${dateStr}, ${startTime}-${endTime}`);
    return { success: true, data: JSON.parse(JSON.stringify(block)) };
  } catch (_) {
    return { success: false, error: 'Bloke oluşturulurken hata oluştu.' };
  }
}

export async function deleteTimeBlock(blockId: string) {
  try {
    await prisma.timeBlock.delete({ where: { id: blockId } });
    revalidatePath('/admin/availability');
    await logAction('TimeBlock Silindi', `Bloke ID: ${blockId}`);
    return { success: true };
  } catch (_) {
    return { success: false, error: 'Bloke silinirken hata oluştu.' };
  }
}

// ═══════════════════════════════════════════════════════════════════
// TOPLU SLOT OLUŞTURMA
// ═══════════════════════════════════════════════════════════════════

export async function createBulkSlots(
  locationId: string,
  staffId: string | null,
  dateStr: string,
  slots: { time: string; capacity: number; isBlocked?: boolean }[]
) {
  try {
    const dateObj = new Date(dateStr + 'T00:00:00');
    let created = 0;
    let updated = 0;

    for (const slot of slots) {
      const existing = await prisma.appointmentSlot.findFirst({
        where: { locationId, staffId: staffId || null, date: dateObj, time: slot.time },
      });

      if (existing) {
        await prisma.appointmentSlot.update({
          where: { id: existing.id },
          data: { capacity: slot.capacity, isBlocked: slot.isBlocked || false },
        });
        updated++;
      } else {
        await prisma.appointmentSlot.create({
          data: {
            locationId, staffId: staffId || null, date: dateObj,
            time: slot.time, capacity: slot.capacity, isBlocked: slot.isBlocked || false,
          },
        });
        created++;
      }
    }

    revalidatePath('/admin/availability');
    await logAction('Toplu Slot Oluşturma', `Şube: ${locationId}, Tarih: ${dateStr}, Oluşturulan: ${created}, Güncellenen: ${updated}`);
    return { success: true, created, updated };
  } catch (_) {
    return { success: false, error: 'Toplu slot oluşturulurken hata oluştu.' };
  }
}

// ═══════════════════════════════════════════════════════════════════
// HAFTALIK ŞABLON
// ═══════════════════════════════════════════════════════════════════

export async function applyWeeklyTemplate(
  locationId: string,
  staffId: string | null,
  startDateStr: string,
  weekCount: number,
  template: { dayOfWeek: number; slots: { time: string; capacity: number; isBlocked?: boolean }[] }[]
) {
  try {
    const startDate = new Date(startDateStr + 'T00:00:00');
    let totalCreated = 0;
    let totalUpdated = 0;

    for (let week = 0; week < weekCount; week++) {
      for (const dayTemplate of template) {
        // Tarih hesapla
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (week * 7) + dayTemplate.dayOfWeek - startDate.getDay());
        
        if (date < startDate) continue; // Geçmiş tarih atlama
        
        const dateStr = date.toISOString().split('T')[0];
        const result = await createBulkSlots(locationId, staffId, dateStr, dayTemplate.slots);
        
        if (result.success) {
          totalCreated += result.created || 0;
          totalUpdated += result.updated || 0;
        }
      }
    }

    await logAction('Haftalık Şablon Uygulandı', `Şube: ${locationId}, ${weekCount} hafta, Oluşturulan: ${totalCreated}, Güncellenen: ${totalUpdated}`);
    return { success: true, created: totalCreated, updated: totalUpdated };
  } catch (_) {
    return { success: false, error: 'Haftalık şablon uygulanırken hata oluştu.' };
  }
}

// ═══════════════════════════════════════════════════════════════════
// ADMİN DASHBOARD VERİSİ
// ═══════════════════════════════════════════════════════════════════

export async function getAvailabilityDashboard(locationId: string, dateStr: string, staffId?: string) {
  try {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    // Paralel sorgular
    const [
      locationHours,
      holidays,
      appointmentSlots,
      timeBlocks,
      appointments,
      staffList,
    ] = await Promise.all([
      prisma.workingHours.findMany({ where: { locationId }, orderBy: { dayOfWeek: 'asc' } }),
      prisma.holiday.findMany({ where: { locationId }, orderBy: { date: 'asc' } }),
      prisma.appointmentSlot.findMany({
        where: { locationId, date: dateObj, isActive: true },
        include: { staff: true },
      }),
      prisma.timeBlock.findMany({
        where: { locationId, date: dateObj, ...(staffId ? { staffId } : {}) },
        include: { staff: true },
      }),
      prisma.appointment.findMany({
        where: {
          locationId, date: dateObj,
          status: { in: [ApptStatus.PENDING, ApptStatus.CONFIRMED, ApptStatus.RESCHEDULED] },
          ...(staffId ? { staffId } : {}),
        },
        include: { staff: true, service: { include: { translations: { where: { language: 'TR' } } } } },
      }),
      prisma.staff.findMany({
        where: { locationId, isActive: true, isDeleted: false },
        include: {
          workingHours: { where: { dayOfWeek } },
          leaves: { where: { date: dateObj } },
          services: { include: { service: { include: { translations: { where: { language: 'TR' } } } } } },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      success: true,
      data: {
        locationHours: JSON.parse(JSON.stringify(locationHours)),
        holidays: JSON.parse(JSON.stringify(holidays)),
        appointmentSlots: JSON.parse(JSON.stringify(appointmentSlots)),
        timeBlocks: JSON.parse(JSON.stringify(timeBlocks)),
        appointments: JSON.parse(JSON.stringify(appointments)),
        staffList: JSON.parse(JSON.stringify(staffList)),
        dayOfWeek,
      },
    };
  } catch (error: any) {
    console.error('Dashboard verisi alınırken hata:', error);
    return { success: false, error: 'Dashboard verisi alınamadı.' };
  }
}
