import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { marked } from "marked";

async function main() {
  const translation = await prisma.blogPostTranslation.findFirst({
    where: { slug: "biab-tirnak-antalya", language: "TR" }
  });

  if (!translation) {
    console.error("Not found");
    return;
  }

  // Sadece eğer zaten HTML değilse (yani içerisinde <h2> vb yoksa)
  // Fakat markdown ise, <h2> string halinde yoktur, direkt parse edelim.
  const htmlContent = await marked.parse(translation.content);

  await prisma.blogPostTranslation.update({
    where: { id: translation.id },
    data: { content: htmlContent }
  });

  console.log("Updated TR BIAB to HTML!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
