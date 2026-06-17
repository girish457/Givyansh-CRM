const fs = require('fs');

const file = 'c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\src\\pages\\dashboard\\Recruiter.tsx';
const content = fs.readFileSync(file, 'utf8');

const results = [];
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('UnifiedInbox') || line.includes('<UnifiedInbox') || line.includes('activeTab ===') || line.includes('activeTab === "inbox"')) {
    results.push(`Line ${index + 1}: ${line.trim()}`);
  }
});

fs.writeFileSync('c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\search_output.txt', results.join('\n'));
console.log('Search for rendering in Recruiter.tsx complete.');
