import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Calendar, Users, Scissors, DollarSign, CalendarDays } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AppointmentsClient from './AppointmentsClient';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
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

  // Bu Ayın Başı
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

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
        { date: 'desc' },
        { startTime: 'desc' }
      ],
      include: {
        service: {
          include: { translations: { where: { language: 'TR' } } }
        },
        staff: true,
        location: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
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

    // 4. İstatistik hesabı için sadece BU AYIN onaylı ve tamamlanmış randevularını çek
    allAppointmentsForStats = await prisma.appointment.findMany({
      where: {
        date: { gte: startOfMonth },
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

    // 5. Finansal kâr için sadece BU AYIN muhasebe işlemlerini çek
    transactions = await prisma.transaction.findMany({
      where: {
        date: { gte: startOfMonth }
      }
    });
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

  // Randevuları client bileşenine hazırla
  const appointmentItems = upcomingAppointments.map((appt: any) => ({
    id: appt.id,
    reservationNumber: appt.reservationNumber || null,
    customerName: appt.customerName || 'Bilinmeyen',
    customerEmail: appt.customerEmail || '',
    customerPhone: appt.customerPhone || null,
    date: appt.date.toISOString(),
    startTime: appt.startTime,
    endTime: appt.endTime,
    status: appt.status,
    notes: appt.notes || null,
    priceAtBooking: appt.priceAtBooking?.toString() || '0',
    durationAtBooking: appt.durationAtBooking || 0,
    serviceName: appt.service?.translations?.[0]?.name || 'Hizmet',
    staffName: appt.staff?.name || null,
    locationName: appt.location?.name || null,
    statusHistory: (appt.statusHistory || []).map((h: any) => ({
      status: h.status,
      notes: h.notes,
      createdAt: h.createdAt.toISOString(),
    })),
  }));

  return (
    <AdminShell title="Yönetici Kontrol Paneli">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
            {/* Bugünün Randevuları */}
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-full blur-xl -z-10"></div>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">Bugün</span>
                <Calendar size={16} className="text-blue-500 md:w-[18px] md:h-[18px]" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-800">{todayApptsCount}</p>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">Bugünkü Randevular</p>
              </div>
            </div>

            {/* Bu Haftaki Randevular */}
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-full blur-xl -z-10"></div>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">Bu Hafta</span>
                <CalendarDays size={16} className="text-indigo-500 md:w-[18px] md:h-[18px]" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-800">{weekApptsCount}</p>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">Haftalık Randevular</p>
              </div>
            </div>

            {/* Popüler Hizmet */}
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-full blur-xl -z-10"></div>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">Popüler Hizmet</span>
                <Scissors size={16} className="text-purple-500 md:w-[18px] md:h-[18px]" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-800 truncate" title={popularService}>{popularService}</p>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">En Çok Tercih Edilen</p>
              </div>
            </div>

            {/* Yoğun Personel */}
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-full blur-xl -z-10"></div>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">Yoğun Personel</span>
                <Users size={16} className="text-amber-500 md:w-[18px] md:h-[18px]" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-800 truncate" title={busyStaff}>{busyStaff}</p>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">En Çok Randevu Alan</p>
              </div>
            </div>

            {/* Toplam Kar */}
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden col-span-2 md:col-span-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full blur-xl -z-10"></div>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">Finansal Kar</span>
                <DollarSign size={16} className="text-emerald-500 md:w-[18px] md:h-[18px]" />
              </div>
              <div>
                <p className={`text-lg md:text-xl font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₺{totalProfit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">Bu Ayki Kasa Durumu</p>
              </div>
            </div>
          </div>

          {/* Appointments Section */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100">
              <h3 className="font-bold text-base md:text-lg text-gray-800">Randevu Yönetimi</h3>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1">Randevuları listele, durumlarını güncelle ve detaylarını gör.</p>
            </div>
            <div className="p-3 md:p-6">
              <AppointmentsClient appointments={appointmentItems} />
            </div>
          </div>
    </AdminShell>
  );
}
