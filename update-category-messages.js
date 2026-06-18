const fs = require('fs');
const path = require('path');

const locales = ['en', 'tr', 'de', 'ru'];
const basePath = path.join(__dirname, 'src', 'messages');

const translations = {
  tr: {
    backToAllServices: "Tüm Hizmetlere Dön",
    servicesInCategory: "Bu Kategoriye Ait İşlemler",
    examineDetails: "Detaylar",
    quickBooking: "Randevu",
    noServicesInCategory: "Bu kategoride aktif bir hizmet bulunamadı.",
    minutes: "Dk"
  },
  en: {
    backToAllServices: "Back to All Services",
    servicesInCategory: "Services in this Category",
    examineDetails: "Details",
    quickBooking: "Book Now",
    noServicesInCategory: "No active services found in this category.",
    minutes: "Min"
  },
  de: {
    backToAllServices: "Zurück zu allen Diensten",
    servicesInCategory: "Dienstleistungen in dieser Kategorie",
    examineDetails: "Details",
    quickBooking: "Termin buchen",
    noServicesInCategory: "Keine aktiven Dienstleistungen in dieser Kategorie gefunden.",
    minutes: "Min"
  },
  ru: {
    backToAllServices: "Вернуться ко всем услугам",
    servicesInCategory: "Услуги в этой категории",
    examineDetails: "Детали",
    quickBooking: "Записаться",
    noServicesInCategory: "В этой категории нет активных услуг.",
    minutes: "Мин"
  }
};

locales.forEach(locale => {
  const filePath = path.join(basePath, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.CategoryDetail = translations[locale];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${locale}.json`);
  }
});
