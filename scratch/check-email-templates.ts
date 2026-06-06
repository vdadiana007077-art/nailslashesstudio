import { prisma } from '../src/lib/prisma';
import nodemailer from 'nodemailer';

async function main() {
  console.log('--- E-posta Şablonları Kontrolü ---');
  const templates = await prisma.emailTemplate.findMany();
  for (const t of templates) {
    console.log(`Key: ${t.key}, Active: ${t.isActive}`);
    console.log(`Subject: ${t.subject}`);
    console.log(`Body (ilk 100 karakter): ${t.body.substring(0, 100)}...`);
    console.log('-----------------------------------');
  }

  console.log('\n--- SMTP Bağlantı Testi ---');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS var mı:', !!process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('SMTP Bağlantısı BAŞARILI!');
  } catch (error) {
    console.error('SMTP Bağlantısı BAŞARISIZ:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
