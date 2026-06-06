/**
 * PAGE TITLES + MULTILANGUAGE ROUTING COMPLETION
 * Tüm PageTranslation slug/title + MenuItemTranslation title/url güncelleme betiği
 * 
 * GÜNCELLEME KURALLARI:
 * - Page ID değiştirilmez
 * - İçerik silinmez
 * - Mevcut SEO title/desc korunur, sadece eksikler doldurulur
 * - Hizmet/kategori/blog detay sayfalarına dokunulmaz
 */

// Supabase REST API ayarları
const SUPABASE_URL = 'https://rzwagnztdyrvjrzbrlxb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_A00wkMwkGfZRdg5FWYiOvQ_2x8kHcWd';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

// ─────────────────────────────────────────────────
// 1. PAGE TRANSLATION GÜNCELLEMELERI
// ─────────────────────────────────────────────────

// Page ID Mapping (veritabanından alınan gerçek ID'ler)
const PAGE_IDS = {
  HOME:       '876a67e6-f7fa-4413-8fa9-c4a7599a31a1',
  SERVICES:   '8291fe02-4d02-4de0-82ad-0b8200a0e8d7',
  GALLERY:    'b8efcf0a-74fd-460c-8396-28344be12af4',
  BLOG:       'f8dfcf20-d250-45f4-8f9d-6df6c04f0cc3',
  CONTACT:    '2bd58b03-309a-4fbf-8c5a-80cf16b34f6e',
  BOOKING:    '75bfc57c-a065-4445-83d5-f3bbb1daf4ac',
  ABOUT:      'b3a2bf6c-8ab1-4df7-8193-f7dfd0821b53',
  PRIVACY:    '85aa2ded-efef-44e0-8ba3-4060714f3a8f',
  TERMS:      '293bec57-2c91-40d0-bf82-3506f57897df',
  KVKK:       '5bc17771-35d0-4a21-b0be-f921323b4a11',
  COOKIE:     '22511b82-73cc-4a82-aea8-d03d9ae5de50',
  PORTFOLIO:  'aec5fb9b-8842-42c2-ab09-91d7b5b7f116',
};

// Hedef slug ve title değerleri (kullanıcının belirttiği native çeviriler)
const PAGE_UPDATES: Record<string, Record<string, { title: string; slug: string; seoTitle?: string; seoDesc?: string }>> = {
  [PAGE_IDS.HOME]: {
    TR: { title: 'Ana Sayfa', slug: '/' },
    EN: { title: 'Home', slug: '/' },
    DE: { title: 'Startseite', slug: '/' },
    RU: { title: 'Главная', slug: '/' },
  },
  [PAGE_IDS.SERVICES]: {
    TR: { title: 'Hizmetlerimiz', slug: 'hizmetlerimiz', seoTitle: 'Hizmetlerimiz | Nails & Lashes Studio Antalya', seoDesc: 'Protez tırnak, kalıcı oje, ipek kirpik, kirpik lifting ve daha fazlası. Antalya\'nın en profesyonel güzellik stüdyosunda hizmetlerimizi keşfedin.' },
    EN: { title: 'Services', slug: 'services', seoTitle: 'Services | Nails & Lashes Studio Antalya', seoDesc: 'Acrylic nails, gel polish, silk eyelashes, lash lifting and more. Discover our services at Antalya\'s most professional beauty studio.' },
    DE: { title: 'Dienstleistungen', slug: 'dienstleistungen', seoTitle: 'Dienstleistungen | Nails & Lashes Studio Antalya', seoDesc: 'Acrylnägel, Gel-Lack, Seiden-Wimpern, Wimpernlifting und mehr. Entdecken Sie unsere Dienstleistungen im professionellsten Schönheitsstudio Antalyas.' },
    RU: { title: 'Услуги', slug: 'uslugi', seoTitle: 'Услуги | Nails & Lashes Studio Анталья', seoDesc: 'Наращивание ногтей, гель-лак, шёлковые ресницы, ламинирование ресниц и многое другое. Откройте для себя наши услуги в самой профессиональной студии красоты Антальи.' },
  },
  [PAGE_IDS.GALLERY]: {
    TR: { title: 'Galeri', slug: 'galeri', seoTitle: 'Galeri | Nails & Lashes Studio Antalya', seoDesc: 'Tırnak sanatı, protez tırnak, kirpik ve kaş uygulamalarımızın gerçek fotoğraflarını inceleyin.' },
    EN: { title: 'Gallery', slug: 'gallery', seoTitle: 'Gallery | Nails & Lashes Studio Antalya', seoDesc: 'Explore real photos of our nail art, acrylic nails, eyelash and brow treatments.' },
    DE: { title: 'Galerie', slug: 'galerie', seoTitle: 'Galerie | Nails & Lashes Studio Antalya', seoDesc: 'Entdecken Sie echte Fotos unserer Nail Art, Acrylnägel, Wimpern- und Augenbrauen-Behandlungen.' },
    RU: { title: 'Галерея', slug: 'galereya', seoTitle: 'Галерея | Nails & Lashes Studio Анталья', seoDesc: 'Ознакомьтесь с реальными фотографиями наших работ — нейл-арт, наращивание ногтей, ресницы и брови.' },
  },
  [PAGE_IDS.BLOG]: {
    TR: { title: 'Blog', slug: 'blog' },
    EN: { title: 'Blog', slug: 'blog' },
    DE: { title: 'Blog', slug: 'blog' },
    RU: { title: 'Блог', slug: 'blog' },
  },
  [PAGE_IDS.CONTACT]: {
    TR: { title: 'İletişim', slug: 'iletisim', seoTitle: 'İletişim | Nails & Lashes Studio Antalya', seoDesc: 'Şubelerimizin adres, telefon ve çalışma saatleri. Bize mesaj gönderin veya haritadan konum bulun.' },
    EN: { title: 'Contact', slug: 'contact', seoTitle: 'Contact | Nails & Lashes Studio Antalya', seoDesc: 'Our branch addresses, phone numbers and working hours. Send us a message or find us on the map.' },
    DE: { title: 'Kontakt', slug: 'kontakt', seoTitle: 'Kontakt | Nails & Lashes Studio Antalya', seoDesc: 'Filialadressen, Telefonnummern und Öffnungszeiten. Senden Sie uns eine Nachricht oder finden Sie uns auf der Karte.' },
    RU: { title: 'Контакты', slug: 'kontakty', seoTitle: 'Контакты | Nails & Lashes Studio Анталья', seoDesc: 'Адреса филиалов, номера телефонов и часы работы. Отправьте нам сообщение или найдите нас на карте.' },
  },
  [PAGE_IDS.BOOKING]: {
    TR: { title: 'Randevu Al', slug: 'randevu-al', seoTitle: 'Online Randevu Al | Nails & Lashes Studio', seoDesc: 'Şube, hizmet ve uzman seçerek online randevunuzu kolayca oluşturun.' },
    EN: { title: 'Book Appointment', slug: 'book-appointment', seoTitle: 'Book Appointment | Nails & Lashes Studio', seoDesc: 'Easily book your appointment online by selecting your branch, service, and specialist.' },
    DE: { title: 'Termin buchen', slug: 'termin-buchen', seoTitle: 'Termin buchen | Nails & Lashes Studio', seoDesc: 'Buchen Sie ganz einfach online Ihren Termin, indem Sie Filiale, Dienstleistung und Spezialist auswählen.' },
    RU: { title: 'Записаться', slug: 'zapisatsya', seoTitle: 'Записаться на приём | Nails & Lashes Studio', seoDesc: 'Легко запишитесь онлайн, выбрав филиал, услугу и специалиста.' },
  },
  [PAGE_IDS.ABOUT]: {
    TR: { title: 'Hakkımızda', slug: 'hakkimizda', seoTitle: 'Hakkımızda | Nails & Lashes Studio', seoDesc: 'Nails & Lashes Studio hakkında detaylı bilgi. Misyonumuz, vizyonumuz ve ekibimiz.' },
    EN: { title: 'About Us', slug: 'about-us', seoTitle: 'About Us | Nails & Lashes Studio', seoDesc: 'Learn more about Nails & Lashes Studio. Our mission, vision and team.' },
    DE: { title: 'Über uns', slug: 'ueber-uns', seoTitle: 'Über uns | Nails & Lashes Studio', seoDesc: 'Erfahren Sie mehr über Nails & Lashes Studio. Unsere Mission, Vision und unser Team.' },
    RU: { title: 'О нас', slug: 'o-nas', seoTitle: 'О нас | Nails & Lashes Studio', seoDesc: 'Узнайте больше о Nails & Lashes Studio. Наша миссия, видение и команда.' },
  },
  [PAGE_IDS.PRIVACY]: {
    TR: { title: 'Gizlilik Sözleşmesi', slug: 'gizlilik-sozlesmesi', seoTitle: 'Gizlilik Sözleşmesi | Nails & Lashes Studio' },
    EN: { title: 'Privacy Policy', slug: 'privacy-policy', seoTitle: 'Privacy Policy | Nails & Lashes Studio' },
    DE: { title: 'Datenschutzerklärung', slug: 'datenschutzerklaerung', seoTitle: 'Datenschutzerklärung | Nails & Lashes Studio' },
    RU: { title: 'Политика конфиденциальности', slug: 'politika-konfidentsialnosti', seoTitle: 'Политика конфиденциальности | Nails & Lashes Studio' },
  },
  [PAGE_IDS.TERMS]: {
    TR: { title: 'Kullanım Koşulları', slug: 'kullanim-kosullari', seoTitle: 'Kullanım Koşulları | Nails & Lashes Studio' },
    EN: { title: 'Terms & Conditions', slug: 'terms-and-conditions', seoTitle: 'Terms & Conditions | Nails & Lashes Studio' },
    DE: { title: 'Allgemeine Geschäftsbedingungen', slug: 'allgemeine-geschaeftsbedingungen', seoTitle: 'AGB | Nails & Lashes Studio' },
    RU: { title: 'Условия использования', slug: 'usloviya-ispolzovaniya', seoTitle: 'Условия использования | Nails & Lashes Studio' },
  },
  [PAGE_IDS.KVKK]: {
    TR: { title: 'KVKK Aydınlatma Metni', slug: 'kvkk-aydinlatma-metni', seoTitle: 'KVKK Aydınlatma Metni | Nails & Lashes Studio' },
    EN: { title: 'Personal Data Protection Notice', slug: 'personal-data-protection-notice', seoTitle: 'Data Protection Notice | Nails & Lashes Studio' },
    DE: { title: 'Datenschutzhinweis', slug: 'datenschutzhinweis', seoTitle: 'Datenschutzhinweis | Nails & Lashes Studio' },
    RU: { title: 'Уведомление о защите персональных данных', slug: 'uvedomlenie-o-zashchite-personalnykh-dannykh', seoTitle: 'Уведомление о защите данных | Nails & Lashes Studio' },
  },
  [PAGE_IDS.COOKIE]: {
    TR: { title: 'Çerez Politikası', slug: 'cerez-politikasi' },
    EN: { title: 'Cookie Policy', slug: 'cookie-policy' },
    DE: { title: 'Cookie-Richtlinie', slug: 'cookie-richtlinie' },
    RU: { title: 'Политика cookie', slug: 'politika-cookie' },
  },
  [PAGE_IDS.PORTFOLIO]: {
    TR: { title: 'Portfolyo', slug: 'portfolyo', seoTitle: 'Portfolyo | Nails & Lashes Studio', seoDesc: 'Stüdyomuzda gerçekleştirdiğimiz işlemlerin öncesi ve sonrası fotoğraflarını inceleyin.' },
    EN: { title: 'Portfolio', slug: 'portfolio', seoTitle: 'Portfolio | Nails & Lashes Studio', seoDesc: 'Browse before and after photos of our beauty treatments.' },
    DE: { title: 'Portfolio', slug: 'portfolio', seoTitle: 'Portfolio | Nails & Lashes Studio', seoDesc: 'Durchsuchen Sie Vorher-Nachher-Fotos unserer Schönheitsbehandlungen.' },
    RU: { title: 'Портфолио', slug: 'portfolio', seoTitle: 'Портфолио | Nails & Lashes Studio', seoDesc: 'Просмотрите фотографии до и после наших косметических процедур.' },
  },
};

// pageGroup güncellemeleri (boş olanları dolduracağız)
const PAGE_GROUP_UPDATES: Record<string, string> = {
  [PAGE_IDS.HOME]:      'SYSTEM',
  [PAGE_IDS.SERVICES]:  'SERVICES',
  [PAGE_IDS.GALLERY]:   'GALLERY',
  [PAGE_IDS.BLOG]:      'BLOG',
  [PAGE_IDS.CONTACT]:   'CONTACT',
  [PAGE_IDS.BOOKING]:   'BOOKING',
  [PAGE_IDS.ABOUT]:     'ABOUT',
  [PAGE_IDS.PRIVACY]:   'LEGAL',
  [PAGE_IDS.TERMS]:     'LEGAL',
  [PAGE_IDS.KVKK]:      'LEGAL',
  [PAGE_IDS.COOKIE]:    'LEGAL',
  [PAGE_IDS.PORTFOLIO]: 'PORTFOLIO',
};

// ─────────────────────────────────────────────────
// 2. MENU ITEM TRANSLATION GÜNCELLEMELERI
// ─────────────────────────────────────────────────

// Menü URL'leri: Her dil kendi slug'ını kullanacak (locale prefix layout'ta ekleniyor)
// URL alanı veritabanında /${slug} formatında saklanır

// MenuItemTranslation güncellemeleri
// Anahtar: menuItemId
const MENU_UPDATES: Record<string, Record<string, { title: string; url: string }>> = {
  // Ana Sayfa (Header)
  '433149a9-776a-488b-b15f-788c1ca3df4d': {
    TR: { title: 'Ana Sayfa', url: '/' },
    EN: { title: 'Home', url: '/' },
    DE: { title: 'Startseite', url: '/' },
    RU: { title: 'Главная', url: '/' },
  },
  // Hizmetlerimiz (Header) - 16b3017a
  '16b3017a-ea0a-43ad-b9f7-b28ef718956b': {
    TR: { title: 'Hizmetlerimiz', url: '/hizmetlerimiz' },
    EN: { title: 'Services', url: '/services' },
    DE: { title: 'Dienstleistungen', url: '/dienstleistungen' },
    RU: { title: 'Услуги', url: '/uslugi' },
  },
  // Galeri (Header) - 4b7c0acc
  '4b7c0acc-708f-4c5b-ae57-7e019f4b7b06': {
    TR: { title: 'Galeri', url: '/galeri' },
    EN: { title: 'Gallery', url: '/gallery' },
    DE: { title: 'Galerie', url: '/galerie' },
    RU: { title: 'Галерея', url: '/galereya' },
  },
  // Blog (Header) - 0fd5e0b6
  '0fd5e0b6-9a57-41c0-b5f7-ac346d4717a9': {
    TR: { title: 'Blog', url: '/blog' },
    EN: { title: 'Blog', url: '/blog' },
    DE: { title: 'Blog', url: '/blog' },
    RU: { title: 'Блог', url: '/blog' },
  },
  // İletişim (Header) - 19ded327
  '19ded327-4754-45a2-b02c-aaf70b3e972e': {
    TR: { title: 'İletişim', url: '/iletisim' },
    EN: { title: 'Contact', url: '/contact' },
    DE: { title: 'Kontakt', url: '/kontakt' },
    RU: { title: 'Контакты', url: '/kontakty' },
  },
  // Randevu Al (Header) - 03245073
  '03245073-bc30-448a-b7aa-d0c81d64428b': {
    TR: { title: 'Randevu Al', url: '/randevu-al' },
    EN: { title: 'Book Appointment', url: '/book-appointment' },
    DE: { title: 'Termin buchen', url: '/termin-buchen' },
    RU: { title: 'Записаться', url: '/zapisatsya' },
  },
  // Hizmetler (Footer) - db4d2add
  'db4d2add-5fc0-464c-aa0a-e8782b6bbf5e': {
    TR: { title: 'Hizmetlerimiz', url: '/hizmetlerimiz' },
    EN: { title: 'Services', url: '/services' },
    DE: { title: 'Dienstleistungen', url: '/dienstleistungen' },
    RU: { title: 'Услуги', url: '/uslugi' },
  },
  // İletişim (Footer) - 3e1d40dd
  '3e1d40dd-7071-41f7-9e85-e286ad524e5f': {
    TR: { title: 'İletişim', url: '/iletisim' },
    EN: { title: 'Contact', url: '/contact' },
    DE: { title: 'Kontakt', url: '/kontakt' },
    RU: { title: 'Контакты', url: '/kontakty' },
  },
  // Blog (Footer) - d63d2d5c
  'd63d2d5c-2a98-40fc-a35f-d6c22a118a7c': {
    TR: { title: 'Blog', url: '/blog' },
    EN: { title: 'Blog', url: '/blog' },
    DE: { title: 'Blog', url: '/blog' },
    RU: { title: 'Блог', url: '/blog' },
  },
  // Hakkımızda (Footer) - 43ebbf30
  '43ebbf30-eb70-4dce-9214-125d2aa5c6b1': {
    TR: { title: 'Hakkımızda', url: '/hakkimizda' },
    EN: { title: 'About Us', url: '/about-us' },
    DE: { title: 'Über uns', url: '/ueber-uns' },
    RU: { title: 'О нас', url: '/o-nas' },
  },
  // Portfolyo (Footer) - f0263cb3
  'f0263cb3-de21-4199-9bed-b936bdb170ca': {
    TR: { title: 'Portfolyo', url: '/portfolyo' },
    EN: { title: 'Portfolio', url: '/portfolio' },
    DE: { title: 'Portfolio', url: '/portfolio' },
    RU: { title: 'Портфолио', url: '/portfolio' },
  },
  // Randevu Al (Footer) - 0387aed3
  '0387aed3-f060-44d3-bcda-85e11daa589c': {
    TR: { title: 'Randevu Al', url: '/randevu-al' },
    EN: { title: 'Book Appointment', url: '/book-appointment' },
    DE: { title: 'Termin buchen', url: '/termin-buchen' },
    RU: { title: 'Записаться', url: '/zapisatsya' },
  },
  // Gizlilik Sözleşmesi (Legal Footer) - 5cab5560
  '5cab5560-2df3-4802-bc85-8beda722e134': {
    TR: { title: 'Gizlilik Sözleşmesi', url: '/gizlilik-sozlesmesi' },
    EN: { title: 'Privacy Policy', url: '/privacy-policy' },
    DE: { title: 'Datenschutzerklärung', url: '/datenschutzerklaerung' },
    RU: { title: 'Политика конфиденциальности', url: '/politika-konfidentsialnosti' },
  },
  // Kullanım Koşulları (Legal Footer) - 93087e3d
  '93087e3d-d252-4ae2-8eca-d1c12b44eb61': {
    TR: { title: 'Kullanım Koşulları', url: '/kullanim-kosullari' },
    EN: { title: 'Terms & Conditions', url: '/terms-and-conditions' },
    DE: { title: 'Allgemeine Geschäftsbedingungen', url: '/allgemeine-geschaeftsbedingungen' },
    RU: { title: 'Условия использования', url: '/usloviya-ispolzovaniya' },
  },
  // KVKK (Legal Footer) - 7c2d0533
  '7c2d0533-a88b-4c23-9962-4f714028b653': {
    TR: { title: 'KVKK Aydınlatma Metni', url: '/kvkk-aydinlatma-metni' },
    EN: { title: 'Data Protection Notice', url: '/personal-data-protection-notice' },
    DE: { title: 'Datenschutzhinweis', url: '/datenschutzhinweis' },
    RU: { title: 'Уведомление о защите данных', url: '/uvedomlenie-o-zashchite-personalnykh-dannykh' },
  },
  // Çerez Politikası (Legal Footer) - 5f865b00
  '5f865b00-511d-459c-a336-421b4f354408': {
    TR: { title: 'Çerez Politikası', url: '/cerez-politikasi' },
    EN: { title: 'Cookie Policy', url: '/cookie-policy' },
    DE: { title: 'Cookie-Richtlinie', url: '/cookie-richtlinie' },
    RU: { title: 'Политика cookie', url: '/politika-cookie' },
  },
};

// ─────────────────────────────────────────────────
// 3. ÇAKIŞMA KONTROLÜ VE GÜNCELLEME FONKSİYONLARI
// ─────────────────────────────────────────────────

async function supabaseFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase error: ${res.status} ${body}`);
  }
  return res;
}

async function checkSlugCollisions() {
  console.log('\n🔍 SLUG ÇAKIŞMA KONTROLÜ...\n');
  
  const res = await supabaseFetch('PageTranslation?select=id,pageId,language,slug');
  const translations: Array<{ id: string; pageId: string; language: string; slug: string }> = await res.json();
  
  // Hedef slug'larla birlikte kontrol et
  const slugMap = new Map<string, string[]>(); // key: "language:slug" → pageId[]
  
  for (const [pageId, langs] of Object.entries(PAGE_UPDATES)) {
    for (const [lang, data] of Object.entries(langs)) {
      if (data.slug === '/') continue; // Ana sayfa slug'ı özel
      const key = `${lang}:${data.slug}`;
      if (!slugMap.has(key)) slugMap.set(key, []);
      slugMap.get(key)!.push(pageId);
    }
  }
  
  let hasCollision = false;
  for (const [key, pageIds] of slugMap.entries()) {
    if (pageIds.length > 1) {
      console.log(`❌ ÇAKIŞMA: ${key} → ${pageIds.join(', ')}`);
      hasCollision = true;
    }
  }
  
  if (!hasCollision) {
    console.log('✅ Slug çakışması yok. Tüm slug\'lar benzersiz.\n');
  }
  
  return !hasCollision;
}

async function updatePageGroups() {
  console.log('\n📦 PAGE GROUP GÜNCELLEMELERI...\n');
  
  for (const [pageId, group] of Object.entries(PAGE_GROUP_UPDATES)) {
    try {
      await supabaseFetch(`Page?id=eq.${pageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ pageGroup: group })
      });
      console.log(`  ✅ Page ${pageId.substring(0, 8)}... → pageGroup=${group}`);
    } catch (err: any) {
      console.log(`  ❌ Page ${pageId.substring(0, 8)}... HATA: ${err.message}`);
    }
  }
}

async function updatePageTranslations() {
  console.log('\n📝 PAGE TRANSLATION GÜNCELLEMELERI...\n');
  
  // Mevcut tüm translation'ları çek
  const res = await supabaseFetch('PageTranslation?select=id,pageId,language,title,slug,seoTitle,seoDesc');
  const existing: Array<{ id: string; pageId: string; language: string; title: string; slug: string; seoTitle: string | null; seoDesc: string | null }> = await res.json();
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  for (const [pageId, langs] of Object.entries(PAGE_UPDATES)) {
    for (const [lang, target] of Object.entries(langs)) {
      const record = existing.find(e => e.pageId === pageId && e.language === lang);
      
      if (!record) {
        console.log(`  ⚠️ KAYIT YOK: Page=${pageId.substring(0, 8)}... Lang=${lang} → Oluşturulması gerekebilir`);
        continue;
      }
      
      // Neyin değişeceğini kontrol et
      const updates: Record<string, string> = {};
      
      if (record.title !== target.title) {
        updates.title = target.title;
      }
      if (record.slug !== target.slug) {
        updates.slug = target.slug;
      }
      // SEO title: mevcut yoksa veya belirtilmişse güncelle
      if (target.seoTitle && (!record.seoTitle || record.seoTitle === '')) {
        updates.seoTitle = target.seoTitle;
      }
      // SEO desc: mevcut yoksa veya belirtilmişse güncelle
      if (target.seoDesc && (!record.seoDesc || record.seoDesc === '')) {
        updates.seoDesc = target.seoDesc;
      }
      
      if (Object.keys(updates).length === 0) {
        skippedCount++;
        continue;
      }
      
      try {
        await supabaseFetch(`PageTranslation?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates)
        });
        console.log(`  ✅ ${lang} ${target.title}: slug="${record.slug}" → "${target.slug}"${updates.title ? `, title="${target.title}"` : ''}`);
        updatedCount++;
      } catch (err: any) {
        console.log(`  ❌ ${lang} ${target.title}: HATA: ${err.message}`);
      }
    }
  }
  
  console.log(`\n  Toplam: ${updatedCount} güncellendi, ${skippedCount} zaten doğru.\n`);
}

async function updateMenuItemTranslations() {
  console.log('\n🔗 MENU ITEM TRANSLATION GÜNCELLEMELERI...\n');
  
  // Mevcut tüm MenuItemTranslation'ları çek
  const res = await supabaseFetch('MenuItemTranslation?select=id,menuItemId,language,title,url');
  const existing: Array<{ id: string; menuItemId: string; language: string; title: string; url: string }> = await res.json();
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  for (const [menuItemId, langs] of Object.entries(MENU_UPDATES)) {
    for (const [lang, target] of Object.entries(langs)) {
      const record = existing.find(e => e.menuItemId === menuItemId && e.language === lang);
      
      if (!record) {
        console.log(`  ⚠️ KAYIT YOK: MenuItem=${menuItemId.substring(0, 8)}... Lang=${lang}`);
        continue;
      }
      
      const updates: Record<string, string> = {};
      
      if (record.title !== target.title) {
        updates.title = target.title;
      }
      if (record.url !== target.url) {
        updates.url = target.url;
      }
      
      if (Object.keys(updates).length === 0) {
        skippedCount++;
        continue;
      }
      
      try {
        await supabaseFetch(`MenuItemTranslation?id=eq.${record.id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates)
        });
        console.log(`  ✅ ${lang} "${target.title}": url="${record.url}" → "${target.url}"`);
        updatedCount++;
      } catch (err: any) {
        console.log(`  ❌ ${lang} "${target.title}": HATA: ${err.message}`);
      }
    }
  }
  
  console.log(`\n  Toplam: ${updatedCount} güncellendi, ${skippedCount} zaten doğru.\n`);
}

// ─────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log(' PAGE TITLES + MULTILANGUAGE ROUTING COMPLETION   ');
  console.log('═══════════════════════════════════════════════════');
  
  // 1. Slug çakışma kontrolü
  const noCollisions = await checkSlugCollisions();
  if (!noCollisions) {
    console.log('❌ Slug çakışmaları var! İşlem durduruluyor.');
    process.exit(1);
  }
  
  // 2. Page Group güncelle
  await updatePageGroups();
  
  // 3. PageTranslation güncelle
  await updatePageTranslations();
  
  // 4. MenuItemTranslation güncelle
  await updateMenuItemTranslations();
  
  console.log('═══════════════════════════════════════════════════');
  console.log(' TAMAMLANDI!                                      ');
  console.log('═══════════════════════════════════════════════════');
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
