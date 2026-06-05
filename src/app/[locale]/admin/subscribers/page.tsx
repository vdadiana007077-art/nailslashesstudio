import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import SubscribersClient from './SubscribersClient';

export default async function AdminSubscribersPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">Bülten Aboneleri</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">E-Bülten Abone Listesi</h2>
              <p className="text-sm text-gray-500 mt-1">E-Bülten kampanyaları için kayıt olan abonelerinizi yönetin, durumlarını değiştirin (soft delete/pasifleştirme).</p>
            </div>
            
            <SubscribersClient initialSubscribers={formattedSubscribers} />
          </div>
        </main>
      </div>
    </div>
  );
}
