import fs from 'fs';

const files = [
  'src/components/dashboard/LeadDataView.tsx',
  'src/components/dashboard/BossLeadIntelligence.tsx',
  'src/components/dashboard/RecruiterIncentiveTracker.tsx',
  'src/pages/dashboard/Recruiter.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`=== Matches in ${file} ===`);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('gamification') || line.includes('actionType') || line.includes('lead_') || line.includes('forward') || line.includes('share') || line.includes('post(')) {
        if (line.trim().length > 0 && !line.includes('import')) {
          console.log(`  ${idx + 1}: ${line.trim()}`);
        }
      }
    });
  }
});
