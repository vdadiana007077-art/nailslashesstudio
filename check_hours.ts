import { prisma } from './src/lib/prisma';
async function main() {
  const locations = await prisma.location.findMany({ include: { workingHours: true } });
  console.dir(locations, { depth: null });
}
main().catch(console.error).finally(async () => await prisma.$disconnect());
