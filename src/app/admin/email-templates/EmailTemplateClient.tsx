"use client";

import { useState } from 'react';
import { Mail, Save, Eye, EyeOff, Edit3, Check, AlertCircle, Code, X, MonitorSmartphone, MessageCircle } from 'lucide-react';
import { updateEmailTemplate } from '@/app/actions/email-template';

interface Template {
  id: string;
  key: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
  updatedAt: string;
}

interface Props {
  templates: Template[];
}

const variablesList = [
  { key: '{{customerName}}', desc: 'Müşteri adı' },
  { key: '{{serviceName}}', desc: 'Hizmet adı' },
  { key: '{{date}}', desc: 'Randevu tarihi' },
  { key: '{{time}}', desc: 'Randevu saati' },
  { key: '{{customerEmail}}', desc: 'Müşteri e-postası' },
];

export default function EmailTemplateClient({ templates }: Props) {
  const [items, setItems] = useState<Template[]>(templates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ name: string; subject: string; body: string }>({ name: '', subject: '', body: '' });
  
  // Çok dilli yönetim state'leri
  const [isMultiLang, setIsMultiLang] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>('TR');
  const [editDataMulti, setEditDataMulti] = useState<{
    [lang: string]: { subject: string; body: string }
  }>({
    TR: { subject: '', body: '' },
    EN: { subject: '', body: '' },
    RU: { subject: '', body: '' },
    DE: { subject: '', body: '' }
  });

  const [editTab, setEditTab] = useState<'html' | 'preview'>('html');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState<string>('TR');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email');

  // Tab'a göre filtre
  const filteredItems = items.filter(t => {
    if (activeTab === 'whatsapp') return t.key.startsWith('wa_');
    return !t.key.startsWith('wa_');
  });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const startEdit = (t: Template) => {
    setEditingId(t.id);
    setEditTab('html');
    setPreviewId(null);

    let parsedSubject: any = null;
    let parsedBody: any = null;
    let isJson = false;

    try {
      parsedSubject = JSON.parse(t.subject);
      parsedBody = JSON.parse(t.body);
      if (parsedSubject && typeof parsedSubject === 'object' && parsedBody && typeof parsedBody === 'object') {
        isJson = true;
      }
    } catch (_) {
      // JSON değil
    }

    if (isJson) {
      setIsMultiLang(true);
      setEditDataMulti({
        TR: { subject: parsedSubject.TR || '', body: parsedBody.TR || '' },
        EN: { subject: parsedSubject.EN || '', body: parsedBody.EN || '' },
        RU: { subject: parsedSubject.RU || '', body: parsedBody.RU || '' },
        DE: { subject: parsedSubject.DE || '', body: parsedBody.DE || '' }
      });
      setSelectedLang('TR');
      setEditData({ name: t.name, subject: '', body: '' });
    } else {
      setIsMultiLang(false);
      setEditData({ name: t.name, subject: t.subject, body: t.body });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', subject: '', body: '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setLoading(true);

    let dataToSave: { name: string; subject: string; body: string } = {
      name: editData.name,
      subject: editData.subject,
      body: editData.body
    };

    if (isMultiLang) {
      const subjects: Record<string, string> = {};
      const bodies: Record<string, string> = {};
      Object.keys(editDataMulti).forEach(lang => {
        subjects[lang] = editDataMulti[lang].subject;
        bodies[lang] = editDataMulti[lang].body;
      });

      dataToSave = {
        name: editData.name,
        subject: JSON.stringify(subjects),
        body: JSON.stringify(bodies)
      };
    }

    const result = await updateEmailTemplate(editingId, dataToSave);
    setLoading(false);

    if (result.success) {
      setItems(prev => prev.map(t => t.id === editingId ? { ...t, ...dataToSave } : t));
      showFeedback('success', 'Şablon kaydedildi.');
      setEditingId(null);
    } else {
      showFeedback('error', result.error || 'Hata oluştu.');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const result = await updateEmailTemplate(id, { isActive: !isActive });
    if (result.success) {
      setItems(prev => prev.map(t => t.id === id ? { ...t, isActive: !isActive } : t));
      showFeedback('success', isActive ? 'Şablon pasif yapıldı.' : 'Şablon aktif yapıldı.');
    }
  };

  // Önizleme: değişkenleri örnek verilerle değiştir
  const renderPreview = (body: string) => {
    if (!body) return '';
    return body
      .replace(/\{\{customerName\}\}/g, 'Ayşe Yılmaz')
      .replace(/\{\{serviceName\}\}/g, 'İpek Kirpik Klasik')
      .replace(/\{\{date\}\}/g, '8 Haziran 2026 Pazartesi')
      .replace(/\{\{time\}\}/g, '14:30')
      .replace(/\{\{customerEmail\}\}/g, 'ayse@email.com');
  };

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
          feedback.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{feedback.text}</span>
        </div>
      )}

      {/* Değişkenler Referans */}
      <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4">
        <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Code size={14} /> Kullanılabilir Değişkenler
        </h3>
        <div className="flex flex-wrap gap-2">
          {variablesList.map(v => (
            <span key={v.key} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-blue-100 text-xs">
              <code className="font-mono text-blue-700 font-bold">{v.key}</code>
              <span className="text-gray-500">— {v.desc}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Tab Butonları */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            activeTab === 'email'
              ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Mail size={16} /> E-posta Şablonları
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <MessageCircle size={16} /> WhatsApp Şablonları
        </button>
      </div>

      {activeTab === 'whatsapp' && (
        <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-4">
          <p className="text-xs text-emerald-700">
            <strong>İpucu:</strong> WhatsApp şablonları düz metin formatındadır (HTML değil). Emoji kullanabilirsiniz. Randevu işlem butonlarındaki &quot;WhatsApp&quot; butonuyla bu şablonlar gönderilir.
          </p>
        </div>
      )}

      {/* Şablon Listesi */}
      {filteredItems.map(template => {
        let isTmplMulti = false;
        try {
          const s = JSON.parse(template.subject);
          const b = JSON.parse(template.body);
          if (s && typeof s === 'object' && b && typeof b === 'object') {
            isTmplMulti = true;
          }
        } catch (_) {}

        return (
          <div key={template.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${template.isActive ? 'bg-[var(--color-rose-50)] text-[var(--color-rose-600)]' : 'bg-gray-100 text-gray-400'}`}>
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    {template.name}
                    {isTmplMulti && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-100">
                        Çok Dilli (TR, EN, RU, DE)
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{template.key}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(template.id, template.isActive)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                    template.isActive
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {template.isActive ? 'Aktif' : 'Pasif'}
                </button>
                <button
                  onClick={() => {
                    if (previewId === template.id) {
                      setPreviewId(null);
                    } else {
                      setPreviewId(template.id);
                      setPreviewLang('TR');
                    }
                  }}
                  className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Önizleme"
                >
                  {previewId === template.id ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => startEdit(template)}
                  className="p-2 rounded-lg bg-[var(--color-rose-50)] text-[var(--color-rose-600)] hover:bg-[var(--color-rose-100)] transition-colors"
                  title="Düzenle"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            </div>

            {/* Düzenleme */}
            {editingId === template.id && (
              <div className="p-5 space-y-4 bg-gray-50/50 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Şablon Adı (Admin)</label>
                    <input
                      value={editData.name}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                    />
                  </div>
                  {!isMultiLang && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">E-posta Konusu</label>
                      <input
                        value={editData.subject}
                        onChange={e => setEditData({ ...editData, subject: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                      />
                    </div>
                  )}
                </div>

                {/* Çok Dilli ise Dil Sekmeleri */}
                {isMultiLang && (
                  <div className="flex border-b border-gray-200 gap-1 bg-white p-1 rounded-xl border">
                    {(['TR', 'EN', 'RU', 'DE'] as const).map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setSelectedLang(lang)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          selectedLang === lang 
                            ? 'bg-[var(--color-rose-600)] text-white shadow-sm' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        {lang === 'TR' ? '🇹🇷 Türkçe' : lang === 'EN' ? '🇺🇸 English' : lang === 'RU' ? '🇷🇺 Русский' : '🇩🇪 Deutsch'}
                      </button>
                    ))}
                  </div>
                )}

                {/* Dil Sekmesi İçindeki Konu Satırı */}
                {isMultiLang && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      E-posta Konusu ({selectedLang})
                    </label>
                    <input
                      value={editDataMulti[selectedLang].subject}
                      onChange={e => setEditDataMulti({
                        ...editDataMulti,
                        [selectedLang]: { ...editDataMulti[selectedLang], subject: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
                      placeholder={`${selectedLang} dilindeki konu satırı`}
                    />
                  </div>
                )}

                {/* HTML / Görsel Sekmeleri */}
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <button
                      onClick={() => setEditTab('html')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        editTab === 'html'
                          ? 'bg-gray-800 text-white shadow-sm'
                          : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Code size={12} /> HTML Kodu
                    </button>
                    <button
                      onClick={() => setEditTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        editTab === 'preview'
                          ? 'bg-[var(--color-rose-600)] text-white shadow-sm'
                          : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <MonitorSmartphone size={12} /> Görsel Önizleme
                    </button>
                  </div>

                  {editTab === 'html' ? (
                    <textarea
                      value={isMultiLang ? editDataMulti[selectedLang].body : editData.body}
                      onChange={e => {
                        if (isMultiLang) {
                          setEditDataMulti({
                            ...editDataMulti,
                            [selectedLang]: { ...editDataMulti[selectedLang], body: e.target.value }
                          });
                        } else {
                          setEditData({ ...editData, body: e.target.value });
                        }
                      }}
                      rows={16}
                      className="w-full px-3 py-2 bg-gray-900 text-green-400 border border-gray-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)] resize-y leading-relaxed"
                      spellCheck={false}
                    />
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {/* Konu satırı */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs text-gray-500">
                          <span className="font-bold text-gray-700">Konu: </span>
                          {renderPreview(isMultiLang ? editDataMulti[selectedLang].subject : editData.subject)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          <span className="font-bold">Kimden: </span>
                          Nails & Lashes Studio &lt;info@nailslashes.com&gt;
                        </p>
                      </div>
                      {/* Mail içeriği */}
                      <div className="p-6 flex justify-center bg-gray-100/50">
                        <div
                          className="w-full max-w-[600px] overflow-x-auto"
                          dangerouslySetInnerHTML={{ __html: renderPreview(isMultiLang ? editDataMulti[selectedLang].body : editData.body) }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={loading}
                    className="flex items-center gap-1 bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-xs font-semibold shadow-sm disabled:opacity-50"
                  >
                    <Save size={14} /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>
            )}

            {/* Hızlı Önizleme (düzenleme dışında) */}
            {previewId === template.id && editingId !== template.id && (
              <div className="bg-white border-t border-gray-100">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">E-posta Önizlemesi (Örnek Verilerle)</p>
                  <button onClick={() => setPreviewId(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                </div>

                {/* Önizlemede Dil Sekmeleri */}
                {isTmplMulti && (
                  <div className="px-5 py-2 bg-white border-b border-gray-100 flex gap-2">
                    {(['TR', 'EN', 'RU', 'DE'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setPreviewLang(lang)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                          previewLang === lang
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {lang === 'TR' ? 'TR' : lang === 'EN' ? 'EN' : lang === 'RU' ? 'RU' : 'DE'}
                      </button>
                    ))}
                  </div>
                )}

                <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                  <p className="text-xs text-gray-500">
                    <span className="font-bold text-gray-700">Konu: </span>
                    {(() => {
                      if (isTmplMulti) {
                        try {
                          const s = JSON.parse(template.subject);
                          return renderPreview(s[previewLang] || s['TR'] || template.subject);
                        } catch (_) {}
                      }
                      return renderPreview(template.subject);
                    })()}
                  </p>
                </div>
                <div className="p-6 flex justify-center bg-gray-100/30">
                  <div
                    className="w-full max-w-[600px] overflow-x-auto"
                    dangerouslySetInnerHTML={{ 
                      __html: (() => {
                        if (isTmplMulti) {
                          try {
                            const b = JSON.parse(template.body);
                            return renderPreview(b[previewLang] || b['TR'] || template.body);
                          } catch (_) {}
                        }
                        return renderPreview(template.body);
                      })()
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
