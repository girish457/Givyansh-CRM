import fs from 'fs';
const content = fs.readFileSync('server/index.js', 'utf8');
const lines = content.split('\n');
const endpoints = [];
lines.forEach((line, idx) => {
  if (line.includes('app.get') || line.includes('app.post') || line.includes('app.patch') || line.includes('app.put') || line.includes('app.delete')) {
    endpoints.push(`${idx + 1}: ${line.trim()}`);
  }
});
fs.writeFileSync('endpoints_output.txt', endpoints.join('\n'));
console.log(`Found ${endpoints.length} routes, wrote them to endpoints_output.txt`);
