import { redirect } from 'next/navigation';
import { getCurrentCustomer } from '@/app/actions/customerAuth';
import HesabimClient from './HesabimClient';

export const metadata = {
  title: 'Hesabım | Nails & Lashes Studio',
  description: 'Randevularınızı yönetin, kişisel bilgilerinizi görüntüleyin.',
};

export default async function HesabimPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect(`/${locale}`);
  }

  return <HesabimClient customer={customer} locale={locale} />;
}
