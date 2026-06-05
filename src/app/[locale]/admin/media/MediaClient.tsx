"use client";

import { useState, useRef } from 'react';
import { updateMediaItem, deleteMediaItem } from '@/app/actions/media';
import { Upload, X, Search, Image as ImageIcon, Trash2, Edit3, Link as LinkIcon, Info } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  title: string | null;
  altText: string | null;
  caption: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

interface MediaClientProps {
  initialMedia: MediaItem[];
  locale: string;
}

export default function MediaClient({ initialMedia, locale }: MediaClientProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  
  // Yükleme durumu
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Düzenleme durumu
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Arama filtresi
  const filteredMedia = mediaList.filter(item => 
    item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.altText && item.altText.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Dosya Yükleme Tetikleyici
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadError('');
    
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.split('.')[0]); // Varsayılan başlık
    formData.append('altText', file.name.split('.')[0]); // Varsayılan SEO alt metni

    try {
      const res = await fetch(`/api/media/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (res.ok && result.success) {
        // Listeyi güncelle ve yeni yükleneni seç
        setMediaList([result.data, ...mediaList]);
        setSelectedItem(result.data);
        setEditTitle(result.data.title || '');
        setEditAltText(result.data.altText || '');
        setEditCaption(result.data.caption || '');
      } else {
        setUploadError(result.error || 'Dosya yükleme başarısız.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Bağlantı hatası oluştu.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const selectItem = (item: MediaItem) => {
    setSelectedItem(item);
    setEditTitle(item.title || '');
    setEditAltText(item.altText || '');
    setEditCaption(item.caption || '');
  };

  const handleUpdateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsUpdating(true);

    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('altText', editAltText);
    formData.append('caption', editCaption);

    const result = await updateMediaItem(selectedItem.id, formData);
    setIsUpdating(false);

    if (result.success && result.data) {
      setMediaList(mediaList.map(m => m.id === selectedItem.id ? (result.data as MediaItem) : m));
      setSelectedItem(result.data as MediaItem);
      alert('Görsel SEO bilgileri başarıyla güncellendi.');
    } else {
      alert(result.error || 'Bilgiler güncellenirken hata oluştu.');
    }
  };

  const handleDeleteItem = async (id: string, fileName: string) => {
    const confirmDelete = window.confirm(`"${fileName}" görselini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`);
    if (!confirmDelete) return;

    const result = await deleteMediaItem(id);
    if (result.success) {
      setMediaList(mediaList.filter(m => m.id !== id));
      setSelectedItem(null);
    } else {
      alert(result.error || 'Görsel silinirken hata oluştu.');
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    alert('Medya URL\'si kopyalandı.');
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8">
      {/* Sol Kısım: Arama, Yükleme ve Liste */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Kontrol Alanı (Arama & Hızlı Yükleme) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Medya ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
            />
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Upload size={16} /> {isUploading ? 'Yükleniyor...' : 'Görsel Yükle'}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl">
            {uploadError}
          </div>
        )}

        {/* Medya Grid Galerisi */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => selectItem(item)}
              className={`aspect-square relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 group ${
                selectedItem?.id === item.id 
                  ? 'border-[var(--color-primary-500)] ring-4 ring-[var(--color-primary-300)]/30 scale-[0.98]' 
                  : 'border-gray-100 hover:border-gray-300 shadow-sm'
              }`}
            >
              <img
                src={item.url}
                alt={item.altText || item.fileName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                Detayları Gör
              </div>
            </div>
          ))}

          {filteredMedia.length === 0 && (
            <div className="col-span-full bg-white border border-dashed border-gray-200 text-gray-400 rounded-2xl p-16 text-center text-sm font-semibold flex flex-col items-center gap-3">
              <ImageIcon size={36} className="text-gray-300" />
              Medya kütüphanesi boş.
            </div>
          )}
        </div>
      </div>

      {/* Sağ Kısım: Medya SEO & Bilgi Paneli */}
      <div className="w-full lg:w-96 flex-shrink-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col">
        {selectedItem ? (
          <div className="flex flex-col h-full gap-6">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800 text-base">Medya Detayları</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Önizleme */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-gray-100 relative group">
              <img
                src={selectedItem.url}
                alt="Önizleme"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => copyLink(selectedItem.url)}
                className="absolute bottom-3 right-3 p-2 bg-white/95 rounded-lg text-gray-600 hover:text-gray-900 shadow-md transition-colors cursor-pointer"
                title="URL Kopyala"
              >
                <LinkIcon size={14} />
              </button>
            </div>

            {/* Dosya Bilgileri */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-2 font-medium">
              <div className="flex justify-between"><span className="text-gray-400">Dosya Adı:</span> <span className="truncate max-w-[180px] font-bold text-gray-700" title={selectedItem.fileName}>{selectedItem.fileName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Dosya Boyutu:</span> <span className="text-gray-700 font-bold">{(selectedItem.fileSize / 1024).toFixed(1)} KB</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Dosya Tipi:</span> <span className="text-gray-700 font-bold">{selectedItem.mimeType}</span></div>
            </div>

            {/* Görsel SEO Düzenleme Formu */}
            <form onSubmit={handleUpdateMeta} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Başlık (Title)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Görsel başlığı..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  SEO Alt Metni (Alt Text) *
                  <span className="text-[var(--color-primary-500)]" title="Arama motorları için resmin ne olduğunu açıklar. SEO için çok kritiktir."><Info size={13}/></span>
                </label>
                <input
                  type="text"
                  required
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="Görselin SEO açıklaması..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Açıklama (Caption)</label>
                <textarea
                  rows={2}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Görsel alt yazısı..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-50 mt-6">
                <button
                  type="button"
                  onClick={() => handleDeleteItem(selectedItem.id, selectedItem.fileName)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 size={14} /> Sil
                </button>
                
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
                >
                  {isUpdating ? 'Güncelleniyor...' : 'SEO Güncelle'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-3 py-16">
            <ImageIcon size={48} className="text-gray-200" />
            <p className="text-sm font-semibold max-w-[200px] leading-relaxed">
              Dosya bilgilerini ve Görsel SEO ayarlarını düzenlemek için soldan bir medya seçin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
