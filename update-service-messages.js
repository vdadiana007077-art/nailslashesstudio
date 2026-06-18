const fs = require('fs');
const files = {
  tr: {
    ServiceDetail: {
      backToServices: 'Hizmetlere Geri Dön',
      duration: 'İşlem Süresi',
      minutes: 'Dakika',
      price: 'Hizmet Ücreti',
      quality: 'Kalite Güvencesi',
      qualityText: '%100 Hijyen & Kalite',
      bookNow: 'Bu İşlem İçin Randevu Al',
      faqTitle: 'Sıkça Sorulan Sorular (SSS)'
    }
  },
  en: {
    ServiceDetail: {
      backToServices: 'Back to Services',
      duration: 'Duration',
      minutes: 'Minutes',
      price: 'Service Fee',
      quality: 'Quality Assurance',
      qualityText: '100% Hygiene & Quality',
      bookNow: 'Book Appointment for this Service',
      faqTitle: 'Frequently Asked Questions (FAQ)'
    }
  },
  de: {
    ServiceDetail: {
      backToServices: 'Zurück zu den Dienstleistungen',
      duration: 'Dauer',
      minutes: 'Minuten',
      price: 'Servicegebühr',
      quality: 'Qualitätssicherung',
      qualityText: '100% Hygiene & Qualität',
      bookNow: 'Termin für diesen Service buchen',
      faqTitle: 'Häufig gestellte Fragen (FAQ)'
    }
  },
  ru: {
    ServiceDetail: {
      backToServices: 'Вернуться к услугам',
      duration: 'Продолжительность',
      minutes: 'Минут',
      price: 'Стоимость услуги',
      quality: 'Гарантия качества',
      qualityText: '100% Гигиена и качество',
      bookNow: 'Записаться на эту процедуру',
      faqTitle: 'Часто задаваемые вопросы (FAQ)'
    }
  }
};

for (const lang of Object.keys(files)) {
  const path = `./src/messages/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.ServiceDetail = files[lang].ServiceDetail;
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}
