"use server";

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Language } from '@prisma/client';

// Admin yetki kontrolü yapan yardımcı fonksiyon
async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  if (!token || token.value !== 'authenticated') {
    throw new Error('Yetkisiz erişim!');
  }
}

export async function updateService(
  id: string,
  translationId: string | null,
  formData: FormData
) {
  try {
    await checkAdmin();

    const price = formData.get('price') as string;
    const duration = parseInt(formData.get('duration') as string || '0');
    const image = formData.get('image') as string || null;
    const isActive = formData.get('isActive') === 'true';

    const language = formData.get('language') as Language;
    const name = formData.get('name') as string;
    const slug = (formData.get('slug') as string || '').toLowerCase().trim();
    const description = formData.get('description') as string;
    const longDescription = formData.get('longDescription') as string || null;

    const seoTitle = formData.get('seoTitle') as string || null;
    const seoDesc = formData.get('seoDesc') as string || null;
    const canonical = formData.get('canonical') as string || null;
    const ogTitle = formData.get('ogTitle') as string || null;
    const ogDesc = formData.get('ogDesc') as string || null;
    const ogImage = formData.get('ogImage') as string || null;
    const index = formData.get('index') !== 'false';
    const sitemap = formData.get('sitemap') !== 'false';

    // İlişkili bloglar ve SSS'ler
    const selectedFaqs = formData.get('faqIds') ? JSON.parse(formData.get('faqIds') as string) : [];
    const selectedBlogs = formData.get('blogIds') ? JSON.parse(formData.get('blogIds') as string) : [];

    if (!name || !slug || !language) {
      return { success: false, error: 'Hizmet adı, slug ve dil zorunludur!' };
    }

    // Slug benzersizlik kontrolü (kendisi hariç)
    const existingSlug = await prisma.serviceTranslation.findFirst({
      where: {
        slug,
        language,
        NOT: translationId ? { id: translationId } : undefined
      }
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug başka bir hizmette kullanılıyor!' };
    }

    // Ana hizmeti güncelle
    await prisma.service.update({
      where: { id },
      data: {
        price,
        duration,
        image,
        isActive
      }
    });

    // Çeviriyi güncelle veya oluştur
    if (translationId) {
      await prisma.serviceTranslation.update({
        where: { id: translationId },
        data: {
          name,
          slug,
          description,
          longDescription,
          seoTitle,
          seoDesc,
          canonical,
          ogTitle,
          ogDesc,
          ogImage,
          index,
          sitemap
        }
      });
    } else {
      await prisma.serviceTranslation.create({
        data: {
          serviceId: id,
          language,
          name,
          slug,
          description,
          longDescription,
          seoTitle,
          seoDesc,
          canonical,
          ogTitle,
          ogDesc,
          ogImage,
          index,
          sitemap
        }
      });
    }

    // FAQ İlişkilerini Güncelle
    await prisma.faq.updateMany({
      where: { serviceId: id },
      data: { serviceId: null }
    });

    if (selectedFaqs.length > 0) {
      await prisma.faq.updateMany({
        where: { id: { in: selectedFaqs } },
        data: { serviceId: id }
      });
    }

    // Blog yazısı ilişkilerini güncelle
    await prisma.blogPostService.deleteMany({
      where: { serviceId: id }
    });

    if (selectedBlogs.length > 0) {
      const blogRelations = selectedBlogs.map((blogId: string) => ({
        blogPostId: blogId,
        serviceId: id
      }));
      await prisma.blogPostService.createMany({
        data: blogRelations
      });
    }

    revalidatePath('/[locale]/admin/services', 'page');
    revalidatePath('/[locale]/services', 'page');
    revalidatePath('/[locale]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Hizmet detay güncelleme hatası:', error);
    return { success: false, error: 'Hizmet güncellenirken bir hata oluştu.' };
  }
}

export async function createService(formData: FormData) {
  try {
    await checkAdmin();

    const categoryId = formData.get('categoryId') as string;
    const price = formData.get('price') as string;
    const duration = parseInt(formData.get('duration') as string || '30');
    const image = formData.get('image') as string || null;
    const isActive = formData.get('isActive') === 'true';

    const language = formData.get('language') as Language;
    const name = formData.get('name') as string;
    const slug = (formData.get('slug') as string || name.toLowerCase().replace(/\s+/g, '-')).toLowerCase().trim();
    const description = formData.get('description') as string || 'Hizmet detayı';

    if (!name || !categoryId) {
      return { success: false, error: 'Kategori ve hizmet adı zorunludur!' };
    }

    // Slug kontrolü
    const existingSlug = await prisma.serviceTranslation.findFirst({
      where: { slug, language }
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug zaten kullanılıyor!' };
    }

    const newService = await prisma.service.create({
      data: {
        categoryId,
        price,
        duration,
        image,
        isActive,
        translations: {
          create: {
            language,
            name,
            slug,
            description
          }
        }
      }
    });

    revalidatePath('/[locale]/admin/services', 'page');
    revalidatePath('/[locale]', 'page');
    return { success: true, data: newService };
  } catch (error: any) {
    console.error('Hizmet ekleme hatası:', error);
    return { success: false, error: 'Hizmet eklenirken bir hata oluştu.' };
  }
}

export async function updateCategory(
  id: string,
  translationId: string | null,
  formData: FormData
) {
  try {
    await checkAdmin();

    const isActive = formData.get('isActive') === 'true';
    const order = parseInt(formData.get('order') as string || '0');
    const image = formData.get('image') as string || null;

    const language = formData.get('language') as Language;
    const name = formData.get('name') as string;
    const slug = (formData.get('slug') as string || '').toLowerCase().trim();
    const description = formData.get('description') as string || null;

    const seoTitle = formData.get('seoTitle') as string || null;
    const seoDesc = formData.get('seoDesc') as string || null;
    const canonical = formData.get('canonical') as string || null;
    const ogTitle = formData.get('ogTitle') as string || null;
    const ogDesc = formData.get('ogDesc') as string || null;
    const ogImage = formData.get('ogImage') as string || null;
    const index = formData.get('index') !== 'false';
    const sitemap = formData.get('sitemap') !== 'false';

    if (!name || !slug || !language) {
      return { success: false, error: 'Kategori adı, slug ve dil alanları zorunludur!' };
    }

    // Slug kontrolü (kendisi hariç)
    const existingSlug = await prisma.serviceCategoryTranslation.findFirst({
      where: {
        slug,
        language,
        NOT: translationId ? { id: translationId } : undefined
      }
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug başka bir kategoride kullanılıyor!' };
    }

    // Ana kategoriyi güncelle
    await prisma.serviceCategory.update({
      where: { id },
      data: { order, isActive, image }
    });

    // Çeviriyi güncelle veya oluştur
    if (translationId) {
      await prisma.serviceCategoryTranslation.update({
        where: { id: translationId },
        data: {
          name,
          slug,
          description,
          seoTitle,
          seoDesc,
          canonical,
          ogTitle,
          ogDesc,
          ogImage,
          index,
          sitemap
        }
      });
    } else {
      await prisma.serviceCategoryTranslation.create({
        data: {
          categoryId: id,
          language,
          name,
          slug,
          description,
          seoTitle,
          seoDesc,
          canonical,
          ogTitle,
          ogDesc,
          ogImage,
          index,
          sitemap
        }
      });
    }

    revalidatePath('/[locale]/admin/categories', 'page');
    revalidatePath('/[locale]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Kategori detay güncelleme hatası:', error);
    return { success: false, error: 'Kategori güncellenirken bir hata oluştu.' };
  }
}

export async function createCategory(data: {
  name: string;
  slug: string;
  seoTitle?: string;
  seoDesc?: string;
  description?: string;
}) {
  try {
    await checkAdmin();
    
    await prisma.serviceCategory.create({
      data: {
        isActive: true,
        translations: {
          create: [
            { 
              language: 'TR', 
              name: data.name, 
              slug: data.slug,
              seoTitle: data.seoTitle,
              seoDesc: data.seoDesc,
              description: data.description
            },
            { language: 'EN', name: data.name, slug: data.slug }, 
            { language: 'DE', name: data.name, slug: data.slug },
            { language: 'RU', name: data.name, slug: data.slug },
          ]
        }
      }
    });

    revalidatePath('/[locale]', 'page');
    revalidatePath('/[locale]/admin/categories', 'page');
    
    return { success: true };
  } catch (error) {
    console.error("Kategori eklenemedi:", error);
    return { success: false, error: "Kategori eklenirken bir hata oluştu." };
  }
}

