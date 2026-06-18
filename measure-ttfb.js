const http = require('http');

async function measureTTFB(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(url, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          ttfb: Date.now() - start
        });
      });
    });
    req.on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function run() {
  const urls = [
    'http://localhost:3001/',
    'http://localhost:3001/en',
    'http://localhost:3001/blog',
    'http://localhost:3001/blog/tirnak-bakimi-ve-biab/biab-tirnak-antalya'
  ];

  console.log('Measuring TTFB for localhost:3001...\n');
  for (const url of urls) {
    const res = await measureTTFB(url);
    if (res.error) {
      console.log(`[FAIL] ${url} -> Error: ${res.error}`);
    } else if (res.status !== 200) {
      console.log(`[FAIL] ${url} -> Status: ${res.status}`);
    } else {
      console.log(`[PASS] ${url} -> TTFB: ${res.ttfb}ms`);
    }
  }
}

run();
