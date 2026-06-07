"use client";

import Image from 'next/image';
import { useState } from 'react';
import { deleteBlogPost } from '@/app/actions/blog';
import { 
  Plus, Edit2, Trash2, Search, BookOpen, Eye, Check, X, Calendar, User, Star, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

interface BlogPostItem {
  id: string;
  image: string | null;
  authorName: string | null;
  isActive: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  translations: any[];
  categoryIds: string[];
  tagIds: string[];
}

interface BlogClientProps {
  initialPosts: BlogPostItem[];
  currentLocale: string;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
}

export default function BlogClient({ initialPosts, categories }: BlogClientProps) {
  const [posts, setPosts] = useState<BlogPostItem[]>(initialPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu blog yazısını pasifleştirmek istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deleteBlogPost(id);
    setLoadingId(null);
    if (result.success) {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p));
      showFeedback('success', 'Blog yazısı pasifleştirildi.');
    } else {
      showFeedback('error', result.error || 'Hata oluştu.');
    }
  };

  const getTitle = (post: BlogPostItem) => {
    const tr = post.translations.find((t: any) => t.language === 'TR');
    return tr?.title || post.translations[0]?.title || 'Başlıksız';
  };

  const getSlug = (post: BlogPostItem) => {
    const tr = post.translations.find((t: any) => t.language === 'TR');
    return tr?.slug || post.translations[0]?.slug || '';
  };

  const getLangBadges = (post: BlogPostItem) => {
    return ['TR', 'EN', 'DE', 'RU'].map(lang => ({
      lang,
      has: post.translations.some((t: any) => t.language === lang)
    }));
  };

  const getSeoScore = (post: BlogPostItem) => {
    let total = 0, filled = 0;
    post.translations.forEach((t: any) => {
      total += 4;
      if (t.seoTitle) filled++;
      if (t.seoDesc) filled++;
      if (t.canonical) filled++;
      if (t.ogImage) filled++;
    });
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  };

  const filteredPosts = posts.filter(post =>
    post.translations.some((t: any) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getCategoryNames = (post: BlogPostItem) => {
    return post.categoryIds.map(id => categories.find(c => c.id === id)?.name).filter(Boolean);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
          <span className="text-xs font-bold">{message.text}</span>
        </div>
      )}

      {/* Üst Çubuk */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Blog başlığı veya slug ile ara..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20 focus:border-[var(--color-rose-500)] shadow-sm"
          />
        </div>
        <Link href="/admin/blog/new"
          className="px-5 py-2.5 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
          <Plus size={14} /> Yeni Blog Yazısı
        </Link>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-3 w-16">#</th>
                <th className="px-4 py-3">Blog Yazısı</th>
                <th className="px-4 py-3 w-32">Kategori</th>
                <th className="px-4 py-3 w-32">Diller</th>
                <th className="px-4 py-3 w-24 text-center">SEO</th>
                <th className="px-4 py-3 w-24 text-center">Durum</th>
                <th className="px-4 py-3 w-28 text-right pr-6">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <BookOpen className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-400 text-xs font-semibold">Blog yazısı bulunamadı.</p>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post, idx) => {
                  const seoScore = getSeoScore(post);
                  const catNames = getCategoryNames(post);
                  return (
                    <tr key={post.id} className="border-b border-gray-50 hover:bg-rose-50/10 transition-colors group">
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-bold text-gray-400">#{idx}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center">
                            {post.image ? (
                              <Image width={800} height={800} src={post.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={16} className="text-gray-300" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Link href={`/admin/blog/${post.id}`}
                                className="text-sm font-bold text-[var(--color-rose-600)] hover:text-[var(--color-rose-700)] hover:underline transition-colors">
                                {getTitle(post)}
                              </Link>
                              {post.isFeatured && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400">
                              <span className="flex items-center gap-1"><User size={10} /> {post.authorName || 'N&L Studio'}</span>
                              <span className="flex items-center gap-1"><Calendar size={10} /> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('tr-TR') : '-'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {catNames.length > 0 ? catNames.map((name, i) => (
                            <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-200">{name}</span>
                          )) : <span className="text-[10px] text-gray-400">-</span>}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          {getLangBadges(post).map(({ lang, has }) => (
                            <span key={lang} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              has ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-300 border border-gray-100'
                            }`}>{lang}</span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${seoScore >= 75 ? 'bg-emerald-500' : seoScore >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`} style={{ width: `${seoScore}%` }} />
                          </div>
                          <span className={`text-[10px] font-bold ${seoScore >= 75 ? 'text-emerald-600' : seoScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>%{seoScore}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {post.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> AKTİF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> PASİF
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right pr-6">
                        <div className="flex justify-end gap-1.5">
                          {post.isActive && getSlug(post) && (
                            <a href={`/tr/blog/${getSlug(post)}`} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer" title="Önizle">
                              <Eye size={14} />
                            </a>
                          )}
                          <Link href={`/admin/blog/${post.id}`}
                            className="p-1.5 text-gray-400 hover:text-[var(--color-rose-500)] hover:bg-rose-50 rounded-lg transition-all cursor-pointer" title="Düzenle">
                            <Edit2 size={14} />
                          </Link>
                          {post.isActive && (
                            <button onClick={() => handleDelete(post.id)} disabled={loadingId === post.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50" title="Pasifleştir">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
