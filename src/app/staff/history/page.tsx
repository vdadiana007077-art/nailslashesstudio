import { getStaffHistory } from '@/app/actions/staffCalendar';
import { requireStaff } from '@/app/actions/staffAuth';
import StaffHistoryClient from './HistoryClient';

export const dynamic = 'force-dynamic';

export default async function StaffHistoryPage() {
  await requireStaff();
  const result = await getStaffHistory();

  return (
    <div className="pb-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Geçmiş İşlemler</h1>
        <p className="text-xs text-gray-500">Tamamlanan ve geçmiş randevularınız.</p>
      </div>

      <StaffHistoryClient 
        appointments={result.success ? result.data : []} 
      />
    </div>
  );
}
