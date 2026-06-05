"use client";

import { useState, useEffect } from 'react';
import { getSlots, blockSlot, updateSlotCapacity } from '@/app/actions/availability';
import { Calendar, User, MapPin, ShieldAlert, Check, X, Shield, Lock, Unlock } from 'lucide-react';

interface AvailabilityClientProps {
  locations: any[];
  staffList: any[];
  locale: string;
}

export default function AvailabilityClient({ locations, staffList, locale }: AvailabilityClientProps) {
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('ANY'); // ANY means general branch level slots
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // "time_action" formatında loading state'i

  useEffect(() => {
    if (selectedLocationId && selectedDate) {
      loadSlots();
    }
  }, [selectedLocationId, selectedStaffId, selectedDate]);

  const loadSlots = async () => {
    setLoading(true);
    const res = await getSlots(selectedLocationId, selectedDate);
    setLoading(false);
    if (res.success && res.slots) {
      // Sadece seçilen staffId ile eşleşen slotları filtreleyelim
      const filtered = res.slots.filter((s: any) => {
        if (selectedStaffId === 'ANY') {
          return s.staffId === null;
        } else {
          return s.staffId === selectedStaffId;
        }
      });
      setSlots(filtered);
    }
  };

  // 09:00 - 21:00 arası 30 dakikalık standart slot listesi oluşturma
  const generateTimeSlots = () => {
    const list = [];
    let start = 9 * 60; // 09:00
    const end = 21 * 60; // 21:00
    while (start <= end) {
      const h = Math.floor(start / 60);
      const m = start % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      list.push(timeStr);
      start += 30; // 30 dakikalık adımlarla
    }
    return list;
  };

  const timeSlots = generateTimeSlots();

  const handleBlockToggle = async (time: string, currentBlocked: boolean) => {
    const nextBlocked = !currentBlocked;
    const actionKey = `${time}_block`;
    setActionLoading(actionKey);
    
    const staffVal = selectedStaffId === 'ANY' ? null : selectedStaffId;
    const res = await blockSlot(
      selectedLocationId,
      staffVal,
      selectedDate,
      time,
      nextBlocked,
      nextBlocked ? 'Yönetici tarafından kapatıldı' : undefined
    );
    
    setActionLoading(null);
    if (res.success) {
      loadSlots();
    } else {
      alert(res.error || 'İşlem gerçekleştirilemedi.');
    }
  };

  const handleCapacityChange = async (time: string, capacity: number) => {
    if (capacity < 1) return;
    const actionKey = `${time}_capacity`;
    setActionLoading(actionKey);
    
    const staffVal = selectedStaffId === 'ANY' ? null : selectedStaffId;
    const res = await updateSlotCapacity(
      selectedLocationId,
      staffVal,
      selectedDate,
      time,
      capacity
    );
    
    setActionLoading(null);
    if (res.success) {
      loadSlots();
    } else {
      alert(res.error || 'Kapasite güncellenemedi.');
    }
  };

  // İlgili saatin veritabanında kayıtlı slotunu bul
  const getSlotData = (time: string) => {
    return slots.find((s) => s.time === time) || {
      capacity: 1,
      bookedCount: 0,
      isBlocked: false
    };
  };

  return (
    <div className="space-y-6">
      {/* Filtre Barı */}
      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Şube Seçimi */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <MapPin size={14} className="text-gray-400" />
            Şube Seçimi
          </label>
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-sm"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} {loc.branchName ? `(${loc.branchName})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Uzman / Şube Genel Seçimi */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <User size={14} className="text-gray-400" />
            Kapasite Türü
          </label>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-sm"
          >
            <option value="ANY">Şube Genel Kapasitesi (Uzman Bağımsız)</option>
            {staffList
              .filter((st) => st.locationId === selectedLocationId)
              .map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.specialty || 'Uzman'})
                </option>
              ))}
          </select>
        </div>

        {/* Tarih Seçimi */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            Tarih Seçimi
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-sm"
          />
        </div>
      </div>

      {/* Bilgi Kutusu */}
      <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl text-amber-800 text-xs flex gap-2">
        <ShieldAlert size={18} className="shrink-0 text-amber-600 mt-0.5" />
        <div>
          <p className="font-bold">Slot Bilgilendirmesi:</p>
          <p className="mt-1">
            Oluşturulan kapasite kuralları, müşterilerin online randevu alırken şubede veya uzmanda o saat dilimi için en fazla kaç randevu açılacağını belirler. 
            Bloke edilen saatler müşterilere hiçbir şekilde gösterilmez.
          </p>
        </div>
      </div>

      {/* Grid Listesi */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[var(--color-primary-500)] rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 font-medium">Slotlar yükleniyor...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {timeSlots.map((time) => {
                const slotData = getSlotData(time);
                const isBlocked = slotData.isBlocked;
                const capacity = slotData.capacity;
                const bookedCount = slotData.bookedCount;

                return (
                  <div
                    key={time}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-36 ${
                      isBlocked
                        ? 'bg-red-50/40 border-red-100 text-red-900'
                        : bookedCount >= capacity
                        ? 'bg-amber-50/40 border-amber-100 text-amber-900'
                        : 'bg-white border-gray-150 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-base tracking-wide flex items-center gap-1">
                        {time}
                        {isBlocked ? (
                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            Kapalı
                          </span>
                        ) : bookedCount >= capacity ? (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            Dolu
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            Açık
                          </span>
                        )}
                      </span>

                      {/* Bloke Et/Kaldır Butonu */}
                      <button
                        onClick={() => handleBlockToggle(time, isBlocked)}
                        disabled={actionLoading === `${time}_block`}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBlocked
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={isBlocked ? 'Saati Aç' : 'Saati Kapat'}
                      >
                        {isBlocked ? <Unlock size={14} /> : <Lock size={14} />}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {/* Rezervasyon / Doluluk Bilgisi */}
                      <div className="flex justify-between text-xs text-gray-500 font-semibold">
                        <span>Rezervasyon:</span>
                        <span className="font-bold text-gray-700">
                          {bookedCount} / {capacity}
                        </span>
                      </div>

                      {/* Kapasite Girişi */}
                      {!isBlocked && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-500 font-semibold">Kapasite:</span>
                          <input
                            type="number"
                            min="1"
                            value={capacity}
                            onChange={(e) => handleCapacityChange(time, parseInt(e.target.value) || 1)}
                            disabled={actionLoading === `${time}_capacity`}
                            className="w-16 px-2 py-1 text-center bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[var(--color-primary-500)]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
