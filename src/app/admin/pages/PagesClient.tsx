"use client";

import { useState } from 'react';
import { deleteCmsPage, togglePageMenuStatus } from '@/app/actions/cms-page';
import { Plus, Edit2, Trash2, Search, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';

interface PageTranslation {
  id: string;
  language: string;
  slug: string;
  title: string;
  content: string;
  seoTitle: string | null;
  seoDesc: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDesc: string | null;
  ogImage: string | null;
  index: boolean;
  sitemap: boolean;
}

interface CmsPageItem {
  id: string;
  isActive: boolean;
  pageGroup: string | null;
  menuItems: { menuType: string; isActive: boolean; order: number }[];
  createdAt: string;
  translations: PageTranslation[];
}

interface PagesClientProps {
  initialPages: CmsPageItem[];
  currentLocale: string;
}

export default function PagesClient({ initialPages }: PagesClientProps) {
  const [pages, setPages] = useState<CmsPageItem[]>(initialPages);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toggling, setToggling] = useState<{ id: string, type: string } | null>(null);

  const handleToggleMenu = async (pageId: string, menuType: 'HEADER' | 'FOOTER', currentStatus: boolean) => {
    setToggling({ id: pageId, type: menuType });
    const result = await togglePageMenuStatus(pageId, menuType, !currentStatus);
    setToggling(null);
    if (result.success) {
      setPages(prev => prev.map(p => {
        if (p.id === pageId) {
          const existingMenus = p.menuItems.filter(m => m.menuType !== menuType);
          if (!currentStatus) {
            existingMenus.push({ menuType, isActive: true, order: 99 });
          }
          return { ...p, menuItems: existingMenus };
        }
        return p;
      }));
    } else {
      alert(result.error || 'Hata oluştu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu Menü Sayfasını pasifleştirmek istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deleteCmsPage(id);
    setLoadingId(null);
    if (result.success) {
      setPages(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p));
    } else {
      alert(result.error || 'Hata oluştu.');
    }
  };

  const filteredPages = pages.filter(page =>
    page.translations.some(t =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getTitle = (page: CmsPageItem) => {
    const tr = page.translations.find(t => t.language === 'TR');
    return tr?.title || page.translations[0]?.title || 'Başlıksız';
  };

  const _getSlug = (page: CmsPageItem) => {
    const tr = page.translations.find(t => t.language === 'TR');
    return tr?.slug || page.translations[0]?.slug || '';
  };

  const getOrder = (page: CmsPageItem) => {
    const headerMenu = page.menuItems.find(m => m.menuType === 'HEADER');
    return headerMenu ? headerMenu.order : '-';
  };

  const isHeaderActive = (page: CmsPageItem) => {
    return page.menuItems.some(m => m.menuType === 'HEADER' && m.isActive);
  };

  const isFooterActive = (page: CmsPageItem) => {
    return page.menuItems.some(m => m.menuType === 'FOOTER' && m.isActive);
  };

  // Sıralamayı yapalım (Önce sıra numarasına göre)
  const sortedPages = [...filteredPages].sort((a, b) => {
    const orderA = a.menuItems.find(m => m.menuType === 'HEADER')?.order || 999;
    const orderB = b.menuItems.find(m => m.menuType === 'HEADER')?.order || 999;
    return orderA - orderB;
  });

  return (
    <div className="space-y-6">
      {/* Üst Çubuk */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sayfa başlığı veya url ara..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0070c0]/20 focus:border-[#0070c0] shadow-sm"
          />
        </div>
        <Link
          href="/admin/pages/new"
          className="px-5 py-2.5 bg-[#0070c0] hover:bg-[#005a9c] text-white text-[11px] font-bold tracking-wide rounded shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus size={14} /> Yeni Menü Sayfası Ekle
        </Link>
      </div>

      {/* Tablo */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 w-16">SIRA</th>
                <th className="px-4 py-4">SAYFA BAŞLIĞI (TR)</th>
                <th className="px-4 py-4 w-32 text-center">HEADER</th>
                <th className="px-4 py-4 w-32 text-center">FOOTER</th>
                <th className="px-4 py-4 w-32 text-center">FORM</th>
                <th className="px-4 py-4 w-32 text-center">DURUM</th>
                <th className="px-6 py-4 w-32 text-right">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {sortedPages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <FileText className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-400 text-xs font-semibold">Sayfa bulunamadı.</p>
                  </td>
                </tr>
              ) : (
                sortedPages.map((page, _idx) => {
                  return (
                    <tr key={page.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                      {/* Sıra */}
                      <td className="px-6 py-3.5 text-xs text-gray-400 font-mono">
                        #{getOrder(page)}
                      </td>

                      {/* Başlık */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-gray-300" />
                          <Link
                            href={`/admin/pages/${page.id}`}
                            className="text-xs font-bold text-gray-700 hover:text-[#0070c0] transition-colors"
                          >
                            {getTitle(page)}
                          </Link>
                        </div>
                      </td>

                      {/* Header */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleMenu(page.id, 'HEADER', isHeaderActive(page))}
                          disabled={toggling?.id === page.id && toggling?.type === 'HEADER'}
                          className="disabled:opacity-50 transition-opacity"
                          title="Tıklayarak durumu değiştirin"
                        >
                          {isHeaderActive(page) ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700">
                              <ToggleRight size={18} className="text-emerald-500" /> AÇIK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-500">
                              <ToggleLeft size={18} className="text-gray-300" /> KAPALI
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Footer */}
                      <td className="px-4 py-3.5 text-center">
                         <button
                          onClick={() => handleToggleMenu(page.id, 'FOOTER', isFooterActive(page))}
                          disabled={toggling?.id === page.id && toggling?.type === 'FOOTER'}
                          className="disabled:opacity-50 transition-opacity"
                          title="Tıklayarak durumu değiştirin"
                        >
                          {isFooterActive(page) ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700">
                              <ToggleRight size={18} className="text-emerald-500" /> AÇIK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-500">
                              <ToggleLeft size={18} className="text-gray-300" /> KAPALI
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Form (Statik Şimdilik) */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                           <ToggleRight size={18} className="text-emerald-500" /> AÇIK
                        </span>
                      </td>

                      {/* Durum */}
                      <td className="px-4 py-3.5 text-center">
                        {page.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> AKTİF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> PASİF
                          </span>
                        )}
                      </td>

                      {/* İşlemler */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/pages/${page.id}`}
                            className="text-gray-400 hover:text-[#0070c0] transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 size={14} />
                          </Link>
                          {page.isActive && (
                            <button
                              onClick={() => handleDelete(page.id)}
                              disabled={loadingId === page.id}
                              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                              title="Sil"
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
    </div>
  );
}
