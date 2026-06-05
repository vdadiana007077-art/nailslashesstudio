import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import ServicesClient from './ServicesClient';

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale.toUpperCase() as Language;

  // 1. Aktif şubeleri çek
  const locations = await prisma.location.findMany({
    where: { isDeleted: false, isActive: true },
    orderBy: { name: 'asc' },
  });

  // 2. Aktif kategorileri ve içlerindeki hizmetleri çek
  const categories = await prisma.serviceCategory.findMany({
    where: { isDeleted: false, isActive: true },
    include: {
      translations: {
        where: { language: locale },
      },
      services: {
        where: { isDeleted: false, isActive: true },
        include: {
          translations: {
            where: { language: locale },
          },
        },
        orderBy: { price: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  // 3. Çalışan yetkinliklerini çek (Şubeye göre hizmet filtreleme için)
  const staff = await prisma.staff.findMany({
    where: { isDeleted: false, isActive: true },
    include: {
      services: {
        select: {
          serviceId: true,
        },
      },
    },
  });

  // Verileri temiz formatta client'a aktaralım
  const formattedLocations = locations.map(l => ({
    id: l.id,
    name: l.name,
    address: l.address,
  }));

  const formattedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.translations[0]?.name || 'İsimsiz Kategori',
    description: cat.translations[0]?.description || '',
    services: cat.services.map(s => ({
      id: s.id,
      name: s.translations[0]?.name || 'İsimsiz Hizmet',
      description: s.translations[0]?.description || '',
      duration: s.duration,
      price: s.price.toString(),
      slug: s.translations[0]?.slug || '',
      categorySlug: cat.translations[0]?.slug || '',
    })),
  }));

  const formattedStaff = staff.map(st => ({
    id: st.id,
    locationId: st.locationId || '',
    serviceIds: st.services.map(s => s.serviceId),
  }));

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#faf8f7]">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/10 rounded-full blur-3xl -z-10 animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-rose-300)]/10 rounded-full blur-3xl -z-10 animate-glow" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="max-w-6xl mx-auto px-6 z-10">
        <div className="text-center mb-12">
          <span className="text-[var(--color-rose-600)] text-xs font-bold uppercase tracking-widest block mb-3">Nails & Lashes Studio</span>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-gray-950 mb-4">Hizmetlerimiz</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Size en uygun şubeyi seçerek hizmetlerimizi filtreleyebilir, uzman ekibimiz tarafından sunulan profesyonel güzellik işlemlerini inceleyebilirsiniz.
          </p>
        </div>

        <ServicesClient 
          locations={formattedLocations} 
          categories={formattedCategories} 
          staff={formattedStaff} 
          locale={resolvedParams.locale}
        />
      </div>
    </main>
  );
}
