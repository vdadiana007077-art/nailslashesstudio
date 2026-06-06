import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AvailabilityClient from './AvailabilityClient';

export default async function AdminAvailabilityPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Şubeler
  const locations = await prisma.location.findMany({
    where: { isDeleted: false },
    include: {
      workingHours: { orderBy: { dayOfWeek: 'asc' } },
      holidays: { orderBy: { date: 'asc' } },
    },
    orderBy: { name: 'asc' },
  });

  // Personeller + çalışma saatleri + izinler + hizmetler
  const staff = await prisma.staff.findMany({
    where: { isDeleted: false, isActive: true },
    include: {
      workingHours: { orderBy: { dayOfWeek: 'asc' } },
      leaves: { orderBy: { date: 'asc' } },
      services: {
        include: {
          service: { include: { translations: { where: { language: 'TR' } } } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Hizmetler
  const services = await prisma.service.findMany({
    where: { isDeleted: false, isActive: true },
    include: { translations: { where: { language: 'TR' } } },
    orderBy: { price: 'asc' },
  });

  const serializedLocations = JSON.parse(JSON.stringify(locations));
  const serializedStaff = JSON.parse(JSON.stringify(staff));
  const serializedServices = JSON.parse(JSON.stringify(services));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Müsaitlik & Slot Yönetimi</h1>
            <p className="text-sm text-gray-500 mt-0.5">Şube çalışma saatleri, personel izinleri, slot kapasiteleri ve toplu işlemler</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">A</div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <AvailabilityClient
              locations={serializedLocations}
              staffList={serializedStaff}
              services={serializedServices}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
