"use client";

import { useState } from 'react';
import { createMenuItem, updateMenuItem, deleteMenuItem } from '@/app/actions/menu';
import { Plus, Edit2, Trash2, Globe, List, Check, X, ArrowUp, ArrowDown } from 'lucide-react';

interface MenuItem {
  id: string;
  menuType: 'HEADER' | 'FOOTER' | 'LEGAL_FOOTER';
  language: 'TR' | 'EN' | 'DE' | 'RU';
  title: string;
  url: string;
  order: number;
  isActive: boolean;
  target: string;
  isExternal: boolean;
}

interface MenusClientProps {
  initialItems: MenuItem[];
  locale: string;
}

export default function MenusClient({ initialItems, locale }: MenusClientProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<'HEADER' | 'FOOTER' | 'LEGAL_FOOTER'>('HEADER');
  const [activeLang, setActiveLang] = useState<'TR' | 'EN' | 'DE' | 'RU'>('TR');
  
  // Ekleme / Düzenleme Modalı State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State'leri
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [order, setOrder] = useState(0);
  const [target, setTarget] = useState('_self');
  const [isExternal, setIsExternal] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const filteredItems = items
    .filter((item) => item.menuType === activeTab && item.language === activeLang)
    .sort((a, b) => a.order - b.order);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setUrl('');
    setOrder(filteredItems.length);
    setTarget('_self');
    setIsExternal(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setUrl(item.url);
    setOrder(item.order);
    setTarget(item.target);
    setIsExternal(item.isExternal);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('menuType', activeTab);
    formData.append('language', activeLang);
    formData.append('title', title);
    formData.append('url', url);
    formData.append('order', order.toString());
    formData.append('target', target);
    formData.append('isExternal', isExternal ? 'true' : 'false');
    formData.append('isActive', isActive ? 'true' : 'false');

    let res;
    if (editingItem) {
      res = await updateMenuItem(editingItem.id, formData);
    } else {
      res = await createMenuItem(formData);
    }

    setLoading(false);
    if (res.success && res.data) {
      if (editingItem) {
        setItems(items.map((i) => (i.id === editingItem.id ? (res.data as any) : i)));
      } else {
        setItems([...items, res.data as any]);
      }
      setIsModalOpen(false);
    } else {
      alert(res.error || 'Bir hata oluştu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu menü elemanını pasifleştirmek (silmek) istediğinize emin misiniz?')) return;
    const res = await deleteMenuItem(id);
    if (res.success) {
      // Listede pasif duruma çek
      setItems(items.map((i) => (i.id === id ? { ...i, isActive: false } : i)));
    } else {
      alert(res.error || 'İşlem gerçekleştirilemedi.');
    }
  };

  return (
    <div className="space-y-6">
      {/* TİP VE DİL FİLTRELERİ */}
      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Menü Tipi Sekmeleri */}
        <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 shrink-0">
          {(['HEADER', 'FOOTER', 'LEGAL_FOOTER'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === type ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {type === 'HEADER' ? 'Header (Üst Menü)' : type === 'FOOTER' ? 'Footer (Alt Menü)' : 'Legal Footer (Yasal Menü)'}
            </button>
          ))}
        </div>

        {/* Dil Seçimi Sekmeleri */}
        <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 shrink-0">
          {(['TR', 'EN', 'DE', 'RU'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeLang === lang ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Globe size={12} />
              {lang}
            </button>
          ))}
        </div>

        {/* Yeni Ekle Butonu */}
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
        >
          <Plus size={16} /> Link Ekle
        </button>
      </div>

      {/* MENÜ ELEMANLARI LİSTESİ */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 pl-6 font-medium">Sıra</th>
              <th className="p-4 font-medium">Başlık</th>
              <th className="p-4 font-medium">Link (URL)</th>
              <th className="p-4 font-medium">Hedef</th>
              <th className="p-4 font-medium">Durum</th>
              <th className="p-4 font-medium text-right pr-6">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400 text-xs font-semibold">
                  Bu menü tipinde ve dilde henüz hiç link bulunmuyor.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr 
                  key={item.id} 
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm ${
                    !item.isActive ? 'opacity-50 bg-gray-50/30' : ''
                  }`}
                >
                  <td className="p-4 pl-6 font-bold text-gray-500">
                    #{item.order}
                  </td>
                  <td className="p-4 font-bold text-gray-800">
                    {item.title}
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-500 truncate max-w-xs" title={item.url}>
                    {item.url}
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-bold">
                      {item.target} {item.isExternal ? '(Dış)' : ''}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                        <Check size={14} /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-500 font-bold">
                        <X size={14} /> Pasif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right pr-6 flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-xl cursor-pointer transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 size={14} />
                    </button>
                    {item.isActive && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl cursor-pointer transition-colors"
                        title="Sil (Pasifleştir)"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DÜZENLEME & EKLEME POPUP MODALI */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapat Butonu */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif font-bold text-gray-950 text-xl mb-6">
              {editingItem ? 'Menü Elemanını Düzenle' : 'Yeni Menü Elemanı Ekle'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Başlık */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Başlık / Metin</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="örn: Hakkımızda"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Yönlendirme Linki (URL)</label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="örn: /hakkimizda veya https://site.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Sıra (Order) */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Görünüm Sırası</label>
                  <input
                    type="number"
                    required
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs"
                  />
                </div>

                {/* Hedef (Target) */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hedef (Target)</label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs"
                  >
                    <option value="_self">Aynı Sayfa (_self)</option>
                    <option value="_blank">Yeni Sekme (_blank)</option>
                  </select>
                </div>
              </div>

              {/* Dış Bağlantı mı */}
              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="isExternal"
                  checked={isExternal}
                  onChange={(e) => setIsExternal(e.target.checked)}
                  className="rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-400)]"
                />
                <label htmlFor="isExternal" className="text-xs text-gray-600 font-semibold cursor-pointer">
                  Bu bir dış bağlantıdır (Harici Link)
                </label>
              </div>

              {/* Aktif mi */}
              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-400)]"
                />
                <label htmlFor="isActive" className="text-xs text-gray-600 font-semibold cursor-pointer">
                  Menüyü yayına al (Aktif)
                </label>
              </div>

              {/* Kaydet */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 bg-gray-950 hover:bg-black disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md cursor-pointer"
              >
                {loading ? 'KAYDEDİLİYOR...' : 'KAYDET'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
