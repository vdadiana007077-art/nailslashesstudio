"use server";

import { prisma } from '@/lib/prisma';
import { ApptSource, StaffPreference } from '@prisma/client';
import { sendBookingEmail } from '@/lib/email';
import { getAvailableTimeSlots } from './availability';
import { getCurrentCustomer } from './customerAuth';
import { logAction } from './audit';

export async function createBooking(data: {
  serviceId: string;
  locationId: string;
  staffId: string;
  dateStr: string;
  startTime: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  locale?: string;
}) {
  try {
    if (!data.locationId || !data.serviceId || !data.staffId || !data.dateStr || !data.startTime) {
      return { success: false, error: 'Eksik randevu bilgileri!' };
    }

    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Ad Soyad alanı zorunludur!' };
    }

    if (!data.email || !data.email.trim()) {
      return { success: false, error: 'E-posta alanı zorunludur!' };
    }

    const upperLocale = (data.locale || 'tr').toUpperCase();
    const resolvedLanguage = ['TR', 'EN', 'RU', 'DE'].includes(upperLocale) ? upperLocale : 'TR';
    const dateStr = data.dateStr;
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    // ═══════════════ 10 MADDELİK SERVER-SIDE KONTROL ZİNCİRİ ═══════════════

    // 1. Şube aktif mi?
    const location = await prisma.location.findUnique({ where: { id: data.locationId } });
    if (!location || !location.isActive || location.isDeleted) {
      return { success: false, error: 'Seçilen şube aktif değil.' };
    }

    // 2. Hizmet aktif mi?
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
      include: { translations: { where: { language: resolvedLanguage as any } } }
    });
    if (!service || service.isDeleted || !service.isActive) {
      return { success: false, error: 'Hizmet bulunamadı veya pasif.' };
    }

    // 3. Hizmet bu şubede aktif mi? (LocationService kontrolü)
    const locationService = await prisma.locationService.findUnique({
      where: { locationId_serviceId: { locationId: data.locationId, serviceId: data.serviceId } }
    });
    if (!locationService) {
      return { success: false, error: 'Bu hizmet seçilen şubede verilmemektedir.' };
    }

    // 4. Personel bu şubede çalışıyor mu? (Belirli personel seçildiyse)
    if (data.staffId !== 'ANY') {
      const staff = await prisma.staff.findUnique({ where: { id: data.staffId } });
      if (!staff || !staff.isActive || staff.isDeleted) {
        return { success: false, error: 'Seçilen personel aktif değil.' };
      }
      if (staff.locationId !== data.locationId) {
        return { success: false, error: 'Seçilen personel bu şubede çalışmıyor.' };
      }

      // 5. Personel bu hizmeti verebiliyor mu? (StaffService kontrolü)
      const staffService = await prisma.staffService.findUnique({
        where: { staffId_serviceId: { staffId: data.staffId, serviceId: data.serviceId } }
      });
      // Fallback: StaffService ataması yoksa tüm hizmetleri verebilir
      const anyStaffService = await prisma.staffService.count({ where: { staffId: data.staffId } });
      if (anyStaffService > 0 && !staffService) {
        return { success: false, error: 'Seçilen personel bu hizmeti veremiyor.' };
      }

      // 6. Personel izinde mi?
      const staffLeave = await prisma.staffLeave.findFirst({
        where: { staffId: data.staffId, date: dateObj, isFullDay: true }
      });
      if (staffLeave) {
        return { success: false, error: 'Seçilen personel bu tarihte izinlidir.' };
      }
    }

    // 7. Şube tatili var mı?
    const holiday = await prisma.holiday.findFirst({
      where: { locationId: data.locationId, date: dateObj }
    });
    if (holiday) {
      return { success: false, error: `Şube bu tarihte kapalıdır: ${holiday.description || 'Tatil günü'}` };
    }

    // 8. Şube çalışma saati kontrolü
    const shopHours = await prisma.workingHours.findFirst({
      where: { locationId: data.locationId, dayOfWeek }
    });
    if (shopHours && shopHours.isClosed) {
      return { success: false, error: 'Şube bu gün kapalıdır.' };
    }

    // 9. Hizmet süresi slot aralığına uyuyor mu?
    const [startH, startM] = data.startTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = startMinutes + service.duration;
    const shopCloseMin = shopHours ? parseInt(shopHours.closeTime.split(':')[0]) * 60 + parseInt(shopHours.closeTime.split(':')[1]) : 19 * 60;
    if (endMinutes > shopCloseMin) {
      return { success: false, error: 'Hizmet süresi şube kapanış saatini aşıyor.' };
    }

    // 10. TimeBlock kontrolü (belirli personel veya şube geneli)
    const timeBlockCheck = await prisma.timeBlock.findFirst({
      where: {
        locationId: data.locationId,
        date: dateObj,
        OR: [
          { staffId: data.staffId !== 'ANY' ? data.staffId : undefined },
          { staffId: null },
        ],
      }
    });
    if (timeBlockCheck) {
      const tbStart = parseInt(timeBlockCheck.startTime.split(':')[0]) * 60 + parseInt(timeBlockCheck.startTime.split(':')[1]);
      const tbEnd = parseInt(timeBlockCheck.endTime.split(':')[0]) * 60 + parseInt(timeBlockCheck.endTime.split(':')[1]);
      if (startMinutes < tbEnd && endMinutes > tbStart) {
        return { success: false, error: `Bu saat aralığı blokeli: ${timeBlockCheck.reason}` };
      }
    }

    // ═══════════════ MÜSAITLIK KONTROLÜ ═══════════════

    const availability = await getAvailableTimeSlots(
      data.locationId,
      data.serviceId,
      dateStr,
      data.staffId
    );

    if (!availability.success || !availability.slots?.includes(data.startTime)) {
      return {
        success: false,
        error: 'Seçtiğiniz tarih veya saat artık müsait değil. Lütfen başka bir saat seçin.',
      };
    }

    // 3. Çalışan Belirleme (Eğer ANY/Fark etmez seçildiyse müsait olan ilk personeli atayalım)
    let assignedStaffId: string | null = data.staffId === 'ANY' ? null : data.staffId;

    if (data.staffId === 'ANY') {
      // Bu hizmeti verebilen o şubedeki aktif personelleri bul
      const staffList = await prisma.staff.findMany({
        where: {
          locationId: data.locationId,
          isActive: true,
          isDeleted: false,
          services: {
            some: {
              serviceId: data.serviceId,
            },
          },
        },
      });

      // Müsait olan ilkini tespit et
      for (const staff of staffList) {
        const staffAvail = await getAvailableTimeSlots(
          data.locationId,
          data.serviceId,
          dateStr,
          staff.id
        );
        if (staffAvail.success && staffAvail.slots?.includes(data.startTime)) {
          assignedStaffId = staff.id;
          break;
        }
      }

      if (!assignedStaffId) {
        return {
          success: false,
          error: 'Seçtiğiniz saatte uygun personel bulunamadı. Lütfen başka bir saat seçin.',
        };
      }
    }

    // 4. Bitiş saatini hesapla (süre ekleme)
    const [hours, minutes] = data.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + service.duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    // Aktif müşteri oturumunu al
    const customer = await getCurrentCustomer();

    // 5. Veritabanına Randevuyu Ekle
    const appointment = await prisma.appointment.create({
      data: {
        serviceId: service.id,
        locationId: data.locationId,
        staffId: assignedStaffId,
        customerId: customer ? customer.id : null,
        date: dateObj,
        startTime: data.startTime,
        endTime: endTime,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        notes: data.notes || null,
        priceAtBooking: service.price,
        durationAtBooking: service.duration,
        staffPreference: data.staffId === 'ANY' ? StaffPreference.ANY : StaffPreference.SELECTED,
        source: ApptSource.WEBSITE,
      }
    });

    // 5.1. AppointmentSlot tablosunda bookedCount alanını artır
    const existingSlot = await prisma.appointmentSlot.findFirst({
      where: {
        locationId: data.locationId,
        staffId: assignedStaffId || null,
        date: dateObj,
        time: data.startTime
      }
    });

    if (existingSlot) {
      await prisma.appointmentSlot.update({
        where: { id: existingSlot.id },
        data: {
          bookedCount: { increment: 1 }
        }
      });
    } else {
      await prisma.appointmentSlot.create({
        data: {
          locationId: data.locationId,
          staffId: assignedStaffId || null,
          date: dateObj,
          time: data.startTime,
          capacity: 1,
          bookedCount: 1
        }
      });
    }

    // 6. E-posta bildirimini gönder
    if (data.email) {
      try {
        await sendBookingEmail(
          data.email,
          data.name,
          service.translations[0]?.name || 'Randevu',
          dateObj,
          data.startTime,
          resolvedLanguage
        );
      } catch (err) {
        console.error("E-posta gönderim hatası (randevu başarıyla kaydedildi):", err);
      }
    }

    return { success: true, appointmentId: appointment.id };
  } catch (error) {
    console.error("Randevu oluşturma hatası:", error);
    return { success: false, error: 'Randevu oluşturulurken bir hata oluştu.' };
  }
}

export async function cancelAppointment(appointmentId: string) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return { success: false, error: 'Lütfen önce giriş yapın!' };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true }
    });

    if (!appointment) {
      return { success: false, error: 'Randevu bulunamadı!' };
    }

    if (appointment.customerId !== customer.id) {
      return { success: false, error: 'Bu randevuyu iptal etme yetkiniz yok!' };
    }

    if (appointment.status === 'CANCELLED') {
      return { success: false, error: 'Bu randevu zaten iptal edilmiş.' };
    }

    // İptal limit saati kontrolü
    const cancelLimitSetting = await prisma.setting.findUnique({
      where: { key_language: { key: 'cancellation_limit_hours', language: 'TR' } }
    });

    const limitHours = cancelLimitSetting ? parseInt(cancelLimitSetting.value) : 24;

    const appointmentTimeStr = appointment.date.toISOString().split('T')[0] + 'T' + appointment.startTime + ':00';
    const appointmentDate = new Date(appointmentTimeStr);
    const now = new Date();

    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < limitHours) {
      return { 
        success: false, 
        error: `Randevunuza ${limitHours} saatten az zaman kaldığı için online iptal işlemi gerçekleştiremezsiniz. Lütfen şube ile iletişime geçin.` 
      };
    }

    // Randevuyu iptal et
    const _updatedAppt = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' }
    });

    // Durum geçmişine ekle
    await prisma.appointmentStatusHistory.create({
      data: {
        appointmentId,
        status: 'CANCELLED',
        notes: 'Müşteri tarafından online iptal edildi.'
      }
    });

    // AppointmentSlot tablosunda bookedCount alanını azalt
    if (appointment.locationId) {
      const slot = await prisma.appointmentSlot.findFirst({
        where: {
          locationId: appointment.locationId,
          staffId: appointment.staffId || null,
          date: appointment.date,
          time: appointment.startTime
        }
      });

      if (slot && slot.bookedCount > 0) {
        await prisma.appointmentSlot.update({
          where: { id: slot.id },
          data: {
            bookedCount: { decrement: 1 }
          }
        });
      }
    }

    await logAction('Müşteri Randevu İptal Etti', `ID: ${customer.id}, Randevu ID: ${appointmentId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Randevu iptal hatası:', error);
    return { success: false, error: 'Randevu iptal edilirken bir hata oluştu.' };
  }
}

/**
 * Müşteri randevusunu yeni tarih/saate erteler.
 * Eski randevu RESCHEDULED statüsüne alınır, yeni tarih/saat atanır.
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newDateStr: string,
  newStartTime: string
) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return { success: false, error: 'Lütfen önce giriş yapın!' };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true }
    });

    if (!appointment) {
      return { success: false, error: 'Randevu bulunamadı!' };
    }

    if (appointment.customerId !== customer.id) {
      return { success: false, error: 'Bu randevuyu değiştirme yetkiniz yok!' };
    }

    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      return { success: false, error: 'İptal edilmiş veya tamamlanmış randevular değiştirilemez.' };
    }

    // Değişiklik limiti kontrolü (randevuya 24 saatten az kaldıysa engellensin)
    const cancelLimitSetting = await prisma.setting.findUnique({
      where: { key_language: { key: 'cancellation_limit_hours', language: 'TR' } }
    });
    const limitHours = cancelLimitSetting ? parseInt(cancelLimitSetting.value) : 24;

    const appointmentTimeStr = appointment.date.toISOString().split('T')[0] + 'T' + appointment.startTime + ':00';
    const appointmentDate = new Date(appointmentTimeStr);
    const now = new Date();
    const diffHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < limitHours) {
      return { 
        success: false, 
        error: `Randevunuza ${limitHours} saatten az zaman kaldığı için online değişiklik yapılamaz. Lütfen şube ile iletişime geçin.` 
      };
    }

    // Yeni tarih/saat müsait mi kontrol et
    const staffId = appointment.staffId || 'ANY';
    const newDateObj = new Date(newDateStr + 'T00:00:00');

    const availability = await getAvailableTimeSlots(
      appointment.locationId || '',
      appointment.serviceId,
      newDateStr,
      staffId
    );

    if (!availability.success || !availability.slots?.includes(newStartTime)) {
      return { success: false, error: 'Seçtiğiniz yeni tarih/saat müsait değil. Lütfen başka bir saat seçin.' };
    }

    // Bitiş saatini hesapla
    const duration = appointment.service.duration;
    const [hours, minutes] = newStartTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    const newEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    // Eski slot'un bookedCount'unu azalt
    if (appointment.locationId) {
      const oldSlot = await prisma.appointmentSlot.findFirst({
        where: {
          locationId: appointment.locationId,
          staffId: appointment.staffId || null,
          date: appointment.date,
          time: appointment.startTime
        }
      });
      if (oldSlot && oldSlot.bookedCount > 0) {
        await prisma.appointmentSlot.update({
          where: { id: oldSlot.id },
          data: { bookedCount: { decrement: 1 } }
        });
      }
    }

    // Randevuyu güncelle
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        date: newDateObj,
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'RESCHEDULED'
      }
    });

    // Durum geçmişine ekle
    await prisma.appointmentStatusHistory.create({
      data: {
        appointmentId,
        status: 'RESCHEDULED',
        notes: `Müşteri tarafından online ertelendi. Yeni tarih: ${newDateStr} ${newStartTime}`
      }
    });

    // Yeni slot'un bookedCount'unu artır
    if (appointment.locationId) {
      const existingSlot = await prisma.appointmentSlot.findFirst({
        where: {
          locationId: appointment.locationId,
          staffId: appointment.staffId || null,
          date: newDateObj,
          time: newStartTime
        }
      });

      if (existingSlot) {
        await prisma.appointmentSlot.update({
          where: { id: existingSlot.id },
          data: { bookedCount: { increment: 1 } }
        });
      } else {
        await prisma.appointmentSlot.create({
          data: {
            locationId: appointment.locationId,
            staffId: appointment.staffId || null,
            date: newDateObj,
            time: newStartTime,
            capacity: 1,
            bookedCount: 1
          }
        });
      }
    }

    await logAction('Müşteri Randevu Erteledi', `ID: ${customer.id}, Randevu: ${appointmentId}, Yeni: ${newDateStr} ${newStartTime}`);

    return { success: true };
  } catch (error: any) {
    console.error('Randevu erteleme hatası:', error);
    return { success: false, error: 'Randevu ertelenirken bir hata oluştu.' };
  }
}
