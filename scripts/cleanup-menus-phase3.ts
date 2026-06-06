/**
 * Menü Temizleme - Faz 3
 * 
 * Sıra:0 olan eski eski kalıntı kayıtları pasifleştirir.
 * Bu kayıtlar CMS sayfa sisteminden otomatik oluşturulmuş ve sadece tek dilde çevirisi var.
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
  console.log('🔍 Faz 3 — order:0 olan tek dilli kalıntı kayıtlar...\n');

  // order:0 ve sadece 1 dilde çevirisi olan aktif kayıtlar (bunlar eski CMS kalıntıları)
  const orphanItems = await prisma.menuItem.findMany({
    where: { 
      isActive: true,
      order: 0,
    },
    include: { translations: true },
  });

  console.log(`📊 order:0 olan ${orphanItems.length} aktif kayıt bulundu:\n`);

  const toDeactivate: string[] = [];

  for (const item of orphanItems) {
    const titles = item.translations.map(t => `${t.language}:${t.title} (${t.url})`).join(' | ');
    console.log(`  [${item.menuType}] ID:${item.id} | Dil sayısı:${item.translations.length}`);
    console.log(`    Çeviriler: ${titles || '(yok)'}`);
    
    // Tek dilde çevirisi olan order:0 kayıtlar kesinlikle eski kalıntı
    if (item.translations.length <= 1) {
      toDeactivate.push(item.id);
      console.log(`    ❌ → PASİFLEŞTİRİLECEK (tek dilli kalıntı)`);
    } else {
      console.log(`    ✅ → Korunacak (çok dilli)`);
    }
    console.log('');
  }

  if (toDeactivate.length > 0) {
    console.log(`\n🧹 ${toDeactivate.length} kalıntı kayıt pasifleştiriliyor...`);
    await prisma.menuItem.updateMany({
      where: { id: { in: toDeactivate } },
      data: { isActive: false }
    });
    console.log('✅ Tamamlandı!\n');
  } else {
    console.log('✅ Temizlenecek kayıt bulunamadı.\n');
  }

  // Son durumu göster
  console.log('\n📋 FİNAL AKTİF MENÜLER:\n');
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
