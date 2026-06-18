import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tr = await prisma.faq.count({ where: { language: 'TR' }});
  const en = await prisma.faq.count({ where: { language: 'EN' }});
  const de = await prisma.faq.count({ where: { language: 'DE' }});
  const ru = await prisma.faq.count({ where: { language: 'RU' }});
  
  const tr3 = await prisma.faq.findMany({ where: { language: 'TR' }, take: 3 });
  const en3 = await prisma.faq.findMany({ where: { language: 'EN' }, take: 3 });
  const de3 = await prisma.faq.findMany({ where: { language: 'DE' }, take: 3 });
  const ru3 = await prisma.faq.findMany({ where: { language: 'RU' }, take: 3 });
  
  console.log('TR FAQ count:', tr);
  console.log('EN FAQ count:', en);
  console.log('DE FAQ count:', de);
  console.log('RU FAQ count:', ru);
  
  console.log('TR:', tr3.map(f => f.question));
  console.log('EN:', en3.map(f => f.question));
  console.log('DE:', de3.map(f => f.question));
  console.log('RU:', ru3.map(f => f.question));
}

main().catch(console.error).finally(() => prisma.$disconnect());
