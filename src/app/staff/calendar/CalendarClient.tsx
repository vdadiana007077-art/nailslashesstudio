"use client";

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ApptStatus } from '@prisma/client';
import StaffAppointmentModal from '../components/StaffAppointmentModal';

export default function StaffCalendarClient({ initialAppointments, staffId }: { initialAppointments: any[], staffId: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  // Navigasyon
  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
    // Gerçek uygulamada yeni tarih aralığı için fetch yapılabilir (Şu an initial data ile çalışıyoruz veya hepsi yüklenmiş varsayıyoruz, ama tam doğrusu tarih değiştikçe veri çekmektir)
    // Şimdilik sayfayı yenilemek veya API tetiklemek eklenebilir. Basitlik adına mevcut `appointments` içinden filtreliyoruz.
  };

  // Randevuyu yenileme fonksiyonu (Modal'dan durum güncellendiğinde sayfayı tazelemek için)
  const handleUpdate = () => {
    window.location.reload();
  };

  const getStatusBadge = (status: ApptStatus) => {
    switch (status) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Bekliyor</span>;
      case 'CONFIRMED': return <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Onaylandı</span>;
      case 'ARRIVED': return <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Geldi</span>;
      case 'STARTED': return <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Başladı</span>;
      case 'COMPLETED': return <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Bitti</span>;
      case 'PAID': return <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5"><CheckCircle size={10}/> Ödendi</span>;
      case 'NO_SHOW': return <span className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Gelmedi</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5"><XCircle size={10}/> İptal</span>;
      default: return null;
    }
  };

  // Sadece seçili güne ait randevular
  const dayAppointments = appointments.filter(a => {
    const d = new Date(a.date);
    return d.getDate() === currentDate.getDate() && 
           d.getMonth() === currentDate.getMonth() && 
           d.getFullYear() === currentDate.getFullYear();
  });

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
        
        <div className="flex justify-between items-center bg-gray-50 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('daily')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${viewMode === 'daily' ? 'bg-white text-[var(--color-rose-600)] shadow-sm' : 'text-gray-500'}`}
          >
            Günlük
          </button>
          <button 
            onClick={() => setViewMode('weekly')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${viewMode === 'weekly' ? 'bg-white text-[var(--color-rose-600)] shadow-sm' : 'text-gray-500'}`}
          >
            Haftalık
          </button>
        </div>

        <div className="flex justify-between items-center">
          <button onClick={() => changeDate(viewMode === 'daily' ? -1 : -7)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <CalendarIcon size={16} className="text-[var(--color-rose-500)]"/>
            {currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeDate(viewMode === 'daily' ? 1 : 7)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar List */}
      <div className="space-y-3">
        {dayAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
              <CalendarIcon size={32} />
            </div>
            <p className="text-gray-500 font-medium">Bu tarihte randevu bulunmuyor.</p>
          </div>
        ) : (
          dayAppointments.map(appt => (
            <div 
              key={appt.id} 
              onClick={() => setSelectedAppt(appt)}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-rose-400)]"></div>
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{appt.customerName || appt.customer?.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate pr-2 max-w-[200px]">
                    {appt.service?.translations?.[0]?.name || 'Hizmet'}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="mb-1">{getStatusBadge(appt.status)}</div>
                  <span className="font-bold text-[var(--color-rose-600)] text-sm">
                    {appt.priceAtBooking || appt.service?.price} ₺
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-3 pt-3 border-t border-gray-50">
                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md text-gray-700">
                  <Clock size={12} className="text-[var(--color-rose-400)]" /> 
                  {appt.startTime.substring(0, 5)} - {appt.endTime.substring(0, 5)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAppt && (
        <StaffAppointmentModal 
          appointment={selectedAppt}
          staffId={staffId}
          onClose={() => setSelectedAppt(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
