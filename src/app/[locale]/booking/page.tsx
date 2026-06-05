import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import BookingForm from '@/components/booking/BookingForm';

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale.toUpperCase() as Language;

  const t = await getTranslations('Index');

  // Sadece aktif hizmetleri çek
  const rawServices = await prisma.service.findMany({
    where: { isActive: true },
    include: {
      translations: {
        where: { language: locale },
      },
    },
  });

  // Client'a uygun formata çevir
  const services = rawServices.map(s => ({
    id: s.id,
    name: s.translations[0]?.name || 'İsimsiz Hizmet',
    price: s.price.toString(),
    duration: s.duration
  }));

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden flex items-center justify-center">
      {/* Decorative Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/10 rounded-full blur-3xl -z-10 animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-rose-300)]/10 rounded-full blur-3xl -z-10 animate-glow" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="w-full px-6 z-10">
        <BookingForm services={services} />
      </div>
    </main>
  );
}
