import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import PortfolioClient from '../portfolio/PortfolioClient';

export default async function PortfolioPageContent({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale.toUpperCase() as Language;

  const [pageContent, items, bookingSlugs] = await Promise.all([
    prisma.pageTranslation.findFirst({
      where: { language: locale, page: { pageGroup: 'PORTFOLIO', isActive: true, isDeleted: false } }
    }),
    prisma.portfolioItem.findMany({
      where: { isActive: true },
      include: { translations: { where: { language: locale } } },
      orderBy: { order: 'asc' },
    }),
    prisma.pageTranslation.findFirst({
      where: { language: locale, page: { pageGroup: 'BOOKING', isActive: true, isDeleted: false } },
      select: { slug: true }
    }),
  ]);

  const heroTitle = pageContent?.h1Title || (locale === 'TR' ? 'Güzellik Değişimleri' : 'Beauty Transformations');
  const introText = pageContent?.introText || (locale === 'TR'
    ? 'Stüdyomuzda gerçekleştirdiğimiz işlemlerin göz alıcı sonuçlarını etkileşimli slider üzerinden öncesi ve sonrası halleriyle karşılaştırın.'
    : 'Compare the dazzling results of the procedures we perform in our studio.');

  const formattedItems = items.map(item => ({
    id: item.id, beforeImage: item.beforeImage, afterImage: item.afterImage,
    category: item.category, isFeatured: item.isFeatured,
    title: item.translations[0]?.title || 'Çalışma',
    description: item.translations[0]?.description || '',
  }));

  const localePrefix = resolvedParams.locale === 'tr' ? '' : `/${resolvedParams.locale}`;
  const bookingHref = `${localePrefix}/${bookingSlugs?.slug || 'randevu-al'}`;

  const categories = Array.from(new Set(formattedItems.map(item => item.category)));

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#faf8f7]">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/5 rounded-full blur-3xl -z-10 animate-glow"></div>
      <div className="max-w-6xl mx-auto px-6 z-10">
        <div className="text-center mb-12">
          <span className="text-[var(--color-rose-600)] text-xs font-bold uppercase tracking-widest block mb-3">Çalışmalarımız & Öncesi/Sonrası</span>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-gray-950 mb-4">{heroTitle}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">{introText}</p>
        </div>
        <PortfolioClient items={formattedItems} categories={categories} bookingHref={bookingHref} />
      </div>
    </main>
  );
}
