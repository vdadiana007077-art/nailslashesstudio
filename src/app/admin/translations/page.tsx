import AdminShell from '@/components/admin/AdminShell';
import TranslationsClient from './TranslationsClient';
import { prisma } from '@/lib/prisma';
import { routing } from '@/i18n/routing';

export default async function AdminTranslationsPage() {
    
  // Read all default JSONs
  const defaultMessages: Record<string, Record<string, any>> = {};
  for (const locale of routing.locales) {
    try {
      const messages = (await import(`@/messages/${locale}.json`)).default;
      defaultMessages[locale] = messages;
    } catch (_) {
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
    <AdminShell title="Arayüz Metinleri Yönetimi" subtitle="Web sitesindeki sabit arayüz metinlerini, butonları ve uyarıları 4 dilde yönetin.">
      <TranslationsClient 
        defaultMessages={defaultMessages} 
        dbTranslations={dbTranslations} 
        locales={routing.locales} 
      />
    </AdminShell>
  );
}
