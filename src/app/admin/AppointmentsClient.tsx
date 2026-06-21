"use client";

import { useState } from 'react';
import {
  Clock, Eye, X, CheckCircle, AlertCircle,
  XCircle, RotateCcw, MessageSquare, ChevronDown, Trash2
} from 'lucide-react';
import { updateAppointmentStatus, updateAppointmentNotes, rescheduleAppointment, deleteAppointment } from '@/app/actions/appointment';

interface AppointmentItem {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  priceAtBooking: string;
  durationAtBooking: number;
  serviceName: string;
  staffName: string | null;
  locationName: string | null;
  statusHistory: { status: string; notes: string | null; createdAt: string }[];
}

interface AppointmentsClientProps {
  appointments: AppointmentItem[];
}

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Beklemede', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock size={12} /> },
  CONFIRMED: { label: 'Onaylandı', color: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle size={12} /> },
  COMPLETED: { label: 'Tamamlandı', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <CheckCircle size={12} /> },
  CANCELLED: { label: 'İptal', color: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle size={12} /> },
  NO_SHOW: { label: 'Gelmedi', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <AlertCircle size={12} /> },
  RESCHEDULED: { label: 'Yeniden Plan.', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: <RotateCcw size={12} /> },
};

export default function AppointmentsClient({ appointments }: AppointmentsClientProps) {
  const [items, setItems] = useState<AppointmentItem[]>(appointments);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu randevuyu ve randevuya bağlı tüm kayıtları (durum geçmişi, komisyonlar vb.) kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
      return;
    }

    setLoading(true);
    const result = await deleteAppointment(id);
    setLoading(false);

    if (result.success) {
      setItems(prev => prev.filter(a => a.id !== id));
      if (selectedAppt?.id === id) {
        setSelectedAppt(null);
        setIsDetailOpen(false);
      }
      showFeedback('success', 'Randevu kalıcı olarak silindi.');
    } else {
      showFeedback('error', result.error || 'Silme işlemi sırasında hata oluştu.');
    }
  };

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const filtered = items.filter(a => filterStatus === 'ALL' || a.status === filterStatus);

  const openDetail = (appt: AppointmentItem) => {
    setSelectedAppt(appt);
    setNotes(appt.notes || '');
    setIsDetailOpen(true);
    setIsRescheduleOpen(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoading(true);
    const result = await updateAppointmentStatus(id, newStatus as any);
    setLoading(false);

    if (result.success) {
      setItems(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      if (selectedAppt?.id === id) {
        setSelectedAppt(prev => prev ? { ...prev, status: newStatus } : prev);
      }
      if (result.warning) {
        showFeedback('error', `Durum güncellendi fakat: ${result.warning}`);
      } else {
        showFeedback('success', 'Durum güncellendi.');
      }
    } else {
      showFeedback('error', result.error || 'Hata oluştu.');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedAppt) return;
    setLoading(true);
    const result = await updateAppointmentNotes(selectedAppt.id, notes);
    setLoading(false);

    if (result.success) {
      setItems(prev => prev.map(a => a.id === selectedAppt.id ? { ...a, notes } : a));
      showFeedback('success', 'Notlar kaydedildi.');
    } else {
      showFeedback('error', result.error || 'Hata oluştu.');
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppt || !rescheduleDate || !rescheduleTime) return;
    setLoading(true);
    const result = await rescheduleAppointment(selectedAppt.id, rescheduleDate, rescheduleTime);
    setLoading(false);

    if (result.success) {
      // Bitiş saatini hesapla (eski süre üzerinden)
      const [hours, minutes] = rescheduleTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + selectedAppt.durationAtBooking;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      const newEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

      setItems(prev => prev.map(a => a.id === selectedAppt.id ? { 
        ...a, 
        date: rescheduleDate, 
        startTime: rescheduleTime, 
        endTime: newEndTime,
        status: 'RESCHEDULED'
      } : a));
      
      setSelectedAppt(prev => prev ? { 
        ...prev, 
        date: rescheduleDate, 
        startTime: rescheduleTime, 
        endTime: newEndTime,
        status: 'RESCHEDULED'
      } : prev);

      showFeedback('success', 'Randevu yeniden planlandı.');
      setIsRescheduleOpen(false);
    } else {
      showFeedback('error', result.error || 'Hata oluştu.');
    }
  };

  const statusCounts: Record<string, number> = { ALL: items.length };
  items.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });

  return (
    <div className="space-y-4">
      {/* Feedback */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
          feedback.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{feedback.text}</span>
        </div>
      )}

      {/* Filtreler */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(statusCounts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              filterStatus === key
                ? 'bg-[var(--color-rose-600)] text-white border-[var(--color-rose-600)]'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {key === 'ALL' ? 'Tümü' : statusMap[key]?.label || key}
            <span className="ml-1 opacity-80">({count})</span>
          </button>
        ))}
      </div>

      {/* Randevu Listesi */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-sm">Randevu bulunamadı.</div>
      ) : (
        <>
          {/* ═══════ MOBİL KART GÖRÜNÜMÜ (<md) ═══════ */}
          <div className="md:hidden space-y-3">
            {filtered.map((appt) => {
              const st = statusMap[appt.status] || statusMap.PENDING;
              return (
                <div key={appt.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  {/* Üst satır: Durum + Saat */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-semibold border ${st.color}`}>
                      {st.icon}{st.label}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(appt.date).toLocaleDateString('tr-TR')} • {appt.startTime}
                    </span>
                  </div>
                  {/* Müşteri + Hizmet */}
                  <p className="font-semibold text-gray-800 text-sm">{appt.customerName}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="px-2 py-0.5 bg-[var(--color-rose-50)] text-[var(--color-rose-600)] rounded-full text-[10px] font-semibold truncate max-w-[60%]">
                      {appt.serviceName}
                    </span>
                    <span className="font-bold text-gray-800 text-sm">₺{appt.priceAtBooking}</span>
                  </div>
                  {appt.staffName && (
                    <p className="text-[10px] text-gray-400 mt-1">Uzman: {appt.staffName}</p>
                  )}
                  {/* Aksiyon Butonları */}
                  <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-gray-50">
                    {appt.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusChange(appt.id, 'CONFIRMED')}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-[10px] font-bold transition-all border border-green-200"
                      >
                        <CheckCircle size={13} /> Onayla
                      </button>
                    )}
                    {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-[10px] font-bold transition-all border border-red-200"
                      >
                        <XCircle size={13} /> İptal
                      </button>
                    )}
                    {appt.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusChange(appt.id, 'COMPLETED')}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-[10px] font-bold transition-all border border-blue-200"
                      >
                        <CheckCircle size={13} /> Tamamla
                      </button>
                    )}
                    <button
                      onClick={() => openDetail(appt)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl text-[10px] font-bold transition-all border border-gray-200 ml-auto"
                    >
                      <Eye size={13} /> Detay
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ═══════ DESKTOP TABLO GÖRÜNÜMÜ (md+) ═══════ */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-3 pl-5">Müşteri</th>
                  <th className="p-3">Tarih & Saat</th>
                  <th className="p-3">Hizmet</th>
                  <th className="p-3">Uzman</th>
                  <th className="p-3">Ücret</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appt) => {
                  const st = statusMap[appt.status] || statusMap.PENDING;
                  return (
                    <tr key={appt.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="p-3 pl-5">
                        <div>
                          <p className="font-semibold text-gray-800">{appt.customerName}</p>
                          <p className="text-[10px] text-gray-400">{appt.customerEmail}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-gray-800">{new Date(appt.date).toLocaleDateString('tr-TR')}</span>
                        <span className="text-xs text-gray-500 ml-1.5">{appt.startTime}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-[var(--color-rose-50)] text-[var(--color-rose-600)] rounded-full text-xs font-semibold">
                          {appt.serviceName}
                        </span>
                      </td>
                      <td className="p-3 text-gray-700 text-xs font-medium">{appt.staffName || 'Atanmadı'}</td>
                      <td className="p-3 font-bold text-gray-800">₺{appt.priceAtBooking}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-semibold border ${st.color}`}>
                          {st.icon}{st.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-start gap-2 flex-wrap">
                          {appt.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusChange(appt.id, 'CONFIRMED')}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-xs font-bold transition-all border border-green-200"
                              title="Onayla"
                            >
                              <CheckCircle size={15} /> Onayla
                            </button>
                          )}
                          {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-all border border-red-200"
                              title="İptal Et"
                            >
                              <XCircle size={15} /> İptal
                            </button>
                          )}
                          {appt.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusChange(appt.id, 'COMPLETED')}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all border border-blue-200"
                              title="Tamamlandı"
                            >
                              <CheckCircle size={15} /> Tamamla
                            </button>
                          )}
                          <button
                            onClick={() => openDetail(appt)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all border border-gray-200"
                            title="Detay"
                          >
                            <Eye size={15} /> Detay
                          </button>
                          <button
                            onClick={() => handleDelete(appt.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all border border-rose-200"
                            title="Kalıcı Olarak Sil"
                          >
                            <Trash2 size={15} /> Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detay Modal */}
      {isDetailOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-900">Randevu Detayı</h3>
                <p className="text-xs text-gray-500">{selectedAppt.customerName}</p>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Bilgiler */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Hizmet', value: selectedAppt.serviceName },
                  { label: 'Uzman', value: selectedAppt.staffName || 'Atanmadı' },
                  { label: 'Tarih', value: new Date(selectedAppt.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Saat', value: `${selectedAppt.startTime} - ${selectedAppt.endTime}` },
                  { label: 'Süre', value: `${selectedAppt.durationAtBooking} dk` },
                  { label: 'Ücret', value: `₺${selectedAppt.priceAtBooking}` },
                  { label: 'E-Posta', value: selectedAppt.customerEmail },
                  { label: 'Telefon', value: selectedAppt.customerPhone || '-' },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                    <p className="text-xs text-gray-800 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Durum Güncelle */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Durum Güncelle</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(statusMap).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusChange(selectedAppt.id, key)}
                      disabled={loading}
                      className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold rounded-xl border transition-all ${
                        selectedAppt.status === key
                          ? `${val.color} ring-2 ring-offset-1 ring-current`
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {val.icon}{val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tehlikeli Alan (Silme) */}
              <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tehlikeli Bölge</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Randevuyu sistemden kalıcı olarak siler.</p>
                </div>
                <button
                  onClick={() => handleDelete(selectedAppt.id)}
                  disabled={loading}
                  className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Trash2 size={14} /> Randevuyu Kalıcı Sil
                </button>
              </div>

              {/* Durum Geçmişi */}
              {selectedAppt.statusHistory.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Durum Geçmişi</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedAppt.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className={`shrink-0 px-2 py-0.5 rounded-full font-semibold border ${statusMap[h.status]?.color || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {statusMap[h.status]?.label || h.status}
                        </span>
                        <span className="text-gray-500">{h.notes || ''}</span>
                        <span className="text-gray-400 ml-auto shrink-0">
                          {new Date(h.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yeniden Planla */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Randevuyu Yeniden Planla</p>
                  <button
                    onClick={() => {
                      if (!isRescheduleOpen) {
                        const dateObj = new Date(selectedAppt.date);
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        setRescheduleDate(`${year}-${month}-${day}`);
                        setRescheduleTime(selectedAppt.startTime);
                      }
                      setIsRescheduleOpen(!isRescheduleOpen);
                    }}
                    className="text-xs text-[var(--color-rose-600)] hover:text-[var(--color-rose-700)] font-semibold"
                  >
                    {isRescheduleOpen ? 'Kapat' : 'Tarih/Saat Değiştir'}
                  </button>
                </div>
                {isRescheduleOpen && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Yeni Tarih</label>
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={e => setRescheduleDate(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Yeni Saat</label>
                        <input
                          type="time"
                          value={rescheduleTime}
                          onChange={e => setRescheduleTime(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleReschedule}
                      disabled={loading}
                      className="w-full bg-[var(--color-rose-600)] text-white py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-xs font-semibold shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Güncelleniyor...' : 'Yeni Saati Kaydet'}
                    </button>
                  </div>
                )}
              </div>

              {/* Admin Notları */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Notları</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Randevu hakkında not ekleyin..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={loading}
                  className="mt-2 bg-[var(--color-rose-600)] text-white px-4 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Notu Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
