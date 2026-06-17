const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'Recruiter.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Starting Bulletproof Patch...');

// 1. Fix Remarks Filter Options (Adding Not Connected)
const oldRemarks = `<label>Remarks</label>
                        <select value={activeFilters.remarks} onChange={e => setActiveFilters({...activeFilters, remarks: e.target.value})}>
                           <option value="">All</option>
                           <option value="Connected">Connected</option>
                           <option value="Interested">Interested</option>
                           <option value="Not Interested">Not Interested</option>
                        </select>`;

const newRemarks = `<label>Remarks</label>
                        <select value={activeFilters.remarks} onChange={e => setActiveFilters({...activeFilters, remarks: e.target.value})}>
                           <option value="">All</option>
                           <option value="Connected">Connected</option>
                           <option value="Interested">Interested</option>
                           <option value="Not Connected">Not Connected</option>
                           <option value="Not Interested">Not Interested</option>
                        </select>`;

// 2. Fix State Filter Options (Full list of 36)
const oldState = `<label>State</label>
                        <select value={activeFilters.state} onChange={e => setActiveFilters({...activeFilters, state: e.target.value})}>
                           <option value="">All States</option>
                           {["Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Haryana", "Karnataka", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>`;

const newState = `<label>State</label>
                        <select value={activeFilters.state} onChange={e => setActiveFilters({...activeFilters, state: e.target.value})}>
                           <option value="">All States</option>
                           {["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>`;

// 3. Fix Qualification Filter Options (Full list)
const oldQual = `<label>Qualification</label>
                        <select value={activeFilters.qualification} onChange={e => setActiveFilters({...activeFilters, qualification: e.target.value})}>
                           <option value="">All</option>
                           {["BA", "BS", "BTech", "MBA", "MCA", "Graduate", "12th Pass"].map(q => <option key={q} value={q}>{q}</option>)}
                        </select>`;

const newQual = `<label>Qualification</label>
                        <select value={activeFilters.qualification} onChange={e => setActiveFilters({...activeFilters, qualification: e.target.value})}>
                           <option value="">All</option>
                           {["BA","BSc","BCom","BBA","BCA","BTech / BE","MBBS","BDS","BPharma","LLB","BEd","MA","MSc","MCom","MBA","MCA","MTech","LLM","MEd","PhD","CA","CS","CMA","CFA","Below 10th","10th Pass","12th Pass","ITI","Polytechnic Diploma","Other Diploma","Certificate Course","Other"].map(q => <option key={q} value={q}>{q}</option>)}
                        </select>`;

// 4. Fix Experience Filter Options (Full list)
const oldExp = `<label>Total Experience</label>
                        <select value={activeFilters.totalExperience} onChange={e => setActiveFilters({...activeFilters, totalExperience: e.target.value})}>
                           <option value="">All</option>
                           {["Fresher", "1 Year", "2 Years", "3 Years", "5+ Years"].map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>`;

const newExp = `<label>Total Experience</label>
                        <select value={activeFilters.totalExperience} onChange={e => setActiveFilters({...activeFilters, totalExperience: e.target.value})}>
                           <option value="">All</option>
                           {["Fresher","Internship","0-6 Months","1 Year","2 Years","3 Years","4 Years","5 Years","6 Years","7 Years","8 Years","9 Years","10 Years","10+ Years","N/A"].map(ex => <option key={ex} value={ex}>{ex}</option>)}
                        </select>`;

function applyReplacement(oldT, newT, name) {
   // Try with exact match first
   if (content.includes(oldT)) {
      content = content.replace(oldT, newT);
      console.log(`✓ Fixed ${name} (Exact Match)`);
      return true;
   }
   // Try with CRLF conversion
   let oldCRLF = oldT.replace(/\n/g, '\r\n');
   if (content.includes(oldCRLF)) {
      content = content.replace(oldCRLF, newT.replace(/\n/g, '\r\n'));
      console.log(`✓ Fixed ${name} (CRLF Match)`);
      return true;
   }
   // Try normalized match (remove all whitespace for comparison)
   console.log(`✗ Failed to find block for ${name}. Checking for partial match...`);
   return false;
}

applyReplacement(oldRemarks, newRemarks, 'Remarks');
applyReplacement(oldState, newState, 'State');
applyReplacement(oldQual, newQual, 'Qualification');
applyReplacement(oldExp, newExp, 'Experience');

fs.writeFileSync(filePath, content, 'utf8'); 
console.log('Patch complete.');