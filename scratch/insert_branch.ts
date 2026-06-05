import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Supabase SSL bağlantısı için gerekli
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const branchData = {
  name: "Lara Şubesi",
  branchName: "Nails Lashes Studio - Lara Şubesi",
  address: "Çağlayan Mah., Barınaklar Bulvarı, No:98/B, 07230 Muratpaşa/Antalya",
  city: "Antalya",
  country: "Türkiye",
  latitude: 36.852103,
  longitude: 30.758362,
  googlePlaceId: "ChIJn5O_sV9mwhQR4r2gI8Ew-9o",
  googleMapsUrl: "https://maps.google.com/?cid=12345678901234567890",
  phone: "+90 506 115 5243",
  email: "vdadiana007077@gmail.com",
  isActive: true,
  seoTitle: "Lara Güzellik ve Tırnak Salonu | Nails Lashes Studio Lara",
  seoDesc: "Lara şubemizde profesyonel manikür, pedikür ve ipek kirpik hizmetleri. En iyi tırnak ve kirpik bakımı için hemen randevu alın.",
  canonical: "https://nailslashesstudio.com/tr/iletisim",
  ogTitle: "Lara Güzellik ve Tırnak Salonu | Nails Lashes Studio Lara",
  ogDesc: "Lara şubemizde profesyonel manikür, pedikür ve ipek kirpik hizmetleri. En iyi tırnak ve kirpik bakımı için hemen randevu alın.",
  ogImage: "https://nailslashesstudio.com/images/luxury_salon_hero_1780687981054.png"
};

async function run() {
  console.log("Yeni Şube Veritabanı Ekleme Başlıyor (SSL Aktif)...\n");

  // Mevcut Lara Şubesi var mı kontrol et
  const existingBranch = await prisma.location.findFirst({
    where: {
      phone: branchData.phone,
      isDeleted: false
    }
  });

  if (existingBranch) {
    console.log(`Şube zaten mevcut (${existingBranch.id}). Bilgiler güncelleniyor...`);
    const updated = await prisma.location.update({
      where: { id: existingBranch.id },
      data: branchData
    });
    console.log(`[ŞUBE GÜNCELLENDİ] ID: ${updated.id}, Adı: ${updated.branchName}`);
  } else {
    console.log("Yeni şube kaydı oluşturuluyor...");
    const created = await prisma.location.create({
      data: branchData
    });
    console.log(`[ŞUBE EKLENDİ] ID: ${created.id}, Adı: ${created.branchName}`);

    console.log("Şube için varsayılan çalışma saatleri tanımlanıyor...");
    for (let day = 1; day <= 7; day++) {
      await prisma.workingHours.create({
        data: {
          locationId: created.id,
          dayOfWeek: day,
          openTime: "09:00",
          closeTime: "20:00",
          isClosed: day === 7 // Pazar kapalı
        }
      });
    }
    console.log("Varsayılan çalışma saatleri başarıyla eklendi.");
  }

  console.log("\nİşlem başarıyla tamamlandı!");
}

run()
  .catch(err => {
    console.error("Hata oluştu:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Havuzu sonlandırıyoruz
  });
