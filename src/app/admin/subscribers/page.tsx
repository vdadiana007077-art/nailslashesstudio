import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import SubscribersClient from './SubscribersClient';

export default async function AdminSubscribersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Veritabanından bülten abonelerini çek
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formattedSubscribers = subscribers.map(s => ({
    id: s.id,
    email: s.email,
    language: s.language,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <AdminShell title="Bülten Aboneleri">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">E-Bülten Abone Listesi</h2>
              <p className="text-sm text-gray-500 mt-1">E-Bülten kampanyaları için kayıt olan abonelerinizi yönetin, durumlarını değiştirin (soft delete/pasifleştirme).</p>
            </div>
            
            <SubscribersClient initialSubscribers={formattedSubscribers} />
          </div>
    </AdminShell>
  );
}
