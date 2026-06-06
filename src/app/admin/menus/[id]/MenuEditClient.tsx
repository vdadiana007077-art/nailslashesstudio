"use client";
 
import { useState, useEffect } from 'react';
import { createMenuItem, updateMenuItem, deleteMenuItem } from '@/app/actions/menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Save, Globe, Settings, Search as SearchIcon,
  Eye, Trash2, ToggleLeft, ToggleRight, Link as LinkIcon, ExternalLink,
  FileText, Layers, BookOpen, Tag, Layout, Check, Loader2, X
} from 'lucide-react';
import Link from 'next/link';

interface MenuEditClientProps {
  menuItem: any | null;
  isNew: boolean;
  pages: any[];
  serviceCategories: any[];
  services: any[];
  blogCategories: any[];
  blogPosts: any[];
  landingPages: any[];
}

export default function MenuEditClient({ menuItem, isNew, pages, serviceCategories, services, blogCategories, blogPosts, landingPages }: MenuEditClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeLang, setActiveLang] = useState<'TR' | 'EN' | 'DE' | 'RU'>(
    (searchParams.get('lang') || 'TR') as any
  );
  const [menuType, setMenuType] = useState<'HEADER' | 'FOOTER' | 'LEGAL_FOOTER'>(
    (menuItem?.menuType || searchParams.get('type') || 'HEADER') as any
  );
  const [order, setOrder] = useState(menuItem?.order || 0);
  const [target, setTarget] = useState(menuItem?.target || '_self');
  const [isExternal, setIsExternal] = useState(menuItem?.isExternal || false);
  const [isActive, setIsActive] = useState(menuItem?.isActive ?? true);
  const [linkType, setLinkType] = useState(menuItem?.linkType || 'CUSTOM_URL');
  const [pageId, setPageId] = useState(menuItem?.pageId || '');
  const [serviceCategoryId, setServiceCategoryId] = useState(menuItem?.serviceCategoryId || '');
  const [serviceId, setServiceId] = useState(menuItem?.serviceId || '');
  const [blogCategoryId, setBlogCategoryId] = useState(menuItem?.blogCategoryId || '');
  const [blogPostId, setBlogPostId] = useState(menuItem?.blogPostId || '');
  const [landingPageId, setLandingPageId] = useState(menuItem?.landingPageId || '');

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [seoStatus, setSeoStatus] = useState<any>(null);

  // Tüm dillerin başlık ve url'lerini tutan state'ler
  const [titles, setTitles] = useState<Record<'TR' | 'EN' | 'DE' | 'RU', string>>({
    TR: menuItem?.translations?.find((t: any) => t.language === 'TR')?.title || '',
    EN: menuItem?.translations?.find((t: any) => t.language === 'EN')?.title || '',
    DE: menuItem?.translations?.find((t: any) => t.language === 'DE')?.title || '',
    RU: menuItem?.translations?.find((t: any) => t.language === 'RU')?.title || '',
  });

  const [urls, setUrls] = useState<Record<'TR' | 'EN' | 'DE' | 'RU', string>>({
    TR: menuItem?.translations?.find((t: any) => t.language === 'TR')?.url || '',
    EN: menuItem?.translations?.find((t: any) => t.language === 'EN')?.url || '',
    DE: menuItem?.translations?.find((t: any) => t.language === 'DE')?.url || '',
    RU: menuItem?.translations?.find((t: any) => t.language === 'RU')?.url || '',
  });

  const handleLangChange = (lang: 'TR' | 'EN' | 'DE' | 'RU') => {
    setActiveLang(lang);
  };

  const getTranslationName = (translations: any[]) => {
    if (!translations || translations.length === 0) return 'Adsız';
    const t = translations.find((x: any) => x.language === activeLang);
    return t ? (t.title || t.name) : (translations[0].title || translations[0].name) + ` (${activeLang} eksik)`;
  };

  // Otomatik URL üretimi (Tüm diller için)
  useEffect(() => {
    if (linkType === 'CUSTOM_URL' || linkType === 'EXTERNAL_URL') {
      setSeoStatus(null);
      if (linkType === 'EXTERNAL_URL') {
        setIsExternal(true);
        setTarget('_blank');
      }
      return;
    }

    const updatedUrls = { ...urls };
    const langs: ('TR' | 'EN' | 'DE' | 'RU')[] = ['TR', 'EN', 'DE', 'RU'];

    langs.forEach((lang) => {
      let generatedUrl = '';
      let selectedItem: any = null;
      let selectedTranslation: any = null;
      const basePrefix = `/${lang.toLowerCase()}`;
      const servicesPrefix = lang === 'TR' ? '/hizmetler' : lang === 'DE' ? '/dienstleistungen' : lang === 'RU' ? '/uslugi' : '/services';

      if (linkType === 'CMS_PAGE' && pageId) {
        selectedItem = pages.find(p => p.id === pageId);
        selectedTranslation = selectedItem?.translations?.find((t: any) => t.language === lang);
        if (selectedTranslation?.slug) generatedUrl = `${basePrefix}/${selectedTranslation.slug}`;
      } else if (linkType === 'SERVICE_CATEGORY' && serviceCategoryId) {
        selectedItem = serviceCategories.find(c => c.id === serviceCategoryId);
        selectedTranslation = selectedItem?.translations?.find((t: any) => t.language === lang);
        if (selectedTranslation?.slug) generatedUrl = `${basePrefix}${servicesPrefix}/${selectedTranslation.slug}`;
      } else if (linkType === 'SERVICE_DETAIL' && serviceId) {
        selectedItem = services.find(s => s.id === serviceId);
        selectedTranslation = selectedItem?.translations?.find((t: any) => t.language === lang);
        if (selectedTranslation?.slug) {
          const cat = serviceCategories.find(c => c.id === selectedItem.categoryId);
          const catT = cat?.translations?.find((t: any) => t.language === lang);
          const cSlug = catT?.slug || 'kategori';
          generatedUrl = `${basePrefix}${servicesPrefix}/${cSlug}/${selectedTranslation.slug}`;
        }
      } else if (linkType === 'BLOG_CATEGORY' && blogCategoryId) {
        selectedItem = blogCategories.find(c => c.id === blogCategoryId);
        selectedTranslation = selectedItem?.translations?.find((t: any) => t.language === lang);
        if (selectedTranslation?.slug) generatedUrl = `${basePrefix}/blog/${selectedTranslation.slug}`;
      } else if (linkType === 'BLOG_DETAIL' && blogPostId) {
        selectedItem = blogPosts.find(p => p.id === blogPostId);
        selectedTranslation = selectedItem?.translations?.find((t: any) => t.language === lang);
        if (selectedTranslation?.slug) generatedUrl = `${basePrefix}/blog/${selectedTranslation.slug}`;
      } else if (linkType === 'LANDING_PAGE' && landingPageId) {
        selectedItem = landingPages.find(l => l.id === landingPageId);
        selectedTranslation = selectedItem?.translations?.find((t: any) => t.language === lang);
        if (selectedTranslation?.slug) generatedUrl = `${basePrefix}/${selectedTranslation.slug}`;
      }

      if (generatedUrl) {
        updatedUrls[lang] = generatedUrl;
      }
    });

    setUrls(updatedUrls);
    setIsExternal(false);

    // Active lang'in SEO durumunu güncelle
    let selectedItem: any = null;
    let selectedTranslation: any = null;
    if (linkType === 'CMS_PAGE' && pageId) {
      selectedItem = pages.find(p => p.id === pageId);
    } else if (linkType === 'SERVICE_CATEGORY' && serviceCategoryId) {
      selectedItem = serviceCategories.find(c => c.id === serviceCategoryId);
    } else if (linkType === 'SERVICE_DETAIL' && serviceId) {
      selectedItem = services.find(s => s.id === serviceId);
    } else if (linkType === 'BLOG_CATEGORY' && blogCategoryId) {
      selectedItem = blogCategories.find(c => c.id === blogCategoryId);
    } else if (linkType === 'BLOG_DETAIL' && blogPostId) {
      selectedItem = blogPosts.find(p => p.id === blogPostId);
    } else if (linkType === 'LANDING_PAGE' && landingPageId) {
      selectedItem = landingPages.find(l => l.id === landingPageId);
    }

    if (selectedItem) {
      selectedTranslation = selectedItem.translations?.find((t: any) => t.language === activeLang);
      if (selectedTranslation) {
        setSeoStatus({
          title: !!selectedTranslation.seoTitle,
          desc: !!selectedTranslation.seoDesc,
          canonical: !!selectedTranslation.canonical,
          ogImage: !!selectedTranslation.ogImage,
          index: selectedTranslation.index !== false,
          sitemap: selectedTranslation.sitemap !== false
        });
      } else {
        setSeoStatus('MISSING_TRANSLATION');
      }
    } else {
      setSeoStatus(null);
    }
  }, [linkType, pageId, serviceCategoryId, serviceId, blogCategoryId, blogPostId, landingPageId, activeLang]);

  const handleSave = async () => {
    // Doldurulmuş dillerin listesini hazırla
    const validTranslations = Object.entries(titles)
      .map(([lang, t]) => ({ language: lang, title: t, url: urls[lang as 'TR' | 'EN' | 'DE' | 'RU'] }))
      .filter(t => t.title && t.url);

    if (validTranslations.length === 0) {
      alert('Lütfen en az bir dilde sayfa başlığı ve yönlendirme linki girin.');
      return;
    }

    setLoading(true);
    setSaved(false);

    const formData = new FormData();
    formData.append('menuType', menuType);
    formData.append('order', order.toString());
    formData.append('target', target);
    formData.append('isExternal', isExternal ? 'true' : 'false');
    formData.append('isActive', isActive ? 'true' : 'false');
    formData.append('linkType', linkType);
    if (pageId) formData.append('pageId', pageId);
    if (serviceCategoryId) formData.append('serviceCategoryId', serviceCategoryId);
    if (serviceId) formData.append('serviceId', serviceId);
    if (blogCategoryId) formData.append('blogCategoryId', blogCategoryId);
    if (blogPostId) formData.append('blogPostId', blogPostId);
    if (landingPageId) formData.append('landingPageId', landingPageId);

    // Tüm dillerin verisini JSON formatında gönder
    formData.append('translations', JSON.stringify(validTranslations));

    let res;
    if (isNew) {
      res = await createMenuItem(formData);
    } else {
      res = await updateMenuItem(menuItem.id, JSON.stringify(validTranslations), formData);
    }

    setLoading(false);

    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (isNew) {
        router.push('/admin/menus');
      }
    } else {
      alert(res.error || 'Bir hata oluştu.');
    }
  };

  const handleDelete = async () => {
    if (!menuItem || isNew) return;
    if (!confirm('Bu menü elemanını pasifleştirmek istediğinize emin misiniz?')) return;
    await deleteMenuItem(menuItem.id);
    router.push('/admin/menus');
  };

  const getLinkTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'CUSTOM_URL': LinkIcon,
      'EXTERNAL_URL': ExternalLink,
      'CMS_PAGE': FileText,
      'SERVICE_CATEGORY': Layers,
      'SERVICE_DETAIL': Layers,
      'BLOG_CATEGORY': Tag,
      'BLOG_DETAIL': BookOpen,
      'LANDING_PAGE': Layout
    };
    const Icon = icons[type] || LinkIcon;
    return <Icon size={14} />;
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/menus" 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">
              {isNew ? 'Yeni Menü Sayfası Ekle' : 'Menü Sayfasını Düzenle'}
            </h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              Sayfa & İçerik Yönetimi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold animate-pulse">
              <Check size={14} /> Kaydedildi
            </span>
          )}

          {!isNew && (
            <button
              onClick={handleDelete}
              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Pasifleştir"
            >
              <Trash2 size={16} />
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] disabled:bg-gray-400 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</>
            ) : (
              <><Save size={14} /> Değişiklikleri Kaydet</>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          
          {/* ── SOL PANEL (4 kolon) ── */}
          <div className="col-span-12 lg:col-span-4 space-y-5">

            {/* Yapılandırma Kartı */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-[var(--color-rose-500)]/5 to-transparent">
                <h3 className="text-[11px] font-bold text-[var(--color-rose-600)] uppercase tracking-wider flex items-center gap-1.5">
                  <Settings size={13} /> Yapılandırma
                </h3>
              </div>

              <div className="p-5 space-y-4">
                {/* Bağlantı Türü */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bağlantı Türü</label>
                  <select 
                    value={linkType} 
                    onChange={(e) => setLinkType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20 focus:border-[var(--color-rose-500)]"
                  >
                    <option value="CUSTOM_URL">Manuel / Özel URL</option>
                    <option value="EXTERNAL_URL">Dış Bağlantı (Harici)</option>
                    <option value="CMS_PAGE">CMS Sayfası</option>
                    <option value="SERVICE_CATEGORY">Hizmet Kategorisi</option>
                    <option value="SERVICE_DETAIL">Hizmet Detayı</option>
                    <option value="BLOG_CATEGORY">Blog Kategorisi</option>
                    <option value="BLOG_DETAIL">Blog Yazısı</option>
                    <option value="LANDING_PAGE">SEO Landing Page</option>
                  </select>
                </div>

                {/* Dinamik İçerik Seçiciler */}
                {linkType === 'CMS_PAGE' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bağlanacak Sayfa</label>
                    <select required value={pageId} onChange={(e) => setPageId(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20">
                      <option value="">Sayfa Seçin...</option>
                      {pages.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                    </select>
                  </div>
                )}
                {linkType === 'SERVICE_CATEGORY' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hizmet Kategorisi</label>
                    <select required value={serviceCategoryId} onChange={(e) => setServiceCategoryId(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20">
                      <option value="">Kategori Seçin...</option>
                      {serviceCategories.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                    </select>
                  </div>
                )}
                {linkType === 'SERVICE_DETAIL' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hizmet</label>
                    <select required value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20">
                      <option value="">Hizmet Seçin...</option>
                      {services.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                    </select>
                  </div>
                )}
                {linkType === 'BLOG_CATEGORY' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Blog Kategorisi</label>
                    <select required value={blogCategoryId} onChange={(e) => setBlogCategoryId(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20">
                      <option value="">Kategori Seçin...</option>
                      {blogCategories.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                    </select>
                  </div>
                )}
                {linkType === 'BLOG_DETAIL' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Blog Yazısı</label>
                    <select required value={blogPostId} onChange={(e) => setBlogPostId(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20">
                      <option value="">Yazı Seçin...</option>
                      {blogPosts.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                    </select>
                  </div>
                )}
                {linkType === 'LANDING_PAGE' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Landing Page</label>
                    <select required value={landingPageId} onChange={(e) => setLandingPageId(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20">
                      <option value="">Sayfa Seçin...</option>
                      {landingPages.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                    </select>
                  </div>
                )}

                {/* Menü Kategorisi */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Menü Grubu</label>
                  <select 
                    value={menuType} 
                    onChange={(e) => setMenuType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20"
                  >
                    <option value="HEADER">Üst Menü (Header)</option>
                    <option value="FOOTER">Alt Menü (Footer)</option>
                    <option value="LEGAL_FOOTER">Yasal Footer</option>
                  </select>
                </div>

                {/* Sıralama */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sıralama</label>
                  <input 
                    type="number" 
                    value={order} 
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)} 
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20"
                  />
                </div>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              {/* Header Menü */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Header Menü</span>
                <button 
                  type="button"
                  onClick={() => {
                    if (menuType !== 'HEADER') setMenuType('HEADER');
                  }}
                  className="cursor-pointer"
                >
                  {menuType === 'HEADER' ? (
                    <ToggleRight size={28} className="text-[var(--color-rose-500)]" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-300" />
                  )}
                </button>
              </div>

              {/* Footer Menü */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Footer Menü</span>
                <button 
                  type="button"
                  onClick={() => {
                    if (menuType !== 'FOOTER') setMenuType('FOOTER');
                  }}
                  className="cursor-pointer"
                >
                  {menuType === 'FOOTER' ? (
                    <ToggleRight size={28} className="text-[var(--color-rose-500)]" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-300" />
                  )}
                </button>
              </div>

              {/* Durum */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                  {isActive ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-200">YAYINDA (AKTİF)</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-full text-[10px] font-bold border border-red-200">PASİF</span>
                  )}
                </span>
                <button 
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className="cursor-pointer"
                >
                  {isActive ? (
                    <ToggleRight size={28} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* SEO Durum Kartı */}
            {seoStatus && seoStatus !== 'MISSING_TRANSLATION' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-transparent">
                  <h3 className="text-[11px] font-bold text-[var(--color-rose-600)] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={13} /> SEO Durumu ({activeLang})
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-3 text-[11px] font-semibold">
                  <div className={`flex items-center gap-1.5 ${seoStatus.title ? 'text-emerald-600' : 'text-red-500'}`}>
                    {seoStatus.title ? <Check size={12}/> : <X size={12}/>} SEO Title
                  </div>
                  <div className={`flex items-center gap-1.5 ${seoStatus.desc ? 'text-emerald-600' : 'text-red-500'}`}>
                    {seoStatus.desc ? <Check size={12}/> : <X size={12}/>} SEO Description
                  </div>
                  <div className={`flex items-center gap-1.5 ${seoStatus.canonical ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {seoStatus.canonical ? <Check size={12}/> : <X size={12}/>} Canonical URL
                  </div>
                  <div className={`flex items-center gap-1.5 ${seoStatus.ogImage ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {seoStatus.ogImage ? <Check size={12}/> : <X size={12}/>} OG Image
                  </div>
                  <div className={`flex items-center gap-1.5 ${seoStatus.index ? 'text-emerald-600' : 'text-red-500'}`}>
                    {seoStatus.index ? <Check size={12}/> : <X size={12}/>} Index
                  </div>
                  <div className={`flex items-center gap-1.5 ${seoStatus.sitemap ? 'text-emerald-600' : 'text-red-500'}`}>
                    {seoStatus.sitemap ? <Check size={12}/> : <X size={12}/>} Sitemap
                  </div>
                </div>
              </div>
            )}

            {seoStatus === 'MISSING_TRANSLATION' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 font-bold flex items-start gap-2">
                <X size={14} className="shrink-0 mt-0.5" /> Bu içeriğin {activeLang} dilinde çevirisi eksik! Önce ilgili sayfaya gidip {activeLang} çevirisini ekleyin.
              </div>
            )}
          </div>

          {/* ── SAĞ PANEL (8 kolon) ── */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            
            {/* Dil Sekmeleri */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(['TR', 'EN', 'DE', 'RU'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLangChange(lang)}
                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
                      activeLang === lang 
                        ? 'text-[var(--color-rose-500)] bg-[var(--color-rose-500)]/5' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {lang === 'TR' ? 'TÜRKÇE' : lang === 'EN' ? 'ENGLISH' : lang === 'DE' ? 'DEUTSCH' : 'РУССКИЙ'}
                    {activeLang === lang && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-rose-500)]"></div>}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-5">
                {/* Başlık Alanları */}
                <div className="border-b border-gray-100 pb-5">
                  <h4 className="text-[11px] font-bold text-[var(--color-rose-600)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <FileText size={13} /> Sayfa Başlıkları ({activeLang})
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sayfa Başlığı (Menü)</label>
                      <input
                        type="text"
                        value={titles[activeLang] || ''}
                        onChange={(e) => setTitles({ ...titles, [activeLang]: e.target.value })}
                        placeholder="Menüde görünecek başlık"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20 focus:border-[var(--color-rose-500)] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hedef</label>
                      <select 
                        value={target} 
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20"
                      >
                        <option value="_self">Aynı Sekme (_self)</option>
                        <option value="_blank">Yeni Sekme (_blank)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* URL Alanı */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {linkType === 'CUSTOM_URL' || linkType === 'EXTERNAL_URL' ? 'Hedef URL' : 'Otomatik Üretilen URL'}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {getLinkTypeIcon(linkType)}
                      </span>
                      <input
                        type="text"
                        value={urls[activeLang] || ''}
                        readOnly={linkType !== 'CUSTOM_URL' && linkType !== 'EXTERNAL_URL'}
                        onChange={(e) => setUrls({ ...urls, [activeLang]: e.target.value })}
                        placeholder="/ornek-url veya https://..."
                        className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-500)]/20 ${
                          linkType === 'CUSTOM_URL' || linkType === 'EXTERNAL_URL'
                            ? 'bg-white border-gray-200 text-gray-800'
                            : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    {urls[activeLang] && (
                      <a
                        href={urls[activeLang] || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="URL'yi Önizle"
                      >
                        <Eye size={14} />
                      </a>
                    )}
                  </div>
                  {linkType !== 'CUSTOM_URL' && linkType !== 'EXTERNAL_URL' && (
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Bu URL, bağlı içeriğin <strong>{activeLang}</strong> çevirisindeki slug'dan otomatik üretilir.
                    </p>
                  )}
                </div>

                {/* Dış Bağlantı Toggle */}
                <div className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox"
                    id="isExternal"
                    checked={isExternal}
                    onChange={(e) => setIsExternal(e.target.checked)}
                    className="w-4 h-4 text-[var(--color-rose-500)] border-gray-300 rounded focus:ring-[var(--color-rose-500)]"
                  />
                  <label htmlFor="isExternal" className="text-xs font-semibold text-gray-700 cursor-pointer flex items-center gap-1.5">
                    <ExternalLink size={12} className="text-gray-400" />
                    Dış Bağlantıdır (rel=nofollow eklensin)
                  </label>
                </div>
              </div>
            </div>

            {/* SEO Arama Motoru Ayarları */}
            <div className="bg-gradient-to-br from-[var(--color-rose-500)] to-[var(--color-rose-600)] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4">
                <h3 className="text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                  <SearchIcon size={13} /> SEO & Arama Motoru Ayarları
                </h3>
              </div>
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Sayfa Meta Adresi (URL Slug)</label>
                  <input 
                    type="text" 
                    value={(urls[activeLang] || '').split('/').pop() || ''} 
                    readOnly 
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-white/45 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Arama Motoru Açıklaması (Meta Desc)</label>
                  <input 
                    type="text" 
                    value="" 
                    readOnly 
                    placeholder="Bağlı içeriğin SEO ayarlarından yönetilir"
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Google Başlığı (Meta Title)</label>
                  <input 
                    type="text" 
                    value={titles[activeLang] || ''}
                    readOnly 
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
