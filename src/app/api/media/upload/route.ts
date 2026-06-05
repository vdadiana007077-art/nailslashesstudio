import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  // Yönetici Yetki Kontrolü
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  if (!token || token.value !== 'authenticated') {
    return NextResponse.json({ error: 'Yetkisiz erişim!' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || '';
    const altText = formData.get('altText') as string || '';
    const caption = formData.get('caption') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'Dosya seçilmedi!' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Çakışmaları önlemek için dosya adını temizleyip benzersizleştirin
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const uniqueFileName = `${timestamp}_${cleanFileName}`;

    // public/uploads yolunu oluşturun
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Klasör yoksa oluşturun
    await mkdir(uploadDir, { recursive: true });

    // Dosyayı diske kaydedin
    const filePath = join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFileName}`;

    // Veritabanı kaydı
    const mediaItem = await prisma.mediaItem.create({
      data: {
        url: fileUrl,
        title: title || file.name,
        altText: altText || title || file.name,
        caption: caption || null,
        fileName: uniqueFileName,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({ success: true, data: mediaItem });
  } catch (error: any) {
    console.error('Medya yükleme API hatası:', error);
    return NextResponse.json({ error: 'Medya yüklenirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}
