import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// Mevcut blog slugları ile yeni (bizim oluşturduğumuz) blog ID'leri
// Tanılamadan gelen veriler:
const NEW_BLOG_IDS = [
  "2ef65724-d6fe-43bb-83b1-591f9299d5e8", // kirpik-uzatma-antalya
  "5254c78f-55de-4fe0-8f1d-5a824a6880b4", // ipek-kirpik-lara
  "8d1c0cd1-2b4d-445f-b14b-8a11a15412bc", // hybrid-lashes-guzeloba
  "fffb2608-4b69-4522-8c8e-c0dc2c55301b", // volume-lashes-antalya
  "bf65513d-0829-4640-bc0d-96fa59ea6d64", // kalici-oje-antalya
  "91128683-5e88-4328-8eee-6cfc8df9e10a", // biab-tirnak-antalya
  "cd35c3d1-4db3-494e-82fc-6f1deff569dd", // guzeloba-nail-studio
  "de1f1761-c8f8-4c77-9dea-da1160177228", // kas-laminasyonu-lara
  "260465c4-6ee1-4e26-9bb8-e00d91347cff", // guzeloba-guzellik-salonu
  "55054c9d-3c45-4a6a-ba03-47a61e4e649c", // antalya-guzellik-trendleri
];

// Import scriptinin oluşturduğu YANLIŞ duplicate kategori ID'leri
const DUPLICATE_CAT_IDS = [
  "82af8617-61be-46a1-904b-1bd5d14250f3", // eyelash-extensions (duplikat)
  "6f8d7809-8148-4429-b622-74a67c785fcc", // nail-care-biab (duplikat)
  "a0f01943-577e-4088-92e1-16a047a7f2bc", // brow-styling (duplikat)
  "448f45f4-9f9e-48bb-836e-4b10280e0d25", // brows-beauty (duplikat)
  "6b9198f9-8103-4527-b66e-29bd1a1681ee", // beauty-tips-guides (duplikat)
];

// Mevcut (doğru) kategori ID haritası
const CORRECT_CATEGORY_MAP: Record<string, string> = {
  "kirpik-uzatma-antalya":   "52703161-9052-4eec-a9ab-f5b57275ef79", // kirpik-uzatma (eyelash-extensions EN)
  "ipek-kirpik-lara":        "52703161-9052-4eec-a9ab-f5b57275ef79",
  "hybrid-lashes-guzeloba":  "52703161-9052-4eec-a9ab-f5b57275ef79",
  "volume-lashes-antalya":   "52703161-9052-4eec-a9ab-f5b57275ef79",
  "kalici-oje-antalya":      "a85d253f-9593-48ca-b35f-11efbd88059a", // tirnak-bakimi-ve-biab (nail-care-and-biab EN)
  "biab-tirnak-antalya":     "a85d253f-9593-48ca-b35f-11efbd88059a",
  "guzeloba-nail-studio":    "a85d253f-9593-48ca-b35f-11efbd88059a",
  "kas-laminasyonu-lara":    "ca2c2553-4911-4050-904e-a7eeb86a367c", // kas-ve-guzellik (brows-beauty EN)
  "guzeloba-guzellik-salonu":"ca2c2553-4911-4050-904e-a7eeb86a367c",
  "antalya-guzellik-trendleri":"ca2c2553-4911-4050-904e-a7eeb86a367c", // Genel güzellik → Brows & Beauty
};

async function main() {
  console.log("=== AŞAMA 1: Slug'lardaki backtick'leri temizle ===");
  for (const blogId of NEW_BLOG_IDS) {
    const translations = await prisma.blogPostTranslation.findMany({
      where: { blogPostId: blogId }
    });
    for (const t of translations) {
      const cleanSlug = t.slug.replace(/`/g, "");
      if (cleanSlug !== t.slug) {
        await prisma.blogPostTranslation.update({
          where: { id: t.id },
          data: { slug: cleanSlug }
        });
        console.log(`  Fixed slug: "${t.slug}" → "${cleanSlug}"`);
      }
    }
    
    // Image path'lerindeki backtick'leri de temizle
    const post = await prisma.blogPost.findUnique({ where: { id: blogId } });
    if (post?.image?.includes("`")) {
      const cleanImage = post.image.replace(/`/g, "");
      await prisma.blogPost.update({
        where: { id: blogId },
        data: { image: cleanImage }
      });
      console.log(`  Fixed image: "${post.image}" → "${cleanImage}"`);
    }
  }

  console.log("\n=== AŞAMA 2: Kategori bağlantılarını düzelt ===");
  for (const blogId of NEW_BLOG_IDS) {
    const translations = await prisma.blogPostTranslation.findMany({
      where: { blogPostId: blogId }
    });
    const slug = translations[0]?.slug.replace(/`/g, "");
    const correctCatId = CORRECT_CATEGORY_MAP[slug];
    
    if (!correctCatId) {
      console.log(`  SKIP: No mapping for ${slug}`);
      continue;
    }

    // Mevcut kategori bağlantılarını sil
    await prisma.blogPostCategory.deleteMany({
      where: { blogPostId: blogId }
    });

    // Doğru kategori bağlantısını ekle
    await prisma.blogPostCategory.create({
      data: {
        blogPostId: blogId,
        categoryId: correctCatId
      }
    });
    console.log(`  ${slug} → categoryId: ${correctCatId}`);
  }

  console.log("\n=== AŞAMA 3: Canonical URL'leri güncelle ===");
  // Doğru canonical URL'ler: mevcut kategori sisteminin TR slug'ını kullanarak
  const CANONICAL_MAP: Record<string, string> = {
    "kirpik-uzatma-antalya": "https://nailslashesstudio.com/tr/blog/kirpik-uzatma/kirpik-uzatma-antalya",
    "ipek-kirpik-lara": "https://nailslashesstudio.com/tr/blog/kirpik-uzatma/ipek-kirpik-lara",
    "hybrid-lashes-guzeloba": "https://nailslashesstudio.com/tr/blog/kirpik-uzatma/hybrid-lashes-guzeloba",
    "volume-lashes-antalya": "https://nailslashesstudio.com/tr/blog/kirpik-uzatma/volume-lashes-antalya",
    "kalici-oje-antalya": "https://nailslashesstudio.com/tr/blog/tirnak-bakimi-ve-biab/kalici-oje-antalya",
    "biab-tirnak-antalya": "https://nailslashesstudio.com/tr/blog/tirnak-bakimi-ve-biab/biab-tirnak-antalya",
    "guzeloba-nail-studio": "https://nailslashesstudio.com/tr/blog/tirnak-bakimi-ve-biab/guzeloba-nail-studio",
    "kas-laminasyonu-lara": "https://nailslashesstudio.com/tr/blog/kas-ve-guzellik/kas-laminasyonu-lara",
    "guzeloba-guzellik-salonu": "https://nailslashesstudio.com/tr/blog/kas-ve-guzellik/guzeloba-guzellik-salonu",
    "antalya-guzellik-trendleri": "https://nailslashesstudio.com/tr/blog/kas-ve-guzellik/antalya-guzellik-trendleri",
  };
  
  for (const blogId of NEW_BLOG_IDS) {
    const translations = await prisma.blogPostTranslation.findMany({
      where: { blogPostId: blogId, language: "TR" }
    });
    for (const t of translations) {
      const cleanSlug = t.slug.replace(/`/g, "");
      const canonical = CANONICAL_MAP[cleanSlug];
      if (canonical && canonical !== t.canonical) {
        await prisma.blogPostTranslation.update({
          where: { id: t.id },
          data: { canonical }
        });
        console.log(`  ${cleanSlug} canonical → ${canonical}`);
      }
    }
  }

  console.log("\n=== AŞAMA 4: OG Image backtick temizliği ===");
  for (const blogId of NEW_BLOG_IDS) {
    const translations = await prisma.blogPostTranslation.findMany({
      where: { blogPostId: blogId }
    });
    for (const t of translations) {
      if (t.ogImage?.includes("`")) {
        const cleanOgImage = t.ogImage.replace(/`/g, "");
        await prisma.blogPostTranslation.update({
          where: { id: t.id },
          data: { ogImage: cleanOgImage }
        });
        console.log(`  Fixed ogImage for ${t.slug}`);
      }
    }
  }

  console.log("\n=== AŞAMA 5: Duplicate kategorileri temizle ===");
  for (const catId of DUPLICATE_CAT_IDS) {
    // Önce çevirilerini sil
    await prisma.blogCategoryTranslation.deleteMany({
      where: { categoryId: catId }
    });
    // Sonra kategoriyi sil
    await prisma.blogCategory.deleteMany({
      where: { id: catId }
    });
    console.log(`  Deleted duplicate category: ${catId}`);
  }

  console.log("\n=== TAMAMLANDI ===");

  // Doğrulama: son durumu göster
  console.log("\n=== DOĞRULAMA ===");
  for (const blogId of NEW_BLOG_IDS) {
    const t = await prisma.blogPostTranslation.findFirst({
      where: { blogPostId: blogId, language: "TR" },
      include: {
        blogPost: {
          include: {
            categories: {
              include: {
                category: {
                  include: { translations: { where: { language: "TR" } } }
                }
              }
            }
          }
        }
      }
    });
    if (t) {
      const catSlug = t.blogPost.categories[0]?.category.translations[0]?.slug || "NO_CAT";
      console.log(`${t.slug} | cat: ${catSlug} | canonical: ${t.canonical?.substring(0, 80)}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
