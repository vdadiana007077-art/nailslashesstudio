import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import BlogTagsClient from './BlogTagsClient';

export default async function AdminBlogTagsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
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
    <AdminShell title="Blog Etiketleri">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Çok Dilli Blog Etiketleri</h2>
              <p className="text-sm text-gray-500 mt-1">Blog yazılarınızı etiketleyerek SEO ve kullanıcı deneyimini geliştirin.</p>
            </div>
            
            <BlogTagsClient initialTags={formattedTags} />
          </div>
    </AdminShell>
  );
}
