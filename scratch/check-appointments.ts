import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('--- Randevu Kayıtları Kontrolü ---');
  const appointments = await prisma.appointment.findMany({
    include: {
      customer: true
    }
  });
  
  for (const appt of appointments) {
    console.log(`ID: ${appt.id}`);
    console.log(`Müşteri Adı: ${appt.customerName}`);
    console.log(`Müşteri E-Posta: ${appt.customerEmail}`);
    console.log(`Müşteri Telefon: ${appt.customerPhone}`);
    console.log(`Durum: ${appt.status}`);
    console.log(`İlişkili Customer var mı:`, !!appt.customer);
    if (appt.customer) {
      console.log(`  Customer E-posta: ${appt.customer.email}`);
      console.log(`  Customer Telefon: ${appt.customer.phone}`);
    }
    console.log('-----------------------------------');
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
