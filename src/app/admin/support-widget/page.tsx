import AdminShell from '@/components/admin/AdminShell';
import WidgetManager from './WidgetManager';
import { getWidgetSettings, getWidgetQuestions } from '@/app/actions/support-widget';

export const metadata = {
  title: 'AI Asistan Ayarları | Admin',
};

export default async function SupportWidgetPage() {
  const settings = await getWidgetSettings();
  const questions = await getWidgetQuestions();

  return (
    <AdminShell title="N&L Studio AI Yönetimi">
      <WidgetManager initialSettings={settings} initialQuestions={questions} />
    </AdminShell>
  );
}
