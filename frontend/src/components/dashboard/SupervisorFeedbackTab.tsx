import React, { useState, useEffect, useMemo } from "react";
import {
  LucideMessageSquare,
  LucideSearch,
  LucideDownload,
  LucidePrinter,
  LucideCheckCircle2,
  LucideClock,
  LucideUserCheck,
  LucideUserX,
  LucideReply,
  LucideBarChart3,
  LucideFileText,
  LucideCalendar,
  LucideTrendingUp,
  LucideUsers,
  LucideActivity,
  LucideLoader2,
  LucideInbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SupervisorFeedbackTabProps {
  role: "tl" | "manager" | "boss";
  currentUser: any;
}

export default function SupervisorFeedbackTab({ role, currentUser }: SupervisorFeedbackTabProps) {
  // Lists and loading
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState("all"); // today, 7days, 30days, 1year, custom, all
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentListTab, setCurrentListTab] = useState<"Unread" | "Read" | "Replied" | "Closed">("Unread");

  // Interaction Details
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [conversationReplies, setConversationReplies] = useState<any[]>([]);
  const [newReplyText, setNewReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [showAnalyticsTab, setShowAnalyticsTab] = useState(false);

  // Load Feedbacks and Analytics
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback/list");
      if (res.ok) {
        setFeedbacks(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/feedback/analytics");
      if (res.ok) {
        setAnalytics(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadData();
    loadAnalytics();
  }, [role]);

  // Handle Mark as Read
  const handleMarkAsRead = async (fId: number) => {
    try {
      const res = await fetch(`/api/feedback/${fId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        // Refresh local lists and analytics
        loadData();
        loadAnalytics();
        
        // If selected, update state
        if (selectedFeedback && selectedFeedback.id === fId) {
          const updated = { ...selectedFeedback, status: "Read" };
          if (role === "tl") { updated.readByTL = true; updated.readByTLAt = new Date(); }
          else if (role === "manager") { updated.readByManager = true; updated.readByManagerAt = new Date(); }
          else if (role === "boss") { updated.readByBoss = true; updated.readByBossAt = new Date(); }
          setSelectedFeedback(updated);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Select Feedback and open replies
  const handleSelectFeedback = async (feedback: any) => {
    setSelectedFeedback(feedback);
    setNewReplyText("");
    
    // Automatically trigger mark as read if opened
    const isUnreadForMe = 
      (role === "tl" && !feedback.readByTL) ||
      (role === "manager" && !feedback.readByManager) ||
      (role === "boss" && !feedback.readByBoss);

    if (isUnreadForMe) {
      await handleMarkAsRead(feedback.id);
    }

    // Load replies
    try {
      const res = await fetch(`/api/feedback/${feedback.id}/replies`);
      if (res.ok) {
        setConversationReplies(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim() || !selectedFeedback) return;
    setSubmittingReply(true);

    try {
      const res = await fetch(`/api/feedback/${selectedFeedback.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newReplyText })
      });

      if (res.ok) {
        setNewReplyText("");
        // Reload replies
        const repliesRes = await fetch(`/api/feedback/${selectedFeedback.id}/replies`);
        if (repliesRes.ok) {
          setConversationReplies(await repliesRes.json());
        }
        // Refresh lists & analytics
        loadData();
        loadAnalytics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCloseFeedback = async () => {
    if (!selectedFeedback) return;
    if (!window.confirm("Are you sure you want to close this feedback query? This will disable replies for everyone.")) return;

    try {
      const res = await fetch(`/api/feedback/${selectedFeedback.id}/close`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedFeedback(data.feedback);
        await loadData();
        await loadAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter feedbacks locally based on filters and search
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const senderName = f.isAnonymous ? "anonymous employee" : (f.recruiter?.name || "").toLowerCase();
        const matches =
          (f.subject || "").toLowerCase().includes(query) ||
          (f.message || "").toLowerCase().includes(query) ||
          (f.feedbackType || "").toLowerCase().includes(query) ||
          senderName.includes(query);
        if (!matches) return false;
      }

      // 2. Date Presets
      if (datePreset !== "all") {
        const fDate = new Date(f.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (datePreset === "today") {
          return fDate.toDateString() === today.toDateString();
        } else if (datePreset === "7days") {
          const diff = today.getTime() - fDate.getTime();
          return Math.ceil(diff / (1000 * 3600 * 24)) <= 7;
        } else if (datePreset === "30days") {
          const diff = today.getTime() - fDate.getTime();
          return Math.ceil(diff / (1000 * 3600 * 24)) <= 30;
        } else if (datePreset === "1year") {
          const diff = today.getTime() - fDate.getTime();
          return Math.ceil(diff / (1000 * 3600 * 24)) <= 365;
        } else if (datePreset === "custom") {
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            return fDate >= start && fDate <= end;
          }
        }
      }

      // 3. Priority Filter
      if (priorityFilter !== "all") {
        if (f.priority !== priorityFilter) return false;
      }

      // 4. Type Filter
      if (typeFilter !== "all") {
        if (f.feedbackType !== typeFilter) return false;
      }

      return true;
    });
  }, [feedbacks, searchQuery, datePreset, customStartDate, customEndDate, priorityFilter, typeFilter]);

  // Separate lists by visual tab
  const listTabFeedbacks = useMemo(() => {
    return filteredFeedbacks.filter(f => {
      // Closed tab
      if (currentListTab === "Closed") {
        return f.isClosed;
      }
      // For all other tabs, exclude closed feedbacks
      if (f.isClosed) return false;

      // Unread: has not been read by the current role
      if (currentListTab === "Unread") {
        if (role === "tl") return !f.readByTL;
        if (role === "manager" && !f.readByManager) return true;
        if (role === "boss" && !f.readByBoss) return true;
        return false;
      }
      // Read: read by current role but no supervisor replies yet
      if (currentListTab === "Read") {
        const readByMe = 
          (role === "tl" && f.readByTL) ||
          (role === "manager" && f.readByManager) ||
          (role === "boss" && f.readByBoss);
        return readByMe && f.status !== "Replied";
      }
      // Replied
      return f.status === "Replied";
    });
  }, [filteredFeedbacks, currentListTab, role]);

  // Summary Metrics for dashboard cards
  const stats = useMemo(() => {
    const total = filteredFeedbacks.length;
    const unread = filteredFeedbacks.filter(f => {
      if (role === "tl") return !f.readByTL;
      if (role === "manager") return !f.readByManager;
      return !f.readByBoss;
    }).length;

    const read = filteredFeedbacks.filter(f => {
      const readByMe = 
        (role === "tl" && f.readByTL) ||
        (role === "manager" && f.readByManager) ||
        (role === "boss" && f.readByBoss);
      return readByMe && f.status !== "Replied";
    }).length;

    const replied = filteredFeedbacks.filter(f => f.status === "Replied").length;
    const anonymous = filteredFeedbacks.filter(f => f.isAnonymous).length;
    const closed = filteredFeedbacks.filter(f => f.isClosed).length;

    return { total, unread, read, replied, anonymous, closed };
  }, [filteredFeedbacks, role]);

  // PDF Export System
  const triggerPdfExport = () => {
    if (filteredFeedbacks.length === 0) {
      alert("No data available to export.");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = filteredFeedbacks.map((f, idx) => `
      <tr style="background: ${idx % 2 === 0 ? "#f8fafc" : "#ffffff"}; border-bottom: 1px solid #cbd5e1;">
        <td style="padding: 10px; font-weight: bold;">#${f.id}</td>
        <td style="padding: 10px;">${f.feedbackType}</td>
        <td style="padding: 10px; font-weight: 500;">${f.subject}</td>
        <td style="padding: 10px;">${f.isAnonymous ? "Anonymous Employee" : (f.recruiter?.name || "N/A")}</td>
        <td style="padding: 10px; font-weight: bold; color: ${f.priority === "Critical" ? "#ef4444" : "#475569"};">${f.priority}</td>
        <td style="padding: 10px;">${f.status}</td>
        <td style="padding: 10px;">${new Date(f.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
      <head>
        <title>Daily Feedback Audit Report - ${role.toUpperCase()}</title>
        <style>
          body { font-family: 'Inter', sans-serif; color: #0f172a; margin: 30px; }
          h1 { font-size: 24px; font-weight: 900; color: #1e3a8a; margin: 0 0 5px; }
          p { font-size: 12px; color: #64748b; margin: 0 0 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background: #1e3a8a; color: white; padding: 12px; text-align: left; font-weight: 700; }
          td { border-bottom: 1px solid #cbd5e1; padding: 10px; }
          .kpi-row { display: flex; gap: 15px; margin-bottom: 25px; }
          .kpi-box { flex: 1; padding: 15px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; }
          .kpi-box h3 { font-size: 10px; text-transform: uppercase; color: #1d4ed8; margin: 0 0 4px; }
          .kpi-box p { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; }
        </style>
      </head>
      <body>
        <h1>Daily Feedback Audit Report (${role.toUpperCase()})</h1>
        <p>Generated: ${new Date().toLocaleString()} | Filtered Count: ${filteredFeedbacks.length}</p>
        
        <div class="kpi-row">
          <div class="kpi-box"><h3>Total feedbacks</h3><p>${stats.total}</p></div>
          <div class="kpi-box"><h3>Unread</h3><p>${stats.unread}</p></div>
          <div class="kpi-box"><h3>Replied</h3><p>${stats.replied}</p></div>
          <div class="kpi-box"><h3>Anonymous</h3><p>${stats.anonymous}</p></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Subject</th>
              <th>Sender</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Excel / CSV Export System
  const triggerExcelExport = () => {
    if (filteredFeedbacks.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["Feedback ID", "Sender", "Feedback Type", "Subject", "Message", "Priority", "Recipient TL", "Recipient Manager", "Recipient Boss", "Anonymous", "Status", "Date Submitted"];
    const rows = filteredFeedbacks.map(f => [
      f.id,
      f.isAnonymous ? "Anonymous Employee" : (f.recruiter?.name || "N/A"),
      f.feedbackType,
      f.subject,
      f.message,
      f.priority,
      f.toTL ? "Yes" : "No",
      f.toManager ? "Yes" : "No",
      f.toBoss ? "Yes" : "No",
      f.isAnonymous ? "Yes" : "No",
      f.status,
      new Date(f.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Feedback_Audit_Log_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "Critical": return "#ef4444";
      case "High": return "#f97316";
      case "Medium": return "#3b82f6";
      default: return "#10b981";
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Daily Feedbacks...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100%", fontFamily: "'Outfit', sans-serif", overflowY: "auto" }}>
      
      {/* HEADER NODES */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Daily Feedbacks </span>
            <span style={{ color: "#2563eb" }}>Center</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>
            Review, audit, and reply to reflection notes directed to your desking group.
          </p>
        </div>
      </div>
 
       {/* DASHBOARD STATISTICS KPI CARDS */}
       {!showAnalyticsTab && (
         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
           <div style={{ background: "white", padding: "16px 20px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
             <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Total Feedback</span>
             <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", marginTop: "4px", marginBottom: 0 }}>{stats.total}</h3>
           </div>
           <div style={{ background: "#fef2f2", padding: "16px 20px", borderRadius: "20px", border: "1px solid #fecaca", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
             <span style={{ fontSize: "0.65rem", color: "#dc2626", fontWeight: 800, textTransform: "uppercase" }}>Unread Feedback</span>
             <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#dc2626", marginTop: "4px", marginBottom: 0 }}>{stats.unread}</h3>
           </div>
           <div style={{ background: "#eff6ff", padding: "16px 20px", borderRadius: "20px", border: "1px solid #bfdbfe", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
             <span style={{ fontSize: "0.65rem", color: "#2563eb", fontWeight: 800, textTransform: "uppercase" }}>Read Feedback</span>
             <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#2563eb", marginTop: "4px", marginBottom: 0 }}>{stats.read}</h3>
           </div>
           <div style={{ background: "#f0fdf4", padding: "16px 20px", borderRadius: "20px", border: "1px solid #bbf7d0", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
             <span style={{ fontSize: "0.65rem", color: "#16a34a", fontWeight: 800, textTransform: "uppercase" }}>Replied Feedback</span>
             <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#16a34a", marginTop: "4px", marginBottom: 0 }}>{stats.replied}</h3>
           </div>
           <div style={{ background: "#faf5ff", padding: "16px 20px", borderRadius: "20px", border: "1px solid #e9d5ff", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
             <span style={{ fontSize: "0.65rem", color: "#7c3aed", fontWeight: 800, textTransform: "uppercase" }}>Anonymous Feedback</span>
             <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#7c3aed", marginTop: "4px", marginBottom: 0 }}>{stats.anonymous}</h3>
           </div>
           <div style={{ background: "#fff7ed", padding: "16px 20px", borderRadius: "20px", border: "1px solid #ffedd5", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}>
             <span style={{ fontSize: "0.65rem", color: "#ea580c", fontWeight: 800, textTransform: "uppercase" }}>Closed Feedback</span>
             <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ea580c", marginTop: "4px", marginBottom: 0 }}>{stats.closed}</h3>
           </div>
         </div>
       )}

      {/* RENDER ANALYTICS HUB IF ENABLED */}
      {showAnalyticsTab ? (
        <div style={{ background: "white", padding: "30px", borderRadius: "30px", border: "1px solid #e2e8f0", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#0f172a", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <LucideBarChart3 size={20} color="#2563eb" /> Feedback Analytics Dashboard
          </h2>

          {loadingAnalytics ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
              <LucideLoader2 className="animate-spin" size={36} color="#2563eb" />
            </div>
          ) : !analytics ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              Analytics node unavailable. Please reload.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Row 1: High Level Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Response rate</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                    <h2 style={{ fontSize: "2.2rem", fontWeight: 950, color: "#2563eb", margin: 0 }}>{analytics.responseRate}%</h2>
                    <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 700 }}>Avg SLA Target</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "#cbd5e1", borderRadius: "10px", overflow: "hidden", marginTop: "10px" }}>
                    <div style={{ width: `${analytics.responseRate}%`, height: "100%", background: "#2563eb" }}></div>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Average Response Time</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                    <h2 style={{ fontSize: "2.2rem", fontWeight: 950, color: "#16a34a", margin: 0 }}>
                      {analytics.avgResponseTime > 60 
                        ? `${(analytics.avgResponseTime / 60).toFixed(1)} hrs` 
                        : `${analytics.avgResponseTime} mins`}
                    </h2>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#64748b" }}>Time elapsed from submission to reader lookup.</p>
                </div>

                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Anonymous submission ratio</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                    <h2 style={{ fontSize: "2.2rem", fontWeight: 950, color: "#7c3aed", margin: 0 }}>
                      {analytics.summary.total > 0 
                        ? `${Math.round((analytics.summary.anonymous / analytics.summary.total) * 100)}%` 
                        : "0%"}
                    </h2>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>
                      {analytics.summary.anonymous} of {analytics.summary.total} sent anonymously
                    </span>
                  </div>
                  <div style={{ display: "flex", width: "100%", height: "8px", borderRadius: "10px", overflow: "hidden", marginTop: "10px" }}>
                    <div style={{ width: `${analytics.summary.total > 0 ? (analytics.summary.anonymous / analytics.summary.total) * 100 : 0}%`, background: "#7c3aed" }}></div>
                    <div style={{ flex: 1, background: "#cbd5e1" }}></div>
                  </div>
                </div>
              </div>

              {/* Row 2: Distributions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                
                {/* Type Distribution */}
                <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "0.95rem", fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>Feedback Type Distribution</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {Object.entries(analytics.typeDist).map(([type, count]: [string, any]) => {
                      const pct = analytics.summary.total > 0 ? Math.round((count / analytics.summary.total) * 100) : 0;
                      return (
                        <div key={type}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "4px" }}>
                            <span>{type}</span>
                            <span>{count} ({pct}%)</span>
                          </div>
                          <div style={{ width: "100%", height: "6px", background: "#cbd5e1", borderRadius: "10px", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#2563eb" }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Distribution */}
                <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "0.95rem", fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>Priority Distribution</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {["Critical", "High", "Medium", "Low"].map((priority) => {
                      const count = analytics.priorityDist[priority] || 0;
                      const pct = analytics.summary.total > 0 ? Math.round((count / analytics.summary.total) * 100) : 0;
                      return (
                        <div key={priority}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "4px" }}>
                            <span>{priority}</span>
                            <span>{count} ({pct}%)</span>
                          </div>
                          <div style={{ width: "100%", height: "6px", background: "#cbd5e1", borderRadius: "10px", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: getPriorityColor(priority) }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Row 3: Trends & Department distribution */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Weekly Trend */}
                <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "0.95rem", fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>Weekly Trend Graph</h3>
                  <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: "160px", paddingTop: "20px" }}>
                    {Object.entries(analytics.weeklyTrend).map(([day, count]: [string, any]) => {
                      const maxCount = Math.max(...(Object.values(analytics.weeklyTrend) as number[]), 1);
                      const heightPct = (count / maxCount) * 80 + 5; // minimum height
                      return (
                        <div key={day} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "30px" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>{count}</span>
                          <div style={{ width: "16px", height: `${heightPct}px`, background: "linear-gradient(to top, #2563eb, #60a5fa)", borderRadius: "4px 4px 0 0" }}></div>
                          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", marginTop: "6px" }}>{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team Lead / Department Trend */}
                <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "0.95rem", fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>Supervisor Node Distribution</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {Object.entries(analytics.deptTrend).map(([name, count]: [string, any]) => {
                      const pct = analytics.summary.total > 0 ? Math.round((count / analytics.summary.total) * 100) : 0;
                      return (
                        <div key={name}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "4px" }}>
                            <span>{name}</span>
                            <span>{count} ({pct}%)</span>
                          </div>
                          <div style={{ width: "100%", height: "6px", background: "#cbd5e1", borderRadius: "10px", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#a855f7" }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      ) : (
        /* MAIN LIST WORKSPACE */
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* FILTER + LIST CONTAINER */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Filters panel */}
            <div style={{ background: "white", padding: "16px 20px", borderRadius: "20px", border: "1px solid #e2e8f0", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                <LucideSearch size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "10px" }} />
                <input
                  type="text"
                  placeholder="Search feedback subject, message body, or recruiter..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.82rem" }}
                />
              </div>

              {/* Date Filters */}
              <div>
                <select
                  value={datePreset}
                  onChange={e => setDatePreset(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  {role === "boss" && <option value="1year">Last 1 Year</option>}
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}
                >
                  <option value="all">All Priorities</option>
                  <option value="Critical">Critical Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}
                >
                  <option value="all">All Types</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Inquiry">Inquiry</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="Complaint">Complaint</option>
                </select>
              </div>

              {datePreset === "custom" && (
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }} />
                  <span style={{ fontSize: "0.75rem" }}>to</span>
                  <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }} />
                </div>
              )}
            </div>

            {/* List tabs */}
            <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0", minHeight: "450px" }}>
              <div style={{ display: "flex", borderBottom: "1.5px solid #cbd5e1", gap: "20px", marginBottom: "16px" }}>
                {(["Unread", "Read", "Replied", "Closed"] as const).map(tab => {
                  const active = currentListTab === tab;
                  const count = filteredFeedbacks.filter(f => {
                    if (tab === "Closed") {
                      return f.isClosed;
                    }
                    if (f.isClosed) return false;

                    if (tab === "Unread") {
                      return role === "tl" ? !f.readByTL : (role === "manager" ? !f.readByManager : !f.readByBoss);
                    }
                    if (tab === "Read") {
                      const readByMe = 
                        (role === "tl" && f.readByTL) ||
                        (role === "manager" && f.readByManager) ||
                        (role === "boss" && f.readByBoss);
                      return readByMe && f.status !== "Replied";
                    }
                    return f.status === "Replied";
                  }).length;

                  return (
                    <button
                      key={tab}
                      onClick={() => setCurrentListTab(tab)}
                      style={{
                        padding: "10px 4px",
                        border: "none",
                        background: "none",
                        borderBottom: active ? "3px solid #2563eb" : "3px solid transparent",
                        color: active ? "#2563eb" : "#64748b",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {tab}
                      <span style={{ fontSize: "0.68rem", background: active ? "#eff6ff" : "#f1f5f9", color: active ? "#2563eb" : "#64748b", padding: "1px 6px", borderRadius: "100px" }}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feed Card List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "650px", overflowY: "auto" }}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    Fetching feed reflection logs...
                  </div>
                ) : listTabFeedbacks.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No feedback records match this selection.
                  </div>
                ) : (
                  listTabFeedbacks.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => handleSelectFeedback(f)}
                      style={{
                        border: selectedFeedback?.id === f.id ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                        background: selectedFeedback?.id === f.id ? "#f8fafc" : "#ffffff",
                        borderRadius: "16px",
                        padding: "16px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ fontSize: "0.68rem", background: "#eff6ff", color: "#2563eb", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>
                            {f.feedbackType}
                          </span>
                          <span style={{ fontSize: "0.68rem", color: getPriorityColor(f.priority), fontWeight: 800 }}>
                            ● {f.priority}
                          </span>
                          {f.isClosed && (
                            <span style={{ fontSize: "0.6rem", background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", padding: "1px 5px", borderRadius: "4px", fontWeight: 900, textTransform: "uppercase" }}>
                              Closed
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                          {new Date(f.createdAt).toLocaleDateString()} {new Date(f.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>

                      <h4 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 800, color: "#0f172a" }}>{f.subject}</h4>
                      <p style={{ margin: "0 0 10px", fontSize: "0.78rem", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {f.message}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #cbd5e1", paddingTop: "8px", fontSize: "0.72rem", color: "#64748b" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {f.isAnonymous ? <LucideUserX size={12} color="#7c3aed" /> : <LucideUserCheck size={12} color="#16a34a" />}
                          Sender: <strong>{f.isAnonymous ? "Anonymous Employee" : (f.recruiter?.name || "N/A")}</strong>
                        </span>

                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSelectFeedback(f); }}
                            style={{ border: "none", background: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
                          >
                            <LucideReply size={10} /> Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

          {/* OVERLAY TIMELINE CHAT MODAL POPUP */}
          <AnimatePresence>
            {selectedFeedback && (
              <div
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: "rgba(15, 23, 42, 0.4)",
                  backdropFilter: "blur(4px)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px"
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 250 }}
                  style={{
                    background: "white",
                    borderRadius: "24px",
                    padding: "24px",
                    width: "100%",
                    maxWidth: "650px",
                    maxHeight: "90vh",
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    position: "relative"
                  }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      border: "none",
                      background: "#f1f5f9",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#475569",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      transition: "all 0.15s ease",
                      outline: "none"
                    }}
                    className="btn-hover"
                  >
                    ✕
                  </button>

                  {/* Header details */}
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "14px", alignItems: "center", paddingRight: "30px" }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Feedback Node ID: #{selectedFeedback.id}</span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {(role === "manager" || role === "boss") && !selectedFeedback.isClosed && (
                        <button
                          onClick={handleCloseFeedback}
                          className="btn-hover"
                          style={{
                            background: "#fee2e2",
                            color: "#ef4444",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          Close Query
                        </button>
                      )}
                      {selectedFeedback.isClosed && (
                        <span style={{ fontSize: "0.68rem", background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", padding: "4px 8px", borderRadius: "6px", fontWeight: 900 }}>
                          CLOSED
                        </span>
                      )}
                      <span style={{ fontSize: "0.7rem", background: getPriorityColor(selectedFeedback.priority) + "15", color: getPriorityColor(selectedFeedback.priority), padding: "4px 8px", borderRadius: "6px", fontWeight: 800 }}>
                        {selectedFeedback.priority} Rank
                      </span>
                    </div>
                  </div>

                  <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", flex: 1, paddingRight: "4px" }}>
                    {/* Closed tag banner */}
                    {selectedFeedback.isClosed && (
                      <div
                        style={{
                          background: "#fee2e2",
                          color: "#ef4444",
                          border: "1px solid #fecaca",
                          borderRadius: "12px",
                          padding: "12px",
                          textAlign: "center",
                          fontSize: "0.82rem",
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px"
                        }}
                      >
                        🚫 QUERY CONVERSATION RESOLVED & CLOSED
                      </div>
                    )}

                    {/* Feedback details */}
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.68rem", background: "#2563eb", color: "white", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>
                          {selectedFeedback.feedbackType}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>
                          Sender: {selectedFeedback.isAnonymous ? "Anonymous Employee" : (selectedFeedback.recruiter?.name || "N/A")}
                        </span>
                      </div>
                      <h3 style={{ margin: "0 0 6px", fontWeight: 900, color: "#0f172a", fontSize: "0.95rem" }}>{selectedFeedback.subject}</h3>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{selectedFeedback.message}</p>
                    </div>

                    {/* Audit Lookups */}
                    <div style={{ background: "#eff6ff", borderRadius: "12px", padding: "12px 14px", fontSize: "0.72rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontWeight: 800, color: "#1e3a8a", textTransform: "uppercase" }}>Audit Lookup Triggers</span>
                      {selectedFeedback.readByTL && (
                        <span style={{ color: "#16a34a" }}>✔ Marked Read by TL on {new Date(selectedFeedback.readByTLAt).toLocaleDateString()} {new Date(selectedFeedback.readByTLAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      )}
                      {selectedFeedback.readByManager && (
                        <span style={{ color: "#16a34a" }}>✔ Marked Read by Manager on {new Date(selectedFeedback.readByManagerAt).toLocaleDateString()} {new Date(selectedFeedback.readByManagerAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      )}
                      {selectedFeedback.readByBoss && (
                        <span style={{ color: "#16a34a" }}>✔ Marked Read by Boss on {new Date(selectedFeedback.readByBossAt).toLocaleDateString()} {new Date(selectedFeedback.readByBossAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      )}
                    </div>

                    {/* Conversation replies list */}
                    <div style={{ minHeight: "220px", maxHeight: "350px", overflowY: "auto", background: "#f8fafc", padding: "12px", borderRadius: "16px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {conversationReplies.length === 0 ? (
                        <div style={{ margin: "auto", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>
                          No replies on this feed yet. Write one below.
                        </div>
                      ) : (
                        conversationReplies.map((reply) => {
                          const isMe = reply.senderRole === role;
                          return (
                            <div
                              key={reply.id}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignSelf: isMe ? "flex-end" : "flex-start",
                                maxWidth: "85%",
                                background: isMe ? "#2563eb" : "#ffffff",
                                color: isMe ? "white" : "#1e293b",
                                border: isMe ? "none" : "1px solid #cbd5e1",
                                padding: "8px 12px",
                                borderRadius: isMe ? "12px 12px 0 12px" : "12px 12px 12px 0",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.01)"
                              }}
                            >
                              <span style={{ fontSize: "0.62rem", fontWeight: 800, opacity: 0.8, marginBottom: "2px" }}>
                                {reply.senderRole === "recruiter" && reply.isAnonymous 
                                  ? "Anonymous Employee" 
                                  : `${reply.sender?.name || "System"} (${reply.senderRole.toUpperCase()})`}
                              </span>
                              <p style={{ margin: 0, fontSize: "0.78rem", lineHeight: 1.4 }}>{reply.message}</p>
                              <span style={{ fontSize: "0.58rem", opacity: 0.7, textAlign: "right", display: "block", marginTop: "4px" }}>
                                {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Reply Composer Form */}
                  <form onSubmit={handleSendReply} style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                    <input
                      type="text"
                      disabled={selectedFeedback.isClosed}
                      value={newReplyText}
                      onChange={e => setNewReplyText(e.target.value)}
                      placeholder={selectedFeedback.isClosed ? "Replies are disabled for closed queries." : "Type reply reflections..."}
                      style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.82rem", outline: "none", background: selectedFeedback.isClosed ? "#f1f5f9" : "white" }}
                    />
                    <button
                      type="submit"
                      disabled={submittingReply || selectedFeedback.isClosed}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "10px",
                        background: selectedFeedback.isClosed ? "#cbd5e1" : "#2563eb",
                        color: selectedFeedback.isClosed ? "#64748b" : "white",
                        border: "none",
                        cursor: selectedFeedback.isClosed ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: 700,
                        fontSize: "0.82rem"
                      }}
                    >
                      Reply
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
