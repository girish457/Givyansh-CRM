import React, { useState, useEffect, useMemo } from "react";
import {
  LucideUsers,
  LucideTrendingUp,
  LucideBriefcase,
  LucideBuilding2,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucideClock,
  LucideRefreshCw,
  LucideActivity,
  LucideZap,
  LucideTarget,
  LucideAward,
  LucideTrophy,
  LucideFlame,
  LucideChevronRight,
  LucideShieldCheck,
  LucideCalendar,
  LucideBanknote,
  LucideGift,
  LucideSearch,
  LucideFilter,
  LucideListTodo,
  LucideClipboardList,
  LucidePhone,
  LucideLoader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

interface ManagerDashboardHomeProps {
  userProfile: any;
}

export default function ManagerDashboardHome({ userProfile }: ManagerDashboardHomeProps) {
  const [team, setTeam] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMonitoring, setTeamMonitoring] = useState<any>(null);
  const [attendanceHub, setAttendanceHub] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [recruiterSearch, setRecruiterSearch] = useState("");
  const [recruiterFilter, setRecruiterFilter] = useState("all");
  const [selectedTL, setSelectedTL] = useState<string>("all");
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"today" | "7days" | "monthly">("today");
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    const iv = setInterval(() => setLiveSeconds(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const fetchAllData = async () => {
    try {
      const [teamRes, candRes, clientRes, jobRes, vendorRes, taskRes, monRes] = await Promise.all([
        fetch("/api/team"),
        fetch("/api/candidates"),
        fetch("/api/clients").catch(() => null),
        fetch("/api/jobs").catch(() => null),
        fetch("/api/vendors").catch(() => null),
        fetch("/api/tasks").catch(() => null),
        fetch("/api/tl/team-monitoring").catch(() => null)
      ]);
      if (teamRes.ok) setTeam(await teamRes.json());
      if (candRes.ok) setCandidates(await candRes.json());
      if (clientRes?.ok) setClients(await clientRes.json());
      if (jobRes?.ok) setJobs(await jobRes.json());
      if (vendorRes?.ok) setVendors(await vendorRes.json());
      if (taskRes?.ok) setTasks(await taskRes.json());
      if (monRes?.ok) setTeamMonitoring(await monRes.json());
    } catch (e) {
      console.error("Manager Dashboard fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 12000);
    return () => clearInterval(interval);
  }, []);

  const managerId = userProfile?.id || userProfile?.userId;

  const myTLs = useMemo(() =>
    team.filter(t => t.role === "tl" && (t.reportingTo === managerId || t.reportingTo === null)),
    [team, managerId]
  );

  const myTLIds = useMemo(() => myTLs.map(t => t.id), [myTLs]);

  const myRecruiters = useMemo(() =>
    team.filter(t => t.role === "recruiter" && (
      t.reportingTo === managerId ||
      (t.reportingTo !== null && myTLIds.includes(t.reportingTo))
    )),
    [team, managerId, myTLIds]
  );

  const allSubordinates = useMemo(() => [...myTLs, ...myRecruiters], [myTLs, myRecruiters]);

  const toLocalDateStr = (d: any) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  };

  // Real candidate stats per recruiter
  const recruiterPerf = useMemo(() => {
    const map: Record<number, {
      total: number; today: number; selected: number; joined: number;
      interviews: number; leads: number; interested: number;
    }> = {};

    allSubordinates.forEach(m => {
      map[m.id] = { total: 0, today: 0, selected: 0, joined: 0, interviews: 0, leads: 0, interested: 0 };
    });

    candidates.forEach(c => {
      const eid = c.createdBy || c.addedBy || c.recruiterId;
      if (!eid || !map[eid]) return;
      const p = map[eid];
      p.total += 1;
      const ds = toLocalDateStr(c.sourcingDate || c.createdAt);
      if (ds === todayStr) p.today += 1;

      if (isCandidateMatch(c, "selected")) p.selected += 1;
      if (isCandidateMatch(c, "joined")) p.joined += 1;
      if (isCandidateMatch(c, "go for interview")) p.interviews += 1;
      if (isCandidateMatch(c, "interested")) p.interested += 1;
    });

    return map;
  }, [candidates, allSubordinates, todayStr]);

  // TL aggregated perf (sum of their recruiters)
  const tlPerf = useMemo(() => {
    const map: Record<number, { selections: number; joinings: number; sourced: number; recruiterCount: number }> = {};
    myTLs.forEach(tl => {
      const subIds = team.filter(t => t.reportingTo === tl.id).map(t => t.id);
      let selections = 0, joinings = 0, sourced = 0;
      subIds.forEach(sid => {
        const p = recruiterPerf[sid];
        if (p) { selections += p.selected; joinings += p.joined; sourced += p.total; }
      });
      map[tl.id] = { selections, joinings, sourced, recruiterCount: subIds.length };
    });
    return map;
  }, [myTLs, team, recruiterPerf]);

  // Totals
  const totals = useMemo(() => {
    let totalSourced = 0, todaySourced = 0, totalSelected = 0, totalJoined = 0, totalInterviews = 0;
    myRecruiters.forEach(r => {
      const p = recruiterPerf[r.id];
      if (p) {
        totalSourced += p.total;
        todaySourced += p.today;
        totalSelected += p.selected;
        totalJoined += p.joined;
        totalInterviews += p.interviews;
      }
    });
    const activeJobs = jobs.filter(j => (j.status || "").toLowerCase() === "active").length;
    const activeClients = clients.filter(c => (c.status || "").toLowerCase() === "active").length;
    const totalTasksDue = tasks.filter(t => {
      const s = (t.status || "").toLowerCase();
      return s !== "completed" && s !== "cancelled";
    }).length;
    const overdueTasks = tasks.filter(t => {
      if ((t.status || "").toLowerCase() === "completed") return false;
      const created = new Date(t.createdAt || t.date || Date.now());
      const dur = t.duration || "today";
      let deadline = new Date(created);
      if (dur === "today") deadline.setHours(23, 59, 59, 999);
      else if (dur === "this_week") { const d = deadline.getDay(); deadline.setDate(deadline.getDate() - d + 7); deadline.setHours(23, 59, 59); }
      else if (dur === "custom" && t.customEndDate) deadline = new Date(t.customEndDate);
      return new Date() > deadline;
    }).length;
    const companyId = userProfile?.companyId || "default";
    const actionsKey = `fast_rms_incentive_actions_v1_${companyId}`;

    const approvedIncentives = (JSON.parse(localStorage.getItem(actionsKey) || "[]") as any[])
      .filter((a: any) => a.status === "Approved")
      .reduce((sum: number, a: any) => sum + (a.actualAmount || 0), 0);

    const pendingApprovals = (JSON.parse(localStorage.getItem(actionsKey) || "[]") as any[])
      .filter((a: any) => a.status === "Pending").length;

    return {
      totalSourced, todaySourced, totalSelected, totalJoined, totalInterviews,
      totalRecruiters: myRecruiters.length,
      totalTLs: myTLs.length,
      activeJobs, activeClients, totalTasksDue, overdueTasks,
      approvedIncentives, pendingApprovals,
      conversionRate: totalSelected > 0 ? Math.round((totalJoined / totalSelected) * 100) : 0
    };
  }, [recruiterPerf, myRecruiters, myTLs, jobs, clients, tasks]);

  // Monitor live: use teamMonitoring if available, else build from team
  const liveTeamList = useMemo(() => {
    const monitorList = teamMonitoring?.teamList || [];
    return myRecruiters.map(r => {
      const mon = monitorList.find((m: any) => m.id === r.id);
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        reportingTo: r.reportingTo,
        status: mon?.status || "Offline",
        loginTime: mon?.loginTime || null,
        workedMins: mon?.workedMins || 0,
        breakMins: mon?.breakMins || 0,
        perf: recruiterPerf[r.id] || { total: 0, today: 0, selected: 0, joined: 0, interviews: 0, leads: 0, interested: 0 }
      };
    });
  }, [myRecruiters, teamMonitoring, recruiterPerf]);

  const filteredLiveTeam = useMemo(() => {
    return liveTeamList.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(recruiterSearch.toLowerCase());
      if (!matchSearch) return false;

      if (selectedTL !== "all") {
        const tlId = parseInt(selectedTL);
        if (r.reportingTo !== tlId) return false;
      }

      if (recruiterFilter === "online") return r.status === "Working" || r.status === "Online";
      if (recruiterFilter === "break") return r.status.includes("Break") || r.status === "On Break";
      if (recruiterFilter === "offline") return r.status === "Offline";
      return true;
    });
  }, [liveTeamList, recruiterSearch, recruiterFilter, selectedTL]);

  const presenceCount = useMemo(() => {
    const present = liveTeamList.filter(r => r.loginTime && r.loginTime !== "N/A").length;
    return { present, absent: liveTeamList.length - present };
  }, [liveTeamList]);

  // Leaderboard
  const leaderboard = useMemo(() => {
    return [...myRecruiters].map(r => {
      const p = recruiterPerf[r.id] || { total: 0, today: 0, selected: 0, joined: 0, interviews: 0 };
      const score =
        (p.selected * 30) +
        (p.joined * 50) +
        (p.interviews * 15) +
        (p.today * 5) +
        (p.total * 2);
      return { id: r.id, name: r.name, score, ...p };
    }).sort((a, b) => b.score - a.score).slice(0, 10);
  }, [myRecruiters, recruiterPerf]);

  // TL Performance
  const tlLeaderboard = useMemo(() => {
    return myTLs.map(tl => {
      const p = tlPerf[tl.id] || { selections: 0, joinings: 0, sourced: 0, recruiterCount: 0 };
      return { id: tl.id, name: tl.name, ...p };
    }).sort((a, b) => b.joinings - a.joinings);
  }, [myTLs, tlPerf]);

  // Critical alerts
  const criticalAlerts = useMemo(() => {
    const alerts: { type: string; msg: string; color: string }[] = [];
    if (totals.overdueTasks > 0) alerts.push({ type: "warning", msg: `${totals.overdueTasks} task(s) are overdue`, color: "#ef4444" });
    if (presenceCount.absent > presenceCount.present && liveTeamList.length > 0) alerts.push({ type: "warning", msg: `${presenceCount.absent} recruiters are absent today`, color: "#f59e0b" });
    if (totals.pendingApprovals > 0) alerts.push({ type: "info", msg: `${totals.pendingApprovals} incentive approval(s) pending`, color: "#3b82f6" });
    const zeroPerformers = myRecruiters.filter(r => recruiterPerf[r.id]?.today === 0);
    if (zeroPerformers.length > 0) alerts.push({ type: "warning", msg: `${zeroPerformers.length} recruiters have 0 sourcing today`, color: "#f59e0b" });
    return alerts;
  }, [totals, presenceCount, myRecruiters, recruiterPerf, liveTeamList]);

  const formatTime = (mins: number) => {
    if (!mins || mins <= 0) return "0h 0m";
    return `${Math.floor(mins / 60)}h ${Math.floor(mins % 60)}m`;
  };

  const pct = (v: number, max: number) => Math.min(100, max > 0 ? Math.round((v / max) * 100) : 0);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Dashboard...</span>
      </div>
    );
  }

  const kpiCards = [
    { label: "Team Recruiters", value: totals.totalRecruiters, sub: `${presenceCount.present} Present Today`, icon: <LucideUsers size={18} />, color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
    { label: "Team Leads (TLs)", value: totals.totalTLs, sub: `${myTLs.map(t => t.name.split(" ")[0]).slice(0,2).join(", ") || "—"}`, icon: <LucideShieldCheck size={18} />, color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
    { label: "Sourced Today", value: totals.todaySourced, sub: `Total: ${totals.totalSourced}`, icon: <LucideActivity size={18} />, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
    { label: "Selections", value: totals.totalSelected, sub: `Joinings: ${totals.totalJoined}`, icon: <LucideCheckCircle2 size={18} />, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    { label: "Active Jobs", value: totals.activeJobs, sub: `${jobs.length} Total`, icon: <LucideBriefcase size={18} />, color: "#06b6d4", bg: "rgba(6,182,212,0.08)" },
    { label: "Active Clients", value: totals.activeClients, sub: `${clients.length} Total`, icon: <LucideBuilding2 size={18} />, color: "#ec4899", bg: "rgba(236,72,153,0.08)" },
    { label: "Tasks Pending", value: totals.totalTasksDue, sub: `${totals.overdueTasks} Overdue`, icon: <LucideClipboardList size={18} />, color: totals.overdueTasks > 0 ? "#ef4444" : "#64748b", bg: totals.overdueTasks > 0 ? "rgba(239,68,68,0.08)" : "rgba(100,116,139,0.08)" },
    { label: "Incentives Paid", value: `₹${totals.approvedIncentives >= 1000 ? (totals.approvedIncentives / 1000).toFixed(1) + "K" : totals.approvedIncentives}`, sub: `${totals.pendingApprovals} Pending Approvals`, icon: <LucideBanknote size={18} />, color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  ];

  return (
    <div style={{ padding: "0.85rem 1rem", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', 'Outfit', sans-serif", color: "#0f172a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .mgr-card { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 0.75rem 0.9rem; transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .mgr-card:hover { border-color: #cbd5e1; box-shadow: 0 6px 20px rgba(0,0,0,0.06); transform: translateY(-1px); }
        .mgr-section-header { font-size: 0.72rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 0.65rem; display: flex; align-items: center; gap: 6px; }
        .mgr-badge { padding: 2px 7px; border-radius: 4px; font-size: 0.58rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .mgr-filter-btn { padding: 3px 8px; border-radius: 5px; font-size: 0.62rem; font-weight: 700; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; cursor: pointer; transition: all 0.15s; }
        .mgr-filter-btn.active { background: #3b82f6; border-color: #3b82f6; color: #fff; }
        .mgr-status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .mgr-progress-bar { height: 4px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
        .mgr-progress-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
        .mgr-input { border: 1.5px solid #e2e8f0; border-radius: 7px; padding: 5px 10px; font-size: 0.72rem; outline: none; background: #fff; color: #0f172a; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
        .mgr-input:focus { border-color: #3b82f6; }
        .alert-row { padding: 6px 10px; border-radius: 7px; font-size: 0.68rem; font-weight: 600; display: flex; align-items: center; gap: 6px; border: 1px solid; margin-bottom: 5px; }
        @keyframes pulse-dot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }
        .live-dot { animation: pulse-dot 1.8s ease infinite; }
        .rank-badge { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 900; flex-shrink: 0; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem", flexWrap: "wrap", gap: 8 }}>
        <div />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.65rem", color: "#10b981", fontWeight: 700 }}>
            <span className="mgr-status-dot live-dot" style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            Live
          </span>
          <button onClick={fetchAllData} className="mgr-filter-btn active" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <LucideRefreshCw size={11} /> Refresh
          </button>
        </div>
      </div>

      {/* CRITICAL ALERTS */}
      {criticalAlerts.length > 0 && (
        <div className="mgr-card" style={{ marginBottom: "0.75rem", padding: "0.6rem 0.8rem" }}>
          <div className="mgr-section-header"><LucideAlertTriangle size={12} /> Attention Required</div>
          {criticalAlerts.map((a, i) => (
            <div key={i} className="alert-row" style={{ background: `${a.color}10`, borderColor: `${a.color}30`, color: a.color }}>
              <LucideAlertTriangle size={11} /> {a.msg}
            </div>
          ))}
        </div>
      )}

      {/* KPI CARDS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.6rem", marginBottom: "0.85rem" }}>
        {kpiCards.map((k, i) => (
          <motion.div key={i} className="mgr-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ background: k.bg, color: k.color, width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#0f172a", lineHeight: 1.1 }}>{k.value}</div>
              <div style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600, marginTop: 1 }}>{k.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MAIN GRID: LEFT = Live Team | RIGHT = Leaderboard + TL Performance */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>

        {/* === LIVE TEAM MONITOR === */}
        <div className="mgr-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
            <div className="mgr-section-header" style={{ marginBottom: 0 }}>
              <span className="mgr-status-dot live-dot" style={{ background: "#10b981", boxShadow: "0 0 5px #10b981" }} />
              Live Recruiter Monitor
              <span className="mgr-badge" style={{ background: "rgba(16,185,129,0.08)", color: "#10b981" }}>{presenceCount.present} Online</span>
              <span className="mgr-badge" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>{presenceCount.absent} Absent</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["all", "online", "break", "offline"].map(f => (
                <button key={f} className={`mgr-filter-btn${recruiterFilter === f ? " active" : ""}`} onClick={() => setRecruiterFilter(f)}>
                  {f === "all" ? "All" : f === "online" ? "Working" : f === "break" ? "Break" : "Offline"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: "0.5rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <LucideSearch size={12} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input className="mgr-input" style={{ paddingLeft: 26 }} placeholder="Search recruiter…" value={recruiterSearch} onChange={e => setRecruiterSearch(e.target.value)} />
            </div>
            <select className="mgr-input" style={{ width: "auto", flex: "0 0 auto" }} value={selectedTL} onChange={e => setSelectedTL(e.target.value)}>
              <option value="all">All TLs</option>
              {myTLs.map(tl => <option key={tl.id} value={tl.id}>{tl.name.split(" ")[0]}'s Team</option>)}
            </select>
          </div>

          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {filteredLiveTeam.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.72rem", padding: "20px 0" }}>No recruiters found</div>
            ) : filteredLiveTeam.map((r, i) => {
              const isOnline = r.status === "Working" || r.status === "Online";
              const isBreak = r.status.includes("Break") || r.status === "On Break";
              const dotColor = isOnline ? "#10b981" : isBreak ? "#f59e0b" : "#94a3b8";
              const tlName = myTLs.find(t => t.id === r.reportingTo)?.name?.split(" ")[0] || "Direct";
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, marginBottom: 4, background: i % 2 === 0 ? "#f8fafc" : "#fff", border: "1px solid #f1f5f9" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${dotColor}15`, color: dotColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 900, flexShrink: 0 }}>
                    {r.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: "0.73rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
                      <span className="mgr-status-dot" style={{ background: dotColor, boxShadow: isOnline ? `0 0 5px ${dotColor}` : "none", flexShrink: 0 }} />
                    </div>
                    <div style={{ fontSize: "0.58rem", color: "#94a3b8", fontWeight: 600 }}>TL: {tlName} · Worked: {formatTime(r.workedMins)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 900, color: "#3b82f6" }}>{r.perf.today}</div>
                      <div style={{ fontSize: "0.52rem", color: "#94a3b8", fontWeight: 700 }}>Today</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 900, color: "#f59e0b" }}>{r.perf.selected}</div>
                      <div style={{ fontSize: "0.52rem", color: "#94a3b8", fontWeight: 700 }}>Select</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 900, color: "#10b981" }}>{r.perf.joined}</div>
                      <div style={{ fontSize: "0.52rem", color: "#94a3b8", fontWeight: 700 }}>Join</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* === RIGHT SIDE: LEADERBOARD + TL PERF === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>

          {/* Recruiter Leaderboard */}
          <div className="mgr-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <div className="mgr-section-header" style={{ marginBottom: 0 }}><LucideTrophy size={12} color="#f59e0b" /> Top Recruiters</div>
              <div style={{ display: "flex", gap: 4 }}>
                {(["today", "7days", "monthly"] as const).map(p => (
                  <button key={p} className={`mgr-filter-btn${leaderboardPeriod === p ? " active" : ""}`} onClick={() => setLeaderboardPeriod(p)}>
                    {p === "today" ? "Today" : p === "7days" ? "7D" : "Month"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {leaderboard.length === 0 ? (
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.72rem", padding: "15px 0" }}>No data yet</div>
              ) : leaderboard.map((r, i) => {
                const rankColors = ["#f59e0b", "#94a3b8", "#cd7c43"];
                const maxScore = leaderboard[0]?.score || 1;
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    <div className="rank-badge" style={{ background: i < 3 ? `${rankColors[i]}20` : "#f1f5f9", color: i < 3 ? rankColors[i] : "#94a3b8" }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "70%" }}>{r.name}</span>
                        <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#3b82f6" }}>{r.selected}S / {r.joined}J</span>
                      </div>
                      <div className="mgr-progress-bar">
                        <div className="mgr-progress-fill" style={{ width: `${pct(r.score, maxScore)}%`, background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c43" : "#3b82f6" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TL Performance */}
          <div className="mgr-card" style={{ flex: 1 }}>
            <div className="mgr-section-header"><LucideShieldCheck size={12} color="#8b5cf6" /> TL Performance</div>
            {tlLeaderboard.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.72rem", padding: "12px 0" }}>No TLs assigned</div>
            ) : tlLeaderboard.map((tl, i) => {
              const maxJ = tlLeaderboard[0]?.joinings || 1;
              return (
                <div key={tl.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0f172a" }}>{tl.name}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: "0.6rem", color: "#64748b" }}>{tl.recruiterCount} rec</span>
                      <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#10b981" }}>{tl.joinings}J</span>
                      <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#f59e0b" }}>{tl.selections}S</span>
                    </div>
                  </div>
                  <div className="mgr-progress-bar">
                    <div className="mgr-progress-fill" style={{ width: `${pct(tl.joinings, maxJ)}%`, background: "linear-gradient(90deg, #8b5cf6, #6d28d9)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM GRID: Jobs Health | Client Status | Tasks Overview | Conversion Funnel */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.7rem" }}>

        {/* Jobs Health */}
        <div className="mgr-card">
          <div className="mgr-section-header"><LucideBriefcase size={12} color="#06b6d4" /> Jobs Pipeline Health</div>
          {jobs.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: "0.72rem", textAlign: "center", padding: "10px 0" }}>No jobs data</div>
          ) : (() => {
            const activeJ = jobs.filter(j => (j.status || "").toLowerCase() === "active").length;
            const closedJ = jobs.filter(j => (j.status || "").toLowerCase() === "closed" || (j.status || "").toLowerCase() === "filled").length;
            const urgentJ = jobs.filter(j => (j.priority || "").toLowerCase() === "urgent" || (j.priority || "").toLowerCase() === "high").length;
            const total = jobs.length;
            return (
              <div>
                {[
                  { label: "Active", val: activeJ, color: "#10b981", pctV: pct(activeJ, total) },
                  { label: "Filled / Closed", val: closedJ, color: "#94a3b8", pctV: pct(closedJ, total) },
                  { label: "Urgent / High Priority", val: urgentJ, color: "#ef4444", pctV: pct(urgentJ, total) },
                ].map((row, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: "0.67rem", fontWeight: 600, color: "#64748b" }}>{row.label}</span>
                      <span style={{ fontSize: "0.7rem", fontWeight: 800, color: row.color }}>{row.val} <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.6rem" }}>/ {total}</span></span>
                    </div>
                    <div className="mgr-progress-bar">
                      <div className="mgr-progress-fill" style={{ width: `${row.pctV}%`, background: row.color }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Client Health */}
        <div className="mgr-card">
          <div className="mgr-section-header"><LucideBuilding2 size={12} color="#ec4899" /> Client Engagement</div>
          {clients.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: "0.72rem", textAlign: "center", padding: "10px 0" }}>No clients data</div>
          ) : (() => {
            const activeC = clients.filter(c => (c.status || "").toLowerCase() === "active").length;
            const inactiveC = clients.filter(c => (c.status || "").toLowerCase() === "inactive").length;
            const pendingC = clients.filter(c => (c.status || "").toLowerCase() === "pending").length;
            const total = clients.length;
            return (
              <div>
                {[
                  { label: "Active Clients", val: activeC, color: "#ec4899", pctV: pct(activeC, total) },
                  { label: "Inactive", val: inactiveC, color: "#94a3b8", pctV: pct(inactiveC, total) },
                  { label: "Pending Onboarding", val: pendingC, color: "#f59e0b", pctV: pct(pendingC, total) },
                ].map((row, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: "0.67rem", fontWeight: 600, color: "#64748b" }}>{row.label}</span>
                      <span style={{ fontSize: "0.7rem", fontWeight: 800, color: row.color }}>{row.val} <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.6rem" }}>/ {total}</span></span>
                    </div>
                    <div className="mgr-progress-bar">
                      <div className="mgr-progress-fill" style={{ width: `${row.pctV}%`, background: row.color }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Conversion Funnel */}
        <div className="mgr-card">
          <div className="mgr-section-header"><LucideTrendingUp size={12} color="#3b82f6" /> Recruitment Funnel</div>
          {(() => {
            const funnel = [
              { label: "Total Sourced", val: totals.totalSourced, color: "#3b82f6" },
              { label: "Interviews", val: totals.totalInterviews, color: "#8b5cf6" },
              { label: "Selections", val: totals.totalSelected, color: "#f59e0b" },
              { label: "Joinings", val: totals.totalJoined, color: "#10b981" },
            ];
            const maxF = funnel[0].val || 1;
            return (
              <div>
                {funnel.map((row, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: "0.67rem", fontWeight: 600, color: "#64748b" }}>{row.label}</span>
                      <span style={{ fontSize: "0.7rem", fontWeight: 800, color: row.color }}>{row.val}</span>
                    </div>
                    <div className="mgr-progress-bar">
                      <div className="mgr-progress-fill" style={{ width: `${pct(row.val, maxF)}%`, background: row.color }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: "6px 10px", background: totals.conversionRate >= 50 ? "rgba(16,185,129,0.07)" : "rgba(245,158,11,0.07)", borderRadius: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}>Selection → Joining Rate</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 900, color: totals.conversionRate >= 50 ? "#10b981" : "#f59e0b" }}>{totals.conversionRate}%</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Tasks Snapshot */}
        <div className="mgr-card">
          <div className="mgr-section-header"><LucideListTodo size={12} color="#64748b" /> Tasks Snapshot</div>
          {tasks.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: "0.72rem", textAlign: "center", padding: "10px 0" }}>No tasks data</div>
          ) : (() => {
            const completed = tasks.filter(t => (t.status || "").toLowerCase() === "completed").length;
            const pending = tasks.filter(t => (t.status || "").toLowerCase() !== "completed" && (t.status || "").toLowerCase() !== "cancelled").length;
            const overdue = totals.overdueTasks;
            const total = tasks.length;
            return (
              <div>
                {[
                  { label: "Completed", val: completed, color: "#10b981", pctV: pct(completed, total) },
                  { label: "In Progress / Pending", val: pending, color: "#3b82f6", pctV: pct(pending, total) },
                  { label: "Overdue", val: overdue, color: "#ef4444", pctV: pct(overdue, total) },
                ].map((row, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: "0.67rem", fontWeight: 600, color: "#64748b" }}>{row.label}</span>
                      <span style={{ fontSize: "0.7rem", fontWeight: 800, color: row.color }}>{row.val} <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.6rem" }}>/ {total}</span></span>
                    </div>
                    <div className="mgr-progress-bar">
                      <div className="mgr-progress-fill" style={{ width: `${row.pctV}%`, background: row.color }} />
                    </div>
                  </div>
                ))}
                {overdue > 0 && (
                  <div style={{ marginTop: 6, padding: "5px 8px", background: "rgba(239,68,68,0.06)", borderRadius: 6, fontSize: "0.62rem", color: "#ef4444", fontWeight: 700 }}>
                    ⚠ {overdue} task(s) need immediate attention
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
