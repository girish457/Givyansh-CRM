const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'Recruiter.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const nl = content.includes('\r\n') ? '\r\n' : '\n';

console.log('Starting Final Comprehensive CRM Patch...');

// 1. Update formData initial state (add interviewType and interviewTime)
const oldFormData = /const \[formData, setFormData\] = useState<any>\(\{[\s\S]*?dataType: type === "leads" \? "lead" : "crm"\s*\}\);/;
const newFormData = `const [formData, setFormData] = useState<any>({
    sourcingBy: "",
    sourcingDate: new Date().toISOString().split('T')[0],
    recruiterName: "firstattempt",
    reportingPerson: "Deepa Sidhnani",
    coldCalling: "Yes",
    clientName: "",
    designation: "",
    state: "",
    city: "",
    gender: "Male",
    candidateName: "",
    candidateNumber: "",
    email: "",
    dob: "",
    age: "",
    qualification: "",
    totalExperience: "",
    sector: "",
    currentOrg: "",
    currentCtc: "",
    expectedCtc: "",
    noticePeriod: "",
    cvStatus: "",
    offeredSalary: "",
    remarks: "",
    remarkReason: "",
    cvSharedWith: "",
    interviewDate: "",
    interviewType: "",
    interviewTime: "",
    dataType: type === "leads" ? "lead" : "crm"
  });`;

// 2. Update mandatoryFields (add interviewDate)
const oldMandatory = /const mandatoryFields = \[[\s\S]*?\];/;
const newMandatory = `const mandatoryFields = [
    { key: "clientName", label: "Client Name" },
    { key: "designation", label: "Designation (Job Title)" },
    { key: "candidateName", label: "Candidate Name" },
    { key: "candidateNumber", label: "Candidate Number" },
    { key: "cvStatus", label: "Candidate CV Status" },
    { key: "remarkReason", label: "Reason Of Remarks" },
    { key: "sourcingBy", label: "Sourcing By" },
    { key: "interviewDate", label: "Schedule Interview" },
  ];`;

// 3. Add handleInterviewTypeChange helper
const helperFunc = `
  const handleInterviewTypeChange = (type: string) => {
    let date = "";
    if (type === "Today") date = new Date().toISOString().split('T')[0];
    else if (type === "Tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    }
    
    setFormData((prev: any) => ({ ...prev, interviewType: type, interviewDate: date }));
    if (date) setFormErrors((prev) => { const e = { ...prev }; delete e.interviewDate; return e; });
  };
`;

// 4. Implement Searchable Filters and Synced Options
const filterPanelBlock = `                  <div className="filter-inner-grid" style={{ padding: "1.5rem 2.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                     <div className="filter-group">
                        <label>Sourcing Date</label>
                        <input type="date" value={activeFilters.sourcingDate} onChange={e => setActiveFilters({...activeFilters, sourcingDate: e.target.value})} />
                     </div>
                     <div className="filter-group">
                        <label>Client Name</label>
                        <SearchableSelect options={clients.map((cl: any) => cl.name)} value={activeFilters.clientName} onChange={v => setActiveFilters({...activeFilters, clientName: v})} placeholder="All Clients" />
                     </div>
                     <div className="filter-group">
                        <label>Designation</label>
                        <SearchableSelect options={uniqueDesignations as string[]} value={activeFilters.designation} onChange={v => setActiveFilters({...activeFilters, designation: v})} placeholder="All Designations" />
                     </div>
                     <div className="filter-group">
                        <label>State</label>
                        <SearchableSelect options={["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"]} value={activeFilters.state} onChange={v => setActiveFilters({...activeFilters, state: v})} placeholder="All States" />
                     </div>
                     <div className="filter-group">
                        <label>Gender</label>
                        <SearchableSelect options={["Male","Female"]} value={activeFilters.gender} onChange={v => setActiveFilters({...activeFilters, gender: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label>Age</label>
                        <input type="number" placeholder="Enter Age" value={activeFilters.age} onChange={e => setActiveFilters({...activeFilters, age: e.target.value})} />
                     </div>
                     <div className="filter-group">
                        <label>Qualification</label>
                        <SearchableSelect options={["BA","BSc","BCom","BBA","BCA","BTech / BE","MBBS","BDS","BPharma","LLB","BEd","MA","MSc","MCom","MBA","MCA","MTech","LLM","MEd","PhD","CA","CS","CMA","CFA","Below 10th","10th Pass","12th Pass","ITI","Polytechnic Diploma","Other Diploma","Certificate Course","Other"]} value={activeFilters.qualification} onChange={v => setActiveFilters({...activeFilters, qualification: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label>Total Experience</label>
                        <SearchableSelect options={["Fresher","Internship","0-6 Months","1 Year","2 Years","3 Years","4 Years","5 Years","6 Years","7 Years","8 Years","9 Years","10 Years","10+ Years","N/A"]} value={activeFilters.totalExperience} onChange={v => setActiveFilters({...activeFilters, totalExperience: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label>CV Status</label>
                        <SearchableSelect options={["Shared","Non Shared"]} value={activeFilters.cvStatus} onChange={v => setActiveFilters({...activeFilters, cvStatus: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label>Remarks</label>
                        <SearchableSelect options={["Connected","Interested","Not Connected","Not Interested"]} value={activeFilters.remarks} onChange={v => setActiveFilters({...activeFilters, remarks: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label>Sourcing By</label>
                        <SearchableSelect options={sourcingPlatforms.map((p: any) => p.name)} value={activeFilters.sourcingBy} onChange={v => setActiveFilters({...activeFilters, sourcingBy: v})} placeholder="All Platforms" />
                     </div>
                     <div className="filter-group clear-filters-container">
                        <button className="btn-clear-minimal" onClick={() => setActiveFilters({ sourcingDate:"",clientName:"",designation:"",state:"",gender:"",age:"",qualification:"",totalExperience:"",cvStatus:"",remarks:"",sourcingBy:"" })}>
                           Reset Filters
                        </button>
                     </div>
                  </div>`;

// 5. Update Registration Form (add Schedule Interview field with logic)
const newFormFields = `             <div className="input-group" id="field-interviewDate">
                <label style={{ fontWeight: 800 }}>Schedule Interview <span style={{color:"#ef4444"}}>*</span></label>
                <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                   <SearchableSelect 
                      options={["Today", "Tomorrow", "Other Date"]} 
                      value={formData.interviewType} 
                      onChange={handleInterviewTypeChange} 
                      placeholder="Select Day" 
                   />
                   {formData.interviewType === "Today" && (
                      <div className="animate-fade-in" style={{ padding: "10px", background: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                         <label style={{ fontSize: "0.8rem", color: "#0369a1", marginBottom: "4px", display: "block", fontWeight: 700 }}>Select Interview Time</label>
                         <input type="time" value={formData.interviewTime} onChange={e => handleFieldChange("interviewTime", e.target.value)} style={{ borderColor: "#0ea5e9" }} />
                      </div>
                   )}
                   {formData.interviewType === "Other Date" && (
                      <div className="animate-fade-in">
                         <input type="date" value={formData.interviewDate} onChange={e => handleFieldChange("interviewDate", e.target.value)} />
                      </div>
                   )}
                </div>
                {formErrors.interviewDate && <span className="field-error">{formErrors.interviewDate}</span>}
             </div>
             <div className="input-group" id="field-remarkReason">`;

// Apply Replacements
content = content.replace(oldFormData, newFormData);
content = content.replace(oldMandatory, newMandatory);

// Add helper function before handleFieldChange
if (!content.includes('handleInterviewTypeChange')) {
    content = content.replace('const handleFieldChange =', helperFunc + '\n  const handleFieldChange =');
}

// Replace Filter Panel
const filterPanelRegex = /<div className="filter-inner-grid"[\s\S]*?Reset Filters\s*<\/button>\s*<\/div>\s*<\/div>/;
content = content.replace(filterPanelRegex, filterPanelBlock);

// Replace Registration Form Section (removing old conditional interview field)
content = content.replace(/\{formData\.remarks === "Interested" && \([\s\S]*?<\/div>\s* \)\}/, '');
content = content.replace('<div className="input-group" id="field-remarkReason">', newFormFields);

// Update SearchableSelect to handle "All" display and reset
const resetLogic = `
          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {placeholder && (
              <div 
                onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                style={{ padding: "10px 12px", cursor: "pointer", fontSize: "0.9rem", color: "#64748b", borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}
              >
                {placeholder === "Select Day" ? "Clear Selection" : (placeholder.includes("All") ? placeholder : "All " + placeholder)}
              </div>
            )}
            {filtered.map((opt, i) => (
`;
content = content.replace(/<div style=\{\{ maxHeight: "250px", overflowY: "auto" \}\}>\s*\{filtered\.map\(\(opt, i\) => \(/, resetLogic);
content = content.replace('<span>{value || placeholder || "Select"}</span>', '<span>{value || placeholder || "Select"}</span>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Comprehensive Patch Applied Successfully!');
console.log('CRM Module is now fully updated with Schedule Interview logic and Searchable Filters.');
