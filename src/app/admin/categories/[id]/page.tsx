import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import CategoryEditClient from './CategoryEditClient';

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token || token.value !== 'authenticated') {
    redirect('/admin/login');
  }

  const isNew = id === 'new';

  let category = null;
  if (!isNew) {
    category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });
    if (!category) redirect('/admin/categories');
  }

  const serializedCategory = category ? {
    id: category.id,
    order: category.order,
    isActive: category.isActive,
    image: category.image || '',
    translations: category.translations.map(t => ({
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
      sitemap: t.sitemap,
    })),
  } : null;

  return (
    <AdminShell title="Kategori Düzenleme">
        <CategoryEditClient
          category={serializedCategory}
          isNew={isNew}
        />
    </AdminShell>
  );
}