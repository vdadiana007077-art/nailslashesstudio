'use client';

import React, { useState } from 'react';
import { saveWidgetSettings } from '@/app/actions/support-widget';
import { Language } from '@prisma/client';
import { Settings, MessageSquare, Phone, Palette } from 'lucide-react';

export default function WidgetManager({ initialSettings, initialQuestions }: any) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(initialSettings);
  const [questions, _setQuestions] = useState(initialQuestions);
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState<Language>(Language.TR);

  const handleSettingsSave = async () => {
    setLoading(true);
    try {
      await saveWidgetSettings(settings);
      alert('Ayarlar kaydedildi.');
    } catch (_) {
      alert('Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Genel Ayarlar', icon: Settings },
    { id: 'questions', label: 'Hızlı Sorular', icon: MessageSquare },
    { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
    { id: 'appearance', label: 'Görünüm', icon: Palette }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.id ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">AI Asistan Aktif</h3>
                <p className="text-sm text-gray-500">Widget'ın sitede görünürlüğünü açıp kapatın.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.active} onChange={e => setSettings({...settings, active: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asistan Adı</label>
              <input type="text" value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Karşılama Mesajı (Çok Dilli)</h3>
              <div className="flex gap-2 mb-4">
                {Object.values(Language).map(lang => (
                  <button key={lang} onClick={() => setActiveLang(lang)} className={`px-3 py-1 text-xs rounded-full font-medium ${activeLang === lang ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{lang}</button>
                ))}
              </div>
              <textarea 
                value={settings.greetings[activeLang] || ''} 
                onChange={e => setSettings({...settings, greetings: {...settings.greetings, [activeLang]: e.target.value}})}
                className="w-full px-4 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <button onClick={handleSettingsSave} disabled={loading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
              {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </button>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Numarası</label>
              <input type="text" value={settings.whatsappNumber} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} placeholder="+905000000000" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              <p className="text-xs text-gray-500 mt-1">Uluslararası formatta, boşluksuz girin (örn: +905061155243).</p>
            </div>
            <button onClick={handleSettingsSave} disabled={loading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
              Kaydet
            </button>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6 max-w-2xl">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <input type="text" value={settings.avatar} onChange={e => setSettings({...settings, avatar: e.target.value})} placeholder="https://... veya /images/avatar.png" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Renk Teması</label>
                <select value={settings.theme} onChange={e => setSettings({...settings, theme: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="light">Açık (Standart)</option>
                  <option value="dark">Koyu</option>
                  <option value="rosegold">Rose Gold (Premium)</option>
                  <option value="darkrose">Dark Rose</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Boyutu (px)</label>
                <input type="number" min="40" max="120" value={settings.avatarSize || 72} onChange={e => setSettings({...settings, avatarSize: parseInt(e.target.value) || 72})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Pulse (Nefes Alma) Animasyonu</h3>
                <p className="text-sm text-gray-500">Kapalı durumdayken avatar etrafında hafif bir titreşim efekti gösterir.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.pulseAnimation !== false} onChange={e => setSettings({...settings, pulseAnimation: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Sparkle (Parıltı) Animasyonu</h3>
                <p className="text-sm text-gray-500">Avatar üzerinde ışıltı şeklinde animasyonlar gösterir.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.sparkleAnimation !== false} onChange={e => setSettings({...settings, sparkleAnimation: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Karşılama Mesajı (Tooltip) Açık Mı?</h3>
                <p className="text-sm text-gray-500">Kullanıcı siteye ilk girdiğinde widget yanında küçük bir selamlama mesajı görünür.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.showTooltip !== false} onChange={e => setSettings({...settings, showTooltip: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Yazıyor... Animasyonu</h3>
                <p className="text-sm text-gray-500">Yapay zeka hissiyatı vermek için cevaplardan önce kısa bir bekleme ve animasyon gösterir.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.typingAnimation} onChange={e => setSettings({...settings, typingAnimation: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <button onClick={handleSettingsSave} disabled={loading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
              Kaydet
            </button>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Soru ve Cevaplar</h3>
              {/* Not full CRUD in this simplified admin component to save space, but basic display */}
              <p className="text-xs text-gray-500">Soruları düzenlemek veya eklemek için veritabanı seed aracını kullanabilirsiniz veya buraya detaylı modal eklenebilir.</p>
            </div>

            <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 border border-yellow-200" role="alert">
              <span className="font-medium">Uyarı:</span> Support widget sorusu düzenlenirken actionUrl manuel girildiyse, locale bağımlı URL için <strong>/&#123;locale&#125;/...</strong> formatını kullanın veya ActionType otomatik link üretimini seçin.
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Sıra</th>
                    <th className="px-4 py-3">Soru (TR)</th>
                    <th className="px-4 py-3">Aksiyon Türü</th>
                    <th className="px-4 py-3">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {questions.map((q: any) => (
                    <tr key={q.id} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-3 text-center w-16">{q.order}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{q.translations.find((t:any) => t.language === 'TR')?.question || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{q.actionType}</span>
                      </td>
                      <td className="px-4 py-3">
                        {q.isActive ? <span className="text-green-600 text-xs font-medium">Aktif</span> : <span className="text-red-600 text-xs font-medium">Pasif</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
