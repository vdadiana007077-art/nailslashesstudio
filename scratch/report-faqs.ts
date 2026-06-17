import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const languages = ["TR", "EN", "DE", "RU"];
  
  // We know the post slug is 'biab-tirnak-antalya' for TR. Let's get the blogPostId first.
  const trPost = await prisma.blogPostTranslation.findFirst({
    where: { slug: "biab-tirnak-antalya", language: "TR" }
  });

  if (!trPost) {
    console.log("TR post not found");
    return;
  }
  
  const blogPostId = trPost.blogPostId;

  console.log("=== FAQ DİL RAPORU ===");

  for (const lang of languages) {
    const faqs = await prisma.faq.findMany({
      where: { blogPostId, language: lang as any },
      orderBy: { order: "asc" }
    });

    console.log(`\n${lang} FAQ Sayısı: ${faqs.length}`);
    faqs.slice(0, 3).forEach((faq, index) => {
      console.log(`  Soru ${index + 1}: ${faq.question}`);
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
