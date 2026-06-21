import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import ContactClient from './ContactClient';

export default async function AdminContactPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // İletişim formundan gelen tüm mesajları (Lead kaynağı: 'contact' veya 'web') çek
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formattedMessages = leads.map(l => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    message: l.message,
    source: l.source,
    status: l.status,
    notes: l.notes,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <AdminShell title="İletişim Yönetimi">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">İletişim Formu Mesajları</h2>
              <p className="text-sm text-gray-500 mt-1">Web sitesi iletişim formundan gelen tüm mesajları görüntüleyin, durumlarını güncelleyin ve not ekleyin.</p>
            </div>
            
            <ContactClient messages={formattedMessages} />
          </div>
    </AdminShell>
  );
}
