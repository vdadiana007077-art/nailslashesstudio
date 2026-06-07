"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2,
  MapPin,
  Scissors,
  Layers
} from 'lucide-react';
import { createBooking } from '@/app/actions/booking';
import { getAvailableTimeSlots } from '@/app/actions/availability';
import type { SlotInfo } from '@/app/actions/availability';
import { useTranslations } from 'next-intl';

type Location = { id: string; name: string; address: string; phone: string; };
type Category = { id: string; name: string; image: string; };
type Service = { id: string; name: string; price: string; duration: number; categoryId: string; categoryName: string; locationIds: string[]; };
type Staff = { id: string; name: string; image: string; specialty: string; locationId: string; serviceIds: string[]; };

type BookingFormProps = {
  initialLocations: Location[];
  initialCategories: Category[];
  initialServices: Service[];
  initialStaff: Staff[];
  initialCustomer?: { name: string; email: string; phone: string } | null;
};

const TOTAL_STEPS = 7; // 6 adım + success

export default function BookingForm({ initialLocations, initialCategories, initialServices, initialStaff, initialCustomer }: BookingFormProps) {
  const t = useTranslations("Booking");
  const params = useParams();
  const locale = (params?.locale as string) || 'tr';
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null | 'ANY'>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slotDetails, setSlotDetails] = useState<SlotInfo[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    name: initialCustomer?.name || '',
    phone: initialCustomer?.phone || '',
    email: initialCustomer?.email || '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Oturum açıldığında bilgileri otomatik doldur
  useEffect(() => {
    if (initialCustomer) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || initialCustomer.name,
        phone: prev.phone || initialCustomer.phone,
        email: prev.email || initialCustomer.email
      }));
    }
  }, [initialCustomer]);

  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => {
    if (step === 5) { setSelectedTime(null); setSlotDetails([]); }
    setStep((s) => Math.max(s - 1, 1));
  };

  // Şubeye ve seçili şubeye göre filtrelenmiş kategoriler
  const availableCategories = (() => {
    if (!selectedLocation) return [];
    const servicesInLocation = initialServices.filter(s => s.locationIds.includes(selectedLocation.id));
    const categoryIds = new Set(servicesInLocation.map(s => s.categoryId));
    return initialCategories.filter(c => categoryIds.has(c.id));
  })();

  // Şube + kategoriye göre filtrelenmiş hizmetler
  const filteredServices = (() => {
    if (!selectedLocation || !selectedCategory) return [];
    return initialServices.filter(s =>
      s.categoryId === selectedCategory.id &&
      s.locationIds.includes(selectedLocation.id)
    );
  })();

  // Seçilen hizmete ve şubeye göre filtrelenmiş personeller
  const filteredStaff = initialStaff.filter(st => {
    if (!selectedLocation || !selectedService) return false;
    if (st.locationId !== selectedLocation.id) return false;
    if (st.serviceIds.length === 0) return true;
    return st.serviceIds.includes(selectedService.id);
  });

  // Tarih değiştiğinde müsait saat slotlarını çek
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedLocation || !selectedService || !selectedDate || !selectedStaff) return;
      
      setIsLoadingSlots(true);
      setSelectedTime(null);
      
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const staffIdParam = selectedStaff === 'ANY' ? 'ANY' : selectedStaff.id;

      const result = await getAvailableTimeSlots(
        selectedLocation.id,
        selectedService.id,
        dateStr,
        staffIdParam
      );

      setIsLoadingSlots(false);

      if (result.success) {
        setSlotDetails(result.slotDetails || []);
      } else {
        setSlotDetails([]);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedStaff, selectedService, selectedLocation]);

  // 30 gün takvim
  const getNext30Days = () => {
    const days = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const [calendarPage, setCalendarPage] = useState(0);
  const allDays = getNext30Days();
  const DAYS_PER_PAGE = 7;
  const pagedDays = allDays.slice(calendarPage * DAYS_PER_PAGE, (calendarPage + 1) * DAYS_PER_PAGE);
  const totalPages = Math.ceil(allDays.length / DAYS_PER_PAGE);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation || !selectedService || !selectedDate || !selectedTime || !selectedStaff) return;
    if (!formData.name.trim()) { alert(t('missingNameError')); return; }
    if (!formData.email.trim()) { alert(t('missingEmailError')); return; }
    if (!formData.phone.trim()) { alert(t('missingPhoneError')); return; }

    setIsSubmitting(true);
    const staffIdParam = selectedStaff === 'ANY' ? 'ANY' : selectedStaff.id;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;

    const result = await createBooking({
      serviceId: selectedService.id,
      locationId: selectedLocation.id,
      staffId: staffIdParam,
      dateStr: dateString,
      startTime: selectedTime,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      locale: locale
    });

    setIsSubmitting(false);
    if (result.success) {
      setStep(TOTAL_STEPS);
    } else {
      alert(result.error || t('bookingError'));
    }
  };

  // Progress bar step sayıları (1-6, success 7)
  return (
    <div className="w-full max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden bg-white/80 border border-[var(--color-rose-100)] shadow-lg">
      
      {/* Progress Bar */}
      {step < TOTAL_STEPS && (
        <div className="mb-10 relative">
          <div className="flex justify-between items-center relative z-10">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 text-sm ${
                step >= num 
                  ? 'bg-[var(--color-rose-600)] text-white shadow-[0_0_15px_rgba(184,123,127,0.4)]' 
                  : 'bg-white text-gray-400 border border-gray-200'
              }`}>
                {num}
              </div>
            ))}
          </div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0">
            <div className="h-full bg-[var(--color-rose-500)] transition-all duration-500" style={{ width: `${((step - 1) / 5) * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* ═══════ STEP 1: ŞUBE SEÇİMİ ═══════ */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-950 mb-2">{t('selectLocationTitle')}</h2>
            <p className="text-gray-500">{t('selectLocationDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {initialLocations.map((loc) => (
              <div key={loc.id}
                onClick={() => { setSelectedLocation(loc); setSelectedCategory(null); setSelectedService(null); setSelectedStaff(null); setSelectedTime(null); }}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 flex flex-col justify-between ${
                  selectedLocation?.id === loc.id ? 'border-[var(--color-rose-500)] bg-[var(--color-rose-50)]/50' : 'border-gray-100 bg-white hover:border-[var(--color-rose-200)] hover:bg-gray-50/50'
                }`}>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{loc.name}</h3>
                  <p className="text-sm text-gray-500 flex items-start gap-1.5 leading-relaxed"><MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />{loc.address}</p>
                </div>
                {loc.phone && <p className="text-xs text-gray-400 mt-4">{t('phoneLabel')} {loc.phone}</p>}
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button onClick={nextStep} disabled={!selectedLocation} className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-md">
              {t('proceedToService')} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 2: KATEGORİ SEÇİMİ ═══════ */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-950 mb-2">{t('selectCategoryTitle') || 'Kategori Seçin'}</h2>
            <p className="text-gray-500">{t('selectCategoryDesc') || 'Hizmet kategorisini seçin'}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {availableCategories.map((cat) => (
              <div key={cat.id}
                onClick={() => { setSelectedCategory(cat); setSelectedService(null); setSelectedStaff(null); setSelectedTime(null); }}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 flex flex-col items-center text-center ${
                  selectedCategory?.id === cat.id ? 'border-[var(--color-rose-500)] bg-[var(--color-rose-50)]/50 shadow-sm' : 'border-gray-100 bg-white hover:border-[var(--color-rose-200)] hover:bg-gray-50/50'
                }`}>
                <div className="w-16 h-16 rounded-full bg-[var(--color-rose-50)] border border-[var(--color-rose-200)] flex items-center justify-center mb-3 overflow-hidden">
                  {cat.image ? <Image width={800} height={800} src={cat.image} alt={cat.name} className="w-full h-full object-cover" /> : <Layers size={24} className="text-[var(--color-rose-600)]" />}
                </div>
                <h3 className="font-bold text-gray-900 text-base">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {initialServices.filter(s => s.categoryId === cat.id && s.locationIds.includes(selectedLocation?.id || '')).length} {t('services') || 'hizmet'}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <button onClick={prevStep} className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2 text-sm">
              <ChevronLeft size={18} /> {t('back')}
            </button>
            <button onClick={nextStep} disabled={!selectedCategory} className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-md">
              {t('proceedToService')} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 3: HİZMET SEÇİMİ ═══════ */}
      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-950 mb-2">{t('selectServiceTitle')}</h2>
            <p className="text-gray-500">{selectedCategory?.name} — {selectedLocation?.name}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-h-[50vh] overflow-y-auto pr-2">
            {filteredServices.map((service) => (
              <div key={service.id}
                onClick={() => { setSelectedService(service); setSelectedStaff(null); setSelectedTime(null); }}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                  selectedService?.id === service.id ? 'border-[var(--color-rose-500)] bg-[var(--color-rose-50)]/50 shadow-sm' : 'border-gray-100 bg-white hover:border-[var(--color-rose-200)] hover:bg-gray-50/50'
                }`}>
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="font-bold text-base text-gray-900">{service.name}</h3>
                  <span className="font-bold text-[var(--color-rose-600)] flex-shrink-0">₺{service.price}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                  <span className="flex items-center gap-1"><Clock size={14} /> {service.duration} {t('minutes')}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <button onClick={prevStep} className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2 text-sm">
              <ChevronLeft size={18} /> {t('back')}
            </button>
            <button onClick={nextStep} disabled={!selectedService} className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-md">
              {t('proceedToSpecialist')} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 4: PERSONEL SEÇİMİ ═══════ */}
      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-950 mb-2">{t('selectSpecialistTitle')}</h2>
            <p className="text-gray-500">{selectedService?.name} — {t('selectSpecialistDesc')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {/* Fark Etmez */}
            <div onClick={() => { setSelectedStaff('ANY'); setSelectedDate(null); setSelectedTime(null); }}
              className={`p-6 rounded-2xl cursor-pointer transition-all border-2 flex flex-col items-center justify-center text-center ${
                selectedStaff === 'ANY' ? 'border-[var(--color-rose-500)] bg-[var(--color-rose-50)]/50 shadow-sm' : 'border-gray-100 bg-white hover:border-[var(--color-rose-200)] hover:bg-gray-50/50'
              }`}>
              <div className="w-16 h-16 rounded-full bg-[var(--color-rose-100)] border border-[var(--color-rose-200)] flex items-center justify-center font-bold text-[var(--color-rose-700)] mb-3">ANY</div>
              <h3 className="font-bold text-gray-900 text-base">{t('doesNotMatter')}</h3>
              <p className="text-xs text-gray-400 mt-1">{t('doesNotMatterDesc')}</p>
            </div>
            {filteredStaff.map((staff) => (
              <div key={staff.id}
                onClick={() => { setSelectedStaff(staff); setSelectedDate(null); setSelectedTime(null); }}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 flex flex-col items-center text-center ${
                  selectedStaff !== 'ANY' && selectedStaff?.id === staff.id ? 'border-[var(--color-rose-500)] bg-[var(--color-rose-50)]/50 shadow-sm' : 'border-gray-100 bg-white hover:border-[var(--color-rose-200)] hover:bg-gray-50/50'
                }`}>
                <div className="w-16 h-16 rounded-full bg-[var(--color-rose-50)] border border-[var(--color-rose-200)] flex items-center justify-center font-bold text-[var(--color-rose-700)] mb-3 overflow-hidden">
                  {staff.image ? <Image width={800} height={800} src={staff.image} alt={staff.name} className="w-full h-full object-cover" /> : staff.name.charAt(0)}
                </div>
                <h3 className="font-bold text-gray-900 text-base">{staff.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{staff.specialty || t('beautyExpert')}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <button onClick={prevStep} className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"><ChevronLeft size={18} /> {t('back')}</button>
            <button onClick={nextStep} disabled={!selectedStaff} className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-md">
              {t('proceedToDateTime')} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 5: TARİH & SAAT SEÇİMİ ═══════ */}
      {step === 5 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-950 mb-2">{t('dateTimeTitle')}</h2>
            <p className="text-gray-500">{t('dateTimeDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Gün Seçimi — 30 günlük, sayfalanabilir */}
            <div className="bg-white/40 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-600 flex items-center gap-2">
                  <CalendarIcon size={18} className="text-[var(--color-rose-600)]" /> {t('daySelection')}
                </h3>
                <div className="flex gap-1">
                  <button type="button" disabled={calendarPage === 0} onClick={() => setCalendarPage(p => p - 1)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"><ChevronLeft size={14} /></button>
                  <button type="button" disabled={calendarPage >= totalPages - 1} onClick={() => setCalendarPage(p => p + 1)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"><ChevronRight size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {pagedDays.map((date, i) => (
                  <button key={i} type="button" onClick={() => setSelectedDate(date)}
                    className={`p-3.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                      selectedDate?.toDateString() === date.toDateString() ? 'bg-[var(--color-rose-600)] text-white shadow-md' : 'bg-white hover:bg-gray-50 border border-gray-100 text-gray-800 font-medium'
                    }`}>
                    <span className="text-[10px] uppercase opacity-75">{date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale, { weekday: 'short' })}</span>
                    <span className="text-lg font-bold">{date.getDate()}</span>
                    <span className="text-[9px] opacity-60">{date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale, { month: 'short' })}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Saat Seçimi */}
            <div className="bg-white/40 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-600 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-[var(--color-rose-600)]" /> {t('timeSelection')}
                </h3>
                {isLoadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2 size={32} className="animate-spin text-[var(--color-rose-500)] mb-2" />
                    <span className="text-xs">{t('checkingAvailability')}</span>
                  </div>
                ) : selectedDate ? (
                  slotDetails.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                      {slotDetails.map((slot, i) => (
                        <button key={i} type="button" disabled={!slot.available}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          className={`py-2.5 rounded-xl font-bold transition-all text-sm border relative ${
                            selectedTime === slot.time
                              ? 'bg-gray-900 text-white shadow-md border-gray-900'
                              : slot.available
                                ? 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800 cursor-pointer'
                                : slot.isBlocked
                                  ? 'bg-red-50/50 border-red-100 text-red-300 cursor-not-allowed'
                                  : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
                          }`}>
                          {slot.time}
                          {slot.available && slot.remainingCapacity <= 2 && slot.remainingCapacity > 0 && (
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{slot.remainingCapacity}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 text-xs font-semibold">{t('noAvailableSlots')}</div>
                  )
                ) : (
                  <div className="text-center py-12 text-gray-400 text-xs font-semibold">{t('pleaseSelectDay')}</div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={prevStep} className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"><ChevronLeft size={18} /> {t('back')}</button>
            <button onClick={nextStep} disabled={!selectedDate || !selectedTime} className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-md">
              {t('proceedToContact')} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 6: İLETİŞİM & ONAY ═══════ */}
      {step === 6 && (
        <form onSubmit={handleBookingSubmit} className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-950 mb-2">{t('contactDetailsTitle')}</h2>
            <p className="text-gray-500">{t('contactDetailsDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Form */}
            <div className="bg-white/40 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('fullNameLabel')}</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] text-sm bg-white" placeholder={t('fullNamePlaceholder')} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('phoneLabel')}</label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] text-sm bg-white" placeholder={t('phonePlaceholder')} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('emailLabel')}</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] text-sm bg-white" placeholder={t('emailPlaceholder')} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('notesLabel')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] text-sm bg-white h-20 resize-none" placeholder={t('notesPlaceholder')} />
              </div>
            </div>

            {/* Özet */}
            <div className="bg-[var(--color-rose-50)]/30 p-6 rounded-2xl border border-[var(--color-rose-200)]/70 flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900 mb-4 border-b border-[var(--color-rose-200)] pb-2 flex items-center gap-1">
                  <Scissors size={18} className="text-[var(--color-rose-600)]" /> {t('bookingSummary')}
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">{t('location')}</span><span className="font-bold text-gray-800">{selectedLocation?.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t('selectCategoryTitle') || 'Kategori'}</span><span className="font-bold text-gray-800">{selectedCategory?.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t('service')}</span><span className="font-bold text-gray-800">{selectedService?.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t('specialist')}</span><span className="font-bold text-gray-800">{selectedStaff === 'ANY' ? t('anySpecialist') : selectedStaff?.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t('date')}</span><span className="font-bold text-gray-800">{selectedDate?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t('time')}</span><span className="font-bold text-gray-800">{selectedTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{t('duration')}</span><span className="font-bold text-gray-800">{selectedService?.duration} {t('minutes')}</span></div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--color-rose-200)] flex justify-between items-center">
                <span className="font-bold text-gray-800 text-base">{t('totalPrice')}</span>
                <span className="text-2xl font-black text-[var(--color-rose-700)]">₺{selectedService?.price}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={prevStep} className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"><ChevronLeft size={18} /> {t('back')}</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-black shadow-md transition-all flex items-center gap-2 text-sm disabled:opacity-75">
              {isSubmitting ? (<>{t('bookingInProgress')} <Loader2 size={18} className="animate-spin" /></>) : (<>{t('confirmBooking')} <CheckCircle2 size={18} /></>)}
            </button>
          </div>
        </form>
      )}

      {/* ═══════ SUCCESS ═══════ */}
      {step === TOTAL_STEPS && (
        <div className="text-center py-12 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-950 mb-4">{t('bookingConfirmed')}</h2>
          <p className="text-gray-600 text-base mb-8 max-w-md mx-auto leading-relaxed">
            {t('successMessage', {
              name: formData.name || '',
              locationName: selectedLocation?.name || '',
              date: selectedDate?.toLocaleDateString('tr-TR') || '',
              time: selectedTime || '',
              serviceName: selectedService?.name || ''
            })}
          </p>
          <button type="button" onClick={() => window.location.href = '/'} className="px-8 py-3 bg-[var(--color-rose-600)] text-white font-semibold rounded-full hover:bg-[var(--color-rose-700)] transition-all shadow-md text-sm">
            {t('returnHome')}
          </button>
        </div>
      )}
    </div>
  );
}
