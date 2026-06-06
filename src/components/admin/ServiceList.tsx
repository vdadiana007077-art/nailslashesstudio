"use client";

import { Check, X } from 'lucide-react';
import Link from 'next/link';

type ServiceTranslation = {
  id: string;
  language: 'TR' | 'EN' | 'DE' | 'RU';
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  seoTitle: string;
  seoDesc: string;
  canonical: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  index: boolean;
  sitemap: boolean;
};

type Service = {
  id: string;
  price: string;
  duration: number;
  image: string | null;
  isActive: boolean;
  faqIds: string[];
  blogIds: string[];
  staffIds: string[];
  translations: ServiceTranslation[];
};

type Category = {
  id: string;
  name: string;
  services: Service[];
};

interface ServiceListProps {
  categories: Category[];
  faqs: any[];
  blogPosts: any[];
  staffList: any[];
}

export default function ServiceList({ categories }: ServiceListProps) {
  const getTRTranslation = (service: Service) => {
    return service.translations.find((t) => t.language === 'TR') || { name: 'İsimsiz Hizmet', slug: '', description: '' };
  };

  return (
    <div className="flex flex-col gap-8">
      {categories.map((category) => (
        <div key={category.id} className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
          <div className="bg-gray-50/50 p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-base">{category.name}</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/20 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 pl-6 w-10 font-medium">Durum</th>
                  <th className="p-4 font-medium">Hizmet Adı (TR)</th>
                  <th className="p-4 font-medium w-32">Fiyat (₺)</th>
                  <th className="p-4 font-medium w-32">Süre (dk)</th>
                  <th className="p-4 font-medium w-24">Personel</th>
                  <th className="p-4 font-medium text-right pr-6">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {category.services.map((service) => {
                  const tr = getTRTranslation(service);
                  return (
                    <tr key={service.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="p-4 pl-6">
                        {service.isActive ? (
                          <span className="inline-flex p-1 bg-green-50 text-green-600 rounded-full border border-green-100" title="Aktif">
                            <Check size={14} />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 bg-gray-50 text-gray-400 rounded-full border border-gray-100" title="Pasif">
                            <X size={14} />
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-800 leading-snug">{tr.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">/{tr.slug}</p>
                      </td>
                      <td className="p-4 font-bold text-[var(--color-primary-600)]">
                        ₺{parseFloat(service.price).toLocaleString('tr-TR')}
                      </td>
                      <td className="p-4 font-semibold text-gray-500">
                        {service.duration} dk
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {service.staffIds.length > 0 ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
                            {service.staffIds.length} kişi
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <Link
                          href={`/admin/services/${service.id}`}
                          className="text-xs font-bold text-[var(--color-rose-600)] hover:underline cursor-pointer"
                        >
                          Detayları Düzenle
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
