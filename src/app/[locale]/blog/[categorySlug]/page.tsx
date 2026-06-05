import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Language } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string; categorySlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale, categorySlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;

  const translation = await prisma.blogCategoryTranslation.findFirst({
    where: { slug: categorySlug, language: languageEnum }
  });

  if (!translation) {
    return { title: 'Kategori Bulunamadı' };
  }

  return {
    title: translation.seoTitle || `${translation.name} | Nails & Lashes Studio Blog`,
    description: translation.seoDesc || `${translation.name} hakkındaki tüm blog yazılarımız.`,
    alternates: {
      canonical: `https://nailslashesstudio.com/${locale}/blog/${categorySlug}`
    }
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const { locale, categorySlug } = resolvedParams;
  const languageEnum = locale.toUpperCase() as Language;

  const categoryTranslation = await prisma.blogCategoryTranslation.findFirst({
    where: { slug: categorySlug, language: languageEnum },
    include: {
      category: {
        include: {
          posts: {
            include: {
              post: {
                include: {
                  translations: { where: { language: languageEnum } }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!categoryTranslation) {
    notFound();
  }

  const posts = categoryTranslation.category.posts
    .map(p => p.post)
    .filter(post => post.isActive && !post.isDeleted);

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
        "name": locale === 'tr' ? 'Blog' : 'Blog',
        "item": `https://nailslashesstudio.com/${locale}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": categoryTranslation.name,
        "item": `https://nailslashesstudio.com/${locale}/blog/${categorySlug}`
      }
    ]
  };

  return (
    <main className="min-h-screen bg-[#faf8f7] pt-32 pb-24 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-5xl mx-auto px-6 z-10 relative">
        <Link 
          href={`/${locale}/blog`} 
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[var(--color-rose-700)] font-bold text-xs uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Tüm Yazılara Dön
        </Link>

        {/* Kategori Bilgisi */}
        <div className="mb-12">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[var(--color-rose-700)] bg-[var(--color-rose-50)] px-3.5 py-1 rounded-full mb-3">
            Kategori
          </span>
          <h1 className="text-3xl md:text-5xl font-serif italic font-bold text-gray-950 leading-tight">
            {categoryTranslation.name}
          </h1>
          {categoryTranslation.description && (
            <p className="text-gray-500 text-sm md:text-base mt-4 leading-relaxed max-w-2xl">
              {categoryTranslation.description}
            </p>
          )}
        </div>

        {/* Blog Yazıları Grid */}
        {posts.length === 0 ? (
          <div className="text-center p-12 bg-white border border-dashed border-gray-200 rounded-3xl text-gray-400 text-sm">
            Bu kategoriye ait yayınlanmış yazı bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => {
              const trans = post.translations[0];
              if (!trans) return null;
              
              return (
                <article key={post.id} className="bg-white rounded-[2rem] border border-[var(--color-rose-100)] hover:border-[var(--color-rose-300)] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group h-[450px]">
                  <div>
                    {/* Görsel */}
                    <div className="h-56 relative bg-gray-100 overflow-hidden">
                      <img
                        src={post.image || '/images/luxury_salon_hero.png'}
                        alt={trans.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="font-serif font-bold text-lg text-gray-950 mb-2.5 group-hover:text-[var(--color-rose-700)] transition-colors line-clamp-2">
                        {trans.title}
                      </h3>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                        {trans.excerpt || ''}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex justify-between items-center text-[10px] font-bold text-gray-400 border-t border-gray-50 mt-auto">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(locale) : ''}
                    </span>
                    <Link
                      href={`/${locale}/blog/${categorySlug}/${trans.slug}`}
                      className="px-4 py-2 bg-gray-950 hover:bg-black text-white text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm"
                    >
                      Devamını Oku
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
