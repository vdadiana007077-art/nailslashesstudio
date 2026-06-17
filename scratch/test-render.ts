import "dotenv/config";
import { JSDOM } from "jsdom";

const BASE_URL = "http://localhost:1000";

const URLS = [
  "/tr/blog/tirnak-sagligi/tirnaklar-neden-kirilir",
  "/tr/blog/tirnak-bakimi-ve-biab/biab-tirnak-antalya",
  "/tr/blog/kas-ve-guzellik/antalya-guzellik-trendleri"
];

async function main() {
  console.log("=== RENDER KONTROL RAPORU ===");

  for (const path of URLS) {
    console.log(`\nURL: ${path}`);
    const url = `${BASE_URL}${path}`;

    try {
      const res = await fetch(url);
      if (res.status !== 200) {
        console.log(`  FAIL: ${res.status} OK`);
        continue;
      }
      
      const html = await res.text();
      const dom = new JSDOM(html);
      const doc = dom.window.document;

      // Select the content div. We can just check the body text for literal symbols.
      // But we must be careful: document.body.textContent will contain the text without tags.
      // So if a tag is literally printed on screen, textContent will contain "<p>".
      // If a tag is parsed correctly, it won't be in textContent.
      const textContent = doc.body.textContent || "";
      
      const hasLiteralHtml = /<p>|<h3>|<h2>|<ul>|<li>|<strong>|<br\s*\/?>/.test(textContent);
      // For markdown, we check for '## ' at the start of a line or ' * ' in text, but it's tricky.
      // Let's check for '## ' or '### '.
      const hasLiteralMarkdown = /##\s|###\s/.test(textContent);
      
      const pTags = doc.querySelectorAll('p');
      const h2Tags = doc.querySelectorAll('h2');
      const ulTags = doc.querySelectorAll('ul');
      
      const hasRealParagraphs = pTags.length > 0;
      const hasRealHeadings = h2Tags.length > 0;

      // Check FAQ Language mixing.
      // TR should not have 'What is', 'Wie lange', 'Сколько'
      const hasEnFaq = textContent.includes("Is BIAB the same");
      const hasDeFaq = textContent.includes("Ist BIAB das Gleiche");
      const hasRuFaq = textContent.includes("это наращивание ногтей");
      const faqMixed = hasEnFaq || hasDeFaq || hasRuFaq;

      let result = "PASS";
      if (hasLiteralHtml) {
        console.log("  FAIL: HTML tagleri düz metin olarak görünüyor.");
        result = "FAIL";
      }
      if (hasLiteralMarkdown) {
        console.log("  FAIL: Markdown sembolleri (##) düz metin olarak görünüyor.");
        result = "FAIL";
      }
      if (!hasRealParagraphs && !hasRealHeadings) {
        console.log("  WARNING: Sayfada gerçek paragraf (<p>) veya H2 bulunamadı.");
        if (result === "PASS") result = "WARNING";
      }
      if (faqMixed) {
        console.log("  FAIL: FAQ dili karışmış (Başka dilde sorular görünüyor).");
        result = "FAIL";
      }

      console.log(`  HTML Tag Görünürlüğü: ${hasLiteralHtml ? 'FAIL' : 'PASS'}`);
      console.log(`  Markdown Sembol Görünürlüğü: ${hasLiteralMarkdown ? 'FAIL' : 'PASS'}`);
      console.log(`  Gerçek Başlık (H2) Render: ${hasRealHeadings ? 'PASS' : 'WARNING (bulunamadı)'}`);
      console.log(`  Gerçek Paragraf (p) Render: ${hasRealParagraphs ? 'PASS' : 'WARNING (bulunamadı)'}`);
      console.log(`  FAQ Dil Kontrolü: ${faqMixed ? 'FAIL' : 'PASS'}`);
      
      console.log(`  SONUÇ: ${result}`);

    } catch (e) {
      console.error(`  Hata: ${e.message}`);
    }
  }
}

main();
