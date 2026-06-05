"use client";

import { useState } from 'react';
import { createService } from '@/app/actions/admin';
import { Plus, Loader2 } from 'lucide-react';

type Category = {
  id: string;
  name: string;
};

export default function AddServiceForm({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createService({
      categoryId: formData.get('categoryId') as string,
      name: formData.get('name') as string,
      price: formData.get('price') as string,
      duration: parseInt(formData.get('duration') as string),
    });

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
        <Plus size={18} /> Yeni Hizmet Ekle
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Yeni Hizmet Oluştur</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        
        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Kategori</label>
          <select name="categoryId" required className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[var(--color-rose-400)]">
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Hizmet Adı (TR)</label>
          <input type="text" name="name" required placeholder="Örn: İpek Kirpik Çıkarma" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[var(--color-rose-400)]" />
        </div>

        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Fiyat (₺)</label>
          <input type="number" name="price" required placeholder="250" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[var(--color-rose-400)]" />
        </div>

        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Süre (Dk)</label>
          <input type="number" name="duration" required placeholder="30" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[var(--color-rose-400)]" />
        </div>

        <div className="lg:col-span-5 flex justify-end gap-3 mt-2">
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
            Hizmeti Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
