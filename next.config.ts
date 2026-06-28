import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();
const analyzeBundles = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg'],
  
  // Performans: Statik asset'ler için agresif cache header'ları
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Statik dosyalar için uzun süreli cache
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Fontlar için cache
      {
        source: '/_next/static/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Experimental: PPR ve diğer optimizasyonlar
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/pm',
    ],
  },

  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
};

export default analyzeBundles(withNextIntl(nextConfig));
