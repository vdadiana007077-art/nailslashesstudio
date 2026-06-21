import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import ServiceList from '@/components/admin/ServiceList';
import Link from 'next/link';

export default async function AdminServicesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Güvenlik Kontrolü
  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  // Kategorileri, hizmetleri ve ilişkili verileri çek
  const categories = await prisma.serviceCategory.findMany({
    where: { isDeleted: false },
    orderBy: { order: 'asc' },
    include: {
      translations: { where: { language: 'TR' } },
      services: {
        where: { isDeleted: false },
        include: {
          translations: true,
          faqs: true,
          blogPosts: true,
          staff: true
        }
      }
    }
  });

  // İlişkilendirilecek tüm SSS ve Blogları çek
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

  // Client formatı
  const formattedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.translations[0]?.name || 'İsimsiz Kategori',
    services: cat.services.map(s => ({
      id: s.id,
      price: s.price.toString(),
      duration: s.duration,
      image: s.image,
      isActive: s.isActive,
      faqIds: s.faqs.map(f => f.id),
      blogIds: s.blogPosts.map(bp => bp.blogPostId),
      staffIds: (s as any).staff.map((ss: any) => ss.staffId),
      translations: s.translations.map(t => ({
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
        sitemap: t.sitemap
      }))
    }))
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
    <AdminShell title="Hizmet Yönetimi">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Tüm Hizmetler</h2>
              <p className="text-sm text-gray-500">Tüm dillerdeki detayları, görselleri, SSS ve Blog ilişkilerini yönetebilirsiniz.</p>
            </div>
            <Link 
              href="/admin/services/new"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-black transition-colors"
            >
              Yeni Hizmet Ekle
            </Link>
          </div>

          <ServiceList 
            categories={formattedCategories} 
            faqs={formattedFaqs} 
            blogPosts={formattedBlogs}
            staffList={formattedStaff}
          />
    </AdminShell>
  );
}
