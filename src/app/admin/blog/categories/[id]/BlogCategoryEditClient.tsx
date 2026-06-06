"use client";

import { useState } from 'react';
import { createBlogCategory, updateBlogCategory, deleteBlogCategory } from '@/app/actions/blog';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Globe, Settings, Search as SearchIcon,
  Trash2, ToggleLeft, ToggleRight, Check, X, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface BlogCategoryEditClientProps {
  category: any | null;
  isNew: boolean;
}

export default function BlogCategoryEditClient({ category, isNew }: BlogCategoryEditClientProps) {
  const router = useRouter();

  const [activeLang, setActiveLang] = useState<'TR' | 'EN' | 'DE' | 'RU'>('TR');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [order, setOrder] = useState(category?.order ?? 0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const getTranslation = (lang: string) => category?.translations?.find((t: any) => t.language === lang);
  const currentTrans = getTranslation(activeLang);

  const [name, setName] = useState(currentTrans?.name || '');
  const [slug, setSlug] = useState(currentTrans?.slug || '');
  const [description, setDescription] = useState(currentTrans?.description || '');
  const [seoTitle, setSeoTitle] = useState(currentTrans?.seoTitle || '');
  const [seoDesc, setSeoDesc] = useState(currentTrans?.seoDesc || '');

  const handleLangChange = (lang: 'TR' | 'EN' | 'DE' | 'RU') => {
    setActiveLang(lang);
    const t = getTranslation(lang);
    setName(t?.name || '');
    setSlug(t?.slug || '');
    setDescription(t?.description || '');
    setSeoTitle(t?.seoTitle || '');
    setSeoDesc(t?.seoDesc || '');
  };

  const autoSlug = (text: string) => text.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();

  const handleSave = async () => {
    if (!name || !slug) { alert('Kategori adı ve slug alanları zorunludur.'); return; }
    setLoading(true); setSaved(false);

    const formData = new FormData();
    formData.append('order', order.toString());
    formData.append('isActive', isActive.toString());
    formData.append('language', activeLang);
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('seoTitle', seoTitle);
    formData.append('seoDesc', seoDesc);

    let result;
    if (isNew) {
      result = await createBlogCategory(formData);
    } else {
      result = await updateBlogCategory(category.id, currentTrans?.id || null, formData);
    }

    setLoading(false);
    if (result.success) {
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      if (isNew) router.push('/admin/blog/categories');
    } else { alert(result.error || 'Hata oluştu.'); }
  };

  const handleDelete = async () => {
    if (!category || isNew) return;
    if (!confirm('Bu kategoriyi silmek (pasifleştirmek) istediğinize emin misiniz?')) return;
    const res = await deleteBlogCategory(category.id);
    if (res.success) {
      router.push('/admin/blog/categories');
    } else {
      alert(res.error || 'İşlem gerçekleştirilemedi.');
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog/categories" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">{isNew ? 'Yeni Blog Kategorisi' : 'Kategoriyi Düzenle'}</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Kategori Yönetimi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold animate-pulse"><Check size={14} /> Kaydedildi</span>}
          {!isNew && <button onClick={handleDelete} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"><Trash2 size={16} /></button>}
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
            </div>
          </div>

          {/* SAĞ PANEL */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(['TR', 'EN', 'DE', 'RU'] as const).map(lang => (
                  <button key={lang} type="button" onClick={() => handleLangChange(lang)}
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
                    <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (isNew || !currentTrans) setSlug(autoSlug(e.target.value)); }}
                      placeholder="Kategori Adı"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">URL Slug</label>
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                      <span className="text-[10px] text-gray-400 font-mono">/{activeLang.toLowerCase()}/blog/</span>
                      <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="kategori-slug"
                        className="flex-1 bg-transparent text-sm focus:outline-none font-mono text-gray-700 font-semibold" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Açıklama ({activeLang})</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Kategori açıklaması..."
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
                <div>
                  <label className="block text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider mb-2">SEO Başlığı</label>
                  <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Google başlığı"
                    className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm text-cyan-100 placeholder-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-cyan-200/60 uppercase tracking-wider mb-2">SEO Açıklaması</label>
                  <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="Max 160 karakter"
                    className="w-full px-3 py-2.5 bg-[#0891b2]/30 border border-[#0891b2]/30 rounded-xl text-sm text-cyan-100 placeholder-cyan-400/40 focus:outline-none h-20 resize-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
