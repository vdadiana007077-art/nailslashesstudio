"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Language } from '@prisma/client';

export async function createBlogPost(formData: FormData) {
  const image = formData.get('image') as string || null;
  const authorName = formData.get('authorName') as string || null;
  const isActive = formData.get('isActive') === 'true';
  const isFeatured = formData.get('isFeatured') === 'true';

  const publishedAtStr = formData.get('publishedAt') as string;
  const publishedAt = publishedAtStr ? new Date(publishedAtStr) : (isActive ? new Date() : null);

  const categoryIds: string[] = formData.get('categoryIds') ? JSON.parse(formData.get('categoryIds') as string) : [];
  const tagIds: string[] = formData.get('tagIds') ? JSON.parse(formData.get('tagIds') as string) : [];
  const translationsRaw = formData.get('translations');

  if (!translationsRaw) {
    return { success: false, error: 'Çeviri datası yok!' };
  }

  const translationsMap = JSON.parse(translationsRaw as string);
  
  if (!translationsMap['TR'] || !translationsMap['TR'].title || !translationsMap['TR'].slug) {
    return { success: false, error: 'TR başlık ve slug zorunludur!' };
  }

  try {
    for (const lang of Object.keys(translationsMap)) {
      const tData = translationsMap[lang as Language];
      if (tData.slug) {
        const existingSlug = await prisma.blogPostTranslation.findFirst({
          where: { slug: tData.slug, language: lang as Language },
        });
        if (existingSlug) {
          return { success: false, error: `${lang} dilinde bu slug zaten kullanılıyor!` };
        }
      }
    }

    const newPost = await prisma.blogPost.create({
      data: {
        image,
        authorName,
        isActive,
        isFeatured,
        publishedAt,
      },
    });

    for (const lang of Object.keys(translationsMap)) {
      const tData = translationsMap[lang as Language];
      if (tData.title && tData.slug) {
        await prisma.blogPostTranslation.create({
          data: {
            blogPostId: newPost.id,
            language: lang as Language,
            slug: tData.slug,
            title: tData.title,
            excerpt: tData.excerpt || null,
            content: tData.content || '',
            seoTitle: tData.seoTitle || null,
            seoDesc: tData.seoDesc || null,
            canonical: tData.canonical || null,
            ogTitle: tData.ogTitle || null,
            ogDesc: tData.ogDesc || null,
            ogImage: tData.ogImage || null,
            index: tData.index !== false,
            sitemap: tData.sitemap !== false,
          }
        });
      }
    }

    revalidatePath('/[locale]/admin/blog', 'page');
    revalidatePath('/[locale]/blog', 'page');

    if (categoryIds.length > 0) {
      await prisma.blogPostCategory.createMany({
        data: categoryIds.map((catId: string) => ({
          blogPostId: newPost.id,
          categoryId: catId
        }))
      });
    }

    if (tagIds.length > 0) {
      await prisma.blogPostTag.createMany({
        data: tagIds.map((tagId: string) => ({
          blogPostId: newPost.id,
          tagId
        }))
      });
    }

    return { success: true, data: newPost };
  } catch (error: any) {
    console.error('Blog yazısı oluşturma hatası:', error);
    return { success: false, error: 'Blog yazısı oluşturulurken bir hata oluştu.' };
  }
}

export async function updateBlogPost(id: string, formData: FormData) {
  const image = formData.get('image') as string || null;
  const authorName = formData.get('authorName') as string || null;
  const isActive = formData.get('isActive') === 'true';
  const isFeatured = formData.get('isFeatured') === 'true';

  const publishedAtStr = formData.get('publishedAt') as string;
  const publishedAt = publishedAtStr ? new Date(publishedAtStr) : (isActive ? new Date() : null);

  const categoryIds: string[] = formData.get('categoryIds') ? JSON.parse(formData.get('categoryIds') as string) : [];
  const tagIds: string[] = formData.get('tagIds') ? JSON.parse(formData.get('tagIds') as string) : [];
  const translationsRaw = formData.get('translations');

  if (!translationsRaw) {
    return { success: false, error: 'Çeviri datası yok!' };
  }

  const translationsMap = JSON.parse(translationsRaw as string);

  if (!translationsMap['TR'] || !translationsMap['TR'].title || !translationsMap['TR'].slug) {
    return { success: false, error: 'TR başlık ve slug zorunludur!' };
  }

  try {
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        translations: true,
        categories: { include: { category: { include: { translations: true } } } }
      }
    });

    for (const lang of Object.keys(translationsMap)) {
      const tData = translationsMap[lang as Language];
      if (tData.slug) {
        const existingSlug = await prisma.blogPostTranslation.findFirst({
          where: {
            slug: tData.slug,
            language: lang as Language,
            NOT: { blogPostId: id },
          },
        });
        if (existingSlug) {
          return { success: false, error: `${lang} dilinde bu slug başka bir blog yazısında kullanılıyor!` };
        }
      }
    }

    await prisma.blogPost.update({
      where: { id },
      data: {
        image,
        authorName,
        isActive,
        isFeatured,
        publishedAt,
      },
    });

    for (const lang of Object.keys(translationsMap)) {
      const tData = translationsMap[lang as Language];
      if (!tData.title || !tData.slug) continue;

      const oldT = existingPost?.translations.find(t => t.language === lang);

      if (oldT && oldT.slug !== tData.slug) {
        let catSlug = 'uncategorized';
        if (existingPost?.categories && existingPost.categories.length > 0) {
          const cTrans = existingPost.categories[0].category.translations.find(ct => ct.language === lang);
          if (cTrans?.slug) catSlug = cTrans.slug;
        }

        const oldUrl = `/${lang.toLowerCase()}/blog/${catSlug}/${oldT.slug}`;
        const newUrl = `/${lang.toLowerCase()}/blog/${catSlug}/${tData.slug}`;

        await prisma.redirect.create({
          data: { oldUrl, newUrl, statusCode: 301, isActive: true }
        });
      }

      if (oldT) {
        await prisma.blogPostTranslation.update({
          where: { id: oldT.id },
          data: {
            slug: tData.slug,
            title: tData.title,
            excerpt: tData.excerpt || null,
            content: tData.content || '',
            seoTitle: tData.seoTitle || null,
            seoDesc: tData.seoDesc || null,
            canonical: tData.canonical || null,
            ogTitle: tData.ogTitle || null,
            ogDesc: tData.ogDesc || null,
            ogImage: tData.ogImage || null,
            index: tData.index !== false,
            sitemap: tData.sitemap !== false,
          }
        });
      } else {
        await prisma.blogPostTranslation.create({
          data: {
            blogPostId: id,
            language: lang as Language,
            slug: tData.slug,
            title: tData.title,
            excerpt: tData.excerpt || null,
            content: tData.content || '',
            seoTitle: tData.seoTitle || null,
            seoDesc: tData.seoDesc || null,
            canonical: tData.canonical || null,
            ogTitle: tData.ogTitle || null,
            ogDesc: tData.ogDesc || null,
            ogImage: tData.ogImage || null,
            index: tData.index !== false,
            sitemap: tData.sitemap !== false,
          }
        });
      }
    }

    await prisma.blogPostCategory.deleteMany({ where: { blogPostId: id } });
    if (categoryIds.length > 0) {
      await prisma.blogPostCategory.createMany({
        data: categoryIds.map((catId: string) => ({
          blogPostId: id,
          categoryId: catId
        }))
      });
    }

    await prisma.blogPostTag.deleteMany({ where: { blogPostId: id } });
    if (tagIds.length > 0) {
      await prisma.blogPostTag.createMany({
        data: tagIds.map((tagId: string) => ({
          blogPostId: id,
          tagId
        }))
      });
    }

    revalidatePath('/[locale]/admin/blog', 'page');
    revalidatePath('/[locale]/blog', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Blog yazısı güncelleme hatası:', error);
    return { success: false, error: 'Blog yazısı güncellenirken bir hata oluştu.' };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await prisma.blogPost.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });

    revalidatePath('/[locale]/admin/blog', 'page');
    revalidatePath('/[locale]/blog', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Blog yazısı silme hatası:', error);
    return { success: false, error: 'Blog yazısı silinirken bir hata oluştu.' };
  }
}

export async function createBlogCategory(formData: FormData) {
  const translationsRaw = formData.get('translations');
  const order = parseInt(formData.get('order') as string || '0');
  const isActive = formData.get('isActive') === 'true';

  if (!translationsRaw) return { success: false, error: 'Çeviri datası yok!' };
  const translationsMap = JSON.parse(translationsRaw as string);

  if (!translationsMap['TR'] || !translationsMap['TR'].name || !translationsMap['TR'].slug) {
    return { success: false, error: 'TR kategori adı ve slug zorunludur!' };
  }

  try {
    for (const lang of Object.keys(translationsMap)) {
      const tData = translationsMap[lang as Language];
      if (tData.slug) {
        const existingSlug = await prisma.blogCategoryTranslation.findFirst({
          where: { slug: tData.slug, language: lang as Language }
        });
        if (existingSlug) {
          return { success: false, error: `${lang} dilinde bu slug zaten kullanılıyor!` };
        }
      }
    }

    const newCategory = await prisma.blogCategory.create({
      data: { order, isActive }
    });

    for (const lang of Object.keys(translationsMap)) {
      const tData = translationsMap[lang as Language];
      if (tData.name && tData.slug) {
        await prisma.blogCategoryTranslation.create({
          data: {
            categoryId: newCategory.id,
            language: lang as Language,
            name: tData.name,
            slug: tData.slug,
            description: tData.description || null,
            seoTitle: tData.seoTitle || null,
            seoDesc: tData.seoDesc || null
          }
        });
      }
    }

    revalidatePath('/[locale]/admin/blog/categories', 'page');
    revalidatePath('/[locale]/blog', 'page');
    return { success: true, data: newCategory };
  } catch (error: any) {
    console.error('Blog kategori oluşturma hatası:', error);
    return { success: false, error: 'Kategori oluşturulurken bir hata oluştu.' };
  }
}

export async function updateBlogCategory(id: string, formData: FormData) {
  const translationsRaw = formData.get('translations');
  const order = parseInt(formData.get('order') as string || '0');
  const isActive = formData.get('isActive') === 'true';

  if (!translationsRaw) return { success: false, error: 'Çeviri datası yok!' };
  const translationsMap = JSON.parse(translationsRaw as string);

  if (!translationsMap['TR'] || !translationsMap['TR'].name || !translationsMap['TR'].slug) {
    return { success: false, error: 'TR kategori adı ve slug zorunludur!' };
  }

  try {
    const existingCat = await prisma.blogCategory.findUnique({
      where: { id },
      include: { translations: true, posts: { include: { post: { include: { translations: true } } } } }
    });

    for (const lang of Object.keys(translationsMap)) {
      const tData = translationsMap[lang as Language];
      if (tData.slug) {
        const existingSlug = await prisma.blogCategoryTranslation.findFirst({
          where: {
            slug: tData.slug,
            language: lang as Language,
            NOT: { categoryId: id }
          }
        });
        if (existingSlug) {
          return { success: false, error: `${lang} dilinde bu slug başka bir kategoride kullanılıyor!` };
        }
      }
    }

    await prisma.blogCategory.update({
      where: { id },
      data: { order, isActive }
    });

    for (const lang of Object.keys(translationsMap)) {
      const tData = translationsMap[lang as Language];
      if (!tData.name || !tData.slug) continue;

      const oldT = existingCat?.translations.find(t => t.language === lang);

      // Add redirects if category slug changed
      if (oldT && oldT.slug !== tData.slug) {
        // Redirect the category list page
        const oldCatUrl = `/${lang.toLowerCase()}/blog/${oldT.slug}`;
        const newCatUrl = `/${lang.toLowerCase()}/blog/${tData.slug}`;
        await prisma.redirect.create({
          data: { oldUrl: oldCatUrl, newUrl: newCatUrl, statusCode: 301, isActive: true }
        });

        // Also redirect all blog posts inside this category
        if (existingCat?.posts) {
          for (const relation of existingCat.posts) {
            const postT = relation.post.translations.find(t => t.language === lang);
            if (postT) {
              const oldPostUrl = `/${lang.toLowerCase()}/blog/${oldT.slug}/${postT.slug}`;
              const newPostUrl = `/${lang.toLowerCase()}/blog/${tData.slug}/${postT.slug}`;
              await prisma.redirect.create({
                data: { oldUrl: oldPostUrl, newUrl: newPostUrl, statusCode: 301, isActive: true }
              });
            }
          }
        }
      }

      if (oldT) {
        await prisma.blogCategoryTranslation.update({
          where: { id: oldT.id },
          data: {
            name: tData.name,
            slug: tData.slug,
            description: tData.description || null,
            seoTitle: tData.seoTitle || null,
            seoDesc: tData.seoDesc || null
          }
        });
      } else {
        await prisma.blogCategoryTranslation.create({
          data: {
            categoryId: id,
            language: lang as Language,
            name: tData.name,
            slug: tData.slug,
            description: tData.description || null,
            seoTitle: tData.seoTitle || null,
            seoDesc: tData.seoDesc || null
          }
        });
      }
    }

    revalidatePath('/[locale]/admin/blog/categories', 'page');
    revalidatePath('/[locale]/blog', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Blog kategori güncelleme hatası:', error);
    return { success: false, error: 'Kategori güncellenirken bir hata oluştu.' };
  }
}

export async function deleteBlogCategory(id: string) {
  try {
    await prisma.blogCategory.update({
      where: { id },
      data: { isActive: false }
    });

    revalidatePath('/[locale]/admin/blog/categories', 'page');
    revalidatePath('/[locale]/blog', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Blog kategori silme hatası:', error);
    return { success: false, error: 'Kategori silinirken bir hata oluştu.' };
  }
}
