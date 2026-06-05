import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Index');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl -z-10 animate-glow"></div>
      
      {/* Glass Panel Container */}
      <div className="glass-panel rounded-2xl p-12 max-w-3xl w-full text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-[#D4AF37]">
          {t('title')}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-10 font-light">
          {t('subtitle')}
        </p>
        
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-[#D4AF37] text-black font-semibold rounded-full hover:bg-[#AA882E] transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] cursor-pointer">
            {t('bookNow')}
          </button>
          <button className="px-8 py-3 glass text-white font-medium rounded-full hover:bg-white/10 transition-all cursor-pointer">
            {t('services')}
          </button>
        </div>
      </div>
    </main>
  );
}
