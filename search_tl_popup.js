import fs from 'fs';
const file = 'src/pages/dashboard/TL.tsx';
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log(`=== Matches in ${file} ===`);
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('reminder') || line.toLowerCase().includes('followup') || line.toLowerCase().includes('popup')) {
      if (line.trim().length > 0 && !line.includes('import')) {
        console.log(`  ${idx + 1}: ${line.trim()}`);
      }
    }
  });
}
