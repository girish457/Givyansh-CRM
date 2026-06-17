import fs from 'fs';
const file = 'src/pages/dashboard/TL.tsx';
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log(`=== Matches in ${file} ===`);
  lines.forEach((line, idx) => {
    if (line.includes('fetchCandidates') || line.includes('const [candidates') || line.includes('candidates =')) {
      if (line.trim().length > 0 && !line.includes('import')) {
        console.log(`  ${idx + 1}: ${line.trim()}`);
      }
    }
  });
}
