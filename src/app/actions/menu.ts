"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { MenuType, Language, LinkType } from '@prisma/client';

export async function createMenuItem(formData: FormData) {
  const menuType = formData.get('menuType') as MenuType;
  const language = formData.get('language') as Language;
  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const order = parseInt(formData.get('order') as string || '0');
  const isActive = formData.get('isActive') === 'true';
  const target = formData.get('target') as string || '_self';
  const isExternal = formData.get('isExternal') === 'true';

  // Yeni LinkType verileri
  const linkType = (formData.get('linkType') as LinkType) || 'CUSTOM_URL';
  const pageId = formData.get('pageId') as string || null;
  const serviceCategoryId = formData.get('serviceCategoryId') as string || null;
  const serviceId = formData.get('serviceId') as string || null;
  const blogCategoryId = formData.get('blogCategoryId') as string || null;
  const blogPostId = formData.get('blogPostId') as string || null;
  const landingPageId = formData.get('landingPageId') as string || null;

  if (!menuType || !language || !title || !url) {
    return { success: false, error: 'Menü tipi, dil, başlık ve yönlendirme linki zorunludur!' };
  }

  try {
    const newItem = await prisma.menuItem.create({
      data: {
        menuType,
        language,
        title,
        url,
        order,
        isActive,
        target,
        isExternal,
        linkType,
        pageId,
        serviceCategoryId,
        serviceId,
        blogCategoryId,
        blogPostId,
        landingPageId
      },
      include: {
        page: { include: { translations: true } },
        serviceCategory: { include: { translations: true } },
        service: { include: { translations: true } },
        blogCategory: { include: { translations: true } },
        blogPost: { include: { translations: true } },
        landingPage: { include: { translations: true } }
      }
    });

    revalidatePath('/[locale]/admin/menus', 'page');
    revalidatePath('/', 'layout'); // Ortak menüler değiştiği için tüm layout cache'ini revalidate et
    return { success: true, data: newItem };
  } catch (error: any) {
    console.error('Menü elemanı oluşturma hatası:', error);
    return { success: false, error: 'Menü elemanı oluşturulurken bir hata oluştu.' };
  }
}

export async function updateMenuItem(id: string, formData: FormData) {
  const menuType = formData.get('menuType') as MenuType;
  const language = formData.get('language') as Language;
  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const order = parseInt(formData.get('order') as string || '0');
  const isActive = formData.get('isActive') === 'true';
  const target = formData.get('target') as string || '_self';
  const isExternal = formData.get('isExternal') === 'true';

  // Yeni LinkType verileri
  const linkType = (formData.get('linkType') as LinkType) || 'CUSTOM_URL';
  const pageId = formData.get('pageId') as string || null;
  const serviceCategoryId = formData.get('serviceCategoryId') as string || null;
  const serviceId = formData.get('serviceId') as string || null;
  const blogCategoryId = formData.get('blogCategoryId') as string || null;
  const blogPostId = formData.get('blogPostId') as string || null;
  const landingPageId = formData.get('landingPageId') as string || null;

  if (!menuType || !language || !title || !url) {
    return { success: false, error: 'Menü tipi, dil, başlık ve yönlendirme linki zorunludur!' };
  }

  try {
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        menuType,
        language,
        title,
        url,
        order,
        isActive,
        target,
        isExternal,
        linkType,
        pageId,
        serviceCategoryId,
        serviceId,
        blogCategoryId,
        blogPostId,
        landingPageId
      },
      include: {
        page: { include: { translations: true } },
        serviceCategory: { include: { translations: true } },
        service: { include: { translations: true } },
        blogCategory: { include: { translations: true } },
        blogPost: { include: { translations: true } },
        landingPage: { include: { translations: true } }
      }
    });

    revalidatePath('/[locale]/admin/menus', 'page');
    revalidatePath('/', 'layout');
    return { success: true, data: updatedItem };
  } catch (error: any) {
    console.error('Menü elemanı güncelleme hatası:', error);
    return { success: false, error: 'Menü elemanı güncellenirken bir hata oluştu.' };
  }
}

export async function deleteMenuItem(id: string) {
  // Kurallar gereği fiziksel silme yapmıyoruz, isActive = false yapıyoruz (soft-delete).
  try {
    await prisma.menuItem.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/[locale]/admin/menus', 'page');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Menü elemanı pasifleştirme hatası:', error);
    return { success: false, error: 'Menü elemanı silinirken bir hata oluştu.' };
  }
}
