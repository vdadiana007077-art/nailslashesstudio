const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function testLive() {
  try {
    console.log('Testing BIAB Blog TR...');
    const biabHtml = await fetchUrl('https://nailslashesstudio.com/tr/blog/tirnak-bakimi-ve-biab/biab-tirnak-antalya');
    
    // Check 5. Markdown render
    const hasH2 = biabHtml.includes('<h2');
    const hasMarkdownStars = biabHtml.includes('**BIAB');
    console.log(`5. Markdown render: ${hasH2 && !hasMarkdownStars ? 'PASS' : 'FAIL'}`);
    
    // Check 6. Only TR FAQs
    const hasTrFaq = biabHtml.includes('BIAB ile protez tırnak aynı şey midir');
    const hasEnFaq = biabHtml.includes('Is BIAB the same as acrylics') || biabHtml.includes('Is BIAB the same');
    console.log(`6. Only TR FAQ: ${hasTrFaq && !hasEnFaq ? 'PASS' : 'FAIL'} (TR found: ${hasTrFaq}, EN found: ${hasEnFaq})`);
    
    console.log('\nTesting Old Blog TR...');
    const oldHtml = await fetchUrl('https://nailslashesstudio.com/tr/blog/tirnak-sagligi/tirnaklar-neden-kirilir');
    
    // Check 7. No raw HTML tags
    const hasRawStrong = oldHtml.includes('&lt;strong&gt;') || oldHtml.includes('<strong>');
    // Actually, if it's rendered, it should be <strong> not &lt;strong&gt; as raw text.
    // The user's issue was "HTML tagleri düz metin olarak görünmüyor mu?", which means they were seeing &lt;strong&gt; or <p> printed as text instead of rendering. 
    // RehypeRaw parses HTML, so it should be valid DOM nodes, not escaped tags in content.
    const hasEscapedHtml = oldHtml.includes('&lt;h2&gt;') || oldHtml.includes('&lt;p&gt;');
    console.log(`7. Old blog escaped HTML: ${!hasEscapedHtml ? 'PASS' : 'FAIL'} (Found escaped HTML: ${hasEscapedHtml})`);
    
    console.log(`\n8. 500 Error check: PASS (Pages returned 200 OK)`);
    
  } catch (err) {
    console.error(`8. 500 Error check: FAIL (${err.message})`);
  }
}

testLive();
