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
  date: Date;
  startTime: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}) {
  try {
    if (!data.locationId || !data.serviceId || !data.staffId || !data.date || !data.startTime) {
      return { success: false, error: 'Eksik randevu bilgileri!' };
    }

    // 1. İlgili hizmetin detaylarını al (fiyat ve süre için)
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
      include: { translations: { where: { language: 'TR' } } }
    });

    if (!service || service.isDeleted || !service.isActive) {
      return { success: false, error: 'Hizmet bulunamadı veya pasif.' };
    }

    // 2. Sunucu Tarafı Müsaitlik Kontrolü (Çifte Rezervasyon Engeli)
    // Tarihi stringe çevir (YYYY-MM-DD)
    const dateObj = new Date(data.date);
    const dateStr = dateObj.toISOString().split('T')[0];

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
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

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
          data.startTime
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
    const updatedAppt = await prisma.appointment.update({
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

