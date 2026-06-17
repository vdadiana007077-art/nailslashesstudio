import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  // Check all blog posts (raw)
  const posts = await prisma.blogPost.findMany({
    include: {
      translations: true,
      categories: { include: { category: { include: { translations: true } } } },
      faqs: true
    }
  });

  console.log(`Total BlogPosts: ${posts.length}\n`);
  for (const p of posts) {
    console.log(`ID: ${p.id}`);
    console.log(`  Active: ${p.isActive} | Deleted: ${p.isDeleted}`);
    console.log(`  Image: ${p.image}`);
    console.log(`  Translations: ${p.translations.length}`);
    for (const t of p.translations) {
      console.log(`    - [${t.language}] slug: ${t.slug} | title: ${t.title?.substring(0, 60)}`);
    }
    console.log(`  Categories: ${p.categories.length}`);
    for (const c of p.categories) {
      for (const ct of c.category.translations) {
        console.log(`    - [${ct.language}] slug: ${ct.slug}`);
      }
    }
    console.log(`  FAQs: ${p.faqs.length}`);
    console.log("");
  }

  // Check BlogCategoryTranslations
  const cats = await prisma.blogCategoryTranslation.findMany();
  console.log(`\nTotal BlogCategoryTranslations: ${cats.length}`);
  for (const c of cats) {
    console.log(`  [${c.language}] slug: ${c.slug} | name: ${c.name} | catId: ${c.categoryId}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
