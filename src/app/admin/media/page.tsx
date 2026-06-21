import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import MediaClient from './MediaClient';

export default async function AdminMediaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  return (
    <AdminShell title="Medya Kütüphanesi">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Görsel & Medya Yönetimi</h2>
              <p className="text-sm text-gray-500 mt-1">Hizmetler, kategoriler ve blog yazıları için kullanacağınız görselleri buradan yükleyebilir ve kopyalayabilirsiniz.</p>
            </div>
            
            <MediaClient />
          </div>
    </AdminShell>
  );
}
