import { prisma } from './src/lib/prisma';

async function check() {
  const blogs = await prisma.blogPost.findMany({
    include: { translations: true }
  });
  console.log(`Total blogs: ${blogs.length}`);
  blogs.forEach(b => {
    const trTitle = b.translations.find(t => t.language === 'TR')?.title || 'No TR Title';
    const langs = b.translations.map(t => t.language).join(', ');
    console.log(`Blog ${b.id}: ${trTitle} - Languages: ${langs}`);
  });
}

check().finally(() => prisma.$disconnect());
