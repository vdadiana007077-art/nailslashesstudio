import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Statik dosyaları ve api rotalarını atla
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Dinamik 301/302 yönlendirme kurallarını Supabase REST API üzerinden sorgula
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      // Dil ön takısını ayırarak kontrol et (örn: /tr/eski-hizmet -> /eski-hizmet)
      const segments = pathname.split('/');
      let cleanPath = pathname;
      if (segments.length > 1 && ['tr', 'en', 'de', 'ru'].includes(segments[1])) {
        cleanPath = '/' + segments.slice(2).join('/');
      }

      // Hem orijinal yolu hem de dil ön takısız temiz yolu sorgula
      const queryUrl = `${supabaseUrl}/rest/v1/Redirect?or=(oldUrl.eq.${encodeURIComponent(pathname)},oldUrl.eq.${encodeURIComponent(cleanPath)})&isActive=eq.true&select=newUrl,statusCode`;

      const res = await fetch(queryUrl, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 } // Performans için 60 saniye boyunca ara belleğe al
      });

      if (res.ok) {
        const redirects = await res.json();
        if (redirects && redirects.length > 0) {
          const rule = redirects[0];
          const redirectUrl = new URL(rule.newUrl, request.url);
          return NextResponse.redirect(redirectUrl, rule.statusCode || 301);
        }
      }
    }
  } catch (error) {
    console.error('Yönlendirme Middleware hatası:', error);
  }

  // Dil ön takısı yönlendirmesini next-intl ile yap
  return intlMiddleware(request);
}

export const config = {
  // Sadece çok dilli yolları ve ana sayfayı işle
  matcher: ['/', '/(tr|en|ru|de)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};
