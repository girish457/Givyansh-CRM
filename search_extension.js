const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        searchDir(fullPath, pattern);
      }
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.html'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        console.log(`Found pattern in: ${fullPath}`);
        // print matching lines
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(pattern.toLowerCase())) {
            console.log(`  Line ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

const workspace = 'c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS';
console.log('Searching for "extension" in workspace...');
searchDir(workspace, 'extension');
