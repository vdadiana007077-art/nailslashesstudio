import { prisma } from './src/lib/prisma';

async function run() {
  const pages = await prisma.pageTranslation.findMany({
    where: { page: { pageGroup: 'SERVICES' } }
  });
  console.log(pages.map(p => `${p.language}: ${p.slug}`));
}

run().finally(() => prisma.$disconnect());
