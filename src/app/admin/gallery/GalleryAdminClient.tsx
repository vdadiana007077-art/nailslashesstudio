'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Image as ImageIcon, FolderOpen, Plus, Trash2, Save, Edit, Star, StarOff, ChevronUp, ChevronDown, Search, Loader2, X } from 'lucide-react';
import {
  createGalleryCategory, updateGalleryCategory, deleteGalleryCategory,
  createGalleryItem, updateGalleryItem, deleteGalleryItem,
  reorderGalleryCategories, reorderGalleryItems, toggleGalleryItemFeatured
} from '@/app/actions/gallery';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

const LANGUAGES = ['TR', 'EN', 'DE', 'RU'] as const;
type Lang = typeof LANGUAGES[number];

interface GalleryAdminClientProps {
  initialCategories: any[];
  initialItems: any[];
  locations: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string }>;
}

// ═══ HELPER ═══
function getTrans(translations: any[], lang: string, field: string) {
  const t = translations?.find((tr: any) => tr.language === lang);
  return t?.[field] || '';
}

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function GalleryAdminClient({ initialCategories, initialItems, locations, services }: GalleryAdminClientProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // ═══ MODAL STATES ═══
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'item' | 'catImage' | 'catOg'>('item');

  // ═══ FORM STATES ═══
  const [catForm, setCatForm] = useState({
    isActive: true, order: 0, image: '', ogImage: '', canonical: '', noIndex: false,
    translations: LANGUAGES.map(l => ({ language: l, name: '', slug: '', description: '', seoTitle: '', seoDescription: '' }))
  });
  const [activeCatLang, setActiveCatLang] = useState<Lang>('TR');

  const [itemForm, setItemForm] = useState({
    imageUrl: '', order: 0, isActive: true, isFeatured: false,
    categoryId: '', locationId: '', serviceId: '',
    translations: LANGUAGES.map(l => ({ language: l, title: '', description: '', altText: '' }))
  });
  const [activeItemLang, setActiveItemLang] = useState<Lang>('TR');

  const flash = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  // ═══════════════════════════════════════════
  // KATEGORİ FONKSİYONLARI
  // ═══════════════════════════════════════════
  const openNewCat = () => {
    setEditingCat(null);
    setCatForm({
      isActive: true, order: categories.length, image: '', ogImage: '', canonical: '', noIndex: false,
      translations: LANGUAGES.map(l => ({ language: l, name: '', slug: '', description: '', seoTitle: '', seoDescription: '' }))
    });
    setActiveCatLang('TR');
    setShowCatModal(true);
  };

  const openEditCat = (cat: any) => {
    setEditingCat(cat);
    setCatForm({
      isActive: cat.isActive, order: cat.order, image: cat.image || '', ogImage: cat.ogImage || '',
      canonical: cat.canonical || '', noIndex: cat.noIndex || false,
      translations: LANGUAGES.map(l => {
        const t = cat.translations?.find((tr: any) => tr.language === l);
        return {
          language: l, name: t?.name || '', slug: t?.slug || '', description: t?.description || '',
          seoTitle: t?.seoTitle || '', seoDescription: t?.seoDescription || ''
        };
      })
    });
    setActiveCatLang('TR');
    setShowCatModal(true);
  };

  const saveCat = async () => {
    setSaving(true);
    const payload = { ...catForm, translations: catForm.translations.filter(t => t.name.trim()) };
    if (payload.translations.length === 0) { flash('En az bir dilde kategori adı giriniz.'); setSaving(false); return; }

    let result;
    if (editingCat) {
      result = await updateGalleryCategory(editingCat.id, payload);
    } else {
      result = await createGalleryCategory(payload);
    }
    if (result.success) {
      flash(editingCat ? 'Kategori güncellendi!' : 'Kategori oluşturuldu!');
      setShowCatModal(false);
      // Refresh
      const fresh = await (await import('@/app/actions/gallery')).getGalleryCategories();
      if (fresh.success) setCategories(fresh.categories);
    } else {
      flash('Hata: ' + (result.error || 'İşlem başarısız.'));
    }
    setSaving(false);
  };

  const removeCat = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    const result = await deleteGalleryCategory(id);
    if (result.success) {
      setCategories(prev => prev.filter(c => c.id !== id));
      flash('Kategori silindi.');
    }
  };

  const moveCat = async (index: number, dir: -1 | 1) => {
    const arr = [...categories];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    arr.forEach((c, i) => c.order = i);
    setCategories(arr);
    await reorderGalleryCategories(arr.map(c => ({ id: c.id, order: c.order })));
  };

  const updateCatTrans = (field: string, value: string) => {
    setCatForm(prev => ({
      ...prev,
      translations: prev.translations.map(t =>
        t.language === activeCatLang ? { ...t, [field]: value, ...(field === 'name' && !editingCat ? { slug: slugify(value) } : {}) } : t
      )
    }));
  };

  // ═══════════════════════════════════════════
  // FOTOĞRAF FONKSİYONLARI
  // ═══════════════════════════════════════════
  const openNewItem = () => {
    setEditingItem(null);
    setItemForm({
      imageUrl: '', order: items.length, isActive: true, isFeatured: false,
      categoryId: '', locationId: '', serviceId: '',
      translations: LANGUAGES.map(l => ({ language: l, title: '', description: '', altText: '' }))
    });
    setActiveItemLang('TR');
    setShowItemModal(true);
  };

  const openEditItem = (item: any) => {
    setEditingItem(item);
    setItemForm({
      imageUrl: item.imageUrl || '', order: item.order, isActive: item.isActive, isFeatured: item.isFeatured,
      categoryId: item.categoryId || '', locationId: item.locationId || '', serviceId: item.serviceId || '',
      translations: LANGUAGES.map(l => {
        const t = item.translations?.find((tr: any) => tr.language === l);
        return { language: l, title: t?.title || '', description: t?.description || '', altText: t?.altText || '' };
      })
    });
    setActiveItemLang('TR');
    setShowItemModal(true);
  };

  const saveItem = async () => {
    setSaving(true);
    if (!itemForm.imageUrl.trim()) { flash('Görsel URL\'si zorunludur.'); setSaving(false); return; }
    const payload = {
      ...itemForm,
      categoryId: itemForm.categoryId || undefined,
      locationId: itemForm.locationId || undefined,
      serviceId: itemForm.serviceId || undefined,
    };

    let result;
    if (editingItem) {
      result = await updateGalleryItem(editingItem.id, payload);
    } else {
      result = await createGalleryItem(payload);
    }
    if (result.success) {
      flash(editingItem ? 'Fotoğraf güncellendi!' : 'Fotoğraf eklendi!');
      setShowItemModal(false);
      const fresh = await (await import('@/app/actions/gallery')).getGalleryItems();
      if (fresh.success) setItems(fresh.items);
    } else {
      flash('Hata: ' + (result.error || 'İşlem başarısız.'));
    }
    setSaving(false);
  };

  const removeItem = async (id: string) => {
    if (!confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) return;
    const result = await deleteGalleryItem(id);
    if (result.success) {
      setItems(prev => prev.filter(i => i.id !== id));
      flash('Fotoğraf silindi.');
    }
  };

  const toggleFeatured = async (id: string) => {
    const result = await toggleGalleryItemFeatured(id);
    if (result.success) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, isFeatured: result.isFeatured } : i));
    }
  };

  const moveItem = async (index: number, dir: -1 | 1) => {
    const arr = [...items];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    arr.forEach((it, i) => it.order = i);
    setItems(arr);
    await reorderGalleryItems(arr.map(it => ({ id: it.id, order: it.order })));
  };

  const updateItemTrans = (field: string, value: string) => {
    setItemForm(prev => ({
      ...prev,
      translations: prev.translations.map(t =>
        t.language === activeItemLang ? { ...t, [field]: value } : t
      )
    }));
  };

  // ═══ Medya Picker ═══
  const handleMediaSelect = (url: string) => {
    if (mediaPickerTarget === 'item') setItemForm(p => ({ ...p, imageUrl: url }));
    else if (mediaPickerTarget === 'catImage') setCatForm(p => ({ ...p, image: url }));
    else if (mediaPickerTarget === 'catOg') setCatForm(p => ({ ...p, ogImage: url }));
    setShowMediaPicker(false);
  };

  // ═══ FİLTRELEME ═══
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    const title = getTrans(item.translations, 'TR', 'title').toLowerCase();
    const alt = getTrans(item.translations, 'TR', 'altText').toLowerCase();
    return title.includes(s) || alt.includes(s) || item.imageUrl?.toLowerCase().includes(s);
  });

  const TABS = [
    { id: 'items' as const, label: 'Galeri Fotoğrafları', icon: ImageIcon, count: items.length },
    { id: 'categories' as const, label: 'Galeri Kategorileri', icon: FolderOpen, count: categories.length },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Galeri Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Fotoğrafları, kategorileri ve SEO ayarlarını yönetin.</p>
        </div>
      </div>

      {/* FLASH MESSAGE */}
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${message.startsWith('Hata') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon size={16} /> {tab.label}
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════ */}
      {/* FOTOĞRAFLAR SEKMESİ                              */}
      {/* ════════════════════════════════════════════════ */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Başlık veya alt text ile ara..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" />
            </div>
            <button onClick={openNewItem}
              className="flex items-center gap-2 bg-[var(--color-rose-600)] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-rose-700)] shadow-sm transition-all">
              <Plus size={16} /> Yeni Fotoğraf Ekle
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium">Henüz fotoğraf eklenmemiş.</p>
              <button onClick={openNewItem} className="mt-4 text-[var(--color-rose-600)] font-semibold text-sm hover:underline">
                İlk fotoğrafı ekle →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map((item: any, idx: number) => (
                <div key={item.id} className={`bg-white rounded-2xl border overflow-hidden group relative transition-all ${!item.isActive ? 'opacity-50' : ''} ${item.isFeatured ? 'border-yellow-400 ring-1 ring-yellow-200' : 'border-gray-200'}`}>
                  {/* Thumbnail */}
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <Image width={800} height={800} src={item.imageUrl} alt={getTrans(item.translations, 'TR', 'altText') || ''} className="w-full h-full object-cover" />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => openEditItem(item)} className="p-2 bg-white/90 rounded-full hover:bg-white"><Edit size={14} /></button>
                      <button onClick={() => toggleFeatured(item.id)} className="p-2 bg-white/90 rounded-full hover:bg-white">
                        {item.isFeatured ? <StarOff size={14} className="text-yellow-500" /> : <Star size={14} />}
                      </button>
                      <button onClick={() => removeItem(item.id)} className="p-2 bg-white/90 rounded-full hover:bg-white text-red-500"><Trash2 size={14} /></button>
                    </div>
                    {/* Badges */}
                    {item.isFeatured && <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">★ ÖNE ÇIKAN</span>}
                    {!item.isActive && <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">PASİF</span>}
                  </div>
                  {/* Info */}
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-semibold text-gray-900 truncate">{getTrans(item.translations, 'TR', 'title') || 'Başlıksız'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{getTrans(item.translations, 'TR', 'altText') || '-'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--color-rose-600)] font-medium">
                        {item.category ? getTrans(item.category.translations, 'TR', 'name') : 'Kategorisiz'}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp size={12} /></button>
                        <button onClick={() => moveItem(idx, 1)} disabled={idx === filteredItems.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* KATEGORİLER SEKMESİ                              */}
      {/* ════════════════════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openNewCat}
              className="flex items-center gap-2 bg-[var(--color-rose-600)] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-rose-700)] shadow-sm transition-all">
              <Plus size={16} /> Yeni Kategori Ekle
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <FolderOpen className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium">Henüz kategori oluşturulmamış.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3">Sıra</th><th className="px-4 py-3">Görsel</th><th className="px-4 py-3">Kategori Adı (TR)</th>
                  <th className="px-4 py-3">Slug (TR)</th><th className="px-4 py-3">Fotoğraf</th><th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">SEO</th><th className="px-4 py-3 text-right">İşlem</th>
                </tr></thead>
                <tbody>
                  {categories.map((cat: any, idx: number) => (
                    <tr key={cat.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveCat(idx, -1)} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp size={14} /></button>
                          <span className="text-xs font-mono text-gray-500 w-5 text-center">{idx + 1}</span>
                          <button onClick={() => moveCat(idx, 1)} disabled={idx === categories.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown size={14} /></button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {cat.image ? <Image width={800} height={800} src={cat.image} alt="" className="w-10 h-10 object-cover rounded-lg" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><ImageIcon size={14} className="text-gray-300" /></div>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{getTrans(cat.translations, 'TR', 'name') || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{getTrans(cat.translations, 'TR', 'slug') || '-'}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{cat._count?.items || 0}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {cat.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getTrans(cat.translations, 'TR', 'seoTitle') ? <span className="text-xs text-green-600">✓</span> : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEditCat(cat)} className="p-2 text-gray-500 hover:text-[var(--color-rose-600)] hover:bg-[var(--color-rose-50)] rounded-lg"><Edit size={14} /></button>
                          <button onClick={() => removeCat(cat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* KATEGORİ MODAL                                   */}
      {/* ════════════════════════════════════════════════ */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCatModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">{editingCat ? 'Kategori Düzenle' : 'Yeni Kategori'}</h3>
              <button onClick={() => setShowCatModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Dil Sekmeleri */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => setActiveCatLang(l)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeCatLang === l ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Dil bazlı alanlar */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Kategori Adı ({activeCatLang})</label>
                  <input type="text" value={catForm.translations.find(t => t.language === activeCatLang)?.name || ''}
                    onChange={e => updateCatTrans('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Slug ({activeCatLang})</label>
                  <input type="text" value={catForm.translations.find(t => t.language === activeCatLang)?.slug || ''}
                    onChange={e => updateCatTrans('slug', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Açıklama ({activeCatLang})</label>
                  <textarea value={catForm.translations.find(t => t.language === activeCatLang)?.description || ''}
                    onChange={e => updateCatTrans('description', e.target.value)} rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">SEO Title ({activeCatLang})</label>
                    <input type="text" value={catForm.translations.find(t => t.language === activeCatLang)?.seoTitle || ''}
                      onChange={e => updateCatTrans('seoTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">SEO Description ({activeCatLang})</label>
                    <input type="text" value={catForm.translations.find(t => t.language === activeCatLang)?.seoDescription || ''}
                      onChange={e => updateCatTrans('seoDescription', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Genel Alanlar */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Kapak Görseli</label>
                    <div className="flex gap-2">
                      <input type="text" value={catForm.image} onChange={e => setCatForm(p => ({ ...p, image: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" placeholder="URL..." />
                      <button type="button" onClick={() => { setMediaPickerTarget('catImage'); setShowMediaPicker(true); }}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50"><ImageIcon size={14} /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">OG Image</label>
                    <div className="flex gap-2">
                      <input type="text" value={catForm.ogImage} onChange={e => setCatForm(p => ({ ...p, ogImage: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" placeholder="URL..." />
                      <button type="button" onClick={() => { setMediaPickerTarget('catOg'); setShowMediaPicker(true); }}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50"><ImageIcon size={14} /></button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Canonical URL</label>
                    <input type="text" value={catForm.canonical} onChange={e => setCatForm(p => ({ ...p, canonical: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Sıra Numarası</label>
                    <input type="number" value={catForm.order} onChange={e => setCatForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={catForm.isActive} onChange={e => setCatForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded" /> Aktif
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={catForm.noIndex} onChange={e => setCatForm(p => ({ ...p, noIndex: e.target.checked }))} className="rounded" /> NoIndex
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={() => setShowCatModal(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">İptal</button>
              <button onClick={saveCat} disabled={saving}
                className="flex items-center gap-2 bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--color-rose-700)] shadow-sm disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {editingCat ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* FOTOĞRAF MODAL                                   */}
      {/* ════════════════════════════════════════════════ */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowItemModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">{editingItem ? 'Fotoğraf Düzenle' : 'Yeni Fotoğraf Ekle'}</h3>
              <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Görsel Seçimi */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Görsel *</label>
                <div className="flex gap-2">
                  <input type="text" value={itemForm.imageUrl} onChange={e => setItemForm(p => ({ ...p, imageUrl: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" placeholder="Görsel URL..." />
                  <button type="button" onClick={() => { setMediaPickerTarget('item'); setShowMediaPicker(true); }}
                    className="flex items-center gap-2 px-4 py-2 border border-[var(--color-rose-200)] text-[var(--color-rose-600)] rounded-xl text-sm font-semibold hover:bg-[var(--color-rose-50)]">
                    <ImageIcon size={14} /> Medyadan Seç
                  </button>
                </div>
                {itemForm.imageUrl && (
                  <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                    <Image width={800} height={800} src={itemForm.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Dil Sekmeleri */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => setActiveItemLang(l)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeItemLang === l ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Dil bazlı alanlar */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Başlık ({activeItemLang})</label>
                  <input type="text" value={itemForm.translations.find(t => t.language === activeItemLang)?.title || ''}
                    onChange={e => updateItemTrans('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Açıklama ({activeItemLang})</label>
                  <textarea value={itemForm.translations.find(t => t.language === activeItemLang)?.description || ''}
                    onChange={e => updateItemTrans('description', e.target.value)} rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Alt Text ({activeItemLang})</label>
                  <input type="text" value={itemForm.translations.find(t => t.language === activeItemLang)?.altText || ''}
                    onChange={e => updateItemTrans('altText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none" />
                </div>
              </div>

              {/* Seçimler */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Kategori</label>
                  <select value={itemForm.categoryId} onChange={e => setItemForm(p => ({ ...p, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none">
                    <option value="">— Seçiniz —</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{getTrans(c.translations, 'TR', 'name') || 'İsimsiz'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Şube (opsiyonel)</label>
                  <select value={itemForm.locationId} onChange={e => setItemForm(p => ({ ...p, locationId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none">
                    <option value="">— Tümü —</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Hizmet (opsiyonel)</label>
                  <select value={itemForm.serviceId} onChange={e => setItemForm(p => ({ ...p, serviceId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-rose-500)] focus:outline-none">
                    <option value="">— Tümü —</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Togglelar */}
              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={itemForm.isActive} onChange={e => setItemForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded" /> Aktif</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={itemForm.isFeatured} onChange={e => setItemForm(p => ({ ...p, isFeatured: e.target.checked }))} className="rounded" /> Öne Çıkar</label>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mr-2">Sıra:</label>
                  <input type="number" value={itemForm.order} onChange={e => setItemForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                    className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={() => setShowItemModal(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">İptal</button>
              <button onClick={saveItem} disabled={saving}
                className="flex items-center gap-2 bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--color-rose-700)] shadow-sm disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {editingItem ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDYA PICKER MODAL */}
      <MediaPickerModal isOpen={showMediaPicker} onClose={() => setShowMediaPicker(false)} onSelect={handleMediaSelect}
        currentValue={mediaPickerTarget === 'item' ? itemForm.imageUrl : mediaPickerTarget === 'catImage' ? catForm.image : catForm.ogImage} />
    </div>
  );
}
