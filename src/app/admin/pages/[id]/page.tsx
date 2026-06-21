import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
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
      include: { translations: true, menuItems: true },
    });

    if (!page) {
      redirect('/admin/pages');
    }
  }

  const serializedPage = page ? {
    id: page.id,
    isActive: page.isActive,
    pageGroup: page.pageGroup,
    menuItems: page.menuItems.map(m => ({ menuType: m.menuType, isActive: m.isActive })),
    translations: page.translations.map(t => ({
      id: t.id,
      language: t.language,
      slug: t.slug,
      title: t.title,
      h1Title: t.h1Title,
      editorTitle: t.editorTitle,
      introText: t.introText,
      content: t.content,
      headerImage: t.headerImage,
      thumbnailImage: t.thumbnailImage,
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
    <AdminShell title="Sayfa Düzenleme">
      <PageEditClient page={serializedPage} isNew={isNew} />
    </AdminShell>
  );
}