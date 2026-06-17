import fs from 'fs';
import path from 'path';

const filePath = 'c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\src\\pages\\dashboard\\Recruiter.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("Total lines:", lines.length);

lines.forEach((line, index) => {
  if (line.includes('export default') || line.includes('useParams') || line.includes('function Recruiter') || line.includes('const Recruiter')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});
