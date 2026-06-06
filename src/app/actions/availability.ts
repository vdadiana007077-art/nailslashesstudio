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
      },
    });

    // Şube o gün kapalı olarak işaretlenmişse
    if (shopHours && shopHours.isClosed) {
      return { success: true, slots: [] }; // Şube o gün kapalı
    }

    // Çalışma saatleri tanımlanmamışsa varsayılan saatler (09:00 - 19:00)
    const effectiveShopHours = shopHours || {
      openTime: '09:00',
      closeTime: '19:00',
      breakStart: '13:00',
      breakEnd: '14:00',
    };

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
    // Önce StaffService ataması olan personelleri ara
    let qualifiedStaff = await prisma.staff.findMany({
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

    // StaffService ataması yapılmamışsa, şubedeki tüm aktif personelleri getir (fallback)
    if (qualifiedStaff.length === 0) {
      qualifiedStaff = await prisma.staff.findMany({
        where: {
          locationId,
          isActive: true,
          isDeleted: false,
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
    }

    if (qualifiedStaff.length === 0) {
      return { success: true, slots: [] }; // O gün o şubede müsait personel yok
    }

    // O gün için tanımlanmış kapasite / bloke slotları veritabanından çekelim (SaaS kapasite yönetimi)
    const customSlots = await prisma.appointmentSlot.findMany({
      where: {
        locationId,
        date: dateObj,
        isActive: true,
      },
    });

    // Ortak müsait slotları toplayacağımız küme (Unique list)
    const allAvailableSlots = new Set<string>();

    const shopOpenMin = timeToMinutes(effectiveShopHours.openTime);
    const shopCloseMin = timeToMinutes(effectiveShopHours.closeTime);
    const shopBreakStartMin = effectiveShopHours.breakStart ? timeToMinutes(effectiveShopHours.breakStart) : null;
    const shopBreakEndMin = effectiveShopHours.breakEnd ? timeToMinutes(effectiveShopHours.breakEnd) : null;

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
        const slotTime = minutesToTime(slotStart);

        // Herhangi bir bloke süreyle çakışma var mı?
        let isBlocked = blocks.some((b) => {
          return slotStart < b.end && slotEnd > b.start;
        });

        // 5.1. Akıllı Slot Kapasitesi / Bloke Kontrolü
        if (!isBlocked) {
          // Çalışana özel slot kuralı var mı?
          const staffSlot = customSlots.find(s => s.staffId === staff.id && s.time === slotTime);
          // Yoksa şube genelinde slot kuralı var mı?
          const generalSlot = customSlots.find(s => s.staffId === null && s.time === slotTime);

          const activeSlotRule = staffSlot || generalSlot;

          if (activeSlotRule) {
            if (activeSlotRule.isBlocked) {
              isBlocked = true; // El ile bloke edilmiş slot
            } else if (activeSlotRule.bookedCount >= activeSlotRule.capacity) {
              isBlocked = true; // Kapasitesi dolmuş slot
            }
          }
        }

        if (!isBlocked) {
          allAvailableSlots.add(slotTime);
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

/**
 * Belirli bir şube ve tarihteki tüm AppointmentSlot kayıtlarını getirir.
 */
export async function getSlots(locationId: string, dateStr: string) {
  try {
    if (!locationId || !dateStr) {
      return { success: false, error: 'Şube ve tarih bilgisi zorunludur.' };
    }
    const dateObj = new Date(dateStr + 'T00:00:00');
    const slots = await prisma.appointmentSlot.findMany({
      where: {
        locationId,
        date: dateObj,
        isActive: true
      },
      include: {
        staff: true
      }
    });
    return { success: true, slots };
  } catch (error: any) {
    console.error('Slotlar getirilirken hata oluştu:', error);
    return { success: false, error: 'Slotlar getirilemedi.' };
  }
}

/**
 * Belirli bir slotu bloke eder veya blokesini kaldırır.
 */
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
      where: {
        locationId,
        staffId: staffId || null,
        date: dateObj,
        time
      }
    });

    let slot;
    if (existingSlot) {
      slot = await prisma.appointmentSlot.update({
        where: { id: existingSlot.id },
        data: {
          isBlocked,
          blockReason: reason || null
        }
      });
    } else {
      slot = await prisma.appointmentSlot.create({
        data: {
          locationId,
          staffId: staffId || null,
          date: dateObj,
          time,
          isBlocked,
          blockReason: reason || null,
          capacity: 1
        }
      });
    }
    return { success: true, slot };
  } catch (error: any) {
    console.error('Slot bloke etme hatası:', error);
    return { success: false, error: 'Slot güncellenirken hata oluştu.' };
  }
}

/**
 * Belirli bir slotun kapasitesini günceller.
 */
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
      where: {
        locationId,
        staffId: staffId || null,
        date: dateObj,
        time
      }
    });

    let slot;
    if (existingSlot) {
      slot = await prisma.appointmentSlot.update({
        where: { id: existingSlot.id },
        data: {
          capacity
        }
      });
    } else {
      slot = await prisma.appointmentSlot.create({
        data: {
          locationId,
          staffId: staffId || null,
          date: dateObj,
          time,
          capacity,
          isBlocked: false
        }
      });
    }
    return { success: true, slot };
  } catch (error: any) {
    console.error('Slot kapasitesi güncelleme hatası:', error);
    return { success: false, error: 'Slot kapasitesi güncellenirken hata oluştu.' };
  }
}

