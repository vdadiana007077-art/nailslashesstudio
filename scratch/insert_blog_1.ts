import { Language } from '@prisma/client';
import fs from 'fs';
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const contentPath = 'C:\\Users\\Bozel\\.gemini\\antigravity-ide\\brain\\9642606d-5d8f-41c6-8391-7d194baa764f\\blog_tirnak_bakim_rehberi_tr.md';
  const content = fs.readFileSync(contentPath, 'utf8');

  // Strip H1 from content for excerpt
  const lines = content.split('\n');
  const h1 = lines[0].replace('# ', '');
  const excerpt = lines.find(line => line.length > 50 && !line.startsWith('#')) || '';

  // Get or Create Tırnak Bakımı Category
  let category = await prisma.blogCategory.findFirst({
    where: { translations: { some: { slug: 'tirnak-bakimi' } } }
  });

  if (!category) {
    category = await prisma.blogCategory.create({
      data: {
        translations: {
          create: {
            language: Language.TR,
            name: 'Tırnak Bakımı',
            slug: 'tirnak-bakimi',
            description: 'Profesyonel tırnak bakımı, manikür, pedikür ve kalıcı oje rehberleri.',
            seoTitle: 'Tırnak Bakımı Rehberi ve Püf Noktaları | Beauty Studio',
            seoDesc: 'En güncel tırnak bakımı sırları, manikür ve pedikür önerileri.'
          }
        }
      }
    });
  }

  // Create Media Item if not exists
  const imageUrl = '/images/blog/luxury_nail_care_blog_cover.png';
  let mediaItem = await prisma.mediaItem.findUnique({ where: { url: imageUrl } });
  if (!mediaItem) {
    mediaItem = await prisma.mediaItem.create({
      data: {
        url: imageUrl,
        title: 'Lüks Tırnak Bakımı',
        altText: 'Lüks güzellik salonunda tırnak bakımı',
        fileName: 'luxury_nail_care_blog_cover.png',
        fileSize: 1024000,
        mimeType: 'image/png'
      }
    });
  }

  // Find related services to link (Manicure, Pedicure)
  const manicurService = await prisma.serviceTranslation.findFirst({
    where: { slug: 'manikur-sade' }
  });

  const pedicurService = await prisma.serviceTranslation.findFirst({
    where: { slug: 'pedikur-sade' }
  });

  const blogPost = await prisma.blogPost.create({
    data: {
      image: imageUrl,
      authorName: 'Uzman Ekip',
      isFeatured: true,
      publishedAt: new Date(),
      translations: {
        create: {
          language: Language.TR,
          title: 'Tırnak Bakım Rehberi: Kusursuz Manikür ve Pedikür',
          slug: 'tirnak-bakim-rehberi-kusursuz-manikur-pedikur',
          excerpt: excerpt.substring(0, 200) + '...',
          content: content,
          seoTitle: 'Tırnak Bakım Rehberi: Kusursuz Manikür, Pedikür ve Güzellik Sırları',
          seoDesc: 'Profesyonel manikür, pedikür, kalıcı oje ve jel güçlendirme uygulamaları hakkında bilmeniz gereken her şey. Kapsamlı tırnak bakım rehberimizi okuyun.',
          ogImage: imageUrl,
        }
      },
      categories: {
        create: {
          categoryId: category.id
        }
      },
      faqs: {
        create: [
          {
            language: Language.TR,
            question: 'Kalıcı oje ve protez tırnak abdest geçirir mi?',
            answer: 'Geleneksel ojeler ve kalıcı ojeler tırnak yüzeyinde su geçirmez polimer bir tabaka oluşturur. Dini inançları gereği abdest ibadetini yerine getiren kadınlar için su geçirgen (halal) veya Japon manikürü yöntemlerini tavsiye ediyoruz.',
            order: 1
          },
          {
            language: Language.TR,
            question: 'Hamilelik döneminde kalıcı oje veya protez tırnak yaptırılabilir mi?',
            answer: 'Modern kokusuz jel sistemleri ve kalıcı oje uygulamaları hamileler için büyük ölçüde güvenli kabul edilir. Ancak ilk 3 ayı geçirdikten sonra ve hekiminizin de onayıyla yaptırmanız en doğrusudur.',
            order: 2
          },
          {
            language: Language.TR,
            question: 'Tırnağımda mantar enfeksiyonu varken kalıcı oje yaptırabilir miyim?',
            answer: 'Kesinlikle hayır. Tırnak mantarı tedavi edilmesi gereken medikal bir durumdur. Mantarlı bir tırnağın üzeri jel veya kalıcı oje ile kapatıldığında enfeksiyon diğer tırnaklara sıçrayabilir.',
            order: 3
          }
        ]
      }
    }
  });

  if (manicurService) {
    await prisma.blogPostService.create({
      data: {
        blogPostId: blogPost.id,
        serviceId: manicurService.serviceId
      }
    });
  }

  if (pedicurService) {
    await prisma.blogPostService.create({
      data: {
        blogPostId: blogPost.id,
        serviceId: pedicurService.serviceId
      }
    });
  }

  console.log('Blog post successfully inserted: ' + blogPost.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
