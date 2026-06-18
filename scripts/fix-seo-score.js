require("dotenv").config({ path: ".env" });
process.env.DATABASE_URL = process.env.DIRECT_URL;
const { prisma } = require('../src/lib/prisma');

async function fixSeo() {
  const posts = await prisma.blogPost.findMany({
    include: { translations: true }
  });

  for (const post of posts) {
    for (const t of post.translations) {
      if (!t.canonical || !t.ogImage) {
        const langCode = t.language.toLowerCase();
        let canonicalUrl = `https://nailslashesstudio.com/${langCode}/blog/${t.slug}`;
        
        if (t.language === 'TR') {
          canonicalUrl = `https://nailslashesstudio.com/tr/blog/${t.slug}`;
        }

        await prisma.blogPostTranslation.update({
          where: { id: t.id },
          data: {
            canonical: canonicalUrl,
            ogImage: post.image
          }
        });
        console.log(`✅ Fixed SEO for ${t.language} - ${t.slug}`);
      }
    }
  }
  
  await prisma.$disconnect();
  console.log("SEO Fix completed!");
}

fixSeo().catch(console.error);
