const https = require('https');

const baseUrl = 'https://nailslashesstudio.com';
const urls = [
  '/',
  '/tr',
  '/en',
  '/tr/blog',
  '/tr/blog/nail-care-biab/biab-mi-jel-tirnak-mi' // This seems to be the correct slug instead of tirnak-bakimi-ve-biab/biab-tirnak-antalya based on earlier tests
];

async function measureUrl(urlPath) {
  return new Promise((resolve) => {
    const fullUrl = baseUrl + urlPath;
    const startTime = Date.now();
    
    const req = https.get(fullUrl, (res) => {
      const ttfb = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url: urlPath,
          status: res.statusCode,
          ttfb: ttfb,
          cacheControl: res.headers['cache-control'] || 'N/A',
          vercelCache: res.headers['x-vercel-cache'] || res.headers['x-nf-request-id'] ? 'Netlify cache: ' + res.headers['x-nf-request-id'] : 'N/A',
          server: res.headers['server'] || 'N/A',
          success: res.statusCode === 200
        });
      });
    });
    
    req.on('error', (e) => {
      resolve({
        url: urlPath,
        status: 'ERROR',
        ttfb: 0,
        error: e.message,
        success: false
      });
    });
  });
}

async function run() {
  console.log('--- CANLI (PRODUCTION) ÖLÇÜM SONUÇLARI ---');
  console.log('Sunucu durumu kontrol ediliyor...\n');
  
  for (const url of urls) {
    const result = await measureUrl(url);
    console.log(`URL: ${result.url}`);
    console.log(`Durum: ${result.status === 200 ? '✅ 200 OK' : '❌ ' + result.status}`);
    console.log(`TTFB: ${result.ttfb} ms`);
    console.log(`Cache-Control: ${result.cacheControl}`);
    if (result.vercelCache !== 'N/A') {
      console.log(`Cache Durumu: ${result.vercelCache}`);
    }
    console.log('-----------------------------------');
  }
}

run();
