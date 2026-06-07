import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import GalleryAdminClient from './GalleryAdminClient';

export const dynamic = 'force-dynamic';

export default async function GalleryAdminPage() {
  let categories: any[] = [];
  let items: any[] = [];
  let locations: any[] = [];
  let services: any[] = [];

  try {
    const rawCategories = await prisma.galleryCategory.findMany({
      where: { isDeleted: false },
      include: { translations: true, _count: { select: { items: { where: { isDeleted: false } } } } },
      orderBy: { order: 'asc' }
    });
    categories = JSON.parse(JSON.stringify(rawCategories));

    const rawItems = await prisma.galleryItem.findMany({
      where: { isDeleted: false },
      include: { translations: true, category: { include: { translations: true } } },
      orderBy: { order: 'asc' }
    });
    items = JSON.parse(JSON.stringify(rawItems));

    const rawLocations = await prisma.location.findMany({
      where: { isActive: true, isDeleted: false },
      select: { id: true, name: true }
    });
    locations = JSON.parse(JSON.stringify(rawLocations));

    const rawServices = await prisma.service.findMany({
      where: { isActive: true, isDeleted: false },
      include: { translations: { where: { language: 'TR' } } }
    });
    services = rawServices.map(s => ({
      id: s.id,
      name: s.translations[0]?.name || 'İsimsiz Hizmet'
    }));
  } catch (error) {
    console.error('Galeri admin veri hatası:', error);
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <GalleryAdminClient
          initialCategories={categories}
          initialItems={items}
          locations={locations}
          services={services}
        />
      </main>
    </div>
  );
}
