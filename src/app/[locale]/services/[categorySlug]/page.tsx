import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Language } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, HelpCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string; categorySlug: string }>;
};

// Dinamik SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale, categorySlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;

  const categoryTranslation = await prisma.serviceCategoryTranslation.findFirst({
    where: { 
      slug: categorySlug,
      language: languageEnum
    }
  });

  if (!categoryTranslation) {
    return { title: 'Kategori Bulunamadı' };
  }

  return {
    title: categoryTranslation.seoTitle || `${categoryTranslation.name} | Nails & Lashes Studio`,
    description: categoryTranslation.seoDesc || categoryTranslation.description || `${categoryTranslation.name} kategori detayları.`,
    alternates: {
      canonical: categoryTranslation.canonical || `https://nailslashesstudio.com/${locale}/services/${categorySlug}`
    },
    openGraph: {
      title: categoryTranslation.ogTitle || categoryTranslation.name,
      description: categoryTranslation.ogDesc || '',
      images: categoryTranslation.ogImage ? [{ url: categoryTranslation.ogImage }] : [],
    }
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { locale, categorySlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;

  const categoryTranslation = await prisma.serviceCategoryTranslation.findFirst({
    where: { slug: categorySlug, language: languageEnum },
    include: {
      category: {
        include: {
          services: {
            where: { isDeleted: false, isActive: true },
            include: {
              translations: { where: { language: languageEnum } }
            }
          }
        }
      }
    }
  });

  if (!categoryTranslation) {
    notFound();
  }

  const { name, description } = categoryTranslation;
  const services = categoryTranslation.category.services;
  const t = await getTranslations({ locale, namespace: 'CategoryDetail' });

  // Structured Data: Breadcrumb Schema
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
        "name": "Hizmetler",
        "item": `https://nailslashesstudio.com/${locale}/services`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": name,
        "item": `https://nailslashesstudio.com/${locale}/services/${categorySlug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#faf8f7] pt-32 pb-24 relative overflow-hidden">
      {/* Structured Data Script Embed */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Decorative Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-rose-400)]/5 rounded-full blur-3xl -z-10 animate-glow"></div>

      <div className="max-w-4xl mx-auto px-6 z-10">
        <Link 
          href={`/${locale}/services`} 
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[var(--color-rose-700)] font-bold text-xs uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> {t('backToAllServices')}
        </Link>

        {/* Category Info */}
        <div className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-8 md:p-12 shadow-sm mb-12">
          <h1 className="text-3xl md:text-4xl font-serif italic font-bold text-gray-950 mb-4">{name}</h1>
          {description && (
            <div className="text-gray-600 text-sm md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: description }} />
          )}
        </div>

        {/* Services List */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">{t('servicesInCategory')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-3xl p-6 border border-[var(--color-rose-100)] hover:border-[var(--color-rose-300)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-bold text-base text-gray-950 group-hover:text-[var(--color-rose-700)] transition-colors">
                      {service.translations[0]?.name || 'İsimsiz Hizmet'}
                    </h3>
                    <span className="font-black text-[var(--color-rose-600)] text-base">₺{service.price.toString()}</span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed mb-6">
                    {service.translations[0]?.description || ''}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <Clock size={12} /> {service.duration} {t('minutes')}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/${locale}/services/${categorySlug}/${service.translations[0]?.slug}`}
                      className="py-2 rounded-xl text-center text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {t('examineDetails')}
                    </Link>
                    <Link
                      href={`/${locale}/booking?serviceId=${service.id}`}
                      className="py-2 rounded-xl text-center text-xs font-bold bg-gray-900 text-white hover:bg-black transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar size={12} /> {t('quickBooking')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
              {t('noServicesInCategory')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
