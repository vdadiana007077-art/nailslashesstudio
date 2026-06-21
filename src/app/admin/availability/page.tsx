import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import AvailabilityClient from './AvailabilityClient';

export default async function AdminAvailabilityPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Şubeler
  const locations = await prisma.location.findMany({
    where: { isDeleted: false },
    include: {
      workingHours: { orderBy: { dayOfWeek: 'asc' } },
      holidays: { orderBy: { date: 'asc' } },
    },
    orderBy: { name: 'asc' },
  });

  // Personeller + çalışma saatleri + izinler + hizmetler
  const staff = await prisma.staff.findMany({
    where: { isDeleted: false, isActive: true },
    include: {
      workingHours: { orderBy: { dayOfWeek: 'asc' } },
      leaves: { orderBy: { date: 'asc' } },
      services: {
        include: {
          service: { include: { translations: { where: { language: 'TR' } } } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Hizmetler
  const services = await prisma.service.findMany({
    where: { isDeleted: false, isActive: true },
    include: { translations: { where: { language: 'TR' } } },
    orderBy: { price: 'asc' },
  });

  const serializedLocations = JSON.parse(JSON.stringify(locations));
  const serializedStaff = JSON.parse(JSON.stringify(staff));
  const serializedServices = JSON.parse(JSON.stringify(services));

  return (
    <AdminShell title="Müsaitlik & Slot Yönetimi" subtitle="Şube çalışma saatleri, personel izinleri, slot kapasiteleri ve toplu işlemler">
      <div className="max-w-7xl mx-auto">
        <AvailabilityClient
          locations={serializedLocations}
          staffList={serializedStaff}
          services={serializedServices}
        />
      </div>
    </AdminShell>
  );
}
