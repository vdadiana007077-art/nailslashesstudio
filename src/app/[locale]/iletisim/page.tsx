import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { Language } from '@prisma/client';
import ContactForm from '@/components/layout/ContactForm';
import { MapPin, Phone, Mail, Clock, CalendarDays } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string }>;
};

// Dinamik SEO Tanımı
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  const titles: Record<string, string> = {
    tr: 'İletişim & Şubelerimiz | Nails & Lashes Studio',
    en: 'Contact & Branches | Nails & Lashes Studio',
    de: 'Kontakt & Filialen | Wimpern- und Nagelstudio',
    ru: 'Контакты и Филиалы | Студия Маникюра'
  };

  const descriptions: Record<string, string> = {
    tr: 'Nails & Lashes Studio Antalya şubelerimizin adres, telefon, harita bilgileri ve çalışma saatleri. Bizimle iletişime geçin veya randevunuzu oluşturun.',
    en: 'Address, phone, map information and working hours of Nails & Lashes Studio Antalya branches. Get in touch or book an appointment.',
    de: 'Adresse, Telefonnummer, Karteninformationen und Öffnungszeiten der Filialen von Nails & Lashes Studio Antalya. Kontaktieren Sie uns oder buchen Sie.',
    ru: 'Адрес, телефон, информация на карте и часы работы филиалов Nails & Lashes Studio Antalya. Свяжитесь с нами или запишитесь.'
  };

  const title = titles[locale] || titles.en;
  const desc = descriptions[locale] || descriptions.en;

  return {
    title,
    description: desc,
    alternates: {
      canonical: `https://nailslashesstudio.com/${locale}/iletisim`,
      languages: {
        'tr': `https://nailslashesstudio.com/tr/iletisim`,
        'en': `https://nailslashesstudio.com/en/iletisim`,
        'de': `https://nailslashesstudio.com/de/iletisim`,
        'ru': `https://nailslashesstudio.com/ru/iletisim`,
      }
    },
    openGraph: {
      title,
      description: desc,
      images: [{ url: 'https://nailslashesstudio.com/images/luxury_salon_hero.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
    }
  };
}

export default async function ContactPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const languageEnum = locale.toUpperCase() as Language;

  // 1. Şubeleri çalışma saatleriyle birlikte çek
  let locations: Array<{
    id: string;
    name: string;
    address: string;
    phone: string | null;
    email: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    workingHours: Array<{
      id: string;
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>;
  }> = [];
  try {
    locations = await prisma.location.findMany({
      where: { isActive: true, isDeleted: false },
      include: {
        workingHours: {
          orderBy: { dayOfWeek: 'asc' }
        }
      }
    });
  } catch (error) {
    console.error("İletişim sayfasında konum verileri çekilemedi:", error);
  }

  // Gün isimleri çevirileri
  const dayNames: Record<string, string[]> = {
    tr: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  };

  const currentDayNames = dayNames[locale] || dayNames.en;

  // Structured Data: BeautySalon (LocalBusiness) Schema
  const businessSchemas = locations.map(loc => ({
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": `Nails & Lashes Studio - ${loc.name}`,
    "image": "https://nailslashesstudio.com/images/luxury_salon_hero.png",
    "priceRange": "₺₺",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": loc.address,
      "addressLocality": "Antalya",
      "addressCountry": "TR"
    },
    "telephone": loc.phone || "+90 242 000 0000",
    "email": loc.email || "info@nailslashesstudio.com",
    "url": `https://nailslashesstudio.com/${locale}/iletisim`
  }));

  // Structured Data: BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": locale === 'tr' ? 'Ana Sayfa' : 'Home',
        "item": `https://nailslashesstudio.com/${locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": locale === 'tr' ? 'İletişim' : 'Contact',
        "item": `https://nailslashesstudio.com/${locale}/iletisim`
      }
    ]
  };

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#faf8f7]">
      {/* Schema injection */}
      {businessSchemas.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Background blobs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/5 rounded-full blur-3xl -z-10 animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-rose-300)]/5 rounded-full blur-3xl -z-10 animate-glow" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-6 z-10">
        {/* Page Title */}
        <div className="text-center mb-16">
          <span className="text-[var(--color-rose-600)] text-xs font-bold uppercase tracking-widest block mb-3">
            {locale === 'tr' ? 'BİZE ULAŞIN' : 'GET IN TOUCH'}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-gray-950 mb-4">
            {locale === 'tr' ? 'İletişim & Şubelerimiz' : 'Contact & Branches'}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {locale === 'tr'
              ? 'Şubelerimizin bilgilerini inceleyin, haritadan konum bulun veya bize mesaj göndererek bilgi talep edin.'
              : 'View our branch details, find us on the map, or send a message for your inquiries.'}
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Branches list */}
          <div className="lg:col-span-7 space-y-12">
            {locations.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-3xl text-gray-500">
                {locale === 'tr' ? 'Henüz aktif bir şube bulunmamaktadır.' : 'No active branches found.'}
              </div>
            ) : (
              locations.map((loc) => {
                // Dinamik Google Harita URL'i
                const mapQuery = encodeURIComponent(`${loc.name} ${loc.address}`);
                const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

                return (
                  <div key={loc.id} className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[var(--color-rose-500)]"></div>
                    
                    <h2 className="text-2xl font-serif font-bold text-gray-950 mb-6 flex items-center gap-2 pl-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-rose-500)]"></span>
                      {loc.name}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pl-2">
                      {/* Branch Contact Details */}
                      <div className="space-y-4 text-sm text-gray-600">
                        <div className="flex items-start gap-3">
                          <MapPin className="text-[var(--color-rose-600)] shrink-0 mt-0.5" size={18} />
                          <div>
                            <p className="font-bold text-gray-800 mb-0.5">{locale === 'tr' ? 'Adres' : 'Address'}</p>
                            <p className="leading-relaxed">{loc.address}</p>
                          </div>
                        </div>

                        {loc.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="text-[var(--color-rose-600)] shrink-0" size={18} />
                            <div>
                              <p className="font-bold text-gray-800 leading-none mb-0.5">{locale === 'tr' ? 'Telefon' : 'Phone'}</p>
                              <a href={`tel:${loc.phone}`} className="hover:text-[var(--color-rose-700)] transition-colors">{loc.phone}</a>
                            </div>
                          </div>
                        )}

                        {loc.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="text-[var(--color-rose-600)] shrink-0" size={18} />
                            <div>
                              <p className="font-bold text-gray-800 leading-none mb-0.5">E-Posta</p>
                              <a href={`mailto:${loc.email}`} className="hover:text-[var(--color-rose-700)] transition-colors">{loc.email}</a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Branch Working Hours */}
                      <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-2">
                          <Clock className="text-[var(--color-rose-600)]" size={16} />
                          {locale === 'tr' ? 'Çalışma Saatleri' : 'Working Hours'}
                        </h3>
                        {loc.workingHours.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">{locale === 'tr' ? 'Saat belirtilmemiş.' : 'Hours not specified.'}</p>
                        ) : (
                          <ul className="text-xs text-gray-600 space-y-1.5 border-l border-gray-100 pl-4">
                            {loc.workingHours.map((wh) => (
                              <li key={wh.id} className="flex justify-between gap-4">
                                <span className="font-medium text-gray-400">{currentDayNames[wh.dayOfWeek]}</span>
                                <span className="font-bold text-gray-700">
                                  {wh.isClosed 
                                    ? (locale === 'tr' ? 'Kapalı' : 'Closed') 
                                    : `${wh.openTime} - ${wh.closeTime}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Google Map Embed */}
                    <div className="w-full h-64 rounded-2xl overflow-hidden border border-[var(--color-rose-100)] bg-[#f3e5e5]/10 pl-2">
                      <iframe
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`${loc.name} Haritası`}
                      ></iframe>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Contact CRM Form */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden sticky top-32">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-rose-400)]/5 rounded-full blur-xl"></div>
              
              <h2 className="text-2xl font-serif font-bold text-gray-950 mb-2 flex items-center gap-2">
                <CalendarDays className="text-[var(--color-rose-600)]" size={22} />
                {locale === 'tr' ? 'Bize Yazın' : 'Send a Message'}
              </h2>
              <p className="text-gray-500 text-xs md:text-sm mb-6 leading-relaxed">
                {locale === 'tr'
                  ? 'Güzellik işlemlerimiz veya diğer konularla ilgili her türlü bilgi için formu doldurun, ekibimiz sizinle iletişime geçsin.'
                  : 'Fill out the form for any questions or inquiries about our services, and our team will get in touch with you.'}
              </p>

              <ContactForm locale={locale} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
