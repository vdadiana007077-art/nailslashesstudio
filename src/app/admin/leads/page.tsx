import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">CRM Müşteri Talepleri</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Müşteri Form Talepleri</h2>
              <p className="text-sm text-gray-500 mt-1">İletişim formundan ve diğer kaynaklardan gelen müşteri taleplerini yönetin, durumlarını güncelleyin ve notlar ekleyin.</p>
            </div>
            
            <LeadsClient initialLeads={formattedLeads} />
          </div>
        </main>
      </div>
    </div>
  );
}
