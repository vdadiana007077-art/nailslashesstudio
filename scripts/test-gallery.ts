import { prisma } from '../src/lib/prisma';
import fs from 'fs';

async function main() {
  console.log('--- VERITABANI DENETIMI ---');
  const catCount = await prisma.galleryCategory.count();
  const catTransCount = await prisma.galleryCategoryTranslation.count();
  const itemCount = await prisma.galleryItem.count();
  const itemTransCount = await prisma.galleryItemTranslation.count();

  console.log(`GalleryCategory kayıt sayısı: ${catCount}`);
  console.log(`GalleryCategoryTranslation kayıt sayısı: ${catTransCount}`);
  console.log(`GalleryItem kayıt sayısı: ${itemCount}`);
  console.log(`GalleryItemTranslation kayıt sayısı: ${itemTransCount}`);

  console.log('\n--- PUBLIC & MEDYA TESTI KONTROLLERI ---');
  
  // Check if categories are active and not deleted
  const activeCats = await prisma.galleryCategory.count({ where: { isActive: true, isDeleted: false } });
  console.log(`Aktif ve silinmemiş kategoriler: ${activeCats} / ${catCount}`);

  // Check if images are active and not deleted
  const activeItems = await prisma.galleryItem.count({ where: { isActive: true, isDeleted: false } });
  console.log(`Aktif ve silinmemiş fotoğraflar: ${activeItems} / ${itemCount}`);

  // Perform a test insert, update, soft delete
  console.log('\n--- ADMIN TEST SIMULASYONU ---');
  try {
    const testCat = await prisma.galleryCategory.create({
      data: {
        isActive: true,
        order: 99,
        translations: {
          create: [
            { language: 'TR', name: 'Test Kategori', slug: 'test-kategori', description: 'Test', seoTitle: 'Test Title' }
          ]
        }
      }
    });
    console.log(`Kategori eklendi: ID ${testCat.id}`);
    
    await prisma.galleryCategory.update({
      where: { id: testCat.id },
      data: { isActive: false, order: 100 }
    });
    console.log(`Kategori güncellendi (pasif yapıldı)`);
    
    await prisma.galleryCategory.update({
      where: { id: testCat.id },
      data: { isDeleted: true }
    });
    console.log(`Kategori silindi (soft delete)`);

    const testItem = await prisma.galleryItem.create({
      data: {
        categoryId: testCat.id,
        imageUrl: '/images/test.png',
        isActive: true,
        order: 99,
        isFeatured: true,
        translations: {
          create: [
            { language: 'TR', title: 'Test Foto', description: 'Test', altText: 'Test' }
          ]
        }
      }
    });
    console.log(`Fotoğraf eklendi: ID ${testItem.id}`);

    await prisma.galleryItem.update({
      where: { id: testItem.id },
      data: { isActive: false, order: 100, isFeatured: false }
    });
    console.log(`Fotoğraf güncellendi (pasif, sıra değişti)`);

    await prisma.galleryItem.update({
      where: { id: testItem.id },
      data: { isDeleted: true }
    });
    console.log(`Fotoğraf silindi (soft delete)`);

    // Clean up
    await prisma.galleryItemTranslation.deleteMany({ where: { itemId: testItem.id } });
    await prisma.galleryItem.delete({ where: { id: testItem.id } });
    await prisma.galleryCategoryTranslation.deleteMany({ where: { categoryId: testCat.id } });
    await prisma.galleryCategory.delete({ where: { id: testCat.id } });
    console.log('Test verileri temizlendi.');

  } catch (e: any) {
    console.error('Test hatası:', e.message);
  }

  console.log('\n--- HARDCODED KONTROLU ---');
  const clientCode = fs.readFileSync('./src/components/layout/GalleryClient.tsx', 'utf-8');
  if (clientCode.includes('categories = [') && clientCode.includes('id: \'all\'')) {
    console.log('Hardcoded kategori TESPİT EDİLDİ!');
  } else {
    console.log('Hardcoded kategori kaldırılmış, veritabanından çalışıyor.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
