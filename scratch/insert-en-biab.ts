import "dotenv/config";
import fs from "fs";
import { prisma } from "../src/lib/prisma";

const TR_SLUG = "biab-tirnak-antalya";
const EN_SLUG = "biab-nails-antalya";
const ARTIFACT_PATH = "C:/Users/Bozel/.gemini/antigravity-ide/brain/53ceab3f-f80b-4278-80cb-c07bda5067e8/artifacts/biab-nails-antalya.md";

async function main() {
  // 1. Find the parent BlogPost via TR translation
  const trTranslation = await prisma.blogPostTranslation.findFirst({
    where: { slug: TR_SLUG, language: "TR" }
  });

  if (!trTranslation) {
    console.error("TR post not found.");
    return;
  }
  const blogPostId = trTranslation.blogPostId;

  // 2. Read EN content
  const content = fs.readFileSync(ARTIFACT_PATH, "utf-8");

  const seoTitleMatch = content.match(/- \*\*SEO Title:\*\* (.*)/);
  const metaDescMatch = content.match(/- \*\*Meta Description:\*\* (.*)/);
  const ogTitleMatch = content.match(/- \*\*OG Title:\*\* (.*)/);
  const ogDescMatch = content.match(/- \*\*OG Description:\*\* (.*)/);

  const seoTitle = seoTitleMatch ? seoTitleMatch[1].trim() : "";
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";
  const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : "";
  const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : "";

  // The title itself can just be the SEO Title or something simple.
  // Actually, we usually take the title from the content or set it same as SEO Title.
  const title = "BIAB Nails Antalya | Stronger Natural Nails Without Extensions";

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
        language: "EN" as any
      });
    }
  }

  // 3. Ensure EN Category Translation exists
  // The TR translation uses categoryId of the TR category. We need to check if the EN category translation exists.
  // For Nail Care & BIAB.
  // We can just find the category attached to this blog post.
  const postCategories = await prisma.blogPostCategory.findFirst({
    where: { blogPostId }
  });
  if (postCategories) {
    const catId = postCategories.categoryId;
    const existingEnCat = await prisma.blogCategoryTranslation.findFirst({
      where: { categoryId: catId, language: "EN" }
    });
    if (!existingEnCat) {
      await prisma.blogCategoryTranslation.create({
        data: {
          categoryId: catId,
          language: "EN",
          name: "Nail Care & BIAB",
          slug: "nail-care-biab", // keep slug same
          seoTitle: "Nail Care & BIAB",
          seoDesc: "Nail Care & BIAB"
        }
      });
      console.log("Created EN category translation");
    }
  }

  // 4. Create or Update EN BlogPostTranslation
  const existingEnTranslation = await prisma.blogPostTranslation.findFirst({
    where: { blogPostId, language: "EN" }
  });

  const canonical = `https://nailslashesstudio.com/en/blog/nail-care-biab/${EN_SLUG}`;

  if (existingEnTranslation) {
    await prisma.blogPostTranslation.update({
      where: { id: existingEnTranslation.id },
      data: {
        title,
        slug: EN_SLUG,
        content: mainContent,
        seoTitle,
        seoDesc: metaDesc,
        canonical,
        ogTitle,
        ogDesc,
        ogImage: trTranslation.ogImage // copy thumb from TR
      }
    });
    console.log("Updated existing EN translation.");
  } else {
    await prisma.blogPostTranslation.create({
      data: {
        blogPostId,
        language: "EN",
        title,
        slug: EN_SLUG,
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
    console.log("Created new EN translation.");
  }

  // 5. Update FAQs for EN
  await prisma.faq.deleteMany({ where: { blogPostId, language: "EN" } });
  
  for (let i = 0; i < faqs.length; i++) {
    await prisma.faq.create({
      data: {
        question: faqs[i].question,
        answer: faqs[i].answer,
        language: "EN",
        blogPostId,
        order: i,
        isActive: true,
        schemaActive: true
      }
    });
  }

  console.log(`Successfully imported EN blog: ${EN_SLUG}`);
  console.log(`Main content length: ${mainContent.length} chars`);
  console.log(`FAQs inserted: ${faqs.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
