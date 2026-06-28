import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentStaff } from '@/app/actions/staffAuth';
import '../globals.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Personel Paneli',
  description: 'Nails & Lashes Personel Paneli',
};

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getCurrentStaff();

  if (!staff) {
    redirect('/tr');
  }

  return (
    <div className="staff-wrapper bg-gray-50 min-h-screen pb-20">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-4 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Personel Paneli</h1>
          <p className="text-xs text-gray-500">Hoş geldin, {staff.name}</p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-md mx-auto w-full p-4">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex justify-around items-center px-2 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] max-w-md mx-auto w-full">
        <Link href="/staff" className="flex flex-col items-center gap-1 text-[var(--color-rose-600)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          <span className="text-[10px] font-medium">Özet</span>
        </Link>
        <Link href="/staff/calendar" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          <span className="text-[10px] font-medium">Takvim</span>
        </Link>
        <Link href="/staff/history" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span className="text-[10px] font-medium">Geçmiş</span>
        </Link>
        <Link href="/tr" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          <span className="text-[10px] font-medium">Çıkış</span>
        </Link>
      </nav>
    </div>
  );
}
