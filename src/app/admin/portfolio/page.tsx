import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PortfolioClient from './PortfolioClient';

export default async function AdminPortfolioPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Veritabanından portföy çalışmalarını translations ile çek
  const items = await prisma.portfolioItem.findMany({
    include: {
      translations: true,
    },
    orderBy: { order: 'asc' },
  });

  const formattedItems = items.map(item => ({
    id: item.id,
    beforeImage: item.beforeImage,
    afterImage: item.afterImage,
    category: item.category,
    isFeatured: item.isFeatured,
    isActive: item.isActive,
    order: item.order,
    createdAt: item.createdAt.toISOString(),
    translations: item.translations.map(t => ({
      id: t.id,
      language: t.language,
      title: t.title,
      description: t.description,
    })),
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">Öncesi / Sonrası Portföyü</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Before / After Çalışma Portföyü</h2>
              <p className="text-sm text-gray-500 mt-1">Stüdyonuzda yapılan işlemlerin öncesi ve sonrası görsellerini yükleyin, sıralamasını belirleyin ve diller bazında başlık/açıklama ekleyin.</p>
            </div>
            
            <PortfolioClient initialItems={formattedItems} />
          </div>
        </main>
      </div>
    </div>
  );
}
