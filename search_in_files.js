const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern, results) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        searchDir(fullPath, pattern, results);
      }
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.html'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        results.push(`Found in: ${fullPath}`);
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(pattern.toLowerCase())) {
            results.push(`  Line ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

const workspace = 'c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS';
const results = [];
searchDir(workspace, 'CRMView', results);

fs.writeFileSync(path.join(workspace, 'search_output.txt'), results.join('\n'));
console.log('Search complete, output written to search_output.txt');
