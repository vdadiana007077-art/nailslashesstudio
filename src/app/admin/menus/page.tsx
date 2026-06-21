import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import MenusClient from './MenusClient';
import { seedPagesAndMenus } from '@/app/actions/seed-pages';

export default async function AdminMenusPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Varsayılan menüleri oluştur (ilk sefer)
  await seedPagesAndMenus();

  // Tüm menü elemanlarını getir
  const menuItems = await prisma.menuItem.findMany({
    include: {
      translations: true,
      page: { include: { translations: true } },
      serviceCategory: { include: { translations: true } },
      service: { include: { translations: true } },
      blogCategory: { include: { translations: true } },
      blogPost: { include: { translations: true } },
      landingPage: { include: { translations: true } }
    },
    orderBy: [
      { menuType: 'asc' },
      { order: 'asc' }
    ]
  });

  const formattedMenuItems = menuItems.map(item => ({
    id: item.id,
    menuType: item.menuType,
    order: item.order,
    isActive: item.isActive,
    target: item.target || '_self',
    isExternal: item.isExternal,
    linkType: item.linkType,
    pageId: item.pageId,
    serviceCategoryId: item.serviceCategoryId,
    serviceId: item.serviceId,
    blogCategoryId: item.blogCategoryId,
    blogPostId: item.blogPostId,
    landingPageId: item.landingPageId,
    page: item.page,
    serviceCategory: item.serviceCategory,
    service: item.service ? { ...item.service, price: item.service.price.toString(), deletedAt: item.service.deletedAt?.toISOString() || null } : null,
    blogCategory: item.blogCategory,
    blogPost: item.blogPost,
    landingPage: item.landingPage,
    translations: item.translations.map(t => ({
      id: t.id,
      language: t.language,
      title: t.title,
      url: t.url,
    })),
  }));

  // İçerik Seçenekleri için Verileri Çek
  const [pages, serviceCategories, rawServices, blogCategories, blogPosts, landingPages] = await Promise.all([
    prisma.page.findMany({ where: { isDeleted: false }, include: { translations: true } }),
    prisma.serviceCategory.findMany({ where: { isDeleted: false }, include: { translations: true } }),
    prisma.service.findMany({ where: { isDeleted: false }, include: { translations: true } }),
    prisma.blogCategory.findMany({ include: { translations: true } }),
    prisma.blogPost.findMany({ where: { isDeleted: false }, include: { translations: true } }),
    prisma.landingPage.findMany({ where: { isDeleted: false }, include: { translations: true } }),
  ]);

  // Decimal objelerini serialize et (client component'e göndermek için)
  const services = rawServices.map(s => ({
    ...s,
    price: s.price.toString(),
    deletedAt: s.deletedAt?.toISOString() || null
  }));

  return (
    <AdminShell title="Menü Yönetimi">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">Gelişmiş Menü & İçerik Bağlantıları</h2>
              <p className="text-sm text-gray-500 mt-1">Sitenin menülerini yönetin, CMS sayfalarınıza, hizmetlerinize ve bloglarınıza SEO uyumlu bir şekilde bağlayın.</p>
            </div>
            
            <MenusClient 
              initialItems={formattedMenuItems} 
              
              pages={pages}
              serviceCategories={serviceCategories}
              services={services}
              blogCategories={blogCategories}
              blogPosts={blogPosts}
              landingPages={landingPages}
            />
          </div>
    </AdminShell>
  );
}
