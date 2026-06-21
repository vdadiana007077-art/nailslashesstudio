/**
 * ESLint no-unused-vars uyarılarını düzeltme - v2
 * Multi-line import desteği ile.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const eslintOutput = execSync('npx eslint src/ --format json 2>NUL', {
  cwd: path.join(__dirname, '..'),
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024
});

const results = JSON.parse(eslintOutput);
let totalFixed = 0;

for (const fileResult of results) {
  if (fileResult.warningCount === 0) continue;
  
  const filePath = fileResult.filePath;
  const warnings = fileResult.messages.filter(m => m.severity === 1);
  if (warnings.length === 0) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Kullanılmayan import'ları topla
  const unusedImports = warnings.filter(w => 
    w.ruleId === '@typescript-eslint/no-unused-vars' &&
    w.message.includes('is defined but never used')
  );
  
  const unusedNames = new Set();
  for (const w of unusedImports) {
    const name = w.message.match(/^'([^']+)'/)?.[1];
    if (name) unusedNames.add(name);
  }
  
  if (unusedNames.size > 0) {
    // Tüm import bloklarını regex ile bul ve temizle
    // Pattern 1: import { A, B, C } from '...'
    content = content.replace(
      /import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]\s*;?/g,
      (match, importsStr) => {
        const imports = importsStr.split(',').map(s => s.trim()).filter(Boolean);
        const remaining = imports.filter(imp => {
          const name = imp.includes(' as ') ? imp.split(' as ')[1].trim() : imp.trim();
          return !unusedNames.has(name);
        });
        
        if (remaining.length === 0) {
          modified = true;
          return ''; // Tüm satırı sil
        }
        if (remaining.length < imports.length) {
          modified = true;
          return match.replace(importsStr, ' ' + remaining.join(', ') + ' ');
        }
        return match;
      }
    );
    
    // Pattern 2: import X from '...' (default import)
    content = content.replace(
      /import\s+(\w+)\s+from\s*['"][^'"]+['"]\s*;?\n?/g,
      (match, name) => {
        if (unusedNames.has(name)) {
          modified = true;
          return '';
        }
        return match;
      }
    );
    
    // Boş satır temizle (art arda 3+ boş satır → 2 boş satır)
    content = content.replace(/\n{4,}/g, '\n\n\n');
  }
  
  // 'node' parametreleri → _node
  const nodeWarnings = warnings.filter(w =>
    w.ruleId === '@typescript-eslint/no-unused-vars' &&
    w.message.includes("'node' is defined but never used")
  );
  if (nodeWarnings.length > 0) {
    // callback parametreleri: (node) → (_node)
    // Ama sadece kullanılmayan node'lar
    content = content.replace(/\(node\)\s*=>/g, (_match) => {
      modified = true;
      return '(_node) =>';
    });
    content = content.replace(/\(node,/g, (_match) => {
      modified = true;
      return '(_node,';
    });
  }
  
  // 'id' destructuring → _id
  const idWarnings = warnings.filter(w =>
    w.ruleId === '@typescript-eslint/no-unused-vars' &&
    w.message === "'id' is defined but never used. Allowed unused args must match /^_/u."
  );
  for (const w of idWarnings) {
    const lines = content.split('\n');
    const lineIdx = w.line - 1;
    if (lines[lineIdx]) {
      // { id, ...rest } → { _id, ...rest } veya { id } → { _id }
      lines[lineIdx] = lines[lineIdx].replace(/\bid\b(?=\s*[,}:])/, '_id');
      content = lines.join('\n');
      modified = true;
    }
  }
  
  // 'idx' → _idx
  const idxWarnings = warnings.filter(w =>
    w.ruleId === '@typescript-eslint/no-unused-vars' &&
    w.message.includes("'idx' is defined but never used")
  );
  for (const w of idxWarnings) {
    const lines = content.split('\n');
    const lineIdx = w.line - 1;
    if (lines[lineIdx]) {
      lines[lineIdx] = lines[lineIdx].replace(/\bidx\b/, '_idx');
      content = lines.join('\n');
      modified = true;
    }
  }
  
  // 'currentLocale' → _currentLocale
  const localeWarnings = warnings.filter(w =>
    w.ruleId === '@typescript-eslint/no-unused-vars' &&
    w.message.includes("'currentLocale' is defined but never used")
  );
  for (const w of localeWarnings) {
    const lines = content.split('\n');
    const lineIdx = w.line - 1;
    if (lines[lineIdx]) {
      lines[lineIdx] = lines[lineIdx].replace(/\bcurrentLocale\b/, '_currentLocale');
      content = lines.join('\n');
      modified = true;
    }
  }
  
  // 'setSettings' assigned but not used → _setSettings
  const setterWarnings = warnings.filter(w =>
    w.ruleId === '@typescript-eslint/no-unused-vars' &&
    w.message.includes('is assigned a value but never used')
  );
  for (const w of setterWarnings) {
    const name = w.message.match(/^'([^']+)'/)?.[1];
    if (!name || name.startsWith('_')) continue;
    const lines = content.split('\n');
    const lineIdx = w.line - 1;
    if (lines[lineIdx]) {
      const regex = new RegExp(`\\b${name}\\b`);
      if (regex.test(lines[lineIdx])) {
        lines[lineIdx] = lines[lineIdx].replace(regex, `_${name}`);
        content = lines.join('\n');
        modified = true;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    const relPath = path.relative(path.join(__dirname, '..', 'src'), filePath);
    console.log(`✅ ${relPath}`);
    totalFixed++;
  }
}

console.log(`\n✅ ${totalFixed} dosya düzeltildi.`);
