"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Language } from '@prisma/client';
import { normalizeSlug } from '@/lib/page-resolver';

export async function createCmsPage(formData: FormData) {
  const isActive = formData.get('isActive') === 'true';
  const language = formData.get('language') as Language;
  const title = formData.get('title') as string;
  const slug = normalizeSlug(formData.get('slug') as string);
  const content = formData.get('content') as string;

  const seoTitle = formData.get('seoTitle') as string || null;
  const seoDesc = formData.get('seoDesc') as string || null;
  const canonical = formData.get('canonical') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDesc = formData.get('ogDesc') as string || null;
  const ogImage = formData.get('ogImage') as string || null;
  const index = formData.get('index') !== 'false';
  const sitemap = formData.get('sitemap') !== 'false';

  const pageGroup = formData.get('pageGroup') as string || null;
  const h1Title = formData.get('h1Title') as string || null;
  const editorTitle = formData.get('editorTitle') as string || null;
  const introText = formData.get('introText') as string || null;
  const headerImage = formData.get('headerImage') as string || null;
  const thumbnailImage = formData.get('thumbnailImage') as string || null;

  const headerMenu = formData.get('headerMenu') === 'true';
  const footerMenu = formData.get('footerMenu') === 'true';
  const order = parseInt(formData.get('order') as string || '0');

  if (!title || !slug || !language) {
    return { success: false, error: 'Başlık, slug ve dil alanları zorunludur!' };
  }

  try {
    // Dil bazında benzersiz slug kontrolü
    const existingSlug = await prisma.pageTranslation.findFirst({
      where: { slug, language },
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug zaten kullanılıyor!' };
    }

    const newPage = await prisma.page.create({
      data: {
        isActive,
        pageGroup,
        translations: {
          create: {
            language,
            slug,
            title,
            h1Title,
            editorTitle,
            introText,
            content,
            headerImage,
            thumbnailImage,
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
      },
    });

    // Menü entegrasyonu (Header/Footer)
    if (headerMenu || footerMenu) {
      if (headerMenu) {
        await createOrUpdateMenuItemForPage(newPage.id, 'HEADER', language, title, slug, order);
      }
      if (footerMenu) {
        await createOrUpdateMenuItemForPage(newPage.id, 'FOOTER', language, title, slug, order);
      }
    }

    revalidatePath('/[locale]/admin/pages', 'page');
    revalidatePath('/[locale]/[slug]', 'page');
    return { success: true, data: newPage };
  } catch (error: any) {
    console.error('CMS Sayfa oluşturma hatası:', error);
    return { success: false, error: 'Sayfa oluşturulurken bir hata oluştu.' };
  }
}

export async function updateCmsPage(
  id: string,
  translationId: string | null,
  formData: FormData
) {
  const isActive = formData.get('isActive') === 'true';
  const language = formData.get('language') as Language;
  const title = formData.get('title') as string;
  const slug = normalizeSlug(formData.get('slug') as string);
  const content = formData.get('content') as string;

  const seoTitle = formData.get('seoTitle') as string || null;
  const seoDesc = formData.get('seoDesc') as string || null;
  const canonical = formData.get('canonical') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDesc = formData.get('ogDesc') as string || null;
  const ogImage = formData.get('ogImage') as string || null;
  const index = formData.get('index') !== 'false';
  const sitemap = formData.get('sitemap') !== 'false';

  const pageGroup = formData.get('pageGroup') as string || null;
  const h1Title = formData.get('h1Title') as string || null;
  const editorTitle = formData.get('editorTitle') as string || null;
  const introText = formData.get('introText') as string || null;
  const headerImage = formData.get('headerImage') as string || null;
  const thumbnailImage = formData.get('thumbnailImage') as string || null;

  const headerMenu = formData.get('headerMenu') === 'true';
  const footerMenu = formData.get('footerMenu') === 'true';
  const order = parseInt(formData.get('order') as string || '0');

  if (!title || !slug || !language) {
    return { success: false, error: 'Başlık, slug ve dil alanları zorunludur!' };
  }

  try {
    // Dil bazında benzersiz slug kontrolü (kendisi hariç)
    const existingSlug = await prisma.pageTranslation.findFirst({
      where: {
        slug,
        language,
        NOT: translationId ? { id: translationId } : undefined,
      },
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug başka bir sayfada kullanılıyor!' };
    }

    // Ana kaydı güncelle
    await prisma.page.update({
      where: { id },
      data: { isActive, pageGroup },
    });

    // Çeviri kaydını oluştur veya güncelle
    if (translationId) {
      await prisma.pageTranslation.update({
        where: { id: translationId },
        data: {
          slug,
          title,
          h1Title,
          editorTitle,
          introText,
          content,
          headerImage,
          thumbnailImage,
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
      await prisma.pageTranslation.create({
        data: {
          pageId: id,
          language,
          slug,
          title,
          h1Title,
          editorTitle,
          introText,
          content,
          headerImage,
          thumbnailImage,
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

    // Menü entegrasyonu (Header/Footer) - Sadece seçili dilde
    if (headerMenu) {
      await createOrUpdateMenuItemForPage(id, 'HEADER', language, title, slug, order);
    } else {
      await removeMenuItemForPage(id, 'HEADER');
    }
    
    if (footerMenu) {
      await createOrUpdateMenuItemForPage(id, 'FOOTER', language, title, slug, order);
    } else {
      await removeMenuItemForPage(id, 'FOOTER');
    }

    revalidatePath('/[locale]/admin/pages', 'page');
    revalidatePath('/[locale]/[slug]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('CMS Sayfa güncelleme hatası:', error);
    return { success: false, error: 'Sayfa güncellenirken bir hata oluştu.' };
  }
}

export async function deleteCmsPage(id: string) {
  try {
    // Kurallar gereği soft delete uyguluyoruz
    await prisma.page.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });

    // Bağlı menüleri de pasife al
    await prisma.menuItem.updateMany({
      where: { pageId: id },
      data: { isActive: false },
    });

    revalidatePath('/[locale]/admin/pages', 'page');
    revalidatePath('/[locale]/[slug]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('CMS Sayfa silme hatası:', error);
    return { success: false, error: 'Sayfa silinirken bir hata oluştu.' };
  }
}

// Helper fonksiyon: Menü oluşturma veya güncelleme
async function createOrUpdateMenuItemForPage(pageId: string, menuType: 'HEADER' | 'FOOTER' | 'LEGAL_FOOTER', language: Language, title: string, slug: string, order: number) {
  let menuItem = await prisma.menuItem.findFirst({
    where: { pageId, menuType }
  });

  if (!menuItem) {
    menuItem = await prisma.menuItem.create({
      data: {
        menuType,
        linkType: 'CMS_PAGE',
        pageId,
        order,
        isActive: true,
        translations: {
          create: {
            language,
            title,
            url: `/${slug}`
          }
        }
      }
    });
  } else {
    // order ve activity güncelle
    await prisma.menuItem.update({
      where: { id: menuItem.id },
      data: { order, isActive: true }
    });

    // Çeviri var mı bak
    const existingTrans = await prisma.menuItemTranslation.findFirst({
      where: { menuItemId: menuItem.id, language }
    });

    if (existingTrans) {
      await prisma.menuItemTranslation.update({
        where: { id: existingTrans.id },
        data: { title, url: `/${slug}` }
      });
    } else {
      await prisma.menuItemTranslation.create({
        data: {
          menuItemId: menuItem.id,
          language,
          title,
          url: `/${slug}`
        }
      });
    }
  }
}

// Helper fonksiyon: Menüden kaldırma
async function removeMenuItemForPage(pageId: string, menuType: 'HEADER' | 'FOOTER' | 'LEGAL_FOOTER') {
  // İlişkili menü kaydını tamamen silmek yerine pasife de alabiliriz veya silebiliriz.
  // En sağlıklısı pasife almaktır.
  await prisma.menuItem.updateMany({
    where: { pageId, menuType },
    data: { isActive: false }
  });
}

// Menü Durumu Değiştirme (Liste Üzerinden)
export async function togglePageMenuStatus(pageId: string, menuType: 'HEADER' | 'FOOTER', targetStatus: boolean) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { translations: true }
    });
    
    if (!page) return { success: false, error: 'Sayfa bulunamadı' };
    
    const defaultLang = 'TR';
    const translation = page.translations.find(t => t.language === defaultLang) || page.translations[0];

    if (targetStatus) {
      // Sipariş numarası varsayılan 99 olarak eklenir, kullanıcı editörden düzenleyebilir.
      await createOrUpdateMenuItemForPage(pageId, menuType, translation.language as Language, translation.title, translation.slug, 99);
    } else {
      await removeMenuItemForPage(pageId, menuType);
    }
    
    revalidatePath('/[locale]/admin/pages', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Menu toggle hatası:', error);
    return { success: false, error: 'İşlem başarısız oldu' };
  }
}

