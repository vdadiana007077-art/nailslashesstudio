"use client";

import { useState, useEffect } from 'react';
import { X, DollarSign, Wallet, CreditCard, ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { getStaffFinanceSummary, receiveStaffCashDrop, payStaffPayout } from '@/app/actions/staffFinance';
import { PaymentMethod } from '@prisma/client';

type StaffFinanceModalProps = {
  staff: { id: string; name: string };
  onClose: () => void;
};

export default function StaffFinanceModal({ staff, onClose }: StaffFinanceModalProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'cashDrop' | 'payout'>('summary');
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState('');

  // Sadece Payout için
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    const result = await getStaffFinanceSummary(staff.id);
    if (result.success) {
      setSummary(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary();
  }, [staff.id]);

  const handleCashDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsSubmitting(true);
    const result = await receiveStaffCashDrop({
      staffId: staff.id,
      adminId: 'admin', // Gerçek uygulamada session'dan alınır
      amount: Number(amount),
      paymentMethod,
      description: notes
    });
    setIsSubmitting(false);

    if (result.success) {
      alert('Kasa teslim alma işlemi başarılı!');
      setAmount('');
      setNotes('');
      fetchSummary();
      setActiveTab('summary');
    } else {
      alert((result as any).error || 'İşlem başarısız');
    }
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsSubmitting(true);
    const result = await payStaffPayout({
      staffId: staff.id,
      adminId: 'admin',
      amount: Number(amount),
      paymentMethod,
      description: notes,
      periodStart: periodStart ? new Date(periodStart) : undefined,
      periodEnd: periodEnd ? new Date(periodEnd) : undefined
    });
    setIsSubmitting(false);

    if (result.success) {
      alert('Hakediş ödeme işlemi başarılı!');
      setAmount('');
      setNotes('');
      setPeriodStart('');
      setPeriodEnd('');
      fetchSummary();
      setActiveTab('summary');
    } else {
      alert((result as any).error || 'İşlem başarısız');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{staff.name} - Finans Yönetimi</h2>
            <p className="text-sm text-gray-500 mt-1">Personel Kasa ve Hakediş İşlemleri</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          <button
            className={`py-4 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'summary' ? 'border-[var(--color-rose-500)] text-[var(--color-rose-600)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('summary')}
          >
            Kasa Özeti
          </button>
          <button
            className={`py-4 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'cashDrop' ? 'border-[var(--color-rose-500)] text-[var(--color-rose-600)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('cashDrop')}
          >
            Kasa Teslim Al
          </button>
          <button
            className={`py-4 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'payout' ? 'border-[var(--color-rose-500)] text-[var(--color-rose-600)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('payout')}
          >
            Hakediş Öde
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[var(--color-rose-500)] mb-4" />
              <p className="text-gray-500 font-medium">Finans verileri yükleniyor...</p>
            </div>
          ) : (
            <>
              {activeTab === 'summary' && summary && (
                <div className="space-y-6">
                  <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100 flex items-center justify-between">
                    <div>
                      <p className="text-rose-600 font-medium text-sm mb-1">Kasada Kalan Bakiye (balanceAfter)</p>
                      <h3 className="text-3xl font-bold text-gray-900">{summary.balanceAfter} ₺</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-rose-200 flex items-center justify-center text-rose-700">
                      <Wallet size={24} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowDownRight size={16} className="text-emerald-500" />
                        <span className="text-gray-600 text-sm font-medium">Toplam Tahsilat</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{summary.totalCollected} ₺</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUpRight size={16} className="text-blue-500" />
                        <span className="text-gray-600 text-sm font-medium">Teslim Edilen Kasa</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{summary.totalDropped} ₺</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={16} className="text-emerald-500" />
                        <span className="text-gray-600 text-sm font-medium">Nakit Tahsilat</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{summary.cashCollected} ₺</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={16} className="text-indigo-500" />
                        <span className="text-gray-600 text-sm font-medium">Kart Tahsilat</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{summary.cardCollected} ₺</p>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 flex items-center justify-between">
                    <div>
                      <p className="text-orange-700 font-medium text-sm mb-1">Teslim Bekleyen Nakit</p>
                      <h3 className="text-xl font-bold text-orange-900">{summary.pendingDrop} ₺</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab('cashDrop')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      Teslim Al
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'cashDrop' && (
                <form onSubmit={handleCashDrop} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teslim Alınacak Tutar (₺)</label>
                    <input 
                      type="number" required min="0" step="0.01"
                      value={amount} onChange={e => setAmount(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-rose-400)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Tipi</label>
                    <select 
                      value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-rose-400)] outline-none bg-white"
                    >
                      <option value="CASH">Nakit</option>
                      <option value="TRANSFER">Havale / EFT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea 
                      value={notes} onChange={e => setNotes(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-rose-400)] outline-none h-24 resize-none"
                      placeholder="Örn: Gün sonu kasa teslimi"
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">İptal</button>
                    <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-[var(--color-rose-600)] text-white font-medium rounded-xl hover:bg-[var(--color-rose-700)] transition-colors flex items-center gap-2">
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
                      Teslim Al
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'payout' && (
                <form onSubmit={handlePayout} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dönem Başlangıç</label>
                      <input 
                        type="date"
                        value={periodStart} onChange={e => setPeriodStart(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-rose-400)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dönem Bitiş</label>
                      <input 
                        type="date"
                        value={periodEnd} onChange={e => setPeriodEnd(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-rose-400)] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ödenecek Tutar (₺)</label>
                    <input 
                      type="number" required min="0" step="0.01"
                      value={amount} onChange={e => setAmount(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-rose-400)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Tipi</label>
                    <select 
                      value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-rose-400)] outline-none bg-white"
                    >
                      <option value="CASH">Nakit</option>
                      <option value="TRANSFER">Havale / EFT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea 
                      value={notes} onChange={e => setNotes(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-rose-400)] outline-none h-24 resize-none"
                      placeholder="Örn: Haziran 1. hafta hakedişi"
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">İptal</button>
                    <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2">
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <DollarSign size={18} />}
                      Hakedişi Öde
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
