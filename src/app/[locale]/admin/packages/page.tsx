import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PackagesClient from './PackagesClient';

export default async function AdminPackagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Veritabanından silinmemiş paketleri translations ve hizmet bağlantıları ile çek
  const packages = await prisma.package.findMany({
    where: { isDeleted: false },
    include: {
      translations: true,
      services: {
        include: {
          service: {
            include: {
              translations: { where: { language: 'TR' } }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedPackages = packages.map(p => ({
    id: p.id,
    price: Number(p.price),
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    translations: p.translations.map(t => ({
      id: t.id,
      language: t.language,
      slug: t.slug,
      name: t.name,
      description: t.description,
      seoTitle: t.seoTitle,
      seoDesc: t.seoDesc,
      canonical: t.canonical,
      ogTitle: t.ogTitle,
      ogDesc: t.ogDesc,
      ogImage: t.ogImage,
      index: t.index,
      sitemap: t.sitemap,
    })),
    services: p.services.map(s => ({
      serviceId: s.serviceId,
      quantity: s.quantity,
      name: s.service.translations[0]?.name || 'İsimsiz Hizmet',
      price: Number(s.service.price),
    })),
  }));

  // Paket oluştururken seçilebilecek aktif hizmetleri çek (TR dilli isimleriyle)
  const services = await prisma.service.findMany({
    where: { isDeleted: false, isActive: true },
    include: {
      translations: { where: { language: 'TR' } }
    }
  });

  const formattedServices = services.map(s => ({
    id: s.id,
    name: s.translations[0]?.name || 'İsimsiz Hizmet',
    price: Number(s.price),
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">Hizmet Paketleri</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Kampanyalı Hizmet Paketleri (SaaS)</h2>
              <p className="text-sm text-gray-500 mt-1">Birden fazla hizmeti indirimli fiyatla bir araya getirerek paketler oluşturun, SEO rotalarını ve içeriklerini yönetin.</p>
            </div>
            
            <PackagesClient initialPackages={formattedPackages} availableServices={formattedServices} />
          </div>
        </main>
      </div>
    </div>
  );
}
