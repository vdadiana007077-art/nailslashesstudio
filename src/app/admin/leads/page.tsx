import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import LeadsClient from './LeadsClient';

export default async function AdminLeadsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Veritabanından CRM Taleplerini (Leads) çek
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formattedLeads = leads.map(l => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email,
    source: l.source,
    message: l.message,
    status: l.status,
    notes: l.notes,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <AdminShell title="CRM Müşteri Talepleri">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Müşteri Form Talepleri</h2>
              <p className="text-sm text-gray-500 mt-1">İletişim formundan ve diğer kaynaklardan gelen müşteri taleplerini yönetin, durumlarını güncelleyin ve notlar ekleyin.</p>
            </div>
            
            <LeadsClient initialLeads={formattedLeads} />
          </div>
    </AdminShell>
  );
}
