"use client";

import { useState } from 'react';
import { deleteBlogCategory } from '@/app/actions/blog';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';

interface CategoryTranslation {
  id: string;
  language: 'TR' | 'EN' | 'DE' | 'RU';
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDesc: string;
}

interface BlogCategory {
  id: string;
  order: number;
  isActive: boolean;
  translations: CategoryTranslation[];
}

interface BlogCategoriesClientProps {
  initialCategories: BlogCategory[];
}

export default function BlogCategoriesClient({ initialCategories }: BlogCategoriesClientProps) {
  const [categories, setCategories] = useState<BlogCategory[]>(initialCategories);

  const getTRTranslation = (cat: BlogCategory) => {
    return cat.translations.find((t) => t.language === 'TR') || cat.translations[0] || { name: 'İçerik Girilmemiş', slug: '-' };
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi pasifleştirmek (silmek) istediğinize emin misiniz?')) return;
    const res = await deleteBlogCategory(id);
    if (res.success) {
      setCategories(categories.map((c) => (c.id === id ? { ...c, isActive: false } : c)));
    } else {
      alert(res.error || 'İşlem gerçekleştirilemedi.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-xs font-semibold text-gray-400">
          Kategorilerin dillerini ve SEO alanlarını düzenlemek için ilgili kategorinin "Düzenle" butonuna tıklayabilirsiniz.
        </div>

        {/* Yeni Kategori Ekle Butonu */}
        <Link
          href="/admin/blog/categories/new"
          className="px-5 py-2.5 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} /> Kategori Ekle
        </Link>
      </div>

      {/* KATEGORİ LİSTESİ */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 pl-6 font-medium">Sıra</th>
              <th className="p-4 font-medium">Kategori Adı (TR)</th>
              <th className="p-4 font-medium">Slug (URL)</th>
              <th className="p-4 font-medium">Diller</th>
              <th className="p-4 font-medium">Durum</th>
              <th className="p-4 font-medium text-right pr-6">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400 text-xs font-semibold">
                  Henüz blog kategorisi bulunmuyor.
                </td>
              </tr>
            ) : (
              categories.map((cat) => {
                const trans = getTRTranslation(cat);
                return (
                  <tr 
                    key={cat.id} 
                    className={`border-b border-gray-50 hover:bg-rose-50/10 transition-colors text-sm ${
                      !cat.isActive ? 'opacity-50 bg-gray-50/30' : ''
                    }`}
                  >
                    <td className="p-4 pl-6 font-bold text-gray-500">
                      #{cat.order}
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      {trans.name}
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-500">
                      {trans.slug}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {(['TR', 'EN', 'DE', 'RU'] as const).map(l => {
                          const exists = cat.translations.some(t => t.language === l);
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
                    <td className="p-4">
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                          <Check size={14} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500 font-bold">
                          <X size={14} /> Pasif
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right pr-6 flex justify-end gap-2">
                      <Link
                        href={`/admin/blog/categories/${cat.id}`}
                        className="p-2 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-[var(--color-rose-600)] rounded-xl cursor-pointer transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 size={14} />
                      </Link>
                      {cat.isActive && (
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl cursor-pointer transition-colors"
                          title="Sil (Pasifleştir)"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
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
}
