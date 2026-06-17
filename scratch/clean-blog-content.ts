import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const translations = await prisma.blogPostTranslation.findMany({
    where: { language: "TR" }
  });

  let updatedCount = 0;

  for (const t of translations) {
    let content = t.content;

    // 1. GÖRSEL KULLANIM BİLGİLERİ bloğunu sil (--- işaretine kadar veya bir sonraki H2'ye kadar)
    // Önce "## GÖRSEL KULLANIM BİLGİLERİ" başlığını bul
    const gorselRegex = /## GÖRSEL KULLANIM BİLGİLERİ[\s\S]*?(?=## |$)/g;
    content = content.replace(gorselRegex, "");

    // 2. METADATA bloğunu sil
    const metaRegex = /## METADATA & SEO BİLGİLERİ[\s\S]*?(?=## |$)/g;
    content = content.replace(metaRegex, "");

    // 3. İçinde "AI Prompt", "Hero Görsel", "Thumbnail Görsel" geçen herhangi bir paragraf veya liste elemanı varsa sil
    const strayMetaRegex = /(\*\*\d+\.\s+Hero Görsel|\*\*\d+\.\s+Thumbnail Görsel)[\s\S]*?(?=## |$)/g;
    content = content.replace(strayMetaRegex, "");

    // 4. "---" leri temizle
    content = content.replace(/^---\s*$/gm, "");

    // 5. Boşlukları toparla
    content = content.trim();

    if (content !== t.content) {
      await prisma.blogPostTranslation.update({
        where: { id: t.id },
        data: { content }
      });
      console.log(`Cleaned content for: ${t.slug}`);
      updatedCount++;
    }
  }

  console.log(`\nTotal updated: ${updatedCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
