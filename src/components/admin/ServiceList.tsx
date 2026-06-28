"use client";

import { Check, X, Trash2, Power, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toggleServiceActive, deleteService } from '@/app/actions/admin';

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
  const router = useRouter();
  const getTRTranslation = (service: Service) => {
    return service.translations.find((t) => t.language === 'TR') || { name: 'İsimsiz Hizmet', slug: '', description: '' };
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    const res = await toggleServiceActive(id, currentState);
    if (!res.success) alert(res.error);
    else router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`"${name}" hizmetini silmek istediğinize emin misiniz?`)) {
      const res = await deleteService(id);
      if (!res.success) alert(res.error);
      else router.refresh();
    }
  };

  const activeCategories = categories.filter(cat => cat.services && cat.services.length > 0);

  if (activeCategories.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-gray-150 shadow-sm">
        <p className="text-gray-500 text-xs font-semibold">Henüz hiç hizmet eklenmemiş veya tüm hizmetler silinmiş.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {activeCategories.map((category) => (
        <div key={category.id} className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
          <div className="bg-gray-50/50 p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-base">{category.name}</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/20 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 pl-6 font-medium">Hizmet Adı (TR)</th>
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
                      <td className="p-4 text-right pr-6 flex justify-end gap-3 items-center h-full min-h-[64px]">
                        <button 
                          onClick={() => handleToggleActive(service.id, service.isActive)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors border shadow-sm"
                          style={{
                            backgroundColor: service.isActive ? '#f0fdf4' : '#f9fafb',
                            color: service.isActive ? '#166534' : '#6b7280',
                            borderColor: service.isActive ? '#bbf7d0' : '#e5e7eb'
                          }}
                          title={service.isActive ? "Pasife Al" : "Aktif Et"}
                        >
                          <Power size={14} />
                          {service.isActive ? 'Aktif' : 'Pasif'}
                        </button>

                        <Link
                          href={`/admin/services/${service.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-white text-[var(--color-primary-600)] border border-gray-200 hover:border-[var(--color-primary-300)] rounded-lg transition-colors shadow-sm"
                        >
                          <Edit size={14} />
                          Düzenle
                        </Link>

                        <button
                          onClick={() => handleDelete(service.id, tr.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors shadow-sm"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                          Sil
                        </button>
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
