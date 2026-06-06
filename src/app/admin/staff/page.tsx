import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StaffClient from './StaffClient';
import { Language } from '@prisma/client';

export default async function AdminStaffPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Aktif Şubeler
  const locations = await prisma.location.findMany({
    where: { isDeleted: false, isActive: true },
    orderBy: { name: 'asc' }
  });

  // Aktif Hizmetler (Dil Çevirileri ile)
  const languageEnum = 'TR' as Language;
  const services = await prisma.service.findMany({
    where: { isDeleted: false, isActive: true },
    include: {
      translations: {
        where: { language: languageEnum }
      }
    },
    orderBy: { price: 'asc' }
  });

  // Personeller
  const staff = await prisma.staff.findMany({
    where: { isDeleted: false },
    include: {
      location: true,
      services: {
        select: {
          serviceId: true
        }
      },
      workingHours: {
        orderBy: { dayOfWeek: 'asc' }
      },
      leaves: {
        orderBy: { date: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  // JSON serialization için Decimal vs. stringe çevirme işlemleri
  const formattedLocations = locations.map(l => ({ id: l.id, name: l.branchName || l.name }));
  const formattedServices = services.map(s => ({
    id: s.id,
    name: s.translations[0]?.name || 'İsimsiz Hizmet',
    duration: s.duration,
    price: s.price.toString()
  }));

  const formattedStaff = staff.map(st => ({
    id: st.id,
    name: st.name,
    image: st.image,
    specialty: st.specialty,
    isActive: st.isActive,
    locationId: st.locationId,
    locationName: st.location?.branchName || st.location?.name || 'Şube Atanmamış',
    commissionRate: st.commissionRate ? Number(st.commissionRate) : 0,
    serviceIds: st.services.map(s => s.serviceId),
    workingHours: st.workingHours.map(w => ({
      id: w.id,
      dayOfWeek: w.dayOfWeek,
      openTime: w.openTime,
      closeTime: w.closeTime,
      isClosed: w.isClosed,
      breakStart: w.breakStart,
      breakEnd: w.breakEnd
    })),
    leaves: st.leaves.map(le => ({
      id: le.id,
      date: le.date.toISOString().split('T')[0],
      isFullDay: le.isFullDay,
      startTime: le.startTime,
      endTime: le.endTime
    }))
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Personel Yönetimi</h1>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Uzman ve Çalışan Yönetimi</h2>
              <p className="text-sm text-gray-500 mt-1">
                Çalışanlarınızı ekleyin, şubelere atayın, yetkin oldukları hizmetleri belirleyin, haftalık çalışma ve mola saatleri ile izin takvimlerini yönetin.
              </p>
            </div>
            <StaffClient 
              initialStaff={formattedStaff} 
              locations={formattedLocations} 
              services={formattedServices} 
              
            />
          </div>
        </main>
      </div>
    </div>
  );
}
