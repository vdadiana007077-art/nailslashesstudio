"use client";

import { useState } from 'react';
import { createGiftCard, updateGiftCard, deleteGiftCard } from '@/app/actions/giftcard';
import { GiftCardStatus } from '@prisma/client';
import { 
  Plus, 
  Search, 
  Calendar, 
  Gift, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  X,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Check,
  CreditCard
} from 'lucide-react';

interface GiftCardItem {
  id: string;
  code: string;
  amount: number;
  balance: number;
  expiryDate: string | null;
  status: GiftCardStatus;
  createdAt: string;
}

interface GiftCardsClientProps {
  initialGiftCards: GiftCardItem[];
}

export default function GiftCardsClient({ initialGiftCards }: GiftCardsClientProps) {
  const [giftCards, setGiftCards] = useState<GiftCardItem[]>(initialGiftCards);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal durumları
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<GiftCardItem | null>(null);
  
  // Form inputları
  const [code, setCode] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [status, setStatus] = useState<GiftCardStatus>('ACTIVE');

  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingCard(null);
    // Rastgele 12 haneli hediye kartı kodu oluştur
    const randomCode = 'GC-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setCode(randomCode);
    setAmount('');
    setExpiryDate('');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card: GiftCardItem) => {
    setEditingCard(card);
    setCode(card.code);
    setAmount(card.amount.toString());
    setBalance(card.balance.toString());
    setExpiryDate(card.expiryDate || '');
    setStatus(card.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData();
    formData.append('code', code);
    formData.append('amount', amount);
    formData.append('balance', editingCard ? balance : amount); // Oluşturulurken bakiye = tutardır
    formData.append('expiryDate', expiryDate);
    formData.append('status', status);

    let result;
    if (editingCard) {
      result = await updateGiftCard(editingCard.id, formData);
    } else {
      result = await createGiftCard(formData);
    }

    setFormLoading(false);

    if (result.success) {
      if (editingCard) {
        setGiftCards(prev => prev.map(c => c.id === editingCard.id ? {
          ...c,
          balance: parseFloat(balance),
          expiryDate: expiryDate || null,
          status
        } : c));
        showFeedback('success', 'Hediye kartı başarıyla güncellendi.');
      } else if (result.data) {
        const newC = result.data as any;
        setGiftCards(prev => [{
          id: newC.id,
          code: newC.code,
          amount: Number(newC.amount),
          balance: Number(newC.balance),
          expiryDate: newC.expiryDate ? new Date(newC.expiryDate).toISOString().split('T')[0] : null,
          status: newC.status,
          createdAt: newC.createdAt
        }, ...prev]);
        showFeedback('success', 'Hediye kartı başarıyla oluşturuldu.');
      }
      setIsModalOpen(false);
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hediye kartını pasifleştirmek (soft delete) istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deleteGiftCard(id);
    setLoadingId(null);

    if (result.success) {
      setGiftCards(prev => prev.map(c => c.id === id ? { ...c, status: 'EXPIRED' as GiftCardStatus } : c));
      showFeedback('success', 'Hediye kartı pasifleştirildi (soft-deleted).');
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const filteredGiftCards = giftCards.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusConfig = {
    ACTIVE: { label: 'Aktif', color: 'bg-green-50 text-green-700 border-green-200' },
    USED: { label: 'Kullanıldı', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    EXPIRED: { label: 'Süresi Doldu / İptal', color: 'bg-red-50 text-red-700 border-red-200' },
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
            placeholder="Kart kodu ile ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
          />
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Yeni Kart Oluştur
        </button>
      </div>

      {/* Tablo Listesi */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Hediye Kartı Kodu</th>
                <th className="py-4 px-6">Tutar & Bakiye</th>
                <th className="py-4 px-6">Son Kullanma</th>
                <th className="py-4 px-6">Durum</th>
                <th className="py-4 px-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredGiftCards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400 font-medium">
                    Kayıtlı hediye kartı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredGiftCards.map((card) => {
                  const isExpired = card.expiryDate ? new Date(card.expiryDate) < new Date() : false;
                  const displayStatus = isExpired ? 'EXPIRED' : card.status;
                  return (
                    <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-2 font-mono font-bold text-gray-800 bg-gray-50 border border-gray-200 px-3 py-1 rounded-xl w-fit text-sm">
                          <CreditCard size={14} className="text-gray-400" />
                          {card.code}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{card.balance} TL</span>
                          <span className="text-xs text-gray-400">İlk Tutar: {card.amount} TL</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-xs">
                        {card.expiryDate ? (
                          <span className="flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            {card.expiryDate}
                          </span>
                        ) : (
                          <span className="text-gray-400">Süresiz</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${statusConfig[displayStatus].color}`}>
                          {statusConfig[displayStatus].label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(card)}
                            disabled={loadingId === card.id}
                            className="p-1.5 rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition-colors"
                            title="Bakiye / Durum Düzenle"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            onClick={() => handleDelete(card.id)}
                            disabled={loadingId === card.id || card.status === 'EXPIRED'}
                            className="p-1.5 rounded-lg border text-red-600 border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Kartı İptal Et (Soft Delete)"
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
      </div>

      {/* Modal - Ekleme / Düzenleme */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-base font-bold text-gray-900">
                {editingCard ? 'Hediye Kartını Düzenle' : 'Yeni Hediye Kartı Oluştur'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Kod */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kart Kodu</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="GC-XXXX-XXXX"
                  disabled={!!editingCard} // Düzenlerken kod değiştirilemez
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white uppercase font-mono font-bold disabled:opacity-75"
                />
              </div>

              {/* Tutar */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">İlk Tutar (TL)</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!!editingCard} // Düzenlerken ilk tutar değiştirilemez
                  placeholder="500"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white disabled:opacity-75"
                />
              </div>

              {/* Bakiye (Sadece Düzenlerken Gösterilir) */}
              {editingCard && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kalan Bakiye (TL)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={parseFloat(amount)}
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="250"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                  />
                </div>
              )}

              {/* Son Kullanma Tarihi */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Son Kullanma Tarihi (Opsiyonel)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                />
              </div>

              {/* Durum (Sadece Düzenlerken Gösterilir) */}
              {editingCard && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kart Durumu</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as GiftCardStatus)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                  >
                    <option value="ACTIVE">Aktif (Kullanılabilir)</option>
                    <option value="USED">Tümü Kullanıldı (USED)</option>
                    <option value="EXPIRED">İptal Edildi / Süresi Doldu (EXPIRED)</option>
                  </select>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
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
                  className="bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {formLoading ? 'Kaydediliyor...' : editingCard ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
