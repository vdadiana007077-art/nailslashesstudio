'use client';

import { useState } from 'react';
import { ZoomIn, X, Image as ImageIcon, Sparkles } from 'lucide-react';

type GalleryImageItem = {
  id: string;
  url: string;
  alt: string;
  title: string;
};

type Props = {
  images: GalleryImageItem[];
  locale: string;
};

export default function GalleryClient({ images, locale }: Props) {
  const [selectedImage, setSelectedImage] = useState<GalleryImageItem | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Basit etiketleme mantığı (resim alt/title metinlerine göre)
  const categories = [
    { id: 'all', tr: 'Tümü', en: 'All', de: 'Alle', ru: 'Все' },
    { id: 'nail', tr: 'Tırnak Bakımı', en: 'Nails', de: 'Nägel', ru: 'Ногти' },
    { id: 'lash', tr: 'Kirpik & Kaş', en: 'Lashes & Brows', de: 'Wimpern & Brauen', ru: 'Ресницы' },
    { id: 'salon', tr: 'Stüdyomuz', en: 'Our Studio', de: 'Unser Studio', ru: 'Студия' },
  ];

  const getFilteredImages = () => {
    if (activeFilter === 'all') return images;
    return images.filter(img => {
      const text = `${img.alt} ${img.title} ${img.url}`.toLowerCase();
      if (activeFilter === 'nail') {
        return text.includes('nail') || text.includes('tırnak') || text.includes('oje') || text.includes('manikür') || text.includes('nagel');
      }
      if (activeFilter === 'lash') {
        return text.includes('lash') || text.includes('kirpik') || text.includes('kaş') || text.includes('lift') || text.includes('wimpern') || text.includes('brow');
      }
      if (activeFilter === 'salon') {
        return text.includes('salon') || text.includes('studio') || text.includes('stüdyo');
      }
      return true;
    });
  };

  const getTranslation = (cat: typeof categories[0]) => {
    const lang = locale.toLowerCase();
    if (lang === 'tr') return cat.tr;
    if (lang === 'de') return cat.de;
    if (lang === 'ru') return cat.ru;
    return cat.en;
  };

  const filtered = getFilteredImages();

  return (
    <div className="space-y-12">
      {/* Kategori Filtreleri */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeFilter === cat.id
                ? 'bg-gray-950 text-white shadow-md -translate-y-0.5'
                : 'bg-white border border-[var(--color-primary-300)]/30 text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-light-300)]/20'
            }`}
          >
            {getTranslation(cat)}
          </button>
        ))}
      </div>

      {/* Görsel Masonry Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 glass-panel rounded-[2rem] max-w-lg mx-auto">
          <ImageIcon className="mx-auto text-[var(--color-rose-300)] mb-4" size={48} />
          <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">Görsel Bulunamadı</h3>
          <p className="text-gray-500 text-sm">Bu kategoriye ait uygulama görseli henüz yüklenmemiş.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {filtered.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className="break-inside-avoid group relative rounded-[2rem] overflow-hidden bg-white border border-[var(--color-primary-300)]/20 cursor-pointer shadow-sm hover:shadow-[0_20px_40px_rgba(197,139,139,0.12)] transition-all duration-500 hover:-translate-y-1"
            >
              {/* Glass Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-6">
                <div className="w-full text-white transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary-300)] mb-1">
                      <Sparkles size={10} /> Luxury Art
                    </span>
                    <p className="text-sm font-medium line-clamp-1">{img.title}</p>
                  </div>
                  <div className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
                    <ZoomIn size={16} />
                  </div>
                </div>
              </div>

              {/* Image */}
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-auto object-cover max-h-[500px]"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors border border-white/10"
            aria-label="Kapat"
          >
            <X size={24} />
          </button>
          
          <div 
            className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/5"
            />
            <div className="mt-6 text-center text-white max-w-xl">
              <h4 className="text-lg font-serif italic text-[var(--color-primary-300)] mb-1">{selectedImage.title}</h4>
              <p className="text-sm text-gray-400 font-light">{selectedImage.alt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
