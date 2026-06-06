import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

// --- SEO GENERATOR ---
const generateSEO = (type: string, title: string, lang: string, slug: string) => {
  let seoTitle = '';
  let seoDesc = '';
  
  // Marka son eki
  const brandExt = {
    TR: ' | Nails & Lashes Studio Antalya',
    EN: ' | Nails & Lashes Studio Antalya',
    DE: ' | Nails & Lashes Studio Antalya',
    RU: ' | Nails & Lashes Studio Анталия'
  };

  const ext = brandExt[lang as keyof typeof brandExt] || brandExt.TR;

  // Özel Durumlar (slug bazlı özel metinler)
  const customSEO: Record<string, Record<string, { t: string, d: string }>> = {
    'hakkimizda': {
      TR: { t: 'Hakkımızda', d: 'Nails & Lashes Studio Antalya olarak, uzman kadromuz ve modern ortamımızla güzelliğinize değer katıyoruz. Bizimle tanışın, farkı hissedin.' },
      EN: { t: 'About Us', d: 'As Nails & Lashes Studio Antalya, we add value to your beauty with our expert team and modern environment. Meet us and feel the difference.' },
      DE: { t: 'Über Uns', d: 'Als Nails & Lashes Studio Antalya werten wir Ihre Schönheit mit unserem Expertenteam und modernen Umfeld auf. Lernen Sie uns kennen.' },
      RU: { t: 'О нас', d: 'Nails & Lashes Studio Анталия добавляет ценность вашей красоте благодаря нашей экспертной команде. Познакомьтесь с нами и почувствуйте разницу.' }
    },
    'vip-protez-tirnak': {
      TR: { t: 'VIP Protez Tırnak', d: 'Antalya VIP Protez Tırnak uygulaması ile kalıcı, dayanıklı ve kusursuz tırnaklara sahip olun. En iyi kalite tırnak merkezi.' },
      EN: { t: 'VIP Acrylic Nails', d: 'Get long-lasting, durable and flawless nails with VIP Acrylic Nails application in Antalya. The best quality nail center.' },
      DE: { t: 'VIP Acrylnägel', d: 'Holen Sie sich langanhaltende, langlebige und makellose Nägel mit VIP Acrylnägeln in Antalya. Das Nagelstudio bester Qualität.' },
      RU: { t: 'VIP Наращивание ногтей', d: 'Получите долговечные и безупречные ногти с помощью VIP наращивания в Анталии. Лучший маникюрный центр.' }
    },
    'kalici-oje': {
      TR: { t: 'Kalıcı Oje (Jel)', d: 'Antalya Kalıcı Oje ve Jel uygulaması ile 3-4 hafta boyunca parlak ve bakımlı tırnakların keyfini çıkarın.' },
      EN: { t: 'Gel Polish', d: 'Enjoy bright and well-groomed nails for 3-4 weeks with our Gel Polish application in Antalya.' },
      DE: { t: 'Gellack', d: 'Genießen Sie 3-4 Wochen lang helle und gepflegte Nägel mit unserer Gellack-Anwendung in Antalya.' },
      RU: { t: 'Гель-лак', d: 'Наслаждайтесь яркими и ухоженными ногтями в течение 3-4 недель с нашим покрытием гель-лаком в Анталии.' }
    },
    'ipek-kirpik': {
      TR: { t: 'İpek Kirpik Tasarımı', d: 'Doğal, orta veya mega volume ipek kirpik uygulamalarımızla Antalya\'da etkileyici bakışlara sahip olun.' },
      EN: { t: 'Silk Eyelashes', d: 'Get impressive looks in Antalya with our natural, medium or mega volume silk eyelash applications.' },
      DE: { t: 'Seidenwimpern', d: 'Erhalten Sie beeindruckende Blicke in Antalya mit unseren natürlichen, mittleren oder mega-voluminösen Seidenwimpern-Anwendungen.' },
      RU: { t: 'Наращивание ресниц', d: 'Получите впечатляющие взгляды в Анталии с нашими услугами по наращиванию ресниц (классика, объем, мега-объем).' }
    },
    'manikur-pedikur': {
      TR: { t: 'Manikür & Pedikür', d: 'Antalya manikür ve pedikür hizmetlerimizle ellerinize ve ayaklarınıza ihtiyacı olan özeni gösterin. Kusursuz bakım.' },
      EN: { t: 'Manicure & Pedicure', d: 'Give your hands and feet the care they need with our manicure and pedicure services in Antalya. Flawless care.' },
      DE: { t: 'Maniküre & Pediküre', d: 'Gönnen Sie Ihren Händen und Füßen die Pflege, die sie brauchen, mit unseren Maniküre- und Pedikürediensten in Antalya.' },
      RU: { t: 'Маникюр и педикюр', d: 'Подарите своим рукам и ногам необходимый уход с нашими услугами маникюра и педикюра в Анталии.' }
    }
  };

  // 1. Eğer özel listemizde slug varsa, oradan al
  if (customSEO[slug] && customSEO[slug][lang]) {
    seoTitle = customSEO[slug][lang].t + ext;
    seoDesc = customSEO[slug][lang].d;
    return { seoTitle, seoDesc };
  }

  // 2. Yoksa Jenerik Üret
  const genericDesc = {
    TR: `Antalya Nails & Lashes Studio'da profesyonel ${title} hizmeti. Kalite, hijyen ve kusursuz güzelliğin adresi. Hemen randevu alın!`,
    EN: `Professional ${title} services at Nails & Lashes Studio Antalya. The address of quality, hygiene, and flawless beauty. Book now!`,
    DE: `Professionelle ${title} Dienstleistungen im Nails & Lashes Studio Antalya. Die Adresse für Qualität, Hygiene und makellose Schönheit.`,
    RU: `Профессиональные услуги ${title} в Nails & Lashes Studio Анталия. Адрес качества, гигиены и безупречной красоты. Забронируйте сейчас!`
  };

  seoTitle = title + ext;
  seoDesc = genericDesc[lang as keyof typeof genericDesc] || genericDesc.TR;

  // Max uzunluk kontrolleri (SEO title < 60, desc < 160 önerilir ama biz garanti olsun diye sınırlandırıyoruz)
  if (seoTitle.length > 70) seoTitle = seoTitle.substring(0, 67) + '...';
  if (seoDesc.length > 160) seoDesc = seoDesc.substring(0, 157) + '...';

  return { seoTitle, seoDesc };
};

// --- UPDATE SCRİPTİ ---
async function updateSEOData() {
  try {
    console.log("JSON verisi okunuyor...");
    const dataPath = path.join(process.cwd(), 'scratch', 'seo-data-export.json');
    if (!fs.existsSync(dataPath)) {
      console.log("JSON dosyası bulunamadı. Lütfen önce export betiğini çalıştırın.");
      return;
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const db = JSON.parse(rawData);
    
    console.log("Veriler işleniyor ve veritabanı güncelleniyor...");

    // 1. Pages Güncelleme
    let pagesCount = 0;
    for (const page of db.pages) {
      const seo = generateSEO('page', page.title, page.language, page.slug);
      await prisma.pageTranslation.update({
        where: { id: page.id },
        data: {
          seoTitle: seo.seoTitle,
          seoDesc: seo.seoDesc
        }
      });
      pagesCount++;
    }
    console.log(`- ${pagesCount} sayfa çevirisi güncellendi.`);

    // 2. Service Categories Güncelleme
    let catCount = 0;
    for (const cat of db.serviceCategories) {
      const seo = generateSEO('category', cat.name, cat.language, cat.slug);
      await prisma.serviceCategoryTranslation.update({
        where: { id: cat.id },
        data: {
          seoTitle: seo.seoTitle,
          seoDesc: seo.seoDesc
        }
      });
      catCount++;
    }
    console.log(`- ${catCount} servis kategorisi çevirisi güncellendi.`);

    // 3. Services Güncelleme
    let srvCount = 0;
    for (const srv of db.services) {
      const seo = generateSEO('service', srv.name, srv.language, srv.slug);
      await prisma.serviceTranslation.update({
        where: { id: srv.id },
        data: {
          seoTitle: seo.seoTitle,
          seoDesc: seo.seoDesc
        }
      });
      srvCount++;
    }
    console.log(`- ${srvCount} servis çevirisi güncellendi.`);

    // 4. Blog Posts Güncelleme
    let blogCount = 0;
    for (const post of db.blogPosts) {
      const seo = generateSEO('blog', post.title, post.language, post.slug);
      await prisma.blogPostTranslation.update({
        where: { id: post.id },
        data: {
          seoTitle: seo.seoTitle,
          seoDesc: seo.seoDesc
        }
      });
      blogCount++;
    }
    console.log(`- ${blogCount} blog yazısı çevirisi güncellendi.`);

    console.log("✅ Tüm SEO güncellemeleri başarıyla tamamlandı. Url'ler (slug) değiştirilmedi. Çeviri başlıklarına SEO uygulandı.");
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSEOData();
