/**
 * Menü Temizleme - Faz 2
 * 
 * Sıra:0 olan eski kayıtları ve çevirisi olmayan hayalet kayıtları pasifleştirir.
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
  console.log('🔍 Faz 2 — Sorunlu kayıtlar tespit ediliyor...\n');

  const allActive = await prisma.menuItem.findMany({
    where: { isActive: true },
    include: { translations: true },
    orderBy: [{ menuType: 'asc' }, { order: 'asc' }]
  });

  const toDeactivate: { id: string; reason: string }[] = [];

  for (const item of allActive) {
    // 1. Çevirisi hiç olmayan hayalet kayıtlar
    if (item.translations.length === 0) {
      toDeactivate.push({ id: item.id, reason: `Çevirisi yok (hayalet kayıt) | menuType:${item.menuType} order:${item.order}` });
      continue;
    }

    // 2. Sadece tek dilde çevirisi olan ve aynı menuType'ta daha kapsamlı bir alternatifi bulunan kayıtlar
    if (item.translations.length === 1) {
      const sameTypeItems = allActive.filter(
        a => a.id !== item.id && a.menuType === item.menuType && a.translations.length >= 4
      );
      // Bu tek dilli kaydın URL'si, kapsamlı bir kayıtla eşleşiyor mu?
      const singleUrl = item.translations[0].url;
      const hasBetterAlternative = sameTypeItems.some(a => 
        a.translations.some(t => t.url === singleUrl)
      );
      if (hasBetterAlternative) {
        toDeactivate.push({ 
          id: item.id, 
          reason: `Tek dilli mükerrer (${item.translations[0].language}:${item.translations[0].title}) → Kapsamlı alternatif mevcut | menuType:${item.menuType} order:${item.order}` 
        });
      }
    }
  }

  if (toDeactivate.length === 0) {
    console.log('✅ Sorunlu kayıt bulunamadı. Veritabanı temiz!\n');
  } else {
    console.log(`⚠️  ${toDeactivate.length} sorunlu kayıt tespit edildi:\n`);
    for (const item of toDeactivate) {
      console.log(`  ❌ ${item.id} → ${item.reason}`);
    }

    console.log(`\n🧹 Pasifleştiriliyor...`);
    await prisma.menuItem.updateMany({
      where: { id: { in: toDeactivate.map(i => i.id) } },
      data: { isActive: false }
    });
    console.log('✅ Tamamlandı!\n');
  }

  // Son durumu göster
  console.log('📋 GÜNCEL AKTİF MENÜLER:\n');
  const finalActive = await prisma.menuItem.findMany({
    where: { isActive: true },
    include: { translations: true },
    orderBy: [{ menuType: 'asc' }, { order: 'asc' }]
  });

  let currentType = '';
  for (const item of finalActive) {
    if (item.menuType !== currentType) {
      currentType = item.menuType;
      console.log(`\n  ── ${currentType} ──`);
    }
    const titles = item.translations.map(t => `${t.language}:${t.title}`).join(' | ');
    console.log(`  #${item.order} → ${titles}`);
  }

  console.log(`\n🎉 Toplam aktif menü: ${finalActive.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
