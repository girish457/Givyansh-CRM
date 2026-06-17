const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\server\\index.js', 'utf8');
const lines = content.split('\n');
const results = [];
lines.forEach((line, i) => {
    if (line.includes('app.put(') || line.includes('app.post(') || line.includes('status')) {
        if (line.includes('candidate') || line.includes('Candidate')) {
            results.push(`${i + 1}: ${line}`);
        }
    }
});
fs.writeFileSync('c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\search_result.txt', results.join('\n'));
