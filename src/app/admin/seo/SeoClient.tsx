"use client";

import { useState } from 'react';
import { createRedirect, updateRedirect, deleteRedirect } from '@/app/actions/seo';
import { Plus, Search, CheckCircle, AlertCircle, X, Edit, Trash2, Link2, Globe, ArrowRight, ShieldAlert, FileText } from 'lucide-react';

interface RedirectItem {
  id: string;
  oldUrl: string;
  newUrl: string;
  statusCode: number;
  isActive: boolean;
  createdAt: string;
}

interface SeoClientProps {
  initialRedirects: RedirectItem[];
}

export default function SeoClient({ initialRedirects }: SeoClientProps) {
  const [redirects, setRedirects] = useState<RedirectItem[]>(initialRedirects);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'redirects' | 'sitemap'>('redirects');

  // Modal durumları
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRedirect, setEditingRedirect] = useState<RedirectItem | null>(null);

  // Form inputları
  const [oldUrl, setOldUrl] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [statusCode, setStatusCode] = useState<number>(301);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingRedirect(null);
    setOldUrl('');
    setNewUrl('');
    setStatusCode(301);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: RedirectItem) => {
    setEditingRedirect(item);
    setOldUrl(item.oldUrl);
    setNewUrl(item.newUrl);
    setStatusCode(item.statusCode);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData();
    formData.append('oldUrl', oldUrl);
    formData.append('newUrl', newUrl);
    formData.append('statusCode', statusCode.toString());
    formData.append('isActive', isActive.toString());

    let result;
    if (editingRedirect) {
      result = await updateRedirect(editingRedirect.id, formData);
    } else {
      result = await createRedirect(formData);
    }

    setFormLoading(false);

    if (result.success) {
      window.location.reload();
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yönlendirme kuralını pasifleştirmek (soft delete) istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deleteRedirect(id);
    setLoadingId(null);

    if (result.success) {
      setRedirects(prev => prev.map(r => r.id === id ? { ...r, isActive: false } : r));
      showFeedback('success', 'Yönlendirme kuralı pasifleştirildi.');
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const filteredRedirects = redirects.filter(r => 
    r.oldUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.newUrl.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white border border-gray-200 rounded-2xl p-2.5 shadow-sm overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('redirects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'redirects'
              ? 'bg-[var(--color-rose-600)] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Link2 size={14} />
          URL Yönlendirmeleri (301/302)
        </button>
        <button
          onClick={() => setActiveTab('sitemap')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'sitemap'
              ? 'bg-[var(--color-rose-600)] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Globe size={14} />
          Robots & Site Haritası
        </button>
      </div>

      {activeTab === 'redirects' ? (
        <div className="space-y-6">
          {/* Üst İşlem Çubuğu */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-80 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Yönlendirme linki ile ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
              />
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Yeni Yönlendirme Kuralı Ekle
            </button>
          </div>

          {/* Yönlendirmeler Tablosu */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6 w-[35%]">Hedef / Eski URL</th>
                    <th className="py-4 px-6 w-[35%]">Yeni Yönlenen URL</th>
                    <th className="py-4 px-6">Tip</th>
                    <th className="py-4 px-6">Durum</th>
                    <th className="py-4 px-6 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {filteredRedirects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-400 font-medium">
                        Kayıtlı yönlendirme kuralı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredRedirects.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-red-600 bg-red-50/20 max-w-[200px] truncate">{r.oldUrl}</td>
                        <td className="py-4 px-6 font-mono text-xs text-green-700 bg-green-50/20 max-w-[200px] truncate">
                          <span className="flex items-center gap-1">
                            <ArrowRight size={12} className="text-gray-400 shrink-0" />
                            {r.newUrl}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            r.statusCode === 301 
                              ? 'bg-blue-50 text-blue-700 border-blue-100' 
                              : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                          }`}>
                            {r.statusCode === 301 ? '301 Kalıcı' : '302 Geçici'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            r.isActive 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {r.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(r)}
                              disabled={loadingId === r.id}
                              className="p-1.5 rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition-colors"
                              title="Düzenle"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={loadingId === r.id}
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Robots.txt Kartı */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-fit gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                <FileText size={16} className="text-[var(--color-rose-600)]" />
                Robots.txt Kontrolü
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Arama motoru örümceklerine hangi sayfaların taranıp taranamayacağını belirten kurallar dizisidir. Next.js robots API dosyasıyla dinamik olarak üretilir.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-4">
                <pre className="text-xs font-mono text-gray-600 leading-normal">
{`User-agent: *
Allow: /
Disallow: /api/
Disallow: /*/admin/

Sitemap: https://studionl.com/sitemap.xml`}
                </pre>
              </div>
            </div>

            <a
              href="/robots.txt"
              target="_blank"
              className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-xl text-sm transition-colors mt-2"
            >
              Robots.txt Dosyasını Gör
            </a>
          </div>

          {/* Sitemap Kartı */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-fit gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                <Globe size={16} className="text-[var(--color-rose-600)]" />
                Site Haritası (Sitemap.xml)
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Sitenizdeki aktif tüm dil rotalarını, blog yazılarını, hizmet kategorilerini, hedeflenmiş SEO landing sayfalarını listeleyen XML dosyasıdır. Google'da indekslenme gücünü doğrudan etkiler.
              </p>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start mt-4">
                <ShieldAlert className="text-blue-600 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-900 block">Dinamik Yapı Aktif</span>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Sitemap dosyanız her yeni SEO sayfası veya blog yazısı eklendiğinde arka planda otomatik olarak güncellenir. Statik işlem gerekmez.
                  </p>
                </div>
              </div>
            </div>

            <a
              href="/sitemap.xml"
              target="_blank"
              className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-xl text-sm transition-colors mt-2"
            >
              Sitemap.xml Dosyasını Gör
            </a>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="text-base font-bold text-gray-900">
                {editingRedirect ? 'Yönlendirmeyi Düzenle' : 'Yeni Yönlendirme Kuralı Ekle'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Eski URL */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Eski URL Rota (Hedef)</label>
                <input
                  type="text"
                  required
                  value={oldUrl}
                  onChange={(e) => setOldUrl(e.target.value)}
                  placeholder="Örn: /eski-protez-tirnak"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono text-xs"
                />
              </div>

              {/* Yeni URL */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Yeni URL (Yönlenen Rota)</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Örn: /tr/hizmetler/tirnak/protez-tirnak"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono text-xs"
                />
              </div>

              {/* Durum Kodu */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Yönlendirme Durum Kodu</label>
                <select
                  value={statusCode}
                  onChange={(e) => setStatusCode(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                >
                  <option value="301">301 Kalıcı (Kalıcı taşındı - SEO Değeri Aktarılır)</option>
                  <option value="302">302 Geçici (Geçici yönlendirme - Geçici kampanya vb.)</option>
                </select>
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
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Yönlendirme Kuralı Aktif</label>
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
                  {formLoading ? 'Kaydediliyor...' : editingRedirect ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
