"use client";

import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2,
  MapPin,
  Scissors
} from 'lucide-react';
import { createBooking } from '@/app/actions/booking';
import { getAvailableTimeSlots } from '@/app/actions/availability';

type Location = {
  id: string;
  name: string;
  address: string;
  phone: string;
};

type Service = {
  id: string;
  name: string;
  price: string;
  duration: number;
  categoryId: string;
  categoryName: string;
};

type Staff = {
  id: string;
  name: string;
  image: string;
  specialty: string;
  locationId: string;
  serviceIds: string[];
};

type BookingFormProps = {
  initialLocations: Location[];
  initialServices: Service[];
  initialStaff: Staff[];
};

export default function BookingForm({ initialLocations, initialServices, initialStaff }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null | 'ANY'>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => {
    // Geri giderken durum temizlemeleri yapalım
    if (step === 4) {
      setSelectedTime(null);
      setTimeSlots([]);
    }
    setStep((s) => Math.max(s - 1, 1));
  };

  // 1. Şubeye göre filtrelenmiş hizmetler
  const filteredServices = initialServices.filter(service => {
    if (!selectedLocation) return false;
    // O şubede bu hizmeti verebilen en az bir aktif çalışan olmalı
    return initialStaff.some(st => st.locationId === selectedLocation.id && st.serviceIds.includes(service.id));
  });

  // 2. Seçilen hizmete ve şubeye göre filtrelenmiş personeller
  const filteredStaff = initialStaff.filter(st => {
    if (!selectedLocation || !selectedService) return false;
    return st.locationId === selectedLocation.id && st.serviceIds.includes(selectedService.id);
  });

  // Tarih değiştiğinde müsait saat slotlarını çek
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedLocation || !selectedService || !selectedDate || !selectedStaff) return;
      
      setIsLoadingSlots(true);
      setSelectedTime(null);
      
      // Tarih formatı YYYY-MM-DD
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

      if (result.success && result.slots) {
        setTimeSlots(result.slots);
      } else {
        setTimeSlots([]);
        console.error(result.error || 'Saat dilimleri alınamadı.');
      }
    };

    fetchSlots();
  }, [selectedDate, selectedStaff, selectedService, selectedLocation]);

  // Takvim için sonraki 7 günü oluştur
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation || !selectedService || !selectedDate || !selectedTime || !selectedStaff) return;

    setIsSubmitting(true);
    
    const staffIdParam = selectedStaff === 'ANY' ? 'ANY' : selectedStaff.id;

    const result = await createBooking({
      serviceId: selectedService.id,
      locationId: selectedLocation.id,
      staffId: staffIdParam,
      date: selectedDate,
      startTime: selectedTime,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes
    });

    setIsSubmitting(false);

    if (result.success) {
      setStep(5); // Başarılı ekranı
    } else {
      alert(result.error || 'Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden bg-white/80 border border-[var(--color-rose-100)] shadow-lg">
      
      {/* Progress Bar */}
      {step < 5 && (
        <div className="mb-10 relative">
          <div className="flex justify-between items-center relative z-10">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                step >= num 
                  ? 'bg-[var(--color-rose-600)] text-white shadow-[0_0_15px_rgba(184,123,127,0.4)]' 
                  : 'bg-white text-gray-400 border border-gray-200'
              }`}>
                {num}
              </div>
            ))}
          </div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0">
            <div 
              className="h-full bg-[var(--color-rose-500)] transition-all duration-500" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Step 1: Select Location */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-950 mb-2">Şube Seçin</h2>
            <p className="text-gray-500">İşlem yaptırmak istediğiniz salon şubemizi seçin.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {initialLocations.map((loc) => (
              <div 
                key={loc.id}
                onClick={() => {
                  setSelectedLocation(loc);
                  setSelectedService(null);
                  setSelectedStaff(null);
                  setSelectedTime(null);
                }}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 flex flex-col justify-between ${
                  selectedLocation?.id === loc.id 
                    ? 'border-[var(--color-rose-500)] bg-[var(--color-rose-50)]/50' 
                    : 'border-gray-100 bg-white hover:border-[var(--color-rose-200)] hover:bg-gray-50/50'
                }`}
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{loc.name}</h3>
                  <p className="text-sm text-gray-500 flex items-start gap-1.5 leading-relaxed">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    {loc.address}
                  </p>
                </div>
                {loc.phone && (
                  <p className="text-xs text-gray-400 mt-4">Tel: {loc.phone}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button 
              onClick={nextStep}
              disabled={!selectedLocation}
              className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-md"
            >
              Hizmet Seçimine Geç <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Service */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-950 mb-2">Hizmet Seçin</h2>
            <p className="text-gray-500">{selectedLocation?.name} şubesinde sunulan işlemler.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-h-[50vh] overflow-y-auto pr-2">
            {filteredServices.map((service) => (
              <div 
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setSelectedStaff(null);
                  setSelectedTime(null);
                }}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                  selectedService?.id === service.id 
                    ? 'border-[var(--color-rose-500)] bg-[var(--color-rose-50)]/50 shadow-sm' 
                    : 'border-gray-100 bg-white hover:border-[var(--color-rose-200)] hover:bg-gray-50/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="font-bold text-base text-gray-900">{service.name}</h3>
                  <span className="font-bold text-[var(--color-rose-600)] flex-shrink-0">₺{service.price}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {service.duration} dk
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                    {service.categoryName}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button 
              onClick={prevStep}
              className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
            >
              <ChevronLeft size={18} /> Geri
            </button>
            <button 
              onClick={nextStep}
              disabled={!selectedService}
              className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-md"
            >
              Uzman Seçimine Geç <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Staff */}
      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-950 mb-2">Uzman Seçimi</h2>
            <p className="text-gray-500">{selectedService?.name} hizmeti için uzmanınızı seçin.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {/* Fark Etmez Seçeneği */}
            <div 
              onClick={() => {
                setSelectedStaff('ANY');
                setSelectedDate(null);
                setSelectedTime(null);
              }}
              className={`p-6 rounded-2xl cursor-pointer transition-all border-2 flex flex-col items-center justify-center text-center ${
                selectedStaff === 'ANY'
                  ? 'border-[var(--color-rose-500)] bg-[var(--color-rose-50)]/50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-[var(--color-rose-200)] hover:bg-gray-50/50'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-[var(--color-rose-100)] border border-[var(--color-rose-200)] flex items-center justify-center font-bold text-[var(--color-rose-700)] mb-3">
                ANY
              </div>
              <h3 className="font-bold text-gray-900 text-base">Fark Etmez</h3>
              <p className="text-xs text-gray-400 mt-1">En uygun müsait uzman atanır</p>
            </div>

            {/* Gerçek Çalışanlar */}
            {filteredStaff.map((staff) => (
              <div 
                key={staff.id}
                onClick={() => {
                  setSelectedStaff(staff);
                  setSelectedDate(null);
                  setSelectedTime(null);
                }}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 flex flex-col items-center text-center ${
                  selectedStaff !== 'ANY' && selectedStaff?.id === staff.id
                    ? 'border-[var(--color-rose-500)] bg-[var(--color-rose-50)]/50 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-[var(--color-rose-200)] hover:bg-gray-50/50'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-[var(--color-rose-50)] border border-[var(--color-rose-200)] flex items-center justify-center font-bold text-[var(--color-rose-700)] mb-3 overflow-hidden">
                  {staff.image ? (
                    <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
                  ) : (
                    staff.name.charAt(0)
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-base">{staff.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{staff.specialty || 'Güzellik Uzmanı'}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button 
              onClick={prevStep}
              className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
            >
              <ChevronLeft size={18} /> Geri
            </button>
            <button 
              onClick={nextStep}
              disabled={!selectedStaff}
              className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-md"
            >
              Tarih ve Saat Seç <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Select Date & Time */}
      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-950 mb-2">Tarih ve Saat</h2>
            <p className="text-gray-500">Lütfen randevu gününü ve saatini seçin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Gün Seçimi */}
            <div className="bg-white/40 p-6 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-600">
                <CalendarIcon size={18} className="text-[var(--color-rose-600)]" /> Gün Seçimi
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {getNext7Days().map((date, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`p-3.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                      selectedDate?.getDate() === date.getDate()
                        ? 'bg-[var(--color-rose-600)] text-white shadow-md'
                        : 'bg-white hover:bg-gray-50 border border-gray-100 text-gray-800 font-medium'
                    }`}
                  >
                    <span className="text-[10px] uppercase opacity-75">{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
                    <span className="text-lg font-bold">{date.getDate()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Saat Seçimi */}
            <div className="bg-white/40 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-600">
                  <Clock size={18} className="text-[var(--color-rose-600)]" /> Saat Seçimi
                </h3>
                
                {isLoadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2 size={32} className="animate-spin text-[var(--color-rose-500)] mb-2" />
                    <span className="text-xs">Müsaitlik kontrol ediliyor...</span>
                  </div>
                ) : selectedDate ? (
                  timeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {timeSlots.map((time, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 rounded-xl font-bold transition-all text-sm ${
                            selectedTime === time
                              ? 'bg-gray-900 text-white shadow-md'
                              : 'bg-white hover:bg-gray-50 border border-gray-100 text-gray-700'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 text-xs font-semibold">
                      Seçilen günde müsait saat kalmamıştır.
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-gray-400 text-xs font-semibold">
                    Lütfen önce soldan bir gün seçin.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button 
              onClick={prevStep}
              className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
            >
              <ChevronLeft size={18} /> Geri
            </button>
            <button 
              onClick={nextStep}
              disabled={!selectedDate || !selectedTime}
              className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-md"
            >
              İletişim Bilgilerine Geç <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Customer Details & Final Confirmation */}
      {step === 5 && (
        <form onSubmit={handleBookingSubmit} className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-950 mb-2">İletişim Bilgileri</h2>
            <p className="text-gray-500">Randevunuzu tamamlamak için bilgilerinizi doldurun.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Form Inputs */}
            <div className="bg-white/40 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ad Soyad</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] text-sm bg-white" 
                  placeholder="Örn: Ayşe Yılmaz" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Telefon</label>
                <input 
                  type="tel" required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] text-sm bg-white" 
                  placeholder="05XX XXX XX XX" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">E-posta</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] text-sm bg-white" 
                  placeholder="ornek@email.com" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Not (Opsiyonel)</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-rose-400)] text-sm bg-white h-20 resize-none" 
                  placeholder="Varsa özel notunuz..." 
                />
              </div>
            </div>

            {/* Summary Panel */}
            <div className="bg-[var(--color-rose-50)]/30 p-6 rounded-2xl border border-[var(--color-rose-200)]/70 flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900 mb-4 border-b border-[var(--color-rose-200)] pb-2 flex items-center gap-1">
                  <Scissors size={18} className="text-[var(--color-rose-600)]" /> Randevu Özeti
                </h3>
                
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Şube:</span>
                    <span className="font-bold text-gray-800">{selectedLocation?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hizmet:</span>
                    <span className="font-bold text-gray-800">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Uzman:</span>
                    <span className="font-bold text-gray-800">
                      {selectedStaff === 'ANY' ? 'Fark Etmez (En Uygun Uzman)' : selectedStaff?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tarih:</span>
                    <span className="font-bold text-gray-800">
                      {selectedDate?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Saat:</span>
                    <span className="font-bold text-gray-800">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Süre:</span>
                    <span className="font-bold text-gray-800">{selectedService?.duration} dk</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[var(--color-rose-200)] flex justify-between items-center">
                <span className="font-bold text-gray-800 text-base">Toplam Ücret</span>
                <span className="text-2xl font-black text-[var(--color-rose-700)]">₺{selectedService?.price}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button 
              type="button"
              onClick={prevStep}
              className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
            >
              <ChevronLeft size={18} /> Geri
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-black shadow-md transition-all flex items-center gap-2 text-sm disabled:opacity-75"
            >
              {isSubmitting ? (
                <>Rezervasyon Yapılıyor <Loader2 size={18} className="animate-spin" /></>
              ) : (
                <>Randevuyu Onayla <CheckCircle2 size={18} /></>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Success View */}
      {step === 5 && (
        <div className="text-center py-12 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-950 mb-4">Randevunuz Alındı!</h2>
          <p className="text-gray-600 text-base mb-8 max-w-md mx-auto leading-relaxed">
            Sayın <span className="font-bold text-gray-800">{formData.name}</span>, <span className="font-bold text-gray-800">{selectedLocation?.name}</span> şubemizde, <span className="font-bold text-gray-800">{selectedDate?.toLocaleDateString('tr-TR')}</span> günü saat <span className="font-bold text-gray-800">{selectedTime}</span> için <span className="font-bold text-gray-800">{selectedService?.name}</span> randevunuz başarıyla oluşturuldu.
          </p>
          <button 
            type="button"
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-[var(--color-rose-600)] text-white font-semibold rounded-full hover:bg-[var(--color-rose-700)] transition-all shadow-md text-sm"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      )}

    </div>
  );
}
