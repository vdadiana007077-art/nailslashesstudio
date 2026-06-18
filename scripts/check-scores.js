require("dotenv").config({ path: ".env" });
process.env.DATABASE_URL = process.env.DIRECT_URL;
const { prisma } = require('../src/lib/prisma');

async function main() {
  const posts = await prisma.blogPost.findMany({ include: { translations: true } });
  
  for (const post of posts) {
    let total = 0, filled = 0;
    post.translations.forEach(t => {
      total += 4;
      if (t.seoTitle) filled++;
      if (t.seoDesc) filled++;
      if (t.canonical) filled++;
      if (t.ogImage) filled++;
    });
    const score = total > 0 ? Math.round((filled / total) * 100) : 0;
    if (post.translations.length > 0) {
      console.log('Blog:', post.translations[0].title, 'Score:', score + '%');
    }
  }
  await prisma.$disconnect();
}
main();
