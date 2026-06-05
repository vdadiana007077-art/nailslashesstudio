"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Language } from '@prisma/client';

export async function createBlogTag(formData: FormData) {
  const language = formData.get('language') as Language;
  const name = formData.get('name') as string;
  const slug = (formData.get('slug') as string || '').toLowerCase().trim();
  const isActive = formData.get('isActive') === 'true';

  if (!name || !slug || !language) {
    return { success: false, error: 'Etiket adı, slug ve dil zorunludur!' };
  }

  try {
    const existingSlug = await prisma.blogTagTranslation.findFirst({
      where: { slug, language }
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug zaten kullanılıyor!' };
    }

    const newTag = await prisma.blogTag.create({
      data: {
        isActive,
        translations: {
          create: {
            language,
            name,
            slug
          }
        }
      }
    });

    revalidatePath('/[locale]/admin/blog/tags', 'page');
    revalidatePath('/[locale]/blog', 'page');
    return { success: true, data: newTag };
  } catch (error: any) {
    console.error('Blog etiketi oluşturma hatası:', error);
    return { success: false, error: 'Etiket oluşturulurken bir hata oluştu.' };
  }
}

export async function updateBlogTag(
  id: string,
  translationId: string | null,
  formData: FormData
) {
  const language = formData.get('language') as Language;
  const name = formData.get('name') as string;
  const slug = (formData.get('slug') as string || '').toLowerCase().trim();
  const isActive = formData.get('isActive') === 'true';

  if (!name || !slug || !language) {
    return { success: false, error: 'Etiket adı, slug ve dil zorunludur!' };
  }

  try {
    const existingSlug = await prisma.blogTagTranslation.findFirst({
      where: {
        slug,
        language,
        NOT: translationId ? { id: translationId } : undefined
      }
    });

    if (existingSlug) {
      return { success: false, error: 'Bu dilde bu slug başka bir etikette kullanılıyor!' };
    }

    // Ana kaydı güncelle
    await prisma.blogTag.update({
      where: { id },
      data: { isActive }
    });

    // Çeviri kaydını oluştur veya güncelle
    if (translationId) {
      await prisma.blogTagTranslation.update({
        where: { id: translationId },
        data: { name, slug }
      });
    } else {
      await prisma.blogTagTranslation.create({
        data: {
          tagId: id,
          language,
          name,
          slug
        }
      });
    }

    revalidatePath('/[locale]/admin/blog/tags', 'page');
    revalidatePath('/[locale]/blog', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Blog etiketi güncelleme hatası:', error);
    return { success: false, error: 'Etiket güncellenirken bir hata oluştu.' };
  }
}

export async function deleteBlogTag(id: string) {
  try {
    // Soft delete
    await prisma.blogTag.update({
      where: { id },
      data: { isActive: false }
    });

    revalidatePath('/[locale]/admin/blog/tags', 'page');
    revalidatePath('/[locale]/blog', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Blog etiketi silme hatası:', error);
    return { success: false, error: 'Etiket silinirken bir hata oluştu.' };
  }
}
