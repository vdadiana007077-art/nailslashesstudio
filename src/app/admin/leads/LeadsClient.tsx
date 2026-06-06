"use client";

import { useState } from 'react';
import { updateLeadStatus, updateLeadNotes } from '@/app/actions/lead';
import { LeadStatus } from '@prisma/client';
import { 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Tag, 
  Clock, 
  CheckCircle, 
  FileText, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface LeadItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  message: string | null;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
}

interface LeadsClientProps {
  initialLeads: LeadItem[];
}

export default function LeadsClient({ initialLeads }: LeadsClientProps) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const statusConfig = {
    PENDING: { label: 'Beklemede', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    IN_PROGRESS: { label: 'İşlemde', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    CONTACTED: { label: 'Ulaşıldı', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    CONVERTED: { label: 'Dönüştü', color: 'bg-green-50 text-green-700 border-green-200' },
  };

  const tabs = [
    { key: 'ALL', label: 'Tüm Talepler' },
    { key: 'PENDING', label: 'Bekleyenler' },
    { key: 'IN_PROGRESS', label: 'İşlemdekiler' },
    { key: 'CONTACTED', label: 'Ulaşılanlar' },
    { key: 'CONVERTED', label: 'Kazanılanlar' },
  ];

  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'ALL') return true;
    return lead.status === activeTab;
  });

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    setLoadingId(id);
    const result = await updateLeadStatus(id, newStatus);
    setLoadingId(null);

    if (result.success) {
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
      showFeedback('success', 'Talep durumu başarıyla güncellendi.');
    } else {
      showFeedback('error', result.error || 'Durum güncellenirken bir hata oluştu.');
    }
  };

  const handleNotesEditStart = (id: string, currentNotes: string | null) => {
    setEditingNotesId(id);
    setTempNotes(currentNotes || '');
  };

  const handleNotesSave = async (id: string) => {
    setLoadingId(id);
    const result = await updateLeadNotes(id, tempNotes);
    setLoadingId(null);

    if (result.success) {
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, notes: tempNotes } : lead));
      setEditingNotesId(null);
      showFeedback('success', 'Not başarıyla kaydedildi.');
    } else {
      showFeedback('error', result.error || 'Not kaydedilirken bir hata oluştu.');
    }
  };

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
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
      <div className="flex border-b border-gray-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap pb-4 px-6 font-medium text-sm border-b-2 transition-all duration-200 ${
              activeTab === tab.key
                ? 'border-[var(--color-rose-600)] text-[var(--color-rose-700)]'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredLeads.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <Clock className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Bu kategoride henüz talep bulunmuyor.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col md:flex-row gap-6 justify-between">
              {/* Left Column: Müşteri Bilgileri */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900">{lead.name}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${statusConfig[lead.status].color}`}>
                    {statusConfig[lead.status].label}
                  </span>
                  {lead.source && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                      Kaynak: {lead.source}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-2 hover:text-[var(--color-rose-600)] transition-colors">
                      <Phone size={16} className="text-gray-400" />
                      {lead.phone}
                    </a>
                  )}
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-[var(--color-rose-600)] transition-colors">
                      <Mail size={16} className="text-gray-400" />
                      {lead.email}
                    </a>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    {new Date(lead.createdAt).toLocaleDateString('tr-TR')} {new Date(lead.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {lead.message && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
                      <MessageSquare size={14} />
                      Müşteri Mesajı
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{lead.message}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Durum & Not Yönetimi */}
              <div className="w-full md:w-80 flex flex-col justify-between gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                {/* Durum Seçimi */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Talep Durumu</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.keys(statusConfig).map((statusKey) => (
                      <button
                        key={statusKey}
                        onClick={() => handleStatusChange(lead.id, statusKey as LeadStatus)}
                        disabled={loadingId === lead.id}
                        className={`text-xs py-2 px-2.5 rounded-lg border font-medium transition-all ${
                          lead.status === statusKey
                            ? 'bg-[var(--color-rose-600)] text-white border-[var(--color-rose-600)] shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {statusConfig[statusKey as LeadStatus].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notlar Alanı */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <FileText size={14} />
                      Yönetici Notu
                    </label>
                    {editingNotesId !== lead.id && (
                      <button
                        onClick={() => handleNotesEditStart(lead.id, lead.notes)}
                        className="text-xs text-[var(--color-rose-600)] hover:underline font-semibold"
                      >
                        {lead.notes ? 'Düzenle' : 'Not Ekle'}
                      </button>
                    )}
                  </div>

                  {editingNotesId === lead.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Müşteri görüşmesi notu..."
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] resize-none h-20"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg font-medium"
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => handleNotesSave(lead.id)}
                          className="bg-gray-900 text-white px-3 py-1 text-xs rounded-lg hover:bg-gray-800 font-medium flex items-center gap-1"
                        >
                          <Check size={12} />
                          Kaydet
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100 min-h-[40px]">
                      {lead.notes || 'Not eklenmemiş.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
