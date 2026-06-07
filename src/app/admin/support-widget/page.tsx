import WidgetManager from './WidgetManager';
import { getWidgetSettings, getWidgetQuestions } from '@/app/actions/support-widget';

export const metadata = {
  title: 'AI Asistan Ayarları | Admin',
};

export default async function SupportWidgetPage() {
  const settings = await getWidgetSettings();
  const questions = await getWidgetQuestions();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">N&L Studio AI Yönetimi</h1>
      </div>
      
      <WidgetManager initialSettings={settings} initialQuestions={questions} />
    </div>
  );
}
