import { prisma } from '../src/lib/prisma';
import { updateAppointmentStatus } from '../src/app/actions/appointment';
import { ApptStatus } from '@prisma/client';

async function main() {
  // PENDING olan bir randevu bulalım
  const pendingAppt = await prisma.appointment.findFirst({
    where: { status: ApptStatus.PENDING }
  });

  if (!pendingAppt) {
    console.log('Test için PENDING durumunda randevu bulunamadı!');
    // Eğer PENDING yoksa, CONFIRMED olan birini geçici olarak PENDING yapalım test için
    const anyAppt = await prisma.appointment.findFirst();
    if (!anyAppt) {
      console.log('Veritabanında hiç randevu bulunmamaktadır!');
      return;
    }
    console.log(`Test için Randevu ID: ${anyAppt.id} durumunu PENDING yapıyoruz...`);
    await prisma.appointment.update({
      where: { id: anyAppt.id },
      data: { status: ApptStatus.PENDING }
    });
    
    // Şimdi çalıştıralım
    console.log('Durumu CONFIRMED olarak güncelliyoruz...');
    const res = await updateAppointmentStatus(anyAppt.id, ApptStatus.CONFIRMED);
    console.log('Sonuç:', res);
  } else {
    console.log(`Bulunan PENDING Randevu ID: ${pendingAppt.id}`);
    console.log('Durumu CONFIRMED olarak güncelliyoruz...');
    const res = await updateAppointmentStatus(pendingAppt.id, ApptStatus.CONFIRMED);
    console.log('Sonuç:', res);
  }
}

main()
  .catch((e) => {
    console.error('Hata:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
