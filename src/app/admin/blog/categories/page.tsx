import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import BlogCategoriesClient from './BlogCategoriesClient';

export default async function AdminBlogCategoriesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
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
    <AdminShell title="Blog Kategorileri">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Blog Kategori & SEO Yönetimi</h2>
              <p className="text-sm text-gray-500 mt-1">Blog yazılarını gruplandırmak için kategoriler ekleyin, dillerini ve SEO alanlarını düzenleyin.</p>
            </div>
            
            <BlogCategoriesClient initialCategories={formattedCategories} />
          </div>
    </AdminShell>
  );
}
