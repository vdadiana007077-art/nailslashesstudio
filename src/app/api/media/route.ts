import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const mediaItems = await prisma.mediaItem.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, media: mediaItems });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Medya kütüphanesi yüklenemedi.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ success: false, error: 'Dosya bulunamadı!' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // public/uploads dizinini hazırla
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {}

    // Benzersiz dosya ismi oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalName = file.name;
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const fileName = `${uniqueSuffix}${extension}`;
    const filePath = join(uploadDir, fileName);

    // Dosyayı diske yaz
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    // Veritabanına kaydet
    const mediaItem = await prisma.mediaItem.create({
      data: {
        url: fileUrl,
        fileName: originalName,
        fileSize: file.size,
        mimeType: file.type,
        title: originalName.split('.')[0]
      }
    });

    return NextResponse.json({ success: true, media: mediaItem });
  } catch (error: any) {
    console.error('Dosya yükleme hatası:', error);
    return NextResponse.json({ success: false, error: 'Dosya yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}
