"use client";

import { useState } from 'react';
import { logoutCustomer } from '@/app/actions/customerAuth';
import { LogOut, Calendar, Clock, DollarSign, CheckCircle, AlertTriangle, User, UserCheck, X, CreditCard, Banknote, Landmark, Loader2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { updateAppointmentStatusByStaff } from '@/app/actions/staff-actions';
import { ApptStatus, PaymentMethod } from '@prisma/client';

interface StaffDashboardData {
  staff: {
    id: string;
    name: string;
    image: string | null;
    specialty: string | null;
  };
  todayAppointments: any[];
  upcomingAppointments: any[];
  performance: {
    monthlyCompletedCount: number;
    monthlyEarnings: number;
    dailyCompletedCount: number;
    dailyEarnings: number;
  };
}

interface StaffDashboardClientProps {
  initialData: StaffDashboardData;
  locale: string;
}

export default function StaffDashboardClient({ initialData, locale }: StaffDashboardClientProps) {
  const { staff, todayAppointments, upcomingAppointments, performance } = initialData;

  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Checkout States
  const [isCheckout, setIsCheckout] = useState(false);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // Tab State
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const filteredAppointments = todayAppointments.filter(appt => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'COMPLETED') return appt.status === 'COMPLETED';
    if (activeTab === 'PENDING') return ['PENDING', 'CONFIRMED', 'ARRIVED', 'STARTED'].includes(appt.status);
    return true;
  });

  const handleLogout = async () => {
    await logoutCustomer();
    window.location.href = `/${locale}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ARRIVED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'STARTED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Beklemede';
      case 'CONFIRMED': return 'Onaylandı';
      case 'ARRIVED': return 'Geldi';
      case 'STARTED': return 'İşlemde';
      case 'COMPLETED': return 'Tamamlandı';
      default: return status;
    }
  };

  const handleStatusUpdate = async (status: ApptStatus) => {
    if (!selectedAppt) return;
    setLoadingAction(true);
    const res = await updateAppointmentStatusByStaff(selectedAppt.id, status);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
      setLoadingAction(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setLoadingAction(true);
    const res = await updateAppointmentStatusByStaff(
      selectedAppt.id, 
      'COMPLETED', 
      finalPrice, 
      paymentMethod
    );
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
      setLoadingAction(false);
    }
  };

  const openApptModal = (appt: any) => {
    if (appt.status === 'COMPLETED') return; // Tamamlananlara işlem yapılmaz
    setSelectedAppt(appt);
    setIsCheckout(false);
    setFinalPrice(appt.price);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 rounded-b-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl border-2 border-white shadow-md overflow-hidden">
              {staff.image ? (
                <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
              ) : (
                staff.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hoş Geldiniz</p>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{staff.name}</h1>
              {staff.specialty && <p className="text-xs text-blue-600 font-medium">{staff.specialty}</p>}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-4">
        
        {/* PERFORMANS ÖZETİ (Günlük & Aylık) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle size={16} />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bugün İşlem</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">{performance.dailyCompletedCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center relative">
            <Link href="/tr/staff/cash" className="absolute inset-0 z-10"></Link>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <DollarSign size={16} />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bugün Üretim</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">₺{performance.dailyEarnings.toLocaleString('tr-TR')}</p>
            <p className="text-[9px] text-indigo-500 font-bold mt-1 uppercase tracking-wider flex items-center gap-0.5"><Wallet size={10} /> Kasa Git</p>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Aylık İşlem</p>
            <p className="text-sm font-black text-gray-900 mt-0.5">{performance.monthlyCompletedCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Aylık Üretim</p>
            <p className="text-sm font-black text-gray-900 mt-0.5">₺{performance.monthlyEarnings.toLocaleString('tr-TR')}</p>
          </div>
        </div>

        {/* BUGÜNÜN RANDEVULARI */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5 mb-3 px-1">
            <Clock size={16} className="text-blue-600" />
            Bugünkü Randevular
          </h2>

          {/* TABLAR */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 hide-scrollbar">
            <button 
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'ALL' ? 'bg-gray-800 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Tümü
            </button>
            <button 
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'PENDING' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
            >
              Beklemede
            </button>
            <button 
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
            >
              Tamamlandı
            </button>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
              <Calendar size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-500">Bu statüde randevunuz bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((appt) => (
                <div 
                  key={appt.id} 
                  onClick={() => openApptModal(appt)}
                  className={`bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all ${appt.status !== 'COMPLETED' ? 'cursor-pointer hover:border-[var(--color-primary-300)] hover:shadow-md' : 'opacity-70'}`}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    appt.status === 'PENDING' ? 'bg-amber-400' :
                    appt.status === 'CONFIRMED' ? 'bg-blue-400' :
                    appt.status === 'ARRIVED' ? 'bg-indigo-400' :
                    appt.status === 'COMPLETED' ? 'bg-gray-400' :
                    'bg-emerald-400'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{appt.serviceName}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                        <User size={12} /> {appt.customerName}
                      </p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getStatusColor(appt.status)}`}>
                      {getStatusText(appt.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                      <Clock size={14} className="text-gray-400" />
                      {appt.startTime} - {appt.endTime}
                    </div>
                    <div className="text-sm font-black text-gray-900">
                      ₺{appt.price.toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* YAKLAŞAN RANDEVULAR */}
        <div className="pt-2">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5 mb-3 px-1">
            <Calendar size={16} className="text-indigo-600" />
            Yaklaşan Randevular
          </h2>

          {upcomingAppointments.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
              <p className="text-xs font-medium text-gray-500">Yaklaşan randevunuz bulunmuyor.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
              {upcomingAppointments.map((appt) => (
                <div key={appt.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex flex-col items-center justify-center border border-gray-100 shrink-0">
                      <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">{
                        new Date(appt.date).toLocaleDateString('tr-TR', { weekday: 'short' })
                      }</span>
                      <span className="text-sm font-black text-gray-700 leading-none mt-0.5">
                        {new Date(appt.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 leading-tight">{appt.serviceName}</h4>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <User size={10} /> {appt.customerName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-gray-700">{appt.startTime}</div>
                    <div className="text-[9px] font-medium text-gray-400 mt-0.5">{getStatusText(appt.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* İŞLEM MODALI */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            
            <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <h3 className="font-bold text-gray-900 text-lg">Randevu İşlemi</h3>
              <button 
                onClick={() => setSelectedAppt(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(selectedAppt.status)} uppercase tracking-widest`}>
                    {getStatusText(selectedAppt.status)}
                  </span>
                  <div className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    {selectedAppt.startTime}
                  </div>
                </div>
                <h4 className="font-black text-gray-900 text-lg leading-tight mb-1">{selectedAppt.serviceName}</h4>
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                  <User size={14} /> {selectedAppt.customerName}
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-widest">Rezervasyon Fiyatı</span>
                  <span className="font-black text-blue-900 text-lg">₺{selectedAppt.price.toLocaleString('tr-TR')}</span>
                </div>
              </div>

              {!isCheckout ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Durum Güncelle</h4>
                  
                  {selectedAppt.status !== 'ARRIVED' && selectedAppt.status !== 'STARTED' && (
                    <button 
                      onClick={() => handleStatusUpdate('ARRIVED')}
                      disabled={loadingAction}
                      className="w-full p-4 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded-2xl hover:bg-indigo-100 transition-colors flex items-center gap-3"
                    >
                      <UserCheck size={20} /> Müşteri Geldi
                    </button>
                  )}

                  {selectedAppt.status !== 'STARTED' && (
                    <button 
                      onClick={() => handleStatusUpdate('STARTED')}
                      disabled={loadingAction}
                      className="w-full p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-100 transition-colors flex items-center gap-3"
                    >
                      <CheckCircle size={20} /> İşleme Başlandı
                    </button>
                  )}

                  <button 
                    onClick={() => setIsCheckout(true)}
                    className="w-full p-4 mt-6 bg-[var(--color-primary-500)] text-white font-black rounded-2xl hover:bg-[var(--color-primary-600)] transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    <DollarSign size={20} /> İşlemi Bitir & Tahsilat Al
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3">
                    <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-rose-800 leading-relaxed">
                      Ekstra işlem yaptıysanız alınan nihai tutarı aşağıdan değiştirebilirsiniz. Bu tutar direkt olarak muhasebeye (kasa girişi) işlenecektir.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Alınan Toplam Tutar (₺)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black text-lg">₺</span>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        required
                        value={finalPrice}
                        onChange={(e) => setFinalPrice(parseFloat(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-black text-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-300)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Ödeme Yöntemi</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                      >
                        <Banknote size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Nakit</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod('CARD')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${paymentMethod === 'CARD' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                      >
                        <CreditCard size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Kart</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod('TRANSFER')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${paymentMethod === 'TRANSFER' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                      >
                        <Landmark size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Havale</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsCheckout(false)}
                      className="flex-1 py-4 border border-gray-200 text-gray-600 font-bold rounded-2xl bg-white hover:bg-gray-50 transition-colors uppercase tracking-widest text-xs"
                    >
                      Geri
                    </button>
                    <button 
                      type="submit"
                      disabled={loadingAction}
                      className="flex-[2] py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg disabled:opacity-70"
                    >
                      {loadingAction ? <Loader2 size={18} className="animate-spin" /> : 'Tahsilatı Onayla'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
