import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Language } from '@prisma/client';
import { Link, getPathname } from '@/i18n/routing';
import { ArrowLeft, Clock, DollarSign, Calendar, HelpCircle, ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string; categorySlug: string; serviceSlug: string }>;
};

// Dinamik SEO Metadata Oluşturma
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale, categorySlug, serviceSlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;

  const translation = await prisma.serviceTranslation.findFirst({
    where: {
      slug: serviceSlug,
      language: languageEnum,
      service: {
        isDeleted: false,
        isActive: true,
      }
    }
  });

  if (!translation) {
    return { title: 'Hizmet Bulunamadı' };
  }

  const title = translation.seoTitle || `${translation.name} | Nails & Lashes Studio`;
  const desc = translation.seoDesc || translation.description.slice(0, 160);

  return {
    title,
    description: desc,
    alternates: {
      canonical: translation.canonical || `https://nailslashesstudio.com/${locale}/services/${categorySlug}/${serviceSlug}`,
      languages: {
        'tr': `https://nailslashesstudio.com/tr/services/${categorySlug}/${serviceSlug}`,
        'en': `https://nailslashesstudio.com/en/services/${categorySlug}/${serviceSlug}`,
        'de': `https://nailslashesstudio.com/de/services/${categorySlug}/${serviceSlug}`,
        'ru': `https://nailslashesstudio.com/ru/services/${categorySlug}/${serviceSlug}`,
      }
    },
    openGraph: {
      title: translation.ogTitle || title,
      description: translation.ogDesc || desc,
      images: translation.ogImage ? [{ url: translation.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: translation.ogTitle || title,
      description: translation.ogDesc || desc,
    },
    robots: {
      index: translation.index,
      follow: translation.index,
    }
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { locale, categorySlug, serviceSlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;
  
  const t = await getTranslations('ServiceDetail');

  // Hizmet bilgilerini, kategori bilgisini ve FAQ listesini çekelim
  const translation = await prisma.serviceTranslation.findFirst({
    where: {
      slug: serviceSlug,
      language: languageEnum,
      service: {
        isDeleted: false,
        isActive: true,
        category: {
          translations: {
            some: {
              slug: categorySlug,
              language: languageEnum
            }
          }
        }
      }
    },
    include: {
      service: {
        include: {
          category: {
            include: {
              translations: {
                where: { language: languageEnum }
              }
            }
          },
          faqs: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!translation) {
    notFound();
  }

  const service = translation.service;
  const categoryName = service.category.translations[0]?.name || 'Hizmetler';

  // 1. Structured Data: Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": translation.name,
    "description": translation.description,
    "provider": {
      "@type": "BeautySalon",
      "name": "Nails & Lashes Studio",
      "telephone": "+90 242 000 0000",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Muratpaşa",
        "addressLocality": "Antalya",
        "addressCountry": "TR"
      }
    },
    "offers": {
      "@type": "Offer",
      "price": service.price.toString(),
      "priceCurrency": "TRY"
    }
  };

  // 2. Structured Data: FAQPage Schema
  const faqSchema = service.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": service.faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : null;

  // 3. Structured Data: Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": `https://nailslashesstudio.com/${locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t('backToServices'),
        "item": `https://nailslashesstudio.com${getPathname({href: '/services', locale})}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": categoryName,
        "item": `https://nailslashesstudio.com${getPathname({href: {pathname: '/services/[categorySlug]', params: {categorySlug}}, locale})}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": translation.name,
        "item": `https://nailslashesstudio.com${getPathname({href: {pathname: '/services/[categorySlug]/[serviceSlug]', params: {categorySlug, serviceSlug}}, locale})}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#faf8f7] pt-32 pb-24 relative overflow-hidden">
      {/* Structured Data Script Embed */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Decorative Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/5 rounded-full blur-3xl -z-10 animate-glow"></div>

      <div className="max-w-4xl mx-auto px-6 z-10">
        <Link 
          href="/services" 
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[var(--color-rose-700)] font-bold text-xs uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> {t('backToServices')}
        </Link>

        {/* Detail Panel */}
        <div className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-8 md:p-12 shadow-sm mb-12 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-[var(--color-rose-50)] text-[var(--color-rose-700)] rounded-full text-xs font-bold uppercase tracking-wider">
              {categoryName}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif italic font-bold text-gray-950 mb-6 leading-tight">
            {translation.name}
          </h1>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-gray-100 py-6 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="text-[var(--color-rose-600)]" size={18} />
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">{t('duration')}</p>
                <p className="font-bold text-gray-800">{service.duration} {t('minutes')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="text-[var(--color-rose-600)]" size={18} />
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">{t('price')}</p>
                <p className="font-bold text-gray-800">₺{service.price.toString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <ShieldCheck className="text-[var(--color-rose-600)]" size={18} />
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider leading-none mb-1">{t('quality')}</p>
                <p className="font-bold text-gray-800">{t('qualityText')}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none text-gray-700 leading-relaxed text-sm md:text-base mb-10">
            <p className="whitespace-pre-line">
              {translation.longDescription || translation.description}
            </p>
          </div>

          {/* CTA Booking Button */}
          <div className="flex justify-center pt-4 border-t border-gray-50">
            <Link
              href={{ pathname: '/booking', query: { serviceId: service.id } }}
              className="px-10 py-4 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-md hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Calendar size={16} />
              {t('bookNow')}
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        {service.faqs.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold text-gray-950 flex items-center gap-2 mb-4">
              <HelpCircle className="text-[var(--color-rose-600)]" size={20} />
              {t('faqTitle')}
            </h2>
            <div className="space-y-4">
              {service.faqs.map((faq) => (
                <div key={faq.id} className="bg-white border border-[var(--color-rose-100)] rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-sm md:text-base text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
