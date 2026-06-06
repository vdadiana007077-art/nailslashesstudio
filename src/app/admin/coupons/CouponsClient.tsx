"use client";

import { useState } from 'react';
import { createCoupon, updateCoupon, deleteCoupon } from '@/app/actions/coupon';
import { DiscountType } from '@prisma/client';
import { 
  Plus, 
  Search, 
  Calendar, 
  Ticket, 
  Percent, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  X,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Check
} from 'lucide-react';

interface CouponItem {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

interface CouponsClientProps {
  initialCoupons: CouponItem[];
}

export default function CouponsClient({ initialCoupons }: CouponsClientProps) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal durumları
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  
  // Form inputları
  const [code, setCode] = useState<string>('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [value, setValue] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setValue('');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setEndDate(nextMonth.toISOString().split('T')[0]);
    setUsageLimit('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setValue(coupon.value.toString());
    setStartDate(coupon.startDate);
    setEndDate(coupon.endDate);
    setUsageLimit(coupon.usageLimit?.toString() || '');
    setIsActive(coupon.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData();
    formData.append('code', code);
    formData.append('discountType', discountType);
    formData.append('value', value);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('usageLimit', usageLimit);
    formData.append('isActive', isActive.toString());

    let result;
    if (editingCoupon) {
      result = await updateCoupon(editingCoupon.id, formData);
    } else {
      result = await createCoupon(formData);
    }

    setFormLoading(false);

    if (result.success) {
      if (editingCoupon) {
        setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? {
          ...c,
          code: code.toUpperCase().trim(),
          discountType,
          value: parseFloat(value),
          startDate,
          endDate,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          isActive
        } : c));
        showFeedback('success', 'Kupon başarıyla güncellendi.');
      } else if (result.data) {
        const newC = result.data as any;
        setCoupons(prev => [{
          id: newC.id,
          code: newC.code,
          discountType: newC.discountType,
          value: Number(newC.value),
          startDate: new Date(newC.startDate).toISOString().split('T')[0],
          endDate: new Date(newC.endDate).toISOString().split('T')[0],
          usageLimit: newC.usageLimit,
          usageCount: newC.usageCount,
          isActive: newC.isActive,
          createdAt: newC.createdAt
        }, ...prev]);
        showFeedback('success', 'Kupon başarıyla oluşturuldu.');
      }
      setIsModalOpen(false);
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const formData = new FormData();
    const c = coupons.find(item => item.id === id)!;
    formData.append('code', c.code);
    formData.append('discountType', c.discountType);
    formData.append('value', c.value.toString());
    formData.append('startDate', c.startDate);
    formData.append('endDate', c.endDate);
    formData.append('usageLimit', c.usageLimit?.toString() || '');
    formData.append('isActive', (!currentStatus).toString());

    const result = await updateCoupon(id, formData);
    setLoadingId(null);

    if (result.success) {
      setCoupons(prev => prev.map(item => item.id === id ? { ...item, isActive: !currentStatus } : item));
      showFeedback('success', `Kupon durumu ${!currentStatus ? 'aktif' : 'pasif'} yapıldı.`);
    } else {
      showFeedback('error', result.error || 'İşlem başarısız oldu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kuponu pasifleştirmek istediğinize emin misiniz?')) return;
    setLoadingId(id);
    const result = await deleteCoupon(id);
    setLoadingId(null);

    if (result.success) {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: false } : c));
      showFeedback('success', 'Kupon pasifleştirildi (soft delete).');
    } else {
      showFeedback('error', result.error || 'Pasifleştirme başarısız oldu.');
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Üst İşlem Çubuğu */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Kupon kodu ile ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
          />
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Yeni Kupon Oluştur
        </button>
      </div>

      {/* Tablo Listesi */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Kupon Kodu</th>
                <th className="py-4 px-6">İndirim Türü & Değer</th>
                <th className="py-4 px-6">Geçerlilik Tarihi</th>
                <th className="py-4 px-6">Limit / Kullanım</th>
                <th className="py-4 px-6">Durum</th>
                <th className="py-4 px-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400 font-medium">
                    Kayıtlı kupon bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.endDate) < new Date();
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-2 font-mono font-bold text-[var(--color-rose-700)] bg-[var(--color-rose-50)] border border-[var(--color-rose-100)] px-2.5 py-1 rounded-lg w-fit text-sm">
                          <Ticket size={14} />
                          {coupon.code}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-1 font-semibold text-gray-900">
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <>
                              <Percent size={14} className="text-gray-400" />
                              {coupon.value} İndirim
                            </>
                          ) : (
                            <>
                              <DollarSign size={14} className="text-gray-400" />
                              {coupon.value} TL İndirim
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          {coupon.startDate} / {coupon.endDate}
                        </span>
                        {isExpired && (
                          <span className="text-red-500 font-bold block mt-0.5">Süresi Doldu</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs font-medium text-gray-600">
                        {coupon.usageLimit ? (
                          <span>{coupon.usageCount} / {coupon.usageLimit} Kullanım</span>
                        ) : (
                          <span>{coupon.usageCount} Kullanım (Limitsiz)</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                          coupon.isActive && !isExpired
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {coupon.isActive && !isExpired ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                            disabled={loadingId === coupon.id}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              coupon.isActive 
                                ? 'text-gray-400 border-gray-200 hover:text-gray-600 hover:bg-gray-50' 
                                : 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100'
                            }`}
                            title={coupon.isActive ? 'Pasife Al' : 'Aktife Al'}
                          >
                            {coupon.isActive ? <Lock size={15} /> : <Unlock size={15} />}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(coupon)}
                            disabled={loadingId === coupon.id}
                            className="p-1.5 rounded-lg border text-gray-600 border-gray-200 hover:bg-gray-50 transition-colors"
                            title="Düzenle"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            onClick={() => handleDelete(coupon.id)}
                            disabled={loadingId === coupon.id}
                            className="p-1.5 rounded-lg border text-red-600 border-red-200 hover:bg-red-50 transition-colors"
                            title="Kuponu Pasifleştir (Soft Delete)"
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
                {editingCoupon ? 'Kuponu Düzenle' : 'Yeni Kupon Oluştur'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Kod */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kupon Kodu</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="YENIYIL2026"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white uppercase font-mono font-bold"
                />
              </div>

              {/* İndirim Türü */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">İndirim Türü</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                >
                  <option value="PERCENTAGE">Yüzde (%)</option>
                  <option value="FIXED">Sabit Tutar (TL)</option>
                </select>
              </div>

              {/* İndirim Değeri */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">İndirim Değeri</label>
                <input
                  type="number"
                  required
                  min={1}
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={discountType === 'PERCENTAGE' ? '20' : '100'}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                />
              </div>

              {/* Başlangıç & Bitiş Tarihleri */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Başlangıç</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Bitiş</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                  />
                </div>
              </div>

              {/* Kullanım Limiti */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kullanım Limiti (Opsiyonel)</label>
                <input
                  type="number"
                  min={1}
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Örn: 100 (Boş bırakılırsa limitsiz)"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                />
              </div>

              {/* Aktiflik Durumu (Sadece düzenlemede gösterilebilir veya her zaman) */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[var(--color-rose-600)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Kupon Aktif Olsun</label>
              </div>

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
                  {formLoading ? 'Kaydediliyor...' : editingCoupon ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
