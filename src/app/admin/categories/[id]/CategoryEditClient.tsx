"use client";

import { useState } from 'react';
import { createCategory, updateCategory } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Globe, Settings, Search as SearchIcon,
  ToggleLeft, ToggleRight, Check, X, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface CategoryEditClientProps {
  category: any | null;
  isNew: boolean;
}

export default function CategoryEditClient({ category, isNew }: CategoryEditClientProps) {
  const router = useRouter();

  const [activeLang, setActiveLang] = useState<'TR' | 'EN' | 'DE' | 'RU'>('TR');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [order, setOrder] = useState(category?.order ?? 0);
  const [image, setImage] = useState(category?.image || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const getTranslation = (lang: string) => category?.translations?.find((t: any) => t.language === lang);
  const currentTrans = getTranslation(activeLang);

  const [name, setName] = useState(currentTrans?.name || '');
  const [slug, setSlug] = useState(currentTrans?.slug || '');
  const [description, setDescription] = useState(currentTrans?.description || '');
  const [seoTitle, setSeoTitle] = useState(currentTrans?.seoTitle || '');
  const [seoDesc, setSeoDesc] = useState(currentTrans?.seoDesc || '');
  const [canonical, setCanonical] = useState(currentTrans?.canonical || '');
  const [ogTitle, setOgTitle] = useState(currentTrans?.ogTitle || '');
  const [ogDesc, setOgDesc] = useState(currentTrans?.ogDesc || '');
  const [ogImage, setOgImage] = useState(currentTrans?.ogImage || '');
  const [indexEnabled, setIndexEnabled] = useState(currentTrans?.index ?? true);
  const [sitemapEnabled, setSitemapEnabled] = useState(currentTrans?.sitemap ?? true);

  const handleLangChange = (lang: 'TR' | 'EN' | 'DE' | 'RU') => {
    setActiveLang(lang);
    const t = getTranslation(lang);
    setName(t?.name || '');
    setSlug(t?.slug || '');
    setDescription(t?.description || '');
    setSeoTitle(t?.seoTitle || '');
    setSeoDesc(t?.seoDesc || '');
    setCanonical(t?.canonical || '');
    setOgTitle(t?.ogTitle || '');
    setOgDesc(t?.ogDesc || '');
    setOgImage(t?.ogImage || '');
    setIndexEnabled(t?.index ?? true);
    setSitemapEnabled(t?.sitemap ?? true);
  };

  const autoSlug = (text: string) => text.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();

  const handleSave = async () => {
    if (!name || !slug) { alert('Kategori adı ve slug alanları zorunludur.'); return; }
    setLoading(true); setSaved(false);

    if (isNew) {
      const result = await createCategory({
        name,
        slug,
        seoTitle: seoTitle || undefined,
        seoDesc: seoDesc || undefined,
        description: description || undefined
      });
      setLoading(false);
      if (result.success) {
        setSaved(true); setTimeout(() => setSaved(false), 2500);
        router.push('/admin/categories');
      } else { alert(result.error || 'Hata oluştu.'); }
    } else {
      const formData = new FormData();
      formData.append('isActive', isActive.toString());
      formData.append('order', order.toString());
      formData.append('image', image);
      formData.append('language', activeLang);
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('description', description);
      formData.append('seoTitle', seoTitle);
      formData.append('seoDesc', seoDesc);
      formData.append('canonical', canonical);
      formData.append('ogTitle', ogTitle);
      formData.append('ogDesc', ogDesc);
      formData.append('ogImage', ogImage);
      formData.append('index', indexEnabled.toString());
      formData.append('sitemap', sitemapEnabled.toString());

      const result = await updateCategory(category.id, currentTrans?.id || null, formData);
      setLoading(false);
      if (result.success) {
        setSaved(true); setTimeout(() => setSaved(false), 2500);
      } else { alert(result.error || 'Hata oluştu.'); }
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">{isNew ? 'Yeni Hizmet Kategorisi' : 'Kategoriyi Düzenle'}</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Hizmet Kategori Yönetimi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold animate-pulse"><Check size={14} /> Kaydedildi</span>}
          <button onClick={handleSave} disabled={loading}
            className="px-5 py-2.5 bg-[#0891b2] hover:bg-[#0e7490] disabled:bg-gray-400 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</> : <><Save size={14} /> Kaydet</>}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          {/* SOL PANEL */}
          <div className="col-span-12 lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-[#0891b2]/5 to-transparent">
                <h3 className="text-[11px] font-bold text-[#0891b2] uppercase tracking-wider flex items-center gap-1.5"><Settings size={13} /> Yapılandırma</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Görsel URL</label>
                  <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="/images/kategori.jpg"
                    disabled={isNew}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Görünüm Sırası</label>
                  <input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    disabled={isNew}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 disabled:opacity-50" />
                </div>
              </div>
            </div>

            {!isNew && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Yayın Durumu</span>
                  <button type="button" onClick={() => setIsActive(!isActive)} className="cursor-pointer">
                    {isActive ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-gray-300" />}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-600">Index</span>
                  <button type="button" onClick={() => setIndexEnabled(!indexEnabled)} className="cursor-pointer">
                    {indexEnabled ? <ToggleRight size={24} className="text-[#0891b2]" /> : <ToggleLeft size={24} className="text-gray-300" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Sitemap</span>
                  <button type="button" onClick={() => setSitemapEnabled(!sitemapEnabled)} className="cursor-pointer">
                    {sitemapEnabled ? <ToggleRight size={24} className="text-[#0891b2]" /> : <ToggleLeft size={24} className="text-gray-300" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SAĞ PANEL */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(['TR', 'EN', 'DE', 'RU'] as const).map(lang => (
                  <button key={lang} type="button" onClick={() => handleLangChange(lang)}
                    disabled={isNew && lang !== 'TR'}
                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer relative disabled:opacity-30 ${
                      activeLang === lang ? 'text-[#0891b2] bg-[#0891b2]/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}>
                    {lang === 'TR' ? 'TÜRKÇE' : lang === 'EN' ? 'ENGLISH' : lang === 'DE' ? 'DEUTSCH' : 'РУССКИЙ'}
                    {activeLang === lang && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0891b2]"></div>}
                  </button>
                ))}
              </div>
              <div className="p-6 space-y-5">
                {isNew && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold">
                    Yeni kategoriler Türkçe (TR) olarak oluşturulur ve otomatik olarak diğer dillere kopyalanır. Oluşturduktan sonra diğer dilleri düzenleyebilirsiniz.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kategori Adı ({activeLang})</label>
                    <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (isNew || !currentTrans) setSlug(autoSlug(e.target.value)); }}
                      placeholder="Kategori Adı"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">URL Slug</label>
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                      <span className="text-[10px] text-gray-400 font-mono">/{activeLang.toLowerCase()}/kategoriler/</span>
                      <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="kategori-slug"
                        className="flex-1 bg-transparent text-sm focus:outline-none font-mono text-gray-700 font-semibold" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Açıklama ({activeLang})</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Kategori detaylı açıklaması..."
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 h-24 resize-none" />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-gradient-to-br from-[#0c4a6e] to-[#164e63] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4">
                <h3 className="text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5"><SearchIcon size={13} /> SEO Ayarları ({activeLang})</h3>
              </div>
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider mb-2">SEO Başlığı</label>
                    <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Google başlığı"
                      className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm text-cyan-100 placeholder-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider mb-2">Canonical URL</label>
                    <input type="url" value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder="https://..."
                      disabled={isNew}
                      className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm font-mono text-cyan-100 placeholder-cyan-400/40 focus:outline-none disabled:opacity-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider mb-2">Meta Description</label>
                  <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="Max 160 karakter"
                    className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm text-cyan-100 placeholder-cyan-400/40 focus:outline-none h-20 resize-none" />
                </div>
                {!isNew && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-cyan-700/30">
                    <div>
                      <label className="block text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider mb-2">OG Başlık</label>
                      <input type="text" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm text-cyan-100 placeholder-cyan-400/40 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider mb-2">OG Görsel URL</label>
                      <input type="text" value={ogImage} onChange={(e) => setOgImage(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm font-mono text-cyan-100 placeholder-cyan-400/40 focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
