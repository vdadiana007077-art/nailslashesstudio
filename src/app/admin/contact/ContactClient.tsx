"use client";

import { useState } from 'react';
import { updateLeadStatus, updateLeadNotes } from '@/app/actions/lead';
import { 
  Search, Mail, Phone, User, Calendar, MessageSquare, 
  CheckCircle, AlertCircle, Clock, X, Eye, ChevronDown
} from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface ContactClientProps {
  messages: ContactMessage[];
}

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Beklemede', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock size={14} /> },
  IN_PROGRESS: { label: 'İşleniyor', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <AlertCircle size={14} /> },
  CONTACTED: { label: 'İletişim Kuruldu', color: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle size={14} /> },
  CONVERTED: { label: 'Dönüştürüldü', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: <CheckCircle size={14} /> },
};

export default function ContactClient({ messages }: ContactClientProps) {
  const [items, setItems] = useState<ContactMessage[]>(messages);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const filteredMessages = items.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.email && msg.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (msg.phone && msg.phone.includes(searchTerm));
    const matchesStatus = filterStatus === 'ALL' || msg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openDetail = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setNotes(msg.notes || '');
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoading(true);
    const result = await updateLeadStatus(id, newStatus as any);
    setLoading(false);

    if (result.success) {
      setItems(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : prev);
      }
      showFeedback('success', 'Durum güncellendi.');
    } else {
      showFeedback('error', result.error || 'Durum güncellenemedi.');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;
    setLoading(true);
    const result = await updateLeadNotes(selectedMessage.id, notes);
    setLoading(false);

    if (result.success) {
      setItems(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, notes } : m));
      showFeedback('success', 'Notlar kaydedildi.');
    } else {
      showFeedback('error', result.error || 'Notlar kaydedilemedi.');
    }
  };

  const statusCounts = {
    ALL: items.length,
    PENDING: items.filter(m => m.status === 'PENDING').length,
    IN_PROGRESS: items.filter(m => m.status === 'IN_PROGRESS').length,
    CONTACTED: items.filter(m => m.status === 'CONTACTED').length,
    CONVERTED: items.filter(m => m.status === 'CONVERTED').length,
  };

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
          feedback.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{feedback.text}</span>
        </div>
      )}

      {/* Durum Filtreleri */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(statusCounts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              filterStatus === key
                ? 'bg-[var(--color-rose-600)] text-white border-[var(--color-rose-600)] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {key === 'ALL' ? 'Tümü' : statusMap[key]?.label || key}
            <span className="ml-1.5 opacity-80">({count})</span>
          </button>
        ))}
      </div>

      {/* Arama */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İsim, e-posta veya telefon ile ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
          />
        </div>
      </div>

      {/* Mesaj Listesi */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Kayıtlı iletişim mesajı bulunamadı.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMessages.map((msg) => {
              const status = statusMap[msg.status] || statusMap.PENDING;
              return (
                <div
                  key={msg.id}
                  className="p-5 hover:bg-gray-50/50 transition-colors cursor-pointer flex items-start gap-4"
                  onClick={() => openDetail(msg)}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold text-sm shrink-0">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>

                  {/* İçerik */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-900 text-sm">{msg.name}</h4>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                      {msg.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-gray-400" />
                          {msg.email}
                        </span>
                      )}
                      {msg.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {msg.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        {new Date(msg.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {msg.message && (
                      <p className="text-xs text-gray-600 line-clamp-2">{msg.message}</p>
                    )}
                  </div>

                  {/* Detay Butonu */}
                  <button className="shrink-0 p-2 text-gray-400 hover:text-[var(--color-rose-600)] transition-colors">
                    <Eye size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detay Modal */}
      {isDetailOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-rose-100)] text-[var(--color-rose-700)] flex items-center justify-center font-bold text-sm">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedMessage.name}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedMessage.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* İletişim Bilgileri */}
              <div className="grid grid-cols-2 gap-4">
                {selectedMessage.email && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">E-Posta</p>
                    <p className="text-sm text-gray-800 font-medium">{selectedMessage.email}</p>
                  </div>
                )}
                {selectedMessage.phone && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Telefon</p>
                    <p className="text-sm text-gray-800 font-medium">{selectedMessage.phone}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kaynak</p>
                  <p className="text-sm text-gray-800 font-medium capitalize">{selectedMessage.source}</p>
                </div>
              </div>

              {/* Mesaj */}
              {selectedMessage.message && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mesaj</p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                  </div>
                </div>
              )}

              {/* Durum Değiştir */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Durumu Güncelle</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(statusMap).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusChange(selectedMessage.id, key)}
                      disabled={loading}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        selectedMessage.status === key
                          ? `${val.color} ring-2 ring-offset-1 ring-current`
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {val.icon}
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Notları */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Notları</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Bu talep hakkında not ekleyin..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] focus:bg-white resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={loading}
                  className="mt-2 bg-[var(--color-rose-600)] text-white px-4 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Notları Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
