"use client";
 
import { useState } from 'react';
import { deleteMenuItem, mergeDuplicateMenuItems } from '@/app/actions/menu';
import { 
  Plus, Edit2, Trash2, Globe, Check, X, ExternalLink, 
  Eye, GripVertical, Search, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface MenuItemTranslation {
  id: string;
  language: 'TR' | 'EN' | 'DE' | 'RU';
  title: string;
  url: string;
}

interface MenuItem {
  id: string;
  menuType: 'HEADER' | 'FOOTER' | 'LEGAL_FOOTER';
  order: number;
  isActive: boolean;
  target: string;
  isExternal: boolean;
  linkType: string;
  pageId?: string | null;
  serviceCategoryId?: string | null;
  serviceId?: string | null;
  blogCategoryId?: string | null;
  blogPostId?: string | null;
  landingPageId?: string | null;
  page?: any;
  serviceCategory?: any;
  service?: any;
  blogCategory?: any;
  blogPost?: any;
  landingPage?: any;
  translations: MenuItemTranslation[];
}

interface MenusClientProps {
  initialItems: MenuItem[];
  pages: any[];
  serviceCategories: any[];
  services: any[];
  blogCategories: any[];
  blogPosts: any[];
  landingPages: any[];
}

export default function MenusClient({ initialItems }: MenusClientProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [merging, setMerging] = useState(false);
  const [mergeMessage, setMergeMessage] = useState<string | null>(null);

  const getTRTranslation = (item: MenuItem) => {
    return item.translations.find((t) => t.language === 'TR') || item.translations[0] || { title: 'İsimsiz Menü', url: '#' };
  };

  const handleMerge = async () => {
    if (!confirm('Aynı sıradaki farklı dil menü kayıtları tek bir kayıtta birleştirilecektir. Hiçbir içerik kaybı yaşanmayacaktır. Devam etmek istiyor musunuz?')) return;
    setMerging(true);
    setMergeMessage(null);
    const res = await mergeDuplicateMenuItems();
    setMerging(false);
    if (res.success) {
      setMergeMessage(`Başarılı! ${res.mergedCount} mükerrer menü elemanı başarıyla birleştirildi.`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      alert(res.error || 'Birleştirme esnasında bir hata oluştu.');
    }
  };

  const filteredItems = items
    .filter(item => {
      const tr = getTRTranslation(item);
      return (
        searchTerm === '' || 
        tr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tr.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => a.order - b.order);

  // Header, Footer ve Legal ayırma
  const headerItems = filteredItems.filter(i => i.menuType === 'HEADER');
  const footerItems = filteredItems.filter(i => i.menuType === 'FOOTER');
  const legalItems = filteredItems.filter(i => i.menuType === 'LEGAL_FOOTER');

  const handleDelete = async (id: string) => {
    if (!confirm('Bu menü elemanını pasifleştirmek istediğinize emin misiniz?')) return;
    const res = await deleteMenuItem(id);
    if (res.success) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, isActive: false } : i));
    }
  };

  const getLinkTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'CUSTOM_URL': 'Manuel URL',
      'EXTERNAL_URL': 'Dış Bağlantı',
      'CMS_PAGE': 'CMS Sayfası',
      'SERVICE_CATEGORY': 'Hizmet Kategorisi',
      'SERVICE_DETAIL': 'Hizmet Detayı',
      'BLOG_CATEGORY': 'Blog Kategorisi',
      'BLOG_DETAIL': 'Blog Yazısı',
      'LANDING_PAGE': 'Landing Page'
    };
    return labels[type] || type;
  };

  const getLinkTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'CUSTOM_URL': 'bg-gray-100 text-gray-600',
      'EXTERNAL_URL': 'bg-orange-50 text-orange-600',
      'CMS_PAGE': 'bg-blue-50 text-blue-600',
      'SERVICE_CATEGORY': 'bg-purple-50 text-purple-600',
      'SERVICE_DETAIL': 'bg-violet-50 text-violet-600',
      'BLOG_CATEGORY': 'bg-teal-50 text-teal-600',
      'BLOG_DETAIL': 'bg-emerald-50 text-emerald-600',
      'LANDING_PAGE': 'bg-rose-50 text-rose-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const MenuTable = ({ title, subtitle, items: tableItems, menuType }: { title: string; subtitle: string; items: MenuItem[]; menuType: string }) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tablo Başlığı */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            {title}
            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full">{tableItems.length}</span>
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <Link
          href={`/admin/menus/new?type=${menuType}`}
          className="px-4 py-2 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} /> Yeni Menü Sayfası Ekle
        </Link>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-3 w-16">Sıra</th>
              <th className="px-4 py-3">Sayfa Başlığı (TR)</th>
              <th className="px-4 py-3">Diller</th>
              <th className="px-4 py-3 w-28 text-center">Header</th>
              <th className="px-4 py-3 w-28 text-center">Footer</th>
              <th className="px-4 py-3 w-28 text-center">Durum</th>
              <th className="px-4 py-3 w-28 text-right pr-6">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {tableItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-xs">
                  Henüz menü elemanı eklenmemiş.
                </td>
              </tr>
            ) : (
              tableItems.map((item) => {
                const tr = getTRTranslation(item);
                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-rose-50/10 transition-colors group">
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-bold text-gray-400">#{item.order}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <GripVertical size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div>
                          <Link 
                            href={`/admin/menus/${item.id}`}
                            className="text-sm font-bold text-[var(--color-rose-600)] hover:text-[var(--color-rose-700)] hover:underline transition-colors"
                          >
                            {tr.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getLinkTypeBadgeColor(item.linkType)}`}>
                              {getLinkTypeLabel(item.linkType)}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono truncate max-w-[200px]">{tr.url}</span>
                            {item.isExternal && <ExternalLink size={10} className="text-gray-400 shrink-0" />}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Diller rozetleri */}
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        {(['TR', 'EN', 'DE', 'RU'] as const).map(l => {
                          const exists = item.translations.some(t => t.language === l);
                          return (
                            <span key={l} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              exists ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
                            }`}>
                              {l}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Header Toggle */}
                    <td className="px-4 py-3.5 text-center">
                      {item.menuType === 'HEADER' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> AÇIK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400">
                          <span className="w-2 h-2 rounded-full bg-gray-300"></span> KAPALI
                        </span>
                      )}
                    </td>

                    {/* Footer Toggle */}
                    <td className="px-4 py-3.5 text-center">
                      {item.menuType === 'FOOTER' || item.menuType === 'LEGAL_FOOTER' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> AÇIK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400">
                          <span className="w-2 h-2 rounded-full bg-gray-300"></span> KAPALI
                        </span>
                      )}
                    </td>

                    {/* Durum */}
                    <td className="px-4 py-3.5 text-center">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> AKTİF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                          <span className="w-2 h-2 rounded-full bg-red-400"></span> PASİF
                        </span>
                      )}
                    </td>

                    {/* İşlemler */}
                    <td className="px-4 py-3.5 text-right pr-6">
                      <div className="flex justify-end gap-1.5">
                        {item.isActive && (
                          <a 
                            href={tr.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Sayfayı Önizle"
                          >
                            <Eye size={14} />
                          </a>
                        )}
                        <Link
                          href={`/admin/menus/${item.id}`}
                          className="p-1.5 text-gray-400 hover:text-[var(--color-rose-500)] hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit2 size={14} />
                        </Link>
                        {item.isActive && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Pasifleştir"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Üst Filtre Çubuğu */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Başlık Sol ve Birleştirme Butonu */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-xs font-semibold text-gray-400">
            Tüm dillerdeki menüleri ve bunlara bağlı içerikleri bu ekrandan yönetebilirsiniz.
          </div>
          <button
            onClick={handleMerge}
            disabled={merging}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 disabled:bg-gray-100 text-[var(--color-rose-600)] disabled:text-gray-400 text-xs font-bold rounded-xl transition-all border border-rose-200/50 flex items-center gap-1.5 cursor-pointer"
          >
            {merging ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            {merging ? 'Birleştiriliyor...' : 'Mükerrer Dilleri Birleştir (Veri Kayıpsız)'}
          </button>
        </div>

        {/* Arama */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Menü ara..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20 focus:border-[var(--color-rose-500)] shadow-sm"
          />
        </div>
      </div>

      {mergeMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
          <Check size={16} /> {mergeMessage}
        </div>
      )}

      {/* Header Menü Tablosu */}
      <MenuTable 
        title="Header Menü (Üst Menü)" 
        subtitle="Ana navigasyon menüsü. Sitenin üst kısmında görünür."
        items={headerItems}
        menuType="HEADER"
      />

      {/* Footer Menü Tablosu */}
      <MenuTable 
        title="Footer Menü (Alt Menü)" 
        subtitle="Alt bilgi menüsü. Sitenin alt kısmında görünür."
        items={footerItems}
        menuType="FOOTER"
      />

      {/* Legal Footer Tablosu */}
      <MenuTable 
        title="Legal Footer (Yasal Menü)" 
        subtitle="KVKK, Çerez Politikası gibi yasal sayfa bağlantıları."
        items={legalItems}
        menuType="LEGAL_FOOTER"
      />
    </div>
  );
}
