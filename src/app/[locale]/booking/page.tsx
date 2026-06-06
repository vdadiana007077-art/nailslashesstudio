import BookingPageContent from '../_pages/BookingPage';

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  return <BookingPageContent params={params} />;
}
