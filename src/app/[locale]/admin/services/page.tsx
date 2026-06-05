import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ServiceList from '@/components/admin/ServiceList';
import AddServiceForm from '@/components/admin/AddServiceForm';

export default async function AdminServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Kategorileri, hizmetleri ve ilişkili verileri çek
  const categories = await prisma.serviceCategory.findMany({
    where: { isDeleted: false },
    orderBy: { order: 'asc' },
    include: {
      translations: { where: { language: 'TR' } },
      services: {
        where: { isDeleted: false },
        include: {
          translations: true,
          faqs: true,
          blogPosts: true
        }
      }
    }
  });

  // İlişkilendirilecek tüm SSS ve Blogları çek
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const blogPosts = await prisma.blogPost.findMany({
    where: { isDeleted: false, isActive: true },
    include: {
      translations: { where: { language: 'TR' } }
    }
  });

  // Client formatı
  const formattedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.translations[0]?.name || 'İsimsiz Kategori',
    services: cat.services.map(s => ({
      id: s.id,
      price: s.price.toString(),
      duration: s.duration,
      image: s.image,
      isActive: s.isActive,
      faqIds: s.faqs.map(f => f.id),
      blogIds: s.blogPosts.map(bp => bp.blogPostId),
      translations: s.translations.map(t => ({
        id: t.id,
        language: t.language,
        name: t.name,
        slug: t.slug,
        description: t.description || '',
        longDescription: t.longDescription || '',
        seoTitle: t.seoTitle || '',
        seoDesc: t.seoDesc || '',
        canonical: t.canonical || '',
        ogTitle: t.ogTitle || '',
        ogDesc: t.ogDesc || '',
        ogImage: t.ogImage || '',
        index: t.index,
        sitemap: t.sitemap
      }))
    }))
  }));

  const formattedFaqs = faqs.map(f => ({
    id: f.id,
    question: f.question
  }));

  const formattedBlogs = blogPosts.map(b => ({
    id: b.id,
    title: b.translations[0]?.title || 'Başlıksız Blog'
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Hizmet Yönetimi</h1>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Tüm Hizmetler</h2>
              <p className="text-sm text-gray-500">Tüm dillerdeki detayları, görselleri, SSS ve Blog ilişkilerini yönetebilirsiniz.</p>
            </div>
            <AddServiceForm categories={formattedCategories} />
          </div>

          <ServiceList 
            categories={formattedCategories} 
            faqs={formattedFaqs} 
            blogPosts={formattedBlogs} 
          />
        </main>
      </div>
    </div>
  );
}
