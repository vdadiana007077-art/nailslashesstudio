"use client";

import { useState } from 'react';
import { createBlogCategory, updateBlogCategory, deleteBlogCategory } from '@/app/actions/blog';
import { Plus, Edit2, Trash2, Globe, Check, X } from 'lucide-react';

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
  locale: string;
}

export default function BlogCategoriesClient({ initialCategories, locale }: BlogCategoriesClientProps) {
  const [categories, setCategories] = useState<BlogCategory[]>(initialCategories);
  const [activeLang, setActiveLang] = useState<'TR' | 'EN' | 'DE' | 'RU'>('TR');

  // Ekleme / Düzenleme Modalı State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State'leri
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      // Otomatik slug üret (basit Türkçe karakter çevrimli)
      const autoSlug = val
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(autoSlug);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setOrder(categories.length);
    setIsActive(true);
    setSeoTitle('');
    setSeoDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: BlogCategory) => {
    setEditingCategory(cat);
    const translation = cat.translations.find(t => t.language === activeLang);
    setName(translation?.name || '');
    setSlug(translation?.slug || '');
    setDescription(translation?.description || '');
    setOrder(cat.order);
    setIsActive(cat.isActive);
    setSeoTitle(translation?.seoTitle || '');
    setSeoDesc(translation?.seoDesc || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('language', activeLang);
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('order', order.toString());
    formData.append('isActive', isActive ? 'true' : 'false');
    formData.append('seoTitle', seoTitle);
    formData.append('seoDesc', seoDesc);

    let res;
    if (editingCategory) {
      const translation = editingCategory.translations.find(t => t.language === activeLang);
      res = await updateBlogCategory(editingCategory.id, translation?.id || null, formData);
    } else {
      res = await createBlogCategory(formData);
    }

    setLoading(false);
    if (res.success) {
      // Yenileme işlemi (basitlik için sayfayı yenileyelim veya state'i güncelleyelim)
      window.location.reload();
    } else {
      alert(res.error || 'Bir hata oluştu.');
    }
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

  const getTranslation = (cat: BlogCategory, lang: string) => {
    return cat.translations.find((t) => t.language === lang) || { name: 'İçerik Girilmemiş', slug: '-' };
  };

  return (
    <div className="space-y-6">
      {/* Dil Filtre Barı */}
      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Dil Seçimi Sekmeleri */}
        <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 shrink-0">
          {(['TR', 'EN', 'DE', 'RU'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeLang === lang ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Globe size={12} />
              {lang} Listesi
            </button>
          ))}
        </div>

        {/* Yeni Kategori Ekle Butonu */}
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} /> Kategori Ekle
        </button>
      </div>

      {/* KATEGORİ LİSTESİ */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 pl-6 font-medium">Sıra</th>
              <th className="p-4 font-medium">Kategori Adı</th>
              <th className="p-4 font-medium">Slug (URL)</th>
              <th className="p-4 font-medium">Durum</th>
              <th className="p-4 font-medium text-right pr-6">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400 text-xs font-semibold">
                  Henüz blog kategorisi bulunmuyor.
                </td>
              </tr>
            ) : (
              categories.map((cat) => {
                const trans = getTranslation(cat, activeLang);
                return (
                  <tr 
                    key={cat.id} 
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm ${
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
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-xl cursor-pointer transition-colors"
                        title={`${activeLang} Dilinde Düzenle`}
                      >
                        <Edit2 size={14} />
                      </button>
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

      {/* EKLEME / DÜZENLEME POPUP MODALI */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapat Butonu */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif font-bold text-gray-950 text-xl mb-6 shrink-0">
              {editingCategory ? `Kategoriyi Düzenle (${activeLang})` : `Yeni Kategori Ekle (${activeLang})`}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              
              {/* Temel Bilgiler */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kategori Adı *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="örn: Nail Art İpuçları"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Slug (URL) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Açıklama</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sıralama</label>
                    <input
                      type="number"
                      required
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 select-none pt-6">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-400)]"
                    />
                    <label htmlFor="isActive" className="text-xs text-gray-600 font-semibold cursor-pointer">
                      Kategori Aktif
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO ALANLARI */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">SEO Yapılandırması</h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Başlığı</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Maksimum 60 karakter"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Açıklaması</label>
                  <textarea
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    rows={2}
                    placeholder="Maksimum 160 karakter"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs"
                  />
                </div>
              </div>

              {/* Kaydet Butonu */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 bg-gray-950 hover:bg-black disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                {loading ? 'KAYDEDİLİYOR...' : 'KAYDET'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
