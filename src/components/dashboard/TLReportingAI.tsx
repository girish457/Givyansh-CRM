import React, { useState, useEffect } from "react";
import {
  LucideFileBarChart,
  LucideMail,
  LucideDownload,
  LucideCalendar,
  LucideUser,
  LucideLayers,
  LucideBriefcase,
  LucideGlobe,
  LucideSend,
  LucideCheckSquare,
  LucideSearch,
  LucideLoader2,
  LucideFileText,
  LucideInfo,
  LucideCheckCircle2,
  LucideAlertCircle,
  LucideChevronDown,
  LucideArrowRight,
  LucideX,
  LucideSettings,
  LucideDatabase,
  LucideSparkles,
  LucideHistory,
  LucideUsers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TLReportingAIProps {
  currentUser?: any;
  candidates?: any[];
  onRefresh?: () => void;
}

export default function TLReportingAI({ currentUser, candidates = [], onRefresh }: TLReportingAIProps) {
  // Recruiters List reporting to this TL
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [selectedRecruiterIds, setSelectedRecruiterIds] = useState<number[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Date Filters
  const [dateFilter, setDateFilter] = useState<
    "today" | "yesterday" | "specific" | "weekly" | "monthly" | "yearly" | "custom"
  >("today");
  const [specificDate, setSpecificDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Section Searches
  const [clientSearch, setClientSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [sourcingSearch, setSourcingSearch] = useState("");
  const [recruiterSearch, setRecruiterSearch] = useState("");

  // AI Summary Settings
  const [aiTone, setAiTone] = useState<"executive" | "detailed" | "highlights">("executive");
  const [customTLNotes, setCustomTLNotes] = useState("");

  // Email state
  const [emailTo, setEmailTo] = useState(""); // supports multiple comma-separated emails
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Hostinger Webmail Handshake State
  const [showMailSettings, setShowMailSettings] = useState(false);
  const [mailEmail, setMailEmail] = useState(() => localStorage.getItem("crm_reporting_tl_mail_email") || "");
  const [mailPassword, setMailPassword] = useState(() => localStorage.getItem("crm_reporting_tl_mail_password") || "");
  const [mailSmtpHost, setMailSmtpHost] = useState(() => localStorage.getItem("crm_reporting_tl_mail_smtp_host") || "smtp.hostinger.com");
  const [mailSmtpPort, setMailSmtpPort] = useState(() => localStorage.getItem("crm_reporting_tl_mail_smtp_port") || "465");
  const [mailImapHost, setMailImapHost] = useState(() => localStorage.getItem("crm_reporting_tl_mail_imap_host") || "imap.hostinger.com");
  const [mailImapPort, setMailImapPort] = useState(() => localStorage.getItem("crm_reporting_tl_mail_imap_port") || "993");
  const [isMailConnecting, setIsMailConnecting] = useState(false);
  const [isMailConnected, setIsMailConnected] = useState(() => localStorage.getItem("crm_reporting_tl_mail_connected") === "true");

  const [isSendingMail, setIsSendingMail] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false,
    msg: "",
    type: "success"
  });

  // Modal Detailed Breakdown
  const [breakdownModal, setBreakdownModal] = useState<{
    type: "client" | "job" | "sourcing";
    name: string;
    candidates: any[];
  } | null>(null);

  // Historical reports log
  const [reportHistory, setReportHistory] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("crm_reporting_tl_history_v1");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Tasks state
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    fetchTeamAndData();
  }, []);

  const fetchTeamAndData = async () => {
    setLoadingTeam(true);
    setLoadingTasks(true);
    try {
      const [teamRes, tasksRes] = await Promise.all([
        fetch("/api/team"),
        fetch("/api/tasks")
      ]);
      
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        const recruitersOnly = teamData.filter((t: any) => t.role === "recruiter");
        setRecruiters(recruitersOnly);
        // Default select all recruiters under TL team
        setSelectedRecruiterIds(recruitersOnly.map((r: any) => r.id));
      }
      
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        if (Array.isArray(data)) {
          setTasks(data);
          localStorage.setItem("givyansh_tasks_cache_v1", JSON.stringify(data));
        }
      } else {
        const cached = localStorage.getItem("givyansh_tasks_cache_v1");
        if (cached) setTasks(JSON.parse(cached));
      }
    } catch (err) {
      console.error("TL Reporting AI Handshake failed:", err);
      const cached = localStorage.getItem("givyansh_tasks_cache_v1");
      if (cached) setTasks(JSON.parse(cached));
    } finally {
      setLoadingTeam(false);
      setLoadingTasks(false);
    }
  };

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Connect SMTP / IMAP Node
  const handleConnectMailNode = async () => {
    if (!mailEmail || !mailPassword) {
      showToast("Email address and Password are required to verify SMTP Node.", "error");
      return;
    }
    setIsMailConnecting(true);
    try {
      const res = await fetch("/api/integrations/hostinger/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: mailEmail,
          password: mailPassword,
          smtpHost: mailSmtpHost,
          smtpPort: parseInt(mailSmtpPort) || 465,
          imapHost: mailImapHost,
          imapPort: parseInt(mailImapPort) || 993
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsMailConnected(true);
        localStorage.setItem("crm_reporting_tl_mail_connected", "true");
        localStorage.setItem("crm_reporting_tl_mail_email", mailEmail);
        localStorage.setItem("crm_reporting_tl_mail_password", mailPassword);
        localStorage.setItem("crm_reporting_tl_mail_smtp_host", mailSmtpHost);
        localStorage.setItem("crm_reporting_tl_mail_smtp_port", mailSmtpPort);
        localStorage.setItem("crm_reporting_tl_mail_imap_host", mailImapHost);
        localStorage.setItem("crm_reporting_tl_mail_imap_port", mailImapPort);
        showToast("TL SMTP Integration Node established and verified! 🚀", "success");
        setShowMailSettings(false);
      } else {
        throw new Error(data.error || "SMTP Handshake Failed");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to establish SMTP node.", "error");
    } finally {
      setIsMailConnecting(false);
    }
  };

  const handleDisconnectMailNode = () => {
    setIsMailConnected(false);
    localStorage.removeItem("crm_reporting_tl_mail_connected");
    localStorage.removeItem("crm_reporting_tl_mail_password");
    showToast("SMTP integration node unlinked successfully.", "success");
  };

  // Filter candidates belonging to SELECTED recruiters and active DATE period
  const filterCandidatesByRecruiterAndPeriod = () => {
    const today = new Date();
    
    // 1. Recruiter Selection filter
    const selectedRecruiterNames = recruiters
      .filter(r => selectedRecruiterIds.includes(r.id))
      .map(r => r.name.toLowerCase());

    const selectedRecruiterDbIds = selectedRecruiterIds.map(id => String(id));

    const teamCandidates = candidates.filter((c: any) => {
      const matchDbId = selectedRecruiterDbIds.includes(String(c.addedBy)) || selectedRecruiterDbIds.includes(String(c.assignedTo));
      const matchName = c.recruiterName && selectedRecruiterNames.includes(c.recruiterName.toLowerCase());
      return matchDbId || matchName;
    });

    // 2. Date Selection filter
    return teamCandidates.filter((c: any) => {
      const dateStr = c.sourcingDate || c.createdAt || c.updatedAt;
      if (!dateStr) return false;
      const cDate = new Date(dateStr);
      if (isNaN(cDate.getTime())) return false;

      const cleanCompare = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      switch (dateFilter) {
        case "today":
          return cleanCompare(cDate, today);
        case "yesterday":
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          return cleanCompare(cDate, yesterday);
        case "specific":
          if (!specificDate) return true;
          const sDate = new Date(specificDate);
          return cleanCompare(cDate, sDate);
        case "weekly":
          const lastWeek = new Date();
          lastWeek.setDate(today.getDate() - 7);
          return cDate >= lastWeek && cDate <= today;
        case "monthly":
          return cDate.getMonth() === today.getMonth() && cDate.getFullYear() === today.getFullYear();
        case "yearly":
          return cDate.getFullYear() === today.getFullYear();
        case "custom":
          if (!startDate || !endDate) return true;
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return cDate >= start && cDate <= end;
        default:
          return true;
      }
    });
  };

  const filteredCandidates = filterCandidatesByRecruiterAndPeriod();

  // Status mapping helper functions
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

  const getCandidateStatus = (c: any) => {
    const remarks = c.remarks || "";
    const cvStatus = c.cvStatus || "";
    const statusLower = remarks.trim().toLowerCase() || cvStatus.trim().toLowerCase();

    const possibleStatuses = [
      "Connected", "Not Connected", "Interested", "Not Interested", 
      "Selected", "Joined", "Go For Interview", "Process To Joining", 
      "Revert Later", "Call Not Pick", "Dropped"
    ];

    const matched = possibleStatuses.find(s => s.toLowerCase() === statusLower);
    return matched || "Registered Candidates";
  };

  const totalRegistered = filteredCandidates.length;

  const countByStatus = (statusName: string) => {
    return filteredCandidates.filter(c => isCandidateMatch(c, statusName)).length;
  };

  const statusMetrics = {
    connected: countByStatus("Connected"),
    notConnected: countByStatus("Not Connected"),
    interested: countByStatus("Interested"),
    notInterested: countByStatus("Not Interested"),
    selected: countByStatus("Selected"),
    joined: countByStatus("Joined"),
    goForInterview: countByStatus("Go For Interview"),
    processToJoining: countByStatus("Process To Joining"),
    revertLater: countByStatus("Revert Later"),
    callNotPick: countByStatus("Call Not Pick"),
    dropped: countByStatus("Dropped"),
    interviewDone: countByStatus("Interview Done"),
    interviewNotDone: countByStatus("Interview Not Done")
  };

  // Section: Client breakdown
  const getClientBreakdown = () => {
    const clientsMap: { [name: string]: any[] } = {};
    filteredCandidates.forEach(c => {
      const client = c.clientName || "Direct / No Client";
      if (!clientsMap[client]) clientsMap[client] = [];
      clientsMap[client].push(c);
    });

    return Object.keys(clientsMap).map(clientName => ({
      name: clientName,
      count: clientsMap[clientName].length,
      candidates: clientsMap[clientName]
    })).sort((a, b) => b.count - a.count);
  };

  const clientsBreakdown = getClientBreakdown();

  // Section: JOB/JD breakdown
  const getJobBreakdown = () => {
    const jobsMap: { [name: string]: any[] } = {};
    filteredCandidates.forEach(c => {
      const job = c.jobRole || c.designation || "General Sourcing / No JD";
      if (!jobsMap[job]) jobsMap[job] = [];
      jobsMap[job].push(c);
    });

    return Object.keys(jobsMap).map(jobName => ({
      name: jobName,
      count: jobsMap[jobName].length,
      candidates: jobsMap[jobName]
    })).sort((a, b) => b.count - a.count);
  };

  const jobsBreakdown = getJobBreakdown();

  // Section: Sourcing platform breakdown
  const getSourcingBreakdown = () => {
    const sourcingMap: { [name: string]: any[] } = {};
    filteredCandidates.forEach(c => {
      const source = c.sourcingBy || "Database Search";
      if (!sourcingMap[source]) sourcingMap[source] = [];
      sourcingMap[source].push(c);
    });

    return Object.keys(sourcingMap).map(sourceName => ({
      name: sourceName,
      count: sourcingMap[sourceName].length,
      candidates: sourcingMap[sourceName]
    })).sort((a, b) => b.count - a.count);
  };

  const sourcingBreakdown = getSourcingBreakdown();

  // Section: Lead Data breakdown
  const getLeadBreakdown = () => {
    try {
      const leadCache = JSON.parse(localStorage.getItem("givyansh_lead_data_v1") || "{}");
      const recruiterLeads = filteredCandidates.filter(c => leadCache[c.id || c._id]);
      
      const leadCategories: { [name: string]: number } = {};
      recruiterLeads.forEach(c => {
        const leadInfo = leadCache[c.id || c._id];
        if (leadInfo && Array.isArray(leadInfo.categories)) {
          leadInfo.categories.forEach((cat: string) => {
            leadCategories[cat] = (leadCategories[cat] || 0) + 1;
          });
        }
      });

      return Object.keys(leadCategories).map(catName => ({
        name: catName,
        count: leadCategories[catName]
      })).sort((a, b) => b.count - a.count);
    } catch {
      return [];
    }
  };

  const leadBreakdown = getLeadBreakdown();
  const totalLeadsCount = leadBreakdown.reduce((sum, item) => sum + item.count, 0);

  // Section: Tasks Summary
  const getActiveTasksSummary = () => {
    const selectedDbIds = selectedRecruiterIds.map(id => String(id));
    const selectedRecruiterNames = recruiters
      .filter(r => selectedRecruiterIds.includes(r.id))
      .map(r => r.name.toLowerCase());

    const relevantTasks = tasks.filter(t => {
      const matchesDbId = selectedDbIds.includes(String(t.assigneeId));
      const matchesName = t.assignee?.name && selectedRecruiterNames.includes(t.assignee.name.toLowerCase());
      return matchesDbId || matchesName;
    });

    const active = relevantTasks.filter(t => t.status !== "completed" && t.status !== "cancelled");
    const completed = relevantTasks.filter(t => t.status === "completed");

    const activeList = active.map(t => {
      const isTarget = t.taskType === "target";
      const completionPct = isTarget && t.targetQuantity ? Math.min(100, Math.round((t.completedQuantity / t.targetQuantity) * 100)) : 0;
      const remaining = isTarget ? Math.max(0, t.targetQuantity - t.completedQuantity) : 1;
      
      let deadline = "Today";
      if (t.duration === "this_week") deadline = "This Week";
      else if (t.duration === "this_month") deadline = "This Month";
      else if (t.duration === "custom" && t.customEndDate) deadline = new Date(t.customEndDate).toLocaleDateString();

      return {
        id: t.id,
        title: t.title,
        completionPct,
        remaining,
        deadline,
        assignee: t.assignee?.name || `Recruiter ${t.assigneeId}`
      };
    });

    return {
      activeList,
      completedCount: completed.length
    };
  };

  const { activeList: activeTasks, completedCount: completedTasksCount } = getActiveTasksSummary();

  const getStatusSummary = (list: any[]) => {
    const counts: { [key: string]: number } = {
      "Connected": 0, "Not Connected": 0, "Interested": 0, "Not Interested": 0,
      "Selected": 0, "Joined": 0, "Go For Interview": 0, "Process To Joining": 0,
      "Revert Later": 0, "Call Not Pick": 0, "Dropped": 0
    };
    Object.keys(counts).forEach(key => {
      counts[key] = list.filter(c => isCandidateMatch(c, key)).length;
    });
    return counts;
  };

  // Smart AI insights
  const getSmartInsights = () => {
    const insights = [];

    // Find best recruiter based on candidate counts
    const recruiterCounts: { [name: string]: number } = {};
    const joinedRecruiterCounts: { [name: string]: number } = {};
    
    filteredCandidates.forEach(c => {
      const name = c.recruiterName || "Unknown Recruiter";
      recruiterCounts[name] = (recruiterCounts[name] || 0) + 1;
      if (isCandidateMatch(c, "joined")) {
        joinedRecruiterCounts[name] = (joinedRecruiterCounts[name] || 0) + 1;
      }
    });

    const bestRecruiter = Object.keys(recruiterCounts).length > 0 
      ? Object.keys(recruiterCounts).reduce((a, b) => recruiterCounts[a] > recruiterCounts[b] ? a : b) 
      : "N/A";

    const topJoiningRecruiter = Object.keys(joinedRecruiterCounts).length > 0
      ? Object.keys(joinedRecruiterCounts).reduce((a, b) => joinedRecruiterCounts[a] > joinedRecruiterCounts[b] ? a : b)
      : "N/A";

    if (bestRecruiter !== "N/A") {
      insights.push(`Top active recruiter today is **${bestRecruiter}** with **${recruiterCounts[bestRecruiter]}** candidate actions.`);
    }
    if (topJoiningRecruiter !== "N/A") {
      insights.push(`Highest onboarding conversion achieved by **${topJoiningRecruiter}** with successfully joined candidates.`);
    }
    if (sourcingBreakdown.length > 0) {
      insights.push(`Top sourcing platform is **${sourcingBreakdown[0].name}** supporting **${sourcingBreakdown[0].count}** registrations.`);
    }
    if (jobsBreakdown.length > 0) {
      insights.push(`Highest conversion JOB/JD is currently **${jobsBreakdown[0].name}**.`);
    }
    
    // Check weak performance warnings
    recruiters.forEach(r => {
      const count = recruiterCounts[r.name] || 0;
      if (count === 0 && selectedRecruiterIds.includes(r.id)) {
        insights.push(`⚠️ Sourcing alert: **${r.name}** has registered 0 CRM actions during this period.`);
      }
    });

    if (insights.length < 3) {
      insights.push(
        "Team desking and client transitions remain stable under normal volume.",
        "Candidate status checkpoints sync perfectly with active client criteria."
      );
    }
    return insights.slice(0, 5);
  };

  const smartInsights = getSmartInsights();

  // AI Written TL Manager Report Builder
  const generateAiReportText = () => {
    const todayStr = new Date().toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const tlName = currentUser?.name || "Team Lead commander";
    const selectedRecruiterCount = recruiters.filter(r => selectedRecruiterIds.includes(r.id)).length;
    const selectedNames = recruiters.filter(r => selectedRecruiterIds.includes(r.id)).map(r => r.name).join(", ");

    let clientsStr = clientsBreakdown.slice(0, 2).map(c => c.name).join(", ");
    if (!clientsStr) clientsStr = "key operational clients";

    let JDsStr = jobsBreakdown.slice(0, 2).map(j => j.name).join(", ");
    if (!JDsStr) JDsStr = "assigned roles";

    let customNotes = "";
    if (customTLNotes.trim()) {
      customNotes = `\nTL Directives & Highlights: ${customTLNotes.trim()}`;
    }

    if (aiTone === "detailed") {
      return `Subject: Performance Audit & Talent Acquisition Diagnostics - Team Lead ${tlName} - ${todayStr}

Dear Executive Directors and Operations Partners,

I am presenting the detailed Sourcing Diagnostics and Recruiter Performance Audit for ${todayStr}. Sourcing data aggregates the desking activities of ${selectedRecruiterCount} recruiters: [${selectedNames}].

Recruiter Sourcing Funnel Output:
• Attributed Candidate registrations: ${totalRegistered} Profiles
• Connected Outreach Conversion: ${statusMetrics.connected}
• Scheduled Interviews: ${statusMetrics.goForInterview}
• Client Selections: ${statusMetrics.selected}
• Successfully Joined & Retained: ${statusMetrics.joined}
• Qualified Lead Pipeline: ${totalLeadsCount} Sourced Contacts

Active Client & Job Mapping:
Major desking activity was focused on client accounts including: ${clientsStr}, satisfying roles such as: ${JDsStr}. Funnel status counts highlight ${statusMetrics.processToJoining} in final stages of joining, ${statusMetrics.revertLater} deferred, and ${statusMetrics.dropped} dropped.

Operational Compliance:
Active team tasks: ${activeTasks.length} in progress. Completed tasks: ${completedTasksCount} directives.${customNotes}

Audit observations:
The team maintains good sourcing momentum with excellent outreach connection parameters. Sourcing platforms continue to feed the pipeline. We are concentrating efforts on accelerating client interview slots to shorten desking time frames.

Respectfully Submitted,
${tlName}
Team Lead Node`;
    }

    if (aiTone === "highlights") {
      return `Subject: Recruiter Sourcing Highlights & Daily Alerts - ${todayStr}

Management Partners,

Daily Talent Acquisition Highlights for ${todayStr} under Team Lead ${tlName}:

Key Sourcing Highlights:
- CRM Candidate Input: ${totalRegistered} active profiles.
- Connection Conversion: ${statusMetrics.connected} outreaches connected.
- Pipeline Closure: ${statusMetrics.joined} candidates successfully joined.
- Sourced leads: ${totalLeadsCount} profiles qualified domain-wise.

Active Client Accounts: ${clientsStr}. Key JDs Cleared: ${JDsStr}.
Operations Compliance: ${activeTasks.length} tasks in progress | ${completedTasksCount} completed targets.${customNotes}

Operational Highlights:
The sourcing pipeline shows robust output today. Specific follow-ups are active to transition selections into joined candidates. Sourcing channels are optimized to support peak demand.

Sincerely,
${tlName}
Team Lead`;
    }

    // Default: Executive Summary Tone
    return `Subject: Executive Team Sourcing Report - Team Lead ${tlName} - ${todayStr}

Dear Operations Management,

Please find the executive recruiter work summary and talent acquisition audit for ${todayStr}, compiled under Team Lead ${tlName} for selected recruiters: [${selectedNames}].

Sourcing & CRM Funnel Diagnostics:
• Total Candidates Handled: ${totalRegistered}
• Connected Outreach: ${statusMetrics.connected}
• Not Connected: ${statusMetrics.notConnected}
• Interested Leads: ${statusMetrics.interested}
• Not Interested: ${statusMetrics.notInterested}
• Scheduled Interviews: ${statusMetrics.goForInterview}
• Client Selections: ${statusMetrics.selected}
• Successfully Joined: ${statusMetrics.joined}
• Process To Joining: ${statusMetrics.processToJoining}
• Revert Later: ${statusMetrics.revertLater}
• Call Not Pick: ${statusMetrics.callNotPick}
• Dropped: ${statusMetrics.dropped}

Operational Pipelines:
• Qualified Leads Sourced: ${totalLeadsCount} contacts
• Active Tasks In Progress: ${activeTasks.length} tasks
• Completed Tasks: ${completedTasksCount} tasks
• Clients Handled: ${clientsStr}
• Job Profiles Handled: ${JDsStr}
${customNotes}

Summary:
Recruitment velocity is within optimal parameters. Selection clearances show premium matching efficiency. Let me know if any client-wise priority adjustments are needed.

Best Regards,
${tlName}
Team Lead commander`;
  };

  // Live Sync precomposed subject and body
  useEffect(() => {
    const text = generateAiReportText();
    const lines = text.split("\n");
    const subjectLine = lines.find(l => l.startsWith("Subject:"));
    const subject = subjectLine ? subjectLine.replace("Subject: ", "") : `Team Lead Executive Sourcing Report - ${currentUser?.name || "TL"}`;
    const body = text.replace(/Subject:.*\n/, "");
    
    setEmailSubject(subject);
    setEmailBody(body);
  }, [dateFilter, specificDate, startDate, endDate, selectedRecruiterIds, aiTone, candidates, tasks, customTLNotes]);

  // Dispatch email report to multiple recipients
  const handleDispatchEmailReport = async () => {
    if (!emailTo) {
      showToast("Recipient email address is mandatory (comma-separate multiple).", "error");
      return;
    }
    if (!isMailConnected) {
      showToast("Please link SMTP Webmail credentials first.", "error");
      setShowMailSettings(true);
      return;
    }

    setIsSendingMail(true);
    try {
      // Split by comma and clean whitespace
      const recipients = emailTo.split(",").map(email => email.trim()).filter(email => email);
      
      // Dispatch sequentially to all recipients
      for (const toEmail of recipients) {
        const res = await fetch("/api/integrations/hostinger/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: mailEmail,
            password: mailPassword,
            smtpHost: mailSmtpHost,
            smtpPort: parseInt(mailSmtpPort) || 465,
            to: toEmail,
            subject: emailSubject,
            body: emailBody
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Email delivery failed for ${toEmail}`);
        }
      }

      showToast(`Daily Team Report delivered successfully to ${emailTo}! 📨`, "success");
      
      const newLog = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        recipients: emailTo,
        subject: emailSubject,
        body: emailBody,
        totalSourced: totalRegistered,
        selected: statusMetrics.selected,
        joined: statusMetrics.joined
      };
      const updatedHistory = [newLog, ...reportHistory].slice(0, 50);
      setReportHistory(updatedHistory);
      localStorage.setItem("crm_reporting_tl_history_v1", JSON.stringify(updatedHistory));
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to dispatch email report.", "error");
    } finally {
      setIsSendingMail(false);
    }
  };

  // Multi-sheet Excel XML downloader
  const handleExportExcel = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>${currentUser?.name || "Team Lead"}</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#111827" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="Title">
      <Font ss:Size="14" ss:Bold="1"/>
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
    </Style>
  </Styles>
  
  <Worksheet ss:Name="Candidate Analytics">
    <Table>
      <Column ss:Width="200"/>
      <Column ss:Width="100"/>
      <Row ss:Height="25">
        <Cell ss:StyleID="Title"><Data ss:Type="String">Team Sourcing Analytics Summary</Data></Cell>
      </Row>
      <Row />
      <Row ss:Height="20">
        <Cell ss:StyleID="Header"><Data ss:Type="String">Pipeline Transition Stage</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Aggregated Count</Data></Cell>
      </Row>
      <Row><Cell><Data ss:Type="String">Total CRM Registrations</Data></Cell><Cell><Data ss:Type="Number">${totalRegistered}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Connected Outreach</Data></Cell><Cell><Data ss:Type="Number">${statusMetrics.connected}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Not Connected</Data></Cell><Cell><Data ss:Type="Number">${statusMetrics.notConnected}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Interested Candidates</Data></Cell><Cell><Data ss:Type="Number">${statusMetrics.interested}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Not Interested</Data></Cell><Cell><Data ss:Type="Number">${statusMetrics.notInterested}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Go For Interview</Data></Cell><Cell><Data ss:Type="Number">${statusMetrics.goForInterview}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Process To Joining</Data></Cell><Cell><Data ss:Type="Number">${statusMetrics.processToJoining}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Revert Later</Data></Cell><Cell><Data ss:Type="Number">${statusMetrics.revertLater}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Call Not Pick</Data></Cell><Cell><Data ss:Type="Number">${statusMetrics.callNotPick}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Dropped Profiles</Data></Cell><Cell><Data ss:Type="Number">${statusMetrics.dropped}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Client Selections</Data></Cell><Cell><Data ss:Type="Number">${statusMetrics.selected}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Onboarded &amp; Joined</Data></Cell><Cell><Data ss:Type="Number">${statusMetrics.joined}</Data></Cell></Row>
    </Table>
  </Worksheet>

  <Worksheet ss:Name="Client Analytics">
    <Table>
      <Column ss:Width="250"/>
      <Column ss:Width="100"/>
      <Row ss:Height="25">
        <Cell ss:StyleID="Title"><Data ss:Type="String">Client Sourcing Breakdown</Data></Cell>
      </Row>
      <Row />
      <Row ss:Height="20">
        <Cell ss:StyleID="Header"><Data ss:Type="String">Client Corporate Name</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Candidate Count</Data></Cell>
      </Row>
      ${clientsBreakdown.map(c => `
      <Row>
        <Cell><Data ss:Type="String">${c.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>
        <Cell><Data ss:Type="Number">${c.count}</Data></Cell>
      </Row>`).join("")}
    </Table>
  </Worksheet>

  <Worksheet ss:Name="JOB JD Analytics">
    <Table>
      <Column ss:Width="250"/>
      <Column ss:Width="100"/>
      <Row ss:Height="25">
        <Cell ss:StyleID="Title"><Data ss:Type="String">JOB / JD Allocation Breakdown</Data></Cell>
      </Row>
      <Row />
      <Row ss:Height="20">
        <Cell ss:StyleID="Header"><Data ss:Type="String">JOB/JD Profile Name</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Candidate Count</Data></Cell>
      </Row>
      ${jobsBreakdown.map(j => `
      <Row>
        <Cell><Data ss:Type="String">${j.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>
        <Cell><Data ss:Type="Number">${j.count}</Data></Cell>
      </Row>`).join("")}
    </Table>
  </Worksheet>

  <Worksheet ss:Name="Sourcing Analytics">
    <Table>
      <Column ss:Width="250"/>
      <Column ss:Width="100"/>
      <Row ss:Height="25">
        <Cell ss:StyleID="Title"><Data ss:Type="String">Sourcing Channel Breakdown</Data></Cell>
      </Row>
      <Row />
      <Row ss:Height="20">
        <Cell ss:StyleID="Header"><Data ss:Type="String">Sourcing Platform</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Candidate Count</Data></Cell>
      </Row>
      ${sourcingBreakdown.map(s => `
      <Row>
        <Cell><Data ss:Type="String">${s.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>
        <Cell><Data ss:Type="Number">${s.count}</Data></Cell>
      </Row>`).join("")}
    </Table>
  </Worksheet>

  <Worksheet ss:Name="Lead Analytics">
    <Table>
      <Column ss:Width="250"/>
      <Column ss:Width="100"/>
      <Row ss:Height="25">
        <Cell ss:StyleID="Title"><Data ss:Type="String">Lead Categories Breakdown</Data></Cell>
      </Row>
      <Row />
      <Row ss:Height="20">
        <Cell ss:StyleID="Header"><Data ss:Type="String">Lead Domain / Field</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Leads Sourced</Data></Cell>
      </Row>
      ${leadBreakdown.map(l => `
      <Row>
        <Cell><Data ss:Type="String">${l.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>
        <Cell><Data ss:Type="Number">${l.count}</Data></Cell>
      </Row>`).join("")}
    </Table>
  </Worksheet>

  <Worksheet ss:Name="Task Analytics">
    <Table>
      <Column ss:Width="200"/>
      <Column ss:Width="120"/>
      <Column ss:Width="100"/>
      <Column ss:Width="100"/>
      <Column ss:Width="100"/>
      <Row ss:Height="25">
        <Cell ss:StyleID="Title"><Data ss:Type="String">Team Active Tasks Summary</Data></Cell>
      </Row>
      <Row />
      <Row ss:Height="20">
        <Cell ss:StyleID="Header"><Data ss:Type="String">Task Title</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Assignee</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Completion %</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Remaining Target</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Deadline</Data></Cell>
      </Row>
      ${activeTasks.map(t => `
      <Row>
        <Cell><Data ss:Type="String">${t.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>
        <Cell><Data ss:Type="String">${t.assignee.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>
        <Cell><Data ss:Type="Number">${t.completionPct}</Data></Cell>
        <Cell><Data ss:Type="Number">${t.remaining}</Data></Cell>
        <Cell><Data ss:Type="String">${t.deadline}</Data></Cell>
      </Row>`).join("")}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `TL_AI_TeamWorkReport_${currentUser?.name || "TL"}_${todayStr}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Excel XML Multi-sheet report generated successfully!", "success");
  };

  // PDF print prompt
  const handleExportPDF = () => {
    const todayStr = new Date().toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const tlName = currentUser?.name || "Team Lead commander";
    const selectedRecruiterCount = recruiters.filter(r => selectedRecruiterIds.includes(r.id)).length;
    const selectedNames = recruiters.filter(r => selectedRecruiterIds.includes(r.id)).map(r => r.name).join(", ");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Pop-up blocked. Please allow popups to export PDF.", "error");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Daily Team Sourcing Summary - ${tlName}</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #111827; line-height: 1.5; margin: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 25px; }
            .header h1 { font-size: 24px; margin: 0; color: #111827; }
            .header p { margin: 5px 0 0; font-size: 14px; color: #6b7280; font-weight: 500; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #d1d5db; }
            .meta-grid div { font-size: 13px; }
            .meta-grid strong { color: #111827; }
            .section-title { font-size: 16px; font-weight: 800; border-bottom: 1.5px solid #d1d5db; padding-bottom: 5px; margin-top: 25px; margin-bottom: 12px; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th, td { padding: 8px 12px; border: 1px solid #d1d5db; text-align: left; }
            th { background: #f3f4f6; color: #374151; font-weight: 700; }
            .summary-box { background: #f3f4f6; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; color: #1f2937; line-height: 1.6; margin-bottom: 20px; white-space: pre-line; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Team Sourcing & Performance Report</h1>
              <p>Team Lead AI Reporting Dashboard Summary</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 12px; font-weight: 700; color: #111827; border: 1.5px solid #111827; padding: 4px 8px; border-radius: 6px; background: #ffffff;">Executive Grade</span>
            </div>
          </div>

          <div class="meta-grid">
            <div>Team Commander: <strong>${tlName}</strong></div>
            <div>Audited Period: <strong>${dateFilter.toUpperCase()} (${todayStr})</strong></div>
            <div>Selected recruiters count: <strong>${selectedRecruiterCount} (${selectedNames})</strong></div>
            <div>Attributed CRM Candidates: <strong>${totalRegistered} Active Profiles</strong></div>
          </div>

          <div class="section-title">Daily Sourcing Summary (AI Written)</div>
          <div class="summary-box">${emailBody.replace(/\n/g, "<br>")}</div>

          <div class="section-title">Aggregated Candidate Analytics</div>
          <table>
            <thead>
              <tr>
                <th>Funnel Stage Transition</th>
                <th>Aggregated Volume</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Total CRM Registrations</td><td><strong>${totalRegistered}</strong></td></tr>
              <tr><td>Connected</td><td>${statusMetrics.connected}</td></tr>
              <tr><td>Not Connected</td><td>${statusMetrics.notConnected}</td></tr>
              <tr><td>Interested</td><td>${statusMetrics.interested}</td></tr>
              <tr><td>Not Interested</td><td>${statusMetrics.notInterested}</td></tr>
              <tr><td>Go For Interview</td><td><strong>${statusMetrics.goForInterview}</strong></td></tr>
              <tr><td>Process To Joining</td><td>${statusMetrics.processToJoining}</td></tr>
              <tr><td>Revert Later</td><td>${statusMetrics.revertLater}</td></tr>
              <tr><td>Call Not Pick</td><td>${statusMetrics.callNotPick}</td></tr>
              <tr><td>Dropped</td><td>${statusMetrics.dropped}</td></tr>
              <tr><td>Selections</td><td><strong>${statusMetrics.selected}</strong></td></tr>
              <tr><td>Successfully Joined</td><td><strong>${statusMetrics.joined}</strong></td></tr>
            </tbody>
          </table>

          <div class="section-title">Client-Wise Sourcing Overview</div>
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Sourced Candidate Count</th>
              </tr>
            </thead>
            <tbody>
              ${clientsBreakdown.map(c => `<tr><td>${c.name}</td><td><strong>${c.count}</strong></td></tr>`).join("")}
            </tbody>
          </table>

          <div class="section-title">JOB / JD Sourcing Overview</div>
          <table>
            <thead>
              <tr>
                <th>JOB/JD Profile Name</th>
                <th>Processed Candidate Count</th>
              </tr>
            </thead>
            <tbody>
              ${jobsBreakdown.map(j => `<tr><td>${j.name}</td><td><strong>${j.count}</strong></td></tr>`).join("")}
            </tbody>
          </table>

          <div class="section-title">Sourcing Platform Channels</div>
          <table>
            <thead>
              <tr>
                <th>Sourcing Platform</th>
                <th>Candidate Count</th>
              </tr>
            </thead>
            <tbody>
              ${sourcingBreakdown.map(s => `<tr><td>${s.name}</td><td><strong>${s.count}</strong></td></tr>`).join("")}
            </tbody>
          </table>

          <div class="section-title">Lead Category Pipeline</div>
          <table>
            <thead>
              <tr>
                <th>Lead Domain / Field</th>
                <th>Qualified Leads Sourced</th>
              </tr>
            </thead>
            <tbody>
              ${leadBreakdown.length === 0 ? "<tr><td colspan='2'>No leads recorded for this selection.</td></tr>" : leadBreakdown.map(l => `<tr><td>${l.name}</td><td><strong>${l.count}</strong></td></tr>`).join("")}
            </tbody>
          </table>

          <div class="section-title">Team Active Directives Summary</div>
          <table>
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Assignee</th>
                <th>Completion Rate</th>
                <th>Remaining Target</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              ${activeTasks.length === 0 ? "<tr><td colspan='5'>All team operational tasks cleared. No active tasks.</td></tr>" : activeTasks.map(t => `
                <tr>
                  <td>${t.title}</td>
                  <td>${t.assignee}</td>
                  <td><strong>${t.completionPct}%</strong></td>
                  <td>${t.remaining}</td>
                  <td>${t.deadline}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div style="text-align: center; margin-top: 40px; font-size: 11px; color: #9b9ea3; border-top: 1px solid #cbd5e1; padding-top: 15px;">
            Daily Team Report Generated Dynamically by Fast RMS TL Reporting AI Portal Node. Confidential Document.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
    };
    showToast("PDF printable layout generated successfully!", "success");
  };

  const handleLoadHistoricalReport = (log: any) => {
    setEmailSubject(log.subject);
    setEmailBody(log.body);
    setEmailTo(log.recipients);
    showToast("Historical report summary loaded to composer context!", "success");
  };

  return (
    <div className="module-container" style={{ position: "relative", height: "100%", overflowY: "auto", background: "#f8fafc", padding: "1.25rem", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* Toast Popup */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 100000,
              background: toast.type === "success" ? "#10b981" : "#ef4444",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 800,
              fontSize: "0.85rem"
            }}
          >
            {toast.type === "success" ? <LucideCheckCircle2 size={16} /> : <LucideAlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section with compact design */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>TL Team </span>
            <span style={{ color: "#2563eb" }}>Reporting AI</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", margin: "2px 0 0 0", fontWeight: 500 }}>
            Automated multi-recruiter audits, client breakthroughs, multi-sheet exports, and verified email dispatch.
          </p>
        </div>

        {/* Action controls */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowMailSettings(!showMailSettings)}
            style={{
              background: isMailConnected ? "#ecfdf5" : "#ffffff",
              color: isMailConnected ? "#047857" : "#475569",
              border: `1.5px solid ${isMailConnected ? "#a7f3d0" : "#cbd5e1"}`,
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s"
            }}
          >
            <LucideSettings size={14} />
            {isMailConnected ? "SMTP Webmail Connected" : "Link SMTP"}
          </button>
          
          <button
            onClick={handleExportExcel}
            style={{
              background: "#ffffff",
              color: "#16a34a",
              border: "1.5px solid #bbf7d0",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s"
            }}
          >
            <LucideDownload size={14} /> Export Excel
          </button>

          <button
            onClick={handleExportPDF}
            style={{
              background: "#111827",
              color: "#ffffff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s",
              boxShadow: "0 4px 10px rgba(17, 24, 39, 0.15)"
            }}
          >
            <LucideFileText size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Hostinger Integration Settings Drawer */}
      <AnimatePresence>
        {showMailSettings && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "white", width: "90%", maxWidth: "450px", borderRadius: "18px", padding: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.12)", border: "1px solid #cbd5e1" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}><LucideMail size={16} color="#111827" /> Team Lead SMTP Dispatcher Handshake</h3>
                <button onClick={() => setShowMailSettings(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={18} color="#64748b" /></button>
              </div>

              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0 0 1rem", lineHeight: 1.4 }}>
                Enter credentials to connect your <strong>Hostinger Webmail</strong> or <strong>Gmail SMTP Node</strong> for secure daily reporting.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "4px" }}>SMTP Email Username</label>
                  <input
                    type="email"
                    value={mailEmail}
                    onChange={e => setMailEmail(e.target.value)}
                    placeholder="e.g. tl@company.com"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.8rem" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "4px" }}>Password</label>
                  <input
                    type="password"
                    value={mailPassword}
                    onChange={e => setMailPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.8rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "4px" }}>SMTP Host</label>
                    <input
                      type="text"
                      value={mailSmtpHost}
                      onChange={e => setMailSmtpHost(e.target.value)}
                      placeholder="smtp.hostinger.com"
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.78rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "4px" }}>SMTP Port</label>
                    <input
                      type="text"
                      value={mailSmtpPort}
                      onChange={e => setMailSmtpPort(e.target.value)}
                      placeholder="465"
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.78rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "4px" }}>IMAP Host</label>
                    <input
                      type="text"
                      value={mailImapHost}
                      onChange={e => setMailImapHost(e.target.value)}
                      placeholder="imap.hostinger.com"
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.78rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "4px" }}>IMAP Port</label>
                    <input
                      type="text"
                      value={mailImapPort}
                      onChange={e => setMailImapPort(e.target.value)}
                      placeholder="993"
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.78rem" }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "1rem", display: "flex", gap: "10px" }}>
                  {isMailConnected ? (
                    <button
                      onClick={handleDisconnectMailNode}
                      style={{ flex: 1, padding: "10px", border: "1px solid #fecdd3", background: "#fef2f2", color: "#e11d48", borderRadius: "10px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
                    >
                      Unlink SMTP Credentials
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectMailNode}
                      disabled={isMailConnecting}
                      style={{ flex: 1, padding: "10px", border: "none", background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)", color: "white", borderRadius: "10px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      {isMailConnecting ? (
                        <>
                          <LucideLoader2 className="animate-spin" size={14} /> Verifying SMTP...
                        </>
                      ) : (
                        "Verify & Connect"
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setShowMailSettings(false)}
                    style={{ padding: "10px 16px", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "10px", fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recruiter Selection Checklist Panel */}
      <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <LucideUsers size={16} color="#111827" />
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#111827" }}>SELECT RECRUITERS FOR AI REPORT AUDIT:</span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setSelectedRecruiterIds(recruiters.map(r => r.id))}
              style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "0.72rem", fontWeight: 800 }}
            >
              Select All (Entire Team)
            </button>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <button
              onClick={() => setSelectedRecruiterIds([])}
              style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "0.72rem", fontWeight: 800 }}
            >
              Clear Selection
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          {loadingTeam ? (
            <LucideLoader2 className="animate-spin" size={16} color="#111827" />
          ) : recruiters.length === 0 ? (
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>No active recruiters assigned under your TL hierarchy.</span>
          ) : (
            recruiters.map(rec => {
              const isChecked = selectedRecruiterIds.includes(rec.id);
              return (
                <label
                  key={rec.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: isChecked ? "#f3f4f6" : "#ffffff",
                    border: `1.5px solid ${isChecked ? "#111827" : "#cbd5e1"}`,
                    padding: "4px 10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontWeight: isChecked ? 800 : 500,
                    userSelect: "none",
                    transition: "all 0.15s"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedRecruiterIds(prev => [...prev, rec.id]);
                      } else {
                        setSelectedRecruiterIds(prev => prev.filter(id => id !== rec.id));
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  />
                  {rec.name}
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Date Periods / Filter Controls */}
      <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #cbd5e1", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "1.25rem", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <LucideCalendar size={16} color="#111827" />
          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569" }}>AUDIT DATE FILTER:</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {[
            { id: "today", label: "Today Live" },
            { id: "yesterday", label: "Yesterday" },
            { id: "specific", label: "Specific Date" },
            { id: "weekly", label: "Weekly Audit" },
            { id: "monthly", label: "Monthly" },
            { id: "yearly", label: "Yearly" },
            { id: "custom", label: "Custom Range" }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setDateFilter(t.id as any)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: dateFilter === t.id ? 800 : 600,
                cursor: "pointer",
                transition: "all 0.15s",
                background: dateFilter === t.id ? "#f3f4f6" : "#f1f5f9",
                color: dateFilter === t.id ? "#111827" : "#64748b",
                border: dateFilter === t.id ? "1px solid #111827" : "1px solid transparent"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {dateFilter === "specific" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <input
              type="date"
              value={specificDate}
              onChange={e => setSpecificDate(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", fontWeight: 600, color: "#334155" }}
            />
          </motion.div>
        )}

        {dateFilter === "custom" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", fontWeight: 600 }}
            />
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", fontWeight: 600 }}
            />
          </motion.div>
        )}
      </div>

      {/* Grid: Primary Funnel & Candidate Analytics */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.25rem", marginBottom: "1.25rem", alignItems: "stretch" }}>
        
        {/* Section 2: Candidate Analytics */}
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <LucideLayers size={16} color="#111827" />
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>Aggregated Team Funnel Analytics</h3>
            </div>
            <span style={{ fontSize: "0.68rem", fontWeight: 900, background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "6px" }}>Live Sync</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[
              { label: "CRM Registrations", val: totalRegistered, bg: "#f3f4f6", text: "#111827", border: "#cbd5e1" },
              { label: "Connected outreach", val: statusMetrics.connected, bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
              { label: "Not Connected", val: statusMetrics.notConnected, bg: "#f8fafc", text: "#475569", border: "#cbd5e1" },
              { label: "Interested Leads", val: statusMetrics.interested, bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
              { label: "Not Interested", val: statusMetrics.notInterested, bg: "#fef2f2", text: "#991b1b", border: "#fecdd3" },
              { label: "Go For Interview", val: statusMetrics.goForInterview, bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
              { label: "Process To Joining", val: statusMetrics.processToJoining, bg: "#ecfeff", text: "#075985", border: "#a5f3fc" },
              { label: "Revert Later", val: statusMetrics.revertLater, bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
              { label: "Call Not Pick", val: statusMetrics.callNotPick, bg: "#fff7ed", text: "#c2410c", border: "#ffedd5" },
              { label: "Dropped Profiles", val: statusMetrics.dropped, bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },
              { label: "Cleared & Selected", val: statusMetrics.selected, bg: "#f5f3ff", text: "#5b21b6", border: "#d8b4fe" },
              { label: "Onboarded & Joined", val: statusMetrics.joined, bg: "#dcfce7", text: "#15803d", border: "#86efac" },
              { label: "Interview Done", val: statusMetrics.interviewDone, bg: "#ecfdf5", text: "#059669", border: "#6ee7b7" },
              { label: "Interview Not Done", val: statusMetrics.interviewNotDone, bg: "#fff1f2", text: "#be123c", border: "#fda4af" }
            ].map(m => (
              <div
                key={m.label}
                style={{
                  background: m.bg,
                  border: `1px solid ${m.border}`,
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "0.62rem", color: m.text, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2px" }}>{m.label}</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: m.text, marginTop: "2px" }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart AI insights panel */}
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <LucideSparkles size={16} color="#eab308" />
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>Smart Team AI Insights & warnings</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, justifyContent: "center", maxHeight: "250px", overflowY: "auto" }}>
            {smartInsights.map((ins, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", background: "#f9fafb", padding: "8px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#f3f4f6", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "10px", fontWeight: 900 }}>{i + 1}</div>
                <span style={{ fontSize: "0.78rem", color: "#374151", lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: ins }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Client, Job, Sourcing Platform Breakdown Lists */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        
        {/* Client Sourcing breakdown */}
        <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideUser size={14} color="#111827" /> Client Overview
            </h4>
            <input
              type="text"
              placeholder="Search..."
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)}
              style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 6px", fontSize: "0.68rem", outline: "none", width: "90px" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto" }}>
            {clientsBreakdown
              .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
              .map(client => (
                <div
                  key={client.name}
                  onClick={() => setBreakdownModal({ type: "client", name: client.name, candidates: client.candidates })}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "8px", background: "#f9fafb", cursor: "pointer", border: "1px solid #cbd5e1" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f9fafb"}
                >
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }}>{client.name}</span>
                  <span style={{ background: "#111827", color: "white", fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: "12px" }}>{client.count} profiles</span>
                </div>
              ))}
          </div>
        </div>

        {/* JOB/JD Sourcing breakdown */}
        <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideBriefcase size={14} color="#111827" /> JOB/JD overview
            </h4>
            <input
              type="text"
              placeholder="Search..."
              value={jobSearch}
              onChange={e => setJobSearch(e.target.value)}
              style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 6px", fontSize: "0.68rem", outline: "none", width: "90px" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto" }}>
            {jobsBreakdown
              .filter(j => j.name.toLowerCase().includes(jobSearch.toLowerCase()))
              .map(job => (
                <div
                  key={job.name}
                  onClick={() => setBreakdownModal({ type: "job", name: job.name, candidates: job.candidates })}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "8px", background: "#f9fafb", cursor: "pointer", border: "1px solid #cbd5e1" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f9fafb"}
                >
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }}>{job.name}</span>
                  <span style={{ background: "#111827", color: "white", fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: "12px" }}>{job.count} profiles</span>
                </div>
              ))}
          </div>
        </div>

        {/* Sourcing Platform overview */}
        <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideGlobe size={14} color="#111827" /> Sourcing Platform
            </h4>
            <input
              type="text"
              placeholder="Search..."
              value={sourcingSearch}
              onChange={e => setSourcingSearch(e.target.value)}
              style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 6px", fontSize: "0.68rem", outline: "none", width: "90px" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto" }}>
            {sourcingBreakdown
              .filter(s => s.name.toLowerCase().includes(sourcingSearch.toLowerCase()))
              .map(source => (
                <div
                  key={source.name}
                  onClick={() => setBreakdownModal({ type: "sourcing", name: source.name, candidates: source.candidates })}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "8px", background: "#f9fafb", cursor: "pointer", border: "1px solid #cbd5e1" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f9fafb"}
                >
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }}>{source.name}</span>
                  <span style={{ background: "#111827", color: "white", fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: "12px" }}>{source.count} profiles</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Grid: Leads Qualified & Tasks Assigned */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.25rem", marginBottom: "1.25rem", alignItems: "stretch" }}>
        
        {/* Section: Leads Qualified */}
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideDatabase size={14} color="#111827" /> Qualified Leads Sourced
            </h4>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#111827" }}>Total: {totalLeadsCount} Leads</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, justifyContent: "center" }}>
            {leadBreakdown.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: "0.75rem" }}>
                No active leads stored under this recruiter selection.
              </div>
            ) : (
              leadBreakdown.map(l => (
                <div key={l.name} style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", width: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</span>
                  <div style={{ flex: 1, height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, Math.round((l.count / Math.max(1, totalLeadsCount)) * 100))}%`, height: "100%", background: "#111827", borderRadius: "4px" }}></div>
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#334155" }}>{l.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section: Task summary */}
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideCheckSquare size={14} color="#111827" /> Team Directives Status
            </h4>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#16a34a" }}>Completed targets: {completedTasksCount}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
            {loadingTasks ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}><LucideLoader2 className="animate-spin" size={20} color="#111827" /></div>
            ) : activeTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: "0.75rem" }}>
                All recruiter tasks completed under current selection.
              </div>
            ) : (
              activeTasks.map(task => (
                <div key={task.id} style={{ background: "#fafafb", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "8px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a" }}>{task.title} <span style={{ color: "#6b7280", fontWeight: 500 }}>({task.assignee})</span></span>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#ef4444", background: "#fef2f2", padding: "1px 6px", borderRadius: "4px" }}>{task.deadline}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${task.completionPct}%`, height: "100%", background: "#111827", borderRadius: "3px" }}></div>
                    </div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>{task.completionPct}%</span>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#9c3f0c" }}>(Targets left: {task.remaining})</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Modal Overlay */}
      <AnimatePresence>
        {breakdownModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "white", width: "90%", maxWidth: "580px", borderRadius: "18px", padding: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", border: "1px solid #cbd5e1" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0, textTransform: "capitalize" }}>
                  {breakdownModal.type} Breakdown: <span style={{ color: "#3b82f6" }}>{breakdownModal.name}</span>
                </h3>
                <button onClick={() => setBreakdownModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={18} color="#64748b" /></button>
              </div>

              {/* Status grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "1.25rem" }}>
                {Object.entries(getStatusSummary(breakdownModal.candidates)).map(([status, count]) => (
                  <div key={status} style={{ background: "#f8fafc", padding: "6px", borderRadius: "6px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{status}</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 900, color: count > 0 ? "#111827" : "#475569" }}>{count}</div>
                  </div>
                ))}
              </div>

              <h4 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", marginBottom: "6px" }}>Candidate List ({breakdownModal.candidates.length})</h4>
              <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                {breakdownModal.candidates.map((c: any, index: number) => (
                  <div key={c.id || c._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    <div>
                      <strong style={{ fontSize: "0.8rem", color: "#0f172a" }}>{c.name} <span style={{ color: "#6b7280", fontWeight: 500 }}>({c.recruiterName || "Direct"})</span></strong>
                      <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{c.phone} | {c.email || "No Email"}</div>
                    </div>
                    <span style={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: c.remarks === "Joined" ? "#dcfce7" : c.remarks === "Selected" ? "#f5f3ff" : "#eff6ff",
                      color: c.remarks === "Joined" ? "#15803d" : c.remarks === "Selected" ? "#5b21b6" : "#2563eb"
                    }}>
                      {getCandidateStatus(c)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Report Composer & Recipient Lists */}
      <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #cbd5e1", marginBottom: "1.25rem", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "1rem", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <LucideSparkles size={16} color="#eab308" />
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>AI Report Generation Settings</h3>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>REPORT TONE:</span>
            <div style={{ display: "flex", background: "#f1f5f9", padding: "2px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
              {[
                { id: "executive", label: "Executive Summary" },
                { id: "detailed", label: "Performance Audit" },
                { id: "highlights", label: "Daily Highlights" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setAiTone(t.id as any)}
                  style={{
                    padding: "4px 10px",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: aiTone === t.id ? 800 : 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: aiTone === t.id ? "white" : "transparent",
                    color: aiTone === t.id ? "#111827" : "#64748b",
                    boxShadow: aiTone === t.id ? "0 2px 4px rgba(0,0,0,0.03)" : "none"
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom notes input */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "4px" }}>
            OPTIONAL: Add Specific TL observations or warnings to include in the generated AI Report:
          </label>
          <textarea
            placeholder="e.g. Rahul Sharma showed exceptional conversion; priority sourcing campaigns added for IndusInd JD; call times need to improve..."
            value={customTLNotes}
            onChange={e => setCustomTLNotes(e.target.value)}
            style={{ width: "100%", height: "50px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px", fontSize: "0.8rem", outline: "none", resize: "none" }}
          />
        </div>

        {/* Email Ready Format */}
        <div style={{ border: "1.5px solid #cbd5e1", background: "#f9fafb", borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideMail size={14} color="#111827" /> Email-Ready Report Format
            </h4>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#111827", background: "#f3f4f6", padding: "2px 8px", borderRadius: "4px" }}>Pre-composed Report</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "2px" }}>Recipient Emails (Comma-separated for multiple, e.g. boss@co.com, manager@co.com) *</label>
              <input
                type="text"
                placeholder="boss@company.com, manager@company.com, hr@company.com"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
                style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.78rem" }}
              />
            </div>
            
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "2px" }}>Subject Line</label>
              <input
                type="text"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.78rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "2px" }}>Email Body Preview</label>
              <textarea
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                style={{ width: "100%", height: "200px", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "8px", fontSize: "0.78rem", outline: "none", resize: "vertical", fontFamily: "monospace" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569" }}>
              {isMailConnected ? (
                <span style={{ color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <LucideCheckCircle2 size={12} /> Connected: {mailEmail}
                </span>
              ) : (
                <span style={{ color: "#dc2626", fontWeight: 700 }}>
                  Hostinger Webmail / SMTP Node not linked. Click "Link SMTP" to establish.
                </span>
              )}
            </span>

            <button
              onClick={handleDispatchEmailReport}
              disabled={isSendingMail}
              style={{
                background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
                boxShadow: "0 4px 10px rgba(17, 24, 39, 0.2)"
              }}
            >
              {isSendingMail ? (
                <>
                  <LucideLoader2 className="animate-spin" size={14} /> Delivering dispatches...
                </>
              ) : (
                <>
                  <LucideSend size={14} /> Generate & Send Report
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* History Log Timeline */}
      <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #cbd5e1" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px", marginBottom: "10px" }}>
          <LucideHistory size={16} color="#475569" />
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>Historical Dispatched Reports</h3>
        </div>

        {reportHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: "0.78rem" }}>
            No previous daily team reports dispatched on this node.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
            {reportHistory.map(log => (
              <div
                key={log.id}
                style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb" }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700 }}>Recipients: <strong style={{ color: "#374151" }}>{log.recipients}</strong></div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#111827", margin: "2px 0" }}>{log.subject}</div>
                  <span style={{ fontSize: "0.65rem", color: "#9ca3af" }}>Timestamp: {log.date} | Sourced: {log.totalSourced} | Selected: {log.selected}</span>
                </div>

                <button
                  onClick={() => handleLoadHistoricalReport(log)}
                  style={{
                    background: "#ffffff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
                >
                  Reload Context
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
