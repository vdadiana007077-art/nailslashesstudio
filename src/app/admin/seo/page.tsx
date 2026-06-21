import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import SeoClient from './SeoClient';

export default async function AdminSeoPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Veritabanındaki tüm yönlendirme (redirect) kurallarını çek
  const redirects = await prisma.redirect.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formattedRedirects = redirects.map(r => ({
    id: r.id,
    oldUrl: r.oldUrl,
    newUrl: r.newUrl,
    statusCode: r.statusCode,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <AdminShell title="SEO & Yönlendirme Yönetimi">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">SEO & Rota Yönlendirmeleri (301/302)</h2>
              <p className="text-sm text-gray-500 mt-1">Eski URL yapılarınızı arama motoru değerini kaybetmeden yeni sayfalara yönlendirin (301 kalıcı / 302 geçici). Sitemap ve robots.txt durumlarını denetleyin.</p>
            </div>
            
            <SeoClient initialRedirects={formattedRedirects} />
          </div>
    </AdminShell>
  );
}
