import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import GiftCardsClient from './GiftCardsClient';

export default async function AdminGiftCardsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Veritabanından tüm hediye kartlarını çek
  const giftCards = await prisma.giftCard.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formattedGiftCards = giftCards.map(gc => ({
    id: gc.id,
    code: gc.code,
    amount: Number(gc.amount),
    balance: Number(gc.balance),
    expiryDate: gc.expiryDate ? gc.expiryDate.toISOString().split('T')[0] : null,
    status: gc.status,
    createdAt: gc.createdAt.toISOString(),
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">Hediye Kartı Yönetimi</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Müşteri Hediye Kartları</h2>
              <p className="text-sm text-gray-500 mt-1">Güzellik salonunda ödeme yerine geçebilecek dijital veya fiziksel hediye kartı kodları oluşturun, bakiyelerini ve geçerlilik durumlarını izleyin.</p>
            </div>
            
            <GiftCardsClient initialGiftCards={formattedGiftCards} />
          </div>
        </main>
      </div>
    </div>
  );
}
