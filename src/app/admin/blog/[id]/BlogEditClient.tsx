"use client";

import { useState } from 'react';
import { createBlogPost, updateBlogPost, deleteBlogPost } from '@/app/actions/blog';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Settings, Search as SearchIcon,
  Trash2, ToggleLeft, ToggleRight, BookOpen,
  Check, Loader2, Star, Tag
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Language } from '@prisma/client';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface BlogEditClientProps {
  post: any | null;
  isNew: boolean;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
}

type TransData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDesc: string;
  canonical: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  index: boolean;
  sitemap: boolean;
};

export default function BlogEditClient({ post, isNew, categories, tags }: BlogEditClientProps) {
  const router = useRouter();

  const [activeLang, setActiveLang] = useState<'TR' | 'EN' | 'DE' | 'RU'>('TR');
  const [isActive, setIsActive] = useState(post?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(post?.isFeatured ?? false);
  const [image, setImage] = useState(post?.image || '');
  const [authorName, setAuthorName] = useState(post?.authorName || 'N&L Studio');
  const [publishedAt, setPublishedAt] = useState(post?.publishedAt || new Date().toISOString().split('T')[0]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(post?.categoryIds || []);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(post?.tagIds || []);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const initTrans = () => {
    const langs: ('TR' | 'EN' | 'DE' | 'RU')[] = ['TR', 'EN', 'DE', 'RU'];
    const map: Record<string, TransData> = {};
    for (const l of langs) {
      const t = post?.translations?.find((x: any) => x.language === l);
      map[l] = {
        id: t?.id,
        title: t?.title || '',
        slug: t?.slug || '',
        excerpt: t?.excerpt || '',
        content: t?.content || '',
        seoTitle: t?.seoTitle || '',
        seoDesc: t?.seoDesc || '',
        canonical: t?.canonical || '',
        ogTitle: t?.ogTitle || '',
        ogDesc: t?.ogDesc || '',
        ogImage: t?.ogImage || '',
        index: t?.index ?? true,
        sitemap: t?.sitemap ?? true,
      };
    }
    return map;
  };

  const [translations, setTranslations] = useState(initTrans());

  const handleLangChange = (lang: 'TR' | 'EN' | 'DE' | 'RU') => {
    setActiveLang(lang);
  };

  const updateTrans = (key: keyof TransData, value: any) => {
    setTranslations(prev => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [key]: value
      }
    }));
  };

  const autoSlug = (text: string) => text.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();

  const handleTitleChange = (val: string) => {
    updateTrans('title', val);
    if (isNew || !translations[activeLang].id) {
      updateTrans('slug', autoSlug(val));
    }
  };

  const handleSave = async () => {
    if (!translations['TR'].title || !translations['TR'].slug) { 
      alert('TR Başlık ve slug zorunludur.'); return; 
    }
    setLoading(true); setSaved(false);

    const formData = new FormData();
    formData.append('isActive', isActive.toString());
    formData.append('isFeatured', isFeatured.toString());
    formData.append('image', image);
    formData.append('authorName', authorName);
    formData.append('publishedAt', publishedAt);
    formData.append('categoryIds', JSON.stringify(selectedCategoryIds));
    formData.append('tagIds', JSON.stringify(selectedTagIds));
    
    // Pass translations object as JSON
    formData.append('translations', JSON.stringify(translations));

    let result;
    if (isNew) {
      result = await createBlogPost(formData);
    } else {
      result = await updateBlogPost(post.id, formData);
    }

    setLoading(false);
    if (result.success) {
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      if (isNew) router.push('/admin/blog');
    } else { alert(result.error || 'Hata oluştu.'); }
  };

  const handleDelete = async () => {
    if (!post || isNew) return;
    if (!confirm('Bu blog yazısını pasifleştirmek istediğinize emin misiniz?')) return;
    await deleteBlogPost(post.id);
    router.push('/admin/blog');
  };

  const cur = translations[activeLang];

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">{isNew ? 'Yeni Blog Yazısı' : 'Blog Yazısını Düzenle'}</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Blog Yönetimi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold animate-pulse"><Check size={14} /> Kaydedildi</span>}
          {!isNew && <button onClick={handleDelete} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"><Trash2 size={16} /></button>}
          <button onClick={handleSave} disabled={loading}
            className="px-5 py-2.5 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] disabled:bg-gray-400 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</> : <><Save size={14} /> Kaydet</>}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          {/* SOL PANEL */}
          <div className="col-span-12 lg:col-span-4 space-y-5">
            {/* Genel Ayarlar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-[var(--color-rose-500)]/5 to-transparent">
                <h3 className="text-[11px] font-bold text-[var(--color-rose-600)] uppercase tracking-wider flex items-center gap-1.5"><Settings size={13} /> Yapılandırma</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Kapak Görseli URL</label>
                  <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="/uploads/blog-cover.jpg"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Yazar</label>
                    <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Yayın Tarihi</label>
                    <input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle'lar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Yayın Durumu</span>
                <button type="button" onClick={() => setIsActive(!isActive)} className="cursor-pointer">
                  {isActive ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-gray-300" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Star size={12} className="text-yellow-500" /> Öne Çıkan</span>
                <button type="button" onClick={() => setIsFeatured(!isFeatured)} className="cursor-pointer">
                  {isFeatured ? <ToggleRight size={28} className="text-yellow-500" /> : <ToggleLeft size={28} className="text-gray-300" />}
                </button>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-600">Index ({activeLang})</span>
                <button type="button" onClick={() => updateTrans('index', !cur.index)} className="cursor-pointer">
                  {cur.index ? <ToggleRight size={24} className="text-[var(--color-rose-500)]" /> : <ToggleLeft size={24} className="text-gray-300" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Sitemap ({activeLang})</span>
                <button type="button" onClick={() => updateTrans('sitemap', !cur.sitemap)} className="cursor-pointer">
                  {cur.sitemap ? <ToggleRight size={24} className="text-[var(--color-rose-500)]" /> : <ToggleLeft size={24} className="text-gray-300" />}
                </button>
              </div>
            </div>

            {/* Kategoriler */}
            {categories.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-transparent">
                  <h3 className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5"><Tag size={12} /> Kategoriler</h3>
                </div>
                <div className="p-4 space-y-2 max-h-40 overflow-y-auto">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={selectedCategoryIds.includes(cat.id)}
                        onChange={() => setSelectedCategoryIds(prev => prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                        className="w-3.5 h-3.5 text-purple-600 border-gray-300 rounded" />
                      <span className="font-medium">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Etiketler */}
            {tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Etiketler</h3>
                </div>
                <div className="p-4 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {tags.map(tag => (
                    <button key={tag.id} type="button" onClick={() => setSelectedTagIds(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id])}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all cursor-pointer ${
                        selectedTagIds.includes(tag.id) ? 'bg-[var(--color-rose-500)] text-white border-[var(--color-rose-500)]' : 'bg-white text-gray-500 border-gray-200 hover:border-[var(--color-rose-500)]/50'
                      }`}>
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SAĞ PANEL */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            {/* Dil Sekmeleri + İçerik */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(['TR', 'EN', 'DE', 'RU'] as const).map(lang => (
                  <button key={lang} type="button" onClick={() => handleLangChange(lang)}
                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
                      activeLang === lang ? 'text-[var(--color-rose-500)] bg-[var(--color-rose-500)]/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}>
                    {lang === 'TR' ? 'TÜRKÇE' : lang === 'EN' ? 'ENGLISH' : lang === 'DE' ? 'DEUTSCH' : 'РУССКИЙ'}
                    {activeLang === lang && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-rose-500)]"></div>}
                  </button>
                ))}
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Makale Başlığı ({activeLang})</label>
                    <input type="text" value={cur.title} onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Makale başlığı"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">URL Slug</label>
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                      <span className="text-[10px] text-gray-400 font-mono">/{activeLang.toLowerCase()}/blog/</span>
                      <input type="text" value={cur.slug} onChange={(e) => updateTrans('slug', e.target.value)} placeholder="makale-slug"
                        className="flex-1 bg-transparent text-sm focus:outline-none font-mono text-gray-700 font-semibold" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kısa Özet / Giriş ({activeLang})</label>
                  <textarea value={cur.excerpt} onChange={(e) => updateTrans('excerpt', e.target.value)} placeholder="Listede görünecek kısa açıklama..."
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20 h-16 resize-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <BookOpen size={11} className="inline mr-1" /> Makale İçeriği ({activeLang})
                  </label>
                  <RichTextEditor content={cur.content} onChange={(v) => updateTrans('content', v)} placeholder="Makale içeriğini yazın..." />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-gradient-to-br from-[var(--color-rose-500)] to-[var(--color-rose-600)] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4">
                <h3 className="text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5"><SearchIcon size={13} /> SEO Ayarları ({activeLang})</h3>
              </div>
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">SEO Başlığı</label>
                    <input type="text" value={cur.seoTitle} onChange={(e) => updateTrans('seoTitle', e.target.value)} placeholder="Google başlığı"
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Canonical URL</label>
                    <input type="url" value={cur.canonical} onChange={(e) => updateTrans('canonical', e.target.value)} placeholder="https://..."
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-white/40 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Meta Description</label>
                  <textarea value={cur.seoDesc} onChange={(e) => updateTrans('seoDesc', e.target.value)} placeholder="Max 160 karakter"
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none h-16 resize-none" />
                  <div className="flex justify-end mt-1"><span className={`text-[10px] font-bold ${cur.seoDesc.length > 160 ? 'text-red-300' : 'text-white/50'}`}>{cur.seoDesc.length}/160</span></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">OG Başlık</label>
                    <input type="text" value={cur.ogTitle} onChange={(e) => updateTrans('ogTitle', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">OG Görsel URL</label>
                    <input type="text" value={cur.ogImage} onChange={(e) => updateTrans('ogImage', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-white/40 focus:outline-none" />
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
