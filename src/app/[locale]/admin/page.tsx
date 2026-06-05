import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, LogOut, Users, Settings } from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import { Language } from '@prisma/client';

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Veritabanından bugünün ve gelecek randevularını çek
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: today,
      }
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ],
    include: {
      service: {
        include: { translations: { where: { language: 'TR' } } }
      }
    }
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[var(--color-rose-600)]">N&L Studio</h2>
          <p className="text-xs text-gray-500 mt-1">Yönetim Paneli</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[var(--color-rose-50)] text-[var(--color-rose-600)] rounded-xl font-medium">
            <Calendar size={20} /> Randevular
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
            <Settings size={20} /> Hizmetler
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
            <Users size={20} /> Müşteriler
          </a>
        </div>
        <div className="p-4 border-t border-gray-200">
          <form action={logoutAdmin}>
            <button type="submit" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-xl font-medium transition-colors">
              <LogOut size={20} /> Çıkış Yap
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Randevular</h1>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Calendar size={24}/></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Gelecek Randevular</p>
                <p className="text-2xl font-bold text-gray-800">{upcomingAppointments.length}</p>
              </div>
            </div>
            {/* Add more stats here if needed */}
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Yaklaşan Randevular</h3>
            </div>
            
            {upcomingAppointments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Hiç yaklaşan randevu yok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                      <th className="p-4 font-medium">Müşteri</th>
                      <th className="p-4 font-medium">Tarih & Saat</th>
                      <th className="p-4 font-medium">Hizmet</th>
                      <th className="p-4 font-medium">İletişim</th>
                      <th className="p-4 font-medium">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.map((appt) => (
                      <tr key={appt.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-semibold text-gray-800">{appt.customerName}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">{appt.date.toLocaleDateString('tr-TR')}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {appt.startTime}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-[var(--color-rose-50)] text-[var(--color-rose-600)] rounded-full text-xs font-semibold">
                            {appt.service.translations[0]?.name || 'Hizmet'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col text-sm text-gray-600">
                            <span>{appt.customerPhone}</span>
                            <span className="text-xs text-gray-400">{appt.customerEmail}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
