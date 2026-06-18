import { prisma } from './src/lib/prisma';

const categoryData = {
  'tirnak-bakimi': {
    TR: { name: 'Tırnak Bakımı', slug: 'tirnak-bakimi', description: 'Elleriniz ve tırnaklarınız için premium bakım ve yenilenme terapisi.', seoTitle: 'Tırnak Bakımı | Spa ve Yenilenme', seoDesc: 'Tırnak sağlığınız için özel spa bakımı, güçlendirme ve nemlendirme ritüellerimiz.' },
    EN: { name: 'Nail Care', slug: 'nail-care', description: 'Premium care and renewal therapy for your hands and nails.', seoTitle: 'Nail Care | Spa & Renewal', seoDesc: 'Special spa care, strengthening, and moisturizing rituals for your nail health.' },
    DE: { name: 'Nagelpflege', slug: 'nagelpflege', description: 'Premium-Pflege und Erneuerungstherapie für Ihre Hände und Nägel.', seoTitle: 'Nagelpflege | Spa & Erneuerung', seoDesc: 'Spezielle Spa-Pflege, Stärkung und feuchtigkeitsspendende Rituale für Ihre Nägel.' },
    RU: { name: 'Уход за ногтями', slug: 'uhod-za-nogtyami', description: 'Премиум-уход и восстанавливающая терапия для ваших рук и ногтей.', seoTitle: 'Уход за ногтями | Спа и Восстановление', seoDesc: 'Специальный спа-уход, укрепляющие и увлажняющие ритуалы для здоровья ногтей.' }
  },
  'manikur-pedikur': {
    TR: { name: 'Manikür & Pedikür', slug: 'manikur-pedikur', description: 'Profesyonel eller ve ayaklar için lüks bakım, tırnak şekillendirme ve kalıcı oje uygulamaları.', seoTitle: 'Lüks Manikür ve Pedikür Hizmetleri', seoDesc: 'Hijyenik ortamda profesyonel uzmanlar tarafından uygulanan spa manikür ve pedikür hizmetlerimiz.' },
    EN: { name: 'Manicure & Pedicure', slug: 'manicure-pedicure', description: 'Luxury care for hands and feet, nail shaping, and gel polish applications.', seoTitle: 'Luxury Manicure and Pedicure Services', seoDesc: 'Spa manicure and pedicure services applied by professionals in a hygienic environment.' },
    DE: { name: 'Maniküre & Pediküre', slug: 'manikuere-pedikuere', description: 'Luxuriöse Pflege für Hände und Füße, Nagelformung und Gellack-Anwendungen.', seoTitle: 'Luxus Maniküre und Pediküre', seoDesc: 'Spa-Maniküre und Pediküre von professionellen Experten in hygienischer Umgebung.' },
    RU: { name: 'Маникюр и педикюр', slug: 'manikyur-i-pedikyur', description: 'Роскошный уход за руками и ногами, придание формы ногтям и покрытие гель-лаком.', seoTitle: 'Роскошный Маникюр и Педикюр', seoDesc: 'Спа-маникюр и педикюр от профессионалов в гигиенической обстановке.' }
  },
  'kirpik-ve-kas': {
    TR: { name: 'Kirpik ve Kaş', slug: 'kirpik-ve-kas', description: 'Yüz hatlarınızı altın orana kavuşturan, etkileyici bakışlar için profesyonel tasarım.', seoTitle: 'Kirpik ve Kaş Tasarımı | Lifting', seoDesc: 'Laminasyon, lifting, kaş tasarımı ve boyama işlemleri ile doğal ve çarpıcı bakışlara sahip olun.' },
    EN: { name: 'Lashes & Brows', slug: 'lashes-and-brows', description: 'Professional design for impressive looks, bringing your facial features to the perfect harmony.', seoTitle: 'Lash and Brow Design | Lifting', seoDesc: 'Get natural and stunning looks with lamination, lifting, brow design, and tinting.' },
    DE: { name: 'Wimpern & Augenbrauen', slug: 'wimpern-und-augenbrauen', description: 'Professionelles Design für eindrucksvolle Blicke und perfekte Gesichtszüge.', seoTitle: 'Wimpern- und Augenbrauendesign | Lifting', seoDesc: 'Erhalten Sie natürliche und atemberaubende Blicke durch Lamination, Lifting und Färben.' },
    RU: { name: 'Ресницы и брови', slug: 'resnitsy-i-brovi', description: 'Профессиональный дизайн для выразительного взгляда и идеальных черт лица.', seoTitle: 'Дизайн ресниц и бровей | Лифтинг', seoDesc: 'Естественный и потрясающий взгляд с помощью ламинирования, лифтинга и окрашивания.' }
  },
  'ipek-kirpik': {
    TR: { name: 'İpek Kirpik', slug: 'ipek-kirpik', description: 'Doğal görünümden mega volume kadar zengin ve etkileyici bakışlar için profesyonel ipek kirpik uygulamaları.', seoTitle: 'İpek Kirpik Uygulaması | Klasik & Volume', seoDesc: 'Göz yapınıza en uygun klasik, hibrit, russian volume ipek kirpik seçeneklerimiz.' },
    EN: { name: 'Eyelash Extensions', slug: 'eyelash-extensions', description: 'Professional eyelash extensions for a rich and impressive look, from natural to mega volume.', seoTitle: 'Eyelash Extensions | Classic & Volume', seoDesc: 'Classic, hybrid, and Russian volume eyelash extension options tailored to your eye shape.' },
    DE: { name: 'Wimpernverlängerung', slug: 'wimpernverlaengerung', description: 'Professionelle Wimpernverlängerungen für einen atemberaubenden und voluminösen Look.', seoTitle: 'Wimpernverlängerung | Classic & Volume', seoDesc: 'Klassische, Hybrid- und Russian Volume Wimpernverlängerungen passend zu Ihrer Augenform.' },
    RU: { name: 'Наращивание ресниц', slug: 'naraschivanie-resnits', description: 'Профессиональное наращивание ресниц для выразительного взгляда, от естественного до мега-объема.', seoTitle: 'Наращивание ресниц | Классика и Объем', seoDesc: 'Классическое, гибридное и русское объемное наращивание, подобранное под форму глаз.' }
  },
  'kas-kirpik-bakimi': {
    TR: { name: 'Kaş & Kirpik Bakımı', slug: 'kas-kirpik-bakimi', description: 'Yüz hatlarına özel kaş alımı, kaş liftingi, kirpik liftingi ve boya uygulamalarıyla doğal güzelliğinizi ön plana çıkarın.', seoTitle: 'Kaş ve Kirpik Bakımı | Estetik Dokunuş', seoDesc: 'Uzmanlarımız eşliğinde kaş ve kirpiklerinize uygulanan keratin bakım ve lifting işlemleri.' },
    EN: { name: 'Brow & Lash Care', slug: 'brow-and-lash-care', description: 'Highlight your natural beauty with brow shaping, lifting, and tinting applied to your facial features.', seoTitle: 'Brow and Lash Care | Aesthetic Touch', seoDesc: 'Keratin care and lifting procedures applied to your brows and lashes by our experts.' },
    DE: { name: 'Brauen- & Wimpernpflege', slug: 'brauen-und-wimpernpflege', description: 'Heben Sie Ihre natürliche Schönheit mit speziellem Augenbrauen- und Wimpernlifting hervor.', seoTitle: 'Brauen- und Wimpernpflege | Ästhetik', seoDesc: 'Keratin-Pflege und Lifting-Verfahren für Ihre Brauen und Wimpern von unseren Experten.' },
    RU: { name: 'Уход за бровями и ресницами', slug: 'uhod-za-brovyami-i-resnitsami', description: 'Подчеркните свою естественную красоту с помощью коррекции бровей, лифтинга и окрашивания.', seoTitle: 'Уход за бровями и ресницами | Эстетика', seoDesc: 'Кератиновый уход и лифтинг бровей и ресниц от наших специалистов.' }
  }
};

async function fixCategories() {
  const categories = await prisma.serviceCategory.findMany({
    include: { translations: true }
  });

  for (const cat of categories) {
    const trTrans = cat.translations.find((t: any) => t.language === 'TR');
    if (!trTrans) continue;
    
    const contentSet: any = categoryData[trTrans.slug as keyof typeof categoryData];
    if (!contentSet) continue;

    for (const lang of ['EN', 'DE', 'RU']) {
      const trans = cat.translations.find((t: any) => t.language === lang);
      const data = contentSet[lang];
      
      if (trans && data) {
        await prisma.serviceCategoryTranslation.update({
          where: { id: trans.id },
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            seoTitle: data.seoTitle,
            seoDesc: data.seoDesc
          }
        });
        console.log(`Updated ${lang} for ${trTrans.slug}`);
      }
    }
  }
  console.log('Categories updated!');
}

fixCategories().catch(console.error);
