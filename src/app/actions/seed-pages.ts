"use server";

import { prisma } from '@/lib/prisma';

// Web sitesindeki mevcut sayfaları ve menü linklerini oluşturur
export async function seedPagesAndMenus() {
  try {
    // ============ CMS SAYFALAR ============
    const pageCount = await prisma.page.count();
    if (pageCount === 0) {
      const pages = [
        {
          translations: [
            { language: 'TR' as const, slug: 'hakkimizda', title: 'Hakkımızda', content: '<p>Nails & Lashes Studio olarak güzellik sektöründe uzun yıllardır hizmet vermekteyiz. Profesyonel ekibimiz ve modern tekniklerimizle sizlere en kaliteli hizmeti sunuyoruz.</p>', seoTitle: 'Hakkımızda - Nails & Lashes Studio', seoDesc: 'Nails & Lashes Studio hakkında bilgi edinin. Profesyonel güzellik merkezi.' },
            { language: 'EN' as const, slug: 'about-us', title: 'About Us', content: '<p>At Nails & Lashes Studio, we have been serving in the beauty industry for many years. With our professional team and modern techniques, we provide you with the highest quality service.</p>', seoTitle: 'About Us - Nails & Lashes Studio', seoDesc: 'Learn about Nails & Lashes Studio. Professional beauty center.' },
            { language: 'DE' as const, slug: 'uber-uns', title: 'Über Uns', content: '<p>Bei Nails & Lashes Studio sind wir seit vielen Jahren in der Schönheitsbranche tätig. Mit unserem professionellen Team und modernen Techniken bieten wir Ihnen den höchsten Qualitätsservice.</p>', seoTitle: 'Über Uns - Nails & Lashes Studio', seoDesc: 'Erfahren Sie mehr über Nails & Lashes Studio.' },
            { language: 'RU' as const, slug: 'o-nas', title: 'О нас', content: '<p>Nails & Lashes Studio работает в индустрии красоты уже много лет. Наша профессиональная команда и современные технологии обеспечивают вам высочайшее качество обслуживания.</p>', seoTitle: 'О нас - Nails & Lashes Studio', seoDesc: 'Узнайте о Nails & Lashes Studio. Профессиональный салон красоты.' },
          ]
        },
        {
          translations: [
            { language: 'TR' as const, slug: 'gizlilik-sozlesmesi', title: 'Gizlilik Sözleşmesi', content: '<p>Bu gizlilik politikası, Nails & Lashes Studio web sitesini kullanırken toplanan kişisel bilgilerin nasıl kullanıldığını ve korunduğunu açıklar.</p><h3>Toplanan Bilgiler</h3><p>İsim, e-posta, telefon numarası gibi bilgiler randevu oluşturma sürecinde toplanır.</p><h3>Bilgilerin Kullanımı</h3><p>Toplanan bilgiler yalnızca randevu yönetimi ve iletişim amaçlı kullanılır.</p>', seoTitle: 'Gizlilik Sözleşmesi - Nails & Lashes Studio', seoDesc: 'Gizlilik politikamız hakkında bilgi edinin.' },
            { language: 'EN' as const, slug: 'privacy-policy', title: 'Privacy Policy', content: '<p>This privacy policy explains how personal information collected when using the Nails & Lashes Studio website is used and protected.</p>', seoTitle: 'Privacy Policy - Nails & Lashes Studio', seoDesc: 'Learn about our privacy policy.' },
            { language: 'DE' as const, slug: 'datenschutz', title: 'Datenschutzrichtlinie', content: '<p>Diese Datenschutzrichtlinie erklärt, wie die bei der Nutzung der Nails & Lashes Studio Website gesammelten persönlichen Daten verwendet und geschützt werden.</p>', seoTitle: 'Datenschutzrichtlinie - Nails & Lashes Studio', seoDesc: 'Erfahren Sie mehr über unsere Datenschutzrichtlinie.' },
            { language: 'RU' as const, slug: 'politika-konfidencialnosti', title: 'Политика конфиденциальности', content: '<p>Данная политика конфиденциальности объясняет, как используются и защищаются персональные данные, собранные при использовании веб-сайта Nails & Lashes Studio.</p>', seoTitle: 'Политика конфиденциальности', seoDesc: 'Узнайте о нашей политике конфиденциальности.' },
          ]
        },
        {
          translations: [
            { language: 'TR' as const, slug: 'kullanim-kosullari', title: 'Kullanım Koşulları', content: '<p>Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.</p><h3>Hizmet Koşulları</h3><p>Randevu iptalleri en az 24 saat öncesinden yapılmalıdır.</p>', seoTitle: 'Kullanım Koşulları - Nails & Lashes Studio', seoDesc: 'Web sitemizin kullanım koşullarını inceleyin.' },
            { language: 'EN' as const, slug: 'terms-of-use', title: 'Terms of Use', content: '<p>By using this website, you agree to the following terms and conditions.</p>', seoTitle: 'Terms of Use - Nails & Lashes Studio', seoDesc: 'Review our terms of use.' },
            { language: 'DE' as const, slug: 'nutzungsbedingungen', title: 'Nutzungsbedingungen', content: '<p>Durch die Nutzung dieser Website stimmen Sie den folgenden Bedingungen zu.</p>', seoTitle: 'Nutzungsbedingungen - Nails & Lashes Studio', seoDesc: 'Überprüfen Sie unsere Nutzungsbedingungen.' },
            { language: 'RU' as const, slug: 'usloviya-ispolzovaniya', title: 'Условия использования', content: '<p>Используя этот веб-сайт, вы соглашаетесь со следующими условиями.</p>', seoTitle: 'Условия использования', seoDesc: 'Ознакомьтесь с нашими условиями использования.' },
          ]
        },
        {
          translations: [
            { language: 'TR' as const, slug: 'kvkk', title: 'KVKK Aydınlatma Metni', content: '<p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verileriniz Nails & Lashes Studio tarafından işlenmektedir.</p><h3>Veri Sorumlusu</h3><p>Nails & Lashes Studio</p><h3>İşlenen Veriler</h3><p>Ad, soyad, e-posta, telefon, randevu bilgileri.</p>', seoTitle: 'KVKK Aydınlatma Metni', seoDesc: 'KVKK kapsamında aydınlatma metnimiz.' },
            { language: 'EN' as const, slug: 'data-protection', title: 'Data Protection Notice', content: '<p>Your personal data is processed by Nails & Lashes Studio in accordance with applicable data protection laws.</p>', seoTitle: 'Data Protection Notice', seoDesc: 'Data protection information.' },
            { language: 'DE' as const, slug: 'datenschutzhinweis', title: 'Datenschutzhinweis', content: '<p>Ihre personenbezogenen Daten werden von Nails & Lashes Studio gemäß den geltenden Datenschutzgesetzen verarbeitet.</p>', seoTitle: 'Datenschutzhinweis', seoDesc: 'Datenschutzinformationen.' },
            { language: 'RU' as const, slug: 'zashchita-dannyh', title: 'Уведомление о защите данных', content: '<p>Ваши персональные данные обрабатываются Nails & Lashes Studio в соответствии с действующим законодательством.</p>', seoTitle: 'Уведомление о защите данных', seoDesc: 'Информация о защите данных.' },
          ]
        },
        {
          translations: [
            { language: 'TR' as const, slug: 'cerez-politikasi', title: 'Çerez Politikası', content: '<p>Web sitemiz, deneyiminizi geliştirmek için çerezler kullanmaktadır. Sitemizi kullanarak çerez kullanımını kabul etmiş olursunuz.</p>', seoTitle: 'Çerez Politikası', seoDesc: 'Çerez politikamız hakkında bilgi edinin.' },
            { language: 'EN' as const, slug: 'cookie-policy', title: 'Cookie Policy', content: '<p>Our website uses cookies to enhance your experience. By using our site, you consent to our use of cookies.</p>', seoTitle: 'Cookie Policy', seoDesc: 'Learn about our cookie policy.' },
            { language: 'DE' as const, slug: 'cookie-richtlinie', title: 'Cookie-Richtlinie', content: '<p>Unsere Website verwendet Cookies, um Ihre Erfahrung zu verbessern.</p>', seoTitle: 'Cookie-Richtlinie', seoDesc: 'Erfahren Sie mehr über unsere Cookie-Richtlinie.' },
            { language: 'RU' as const, slug: 'politika-cookie', title: 'Политика cookie', content: '<p>Наш веб-сайт использует файлы cookie для улучшения вашего опыта.</p>', seoTitle: 'Политика cookie', seoDesc: 'Узнайте о нашей политике cookie.' },
          ]
        },
      ];

      for (const page of pages) {
        await prisma.page.create({
          data: {
            isActive: true,
            translations: {
              create: page.translations.map(t => ({
                language: t.language,
                slug: t.slug,
                title: t.title,
                content: t.content,
                seoTitle: t.seoTitle,
                seoDesc: t.seoDesc,
                index: true,
                sitemap: true,
              })),
            },
          },
        });
      }
    }

    // ============ MENÜ LİNKLERİ ============
    // Yeni yapı: Her menü öğesi için tek bir MenuItem kaydı + 4 dilde MenuItemTranslation
    const menuCount = await prisma.menuItem.count();
    if (menuCount === 0) {
      const menuDefinitions = [
        // ---- HEADER (Üst Menü) ----
        {
          menuType: 'HEADER' as const, order: 1,
          translations: [
            { language: 'TR' as const, title: 'Ana Sayfa', url: '/' },
            { language: 'EN' as const, title: 'Home', url: '/' },
            { language: 'DE' as const, title: 'Startseite', url: '/' },
            { language: 'RU' as const, title: 'Главная', url: '/' },
          ]
        },
        {
          menuType: 'HEADER' as const, order: 2,
          translations: [
            { language: 'TR' as const, title: 'Hizmetler', url: '/services' },
            { language: 'EN' as const, title: 'Services', url: '/services' },
            { language: 'DE' as const, title: 'Dienstleistungen', url: '/services' },
            { language: 'RU' as const, title: 'Услуги', url: '/services' },
          ]
        },
        {
          menuType: 'HEADER' as const, order: 3,
          translations: [
            { language: 'TR' as const, title: 'Galeri', url: '/galeri' },
            { language: 'EN' as const, title: 'Gallery', url: '/galeri' },
            { language: 'DE' as const, title: 'Galerie', url: '/galeri' },
            { language: 'RU' as const, title: 'Галерея', url: '/galeri' },
          ]
        },
        {
          menuType: 'HEADER' as const, order: 4,
          translations: [
            { language: 'TR' as const, title: 'Blog', url: '/blog' },
            { language: 'EN' as const, title: 'Blog', url: '/blog' },
            { language: 'DE' as const, title: 'Blog', url: '/blog' },
            { language: 'RU' as const, title: 'Блог', url: '/blog' },
          ]
        },
        {
          menuType: 'HEADER' as const, order: 5,
          translations: [
            { language: 'TR' as const, title: 'İletişim', url: '/iletisim' },
            { language: 'EN' as const, title: 'Contact', url: '/iletisim' },
            { language: 'DE' as const, title: 'Kontakt', url: '/iletisim' },
            { language: 'RU' as const, title: 'Контакты', url: '/iletisim' },
          ]
        },

        // ---- FOOTER (Alt Menü) ----
        {
          menuType: 'FOOTER' as const, order: 1,
          translations: [
            { language: 'TR' as const, title: 'Hakkımızda', url: '/hakkimizda' },
            { language: 'EN' as const, title: 'About Us', url: '/hakkimizda' },
            { language: 'DE' as const, title: 'Über Uns', url: '/hakkimizda' },
            { language: 'RU' as const, title: 'О нас', url: '/hakkimizda' },
          ]
        },
        {
          menuType: 'FOOTER' as const, order: 2,
          translations: [
            { language: 'TR' as const, title: 'Hizmetlerimiz', url: '/services' },
            { language: 'EN' as const, title: 'Our Services', url: '/services' },
            { language: 'DE' as const, title: 'Dienstleistungen', url: '/services' },
            { language: 'RU' as const, title: 'Наши услуги', url: '/services' },
          ]
        },
        {
          menuType: 'FOOTER' as const, order: 3,
          translations: [
            { language: 'TR' as const, title: 'Blog', url: '/blog' },
            { language: 'EN' as const, title: 'Blog', url: '/blog' },
            { language: 'DE' as const, title: 'Blog', url: '/blog' },
            { language: 'RU' as const, title: 'Блог', url: '/blog' },
          ]
        },
        {
          menuType: 'FOOTER' as const, order: 4,
          translations: [
            { language: 'TR' as const, title: 'Portfolyo', url: '/portfolio' },
            { language: 'EN' as const, title: 'Portfolio', url: '/portfolio' },
            { language: 'DE' as const, title: 'Portfolio', url: '/portfolio' },
            { language: 'RU' as const, title: 'Портфолио', url: '/portfolio' },
          ]
        },
        {
          menuType: 'FOOTER' as const, order: 5,
          translations: [
            { language: 'TR' as const, title: 'İletişim', url: '/iletisim' },
            { language: 'EN' as const, title: 'Contact', url: '/iletisim' },
            { language: 'DE' as const, title: 'Kontakt', url: '/iletisim' },
            { language: 'RU' as const, title: 'Контакты', url: '/iletisim' },
          ]
        },

        // ---- LEGAL FOOTER (Yasal Menü) ----
        {
          menuType: 'LEGAL_FOOTER' as const, order: 1,
          translations: [
            { language: 'TR' as const, title: 'Gizlilik Sözleşmesi', url: '/gizlilik-sozlesmesi' },
            { language: 'EN' as const, title: 'Privacy Policy', url: '/privacy-policy' },
            { language: 'DE' as const, title: 'Datenschutzrichtlinie', url: '/datenschutz' },
            { language: 'RU' as const, title: 'Политика конфиденциальности', url: '/politika-konfidencialnosti' },
          ]
        },
        {
          menuType: 'LEGAL_FOOTER' as const, order: 2,
          translations: [
            { language: 'TR' as const, title: 'Kullanım Koşulları', url: '/kullanim-kosullari' },
            { language: 'EN' as const, title: 'Terms of Use', url: '/terms-of-use' },
            { language: 'DE' as const, title: 'Nutzungsbedingungen', url: '/nutzungsbedingungen' },
            { language: 'RU' as const, title: 'Условия использования', url: '/usloviya-ispolzovaniya' },
          ]
        },
        {
          menuType: 'LEGAL_FOOTER' as const, order: 3,
          translations: [
            { language: 'TR' as const, title: 'KVKK Aydınlatma Metni', url: '/kvkk' },
            { language: 'EN' as const, title: 'Data Protection', url: '/data-protection' },
            { language: 'DE' as const, title: 'Datenschutzhinweis', url: '/datenschutzhinweis' },
            { language: 'RU' as const, title: 'Защита данных', url: '/zashchita-dannyh' },
          ]
        },
        {
          menuType: 'LEGAL_FOOTER' as const, order: 4,
          translations: [
            { language: 'TR' as const, title: 'Çerez Politikası', url: '/cerez-politikasi' },
            { language: 'EN' as const, title: 'Cookie Policy', url: '/cookie-policy' },
            { language: 'DE' as const, title: 'Cookie-Richtlinie', url: '/cookie-richtlinie' },
            { language: 'RU' as const, title: 'Политика cookie', url: '/politika-cookie' },
          ]
        },
      ];

      for (const def of menuDefinitions) {
        await prisma.menuItem.create({
          data: {
            menuType: def.menuType,
            order: def.order,
            isActive: true,
            translations: {
              create: def.translations.map(t => ({
                language: t.language,
                title: t.title,
                url: t.url,
              })),
            },
          },
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Sayfa/Menü seed hatası:', error);
    return { success: false, error: error.message };
  }
}
