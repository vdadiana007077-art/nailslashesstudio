import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  // Login sayfası ise layout'u olduğu gibi render et (Sonsuz döngüyü önle)
  // Bu layout /admin altında olduğu için login sayfası da buradan geçer
  
  return (
    <div className="admin-wrapper bg-gray-50 min-h-screen">
      {children}
    </div>
  );
}
