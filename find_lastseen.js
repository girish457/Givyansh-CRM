const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'server', 'index.js');
const content = fs.readFileSync(filePath, 'utf8');

function findLastSeen() {
  const regex = /lastSeen/gi;
  let match;
  console.log("=== lastSeen Occurrences ===");
  while ((match = regex.exec(content)) !== null) {
    const start = Math.max(0, match.index - 100);
    const end = Math.min(content.length, match.index + 100);
    console.log(`Pos ${match.index}: ${content.substring(start, end).replace(/\n/g, ' ').trim()}`);
  }
}

findLastSeen();
