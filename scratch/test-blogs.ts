const BLOGS = [
  { slug: "kirpik-uzatma-antalya", category: "kirpik-uzatma" },
  { slug: "ipek-kirpik-lara", category: "kirpik-uzatma" },
  { slug: "hybrid-lashes-guzeloba", category: "kirpik-uzatma" },
  { slug: "volume-lashes-antalya", category: "kirpik-uzatma" },
  { slug: "kalici-oje-antalya", category: "tirnak-bakimi-ve-biab" },
  { slug: "biab-tirnak-antalya", category: "tirnak-bakimi-ve-biab" },
  { slug: "guzeloba-nail-studio", category: "tirnak-bakimi-ve-biab" },
  { slug: "kas-laminasyonu-lara", category: "kas-ve-guzellik" },
  { slug: "guzeloba-guzellik-salonu", category: "kas-ve-guzellik" },
  { slug: "antalya-guzellik-trendleri", category: "kas-ve-guzellik" }
];

async function testUrl(blog: any) {
  const url = `http://localhost:1000/tr/blog/${blog.category}/${blog.slug}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();

    const is200 = res.status === 200;
    
    // SEO Title check
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const seoTitle = titleMatch ? titleMatch[1] : "";
    const hasSeoTitle = is200 && seoTitle.length > 10 && !seoTitle.includes("Bulunamadı");

    // Meta Description
    const metaDescMatch = html.match(/name="description"\s+content="([^"]*)"/);
    const hasMetaDesc = !!metaDescMatch && metaDescMatch[1].length > 20;

    // Canonical
    const hasCanonical = html.includes('rel="canonical"');

    // OG Tags
    const hasOgTitle = html.includes('property="og:title"');
    const hasOgDesc = html.includes('property="og:description"');

    // Images
    const hasHeroInPage = html.includes(`${blog.slug}-hero.webp`) || html.includes(`/uploads/blogs/${blog.slug}`);
    
    // FAQ
    const hasFaq = html.includes("Sıkça Sorulan Sorular") || html.includes("Sorulan");

    // Schemas
    const hasArticleSchema = html.includes('"@type":"NewsArticle"') || html.includes('"@type":"Article"');
    const hasFaqSchema = html.includes('"@type":"FAQPage"');

    return {
      url,
      status: res.status,
      is200: is200 ? "PASS" : `FAIL (${res.status})`,
      seoTitle: hasSeoTitle ? `PASS (${seoTitle.substring(0, 50)}...)` : `FAIL (${seoTitle.substring(0, 30)})`,
      metaDesc: hasMetaDesc ? "PASS" : "FAIL",
      canonical: hasCanonical ? "PASS" : "WARNING",
      ogTags: (hasOgTitle && hasOgDesc) ? "PASS" : "WARNING",
      hero: hasHeroInPage ? "PASS" : "WARNING",
      faq: hasFaq ? "PASS" : "WARNING",
      articleSchema: hasArticleSchema ? "PASS" : "FAIL",
      faqSchema: hasFaqSchema ? "PASS" : "WARNING"
    };
  } catch (err: any) {
    return {
      url,
      status: 0,
      is200: `FAIL (${err.message})`,
      seoTitle: "FAIL",
      metaDesc: "FAIL",
      canonical: "FAIL",
      ogTags: "FAIL",
      hero: "FAIL",
      faq: "FAIL",
      articleSchema: "FAIL",
      faqSchema: "FAIL"
    };
  }
}

async function testSitemap() {
  try {
    const res = await fetch("http://localhost:1000/sitemap.xml");
    const text = await res.text();
    const results: string[] = [];
    for (const b of BLOGS) {
      const found = text.includes(b.slug);
      results.push(`  ${b.slug}: ${found ? "PASS" : "FAIL"}`);
    }
    return results;
  } catch {
    return ["  FAIL: Sitemap erişilemedi"];
  }
}

async function main() {
  console.log("========================================");
  console.log("  TR PİLOT PAKET CANLI TEST RAPORU v2");
  console.log("========================================\n");

  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const blog of BLOGS) {
    const r = await testUrl(blog);
    console.log(`\n--- ${r.url} ---`);
    console.log(`  200 OK:         ${r.is200}`);
    console.log(`  SEO Title:      ${r.seoTitle}`);
    console.log(`  Meta Desc:      ${r.metaDesc}`);
    console.log(`  Canonical:      ${r.canonical}`);
    console.log(`  OG Tags:        ${r.ogTags}`);
    console.log(`  Hero Görsel:    ${r.hero}`);
    console.log(`  FAQ Görünüm:    ${r.faq}`);
    console.log(`  Article Schema: ${r.articleSchema}`);
    console.log(`  FAQ Schema:     ${r.faqSchema}`);

    // Count
    for (const val of Object.values(r)) {
      if (typeof val === "string") {
        if (val.startsWith("PASS")) passCount++;
        else if (val.startsWith("WARNING")) warnCount++;
        else if (val.startsWith("FAIL")) failCount++;
      }
    }
  }

  console.log("\n--- SITEMAP KONTROLÜ ---");
  const sitemapResults = await testSitemap();
  for (const line of sitemapResults) {
    console.log(line);
    if (line.includes("PASS")) passCount++;
    else failCount++;
  }

  console.log("\n========================================");
  console.log(`  TOPLAM: ${passCount} PASS | ${warnCount} WARNING | ${failCount} FAIL`);
  
  if (failCount === 0 && warnCount === 0) {
    console.log("  SONUÇ: ✅ CANLIYA UYGUN");
  } else if (failCount === 0) {
    console.log("  SONUÇ: ⚠️ CANLIYA UYGUN (OPTİMİZASYON ÖNERİLİR)");
  } else {
    console.log("  SONUÇ: ❌ DÜZELTME GEREKLİ");
  }
  console.log("========================================");
}

main();
