import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Menü verileri taşınmaya başlanıyor...');
  const menuItems = await prisma.menuItem.findMany({
    include: {
      translations: true,
    },
  });

  console.log(`Toplam menü elemanı: ${menuItems.length}`);
  let count = 0;

  for (const item of menuItems) {
    if (item.translations.length === 0 && item.language && item.title && item.url) {
      await prisma.menuItemTranslation.create({
        data: {
          menuItemId: item.id,
          language: item.language,
          title: item.title,
          url: item.url,
        },
      });
      count++;
    }
  }

  console.log(`Başarıyla ${count} adet menü elemanı çeviri tablosuna taşındı.`);
}

main()
  .catch((e) => {
    console.error('Geçiş sırasında hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
