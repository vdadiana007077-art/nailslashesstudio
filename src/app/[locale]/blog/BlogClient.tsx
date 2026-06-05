"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, User, Search, ChevronRight } from 'lucide-react';

type Post = {
  id: string;
  image: string;
  authorName: string;
  isFeatured: boolean;
  publishedAt: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryName: string;
  categorySlug: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type BlogClientProps = {
  initialPosts: Post[];
  categories: Category[];
  locale: string;
};

export default function BlogClient({ initialPosts, categories, locale }: BlogClientProps) {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtreleme mantığı
  const filteredPosts = initialPosts.filter(post => {
    const matchesCategory = selectedCategorySlug === 'ALL' || post.categorySlug === selectedCategorySlug;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Öne çıkan yazıyı belirle (Filtreleme yokken ve arama boşken isFeatured olan ilk yazıyı öne çıkar)
  const featuredPost = searchQuery === '' && selectedCategorySlug === 'ALL'
    ? filteredPosts.find(p => p.isFeatured) 
    : null;

  // Grid listesi (Öne çıkan yazı varsa onu listeden çıkar)
  const gridPosts = featuredPost 
    ? filteredPosts.filter(p => p.id !== featuredPost.id) 
    : filteredPosts;

  return (
    <div className="space-y-12">
      
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-[var(--color-rose-100)] rounded-3xl p-6 shadow-sm">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 order-2 md:order-1 justify-center md:justify-start">
          <button
            onClick={() => setSelectedCategorySlug('ALL')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              selectedCategorySlug === 'ALL'
                ? 'bg-gray-950 text-white shadow-sm'
                : 'bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tümü
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategorySlug(cat.slug)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                selectedCategorySlug === cat.slug
                  ? 'bg-[var(--color-rose-600)] text-white shadow-sm'
                  : 'bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 order-1 md:order-2">
          <input
            type="text"
            placeholder="Makale ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
          />
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* FEATURED POST (Yalnızca arama/filtreleme yoksa) */}
      {featuredPost && (
        <div className="bg-white border border-[var(--color-rose-100)] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-2 group">
          {/* Image */}
          <div className="h-64 md:h-full min-h-[300px] relative overflow-hidden bg-gray-100">
            {featuredPost.image ? (
              <img 
                src={featuredPost.image} 
                alt={featuredPost.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif italic">N&L Studio</div>
            )}
            <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-[var(--color-rose-600)] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
              Öne Çıkan Yazı
            </span>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 flex flex-col justify-between">
            <div>
              <span className="text-[var(--color-rose-600)] text-[10px] font-bold uppercase tracking-widest block mb-3">
                {featuredPost.categoryName}
              </span>
              <h2 className="text-2xl md:text-3xl font-serif italic font-bold text-gray-950 mb-4 group-hover:text-[var(--color-rose-700)] transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6">
                {featuredPost.excerpt}
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50">
              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                <span className="flex items-center gap-1.5">
                  <User size={12} /> {featuredPost.authorName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} /> {new Date(featuredPost.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <Link
                href={`/${locale}/blog/${featuredPost.categorySlug}/${featuredPost.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-950 hover:text-[var(--color-rose-700)] group/link transition-colors"
              >
                Devamını Oku <ChevronRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* POSTS GRID */}
      {gridPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gridPosts.map(post => (
            <div key={post.id} className="bg-white border border-[var(--color-rose-100)] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
              {/* Image */}
              <div className="h-48 relative overflow-hidden bg-gray-50">
                {post.image ? (
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif italic text-sm">N&L Studio</div>
                )}
                <span className="absolute top-4 left-4 px-3 py-1 bg-white/95 text-[10px] font-bold text-gray-800 uppercase tracking-wider rounded-full shadow-sm">
                  {post.categoryName}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif italic font-bold text-base text-gray-950 mb-3 group-hover:text-[var(--color-rose-700)] transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-[11px] leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400">
                    <span className="flex items-center gap-1">
                      <User size={10} /> {post.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> {new Date(post.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <Link
                    href={`/${locale}/blog/${post.categorySlug}/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-950 hover:text-[var(--color-rose-700)] group/link transition-colors"
                  >
                    Devamını Oku <ChevronRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl text-gray-400 text-sm">
          Arama kriterlerine veya filtreye uygun blog makalesi bulunamadı.
        </div>
      )}

    </div>
  );
}
