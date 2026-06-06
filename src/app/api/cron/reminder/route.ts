import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTemplateEmail } from '@/lib/email';
import { ApptStatus } from '@prisma/client';

// Bu API route'u, bir cron job ile (ör. Vercel Cron, cron-job.org) her 30 dakikada çağrılır.
// Onaylanmış randevuların 4 saat öncesinde hatırlatma maili gönderir.

function detectCustomerLanguage(phone?: string | null): string {
  if (!phone) return 'TR';
  const cleanPhone = phone.replace(/[\s()-]/g, '');
  if (cleanPhone.startsWith('+90') || cleanPhone.startsWith('90') || cleanPhone.startsWith('05') || cleanPhone.startsWith('5')) {
    return 'TR';
  }
  if (cleanPhone.startsWith('+7') || cleanPhone.startsWith('7') || cleanPhone.startsWith('+380')) {
    return 'RU';
  }
  if (cleanPhone.startsWith('+49') || cleanPhone.startsWith('49')) {
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
        customer: true,
      },
    });

    let sentCount = 0;

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

        // Müşteri diline göre tarih biçimlendirme
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

        if (customerEmail) {
          try {
            await sendTemplateEmail('booking_reminder', customerEmail, {
              customerName,
              serviceName,
              date: formattedDate,
              time: appt.startTime,
              customerEmail,
            }, customerLang);

            // Hatırlatma gönderildi olarak işaretle
            await prisma.appointment.update({
              where: { id: appt.id },
              data: { reminderSent: true },
            });

            sentCount++;
          } catch (emailErr) {
            console.error(`Hatırlatma e-posta hatası (${appt.id}):`, emailErr);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${sentCount} hatırlatma e-postası gönderildi.`,
      checkedCount: appointments.length,
    });
  } catch (error: any) {
    console.error('Hatırlatma cron hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
