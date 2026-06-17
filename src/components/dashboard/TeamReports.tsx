import React, { useState, useEffect } from "react";
import { 
  LucideUsers, LucideFileText, LucideFilter, LucideSearch, 
  LucideDownload, LucideClock, LucideAlertCircle, LucideTrendingUp, 
  LucideAward, LucideActivity, LucideExternalLink, LucideListChecks, 
  LucidePieChart, LucideZap, LucideCalendar, LucideUserCheck,
  LucideLayers, LucideChevronDown, LucideChevronUp, LucideInfo, LucidePrinter,
  LucideGlobe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Recruiter {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AttendanceData {
  checkInTime: string | null;
  checkOutTime: string | null;
  lateMinutes: number;
  earlyMinutes: number;
  logoutCount: number;
  breakCount: number;
  totalBreakTime: number;
  longestBreak: number;
  averageBreak: number;
  overtimeMinutes: number;
}

interface CandidateStatuses {
  Registered: number;
  Connected: number;
  NotConnected: number;
  Interested: number;
  NotInterested: number;
  Selected: number;
  Joined: number;
  GoForInterview: number;
  ProcessToJoining: number;
  RevertLater: number;
  CallNotPick: number;
  Dropped: number;
  InterviewDone: number;
  InterviewNotDone: number;
  Round1Done: number;
  Round2Done: number;
  Round3Done: number;
  Round4Done: number;
  Round5Done: number;
  AllRoundsDone: number;
  ProcessingForNextRound: number;
  InterviewRescheduled: number;
}

interface BreakdownItem {
  count: number;
  Registered: number;
  Connected: number;
  NotConnected: number;
  Interested: number;
  NotInterested: number;
  Selected: number;
  Joined: number;
  GoForInterview: number;
  ProcessToJoining: number;
  RevertLater: number;
  CallNotPick: number;
  Dropped: number;
  InterviewDone: number;
  InterviewNotDone: number;
  Round1Done: number;
  Round2Done: number;
  Round3Done: number;
  Round4Done: number;
  Round5Done: number;
  AllRoundsDone: number;
  ProcessingForNextRound: number;
  InterviewRescheduled: number;
}

interface TaskSummary {
  name: string;
  completionPct: number;
  remaining: number;
  deadline: string;
}

interface RecruiterReport {
  recruiter: Recruiter;
  currentStatus: string;
  liveWorkingHours: string;
  todayProductivity: number;
  candidateActivity: number;
  presentStatus: string;
  performanceRank: number;
  attendance: AttendanceData;
  candidateStatuses: CandidateStatuses;
  clientBreakdown: { [key: string]: BreakdownItem };
  jobBreakdown: { [key: string]: BreakdownItem };
  sourcingBreakdown: { [key: string]: BreakdownItem };
  leadCategories: { [key: string]: number };
  taskSummaries: TaskSummary[];
}

interface Insights {
  mostProductiveRecruiter: string;
  highestJoiningRatioRecruiter: string;
  bestAttendanceRecruiter: string;
  lowestBreakTimeRecruiter: string;
  bestSourcingPlatform: string;
  totalTeamSourced: number;
  totalTeamJoins: number;
}

export default function TeamReports() {
  const [reports, setReports] = useState<RecruiterReport[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateMode, setDateMode] = useState<string>("today");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("All");
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [productivityFilter, setProductivityFilter] = useState<string>("All");

  // Expanded card tracking
  const [expandedRecruiterId, setExpandedRecruiterId] = useState<number | null>(null);

  // Popup Modals
  const [popupData, setPopupData] = useState<{
    title: string;
    type: "Client" | "JD" | "Platform";
    breakdown: BreakdownItem;
  } | null>(null);

  // Comparison State
  const [showComparison, setShowComparison] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 10000); // 10s auto sync
    return () => clearInterval(interval);
  }, [dateMode, startDate, endDate, selectedRecruiter]);

  const fetchReports = async () => {
    try {
      let queryParams = `?dateMode=${dateMode}`;
      if (dateMode === "custom" && startDate && endDate) {
        queryParams += `&startDate=${startDate}&endDate=${endDate}`;
      }
      if (selectedRecruiter !== "All") {
        queryParams += `&recruiterId=${selectedRecruiter}`;
      }

      const res = await fetch(`/api/reports/team${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReports(data.reports || []);
          setInsights(data.insights || null);
        }
      }
    } catch (err) {
      console.error("Reports fetching error:", err);
    } finally {
      setLoading(false);
    }
  };

  // CSV/Excel Export Engine
  const handleExportExcel = () => {
    if (reports.length === 0) return;

    const headers = [
      "Rank", "Recruiter Name", "Working Status", "Present Status", "Working Hours", "Productivity %",
      "Total Sourced", "Joined Count", "Interested Count", "Late Minutes", "Break Count", "Total Break Time", "Overtime Minutes"
    ];

    const rows = reports.map(r => [
      `Rank #${r.performanceRank}`,
      r.recruiter.name,
      r.currentStatus,
      r.presentStatus,
      r.liveWorkingHours,
      `${r.todayProductivity}%`,
      r.candidateActivity,
      r.candidateStatuses.Joined,
      r.candidateStatuses.Interested,
      r.attendance.lateMinutes,
      r.attendance.breakCount,
      r.attendance.totalBreakTime,
      r.attendance.overtimeMinutes
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Recruiter_TL_Performance_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser printing with custom professional layout
  const handleExportPDF = () => {
    window.print();
  };

  // Filter & Search Logic
  const getFilteredReports = () => {
    return reports.filter(r => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.recruiter.name.toLowerCase().includes(q);
        const matchesClients = Object.keys(r.clientBreakdown).some(c => c.toLowerCase().includes(q));
        const matchesJDs = Object.keys(r.jobBreakdown).some(j => j.toLowerCase().includes(q));
        const matchesPlatform = Object.keys(r.sourcingBreakdown).some(p => p.toLowerCase().includes(q));
        if (!matchesName && !matchesClients && !matchesJDs && !matchesPlatform) return false;
      }

      // 2. Status Filter
      if (statusFilter !== "All" && r.currentStatus.toLowerCase() !== statusFilter.toLowerCase()) return false;

      // 3. Productivity Filter
      if (productivityFilter !== "All") {
        if (productivityFilter === "high" && r.todayProductivity < 70) return false;
        if (productivityFilter === "medium" && (r.todayProductivity < 40 || r.todayProductivity >= 70)) return false;
        if (productivityFilter === "low" && r.todayProductivity >= 40) return false;
      }

      return true;
    });
  };

  const filteredReports = getFilteredReports();

  // Multi-recruiter Comparison handler
  const handleToggleComparison = (id: number) => {
    setCompareIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="reports-tab-container p-medium print-style-reports" style={{ height: "100%", overflowY: "auto", background: "#f8fafc", padding: "0.5rem", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* Printable Sheet CSS rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-style-reports, .print-style-reports * {
            visibility: visible;
          }
          .print-style-reports {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .glass-card {
            border: 1px solid #000 !important;
            background: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Header Roster */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.4rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Advanced Team </span>
            <span style={{ color: "#2563eb" }}>Reports</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>
            Premium SaaS analytics engine monitoring recruiter daily productivity, attendance intelligence, and CRM conversions.
          </p>
        </div>

        {/* Global Exportable Trigger Drawer */}
        <div style={{ display: "flex", gap: "4px" }}>
          <button 
            onClick={() => setShowComparison(!showComparison)}
            className={`btn-secondary glass ${showComparison ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 800, padding: "4px 8px", borderRadius: "6px", border: "1px solid #2563eb", background: showComparison ? "#eff6ff" : "white", color: "#2563eb", cursor: "pointer", fontSize: "0.7rem", transition: "all 0.15s ease" }}
          >
            <LucideLayers size={12} /> Recruiter Comparison
          </button>
          <button 
            onClick={handleExportExcel}
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 800, padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", color: "#475569", cursor: "pointer", fontSize: "0.7rem", transition: "all 0.15s ease" }}
          >
            <LucideDownload size={12} /> Export CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 800, padding: "4px 8px", borderRadius: "6px", background: "#2563eb", color: "white", border: "none", cursor: "pointer", fontSize: "0.7rem", boxShadow: "0 1px 4px rgba(37,99,235,0.12)", transition: "all 0.15s ease" }}
          >
            <LucidePrinter size={12} /> PDF / Print
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel Node */}
      <div className="glass-card no-print" style={{ background: "white", padding: "0.5rem 0.6rem", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "0.5rem" }}>
        <h3 style={{ fontSize: "0.62rem", fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.4rem", marginTop: 0 }}>
          Advanced Report Control Filter Hub
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "6px" }}>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "2px", display: "block" }}>Date Period Select</span>
            <select 
              value={dateMode} 
              onChange={e => setDateMode(e.target.value)} 
              style={{ padding: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem", background: "white", outline: "none", fontWeight: 700 }}
            >
              <option value="today">Today's Live Report</option>
              <option value="yesterday">Yesterday</option>
              <option value="weekly">This Week Summary</option>
              <option value="monthly">This Month Summary</option>
              <option value="yearly">This Year Summary</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {dateMode === "custom" && (
            <>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "2px" }}>Start Date</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  style={{ padding: "3px 4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem", outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "2px" }}>End Date</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  style={{ padding: "3px 4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem", outline: "none" }}
                />
              </div>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "2px", display: "block" }}>Recruiter Target</span>
            <select 
              value={selectedRecruiter} 
              onChange={e => setSelectedRecruiter(e.target.value)} 
              style={{ padding: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem", background: "white", outline: "none", fontWeight: 700 }}
            >
              <option value="All">All Recruiters</option>
              {reports.map(r => (
                <option key={r.recruiter.id} value={r.recruiter.id}>{r.recruiter.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "2px", display: "block" }}>Working Roster Status</span>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              style={{ padding: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem", background: "white", outline: "none", fontWeight: 700 }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Break">On Break</option>
              <option value="Idle">Idle</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "2px", display: "block" }}>Productivity Band</span>
            <select 
              value={productivityFilter} 
              onChange={e => setProductivityFilter(e.target.value)} 
              style={{ padding: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem", background: "white", outline: "none", fontWeight: 700 }}
            >
              <option value="All">All Performance Levels</option>
              <option value="high">High (&gt;= 70% Productivity)</option>
              <option value="medium">Medium (40% - 69% Productivity)</option>
              <option value="low">Low (&lt; 40% Productivity)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gridColumn: "span 2" }}>
            <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "2px" }}>Dynamic Search</span>
            <div style={{ position: "relative" }}>
              <LucideSearch size={10} color="#94a3b8" style={{ position: "absolute", left: "6px", top: "7px" }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "3px 6px 3px 20px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.72rem" }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Team Productivity Insights Cards (Requirement 641) */}
      {insights && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", marginBottom: "0.5rem" }}>
          
          <div className="glass-card" style={{ background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)", borderLeft: "3px solid #a855f7", padding: "0.5rem 0.7rem", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>MVP Productivity</span>
              <LucideAward size={14} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 950, color: "#0f172a", margin: "2px 0" }}>{insights.mostProductiveRecruiter}</h3>
            <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700 }}>Highest performance rank inside team</span>
          </div>

          <div className="glass-card" style={{ background: "linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)", borderLeft: "3px solid #10b981", padding: "0.5rem 0.7rem", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Conversion Star</span>
              <LucideTrendingUp size={14} color="#10b981" />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 950, color: "#0f172a", margin: "2px 0" }}>{insights.highestJoiningRatioRecruiter}</h3>
            <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700 }}>Best candidates joining/hired ratio</span>
          </div>

          <div className="glass-card" style={{ background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)", borderLeft: "3px solid #2563eb", padding: "0.5rem 0.7rem", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Punctuality Champion</span>
              <LucideUserCheck size={14} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 950, color: "#0f172a", margin: "2px 0" }}>{insights.bestAttendanceRecruiter}</h3>
            <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700 }}>Lowest late-in minutes recorded</span>
          </div>

          <div className="glass-card" style={{ background: "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)", borderLeft: "3px solid #f59e0b", padding: "0.5rem 0.7rem", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Optimal Sourcing</span>
              <LucideGlobe size={14} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 950, color: "#0f172a", margin: "2px 0" }}>{insights.bestSourcingPlatform}</h3>
            <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700 }}>Highest lead generator channel</span>
          </div>

        </div>
      )}

      {/* Recruiter Comparison Side-by-Side Panel (Req 640) */}
      {showComparison && (
        <div className="glass-card no-print" style={{ background: "white", padding: "0.8rem", borderRadius: "12px", border: "1px solid #bfdbfe", marginBottom: "0.5rem" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 900, color: "#1e40af", display: "flex", alignItems: "center", gap: "4px", margin: "0 0 0.6rem" }}>
            <LucideLayers size={14} /> Recruitment Comparison Matrix (Side-by-Side)
          </h3>

          <div style={{ display: "flex", gap: "6px", marginBottom: "0.6rem", flexWrap: "wrap" }}>
            {reports.map(r => {
              const isChecked = compareIds.includes(r.recruiter.id);
              return (
                <button
                  key={r.recruiter.id}
                  onClick={() => handleToggleComparison(r.recruiter.id)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: `1px solid ${isChecked ? "#2563eb" : "#cbd5e1"}`,
                    background: isChecked ? "#eff6ff" : "white",
                    color: isChecked ? "#2563eb" : "#475569",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.1s ease"
                  }}
                >
                  <input type="checkbox" checked={isChecked} readOnly style={{ accentColor: "#2563eb", width: "11px", height: "11px" }} />
                  {r.recruiter.name}
                </button>
              );
            })}
          </div>

          {compareIds.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.75rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                    <th style={{ padding: "6px 8px", fontWeight: 800, color: "#475569" }}>Recruiter Metrics</th>
                    {reports.filter(r => compareIds.includes(r.recruiter.id)).map(r => (
                      <th key={r.recruiter.id} style={{ padding: "6px 8px", fontWeight: 900, color: "#1e293b", textAlign: "center" }}>{r.recruiter.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Performance Rank", key: "performanceRank", format: (val: any) => `Rank #${val}` },
                    { label: "Productivity Score", key: "todayProductivity", format: (val: any) => `${val}%` },
                    { label: "Sourced Count", key: "candidateActivity" },
                    { label: "Present Status", key: "presentStatus" },
                    { label: "Final Checkout Time", key: "attendance", subKey: "checkOutTime", format: (val: any) => val || "Pending Completion" },
                    { label: "Working Hours", key: "liveWorkingHours", format: (val: any) => `${val} hrs` },
                    { label: "Late In (mins)", key: "attendance", subKey: "lateMinutes", format: (val: any) => `${val}m` },
                    { label: "Break Duration", key: "attendance", subKey: "totalBreakTime", format: (val: any) => `${val} mins` },
                    { label: "Overtime (mins)", key: "attendance", subKey: "overtimeMinutes", format: (val: any) => `${val}m` },
                    { label: "Registered Candidate", key: "candidateStatuses", subKey: "Registered" },
                    { label: "Connected Leads", key: "candidateStatuses", subKey: "Connected" },
                    { label: "Selected Candidate", key: "candidateStatuses", subKey: "Selected" },
                    { label: "Joined Mandates", key: "candidateStatuses", subKey: "Joined" },
                    { label: "Interview Done", key: "candidateStatuses", subKey: "InterviewDone" },
                    { label: "Interview Not Done", key: "candidateStatuses", subKey: "InterviewNotDone" },
                    { label: "Round 1 Done", key: "candidateStatuses", subKey: "Round1Done" },
                    { label: "Round 2 Done", key: "candidateStatuses", subKey: "Round2Done" },
                    { label: "Round 3 Done", key: "candidateStatuses", subKey: "Round3Done" },
                    { label: "Round 4 Done", key: "candidateStatuses", subKey: "Round4Done" },
                    { label: "Round 5 Done", key: "candidateStatuses", subKey: "Round5Done" },
                    { label: "All Rounds Done", key: "candidateStatuses", subKey: "AllRoundsDone" },
                    { label: "Processing For Next Round", key: "candidateStatuses", subKey: "ProcessingForNextRound" },
                    { label: "Interview Rescheduled", key: "candidateStatuses", subKey: "InterviewRescheduled" }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "5px 8px", fontWeight: 700, color: "#475569" }}>{row.label}</td>
                      {reports.filter(r => compareIds.includes(r.recruiter.id)).map(r => {
                        let value = row.subKey ? r[row.key]?.[row.subKey] : r[row.key];
                        return (
                          <td key={r.recruiter.id} style={{ padding: "5px 8px", textAlign: "center", fontWeight: 600, color: "#0f172a" }}>
                            {row.format ? row.format(value) : value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "1rem", color: "#94a3b8", fontWeight: 700, fontSize: "0.72rem" }}>Select recruiters above to begin side-by-side performance audit.</div>
          )}
        </div>
      )}

      {/* Recruiter Live Daily Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
        
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
            <LucideActivity size={24} className="animate-spin" color="#2563eb" />
            <span style={{ marginLeft: "8px", fontWeight: 800, color: "#475569", fontSize: "0.78rem" }}>Compiling Real-Time Recruiter Roster...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem", background: "white", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <LucideAlertCircle size={32} color="#94a3b8" />
            <h3 style={{ marginTop: "0.5rem", fontWeight: 800, color: "#475569", fontSize: "0.78rem" }}>No reporting data logged under this filter frame.</h3>
          </div>
        ) : (
          filteredReports.map(r => {
            const isExpanded = expandedRecruiterId === r.recruiter.id;
            
            // Harmonious status color mapping
            const getStatusColor = (status: string) => {
              if (status === "Active") return { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };
              if (status === "On Break") return { bg: "#fffbeb", text: "#d97706", border: "#fde68a" };
              if (status === "Idle") return { bg: "#fef2f2", text: "#ef4444", border: "#fecaca" };
              return { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" };
            };
            const sCol = getStatusColor(r.currentStatus);

            return (
              <div 
                key={r.recruiter.id} 
                className="glass-card" 
                style={{ 
                  background: "white", 
                  borderRadius: "12px", 
                  border: `1px solid ${isExpanded ? "#2563eb" : "#e2e8f0"}`, 
                  overflow: "hidden",
                  boxShadow: isExpanded ? "0 4px 16px rgba(37,99,235,0.04)" : "0 1px 3px rgba(0,0,0,0.01)",
                  transition: "all 0.15s ease"
                }}
              >
                
                {/* Card Summary Header */}
                <div 
                  onClick={() => setExpandedRecruiterId(isExpanded ? null : r.recruiter.id)}
                  style={{ padding: "0.6rem 0.9rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", background: "rgba(37,99,235,0.08)", color: "#2563eb", fontSize: "0.95rem", fontWeight: 950 }}>
                      {r.performanceRank}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <h2 style={{ fontSize: "0.95rem", fontWeight: 950, color: "#0f172a", margin: 0 }}>{r.recruiter.name}</h2>
                        <span style={{ display: "inline-block", padding: "1px 5px", borderRadius: "4px", fontSize: "0.62rem", fontWeight: 800, background: sCol.bg, color: sCol.text, border: `1px solid ${sCol.border}` }}>
                          ● {r.currentStatus}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>{r.recruiter.email}</span>
                    </div>
                  </div>

                  {/* Main KPIs summary */}
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", display: "block" }}>Working Hours</span>
                      <strong style={{ fontSize: "0.9rem", fontWeight: 900, color: "#0f172a" }}>{r.liveWorkingHours} hrs</strong>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", display: "block" }}>Today Productivity</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                        <strong style={{ fontSize: "0.9rem", fontWeight: 900, color: r.todayProductivity >= 70 ? "#10b981" : r.todayProductivity >= 40 ? "#f59e0b" : "#ef4444" }}>{r.todayProductivity}%</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", display: "block" }}>Sourced</span>
                      <strong style={{ fontSize: "0.9rem", fontWeight: 900, color: "#7c3aed" }}>{r.candidateActivity}</strong>
                    </div>

                    <div className="no-print" style={{ color: "#94a3b8" }}>
                      {isExpanded ? <LucideChevronUp size={16} /> : <LucideChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Card Expanded Detailed View */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ borderTop: "1px solid #f1f5f9", overflow: "hidden" }}
                    >
                      <div style={{ padding: "0.6rem 0.9rem", background: "#fafafa" }}>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.8rem" }}>
                          
                          {/* Attendance Intelligence Engine (Req 620) */}
                          <div style={{ background: "white", padding: "0.7rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ fontSize: "0.78rem", fontWeight: 900, color: "#1e293b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px", margin: "0 0 0.5rem" }}>
                              <LucideClock size={14} color="#2563eb" /> Attendance Intelligence
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "0.72rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "2px" }}>
                                <span style={{ color: "#64748b" }}>Punch-In Time:</span>
                                <strong style={{ color: "#1e293b" }}>{r.attendance.checkInTime || "N/A"}</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "2px" }}>
                                <span style={{ color: "#64748b" }}>Present status:</span>
                                <strong style={{ color: r.presentStatus === "Present" ? "#10b981" : "#ef4444" }}>{r.presentStatus}</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "2px" }}>
                                <span style={{ color: "#64748b" }}>Late In:</span>
                                <strong style={{ color: r.attendance.lateMinutes > 0 ? "#ef4444" : "#1e293b" }}>{r.attendance.lateMinutes}m</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "2px" }}>
                                <span style={{ color: "#64748b" }}>Early In:</span>
                                <strong style={{ color: r.attendance.earlyMinutes > 0 ? "#10b981" : "#1e293b" }}>{r.attendance.earlyMinutes}m</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "2px" }}>
                                <span style={{ color: "#64748b" }}>Logout Count:</span>
                                <strong style={{ color: "#1e293b" }}>{r.attendance.logoutCount}</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "2px" }}>
                                <span style={{ color: "#64748b" }}>Final Check-Out:</span>
                                <strong style={{ color: "#2563eb" }}>{r.attendance.checkOutTime || "Shift Active"}</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "2px", gridColumn: "span 2" }}>
                                <span style={{ color: "#64748b" }}>Overtime Details:</span>
                                <strong style={{ color: "#10b981" }}>+{r.attendance.overtimeMinutes}m (Early punch & Late logout)</strong>
                              </div>
                            </div>

                            {/* Break Analytics Box (Req 623) */}
                            <h4 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", margin: "0.6rem 0 0.4rem" }}>Break Analytics</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px", textAlign: "center" }}>
                              <div style={{ background: "#f8fafc", padding: "4px 2px", borderRadius: "6px" }}>
                                <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Count</span>
                                <strong style={{ fontSize: "0.72rem", color: "#1e293b" }}>{r.attendance.breakCount}</strong>
                              </div>
                              <div style={{ background: "#f8fafc", padding: "4px 2px", borderRadius: "6px" }}>
                                <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Total</span>
                                <strong style={{ fontSize: "0.72rem", color: "#1e293b" }}>{r.attendance.totalBreakTime}m</strong>
                              </div>
                              <div style={{ background: "#f8fafc", padding: "4px 2px", borderRadius: "6px" }}>
                                <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Longest</span>
                                <strong style={{ fontSize: "0.72rem", color: "#ef4444" }}>{r.attendance.longestBreak}m</strong>
                              </div>
                              <div style={{ background: "#f8fafc", padding: "4px 2px", borderRadius: "6px" }}>
                                <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Avg</span>
                                <strong style={{ fontSize: "0.72rem", color: "#1e293b" }}>{r.attendance.averageBreak}m</strong>
                              </div>
                            </div>
                          </div>

                          {/* Candidate CRM Status Reporting Analytics (Req 624) */}
                          <div style={{ background: "white", padding: "0.7rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ fontSize: "0.78rem", fontWeight: 900, color: "#1e293b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px", margin: "0 0 0.5rem" }}>
                              <LucideListChecks size={14} color="#7c3aed" /> Candidate CRM Analytics
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px", fontSize: "0.72rem" }}>
                              {[
                                { label: "Sourced", val: r.candidateActivity, color: "#64748b" },
                                { label: "Connected", val: r.candidateStatuses.Connected, color: "#2563eb" },
                                { label: "Not Connect", val: r.candidateStatuses.NotConnected, color: "#94a3b8" },
                                { label: "Interested", val: r.candidateStatuses.Interested, color: "#8b5cf6" },
                                { label: "Not Interested", val: r.candidateStatuses.NotInterested, color: "#ef4444" },
                                { label: "Selected", val: r.candidateStatuses.Selected, color: "#0ea5e9" },
                                { label: "Joined Mandate", val: r.candidateStatuses.Joined, color: "#10b981" },
                                { label: "Interview", val: r.candidateStatuses.GoForInterview, color: "#f59e0b" },
                                { label: "Proc to Join", val: r.candidateStatuses.ProcessToJoining, color: "#1e293b" },
                                { label: "Revert Later", val: r.candidateStatuses.RevertLater, color: "#475569" },
                                { label: "Busy/No Ans", val: r.candidateStatuses.CallNotPick, color: "#ec4899" },
                                { label: "Dropped Leads", val: r.candidateStatuses.Dropped, color: "#ef4444" },
                                { label: "Interview Done", val: r.candidateStatuses.InterviewDone || 0, color: "#10b981" },
                                { label: "Interview Not Done", val: r.candidateStatuses.InterviewNotDone || 0, color: "#ef4444" },
                                { label: "Proc for Interview", val: r.candidateStatuses.ProcessingForNextRound || 0, color: "#f59e0b" },
                                { label: "Round 1 Done", val: r.candidateStatuses.Round1Done || 0, color: "#2563eb" },
                                { label: "Round 2 Done", val: r.candidateStatuses.Round2Done || 0, color: "#3b82f6" },
                                { label: "Round 3 Done", val: r.candidateStatuses.Round3Done || 0, color: "#60a5fa" },
                                { label: "Round 4 Done", val: r.candidateStatuses.Round4Done || 0, color: "#93c5fd" },
                                { label: "Round 5 Done", val: r.candidateStatuses.Round5Done || 0, color: "#bfdbfe" },
                                { label: "All Rounds Done", val: r.candidateStatuses.AllRoundsDone || 0, color: "#10b981" },
                                { label: "Proc Next Round", val: r.candidateStatuses.ProcessingForNextRound || 0, color: "#f59e0b" },
                                { label: "Interview Resched", val: r.candidateStatuses.InterviewRescheduled || 0, color: "#7c3aed" }
                              ].map((stat, idx) => (
                                <div key={idx} style={{ background: "#f8fafc", padding: "4px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                                  <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stat.label}</span>
                                  <strong style={{ fontSize: "0.78rem", color: stat.color, marginTop: "1px", display: "block" }}>{stat.val}</strong>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Client / Job / Sourcing platform Reporting (Req 625 - 630) */}
                          <div style={{ background: "white", padding: "0.7rem", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px" }}>
                            
                            {/* Client wise */}
                            <div>
                              <h4 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", margin: "0 0 2px" }}>Client-wise overview</h4>
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                {Object.keys(r.clientBreakdown).length === 0 ? (
                                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>No Client interactions logged</span>
                                ) : (
                                  Object.entries(r.clientBreakdown).map(([name, bData]) => (
                                    <button 
                                      key={name}
                                      onClick={() => setPopupData({ title: name, type: "Client", breakdown: bData })}
                                      style={{ padding: "2px 6px", background: "#f0f9ff", border: "1px solid #b3e0ff", color: "#0369a1", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", gap: "3px", alignItems: "center", transition: "all 0.1s ease" }}
                                    >
                                      {name} ({bData.count}) <LucideExternalLink size={8} />
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Job/JD wise */}
                            <div>
                              <h4 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", margin: "0 0 2px" }}>JOB / Mandate breakdown</h4>
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                {Object.keys(r.jobBreakdown).length === 0 ? (
                                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>No Mandates worked on today</span>
                                ) : (
                                  Object.entries(r.jobBreakdown).map(([name, bData]) => (
                                    <button 
                                      key={name}
                                      onClick={() => setPopupData({ title: name, type: "JD", breakdown: bData })}
                                      style={{ padding: "2px 6px", background: "#fdf4ff", border: "1px solid #f3d9fa", color: "#86198f", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", gap: "3px", alignItems: "center", transition: "all 0.1s ease" }}
                                    >
                                      {name} ({bData.count}) <LucideExternalLink size={8} />
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Sourcing Plat */}
                            <div>
                              <h4 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", margin: "0 0 2px" }}>Sourcing Platforms Log</h4>
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                {Object.entries(r.sourcingBreakdown).map(([name, bData]) => (
                                  <button 
                                    key={name}
                                    onClick={() => setPopupData({ title: name, type: "Platform", breakdown: bData })}
                                    style={{ padding: "2px 6px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", gap: "3px", alignItems: "center", transition: "all 0.1s ease" }}
                                  >
                                    {name} ({bData.count}) <LucideExternalLink size={8} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Bottom Row - Category Generated & Task summary */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginTop: "0.6rem" }}>
                          
                          {/* Lead Data Sourced category wise (Req 631) */}
                          <div style={{ background: "white", padding: "0.7rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <h4 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", margin: "0 0 4px" }}>Lead field / category Breakdown</h4>
                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                              {Object.keys(r.leadCategories).length === 0 ? (
                                <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>No categories mapped on lead databases</span>
                              ) : (
                                Object.entries(r.leadCategories).map(([cat, count]) => (
                                  <span key={cat} style={{ display: "inline-block", padding: "2px 6px", background: "#f1f5f9", color: "#475569", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 800 }}>
                                    {cat}: <strong>{count}</strong>
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Task summary (Req 632) */}
                          <div style={{ background: "white", padding: "0.7rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                            <h4 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", margin: "0 0 4px" }}>Active Task Summary</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              {r.taskSummaries.length === 0 ? (
                                <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>No active tasks assigned</span>
                              ) : (
                                r.taskSummaries.map((t, idx) => (
                                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "4px 8px", borderRadius: "6px", fontSize: "0.68rem" }}>
                                    <div>
                                      <strong style={{ color: "#1e293b", display: "block" }}>{t.name}</strong>
                                      <span style={{ fontSize: "0.6rem", color: "#64748b" }}>Deadline: {t.deadline}</span>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                      <span style={{ display: "inline-block", padding: "1px 4px", background: t.completionPct >= 80 ? "#ecfdf5" : t.completionPct >= 40 ? "#fffbeb" : "#fef2f2", color: t.completionPct >= 80 ? "#10b981" : t.completionPct >= 40 ? "#d97706" : "#ef4444", borderRadius: "3px", fontWeight: 800 }}>
                                        {t.completionPct}% Complete
                                      </span>
                                      <span style={{ fontSize: "0.58rem", color: "#94a3b8", display: "block", marginTop: "1px" }}>{t.remaining} targets left</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })
        )}

      </div>

      {/* Breakdown Popup Modals (Req 626, 628, 630) */}
      <AnimatePresence>
        {popupData && (
          <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "white", width: "90%", maxWidth: "400px", borderRadius: "16px", overflow: "hidden", border: "1px solid #cbd5e1", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            >
              <div style={{ padding: "0.8rem 1rem", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.6rem", background: "#dbeafe", color: "#2563eb", padding: "1px 4px", borderRadius: "3px", fontWeight: 800, textTransform: "uppercase" }}>{popupData.type} Analytics</span>
                  <h3 style={{ margin: "2px 0 0", fontSize: "1.05rem", fontWeight: 950, color: "#0f172a" }}>{popupData.title}</h3>
                </div>
                <button 
                  onClick={() => setPopupData(null)}
                  style={{ background: "none", border: "none", color: "#64748b", fontSize: "1.05rem", fontWeight: 900, cursor: "pointer" }}
                >
                  &times;
                </button>
              </div>

              <div style={{ padding: "0.8rem 1rem" }}>
                <h4 style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", margin: "0 0 6px", fontWeight: 800 }}>Candidate Status Breakdown</h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "0.78rem" }}>
                  {[
                    { label: "Sourced Leads", val: popupData.breakdown.count || popupData.breakdown.Registered, color: "#475569" },
                    { label: "Connected Engaged", val: popupData.breakdown.Connected, color: "#2563eb" },
                    { label: "Not Connected", val: popupData.breakdown.NotConnected, color: "#94a3b8" },
                    { label: "Interested", val: popupData.breakdown.Interested, color: "#8b5cf6" },
                    { label: "Not Interested", val: popupData.breakdown.NotInterested, color: "#ef4444" },
                    { label: "Selected Mandates", val: popupData.breakdown.Selected, color: "#0ea5e9" },
                    { label: "Joined Mandates", val: popupData.breakdown.Joined, color: "#10b981" },
                    { label: "Go For Interview", val: popupData.breakdown.GoForInterview, color: "#f59e0b" },
                    { label: "Process To Join", val: popupData.breakdown.ProcessToJoining, color: "#1e293b" },
                    { label: "Call Busy / No Ans", val: popupData.breakdown.CallNotPick, color: "#ec4899" },
                    { label: "Dropped / Terminated", val: popupData.breakdown.Dropped, color: "#dc2626" },
                    { label: "Interview Done", val: popupData.breakdown.InterviewDone || 0, color: "#10b981" },
                    { label: "Interview Not Done", val: popupData.breakdown.InterviewNotDone || 0, color: "#ef4444" },
                    { label: "Round 1 Done", val: popupData.breakdown.Round1Done || 0, color: "#2563eb" },
                    { label: "Round 2 Done", val: popupData.breakdown.Round2Done || 0, color: "#3b82f6" },
                    { label: "Round 3 Done", val: popupData.breakdown.Round3Done || 0, color: "#60a5fa" },
                    { label: "Round 4 Done", val: popupData.breakdown.Round4Done || 0, color: "#93c5fd" },
                    { label: "Round 5 Done", val: popupData.breakdown.Round5Done || 0, color: "#bfdbfe" },
                    { label: "All Rounds Done", val: popupData.breakdown.AllRoundsDone || 0, color: "#10b981" },
                    { label: "Proc Next Round", val: popupData.breakdown.ProcessingForNextRound || 0, color: "#f59e0b" },
                    { label: "Interview Resched", val: popupData.breakdown.InterviewRescheduled || 0, color: "#7c3aed" }
                  ].map((stat, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "3px" }}>
                      <span style={{ color: "#64748b" }}>{stat.label}:</span>
                      <strong style={{ color: stat.color }}>{stat.val || 0}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "0.6rem 1rem", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => setPopupData(null)}
                  style={{ padding: "6px 14px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: 800, cursor: "pointer", fontSize: "0.78rem" }}
                >
                  Acknowledge
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
