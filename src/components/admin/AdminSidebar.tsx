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
  Activity,
  Menu,
  FileText,
  BookOpen,
  HelpCircle,
  Clock,
  ArrowRightLeft,
  Briefcase,
  Package,
  MessageSquare,
  Hash
} from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';

interface AdminSidebarProps {
  locale: string;
}

type MenuItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  activePattern: RegExp;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

export default function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuSections: MenuSection[] = [
    {
      title: 'Operasyon',
      items: [
        {
          name: 'Randevular',
          href: `/${locale}/admin`,
          icon: Calendar,
          activePattern: new RegExp(`^/${locale}/admin$`)
        },
        {
          name: 'Müsaitlik & Saatler',
          href: `/${locale}/admin/availability`,
          icon: Clock,
          activePattern: new RegExp(`^/${locale}/admin/availability`)
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
          name: 'Paketler',
          href: `/${locale}/admin/packages`,
          icon: Package,
          activePattern: new RegExp(`^/${locale}/admin/packages`)
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
      ]
    },
    {
      title: 'İçerik Yönetimi',
      items: [
        {
          name: 'Blog Yazıları',
          href: `/${locale}/admin/blog`,
          icon: BookOpen,
          activePattern: new RegExp(`^/${locale}/admin/blog(?!/categories|/tags)`)
        },
        {
          name: 'Blog Kategorileri',
          href: `/${locale}/admin/blog/categories`,
          icon: Tags,
          activePattern: new RegExp(`^/${locale}/admin/blog/categories`)
        },
        {
          name: 'Blog Etiketleri',
          href: `/${locale}/admin/blog/tags`,
          icon: Hash,
          activePattern: new RegExp(`^/${locale}/admin/blog/tags`)
        },
        {
          name: 'Sayfalar',
          href: `/${locale}/admin/pages`,
          icon: FileText,
          activePattern: new RegExp(`^/${locale}/admin/pages`)
        },
        {
          name: 'SSS (FAQ)',
          href: `/${locale}/admin/faq`,
          icon: HelpCircle,
          activePattern: new RegExp(`^/${locale}/admin/faq`)
        },
        {
          name: 'Portföy',
          href: `/${locale}/admin/portfolio`,
          icon: Briefcase,
          activePattern: new RegExp(`^/${locale}/admin/portfolio`)
        },
        {
          name: 'Medya Kütüphanesi',
          href: `/${locale}/admin/media`,
          icon: Image,
          activePattern: new RegExp(`^/${locale}/admin/media`)
        },
        {
          name: 'Menü Yönetimi',
          href: `/${locale}/admin/menus`,
          icon: Menu,
          activePattern: new RegExp(`^/${locale}/admin/menus`)
        },
      ]
    },
    {
      title: 'Pazarlama & CRM',
      items: [
        {
          name: 'Müşteriler',
          href: `/${locale}/admin/users`,
          icon: Users,
          activePattern: new RegExp(`^/${locale}/admin/users`)
        },
        {
          name: 'İletişim Mesajları',
          href: `/${locale}/admin/contact`,
          icon: MessageSquare,
          activePattern: new RegExp(`^/${locale}/admin/contact`)
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
          name: 'SEO & Yönlendirmeler',
          href: `/${locale}/admin/seo`,
          icon: ArrowRightLeft,
          activePattern: new RegExp(`^/${locale}/admin/seo`)
        },
      ]
    },
    {
      title: 'Yönetim & Sistem',
      items: [
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
        },
        {
          name: 'Site Ayarları',
          href: `/${locale}/admin/settings`,
          icon: Settings,
          activePattern: new RegExp(`^/${locale}/admin/settings`)
        },
      ]
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
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-0.5">
        {menuSections.map((section, sectionIndex) => (
          <div key={section.title}>
            {/* Section Separator */}
            {sectionIndex > 0 && (
              <div className="my-2 border-t border-gray-100" />
            )}
            {/* Section Title */}
            <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive = item.activePattern.test(pathname);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--color-rose-50)] text-[var(--color-rose-700)] shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={17} className={isActive ? 'text-[var(--color-rose-600)]' : 'text-gray-400'} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
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
