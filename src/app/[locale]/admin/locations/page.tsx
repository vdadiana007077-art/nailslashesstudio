import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import Link from 'next/link';
import LocationsClient from './LocationsClient';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLocationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Şubeler</h1>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Şube ve Lokasyon Yönetimi</h2>
              <p className="text-sm text-gray-500 mt-1">Salon şubelerini ekleyin, çalışma durumlarını güncelleyin ve soft-delete yöntemiyle yönetin.</p>
            </div>
            
            <LocationsClient initialLocations={formattedLocations} locale={locale} />
          </div>
        </main>
      </div>
    </div>
  );
}
