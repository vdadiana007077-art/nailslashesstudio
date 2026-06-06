"use client";

import { useState } from 'react';
import { createCmsPage, updateCmsPage, deleteCmsPage } from '@/app/actions/cms-page';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Globe, Settings, Search as SearchIcon,
  Eye, Trash2, ToggleLeft, ToggleRight, FileText,
  Check, X, Loader2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface PageTranslation {
  id: string;
  language: string;
  slug: string;
  title: string;
  content: string;
  seoTitle: string | null;
  seoDesc: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDesc: string | null;
  ogImage: string | null;
  index: boolean;
  sitemap: boolean;
}

interface PageEditClientProps {
  page: {
    id: string;
    isActive: boolean;
    translations: PageTranslation[];
  } | null;
  isNew: boolean;
}

export default function PageEditClient({ page, isNew }: PageEditClientProps) {
  const router = useRouter();

  const [activeLang, setActiveLang] = useState<'TR' | 'EN' | 'DE' | 'RU'>('TR');
  const [isActive, setIsActive] = useState(page?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Dil bazlı form verileri
  const getTranslation = (lang: string): PageTranslation | undefined => {
    return page?.translations.find(t => t.language === lang);
  };

  const currentTrans = getTranslation(activeLang);

  const [title, setTitle] = useState(currentTrans?.title || '');
  const [slug, setSlug] = useState(currentTrans?.slug || '');
  const [content, setContent] = useState(currentTrans?.content || '');
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
    const trans = getTranslation(lang);
    setTitle(trans?.title || '');
    setSlug(trans?.slug || '');
    setContent(trans?.content || '');
    setSeoTitle(trans?.seoTitle || '');
    setSeoDesc(trans?.seoDesc || '');
    setCanonical(trans?.canonical || '');
    setOgTitle(trans?.ogTitle || '');
    setOgDesc(trans?.ogDesc || '');
    setOgImage(trans?.ogImage || '');
    setIndexEnabled(trans?.index ?? true);
    setSitemapEnabled(trans?.sitemap ?? true);
  };

  const handleSave = async () => {
    if (!title || !slug) {
      alert('Başlık ve slug zorunludur.');
      return;
    }

    setLoading(true);
    setSaved(false);

    const formData = new FormData();
    formData.append('isActive', isActive.toString());
    formData.append('language', activeLang);
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('content', content);
    formData.append('seoTitle', seoTitle);
    formData.append('seoDesc', seoDesc);
    formData.append('canonical', canonical);
    formData.append('ogTitle', ogTitle);
    formData.append('ogDesc', ogDesc);
    formData.append('ogImage', ogImage);
    formData.append('index', indexEnabled.toString());
    formData.append('sitemap', sitemapEnabled.toString());

    let result;
    if (isNew) {
      result = await createCmsPage(formData);
    } else {
      const translationId = currentTrans?.id || null;
      result = await updateCmsPage(page!.id, translationId, formData);
    }

    setLoading(false);

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (isNew) {
        router.push('/admin/pages');
      }
    } else {
      alert(result.error || 'Hata oluştu.');
    }
  };

  const handleDelete = async () => {
    if (!page || isNew) return;
    if (!confirm('Bu sayfayı pasifleştirmek istediğinize emin misiniz?')) return;
    await deleteCmsPage(page.id);
    router.push('/admin/pages');
  };

  // Auto-generate slug from title
  const autoSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">
              {isNew ? 'Yeni CMS Sayfası' : 'Sayfayı Düzenle'}
            </h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Kurumsal Sayfa Yönetimi</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold animate-pulse">
              <Check size={14} /> Kaydedildi
            </span>
          )}
          {!isNew && (
            <button onClick={handleDelete} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer" title="Pasifleştir">
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] disabled:bg-gray-400 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</> : <><Save size={14} /> Kaydet</>}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">

          {/* SOL PANEL */}
          <div className="col-span-12 lg:col-span-4 space-y-5">
            {/* Durum Toggle */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Yayın Durumu</span>
                <button type="button" onClick={() => setIsActive(!isActive)} className="cursor-pointer">
                  {isActive ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-gray-300" />}
                </button>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-500 border-red-200'
              }`}>
                {isActive ? 'YAYINDA (AKTİF)' : 'PASİF'}
              </span>

              {/* Index / Sitemap */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Arama Motorlarına İndeksle</span>
                  <button type="button" onClick={() => setIndexEnabled(!indexEnabled)} className="cursor-pointer">
                    {indexEnabled ? <ToggleRight size={24} className="text-[var(--color-rose-500)]" /> : <ToggleLeft size={24} className="text-gray-300" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Sitemap'e Ekle</span>
                  <button type="button" onClick={() => setSitemapEnabled(!sitemapEnabled)} className="cursor-pointer">
                    {sitemapEnabled ? <ToggleRight size={24} className="text-[var(--color-rose-500)]" /> : <ToggleLeft size={24} className="text-gray-300" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Dil Durumu */}
            {!isNew && page && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-[var(--color-rose-500)]/5 to-transparent">
                  <h3 className="text-[11px] font-bold text-[var(--color-rose-600)] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={13} /> Dil Durumu
                  </h3>
                </div>
                <div className="p-5 space-y-2">
                  {['TR', 'EN', 'DE', 'RU'].map(lang => {
                    const has = page.translations.some(t => t.language === lang);
                    return (
                      <div key={lang} className="flex items-center justify-between py-1.5">
                        <span className="text-xs font-bold text-gray-600">{lang === 'TR' ? 'Türkçe' : lang === 'EN' ? 'English' : lang === 'DE' ? 'Deutsch' : 'Русский'}</span>
                        {has ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                            <Check size={12} /> Mevcut
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                            <X size={12} /> Eksik
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* OG & Social */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-transparent">
                <h3 className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Sosyal Medya (OG)</h3>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">OG Başlık</label>
                  <input type="text" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder="Paylaşım başlığı" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">OG Açıklama</label>
                  <textarea value={ogDesc} onChange={(e) => setOgDesc(e.target.value)} placeholder="Paylaşım açıklaması" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-200 h-16 resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">OG Görsel URL</label>
                  <input type="text" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="/uploads/og-image.jpg" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ PANEL */}
          <div className="col-span-12 lg:col-span-8 space-y-5">

            {/* Dil Sekmeleri + İçerik */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(['TR', 'EN', 'DE', 'RU'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLangChange(lang)}
                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
                      activeLang === lang
                        ? 'text-[var(--color-rose-500)] bg-[var(--color-rose-500)]/5'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {lang === 'TR' ? 'TÜRKÇE' : lang === 'EN' ? 'ENGLISH' : lang === 'DE' ? 'DEUTSCH' : 'РУССКИЙ'}
                    {activeLang === lang && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-rose-500)]"></div>}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-5">
                {/* Başlık + Slug */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sayfa Başlığı ({activeLang})</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (isNew || !currentTrans) setSlug(autoSlug(e.target.value));
                      }}
                      placeholder="Örn: Hakkımızda"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20 focus:border-[var(--color-rose-500)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">URL Slug</label>
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                      <span className="text-[10px] text-gray-400 font-mono">/{activeLang.toLowerCase()}/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="hakkimizda"
                        className="flex-1 bg-transparent text-sm focus:outline-none font-mono text-gray-700 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <FileText size={11} className="inline mr-1" /> Sayfa İçeriği ({activeLang})
                  </label>
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Sayfa içeriğini yazın..."
                  />
                </div>
              </div>
            </div>

            {/* SEO Alanı */}
            <div className="bg-gradient-to-br from-[var(--color-rose-500)] to-[var(--color-rose-600)] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4">
                <h3 className="text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                  <SearchIcon size={13} /> SEO & Arama Motoru Ayarları ({activeLang})
                </h3>
              </div>
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">SEO Başlığı (Title Tag)</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Google'da görünecek başlık"
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Canonical URL</label>
                    <input
                      type="url"
                      value={canonical}
                      onChange={(e) => setCanonical(e.target.value)}
                      placeholder="https://nailslashesstudio.com/tr/..."
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">SEO Açıklaması (Meta Description)</label>
                  <textarea
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    placeholder="Arama sonuçlarında görünecek açıklama (max 160 karakter)"
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 h-16 resize-none"
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-[10px] font-bold ${seoDesc.length > 160 ? 'text-red-300' : 'text-white/50'}`}>
                      {seoDesc.length}/160
                    </span>
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
