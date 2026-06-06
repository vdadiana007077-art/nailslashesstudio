import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import BlogEditClient from './BlogEditClient';

export default async function BlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token || token.value !== 'authenticated') {
    redirect('/admin/login');
  }

  const isNew = id === 'new';

  let post = null;
  if (!isNew) {
    post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        translations: true,
        categories: true,
        tags: true,
      },
    });
    if (!post) redirect('/admin/blog');
  }

  const blogCategories = await prisma.blogCategory.findMany({
    where: { isActive: true },
    include: { translations: { where: { language: 'TR' } } },
    orderBy: { order: 'asc' },
  });

  const blogTags = await prisma.blogTag.findMany({
    where: { isActive: true },
    include: { translations: { where: { language: 'TR' } } },
  });

  const serializedPost = post ? {
    id: post.id,
    image: post.image,
    authorName: post.authorName,
    isActive: post.isActive,
    isFeatured: post.isFeatured,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString().split('T')[0] : null,
    translations: post.translations.map(t => ({
      id: t.id,
      language: t.language,
      slug: t.slug,
      title: t.title,
      excerpt: t.excerpt,
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
    categoryIds: post.categories.map(c => c.categoryId),
    tagIds: post.tags.map(t => t.tagId),
  } : null;

  const formattedCategories = blogCategories.map(c => ({
    id: c.id,
    name: c.translations[0]?.name || 'İsimsiz',
  }));

  const formattedTags = blogTags.map(t => ({
    id: t.id,
    name: t.translations[0]?.name || 'İsimsiz',
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <BlogEditClient
          post={serializedPost}
          isNew={isNew}
          categories={formattedCategories}
          tags={formattedTags}
        />
      </div>
    </div>
  );
}
