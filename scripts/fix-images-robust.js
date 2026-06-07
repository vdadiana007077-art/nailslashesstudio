const fs = require('fs');
const path = require('path');

const directoryToSearch = path.join(__dirname, '../src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

function processFiles() {
  const files = getAllFiles(directoryToSearch);

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;

    // Sadece <img etiketlerini bul
    if (content.includes('<img ')) {
      // Değiştir
      content = content.replace(/<img /g, '<Image width={800} height={800} ');
      hasChanges = true;

      // Import ekleme (eğer yoksa)
      if (!content.includes("import Image from 'next/image'") && !content.includes('import Image from "next/image"')) {
        // Find the absolute FIRST import line
        const lines = content.split('\n');
        let insertIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                insertIndex = i;
                break;
            }
        }
        
        // Insert right at the top (or before the first import)
        lines.splice(insertIndex, 0, "import Image from 'next/image';");
        content = lines.join('\n');
      }
    }

    if (hasChanges) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed:', file);
    }
  });
}

processFiles();
