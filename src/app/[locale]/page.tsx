import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';

export default async function HomePage({ params }: { params: { locale: string } }) {
  // `params` objesini beklemek gerekiyor Next.js 16'da
  const resolvedParams = await params;
  const locale = resolvedParams.locale.toUpperCase() as Language;

  const t = await getTranslations('Index');

  // Fetch Service Categories and Services for the current locale
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      translations: {
        where: { language: locale },
      },
      services: {
        where: { isActive: true },
        include: {
          translations: {
            where: { language: locale },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-screen flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center p-6 overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/10 rounded-full blur-3xl -z-10 animate-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-rose-300)]/10 rounded-full blur-3xl -z-10 animate-glow" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Glass Panel Container */}
        <div className="glass-panel rounded-2xl p-12 max-w-3xl w-full text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-[var(--color-rose-500)]">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 font-light">
            {t('subtitle')}
          </p>
          
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-[var(--color-rose-500)] text-white font-semibold rounded-full hover:bg-[var(--color-rose-600)] transition-all shadow-[0_0_15px_rgba(184,123,127,0.4)] hover:shadow-[0_0_25px_rgba(184,123,127,0.6)] cursor-pointer">
              {t('bookNow')}
            </button>
            <a href="#services" className="px-8 py-3 glass text-gray-700 font-medium rounded-full hover:bg-white/40 transition-all cursor-pointer">
              {t('services')}
            </a>
          </div>
        </div>
      </section>

      {/* Dynamic Services Section */}
      <section id="services" className="w-full max-w-7xl px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('services')}</h2>
          <div className="h-1 w-24 bg-[var(--color-rose-400)] mx-auto rounded-full"></div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center text-gray-500 py-12 glass-panel rounded-2xl">
            Henüz hizmet eklenmemiş.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {categories.map((category) => {
              const categoryName = category.translations[0]?.name || 'İsimsiz Kategori';
              return (
                <div key={category.id} className="flex flex-col gap-6">
                  <h3 className="text-2xl font-semibold text-[var(--color-rose-500)] border-b border-black/5 pb-2">
                    {categoryName}
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    {category.services.map((service) => {
                      const serviceName = service.translations[0]?.name || 'İsimsiz Hizmet';
                      const serviceDesc = service.translations[0]?.description || '';
                      
                      return (
                        <div key={service.id} className="glass-panel p-6 rounded-xl hover:shadow-[0_8px_30px_rgba(184,123,127,0.15)] transition-all group">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-gray-800 group-hover:text-[var(--color-rose-600)] transition-colors">
                              {serviceName}
                            </h4>
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-[var(--color-rose-500)]">
                                ₺{service.price.toString()}
                              </span>
                              <span className="text-xs text-gray-400">{service.duration} dk</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            {serviceDesc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="w-full py-24 bg-white/40 relative z-10 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Galeri</h2>
            <div className="h-1 w-24 bg-[var(--color-rose-400)] mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-500">Uygulamalarımızdan bazı örnekler</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Placeholder for Gallery Images */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-[var(--color-light-300)] rounded-xl overflow-hidden group cursor-pointer relative">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all z-10"></div>
                <div className="w-full h-full flex items-center justify-center text-[var(--color-rose-400)]/50">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <section id="reviews" className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Müşteri Yorumları</h2>
          <div className="h-1 w-24 bg-[var(--color-rose-400)] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel p-8 rounded-2xl flex flex-col gap-4 relative">
              <div className="flex gap-1 text-[#FABB05]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <p className="text-gray-600 italic">"İnanılmaz bir deneyimdi! Personel çok güler yüzlü ve işlerinde gerçekten uzmanlar. Tırnaklarım harika oldu."</p>
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-black/5">
                <div className="w-10 h-10 rounded-full bg-[var(--color-rose-300)] text-white flex items-center justify-center font-bold">M</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Mutlu Müşteri {i}</p>
                  <p className="text-xs text-gray-400">Google Yorumu</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
