import fs from 'fs';
const content = fs.readFileSync('server/index.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('actionType') || line.includes('action_type') || line.toLowerCase().includes('register')) {
    if (line.includes('PointHistory') || line.includes('PointHistory.create') || line.includes('pointsAwarded') || line.includes('points_awarded')) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  }
});
