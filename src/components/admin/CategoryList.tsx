"use client";

import { Check, X, Edit, Sparkles, Loader2, Trash2, Power } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { autoFillCategorySEO } from '@/app/actions/category-auto-fill';
import { toggleCategoryActive, deleteCategory } from '@/app/actions/admin';

type CategoryTranslation = {
  id: string;
  language: 'TR' | 'EN' | 'DE' | 'RU';
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDesc: string;
  canonical: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  index: boolean;
  sitemap: boolean;
};

type Category = {
  id: string;
  isActive: boolean;
  image: string | null;
  order: number;
  translations: CategoryTranslation[];
};

export default function CategoryList({ categories }: { categories: Category[] }) {
  const [isFilling, setIsFilling] = useState(false);

  const router = useRouter();

  const handleAutoFill = async () => {
    setIsFilling(true);
    const res = await autoFillCategorySEO();
    setIsFilling(false);
    if (res.success) {
      alert(res.message);
      window.location.reload();
    } else {
      alert('Hata: ' + res.error);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    const res = await toggleCategoryActive(id, currentState);
    if (!res.success) alert(res.error);
    else router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) {
      const res = await deleteCategory(id);
      if (!res.success) alert(res.error);
      else router.refresh();
    }
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-gray-150 shadow-sm">
        <p className="text-gray-500 text-xs font-semibold">Henüz hiç kategori eklenmemiş.</p>
      </div>
    );
  }

  const getTRTranslation = (cat: Category) => {
    return cat.translations.find((t) => t.language === 'TR') || { name: 'İsimsiz Kategori', slug: '-', description: '' };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={handleAutoFill} 
          disabled={isFilling}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          {isFilling ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Tüm Eksik SEO & Çevirileri Otomatik Doldur
        </button>
      </div>
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 pl-6 font-medium">Kategori Adı (TR)</th>
              <th className="p-4 font-medium">URL (Slug)</th>
              <th className="p-4 font-medium">Sıra</th>
              <th className="p-4 font-medium text-right pr-6">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const tr = getTRTranslation(cat);
              return (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-gray-800 leading-snug">{tr.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1" title={tr.description}>
                      {tr.description || 'Açıklama girilmemiş.'}
                    </p>
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-500">
                    /{tr.slug}
                  </td>
                  <td className="p-4 font-bold text-gray-500">
                    #{cat.order}
                  </td>
                  <td className="p-4 text-right pr-6 flex justify-end gap-3 items-center h-full min-h-[64px]">
                    <button 
                      onClick={() => handleToggleActive(cat.id, cat.isActive)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors border shadow-sm"
                      style={{
                        backgroundColor: cat.isActive ? '#f0fdf4' : '#f9fafb',
                        color: cat.isActive ? '#166534' : '#6b7280',
                        borderColor: cat.isActive ? '#bbf7d0' : '#e5e7eb'
                      }}
                      title={cat.isActive ? "Pasife Al" : "Aktif Et"}
                    >
                      <Power size={14} />
                      {cat.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-white text-[var(--color-primary-600)] border border-gray-200 hover:border-[var(--color-primary-300)] rounded-lg transition-colors shadow-sm"
                    >
                      <Edit size={14} />
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(cat.id, tr.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors shadow-sm"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
