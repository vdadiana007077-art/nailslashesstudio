import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ServiceEditClient from './ServiceEditClient';

export default async function ServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token || token.value !== 'authenticated') {
    redirect('/admin/login');
  }

  const isNew = id === 'new';

  let service = null;
  if (!isNew) {
    service = await prisma.service.findUnique({
      where: { id },
      include: {
        translations: true,
        faqs: true,
        blogPosts: true,
        staff: true,
      },
    });
    if (!service) redirect('/admin/services');
  }

  // Kategorileri çek
  const categories = await prisma.serviceCategory.findMany({
    where: { isDeleted: false, isActive: true },
    include: { translations: { where: { language: 'TR' } } },
    orderBy: { order: 'asc' },
  });

  // İlgili SSS ve Blogları çek
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const blogPosts = await prisma.blogPost.findMany({
    where: { isDeleted: false, isActive: true },
    include: {
      translations: { where: { language: 'TR' } }
    }
  });

  // Personel listesini çek
  const staffMembers = await prisma.staff.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });

  const serializedService = service ? {
    id: service.id,
    categoryId: service.categoryId,
    price: service.price.toString(),
    duration: service.duration,
    image: service.image,
    isActive: service.isActive,
    faqIds: service.faqs.map(f => f.id),
    blogIds: service.blogPosts.map(bp => bp.blogPostId),
    staffIds: service.staff.map(ss => ss.staffId),
    translations: service.translations.map(t => ({
      id: t.id,
      language: t.language,
      name: t.name,
      slug: t.slug,
      description: t.description || '',
      longDescription: t.longDescription || '',
      seoTitle: t.seoTitle || '',
      seoDesc: t.seoDesc || '',
      canonical: t.canonical || '',
      ogTitle: t.ogTitle || '',
      ogDesc: t.ogDesc || '',
      ogImage: t.ogImage || '',
      index: t.index,
      sitemap: t.sitemap,
    })),
  } : null;

  const formattedCategories = categories.map(c => ({
    id: c.id,
    name: c.translations[0]?.name || 'İsimsiz Kategori',
  }));

  const formattedFaqs = faqs.map(f => ({
    id: f.id,
    question: f.question
  }));

  const formattedBlogs = blogPosts.map(b => ({
    id: b.id,
    title: b.translations[0]?.title || 'Başlıksız Blog'
  }));

  const formattedStaff = staffMembers.map(s => ({
    id: s.id,
    name: s.name
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <ServiceEditClient
          service={serializedService}
          isNew={isNew}
          categories={formattedCategories}
          faqs={formattedFaqs}
          blogPosts={formattedBlogs}
          staffList={formattedStaff}
        />
      </div>
    </div>
  );
}
