import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { seedEmailTemplates } from '../src/app/actions/email-template';

async function main() {
  console.log("Starting seed of email templates...");
  const result = await seedEmailTemplates();
  console.log("Seed result:", result);
}

main().catch(console.error);
