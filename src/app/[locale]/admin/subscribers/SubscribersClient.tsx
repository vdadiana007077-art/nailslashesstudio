"use client";

import { useState } from 'react';
import { createSubscriber, toggleSubscriberStatus } from '@/app/actions/subscriber';
import { Language } from '@prisma/client';
import { 
  Search, 
  Plus, 
  Mail, 
  Calendar, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Download,
  Trash2,
  Check,
  XCircle
} from 'lucide-react';

interface SubscriberItem {
  id: string;
  email: string;
  language: Language;
  isActive: boolean;
  createdAt: string | Date;
}

interface SubscribersClientProps {
  initialSubscribers: SubscriberItem[];
}

export default function SubscribersClient({ initialSubscribers }: SubscribersClientProps) {
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>(initialSubscribers);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [langFilter, setLangFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Yeni abone ekleme formu
  const [newEmail, setNewEmail] = useState<string>('');
  const [newLang, setNewLang] = useState<Language>('TR');
  const [formLoading, setFormLoading] = useState<boolean>(false);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setFormLoading(true);
    const result = await createSubscriber(newEmail, newLang);
    setFormLoading(false);

    if (result.success && result.data) {
      const added = result.data as SubscriberItem;
      // Zaten varsa listede güncelle, yoksa ekle
      setSubscribers(prev => {
        const exists = prev.some(s => s.id === added.id);
        if (exists) {
          return prev.map(s => s.id === added.id ? added : s);
        }
        return [added, ...prev];
      });
      setNewEmail('');
      showFeedback('success', 'Abone başarıyla eklendi.');
    } else {
      showFeedback('error', result.error || 'Abone eklenirken bir hata oluştu.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const result = await toggleSubscriberStatus(id, !currentStatus);
    setLoadingId(null);

    if (result.success && result.data) {
      const updated = result.data as SubscriberItem;
      setSubscribers(prev => prev.map(s => s.id === id ? { ...s, isActive: updated.isActive } : s));
      showFeedback('success', `Abone durumu başarıyla ${!currentStatus ? 'aktif' : 'pasif'} yapıldı.`);
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  // CSV İndirme Fonksiyonu
  const downloadCSV = () => {
    const headers = ['Email,Dil,Durum,Kayit Tarihi'];
    const rows = filteredSubscribers.map(s => 
      `"${s.email}","${s.language}","${s.isActive ? 'Aktif' : 'Pasif'}","${new Date(s.createdAt).toLocaleDateString('tr-TR')}"`
    );
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bulten_aboneleri_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = langFilter === 'ALL' || sub.language === langFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && sub.isActive) || 
      (statusFilter === 'PASSIVE' && !sub.isActive);
    return matchesSearch && matchesLang && matchesStatus;
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

      {/* Üst Kısım: Yeni Ekleme & CSV Dışa Aktarma */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yeni Abone Ekleme Formu */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:col-span-2 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[var(--color-rose-600)]" />
            Manuel Abone Ekle
          </h3>
          <form onSubmit={handleAddSubscriber} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="E-posta adresi yazın..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
              />
            </div>
            <div className="w-full sm:w-32">
              <select
                value={newLang}
                onChange={(e) => setNewLang(e.target.value as Language)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
              >
                <option value="TR">TR (Türkçe)</option>
                <option value="EN">EN (İngilizce)</option>
                <option value="RU">RU (Rusça)</option>
                <option value="DE">DE (Almanca)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={formLoading}
              className="bg-[var(--color-rose-600)] text-white px-6 py-2.5 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {formLoading ? 'Ekleniyor...' : 'Abone Ekle'}
            </button>
          </form>
        </div>

        {/* Aksiyon Kutusu */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">Dışa Aktarma</h3>
            <p className="text-xs text-gray-500">Mevcut filtrelenmiş listedeki tüm e-postaları bülten araçlarına yüklemek için CSV dosyası olarak indirebilirsiniz.</p>
          </div>
          <button
            onClick={downloadCSV}
            className="w-full mt-4 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            <Download size={16} />
            CSV Olarak İndir ({filteredSubscribers.length})
          </button>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Arama */}
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="E-posta ile ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
          />
        </div>

        {/* Kategori Filtreleri */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] bg-white"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="ACTIVE">Sadece Aktifler</option>
            <option value="PASSIVE">Sadece Pasifler</option>
          </select>
        </div>
      </div>

      {/* Tablo Listesi */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Abone E-Posta</th>
                <th className="py-4 px-6">Kayıt Dili</th>
                <th className="py-4 px-6">Kayıt Tarihi</th>
                <th className="py-4 px-6">Durum</th>
                <th className="py-4 px-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400 font-medium">
                    Aranan kriterlere uygun abone bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{sub.email}</td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5 font-semibold text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 w-fit">
                        <Globe size={12} className="text-gray-400" />
                        {sub.language}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(sub.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        sub.isActive 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {sub.isActive ? <Check size={12} /> : <XCircle size={12} />}
                        {sub.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(sub.id, sub.isActive)}
                        disabled={loadingId === sub.id}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                          sub.isActive
                            ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
                            : 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {loadingId === sub.id ? 'İşlemde...' : sub.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
