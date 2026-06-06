'use server'

import { prisma } from '@/lib/prisma';
import { Language } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function updateSystemTranslation(namespace: string, key: string, language: string, value: string) {
  try {
    await prisma.systemTranslation.upsert({
      where: {
        namespace_key_language: {
          namespace,
          key,
          language: language.toUpperCase() as Language
        }
      },
      update: {
        value
      },
      create: {
        namespace,
        key,
        language: language.toUpperCase() as Language,
        value
      }
    });

    // Invalidate the cache tag so next-intl gets fresh data
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error("Failed to update translation:", error);
    return { success: false, error: 'Çeviri güncellenirken bir hata oluştu.' };
  }
}

export async function deleteSystemTranslation(namespace: string, key: string, language: string) {
  try {
    await prisma.systemTranslation.delete({
      where: {
        namespace_key_language: {
          namespace,
          key,
          language: language.toUpperCase() as Language
        }
      }
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    // If it doesn't exist, it's fine
    if ((error as any).code === 'P2025') {
        return { success: true };
    }
    console.error("Failed to delete translation:", error);
    return { success: false, error: 'Çeviri silinirken bir hata oluştu.' };
  }
}
