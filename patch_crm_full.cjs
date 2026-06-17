const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'Recruiter.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const CRLF = content.includes('\r\n');
const NL = CRLF ? '\r\n' : '\n';

let changes = 0;

// Helper: replace a block using line-by-line search
function replaceLines(startMarker, endMarker, newBlock) {
  const lines = content.split('\n');
  let startIdx = -1, endIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const stripped = lines[i].replace(/\r$/, '');
    if (startIdx === -1 && stripped.includes(startMarker)) startIdx = i;
    if (startIdx !== -1 && endIdx === -1 && stripped.includes(endMarker) && i > startIdx) {
      endIdx = i;
      break;
    }
  }
  if (startIdx === -1 || endIdx === -1) {
    console.log(`  WARN: Could not find block: "${startMarker}" ... "${endMarker}"`);
    return false;
  }
  const newLines = newBlock.split('\n');
  lines.splice(startIdx, endIdx - startIdx + 1, ...newLines);
  content = lines.join('\n');
  changes++;
  return true;
}

// Helper: simple string replace (LF-normalized)
function replaceStr(oldStr, newStr) {
  const normalOld = oldStr.replace(/\r\n/g, '\n');
  const normalContent = content.replace(/\r\n/g, '\n');
  if (!normalContent.includes(normalOld)) {
    console.log(`  WARN: String not found: "${oldStr.slice(0, 60)}..."`);
    return false;
  }
  content = normalContent.replace(normalOld, newStr);
  changes++;
  return true;
}

console.log('=== CRM PATCH SCRIPT ===');
console.log('File:', filePath);
console.log('Line endings:', CRLF ? 'CRLF' : 'LF');

// ============================================================
// FIX 1: Export CSV — fix header column order + all 27 fields
// ============================================================
console.log('\n[1] Fixing Export CSV...');
replaceStr(
  `  const handleExportCSV = () => {
    // Neural Data Mapping Logic
    const headers = [
      "Sourcing Recruiter Name", "Reporting Person", "Date", "Cold Calling", 
      "Client Name", "Designation (Job Title)", "State", "City", 
      "Gender", "Candidate Name", "Candidate Number", "Personal Mail Id", 
      "Date Of Birth", "Age", "Qualification", "Total Experience", 
      "Sector", "Current Org", "Current CTC", "Expected CTC", 
      "Notice Period", "Candidate CV Status", "Offered Salary", 
      "Remarks", "Reason Of Remarks", "Candidate CV Shared With", "Sourcing By"
    ];

    const csvRows = filteredCandidates.map((c: any) => [
       c.recruiterName || "N/A",
       c.reportingPerson || "N/A",
       c.sourcingDate || "",
       c.coldCalling || "N/A",
       c.clientName || "N/A",
       c.designation || c.jobRole || "N/A",
       c.state || "N/A",
       c.city || "N/A",
       c.gender || "N/A",
       c.name,
       c.phone,
       c.email || "N/A",
       c.dob || "N/A",
       c.age || "N/A",
       c.qualification || "N/A",
       c.totalExperience || "N/A",
       c.sector || "N/A",
       c.currentOrg || "N/A",
       c.currentCtc || "0",
       c.expectedCtc || "0",
       c.noticePeriod || "N/A",
       c.cvStatus || "N/A",
       c.offeredSalary || "0",
       c.remarks || "N/A",
       c.remarkReason || "N/A",
       c.cvSharedWith || "N/A",
       c.sourcingBy || "N/A"
    ]);

    const csvString = [
      headers.join(","),
      ...csvRows.map((row: any) => row.map((val: any) => \`"\${String(val).replace(/"/g, '""')}"\`).join(","))
    ].join("\\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", \`Givyansh_CRM_Export_\${new Date().toISOString().split('T')[0]}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`,
  `  const handleExportCSV = () => {
    const BOM = "\\uFEFF"; // UTF-8 BOM for proper Excel opening
    const headers = [
      "Sourcing Date", "Recruiter Name", "Reporting Person", "Cold Calling",
      "Client Name", "Designation (Job Title)", "State", "City",
      "Gender", "Candidate Name", "Candidate Number", "Personal Mail Id",
      "Date Of Birth", "Age", "Qualification", "Total Experience",
      "Sector", "Current Org", "Current CTC", "Expected CTC",
      "Notice Period", "Candidate CV Status", "Offered Salary",
      "Remarks", "Reason Of Remarks", "Candidate CV Shared With", "Sourcing By"
    ];

    const csvRows = filteredCandidates.map((c: any) => [
      c.sourcingDate || "",
      c.recruiterName || "",
      c.reportingPerson || "",
      c.coldCalling || "",
      c.clientName || "",
      c.designation || c.jobRole || "",
      c.state || "",
      c.city || "",
      c.gender || "",
      c.name || "",
      c.phone || "",
      c.email || "",
      c.dob || "",
      c.age !== undefined && c.age !== null && c.age !== "" ? c.age : "",
      c.qualification || "",
      c.totalExperience || "",
      c.sector || "",
      c.currentOrg || "",
      c.currentCtc !== undefined && c.currentCtc !== null && c.currentCtc !== "" ? c.currentCtc : "",
      c.expectedCtc !== undefined && c.expectedCtc !== null && c.expectedCtc !== "" ? c.expectedCtc : "",
      c.noticePeriod || "",
      c.cvStatus || "",
      c.offeredSalary !== undefined && c.offeredSalary !== null && c.offeredSalary !== "" ? c.offeredSalary : "",
      c.remarks || "",
      c.remarkReason || "",
      c.cvSharedWith || "",
      c.sourcingBy || ""
    ]);

    const escape = (val: any) => \`"\${String(val === null || val === undefined ? "" : val).replace(/"/g, '""')}"\`;
    const csvString = BOM + [
      headers.map(escape).join(","),
      ...csvRows.map((row: any) => row.map(escape).join(","))
    ].join("\\r\\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", \`CRM_Export_\${new Date().toISOString().split('T')[0]}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };`
);

// ============================================================
// FIX 2: Replace entire filter-inner-grid with SearchableSelect
//         and synced options matching the form exactly
// ============================================================
console.log('\n[2] Replacing filter panel with synced SearchableSelect dropdowns...');

const newFilterBlock = `                  <div className="filter-inner-grid" style={{ padding: "1.5rem 2.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                     <div className="filter-group">
                        <label>Sourcing Date</label>
                        <input type="date" value={activeFilters.sourcingDate} onChange={e => setActiveFilters({...activeFilters, sourcingDate: e.target.value})} />
                     </div>
                     <div className="filter-group">
                        <label>Client Name</label>
                        <FilterSelect options={clients.map((cl: any) => cl.name)} value={activeFilters.clientName} onChange={v => setActiveFilters({...activeFilters, clientName: v})} placeholder="All Clients" />
                     </div>
                     <div className="filter-group">
                        <label>Designation</label>
                        <FilterSelect options={uniqueDesignations as string[]} value={activeFilters.designation} onChange={v => setActiveFilters({...activeFilters, designation: v})} placeholder="All Designations" />
                     </div>
                     <div className="filter-group">
                        <label>State</label>
                        <FilterSelect options={["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"]} value={activeFilters.state} onChange={v => setActiveFilters({...activeFilters, state: v})} placeholder="All States" />
                     </div>
                     <div className="filter-group">
                        <label>Gender</label>
                        <FilterSelect options={["Male","Female"]} value={activeFilters.gender} onChange={v => setActiveFilters({...activeFilters, gender: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label>Age</label>
                        <input type="number" placeholder="Enter Age" value={activeFilters.age} onChange={e => setActiveFilters({...activeFilters, age: e.target.value})} />
                     </div>
                     <div className="filter-group">
                        <label>Qualification</label>
                        <FilterSelect options={["BA","BSc","BCom","BBA","BCA","BTech / BE","MBBS","BDS","BPharma","LLB","BEd","MA","MSc","MCom","MBA","MCA","MTech","LLM","MEd","PhD","CA","CS","CMA","CFA","Below 10th","10th Pass","12th Pass","ITI","Polytechnic Diploma","Other Diploma","Certificate Course","Other"]} value={activeFilters.qualification} onChange={v => setActiveFilters({...activeFilters, qualification: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label>Total Experience</label>
                        <FilterSelect options={["Fresher","Internship","0-6 Months","1 Year","2 Years","3 Years","4 Years","5 Years","6 Years","7 Years","8 Years","9 Years","10 Years","10+ Years","N/A"]} value={activeFilters.totalExperience} onChange={v => setActiveFilters({...activeFilters, totalExperience: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label>CV Status</label>
                        <FilterSelect options={["Shared","Non Shared"]} value={activeFilters.cvStatus} onChange={v => setActiveFilters({...activeFilters, cvStatus: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label>Remarks</label>
                        <FilterSelect options={["Connected","Interested","Not Connected","Not Interested"]} value={activeFilters.remarks} onChange={v => setActiveFilters({...activeFilters, remarks: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label>Sourcing By</label>
                        <FilterSelect options={sourcingPlatforms.map((p: any) => p.name)} value={activeFilters.sourcingBy} onChange={v => setActiveFilters({...activeFilters, sourcingBy: v})} placeholder="All Platforms" />
                     </div>
                     <div className="filter-group clear-filters-container">
                        <button
                           className="btn-clear-minimal"
                           onClick={() => setActiveFilters({
                              sourcingDate: "", clientName: "", designation: "", state: "", gender: "",
                              age: "", qualification: "", totalExperience: "", cvStatus: "", remarks: "", sourcingBy: ""
                           })}
                        >
                           Reset Filters
                        </button>
                     </div>
                  </div>`;

const ok2 = replaceLines(
  'className="filter-inner-grid"',
  'Reset Filters',
  newFilterBlock
);
if (ok2) console.log('  ✓ Filter panel replaced');

// ============================================================
// FIX 3: Add FilterSelect component (after SearchableSelect)
// ============================================================
console.log('\n[3] Adding FilterSelect component...');

const filterSelectComponent = `const FilterSelect = ({ options, value, onChange, placeholder }: { options: string[], value: string, onChange: (v: string) => void, placeholder?: string }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const displayValue = value || placeholder || "All";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => { setOpen(!open); setSearch(""); }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", background: "#fff", fontSize: "0.85rem", color: value ? "#0f172a" : "#94a3b8", userSelect: "none", minHeight: "36px" }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayValue}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0, marginLeft: "4px" }}><path d="M1 3l5 5 5-5" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 3px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 9999, overflow: "hidden" }}>
          <div style={{ padding: "6px" }}>
            <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ width: "100%", padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }} onClick={e => e.stopPropagation()} />
          </div>
          <div style={{ maxHeight: "180px", overflowY: "auto" }}>
            <div onClick={() => { onChange(""); setOpen(false); setSearch(""); }} style={{ padding: "7px 12px", cursor: "pointer", fontSize: "0.82rem", color: !value ? "#2563eb" : "#64748b", background: !value ? "#eff6ff" : "transparent", fontWeight: !value ? 700 : 400 }}>
              {placeholder || "All"}
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: "10px", color: "#94a3b8", textAlign: "center", fontSize: "0.8rem" }}>No results</div>
            ) : filtered.map((opt, i) => (
              <div key={i} onClick={() => { onChange(opt); setOpen(false); setSearch(""); }} style={{ padding: "7px 12px", cursor: "pointer", fontSize: "0.82rem", color: opt === value ? "#2563eb" : "#0f172a", background: opt === value ? "#eff6ff" : "transparent", fontWeight: opt === value ? 600 : 400 }}>
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

`;

// Add FilterSelect right before CRMView
const crmViewMarker = 'const CRMView = ({ candidates';
if (content.includes(crmViewMarker)) {
  content = content.replace(crmViewMarker, filterSelectComponent + crmViewMarker);
  changes++;
  console.log('  ✓ FilterSelect component added');
} else {
  console.log('  WARN: CRMView marker not found');
}

// ============================================================
// Write output
// ============================================================
if (changes > 0) {
  // Restore CRLF if original had it
  if (CRLF) {
    content = content.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n✅ SUCCESS: ${changes} change(s) applied and file saved.`);
} else {
  console.log('\n❌ No changes were applied.');
}
