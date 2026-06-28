import { getStaffDashboardData } from '@/app/actions/staff-dashboard';
import { redirect } from 'next/navigation';
import StaffDashboardClient from './StaffDashboardClient';

export default async function StaffDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const data = await getStaffDashboardData(resolvedParams.locale);

  if (!data.success || !data.data) {
    // Personel değilse ana sayfaya at
    redirect(`/${resolvedParams.locale}`);
  }

  return (
    <StaffDashboardClient 
      initialData={data.data} 
      locale={resolvedParams.locale} 
    />
  );
}
