import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing-config';

// Cache database translations — prisma dinamik import ile yükleniyor
// böylece Edge Runtime bundle'ına dahil edilmiyor
async function getDbTranslations(locale: string) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const translations = await prisma.systemTranslation.findMany({
      where: { language: locale.toUpperCase() as any }
    });
    
    // Reduce to nested object
    const dbMessages: Record<string, any> = {};
    translations.forEach((t: any) => {
      if (!dbMessages[t.namespace]) dbMessages[t.namespace] = {};
      dbMessages[t.namespace][t.key] = t.value;
    });
    return dbMessages;
  } catch (e) {
    console.error("Failed to load db translations", e);
    return {};
  }
}

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  // Get default JSON messages
  const defaultMessages = (await import(`../messages/${locale}.json`)).default;
  
  // Get DB messages
  const dbMessages = await getDbTranslations(locale);

  // Deep merge
  const mergedMessages = { ...defaultMessages };
  for (const ns in dbMessages) {
    if (mergedMessages[ns]) {
      mergedMessages[ns] = { ...mergedMessages[ns], ...dbMessages[ns] };
    } else {
      mergedMessages[ns] = dbMessages[ns];
    }
  }

  return {
    locale,
    messages: mergedMessages
  };
});

