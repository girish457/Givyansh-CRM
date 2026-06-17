import React, { useState, useEffect, useMemo } from "react";
import {
  LucideBanknote,
  LucideTrendingUp,
  LucideUsers,
  LucideCheckCircle2,
  LucideXCircle,
  LucideClock,
  LucideTrophy,
  LucideActivity,
  LucideRefreshCw,
  LucideAward
} from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "manager" | "tl" | "recruiter";
  reportingTo: number | null;
}

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
}

export default function TLIncentiveView() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [rules, setRules] = useState<IncentiveRule[]>([]);
  const [actions, setActions] = useState<IncentiveAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, candRes, teamRes] = await Promise.all([
        fetch("/api/me"),
        fetch("/api/candidates"),
        fetch("/api/team")
      ]);

      if (userRes.ok && candRes.ok && teamRes.ok) {
        const u = await userRes.json();
        setCurrentUser(u);
        setCandidates(await candRes.json());
        setTeam(await teamRes.json());

        const storedRules = localStorage.getItem("fast_rms_incentive_rules_v1");
        if (storedRules) setRules(JSON.parse(storedRules));

        const storedActions = localStorage.getItem("fast_rms_incentive_actions_v1");
        if (storedActions) setActions(JSON.parse(storedActions));
      }
    } catch (err) {
      console.error("TL incentives metrics sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  const tlId = currentUser?.id || currentUser?.userId;

  const myRecruiters = useMemo(() => {
    return team.filter(x => x.role === "recruiter" && x.reportingTo === tlId);
  }, [team, tlId]);

  const myRecruiterIds = useMemo(() => myRecruiters.map(r => r.id), [myRecruiters]);

  // Aggregate metrics
  const teamMetrics = useMemo(() => {
    let selections = 0;
    let joinings = 0;
    let interviews = 0;
    let registrations = 0;

    candidates.forEach(c => {
      const isMyRecruiter = myRecruiterIds.includes(c.createdBy || c.addedBy || c.recruiterId);
      const isMe = (c.createdBy || c.addedBy || c.recruiterId) === tlId;

      if (isMyRecruiter || isMe) {
        registrations++;
        const status = (c.status || "").toLowerCase();
        const remarks = (c.remarks || "").toLowerCase();
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

    return { selections, joinings, interviews, registrations };
  }, [candidates, myRecruiterIds, tlId]);

  const personalMetrics = useMemo(() => {
    let selections = 0;
    let joinings = 0;
    let interviews = 0;
    let registrations = 0;

    candidates.forEach(c => {
      const isMe = (c.createdBy || c.addedBy || c.recruiterId) === tlId;
      if (isMe) {
        registrations++;
        const status = (c.status || "").toLowerCase();
        const remarks = (c.remarks || "").toLowerCase();
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

    return { selections, joinings, interviews, registrations };
  }, [candidates, tlId]);

  const earnings = useMemo(() => {
    let approved = 0;
    let pending = 0;
    let eligible = 0;
    let lifetime = 0;
    let month = 0;
    let quarter = 0;
    let year = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    actions.forEach(act => {
      const isMatch = act.employeeId === tlId || myRecruiterIds.includes(act.employeeId);
      if (isMatch) {
        const amt = act.actualAmount || 0;
        lifetime += amt;
        
        if (act.status === "Approved") {
          approved += amt;
          const actDate = new Date(act.date);
          if (actDate.getMonth() === currentMonth && actDate.getFullYear() === currentYear) {
            month += amt;
          }
          if (Math.floor((actDate.getMonth()) / 3) === Math.floor(currentMonth / 3) && actDate.getFullYear() === currentYear) {
            quarter += amt;
          }
          if (actDate.getFullYear() === currentYear) {
            year += amt;
          }
        } else if (act.status === "Pending") {
          pending += amt;
        }
      }
    });

    return { approved, pending, eligible, lifetime, month, quarter, year };
  }, [actions, tlId, myRecruiterIds]);

  const activeChallenges = useMemo(() => {
    return rules.filter(r => r.status === "Active" && (r.roleScope === "TLs" || r.roleScope === "Entire Team"));
  }, [rules]);

  const rankPosition = useMemo(() => {
    const tlEarnings = team.filter(x => x.role === "tl").map(t => {
      const sum = actions
        .filter(act => act.employeeId === t.id && act.status === "Approved")
        .reduce((s, a) => s + a.actualAmount, 0);
      return { id: t.id, name: t.name, sum };
    }).sort((a,b) => b.sum - a.sum);

    const index = tlEarnings.findIndex(x => x.id === tlId);
    return index !== -1 ? index + 1 : 1;
  }, [team, actions, tlId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
        <LucideRefreshCw className="animate-spin text-indigo-600" size={18} />
      </div>
    );
  }

  return (
    <div style={{ padding: "10px 14px", color: "#334155", fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER COMPACT */}
      <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "10px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
          <span style={{ color: "#0f172a" }}>Incentives & </span>
          <span style={{ color: "#2563eb" }}>Team Progress</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>
          Monitor incentive metrics, desking revenue targets, and commission logs.
        </p>
      </div>

      {/* METRIC TILES COMPACT */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "12px" }}>
        {[
          { title: "This Month Earned", val: `₹${earnings.month.toLocaleString()}` },
          { title: "Quarterly Earned", val: `₹${earnings.quarter.toLocaleString()}` },
          { title: "Yearly Earned", val: `₹${earnings.year.toLocaleString()}` },
          { title: "Eligible Amount", val: `₹${earnings.eligible.toLocaleString()}` },
          { title: "Pending Approval", val: `₹${earnings.pending.toLocaleString()}` },
          { title: "Approved Released", val: `₹${earnings.approved.toLocaleString()}` },
          { title: "Lifetime Incentive", val: `₹${earnings.lifetime.toLocaleString()}` }
        ].map((card, i) => (
          <div key={i} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "6px 8px", boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
            <span style={{ fontSize: "0.52rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block" }}>{card.title}</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 900, color: "#0f172a", marginTop: "1px", display: "block" }}>{card.val}</span>
          </div>
        ))}
      </div>

      {/* TWO COLUMN COMPACT */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
        
        <div>
          {/* Team Target Progress */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", display: "block", marginBottom: "8px" }}>
              👥 Active Team Challenges & Milestones
            </span>
            
            {activeChallenges.length === 0 ? (
              <span style={{ fontSize: "0.68rem", color: "#94a3b8", display: "block", textAlign: "center", padding: "10px" }}>No active challenges configured.</span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {activeChallenges.map(chal => {
                  // Filter candidates for this challenge progress
                  const matchingCandidates = candidates.filter(cand => {
                    const empId = cand.createdBy || cand.addedBy || cand.recruiterId;
                    const isMyRecruiter = myRecruiterIds.includes(empId);
                    const isMe = empId === tlId;
                    if (!isMyRecruiter && !isMe) return false;

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
                    <div key={chal.id} style={{ border: "1px solid #f8fafc", padding: "8px", borderRadius: "6px", background: "#f8fafc30" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <strong style={{ fontSize: "0.72rem", color: "#1e293b" }}>{chal.name}</strong>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" }}>
                            <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.5rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>{chal.type}</span>
                            <span style={{ background: "#e2e8f0", color: "#475569", fontSize: "0.5rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>{chal.timeframe}</span>
                            {chal.clientName && (
                              <span style={{ background: "#ecfdf5", color: "#047857", fontSize: "0.5rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>Client: {chal.clientName}</span>
                            )}
                            {chal.jobTitle && (
                              <span style={{ background: "#fdf2f8", color: "#9d174d", fontSize: "0.5rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>Job: {chal.jobTitle}</span>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#4f46e5" }}>₹{rewardValue.toLocaleString()}</span>
                      </div>
                      
                      <div style={{ marginTop: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>
                          <span>{currentProgress} / {targetMilestone} {label}</span>
                          <span>{pct.toFixed(0)}%</span>
                        </div>
                        <div style={{ width: "100%", height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#4f46e5" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* History */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", display: "block", marginBottom: "6px" }}>
              📜 Incentive History log
            </span>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.68rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "4px 6px", textAlign: "left" }}>Employee</th>
                  <th style={{ padding: "4px 6px", textAlign: "left" }}>Achievement</th>
                  <th style={{ padding: "4px 6px", textAlign: "right" }}>Value</th>
                  <th style={{ padding: "4px 6px", textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {actions.filter(act => act.employeeId === tlId || myRecruiterIds.includes(act.employeeId)).map(act => (
                  <tr key={act.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "4px 6px", fontWeight: 700 }}>{act.employeeName}</td>
                    <td style={{ padding: "4px 6px" }}>{act.achievement}</td>
                    <td style={{ padding: "4px 6px", textAlign: "right", fontWeight: 800 }}>₹{act.actualAmount.toLocaleString()}</td>
                    <td style={{ padding: "4px 6px", textAlign: "center" }}>
                      <span style={{
                        background: act.status === "Approved" ? "#dcfce7" : act.status === "Pending" ? "#fef3c7" : "#fee2e2",
                        color: act.status === "Approved" ? "#16a34a" : act.status === "Pending" ? "#d97706" : "#dc2626",
                        fontSize: "0.55rem",
                        fontWeight: 800,
                        padding: "1px 4px",
                        borderRadius: "4px"
                      }}>{act.status}</span>
                    </td>
                  </tr>
                ))}
                {actions.filter(act => act.employeeId === tlId || myRecruiterIds.includes(act.employeeId)).length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "10px", textAlign: "center", color: "#94a3b8" }}>No records compiled.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Rank */}
          <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)", color: "#ffffff", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.58rem", color: "#e0e7ff", fontWeight: 800, textTransform: "uppercase" }}>🏆 Leadership Board</span>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 900, marginTop: "2px" }}>Rank status</h4>
            <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.58rem", color: "#c7d2fe" }}>Position Rank</span>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 950, margin: 0 }}>#{rankPosition}</h3>
              </div>
              <LucideTrophy size={32} style={{ color: "#f59e0b", opacity: 0.8 }} />
            </div>
          </div>

          {/* Sourcing Summary */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", display: "block", marginBottom: "6px" }}>
              📊 Sourcing Metrics
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { title: "Team Selections", val: teamMetrics.selections, sub: `Personal: ${personalMetrics.selections}` },
                { title: "Team Joinings", val: teamMetrics.joinings, sub: `Personal: ${personalMetrics.joinings}` },
                { title: "Team Interviews", val: teamMetrics.interviews, sub: `Personal: ${personalMetrics.interviews}` },
                { title: "Raw Registrations", val: teamMetrics.registrations, sub: `Personal: ${personalMetrics.registrations}` }
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", background: "#f8fafc", borderRadius: "6px" }}>
                  <div>
                    <span style={{ fontSize: "0.68rem", color: "#334155", fontWeight: 700 }}>{m.title}</span>
                    <span style={{ fontSize: "0.52rem", color: "#64748b", display: "block" }}>{m.sub}</span>
                  </div>
                  <strong style={{ fontSize: "0.78rem", color: "#0f172a" }}>{m.val}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
