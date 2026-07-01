import React, { useState, useEffect, useMemo } from "react";
import {
  LucideBanknote,
  LucideTrendingUp,
  LucideCheckCircle2,
  LucideXCircle,
  LucideClock,
  LucideTrophy,
  LucideAward,
  LucideRefreshCw,
  LucideZap,
  LucideSparkles,
  LucideLoader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IncentiveRule {
  id: string;
  name: string;
  type: string;
  criteria: { target: number; reward: number }[];
  timeframe: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom";
  roleScope: "Recruiters" | "TLs" | "Entire Team" | "Specific Recruiters" | "Specific TLs";
  createdAt: string;
  status: "Active" | "Inactive";
  clientId?: string;
  clientName?: string;
  jobId?: string;
  jobTitle?: string;
}

interface IncentiveAction {
  id: string;
  employeeId: number;
  employeeName: string;
  designation: string;
  tlName: string;
  ruleId: string;
  ruleName: string;
  achievement: string;
  calculatedIncentive: number;
  actualAmount: number;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  approvedBy?: string;
}

export default function RecruiterIncentiveTracker() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [rules, setRules] = useState<IncentiveRule[]>([]);
  const [actions, setActions] = useState<IncentiveAction[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Popups State
  const [celebrationPopup, setCelebrationPopup] = useState<any | null>(null);
  const [approvalPopup, setApprovalPopup] = useState<any | null>(null);
  const [selectedIncentiveDetails, setSelectedIncentiveDetails] = useState<any | null>(null);

  useEffect(() => {
    fetchCoreData();
  }, []);

  const fetchCoreData = async () => {
    try {
      setLoading(true);
      const [userRes, candRes, teamRes, clientRes, jobsRes, vendorsRes] = await Promise.all([
        fetch("/api/me"),
        fetch("/api/candidates"),
        fetch("/api/team"),
        fetch("/api/clients").catch(() => null),
        fetch("/api/jobs").catch(() => null),
        fetch("/api/vendors").catch(() => null)
      ]);

      if (userRes.ok && candRes.ok && teamRes.ok) {
        const u = await userRes.json();
        setCurrentUser(u);
        setCandidates(await candRes.json());
        setTeam(await teamRes.json());

        if (clientRes && clientRes.ok) setClients(await clientRes.json());
        if (jobsRes && jobsRes.ok) setJobs(await jobsRes.json());
        if (vendorsRes && vendorsRes.ok) setVendors(await vendorsRes.json());

        const cid = u?.companyId || "default";
        const storedRules = localStorage.getItem(`fast_rms_incentive_rules_v1_${cid}`);
        const activeRules = storedRules ? JSON.parse(storedRules) : [];
        setRules(activeRules);

        const storedActions = localStorage.getItem(`fast_rms_incentive_actions_v1_${cid}`);
        const activeActions = storedActions ? JSON.parse(storedActions) : [];
        setActions(activeActions);

        // Scan popups
        checkForPopups(u, activeActions);
      }
    } catch (err) {
      console.error("Recruiter metrics telemetry failed to load", err);
    } finally {
      setLoading(false);
    }
  };

  const recruiterId = currentUser?.id || currentUser?.userId;

  const checkForPopups = (user: any, activeActions: IncentiveAction[]) => {
    try {
      const cid = user?.companyId || "default";
      const pKey = `fast_rms_acknowledged_popups_v1_${cid}`;
      const acknowledged = JSON.parse(localStorage.getItem(pKey) || "[]");
      const empId = user?.id || user?.userId;

      // Approved Popup
      const unacknowledgedApproved = activeActions.find(act => 
        act.employeeId === empId && 
        act.status === "Approved" && 
        !acknowledged.includes(act.id)
      );

      if (unacknowledgedApproved) {
        setApprovalPopup(unacknowledgedApproved);
        return;
      }

      // Pending Popup
      const myPending = activeActions.find(act => 
        act.employeeId === empId && 
        act.status === "Pending" && 
        !acknowledged.includes(act.id)
      );

      if (myPending) {
        setCelebrationPopup(myPending);
      }
    } catch (err) {
      console.error("Popup check failure", err);
    }
  };

  const dismissCelebration = () => {
    if (celebrationPopup) {
      const cid = currentUser?.companyId || "default";
      const pKey = `fast_rms_acknowledged_popups_v1_${cid}`;
      const acknowledged = JSON.parse(localStorage.getItem(pKey) || "[]");
      acknowledged.push(celebrationPopup.id);
      localStorage.setItem(pKey, JSON.stringify(acknowledged));
      setCelebrationPopup(null);
    }
  };

  const dismissApproval = () => {
    if (approvalPopup) {
      const cid = currentUser?.companyId || "default";
      const pKey = `fast_rms_acknowledged_popups_v1_${cid}`;
      const acknowledged = JSON.parse(localStorage.getItem(pKey) || "[]");
      acknowledged.push(approvalPopup.id);
      localStorage.setItem(pKey, JSON.stringify(acknowledged));
      setApprovalPopup(null);
    }
  };

  // Aggregate Recruiter Metrics
  const stats = useMemo(() => {
    let selections = 0;
    let joinings = 0;
    let interviews = 0;
    let registrations = 0;

    candidates.forEach(c => {
      const isMe = (c.createdBy === recruiterId || c.addedBy === recruiterId || c.recruiterId === recruiterId);
      if (isMe) {
        registrations++;
        const remarks = (c.remarks || "").toLowerCase();
        const status = (c.status || "").toLowerCase();
        const cvStatus = (c.cvStatus || "").toLowerCase();

        if (status === "selected" || remarks.includes("selected") || cvStatus.includes("selected")) {
          selections++;
        }
        if (status === "joined" || remarks.includes("joined") || cvStatus.includes("joined")) {
          joinings++;
        }
        if (status.includes("interview") || remarks.includes("interview") || cvStatus.includes("interview")) {
          interviews++;
        }
      }
    });

    const clientCount = clients.filter(c => c.createdBy === recruiterId || c.addedBy === recruiterId).length;
    const jobCount = jobs.filter(j => j.createdBy === recruiterId || j.addedBy === recruiterId).length;
    const vendorCount = vendors.filter(v => v.createdBy === recruiterId || v.addedBy === recruiterId).length;

    return { selections, joinings, interviews, registrations, clients: clientCount, jobs: jobCount, vendors: vendorCount };
  }, [candidates, clients, jobs, vendors, recruiterId]);

  const goalTracking = useMemo(() => {
    return [
      { name: "Selections Goal", achieved: stats.selections, target: 10, unit: "Selections" },
      { name: "Joinings Goal", achieved: stats.joinings, target: 5, unit: "Joinings" },
      { name: "Interviews Conducted", achieved: stats.interviews, target: 20, unit: "Interviews" },
      { name: "Raw Sourced Profiles", achieved: stats.registrations, target: 50, unit: "Registrations" }
    ];
  }, [stats]);

  const finances = useMemo(() => {
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let lifetime = 0;

    actions.forEach(act => {
      if (act.employeeId === recruiterId) {
        const amt = act.actualAmount || 0;
        lifetime += amt;
        if (act.status === "Approved") approved += amt;
        else if (act.status === "Pending") pending += amt;
        else if (act.status === "Rejected") rejected += amt;
      }
    });

    return { approved, pending, rejected, lifetime };
  }, [actions, recruiterId]);

  const achievements = useMemo(() => {
    return [
      { id: "first_sel", name: "First Selection", desc: "First selected candidate", active: stats.selections >= 1, icon: "🎯" },
      { id: "10_sel", name: "10 Selections", desc: "Complete 10 candidate selections", active: stats.selections >= 10, icon: "🔥" },
      { id: "50_sel", name: "50 Selections", desc: "Superstar Sourcing: 50 selections", active: stats.selections >= 50, icon: "⭐" },
      { id: "first_join", name: "First Placement", desc: "First successful placement", active: stats.joinings >= 1, icon: "🚀" },
      { id: "10_join", name: "10 Joinings", desc: "10 successful placements", active: stats.joinings >= 10, icon: "🏆" },
      { id: "lead_master", name: "Lead Master", desc: "Sourced over 30 registrations", active: stats.registrations >= 30, icon: "🦁" }
    ];
  }, [stats]);

  const rankPosition = useMemo(() => {
    const recruiterEarnings = team.filter(x => x.role === "recruiter").map(r => {
      const sum = actions
        .filter(act => act.employeeId === r.id && act.status === "Approved")
        .reduce((s, a) => s + a.actualAmount, 0);
      return { id: r.id, name: r.name, sum };
    }).sort((a,b) => b.sum - a.sum);

    const index = recruiterEarnings.findIndex(x => x.id === recruiterId);
    return index !== -1 ? index + 1 : 1;
  }, [team, actions, recruiterId]);

  const activeChallenges = useMemo(() => {
    return rules.filter(r => r.status === "Active" && (r.roleScope === "Recruiters" || r.roleScope === "Entire Team"));
  }, [rules]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Incentive Tracker...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 16px", color: "#334155", fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER COMPACT */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>My Incentive </span>
            <span style={{ color: "#2563eb" }}>Tracker</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Track your earned commissions, target achievements, and upcoming payout milestones.</p>
        </div>
        <button 
          onClick={fetchCoreData}
          style={{ border: "1px solid #cbd5e1", background: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
        >
          <LucideRefreshCw size={12} /> Sync Live
        </button>
      </div>

      {/* METRIC CARDS COMPACT */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px" }}>
        {[
          { title: "Approved Released", val: `₹${finances.approved.toLocaleString()}`, color: "#16a34a", bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "#bbf7d0", desc: "Credited earnings" },
          { title: "Pending Approval", val: `₹${finances.pending.toLocaleString()}`, color: "#d97706", bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", border: "#fde68a", desc: "Under manager check" },
          { title: "Rejected Claims", val: `₹${finances.rejected.toLocaleString()}`, color: "#dc2626", bg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)", border: "#fecaca", desc: "Unmatched metrics" },
          { title: "Lifetime Earnings", val: `₹${finances.lifetime.toLocaleString()}`, color: "#7e22ce", bg: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)", border: "#e9d5ff", desc: "Accrued career payout" }
        ].map((card, i) => (
          <div key={i} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: "10px", padding: "8px 10px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", letterSpacing: "0.2px" }}>{card.title}</span>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: card.color, marginTop: "2px", display: "block" }}>{card.val}</span>
            <span style={{ fontSize: "0.6rem", color: "#64748b", display: "block", marginTop: "1px" }}>{card.desc}</span>
          </div>
        ))}
      </div>

      {/* TWO COLUMN PANEL */}
      <div style={{ display: "grid", gridTemplateColumns: "2.3fr 1fr", gap: "10px" }}>
        
        <div>
          {/* Live Progress goals */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 12px", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", display: "block", marginBottom: "8px" }}>
              🎯 Live Target Progress Metrics
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {goalTracking.map((goal, idx) => {
                const pct = Math.min(100, (goal.achieved / goal.target) * 100);
                return (
                  <div key={idx} style={{ border: "1px solid #f1f5f9", padding: "6px 8px", borderRadius: "8px", background: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: 800, color: "#334155", marginBottom: "3px" }}>
                      <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{goal.name}</span>
                      <span style={{ color: pct >= 100 ? "#16a34a" : "#2563eb" }}>{goal.achieved}/{goal.target}</span>
                    </div>
                    <div style={{ width: "100%", height: "5px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: pct >= 100 ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #3b82f6, #2563eb)", borderRadius: "3px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Incentive Targets */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 12px", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", display: "block", marginBottom: "8px" }}>
              🏆 Active Incentive Targets
            </span>
            {activeChallenges.length === 0 ? (
              <span style={{ fontSize: "0.68rem", color: "#94a3b8", display: "block", textAlign: "center", padding: "10px" }}>No active incentive targets configured.</span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {activeChallenges.map(chal => {
                  // Filter candidates for this challenge progress
                  const matchingCandidates = candidates.filter(cand => {
                    const empId = cand.createdBy || cand.addedBy || cand.recruiterId;
                    if (String(empId) !== String(recruiterId)) return false;

                    // Timeframe filter
                    const dateStr = cand.createdAt || cand.sourcingDate || cand.movedAt || cand.date || Date.now();
                    const candDate = new Date(dateStr);
                    const now = new Date();
                    
                    if (chal.timeframe === "Weekly") {
                      const startOfWeek = new Date();
                      startOfWeek.setDate(now.getDate() - now.getDay());
                      startOfWeek.setHours(0,0,0,0);
                      if (candDate.getTime() < startOfWeek.getTime()) return false;
                    } else if (chal.timeframe === "Monthly") {
                      if (candDate.getMonth() !== now.getMonth() || candDate.getFullYear() !== now.getFullYear()) {
                        return false;
                      }
                    }

                    // Client scoping
                    if (chal.clientId) {
                      const matchClient = 
                        String(cand.clientId) === String(chal.clientId) || 
                        String(cand.client) === String(chal.clientId) ||
                        (cand.clientName && String(cand.clientName).toLowerCase() === String(chal.clientName).toLowerCase());
                      if (!matchClient) return false;
                    }

                    // Job scoping
                    if (chal.jobId) {
                      const matchJob = 
                        String(cand.jobId) === String(chal.jobId) || 
                        String(cand.job) === String(chal.jobId) ||
                        (cand.jobRole && String(cand.jobRole).toLowerCase() === String(chal.jobTitle).toLowerCase()) ||
                        (cand.jobTitle && String(cand.jobTitle).toLowerCase() === String(chal.jobTitle).toLowerCase());
                      if (!matchJob) return false;
                    }

                    return true;
                  });

                  let currentProgress = 0;
                  let label = "Registrations";
                  switch (chal.type) {
                    case "Selection Based":
                      currentProgress = matchingCandidates.filter(c => {
                        const remarks = (c.remarks || "").toLowerCase();
                        const status = (c.status || "").toLowerCase();
                        const cvStatus = (c.cvStatus || "").toLowerCase();
                        return status === "selected" || remarks.includes("selected") || cvStatus.includes("selected");
                      }).length;
                      label = "Selections";
                      break;
                    case "Joining Based":
                      currentProgress = matchingCandidates.filter(c => {
                        const remarks = (c.remarks || "").toLowerCase();
                        const status = (c.status || "").toLowerCase();
                        const cvStatus = (c.cvStatus || "").toLowerCase();
                        return status === "joined" || remarks.includes("joined") || cvStatus.includes("joined");
                      }).length;
                      label = "Joinings";
                      break;
                    case "Interview Based":
                      currentProgress = matchingCandidates.filter(c => {
                        const remarks = (c.remarks || "").toLowerCase();
                        const status = (c.status || "").toLowerCase();
                        const cvStatus = (c.cvStatus || "").toLowerCase();
                        return status.includes("interview") || remarks.includes("interview") || cvStatus.includes("interview");
                      }).length;
                      label = "Interviews";
                      break;
                    default:
                      currentProgress = matchingCandidates.length;
                      label = "Registrations";
                  }

                  const targetMilestone = chal.criteria[0]?.target || 10;
                  const rewardValue = chal.criteria[0]?.reward || 1000;
                  const pct = Math.min(100, (currentProgress / targetMilestone) * 100);

                  return (
                    <div key={chal.id} style={{ border: "1px solid #f8fafc", padding: "8px", borderRadius: "8px", background: "#f8fafc50" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <strong style={{ fontSize: "0.72rem", color: "#1e293b" }}>{chal.name}</strong>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" }}>
                            <span style={{ background: "#eff6ff", color: "#1e40af", fontSize: "0.55rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>{chal.type}</span>
                            <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "0.55rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>{chal.timeframe}</span>
                            {chal.clientName && (
                              <span style={{ background: "#ecfdf5", color: "#047857", fontSize: "0.55rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>Client: {chal.clientName}</span>
                            )}
                            {chal.jobTitle && (
                              <span style={{ background: "#fdf2f8", color: "#9d174d", fontSize: "0.55rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>Job: {chal.jobTitle}</span>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#16a34a" }}>₹{rewardValue.toLocaleString()}</span>
                      </div>
                      
                      <div style={{ marginTop: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>
                          <span>{currentProgress} / {targetMilestone} {label}</span>
                          <span>{pct.toFixed(0)}%</span>
                        </div>
                        <div style={{ width: "100%", height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: pct >= 100 ? "linear-gradient(90deg, #10b981, #059669)" : "#4f46e5", borderRadius: "2px" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Milestones History */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 12px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", display: "block", marginBottom: "6px" }}>
              📜 Completed Milestones History
            </span>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                    <th style={{ padding: "6px 8px" }}>Rule Frame</th>
                    <th style={{ padding: "6px 8px" }}>Achievement</th>
                    <th style={{ padding: "6px 8px", textAlign: "right" }}>Value</th>
                    <th style={{ padding: "6px 8px", textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.filter(act => act.employeeId === recruiterId).map(act => (
                    <tr key={act.id} onClick={() => setSelectedIncentiveDetails(act)} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      <td style={{ padding: "6px 8px", fontWeight: 700, color: "#2563eb" }}>{act.ruleName}</td>
                      <td style={{ padding: "6px 8px", color: "#475569" }}>{act.achievement}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 800, color: "#0f172a" }}>₹{act.actualAmount.toLocaleString()}</td>
                      <td style={{ padding: "6px 8px", textAlign: "center" }}>
                        <span style={{
                          background: act.status === "Approved" ? "#dcfce7" : act.status === "Pending" ? "#fef3c7" : "#fee2e2",
                          color: act.status === "Approved" ? "#16a34a" : act.status === "Pending" ? "#d97706" : "#dc2626",
                          fontSize: "0.6rem",
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: "6px"
                        }}>{act.status}</span>
                      </td>
                    </tr>
                  ))}
                  {actions.filter(act => act.employeeId === recruiterId).length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: "16px", textAlign: "center", color: "#94a3b8" }}>No logged milestone. Continue sourcing to qualify!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Rankings Board */}
          <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)", color: "#ffffff", borderRadius: "12px", padding: "10px 12px", marginBottom: "10px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "80px", height: "80px", background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)", borderRadius: "50%" }}></div>
            <span style={{ fontSize: "0.6rem", color: "#fbbf24", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>👑 Rank Score</span>
            <h4 style={{ fontSize: "0.8rem", fontWeight: 800, marginTop: "2px", margin: "2px 0 0 0", color: "#ffffff" }}>Board Position</h4>
            <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.6rem", color: "#cbd5e1" }}>Rank position</span>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0, color: "#fbbf24" }}>#{rankPosition}</h3>
              </div>
              <LucideTrophy size={28} style={{ color: "#fbbf24" }} />
            </div>
          </div>

          {/* Badges system */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 12px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", display: "block", marginBottom: "8px" }}>
              🎖️ Sourcing Badges
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
              {achievements.map((badge, idx) => (
                <div
                  key={idx}
                  title={`${badge.name}: ${badge.desc}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "6px 2px",
                    background: badge.active ? "#faf5ff" : "#f8fafc",
                    border: `1.5px solid ${badge.active ? "#e9d5ff" : "#e2e8f0"}`,
                    borderRadius: "8px",
                    opacity: badge.active ? 1 : 0.45,
                    textAlign: "center"
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{badge.icon}</span>
                  <span style={{ fontSize: "0.55rem", fontWeight: 800, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", width: "100%", whiteSpace: "nowrap" }}>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* POPUP CELEBRATION */}
      <AnimatePresence>
        {celebrationPopup && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }}>
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              style={{ background: "#ffffff", borderRadius: "16px", border: "2px solid #a855f7", padding: "16px 20px", width: "300px", textAlign: "center", boxShadow: "0 20px 40px rgba(168, 85, 247, 0.15)" }}
            >
              <span style={{ fontSize: "2rem", display: "block" }}>🎉</span>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e1b4b", marginTop: "6px", margin: "6px 0 0 0" }}>Milestone Achieved!</h4>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>You are eligible for a new incentive!</p>
              
              <div style={{ background: "#faf5ff", border: "1px dashed #d8b4fe", borderRadius: "8px", padding: "8px", margin: "8px 0" }}>
                <span style={{ fontSize: "0.65rem", color: "#a855f7", fontWeight: 800, display: "block" }}>{celebrationPopup.ruleName}</span>
                <span style={{ background: "#fef3c7", color: "#b45309", fontSize: "0.65rem", fontWeight: 800, padding: "2px 6px", borderRadius: "6px", display: "inline-block", marginTop: "4px" }}>
                  {celebrationPopup.achievement}
                </span>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#a855f7", marginTop: "4px", margin: "4px 0 0 0" }}>₹{celebrationPopup.actualAmount}</h3>
              </div>
              <button
                onClick={dismissCelebration}
                style={{ background: "#a855f7", color: "#ffffff", border: "none", borderRadius: "6px", padding: "8px", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", width: "100%", marginTop: "6px" }}
              >
                Close & Continue Sourcing
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP APPROVED */}
      <AnimatePresence>
        {approvalPopup && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }}>
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              style={{ background: "#ffffff", borderRadius: "16px", border: "2px solid #10b981", padding: "16px 20px", width: "300px", textAlign: "center", boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15)" }}
            >
              <span style={{ fontSize: "2rem", display: "block" }}>💰</span>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#064e3b", marginTop: "6px", margin: "6px 0 0 0" }}>Incentive Approved!</h4>
              
              <div style={{ background: "#ecfdf5", border: "1px dashed #6ee7b7", borderRadius: "8px", padding: "8px", margin: "8px 0" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#10b981", margin: 0 }}>₹{approvalPopup.actualAmount}</h3>
                <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block", marginTop: "4px" }}>Approved By: <strong>{approvalPopup.approvedBy || "Manager"}</strong></span>
              </div>
              <button
                onClick={dismissApproval}
                style={{ background: "#10b981", color: "#ffffff", border: "none", borderRadius: "6px", padding: "8px", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", width: "100%", marginTop: "6px" }}
              >
                Claim Released Payout
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED DIALOG */}
      <AnimatePresence>
        {selectedIncentiveDetails && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }}>
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "12px 14px", width: "300px" }}
            >
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", marginBottom: "8px", margin: 0 }}>Milestone Details</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.75rem" }}>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Criteria:</span>
                  <strong style={{ display: "block", color: "#334155" }}>{selectedIncentiveDetails.ruleName}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Achieved Target:</span>
                  <strong style={{ display: "block", color: "#334155" }}>{selectedIncentiveDetails.achievement}</strong>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <span style={{ color: "#64748b", display: "block" }}>Amount:</span>
                    <strong style={{ display: "block", color: "#16a34a" }}>₹{selectedIncentiveDetails.actualAmount}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", display: "block" }}>Status:</span>
                    <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "0.6rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", display: "inline-block", marginTop: "2px" }}>{selectedIncentiveDetails.status}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncentiveDetails(null)}
                style={{ background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", padding: "8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", width: "100%", marginTop: "12px" }}
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
