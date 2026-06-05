"use client";

import { useState } from 'react';
import { updateCategory } from '@/app/actions/admin';
import { Check, X, Edit, Globe, Sparkles } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [activeLang, setActiveLang] = useState<'TR' | 'EN' | 'DE' | 'RU'>('TR');
  const [loading, setLoading] = useState(false);

  // Form State'leri
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [canonical, setCanonical] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDesc, setOgDesc] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [index, setIndex] = useState(true);
  const [sitemap, setSitemap] = useState(true);

  if (categories.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-gray-150 shadow-sm">
        <p className="text-gray-500 text-xs font-semibold">Henüz hiç kategori eklenmemiş.</p>
      </div>
    );
  }

  const openEditModal = (cat: Category) => {
    setSelectedCat(cat);
    const trans = cat.translations.find((t) => t.language === activeLang);
    setName(trans?.name || '');
    setSlug(trans?.slug || '');
    setDescription(trans?.description || '');
    setImage(cat.image || '');
    setOrder(cat.order);
    setIsActive(cat.isActive);

    setSeoTitle(trans?.seoTitle || '');
    setSeoDesc(trans?.seoDesc || '');
    setCanonical(trans?.canonical || '');
    setOgTitle(trans?.ogTitle || '');
    setOgDesc(trans?.ogDesc || '');
    setOgImage(trans?.ogImage || '');
    setIndex(trans ? trans.index : true);
    setSitemap(trans ? trans.sitemap : true);

    setIsModalOpen(true);
  };

  const handleLangChange = (lang: 'TR' | 'EN' | 'DE' | 'RU') => {
    setActiveLang(lang);
    if (!selectedCat) return;

    const trans = selectedCat.translations.find((t) => t.language === lang);
    setName(trans?.name || '');
    setSlug(trans?.slug || '');
    setDescription(trans?.description || '');
    setSeoTitle(trans?.seoTitle || '');
    setSeoDesc(trans?.seoDesc || '');
    setCanonical(trans?.canonical || '');
    setOgTitle(trans?.ogTitle || '');
    setOgDesc(trans?.ogDesc || '');
    setOgImage(trans?.ogImage || '');
    setIndex(trans ? trans.index : true);
    setSitemap(trans ? trans.sitemap : true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('language', activeLang);
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('image', image);
    formData.append('order', order.toString());
    formData.append('isActive', isActive ? 'true' : 'false');

    formData.append('seoTitle', seoTitle);
    formData.append('seoDesc', seoDesc);
    formData.append('canonical', canonical);
    formData.append('ogTitle', ogTitle);
    formData.append('ogDesc', ogDesc);
    formData.append('ogImage', ogImage);
    formData.append('index', index ? 'true' : 'false');
    formData.append('sitemap', sitemap ? 'true' : 'false');

    const trans = selectedCat.translations.find((t) => t.language === activeLang);
    const res = await updateCategory(selectedCat.id, trans?.id || null, formData);
    setLoading(false);

    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || 'Güncelleme sırasında hata oluştu.');
    }
  };

  const getTRTranslation = (cat: Category) => {
    return cat.translations.find((t) => t.language === 'TR') || { name: 'İsimsiz Kategori', slug: '-', description: '' };
  };

  return (
    <>
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
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 bg-gray-50 hover:bg-[var(--color-primary-100)] text-gray-600 hover:text-[var(--color-primary-700)] rounded-xl cursor-pointer transition-colors"
                        title="Tüm Dillerde & SEO Düzenle"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* KATEGORİ DETAY DÜZENLEME MODALI */}
      {isModalOpen && selectedCat && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapat Butonu */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif font-bold text-gray-950 text-xl mb-4 shrink-0 flex items-center gap-1.5">
              <Sparkles size={20} className="text-[var(--color-rose-600)]" />
              Kategori Detaylarını Düzenle
            </h3>

            {/* Dil Seçimi Sekmeleri */}
            <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 mb-6 shrink-0">
              {(['TR', 'EN', 'DE', 'RU'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLangChange(lang)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activeLang === lang ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Globe size={12} />
                  {lang} İçeriği
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Ortak Alanlar (Tüm dillerde ortak) */}
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kapak Görseli URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="/images/kategori.png"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Görünüm Sırası</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 select-none pt-6">
                  <input
                    type="checkbox"
                    id="isActiveModal"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-[var(--color-primary-500)]"
                  />
                  <label htmlFor="isActiveModal" className="text-xs text-gray-600 font-semibold cursor-pointer">
                    Kategori Aktif (Yayında)
                  </label>
                </div>
              </div>

              {/* Dil Bazlı Alanlar */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kategori Adı ({activeLang}) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Kategori Adı"
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
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kategori Açıklaması ({activeLang})</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs"
                  />
                </div>
              </div>

              {/* SEO Alanları */}
              <div className="pt-4 border-t border-gray-150 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">SEO ve Arama Motoru Ayarları</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Başlığı</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Google arama başlığı"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Canonical Link</label>
                    <input
                      type="text"
                      value={canonical}
                      onChange={(e) => setCanonical(e.target.value)}
                      placeholder="https://site.com/tr/hizmetler/slug"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Açıklaması</label>
                  <textarea
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    rows={2}
                    placeholder="Google arama açıklaması (maks 160 karakter)"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sosyal Paylaşım Başlığı (OG Title)</label>
                    <input
                      type="text"
                      value={ogTitle}
                      onChange={(e) => setOgTitle(e.target.value)}
                      placeholder="Sosyal medyada paylaşım başlığı"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sosyal Paylaşım Görseli (OG Image)</label>
                    <input
                      type="text"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="/images/og-kategori.png"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sosyal Paylaşım Açıklaması (OG Desc)</label>
                  <textarea
                    value={ogDesc}
                    onChange={(e) => setOgDesc(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      id="indexCheckbox"
                      checked={index}
                      onChange={(e) => setIndex(e.target.checked)}
                      className="rounded border-gray-300 text-[var(--color-primary-500)]"
                    />
                    <label htmlFor="indexCheckbox" className="text-xs text-gray-600 font-bold cursor-pointer">
                      Google'da İndekslensin (Index)
                    </label>
                  </div>
                  <div className="flex items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      id="sitemapCheckbox"
                      checked={sitemap}
                      onChange={(e) => setSitemap(e.target.checked)}
                      className="rounded border-gray-300 text-[var(--color-primary-500)]"
                    />
                    <label htmlFor="sitemapCheckbox" className="text-xs text-gray-600 font-bold cursor-pointer">
                      Sitemap'e Eklensin
                    </label>
                  </div>
                </div>
              </div>

              {/* Kaydet Butonu */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 bg-gray-950 hover:bg-black disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                {loading ? 'KAYDEDİLİYOR...' : 'KAYDET'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
