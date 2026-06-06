import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Language } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, HelpCircle, Sparkles, Scissors, Clock } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string; categorySlug: string; postSlug: string }>;
};

// Dinamik SEO Metadata Oluşturma
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale, categorySlug, postSlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;

  const translation = await prisma.blogPostTranslation.findFirst({
    where: {
      slug: postSlug,
      language: languageEnum,
      blogPost: {
        isDeleted: false,
        isActive: true,
      }
    }
  });

  if (!translation) {
    return { title: 'Makale Bulunamadı' };
  }

  const title = translation.seoTitle || `${translation.title} | Nails & Lashes Studio`;
  const desc = translation.seoDesc || translation.excerpt || translation.content.slice(0, 160);

  return {
    title,
    description: desc,
    alternates: {
      canonical: translation.canonical || `https://nailslashesstudio.com/${locale}/blog/${categorySlug}/${postSlug}`,
      languages: {
        'tr': `https://nailslashesstudio.com/tr/blog/${categorySlug}/${postSlug}`,
        'en': `https://nailslashesstudio.com/en/blog/${categorySlug}/${postSlug}`,
        'de': `https://nailslashesstudio.com/de/blog/${categorySlug}/${postSlug}`,
        'ru': `https://nailslashesstudio.com/ru/blog/${categorySlug}/${postSlug}`,
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

export default async function BlogPostDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { locale, categorySlug, postSlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;

  // Blog makalesini, kategori ve ilişkili verileri çekelim
  const translation = await prisma.blogPostTranslation.findFirst({
    where: {
      slug: postSlug,
      language: languageEnum,
      blogPost: {
        isDeleted: false,
        isActive: true,
        categories: {
          some: {
            category: {
              translations: {
                some: {
                  slug: categorySlug,
                  language: languageEnum
                }
              }
            }
          }
        }
      }
    },
    include: {
      blogPost: {
        include: {
          categories: {
            include: {
              category: {
                include: {
                  translations: {
                    where: { language: languageEnum }
                  }
                }
              }
            }
          },
          faqs: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          relatedServices: {
            include: {
              service: {
                include: {
                  translations: {
                    where: { language: languageEnum }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!translation) {
    notFound();
  }

  const post = translation.blogPost;
  const categoryTranslation = post.categories[0]?.category.translations[0];
  const categoryName = categoryTranslation?.name || 'Güzellik';

  // Benzer yazıları çek (Aynı kategorideki diğer son 3 yazı)
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      id: { not: post.id },
      categories: {
        some: {
          categoryId: post.categories[0]?.categoryId
        }
      }
    },
    include: {
      translations: {
        where: { language: languageEnum }
      },
      categories: {
        include: {
          category: {
            include: {
              translations: {
                where: { language: languageEnum }
              }
            }
          }
        }
      }
    },
    take: 3,
    orderBy: { publishedAt: 'desc' }
  });

  // Structured Data: Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": translation.title,
    "image": [
      post.image || "https://nailslashesstudio.com/images/default-blog.jpg"
    ],
    "datePublished": post.publishedAt ? post.publishedAt.toISOString() : post.createdAt.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "author": [{
      "@type": "Person",
      "name": post.authorName || "Nails & Lashes Studio",
      "jobTitle": "Güzellik Uzmanı"
    }]
  };

  // Structured Data: FAQPage Schema
  const faqSchema = post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map(f => ({
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
        "name": locale === 'tr' ? 'Ana Sayfa' : 'Home',
        "item": `https://nailslashesstudio.com/${locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": 'Blog',
        "item": `https://nailslashesstudio.com/${locale}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": categoryName,
        "item": `https://nailslashesstudio.com/${locale}/blog/${categorySlug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": translation.title,
        "item": `https://nailslashesstudio.com/${locale}/blog/${categorySlug}/${postSlug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#faf8f7] pt-32 pb-24 relative overflow-hidden">
      {/* Structured Data Script Embed */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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
          href={`/${locale}/blog`} 
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[var(--color-rose-700)] font-bold text-xs uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Blog Listesine Geri Dön
        </Link>

        {/* Article Container */}
        <article className="bg-white border border-[var(--color-rose-100)] rounded-3xl overflow-hidden shadow-sm mb-12">
          {/* Main Image */}
          {post.image && (
            <div className="w-full h-[350px] relative bg-gray-50 border-b border-gray-100">
              <img src={post.image} alt={translation.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-8 md:p-12">
            <span className="px-3 py-1 bg-[var(--color-rose-50)] text-[var(--color-rose-700)] rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
              {categoryName}
            </span>

            <h1 className="text-3xl md:text-4xl font-serif italic font-bold text-gray-950 mb-6 leading-tight">
              {translation.title}
            </h1>

            {/* Author & Date metadata */}
            <div className="flex items-center gap-6 text-xs text-gray-400 font-bold border-y border-gray-100 py-4 mb-8">
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-[var(--color-rose-600)]" /> {post.authorName || 'Nails & Lashes Studio'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--color-rose-600)]" /> 
                {post.publishedAt 
                  ? new Date(post.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Excerpt */}
            {translation.excerpt && (
              <p className="text-base text-gray-500 italic border-l-4 border-[var(--color-rose-300)] pl-4 mb-8 leading-relaxed">
                {translation.excerpt}
              </p>
            )}

            {/* Rich Content */}
            <div className="prose max-w-none text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {translation.content}
            </div>
          </div>
        </article>

        {/* Related Services Segment */}
        {post.relatedServices.length > 0 && (
          <div className="bg-white border border-[var(--color-rose-100)] rounded-3xl p-8 shadow-sm mb-12">
            <h3 className="font-serif italic font-bold text-lg text-gray-950 mb-6 flex items-center gap-2">
              <Scissors size={18} className="text-[var(--color-rose-600)]" />
              Yazıda Geçen Hizmetlerimiz
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.relatedServices.map(({ service }: any) => {
                const sTrans = service.translations[0];
                return (
                  <div key={service.id} className="p-4 rounded-2xl border border-gray-100 hover:border-[var(--color-rose-200)] transition-all flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{sTrans?.name || 'Hizmet'}</h4>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={12} /> {service.duration} dk | ₺{service.price.toString()}
                      </p>
                    </div>
                    <Link
                      href={`/${locale}/booking?serviceId=${service.id}`}
                      className="px-4 py-2 bg-[var(--color-rose-50)] text-[var(--color-rose-700)] hover:bg-[var(--color-rose-100)] transition-colors rounded-xl text-xs font-bold"
                    >
                      Randevu
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQs */}
        {post.faqs.length > 0 && (
          <div className="space-y-6 mb-12">
            <h2 className="text-xl font-serif font-bold text-gray-950 flex items-center gap-2 mb-4">
              <HelpCircle className="text-[var(--color-rose-600)]" size={20} />
              Sıkça Sorulan Sorular
            </h2>
            <div className="space-y-4">
              {post.faqs.map((faq: any) => (
                <div key={faq.id} className="bg-white border border-[var(--color-rose-100)] rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-sm md:text-base text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Blog Posts (Grid) */}
        {relatedPosts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-gray-950 flex items-center gap-2 mb-4">
              <Sparkles className="text-[var(--color-rose-600)]" size={20} />
              İlginizi Çekebilecek Diğer Yazılar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map(rel => {
                const trans = rel.translations[0];
                const catSlug = rel.categories[0]?.category.translations[0]?.slug || 'beauty';
                return (
                  <Link 
                    key={rel.id}
                    href={`/${locale}/blog/${catSlug}/${trans?.slug}`}
                    className="bg-white border border-[var(--color-rose-100)] rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[var(--color-rose-200)] transition-all flex flex-col group"
                  >
                    {rel.image && (
                      <div className="h-28 rounded-xl overflow-hidden bg-gray-50 mb-3">
                        <img src={rel.image} alt={trans?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <h4 className="font-bold text-xs md:text-sm text-gray-950 group-hover:text-[var(--color-rose-700)] transition-colors line-clamp-2 leading-snug">
                      {trans?.title}
                    </h4>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
