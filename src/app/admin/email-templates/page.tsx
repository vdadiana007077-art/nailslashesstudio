import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import EmailTemplateClient from './EmailTemplateClient';
import { seedEmailTemplates } from '@/app/actions/email-template';

export default async function EmailTemplatesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  

  // Varsayılan şablonları oluştur (ilk sefer için)
  await seedEmailTemplates();

  if (!token || token.value !== 'authenticated') {
    redirect(`/admin/login`);
  }

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const serialized = templates.map(t => ({
    id: t.id,
    key: t.key,
    name: t.name,
    subject: t.subject,
    body: t.body,
    isActive: t.isActive,
    updatedAt: t.updatedAt.toISOString(),
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-800">📧 Mail Şablonları</h1>
          <p className="text-sm text-gray-500 mt-1">E-posta şablonlarını düzenleyin. Değişkenler: {`{{customerName}}, {{serviceName}}, {{date}}, {{time}}, {{customerEmail}}`}</p>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <EmailTemplateClient templates={serialized} />
        </main>
      </div>
    </div>
  );
}
