"use client";

import { useState } from 'react';
import { createLandingPage, updateLandingPage, deleteLandingPage } from '@/app/actions/landing-page';
import { Language } from '@prisma/client';
import { Plus, Search, Globe, Settings, CheckCircle, AlertCircle, X, Edit, Trash2, Info } from 'lucide-react';

interface PageTranslation {
  id: string;
  language: Language;
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

interface LandingPageItem {
  id: string;
  isActive: boolean;
  createdAt: string;
  translations: PageTranslation[];
}

interface LandingPagesClientProps {
  initialPages: LandingPageItem[];
  currentLocale: string;
}

export default function LandingPagesClient({ initialPages, currentLocale: _currentLocale }: LandingPagesClientProps) {
  const [pages, setPages] = useState<LandingPageItem[]>(initialPages);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal durumları
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPage, setEditingPage] = useState<LandingPageItem | null>(null);
  
  // Form inputları
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('TR');
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  // SEO Inputları
  const [seoTitle, setSeoTitle] = useState<string>('');
  const [seoDesc, setSeoDesc] = useState<string>('');
  const [canonical, setCanonical] = useState<string>('');
  const [ogTitle, setOgTitle] = useState<string>('');
  const [ogDesc, setOgDesc] = useState<string>('');
  const [ogImage, setOgImage] = useState<string>('');
  const [index, setIndex] = useState<boolean>(true);
  const [sitemap, setSitemap] = useState<boolean>(true);

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
    setEditingPage(null);
    setSelectedLanguage('TR');
    setTitle('');
    setSlug('');
    setContent('');
    setIsActive(true);
    resetSeoFields();
    setFormTab('content');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (page: LandingPageItem, lang: Language) => {
    setEditingPage(page);
    setSelectedLanguage(lang);
    
    // Seçili dilde çeviri var mı kontrol et
    const translation = page.translations.find(t => t.language === lang);

    if (translation) {
      setTitle(translation.title);
      setSlug(translation.slug);
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
      setContent('');
      resetSeoFields();
    }
    
    setIsActive(page.isActive);
    setFormTab('content');
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
    if (!editingPage) {
      setSelectedLanguage(newLang);
      return;
    }

    // Düzenleme modunda dil değişirse o dile ait çeviri var mı bak, varsa yükle yoksa temizle
    setSelectedLanguage(newLang);
    const translation = editingPage.translations.find(t => t.language === newLang);
    if (translation) {
      setTitle(translation.title);
      setSlug(translation.slug);
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
      setContent('');
      resetSeoFields();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData();
    formData.append('isActive', isActive.toString());
    formData.append('language', selectedLanguage);
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('content', content);
    formData.append('seoTitle', seoTitle);
    formData.append('seoDesc', seoDesc);
    formData.append('canonical', canonical);
    formData.append('ogTitle', ogTitle);
    formData.append('ogDesc', ogDesc);
    formData.append('ogImage', ogImage);
    formData.append('index', index.toString());
    formData.append('sitemap', sitemap.toString());

    let result;
    if (editingPage) {
      const translation = editingPage.translations.find(t => t.language === selectedLanguage);
      result = await updateLandingPage(editingPage.id, translation?.id || null, formData);
    } else {
      result = await createLandingPage(formData);
    }

    setFormLoading(false);

    if (result.success) {
      // Sayfayı yenilemek en temizi çünkü ilişkisel veri güncelleniyor.
      // Veya state'i güncelleyebiliriz:
      window.location.reload();
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu SEO sayfasını pasifleştirmek (soft delete) istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deleteLandingPage(id);
    setLoadingId(null);

    if (result.success) {
      setPages(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p));
      showFeedback('success', 'Sayfa pasifleştirildi (soft delete).');
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const filteredPages = pages.filter(page => 
    page.translations.some(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.slug.toLowerCase().includes(searchTerm.toLowerCase()))
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
          Yeni SEO Sayfası Ekle
        </button>
      </div>

      {/* Sayfa Kartları Listesi */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPages.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <Globe className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">SEO sayfası bulunamadı.</p>
          </div>
        ) : (
          filteredPages.map((page) => (
            <div key={page.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              {/* Sol Taraf: Sayfa Detayları ve Diller */}
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {page.translations.find(t => t.language === 'TR')?.title || page.translations[0]?.title || 'Başlıksız'}
                  </h3>
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    page.isActive
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {page.isActive ? 'Yayında' : 'Taslak / Pasif'}
                  </span>
                </div>

                {/* Diller ve Slug'ları */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aktif Dil Çevirileri & Rotalar</p>
                  <div className="flex flex-wrap gap-2">
                    {['TR', 'EN', 'RU', 'DE'].map((lang) => {
                      const t = page.translations.find(tr => tr.language === lang);
                      return t ? (
                        <div key={lang} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3">
                          <span className="font-bold text-xs text-[var(--color-rose-600)]">{lang}</span>
                          <span className="text-xs text-gray-500 font-mono font-medium">/{lang.toLowerCase()}/{t.slug}</span>
                          <button
                            onClick={() => handleOpenEditModal(page, lang as Language)}
                            className="text-[var(--color-rose-600)] hover:text-[var(--color-rose-800)]"
                            title="Çeviriyi Düzenle"
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          key={lang}
                          onClick={() => handleOpenEditModal(page, lang as Language)}
                          className="flex items-center gap-1 border border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50 text-gray-400 hover:text-[var(--color-rose-600)] rounded-lg py-1.5 px-3 text-xs font-medium transition-all"
                        >
                          <Plus size={12} />
                          {lang} Ekle
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sağ Taraf: Yönetici Butonları */}
              <div className="flex gap-2 w-full md:w-auto md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0 justify-end">
                <button
                  onClick={() => handleOpenEditModal(page, 'TR')}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  <Settings size={16} />
                  Sayfayı Düzenle
                </button>
                <button
                  onClick={() => handleDelete(page.id)}
                  disabled={loadingId === page.id}
                  className="flex items-center justify-center p-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm transition-colors"
                  title="Sayfayı Pasifleştir (Soft Delete)"
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
                  {editingPage ? 'SEO Sayfasını Düzenle' : 'Yeni SEO Sayfası Ekle'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Slug ve Dil bazlı benzersiz sayfa tanımlaması yapın.</p>
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
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Sayfa Başlığı</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Antalya En İyi Protez Tırnak Salonu"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Sayfa Rota/Slug (Küçük harf & Benzersiz)</label>
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-400 font-mono">/{selectedLanguage.toLowerCase()}/</span>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="protez-tirnak-antalya"
                        className="flex-1 bg-transparent text-sm focus:outline-none font-mono text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Zengin Metin İçerik */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Sayfa İçeriği (HTML/Text)</label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Sayfa HTML içeriğini buraya girin..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white min-h-[180px] font-mono"
                    />
                  </div>

                  {/* Durum */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                    />
                    <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Sayfa Aktif / Yayında Olsun</label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2.5 items-start">
                    <Info className="text-blue-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-blue-800 leading-normal">
                      Aşağıdaki alanlar Google, Yandex ve sosyal medya platformları (Facebook, WhatsApp vb.) paylaşımları için özelleştirilmiş meta etiketlerini kontrol eder. Boş bırakırsanız varsayılan site ayarları geçerli olur.
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
                        placeholder="Örn: Protez Tırnak Antalya | 2026 Fiyatları ve Randevu"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                      />
                    </div>

                    {/* Canonical URL */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Canonical URL (Özgün URL)</label>
                      <input
                        type="url"
                        value={canonical}
                        onChange={(e) => setCanonical(e.target.value)}
                        placeholder="Örn: https://studionl.com/tr/protez-tirnak-antalya"
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
                      placeholder="Arama sonuçlarında başlığın altında görünecek açıklama metni..."
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
                          placeholder="Görsel URL (/uploads/image.jpg)"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Sosyal Paylaşım Açıklaması</label>
                      <textarea
                        value={ogDesc}
                        onChange={(e) => setOgDesc(e.target.value)}
                        placeholder="Paylaşıldığında görünecek açıklama..."
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
                  {formLoading ? 'Kaydediliyor...' : editingPage ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
