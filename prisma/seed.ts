import "dotenv/config";
import { Language } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Veritabanı başlangıç verileri (Seed) yükleniyor...');

  // Önceki test verilerini temizle
  await prisma.serviceTranslation.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategoryTranslation.deleteMany();
  await prisma.serviceCategory.deleteMany();

  // 1. Kategori: Tırnak Bakımı (Nails)
  const category1 = await prisma.serviceCategory.create({
    data: {
      order: 1,
      translations: {
        create: [
          { language: Language.TR, name: 'Tırnak Bakımı', slug: 'tirnak-bakimi' },
          { language: Language.EN, name: 'Nail Care', slug: 'nail-care' },
          { language: Language.DE, name: 'Nagelpflege', slug: 'nagelpflege' },
          { language: Language.RU, name: 'Уход за ногтями', slug: 'uxod-za-nogtyami' },
        ]
      }
    }
  });

  // 2. Kategori: Kirpik ve Kaş (Lashes & Brows)
  const category2 = await prisma.serviceCategory.create({
    data: {
      order: 2,
      translations: {
        create: [
          { language: Language.TR, name: 'Kirpik ve Kaş', slug: 'kirpik-ve-kas' },
          { language: Language.EN, name: 'Lashes & Brows', slug: 'lashes-and-brows' },
          { language: Language.DE, name: 'Wimpern & Augenbrauen', slug: 'wimpern-augenbrauen' },
          { language: Language.RU, name: 'Ресницы и брови', slug: 'resnici-i-brovi' },
        ]
      }
    }
  });

  // Hizmet 1: VIP Protez Tırnak
  await prisma.service.create({
    data: {
      categoryId: category1.id,
      duration: 120,
      price: 1500,
      translations: {
        create: [
          { language: Language.TR, name: 'VIP Protez Tırnak', slug: 'vip-protez-tirnak', description: 'En kaliteli malzemelerle, kalıcı ve doğal görünümlü protez tırnak uygulaması.' },
          { language: Language.EN, name: 'VIP Acrylic Nails', slug: 'vip-acrylic-nails', description: 'Long-lasting and natural-looking acrylic nail application with premium materials.' },
          { language: Language.DE, name: 'VIP Acrylnägel', slug: 'vip-acrylnaegel', description: 'Langanhaltende und natürlich aussehende Acrylnagel-Anwendung mit Premium-Materialien.' },
          { language: Language.RU, name: 'VIP Наращивание ногтей', slug: 'vip-naraschivanie-nogtey', description: 'Долговечное и естественное наращивание ногтей материалами премиум-класса.' },
        ]
      }
    }
  });

  // Hizmet 2: Kalıcı Oje (Jel)
  await prisma.service.create({
    data: {
      categoryId: category1.id,
      duration: 60,
      price: 800,
      translations: {
        create: [
          { language: Language.TR, name: 'Kalıcı Oje (Jel)', slug: 'kalici-oje', description: 'Kusursuz ve 3-4 hafta kalıcı oje uygulaması.' },
          { language: Language.EN, name: 'Gel Polish', slug: 'gel-polish', description: 'Flawless gel polish application that lasts 3-4 weeks.' },
          { language: Language.DE, name: 'Gellack', slug: 'gellack', description: 'Makellose Gellack-Anwendung, die 3-4 Wochen hält.' },
          { language: Language.RU, name: 'Гель-лак', slug: 'gel-lak', description: 'Безупречное покрытие гель-лаком, держится 3-4 недели.' },
        ]
      }
    }
  });

  // Hizmet 3: İpek Kirpik (Volume)
  await prisma.service.create({
    data: {
      categoryId: category2.id,
      duration: 90,
      price: 1200,
      translations: {
        create: [
          { language: Language.TR, name: 'İpek Kirpik (Volume)', slug: 'ipek-kirpik', description: 'Gözlerinizi ön plana çıkaran, yoğun ve doğal görünümlü ipek kirpik uzatma.' },
          { language: Language.EN, name: 'Volume Eyelash Extensions', slug: 'volume-lashes', description: 'Intense and natural-looking silk lash extensions that highlight your eyes.' },
          { language: Language.DE, name: 'Volumen-Wimpernverlängerung', slug: 'volumen-wimpern', description: 'Intensive und natürlich aussehende Seidenwimpernverlängerung, die Ihre Augen betont.' },
          { language: Language.RU, name: 'Объемное наращивание ресниц', slug: 'obemnoe-naraschivanie-resnic', description: 'Интенсивное и естественное наращивание шелковых ресниц, подчеркивающее ваши глаза.' },
        ]
      }
    }
  });

  console.log('Veriler başarıyla yüklendi! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
