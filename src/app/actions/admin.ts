"use server";

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Admin yetki kontrolü yapan yardımcı fonksiyon
async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  if (!token || token.value !== 'authenticated') {
    throw new Error('Yetkisiz erişim!');
  }
}

export async function updateServicePrice(serviceId: string, newPrice: string, newDuration: number) {
  try {
    await checkAdmin();
    
    await prisma.service.update({
      where: { id: serviceId },
      data: { 
        price: newPrice,
        duration: newDuration 
      }
    });

    // Ana sayfa ve admin sayfasının önbelleğini temizle
    revalidatePath('/[locale]', 'page');
    revalidatePath('/[locale]/admin/services', 'page');
    
    return { success: true };
  } catch (error) {
    console.error("Hizmet güncellenirken hata:", error);
    return { success: false, error: "Hizmet güncellenemedi." };
  }
}

export async function toggleServiceStatus(serviceId: string, isActive: boolean) {
  try {
    await checkAdmin();
    
    await prisma.service.update({
      where: { id: serviceId },
      data: { isActive }
    });

    revalidatePath('/[locale]', 'page');
    revalidatePath('/[locale]/admin/services', 'page');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Durum değiştirilemedi." };
  }
}

export async function createService(data: {
  categoryId: string;
  name: string;
  price: string;
  duration: number;
}) {
  try {
    await checkAdmin();
    
    // Veritabanına yeni hizmeti ekle
    await prisma.service.create({
      data: {
        categoryId: data.categoryId,
        price: data.price,
        duration: data.duration,
        isActive: true,
        translations: {
          create: [
            { language: 'TR', name: data.name, slug: data.name.toLowerCase().replace(/\s+/g, '-'), description: 'Hizmet detayı' },
            { language: 'EN', name: data.name, slug: data.name.toLowerCase().replace(/\s+/g, '-'), description: 'Service details' },
            { language: 'DE', name: data.name, slug: data.name.toLowerCase().replace(/\s+/g, '-'), description: 'Dienstleistungsdetails' },
            { language: 'RU', name: data.name, slug: data.name.toLowerCase().replace(/\s+/g, '-'), description: 'Детали услуги' },
          ]
        }
      }
    });

    revalidatePath('/[locale]', 'page');
    revalidatePath('/[locale]/admin/services', 'page');
    
    return { success: true };
  } catch (error) {
    console.error("Yeni hizmet eklenemedi:", error);
    return { success: false, error: "Yeni hizmet eklenirken bir sorun oluştu." };
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
    
    // Veritabanına yeni kategoriyi ekle
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
