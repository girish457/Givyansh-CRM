import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LucideUsers,
  LucideDatabase,
  LucideUserCheck,
  LucideActivity,
  LucideTrendingUp,
  LucideArrowRight,
  LucideCalendar,
  LucideSearch,
  LucideFilter,
  LucideDownload,
  LucideCheckCircle,
  LucideXCircle,
  LucideAlertCircle,
  LucideBriefcase,
  LucideEye,
  LucideClock,
  LucideGlobe,
  LucideLoader2,
  LucideMail,
  LucideUser,
  LucideX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SearchableSelect = ({ options, value, onChange, placeholder }: { options: string[], value: string, onChange: (v: string) => void, placeholder?: string }) => {
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
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => { setOpen(!open); setSearch(""); }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", background: "#fff", fontSize: "0.85rem", color: value ? "#0f172a" : "#64748b", userSelect: "none", minHeight: "38px" }}
      >
        <span>{value || placeholder || "Select"}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }}><path d="M1 3l5 5 5-5" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 10000, overflow: "hidden" }}>
          <div style={{ padding: "8px" }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={{ width: "100%", padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "10px", color: "#94a3b8", textAlign: "center", fontSize: "0.8rem" }}>No results</div>
            ) : filtered.map((opt, i) => (
              <div
                key={i}
                onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
                style={{ padding: "8px 12px", cursor: "pointer", fontSize: "0.82rem", color: opt === value ? "#2563eb" : "#0f172a", background: opt === value ? "#eff6ff" : "transparent", fontWeight: opt === value ? 600 : 400 }}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function TeamCandidatesData() {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [viewState, setViewState] = useState<"list" | "profile">("list");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Advanced Filters Panel
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecruiters, setSelectedRecruiters] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<"all" | "today" | "weekly" | "monthly" | "yearly" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [activeFilters, setActiveFilters] = useState<any>({
    sourcingDate: "",
    clientName: "",
    designation: "",
    state: "",
    gender: "",
    age: "",
    qualification: "",
    totalExperience: "",
    cvStatus: "",
    remarks: "",
    sourcingBy: ""
  });

  // Dynamic dropdown scopes
  const [clients, setClients] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [sourcingPlatforms, setSourcingPlatforms] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [meRes, teamRes, candsRes, clientsRes, jobsRes, platformsRes] = await Promise.all([
          fetch("/api/me").then(r => r.ok ? r.json() : null),
          fetch("/api/tl/team-monitoring").then(r => r.ok ? r.json() : null),
          fetch("/api/candidates").then(r => r.ok ? r.json() : []),
          fetch("/api/clients").then(r => r.ok ? r.json() : []),
          fetch("/api/jobs").then(r => r.ok ? r.json() : []),
          fetch("/api/sourcing/platforms").then(r => r.ok ? r.json() : [])
        ]);

        if (meRes) setCurrentUser(meRes);
        
        // Scope directly to recruiters under this TL
        const directRecruiters = teamRes?.teamList || [];
        setRecruiters(directRecruiters);

        setClients(clientsRes);
        setJobs(jobsRes);
        setSourcingPlatforms(platformsRes);

        // Security filter: ONLY show candidate records of recruiters in directRecruiters
        const recruiterIds = directRecruiters.map((r: any) => String(r.id));
        const recruiterNames = directRecruiters.map((r: any) => r.name.toLowerCase());
        
        const filteredCands = candsRes.filter((c: any) => 
          recruiterIds.includes(String(c.addedBy)) ||
          recruiterNames.includes(c.recruiterName?.toLowerCase())
        );

        setCandidates(filteredCands);
      } catch (err) {
        console.error("Failed to load TL team candidate pool database:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Fast polling real-time synchronization every 5s
    const poll = setInterval(async () => {
      try {
        const teamRes = await fetch("/api/tl/team-monitoring").then(r => r.ok ? r.json() : null);
        const directRecruiters = teamRes?.teamList || [];
        const recruiterIds = directRecruiters.map((r: any) => String(r.id));
        const recruiterNames = directRecruiters.map((r: any) => r.name.toLowerCase());

        const candsRes = await fetch("/api/candidates").then(r => r.ok ? r.json() : []);
        const filteredCands = candsRes.filter((c: any) => 
          recruiterIds.includes(String(c.addedBy)) ||
          recruiterNames.includes(c.recruiterName?.toLowerCase())
        );

        setCandidates(filteredCands);
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 5000);

    return () => clearInterval(poll);
  }, []);

  const getFollowUpState = (c: any) => {
    if (!c.interviewDate) return "Pending";
    const fDate = new Date(c.interviewDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const terminal = ["joined", "dropped", "rejected", "not interested"];
    const status = (c.remarks || "").toLowerCase();
    if (terminal.some(t => status.includes(t))) return "Completed";

    if (fDate.getTime() < today.getTime()) return "Missed";
    return "Upcoming";
  };

  // Filter candidates logic
  const filteredCandidates = candidates.filter((c: any) => {
    // 1. Search term match
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.jobRole || c.designation || "").toLowerCase().includes(q) ||
        (c.clientName || "").toLowerCase().includes(q) ||
        (c.city || c.state || "").toLowerCase().includes(q);
      
      if (!matchesSearch) return false;
    }

    // 2. Select Team Member multi-recruiter filter
    if (selectedRecruiters.length > 0) {
      const rec = recruiters.find(r => String(r.id) === String(c.addedBy) || r.name.toLowerCase() === c.recruiterName?.toLowerCase());
      if (!rec || !selectedRecruiters.includes(rec.id)) return false;
    }

    // 3. Date range filter
    if (dateRange !== "all") {
      const cDate = new Date(c.sourcingDate || c.createdAt || Date.now());
      cDate.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);

      if (dateRange === "today") {
        if (cDate.toDateString() !== today.toDateString()) return false;
      } else if (dateRange === "weekly") {
        const diff = (today.getTime() - cDate.getTime()) / (1000 * 3600 * 24);
        if (diff > 7) return false;
      } else if (dateRange === "monthly") {
        if (cDate.getMonth() !== today.getMonth() || cDate.getFullYear() !== today.getFullYear()) return false;
      } else if (dateRange === "yearly") {
        if (cDate.getFullYear() !== today.getFullYear()) return false;
      } else if (dateRange === "custom" && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        start.setHours(0,0,0,0);
        const end = new Date(customEndDate);
        end.setHours(23,59,59,999);
        if (cDate < start || cDate > end) return false;
      }
    }

    // 4. Advanced Attribute Filters
    for (const key in activeFilters) {
      if (activeFilters[key]) {
        const val = activeFilters[key].toLowerCase();
        let candVal = "";
        if (key === "designation") {
          candVal = (c.designation || c.jobRole || "").toLowerCase();
        } else {
          candVal = (c[key] || "").toString().toLowerCase();
        }
        if (!candVal.includes(val)) return false;
      }
    }

    return true;
  });

  const finalFilteredCandidates = useMemo(() => {
    if (showDuplicates) return filteredCandidates;
    const seen = new Set();
    return filteredCandidates.filter(c => {
      const phone = String(c.phone || "").replace(/\s+/g, "").trim();
      if (!phone) return true;
      if (seen.has(phone)) return false;
      seen.add(phone);
      return true;
    });
  }, [filteredCandidates, showDuplicates]);

  // KPI Metrics Calculation
  const checkCandidateStatusHistory = (c: any, keywords: string[]) => {
    if (c.InteractionNotes && Array.isArray(c.InteractionNotes)) {
      return c.InteractionNotes.some((n: any) => {
        const txt = (n.text || "").toLowerCase();
        return keywords.some(kw => txt.includes(kw));
      });
    }
    return false;
  };

  const isCandidateMatch = (c: any, stName: string) => {
    if (!c) return false;
    const rmk = (c.remarks || "").toLowerCase();
    const st = stName.toLowerCase().replace(/[\s_]+/g, "");
    
    if (rmk === st || rmk.replace(/[\s_]+/g, "") === st) return true;
    
    const interviewStatuses = ["go for interview", "selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
    const hasInterviewHistory = interviewStatuses.includes(rmk) || !!c.interviewDate || checkCandidateStatusHistory(c, ["go for interview", "interview scheduled", "interview rescheduled", "interviewed", "selected", "joined", "hired", "process to joining", "process for joining", "dropped"]);

    if (st === "selected") {
      if (rmk === "rejected") return false;
      const selectedStatuses = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired", "after selection not interested"];
      return selectedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["selected", "hired"]);
    }
    if (st === "joined" || st === "hired") {
      if (rmk === "dropped" || rmk === "rejected") return false;
      return rmk === "joined" || rmk === "hired";
    }
    if (st === "rejected") {
      const excludeFromRejected = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
      if (excludeFromRejected.includes(rmk)) return false;
      return rmk === "rejected";
    }
    if (st === "notinterested") {
      return rmk === "not interested";
    }
    if (st === "interested") {
      if (rmk === "not connected") return false;
      const interestedStatuses = ["interested", "selected", "joined", "dropped", "process to joining", "process for joining", "hired", "rejected"];
      return interestedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["interested", "select", "join", "hired", "process"]);
    }
    if (st === "processtojoining" || st === "joining" || st === "processforjoining") {
      const excludeFromJoining = ["joined", "dropped", "rejected", "hired"];
      if (excludeFromJoining.includes(rmk)) return false;
      return rmk === "process to joining" || rmk === "process for joining" || rmk === "processing";
    }
    if (st === "connected") {
      if (hasInterviewHistory) return false;
      return rmk === "connected" || checkCandidateStatusHistory(c, ["connected"]);
    }
    if (st === "notconnected") {
      return rmk === "not connected";
    }
    if (st === "revertlater") {
      return rmk === "revert later" || rmk === "call later";
    }
    if (st === "callnotpick") {
      return rmk === "call not pick" || rmk === "no response" || rmk === "busy";
    }
    if (st === "dropped") {
      return rmk === "dropped";
    }
    if (st === "goforinterview" || st === "interviewscheduled") {
      return hasInterviewHistory;
    }
    return false;
  };

  const getMetrics = (list: any[]) => {
    let total = list.length;
    let connected = 0;
    let interested = 0;
    let selected = 0;
    let joined = 0;
    let rejected = 0;
    let notInterested = 0;
    let scheduled = 0;

    list.forEach(c => {
      if (isCandidateMatch(c, "connected")) connected++;
      if (isCandidateMatch(c, "interested")) interested++;
      if (isCandidateMatch(c, "selected")) selected++;
      if (isCandidateMatch(c, "joined")) joined++;
      if (isCandidateMatch(c, "rejected")) rejected++;
      if (isCandidateMatch(c, "not interested")) notInterested++;
      if (isCandidateMatch(c, "go for interview")) scheduled++;
    });

    return { total, connected, interested, selected, joined, rejected, notInterested, scheduled };
  };

  const metrics = getMetrics(finalFilteredCandidates);

  // Recruiter wise breakdown analytics
  const recruiterBreakdown = recruiters.map(r => {
    const recList = candidates.filter(c => String(c.addedBy) === String(r.id) || c.recruiterName?.toLowerCase() === r.name.toLowerCase());
    return {
      id: r.id,
      name: r.name,
      designation: r.designation,
      count: recList.length
    };
  }).sort((a,b) => b.count - a.count);

  // Export Filtered CRM Data to CSV format
  const handleExport = (exportType: "single" | "multi" | "full" | "filtered") => {
    let listToExport = finalFilteredCandidates;

    if (exportType === "full") {
      listToExport = showDuplicates ? candidates : candidates.filter((c, idx, self) => {
        const phone = String(c.phone || "").replace(/\s+/g, "").trim();
        if (!phone) return true;
        return self.findIndex(x => String(x.phone || "").replace(/\s+/g, "").trim() === phone) === idx;
      });
    }

    const headers = [
      "Candidate Name", "Job Role", "Phone", "Email", "Location", "Sourcing By", 
      "Sourcing Date", "Current Status", "CV Status", "Gender", "Age", 
      "Qualification", "Total Experience", "Client Name", "Recruiter Name"
    ];

    const csvRows = listToExport.map(c => [
      c.name,
      c.jobRole || c.designation || "N/A",
      c.phone,
      c.email || "N/A",
      c.city && c.state ? `${c.city}, ${c.state}` : c.city || c.state || "N/A",
      c.sourcingBy || "N/A",
      c.sourcingDate || "N/A",
      c.remarks || "New",
      c.cvStatus || "N/A",
      c.gender || "N/A",
      c.age || "N/A",
      c.qualification || "N/A",
      c.totalExperience || "N/A",
      c.clientName || "N/A",
      c.recruiterName || "Recruiter"
    ]);

    const csvString = [
      headers.join(","),
      ...csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Team_Candidates_Export_${exportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (remarks: string) => {
    const r = (remarks || "").toLowerCase();
    if (r.includes("selected") || r.includes("joined") || r.includes("hired")) return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" };
    if (r.includes("rejected") || r.includes("not interested")) return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
    if (r.includes("joining")) return { bg: "#fefce8", text: "#d97706", border: "#fef08a" };
    if (r.includes("interview") || r.includes("scheduled") || r.includes("shortlisted")) return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
    return { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
  };

  if (loading && candidates.length === 0) {
    return (
      <div className="flex-center" style={{ height: "450px", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" color="#2563eb" size={45} />
        <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 700 }}>Synthesizing Team Candidate Pool...</span>
      </div>
    );
  }

  // Profile View
  if (viewState === "profile" && selectedCandidate) {
    const sc = selectedCandidate;
    const badge = getStatusBadge(sc.remarks);

    const InfoCard = ({ title, icon, children }: any) => (
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1rem", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0.85rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ color: "#2563eb" }}>{icon}</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px" }}>{title}</span>
        </div>
        <div style={{ padding: "1rem 1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem 1.5rem" }}>
          {children}
        </div>
      </div>
    );

    const F = ({ label, value }: any) => (
      <div>
        <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "3px" }}>{label}</div>
        <div style={{ fontSize: "0.875rem", color: "#111827", fontWeight: 500 }}>{value || <span style={{ color: "#d1d5db" }}>—</span>}</div>
      </div>
    );

    return (
      <div style={{ height: "100%", overflowY: "auto", background: "#f8fafc", padding: "12px 16px" }}>
        <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", padding: "1.5rem 2rem", borderRadius: "16px", color: "white" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
              Team Candidate Profile View
            </div>
            <button
              onClick={() => setViewState("list")}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.78rem" }}
            >
              ← Back to List
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", fontWeight: 800, color: "#fff", border: "2px solid rgba(255,255,255,0.3)" }}>
              {sc.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: "0 0 6px", color: "#fff", fontSize: "1.5rem", fontWeight: 800 }}>{sc.name}</h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                <span style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.95)", padding: "2px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>{sc.jobRole || sc.designation || "N/A"}</span>
                <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", padding: "2px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 500 }}>📞 {sc.phone}</span>
                <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", padding: "2px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 500 }}>🏢 {sc.clientName || "N/A"}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>Recruiter In-Charge</div>
              <div style={{ background: "rgba(255, 255, 255, 0.2)", padding: "4px 10px", borderRadius: "6px", fontWeight: 700, fontSize: "0.82rem" }}>
                {sc.recruiterName || "System Assigned"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0.75rem 2rem", display: "flex", gap: "2rem", flexWrap: "wrap", borderRadius: "12px", marginTop: "12px" }}>
          {[
            { label: "Experience", value: sc.totalExperience },
            { label: "Current CTC", value: sc.currentCtc ? `₹${sc.currentCtc}` : null },
            { label: "Expected CTC", value: sc.expectedCtc ? `₹${sc.expectedCtc}` : null },
            { label: "Notice Period", value: sc.noticePeriod },
            { label: "Sourcing Date", value: sc.sourcingDate },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: item.value ? "#1e3a8a" : "#d1d5db" }}>{item.value || "—"}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "12px" }}>
          <InfoCard title="Sourcing Information" icon={<LucideCalendar size={15} />}>
            <F label="Sourcing Date" value={sc.sourcingDate} />
            <F label="Recruiter Sourced" value={sc.recruiterName} />
            <F label="Reporting Lead" value={sc.reportingPerson} />
            <F label="Cold Calling Logs" value={sc.coldCalling} />
            <F label="Sourcing By Channel" value={sc.sourcingBy} />
            <F label="Associated Client" value={sc.clientName} />
          </InfoCard>

          <InfoCard title="Personal Credentials" icon={<LucideUsers size={15} />}>
            <F label="Full Name" value={sc.name} />
            <F label="Contact Number" value={sc.phone} />
            <F label="Personal Email" value={sc.email} />
            <F label="Date of Birth" value={sc.dob} />
            <F label="Age Group" value={sc.age} />
            <F label="Gender" value={sc.gender} />
            <F label="State Location" value={sc.state} />
            <F label="City Node" value={sc.city} />
            <F label="Qualification Level" value={sc.qualification} />
          </InfoCard>

          <InfoCard title="Professional Details" icon={<LucideBriefcase size={15} />}>
            <F label="Designation Scope" value={sc.jobRole || sc.designation} />
            <F label="Last / Current Organisation" value={sc.currentOrg} />
            <F label="Notice Window" value={sc.noticePeriod} />
            <F label="Sector Domain" value={sc.sector} />
          </InfoCard>

          <InfoCard title="CV & Live Remarks Overview" icon={<LucideUserCheck size={15} />}>
            <F label="CV Registry Status" value={sc.cvStatus} />
            <F label="CV Dispatched Group" value={sc.cvSharedWith} />
            <F label="Status Code" value={sc.remarks} />
            <F label="Remarks Reason" value={sc.remarkReason} />
          </InfoCard>

          {/* Activity Timeline */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0.85rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ color: "#2563eb" }}><LucideClock size={15} /></span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px" }}>CRM Historical Timeline Logs</span>
            </div>
            <div style={{ padding: "1rem 1.25rem" }}>
              {(!sc.InteractionNotes || sc.InteractionNotes.length === 0) ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                  No historical activity logged. Updates will automatically sync from Recruiter Node actions.
                </div>
              ) : (
                <div>
                  {sc.InteractionNotes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((note: any, idx: number, arr: any[]) => (
                    <div key={note.id} style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", flexShrink: 0 }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: idx === 0 ? "#2563eb" : "#e2e8f0", border: `2px solid ${idx === 0 ? "#93c5fd" : "#f1f5f9"}`, marginTop: "4px", flexShrink: 0 }} />
                        {idx !== arr.length - 1 && <div style={{ width: "1px", flex: 1, background: "#e2e8f0", margin: "3px 0", minHeight: "20px" }} />}
                      </div>
                      <div style={{ paddingBottom: "1rem", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "2px" }}>
                          <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.85rem" }}>{note.text}</div>
                          <div style={{ fontSize: "0.7rem", color: "#9ca3af", whiteSpace: "nowrap", fontWeight: 500 }}>
                            {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          Action trigger: <span style={{ fontWeight: 600, color: "#374151" }}>{note.author?.name || "System"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View Rendering
  const uniqueDesignations = Array.from(new Set(jobs.map((j: any) => j.title))).filter(Boolean).sort();
  const uniqueClients = Array.from(new Set(clients.map((cl: any) => cl.name))).filter(Boolean).sort();

  return (
    <div style={{ padding: "12px 16px", background: "#f8fafc", height: "100%", overflowY: "auto", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* Top Header Block */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Team Candidate's </span>
            <span style={{ color: "#2563eb" }}>Data</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", margin: "2px 0 0", fontWeight: 500 }}>
            Lifetime crm synced database containing sourcing and pipeline activities of your reporting recruiters.
          </p>
        </div>

        {/* Global Export Options */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
           {/* Duplicate Data Toggle Switch */}
           <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "white", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "6px 12px", height: "35px", userSelect: "none" }}>
             <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569" }}>Duplicate Data</span>
             <div 
               onClick={() => setShowDuplicates(!showDuplicates)}
               style={{ 
                 width: "36px", 
                 height: "20px", 
                 background: showDuplicates ? "#2563eb" : "#cbd5e1", 
                 borderRadius: "10px", 
                 padding: "2px", 
                 cursor: "pointer", 
                 display: "flex", 
                 alignItems: "center", 
                 justifyContent: showDuplicates ? "flex-end" : "flex-start",
                 transition: "all 0.15s ease"
               }}
             >
               <div style={{ width: "16px", height: "16px", background: "white", borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
             </div>
           </div>

           <button
             onClick={() => handleExport("full")}
             style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", fontSize: "0.78rem", fontWeight: "800", color: "#475569", cursor: "pointer", transition: "all 0.2s", height: "35px" }}
           >
             <LucideDownload size={13} /> Full Export
           </button>
           <button
             onClick={() => handleExport("filtered")}
             style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", borderRadius: "8px", background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", border: "none", fontSize: "0.78rem", fontWeight: "800", color: "white", cursor: "pointer", boxShadow: "0 4px 10px rgba(37,99,235,0.15)", transition: "all 0.2s", height: "35px" }}
           >
             <LucideDownload size={13} /> Export Filtered
           </button>
        </div>
      </div>

      {/* Access Control scope validation banner */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px 12px", borderRadius: "8px", marginBottom: "16px" }}>
        <LucideAlertCircle size={14} color="#2563eb" />
        <span style={{ fontSize: "0.72rem", color: "#1e40af", fontWeight: 700 }}>
          Security Node Active: Restricted to recruiters reporting directly to your desking team. Cross-lead candidate pipelines are excluded.
        </span>
      </div>

      {/* Multi-Recruiter Select Filter and Recruiter breakdown breakdown Roster */}
      <div style={{ background: "white", padding: "12px 16px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
              Recruiter-wise Contribution & Combined Filter Node
            </h3>
            <span style={{ fontSize: "0.62rem", background: "#eff6ff", color: "#2563eb", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>
              {selectedRecruiters.length === 0 ? "ALL TEAM ACTIVE" : `${selectedRecruiters.length} RECRUITERS SELECTED`}
            </span>
         </div>
         <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {recruiterBreakdown.map(r => {
              const isSelected = selectedRecruiters.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRecruiters(prev => 
                      prev.includes(r.id) ? prev.filter(id => id !== r.id) : [...prev, r.id]
                    );
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: `1.5px solid ${isSelected ? "#2563eb" : "#cbd5e1"}`,
                    background: isSelected ? "#eff6ff" : "white",
                    color: isSelected ? "#2563eb" : "#475569",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.1s"
                  }}
                >
                   <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: "#2563eb", width: "11px", height: "11px" }} />
                   {r.name} <span style={{ color: isSelected ? "#2563eb" : "#94a3b8", fontWeight: 700 }}>({r.count})</span>
                </button>
              );
            })}
            {selectedRecruiters.length > 0 && (
              <button 
                onClick={() => setSelectedRecruiters([])}
                style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer", padding: "4px" }}
              >
                Reset Team Filter
              </button>
            )}
         </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginBottom: "16px" }}>
         {[
           { label: "Total Candidates", val: metrics.total, bg: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", icon: <LucideDatabase size={16} /> },
           { label: "Connected Leads", val: metrics.connected, bg: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", icon: <LucideActivity size={16} /> },
           { label: "Interested Leads", val: metrics.interested, bg: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", icon: <LucideTrendingUp size={16} /> },
           { label: "Interview Scheduled", val: metrics.scheduled, bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", icon: <LucideClock size={16} /> },
           { label: "Selected Placements", val: metrics.selected, bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)", icon: <LucideCheckCircle size={16} /> },
           { label: "Joined Candidates", val: metrics.joined, bg: "linear-gradient(135deg, #059669 0%, #047857 100%)", icon: <LucideUserCheck size={16} /> },
           { label: "Not Interested", val: metrics.notInterested, bg: "linear-gradient(135deg, #db2777 0%, #be185d 100%)", icon: <LucideXCircle size={16} /> },
           { label: "Rejected Candidates", val: metrics.rejected, bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", icon: <LucideAlertCircle size={16} /> },
         ].map((card, idx) => (
           <div 
             key={idx} 
             style={{ 
               background: "white", 
               padding: "10px 12px", 
               borderRadius: "12px", 
               border: "1px solid #e2e8f0", 
               display: "flex", 
               alignItems: "center", 
               gap: "8px",
               boxShadow: "0 2px 4px rgba(0,0,0,0.01)" 
             }}
           >
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${card.bg}15`, color: card.bg.split("#")[1] ? "#3b82f6" : "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                 {card.icon}
              </div>
              <div>
                 <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", display: "block" }}>{card.label}</span>
                 <strong style={{ fontSize: "1.1rem", fontWeight: 900, color: "#000000", marginTop: "1px", display: "block" }}>{card.val}</strong>
              </div>
           </div>
         ))}
      </div>

      {/* Advanced Unified Filter System Bar */}
      <div style={{ background: "white", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #e0f2fe", display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center", flexWrap: "wrap" }}>
         
         {/* Live Search */}
         <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <LucideSearch size={14} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search Candidate, Phone, Email, Location, Client, Designation..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "none", outline: "none", width: "100%", fontSize: "0.78rem", fontWeight: 600, color: "#000000" }}
            />
         </div>

         {/* Sourcing Date Filter */}
         <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b" }}>DATE FRAME:</span>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", fontSize: "0.75rem", fontWeight: 800, color: "#000000", cursor: "pointer", outline: "none" }}
            >
              <option value="all">Lifetime Data</option>
              <option value="today">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
         </div>

         {/* Advanced Filter Collapse Toggle */}
         <button
           onClick={() => setShowFilters(!showFilters)}
           style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", background: showFilters ? "#eff6ff" : "white", color: showFilters ? "#2563eb" : "#475569", fontWeight: 800, fontSize: "0.72rem", cursor: "pointer", transition: "all 0.1s" }}
         >
           <LucideFilter size={12} /> {showFilters ? "Collapse Filters" : "More Filters"}
         </button>
      </div>

      {/* Date Range Analytics Panel (Custom Option) */}
      <AnimatePresence>
         {dateRange === "custom" && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: "auto", opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             style={{ display: "flex", gap: "10px", padding: "10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", marginBottom: "12px", alignItems: "center" }}
           >
              <LucideCalendar size={14} color="#2563eb" />
              <span style={{ fontSize: "0.72rem", color: "#1e40af", fontWeight: 800 }}>Custom Frame:</span>
              <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }} />
              <span style={{ fontSize: "0.75rem", color: "#1e40af" }}>→</span>
              <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }} />
           </motion.div>
         )}
      </AnimatePresence>

      {/* Secondary Filters Multi-Grid dropdown panel */}
      <AnimatePresence>
         {showFilters && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: "auto", opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "12px", marginBottom: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}
           >
              <div>
                 <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Client Name</label>
                 <SearchableSelect options={uniqueClients} value={activeFilters.clientName} onChange={v => setActiveFilters({...activeFilters, clientName: v})} placeholder="All Clients" />
              </div>
              <div>
                 <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Designation</label>
                 <SearchableSelect options={uniqueDesignations} value={activeFilters.designation} onChange={v => setActiveFilters({...activeFilters, designation: v})} placeholder="All Roles" />
              </div>
              <div>
                 <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>State Location</label>
                 <SearchableSelect options={["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry"]} value={activeFilters.state} onChange={v => setActiveFilters({...activeFilters, state: v})} placeholder="All States" />
              </div>
              <div>
                 <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Gender</label>
                 <SearchableSelect options={["Male","Female"]} value={activeFilters.gender} onChange={v => setActiveFilters({...activeFilters, gender: v})} placeholder="All" />
              </div>
              <div>
                 <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>CV Registry Status</label>
                 <SearchableSelect options={["Shared","Non Shared"]} value={activeFilters.cvStatus} onChange={v => setActiveFilters({...activeFilters, cvStatus: v})} placeholder="All" />
              </div>
              <div>
                 <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Remarks Code</label>
                 <SearchableSelect options={["Connected","Interested","Not Connected","Not Interested","Joined","Rejected"]} value={activeFilters.remarks} onChange={v => setActiveFilters({...activeFilters, remarks: v})} placeholder="All Remarks" />
              </div>
              <div>
                 <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Sourcing Platform</label>
                 <SearchableSelect options={sourcingPlatforms.map((p: any) => p.name)} value={activeFilters.sourcingBy} onChange={v => setActiveFilters({...activeFilters, sourcingBy: v})} placeholder="All Channels" />
              </div>
              <div>
                 <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Sourcing Date</label>
                 <input type="date" value={activeFilters.sourcingDate} onChange={e => setActiveFilters({...activeFilters, sourcingDate: e.target.value})} style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box", minHeight: "38px" }} />
              </div>
              <div>
                 <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Age Limit</label>
                 <input type="number" placeholder="Enter Age" value={activeFilters.age} onChange={e => setActiveFilters({...activeFilters, age: e.target.value})} style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box", minHeight: "38px" }} />
              </div>
              <div>
                 <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Total Experience</label>
                 <SearchableSelect options={["Fresher","Internship","0-6 Months","1 Year","2 Years","3 Years","4 Years","5 Years","6 Years","7 Years","8 Years","9 Years","10 Years","10+ Years"]} value={activeFilters.totalExperience} onChange={v => setActiveFilters({...activeFilters, totalExperience: v})} placeholder="All" />
              </div>
              <div>
                 <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Qualification</label>
                 <SearchableSelect options={["BA","BSc","BCom","BBA","BCA","BTech / BE","MBBS","BDS","BPharma","LLB","MA","MSc","MCom","MBA","MCA","MTech","PhD","CA","CS","12th Pass"]} value={activeFilters.qualification} onChange={v => setActiveFilters({...activeFilters, qualification: v})} placeholder="All" />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                 <button 
                   onClick={() => {
                     setActiveFilters({ sourcingDate:"",clientName:"",designation:"",state:"",gender:"",age:"",qualification:"",totalExperience:"",cvStatus:"",remarks:"",sourcingBy:"" });
                     setSearchTerm("");
                     setSelectedRecruiters([]);
                     setDateRange("all");
                   }}
                   style={{ width: "100%", padding: "10px", background: "#fef2f2", border: "1px solid #fee2e2", color: "#ef4444", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 800, cursor: "pointer", transition: "all 0.1s" }}
                 >
                   Reset Filters
                 </button>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Main Table Segment */}
      <div style={{ background: "white", borderRadius: "8px", border: "1px solid #cbd5e1", overflow: "hidden", boxShadow: "0 4px 15px -5px rgba(0,0,0,0.05)" }}>
         <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
               <tr style={{ background: "linear-gradient(90deg, #0369a1 0%, #0ea5e9 100%)", height: "32px" }}>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Candidate</th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Job Role</th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Phone</th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Email</th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Location</th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Sourcing</th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Current Status</th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff", textAlign: "center" }}>Actions</th>
               </tr>
            </thead>
            <tbody>
               {finalFilteredCandidates.length === 0 ? (
                 <tr>
                    <td colSpan={8} style={{ padding: "30px", textAlign: "center", color: "#cbd5e1", fontSize: "0.8rem", fontWeight: 700 }}>
                      No direct team candidates matched your criteria scope. Sourced logs will sync live.
                    </td>
                 </tr>
               ) : (
                 finalFilteredCandidates.map((c, idx) => {
                   const badge = getStatusBadge(c.remarks);
                   return (
                     <tr key={c.id || c._id} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#f8fafc" : "#ffffff" }}>
                        <td style={{ padding: "6px 10px" }}>
                           <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "linear-gradient(135deg, #e0f2fe 0%, #38bdf820 100%)", color: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 900 }}>
                                {c.name?.[0]?.toUpperCase()}
                              </div>
                              <strong style={{ fontSize: "0.78rem", color: "#1e293b" }}>{c.name}</strong>
                           </div>
                        </td>
                        <td style={{ padding: "6px 10px", fontSize: "0.75rem", color: "#475569", fontWeight: 600 }}>{c.jobRole || c.designation || "N/A"}</td>
                        <td style={{ padding: "6px 10px", fontSize: "0.75rem", color: "#475569" }}>{c.phone}</td>
                        <td style={{ padding: "6px 10px", fontSize: "0.75rem", color: "#64748b" }}>{c.email || "N/A"}</td>
                        <td style={{ padding: "6px 10px", fontSize: "0.75rem", color: "#475569" }}>
                          {c.city && c.state ? `${c.city}, ${c.state}` : c.city || c.state || "N/A"}
                        </td>
                        <td style={{ padding: "6px 10px", fontSize: "0.75rem", color: "#475569", fontWeight: 600 }}>
                          {c.sourcingBy || "N/A"}
                        </td>
                        <td style={{ padding: "6px 10px" }}>
                           <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: "4px", fontSize: "0.62rem", fontWeight: 900, background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                             {c.remarks || "New"}
                           </span>
                        </td>
                        <td style={{ padding: "4px 10px", textAlign: "center" }}>
                           <button 
                             onClick={() => { setSelectedCandidate(c); setViewState("profile"); }}
                             style={{ background: "#f0f9ff", color: "#0ea5e9", border: "none", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", margin: "0 auto" }}
                           >
                             <LucideEye size={12} />
                           </button>
                        </td>
                     </tr>
                   );
                 })
               )}
            </tbody>
         </table>
      </div>

    </div>
  );
}
