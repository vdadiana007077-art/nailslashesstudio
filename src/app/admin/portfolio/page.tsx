import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
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
    <AdminShell title="Öncesi / Sonrası Portföyü">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Before / After Çalışma Portföyü</h2>
              <p className="text-sm text-gray-500 mt-1">Stüdyonuzda yapılan işlemlerin öncesi ve sonrası görsellerini yükleyin, sıralamasını belirleyin ve diller bazında başlık/açıklama ekleyin.</p>
            </div>
            
            <PortfolioClient initialItems={formattedItems} />
          </div>
    </AdminShell>
  );
}
