import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { LogOut, Calendar, Settings, Users, Scissors, Tags, MapPin } from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import Link from 'next/link';
import AddCategoryForm from '@/components/admin/AddCategoryForm';
import CategoryList from '@/components/admin/CategoryList';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminCategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Kategorileri veritabanından çek (Tüm diller dahil)
  const categories = await prisma.serviceCategory.findMany({
    where: { isDeleted: false },
    orderBy: { order: 'asc' },
    include: {
      translations: true
    }
  });

  const formattedCategories = categories.map(c => ({
    id: c.id,
    isActive: c.isActive,
    image: c.image,
    order: c.order,
    translations: c.translations.map(t => ({
      id: t.id,
      language: t.language,
      name: t.name,
      slug: t.slug,
      description: t.description || '',
      seoTitle: t.seoTitle || '',
      seoDesc: t.seoDesc || '',
      canonical: t.canonical || '',
      ogTitle: t.ogTitle || '',
      ogDesc: t.ogDesc || '',
      ogImage: t.ogImage || '',
      index: t.index,
      sitemap: t.sitemap
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
          <h1 className="text-2xl font-bold text-gray-800">Kategoriler</h1>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Kategoriler & SEO</h2>
                <p className="text-sm text-gray-500 mt-1">Zengin içerikli kategori sayfaları oluşturun ve Google'da üst sıralara çıkın.</p>
              </div>
              <AddCategoryForm />
            </div>

            <CategoryList categories={formattedCategories} />
          </div>
        </main>
      </div>
    </div>
  );
}
