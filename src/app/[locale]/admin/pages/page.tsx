import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PagesClient from './PagesClient';

export default async function AdminPagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Veritabanından silinmemiş sayfaları translations ile çek
  const pages = await prisma.page.findMany({
    where: { isDeleted: false },
    include: {
      translations: true,
    },
  });

  const formattedPages = pages.map(p => ({
    id: p.id,
    isActive: p.isActive,
    createdAt: new Date().toISOString(),
    translations: p.translations.map(t => ({
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">CMS Kurumsal Sayfalar</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Kurumsal CMS Sayfa Yönetimi</h2>
              <p className="text-sm text-gray-500 mt-1">Hakkımızda, Gizlilik Sözleşmesi, İletişim vb. kurumsal sayfaları çok dilli olarak oluşturun, SEO meta alanlarını optimize edin.</p>
            </div>
            
            <PagesClient initialPages={formattedPages} currentLocale={locale} />
          </div>
        </main>
      </div>
    </div>
  );
}
