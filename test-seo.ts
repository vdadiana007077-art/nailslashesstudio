import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const pages = await prisma.page.findMany({
      where: { pageGroup: 'SYSTEM' },
      include: { translations: true }
    });
    console.log("Pages found:", pages.length);
  } catch (error) {
    console.error("Prisma error:", error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
