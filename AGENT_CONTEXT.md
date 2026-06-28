# N&L Studio - Proje Bağlamı

## Proje Bilgileri
- **Framework:** Next.js 15.5.19 (App Router)
- **Dil Desteği:** next-intl (TR, EN, DE, RU)
- **Veritabanı:** PostgreSQL + Prisma 7.8 (Supabase, pg driver adapter)
- **Hosting:** Vercel

## Son Güncelleme: 2026-06-28 - Performans Optimizasyonu Phase 2

### Phase 1: Veri Çekme ve Cache Optimizasyonu
1. **next.config.ts:** Image optimization (avif/webp, 1 yıl cache TTL), static asset caching headers, optimizePackageImports, security headers, bundle analyzer
2. **Middleware:** In-memory redirect cache (5dk TTL), statik dosya/api erken return, /staff bypass
3. **Layout:** LazyWidgets client wrapper ile CookieConsentBanner + SupportWidget lazy load (ssr:false), menüler ve ayarlar unstable_cache + Promise.all ile paralel çekme
4. **Home Page:** unstable_cache ile tüm veri çekme (1 saat), 4 sorgu tek Promise.all'da, ServiceExplorer dynamic import, hero görseli sizes/quality/priority, galeri görselleri lazy loading
5. **Services Page:** unstable_cache + Promise.all (4 paralel sorgu), location sorgusunda select
6. **Booking Page:** 5 sıralı sorgu → tek Promise.all
7. **Gallery Page:** Kategori + galeri sorguları paralel
8. **Portfolio Page:** 3 sorgu paralel
9. **Blog Page:** 3 sorgu paralel, revalidate=3600
10. **Blog/Service sayfaları:** ISR (revalidate=3600), img→Next Image
11. **Admin Dashboard:** 5 sıralı sorgu → Promise.all, staff/location select optimizasyonu
12. **Booking Action:** 7 sıralı validation sorgusu → 2 paralel batch
13. **Support Widget:** 2 findMany → tek sorgu, saveSettings N+1→Promise.all upsert, reorder N+1→Promise.all

### Phase 2: Middleware ve Database Optimizasyonu
1. **Middleware küçültme:** 280 KB → 46.8 KB (%83 azalma)
   - routing-config.ts ile import zinciri kırıldı (Prisma bağımlılığı kesildi)
2. **Database Indexes:** 26 yeni index eklendi (Appointment, Transaction, Payment, StaffCommission, StaffTransaction, StaffPayout, BlogPost, Service, Faq, Lead)
3. **Bundle Analyzer:** @next/bundle-analyzer entegre edildi (ANALYZE=true)

### Mimari: i18n Import Yapısı
- `routing-config.ts` → Sadece defineRouting config (Middleware bu dosyayı import eder)
- `routing.ts` → createNavigation + re-export routing (Sayfa componentleri bu dosyayı import eder)
- `request.ts` → routing-config'den import eder, prisma dinamik import ile yükler

### Dokunulmayan Alanlar
- Tasarım, SEO, URL yapısı
- Veritabanı şeması ve veriler (index dışında)
- İş kuralları, finans sistemi, rezervasyon mantığı

### 🚀 Deploy / Import Aşamasında Yapılacaklar
Production'a deploy etmeden **hemen önce** aşağıdaki migration komutunu çalıştırın:
```bash
npx prisma migrate dev --name add_performance_indexes
```
- **Ne zaman:** Deploy/import aşamasında, kod push'tan önce veya sonra.
- **Ne yapar:** Sadece `CREATE INDEX` SQL'leri çalıştırır (26 index).
- **Ne yapmaz:** Hiçbir tablo yapısını değiştirmez, sütun eklemez/silmez, veri silmez.
- **Risk:** Sıfır. Mevcut veriler ve tablolar aynen kalır.
- **Süre:** Tablolarınızın boyutuna göre birkaç saniye ile birkaç dakika arasında.

> ⚠️ Bu adım atlanırsa schema.prisma'daki index tanımları veritabanına yansımaz ve sorgu performans kazancı elde edilemez.
