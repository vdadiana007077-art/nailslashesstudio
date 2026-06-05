"use client";

import { useState } from 'react';
import { Search, Mail, Phone, Calendar, Clock, Check, X, Eye, FileText } from 'lucide-react';

interface UsersClientProps {
  initialUsers: any[];
  locale: string;
}

export default function UsersClient({ initialUsers, locale }: UsersClientProps) {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.phone && user.phone.includes(q))
    );
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; css: string }> = {
      PENDING: { text: 'Beklemede', css: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
      CONFIRMED: { text: 'Onaylandı', css: 'bg-green-50 text-green-700 border-green-100' },
      CANCELLED: { text: 'İptal Edildi', css: 'bg-red-50 text-red-700 border-red-100' },
      COMPLETED: { text: 'Tamamlandı', css: 'bg-blue-50 text-blue-700 border-blue-100' },
      NO_SHOW: { text: 'Gelinmedi', css: 'bg-gray-50 text-gray-700 border-gray-100' },
      RESCHEDULED: { text: 'Ertelendi', css: 'bg-purple-50 text-purple-700 border-purple-100' }
    };
    return labels[status] || { text: status, css: 'bg-gray-50 text-gray-700 border-gray-100' };
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="bg-white p-4 rounded-3xl border border-gray-150 shadow-sm flex items-center gap-2">
        <Search size={18} className="text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="İsim, e-posta veya telefon ile ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Müşteri Tablosu */}
        <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 pl-6 font-medium">Müşteri</th>
                  <th className="p-4 font-medium">İletişim</th>
                  <th className="p-4 font-medium text-center">Bülten</th>
                  <th className="p-4 font-medium text-center">Randevu Sayısı</th>
                  <th className="p-4 font-medium text-right pr-6">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 text-xs font-semibold">
                      Müşteri bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center font-bold text-sm border border-[var(--color-rose-200)] shadow-inner">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-snug">{user.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Kayıt: {user.createdAt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col text-xs text-gray-600 gap-0.5">
                          {user.email && <span className="flex items-center gap-1"><Mail size={12}/> {user.email}</span>}
                          {user.phone && <span className="flex items-center gap-1"><Phone size={12}/> {user.phone}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {user.subscriberActive ? (
                          <span className="inline-flex p-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100" title="E-Bülten Abonesi">
                            <Check size={14} />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 bg-gray-50 text-gray-400 rounded-full border border-gray-100" title="Bülten Devredışı">
                            <X size={14} />
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center font-bold text-gray-700">
                        {user.appointments.length}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 bg-gray-50 hover:bg-[var(--color-primary-100)] text-gray-600 hover:text-[var(--color-primary-700)] rounded-xl cursor-pointer transition-colors"
                          title="Geçmiş Randevular"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Randevu Geçmişi Detay Paneli */}
        <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-lg text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-1.5">
            <FileText size={20} className="text-[var(--color-rose-600)]" />
            Randevu Detayları
          </h3>

          {!selectedUser ? (
            <div className="text-center p-12 text-gray-400 text-xs font-semibold bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Bilgileri ve randevu geçmişini görmek için tablodan bir müşteri seçin.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Seçili Kullanıcı Bilgisi */}
              <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center font-bold text-base border border-[var(--color-rose-200)] shadow-inner">
                  {selectedUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-gray-950 truncate leading-snug">{selectedUser.name}</h4>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{selectedUser.email}</p>
                </div>
              </div>

              {/* Randevu Listesi */}
              <div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Randevu Geçmişi</h5>
                
                {selectedUser.appointments.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 font-medium">
                    Kullanıcının kayıtlı randevusu bulunmuyor.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {selectedUser.appointments.map((appt: any) => {
                      const label = getStatusLabel(appt.status);
                      return (
                        <div key={appt.id} className="p-4 bg-white border border-gray-150 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <span className="font-bold text-xs text-gray-800 leading-snug truncate">{appt.serviceName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${label.css}`}>
                              {label.text}
                            </span>
                          </div>
                          
                          <div className="text-[11px] text-gray-500 space-y-1 mt-2">
                            <p className="flex items-center gap-1 font-medium"><Calendar size={12}/> {appt.date} - {appt.startTime}</p>
                            <p className="text-gray-400 font-semibold">Uzman: <span className="text-gray-600">{appt.staffName}</span></p>
                          </div>
                          
                          <div className="mt-3 pt-2 border-t border-gray-50 flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-semibold">Tutar</span>
                            <span className="font-bold text-gray-800">₺{parseFloat(appt.price).toLocaleString('tr-TR')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
