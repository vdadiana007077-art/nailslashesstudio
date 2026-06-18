const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateSlug = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

async function autoFillTranslations() {
  const categories = await prisma.category.findMany({
    include: { translations: true }
  });

  const languages = ['EN', 'DE', 'RU'];

  for (const cat of categories) {
    const trTrans = cat.translations.find(t => t.language === 'TR');
    if (!trTrans) continue;

    for (const lang of languages) {
      const exists = cat.translations.some(t => t.language === lang);
      if (!exists) {
        let name = trTrans.name;
        if (lang === 'EN') name = name + ' (EN)';
        if (lang === 'DE') name = name + ' (DE)';
        if (lang === 'RU') name = name + ' (RU)';

        await prisma.categoryTranslation.create({
          data: {
            categoryId: cat.id,
            language: lang,
            name: name,
            slug: generateSlug(name),
            description: trTrans.description,
            seoTitle: trTrans.seoTitle,
            seoDesc: trTrans.seoDesc
          }
        });
        console.log(`Created ${lang} for Category ${trTrans.name}`);
      }
    }
  }

  const services = await prisma.service.findMany({
    include: { translations: true }
  });

  for (const srv of services) {
    const trTrans = srv.translations.find(t => t.language === 'TR');
    if (!trTrans) continue;

    for (const lang of languages) {
      const exists = srv.translations.some(t => t.language === lang);
      if (!exists) {
        let name = trTrans.name;
        if (lang === 'EN') name = name + ' (EN)';
        if (lang === 'DE') name = name + ' (DE)';
        if (lang === 'RU') name = name + ' (RU)';

        await prisma.serviceTranslation.create({
          data: {
            serviceId: srv.id,
            language: lang,
            name: name,
            slug: generateSlug(name),
            description: trTrans.description,
            longDescription: trTrans.longDescription,
            seoTitle: trTrans.seoTitle,
            seoDesc: trTrans.seoDesc
          }
        });
        console.log(`Created ${lang} for Service ${trTrans.name}`);
      }
    }
  }

  console.log('Done filling translations');
}

autoFillTranslations()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
