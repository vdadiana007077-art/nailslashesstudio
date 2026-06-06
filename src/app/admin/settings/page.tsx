import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import SettingsClient from './SettingsClient';

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Veritabanındaki tüm ayarları çek
  const settings = await prisma.setting.findMany();

  const formattedSettings = settings.map(s => ({
    id: s.id,
    key: s.key,
    value: s.value,
    language: s.language,
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">Genel Ayarlar</h1>
          <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Sistem ve İletişim Ayarları</h2>
              <p className="text-sm text-gray-500 mt-1">Stüdyonuzun WhatsApp iletişim hattını, sosyal medya hesaplarını, genel çalışma saatlerini ve sistem e-posta ayarlarını tek bir yerden yönetin.</p>
            </div>
            
            <SettingsClient initialSettings={formattedSettings} />
          </div>
        </main>
      </div>
    </div>
  );
}
