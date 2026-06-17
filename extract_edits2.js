const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\goswa\\.gemini\\antigravity-ide\\brain\\3cc5773c-30c4-4219-bc44-1ec10af30e7e\\.system_generated\\logs\\transcript.jsonl', 'utf8');
const lines = content.split('\n');

let oldServerIndex = '';
for (let line of lines) {
    if (line.includes('"TargetFile":"c:\\\\Users\\\\goswa\\\\OneDrive\\\\Desktop\\\\Fast RMS\\\\Fast RMS\\\\server\\\\index.js"')) {
        oldServerIndex += line + '\n';
    }
}
fs.writeFileSync('C:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\old_server_index.txt', oldServerIndex);
