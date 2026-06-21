require("dotenv").config({ path: ".env" });
process.env.DATABASE_URL = process.env.DIRECT_URL;
const { prisma } = require('../src/lib/prisma');

async function main() {
  const post = await prisma.blogPost.findFirst({
    where: { translations: { some: { slug: 'biab-tirnak-antalya' } } },
    include: { faqs: true }
  });
  if (post) {
    console.log('Post ID:', post.id);
    post.faqs.forEach(f => {
      if (f.language === 'TR') {
        console.log('[' + f.language + '] ' + f.question + ' => ' + f.answer);
      }
    });
  } else {
    console.log('Post not found');
  }
  await prisma.$disconnect();
}
main().catch(console.error);
