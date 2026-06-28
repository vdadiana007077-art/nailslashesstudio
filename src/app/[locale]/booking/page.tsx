import BookingPageContent from '../_pages/BookingPage';

export const dynamic = 'force-dynamic';

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  return <BookingPageContent params={params} />;
}
