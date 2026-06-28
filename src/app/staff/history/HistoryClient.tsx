"use client";

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { ApptStatus } from '@prisma/client';

type Props = {
  appointments: any[];
};

export default function StaffHistoryClient({ appointments }: Props) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'paid' | 'cancelled'>('all');

  const filtered = appointments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'completed') return a.status === ApptStatus.COMPLETED;
    if (filter === 'paid') return a.status === ApptStatus.PAID;
    if (filter === 'cancelled') return a.status === ApptStatus.CANCELLED || a.status === ApptStatus.NO_SHOW;
    return true;
  });

  const getStatusBadge = (status: ApptStatus) => {
    switch (status) {
      case 'COMPLETED': return <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5"><CheckCircle size={10}/> Tamamlandı</span>;
      case 'PAID': return <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5"><DollarSign size={10}/> Ödendi</span>;
      case 'NO_SHOW': return <span className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Gelmedi</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5"><XCircle size={10}/> İptal</span>;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Tarihe göre grupla
  const grouped = filtered.reduce((acc: Record<string, any[]>, appt) => {
    const key = new Date(appt.date).toISOString().split('T')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(appt);
    return acc;
  }, {});

  const totalEarnings = filtered
    .filter(a => a.status === ApptStatus.PAID || a.status === ApptStatus.COMPLETED)
    .reduce((sum, a) => sum + Number(a.priceAtBooking || a.service?.price || 0), 0);

  const completedCount = appointments.filter(a => a.status === ApptStatus.COMPLETED || a.status === ApptStatus.PAID).length;

  return (
    <div className="space-y-4">
      {/* Özet Kartları */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Toplam İşlem</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{completedCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Toplam Ciro</p>
          <p className="text-2xl font-bold text-[var(--color-rose-600)] mt-1">{totalEarnings.toLocaleString('tr-TR')} ₺</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all' as const, label: 'Tümü', count: appointments.length },
            { key: 'completed' as const, label: 'Tamamlanan', count: appointments.filter(a => a.status === ApptStatus.COMPLETED).length },
            { key: 'paid' as const, label: 'Ödenen', count: appointments.filter(a => a.status === ApptStatus.PAID).length },
            { key: 'cancelled' as const, label: 'İptal', count: appointments.filter(a => a.status === ApptStatus.CANCELLED || a.status === ApptStatus.NO_SHOW).length },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filter === f.key
                  ? 'bg-[var(--color-rose-500)] text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Randevu Listesi */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
            <CalendarIcon size={32} />
          </div>
          <p className="text-gray-500 font-medium">Geçmiş randevu bulunmuyor.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([dateKey, appts]) => (
          <div key={dateKey}>
            <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
              <CalendarIcon size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-500">{formatDate(dateKey)}</span>
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {appts.length}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {appts.map((appt: any) => (
                <div 
                  key={appt.id} 
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    appt.status === ApptStatus.PAID ? 'bg-green-400' :
                    appt.status === ApptStatus.COMPLETED ? 'bg-emerald-400' :
                    appt.status === ApptStatus.CANCELLED ? 'bg-red-400' : 'bg-gray-300'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{appt.customerName || appt.customer?.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {appt.service?.translations?.[0]?.name || 'Hizmet'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="mb-1">{getStatusBadge(appt.status)}</div>
                      <span className="font-bold text-[var(--color-rose-600)] text-sm">
                        {appt.priceAtBooking || appt.service?.price} ₺
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
                    <Clock size={12} />
                    <span>{appt.startTime.substring(0, 5)} - {appt.endTime.substring(0, 5)}</span>
                    {appt.payment && (
                      <span className="ml-auto bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        {appt.payment.paymentMethod === 'CASH' ? 'Nakit' : 'Kart'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
