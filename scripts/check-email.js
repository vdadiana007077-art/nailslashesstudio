const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Email şablonlarını kontrol et
  const templates = await prisma.emailTemplate.findMany({
    select: { key: true, name: true, isActive: true },
    orderBy: { key: 'asc' }
  });
  
  console.log('=== EMAIL ŞABLONLARI ===');
  if (templates.length === 0) {
    console.log('⚠️ HİÇ ŞABLON YOK! seedEmailTemplates çağrılmamış.');
  } else {
    templates.forEach(t => {
      console.log(`  ${t.isActive ? '✅' : '❌'} ${t.key} — ${t.name}`);
    });
  }

  // 2. En son randevuyu kontrol et
  const lastAppt = await prisma.appointment.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { email: true, name: true, phone: true } },
      service: { include: { translations: { select: { name: true, language: true } } } },
      statusHistory: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  });

  if (lastAppt) {
    console.log('\n=== SON RANDEVU ===');
    console.log(`  ID: ${lastAppt.id}`);
    console.log(`  Müşteri: ${lastAppt.customerName} (${lastAppt.customerEmail})`);
    console.log(`  Telefon: ${lastAppt.customerPhone}`);
    console.log(`  Durum: ${lastAppt.status}`);
    console.log(`  Tarih: ${lastAppt.date} ${lastAppt.startTime}`);
    console.log(`  Customer Relation Email: ${lastAppt.customer?.email}`);
    console.log(`  Hizmet: ${lastAppt.service?.translations?.map(t => `${t.language}:${t.name}`).join(', ')}`);
    console.log(`  Durum Geçmişi: ${lastAppt.statusHistory.map(h => h.status).join(' → ')}`);
  }

  // 3. SMTP test
  console.log('\n=== SMTP AYARLARI ===');
  console.log(`  EMAIL_USER: ${process.env.EMAIL_USER || '❌ TANIMLANMAMIŞ'}`);
  console.log(`  EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Tanımlı (' + process.env.EMAIL_PASS.length + ' karakter)' : '❌ TANIMLANMAMIŞ'}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
