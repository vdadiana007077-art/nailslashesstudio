import { cookies } from 'next/headers';

import '../globals.css';

export const metadata = {
  title: 'Admin Panel',
  description: 'Nails & Lashes Admin Panel',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const _token = cookieStore.get('admin_token');

  return (
    <html lang="tr">
      <body>
        <div className="admin-wrapper bg-gray-50 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
