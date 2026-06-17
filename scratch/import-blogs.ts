import "dotenv/config";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { prisma } from "../src/lib/prisma";

const ARTIFACTS_DIR = "C:/Users/Bozel/.gemini/antigravity-ide/brain/53ceab3f-f80b-4278-80cb-c07bda5067e8/artifacts";
const MEDIA_DIR = "C:/Users/Bozel/.gemini/antigravity-ide/brain/53ceab3f-f80b-4278-80cb-c07bda5067e8";
const PUBLIC_UPLOADS_DIR = path.join(__dirname, "../public/uploads/blogs");

if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
  fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
}

// categorySlug ve Isimleri
const CATEGORY_MAP: Record<string, { slug: string; name: string }> = {
  "Eyelash Extensions": { slug: "eyelash-extensions", name: "Eyelash Extensions" },
  "Kirpik Tasarımı & Bakımı": { slug: "eyelash-extensions", name: "Eyelash Extensions" },
  "Nail Care & BIAB": { slug: "nail-care-biab", name: "Nail Care & BIAB" },
  "Brow Styling & Laminasyon": { slug: "brow-styling", name: "Brow Styling" },
  "Brow Styling": { slug: "brow-styling", name: "Brow Styling" },
  "Brows & Beauty": { slug: "brows-beauty", name: "Brows & Beauty" },
  "Beauty Tips & Guides": { slug: "beauty-tips-guides", name: "Beauty Tips & Guides" },
};

const BLOGS = [
  { file: "kirpik-uzatma-antalya-v3.md", mediaPrefix: "kirpik_uzatma_hero_v3", thumbPrefix: "kirpik_uzatma_thumb_v3" },
  { file: "ipek-kirpik-lara.md", mediaPrefix: "ipek_kirpik_lara_hero_v3", thumbPrefix: "ipek_kirpik_lara_thumb_v3" },
  { file: "hybrid-lashes-guzeloba.md", mediaPrefix: "hybrid_lashes_guzeloba_hero_v3", thumbPrefix: "hybrid_lashes_guzeloba_thumb_v3" },
  { file: "volume-lashes-antalya.md", mediaPrefix: "volume_lashes_antalya_hero_v3", thumbPrefix: "volume_lashes_antalya_thumb_v3" },
  { file: "kalici-oje-antalya.md", mediaPrefix: "kalici_oje_antalya_hero_v3", thumbPrefix: "kalici_oje_antalya_thumb_v3" },
  { file: "biab-tirnak-antalya.md", mediaPrefix: "biab_tirnak_antalya_hero", thumbPrefix: "biab_tirnak_antalya_thumb" },
  { file: "guzeloba-nail-studio.md", mediaPrefix: "guzeloba_nail_studio_hero", thumbPrefix: "guzeloba_nail_studio_thumb" },
  { file: "kas-laminasyonu-lara.md", mediaPrefix: "kas_laminasyonu_lara_hero", thumbPrefix: "kas_laminasyonu_lara_thumb" },
  { file: "guzeloba-guzellik-salonu.md", mediaPrefix: "guzeloba_guzellik_salonu_hero", thumbPrefix: "guzeloba_guzellik_salonu_thumb" },
  { file: "antalya-guzellik-trendleri.md", mediaPrefix: "antalya_guzellik_trendleri_hero", thumbPrefix: "antalya_guzellik_trendleri_thumb" },
];

function extractMeta(content: string, key: string) {
  const regex = new RegExp(`- \\*\\*${key}:\\*\\* (.*)`);
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

async function convertImage(sourcePath: string, destFileName: string, width: number, height: number): Promise<string> {
  const targetPath = path.join(PUBLIC_UPLOADS_DIR, destFileName);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`Source image not found: ${sourcePath}`);
    return "";
  }
  await sharp(sourcePath)
    .resize(width, height)
    .webp({ quality: 85 })
    .toFile(targetPath);
  return `/uploads/blogs/${destFileName}`;
}

async function ensureCategory(categoryName: string) {
  const catInfo = CATEGORY_MAP[categoryName] || CATEGORY_MAP["Beauty Tips & Guides"];
  let cat = await prisma.blogCategoryTranslation.findFirst({
    where: { slug: catInfo.slug, language: "TR" as any }
  });

  if (!cat) {
    const newCat = await prisma.blogCategory.create({
      data: {
        isActive: true,
        translations: {
          create: {
            language: "TR" as any,
            name: catInfo.name,
            slug: catInfo.slug,
            seoTitle: catInfo.name,
            seoDesc: catInfo.name
          }
        }
      }
    });
    return newCat.id;
  }
  return cat.categoryId;
}

async function main() {
  const mediaFiles = fs.readdirSync(MEDIA_DIR).filter(f => f.endsWith(".png") || f.endsWith(".webp"));

  for (const blog of BLOGS) {
    const mdPath = path.join(ARTIFACTS_DIR, blog.file);
    if (!fs.existsSync(mdPath)) {
      console.warn(`Markdown file not found: ${mdPath}`);
      continue;
    }

    const content = fs.readFileSync(mdPath, "utf-8");

    // Extract Meta
    const categoryRaw = extractMeta(content, "Kategori");
    const slugRaw = extractMeta(content, "URL").replace("/", "");
    const seoTitle = extractMeta(content, "SEO Title");
    const metaDesc = extractMeta(content, "Meta Description");
    const canonicalRaw = extractMeta(content, "Canonical URL");
    const ogTitle = extractMeta(content, "OG Title");
    const ogDesc = extractMeta(content, "OG Description");
    const excerpt = extractMeta(content, "Kısa Özet");

    // Find actual image source files
    const heroSrcFile = mediaFiles.find(f => f.includes(blog.mediaPrefix) && f.endsWith(".png"));
    const thumbSrcFile = mediaFiles.find(f => f.includes(blog.thumbPrefix) && f.endsWith(".png"));

    let heroUrl = "";
    let thumbUrl = "";

    if (heroSrcFile) {
      heroUrl = await convertImage(path.join(MEDIA_DIR, heroSrcFile), `${slugRaw}-hero.webp`, 1920, 1080);
    }
    if (thumbSrcFile) {
      thumbUrl = await convertImage(path.join(MEDIA_DIR, thumbSrcFile), `${slugRaw}-thumb.webp`, 800, 600);
    }

    // Prepare Category
    const categoryId = await ensureCategory(categoryRaw);

    // Get Content body (Strip metadata section up to first regular text or H2 after the metadata)
    // Actually we can just keep the whole content or strip metadata.
    // Let's just find the first H2 that is not Metadata or Headline analysis
    const parts = content.split("---");
    const bodyContent = parts.length > 2 ? parts.slice(2).join("---").trim() : content;

    // Remove FAQs section from bodyContent since it will be schema/FAQ array
    const faqSplit = bodyContent.split("## SIKÇA SORULAN SORULAR");
    const mainContent = faqSplit[0].trim();
    const faqContent = faqSplit.length > 1 ? faqSplit[1] : "";

    // Parse FAQs
    const faqs = [];
    if (faqContent) {
      const qMatches = faqContent.matchAll(/\\*\\*\\d+\\.\\s+(.*?)\\*\\*\\n([\\s\\S]*?)(?=\\n\\*\\*\\d+\\.|\\n##|$)/g);
      for (const match of qMatches) {
        faqs.push({
          question: match[1].trim(),
          answer: match[2].trim(),
          language: "TR" as any
        });
      }
    }

    // Determine Canonical - override to ensure it matches the pattern
    const catInfo = CATEGORY_MAP[categoryRaw] || CATEGORY_MAP["Beauty Tips & Guides"];
    const canonical = `https://nailslashesstudio.com/tr/blog/${catInfo.slug}/${slugRaw}`;

    // Update or Create BlogPost
    const existingTranslation = await prisma.blogPostTranslation.findFirst({
      where: { slug: slugRaw, language: "TR" as any }
    });

    let blogPostId;

    if (existingTranslation) {
      blogPostId = existingTranslation.blogPostId;
      await prisma.blogPost.update({
        where: { id: blogPostId },
        data: {
          image: heroUrl || undefined,
          categories: {
            deleteMany: {},
            create: { categoryId }
          }
        }
      });

      await prisma.blogPostTranslation.update({
        where: { id: existingTranslation.id },
        data: {
          title: seoTitle,
          excerpt: excerpt,
          content: mainContent,
          seoTitle: seoTitle,
          seoDesc: metaDesc,
          canonical: canonical,
          ogTitle: ogTitle,
          ogDesc: ogDesc,
          ogImage: thumbUrl || undefined
        }
      });
      
      // Delete old FAQs and insert new
      await prisma.faq.deleteMany({ where: { blogPostId } });
      for (let i = 0; i < faqs.length; i++) {
        await prisma.faq.create({
          data: { ...faqs[i], blogPostId, order: i, schemaActive: true }
        });
      }

    } else {
      const newPost = await prisma.blogPost.create({
        data: {
          image: heroUrl,
          isActive: true,
          publishedAt: new Date(),
          categories: {
            create: { categoryId }
          },
          translations: {
            create: {
              language: "TR" as any,
              title: seoTitle,
              slug: slugRaw,
              excerpt: excerpt,
              content: mainContent,
              seoTitle: seoTitle,
              seoDesc: metaDesc,
              canonical: canonical,
              ogTitle: ogTitle,
              ogDesc: ogDesc,
              ogImage: thumbUrl
            }
          }
        }
      });
      blogPostId = newPost.id;
      
      for (let i = 0; i < faqs.length; i++) {
        await prisma.faq.create({
          data: { ...faqs[i], blogPostId, order: i, schemaActive: true }
        });
      }
    }
    console.log(`Imported: ${slugRaw} | Category: ${catInfo.slug}`);
  }

  console.log("ALL BLOGS IMPORTED SUCCESSFULLY");
}

main().catch(console.error).finally(() => prisma.$disconnect());
