import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PageEditClient from './PageEditClient';

export default async function PageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token || token.value !== 'authenticated') {
    redirect('/admin/login');
  }

  const isNew = id === 'new';

  let page = null;
  if (!isNew) {
    page = await prisma.page.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!page) {
      redirect('/admin/pages');
    }
  }

  const serializedPage = page ? {
    id: page.id,
    isActive: page.isActive,
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
  } : null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <PageEditClient page={serializedPage} isNew={isNew} />
      </div>
    </div>
  );
}
