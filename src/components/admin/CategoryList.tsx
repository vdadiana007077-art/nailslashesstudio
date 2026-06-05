"use client";

import { Check, X, Edit, Trash2 } from 'lucide-react';

type Category = {
  id: string;
  isActive: boolean;
  image: string | null;
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDesc: string;
};

export default function CategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500">Henüz hiç kategori eklenmemiş. Lütfen yukarıdan bir kategori ekleyin.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="p-4 w-10">Durum</th>
              <th className="p-4">Kategori Adı</th>
              <th className="p-4">URL Uzantısı (Slug)</th>
              <th className="p-4">SEO Başlığı</th>
              <th className="p-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  {cat.isActive ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600" title="Aktif">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400" title="Pasif">
                      <X size={14} strokeWidth={3} />
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <p className="font-semibold text-gray-800">{cat.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-1 max-w-xs" title={cat.description}>
                    {cat.description || 'Açıklama yok'}
                  </p>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">/{cat.slug}</span>
                </td>
                <td className="p-4">
                  <p className="text-sm text-gray-600 truncate max-w-[200px]" title={cat.seoTitle}>
                    {cat.seoTitle || '-'}
                  </p>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Düzenle">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Sil (Geliştiriliyor)">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
