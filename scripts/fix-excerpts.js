require("dotenv").config({ path: ".env" });
process.env.DATABASE_URL = process.env.DIRECT_URL;
const { prisma } = require('../src/lib/prisma');

async function fixExcerpts() {
  const posts = await prisma.blogPost.findMany({
    include: { translations: true }
  });

  let updatedCount = 0;

  for (const post of posts) {
    for (const t of post.translations) {
      if (t.language !== 'TR' && (!t.excerpt || t.excerpt.trim() === '')) {
        // Use seoDesc as a fallback for excerpt, or generate one from content
        let newExcerpt = t.seoDesc || t.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...';
        
        await prisma.blogPostTranslation.update({
          where: { id: t.id },
          data: { excerpt: newExcerpt }
        });
        
        console.log(`✅ Fixed excerpt for ${t.language} - ${t.slug}`);
        updatedCount++;
      }
    }
  }
  
  await prisma.$disconnect();
  console.log(`Excerpt Fix completed! ${updatedCount} translations updated.`);
}

fixExcerpts().catch(console.error);
