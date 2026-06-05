"use client";

import { useState } from 'react';
import { createBlogPost, updateBlogPost, deleteBlogPost } from '@/app/actions/blog';
import { Language } from '@prisma/client';
import { 
  Plus, 
  Search, 
  Globe, 
  FileText, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  X,
  Edit,
  Trash2,
  Check,
  Eye,
  Info,
  Calendar,
  User,
  Image as ImageIcon
} from 'lucide-react';

interface PostTranslation {
  id: string;
  language: Language;
  slug: string;
  title: string;
  excerpt: string | null;
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

interface BlogPostItem {
  id: string;
  image: string | null;
  authorName: string | null;
  isActive: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  translations: PostTranslation[];
  categoryIds: string[];
  tagIds: string[];
}

interface BlogCategoryOption {
  id: string;
  name: string;
}

interface BlogTagOption {
  id: string;
  name: string;
}

interface BlogClientProps {
  initialPosts: BlogPostItem[];
  currentLocale: string;
  categories: BlogCategoryOption[];
  tags: BlogTagOption[];
}

export default function BlogClient({ initialPosts, currentLocale, categories, tags }: BlogClientProps) {
  const [posts, setPosts] = useState<BlogPostItem[]>(initialPosts);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal durumları
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null);
  
  // Form inputları
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('TR');
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [excerpt, setExcerpt] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [image, setImage] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('N&L Studio');
  const [publishedAt, setPublishedAt] = useState<string>('');

  // SEO Inputları
  const [seoTitle, setSeoTitle] = useState<string>('');
  const [seoDesc, setSeoDesc] = useState<string>('');
  const [canonical, setCanonical] = useState<string>('');
  const [ogTitle, setOgTitle] = useState<string>('');
  const [ogDesc, setOgDesc] = useState<string>('');
  const [ogImage, setOgImage] = useState<string>('');
  const [index, setIndex] = useState<boolean>(true);
  const [sitemap, setSitemap] = useState<boolean>(true);

  // Kategori ve Etiket seçimleri
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Tab yönetimi (Genel vs SEO alanları)
  const [formTab, setFormTab] = useState<'content' | 'seo'>('content');

  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setSelectedLanguage('TR');
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setIsActive(true);
    setIsFeatured(false);
    setImage('');
    setAuthorName('N&L Studio');
    const today = new Date().toISOString().split('T')[0];
    setPublishedAt(today);
    resetSeoFields();
    setFormTab('content');
    setSelectedCategoryIds([]);
    setSelectedTagIds([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: BlogPostItem, lang: Language) => {
    setEditingPost(post);
    setSelectedLanguage(lang);
    
    // Seçili dilde çeviri var mı kontrol et
    const translation = post.translations.find(t => t.language === lang);

    if (translation) {
      setTitle(translation.title);
      setSlug(translation.slug);
      setExcerpt(translation.excerpt || '');
      setContent(translation.content);
      setSeoTitle(translation.seoTitle || '');
      setSeoDesc(translation.seoDesc || '');
      setCanonical(translation.canonical || '');
      setOgTitle(translation.ogTitle || '');
      setOgDesc(translation.ogDesc || '');
      setOgImage(translation.ogImage || '');
      setIndex(translation.index);
      setSitemap(translation.sitemap);
    } else {
      // Çeviri yoksa yeni çeviri ekleme moduna geç
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      resetSeoFields();
    }
    
    setIsActive(post.isActive);
    setIsFeatured(post.isFeatured);
    setImage(post.image || '');
    setAuthorName(post.authorName || 'N&L Studio');
    setPublishedAt(post.publishedAt || '');
    setFormTab('content');
    setSelectedCategoryIds(post.categoryIds || []);
    setSelectedTagIds(post.tagIds || []);
    setIsModalOpen(true);
  };

  const resetSeoFields = () => {
    setSeoTitle('');
    setSeoDesc('');
    setCanonical('');
    setOgTitle('');
    setOgDesc('');
    setOgImage('');
    setIndex(true);
    setSitemap(true);
  };

  const handleLanguageChangeInForm = (newLang: Language) => {
    if (!editingPost) {
      setSelectedLanguage(newLang);
      return;
    }

    // Düzenleme modunda dil değişirse o dile ait çeviri var mı bak, varsa yükle yoksa temizle
    setSelectedLanguage(newLang);
    const translation = editingPost.translations.find(t => t.language === newLang);
    if (translation) {
      setTitle(translation.title);
      setSlug(translation.slug);
      setExcerpt(translation.excerpt || '');
      setContent(translation.content);
      setSeoTitle(translation.seoTitle || '');
      setSeoDesc(translation.seoDesc || '');
      setCanonical(translation.canonical || '');
      setOgTitle(translation.ogTitle || '');
      setOgDesc(translation.ogDesc || '');
      setOgImage(translation.ogImage || '');
      setIndex(translation.index);
      setSitemap(translation.sitemap);
    } else {
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      resetSeoFields();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData();
    formData.append('isActive', isActive.toString());
    formData.append('isFeatured', isFeatured.toString());
    formData.append('image', image);
    formData.append('authorName', authorName);
    formData.append('publishedAt', publishedAt);
    formData.append('language', selectedLanguage);
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    formData.append('seoTitle', seoTitle);
    formData.append('seoDesc', seoDesc);
    formData.append('canonical', canonical);
    formData.append('ogTitle', ogTitle);
    formData.append('ogDesc', ogDesc);
    formData.append('ogImage', ogImage);
    formData.append('index', index.toString());
    formData.append('sitemap', sitemap.toString());
    formData.append('categoryIds', JSON.stringify(selectedCategoryIds));
    formData.append('tagIds', JSON.stringify(selectedTagIds));

    let result;
    if (editingPost) {
      const translation = editingPost.translations.find(t => t.language === selectedLanguage);
      result = await updateBlogPost(editingPost.id, translation?.id || null, formData);
    } else {
      result = await createBlogPost(formData);
    }

    setFormLoading(false);

    if (result.success) {
      window.location.reload();
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu blog yazısını pasifleştirmek (soft delete) istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deleteBlogPost(id);
    setLoadingId(null);

    if (result.success) {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p));
      showFeedback('success', 'Blog yazısı pasifleştirildi.');
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const filteredPosts = posts.filter(post => 
    post.translations.some(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Feedback Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Üst İşlem Çubuğu */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Başlık veya slug ile ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
          />
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Yeni Blog Yazısı Ekle
        </button>
      </div>

      {/* Blog Yazıları Kartları */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Kayıtlı blog yazısı bulunamadı.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
              {/* Sol Taraf: Görsel & Bilgiler */}
              <div className="flex flex-col sm:flex-row gap-6 flex-1 w-full">
                {/* Kapak Resmi */}
                <div className="w-full sm:w-40 h-28 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0 relative flex items-center justify-center">
                  {post.image ? (
                    <img src={post.image} alt="Kapak" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-300" size={32} />
                  )}
                  {post.isFeatured && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      Öne Çıkan
                    </span>
                  )}
                </div>

                {/* Detaylar */}
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {post.translations.find(t => t.language === 'TR')?.title || post.translations[0]?.title || 'Başlıksız'}
                    </h3>
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      post.isActive
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {post.isActive ? 'Yayında' : 'Taslak'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <User size={14} className="text-gray-400" />
                      {post.authorName || 'N&L Studio'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('tr-TR') : 'Yayın tarihi yok'}
                    </span>
                  </div>

                  {/* Diller ve Rotalar */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dil Çevirileri & Sluglar</p>
                    <div className="flex flex-wrap gap-2">
                      {['TR', 'EN', 'RU', 'DE'].map((lang) => {
                        const t = post.translations.find(tr => tr.language === lang);
                        return t ? (
                          <div key={lang} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg py-1 px-2.5">
                            <span className="font-bold text-xs text-[var(--color-rose-600)]">{lang}</span>
                            <span className="text-[11px] text-gray-500 font-mono font-medium">/{lang.toLowerCase()}/blog/{t.slug}</span>
                            <button
                              onClick={() => handleOpenEditModal(post, lang as Language)}
                              className="text-[var(--color-rose-600)] hover:text-[var(--color-rose-800)]"
                              title="Düzenle"
                            >
                              <Edit size={10} />
                            </button>
                          </div>
                        ) : (
                          <button
                            key={lang}
                            onClick={() => handleOpenEditModal(post, lang as Language)}
                            className="flex items-center gap-1 border border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50 text-gray-400 hover:text-[var(--color-rose-600)] rounded-lg py-1 px-2.5 text-xs font-semibold transition-all"
                          >
                            <Plus size={10} />
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ Taraf: Aksiyon Butonları */}
              <div className="flex gap-2 w-full md:w-auto md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0 justify-end shrink-0">
                <button
                  onClick={() => handleOpenEditModal(post, 'TR')}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  <Settings size={16} />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={loadingId === post.id}
                  className="flex items-center justify-center p-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm transition-colors"
                  title="Yazıyı Pasifleştir (Soft Delete)"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal - Ekleme / Düzenleme */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingPost ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı Oluştur'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Çok dilli blog makalesi ve SEO alanlarını girin.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50 px-6">
              <button
                type="button"
                onClick={() => setFormTab('content')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  formTab === 'content'
                    ? 'border-[var(--color-rose-600)] text-[var(--color-rose-700)]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                İçerik & Rota
              </button>
              <button
                type="button"
                onClick={() => setFormTab('seo')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  formTab === 'seo'
                    ? 'border-[var(--color-rose-600)] text-[var(--color-rose-700)]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Gelişmiş SEO & OG Meta
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formTab === 'content' ? (
                <div className="space-y-4">
                  {/* Dil Seçimi */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Düzenlenen Çeviri Dili</label>
                    <div className="flex gap-2">
                      {['TR', 'EN', 'RU', 'DE'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageChangeInForm(lang as Language)}
                          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                            selectedLanguage === lang
                              ? 'bg-[var(--color-rose-600)] text-white border-[var(--color-rose-600)] shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Başlık */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Makale Başlığı</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: 2026 Tırnak Modası ve Trendleri"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Sayfa Rota/Slug (Küçük harf & Benzersiz)</label>
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-400 font-mono">/{selectedLanguage.toLowerCase()}/blog/</span>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="2026-tirnak-modasi"
                        className="flex-1 bg-transparent text-sm focus:outline-none font-mono text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Görsel URL */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Görsel URL / Kapak Resmi</label>
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="/images/blog-cover.jpg veya /uploads/..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                      />
                    </div>

                    {/* Yazar Adı */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Yazar İsmi</label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="N&L Studio"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Yayınlanma Tarihi */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Yayın Tarihi</label>
                    <input
                      type="date"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                    />
                  </div>

                  {/* Özet / Excerpt */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kısa Özet / Giriş Paragrafı</label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Kart listesinde görünecek kısa açıklama..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white h-16 resize-none"
                    />
                  </div>

                  {/* Zengin Metin Makale İçeriği */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Makale İçeriği (HTML/Text)</label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Blog makale içeriğini buraya girin..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white min-h-[180px] font-mono"
                    />
                  </div>

                  {/* Kategori Seçimi */}
                  {categories.length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Kategoriler</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 p-3 rounded-xl bg-gray-50/50">
                        {categories.map((cat) => (
                          <label key={cat.id} className="flex items-center gap-2 text-xs text-gray-600 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategoryIds.includes(cat.id)}
                              onChange={() => {
                                if (selectedCategoryIds.includes(cat.id)) {
                                  setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== cat.id));
                                } else {
                                  setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                                }
                              }}
                              className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                            />
                            <span className="font-medium">{cat.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Etiket Seçimi */}
                  {tags.length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Etiketler</label>
                      <div className="flex flex-wrap gap-2 border border-gray-200 p-3 rounded-xl bg-gray-50/50 max-h-32 overflow-y-auto">
                        {tags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              if (selectedTagIds.includes(tag.id)) {
                                setSelectedTagIds(selectedTagIds.filter(id => id !== tag.id));
                              } else {
                                setSelectedTagIds([...selectedTagIds, tag.id]);
                              }
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                              selectedTagIds.includes(tag.id)
                                ? 'bg-[var(--color-rose-600)] text-white border-[var(--color-rose-600)]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--color-rose-300)] hover:bg-[var(--color-rose-50)]'
                            }`}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Durum & Öne Çıkar */}
                  <div className="flex gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                      />
                      <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Aktif / Yayında Olsun</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                      />
                      <label htmlFor="isFeatured" className="text-sm font-semibold text-gray-700 cursor-pointer">Öne Çıkarılan Yazı (Featured)</label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2.5 items-start">
                    <Info className="text-blue-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-blue-800 leading-normal">
                      Arama motorları (Google) ve sosyal mecralardaki makale paylaşımları için özelleştirilmiş başlık ve açıklamaları girin.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* SEO Title */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">SEO Başlığı (Title Tag)</label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Örn: 2026 Tırnak Modası | En Trend Nail Art Çeşitleri"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                      />
                    </div>

                    {/* Canonical URL */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Canonical URL</label>
                      <input
                        type="url"
                        value={canonical}
                        onChange={(e) => setCanonical(e.target.value)}
                        placeholder="Örn: https://studionl.com/tr/blog/2026-tirnak-modasi"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* SEO Description */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">SEO Açıklaması (Meta Description)</label>
                    <textarea
                      value={seoDesc}
                      onChange={(e) => setSeoDesc(e.target.value)}
                      placeholder="Google arama sonuçlarındaki snippet metni..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white h-20 resize-none"
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sosyal Medya (Open Graph) Ayarları</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* OG Title */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Sosyal Paylaşım Başlığı</label>
                        <input
                          type="text"
                          value={ogTitle}
                          onChange={(e) => setOgTitle(e.target.value)}
                          placeholder="Paylaşıldığında çıkacak başlık"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                        />
                      </div>

                      {/* OG Image */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Sosyal Paylaşım Görsel Linki (OG Image)</label>
                        <input
                          type="text"
                          value={ogImage}
                          onChange={(e) => setOgImage(e.target.value)}
                          placeholder="Örn: /uploads/og-blog-cover.jpg"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Sosyal Paylaşım Açıklaması</label>
                      <textarea
                        value={ogDesc}
                        onChange={(e) => setOgDesc(e.target.value)}
                        placeholder="Paylaşıldığında çıkacak açıklama..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white h-20 resize-none"
                      />
                    </div>
                  </div>

                  {/* Indexing ve Sitemap Checkbox'ları */}
                  <div className="border-t border-gray-100 pt-4 flex gap-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="index"
                        checked={index}
                        onChange={(e) => setIndex(e.target.checked)}
                        className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                      />
                      <label htmlFor="index" className="text-sm font-semibold text-gray-700 cursor-pointer">Arama Motorlarında İndekslensin (Index)</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="sitemap"
                        checked={sitemap}
                        onChange={(e) => setSitemap(e.target.checked)}
                        className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                      />
                      <label htmlFor="sitemap" className="text-sm font-semibold text-gray-700 cursor-pointer">Sitemap Dosyasına Eklensin</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {formLoading ? 'Kaydediliyor...' : editingPost ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
