import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { LogOut, Image, Calendar, Settings, Tags, MapPin, Users } from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import Link from 'next/link';
import MediaClient from './MediaClient';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminMediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/${locale}/admin/login`);
  }

  // Veritabanındaki tüm medyaları çek
  const media = await prisma.mediaItem.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formattedMedia = media.map(m => ({
    id: m.id,
    url: m.url,
    title: m.title,
    altText: m.altText,
    caption: m.caption,
    fileName: m.fileName,
    fileSize: m.fileSize,
    mimeType: m.mimeType,
    createdAt: m.createdAt,
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Ortak Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Medya Kütüphanesi</h1>
          <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Merkezi Medya Yönetimi</h2>
              <p className="text-sm text-gray-500 mt-1">Medya dosyalarınızı tek bir yerden yükleyin, silin ve arama motorları için Görsel SEO alt textlerini yapılandırın.</p>
            </div>
            
            <MediaClient initialMedia={formattedMedia} locale={locale} />
          </div>
        </main>
      </div>
    </div>
  );
}
