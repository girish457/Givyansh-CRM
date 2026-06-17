import fs from 'fs';
const file = 'src/components/dashboard/ControlCenter.tsx';
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log(`=== Matches in ${file} ===`);
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('gamification') || line.toLowerCase().includes('economy')) {
      console.log(`  ${idx + 1}: ${line.trim()}`);
    }
  });
} else {
  console.log(`${file} does not exist.`);
}
