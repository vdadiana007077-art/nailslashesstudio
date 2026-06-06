/**
 * Mükerrer Menü Temizleme Scripti
 * 
 * Bu script:
 * 1. Tüm menü kayıtlarını ve çevirilerini listeler
 * 2. Aynı menuType + order kombinasyonuna sahip mükerrer kayıtları tespit eder
 * 3. Eski sistemden kalan (translations'ı olmayan veya az olan) kayıtları pasifleştirir
 * 4. Çevirileri eksik olan ana kayıtlara eksik dilleri ekler
 */

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function main() {
  console.log('🔍 Mevcut menü kayıtları taranıyor...\n');

  const allMenuItems = await prisma.menuItem.findMany({
    include: { translations: true },
    orderBy: [{ menuType: 'asc' }, { order: 'asc' }]
  });

  console.log(`📊 Toplam ${allMenuItems.length} menü kaydı bulundu.\n`);

  // Durumu raporla
  for (const item of allMenuItems) {
    const langs = item.translations.map(t => t.language).join(', ');
    const titles = item.translations.map(t => `${t.language}:${t.title}`).join(' | ');
    console.log(`  [${item.menuType}] Sıra:${item.order} | Aktif:${item.isActive} | Diller:[${langs}] | Başlıklar: ${titles}`);
    console.log(`    ID: ${item.id} | Eski dil: ${item.language || '-'} | Eski title: ${item.title || '-'} | Eski url: ${item.url || '-'}`);
  }

  // Mükerrer grupları tespit et
  console.log('\n\n🔎 Mükerrer gruplar tespit ediliyor...\n');
  
  const groups: Record<string, typeof allMenuItems> = {};
  for (const item of allMenuItems) {
    const key = `${item.menuType}_${item.order}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }

  let totalDuplicates = 0;
  const toDeactivate: string[] = [];

  for (const [key, group] of Object.entries(groups)) {
    if (group.length <= 1) continue;

    console.log(`⚠️  Mükerrer Grup: ${key} (${group.length} kayıt)`);
    
    // En fazla çeviriye sahip olanı ana kayıt seç
    group.sort((a, b) => b.translations.length - a.translations.length);
    const mainItem = group[0];
    
    console.log(`  ✅ Ana kayıt: ${mainItem.id} (${mainItem.translations.length} çeviri)`);

    for (let i = 1; i < group.length; i++) {
      const dupItem = group[i];
      console.log(`  ❌ Mükerrer: ${dupItem.id} (${dupItem.translations.length} çeviri) -> PASİFLEŞTİRİLECEK`);

      // Eksik çevirileri ana kayda taşı
      for (const trans of dupItem.translations) {
        const hasTrans = mainItem.translations.some(t => t.language === trans.language);
        if (!hasTrans) {
          console.log(`    📝 ${trans.language} çevirisi ana kayda taşınacak: "${trans.title}"`);
          await prisma.menuItemTranslation.create({
            data: {
              menuItemId: mainItem.id,
              language: trans.language,
              title: trans.title,
              url: trans.url,
            }
          });
        }
      }

      toDeactivate.push(dupItem.id);
      totalDuplicates++;
    }
  }

  // Mükerrer kayıtları pasifleştir
  if (toDeactivate.length > 0) {
    console.log(`\n🧹 ${toDeactivate.length} mükerrer kayıt pasifleştiriliyor...`);
    
    await prisma.menuItem.updateMany({
      where: { id: { in: toDeactivate } },
      data: { isActive: false }
    });

    console.log('✅ Mükerrer kayıtlar başarıyla pasifleştirildi!');
  } else {
    console.log('\n✅ Mükerrer kayıt bulunamadı. Veritabanı temiz!');
  }

  // Son durumu göster
  console.log('\n\n📋 TEMİZLİK SONRASI AKTİF MENÜLER:\n');
  
  const activeMenus = await prisma.menuItem.findMany({
    where: { isActive: true },
    include: { translations: true },
    orderBy: [{ menuType: 'asc' }, { order: 'asc' }]
  });

  for (const item of activeMenus) {
    const titles = item.translations.map(t => `${t.language}:${t.title}`).join(' | ');
    console.log(`  [${item.menuType}] Sıra:${item.order} → ${titles}`);
  }

  console.log(`\n🎉 İşlem tamamlandı! Aktif menü sayısı: ${activeMenus.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
