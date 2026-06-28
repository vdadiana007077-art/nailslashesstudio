import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTemplateEmail } from '@/lib/email';
import { ApptStatus } from '@prisma/client';

// Bu API route'u, bir cron job ile (ör. Vercel Cron, cron-job.org) her 30 dakikada çağrılır.
// Onaylanmış randevuların 4 saat öncesinde hatırlatma maili gönderir.

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

export async function GET(request: Request) {
  // Basit güvenlik: secret key kontrolü
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    // Bugün veya yarın olan onaylanmış randevuları bul
    const appointments = await prisma.appointment.findMany({
      where: {
        status: ApptStatus.CONFIRMED,
        date: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), // Bugünden itibaren
          lte: new Date(fourHoursLater.getFullYear(), fourHoursLater.getMonth(), fourHoursLater.getDate() + 1), // Yarına kadar
        },
        reminderSent: false, // Henüz hatırlatma gönderilmemiş
      },
      include: {
        service: {
          include: { translations: true },
        },
        staff: true,
        customer: true,
      },
    });

    let customerSentCount = 0;
    let staffSentCount = 0;

    for (const appt of appointments) {
      // Randevu zamanını hesapla
      const [h, m] = appt.startTime.split(':').map(Number);
      const appointmentTime = new Date(appt.date);
      appointmentTime.setHours(h, m, 0, 0);

      const hoursUntil = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // 4 saat veya daha az kaldıysa ve henüz geçmemişse
      if (hoursUntil > 0 && hoursUntil <= 4) {
        const customerEmail = appt.customerEmail || appt.customer?.email;
        const customerName = appt.customerName || appt.customer?.name || 'Müşteri';
        const customerPhone = appt.customerPhone || appt.customer?.phone;
        const customerLang = detectCustomerLanguage(customerPhone);
        
        const serviceTranslation = appt.service?.translations?.find(t => t.language === 'TR')
          || appt.service?.translations?.[0]
          || { name: 'Randevu' };
        const serviceName = serviceTranslation.name;

        // Tarih biçimlendirme
        const localeMap: Record<string, string> = {
          TR: 'tr-TR',
          EN: 'en-US',
          RU: 'ru-RU',
          DE: 'de-DE'
        };
        const formatLocale = localeMap[customerLang] || 'tr-TR';
        const formattedDate = appt.date.toLocaleDateString(formatLocale, {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
        const formattedDateTR = appt.date.toLocaleDateString('tr-TR', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });

        const emailVars = {
          customerName,
          serviceName,
          date: formattedDate,
          time: appt.startTime,
          customerEmail: customerEmail || '',
        };

        // 1. Müşteriye hatırlatma e-postası
        if (customerEmail) {
          try {
            await sendTemplateEmail('booking_reminder', customerEmail, emailVars, customerLang);
            customerSentCount++;
          } catch (emailErr) {
            console.error(`Müşteri hatırlatma e-posta hatası (${appt.id}):`, emailErr);
          }
        }

        // 2. Personele hatırlatma e-postası
        if (appt.staff?.email) {
          try {
            await sendTemplateEmail('staff_reminder', appt.staff.email, {
              staffName: appt.staff.name,
              customerName,
              serviceName,
              date: formattedDateTR,
              time: appt.startTime,
            }, 'TR');
            staffSentCount++;
          } catch (emailErr) {
            console.error(`Personel hatırlatma e-posta hatası (${appt.id}, Staff: ${appt.staff.name}):`, emailErr);
          }
        }

        // Hatırlatma gönderildi olarak işaretle
        try {
          await prisma.appointment.update({
            where: { id: appt.id },
            data: { reminderSent: true },
          });
        } catch (updateErr) {
          console.error(`Hatırlatma flag güncelleme hatası (${appt.id}):`, updateErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${customerSentCount} müşteri + ${staffSentCount} personel hatırlatma e-postası gönderildi.`,
      checkedCount: appointments.length,
      customerSentCount,
      staffSentCount,
    });
  } catch (error: any) {
    console.error('Hatırlatma cron hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
