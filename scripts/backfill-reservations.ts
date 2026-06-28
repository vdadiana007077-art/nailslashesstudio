import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting reservation backfill...');

  const appointments = await prisma.appointment.findMany({
    where: {
      reservationNumber: null,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log(`Found ${appointments.length} appointments without reservation numbers.`);

  let counter = 1;

  for (const appt of appointments) {
    // Bulunduğumuz yıl + o yıl içinde sıralı numara şeklinde olabilir
    // Ancak en kolayı, basitçe her yeni kayıt için artan bir sıra numarası kullanmaktır.
    const paddedNumber = String(counter).padStart(5, '0');
    const year = appt.createdAt.getFullYear();
    const resNo = `NL${year}${paddedNumber}`;

    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reservationNumber: resNo },
    });

    counter++;
  }

  console.log('Backfill completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
