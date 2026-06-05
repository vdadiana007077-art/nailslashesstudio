import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import FaqClient from './FaqClient';

export default async function AdminFaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Veritabanındaki FAQ listesini çek
  const faqs = await prisma.faq.findMany({
    orderBy: { order: 'asc' },
    include: {
      service: {
        include: { translations: { where: { language: 'TR' } } }
      },
      page: {
        include: { translations: { where: { language: 'TR' } } }
      }
    }
  });

  const formattedFaqs = faqs.map(f => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    language: f.language,
    isActive: f.isActive,
    order: f.order,
    schemaActive: f.schemaActive,
    pageId: f.pageId,
    serviceId: f.serviceId,
    blogPostId: f.blogPostId,
    serviceName: f.service?.translations[0]?.name || null,
    pageTitle: f.page?.translations[0]?.title || null,
  }));

  // Soru eşleştirmesi yapılabilecek Hizmetleri çek
  const services = await prisma.service.findMany({
    where: { isDeleted: false },
    include: {
      translations: { where: { language: 'TR' } }
    }
  });

  const formattedServices = services.map(s => ({
    id: s.id,
    name: s.translations[0]?.name || 'İsimsiz Hizmet',
  }));

  // Soru eşleştirmesi yapılabilecek CMS Sayfalarını çek
  const pages = await prisma.page.findMany({
    where: { isDeleted: false },
    include: {
      translations: { where: { language: 'TR' } }
    }
  });

  const formattedPages = pages.map(p => ({
    id: p.id,
    title: p.translations[0]?.title || 'İsimsiz Sayfa',
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">FAQ Sıkça Sorulan Sorular</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Çok Dilli Sıkça Sorulan Sorular</h2>
              <p className="text-sm text-gray-500 mt-1">Hizmetler ve kurumsal sayfalar için sıkça sorulan sorular ekleyin, Google FAQ schema yapılandırmalarını (structured data) otomatik üretin.</p>
            </div>
            
            <FaqClient initialFaqs={formattedFaqs} services={formattedServices} pages={formattedPages} />
          </div>
        </main>
      </div>
    </div>
  );
}
