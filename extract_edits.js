const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\Users\\goswa\\.gemini\\antigravity-ide\\brain\\3cc5773c-30c4-4219-bc44-1ec10af30e7e\\.system_generated\\logs\\transcript.jsonl');
  let output = '';

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('replace_file_content') || line.includes('multi_replace_file_content')) {
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
           obj.tool_calls.forEach(tc => {
              if (tc.name === 'multi_replace_file_content' || tc.name === 'replace_file_content') {
                 output += "File: " + tc.arguments.TargetFile + "\n";
                 output += JSON.stringify(tc.arguments.ReplacementChunks || tc.arguments.ReplacementContent) + "\n";
                 output += "-----\n";
              }
           });
        }
      } catch (e) {}
    }
  }
  fs.writeFileSync('C:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\edits_output.txt', output);
}

processLineByLine();
