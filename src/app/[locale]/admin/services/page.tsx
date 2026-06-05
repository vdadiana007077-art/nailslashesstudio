import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { LogOut, Calendar, Settings, Users, Scissors, Tags, MapPin, Image } from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import ServiceList from '@/components/admin/ServiceList';
import AddServiceForm from '@/components/admin/AddServiceForm';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Kategorileri ve hizmetleri çek
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      translations: { where: { language: 'TR' } },
      services: {
        include: {
          translations: { where: { language: 'TR' } }
        }
      }
    }
  });

  // Client'a passlanacak format
  const formattedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.translations[0]?.name || 'İsimsiz Kategori',
    services: cat.services.map(s => ({
      id: s.id,
      name: s.translations[0]?.name || 'İsimsiz Hizmet',
      price: s.price.toString(),
      duration: s.duration,
      isActive: s.isActive
    }))
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Hizmet Yönetimi</h1>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Tüm Hizmetler</h2>
              <p className="text-sm text-gray-500">Fiyatları ve süreleri güncelleyebilir, hizmetleri aktif/pasif yapabilirsiniz.</p>
            </div>
            <AddServiceForm categories={formattedCategories} />
          </div>

          <ServiceList categories={formattedCategories} />
          
        </main>
      </div>
    </div>
  );
}
