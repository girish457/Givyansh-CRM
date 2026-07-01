const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('backend/server/index.js', 'utf8');
const lines = content.split('\n');

function printBlock(searchStr, linesBefore = 0, linesAfter = 15) {
  console.log(`=== Searching for: "${searchStr}" ===`);
  lines.forEach((line, index) => {
    if (line.includes(searchStr)) {
      console.log(`--- Match at line ${index + 1} ---`);
      for (let i = Math.max(0, index - linesBefore); i <= Math.min(lines.length - 1, index + linesAfter); i++) {
        console.log(`${i + 1}: ${lines[i]}`);
      }
    }
  });
}

printBlock('runEmergencyMigrations', 0, 20);
printBlock('import ChatMessage', 0, 5);

