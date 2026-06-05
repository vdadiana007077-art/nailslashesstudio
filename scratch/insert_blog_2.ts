import { Language } from '@prisma/client';
import fs from 'fs';
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const contentPath = 'C:\\Users\\Bozel\\.gemini\\antigravity-ide\\brain\\9642606d-5d8f-41c6-8391-7d194baa764f\\blog_jel_guclendirme_tr.md';
  const content = fs.readFileSync(contentPath, 'utf8');

  // Strip H1 from content for excerpt
  const lines = content.split('\n');
  const h1 = lines[0].replace('# ', '');
  const excerpt = lines.find(line => line.length > 50 && !line.startsWith('#')) || '';

  // Get or Create Tırnak Bakımı Category
  let category = await prisma.blogCategory.findFirst({
    where: { translations: { some: { slug: 'tirnak-bakimi' } } }
  });

  // Create Media Item if not exists
  const imageUrl = '/images/blog/luxury_gel_nails_blog_cover.png';
  let mediaItem = await prisma.mediaItem.findUnique({ where: { url: imageUrl } });
  if (!mediaItem) {
    mediaItem = await prisma.mediaItem.create({
      data: {
        url: imageUrl,
        title: 'Lüks Jel Tırnak',
        altText: 'Lüks güzellik salonunda jel tırnak ve protez uygulaması',
        fileName: 'luxury_gel_nails_blog_cover.png',
        fileSize: 1024000,
        mimeType: 'image/png'
      }
    });
  }

  // Find related services to link (Gel, Protez vs, if they exist)
  const jelService = await prisma.serviceTranslation.findFirst({
    where: { slug: 'jel-guclendirme' } // Assuming this slug exists or similar
  });
  
  const kaliciOjeService = await prisma.serviceTranslation.findFirst({
    where: { slug: 'kalici-oje' } 
  });

  const blogPost = await prisma.blogPost.create({
    data: {
      image: imageUrl,
      authorName: 'Uzman Ekip',
      isFeatured: false,
      publishedAt: new Date(),
      translations: {
        create: {
          language: Language.TR,
          title: 'Jel Güçlendirme mi, Protez Tırnak mı? İhtiyacınıza En Uygun Yöntemi Seçme Rehberi',
          slug: 'jel-guclendirme-mi-protez-tirnak-mi-rehber',
          excerpt: excerpt.substring(0, 200) + '...',
          content: content,
          seoTitle: 'Jel Güçlendirme ve Protez Tırnak Farkları | Tırnak Bakım Rehberi',
          seoDesc: 'Jel güçlendirme ve protez tırnak arasındaki farklar nelerdir? Hangisi size uygun? Sağlıklı ve uzun tırnaklar için uzman rehberimizi inceleyin.',
          ogImage: imageUrl,
        }
      },
      categories: {
        create: {
          categoryId: category!.id
        }
      },
      faqs: {
        create: [
          {
            language: Language.TR,
            question: 'Jel güçlendirme protez tırnak kadar sert midir?',
            answer: 'Jel güçlendirme, özel formülü sayesinde doğal tırnak ile birlikte esneyebilen kauçuk yapılı bir sertliğe sahiptir. Darbelerde esner ve şoku emer. Protez tırnak ise daha sert ve rijit bir yapıdadır.',
            order: 1
          },
          {
            language: Language.TR,
            question: 'Kısa tırnaklara jel güçlendirme yapılır mı?',
            answer: 'Kesinlikle! Tırnaklarınız etinizin hizasında, çok kısa olsa bile yapılabilir. Kısa ve form bozukluğu olan tırnaklar jel dolgusu ile anında pürüzsüz ve sağlıklı bir görünüme kavuşur.',
            order: 2
          },
          {
            language: Language.TR,
            question: 'Evde bulaşık yıkamak veya temizlik yapmak jeli bozar mı?',
            answer: 'UV lambada kuruyan polimer jeller ev tipi deterjanlara ve suya karşı tamamen dirençlidir. Ancak tırnak ve cilt sağlığınız için kimyasal maddelerle temas ederken eldiven kullanmanız tavsiye edilir.',
            order: 3
          }
        ]
      }
    }
  });

  if (jelService) {
    await prisma.blogPostService.create({
      data: {
        blogPostId: blogPost.id,
        serviceId: jelService.serviceId
      }
    });
  }

  if (kaliciOjeService) {
    await prisma.blogPostService.create({
      data: {
        blogPostId: blogPost.id,
        serviceId: kaliciOjeService.serviceId
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
