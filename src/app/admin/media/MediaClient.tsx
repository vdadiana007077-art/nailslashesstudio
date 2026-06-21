"use client";

import { useState, useEffect } from 'react';
import { Upload, Copy, Check, FileText } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  title: string | null;
  createdAt: string;
}

export default function MediaClient() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) {
        setMedia(data.media);
      }
    } catch (err) {
      console.error('Medya yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMedia([data.media, ...media]);
      } else {
        alert(data.error || 'Yükleme başarısız.');
      }
    } catch (err) {
      console.error('Yükleme hatası:', err);
      alert('Dosya yüklenirken bir sorun oluştu.');
    } finally {
      setUploading(false);
      // Inputu temizle
      e.target.value = '';
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    const fullUrl = `${window.location.origin}${item.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-8">
      {/* Dosya Yükleme Alanı */}
      <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center mb-4 shadow-inner">
          <Upload size={24} className={uploading ? 'animate-bounce' : ''} />
        </div>
        
        <h3 className="font-bold text-base text-gray-800">Yeni Medya Yükleyin</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm">
          Görsellerinizi sürükleyip bırakın veya bilgisayarınızdan seçin. JPG, PNG, WEBP formatları desteklenir.
        </p>

        <label className="mt-6 px-6 py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1">
          {uploading ? 'YÜKLENİYOR...' : 'DOSYA SEÇ'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Medya Listesi Grid */}
      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
        <h3 className="font-bold text-lg text-gray-800 mb-6">Yüklenen Dosyalar ({media.length})</h3>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[var(--color-primary-500)] rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 font-medium">Kütüphane taranıyor...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs font-semibold">
            Kütüphanenizde henüz dosya bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {media.map((item) => {
              const isImage = item.mimeType.startsWith('image/');
              return (
                <div key={item.id} className="group relative bg-gray-50 rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-48">
                  {/* Görsel Önizleme veya Dosya İkonu */}
                  <div className="w-full h-32 relative bg-gray-200 flex items-center justify-center overflow-hidden shrink-0 border-b border-gray-100">
                    {isImage ? (
                      <img
                        src={item.url}
                        alt={item.title || item.fileName}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <FileText size={36} className="text-gray-400" />
                    )}

                    {/* Hızlı Kopyalama Katmanı */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleCopyUrl(item)}
                        className="p-2 bg-white text-gray-800 hover:text-black rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                        title="URL Kopyala"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={14} className="text-emerald-600" />
                            Kopyalandı!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            URL Kopyala
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Detay Bilgileri */}
                  <div className="p-3 min-w-0">
                    <p className="text-[10px] font-bold text-gray-800 truncate" title={item.fileName}>
                      {item.fileName}
                    </p>
                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">
                      {formatBytes(item.fileSize)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
