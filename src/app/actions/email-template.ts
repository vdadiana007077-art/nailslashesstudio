"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Tüm e-posta şablonlarını getir
export async function getEmailTemplates() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: templates };
  } catch (error: any) {
    console.error('E-posta şablonları alınırken hata:', error);
    return { success: false, error: 'Şablonlar alınamadı.' };
  }
}

// E-posta şablonunu güncelle
export async function updateEmailTemplate(
  id: string,
  data: { name?: string; subject?: string; body?: string; isActive?: boolean }
) {
  try {
    await prisma.emailTemplate.update({
      where: { id },
      data,
    });
    revalidatePath('/[locale]/admin/email-templates', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('E-posta şablonu güncelleme hatası:', error);
    return { success: false, error: 'Şablon güncellenemedi.' };
  }
}

// Varsayılan şablonları oluştur (eksik olanları ekler)
export async function seedEmailTemplates() {
  try {
    // Eski dilli şablon anahtarlarını temizle (kullanıcı isteği doğrultusunda tek mesaja birleştiriyoruz)
    const oldKeys = [
      'booking_received_TR', 'booking_received_EN', 'booking_received_RU', 'booking_received_DE',
      'booking_confirmation_TR', 'booking_confirmation_EN', 'booking_confirmation_RU', 'booking_confirmation_DE',
      'booking_cancellation_TR', 'booking_cancellation_EN', 'booking_cancellation_RU', 'booking_cancellation_DE',
      'booking_reminder_TR', 'booking_reminder_EN', 'booking_reminder_RU', 'booking_reminder_DE'
    ];
    await prisma.emailTemplate.deleteMany({
      where: { key: { in: oldKeys } }
    });

    const defaults = [
      {
        key: 'booking_received',
        name: 'Randevu Alındı',
        subject: JSON.stringify({
          TR: 'Randevunuz Alınmıştır - {{serviceName}} | Nails & Lashes Studio',
          EN: 'Appointment Request Received - {{serviceName}} | Nails & Lashes Studio',
          RU: 'Запрос на запись получен - {{serviceName}} | Nails & Lashes Studio',
          DE: 'Terminanfrage eingegangen - {{serviceName}} | Nails & Lashes Studio'
        }),
        body: JSON.stringify({
          TR: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #be185d 0%, #9f1239 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">✨ Randevunuz Alınmıştır</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 8px 0 0;">En kısa sürede onay bilginiz gönderilecektir.</p>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Merhaba <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Nails & Lashes Studio'ya randevu talebiniz başarıyla alınmıştır. Ekibimiz randevunuzu en kısa sürede değerlendirecek ve onay e-postanızı gönderecektir.</p>
    
    <div style="background-color: #fdf2f8; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #be185d;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Hizmet:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Tarih:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Saat:</strong> {{time}}</p>
    </div>

    <div style="background-color: #f0fdf4; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #bbf7d0;">
      <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #166534;">📞 Acil Durum İletişimi</p>
      <p style="margin: 0; font-size: 13px; color: #374151;">Randevunuzla ilgili acil bir değişiklik veya soru için WhatsApp üzerinden bize ulaşabilirsiniz:</p>
      <p style="margin: 8px 0 0; font-size: 15px; font-weight: 700; color: #166534;">📱 WhatsApp: +905061155243</p>
    </div>

    <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">Not: Randevunuz henüz onaylanmamıştır. Onay e-postası tarafınıza ayrıca gönderilecektir.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Sevgilerle,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          EN: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #be185d 0%, #9f1239 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">✨ Appointment Request Received</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 8px 0 0;">Your confirmation info will be sent shortly.</p>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Hello <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">We have successfully received your appointment request at Nails & Lashes Studio. Our team will review it shortly and send you a confirmation email.</p>
    
    <div style="background-color: #fdf2f8; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #be185d;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Service:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Date:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Time:</strong> {{time}}</p>
    </div>

    <div style="background-color: #f0fdf4; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #bbf7d0;">
      <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #166534;">📞 Urgent Contact</p>
      <p style="margin: 0; font-size: 13px; color: #374151;">For any urgent modifications or questions about your appointment, please contact us on WhatsApp:</p>
      <p style="margin: 8px 0 0; font-size: 15px; font-weight: 700; color: #166534;">📱 WhatsApp: +905061155243</p>
    </div>

    <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">Note: Your booking is not confirmed yet. A confirmation email will be sent separately.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Warm regards,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          RU: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #be185d 0%, #9f1239 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px;">✨ Запрос на запись получен</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 8px 0 0;">Информация о подтверждении будет отправлена в ближайшее время.</p>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Здравствуйте, <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Ваш запрос на запись в Nails & Lashes Studio успешно получен. Наша команда рассмотрит его в ближайшее время и отправит вам письмо с подтверждением.</p>
    
    <div style="background-color: #fdf2f8; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #be185d;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Услуга:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Дата:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Время:</strong> {{time}}</p>
    </div>

    <div style="background-color: #f0fdf4; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #bbf7d0;">
      <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #166534;">📞 Срочная связь</p>
      <p style="margin: 0; font-size: 13px; color: #374151;">По вопросам срочных изменений или при возникновении вопросов свяжитесь с нами через WhatsApp:</p>
      <p style="margin: 8px 0 0; font-size: 15px; font-weight: 700; color: #166534;">📱 WhatsApp: +905061155243</p>
    </div>

    <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">Примечание: Запись еще не подтверждена. Письмо с подтверждением будет отправлено отдельно.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">С наилучшими пожеланиями,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          DE: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #be185d 0%, #9f1239 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">✨ Terminanfrage eingegangen</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 8px 0 0;">Ihre Bestätigung wird in Kürze versendet.</p>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Hallo <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Ihre Terminanfrage bei Nails & Lashes Studio ist erfolgreich eingegangen. Unser Team wird Ihre Anfrage in Kürze prüfen und Ihnen eine Bestätigungs-E-Mail senden.</p>
    
    <div style="background-color: #fdf2f8; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #be185d;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Service:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Date:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Uhrzeit:</strong> {{time}}</p>
    </div>

    <div style="background-color: #f0fdf4; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #bbf7d0;">
      <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #166534;">📞 Wichtiger Kontakt</p>
      <p style="margin: 0; font-size: 13px; color: #374151;">Für dringende Terminänderungen oder Fragen kontaktieren Sie uns bitte per WhatsApp:</p>
      <p style="margin: 8px 0 0; font-size: 15px; font-weight: 700; color: #166534;">📱 WhatsApp: +905061155243</p>
    </div>

    <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">Hinweis: Ihr Termin ist noch nicht bestätigt. Eine Bestätigungs-E-Mail wird separat versendet.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Mit freundlichen Grüßen,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`
        })
      },
      {
        key: 'booking_confirmation',
        name: 'Randevu Onay E-postası',
        subject: JSON.stringify({
          TR: 'Randevunuz Onaylandı ✅ - {{serviceName}}',
          EN: 'Appointment Confirmed ✅ - {{serviceName}}',
          RU: 'Запись подтверждена ✅ - {{serviceName}}',
          DE: 'Termin bestätigt ✅ - {{serviceName}}'
        }),
        body: JSON.stringify({
          TR: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">✅ Randevunuz Onaylandı!</h1>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Merhaba <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Randevunuz onaylanmıştır. Belirtilen tarih ve saatte sizi bekliyoruz.</p>
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #059669;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Hizmet:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Tarih:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Saat:</strong> {{time}}</p>
    </div>
    <p style="font-size: 13px; color: #6b7280;">Gecikme veya iptal durumunda lütfen en az 24 saat öncesinden bizimle iletişime geçin.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Sevgilerle,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          EN: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">✅ Appointment Confirmed!</h1>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Hello <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Your appointment has been confirmed. We look forward to seeing you at the scheduled date and time.</p>
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #059669;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Service:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Date:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Time:</strong> {{time}}</p>
    </div>
    <p style="font-size: 13px; color: #6b7280;">In case of delay or cancellation, please contact us at least 24 hours in advance.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Warm regards,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          RU: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">✅ Запись подтверждена!</h1>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Здравствуйте, <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Ваша запись успешно подтверждена. Мы ждем вас в указанное время.</p>
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #059669;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Услуга:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Дата:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Время:</strong> {{time}}</p>
    </div>
    <p style="font-size: 13px; color: #6b7280;">В случае задержки или отмены, пожалуйста, сообщите нам не менее чем за 24 часа.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">С наилучшими пожеланиями,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          DE: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">✅ Termin bestätigt!</h1>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Hallo <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Ihr Termin wurde bestätigt. Wir freuen uns darauf, Sie zum vereinbarten Termin zu sehen.</p>
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #059669;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Service:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Date:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Uhrzeit:</strong> {{time}}</p>
    </div>
    <p style="font-size: 13px; color: #6b7280;">Bitte benachrichtigen Sie uns im Falle von Verzögerungen oder Stornierungen mindestens 24 Stunden im Voraus.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Mit freundlichen Grüßen,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`
        })
      },
      {
        key: 'booking_cancellation',
        name: 'Randevu İptal E-postası',
        subject: JSON.stringify({
          TR: 'Randevunuz İptal Edildi - {{serviceName}}',
          EN: 'Appointment Cancelled - {{serviceName}}',
          RU: 'Запись отменена - {{serviceName}}',
          DE: 'Termin storniert - {{serviceName}}'
        }),
        body: JSON.stringify({
          TR: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">❌ Randevunuz İptal Edildi</h1>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Merhaba <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px;">Aşağıdaki randevunuz iptal edilmiştir:</p>
    <div style="background-color: #fef2f2; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #dc2626;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Hizmet:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Tarih:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Saat:</strong> {{time}}</p>
    </div>
    <p style="font-size: 14px;">Yeni bir randevu oluşturmak için sitemizi ziyaret edebilirsiniz.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Sevgilerle,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          EN: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">❌ Appointment Cancelled</h1>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Hello <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px;">Your scheduled appointment below has been cancelled:</p>
    <div style="background-color: #fef2f2; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #dc2626;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Service:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Date:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Time:</strong> {{time}}</p>
    </div>
    <p style="font-size: 14px;">You can visit our website to make a new booking.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Warm regards,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          RU: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">❌ Запись отменена</h1>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Здравствуйте, <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px;">Ваша запланированная запись была отменена:</p>
    <div style="background-color: #fef2f2; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #dc2626;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Услуга:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Дата:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Время:</strong> {{time}}</p>
    </div>
    <p style="font-size: 14px;">Вы можете посетить наш сайт, чтобы создать новую запись.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">С наилучшими пожеланиями,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          DE: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">❌ Termin storniert</h1>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Hallo <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px;">Ihr unten aufgeführter Termin wurde storniert:</p>
    <div style="background-color: #fef2f2; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #dc2626;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Service:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Date:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Uhrzeit:</strong> {{time}}</p>
    </div>
    <p style="font-size: 14px;">Sie können unsere Website besuchen, um einen neuen Termin zu buchen.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Mit freundlichen Grüßen,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`
        })
      },
      {
        key: 'booking_reminder',
        name: 'Randevu Hatırlatma E-postası',
        subject: JSON.stringify({
          TR: 'Hatırlatma: Randevunuz Yaklaşıyor - {{serviceName}}',
          EN: 'Reminder: Your Appointment is Upcoming - {{serviceName}}',
          RU: 'Напоминание: Ваша запись приближается - {{serviceName}}',
          DE: 'Erinnerung: Ihr Termin steht bevor - {{serviceName}}'
        }),
        body: JSON.stringify({
          TR: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">⏰ Randevu Hatırlatması</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 8px 0 0;">Randevunuza az kaldı!</p>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Merhaba <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px;">Yaklaşan randevunuzu hatırlatmak isteriz:</p>
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Hizmet:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Tarih:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Saat:</strong> {{time}}</p>
    </div>
    <p style="font-size: 14px;">Sizi bekliyor olacağız. Herhangi bir değişiklik için lütfen bizimle iletişime geçin.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Sevgilerle,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          EN: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">⏰ Appointment Reminder</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 8px 0 0;">Just a reminder that your appointment is coming up soon!</p>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Hello <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px;">We would like to remind you of your upcoming appointment:</p>
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Service:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Date:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Time:</strong> {{time}}</p>
    </div>
    <p style="font-size: 14px;">We look forward to seeing you. Please let us know if you need to make any changes.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Warm regards,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          RU: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">⏰ Напоминание о записи</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 8px 0 0;">Напоминаем, что ваша запись скоро начнется!</p>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Здравствуйте, <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px;">Хотим напомнить вам о вашей предстоящей записи:</p>
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Услуга:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Дата:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Время:</strong> {{time}}</p>
    </div>
    <p style="font-size: 14px;">Мы ждем вас. Пожалуйста, сообщите нам, если вам нужно внести изменения.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">С наилучшими пожеланиями,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`,
          DE: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">⏰ Terminerinnerung</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 8px 0 0;">Erinnerung, dass Ihr Termin bald stattfindet!</p>
  </div>
  <div style="padding: 28px; color: #374151;">
    <p style="font-size: 15px;">Hallo <strong>{{customerName}}</strong>,</p>
    <p style="font-size: 14px;">Wir möchten Sie an Ihren bevorstehenden Termin erinnern:</p>
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>📋 Service:</strong> {{serviceName}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Date:</strong> {{date}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong>🕐 Uhrzeit:</strong> {{time}}</p>
    </div>
    <p style="font-size: 14px;">Wir freuen uns auf Sie. Bitte lassen Sie uns wissen, wenn Sie Änderungen vornehmen müssen.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">Mit freundlichen Grüßen,<br/><strong style="color: #be185d;">Nails & Lashes Studio</strong></p>
  </div>
</div>`
        })
      },
      // ==================== ADMIN SYSTEM NOTIFICATION ====================
      {
        key: 'booking_admin_notification',
        name: 'Yeni Randevu Bildirimi (Admin)',
        subject: 'Yeni Randevu: {{customerName}} - {{date}} {{time}}',
        body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
  <div style="background-color: #111827; padding: 24px; text-align: center;">
    <h2 style="color: #ffffff; margin: 0;">Yeni Randevu Geldi!</h2>
  </div>
  <div style="padding: 24px; color: #374151;">
    <p>Sistem üzerinden yeni bir randevu oluşturuldu.</p>
    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>Müşteri:</strong> {{customerName}}</p>
      <p style="margin: 4px 0;"><strong>Hizmet:</strong> {{serviceName}}</p>
      <p style="margin: 4px 0;"><strong>Tarih:</strong> {{date}}</p>
      <p style="margin: 4px 0;"><strong>Saat:</strong> {{time}}</p>
      <p style="margin: 4px 0;"><strong>E-posta:</strong> {{customerEmail}}</p>
    </div>
    <p>Detayları Admin panelinden görüntüleyebilirsiniz.</p>
  </div>
</div>`,
      },
    ];

    // Şablonları ekle veya güncelle
    for (const tmpl of defaults) {
      await prisma.emailTemplate.upsert({
        where: { key: tmpl.key },
        update: {
          name: tmpl.name,
          subject: tmpl.subject,
          body: tmpl.body,
        },
        create: tmpl,
      });
    }

    return { success: true, message: 'Şablonlar başarıyla güncellendi ve oluşturuldu.' };
  } catch (error: any) {
    console.error('Varsayılan şablon oluşturma hatası:', error);
    return { success: false, error: 'Şablonlar oluşturulamadı.' };
  }
}
