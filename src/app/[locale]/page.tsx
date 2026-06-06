import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';
import { Language } from '@prisma/client';
import { Sparkles, Calendar as CalendarIcon, ArrowRight, Star } from 'lucide-react';
import ServiceExplorer from '@/components/layout/ServiceExplorer';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale.toUpperCase() as Language;

  const t = await getTranslations('Index');

  const rawCategories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      translations: { where: { language: locale } },
      services: {
        where: { isActive: true },
        include: { translations: { where: { language: locale } } },
      },
    },
  });

  const categories = rawCategories.map(cat => ({
    id: cat.id,
    isActive: cat.isActive,
    order: cat.order,
    image: cat.image,
    translations: cat.translations,
    services: cat.services.map(s => ({
      id: s.id,
      categoryId: s.categoryId,
      duration: s.duration,
      price: s.price.toString(),
      image: s.image,
      isActive: s.isActive,
      translations: s.translations
    }))
  }));

  return (
    <main className="min-h-screen flex flex-col items-center bg-[var(--color-light-200)] text-[var(--color-text-main)] font-sans selection:bg-[var(--color-primary-500)] selection:text-white">
      
      {/* 🌟 HERO SECTION - LIGHT PREMIUM DESIGN */}
      <section className="relative w-full min-h-screen flex items-center justify-center p-6 md:p-12 overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[var(--color-light-200)]">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--color-primary-400)]/15 rounded-full blur-[100px] -z-10 animate-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--color-rose-300)]/15 rounded-full blur-[120px] -z-10 animate-glow" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Hero Content Grid */}
        <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center pt-24 pb-12">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--color-primary-500)]/20 bg-white/60 backdrop-blur-md mb-8 animate-fade-up text-xs font-bold text-[var(--color-primary-600)] uppercase tracking-widest shadow-sm">
              <Sparkles size={14} className="text-[var(--color-primary-500)]" /> {t('heroTag')}
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-8 leading-[1.1] animate-fade-up text-[var(--color-text-main)]">
              {t('heroTitle1')} <br />
              <span className="text-[var(--color-primary-500)] italic">{t('heroTitle2')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--color-text-muted)] font-light max-w-2xl mb-12 animate-fade-up delay-100 leading-relaxed">
              {t('subtitle') || 'Nails & Lashes Studio ile en iyi versiyonunuza kavuşun. Yenilikçi dokunuşlar, kusursuz sonuçlar.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 animate-fade-up delay-200 w-full sm:w-auto">
              <Link href="/booking" className="group flex items-center justify-center gap-3 px-10 py-5 bg-[var(--color-primary-500)] text-white font-bold rounded-full hover:bg-[var(--color-primary-600)] transition-all duration-300 shadow-[0_10px_35px_rgba(197,139,139,0.35)] hover:shadow-[0_15px_45px_rgba(197,139,139,0.5)] hover:-translate-y-0.5 cursor-pointer">
                <CalendarIcon size={18} /> {t('bookNow')}
              </Link>
              <a href="#services" className="flex items-center justify-center gap-3 px-10 py-5 glass-panel text-[var(--color-text-main)] font-bold rounded-full hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer border border-[var(--color-primary-300)]/25">
                {t('services')} <ArrowRight size={18} />
              </a>
            </div>
          </div>

          {/* Right Image/Design Column */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center animate-fade-up delay-100">
            {/* Absolute Decorative Frames */}
            <div className="absolute -inset-4 border border-[var(--color-primary-300)]/30 rounded-[3.5rem] -z-10 translate-x-3 translate-y-3"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary-300)]/20 to-transparent rounded-[3rem] -z-10"></div>
            
            {/* Floating Luxury Detail Badge */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/90 backdrop-blur-md border border-[var(--color-primary-300)]/30 rounded-full flex flex-col items-center justify-center text-center shadow-lg animate-float">
              <span className="font-serif italic font-bold text-[var(--color-primary-600)] text-lg">100%</span>
              <span className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Premium</span>
            </div>

            <img 
              src="/images/luxury_salon_hero.png" 
              alt="Lüks Nails & Lashes Studio" 
              className="w-full aspect-[4/5] object-cover rounded-[3rem] shadow-2xl border-4 border-white"
            />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float opacity-40">
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-bold">{t('scrollDown')}</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-[var(--color-primary-500)] to-transparent"></div>
        </div>
      </section>

      {/* 🌟 USABILITY SECTION - HOW IT WORKS */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-[var(--color-primary-300)]/20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-primary-400)]/20 bg-white/70 text-xs font-bold text-[var(--color-primary-600)] uppercase tracking-widest mb-4">
            {t('howItWorksTag')}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] italic tracking-tight">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-[var(--color-text-muted)] mt-4 max-w-xl mx-auto font-light">
            {t('howItWorksDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/3 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primary-400)]/30 to-transparent -z-10"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-full bg-white border border-[var(--color-primary-300)]/45 flex items-center justify-center font-serif text-3xl font-bold text-[var(--color-primary-500)] shadow-[0_8px_25px_rgba(197,139,139,0.05)] group-hover:scale-105 transition-transform duration-300 group-hover:bg-[var(--color-primary-500)] group-hover:text-white group-hover:border-transparent">
              1
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-main)] mt-6 mb-3">{t('step1Title')}</h3>
            <p className="text-[var(--color-text-muted)] text-sm font-light leading-relaxed max-w-xs">
              {t('step1Desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-full bg-white border border-[var(--color-primary-300)]/45 flex items-center justify-center font-serif text-3xl font-bold text-[var(--color-primary-500)] shadow-[0_8px_25px_rgba(197,139,139,0.05)] group-hover:scale-105 transition-transform duration-300 group-hover:bg-[var(--color-primary-500)] group-hover:text-white group-hover:border-transparent">
              2
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-main)] mt-6 mb-3">{t('step2Title')}</h3>
            <p className="text-[var(--color-text-muted)] text-sm font-light leading-relaxed max-w-xs">
              {t('step2Desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-full bg-white border border-[var(--color-primary-300)]/45 flex items-center justify-center font-serif text-3xl font-bold text-[var(--color-primary-500)] shadow-[0_8px_25px_rgba(197,139,139,0.05)] group-hover:scale-105 transition-transform duration-300 group-hover:bg-[var(--color-primary-500)] group-hover:text-white group-hover:border-transparent">
              3
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-main)] mt-6 mb-3">{t('step3Title')}</h3>
            <p className="text-[var(--color-text-muted)] text-sm font-light leading-relaxed max-w-xs">
              {t('step3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 🌟 PREMIUM SERVICES SECTION */}
      <section id="services" className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-[var(--color-primary-300)]/20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-primary-400)]/20 bg-white/70 text-xs font-bold text-[var(--color-primary-600)] uppercase tracking-widest mb-4">
            {t('servicesTag')}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] italic tracking-tight">
            {t('servicesTitle1')} <span className="text-[var(--color-primary-500)]">{t('servicesTitle2')}</span>
          </h2>
          <p className="text-[var(--color-text-muted)] mt-4 max-w-xl mx-auto font-light">
            {t('servicesDesc')}
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center text-[var(--color-text-muted)] py-24 glass-panel rounded-3xl">
            {t('noServices')}
          </div>
        ) : (
          <ServiceExplorer categories={categories} locale={locale.toLowerCase()} />
        )}
      </section>

      {/* 🌟 LUXURY GALLERY SECTION */}
      <section id="gallery" className="w-full py-24 bg-white relative z-10 border-y border-[var(--color-primary-300)]/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-primary-400)]/20 bg-[var(--color-light-200)] text-xs font-bold text-[var(--color-primary-600)] uppercase tracking-widest mb-4">
              {t('galleryTag')}
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] italic tracking-tight">
              {t('galleryTitle1')} <span className="text-[var(--color-primary-500)]">{t('galleryTitle2')}</span>
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-xl mt-4 font-light">
              {t('galleryDesc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { src: "/images/nail_art_1.png", title: "Minimal Nail Art" },
              { src: "/images/nail_art_2.png", title: "Luxury Wedding Manicure", offset: true },
              { src: "/images/lash_art_1.png", title: "Natural Volume Lashes", offset: true },
              { src: "/images/lash_art_2.png", title: "Premium Lash Lift" }
            ].map((img, i) => (
              <div 
                key={i} 
                className={`group relative rounded-[2.5rem] overflow-hidden bg-[var(--color-light-200)] border border-[var(--color-primary-300)]/20 cursor-pointer ${img.offset ? 'md:-translate-y-6' : ''} transition-all duration-500 hover:shadow-[0_20px_40px_rgba(197,139,139,0.15)] aspect-[3/4]`}
              >
                <div className="absolute inset-0 bg-[var(--color-text-main)]/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img 
                  src={img.src} 
                  alt={img.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Image Hover Info Tag */}
                <div className="absolute bottom-6 left-6 right-6 p-4 glass rounded-2xl z-20 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                  <p className="text-xs font-bold text-[var(--color-text-main)] uppercase tracking-wide">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 PREMIUM REVIEWS SECTION */}
      <section id="reviews" className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-primary-400)]/20 bg-white/75 text-xs font-bold text-[var(--color-primary-600)] uppercase tracking-widest mb-4">
            {t('reviewsTag')}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] italic tracking-tight">
            {t('reviewsTitle1')} <span className="text-[var(--color-primary-500)]">{t('reviewsTitle2')}</span>
          </h2>
          <div className="flex justify-center gap-1.5 text-[#FABB05] mt-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={20} fill="currentColor" className="text-amber-400" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Ceren A.", initial: "C", review: "İnanılmaz temiz, çok steril bir ortam. Gül kurusu konseptine bayıldım. Tırnak süslemelerindeki ince işçilik tek kelimeyle muazzam!" },
            { name: "Elif K.", initial: "E", review: "İpek kirpik yaptırdım, hiç ağırlık yapmadı ve o kadar doğal duruyor ki herkes kendi kirpiğim sanıyor. Çok ilgili ve güler yüzlü bir ekip." },
            { name: "Merve Y.", initial: "M", review: "Randevu sistemi aşırı pratik ve kullanışlı. Saniyeler içinde randevumu aldım, hatırlatma e-postaları çok iyi çalışıyor. Hizmet zaten harika." }
          ].map((item, i) => (
            <div key={i} className="glass-panel bg-white p-10 rounded-[2rem] flex flex-col gap-6 relative hover:-translate-y-1 transition-all duration-500 shadow-sm hover:shadow-[0_20px_45px_rgba(197,139,139,0.06)]">
              {/* Double Quote Deco */}
              <span className="absolute top-6 right-8 text-8xl font-serif text-[var(--color-primary-300)]/25 leading-none pointer-events-none select-none">“</span>
              
              <p className="text-[var(--color-text-main)] font-light leading-relaxed text-base italic relative z-10">
                "{item.review}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-[var(--color-primary-300)]/15">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary-500)] text-white flex items-center justify-center font-serif text-lg font-bold shadow-[0_4px_12px_rgba(197,139,139,0.2)]">
                  {item.initial}
                </div>
                <div>
                  <p className="font-bold text-[var(--color-text-main)] text-sm">{item.name}</p>
                  <p className="text-[10px] text-[var(--color-primary-600)] uppercase tracking-widest mt-0.5 font-bold">{t('verifiedCustomer')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🌟 FOOTER CTA */}
      <section className="w-full bg-[var(--color-primary-500)] py-24 relative overflow-hidden text-center px-6">
        <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-[1px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 tracking-tight">{t('ctaTitle')}</h2>
          <p className="text-white/90 text-lg md:text-xl mb-12 font-light max-w-xl">{t('ctaDesc')}</p>
          <Link href="/booking" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] font-bold rounded-full hover:bg-[var(--color-light-100)] hover:-translate-y-0.5 transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.1)]">
            <CalendarIcon size={18} /> {t('ctaButton')}
          </Link>
        </div>
      </section>

    </main>
  );
}
