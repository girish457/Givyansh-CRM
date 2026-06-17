import { useState, useEffect } from "react";
import {
  LucidePlus,
  LucideX,
  LucidePhone,
  LucideEye,
  LucidePencil,
  LucideTrash2,
  LucideLogOut,
  LucideLogIn,
  LucideLoader2,
  LucideUserCircle2,
  LucideUserPlus,
  LucideBriefcase,
  LucideShieldCheck,
  LucideUsers2,
  LucideMail,
  LucideLock,
  LucideFingerprint,
  LucideArrowLeft,
  LucideKey,
  LucideAtSign,
  LucideUserCheck,
  LucideRefreshCcw,
  LucideSearch,
  LucideClock,
  LucideCoffee,
  LucideAward,
  LucideTrendingUp,
  LucideFlame,
  LucideCheckCircle2,
  LucideCalendar,
  LucideActivity,
  LucideFilter,
  LucideStar,
  LucideZap,
  LucideMonitor,
  LucideDownload,
  LucideChevronDown,
  LucideChevronUp,
  LucideInfo,
  LucideFileBarChart,
  LucideClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileView from "./ProfileView";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  designation: string;
  role: "manager" | "tl" | "recruiter";
  status: "active" | "inactive" | "leaved";
  manager_tl?: {
    id: number;
    name: string;
    role: string;
  };
}

// Enterprise-Grade TL Team Monitoring, Activity Tracking & Employee Insights Component
function TLTeamMonitoring() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [productivityFilter, setProductivityFilter] = useState("all");

  // Detailed modal state
  const [selectedRecruiter, setSelectedRecruiter] = useState<any>(null);
  const [modalTab, setModalTab] = useState<"performance" | "tasks" | "attendance" | "activity" | "personal_info">("performance");
  const [recruiterTasks, setRecruiterTasks] = useState<any[]>([]);
  const [recruiterCandidates, setRecruiterCandidates] = useState<any[]>([]);
  const [recruiterAttendance, setRecruiterAttendance] = useState<any[]>([]);
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null);
  const [showViewProfileId, setShowViewProfileId] = useState<number | null>(null);
  const [loadingModalData, setLoadingModalData] = useState(false);

  // Real-time ticking state for animations and timers
  const [tickingSeconds, setTickingSeconds] = useState(0);

  // 1. Ticking effect for live timers
  useEffect(() => {
    const timer = setInterval(() => {
      setTickingSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch and Poll live monitoring dashboard
  const fetchMonitoringData = async () => {
    try {
      const res = await fetch("/api/tl/team-monitoring");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Team lead portal sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 5000); // 5s fast polling for real-time synchronization
    return () => clearInterval(interval);
  }, []);

  // 3. Fetch recruiter detail modal contents
  useEffect(() => {
    if (!selectedRecruiter) return;
    const fetchRecruiterDetails = async () => {
      setLoadingModalData(true);
      try {
        const [tasksRes, candidatesRes, attendanceRes, profileRes] = await Promise.all([
          fetch("/api/tasks").then(r => r.ok ? r.json() : []),
          fetch("/api/candidates").then(r => r.ok ? r.json() : []),
          fetch(`/api/attendance/hub?userId=${selectedRecruiter.id}`).then(r => r.ok ? r.json() : []),
          fetch(`/api/employee-profile/${selectedRecruiter.id}`).then(r => r.ok ? r.json() : null)
        ]);

        setRecruiterTasks(Array.isArray(tasksRes) ? tasksRes.filter((t: any) => t.assigneeId === selectedRecruiter.id) : []);
        setRecruiterCandidates(Array.isArray(candidatesRes) ? candidatesRes.filter((c: any) => c.assignedTo === selectedRecruiter.id || c.addedBy === selectedRecruiter.id) : []);
        setRecruiterAttendance(Array.isArray(attendanceRes) ? attendanceRes : []);
        setRecruiterProfile(profileRes);
      } catch (err) {
        console.error("Failed to load recruiter modal details", err);
      } finally {
        setLoadingModalData(false);
      }
    };
    fetchRecruiterDetails();
  }, [selectedRecruiter]);

  if (loading && !data) {
    return (
      <div className="flex-center" style={{ height: "450px", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" color="#2563eb" size={45} />
        <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 700 }}>Synthesizing Recruiter Pulse...</span>
      </div>
    );
  }

  const kpi = data?.kpi || {
    totalTeamMembers: 0,
    currentlyOnline: 0,
    currentlyOnBreak: 0,
    currentlyWorking: 0,
    totalWorkingToday: 0,
    totalBreakCountToday: 0,
    averageTeamProductivity: 0,
    totalCandidatesAddedToday: 0
  };

  const recruiters = data?.teamList || [];
  const productivityAnalytics = data?.productivityAnalytics || {
    mostActiveRecruiter: "N/A",
    highestConversionRecruiter: "N/A",
    lowestBreakTime: "N/A",
    bestAttendance: "N/A",
    highestJoiningRatio: "N/A"
  };

  const attendanceInsights = data?.attendanceInsights || {
    averageTeamLoginTiming: "09:30 AM",
    averageBreakDuration: "0m",
    teamOvertimeHours: 0,
    attendanceConsistency: "0%"
  };

  const rankings = data?.performanceRanking || [];

  // Filter recruiters list
  const filteredRecruiters = recruiters.filter((r: any) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.currentActivity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "online") matchesStatus = r.status !== "Offline";
    else if (statusFilter === "offline") matchesStatus = r.status === "Offline";
    else if (statusFilter === "working") matchesStatus = r.status === "Working";
    else if (statusFilter === "on_break") matchesStatus = r.status.includes("Break");
    else if (statusFilter === "overtime") matchesStatus = r.assignedShift?.isOvertime && r.status !== "Offline";

    let matchesShift = true;
    if (shiftFilter !== "all") {
      matchesShift = r.assignedShift?.name?.toLowerCase().includes(shiftFilter.toLowerCase());
    }

    let matchesProd = true;
    if (productivityFilter === "high") matchesProd = r.productivityScore >= 70;
    else if (productivityFilter === "mid") matchesProd = r.productivityScore >= 40 && r.productivityScore < 70;
    else if (productivityFilter === "low") matchesProd = r.productivityScore < 40;

    return matchesSearch && matchesStatus && matchesShift && matchesProd;
  });

  // Helper to dynamically calculate ticking active timer
  const getLiveTickingTimer = (recruiter: any) => {
    if (recruiter.status === "Offline" || recruiter.loginTime === "N/A") {
      return recruiter.liveWorkingHours;
    }
    const match = recruiter.liveWorkingHours.match(/(\d+)h\s+(\d+)m/);
    if (!match) return recruiter.liveWorkingHours;
    let h = parseInt(match[1]);
    let m = parseInt(match[2]);

    // Add seconds ticking
    const elapsedSecs = tickingSeconds % 60;
    const extraMins = Math.floor(tickingSeconds / 60) % 60;

    let finalM = m + extraMins;
    let finalH = h + Math.floor(finalM / 60);
    finalM = finalM % 60;

    return `${finalH.toString().padStart(2, '0')}h ${finalM.toString().padStart(2, '0')}m ${elapsedSecs.toString().padStart(2, '0')}s`;
  };

  // Helper to get Status Color Scheme
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Working":
        return { bg: "#ecfdf5", text: "#10b981", border: "#a7f3d0", label: "Working", glow: "#10b981" };
      case "On Break":
      case "Break":
        return { bg: "#fffbeb", text: "#d97706", border: "#fde68a", label: "On Break", glow: "#d97706" };
      case "Lunch Break":
        return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe", label: "Lunch Break", glow: "#2563eb" };
      case "Idle":
        return { bg: "#fef3c7", text: "#b45309", border: "#fde68a", label: "Idle", glow: "#b45309" };
      case "Overtime Active":
        return { bg: "#faf5ff", text: "#8b5cf6", border: "#e9d5ff", label: "Overtime Active", glow: "#8b5cf6" };
      default:
        return { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0", label: "Offline", glow: "transparent" };
    }
  };

  return (
    <div className="tl-team-monitoring-system" style={{ padding: "0.5rem 0.75rem", fontFamily: "'Outfit', 'Inter', sans-serif", background: "#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .pulse-light {
          position: relative;
        }
        .pulse-light::after {
          content: '';
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: currentColor;
          top: 50%;
          left: -8px;
          transform: translateY(-50%);
          box-shadow: 0 0 5px currentColor;
          animation: statusGlow 1.5s infinite ease-in-out;
        }
        @keyframes statusGlow {
          0%, 100% { opacity: 0.4; transform: translateY(-50%) scale(0.9); }
          50% { opacity: 1; transform: translateY(-50%) scale(1.2); }
        }
        .kpi-metric-card {
          background: white;
          border-radius: 8px;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          transition: all 0.2s ease-in-out;
        }
        .kpi-metric-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
          border-color: #cbd5e1;
        }
        .live-recruiter-card {
          background: white;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          padding: 10px 14px;
          margin-bottom: 6px;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
        }
        .live-recruiter-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59,130,246,0.04);
          transform: translateY(-0.5px);
        }
        .stat-chip-mini {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #475569;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .quick-action-btn {
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
        }
        .quick-action-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .monitoring-filter-select {
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #475569;
          outline: none;
          cursor: pointer;
          transition: all 0.15s;
        }
        .monitoring-filter-select:focus {
          border-color: #3b82f6;
        }
        .detail-tab-btn {
          padding: 6px 12px;
          font-weight: 700;
          font-size: 0.78rem;
          color: #64748b;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .detail-tab-btn.active {
          color: #3b82f6;
          border-color: #3b82f6;
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="flex-between" style={{ alignItems: "center", marginBottom: "0.6rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Team Commander </span>
            <span style={{ color: "#2563eb" }}>Central</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>
            Live desking analytics, active task statuses, and conversion rankings.
          </p>
        </div>
        <div>
          <button onClick={fetchMonitoringData} className="quick-action-btn" style={{ padding: "6px 10px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700, fontSize: "0.72rem", borderRadius: "6px" }}>
            <LucideRefreshCcw size={12} /> Force Sync
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.5rem", marginBottom: "0.6rem" }}>
        <div className="kpi-metric-card" style={{ borderLeft: "2.5px solid #8b5cf6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b5cf6", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Total Members</span>
            <LucideUsers2 size={13} />
          </div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{kpi.totalTeamMembers}</h2>
          <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 600 }}>TL Reporting Strength</span>
        </div>
        <div className="kpi-metric-card" style={{ borderLeft: "2.5px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Active Working</span>
            <LucideZap size={13} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{kpi.currentlyWorking}</h2>
            <span style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: 800 }}>/ {kpi.currentlyOnline} Online</span>
          </div>
          <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 600 }}>Active CRM Desks</span>
        </div>
        <div className="kpi-metric-card" style={{ borderLeft: "2.5px solid #d97706" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#d97706", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>On Break</span>
            <LucideCoffee size={13} />
          </div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{kpi.currentlyOnBreak}</h2>
          <span style={{ fontSize: "0.58rem", color: "#d97706", fontWeight: 700 }}>● {kpi.totalBreakCountToday} breaks</span>
        </div>
        <div className="kpi-metric-card" style={{ borderLeft: "2.5px solid #3b82f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#3b82f6", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Sourced Today</span>
            <LucideUserPlus size={13} />
          </div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{kpi.totalCandidatesAddedToday}</h2>
          <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 600 }}>Total Team Sourcing</span>
        </div>
        <div className="kpi-metric-card" style={{ borderLeft: "2.5px solid #f43f5e" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#f43f5e", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Productivity</span>
            <LucideFlame size={13} />
          </div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{kpi.averageTeamProductivity}%</h2>
          <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 600 }}>SaaS Sourcing KPI</span>
        </div>
      </div>

      {/* FILTER & SEARCH SYSTEM */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "6px", marginBottom: "8px", background: "white", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <input
            className="input-premium"
            placeholder="Search recruiters by name, status, shift or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "26px", height: "28px", borderRadius: "6px", border: "1.5px solid #e2e8f0", fontSize: "0.75rem" }}
          />
          <LucideSearch size={12} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
        </div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 900, color: "#64748b", marginRight: "2px" }}>FILTERS:</span>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="monitoring-filter-select">
            <option value="all">Status: All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="working">Working</option>
            <option value="on_break">On Break</option>
            <option value="overtime">Overtime</option>
          </select>
          <select value={shiftFilter} onChange={e => setShiftFilter(e.target.value)} className="monitoring-filter-select">
            <option value="all">Shift: All</option>
            <option value="day">Day</option>
            <option value="night">Night</option>
            <option value="general">General</option>
          </select>
          <select value={productivityFilter} onChange={e => setProductivityFilter(e.target.value)} className="monitoring-filter-select">
            <option value="all">KPI: All</option>
            <option value="high">High (&gt;70%)</option>
            <option value="mid">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* CORE TEAM LAYOUT SYSTEM */}
      <div style={{ display: "grid", gridTemplateColumns: "2.1fr 0.9fr", gap: "0.6rem", alignItems: "start" }}>

        {/* LEFT COLUMN: LIVE TEAM LIST */}
        <div>
          <div style={{ background: "#0f172a", color: "white", padding: "6px 12px", borderRadius: "8px 8px 0 0", fontSize: "0.72rem", fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Live Recruiter Monitoring Console</span>
            <span style={{ color: "#3b82f6", background: "rgba(59,130,246,0.15)", padding: "1px 5px", borderRadius: "3px", fontSize: "0.6rem", fontWeight: 900 }}>
              {filteredRecruiters.length} Active
            </span>
          </div>

          <div style={{ minHeight: "350px" }}>
            {filteredRecruiters.map((recruiter: any) => {
              const statusCfg = getStatusConfig(recruiter.status);
              return (
                <div key={recruiter.id} className="live-recruiter-card" style={{ borderTop: "none" }}>

                  {/* FIRST ROW: INFO & STATUS */}
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {/* AVATAR */}
                      <div style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        background: recruiter.status === "Offline" ? "#f1f5f9" : "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
                        color: recruiter.status === "Offline" ? "#64748b" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: "0.8rem",
                        boxShadow: recruiter.status === "Offline" ? "none" : "0 2px 4px rgba(59,130,246,0.1)"
                      }}>
                        {recruiter.name[0]}
                      </div>
                      <div>
                        <h3 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>{recruiter.name}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "1px" }}>
                          <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700 }}>{recruiter.role}</span>
                          <span style={{ color: "#cbd5e1" }}>•</span>
                          <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 500 }}>{recruiter.email}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {/* LIVE STATUS PILL */}
                      <div style={{
                        background: statusCfg.bg,
                        color: statusCfg.text,
                        border: `1px solid ${statusCfg.border}`,
                        borderRadius: "4px",
                        padding: "2px 6px",
                        fontSize: "0.62rem",
                        fontWeight: 900,
                        display: "flex",
                        alignItems: "center",
                        gap: "3px"
                      }}>
                        {recruiter.status !== "Offline" && (
                          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: statusCfg.text }} />
                        )}
                        {statusCfg.label.toUpperCase()}
                      </div>

                      {/* Productivity score badge */}
                      <div style={{ background: recruiter.productivityScore >= 70 ? "#ecfdf5" : (recruiter.productivityScore >= 40 ? "#eff6ff" : "#fff1f2"), color: recruiter.productivityScore >= 70 ? "#10b981" : (recruiter.productivityScore >= 40 ? "#3b82f6" : "#f43f5e"), padding: "2px 6px", borderRadius: "4px", border: "1px solid currentColor", fontSize: "0.62rem", fontWeight: 900 }}>
                        KPI {recruiter.productivityScore}%
                      </div>
                    </div>
                  </div>

                  {/* SECOND ROW: LIVE ACTIVITY MONITORING & LIVE TIMERS */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.95fr 0.85fr", gap: "6px", marginBottom: "6px", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>

                    {/* CURRENT ACTIVITY */}
                    <div>
                      <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>LIVE ACTIVITY</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                        <LucideActivity size={11} color={recruiter.status === "Offline" ? "#94a3b8" : "#3b82f6"} />
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: recruiter.status === "Offline" ? "#64748b" : "#0f172a" }}>
                          {recruiter.currentActivity}
                        </span>
                      </div>
                    </div>

                    {/* LIVE WORKING TIMER */}
                    <div>
                      <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>TODAY WORK TIMER</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                        <LucideClock size={11} color="#10b981" />
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#10b981", fontVariantNumeric: "tabular-nums" }}>
                          {getLiveTickingTimer(recruiter)}
                        </span>
                      </div>
                    </div>

                    {/* TODAY LOGIN LOG DETAILS */}
                    <div>
                      <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>LOGIN ENTRY</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", marginTop: "1px", display: "block" }}>
                        In: {recruiter.loginTime} {recruiter.loginStatus !== "On Time" && (
                          <span style={{ fontSize: "0.5rem", padding: "1px 3px", borderRadius: "2px", background: recruiter.loginStatus.includes("Early") ? "#ecfdf5" : "#fff1f2", color: recruiter.loginStatus.includes("Early") ? "#10b981" : "#f43f5e", marginLeft: "2px", fontWeight: 900 }}>
                            {recruiter.loginStatus.includes("Early") ? "EARLY" : "LATE"}
                          </span>
                        )}
                      </span>
                    </div>

                  </div>

                  {/* THIRD ROW: PERFORMANCE SNAPSHOT & QUICK ACTIONS */}
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>

                    {/* Performance Chips */}
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      <span className="stat-chip-mini">SOURCED <strong style={{ color: "#1e293b" }}>{recruiter.performanceSnapshot.candidatesAddedToday}</strong></span>
                      <span className="stat-chip-mini">SCHED <strong style={{ color: "#3b82f6" }}>{recruiter.performanceSnapshot.interviewsScheduledToday}</strong></span>
                      <span className="stat-chip-mini">SELECT <strong style={{ color: "#10b981" }}>{recruiter.performanceSnapshot.selectedToday}</strong></span>
                      <span className="stat-chip-mini">JOINED <strong style={{ color: "#8b5cf6" }}>{recruiter.performanceSnapshot.joinedToday}</strong></span>
                      <span className="stat-chip-mini">LEADS <strong style={{ color: "#f59e0b" }}>{recruiter.performanceSnapshot.leadsAddedToday}</strong></span>
                      <span className="stat-chip-mini">TASKS <strong style={{ color: "#64748b" }}>{recruiter.performanceSnapshot.tasksCompletedToday}</strong></span>
                    </div>

                    {/* Quick Action buttons */}
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => { setSelectedRecruiter(recruiter); setModalTab("performance"); }}
                        className="quick-action-btn"
                        style={{ display: "flex", alignItems: "center", gap: "2px", fontWeight: 800, fontSize: "0.68rem", background: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe", padding: "4px 8px", borderRadius: "6px" }}
                      >
                        <LucideEye size={11} /> Profile
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}

            {filteredRecruiters.length === 0 && (
              <div style={{ background: "white", padding: "30px 15px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b" }}>
                <LucideUserCircle2 size={30} style={{ margin: "0 auto 8px", opacity: 0.6 }} />
                <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>No Recruiters Found</h3>
                <p style={{ fontSize: "0.72rem", margin: "1px 0 0" }}>Adjust your filters or query string to reveal active personnel.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LEADERBOARDS & INSIGHTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>

          {/* TEAM LEADERBOARD */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "6px", marginBottom: "8px" }}>
              <LucideAward size={13} color="#f59e0b" />
              <h3 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Team Leaderboard</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {rankings.slice(0, 5).map((rank: any) => {
                let badgeColor = "#64748b";
                let badgeBg = "#f1f5f9";
                if (rank.rank === 1) { badgeColor = "#d97706"; badgeBg = "#fef3c7"; }
                else if (rank.rank === 2) { badgeColor = "#475569"; badgeBg = "#e2e8f0"; }
                else if (rank.rank === 3) { badgeColor = "#b45309"; badgeBg = "#ffedd5"; }

                return (
                  <div key={rank.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px", borderRadius: "6px", background: rank.rank === 1 ? "linear-gradient(135deg, #fffbeb 0%, #fff 100%)" : "transparent", border: rank.rank === 1 ? "1px solid #fde68a" : "none" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: badgeBg, color: badgeColor, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.65rem" }}>
                        {rank.rank === 1 ? <LucideStar size={8} fill="#d97706" /> : rank.rank}
                      </span>
                      <div>
                        <strong style={{ fontSize: "0.72rem", color: "#1e293b", display: "block" }}>{rank.name}</strong>
                        <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 600 }}>{rank.role}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#3b82f6" }}>{rank.productivityScore}%</span>
                      <span style={{ fontSize: "0.58rem", color: "#94a3b8", display: "block", fontWeight: 700 }}>{rank.candidatesAdded} candidates</span>
                    </div>
                  </div>
                );
              })}
              {rankings.length === 0 && (
                <div style={{ textAlign: "center", padding: "6px", color: "#94a3b8", fontSize: "0.7rem", fontStyle: "italic" }}>No ranking data generated.</div>
              )}
            </div>
          </div>

          {/* TEAM ATTENDANCE INSIGHTS */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "6px", marginBottom: "8px" }}>
              <LucideTrendingUp size={13} color="#10b981" />
              <h3 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Attendance Analytics</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
              <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Consistency</span>
                <strong style={{ fontSize: "0.78rem", color: "#1e293b", display: "block", marginTop: "1px" }}>{attendanceInsights.attendanceConsistency}</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Overtime Desks</span>
                <strong style={{ fontSize: "0.78rem", color: "#8b5cf6", display: "block", marginTop: "1px" }}>{attendanceInsights.teamOvertimeHours} Active</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Avg Login</span>
                <strong style={{ fontSize: "0.78rem", color: "#10b981", display: "block", marginTop: "1px" }}>{attendanceInsights.averageTeamLoginTiming}</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Avg Break</span>
                <strong style={{ fontSize: "0.78rem", color: "#d97706", display: "block", marginTop: "1px" }}>{attendanceInsights.averageBreakDuration}</strong>
              </div>
            </div>

            {/* Smart alert for inactive recruiters */}
            {recruiters.some((r: any) => r.status === "Idle" || r.status === "Lunch Break") && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "6px", borderRadius: "6px", display: "flex", gap: "4px", alignItems: "flex-start" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#d97706", marginTop: "2px" }} />
                <div>
                  <strong style={{ fontSize: "0.68rem", color: "#b45309", display: "block" }}>Smart Alert: Rest Intervals</strong>
                  <span style={{ fontSize: "0.62rem", color: "#d97706", fontWeight: 600 }}>Some recruiters are taking lunch/breaks.</span>
                </div>
              </div>
            )}
          </div>

          {/* ADVANCED PRODUCTIVITY METRICS */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "6px", marginBottom: "8px" }}>
              <LucideFlame size={13} color="#ef4444" />
              <h3 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Efficiency Champions</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>Most Active:</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 750, color: "#0f172a" }}>{productivityAnalytics.mostActiveRecruiter}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>Highest Conversion:</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 750, color: "#2563eb" }}>{productivityAnalytics.highestConversionRecruiter}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>Lowest Break Time:</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 750, color: "#10b981" }}>{productivityAnalytics.lowestBreakTime}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>Best Attendance:</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 750, color: "#f59e0b" }}>{productivityAnalytics.bestAttendance}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>Highest Joining:</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 750, color: "#8b5cf6" }}>{productivityAnalytics.highestJoiningRatio}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* DETAILED RECRUITER PROFILE MODAL */}
      {/* DETAILED RECRUITER PROFILE MODAL */}
      <AnimatePresence>
        {selectedRecruiter ? (
          <div className="modal-overlay flex-center" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 1000, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }} className="modal-card" style={{ width: "650px", maxWidth: "95%", background: "white", borderRadius: "16px", overflow: "hidden", position: "relative", boxShadow: "0 20px 40px -8px rgba(0,0,0,0.2)", border: "1px solid #e2e8f0" }}>

              {/* MODAL HEADER */}
              <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)", padding: "14px 20px", color: "white", position: "relative" }}>
                <button onClick={() => setSelectedRecruiter(null)} style={{ position: "absolute", top: "12px", right: "12px", color: "white", background: "rgba(255,255,255,0.15)", border: "none", width: "24px", height: "24px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideX size={14} /></button>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "white", color: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.1rem" }}>
                    {selectedRecruiter.name[0]}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>{selectedRecruiter.name}</h2>
                    <span style={{ fontSize: "0.72rem", opacity: 0.8, fontWeight: 700 }}>{selectedRecruiter.role} • {selectedRecruiter.email}</span>
                  </div>
                </div>

                {/* SUB HEADER CHIPS */}
                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  <span style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.12)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>Shift: {selectedRecruiter.assignedShift.name} ({selectedRecruiter.assignedShift.timings})</span>
                  <span style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.12)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>Lunch: {selectedRecruiter.assignedShift.lunchTimings}</span>
                </div>
              </div>

              {/* MODAL TABS NAVIGATION */}
              <div style={{ display: "flex", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <button onClick={() => setModalTab("performance")} className={`detail-tab-btn ${modalTab === "performance" ? "active" : ""}`} style={{ background: "none", border: "none", borderBottom: modalTab === "performance" ? "2px solid #3b82f6" : "none", fontSize: "0.72rem", padding: "6px 12px" }}>Performance</button>
                <button onClick={() => setModalTab("tasks")} className={`detail-tab-btn ${modalTab === "tasks" ? "active" : ""}`} style={{ background: "none", border: "none", borderBottom: modalTab === "tasks" ? "2px solid #3b82f6" : "none", fontSize: "0.72rem", padding: "6px 12px" }}>Assigned Tasks</button>
                <button onClick={() => setModalTab("attendance")} className={`detail-tab-btn ${modalTab === "attendance" ? "active" : ""}`} style={{ background: "none", border: "none", borderBottom: modalTab === "attendance" ? "2px solid #3b82f6" : "none", fontSize: "0.72rem", padding: "6px 12px" }}>Attendance Logs</button>
                <button onClick={() => setModalTab("activity")} className={`detail-tab-btn ${modalTab === "activity" ? "active" : ""}`} style={{ background: "none", border: "none", borderBottom: modalTab === "activity" ? "2px solid #3b82f6" : "none", fontSize: "0.72rem", padding: "6px 12px" }}>Sourcing Data</button>
                <button onClick={() => setModalTab("personal_info")} className={`detail-tab-btn ${modalTab === "personal_info" ? "active" : ""}`} style={{ background: "none", border: "none", borderBottom: modalTab === "personal_info" ? "2px solid #3b82f6" : "none", fontSize: "0.72rem", padding: "6px 12px" }}>Personal Information</button>
              </div>

              {/* MODAL BODY */}
              <div style={{ padding: "14px 20px", maxHeight: "350px", overflowY: "auto" }}>
                {loadingModalData ? (
                  <div className="flex-center" style={{ height: "150px", flexDirection: "column", gap: "8px" }}>
                    <LucideLoader2 className="animate-spin" color="#3b82f6" size={24} />
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Loading recruiter timeline...</span>
                  </div>
                ) : (
                  <>
                    {/* 1. PERFORMANCE TAB */}
                    {modalTab === "performance" && (
                      <div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "15px" }}>
                          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "8px", borderRadius: "10px", textAlign: "center" }}>
                            <span style={{ fontSize: "0.58rem", color: "#047857", fontWeight: 800, textTransform: "uppercase" }}>Added Today</span>
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#065f46", margin: "2px 0" }}>{selectedRecruiter.performanceSnapshot.candidatesAddedToday}</h3>
                            <span style={{ fontSize: "0.58rem", color: "#059669", fontWeight: 600 }}>Active sourcing</span>
                          </div>
                          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px", borderRadius: "10px", textAlign: "center" }}>
                            <span style={{ fontSize: "0.58rem", color: "#1d4ed8", fontWeight: 800, textTransform: "uppercase" }}>Interviews Set</span>
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e40af", margin: "2px 0" }}>{selectedRecruiter.performanceSnapshot.interviewsScheduledToday}</h3>
                            <span style={{ fontSize: "0.58rem", color: "#2563eb", fontWeight: 600 }}>Candidates pipeline</span>
                          </div>
                          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", padding: "8px", borderRadius: "10px", textAlign: "center" }}>
                            <span style={{ fontSize: "0.58rem", color: "#6d28d9", fontWeight: 800, textTransform: "uppercase" }}>Selections</span>
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#5b21b6", margin: "2px 0" }}>{selectedRecruiter.performanceSnapshot.selectedToday}</h3>
                            <span style={{ fontSize: "0.58rem", color: "#7c3aed", fontWeight: 600 }}>Hired / Onboarded</span>
                          </div>
                        </div>

                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px", background: "#f8fafc" }}>
                          <h4 style={{ margin: "0 0 8px", fontSize: "0.8rem", fontWeight: 800, color: "#0f172a" }}>Productivity Insights</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #e2e8f0" }}>
                              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Conversion Ratio:</span>
                              <strong style={{ fontSize: "0.72rem", color: "#0f172a" }}>
                                {selectedRecruiter.performanceSnapshot.candidatesAddedToday > 0
                                  ? Math.round((selectedRecruiter.performanceSnapshot.selectedToday / selectedRecruiter.performanceSnapshot.candidatesAddedToday) * 100)
                                  : 0}%
                              </strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #e2e8f0" }}>
                              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Total Sourced Leads:</span>
                              <strong style={{ fontSize: "0.72rem", color: "#0f172a" }}>{selectedRecruiter.performanceSnapshot.leadsAddedToday} Leads</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #e2e8f0" }}>
                              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Completed Targets:</span>
                              <strong style={{ fontSize: "0.72rem", color: "#0f172a" }}>{selectedRecruiter.performanceSnapshot.tasksCompletedToday} Mandates</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #e2e8f0" }}>
                              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Productivity Index:</span>
                              <strong style={{ fontSize: "0.72rem", color: "#10b981" }}>{selectedRecruiter.productivityScore}%</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. TASKS TAB */}
                    {modalTab === "tasks" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {recruiterTasks.map((task: any) => {
                          const percent = task.targetQuantity ? Math.min(100, Math.round((task.completedQuantity / task.targetQuantity) * 100)) : 0;
                          return (
                            <div key={task.id} style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "white" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                <div>
                                  <strong style={{ fontSize: "0.8rem", color: "#1e293b", display: "block" }}>{task.title}</strong>
                                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Priority: <strong style={{ color: "#ef4444" }}>{task.priority.toUpperCase()}</strong></span>
                                </div>
                                <span style={{ fontSize: "0.62rem", padding: "2px 6px", borderRadius: "4px", background: task.status === "completed" ? "#ecfdf5" : "#eff6ff", color: task.status === "completed" ? "#10b981" : "#3b82f6", fontWeight: 800 }}>
                                  {task.status.toUpperCase()}
                                </span>
                              </div>
                              {task.taskType === "target" && (
                                <div>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#64748b", marginBottom: "2px" }}>
                                    <span>Progress</span>
                                    <span>{task.completedQuantity} / {task.targetQuantity} ({percent}%)</span>
                                  </div>
                                  <div style={{ width: "100%", height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
                                    <div style={{ width: `${percent}%`, height: "100%", background: "#3b82f6" }} />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {recruiterTasks.length === 0 && (
                          <div style={{ textAlign: "center", padding: "20px 10px", color: "#94a3b8", fontSize: "0.75rem", fontStyle: "italic" }}>No mandates or tasks assigned to this recruiter today.</div>
                        )}
                      </div>
                    )}

                    {/* 3. ATTENDANCE TAB */}
                    {modalTab === "attendance" && (
                      <div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
                          <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "8px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "0.55rem", color: "#94a3b8", display: "block", fontWeight: 800 }}>TOTAL LOGINS</span>
                            <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>{selectedRecruiter.totalLoginSessions} Session(s)</strong>
                          </div>
                          <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "8px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "0.55rem", color: "#94a3b8", display: "block", fontWeight: 800 }}>PUNCH TIME</span>
                            <strong style={{ fontSize: "0.85rem", color: "#10b981" }}>{selectedRecruiter.loginTime}</strong>
                          </div>
                          <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "8px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "0.55rem", color: "#94a3b8", display: "block", fontWeight: 800 }}>LOGOUT TIME</span>
                            <strong style={{ fontSize: "0.85rem", color: "#64748b" }}>{selectedRecruiter.lastLogoutTime}</strong>
                          </div>
                        </div>

                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem", textAlign: "left" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                <th style={{ padding: "8px 12px" }}>Date</th>
                                <th style={{ padding: "8px 12px" }}>Status</th>
                                <th style={{ padding: "8px 12px" }}>Active Hours</th>
                                <th style={{ padding: "8px 12px" }}>Break Time</th>
                                <th style={{ padding: "8px 12px" }}>Overtime</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recruiterAttendance.slice(0, 10).map((att: any) => (
                                <tr key={att.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                  <td style={{ padding: "8px 12px", fontWeight: 700, color: "#1e293b" }}>{att.date}</td>
                                  <td style={{ padding: "8px 12px" }}>
                                    <span style={{ fontSize: "0.58rem", padding: "2px 6px", borderRadius: "3px", background: att.status === "present" ? "#ecfdf5" : "#fff1f2", color: att.status === "present" ? "#10b981" : "#f43f5e", fontWeight: 800 }}>
                                      {att.status.toUpperCase()}
                                    </span>
                                  </td>
                                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{att.totalWorkingHours} hrs</td>
                                  <td style={{ padding: "8px 12px" }}>{att.totalBreakTime} mins</td>
                                  <td style={{ padding: "8px 12px", color: att.totalOvertime > 0 ? "#8b5cf6" : "#64748b", fontWeight: 700 }}>{att.totalOvertime} mins</td>
                                </tr>
                              ))}
                              {recruiterAttendance.length === 0 && (
                                <tr>
                                  <td colSpan={5} style={{ padding: "15px", textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>No historic punch records discovered.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 4. ACTIVITY TAB */}
                    {modalTab === "activity" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem", textAlign: "left" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                <th style={{ padding: "8px 12px" }}>Candidate Name</th>
                                <th style={{ padding: "8px 12px" }}>Job Role</th>
                                <th style={{ padding: "8px 12px" }}>Sourcing Platform</th>
                                <th style={{ padding: "8px 12px" }}>Last Update</th>
                                <th style={{ padding: "8px 12px" }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recruiterCandidates.slice(0, 10).map((c: any) => (
                                <tr key={c.id || c._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                  <td style={{ padding: "8px 12px", fontWeight: 700, color: "#1e293b" }}>{c.name}</td>
                                  <td style={{ padding: "8px 12px", color: "#475569" }}>{c.jobRole || c.designation || "N/A"}</td>
                                  <td style={{ padding: "8px 12px", color: "#3b82f6", fontWeight: 600 }}>{c.sourcingBy || "CRM Upload"}</td>
                                  <td style={{ padding: "8px 12px", color: "#64748b" }}>{new Date(c.updatedAt || c.createdAt).toLocaleDateString()}</td>
                                  <td style={{ padding: "8px 12px" }}>
                                    <span style={{ fontSize: "0.58rem", padding: "2px 6px", borderRadius: "3px", background: c.status === "Hired" ? "#ecfdf5" : "#eff6ff", color: c.status === "Hired" ? "#10b981" : "#3b82f6", fontWeight: 900 }}>
                                      {c.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {recruiterCandidates.length === 0 && (
                                <tr>
                                  <td colSpan={5} style={{ padding: "15px", textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>No sourcing or CRM operations found.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {/* 5. PERSONAL INFORMATION TAB */}
                    {modalTab === "personal_info" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", background: "#f8fafc" }}>
                          <h4 style={{ margin: "0 0 10px", fontSize: "0.8rem", fontWeight: 800, color: "#0f172a" }}>Employee Profile Summary</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.75rem" }}>
                            <div>
                              <span style={{ display: "block", color: "#64748b", fontWeight: 600 }}>Company Email:</span>
                              <strong style={{ color: "#1e293b" }}>{selectedRecruiter.email}</strong>
                            </div>
                            <div>
                              <span style={{ display: "block", color: "#64748b", fontWeight: 600 }}>Recruiter Number:</span>
                              <strong style={{ color: "#1e293b" }}>{recruiterProfile?.profile?.recruiterNumber || "Not Provided"}</strong>
                            </div>
                            <div>
                              <span style={{ display: "block", color: "#64748b", fontWeight: 600 }}>Designation:</span>
                              <strong style={{ color: "#1e293b" }}>{recruiterProfile?.user?.designation || selectedRecruiter.role}</strong>
                            </div>
                            <div>
                              <span style={{ display: "block", color: "#64748b", fontWeight: 600 }}>Employee ID:</span>
                              <strong style={{ color: "#1e293b" }}>{recruiterProfile?.profile?.employeeId || "N/A"}</strong>
                            </div>
                            <div>
                              <span style={{ display: "block", color: "#64748b", fontWeight: 600 }}>Gender:</span>
                              <strong style={{ color: "#1e293b" }}>{recruiterProfile?.profile?.gender || "Male"}</strong>
                            </div>
                            <div>
                              <span style={{ display: "block", color: "#64748b", fontWeight: 600 }}>Joining Date:</span>
                              <strong style={{ color: "#1e293b" }}>{recruiterProfile?.profile?.joiningDate || "N/A"}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
                          <button
                            onClick={() => {
                              setSelectedRecruiter(null);
                              setShowViewProfileId(selectedRecruiter.id);
                            }}
                            className="btn-primary"
                            style={{
                              padding: "8px 16px",
                              borderRadius: "8px",
                              fontWeight: 800,
                              fontSize: "0.75rem",
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                          >
                            <LucideEye size={14} /> View Full Profile
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div style={{ background: "#f8fafc", padding: "10px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setSelectedRecruiter(null)} className="btn-primary" style={{ padding: "6px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "0.78rem" }}>Close Profile</button>
              </div>

            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* FULL PROFILE VIEW MODAL FOR TL */}
      <AnimatePresence>
        {showViewProfileId && (
          <div className="modal-overlay flex-center" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 100000, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: "white", borderRadius: "24px", width: "95%", maxWidth: "1100px", maxHeight: "90vh", overflowY: "auto", padding: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", boxSizing: "border-box" }}>
              <ProfileView role="tl" userId={showViewProfileId} onClose={() => {
                setShowViewProfileId(null);
                fetchMonitoringData();
              }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Advanced Manager-Level Ops Monitoring & TL Performance Commander Console
function ManagerTeamMonitoring() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Advanced Filter System
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterShift, setFilterShift] = useState("all");
  const [filterProductivity, setFilterProductivity] = useState("all");

  // TL Performance Comparison state
  const [compareMetric, setCompareMetric] = useState("productivityScore");
  const [compareTimeframe, setCompareTimeframe] = useState("today");

  // Leaderboard time ranges
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState("today");

  // TL Detailed Profile Modal state
  const [selectedTl, setSelectedTl] = useState<any>(null);
  const [modalTab, setModalTab] = useState<"recruiters" | "productivity" | "leaderboard" | "tasks" | "attendance" | "leads">("recruiters");
  const [recruiterSearch, setRecruiterSearch] = useState("");
  const [recruiterDetailsTimeframe, setRecruiterDetailsTimeframe] = useState("today");
  const [modalTasks, setModalTasks] = useState<any[]>([]);

  // Real-time ticking state for running work timers
  const [tickingSeconds, setTickingSeconds] = useState(0);

  // Dynamic Hover preview overlay state
  const [hoveredTlId, setHoveredTlId] = useState<number | null>(null);

  // 1. Live timers ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setTickingSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch and synchronise telemetry dashboard
  const fetchTelemetry = async () => {
    try {
      const res = await fetch("/api/manager/team-monitoring");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Manager live desking synchronization error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const syncInterval = setInterval(fetchTelemetry, 5000); // 5s fast polling for continuous live stats
    return () => clearInterval(syncInterval);
  }, []);

  // 3. Fetch specific tasks when TL profile is viewed
  useEffect(() => {
    if (!selectedTl) return;
    const fetchTlTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const allTasks = await res.json();
          // Filter tasks assigned to recruiters under this TL
          const recIds = selectedTl.recruiters.map((r: any) => r.id);
          setModalTasks(allTasks.filter((t: any) => recIds.includes(t.assigneeId)));
        }
      } catch (err) {
        console.error("Failed to load tasks for TL modal:", err);
      }
    };
    fetchTlTasks();
  }, [selectedTl]);

  if (loading && !data) {
    return (
      <div className="flex-center" style={{ height: "450px", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" color="#2563eb" size={45} />
        <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 700 }}>Initiating Managerial Telemetry Protocol...</span>
      </div>
    );
  }

  const kpi = data?.kpi || {
    totalTls: 0,
    totalRecruiters: 0,
    currentlyOnline: 0,
    currentlyWorking: 0,
    currentlyOnBreak: 0,
    totalWorkingToday: 0,
    totalBreakCountToday: 0,
    totalCandidatesAddedToday: 0,
    totalLeadsAddedToday: 0,
    totalJoinedToday: 0,
    totalSelectedToday: 0,
    activeTasksCount: 0,
    averageTeamProductivity: 0
  };

  const tlsList = data?.tlList || [];
  const rankings = data?.performanceRanking || [];
  const leadAnalytics = data?.leadDataAnalytics || {
    totalLeads: 0,
    topCategories: [],
    categoryCounts: {},
    recruiterContributions: []
  };
  const activityTrends = data?.activityTrends || [];

  // Filter TL List
  const filteredTls = tlsList.filter((tl: any) => {
    const matchesSearch = tl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tl.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tl.currentActivity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tl.recruiters.some((r: any) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesStatus = true;
    if (filterStatus === "online") matchesStatus = tl.status !== "Offline" || tl.recruiters.some((r: any) => r.status !== "Offline");
    else if (filterStatus === "offline") matchesStatus = tl.status === "Offline" && tl.recruiters.every((r: any) => r.status === "Offline");
    else if (filterStatus === "working") matchesStatus = tl.status === "Working" || tl.recruiters.some((r: any) => r.status === "Working");
    else if (filterStatus === "break") matchesStatus = tl.status.includes("Break") || tl.recruiters.some((r: any) => r.status.includes("Break"));

    let matchesShift = true;
    if (filterShift !== "all") {
      matchesShift = tl.assignedShift?.name?.toLowerCase().includes(filterShift.toLowerCase()) ||
        tl.recruiters.some((r: any) => r.assignedShift?.name?.toLowerCase().includes(filterShift.toLowerCase()));
    }

    let matchesProd = true;
    if (filterProductivity === "high") matchesProd = tl.productivityScore >= 70;
    else if (filterProductivity === "low") matchesProd = tl.productivityScore < 45;

    return matchesSearch && matchesStatus && matchesShift && matchesProd;
  });

  // Calculate live working hour ticks for timers
  const getLiveTickingTimer = (member: any) => {
    if (member.status === "Offline" || member.loginTime === "N/A" || !member.liveWorkingHours) {
      return member.liveWorkingHours || "00h 00m";
    }
    const match = member.liveWorkingHours.match(/(\d+)h\s+(\d+)m/);
    if (!match) return member.liveWorkingHours;
    let h = parseInt(match[1]);
    let m = parseInt(match[2]);

    const elapsedSecs = tickingSeconds % 60;
    const extraMins = Math.floor(tickingSeconds / 60) % 60;

    let finalM = m + extraMins;
    let finalH = h + Math.floor(finalM / 60);
    finalM = finalM % 60;

    return `${finalH.toString().padStart(2, '0')}h ${finalM.toString().padStart(2, '0')}m ${elapsedSecs.toString().padStart(2, '0')}s`;
  };

  // Status Configurations
  const getStatusColorClass = (status: string) => {
    if (status === "Working") return { dot: "#10b981", text: "#047857", bg: "#ecfdf5", border: "#a7f3d0" };
    if (status.includes("Break")) return { dot: "#f59e0b", text: "#b45309", bg: "#fffbeb", border: "#fde68a" };
    if (status === "Idle") return { dot: "#d97706", text: "#9a3412", bg: "#fff7ed", border: "#fed7aa" };
    if (status === "Overtime Active") return { dot: "#8b5cf6", text: "#6d28d9", bg: "#faf5ff", border: "#e9d5ff" };
    return { dot: "#ef4444", text: "#475569", bg: "#f1f5f9", border: "#e2e8f0" };
  };

  // Dynamic CSV generation for Excel exports
  const exportToExcel = () => {
    let csv = "TL Name,Designation,Email,Status,Team Size,Team Productivity %,Today Sourced,Today Selections,Today Joins,Today Leads\n";
    tlsList.forEach((tl: any) => {
      csv += `"${tl.name}","${tl.designation}","${tl.email}","${tl.status}",${tl.teamSize},${tl.productivityScore}%,${tl.performanceSnapshot.candidatesAddedToday},${tl.performanceSnapshot.selectedToday},${tl.performanceSnapshot.joinedToday},${tl.performanceSnapshot.leadsAddedToday}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FastRMS_Manager_Team_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  // Dynamic print dialog format for PDF
  const triggerPrintPDF = () => {
    window.print();
  };

  return (
    <div className="manager-team-ops-dashboard" style={{ padding: "0.4rem 0.6rem", fontFamily: "'Outfit', 'Inter', sans-serif", background: "#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        .glow-metric-card {
          background: white;
          border-radius: 8px;
          padding: 6px 10px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 2px 4px -1px rgba(0,0,0,0.01), 0 1px 2px -1px rgba(0,0,0,0.01);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .glow-metric-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px -5px rgba(37,99,235,0.06);
          border-color: #3b82f6;
        }
        .metallic-banner {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 10px;
          padding: 10px 16px;
          color: white;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 6px 20px -8px rgba(15,23,42,0.25);
          margin-bottom: 8px;
        }
        .tl-grid-card {
          background: white;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          padding: 10px 12px;
          position: relative;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.01);
        }
        .tl-grid-card:hover {
          border-color: #2563eb;
          box-shadow: 0 8px 20px -8px rgba(37,99,235,0.08);
          transform: translateY(-1px);
        }
        .comparative-bar {
          height: 10px;
          border-radius: 3px;
          background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
          transition: width 0.8s ease-in-out;
          position: relative;
        }
        .comparative-bar-bg {
          height: 10px;
          background: #f1f5f9;
          border-radius: 3px;
          overflow: hidden;
          flex: 1;
        }
        .leaderboard-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5px 8px;
          border-radius: 6px;
          border: 1px solid #f1f5f9;
          transition: all 0.15s;
        }
        .leaderboard-row.gold {
          background: linear-gradient(90deg, #fffbeb 0%, #ffffff 100%);
          border-color: #fde68a;
        }
        .leaderboard-row.silver {
          background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
          border-color: #cbd5e1;
        }
        .leaderboard-row.bronze {
          background: linear-gradient(90deg, #fff7ed 0%, #ffffff 100%);
          border-color: #ffedd5;
        }
        .live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
          animation: statusPulse 1.5s infinite;
        }
        @keyframes statusPulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
        @media print {
          body * { visibility: hidden; }
          .manager-team-ops-dashboard, .manager-team-ops-dashboard * { visibility: visible; }
          .manager-team-ops-dashboard { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* METALLIC COMMAND BANNER */}
      <div className="metallic-banner flex-between" style={{ alignItems: "center" }}>
        <div>
          <span style={{ fontSize: "0.55rem", fontWeight: 900, background: "#3b82f6", color: "white", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Manager Operations Command</span>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 850, color: "white", margin: "2px 0 1px", letterSpacing: "-0.3px" }}>Live Team Intelligence & Monitoring Center</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 500, margin: 0 }}>Scoping sector: reporting team leaders desking telemetry, performance ratios, and recruiter tracking.</p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={fetchTelemetry} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 9px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", fontWeight: 800, fontSize: "0.7rem" }}>
            <LucideRefreshCcw size={12} /> Ticking Sync
          </button>
          <button onClick={exportToExcel} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 9px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", fontWeight: 800, fontSize: "0.7rem" }}>
            <LucideDownload size={12} /> Excel Export
          </button>
          <button onClick={triggerPrintPDF} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 9px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", fontWeight: 800, fontSize: "0.7rem" }}>
            <LucideFileBarChart size={12} /> PDF Print
          </button>
        </div>
      </div>

      {/* 1. TEAM OVERVIEW DASHBOARD (10 KPI CARDS) */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "6px", marginBottom: "8px" }}>

        <div className="glow-metric-card" style={{ borderLeft: "3px solid #3b82f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#3b82f6", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Total Team Leaders</span>
            <LucideShieldCheck size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{kpi.totalTls} <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Leads</span></h2>
          <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>Direct command sector</span>
        </div>

        <div className="glow-metric-card" style={{ borderLeft: "3px solid #8b5cf6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b5cf6", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Total Recruiters</span>
            <LucideUsers2 size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{kpi.totalRecruiters} <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Desks</span></h2>
          <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>Execution nodes mapping</span>
        </div>

        <div className="glow-metric-card" style={{ borderLeft: "3px solid #06b6d4" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#06b6d4", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Active (Online)</span>
            <LucideMonitor size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{kpi.currentlyOnline} <span style={{ fontSize: "0.68rem", color: "#10b981", fontWeight: 700 }}>Online</span></h2>
          <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>Real-time socket checks</span>
        </div>

        <div className="glow-metric-card" style={{ borderLeft: "3px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Currently Working</span>
            <LucideZap size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#10b981", margin: 0 }}>{kpi.currentlyWorking} <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Active</span></h2>
          <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>Desks actively working</span>
        </div>

        <div className="glow-metric-card" style={{ borderLeft: "3px solid #f59e0b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#f59e0b", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Employees On Break</span>
            <LucideCoffee size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#f59e0b", margin: 0 }}>{kpi.currentlyOnBreak} <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Resting</span></h2>
          <span style={{ fontSize: "0.55rem", color: "#f59e0b", fontWeight: 700 }}>● {kpi.totalBreakCountToday} breaks</span>
        </div>

        <div className="glow-metric-card" style={{ borderLeft: "3px solid #ec4899" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#ec4899", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Registrations Sourced</span>
            <LucideUserPlus size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{kpi.totalCandidatesAddedToday} <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Profiles</span></h2>
          <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>CRM additions today</span>
        </div>

        <div className="glow-metric-card" style={{ borderLeft: "3px solid #eab308" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#eab308", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Leads Generated</span>
            <LucideTrendingUp size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#eab308", margin: 0 }}>{kpi.totalLeadsAddedToday} <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Leads</span></h2>
          <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>Today prospective calls</span>
        </div>

        <div className="glow-metric-card" style={{ borderLeft: "3px solid #14b8a6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#14b8a6", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Today Selected</span>
            <LucideAward size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#14b8a6", margin: 0 }}>{kpi.totalSelectedToday} <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Selected</span></h2>
          <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>Candidate selections</span>
        </div>

        <div className="glow-metric-card" style={{ borderLeft: "3px solid #a855f7" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#a855f7", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Today Joined</span>
            <LucideCheckCircle2 size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#a855f7", margin: 0 }}>{kpi.totalJoinedToday} <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Joined</span></h2>
          <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>Candidates onboarded</span>
        </div>

        <div className="glow-metric-card" style={{ borderLeft: "3px solid #ef4444" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#ef4444", marginBottom: "2px", alignItems: "center" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Active Mandate Tasks</span>
            <LucideActivity size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#ef4444", margin: 0 }}>{kpi.activeTasksCount} <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Tasks</span></h2>
          <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>Numeric targets in queue</span>
        </div>

      </div>

      {/* SEARCH AND FILTERS PANEL */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "6px", background: "white", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <input
            className="input-premium"
            placeholder="Search teams by TL name, emails, active recruiters, or operations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "26px", height: "28px", borderRadius: "6px", border: "1.5px solid #e2e8f0", fontSize: "0.75rem" }}
          />
          <LucideSearch size={12} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
        </div>

        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 900, color: "#64748b", textTransform: "uppercase" }}>Filters:</span>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="monitoring-filter-select" style={{ height: "26px", fontSize: "0.72rem", padding: "2px 4px" }}>
            <option value="all">Live Status: All</option>
            <option value="online">Team Online</option>
            <option value="offline">Team Offline</option>
            <option value="working">Desks Working</option>
            <option value="break">Desks On Break</option>
          </select>

          <select value={filterShift} onChange={e => setFilterShift(e.target.value)} className="monitoring-filter-select" style={{ height: "26px", fontSize: "0.72rem", padding: "2px 4px" }}>
            <option value="all">Shifts: All</option>
            <option value="day">Day Shifts</option>
            <option value="night">Night Shifts</option>
            <option value="general">General Timings</option>
          </select>

          <select value={filterProductivity} onChange={e => setFilterProductivity(e.target.value)} className="monitoring-filter-select" style={{ height: "26px", fontSize: "0.72rem", padding: "2px 4px" }}>
            <option value="all">Productivity: All</option>
            <option value="high">High (&gt;70%)</option>
            <option value="low">Low (&lt;45%)</option>
          </select>
        </div>
      </div>

      {/* CORE MANAGER GRID SYSTEM */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "8px", alignItems: "start" }}>

        {/* LEFT COLUMN: TLS LIST & PERFORMANCE SYSTEMS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

          {/* MAIN SECTION: TL TEAM LIST */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
            <div style={{ background: "#0f172a", color: "white", padding: "8px 12px", fontSize: "0.78rem", fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Reporting Team Leaders desking pulse</span>
              <span style={{ color: "#3b82f6", background: "rgba(59,130,246,0.2)", padding: "1px 5px", borderRadius: "4px", fontSize: "0.62rem", fontWeight: 900 }}>
                {filteredTls.length} Active Nodes
              </span>
            </div>

            <div style={{ padding: "8px", display: "grid", gridTemplateColumns: "1fr", gap: "6px", minHeight: "350px" }}>
              {filteredTls.map((tl: any) => {
                const statusCfg = getStatusColorClass(tl.status);
                const workingRecs = tl.recruiters.filter((r: any) => r.status === "Working").length;
                const onlineRecs = tl.recruiters.filter((r: any) => r.status !== "Offline").length;

                return (
                  <div key={tl.id} className="tl-grid-card" onMouseEnter={() => setHoveredTlId(tl.id)} onMouseLeave={() => setHoveredTlId(null)}>

                    {/* PRIMARY ROW: AVATAR, NAME, RANKS & LIVE STATUS */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>

                        {/* TL AVATAR */}
                        <div style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          background: tl.status === "Offline" ? "#f1f5f9" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                          color: tl.status === "Offline" ? "#64748b" : "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 900, fontSize: "0.85rem",
                          boxShadow: tl.status === "Offline" ? "none" : "0 2px 4px rgba(37,99,235,0.1)"
                        }}>
                          {tl.name[0]}
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>{tl.name}</h3>
                            <span style={{ fontSize: "0.58rem", background: tl.performanceRank === 1 ? "#fffbeb" : "#f1f5f9", color: tl.performanceRank === 1 ? "#d97706" : "#64748b", border: tl.performanceRank === 1 ? "1px solid #fde68a" : "1px solid #cbd5e1", padding: "0px 4px", borderRadius: "3px", fontWeight: 800 }}>
                              RANK #{tl.performanceRank}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700 }}>{tl.designation}</span>
                            <span style={{ color: "#cbd5e1" }}>•</span>
                            <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 500 }}>{tl.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* TL LIVE STATUS & PRODUCTIVITY BADGES */}
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <div style={{
                          background: statusCfg.bg,
                          color: statusCfg.text,
                          border: `1px solid ${statusCfg.border}`,
                          borderRadius: "4px",
                          padding: "2px 6px",
                          fontSize: "0.62rem",
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          gap: "3px"
                        }}>
                          <span className="live-dot" style={{ backgroundColor: statusCfg.dot, width: "4px", height: "4px" }} />
                          {statusCfg.text.includes("475569") ? "OFFLINE" : tl.status.toUpperCase()}
                        </div>

                        <div style={{ background: tl.productivityScore >= 70 ? "#ecfdf5" : (tl.productivityScore >= 45 ? "#eff6ff" : "#fff1f2"), color: tl.productivityScore >= 70 ? "#10b981" : (tl.productivityScore >= 45 ? "#3b82f6" : "#f43f5e"), border: "1px solid currentColor", borderRadius: "4px", padding: "2px 6px", fontSize: "0.62rem", fontWeight: 900 }}>
                          KPI {tl.productivityScore}%
                        </div>
                      </div>
                    </div>

                    {/* SECOND ROW: LIVE DESKING STATS & ACTIVE WORK TIMER */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "6px", background: "#f8fafc", padding: "6px 8px", borderRadius: "8px", border: "1px solid #f1f5f9", marginBottom: "6px" }}>

                      <div>
                        <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>TEAM DETAILS</span>
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1e293b", marginTop: "1px", display: "block" }}>
                          {tl.teamSize} Recs <span style={{ fontSize: "0.62rem", color: "#10b981", fontWeight: 700 }}>({workingRecs}w / {onlineRecs}o)</span>
                        </span>
                      </div>

                      <div>
                        <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>LIVE ACTIVITY</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "1px" }}>
                          <LucideActivity size={10} color={tl.status === "Offline" ? "#94a3b8" : "#3b82f6"} />
                          <span style={{ fontSize: "0.72rem", fontWeight: 750, color: tl.status === "Offline" ? "#64748b" : "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {tl.currentActivity}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>TL TODAY TIMER</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "1px" }}>
                          <LucideClock size={10} color="#10b981" />
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#10b981", fontVariantNumeric: "tabular-nums" }}>
                            {getLiveTickingTimer(tl)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>REST INTERVALS</span>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", marginTop: "1px", display: "block" }}>
                          Break: <strong style={{ color: "#e07a5f" }}>{tl.totalBreakTimeToday}</strong>
                        </span>
                      </div>

                    </div>

                    {/* THIRD ROW: AGGREGATED SOURCING SNAPSHOTS & VIEW DETAILED PROFILE */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>

                      {/* Metric Chips for team aggregated output */}
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        <span className="stat-chip-mini" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>SOURCED <strong style={{ color: "#1e293b" }}>{tl.performanceSnapshot.candidatesAddedToday}</strong></span>
                        <span className="stat-chip-mini" style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}>SELECTS <strong style={{ color: "#047857" }}>{tl.performanceSnapshot.selectedToday}</strong></span>
                        <span className="stat-chip-mini" style={{ background: "#faf5ff", borderColor: "#e9d5ff" }}>JOINED <strong style={{ color: "#6d28d9" }}>{tl.performanceSnapshot.joinedToday}</strong></span>
                        <span className="stat-chip-mini" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>LEADS <strong style={{ color: "#b45309" }}>{tl.performanceSnapshot.leadsAddedToday}</strong></span>
                      </div>

                      {/* View Profile Action */}
                      <button
                        onClick={() => { setSelectedTl(tl); setModalTab("recruiters"); }}
                        className="quick-action-btn"
                        style={{ display: "flex", alignItems: "center", gap: "3px", padding: "4px 8px", background: "#eff6ff", color: "#2563eb", borderColor: "#93c5fd", fontWeight: 800, fontSize: "0.68rem", borderRadius: "6px" }}
                      >
                        <LucideEye size={11} /> View Profile & Live Monitoring
                      </button>

                    </div>

                    {/* HOVER ANALYTICS PREVIEW OVERLAY */}
                    {hoveredTlId === tl.id && (
                      <div style={{
                        position: "absolute", right: "10px", top: "-30px",
                        background: "#1e293b", color: "white", padding: "4px 8px",
                        borderRadius: "6px", fontSize: "0.65rem", zIndex: 10,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        border: "1px solid rgba(255,255,255,0.1)"
                      }}>
                        💡 Selection rate: {tl.performanceSnapshot.candidatesAddedToday > 0 ? Math.round((tl.performanceSnapshot.selectedToday / tl.performanceSnapshot.candidatesAddedToday) * 100) : 0}%
                      </div>
                    )}

                  </div>
                );
              })}

              {filteredTls.length === 0 && (
                <div style={{ background: "#f8fafc", padding: "30px", textAlign: "center", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#64748b" }}>
                  <LucideShieldCheck size={28} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>No Reporting Team Leaders Found</h3>
                  <p style={{ fontSize: "0.72rem", margin: "1px 0 0" }}>Adjust filters to find active personnel.</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. TL PERFORMANCE COMPARISON SYSTEM */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "6px", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <LucideTrendingUp size={13} color="#3b82f6" />
                <h3 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>TL Performance Comparison Analytics</h3>
              </div>

              <div style={{ display: "flex", gap: "4px" }}>
                <select value={compareMetric} onChange={e => setCompareMetric(e.target.value)} className="monitoring-filter-select" style={{ fontSize: "0.7rem", height: "24px" }}>
                  <option value="productivityScore">KPI Productivity %</option>
                  <option value="candidatesAddedToday">Registered Candidates</option>
                  <option value="selectedToday">Selected Candidates</option>
                  <option value="joinedToday">Joined Candidates</option>
                  <option value="leadsAddedToday">Leads Generated</option>
                </select>

                <select value={compareTimeframe} onChange={e => setCompareTimeframe(e.target.value)} className="monitoring-filter-select" style={{ fontSize: "0.7rem", height: "24px" }}>
                  <option value="today">Today</option>
                  <option value="7days">7 Days</option>
                  <option value="1month">1 Month</option>
                  <option value="1year">1 Year</option>
                </select>
              </div>
            </div>

            {/* Custom Comparative Bars Grid using database data */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
              {tlsList.map((tl: any) => {
                let displayVal = 0;
                let suffix = "";
                if (compareMetric === "productivityScore") { displayVal = tl.productivityScore; suffix = "%"; }
                else if (compareMetric === "candidatesAddedToday") { displayVal = tl.performanceSnapshot.candidatesAddedToday; suffix = " cands"; }
                else if (compareMetric === "selectedToday") { displayVal = tl.performanceSnapshot.selectedToday; suffix = " locks"; }
                else if (compareMetric === "joinedToday") { displayVal = tl.performanceSnapshot.joinedToday; suffix = " joined"; }
                else if (compareMetric === "leadsAddedToday") { displayVal = tl.performanceSnapshot.leadsAddedToday; suffix = " leads"; }

                const maxLimit = compareMetric === "productivityScore" ? 100 : Math.max(...tlsList.map((x: any) => {
                  if (compareMetric === "candidatesAddedToday") return x.performanceSnapshot.candidatesAddedToday;
                  if (compareMetric === "selectedToday") return x.performanceSnapshot.selectedToday;
                  if (compareMetric === "joinedToday") return x.performanceSnapshot.joinedToday;
                  return x.performanceSnapshot.leadsAddedToday;
                }), 5);

                const widthPct = Math.min(100, Math.round((displayVal / maxLimit) * 100)) || 2;

                return (
                  <div key={tl.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "80px", fontSize: "0.7rem", fontWeight: 750, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tl.name}
                    </div>
                    <div className="comparative-bar-bg">
                      <div className="comparative-bar" style={{
                        width: `${widthPct}%`,
                        background: tl.performanceRank === 1
                          ? "linear-gradient(90deg, #d97706 0%, #fbbf24 100%)"
                          : "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)"
                      }} />
                    </div>
                    <div style={{ width: "55px", fontSize: "0.7rem", fontWeight: 900, color: "#1e293b", textAlign: "right" }}>
                      {displayVal}{suffix}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison Insights Footer */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", background: "#f8fafc", padding: "6px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.5rem", color: "#94a3b8", display: "block", fontWeight: 800 }}>BEST PERFORMER</span>
                <strong style={{ fontSize: "0.72rem", color: "#10b981", display: "block", marginTop: "1px" }}>{data?.bestPerformer ? `${data.bestPerformer.name} (${data.bestPerformer.productivity}%)` : "N/A"}</strong>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.5rem", color: "#94a3b8", display: "block", fontWeight: 800 }}>LOWEST PERFORMER</span>
                <strong style={{ fontSize: "0.72rem", color: "#ef4444", display: "block", marginTop: "1px" }}>{data?.lowestPerformer ? `${data.lowestPerformer.name} (${data.lowestPerformer.productivity}%)` : "N/A"}</strong>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.5rem", color: "#94a3b8", display: "block", fontWeight: 800 }}>MOST ACTIVE TL</span>
                <strong style={{ fontSize: "0.72rem", color: "#8b5cf6", display: "block", marginTop: "1px" }}>{data?.mostActiveTl ? `${data.mostActiveTl.name} (${data.mostActiveTl.workingHours})` : "N/A"}</strong>
              </div>
            </div>

          </div>

          {/* 7. ADVANCED ANALYTICS GRAPHS (DYNAMIC SVGS) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px" }}>

            {/* GRAPH 1: TEAM CANDIDATE ACTIVITY TREND */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
              <span style={{ fontSize: "0.5rem", fontWeight: 900, color: "#3b82f6", display: "block", textTransform: "uppercase" }}>Trend Analytics</span>
              <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", margin: "1px 0 6px" }}>Team Candidate Sourcing Trend</h4>

              <div style={{ height: "90px", width: "100%", position: "relative" }}>
                <svg viewBox="0 0 300 90" style={{ width: "100%", height: "100%" }}>
                  {/* Grid Lines */}
                  <line x1="20" y1="15" x2="280" y2="15" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="20" y1="45" x2="280" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="20" y1="75" x2="280" y2="75" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Render Registrations trendline */}
                  {activityTrends.length > 1 && (() => {
                    const maxRegs = Math.max(...activityTrends.map((t: any) => t.registrations), 5);
                    const points = activityTrends.map((t: any, idx: number) => {
                      const x = 20 + idx * (260 / 6);
                      const y = 75 - (t.registrations / maxRegs) * 55;
                      return `${x},${y}`;
                    }).join(" ");
                    return (
                      <>
                        <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} />
                        {activityTrends.map((t: any, idx: number) => {
                          const x = 20 + idx * (260 / 6);
                          const y = 75 - (t.registrations / maxRegs) * 55;
                          return (
                            <circle key={idx} cx={x} cy={y} r="2.5" fill="#3b82f6">
                              <title>{`Registrations: ${t.registrations}`}</title>
                            </circle>
                          );
                        })}
                      </>
                    );
                  })()}

                  {/* Render Selections trendline */}
                  {activityTrends.length > 1 && (() => {
                    const maxSels = Math.max(...activityTrends.map((t: any) => t.selections), 5);
                    const points = activityTrends.map((t: any, idx: number) => {
                      const x = 20 + idx * (260 / 6);
                      const y = 75 - (t.selections / maxSels) * 55;
                      return `${x},${y}`;
                    }).join(" ");
                    return (
                      <>
                        <polyline fill="none" stroke="#10b981" strokeWidth="2" points={points} />
                        {activityTrends.map((t: any, idx: number) => {
                          const x = 20 + idx * (260 / 6);
                          const y = 75 - (t.selections / maxSels) * 55;
                          return (
                            <circle key={idx} cx={x} cy={y} r="2.5" fill="#10b981">
                              <title>{`Selections: ${t.selections}`}</title>
                            </circle>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "8px", fontSize: "0.55rem", fontWeight: 700, marginTop: "4px" }}>
                <span style={{ color: "#3b82f6" }}>● Sourced (Blue)</span>
                <span style={{ color: "#10b981" }}>● Selected (Green)</span>
              </div>
            </div>

            {/* GRAPH 2: TL PRODUCTIVITY COMPARISON GRAPH */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
              <span style={{ fontSize: "0.5rem", fontWeight: 900, color: "#8b5cf6", display: "block", textTransform: "uppercase" }}>Leader Comparison</span>
              <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", margin: "1px 0 6px" }}>TL Productivity Comparison Score</h4>

              <div style={{ height: "90px", width: "100%" }}>
                <svg viewBox="0 0 300 90" style={{ width: "100%", height: "100%" }}>
                  {/* Vertical columns for each TL */}
                  {tlsList.slice(0, 5).map((tl: any, idx: number) => {
                    const colWidth = 28;
                    const colGap = 16;
                    const startX = 45 + idx * (colWidth + colGap);
                    const barHeight = (tl.productivityScore / 100) * 55;
                    const startY = 75 - barHeight;

                    return (
                      <g key={tl.name}>
                        <rect x={startX} y={startY} width={colWidth} height={barHeight} rx="3" fill="url(#barGradient)" />
                        <text x={startX + colWidth / 2} y={startY - 4} fill="#0f172a" fontSize="6" fontWeight="bold" textAnchor="middle">{tl.productivityScore}%</text>
                        <text x={startX + colWidth / 2} y="84" fill="#64748b" fontSize="5.5" fontWeight="bold" textAnchor="middle">{tl.name.split(' ')[0]}</text>
                      </g>
                    );
                  })}
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                  <line x1="20" y1="75" x2="280" y2="75" stroke="#cbd5e1" strokeWidth="1" />
                </svg>
              </div>
            </div>

            {/* GRAPH 3: TEAM WORKING HOURS VS OUTPUT */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
              <span style={{ fontSize: "0.5rem", fontWeight: 900, color: "#14b8a6", display: "block", textTransform: "uppercase" }}>Desking Efficiency</span>
              <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", margin: "1px 0 6px" }}>Live Work Hours vs Candidate Sourced</h4>

              <div style={{ height: "90px", width: "100%" }}>
                <svg viewBox="0 0 300 90" style={{ width: "100%", height: "100%" }}>
                  {/* Grid background */}
                  <circle cx="150" cy="45" r="35" fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />

                  {/* Plot scatter points from recruiters under the manager */}
                  {(() => {
                    const plotPoints: any[] = [];
                    tlsList.forEach((tl: any) => {
                      tl.recruiters.forEach((r: any) => {
                        plotPoints.push({
                          name: r.name,
                          xVal: r.liveWorkingMins || 0,
                          yVal: r.performanceSnapshot.candidatesAddedToday || 0
                        });
                      });
                    });

                    const maxX = Math.max(...plotPoints.map(p => p.xVal), 480);
                    const maxY = Math.max(...plotPoints.map(p => p.yVal), 10);

                    return plotPoints.map((pt, idx) => {
                      const cx = 30 + (pt.xVal / maxX) * 230;
                      const cy = 75 - (pt.yVal / maxY) * 55;

                      return (
                        <g key={idx}>
                          <circle cx={cx} cy={cy} r="3" fill="#06b6d4" stroke="white" strokeWidth="0.8" />
                          <text x={cx + 4} y={cy - 1} fill="#64748b" fontSize="4.5" fontWeight="bold">{pt.name.split(' ')[0]}</text>
                        </g>
                      );
                    });
                  })()}

                  {/* Axis line */}
                  <line x1="20" y1="75" x2="280" y2="75" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="20" y1="15" x2="20" y2="75" stroke="#cbd5e1" strokeWidth="1" />
                </svg>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: TEAM LEADERBOARDS & LIVE pulse */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

          {/* 6. TEAM LEADERBOARD SYSTEM */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "6px", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <LucideAward size={13} color="#f59e0b" />
                <h3 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Team Leaderboard</h3>
              </div>

              <select value={leaderboardTimeframe} onChange={e => setLeaderboardTimeframe(e.target.value)} className="monitoring-filter-select" style={{ fontSize: "0.68rem", height: "22px", padding: "0px 2px" }}>
                <option value="today">Today</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {rankings.map((rank: any) => {
                let badgeClass = "";
                let itemClass = "leaderboard-row";
                if (rank.rank === 1) { badgeClass = "🥇"; itemClass += " gold"; }
                else if (rank.rank === 2) { badgeClass = "🥈"; itemClass += " silver"; }
                else if (rank.rank === 3) { badgeClass = "🥉"; itemClass += " bronze"; }
                else { badgeClass = `#${rank.rank}`; }

                return (
                  <div key={rank.name} className={itemClass}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 900, width: "18px", textAlign: "center" }}>{badgeClass}</span>
                      <div>
                        <strong style={{ fontSize: "0.72rem", color: "#1e293b", display: "block" }}>{rank.name}</strong>
                        <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 700 }}>Recs: {rank.teamSize}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 900, color: "#2563eb" }}>{rank.productivityScore}%</span>
                      <span style={{ fontSize: "0.58rem", color: "#94a3b8", display: "block", fontWeight: 700 }}>Avg Score</span>
                    </div>
                  </div>
                );
              })}

              {rankings.length === 0 && (
                <div style={{ textAlign: "center", padding: "8px", color: "#94a3b8", fontSize: "0.7rem", fontStyle: "italic" }}>No ranking generated today.</div>
              )}
            </div>
          </div>

          {/* 5. LIVE “WHO IS IN?” MONITORING SECTION */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "6px", marginBottom: "6px" }}>
              <span className="live-dot" style={{ backgroundColor: "#10b981", width: "6px", height: "6px" }} />
              <h3 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Live monitoring pulse</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "350px", overflowY: "auto", paddingRight: "2px" }}>
              {tlsList.map((tl: any) => {
                const isOnline = tl.status !== "Offline";
                return (
                  <div key={tl.id}>
                    {/* TL Identity */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "4px 8px", borderRadius: "6px", marginBottom: "3px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1e293b" }}>⭐ {tl.name} <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 700 }}>(TL)</span></span>
                      <span style={{ fontSize: "0.58rem", background: isOnline ? "#ecfdf5" : "#f1f5f9", color: isOnline ? "#10b981" : "#64748b", padding: "0px 4px", borderRadius: "3px", fontWeight: 800 }}>
                        {isOnline ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>

                    {/* Recruiters reporting under this TL */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px", paddingLeft: "8px", marginBottom: "5px" }}>
                      {tl.recruiters.map((r: any) => {
                        const recCfg = getStatusColorClass(r.status);
                        return (
                          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 6px", background: "white", border: "1px solid #f1f5f9", borderRadius: "4px" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#334155" }}>{r.name}</span>
                              <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "90px" }}>{r.currentActivity}</span>
                            </div>

                            <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                              {r.breakStatus && (
                                <span style={{ fontSize: "0.55rem", color: "#b45309", background: "#fffbeb", padding: "0px 2px", borderRadius: "2px", fontWeight: 700 }}>
                                  {r.breakStatus}
                                </span>
                              )}
                              <span style={{ fontSize: "0.65rem", fontWeight: 800, color: recCfg.text }}>
                                {r.liveWorkingHours}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {tl.recruiters.length === 0 && (
                        <div style={{ fontSize: "0.6rem", color: "#94a3b8", fontStyle: "italic", padding: "2px" }}>No recruiters mapped.</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 4. TL VIEW PROFILE (DETAILED PROFILE MODAL) */}
      <AnimatePresence>
        {selectedTl && (
          <div className="modal-overlay flex-center" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 1000, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }} className="modal-card" style={{ width: "700px", maxWidth: "95%", background: "white", borderRadius: "12px", overflow: "hidden", position: "relative", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)", border: "1px solid #e2e8f0" }}>

              {/* MODAL HEADER */}
              <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", padding: "12px 18px", color: "white", position: "relative" }}>
                <button onClick={() => setSelectedTl(null)} style={{ position: "absolute", top: "12px", right: "12px", color: "white", background: "rgba(255,255,255,0.15)", border: "none", width: "24px", height: "24px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideX size={13} /></button>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "white", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.1rem" }}>
                    {selectedTl.name[0]}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>{selectedTl.name}</h2>
                    <span style={{ fontSize: "0.72rem", opacity: 0.8, fontWeight: 700 }}>{selectedTl.designation} • {selectedTl.email}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                  <span style={{ fontSize: "0.58rem", background: "rgba(255,255,255,0.12)", padding: "2px 6px", borderRadius: "3px", fontWeight: 700 }}>Activity: {selectedTl.currentActivity}</span>
                  <span style={{ fontSize: "0.58rem", background: "rgba(255,255,255,0.12)", padding: "2px 6px", borderRadius: "3px", fontWeight: 700 }}>Shift: {selectedTl.assignedShift?.name || "Shift"} ({selectedTl.assignedShift?.timings || "09:30-18:30"})</span>
                </div>
              </div>

              {/* MODAL TABS NAVIGATION */}
              <div style={{ display: "flex", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <button onClick={() => setModalTab("recruiters")} className={`detail-tab-btn ${modalTab === "recruiters" ? "active" : ""}`} style={{ background: "none", border: "none", fontSize: "0.72rem", padding: "8px 14px" }}>Live Team Status</button>
                <button onClick={() => setModalTab("productivity")} className={`detail-tab-btn ${modalTab === "productivity" ? "active" : ""}`} style={{ background: "none", border: "none", fontSize: "0.72rem", padding: "8px 14px" }}>Productivity</button>
                <button onClick={() => setModalTab("leaderboard")} className={`detail-tab-btn ${modalTab === "leaderboard" ? "active" : ""}`} style={{ background: "none", border: "none", fontSize: "0.72rem", padding: "8px 14px" }}>Leaderboard</button>
                <button onClick={() => setModalTab("tasks")} className={`detail-tab-btn ${modalTab === "tasks" ? "active" : ""}`} style={{ background: "none", border: "none", fontSize: "0.72rem", padding: "8px 14px" }}>Tasks</button>
                <button onClick={() => setModalTab("attendance")} className={`detail-tab-btn ${modalTab === "attendance" ? "active" : ""}`} style={{ background: "none", border: "none", fontSize: "0.72rem", padding: "8px 14px" }}>Attendance & Leads</button>
              </div>

              {/* MODAL BODY */}
              <div style={{ padding: "12px 18px", maxHeight: "300px", overflowY: "auto" }}>

                {/* A. LIVE TEAM STATUS TAB */}
                {modalTab === "recruiters" && (
                  <div>
                    <h3 style={{ margin: "0 0 8px", fontSize: "0.78rem", fontWeight: 800, color: "#1e293b" }}>Active Recruiters under {selectedTl.name}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {selectedTl.recruiters.map((r: any) => {
                        const rCfg = getStatusColorClass(r.status);
                        return (
                          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                            <div>
                              <strong style={{ fontSize: "0.75rem", color: "#1e293b", display: "block" }}>{r.name}</strong>
                              <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 600 }}>In: {r.loginTime} • Last: {r.currentActivity}</span>
                            </div>
                            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                              <span style={{ background: rCfg.bg, color: rCfg.text, padding: "1px 4px", borderRadius: "3px", fontSize: "0.58rem", fontWeight: 900 }}>
                                {r.status.toUpperCase()}
                              </span>
                              <strong style={{ fontSize: "0.75rem", color: "#10b981", fontVariantNumeric: "tabular-nums" }}>
                                {getLiveTickingTimer(r)}
                              </strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* B. TEAM PRODUCTIVITY ANALYTICS */}
                {modalTab === "productivity" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h3 style={{ margin: 0, fontSize: "0.78rem", fontWeight: 800, color: "#1e293b" }}>Productivity Analytics</h3>
                      <select value={recruiterDetailsTimeframe} onChange={e => setRecruiterDetailsTimeframe(e.target.value)} className="monitoring-filter-select" style={{ fontSize: "0.68rem", height: "22px", padding: "0px 2px" }}>
                        <option value="today">Today</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", marginBottom: "8px" }}>
                      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.5rem", color: "#1d4ed8", display: "block", fontWeight: 800 }}>SOURCED</span>
                        <strong style={{ fontSize: "0.95rem", color: "#1e40af" }}>{selectedTl.performanceSnapshot.candidatesAddedToday}</strong>
                      </div>
                      <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.5rem", color: "#047857", display: "block", fontWeight: 800 }}>SELECTED</span>
                        <strong style={{ fontSize: "0.95rem", color: "#065f46" }}>{selectedTl.performanceSnapshot.selectedToday}</strong>
                      </div>
                      <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.5rem", color: "#6d28d9", display: "block", fontWeight: 800 }}>JOINED</span>
                        <strong style={{ fontSize: "0.95rem", color: "#5b21b6" }}>{selectedTl.performanceSnapshot.joinedToday}</strong>
                      </div>
                      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.5rem", color: "#b45309", display: "block", fontWeight: 800 }}>LEADS</span>
                        <strong style={{ fontSize: "0.95rem", color: "#78350f" }}>{selectedTl.performanceSnapshot.leadsAddedToday}</strong>
                      </div>
                      <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.5rem", color: "#be123c", display: "block", fontWeight: 800 }}>COMPLETED</span>
                        <strong style={{ fontSize: "0.95rem", color: "#9f1239" }}>{selectedTl.performanceSnapshot.tasksCompletedToday}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* C. PERFORMANCE LEADERBOARD */}
                {modalTab === "leaderboard" && (
                  <div>
                    <h3 style={{ margin: "0 0 8px", fontSize: "0.78rem", fontWeight: 800, color: "#1e293b" }}>Recruiters Leaderboard</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {[...selectedTl.recruiters].sort((a: any, b: any) => b.productivityScore - a.productivityScore).map((rec: any, idx: number) => {
                        let badge = `#${idx + 1}`;
                        if (idx === 0) badge = "🥇";
                        else if (idx === 1) badge = "🥈";
                        else if (idx === 2) badge = "🥉";

                        return (
                          <div key={rec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 10px", border: "1px solid #f1f5f9", borderRadius: "6px", background: idx === 0 ? "#fffbeb" : "white" }}>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              <span style={{ fontSize: "0.8rem", fontWeight: 900, width: "16px" }}>{badge}</span>
                              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#334155" }}>{rec.name}</span>
                            </div>
                            <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#2563eb" }}>Productivity KPI: {rec.productivityScore}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* D. TASK TRACKING */}
                {modalTab === "tasks" && (
                  <div>
                    <h3 style={{ margin: "0 0 8px", fontSize: "0.78rem", fontWeight: 800, color: "#1e293b" }}>Task Assignments & Mandates</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {modalTasks.map((task: any) => {
                        const pct = task.targetQuantity > 0 ? Math.round((task.completedQuantity / task.targetQuantity) * 100) : 0;
                        return (
                          <div key={task.id} style={{ border: "1px solid #e2e8f0", padding: "8px", borderRadius: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                              <strong style={{ fontSize: "0.72rem", color: "#1e293b" }}>{task.title}</strong>
                              <span style={{ fontSize: "0.58rem", background: task.status === "completed" ? "#ecfdf5" : "#eff6ff", color: task.status === "completed" ? "#10b981" : "#3b82f6", padding: "1px 4px", borderRadius: "2px", fontWeight: 900 }}>
                                {task.status.toUpperCase()}
                              </span>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#64748b", marginBottom: "2px" }}>
                              <span>Progress: {task.completedQuantity} / {task.targetQuantity}</span>
                              <span>{pct}%</span>
                            </div>

                            <div style={{ width: "100%", height: "3px", background: "#f1f5f9", borderRadius: "1.5px", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: "#3b82f6" }} />
                            </div>
                          </div>
                        );
                      })}
                      {modalTasks.length === 0 && (
                        <div style={{ textAlign: "center", padding: "14px", color: "#94a3b8", fontSize: "0.7rem", fontStyle: "italic" }}>No tasks assigned.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* E. ATTENDANCE & LEADS ANALYTICS */}
                {modalTab === "attendance" && (
                  <div>
                    <h3 style={{ margin: "0 0 8px", fontSize: "0.78rem", fontWeight: 800, color: "#1e293b" }}>Lead Data Breakdown</h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ border: "1px solid #e2e8f0", padding: "8px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.5rem", fontWeight: 900, color: "#94a3b8", display: "block" }}>TOTAL TEAM LEADS</span>
                        <strong style={{ fontSize: "1.05rem", color: "#2563eb", marginTop: "1px", display: "block" }}>{selectedTl.performanceSnapshot.leadsAddedToday}</strong>
                      </div>
                      <div style={{ border: "1px solid #e2e8f0", padding: "8px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.5rem", fontWeight: 900, color: "#94a3b8", display: "block" }}>TOP SECTOR PROFILED</span>
                        <strong style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "2px", display: "block" }}>
                          {leadAnalytics.topCategories[0]?.category || "General"}
                        </strong>
                      </div>
                    </div>

                    <h3 style={{ margin: "0 0 4px", fontSize: "0.72rem", fontWeight: 800, color: "#1e293b" }}>Recruiter Contributions</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      {selectedTl.recruiters.map((r: any) => (
                        <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", padding: "3px 0", borderBottom: "1px solid #f1f5f9" }}>
                          <span>{r.name}:</span>
                          <strong>{r.performanceSnapshot.leadsAddedToday} leads</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* MODAL FOOTER */}
              <div style={{ background: "#f8fafc", padding: "10px 18px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setSelectedTl(null)} className="btn-primary" style={{ padding: "5px 12px", borderRadius: "6px", fontWeight: 800, fontSize: "0.72rem" }}>Close Profile</button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ----------------------------------------------------
// EXECUTIVE ENTERPRISE BOSS COMMAND CENTER COMPONENT
// ----------------------------------------------------
function BossTeamMonitoring() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Date Filters
  const [dateMode, setDateMode] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Advanced Filters
  const [managerFilter, setManagerFilter] = useState("all");
  const [tlFilter, setTlFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [perfFilter, setPerfFilter] = useState("all");

  // Profile Modal State
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [modalTab, setModalTab] = useState<"summary" | "attendance" | "recruitment" | "clients" | "jobs" | "sourcing" | "leads" | "tasks">("summary");

  // Leaderboard Metric & Tab State
  const [leaderboardTab, setLeaderboardTab] = useState<"manager" | "tl" | "recruiter">("recruiter");
  const [leaderboardMetric, setLeaderboardMetric] = useState<string>("registrations");

  // Team Comparison Center State
  const [compareRole, setCompareRole] = useState<"manager" | "tl" | "recruiter">("recruiter");
  const [compareLeft, setCompareLeft] = useState<string>("");
  const [compareRight, setCompareRight] = useState<string>("");

  // Expand / Collapse State for Hierarchy View
  const [expandedManagers, setExpandedManagers] = useState<Record<number, boolean>>({});
  const [expandedTls, setExpandedTls] = useState<Record<number, boolean>>({});

  // Real-time ticking state
  const [tickingSeconds, setTickingSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTickingSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBossTelemetry = async () => {
    try {
      let url = `/api/boss/team-monitoring?dateMode=${dateMode}`;
      if (dateMode === "custom" && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Exec Sync telemetry error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBossTelemetry();
    const interval = setInterval(fetchBossTelemetry, 5000);
    return () => clearInterval(interval);
  }, [dateMode, startDate, endDate]);

  if (loading && !data) {
    return (
      <div className="flex-center" style={{ height: "450px", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" color="#1e293b" size={45} />
        <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 700 }}>Synthesizing Company Hierarchy Pulse...</span>
      </div>
    );
  }

  const kpi = data?.kpi || {
    totalManagers: 0,
    totalTls: 0,
    totalRecruiters: 0,
    totalEmployees: 0,
    currentlyOnline: 0,
    currentlyWorking: 0,
    currentlyOnBreak: 0,
    currentlyOffline: 0,
    todayRegistrations: 0,
    todayLeads: 0,
    todayInterviews: 0,
    todayJoinings: 0,
    activeTasks: 0,
    pendingTasks: 0,
    completedTasksToday: 0
  };

  const userList = data?.userList || [];
  const tree = data?.tree || [];
  const activityFeed = data?.activityFeed || [];
  const sourcingBreakdown = data?.sourcingBreakdown || [];
  const topPerformers = data?.topPerformers || { bestRecruiter: null, bestTl: null, bestManager: null };
  const needAttention = data?.needAttention || [];
  const trends = data?.trends || [];

  const rankedRecruiters = [...userList].filter((u: any) => u.role === "recruiter").sort((a: any, b: any) => (b.performance?.productivityScore ?? 0) - (a.performance?.productivityScore ?? 0));
  const rankedTls = [...userList].filter((u: any) => u.role === "tl").sort((a: any, b: any) => (b.performance?.productivityScore ?? 0) - (a.performance?.productivityScore ?? 0));
  const rankedManagers = [...userList].filter((u: any) => u.role === "manager").sort((a: any, b: any) => (b.performance?.productivityScore ?? 0) - (a.performance?.productivityScore ?? 0));

  // Filter Employees based on Advanced Filters
  const filteredEmployees = userList.filter((emp: any) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesManager = true;
    if (managerFilter !== "all") {
      matchesManager = emp.reportingManager === managerFilter || emp.id === Number(managerFilter);
    }

    let matchesTl = true;
    if (tlFilter !== "all") {
      matchesTl = emp.reportingTl === tlFilter || emp.id === Number(tlFilter);
    }

    let matchesRole = true;
    if (roleFilter !== "all") {
      matchesRole = emp.role === roleFilter;
    }

    let matchesShift = true;
    if (shiftFilter !== "all") {
      matchesShift = emp.shiftName.toLowerCase().includes(shiftFilter.toLowerCase());
    }

    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "online") matchesStatus = emp.status !== "Offline";
      else if (statusFilter === "offline") matchesStatus = emp.status === "Offline";
      else if (statusFilter === "working") matchesStatus = emp.status === "Working" || emp.status === "Idle";
      else if (statusFilter === "break") matchesStatus = emp.status === "Break";
    }

    let matchesPerf = true;
    if (perfFilter !== "all") {
      if (perfFilter === "high") matchesPerf = (emp.performance?.productivityScore ?? 0) >= 70;
      else if (perfFilter === "low") matchesPerf = (emp.performance?.productivityScore ?? 0) < 40;
    }

    return matchesSearch && matchesManager && matchesTl && matchesRole && matchesShift && matchesStatus && matchesPerf;
  });

  // Unique lists for filters
  const filterManagers = userList.filter((u: any) => u.role === "manager");
  const filterTls = userList.filter((u: any) => u.role === "tl");

  // Get status color configs
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Working":
        return { bg: "rgba(16, 185, 129, 0.12)", text: "#10b981", border: "rgba(16, 185, 129, 0.3)" };
      case "Break":
      case "On Break":
        return { bg: "rgba(245, 158, 11, 0.12)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" };
      case "Idle":
        return { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444", border: "rgba(239, 68, 68, 0.3)" };
      default:
        return { bg: "rgba(100, 116, 139, 0.12)", text: "#64748b", border: "rgba(100, 116, 139, 0.3)" };
    }
  };

  // Live ticking timer logic for live status cards
  const getLiveTimerStr = (emp: any) => {
    if (emp.status === "Offline" || emp.checkInTime === "N/A") {
      return emp.workingHoursToday;
    }
    const match = emp.workingHoursToday.match(/(\d+)h\s+(\d+)m/);
    if (!match) return emp.workingHoursToday;
    let h = parseInt(match[1]);
    let m = parseInt(match[2]);
    const elapsedMins = Math.floor(tickingSeconds / 60) % 60;
    const elapsedSecs = tickingSeconds % 60;

    let finalM = m + elapsedMins;
    let finalH = h + Math.floor(finalM / 60);
    finalM = finalM % 60;

    return `${finalH.toString().padStart(2, '0')}h ${finalM.toString().padStart(2, '0')}m ${elapsedSecs.toString().padStart(2, '0')}s`;
  };

  // Exporters
  const convertToCSV = (objArray: any[]) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    const headers = Object.keys(array[0]);
    str += headers.join(',') + '\r\n';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in array[i]) {
        if (line !== '') line += ',';
        let val = array[i][index];
        if (typeof val === 'object') {
          val = JSON.stringify(val).replace(/,/g, ';');
        }
        line += `"${String(val).replace(/"/g, '""')}"`;
      }
      str += line + '\r\n';
    }
    return str;
  };

  const triggerDownload = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExport = (type: "team" | "attendance" | "candidates" | "leads" | "tasks" | "performance") => {
    let exportData: any[] = [];
    let filename = `FastRMS_Boss_${type}_Export.csv`;

    if (type === "team") {
      exportData = filteredEmployees.map((e: any) => ({
        ID: e.id, Name: e.name, Email: e.email, Role: e.role, Shift: e.shiftName,
        Timings: e.shiftTiming, Status: e.status, CheckIn: e.checkInTime, WorkingHours: e.workingHoursToday,
        ReportingManager: e.reportingManager, ReportingTL: e.reportingTl
      }));
    } else if (type === "attendance") {
      exportData = filteredEmployees.map((e: any) => ({
        Name: e.name, Role: e.role, Date: new Date().toLocaleDateString(), CheckIn: e.checkInTime,
        CheckOut: e.lastLogoutTime, WorkingHours: e.workingHoursToday, Breaks: e.breakCount, BreakDuration: e.totalBreakTime,
        AttendanceScore: e.attendanceScore
      }));
    } else if (type === "performance") {
      exportData = filteredEmployees.map((e: any) => ({
        Name: e.name, Role: e.role, ProductivityScore: e.performance.productivityScore,
        Registrations: e.performance.registrations, Leads: e.performance.leads, Selections: e.performance.selections, Joinings: e.performance.joinings
      }));
    } else {
      // General fallbacks for candidates/leads/tasks
      exportData = filteredEmployees.map((e: any) => ({
        Employee: e.name, Role: e.role,
        Registrations: e.performance.registrations, Leads: e.performance.leads,
        Selections: e.performance.selections, Joinings: e.performance.joinings,
        AssignedTasks: e.tasks.assignedTasks, CompletedTasks: e.tasks.completedTasks
      }));
    }

    if (exportData.length === 0) {
      alert("No active data to export with the current filters.");
      return;
    }

    const csv = convertToCSV(exportData);
    triggerDownload(csv, filename);
  };

  // Compare telemetry targets
  const getComparisonTarget = (idStr: string) => {
    if (!idStr) return null;
    return userList.find((u: any) => u.id === Number(idStr));
  };

  const compLeftEmp = getComparisonTarget(compareLeft);
  const compRightEmp = getComparisonTarget(compareRight);

  return (
    <div className="boss-team-ops-dashboard" style={{ padding: "0.5rem 0.75rem", fontFamily: "'Outfit', 'Inter', sans-serif", background: "#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .glass-card-premium {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
          box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.03);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .glass-card-premium:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 8px 20px 0 rgba(15, 23, 42, 0.06);
          border-color: #cbd5e1;
        }
        .metallic-grad-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          border: 1px solid #334155;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.1);
        }
        .tree-row {
          display: flex;
          align-items: center;
          padding: 5px 10px;
          margin-bottom: 4px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: white;
          transition: all 0.15s ease;
        }
        .tree-row:hover {
          border-color: #3b82f6;
          background: #f0f7ff;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.03);
        }
        .live-glowing-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: currentColor;
          box-shadow: 0 0 6px currentColor;
          display: inline-block;
          animation: statusPulsing 1.5s infinite ease-in-out;
        }
        @keyframes statusPulsing {
          0%, 100% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .custom-slider-bar {
          height: 5px;
          background: #f1f5f9;
          border-radius: 10px;
          overflow: hidden;
        }
        .custom-slider-fill {
          height: 100%;
          border-radius: 10px;
          background: linear-gradient(90deg, #3b82f6, #6366f1);
        }
        .monitoring-filter-select {
          height: 28px;
          padding: 0 8px;
          font-size: 0.7rem;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background-color: #ffffff;
          color: #334155;
          outline: none;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .monitoring-filter-select:hover {
          border-color: #cbd5e1;
          background-color: #f8fafc;
        }
        .monitoring-filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.08);
        }
        .scrollbar-premium::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .scrollbar-premium::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-premium::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .scrollbar-premium::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .registry-row-enhanced {
          transition: all 0.15s ease;
        }
        .registry-row-enhanced:hover {
          background-color: #f8fafc !important;
          transform: translateX(1px);
        }
        .attention-card-enhanced {
          background: #fff5f5;
          border: 1px solid #fed7d7;
          padding: 5px 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .attention-card-enhanced:hover {
          border-color: #fca5a5;
          background: #fff1f1;
        }
        .activity-card-enhanced {
          display: flex;
          gap: 6px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 4px 0;
          transition: all 0.15s ease;
        }
        .activity-card-enhanced:hover {
          background: rgba(255,255,255,0.02);
        }
        .split-bar-container {
          height: 4px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          margin-top: 2px;
        }
      `}</style>

      {/* DASHBOARD COMMAND HEADER */}
      <div className="flex-between" style={{ alignItems: "center", marginBottom: "0.5rem", background: "white", padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <div>
          <span style={{ fontSize: "0.55rem", fontWeight: 900, background: "#1e293b", color: "#f8fafc", padding: "1px 4px", borderRadius: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Corporate Oversight Command</span>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: "1px 0 0", letterSpacing: "-0.3px" }}>Executive Organization Command Node</h1>
          <p style={{ color: "#64748b", fontSize: "0.68rem", fontWeight: 500, margin: 0 }}>Real-time hierarchy tracking, organizational efficiency matrices, and performance telemetry.</p>
        </div>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {/* Quick Date Toggle */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: "2px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            {["today", "yesterday", "weekly", "monthly", "custom"].map((m) => (
              <button
                key={m}
                onClick={() => setDateMode(m)}
                style={{
                  padding: "3px 6px", fontSize: "0.65rem", fontWeight: 800, borderRadius: "4px", border: "none", cursor: "pointer",
                  background: dateMode === m ? "white" : "transparent",
                  color: dateMode === m ? "#0f172a" : "#64748b",
                  boxShadow: dateMode === m ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {dateMode === "custom" && (
            <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: "3px", fontSize: "0.65rem", border: "1px solid #e2e8f0", borderRadius: "4px" }} />
              <span style={{ fontSize: "0.6rem", color: "#64748b" }}>to</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: "3px", fontSize: "0.65rem", border: "1px solid #e2e8f0", borderRadius: "4px" }} />
            </div>
          )}

          <button onClick={fetchBossTelemetry} className="row-btn" style={{ padding: "4px", borderRadius: "6px", width: "22px", height: "22px" }} title="Sync Telemetry">
            <LucideRefreshCcw size={11} />
          </button>
        </div>
      </div>

      {/* TOP SUMMARY OVERVIEW CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.4rem", marginBottom: "0.5rem" }}>

        <div className="glass-card-premium" style={{ borderLeft: "3px solid #3b82f6" }}>
          <div className="flex-between" style={{ color: "#3b82f6", marginBottom: "2px" }}>
            <span style={{ fontSize: "0.52rem", fontWeight: 900, color: "#94a3b8" }}>TOTAL MANAGERS</span>
            <LucideShieldCheck size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{kpi.totalManagers}</h2>
          <span style={{ fontSize: "0.52rem", color: "#64748b", fontWeight: 600 }}>Active Sectors</span>
        </div>

        <div className="glass-card-premium" style={{ borderLeft: "3px solid #6366f1" }}>
          <div className="flex-between" style={{ color: "#6366f1", marginBottom: "2px" }}>
            <span style={{ fontSize: "0.52rem", fontWeight: 900, color: "#94a3b8" }}>TOTAL TLS</span>
            <LucideUsers2 size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{kpi.totalTls}</h2>
          <span style={{ fontSize: "0.52rem", color: "#64748b", fontWeight: 600 }}>Operations Control</span>
        </div>

        <div className="glass-card-premium" style={{ borderLeft: "3px solid #8b5cf6" }}>
          <div className="flex-between" style={{ color: "#8b5cf6", marginBottom: "2px" }}>
            <span style={{ fontSize: "0.52rem", fontWeight: 900, color: "#94a3b8" }}>TOTAL RECRUITERS</span>
            <LucideFlame size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{kpi.totalRecruiters}</h2>
          <span style={{ fontSize: "0.52rem", color: "#64748b", fontWeight: 600 }}>Sourcing Footprint</span>
        </div>

        <div className="glass-card-premium" style={{ borderLeft: "3px solid #ec4899", background: "linear-gradient(135deg, #fff 70%, #fdf2f8 100%)" }}>
          <div className="flex-between" style={{ color: "#ec4899", marginBottom: "2px" }}>
            <span style={{ fontSize: "0.52rem", fontWeight: 900, color: "#94a3b8" }}>TOTAL EMPLOYEES</span>
            <LucideStar size={12} fill="#ec4899" />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{kpi.totalEmployees}</h2>
          <span style={{ fontSize: "0.52rem", color: "#ec4899", fontWeight: 700 }}>Org strength</span>
        </div>

        <div className="glass-card-premium" style={{ borderLeft: "3px solid #10b981" }}>
          <div className="flex-between" style={{ color: "#10b981", marginBottom: "2px" }}>
            <span style={{ fontSize: "0.52rem", fontWeight: 900, color: "#94a3b8" }}>LIVE ON DESK</span>
            <span className="live-glowing-dot" style={{ color: "#10b981" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{kpi.currentlyOnline}</h2>
            <span style={{ fontSize: "0.58rem", color: "#10b981", fontWeight: 800 }}>({kpi.currentlyWorking}W/{kpi.currentlyOnBreak}B)</span>
          </div>
          <span style={{ fontSize: "0.52rem", color: "#64748b", fontWeight: 600 }}>Connected CRM nodes</span>
        </div>

        <div className="glass-card-premium" style={{ borderLeft: "3px solid #ef4444" }}>
          <div className="flex-between" style={{ color: "#ef4444", marginBottom: "2px" }}>
            <span style={{ fontSize: "0.52rem", fontWeight: 900, color: "#94a3b8" }}>OFFLINE CODES</span>
            <LucideMonitor size={12} />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{kpi.currentlyOffline}</h2>
          <span style={{ fontSize: "0.52rem", color: "#64748b", fontWeight: 600 }}>Unconnected nodes</span>
        </div>

        <div className="glass-card-premium" style={{ borderLeft: "3px solid #06b6d4" }}>
          <div className="flex-between" style={{ color: "#06b6d4", marginBottom: "2px" }}>
            <span style={{ fontSize: "0.52rem", fontWeight: 900, color: "#94a3b8" }}>TODAY PIPELINE</span>
            <LucideTrendingUp size={12} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong style={{ fontSize: "0.75rem", color: "#1e293b" }}>{kpi.todayRegistrations} Sourced</strong>
            <span style={{ fontSize: "0.55rem", color: "#06b6d4", fontWeight: 800 }}>⚡ {kpi.todayLeads} Leads</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ borderLeft: "3px solid #84cc16" }}>
          <div className="flex-between" style={{ color: "#84cc16", marginBottom: "2px" }}>
            <span style={{ fontSize: "0.52rem", fontWeight: 900, color: "#94a3b8" }}>CONVERSIONS</span>
            <LucideCheckCircle2 size={12} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong style={{ fontSize: "0.75rem", color: "#1e293b" }}>{kpi.todayJoinings} Onboarded</strong>
            <span style={{ fontSize: "0.55rem", color: "#84cc16", fontWeight: 800 }}>✓ {kpi.todayInterviews} Interviews</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ borderLeft: "3px solid #f43f5e" }}>
          <div className="flex-between" style={{ color: "#f43f5e", marginBottom: "2px" }}>
            <span style={{ fontSize: "0.52rem", fontWeight: 900, color: "#94a3b8" }}>TASK VELOCITY</span>
            <LucideClipboardList size={12} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong style={{ fontSize: "0.75rem", color: "#1e293b" }}>{kpi.completedTasksToday} Done Today</strong>
            <span style={{ fontSize: "0.55rem", color: "#f43f5e", fontWeight: 800 }}>🛈 {kpi.activeTasks} Active / {kpi.pendingTasks} Pending</span>
          </div>
        </div>

      </div>

      {/* ADVANCED MULTI-FILTER PANEL */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "5px", background: "white", padding: "6px 8px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "0.5rem", alignItems: "center" }}>

        <div style={{ position: "relative" }}>
          <input
            className="input-premium"
            placeholder="Search team..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "24px", height: "26px", borderRadius: "6px", fontSize: "0.7rem", border: "1px solid #e2e8f0" }}
          />
          <LucideSearch size={11} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
        </div>

        <select value={managerFilter} onChange={e => setManagerFilter(e.target.value)} className="monitoring-filter-select">
          <option value="all">Supervisor: All</option>
          {filterManagers.map((m: any) => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>

        <select value={tlFilter} onChange={e => setTlFilter(e.target.value)} className="monitoring-filter-select">
          <option value="all">Team Lead: All</option>
          {filterTls.map((t: any) => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>

        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="monitoring-filter-select">
          <option value="all">Role: All</option>
          <option value="manager">Manager</option>
          <option value="tl">Team Lead</option>
          <option value="recruiter">Recruiter</option>
        </select>

        <select value={shiftFilter} onChange={e => setShiftFilter(e.target.value)} className="monitoring-filter-select">
          <option value="all">Shift: All</option>
          <option value="day">Day Shift</option>
          <option value="night">Night Shift</option>
          <option value="general">General Shift</option>
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="monitoring-filter-select">
          <option value="all">Status: All</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="working">Working</option>
          <option value="break">On Break</option>
        </select>

        <select value={perfFilter} onChange={e => setPerfFilter(e.target.value)} className="monitoring-filter-select">
          <option value="all">Productivity: All</option>
          <option value="high">Top Performers (&gt;=70%)</option>
          <option value="low">Needs Attention (&lt;40%)</option>
        </select>

        <div style={{ display: "flex", gap: "3px", justifyContent: "flex-end" }}>
          <button onClick={() => { setSearchQuery(""); setManagerFilter("all"); setTlFilter("all"); setRoleFilter("all"); setShiftFilter("all"); setStatusFilter("all"); setPerfFilter("all"); }} className="quick-action-btn" style={{ fontSize: "0.65rem", padding: "3px 6px" }}>Reset</button>
        </div>

      </div>

      {/* CORE BOARD LAYOUT SYSTEM */}
      <div style={{ display: "grid", gridTemplateColumns: "1.9fr 1.1fr", gap: "0.6rem", alignItems: "start" }}>

        {/* LEFT COLUMN: HIERARCHY TREE VIEW & FLAT DATA LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>

          {/* ORGANIZATIONAL HIERARCHY MAP */}
          <div style={{ background: "white", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div className="flex-between" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", marginBottom: "6px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <LucideShieldCheck size={14} color="#1e293b" />
                <h3 style={{ fontSize: "0.78rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Hierarchical Operations Map</h3>
              </div>
              <span style={{ fontSize: "0.55rem", background: "#f1f5f9", color: "#64748b", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>Interactive Flow</span>
            </div>

            {/* Boss Root Node */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div className="metallic-grad-header" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "6px", fontWeight: 900, fontSize: "0.75rem" }}>
                <LucideStar size={12} fill="white" />
                <span>EXECUTIVE HQ (THE BOSS)</span>
                <span style={{ marginLeft: "auto", fontSize: "0.6rem", padding: "1px 4px", borderRadius: "3px", background: "rgba(255,255,255,0.15)" }}>ROOT CONTROL</span>
              </div>

              {/* Managers Sub-layer */}
              <div style={{ paddingLeft: "12px", borderLeft: "1.5px dashed #cbd5e1", marginTop: "3px", display: "flex", flexDirection: "column", gap: "3px" }}>
                {tree.map((manager: any) => {
                  const isManagerExpanded = expandedManagers[manager.id] ?? true;
                  const stat = getStatusBadge(manager.status);

                  return (
                    <div key={manager.id} style={{ display: "flex", flexDirection: "column" }}>
                      <div className="tree-row" style={{ background: "#f8fafc", padding: "4px 8px" }}>
                        <button
                          onClick={() => setExpandedManagers(prev => ({ ...prev, [manager.id]: !isManagerExpanded }))}
                          style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, marginRight: "4px" }}
                        >
                          {isManagerExpanded ? <LucideChevronUp size={14} /> : <LucideChevronDown size={14} />}
                        </button>
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#1e293b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", fontWeight: 800, marginRight: "6px" }}>
                          {manager.name[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1e293b" }}>{manager.name}</span>
                          <span style={{ fontSize: "0.58rem", color: "#64748b", marginLeft: "4px" }}>({manager.designation})</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ background: stat.bg, color: stat.text, border: `1px solid ${stat.border}`, fontSize: "0.55rem", fontWeight: 900, padding: "1px 4px", borderRadius: "3px" }}>{manager.status.toUpperCase()}</span>
                          <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#2563eb" }}>KPI: {manager.performance?.productivityScore ?? 0}%</span>
                          <button onClick={() => { setSelectedProfile(manager); setModalTab("summary"); }} className="quick-action-btn" style={{ padding: "2px 4px", fontSize: "0.58rem" }}><LucideEye size={10} /> Profile</button>
                        </div>
                      </div>

                      {/* TLs Layer under Manager */}
                      {isManagerExpanded && (
                        <div style={{ paddingLeft: "14px", borderLeft: "1.5px dashed #cbd5e1", marginLeft: "8px", display: "flex", flexDirection: "column", gap: "3px" }}>
                          {manager.tls.map((tl: any) => {
                            const isTlExpanded = expandedTls[tl.id] ?? false;
                            const tlStat = getStatusBadge(tl.status);

                            return (
                              <div key={tl.id} style={{ display: "flex", flexDirection: "column" }}>
                                <div className="tree-row" style={{ background: "#fff", padding: "4px 8px" }}>
                                  <button
                                    onClick={() => setExpandedTls(prev => ({ ...prev, [tl.id]: !isTlExpanded }))}
                                    style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, marginRight: "4px" }}
                                  >
                                    {isTlExpanded ? <LucideChevronUp size={12} /> : <LucideChevronDown size={12} />}
                                  </button>
                                  <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#475569", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: 800, marginRight: "6px" }}>
                                    {tl.name[0]}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#334155" }}>{tl.name}</span>
                                    <span style={{ fontSize: "0.55rem", color: "#94a3b8", marginLeft: "4px" }}>({tl.recruiters.length} Recruiters)</span>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <span style={{ background: tlStat.bg, color: tlStat.text, border: `1px solid ${tlStat.border}`, fontSize: "0.55rem", fontWeight: 800, padding: "1px 3px", borderRadius: "3px" }}>{tl.status.toUpperCase()}</span>
                                    <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#10b981" }}>KPI: {tl.performance?.productivityScore ?? 0}%</span>
                                    <button onClick={() => { setSelectedProfile(tl); setModalTab("summary"); }} className="quick-action-btn" style={{ padding: "1px 4px", fontSize: "0.55rem" }}><LucideEye size={9} /> Profile</button>
                                  </div>
                                </div>

                                {/* Recruiters Layer under TL */}
                                {isTlExpanded && (
                                  <div style={{ paddingLeft: "16px", borderLeft: "1.5px dashed #94a3b8", marginLeft: "8px", display: "flex", flexDirection: "column", gap: "2px" }}>
                                    {tl.recruiters.map((recruiter: any) => {
                                      const recStat = getStatusBadge(recruiter.status);

                                      return (
                                        <div key={recruiter.id} className="tree-row" style={{ padding: "4px 8px", background: "#fafafa" }}>
                                          <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#64748b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontWeight: 800, marginRight: "6px" }}>
                                            {recruiter.name[0]}
                                          </div>
                                          <div style={{ flex: 1 }}>
                                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#475569" }}>{recruiter.name}</span>
                                            <span style={{ fontSize: "0.55rem", color: "#94a3b8", marginLeft: "4px" }}>({recruiter.role})</span>
                                          </div>

                                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 600 }}>T: {getLiveTimerStr(recruiter)}</span>
                                            <span style={{ background: recStat.bg, color: recStat.text, border: `1px solid ${recStat.border}`, fontSize: "0.52rem", fontWeight: 800, padding: "1px 3px", borderRadius: "3px" }}>{recruiter.status.toUpperCase()}</span>
                                            <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#8b5cf6" }}>KPI: {recruiter.performance?.productivityScore ?? 0}%</span>
                                            <button onClick={() => { setSelectedProfile(recruiter); setModalTab("summary"); }} className="quick-action-btn" style={{ padding: "1px 3px", fontSize: "0.52rem" }}><LucideEye size={8} /> Profile</button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FLAT TELEMETRY GRID OF EMPLOYEES */}
          <div style={{ background: "white", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div className="flex-between" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", marginBottom: "6px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <LucideUsers2 size={14} color="#1e293b" />
                <h3 style={{ fontSize: "0.78rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Operational Employee Registry</h3>
              </div>

              {/* EXPORTS ACCORDION BUTTONS */}
              <div style={{ display: "flex", gap: "3px" }}>
                <button onClick={() => handleExport("team")} className="quick-action-btn" style={{ fontSize: "0.58rem", padding: "2px 4px", display: "flex", alignItems: "center", gap: "2px" }}><LucideDownload size={10} /> Team</button>
                <button onClick={() => handleExport("attendance")} className="quick-action-btn" style={{ fontSize: "0.58rem", padding: "2px 4px", display: "flex", alignItems: "center", gap: "2px" }}><LucideDownload size={10} /> Attendance</button>
                <button onClick={() => handleExport("performance")} className="quick-action-btn" style={{ fontSize: "0.58rem", padding: "2px 4px", display: "flex", alignItems: "center", gap: "2px" }}><LucideDownload size={10} /> Performance</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1fr 1fr 1fr 1fr", borderBottom: "1px solid #e2e8f0", paddingBottom: "3px", marginBottom: "4px", fontSize: "0.58rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>
              <div>Employee Name</div>
              <div>Role</div>
              <div>Live Status</div>
              <div>Check-in</div>
              <div>Productivity Score</div>
              <div style={{ textAlign: "right" }}>Oversight</div>
            </div>

            <div className="scrollbar-premium" style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "250px", overflowY: "auto" }}>
              {filteredEmployees.map((emp: any) => {
                const badge = getStatusBadge(emp.status);
                return (
                  <div key={emp.id} className="registry-row-enhanced" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1fr 1fr 1fr 1fr", alignItems: "center", padding: "4px 4px", borderBottom: "1px solid #f1f5f9", fontSize: "0.68rem", borderRadius: "4px" }}>
                    <div>
                      <strong style={{ color: "#1e293b", display: "block" }}>{emp.name}</strong>
                      <span style={{ fontSize: "0.55rem", color: "#64748b" }}>{emp.email}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.55rem", background: "#f1f5f9", color: "#64748b", padding: "1px 4px", borderRadius: "3px", fontWeight: 900 }}>{emp.role.toUpperCase()}</span>
                    </div>
                    <div>
                      <span style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, fontSize: "0.55rem", padding: "1px 4px", borderRadius: "3px", fontWeight: 900 }}>{emp.status.toUpperCase()}</span>
                    </div>
                    <div>
                      <span style={{ color: "#475569", fontWeight: 600 }}>{emp.checkInTime}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, color: (emp.performance?.productivityScore ?? 0) >= 70 ? "#10b981" : ((emp.performance?.productivityScore ?? 0) >= 40 ? "#3b82f6" : "#f43f5e") }}>{emp.performance?.productivityScore ?? 0}%</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <button onClick={() => { setSelectedProfile(emp); setModalTab("summary"); }} className="quick-action-btn" style={{ fontSize: "0.58rem", padding: "2px 4px" }}><LucideEye size={10} /> Profile</button>
                    </div>
                  </div>
                );
              })}
              {filteredEmployees.length === 0 && (
                <div style={{ textAlign: "center", padding: "15px", color: "#64748b", fontSize: "0.68rem" }}>No operational records found.</div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LEADERBOARDS, COMPARISON CENTER, FEED */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>

          {/* TEAM COMPARISON COMMAND */}
          <div style={{ background: "white", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", marginBottom: "6px" }}>
              <LucideActivity size={13} color="#6366f1" />
              <h3 style={{ fontSize: "0.78rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Executive Comparison Hub</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginBottom: "4px" }}>
              <select value={compareRole} onChange={e => { setCompareRole(e.target.value as any); setCompareLeft(""); setCompareRight(""); }} className="monitoring-filter-select" style={{ fontSize: "0.65rem", height: "24px" }}>
                <option value="recruiter">Recruiter vs Recruiter</option>
                <option value="tl">TL vs TL</option>
                <option value="manager">Manager vs Manager</option>
              </select>
              <span style={{ fontSize: "0.58rem", color: "#94a3b8", alignSelf: "center", textAlign: "right", fontWeight: 800 }}>AUTHORIZE VS</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginBottom: "6px" }}>
              <select value={compareLeft} onChange={e => setCompareLeft(e.target.value)} className="monitoring-filter-select" style={{ fontSize: "0.65rem", height: "24px" }}>
                <option value="">Select Employee A</option>
                {userList.filter((u: any) => u.role === compareRole).map((e: any) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <select value={compareRight} onChange={e => setCompareRight(e.target.value)} className="monitoring-filter-select" style={{ fontSize: "0.65rem", height: "24px" }}>
                <option value="">Select Employee B</option>
                {userList.filter((u: any) => u.role === compareRole && u.id !== Number(compareLeft)).map((e: any) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            {compLeftEmp && compRightEmp ? (
              <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                {/* Metric comparisons */}
                {[
                  { label: "Productivity %", left: compLeftEmp.performance?.productivityScore ?? 0, right: compRightEmp.performance?.productivityScore ?? 0, suffix: "%" },
                  { label: "Registrations", left: compLeftEmp.performance?.registrations ?? 0, right: compRightEmp.performance?.registrations ?? 0 },
                  { label: "Selections", left: compLeftEmp.performance?.selections ?? 0, right: compRightEmp.performance?.selections ?? 0 },
                  { label: "Joinings", left: compLeftEmp.performance?.joinings ?? 0, right: compRightEmp.performance?.joinings ?? 0 },
                  { label: "Task Done", left: compLeftEmp.tasks?.completedTasks ?? 0, right: compRightEmp.tasks?.completedTasks ?? 0 },
                  { label: "Attendance Score", left: compLeftEmp.attendanceScore ?? 0, right: compRightEmp.attendanceScore ?? 0 }
                ].map((item, i) => {
                  const sum = (Number(item.left) || 0) + (Number(item.right) || 0) || 1;
                  const leftPct = Math.round(((Number(item.left) || 0) / sum) * 100);
                  return (
                    <div key={i} style={{ marginBottom: "4px" }}>
                      <div className="flex-between" style={{ fontSize: "0.62rem", fontWeight: 700, color: "#475569" }}>
                        <span style={{ color: "#3b82f6" }}>{item.left}{item.suffix}</span>
                        <span>{item.label}</span>
                        <span style={{ color: "#6366f1" }}>{item.right}{item.suffix}</span>
                      </div>
                      <div className="split-bar-container">
                        <div style={{ width: `${leftPct}%`, background: "#3b82f6", height: "100%" }} />
                        <div style={{ flex: 1, background: "#6366f1", height: "100%" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "15px", color: "#94a3b8", fontSize: "0.68rem", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                Select two operational assets to map live vector metrics.
              </div>
            )}
          </div>

          {/* PERFORMANCE LEADERBOARDS */}
          <div style={{ background: "white", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <LucideAward size={13} color="#f59e0b" />
                <h3 style={{ fontSize: "0.78rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Executive Leaderboards</h3>
              </div>
              <div style={{ display: "flex", gap: "2px" }}>
                {["recruiter", "tl", "manager"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setLeaderboardTab(t as any)}
                    style={{
                      padding: "2px 4px", fontSize: "0.55rem", fontWeight: 800, borderRadius: "4px", border: "none", cursor: "pointer",
                      background: leaderboardTab === t ? "#1e293b" : "transparent",
                      color: leaderboardTab === t ? "white" : "#64748b"
                    }}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px", marginBottom: "5px" }}>
              {[
                { id: "registrations", label: "Registrations" },
                { id: "selections", label: "Selections" },
                { id: "joinings", label: "Joinings" },
                { id: "productivity", label: "KPI" }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setLeaderboardMetric(m.id)}
                  style={{
                    padding: "2px 0", fontSize: "0.52rem", fontWeight: 700, borderRadius: "3px", border: "none", cursor: "pointer",
                    background: leaderboardMetric === m.id ? "#eff6ff" : "#f8fafc",
                    color: leaderboardMetric === m.id ? "#2563eb" : "#64748b"
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {(leaderboardTab === "recruiter" ? rankedRecruiters : leaderboardTab === "tl" ? rankedTls : rankedManagers).slice(0, 5).map((rank: any, idx: number) => {
                let badgeColor = "#64748b";
                let badgeBg = "#f1f5f9";
                if (idx === 0) { badgeColor = "#d97706"; badgeBg = "#fef3c7"; }
                else if (idx === 1) { badgeColor = "#475569"; badgeBg = "#e2e8f0"; }
                else if (idx === 2) { badgeColor = "#b45309"; badgeBg = "#ffedd5"; }

                let valToShow = "";
                if (leaderboardMetric === "registrations") valToShow = `${rank.performance?.registrations ?? 0} Sourced`;
                else if (leaderboardMetric === "selections") valToShow = `${rank.performance?.selections ?? 0} Selected`;
                else if (leaderboardMetric === "joinings") valToShow = `${rank.performance?.joinings ?? 0} Joined`;
                else valToShow = `${rank.performance?.productivityScore ?? 0}% KPI`;

                return (
                  <div key={rank.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 4px", borderRadius: "4px", background: idx === 0 ? "linear-gradient(135deg, #fffbeb 0%, #fff 100%)" : "transparent" }}>
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: badgeBg, color: badgeColor, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.58rem" }}>
                        {idx + 1}
                      </span>
                      <div>
                        <strong style={{ fontSize: "0.68rem", color: "#1e293b" }}>{rank.name}</strong>
                        <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>{rank.shiftName}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.65rem", fontWeight: 900, color: "#2563eb" }}>{valToShow}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NEED ATTENTION ALERT PANEL */}
          <div style={{ background: "white", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", marginBottom: "6px" }}>
              <LucideInfo size={13} color="#ef4444" />
              <h3 style={{ fontSize: "0.78rem", fontWeight: 900, color: "#ef4444", margin: 0 }}>Smart Attention Sector</h3>
            </div>

            <div className="scrollbar-premium" style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "130px", overflowY: "auto" }}>
              {needAttention.slice(0, 5).map((item: any) => (
                <div key={item.id} className="attention-card-enhanced">
                  <div className="flex-between" style={{ marginBottom: "1px" }}>
                    <strong style={{ fontSize: "0.65rem", color: "#991b1b" }}>{item.name} ({item.role})</strong>
                    <span style={{ fontSize: "0.55rem", color: "#ef4444", fontWeight: 800 }}>Rank #{item.rank}</span>
                  </div>
                  {item.issues.map((issue: string, idx: number) => (
                    <div key={idx} style={{ fontSize: "0.58rem", color: "#c53030", display: "flex", gap: "3px", alignItems: "center" }}>
                      <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#ef4444" }} />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              ))}
              {needAttention.length === 0 && (
                <div style={{ textAlign: "center", padding: "8px", color: "#10b981", fontSize: "0.65rem", fontWeight: 700 }}>
                  ✓ System Stable: All organizational nodes meet desking metrics!
                </div>
              )}
            </div>
          </div>

          {/* LIVE COMPANY ACTIVITY FEED */}
          <div style={{ background: "#0f172a", color: "white", padding: "8px 10px", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "4px", marginBottom: "6px" }}>
              <LucideActivity size={13} color="#10b981" />
              <h3 style={{ fontSize: "0.78rem", fontWeight: 900, margin: 0 }}>Company-wide Activity Feed</h3>
              <span className="live-glowing-dot" style={{ color: "#10b981", marginLeft: "auto" }} />
            </div>

            <div className="scrollbar-premium" style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "180px", overflowY: "auto", paddingRight: "2px" }}>
              {activityFeed.map((act: any) => {
                let glowColor = "#94a3b8";
                if (act.type.includes("join")) glowColor = "#84cc16";
                else if (act.type.includes("select")) glowColor = "#2563eb";
                else if (act.type.includes("lead")) glowColor = "#06b6d4";
                else if (act.type.includes("login")) glowColor = "#10b981";

                return (
                  <div key={act.id} className="activity-card-enhanced">
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: glowColor, marginTop: "5px", flexShrink: 0, boxShadow: `0 0 6px ${glowColor}` }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "0.62rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.25 }}>{act.message}</p>
                      <span style={{ fontSize: "0.48rem", color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
              {activityFeed.length === 0 && (
                <div style={{ textAlign: "center", padding: "10px", color: "rgba(255,255,255,0.4)", fontSize: "0.65rem" }}>Listening for corporate signals...</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* FULL CUSTOM PROFILE MODAL: EMPLOYEE COMMAND CENTER */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="modal-overlay flex-center" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 1000, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="modal-card" style={{ width: "700px", maxWidth: "95%", background: "white", borderRadius: "10px", overflow: "hidden", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0" }}>

              {/* Profile Header */}
              <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "10px 16px", color: "white", position: "relative" }}>
                <button onClick={() => setSelectedProfile(null)} style={{ position: "absolute", top: "10px", right: "10px", color: "white", background: "rgba(255,255,255,0.15)", border: "none", width: "20px", height: "20px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideX size={12} /></button>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "white", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1rem" }}>
                    {selectedProfile.name[0]}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>{selectedProfile.name}</h2>
                    <span style={{ fontSize: "0.68rem", opacity: 0.8, fontWeight: 700 }}>{selectedProfile.role.toUpperCase()} • {selectedProfile.email}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "5px", marginTop: "6px" }}>
                  <span style={{ fontSize: "0.58rem", background: "rgba(255,255,255,0.12)", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>Shift: {selectedProfile.shiftName} ({selectedProfile.shiftTiming})</span>
                  <span style={{ fontSize: "0.58rem", background: "rgba(255,255,255,0.12)", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>Joined: {selectedProfile.joiningDate}</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: "flex", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {[
                  { id: "summary", label: "Summary" },
                  { id: "attendance", label: "Attendance & Logs" },
                  { id: "recruitment", label: "Pipeline Analytics" },
                  { id: "clients", label: "Client Performance" },
                  { id: "jobs", label: "Job Analysis" },
                  { id: "sourcing", label: "Sourcing Channels" },
                  { id: "tasks", label: "Task Analytics" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setModalTab(t.id as any)}
                    className={`detail-tab-btn ${modalTab === t.id ? "active" : ""}`}
                    style={{ background: "none", border: "none", fontSize: "0.68rem", padding: "6px 10px", borderBottom: modalTab === t.id ? "2px solid #2563eb" : "none" }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Modal Content Window */}
              <div className="scrollbar-premium" style={{ padding: "12px 16px", maxHeight: "300px", overflowY: "auto" }}>

                {modalTab === "summary" && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
                      <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.55rem", color: "#047857", fontWeight: 800, textTransform: "uppercase" }}>ATTENDANCE SCORE</span>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#065f46", margin: "1px 0" }}>{selectedProfile.attendanceScore}%</h3>
                        <span style={{ fontSize: "0.55rem", color: "#059669", fontWeight: 600 }}>Active check-in vector</span>
                      </div>
                      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.55rem", color: "#1d4ed8", fontWeight: 800, textTransform: "uppercase" }}>PRODUCTIVITY SCORE</span>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#1e40af", margin: "1px 0" }}>{selectedProfile.performance?.productivityScore ?? 0}%</h3>
                        <span style={{ fontSize: "0.55rem", color: "#2563eb", fontWeight: 600 }}>Rank #{selectedProfile.performanceRank}</span>
                      </div>
                      <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.55rem", color: "#6d28d9", fontWeight: 800, textTransform: "uppercase" }}>TASK VELOCITY</span>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#5b21b6", margin: "1px 0" }}>{selectedProfile.tasks?.completionPercent ?? 0}%</h3>
                        <span style={{ fontSize: "0.55rem", color: "#7c3aed", fontWeight: 600 }}>{selectedProfile.tasks?.completedTasks ?? 0} of {selectedProfile.tasks?.assignedTasks ?? 0}</span>
                      </div>
                    </div>

                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px" }}>
                      <h4 style={{ margin: "0 0 4px", fontSize: "0.72rem", fontWeight: 800, color: "#0f172a" }}>Reporting Command Chain</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.68rem" }}>
                        <div><strong>Reporting Manager:</strong> <span style={{ color: "#475569" }}>{selectedProfile.reportingManager}</span></div>
                        <div><strong>Reporting TL:</strong> <span style={{ color: "#475569" }}>{selectedProfile.reportingTl}</span></div>
                        <div><strong>Shift Allocation:</strong> <span style={{ color: "#475569" }}>{selectedProfile.shiftName}</span></div>
                        <div><strong>Today Work hours:</strong> <span style={{ color: "#10b981", fontWeight: 800 }}>{selectedProfile.workingHoursToday}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "attendance" && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "5px", marginBottom: "10px" }}>
                      <div style={{ background: "#f8fafc", padding: "5px", borderRadius: "5px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.48rem", color: "#94a3b8", fontWeight: 800 }}>CHECK-IN TIME</span>
                        <strong style={{ fontSize: "0.68rem", color: "#1e293b", display: "block" }}>{selectedProfile.checkInTime}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "5px", borderRadius: "5px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.48rem", color: "#94a3b8", fontWeight: 800 }}>LAST CHECKOUT</span>
                        <strong style={{ fontSize: "0.68rem", color: "#1e293b", display: "block" }}>{selectedProfile.lastLogoutTime}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "5px", borderRadius: "5px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.48rem", color: "#94a3b8", fontWeight: 800 }}>BREAKS TODAY</span>
                        <strong style={{ fontSize: "0.68rem", color: "#eab308", display: "block" }}>{selectedProfile.breakCount} ({selectedProfile.totalBreakTime})</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "5px", borderRadius: "5px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.48rem", color: "#94a3b8", fontWeight: 800 }}>CHECKOUT SPIKES</span>
                        <strong style={{ fontSize: "0.68rem", color: "#ef4444", display: "block" }}>{selectedProfile.logoutCountToday}</strong>
                      </div>
                    </div>

                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ padding: "5px 8px", background: "#f8fafc", fontSize: "0.58rem", fontWeight: 800, color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>LIVE SESSION VECTOR INSIGHTS</div>
                      <div style={{ padding: "8px", fontSize: "0.68rem", color: "#475569" }}>
                        Active desking telemetry registers this user session as **{selectedProfile.status}**. Total net working duration for today equates to **{selectedProfile.workingHoursToday}**.
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "recruitment" && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "10px" }}>
                      {[
                        { label: "Sourced Candidates", count: selectedProfile.performance?.registrations ?? 0, bg: "#eff6ff", color: "#2563eb" },
                        { label: "Selections achieved", count: selectedProfile.performance?.selections ?? 0, bg: "#ecfdf5", color: "#10b981" },
                        { label: "Candidates Joined", count: selectedProfile.performance?.joinings ?? 0, bg: "#faf5ff", color: "#8b5cf6" },
                        { label: "Leads generated", count: selectedProfile.performance?.leads ?? 0, bg: "#fffbeb", color: "#f59e0b" }
                      ].map((item, i) => (
                        <div key={i} style={{ background: item.bg, padding: "6px", borderRadius: "6px", textAlign: "center" }}>
                          <span style={{ fontSize: "0.52rem", color: "#94a3b8", fontWeight: 800, display: "block" }}>{item.label.toUpperCase()}</span>
                          <strong style={{ fontSize: "1rem", color: item.color, display: "block", marginTop: "1px" }}>{item.count}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "5px 10px", background: "#f8fafc", fontSize: "0.58rem", fontWeight: 800, color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>
                        <div>PIPELINE STATE</div>
                        <div style={{ textAlign: "right" }}>VOLUME</div>
                      </div>
                      {[
                        { label: "Connected calls", count: selectedProfile.performance?.connected ?? 0 },
                        { label: "Not Connected calls", count: selectedProfile.performance?.notConnected ?? 0 },
                        { label: "Interested pool", count: selectedProfile.performance?.interested ?? 0 },
                        { label: "Not Interested pool", count: selectedProfile.performance?.notInterested ?? 0 },
                        { label: "Scheduled Interviews", count: selectedProfile.performance?.interview ?? 0 },
                        { label: "Rejected pool", count: selectedProfile.performance?.rejected ?? 0 },
                        { label: "Process To Joining", count: selectedProfile.performance?.processToJoining ?? 0 },
                        { label: "Dropped pipeline", count: selectedProfile.performance?.dropped ?? 0 }
                      ].map((sub, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "5px 10px", fontSize: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
                          <div>{sub.label}</div>
                          <div style={{ textAlign: "right", fontWeight: 700, color: "#1e293b" }}>{sub.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {modalTab === "clients" && (
                  <div>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr", padding: "5px 10px", background: "#f8fafc", fontSize: "0.58rem", fontWeight: 800, color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>
                        <div>CLIENT PARTNERSHIP</div>
                        <div>SOURCED</div>
                        <div>INTERESTED</div>
                        <div>INTERVIEWS</div>
                        <div>SELECTED</div>
                        <div style={{ textAlign: "right" }}>JOININGS</div>
                      </div>
                      <div className="scrollbar-premium" style={{ maxHeight: "150px", overflowY: "auto" }}>
                        {selectedProfile.clientPerformance.map((c: any, i: number) => (
                          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr", padding: "5px 10px", fontSize: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ fontWeight: 800, color: "#1e293b" }}>{c.clientName}</div>
                            <div>{c.registered}</div>
                            <div>{c.interested}</div>
                            <div>{c.interview}</div>
                            <div style={{ color: "#10b981", fontWeight: 700 }}>{c.selected}</div>
                            <div style={{ textAlign: "right", color: "#8b5cf6", fontWeight: 700 }}>{c.joined}</div>
                          </div>
                        ))}
                        {selectedProfile.clientPerformance.length === 0 && (
                          <div style={{ padding: "8px", textAlign: "center", color: "#94a3b8", fontSize: "0.65rem" }}>No client analytics generated.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "jobs" && (
                  <div>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", padding: "5px 10px", background: "#f8fafc", fontSize: "0.58rem", fontWeight: 800, color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>
                        <div>JOB DESIGNATION</div>
                        <div>PIPELINE SIZE</div>
                        <div>INTERESTED</div>
                        <div>SELECTED</div>
                        <div style={{ textAlign: "right" }}>JOININGS</div>
                      </div>
                      <div className="scrollbar-premium" style={{ maxHeight: "150px", overflowY: "auto" }}>
                        {selectedProfile.jobPerformance.map((j: any, i: number) => (
                          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", padding: "5px 10px", fontSize: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ fontWeight: 800, color: "#1e293b" }}>{j.jobName}</div>
                            <div>{j.count}</div>
                            <div>{j.interested}</div>
                            <div style={{ color: "#10b981", fontWeight: 700 }}>{j.selected}</div>
                            <div style={{ textAlign: "right", color: "#8b5cf6", fontWeight: 700 }}>{j.joined}</div>
                          </div>
                        ))}
                        {selectedProfile.jobPerformance.length === 0 && (
                          <div style={{ padding: "8px", textAlign: "center", color: "#94a3b8", fontSize: "0.65rem" }}>No job designation records.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "sourcing" && (
                  <div>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", padding: "5px 10px", background: "#f8fafc", fontSize: "0.58rem", fontWeight: 800, color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>
                        <div>SOURCING CHANNEL</div>
                        <div>SOURCED</div>
                        <div>CONNECTED</div>
                        <div>SELECTED</div>
                        <div style={{ textAlign: "right" }}>JOININGS</div>
                      </div>
                      <div className="scrollbar-premium" style={{ maxHeight: "150px", overflowY: "auto" }}>
                        {selectedProfile.sourcingPerformance.map((s: any, i: number) => (
                          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", padding: "5px 10px", fontSize: "0.65rem", borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ fontWeight: 800, color: "#1e293b" }}>{s.sourceName}</div>
                            <div>{s.registered}</div>
                            <div>{s.connected}</div>
                            <div style={{ color: "#10b981", fontWeight: 700 }}>{s.selected}</div>
                            <div style={{ textAlign: "right", color: "#8b5cf6", fontWeight: 700 }}>{s.joined}</div>
                          </div>
                        ))}
                        {selectedProfile.sourcingPerformance.length === 0 && (
                          <div style={{ padding: "8px", textAlign: "center", color: "#94a3b8", fontSize: "0.65rem" }}>No channel breakdown generated.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "tasks" && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "5px", marginBottom: "10px" }}>
                      <div style={{ background: "#f8fafc", padding: "5px", borderRadius: "5px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                        <span style={{ fontSize: "0.48rem", color: "#94a3b8", fontWeight: 800 }}>ASSIGNED</span>
                        <strong style={{ fontSize: "0.85rem", color: "#1e293b", display: "block" }}>{selectedProfile.tasks?.assignedTasks ?? 0}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "5px", borderRadius: "5px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                        <span style={{ fontSize: "0.48rem", color: "#94a3b8", fontWeight: 800 }}>ACTIVE</span>
                        <strong style={{ fontSize: "0.85rem", color: "#3b82f6", display: "block" }}>{selectedProfile.tasks?.activeTasks ?? 0}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "5px", borderRadius: "5px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                        <span style={{ fontSize: "0.48rem", color: "#94a3b8", fontWeight: 800 }}>COMPLETED</span>
                        <strong style={{ fontSize: "0.85rem", color: "#10b981", display: "block" }}>{selectedProfile.tasks?.completedTasks ?? 0}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "5px", borderRadius: "5px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                        <span style={{ fontSize: "0.48rem", color: "#94a3b8", fontWeight: 800 }}>EXPIRED</span>
                        <strong style={{ fontSize: "0.85rem", color: "#ef4444", display: "block" }}>{selectedProfile.tasks?.expiredTasks ?? 0}</strong>
                      </div>
                    </div>

                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ padding: "5px 8px", background: "#f8fafc", fontSize: "0.58rem", fontWeight: 800, color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>TASK METRICS VECTOR</div>
                      <div style={{ padding: "8px", fontSize: "0.68rem", color: "#475569" }}>
                        This employee registers a net task completion metric of **{selectedProfile.tasks?.completionPercent ?? 0}%**.
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Profile Footer */}
              <div style={{ padding: "8px 16px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setSelectedProfile(null)} className="btn-primary" style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.68rem" }}>Close Command Center</button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function TeamManagement({ role }: { role: string }) {
  const [viewMode, setViewMode] = useState<"ops" | "registry">("ops");

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<TeamMember | null>(null);
  const [showEditModal, setShowEditModal] = useState<TeamMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tls, setTls] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const [selectedSubordinates, setSelectedSubordinates] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", designation: "",
    role: (role === "boss" ? "manager" : "tl") as any,
    reportingTo: "",
    companyNumber: ""
  });

  const [editData, setEditData] = useState({
    name: "", designation: ""
  });

  const [reassignModal, setReassignModal] = useState<TeamMember | null>(null);
  const [reassignTo, setReassignTo] = useState<number | "">("");
  const [assignmentSearch, setAssignmentSearch] = useState("");

  const canManage = role === "boss" || role === "manager";

  useEffect(() => {
    fetchTeam();
    if (canManage) fetchSupervisors();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      setTeam(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchSupervisors = async () => {
    try {
      const tRes = await fetch("/api/manager/team-leaders");
      setTls(await tRes.json());
      if (role === 'boss') {
        const mRes = await fetch("/api/boss/managers");
        setManagers(await mRes.json());
      }
    } catch (err) { console.error(err); }
  };

  if (role === "tl") {
    return <TLTeamMonitoring />;
  }

  if (role === "boss" && viewMode === "ops") {
    return (
      <div style={{ padding: "0.4rem 0.6rem" }}>
        <div style={{ display: "flex", gap: "6px", paddingBottom: "6px", borderBottom: "1px solid #f1f5f9", marginBottom: "8px" }}>
          <button
            onClick={() => setViewMode("ops")}
            style={{
              padding: "5px 10px", fontSize: "0.72rem", fontWeight: 700,
              borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "white",
              display: "flex", alignItems: "center", gap: "4px",
              boxShadow: "0 2px 4px rgba(37,99,235,0.12)"
            }}
          >
            <LucideActivity size={12} /> Ops Command Center
          </button>
          <button
            onClick={() => setViewMode("registry")}
            style={{
              padding: "5px 10px", fontSize: "0.72rem", fontWeight: 700,
              borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer",
              background: "white",
              color: "#64748b",
              display: "flex", alignItems: "center", gap: "4px"
            }}
          >
            <LucideUsers2 size={12} /> Team Registry
          </button>
        </div>
        <BossTeamMonitoring />
      </div>
    );
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData, assignNodes: selectedSubordinates };
      const res = await fetch("/api/manager/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: "", email: "", password: "", designation: "", role: (role === "boss" ? "manager" : "tl"), reportingTo: "", companyNumber: "" });
        setSelectedSubordinates([]);
        fetchTeam();
      } else {
        const d = await res.json();
        alert(d.error || "Failed");
      }
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/team/${showEditModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      });
      if (res.ok) { setShowEditModal(null); fetchTeam(); }
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleStatusUpdate = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "leaved" ? "active" : "leaved";
    const msg = nextStatus === "leaved"
      ? `Update status to LEAVED? Note: This will automatically unassign all subordinates under this node.`
      : `Update status to ACTIVE?`;
    if (!window.confirm(msg)) return;
    try {
      const res = await fetch(`/api/team/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          autoUnassign: nextStatus === "leaved"
        })
      });
      if (res.ok) fetchTeam();
    } catch (err) { console.error(err); }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModal || !reassignTo) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/team/${reassignModal.id}/reassign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supervisorId: reassignTo })
      });
      if (res.ok) {
        setReassignModal(null);
        setReassignTo("");
        fetchTeam();
      } else {
        const d = await res.json();
        alert(d.error || "Reassignment Failed");
      }
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Purge record?")) return;
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (res.ok) fetchTeam();
    } catch (err) { console.error(err); }
  };

  const toggleSubordinate = (id: number) => {
    setSelectedSubordinates(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  const columnLayout = "180px 1.2fr 1fr 1.2fr 1fr 1.1fr";

  if (role === "manager" && viewMode === "ops") {
    return (
      <div style={{ padding: "0.4rem 0.6rem" }}>
        <div style={{ display: "flex", gap: "6px", paddingBottom: "6px", borderBottom: "1px solid #f1f5f9", marginBottom: "8px" }}>
          <button
            onClick={() => setViewMode("ops")}
            style={{
              padding: "5px 10px", fontSize: "0.72rem", fontWeight: 700,
              borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "white",
              display: "flex", alignItems: "center", gap: "4px",
              boxShadow: "0 2px 4px rgba(37,99,235,0.12)"
            }}
          >
            <LucideActivity size={12} /> Ops Command Center
          </button>
          <button
            onClick={() => setViewMode("registry")}
            style={{
              padding: "5px 10px", fontSize: "0.72rem", fontWeight: 700,
              borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer",
              background: "white",
              color: "#64748b",
              display: "flex", alignItems: "center", gap: "4px"
            }}
          >
            <LucideUsers2 size={12} /> Team Registry
          </button>
        </div>
        <ManagerTeamMonitoring />
      </div>
    );
  }

  return (
    <div className="team-registry" style={{ padding: "0.4rem 0.6rem" }}>
      {role === "manager" && (
        <div style={{ display: "flex", gap: "6px", paddingBottom: "6px", borderBottom: "1px solid #f1f5f9", marginBottom: "8px" }}>
          <button
            onClick={() => setViewMode("ops")}
            style={{
              padding: "5px 10px", fontSize: "0.72rem", fontWeight: 700,
              borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer",
              background: "white",
              color: "#64748b",
              display: "flex", alignItems: "center", gap: "4px"
            }}
          >
            <LucideActivity size={12} /> Ops Command Center
          </button>
          <button
            onClick={() => setViewMode("registry")}
            style={{
              padding: "5px 10px", fontSize: "0.72rem", fontWeight: 700,
              borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "white",
              display: "flex", alignItems: "center", gap: "4px",
              boxShadow: "0 2px 4px rgba(37,99,235,0.12)"
            }}
          >
            <LucideUsers2 size={12} /> Team Registry
          </button>
        </div>
      )}
      {!showAddModal && (
        <div className="flex-between mb-medium" style={{ alignItems: "center", marginBottom: "8px" }}>
          <div>
            <h1 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Team Management</h1>
            <p style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 500, margin: 0 }}>Operational registry and node control.</p>
          </div>
          {canManage && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: "0 10px", height: "30px", fontSize: "0.78rem", fontWeight: 800, borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucidePlus size={13} strokeWidth={3} /> Add New Team
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex-center" style={{ height: "400px" }}><LucideLoader2 className="animate-spin" color="#2563eb" size={40} /></div>
      ) : (
        <AnimatePresence mode="wait">
          {showAddModal ? (
            <motion.div
              key="add-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ background: "#f8fafc", minHeight: "calc(100vh - 100px)", borderRadius: "24px", padding: "40px", border: "1px solid #e2e8f0" }}
            >
              <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                <header style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
                  <button
                    onClick={() => { setShowAddModal(false); setSelectedSubordinates([]); }}
                    style={{ width: "45px", height: "45px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = "#2563eb"}
                    onMouseOut={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                  >
                    <LucideArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Add New Team Member</h2>
                    <p style={{ color: "#64748b", fontWeight: 500 }}>Initialize a new node in the organizational hierarchy.</p>
                  </div>
                </header>

                <form onSubmit={handleAddMember} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                  {/* LEFT COLUMN: IDENTITY */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                    <div style={{ background: "white", padding: "30px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <LucideUserCircle2 size={18} color="#2563eb" /> Personal Identity
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase" }}>Full Legal Name</label>
                          <div style={{ position: "relative" }}>
                            <input className="input-premium" style={{ paddingLeft: "40px" }} placeholder="e.g. Rahul Gupta" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <LucideUserPlus size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase" }}>Work Designation</label>
                          <div style={{ position: "relative" }}>
                            <input className="input-premium" style={{ paddingLeft: "40px" }} placeholder="e.g. Senior Recruitment Specialist" required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                            <LucideBriefcase size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase" }}>Company Number</label>
                          <div style={{ position: "relative" }}>
                            <input className="input-premium" style={{ paddingLeft: "40px" }} placeholder="e.g. +91 98765 43210" value={formData.companyNumber} onChange={e => setFormData({ ...formData, companyNumber: e.target.value })} />
                            <LucidePhone size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: "white", padding: "30px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <LucideFingerprint size={18} color="#2563eb" /> Access & Credentials
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase" }}>Email Address</label>
                          <div style={{ position: "relative" }}>
                            <input className="input-premium" style={{ paddingLeft: "40px" }} placeholder="user@fastrms.com" required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            <LucideAtSign size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase" }}>Security PIN / Password</label>
                          <div style={{ position: "relative" }}>
                            <input className="input-premium" style={{ paddingLeft: "40px" }} placeholder="••••••••" required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            <LucideKey size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: ROLE & HIERARCHY */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                    <div style={{ background: "white", padding: "30px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <LucideShieldCheck size={18} color="#2563eb" /> Functional Node Selection
                      </h3>
                      <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase" }}>Organizational Role</label>
                      <select value={formData.role} onChange={e => { setFormData({ ...formData, role: e.target.value as any }); setSelectedSubordinates([]); }} className="input-premium" style={{ background: "white", height: "48px" }}>
                        {role === 'boss' && <option value="manager">Manager (Cluster Strategy & Leadership)</option>}
                        <option value="tl">Team Lead (Operational Oversight)</option>
                        <option value="recruiter">Recruiter (Junior Execution Node)</option>
                      </select>
                      <p style={{ marginTop: "12px", fontSize: "0.75rem", color: "#64748b", fontStyle: "italic" }}>
                        Assigning this role determines the permissions and hierarchy permissions for this account.
                      </p>
                    </div>

                    {(formData.role === "manager" || formData.role === "tl") && (
                      <div style={{ background: "white", padding: "30px", borderRadius: "24px", border: "1.5px dashed #cbd5e1", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                            <LucideUsers2 size={18} color="#2563eb" />
                            {formData.role === 'tl' ? 'Assign Recruiters' : 'Assign Team Leads'}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ position: "relative" }}>
                              <input
                                className="input-premium"
                                placeholder="Filter nodes..."
                                value={assignmentSearch}
                                onChange={e => setAssignmentSearch(e.target.value)}
                                style={{ padding: "6px 12px 6px 32px", height: "32px", fontSize: "0.75rem", width: "160px", borderRadius: "10px" }}
                              />
                              <LucideSearch size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                            </div>
                            <span style={{ fontSize: "0.7rem", fontWeight: 900, background: "#eff6ff", color: "#2563eb", padding: "4px 10px", borderRadius: "8px" }}>
                              {selectedSubordinates.length} Selected
                            </span>
                          </div>
                        </div>

                        <div style={{ maxHeight: "350px", overflowY: "auto", display: "grid", gridTemplateColumns: "1fr", gap: "10px", paddingRight: "10px" }}>
                          {team.filter(m => {
                            const matchesRole = formData.role === "manager" ? m.role === "tl" : m.role === "recruiter";
                            const isNotLeaved = m.status !== 'leaved';
                            const matchesSearch = m.name.toLowerCase().includes(assignmentSearch.toLowerCase());
                            return matchesRole && isNotLeaved && matchesSearch;
                          }).map(sub => {
                            const isAssigned = !!sub.manager_tl;
                            const isSelected = selectedSubordinates.includes(sub.id);
                            return (
                              <div
                                key={sub.id}
                                onClick={() => !isAssigned && toggleSubordinate(sub.id)}
                                style={{
                                  display: "flex", alignItems: "center", gap: "15px", padding: "15px", borderRadius: "18px",
                                  background: isAssigned ? "#f8fafc" : (isSelected ? "#eff6ff" : "#fff"),
                                  border: "1.5px solid",
                                  borderColor: isAssigned ? "#f1f5f9" : (isSelected ? "#2563eb" : "#f1f5f9"),
                                  cursor: isAssigned ? "not-allowed" : "pointer",
                                  transition: "all 0.2s",
                                  opacity: isAssigned ? 0.7 : 1
                                }}>
                                <div style={{
                                  width: "20px", height: "20px", borderRadius: "6px", border: "2px solid",
                                  borderColor: isSelected ? "#2563eb" : "#cbd5e1",
                                  background: isSelected ? "#2563eb" : "transparent",
                                  display: "flex", alignItems: "center", justifyContent: "center", color: "white"
                                }}>
                                  {isSelected && <LucideShieldCheck size={14} strokeWidth={3} />}
                                  {isAssigned && <LucideLock size={12} color="#94a3b8" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: "0.9rem", fontWeight: 800, color: isAssigned ? "#94a3b8" : "#1e293b" }}>{sub.name}</div>
                                  <div style={{ fontSize: "0.7rem", color: isAssigned ? "#ef4444" : "#64748b", fontWeight: isAssigned ? 700 : 500 }}>
                                    {isAssigned ? `Reserved under: ${sub.manager_tl?.name}` : (sub.designation || "Executive Agent")}
                                  </div>
                                </div>
                                {!isAssigned && isSelected && <LucideUserCheck size={18} color="#2563eb" />}
                              </div>
                            );
                          })}
                          {team.filter(m => (formData.role === "manager" ? m.role === "tl" : m.role === "recruiter")).length === 0 && (
                            <div style={{ textAlign: "center", padding: "40px 20px", background: "#f8fafc", borderRadius: "20px", color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic" }}>
                              No unassigned {formData.role === 'tl' ? 'recruiters' : 'team leaders'} found in the registry.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FULL WIDTH BUTTON */}
                  <div style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
                    <button
                      type="submit"
                      disabled={submitting || ((formData.role === 'manager' || formData.role === 'tl') && selectedSubordinates.length === 0)}
                      className="btn-primary"
                      style={{
                        width: "100%", padding: "20px", borderRadius: "20px", fontWeight: 900, fontSize: "1.1rem",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "15px",
                        boxShadow: "0 20px 25px -5px rgba(37,99,235,0.2)",
                        opacity: ((formData.role === 'manager' || formData.role === 'tl') && selectedSubordinates.length === 0) ? 0.6 : 1,
                        cursor: ((formData.role === 'manager' || formData.role === 'tl') && selectedSubordinates.length === 0) ? "not-allowed" : "pointer"
                      }}
                    >
                      {submitting ? <LucideLoader2 size={24} className="animate-spin" /> : (
                        <>
                          <LucideUserPlus size={24} /> Create now
                        </>
                      )}
                    </button>
                    {((formData.role === 'manager' || formData.role === 'tl') && selectedSubordinates.length === 0) && (
                      <p style={{ color: "#ef4444", fontSize: "0.8rem", fontWeight: 700, textAlign: "center", marginTop: "15px", background: "#fef2f2", padding: "10px", borderRadius: "10px", border: "1px solid #fee2e2" }}>
                        ⚠ Verification Failed: Please assign at least one {formData.role === 'tl' ? 'Recruiter under this TL' : 'Team Lead under this Manager'} first.
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="list-container"
              style={{ background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: columnLayout, padding: "6px 12px", background: "#f8fafc", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ paddingLeft: "6px" }}>Agent Identity</div>
                <div>Designation</div>
                <div>Access</div>
                <div>Assigned to</div>
                <div>Status</div>
                <div style={{ textAlign: "right", paddingRight: "6px" }}>Actions</div>
              </div>

              <div className="list-rows">
                {team.map((member, index) => (
                  <div key={member.id} style={{ display: "grid", gridTemplateColumns: columnLayout, padding: "6px 12px", alignItems: "center", borderBottom: index === team.length - 1 ? "none" : "1px solid #f1f5f9", background: member.status === 'leaved' ? "#fff1f2" : "white" }}>
                    <div style={{ paddingLeft: "6px" }}>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: "0.78rem", color: member.status === 'leaved' ? "#991b1b" : "#1e293b" }}>{member.name}</h4>
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.62rem" }}>{member.email}</p>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#475569", fontWeight: 600 }}>{member.designation || "Executive"}</div>
                    <div style={{ display: "flex", justifyContent: "flex-start" }}><span style={{ fontSize: "0.55rem", padding: "1px 5px", borderRadius: "3px", background: "#f1f5f9", color: "#64748b", fontWeight: 900, border: "1px solid #e2e8f0" }}>{member.role.toUpperCase()}</span></div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: "0.72rem", color: "#475569", fontWeight: 700 }}>{member.manager_tl ? member.manager_tl.name : <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not Assigned</span>}</div>
                      {member.manager_tl && (
                        <div style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "1px" }}>
                          {String(member.manager_tl.role).toLowerCase().includes('boss') ? 'Boss' :
                            (String(member.manager_tl.role).toLowerCase().includes('manager') ? 'Manager' : 'TL')}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", fontWeight: 800, color: member.status === "active" ? "#10b981" : "#ef4444" }}>
                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor" }} />
                        {member.status.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", paddingRight: "6px" }}>
                      <button onClick={() => setShowViewModal(member)} className="row-btn" title="View"><LucideEye size={12} /></button>
                      {canManage && (
                        <>
                          <button onClick={() => { setShowEditModal(member); setEditData({ name: member.name, designation: member.designation || "" }); }} className="row-btn" title="Edit"><LucidePencil size={12} /></button>
                          {((role === 'boss' && (member.role === 'tl' || member.role === 'recruiter')) ||
                            (role === 'manager' && member.role === 'recruiter')) && (
                              <button onClick={() => setReassignModal(member)} className="row-btn" title="Change Leader"><LucideRefreshCcw size={12} /></button>
                            )}
                          <button onClick={() => handleStatusUpdate(member.id, member.status)} className="row-btn" title="Toggle Status">{member.status === 'leaved' ? <LucideLogIn size={12} /> : <LucideLogOut size={12} />}</button>
                          <button onClick={() => handleDelete(member.id)} className="row-btn danger" title="Purge"><LucideTrash2 size={12} /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <style>{`
        .row-btn { width: 24px; height: 24px; border-radius: 6px; border: 1px solid #e2e8f0; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: all 0.2s; }
        .row-btn:hover { border-color: #cbd5e1; color: #1e293b; background: #f8fafc; }
        .row-btn.danger:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
        .input-premium { width: 100%; padding: 6px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.78rem; outline: none; transition: all 0.2s; font-weight: 500; }
        .input-premium:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
      `}</style>

      {/* VIEW MODAL */}
      <AnimatePresence>
        {showViewModal && (
          <div className="modal-overlay flex-center" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 100000, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: "white", borderRadius: "24px", width: "95%", maxWidth: "1100px", maxHeight: "90vh", overflowY: "auto", padding: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", boxSizing: "border-box" }}>
              <ProfileView role={role as any} userId={showViewModal.id} onClose={() => setShowViewModal(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL - KEPT AS MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="modal-overlay flex-center" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 1000, backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="modal-card" style={{ width: "450px", background: "white", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div style={{ padding: "20px 25px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", background: "#f1f5f9", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                    <LucidePencil size={18} />
                  </div>
                  <h3 style={{ margin: 0, fontWeight: 900, fontSize: "1.15rem", color: "#0f172a" }}>Edit Member Profile</h3>
                </div>
                <button onClick={() => setShowEditModal(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><LucideX size={22} /></button>
              </div>

              <form onSubmit={handleUpdateMember} style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Full Name</label>
                    <input className="input-premium" placeholder="e.g. Rahul Gupta" required value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Work Designation</label>
                    <input className="input-premium" placeholder="e.g. Sr. Analyst" required value={editData.designation} onChange={e => setEditData({ ...editData, designation: e.target.value })} />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary" style={{ width: "100%", padding: "14px", borderRadius: "14px", fontWeight: 800, fontSize: "1rem", marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  {submitting ? <LucideLoader2 size={20} className="animate-spin" /> : "Confirm Updates"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REASSIGN MODAL */}
      <AnimatePresence>
        {reassignModal && (
          <div className="modal-overlay flex-center" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 1000, backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="modal-card" style={{ width: "400px", background: "white", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div style={{ padding: "20px 25px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", background: "#f8fafc", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                    <LucideRefreshCcw size={18} />
                  </div>
                  <h3 style={{ margin: 0, fontWeight: 900, fontSize: "1.1rem", color: "#0f172a" }}>Reassign {reassignModal.role.toUpperCase()}</h3>
                </div>
                <button onClick={() => setReassignModal(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><LucideX size={22} /></button>
              </div>

              <form onSubmit={handleReassign} style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <p style={{ margin: "0 0 15px", fontSize: "0.85rem", color: "#64748b", lineHeight: 1.5 }}>
                    Transferring **{reassignModal.name}** to a new operational guardian. Select the new controller below:
                  </p>
                  <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                    Select New {reassignModal.role === 'recruiter' ? 'Team Lead' : 'Manager'}
                  </label>
                  <select
                    required
                    className="input-premium"
                    value={reassignTo}
                    onChange={e => setReassignTo(Number(e.target.value))}
                    style={{ background: "#fff" }}
                  >
                    <option value="">-- Choose New Leader --</option>
                    {team.filter(m => (reassignModal.role === "recruiter" ? m.role === "tl" : m.role === "manager") && m.id !== reassignModal.id && m.status === 'active').map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.designation})</option>
                    ))}
                  </select>
                </div>

                <button type="submit" disabled={submitting || !reassignTo} className="btn-primary" style={{ width: "100%", padding: "14px", borderRadius: "14px", fontWeight: 800, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  {submitting ? <LucideLoader2 size={20} className="animate-spin" /> : "Authorize Transfer"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
