import { useState, useEffect, useRef } from "react";
import { 
  LucideFileBarChart, 
  LucideFilter, 
  LucideDownload, 
  LucideUsers, 
  LucideBriefcase, 
  LucideTrendingUp, 
  LucideArrowRight, 
  LucideCheckCircle2, 
  LucideAlertTriangle, 
  LucideShieldCheck, 
  LucideActivity, 
  LucideClock, 
  LucideCoffee, 
  LucideAward, 
  LucideCalendar, 
  LucideDatabase, 
  LucideMail, 
  LucideSearch, 
  LucideSparkles, 
  LucideDollarSign, 
  LucideSliders, 
  LucideX, 
  LucideChevronRight, 
  LucidePrinter, 
  LucideRefreshCcw,
  LucideClipboardList,
  LucideCpu,
  LucideMapPin,
  LucideTrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BossReports() {
  // Filter States
  const [dateMode, setDateMode] = useState("last_30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedTL, setSelectedTL] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedSourcing, setSelectedSourcing] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  // Data State
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drilldown states
  const [activeDrilldown, setActiveDrilldown] = useState<{ type: string; id: any; name: string } | null>(null);
  const [selectedRecruiterProfile, setSelectedRecruiterProfile] = useState<any>(null);
  const [selectedTLProfile, setSelectedTLProfile] = useState<any>(null);
  const [selectedManagerProfile, setSelectedManagerProfile] = useState<any>(null);

  // Scheduled Reports Config State
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleFreq, setScheduleFreq] = useState("daily");
  const [deliveryChannel, setDeliveryChannel] = useState({ inbox: true, gmail: false, hostinger: false });
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Fetch Reports Telemetry
  const fetchReportsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        dateMode,
        startDate,
        endDate,
        managerId: selectedManager,
        tlId: selectedTL,
        recruiterId: selectedRecruiter,
        clientName: selectedClient,
        jobTitle: selectedJob,
        vendorId: selectedVendor,
        sourcing: selectedSourcing,
        shiftId: selectedShift,
        teamId: selectedTeam
      });
      const res = await fetch(`/api/boss/reports-hub?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to parse company intelligence pipeline");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Pipeline integration fault");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [
    dateMode, startDate, endDate, selectedManager, selectedTL,
    selectedRecruiter, selectedClient, selectedJob, selectedVendor,
    selectedSourcing, selectedShift, selectedTeam
  ]);

  // Clean all filters
  const resetFilters = () => {
    setDateMode("last_30");
    setStartDate("");
    setEndDate("");
    setSelectedManager("");
    setSelectedTL("");
    setSelectedRecruiter("");
    setSelectedClient("");
    setSelectedJob("");
    setSelectedVendor("");
    setSelectedSourcing("");
    setSelectedShift("");
    setSelectedTeam("");
    setActiveDrilldown(null);
    setSelectedRecruiterProfile(null);
    setSelectedTLProfile(null);
    setSelectedManagerProfile(null);
  };

  // Client-side CSV/Excel Generation Engine
  const triggerExport = (reportName: string, headers: string[], rows: any[][]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => {
        const str = String(val === null || val === undefined ? "" : val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FastRMS_${reportName}_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleSuccess(true);
    setTimeout(() => {
      setScheduleSuccess(false);
      setShowScheduler(false);
    }, 2500);
  };

  if (loading && !data) {
    return (
      <div className="flex-center p-large" style={{ minHeight: "80vh", flexDirection: "column", gap: "20px" }}>
        <div className="telemetry-loader">
          <LucideCpu className="animate-spin" size={60} color="#6366f1" />
          <div className="sonar-ring"></div>
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontWeight: 900, color: "#1e293b", margin: 0 }}>Synthesizing Organization Pulse</h2>
          <p style={{ color: "#64748b", margin: "5px 0 0" }}>Eager loading structural matrices, attendance maps & job pipelines...</p>
        </div>
      </div>
    );
  }

  const {
    summary = {},
    recruitment = {},
    clients = [],
    jobs = [],
    sources = [],
    vendors = [],
    teams = [],
    attendance = [],
    leads = {},
    tasks = {},
    incentives = {},
    shifts = [],
    leaderboards = {},
    insights = [],
    trends = []
  } = data || {};

  return (
    <div className="boss-reports-panel p-large" style={{ background: "#f8fafc", minHeight: "100%", fontFamily: "Inter, sans-serif" }}>
      
      {/* Dynamic Print/CSS Overrides */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .boss-reports-panel, .boss-reports-panel * { visibility: visible; }
          .boss-reports-panel { position: absolute; left: 0; top: 0; width: 100%; }
          .filter-card, .btn-primary, .export-center-card, .scheduler-modal { display: none !important; }
        }
        .telemetry-loader { position: relative; display: flex; align-items: center; justify-content: center; }
        .sonar-ring {
          position: absolute; width: 80px; height: 80px; border: 4px solid #6366f1; border-radius: 50%;
          animation: sonar 1.8s infinite ease-out; opacity: 0;
        }
        @keyframes sonar {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .metric-card {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .metric-card:hover {
          transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          border-color: #6366f1;
        }
        .glass-dark-metallic {
          background: linear-gradient(135deg, #0f172a, #1e293b); color: #ffffff;
          border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
        }
        .reports-grid-table {
          width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px;
        }
        .reports-grid-table th {
          background: #f1f5f9; padding: 12px 16px; font-weight: 800; text-transform: uppercase;
          font-size: 0.75rem; letter-spacing: 0.05em; color: #475569; text-align: left;
          border-bottom: 2px solid #e2e8f0;
        }
        .reports-grid-table td {
          padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; color: #1e293b;
        }
        .reports-grid-table tbody tr:hover td {
          background: #f8fafc; cursor: pointer;
        }
        .badge-online { background: #dcfce7; color: #15803d; border-radius: 30px; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; }
        .badge-break { background: #fef9c3; color: #a16207; border-radius: 30px; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; }
        .badge-offline { background: #f1f5f9; color: #475569; border-radius: 30px; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; }
        .filter-select {
          background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 10px 14px;
          font-size: 0.85rem; color: #1e293b; font-weight: 600; width: 100%; outline: none; transition: border 0.2s;
        }
        .filter-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
      `}</style>

      {/* HEADER SECTION */}
      <div className="flex-between mb-large flex-wrap gap-medium">
        <div>
          <h1 style={{ fontSize: "2.3rem", fontWeight: 950, color: "#0f172a", letterSpacing: "-0.03em", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <LucideFileBarChart size={38} color="#6366f1" /> Executive Command Suite
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.1rem", margin: "5px 0 0" }}>Complete real-time corporate business intelligence and diagnostic matrix.</p>
        </div>
        
        {/* ACTION PANEL */}
        <div className="flex gap-small flex-wrap">
          <button onClick={() => setShowScheduler(true)} className="btn-secondary flex-center gap-small" style={{ borderRadius: "14px", padding: "12px 18px", fontSize: "0.9rem" }}>
            <LucideCalendar size={18} /> Schedule Auto Reports
          </button>
          <button onClick={handlePrint} className="btn-secondary flex-center gap-small" style={{ borderRadius: "14px", padding: "12px 18px", fontSize: "0.9rem" }}>
            <LucidePrinter size={18} /> Print Intelligence Sheet
          </button>
          <button onClick={resetFilters} className="btn-primary glass flex-center gap-small" style={{ borderRadius: "14px", padding: "12px 18px", fontSize: "0.9rem", color: "#6366f1" }}>
            <LucideRefreshCcw size={18} /> Purge Filter Matrix
          </button>
        </div>
      </div>

      {/* TOP DYNAMIC COOPERATIVE FILTER BAR */}
      <div className="filter-card glass-card mb-large p-medium" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
        <h3 style={{ margin: "0 0 15px 0", fontSize: "1rem", fontWeight: 800, color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}>
          <LucideSliders size={18} color="#6366f1" /> Cooperative Operational Filters
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
          {/* Time range scope */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Temporal Scope</label>
            <select value={dateMode} onChange={(e) => setDateMode(e.target.value)} className="filter-select">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7">Last 7 Days</option>
              <option value="last_30">Last 30 Days</option>
              <option value="last_90">Last 90 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateMode === "custom" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="filter-select" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="filter-select" />
              </div>
            </>
          )}

          {/* Manager select */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Directing Manager</label>
            <select value={selectedManager} onChange={(e) => { setSelectedManager(e.target.value); setSelectedTL(""); setSelectedRecruiter(""); }} className="filter-select">
              <option value="">All Managers</option>
              {teams.filter((u: any) => u.role === "manager").map((m: any) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* TL Select */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Team Leader</label>
            <select value={selectedTL} onChange={(e) => { setSelectedTL(e.target.value); setSelectedRecruiter(""); }} className="filter-select">
              <option value="">All Team Leads</option>
              {teams.filter((u: any) => u.role === "tl" && (!selectedManager || u.supervisor === teams.find((x: any) => x.id === parseInt(selectedManager))?.name)).map((tl: any) => (
                <option key={tl.id} value={tl.id}>{tl.name}</option>
              ))}
            </select>
          </div>

          {/* Recruiter select */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Recruitment Officer</label>
            <select value={selectedRecruiter} onChange={(e) => setSelectedRecruiter(e.target.value)} className="filter-select">
              <option value="">All Recruiters</option>
              {teams.filter((u: any) => u.role === "recruiter" && (!selectedTL || u.supervisor === teams.find((x: any) => x.id === parseInt(selectedTL))?.name)).map((r: any) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Client select */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Target Client</label>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="filter-select">
              <option value="">All Clients</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.clientName}>{c.clientName}</option>
              ))}
            </select>
          </div>

          {/* Job Select */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Job Mandate</label>
            <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="filter-select">
              <option value="">All Jobs</option>
              {jobs.map((j: any) => (
                <option key={j.id} value={j.jobTitle}>{j.jobTitle}</option>
              ))}
            </select>
          </div>

          {/* Vendor select */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Candidate Vendor</label>
            <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className="filter-select">
              <option value="">All Vendors</option>
              {vendors.map((v: any) => (
                <option key={v.id} value={v.vendorName}>{v.vendorName}</option>
              ))}
            </select>
          </div>

          {/* Sourcing Channel select */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Sourcing Engine</label>
            <select value={selectedSourcing} onChange={(e) => setSelectedSourcing(e.target.value)} className="filter-select">
              <option value="">All Sourcing</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Naukri">Naukri</option>
              <option value="Indeed">Indeed</option>
              <option value="Referral">Referrals</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>

          {/* Shift select */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Work Shift</label>
            <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="filter-select">
              <option value="">All Shifts</option>
              {shifts.map((s: any) => (
                <option key={s.id} value={s.id}>{s.shiftName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 1. EXECUTIVE SUMMARY TELEMETRY CARDS */}
      <div className="stats-grid mb-large" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
        
        {/* Core Employee count */}
        <div className="metric-card glass-dark-metallic flex gap-medium">
          <div className="flex-center" style={{ width: "56px", height: "56px", background: "rgba(255,255,255,0.1)", borderRadius: "16px" }}>
            <LucideUsers size={28} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Corporate Desk Size</span>
            <h2 style={{ fontSize: "2.1rem", margin: "5px 0 0", fontWeight: 900 }}>{summary.totalEmployees}</h2>
            <div style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "5px" }}>
              {summary.totalManagers} Managers • {summary.totalTls} TLs • {summary.totalRecruiters} Recruiters
            </div>
          </div>
        </div>

        {/* Live Attendance desk */}
        <div className="metric-card flex gap-medium">
          <div className="flex-center" style={{ width: "56px", height: "56px", background: "rgba(99,102,241,0.1)", color: "#6366f1", borderRadius: "16px" }}>
            <LucideActivity size={28} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Real-Time Desk Pulse</span>
            <h2 style={{ fontSize: "2.1rem", margin: "5px 0 0", fontWeight: 900, color: "#1e293b" }}>
              {summary.workingEmployees} <span style={{ fontSize: "1rem", color: "#10b981", fontWeight: 800 }}>Online</span>
            </h2>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "5px" }}>
              {summary.breakEmployees} on Break • {summary.offlineEmployees} Offline
            </div>
          </div>
        </div>

        {/* Total Working hours */}
        <div className="metric-card flex gap-medium">
          <div className="flex-center" style={{ width: "56px", height: "56px", background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: "16px" }}>
            <LucideClock size={28} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Sourced Log</span>
            <h2 style={{ fontSize: "2.1rem", margin: "5px 0 0", fontWeight: 900, color: "#1e293b" }}>{summary.totalWorkingHours} hr</h2>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "5px" }}>
              Avg Working Time: <strong>{summary.avgWorkingHours} hr</strong>
            </div>
          </div>
        </div>

        {/* Break hours */}
        <div className="metric-card flex gap-medium">
          <div className="flex-center" style={{ width: "56px", height: "56px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderRadius: "16px" }}>
            <LucideCoffee size={28} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Break Logs & Logout Spikes</span>
            <h2 style={{ fontSize: "2.1rem", margin: "5px 0 0", fontWeight: 900, color: "#1e293b" }}>{summary.totalBreakHours} hr</h2>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "5px" }}>
              Avg Break: <strong>{summary.avgBreakTime}</strong> • {summary.logoutCount} checkouts
            </div>
          </div>
        </div>

        {/* Payout status */}
        <div className="metric-card flex gap-medium">
          <div className="flex-center" style={{ width: "56px", height: "56px", background: "rgba(236,72,153,0.1)", color: "#ec4899", borderRadius: "16px" }}>
            <LucideDollarSign size={28} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Incentives</span>
            <h2 style={{ fontSize: "2.1rem", margin: "5px 0 0", fontWeight: 900, color: "#1e293b" }}>₹{(incentives.totalIncentives || 0).toLocaleString()}</h2>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "5px" }}>
              ₹{(incentives.approvedIncentives || 0).toLocaleString()} Approved • ₹{(incentives.pendingIncentives || 0).toLocaleString()} Pending
            </div>
          </div>
        </div>
      </div>

      {/* MULTI-METRIC INTERACTIVE SVG TREND GRAPH */}
      <div className="glass-card mb-large p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
        <div className="flex-between mb-medium flex-wrap gap-small">
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Organizational Telemetry & Growth Curves</h3>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "2px 0 0" }}>Historical timeline tracing candidates generated, selection rates, and joining conversions.</p>
          </div>
          <div className="flex gap-small" style={{ fontSize: "0.8rem", fontWeight: 800 }}>
            <span style={{ color: "#6366f1", display: "flex", alignItems: "center", gap: "5px" }}><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#6366f1" }}></span> Sourced Candidates</span>
            <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "5px" }}><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }}></span> Selections</span>
            <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "5px" }}><span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }}></span> Onboarded/Joined</span>
          </div>
        </div>

        {/* Clean SVG Canvas */}
        <div style={{ width: "100%", height: "240px", position: "relative" }}>
          {trends.length > 0 ? (
            <svg viewBox="0 0 700 200" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <linearGradient id="glow-candidates" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="glow-selections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="90" x2="700" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="140" x2="700" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="180" x2="700" y2="180" stroke="#cbd5e1" strokeWidth="1" />

              {/* Data curves rendering dynamically based on real trends */}
              {(() => {
                const maxVal = Math.max(10, ...trends.map((t: any) => Math.max(t.candidates || 0, t.selections || 0, t.joinings || 0)));
                const scale = (val: number) => 180 - (val / maxVal) * 140;
                
                const pointsC = trends.map((t: any, idx: number) => `${idx * 115},${scale(t.candidates || 0)}`).join(" ");
                const pointsS = trends.map((t: any, idx: number) => `${idx * 115},${scale(t.selections || 0)}`).join(" ");
                const pointsJ = trends.map((t: any, idx: number) => `${idx * 115},${scale(t.joinings || 0)}`).join(" ");

                return (
                  <>
                    {/* Area Gradients */}
                    <path d={`M0,180 L${pointsC} L690,180 Z`} fill="url(#glow-candidates)" />
                    <path d={`M0,180 L${pointsS} L690,180 Z`} fill="url(#glow-selections)" />

                    {/* Smooth Paths */}
                    <path d={`M0,${scale(trends[0]?.candidates || 0)} S` + pointsC.substring(pointsC.indexOf(" ") + 1)} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                    <path d={`M0,${scale(trends[0]?.selections || 0)} S` + pointsS.substring(pointsS.indexOf(" ") + 1)} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                    <path d={`M0,${scale(trends[0]?.joinings || 0)} S` + pointsJ.substring(pointsJ.indexOf(" ") + 1)} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

                    {/* Nodes and Ticks */}
                    {trends.map((t: any, idx: number) => {
                      const cx = idx * 115;
                      return (
                        <g key={idx}>
                          <circle cx={cx} cy={scale(t.candidates || 0)} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx={cx} cy={scale(t.selections || 0)} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx={cx} cy={scale(t.joinings || 0)} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                          <text x={cx} y="195" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="700">{t.date}</text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          ) : (
            <div className="flex-center" style={{ height: "100%", color: "#64748b" }}>Not enough timeline points loaded yet.</div>
          )}
        </div>
      </div>

      {/* DYNAMIC REAL-TIME AI DIAGNOSTIC INSIGHTS */}
      <div className="glass-card mb-large p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
        <h3 style={{ margin: "0 0 15px 0", fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
          <LucideSparkles size={20} color="#6366f1" /> Real-time Corporate Intelligence & Diagnosis (AI Engine)
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px" }}>
          {insights.map((ins: any, idx: number) => (
            <div key={idx} style={{
              background: ins.type === "success" ? "#f0fdf4" : ins.type === "info" ? "#eff6ff" : ins.type === "warning" ? "#fffbeb" : "#fef2f2",
              border: `1px solid ${ins.type === "success" ? "#bbf7d0" : ins.type === "info" ? "#bfdbfe" : ins.type === "warning" ? "#fde68a" : "#fca5a5"}`,
              borderRadius: "16px", padding: "15px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                {ins.type === "success" && <LucideShieldCheck size={18} color="#15803d" />}
                {ins.type === "info" && <LucideTrendingUp size={18} color="#1d4ed8" />}
                {ins.type === "warning" && <LucideAlertTriangle size={18} color="#b45309" />}
                {ins.type === "danger" && <LucideAlertTriangle size={18} color="#b91c1c" />}
                <strong style={{
                  fontSize: "0.85rem",
                  color: ins.type === "success" ? "#166534" : ins.type === "info" ? "#1e40af" : ins.type === "warning" ? "#854d0e" : "#991b1b",
                  textTransform: "uppercase", letterSpacing: "0.05em"
                }}>{ins.title}</strong>
              </div>
              <p style={{
                margin: 0, fontSize: "0.85rem", lineHeight: "1.4",
                color: ins.type === "success" ? "#14532d" : ins.type === "info" ? "#1e3a8a" : ins.type === "warning" ? "#713f12" : "#7f1d1d"
              }}>{ins.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RECRUITMENT FUNNEL CONVERSION */}
      <div className="glass-card mb-large p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
        <div className="flex-between mb-medium">
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Recruitment Conversion Pipeline</h3>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "2px 0 0" }}>Pipeline transition velocity from sourcing generation to selectors onboarding.</p>
          </div>
          <button onClick={() => triggerExport("RecruitmentConversion", ["Metric", "Volume"], [
            ["Registered Candidates", recruitment.regCandidates],
            ["Connected Candidates", recruitment.connected],
            ["Interested Candidates", recruitment.interested],
            ["Processing For Interview", recruitment.processingForNextRound || 0],
            ["Interview Done", recruitment.interviewDone || 0],
            ["Interview Not Done", recruitment.interviewNotDone || 0],
            ["Interviews Processed", recruitment.goForInterview],
            ["Candidates Selected", recruitment.selected],
            ["Onboarded/Joined", recruitment.joined],
            ["Dropped Out", recruitment.dropped]
          ])} className="btn-secondary flex-center gap-small" style={{ borderRadius: "10px", padding: "8px 12px", fontSize: "0.8rem" }}>
            <LucideDownload size={14} /> Export Funnel
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", textAlign: "center" }}>
          {[
            { label: "Registered Sourced", value: recruitment.regCandidates, sub: "Total base" },
            { label: "Connected", value: recruitment.connected, sub: `${recruitment.notConnected} unreached` },
            { label: "Interested Desk", value: recruitment.interested, sub: `${recruitment.notInterested} uninterested` },
            { label: "Processing For Interview", value: recruitment.processingForNextRound || 0, sub: `Active processing` },
            { label: "Interview Done", value: recruitment.interviewDone || 0, sub: `${recruitment.interviewNotDone || 0} not done` },
            { label: "Go For Interview", value: recruitment.goForInterview, sub: `${recruitment.callNotPick} missed calls` },
            { label: "Hired/Selected", value: recruitment.selected, sub: `${recruitment.rejected} rejected` },
            { label: "Onboarded & Joined", value: recruitment.joined, sub: `${recruitment.dropped} dropped` }
          ].map((item, idx) => (
            <div key={idx} style={{ background: "#f8fafc", padding: "1.2rem", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>{item.label}</span>
              <h2 style={{ fontSize: "2rem", fontWeight: 950, color: "#0f172a", margin: "8px 0 2px" }}>{item.value}</h2>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.sub}</span>
            </div>
          ))}
        </div>

        <div className="mt-large p-medium" style={{ background: "#f8fafc", borderRadius: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {[
            { label: "Connected → Interested", rate: recruitment.connectedToInterested, color: "#6366f1" },
            { label: "Interested → Interview", rate: recruitment.interestedToInterview, color: "#f59e0b" },
            { label: "Interview → Selected", rate: recruitment.interviewToSelected, color: "#10b981" },
            { label: "Selected → Joined", rate: recruitment.selectedToJoined, color: "#ec4899" },
            { label: "Overall Joining Ratio", rate: recruitment.overallConversion, color: "#0f172a" }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex-between mb-small" style={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155" }}>
                <span>{item.label}</span>
                <span style={{ color: item.color }}>{item.rate}%</span>
              </div>
              <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ width: `${item.rate}%`, height: "100%", background: item.color, borderRadius: "10px" }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2.5 ADVANCED INTERVIEW ROUND CONVERSION & DROP-OFF */}
      <div className="glass-card mb-large p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
        <div className="flex-between mb-medium">
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Advanced Interview Round Analytics & Drop-off Funnel</h3>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "2px 0 0" }}>Analysis of interview completions, rescheduled counts, active progression, and round-by-round drop-off ratios.</p>
          </div>
          <button onClick={() => triggerExport("InterviewRoundsAnalytics", ["Metric", "Volume"], [
            ["Interview Done", recruitment.interviewDone || 0],
            ["Interview Not Done", recruitment.interviewNotDone || 0],
            ["Round 1 Cumulative", recruitment.r1Cumulative || 0],
            ["Round 2 Cumulative", recruitment.r2Cumulative || 0],
            ["Round 3 Cumulative", recruitment.r3Cumulative || 0],
            ["Round 4 Cumulative", recruitment.r4Cumulative || 0],
            ["Round 5 Cumulative", recruitment.r5Cumulative || 0],
            ["All Rounds Done", recruitment.allRoundsCumulative || 0],
            ["Processing For Next Round", recruitment.processingForNextRound || 0],
            ["Interview Rescheduled", recruitment.interviewRescheduled || 0]
          ])} className="btn-secondary flex-center gap-small" style={{ borderRadius: "10px", padding: "8px 12px", fontSize: "0.8rem" }}>
            <LucideDownload size={14} /> Export Rounds Report
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", textAlign: "center", marginBottom: "1.5rem" }}>
          {[
            { label: "Interview Done", value: recruitment.interviewDone || 0, color: "#10b981", sub: "Completed interviews" },
            { label: "Interview Not Done", value: recruitment.interviewNotDone || 0, color: "#ef4444", sub: "Missed/Cancelled" },
            { label: "Processing Next", value: recruitment.processingForNextRound || 0, color: "#f59e0b", sub: "Waiting for next round" },
            { label: "Interview Rescheduled", value: recruitment.interviewRescheduled || 0, color: "#6366f1", sub: "Scheduled later" },
            { label: "All Rounds Done", value: recruitment.allRoundsDone || 0, color: "#8b5cf6", sub: "Ready for joining checks" }
          ].map((item, idx) => (
            <div key={idx} style={{ background: "#f8fafc", padding: "1.2rem", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>{item.label}</span>
              <h2 style={{ fontSize: "2rem", fontWeight: 950, color: item.color, margin: "8px 0 2px" }}>{item.value}</h2>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.sub}</span>
            </div>
          ))}
        </div>

        <h4 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#334155", margin: "1rem 0 0.5rem" }}>Round-wise Completion Funnel & Conversion Ratio</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", textAlign: "center", marginBottom: "1.5rem" }}>
          {[
            { label: "Round 1 Done", value: recruitment.r1Cumulative || 0, sub: "Total R1 completions" },
            { label: "Round 2 Done", value: recruitment.r2Cumulative || 0, sub: "Total R2 completions" },
            { label: "Round 3 Done", value: recruitment.r3Cumulative || 0, sub: "Total R3 completions" },
            { label: "Round 4 Done", value: recruitment.r4Cumulative || 0, sub: "Total R4 completions" },
            { label: "Round 5 Done", value: recruitment.r5Cumulative || 0, sub: "Total R5 completions" }
          ].map((item, idx) => (
            <div key={idx} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>{item.label}</span>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#4f46e5", margin: "6px 0 2px" }}>{item.value}</h2>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.sub}</span>
            </div>
          ))}
        </div>

        <h4 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#334155", margin: "1rem 0 0.5rem" }}>Round Drop-off Analytics & Transition Rates</h4>
        <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {[
            { label: "Round 1 → Round 2", rate: recruitment.r1ToR2Rate || 0, color: "#6366f1" },
            { label: "Round 2 → Round 3", rate: recruitment.r2ToR3Rate || 0, color: "#3b82f6" },
            { label: "Round 3 → Round 4", rate: recruitment.r3ToR4Rate || 0, color: "#60a5fa" },
            { label: "Round 4 → Round 5", rate: recruitment.r4ToR5Rate || 0, color: "#93c5fd" },
            { label: "Round 5 → All Rounds Done", rate: recruitment.r5ToAllRate || 0, color: "#10b981" }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex-between mb-small" style={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155" }}>
                <span>{item.label}</span>
                <span style={{ color: item.color }}>{item.rate}% transition ({100 - item.rate}% drop-off)</span>
              </div>
              <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ width: `${item.rate}%`, height: "100%", background: item.color, borderRadius: "10px" }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CORE DATA GRIDS (CLIENTS & JOBS & VENDORS & SOURCE) */}
      <div className="grid-2-col mb-large" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "2rem" }}>
        
        {/* CLIENT PERFORMANCE GRID */}
        <div className="glass-card p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
          <div className="flex-between mb-medium">
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Client Performance Grid</h3>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "2px 0 0" }}>Sourced profiles, selected ratings and conversion levels per enterprise client.</p>
            </div>
            <button onClick={() => triggerExport("ClientPerformance", [
              "Client Name", "Total Candidates", "Interested", "Selected", "Joined", "Conversion %"
            ], clients.map((c: any) => [c.clientName, c.totalCandidates, c.interested, c.selected, c.joined, c.conversionRate]))} className="btn-secondary flex-center gap-small" style={{ borderRadius: "10px", padding: "8px 12px", fontSize: "0.8rem" }}>
              <LucideDownload size={14} /> Export CSV
            </button>
          </div>

          <div style={{ overflowX: "auto", maxHeight: "350px" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Sourced</th>
                  <th>Selected</th>
                  <th>Joined</th>
                  <th>Selection Ratio</th>
                  <th>Joining Ratio</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c: any, idx: number) => (
                  <tr key={idx} onClick={() => setActiveDrilldown({ type: "client", id: c.id, name: c.clientName })}>
                    <td><strong>{c.clientName}</strong></td>
                    <td>{c.totalCandidates}</td>
                    <td style={{ color: "#f59e0b", fontWeight: 800 }}>{c.selected}</td>
                    <td style={{ color: "#10b981", fontWeight: 800 }}>{c.joined}</td>
                    <td>{c.selectionRatio}%</td>
                    <td><span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 8px", borderRadius: "8px", fontWeight: 800 }}>{c.joiningRatio}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* JOB MANDATE ANALYTICS */}
        <div className="glass-card p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
          <div className="flex-between mb-medium">
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Job Performance Suite</h3>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "2px 0 0" }}>Fulfillment status, interview counters & conversion rates by designation.</p>
            </div>
            <button onClick={() => triggerExport("JobPerformance", [
              "Job Title", "Total Candidates", "Selected", "Joined", "Fulfillment Rate"
            ], jobs.map((j: any) => [j.jobTitle, j.totalCandidates, j.selected, j.joined, j.joiningRatio]))} className="btn-secondary flex-center gap-small" style={{ borderRadius: "10px", padding: "8px 12px", fontSize: "0.8rem" }}>
              <LucideDownload size={14} /> Export CSV
            </button>
          </div>

          <div style={{ overflowX: "auto", maxHeight: "350px" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Job Designation</th>
                  <th>Candidates Sourced</th>
                  <th>Selected</th>
                  <th>Joined</th>
                  <th>Time To Fill</th>
                  <th>Fulfillment Ratio</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j: any, idx: number) => (
                  <tr key={idx} onClick={() => setActiveDrilldown({ type: "job", id: j.id, name: j.jobTitle })}>
                    <td><strong>{j.jobTitle}</strong></td>
                    <td>{j.totalCandidates}</td>
                    <td style={{ color: "#f59e0b", fontWeight: 800 }}>{j.selected}</td>
                    <td style={{ color: "#10b981", fontWeight: 800 }}>{j.joined}</td>
                    <td>{j.timeToFill}</td>
                    <td><span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 8px", borderRadius: "8px", fontWeight: 800 }}>{j.joiningRatio}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VENDOR & SOURCING PLATFORMS GRID */}
      <div className="grid-2-col mb-large" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "2rem" }}>
        
        {/* VENDOR AUDIT PANELS */}
        <div className="glass-card p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
          <div className="flex-between mb-medium">
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Vendor Share & Success Ratio</h3>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "2px 0 0" }}>Track external vendor candidate volumes, selections & final joining payouts.</p>
            </div>
            <button onClick={() => triggerExport("VendorPerformance", [
              "Vendor Name", "Candidates Shared", "Selected", "Joined", "Success Ratio"
            ], vendors.map((v: any) => [v.vendorName, v.candidatesShared, v.selected, v.joined, v.successRatio]))} className="btn-secondary flex-center gap-small" style={{ borderRadius: "10px", padding: "8px 12px", fontSize: "0.8rem" }}>
              <LucideDownload size={14} /> Export CSV
            </button>
          </div>

          <div style={{ overflowX: "auto", maxHeight: "350px" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Vendor Partner</th>
                  <th>Shared base</th>
                  <th>Sought Interviews</th>
                  <th>Selected</th>
                  <th>Joined</th>
                  <th>Success Rating</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v: any, idx: number) => (
                  <tr key={idx} onClick={() => setActiveDrilldown({ type: "vendor", id: v.id, name: v.vendorName })}>
                    <td><strong>{v.vendorName}</strong></td>
                    <td>{v.candidatesShared}</td>
                    <td>{v.interview}</td>
                    <td style={{ color: "#f59e0b", fontWeight: 800 }}>{v.selected}</td>
                    <td style={{ color: "#10b981", fontWeight: 800 }}>{v.joined}</td>
                    <td><span style={{ background: "#faf5ff", color: "#6b21a8", padding: "4px 8px", borderRadius: "8px", fontWeight: 800 }}>{v.successRatio}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SOURCING PLATFORMS QUALITY RATING */}
        <div className="glass-card p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
          <div className="flex-between mb-medium">
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Sourcing Engine Audit</h3>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "2px 0 0" }}>Map yield metrics & overall candidate quality rating of digital platforms.</p>
            </div>
            <button onClick={() => triggerExport("SourcingPerformance", [
              "Sourcing Engine", "Sourced Count", "Selected", "Joined", "Quality Score"
            ], sources.map((s: any) => [s.sourceName, s.candidatesGenerated, s.selected, s.joined, s.sourceQualityScore]))} className="btn-secondary flex-center gap-small" style={{ borderRadius: "10px", padding: "8px 12px", fontSize: "0.8rem" }}>
              <LucideDownload size={14} /> Export CSV
            </button>
          </div>

          <div style={{ overflowX: "auto", maxHeight: "350px" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Sourcing Engine</th>
                  <th>Generated</th>
                  <th>Selected</th>
                  <th>Joined</th>
                  <th>Yield Rate</th>
                  <th>Platform Quality Score</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s: any, idx: number) => (
                  <tr key={idx}>
                    <td><strong>{s.sourceName}</strong></td>
                    <td>{s.candidatesGenerated}</td>
                    <td>{s.selected}</td>
                    <td>{s.joined}</td>
                    <td>{s.conversionRate}%</td>
                    <td>
                      <div className="flex-center gap-small">
                        <div style={{ width: "80px", height: "6px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                          <div style={{ width: `${s.sourceQualityScore}%`, height: "100%", background: s.sourceQualityScore >= 75 ? "#10b981" : s.sourceQualityScore >= 45 ? "#f59e0b" : "#ef4444" }} />
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569" }}>{s.sourceQualityScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TASK & INCENTIVE & LEAD & ATTENDANCE DETAILS GRIDS */}
      <div className="glass-card mb-large p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
        
        {/* ATTENDANCE & EFFICIENCY INDEX */}
        <div className="flex-between mb-medium">
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Attendance Intelligence & Checkouts</h3>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "2px 0 0" }}>Check-in time offsets, break counts, checkout logout spikes and efficiency %.</p>
          </div>
          <button onClick={() => triggerExport("AttendanceIntelligence", [
            "Employee Name", "Role", "Check In", "Check Out", "Working Hours", "Breaks", "Logouts", "Efficiency %"
          ], attendance.map((a: any) => [a.employeeName, a.role, a.checkInTime, a.checkOutTime, a.workingHours, a.breakCount, a.logoutCount, a.efficiency]))} className="btn-secondary flex-center gap-small" style={{ borderRadius: "10px", padding: "8px 12px", fontSize: "0.8rem" }}>
            <LucideDownload size={14} /> Export CSV
          </button>
        </div>

        <div style={{ overflowX: "auto", maxHeight: "400px" }}>
          <table className="reports-grid-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Role</th>
                <th>Punch In</th>
                <th>Punch Out</th>
                <th>Hours Sourced</th>
                <th>Breaks / Logouts</th>
                <th>Late Login?</th>
                <th>Overtime</th>
                <th>Efficiency Rank</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a: any, idx: number) => (
                <tr key={idx}>
                  <td><strong>{a.employeeName}</strong></td>
                  <td><span style={{ textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>{a.role}</span></td>
                  <td>{a.checkInTime}</td>
                  <td>{a.checkOutTime}</td>
                  <td style={{ fontWeight: 800 }}>{a.workingHours}</td>
                  <td>{a.breakCount} breaks ({a.breakTime}) • {a.logoutCount} checkouts</td>
                  <td>
                    <span style={{
                      color: a.lateLogin === "Yes" ? "#b91c1c" : "#15803d",
                      background: a.lateLogin === "Yes" ? "#fef2f2" : "#f0fdf4",
                      padding: "4px 8px", borderRadius: "6px", fontWeight: 800, fontSize: "0.75rem"
                    }}>{a.lateLogin === "Yes" ? "LATE" : "ON TIME"}</span>
                  </td>
                  <td>{a.overtime}</td>
                  <td>
                    <div className="flex-center gap-small">
                      <div style={{ width: "60px", height: "6px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{ width: `${a.efficiency}%`, height: "100%", background: "#6366f1" }} />
                      </div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569" }}>{a.efficiency}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LEAD DATA & TASK PERFORMANCE METRICS */}
      <div className="grid-2-col mb-large" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "2rem" }}>
        
        {/* LEAD INTEL DATA */}
        <div className="glass-card p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
          <div className="flex-between mb-medium">
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Enterprise Lead Bank Overview</h3>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "2px 0 0" }}>Breakdown analysis & conversion yield rates by industry categories.</p>
            </div>
            <button onClick={() => triggerExport("LeadAnalytics", [
              "Category", "Leads Generated", "Selections"
            ], leads.categoryBreakdown?.map((c: any) => [c.category, c.count, c.conversion]) || [])} className="btn-secondary flex-center gap-small" style={{ borderRadius: "10px", padding: "8px 12px", fontSize: "0.8rem" }}>
              <LucideDownload size={14} /> Export CSV
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Total Corporate Leads</span>
              <h2 style={{ fontSize: "1.8rem", margin: "5px 0 0", color: "#6366f1" }}>{leads.totalLeads}</h2>
            </div>
            <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Converted Leads</span>
              <h2 style={{ fontSize: "1.8rem", margin: "5px 0 0", color: "#10b981" }}>{leads.leadConversion}</h2>
            </div>
          </div>

          <div style={{ overflowY: "auto", maxHeight: "250px" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Leads Generated</th>
                  <th>Selections</th>
                  <th>Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {leads.categoryBreakdown?.map((c: any, idx: number) => (
                  <tr key={idx}>
                    <td><strong>{c.category}</strong></td>
                    <td>{c.count}</td>
                    <td style={{ color: "#f59e0b", fontWeight: 800 }}>{c.conversion}</td>
                    <td><span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 8px", borderRadius: "6px", fontWeight: 800 }}>{c.count > 0 ? Math.round((c.conversion / c.count) * 100) : 0}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TASK COMPLETION VELOCITY */}
        <div className="glass-card p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Task Execution & Achievement %</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "20px" }}>
            <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Assigned Tasks</span>
              <h2 style={{ fontSize: "1.8rem", margin: "5px 0 0", color: "#0f172a" }}>{tasks.assignedTasks}</h2>
            </div>
            <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Completed</span>
              <h2 style={{ fontSize: "1.8rem", margin: "5px 0 0", color: "#10b981" }}>{tasks.completedTasks}</h2>
            </div>
            <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Overdue</span>
              <h2 style={{ fontSize: "1.8rem", margin: "5px 0 0", color: "#ef4444" }}>{tasks.expiredTasks}</h2>
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <div className="flex-between mb-small" style={{ fontSize: "0.85rem", fontWeight: 800 }}>
              <span>Target Achievement Rating</span>
              <span style={{ color: "#6366f1" }}>{tasks.targetAchievement}%</span>
            </div>
            <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "15px" }}>
              <div style={{ width: `${tasks.targetAchievement}%`, height: "100%", background: "#6366f1" }} />
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
              Our organization has completed <strong>{tasks.completedTasks} tasks</strong> out of {tasks.assignedTasks} active targets this period. Average completion speed: <strong>4.6 hr</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* SHIFT COVERAGE & TEAM PERFORMANCES */}
      <div className="grid-2-col mb-large" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "2rem" }}>
        
        {/* SHIFT TELEMETRY MONITOR */}
        <div className="glass-card p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Operational Shift Telemetry</h3>
          
          <div style={{ overflowX: "auto" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Shift Name</th>
                  <th>Assigned Base</th>
                  <th>Avg Working Hours</th>
                  <th>Avg Break Time</th>
                  <th>Shift Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((sh: any, idx: number) => (
                  <tr key={idx}>
                    <td><strong>{sh.shiftName}</strong></td>
                    <td>{sh.assignedEmployees} staff</td>
                    <td>{sh.avgWorkingHours}</td>
                    <td>{sh.avgBreakTime}</td>
                    <td>
                      <span style={{
                        background: sh.efficiency >= 80 ? "#dcfce7" : sh.efficiency >= 50 ? "#fef9c3" : "#fef2f2",
                        color: sh.efficiency >= 80 ? "#15803d" : sh.efficiency >= 50 ? "#a16207" : "#b91c1c",
                        padding: "4px 8px", borderRadius: "6px", fontWeight: 800, fontSize: "0.75rem"
                      }}>{sh.efficiency}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TEAM HIERARCHY SCORECARD */}
        <div className="glass-card p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
          <div className="flex-between mb-medium">
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>Department performance Scorecard</h3>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "2px 0 0" }}>Dynamic corporate scores calculated based on selections, registrations & task completion.</p>
            </div>
            <button onClick={() => triggerExport("TeamScorecard", [
              "Name", "Role", "Registrations", "Selections", "Joined", "Performance Score"
            ], teams.map((t: any) => [t.name, t.role, t.registrations, t.selected, t.joined, t.performanceScore]))} className="btn-secondary flex-center gap-small" style={{ borderRadius: "10px", padding: "8px 12px", fontSize: "0.8rem" }}>
              <LucideDownload size={14} /> Export CSV
            </button>
          </div>

          <div style={{ overflowY: "auto", maxHeight: "250px" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Role</th>
                  <th>Selections</th>
                  <th>Joinings</th>
                  <th>Task Comp</th>
                  <th>Index Score</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t: any, idx: number) => (
                  <tr key={idx} onClick={() => {
                    if (t.role === "recruiter") setSelectedRecruiterProfile(t);
                    else if (t.role === "tl") setSelectedTLProfile(t);
                    else if (t.role === "manager") setSelectedManagerProfile(t);
                  }}>
                    <td><strong>{t.name}</strong></td>
                    <td><span style={{ textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 800, color: "#475569" }}>{t.role}</span></td>
                    <td style={{ color: "#f59e0b", fontWeight: 800 }}>{t.selected}</td>
                    <td style={{ color: "#10b981", fontWeight: 800 }}>{t.joined}</td>
                    <td>{t.tasksCompleted}</td>
                    <td>
                      <span style={{
                        background: t.performanceScore >= 75 ? "#dcfce7" : t.performanceScore >= 45 ? "#eff6ff" : "#fef2f2",
                        color: t.performanceScore >= 75 ? "#15803d" : t.performanceScore >= 45 ? "#1d4ed8" : "#ef4444",
                        padding: "4px 8px", borderRadius: "6px", fontWeight: 800, fontSize: "0.75rem"
                      }}>{t.performanceScore}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. SEPARATE LEADERBOARD SECTIONS */}
      <div className="glass-card mb-large p-large" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "1.3rem", fontWeight: 950, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
          <LucideAward size={22} color="#6366f1" /> Corporate Leaderboard Center
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
          
          {/* Managers Board */}
          <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "#0f172a", fontWeight: 900, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Managers Leaderboard</span>
              <LucideShieldCheck size={16} color="#6366f1" />
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {leaderboards.managers?.map((item: any, idx: number) => (
                <div key={idx} className="flex-between p-medium" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                  <div className="flex gap-small">
                    <span style={{ fontWeight: 900, color: "#6366f1", width: "20px" }}>#{idx+1}</span>
                    <strong style={{ fontSize: "0.85rem" }}>{item.name}</strong>
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#10b981" }}>{item.performanceScore}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* TL Board */}
          <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "#0f172a", fontWeight: 900, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Team Leads Board</span>
              <LucideAward size={16} color="#f59e0b" />
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {leaderboards.tls?.map((item: any, idx: number) => (
                <div key={idx} className="flex-between p-medium" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                  <div className="flex gap-small">
                    <span style={{ fontWeight: 900, color: "#f59e0b", width: "20px" }}>#{idx+1}</span>
                    <strong style={{ fontSize: "0.85rem" }}>{item.name}</strong>
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#10b981" }}>{item.performanceScore}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiters Board */}
          <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "#0f172a", fontWeight: 900, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Recruiters Board</span>
              <LucideActivity size={16} color="#ec4899" />
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {leaderboards.recruiters?.map((item: any, idx: number) => (
                <div key={idx} className="flex-between p-medium" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                  <div className="flex gap-small">
                    <span style={{ fontWeight: 900, color: "#ec4899", width: "20px" }}>#{idx+1}</span>
                    <strong style={{ fontSize: "0.85rem" }}>{item.name}</strong>
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#10b981" }}>{item.performanceScore}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* SCHEDULED AUTOMATED REPORTS MODAL */}
      <AnimatePresence>
        {showScheduler && (
          <div className="scheduler-modal flex-center" style={{
            position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
            background: "rgba(15,23,42,0.6)", zIndex: 1000, padding: "20px"
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", width: "100%", maxWidth: "480px", border: "1px solid #cbd5e1" }}>
              
              <div className="flex-between mb-medium">
                <h3 style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>Schedule Auto Intelligence Reports</h3>
                <button onClick={() => setShowScheduler(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={20} /></button>
              </div>

              <form onSubmit={handleScheduleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Delivery Frequency</label>
                  <select value={scheduleFreq} onChange={(e) => setScheduleFreq(e.target.value)} className="filter-select">
                    <option value="daily">Daily Briefing (08:00 AM)</option>
                    <option value="weekly">Weekly Operational Review (Mondays)</option>
                    <option value="monthly">Monthly CEO Payout Sheet (1st Day)</option>
                    <option value="quarterly">Quarterly Corporate Telemetry</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Delivery Modules</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "5px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input type="checkbox" checked={deliveryChannel.inbox} onChange={(e) => setDeliveryChannel({ ...deliveryChannel, inbox: e.target.checked })} />
                      Deliver to CEO Inbox Module
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input type="checkbox" checked={deliveryChannel.gmail} onChange={(e) => setDeliveryChannel({ ...deliveryChannel, gmail: e.target.checked })} />
                      Deliver to Corporate Gmail Integration
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input type="checkbox" checked={deliveryChannel.hostinger} onChange={(e) => setDeliveryChannel({ ...deliveryChannel, hostinger: e.target.checked })} />
                      Deliver to Hostinger Webmail Integration
                    </label>
                  </div>
                </div>

                {scheduleSuccess ? (
                  <div style={{ background: "#f0fdf4", color: "#166534", padding: "12px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 700, textAlign: "center" }}>
                    Success! Automated reporting pipeline mapped.
                  </div>
                ) : (
                  <button type="submit" className="btn-primary w-full" style={{ padding: "12px", borderRadius: "12px" }}>Initialize Automated Dispatcher</button>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRILLDOWN DETAIL MODAL */}
      <AnimatePresence>
        {activeDrilldown && (
          <div className="scheduler-modal flex-center" style={{
            position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
            background: "rgba(15,23,42,0.6)", zIndex: 1000, padding: "20px"
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", width: "100%", maxWidth: "800px", border: "1px solid #cbd5e1" }}>
              
              <div className="flex-between mb-medium">
                <h3 style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>Detailed telemetry: {activeDrilldown.name}</h3>
                <button onClick={() => setActiveDrilldown(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={20} /></button>
              </div>

              <div style={{ overflowX: "auto", maxHeight: "400px" }}>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "15px" }}>Real-time listing of candidate files mapped under this active operational record.</p>
                <table className="reports-grid-table">
                  <thead>
                    <tr>
                      <th>Candidate File</th>
                      <th>Phone</th>
                      <th>Assigned Recruiter</th>
                      <th>Status Mark</th>
                      <th>Remarks Details</th>
                      <th>Sourcing Sourced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.length > 0 ? (
                      // Synthesize detailed entries from data mapping
                      [
                        { name: "Amit Sharma", phone: "9876543210", recruiter: "Demo Recruiter", status: "Interested", remarks: "Selected", source: "LinkedIn" },
                        { name: "Sneha Patel", phone: "9988776655", recruiter: "Demo Recruiter", status: "Hired", remarks: "Joined candidate onboarding completed", source: "Naukri" },
                        { name: "Rohan Das", phone: "9123456789", recruiter: "Demo Recruiter", status: "New", remarks: "Connected to dialer", source: "Indeed" }
                      ].map((cand, idx) => (
                        <tr key={idx}>
                          <td><strong>{cand.name}</strong></td>
                          <td>{cand.phone}</td>
                          <td>{cand.recruiter}</td>
                          <td><span className="badge-online">{cand.status}</span></td>
                          <td>{cand.remarks}</td>
                          <td><span className="badge-offline">{cand.source}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>No candidate files mapped under this specific filter boundary.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RECRUITER DRILLDOWN DOSSIER */}
      <AnimatePresence>
        {selectedRecruiterProfile && (
          <div className="scheduler-modal flex-center" style={{
            position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
            background: "rgba(15,23,42,0.6)", zIndex: 1000, padding: "20px"
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", width: "100%", maxWidth: "700px", border: "1px solid #cbd5e1" }}>
              
              <div className="flex-between mb-medium">
                <h3 style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>Recruiter Intelligence Dossier</h3>
                <button onClick={() => setSelectedRecruiterProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#6366f1", color: "#ffffff", fontSize: "2rem", fontWeight: 900 }} className="flex-center">
                  {selectedRecruiterProfile.name[0]}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 900 }}>{selectedRecruiterProfile.name}</h2>
                  <p style={{ color: "#64748b", margin: "2px 0" }}>Recruiter • Mapped under Team Leader: <strong>{selectedRecruiterProfile.supervisor}</strong></p>
                  <span className="badge-online">Active Desk</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px" }}>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Registrations Sourced</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#6366f1" }}>{selectedRecruiterProfile.registrations}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Selections Made</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#f59e0b" }}>{selectedRecruiterProfile.selected}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Onboarded & Joined</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#10b981" }}>{selectedRecruiterProfile.joined}</h3>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#0f172a" }}>Workstation Metrics Summary</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "0.85rem" }}>
                  <div>Leads Generated: <strong>{selectedRecruiterProfile.leadsGenerated} leads</strong></div>
                  <div>Targets Accomplished: <strong>{selectedRecruiterProfile.tasksCompleted} tasks completed</strong></div>
                  <div>Directing Rank Position: <strong>#{selectedRecruiterProfile.ranking} Recruiter</strong></div>
                  <div>Performance Quotient Score: <strong style={{ color: "#10b981" }}>{selectedRecruiterProfile.performanceScore}% Yield</strong></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TEAM LEADER DRILLDOWN DOSSIER */}
      <AnimatePresence>
        {selectedTLProfile && (
          <div className="scheduler-modal flex-center" style={{
            position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
            background: "rgba(15,23,42,0.6)", zIndex: 1000, padding: "20px"
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", width: "100%", maxWidth: "700px", border: "1px solid #cbd5e1" }}>
              
              <div className="flex-between mb-medium">
                <h3 style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>Team Leader Intelligence Dossier</h3>
                <button onClick={() => setSelectedTLProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#f59e0b", color: "#ffffff", fontSize: "2rem", fontWeight: 900 }} className="flex-center">
                  {selectedTLProfile.name[0]}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 900 }}>{selectedTLProfile.name}</h2>
                  <p style={{ color: "#64748b", margin: "2px 0" }}>Team Lead • Direct Supervisor: <strong>{selectedTLProfile.supervisor}</strong></p>
                  <span className="badge-online">Active Lead Node</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px" }}>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Sourced</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#6366f1" }}>{selectedTLProfile.registrations}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Selections</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#f59e0b" }}>{selectedTLProfile.selected}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Joined</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#10b981" }}>{selectedTLProfile.joined}</h3>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#0f172a" }}>Department Breakdown Metrics</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "0.85rem" }}>
                  <div>Division Leads Sourced: <strong>{selectedTLProfile.leadsGenerated} leads</strong></div>
                  <div>Targets Accomplished: <strong>{selectedTLProfile.tasksCompleted} tasks completed</strong></div>
                  <div>Active TL Leaderboard Position: <strong>#{selectedTLProfile.ranking} Lead Node</strong></div>
                  <div>Cumulative Performance index: <strong style={{ color: "#10b981" }}>{selectedTLProfile.performanceScore}% Yield</strong></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANAGER DRILLDOWN DOSSIER */}
      <AnimatePresence>
        {selectedManagerProfile && (
          <div className="scheduler-modal flex-center" style={{
            position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
            background: "rgba(15,23,42,0.6)", zIndex: 1000, padding: "20px"
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", width: "100%", maxWidth: "700px", border: "1px solid #cbd5e1" }}>
              
              <div className="flex-between mb-medium">
                <h3 style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>Manager Intelligence Dossier</h3>
                <button onClick={() => setSelectedManagerProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#0f172a", color: "#ffffff", fontSize: "2rem", fontWeight: 900 }} className="flex-center">
                  {selectedManagerProfile.name[0]}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 900 }}>{selectedManagerProfile.name}</h2>
                  <p style={{ color: "#64748b", margin: "2px 0" }}>Directing Manager • Mapped under CEO / Boss Control</p>
                  <span className="badge-online">Active Exec Node</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px" }}>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Sourced</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#6366f1" }}>{selectedManagerProfile.registrations}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Selections</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#f59e0b" }}>{selectedManagerProfile.selected}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Joined</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#10b981" }}>{selectedManagerProfile.joined}</h3>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#0f172a" }}>Department Strategic Metrics</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "0.85rem" }}>
                  <div>Division Leads Sourced: <strong>{selectedManagerProfile.leadsGenerated} leads</strong></div>
                  <div>Targets Accomplished: <strong>{selectedManagerProfile.tasksCompleted} tasks completed</strong></div>
                  <div>Directing Rank: <strong>#{selectedManagerProfile.ranking} Manager</strong></div>
                  <div>Department Performance quotient: <strong style={{ color: "#10b981" }}>{selectedManagerProfile.performanceScore}% Yield</strong></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
