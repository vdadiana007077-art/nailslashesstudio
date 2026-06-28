import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import ServicesClient from '../services/ServicesClient';
import { unstable_cache } from 'next/cache';

const getCachedServicesData = (locale: Language) => unstable_cache(
  async () => {
    const [locations, categories, staff, pageContent] = await Promise.all([
      prisma.location.findMany({
        where: { isDeleted: false, isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, address: true },
      }),
      prisma.serviceCategory.findMany({
        where: { isDeleted: false, isActive: true },
        include: {
          translations: { where: { language: locale } },
          services: {
            where: { isDeleted: false, isActive: true },
            include: { translations: { where: { language: locale } } },
            orderBy: { price: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      }),
      prisma.staff.findMany({
        where: { isDeleted: false, isActive: true },
        select: { id: true, locationId: true, services: { select: { serviceId: true } } },
      }),
      prisma.pageTranslation.findFirst({
        where: { language: locale, page: { pageGroup: 'SERVICES', isActive: true, isDeleted: false } }
      }),
    ]);

    return { locations, categories, staff, pageContent };
  },
  [`services-page-${locale}`],
  { revalidate: 3600, tags: ['services', 'pages'] }
);

export default async function ServicesPageContent({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale.toUpperCase() as Language;
  const localeStr = resolvedParams.locale;

  const { locations, categories, staff, pageContent } = await getCachedServicesData(locale)();

  const heroTitle = pageContent?.h1Title || (locale === 'TR' ? 'Hizmetlerimiz' : 'Our Services');
  const introText = pageContent?.introText || (locale === 'TR' 
    ? 'Size en uygun şubeyi seçerek hizmetlerimizi filtreleyebilir, uzman ekibimiz tarafından sunulan profesyonel güzellik işlemlerini inceleyebilirsiniz.'
    : 'You can filter our services by selecting the most suitable branch for you and examine the professional beauty treatments offered by our expert team.');

  const formattedLocations = locations.map(l => ({ id: l.id, name: l.name, address: l.address }));
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
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-gray-950 mb-4">{heroTitle}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">{introText}</p>
        </div>
        <ServicesClient locations={formattedLocations} categories={formattedCategories} staff={formattedStaff} locale={localeStr} />
      </div>
    </main>
  );
}
