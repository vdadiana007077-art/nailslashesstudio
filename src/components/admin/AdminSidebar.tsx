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

export default function AdminSidebar({ onLinkClick }: { onLinkClick?: () => void } = {}) {
  const pathname = usePathname();

  const menuSections: MenuSection[] = [
    {
      title: 'Operasyon',
      items: [
        {
          name: 'Randevular',
          href: `/admin`,
          icon: Calendar,
          activePattern: new RegExp(`^/admin$`)
        },
        {
          name: 'Müsaitlik & Saatler',
          href: `/admin/availability`,
          icon: Clock,
          activePattern: new RegExp(`^/admin/availability`)
        },
        {
          name: 'Hizmetler',
          href: `/admin/services`,
          icon: Scissors,
          activePattern: new RegExp(`^/admin/services`)
        },
        {
          name: 'Kategoriler',
          href: `/admin/categories`,
          icon: Tags,
          activePattern: new RegExp(`^/admin/categories`)
        },
        {
          name: 'Paketler',
          href: `/admin/packages`,
          icon: Package,
          activePattern: new RegExp(`^/admin/packages`)
        },
        {
          name: 'Şubeler',
          href: `/admin/locations`,
          icon: MapPin,
          activePattern: new RegExp(`^/admin/locations`)
        },
        {
          name: 'Personeller',
          href: `/admin/staff`,
          icon: Users,
          activePattern: new RegExp(`^/admin/staff`)
        },
      ]
    },
    {
      title: 'İçerik Yönetimi',
      items: [
        {
          name: 'Blog Yazıları',
          href: `/admin/blog`,
          icon: BookOpen,
          activePattern: new RegExp(`^/admin/blog(?!/categories|/tags)`)
        },
        {
          name: 'Blog Kategorileri',
          href: `/admin/blog/categories`,
          icon: Tags,
          activePattern: new RegExp(`^/admin/blog/categories`)
        },
        {
          name: 'Blog Etiketleri',
          href: `/admin/blog/tags`,
          icon: Hash,
          activePattern: new RegExp(`^/admin/blog/tags`)
        },
        {
          name: 'Menü Sayfaları',
          href: `/admin/pages`,
          icon: FileText,
          activePattern: new RegExp(`^/admin/pages`)
        },
        {
          name: 'SSS (FAQ)',
          href: `/admin/faq`,
          icon: HelpCircle,
          activePattern: new RegExp(`^/admin/faq`)
        },
        {
          name: 'Portföy',
          href: `/admin/portfolio`,
          icon: Briefcase,
          activePattern: new RegExp(`^/admin/portfolio`)
        },
        {
          name: 'Galeri Yönetimi',
          href: `/admin/gallery`,
          icon: Image,
          activePattern: new RegExp(`^/admin/gallery`)
        },
        {
          name: 'Medya Kütüphanesi',
          href: `/admin/media`,
          icon: Image,
          activePattern: new RegExp(`^/admin/media`)
        },
      ]
    },
    {
      title: 'Pazarlama & CRM',
      items: [
        {
          name: 'Müşteriler',
          href: `/admin/users`,
          icon: Users,
          activePattern: new RegExp(`^/admin/users`)
        },
        {
          name: 'İletişim Mesajları',
          href: `/admin/contact`,
          icon: MessageSquare,
          activePattern: new RegExp(`^/admin/contact`)
        },
        {
          name: 'CRM Talepleri',
          href: `/admin/leads`,
          icon: Inbox,
          activePattern: new RegExp(`^/admin/leads`)
        },
        {
          name: 'Bülten Aboneleri',
          href: `/admin/subscribers`,
          icon: Mail,
          activePattern: new RegExp(`^/admin/subscribers`)
        },
        {
          name: 'Kuponlar',
          href: `/admin/coupons`,
          icon: Ticket,
          activePattern: new RegExp(`^/admin/coupons`)
        },
        {
          name: 'Hediye Kartları',
          href: `/admin/giftcards`,
          icon: Gift,
          activePattern: new RegExp(`^/admin/giftcards`)
        },
        {
          name: 'SEO Sayfaları',
          href: `/admin/landing-pages`,
          icon: Globe,
          activePattern: new RegExp(`^/admin/landing-pages`)
        },
        {
          name: 'SEO & Yönlendirmeler',
          href: `/admin/seo`,
          icon: ArrowRightLeft,
          activePattern: new RegExp(`^/admin/seo`)
        },
      ]
    },
    {
      title: 'Yönetim & Sistem',
      items: [
        {
          name: 'Muhasebe & Finans',
          href: `/admin/accounting`,
          icon: TrendingUp,
          activePattern: new RegExp(`^/admin/accounting`)
        },
        {
          name: 'Mail Şablonları',
          href: `/admin/email-templates`,
          icon: Mail,
          activePattern: new RegExp(`^/admin/email-templates`)
        },
        {
          name: 'Arayüz Çevirileri',
          href: `/admin/translations`,
          icon: Globe,
          activePattern: new RegExp(`^/admin/translations`)
        },
        {
          name: 'İşlem Günlükleri',
          href: `/admin/audit-logs`,
          icon: Activity,
          activePattern: new RegExp(`^/admin/audit-logs`)
        },
        {
          name: 'Site Ayarları',
          href: `/admin/settings`,
          icon: Settings,
          activePattern: new RegExp(`^/admin/settings`)
        },
      ]
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full select-none">
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
                  onClick={onLinkClick}
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
