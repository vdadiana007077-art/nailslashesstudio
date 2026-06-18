require("dotenv").config({ path: ".env" });
process.env.DATABASE_URL = process.env.DIRECT_URL;
const { prisma } = require('../src/lib/prisma');

async function generateReport() {
  const blogs = [
    '260465c4-6ee1-4e26-9bb8-e00d91347cff', // guzeloba-guzellik-salonu
    '55054c9d-3c45-4a6a-ba03-47a61e4e649c', // antalya-guzellik-trendleri
    '2ef65724-d6fe-43bb-83b1-591f9299d5e8', // kirpik-uzatma-antalya
    '5254c78f-55de-4fe0-8f1d-5a824a6880b4', // ipek-kirpik-lara
    '8d1c0cd1-2b4d-445f-b14b-8a11a15412bc', // hybrid-lashes-guzeloba
    'fffb2608-4b69-4522-8c8e-c0dc2c55301b', // volume-lashes-antalya
  ];

  const posts = await prisma.blogPost.findMany({
    where: { id: { in: blogs } },
    include: { translations: true, faqs: true }
  });

  console.log("| Blog Slug | Dil | Excerpt | SEO Title | SEO Desc | Canonical | OG Title | OG Desc | FAQ |");
  console.log("|---|---|---|---|---|---|---|---|---|");

  for (const id of blogs) {
    const post = posts.find(p => p.id === id);
    if (!post) continue;

    for (const lang of ['TR', 'EN', 'DE', 'RU']) {
      const t = post.translations.find(trans => trans.language === lang);
      const faqs = post.faqs.filter(f => f.language === lang);

      if (!t) {
        console.log(`| ${id} | ${lang} | ❌ MISSING | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |`);
        continue;
      }

      const hasExcerpt = t.excerpt && t.excerpt.trim() !== '' ? '✅' : '❌';
      const hasSeoTitle = t.seoTitle && t.seoTitle.trim() !== '' ? '✅' : '❌';
      const hasSeoDesc = t.seoDesc && t.seoDesc.trim() !== '' ? '✅' : '❌';
      const hasCanonical = t.canonical && t.canonical.trim() !== '' ? '✅' : '❌';
      const hasOgTitle = t.ogTitle && t.ogTitle.trim() !== '' ? '✅' : '❌';
      const hasOgDesc = t.ogDesc && t.ogDesc.trim() !== '' ? '✅' : '❌';
      const hasFaq = faqs.length > 0 ? `✅ (${faqs.length})` : '❌';

      console.log(`| ${t.slug} | ${lang} | ${hasExcerpt} | ${hasSeoTitle} | ${hasSeoDesc} | ${hasCanonical} | ${hasOgTitle} | ${hasOgDesc} | ${hasFaq} |`);
    }
  }
  
  await prisma.$disconnect();
}

generateReport().catch(console.error);
