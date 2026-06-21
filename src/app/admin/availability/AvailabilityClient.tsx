"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getSlots, blockSlot, updateSlotCapacity, createBulkSlots,
  getLocationWorkingHours, updateLocationWorkingHours,
  getLocationHolidays, addLocationHoliday, deleteLocationHoliday,
  getTimeBlocks, addTimeBlock, deleteTimeBlock,
  getAvailabilityDashboard
} from '@/app/actions/availability';
import { addStaffLeave, deleteStaffLeave, updateStaffWorkingHours } from '@/app/actions/staff';
import {
  Calendar, User, MapPin, Clock, Lock, Unlock,
  Plus, Trash2, Save,
  AlertTriangle, CalendarDays, Settings, Layers, Timer
} from 'lucide-react';

interface AvailabilityClientProps {
  locations: any[];
  staffList: any[];
  services: any[];
}

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export default function AvailabilityClient({ locations, staffList, services: _services }: AvailabilityClientProps) {
  // ═══════ FİLTRELER ═══════
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('ANY');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'slots' | 'hours' | 'leaves' | 'bulk'>('slots');

  // ═══════ SLOT TAB STATE ═══════
  const [slots, setSlots] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ═══════ ÇALIŞMA SAATLERİ TAB STATE ═══════
  const [locationHours, setLocationHours] = useState<any[]>([]);
  const [staffHoursMap, setStaffHoursMap] = useState<Record<string, any[]>>({});
  const [hoursEditing, setHoursEditing] = useState(false);
  const [hoursSaving, setHoursSaving] = useState(false);

  // ═══════ İZİN/TATİL TAB STATE ═══════
  const [holidays, setHolidays] = useState<any[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayDesc, setNewHolidayDesc] = useState('');
  const [newLeaveStaffId, setNewLeaveStaffId] = useState('');
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [newLeaveFullDay, setNewLeaveFullDay] = useState(true);
  const [newLeaveStart, setNewLeaveStart] = useState('09:00');
  const [newLeaveEnd, setNewLeaveEnd] = useState('18:00');
  const [timeBlocks, setTimeBlocks] = useState<any[]>([]);
  const [newBlockStaffId, setNewBlockStaffId] = useState('');
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockStart, setNewBlockStart] = useState('09:00');
  const [newBlockEnd, setNewBlockEnd] = useState('10:00');
  const [newBlockReason, setNewBlockReason] = useState('');

  // ═══════ TOPLU İŞLEM TAB STATE ═══════
  const [bulkStartTime, setBulkStartTime] = useState('09:00');
  const [bulkEndTime, setBulkEndTime] = useState('21:00');
  const [bulkCapacity, setBulkCapacity] = useState(1);
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  const locationStaff = staffList.filter(s => s.locationId === selectedLocationId);

  // ═══════ VERİ YÜKLEME ═══════
  const loadDashboard = useCallback(async () => {
    if (!selectedLocationId || !selectedDate) return;
    setLoading(true);
    const res = await getAvailabilityDashboard(selectedLocationId, selectedDate, selectedStaffId === 'ANY' ? undefined : selectedStaffId);
    setLoading(false);
    if (res.success && res.data) {
      setDashboardData(res.data);
    }
  }, [selectedLocationId, selectedDate, selectedStaffId]);

  const loadSlots = useCallback(async () => {
    if (!selectedLocationId || !selectedDate) return;
    const res = await getSlots(selectedLocationId, selectedDate);
    if (res.success && res.slots) {
      const filtered = res.slots.filter((s: any) => {
        if (selectedStaffId === 'ANY') return s.staffId === null;
        return s.staffId === selectedStaffId;
      });
      setSlots(filtered);
    }
  }, [selectedLocationId, selectedDate, selectedStaffId]);

  const loadHours = useCallback(async () => {
    const res = await getLocationWorkingHours(selectedLocationId);
    if (res.success) setLocationHours(res.data || []);

    // Personel çalışma saatlerini de yükle
    const map: Record<string, any[]> = {};
    for (const staff of locationStaff) {
      if (staff.workingHours) map[staff.id] = staff.workingHours;
    }
    setStaffHoursMap(map);
  }, [selectedLocationId, locationStaff]);

  const loadHolidays = useCallback(async () => {
    const res = await getLocationHolidays(selectedLocationId);
    if (res.success) setHolidays(res.data || []);
  }, [selectedLocationId]);

  const loadTimeBlocks = useCallback(async () => {
    const res = await getTimeBlocks(selectedLocationId, selectedDate);
    if (res.success) setTimeBlocks(res.data || []);
  }, [selectedLocationId, selectedDate]);

  useEffect(() => {
    if (activeTab === 'slots') { loadDashboard(); loadSlots(); }
    if (activeTab === 'hours') loadHours();
    if (activeTab === 'leaves') { loadHolidays(); loadTimeBlocks(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedLocationId, selectedDate, selectedStaffId]);

  // ═══════ SLOT İŞLEMLERİ ═══════
  const generateTimeSlots = () => {
    const list = [];
    let start = 9 * 60;
    const end = 21 * 60;
    while (start <= end) {
      const h = Math.floor(start / 60);
      const m = start % 60;
      list.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      start += 30;
    }
    return list;
  };
  const timeSlots = generateTimeSlots();

  const getSlotData = (time: string) => {
    return slots.find(s => s.time === time) || { capacity: 1, bookedCount: 0, isBlocked: false };
  };

  const handleBlockToggle = async (time: string, currentBlocked: boolean) => {
    setActionLoading(`${time}_block`);
    const staffVal = selectedStaffId === 'ANY' ? null : selectedStaffId;
    await blockSlot(selectedLocationId, staffVal, selectedDate, time, !currentBlocked, !currentBlocked ? 'Yönetici tarafından kapatıldı' : undefined);
    setActionLoading(null);
    loadSlots();
  };

  const handleCapacityChange = async (time: string, capacity: number) => {
    if (capacity < 1) return;
    setActionLoading(`${time}_cap`);
    const staffVal = selectedStaffId === 'ANY' ? null : selectedStaffId;
    await updateSlotCapacity(selectedLocationId, staffVal, selectedDate, time, capacity);
    setActionLoading(null);
    loadSlots();
  };

  // ═══════ ÇALIŞMA SAATLERİ İŞLEMLERİ ═══════
  const handleSaveLocationHours = async () => {
    setHoursSaving(true);
    const res = await updateLocationWorkingHours(selectedLocationId, locationHours);
    setHoursSaving(false);
    setHoursEditing(false);
    if (!res.success) alert(res.error || 'Hata!');
    else loadHours();
  };

  const handleSaveStaffHours = async (staffId: string) => {
    const hours = staffHoursMap[staffId];
    if (!hours) return;
    setHoursSaving(true);
    const res = await updateStaffWorkingHours(staffId, hours);
    setHoursSaving(false);
    if (!res.success) alert(res.error || 'Hata!');
  };

  const updateLocationHour = (dayOfWeek: number, field: string, value: any) => {
    setLocationHours(prev => prev.map(h =>
      h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
    ));
  };

  const updateStaffHour = (staffId: string, dayOfWeek: number, field: string, value: any) => {
    setStaffHoursMap(prev => ({
      ...prev,
      [staffId]: (prev[staffId] || []).map((h: any) =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      )
    }));
  };

  // ═══════ TATİL İŞLEMLERİ ═══════
  const handleAddHoliday = async () => {
    if (!newHolidayDate || !newHolidayDesc) return;
    const res = await addLocationHoliday(selectedLocationId, newHolidayDate, newHolidayDesc);
    if (res.success) { setNewHolidayDate(''); setNewHolidayDesc(''); loadHolidays(); }
    else alert(res.error || 'Hata!');
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Tatil günü silinsin mi?')) return;
    const res = await deleteLocationHoliday(id);
    if (res.success) loadHolidays();
    else alert(res.error || 'Hata!');
  };

  // ═══════ İZİN İŞLEMLERİ ═══════
  const handleAddLeave = async () => {
    if (!newLeaveStaffId || !newLeaveDate) return;
    const res = await addStaffLeave(newLeaveStaffId, {
      date: new Date(newLeaveDate + 'T00:00:00'),
      isFullDay: newLeaveFullDay,
      startTime: newLeaveFullDay ? undefined : newLeaveStart,
      endTime: newLeaveFullDay ? undefined : newLeaveEnd,
    });
    if (res.success) { setNewLeaveDate(''); alert('İzin eklendi!'); }
    else alert(res.error || 'Hata!');
  };

  // ═══════ TIMEBLOCK İŞLEMLERİ ═══════
  const handleAddTimeBlock = async () => {
    if (!newBlockDate || !newBlockStart || !newBlockEnd || !newBlockReason) return;
    const staffVal = newBlockStaffId || null;
    const res = await addTimeBlock(selectedLocationId, staffVal, newBlockDate, newBlockStart, newBlockEnd, newBlockReason);
    if (res.success) { setNewBlockDate(''); setNewBlockReason(''); loadTimeBlocks(); }
    else alert(res.error || 'Hata!');
  };

  const handleDeleteTimeBlock = async (id: string) => {
    if (!confirm('Bloke kaldırılsın mı?')) return;
    const res = await deleteTimeBlock(id);
    if (res.success) loadTimeBlocks();
    else alert(res.error || 'Hata!');
  };

  // ═══════ TOPLU SLOT İŞLEMLERİ ═══════
  const handleBulkCreate = async () => {
    const startMin = parseInt(bulkStartTime.split(':')[0]) * 60 + parseInt(bulkStartTime.split(':')[1]);
    const endMin = parseInt(bulkEndTime.split(':')[0]) * 60 + parseInt(bulkEndTime.split(':')[1]);
    const slotsToCreate = [];
    for (let m = startMin; m <= endMin; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slotsToCreate.push({ time: `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`, capacity: bulkCapacity });
    }
    const staffVal = selectedStaffId === 'ANY' ? null : selectedStaffId;
    const res = await createBulkSlots(selectedLocationId, staffVal, selectedDate, slotsToCreate);
    if (res.success) {
      setBulkResult(`✅ ${res.created} slot oluşturuldu, ${res.updated} slot güncellendi.`);
      loadSlots();
    } else {
      setBulkResult(`❌ ${res.error}`);
    }
  };

  // ═══════ TABS ═══════
  const tabs = [
    { key: 'slots' as const, label: 'Günlük Slotlar', shortLabel: 'Slotlar', icon: Clock },
    { key: 'hours' as const, label: 'Çalışma Saatleri', shortLabel: 'Saatler', icon: Settings },
    { key: 'leaves' as const, label: 'İzin & Tatil', shortLabel: 'İzin', icon: CalendarDays },
    { key: 'bulk' as const, label: 'Toplu İşlemler', shortLabel: 'Toplu', icon: Layers },
  ];

  return (
    <div className="space-y-6">
      {/* ═══════ FİLTRE BARI ═══════ */}
      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin size={14} /> Şube</label>
          <select value={selectedLocationId} onChange={(e) => { setSelectedLocationId(e.target.value); setSelectedStaffId('ANY'); }}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-sm">
            {locations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name} {loc.branchName ? `(${loc.branchName})` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><User size={14} /> Personel / Kapasite</label>
          <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-sm">
            <option value="ANY">Şube Genel Kapasitesi</option>
            {locationStaff.map((st: any) => <option key={st.id} value={st.id}>{st.name} ({st.specialty || 'Uzman'})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Calendar size={14} /> Tarih</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-sm" />
        </div>
      </div>

      {/* ═══════ SEKMELER ═══════ */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-gray-150 shadow-sm overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 md:px-4 py-3 rounded-xl font-semibold text-xs md:text-sm transition-all whitespace-nowrap ${
              activeTab === tab.key ? 'bg-gray-900 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-50'
            }`}>
            <tab.icon size={14} className="flex-shrink-0" /> <span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.shortLabel || tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════ TAB 1: GÜNLÜK SLOT GÖRÜNÜMÜ ═══════ */}
      {activeTab === 'slots' && (
        <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-gray-100 border-t-[var(--color-primary-500)] rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400">Slotlar yükleniyor...</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Dashboard Özet */}
              {dashboardData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-600 uppercase">Aktif Personel</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{dashboardData.staffList?.length || 0}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 uppercase">Randevular</p>
                    <p className="text-2xl font-black text-blue-700 mt-1">{dashboardData.appointments?.length || 0}</p>
                  </div>
                  <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                    <p className="text-xs font-bold text-amber-600 uppercase">Blokeler</p>
                    <p className="text-2xl font-black text-amber-700 mt-1">{dashboardData.timeBlocks?.length || 0}</p>
                  </div>
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                    <p className="text-xs font-bold text-purple-600 uppercase">Slot Kuralları</p>
                    <p className="text-2xl font-black text-purple-700 mt-1">{dashboardData.appointmentSlots?.length || 0}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {timeSlots.map(time => {
                  const slotData = getSlotData(time);
                  const isBlocked = slotData.isBlocked;
                  const capacity = slotData.capacity;
                  const bookedCount = slotData.bookedCount;

                  return (
                    <div key={time} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-36 ${
                      isBlocked ? 'bg-red-50/40 border-red-100 text-red-900' : bookedCount >= capacity ? 'bg-amber-50/40 border-amber-100 text-amber-900' : 'bg-white border-gray-150 hover:shadow-sm'
                    }`}>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-base tracking-wide flex items-center gap-1">
                          {time}
                          {isBlocked ? <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-bold uppercase">Kapalı</span> :
                           bookedCount >= capacity ? <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-bold uppercase">Dolu</span> :
                           <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold uppercase">Açık</span>}
                        </span>
                        <button onClick={() => handleBlockToggle(time, isBlocked)} disabled={actionLoading === `${time}_block`}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isBlocked ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          title={isBlocked ? 'Saati Aç' : 'Saati Kapat'}>
                          {isBlocked ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 font-semibold">
                          <span>Rez:</span><span className="font-bold text-gray-700">{bookedCount} / {capacity}</span>
                        </div>
                        {!isBlocked && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-500 font-semibold">Kap:</span>
                            <input type="number" min="1" value={capacity}
                              onChange={(e) => handleCapacityChange(time, parseInt(e.target.value) || 1)}
                              disabled={actionLoading === `${time}_cap`}
                              className="w-16 px-2 py-1 text-center bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none" />
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
      )}

      {/* ═══════ TAB 2: ÇALIŞMA SAATLERİ ═══════ */}
      {activeTab === 'hours' && (
        <div className="space-y-6">
          {/* Şube Çalışma Saatleri */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><MapPin size={18} className="text-gray-500" /> Şube Çalışma Saatleri</h3>
              <div className="flex gap-2">
                {hoursEditing ? (
                  <>
                    <button onClick={() => setHoursEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200">İptal</button>
                    <button onClick={handleSaveLocationHours} disabled={hoursSaving} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black flex items-center gap-1">
                      <Save size={14} /> {hoursSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setHoursEditing(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 flex items-center gap-1">
                    <Settings size={14} /> Düzenle
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                    <th className="p-3 text-left font-bold">Gün</th>
                    <th className="p-3 text-center font-bold">Durum</th>
                    <th className="p-3 text-center font-bold">Açılış</th>
                    <th className="p-3 text-center font-bold">Kapanış</th>
                    <th className="p-3 text-center font-bold">Mola Başı</th>
                    <th className="p-3 text-center font-bold">Mola Sonu</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4, 5, 6].map(day => {
                    const hour = locationHours.find((h: any) => h.dayOfWeek === day) || { dayOfWeek: day, openTime: '10:00', closeTime: '19:00', isClosed: false, breakStart: '', breakEnd: '' };
                    return (
                      <tr key={day} className={`border-b border-gray-50 ${hour.isClosed ? 'bg-red-50/30' : ''}`}>
                        <td className="p-3 font-semibold text-gray-700">{DAY_NAMES[day]}</td>
                        <td className="p-3 text-center">
                          {hoursEditing ? (
                            <label className="flex items-center justify-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={!hour.isClosed} onChange={(e) => updateLocationHour(day, 'isClosed', !e.target.checked)} className="rounded" />
                              <span className="text-xs">{hour.isClosed ? 'Kapalı' : 'Açık'}</span>
                            </label>
                          ) : (
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${hour.isClosed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{hour.isClosed ? 'Kapalı' : 'Açık'}</span>
                          )}
                        </td>
                        {['openTime', 'closeTime', 'breakStart', 'breakEnd'].map(field => (
                          <td key={field} className="p-3 text-center">
                            {hoursEditing && !hour.isClosed ? (
                              <input type="time" value={hour[field] || ''} onChange={(e) => updateLocationHour(day, field, e.target.value || null)}
                                className="px-2 py-1 border border-gray-200 rounded-lg text-xs text-center w-24" />
                            ) : (
                              <span className="text-gray-600">{hour[field] || '-'}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Personel Çalışma Saatleri */}
          {locationStaff.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-6"><User size={18} className="text-gray-500" /> Personel Çalışma Saatleri</h3>
              <div className="space-y-4">
                {locationStaff.map((staff: any) => (
                  <details key={staff.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                    <summary className="p-4 bg-gray-50/50 cursor-pointer font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-100/50">
                      <User size={16} className="text-gray-400" /> {staff.name} <span className="text-xs text-gray-400 font-normal">({staff.specialty || 'Uzman'})</span>
                    </summary>
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                            <th className="p-2 text-left font-bold">Gün</th>
                            <th className="p-2 text-center font-bold">Durum</th>
                            <th className="p-2 text-center font-bold">Başlangıç</th>
                            <th className="p-2 text-center font-bold">Bitiş</th>
                            <th className="p-2 text-center font-bold">Mola B.</th>
                            <th className="p-2 text-center font-bold">Mola S.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[0, 1, 2, 3, 4, 5, 6].map(day => {
                            const hours = (staffHoursMap[staff.id] || staff.workingHours || []);
                            const h = hours.find((wh: any) => wh.dayOfWeek === day) || { dayOfWeek: day, openTime: '09:00', closeTime: '19:00', isClosed: false, breakStart: '', breakEnd: '' };
                            return (
                              <tr key={day} className={`border-b border-gray-50 ${h.isClosed ? 'bg-red-50/20' : ''}`}>
                                <td className="p-2 font-semibold text-gray-600 text-xs">{DAY_NAMES[day]}</td>
                                <td className="p-2 text-center">
                                  <label className="flex items-center justify-center gap-1 cursor-pointer">
                                    <input type="checkbox" checked={!h.isClosed} onChange={(e) => updateStaffHour(staff.id, day, 'isClosed', !e.target.checked)} className="rounded" />
                                    <span className="text-[10px]">{h.isClosed ? 'Kapalı' : 'Açık'}</span>
                                  </label>
                                </td>
                                {['openTime', 'closeTime', 'breakStart', 'breakEnd'].map(field => (
                                  <td key={field} className="p-2 text-center">
                                    <input type="time" value={h[field] || ''} onChange={(e) => updateStaffHour(staff.id, day, field, e.target.value || null)}
                                      disabled={h.isClosed} className="px-1 py-1 border border-gray-200 rounded-lg text-[11px] text-center w-20 disabled:opacity-40" />
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="flex justify-end mt-3">
                        <button onClick={() => handleSaveStaffHours(staff.id)} disabled={hoursSaving}
                          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-black flex items-center gap-1">
                          <Save size={12} /> Kaydet
                        </button>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ TAB 3: İZİN & TATİL YÖNETİMİ ═══════ */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Şube Tatil Günleri */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4"><CalendarDays size={18} className="text-gray-500" /> Şube Tatil Günleri</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <input type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <input type="text" placeholder="Açıklama (ör: Bayram)" value={newHolidayDesc} onChange={(e) => setNewHolidayDesc(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm flex-1 min-w-48" />
              <button onClick={handleAddHoliday} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black flex items-center gap-1">
                <Plus size={14} /> Ekle
              </button>
            </div>
            {holidays.length > 0 ? (
              <div className="space-y-2">
                {holidays.map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-3 bg-red-50/40 border border-red-100 rounded-xl">
                    <div>
                      <span className="font-bold text-sm text-red-800">{new Date(h.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="ml-2 text-xs text-red-600">{h.description}</span>
                    </div>
                    <button onClick={() => handleDeleteHoliday(h.id)} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Henüz tatil günü eklenmemiş.</p>
            )}
          </div>

          {/* Personel İzinleri */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4"><User size={18} className="text-gray-500" /> Personel İzin Ekle</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <select value={newLeaveStaffId} onChange={(e) => setNewLeaveStaffId(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="">Personel seçin...</option>
                {locationStaff.map((st: any) => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
              <input type="date" value={newLeaveDate} onChange={(e) => setNewLeaveDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 cursor-pointer text-sm">
                  <input type="checkbox" checked={newLeaveFullDay} onChange={(e) => setNewLeaveFullDay(e.target.checked)} className="rounded" /> Tam Gün
                </label>
                {!newLeaveFullDay && (
                  <div className="flex gap-1">
                    <input type="time" value={newLeaveStart} onChange={(e) => setNewLeaveStart(e.target.value)} className="px-2 py-1 border border-gray-200 rounded-lg text-xs w-20" />
                    <input type="time" value={newLeaveEnd} onChange={(e) => setNewLeaveEnd(e.target.value)} className="px-2 py-1 border border-gray-200 rounded-lg text-xs w-20" />
                  </div>
                )}
              </div>
              <button onClick={handleAddLeave} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black flex items-center gap-1">
                <Plus size={14} /> İzin Ekle
              </button>
            </div>

            {/* Mevcut İzinler */}
            {locationStaff.some((st: any) => st.leaves?.length > 0) && (
              <div className="space-y-2 mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase">Mevcut İzinler</p>
                {locationStaff.map((st: any) => st.leaves?.map((leave: any) => (
                  <div key={leave.id} className="flex items-center justify-between p-3 bg-amber-50/40 border border-amber-100 rounded-xl">
                    <div>
                      <span className="font-bold text-sm text-amber-800">{st.name}</span>
                      <span className="ml-2 text-xs text-amber-600">
                        {new Date(leave.date).toLocaleDateString('tr-TR')} {leave.isFullDay ? '(Tam gün)' : `${leave.startTime}-${leave.endTime}`}
                      </span>
                    </div>
                    <button onClick={async () => { if (confirm('İzin silinsin mi?')) { await deleteStaffLeave(leave.id); alert('Silindi'); } }}
                      className="p-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"><Trash2 size={14} /></button>
                  </div>
                )))}
              </div>
            )}
          </div>

          {/* TimeBlock Yönetimi */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4"><Timer size={18} className="text-gray-500" /> Saat Blokesi Ekle</h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
              <select value={newBlockStaffId} onChange={(e) => setNewBlockStaffId(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="">Şube Geneli</option>
                {locationStaff.map((st: any) => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
              <input type="date" value={newBlockDate} onChange={(e) => setNewBlockDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <input type="time" value={newBlockStart} onChange={(e) => setNewBlockStart(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <input type="time" value={newBlockEnd} onChange={(e) => setNewBlockEnd(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <input type="text" placeholder="Neden" value={newBlockReason} onChange={(e) => setNewBlockReason(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <button onClick={handleAddTimeBlock} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black flex items-center gap-1">
                <Plus size={14} /> Ekle
              </button>
            </div>
            {timeBlocks.length > 0 && (
              <div className="space-y-2">
                {timeBlocks.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-orange-50/40 border border-orange-100 rounded-xl">
                    <div>
                      <span className="font-bold text-sm text-orange-800">{b.startTime} - {b.endTime}</span>
                      <span className="ml-2 text-xs text-orange-600">{b.staff?.name || 'Şube Geneli'} — {b.reason}</span>
                    </div>
                    <button onClick={() => handleDeleteTimeBlock(b.id)} className="p-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ TAB 4: TOPLU İŞLEMLER ═══════ */}
      {activeTab === 'bulk' && (
        <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-6"><Layers size={18} className="text-gray-500" /> Toplu Slot Oluşturma</h3>
          <p className="text-sm text-gray-500 mb-4">Seçili şube, personel ve tarih için belirtilen saat aralığında toplu slot kapasitesi oluşturun.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Başlangıç Saati</label>
              <input type="time" value={bulkStartTime} onChange={(e) => setBulkStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bitiş Saati</label>
              <input type="time" value={bulkEndTime} onChange={(e) => setBulkEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kapasite</label>
              <input type="number" min="1" value={bulkCapacity} onChange={(e) => setBulkCapacity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div className="flex items-end">
              <button onClick={handleBulkCreate} className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black flex items-center justify-center gap-1">
                <Plus size={14} /> Oluştur
              </button>
            </div>
          </div>

          {bulkResult && (
            <div className={`p-4 rounded-2xl border text-sm font-semibold ${bulkResult.includes('✅') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              {bulkResult}
            </div>
          )}

          <div className="mt-6 bg-amber-50/60 border border-amber-100 p-4 rounded-2xl text-amber-800 text-xs flex gap-2">
            <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Bilgi:</p>
              <p className="mt-1">Bu işlem seçili tarih için 30 dakikalık aralıklarla slot oluşturur. Mevcut slotların kapasitesi güncellenir, yeni slotlar oluşturulur.</p>
              <p className="mt-1">Seçili personel: <strong>{selectedStaffId === 'ANY' ? 'Şube Geneli' : locationStaff.find(s => s.id === selectedStaffId)?.name || 'Bilinmiyor'}</strong></p>
              <p>Seçili tarih: <strong>{selectedDate}</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
