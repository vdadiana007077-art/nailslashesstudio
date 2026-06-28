"use client";

import { useState } from 'react';
import { Wallet, DollarSign, CreditCard, ArrowDownRight, Calendar as CalendarIcon, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ApptStatus } from '@prisma/client';
import StaffAppointmentModal from './StaffAppointmentModal';

export default function StaffDashboardClient({ data }: { data: any }) {
  const { staff, todayAppointments, upcomingAppointments, stats, finance } = data;
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  const handleUpdate = () => {
    window.location.reload();
  };

  const getStatusBadge = (status: ApptStatus) => {
    switch (status) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Bekliyor</span>;
      case 'CONFIRMED': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Onaylandı</span>;
      case 'ARRIVED': return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">Geldi</span>;
      case 'STARTED': return <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">Başladı</span>;
      case 'COMPLETED': return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">Tamamlandı</span>;
      case 'PAID': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1"><CheckCircle size={12}/> Ödendi</span>;
      case 'NO_SHOW': return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">Gelmedi</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1"><XCircle size={12}/> İptal</span>;
      default: return null;
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // 09:00:00 -> 09:00
  };

  return (
    <div className="space-y-6">
      {/* Finance Summary Cards */}
      {finance && (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 bg-[var(--color-rose-500)] rounded-2xl p-4 text-white shadow-lg shadow-rose-200 flex justify-between items-center">
            <div>
              <p className="text-rose-100 text-sm font-medium mb-1">Kasada Kalan Bakiye</p>
              <h3 className="text-3xl font-bold">{finance.balanceAfter} ₺</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Wallet size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ArrowDownRight size={14} />
              </div>
              <span className="text-gray-500 text-xs font-medium">Toplam Tahsilat</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{finance.totalCollected} ₺</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Wallet size={14} />
              </div>
              <span className="text-gray-500 text-xs font-medium">Teslim Bekleyen</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{finance.pendingDrop} ₺</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <DollarSign size={14} />
              </div>
              <span className="text-gray-500 text-xs font-medium">Toplam Hakediş</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{finance.totalCommission} ₺</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <CreditCard size={14} />
              </div>
              <span className="text-gray-500 text-xs font-medium">Kalan Hakediş</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{finance.pendingCommission} ₺</p>
          </div>
        </div>
      )}

      {/* Today's Appointments */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon size={18} className="text-[var(--color-rose-500)]" />
            Bugünkü Randevular
          </h2>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
            {stats.completedToday} / {stats.todayCount} Tamamlanan
          </span>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm">Bugün için randevunuz bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appt: any) => (
              <div 
                key={appt.id} 
                onClick={() => setSelectedAppt(appt)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-rose-400)]"></div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{appt.customerName || appt.customer?.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{appt.service?.translations?.[0]?.name || 'Hizmet'}</p>
                  </div>
                  <div>
                    {getStatusBadge(appt.status)}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mt-3">
                  <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(appt.startTime)}</span>
                  <span className="flex items-center gap-1 text-[var(--color-rose-600)]"><DollarSign size={14} /> {appt.priceAtBooking || appt.service?.price} ₺</span>
                </div>
                {/* Gelecek geliştirmede buralara modal tetikleyicisi eklenecek (Tıklanabilirlik) */}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Appointments */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">Yaklaşan Randevular</h2>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm">Yaklaşan randevunuz bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 5).map((appt: any) => (
              <div 
                key={appt.id} 
                onClick={() => setSelectedAppt(appt)}
                className="bg-white rounded-xl p-3 border border-gray-100 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex gap-3 items-center">
                  <div className="bg-gray-50 p-2 rounded-lg text-center min-w-[3rem]">
                    <p className="text-[10px] text-gray-500 uppercase">{new Date(appt.date).toLocaleDateString('tr-TR', { month: 'short' })}</p>
                    <p className="text-sm font-bold text-gray-800">{new Date(appt.date).getDate()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">{appt.customerName || appt.customer?.name}</p>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {formatTime(appt.startTime)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   {getStatusBadge(appt.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedAppt && (
        <StaffAppointmentModal 
          appointment={selectedAppt}
          staffId={staff?.id}
          onClose={() => setSelectedAppt(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
