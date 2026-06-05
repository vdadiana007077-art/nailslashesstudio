"use client";

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createBooking } from '@/app/actions/booking';

type Service = {
  id: string;
  name: string;
  price: string;
  duration: number;
};

type BookingFormProps = {
  services: Service[];
};

export default function BookingForm({ services }: BookingFormProps) {
  const t = useTranslations('Index'); // Şimdilik Index'ten alalım veya sabit yazalım
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Örnek saatler
  const timeSlots = ['10:00', '11:00', '13:00', '14:30', '16:00', '17:00'];

  // Takvim için basit 1 haftalık günler
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
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    
    const result = await createBooking({
      serviceId: selectedService.id,
      date: selectedDate,
      startTime: selectedTime,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes
    });

    setIsSubmitting(false);

    if (result.success) {
      setStep(4); // Success step
    } else {
      alert(result.error || 'Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden">
      
      {/* Progress Bar */}
      {step < 4 && (
        <div className="mb-10 relative">
          <div className="flex justify-between items-center relative z-10">
            {[1, 2, 3].map((num) => (
              <div key={num} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                step >= num 
                  ? 'bg-[var(--color-rose-500)] text-white shadow-[0_0_15px_rgba(184,123,127,0.5)]' 
                  : 'bg-white/50 text-gray-400'
              }`}>
                {num}
              </div>
            ))}
          </div>
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/40 -translate-y-1/2 z-0">
            <div 
              className="h-full bg-[var(--color-rose-400)] transition-all duration-500" 
              style={{ width: `${(step - 1) * 50}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Hizmet Seçin</h2>
            <p className="text-gray-500">Lütfen randevu almak istediğiniz işlemi seçin.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {services.map((service) => (
              <div 
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                  selectedService?.id === service.id 
                    ? 'border-[var(--color-rose-500)] bg-[var(--color-rose-50)]' 
                    : 'border-transparent bg-white/40 hover:bg-white/60'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{service.name}</h3>
                  <span className="font-bold text-[var(--color-rose-600)]">₺{service.price}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  <span>{service.duration} dk</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button 
              onClick={nextStep}
              disabled={!selectedService}
              className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
            >
              Devam Et <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Tarih ve Saat</h2>
            <p className="text-gray-500">{selectedService?.name} için uygun bir zaman seçin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Days */}
            <div className="bg-white/40 p-6 rounded-2xl">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><CalendarIcon size={20}/> Gün Seçimi</h3>
              <div className="grid grid-cols-4 gap-2">
                {getNext7Days().map((date, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                      selectedDate?.getDate() === date.getDate()
                        ? 'bg-[var(--color-rose-500)] text-white shadow-lg'
                        : 'bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xs uppercase">{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
                    <span className="text-xl font-bold">{date.getDate()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Times */}
            <div className="bg-white/40 p-6 rounded-2xl">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Clock size={20}/> Saat Seçimi</h3>
              {selectedDate ? (
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((time, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        selectedTime === time
                          ? 'bg-gray-900 text-white shadow-lg'
                          : 'bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm pb-8">
                  Önce bir gün seçin
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button 
              onClick={prevStep}
              className="px-8 py-3 bg-white/60 text-gray-700 font-semibold rounded-full hover:bg-white transition-all flex items-center gap-2"
            >
              <ChevronLeft size={20} /> Geri
            </button>
            <button 
              onClick={nextStep}
              disabled={!selectedDate || !selectedTime}
              className="px-8 py-3 bg-[var(--color-rose-500)] text-white font-semibold rounded-full hover:bg-[var(--color-rose-600)] shadow-[0_0_15px_rgba(184,123,127,0.4)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              Devam Et <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Details & Confirm */}
      {step === 3 && (
        <form onSubmit={handleBookingSubmit} className="animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">İletişim Bilgileri</h2>
            <p className="text-gray-500">Randevunuzu kesinleştirmek için son adım.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/40 p-6 rounded-2xl flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ad Soyad</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 rounded-xl border-none bg-white focus:ring-2 focus:ring-[var(--color-rose-400)] outline-none" 
                  placeholder="Örn: Ayşe Yılmaz" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
                <input 
                  type="tel" required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 rounded-xl border-none bg-white focus:ring-2 focus:ring-[var(--color-rose-400)] outline-none" 
                  placeholder="05XX XXX XX XX" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-posta</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 rounded-xl border-none bg-white focus:ring-2 focus:ring-[var(--color-rose-400)] outline-none" 
                  placeholder="ornek@email.com" 
                />
              </div>
            </div>

            <div className="bg-[var(--color-rose-50)] p-6 rounded-2xl border border-[var(--color-rose-200)] flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-4 border-b border-[var(--color-rose-200)] pb-2">Özet</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Hizmet:</span>
                  <span className="font-bold text-gray-800">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tarih:</span>
                  <span className="font-bold text-gray-800">
                    {selectedDate?.toLocaleDateString('tr-TR')} - {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Süre:</span>
                  <span className="font-bold text-gray-800">{selectedService?.duration} dk</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--color-rose-200)] flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800">Toplam</span>
                <span className="text-2xl font-black text-[var(--color-rose-600)]">₺{selectedService?.price}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button 
              type="button"
              onClick={prevStep}
              className="px-8 py-3 bg-white/60 text-gray-700 font-semibold rounded-full hover:bg-white transition-all flex items-center gap-2"
            >
              <ChevronLeft size={20} /> Geri
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-black shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>İşleniyor <Loader2 size={20} className="animate-spin" /></>
              ) : (
                <>Randevuyu Onayla <CheckCircle2 size={20} /></>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="text-center py-12 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Randevunuz Alındı!</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            Sayın <span className="font-bold">{formData.name}</span>, {selectedDate?.toLocaleDateString('tr-TR')} tarihi saat {selectedTime} için <span className="font-bold">{selectedService?.name}</span> randevunuz başarıyla oluşturuldu. Detaylar E-posta adresinize gönderilecektir.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-[var(--color-rose-500)] text-white font-semibold rounded-full hover:bg-[var(--color-rose-600)] transition-all shadow-[0_0_15px_rgba(184,123,127,0.4)]"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      )}

    </div>
  );
}
