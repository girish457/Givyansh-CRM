const fs = require('fs');
const file = 'server/index.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Searching for endpoints:');
lines.forEach((line, i) => {
  if (line.includes('app.get(') || line.includes('app.post(') || line.includes('app.patch(') || line.includes('app.put(')) {
    if (line.includes('/api/attendance') || line.includes('/api/tasks') || line.includes('/api/candidates') || line.includes('/api/me') || line.includes('/api/dashboard')) {
      console.log(`${i+1}: ${line.trim()}`);
    }
  }
});
