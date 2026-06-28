import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import AccountingClient from './AccountingClient';

export default async function AccountingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // 1. İşlemleri çek (Kategori ve Staff ile)
  let transactions: any[] = [];
  let staffList: any[] = [];
  let completedAppointments: any[] = [];
  let locations: any[] = [];

  // Bu Ayın Başı
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  try {
    transactions = await prisma.transaction.findMany({
      where: { date: { gte: startOfMonth } },
      include: {
        category: true,
        staff: true,
        location: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    // 2. Aktif personelleri çek
    staffList = await prisma.staff.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' }
    });

    // 2.1. Aktif şubeleri çek
    locations = await prisma.location.findMany({
      where: { isDeleted: false, isActive: true },
      orderBy: { name: 'asc' }
    });

    // 3. Tamamlanan randevuları çek (Sadece BU AY için ciro ve komisyon hesaplama)
    completedAppointments = await prisma.appointment.findMany({
      where: { 
        status: 'COMPLETED',
        date: { gte: startOfMonth }
      },
      include: {
        service: true,
        staff: true,
        staffCommission: true
      }
    });
  } catch (error) {
    console.error("Muhasebe verileri çekilemedi:", error);
  }

  // Tipleri güvenli hale getirelim (Decimal -> String)
  const formattedTransactions = transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount.toString(),
    paymentMethod: t.paymentMethod,
    date: t.date.toISOString(),
    description: t.description,
    locationId: t.locationId,
    locationName: t.location ? (t.location.branchName || t.location.name) : 'Şube Belirtilmemiş',
    category: {
      name: t.category.name,
    },
    staff: t.staff ? { name: t.staff.name } : null
  }));

  const formattedStaffList = staffList.map((st) => ({
    id: st.id,
    name: st.name
  }));

  const formattedLocations = locations.map((l) => ({
    id: l.id,
    name: l.branchName || l.name
  }));

  // Personel hakediş ciro/komisyon hesaplaması
  const staffPayoutsMap: Record<string, { staffId: string; name: string; appointmentCount: number; totalRevenue: number; commissionEarned: number }> = {};

  // Başlangıçta tüm aktif personelleri ekle (cirosu olmasa da listelensinler)
  staffList.forEach((st) => {
    staffPayoutsMap[st.id] = {
      staffId: st.id,
      name: st.name,
      appointmentCount: 0,
      totalRevenue: 0,
      commissionEarned: 0
    };
  });

  // Tamamlanan randevuları tara ve hesapla
  completedAppointments.forEach((appt) => {
    if (!appt.staffId) return;

    // Sadece aktif olan personellerin hakedişi gösterilecek. Eğer personelin kaydı aktif listede yoksa yoksay (silinmiş/pasif personel).
    if (!staffPayoutsMap[appt.staffId]) {
      return;
    }

    const payout = staffPayoutsMap[appt.staffId];
    payout.appointmentCount += 1;

    const price = parseFloat(appt.priceAtBooking.toString());
    payout.totalRevenue += price;

    // Komisyon hesabı: Eğer veritabanında hazır komisyon kaydı varsa onu kullan, yoksa çalışan oranına göre hesapla
    let commAmount = 0;
    if (appt.staffCommission) {
      commAmount = parseFloat(appt.staffCommission.amount.toString());
    } else if (appt.staff?.commissionRate) {
      const rate = parseFloat(appt.staff.commissionRate.toString());
      commAmount = (price * rate) / 100;
    }
    payout.commissionEarned += commAmount;
  });

  const staffPayouts = Object.values(staffPayoutsMap).sort((a, b) => b.commissionEarned - a.commissionEarned);

  return (
    <AdminShell title="Muhasebe & Finansal Raporlama">
          <AccountingClient 
            transactions={formattedTransactions} 
            staffList={formattedStaffList} 
            staffPayouts={staffPayouts} 
            locations={formattedLocations}
            
          />
    </AdminShell>
  );
}
