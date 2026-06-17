const fs = require('fs');
const path = require('path');

const recruiterPath = path.join(__dirname, 'src', 'pages', 'dashboard', 'Recruiter.tsx');
const jobsPath = path.join(__dirname, 'src', 'components', 'dashboard', 'Jobs.tsx');

// 1. Extract categories from Recruiter.tsx
const recruiterCode = fs.readFileSync(recruiterPath, 'utf8');
const match = recruiterCode.match(/const LEAD_CATEGORIES = ({[\s\S]*?});/);
if (!match) {
    console.error("Could not find LEAD_CATEGORIES in Recruiter.tsx");
    process.exit(1);
}

let leadCategories;
try {
    leadCategories = eval('(' + match[1] + ')');
} catch (e) {
    console.error("Failed to parse LEAD_CATEGORIES:", e);
    process.exit(1);
}

const allDesignations = new Set();
for (const [group, cats] of Object.entries(leadCategories)) {
    if (group === "Experience Level" || group === "Employment Type" || group === "Industry") {
        continue;
    }
    for (const cat of cats) {
        allDesignations.add(cat);
    }
}
const sortedDesignations = Array.from(allDesignations).sort();

let jobsCode = fs.readFileSync(jobsPath, 'utf8');

// 2. Insert JOB_DESIGNATIONS at the top of Jobs.tsx (before export default function Jobs)
const targetDeclaration = 'export default function Jobs({ role }: { role: string }) {';
const designationsDeclaration = 'const JOB_DESIGNATIONS = ' + JSON.stringify(sortedDesignations, null, 2) + ';\n\n';

if (jobsCode.includes(designationsDeclaration)) {
    // Already added, skip
    console.log("JOB_DESIGNATIONS already present in Jobs.tsx");
} else {
    jobsCode = jobsCode.replace(targetDeclaration, designationsDeclaration + targetDeclaration);
    console.log("Inserted JOB_DESIGNATIONS into Jobs.tsx");
}

// 3. Insert customTitle state inside Jobs component
const stateHookMarker = '  const [newJob, setNewJob] = useState({';
const newStateHookCode = '  const [customTitle, setCustomTitle] = useState("");\n  const [newJob, setNewJob] = useState({';
if (jobsCode.includes(stateHookMarker) && !jobsCode.includes('customTitle')) {
    jobsCode = jobsCode.replace(stateHookMarker, newStateHookCode);
    console.log("Added customTitle state hook");
}

// 4. Insert SearchableSelect helper component inside Jobs component
// Let's place it right after SearchableFilterSelect
const filterSelectMarker = '    return (\n      <div ref={dropdownRef} className="filter-group" style={{ position: "relative" }}>';
// Let's find the closing tag of SearchableFilterSelect which is `  };` around line 204
const targetMarker = '  const [newJob, setNewJob] =';
const searchableSelectCode = `  const SearchableSelect = ({ options, value, onChange, placeholder }: { options: string[], value: string, onChange: (v: string) => void, placeholder?: string }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

    return (
      <div ref={ref} style={{ position: "relative", width: "100%" }}>
        <div
          onClick={() => { setOpen(!open); setSearch(""); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", border: "1.5px solid #e2e8f0", borderRadius: "14px", cursor: "pointer", background: "#fff", fontSize: "1rem", color: value ? "#0f172a" : "#94a3b8", userSelect: "none", minHeight: "50px" }}
        >
          <span>{value || placeholder || "Select"}</span>
          <LucideChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }} />
        </div>
        {open && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 10000, overflow: "hidden" }}>
            <div style={{ padding: "8px" }}>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "12px", color: "#94a3b8", textAlign: "center", fontSize: "0.85rem" }}>No results</div>
              ) : filtered.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
                  style={{ padding: "10px 16px", cursor: "pointer", fontSize: "0.9rem", color: opt === value ? "#2563eb" : "#334155", background: opt === value ? "#eff6ff" : "transparent", fontWeight: opt === value ? 600 : 400 }}
                  onMouseEnter={e => { if (opt !== value) (e.target as HTMLElement).style.background = "#f8fafc"; }}
                  onMouseLeave={e => { if (opt !== value) (e.target as HTMLElement).style.background = "transparent"; }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };\n\n  `;

if (jobsCode.includes('const SearchableSelect =')) {
    console.log("SearchableSelect component already present in Jobs.tsx");
} else {
    jobsCode = jobsCode.replace(targetMarker, searchableSelectCode + targetMarker);
    console.log("Added SearchableSelect component to Jobs.tsx");
}

// 5. Update resetForm to clear customTitle
const resetFormMarker = '  const resetForm = () => {\n    setNewJob({';
const newResetFormCode = '  const resetForm = () => {\n    setCustomTitle("");\n    setNewJob({';
if (jobsCode.includes(resetFormMarker)) {
    jobsCode = jobsCode.replace(resetFormMarker, newResetFormCode);
    console.log("Updated resetForm to clear customTitle");
}

// 6. Update startEditing to populate customTitle when editing a custom designation
const startEditingMarker = '  const startEditing = (job: Job) => {\n    setNewJob({';
const newStartEditingCode = '  const startEditing = (job: Job) => {\n    if (job.title && !JOB_DESIGNATIONS.includes(job.title)) {\n      setCustomTitle(job.title);\n    } else {\n      setCustomTitle("");\n    }\n    setNewJob({';
if (jobsCode.includes(startEditingMarker)) {
    jobsCode = jobsCode.replace(startEditingMarker, newStartEditingCode);
    console.log("Updated startEditing to set customTitle");
}

// 7. Replace the Job Title input field markup
const inputGroupMarker = '              <div className="form-group-v2">\n                 <label>Job Title *</label>\n                 <input placeholder="Try Data Entry Manager" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />\n              </div>';
const newInputGroupCode = `              <div className="form-group-v2">
                 <label>Job Title *</label>
                 <SearchableSelect 
                   options={[...JOB_DESIGNATIONS, "Other"]} 
                   value={newJob.title === "Other" ? "Other" : (JOB_DESIGNATIONS.includes(newJob.title) ? newJob.title : (newJob.title ? "Other" : ""))} 
                   onChange={v => {
                     if (v === "Other") {
                       setNewJob({...newJob, title: "Other"});
                       setCustomTitle("");
                     } else {
                       setNewJob({...newJob, title: v});
                     }
                   }} 
                   placeholder="Select Job Title" 
                 />
                 {(newJob.title === "Other" || (newJob.title && !JOB_DESIGNATIONS.includes(newJob.title))) && (
                    <div style={{ marginTop: "12px" }} className="animate-fade-in">
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Enter Custom Job Title *</label>
                      <input 
                        type="text" 
                        placeholder="Type custom job title..." 
                        value={newJob.title === "Other" ? customTitle : newJob.title} 
                        onChange={e => {
                          setCustomTitle(e.target.value);
                          setNewJob({...newJob, title: e.target.value});
                        }} 
                        style={{ width: "100%", padding: "12px 18px", borderRadius: "14px", border: "1.5px solid #cbd5e1", outline: "none", fontSize: "1rem", color: "#0f172a" }} 
                      />
                    </div>
                 )}
              </div>`;

if (jobsCode.includes(inputGroupMarker)) {
    jobsCode = jobsCode.replace(inputGroupMarker, newInputGroupCode);
    console.log("Replaced Job Title input with searchable select");
} else {
    // Try without spaces/newlines
    console.warn("Could not find inputGroupMarker directly, you might need manual replacement or standard search");
}

fs.writeFileSync(jobsPath, jobsCode, 'utf8');
console.log("Done patching Jobs.tsx!");
