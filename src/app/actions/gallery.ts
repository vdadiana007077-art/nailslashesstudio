'use server';

import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const LANGUAGES: Language[] = ['TR', 'EN', 'DE', 'RU'];

// ═══════════════════════════════════════════════════
// GALERİ KATEGORİ İŞLEMLERİ
// ═══════════════════════════════════════════════════

export async function getGalleryCategories() {
  try {
    const categories = await prisma.galleryCategory.findMany({
      where: { isDeleted: false },
      include: { translations: true, _count: { select: { items: { where: { isDeleted: false } } } } },
      orderBy: { order: 'asc' }
    });
    return { success: true, categories: JSON.parse(JSON.stringify(categories)) };
  } catch (error) {
    console.error('getGalleryCategories error:', error);
    return { success: false, categories: [] };
  }
}

export async function createGalleryCategory(data: {
  isActive: boolean;
  order: number;
  image?: string;
  ogImage?: string;
  canonical?: string;
  noIndex: boolean;
  translations: Array<{
    language: Language;
    name: string;
    slug: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
  }>;
}) {
  try {
    const category = await prisma.galleryCategory.create({
      data: {
        isActive: data.isActive,
        order: data.order,
        image: data.image || null,
        ogImage: data.ogImage || null,
        canonical: data.canonical || null,
        noIndex: data.noIndex,
        translations: {
          createMany: {
            data: data.translations.map(t => ({
              language: t.language,
              name: t.name,
              slug: t.slug,
              description: t.description || null,
              seoTitle: t.seoTitle || null,
              seoDescription: t.seoDescription || null,
            }))
          }
        }
      }
    });
    revalidatePath('/admin/gallery');
    return { success: true, id: category.id };
  } catch (error) {
    console.error('createGalleryCategory error:', error);
    return { success: false, error: 'Kategori oluşturulamadı.' };
  }
}

export async function updateGalleryCategory(id: string, data: {
  isActive: boolean;
  order: number;
  image?: string;
  ogImage?: string;
  canonical?: string;
  noIndex: boolean;
  translations: Array<{
    language: Language;
    name: string;
    slug: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
  }>;
}) {
  try {
    await prisma.galleryCategory.update({
      where: { id },
      data: {
        isActive: data.isActive,
        order: data.order,
        image: data.image || null,
        ogImage: data.ogImage || null,
        canonical: data.canonical || null,
        noIndex: data.noIndex,
      }
    });

    // Çevirileri upsert et
    for (const t of data.translations) {
      await prisma.galleryCategoryTranslation.upsert({
        where: { categoryId_language: { categoryId: id, language: t.language } },
        create: {
          categoryId: id,
          language: t.language,
          name: t.name,
          slug: t.slug,
          description: t.description || null,
          seoTitle: t.seoTitle || null,
          seoDescription: t.seoDescription || null,
        },
        update: {
          name: t.name,
          slug: t.slug,
          description: t.description || null,
          seoTitle: t.seoTitle || null,
          seoDescription: t.seoDescription || null,
        }
      });
    }

    revalidatePath('/admin/gallery');
    return { success: true };
  } catch (error) {
    console.error('updateGalleryCategory error:', error);
    return { success: false, error: 'Kategori güncellenemedi.' };
  }
}

export async function deleteGalleryCategory(id: string) {
  try {
    await prisma.galleryCategory.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
    revalidatePath('/admin/gallery');
    return { success: true };
  } catch (error) {
    console.error('deleteGalleryCategory error:', error);
    return { success: false, error: 'Kategori silinemedi.' };
  }
}

export async function reorderGalleryCategories(items: Array<{ id: string; order: number }>) {
  try {
    for (const item of items) {
      await prisma.galleryCategory.update({ where: { id: item.id }, data: { order: item.order } });
    }
    revalidatePath('/admin/gallery');
    return { success: true };
  } catch (_e) {
    return { success: false };
  }
}

// ═══════════════════════════════════════════════════
// GALERİ FOTOĞRAF İŞLEMLERİ
// ═══════════════════════════════════════════════════

export async function getGalleryItems() {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { isDeleted: false },
      include: { translations: true, category: { include: { translations: true } } },
      orderBy: { order: 'asc' }
    });
    return { success: true, items: JSON.parse(JSON.stringify(items)) };
  } catch (error) {
    console.error('getGalleryItems error:', error);
    return { success: false, items: [] };
  }
}

export async function createGalleryItem(data: {
  imageUrl: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: string;
  locationId?: string;
  serviceId?: string;
  translations: Array<{
    language: Language;
    title?: string;
    description?: string;
    altText?: string;
  }>;
}) {
  try {
    const item = await prisma.galleryItem.create({
      data: {
        imageUrl: data.imageUrl,
        order: data.order,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId || null,
        locationId: data.locationId || null,
        serviceId: data.serviceId || null,
        translations: {
          createMany: {
            data: data.translations.map(t => ({
              language: t.language,
              title: t.title || null,
              description: t.description || null,
              altText: t.altText || null,
            }))
          }
        }
      }
    });
    revalidatePath('/admin/gallery');
    return { success: true, id: item.id };
  } catch (error) {
    console.error('createGalleryItem error:', error);
    return { success: false, error: 'Fotoğraf eklenemedi.' };
  }
}

export async function updateGalleryItem(id: string, data: {
  imageUrl: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: string;
  locationId?: string;
  serviceId?: string;
  translations: Array<{
    language: Language;
    title?: string;
    description?: string;
    altText?: string;
  }>;
}) {
  try {
    await prisma.galleryItem.update({
      where: { id },
      data: {
        imageUrl: data.imageUrl,
        order: data.order,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId || null,
        locationId: data.locationId || null,
        serviceId: data.serviceId || null,
      }
    });

    for (const t of data.translations) {
      await prisma.galleryItemTranslation.upsert({
        where: { itemId_language: { itemId: id, language: t.language } },
        create: {
          itemId: id,
          language: t.language,
          title: t.title || null,
          description: t.description || null,
          altText: t.altText || null,
        },
        update: {
          title: t.title || null,
          description: t.description || null,
          altText: t.altText || null,
        }
      });
    }

    revalidatePath('/admin/gallery');
    return { success: true };
  } catch (error) {
    console.error('updateGalleryItem error:', error);
    return { success: false, error: 'Fotoğraf güncellenemedi.' };
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    await prisma.galleryItem.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
    revalidatePath('/admin/gallery');
    return { success: true };
  } catch (error) {
    console.error('deleteGalleryItem error:', error);
    return { success: false, error: 'Fotoğraf silinemedi.' };
  }
}

export async function reorderGalleryItems(items: Array<{ id: string; order: number }>) {
  try {
    for (const item of items) {
      await prisma.galleryItem.update({ where: { id: item.id }, data: { order: item.order } });
    }
    revalidatePath('/admin/gallery');
    return { success: true };
  } catch (_e) {
    return { success: false };
  }
}

export async function toggleGalleryItemFeatured(id: string) {
  try {
    const item = await prisma.galleryItem.findUnique({ where: { id } });
    if (!item) return { success: false };
    await prisma.galleryItem.update({
      where: { id },
      data: { isFeatured: !item.isFeatured }
    });
    revalidatePath('/admin/gallery');
    return { success: true, isFeatured: !item.isFeatured };
  } catch (_e) {
    return { success: false };
  }
}

// ═══════════════════════════════════════════════════
// PUBLIC GALERİ VERİLERİ
// ═══════════════════════════════════════════════════

export async function getPublicGalleryData(locale: string) {
  const lang = locale.toUpperCase() as Language;
  try {
    const categories = await prisma.galleryCategory.findMany({
      where: { isActive: true, isDeleted: false },
      include: {
        translations: { where: { language: lang } },
        _count: { select: { items: { where: { isActive: true, isDeleted: false } } } }
      },
      orderBy: { order: 'asc' }
    });

    const items = await prisma.galleryItem.findMany({
      where: { isActive: true, isDeleted: false },
      include: {
        translations: { where: { language: lang } },
        category: { include: { translations: { where: { language: lang } } } }
      },
      orderBy: { order: 'asc' }
    });

    return {
      success: true,
      categories: JSON.parse(JSON.stringify(categories)),
      items: JSON.parse(JSON.stringify(items))
    };
  } catch (error) {
    console.error('getPublicGalleryData error:', error);
    return { success: false, categories: [], items: [] };
  }
}

export async function getGalleryCategoryBySlug(slug: string, locale: string) {
  const lang = locale.toUpperCase() as Language;
  try {
    const translation = await prisma.galleryCategoryTranslation.findFirst({
      where: { slug, language: lang },
      include: {
        category: {
          include: {
            translations: true,
            items: {
              where: { isActive: true, isDeleted: false },
              include: { translations: { where: { language: lang } } },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!translation || !translation.category || !translation.category.isActive || translation.category.isDeleted) {
      return { success: false, category: null };
    }

    return { success: true, category: JSON.parse(JSON.stringify(translation.category)), translation: JSON.parse(JSON.stringify(translation)) };
  } catch (error) {
    console.error('getGalleryCategoryBySlug error:', error);
    return { success: false, category: null };
  }
}
