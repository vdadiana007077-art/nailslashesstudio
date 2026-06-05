import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import BlogCategoriesClient from './BlogCategoriesClient';

export default async function AdminBlogCategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Tüm blog kategorilerini çevirileriyle getir
  const categories = await prisma.blogCategory.findMany({
    include: {
      translations: true
    },
    orderBy: {
      order: 'asc'
    }
  });

  const formattedCategories = categories.map(cat => ({
    id: cat.id,
    order: cat.order,
    isActive: cat.isActive,
    translations: cat.translations.map(t => ({
      id: t.id,
      language: t.language,
      name: t.name,
      slug: t.slug,
      description: t.description || '',
      seoTitle: t.seoTitle || '',
      seoDesc: t.seoDesc || ''
    }))
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Blog Kategorileri</h1>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Blog Kategori & SEO Yönetimi</h2>
              <p className="text-sm text-gray-500 mt-1">Blog yazılarını gruplandırmak için kategoriler ekleyin, dillerini ve SEO alanlarını düzenleyin.</p>
            </div>
            
            <BlogCategoriesClient initialCategories={formattedCategories} locale={locale} />
          </div>
        </main>
      </div>
    </div>
  );
}
