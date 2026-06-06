import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import GalleryClient from '@/components/layout/GalleryClient';

export default async function GalleryPageContent({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const languageEnum = locale.toUpperCase() as Language;

  let galleryImages: any[] = [];
  let mediaImages: any[] = [];
  try {
    galleryImages = await prisma.galleryImage.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
    mediaImages = await prisma.mediaItem.findMany({ where: { mimeType: { startsWith: 'image/' } }, orderBy: { createdAt: 'desc' } });
  } catch (error) { console.error("Galeri veri çekme hatası:", error); }

  const pageContent = await prisma.pageTranslation.findFirst({
    where: { language: languageEnum, page: { pageGroup: 'GALLERY', isActive: true, isDeleted: false } }
  });

  const heroTitle = pageContent?.h1Title || (locale === 'tr' ? 'Görsel Galeri' : 'Visual Gallery');
  const introText = pageContent?.introText || (locale === 'tr' 
    ? 'Tırnak sanatı, protez tırnak, kirpik ve kaş uygulamalarımızın gerçek ve taze fotoğraflarıyla çalışmalarımızı inceleyin.'
    : 'Explore our latest work with real photos of nail art, acrylic nails, and eyelash extensions.');

  const items = galleryImages.map(img => ({ id: img.id, url: img.url, alt: img.altText || 'Nails & Lashes Studio', title: img.altText || 'Nails & Lashes Studio' }));
  mediaImages.forEach(med => { if (!items.some(i => i.url === med.url)) items.push({ id: med.id, url: med.url, alt: med.altText || med.title || 'Nails & Lashes Studio', title: med.title || 'Nails & Lashes Studio' }); });

  const fallbacks = [
    { id: 'f1', url: '/images/nail_art_1.png', alt: 'Nail Art', title: 'Nail Art' },
    { id: 'f2', url: '/images/nail_art_2.png', alt: 'Manikür', title: 'Manicure' },
    { id: 'f3', url: '/images/lash_art_1.png', alt: 'İpek Kirpik', title: 'Lashes' },
    { id: 'f4', url: '/images/lash_art_2.png', alt: 'Kirpik Lifting', title: 'Lash Lift' },
    { id: 'f5', url: '/images/luxury_salon_hero.png', alt: 'Salon', title: 'Studio' },
  ];
  const finalImages = items.length > 0 ? items : fallbacks;

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#faf8f7]">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/5 rounded-full blur-3xl -z-10 animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-rose-300)]/5 rounded-full blur-3xl -z-10 animate-glow" style={{ animationDelay: '1.5s' }}></div>
      <div className="max-w-7xl mx-auto px-6 z-10">
        <div className="text-center mb-16">
          <span className="text-[var(--color-rose-600)] text-xs font-bold uppercase tracking-widest block mb-3">{locale === 'tr' ? 'Sanat ve Estetik' : 'Art & Aesthetics'}</span>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-gray-950 mb-4">{heroTitle}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">{introText}</p>
        </div>
        <GalleryClient images={finalImages} locale={locale} />
      </div>
    </main>
  );
}
