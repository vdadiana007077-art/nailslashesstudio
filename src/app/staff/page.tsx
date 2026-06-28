import { getStaffDashboardData } from '@/app/actions/staffDashboard';
import StaffDashboardClient from './components/StaffDashboardClient';

export const dynamic = 'force-dynamic';

export default async function StaffDashboardPage() {
  const result = await getStaffDashboardData();

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Hata</h2>
        <p className="text-gray-500">Veriler yüklenirken bir hata oluştu.</p>
      </div>
    );
  }

  return (
    <StaffDashboardClient 
      data={result.data as any} 
    />
  );
}
