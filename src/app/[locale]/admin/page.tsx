import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Scissors, 
  DollarSign, 
  CalendarDays,
  Sparkles
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Tarihleri hesaplayalım
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Bu haftanın başı (Pazartesi) ve sonu (Pazar)
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Veritabanı sorgularını yapalım
  let upcomingAppointments: any[] = [];
  let todayApptsCount = 0;
  let weekApptsCount = 0;
  let allAppointmentsForStats: any[] = [];
  let transactions: any[] = [];

  try {
    // 1. Gelecek randevular (Bugün dahil)
    upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: todayStart,
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      include: {
        service: {
          include: { translations: { where: { language: 'TR' } } }
        },
        staff: true
      }
    });

    // 2. Bugünün randevu sayısı
    todayApptsCount = await prisma.appointment.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    // 3. Bu haftanın randevu sayısı
    weekApptsCount = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      }
    });

    // 4. İstatistik hesabı için tüm onaylı ve tamamlanmış randevuları çek
    allAppointmentsForStats = await prisma.appointment.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED']
        }
      },
      include: {
        service: {
          include: { translations: { where: { language: 'TR' } } }
        },
        staff: true
      }
    });

    // 5. Finansal kâr için tüm muhasebe işlemlerini çek
    transactions = await prisma.transaction.findMany();
  } catch (error) {
    console.error("Dashboard veri çekme hatası:", error);
  }

  // A) Popüler Hizmet Hesaplama
  const serviceCounts: Record<string, { name: string; count: number }> = {};
  allAppointmentsForStats.forEach((appt) => {
    const serviceId = appt.serviceId;
    const name = appt.service?.translations[0]?.name || 'Bilinmeyen Hizmet';
    if (!serviceCounts[serviceId]) {
      serviceCounts[serviceId] = { name, count: 0 };
    }
    serviceCounts[serviceId].count += 1;
  });
  const popularService = Object.values(serviceCounts).sort((a, b) => b.count - a.count)[0]?.name || 'Veri Yok';

  // B) Yoğun Personel Hesaplama
  const staffCounts: Record<string, { name: string; count: number }> = {};
  allAppointmentsForStats.forEach((appt) => {
    if (!appt.staffId || !appt.staff) return;
    const staffId = appt.staffId;
    const name = appt.staff.name;
    if (!staffCounts[staffId]) {
      staffCounts[staffId] = { name, count: 0 };
    }
    staffCounts[staffId].count += 1;
  });
  const busyStaff = Object.values(staffCounts).sort((a, b) => b.count - a.count)[0]?.name || 'Veri Yok';

  // C) Toplam Kâr Hesaplama
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const totalProfit = totalIncome - totalExpense;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[var(--color-rose-600)] animate-pulse" size={24} />
            <h1 className="text-2xl font-bold text-gray-800">Yönetici Kontrol Paneli</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Bugünün Randevuları */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-full blur-xl -z-10"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bugün</span>
                <Calendar size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{todayApptsCount}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Bugünkü Randevular</p>
              </div>
            </div>

            {/* Bu Haftaki Randevular */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-full blur-xl -z-10"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bu Hafta</span>
                <CalendarDays size={18} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{weekApptsCount}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Haftalık Randevular</p>
              </div>
            </div>

            {/* Popüler Hizmet */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-full blur-xl -z-10"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Popüler Hizmet</span>
                <Scissors size={18} className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 truncate" title={popularService}>{popularService}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">En Çok Tercih Edilen</p>
              </div>
            </div>

            {/* Yoğun Personel */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-full blur-xl -z-10"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Yoğun Personel</span>
                <Users size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 truncate" title={busyStaff}>{busyStaff}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">En Çok Randevu Alan</p>
              </div>
            </div>

            {/* Toplam Kar */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full blur-xl -z-10"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Finansal Kar</span>
                <DollarSign size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₺{totalProfit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 font-medium mt-1">Toplam Kasa Durumu</p>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Yaklaşan Randevular</h3>
                <p className="text-xs text-gray-400 mt-1">Bugün ve gelecek tarihlere kayıtlı randevu listesi.</p>
              </div>
            </div>
            
            {upcomingAppointments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Hiç yaklaşan randevu yok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                      <th className="p-4 pl-6 font-medium">Müşteri</th>
                      <th className="p-4 font-medium">Tarih & Saat</th>
                      <th className="p-4 font-medium">Uzman</th>
                      <th className="p-4 font-medium">Hizmet</th>
                      <th className="p-4 font-medium">İletişim</th>
                      <th className="p-4 font-medium">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.map((appt) => (
                      <tr key={appt.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                        <td className="p-4 pl-6 font-semibold text-gray-800">{appt.customerName}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">{appt.date.toLocaleDateString('tr-TR')}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {appt.startTime}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-700">
                          {appt.staff?.name || 'Uzman Seçilmedi'}
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-[var(--color-rose-50)] text-[var(--color-rose-600)] rounded-full text-xs font-semibold">
                            {appt.service.translations[0]?.name || 'Hizmet'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col text-xs text-gray-600">
                            <span>{appt.customerPhone}</span>
                            <span className="text-[10px] text-gray-400">{appt.customerEmail}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                            appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border border-green-200' :
                            appt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {appt.status === 'PENDING' ? 'Beklemede' :
                             appt.status === 'CONFIRMED' ? 'Onaylandı' :
                             appt.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal Edildi'}
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
