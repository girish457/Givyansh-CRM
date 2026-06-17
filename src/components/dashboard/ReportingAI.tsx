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
  LucideSliders,
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
  LucideHistory
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReportingAIProps {
  currentUser?: any;
  candidates?: any[];
  onRefresh?: () => void;
}

export default function ReportingAI({ currentUser, candidates = [], onRefresh }: ReportingAIProps) {
  // Filters & State
  const [dateFilter, setDateFilter] = useState<
    "today" | "yesterday" | "specific" | "weekly" | "monthly" | "yearly" | "custom"
  >("today");
  const [specificDate, setSpecificDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const [clientSearch, setClientSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [sourcingSearch, setSourcingSearch] = useState("");

  // AI Summary Settings
  const [aiTone, setAiTone] = useState<"formal" | "assertive" | "consultative">("formal");
  const [customReportUpdates, setCustomReportUpdates] = useState("");

  // Email template state
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Hostinger Webmail Node Config State
  const [showMailSettings, setShowMailSettings] = useState(false);
  const [mailEmail, setMailEmail] = useState(() => localStorage.getItem("crm_reporting_mail_email") || "");
  const [mailPassword, setMailPassword] = useState(() => localStorage.getItem("crm_reporting_mail_password") || "");
  const [mailSmtpHost, setMailSmtpHost] = useState(() => localStorage.getItem("crm_reporting_mail_smtp_host") || "smtp.hostinger.com");
  const [mailSmtpPort, setMailSmtpPort] = useState(() => localStorage.getItem("crm_reporting_mail_smtp_port") || "465");
  const [mailImapHost, setMailImapHost] = useState(() => localStorage.getItem("crm_reporting_mail_imap_host") || "imap.hostinger.com");
  const [mailImapPort, setMailImapPort] = useState(() => localStorage.getItem("crm_reporting_mail_imap_port") || "993");
  const [isMailConnecting, setIsMailConnecting] = useState(false);
  const [isMailConnected, setIsMailConnected] = useState(() => localStorage.getItem("crm_reporting_mail_connected") === "true");

  const [isSendingMail, setIsSendingMail] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false,
    msg: "",
    type: "success"
  });

  // Clickable Detail Breakdown Modals
  const [breakdownModal, setBreakdownModal] = useState<{
    type: string;
    name: string;
    candidates: any[];
  } | null>(null);

  // History timeline state
  const [reportHistory, setReportHistory] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("crm_reporting_ai_history_v1");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Tasks state
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [dbVendors, setDbVendors] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDbVendors(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch vendors in Reporting AI:", err);
    }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTasks(data);
          localStorage.setItem("givyansh_tasks_cache_v1", JSON.stringify(data));
        }
      } else {
        const cached = localStorage.getItem("givyansh_tasks_cache_v1");
        if (cached) setTasks(JSON.parse(cached));
      }
    } catch (err) {
      console.error("Failed to fetch tasks in Reporting AI:", err);
      const cached = localStorage.getItem("givyansh_tasks_cache_v1");
      if (cached) setTasks(JSON.parse(cached));
    } finally {
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
        localStorage.setItem("crm_reporting_mail_connected", "true");
        localStorage.setItem("crm_reporting_mail_email", mailEmail);
        localStorage.setItem("crm_reporting_mail_password", mailPassword);
        localStorage.setItem("crm_reporting_mail_smtp_host", mailSmtpHost);
        localStorage.setItem("crm_reporting_mail_smtp_port", mailSmtpPort);
        localStorage.setItem("crm_reporting_mail_imap_host", mailImapHost);
        localStorage.setItem("crm_reporting_mail_imap_port", mailImapPort);
        showToast("Hostinger Integration Node established and verified! 🚀", "success");
        setShowMailSettings(false);
      } else {
        throw new Error(data.error || "Integration Handshake Failed");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to establish integration node.", "error");
    } finally {
      setIsMailConnecting(false);
    }
  };

  // Disconnect Mail Node
  const handleDisconnectMailNode = () => {
    setIsMailConnected(false);
    localStorage.removeItem("crm_reporting_mail_connected");
    localStorage.removeItem("crm_reporting_mail_password");
    showToast("Hostinger integration node unlinked successfully.", "success");
  };

  // Filter candidates based on Owner AND Date Selection
  const filterCandidatesByPeriod = () => {
    const today = new Date();

    // 1. Owner attribution check (real database ownership or simulated fallback)
    const ownerCandidates = candidates.filter((c: any) => {
      const isOwner =
        c.assignedTo === currentUser?.id ||
        (c.recruiterName &&
          currentUser?.name &&
          String(c.recruiterName).toLowerCase() === String(currentUser.name).toLowerCase()) ||
        c.addedBy === currentUser?.id;
      return isOwner;
    });

    return ownerCandidates.filter((c: any) => {
      const dateStr = c.sourcingDate || c.createdAt || c.updatedAt;
      if (!dateStr) return false;
      const cDate = new Date(dateStr);
      if (isNaN(cDate.getTime())) return false;

      // Clean times for accurate day matching
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

  const filteredCandidates = filterCandidatesByPeriod();

  // Status utility
  const checkCandidateStatusHistory = (c: any, keywords: string[]) => {
    if (c.InteractionNotes && Array.isArray(c.InteractionNotes)) {
      return c.InteractionNotes.some((n: any) => {
        const txt = (n.text || "").toLowerCase();
        return keywords.some(kw => txt.includes(kw));
      });
    }
    return false;
  };

  const isCandidateInRound = (c: any, roundName: string) => {
    const rmk = (c.remarks || "").toLowerCase();
    if (rmk === roundName) return true;
    return checkCandidateStatusHistory(c, [roundName]);
  };

  const isCandidateMatch = (c: any, stName: string) => {
    if (!c) return false;
    const rmk = (c.remarks || "").toLowerCase();
    const cv = (c.cvStatus || "").toLowerCase();
    const st = stName.toLowerCase().replace(/[\s_]+/g, "");

    if (rmk === st || rmk.replace(/[\s_]+/g, "") === st) return true;

    const interviewStatuses = ["go for interview", "interview scheduled", "interview rescheduled", "processing for interview", "processing for next round", "round", "all rounds done", "interview done", "selected", "joined", "dropped", "process to joining", "process for joining", "hired"];

    const hasInterviewNotes = c.InteractionNotes && Array.isArray(c.InteractionNotes) && c.InteractionNotes.some((n: any) => {
      const txt = (n.text || "").toLowerCase();
      return ["go for interview", "interview scheduled", "interview rescheduled", "interviewed"].some(kw => txt.includes(kw));
    });

    const hasInterviewHistory = interviewStatuses.includes(rmk) || !!c.interviewDate || hasInterviewNotes;

    if (st === "selected") {
      if (rmk === "rejected" || rmk === "dropped") return false;
      const selectedStatuses = ["selected", "joined", "process to joining", "process for joining", "hired"];
      return selectedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["selected", "hired"]);
    }
    if (st === "joined" || st === "hired") {
      if (rmk === "dropped" || rmk === "rejected") return false;
      return rmk === "joined" || rmk === "hired";
    }
    if (st === "rejected") {
      const excludeFromRejected = ["selected", "joined", "process to joining", "process for joining", "hired"];
      if (excludeFromRejected.includes(rmk)) return false;
      return rmk === "rejected" || rmk === "reject";
    }
    if (st === "interested") {
      if (rmk === "not interested" || rmk === "not connected") return false;
      const interestedStatuses = ["interested", "selected", "joined", "process to joining", "process for joining", "hired", "interview done", "processing for next round"];
      return interestedStatuses.includes(rmk) || hasInterviewHistory || checkCandidateStatusHistory(c, ["interested", "select", "join", "hired", "process to joining"]);
    }
    if (st === "joining" || st === "processtojoining" || st === "processforjoining") {
      const excludeFromJoining = ["joined", "dropped", "rejected", "hired"];
      if (excludeFromJoining.includes(rmk)) return false;
      return rmk === "process to joining" || rmk === "process for joining" || rmk === "processing";
    }
    if (st === "connected") {
      if (rmk === "not connected" || rmk === "call not pick" || rmk === "new" || !rmk) {
        return checkCandidateStatusHistory(c, ["connected", "interested", "interview", "select", "join", "process"]);
      }
      return true; // Any other remark implies we connected
    }
    if (st === "notinterested") {
      return rmk === "not interested";
    }
    if (st === "goforinterview" || st === "interviewscheduled") {
      return hasInterviewHistory;
    }
    if (st === "processingforinterview") {
      return rmk === "processing for interview" || rmk === "processing for next round" || checkCandidateStatusHistory(c, ["processing for interview", "processing for next round"]);
    }
    if (st === "interviewdone") {
      return checkCandidateStatusHistory(c, ["interview done", "round", "all rounds done", "processing for next round", "selected", "joined", "process to joining", "process for joining", "hired"]) || rmk === "interview done" || rmk === "all rounds done";
    }
    if (st === "interviewnotdone") {
      return rmk === "interview not done" || checkCandidateStatusHistory(c, ["interview not done"]);
    }
    if (st === "revertlater") {
      return rmk === "revert later" || rmk === "call later";
    }
    if (st === "callnotpick" || st === "notconnected") {
      return rmk === "not connected" || rmk === "call not pick" || rmk === "no response" || rmk === "busy";
    }
    if (st === "dropped") {
      return rmk === "dropped";
    }

    return rmk === st || cv === st;
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

  // Core metrics breakdown
  const totalRegistered = filteredCandidates.length;

  const getCandidatesByStatus = (statusName: string) => {
    return filteredCandidates.filter(c => isCandidateMatch(c, statusName));
  };

  const statusMetricsCandidates = {
    connected: getCandidatesByStatus("Connected"),
    notConnected: getCandidatesByStatus("Not Connected"),
    interested: getCandidatesByStatus("Interested"),
    notInterested: getCandidatesByStatus("Not Interested"),
    selected: getCandidatesByStatus("Selected"),
    joined: getCandidatesByStatus("Joined"),
    goForInterview: getCandidatesByStatus("Go For Interview"),
    processToJoining: getCandidatesByStatus("Process To Joining"),
    revertLater: getCandidatesByStatus("Revert Later"),
    callNotPick: getCandidatesByStatus("Call Not Pick"),
    dropped: getCandidatesByStatus("Dropped"),
    interviewDone: getCandidatesByStatus("Interview Done"),
    interviewNotDone: getCandidatesByStatus("Interview Not Done"),
    processingForInterview: getCandidatesByStatus("Processing for Interview")
  };

  const statusMetrics = {
    connected: statusMetricsCandidates.connected.length,
    notConnected: statusMetricsCandidates.notConnected.length,
    interested: statusMetricsCandidates.interested.length,
    notInterested: statusMetricsCandidates.notInterested.length,
    selected: statusMetricsCandidates.selected.length,
    joined: statusMetricsCandidates.joined.length,
    goForInterview: statusMetricsCandidates.goForInterview.length,
    processToJoining: statusMetricsCandidates.processToJoining.length,
    revertLater: statusMetricsCandidates.revertLater.length,
    callNotPick: statusMetricsCandidates.callNotPick.length,
    dropped: statusMetricsCandidates.dropped.length,
    interviewDone: statusMetricsCandidates.interviewDone.length,
    interviewNotDone: statusMetricsCandidates.interviewNotDone.length,
    processingForInterview: statusMetricsCandidates.processingForInterview.length
  };

  // Section 3: Client-wise Reporting
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

  // Section 4: JOB/JD-wise Reporting
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

  // Section 5: Sourcing-wise Reporting
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

  // Section 6: Lead Data Reporting
  const getLeadBreakdown = () => {
    try {
      const leadCache = JSON.parse(localStorage.getItem("givyansh_lead_data_v1") || "{}");

      // Filter recruiter leads that match our date period
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

  // Section 7: Tasks Summary
  const getTaskDeadlineDate = (task: any) => {
    const now = new Date();
    if (!task.createdAt) return new Date(now.getTime() + 24 * 3600 * 1000);
    let deadlineDate = new Date(task.createdAt);
    const duration = task.duration || "today";
    if (duration === "today") {
      deadlineDate.setHours(23, 59, 59, 999);
    } else if (duration === "this_week") {
      const day = deadlineDate.getDay();
      const diff = deadlineDate.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(deadlineDate.setDate(diff));
      const sunday = new Date(monday.setDate(monday.getDate() + 6));
      sunday.setHours(23, 59, 59, 999);
      deadlineDate = sunday;
    } else if (duration === "this_month") {
      deadlineDate = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (duration === "this_year") {
      deadlineDate = new Date(deadlineDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (duration === "custom" && task.customEndDate) {
      deadlineDate = new Date(task.customEndDate);
      deadlineDate.setHours(23, 59, 59, 999);
    } else {
      deadlineDate.setHours(23, 59, 59, 999);
    }
    return deadlineDate;
  };

  const getActiveTasksSummary = () => {
    const recruiterTasks = tasks.filter(t => {
      const isOwner = t.assigneeId === currentUser?.id ||
        (t.assignee?.name && currentUser?.name && String(t.assignee.name).toLowerCase() === String(currentUser.name).toLowerCase());
      return isOwner;
    });

    const filteredTasks = recruiterTasks.filter(t => {
      const tStart = new Date(t.createdAt || Date.now());
      let tEnd = getTaskDeadlineDate(t);
      if (t.status === "completed" || t.status === "cancelled") {
        tEnd = new Date(t.completedAt || t.updatedAt || t.createdAt || Date.now());
      }

      const today = new Date();
      let fStart = new Date();
      let fEnd = new Date();

      switch (dateFilter) {
        case "today":
          fStart.setHours(0, 0, 0, 0);
          fEnd.setHours(23, 59, 59, 999);
          break;
        case "yesterday":
          fStart.setDate(today.getDate() - 1);
          fStart.setHours(0, 0, 0, 0);
          fEnd.setDate(today.getDate() - 1);
          fEnd.setHours(23, 59, 59, 999);
          break;
        case "specific":
          if (!specificDate) return true;
          fStart = new Date(specificDate);
          fStart.setHours(0, 0, 0, 0);
          fEnd = new Date(specificDate);
          fEnd.setHours(23, 59, 59, 999);
          break;
        case "weekly":
          fStart.setDate(today.getDate() - 7);
          fStart.setHours(0, 0, 0, 0);
          fEnd.setHours(23, 59, 59, 999);
          break;
        case "monthly":
          fStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
          fEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        case "yearly":
          fStart = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
          fEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
        case "custom":
          if (!startDate || !endDate) return true;
          fStart = new Date(startDate);
          fStart.setHours(0, 0, 0, 0);
          fEnd = new Date(endDate);
          fEnd.setHours(23, 59, 59, 999);
          break;
      }

      return fStart <= tEnd && fEnd >= tStart;
    });

    return filteredTasks.map(t => {
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
        status: t.status,
        isExpired: new Date() > getTaskDeadlineDate(t) && t.status !== "completed" && t.status !== "cancelled"
      };
    });
  };

  const activeTasks = getActiveTasksSummary();

  // Helper status breakdown generator
  const getStatusSummary = (list: any[]) => {
    const counts: { [key: string]: number } = {
      "Connected": 0, "Not Connected": 0, "Interested": 0, "Not Interested": 0,
      "Selected": 0, "Joined": 0, "Go For Interview": 0, "Process To Joining": 0,
      "Revert Later": 0, "Call Not Pick": 0, "Dropped": 0
    };
    list.forEach(c => {
      Object.keys(counts).forEach(status => {
        if (isCandidateMatch(c, status)) {
          counts[status]++;
        }
      });
    });
    return counts;
  };

  // Smart AI insights generator
  const getSmartInsights = () => {
    const insights = [];

    if (clientsBreakdown.length > 0) {
      insights.push(`Most active client account is currently **${clientsBreakdown[0].name}** supporting **${clientsBreakdown[0].count}** candidate profiles.`);
    }
    if (sourcingBreakdown.length > 0) {
      insights.push(`Highest efficiency candidate conversion sourced via **${sourcingBreakdown[0].name}**.`);
    }
    if (jobsBreakdown.length > 0) {
      insights.push(`Highest priority JD allocation with top candidate flow is **${jobsBreakdown[0].name}**.`);
    }
    if (statusMetrics.selected > 0) {
      insights.push(`Excellent selection quality demonstrated with **${statusMetrics.selected}** candidate clearances.`);
    }
    if (statusMetrics.joined > 0) {
      insights.push(`High closure rate optimized with **${statusMetrics.joined}** candidates successfully on-boarded and joined.`);
    }

    if (insights.length < 3) {
      insights.push(
        "Talent pipelines remain stable, sustaining normal connection and pre-screening workflows.",
        "Candidate status checks reflect continuous follow-ups across active JD criteria."
      );
    }
    return insights.slice(0, 4);
  };

  const smartInsights = getSmartInsights();

  // AI Written Daily Report Generator
  const generateAiReportText = () => {
    const todayStr = new Date().toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const recruiterName = currentUser?.name || "Active Recruiter";

    let rolesStr = jobsBreakdown.slice(0, 2).map(j => j.name).join(", ");
    if (!rolesStr) rolesStr = "allocated JDs";

    let clientsStr = clientsBreakdown.slice(0, 2).map(c => c.name).join(", ");
    if (!clientsStr) clientsStr = "major client assignments";

    let customNotes = "";
    if (customReportUpdates.trim()) {
      customNotes = `\nKey Updates: ${customReportUpdates.trim()}`;
    }

    // Gather interview statistics
    const doneCand = statusMetricsCandidates.interviewDone || [];
    const notDoneCount = statusMetricsCandidates.interviewNotDone.length;
    const processingCount = statusMetricsCandidates.processingForInterview.length;

    const r1Count = doneCand.filter(c => isCandidateInRound(c, "round 1")).length;
    const r2Count = doneCand.filter(c => isCandidateInRound(c, "round 2")).length;
    const r3Count = doneCand.filter(c => isCandidateInRound(c, "round 3")).length;
    const r4Count = doneCand.filter(c => isCandidateInRound(c, "round 4")).length;
    const r5Count = doneCand.filter(c => isCandidateInRound(c, "round 5")).length;
    const allRoundsDoneCount = doneCand.filter(c => isCandidateInRound(c, "all rounds done")).length;
    const commonR1R2Count = doneCand.filter(c => isCandidateInRound(c, "round 1") && isCandidateInRound(c, "round 2")).length;
    const commonR1R2R3Count = doneCand.filter(c => isCandidateInRound(c, "round 1") && isCandidateInRound(c, "round 2") && isCandidateInRound(c, "round 3")).length;

    // Helper to get candidate completed rounds list
    const getCandidateCompletedRounds = (c: any) => {
      const rounds = [];
      if (isCandidateInRound(c, "round 1")) rounds.push("Round 1");
      if (isCandidateInRound(c, "round 2")) rounds.push("Round 2");
      if (isCandidateInRound(c, "round 3")) rounds.push("Round 3");
      if (isCandidateInRound(c, "round 4")) rounds.push("Round 4");
      if (isCandidateInRound(c, "round 5")) rounds.push("Round 5");
      if (isCandidateInRound(c, "all rounds done")) rounds.push("All Rounds Done");
      return rounds.length > 0 ? rounds.join(", ") : "Interview Done";
    };

    // Format list of candidates with completed interviews
    let interviewDoneListStr = "";
    if (doneCand.length > 0) {
      interviewDoneListStr = "\nInterview Done Candidates Details:\n" + doneCand.map(c => {
        const roundsStr = getCandidateCompletedRounds(c);
        const currentStatus = getCandidateStatus(c);
        return `  - ${c.name || "N/A"} [Rounds: ${roundsStr}] (Status: ${currentStatus})`;
      }).join("\n");
    } else {
      interviewDoneListStr = "\nNo interviews completed in this period.";
    }

    if (aiTone === "assertive") {
      return `Dear Operations Management,

Daily Sourcing & Recruitment Performance Executive Summary: ${todayStr}
Executive Resource: ${recruiterName}

Sourcing & CRM Activity Metrics:
• Total Candidates Handled: ${totalRegistered} Profiles
• Connected Outreach: ${statusMetrics.connected} Conversions
• Scheduled for Interviews: ${statusMetrics.goForInterview} Candidates
• Cleared and Selected: ${statusMetrics.selected} Clearances
• Successfully Joined: ${statusMetrics.joined} Placements
• Sourced Lead Assets: ${totalLeadsCount} qualified contacts

Interview Funnel Performance:
• Interview Done: ${doneCand.length} Candidates
  [Breakdown: R1: ${r1Count} | R2: ${r2Count} | R3: ${r3Count} | R4: ${r4Count} | R5: ${r5Count} | All Done: ${allRoundsDoneCount}]
  [Common R1+R2: ${commonR1R2Count} | Common R1+R2+R3: ${commonR1R2R3Count}]
• Interview Not Done: ${notDoneCount} Candidates (Pending state)
• Processing for Interview: ${processingCount} Candidates
${interviewDoneListStr}

Pipeline Traction & Fulfillment Details:
Primary fulfillment initiatives executed across critical accounts including: ${clientsStr}. Highly targeted sourcing efforts focused on JDs: ${rolesStr}. Breakdown matrices indicate: Sourcing volume of ${statusMetrics.goForInterview} active interviewees, ${statusMetrics.processToJoining} in final onboarding phases, and ${statusMetrics.dropped} dropouts.

Operational Compliance:
Qualifying lead data yielded ${totalLeadsCount} strategic contacts. Active operational tasks stand at ${activeTasks.length} pending directives.${customNotes}

Summary:
Immediate action loops remain closed. Candidate Outreach conversions sustained positive trajectory. Candidate interest registers high quality alignment for key accounts.

Best Regards,
${recruiterName}
Recruiting Operations Specialist`;
    }

    if (aiTone === "consultative") {
      return `Subject: Recruitment Performance & Funnel Diagnostic - ${todayStr}

Dear Executive Partners,

I am pleased to present the strategic daily recruitment performance overview for ${todayStr}, compiled by ${recruiterName}.

Executive Pipeline Diagnostic:
During this sourcing cycle, our talent mapping framework yielded ${totalRegistered} registered candidates in the CRM pipeline, focused primarily on ${rolesStr}. Functional conversion metrics reflect high screening rigor:
- Sourcing & Initial Engagement: ${statusMetrics.connected} candidates connected.
- Pipeline Velocity: ${statusMetrics.goForInterview} candidate interview confirmations secured.
- Output & Placement: ${statusMetrics.selected} client selections and ${statusMetrics.joined} on-boardings completed successfully.

Interview Lifecycle & Funnel Status:
We are closely monitoring our interview conversion funnel, which shows the following tracking metrics:
- Interviews Completed: ${doneCand.length} candidates (R1: ${r1Count}, R2: ${r2Count}, R3: ${r3Count}, R4: ${r4Count}, R5: ${r5Count}, All Done: ${allRoundsDoneCount})
- Multi-Round Traction: Common R1+R2 matches stand at ${commonR1R2Count}; Common R1+R2+R3 matches stand at ${commonR1R2R3Count}.
- Pending Action: ${notDoneCount} candidates remain in "Interview Not Done" status.
- In-progress Evaluation: ${processingCount} candidates currently "Processing for next round".
${interviewDoneListStr}

Client Account Performance:
Sourcing priority was centered on maximizing talent supply for our primary partners: ${clientsStr}. Status metrics demonstrate stable funnel health with ${statusMetrics.processToJoining} candidates transitioning to joining and ${statusMetrics.revertLater} scheduled for custom follow-ups.

Lead Repository Assets:
A proactive pipeline build generated ${totalLeadsCount} lead profiles categorised across operational domains. Compliance targets indicate ${activeTasks.length} active tasks currently in progress. Let's maintain high momentum.${customNotes}

Strategic observations:
Candidate connection rates and JD alignments reflect healthy sourcing efficiency. We recommend continuous client check-ins to expedite final feedback on selected candidates.

Warm regards,
${recruiterName}
Talent Acquisition Partner`;
    }

    // Default: Formal Corporate Tone
    return `Subject: Daily Recruiter Activity Report - ${recruiterName} - ${todayStr}

Dear Team Management,

Please find the detailed recruiter activity and talent acquisition metrics report for ${todayStr}.

Summary of Daily Activity Metrics:
• Total Candidate Volume: ${totalRegistered} Candidates Sourced
• Candidate Connected: ${statusMetrics.connected}
• Not Connected: ${statusMetrics.notConnected}
• Interested: ${statusMetrics.interested}
• Not Interested: ${statusMetrics.notInterested}
• Go For Interview: ${statusMetrics.goForInterview}
• Selected Candidates: ${statusMetrics.selected}
• Joined Candidates: ${statusMetrics.joined}
• Process To Joining: ${statusMetrics.processToJoining}
• Revert Later: ${statusMetrics.revertLater}
• Call Not Pick: ${statusMetrics.callNotPick}
• Dropped: ${statusMetrics.dropped}

Interview Pipeline breakdown:
• Interview Done: ${doneCand.length} (Round 1: ${r1Count}, Round 2: ${r2Count}, Round 3: ${r3Count}, Round 4: ${r4Count}, Round 5: ${r5Count}, All Rounds Done: ${allRoundsDoneCount})
• Common Candidates: Common R1+R2: ${commonR1R2Count} | Common R1+R2+R3: ${commonR1R2R3Count}
• Interview Not Done: ${notDoneCount}
• Processing for Interview: ${processingCount}
${interviewDoneListStr}

Client Engagement Overview:
Active sourcing operations supported key clients including: ${clientsStr}. Candidate search profiles were processed across the following target profiles: ${rolesStr}. Sourced candidates are mapped dynamically to status checkups to prevent bottleneck drops.

Proactive Leads & Operations:
• Sourced Lead Count: ${totalLeadsCount} categorized profiles
• Active Operations Tasks: ${activeTasks.length} pending directives
• Lead category breakdown shows major focus in available interest fields.${customNotes}

I am monitoring active pipelines to verify selected candidates successfully transition to onboarding. Please let me know if any specific sourcing adjustments are required.

Sincerely,
${recruiterName}
Recruiting Operations Node`;
  };

  // Sync state to email form on change
  useEffect(() => {
    const text = generateAiReportText();
    const lines = text.split("\n");
    const subjectLine = lines.find(l => l.startsWith("Subject:") || l.startsWith("Daily Sourcing") || l.startsWith("Daily Recruiter"));
    const subject = subjectLine ? subjectLine.replace("Subject: ", "") : `Daily Recruiter Work Report - ${currentUser?.name || "Recruiter"}`;
    const body = text.replace(/Subject:.*\n/, "").replace(/Daily Sourcing.*\n/, "");

    setEmailSubject(subject);
    setEmailBody(body);
  }, [dateFilter, specificDate, startDate, endDate, aiTone, candidates, tasks, customReportUpdates]);

  // Handle Dispatch Email Report
  const handleDispatchEmailReport = async () => {
    if (!emailTo) {
      showToast("Recipient email address is mandatory.", "error");
      return;
    }
    if (!isMailConnected) {
      showToast("Please link your Hostinger Webmail/Gmail credentials first.", "error");
      setShowMailSettings(true);
      return;
    }

    setIsSendingMail(true);
    try {
      const res = await fetch("/api/integrations/hostinger/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: mailEmail,
          password: mailPassword,
          smtpHost: mailSmtpHost,
          smtpPort: parseInt(mailSmtpPort) || 465,
          to: emailTo,
          subject: emailSubject,
          body: emailBody
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Daily Report delivered successfully to ${emailTo}! 📨`, "success");

        // Log to history
        const newLog = {
          id: Date.now(),
          date: newDateStr(),
          recipient: emailTo,
          subject: emailSubject,
          body: emailBody,
          totalSourced: totalRegistered,
          selected: statusMetrics.selected,
          joined: statusMetrics.joined
        };
        const updatedHistory = [newLog, ...reportHistory].slice(0, 50);
        setReportHistory(updatedHistory);
        localStorage.setItem("crm_reporting_ai_history_v1", JSON.stringify(updatedHistory));
      } else {
        throw new Error(data.error || "Email delivery failed.");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to dispatch email report.", "error");
    } finally {
      setIsSendingMail(false);
    }
  };

  const newDateStr = () => {
    return new Date().toLocaleString();
  };

  // Excel detailed tabular candidate sourcing report downloader
  const handleExportExcel = () => {
    const todayStr = new Date().toISOString().split("T")[0];

    const escapeXml = (str: any) => {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    const getVendorName = (candidateId: string) => {
      try {
        const cand = candidates.find((c: any) => String(c.id || c._id) === String(candidateId));
        const dbVendorId = cand?.vendorId;
        if (dbVendorId) {
          const found = dbVendors.find((v: any) => String(v.id) === String(dbVendorId));
          if (found) return `${found.name} (${found.company})`;
        }
        const suffix = currentUser?.id || currentUser?.role || 'recruiter';
        const mappings = JSON.parse(localStorage.getItem(`givyansh_candidate_vendor_v1_${suffix}`) || "{}");
        const vendorId = mappings[candidateId];
        if (!vendorId) return "Direct";
        // Check dynamically fetched dbVendors from state
        const found = dbVendors.find((v: any) => String(v.id) === String(vendorId));
        if (found) return `${found.name} (${found.company})`;
        // Check fallback from localStorage
        const storedVendors = JSON.parse(localStorage.getItem(`givyansh_vendors_v1_${suffix}`) || "[]");
        const storedFound = storedVendors.find((v: any) => String(v.id) === String(vendorId));
        return storedFound ? `${storedFound.name} (${storedFound.company})` : "Direct";
      } catch {
        return "Direct";
      }
    };

    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>${currentUser?.name || "Recruiter"}</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  
  <Worksheet ss:Name="Candidate Sourcing Report">
    <Table>
      <Column ss:Width="100"/>
      <Column ss:Width="150"/>
      <Column ss:Width="120"/>
      <Column ss:Width="180"/>
      <Column ss:Width="160"/>
      <Column ss:Width="160"/>
      <Column ss:Width="130"/>
      <Column ss:Width="100"/>
      
      <Row ss:Height="20">
        <Cell><Data ss:Type="String">Date</Data></Cell>
        <Cell><Data ss:Type="String">Candidate Name</Data></Cell>
        <Cell><Data ss:Type="String">Candidate Number</Data></Cell>
        <Cell><Data ss:Type="String">Location (State, City)</Data></Cell>
        <Cell><Data ss:Type="String">Client Name</Data></Cell>
        <Cell><Data ss:Type="String">Vendor Name</Data></Cell>
        <Cell><Data ss:Type="String">Remark/Status</Data></Cell>
        <Cell><Data ss:Type="String">Date of Joining</Data></Cell>
      </Row>
      
      ${filteredCandidates.map(c => {
      const sourcingDateStr = c.sourcingDate || (c.createdAt ? String(c.createdAt).split("T")[0] : "N/A");
      const candName = c.name || "N/A";
      const candPhone = c.phone || "N/A";

      let loc = "N/A";
      if (c.state && c.city) {
        loc = `${c.state}, ${c.city}`;
      } else if (c.state) {
        loc = c.state;
      } else if (c.city) {
        loc = c.city;
      }

      const clientNameStr = c.clientName || "N/A";
      const vendorNameStr = getVendorName(c.id || c._id);
      const remarkStatusStr = c.remarks || c.status || c.cvStatus || "N/A";

      // Compute DOJ if they joined successfully
      const hasJoined = remarkStatusStr.toLowerCase().includes("joined") || remarkStatusStr.toLowerCase().includes("hired");
      const dojStr = hasJoined ? (c.updatedAt ? String(c.updatedAt).split("T")[0] : String(c.createdAt || "").split("T")[0] || todayStr) : "N/A";

      return `
      <Row ss:Height="20">
        <Cell><Data ss:Type="String">${escapeXml(sourcingDateStr)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(candName)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(candPhone)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(loc)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(clientNameStr)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(vendorNameStr)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(remarkStatusStr)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(dojStr)}</Data></Cell>
      </Row>`;
    }).join("")}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Recruiter_AI_SourcingReport_${currentUser?.name || "Recruiter"}_${todayStr}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Excel detailed sourcing report generated successfully!", "success");
  };

  // PDF Print System
  const handleExportPDF = () => {
    const todayStr = new Date().toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const recruiterName = currentUser?.name || "Active Recruiter";

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Pop-up blocked. Please allow windows to export PDF.", "error");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Daily Recruitment Work Summary - ${recruiterName}</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #1e293b; line-height: 1.5; margin: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
            .header h1 { font-size: 24px; margin: 0; color: #1e3a8a; }
            .header p { margin: 5px 0 0; font-size: 14px; color: #64748b; font-weight: 500; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; }
            .meta-grid div { font-size: 13px; }
            .meta-grid strong { color: #0f172a; }
            .section-title { font-size: 16px; font-weight: 800; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 5px; margin-top: 25px; margin-bottom: 12px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th, td { padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left; }
            th { background: #f1f5f9; color: #334155; font-weight: 700; }
            .summary-box { background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe; font-size: 13px; color: #1e40af; line-height: 1.6; margin-bottom: 20px; white-space: pre-line; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; background: #bfdbfe; color: #1e40af; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Daily Sourcing & CRM Work Report</h1>
              <p>AI-Powered Recruiter Performance Summary</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 12px; font-weight: 700; color: #0ea5e9; border: 1px solid #bae6fd; padding: 4px 8px; border-radius: 6px; background: #f0f9ff;">Enterprise Grade</span>
            </div>
          </div>

          <div class="meta-grid">
            <div>Recruiter Node: <strong>${recruiterName}</strong></div>
            <div>Reporting Period: <strong>${dateFilter.toUpperCase()} (${todayStr})</strong></div>
            <div>Attributed CRM Candidates: <strong>${totalRegistered} Active Profiles</strong></div>
            <div>Strategic Leads Qualified: <strong>${totalLeadsCount} Contacts</strong></div>
          </div>

          <div class="section-title">Daily Written Summary</div>
          <div class="summary-box">${emailBody.replace(/\n/g, "<br>")}</div>

          <div class="section-title">Candidate Activity Analytics</div>
          <table>
            <thead>
              <tr>
                <th>CRM Pipeline Metric</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Total Registered Candidates</td><td><strong>${totalRegistered}</strong></td></tr>
              <tr><td>Connected</td><td>${statusMetrics.connected}</td></tr>
              <tr><td>Not Connected</td><td>${statusMetrics.notConnected}</td></tr>
              <tr><td>Interested</td><td>${statusMetrics.interested}</td></tr>
              <tr><td>Not Interested</td><td>${statusMetrics.notInterested}</td></tr>
              <tr><td>Go For Interview</td><td><strong>${statusMetrics.goForInterview}</strong></td></tr>
              <tr><td>Process To Joining</td><td>${statusMetrics.processToJoining}</td></tr>
              <tr><td>Revert Later</td><td>${statusMetrics.revertLater}</td></tr>
              <tr><td>Call Not Pick</td><td>${statusMetrics.callNotPick}</td></tr>
              <tr><td>Dropped</td><td>${statusMetrics.dropped}</td></tr>
              <tr><td>Selected</td><td><strong>${statusMetrics.selected}</strong></td></tr>
              <tr><td>Joined</td><td><strong>${statusMetrics.joined}</strong></td></tr>
            </tbody>
          </table>

          <div class="section-title">Interview Rounds & Detailed Status Pipeline</div>
          <table>
            <thead>
              <tr>
                <th>Interview Category / Round</th>
                <th>Candidate Count</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background: #ecfdf5;"><td><strong>Total Interview Done</strong></td><td><strong>${statusMetricsCandidates.interviewDone.length}</strong></td></tr>
              <tr><td>└ Round 1 Done</td><td>${statusMetricsCandidates.interviewDone.filter(c => isCandidateInRound(c, "round 1")).length}</td></tr>
              <tr><td>└ Round 2 Done</td><td>${statusMetricsCandidates.interviewDone.filter(c => isCandidateInRound(c, "round 2")).length}</td></tr>
              <tr><td>└ Round 3 Done</td><td>${statusMetricsCandidates.interviewDone.filter(c => isCandidateInRound(c, "round 3")).length}</td></tr>
              <tr><td>└ Round 4 Done</td><td>${statusMetricsCandidates.interviewDone.filter(c => isCandidateInRound(c, "round 4")).length}</td></tr>
              <tr><td>└ Round 5 Done</td><td>${statusMetricsCandidates.interviewDone.filter(c => isCandidateInRound(c, "round 5")).length}</td></tr>
              <tr><td>└ All Rounds Done</td><td>${statusMetricsCandidates.interviewDone.filter(c => isCandidateInRound(c, "all rounds done")).length}</td></tr>
              <tr style="background: #f0fdf4;"><td>└ Common (Round 1 & 2 Done)</td><td>${statusMetricsCandidates.interviewDone.filter(c => isCandidateInRound(c, "round 1") && isCandidateInRound(c, "round 2")).length}</td></tr>
              <tr style="background: #f0fdf4;"><td>└ Common (Round 1, 2 & 3 Done)</td><td>${statusMetricsCandidates.interviewDone.filter(c => isCandidateInRound(c, "round 1") && isCandidateInRound(c, "round 2") && isCandidateInRound(c, "round 3")).length}</td></tr>
              <tr style="background: #fff1f2;"><td><strong>Total Interview Not Done</strong></td><td><strong>${statusMetricsCandidates.interviewNotDone.length}</strong></td></tr>
              <tr style="background: #fffbeb;"><td><strong>Total Processing For Interview</strong></td><td><strong>${statusMetricsCandidates.processingForInterview.length}</strong></td></tr>
            </tbody>
          </table>

          <div class="section-title">Interview Done Candidates Progress (Selected Period)</div>
          <table>
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Phone Number</th>
                <th>Completed Round(s)</th>
                <th>Current Status / Remark</th>
              </tr>
            </thead>
            <tbody>
              ${statusMetricsCandidates.interviewDone.length === 0 
                ? "<tr><td colspan='4'>No candidates completed an interview in the selected period.</td></tr>" 
                : statusMetricsCandidates.interviewDone.map(c => {
                    const rounds = [];
                    if (isCandidateInRound(c, "round 1")) rounds.push("Round 1");
                    if (isCandidateInRound(c, "round 2")) rounds.push("Round 2");
                    if (isCandidateInRound(c, "round 3")) rounds.push("Round 3");
                    if (isCandidateInRound(c, "round 4")) rounds.push("Round 4");
                    if (isCandidateInRound(c, "round 5")) rounds.push("Round 5");
                    if (isCandidateInRound(c, "all rounds done")) rounds.push("All Rounds Done");
                    const roundsStr = rounds.length > 0 ? rounds.join(", ") : "Interview Done";
                    const currentStatus = getCandidateStatus(c);
                    return `
                      <tr>
                        <td><strong>${c.name || "N/A"}</strong></td>
                        <td>${c.phone || "N/A"}</td>
                        <td><span class="badge" style="background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;">${roundsStr}</span></td>
                        <td><span class="badge" style="background: ${c.remarks === 'Joined' ? '#dcfce7' : c.remarks === 'Selected' ? '#f5f3ff' : '#eff6ff'}; color: ${c.remarks === 'Joined' ? '#15803d' : c.remarks === 'Selected' ? '#5b21b6' : '#2563eb'};">${currentStatus}</span></td>
                      </tr>`;
                  }).join("")}
            </tbody>
          </table>

          <div class="section-title">Client-Wise Sourcing Breakdown</div>
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

          <div class="section-title">JOB / JD Breakdown</div>
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

          <div class="section-title">Sourcing Platforms Breakdown</div>
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

          <div class="section-title">Active Recruiter Directives Summary</div>
          <table>
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Completion Rate</th>
                <th>Remaining Target</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              ${activeTasks.length === 0 ? "<tr><td colspan='4'>All operational tasks cleared. No active tasks.</td></tr>" : activeTasks.map(t => `
                <tr>
                  <td>${t.title}</td>
                  <td><strong>${t.completionPct}%</strong></td>
                  <td>${t.remaining}</td>
                  <td>${t.deadline}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div style="text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #cbd5e1; padding-top: 15px;">
            Daily Report Generated Dynamically by Fast RMS Reporting AI Portal Node. Confidential Document.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Auto-prompt print save
    printWindow.onload = () => {
      printWindow.print();
    };
    showToast("PDF printable layout generated successfully!", "success");
  };

  // Re-download old report from history
  const handleLoadHistoricalReport = (log: any) => {
    setEmailSubject(log.subject);
    setEmailBody(log.body);
    setEmailTo(log.recipient);
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
              <span style={{ color: "#0f172a" }}>Reporting AI </span>
              <span style={{ color: "#2563eb" }}>Engine</span>
            </h2>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "4px 0 0 0", fontWeight: 500 }}>
            Automated work summaries, candidate analytics, multi-sheet exports, and verified email dispatch.
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
            {isMailConnected ? "Webmail Active" : "Setup Webmail"}
          </button>

          <button
            onClick={handleExportPDF}
            style={{
              background: "#1e3a8a",
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
              boxShadow: "0 4px 10px rgba(30, 58, 138, 0.15)"
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
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}><LucideMail size={16} color="#3b82f6" /> Webmail Node Handshake</h3>
                <button onClick={() => setShowMailSettings(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={18} color="#64748b" /></button>
              </div>

              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0 0 1rem", lineHeight: 1.4 }}>
                Enter credentials to connect your <strong>Hostinger Webmail</strong> or <strong>SMTP Node</strong> for secure report dispatching.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "4px" }}>SMTP Email Username</label>
                  <input
                    type="email"
                    value={mailEmail}
                    onChange={e => setMailEmail(e.target.value)}
                    placeholder="e.g. recruiter@company.com"
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
                      Unlink Credentials
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectMailNode}
                      disabled={isMailConnecting}
                      style={{ flex: 1, padding: "10px", border: "none", background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "white", borderRadius: "10px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      {isMailConnecting ? (
                        <>
                          <LucideLoader2 className="animate-spin" size={14} /> Verifying...
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

      {/* Date Periods / Advanced Filter Controls */}
      <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "1.25rem", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <LucideCalendar size={16} color="#3b82f6" />
          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569" }}>DATE PERIOD:</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {[
            { id: "today", label: "Today Report" },
            { id: "yesterday", label: "Yesterday Report" },
            { id: "specific", label: "Specific Date" },
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
            { id: "yearly", label: "Yearly" },
            { id: "custom", label: "Custom Date Range" }
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
                background: dateFilter === t.id ? "#eff6ff" : "#f1f5f9",
                color: dateFilter === t.id ? "#2563eb" : "#64748b",
                border: dateFilter === t.id ? "1px solid #bfdbfe" : "1px solid transparent"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dynamic parameter selectors based on type */}
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

      {/* Grid: Primary Funnel & Candidate Activity Analytics */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.25rem", marginBottom: "1.25rem", alignItems: "stretch" }}>

        {/* Section 2: Candidate Activity Analytics */}
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.01)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <LucideLayers size={16} color="#3b82f6" />
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>Candidate Sourcing Analytics</h3>
            </div>
            <span style={{ fontSize: "0.68rem", fontWeight: 900, background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "6px" }}>Live Syncing</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[
              { label: "Total Register", val: totalRegistered, candidates: filteredCandidates, bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
              { label: "Connected Candidate", val: statusMetricsCandidates.connected.length, candidates: statusMetricsCandidates.connected, bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
              { label: "Not Connected", val: statusMetricsCandidates.notConnected.length, candidates: statusMetricsCandidates.notConnected, bg: "#f8fafc", text: "#475569", border: "#cbd5e1" },
              { label: "Interested Candidates", val: statusMetricsCandidates.interested.length, candidates: statusMetricsCandidates.interested, bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
              { label: "Not Interested", val: statusMetricsCandidates.notInterested.length, candidates: statusMetricsCandidates.notInterested, bg: "#fef2f2", text: "#991b1b", border: "#fecdd3" },
              { label: "Go For Interview", val: statusMetricsCandidates.goForInterview.length, candidates: statusMetricsCandidates.goForInterview, bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
              { label: "Process To Joining", val: statusMetricsCandidates.processToJoining.length, candidates: statusMetricsCandidates.processToJoining, bg: "#ecfeff", text: "#075985", border: "#a5f3fc" },
              { label: "Revert Later", val: statusMetricsCandidates.revertLater.length, candidates: statusMetricsCandidates.revertLater, bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
              { label: "Call Not Pick", val: statusMetricsCandidates.callNotPick.length, candidates: statusMetricsCandidates.callNotPick, bg: "#fff7ed", text: "#c2410c", border: "#ffedd5" },
              { label: "Dropped Candidates", val: statusMetricsCandidates.dropped.length, candidates: statusMetricsCandidates.dropped, bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },
              { label: "Selected Candidates", val: statusMetricsCandidates.selected.length, candidates: statusMetricsCandidates.selected, bg: "#f5f3ff", text: "#5b21b6", border: "#d8b4fe" },
              { label: "Onboarded & Joined", val: statusMetricsCandidates.joined.length, candidates: statusMetricsCandidates.joined, bg: "#dcfce7", text: "#15803d", border: "#86efac" },
              { label: "Interview Done", val: statusMetricsCandidates.interviewDone.length, candidates: statusMetricsCandidates.interviewDone, bg: "#ecfdf5", text: "#059669", border: "#6ee7b7" },
              { label: "Interview Not Done", val: statusMetricsCandidates.interviewNotDone.length, candidates: statusMetricsCandidates.interviewNotDone, bg: "#fff1f2", text: "#be123c", border: "#fda4af" },
              { label: "Processing For Interview", val: statusMetricsCandidates.processingForInterview.length, candidates: statusMetricsCandidates.processingForInterview, bg: "#fffbeb", text: "#f59e0b", border: "#fde68a" }
            ].map(m => (
              <div
                key={m.label}
                onClick={() => {
                  if (m.label === "Interview Done") {
                    setBreakdownModal({ type: "Interview Breakdown", name: "Interview Rounds", candidates: m.candidates });
                  } else {
                    setBreakdownModal({ type: "Status", name: m.label, candidates: m.candidates });
                  }
                }}
                style={{
                  background: m.bg,
                  border: `1px solid ${m.border}`,
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ fontSize: "0.62rem", color: m.text, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2px" }}>{m.label}</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: m.text, marginTop: "2px" }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart AI insights panel */}
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.01)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <LucideSparkles size={16} color="#eab308" />
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>Smart AI Insights & Diagnosis</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, justifyContent: "center" }}>
            {smartInsights.map((ins, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "10px", fontWeight: 900 }}>{i + 1}</div>
                <span style={{ fontSize: "0.78rem", color: "#334155", lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: ins }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Client, Job, Sourcing Platform Summaries */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

        {/* Section 3: Client-wise Reporting */}
        <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideUser size={14} color="#3b82f6" /> Client breakdown
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
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", border: "1px solid #cbd5e1" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}
                >
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>{client.name}</span>
                  <span style={{ background: "#3b82f6", color: "white", fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: "12px" }}>{client.count} profiles</span>
                </div>
              ))}
          </div>
        </div>

        {/* Section 4: JOB/JD-wise Reporting */}
        <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideBriefcase size={14} color="#16a34a" /> JOB/JD breakdown
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
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", border: "1px solid #cbd5e1" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ecfdf5"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}
                >
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>{job.name}</span>
                  <span style={{ background: "#16a34a", color: "white", fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: "12px" }}>{job.count} profiles</span>
                </div>
              ))}
          </div>
        </div>

        {/* Section 5: Sourcing platform-wise Reporting */}
        <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideGlobe size={14} color="#8b5cf6" /> Sourcing breakdown
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
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", border: "1px solid #cbd5e1" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}
                >
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>{source.name}</span>
                  <span style={{ background: "#8b5cf6", color: "white", fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: "12px" }}>{source.count} profiles</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Grid: Leads Qualified & Tasks Assigned */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.25rem", marginBottom: "1.25rem", alignItems: "stretch" }}>

        {/* Section 6: Lead Category Data */}
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideDatabase size={14} color="#6366f1" /> Lead Category Breakdown
            </h4>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#6366f1" }}>Total: {totalLeadsCount} Leads</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, justifyContent: "center" }}>
            {leadBreakdown.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: "0.75rem" }}>
                No active leads stored under this date selection.
              </div>
            ) : (
              leadBreakdown.map(l => (
                <div key={l.name} style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", width: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</span>
                  <div style={{ flex: 1, height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, Math.round((l.count / Math.max(1, totalLeadsCount)) * 100))}%`, height: "100%", background: "#6366f1", borderRadius: "4px" }}></div>
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#334155" }}>{l.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 7: Tasks Summary */}
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideCheckSquare size={14} color="#f59e0b" /> Recruiter Tasks Summary
            </h4>
            <button onClick={fetchTasks} style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>Refresh</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
            {loadingTasks ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}><LucideLoader2 className="animate-spin" size={20} color="#3b82f6" /></div>
            ) : activeTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: "0.75rem" }}>
                All directives completed! No active tasks.
              </div>
            ) : (
              activeTasks.map(task => (
                <div key={task.id} style={{ background: "#fafafb", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "8px 12px", display: "flex", flexDirection: "column", gap: "4px", opacity: task.status === "completed" || task.status === "cancelled" || task.isExpired ? 0.7 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", textDecoration: task.status === "completed" || task.status === "cancelled" ? "line-through" : "none" }}>{task.title}</span>
                    <span style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: task.status === "completed" ? "#16a34a" : task.status === "cancelled" ? "#475569" : task.isExpired ? "#b91c1c" : "#ef4444",
                      background: task.status === "completed" ? "#dcfce7" : task.status === "cancelled" ? "#f1f5f9" : task.isExpired ? "#fef2f2" : "#fef2f2",
                      padding: "1px 6px",
                      borderRadius: "4px"
                    }}>
                      {task.status === "completed" ? "Completed" : task.status === "cancelled" ? "Cancelled" : task.isExpired ? "Expired" : task.deadline}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${task.completionPct}%`, height: "100%", background: "#f59e0b", borderRadius: "3px" }}></div>
                    </div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>{task.completionPct}%</span>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#d97706" }}>(Target left: {task.remaining})</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detailed breakdown modal popup */}
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

              {/* Status matrix grids (Only for Client, Job, Sourcing) */}
              {["client", "job", "sourcing"].includes(breakdownModal.type) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "1.25rem" }}>
                  {Object.entries(getStatusSummary(breakdownModal.candidates)).map(([status, count]) => (
                    <div key={status} style={{ background: "#f8fafc", padding: "6px", borderRadius: "6px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{status}</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 900, color: count > 0 ? "#2563eb" : "#475569" }}>{count}</div>
                    </div>
                  ))}
                </div>
              )}

              {breakdownModal.type === "Interview Breakdown" ? (
                <>
                  <h4 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", marginBottom: "10px" }}>Select a Round to view candidates:</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "1.25rem" }}>
                    {["Round 1", "Round 2", "Round 3", "Round 4", "Round 5", "All Rounds Done"].map(round => {
                      const rCand = breakdownModal.candidates.filter(c => isCandidateInRound(c, round.toLowerCase()));
                      return (
                        <div
                          key={round}
                          onClick={() => setBreakdownModal({ type: "Interview Round", name: round, candidates: rCand })}
                          style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", textAlign: "center", border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                          onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}
                        >
                          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>{round}</div>
                          <div style={{ fontSize: "1.2rem", fontWeight: 900, color: rCand.length > 0 ? "#2563eb" : "#475569" }}>{rCand.length}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <h4 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", marginBottom: "6px" }}>Candidate List ({breakdownModal.candidates.length})</h4>
                  <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", paddingRight: "4px" }}>
                    {breakdownModal.candidates.map((c: any, index: number) => (
                      <div key={c.id || c._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                        <div>
                          <strong style={{ fontSize: "0.8rem", color: "#0f172a" }}>{c.name}</strong>
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
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Tone Selection & Report Composition */}
      <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "1.25rem", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "1rem", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <LucideSparkles size={16} color="#eab308" />
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>AI Report Generation Settings</h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>AI TONE:</span>
            <div style={{ display: "flex", background: "#f1f5f9", padding: "2px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              {[
                { id: "formal", label: "Formal Corporate" },
                { id: "assertive", label: "Manager Assertive" },
                { id: "consultative", label: "Consultative HR" }
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
                    color: aiTone === t.id ? "#2563eb" : "#64748b",
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
            OPTIONAL: Add Specific Daily updates to include in the generated AI Report:
          </label>
          <textarea
            placeholder="e.g. Conducted sourcing campaigns on LinkedIn; finalized candidates screener with Boss; resolved pipeline bottleneck..."
            value={customReportUpdates}
            onChange={e => setCustomReportUpdates(e.target.value)}
            style={{ width: "100%", height: "50px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px", fontSize: "0.8rem", outline: "none", resize: "none" }}
          />
        </div>

        {/* Section: Email ready format with Composer */}
        <div style={{ border: "1.5px solid #dbeafe", background: "#f0f9ff", borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#1e40af", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideMail size={14} color="#1e40af" /> Email-Ready Report Format
            </h4>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#2563eb", background: "#dbeafe", padding: "2px 8px", borderRadius: "4px" }}>Pre-composed Report</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#1e40af", display: "block", marginBottom: "2px" }}>Recipient Email *</label>
              <input
                type="email"
                placeholder="Enter manager, TL, or company inbox address"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
                style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #bfdbfe", fontSize: "0.78rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#1e40af", display: "block", marginBottom: "2px" }}>Subject Line</label>
              <input
                type="text"
                placeholder="Daily Recruiter Activity Report"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #bfdbfe", fontSize: "0.78rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#1e40af", display: "block", marginBottom: "2px" }}>Email Body Preview</label>
              <textarea
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                style={{ width: "100%", height: "200px", borderRadius: "8px", border: "1px solid #bfdbfe", padding: "8px", fontSize: "0.78rem", outline: "none", resize: "vertical", fontFamily: "monospace" }}
              />
            </div>
          </div>

          {/* Connect node indicator or send button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569" }}>
              {isMailConnected ? (
                <span style={{ color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <LucideCheckCircle2 size={12} /> Connected: {mailEmail}
                </span>
              ) : (
                <span style={{ color: "#e11d48", fontWeight: 700 }}>
                  Hostinger Webmail / SMTP Node not linked. Click "Setup Webmail" to link.
                </span>
              )}
            </span>

            <button
              onClick={handleDispatchEmailReport}
              disabled={isSendingMail}
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
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
                boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)"
              }}
            >
              {isSendingMail ? (
                <>
                  <LucideLoader2 className="animate-spin" size={14} /> Delivering...
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

      {/* Report History Panel */}
      <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px", marginBottom: "10px" }}>
          <LucideHistory size={16} color="#475569" />
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>Historical Report Dispatch Logs</h3>
        </div>

        {reportHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: "0.78rem" }}>
            No previous email dispatches logged on this client node.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
            {reportHistory.map(log => (
              <div
                key={log.id}
                style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>Delivered to: <strong style={{ color: "#334155" }}>{log.recipient}</strong></div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", margin: "2px 0" }}>{log.subject}</div>
                  <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Timestamp: {log.date} | Sourced: {log.totalSourced} | Selected: {log.selected}</span>
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
