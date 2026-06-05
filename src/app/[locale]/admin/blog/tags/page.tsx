import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import BlogTagsClient from './BlogTagsClient';

export default async function AdminBlogTagsPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Tüm etiketleri çevirileriyle birlikte çek
  const tags = await prisma.blogTag.findMany({
    include: {
      translations: true,
    },
    orderBy: { id: 'desc' },
  });

  const formattedTags = tags.map(tag => ({
    id: tag.id,
    isActive: tag.isActive,
    translations: tag.translations.map(t => ({
      id: t.id,
      language: t.language,
      name: t.name,
      slug: t.slug,
    })),
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">Blog Etiketleri</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Çok Dilli Blog Etiketleri</h2>
              <p className="text-sm text-gray-500 mt-1">Blog yazılarınızı etiketleyerek SEO ve kullanıcı deneyimini geliştirin.</p>
            </div>
            
            <BlogTagsClient initialTags={formattedTags} />
          </div>
        </main>
      </div>
    </div>
  );
}
