"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { createPackage, updatePackage, deletePackage } from '@/app/actions/package';
import { Language } from '@prisma/client';
import { Plus, Search, Settings, CheckCircle, AlertCircle, X, Trash2, Info, Layers, Minus } from 'lucide-react';

interface PackageServiceItem {
  serviceId: string;
  quantity: number;
  name: string;
  price: number;
}

interface PackageTranslation {
  id: string;
  language: Language;
  slug: string;
  name: string;
  description: string;
  seoTitle: string | null;
  seoDesc: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDesc: string | null;
  ogImage: string | null;
  index: boolean;
  sitemap: boolean;
}

interface PackageItem {
  id: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  translations: PackageTranslation[];
  services: PackageServiceItem[];
}

interface AvailableServiceItem {
  id: string;
  name: string;
  price: number;
}

interface PackagesClientProps {
  initialPackages: PackageItem[];
  availableServices: AvailableServiceItem[];
}

export default function PackagesClient({ initialPackages, availableServices }: PackagesClientProps) {
  const _params = useParams();
  const locale = 'tr';
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal durumları
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
  
  // Form inputları
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('TR');
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  
  // Seçilen paket içi hizmetler
  const [selectedServices, setSelectedServices] = useState<{ serviceId: string; quantity: number }[]>([]);

  // SEO Inputları
  const [seoTitle, setSeoTitle] = useState<string>('');
  const [seoDesc, setSeoDesc] = useState<string>('');
  const [canonical, setCanonical] = useState<string>('');
  const [ogTitle, setOgTitle] = useState<string>('');
  const [ogDesc, setOgDesc] = useState<string>('');
  const [ogImage, setOgImage] = useState<string>('');
  const [index, setIndex] = useState<boolean>(true);
  const [sitemap, setSitemap] = useState<boolean>(true);

  // Tab yönetimi
  const [formTab, setFormTab] = useState<'content' | 'seo'>('content');

  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingPackage(null);
    setSelectedLanguage('TR');
    setName('');
    setSlug('');
    setDescription('');
    setPrice('');
    setIsActive(true);
    setSelectedServices([]);
    resetSeoFields();
    setFormTab('content');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: PackageItem, lang: Language) => {
    setEditingPackage(pkg);
    setSelectedLanguage(lang);
    
    // Seçili dilde çeviri var mı kontrol et
    const translation = pkg.translations.find(t => t.language === lang);

    if (translation) {
      setName(translation.name);
      setSlug(translation.slug);
      setDescription(translation.description);
      setSeoTitle(translation.seoTitle || '');
      setSeoDesc(translation.seoDesc || '');
      setCanonical(translation.canonical || '');
      setOgTitle(translation.ogTitle || '');
      setOgDesc(translation.ogDesc || '');
      setOgImage(translation.ogImage || '');
      setIndex(translation.index);
      setSitemap(translation.sitemap);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      resetSeoFields();
    }
    
    setPrice(pkg.price.toString());
    setIsActive(pkg.isActive);
    setSelectedServices(pkg.services.map(s => ({ serviceId: s.serviceId, quantity: s.quantity })));
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
    if (!editingPackage) {
      setSelectedLanguage(newLang);
      return;
    }

    setSelectedLanguage(newLang);
    const translation = editingPackage.translations.find(t => t.language === newLang);
    if (translation) {
      setName(translation.name);
      setSlug(translation.slug);
      setDescription(translation.description);
      setSeoTitle(translation.seoTitle || '');
      setSeoDesc(translation.seoDesc || '');
      setCanonical(translation.canonical || '');
      setOgTitle(translation.ogTitle || '');
      setOgDesc(translation.ogDesc || '');
      setOgImage(translation.ogImage || '');
      setIndex(translation.index);
      setSitemap(translation.sitemap);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      resetSeoFields();
    }
  };

  const handleAddServiceToPackage = (serviceId: string) => {
    if (!serviceId) return;
    
    setSelectedServices(prev => {
      const exists = prev.find(s => s.serviceId === serviceId);
      if (exists) {
        return prev.map(s => s.serviceId === serviceId ? { ...s, quantity: s.quantity + 1 } : s);
      }
      return [...prev, { serviceId, quantity: 1 }];
    });
  };

  const handleRemoveServiceFromPackage = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.serviceId !== serviceId));
  };

  const handleQuantityChange = (serviceId: string, delta: number) => {
    setSelectedServices(prev => prev.map(s => {
      if (s.serviceId === serviceId) {
        const newQty = s.quantity + delta;
        return { ...s, quantity: newQty < 1 ? 1 : newQty };
      }
      return s;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      showFeedback('error', 'Lütfen pakete en az bir hizmet ekleyin.');
      return;
    }

    setFormLoading(true);

    const formData = new FormData();
    formData.append('price', price);
    formData.append('isActive', isActive.toString());
    formData.append('language', selectedLanguage);
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('seoTitle', seoTitle);
    formData.append('seoDesc', seoDesc);
    formData.append('canonical', canonical);
    formData.append('ogTitle', ogTitle);
    formData.append('ogDesc', ogDesc);
    formData.append('ogImage', ogImage);
    formData.append('index', index.toString());
    formData.append('sitemap', sitemap.toString());

    let result;
    if (editingPackage) {
      const translation = editingPackage.translations.find(t => t.language === selectedLanguage);
      result = await updatePackage(editingPackage.id, translation?.id || null, formData, selectedServices);
    } else {
      result = await createPackage(formData, selectedServices);
    }

    setFormLoading(false);

    if (result.success) {
      window.location.reload();
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu paketi pasifleştirmek (soft delete) istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deletePackage(id);
    setLoadingId(null);

    if (result.success) {
      setPackages(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p));
      showFeedback('success', 'Paket pasifleştirildi.');
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const filteredPackages = packages.filter(p => 
    p.translations.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Toplam Hizmet Değerini Hesapla
  const calculateTotalOriginalValue = () => {
    return selectedServices.reduce((sum, item) => {
      const service = availableServices.find(s => s.id === item.serviceId);
      return sum + (service ? service.price * item.quantity : 0);
    }, 0);
  };

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
            placeholder="Paket ismi veya slug ile ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
          />
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Yeni Paket Ekle
        </button>
      </div>

      {/* Paketler Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPackages.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center col-span-full">
            <Layers className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Kayıtlı kampanya paketi bulunamadı.</p>
          </div>
        ) : (
          filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {pkg.translations.find(t => t.language === 'TR')?.name || pkg.translations[0]?.name || 'Başlıksız Paket'}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">/{locale}/booking (Paket)</p>
                  </div>
                  <span className="text-xl font-bold text-[var(--color-rose-700)] font-serif whitespace-nowrap bg-rose-50 border border-rose-100 px-3 py-1 rounded-xl">
                    {pkg.price} TL
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2">
                  {pkg.translations.find(t => t.language === 'TR')?.description || pkg.translations[0]?.description || 'Açıklama girilmemiş.'}
                </p>

                {/* Paket İçi Hizmetler */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Paket İçeriği</span>
                  <div className="divide-y divide-gray-100">
                    {pkg.services.map((s) => (
                      <div key={s.serviceId} className="flex justify-between text-xs py-1.5 font-medium">
                        <span className="text-gray-700">{s.name} x {s.quantity}</span>
                        <span className="text-gray-400">{s.price * s.quantity} TL</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Çeviri Dilleri */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Dil Çevirileri</span>
                  <div className="flex flex-wrap gap-1">
                    {['TR', 'EN', 'RU', 'DE'].map((lang) => {
                      const t = pkg.translations.find(tr => tr.language === lang);
                      return t ? (
                        <button
                          key={lang}
                          onClick={() => handleOpenEditModal(pkg, lang as Language)}
                          className="text-[10px] font-bold bg-rose-50 border border-rose-100 text-[var(--color-rose-700)] px-2 py-0.5 rounded hover:bg-rose-100 transition-colors"
                        >
                          {lang}
                        </button>
                      ) : (
                        <button
                          key={lang}
                          onClick={() => handleOpenEditModal(pkg, lang as Language)}
                          className="text-[10px] font-semibold border border-dashed border-gray-200 text-gray-400 px-2 py-0.5 rounded hover:border-rose-300 hover:text-[var(--color-rose-600)] transition-colors"
                        >
                          + {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Alt İşlemler */}
              <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  pkg.isActive
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {pkg.isActive ? 'Aktif' : 'Pasif'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(pkg, 'TR')}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs transition-colors"
                  >
                    <Settings size={14} />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    disabled={loadingId === pkg.id}
                    className="p-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs transition-colors"
                    title="Pasifleştir (Soft Delete)"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingPackage ? 'Hizmet Paketini Düzenle' : 'Yeni Hizmet Paketi Oluştur'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Çok dilli kampanya paketi ve dahil edilecek hizmetleri girin.</p>
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
                İçerik & Hizmetler
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
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Çeviri Dili</label>
                    <div className="flex gap-2">
                      {['TR', 'EN', 'RU', 'DE'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageChangeInForm(lang as Language)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            selectedLanguage === lang
                              ? 'bg-[var(--color-rose-600)] text-white border-[var(--color-rose-600)]'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Paket Adı */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Paket Adı</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn: Gelin Bakım Paketi"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Rota / Slug</label>
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-400 font-mono">/packages/</span>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="gelin-bakim-paketi"
                        className="flex-1 bg-transparent text-sm focus:outline-none font-mono text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Açıklama */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Paket Açıklaması</label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Bu pakette hangi işlemlerin yapıldığını, detaylarını açıklayın..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white h-20 resize-none"
                    />
                  </div>

                  {/* DİNAMİK HİZMET EKLEME ALANI */}
                  <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-3">
                    <span className="text-xs font-bold text-gray-600 block">Dahil Edilen Hizmetler</span>
                    
                    {/* Hizmet Seçim Açılır Kutusu */}
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => {
                          handleAddServiceToPackage(e.target.value);
                          e.target.value = ""; // Seçtikten sonra sıfırla
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                      >
                        <option value="">-- Pakete Hizmet Ekle --</option>
                        {availableServices.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.price} TL)</option>
                        ))}
                      </select>
                    </div>

                    {/* Seçilen Hizmetlerin Listesi */}
                    {selectedServices.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Henüz hizmet eklenmedi.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {selectedServices.map((item) => {
                          const service = availableServices.find(s => s.id === item.serviceId);
                          if (!service) return null;
                          return (
                            <div key={item.serviceId} className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm text-xs">
                              <span className="font-semibold text-gray-700">{service.name}</span>
                              <div className="flex items-center gap-3">
                                {/* Adet Kontrolleri */}
                                <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleQuantityChange(item.serviceId, -1)}
                                    className="p-1 hover:bg-gray-50 rounded text-gray-500"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="w-6 text-center font-bold">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuantityChange(item.serviceId, 1)}
                                    className="p-1 hover:bg-gray-50 rounded text-gray-500"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveServiceFromPackage(item.serviceId)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                   Kaldır
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Hizmetlerin Toplam Değeri Raporu */}
                    {selectedServices.length > 0 && (
                      <div className="text-right text-xs text-gray-500 font-medium pt-2 border-t border-gray-200">
                        Hizmetlerin Ayrı Ayrı Toplamı: <span className="font-bold text-gray-800">{calculateTotalOriginalValue()} TL</span>
                      </div>
                    )}
                  </div>

                  {/* Paket Kampanyalı Satış Fiyatı */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Paket Satış Fiyatı (TL)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Fiyat girin (örn: 1250)"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                    />
                  </div>

                  {/* Aktiflik Durumu */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                    />
                    <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Paket Aktif / Satışta Olsun</label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2.5 items-start">
                    <Info className="text-blue-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-blue-800 leading-normal">
                      Arama motorları (Google) ve paylaşımlarda görünecek özel başlık, canonical ve sosyal medya resim ayarları.
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
                        placeholder="Örn: Gelin Bakım Paketi Fiyatları | NL Studio"
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
                        placeholder="Örn: https://studionl.com/tr/packages/gelin-bakim-paketi"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* SEO Description */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">SEO Açıklaması</label>
                    <textarea
                      value={seoDesc}
                      onChange={(e) => setSeoDesc(e.target.value)}
                      placeholder="Google arama sonuçlarındaki snippet..."
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
                          placeholder="Örn: /uploads/og-package.jpg"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 shrink-0">
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
                  className="bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Kaydediliyor...' : editingPackage ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
