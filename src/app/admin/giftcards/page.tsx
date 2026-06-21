import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
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
    <AdminShell title="Hediye Kartı Yönetimi">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Müşteri Hediye Kartları</h2>
              <p className="text-sm text-gray-500 mt-1">Güzellik salonunda ödeme yerine geçebilecek dijital veya fiziksel hediye kartı kodları oluşturun, bakiyelerini ve geçerlilik durumlarını izleyin.</p>
            </div>
            
            <GiftCardsClient initialGiftCards={formattedGiftCards} />
          </div>
    </AdminShell>
  );
}
