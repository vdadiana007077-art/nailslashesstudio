"use client";

import { useState } from 'react';
import { deleteCmsPage } from '@/app/actions/cms-page';
import { 
  Plus, Edit2, Trash2, Globe, Check, X, Search, FileText, Eye
} from 'lucide-react';
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu CMS sayfasını pasifleştirmek istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deleteCmsPage(id);
    setLoadingId(null);
    if (result.success) {
      setPages(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p));
      showFeedback('success', 'Sayfa pasifleştirildi.');
    } else {
      showFeedback('error', result.error || 'Hata oluştu.');
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

  const getSlug = (page: CmsPageItem) => {
    const tr = page.translations.find(t => t.language === 'TR');
    return tr?.slug || page.translations[0]?.slug || '';
  };

  const getSeoScore = (page: CmsPageItem) => {
    let total = 0;
    let filled = 0;
    page.translations.forEach(t => {
      total += 4; // seoTitle, seoDesc, canonical, ogImage
      if (t.seoTitle) filled++;
      if (t.seoDesc) filled++;
      if (t.canonical) filled++;
      if (t.ogImage) filled++;
    });
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  };

  const getLangBadges = (page: CmsPageItem) => {
    const allLangs = ['TR', 'EN', 'DE', 'RU'];
    return allLangs.map(lang => {
      const has = page.translations.some(t => t.language === lang);
      return { lang, has };
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
          <span className="text-xs font-bold">{message.text}</span>
        </div>
      )}

      {/* Üst Çubuk */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sayfa başlığı veya slug ile ara..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20 focus:border-[var(--color-rose-500)] shadow-sm"
          />
        </div>
        <Link
          href="/admin/pages/new"
          className="px-5 py-2.5 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} /> Yeni Sayfa Ekle
        </Link>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-3 w-16">#</th>
                <th className="px-4 py-3">Sayfa Başlığı</th>
                <th className="px-4 py-3 w-40">Diller</th>
                <th className="px-4 py-3 w-28 text-center">SEO</th>
                <th className="px-4 py-3 w-28 text-center">Durum</th>
                <th className="px-4 py-3 w-28 text-right pr-6">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <FileText className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-400 text-xs font-semibold">Sayfa bulunamadı.</p>
                  </td>
                </tr>
              ) : (
                filteredPages.map((page, idx) => {
                  const seoScore = getSeoScore(page);
                  return (
                    <tr key={page.id} className="border-b border-gray-50 hover:bg-rose-50/10 transition-colors group">
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-bold text-gray-400">#{idx}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <Link
                            href={`/admin/pages/${page.id}`}
                            className="text-sm font-bold text-[var(--color-rose-600)] hover:text-[var(--color-rose-700)] hover:underline transition-colors"
                          >
                            {getTitle(page)}
                          </Link>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">/{getSlug(page)}</p>
                        </div>
                      </td>

                      {/* Diller */}
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          {getLangBadges(page).map(({ lang, has }) => (
                            <span
                              key={lang}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                has
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : 'bg-gray-50 text-gray-300 border border-gray-100'
                              }`}
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* SEO Score */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                seoScore >= 75 ? 'bg-emerald-500' : seoScore >= 50 ? 'bg-yellow-500' : 'bg-red-400'
                              }`}
                              style={{ width: `${seoScore}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-bold ${
                            seoScore >= 75 ? 'text-emerald-600' : seoScore >= 50 ? 'text-yellow-600' : 'text-red-500'
                          }`}>
                            %{seoScore}
                          </span>
                        </div>
                      </td>

                      {/* Durum */}
                      <td className="px-4 py-3.5 text-center">
                        {page.isActive ? (
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
                          {page.isActive && getSlug(page) && (
                            <a
                              href={`/tr/${getSlug(page)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              title="Önizle"
                            >
                              <Eye size={14} />
                            </a>
                          )}
                          <Link
                            href={`/admin/pages/${page.id}`}
                            className="p-1.5 text-gray-400 hover:text-[var(--color-rose-500)] hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit2 size={14} />
                          </Link>
                          {page.isActive && (
                            <button
                              onClick={() => handleDelete(page.id)}
                              disabled={loadingId === page.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
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
    </div>
  );
}
