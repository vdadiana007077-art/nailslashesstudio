import { prisma } from './src/lib/prisma';

async function main() {
  const post = await prisma.blogPostTranslation.findFirst({
    where: { slug: 'biab-tirnak-antalya', language: 'TR' },
    include: {
      blogPost: {
        include: {
          faqs: true
        }
      }
    }
  });
  console.log('Total FAQs for this post:', post?.blogPost?.faqs.length);
  post?.blogPost?.faqs.forEach(f => console.log(f.language, f.question.substring(0, 50)));
}
main().catch(console.error).finally(() => prisma.$disconnect());
