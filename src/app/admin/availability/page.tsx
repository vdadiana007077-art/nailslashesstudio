import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AvailabilityClient from './AvailabilityClient';

export default async function AdminAvailabilityPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Şubeleri ve çalışanları çek
  const locations = await prisma.location.findMany({
    where: { isDeleted: false },
    orderBy: { name: 'asc' }
  });

  const staff = await prisma.staff.findMany({
    where: { isDeleted: false, isActive: true },
    orderBy: { name: 'asc' }
  });

  // Client Component'a prop geçerken Decimal ve Date nesnelerini serialize et
  const serializedLocations = JSON.parse(JSON.stringify(locations));
  const serializedStaff = JSON.parse(JSON.stringify(staff));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Çalışma Saatleri & Slot Yönetimi</h1>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Müsaitlik ve Slot Kapasitesi</h2>
              <p className="text-sm text-gray-500 mt-1">Şube bazlı veya uzman bazlı günlük saat slotlarının kapasitesini belirleyin, slotları bloke edin.</p>
            </div>
            
            <AvailabilityClient locations={serializedLocations} staffList={serializedStaff} />
          </div>
        </main>
      </div>
    </div>
  );
}
