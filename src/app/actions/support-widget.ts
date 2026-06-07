'use server';

import { prisma } from '@/lib/prisma';
import { ActionType, Language } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getWidgetSettings() {
  const settingsKeys = [
    'widget_active',
    'widget_title',
    'widget_avatar',
    'widget_whatsapp_number',
    'widget_position',
    'widget_theme',
    'widget_typing_animation',
    'widget_auto_open',
    'widget_avatar_size',
    'widget_pulse_animation',
    'widget_sparkle',
    'widget_tooltip'
  ];

  const dbSettings = await prisma.setting.findMany({
    where: { key: { in: settingsKeys } }
  });

  const settingsMap: Record<string, string> = {};
  for (const s of dbSettings) {
    settingsMap[s.key] = s.value;
  }

  // Fetch greetings for all languages
  const greetingsDb = await prisma.setting.findMany({
    where: { key: 'widget_greeting' }
  });

  const greetings: Record<string, string> = {};
  for (const g of greetingsDb) {
    if (g.language) {
      greetings[g.language] = g.value;
    }
  }

  return {
    active: settingsMap['widget_active'] === 'true',
    title: settingsMap['widget_title'] || 'N&L Studio AI',
    avatar: settingsMap['widget_avatar'] || '/images/avatar.png',
    whatsappNumber: settingsMap['widget_whatsapp_number'] || '+905061155243',
    position: settingsMap['widget_position'] || 'right',
    theme: settingsMap['widget_theme'] || 'light',
    typingAnimation: settingsMap['widget_typing_animation'] === 'true',
    autoOpen: settingsMap['widget_auto_open'] === 'true',
    avatarSize: parseInt(settingsMap['widget_avatar_size'] || '72', 10),
    pulseAnimation: settingsMap['widget_pulse_animation'] !== 'false',
    sparkleAnimation: settingsMap['widget_sparkle'] !== 'false',
    showTooltip: settingsMap['widget_tooltip'] !== 'false',
    greetings
  };
}

export async function saveWidgetSettings(data: any) {
  const settingsToSave = [
    { key: 'widget_active', value: data.active ? 'true' : 'false' },
    { key: 'widget_title', value: data.title },
    { key: 'widget_avatar', value: data.avatar },
    { key: 'widget_whatsapp_number', value: data.whatsappNumber },
    { key: 'widget_position', value: data.position },
    { key: 'widget_theme', value: data.theme },
    { key: 'widget_typing_animation', value: data.typingAnimation ? 'true' : 'false' },
    { key: 'widget_auto_open', value: data.autoOpen ? 'true' : 'false' },
    { key: 'widget_avatar_size', value: data.avatarSize?.toString() || '72' },
    { key: 'widget_pulse_animation', value: data.pulseAnimation ? 'true' : 'false' },
    { key: 'widget_sparkle', value: data.sparkleAnimation ? 'true' : 'false' },
    { key: 'widget_tooltip', value: data.showTooltip ? 'true' : 'false' }
  ];

  for (const s of settingsToSave) {
    const existing = await prisma.setting.findFirst({ where: { key: s.key } });
    if (existing) {
      await prisma.setting.update({ where: { id: existing.id }, data: { value: s.value } });
    } else {
      await prisma.setting.create({ data: { key: s.key, value: s.value } });
    }
  }

  if (data.greetings) {
    for (const [lang, val] of Object.entries(data.greetings)) {
      const existingGreeting = await prisma.setting.findFirst({
        where: { key: 'widget_greeting', language: lang as Language }
      });
      if (existingGreeting) {
        await prisma.setting.update({
          where: { id: existingGreeting.id },
          data: { value: val as string }
        });
      } else {
        await prisma.setting.create({
          data: { key: 'widget_greeting', value: val as string, language: lang as Language }
        });
      }
    }
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function getWidgetQuestions() {
  const questions = await prisma.supportQuestion.findMany({
    orderBy: { order: 'asc' },
    include: {
      translations: true
    }
  });

  return questions;
}

export async function saveWidgetQuestion(data: {
  id?: string;
  isActive: boolean;
  order: number;
  actionType: ActionType;
  actionUrl?: string;
  translations: {
    language: Language;
    question: string;
    answer: string;
    buttonText?: string;
  }[]
}) {
  if (data.id) {
    // Update
    await prisma.supportQuestion.update({
      where: { id: data.id },
      data: {
        isActive: data.isActive,
        order: data.order,
        actionType: data.actionType,
        actionUrl: data.actionUrl,
        translations: {
          deleteMany: {},
          create: data.translations
        }
      }
    });
  } else {
    // Create
    await prisma.supportQuestion.create({
      data: {
        isActive: data.isActive,
        order: data.order,
        actionType: data.actionType,
        actionUrl: data.actionUrl,
        translations: {
          create: data.translations
        }
      }
    });
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteWidgetQuestion(id: string) {
  await prisma.supportQuestion.delete({ where: { id } });
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function reorderWidgetQuestions(orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await prisma.supportQuestion.update({
      where: { id: orderedIds[i] },
      data: { order: i + 1 }
    });
  }
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function getPublicWidgetData(lang: Language) {
  const validLang = Object.values(Language).includes(lang as any) ? lang : Language.TR;

  const [settingsDb, questionsDb] = await Promise.all([
    getWidgetSettings(),
    prisma.supportQuestion.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        translations: {
          where: { language: validLang }
        }
      }
    })
  ]);

  if (!settingsDb.active) {
    return null;
  }

  const greeting = settingsDb.greetings[validLang] || settingsDb.greetings[Language.TR] || 'Size nasıl yardımcı olabilirim?';

  // Format questions
  const formattedQuestions = questionsDb.map(q => {
    const tr = q.translations[0];
    return {
      id: q.id,
      question: tr?.question || '',
      answer: tr?.answer || '',
      buttonText: tr?.buttonText || '',
      actionType: q.actionType,
      actionUrl: q.actionUrl
    };
  }).filter(q => q.question); // Only return if translation exists

  return {
    title: settingsDb.title,
    avatar: settingsDb.avatar,
    avatarSize: settingsDb.avatarSize,
    pulseAnimation: settingsDb.pulseAnimation,
    sparkleAnimation: settingsDb.sparkleAnimation,
    showTooltip: settingsDb.showTooltip,
    theme: settingsDb.theme,
    greeting,
    whatsappNumber: settingsDb.whatsappNumber,
    typingAnimation: settingsDb.typingAnimation,
    questions: formattedQuestions
  };
}
