import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import UsersClient from './UsersClient';

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Tüm kullanıcıları, bülten abonelik durumlarını ve randevularını getir
  const users = await prisma.user.findMany({
    include: {
      appointments: {
        include: {
          service: {
            include: { translations: { where: { language: 'TR' } } }
          },
          staff: true
        },
        orderBy: {
          date: 'desc'
        }
      },
      subscriber: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    loginType: u.loginType,
    marketingConsent: u.marketingConsent,
    createdAt: u.createdAt.toISOString().split('T')[0],
    subscriberActive: u.subscriber?.isActive || false,
    appointments: u.appointments.map(appt => ({
      id: appt.id,
      serviceName: appt.service.translations[0]?.name || 'Hizmet',
      staffName: appt.staff?.name || 'Uzman Belirtilmedi',
      date: appt.date.toISOString().split('T')[0],
      startTime: appt.startTime,
      status: appt.status,
      price: appt.priceAtBooking.toString()
    }))
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Müşteriler</h1>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Müşteri Listesi & Randevu Geçmişi</h2>
              <p className="text-sm text-gray-500 mt-1">Giriş yapan müşterilerin bilgilerini inceleyin, randevu geçmişlerini ve bülten üyelik durumlarını takip edin.</p>
            </div>
            
            <UsersClient initialUsers={formattedUsers} />
          </div>
        </main>
      </div>
    </div>
  );
}
