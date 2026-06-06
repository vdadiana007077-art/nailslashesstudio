import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { Language } from '@prisma/client';

// Cache database translations
const getDbTranslations = unstable_cache(
  async (locale: string) => {
    try {
      const translations = await prisma.systemTranslation.findMany({
        where: { language: locale.toUpperCase() as Language }
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
  },
  ['system-translations'],
  { tags: ['translations'], revalidate: 3600 }
);

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
