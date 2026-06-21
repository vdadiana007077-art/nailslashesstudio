import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
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
    <AdminShell title="Genel Ayarlar">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Sistem ve İletişim Ayarları</h2>
              <p className="text-sm text-gray-500 mt-1">Stüdyonuzun WhatsApp iletişim hattını, sosyal medya hesaplarını, genel çalışma saatlerini ve sistem e-posta ayarlarını tek bir yerden yönetin.</p>
            </div>
            
            <SettingsClient initialSettings={formattedSettings} />
          </div>
    </AdminShell>
  );
}
