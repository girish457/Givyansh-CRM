import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (f.startsWith('.') || f === 'node_modules') return;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkDir('.', (file) => {
  if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.sql')) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('Triggered by') || content.includes('Triggered by register')) {
      console.log(`Match in file: ${file}`);
    }
  }
});
