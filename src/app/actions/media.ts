"use server";

import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

export async function updateMediaItem(id: string, formData: FormData) {
  const title = formData.get('title') as string || '';
  const altText = formData.get('altText') as string || '';
  const caption = formData.get('caption') as string || null;

  try {
    const updated = await prisma.mediaItem.update({
      where: { id },
      data: {
        title,
        altText: altText || title,
        caption,
      },
    });
    revalidatePath('/[locale]/admin/media', 'page');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Medya güncelleme hatası:', error);
    return { success: false, error: 'Medya güncellenirken bir hata oluştu.' };
  }
}

export async function deleteMediaItem(id: string) {
  try {
    const item = await prisma.mediaItem.findUnique({
      where: { id },
    });

    if (!item) {
      return { success: false, error: 'Medya bulunamadı!' };
    }

    // Fiziksel dosyayı diskten sil
    const filePath = join(process.cwd(), 'public', 'uploads', item.fileName);
    try {
      await unlink(filePath);
    } catch (err) {
      console.warn('Fiziksel dosya silinemedi (önceden silinmiş olabilir):', err);
    }

    // Veritabanı kaydını sil
    await prisma.mediaItem.delete({
      where: { id },
    });

    revalidatePath('/[locale]/admin/media', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Medya silme hatası:', error);
    return { success: false, error: 'Medya silinirken bir hata oluştu.' };
  }
}
