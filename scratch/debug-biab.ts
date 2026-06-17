import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const e = await prisma.blogPostTranslation.findFirst({
    where: { slug: 'biab-nails-antalya' },
    include: {
      blogPost: {
        include: {
          categories: {
            include: {
              category: {
                include: {
                  translations: true
                }
              }
            }
          }
        }
      }
    }
  });
  console.log(JSON.stringify(e, null, 2));

  const faq = await prisma.faq.count({ where: { blogPostId: e?.blogPostId, language: "TR" as any } });
  console.log("TR FAQs: ", faq);
}
main().finally(() => prisma.$disconnect());
