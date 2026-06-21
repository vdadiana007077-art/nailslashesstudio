/**
 * CRLF-uyumlu dönüştürme.
 * Satır bazlı çalışır, regex sorunlarını atlar.
 */
const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '..', 'src', 'app', 'admin');

const titleMap = {
  'users': 'Müşteri Yönetimi',
  'subscribers': 'Bülten Aboneleri',
  'seo': 'SEO & Yönlendirmeler',
  'settings': 'Site Ayarları',
  'services': 'Hizmet Yönetimi',
  'portfolio': 'Portföy Yönetimi',
  'pages': 'Menü Sayfaları',
  'packages': 'Paket Yönetimi',
  'media': 'Medya Kütüphanesi',
  'locations': 'Şube Yönetimi',
  'leads': 'CRM Talepleri',
  'landing-pages': 'SEO Sayfaları',
  'giftcards': 'Hediye Kartları',
  'menus': 'Menü Yönetimi',
  'gallery': 'Galeri Yönetimi',
  'faq': 'SSS (FAQ) Yönetimi',
  'contact': 'İletişim Mesajları',
  'email-templates': 'Mail Şablonları',
  'coupons': 'Kupon Yönetimi',
  'categories': 'Kategori Yönetimi',
  'blog': 'Blog Yazıları',
  'accounting': 'Muhasebe & Finans',
  'audit-logs': 'İşlem Günlükleri',
  'translations': 'Arayüz Çevirileri',
};

function findAllPages(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'login') continue;
        results.push(...findAllPages(fullPath));
      } else if (entry.name === 'page.tsx') {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('AdminShell') || !content.includes('AdminSidebar')) {
    return null;
  }

  const relPath = path.relative(adminDir, filePath);
  const dirName = relPath.split(path.sep)[0];
  
  // h1'den başlık çıkar
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  let title = h1Match ? h1Match[1].trim() : (titleMap[dirName] || dirName);

  const lines = content.split(/\r?\n/);
  const newLines = [];
  let state = 'normal'; // normal, skip_wrapper, skip_header, in_main
  let braceDepth = 0;
  let mainStarted = false;
  let headerSkipDepth = 0;
  let wrapperEndCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Import değiştir
    if (trimmed.includes("import AdminSidebar from")) {
      newLines.push(line.replace(/import AdminSidebar from.*/, "import AdminShell from '@/components/admin/AdminShell';"));
      continue;
    }

    // 2. Açılış wrapper div'ini bul
    if (trimmed.includes('className="flex h-screen bg-gray-50 overflow-hidden"')) {
      state = 'skip_wrapper';
      continue; // Bu satırı atla
    }

    // 3. AdminSidebar satırını atla
    if (state === 'skip_wrapper' && trimmed.includes('<AdminSidebar')) {
      continue;
    }

    // 4. flex-1 wrapper div'ini atla
    if (state === 'skip_wrapper' && trimmed.includes('className="flex-1 flex flex-col h-screen overflow-hidden"')) {
      continue;
    }

    // 5. Header bloğunu atla (header açılış + tüm içerik + header kapanış)
    if (state === 'skip_wrapper' && trimmed.startsWith('<header')) {
      state = 'skip_header';
      headerSkipDepth = 1;
      continue;
    }

    if (state === 'skip_header') {
      // header içindeki iç içe etiketleri say
      const opens = (line.match(/<header/g) || []).length;
      const closes = (line.match(/<\/header>/g) || []).length;
      headerSkipDepth += opens - closes;
      if (headerSkipDepth <= 0) {
        state = 'find_main';
      }
      continue;
    }

    // 6. main açılışını bul
    if (state === 'find_main' && trimmed.includes('className="flex-1 overflow-y-auto')) {
      // AdminShell açılışını ekle
      newLines.push(`    <AdminShell title="${title}">`);
      state = 'in_main';
      continue;
    }

    // 7. main içindeyken normal satırları ekle
    if (state === 'in_main') {
      // Kapanış </main> + </div> + </div> → </AdminShell>
      if (trimmed === '</main>') {
        wrapperEndCount = 1;
        state = 'closing';
        continue;
      }
      newLines.push(line);
      continue;
    }

    // 8. Kapanış bloğu
    if (state === 'closing') {
      if (trimmed === '</div>') {
        wrapperEndCount++;
        if (wrapperEndCount >= 3) {
          // Son </div> — AdminShell kapanışı ekle
          newLines.push('    </AdminShell>');
          state = 'normal';
          continue;
        }
        continue;
      } else if (trimmed === '') {
        continue; // Boş satırları atla
      } else {
        // Beklenmeyen içerik — sorun var
        newLines.push(line);
        continue;
      }
    }

    // Normal satırlar
    newLines.push(line);
  }

  const newContent = newLines.join('\n');
  
  if (newContent.includes('AdminShell') && !newContent.includes('AdminSidebar')) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return title;
  }
  
  return false;
}

const pages = findAllPages(adminDir);
let converted = 0, skipped = 0, failed = 0;

for (const filePath of pages) {
  const relPath = path.relative(adminDir, filePath);
  const result = processFile(filePath);
  
  if (result === null) {
    console.log(`ATLA: ${relPath}`);
    skipped++;
  } else if (result === false) {
    console.log(`⚠️ HATA: ${relPath}`);
    failed++;
  } else {
    console.log(`✅ ${relPath} → "${result}"`);
    converted++;
  }
}

console.log(`\n✅ Tamamlandı: ${converted} dönüştürüldü, ${skipped} atlandı, ${failed} hata`);
