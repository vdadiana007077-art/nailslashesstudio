"use client";

import { useState } from 'react';
import { createBlogTag, updateBlogTag, deleteBlogTag } from '@/app/actions/blog-tag';
import { Language } from '@prisma/client';
import { 
  Plus, Search, X, Edit, Trash2, CheckCircle, AlertCircle, Tag, Globe
} from 'lucide-react';

interface TagTranslation {
  id: string;
  language: Language;
  name: string;
  slug: string;
}

interface BlogTagItem {
  id: string;
  isActive: boolean;
  translations: TagTranslation[];
}

interface BlogTagsClientProps {
  initialTags: BlogTagItem[];
}

export default function BlogTagsClient({ initialTags }: BlogTagsClientProps) {
  const [tags, setTags] = useState<BlogTagItem[]>(initialTags);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<BlogTagItem | null>(null);

  // Form state
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('TR');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [formLoading, setFormLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    setSlug(autoSlug);
  };

  const handleOpenCreateModal = () => {
    setEditingTag(null);
    setSelectedLanguage('TR');
    setName('');
    setSlug('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tag: BlogTagItem, lang: Language) => {
    setEditingTag(tag);
    setSelectedLanguage(lang);
    const t = tag.translations.find(tr => tr.language === lang);
    setName(t?.name || '');
    setSlug(t?.slug || '');
    setIsActive(tag.isActive);
    setIsModalOpen(true);
  };

  const handleLanguageChange = (newLang: Language) => {
    setSelectedLanguage(newLang);
    if (!editingTag) return;
    const t = editingTag.translations.find(tr => tr.language === newLang);
    setName(t?.name || '');
    setSlug(t?.slug || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData();
    formData.append('language', selectedLanguage);
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('isActive', isActive.toString());

    let result;
    if (editingTag) {
      const translation = editingTag.translations.find(t => t.language === selectedLanguage);
      result = await updateBlogTag(editingTag.id, translation?.id || null, formData);
    } else {
      result = await createBlogTag(formData);
    }

    setFormLoading(false);

    if (result.success) {
      window.location.reload();
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu etiketi pasifleştirmek istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deleteBlogTag(id);
    setLoadingId(null);

    if (result.success) {
      setTags(prev => prev.map(t => t.id === id ? { ...t, isActive: false } : t));
      showFeedback('success', 'Etiket pasifleştirildi.');
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.translations.some(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Üst Çubuk */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Etiket adı veya slug ile ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
          />
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Yeni Etiket Ekle
        </button>
      </div>

      {/* Etiket Listesi */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 pl-6 font-medium">Durum</th>
              <th className="p-4 font-medium">Etiket Adı (TR)</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium">Diller</th>
              <th className="p-4 font-medium text-right pr-6">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <Tag className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-medium">Kayıtlı etiket bulunamadı.</p>
                </td>
              </tr>
            ) : (
              filteredTags.map((tag) => {
                const tr = tag.translations.find(t => t.language === 'TR');
                return (
                  <tr key={tag.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="p-4 pl-6">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        tag.isActive
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {tag.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      {tr?.name || tag.translations[0]?.name || 'İsimsiz'}
                    </td>
                    <td className="p-4 text-gray-500 font-mono text-xs">
                      /{tr?.slug || tag.translations[0]?.slug || '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5">
                        {['TR', 'EN', 'DE', 'RU'].map((lang) => {
                          const has = tag.translations.some(t => t.language === lang);
                          return (
                            <button
                              key={lang}
                              onClick={() => handleOpenEditModal(tag, lang as Language)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                                has
                                  ? 'bg-[var(--color-rose-50)] text-[var(--color-rose-700)] border-[var(--color-rose-200)]'
                                  : 'bg-gray-50 text-gray-400 border-gray-200 border-dashed hover:border-rose-300'
                              }`}
                            >
                              {lang}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEditModal(tag, 'TR')}
                          className="text-gray-500 hover:text-[var(--color-rose-600)] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Düzenle"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          disabled={loadingId === tag.id}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Pasifleştir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingTag ? 'Etiketi Düzenle' : 'Yeni Etiket Oluştur'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Çok dilli blog etiketi ekleyin.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Dil Seçimi */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Çeviri Dili</label>
                <div className="flex gap-2">
                  {(['TR', 'EN', 'RU', 'DE'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                        selectedLanguage === lang
                          ? 'bg-[var(--color-rose-600)] text-white border-[var(--color-rose-600)] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Globe size={12} />
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ad */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Etiket Adı *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Örn: Tırnak Bakımı"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Slug (URL) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="tirnak-bakimi"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                />
              </div>

              {/* Aktif */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tagIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded"
                />
                <label htmlFor="tagIsActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Etiket Aktif
                </label>
              </div>

              {/* Butonlar */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm disabled:opacity-50"
                >
                  {formLoading ? 'Kaydediliyor...' : editingTag ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
