"use server";

import { prisma } from '@/lib/prisma';
import { ApptSource, StaffPreference } from '@prisma/client';

export async function createBooking(data: {
  serviceId: string;
  date: Date;
  startTime: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}) {
  try {
    // 1. İlgili hizmetin detaylarını al (fiyat ve süre için)
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId }
    });

    if (!service) {
      return { success: false, error: 'Hizmet bulunamadı.' };
    }

    // 2. Bitiş saatini hesapla (Basit mantıkla süre ekleme)
    const [hours, minutes] = data.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + service.duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    // 3. Veritabanına Randevuyu Ekle
    const appointment = await prisma.appointment.create({
      data: {
        serviceId: service.id,
        date: data.date,
        startTime: data.startTime,
        endTime: endTime,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        notes: data.notes || null,
        priceAtBooking: service.price,
        durationAtBooking: service.duration,
        staffPreference: StaffPreference.ANY,
        source: ApptSource.WEBSITE,
      }
    });

    return { success: true, appointmentId: appointment.id };
  } catch (error) {
    console.error("Randevu oluşturma hatası:", error);
    return { success: false, error: 'Randevu oluşturulurken bir hata oluştu.' };
  }
}
