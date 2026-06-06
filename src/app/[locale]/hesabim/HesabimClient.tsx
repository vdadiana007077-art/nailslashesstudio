"use client";

import { useState, useEffect } from 'react';
import { cancelAppointment, rescheduleAppointment } from '@/app/actions/booking';
import { getAvailableTimeSlots } from '@/app/actions/availability';
import { logoutCustomer, getCurrentCustomer } from '@/app/actions/customerAuth';
import { 
  Calendar, Clock, User, Mail, Phone, LogOut, CheckCircle, AlertTriangle, X, 
  Scissors, Loader2, RefreshCw, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface HesabimClientProps {
  customer: any;
  locale: string;
}

export default function HesabimClient({ customer: initialCustomer, locale }: HesabimClientProps) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Reschedule Modal states
  const [rescheduleAppt, setRescheduleAppt] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<string | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const upcomingAppointments = customer.appointments.filter((a: any) => {
    const apptDate = new Date(a.date);
    return apptDate >= new Date(todayStr) && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(a.status);
  });

  const pastAppointments = customer.appointments.filter((a: any) => {
    const apptDate = new Date(a.date);
    return apptDate < new Date(todayStr) || ['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(a.status);
  });

  const refreshCustomer = async () => {
    const data = await getCurrentCustomer();
    if (data) setCustomer(data);
  };

  const handleCancel = async (apptId: string) => {
    if (!confirm('Randevunuzu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    setCancellingId(apptId);
    setError(null);
    setMsg(null);
    const res = await cancelAppointment(apptId);
    setCancellingId(null);
    if (res.success) {
      setMsg('Randevunuz başarıyla iptal edildi.');
      refreshCustomer();
    } else {
      setError(res.error || 'Randevu iptal edilirken bir hata oluştu.');
    }
  };

  const handleLogout = async () => {
    await logoutCustomer();
    window.location.href = `/${locale}`;
  };

  // Reschedule modal: Tarih seçildiğinde slotları çek
  useEffect(() => {
    if (!rescheduleAppt || !rescheduleDate) return;

    const fetchSlots = async () => {
      setRescheduleSlotsLoading(true);
      setRescheduleTime(null);
      const result = await getAvailableTimeSlots(
        rescheduleAppt.locationId || '',
        rescheduleAppt.serviceId || '',
        rescheduleDate,
        rescheduleAppt.staffId || 'ANY'
      );
      setRescheduleSlotsLoading(false);
      if (result.success && result.slots) {
        setRescheduleSlots(result.slots);
      } else {
        setRescheduleSlots([]);
      }
    };
    fetchSlots();
  }, [rescheduleDate, rescheduleAppt]);

  const handleReschedule = async () => {
    if (!rescheduleAppt || !rescheduleDate || !rescheduleTime) return;
    setRescheduleLoading(true);
    setError(null);
    setMsg(null);

    const res = await rescheduleAppointment(rescheduleAppt.id, rescheduleDate, rescheduleTime);
    setRescheduleLoading(false);

    if (res.success) {
      setMsg('Randevunuz başarıyla yeni tarihe ertelendi.');
      setRescheduleAppt(null);
      setRescheduleDate(null);
      setRescheduleTime(null);
      refreshCustomer();
    } else {
      setError(res.error || 'Randevu ertelenirken hata oluştu.');
    }
  };

  const getNext14Days = () => {
    const days = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; css: string; icon: any }> = {
      PENDING: { text: 'Beklemede', css: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },
      CONFIRMED: { text: 'Onaylandı', css: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
      CANCELLED: { text: 'İptal Edildi', css: 'bg-red-50 text-red-700 border-red-200', icon: X },
      COMPLETED: { text: 'Tamamlandı', css: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
      NO_SHOW: { text: 'Gelinmedi', css: 'bg-gray-100 text-gray-600 border-gray-200', icon: AlertTriangle },
      RESCHEDULED: { text: 'Ertelendi', css: 'bg-purple-50 text-purple-700 border-purple-200', icon: RefreshCw }
    };
    return labels[status] || { text: status, css: 'bg-gray-50 text-gray-700 border-gray-200', icon: AlertTriangle };
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  };

  return (
    <div className="min-h-screen bg-[#faf8f7]">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[var(--color-primary-600)] via-[var(--color-primary-500)] to-[#d4a3a3] text-white py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-2xl md:text-3xl font-bold uppercase text-white shadow-xl">
                {customer.name.substring(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold">{customer.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/80">
                  <span className="flex items-center gap-1.5"><Mail size={14} /> {customer.email}</span>
                  {customer.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {customer.phone}</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                href={`/${locale}/booking`}
                className="px-6 py-3 bg-[#3C2E2E] hover:bg-[#2D2121] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <Scissors size={16} /> Yeni Randevu
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur border border-white/20"
              >
                <LogOut size={16} /> Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 -mt-6">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-2xl flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600 cursor-pointer"><X size={16} /></button>
          </div>
        )}
        {msg && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-2xl flex items-center gap-2">
            <CheckCircle size={16} /> {msg}
            <button onClick={() => setMsg(null)} className="ml-auto text-emerald-400 hover:text-emerald-600 cursor-pointer"><X size={16} /></button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Toplam Randevu</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{customer.appointments.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Aktif Randevu</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{upcomingAppointments.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tamamlanan</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{customer.appointments.filter((a: any) => a.status === 'COMPLETED').length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">İptal Edilen</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{customer.appointments.filter((a: any) => a.status === 'CANCELLED').length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-4 text-sm font-bold transition-all cursor-pointer relative ${
                activeTab === 'upcoming' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Aktif Randevular ({upcomingAppointments.length})
              {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-rose-500)]"></div>}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-4 text-sm font-bold transition-all cursor-pointer relative ${
                activeTab === 'past' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Geçmiş ({pastAppointments.length})
              {activeTab === 'past' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-rose-500)]"></div>}
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'upcoming' && (
              upcomingAppointments.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar size={48} className="text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium text-sm">Aktif randevunuz bulunmuyor.</p>
                  <Link
                    href={`/${locale}/booking`}
                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md"
                  >
                    <Scissors size={14} /> Randevu Al
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appt: any) => {
                    const status = getStatusLabel(appt.status);
                    const StatusIcon = status.icon;
                    return (
                      <div key={appt.id} className="bg-white border border-gray-150 rounded-2xl p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                        {/* Status ribbon */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-rose-400)] rounded-r"></div>
                        
                        <div className="pl-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                            <div>
                              <h3 className="font-bold text-base text-gray-900">{appt.serviceName}</h3>
                              {appt.staffName && (
                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><User size={12} /> {appt.staffName}</p>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 w-fit ${status.css}`}>
                              <StatusIcon size={12} /> {status.text}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500 py-3 border-t border-gray-50">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Tarih</p>
                              <p className="font-semibold text-gray-700">{formatDate(appt.date)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Saat</p>
                              <p className="font-semibold text-gray-700">{appt.startTime} - {appt.endTime}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Süre</p>
                              <p className="font-semibold text-gray-700">{appt.endTime && appt.startTime ? 
                                `${(parseInt(appt.endTime.split(':')[0]) * 60 + parseInt(appt.endTime.split(':')[1])) - (parseInt(appt.startTime.split(':')[0]) * 60 + parseInt(appt.startTime.split(':')[1]))} dk` 
                                : '-'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Tutar</p>
                              <p className="font-bold text-[var(--color-rose-600)]">₺{parseFloat(appt.price).toLocaleString('tr-TR')}</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {(appt.status === 'PENDING' || appt.status === 'CONFIRMED' || appt.status === 'RESCHEDULED') && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                              <button
                                onClick={() => {
                                  setRescheduleAppt(appt);
                                  setRescheduleDate(null);
                                  setRescheduleTime(null);
                                  setRescheduleSlots([]);
                                }}
                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-[var(--color-rose-600)] font-bold text-[11px] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <RefreshCw size={13} /> Tarih / Saat Değiştir
                              </button>
                              <button
                                onClick={() => handleCancel(appt.id)}
                                disabled={cancellingId === appt.id}
                                className="px-4 py-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 text-red-600 font-bold text-[11px] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <X size={13} /> {cancellingId === appt.id ? 'İptal Ediliyor...' : 'Randevuyu İptal Et'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {activeTab === 'past' && (
              pastAppointments.length === 0 ? (
                <div className="text-center py-16">
                  <Clock size={48} className="text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium text-sm">Geçmiş randevunuz bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastAppointments.map((appt: any) => {
                    const status = getStatusLabel(appt.status);
                    const StatusIcon = status.icon;
                    return (
                      <div key={appt.id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-sm text-gray-700">{appt.serviceName}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(appt.date)} — {appt.startTime}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-600">₺{parseFloat(appt.price).toLocaleString('tr-TR')}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${status.css}`}>
                              <StatusIcon size={10} /> {status.text}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setRescheduleAppt(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden border border-gray-100"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="h-1 w-full bg-gradient-to-r from-[var(--color-rose-300)] via-[var(--color-rose-500)] to-[var(--color-rose-600)]"></div>
            
            <button
              onClick={() => setRescheduleAppt(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all cursor-pointer z-10"
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <RefreshCw size={20} className="text-[var(--color-rose-600)]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Randevu Tarih/Saat Değiştir</h3>
                  <p className="text-xs text-gray-400">{rescheduleAppt.serviceName}</p>
                </div>
              </div>

              {/* Tarih Seçimi */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Yeni Tarih Seçin</label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {getNext14Days().map((date, i) => {
                    const dateStr = date.toISOString().split('T')[0];
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRescheduleDate(dateStr)}
                        className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                          rescheduleDate === dateStr
                            ? 'bg-[var(--color-rose-500)] text-white shadow-md'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold opacity-70">{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
                        <span className="text-base font-bold">{date.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Saat Seçimi */}
              {rescheduleDate && (
                <div className="mb-6">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Yeni Saat Seçin</label>
                  {rescheduleSlotsLoading ? (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <Loader2 size={24} className="animate-spin text-[var(--color-rose-500)]" />
                      <span className="ml-2 text-xs">Müsait saatler kontrol ediliyor...</span>
                    </div>
                  ) : rescheduleSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                      {rescheduleSlots.map((time, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRescheduleTime(time)}
                          className={`py-2.5 rounded-xl font-bold transition-all text-sm cursor-pointer border ${
                            rescheduleTime === time
                              ? 'bg-[var(--color-rose-500)] text-white shadow-md border-[var(--color-rose-500)]'
                              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-xs font-semibold bg-gray-50 rounded-xl">
                      Bu tarihte müsait saat bulunmuyor.
                    </div>
                  )}
                </div>
              )}

              {/* Onay Butonu */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRescheduleAppt(null)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-2xl transition-colors cursor-pointer text-center bg-white uppercase tracking-widest"
                >
                  Vazgeç
                </button>
                 <button
                  onClick={handleReschedule}
                  disabled={!rescheduleDate || !rescheduleTime || rescheduleLoading}
                  className="flex-1 py-3 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] disabled:bg-gray-300 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {rescheduleLoading ? (
                    <><Loader2 size={14} className="animate-spin" /> ERTELENİYOR...</>
                  ) : (
                    <>ONAYLA <ChevronRight size={14} /></>
                  )}
                </button>
              </div>
            </div>

            <style jsx>{`
              @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
