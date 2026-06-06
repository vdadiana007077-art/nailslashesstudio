/**
 * Seed: LocationService — Tüm aktif hizmetleri tüm aktif şubelere bağlar.
 * Duplicate kontrolü yaparak mevcut kayıtları tekrar oluşturmaz.
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
  console.log('🔗 LocationService Seed — Hizmet-Şube Bağlantıları\n');

  // Aktif şubeleri al
  const locations = await prisma.location.findMany({
    where: { isActive: true, isDeleted: false },
    select: { id: true, name: true },
  });

  // Aktif hizmetleri al
  const services = await prisma.service.findMany({
    where: { isActive: true, isDeleted: false },
    include: { translations: { where: { language: 'TR' } } },
  });

  console.log(`📊 ${locations.length} aktif şube, ${services.length} aktif hizmet bulundu.\n`);

  // Mevcut bağlantıları kontrol et
  const existing = await prisma.locationService.findMany({
    select: { locationId: true, serviceId: true },
  });
  const existingSet = new Set(existing.map(e => `${e.locationId}_${e.serviceId}`));

  let created = 0;
  let skipped = 0;

  for (const loc of locations) {
    for (const svc of services) {
      const key = `${loc.id}_${svc.id}`;
      if (existingSet.has(key)) {
        skipped++;
        continue;
      }

      await prisma.locationService.create({
        data: {
          locationId: loc.id,
          serviceId: svc.id,
        },
      });
      created++;
    }
  }

  console.log('✅ Seed tamamlandı!\n');
  console.log(`  📌 Oluşturulan bağlantı: ${created}`);
  console.log(`  ⏭️  Atlanan (zaten mevcut): ${skipped}`);
  console.log(`  📊 Toplam bağlantı: ${existing.length + created}`);

  // Detaylı rapor
  console.log('\n📋 Şube-Hizmet Haritası:\n');
  for (const loc of locations) {
    const count = await prisma.locationService.count({ where: { locationId: loc.id } });
    console.log(`  🏢 ${loc.name}: ${count} hizmet`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
