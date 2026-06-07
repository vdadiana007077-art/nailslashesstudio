import { prisma } from '../src/lib/prisma';

async function run() {
  await prisma.setting.deleteMany({
    where: { key: { in: ['widget_active', 'widget_theme', 'widget_avatar'] } }
  });

  await prisma.setting.createMany({
    data: [
      { key: 'widget_active', value: 'true' },
      { key: 'widget_theme', value: 'rosegold' },
      { key: 'widget_avatar', value: '/images/avatar.png' },
    ]
  });

  console.log('Widget enabled and configured!');
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
