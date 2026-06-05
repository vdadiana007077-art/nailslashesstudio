"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calendar, 
  Settings, 
  Tags, 
  MapPin, 
  Image, 
  Inbox, 
  Mail, 
  Ticket, 
  Gift, 
  Globe, 
  LogOut,
  Sparkles,
  Scissors,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';

interface AdminSidebarProps {
  locale: string;
}

export default function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Randevular',
      href: `/${locale}/admin`,
      icon: Calendar,
      activePattern: new RegExp(`^/${locale}/admin$`)
    },
    {
      name: 'Hizmetler',
      href: `/${locale}/admin/services`,
      icon: Scissors,
      activePattern: new RegExp(`^/${locale}/admin/services`)
    },
    {
      name: 'Kategoriler',
      href: `/${locale}/admin/categories`,
      icon: Tags,
      activePattern: new RegExp(`^/${locale}/admin/categories`)
    },
    {
      name: 'Şubeler',
      href: `/${locale}/admin/locations`,
      icon: MapPin,
      activePattern: new RegExp(`^/${locale}/admin/locations`)
    },
    {
      name: 'Personeller',
      href: `/${locale}/admin/staff`,
      icon: Users,
      activePattern: new RegExp(`^/${locale}/admin/staff`)
    },
    {
      name: 'Medya Kütüphanesi',
      href: `/${locale}/admin/media`,
      icon: Image,
      activePattern: new RegExp(`^/${locale}/admin/media`)
    },
    {
      name: 'CRM Talepleri',
      href: `/${locale}/admin/leads`,
      icon: Inbox,
      activePattern: new RegExp(`^/${locale}/admin/leads`)
    },
    {
      name: 'Bülten Aboneleri',
      href: `/${locale}/admin/subscribers`,
      icon: Mail,
      activePattern: new RegExp(`^/${locale}/admin/subscribers`)
    },
    {
      name: 'Kuponlar',
      href: `/${locale}/admin/coupons`,
      icon: Ticket,
      activePattern: new RegExp(`^/${locale}/admin/coupons`)
    },
    {
      name: 'Hediye Kartları',
      href: `/${locale}/admin/giftcards`,
      icon: Gift,
      activePattern: new RegExp(`^/${locale}/admin/giftcards`)
    },
    {
      name: 'SEO Sayfaları',
      href: `/${locale}/admin/landing-pages`,
      icon: Globe,
      activePattern: new RegExp(`^/${locale}/admin/landing-pages`)
    },
    {
      name: 'Muhasebe & Finans',
      href: `/${locale}/admin/accounting`,
      icon: TrendingUp,
      activePattern: new RegExp(`^/${locale}/admin/accounting`)
    },
    {
      name: 'İşlem Günlükleri',
      href: `/${locale}/admin/audit-logs`,
      icon: Activity,
      activePattern: new RegExp(`^/${locale}/admin/audit-logs`)
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen select-none">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[var(--color-rose-600)]" size={24} />
          <div>
            <h2 className="text-xl font-serif font-bold text-gray-900 tracking-wide leading-none">N&L Studio</h2>
            <p className="text-xs text-gray-500 mt-1 font-sans">Yönetim Paneli</p>
          </div>
        </div>
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = item.activePattern.test(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--color-rose-50)] text-[var(--color-rose-700)] shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[var(--color-rose-600)]' : 'text-gray-400'} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Logout Area */}
      <div className="p-4 border-t border-gray-200">
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-xl font-medium text-sm transition-all duration-200"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </form>
      </div>
    </div>
  );
}
