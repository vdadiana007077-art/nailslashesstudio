import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pages = await prisma.page.findMany({ include: { translations: true } });
    let updated = 0;

    for (const page of pages) {
      const slugs = page.translations.map(t => t.slug);
      let newGroup = null;

      if (slugs.includes('iletisim') || slugs.includes('contact') || slugs.includes('kontakt')) newGroup = 'CONTACT';
      else if (slugs.includes('hizmetler') || slugs.includes('services') || slugs.includes('uslugi') || slugs.includes('uslugi-en')) newGroup = 'SERVICES';
      else if (slugs.includes('galeri') || slugs.includes('gallery')) newGroup = 'GALLERY';
      else if (slugs.includes('portfolio') || slugs.includes('portfolyo')) newGroup = 'PORTFOLIO';
      else if (slugs.includes('booking') || slugs.includes('randevu')) newGroup = 'BOOKING';
      else if (slugs.includes('blog')) newGroup = 'BLOG';

      if (newGroup && page.pageGroup !== newGroup) {
        await prisma.page.update({ where: { id: page.id }, data: { pageGroup: newGroup } });
        updated++;
      }
    }

    return NextResponse.json({ success: true, updated, pages: pages.map(p => ({ id: p.id, group: p.pageGroup, slugs: p.translations.map(t=>t.slug) })) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
