import { prisma } from '../src/lib/prisma';

const seoData = {
  '': {
    h1Title: 'Lüks Bakım Deneyimi',
    introText: 'Nails & Lashes Studio ile en iyi versiyonunuza kavuşun. Yenilikçi dokunuşlar, kusursuz sonuçlar.',
    seoTitle: 'Nails & Lashes Studio - Premium Manikür ve İpek Kirpik Merkezi | Antalya',
    seoDesc: 'Antalya\'nın en lüks güzellik merkezi Nails & Lashes Studio\'da profesyonel manikür, protez tırnak, kalıcı oje ve ipek kirpik hizmetleri. Hemen randevu alın.',
    headerImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop'
  },
  'services': {
    h1Title: 'Premium Hizmetlerimiz',
    introText: 'Güzelliğinizi ön plana çıkaracak özel tasarlanmış lüks bakım ve estetik hizmetlerimiz.',
    seoTitle: 'Hizmetlerimiz | Protez Tırnak ve İpek Kirpik | Nails & Lashes Studio',
    seoDesc: 'Tırnak tasarımı, kalıcı oje, ipek kirpik ve kaş tasarımı gibi güzellik ve bakım alanında uzman ekibimizle sunduğumuz lüks hizmetler.',
    headerImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop'
  },
  'galeri': {
    h1Title: 'Görsel Sanat Galerimiz',
    introText: 'Stüdyomuzda gerçekleştirilen büyüleyici dönüşümler ve en trend nail art & lash uygulamalarımız.',
    seoTitle: 'Fotoğraf Galerisi | Kalıcı Oje ve Nail Art Örnekleri',
    seoDesc: 'Nails & Lashes Studio\'da uzmanlarımız tarafından yapılan protez tırnak, nail art ve ipek kirpik öncesi/sonrası yüksek kalite görseller.',
    headerImage: 'https://images.unsplash.com/photo-1588693959600-0e42f9e4220b?q=80&w=2070&auto=format&fit=crop'
  },
  'blog': {
    h1Title: 'Güzellik Sırları Blogu',
    introText: 'Trend tırnak modelleri, kirpik bakımı ve güzellik sırları hakkında uzman tavsiyeleri.',
    seoTitle: 'Güzellik ve Bakım Blogu | İpuçları ve Trendler | Nails & Lashes',
    seoDesc: 'Manikür trendleri, ipek kirpik kullanım rehberi ve günlük güzellik rutininizi mükemmelleştirecek ipuçları blogumuzda.',
    headerImage: 'https://images.unsplash.com/photo-1611078716382-736fdf5b4e07?q=80&w=2070&auto=format&fit=crop'
  },
  'iletisim': {
    h1Title: 'Bizimle İletişime Geçin',
    introText: 'Sorularınız, görüşleriniz veya detaylı bilgi almak için dilediğiniz an bizimle iletişime geçebilirsiniz.',
    seoTitle: 'İletişim & Lokasyon | Antalya Nails & Lashes Studio',
    seoDesc: 'Antalya Nails & Lashes Studio iletişim bilgileri, adres haritası ve WhatsApp randevu hattımız. Lüks bakım için bize ulaşın.',
    headerImage: 'https://images.unsplash.com/photo-1596178060671-7a80fc80e6c5?q=80&w=2070&auto=format&fit=crop'
  },
  'booking': {
    h1Title: 'Online Randevu',
    introText: 'Size özel zaman ayırabilmemiz için lüks bakım randevunuzu hemen online olarak oluşturun.',
    seoTitle: 'Hemen Randevu Al | Online Rezervasyon | Nails & Lashes',
    seoDesc: 'Nails & Lashes Studio\'dan kolayca online randevu alın. İstediğiniz uzmanı ve saati seçerek güzelliğinize zaman ayırın.',
    headerImage: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=2102&auto=format&fit=crop'
  },
  'portfolio': {
    h1Title: 'Uzmanlık Portfolyomuz',
    introText: 'Detaylara verdiğimiz önem ve estetik vizyonumuzun bir yansıması.',
    seoTitle: 'Uzman Portfolyosu | Profesyonel Tırnak Tasarımı',
    seoDesc: 'Profesyonel ekibimizin gerçekleştirdiği masterclass seviyesindeki nail art ve estetik bakım uygulamalarımızın portfolyosu.',
    headerImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2070&auto=format&fit=crop'
  }
};

async function main() {
  const pages = await prisma.page.findMany({
    where: { pageGroup: 'SYSTEM' },
    include: { translations: true }
  });

  for (const page of pages) {
    for (const trans of page.translations) {
      if (trans.language === 'TR') {
        const d = seoData[trans.slug as keyof typeof seoData];
        if (d) {
          await prisma.pageTranslation.update({
            where: { id: trans.id },
            data: {
              h1Title: d.h1Title,
              introText: d.introText,
              seoTitle: d.seoTitle,
              seoDesc: d.seoDesc,
              headerImage: d.headerImage,
              thumbnailImage: d.headerImage
            }
          });
          console.log(`Güncellendi: ${trans.slug}`);
        } else if (trans.slug === '') {
           // slug boş string olan ana sayfa için
           const md = seoData[''];
           await prisma.pageTranslation.update({
            where: { id: trans.id },
            data: {
              h1Title: md.h1Title,
              introText: md.introText,
              seoTitle: md.seoTitle,
              seoDesc: md.seoDesc,
              headerImage: md.headerImage,
              thumbnailImage: md.headerImage
            }
          });
          console.log(`Ana Sayfa Güncellendi`);
        }
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
