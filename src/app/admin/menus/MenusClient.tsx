"use client";

import { useState, useEffect } from 'react';
import { createMenuItem, updateMenuItem, deleteMenuItem } from '@/app/actions/menu';
import { Plus, Edit2, Trash2, Globe, List, Check, X, Link as LinkIcon, ExternalLink, Settings, Eye } from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  id: string;
  menuType: 'HEADER' | 'FOOTER' | 'LEGAL_FOOTER';
  language: 'TR' | 'EN' | 'DE' | 'RU';
  title: string;
  url: string;
  order: number;
  isActive: boolean;
  target: string;
  isExternal: boolean;
  linkType: 'CMS_PAGE' | 'SERVICE_CATEGORY' | 'SERVICE_DETAIL' | 'BLOG_CATEGORY' | 'BLOG_DETAIL' | 'LANDING_PAGE' | 'EXTERNAL_URL' | 'CUSTOM_URL';
  pageId?: string | null;
  serviceCategoryId?: string | null;
  serviceId?: string | null;
  blogCategoryId?: string | null;
  blogPostId?: string | null;
  landingPageId?: string | null;
  page?: any;
  serviceCategory?: any;
  service?: any;
  blogCategory?: any;
  blogPost?: any;
  landingPage?: any;
}

interface MenusClientProps {
  initialItems: MenuItem[];
  pages: any[];
  serviceCategories: any[];
  services: any[];
  blogCategories: any[];
  blogPosts: any[];
  landingPages: any[];
}

export default function MenusClient({ initialItems, pages, serviceCategories, services, blogCategories, blogPosts, landingPages }: MenusClientProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<'HEADER' | 'FOOTER' | 'LEGAL_FOOTER'>('HEADER');
  const [activeLang, setActiveLang] = useState<'TR' | 'EN' | 'DE' | 'RU'>('TR');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [order, setOrder] = useState(0);
  const [target, setTarget] = useState('_self');
  const [isExternal, setIsExternal] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [linkType, setLinkType] = useState<MenuItem['linkType']>('CUSTOM_URL');
  const [pageId, setPageId] = useState('');
  const [serviceCategoryId, setServiceCategoryId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [blogCategoryId, setBlogCategoryId] = useState('');
  const [blogPostId, setBlogPostId] = useState('');
  const [landingPageId, setLandingPageId] = useState('');

  // SEO Status Card Data
  const [seoStatus, setSeoStatus] = useState<any>(null);

  const filteredItems = items
    .filter((item) => item.menuType === activeTab && item.language === activeLang)
    .sort((a, b) => a.order - b.order);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setUrl('');
    setOrder(filteredItems.length);
    setTarget('_self');
    setIsExternal(false);
    setIsActive(true);
    setLinkType('CUSTOM_URL');
    setPageId('');
    setServiceCategoryId('');
    setServiceId('');
    setBlogCategoryId('');
    setBlogPostId('');
    setLandingPageId('');
    setSeoStatus(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setUrl(item.url);
    setOrder(item.order);
    setTarget(item.target || '_self');
    setIsExternal(item.isExternal);
    setIsActive(item.isActive);
    setLinkType(item.linkType || 'CUSTOM_URL');
    setPageId(item.pageId || '');
    setServiceCategoryId(item.serviceCategoryId || '');
    setServiceId(item.serviceId || '');
    setBlogCategoryId(item.blogCategoryId || '');
    setBlogPostId(item.blogPostId || '');
    setLandingPageId(item.landingPageId || '');
    setIsModalOpen(true);
  };

  // Otomatik URL ve SEO Status Güncelleme Efekti
  useEffect(() => {
    if (linkType === 'CUSTOM_URL' || linkType === 'EXTERNAL_URL') {
      setSeoStatus(null);
      if (!editingItem && linkType === 'EXTERNAL_URL') {
        setIsExternal(true);
        setTarget('_blank');
      }
      return;
    }

    let generatedUrl = '';
    let selectedItem: any = null;
    let selectedTranslation: any = null;

    const basePrefix = `/${activeLang.toLowerCase()}`;
    const servicesPrefix = activeLang === 'TR' ? '/hizmetler' : activeLang === 'DE' ? '/dienstleistungen' : activeLang === 'RU' ? '/uslugi' : '/services';

    if (linkType === 'CMS_PAGE' && pageId) {
      selectedItem = pages.find(p => p.id === pageId);
      selectedTranslation = selectedItem?.translations?.find((t:any) => t.language === activeLang);
      if (selectedTranslation?.slug) generatedUrl = `${basePrefix}/${selectedTranslation.slug}`;
    } else if (linkType === 'SERVICE_CATEGORY' && serviceCategoryId) {
      selectedItem = serviceCategories.find(c => c.id === serviceCategoryId);
      selectedTranslation = selectedItem?.translations?.find((t:any) => t.language === activeLang);
      if (selectedTranslation?.slug) generatedUrl = `${basePrefix}${servicesPrefix}/${selectedTranslation.slug}`;
    } else if (linkType === 'SERVICE_DETAIL' && serviceId) {
      selectedItem = services.find(s => s.id === serviceId);
      selectedTranslation = selectedItem?.translations?.find((t:any) => t.language === activeLang);
      // Not: Kategori slug'ı da girmesi idealdir ancak şimdilik basitçe service slug
      if (selectedTranslation?.slug) {
         const cat = serviceCategories.find(c => c.id === selectedItem.categoryId);
         const catT = cat?.translations?.find((t:any) => t.language === activeLang);
         const cSlug = catT?.slug || 'kategori';
         generatedUrl = `${basePrefix}${servicesPrefix}/${cSlug}/${selectedTranslation.slug}`;
      }
    } else if (linkType === 'BLOG_CATEGORY' && blogCategoryId) {
      selectedItem = blogCategories.find(c => c.id === blogCategoryId);
      selectedTranslation = selectedItem?.translations?.find((t:any) => t.language === activeLang);
      if (selectedTranslation?.slug) generatedUrl = `${basePrefix}/blog/${selectedTranslation.slug}`;
    } else if (linkType === 'BLOG_DETAIL' && blogPostId) {
      selectedItem = blogPosts.find(p => p.id === blogPostId);
      selectedTranslation = selectedItem?.translations?.find((t:any) => t.language === activeLang);
      if (selectedTranslation?.slug) generatedUrl = `${basePrefix}/blog/${selectedTranslation.slug}`;
    } else if (linkType === 'LANDING_PAGE' && landingPageId) {
      selectedItem = landingPages.find(l => l.id === landingPageId);
      selectedTranslation = selectedItem?.translations?.find((t:any) => t.language === activeLang);
      if (selectedTranslation?.slug) generatedUrl = `${basePrefix}/${selectedTranslation.slug}`;
    }

    if (generatedUrl) {
      setUrl(generatedUrl);
      setIsExternal(false);
    }

    if (selectedTranslation) {
      setSeoStatus({
        title: !!selectedTranslation.seoTitle,
        desc: !!selectedTranslation.seoDesc,
        canonical: !!selectedTranslation.canonical,
        ogImage: !!selectedTranslation.ogImage,
        index: selectedTranslation.index !== false,
        sitemap: selectedTranslation.sitemap !== false
      });
    } else if (selectedItem) {
       // Çeviri eksik
       setSeoStatus('MISSING_TRANSLATION');
    } else {
       setSeoStatus(null);
    }

  }, [linkType, pageId, serviceCategoryId, serviceId, blogCategoryId, blogPostId, landingPageId, activeLang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('menuType', activeTab);
    formData.append('language', activeLang);
    formData.append('title', title);
    formData.append('url', url);
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

    let res;
    if (editingItem) {
      res = await updateMenuItem(editingItem.id, formData);
    } else {
      res = await createMenuItem(formData);
    }

    setLoading(false);
    if (res.success && res.data) {
      // Data format in client
      const savedItem = { ...res.data };
      if (editingItem) {
        setItems(items.map((i) => (i.id === editingItem.id ? savedItem as any : i)));
      } else {
        setItems([...items, savedItem as any]);
      }
      setIsModalOpen(false);
    } else {
      alert(res.error || 'Bir hata oluştu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu menü elemanını pasifleştirmek (silmek) istediğinize emin misiniz?')) return;
    const res = await deleteMenuItem(id);
    if (res.success) {
      setItems(items.map((i) => (i.id === id ? { ...i, isActive: false } : i)));
    } else {
      alert(res.error || 'İşlem gerçekleştirilemedi.');
    }
  };

  // Helper to resolve admin link for connected content
  const getAdminEditLink = (item: MenuItem) => {
    if (item.linkType === 'CMS_PAGE' && item.pageId) return `/admin/pages`;
    if (item.linkType === 'SERVICE_CATEGORY') return `/admin/services`;
    if (item.linkType === 'SERVICE_DETAIL') return `/admin/services`;
    if (item.linkType === 'BLOG_CATEGORY') return `/admin/blog/categories`;
    if (item.linkType === 'BLOG_DETAIL') return `/admin/blog`;
    if (item.linkType === 'LANDING_PAGE') return `/admin/landing-pages`;
    return null;
  };

  const getTranslationName = (translations: any[]) => {
    if (!translations || translations.length === 0) return 'Adsız (Çeviri Yok)';
    const t = translations.find((x:any) => x.language === activeLang);
    return t ? (t.title || t.name) : (translations[0].title || translations[0].name) + ' (Eksik Dil)';
  };

  return (
    <div className="space-y-6">
      {/* TİP VE DİL FİLTRELERİ */}
      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 shrink-0">
          {(['HEADER', 'FOOTER', 'LEGAL_FOOTER'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === type ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {type === 'HEADER' ? 'Header (Üst Menü)' : type === 'FOOTER' ? 'Footer (Alt Menü)' : 'Legal Footer'}
            </button>
          ))}
        </div>

        <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 shrink-0">
          {(['TR', 'EN', 'DE', 'RU'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeLang === lang ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Globe size={12} />
              {lang}
            </button>
          ))}
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
        >
          <Plus size={16} /> Link Ekle
        </button>
      </div>

      {/* MENÜ LİSTESİ */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 pl-6 font-medium">Sıra</th>
              <th className="p-4 font-medium">Başlık</th>
              <th className="p-4 font-medium">Bağlantı Türü</th>
              <th className="p-4 font-medium">URL</th>
              <th className="p-4 font-medium">Durum</th>
              <th className="p-4 font-medium text-right pr-6">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400 text-xs font-semibold">
                  Bu menü tipinde ve dilde henüz hiç link bulunmuyor.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr 
                  key={item.id} 
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm ${
                    !item.isActive ? 'opacity-50 bg-gray-50/30' : ''
                  }`}
                >
                  <td className="p-4 pl-6 font-bold text-gray-500">#{item.order}</td>
                  <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                    {item.title}
                    {item.isExternal && <ExternalLink size={12} className="text-gray-400" />}
                  </td>
                  <td className="p-4 text-xs font-semibold text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded-md">{item.linkType}</span>
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-500 truncate max-w-[200px]" title={item.url}>
                    {item.url}
                  </td>
                  <td className="p-4">
                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                        <Check size={14} /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-500 font-bold">
                        <X size={14} /> Pasif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right pr-6 flex justify-end gap-2">
                    {/* HIZLI İŞLEMLER */}
                    {item.isActive && (
                      <>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl cursor-pointer transition-colors" title="Public URL Aç">
                          <Eye size={14} />
                        </a>
                        {getAdminEditLink(item) && (
                          <Link href={getAdminEditLink(item)!} className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl cursor-pointer transition-colors" title="Bağlı Sayfa / SEO Ayarlarını Düzenle">
                            <Settings size={14} />
                          </Link>
                        )}
                      </>
                    )}
                    <button onClick={() => openEditModal(item)} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl cursor-pointer transition-colors" title="Menüyü Düzenle">
                      <Edit2 size={14} />
                    </button>
                    {item.isActive && (
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer transition-colors" title="Sil (Pasifleştir)">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DÜZENLEME & EKLEME MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer">
              <X size={18} />
            </button>

            <h3 className="font-serif font-bold text-gray-950 text-xl mb-6">
              {editingItem ? 'Menü Elemanını Düzenle' : 'Yeni Menü Elemanı Ekle'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sol Kolon */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Başlık (Menüde Görünen Metin)</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`örn: ${activeLang === 'TR' ? 'Hizmetlerimiz' : 'Services'}`} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bağlantı Türü (Link Type)</label>
                    <select value={linkType} onChange={(e) => setLinkType(e.target.value as any)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--color-primary-500)] text-xs font-semibold">
                      <option value="CUSTOM_URL">Manuel / Özel URL</option>
                      <option value="EXTERNAL_URL">Dış Bağlantı (Harici Web Sitesi)</option>
                      <option value="CMS_PAGE">CMS Sayfası (KVKK, Hakkımızda vb.)</option>
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
                      <select required value={pageId} onChange={(e) => setPageId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-xs">
                        <option value="">Sayfa Seçiniz...</option>
                        {pages.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                      </select>
                    </div>
                  )}

                  {linkType === 'SERVICE_CATEGORY' && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bağlanacak Kategori</label>
                      <select required value={serviceCategoryId} onChange={(e) => setServiceCategoryId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-xs">
                        <option value="">Kategori Seçiniz...</option>
                        {serviceCategories.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                      </select>
                    </div>
                  )}

                  {linkType === 'SERVICE_DETAIL' && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bağlanacak Hizmet</label>
                      <select required value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-xs">
                        <option value="">Hizmet Seçiniz...</option>
                        {services.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                      </select>
                    </div>
                  )}

                  {linkType === 'BLOG_CATEGORY' && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Blog Kategorisi</label>
                      <select required value={blogCategoryId} onChange={(e) => setBlogCategoryId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-xs">
                        <option value="">Blog Kategorisi Seçiniz...</option>
                        {blogCategories.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                      </select>
                    </div>
                  )}

                  {linkType === 'BLOG_DETAIL' && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Blog Yazısı</label>
                      <select required value={blogPostId} onChange={(e) => setBlogPostId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-xs">
                        <option value="">Blog Yazısı Seçiniz...</option>
                        {blogPosts.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                      </select>
                    </div>
                  )}

                  {linkType === 'LANDING_PAGE' && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Landing Page</label>
                      <select required value={landingPageId} onChange={(e) => setLandingPageId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-xs">
                        <option value="">Açılış Sayfası Seçiniz...</option>
                        {landingPages.map(p => <option key={p.id} value={p.id}>{getTranslationName(p.translations)}</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Üretilen / Hedef URL</label>
                    <input type="text" required value={url} readOnly={linkType !== 'CUSTOM_URL' && linkType !== 'EXTERNAL_URL'} onChange={(e) => setUrl(e.target.value)} className={`w-full px-4 py-3 border rounded-2xl text-xs font-mono ${linkType === 'CUSTOM_URL' || linkType === 'EXTERNAL_URL' ? 'bg-white border-gray-300 focus:border-[var(--color-primary-500)]' : 'bg-gray-100 border-transparent text-gray-500 cursor-not-allowed'}`} placeholder="/ornek-url" />
                    {linkType !== 'CUSTOM_URL' && linkType !== 'EXTERNAL_URL' && (
                      <p className="text-[10px] text-gray-400 mt-1">Bu URL bağlı içeriğin {activeLang} çevirisinden otomatik üretilir.</p>
                    )}
                  </div>
                </div>

                {/* Sağ Kolon (Ayarlar ve SEO Durumu) */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sıra</label>
                      <input type="number" required value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hedef</label>
                      <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs">
                        <option value="_self">Aynı Sekme (_self)</option>
                        <option value="_blank">Yeni Sekme (_blank)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded text-[var(--color-primary-500)]" />
                      <span className="text-xs font-semibold text-gray-700">Menü Aktif (Yayında)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isExternal} onChange={(e) => setIsExternal(e.target.checked)} className="rounded text-[var(--color-primary-500)]" />
                      <span className="text-xs font-semibold text-gray-700">Dış Bağlantıdır (Nofollow eklenebilir)</span>
                    </label>
                  </div>

                  {/* SEO DURUM KARTI */}
                  {linkType !== 'CUSTOM_URL' && linkType !== 'EXTERNAL_URL' && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                      <h4 className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <Globe size={14} /> Bağlı İçeriğin SEO Durumu ({activeLang})
                      </h4>
                      {seoStatus === 'MISSING_TRANSLATION' ? (
                        <div className="text-xs text-red-600 font-bold flex items-center gap-2">
                          <X size={16} /> Bu içeriğin {activeLang} çevirisi eksik! URL üretilemiyor. Önce içeriğe {activeLang} dilini ekleyin.
                        </div>
                      ) : seoStatus ? (
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-gray-600">
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
                            {seoStatus.index ? <Check size={12}/> : <X size={12}/>} Index (Arama M.)
                          </div>
                          <div className={`flex items-center gap-1.5 ${seoStatus.sitemap ? 'text-emerald-600' : 'text-red-500'}`}>
                            {seoStatus.sitemap ? <Check size={12}/> : <X size={12}/>} Sitemap
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">Lütfen bağlanacak içeriği seçin.</div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-gray-950 hover:bg-black disabled:bg-gray-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md mt-4">
                {loading ? 'KAYDEDİLİYOR...' : 'MENÜYÜ KAYDET'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
