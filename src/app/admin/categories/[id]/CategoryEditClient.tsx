"use client";

import { useState } from 'react';
import { createCategory, updateCategory } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Settings, Search as SearchIcon, ToggleLeft, ToggleRight, Check, Loader2 } from 'lucide-react';
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

  const getInitialTrans = (lang: string) => {
    const t = category?.translations?.find((t: any) => t.language === lang);
    return {
      language: lang,
      id: t?.id || null,
      name: t?.name || '',
      slug: t?.slug || '',
      description: t?.description || '',
      seoTitle: t?.seoTitle || '',
      seoDesc: t?.seoDesc || '',
      canonical: t?.canonical || '',
      ogTitle: t?.ogTitle || '',
      ogDesc: t?.ogDesc || '',
      ogImage: t?.ogImage || '',
      index: t?.index ?? true,
      sitemap: t?.sitemap ?? true,
    };
  };

  const [translations, setTranslations] = useState<Record<string, any>>({
    TR: getInitialTrans('TR'),
    EN: getInitialTrans('EN'),
    DE: getInitialTrans('DE'),
    RU: getInitialTrans('RU'),
  });

  const updateTrans = (field: string, value: any) => {
    setTranslations(prev => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], [field]: value }
    }));
  };

  const currentTrans = translations[activeLang];

  const autoSlug = (text: string) => text.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();

  const handleNameChange = (val: string) => {
    updateTrans('name', val);
    if (isNew || !currentTrans.id) {
      updateTrans('slug', autoSlug(val));
    }
  };

  const handleSave = async () => {
    if (!translations['TR'].name || !translations['TR'].slug) { 
      alert('TÜRKÇE dili için Kategori Adı ve Slug alanları zorunludur.'); 
      return; 
    }
    setLoading(true); setSaved(false);

    const formData = new FormData();
    formData.append('isActive', isActive.toString());
    formData.append('order', order.toString());
    formData.append('image', image);
    formData.append('translations', JSON.stringify(Object.values(translations)));

    if (isNew) {
      const result = await createCategory(formData);
      setLoading(false);
      if (result.success) {
        setSaved(true); setTimeout(() => setSaved(false), 2500);
        router.push('/admin/categories');
      } else { alert(result.error || 'Hata oluştu.'); }
    } else {
      const result = await updateCategory(category.id, formData);
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Görünüm Sırası</label>
                  <input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Yayın Durumu</span>
                <button type="button" onClick={() => setIsActive(!isActive)} className="cursor-pointer">
                  {isActive ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-gray-300" />}
                </button>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-600">Index ({activeLang})</span>
                <button type="button" onClick={() => updateTrans('index', !currentTrans.index)} className="cursor-pointer">
                  {currentTrans.index ? <ToggleRight size={24} className="text-[#0891b2]" /> : <ToggleLeft size={24} className="text-gray-300" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Sitemap ({activeLang})</span>
                <button type="button" onClick={() => updateTrans('sitemap', !currentTrans.sitemap)} className="cursor-pointer">
                  {currentTrans.sitemap ? <ToggleRight size={24} className="text-[#0891b2]" /> : <ToggleLeft size={24} className="text-gray-300" />}
                </button>
              </div>
            </div>
          </div>

          {/* SAĞ PANEL */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(['TR', 'EN', 'DE', 'RU'] as const).map(lang => (
                  <button key={lang} type="button" onClick={() => setActiveLang(lang)}
                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
                      activeLang === lang ? 'text-[#0891b2] bg-[#0891b2]/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}>
                    {lang === 'TR' ? 'TÜRKÇE' : lang === 'EN' ? 'ENGLISH' : lang === 'DE' ? 'DEUTSCH' : 'РУССКИЙ'}
                    {activeLang === lang && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0891b2]"></div>}
                  </button>
                ))}
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kategori Adı ({activeLang})</label>
                    <input type="text" value={currentTrans.name} onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Kategori Adı"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">URL Slug ({activeLang})</label>
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                      <span className="text-[10px] text-gray-400 font-mono">/{activeLang.toLowerCase()}/kategoriler/</span>
                      <input type="text" value={currentTrans.slug} onChange={(e) => updateTrans('slug', e.target.value)} placeholder="kategori-slug"
                        className="flex-1 bg-transparent text-sm focus:outline-none font-mono text-gray-700 font-semibold" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Açıklama ({activeLang})</label>
                  <textarea value={currentTrans.description} onChange={(e) => updateTrans('description', e.target.value)} placeholder="Kategori detaylı açıklaması..."
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
                    <input type="text" value={currentTrans.seoTitle} onChange={(e) => updateTrans('seoTitle', e.target.value)} placeholder="Google başlığı"
                      className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm text-cyan-100 placeholder-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider mb-2">Canonical URL</label>
                    <input type="url" value={currentTrans.canonical} onChange={(e) => updateTrans('canonical', e.target.value)} placeholder="https://..."
                      className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm font-mono text-cyan-100 placeholder-cyan-400/40 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider mb-2">Meta Description</label>
                  <textarea value={currentTrans.seoDesc} onChange={(e) => updateTrans('seoDesc', e.target.value)} placeholder="Max 160 karakter"
                    className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm text-cyan-100 placeholder-cyan-400/40 focus:outline-none h-20 resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-cyan-700/30">
                  <div>
                    <label className="block text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider mb-2">OG Başlık</label>
                    <input type="text" value={currentTrans.ogTitle} onChange={(e) => updateTrans('ogTitle', e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm text-cyan-100 placeholder-cyan-400/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider mb-2">OG Görsel URL</label>
                    <input type="text" value={currentTrans.ogImage} onChange={(e) => updateTrans('ogImage', e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm font-mono text-cyan-100 placeholder-cyan-400/40 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
