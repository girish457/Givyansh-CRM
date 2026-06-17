const fs = require('fs');
const p = require('path').join(__dirname, 'src','pages','dashboard','Recruiter.tsx');
let lines = fs.readFileSync(p, 'utf8').split('\n');
let changed = 0;

function fixSelectOptions(anchorText, newOptions) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(anchorText)) {
      // Find the <select line (it or nearby)
      let selectLine = i;
      // scan up to find the <select if anchor is the label
      for (let k = i; k < Math.min(i+3, lines.length); k++) {
        if (lines[k].includes('<select ') || lines[k].includes('<select\t')) { selectLine = k; break; }
      }
      // Find </select>
      let closeIdx = selectLine + 1;
      while (closeIdx < lines.length && !lines[closeIdx].includes('</select>')) closeIdx++;
      // Get indent from first option line
      const indent = (lines[selectLine+1] || '').match(/^(\s*)/)[1] || '                           ';
      const opts = newOptions.map(o => `${indent}${o}`);
      lines.splice(selectLine+1, closeIdx - selectLine - 1, ...opts);
      console.log('✓ Fixed: ' + anchorText.trim());
      changed++;
      return;
    }
  }
  console.log('✗ Not found: ' + anchorText.trim());
}

// Fix Remarks filter - add "Not Connected"
fixSelectOptions('activeFilters.remarks', [
  '<option value="">All</option>',
  '<option value="Connected">Connected</option>',
  '<option value="Interested">Interested</option>',
  '<option value="Not Connected">Not Connected</option>',
  '<option value="Not Interested">Not Interested</option>',
]);

// Fix State filter - all 36 states (currently only 12)
fixSelectOptions('activeFilters.state', [
  '<option value="">All States</option>',
  ...["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"]
    .map(s => `<option value="${s}">${s}</option>`),
]);

// Fix Qualification filter - all options matching form
fixSelectOptions('activeFilters.qualification', [
  '<option value="">All</option>',
  ...["BA","BSc","BCom","BBA","BCA","BTech / BE","MBBS","BDS","BPharma","LLB","BEd","MA","MSc","MCom","MBA","MCA","MTech","LLM","MEd","PhD","CA","CS","CMA","CFA","Below 10th","10th Pass","12th Pass","ITI","Polytechnic Diploma","Other Diploma","Certificate Course","Other"]
    .map(q => `<option value="${q}">${q}</option>`),
]);

// Fix Total Experience filter - all options matching form
fixSelectOptions('activeFilters.totalExperience', [
  '<option value="">All</option>',
  ...["Fresher","Internship","0-6 Months","1 Year","2 Years","3 Years","4 Years","5 Years","6 Years","7 Years","8 Years","9 Years","10 Years","10+ Years","N/A"]
    .map(e => `<option value="${e}">${e}</option>`),
]);

fs.writeFileSync(p, lines.join('\n'), 'utf8');
console.log('\nTotal changes: ' + changed);
console.log('File saved.');
