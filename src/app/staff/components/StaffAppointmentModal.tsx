"use client";

import { useState } from 'react';
import { X, Clock, User, DollarSign, CheckCircle, XCircle, AlertCircle, CreditCard, ChevronRight } from 'lucide-react';
import { ApptStatus, PaymentMethod } from '@prisma/client';
import { 
  markArrived, 
  markStarted, 
  markCompleted, 
  markNoShow, 
  markCancelled 
} from '@/app/actions/staffAppointment';
import { collectAppointmentPayment } from '@/app/actions/staffFinance';

type StaffAppointmentModalProps = {
  appointment: any;
  staffId: string;
  onClose: () => void;
  onUpdate: () => void;
};

export default function StaffAppointmentModal({ appointment, staffId, onClose, onUpdate }: StaffAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Payment form states
  const [amount, setAmount] = useState<number | ''>(appointment.priceAtBooking ? Number(appointment.priceAtBooking) : (appointment.service?.price ? Number(appointment.service.price) : ''));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [slipNumber, setSlipNumber] = useState('');
  const [posInfo, setPosInfo] = useState('');
  const [notes, setNotes] = useState('');

  const handleStatusChange = async (actionFn: (id: string) => Promise<{success: boolean, error?: string}>) => {
    setLoading(true);
    const result = await actionFn(appointment.id);
    setLoading(false);
    
    if (result.success) {
      onUpdate();
    } else {
      alert(result.error || 'İşlem başarısız');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setLoading(true);
    const result = await collectAppointmentPayment({
      appointmentId: appointment.id,
      staffId: staffId,
      amount: Number(amount),
      paymentMethod,
      slipNumber: slipNumber || undefined,
      posInfo: posInfo || undefined,
      notes: notes || undefined
    });
    setLoading(false);

    if (result.success) {
      alert('Tahsilat başarıyla tamamlandı!');
      onUpdate();
      onClose();
    } else {
      alert((result as any).error || 'Tahsilat başarısız oldu');
    }
  };

  const formatTime = (timeStr: string) => timeStr.substring(0, 5);

  const getStatusText = (status: ApptStatus) => {
    switch (status) {
      case 'PENDING': return 'Bekliyor';
      case 'CONFIRMED': return 'Onaylandı';
      case 'ARRIVED': return 'Geldi';
      case 'STARTED': return 'Başladı';
      case 'COMPLETED': return 'Tamamlandı';
      case 'PAID': return 'Ödendi';
      case 'NO_SHOW': return 'Gelmedi';
      case 'CANCELLED': return 'İptal Edildi';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in duration-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Randevu Detayı</h2>
            <p className="text-sm text-[var(--color-rose-600)] font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--color-rose-500)] inline-block"></span>
              {getStatusText(appointment.status)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          
          {/* Info Card */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-rose-100)] text-[var(--color-rose-600)] rounded-full flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Müşteri</p>
                <p className="font-bold text-gray-800">{appointment.customerName || appointment.customer?.name}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-2 border-t border-gray-200">
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><Clock size={12}/> Zaman</p>
                <p className="font-semibold text-gray-800 mt-0.5">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><DollarSign size={12}/> Tutar</p>
                <p className="font-semibold text-[var(--color-rose-600)] mt-0.5">{appointment.priceAtBooking || appointment.service?.price} ₺</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-medium">Hizmet</p>
              <p className="font-semibold text-gray-800 mt-0.5">{appointment.service?.translations?.[0]?.name || 'Hizmet'}</p>
            </div>
          </div>

          {/* Actions */}
          {!showPaymentForm && appointment.status !== ApptStatus.PAID && appointment.status !== ApptStatus.CANCELLED && appointment.status !== ApptStatus.NO_SHOW && (
            <div className="space-y-3">
              
              {/* Tamamlandı butonu — sadece COMPLETED olmadıysa göster */}
              {appointment.status !== ApptStatus.COMPLETED && (
                <>
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Durum Güncelle</h3>
                  <button 
                    onClick={() => handleStatusChange(markCompleted)}
                    disabled={loading}
                    className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium py-3 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16}/> Tamamlandı
                  </button>
                </>
              )}

              {/* Ücret Tahsil Et — sadece COMPLETED ise aktif */}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button 
                  onClick={() => setShowPaymentForm(true)}
                  disabled={loading || (appointment.status !== ApptStatus.COMPLETED)}
                  className={`w-full font-bold py-4 px-4 rounded-xl transition-all flex justify-between items-center ${
                    appointment.status === ApptStatus.COMPLETED
                      ? 'bg-[var(--color-rose-500)] text-white hover:bg-[var(--color-rose-600)] shadow-lg shadow-rose-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-2"><CreditCard size={20}/> Ücret Tahsil Et</span>
                  <ChevronRight size={20}/>
                </button>
                {appointment.status !== ApptStatus.COMPLETED && (
                  <p className="text-center text-[10px] text-gray-400 mt-2">Önce randevuyu tamamlayın</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => handleStatusChange(markNoShow)}
                  disabled={loading}
                  className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-xl text-xs transition-colors"
                >
                  Gelmedi (No-Show)
                </button>
                <button 
                  onClick={() => handleStatusChange(markCancelled)}
                  disabled={loading}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-medium py-2 px-4 rounded-xl text-xs transition-colors"
                >
                  İptal Et
                </button>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {showPaymentForm && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <DollarSign size={20} className="text-[var(--color-rose-500)]"/>
                  Tahsilat Formu
                </h3>
                <button 
                  onClick={() => setShowPaymentForm(false)}
                  className="text-sm text-gray-500 hover:text-gray-800 font-medium"
                >
                  İptal
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tutar (₺)</label>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-200)] focus:border-[var(--color-rose-400)] transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ödeme Tipi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`py-3 rounded-xl border font-medium text-sm transition-all ${
                        paymentMethod === 'CASH' 
                          ? 'bg-[var(--color-rose-50)] border-[var(--color-rose-400)] text-[var(--color-rose-700)] shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Nakit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`py-3 rounded-xl border font-medium text-sm transition-all ${
                        paymentMethod === 'CARD' 
                          ? 'bg-[var(--color-rose-50)] border-[var(--color-rose-400)] text-[var(--color-rose-700)] shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Kredi Kartı
                    </button>
                  </div>
                </div>

                {paymentMethod === 'CARD' && (
                  <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Slip No</label>
                      <input 
                        type="text" 
                        value={slipNumber}
                        onChange={(e) => setSlipNumber(e.target.value)}
                        placeholder="Zorunlu değil"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-200)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">POS Bilgisi</label>
                      <input 
                        type="text" 
                        value={posInfo}
                        onChange={(e) => setPosInfo(e.target.value)}
                        placeholder="Örn: Garanti"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-200)]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Açıklama / Not</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-200)]"
                    placeholder="Eklemek istediğiniz notlar..."
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--color-rose-500)] text-white hover:bg-[var(--color-rose-600)] font-bold py-4 rounded-xl transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Ödemeyi Tamamla
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <AlertCircle size={10}/> Bu işlem personelin bakiyesine ve komisyonuna işlenecektir.
                  </p>
                </div>
              </form>
            </div>
          )}

          {appointment.status === ApptStatus.PAID && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} />
              </div>
              <h3 className="font-bold text-green-800 text-lg mb-1">Ödeme Alındı</h3>
              <p className="text-green-600 text-sm">Bu randevunun tahsilatı tamamlanmıştır.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
