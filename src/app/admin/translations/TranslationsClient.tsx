'use client';

import { useState, useMemo } from 'react';
import { Save, RefreshCcw, Search, CheckCircle } from 'lucide-react';
import { updateSystemTranslation, deleteSystemTranslation } from '@/app/actions/translations';

type TranslationsClientProps = {
  defaultMessages: Record<string, Record<string, any>>;
  dbTranslations: { namespace: string; key: string; language: string; value: string }[];
  locales: readonly string[];
};

export default function TranslationsClient({ defaultMessages, dbTranslations, locales }: TranslationsClientProps) {
  const [selectedNamespace, setSelectedNamespace] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Merge DB overrides with default JSON locally for the state
  const [currentTranslations, setCurrentTranslations] = useState(() => {
    const merged: Record<string, Record<string, Record<string, string>>> = {};
    
    // 1. Initialize from default JSON
    for (const locale of locales) {
      const messages = defaultMessages[locale];
      for (const ns in messages) {
        if (typeof messages[ns] !== 'object') continue;
        if (!merged[ns]) merged[ns] = {};
        for (const key in messages[ns]) {
          if (!merged[ns][key]) merged[ns][key] = {};
          merged[ns][key][locale] = typeof messages[ns][key] === 'string' ? messages[ns][key] : '';
        }
      }
    }

    // 2. Override with DB translations
    for (const t of dbTranslations) {
      if (!merged[t.namespace]) merged[t.namespace] = {};
      if (!merged[t.namespace][t.key]) merged[t.namespace][t.key] = {};
      merged[t.namespace][t.key][t.language] = t.value;
    }

    return merged;
  });

  const namespaces = Object.keys(currentTranslations).sort();
  const activeNs = selectedNamespace || namespaces[0];

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSave = async (ns: string, key: string) => {
    setSavingKeys(prev => ({ ...prev, [`${ns}-${key}`]: true }));
    
    const values = currentTranslations[ns][key];
    try {
      for (const locale of locales) {
        const val = values[locale];
        const defaultVal = defaultMessages[locale]?.[ns]?.[key];
        
        // If it's same as default, we can delete it from DB
        if (val === defaultVal || !val) {
          await deleteSystemTranslation(ns, key, locale);
        } else {
          await updateSystemTranslation(ns, key, locale, val);
        }
      }
      showSuccess('Çeviri başarıyla kaydedildi.');
    } catch (_) {
      alert('Bir hata oluştu.');
    }
    
    setSavingKeys(prev => ({ ...prev, [`${ns}-${key}`]: false }));
  };

  const handleReset = async (ns: string, key: string) => {
    if (!confirm('Bu çeviriyi varsayılan haline döndürmek istiyor musunuz?')) return;
    
    setSavingKeys(prev => ({ ...prev, [`${ns}-${key}`]: true }));
    try {
      for (const locale of locales) {
         await deleteSystemTranslation(ns, key, locale);
      }
      // Reset local state
      setCurrentTranslations(prev => {
        const updated = { ...prev };
        for (const locale of locales) {
            updated[ns][key][locale] = defaultMessages[locale]?.[ns]?.[key] || '';
        }
        return updated;
      });
      showSuccess('Çeviri varsayılan haline sıfırlandı.');
    } catch (_) {
      alert('Bir hata oluştu.');
    }
    setSavingKeys(prev => ({ ...prev, [`${ns}-${key}`]: false }));
  };

  const handleChange = (ns: string, key: string, locale: string, value: string) => {
    setCurrentTranslations(prev => {
      const updated = { ...prev };
      updated[ns] = { ...updated[ns] };
      updated[ns][key] = { ...updated[ns][key], [locale]: value };
      return updated;
    });
  };

  const filteredKeys = useMemo(() => {
    if (!activeNs || !currentTranslations[activeNs]) return [];
    const keys = Object.keys(currentTranslations[activeNs]);
    if (!searchQuery) return keys;
    
    const q = searchQuery.toLowerCase();
    return keys.filter(k => 
      k.toLowerCase().includes(q) || 
      locales.some(l => currentTranslations[activeNs][k][l]?.toLowerCase().includes(q))
    );
  }, [activeNs, currentTranslations, searchQuery, locales]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 text-sm">Kategoriler (Namespace)</h3>
          </div>
          <div className="flex flex-col max-h-[600px] overflow-y-auto p-2">
            {namespaces.map(ns => (
              <button
                key={ns}
                onClick={() => setSelectedNamespace(ns)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  activeNs === ns 
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] font-bold' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {ns}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {successMessage && (
          <div className="mb-4 p-3.5 bg-green-50 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle size={18} /> {successMessage}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white sticky top-0 z-10">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <span className="text-[var(--color-primary-500)]">{activeNs}</span> Metinleri
            </h2>
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Çeviri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {filteredKeys.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50">Aranan kritere uygun çeviri bulunamadı.</div>
            ) : (
              filteredKeys.map(key => (
                <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Anahtar:</span>
                      <code className="text-sm font-bold text-[var(--color-primary-600)]">{key}</code>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReset(activeNs, key)}
                        disabled={savingKeys[`${activeNs}-${key}`]}
                        className="px-3 py-2 text-gray-500 hover:text-red-600 border border-gray-200 bg-white hover:border-red-200 transition-all rounded-xl hover:bg-red-50 flex items-center gap-1.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                        title="Varsayılana Döndür"
                      >
                        <RefreshCcw size={14} /> Sıfırla
                      </button>
                      <button 
                        onClick={() => handleSave(activeNs, key)}
                        disabled={savingKeys[`${activeNs}-${key}`]}
                        className="px-4 py-2 bg-[var(--color-primary-500)] text-white text-xs font-bold rounded-xl hover:bg-[var(--color-primary-600)] transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {savingKeys[`${activeNs}-${key}`] ? <RefreshCcw className="animate-spin" size={14} /> : <Save size={14} />}
                        {savingKeys[`${activeNs}-${key}`] ? 'Kaydediliyor' : 'Değişikliği Kaydet'}
                      </button>
                    </div>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {locales.map(locale => {
                      const isDefault = currentTranslations[activeNs][key][locale] === defaultMessages[locale]?.[activeNs]?.[key];
                      return (
                        <div key={locale} className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-500 uppercase flex justify-between items-center">
                            <span className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 border border-gray-200">{locale.toUpperCase()}</span>
                              DİLİ
                            </span>
                            {!isDefault && <span className="text-[10px] text-[var(--color-primary-600)] normal-case bg-[var(--color-primary-50)] px-2 py-0.5 rounded-full border border-[var(--color-primary-100)] font-semibold">Özel Çeviri</span>}
                          </label>
                          <textarea
                            value={currentTranslations[activeNs][key][locale] || ''}
                            onChange={(e) => handleChange(activeNs, key, locale, e.target.value)}
                            className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all resize-none ${!isDefault ? 'border-[var(--color-primary-200)] bg-[var(--color-primary-50)]/30' : 'border-gray-200 bg-gray-50/50 hover:bg-white'}`}
                            rows={3}
                            placeholder={`${locale.toUpperCase()} dilindeki karşılığını yazın...`}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
