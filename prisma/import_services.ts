import { Language } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

const categoriesData = [
  {
    name: "Manikür & Pedikür",
    slug: "manikur-pedikur",
    description: "Profesyonel eller ve ayaklar için lüks bakım, tırnak şekillendirme ve kalıcı oje uygulamaları.",
    order: 1,
    seoTitle: "Manikür & Pedikür | Nails & Lashes Studio",
    seoDesc: "Antalya Nails & Lashes Studio manikür, pedikür, kalıcı oje ve jel güçlendirme uygulamaları ile elleriniz ve ayaklarınız her an kusursuz görünsün."
  },
  {
    name: "İpek Kirpik",
    slug: "ipek-kirpik",
    description: "Doğal görünümden mega volume kadar zengin ve etkileyici bakışlar için profesyonel ipek kirpik uygulamaları.",
    order: 2,
    seoTitle: "İpek Kirpik Uygulamaları | Nails & Lashes Studio",
    seoDesc: "Klasik, orta volume ve mega volume ipek kirpik uygulamaları ile daha belirgin, dolgun ve çekici gözlere sahip olun."
  },
  {
    name: "Kaş & Kirpik Bakımı",
    slug: "kas-kirpik-bakimi",
    description: "Yüz hatlarınıza özel kaş alımı, kaş liftingi, kirpik liftingi ve boya uygulamalarıyla doğal güzelliğinizi ön plana çıkarın.",
    order: 3,
    seoTitle: "Kaş & Kirpik Bakımı | Nails & Lashes Studio",
    seoDesc: "Doğal kirpik ve kaş tasarımı, lifting ve boyama seansları ile bakışlarınıza canlılık ve derinlik kazandırın."
  }
];

const servicesData = [
  // KATEGORİ 1: MANİKÜR & PEDİKÜR
  {
    categorySlug: "manikur-pedikur",
    name: "Manikür Sade",
    slug: "manikur-sade",
    duration: 30,
    price: 0,
    description: "Sade manikür, tırnakların temizlenmesi, şekillendirilmesi ve el bakımının temel adımlarla tamamlanmasını sağlayan pratik bir bakım uygulamasıdır. Doğal ve bakımlı görünüm isteyen müşteriler için idealdir.",
    seoTitle: "Manikür Sade | Temiz ve Bakımlı Tırnak Görünümü",
    seoDesc: "Sade manikür hizmeti ile tırnak bakımınızı kısa sürede tamamlayın. Temiz, doğal ve bakımlı eller için profesyonel manikür uygulaması."
  },
  {
    categorySlug: "manikur-pedikur",
    name: "Pedikür Sade",
    slug: "pedikur-sade",
    duration: 30,
    price: 800,
    description: "Sade pedikür, ayak tırnaklarının şekillendirilmesi, temizlenmesi ve temel bakım işlemlerinin uygulanmasıyla daha sağlıklı ve bakımlı bir görünüm sunar.",
    seoTitle: "Pedikür Sade | Profesyonel Ayak Bakımı",
    seoDesc: "Sade pedikür ile ayak ve tırnak bakımınızı profesyonel şekilde yaptırın. Temiz, rahat ve bakımlı ayaklar için ideal hizmet."
  },
  {
    categorySlug: "manikur-pedikur",
    name: "Manikür + Kalıcı Oje",
    slug: "manikur-kalici-oje",
    duration: 80,
    price: 1100,
    description: "Manikür ve kalıcı oje uygulaması, tırnak bakımını uzun süre dayanıklı, parlak ve estetik bir görünümle birleştirir. Günlük hayatında pratiklik ve şık görünüm isteyen müşteriler için uygundur.",
    seoTitle: "Manikür ve Kalıcı Oje | Parlak ve Uzun Süre Kalıcı Tırnaklar",
    seoDesc: "Manikür ve kalıcı oje uygulaması ile tırnaklarınız haftalarca bakımlı ve parlak görünür. Profesyonel kalıcı oje hizmeti."
  },
  {
    categorySlug: "manikur-pedikur",
    name: "Pedikür + Kalıcı Oje",
    slug: "pedikur-kalici-oje",
    duration: 60,
    price: 1200,
    description: "Pedikür ve kalıcı oje hizmeti, ayak bakımını estetik ve uzun süre kalıcı renk görünümüyle tamamlar. Özellikle yaz aylarında ve tatil dönemlerinde tercih edilen konforlu bir uygulamadır.",
    seoTitle: "Pedikür ve Kalıcı Oje | Bakımlı Ayaklar İçin Kalıcı Güzellik",
    seoDesc: "Pedikür ve kalıcı oje uygulaması ile ayak tırnaklarınız uzun süre parlak, temiz ve bakımlı görünür."
  },
  {
    categorySlug: "manikur-pedikur",
    name: "Manikür + Jel Güçlendirme",
    slug: "manikur-jel-guclendirme",
    duration: 90,
    price: 1400,
    description: "Manikür ve jel güçlendirme uygulaması, doğal tırnakların daha dayanıklı, pürüzsüz ve bakımlı görünmesine yardımcı olur. Kırılmaya yatkın tırnaklar için estetik ve koruyucu bir seçenektir.",
    seoTitle: "Manikür ve Jel Güçlendirme | Daha Dayanıklı Tırnaklar",
    seoDesc: "Jel güçlendirme ile doğal tırnaklarınızı koruyarak daha güçlü, düzgün ve estetik bir görünüm elde edin."
  },
  {
    categorySlug: "manikur-pedikur",
    name: "Pedikür + Jel Güçlendirme",
    slug: "pedikur-jel-guclendirme",
    duration: 80,
    price: 1600,
    description: "Pedikür ve jel güçlendirme hizmeti, ayak tırnaklarında daha düzgün, dayanıklı ve bakımlı bir görünüm sağlar. Uzun süreli estetik sonuç isteyen müşteriler için uygundur.",
    seoTitle: "Pedikür ve Jel Güçlendirme | Güçlü ve Bakımlı Ayak Tırnakları",
    seoDesc: "Pedikür ve jel güçlendirme ile ayak tırnaklarınız daha dayanıklı, temiz ve estetik görünür."
  },

  // KATEGORİ 2: İPEK KİRPİK
  {
    categorySlug: "ipek-kirpik",
    name: "İpek Kirpik Klasik",
    slug: "ipek-kirpik-klasik",
    duration: 80,
    price: 1100,
    description: "Klasik ipek kirpik uygulaması, doğal görünümden vazgeçmeden daha belirgin ve estetik kirpikler isteyen müşteriler için idealdir. Günlük kullanıma uygun, sade ve zarif bir sonuç sunar.",
    seoTitle: "Klasik İpek Kirpik | Doğal ve Zarif Kirpik Görünümü",
    seoDesc: "Klasik ipek kirpik uygulaması ile doğal, zarif ve belirgin kirpik görünümü elde edin. Profesyonel kirpik tasarımı."
  },
  {
    categorySlug: "ipek-kirpik",
    name: "İpek Kirpik Orta Volume",
    slug: "ipek-kirpik-orta-volume",
    duration: 105,
    price: 1300,
    description: "Orta volume ipek kirpik, klasik uygulamaya göre daha dolgun ve belirgin bir görünüm sunar. Hem günlük kullanıma uygun hem de daha dikkat çekici kirpik etkisi isteyenler için dengeli bir seçenektir.",
    seoTitle: "Orta Volume İpek Kirpik | Daha Dolgun Kirpik Görünümü",
    seoDesc: "Orta volume ipek kirpik uygulaması ile doğal görünümü koruyarak daha dolgun ve etkileyici kirpiklere sahip olun."
  },
  {
    categorySlug: "ipek-kirpik",
    name: "İpek Kirpik Mega Volume",
    slug: "ipek-kirpik-mega-volume",
    duration: 120,
    price: 1500,
    description: "Mega volume ipek kirpik uygulaması, yoğun ve çarpıcı kirpik görünümü isteyen müşteriler için tasarlanır. Özel günler, fotoğraf çekimleri veya belirgin bakışlar isteyenler için güçlü bir seçenektir.",
    seoTitle: "Mega Volume İpek Kirpik | Yoğun ve Etkileyici Kirpikler",
    seoDesc: "Mega volume ipek kirpik uygulaması ile yoğun, dikkat çekici ve hacimli kirpik görünümü elde edin."
  },

  // KATEGORİ 3: KAŞ & KİRPİK BAKIMI
  {
    categorySlug: "kas-kirpik-bakimi",
    name: "Kaş Alımı + Lifting + Boya",
    slug: "kas-alimi-lifting-boya",
    duration: 60,
    price: 1200,
    description: "Kaş alımı, lifting ve boya uygulaması kaşların daha düzenli, belirgin ve yüz hatlarıyla uyumlu görünmesini sağlar. Doğal ama etkili bir kaş tasarımı isteyen müşteriler için uygundur.",
    seoTitle: "Kaş Alımı, Lifting ve Boya | Belirgin ve Bakımlı Kaşlar",
    seoDesc: "Kaş alımı, lifting ve boya uygulaması ile yüz hatlarınıza uygun daha belirgin, düzenli ve bakımlı kaş görünümü elde edin."
  },
  {
    categorySlug: "kas-kirpik-bakimi",
    name: "Kirpik Lifting + Boya",
    slug: "kirpik-lifting-boya",
    duration: 60,
    price: 1200,
    description: "Kirpik lifting ve boya, doğal kirpiklerin daha kalkık, belirgin ve canlı görünmesini sağlayan bakım uygulamasıdır. İpek kirpik istemeyen ama etkili bir görünüm arayan müşteriler için idealdir.",
    seoTitle: "Kirpik Lifting ve Boya | Doğal Kıvrık Kirpik Görünümü",
    seoDesc: "Kirpik lifting ve boya uygulaması ile doğal kirpiklerinize daha kıvrık, belirgin ve bakımlı bir görünüm kazandırın."
  }
];

async function run() {
  console.log("Supabase Veri İçe Aktarımı Başlıyor...\n");

  const report = {
    categoriesAdded: [] as string[],
    categoriesUpdated: [] as string[],
    servicesAdded: [] as string[],
    servicesUpdated: [] as string[],
    warnings: [] as string[]
  };

  const categoryMap: Record<string, string> = {}; // slug -> categoryId

  // 1. KATEGORİLERİ UPSERT ET
  for (const cat of categoriesData) {
    // Slug kontrolü yapalım
    const existingTranslation = await prisma.serviceCategoryTranslation.findFirst({
      where: { slug: cat.slug, language: Language.TR }
    });

    if (existingTranslation) {
      // Güncelle
      const categoryId = existingTranslation.categoryId;
      categoryMap[cat.slug] = categoryId;

      await prisma.serviceCategory.update({
        where: { id: categoryId },
        data: { order: cat.order }
      });

      await prisma.serviceCategoryTranslation.update({
        where: { id: existingTranslation.id },
        data: {
          name: cat.name,
          description: cat.description,
          seoTitle: cat.seoTitle,
          seoDesc: cat.seoDesc
        }
      });

      report.categoriesUpdated.push(cat.name);
      console.log(`[KATEGORİ GÜNCELLENDİ] ${cat.name}`);
    } else {
      // Yeni Ekle
      const newCategory = await prisma.serviceCategory.create({
        data: {
          order: cat.order,
          isActive: true,
          translations: {
            create: {
              language: Language.TR,
              slug: cat.slug,
              name: cat.name,
              description: cat.description,
              seoTitle: cat.seoTitle,
              seoDesc: cat.seoDesc
            }
          }
        }
      });
      categoryMap[cat.slug] = newCategory.id;
      report.categoriesAdded.push(cat.name);
      console.log(`[KATEGORİ EKLENDİ] ${cat.name}`);
    }
  }

  console.log("\nKategoriler tamamlandı. Hizmetler işleniyor...\n");

  // 2. HİZMETLERİ UPSERT ET
  for (const s of servicesData) {
    const categoryId = categoryMap[s.categorySlug];
    if (!categoryId) {
      report.warnings.push(`Kategori bulunamadığı için hizmet atlandı: ${s.name} (Kategori Slug: ${s.categorySlug})`);
      console.log(`[UYARI] Kategori bulunamadı: ${s.name}`);
      continue;
    }

    const existingTranslation = await prisma.serviceTranslation.findFirst({
      where: { slug: s.slug, language: Language.TR }
    });

    if (existingTranslation) {
      // Güncelle
      const serviceId = existingTranslation.serviceId;

      await prisma.service.update({
        where: { id: serviceId },
        data: {
          categoryId,
          duration: s.duration,
          price: s.price
        }
      });

      await prisma.serviceTranslation.update({
        where: { id: existingTranslation.id },
        data: {
          name: s.name,
          description: s.description,
          seoTitle: s.seoTitle,
          seoDesc: s.seoDesc
        }
      });

      report.servicesUpdated.push(s.name);
      console.log(`[HİZMET GÜNCELLENDİ] ${s.name}`);
    } else {
      // Yeni Ekle
      await prisma.service.create({
        data: {
          categoryId,
          duration: s.duration,
          price: s.price,
          isActive: true,
          translations: {
            create: {
              language: Language.TR,
              slug: s.slug,
              name: s.name,
              description: s.description,
              seoTitle: s.seoTitle,
              seoDesc: s.seoDesc
            }
          }
        }
      });

      report.servicesAdded.push(s.name);
      console.log(`[HİZMET EKLENDİ] ${s.name}`);
    }
  }

  console.log("\n-------------------------------------------");
  console.log("İŞLEM TAMAMLANDI! RAPOR ÖZETİ:\n");
  console.log(`Eklenen Kategoriler (${report.categoriesAdded.length}):`, report.categoriesAdded.join(", ") || "-");
  console.log(`Güncellenen Kategoriler (${report.categoriesUpdated.length}):`, report.categoriesUpdated.join(", ") || "-");
  console.log(`Eklenen Hizmetler (${report.servicesAdded.length}):`, report.servicesAdded.join(", ") || "-");
  console.log(`Güncellenen Hizmetler (${report.servicesUpdated.length}):`, report.servicesUpdated.join(", ") || "-");
  
  if (report.warnings.length > 0) {
    console.log(`\nUyarılar/Eksik Kalanlar (${report.warnings.length}):\n` + report.warnings.join("\n"));
  } else {
    console.log("\nHerhangi bir uyarı veya eksik kalan alan yoktur. Tüm veriler tam uyumla yüklenmiştir.");
  }
  console.log("-------------------------------------------\n");
}

run()
  .catch(err => {
    console.error("Beklenmedik Hata:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
