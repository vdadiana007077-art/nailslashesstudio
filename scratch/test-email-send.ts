import { sendBookingEmail, sendTemplateEmail } from '../src/lib/email';
import { prisma } from '../src/lib/prisma';

async function main() {
  const email = 'antsdr@gmail.com'; // User's email from database
  console.log(`Test e-postası gönderiliyor: ${email}`);

  // Test 1: booking_received (dil = TR)
  console.log('\n--- Test 1: booking_received (TR) ---');
  const res1 = await sendBookingEmail(
    email,
    'Serdar Bozel',
    'İpek Kirpik Klasik',
    new Date(),
    '16:00',
    'TR'
  );
  console.log('Sonuç 1:', res1);

  // Test 2: booking_confirmation (dil = TR)
  console.log('\n--- Test 2: booking_confirmation (TR) ---');
  const vars = {
    customerName: 'Serdar Bozel',
    serviceName: 'İpek Kirpik Klasik',
    date: '11 Haziran 2026 Perşembe',
    time: '16:00',
    customerEmail: email,
  };
  const res2 = await sendTemplateEmail('booking_confirmation', email, vars, 'TR');
  console.log('Sonuç 2:', res2);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
