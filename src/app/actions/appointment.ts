"use server";

import { prisma } from '@/lib/prisma';
import { ApptStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { logAction } from './audit';
import { sendTemplateEmail } from '@/lib/email';

function detectCustomerLanguage(phone?: string | null): string {
  if (!phone) return 'TR';
  // Sadece rakamları temizle (böylece + işareti ve boşluklar gider)
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('90') || cleanPhone.startsWith('05') || cleanPhone.startsWith('5')) {
    return 'TR';
  }
  if (cleanPhone.startsWith('7') || cleanPhone.startsWith('380')) {
    return 'RU';
  }
  if (cleanPhone.startsWith('49')) {
    return 'DE';
  }
  return 'EN';
}

// Randevu durumunu güncelle
export async function updateAppointmentStatus(
  appointmentId: string, 
  newStatus: ApptStatus, 
  notes?: string
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: {
          include: { translations: true },
        },
        customer: true,
      },
    });

    if (!appointment) {
      return { success: false, error: 'Randevu bulunamadı!' };
    }

    // Durumu güncelle
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: newStatus },
    });

    // Durum geçmişine kaydet
    await prisma.appointmentStatusHistory.create({
      data: {
        appointmentId,
        status: newStatus,
        notes: notes || `Admin tarafından ${newStatus} olarak güncellendi.`,
      },
    });

    // İptal edilmişse slot bookedCount azalt
    if (newStatus === ApptStatus.CANCELLED && appointment.locationId) {
      const slot = await prisma.appointmentSlot.findFirst({
        where: {
          locationId: appointment.locationId,
          staffId: appointment.staffId || null,
          date: appointment.date,
          time: appointment.startTime,
        },
      });

      if (slot && slot.bookedCount > 0) {
        await prisma.appointmentSlot.update({
          where: { id: slot.id },
          data: { bookedCount: { decrement: 1 } },
        });
      }
    }

    // E-posta gönderimi (müşteri e-postası varsa)
    const customerEmail = appointment.customerEmail || appointment.customer?.email;
    const customerName = appointment.customerName || appointment.customer?.name || 'Müşteri';
    const customerPhone = appointment.customerPhone || appointment.customer?.phone;
    const customerLang = detectCustomerLanguage(customerPhone);
    
    // Hizmetin Türkçe adını al (Şablonda yerelleşeceği için TR adını veya genel adı tutabiliriz)
    const serviceTranslation = appointment.service?.translations?.find(t => t.language === 'TR')
      || appointment.service?.translations?.[0]
      || { name: 'Randevu' };
    const serviceName = serviceTranslation.name;

    // Müşteri diline göre tarih biçimlendirme
    const localeMap: Record<string, string> = {
      TR: 'tr-TR',
      EN: 'en-US',
      RU: 'ru-RU',
      DE: 'de-DE'
    };
    const formatLocale = localeMap[customerLang] || 'tr-TR';
    const formattedDate = appointment.date.toLocaleDateString(formatLocale, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    let emailWarning: string | null = null;
    if (customerEmail) {
      const emailVars = {
        customerName,
        serviceName,
        date: formattedDate,
        time: appointment.startTime,
        customerEmail,
      };

      try {
        if (newStatus === ApptStatus.CONFIRMED) {
          console.log(`Onay e-postası gönderiliyor: ${customerEmail} (Dil: ${customerLang})`);
          console.log(`SMTP Kullanıcısı: ${process.env.EMAIL_USER}`);
          
          const emailRes = await sendTemplateEmail('booking_confirmation', customerEmail, emailVars, customerLang);
          if (!emailRes.success) {
            emailWarning = 'Onay e-postası gönderilemedi. SMTP ayarlarını veya e-posta şablonunu kontrol edin.';
          } else {
            console.log('Onay e-postası başarıyla gönderildi.');
          }

          // 4 saatten az kaldıysa hatırlatma e-postasını hemen gönder
          const now = new Date();
          const [h, m] = appointment.startTime.split(':').map(Number);
          const appointmentTime = new Date(appointment.date);
          appointmentTime.setHours(h, m, 0, 0);
          const hoursUntil = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

          if (hoursUntil > 0 && hoursUntil <= 4) {
            const reminderRes = await sendTemplateEmail('booking_reminder', customerEmail, emailVars, customerLang);
            if (reminderRes.success) {
              // Hatırlatma gönderildi olarak işaretle
              await prisma.appointment.update({
                where: { id: appointmentId },
                data: { reminderSent: true }
              });
            }
          }
        } else if (newStatus === ApptStatus.CANCELLED) {
          console.log(`İptal e-postası gönderiliyor: ${customerEmail}`);
          const emailRes = await sendTemplateEmail('booking_cancellation', customerEmail, emailVars, customerLang);
          if (!emailRes.success) {
            emailWarning = 'İptal e-postası gönderilemedi.';
          }
        }
      } catch (emailErr: any) {
        console.error('Durum değişikliği e-posta hatası:', emailErr);
        emailWarning = `E-posta gönderimi sırasında hata oluştu: ${emailErr.message || emailErr}`;
      }
    }

    await logAction('Randevu Durumu Güncellendi', `Randevu ID: ${appointmentId}, Yeni Durum: ${newStatus}`);

    revalidatePath('/[locale]/admin', 'page');
    return { success: true, warning: emailWarning };
  } catch (error: any) {
    console.error('Randevu durum güncelleme hatası:', error);
    return { success: false, error: 'Durum güncellenirken bir hata oluştu.' };
  }
}

// Randevu admin notunu güncelle
export async function updateAppointmentNotes(appointmentId: string, notes: string) {
  try {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { notes },
    });

    revalidatePath('/[locale]/admin', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Randevu not güncelleme hatası:', error);
    return { success: false, error: 'Not güncellenirken bir hata oluştu.' };
  }
}

// Randevu yeniden planlama
export async function rescheduleAppointment(
  appointmentId: string, 
  newDateStr: string, 
  newStartTime: string
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    });

    if (!appointment) {
      return { success: false, error: 'Randevu bulunamadı!' };
    }

    // Yeni bitiş saatini hesapla
    const [hours, minutes] = newStartTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + appointment.durationAtBooking;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    const newEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    const newDateObj = new Date(newDateStr + 'T00:00:00');

    // Randevuyu güncelle
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        date: newDateObj,
        startTime: newStartTime,
        endTime: newEndTime,
        status: ApptStatus.RESCHEDULED,
      },
    });

    // Durum geçmişine kaydet
    await prisma.appointmentStatusHistory.create({
      data: {
        appointmentId,
        status: ApptStatus.RESCHEDULED,
        notes: `Yeni tarih: ${newDateStr}, Yeni saat: ${newStartTime}`,
      },
    });

    await logAction('Randevu Yeniden Planlandı', `Randevu ID: ${appointmentId}, Yeni: ${newDateStr} ${newStartTime}`);

    revalidatePath('/[locale]/admin', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Randevu yeniden planlama hatası:', error);
    return { success: false, error: 'Randevu yeniden planlanırken bir hata oluştu.' };
  }
}

// Randevu detaylarını getir (durum geçmişi dahil)
export async function getAppointmentDetail(appointmentId: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: {
          include: { translations: { where: { language: 'TR' } } },
        },
        staff: true,
        location: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        customer: true,
      },
    });

    if (!appointment) {
      return { success: false, error: 'Randevu bulunamadı!' };
    }

    return { success: true, data: appointment };
  } catch (error: any) {
    console.error('Randevu detay hatası:', error);
    return { success: false, error: 'Randevu detayları alınamadı.' };
  }
}

// Randevuyu kalıcı olarak sil
export async function deleteAppointment(appointmentId: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        statusHistory: true,
        transaction: true,
        payment: true,
        staffCommission: true
      }
    });

    if (!appointment) {
      return { success: false, error: 'Randevu bulunamadı!' };
    }

    // Bağımlı kayıtları temizle (Foreign Key hatalarını önlemek için)
    // 1. Durum geçmişini sil
    await prisma.appointmentStatusHistory.deleteMany({
      where: { appointmentId }
    });

    // 2. Varsa komisyon kaydını sil
    if (appointment.staffCommission) {
      await prisma.staffCommission.delete({
        where: { appointmentId }
      });
    }

    // 3. Varsa ödeme kaydını sil
    if (appointment.payment) {
      await prisma.payment.delete({
        where: { appointmentId }
      });
    }

    // 4. Varsa işlem (transaction) kaydını sil
    if (appointment.transaction) {
      await prisma.transaction.delete({
        where: { appointmentId }
      });
    }

    // 5. Varsa personel kasa hareketi (StaffTransaction) kaydını sil
    await prisma.staffTransaction.deleteMany({
      where: { appointmentId }
    });

    // Randevuyu sil
    await prisma.appointment.delete({
      where: { id: appointmentId }
    });

    // Slot bookedCount azalt (Eğer aktif veya onaylanmış bir randevu ise)
    if (appointment.status !== ApptStatus.CANCELLED && appointment.locationId) {
      const slot = await prisma.appointmentSlot.findFirst({
        where: {
          locationId: appointment.locationId,
          staffId: appointment.staffId || null,
          date: appointment.date,
          time: appointment.startTime,
        },
      });

      if (slot && slot.bookedCount > 0) {
        await prisma.appointmentSlot.update({
          where: { id: slot.id },
          data: { bookedCount: { decrement: 1 } },
        });
      }
    }

    await logAction('Randevu Kalıcı Olarak Silindi', `Randevu ID: ${appointmentId}, Müşteri: ${appointment.customerName}`);

    revalidatePath('/[locale]/admin', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Randevu silme hatası:', error);
    return { success: false, error: 'Randevu silinirken bir hata oluştu.' };
  }
}
