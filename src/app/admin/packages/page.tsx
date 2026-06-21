import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import PackagesClient from './PackagesClient';

export default async function AdminPackagesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
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
    <AdminShell title="Hizmet Paketleri">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Kampanyalı Hizmet Paketleri (SaaS)</h2>
              <p className="text-sm text-gray-500 mt-1">Birden fazla hizmeti indirimli fiyatla bir araya getirerek paketler oluşturun, SEO rotalarını ve içeriklerini yönetin.</p>
            </div>
            
            <PackagesClient initialPackages={formattedPackages} availableServices={formattedServices} />
          </div>
    </AdminShell>
  );
}
