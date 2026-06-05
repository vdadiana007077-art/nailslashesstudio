"use client";

import { useState } from 'react';
import { updateServicePrice, toggleServiceStatus } from '@/app/actions/admin';
import { Save, Loader2, Power, PowerOff } from 'lucide-react';

type Service = {
  id: string;
  name: string;
  price: string;
  duration: number;
  isActive: boolean;
};

type Category = {
  id: string;
  name: string;
  services: Service[];
};

export default function ServiceList({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setEditPrice(service.price);
    setEditDuration(service.duration.toString());
  };

  const handleSave = async (id: string) => {
    setLoadingId(id);
    const result = await updateServicePrice(id, editPrice, parseInt(editDuration));
    if (result.success) {
      setEditingId(null);
    } else {
      alert(result.error);
    }
    setLoadingId(null);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    await toggleServiceStatus(id, !currentStatus);
    setLoadingId(null);
  };

  return (
    <div className="flex flex-col gap-8">
      {categories.map(category => (
        <div key={category.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg">{category.name}</h3>
          </div>
          
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="p-4 font-medium">Hizmet Adı</th>
                  <th className="p-4 font-medium w-32">Fiyat (₺)</th>
                  <th className="p-4 font-medium w-32">Süre (dk)</th>
                  <th className="p-4 font-medium w-24 text-center">Durum</th>
                  <th className="p-4 font-medium w-32 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {category.services.map(service => (
                  <tr key={service.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-700">{service.name}</td>
                    
                    {/* Fiyat Sütunu */}
                    <td className="p-4">
                      {editingId === service.id ? (
                        <input 
                          type="number" 
                          value={editPrice} 
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        />
                      ) : (
                        <span className="font-bold text-[var(--color-rose-600)]">₺{service.price}</span>
                      )}
                    </td>

                    {/* Süre Sütunu */}
                    <td className="p-4">
                      {editingId === service.id ? (
                        <input 
                          type="number" 
                          value={editDuration} 
                          onChange={(e) => setEditDuration(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        />
                      ) : (
                        <span className="text-gray-600">{service.duration} dk</span>
                      )}
                    </td>

                    {/* Durum Sütunu */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggle(service.id, service.isActive)}
                        disabled={loadingId === service.id}
                        className={`p-2 rounded-full transition-colors ${
                          service.isActive ? 'text-green-500 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                        }`}
                        title={service.isActive ? "Pasif Yap" : "Aktif Yap"}
                      >
                        {loadingId === service.id ? <Loader2 size={18} className="animate-spin" /> : (service.isActive ? <Power size={18} /> : <PowerOff size={18} />)}
                      </button>
                    </td>

                    {/* İşlem Sütunu */}
                    <td className="p-4 text-right">
                      {editingId === service.id ? (
                        <button 
                          onClick={() => handleSave(service.id)}
                          disabled={loadingId === service.id}
                          className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black w-full"
                        >
                          {loadingId === service.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          Kaydet
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEdit(service)}
                          className="text-sm font-semibold text-[var(--color-rose-500)] hover:text-[var(--color-rose-600)]"
                        >
                          Düzenle
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
