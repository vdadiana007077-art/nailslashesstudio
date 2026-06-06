import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import BookingForm from '@/components/booking/BookingForm';
import { getCurrentCustomer } from '@/app/actions/customerAuth';

export default async function BookingPageContent({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale.toUpperCase() as Language;

  const customer = await getCurrentCustomer();
  const initialCustomer = customer ? { name: customer.name || '', email: customer.email || '', phone: customer.phone || '' } : null;

  const rawLocations = await prisma.location.findMany({ where: { isDeleted: false, isActive: true }, orderBy: { name: 'asc' } });
  const locations = rawLocations.map(l => ({ id: l.id, name: l.name, address: l.address, phone: l.phone || '' }));

  // Kategoriler
  const rawCategories = await prisma.serviceCategory.findMany({
    where: { isDeleted: false, isActive: true },
    include: { translations: { where: { language: locale } } },
    orderBy: { order: 'asc' },
  });
  const categories = rawCategories.map(c => ({
    id: c.id,
    name: c.translations[0]?.name || 'Kategori',
    image: c.image || '',
  }));

  // Hizmetler + LocationService bilgisi
  const rawServices = await prisma.service.findMany({
    where: { isDeleted: false, isActive: true },
    include: {
      translations: { where: { language: locale } },
      category: { include: { translations: { where: { language: locale } } } },
      locations: { select: { locationId: true } },
    },
    orderBy: { price: 'asc' },
  });
  const services = rawServices.map(s => ({
    id: s.id,
    name: s.translations[0]?.name || 'İsimsiz Hizmet',
    price: s.price.toString(),
    duration: s.duration,
    categoryId: s.categoryId,
    categoryName: s.category.translations[0]?.name || 'Diğer',
    locationIds: s.locations.map(ls => ls.locationId),
  }));

  const rawStaff = await prisma.staff.findMany({
    where: { isDeleted: false, isActive: true },
    include: { services: { select: { serviceId: true } } },
    orderBy: { name: 'asc' },
  });
  const staffList = rawStaff.map(st => ({
    id: st.id, name: st.name, image: st.image || '', specialty: st.specialty || '',
    locationId: st.locationId || '', serviceIds: st.services.map(s => s.serviceId),
  }));

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/10 rounded-full blur-3xl -z-10 animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-rose-300)]/10 rounded-full blur-3xl -z-10 animate-glow" style={{ animationDelay: '1.5s' }}></div>
      <div className="w-full px-6 z-10">
        <BookingForm
          initialLocations={locations}
          initialCategories={categories}
          initialServices={services}
          initialStaff={staffList}
          initialCustomer={initialCustomer}
        />
      </div>
    </main>
  );
}

