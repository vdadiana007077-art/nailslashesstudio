/**
 * AdminShell wrapper'ı eksik olan [id] sayfalarını düzelt.
 * return ( içinde <AdminShell yoksa ve </div> kalıntıları varsa düzelt.
 */
const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '..', 'src', 'app', 'admin');

const titleMap = {
  'blog': 'Blog Düzenleme',
  'categories': 'Kategori Düzenleme',
  'menus': 'Menü Düzenleme',
  'pages': 'Sayfa Düzenleme',
  'services': 'Hizmet Düzenleme',
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

const pages = findAllPages(adminDir);
let fixed = 0;

for (const filePath of pages) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import AdminShell from")) continue;
  
  // return() bloğunda AdminShell var mı?
  const returnMatch = content.match(/return \(\s*\n([\s\S]*?)\n\s*\);/);
  if (!returnMatch) continue;
  
  const returnBody = returnMatch[1];
  
  // AdminShell zaten return bloğunda varsa atla
  if (returnBody.includes('<AdminShell')) continue;
  
  // AdminShell yoksa — eksik wrapper sorunumuz var
  const relPath = path.relative(adminDir, filePath);
  const parts = relPath.split(path.sep);
  
  // Başlık belirleme
  let parentDir = parts[0]; // blog, categories, menus, pages, services
  let title = titleMap[parentDir] || `${parentDir} Düzenleme`;
  
  // Return body'den </div> kalıntılarını temizle
  const cleanedLines = returnBody.split('\n').filter(line => {
    const t = line.trim();
    return t !== '</div>' && t !== '</main>';
  });
  
  // AdminShell wrapper'ı ekle
  const indent = '    ';
  const newReturnBody = `${indent}<AdminShell title="${title}">\n${cleanedLines.join('\n')}\n${indent}</AdminShell>`;
  
  const newContent = content.replace(returnMatch[1], newReturnBody);
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`✅ ${relPath} → "${title}"`);
  fixed++;
}

console.log(`\n✅ ${fixed} dosya düzeltildi.`);
