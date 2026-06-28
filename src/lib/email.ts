import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { seedEmailTemplates } from '@/app/actions/email-template';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Şablon değişkenlerini değiştiren yardımcı fonksiyon
function replaceVariables(
  template: string, 
  vars: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

export const sendBookingEmail = async (
  to: string, 
  customerName: string, 
  serviceName: string, 
  date: Date, 
  time: string,
  customerLanguage: string = 'TR'
) => {
  const lang = customerLanguage.toUpperCase();
  const localeMap: Record<string, string> = {
    TR: 'tr-TR',
    EN: 'en-US',
    RU: 'ru-RU',
    DE: 'de-DE'
  };
  const formatLocale = localeMap[lang] || 'tr-TR';
  
  const formattedDate = date.toLocaleDateString(formatLocale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const vars = {
    customerName,
    serviceName,
    date: formattedDate,
    time,
    customerEmail: to,
  };

  try {
    // Veritabanından birleşik şablonları çek
    let customerTemplate = await prisma.emailTemplate.findUnique({
      where: { key: 'booking_received' },
    });

    let adminTemplate = await prisma.emailTemplate.findUnique({
      where: { key: 'booking_admin_notification' },
    });

    // Şablonlar yoksa otomatik seed yap
    if (!customerTemplate) {
      console.log('Şablonlar bulunamadı, otomatik seed yapılıyor...');
      await seedEmailTemplates();
      customerTemplate = await prisma.emailTemplate.findUnique({
        where: { key: 'booking_received' },
      });
      adminTemplate = await prisma.emailTemplate.findUnique({
        where: { key: 'booking_admin_notification' },
      });
    }

    // Müşteri e-postası
    if (customerTemplate && customerTemplate.isActive) {
      let subject = customerTemplate.subject;
      let html = customerTemplate.body;

      try {
        const parsedSubject = JSON.parse(customerTemplate.subject);
        const parsedBody = JSON.parse(customerTemplate.body);
        subject = parsedSubject[lang] || parsedSubject['TR'] || customerTemplate.subject;
        html = parsedBody[lang] || parsedBody['TR'] || customerTemplate.body;
      } catch (_) {
        // JSON formatında değilse doğrudan kullanılır
      }

      const finalSubject = replaceVariables(subject, vars);
      const finalHtml = replaceVariables(html, vars);

      await transporter.sendMail({
         from: `"Nails & Lashes Studio" <${process.env.EMAIL_USER}>`,
         to: to,
         subject: finalSubject,
         html: finalHtml,
      });
    } else {
      console.log(`Müşteri şablonu bulunamadı veya pasif: booking_received`);
    }

    // Admin e-postası
    if (adminTemplate && adminTemplate.isActive) {
      const subject = replaceVariables(adminTemplate.subject, vars);
      const html = replaceVariables(adminTemplate.body, vars);

      await transporter.sendMail({
        from: `"Sistem Bildirimi" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER!,
        subject,
        html,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("E-posta gönderme hatası:", error?.message || error);
    return { success: false, error: error?.message || 'Bilinmeyen SMTP hatası' };
  }
};

// Genel amaçlı şablonla e-posta gönderme fonksiyonu
export const sendTemplateEmail = async (
  templateKey: string,
  to: string,
  vars: Record<string, string>,
  customerLanguage: string = 'TR'
) => {
  try {
    let template = await prisma.emailTemplate.findUnique({
      where: { key: templateKey },
    });

    if (!template || !template.isActive) {
      // Şablon yoksa seed yap ve tekrar dene
      if (!template) {
        console.log(`Şablon "${templateKey}" bulunamadı, otomatik seed yapılıyor...`);
        await seedEmailTemplates();
        template = await prisma.emailTemplate.findUnique({
          where: { key: templateKey },
        });
      }
      if (!template || !template.isActive) {
        console.log(`E-posta şablonu "${templateKey}" bulunamadı veya pasif.`);
        return { success: false };
      }
    }

    const lang = customerLanguage.toUpperCase();
    let subject = template.subject;
    let html = template.body;

    try {
      const parsedSubject = JSON.parse(template.subject);
      const parsedBody = JSON.parse(template.body);
      subject = parsedSubject[lang] || parsedSubject['TR'] || template.subject;
      html = parsedBody[lang] || parsedBody['TR'] || template.body;
    } catch (_) {
      // JSON formatında değilse doğrudan kullanılır
    }

    const finalSubject = replaceVariables(subject, vars);
    const finalHtml = replaceVariables(html, vars);

    await transporter.sendMail({
      from: `"Nails & Lashes Studio" <${process.env.EMAIL_USER}>`,
      to,
      subject: finalSubject,
      html: finalHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error(`E-posta gönderme hatası (${templateKey}):`, error?.message || error);
    return { success: false, error: error?.message || 'Bilinmeyen SMTP hatası' };
  }
};
