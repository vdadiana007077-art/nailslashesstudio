import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
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
    <AdminShell title="📧 Mail Şablonları">
      <div className="max-w-7xl mx-auto">
          <EmailTemplateClient templates={serialized} />
      </div>
    </AdminShell>
  );
}
