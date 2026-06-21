"use client";

import { useState } from 'react';
import { createFaq, updateFaq, deleteFaq } from '@/app/actions/faq';
import { Language } from '@prisma/client';
import { Plus, Search, Globe, CheckCircle, AlertCircle, X, Edit, Trash2, HelpCircle, Link2 } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  language: Language;
  isActive: boolean;
  order: number;
  schemaActive: boolean;
  pageId: string | null;
  serviceId: string | null;
  blogPostId: string | null;
  serviceName: string | null;
  pageTitle: string | null;
}

interface DropdownItem {
  id: string;
  name?: string;
  title?: string;
}

interface FaqClientProps {
  initialFaqs: FaqItem[];
  services: DropdownItem[];
  pages: DropdownItem[];
}

export default function FaqClient({ initialFaqs, services, pages }: FaqClientProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [langFilter, setLangFilter] = useState<string>('ALL');

  // Modal durumları
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

  // Form inputları
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [language, setLanguage] = useState<Language>('TR');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [schemaActive, setSchemaActive] = useState<boolean>(true);
  const [order, setOrder] = useState<string>('0');
  
  const [serviceId, setServiceId] = useState<string>('');
  const [pageId, setPageId] = useState<string>('');

  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setLanguage('TR');
    setIsActive(true);
    setSchemaActive(true);
    setOrder('0');
    setServiceId('');
    setPageId('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setLanguage(faq.language);
    setIsActive(faq.isActive);
    setSchemaActive(faq.schemaActive);
    setOrder(faq.order.toString());
    setServiceId(faq.serviceId || '');
    setPageId(faq.pageId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData();
    formData.append('question', question);
    formData.append('answer', answer);
    formData.append('language', language);
    formData.append('isActive', isActive.toString());
    formData.append('schemaActive', schemaActive.toString());
    formData.append('order', order);
    formData.append('serviceId', serviceId);
    formData.append('pageId', pageId);

    let result;
    if (editingFaq) {
      result = await updateFaq(editingFaq.id, formData);
    } else {
      result = await createFaq(formData);
    }

    setFormLoading(false);

    if (result.success) {
      window.location.reload();
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu soruyu pasifleştirmek (soft delete) istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deleteFaq(id);
    setLoadingId(null);

    if (result.success) {
      setFaqs(prev => prev.map(f => f.id === id ? { ...f, isActive: false } : f));
      showFeedback('success', 'Soru pasifleştirildi.');
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = langFilter === 'ALL' || faq.language === langFilter;
    return matchesSearch && matchesLang;
  });

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
            placeholder="Soru veya cevap ile ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] bg-white"
          >
            <option value="ALL">Tüm Diller</option>
            <option value="TR">Türkçe (TR)</option>
            <option value="EN">İngilizce (EN)</option>
            <option value="RU">Rusça (RU)</option>
            <option value="DE">Almanca (DE)</option>
          </select>

          <button
            onClick={handleOpenCreateModal}
            className="bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Yeni Soru Ekle
          </button>
        </div>
      </div>

      {/* FAQ Listesi Tablosu */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6 w-[35%]">Soru</th>
                <th className="py-4 px-6 w-[20%]">Eşleştiği Hizmet/Sayfa</th>
                <th className="py-4 px-6">Dil & Sıra</th>
                <th className="py-4 px-6">Schema</th>
                <th className="py-4 px-6">Durum</th>
                <th className="py-4 px-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400 font-medium">
                    Kayıtlı sıkça sorulan soru bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredFaqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-900 leading-normal">
                      <div className="flex gap-2 items-start">
                        <HelpCircle size={16} className="text-gray-400 shrink-0 mt-0.5" />
                        <span>{faq.question}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {faq.serviceName ? (
                        <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-lg w-fit border border-blue-100 font-medium">
                          <Link2 size={12} />
                          Hizmet: {faq.serviceName}
                        </span>
                      ) : faq.pageTitle ? (
                        <span className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg w-fit border border-indigo-100 font-medium">
                          <Link2 size={12} />
                          Sayfa: {faq.pageTitle}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Genel Soru</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 w-fit text-[10px] text-gray-600">
                          <Globe size={11} className="text-gray-400" />
                          {faq.language}
                        </span>
                        <span className="text-[10px] text-gray-400">Sıra: {faq.order}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                        faq.schemaActive
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        {faq.schemaActive ? 'Google FAQ' : 'Kapalı'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        faq.isActive 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {faq.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(faq)}
                          disabled={loadingId === faq.id}
                          className="p-1.5 rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition-colors"
                          title="Düzenle"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(faq.id)}
                          disabled={loadingId === faq.id}
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
                {editingFaq ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Dil Seçimi */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Soru Dili</label>
                <div className="flex gap-2">
                  {['TR', 'EN', 'RU', 'DE'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang as Language)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        language === lang
                          ? 'bg-[var(--color-rose-600)] text-white border-[var(--color-rose-600)]'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Soru */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Soru</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Örn: Protez tırnak işlemi ne kadar sürer?"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-medium"
                />
              </div>

              {/* Cevap */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Cevap</label>
                <textarea
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Sorunun detaylı cevabını buraya yazın..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white h-24 resize-none"
                />
              </div>

              {/* Eşleştirme (Hizmet & Sayfa) */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Soru Konumlandırması (Eşleştirme)</span>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Hizmet */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Hizmet Detay Sayfası</label>
                    <select
                      value={serviceId}
                      onChange={(e) => {
                        setServiceId(e.target.value);
                        if (e.target.value) setPageId(''); // Çakışmayı önlemek için diğerini temizle
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                    >
                      <option value="">-- Hizmet Seç --</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name || s.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sayfa */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">CMS Sayfası</label>
                    <select
                      value={pageId}
                      onChange={(e) => {
                        setPageId(e.target.value);
                        if (e.target.value) setServiceId(''); // Çakışmayı önlemek için diğerini temizle
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                    >
                      <option value="">-- Sayfa Seç --</option>
                      {pages.map(p => (
                        <option key={p.id} value={p.id}>{p.title || p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sıralama */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Soru Gösterim Sırası</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                />
              </div>

              {/* Checkbox Seçenekleri */}
              <div className="flex gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Soru Aktif</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="schemaActive"
                    checked={schemaActive}
                    onChange={(e) => setSchemaActive(e.target.checked)}
                    className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                  />
                  <label htmlFor="schemaActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Google FAQ Şeması Üret</label>
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
                  {formLoading ? 'Kaydediliyor...' : editingFaq ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
