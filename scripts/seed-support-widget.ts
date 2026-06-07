import { Language, ActionType } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding Support Widget Data...');

  // 1. Setup Settings
  const settings = [
    { key: 'widget_active', value: 'true' },
    { key: 'widget_title', value: 'N&L Studio AI' },
    { key: 'widget_avatar', value: '/images/avatar.png' }, 
    { key: 'widget_whatsapp_number', value: '+905061155243' },
    { key: 'widget_position', value: 'right' },
    { key: 'widget_theme', value: 'light' },
    { key: 'widget_typing_animation', value: 'true' },
    { key: 'widget_auto_open', value: 'false' },
  ];

  for (const s of settings) {
    const existing = await prisma.setting.findFirst({ where: { key: s.key } });
    if (existing) {
      await prisma.setting.update({ where: { id: existing.id }, data: { value: s.value } });
    } else {
      await prisma.setting.create({ data: { key: s.key, value: s.value, language: Language.TR } });
    }
  }

  // Greeting (language specific)
  const trGreeting = await prisma.setting.findFirst({ where: { key: 'widget_greeting', language: Language.TR } });
  if (trGreeting) {
    await prisma.setting.update({ where: { id: trGreeting.id }, data: { value: 'Size nasıl yardımcı olabilirim?' } });
  } else {
    await prisma.setting.create({ data: { key: 'widget_greeting', value: 'Size nasıl yardımcı olabilirim?', language: Language.TR } });
  }

  const enGreeting = await prisma.setting.findFirst({ where: { key: 'widget_greeting', language: Language.EN } });
  if (enGreeting) {
    await prisma.setting.update({ where: { id: enGreeting.id }, data: { value: 'How can I help you?' } });
  } else {
    await prisma.setting.create({ data: { key: 'widget_greeting', value: 'How can I help you?', language: Language.EN } });
  }

  const deGreeting = await prisma.setting.findFirst({ where: { key: 'widget_greeting', language: Language.DE } });
  if (deGreeting) {
    await prisma.setting.update({ where: { id: deGreeting.id }, data: { value: 'Wie kann ich Ihnen helfen?' } });
  } else {
    await prisma.setting.create({ data: { key: 'widget_greeting', value: 'Wie kann ich Ihnen helfen?', language: Language.DE } });
  }

  const ruGreeting = await prisma.setting.findFirst({ where: { key: 'widget_greeting', language: Language.RU } });
  if (ruGreeting) {
    await prisma.setting.update({ where: { id: ruGreeting.id }, data: { value: 'Чем я могу вам помочь?' } });
  } else {
    await prisma.setting.create({ data: { key: 'widget_greeting', value: 'Чем я могу вам помочь?', language: Language.RU } });
  }

  // 2. Setup Questions
  // Wipe existing
  await prisma.supportQuestion.deleteMany({});

  const questions = [
    {
      q: 'Fiyatları görmek istiyorum',
      a: 'Hizmet fiyatlarımız uygulama türüne göre değişmektedir. Manikür, pedikür, kalıcı oje, jel güçlendirme, ipek kirpik ve kaş-kirpik bakımı hizmetlerimizi fiyat ve süre bilgileriyle inceleyebilirsiniz.',
      btn: 'Hizmetleri Gör',
      action: ActionType.SERVICE_LIST,
    },
    {
      q: 'Randevu almak istiyorum',
      a: 'Online randevu sistemimiz üzerinden şube, hizmet, uzman, tarih ve saat seçerek kolayca randevu oluşturabilirsiniz.',
      btn: 'Randevu Al',
      action: ActionType.BOOKING_LINK,
    },
    {
      q: 'Müsait saatleri görmek istiyorum',
      a: 'Müsait saatler seçtiğiniz hizmet, şube ve uzman tercihine göre değişir. Randevu ekranından güncel uygun saatleri canlı olarak görebilirsiniz.',
      btn: 'Müsait Saatleri Gör',
      action: ActionType.AVAILABILITY_LINK,
    },
    {
      q: 'WhatsApp ile yazmak istiyorum',
      a: 'Dilerseniz ekibimizle WhatsApp üzerinden hızlıca iletişime geçebilirsiniz.',
      btn: 'WhatsApp’a Yaz',
      action: ActionType.WHATSAPP_LINK,
    },
    {
      q: 'Konum bilgisi istiyorum',
      a: 'Salon konumumuzu harita üzerinden görebilir, yol tarifi alabilirsiniz.',
      btn: 'Konumu Aç',
      action: ActionType.LOCATION_LINK,
    },
    {
      q: 'Hangi hizmetleri veriyorsunuz?',
      a: 'N&L Studio’da manikür, pedikür, kalıcı oje, jel güçlendirme, ipek kirpik, kaş bakımı ve kirpik lifting gibi güzellik hizmetleri sunulmaktadır.',
      btn: 'Hizmetleri İncele',
      action: ActionType.SERVICE_LIST,
    },
    {
      q: 'Randevumu iptal etmek istiyorum',
      a: 'Mevcut randevunuzu telefon numaranızla sorgulayabilir ve iptal talebi oluşturabilirsiniz.',
      btn: 'Randevu Sorgula',
      action: ActionType.BOOKING_LINK,
    },
    {
      q: 'Çalışma saatleriniz nedir?',
      a: 'Çalışma saatlerimiz şubeye göre değişebilir. Güncel saatleri iletişim sayfamızdan veya randevu ekranından kontrol edebilirsiniz.',
      btn: 'İletişim Bilgileri',
      action: ActionType.LOCATION_LINK,
    }
  ];

  for (let i = 0; i < questions.length; i++) {
    const qData = questions[i];
    await prisma.supportQuestion.create({
      data: {
        order: i + 1,
        actionType: qData.action,
        isActive: true,
        translations: {
          create: [
            {
              language: Language.TR,
              question: qData.q,
              answer: qData.a,
              buttonText: qData.btn
            },
            {
              language: Language.EN,
              question: '[EKSİK ÇEVİRİ] ' + qData.q,
              answer: '[EKSİK ÇEVİRİ] ' + qData.a,
              buttonText: '[EKSİK ÇEVİRİ] ' + qData.btn
            },
            {
              language: Language.DE,
              question: '[EKSİK ÇEVİRİ] ' + qData.q,
              answer: '[EKSİK ÇEVİRİ] ' + qData.a,
              buttonText: '[EKSİK ÇEVİRİ] ' + qData.btn
            },
            {
              language: Language.RU,
              question: '[EKSİK ÇEVİRİ] ' + qData.q,
              answer: '[EKSİK ÇEVİRİ] ' + qData.a,
              buttonText: '[EKSİK ÇEVİRİ] ' + qData.btn
            }
          ]
        }
      }
    });
  }

  console.log('Support Widget Data Seeded Successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
