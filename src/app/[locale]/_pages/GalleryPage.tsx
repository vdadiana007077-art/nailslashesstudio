import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import GalleryClient from '@/components/layout/GalleryClient';

export default async function GalleryPageContent({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const languageEnum = locale.toUpperCase() as Language;

  // Veritabanından galeri kategorileri ve fotoğrafları çek
  let dbCategories: any[] = [];
  let dbItems: any[] = [];

  try {
    const rawCategories = await prisma.galleryCategory.findMany({
      where: { isActive: true, isDeleted: false },
      include: {
        translations: { where: { language: languageEnum } },
        _count: { select: { items: { where: { isActive: true, isDeleted: false } } } }
      },
      orderBy: { order: 'asc' }
    });
    dbCategories = rawCategories.filter(c => c._count.items > 0 || true); // tümünü göster

    const rawItems = await prisma.galleryItem.findMany({
      where: { isActive: true, isDeleted: false },
      include: {
        translations: { where: { language: languageEnum } },
        category: { include: { translations: { where: { language: languageEnum } } } }
      },
      orderBy: { order: 'asc' }
    });
    dbItems = rawItems;
  } catch (error) {
    console.error('Galeri veri çekme hatası:', error);
  }

  // Eski GalleryImage fallback (GalleryItem boşsa)
  if (dbItems.length === 0) {
    try {
      const oldImages = await prisma.galleryImage.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
      const mediaImages = await prisma.mediaItem.findMany({ where: { mimeType: { startsWith: 'image/' } }, orderBy: { createdAt: 'desc' } });

      const legacyItems = oldImages.map(img => ({
        id: img.id, imageUrl: img.url, categoryId: null, category: null,
        translations: [{ language: languageEnum, title: img.altText || 'Nails & Lashes Studio', altText: img.altText || '', description: '' }]
      }));

      mediaImages.forEach(med => {
        if (!legacyItems.some(i => i.imageUrl === med.url)) {
          legacyItems.push({
            id: med.id, imageUrl: med.url, categoryId: null, category: null,
            translations: [{ language: languageEnum, title: med.title || 'Nails & Lashes Studio', altText: med.altText || '', description: '' }]
          });
        }
      });

      dbItems = legacyItems;
    } catch (_) { /* ignore */ }
  }

  // Fallback görseller (hiç veri yoksa)
  if (dbItems.length === 0) {
    dbItems = [
      { id: 'f1', imageUrl: '/images/nail_art_1.png', categoryId: null, category: null, translations: [{ language: languageEnum, title: 'Nail Art', altText: 'Nail Art', description: '' }] },
      { id: 'f2', imageUrl: '/images/nail_art_2.png', categoryId: null, category: null, translations: [{ language: languageEnum, title: 'Manikür', altText: 'Manicure', description: '' }] },
      { id: 'f3', imageUrl: '/images/lash_art_1.png', categoryId: null, category: null, translations: [{ language: languageEnum, title: 'İpek Kirpik', altText: 'Lashes', description: '' }] },
      { id: 'f4', imageUrl: '/images/lash_art_2.png', categoryId: null, category: null, translations: [{ language: languageEnum, title: 'Kirpik Lifting', altText: 'Lash Lift', description: '' }] },
      { id: 'f5', imageUrl: '/images/luxury_salon_hero.png', categoryId: null, category: null, translations: [{ language: languageEnum, title: 'Stüdyo', altText: 'Studio', description: '' }] },
    ];
  }

  // Kategori + fotoğraf verilerini client'a uygun formata dönüştür
  const publicCategories = dbCategories.map(c => ({
    id: c.id,
    name: c.translations?.[0]?.name || 'Kategori',
    slug: c.translations?.[0]?.slug || '',
    itemCount: c._count?.items || 0,
  }));

  const publicImages = dbItems.map((item: any) => ({
    id: item.id,
    url: item.imageUrl,
    alt: item.translations?.[0]?.altText || item.translations?.[0]?.title || 'Nails & Lashes Studio',
    title: item.translations?.[0]?.title || '',
    description: item.translations?.[0]?.description || '',
    categoryId: item.categoryId || null,
    categoryName: item.category?.translations?.[0]?.name || null,
  }));

  // Page content
  const pageContent = await prisma.pageTranslation.findFirst({
    where: { language: languageEnum, page: { pageGroup: 'GALLERY', isActive: true, isDeleted: false } }
  }).catch(() => null);

  const heroTitle = pageContent?.h1Title || (locale === 'tr' ? 'Görsel Galeri' : locale === 'de' ? 'Bildergalerie' : locale === 'ru' ? 'Фотогалерея' : 'Visual Gallery');
  const introText = pageContent?.introText || (locale === 'tr'
    ? 'Tırnak sanatı, protez tırnak, kirpik ve kaş uygulamalarımızın gerçek ve taze fotoğraflarıyla çalışmalarımızı inceleyin.'
    : locale === 'de' ? 'Entdecken Sie unsere neuesten Arbeiten mit echten Fotos von Nagelkunst und Wimpernverlängerungen.'
    : locale === 'ru' ? 'Посмотрите наши последние работы: дизайн ногтей, наращивание ресниц и многое другое.'
    : 'Explore our latest work with real photos of nail art, acrylic nails, and eyelash extensions.');

  const tagText = locale === 'tr' ? 'Sanat ve Estetik' : locale === 'de' ? 'Kunst & Ästhetik' : locale === 'ru' ? 'Искусство и Эстетика' : 'Art & Aesthetics';

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#faf8f7]">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/5 rounded-full blur-3xl -z-10 animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-rose-300)]/5 rounded-full blur-3xl -z-10 animate-glow" style={{ animationDelay: '1.5s' }}></div>
      <div className="max-w-7xl mx-auto px-6 z-10">
        <div className="text-center mb-16">
          <span className="text-[var(--color-rose-600)] text-xs font-bold uppercase tracking-widest block mb-3">{tagText}</span>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-gray-950 mb-4">{heroTitle}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">{introText}</p>
        </div>
        <GalleryClient images={publicImages} categories={publicCategories} locale={locale} />
      </div>
    </main>
  );
}
