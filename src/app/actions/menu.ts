"use server";
 
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { MenuType, Language, LinkType } from '@prisma/client';

export async function mergeDuplicateMenuItems() {
  try {
    // 1. Tüm menü elemanlarını ve çevirilerini çek
    const menuItems = await prisma.menuItem.findMany({
      include: {
        translations: true
      }
    });

    // 2. Menü elemanlarını gruplayalım.
    // Gruplama kriteri: menuType ve order. Sırası ve grubu aynı olan menüler mükerrer kabul edilir.
    const groups: Record<string, typeof menuItems> = {};
    for (const item of menuItems) {
      const key = `${item.menuType}_${item.order}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    }

    let mergedCount = 0;

    for (const key in groups) {
      const group = groups[key];
      if (group.length <= 1) continue; // Mükerrer yoksa geç

      // İlk menüyü ana (main) menü seçelim
      const mainItem = group[0];

      // Diğer menülerin içindeki çevirileri ana menüye taşıyalım
      for (let i = 1; i < group.length; i++) {
        const dupItem = group[i];
        
        for (const trans of dupItem.translations) {
          // Eğer ana menüde bu dilde bir çeviri yoksa ekle
          const hasTrans = mainItem.translations.some(t => t.language === trans.language);
          if (!hasTrans) {
            await prisma.menuItemTranslation.create({
              data: {
                menuItemId: mainItem.id,
                language: trans.language,
                title: trans.title,
                url: trans.url
              }
            });
            mainItem.translations.push(trans);
          }
        }

        // Çevirilerini kopyaladıktan sonra bu duplicate menü elemanını tamamen ve güvenle silelim
        await prisma.menuItem.delete({
          where: { id: dupItem.id }
        });

        mergedCount++;
      }
    }

    revalidatePath('/[locale]/admin/menus', 'page');
    revalidatePath('/', 'layout');
    return { success: true, mergedCount };
  } catch (error) {
    console.error("Menü birleştirme hatası:", error);
    return { success: false, error: "Menü birleştirme sırasında hata oluştu." };
  }
}

export async function createMenuItem(formData: FormData) {
  const menuType = formData.get('menuType') as MenuType;
  const order = parseInt(formData.get('order') as string || '0');
  const isActive = formData.get('isActive') === 'true';
  const target = formData.get('target') as string || '_self';
  const isExternal = formData.get('isExternal') === 'true';

  const linkType = (formData.get('linkType') as LinkType) || 'CUSTOM_URL';
  const pageId = formData.get('pageId') as string || null;
  const serviceCategoryId = formData.get('serviceCategoryId') as string || null;
  const serviceId = formData.get('serviceId') as string || null;
  const blogCategoryId = formData.get('blogCategoryId') as string || null;
  const blogPostId = formData.get('blogPostId') as string || null;
  const landingPageId = formData.get('landingPageId') as string || null;

  const translationsRaw = formData.get('translations') as string;
  let translations: Array<{ language: Language; title: string; url: string; seoTitle?: string; seoDesc?: string; ogImage?: string; headerImage?: string; }> = [];
  try {
    translations = JSON.parse(translationsRaw);
  } catch (_) {
    return { success: false, error: 'Çeviri verileri geçersiz!' };
  }

  if (!menuType || !translations || translations.length === 0) {
    return { success: false, error: 'Menü tipi ve en az bir dilde başlık/url zorunludur!' };
  }

  try {
    const newItem = await prisma.menuItem.create({
      data: {
        menuType,
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
        landingPageId,
        translations: {
          create: translations.filter(t => t.title && t.url).map(t => ({
            language: t.language,
            title: t.title,
            url: t.url,
            seoTitle: t.seoTitle || null,
            seoDesc: t.seoDesc || null,
            ogImage: t.ogImage || null,
            headerImage: t.headerImage || null
          }))
        }
      },
      include: {
        translations: true
      }
    });

    revalidatePath('/[locale]/admin/menus', 'page');
    revalidatePath('/', 'layout');
    return { success: true, data: newItem };
  } catch (error: any) {
    console.error('Menü elemanı oluşturma hatası:', error);
    return { success: false, error: 'Menü elemanı oluşturulurken bir hata oluştu.' };
  }
}

export async function updateMenuItem(id: string, translationsRaw: string, formData: FormData) {
  const menuType = formData.get('menuType') as MenuType;
  const order = parseInt(formData.get('order') as string || '0');
  const isActive = formData.get('isActive') === 'true';
  const target = formData.get('target') as string || '_self';
  const isExternal = formData.get('isExternal') === 'true';

  const linkType = (formData.get('linkType') as LinkType) || 'CUSTOM_URL';
  const pageId = formData.get('pageId') as string || null;
  const serviceCategoryId = formData.get('serviceCategoryId') as string || null;
  const serviceId = formData.get('serviceId') as string || null;
  const blogCategoryId = formData.get('blogCategoryId') as string || null;
  const blogPostId = formData.get('blogPostId') as string || null;
  const landingPageId = formData.get('landingPageId') as string || null;

  let translations: Array<{ language: Language; title: string; url: string; seoTitle?: string; seoDesc?: string; ogImage?: string; headerImage?: string; }> = [];
  try {
    translations = JSON.parse(translationsRaw);
  } catch (_) {
    return { success: false, error: 'Çeviri verileri geçersiz!' };
  }

  if (!menuType || !translations || translations.length === 0) {
    return { success: false, error: 'Menü tipi ve en az bir dilde başlık/url zorunludur!' };
  }

  try {
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { translations: true }
    });

    if (!existingItem) {
      return { success: false, error: 'Güncellenecek menü kaydı bulunamadı!' };
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        menuType,
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
        translations: true
      }
    });

    // Çevirileri güncelle veya oluştur
    for (const t of translations) {
      if (!t.title || !t.url) continue;

      const existingTrans = existingItem.translations.find((ex) => ex.language === t.language);
      if (existingTrans) {
        await prisma.menuItemTranslation.update({
          where: { id: existingTrans.id },
          data: {
            title: t.title,
            url: t.url,
            seoTitle: t.seoTitle || null,
            seoDesc: t.seoDesc || null,
            ogImage: t.ogImage || null,
            headerImage: t.headerImage || null
          }
        });
      } else {
        await prisma.menuItemTranslation.create({
          data: {
            menuItemId: id,
            language: t.language,
            title: t.title,
            url: t.url,
            seoTitle: t.seoTitle || null,
            seoDesc: t.seoDesc || null,
            ogImage: t.ogImage || null,
            headerImage: t.headerImage || null
          }
        });
      }
    }

    revalidatePath('/[locale]/admin/menus', 'page');
    revalidatePath('/', 'layout');
    return { success: true, data: updatedItem };
  } catch (error: any) {
    console.error('Menü elemanı güncelleme hatası:', error);
    return { success: false, error: 'Menü elemanı güncellenirken bir hata oluştu.' };
  }
}

export async function deleteMenuItem(id: string) {
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
