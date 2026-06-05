"use client";

import { useState } from 'react';
import { createLocation, updateLocation, deleteLocation } from '@/app/actions/location';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, X, Check, Search } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}

interface LocationsClientProps {
  initialLocations: Location[];
  locale: string;
}

export default function LocationsClient({ initialLocations, locale }: LocationsClientProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Filter locations by search query
  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingLocation(null);
    setName('');
    setAddress('');
    setPhone('');
    setEmail('');
    setIsActive(true);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLocation(loc);
    setName(loc.name);
    setAddress(loc.address);
    setPhone(loc.phone || '');
    setEmail(loc.email || '');
    setIsActive(loc.isActive);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('isActive', isActive ? 'true' : 'false');

    let result;
    if (editingLocation) {
      result = await updateLocation(editingLocation.id, formData);
    } else {
      result = await createLocation(formData);
    }

    setIsSubmitting(false);

    if (result.success && result.data) {
      if (editingLocation) {
        setLocations(locations.map(l => l.id === editingLocation.id ? (result.data as Location) : l));
      } else {
        setLocations([result.data as Location, ...locations]);
      }
      setIsModalOpen(false);
    } else {
      setError(result.error || 'Bir hata oluştu.');
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
                <h3 className="font-bold text-lg text-gray-800 tracking-tight leading-snug">{loc.name}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                  loc.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {loc.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-[var(--color-primary-500)] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{loc.address}</span>
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
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50 mt-auto">
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
        ))}

        {filteredLocations.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-gray-200 text-gray-500 rounded-2xl p-16 text-center text-sm font-medium">
            Kayıtlı şube bulunamadı.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold leading-relaxed">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Şube Adı *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Antalya Merkez Şubesi"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                />
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

              <div className="grid grid-cols-2 gap-4">
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

              {editingLocation && (
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                  <span className="text-sm font-semibold text-gray-700">Şube Durumu (Aktif)</span>
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
              )}

              <div className="flex gap-4 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-bold rounded-xl transition-colors cursor-pointer"
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
    </div>
  );
}
