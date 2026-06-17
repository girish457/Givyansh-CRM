import fs from 'fs';
const content = fs.readFileSync('server/index.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('/api/') || line.includes('app.')) {
    if (line.toLowerCase().includes('lead') || line.toLowerCase().includes('forward') || line.toLowerCase().includes('share') || line.toLowerCase().includes('vendor')) {
      console.log(`${idx + 1}: ${line}`);
    }
  }
});
