import "dotenv/config";
import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma";

const ARTIFACT_PATH = "C:/Users/Bozel/.gemini/antigravity-ide/brain/53ceab3f-f80b-4278-80cb-c07bda5067e8/artifacts/biab-tirnak-antalya.md";
const SLUG = "biab-tirnak-antalya";

async function main() {
  const content = fs.readFileSync(ARTIFACT_PATH, "utf-8");

  // Extract SEO Metadata
  const seoTitleMatch = content.match(/- \*\*SEO Title:\*\* (.*)/);
  const metaDescMatch = content.match(/- \*\*Meta Description:\*\* (.*)/);
  const ogTitleMatch = content.match(/- \*\*OG Title:\*\* (.*)/);
  const ogDescMatch = content.match(/- \*\*OG Description:\*\* (.*)/);

  const seoTitle = seoTitleMatch ? seoTitleMatch[1].trim() : "";
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";
  const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : "";
  const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : "";

  // Extract Main Content
  const parts = content.split("---");
  // parts[0] is empty, parts[1] is slug frontmatter, parts[2] is METADATA, parts[3] is main content, parts[4] is FAQs
  let mainContent = parts[3].trim();

  // Extract FAQs
  const faqSection = parts[4];
  const faqs = [];
  if (faqSection) {
    const qMatches = faqSection.matchAll(/\*\*\d+\.\s+(.*?)\*\*\n(.*?)(?=\n\*\*\d+\.||$)/gs);
    for (const match of qMatches) {
      faqs.push({
        question: match[1].trim(),
        answer: match[2].trim(),
        language: "TR" as any
      });
    }
  }

  // Update DB
  const translation = await prisma.blogPostTranslation.findFirst({
    where: { slug: SLUG, language: "TR" }
  });

  if (!translation) {
    console.error(`Post not found with slug: ${SLUG}`);
    return;
  }

  await prisma.blogPostTranslation.update({
    where: { id: translation.id },
    data: {
      content: mainContent,
      seoTitle,
      seoDesc: metaDesc,
      ogTitle,
      ogDesc
    }
  });

  const blogPostId = translation.blogPostId;

  // Delete old FAQs and insert new
  await prisma.faq.deleteMany({ where: { blogPostId } });
  
  for (let i = 0; i < faqs.length; i++) {
    await prisma.faq.create({
      data: {
        question: faqs[i].question,
        answer: faqs[i].answer,
        language: "TR",
        blogPostId,
        order: i,
        isActive: true,
        schemaActive: true
      }
    });
  }

  console.log(`Successfully updated ${SLUG}`);
  console.log(`Main content length: ${mainContent.length} chars`);
  console.log(`FAQs inserted: ${faqs.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
