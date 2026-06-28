"use client";

import { useState } from 'react';
import { createCategory } from '@/app/actions/admin';
import { Plus, Loader2 } from 'lucide-react';

export default function AddCategoryForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // createCategory, FormData bekliyor. Gerekli alanları ekleyelim.
    formData.append('isActive', 'true');
    formData.append('order', '0');
    
    // Translations formatı: createCategory çok dilli çeviri dizisi bekler
    const translations = [{
      language: 'TR',
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string || null,
      seoTitle: formData.get('seoTitle') as string || null,
      seoDesc: formData.get('seoDesc') as string || null,
    }];
    formData.append('translations', JSON.stringify(translations));
    
    const result = await createCategory(formData);

    if (result.success) {
      setIsOpen(false);
      (e.target as HTMLFormElement).reset();
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-black transition-colors"
      >
        <Plus size={18} /> Yeni Kategori Ekle
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Yeni Kategori Oluştur (SEO Destekli)</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Kategori Adı (Örn: Lazer Epilasyon)</label>
            <input type="text" name="name" required className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[var(--color-rose-400)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">URL Uzantısı (Slug) (Örn: lazer-epilasyon)</label>
            <input type="text" name="slug" required className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[var(--color-rose-400)]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">SEO Başlığı (Google'da görünecek başlık)</label>
            <input type="text" name="seoTitle" placeholder="Antalya Aksu Lazer Epilasyon | %100 Sonuç" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[var(--color-rose-400)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">SEO Açıklaması (Meta Description)</label>
            <input type="text" name="seoDesc" placeholder="Antalya Aksu'da acısız ve kalıcı lazer epilasyon hizmeti..." className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[var(--color-rose-400)]" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Kategori Detaylı Açıklaması (Sayfada Görünecek İçerik)</label>
          <textarea name="description" rows={4} placeholder="Bu kategori altında sunulan hizmetlerin detayları, faydaları ve süreçleri hakkında kapsamlı bir açıklama yazın..." className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[var(--color-rose-400)]"></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="px-4 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg text-sm transition-colors"
          >
            İptal
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2.5 bg-[var(--color-rose-500)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--color-rose-600)] transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Kategoriyi Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
