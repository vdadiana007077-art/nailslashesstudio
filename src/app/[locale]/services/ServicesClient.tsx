"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Tag, MapPin, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Location = {
  id: string;
  name: string;
  address: string;
};

type Service = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: string;
  slug: string;
  categorySlug: string;
};

type Category = {
  id: string;
  name: string;
  description: string;
  services: Service[];
};

type StaffMember = {
  id: string;
  locationId: string;
  serviceIds: string[];
};

type ServicesClientProps = {
  locations: Location[];
  categories: Category[];
  staff: StaffMember[];
  locale: string;
};

export default function ServicesClient({ locations, categories, staff, locale }: ServicesClientProps) {
  const t = useTranslations("Services");
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL');

  // Şube seçildiğinde, o şubede sunulan hizmetlerin ID'lerini belirle
  const getAvailableServiceIdsInLocation = (locationId: string) => {
    if (locationId === 'ALL') return null;
    // O şubede çalışanların yetkin olduğu tüm benzersiz hizmet ID'leri
    const serviceIds = staff
      .filter(st => st.locationId === locationId)
      .flatMap(st => st.serviceIds);
    return new Set(serviceIds);
  };

  const availableServiceIds = getAvailableServiceIdsInLocation(selectedLocationId);

  return (
    <div className="space-y-12">
      {/* Location Filter Selector */}
      <div className="flex flex-col items-center justify-center gap-4 bg-white border border-[var(--color-rose-100)] rounded-3xl p-6 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <MapPin size={14} className="text-[var(--color-rose-600)]" />
          {t('checkAvailability')}
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedLocationId('ALL')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              selectedLocationId === 'ALL'
                ? 'bg-gray-950 text-white shadow-md'
                : 'bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('allLocations')}
          </button>
          {locations.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocationId(loc.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                selectedLocationId === loc.id
                  ? 'bg-[var(--color-rose-600)] text-white shadow-md'
                  : 'bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
        {selectedLocationId !== 'ALL' && (
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            {t('inactiveServicesInfo')}
          </p>
        )}
      </div>

      {/* Categories & Services */}
      <div className="space-y-16">
        {categories.map(category => {
          // Bu kategorideki hizmetlerin durumunu analiz et
          const categoryServices = category.services;
          if (categoryServices.length === 0) return null;

          return (
            <div key={category.id} className="space-y-6">
              {/* Category Title */}
              <div className="border-b border-[var(--color-rose-200)]/60 pb-3">
                <h2 className="text-2xl font-serif italic font-bold text-gray-900">{category.name}</h2>
                {category.description && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{category.description}</p>
                )}
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryServices.map(service => {
                  const isAvailable = availableServiceIds === null || availableServiceIds.has(service.id);

                  return (
                    <div 
                      key={service.id} 
                      className={`bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between group ${
                        isAvailable 
                          ? 'border-[var(--color-rose-100)] shadow-sm hover:shadow-md hover:border-[var(--color-rose-300)]' 
                          : 'border-gray-100 opacity-40 select-none bg-gray-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-[var(--color-rose-700)] transition-colors">
                            {service.name}
                          </h3>
                          <span className="font-black text-[var(--color-rose-600)] text-lg flex-shrink-0">
                            ₺{service.price}
                          </span>
                        </div>

                        <p className="text-gray-500 text-xs leading-relaxed mb-6">
                          {service.description || t('noDescription')}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 border-t border-gray-50 pt-4">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {service.duration} {t('minutes')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag size={12} /> {category.name}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <Link
                            href={isAvailable ? `/${locale}/services/${service.categorySlug}/${service.slug}` : '#'}
                            className={`py-2.5 rounded-xl text-center text-xs font-bold border transition-colors ${
                              isAvailable
                                ? 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                : 'border-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {t('examineDetails')}
                          </Link>
                          
                          <Link
                            href={isAvailable ? `/${locale}/booking?serviceId=${service.id}${selectedLocationId !== 'ALL' ? `&locationId=${selectedLocationId}` : ''}` : '#'}
                            className={`py-2.5 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                              isAvailable
                                ? 'bg-gray-900 text-white hover:bg-black shadow-sm'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Calendar size={12} />
                            {t('quickBooking')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
