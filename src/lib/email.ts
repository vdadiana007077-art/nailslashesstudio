import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookingEmail = async (
  to: string, 
  customerName: string, 
  serviceName: string, 
  date: Date, 
  time: string
) => {
  const formattedDate = date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Müşteriye giden mail
  const customerHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #fce7f3; padding: 24px; text-align: center;">
        <h2 style="color: #be185d; margin: 0;">Randevunuz Onaylandı!</h2>
      </div>
      <div style="padding: 24px; color: #374151;">
        <p>Merhaba <strong>${customerName}</strong>,</p>
        <p>Nails & Lashes Studio'dan oluşturduğunuz randevunuz başarıyla kaydedilmiştir. Randevu detaylarınız aşağıdadır:</p>
        
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Hizmet:</strong> ${serviceName}</p>
          <p style="margin: 4px 0;"><strong>Tarih:</strong> ${formattedDate}</p>
          <p style="margin: 4px 0;"><strong>Saat:</strong> ${time}</p>
        </div>

        <p>Randevu saatinizde sizi bekliyor olacağız. Gecikme veya iptal durumunda lütfen bizimle iletişime geçin.</p>
        <br/>
        <p>Sevgilerle,<br/><strong>Nails & Lashes Studio</strong></p>
      </div>
    </div>
  `;

  // Admibe giden mail
  const adminHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #111827; padding: 24px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0;">Yeni Randevu Geldi!</h2>
      </div>
      <div style="padding: 24px; color: #374151;">
        <p>Sistem üzerinden yeni bir randevu oluşturuldu.</p>
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Müşteri:</strong> ${customerName}</p>
          <p style="margin: 4px 0;"><strong>Hizmet:</strong> ${serviceName}</p>
          <p style="margin: 4px 0;"><strong>Tarih:</strong> ${formattedDate}</p>
          <p style="margin: 4px 0;"><strong>Saat:</strong> ${time}</p>
          <p style="margin: 4px 0;"><strong>Müşteri E-postası:</strong> ${to}</p>
        </div>
        <p>Detayları Admin panelinden görüntüleyebilirsiniz.</p>
      </div>
    </div>
  `;

  try {
    // 1. Müşteriye Gönder
    await transporter.sendMail({
      from: `"Nails & Lashes Studio" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Randevu Onayı - ${serviceName}`,
      html: customerHtml,
    });

    // 2. Kendimize (Admin) Gönder
    await transporter.sendMail({
      from: `"Sistem Bildirimi" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Yeni Randevu: ${customerName} - ${formattedDate} ${time}`,
      html: adminHtml,
    });

    return { success: true };
  } catch (error) {
    console.error("E-posta gönderme hatası:", error);
    return { success: false };
  }
};
