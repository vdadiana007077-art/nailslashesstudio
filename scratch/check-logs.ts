import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('--- Son Audit Logları ---');
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  for (const log of logs) {
    console.log(`[${log.createdAt.toLocaleString()}] ${log.action}: ${log.details}`);
  }

  console.log('\n--- Son Mesaj Logları ---');
  const msgLogs = await prisma.messageLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  for (const log of msgLogs) {
    console.log(`[${log.createdAt.toLocaleString()}] ${log.type} (${log.status}) -> ${log.recipient}: ${log.content}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
