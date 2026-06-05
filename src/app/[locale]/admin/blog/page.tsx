import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import BlogClient from './BlogClient';

export default async function AdminBlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">Blog Yönetimi</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Çok Dilli Blog Yazıları</h2>
              <p className="text-sm text-gray-500 mt-1">Sitenizin SEO gücünü artıracak makaleler oluşturun, yayın tarihini ayarlayın, çok dilli içeriklerini ve SEO meta etiketlerini yönetin.</p>
            </div>
            
            <BlogClient initialPosts={formattedPosts} currentLocale={locale} categories={formattedCategories} tags={formattedTags} />
          </div>
        </main>
      </div>
    </div>
  );
}
