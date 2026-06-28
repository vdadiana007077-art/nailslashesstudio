"use client";

import { useState, useEffect } from 'react';
import { getCurrentCustomer, logoutCustomer, addPasswordToSocialAccount, updateCustomerMarketing } from '@/app/actions/customerAuth';
import { cancelAppointment, rescheduleAppointment } from '@/app/actions/booking';
import { getAvailableTimeSlots } from '@/app/actions/availability';
import { X, User, Phone, Calendar, LogOut, CheckCircle, AlertTriangle, Play, BellRing } from 'lucide-react';
import Link from 'next/link';

interface AccountPopupProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export default function AccountPopup({ isOpen, onClose, locale }: AccountPopupProps) {
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Şifre ekleme formu state'leri
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Randevu Erteleme (Reschedule) State'leri
  const [reschedulingApptId, setReschedulingApptId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reschedulingSubmit, setReschedulingSubmit] = useState(false);

  const handleCancelAppointment = async (apptId: string) => {
    if (!confirm('Randevunuzu iptal etmek istediğinize emin misiniz?')) return;
    setCancellingId(apptId);
    setError(null);
    setMsg(null);
    const res = await cancelAppointment(apptId);
    setCancellingId(null);
    if (res.success) {
      setMsg('Randevunuz başarıyla iptal edildi.');
      loadCustomer();
    } else {
      setError(res.error || 'Randevu iptal edilirken bir hata oluştu.');
    }
  };

  const loadRescheduleSlots = async (dateStr: string, appt: any) => {
    setLoadingSlots(true);
    setRescheduleTime(null);
    const res = await getAvailableTimeSlots(
      appt.locationId,
      appt.serviceId,
      dateStr,
      appt.staffId || 'ANY'
    );
    setLoadingSlots(false);
    if (res.success && res.slots) {
      setRescheduleSlots(res.slots);
    } else {
      setRescheduleSlots([]);
    }
  };

  const handleReschedule = async (apptId: string) => {
    if (!rescheduleDate || !rescheduleTime) {
      setError('Lütfen yeni tarih ve saat seçin.');
      return;
    }
    setReschedulingSubmit(true);
    setError(null);
    setMsg(null);
    const res = await rescheduleAppointment(apptId, rescheduleDate, rescheduleTime);
    setReschedulingSubmit(false);
    if (res.success) {
      setMsg('Randevunuz başarıyla ertelendi.');
      setReschedulingApptId(null);
      loadCustomer();
    } else {
      setError(res.error || 'Randevu ertelenirken bir hata oluştu.');
    }
  };

  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  useEffect(() => {
    if (isOpen) {
      loadCustomer();
    }
  }, [isOpen]);

  const loadCustomer = async () => {
    setLoading(true);
    const data = await getCurrentCustomer();
    setCustomer(data);
    setLoading(false);
  };

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logoutCustomer();
    onClose();
    window.location.reload();
  };

  const handleNewsletterToggle = async () => {
    if (!customer) return;
    const nextStatus = !customer.marketingConsent;
    const res = await updateCustomerMarketing(nextStatus, locale);
    if (res.success) {
      setCustomer({ ...customer, marketingConsent: nextStatus, subscriberActive: nextStatus });
    }
  };

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Şifreler uyuşmuyor.');
      return;
    }

    setSubmitting(true);
    const res = await addPasswordToSocialAccount(password);
    setSubmitting(false);

    if (res.success) {
      setMsg('Şifreniz başarıyla oluşturuldu.');
      setCustomer({ ...customer, hasPassword: true });
      setPassword('');
      setPasswordConfirm('');
      setTimeout(() => setShowPasswordForm(false), 2000);
    } else {
      setError(res.error || 'Şifre eklenirken bir hata oluştu.');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; css: string; icon: any }> = {
      PENDING: { text: 'Beklemede', css: 'bg-amber-50 text-amber-700 border-amber-100', icon: AlertTriangle },
      CONFIRMED: { text: 'Onaylandı', css: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle },
      CANCELLED: { text: 'İptal Edildi', css: 'bg-red-50 text-red-700 border-red-100', icon: X },
      COMPLETED: { text: 'Tamamlandı', css: 'bg-blue-50 text-blue-700 border-blue-100', icon: CheckCircle },
      NO_SHOW: { text: 'Gelinmedi', css: 'bg-gray-50 text-gray-700 border-gray-100', icon: AlertTriangle },
      RESCHEDULED: { text: 'Ertelendi', css: 'bg-purple-50 text-purple-700 border-purple-100', icon: Play }
    };
    return labels[status] || { text: status, css: 'bg-gray-50 text-gray-700 border-gray-100', icon: AlertTriangle };
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex justify-end transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white border-l border-[var(--color-rose-100)] w-full max-w-md h-full shadow-2xl relative overflow-hidden flex flex-col animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-10 h-10 border-4 border-pink-100 border-t-[var(--color-primary-500)] rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 font-medium">Hesap bilgileri yükleniyor...</p>
          </div>
        ) : !customer ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
            <User size={48} className="text-gray-300" />
            <p className="text-sm text-gray-500 font-medium">Oturumunuz kapatılmış veya süresi dolmuş.</p>
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
            >
              KAPAT
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Customer Details Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 pt-16 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center font-bold text-xl uppercase shadow-inner border border-[var(--color-rose-200)]">
                  {customer.name.substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-gray-950 truncate leading-snug">{customer.name}</h4>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{customer.email}</p>
                  {customer.phone && (
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-medium">
                      <Phone size={10} /> {customer.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 animate-fade-in shrink-0">
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                  <p className="text-xs text-red-700 font-medium">{error}</p>
                </div>
              )}
              {msg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 animate-fade-in shrink-0">
                  <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                  <p className="text-xs text-emerald-700 font-medium">{msg}</p>
                </div>
              )}

              {/* Randevu Geçmişi veya Personel Uyarı */}
              {customer.role === 'STAFF' ? (
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <h5 className="text-sm font-bold text-blue-900">Personel Hesabı</h5>
                  <p className="text-xs text-blue-700 font-medium">Bu hesap bir personel (uzman) hesabıdır. Randevularınızı ve çalışma takviminizi görebilmek için personel paneline geçiş yapın.</p>
                  <Link 
                    href={`/${locale}/staff`}
                    onClick={onClose}
                    className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md inline-block"
                  >
                    Panele Git
                  </Link>
                </div>
              ) : (
              <div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[var(--color-rose-600)]" />
                  Randevu Geçmişi
                </h5>

                {customer.appointments.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 font-medium">
                    Kayıtlı randevunuz bulunmuyor.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customer.appointments.map((appt: any) => {
                      const status = getStatusLabel(appt.status);
                      const StatusIcon = status.icon;

                      return (
                        <div key={appt.id} className="p-4 bg-white border border-gray-150 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <span className="font-bold text-sm text-gray-800 leading-snug truncate">{appt.serviceName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1 ${status.css}`}>
                              <StatusIcon size={10} />
                              {status.text}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-3 pt-2 border-t border-gray-50">
                            <div>
                              <p className="text-[10px] text-gray-400">Tarih / Saat</p>
                              <p className="font-semibold text-gray-700 mt-0.5">{appt.date} - {appt.startTime}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400">Tutar</p>
                              <p className="font-semibold text-gray-700 mt-0.5">₺{parseFloat(appt.price).toLocaleString('tr-TR')}</p>
                            </div>
                          </div>

                           {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                            <div className="mt-3 pt-2 border-t border-gray-55">
                              {reschedulingApptId === appt.id ? (
                                <div className="space-y-3 pt-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Yeni Tarih Seçin</p>
                                  <div className="grid grid-cols-4 gap-1.5">
                                    {getNext7Days().map((d, idx) => {
                                      const year = d.getFullYear();
                                      const month = String(d.getMonth() + 1).padStart(2, '0');
                                      const day = String(d.getDate()).padStart(2, '0');
                                      const dateStr = `${year}-${month}-${day}`;
                                      const isSelected = rescheduleDate === dateStr;

                                      return (
                                        <button
                                          key={idx}
                                          type="button"
                                          onClick={() => {
                                            setRescheduleDate(dateStr);
                                            loadRescheduleSlots(dateStr, appt);
                                          }}
                                          className={`p-1.5 rounded-lg text-center flex flex-col items-center justify-center transition-all border cursor-pointer ${
                                            isSelected
                                              ? 'bg-[var(--color-rose-600)] text-white border-[var(--color-rose-600)]'
                                              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'
                                          }`}
                                        >
                                          <span className="text-[8px] uppercase font-bold opacity-80">{d.toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
                                          <span className="text-xs font-bold">{d.getDate()}</span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {rescheduleDate && (
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Yeni Saat Seçin</p>
                                      {loadingSlots ? (
                                        <div className="text-center py-4 text-xs text-gray-400">Saat dilimleri yükleniyor...</div>
                                      ) : rescheduleSlots.length > 0 ? (
                                        <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                          {rescheduleSlots.map((time, idx) => (
                                            <button
                                              key={idx}
                                              type="button"
                                              onClick={() => setRescheduleTime(time)}
                                              className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                                rescheduleTime === time
                                                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                              }`}
                                            >
                                              {time}
                                            </button>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-3 text-[10px] font-bold text-red-500 bg-red-50 rounded-lg">Seçtiğiniz tarihte müsait saat bulunamadı.</div>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setReschedulingApptId(null)}
                                      className="flex-1 py-2 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center bg-white"
                                    >
                                      İptal
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleReschedule(appt.id)}
                                      disabled={reschedulingSubmit || !rescheduleTime}
                                      className="flex-1 py-2 bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-600)] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center disabled:opacity-50"
                                    >
                                      {reschedulingSubmit ? 'Güncelleniyor...' : 'Onayla'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReschedulingApptId(appt.id);
                                      setRescheduleDate('');
                                      setRescheduleTime(null);
                                      setRescheduleSlots([]);
                                      setError(null);
                                      setMsg(null);
                                    }}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[var(--color-rose-600)] font-bold text-[10px] rounded-xl transition-colors cursor-pointer"
                                  >
                                    Yeniden Planla
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCancelAppointment(appt.id)}
                                    disabled={cancellingId === appt.id}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 text-red-600 font-bold text-[10px] rounded-xl transition-colors cursor-pointer"
                                  >
                                    {cancellingId === appt.id ? 'İptal Ediliyor...' : 'Randevuyu İptal Et'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              )}

              {/* Bülten Aboneliği & Pazarlama */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BellRing size={14} className="text-[var(--color-rose-600)]" />
                  İletişim & Pazarlama İzinleri
                </h5>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-800">E-Bülten Aboneliği</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Kampanyalardan e-posta ile haberdar olun.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customer.marketingConsent}
                      onChange={handleNewsletterToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary-500)]"></div>
                  </label>
                </div>
              </div>

              {/* Şifre Ekleme (Google/Apple ile giren ve şifresi olmayanlar için) */}
              {!customer.hasPassword && (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-800">Hesaba Şifre Belirle</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Sonradan manuel giriş yapabilmek için şifre oluşturun.</p>
                    </div>
                    <button
                      onClick={() => { setShowPasswordForm(!showPasswordForm); setError(null); setMsg(null); }}
                      className="text-xs font-bold text-[var(--color-rose-600)] hover:underline cursor-pointer"
                    >
                      {showPasswordForm ? 'Kapat' : 'Şifre Ekle'}
                    </button>
                  </div>

                  {showPasswordForm && (
                    <form onSubmit={handleAddPassword} className="space-y-3 pt-2">
                      {error && <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded-xl">{error}</p>}
                      {msg && <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl">{msg}</p>}

                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Yeni Şifre"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
                      />
                      <input
                        type="password"
                        required
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder="Yeni Şifre Tekrar"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl disabled:bg-gray-400 cursor-pointer"
                      >
                        {submitting ? 'KAYDEDİLİYOR...' : 'ŞİFREYİ OLUŞTUR'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Logout Action Footer */}
            <div className="p-6 pb-32 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3 shrink-0">
              <div className="flex gap-3">
                {customer.role === 'STAFF' ? (
                  <Link 
                    href={`/${locale}/staff`}
                    onClick={onClose}
                    className="px-5 py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md text-center flex-1"
                  >
                    Personel Paneli
                  </Link>
                ) : (
                  <>
                    <Link 
                      href={`/${locale}/hesabim`}
                      onClick={onClose}
                      className="px-5 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md text-center flex-1"
                    >
                      Hesabıma Git
                    </Link>
                    <Link 
                      href={`/${locale}/booking`}
                      onClick={onClose}
                      className="px-5 py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md text-center flex-1"
                    >
                      Yeni Randevu
                    </Link>
                  </>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
