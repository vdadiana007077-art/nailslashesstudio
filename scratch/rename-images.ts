import fs from 'fs';
import path from 'path';

const dir = path.join(__dirname, '../public/uploads/blogs');
const files = fs.readdirSync(dir);

let count = 0;
for (const file of files) {
  if (file.includes('`')) {
    const oldPath = path.join(dir, file);
    const newFile = file.replace(/`/g, '');
    const newPath = path.join(dir, newFile);
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${file} -> ${newFile}`);
    count++;
  }
}

console.log(`\nTotal renamed files: ${count}`);
