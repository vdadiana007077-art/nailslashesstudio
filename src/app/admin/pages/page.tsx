import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PagesClient from './PagesClient';
import { seedPagesAndMenus } from '@/app/actions/seed-pages';

export default async function AdminPagesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Varsayılan sayfaları ve menüleri oluştur (ilk sefer)
  await seedPagesAndMenus();

  // Veritabanından silinmemiş sayfaları translations ile çek
  const pages = await prisma.page.findMany({
    where: { isDeleted: false },
    include: {
      translations: true,
      menuItems: true,
    },
  });

  const formattedPages = pages.map(p => ({
    id: p.id,
    isActive: p.isActive,
    pageGroup: p.pageGroup || null,
    menuItems: p.menuItems.map(m => ({ menuType: m.menuType, isActive: m.isActive, order: m.order })),
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
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">Menü Sayfaları</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="w-full max-w-full">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Menü Sayfaları (Yönetim Merkezi)</h2>
              <p className="text-sm text-gray-500 mt-1">Hizmetler (Transfer, Tur vb.), İletişim ve Hakkımızda gibi ana menü sayfalarını yönetin.</p>
            </div>
            
            <PagesClient initialPages={formattedPages} currentLocale='tr' />
          </div>
        </main>
      </div>
    </div>
  );
}
