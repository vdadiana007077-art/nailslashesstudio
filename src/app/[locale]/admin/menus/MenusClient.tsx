"use client";

import { useState } from 'react';
import { createMenuItem, updateMenuItem, deleteMenuItem } from '@/app/actions/menu';
import { MenuType, Language } from '@prisma/client';
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
  Link2,
  Layers,
  ArrowRight
} from 'lucide-react';

interface MenuItem {
  id: string;
  menuType: MenuType;
  language: Language;
  title: string;
  url: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface MenusClientProps {
  initialItems: MenuItem[];
}

export default function MenusClient({ initialItems }: MenusClientProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<string>('HEADER');
  const [langFilter, setLangFilter] = useState<Language>('TR');
  
  // Modal durumları
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Form inputları
  const [menuType, setMenuType] = useState<MenuType>('HEADER');
  const [language, setLanguage] = useState<Language>('TR');
  const [title, setTitle] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [order, setOrder] = useState<string>('0');
  const [isActive, setIsActive] = useState<boolean>(true);

  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setMenuType(activeTab as MenuType);
    setLanguage(langFilter);
    setTitle('');
    setUrl('');
    setOrder('0');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setMenuType(item.menuType);
    setLanguage(item.language);
    setTitle(item.title);
    setUrl(item.url);
    setOrder(item.order.toString());
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData();
    formData.append('menuType', menuType);
    formData.append('language', language);
    formData.append('title', title);
    formData.append('url', url);
    formData.append('order', order);
    formData.append('isActive', isActive.toString());

    let result;
    if (editingItem) {
      result = await updateMenuItem(editingItem.id, formData);
    } else {
      result = await createMenuItem(formData);
    }

    setFormLoading(false);

    if (result.success) {
      window.location.reload();
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu menü elemanını pasifleştirmek (soft delete) istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deleteMenuItem(id);
    setLoadingId(null);

    if (result.success) {
      setItems(prev => prev.map(item => item.id === id ? { ...item, isActive: false } : item));
      showFeedback('success', 'Menü elemanı pasifleştirildi.');
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const filteredItems = items.filter(item => 
    item.menuType === activeTab && 
    item.language === langFilter
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

      {/* Kontrol Paneli: Dil Seçenekleri & Yeni Butonu */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Dil Seçimi */}
        <div className="flex gap-2 w-full sm:w-auto">
          {['TR', 'EN', 'RU', 'DE'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLangFilter(lang as Language)}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                langFilter === lang
                  ? 'bg-[var(--color-rose-600)] text-white border-[var(--color-rose-600)]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Yeni Menü Linki Ekle
        </button>
      </div>

      {/* Rota Tipi Sekmeleri (Header / Footer) */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('HEADER')}
          className={`pb-4 px-6 font-medium text-sm border-b-2 transition-all ${
            activeTab === 'HEADER'
              ? 'border-[var(--color-rose-600)] text-[var(--color-rose-700)]'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          Üst Menü (Header)
        </button>
        <button
          onClick={() => setActiveTab('FOOTER')}
          className={`pb-4 px-6 font-medium text-sm border-b-2 transition-all ${
            activeTab === 'FOOTER'
              ? 'border-[var(--color-rose-600)] text-[var(--color-rose-700)]'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          Alt Menü (Footer)
        </button>
      </div>

      {/* Menü Linkleri Tablosu */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Menü Başlığı</th>
                <th className="py-4 px-6">Yönlendirme URL</th>
                <th className="py-4 px-6">Sıra</th>
                <th className="py-4 px-6">Durum</th>
                <th className="py-4 px-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400 font-medium">
                    Bu menü tipinde ve dilde tanımlı link bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-900">{item.title}</td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5 font-mono text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg w-fit">
                        <Link2 size={12} className="text-gray-400" />
                        {item.url}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-xs text-gray-400">{item.order}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        item.isActive 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {item.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          disabled={loadingId === item.id}
                          className="p-1.5 rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition-colors"
                          title="Düzenle"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={loadingId === item.id}
                          className="p-1.5 rounded-lg border text-red-600 border-red-200 hover:bg-red-50 transition-colors"
                          title="Pasifleştir (Soft Delete)"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="text-base font-bold text-gray-900">
                {editingItem ? 'Menü Linkini Düzenle' : 'Yeni Menü Linki Ekle'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Menü Tipi */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Menü Tipi</label>
                <select
                  value={menuType}
                  onChange={(e) => setMenuType(e.target.value as MenuType)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                >
                  <option value="HEADER">Üst Menü (Header)</option>
                  <option value="FOOTER">Alt Menü (Footer)</option>
                </select>
              </div>

              {/* Dil */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Menü Link Dili</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                >
                  <option value="TR">Türkçe (TR)</option>
                  <option value="EN">İngilizce (EN)</option>
                  <option value="RU">Rusça (RU)</option>
                  <option value="DE">Almanca (DE)</option>
                </select>
              </div>

              {/* Başlık */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Menü Başlığı</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Hizmetlerimiz"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-medium"
                />
              </div>

              {/* URL */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Yönlendirme Linki (URL)</label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Örn: /tr/hizmetler veya https://..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                />
              </div>

              {/* Sıralama */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Gösterim Sırası</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-bold"
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
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Menü Linki Aktif</label>
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
