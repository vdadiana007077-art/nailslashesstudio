import { getStaffCalendarAppointments } from '@/app/actions/staffCalendar';
import { requireStaff } from '@/app/actions/staffAuth';
import StaffCalendarClient from './CalendarClient';

export const dynamic = 'force-dynamic';

export default async function StaffCalendarPage() {
  const staff = await requireStaff();
  
  // İlk yüklemede, personelin tüm randevularını çekiyoruz (Veya 1 aylık çekilebilir)
  // Şimdilik 1 ay öncesi ve 1 ay sonrası olarak geniş bir aralık verelim.
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const result = await getStaffCalendarAppointments(startDate, endDate);

  return (
    <div className="pb-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Randevu Takvimi</h1>
        <p className="text-xs text-gray-500">Geçmiş ve gelecek randevularınızı görüntüleyin.</p>
      </div>

      <StaffCalendarClient 
        staffId={staff.id}
        initialAppointments={result.success ? result.data : []} 
      />
    </div>
  );
}
