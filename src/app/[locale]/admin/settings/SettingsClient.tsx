"use client";

import { useState } from 'react';
import { saveMultipleSettings } from '@/app/actions/setting';
import { 
  CheckCircle, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Camera,
  Link as LinkIcon,
  Play,
  Clock,
  DollarSign,
  Star,
  Settings,
  MessageSquare
} from 'lucide-react';
import { Language } from '@prisma/client';

interface SettingItem {
  id: string;
  key: string;
  value: string;
  language: Language | null;
}

interface SettingsClientProps {
  initialSettings: SettingItem[];
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<SettingItem[]>(initialSettings);
  const [activeTab, setActiveTab] = useState<'contact' | 'social' | 'system'>('contact');
  
  // Form State'leri (mevcut verileri yükle)
  const getSettingValue = (key: string, defaultValue: string = '') => {
    return settings.find(s => s.key === key)?.value || defaultValue;
  };

  // İletişim
  const [whatsappNumber, setWhatsappNumber] = useState(getSettingValue('whatsapp_number'));
  const [contactEmail, setContactEmail] = useState(getSettingValue('contact_email'));
  const [contactPhone, setContactPhone] = useState(getSettingValue('contact_phone'));
  const [contactAddress, setContactAddress] = useState(getSettingValue('contact_address'));

  // Sosyal Medya
  const [instagramUrl, setInstagramUrl] = useState(getSettingValue('instagram_url'));
  const [facebookUrl, setFacebookUrl] = useState(getSettingValue('facebook_url'));
  const [youtubeUrl, setYoutubeUrl] = useState(getSettingValue('youtube_url'));

  // Sistem
  const [bookingInterval, setBookingInterval] = useState(getSettingValue('booking_interval', '60'));
  const [currency, setCurrency] = useState(getSettingValue('currency', 'TL'));
  const [googleReviewsLink, setGoogleReviewsLink] = useState(getSettingValue('google_reviews_link'));

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const settingsToSave = [
      { key: 'whatsapp_number', value: whatsappNumber },
      { key: 'contact_email', value: contactEmail },
      { key: 'contact_phone', value: contactPhone },
      { key: 'contact_address', value: contactAddress },
      { key: 'instagram_url', value: instagramUrl },
      { key: 'facebook_url', value: facebookUrl },
      { key: 'youtube_url', value: youtubeUrl },
      { key: 'booking_interval', value: bookingInterval },
      { key: 'currency', value: currency },
      { key: 'google_reviews_link', value: googleReviewsLink },
    ];

    const result = await saveMultipleSettings(settingsToSave);
    setLoading(false);

    if (result.success) {
      showFeedback('success', 'Ayarlar başarıyla kaydedildi.');
    } else {
      showFeedback('error', result.error || 'Ayarlar kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white border border-gray-200 rounded-2xl p-2.5 shadow-sm overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'contact'
              ? 'bg-[var(--color-rose-600)] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Phone size={14} />
          İletişim & Konum
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'social'
              ? 'bg-[var(--color-rose-600)] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Camera size={14} />
          Sosyal Medya
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'system'
              ? 'bg-[var(--color-rose-600)] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Settings size={14} />
          Sistem & Rezervasyon
        </button>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <MessageSquare size={16} className="text-[var(--color-rose-600)]" />
              İletişim Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">WhatsApp Hattı</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">+</span>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="905000000000"
                    className="w-full pl-7 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* İletişim Telefonu */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">İletişim Telefonu</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+90 242 000 0000"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                  />
                </div>
              </div>

              {/* İletişim E-Postası */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">E-Posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="info@nailslashesstudio.com"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Adres */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Stüdyo Merkez Adresi</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 text-gray-400" size={14} />
                <textarea
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  placeholder="Fener Mah. Bülent Ecevit Bulvarı No: 100 Muratpaşa / Antalya"
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white h-20 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Camera size={16} className="text-[var(--color-rose-600)]" />
              Sosyal Medya Linkleri
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instagram */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Instagram URL</label>
                <div className="relative">
                  <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/nailslashesstudio"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Facebook */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Facebook URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/nailslashesstudio"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* YouTube */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">YouTube URL</label>
                <div className="relative">
                  <Play className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/nailslashesstudio"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Clock size={16} className="text-[var(--color-rose-600)]" />
              Sistem ve Rezervasyon Kuralları
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rezervasyon Aralığı */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Takvim Zaman Dilimi (Aralık)</label>
                <select
                  value={bookingInterval}
                  onChange={(e) => setBookingInterval(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                >
                  <option value="15">15 Dakika</option>
                  <option value="30">30 Dakika</option>
                  <option value="45">45 Dakika</option>
                  <option value="60">60 Dakika</option>
                </select>
              </div>

              {/* Para Birimi */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Para Birimi</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                >
                  <option value="TL">Türk Lirası (TL)</option>
                  <option value="USD">Amerikan Doları (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>

            {/* Google Yorum İstek Linki */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Google İşletme Yorum İstek Linki (Review Link)</label>
              <div className="relative">
                <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="url"
                  value={googleReviewsLink}
                  onChange={(e) => setGoogleReviewsLink(e.target.value)}
                  placeholder="https://g.page/r/YOUR_BUSINESS_ID/review"
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="bg-[var(--color-rose-600)] text-white px-6 py-2.5 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
