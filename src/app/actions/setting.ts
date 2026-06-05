"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Language } from '@prisma/client';

export async function saveSetting(key: string, value: string, language: Language | null = null) {
  if (!key) {
    return { success: false, error: 'Ayar anahtarı zorunludur!' };
  }

  try {
    const existing = await prisma.setting.findFirst({
      where: {
        key,
        language: language || null,
      },
    });

    if (existing) {
      await prisma.setting.update({
        where: { id: existing.id },
        data: { value },
      });
    } else {
      await prisma.setting.create({
        data: {
          key,
          value,
          language: language || null,
        },
      });
    }

    revalidatePath('/[locale]/admin/settings', 'page');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Ayar kaydetme hatası:', error);
    return { success: false, error: 'Ayar kaydedilirken bir hata oluştu.' };
  }
}

export async function saveMultipleSettings(settings: { key: string; value: string; language?: Language | null }[]) {
  try {
    for (const s of settings) {
      const lang = s.language || null;
      const existing = await prisma.setting.findFirst({
        where: {
          key: s.key,
          language: lang,
        },
      });

      if (existing) {
        await prisma.setting.update({
          where: { id: existing.id },
          data: { value: s.value },
        });
      } else {
        await prisma.setting.create({
          data: {
            key: s.key,
            value: s.value,
            language: lang,
          },
        });
      }
    }

    revalidatePath('/[locale]/admin/settings', 'page');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Çoklu ayar kaydetme hatası:', error);
    return { success: false, error: 'Ayarlar kaydedilirken bir hata oluştu.' };
  }
}
