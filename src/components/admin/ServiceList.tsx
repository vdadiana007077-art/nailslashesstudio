"use client";

import { useState } from 'react';
import { updateService } from '@/app/actions/admin';
import { Check, X, Globe, Sparkles } from 'lucide-react';

type ServiceTranslation = {
  id: string;
  language: 'TR' | 'EN' | 'DE' | 'RU';
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  seoTitle: string;
  seoDesc: string;
  canonical: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  index: boolean;
  sitemap: boolean;
};

type Service = {
  id: string;
  price: string;
  duration: number;
  image: string | null;
  isActive: boolean;
  faqIds: string[];
  blogIds: string[];
  translations: ServiceTranslation[];
};

type Category = {
  id: string;
  name: string;
  services: Service[];
};

type FaqItem = {
  id: string;
  question: string;
};

type BlogItem = {
  id: string;
  title: string;
};

interface ServiceListProps {
  categories: Category[];
  faqs: FaqItem[];
  blogPosts: BlogItem[];
}

export default function ServiceList({ categories, faqs, blogPosts }: ServiceListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeLang, setActiveLang] = useState<'TR' | 'EN' | 'DE' | 'RU'>('TR');
  const [loading, setLoading] = useState(false);

  // Form State'leri
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState(30);
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [canonical, setCanonical] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDesc, setOgDesc] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [index, setIndex] = useState(true);
  const [sitemap, setSitemap] = useState(true);

  // SSS ve Blog Seçimleri State'leri
  const [selectedFaqIds, setSelectedFaqIds] = useState<string[]>([]);
  const [selectedBlogIds, setSelectedBlogIds] = useState<string[]>([]);

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    const trans = service.translations.find((t) => t.language === activeLang);
    setName(trans?.name || '');
    setSlug(trans?.slug || '');
    setDescription(trans?.description || '');
    setLongDescription(trans?.longDescription || '');
    setPrice(service.price);
    setDuration(service.duration);
    setImage(service.image || '');
    setIsActive(service.isActive);

    setSeoTitle(trans?.seoTitle || '');
    setSeoDesc(trans?.seoDesc || '');
    setCanonical(trans?.canonical || '');
    setOgTitle(trans?.ogTitle || '');
    setOgDesc(trans?.ogDesc || '');
    setOgImage(trans?.ogImage || '');
    setIndex(trans ? trans.index : true);
    setSitemap(trans ? trans.sitemap : true);

    setSelectedFaqIds(service.faqIds);
    setSelectedBlogIds(service.blogIds);

    setIsModalOpen(true);
  };

  const handleLangChange = (lang: 'TR' | 'EN' | 'DE' | 'RU') => {
    setActiveLang(lang);
    if (!selectedService) return;

    const trans = selectedService.translations.find((t) => t.language === lang);
    setName(trans?.name || '');
    setSlug(trans?.slug || '');
    setDescription(trans?.description || '');
    setLongDescription(trans?.longDescription || '');
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

  const handleFaqToggle = (faqId: string) => {
    if (selectedFaqIds.includes(faqId)) {
      setSelectedFaqIds(selectedFaqIds.filter(id => id !== faqId));
    } else {
      setSelectedFaqIds([...selectedFaqIds, faqId]);
    }
  };

  const handleBlogToggle = (blogId: string) => {
    if (selectedBlogIds.includes(blogId)) {
      setSelectedBlogIds(selectedBlogIds.filter(id => id !== blogId));
    } else {
      setSelectedBlogIds([...selectedBlogIds, blogId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('language', activeLang);
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('longDescription', longDescription);
    formData.append('price', price);
    formData.append('duration', duration.toString());
    formData.append('image', image);
    formData.append('isActive', isActive ? 'true' : 'false');

    formData.append('seoTitle', seoTitle);
    formData.append('seoDesc', seoDesc);
    formData.append('canonical', canonical);
    formData.append('ogTitle', ogTitle);
    formData.append('ogDesc', ogDesc);
    formData.append('ogImage', ogImage);
    formData.append('index', index ? 'true' : 'false');
    formData.append('sitemap', sitemap ? 'true' : 'false');

    formData.append('faqIds', JSON.stringify(selectedFaqIds));
    formData.append('blogIds', JSON.stringify(selectedBlogIds));

    const trans = selectedService.translations.find((t) => t.language === activeLang);
    const res = await updateService(selectedService.id, trans?.id || null, formData);
    setLoading(false);

    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || 'Hizmet güncellenirken hata oluştu.');
    }
  };

  const getTRTranslation = (service: Service) => {
    return service.translations.find((t) => t.language === 'TR') || { name: 'İsimsiz Hizmet', slug: '', description: '' };
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">{category.name}</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/20 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="p-4 pl-6 w-10 font-medium">Durum</th>
                    <th className="p-4 font-medium">Hizmet Adı (TR)</th>
                    <th className="p-4 font-medium w-32">Fiyat (₺)</th>
                    <th className="p-4 font-medium w-32">Süre (dk)</th>
                    <th className="p-4 font-medium text-right pr-6">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {category.services.map((service) => {
                    const tr = getTRTranslation(service);
                    return (
                      <tr key={service.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                        <td className="p-4 pl-6">
                          {service.isActive ? (
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
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">/{tr.slug}</p>
                        </td>
                        <td className="p-4 font-bold text-[var(--color-primary-600)]">
                          ₺{parseFloat(service.price).toLocaleString('tr-TR')}
                        </td>
                        <td className="p-4 font-semibold text-gray-500">
                          {service.duration} dk
                        </td>
                        <td className="p-4 text-right pr-6">
                          <button
                            onClick={() => openEditModal(service)}
                            className="text-xs font-bold text-[var(--color-rose-600)] hover:underline cursor-pointer"
                          >
                            Detayları Düzenle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* HİZMET DETAY DÜZENLEME MODALI */}
      {isModalOpen && selectedService && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
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
              Hizmet Detaylarını Düzenle
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
              
              {/* Genel Fiyat, Süre ve Görsel Alanları */}
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Fiyat (₺) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Süre (Dakika) *</label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Görsel URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="/uploads/hizmet.png"
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
                    Hizmet Aktif
                  </label>
                </div>
              </div>

              {/* Dil Bazlı Alanlar */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hizmet Adı ({activeLang}) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Hizmet Adı"
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
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kısa Açıklama ({activeLang})</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Uzun Açıklama / Detaylar ({activeLang})</label>
                  <textarea
                    value={longDescription}
                    onChange={(e) => setLongDescription(e.target.value)}
                    rows={4}
                    placeholder="Hizmetin tüm detayları, nasıl uygulandığı vb..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs"
                  />
                </div>
              </div>

              {/* SSS (FAQ) VE BLOG İLİŞKİLERİ */}
              <div className="pt-4 border-t border-gray-150 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SSS Bağlantısı */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">İlgili Sıkça Sorulan Sorular</h4>
                  {faqs.length === 0 ? (
                    <p className="text-[10px] text-gray-400">Kayıtlı SSS bulunmuyor.</p>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto border border-gray-100 p-3 rounded-xl bg-gray-50/50">
                      {faqs.map((faq) => (
                        <label key={faq.id} className="flex items-start gap-2 text-xs text-gray-600 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFaqIds.includes(faq.id)}
                            onChange={() => handleFaqToggle(faq.id)}
                            className="rounded border-gray-300 text-[var(--color-primary-500)] mt-0.5"
                          />
                          <span>{faq.question}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* İlgili Blog Yazıları */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">İlgili Blog Yazıları</h4>
                  {blogPosts.length === 0 ? (
                    <p className="text-[10px] text-gray-400">Kayıtlı blog yazısı bulunmuyor.</p>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto border border-gray-100 p-3 rounded-xl bg-gray-50/50">
                      {blogPosts.map((blog) => (
                        <label key={blog.id} className="flex items-start gap-2 text-xs text-gray-600 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBlogIds.includes(blog.id)}
                            onChange={() => handleBlogToggle(blog.id)}
                            className="rounded border-gray-300 text-[var(--color-primary-500)] mt-0.5"
                          />
                          <span>{blog.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Alanları */}
              <div className="pt-4 border-t border-gray-150 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">SEO Yapılandırması</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Başlığı</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Google Arama Başlığı"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Canonical Link</label>
                    <input
                      type="text"
                      value={canonical}
                      onChange={(e) => setCanonical(e.target.value)}
                      placeholder="https://site.com/tr/hizmetler/slug"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Açıklaması</label>
                  <textarea
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    rows={2}
                    placeholder="Maksimum 160 karakter"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Paylaşım Başlığı (OG Title)</label>
                    <input
                      type="text"
                      value={ogTitle}
                      onChange={(e) => setOgTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Paylaşım Görseli (OG Image)</label>
                    <input
                      type="text"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="/images/og-hizmet.png"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Paylaşım Açıklaması (OG Desc)</label>
                  <textarea
                    value={ogDesc}
                    onChange={(e) => setOgDesc(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none"
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
