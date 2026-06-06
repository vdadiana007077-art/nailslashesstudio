import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const services = await prisma.service.findMany({
    include: {
      translations: true,
      category: { include: { translations: true } }
    }
  });
  const data = services.map(s => ({
    id: s.id,
    trName: s.translations.find(t => t.language === "TR")?.name || "UNKNOWN",
    trDesc: s.translations.find(t => t.language === "TR")?.description || "",
    categoryName: s.category.translations.find(t => t.language === "TR")?.name || "",
    existingLangs: s.translations.map(t => t.language)
  }));
  console.log(JSON.stringify(data, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
