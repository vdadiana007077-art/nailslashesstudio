"use client";

import { useState } from 'react';
import { createLocation, updateLocation, deleteLocation, updateLocationWorkingHours } from '@/app/actions/location';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, X, Check, Search, Globe, Map, Clock } from 'lucide-react';

interface WorkingHours {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  breakStart: string | null;
  breakEnd: string | null;
}

interface Location {
  id: string;
  name: string;
  branchName: string | null;
  address: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  googleMapsUrl: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  seoTitle: string | null;
  seoDesc: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDesc: string | null;
  ogImage: string | null;
  workingHours: WorkingHours[];
}

interface LocationsClientProps {
  initialLocations: Location[];
  locale: string;
}

export default function LocationsClient({ initialLocations, locale }: LocationsClientProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [workingHoursList, setWorkingHoursList] = useState<WorkingHours[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWhSubmitting, setIsWhSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'map' | 'seo'>('general');

  // Form Fields
  const [name, setName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [canonical, setCanonical] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDesc, setOgDesc] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [isActive, setIsActive] = useState(true);

  const daysOfWeekMap = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  // Filter locations by search query
  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (loc.branchName && loc.branchName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingLocation(null);
    setName('');
    setBranchName('');
    setAddress('');
    setCity('');
    setCountry('');
    setLatitude('');
    setLongitude('');
    setGooglePlaceId('');
    setGoogleMapsUrl('');
    setPhone('');
    setEmail('');
    setSeoTitle('');
    setSeoDesc('');
    setCanonical('');
    setOgTitle('');
    setOgDesc('');
    setOgImage('');
    setIsActive(true);
    setError('');
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLocation(loc);
    setName(loc.name);
    setBranchName(loc.branchName || '');
    setAddress(loc.address);
    setCity(loc.city || '');
    setCountry(loc.country || '');
    setLatitude(loc.latitude !== null ? String(loc.latitude) : '');
    setLongitude(loc.longitude !== null ? String(loc.longitude) : '');
    setGooglePlaceId(loc.googlePlaceId || '');
    setGoogleMapsUrl(loc.googleMapsUrl || '');
    setPhone(loc.phone || '');
    setEmail(loc.email || '');
    setSeoTitle(loc.seoTitle || '');
    setSeoDesc(loc.seoDesc || '');
    setCanonical(loc.canonical || '');
    setOgTitle(loc.ogTitle || '');
    setOgDesc(loc.ogDesc || '');
    setOgImage(loc.ogImage || '');
    setIsActive(loc.isActive);
    setError('');
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const openWhModal = (loc: Location) => {
    setSelectedLocation(loc);
    const sortedHours = [...loc.workingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    setWorkingHoursList(JSON.parse(JSON.stringify(sortedHours))); // Derin kopyalama
    setIsWhModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('branchName', branchName);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('country', country);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('googlePlaceId', googlePlaceId);
    formData.append('googleMapsUrl', googleMapsUrl);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('seoTitle', seoTitle);
    formData.append('seoDesc', seoDesc);
    formData.append('canonical', canonical);
    formData.append('ogTitle', ogTitle);
    formData.append('ogDesc', ogDesc);
    formData.append('ogImage', ogImage);
    formData.append('isActive', isActive ? 'true' : 'false');

    let result;
    if (editingLocation) {
      result = await updateLocation(editingLocation.id, formData);
    } else {
      result = await createLocation(formData);
    }

    setIsSubmitting(false);

    if (result.success && result.data) {
      const savedLoc = result.data as any;
      const formattedLoc: Location = {
        id: savedLoc.id,
        name: savedLoc.name,
        branchName: savedLoc.branchName,
        address: savedLoc.address,
        city: savedLoc.city,
        country: savedLoc.country,
        latitude: savedLoc.latitude,
        longitude: savedLoc.longitude,
        googlePlaceId: savedLoc.googlePlaceId,
        googleMapsUrl: savedLoc.googleMapsUrl,
        phone: savedLoc.phone,
        email: savedLoc.email,
        isActive: savedLoc.isActive,
        seoTitle: savedLoc.seoTitle,
        seoDesc: savedLoc.seoDesc,
        canonical: savedLoc.canonical,
        ogTitle: savedLoc.ogTitle,
        ogDesc: savedLoc.ogDesc,
        ogImage: savedLoc.ogImage,
        workingHours: editingLocation ? editingLocation.workingHours : [],
      };

      if (editingLocation) {
        setLocations(locations.map(l => l.id === editingLocation.id ? formattedLoc : l));
      } else {
        setLocations([formattedLoc, ...locations]);
      }
      setIsModalOpen(false);
    } else {
      setError(result.error || 'Bir hata oluştu.');
    }
  };

  const handleWhSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;
    setIsWhSubmitting(true);
    setError('');

    const result = await updateLocationWorkingHours(selectedLocation.id, workingHoursList);
    setIsWhSubmitting(false);

    if (result.success) {
      setLocations(locations.map(l => l.id === selectedLocation.id ? { ...l, workingHours: workingHoursList } : l));
      setIsWhModalOpen(false);
    } else {
      setError(result.error || 'Çalışma saatleri güncellenirken hata oluştu.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`"${name}" şubesini silmek istediğinize emin misiniz?\n(Not: Şubeye bağlı çalışanlar da otomatik olarak pasif konuma alınacaktır.)`);
    if (!confirmDelete) return;

    const result = await deleteLocation(id);
    if (result.success) {
      setLocations(locations.filter(l => l.id !== id));
    } else {
      alert(result.error || 'Şube silinirken hata oluştu.');
    }
  };

  return (
    <div className="w-full">
      {/* Search & Add Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Şube ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
          />
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_12px_rgba(197,139,139,0.2)] hover:shadow-[0_6px_20px_rgba(197,139,139,0.3)] cursor-pointer"
        >
          <Plus size={18} /> Yeni Şube Ekle
        </button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((loc) => (
          <div key={loc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative group">
            <div>
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 tracking-tight leading-snug">
                    {loc.branchName || loc.name}
                  </h3>
                  {loc.branchName && (
                    <span className="text-xs text-gray-400 font-medium block mt-0.5">Sistem Adı: {loc.name}</span>
                  )}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                  loc.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {loc.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-[var(--color-primary-500)] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {loc.address} {loc.city && `, ${loc.city}`} {loc.country && ` / ${loc.country}`}
                  </span>
                </div>
                {loc.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-[var(--color-primary-500)] shrink-0" />
                    <span>{loc.phone}</span>
                  </div>
                )}
                {loc.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail size={16} className="text-[var(--color-primary-500)] shrink-0" />
                    <span className="truncate">{loc.email}</span>
                  </div>
                )}
                {(loc.latitude || loc.longitude) && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-400">
                    <Map size={14} className="text-gray-400 shrink-0" />
                    <span>Lat: {loc.latitude}, Long: {loc.longitude}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-gray-50 mt-auto">
              <button
                onClick={() => openWhModal(loc)}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-pink-50 hover:bg-pink-100 text-[var(--color-primary-600)] text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Clock size={14} /> Çalışma Saatlerini Düzenle
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(loc)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 size={14} /> Düzenle
                </button>
                <button
                  onClick={() => handleDelete(loc.id, loc.name)}
                  className="flex items-center justify-center px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredLocations.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-gray-200 text-gray-500 rounded-2xl p-16 text-center text-sm font-medium">
            Kayıtlı şube bulunamadı.
          </div>
        )}
      </div>

      {/* Locations Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-lg text-gray-800">
                {editingLocation ? 'Şubeyi Düzenle' : 'Yeni Şube Ekle'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Premium Tab Bar */}
            <div className="flex border-b border-gray-100 bg-gray-50 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'general'
                    ? 'border-[var(--color-primary-500)] text-[var(--color-primary-500)] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Check size={16} /> Genel Bilgiler
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'map'
                    ? 'border-[var(--color-primary-500)] text-[var(--color-primary-500)] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <MapPin size={16} /> Harita & Konum
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'seo'
                    ? 'border-[var(--color-primary-500)] text-[var(--color-primary-500)] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Globe size={16} /> SEO Ayarları
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {error && (
                  <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold leading-relaxed shrink-0">
                    {error}
                  </div>
                )}

                {/* Tab 1: Genel Bilgiler */}
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Şube Sistem Adı *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Orn: Antalya_Lara"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Şube Görünen Adı (Branch Name)</label>
                        <input
                          type="text"
                          value={branchName}
                          onChange={(e) => setBranchName(e.target.value)}
                          placeholder="Orn: Nails Lashes Studio - Lara Şubesi"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Adres *</label>
                      <textarea
                        required
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Şube tam adresi..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Telefon</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+90..."
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">E-Posta</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="sube@salon.com"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">Şube Aktiflik Durumu</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary-500)]"></div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Tab 2: Harita & Konum */}
                {activeTab === 'map' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Şehir</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Antalya"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Ülke</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Türkiye"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Enlem (Latitude)</label>
                        <input
                          type="text"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          placeholder="36.852103"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Boylam (Longitude)</label>
                        <input
                          type="text"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          placeholder="30.758362"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Google Place ID</label>
                      <input
                        type="text"
                        value={googlePlaceId}
                        onChange={(e) => setGooglePlaceId(e.target.value)}
                        placeholder="ChIJ..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Google Maps URL</label>
                      <input
                        type="url"
                        value={googleMapsUrl}
                        onChange={(e) => setGoogleMapsUrl(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 3: SEO Ayarları */}
                {activeTab === 'seo' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">SEO Başlığı (Title)</label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Sayfa başlığı..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">SEO Açıklaması (Description)</label>
                      <textarea
                        rows={2}
                        value={seoDesc}
                        onChange={(e) => setSeoDesc(e.target.value)}
                        placeholder="Meta açıklama etiketi..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Canonical URL</label>
                      <input
                        type="url"
                        value={canonical}
                        onChange={(e) => setCanonical(e.target.value)}
                        placeholder="https://domain.com/tr/iletisim"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                      />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Open Graph (Sosyal Medya Görünümü)</h4>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">OG Başlık</label>
                        <input
                          type="text"
                          value={ogTitle}
                          onChange={(e) => setOgTitle(e.target.value)}
                          placeholder="Paylaşım başlığı..."
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">OG Açıklama</label>
                        <input
                          type="text"
                          value={ogDesc}
                          onChange={(e) => setOgDesc(e.target.value)}
                          placeholder="Paylaşım açıklaması..."
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">OG Görsel URL</label>
                        <input
                          type="text"
                          value={ogImage}
                          onChange={(e) => setOgImage(e.target.value)}
                          placeholder="https://domain.com/images/og-image.jpg"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-150 text-gray-600 text-sm font-bold rounded-xl transition-colors cursor-pointer bg-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Working Hours Modal */}
      {isWhModalOpen && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Çalışma Saatlerini Düzenle</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{selectedLocation.branchName || selectedLocation.name}</p>
              </div>
              <button
                onClick={() => setIsWhModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWhSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {error && (
                  <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold leading-relaxed shrink-0">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  {workingHoursList.map((wh, idx) => (
                    <div key={wh.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl gap-3 text-sm">
                      <div className="font-bold text-gray-700 w-24 shrink-0">
                        {daysOfWeekMap[wh.dayOfWeek - 1]}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        {!wh.isClosed ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={wh.openTime}
                              onChange={(e) => {
                                const updated = [...workingHoursList];
                                updated[idx].openTime = e.target.value;
                                setWorkingHoursList(updated);
                              }}
                              className="w-16 px-2 py-1 text-center bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)] text-xs font-semibold"
                            />
                            <span className="text-gray-400 text-xs">/</span>
                            <input
                              type="text"
                              value={wh.closeTime}
                              onChange={(e) => {
                                const updated = [...workingHoursList];
                                updated[idx].closeTime = e.target.value;
                                setWorkingHoursList(updated);
                              }}
                              className="w-16 px-2 py-1 text-center bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)] text-xs font-semibold"
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full w-36 text-center">Kapalı</span>
                        )}

                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                          <input
                            type="checkbox"
                            checked={!wh.isClosed}
                            onChange={(e) => {
                              const updated = [...workingHoursList];
                              updated[idx].isClosed = !e.target.checked;
                              setWorkingHoursList(updated);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary-500)]"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsWhModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-150 text-gray-600 text-sm font-bold rounded-xl transition-colors cursor-pointer bg-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isWhSubmitting}
                  className="flex-1 py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {isWhSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
