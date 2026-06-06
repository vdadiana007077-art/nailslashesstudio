import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { prisma } from '../src/lib/prisma';

async function main() {
  const templates = await prisma.emailTemplate.findMany();
  console.log("=== EMAIL TEMPLATES IN DATABASE ===");
  for (const t of templates) {
    console.log(`\nKey: ${t.key}`);
    console.log(`Name: ${t.name}`);
    console.log(`Is Active: ${t.isActive}`);
    console.log(`Subject length: ${t.subject.length}`);
    console.log(`Subject preview: ${t.subject.substring(0, 100)}`);
    console.log(`Body length: ${t.body.length}`);
    console.log(`Body preview: ${t.body.substring(0, 200)}`);
    
    // JSON parse test
    try {
      const parsedS = JSON.parse(t.subject);
      const parsedB = JSON.parse(t.body);
      console.log(`JSON Check: SUCCESS! Keys in Subject: ${Object.keys(parsedS).join(', ')}`);
    } catch (e) {
      console.log(`JSON Check: FAILED! (Not a valid JSON)`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
