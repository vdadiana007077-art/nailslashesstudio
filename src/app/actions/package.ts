"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Language } from '@prisma/client';

export async function createPackage(formData: FormData, selectedServices: { serviceId: string; quantity: number }[]) {
  const price = parseFloat(formData.get('price') as string);
  const isActive = formData.get('isActive') === 'true';
  const language = formData.get('language') as Language;
  
  const name = formData.get('name') as string;
  const slug = (formData.get('slug') as string).toLowerCase().trim();
  const description = formData.get('description') as string;

  const seoTitle = formData.get('seoTitle') as string || null;
  const seoDesc = formData.get('seoDesc') as string || null;
  const canonical = formData.get('canonical') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDesc = formData.get('ogDesc') as string || null;
  const ogImage = formData.get('ogImage') as string || null;
  const index = formData.get('index') !== 'false';
  const sitemap = formData.get('sitemap') !== 'false';

  if (!name || !slug || !language || isNaN(price) || selectedServices.length === 0) {
    return { success: false, error: 'Paket adı, slug, dil, fiyat ve en az bir hizmet seçimi zorunludur!' };
  }

  try {
    // Dil bazında benzersiz slug kontrolü
    const existingSlug = await prisma.packageTranslation.findFirst({
      where: { slug, language },
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug zaten kullanılıyor!' };
    }

    const newPackage = await prisma.package.create({
      data: {
        price,
        isActive,
        translations: {
          create: {
            language,
            slug,
            name,
            description,
            seoTitle,
            seoDesc,
            canonical,
            ogTitle,
            ogDesc,
            ogImage,
            index,
            sitemap,
          },
        },
        services: {
          createMany: {
            data: selectedServices.map(s => ({
              serviceId: s.serviceId,
              quantity: s.quantity,
            })),
          },
        },
      },
    });

    revalidatePath('/[locale]/admin/packages', 'page');
    revalidatePath('/[locale]/booking', 'page');
    return { success: true, data: newPackage };
  } catch (error: any) {
    console.error('Paket oluşturma hatası:', error);
    return { success: false, error: 'Hizmet paketi oluşturulurken bir hata oluştu.' };
  }
}

export async function updatePackage(
  id: string,
  translationId: string | null,
  formData: FormData,
  selectedServices: { serviceId: string; quantity: number }[]
) {
  const price = parseFloat(formData.get('price') as string);
  const isActive = formData.get('isActive') === 'true';
  const language = formData.get('language') as Language;
  
  const name = formData.get('name') as string;
  const slug = (formData.get('slug') as string).toLowerCase().trim();
  const description = formData.get('description') as string;

  const seoTitle = formData.get('seoTitle') as string || null;
  const seoDesc = formData.get('seoDesc') as string || null;
  const canonical = formData.get('canonical') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDesc = formData.get('ogDesc') as string || null;
  const ogImage = formData.get('ogImage') as string || null;
  const index = formData.get('index') !== 'false';
  const sitemap = formData.get('sitemap') !== 'false';

  if (!name || !slug || !language || isNaN(price) || selectedServices.length === 0) {
    return { success: false, error: 'Paket adı, slug, dil, fiyat ve en az bir hizmet seçimi zorunludur!' };
  }

  try {
    // Dil bazında benzersiz slug kontrolü (kendisi hariç)
    const existingSlug = await prisma.packageTranslation.findFirst({
      where: {
        slug,
        language,
        NOT: translationId ? { id: translationId } : undefined,
      },
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug başka bir pakette kullanılıyor!' };
    }

    // Ana kaydı güncelle
    await prisma.package.update({
      where: { id },
      data: {
        price,
        isActive,
      },
    });

    // Hizmet bağlantılarını temizle ve yeniden oluştur
    await prisma.packageService.deleteMany({
      where: { packageId: id },
    });

    await prisma.packageService.createMany({
      data: selectedServices.map(s => ({
        packageId: id,
        serviceId: s.serviceId,
        quantity: s.quantity,
      })),
    });

    // Çeviri kaydını oluştur veya güncelle
    if (translationId) {
      await prisma.packageTranslation.update({
        where: { id: translationId },
        data: {
          slug,
          name,
          description,
          seoTitle,
          seoDesc,
          canonical,
          ogTitle,
          ogDesc,
          ogImage,
          index,
          sitemap,
        },
      });
    } else {
      await prisma.packageTranslation.create({
        data: {
          packageId: id,
          language,
          slug,
          name,
          description,
          seoTitle,
          seoDesc,
          canonical,
          ogTitle,
          ogDesc,
          ogImage,
          index,
          sitemap,
        },
      });
    }

    revalidatePath('/[locale]/admin/packages', 'page');
    revalidatePath('/[locale]/booking', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Paket güncelleme hatası:', error);
    return { success: false, error: 'Hizmet paketi güncellenirken bir hata oluştu.' };
  }
}

export async function deletePackage(id: string) {
  try {
    // Kurallar gereği soft delete uyguluyoruz
    await prisma.package.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });

    revalidatePath('/[locale]/admin/packages', 'page');
    revalidatePath('/[locale]/booking', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Paket silme hatası:', error);
    return { success: false, error: 'Hizmet paketi silinirken bir hata oluştu.' };
  }
}
