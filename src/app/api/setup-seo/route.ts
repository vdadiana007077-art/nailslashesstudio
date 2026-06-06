import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const seoData: any = {
  '': {
    TR: {
      h1Title: 'Lüks Bakım Deneyimi',
      introText: 'Nails & Lashes Studio ile en iyi versiyonunuza kavuşun. Yenilikçi dokunuşlar, kusursuz sonuçlar.',
      seoTitle: 'Nails & Lashes Studio - Premium Manikür ve İpek Kirpik Merkezi | Antalya',
      seoDesc: 'Antalya\'nın en lüks güzellik merkezi Nails & Lashes Studio\'da profesyonel manikür, protez tırnak, kalıcı oje ve ipek kirpik hizmetleri.',
      headerImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop'
    },
    EN: {
      h1Title: 'Luxury Beauty Experience',
      introText: 'Discover your best self with Nails & Lashes Studio. Innovative touches, flawless results.',
      seoTitle: 'Nails & Lashes Studio - Premium Manicure & Eyelash Extension | Antalya',
      seoDesc: 'Professional manicure, acrylic nails, and eyelash extension services at Antalya\'s most luxurious beauty center. Book your appointment today.',
      headerImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop'
    },
    DE: {
      h1Title: 'Luxus Beauty Erlebnis',
      introText: 'Entdecken Sie Ihr bestes Ich mit dem Nails & Lashes Studio. Innovative Berührungen, makellose Ergebnisse.',
      seoTitle: 'Nails & Lashes Studio - Premium Maniküre & Wimpernverlängerung | Antalya',
      seoDesc: 'Professionelle Maniküre, Acrylnägel und Wimpernverlängerung in Antalyas luxuriösestem Schönheitszentrum. Buchen Sie noch heute.',
      headerImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop'
    },
    RU: {
      h1Title: 'Роскошный Опыт Красоты',
      introText: 'Откройте для себя лучшую версию себя с Nails & Lashes Studio. Инновационные подходы, безупречные результаты.',
      seoTitle: 'Nails & Lashes Studio - Премиум Маникюр и Наращивание Ресниц | Анталия',
      seoDesc: 'Профессиональный маникюр, наращивание ногтей и ресниц в самом роскошном центре красоты Анталии. Запишитесь на прием сегодня.',
      headerImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop'
    }
  },
  'services': {
    TR: {
      h1Title: 'Premium Hizmetlerimiz',
      introText: 'Güzelliğinizi ön plana çıkaracak özel tasarlanmış lüks bakım ve estetik hizmetlerimiz.',
      seoTitle: 'Hizmetlerimiz | Protez Tırnak ve İpek Kirpik | Nails & Lashes Studio',
      seoDesc: 'Tırnak tasarımı, kalıcı oje, ipek kirpik ve kaş tasarımı gibi güzellik ve bakım alanında uzman ekibimizle sunduğumuz lüks hizmetler.',
      headerImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop'
    },
    EN: {
      h1Title: 'Our Premium Services',
      introText: 'Specially designed luxury care and aesthetic services to highlight your beauty.',
      seoTitle: 'Our Services | Acrylic Nails & Eyelash Extension | Nails & Lashes Studio',
      seoDesc: 'Luxury services offered by our expert team in beauty and care areas such as nail design, gel polish, eyelash extensions, and eyebrow design.',
      headerImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop'
    },
    DE: {
      h1Title: 'Unsere Premium Leistungen',
      introText: 'Speziell entworfene Luxuspflege und ästhetische Dienstleistungen, um Ihre Schönheit hervorzuheben.',
      seoTitle: 'Unsere Leistungen | Acrylnägel & Wimpernverlängerung | Nails & Lashes Studio',
      seoDesc: 'Luxusdienstleistungen von unserem Expertenteam in den Bereichen Nageldesign, Gellack, Wimpernverlängerung und Augenbrauendesign.',
      headerImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop'
    },
    RU: {
      h1Title: 'Наши Премиум Услуги',
      introText: 'Специально разработанные услуги роскошного ухода и эстетики, чтобы подчеркнуть вашу красоту.',
      seoTitle: 'Наши Услуги | Наращивание Ногтей и Ресниц | Nails & Lashes Studio',
      seoDesc: 'Роскошные услуги, предлагаемые нашей командой экспертов в области дизайна ногтей, гель-лака, наращивания ресниц и дизайна бровей.',
      headerImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop'
    }
  },
  'galeri': {
    TR: {
      h1Title: 'Görsel Sanat Galerimiz',
      introText: 'Stüdyomuzda gerçekleştirilen büyüleyici dönüşümler ve en trend nail art & lash uygulamalarımız.',
      seoTitle: 'Fotoğraf Galerisi | Kalıcı Oje ve Nail Art Örnekleri',
      seoDesc: 'Nails & Lashes Studio\'da uzmanlarımız tarafından yapılan protez tırnak, nail art ve ipek kirpik öncesi/sonrası yüksek kalite görseller.',
      headerImage: 'https://images.unsplash.com/photo-1588693959600-0e42f9e4220b?q=80&w=2070&auto=format&fit=crop'
    },
    EN: {
      h1Title: 'Our Visual Art Gallery',
      introText: 'Fascinating transformations and our trendiest nail art & lash applications performed in our studio.',
      seoTitle: 'Photo Gallery | Gel Polish and Nail Art Examples',
      seoDesc: 'High-quality before/after images of acrylic nails, nail art, and eyelash extensions done by our experts at Nails & Lashes Studio.',
      headerImage: 'https://images.unsplash.com/photo-1588693959600-0e42f9e4220b?q=80&w=2070&auto=format&fit=crop'
    },
    DE: {
      h1Title: 'Unsere Visuelle Kunstgalerie',
      introText: 'Faszinierende Verwandlungen und unsere trendigsten Nail Art & Wimpern Anwendungen in unserem Studio.',
      seoTitle: 'Fotogalerie | Beispiele für Gellack und Nail Art',
      seoDesc: 'Hochwertige Vorher-/Nachher-Bilder von Acrylnägeln, Nail Art und Wimpernverlängerungen, durchgeführt von unseren Experten.',
      headerImage: 'https://images.unsplash.com/photo-1588693959600-0e42f9e4220b?q=80&w=2070&auto=format&fit=crop'
    },
    RU: {
      h1Title: 'Наша Галерея Визуального Искусства',
      introText: 'Завораживающие преображения и наши самые трендовые работы по нейл-арту и ресницам, выполненные в нашей студии.',
      seoTitle: 'Фотогалерея | Примеры Гель-лака и Дизайна Ногтей',
      seoDesc: 'Качественные фото до/после наращивания ногтей, нейл-арта и наращивания ресниц, выполненные нашими экспертами.',
      headerImage: 'https://images.unsplash.com/photo-1588693959600-0e42f9e4220b?q=80&w=2070&auto=format&fit=crop'
    }
  },
  'blog': {
    TR: {
      h1Title: 'Güzellik Sırları Blogu',
      introText: 'Trend tırnak modelleri, kirpik bakımı ve güzellik sırları hakkında uzman tavsiyeleri.',
      seoTitle: 'Güzellik ve Bakım Blogu | İpuçları ve Trendler | Nails & Lashes',
      seoDesc: 'Manikür trendleri, ipek kirpik kullanım rehberi ve günlük güzellik rutininizi mükemmelleştirecek ipuçları blogumuzda.',
      headerImage: 'https://images.unsplash.com/photo-1611078716382-736fdf5b4e07?q=80&w=2070&auto=format&fit=crop'
    },
    EN: {
      h1Title: 'Beauty Secrets Blog',
      introText: 'Expert advice on trendy nail models, eyelash care, and beauty secrets.',
      seoTitle: 'Beauty and Care Blog | Tips and Trends | Nails & Lashes',
      seoDesc: 'Manicure trends, eyelash extension guide, and tips to perfect your daily beauty routine on our blog.',
      headerImage: 'https://images.unsplash.com/photo-1611078716382-736fdf5b4e07?q=80&w=2070&auto=format&fit=crop'
    },
    DE: {
      h1Title: 'Blog für Schönheitsgeheimnisse',
      introText: 'Expertenrat zu trendigen Nagelmodellen, Wimpernpflege und Schönheitsgeheimnissen.',
      seoTitle: 'Schönheits- und Pflege-Blog | Tipps und Trends | Nails & Lashes',
      seoDesc: 'Maniküre-Trends, Leitfaden für Wimpernverlängerungen und Tipps zur Perfektionierung Ihrer täglichen Schönheitsroutine in unserem Blog.',
      headerImage: 'https://images.unsplash.com/photo-1611078716382-736fdf5b4e07?q=80&w=2070&auto=format&fit=crop'
    },
    RU: {
      h1Title: 'Блог Секретов Красоты',
      introText: 'Советы экспертов по трендовым моделям ногтей, уходу за ресницами и секретам красоты.',
      seoTitle: 'Блог о Красоте и Уходе | Советы и Тренды | Nails & Lashes',
      seoDesc: 'Тренды маникюра, руководство по наращиванию ресниц и советы по улучшению вашей повседневной рутины красоты в нашем блоге.',
      headerImage: 'https://images.unsplash.com/photo-1611078716382-736fdf5b4e07?q=80&w=2070&auto=format&fit=crop'
    }
  },
  'iletisim': {
    TR: {
      h1Title: 'Bizimle İletişime Geçin',
      introText: 'Sorularınız, görüşleriniz veya detaylı bilgi almak için dilediğiniz an bizimle iletişime geçebilirsiniz.',
      seoTitle: 'İletişim & Lokasyon | Antalya Nails & Lashes Studio',
      seoDesc: 'Antalya Nails & Lashes Studio iletişim bilgileri, adres haritası ve WhatsApp randevu hattımız. Lüks bakım için bize ulaşın.',
      headerImage: 'https://images.unsplash.com/photo-1596178060671-7a80fc80e6c5?q=80&w=2070&auto=format&fit=crop'
    },
    EN: {
      h1Title: 'Contact Us',
      introText: 'You can contact us at any time for your questions, opinions, or detailed information.',
      seoTitle: 'Contact & Location | Antalya Nails & Lashes Studio',
      seoDesc: 'Antalya Nails & Lashes Studio contact information, address map, and WhatsApp appointment line. Contact us for luxury care.',
      headerImage: 'https://images.unsplash.com/photo-1596178060671-7a80fc80e6c5?q=80&w=2070&auto=format&fit=crop'
    },
    DE: {
      h1Title: 'Kontaktiere Uns',
      introText: 'Für Ihre Fragen, Meinungen oder detaillierte Informationen können Sie uns jederzeit kontaktieren.',
      seoTitle: 'Kontakt & Standort | Antalya Nails & Lashes Studio',
      seoDesc: 'Kontaktinformationen, Adresskarte und WhatsApp-Terminvereinbarung von Nails & Lashes Studio Antalya. Kontaktieren Sie uns für Luxuspflege.',
      headerImage: 'https://images.unsplash.com/photo-1596178060671-7a80fc80e6c5?q=80&w=2070&auto=format&fit=crop'
    },
    RU: {
      h1Title: 'Связаться с Нами',
      introText: 'Вы можете связаться с нами в любое время для ваших вопросов, мнений или получения подробной информации.',
      seoTitle: 'Контакты и Расположение | Antalya Nails & Lashes Studio',
      seoDesc: 'Контактная информация Antalya Nails & Lashes Studio, карта адресов и линия записи WhatsApp. Свяжитесь с нами для роскошного ухода.',
      headerImage: 'https://images.unsplash.com/photo-1596178060671-7a80fc80e6c5?q=80&w=2070&auto=format&fit=crop'
    }
  },
  'booking': {
    TR: {
      h1Title: 'Online Randevu',
      introText: 'Size özel zaman ayırabilmemiz için lüks bakım randevunuzu hemen online olarak oluşturun.',
      seoTitle: 'Hemen Randevu Al | Online Rezervasyon | Nails & Lashes',
      seoDesc: 'Nails & Lashes Studio\'dan kolayca online randevu alın. İstediğiniz uzmanı ve saati seçerek güzelliğinize zaman ayırın.',
      headerImage: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=2102&auto=format&fit=crop'
    },
    EN: {
      h1Title: 'Online Booking',
      introText: 'Book your luxury care appointment online right away so we can set aside special time for you.',
      seoTitle: 'Book an Appointment Now | Online Reservation | Nails & Lashes',
      seoDesc: 'Easily book an online appointment at Nails & Lashes Studio. Take time for your beauty by choosing the expert and time you want.',
      headerImage: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=2102&auto=format&fit=crop'
    },
    DE: {
      h1Title: 'Online Terminbuchung',
      introText: 'Buchen Sie Ihren Termin für die Luxuspflege gleich online, damit wir uns speziell für Sie Zeit nehmen können.',
      seoTitle: 'Jetzt Termin Buchen | Online Reservierung | Nails & Lashes',
      seoDesc: 'Buchen Sie ganz einfach online einen Termin im Nails & Lashes Studio. Nehmen Sie sich Zeit für Ihre Schönheit.',
      headerImage: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=2102&auto=format&fit=crop'
    },
    RU: {
      h1Title: 'Онлайн Бронирование',
      introText: 'Запишитесь на прием для роскошного ухода онлайн прямо сейчас, чтобы мы могли уделить вам особое время.',
      seoTitle: 'Записаться на Прием Сейчас | Онлайн Резервация | Nails & Lashes',
      seoDesc: 'Легко запишитесь на онлайн-прием в Nails & Lashes Studio. Уделите время своей красоте, выбрав нужного эксперта и время.',
      headerImage: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=2102&auto=format&fit=crop'
    }
  },
  'portfolio': {
    TR: {
      h1Title: 'Uzmanlık Portfolyomuz',
      introText: 'Detaylara verdiğimiz önem ve estetik vizyonumuzun bir yansıması.',
      seoTitle: 'Uzman Portfolyosu | Profesyonel Tırnak Tasarımı',
      seoDesc: 'Profesyonel ekibimizin gerçekleştirdiği masterclass seviyesindeki nail art ve estetik bakım uygulamalarımızın portfolyosu.',
      headerImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2070&auto=format&fit=crop'
    },
    EN: {
      h1Title: 'Our Expertise Portfolio',
      introText: 'A reflection of the importance we attach to details and our aesthetic vision.',
      seoTitle: 'Expert Portfolio | Professional Nail Design',
      seoDesc: 'The portfolio of masterclass-level nail art and aesthetic care applications performed by our professional team.',
      headerImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2070&auto=format&fit=crop'
    },
    DE: {
      h1Title: 'Unser Expertise-Portfolio',
      introText: 'Ein Spiegelbild der Bedeutung, die wir Details und unserer ästhetischen Vision beimessen.',
      seoTitle: 'Experten-Portfolio | Professionelles Nageldesign',
      seoDesc: 'Das Portfolio von Nail Art- und ästhetischen Pflegeanwendungen auf Meisterklasse-Niveau, durchgeführt von unserem Team.',
      headerImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2070&auto=format&fit=crop'
    },
    RU: {
      h1Title: 'Наше Портфолио Экспертизы',
      introText: 'Отражение важности, которую мы придаем деталям, и нашего эстетического видения.',
      seoTitle: 'Экспертное Портфолио | Профессиональный Дизайн Ногтей',
      seoDesc: 'Портфолио работ по нейл-арту и эстетическому уходу уровня мастер-класса, выполненных нашей профессиональной командой.',
      headerImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2070&auto=format&fit=crop'
    }
  }
};

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      where: { pageGroup: 'SYSTEM' },
      include: { translations: true }
    });

    for (const page of pages) {
      for (const trans of page.translations) {
        const d = seoData[trans.slug]?.[trans.language] || seoData['']?.[trans.language];
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
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Çok dilli SEO verileri başarıyla güncellendi' });
  } catch (error: any) {
    console.error('Setup SEO Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
