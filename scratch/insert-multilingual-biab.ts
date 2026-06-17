import "dotenv/config";
import fs from "fs";
import { prisma } from "../src/lib/prisma";

const TR_SLUG = "biab-tirnak-antalya";

const TARGETS = [
  {
    lang: "DE",
    slug: "biab-naegel-antalya",
    artifact: "C:/Users/Bozel/.gemini/antigravity-ide/brain/53ceab3f-f80b-4278-80cb-c07bda5067e8/artifacts/biab-naegel-antalya.md",
    categoryTranslationName: "Nail Care & BIAB"
  },
  {
    lang: "RU",
    slug: "biab-nogti-antalya",
    artifact: "C:/Users/Bozel/.gemini/antigravity-ide/brain/53ceab3f-f80b-4278-80cb-c07bda5067e8/artifacts/biab-nogti-antalya.md",
    categoryTranslationName: "Nail Care & BIAB"
  }
];

async function main() {
  const trTranslation = await prisma.blogPostTranslation.findFirst({
    where: { slug: TR_SLUG, language: "TR" }
  });

  if (!trTranslation) {
    console.error("TR post not found.");
    return;
  }
  const blogPostId = trTranslation.blogPostId;

  // Ensure Category Translations
  const postCategories = await prisma.blogPostCategory.findFirst({
    where: { blogPostId }
  });

  if (postCategories) {
    const catId = postCategories.categoryId;
    for (const target of TARGETS) {
      const existingCat = await prisma.blogCategoryTranslation.findFirst({
        where: { categoryId: catId, language: target.lang as any }
      });
      if (!existingCat) {
        await prisma.blogCategoryTranslation.create({
          data: {
            categoryId: catId,
            language: target.lang as any,
            name: target.categoryTranslationName,
            slug: "nail-care-biab",
            seoTitle: target.categoryTranslationName,
            seoDesc: target.categoryTranslationName
          }
        });
        console.log(`Created ${target.lang} category translation`);
      }
    }
  }

  // Process Each Target
  for (const target of TARGETS) {
    const content = fs.readFileSync(target.artifact, "utf-8");

    const seoTitleMatch = content.match(/- \*\*SEO Title:\*\* (.*)/);
    const metaDescMatch = content.match(/- \*\*Meta Description:\*\* (.*)/);
    const ogTitleMatch = content.match(/- \*\*OG Title:\*\* (.*)/);
    const ogDescMatch = content.match(/- \*\*OG Description:\*\* (.*)/);

    const seoTitle = seoTitleMatch ? seoTitleMatch[1].trim() : "";
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : "";
    const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : "";

    const title = seoTitle; // using SEO Title as main title for simplicity

    const parts = content.split("---");
    let mainContent = parts[3].trim();
    const faqSection = parts[4];

    const faqs = [];
    if (faqSection) {
      const qMatches = faqSection.matchAll(/\*\*\d+\.\s+(.*?)\*\*\n(.*?)(?=\n\*\*\d+\.||$)/gs);
      for (const match of qMatches) {
        faqs.push({
          question: match[1].trim(),
          answer: match[2].trim(),
          language: target.lang as any
        });
      }
    }

    const canonical = `https://nailslashesstudio.com/${target.lang.toLowerCase()}/blog/nail-care-biab/${target.slug}`;

    const existingTranslation = await prisma.blogPostTranslation.findFirst({
      where: { blogPostId, language: target.lang as any }
    });

    if (existingTranslation) {
      await prisma.blogPostTranslation.update({
        where: { id: existingTranslation.id },
        data: {
          title,
          slug: target.slug,
          content: mainContent,
          seoTitle,
          seoDesc: metaDesc,
          canonical,
          ogTitle,
          ogDesc,
          ogImage: trTranslation.ogImage
        }
      });
      console.log(`Updated existing ${target.lang} translation.`);
    } else {
      await prisma.blogPostTranslation.create({
        data: {
          blogPostId,
          language: target.lang as any,
          title,
          slug: target.slug,
          excerpt: metaDesc,
          content: mainContent,
          seoTitle,
          seoDesc: metaDesc,
          canonical,
          ogTitle,
          ogDesc,
          ogImage: trTranslation.ogImage
        }
      });
      console.log(`Created new ${target.lang} translation.`);
    }

    await prisma.faq.deleteMany({ where: { blogPostId, language: target.lang as any } });
    
    for (let i = 0; i < faqs.length; i++) {
      await prisma.faq.create({
        data: {
          question: faqs[i].question,
          answer: faqs[i].answer,
          language: target.lang as any,
          blogPostId,
          order: i,
          isActive: true,
          schemaActive: true
        }
      });
    }

    console.log(`Successfully imported ${target.lang} blog: ${target.slug}`);
    console.log(`Main content length: ${mainContent.length} chars`);
    console.log(`FAQs inserted: ${faqs.length}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
