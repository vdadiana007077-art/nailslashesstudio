/**
 * Tüm admin sayfalarındaki return() ile <AdminShell arasındaki
 * artık JSX yorumlarını temizle.
 */
const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '..', 'src', 'app', 'admin');

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
  
  if (!content.includes('AdminShell')) continue;
  
  const lines = content.split(/\r?\n/);
  const newLines = [];
  let inReturnBlock = false;
  let foundAdminShell = false;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    
    // return ( bloğunu bul
    if (trimmed === 'return (' || trimmed === 'return(') {
      inReturnBlock = true;
      foundAdminShell = false;
      newLines.push(lines[i]);
      continue;
    }
    
    if (inReturnBlock && !foundAdminShell) {
      // AdminShell bulana kadar
      if (trimmed.startsWith('<AdminShell')) {
        foundAdminShell = true;
        newLines.push(lines[i]);
        continue;
      }
      
      // JSX yorumu veya boş satırsa atla
      if (/^\{\/\*.*\*\/\}$/.test(trimmed) || trimmed === '') {
        continue;
      }
      
      // Başka bir şey (AdminShell kullanmayan return)
      newLines.push(lines[i]);
      continue;
    }
    
    newLines.push(lines[i]);
  }
  
  const newContent = newLines.join('\n');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ ${path.relative(adminDir, filePath)}`);
    fixed++;
  }
}

console.log(`\n✅ ${fixed} dosya temizlendi.`);
