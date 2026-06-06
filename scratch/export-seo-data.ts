import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function exportData() {
  try {
    console.log("Dışa aktarım başlıyor...");

    const pages = await prisma.pageTranslation.findMany({
      select: { id: true, pageId: true, language: true, slug: true, title: true, content: true, seoTitle: true, seoDesc: true, canonical: true, ogTitle: true, ogDesc: true }
    });

    const serviceCategories = await prisma.serviceCategoryTranslation.findMany({
      select: { id: true, categoryId: true, language: true, slug: true, name: true, description: true, seoTitle: true, seoDesc: true, canonical: true, ogTitle: true, ogDesc: true }
    });

    const services = await prisma.serviceTranslation.findMany({
      select: { id: true, serviceId: true, language: true, slug: true, name: true, description: true, longDescription: true, seoTitle: true, seoDesc: true, canonical: true, ogTitle: true, ogDesc: true }
    });

    const blogPosts = await prisma.blogPostTranslation.findMany({
      select: { id: true, blogPostId: true, language: true, slug: true, title: true, excerpt: true, content: true, seoTitle: true, seoDesc: true, canonical: true, ogTitle: true, ogDesc: true }
    });

    const menuItems = await prisma.menuItemTranslation.findMany({
      select: { id: true, menuItemId: true, language: true, title: true, url: true }
    });

    const data = {
      pages,
      serviceCategories,
      services,
      blogPosts,
      menuItems
    };

    const outputPath = path.join(process.cwd(), 'scratch', 'seo-data-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`Veriler başarıyla dışa aktarıldı: ${outputPath}`);
    
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
