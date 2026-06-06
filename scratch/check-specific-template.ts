import { prisma } from '../src/lib/prisma';

async function main() {
  const template = await prisma.emailTemplate.findUnique({
    where: { key: 'booking_confirmation' }
  });

  if (!template) {
    console.log('booking_confirmation şablonu bulunamadı!');
    return;
  }

  console.log('--- Şablon Detayları ---');
  console.log('Subject:', template.subject);
  console.log('Body:', template.body);

  try {
    const parsedSubject = JSON.parse(template.subject);
    const parsedBody = JSON.parse(template.body);
    console.log('JSON Parse BAŞARILI!');
    console.log('parsedSubject Keys:', Object.keys(parsedSubject));
    console.log('parsedBody Keys:', Object.keys(parsedBody));
  } catch (e: any) {
    console.error('JSON Parse HATASI:', e.message);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
