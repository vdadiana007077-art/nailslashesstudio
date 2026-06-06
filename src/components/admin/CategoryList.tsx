"use client";

import { Check, X, Edit, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { autoFillCategorySEO } from '@/app/actions/category-auto-fill';

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
              <th className="p-4 pl-6 w-10 font-medium">Durum</th>
              <th className="p-4 font-medium">Kategori Adı (TR)</th>
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
                    {cat.isActive ? (
                      <span className="inline-flex p-1 bg-green-50 text-green-600 rounded-full border border-green-100" title="Aktif">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 bg-gray-50 text-gray-400 rounded-full border border-gray-100" title="Pasif">
                        <X size={14} />
                      </span>
                    )}
                  </td>
                  <td className="p-4">
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
                  <td className="p-4 text-right pr-6">
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      className="inline-flex p-2 bg-gray-50 hover:bg-[var(--color-primary-100)] text-gray-600 hover:text-[var(--color-primary-700)] rounded-xl cursor-pointer transition-colors"
                      title="Düzenle"
                    >
                      <Edit size={16} />
                    </Link>
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
