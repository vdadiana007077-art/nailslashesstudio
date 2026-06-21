import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import BlogCategoryEditClient from './BlogCategoryEditClient';

export default async function BlogCategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token || token.value !== 'authenticated') {
    redirect('/admin/login');
  }

  const isNew = id === 'new';

  let category = null;
  if (!isNew) {
    category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });
    if (!category) redirect('/admin/blog/categories');
  }

  const serializedCategory = category ? {
    id: category.id,
    order: category.order,
    isActive: category.isActive,
    translations: category.translations.map(t => ({
      id: t.id,
      language: t.language,
      name: t.name,
      slug: t.slug,
      description: t.description || '',
      seoTitle: t.seoTitle || '',
      seoDesc: t.seoDesc || '',
    })),
  } : null;

  return (
    <AdminShell title="Blog Düzenleme">
        <BlogCategoryEditClient
          category={serializedCategory}
          isNew={isNew}
        />
    </AdminShell>
  );
}