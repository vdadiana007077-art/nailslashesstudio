import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { LogOut, Calendar, Settings, Users, Scissors, Tags, MapPin } from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import Link from 'next/link';
import CategoryList from '@/components/admin/CategoryList';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminCategoriesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
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
    <AdminShell title="Kategoriler">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Kategoriler & SEO</h2>
                <p className="text-sm text-gray-500 mt-1">Zengin içerikli kategori sayfaları oluşturun ve Google'da üst sıralara çıkın.</p>
              </div>
              <Link 
                href="/admin/categories/new"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-black transition-colors"
              >
                Yeni Kategori Ekle
              </Link>
            </div>

            <CategoryList categories={formattedCategories} />
          </div>
    </AdminShell>
  );
}
