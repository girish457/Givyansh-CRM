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

const matches = [];
walkDir('src', (file) => {
  if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.toLowerCase().includes('followup') || content.toLowerCase().includes('reminder') || content.includes('popup')) {
      matches.push(file);
    }
  }
});

console.log("Matches found in files:");
console.log(matches.join('\n'));
