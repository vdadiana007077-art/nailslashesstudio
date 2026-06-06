"use client";

import { useState } from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import Link from 'next/link';

type PortfolioItem = {
  id: string;
  beforeImage: string;
  afterImage: string;
  category: string;
  isFeatured: boolean;
  title: string;
  description: string;
};

type PortfolioClientProps = {
  items: PortfolioItem[];
  categories: string[];
  bookingHref?: string;
};

export default function PortfolioClient({ items, categories, bookingHref = '/randevu-al' }: PortfolioClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredItems = items.filter(item => {
    return selectedCategory === 'ALL' || item.category === selectedCategory;
  });

  return (
    <div className="space-y-12">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 bg-white border border-[var(--color-rose-100)] rounded-3xl p-5 shadow-sm max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            selectedCategory === 'ALL'
              ? 'bg-gray-950 text-white shadow-sm'
              : 'bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Tümü
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-[var(--color-rose-600)] text-white shadow-sm'
                : 'bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-6 shadow-sm flex flex-col justify-between group">
              <div>
                {/* Before/After Interactive Slider */}
                <BeforeAfterSlider before={item.beforeImage} after={item.afterImage} />
                
                <h3 className="text-xl font-serif italic font-bold text-gray-950 mt-6 mb-2 group-hover:text-[var(--color-rose-700)] transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-gray-500 text-xs leading-relaxed mb-6">
                  {item.description || 'Bu çalışma için açıklama eklenmemiştir.'}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50 text-xs">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 font-bold rounded-full uppercase tracking-wider text-[9px]">
                  {item.category}
                </span>
                <Link
                  href={bookingHref}
                  className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Calendar size={12} />
                  Randevu Al
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl text-gray-400 text-sm">
          Bu kategoriye ait portföy çalışması bulunamadı.
        </div>
      )}
    </div>
  );
}

// 📸 INTERACTIVE BEFORE/AFTER SLIDER COMPONENT
function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [sliderPosition, setSliderPosition] = useState(50); // slider konumu yüzde 0 - 100
  const [isSliding, setIsSliding] = useState(false);

  const handleMove = (clientX: number, currentTarget: HTMLDivElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX, e.currentTarget);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1 || isSliding) {
      handleMove(e.clientX, e.currentTarget);
    }
  };

  return (
    <div 
      className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative select-none cursor-ew-resize bg-gray-100 border border-gray-100"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseDown={() => setIsSliding(true)}
      onMouseUp={() => setIsSliding(false)}
      onMouseLeave={() => setIsSliding(false)}
    >
      {/* Before Image (Background) */}
      <img 
        src={before} 
        alt="Before" 
        className="w-full h-full object-cover absolute inset-0 pointer-events-none" 
      />
      <span className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-1.5 rounded-lg z-10 shadow-sm pointer-events-none">
        Önce
      </span>

      {/* After Image (Foreground, clipped based on sliderPosition) */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={after} 
          alt="After" 
          className="w-full h-full object-cover absolute inset-0 max-w-none"
          style={{ width: '100%', height: '100%' }} // Tam orantıyı korumak için
        />
      </div>
      <span className="absolute bottom-4 right-4 bg-[var(--color-rose-600)]/90 backdrop-blur-sm text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-1.5 rounded-lg z-10 shadow-sm pointer-events-none">
        Sonra
      </span>

      {/* Sürükleme Çubuğu (Separator Bar) */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-md flex items-center justify-center pointer-events-none z-20"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg transform -translate-x-0.5 text-gray-500 hover:text-gray-900 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18-6-6 6-6"/><path d="m15 6 6 6-6 6"/></svg>
        </div>
      </div>
    </div>
  );
}
