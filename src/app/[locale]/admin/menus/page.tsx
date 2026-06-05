import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MenusClient from './MenusClient';

export default async function AdminMenusPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Veritabanından tüm menü öğelerini çek
  const menuItems = await prisma.menuItem.findMany({
    orderBy: { order: 'asc' },
  });

  const formattedMenuItems = menuItems.map(m => ({
    id: m.id,
    menuType: m.menuType,
    language: m.language,
    title: m.title,
    url: m.url,
    order: m.order,
    isActive: m.isActive,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">Menü Yönetimi</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Header ve Footer Menü Linkleri</h2>
              <p className="text-sm text-gray-500 mt-1">Sitenin üst (Header) ve alt (Footer) kısmında yer alan yönlendirme menülerini diller bazında yönetin, sıralamasını güncelleyin.</p>
            </div>
            
            <MenusClient initialItems={formattedMenuItems} />
          </div>
        </main>
      </div>
    </div>
  );
}
