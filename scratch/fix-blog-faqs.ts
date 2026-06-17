import "dotenv/config";
import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma";

const ARTIFACTS_DIR = "C:/Users/Bozel/.gemini/antigravity-ide/brain/53ceab3f-f80b-4278-80cb-c07bda5067e8/artifacts";

const BLOGS = [
  { file: "kirpik-uzatma-antalya-v3.md", slug: "kirpik-uzatma-antalya" },
  { file: "ipek-kirpik-lara.md", slug: "ipek-kirpik-lara" },
  { file: "hybrid-lashes-guzeloba.md", slug: "hybrid-lashes-guzeloba" },
  { file: "volume-lashes-antalya.md", slug: "volume-lashes-antalya" },
  { file: "kalici-oje-antalya.md", slug: "kalici-oje-antalya" },
  { file: "biab-tirnak-antalya.md", slug: "biab-tirnak-antalya" },
  { file: "guzeloba-nail-studio.md", slug: "guzeloba-nail-studio" },
  { file: "kas-laminasyonu-lara.md", slug: "kas-laminasyonu-lara" },
  { file: "guzeloba-guzellik-salonu.md", slug: "guzeloba-guzellik-salonu" },
  { file: "antalya-guzellik-trendleri.md", slug: "antalya-guzellik-trendleri" },
];

function parseFaqs(content: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];

  // Find FAQ section
  const faqStart = content.indexOf("## SIKÇA SORULAN SORULAR");
  if (faqStart === -1) return faqs;

  const faqSection = content.substring(faqStart);
  
  // Match pattern: **N. Question?**\nAnswer text
  const regex = /\*\*\d+\.\s+(.*?)\*\*\s*\n([\s\S]*?)(?=\n\*\*\d+\.|---|\n##|$)/g;
  let match;
  
  while ((match = regex.exec(faqSection)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim();
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}

async function main() {
  let totalInserted = 0;

  for (const blog of BLOGS) {
    const mdPath = path.join(ARTIFACTS_DIR, blog.file);
    if (!fs.existsSync(mdPath)) {
      console.log(`SKIP: ${blog.file} not found`);
      continue;
    }

    const content = fs.readFileSync(mdPath, "utf-8");
    const faqs = parseFaqs(content);

    // Find blogPostId
    const translation = await prisma.blogPostTranslation.findFirst({
      where: { slug: blog.slug, language: "TR" }
    });

    if (!translation) {
      console.log(`SKIP: No translation for ${blog.slug}`);
      continue;
    }

    const blogPostId = translation.blogPostId;

    // Check existing FAQs
    const existingFaqs = await prisma.faq.count({
      where: { blogPostId }
    });

    if (existingFaqs > 0) {
      console.log(`SKIP: ${blog.slug} already has ${existingFaqs} FAQs`);
      continue;
    }

    // Insert FAQs
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

    console.log(`${blog.slug}: ${faqs.length} FAQ eklendi`);
    totalInserted += faqs.length;
  }

  console.log(`\nTOPLAM: ${totalInserted} FAQ kaydı eklendi`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
