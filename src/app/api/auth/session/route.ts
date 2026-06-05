import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptSession } from '@/lib/auth-helpers';
import { LoginType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Token bulunamadı!' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rzwagnztdyrvjrzbrlxb.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // 1. Token'ı Supabase Auth API üzerinden doğrula
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': supabaseAnonKey
      }
    });

    if (!userRes.ok) {
      return NextResponse.json({ success: false, error: 'Geçersiz token veya oturum!' }, { status: 401 });
    }

    const supabaseUser = await userRes.json();
    const email = supabaseUser.email;
    const authUserId = supabaseUser.id; // Supabase Auth UUID'si
    const name = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'Müşteri';
    const avatar = supabaseUser.user_metadata?.avatar_url || null;

    // Giriş tipini provider'dan anla
    const provider = supabaseUser.app_metadata?.provider || 'google'; // google, apple vb.
    const loginType = provider === 'apple' ? LoginType.APPLE : LoginType.GOOGLE;

    if (!email) {
      return NextResponse.json({ success: false, error: 'E-posta adresi alınamadı!' }, { status: 400 });
    }

    // 2. Kullanıcıyı yerel veritabanında ara veya oluştur (Upsert)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { authUserId },
          { email }
        ]
      }
    });

    if (user) {
      // Eşleştirme güncellenmesi gerekiyorsa (Örn: authUserId sonradan set ediliyor)
      if (!user.authUserId || user.image !== avatar) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            authUserId,
            image: avatar || user.image
          }
        });
      }
    } else {
      // Yeni sosyal kullanıcı oluştur
      user = await prisma.user.create({
        data: {
          name,
          email,
          authUserId,
          loginType,
          image: avatar,
          provider,
          providerAccountId: authUserId
        }
      });
    }

    // 3. HTTP-Only Çerez Set Etme
    const encryptedCookie = encryptSession({ userId: user.id });
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    
    response.cookies.set('customer_token', encryptedCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Oturum API hatası:', error);
    return NextResponse.json({ success: false, error: 'Oturum oluşturulurken sunucu hatası oluştu.' }, { status: 500 });
  }
}
