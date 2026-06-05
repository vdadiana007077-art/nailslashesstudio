'use client';

import { useState } from 'react';
import { createTransaction } from '@/app/actions/transaction';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  DollarSign, 
  Calendar, 
  User, 
  FileText,
  CreditCard,
  Wallet,
  Landmark,
  X,
  Sparkles,
  Users,
  MapPin
} from 'lucide-react';

type TransactionItem = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: string;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  date: string;
  description: string | null;
  locationId: string | null;
  locationName: string;
  category: {
    name: string;
  };
  staff: {
    name: string;
  } | null;
};

type StaffItem = {
  id: string;
  name: string;
};

type StaffPayout = {
  staffId: string;
  name: string;
  appointmentCount: number;
  totalRevenue: number;
  commissionEarned: number;
};

type LocationItem = {
  id: string;
  name: string;
};

type Props = {
  transactions: TransactionItem[];
  staffList: StaffItem[];
  staffPayouts: StaffPayout[];
  locations: LocationItem[];
  locale: string;
};

export default function AccountingClient({ transactions, staffList, staffPayouts, locations, locale }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL');

  // Filtrelenmiş İşlemler
  const filteredTransactions = transactions.filter((t) => 
    selectedLocationId === 'ALL' || t.locationId === selectedLocationId
  );

  // Gelir & Gider Hesaplamaları (Filtrelenmiş verilere göre)
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const netProfit = totalIncome - totalExpense;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const categoryName = formData.get('categoryName') as string;
    const type = formData.get('type') as 'INCOME' | 'EXPENSE';
    const amountStr = formData.get('amount') as string;
    const paymentMethod = formData.get('paymentMethod') as 'CASH' | 'CARD' | 'TRANSFER';
    const description = formData.get('description') as string;
    const staffId = formData.get('staffId') as string;
    const locationId = formData.get('locationId') as string;

    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      setError('Geçerli bir tutar giriniz.');
      setLoading(false);
      return;
    }

    if (!locationId) {
      setError('Lütfen bir şube seçiniz.');
      setLoading(false);
      return;
    }

    try {
      const res = await createTransaction({
        categoryName,
        type,
        amount,
        paymentMethod,
        description,
        staffId: staffId || undefined,
        locationId: locationId || undefined
      });

      if (res.success) {
        setModalOpen(false);
      } else {
        setError(res.error || 'İşlem kaydedilemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    if (method === 'CASH') return <Wallet size={14} className="text-amber-600" />;
    if (method === 'CARD') return <CreditCard size={14} className="text-blue-600" />;
    return <Landmark size={14} className="text-purple-600" />;
  };

  return (
    <div className="space-y-8">
      {/* Şube Filtreleme (Premium Tab Tasarımı) */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="text-[var(--color-primary-500)]" size={18} />
          <span className="text-sm font-bold text-gray-700">Şube Filtresi:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLocationId('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedLocationId === 'ALL'
                ? 'bg-gray-950 text-white shadow-sm'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
            }`}
          >
            Tüm Şubeler
          </button>
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocationId(loc.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedLocationId === loc.id
                  ? 'bg-gray-950 text-white shadow-sm'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Toplam Gelir */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -z-10"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100/60 text-emerald-600 rounded-full flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gelir</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-md border border-emerald-100">Kasa Girişi</span>
        </div>

        {/* Toplam Gider */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -z-10"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100/60 text-rose-600 rounded-full flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gider</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">₺{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-1 rounded-md border border-rose-100">Kasa Çıkışı</span>
        </div>

        {/* Net Kar */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -z-10"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100/60 text-blue-600 rounded-full flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Net Kâr</p>
              <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ₺{netProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-md border border-blue-100">Net Durum</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sol Sütun: Son İşlemler (8/12) */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Muhasebe Hareketleri</h3>
              <p className="text-xs text-gray-400 mt-1">Gelir ve gider işlemlerinin güncel listesi.</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> HAREKET EKLE
            </button>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              Bu şubeye ait bir muhasebe hareketi kaydedilmemiş.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="p-4 pl-6">Tür</th>
                    <th className="p-4">Kategori & Şube</th>
                    <th className="p-4">Açıklama</th>
                    <th className="p-4">Ödeme Yöntemi</th>
                    <th className="p-4">Tutar</th>
                    <th className="p-4 pr-6">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/20 transition-colors text-sm">
                      <td className="p-4 pl-6">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl border ${
                          t.type === 'INCOME' 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-rose-50 border-rose-100 text-rose-700'
                        }`}>
                          {t.type === 'INCOME' ? 'Gelir' : 'Gider'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-800">{t.category.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5 mt-0.5">
                          <MapPin size={10} className="text-gray-400" /> {t.locationName}
                        </div>
                        {t.staff && (
                          <div className="text-[10px] text-gray-400 font-light flex items-center gap-0.5 mt-0.5">
                            <User size={10} /> {t.staff.name}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-500 max-w-[200px] truncate" title={t.description || ''}>
                        {t.description || '-'}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          {getMethodIcon(t.paymentMethod)}
                          {t.paymentMethod === 'CASH' ? 'Nakit' : t.paymentMethod === 'CARD' ? 'Kart' : 'Havale'}
                        </span>
                      </td>
                      <td className={`p-4 font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ₺{parseFloat(t.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 pr-6 text-xs text-gray-400">
                        {new Date(t.date).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sağ Sütun: Personel Performans & Hakediş (4/12) */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Users className="text-[var(--color-rose-600)]" size={20} />
            <div>
              <h3 className="font-bold text-base text-gray-800">Personel Hakedişleri</h3>
              <p className="text-[10px] text-gray-400">Çalışanların toplam performansı ve biriken komisyonları.</p>
            </div>
          </div>

          {staffPayouts.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 italic">
              Henüz tamamlanmış hizmet randevusu bulunmuyor.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {staffPayouts.map((st) => (
                <div key={st.staffId} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-sm text-gray-800">{st.name}</span>
                    <span className="text-xs bg-[var(--color-rose-50)] text-[var(--color-rose-700)] font-bold px-2 py-0.5 rounded-full">
                      {st.appointmentCount} Randevu
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400 mb-0.5">Üretilen Ciro</p>
                      <p className="font-semibold text-gray-700">₺{st.totalRevenue.toLocaleString('tr-TR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 mb-0.5">Kazanılan Komisyon</p>
                      <p className="font-black text-[var(--color-rose-600)]">₺{st.commissionEarned.toLocaleString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Entry Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-serif font-bold text-gray-950 mb-2 flex items-center gap-1.5">
              <Sparkles size={20} className="text-[var(--color-rose-600)]" />
              Muhasebe Hareketi Ekle
            </h3>
            <p className="text-xs text-gray-400 mb-6">Yeni bir kasa gelir veya gider hareketi kaydedin.</p>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-2xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray-700">
              {/* Type Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">İşlem Türü</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-gray-200 cursor-pointer font-bold transition-all hover:bg-emerald-50/20 has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-500 has-[:checked]:text-emerald-700">
                    <input type="radio" name="type" value="INCOME" defaultChecked className="hidden" />
                    <TrendingUp size={16} /> Gelir
                  </label>
                  <label className="flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-gray-200 cursor-pointer font-bold transition-all hover:bg-rose-50/20 has-[:checked]:bg-rose-50 has-[:checked]:border-rose-500 has-[:checked]:text-rose-700">
                    <input type="radio" name="type" value="EXPENSE" className="hidden" />
                    <TrendingDown size={16} /> Gider
                  </label>
                </div>
              </div>

              {/* Location Select (Required) */}
              <div>
                <label htmlFor="locationId" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">İlişkili Şube *</label>
                <select
                  id="locationId"
                  name="locationId"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                >
                  <option value="">Şube Seçiniz</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryName" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Kategori Adı</label>
                <input
                  type="text"
                  id="categoryName"
                  name="categoryName"
                  required
                  placeholder="Örn: Hizmet Geliri, Kira, Ürün Alımı"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Tutar (₺)</label>
                <input
                  type="number"
                  step="0.01"
                  id="amount"
                  name="amount"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs font-bold"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Ödeme Yöntemi</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                >
                  <option value="CASH">Nakit</option>
                  <option value="CARD">Banka/Kredi Kartı</option>
                  <option value="TRANSFER">Havale/EFT</option>
                </select>
              </div>

              {/* Staff Select (Optional) */}
              <div>
                <label htmlFor="staffId" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">İlişkili Çalışan (İsteğe Bağlı)</label>
                <select
                  id="staffId"
                  name="staffId"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                >
                  <option value="">Çalışan Seçilmedi</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Açıklama</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  placeholder="İşleme dair açıklama..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-white transition-all text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gray-950 hover:bg-black disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {loading ? 'KAYDEDİLİYOR...' : 'HAREKETİ KAYDET'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
