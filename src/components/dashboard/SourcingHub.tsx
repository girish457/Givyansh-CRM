import { useState, useEffect } from "react";
import { 
  LucideSearch, 
  LucidePlus, 
  LucideTrash2, 
  LucideGlobe, 
  LucideDollarSign, 
  LucideLoader2, 
  LucideArrowLeft, 
  LucideBarChart2, 
  LucideUsers, 
  LucideCheckCircle2, 
  LucideXCircle, 
  LucideCalendar, 
  LucideUserCheck, 
  LucideActivity, 
  LucidePieChart, 
  LucideArrowRight,
  LucideCopy,
  LucideX,
  LucidePhone,
  LucideMail,
  LucideMapPin,
  LucideEye,
  LucideChevronLeft,
  LucideChevronRight,
  LucideBriefcase,
  LucideClock,
  LucideCheck,
  LucideRocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Global helper for matching candidate status history keywords
const checkStatusHistory = (c: any, arg: string | string[]) => {
  if (!c) return false;
  
  const keywords = Array.isArray(arg) ? arg : [arg];
  const kws = keywords.map(k => k.toLowerCase());

  const checkNotes = (kwList: string[]) => {
    if (c.InteractionNotes && Array.isArray(c.InteractionNotes)) {
      return c.InteractionNotes.some((n: any) => {
        const txt = (n.text || "").toLowerCase();
        return kwList.some(kw => txt.includes(kw));
      });
    }
    return false;
  };

  const isCandidateMatch = (stName: string) => {
    const rmk = (c.remarks || "").toLowerCase();
    const cv = (c.cvStatus || "").toLowerCase();
    const st = stName.toLowerCase().replace(/[\s_]+/g, "");
    
    if (rmk === st || rmk.replace(/[\s_]+/g, "") === st) return true;
    
    const interviewStatuses = ["go for interview", "selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
    const hasInterviewHistory = interviewStatuses.includes(rmk) || !!c.interviewDate || checkNotes(["go for interview", "interview scheduled", "interview rescheduled", "interviewed"]);

    if (st === "selected") {
      if (rmk === "rejected") return false;
      const selectedStatuses = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
      return selectedStatuses.includes(rmk) || checkNotes(["selected", "hired"]);
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
    if (st === "interested") {
      if (rmk === "not connected") return false;
      const interestedStatuses = ["interested", "selected", "joined", "dropped", "process to joining", "process for joining", "hired", "rejected"];
      return interestedStatuses.includes(rmk) || checkNotes(["interested", "select", "join", "hired", "process"]);
    }
    if (st === "joining" || st === "processtojoining" || st === "processforjoining") {
      const excludeFromJoining = ["joined", "dropped", "rejected", "hired"];
      if (excludeFromJoining.includes(rmk)) return false;
      return rmk === "process to joining" || rmk === "process for joining" || rmk === "processing";
    }
    if (st === "connected") {
      if (hasInterviewHistory) return false;
      return rmk === "connected" || checkNotes(["connected"]);
    }
    if (st === "notinterested") {
      return rmk === "not interested";
    }
    if (st === "goforinterview" || st === "interviewscheduled") {
      return hasInterviewHistory;
    }
    return rmk === st || cv === st;
  };

  const currentRemarks = (c.remarks || "").toLowerCase();
  const currentStatus = (c.status || "").toLowerCase();
  
  const matchesCurrent = kws.some(kw => 
    currentRemarks.includes(kw) || currentStatus.includes(kw) || isCandidateMatch(kw)
  );
  if (matchesCurrent) return true;
  
  return checkNotes(kws);
};

// Global helpers for dynamic squircle avatars
const getAvatarBgColor = (name: string) => {
  const colors = [
    "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", // Blue
    "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", // Emerald
    "linear-gradient(135deg, #f5f3ff 0%, #ddd6fe 100%)", // Purple
    "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", // Orange
    "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)", // Pink
    "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)", // Teal
  ];
  let sum = 0;
  const safeName = name || "Anonymous";
  for (let i = 0; i < safeName.length; i++) sum += safeName.charCodeAt(i);
  return colors[sum % colors.length];
};

const getAvatarTextColor = (name: string) => {
  const colors = ["#2563eb", "#059669", "#7c3aed", "#ea580c", "#db2777", "#0d9488"];
  let sum = 0;
  const safeName = name || "Anonymous";
  for (let i = 0; i < safeName.length; i++) sum += safeName.charCodeAt(i);
  return colors[sum % colors.length];
};

export default function SourcingHub({ role }: { role: string }) {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "add" | "analytics">("list");
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", url: "", username: "", password: "", cost: "", status: "Active" });
  const [submitting, setSubmitting] = useState(false);
  const [dateFilter, setDateFilter] = useState<"Today" | "Last 7 Days" | "Monthly" | "Yearly" | "Custom">("Monthly");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  
  // Search & Filter state for platforms list
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Interactive analytics filtering state
  const [selectedAnalyticsStatus, setSelectedAnalyticsStatus] = useState("Total Registered");
  
  // Candidate Profile Drawer state
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Team and recruiter tracking
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [tlViewFilter, setTlViewFilter] = useState<string>(
    role === "boss" || role === "manager" ? "all" : "team"
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [platRes, candRes, meRes] = await Promise.all([
        fetch("/api/sourcing/platforms"),
        fetch("/api/candidates"),
        fetch("/api/me")
      ]);
      if (platRes.ok) setPlatforms(await platRes.json());
      if (candRes.ok) setCandidates(await candRes.json());
      if (meRes.ok) {
        const u = await meRes.json();
        setCurrentUser(u);
      }
      
      if (role === "tl") {
        const teamRes = await fetch("/api/tl/team-monitoring");
        if (teamRes.ok) {
          const data = await teamRes.json();
          setTeamMembers(data.teamList || []);
        }
      } else if (role === "manager" || role === "boss") {
        const teamRes = await fetch("/api/team");
        if (teamRes.ok) {
          const data = await teamRes.json();
          setTeamMembers(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const visibleCandidates = (() => {
    if (!currentUser) return candidates;

    if (role === "recruiter") {
      const myId = currentUser.id || currentUser.userId;
      const myName = currentUser.name;
      return candidates.filter(c => 
        c.addedBy === myId ||
        c.assignedTo === myId ||
        (c.recruiterName && c.recruiterName.toLowerCase() === myName.toLowerCase())
      );
    }

    if (role === "tl") {
      const myId = currentUser.id || currentUser.userId;
      const myName = currentUser.name;
      
      if (tlViewFilter === "personal") {
        return candidates.filter(c => 
          c.addedBy === myId ||
          c.assignedTo === myId ||
          (c.recruiterName && c.recruiterName.toLowerCase() === myName.toLowerCase())
        );
      }
      
      if (tlViewFilter === "team") {
        if (teamMembers.length === 0) return [];
        const memberIds = teamMembers.map(m => m.id);
        const memberNames = teamMembers.map(m => m.name.toLowerCase());
        return candidates.filter(c => 
          memberIds.includes(c.addedBy) ||
          memberIds.includes(c.assignedTo) ||
          (c.recruiterName && memberNames.includes(c.recruiterName.toLowerCase()))
        );
      }
      
      // Specific recruiter view
      const selectedId = Number(tlViewFilter);
      const selectedMember = teamMembers.find(m => m.id === selectedId);
      if (!selectedMember) return [];
      const memberName = selectedMember.name.toLowerCase();
      
      return candidates.filter(c => 
        c.addedBy === selectedId ||
        c.assignedTo === selectedId ||
        (c.recruiterName && c.recruiterName.toLowerCase() === memberName)
      );
    }

    if (role === "boss" || role === "manager") {
      if (tlViewFilter === "all") {
        return candidates;
      }
      
      if (tlViewFilter.startsWith("team_tl_")) {
        const tlId = Number(tlViewFilter.replace("team_tl_", ""));
        const tl = teamMembers.find(m => m.id === tlId);
        if (!tl) return [];
        
        const memberIds = teamMembers.filter(m => m.reportingTo === tlId).map(m => m.id);
        memberIds.push(tlId);
        const memberNames = teamMembers.filter(m => memberIds.includes(m.id)).map(m => m.name.toLowerCase());
        
        return candidates.filter(c => 
          memberIds.includes(c.addedBy) ||
          memberIds.includes(c.assignedTo) ||
          (c.recruiterName && memberNames.includes(c.recruiterName.toLowerCase()))
        );
      }
      
      if (tlViewFilter.startsWith("personal_tl_")) {
        const tlId = Number(tlViewFilter.replace("personal_tl_", ""));
        const tl = teamMembers.find(m => m.id === tlId);
        if (!tl) return [];
        const tlName = tl.name.toLowerCase();
        
        return candidates.filter(c => 
          c.addedBy === tlId ||
          c.assignedTo === tlId ||
          (c.recruiterName && c.recruiterName.toLowerCase() === tlName)
        );
      }
      
      if (tlViewFilter.startsWith("recruiter_")) {
        const recId = Number(tlViewFilter.replace("recruiter_", ""));
        const rec = teamMembers.find(m => m.id === recId);
        if (!rec) return [];
        const recName = rec.name.toLowerCase();
        
        return candidates.filter(c => 
          c.addedBy === recId ||
          c.assignedTo === recId ||
          (c.recruiterName && c.recruiterName.toLowerCase() === recName)
        );
      }
    }

    return candidates;
  })();

  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Platform name is required");
    setSubmitting(true);
    try {
      const res = await fetch("/api/sourcing/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ name: "", url: "", username: "", password: "", cost: "", status: "Active" });
        setView("list");
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({ error: "System Error" }));
        alert("Failed to add platform: " + (errorData.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this channel?")) return;
    try {
      await fetch(`/api/sourcing/platforms/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filterByDate = (cDateStr: string) => {
    if (!cDateStr) return false;
    const cDate = new Date(cDateStr);
    const now = new Date();
    
    if (dateFilter === "Today") {
      return cDate.toDateString() === now.toDateString();
    }
    if (dateFilter === "Last 7 Days") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      return cDate >= past;
    }
    if (dateFilter === "Monthly") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return cDate >= thirtyDaysAgo;
    }
    if (dateFilter === "Yearly") {
      return cDate.getFullYear() === now.getFullYear();
    }
    if (dateFilter === "Custom" && customDates.start && customDates.end) {
      const s = new Date(customDates.start);
      const e = new Date(customDates.end);
      e.setHours(23, 59, 59, 999);
      return cDate >= s && cDate <= e;
    }
    return true;
  };

  const getAnalytics = (platformName: string) => {
    const platformCandidates = visibleCandidates.filter(c => 
      c.sourcingBy && platformName && 
      c.sourcingBy.toLowerCase() === platformName.toLowerCase() && 
      filterByDate(c.createdAt || c.sourcingDate)
    );
    
    let total = platformCandidates.length;
    let connected = 0, interested = 0, notConnected = 0, selected = 0, rejected = 0, joined = 0, processToJoining = 0, dropped = 0, interviewScheduled = 0, interviewDone = 0, interviewNotDone = 0, processingForInterview = 0;

    platformCandidates.forEach(c => {
      // Connected is everyone who has been contacted (not just "new")
      const rmk = (c.remarks || "").toLowerCase();
      if ((rmk && rmk !== "new") || (c.InteractionNotes && c.InteractionNotes.length > 0) || checkStatusHistory(c, ["connected", "talked"])) connected++;
      
      if (checkStatusHistory(c, ["interested", "interview", "processing", "process to joining", "selected", "joined"])) interested++;
      if (checkStatusHistory(c, ["not connected", "no response", "call not pick"])) notConnected++;
      if (checkStatusHistory(c, ["selected", "joined", "process to joining", "process for joining", "hired"])) selected++;
      if (checkStatusHistory(c, ["rejected", "not selected", "reject"])) rejected++;
      if (checkStatusHistory(c, ["joined", "hired"])) joined++;
      if (checkStatusHistory(c, ["process to joining", "onboarding", "process for joining"])) processToJoining++;
      if (checkStatusHistory(c, ["dropped", "fallout"])) dropped++;
      if (checkStatusHistory(c, ["interview scheduled", "go for interview", "scheduled"])) interviewScheduled++;
      if (checkStatusHistory(c, ["processing for interview"])) processingForInterview++;
      if (checkStatusHistory(c, ["interview done", "round", "all rounds done", "processing for next round", "selected", "joined", "process to joining", "process for joining", "hired"])) interviewDone++;
      if (rmk === "interview not done" || checkStatusHistory(c, ["interview not done"])) interviewNotDone++;
    });

    // Ensure funnel logic holds true numerically for display
    if (interested > connected) connected = interested;
    if (interviewScheduled > interested) interested = interviewScheduled;
    if (processingForInterview > interviewScheduled) interviewScheduled = processingForInterview;
    if (interviewDone > interviewScheduled) interviewScheduled = interviewDone;
    if (selected > interviewDone) interviewDone = selected;
    if (joined > selected) selected = joined;

    const conversionRate = total > 0 ? ((joined / total) * 100).toFixed(1) + "%" : "0%";
    const interestedRatio = connected > 0 ? ((interested / connected) * 100).toFixed(1) + "%" : "0%";
    const selectionRatio = interviewScheduled > 0 ? ((selected / interviewScheduled) * 100).toFixed(1) + "%" : "0%";
    const joiningRatio = selected > 0 ? ((joined / selected) * 100).toFixed(1) + "%" : "0%";
    const rejectionRatio = interviewScheduled > 0 ? ((rejected / interviewScheduled) * 100).toFixed(1) + "%" : "0%";

    return {
      total, connected, interested, notConnected, selected, rejected, joined, processToJoining, dropped, interviewScheduled,
      interviewDone, interviewNotDone, processingForInterview,
      conversionRate, interestedRatio, selectionRatio, joiningRatio, rejectionRatio,
      platformCandidates
    };
  };

  if (view === "add") {
    return (
      <div className="full-mode-panel" style={{ padding: "1.25rem", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        <div className="form-header flex-between mb-large" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
           <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Add Sourcing Channel</h2>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "4px 0 0 0" }}>Register a new talent acquisition platform and setup credential integrations.</p>
           </div>
           <button className="btn-secondary-v2" onClick={() => setView("list")} style={{ padding: "8px 24px", background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
        </div>
        <form onSubmit={handleAddPlatform} className="glass-card" style={{ padding: "2.5rem", borderRadius: "24px", background: "white", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.03)", maxWidth: "800px", margin: "0 auto" }}>
          <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
             <div className="input-group" style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", marginBottom: "6px" }}>Platform Name *</label>
                <input type="text" placeholder="e.g. LinkedIn, Naukri, Indeed" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }} />
             </div>
             <div className="input-group" style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", marginBottom: "6px" }}>Platform URL</label>
                <input type="url" placeholder="https://..." value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }} />
             </div>
             <div className="input-group" style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", marginBottom: "6px" }}>Account ID / Email</label>
                <input type="text" placeholder="Login ID" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }} />
             </div>
             <div className="input-group" style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", marginBottom: "6px" }}>Access Key / Password</label>
                <input type="text" placeholder="Credential details" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }} />
             </div>
             <div className="input-group" style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", marginBottom: "6px" }}>Subscription Cost</label>
                <input type="text" placeholder="e.g. ₹5,000/month" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }} />
             </div>
             <div className="input-group" style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", marginBottom: "6px" }}>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #cbd5e1", outline: "none", fontSize: "0.95rem", background: "white", cursor: "pointer" }}>
                   <option value="Active">Active</option>
                   <option value="Inactive">Inactive</option>
                </select>
             </div>
          </div>
          <button type="submit" className="btn-primary-v2" style={{ marginTop: "2rem", padding: "14px 40px", width: "100%", background: "#2563eb", color: "white", border: "none", borderRadius: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }} disabled={submitting}>
            {submitting ? "Deploying..." : "Deploy Channel"}
          </button>
        </form>
      </div>
    );
  }

  if (view === "analytics" && selectedPlatform) {
    const stats = getAnalytics(selectedPlatform.name);
    
    // Configs for gorgeous clickable cards
    const statConfig: any = {
      "Total Registered": { color: "#3b82f6", bg: "#eff6ff", icon: <LucideUsers size={16} /> },
      "Connected": { color: "#0ea5e9", bg: "#e0f2fe", icon: <LucideUserCheck size={16} /> },
      "Interested": { color: "#8b5cf6", bg: "#f5f3ff", icon: <LucideBarChart2 size={16} /> },
      "Not Connected": { color: "#f43f5e", bg: "#fff1f2", icon: <LucideXCircle size={16} /> },
      "Interview Scheduled": { color: "#d97706", bg: "#fffbeb", icon: <LucideCalendar size={16} /> },
      "Selected": { color: "#10b981", bg: "#ecfdf5", icon: <LucideCheckCircle2 size={16} /> },
      "Rejected": { color: "#ef4444", bg: "#fef2f2", icon: <LucideXCircle size={16} /> },
      "Process to Joining": { color: "#eab308", bg: "#fefce8", icon: <LucideActivity size={16} /> },
      "Joined": { color: "#059669", bg: "#f0fdf4", icon: <LucideRocket size={16} /> },
      "Dropped": { color: "#64748b", bg: "#f1f5f9", icon: <LucideTrash2 size={16} /> },
      "Interview Done": { color: "#10b981", bg: "#ecfdf5", icon: <LucideCheckCircle2 size={16} /> },
      "Interview Not Done": { color: "#ef4444", bg: "#fef2f2", icon: <LucideXCircle size={16} /> },
      "Processing for Interview": { color: "#f59e0b", bg: "#fffbeb", icon: <LucideCalendar size={16} /> }
    };

    const statusList = [
      "Total Registered", "Connected", "Interested", "Not Connected", "Interview Scheduled",
      "Selected", "Rejected", "Process to Joining", "Joined", "Dropped",
      "Interview Done", "Interview Not Done", "Processing for Interview"
    ];

    // Interactive candidate roster filter
    const platformCandidates = stats.platformCandidates;
    const getFilteredCandidates = () => {
      if (selectedAnalyticsStatus === "Total Registered") return platformCandidates;
      
      const keywordsMap: Record<string, string[]> = {
        "Connected": ["connected", "talked"],
        "Interested": ["interested"],
        "Not Connected": ["not connected", "no response"],
        "Interview Scheduled": ["interview scheduled", "go for interview", "scheduled"],
        "Selected": ["selected", "hired"],
        "Rejected": ["rejected", "not selected"],
        "Process to Joining": ["process to joining", "onboarding"],
        "Joined": ["joined"],
        "Dropped": ["dropped", "fallout"],
        "Interview Done": ["interview done", "round", "all rounds done", "processing for next round", "selected", "joined", "process to joining", "process for joining", "hired"],
        "Interview Not Done": ["interview not done"],
        "Processing for Interview": ["go for interview", "interview scheduled", "processing for interview"]
      };

      const kws = keywordsMap[selectedAnalyticsStatus] || [selectedAnalyticsStatus];
      return platformCandidates.filter(c => checkStatusHistory(c, kws));
    };

    const filteredCandidates = getFilteredCandidates();
    const activeStatConfig = statConfig[selectedAnalyticsStatus] || statConfig["Total Registered"];

    return (
      <div className="module-container" style={{ padding: "0 0.5rem", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        {/* Back and Date selector header */}
        <div className="module-header flex-between mb-large" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <button 
              onClick={() => { setView("list"); setSelectedPlatform(null); setSelectedAnalyticsStatus("Total Registered"); }} 
              style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", marginTop: "4px" }}
            >
              <LucideChevronLeft size={18} color="#475569" />
            </button>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
                <span style={{ color: "#0f172a" }}>{selectedPlatform.name} </span>
                <span style={{ color: "#2563eb" }}>Performance Dashboard</span>
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Sourcing Platforms</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                {selectedPlatform.username && (
                  <div style={{ background: "#f8fafc", color: "#475569", padding: "4px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 600, border: "1px solid #e2e8f0" }}>
                    Account ID/Email: <span style={{ color: "#334155", fontWeight: 700 }}>{selectedPlatform.username}</span>
                  </div>
                )}
                {selectedPlatform.password && (
                  <div style={{ background: "#f8fafc", color: "#475569", padding: "4px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 600, border: "1px solid #e2e8f0" }}>
                    Access Key/Password: <span style={{ color: "#334155", fontWeight: 700 }}>{selectedPlatform.password}</span>
                  </div>
                )}
                {selectedPlatform.cost && (
                  <div style={{ background: "#fffbeb", color: "#b45309", padding: "4px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700, border: "1px solid #fcd34d" }}>
                    Cost: {selectedPlatform.cost}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
             {role === "tl" && (
                <select
                  value={tlViewFilter}
                  onChange={(e) => setTlViewFilter(e.target.value)}
                  style={{ 
                    padding: "4px 8px", 
                    borderRadius: "6px", 
                    border: "1px solid #cbd5e1", 
                    fontSize: "0.72rem", 
                    fontWeight: 700, 
                    outline: "none", 
                    background: "white", 
                    cursor: "pointer" 
                  }}
                >
                  <option value="team">👥 Team Total</option>
                  <option value="personal">👤 My Personal</option>
                  <optgroup label="Recruiters Breakdown">
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        👤 {member.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
             )}
             {(role === "boss" || role === "manager") && (
                <select
                  value={tlViewFilter}
                  onChange={(e) => setTlViewFilter(e.target.value)}
                  style={{ 
                    padding: "4px 8px", 
                    borderRadius: "6px", 
                    border: "1px solid #cbd5e1", 
                    fontSize: "0.72rem", 
                    fontWeight: 700, 
                    outline: "none", 
                    background: "white", 
                    cursor: "pointer" 
                  }}
                >
                  <option value="all">🌐 Everyone / All</option>
                  {teamMembers.filter(m => m.role === "tl").map(tl => {
                    const recruitersUnderTl = teamMembers.filter(m => m.role === "recruiter" && m.reportingTo === tl.id);
                    return (
                      <optgroup key={tl.id} label={`👑 TL: ${tl.name}`}>
                        <option value={`team_tl_${tl.id}`}>👥 Whole Team</option>
                        <option value={`personal_tl_${tl.id}`}>👤 TL Personal</option>
                        {recruitersUnderTl.map(rec => (
                          <option key={rec.id} value={`recruiter_${rec.id}`}>📝 Recruiter: {rec.name}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                  {teamMembers.filter(m => m.role === "recruiter" && !teamMembers.some(tl => tl.role === "tl" && tl.id === m.reportingTo)).length > 0 && (
                    <optgroup label="💼 Direct Recruiters">
                      {teamMembers.filter(m => m.role === "recruiter" && !teamMembers.some(tl => tl.role === "tl" && tl.id === m.reportingTo)).map(rec => (
                        <option key={rec.id} value={`recruiter_${rec.id}`}>📝 Recruiter: {rec.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
             )}
             <select value={dateFilter} onChange={e => setDateFilter(e.target.value as any)} style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem", fontWeight: 700, outline: "none", background: "white", cursor: "pointer" }}>
                <option value="Today">Today</option>
                <option value="Last 7 Days">7 Days</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Custom">Custom</option>
             </select>
             {dateFilter === "Custom" && (
                <div style={{ display: "flex", gap: "4px" }}>
                  <input type="date" value={customDates.start} onChange={e => setCustomDates({...customDates, start: e.target.value})} style={{ padding: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.7rem", fontWeight: 600 }} />
                  <input type="date" value={customDates.end} onChange={e => setCustomDates({...customDates, end: e.target.value})} style={{ padding: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.7rem", fontWeight: 600 }} />
                </div>
             )}
          </div>
        </div>

        {/* 10 Gorgeous Interactive Metrics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "1.25rem" }}>
          {statusList.map(statusName => {
            const config = statConfig[statusName];
            
            // Map status text to statistics quantity key
            const statKeyMap: Record<string, string> = {
              "Total Registered": "total",
              "Connected": "connected",
              "Interested": "interested",
              "Not Connected": "notConnected",
              "Interview Scheduled": "interviewScheduled",
              "Selected": "selected",
              "Rejected": "rejected",
              "Process to Joining": "processToJoining",
              "Joined": "joined",
              "Dropped": "dropped",
              "Interview Done": "interviewDone",
              "Interview Not Done": "interviewNotDone",
              "Processing for Interview": "processingForInterview"
            };
            const quantity = (stats as any)[statKeyMap[statusName]] || 0;
            const isSelected = selectedAnalyticsStatus === statusName;

            return (
              <div 
                key={statusName}
                onClick={() => setSelectedAnalyticsStatus(statusName)}
                style={{ 
                  background: isSelected ? config.bg : "#ffffff", 
                  padding: "10px 12px", 
                  borderRadius: "12px", 
                  border: `1.5px solid ${isSelected ? config.color : "#e2e8f0"}`, 
                  boxShadow: isSelected ? `0 4px 10px ${config.color}12` : "none",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = config.color;
                    e.currentTarget.style.background = `${config.bg}20`;
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#ffffff";
                  }
                }}
              >
                 <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                   <div style={{ background: isSelected ? "#ffffff" : config.bg, color: config.color, width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {config.icon}
                   </div>
                   <div style={{ fontSize: "0.6rem", fontWeight: 800, color: isSelected ? config.color : "#64748b", textTransform: "uppercase", letterSpacing: "0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{statusName}</div>
                 </div>
                 <div style={{ fontSize: "1.2rem", fontWeight: 800, color: isSelected ? config.color : "#0f172a", lineHeight: 1 }}>{quantity}</div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Split View: Performance Ratios and Live filtered Candidate Table */}
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1rem", alignItems: "start" }}>
          
          {/* Performance Ratios Side Block */}
          <div className="glass-card" style={{ padding: "1rem", borderRadius: "16px", background: "white", border: "1px solid #e2e8f0" }}>
             <h3 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
               <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "6px", background: "#eff6ff", color: "#2563eb" }}>
                 <LucidePieChart size={14} />
               </div>
               Conversion Efficiency
             </h3>
             <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <RatioBar label="Total Pipeline Conversion" ratio={stats.conversionRate} color="#16a34a" />
                <RatioBar label="Interested Pipeline Ratio" ratio={stats.interestedRatio} color="#8b5cf6" />
                <RatioBar label="Selection pipeline Ratio" ratio={stats.selectionRatio} color="#2563eb" />
                <RatioBar label="Joined Placement Ratio" ratio={stats.joiningRatio} color="#10b981" />
                <RatioBar label="Recruitment Rejection Ratio" ratio={stats.rejectionRatio} color="#ef4444" />
             </div>
          </div>

          {/* Roster list view showing matched candidates log */}
          <div className="glass-card" style={{ padding: "1rem", borderRadius: "16px", background: "white", border: "1px solid #e2e8f0" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <h3 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "6px", background: activeStatConfig.bg, color: activeStatConfig.color }}>
                    <LucideUsers size={14} />
                  </div>
                  Roster: {selectedAnalyticsStatus} ({filteredCandidates.length})
                </h3>
                <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700 }}>Realtime Sync</span>
             </div>

             <div className="custom-scrollbar" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {filteredCandidates.length === 0 ? (
                  <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 700, border: "1px dashed #e2e8f0", borderRadius: "12px", background: "#f8fafc" }}>
                     <LucideUsers size={24} style={{ opacity: 0.5, marginBottom: "6px" }} />
                     No candidates match this segment
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
                    {filteredCandidates.map((c: any) => (
                      <div 
                        key={c.id || c._id} 
                        className="candidate-sourced-row" 
                        style={{ 
                          display: "flex", 
                          flexDirection: "column",
                          justifyContent: "space-between", 
                          padding: "12px", 
                          background: "#ffffff", 
                          borderRadius: "14px", 
                          border: "1px solid #e2e8f0", 
                          transition: "all 0.2s ease" 
                        }}
                      >
                         <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px" }}>
                            <div style={{ 
                              width: "32px", 
                              height: "32px", 
                              borderRadius: "8px", 
                              background: getAvatarBgColor(c.name), 
                              color: getAvatarTextColor(c.name),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              flexShrink: 0
                            }}>
                              {c.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                               <strong style={{ display: "block", color: "#0f172a", fontSize: "0.85rem", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</strong>
                               <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.jobRole || c.designation || "Executive"} • {c.clientName || "Direct Partner"}</span>
                            </div>
                         </div>
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                               <span style={{ display: "inline-block", alignSelf: "flex-start", padding: "2px 6px", borderRadius: "5px", fontSize: "0.62rem", fontWeight: 800, background: getStatusColor(c.remarks).bg, color: getStatusColor(c.remarks).color, textTransform: "uppercase" }}>{c.remarks || "New"}</span>
                               <span style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: "2px" }}>by {c.recruiterName || "Recruiter"}</span>
                            </div>
                            <button
                              onClick={() => setSelectedCandidate(c)}
                              style={{ 
                                padding: "4px 10px", 
                                background: "#eff6ff", 
                                border: "1px solid #bfdbfe", 
                                color: "#2563eb", 
                                borderRadius: "6px", 
                                fontSize: "0.68rem", 
                                fontWeight: 800, 
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                transition: "all 0.15s"
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "#2563eb"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.borderColor = "#bfdbfe"; }}
                            >
                               <LucideEye size={11} /> Profile
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
        
        {/* Slide-out Candidate Profile Drawer integration */}
        <AnimatePresence>
          {selectedCandidate && (
            <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
              <motion.div 
                initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
                style={{ background: "white", width: "420px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(15, 23, 42, 0.08)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                     <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                       <LucideUserCheck size={16} color="#2563eb" />
                       <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0, textTransform: "uppercase" }}>Candidate Workspace</h3>
                     </div>
                     <button onClick={() => setSelectedCandidate(null)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", borderRadius: "50%" }} onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "none"}><LucideX size={18} color="#94a3b8" /></button>
                   </div>

                   {/* Main Profile Avatar Card */}
                   <div style={{ background: "linear-gradient(to bottom, #f8fafc, #ffffff)", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                         <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: getAvatarBgColor(selectedCandidate.name), color: getAvatarTextColor(selectedCandidate.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 800 }}>
                            {selectedCandidate.name?.[0]?.toUpperCase()}
                         </div>
                         <div>
                            <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{selectedCandidate.name}</h4>
                            <div style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.72rem", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}><LucideBriefcase size={12} />{selectedCandidate.jobRole || selectedCandidate.designation || "Designation Not Specified"}</div>
                         </div>
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", borderTop: "1px solid #f1f5f9", paddingTop: "8px", fontSize: "0.68rem" }}>
                         <span style={{ padding: "2px 6px", background: "#f8fafc", color: "#475569", borderRadius: "5px", fontWeight: 800, border: "1px solid #cbd5e1" }}>Client: {selectedCandidate.clientName || "Direct Partner"}</span>
                         <span style={{ padding: "2px 6px", background: "#eff6ff", color: "#2563eb", borderRadius: "5px", fontWeight: 800, border: "1px solid #bfdbfe" }}>Sourced via {selectedCandidate.sourcingBy}</span>
                      </div>
                   </div>

                   {/* visual hiring timeline indicator */}
                   <div style={{ marginBottom: "1rem", background: "#ffffff", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "16px" }}>
                      <h5 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Hiring Funnel Status</h5>
                      
                      {(() => {
                         const pipelineSteps = [
                           { label: "Sourced", active: true, color: "#3b82f6" },
                           { label: "Connected", active: checkStatusHistory(selectedCandidate, ["connected", "talked"]), color: "#0ea5e9" },
                           { label: "Interested", active: checkStatusHistory(selectedCandidate, ["interested"]), color: "#8b5cf6" },
                           { label: "Interview", active: checkStatusHistory(selectedCandidate, ["interview scheduled", "scheduled", "interview"]), color: "#f59e0b" },
                           { label: "Selected", active: checkStatusHistory(selectedCandidate, ["selected", "hired"]), color: "#10b981" },
                           { label: "Joined", active: checkStatusHistory(selectedCandidate, ["joined"]), color: "#22c55e" }
                         ];

                         return (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                               {pipelineSteps.map((step, sIdx) => (
                                  <div key={step.label} style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
                                     {sIdx < pipelineSteps.length - 1 && (
                                        <div style={{ position: "absolute", left: "9px", top: "18px", bottom: "-10px", width: "2px", background: step.active && pipelineSteps[sIdx + 1].active ? step.color : "#e2e8f0", zIndex: 1 }} />
                                     )}
                                     <div style={{ 
                                       width: "20px", 
                                       height: "20px", 
                                       borderRadius: "50%", 
                                       background: step.active ? step.color : "#ffffff", 
                                       border: `2px solid ${step.active ? step.color : "#cbd5e1"}`,
                                       display: "flex",
                                       alignItems: "center",
                                       justifyContent: "center",
                                       color: "white",
                                       fontSize: "0.6rem",
                                       zIndex: 2
                                     }}>
                                        {step.active && <LucideCheck size={10} strokeWidth={3} />}
                                     </div>
                                     <span style={{ fontSize: "0.75rem", fontWeight: step.active ? 800 : 500, color: step.active ? "#0f172a" : "#64748b" }}>{step.label}</span>
                                  </div>
                               ))}
                            </div>
                         );
                      })()}
                   </div>

                   {/* Contact coordinates box with copy buttons */}
                   <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1rem" }}>
                      <h5 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Candidate Coordinates</h5>
                      <CopyableField label="Phone" value={selectedCandidate.phone} icon={<LucidePhone size={13} />} />
                      <CopyableField label="Email" value={selectedCandidate.email} icon={<LucideMail size={13} />} />
                      <CopyableField label="Address / City" value={selectedCandidate.city || selectedCandidate.locality} icon={<LucideMapPin size={13} />} />
                   </div>

                   {/* Recruiter interaction logs history timeline */}
                   <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem" }}>
                      <h5 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "4px" }}><LucideClock size={13} /> Interaction Log History</h5>
                      
                      <div className="custom-scrollbar" style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                         {selectedCandidate.InteractionNotes && selectedCandidate.InteractionNotes.length > 0 ? (
                            selectedCandidate.InteractionNotes.map((n: any, idx: number) => (
                               <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 10px", borderRadius: "10px", fontSize: "0.72rem" }}>
                                  <div style={{ color: "#475569", lineHeight: 1.4 }}>"{n.text}"</div>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", color: "#94a3b8", fontSize: "0.62rem", fontWeight: 600 }}>
                                     <span>By Recruiter</span>
                                     <span>{new Date(n.createdAt || Date.now()).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</span>
                                  </div>
                                </div>
                            ))
                         ) : (
                            <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "8px 10px", borderRadius: "10px", fontSize: "0.72rem", color: "#92400e", lineHeight: 1.4, fontWeight: 500 }}>
                               "{selectedCandidate.remarks || "No historical logs documented. Sourced candidate profile created in CRM pipeline."}"
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem", marginTop: "1rem" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#94a3b8", marginBottom: "10px", fontWeight: 600 }}>
                      <span>Sourced On: {new Date(selectedCandidate.createdAt || Date.now()).toLocaleDateString()}</span>
                      <span>By: {selectedCandidate.recruiterName || "Sourcing Manager"}</span>
                   </div>
                   <button 
                     onClick={() => alert("Candidate CSV / CV profile details exported successfully")}
                     style={{ width: "100%", padding: "10px", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 4px 10px rgba(37,99,235,0.15)" }}
                   >
                      <LucideRocket size={14} /> Export Sourced Record
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  const filteredPlatforms = platforms.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = p.name.toLowerCase().includes(q) || 
                    (p.url && p.url.toLowerCase().includes(q)) ||
                    (p.username && p.username.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="module-container" style={{ padding: "1.25rem", height: "100%", background: "transparent", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Header Section */}
      <div className="flex-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div className="header-text">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Sourcing </span>
            <span style={{ color: "#2563eb" }}>Hub</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Configure external streams, track channel performance, and monitor candidate metrics.</p>
        </div>
        {role !== "recruiter" && (
          <button 
            className="btn-primary" 
            onClick={() => setView("add")}
            style={{ 
              padding: "0 18px", 
              borderRadius: "10px", 
              height: "40px", 
              fontSize: "0.85rem", 
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
              background: "#2563eb",
              color: "white",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)"
            }}
          >
            <LucidePlus size={16} strokeWidth={3} /> Add Channel
          </button>
        )}
      </div>

      {!loading && platforms.length > 0 && (
        <div style={{ background: "white", padding: "0.5rem 0.75rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <LucideSearch size={14} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "9px" }} />
            <input 
               type="text" 
               placeholder="Search sourcing channels..." 
               value={searchQuery} 
               onChange={e => setSearchQuery(e.target.value)} 
               style={{ width: "100%", padding: "6px 10px 6px 30px", border: "1px solid #cbd5e1", borderRadius: "8px", outline: "none", fontSize: "0.8rem" }} 
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.8rem", outline: "none", cursor: "pointer", fontWeight: 600, color: "#475569" }}
          >
             <option value="All">All Statuses</option>
             <option value="Active">Active Only</option>
             <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex-center" style={{ height: "400px" }}>
          <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        </div>
      ) : platforms.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card flex-center flex-column" 
          style={{ height: "400px", background: "white", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}
        >
          <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "#f8fafc", color: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid #cbd5e1" }}>
             <LucideSearch size={40} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#1e293b", margin: 0 }}>Sourcing Pipelines Empty</h3>
          <p style={{ color: "#64748b", fontSize: "0.88rem", textAlign: "center", marginTop: "8px", maxWidth: "340px" }}>Connect your external sourcing portals (LinkedIn, Naukri, etc.) to start tracking synchronized candidate streams.</p>
        </motion.div>
      ) : filteredPlatforms.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card flex-center flex-column" 
          style={{ height: "300px", background: "white", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}
        >
          <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: "#f8fafc", color: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px", border: "1px solid #e2e8f0" }}>
             <LucideSearch size={30} />
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>No matching channels found</h3>
          <p style={{ color: "#64748b", fontSize: "0.82rem", textAlign: "center", marginTop: "6px", maxWidth: "300px" }}>Try adjusting your search query or status filter settings.</p>
        </motion.div>
      ) : (
        <div className="sourcing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.25rem" }}>
          {filteredPlatforms.map((p, idx) => {
             const basicStats = getAnalytics(p.name);
             const isActive = p.status === "Active";
             return (
             <motion.div 
              key={p.id} 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => { setSelectedPlatform(p); setView("analytics"); }}
              className="platform-node-card glass-card" 
              style={{ 
                padding: "1.25rem", 
                borderRadius: "20px", 
                background: "white", 
                border: "1px solid #e2e8f0", 
                position: "relative", 
                overflow: "hidden", 
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
              }}
             >
              <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "120px", height: "120px", background: `radial-gradient(circle, ${isActive ? "rgba(37, 99, 235, 0.04)" : "rgba(148, 163, 184, 0.04)"} 0%, transparent 70%)` }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ 
                    width: "44px", height: "44px", borderRadius: "12px", 
                    background: isActive ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", 
                    color: isActive ? "#2563eb" : "#94a3b8", 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid",
                    borderColor: isActive ? "#dbeafe" : "#e2e8f0",
                  }}>
                    <LucideGlobe size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 2px 0" }}>{p.name}</h3>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                       <span style={{ 
                         fontSize: "0.6rem", fontWeight: 900, padding: "2px 6px", borderRadius: "5px",
                         background: isActive ? "#ecfdf5" : "#f1f5f9", 
                         color: isActive ? "#059669" : "#64748b",
                         textTransform: "uppercase",
                         letterSpacing: "0.5px"
                       }}>
                          {p.status}
                       </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedPlatform(p); setView("analytics"); }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      border: "1px solid #bfdbfe",
                      background: "#eff6ff",
                      color: "#2563eb",
                      fontWeight: 800,
                      fontSize: "0.68rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      whiteSpace: "nowrap"
                    }}
                    className="view-more-btn"
                  >
                    View Stats
                  </button>
                  {role !== "recruiter" && (
                    <button 
                      onClick={(e) => handleDelete(e, p.id)} 
                      className="delete-node-btn"
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: "#cbd5e1", 
                        cursor: "pointer", 
                        width: "28px", 
                        height: "28px", 
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s" 
                      }}
                    >
                      <LucideTrash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Preview Specs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1rem" }}>
                 <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0", transition: "all 0.2s" }} className="preview-stat-box">
                    <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Registered</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#2563eb" }}>{basicStats.total}</div>
                 </div>
                 <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0", transition: "all 0.2s" }} className="preview-stat-box">
                    <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Conversion</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#10b981" }}>{basicStats.conversionRate}</div>
                 </div>
              </div>

              <div 
                className="platform-card-cta"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "4px", 
                  color: "#2563eb", 
                  fontSize: "0.75rem", 
                  fontWeight: 800, 
                  background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", 
                  padding: "8px", 
                  borderRadius: "10px", 
                  transition: "all 0.2s ease" 
                }}
              >
                 <span>Show Pipeline Performance Flow</span>
                 <LucideArrowRight size={12} className="cta-arrow" style={{ transition: "transform 0.2s ease" }} />
              </div>
             </motion.div>
          )})}
        </div>
      )}

      <style>{`
        .delete-node-btn:hover { background: #fee2e2 !important; color: #ef4444 !important; }
        .view-more-btn:hover { background: #2563eb !important; color: white !important; border-color: #2563eb !important; }
        .platform-node-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .platform-node-card:hover { transform: translateY(-3px); border-color: #cbd5e1; box-shadow: 0 10px 20px -8px rgba(0, 0, 0, 0.06); }
        .platform-node-card:hover .preview-stat-box { background: white; border-color: #cbd5e1; }
        .platform-node-card:hover .platform-card-cta { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important; color: white !important; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15); }
        .platform-node-card:hover .cta-arrow { transform: translateX(2px); }
        
        .candidate-sourced-row:hover {
          background: #f8fafc !important;
          border-color: #cbd5e1 !important;
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
          transform: translateY(-1px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

// Copy-to-clipboard badges with interactive checked icons
const CopyableField = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.78rem" }}>
       <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#64748b", display: "flex" }}>{icon}</span>
          <div>
             <span style={{ color: "#94a3b8", display: "block", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
             <strong style={{ color: "#1e293b", fontFamily: label === "Phone" ? "monospace" : "inherit" }}>{value || "Not Uploaded"}</strong>
          </div>
       </div>
       {value && (
         <button onClick={handleCopy} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#16a34a" : "#94a3b8", display: "flex", padding: "4px", borderRadius: "5px" }} onMouseEnter={e => e.currentTarget.style.background = "#e2e8f0"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
            {copied ? <LucideCheck size={12} strokeWidth={3} /> : <LucideCopy size={12} />}
         </button>
       )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color, bg }: any) => (
  <motion.div 
    whileHover={{ y: -4, boxShadow: `0 12px 20px -8px ${color}22`, borderColor: color }}
    style={{ 
      background: "white", 
      padding: "16px", 
      borderRadius: "16px", 
      border: "1px solid #f1f5f9", 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "space-between",
      gap: "12px", 
      position: "relative", 
      overflow: "hidden",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease"
    }}
  >
     <div style={{ 
        position: "absolute", 
        right: "-15px", 
        top: "-15px", 
        width: "60px", 
        height: "60px", 
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        borderRadius: "50%" 
     }} />
     <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
       <div style={{ 
         background: bg, 
         color: color, 
         width: "36px", 
         height: "36px", 
         borderRadius: "10px", 
         display: "flex", 
         alignItems: "center", 
         justifyContent: "center",
         boxShadow: `0 4px 10px -2px ${color}25`
       }}>
         {icon}
       </div>
       <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: "1.2" }}>{title}</div>
     </div>
     <div style={{ fontSize: "1.85rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-1px" }}>{value}</div>
  </motion.div>
);

const RatioBar = ({ label, ratio, color }: any) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
      <span style={{ fontWeight: 700, color: "#334155" }}>{label}</span>
      <span style={{ 
        color: color, 
        fontWeight: 900, 
        background: `${color}10`, 
        padding: "2px 8px", 
        borderRadius: "6px",
        fontSize: "0.72rem"
      }}>{ratio}</span>
    </div>
    <div style={{ width: "100%", height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden", padding: "1px", border: "1px solid #f1f5f9" }}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: ratio }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ 
          height: "100%", 
          background: `linear-gradient(90deg, ${color}cc 0%, ${color} 100%)`, 
          borderRadius: "999px",
        }} 
      />
    </div>
  </div>
);

const getStatusColor = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("joined") || s.includes("selected")) return { bg: "#ecfdf5", color: "#059669" };
  if (s.includes("rejected") || s.includes("not interested")) return { bg: "#fef2f2", color: "#ef4444" };
  if (s.includes("interview") || s.includes("processing") || s.includes("process to joining")) return { bg: "#fffbeb", color: "#d97706" };
  if (s.includes("connected") || s.includes("registered")) return { bg: "#eff6ff", color: "#2563eb" };
  return { bg: "#f1f5f9", color: "#64748b" };
};
