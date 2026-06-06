"use client";

import { useState } from 'react';
import { createCmsPage, updateCmsPage, deleteCmsPage } from '@/app/actions/cms-page';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Globe, Settings, Search as SearchIcon,
  Eye, Trash2, ToggleLeft, ToggleRight, FileText,
  Check, X, Loader2, Image as ImageIcon, Type, Link as LinkIcon, Layout
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface PageEditClientProps {
  page: any | null;
  isNew: boolean;
}

const LANGUAGES = [
  { code: 'TR', label: 'TÜRKÇE' },
  { code: 'EN', label: 'ENGLISH' },
  { code: 'DE', label: 'DEUTSCH' },
  { code: 'RU', label: 'РУССКИЙ' }
];

const PREDEFINED_SEO: any = {
  '': {
    TR: { h1Title: 'Lüks Bakım Deneyimi', introText: 'Nails & Lashes Studio ile en iyi versiyonunuza kavuşun. Yenilikçi dokunuşlar, kusursuz sonuçlar.', seoTitle: 'Nails & Lashes Studio - Premium Manikür ve İpek Kirpik', seoDesc: 'Antalya\'nın en lüks güzellik merkezi Nails & Lashes Studio\'da profesyonel manikür, protez tırnak, kalıcı oje ve ipek kirpik hizmetleri.', headerImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop' },
    EN: { h1Title: 'Luxury Beauty Experience', introText: 'Discover your best self with Nails & Lashes Studio. Innovative touches, flawless results.', seoTitle: 'Nails & Lashes Studio - Premium Manicure & Eyelash', seoDesc: 'Professional manicure, acrylic nails, and eyelash extension services at Antalya\'s most luxurious beauty center.', headerImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop' },
    DE: { h1Title: 'Luxus Beauty Erlebnis', introText: 'Entdecken Sie Ihr bestes Ich mit dem Nails & Lashes Studio.', seoTitle: 'Nails & Lashes Studio - Premium Maniküre', seoDesc: 'Professionelle Maniküre, Acrylnägel und Wimpernverlängerung in Antalyas luxuriösestem Schönheitszentrum.', headerImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop' },
    RU: { h1Title: 'Роскошный Опыт Красоты', introText: 'Откройте для себя лучшую версию себя с Nails & Lashes Studio.', seoTitle: 'Nails & Lashes Studio - Премиум Маникюр', seoDesc: 'Профессиональный маникюр, наращивание ногтей и ресниц в самом роскошном центре красоты Анталии.', headerImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop' }
  },
  'services': {
    TR: { h1Title: 'Premium Hizmetlerimiz', introText: 'Güzelliğinizi ön plana çıkaracak özel tasarlanmış lüks bakım ve estetik hizmetlerimiz.', seoTitle: 'Hizmetlerimiz | Protez Tırnak | Nails & Lashes', seoDesc: 'Tırnak tasarımı, kalıcı oje, ipek kirpik ve kaş tasarımı gibi güzellik ve bakım alanında lüks hizmetler.', headerImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop' },
    EN: { h1Title: 'Our Premium Services', introText: 'Specially designed luxury care and aesthetic services to highlight your beauty.', seoTitle: 'Our Services | Acrylic Nails | Nails & Lashes', seoDesc: 'Luxury services offered by our expert team in beauty and care areas such as nail design, gel polish, eyelash extensions.', headerImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop' },
    DE: { h1Title: 'Unsere Premium Leistungen', introText: 'Speziell entworfene Luxuspflege und ästhetische Dienstleistungen.', seoTitle: 'Unsere Leistungen | Acrylnägel | Nails & Lashes', seoDesc: 'Luxusdienstleistungen von unserem Expertenteam in den Bereichen Nageldesign, Gellack, Wimpernverlängerung.', headerImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop' },
    RU: { h1Title: 'Наши Премиум Услуги', introText: 'Специально разработанные услуги роскошного ухода.', seoTitle: 'Наши Услуги | Наращивание Ногтей | Nails & Lashes', seoDesc: 'Роскошные услуги в области дизайна ногтей, гель-лака, наращивания ресниц и дизайна бровей.', headerImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop' }
  },
  'galeri': {
    TR: { h1Title: 'Görsel Sanat Galerimiz', introText: 'Stüdyomuzda gerçekleştirilen büyüleyici dönüşümler ve en trend nail art uygulamalarımız.', seoTitle: 'Fotoğraf Galerisi | Kalıcı Oje ve Nail Art', seoDesc: 'Uzmanlarımız tarafından yapılan protez tırnak, nail art ve ipek kirpik öncesi/sonrası görselleri.', headerImage: 'https://images.unsplash.com/photo-1588693959600-0e42f9e4220b?q=80&w=2070&auto=format&fit=crop' },
    EN: { h1Title: 'Our Visual Art Gallery', introText: 'Fascinating transformations and our trendiest nail art & lash applications.', seoTitle: 'Photo Gallery | Gel Polish and Nail Art', seoDesc: 'High-quality before/after images of acrylic nails, nail art, and eyelash extensions.', headerImage: 'https://images.unsplash.com/photo-1588693959600-0e42f9e4220b?q=80&w=2070&auto=format&fit=crop' },
    DE: { h1Title: 'Unsere Kunstgalerie', introText: 'Faszinierende Verwandlungen und trendige Nail Art Anwendungen.', seoTitle: 'Fotogalerie | Gellack und Nail Art', seoDesc: 'Hochwertige Vorher-/Nachher-Bilder von Acrylnägeln und Wimpernverlängerungen.', headerImage: 'https://images.unsplash.com/photo-1588693959600-0e42f9e4220b?q=80&w=2070&auto=format&fit=crop' },
    RU: { h1Title: 'Наша Галерея', introText: 'Завораживающие преображения и наши трендовые работы.', seoTitle: 'Фотогалерея | Гель-лак и Дизайн', seoDesc: 'Качественные фото до/после наращивания ногтей, нейл-арта и ресниц.', headerImage: 'https://images.unsplash.com/photo-1588693959600-0e42f9e4220b?q=80&w=2070&auto=format&fit=crop' }
  },
  'iletisim': {
    TR: { h1Title: 'Bizimle İletişime Geçin', introText: 'Sorularınız, görüşleriniz veya detaylı bilgi almak için dilediğiniz an bizimle iletişime geçebilirsiniz.', seoTitle: 'İletişim | Antalya Nails & Lashes Studio', seoDesc: 'İletişim bilgileri, adres haritası ve WhatsApp randevu hattımız.', headerImage: 'https://images.unsplash.com/photo-1596178060671-7a80fc80e6c5?q=80&w=2070&auto=format&fit=crop' },
    EN: { h1Title: 'Contact Us', introText: 'You can contact us at any time for your questions or detailed information.', seoTitle: 'Contact | Antalya Nails & Lashes Studio', seoDesc: 'Contact information, address map, and WhatsApp appointment line.', headerImage: 'https://images.unsplash.com/photo-1596178060671-7a80fc80e6c5?q=80&w=2070&auto=format&fit=crop' },
    DE: { h1Title: 'Kontaktiere Uns', introText: 'Für Ihre Fragen oder detaillierte Informationen können Sie uns jederzeit kontaktieren.', seoTitle: 'Kontakt | Antalya Nails & Lashes Studio', seoDesc: 'Kontaktinformationen, Adresskarte und WhatsApp-Terminvereinbarung.', headerImage: 'https://images.unsplash.com/photo-1596178060671-7a80fc80e6c5?q=80&w=2070&auto=format&fit=crop' },
    RU: { h1Title: 'Связаться с Нами', introText: 'Вы можете связаться с нами в любое время для получения подробной информации.', seoTitle: 'Контакты | Antalya Nails & Lashes Studio', seoDesc: 'Контактная информация, карта адресов и линия записи WhatsApp.', headerImage: 'https://images.unsplash.com/photo-1596178060671-7a80fc80e6c5?q=80&w=2070&auto=format&fit=crop' }
  }
};

export default function PageEditClient({ page, isNew }: PageEditClientProps) {
  const router = useRouter();

  const [activeLang, setActiveLang] = useState<'TR' | 'EN' | 'DE' | 'RU'>('TR');
  const [isActive, setIsActive] = useState(page?.isActive ?? true);
  const [pageGroup, setPageGroup] = useState(page?.pageGroup || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Menü Entegrasyonu
  const [headerMenu, setHeaderMenu] = useState(page?.menuItems?.some((m: any) => m.menuType === 'HEADER' && m.isActive) ?? false);
  const [footerMenu, setFooterMenu] = useState(page?.menuItems?.some((m: any) => m.menuType === 'FOOTER' && m.isActive) ?? false);
  const [order, setOrder] = useState(page?.menuItems?.[0]?.order || 0);

  // Dil bazlı tüm state'ler
  const [translations, setTranslations] = useState<Record<string, any>>(
    LANGUAGES.reduce((acc, lang) => {
      const existing = page?.translations?.find((t: any) => t.language === lang.code);
      const slugKey = existing?.slug || page?.translations?.[0]?.slug || '';
      const fallback = PREDEFINED_SEO[slugKey]?.[lang.code];

      acc[lang.code] = {
        title: existing?.title || '',
        h1Title: existing?.h1Title || fallback?.h1Title || '',
        editorTitle: existing?.editorTitle || '',
        introText: existing?.introText || fallback?.introText || '',
        content: existing?.content || '',
        headerImage: existing?.headerImage || fallback?.headerImage || '',
        thumbnailImage: existing?.thumbnailImage || fallback?.headerImage || '',
        slug: existing?.slug || '',
        seoTitle: existing?.seoTitle || fallback?.seoTitle || '',
        seoDesc: existing?.seoDesc || fallback?.seoDesc || '',
        canonical: existing?.canonical || '',
        ogTitle: existing?.ogTitle || fallback?.seoTitle || '',
        ogDesc: existing?.ogDesc || fallback?.seoDesc || '',
        ogImage: existing?.ogImage || fallback?.headerImage || '',
        index: existing?.index ?? true,
        sitemap: existing?.sitemap ?? true,
      };
      return acc;
    }, {} as any)
  );

  // Media Picker State
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'header' | 'thumbnail' | null>(null);

  const t = translations[activeLang];

  const updateTranslation = (field: string, value: any) => {
    setTranslations(prev => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [field]: value
      }
    }));
  };

  const handleMediaSelect = (url: string) => {
    setTranslations((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((lang) => {
        if (mediaTarget === 'header') {
          next[lang] = { ...next[lang], headerImage: url };
        } else if (mediaTarget === 'thumbnail') {
          next[lang] = { ...next[lang], thumbnailImage: url };
        }
      });
      return next;
    });
    setMediaPickerOpen(false);
  };

  const autoSlug = (text: string) => {
    return text.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  };

  const handleSave = async () => {
    if (!t.title || !t.slug) {
      alert(`${activeLang} dilinde Başlık ve URL Slug alanları zorunludur! Lütfen o sekmeye geçip doldurun.`);
      return;
    }

    setLoading(true);
    setSaved(false);

    const formData = new FormData();
    formData.append('isActive', isActive.toString());
    formData.append('pageGroup', pageGroup);
    formData.append('headerMenu', headerMenu.toString());
    formData.append('footerMenu', footerMenu.toString());
    formData.append('order', order.toString());
    
    // Yalnızca aktif dili kaydediyoruz (ya da tüm dilleri tek seferde kaydetmek isterseniz action güncellenmeli. Şu anki action tek dil destekliyor.)
    // DİKKAT: Mevcut sistemde `/admin/pages` modülü tek dilli kaydediyor, ancak sekme yapısıyla aktif dili gönderiyoruz.
    // Biz mevcut API'yi bozmamak adına aktif dili kaydetmeyi sürdürüyoruz. İleride action array kabul edebilir.
    formData.append('language', activeLang);
    formData.append('title', t.title);
    formData.append('h1Title', t.h1Title);
    formData.append('editorTitle', t.editorTitle);
    formData.append('introText', t.introText);
    formData.append('content', t.content);
    formData.append('headerImage', t.headerImage);
    formData.append('thumbnailImage', t.thumbnailImage);
    formData.append('slug', t.slug);
    formData.append('seoTitle', t.seoTitle);
    formData.append('seoDesc', t.seoDesc);
    formData.append('canonical', t.canonical);
    formData.append('ogTitle', t.ogTitle);
    formData.append('ogDesc', t.ogDesc);
    formData.append('ogImage', t.ogImage);
    formData.append('index', t.index.toString());
    formData.append('sitemap', t.sitemap.toString());

    let result;
    if (isNew) {
      result = await createCmsPage(formData);
    } else {
      const translationId = page?.translations?.find((x: any) => x.language === activeLang)?.id || null;
      result = await updateCmsPage(page!.id, translationId, formData);
    }

    setLoading(false);

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (isNew) {
        router.push('/admin/pages');
      }
    } else {
      alert(result.error || 'Hata oluştu.');
    }
  };

  const handleDelete = async () => {
    if (!page || isNew) return;
    if (!confirm('Bu sayfayı pasifleştirmek istediğinize emin misiniz?')) return;
    await deleteCmsPage(page.id);
    router.push('/admin/pages');
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText size={22} className="text-rose-600" />
              {isNew ? 'Yeni Sayfa Oluştur' : 'Sayfayı Düzenle'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">SAYFA & İÇERİK YÖNETİMİ</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isNew && (
            <button onClick={handleDelete} className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Trash2 size={18} /> Sil
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? 'Kaydedildi' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50/50">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SOL BLOK */}
          <div className="col-span-1 lg:col-span-3 space-y-6">
            
            {/* SAYFA GÖRSELLERİ */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <ImageIcon size={18} className="text-blue-500" />
                <h3 className="font-semibold text-gray-800 text-sm tracking-wide">SAYFA GÖRSELLERİ</h3>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Header Görseli (Geniş)</label>
                  <div 
                    onClick={() => { setMediaTarget('header'); setMediaPickerOpen(true); }}
                    className="aspect-video w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors group relative"
                  >
                    {t.headerImage ? (
                      <img src={t.headerImage} alt="Header" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon size={24} className="mx-auto text-gray-400 group-hover:text-blue-500 mb-2" />
                        <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">Görsel Seç</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Liste / Thumbnail</label>
                  <div 
                    onClick={() => { setMediaTarget('thumbnail'); setMediaPickerOpen(true); }}
                    className="aspect-[4/3] w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors group relative"
                  >
                    {t.thumbnailImage ? (
                      <img src={t.thumbnailImage} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon size={24} className="mx-auto text-gray-400 group-hover:text-blue-500 mb-2" />
                        <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">Görsel Seç</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* YAPILANDIRMA */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Settings size={18} className="text-rose-500" />
                <h3 className="font-semibold text-gray-800 text-sm tracking-wide">YAPILANDIRMA</h3>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Sistem Adı (Liste)</label>
                  <input
                    type="text"
                    value={t.title}
                    onChange={(e) => {
                      updateTranslation('title', e.target.value);
                      if (!t.slug) updateTranslation('slug', autoSlug(e.target.value));
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Örn: Transfer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Sayfa Grubu</label>
                  <select
                    value={pageGroup}
                    onChange={(e) => setPageGroup(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Grup Yok</option>
                    <option value="ust-menu">Üst Menü Sayfası</option>
                    <option value="alt-menu">Alt Menü Sayfası</option>
                    <option value="kurumsal">Kurumsal</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Sıralama</label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center pt-5">
                    <button
                      onClick={() => setIsActive(!isActive)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                      {isActive ? 'YAYINDA' : 'PASİF'}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between gap-2">
                   <button
                    onClick={() => setHeaderMenu(!headerMenu)}
                    className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all ${
                      headerMenu ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {headerMenu ? <ToggleRight size={20} className="text-blue-500"/> : <ToggleLeft size={20} className="text-gray-400"/>}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Header Menü</span>
                  </button>

                  <button
                    onClick={() => setFooterMenu(!footerMenu)}
                    className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all ${
                      footerMenu ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {footerMenu ? <ToggleRight size={20} className="text-blue-500"/> : <ToggleLeft size={20} className="text-gray-400"/>}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Footer Menü</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* SAĞ BLOK */}
          <div className="col-span-1 lg:col-span-9 flex flex-col gap-6">
            
            {/* Dil Sekmeleri */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code as any)}
                  className={`px-6 py-3 rounded-t-xl font-medium text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeLang === lang.code
                      ? 'bg-white text-blue-600 border-t-2 border-x border-blue-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent'
                  }`}
                >
                  <Globe size={14} className={activeLang === lang.code ? 'text-blue-500' : 'text-gray-400'} />
                  {lang.label}
                </button>
              ))}
            </div>

            {/* SAYFA BAŞLIKLARI */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Type size={18} className="text-blue-500" />
                <h3 className="font-semibold text-gray-800 text-sm tracking-wide uppercase">Sayfa Başlıkları ({activeLang})</h3>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Sayfa Başlığı (Sistem)</label>
                    <input
                      type="text"
                      value={t.title}
                      onChange={(e) => updateTranslation('title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">H1 Başlık (Hero / Banner)</label>
                    <input
                      type="text"
                      value={t.h1Title}
                      onChange={(e) => updateTranslation('h1Title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Gövde / Editör Başlığı</label>
                    <input
                      type="text"
                      value={t.editorTitle}
                      onChange={(e) => updateTranslation('editorTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Giriş Metni (Intro Banner)</label>
                  <textarea
                    value={t.introText}
                    onChange={(e) => updateTranslation('introText', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* DETAYLI İÇERİK */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Layout size={18} className="text-orange-500" />
                  <h3 className="font-semibold text-gray-800 text-sm tracking-wide uppercase">Detaylı İçerik (Gövde)</h3>
                </div>
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider bg-orange-50 px-2 py-1 rounded">
                  {pageGroup === 'SYSTEM' ? 'SİSTEM SAYFASI' : 'ZENGİN METİN'}
                </span>
              </div>
              {pageGroup === 'SYSTEM' ? (
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-gray-50/50">
                  <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Layout size={32} className="text-blue-500" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Bu Bir Sistem Sayfasıdır</h4>
                  <p className="text-sm text-gray-500 max-w-md">
                    Bu sayfanın ana içeriği ve tasarımı sistem mimarisinden otomatik çekilir. İçerik editörü üzerinden değiştirilemez. 
                    <br/><br/>Ancak sol bölümden <strong>Fotoğraflarını ve Menü Durumunu</strong>, aşağıdan ise <strong>SEO (Arama Motoru) Ayarlarını</strong> özgürce yönetebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="flex-1 p-0 overflow-hidden">
                  <RichTextEditor 
                    content={t.content} 
                    onChange={(val) => updateTranslation('content', val)} 
                  />
                </div>
              )}
            </div>

            {/* SEO & ARAMA MOTORU AYARLARI */}
            <div className="bg-[#0f172a] rounded-xl border border-slate-700 shadow-sm overflow-hidden mb-8">
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                <SearchIcon size={18} className="text-cyan-400" />
                <h3 className="font-semibold text-white text-sm tracking-wide uppercase">SEO & Arama Motoru Ayarları</h3>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2 lg:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Sayfa Rota Adresi (URL Slug)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-medium">/{activeLang.toLowerCase()}/</span>
                      </div>
                      <input
                        type="text"
                        value={t.slug}
                        onChange={(e) => updateTranslation('slug', e.target.value)}
                        className="w-full pl-[4.5rem] pr-4 py-2.5 border rounded-lg text-sm transition-all font-mono bg-slate-800/50 border-slate-600 text-cyan-50 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Google Başlığı (Meta Title)</label>
                    <input
                      type="text"
                      value={t.seoTitle}
                      onChange={(e) => updateTranslation('seoTitle', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Arama Motoru Açıklaması (Meta Description)</label>
                  <textarea
                    value={t.seoDesc}
                    onChange={(e) => updateTranslation('seoDesc', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </>
  );
}
