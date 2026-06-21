import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import CouponsClient from './CouponsClient';

export default async function AdminCouponsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Veritabanından tüm kuponları çek
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formattedCoupons = coupons.map(c => ({
    id: c.id,
    code: c.code,
    discountType: c.discountType,
    value: Number(c.value),
    startDate: c.startDate.toISOString().split('T')[0],
    endDate: c.endDate.toISOString().split('T')[0],
    usageLimit: c.usageLimit,
    usageCount: c.usageCount,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <AdminShell title="Kupon Yönetimi">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Kampanya ve İndirim Kuponları</h2>
              <p className="text-sm text-gray-500 mt-1">Randevu alımlarında kullanılabilecek yüzde veya sabit tutarlı indirim kuponları oluşturun, limitlerini ve tarihlerini yönetin.</p>
            </div>
            
            <CouponsClient initialCoupons={formattedCoupons} />
          </div>
    </AdminShell>
  );
}
