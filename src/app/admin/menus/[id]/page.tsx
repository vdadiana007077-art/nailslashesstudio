import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MenuEditClient from './MenuEditClient';

export default async function MenuEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token || token.value !== 'authenticated') {
    redirect('/admin/login');
  }

  // Yeni menü oluşturma modu
  const isNew = id === 'new';

  let menuItem = null;
  if (!isNew) {
    menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        translations: true,
        page: { include: { translations: true } },
        serviceCategory: { include: { translations: true } },
        service: { include: { translations: true } },
        blogCategory: { include: { translations: true } },
        blogPost: { include: { translations: true } },
        landingPage: { include: { translations: true } },
      }
    });

    if (!menuItem) {
      redirect('/admin/menus');
    }
  }

  // İçerik Seçenekleri
  const [pages, serviceCategories, rawServices, blogCategories, blogPosts, landingPages] = await Promise.all([
    prisma.page.findMany({ where: { isDeleted: false }, include: { translations: true } }),
    prisma.serviceCategory.findMany({ where: { isDeleted: false }, include: { translations: true } }),
    prisma.service.findMany({ where: { isDeleted: false }, include: { translations: true } }),
    prisma.blogCategory.findMany({ include: { translations: true } }),
    prisma.blogPost.findMany({ where: { isDeleted: false }, include: { translations: true } }),
    prisma.landingPage.findMany({ where: { isDeleted: false }, include: { translations: true } }),
  ]);

  const services = rawServices.map(s => ({
    ...s,
    price: s.price.toString(),
    deletedAt: s.deletedAt?.toISOString() || null
  }));

  // Serialize menu item
  const serializedMenuItem = menuItem ? {
    ...menuItem,
    createdAt: menuItem.createdAt.toISOString(),
    updatedAt: menuItem.updatedAt.toISOString(),
    service: menuItem.service ? { 
      ...menuItem.service, 
      price: menuItem.service.price.toString(), 
      deletedAt: menuItem.service.deletedAt?.toISOString() || null 
    } : null,
  } : null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <MenuEditClient
          menuItem={serializedMenuItem}
          isNew={isNew}
          pages={pages}
          serviceCategories={serviceCategories}
          services={services}
          blogCategories={blogCategories}
          blogPosts={blogPosts}
          landingPages={landingPages}
        />
      </div>
    </div>
  );
}
