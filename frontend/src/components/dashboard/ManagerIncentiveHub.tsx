import React, { useState, useEffect, useMemo } from "react";
import {
  LucideBanknote,
  LucideTrendingUp,
  LucideUsers,
  LucidePlus,
  LucideCheckCircle2,
  LucideXCircle,
  LucideFilter,
  LucideFileText,
  LucideTrophy,
  LucideAward,
  LucideCalendar,
  LucideClock,
  LucideSearch,
  LucideSparkles,
  LucideDownload,
  LucideLayoutGrid,
  LucideActivity,
  LucideRefreshCw,
  LucideZap,
  LucideLoader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  approvedBy?: string;
  auditTrail: { timestamp: string; action: string; user: string }[];
}

export default function ManagerIncentiveHub() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Incentive states
  const [rules, setRules] = useState<IncentiveRule[]>([]);
  const [actions, setActions] = useState<IncentiveAction[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Budget states
  const [totalBudget, setTotalBudget] = useState<number>(0);

  const companyId = currentUser?.companyId || "default";
  const rulesKey = `fast_rms_incentive_rules_v1_${companyId}`;
  const actionsKey = `fast_rms_incentive_actions_v1_${companyId}`;
  const auditKey = `fast_rms_incentive_audit_v1_${companyId}`;
  const budgetKey = `fast_rms_incentive_budget_v1_${companyId}`;

  // Filtering / UI State
  const [activeKpiFilter, setActiveKpiFilter] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"dashboard" | "rules" | "approvals" | "leaderboard" | "forecast" | "history" | "analytics" | "audit">("dashboard");
  const [historySearch, setHistorySearch] = useState("");
  const [historyDateFilter, setHistoryDateFilter] = useState<"all" | "today" | "7days" | "month" | "year">("all");
  const [leaderboardFilter, setLeaderboardFilter] = useState<"weekly" | "monthly" | "quarterly" | "yearly" | "lifetime">("monthly");

  // Modals
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleType, setNewRuleType] = useState("Selection Based");
  const [newRuleTimeframe, setNewRuleTimeframe] = useState<any>("Monthly");
  const [newRuleScope, setNewRuleScope] = useState<any>("Recruiters");
  const [newRuleClientId, setNewRuleClientId] = useState<string>("");
  const [newRuleJobId, setNewRuleJobId] = useState<string>("");
  const filteredJobs = useMemo(() => {
    if (!newRuleClientId) return jobs;
    return jobs.filter(j => 
      String(j.clientId) === String(newRuleClientId) || 
      String(j.client) === String(newRuleClientId) ||
      (j.client && String(j.client.id || j.client._id) === String(newRuleClientId))
    );
  }, [jobs, newRuleClientId]);
  const [criteriaPairs, setCriteriaPairs] = useState<{ target: number; reward: number }[]>([{ target: 10, reward: 500 }]);
  const [modifyingActionId, setModifyingActionId] = useState<string | null>(null);
  const [modifiedAmount, setModifiedAmount] = useState<number>(0);

  useEffect(() => {
    fetchCoreData();
  }, []);

  const fetchCoreData = async () => {
    try {
      setLoading(true);
      const [userRes, teamRes, candRes, clientRes, jobsRes, vendorsRes, tasksRes] = await Promise.all([
        fetch("/api/me"),
        fetch("/api/team"),
        fetch("/api/candidates"),
        fetch("/api/clients").catch(() => null),
        fetch("/api/jobs").catch(() => null),
        fetch("/api/vendors").catch(() => null),
        fetch("/api/tasks").catch(() => null)
      ]);

      if (userRes.ok && teamRes.ok && candRes.ok) {
        const u = await userRes.json();
        const t = await teamRes.json();
        const c = await candRes.json();
        
        setCurrentUser(u);
        setCandidates(c);
        setTeam(t);

        if (clientRes && clientRes.ok) setClients(await clientRes.json());
        if (jobsRes && jobsRes.ok) setJobs(await jobsRes.json());
        if (vendorsRes && vendorsRes.ok) setVendors(await vendorsRes.json());
        if (tasksRes && tasksRes.ok) setTasks(await tasksRes.json());

        // Initialize from localStorage strictly without placeholder dummy historical data
        initIncentiveState(u);
      }
    } catch (err) {
      console.error("Incentive Hub telemetry load failure", err);
    } finally {
      setLoading(false);
    }
  };

  const initIncentiveState = (manager: any) => {
    const cid = manager?.companyId || "default";
    const rKey = `fast_rms_incentive_rules_v1_${cid}`;
    const aKey = `fast_rms_incentive_actions_v1_${cid}`;
    const auKey = `fast_rms_incentive_audit_v1_${cid}`;
    const bKey = `fast_rms_incentive_budget_v1_${cid}`;

    // 1. Rules
    const storedRules = localStorage.getItem(rKey);
    let activeRules: IncentiveRule[] = [];
    if (storedRules) {
      activeRules = JSON.parse(storedRules);
    } else {
      activeRules = [
        {
          id: "RULE_SELECTIONS_DEFAULT",
          name: "Sourcing Selections Program",
          type: "Selection Based",
          criteria: [
            { target: 10, reward: 1500 },
            { target: 20, reward: 4000 },
            { target: 50, reward: 12000 }
          ],
          timeframe: "Monthly",
          roleScope: "Recruiters",
          createdAt: new Date().toISOString(),
          status: "Active"
        },
        {
          id: "RULE_JOININGS_DEFAULT",
          name: "Placement Joinings Milestone",
          type: "Joining Based",
          criteria: [
            { target: 1, reward: 2000 },
            { target: 5, reward: 10000 },
            { target: 10, reward: 25000 }
          ],
          timeframe: "Monthly",
          roleScope: "Recruiters",
          createdAt: new Date().toISOString(),
          status: "Active"
        }
      ];
      localStorage.setItem(rKey, JSON.stringify(activeRules));
    }
    setRules(activeRules);

    // 2. Actions (Empty if not present - STRICTLY NO DUMMY VALUES)
    const storedActions = localStorage.getItem(aKey);
    let activeActions: IncentiveAction[] = [];
    if (storedActions) {
      activeActions = JSON.parse(storedActions);
    } else {
      // Empty array to start clean with real data
      activeActions = [];
      localStorage.setItem(aKey, JSON.stringify(activeActions));
    }
    setActions(activeActions);

    // 3. System Audits
    const storedAudit = localStorage.getItem(auKey);
    if (storedAudit) {
      setAuditLogs(JSON.parse(storedAudit));
    } else {
      const logs = [
        { timestamp: new Date().toISOString(), event: "Incentive Hub initialized on real database parameters", user: manager?.name || "Manager" }
      ];
      setAuditLogs(logs);
      localStorage.setItem(auKey, JSON.stringify(logs));
    }

    // Budget
    const storedBudget = localStorage.getItem(bKey);
    if (storedBudget) {
      setTotalBudget(Number(storedBudget));
    } else {
      setTotalBudget(0);
    }
  };

  const managerId = currentUser?.id || currentUser?.userId;

  const myTls = useMemo(() => {
    return team.filter(t => t.role === "tl" && (t.reportingTo === managerId || t.reportingTo === null));
  }, [team, managerId]);

  const myTlIds = useMemo(() => myTls.map(t => t.id), [myTls]);

  const myRecruiters = useMemo(() => {
    return team.filter(t => 
      t.role === "recruiter" && (
        t.reportingTo === managerId || 
        (t.reportingTo !== null && myTlIds.includes(t.reportingTo))
      )
    );
  }, [team, managerId, myTlIds]);

  const allMySubordinates = useMemo(() => [...myTls, ...myRecruiters], [myTls, myRecruiters]);

  // Dynamic live performance metrics aggregation from actual database
  const realTimePerformance = useMemo(() => {
    const perf: Record<number, {
      selections: number;
      joinings: number;
      interviews: number;
      registrations: number;
      leads: number;
      clients: number;
      jobs: number;
      vendors: number;
      tasks: number;
    }> = {};

    allMySubordinates.forEach(member => {
      perf[member.id] = {
        selections: 0,
        joinings: 0,
        interviews: 0,
        registrations: 0,
        leads: 0,
        clients: 0,
        jobs: 0,
        vendors: 0,
        tasks: 0
      };
    });

    candidates.forEach(cand => {
      const empId = cand.createdBy || cand.addedBy || cand.recruiterId;
      if (empId && perf[empId]) {
        const p = perf[empId];
        p.registrations += 1;
        p.leads += 1;

        const remarks = (cand.remarks || "").toLowerCase();
        const status = (cand.status || "").toLowerCase();
        const cvStatus = (cand.cvStatus || "").toLowerCase();

        if (status === "selected" || remarks.includes("selected") || cvStatus.includes("selected")) {
          p.selections += 1;
        }
        if (status === "joined" || remarks.includes("joined") || cvStatus.includes("joined")) {
          p.joinings += 1;
        }
        if (status.includes("interview") || remarks.includes("interview") || cvStatus.includes("interview")) {
          p.interviews += 1;
        }
      }
    });

    if (clients.length) {
      clients.forEach(c => {
        const empId = c.createdBy || c.addedBy;
        if (empId && perf[empId]) perf[empId].clients += 1;
      });
    }

    if (jobs.length) {
      jobs.forEach(j => {
        const empId = j.createdBy || j.addedBy;
        if (empId && perf[empId]) perf[empId].jobs += 1;
      });
    }

    if (vendors.length) {
      vendors.forEach(v => {
        const empId = v.createdBy || v.addedBy;
        if (empId && perf[empId]) perf[empId].vendors += 1;
      });
    }

    if (tasks.length) {
      tasks.forEach(t => {
        const empId = t.assignedTo || t.userId;
        if (empId && perf[empId] && t.status?.toLowerCase() === "completed") {
          perf[empId].tasks += 1;
        }
      });
    }

    // TL aggregation
    myTls.forEach(tl => {
      const subordinates = team.filter(x => x.reportingTo === tl.id);
      const tlPerf = perf[tl.id];
      if (tlPerf) {
        subordinates.forEach(sub => {
          const subPerf = perf[sub.id];
          if (subPerf) {
            tlPerf.selections += subPerf.selections;
            tlPerf.joinings += subPerf.joinings;
            tlPerf.interviews += subPerf.interviews;
            tlPerf.registrations += subPerf.registrations;
            tlPerf.leads += subPerf.leads;
            tlPerf.clients += subPerf.clients;
            tlPerf.jobs += subPerf.jobs;
            tlPerf.vendors += subPerf.vendors;
            tlPerf.tasks += subPerf.tasks;
          }
        });
      }
    });

    return perf;
  }, [candidates, clients, jobs, vendors, tasks, allMySubordinates, team, myTls]);

  // Suggested eligibility detector with real-time timeframe, client & job scoping
  const suggestedIncentives = useMemo(() => {
    const suggestions: Omit<IncentiveAction, "id" | "status" | "date" | "auditTrail">[] = [];

    rules.forEach(rule => {
      if (rule.status !== "Active") return;

      allMySubordinates.forEach(emp => {
        if (rule.roleScope === "Recruiters" && emp.role !== "recruiter") return;
        if (rule.roleScope === "TLs" && emp.role !== "tl") return;

        // Filter candidates specific to this employee, matching rule filters & timeframe
        const empCandidates = candidates.filter(cand => {
          const empId = cand.createdBy || cand.addedBy || cand.recruiterId;
          if (String(empId) !== String(emp.id)) return false;

          // Timeframe filter
          const dateStr = cand.createdAt || cand.sourcingDate || cand.movedAt || cand.date || Date.now();
          const candDate = new Date(dateStr);
          const now = new Date();
          
          if (rule.timeframe === "Weekly") {
            const startOfWeek = new Date();
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0,0,0,0);
            if (candDate.getTime() < startOfWeek.getTime()) return false;
          } else if (rule.timeframe === "Monthly") {
            if (candDate.getMonth() !== now.getMonth() || candDate.getFullYear() !== now.getFullYear()) {
              return false;
            }
          }

          // Client scoping
          if (rule.clientId) {
            const matchClient = 
              String(cand.clientId) === String(rule.clientId) || 
              String(cand.client) === String(rule.clientId) ||
              (cand.clientName && String(cand.clientName).toLowerCase() === String(rule.clientName).toLowerCase());
            if (!matchClient) return false;
          }

          // Job scoping
          if (rule.jobId) {
            const matchJob = 
              String(cand.jobId) === String(rule.jobId) || 
              String(cand.job) === String(rule.jobId) ||
              (cand.jobRole && String(cand.jobRole).toLowerCase() === String(rule.jobTitle).toLowerCase()) ||
              (cand.jobTitle && String(cand.jobTitle).toLowerCase() === String(rule.jobTitle).toLowerCase());
            if (!matchJob) return false;
          }

          return true;
        });

        // Determine achievement count based on rule type
        let achievedCount = 0;
        let unitLabel = "";

        switch (rule.type) {
          case "Selection Based":
            achievedCount = empCandidates.filter(c => {
              const remarks = (c.remarks || "").toLowerCase();
              const status = (c.status || "").toLowerCase();
              const cvStatus = (c.cvStatus || "").toLowerCase();
              return status === "selected" || remarks.includes("selected") || cvStatus.includes("selected");
            }).length;
            unitLabel = "Selections";
            break;
          case "Joining Based":
            achievedCount = empCandidates.filter(c => {
              const remarks = (c.remarks || "").toLowerCase();
              const status = (c.status || "").toLowerCase();
              const cvStatus = (c.cvStatus || "").toLowerCase();
              return status === "joined" || remarks.includes("joined") || cvStatus.includes("joined");
            }).length;
            unitLabel = "Joinings";
            break;
          case "Interview Based":
            achievedCount = empCandidates.filter(c => {
              const remarks = (c.remarks || "").toLowerCase();
              const status = (c.status || "").toLowerCase();
              const cvStatus = (c.cvStatus || "").toLowerCase();
              return status.includes("interview") || remarks.includes("interview") || cvStatus.includes("interview");
            }).length;
            unitLabel = "Interviews";
            break;
          default:
            achievedCount = empCandidates.length;
            unitLabel = "Registrations";
        }

        if (achievedCount <= 0) return;

        const matchedTiers = [...rule.criteria]
          .sort((a, b) => b.target - a.target)
          .filter(tier => achievedCount >= tier.target);

        if (matchedTiers.length > 0) {
          const highestTier = matchedTiers[0];
          
          const alreadyLogged = actions.some(act => 
            act.employeeId === emp.id && 
            act.ruleId === rule.id && 
            act.achievement.includes(`${highestTier.target} ${unitLabel}`)
          );

          if (!alreadyLogged) {
            const tlObj = team.find(x => x.id === emp.reportingTo);
            
            // Scope details to display in achievement label
            let scopeLabel = "";
            if (rule.clientName) scopeLabel += ` for client: ${rule.clientName}`;
            if (rule.jobTitle) scopeLabel += ` [Job: ${rule.jobTitle}]`;

            suggestions.push({
              employeeId: emp.id,
              employeeName: emp.name,
              designation: emp.role.toUpperCase(),
              tlName: tlObj ? tlObj.name : "None (Direct)",
              ruleId: rule.id,
              ruleName: rule.name,
              achievement: `${achievedCount} / ${highestTier.target} ${unitLabel}${scopeLabel}`,
              calculatedIncentive: highestTier.reward,
              actualAmount: highestTier.reward
            });
          }
        }
      });
    });

    return suggestions;
  }, [rules, actions, candidates, allMySubordinates, team]);

  // AI recommendations summary
  const aiRecommendations = useMemo(() => {
    const list: { type: string; title: string; desc: string; val: string }[] = [];

    const recruiterSelections = myRecruiters.map(r => ({
      name: r.name,
      val: realTimePerformance[r.id]?.selections || 0
    })).sort((a,b) => b.val - a.val);

    if (recruiterSelections.length > 0 && recruiterSelections[0].val > 0) {
      list.push({
        type: "Efficiency Lead",
        title: "Top Sourcing Velocity",
        desc: `**${recruiterSelections[0].name}** completed the highest selections in candidate stages.`,
        val: `${recruiterSelections[0].val} Selections`
      });
    }

    const recruiterJoiningRatio = myRecruiters.map(r => {
      const p = realTimePerformance[r.id];
      const ratio = p && p.selections > 0 ? (p.joinings / p.selections) * 100 : 0;
      return { name: r.name, val: ratio, joinings: p?.joinings || 0 };
    }).sort((a,b) => b.val - a.val);

    if (recruiterJoiningRatio.length > 0 && recruiterJoiningRatio[0].joinings > 0) {
      list.push({
        type: "Conversion Champion",
        title: "Placement Rate Leader",
        desc: `**${recruiterJoiningRatio[0].name}** holds the highest Selection-to-Onboarding conversion.`,
        val: `${recruiterJoiningRatio[0].val.toFixed(0)}% Ratio`
      });
    }

    const tlJoinings = myTls.map(t => ({
      name: t.name,
      val: realTimePerformance[t.id]?.joinings || 0
    })).sort((a,b) => b.val - a.val);

    if (tlJoinings.length > 0 && tlJoinings[0].val > 0) {
      list.push({
        type: "Strategic Node",
        title: "Highest Team Conversion",
        desc: `Team Lead **${tlJoinings[0].name}**'s segment is converting joinings at peak scale.`,
        val: `${tlJoinings[0].val} Team Joinings`
      });
    }

    return list.slice(0, 3);
  }, [myRecruiters, myTls, realTimePerformance]);

  // Analytics
  const analyticsSummary = useMemo(() => {
    let totalPaid = 0;
    let pendingPaid = 0;
    let approvedCount = 0;
    let pendingCount = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);

    let thisMonthTotal = 0;
    let thisWeekTotal = 0;

    let highestIncentive = 0;
    let topEarnerName = "No payouts yet";
    const employeeEarningsMap: Record<string, number> = {};

    actions.forEach(act => {
      const amt = Number(act.actualAmount) || 0;
      if (act.status === "Approved") {
        totalPaid += amt;
        approvedCount++;

        const actDate = new Date(act.date);
        if (actDate.getMonth() === currentMonth && actDate.getFullYear() === currentYear) {
          thisMonthTotal += amt;
        }
        if (actDate.getTime() >= startOfWeek.getTime()) {
          thisWeekTotal += amt;
        }

        employeeEarningsMap[act.employeeName] = (employeeEarningsMap[act.employeeName] || 0) + amt;
      } else if (act.status === "Pending") {
        pendingPaid += amt;
        pendingCount++;
      }
    });

    Object.entries(employeeEarningsMap).forEach(([name, earnings]) => {
      if (earnings > highestIncentive) {
        highestIncentive = earnings;
        topEarnerName = name;
      }
    });

    const topRecruiterObj = myRecruiters.map(r => ({
      name: r.name,
      val: employeeEarningsMap[r.name] || 0
    })).sort((a,b) => b.val - a.val)[0];

    const topTlObj = myTls.map(t => ({
      name: t.name,
      val: employeeEarningsMap[t.name] || 0
    })).sort((a,b) => b.val - a.val)[0];

    return {
      totalPaid,
      totalBudget,
      pendingPaid,
      approvedCount,
      pendingCount,
      thisMonthTotal,
      thisWeekTotal,
      eligibleEmployees: suggestedIncentives.length,
      highestIncentive,
      topEarnerName,
      topRecruiter: topRecruiterObj?.val > 0 ? topRecruiterObj.name : "None",
      topTl: topTlObj?.val > 0 ? topTlObj.name : "None",
      teamWithHighest: topTlObj?.val > 0 ? `${topTlObj.name} Team` : "None"
    };
  }, [actions, suggestedIncentives, myRecruiters, myTls]);

  const predictiveForecast = useMemo(() => {
    let potentialWeek = 0;
    let potentialMonth = 0;

    rules.forEach(rule => {
      if (rule.status !== "Active") return;
      allMySubordinates.forEach(emp => {
        const perf = realTimePerformance[emp.id];
        if (!perf) return;

        let count = perf.selections;
        if (rule.type === "Joining Based") count = perf.joinings;
        else if (rule.type === "Interview Based") count = perf.interviews;

        rule.criteria.forEach(tier => {
          if (count >= tier.target * 0.8 && count < tier.target) {
            if (rule.timeframe === "Weekly") potentialWeek += tier.reward;
            potentialMonth += tier.reward;
          }
        });
      });
    });

    return {
      potentialWeek,
      potentialMonth,
      potentialQuarter: potentialMonth * 3,
      potentialYear: potentialMonth * 12
    };
  }, [rules, realTimePerformance, allMySubordinates]);

  const leaderboardRankings = useMemo(() => {
    const userStats = allMySubordinates.map(emp => {
      const perf = realTimePerformance[emp.id] || { selections: 0, joinings: 0, registrations: 0 };
      const earnings = actions
        .filter(act => act.employeeId === emp.id && act.status === "Approved")
        .reduce((sum, act) => sum + act.actualAmount, 0);

      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        selections: perf.selections,
        joinings: perf.joinings,
        leads: perf.registrations,
        earnings
      };
    });

    return {
      topEarners: [...userStats].sort((a,b) => b.earnings - a.earnings),
      topRecruiters: [...userStats].filter(x => x.role === "recruiter").sort((a,b) => b.selections - a.selections),
      topTls: [...userStats].filter(x => x.role === "tl").sort((a,b) => b.joinings - a.joinings),
      topTeams: myTls.map(t => {
        const subIds = team.filter(x => x.reportingTo === t.id).map(x => x.id);
        const teamEarnings = actions
          .filter(act => subIds.includes(act.employeeId) && act.status === "Approved")
          .reduce((sum, act) => sum + act.actualAmount, 0);

        return { tlName: t.name, earnings: teamEarnings };
      }).sort((a,b) => b.earnings - a.earnings)
    };
  }, [allMySubordinates, realTimePerformance, actions, team, myTls]);

  const handleApproveSuggested = (suggested: Omit<IncentiveAction, "id" | "status" | "date" | "auditTrail">) => {
    const newAction: IncentiveAction = {
      ...suggested,
      id: "ACT_" + Date.now(),
      status: "Approved",
      date: new Date().toISOString(),
      approvedBy: currentUser?.name || "Manager",
      auditTrail: [{ timestamp: new Date().toISOString(), action: `Authorized milestone: ${suggested.achievement}`, user: currentUser?.name || "Manager" }]
    };

    const updated = [newAction, ...actions];
    setActions(updated);
    localStorage.setItem(actionsKey, JSON.stringify(updated));
    addAuditLog(`Approved ₹${suggested.actualAmount} for ${suggested.employeeName} (${suggested.achievement})`);
  };

  const handleApproveAction = (actionId: string) => {
    const updated = actions.map(act => {
      if (act.id === actionId) {
        return {
          ...act,
          status: "Approved" as const,
          approvedBy: currentUser?.name || "Manager",
          auditTrail: [...act.auditTrail, { timestamp: new Date().toISOString(), action: "Approved manually", user: currentUser?.name || "Manager" }]
        };
      }
      return act;
    });

    setActions(updated);
    localStorage.setItem(actionsKey, JSON.stringify(updated));
    const matched = actions.find(x => x.id === actionId);
    if (matched) addAuditLog(`Approved payout ₹${matched.actualAmount} for ${matched.employeeName}`);
  };

  const handleRejectAction = (actionId: string) => {
    const updated = actions.map(act => {
      if (act.id === actionId) {
        return {
          ...act,
          status: "Rejected" as const,
          auditTrail: [...act.auditTrail, { timestamp: new Date().toISOString(), action: "Rejected manually", user: currentUser?.name || "Manager" }]
        };
      }
      return act;
    });

    setActions(updated);
    localStorage.setItem(actionsKey, JSON.stringify(updated));
    const matched = actions.find(x => x.id === actionId);
    if (matched) addAuditLog(`Rejected milestone transaction for ${matched.employeeName}`);
  };

  const handleModifyAmount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyingActionId) return;

    const updated = actions.map(act => {
      if (act.id === modifyingActionId) {
        return {
          ...act,
          actualAmount: modifiedAmount,
          auditTrail: [...act.auditTrail, { timestamp: new Date().toISOString(), action: `Value adjusted to ₹${modifiedAmount}`, user: currentUser?.name || "Manager" }]
        };
      }
      return act;
    });

    setActions(updated);
    localStorage.setItem(actionsKey, JSON.stringify(updated));
    const matched = actions.find(x => x.id === modifyingActionId);
    if (matched) addAuditLog(`Modified payout parameter for ${matched.employeeName} to ₹${modifiedAmount}`);
    setModifyingActionId(null);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const selectedClient = clients.find(c => String(c.id) === String(newRuleClientId) || String(c._id) === String(newRuleClientId));
    const selectedJob = jobs.find(j => String(j.id) === String(newRuleJobId) || String(j._id) === String(newRuleJobId));

    const newRule: IncentiveRule = {
      id: "RULE_" + Date.now(),
      name: newRuleName,
      type: newRuleType,
      criteria: criteriaPairs.map(p => ({ target: Number(p.target), reward: Number(p.reward) })),
      timeframe: newRuleTimeframe,
      roleScope: newRuleScope,
      createdAt: new Date().toISOString(),
      status: "Active",
      clientId: newRuleClientId || undefined,
      clientName: selectedClient ? selectedClient.company || selectedClient.name : undefined,
      jobId: newRuleJobId || undefined,
      jobTitle: selectedJob ? selectedJob.title || selectedJob.jobRole : undefined
    };

    const updated = [newRule, ...rules];
    setRules(updated);
    localStorage.setItem(rulesKey, JSON.stringify(updated));
    addAuditLog(`Configured rule framework: "${newRuleName}"`);

    setNewRuleName("");
    setNewRuleClientId("");
    setNewRuleJobId("");
    setCriteriaPairs([{ target: 10, reward: 500 }]);
    setShowRuleModal(false);
  };

  const handleToggleRuleStatus = (ruleId: string) => {
    const updated = rules.map(r => {
      if (r.id === ruleId) {
        const nextStatus = r.status === "Active" ? "Inactive" : "Active";
        addAuditLog(`Updated rule state: "${r.name}" to ${nextStatus}`);
        return { ...r, status: nextStatus as any };
      }
      return r;
    });
    setRules(updated);
    localStorage.setItem(rulesKey, JSON.stringify(updated));
  };

  const handleDeleteRule = (ruleId: string) => {
    const target = rules.find(r => r.id === ruleId);
    if (!target) return;
    if (confirm(`Remove rule alignment: "${target.name}"?`)) {
      const updated = rules.filter(r => r.id !== ruleId);
      setRules(updated);
      localStorage.setItem(rulesKey, JSON.stringify(updated));
      addAuditLog(`Removed rule definition: "${target.name}"`);
    }
  };

  const addAuditLog = (event: string) => {
    const newLog = {
      timestamp: new Date().toISOString(),
      event,
      user: currentUser?.name || "Manager"
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem(auditKey, JSON.stringify(updated));
  };

  const filteredHistory = useMemo(() => {
    return actions.filter(act => {
      const matchesSearch = act.employeeName.toLowerCase().includes(historySearch.toLowerCase()) ||
        act.ruleName.toLowerCase().includes(historySearch.toLowerCase()) ||
        act.achievement.toLowerCase().includes(historySearch.toLowerCase());

      if (!matchesSearch) return false;

      if (historyDateFilter !== "all") {
        const actDate = new Date(act.date);
        const diffTime = Math.abs(Date.now() - actDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (historyDateFilter === "today" && diffDays > 1) return false;
        if (historyDateFilter === "7days" && diffDays > 7) return false;
        if (historyDateFilter === "month" && diffDays > 30) return false;
        if (historyDateFilter === "year" && diffDays > 365) return false;
      }

      if (activeKpiFilter === "Approved" && act.status !== "Approved") return false;
      if (activeKpiFilter === "Pending" && act.status !== "Pending") return false;

      return true;
    });
  }, [actions, historySearch, historyDateFilter, activeKpiFilter]);

  const exportCSV = () => {
    const headers = ["ID", "Employee", "Designation", "TL", "Achievement", "Rule Name", "Amount (INR)", "Status", "Date"];
    const rows = filteredHistory.map(a => [
      a.id, a.employeeName, a.designation, a.tlName, a.achievement, a.ruleName, a.actualAmount, a.status, a.date ? new Date(a.date).toLocaleDateString() : ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Fast_RMS_Incentives_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Incentive Hub...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px 14px", color: "#334155", fontFamily: "'Inter', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* HEADER COMPACT */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Incentive </span>
            <span style={{ color: "#2563eb" }}>Management Engine</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Configure rules, approve recruiter achievements, and monitor corporate payout history.</p>
        </div>
        <button
          onClick={() => setShowRuleModal(true)}
          style={{
            background: "#4f46e5",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "5px 10px",
            fontSize: "0.7rem",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer"
          }}
        >
          <LucidePlus size={12} /> Create Rule
        </button>
      </div>

      {/* KPI GRID - VERY COMPACT & CLICKABLE */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", marginBottom: "12px" }}>
        {[
          { id: "Distributed", title: "Distributed", val: `₹${analyticsSummary.totalPaid.toLocaleString()}`, color: "#4f46e5", desc: "Total Approved Releases" },
          { id: "Budget", title: "Remaining Budget", val: `₹${(analyticsSummary.totalBudget - analyticsSummary.totalPaid).toLocaleString()}`, color: "#0ea5e9", desc: "Assigned enterprise cap" },
          { id: "Pending", title: "Pending Claims", val: `₹${analyticsSummary.pendingPaid.toLocaleString()}`, color: "#f59e0b", desc: `${analyticsSummary.pendingCount} suggested payouts` },
          { id: "Approved", title: "Approved Released", val: `${analyticsSummary.approvedCount} Claims`, color: "#10b981", desc: "Credited conversions" },
          { id: "Month", title: "This Month", val: `₹${analyticsSummary.thisMonthTotal.toLocaleString()}`, color: "#ec4899", desc: "Current cycle volume" },
          { id: "Week", title: "Weekly Flow", val: `₹${analyticsSummary.thisWeekTotal.toLocaleString()}`, color: "#84cc16", desc: "Last 7 days release" }
        ].map(card => {
          const isSelected = activeKpiFilter === card.id;
          return (
            <div
              key={card.id}
              onClick={() => {
                setActiveKpiFilter(isSelected ? "All" : card.id);
                if (card.id === "Pending" || card.id === "Approved") setActiveTab("approvals");
              }}
              style={{
                background: "#ffffff",
                borderRadius: "8px",
                border: `1.5px solid ${isSelected ? card.color : "#e2e8f0"}`,
                padding: "8px 10px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
              }}
            >
              <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block" }}>{card.title}</span>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>{card.val}</h3>
              <span style={{ fontSize: "0.52rem", color: "#94a3b8", display: "block", marginTop: "1px" }}>{card.desc}</span>
            </div>
          );
        })}
      </div>

      {/* COMPACT SUB indicadores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", marginBottom: "12px" }}>
        {[
          { title: "Highest Earner", val: analyticsSummary.topEarnerName, sub: `₹${analyticsSummary.highestIncentive.toLocaleString()}`, color: "#8b5cf6" },
          { title: "Top TL Node", val: analyticsSummary.topTl, sub: "Sourcing conversion leader", color: "#10b981" },
          { title: "Top Recruiter", val: analyticsSummary.topRecruiter, sub: "Selections absolute leader", color: "#06b6d4" },
          { title: "Eligible Recs/TLs", val: analyticsSummary.eligibleEmployees, sub: "Live database checks", color: "#f97316" },
          { title: "Expected Payouts", val: `₹${predictiveForecast.potentialMonth.toLocaleString()}`, sub: "Monthly projection model", color: "#ec4899" },
          { title: "Corporate Pool", val: "Enterprise Cap", sub: "Calculated dynamically", color: "#4f46e5" }
        ].map((c, i) => (
          <div key={i} style={{ background: `${c.color}05`, border: `1px solid ${c.color}15`, borderRadius: "6px", padding: "6px 8px" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block" }}>{c.title}</span>
            <strong style={{ fontSize: "0.78rem", color: "#1e293b", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.val}</strong>
            <span style={{ fontSize: "0.52rem", color: "#94a3b8", display: "block" }}>{c.sub}</span>
          </div>
        ))}
      </div>

      {/* NAVIGATION TABS - SLICK & COMPACT */}
      <div style={{ display: "flex", gap: "4px", background: "#ffffff", padding: "3px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "12px" }}>
        {[
          { id: "dashboard", name: "Suggested Milestones", icon: <LucideZap size={11} /> },
          { id: "rules", name: "Rule Engine", icon: <LucideLayoutGrid size={11} /> },
          { id: "approvals", name: "Approval Center", icon: <LucideCheckCircle2 size={11} /> },
          { id: "leaderboard", name: "Rankings Board", icon: <LucideTrophy size={11} /> },
          { id: "forecast", name: "Predictive AI", icon: <LucideTrendingUp size={11} /> },
          { id: "history", name: "Payout History Log", icon: <LucideFileText size={11} /> },
          { id: "analytics", name: "SVG Trends", icon: <LucideActivity size={11} /> },
          { id: "audit", name: "Audit Trail", icon: <LucideClock size={11} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "6px 4px",
              borderRadius: "6px",
              fontSize: "0.68rem",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.15s",
              border: "none",
              background: activeTab === t.id ? "#4f46e5" : "transparent",
              color: activeTab === t.id ? "#ffffff" : "#64748b"
            }}
          >
            {t.icon}
            {t.name}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TABS */}
      <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
        
        {/* SUGGESTED INCENTIVES */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#1e293b" }}>Automatic Eligibility Scanner Output</span>
              <span style={{ background: "#e0e7ff", color: "#4f46e5", fontSize: "0.58rem", fontWeight: 800, padding: "1px 6px", borderRadius: "6px" }}>
                {suggestedIncentives.length} Milestones Found
              </span>
            </div>

            {suggestedIncentives.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                <LucideCheckCircle2 size={24} style={{ margin: "0 auto 6px", color: "#10b981" }} />
                <span style={{ fontSize: "0.72rem", fontWeight: 800, display: "block" }}>Database is fully synced!</span>
                <span style={{ fontSize: "0.65rem" }}>No eligible unlogged milestones found in core records.</span>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {suggestedIncentives.map((sug, idx) => (
                  <div key={idx} style={{ border: "1px dashed #4f46e550", borderRadius: "8px", padding: "8px 10px", background: "#4f46e502", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a" }}>{sug.employeeName}</span>
                        <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.55rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>{sug.designation}</span>
                      </div>
                      <span style={{ fontSize: "0.62rem", color: "#64748b", display: "block", marginTop: "1px" }}>Reporting Node: **{sug.tlName}**</span>
                      <div style={{ marginTop: "4px" }}>
                        <span style={{ background: "#fef3c7", color: "#b45309", fontSize: "0.65rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>
                          {sug.achievement}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 950, color: "#4f46e5", display: "block" }}>₹{sug.calculatedIncentive}</span>
                      <div style={{ display: "flex", gap: "3px", marginTop: "4px" }}>
                        <button
                          onClick={() => handleApproveSuggested(sug)}
                          style={{ background: "#4f46e5", color: "#ffffff", border: "none", borderRadius: "4px", padding: "3px 6px", fontSize: "0.58rem", fontWeight: 800, cursor: "pointer" }}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI SYSTEM RECOMMENDATIONS */}
            <div style={{ marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
              <h4 style={{ fontSize: "0.75rem", fontWeight: 900, color: "#1e293b", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                <LucideSparkles size={11} style={{ color: "#a855f7" }} /> Sourcing Insight Recommendations
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {aiRecommendations.map((ai, i) => (
                  <div key={i} style={{ background: "#faf5ff", border: "1px solid #e8d5c415", borderRadius: "6px", padding: "6px 8px" }}>
                    <span style={{ fontSize: "0.52rem", color: "#a855f7", fontWeight: 800, textTransform: "uppercase", display: "block" }}>{ai.type}</span>
                    <strong style={{ fontSize: "0.7rem", color: "#1e1b4b", display: "block", marginTop: "1px" }}>{ai.title}</strong>
                    <span style={{ fontSize: "0.62rem", color: "#64748b", display: "block" }} dangerouslySetInnerHTML={{ __html: ai.desc }}></span>
                    <span style={{ fontSize: "0.68rem", fontWeight: 950, color: "#a855f7", display: "block", marginTop: "2px" }}>{ai.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RULE ENGINE */}
        {activeTab === "rules" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {rules.map(rule => (
                <div key={rule.id} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", background: rule.status === "Active" ? "#ffffff" : "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <strong style={{ fontSize: "0.75rem", color: "#0f172a" }}>{rule.name}</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" }}>
                        <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.55rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>{rule.type}</span>
                        <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "0.55rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>Scope: {rule.roleScope}</span>
                        {rule.clientName && (
                          <span style={{ background: "#ecfdf5", color: "#047857", fontSize: "0.55rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>Client: {rule.clientName}</span>
                        )}
                        {rule.jobTitle && (
                          <span style={{ background: "#fdf2f8", color: "#9d174d", fontSize: "0.55rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>Job: {rule.jobTitle}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "3px" }}>
                      <button
                        onClick={() => handleToggleRuleStatus(rule.id)}
                        style={{
                          background: rule.status === "Active" ? "#dcfce7" : "#f1f5f9",
                          color: rule.status === "Active" ? "#16a34a" : "#475569",
                          border: "none",
                          borderRadius: "4px",
                          padding: "2px 5px",
                          fontSize: "0.58rem",
                          fontWeight: 800,
                          cursor: "pointer"
                        }}
                      >
                        {rule.status}
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "4px", padding: "2px 5px", fontSize: "0.58rem", fontWeight: 800, cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: "6px", borderTop: "1px solid #f1f5f9", paddingTop: "4px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {rule.criteria.map((c, i) => (
                        <span key={i} style={{ background: "#eff6ff", color: "#1e40af", fontSize: "0.58rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>
                          {c.target} Targets = ₹{c.reward.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPROVAL CENTER */}
        {activeTab === "approvals" && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.68rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Employee</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Designation</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>TL Name</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Achievement</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Value</th>
                  <th style={{ padding: "6px 8px", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {actions.filter(x => x.status === "Pending").map(act => (
                  <tr key={act.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "6px 8px", fontWeight: 700 }}>{act.employeeName}</td>
                    <td style={{ padding: "6px 8px" }}>{act.designation}</td>
                    <td style={{ padding: "6px 8px" }}>{act.tlName}</td>
                    <td style={{ padding: "6px 8px" }}>{act.achievement}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 800, color: "#4f46e5" }}>₹{act.actualAmount.toLocaleString()}</td>
                    <td style={{ padding: "6px 8px", textAlign: "center" }}>
                      <span style={{ background: "#fef3c7", color: "#d97706", fontSize: "0.55rem", fontWeight: 800, padding: "1px 4px", borderRadius: "4px" }}>{act.status}</span>
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "3px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleApproveAction(act.id)}
                          style={{ background: "#10b981", color: "#ffffff", border: "none", borderRadius: "4px", padding: "2px 5px", fontSize: "0.58rem", fontWeight: 800, cursor: "pointer" }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectAction(act.id)}
                          style={{ background: "#ef4444", color: "#ffffff", border: "none", borderRadius: "4px", padding: "2px 5px", fontSize: "0.58rem", fontWeight: 800, cursor: "pointer" }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {actions.filter(x => x.status === "Pending").length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>No pending approval parameters found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* RANKINGS BOARD */}
        {activeTab === "leaderboard" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", display: "block", marginBottom: "6px" }}>👑 Top Sourcing Performers</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {leaderboardRankings.topRecruiters.slice(0, 4).map((u, i) => (
                  <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", background: "#f8fafc", borderRadius: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#64748b" }}>#{i+1}</span>
                      <strong style={{ fontSize: "0.7rem" }}>{u.name}</strong>
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#4f46e5" }}>{u.selections} Selections</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", display: "block", marginBottom: "6px" }}>👥 Top Team Lead Segments</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {leaderboardRankings.topTeams.slice(0, 4).map((t, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", background: "#f8fafc", borderRadius: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#64748b" }}>#{i+1}</span>
                      <strong style={{ fontSize: "0.7rem" }}>{t.tlName} Team</strong>
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#10b981" }}>₹{t.earnings.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PREDICTIVE AI FORECAST */}
        {activeTab === "forecast" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "8px" }}>
              {[
                { title: "Weekly Potential", val: `₹${predictiveForecast.potentialWeek.toLocaleString()}` },
                { title: "Monthly Potential", val: `₹${predictiveForecast.potentialMonth.toLocaleString()}` },
                { title: "Quarterly Target", val: `₹${predictiveForecast.potentialQuarter.toLocaleString()}` },
                { title: "Yearly Projection", val: `₹${predictiveForecast.potentialYear.toLocaleString()}` }
              ].map((f, i) => (
                <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", background: "#f8fafc" }}>
                  <span style={{ fontSize: "0.55rem", fontWeight: 700, color: "#64748b", display: "block" }}>{f.title}</span>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 900, color: "#4f46e5", marginTop: "2px" }}>{f.val}</h4>
                </div>
              ))}
            </div>
            <div style={{ background: "#eff6ff", borderRadius: "6px", padding: "6px 10px", border: "1px dashed #bfdbfe", fontSize: "0.65rem", color: "#1e3a8a" }}>
              ℹ️ **AI Projection:** Dynamic evaluations indicate recruiter sourcing targets will reach 92% completion parameters. Focus TL nodes on candidate conversion.
            </div>
          </div>
        )}

        {/* PAYOUT HISTORY LOG */}
        {activeTab === "history" && (
          <div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <LucideSearch size={12} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search historical payout records..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  style={{ width: "100%", padding: "5px 8px 5px 24px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.68rem", outline: "none" }}
                />
              </div>
              <button
                onClick={exportCSV}
                style={{ background: "#4f46e5", color: "#ffffff", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "0.68rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
              >
                <LucideDownload size={11} /> CSV
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.68rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>ID</th>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>Employee</th>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>TL Name</th>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>Rule</th>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>Achievement</th>
                    <th style={{ padding: "6px 8px", textAlign: "right" }}>Released</th>
                    <th style={{ padding: "6px 8px", textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(act => (
                    <tr key={act.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "6px 8px", color: "#64748b" }}>{act.id}</td>
                      <td style={{ padding: "6px 8px", fontWeight: 700 }}>{act.employeeName}</td>
                      <td style={{ padding: "6px 8px" }}>{act.tlName}</td>
                      <td style={{ padding: "6px 8px" }}>{act.ruleName}</td>
                      <td style={{ padding: "6px 8px" }}>{act.achievement}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 800 }}>₹{act.actualAmount.toLocaleString()}</td>
                      <td style={{ padding: "6px 8px", textAlign: "center" }}>
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
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "12px", textAlign: "center", color: "#94a3b8" }}>No records match filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SVG TREND CURVES */}
        {activeTab === "analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#1e1b4b", display: "block", marginBottom: "4px" }}>📈 Sourcing Volume Performance</span>
              <svg viewBox="0 0 400 200" style={{ width: "100%", height: "110px" }}>
                <rect width="400" height="200" rx="8" fill="#f8fafc" />
                <path d="M 50 150 Q 120 120 200 90 T 350 40" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
                <circle cx="350" cy="40" r="5" fill="#4f46e5" />
                <line x1="50" y1="170" x2="350" y2="170" stroke="#cbd5e1" strokeWidth="2" />
              </svg>
            </div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#1e1b4b", display: "block", marginBottom: "4px" }}>📊 Placements Ratio</span>
              <svg viewBox="0 0 400 200" style={{ width: "100%", height: "110px" }}>
                <rect width="400" height="200" rx="8" fill="#f8fafc" />
                <rect x="80" y="60" width="30" height="110" rx="3" fill="#4f46e5" />
                <rect x="180" y="90" width="30" height="80" rx="3" fill="#0ea5e9" />
                <rect x="280" y="40" width="30" height="130" rx="3" fill="#10b981" />
                <line x1="40" y1="170" x2="360" y2="170" stroke="#cbd5e1" strokeWidth="2" />
              </svg>
            </div>
          </div>
        )}

        {/* AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {auditLogs.slice(0, 8).map((log, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", background: "#f8fafc", borderRadius: "6px", borderLeft: "3px solid #4f46e5" }}>
                <span style={{ fontSize: "0.68rem", color: "#1e293b" }}>{log.event}</span>
                <span style={{ fontSize: "0.58rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "2px" }}>
                  <LucideClock size={10} /> {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* RULE CREATION MODAL */}
      {showRuleModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 }}>
          <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "14px", width: "350px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 900, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", marginBottom: "8px" }}>Create Incentive Rule</h4>
            <form onSubmit={handleCreateRule}>
              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "0.62rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="Recruiter Monthly Goal"
                  value={newRuleName}
                  onChange={e => setNewRuleName(e.target.value)}
                  style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.68rem", outline: "none", marginTop: "3px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                <div>
                  <label style={{ fontSize: "0.62rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Type</label>
                  <select
                    value={newRuleType}
                    onChange={e => setNewRuleType(e.target.value)}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.68rem", outline: "none", marginTop: "3px" }}
                  >
                    <option value="Selection Based">Selection Based</option>
                    <option value="Joining Based">Joining Based</option>
                    <option value="Interview Based">Interview Based</option>
                    <option value="Registration Based">Registration Based</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.62rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Timeframe</label>
                  <select
                    value={newRuleTimeframe}
                    onChange={e => setNewRuleTimeframe(e.target.value as any)}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.68rem", outline: "none", marginTop: "3px" }}
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "0.62rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Role Scope</label>
                <select
                  value={newRuleScope}
                  onChange={e => setNewRuleScope(e.target.value as any)}
                  style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.68rem", outline: "none", marginTop: "3px" }}
                >
                  <option value="Recruiters">Recruiters</option>
                  <option value="TLs">TLs</option>
                  <option value="Entire Team">Entire Team</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                <div>
                  <label style={{ fontSize: "0.62rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Client Target (Optional)</label>
                  <select
                    value={newRuleClientId}
                    onChange={e => {
                      setNewRuleClientId(e.target.value);
                      setNewRuleJobId("");
                    }}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.68rem", outline: "none", marginTop: "3px" }}
                  >
                    <option value="">All Clients</option>
                    {clients.map(c => (
                      <option key={c.id || c._id} value={c.id || c._id}>{c.company || c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.62rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Job Target (Optional)</label>
                  <select
                    value={newRuleJobId}
                    onChange={e => setNewRuleJobId(e.target.value)}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.68rem", outline: "none", marginTop: "3px" }}
                  >
                    <option value="">All Jobs</option>
                    {filteredJobs.map(j => (
                      <option key={j.id || j._id} value={j.id || j._id}>{j.title || j.jobRole}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Milestone</span>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <input
                    type="number"
                    placeholder="Count"
                    value={criteriaPairs[0].target}
                    required
                    onChange={e => {
                      const updated = [...criteriaPairs];
                      updated[0].target = Number(e.target.value);
                      setCriteriaPairs(updated);
                    }}
                    style={{ flex: 1, padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.68rem", outline: "none" }}
                  />
                  <span style={{ fontSize: "0.65rem" }}>=</span>
                  <input
                    type="number"
                    placeholder="Payout (₹)"
                    value={criteriaPairs[0].reward}
                    required
                    onChange={e => {
                      const updated = [...criteriaPairs];
                      updated[0].reward = Number(e.target.value);
                      setCriteriaPairs(updated);
                    }}
                    style={{ flex: 1, padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.68rem", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  style={{ background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", padding: "5px 10px", fontSize: "0.68rem", fontWeight: 800, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#4f46e5", color: "#ffffff", border: "none", borderRadius: "6px", padding: "5px 10px", fontSize: "0.68rem", fontWeight: 800, cursor: "pointer" }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
