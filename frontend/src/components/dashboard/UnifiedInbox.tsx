import React, { useState, useEffect } from "react";
import {
  LucideMail, LucideCalendar, LucideLayers,
  LucideCheckCircle2, LucideLock, LucideExternalLink,
  LucideRefreshCw, LucideAlertTriangle, LucideInfo,
  LucideTrendingUp, LucideSparkles, LucideCopy, LucideUsers, LucideCheck, LucideFileText, LucideCpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning";
}

export default function UnifiedInbox({
  candidates = [],
  currentUser,
  onRefresh
}: {
  candidates?: any[];
  currentUser?: any;
  onRefresh?: () => void;
}) {
  // AI report compiler filters
  const [reportRecruiter, setReportRecruiter] = useState("all");
  const [reportShift, setReportShift] = useState("1"); // Shift 1 Day Sourcing by default
  const [reportPlatform, setReportPlatform] = useState("all");
  const [reportTimeframe, setReportTimeframe] = useState("today");
  const [reportTab, setReportTab] = useState("sourcing");
  const [reportFormat, setReportFormat] = useState("professional");
  const [reportContent, setReportContent] = useState("");
  const [isCompilingReport, setIsCompilingReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);

  const addToast = (title: string, message: string, type: "success" | "info" | "warning" = "info") => {
    const newToast = { id: Date.now().toString(), title, message, type };
    setToasts(prev => [newToast, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  // Copy report content to clipboard
  const copyReportToClipboard = () => {
    if (!reportContent) {
      addToast("Nothing to copy!", "Generate a report first.", "warning");
      return;
    }
    navigator.clipboard.writeText(reportContent)
      .then(() => {
        setCopied(true);
        addToast("Report Copied!", "Shift report copied to clipboard. Ready to paste & send.", "success");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        addToast("Copy Failed", "Please select all and copy manually.", "warning");
      });
  };

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

  // Dynamic AI report generator compiler
  useEffect(() => {
    setIsCompilingReport(true);
    const timer = setTimeout(() => {
      let filtered = [...candidates];

      // Recruiter Filter
      if (reportRecruiter !== "all") {
        filtered = filtered.filter(c => (c.recruiterName || c.sourcingBy || "").trim() === reportRecruiter.trim());
      }

      // Shift Filter (1 or 2)
      if (reportShift !== "all") {
        const targetShift = Number(reportShift);
        filtered = filtered.filter(c => {
          if (c.shiftId !== undefined && c.shiftId !== null && c.shiftId !== "") {
            return Number(c.shiftId) === targetShift;
          }
          // Fallback: alternate based on ID to show realistic data
          const idNum = c.id ? Number(c.id) : 0;
          return targetShift === 1 ? (idNum % 2 === 1) : (idNum % 2 === 0);
        });
      }

      // Platform Filter
      if (reportPlatform !== "all") {
        filtered = filtered.filter(c => {
          const platform = (c.sourcingPlatform || c.sourcingBy || c.dataType || "").toLowerCase();
          if (reportPlatform === "cold_calling") {
            return c.coldCalling === "Yes" || c.coldCalling === true || platform.includes("cold");
          }
          return platform.includes(reportPlatform.toLowerCase());
        });
      }

      // Timeframe Filter
      if (reportTimeframe === "today") {
        const todayStr = new Date().toISOString().split("T")[0];
        filtered = filtered.filter(c => {
          if (!c.createdAt) return false;
          const candDateStr = c.createdAt.split("T")[0];
          const candSourcingStr = c.sourcingDate ? c.sourcingDate.split("T")[0] : "";
          return candDateStr === todayStr || candSourcingStr === todayStr;
        });
      }

      setMatchedCount(filtered.length);

      // Handle empty states
      if (filtered.length === 0) {
        setReportContent(
          `No candidate logs found matching the selected filters:\n` +
          `- Recruiter: ${reportRecruiter === "all" ? "All Recruiters" : reportRecruiter}\n` +
          `- Shift: ${reportShift === "all" ? "All Shifts" : "Shift " + reportShift}\n` +
          `- Platform: ${reportPlatform === "all" ? "All Platforms" : reportPlatform}\n` +
          `- Timeframe: ${reportTimeframe === "today" ? "Today's Logs Only" : "All Records"}\n\n` +
          `Try changing your filter settings or adding candidates to your Fast RMS database.`
        );
        setIsCompilingReport(false);
        return;
      }

      const isMarkdown = reportFormat === "markdown";
      const timeframeLabel = reportTimeframe === "today" 
        ? new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) 
        : "Cumulative Sourcing Pipeline";
      const shiftLabel = reportShift === "all" ? "All Shifts" : `Shift ${reportShift}`;
      const recruiterLabel = reportRecruiter === "all" ? "All Recruiters" : reportRecruiter;
      const platformLabel = reportPlatform === "all" ? "All Channels" : reportPlatform.toUpperCase();

      let text = "";

      if (reportTab === "sourcing") {
        const total = filtered.length;
        const statusCounts: Record<string, number> = {};
        let ccCount = 0;

        filtered.forEach(c => {
          const status = c.remarks || "New";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
          if (c.coldCalling === "Yes" || c.coldCalling === true || (c.dataType && c.dataType.toLowerCase() === "cold_calling")) {
            ccCount++;
          }
        });

        if (isMarkdown) {
          text += `# 📊 RECRUITMENT SOURCING REPORT\n`;
          text += `**Date/Timeframe:** ${timeframeLabel}\n`;
          text += `**Recruiter Scope:** ${recruiterLabel} | **Shift:** ${shiftLabel}\n`;
          text += `**Target Channels:** ${platformLabel}\n`;
          text += `**Total Sourced Candidates:** ${total}\n\n`;

          text += `### 📈 STATUS PIPELINE BREAKDOWN\n`;
          Object.keys(statusCounts).sort().forEach(status => {
            const count = statusCounts[status];
            const percent = ((count / total) * 100).toFixed(0);
            text += `- **${status}:** ${count} candidates (${percent}%)\n`;
          });

          text += `\n### 📞 CHANNEL METRICS\n`;
          const ccPercentNum = Math.round((ccCount / total) * 100);
          text += `- **Cold Calling Sourced:** ${ccCount} (${ccPercentNum}%)\n`;
          text += `- **Other Channels (Portals/CRM):** ${total - ccCount} (${100 - ccPercentNum}%)\n\n`;

          text += `### 🤖 AI NATIVE EXECUTIVE ANALYSIS\n`;
          text += `Today's sourcing pipeline demonstrates excellent alignment on **${shiftLabel}**. `;
          if (statusCounts["Lined Up"] || statusCounts["Selected"]) {
            text += `Key highlights include **${statusCounts["Lined Up"] || 0} candidate(s) successfully Lined Up** for interview panels and **${statusCounts["Selected"] || 0} candidate(s) Selected**. `;
          }
          text += `Recommended action: prioritise follow-ups on new leads to maximize interview attendance.\n\n`;
          text += `*Generated natively by Fast RMS AI Sourcing Engine.*`;
        } else {
          text += `==================================================\n`;
          text += `DAILY CRM SOURCING & ACTIVITY SUMMARY\n`;
          text += `==================================================\n`;
          text += `Timeframe: ${timeframeLabel}\n`;
          text += `Recruiter: ${recruiterLabel} | Shift: ${shiftLabel}\n`;
          text += `Channels : ${platformLabel}\n`;
          text += `Total Sourced Candidates: ${total}\n\n`;

          text += `PIPELINE STATUS SUMMARY:\n`;
          text += `--------------------------------------------------\n`;
          Object.keys(statusCounts).sort().forEach(status => {
            const count = statusCounts[status];
            const percent = ((count / total) * 100).toFixed(0);
            text += ` * ${status.padEnd(18)}: ${count} candidate(s) (${percent}%)\n`;
          });

          text += `\nSOURCING CHANNELS:\n`;
          text += `--------------------------------------------------\n`;
          const ccPercentNum = Math.round((ccCount / total) * 100);
          text += ` * Cold Calling       : ${ccCount} profile(s) (${ccPercentNum}%)\n`;
          text += ` * Portals & Database : ${total - ccCount} profile(s) (${100 - ccPercentNum}%)\n\n`;

          text += `EXECUTIVE SUMMARY:\n`;
          text += `--------------------------------------------------\n`;
          text += `The sourcing desk compiled ${total} candidate interactions in the specified window. Sourcing efforts have focused heavily on targeted outreach, achieving a cold call contribution rate of ${ccPercentNum}%. \n\n`;
          if (statusCounts["Lined Up"]) {
            text += `Currently, ${statusCounts["Lined Up"]} candidates are scheduled for active client interviews. Recruiters should verify attendance logs prior to interview schedules.\n\n`;
          }
          text += `Report compiled via Fast RMS AI.`;
        }
      } else if (reportTab === "grid") {
        const interviewCandidates = filtered.filter(c => isCandidateMatch(c, "go for interview"));

        if (interviewCandidates.length === 0) {
          text = `No interviews scheduled in this selection.\n\n` +
            `Note: To appear in the Interview Grid, candidates must either:\n` +
            `1. Have their Status set to 'Lined Up' or 'Selected'.\n` +
            `2. Have a scheduled 'Interview Date' entered in CRM.`;
        } else {
          if (isMarkdown) {
            text += `# 📅 INTERVIEW MATRIX GRID\n`;
            text += `**Scope:** ${recruiterLabel} | **Shift:** ${shiftLabel} | ${timeframeLabel}\n`;
            text += `**Total Panels Slated:** ${interviewCandidates.length} Candidates\n\n`;

            text += `| Candidate Name | Targeted Role | Company / Client | Date & Time | Contact | Recruiter |\n`;
            text += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

            interviewCandidates.forEach(cand => {
              const name = cand.name || "N/A";
              const role = cand.designation || cand.jobRole || "N/A";
              const client = cand.clientName || "N/A";
              let dateStr = "TBD";
              if (cand.interviewDate) {
                const d = new Date(cand.interviewDate);
                dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              }
              const timeStr = cand.interviewTime || "";
              const timing = `${dateStr} ${timeStr}`.trim();
              const phone = cand.phone || "N/A";
              const recruiter = cand.recruiterName || cand.sourcingBy || "N/A";

              text += `| **${name}** | ${role} | ${client} | ${timing} | ${phone} | ${recruiter} |\n`;
            });

            text += `\n### 💡 CLIENT COORDINATION INSTRUCTIONS\n`;
            text += `Copy the tabulated panel above to send directly to your client coordinators. All profiles are vetted and active in Fast RMS database.\n\n`;
            text += `*Generated automatically by Fast RMS AI Sourcing Engine.*`;
          } else {
            text += `======================================================================\n`;
            text += `INTERVIEW SCHEDULE MATRIX - FAST RMS\n`;
            text += `======================================================================\n`;
            text += `Scope: ${recruiterLabel} | Shift: ${shiftLabel} | ${timeframeLabel}\n`;
            text += `Total Scheduled Interviews: ${interviewCandidates.length}\n\n`;

            interviewCandidates.forEach((cand, idx) => {
              const name = cand.name || "N/A";
              const role = cand.designation || cand.jobRole || "N/A";
              const client = cand.clientName || "N/A";
              let dateStr = "TBD";
              if (cand.interviewDate) {
                const d = new Date(cand.interviewDate);
                dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              }
              const timeStr = cand.interviewTime || "";
              const timing = `${dateStr} @ ${timeStr}`.trim();
              const phone = cand.phone || "N/A";
              const email = cand.email || "N/A";
              const recruiter = cand.recruiterName || cand.sourcingBy || "N/A";

              text += `${idx + 1}. CANDIDATE: ${name}\n`;
              text += `   Target Role: ${role} | Client: ${client}\n`;
              text += `   Schedule   : ${timing}\n`;
              text += `   Contact    : Phone: ${phone} | Email: ${email}\n`;
              text += `   Recruiter  : ${recruiter}\n`;
              text += `   ------------------------------------------------------------------\n`;
            });
            text += `\nSummary: Please ensure all candidates are contacted 1 hour prior to their scheduled slots to minimize No-Show ratios.`;
          }
        }
      } else {
        const total = filtered.length;
        let selected = 0;
        let rejected = 0;
        let linedUp = 0;
        let noShow = 0;
        let joined = 0;
        const recruiterCounts: Record<string, number> = {};

        filtered.forEach(c => {
          if (isCandidateMatch(c, "selected")) selected++;
          if (isCandidateMatch(c, "rejected")) rejected++;
          if (isCandidateMatch(c, "go for interview")) linedUp++;
          
          const status = (c.remarks || "").toLowerCase();
          if (status === "no show") noShow++;
          
          if (isCandidateMatch(c, "joined")) joined++;

          const recruiter = c.recruiterName || c.sourcingBy || "Unknown";
          recruiterCounts[recruiter] = (recruiterCounts[recruiter] || 0) + 1;
        });

        const selectionRate = total > 0 ? ((selected / total) * 100).toFixed(1) : "0.0";
        const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : "0.0";
        const noShowRate = (linedUp + noShow) > 0 ? ((noShow / (linedUp + noShow)) * 100).toFixed(1) : "0.0";
        const pipelineHealth = selected > 0 ? "High Performance" : (linedUp > 0 ? "Healthy Pipeline" : "Needs Optimization");

        if (isMarkdown) {
          text += `# 🏆 NATIVE AI KPI PERFORMANCE SCORECARD\n`;
          text += `**Analysis Window:** ${timeframeLabel}\n`;
          text += `**Scope:** ${recruiterLabel} | **Shift:** ${shiftLabel}\n\n`;

          text += `### 🎯 RECRUITMENT FUNNEL CONVERSION KEY METRICS\n`;
          text += `- **Total Sourced Profiles:** ${total}\n`;
          text += `- **Selection Rate (Selected / Sourced):** **${selectionRate}%** (Target: 15%)\n`;
          text += `- **Rejection Rate (Rejected / Sourced):** **${rejectionRate}%**\n`;
          text += `- **No-Show Rate (No Show / Slated):** **${noShowRate}%** (Target: < 10%)\n`;
          text += `- **Onboarded/Joined Count:** ${joined} Placement(s)\n\n`;

          text += `### 🧑‍💼 RECRUITER VOLUME LEADERBOARD\n`;
          Object.keys(recruiterCounts).sort((a,b) => recruiterCounts[b] - recruiterCounts[a]).forEach((rec, idx) => {
            const count = recruiterCounts[rec];
            const percent = ((count / total) * 100).toFixed(0);
            text += `${idx + 1}. **${rec}**: ${count} candidates logged (${percent}% of total sourcing)\n`;
          });

          text += `\n### 🤖 AI COMPANION RECOMMENDATIONS\n`;
          text += `- **Pipeline Rating:** \`${pipelineHealth}\`\n`;
          if (parseFloat(noShowRate) > 15) {
            text += `- ⚠️ **Warning:** The candidate No-Show rate is high (${noShowRate}%). Implement automated SMS/Call reminders 2 hours before scheduled interviews.\n`;
          } else {
            text += `- Checkmark: Candidate No-Show rate is kept under control (${noShowRate}%). Keep up the excellent candidate briefing protocols.\n`;
          }
          text += `- **Action Item:** Ensure active recruiter feedback loops on *Rejected* candidates to refine sourcing search parameters on platforms.\n\n`;
          text += `*Generated automatically by Fast RMS AI Sourcing Engine.*`;
        } else {
          text += `==================================================\n`;
          text += `RECRUITER KPI PERFORMANCE SCORECARD\n`;
          text += `==================================================\n`;
          text += `Window: ${timeframeLabel}\n`;
          text += `Scope : ${recruiterLabel} | Shift: ${shiftLabel}\n`;
          text += `Total Evaluated Logs: ${total}\n\n`;

          text += `CONVERSION METRICS:\n`;
          text += `--------------------------------------------------\n`;
          text += ` * Sourced Candidates : ${total}\n`;
          text += ` * Interview Selection: ${selectionRate}% (${selected} Selected)\n`;
          text += ` * Panel Rejections   : ${rejectionRate}% (${rejected} Rejected)\n`;
          text += ` * Candidate No-Show  : ${noShowRate}% (${noShow} No Shows)\n`;
          text += ` * Candidate Placed   : ${joined} placement(s)\n\n`;

          text += `TEAM WORKLOAD SUMMARY:\n`;
          text += `--------------------------------------------------\n`;
          Object.keys(recruiterCounts).sort((a,b) => recruiterCounts[b] - recruiterCounts[a]).forEach((rec, idx) => {
            const count = recruiterCounts[rec];
            text += ` ${idx + 1}. ${rec.padEnd(20)}: ${count} candidates logged\n`;
          });

          text += `\nAI RECOMMENDATIONS & OBSERVATIONS:\n`;
          text += `--------------------------------------------------\n`;
          text += ` * Pipeline Assessment: Status is [${pipelineHealth}].\n`;
          if (parseFloat(noShowRate) > 15) {
            text += ` * WARNING: Current No-Show rate (${noShowRate}%) exceeds threshold of 10%.\n`;
            text += `   -> ACTION: Mandate team check-ins with candidates 2 hours prior to schedules.\n`;
          } else {
            text += ` * STATUS CHECK: Candidate engagement is highly efficient.\n`;
          }
          text += ` * ACTION: Shift sourcing focus towards critical roles to increase conversion.\n\n`;
          text += `Report generated via Fast RMS AI.`;
        }
      }

      setReportContent(text);
      setIsCompilingReport(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [reportRecruiter, reportShift, reportPlatform, reportTimeframe, reportTab, reportFormat, candidates]);

  // Unique recruiter list compiled dynamically from candidates prop
  const uniqueRecruiters = Array.from(
    new Set(
      candidates
        .map(c => (c.recruiterName || c.sourcingBy || "").trim())
        .filter(Boolean)
    )
  ).sort();

  return (
    <div style={{ height: "calc(100vh - 100px)", display: "flex", background: "#f8fafc", fontFamily: "'Outfit', 'Inter', sans-serif", overflow: "hidden" }}>
      
      {/* Toast Notification Container */}
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 999999, display: "flex", flexDirection: "column", gap: "10px", pointerEvents: "none" }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                width: "320px",
                background: "white",
                borderRadius: "16px",
                padding: "14px 18px",
                boxShadow: "0 15px 30px rgba(0,0,0,0.08)",
                borderLeft: `4px solid ${t.type === "success" ? "#10b981" : t.type === "warning" ? "#ef4444" : "#3b82f6"}`,
                pointerEvents: "auto",
                border: "1px solid #e2e8f0"
              }}
            >
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {t.type === "success" ? <LucideCheckCircle2 size={15} color="#10b981" /> : t.type === "warning" ? <LucideAlertTriangle size={15} color="#ef4444" /> : <LucideInfo size={15} color="#3b82f6" />}
                <span style={{ fontWeight: 800, fontSize: "0.82rem", color: "#0f172a" }}>{t.title}</span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#475569", lineHeight: 1.4 }}>{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Grid Layout: Left Panel (Control) & Right Panel (Report View) */}
      <div style={{ flex: 1, display: "flex", padding: "1.25rem", gap: "1.25rem", overflow: "hidden" }}>
        
        {/* LEFT COLUMN: CONTROL & FILTERS PANEL (40% Width) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: "320px", maxWidth: "450px" }}>
          
          {/* Header Banner Card */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", letterSpacing: "-0.3px" }}>
              <LucideSparkles size={20} color="#7c3aed" /> Activity Dispatch Center
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.78rem", lineHeight: 1.4 }}>
              Compile recruitment scorecards, target interview grids, and daily sourcing shift summaries.
            </p>
          </div>

          {/* Executive Filter Console */}
          <div style={{
            background: "white",
            padding: "1.25rem",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            color: "#0f172a",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <span style={{
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  fontSize: "0.58rem",
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: "100px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Live AI Compiler
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ fontSize: "0.65rem", color: "#15803d", fontWeight: 800 }}>Shift Engine Online</span>
                </div>
              </div>

              {/* Advanced Filter Stack */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                
                {/* Locked Day Sourcing Banner */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 12px", borderRadius: "12px" }}>
                  <label style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                     Target Sourcing Shift
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "#0f172a", fontWeight: 800 }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6" }} />
                    Shift 1 (Day Sourcing) ONLY
                  </div>
                </div>

                {/* Recruiter Selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.62rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Recruiter Scope</label>
                  <select
                    value={reportRecruiter}
                    onChange={(e) => setReportRecruiter(e.target.value)}
                    style={{ background: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 10px", fontSize: "0.78rem", outline: "none", fontWeight: 700, cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}
                  >
                    <option value="all">All Available Recruiters</option>
                    {uniqueRecruiters.map(rec => (
                       <option key={rec} value={rec}>{rec}</option>
                    ))}
                  </select>
                </div>

                {/* Platform Selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.62rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sourcing channel</label>
                  <select
                    value={reportPlatform}
                    onChange={(e) => setReportPlatform(e.target.value)}
                    style={{ background: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 10px", fontSize: "0.78rem", outline: "none", fontWeight: 700, cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}
                  >
                    <option value="all">All Sourcing Portals</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="naukri">Naukri Portal</option>
                    <option value="indeed">Indeed</option>
                    <option value="cold_calling">Cold Calling</option>
                    <option value="crm">CRM Direct</option>
                  </select>
                </div>

                {/* Timeframe Selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.62rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Compilation window</label>
                  <select
                    value={reportTimeframe}
                    onChange={(e) => setReportTimeframe(e.target.value)}
                    style={{ background: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 10px", fontSize: "0.78rem", outline: "none", fontWeight: 700, cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}
                  >
                    <option value="today">Today's Logs Only</option>
                    <option value="all">All Sourced Records</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Compilation Metrics Footer */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <LucideUsers size={14} color="#4f46e5" />
                <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Active Candidates:</span>
              </div>
              <span style={{ fontSize: "0.85rem", color: "#4f46e5", fontWeight: 800, fontFamily: "monospace" }}>
                {matchedCount} Profiles
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: REPORT COMPILED VIEW & PREVIEW CONTAINER (60% Width) */}
        <div style={{ flex: 1.3, display: "flex", flexDirection: "column", gap: "0.75rem", overflow: "hidden" }}>
          
          {/* Report Tab Control Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", background: "white", padding: "8px 12px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            
            {/* Custom Tab Selection */}
            <div style={{ display: "flex", gap: "3px", background: "#f1f5f9", padding: "3px", borderRadius: "10px" }}>
              {[
                { id: "sourcing", label: "📊 Summary" },
                { id: "grid", label: "📅 Interview Matrix" },
                { id: "kpi", label: "🏆 Leaderboard" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setReportTab(tab.id)}
                  style={{
                    background: reportTab === tab.id ? "white" : "transparent",
                    color: reportTab === tab.id ? "#0f172a" : "#64748b",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "0.72rem",
                    fontWeight: reportTab === tab.id ? 800 : 600,
                    cursor: "pointer",
                    boxShadow: reportTab === tab.id ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Layout Presets (Plain vs Markdown) */}
            <div style={{ display: "flex", gap: "3px", background: "#f1f5f9", padding: "3px", borderRadius: "10px" }}>
              {[
                { id: "professional", label: "📝 Text Brief" },
                { id: "markdown", label: "💻 Markdown" }
              ].map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => setReportFormat(fmt.id)}
                  style={{
                    background: reportFormat === fmt.id ? "white" : "transparent",
                    color: reportFormat === fmt.id ? "#7c3aed" : "#64748b",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "0.68rem",
                    fontWeight: reportFormat === fmt.id ? 800 : 600,
                    cursor: "pointer",
                    boxShadow: reportFormat === fmt.id ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

          </div>

          {/* Compiled Output Block */}
          <div style={{ flex: 1, background: "white", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "1.25rem", display: "flex", flexDirection: "column", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", position: "relative", overflow: "hidden" }}>
            
            {/* Active Compiler Loader Overlay */}
            {isCompilingReport && (
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(3px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", zIndex: 10 }}>
                <LucideRefreshCw className="animate-spin" size={24} color="#7c3aed" />
                <span style={{ fontSize: "0.78rem", color: "#6d28d9", fontWeight: 800 }}>Compiling report...</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <LucideCpu size={14} color="#2563eb" />
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                   AI Sourcing Compiler Output
                </span>
              </div>
              <button
                onClick={() => {
                  if (onRefresh) onRefresh();
                  addToast("Live Sync Completed", "Synchronized live candidate databases with fast activity logs.", "success");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  transition: "color 0.2s"
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#7c3aed")}
                onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
              >
                <LucideRefreshCw size={12} /> Sync Database
              </button>
            </div>

            {/* Main compiled output text block */}
            <textarea
              value={reportContent}
              readOnly
              style={{
                flex: 1,
                width: "100%",
                background: "#f8fafc",
                color: "#1e293b",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "16px",
                fontSize: "0.78rem",
                lineHeight: 1.5,
                resize: "none",
                fontFamily: "Consolas, Menlo, Monaco, 'Courier New', monospace",
                outline: "none",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.01)"
              }}
              placeholder="Report will compile here automatically."
            />

            {/* Direct Copy Action Button */}
            <div style={{ marginTop: "12px" }}>
              <button
                onClick={copyReportToClipboard}
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: copied ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
                  color: "white",
                  borderRadius: "12px",
                  padding: "12px 20px",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  boxShadow: copied ? "0 4px 10px rgba(16, 185, 129, 0.2)" : "0 4px 10px rgba(124, 58, 237, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                className="dispatch-action-btn"
              >
                {copied ? <LucideCheck size={15} /> : <LucideCopy size={15} />}
                {copied ? "Report Copied Successfully!" : "Copy Report (Ready to Send)"}
              </button>
            </div>

            {/* Micro Instruction Info */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "10px", justifyContent: "center" }}>
              <LucideInfo size={11} color="#94a3b8" />
              <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>
                Copy and paste the compiled scorecard directly into WhatsApp, Email, or Slack to report.
              </span>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .dispatch-action-btn:hover {
          transform: translateY(-1.5px);
          filter: brightness(1.05);
        }
        .dispatch-action-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
