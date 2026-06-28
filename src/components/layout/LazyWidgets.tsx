'use client';

import dynamic from 'next/dynamic';

const CookieConsentBanner = dynamic(() => import('@/components/layout/CookieConsentBanner'), {
  ssr: false,
});

const SupportWidget = dynamic(() => import('@/components/widget/SupportWidget'), {
  ssr: false,
});

export default function LazyWidgets() {
  return (
    <>
      <CookieConsentBanner />
      <SupportWidget />
    </>
  );
}
