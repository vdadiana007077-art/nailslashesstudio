"use client";

import Image from 'next/image';
import { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar, 
  Check, 
  X, 
  UserPlus, 
  Award, 
  MapPin, 
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Loader2
} from 'lucide-react';
import { 
  createStaff, 
  updateStaff, 
  deleteStaff, 
  updateStaffWorkingHours, 
  addStaffLeave, 
  deleteStaffLeave 
} from '@/app/actions/staff';

type LocationOption = {
  id: string;
  name: string;
};

type ServiceOption = {
  id: string;
  name: string;
  duration: number;
  price: string;
};

type WorkingHoursItem = {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  breakStart?: string | null;
  breakEnd?: string | null;
};

type LeaveItem = {
  id: string;
  date: string;
  isFullDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
};

type StaffMember = {
  id: string;
  name: string;
  image?: string | null;
  specialty?: string | null;
  isActive: boolean;
  locationId?: string | null;
  locationName: string;
  commissionRate: number;
  serviceIds: string[];
  workingHours: WorkingHoursItem[];
  leaves: LeaveItem[];
};

type StaffClientProps = {
  initialStaff: StaffMember[];
  locations: LocationOption[];
  services: ServiceOption[];
  };

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export default function StaffClient({ initialStaff, locations, services }: StaffClientProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modallerin durumları
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | 'workingHours' | 'leaves' | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Form Değişkenleri (Create / Edit)
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [locationId, setLocationId] = useState('');
  const [commissionRate, setCommissionRate] = useState(0);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Çalışma Saatleri Değişkenleri
  const [workingHoursList, setWorkingHoursList] = useState<WorkingHoursItem[]>([]);

  // İzin Değişkenleri
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveIsFullDay, setLeaveIsFullDay] = useState(true);
  const [leaveStartTime, setLeaveStartTime] = useState('09:00');
  const [leaveEndTime, setLeaveEndTime] = useState('18:00');

  const openCreateModal = () => {
    setName('');
    setImage('');
    setSpecialty('');
    setLocationId(locations[0]?.id || '');
    setCommissionRate(0);
    setSelectedServiceIds([]);
    setIsActive(true);
    setActiveModal('create');
  };

  const openEditModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setName(staff.name);
    setImage(staff.image || '');
    setSpecialty(staff.specialty || '');
    setLocationId(staff.locationId || '');
    setCommissionRate(staff.commissionRate);
    setSelectedServiceIds(staff.serviceIds);
    setIsActive(staff.isActive);
    setActiveModal('edit');
  };

  const openWorkingHoursModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
    // 7 günün de listede olduğundan emin olalım
    const hours = [...staff.workingHours];
    for (let day = 0; day <= 6; day++) {
      if (!hours.some(h => h.dayOfWeek === day)) {
        hours.push({
          dayOfWeek: day,
          openTime: '09:00',
          closeTime: '19:00',
          isClosed: day === 0,
          breakStart: '13:00',
          breakEnd: '14:00'
        });
      }
    }
    const sortedHours = hours.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    setWorkingHoursList(JSON.parse(JSON.stringify(sortedHours)));
    setActiveModal('workingHours');
  };

  const openLeavesModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setLeaveDate('');
    setLeaveIsFullDay(true);
    setLeaveStartTime('09:00');
    setLeaveEndTime('18:00');
    setActiveModal('leaves');
  };

  // Personel Kaydet (Create)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await createStaff({
      name,
      image: image || undefined,
      specialty: specialty || undefined,
      locationId: locationId || undefined,
      commissionRate,
      serviceIds: selectedServiceIds
    });

    setIsSubmitting(false);

    if (result.success && result.data) {
      // Listeyi güncelle (yeni çalışana boş çalışma saatleri ve izinler ekleyelim)
      const newStaff: StaffMember = {
        ...result.data,
        locationName: locations.find(l => l.id === locationId)?.name || 'Şube Atanmamış',
        commissionRate: Number(result.data.commissionRate || 0),
        serviceIds: selectedServiceIds,
        workingHours: [],
        leaves: []
      };
      setStaffList(prev => [...prev, newStaff].sort((a, b) => a.name.localeCompare(b.name)));
      setActiveModal(null);
      // Sayfayı revalidate etmesi için reload edelim ki tam verileri prisma ilişkileriyle çeksin
      window.location.reload();
    } else {
      alert(result.error || 'Personel eklenirken hata oluştu.');
    }
  };

  // Personel Güncelle (Edit)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);

    const result = await updateStaff(selectedStaff.id, {
      name,
      image: image || undefined,
      specialty: specialty || undefined,
      locationId: locationId || undefined,
      commissionRate,
      isActive,
      serviceIds: selectedServiceIds
    });

    setIsSubmitting(false);

    if (result.success && result.data) {
      setStaffList(prev => prev.map(st => {
        if (st.id === selectedStaff.id) {
          return {
            ...st,
            name,
            image,
            specialty,
            locationId,
            locationName: locations.find(l => l.id === locationId)?.name || 'Şube Atanmamış',
            commissionRate,
            isActive,
            serviceIds: selectedServiceIds
          };
        }
        return st;
      }));
      setActiveModal(null);
    } else {
      alert(result.error || 'Personel güncellenirken hata oluştu.');
    }
  };

  // Personel Sil (Soft Delete)
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} isimli personeli pasife almak ve listeden kaldırmak istediğinize emin misiniz?`)) return;

    const result = await deleteStaff(id);
    if (result.success) {
      setStaffList(prev => prev.filter(st => st.id !== id));
    } else {
      alert(result.error || 'Personel silinirken hata oluştu.');
    }
  };

  // Çalışma Saatleri Kaydet
  const handleWorkingHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);

    const result = await updateStaffWorkingHours(selectedStaff.id, workingHoursList);
    setIsSubmitting(false);

    if (result.success) {
      // Saatleri güncelle
      setStaffList(prev => prev.map(st => {
        if (st.id === selectedStaff.id) {
          return { ...st, workingHours: workingHoursList };
        }
        return st;
      }));
      setActiveModal(null);
      window.location.reload(); // Prisma id'leri yenilendiği için reload en güvenlisi
    } else {
      alert(result.error || 'Çalışma saatleri güncellenirken hata oluştu.');
    }
  };

  // İzin Ekle
  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !leaveDate) return;
    setIsSubmitting(true);

    const result = await addStaffLeave(selectedStaff.id, {
      date: new Date(leaveDate),
      isFullDay: leaveIsFullDay,
      startTime: leaveIsFullDay ? undefined : leaveStartTime,
      endTime: leaveIsFullDay ? undefined : leaveEndTime
    });

    setIsSubmitting(false);

    if (result.success && result.data) {
      const newLeave: LeaveItem = {
        id: result.data.id,
        date: leaveDate,
        isFullDay: leaveIsFullDay,
        startTime: leaveIsFullDay ? null : leaveStartTime,
        endTime: leaveIsFullDay ? null : leaveEndTime
      };

      setStaffList(prev => prev.map(st => {
        if (st.id === selectedStaff.id) {
          return { ...st, leaves: [...st.leaves, newLeave].sort((a, b) => a.date.localeCompare(b.date)) };
        }
        return st;
      }));

      // Seçilen çalışanın izinlerini de güncelle
      setSelectedStaff(prev => {
        if (!prev) return null;
        return { ...prev, leaves: [...prev.leaves, newLeave].sort((a, b) => a.date.localeCompare(b.date)) };
      });

      setLeaveDate('');
    } else {
      alert(result.error || 'İzin eklenirken hata oluştu.');
    }
  };

  // İzin Sil
  const handleDeleteLeave = async (leaveId: string) => {
    if (!confirm('Bu izin kaydını silmek istediğinize emin misiniz?')) return;
    if (!selectedStaff) return;

    setIsSubmitting(true);
    const result = await deleteStaffLeave(leaveId);
    setIsSubmitting(false);

    if (result.success) {
      setStaffList(prev => prev.map(st => {
        if (st.id === selectedStaff.id) {
          return { ...st, leaves: st.leaves.filter(l => l.id !== leaveId) };
        }
        return st;
      }));

      setSelectedStaff(prev => {
        if (!prev) return null;
        return { ...prev, leaves: prev.leaves.filter(l => l.id !== leaveId) };
      });
    } else {
      alert(result.error || 'İzin silinirken hata oluştu.');
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Aktif Çalışanlar ({staffList.length})</h3>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-rose-600)] text-white font-medium rounded-xl hover:bg-[var(--color-rose-700)] transition-all shadow-sm text-sm"
        >
          <Plus size={16} />
          Yeni Personel Ekle
        </button>
      </div>

      {staffList.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-2xl">
          <UserPlus size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-medium">Kayıtlı personel bulunamadı.</p>
          <p className="text-xs text-gray-400 mt-1">Sisteme ilk çalışanı ekleyerek randevu almaya hazır hale getirin.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-4">Uzman / Personel</th>
                <th className="py-4 px-4">Şube</th>
                <th className="py-4 px-4">Komisyon (%)</th>
                <th className="py-4 px-4">Hizmet Sayısı</th>
                <th className="py-4 px-4">Durum</th>
                <th className="py-4 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-rose-50)] border border-[var(--color-rose-200)] flex items-center justify-center font-bold text-[var(--color-rose-700)] overflow-hidden">
                        {staff.image ? (
                          <Image width={800} height={800} src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
                        ) : (
                          staff.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{staff.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Award size={12} /> {staff.specialty || 'Güzellik Uzmanı'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" />
                      {staff.locationName}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700 font-semibold">
                    %{staff.commissionRate}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-medium rounded-full text-xs">
                      {staff.serviceIds.length} Hizmet
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      staff.isActive 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      {staff.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => openWorkingHoursModal(staff)}
                      title="Çalışma Saatleri"
                      className="p-2 text-gray-500 hover:text-[var(--color-rose-700)] hover:bg-[var(--color-rose-50)] rounded-lg transition-all"
                    >
                      <Clock size={16} />
                    </button>
                    <button
                      onClick={() => openLeavesModal(staff)}
                      title="İzin Günleri"
                      className="p-2 text-gray-500 hover:text-[var(--color-rose-700)] hover:bg-[var(--color-rose-50)] rounded-lg transition-all"
                    >
                      <Calendar size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(staff)}
                      title="Düzenle"
                      className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(staff.id, staff.name)}
                      title="Pasife Al / Sil"
                      className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[var(--color-rose-50)] p-6 border-b border-[var(--color-rose-100)] flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                {activeModal === 'create' ? 'Yeni Personel Ekle' : 'Personel Düzenle'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={activeModal === 'create' ? handleCreateSubmit : handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ad Soyad</label>
                  <input
                    type="text" required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] transition-all"
                    placeholder="Örn: Merve Kaya"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Uzmanlık / Branş</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] transition-all"
                    placeholder="Örn: Protez Tırnak Uzmanı"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Şube</label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] transition-all bg-white"
                  >
                    <option value="">Şube Seçin</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Komisyon Oranı (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0" max="100"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-full p-2.5 pl-8 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] transition-all"
                      placeholder="0"
                    />
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fotoğraf URL (Opsiyonel)</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {activeModal === 'edit' && (
                <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-semibold text-gray-700">Personel Çalışma Durumu</span>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className="text-[var(--color-rose-600)] transition-colors outline-none"
                  >
                    {isActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-gray-400" />}
                  </button>
                </div>
              )}

              {/* HİZMET YETKİNLİKLERİ ÇOKLU SEÇİM */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Yetkin Olduğu Hizmetler</label>
                <div className="border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2">
                  {services.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(s.id)}
                        onChange={() => handleServiceToggle(s.id)}
                        className="rounded border-gray-300 text-[var(--color-rose-600)] focus:ring-[var(--color-rose-500)]"
                      />
                      <span className="text-gray-700 truncate">{s.name} ({s.duration} dk)</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {activeModal === 'create' ? 'Personel Ekle' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORKING HOURS MODAL */}
      {activeModal === 'workingHours' && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[var(--color-rose-50)] p-6 border-b border-[var(--color-rose-100)] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Çalışma Saatleri</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedStaff.name} haftalık mesai ve mola planı</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWorkingHoursSubmit} className="p-6">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {workingHoursList.map((wh, idx) => (
                  <div key={idx} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all ${
                    wh.isClosed 
                      ? 'bg-gray-50/70 border-gray-200 opacity-60' 
                      : 'bg-white border-gray-200 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-3 mb-3 md:mb-0">
                      <div className="w-28">
                        <span className="font-bold text-gray-800">{DAY_NAMES[wh.dayOfWeek]}</span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600">
                        <input
                          type="checkbox"
                          checked={!wh.isClosed}
                          onChange={(e) => {
                            const updated = [...workingHoursList];
                            updated[idx].isClosed = !e.target.checked;
                            setWorkingHoursList(updated);
                          }}
                          className="rounded border-gray-300 text-[var(--color-rose-600)] focus:ring-[var(--color-rose-500)]"
                        />
                        {wh.isClosed ? 'KAPALI' : 'AÇIK'}
                      </label>
                    </div>

                    {!wh.isClosed && (
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">Mesai:</span>
                          <input
                            type="text"
                            value={wh.openTime}
                            onChange={(e) => {
                              const updated = [...workingHoursList];
                              updated[idx].openTime = e.target.value;
                              setWorkingHoursList(updated);
                            }}
                            className="w-16 p-1.5 border border-gray-200 rounded text-center outline-none"
                            placeholder="09:00"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="text"
                            value={wh.closeTime}
                            onChange={(e) => {
                              const updated = [...workingHoursList];
                              updated[idx].closeTime = e.target.value;
                              setWorkingHoursList(updated);
                            }}
                            className="w-16 p-1.5 border border-gray-200 rounded text-center outline-none"
                            placeholder="19:00"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">Mola (Öğle):</span>
                          <input
                            type="text"
                            value={wh.breakStart || ''}
                            onChange={(e) => {
                              const updated = [...workingHoursList];
                              updated[idx].breakStart = e.target.value || null;
                              setWorkingHoursList(updated);
                            }}
                            className="w-16 p-1.5 border border-gray-200 rounded text-center outline-none"
                            placeholder="13:00"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="text"
                            value={wh.breakEnd || ''}
                            onChange={(e) => {
                              const updated = [...workingHoursList];
                              updated[idx].breakEnd = e.target.value || null;
                              setWorkingHoursList(updated);
                            }}
                            className="w-16 p-1.5 border border-gray-200 rounded text-center outline-none"
                            placeholder="14:00"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Çalışma Saatlerini Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAVES MODAL */}
      {activeModal === 'leaves' && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[var(--color-rose-50)] p-6 border-b border-[var(--color-rose-100)] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Personel İzin Yönetimi</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedStaff.name} izin ve tatil günleri takvimi</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Leave Form */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-bold text-sm text-gray-800 mb-4 flex items-center gap-1.5">
                  <Calendar size={16} className="text-[var(--color-rose-600)]" />
                  Yeni İzin Tanımla
                </h4>
                <form onSubmit={handleAddLeave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">İzin Tarihi</label>
                    <input
                      type="date" required
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] transition-all bg-white text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">Tüm Gün Mü?</span>
                    <button
                      type="button"
                      onClick={() => setLeaveIsFullDay(!leaveIsFullDay)}
                      className="text-[var(--color-rose-600)] transition-colors outline-none"
                    >
                      {leaveIsFullDay ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-gray-400" />}
                    </button>
                  </div>

                  {!leaveIsFullDay && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Başlangıç</label>
                        <input
                          type="text" required
                          value={leaveStartTime}
                          onChange={(e) => setLeaveStartTime(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] bg-white text-center text-sm"
                          placeholder="09:00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Bitiş</label>
                        <input
                          type="text" required
                          value={leaveEndTime}
                          onChange={(e) => setLeaveEndTime(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] bg-white text-center text-sm"
                          placeholder="18:00"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !leaveDate}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition-colors disabled:opacity-50 text-sm"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    İzin Ekle
                  </button>
                </form>
              </div>

              {/* Leave List */}
              <div className="flex flex-col h-[320px]">
                <h4 className="font-bold text-sm text-gray-800 mb-3">Tanımlı İzinler ({selectedStaff.leaves.length})</h4>
                <div className="flex-1 border border-gray-200 rounded-xl overflow-y-auto divide-y divide-gray-100 p-2 space-y-2">
                  {selectedStaff.leaves.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      Eklenmiş izin günü yok.
                    </div>
                  ) : (
                    selectedStaff.leaves.map((l) => (
                      <div key={l.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100/50">
                        <div className="text-sm">
                          <p className="font-bold text-gray-800">
                            {new Date(l.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock size={12} />
                            {l.isFullDay ? 'Tüm Gün İzinli' : `${l.startTime} - ${l.endTime}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLeave(l.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-gray-900 hover:bg-black text-white font-medium rounded-xl text-sm transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
