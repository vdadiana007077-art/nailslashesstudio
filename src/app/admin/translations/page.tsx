import TranslationsClient from './TranslationsClient';
import { prisma } from '@/lib/prisma';
import { routing } from '@/i18n/routing';
import { Globe } from 'lucide-react';

export default async function AdminTranslationsPage() {
    
  // Read all default JSONs
  const defaultMessages: Record<string, Record<string, any>> = {};
  for (const locale of routing.locales) {
    try {
      const messages = (await import(`@/messages/${locale}.json`)).default;
      defaultMessages[locale] = messages;
    } catch (e) {
      console.warn(`Could not load default messages for locale: ${locale}`);
      defaultMessages[locale] = {};
    }
  }

  // Read all DB translations
  const dbTranslationsRaw = await prisma.systemTranslation.findMany();
  
  // Serialize for client component
  const dbTranslations = dbTranslationsRaw.map((t: any) => ({
    namespace: t.namespace,
    key: t.key,
    language: t.language.toLowerCase(),
    value: t.value
  }));

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Globe className="text-[var(--color-primary-500)]" size={24} />
            Arayüz Metinleri Yönetimi
          </h1>
          <p className="text-gray-500 text-sm mt-1">Web sitesindeki sabit arayüz metinlerini, butonları ve uyarıları 4 dilde yönetin.</p>
        </div>
      </div>

      <div className="flex-1">
        <TranslationsClient 
          defaultMessages={defaultMessages} 
          dbTranslations={dbTranslations} 
          locales={routing.locales} 
        />
      </div>
    </div>
  );
}
