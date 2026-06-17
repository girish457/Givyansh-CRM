const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'Recruiter.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Starting Final Searchable Filters Patch...');

// 1. Update SearchableSelect to include "All" at the top for filters
const searchableSelectUpdate = `
          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {placeholder && (
              <div 
                onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                style={{ padding: "10px 12px", cursor: "pointer", fontSize: "0.9rem", color: "#64748b", borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}
              >
                {placeholder === "Select" ? "None" : placeholder}
              </div>
            )}
            {filtered.map((opt, i) => (
`;

content = content.replace(/<div style=\{\{ maxHeight: "250px", overflowY: "auto" \}\}>\s*\{filtered\.map\(\(opt, i\) => \(/, searchableSelectUpdate);

function smartReplace(regex, replacement, name) {
    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        console.log(`✓ Fixed ${name}`);
        return true;
    }
    console.log(`✗ Could not find ${name} block`);
    return false;
}

// Remarks Filter
const remarksRegex = /<div className="filter-group">\s*<label>Remarks<\/label>\s*<select[^>]*>[\s\S]*?<\/select>\s*<\/div>/;
const newRemarks = `<div className="filter-group">
                        <label>Remarks</label>
                        <SearchableSelect 
                           options={["Connected", "Interested", "Not Connected", "Not Interested"]} 
                           value={activeFilters.remarks} 
                           onChange={v => setActiveFilters({...activeFilters, remarks: v})} 
                           placeholder="All" 
                        />
                     </div>`;

// State Filter
const stateRegex = /<div className="filter-group">\s*<label>State<\/label>\s*<select[^>]*>[\s\S]*?<\/select>\s*<\/div>/;
const newState = `<div className="filter-group">
                        <label>State</label>
                        <SearchableSelect 
                           options={["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"]} 
                           value={activeFilters.state} 
                           onChange={v => setActiveFilters({...activeFilters, state: v})} 
                           placeholder="All States" 
                        />
                     </div>`;

// Qualification Filter
const qualRegex = /<div className="filter-group">\s*<label>Qualification<\/label>\s*<select[^>]*>[\s\S]*?<\/select>\s*<\/div>/;
const newQual = `<div className="filter-group">
                        <label>Qualification</label>
                        <SearchableSelect 
                           options={["BA","BSc","BCom","BBA","BCA","BTech / BE","MBBS","BDS","BPharma","LLB","BEd","MA","MSc","MCom","MBA","MCA","MTech","LLM","MEd","PhD","CA","CS","CMA","CFA","Below 10th","10th Pass","12th Pass","ITI","Polytechnic Diploma","Other Diploma","Certificate Course","Other"]} 
                           value={activeFilters.qualification} 
                           onChange={v => setActiveFilters({...activeFilters, qualification: v})} 
                           placeholder="All" 
                        />
                     </div>`;

// Total Experience Filter
const expRegex = /<div className="filter-group">\s*<label>Total Experience<\/label>\s*<select[^>]*>[\s\S]*?<\/select>\s*<\/div>/;
const newExp = `<div className="filter-group">
                        <label>Total Experience</label>
                        <SearchableSelect 
                           options={["Fresher","Internship","0-6 Months","1 Year","2 Years","3 Years","4 Years","5 Years","6 Years","7 Years","8 Years","9 Years","10 Years","10+ Years","N/A"]} 
                           value={activeFilters.totalExperience} 
                           onChange={v => setActiveFilters({...activeFilters, totalExperience: v})} 
                           placeholder="All" 
                        />
                     </div>`;

// Client Name Filter
const clientRegex = /<div className="filter-group">\s*<label>Client Name<\/label>\s*<select[^>]*>[\s\S]*?<\/select>\s*<\/div>/;
const newClient = `<div className="filter-group">
                        <label>Client Name</label>
                        <SearchableSelect 
                           options={clients.map((cl: any) => cl.name)} 
                           value={activeFilters.clientName} 
                           onChange={v => setActiveFilters({...activeFilters, clientName: v})} 
                           placeholder="All Clients" 
                        />
                     </div>`;

// Designation Filter
const desigRegex = /<div className="filter-group">\s*<label>Designation<\/label>\s*<select[^>]*>[\s\S]*?<\/select>\s*<\/div>/;
const newDesig = `<div className="filter-group">
                        <label>Designation</label>
                        <SearchableSelect 
                           options={uniqueDesignations as string[]} 
                           value={activeFilters.designation} 
                           onChange={v => setActiveFilters({...activeFilters, designation: v})} 
                           placeholder="All Designations" 
                        />
                     </div>`;

// Sourcing By Filter
const sourcingRegex = /<div className="filter-group">\s*<label>Sourcing By<\/label>\s*<select[^>]*>[\s\S]*?<\/select>\s*<\/div>/;
const newSourcing = `<div className="filter-group">
                        <label>Sourcing By</label>
                        <SearchableSelect 
                           options={sourcingPlatforms.map((p: any) => p.name)} 
                           value={activeFilters.sourcingBy} 
                           onChange={v => setActiveFilters({...activeFilters, sourcingBy: v})} 
                           placeholder="All Platforms" 
                        />
                     </div>`;

// Gender Filter
const genderRegex = /<div className="filter-group">\s*<label>Gender<\/label>\s*<select[^>]*>[\s\S]*?<\/select>\s*<\/div>/;
const newGender = `<div className="filter-group">
                        <label>Gender</label>
                        <SearchableSelect 
                           options={["Male", "Female"]} 
                           value={activeFilters.gender} 
                           onChange={v => setActiveFilters({...activeFilters, gender: v})} 
                           placeholder="All" 
                        />
                     </div>`;

// CV Status Filter
const cvStatusRegex = /<div className="filter-group">\s*<label>CV Status<\/label>\s*<select[^>]*>[\s\S]*?<\/select>\s*<\/div>/;
const newCvStatus = `<div className="filter-group">
                        <label>CV Status</label>
                        <SearchableSelect 
                           options={["Shared", "Non Shared"]} 
                           value={activeFilters.cvStatus} 
                           onChange={v => setActiveFilters({...activeFilters, cvStatus: v})} 
                           placeholder="All" 
                        />
                     </div>`;

smartReplace(remarksRegex, newRemarks, 'Remarks');
smartReplace(stateRegex, newState, 'State');
smartReplace(qualRegex, newQual, 'Qualification');
smartReplace(expRegex, newExp, 'Experience');
smartReplace(clientRegex, newClient, 'Client Name');
smartReplace(desigRegex, newDesig, 'Designation');
smartReplace(sourcingRegex, newSourcing, 'Sourcing By');
smartReplace(genderRegex, newGender, 'Gender');
smartReplace(cvStatusRegex, newCvStatus, 'CV Status');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Final Searchable Patch complete!');
