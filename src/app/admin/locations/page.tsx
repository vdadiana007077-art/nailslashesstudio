import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import LocationsClient from './LocationsClient';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLocationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Veritabanından silinmemiş şubeleri çek
  const locations = await prisma.location.findMany({
    where: { isDeleted: false },
    include: { workingHours: true },
    orderBy: { createdAt: 'desc' },
  });

  const formattedLocations = locations.map(l => ({
    id: l.id,
    name: l.name,
    branchName: l.branchName,
    address: l.address,
    city: l.city,
    country: l.country,
    latitude: l.latitude,
    longitude: l.longitude,
    googlePlaceId: l.googlePlaceId,
    googleMapsUrl: l.googleMapsUrl,
    phone: l.phone,
    email: l.email,
    isActive: l.isActive,
    seoTitle: l.seoTitle,
    seoDesc: l.seoDesc,
    canonical: l.canonical,
    ogTitle: l.ogTitle,
    ogDesc: l.ogDesc,
    ogImage: l.ogImage,
    workingHours: l.workingHours.map(wh => ({
      id: wh.id,
      dayOfWeek: wh.dayOfWeek,
      openTime: wh.openTime,
      closeTime: wh.closeTime,
      isClosed: wh.isClosed,
      breakStart: wh.breakStart,
      breakEnd: wh.breakEnd,
    })),
  }));

  return (
    <AdminShell title="Şubeler">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Şube ve Lokasyon Yönetimi</h2>
              <p className="text-sm text-gray-500 mt-1">Salon şubelerini ekleyin, çalışma durumlarını güncelleyin ve soft-delete yöntemiyle yönetin.</p>
            </div>
            
            <LocationsClient initialLocations={formattedLocations} />
          </div>
    </AdminShell>
  );
}
