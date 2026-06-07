"use client";

import Image from 'next/image';
import { useState } from 'react';
import { createPortfolioItem, updatePortfolioItem, deletePortfolioItem } from '@/app/actions/portfolio';
import { Language } from '@prisma/client';
import { 
  Plus, 
  Search, 
  Globe, 
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
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';

interface ItemTranslation {
  id: string;
  language: Language;
  title: string;
  description: string | null;
}

interface PortfolioItem {
  id: string;
  beforeImage: string;
  afterImage: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  translations: ItemTranslation[];
}

interface PortfolioClientProps {
  initialItems: PortfolioItem[];
}

export default function PortfolioClient({ initialItems }: PortfolioClientProps) {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal durumları
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  
  // Form inputları
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('TR');
  const [beforeImage, setBeforeImage] = useState<string>('');
  const [afterImage, setAfterImage] = useState<string>('');
  const [category, setCategory] = useState<string>('Tırnak');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [order, setOrder] = useState<string>('0');
  
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setSelectedLanguage('TR');
    setBeforeImage('');
    setAfterImage('');
    setCategory('Tırnak');
    setIsFeatured(false);
    setIsActive(true);
    setOrder('0');
    setTitle('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PortfolioItem, lang: Language) => {
    setEditingItem(item);
    setSelectedLanguage(lang);
    
    // Seçili dilde çeviri var mı kontrol et
    const translation = item.translations.find(t => t.language === lang);

    if (translation) {
      setTitle(translation.title);
      setDescription(translation.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
    
    setBeforeImage(item.beforeImage);
    setAfterImage(item.afterImage);
    setCategory(item.category);
    setIsFeatured(item.isFeatured);
    setIsActive(item.isActive);
    setOrder(item.order.toString());
    setIsModalOpen(true);
  };

  const handleLanguageChangeInForm = (newLang: Language) => {
    if (!editingItem) {
      setSelectedLanguage(newLang);
      return;
    }

    setSelectedLanguage(newLang);
    const translation = editingItem.translations.find(t => t.language === newLang);
    if (translation) {
      setTitle(translation.title);
      setDescription(translation.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData();
    formData.append('beforeImage', beforeImage);
    formData.append('afterImage', afterImage);
    formData.append('category', category);
    formData.append('isFeatured', isFeatured.toString());
    formData.append('isActive', isActive.toString());
    formData.append('order', order);
    formData.append('language', selectedLanguage);
    formData.append('title', title);
    formData.append('description', description);

    let result;
    if (editingItem) {
      const translation = editingItem.translations.find(t => t.language === selectedLanguage);
      result = await updatePortfolioItem(editingItem.id, translation?.id || null, formData);
    } else {
      result = await createPortfolioItem(formData);
    }

    setFormLoading(false);

    if (result.success) {
      window.location.reload();
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu çalışmayı pasifleştirmek (soft delete) istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deletePortfolioItem(id);
    setLoadingId(null);

    if (result.success) {
      setItems(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p));
      showFeedback('success', 'Çalışma pasifleştirildi.');
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const filteredItems = items.filter(item => 
    item.translations.some(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Başlık veya kategori ile ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
          />
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Yeni Çalışma Ekle
        </button>
      </div>

      {/* Portföy Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center col-span-full">
            <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Kayıtlı portföy öğesi bulunamadı.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between">
              {/* Resimler (Before / After Karşılaştırmalı yan yana) */}
              <div className="grid grid-cols-2 h-40 bg-gray-50 border-b border-gray-100 relative">
                <div className="relative overflow-hidden h-full">
                  <Image width={800} height={800} src={item.beforeImage} alt="Öncesi" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Öncesi
                  </span>
                </div>
                <div className="relative overflow-hidden h-full border-l border-white">
                  <Image width={800} height={800} src={item.afterImage} alt="Sonrası" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 bg-[var(--color-rose-600)]/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Sonrası
                  </span>
                </div>
                {item.isFeatured && (
                  <span className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                    Öne Çıkan
                  </span>
                )}
              </div>

              {/* Detaylar */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 line-clamp-1">
                      {item.translations.find(t => t.language === 'TR')?.title || item.translations[0]?.title || 'Başlıksız'}
                    </h3>
                    <span className="text-[10px] bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {item.translations.find(t => t.language === 'TR')?.description || item.translations[0]?.description || 'Açıklama girilmemiş.'}
                  </p>
                </div>

                {/* Diller ve Rotalar */}
                <div className="space-y-2 border-t border-gray-50 pt-3">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>Çeviriler</span>
                    <span>Sıra: {item.order}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['TR', 'EN', 'RU', 'DE'].map((lang) => {
                      const t = item.translations.find(tr => tr.language === lang);
                      return t ? (
                        <button
                          key={lang}
                          onClick={() => handleOpenEditModal(item, lang as Language)}
                          className="text-[10px] font-bold bg-rose-50 border border-rose-100 text-[var(--color-rose-700)] px-2 py-0.5 rounded hover:bg-rose-100 transition-colors"
                        >
                          {lang}
                        </button>
                      ) : (
                        <button
                          key={lang}
                          onClick={() => handleOpenEditModal(item, lang as Language)}
                          className="text-[10px] font-semibold border border-dashed border-gray-200 text-gray-400 px-2 py-0.5 rounded hover:border-rose-300 hover:text-[var(--color-rose-600)] transition-colors"
                        >
                          + {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* İşlemler */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 justify-between items-center">
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    item.isActive
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {item.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(item, 'TR')}
                      className="p-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                      title="Düzenle"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={loadingId === item.id}
                      className="p-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Pasifleştir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="text-base font-bold text-gray-900">
                {editingItem ? 'Çalışmayı Düzenle' : 'Yeni Çalışma Ekle'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
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

              {/* Başlık */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">İşlem / Çalışma Başlığı</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Gül Kurusu Protez Tırnak Uygulaması"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Açıklama (Opsiyonel)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="İşlem detayları, kullanılan malzemeler..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white h-16 resize-none"
                />
              </div>

              {/* Öncesi & Sonrası Görselleri */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Öncesi Görsel (Before)</label>
                  <input
                    type="text"
                    required
                    value={beforeImage}
                    onChange={(e) => setBeforeImage(e.target.value)}
                    placeholder="/uploads/before.jpg"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Sonrası Görsel (After)</label>
                  <input
                    type="text"
                    required
                    value={afterImage}
                    onChange={(e) => setAfterImage(e.target.value)}
                    placeholder="/uploads/after.jpg"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Kategori & Sıralama */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                  >
                    <option value="Tırnak">Tırnak</option>
                    <option value="Kirpik">Kirpik</option>
                    <option value="Kaş">Kaş</option>
                    <option value="Cilt Bakımı">Cilt Bakımı</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Görünüm Sırası</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                  />
                </div>
              </div>

              {/* Switch Checkboxlar */}
              <div className="flex gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Aktif / Gösterilsin</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-semibold text-gray-700 cursor-pointer">Öne Çıkarılan</label>
                </div>
              </div>

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
                  {formLoading ? 'Kaydediliyor...' : editingItem ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
