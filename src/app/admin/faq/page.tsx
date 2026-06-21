import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import FaqClient from './FaqClient';

export default async function AdminFaqPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
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
    <AdminShell title="FAQ Sıkça Sorulan Sorular">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Çok Dilli Sıkça Sorulan Sorular</h2>
              <p className="text-sm text-gray-500 mt-1">Hizmetler ve kurumsal sayfalar için sıkça sorulan sorular ekleyin, Google FAQ schema yapılandırmalarını (structured data) otomatik üretin.</p>
            </div>
            
            <FaqClient initialFaqs={formattedFaqs} services={formattedServices} pages={formattedPages} />
          </div>
    </AdminShell>
  );
}
