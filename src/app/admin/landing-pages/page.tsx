import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import LandingPagesClient from './LandingPagesClient';

export default async function AdminLandingPagesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Veritabanından tüm Landing Sayfalarını (translations ile) çek
  const landingPages = await prisma.landingPage.findMany({
    where: { isDeleted: false },
    include: {
      translations: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedPages = landingPages.map(page => ({
    id: page.id,
    isActive: page.isActive,
    createdAt: page.createdAt.toISOString(),
    translations: page.translations.map(t => ({
      id: t.id,
      language: t.language,
      slug: t.slug,
      title: t.title,
      content: t.content,
      seoTitle: t.seoTitle,
      seoDesc: t.seoDesc,
      canonical: t.canonical,
      ogTitle: t.ogTitle,
      ogDesc: t.ogDesc,
      ogImage: t.ogImage,
      index: t.index,
      sitemap: t.sitemap,
    })),
  }));

  return (
    <AdminShell title="SEO Landing Pages">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">SEO Açılış Sayfaları Yönetimi</h2>
              <p className="text-sm text-gray-500 mt-1">İl/ilçe bazlı (örn: /tr/ipek-kirpik-antalya) organik aramaları hedefleyecek sayfalar oluşturun, çok dilli içeriklerini ve detaylı SEO/OG meta etiketlerini yönetin.</p>
            </div>
            
            <LandingPagesClient initialPages={formattedPages} currentLocale='tr' />
          </div>
    </AdminShell>
  );
}
