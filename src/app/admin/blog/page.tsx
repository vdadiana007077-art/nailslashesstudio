import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import BlogClient from './BlogClient';

export default async function AdminBlogPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  const posts = await prisma.blogPost.findMany({
    where: { isDeleted: false },
    include: {
      translations: true,
      categories: true,
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Blog kategorilerini çek
  const blogCategories = await prisma.blogCategory.findMany({
    where: { isActive: true },
    include: { translations: { where: { language: 'TR' } } },
    orderBy: { order: 'asc' },
  });

  // Blog etiketlerini çek
  const blogTags = await prisma.blogTag.findMany({
    where: { isActive: true },
    include: { translations: { where: { language: 'TR' } } },
  });

  const formattedPosts = posts.map(p => ({
    id: p.id,
    image: p.image,
    authorName: p.authorName,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString().split('T')[0] : null,
    createdAt: p.createdAt.toISOString(),
    translations: p.translations.map(t => ({
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
    categoryIds: p.categories.map(c => c.categoryId),
    tagIds: p.tags.map(t => t.tagId),
  }));

  const formattedCategories = blogCategories.map(c => ({
    id: c.id,
    name: c.translations[0]?.name || 'İsimsiz Kategori',
  }));

  const formattedTags = blogTags.map(t => ({
    id: t.id,
    name: t.translations[0]?.name || 'İsimsiz Etiket',
  }));

  return (
    <AdminShell title="Blog Yönetimi">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Çok Dilli Blog Yazıları</h2>
              <p className="text-sm text-gray-500 mt-1">Sitenizin SEO gücünü artıracak makaleler oluşturun, yayın tarihini ayarlayın, çok dilli içeriklerini ve SEO meta etiketlerini yönetin.</p>
            </div>
            
            <BlogClient initialPosts={formattedPosts} currentLocale='tr' categories={formattedCategories} tags={formattedTags} />
          </div>
    </AdminShell>
  );
}
