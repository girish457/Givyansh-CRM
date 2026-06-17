import React, { useState, useEffect } from "react";
import { 
  LucideUsers, LucideDatabase, LucideUserCheck, LucideActivity, 
  LucideTrendingUp, LucideArrowRight, LucideTrendingDown, LucideCalendar, 
  LucideSearch, LucideFilter, LucideDownload, LucideCheckCircle, 
  LucideXCircle, LucideAlertCircle, LucideBriefcase, LucideEye, 
  LucideClock, LucideGlobe, LucideFileText, LucideBuilding2,
  LucidePieChart, LucideAward, LucideZap, LucideListTodo
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "givyansh_lead_data_v1";

interface Recruiter {
  id: number;
  name: string;
  email: string;
  designation: string;
  status: string;
}

interface Candidate {
  id: number;
  _id?: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  jobRole: string;
  designation: string;
  remarks: string;
  remarkReason: string;
  sourcingBy: string;
  createdAt: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  addedBy: number;
  recruiterName: string;
  sector: string;
  qualification: string;
  totalExperience: string;
  cvSharedWith: string;
  leadInfo?: {
    categories: string[];
    remarks: string;
    movedAt: number;
    movedBy: string;
  };
  InteractionNotes?: any[];
}

export default function TeamLeadData() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selections
  const [selectedRecruiters, setSelectedRecruiters] = useState<number[]>([]);
  const [selectedRecruiterProfile, setSelectedRecruiterProfile] = useState<Recruiter | null>(null);
  const [selectedLead, setSelectedLead] = useState<Candidate | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [filterRecruiter, setFilterRecruiter] = useState("All");
  const [filterInterested, setFilterInterested] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFollowUp, setFilterFollowUp] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All");
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [filterExperience, setFilterExperience] = useState("All");
  const [dateRange, setDateRange] = useState<"All" | "Today" | "7Days" | "Monthly" | "Custom">("All");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    fetchTeamAndData();
    // Live update interval
    const interval = setInterval(fetchTeamAndData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTeamAndData = async () => {
    try {
      const [teamRes, candRes] = await Promise.all([
        fetch("/api/team"),
        fetch("/api/candidates")
      ]);
      if (teamRes.ok && candRes.ok) {
        const teamData = await teamRes.json();
        const candData = await candRes.json();
        
        // Filter only recruiters for team leads
        const recruitersOnly = teamData.filter((t: any) => t.role === "recruiter");
        setRecruiters(recruitersOnly);

        // Security check & Lead filtering: Only show candidate leads that are in recruiter's lead data pipeline (localStorage key)
        // and belong to recruiters in TL's team
        const leadDataMap = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        const recruiterIds = recruitersOnly.map((r: any) => String(r.id));
        const filteredCands = candData.filter((c: any) => 
          leadDataMap[c.id || c._id] && (
            recruiterIds.includes(String(c.addedBy)) ||
            recruitersOnly.some((r: any) => r.name.toLowerCase() === c.recruiterName?.toLowerCase())
          )
        ).map((c: any) => ({
          ...c,
          leadInfo: leadDataMap[c.id || c._id]
        }));
        setCandidates(filteredCands);
      }
    } catch (err) {
      console.error("Failed to load TL team data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: check follow up state
  const getFollowUpState = (c: Candidate) => {
    if (!c.interviewDate) return "Pending";
    const fDate = new Date(c.interviewDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const terminal = ["joined", "hired", "rejected", "not interested"];
    const status = (c.remarks || "").toLowerCase();
    if (terminal.some(t => status.includes(t))) return "Completed";

    if (fDate.getTime() < today.getTime()) return "Missed";
    return "Upcoming";
  };

  // Filter Logic
  const getFilteredCandidates = (list: Candidate[]) => {
    return list.filter(c => {
      // 1. Search
      if (search) {
        const q = search.toLowerCase();
        const matches = 
          (c.name || "").toLowerCase().includes(q) ||
          (c.phone || "").includes(q) ||
          (c.email || "").toLowerCase().includes(q) ||
          (c.jobRole || c.designation || "").toLowerCase().includes(q) ||
          (c.recruiterName || "").toLowerCase().includes(q) ||
          (c.city || c.state || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Filters
      if (filterRecruiter !== "All" && String(c.addedBy) !== filterRecruiter && c.recruiterName?.toLowerCase() !== filterRecruiter.toLowerCase()) return false;
      if (filterInterested !== "All" && (c.jobRole || c.designation || "").toLowerCase() !== filterInterested.toLowerCase()) return false;
      
      const status = (c.remarks || "New").toLowerCase();
      if (filterStatus !== "All" && status !== filterStatus.toLowerCase()) return false;
      
      if (filterFollowUp !== "All" && getFollowUpState(c).toLowerCase() !== filterFollowUp.toLowerCase()) return false;
      if (filterLocation !== "All" && (c.city || c.state || "").toLowerCase() !== filterLocation.toLowerCase()) return false;
      if (filterIndustry !== "All" && (c.sector || "").toLowerCase() !== filterIndustry.toLowerCase()) return false;
      if (filterExperience !== "All" && (c.totalExperience || "").toLowerCase() !== filterExperience.toLowerCase()) return false;

      // 3. Dates
      if (dateRange !== "All") {
        const cDate = new Date(c.createdAt || Date.now());
        const today = new Date();
        today.setHours(0,0,0,0);

        if (dateRange === "Today") {
          return cDate.toDateString() === today.toDateString();
        } else if (dateRange === "7Days") {
          const diff = (today.getTime() - cDate.getTime()) / (1000 * 3600 * 24);
          return diff <= 7;
        } else if (dateRange === "Monthly") {
          return cDate.getMonth() === today.getMonth() && cDate.getFullYear() === today.getFullYear();
        } else if (dateRange === "Custom" && customStart && customEnd) {
          const start = new Date(customStart);
          const end = new Date(customEnd);
          end.setHours(23,59,59,999);
          return cDate >= start && cDate <= end;
        }
      }

      return true;
    });
  };

  // Multiple Recruiter selection data scoping
  const activeCandidates = selectedRecruiters.length > 0 
    ? candidates.filter(c => {
        const matchedRec = recruiters.find(r => String(r.id) === String(c.addedBy) || r.name.toLowerCase() === c.recruiterName?.toLowerCase());
        return matchedRec && selectedRecruiters.includes(matchedRec.id);
      })
    : candidates;

  const filteredCandidates = getFilteredCandidates(activeCandidates);

  // Dashboard calculations
  const checkCandidateStatusHistory = (c: Candidate, keywords: string[]) => {
    if (c.InteractionNotes && Array.isArray(c.InteractionNotes)) {
      return c.InteractionNotes.some((n: any) => {
        const txt = (n.text || "").toLowerCase();
        return keywords.some(kw => txt.includes(kw));
      });
    }
    return false;
  };

  const isCandidateMatch = (c: Candidate, stName: string) => {
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

  const getMetrics = (list: Candidate[]) => {
    let total = list.length;
    let interested = 0;
    let connected = 0;
    let notConnected = 0;
    let followUp = 0;
    let converted = 0;
    let rejected = 0;
    let active = 0;

    list.forEach(c => {
      const status = (c.remarks || "").toLowerCase();
      if (isCandidateMatch(c, "interested")) interested++;
      if (isCandidateMatch(c, "connected")) connected++;
      if (status === "not connected") notConnected++;
      if (getFollowUpState(c) === "Upcoming" || getFollowUpState(c) === "Missed") followUp++;
      if (isCandidateMatch(c, "joined")) converted++;
      if (isCandidateMatch(c, "rejected")) rejected++;
      
      const isJoined = isCandidateMatch(c, "joined");
      const isRejected = isCandidateMatch(c, "rejected");
      const isNotInterested = isCandidateMatch(c, "not interested");
      if (!isJoined && !isRejected && !isNotInterested) active++;
    });

    return { total, interested, connected, notConnected, followUp, converted, rejected, active };
  };

  const globalMetrics = getMetrics(candidates);
  const selectedMetrics = getMetrics(filteredCandidates);

  // Recruiter analytics calculation helper
  const getRecruiterStats = (rec: Recruiter) => {
    const recCandidates = candidates.filter(c => String(c.addedBy) === String(rec.id) || c.recruiterName?.toLowerCase() === rec.name.toLowerCase());
    const m = getMetrics(recCandidates);

    // Productivity Score
    const prodScore = Math.min(
      Math.round((m.converted * 40 + m.interested * 20 + m.connected * 10 + m.total * 2) / (m.total || 1)),
      100
    );

    // Last activity estimation
    let lastActivity = "Never";
    if (recCandidates.length > 0) {
      const sorted = [...recCandidates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const lastDate = new Date(sorted[0].createdAt);
      lastActivity = lastDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    }

    return { ...m, prodScore, lastActivity };
  };

  // Excel (CSV) Export System
  const handleExportCSV = (type: "single" | "multi" | "date" | "filtered" | "full") => {
    let listToExport = filteredCandidates;

    if (type === "full") {
      listToExport = candidates;
    }

    const headers = [
      "Candidate Name", "Phone", "Email", "Location", "Lead Category",
      "Interested Field", "Status", "Remarks", "Recruiter", "Added Date",
      "Follow-up", "Conversion State"
    ];

    const csvRows = listToExport.map(c => [
      c.name,
      c.phone,
      c.email || "N/A",
      `${c.city || ""}${c.city && c.state ? ", " : ""}${c.state || ""}` || "N/A",
      c.sector || "N/A",
      c.jobRole || c.designation || "N/A",
      c.remarks || "New",
      c.remarkReason || "N/A",
      c.recruiterName || "Recruiter",
      new Date(c.createdAt).toLocaleDateString("en-IN"),
      c.interviewDate || "N/A",
      (c.remarks || "").toLowerCase().includes("joined") ? "Converted" : "Prospect"
    ]);

    const csvString = [
      headers.join(","),
      ...csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `TL_TeamLeadData_Export_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle multi-recruiter selection
  const handleToggleRecruiterSelection = (id: number) => {
    setSelectedRecruiters(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Status mapping colors
  const getStatusBadge = (remarks: string) => {
    const r = (remarks || "").toLowerCase();
    if (r.includes("selected") || r.includes("joined") || r.includes("hired")) return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" };
    if (r.includes("rejected") || r.includes("not interested")) return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
    if (r.includes("joining")) return { bg: "#fefce8", text: "#d97706", border: "#fef08a" };
    if (r.includes("interview") || r.includes("shortlisted")) return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
    return { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
  };

  // Filters setup values
  const uniqueInterested = Array.from(new Set(candidates.map(c => c.jobRole || c.designation))).filter(Boolean).sort();
  const uniqueLocations = Array.from(new Set(candidates.map(c => c.city || c.state))).filter(Boolean).sort();
  const uniqueIndustries = Array.from(new Set(candidates.map(c => c.sector))).filter(Boolean).sort();
  const uniqueExperiences = Array.from(new Set(candidates.map(c => c.totalExperience))).filter(Boolean).sort();

  return (
    <div className="module-container" style={{ padding: "1rem", background: "#f8fafc", height: "100%", overflowY: "auto", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* Top Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Team Lead </span>
            <span style={{ color: "#2563eb" }}>Data Hub</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>
            Real-time recruiter pipeline analytics, combined data overview, and secure database management.
          </p>
        </div>
        
        {/* Export Button Drawer */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            onClick={() => handleExportCSV("full")}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", background: "#2563eb", color: "white", border: "none", fontWeight: 800, cursor: "pointer", fontSize: "0.78rem", boxShadow: "0 2px 8px rgba(37,99,235,0.12)" }}
          >
            <LucideDownload size={14} /> Export Full Team Data
          </button>
        </div>
      </div>

      {/* Access Control Alert banner */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px 12px", borderRadius: "8px", marginBottom: "1rem" }}>
        <LucideAlertCircle size={15} color="#2563eb" />
        <span style={{ fontSize: "0.78rem", color: "#1e40af", fontWeight: 700 }}>
          Access Active: Scoped exclusively to recruiters reporting directly to your Team Lead Node.
        </span>
      </div>

      {/* Combined Recruiter Selector Node & Combined Analytics (Req 510 & 511) */}
      <div className="glass-card" style={{ background: "white", padding: "1rem", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
         <h3 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem", marginTop: 0 }}>
           Multi-Recruiter Selection & Combined Metrics Roster
         </h3>
         <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "1rem" }}>
            {recruiters.map(r => {
              const isSelected = selectedRecruiters.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => handleToggleRecruiterSelection(r.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "8px",
                    border: `1.5px solid ${isSelected ? "#2563eb" : "#cbd5e1"}`,
                    background: isSelected ? "#eff6ff" : "white",
                    color: isSelected ? "#2563eb" : "#475569",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.1s ease"
                  }}
                >
                   <input 
                     type="checkbox" 
                     checked={isSelected}
                     readOnly
                     style={{ accentColor: "#2563eb", cursor: "pointer", width: "12px", height: "12px" }}
                   />
                   {r.name}
                </button>
              );
            })}
            {selectedRecruiters.length > 0 && (
              <button 
                onClick={() => setSelectedRecruiters([])}
                style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", padding: "4px" }}
              >
                Clear Selection
              </button>
            )}
         </div>

         {/* Render Combined Analytics Box when recruiters selected */}
         {selectedRecruiters.length > 0 && (
           <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", padding: "0.75rem", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #bfdbfe" }}>
              <div>
                 <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Combined Leads</span>
                 <h4 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", marginTop: "2px", marginBottom: 0 }}>{selectedMetrics.total}</h4>
              </div>
              <div>
                 <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Combined Interested</span>
                 <h4 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#8b5cf6", marginTop: "2px", marginBottom: 0 }}>{selectedMetrics.interested}</h4>
              </div>
              <div>
                 <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Combined Connected</span>
                 <h4 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#3b82f6", marginTop: "2px", marginBottom: 0 }}>{selectedMetrics.connected}</h4>
              </div>
              <div>
                 <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Combined Follow-up</span>
                 <h4 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#f59e0b", marginTop: "2px", marginBottom: 0 }}>{selectedMetrics.followUp}</h4>
              </div>
              <div>
                 <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Combined Conversion</span>
                 <h4 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#10b981", marginTop: "2px", marginBottom: 0 }}>
                   {selectedMetrics.total > 0 ? Math.round((selectedMetrics.converted / selectedMetrics.total) * 100) : 0}%
                 </h4>
              </div>
           </div>
         )}
      </div>

      {/* Global Team Analytics Dashboard Overview (Req 503) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))", gap: "8px", marginBottom: "1rem" }}>
         {[
           { label: "Total Recruiters", val: recruiters.length, sub: "Direct reports", color: "#2563eb" },
           { label: "Total Lead Data", val: globalMetrics.total, sub: "Candidates sourced", color: "#7c3aed" },
           { label: "Interested Leads", val: globalMetrics.interested, sub: "High potential prospects", color: "#8b5cf6" },
           { label: "Connected Leads", val: globalMetrics.connected, sub: "Engaged interactions", color: "#0ea5e9" },
           { label: "Not Connected", val: globalMetrics.notConnected, sub: "No response yet", color: "#ef4444" },
           { label: "Follow-up Pending", val: globalMetrics.followUp, sub: "Needs urgent callback", color: "#d97706" },
           { label: "Converted Placement", val: globalMetrics.converted, sub: "Hired candidates", color: "#10b981" },
           { label: "Rejected Prospects", val: globalMetrics.rejected, sub: "Not qualified", color: "#dc2626" },
           { label: "Active Pipelines", val: globalMetrics.active, sub: "In-progress candidates", color: "#0f172a" },
         ].map((kpi, idx) => (
           <div 
             key={idx} 
             style={{ 
               background: "white", 
               padding: "0.6rem 0.8rem", 
               borderRadius: "12px", 
               border: "1px solid #e2e8f0", 
               boxShadow: "0 1px 3px rgba(0,0,0,0.01)" 
             }}
           >
              <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>{kpi.label}</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 900, color: kpi.color, marginTop: "2px", marginBottom: 0, lineHeight: 1 }}>{kpi.val}</h3>
              <p style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: "2px", marginBottom: 0 }}>{kpi.sub}</p>
           </div>
         ))}
      </div>

      {/* Recruiter-wise Lead Cards & Leaderboard (Req 504) */}
      <div style={{ marginBottom: "1rem" }}>
         <h2 style={{ fontSize: "0.95rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.75rem", marginTop: 0 }}>Recruiter Pipeline Cards</h2>
         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))", gap: "8px" }}>
            {recruiters.map(r => {
               const stats = getRecruiterStats(r);
               return (
                 <div
                   key={r.id}
                   onClick={() => setSelectedRecruiterProfile(r)}
                   style={{
                     background: "white",
                     padding: "0.85rem",
                     borderRadius: "12px",
                     border: "1px solid #e2e8f0",
                     cursor: "pointer",
                     boxShadow: "0 1px 3px rgba(0,0,0,0.01)",
                     transition: "all 0.15s ease"
                   }}
                 >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                       <div>
                          <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 900, color: "#0f172a" }}>{r.name}</h4>
                          <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{r.designation}</span>
                       </div>
                       <div style={{ padding: "2px 6px", background: "#f0fdf4", color: "#16a34a", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 800 }}>
                         {stats.prodScore}% Prod
                       </div>
                    </div>

                    {/* Sub-KPI Ratios inside Card */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", textAlign: "center", marginBottom: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                       <div style={{ background: "#f8fafc", padding: "4px 6px", borderRadius: "6px" }}>
                          <span style={{ fontSize: "0.58rem", color: "#64748b", display: "block" }}>Sourced</span>
                          <strong style={{ fontSize: "0.78rem", color: "#0f172a" }}>{stats.total}</strong>
                       </div>
                       <div style={{ background: "#f5f3ff", padding: "4px 6px", borderRadius: "6px" }}>
                          <span style={{ fontSize: "0.58rem", color: "#7c3aed", display: "block" }}>Interested</span>
                          <strong style={{ fontSize: "0.78rem", color: "#7c3aed" }}>{stats.interested}</strong>
                       </div>
                       <div style={{ background: "#ecfdf5", padding: "4px 6px", borderRadius: "6px" }}>
                          <span style={{ fontSize: "0.58rem", color: "#10b981", display: "block" }}>Converted</span>
                          <strong style={{ fontSize: "0.78rem", color: "#10b981" }}>{stats.converted}</strong>
                       </div>
                    </div>

                    {/* Activity metrics */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#94a3b8" }}>
                       <span>Last Activity: <strong style={{ color: "#475569" }}>{stats.lastActivity}</strong></span>
                       <span>Pending: <strong style={{ color: "#ef4444" }}>{stats.followUp}</strong></span>
                    </div>
                 </div>
               );
            })}
         </div>
      </div>

      {/* Sourcing Platform & Industry Sector Tracking Nodes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
         
         {/* Sourcing Channel Tracking Card */}
         <div className="glass-card" style={{ background: "white", padding: "0.85rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.01)" }}>
            <h3 style={{ fontSize: "0.82rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px", marginTop: 0 }}>
               <LucideGlobe size={14} color="#2563eb" /> Sourcing Platform Distribution
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               {(() => {
                  const sourceCounts: { [key: string]: number } = {};
                  candidates.forEach(c => {
                     const src = c.sourcingBy || "Direct Sourcing";
                     sourceCounts[src] = (sourceCounts[src] || 0) + 1;
                  });
                  const total = candidates.length || 1;
                  const sortedSources = Object.entries(sourceCounts)
                     .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
                     .sort((a, b) => b.count - a.count)
                     .slice(0, 5);

                  if (sortedSources.length === 0) {
                     return <div style={{ color: "#94a3b8", fontSize: "0.78rem", textAlign: "center", padding: "0.5rem" }}>No platform logs recorded yet.</div>;
                  }

                  const colors = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"];
                  return sortedSources.map((s, idx) => (
                     <div key={s.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "3px" }}>
                           <span>{s.name}</span>
                           <span style={{ color: colors[idx % colors.length], fontSize: "0.72rem" }}>{s.count} Leads ({s.pct}%)</span>
                        </div>
                        <div style={{ height: "5px", width: "100%", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                           <div style={{ height: "100%", width: `${s.pct}%`, background: colors[idx % colors.length], borderRadius: "3px", transition: "width 0.3s ease" }} />
                        </div>
                     </div>
                  ));
               })()}
            </div>
         </div>

         {/* Industry Sector Tracking Card */}
         <div className="glass-card" style={{ background: "white", padding: "0.85rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.01)" }}>
            <h3 style={{ fontSize: "0.82rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px", marginTop: 0 }}>
               <LucideBriefcase size={14} color="#7c3aed" /> Industry Category Tracking
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               {(() => {
                    const sectorCounts: { [key: string]: number } = {};
                    candidates.forEach(c => {
                       const cats = c.leadInfo?.categories || [];
                       if (cats.length > 0) {
                          cats.forEach((cat: string) => {
                             sectorCounts[cat] = (sectorCounts[cat] || 0) + 1;
                          });
                       } else {
                          const sec = c.sector || "General";
                          sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
                       }
                    });
                    const total = candidates.length || 1;
                    const sortedSectors = Object.entries(sectorCounts)
                      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5);

                   if (sortedSectors.length === 0) {
                      return <div style={{ color: "#94a3b8", fontSize: "0.78rem", textAlign: "center", padding: "0.5rem" }}>No category logs recorded yet.</div>;
                   }

                   const colors = ["#7c3aed", "#10b981", "#3b82f6", "#f59e0b", "#ec4899"];
                   return sortedSectors.map((s, idx) => (
                      <div key={s.name}>
                         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "3px" }}>
                            <span>{s.name}</span>
                            <span style={{ color: colors[idx % colors.length], fontSize: "0.72rem" }}>{s.count} Leads ({s.pct}%)</span>
                         </div>
                         <div style={{ height: "5px", width: "100%", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${s.pct}%`, background: colors[idx % colors.length], borderRadius: "3px", transition: "width 0.3s ease" }} />
                         </div>
                      </div>
                   ));
                })()}
            </div>
         </div>

      </div>

      {/* Collapsible/Toggleable Filter Integration inside the Pipeline Logs Header */}
      <div className="glass-card" style={{ background: "white", padding: "1rem", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Pipeline Candidates Logs</h3>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
               <button 
                 onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                 style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", background: showFiltersPanel ? "#eff6ff" : "white", color: showFiltersPanel ? "#2563eb" : "#475569", fontWeight: 800, fontSize: "0.72rem", cursor: "pointer", transition: "all 0.15s" }}
               >
                 <LucideFilter size={12} /> {showFiltersPanel ? "Hide Filters" : "Filters"}
               </button>
               <button 
                 onClick={() => handleExportCSV("filtered")}
                 style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", background: "white", color: "#475569", fontWeight: 800, fontSize: "0.72rem", cursor: "pointer" }}
               >
                 <LucideDownload size={12} /> Export Filtered CSV
               </button>
            </div>
         </div>

         {/* Collapsible Filter Panel */}
         <AnimatePresence>
            {showFiltersPanel && (
               <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: "auto", opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 style={{ overflow: "hidden", marginBottom: "1rem" }}
               >
                  <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                     <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", marginBottom: "3px" }}>Recruiter-wise</label>
                        <select value={filterRecruiter} onChange={e => setFilterRecruiter(e.target.value)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", background: "white", outline: "none" }}>
                           <option value="All">All Recruiters</option>
                           {recruiters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", marginBottom: "3px" }}>Interested Category</label>
                        <select value={filterInterested} onChange={e => setFilterInterested(e.target.value)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", background: "white", outline: "none" }}>
                           <option value="All">All Fields</option>
                           {uniqueInterested.map((i, idx) => <option key={idx} value={i}>{i}</option>)}
                        </select>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", marginBottom: "3px" }}>Lead Status</label>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", background: "white", outline: "none" }}>
                           <option value="All">All Statuses</option>
                           <option value="Connected">Connected</option>
                           <option value="Not Connected">Not Connected</option>
                           <option value="Interested">Interested</option>
                           <option value="Not Interested">Not Interested</option>
                           <option value="Hired">Joined</option>
                           <option value="Rejected">Rejected</option>
                        </select>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", marginBottom: "3px" }}>Location</label>
                        <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", background: "white", outline: "none" }}>
                           <option value="All">All Locations</option>
                           {uniqueLocations.map((l, idx) => <option key={idx} value={l}>{l}</option>)}
                        </select>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", marginBottom: "3px" }}>Sourcing Platform</label>
                        <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", background: "white", outline: "none" }}>
                           <option value="All">All Platforms</option>
                           {uniqueIndustries.map((ind, idx) => <option key={idx} value={ind}>{ind}</option>)}
                        </select>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", marginBottom: "3px" }}>Date Frame</label>
                        <select value={dateRange} onChange={e => setDateRange(e.target.value as any)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", background: "white", outline: "none" }}>
                           <option value="All">All Time</option>
                           <option value="Today">Today</option>
                           <option value="7Days">7 Days</option>
                           <option value="Monthly">Monthly</option>
                        </select>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gridColumn: "span 2" }}>
                        <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", marginBottom: "3px" }}>Live Search (Name, Contact, Category, Remarks)</label>
                        <div style={{ position: "relative" }}>
                           <LucideSearch size={12} color="#94a3b8" style={{ position: "absolute", left: "8px", top: "8px" }} />
                           <input 
                              type="text" 
                              placeholder="Search..." 
                              value={search}
                              onChange={e => setSearch(e.target.value)}
                              style={{ width: "100%", padding: "5px 8px 5px 26px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.75rem" }}
                           />
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
               <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                     <th style={{ padding: "8px 10px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Candidate Name</th>
                     <th style={{ padding: "8px 10px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Interested Field</th>
                     <th style={{ padding: "8px 10px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Phone</th>
                     <th style={{ padding: "8px 10px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Email</th>
                     <th style={{ padding: "8px 10px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Location</th>
                     <th style={{ padding: "8px 10px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Lead Category</th>
                     <th style={{ padding: "8px 10px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Added Date</th>
                     <th style={{ padding: "8px 10px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Follow-up</th>
                     <th style={{ padding: "8px 10px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Remarks</th>
                     <th style={{ padding: "8px 10px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Recruiter Name</th>
                     <th style={{ padding: "8px 10px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredCandidates.length === 0 ? (
                     <tr>
                        <td colSpan={11} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontWeight: 600, fontSize: "0.78rem" }}>No candidates matched your filter frame.</td>
                     </tr>
                  ) : (
                     filteredCandidates.slice(0, 100).map(c => {
                        return (
                         <tr key={c.id || c._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "7px 10px", fontSize: "0.78rem", fontWeight: 800, color: "#1e293b" }}>{c.name}</td>
                            <td style={{ padding: "7px 10px", fontSize: "0.78rem", color: "#475569", fontWeight: 600 }}>{c.jobRole || c.designation || "N/A"}</td>
                            <td style={{ padding: "7px 10px", fontSize: "0.78rem", color: "#475569" }}>{c.phone}</td>
                            <td style={{ padding: "7px 10px", fontSize: "0.78rem", color: "#64748b" }}>{c.email || "N/A"}</td>
                             <td style={{ padding: "7px 10px", fontSize: "0.78rem", color: "#475569" }}>
                               {c.city ? `${c.city}${c.state ? `, ${c.state}` : ""}` : c.state || "N/A"}
                             </td>
                             <td style={{ padding: "7px 10px", fontSize: "0.78rem", color: "#7c3aed", fontWeight: 700 }}>{c.sector || "General"}</td>
                            <td style={{ padding: "7px 10px", fontSize: "0.78rem", color: "#64748b" }}>
                               {new Date(c.createdAt).toLocaleDateString("en-IN")}
                            </td>
                            <td style={{ padding: "7px 10px" }}>
                               <span style={{
                                 fontSize: "0.72rem",
                                 fontWeight: 700,
                                 color: getFollowUpState(c) === "Upcoming" ? "#d97706" : getFollowUpState(c) === "Missed" ? "#ef4444" : "#10b981"
                               }}>
                                  {getFollowUpState(c)} {c.interviewDate ? `(${c.interviewDate})` : ""}
                                </span>
                            </td>
                            <td style={{ padding: "7px 10px", fontSize: "0.78rem", color: "#64748b", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.remarkReason}>
                               {c.remarkReason || "N/A"}
                            </td>
                            <td style={{ padding: "7px 10px", fontSize: "0.78rem", fontWeight: 700, color: "#0f172a" }}>{c.recruiterName}</td>
                            <td style={{ padding: "7px 10px", textAlign: "right" }}>
                               <button 
                                 onClick={() => setSelectedLead(c)} 
                                 style={{ 
                                   background: "#eff6ff", 
                                   color: "#2563eb", 
                                   border: "1px solid #bfdbfe", 
                                   padding: "3px 8px", 
                                   borderRadius: "4px", 
                                   cursor: "pointer", 
                                   fontWeight: 700, 
                                   display: "inline-flex", 
                                   alignItems: "center", 
                                   gap: "3px",
                                   transition: "all 0.15s",
                                   fontSize: "0.68rem"
                                 }}
                               >
                                  <LucideEye size={10} /> View Details
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

      {/* Recruiter profile detailed Drawer modal (Req 506 & 507) */}
      <AnimatePresence>
         {selectedRecruiterProfile && (
           <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "flex-end" }}>
              {/* Backdrop */}
              <div 
                onClick={() => setSelectedRecruiterProfile(null)}
                style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)" }}
              />

              {/* Slider Drawer content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                style={{ position: "relative", width: "800px", height: "100%", background: "white", boxShadow: "-10px 0 50px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", zIndex: 10000 }}
              >
                 {/* Header */}
                 <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
                    <div>
                       <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: "#0f172a" }}>{selectedRecruiterProfile.name} Performance Nodes</h3>
                       <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{selectedRecruiterProfile.designation}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedRecruiterProfile(null)} 
                      style={{ border: "1px solid #cbd5e1", background: "white", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      ×
                    </button>
                 </div>

                 {/* Drawer Roster scroll content */}
                 <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
                    {(() => {
                      const stats = getRecruiterStats(selectedRecruiterProfile);
                      const recCandidates = candidates.filter(c => String(c.addedBy) === String(selectedRecruiterProfile.id) || c.recruiterName?.toLowerCase() === selectedRecruiterProfile.name.toLowerCase());
                      
                      // Recruiter Specific Sourcing & Category Aggregators
                      const sourceCounts: { [key: string]: number } = {};
                      const sectorCounts: { [key: string]: number } = {};
                      recCandidates.forEach(c => {
                         const src = c.sourcingBy || "Direct Sourcing";
                         sourceCounts[src] = (sourceCounts[src] || 0) + 1;
                         
                         const cats = c.leadInfo?.categories || [];
                         if (cats.length > 0) {
                            cats.forEach((cat: string) => {
                               sectorCounts[cat] = (sectorCounts[cat] || 0) + 1;
                            });
                         } else {
                            const sec = c.sector || "General";
                            sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
                         }
                      });

                      return (
                        <>
                            {/* Core Analytics Grid for Recruiter */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "1.25rem" }}>
                               <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                  <span style={{ fontSize: "0.6rem", color: "#64748b", display: "block" }}>Total Sourced</span>
                                  <h4 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#0f172a", marginTop: "2px", marginBottom: 0 }}>{stats.total}</h4>
                               </div>
                               <div style={{ background: "#eff6ff", padding: "8px", borderRadius: "8px", border: "1px solid #bfdbfe", textAlign: "center" }}>
                                  <span style={{ fontSize: "0.6rem", color: "#2563eb", display: "block" }}>Connected</span>
                                  <h4 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#2563eb", marginTop: "2px", marginBottom: 0 }}>{stats.connected}</h4>
                               </div>
                               <div style={{ background: "#ecfdf5", padding: "8px", borderRadius: "8px", border: "1px solid #a7f3d0", textAlign: "center" }}>
                                  <span style={{ fontSize: "0.6rem", color: "#059669", display: "block" }}>Placed</span>
                                  <h4 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#059669", marginTop: "2px", marginBottom: 0 }}>{stats.converted}</h4>
                               </div>
                               <div style={{ background: "#fffbeb", padding: "8px", borderRadius: "8px", border: "1px solid #fef08a", textAlign: "center" }}>
                                  <span style={{ fontSize: "0.6rem", color: "#d97706", display: "block" }}>Productivity</span>
                                  <h4 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#d97706", marginTop: "2px", marginBottom: 0 }}>{stats.prodScore}%</h4>
                               </div>
                            </div>

                            {/* Recruiter-wise Sourcing Platform & Category Tracking Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                               {/* Sourcing platform track */}
                               <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                  <span style={{ fontSize: "0.75rem", fontWeight: 850, color: "#475569", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "5px", marginBottom: "0.75rem" }}>
                                     <LucideGlobe size={12} color="#2563eb" /> Sourcing Platform Distribution
                                  </span>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                     {(() => {
                                        const total = recCandidates.length || 1;
                                        const sorted = Object.entries(sourceCounts)
                                           .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
                                           .sort((a, b) => b.count - a.count)
                                           .slice(0, 4);

                                        if (sorted.length === 0) {
                                           return <div style={{ color: "#94a3b8", fontSize: "0.72rem", padding: "0.25rem 0" }}>No sourcing logs found.</div>;
                                        }
                                        const colors = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b"];
                                        return sorted.map((s, idx) => (
                                           <div key={s.name}>
                                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 700, color: "#334155", marginBottom: "2px" }}>
                                                 <span>{s.name}</span>
                                                 <span style={{ color: colors[idx % colors.length], fontSize: "0.68rem" }}>{s.count} ({s.pct}%)</span>
                                              </div>
                                              <div style={{ height: "4px", width: "100%", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                                                 <div style={{ height: "100%", width: `${s.pct}%`, background: colors[idx % colors.length] }} />
                                              </div>
                                           </div>
                                        ));
                                     })()}
                                  </div>
                               </div>

                               {/* Industry Sector track */}
                               <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                  <span style={{ fontSize: "0.75rem", fontWeight: 850, color: "#475569", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "5px", marginBottom: "0.75rem" }}>
                                     <LucideBriefcase size={12} color="#7c3aed" /> Industry Category Tracking
                                  </span>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                     {(() => {
                                        const total = recCandidates.length || 1;
                                        const sorted = Object.entries(sectorCounts)
                                           .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
                                           .sort((a, b) => b.count - a.count)
                                           .slice(0, 4);

                                        if (sorted.length === 0) {
                                           return <div style={{ color: "#94a3b8", fontSize: "0.72rem", padding: "0.25rem 0" }}>No category logs found.</div>;
                                        }
                                        const colors = ["#7c3aed", "#10b981", "#3b82f6", "#f59e0b"];
                                        return sorted.map((s, idx) => (
                                           <div key={s.name}>
                                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 700, color: "#334155", marginBottom: "2px" }}>
                                                 <span>{s.name}</span>
                                                 <span style={{ color: colors[idx % colors.length], fontSize: "0.68rem" }}>{s.count} ({s.pct}%)</span>
                                              </div>
                                              <div style={{ height: "4px", width: "100%", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                                                 <div style={{ height: "100%", width: `${s.pct}%`, background: colors[idx % colors.length] }} />
                                              </div>
                                           </div>
                                        ));
                                     })()}
                                  </div>
                               </div>
                            </div>

                           {/* Recruiter personal candidate list table */}
                           <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                                 <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 900, color: "#0f172a" }}>Recruiter Candidate Roster</h4>
                                 <button 
                                   onClick={() => {
                                     // Custom Single Recruiter CSV export
                                     const headers = ["Candidate Name", "Phone", "Email", "Location", "Job Role", "Status", "Remarks"];
                                     const csvRows = recCandidates.map(c => [c.name, c.phone, c.email || "N/A", c.city || "N/A", c.jobRole || "N/A", c.remarks || "New", c.remarkReason || "N/A"]);
                                     const csvString = [headers.join(","), ...csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
                                     const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
                                     const url = URL.createObjectURL(blob);
                                     const link = document.createElement("a");
                                     link.href = url;
                                     link.setAttribute("download", `Recruiter_${selectedRecruiterProfile.name}_Export.csv`);
                                     document.body.appendChild(link);
                                     link.click();
                                     document.body.removeChild(link);
                                   }}
                                   style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "white", color: "#475569", fontSize: "0.68rem", fontWeight: 800, cursor: "pointer" }}
                                 >
                                    Export Personal List
                                 </button>
                              </div>

                              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                 <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                    <thead>
                                       <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                          <th style={{ padding: "6px 8px", fontSize: "0.68rem", fontWeight: 800, color: "#64748b" }}>Candidate</th>
                                          <th style={{ padding: "6px 8px", fontSize: "0.68rem", fontWeight: 800, color: "#64748b" }}>Role</th>
                                          <th style={{ padding: "6px 8px", fontSize: "0.68rem", fontWeight: 800, color: "#64748b" }}>Phone</th>
                                          <th style={{ padding: "6px 8px", fontSize: "0.68rem", fontWeight: 800, color: "#64748b" }}>Status</th>
                                          <th style={{ padding: "6px 8px", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textAlign: "right" }}>Action</th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                       {recCandidates.length === 0 ? (
                                          <tr>
                                             <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem", color: "#cbd5e1", fontSize: "0.75rem" }}>No candidate logs logged yet.</td>
                                          </tr>
                                       ) : (
                                         recCandidates.map(c => {
                                           const badge = getStatusBadge(c.remarks);
                                           return (
                                             <tr key={c.id || c._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                <td style={{ padding: "8px 10px", fontSize: "0.78rem", fontWeight: 800, color: "#1e293b" }}>{c.name}</td>
                                                <td style={{ padding: "8px 10px", fontSize: "0.75rem", color: "#475569" }}>{c.jobRole || c.designation || "N/A"}</td>
                                                <td style={{ padding: "8px 10px", fontSize: "0.75rem", color: "#475569" }}>{c.phone}</td>
                                                <td style={{ padding: "8px 10px" }}>
                                                   <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 800, background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                                                      {c.remarks || "New"}
                                                   </span>
                                                </td>
                                                <td style={{ padding: "8px 10px", textAlign: "right" }}>
                                                   <button 
                                                     onClick={() => setSelectedLead(c)} 
                                                     style={{ 
                                                       background: "#eff6ff", 
                                                       color: "#2563eb", 
                                                       border: "none", 
                                                       padding: "2px 8px", 
                                                       borderRadius: "4px", 
                                                       fontSize: "0.65rem", 
                                                       fontWeight: 800, 
                                                       cursor: "pointer" 
                                                     }}
                                                   >
                                                     View
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
                        </>
                      );
                    })()}
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Candidate lead details drawer modal */}
      <AnimatePresence>
         {selectedLead && (
           <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", justifyContent: "flex-end" }}>
              {/* Backdrop */}
              <div 
                onClick={() => setSelectedLead(null)}
                style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)" }}
              />

              {/* Slider Drawer content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 250 }}
                style={{ position: "relative", width: "380px", height: "100%", background: "white", boxShadow: "-10px 0 50px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", zIndex: 100000 }}
              >
                  {/* Header */}
                  <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
                     <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <LucideDatabase size={16} color="#2563eb" />
                        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 900, color: "#0f172a" }}>Lead Profile Info</h3>
                     </div>
                     <button 
                       onClick={() => setSelectedLead(null)} 
                       style={{ border: "1px solid #cbd5e1", background: "white", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", fontWeight: "bold" }}
                     >
                       ×
                     </button>
                  </div>

                  {/* Drawer Content */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
                     {/* Avatar & Primary Info */}
                     <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                           <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem", fontWeight: 800, boxShadow: "0 4px 8px rgba(37,99,235,0.2)" }}>
                              {selectedLead.name?.[0]?.toUpperCase()}
                           </div>
                           <div>
                              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{selectedLead.name}</h4>
                              <div style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.7rem", marginTop: "2px" }}>{selectedLead.jobRole || selectedLead.designation || "No Role"}</div>
                           </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.72rem", color: "#475569", borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
                           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                             <span style={{ color: "#64748b", fontWeight: 600 }}>Sourcing Source:</span>
                             <strong style={{ color: "#1e293b" }}>{selectedLead.sourcingBy || "Direct Sourcing"}</strong>
                           </div>
                           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                             <span style={{ color: "#64748b", fontWeight: 600 }}>Location:</span>
                             <strong style={{ color: "#1e293b" }}>{selectedLead.city ? `${selectedLead.city}${selectedLead.state ? `, ${selectedLead.state}` : ""}` : selectedLead.state || "Not Specified"}</strong>
                           </div>
                        </div>
                     </div>

                     {/* Interested Categories */}
                     <div style={{ marginBottom: "1rem" }}>
                        <h5 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 0 }}>Interested Domains</h5>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                           {(selectedLead.leadInfo?.categories || []).length > 0 ? (
                              selectedLead.leadInfo?.categories?.map((cat: string) => (
                                 <span key={cat} style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "3px 6px", borderRadius: "6px", fontWeight: 700, fontSize: "0.68rem" }}>{cat}</span>
                              ))
                           ) : (
                              <span style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", padding: "3px 6px", borderRadius: "6px", fontWeight: 700, fontSize: "0.68rem" }}>{selectedLead.sector || "General"}</span>
                           )}
                        </div>
                     </div>

                     {/* Recruiter Remarks */}
                     <div style={{ marginBottom: "1rem" }}>
                        <h5 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 0 }}>Recruiter Remarks</h5>
                        <div style={{ background: "#fffbeb", padding: "8px 10px", borderRadius: "8px", border: "1px solid #fef3c7", color: "#92400e", fontSize: "0.75rem", lineHeight: 1.4, fontWeight: 500 }}>
                           "{selectedLead.leadInfo?.remarks || selectedLead.remarkReason || "No comments written yet"}"
                        </div>
                     </div>

                     {/* Metadata */}
                     <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.85rem" }}>
                        <h5 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 0 }}>Lead Metadata</h5>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.72rem", color: "#64748b", background: "#f8fafc", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                           <div>
                              <span style={{ display: "block", color: "#94a3b8", fontWeight: 600, fontSize: "0.65rem" }}>Moved By:</span>
                              <span style={{ color: "#334155", fontWeight: 700, fontSize: "0.72rem" }}>{selectedLead.leadInfo?.movedBy || selectedLead.recruiterName}</span>
                           </div>
                           <div>
                              <span style={{ display: "block", color: "#94a3b8", fontWeight: 600, fontSize: "0.65rem" }}>Date Sourced:</span>
                              <span style={{ color: "#334155", fontWeight: 700, fontSize: "0.72rem" }}>{new Date(selectedLead.createdAt).toLocaleDateString()}</span>
                           </div>
                           <div>
                              <span style={{ display: "block", color: "#94a3b8", fontWeight: 600, fontSize: "0.65rem" }}>Phone:</span>
                              <span style={{ color: "#334155", fontWeight: 700, fontSize: "0.72rem" }}>{selectedLead.phone || "N/A"}</span>
                           </div>
                           <div>
                              <span style={{ display: "block", color: "#94a3b8", fontWeight: 600, fontSize: "0.65rem" }}>Email:</span>
                              <span style={{ color: "#334155", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", maxWidth: "130px", fontSize: "0.72rem" }}>{selectedLead.email || "N/A"}</span>
                           </div>
                        </div>
                     </div>
                  </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </div>
  );
}
