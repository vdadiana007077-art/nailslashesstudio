"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Language } from '@prisma/client';

export async function createBlogPost(formData: FormData) {
  const image = formData.get('image') as string || null;
  const authorName = formData.get('authorName') as string || null;
  const isActive = formData.get('isActive') === 'true';
  const isFeatured = formData.get('isFeatured') === 'true';
  const language = formData.get('language') as Language;
  
  const title = formData.get('title') as string;
  const slug = (formData.get('slug') as string).toLowerCase().trim();
  const excerpt = formData.get('excerpt') as string || null;
  const content = formData.get('content') as string;

  const seoTitle = formData.get('seoTitle') as string || null;
  const seoDesc = formData.get('seoDesc') as string || null;
  const canonical = formData.get('canonical') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDesc = formData.get('ogDesc') as string || null;
  const ogImage = formData.get('ogImage') as string || null;
  const index = formData.get('index') !== 'false';
  const sitemap = formData.get('sitemap') !== 'false';

  const publishedAtStr = formData.get('publishedAt') as string;
  const publishedAt = publishedAtStr ? new Date(publishedAtStr) : (isActive ? new Date() : null);

  if (!title || !slug || !language) {
    return { success: false, error: 'Başlık, slug ve dil alanları zorunludur!' };
  }

  try {
    // Dil bazında benzersiz slug kontrolü
    const existingSlug = await prisma.blogPostTranslation.findFirst({
      where: { slug, language },
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug zaten kullanılıyor!' };
    }

    const newPost = await prisma.blogPost.create({
      data: {
        image,
        authorName,
        isActive,
        isFeatured,
        publishedAt,
        translations: {
          create: {
            language,
            slug,
            title,
            excerpt,
            content,
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

    revalidatePath('/[locale]/admin/blog', 'page');
    revalidatePath('/[locale]/blog', 'page');
    return { success: true, data: newPost };
  } catch (error: any) {
    console.error('Blog yazısı oluşturma hatası:', error);
    return { success: false, error: 'Blog yazısı oluşturulurken bir hata oluştu.' };
  }
}

export async function updateBlogPost(
  id: string,
  translationId: string | null,
  formData: FormData
) {
  const image = formData.get('image') as string || null;
  const authorName = formData.get('authorName') as string || null;
  const isActive = formData.get('isActive') === 'true';
  const isFeatured = formData.get('isFeatured') === 'true';
  const language = formData.get('language') as Language;
  
  const title = formData.get('title') as string;
  const slug = (formData.get('slug') as string).toLowerCase().trim();
  const excerpt = formData.get('excerpt') as string || null;
  const content = formData.get('content') as string;

  const seoTitle = formData.get('seoTitle') as string || null;
  const seoDesc = formData.get('seoDesc') as string || null;
  const canonical = formData.get('canonical') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDesc = formData.get('ogDesc') as string || null;
  const ogImage = formData.get('ogImage') as string || null;
  const index = formData.get('index') !== 'false';
  const sitemap = formData.get('sitemap') !== 'false';

  const publishedAtStr = formData.get('publishedAt') as string;
  const publishedAt = publishedAtStr ? new Date(publishedAtStr) : (isActive ? new Date() : null);

  if (!title || !slug || !language) {
    return { success: false, error: 'Başlık, slug ve dil alanları zorunludur!' };
  }

  try {
    // Dil bazında benzersiz slug kontrolü (kendisi hariç)
    const existingSlug = await prisma.blogPostTranslation.findFirst({
      where: {
        slug,
        language,
        NOT: translationId ? { id: translationId } : undefined,
      },
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug başka bir blog yazısında kullanılıyor!' };
    }

    // Ana kaydı güncelle
    await prisma.blogPost.update({
      where: { id },
      data: {
        image,
        authorName,
        isActive,
        isFeatured,
        publishedAt,
      },
    });

    // Çeviri kaydını oluştur veya güncelle
    if (translationId) {
      await prisma.blogPostTranslation.update({
        where: { id: translationId },
        data: {
          slug,
          title,
          excerpt,
          content,
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
      await prisma.blogPostTranslation.create({
        data: {
          blogPostId: id,
          language,
          slug,
          title,
          excerpt,
          content,
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

    revalidatePath('/[locale]/admin/blog', 'page');
    revalidatePath('/[locale]/blog', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Blog yazısı güncelleme hatası:', error);
    return { success: false, error: 'Blog yazısı güncellenirken bir hata oluştu.' };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    // Kurallar gereği soft delete uyguluyoruz
    await prisma.blogPost.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });

    revalidatePath('/[locale]/admin/blog', 'page');
    revalidatePath('/[locale]/blog', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Blog yazısı silme hatası:', error);
    return { success: false, error: 'Blog yazısı silinirken bir hata oluştu.' };
  }
}
