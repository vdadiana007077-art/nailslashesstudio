"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import { Menu, X } from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Optional header right-side content (e.g. avatar, actions) */
  headerActions?: React.ReactNode;
}

/**
 * Merkezi Admin Layout Wrapper.
 * 
 * Desktop (md+): Sabit sidebar (w-64) + sağda içerik alanı — mevcut görünüm aynen korunur.
 * Mobil (<md): Sidebar gizli, hamburger butonu header'da, menü açıldığında overlay ile açılır.
 */
export default function AdminShell({ children, title, subtitle, headerActions }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Sayfa değiştiğinde mobil menüyü kapat
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Mobil menü açıkken body scroll'u engelle
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ═══════ DESKTOP SIDEBAR (md+) ═══════ */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* ═══════ MOBİL OVERLAY + SIDEBAR (<md) ═══════ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar Panel */}
          <div className="relative z-10 h-full w-72 max-w-[85vw] animate-slide-in-left">
            <AdminSidebar onLinkClick={() => setSidebarOpen(false)} />
            {/* Kapatma butonu */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors z-20"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ ANA İÇERİK ALANI ═══════ */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-6 md:py-6 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobil hamburger butonu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex-shrink-0"
              aria-label="Menüyü Aç"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>
          {headerActions || (
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              A
            </div>
          )}
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
