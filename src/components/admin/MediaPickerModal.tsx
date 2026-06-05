"use client";

import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Check, Search, Loader2 } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  altText: string | null;
  fileName: string | null;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentValue?: string;
}

export default function MediaPickerModal({ isOpen, onClose, onSelect, currentValue }: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(currentValue || '');

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedUrl(currentValue || '');
    }
  }, [isOpen, currentValue]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setItems(data.media || []);
      }
    } catch (err) {
      console.error('Medya çekilemedi:', err);
    }
    setLoading(false);
  };

  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      (item.fileName && item.fileName.toLowerCase().includes(search)) ||
      (item.altText && item.altText.toLowerCase().includes(search)) ||
      item.url.toLowerCase().includes(search)
    );
  });

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon size={18} className="text-[var(--color-rose-600)]" />
              Medya Kütüphanesinden Seç
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Görsel seçmek için tıklayın, sonra onaylayın.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Arama */}
        <div className="px-6 py-3 border-b border-gray-100 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Dosya adı ile ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-rose-500)]"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[var(--color-rose-600)]" size={24} />
              <span className="ml-2 text-sm text-gray-500">Yükleniyor...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium text-sm">
                {searchTerm ? 'Aramanızla eşleşen görsel bulunamadı.' : 'Medya kütüphanesinde henüz görsel bulunmuyor.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedUrl(item.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                    selectedUrl === item.url
                      ? 'border-[var(--color-rose-500)] ring-2 ring-[var(--color-rose-200)] shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.altText || item.fileName || ''}
                    className="w-full h-full object-cover"
                  />
                  {selectedUrl === item.url && (
                    <div className="absolute inset-0 bg-[var(--color-rose-600)]/20 flex items-center justify-center">
                      <div className="bg-[var(--color-rose-600)] text-white rounded-full p-1.5">
                        <Check size={14} />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-white truncate font-medium">
                      {item.fileName || 'Adsız'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <div className="text-xs text-gray-500">
            {selectedUrl ? (
              <span className="font-mono truncate max-w-[300px] inline-block">{selectedUrl}</span>
            ) : (
              'Henüz seçim yapılmadı.'
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedUrl}
              className="bg-[var(--color-rose-600)] text-white px-5 py-2 rounded-xl hover:bg-[var(--color-rose-700)] text-sm font-semibold shadow-sm disabled:opacity-50"
            >
              Seçimi Onayla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
