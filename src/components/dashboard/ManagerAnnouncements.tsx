import React, { useState, useEffect } from "react";
import {
  LucideMegaphone,
  LucideSend,
  LucideCalendar,
  LucideClock,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucidePlus,
  LucideTrash2,
  LucideUsers,
  LucideFileText,
  LucideBarChart3,
  LucideSearch,
  LucideFilter,
  LucidePaperclip,
  LucideActivity,
  LucideArchive,
  LucideX,
  LucideCheck,
  LucideEye, 
  LucideHelpCircle,
  LucideSmile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ManagerAnnouncements() {
  // Team (TLs & Recruiters) state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Announcement form states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent" | "critical">("normal");
  const [type, setType] = useState<"simple" | "poll" | "manual" | "mixed">("simple");
  const [options, setOptions] = useState<string[]>(["Yes", "No"]);
  const [newOption, setNewOption] = useState("");
  const [allowManual, setAllowManual] = useState(false);
  const [responseRequired, setResponseRequired] = useState(false);

  // Recipient selectors (TL & Recruiter IDs)
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);

  // Smart schedule options
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleOption, setScheduleOption] = useState("specific"); // specific, tomorrow
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [repeatOption, setRepeatOption] = useState<"none" | "daily" | "weekly" | "monthly" | "until_completed">("none");

  // Expiry options
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");

  // Attachments
  const [attachments, setAttachments] = useState<any[]>([]);
  const [attachName, setAttachName] = useState("");
  const [attachUrl, setAttachUrl] = useState("");
  const [attachType, setAttachType] = useState("image");

  // History & Analytics states
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, sent, scheduled, expired
  const [filterPriority, setFilterPriority] = useState("all");

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeam();
    fetchAnnouncements();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchTeam = async () => {
    setLoadingTeam(true);
    try {
      // Pulls direct and indirect reporting structure from Manager scope
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Keep only TLs and Recruiters (filter out the manager node)
          const filtered = data.filter((m: any) => m.role === "tl" || m.role === "recruiter");
          setTeamMembers(filtered);
        }
      }
    } catch (err) {
      console.error("Failed to load team roster:", err);
    } finally {
      setLoadingTeam(false);
    }
  };

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAnnouncements(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const loadAnalytics = async (announcementId: number) => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/announcements/${announcementId}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleSelectAnnouncement = (ann: any) => {
    setSelectedAnnouncement(ann);
    loadAnalytics(ann.id);
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    if (options.includes(newOption.trim())) {
      showNotification("error", "Option already exists");
      return;
    }
    setOptions([...options, newOption.trim()]);
    setNewOption("");
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleAddAttachment = () => {
    if (!attachName.trim() || !attachUrl.trim()) return;
    setAttachments([...attachments, { name: attachName.trim(), url: attachUrl.trim(), type: attachType }]);
    setAttachName("");
    setAttachUrl("");
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const toggleSelectRecipient = (id: number) => {
    if (selectedRecipients.includes(id)) {
      setSelectedRecipients(selectedRecipients.filter(rid => rid !== id));
    } else {
      setSelectedRecipients([...selectedRecipients, id]);
    }
  };

  const selectAllTeam = () => {
    setSelectedRecipients(teamMembers.map(m => m.id));
  };

  const selectOnlineOnly = () => {
    const onlineIds = teamMembers.filter(m => m.online || m.status === "active").map(m => m.id);
    setSelectedRecipients(onlineIds);
  };

  const selectTlsOnly = () => {
    const tlIds = teamMembers.filter(m => m.role === "tl").map(m => m.id);
    setSelectedRecipients(tlIds);
  };

  const selectRecruitersOnly = () => {
    const recIds = teamMembers.filter(m => m.role === "recruiter").map(m => m.id);
    setSelectedRecipients(recIds);
  };

  const clearSelection = () => {
    setSelectedRecipients([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showNotification("error", "Title is required");
      return;
    }
    if (selectedRecipients.length === 0) {
      showNotification("error", "Please select at least one recipient");
      return;
    }

    setSubmitting(true);

    // Calculate scheduled date/time
    let finalScheduledAt = null;
    if (isScheduled) {
      if (scheduleOption === "tomorrow") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // default to 9 AM tomorrow
        finalScheduledAt = tomorrow.toISOString();
      } else if (scheduledDate) {
        const timeStr = scheduledTime || "09:00";
        finalScheduledAt = `${scheduledDate}T${timeStr}:00`;
      }
    }

    // Calculate expiry
    let finalExpiredAt = null;
    if (hasExpiry && expiryDate) {
      const timeStr = expiryTime || "23:59";
      finalExpiredAt = `${expiryDate}T${timeStr}:00`;
    }

    const payload = {
      title,
      message,
      priority,
      type,
      options: ["poll", "mixed"].includes(type) ? options : null,
      allowManual: ["manual", "mixed"].includes(type) ? true : allowManual,
      responseRequired,
      scheduledAt: finalScheduledAt,
      expiredAt: finalExpiredAt,
      targetAssignees: selectedRecipients,
      attachments: attachments.length > 0 ? attachments : null,
      repeatOption
    };

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showNotification("success", isScheduled ? "Announcement scheduled successfully!" : "Announcement broadcasted live!");
        // Reset form
        setTitle("");
        setMessage("");
        setPriority("normal");
        setType("simple");
        setOptions(["Yes", "No"]);
        setAllowManual(false);
        setResponseRequired(false);
        setSelectedRecipients([]);
        setIsScheduled(false);
        setScheduledDate("");
        setScheduledTime("");
        setRepeatOption("none");
        setHasExpiry(false);
        setExpiryDate("");
        setExpiryTime("");
        setAttachments([]);

        fetchAnnouncements();
      } else {
        const err = await res.json();
        showNotification("error", err.error || "Failed to create announcement");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Network or server failure");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this announcement and all its analytics?")) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("success", "Announcement removed successfully.");
        if (selectedAnnouncement?.id === id) {
          setSelectedAnnouncement(null);
          setAnalyticsData(null);
        }
        fetchAnnouncements();
      } else {
        showNotification("error", "Failed to delete announcement.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper values for overall analytics
  const overallStats = (() => {
    if (announcements.length === 0) return { sent: 0, responded: 0, rate: 0 };
    let totalSent = 0;
    let totalRes = 0;
    announcements.forEach(a => {
      if (a.responses) {
        totalSent += a.responses.length;
        totalRes += a.responses.filter((r: any) => r.status === "responded").length;
      }
    });
    return {
      sent: totalSent,
      responded: totalRes,
      rate: totalSent > 0 ? Math.round((totalRes / totalSent) * 100) : 0
    };
  })();

  // Filter list
  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch =
      ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const now = new Date();
    let matchesType = true;
    if (filterType === "sent") {
      matchesType = !ann.scheduledAt || new Date(ann.scheduledAt) <= now;
    } else if (filterType === "scheduled") {
      matchesType = ann.scheduledAt && new Date(ann.scheduledAt) > now;
    } else if (filterType === "expired") {
      matchesType = ann.expiredAt && new Date(ann.expiredAt) < now;
    }

    const matchesPriority = filterPriority === "all" || ann.priority === filterPriority;

    return matchesSearch && matchesType && matchesPriority;
  });

  return (
    <div className="announcements-tab-container" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "16px", padding: "4px 8px", height: "calc(100vh - 110px)", overflow: "hidden", background: "#f8fafc" }}>

      {/* LEFT COLUMN: Broadcast Controls & Sent History */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto", paddingRight: "4px" }}>

        {/* Overall KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          <div className="stat-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "10px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "rgba(59, 130, 246, 0.08)", color: "#2563eb", padding: "8px", borderRadius: "6px", display: "flex" }}>
              <LucideMegaphone size={16} />
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Broadcasts</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a" }}>{announcements.length}</div>
            </div>
          </div>
          <div className="stat-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "10px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.08)", color: "#10b981", padding: "8px", borderRadius: "6px", display: "flex" }}>
              <LucideUsers size={16} />
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Total Reach</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a" }}>{overallStats.sent}</div>
            </div>
          </div>
          <div className="stat-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "10px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "rgba(245, 158, 11, 0.08)", color: "#d97706", padding: "8px", borderRadius: "6px", display: "flex" }}>
              <LucideActivity size={16} />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#0f172a" }}>{overallStats.rate}%</div>
            </div>
          </div>
        </div>

        {/* Global Toast Alert */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                background: notification.type === "success" ? "#ecfdf5" : "#fef2f2",
                border: `1px solid ${notification.type === "success" ? "#a7f3d0" : "#fca5a5"}`,
                color: notification.type === "success" ? "#065f46" : "#991b1b",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {notification.type === "success" ? <LucideCheckCircle2 size={14} style={{ color: "#10b981" }} /> : <LucideAlertTriangle size={14} style={{ color: "#ef4444" }} />}
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form: Broadcast Hub */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", borderRadius: "12px", padding: "14px 16px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <LucideSend size={15} className="text-blue-600" />
            Launch Announcement Broadcast (Manager Console)
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* Title & Priority */}
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1.2fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "10px", color: "#475569", display: "block", marginBottom: "3px", fontWeight: "600" }}>Announcement Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. System Wide Update..."
                  style={{ width: "100%", background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "6px", padding: "5px 10px", fontSize: "12px", outline: "none" }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: "10px", color: "#475569", display: "block", marginBottom: "3px", fontWeight: "600" }}>Priority</label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  style={{ width: "100%", background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "6px", padding: "5px 6px", fontSize: "12px", outline: "none" }}
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent 🚨</option>
                  <option value="critical">Critical 🔥</option>
                </select>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label style={{ fontSize: "10px", color: "#475569", display: "block", marginBottom: "3px", fontWeight: "600" }}>Message Body</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement details here..."
                style={{ width: "100%", height: "56px", background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "6px", padding: "6px 10px", fontSize: "12px", resize: "none", outline: "none" }}
              />
            </div>

            {/* Type selector & Formats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "10px", color: "#475569", display: "block", marginBottom: "3px", fontWeight: "600" }}>Format Type</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  style={{ width: "100%", background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "6px", padding: "5px 6px", fontSize: "12px", outline: "none" }}
                >
                  <option value="simple">Simple Announcement</option>
                  <option value="poll">Question Poll</option>
                  <option value="manual">Manual Text Reply</option>
                  <option value="mixed">Mixed (Poll + Custom)</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "5px", paddingTop: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#1e293b", cursor: "pointer", fontWeight: "600" }}>
                  <input
                    type="checkbox"
                    checked={responseRequired}
                    onChange={(e) => setResponseRequired(e.target.checked)}
                    style={{ accentColor: "#2563eb", width: "12px", height: "12px" }}
                  />
                  <span>Required Response (Lock)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#1e293b", cursor: "pointer", fontWeight: "600" }}>
                  <input
                    type="checkbox"
                    checked={allowManual}
                    disabled={["manual", "mixed"].includes(type)}
                    onChange={(e) => setAllowManual(e.target.checked)}
                    style={{ accentColor: "#2563eb", width: "12px", height: "12px" }}
                  />
                  <span>Allow Custom Typed Reply</span>
                </label>
              </div>
            </div>

            {/* POLL OPTIONS CONFIG */}
            {["poll", "mixed"].includes(type) && (
              <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <label style={{ fontSize: "10px", color: "#2563eb", display: "block", marginBottom: "6px", fontWeight: "700" }}>Poll Options Config</label>
                <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add option..."
                    style={{ flex: 1, background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", outline: "none" }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    style={{ background: "#2563eb", border: "none", color: "#fff", padding: "0 10px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "2px", fontWeight: "600" }}
                  >
                    <LucidePlus size={12} /> Add
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {options.map((opt, idx) => (
                    <span key={idx} style={{ background: "rgba(37, 99, 235, 0.06)", border: "1px solid rgba(37, 99, 235, 0.2)", color: "#1d4ed8", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
                      {opt}
                      <LucideX size={10} style={{ cursor: "pointer", color: "#ef4444" }} onClick={() => handleRemoveOption(idx)} />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ATTACHMENT HUB */}
            <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <label style={{ fontSize: "10px", color: "#475569", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px", fontWeight: "700" }}>
                <LucidePaperclip size={11} /> Add Attachments (PDF, Excel, Notes)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 2.2fr 1.1fr 0.8fr", gap: "4px", marginBottom: "4px" }}>
                <input
                  type="text"
                  value={attachName}
                  onChange={(e) => setAttachName(e.target.value)}
                  placeholder="Doc Name"
                  style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "4px", padding: "4px 6px", fontSize: "11px", outline: "none" }}
                />
                <input
                  type="text"
                  value={attachUrl}
                  onChange={(e) => setAttachUrl(e.target.value)}
                  placeholder="Link URL"
                  style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "4px", padding: "4px 6px", fontSize: "11px", outline: "none" }}
                />
                <select
                  value={attachType}
                  onChange={(e) => setAttachType(e.target.value)}
                  style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "4px", padding: "4px 2px", fontSize: "11px", outline: "none" }}
                >
                  <option value="image">Image</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="doc">Doc</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#334155", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}
                >
                  Attach
                </button>
              </div>
              {attachments.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                  {attachments.map((file, idx) => (
                    <span key={idx} style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
                      <LucideFileText size={9} />
                      {file.name} ({file.type})
                      <LucideX size={9} style={{ cursor: "pointer", color: "#ef4444" }} onClick={() => handleRemoveAttachment(idx)} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* RECIPIENT MULTI-SELECTOR PANEL */}
            <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "10px", color: "#475569", display: "flex", alignItems: "center", gap: "4px", fontWeight: "700" }}>
                  <LucideUsers size={11} />
                  Recipients ({selectedRecipients.length} Selected)
                </label>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button type="button" onClick={selectAllTeam} style={{ background: "rgba(59,130,246,0.08)", border: "none", color: "#2563eb", fontSize: "9.5px", padding: "1px 5px", borderRadius: "3px", cursor: "pointer", fontWeight: "700" }}>All</button>
                  <button type="button" onClick={selectOnlineOnly} style={{ background: "rgba(16,185,129,0.08)", border: "none", color: "#10b981", fontSize: "9.5px", padding: "1px 5px", borderRadius: "3px", cursor: "pointer", fontWeight: "700" }}>Online</button>
                  <button type="button" onClick={selectTlsOnly} style={{ background: "rgba(245,158,11,0.08)", border: "none", color: "#d97706", fontSize: "9.5px", padding: "1px 5px", borderRadius: "3px", cursor: "pointer", fontWeight: "700" }}>TLs</button>
                  <button type="button" onClick={selectRecruitersOnly} style={{ background: "rgba(139,92,246,0.08)", border: "none", color: "#7c3aed", fontSize: "9.5px", padding: "1px 5px", borderRadius: "3px", cursor: "pointer", fontWeight: "700" }}>Recs</button>
                  <button type="button" onClick={clearSelection} style={{ background: "rgba(239,68,68,0.08)", border: "none", color: "#ef4444", fontSize: "9.5px", padding: "1px 5px", borderRadius: "3px", cursor: "pointer", fontWeight: "700" }}>Clear</button>
                </div>
              </div>

              {loadingTeam ? (
                <div style={{ fontSize: "10px", color: "#64748b", textAlign: "center", padding: "6px" }}>Loading team roster...</div>
              ) : teamMembers.length === 0 ? (
                <div style={{ fontSize: "10px", color: "#64748b", textAlign: "center", padding: "6px" }}>No team members found under reporting structure.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px", maxHeight: "90px", overflowY: "auto", padding: "1px" }}>
                  {teamMembers.map(m => (
                    <div
                      key={m.id}
                      onClick={() => toggleSelectRecipient(m.id)}
                      style={{
                        background: selectedRecipients.includes(m.id) ? "rgba(37, 99, 235, 0.06)" : "#ffffff",
                        border: `1px solid ${selectedRecipients.includes(m.id) ? "#3b82f6" : "#cbd5e1"}`,
                        borderRadius: "4px",
                        padding: "4px 6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{
                          fontSize: "8px",
                          background: m.role === "tl" ? "#f5f3ff" : "#eff6ff",
                          color: m.role === "tl" ? "#7c3aed" : "#2563eb",
                          padding: "1px 3px",
                          borderRadius: "3px",
                          fontWeight: "800",
                          textTransform: "uppercase",
                          marginRight: "3px",
                          flexShrink: 0
                        }}>
                          {m.role}
                        </span>
                        <span style={{ fontSize: "10px", color: "#1e293b", fontWeight: selectedRecipients.includes(m.id) ? "700" : "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.name.split(" ")[0]}
                        </span>
                      </div>
                      {selectedRecipients.includes(m.id) && <LucideCheck size={9} style={{ color: "#2563eb", strokeWidth: 3, flexShrink: 0 }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SCHEDULING & EXPIRY EXPANDER */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>

              {/* SMART SCHEDULE */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#1e293b", cursor: "pointer", marginBottom: "4px", fontWeight: "600" }}>
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    style={{ accentColor: "#2563eb", width: "12px", height: "12px" }}
                  />
                  <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><LucideCalendar size={11} /> Schedule Broadcast</span>
                </label>

                {isScheduled && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "4px 6px", background: "#f1f5f9", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                    <select
                      value={scheduleOption}
                      onChange={(e) => setScheduleOption(e.target.value)}
                      style={{ width: "100%", background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "3px", padding: "3px", fontSize: "10.5px", outline: "none" }}
                    >
                      <option value="specific">Date & Time</option>
                      <option value="tomorrow">Tomorrow (9 AM)</option>
                    </select>
                    {scheduleOption === "specific" && (
                      <div style={{ display: "flex", gap: "3px" }}>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          style={{ flex: 1, background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "3px", padding: "3px", fontSize: "10.5px", outline: "none" }}
                        />
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          style={{ flex: 1, background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "3px", padding: "3px", fontSize: "10.5px", outline: "none" }}
                        />
                      </div>
                    )}
                    <div>
                      <select
                        value={repeatOption}
                        onChange={(e: any) => setRepeatOption(e.target.value)}
                        style={{ width: "100%", background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "3px", padding: "3px", fontSize: "10.5px", outline: "none" }}
                      >
                        <option value="none">No Repeat</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="until_completed">Until Completed</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* ANNOUNCEMENT EXPIRY */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#1e293b", cursor: "pointer", marginBottom: "4px", fontWeight: "600" }}>
                  <input
                    type="checkbox"
                    checked={hasExpiry}
                    onChange={(e) => setHasExpiry(e.target.checked)}
                    style={{ accentColor: "#2563eb", width: "12px", height: "12px" }}
                  />
                  <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><LucideClock size={11} /> Expiry Timer</span>
                </label>

                {hasExpiry && (
                  <div style={{ display: "flex", gap: "3px", padding: "4px 6px", background: "#f1f5f9", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      style={{ flex: 1, background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "3px", padding: "3px", fontSize: "10.5px", outline: "none" }}
                    />
                    <input
                      type="time"
                      value={expiryTime}
                      onChange={(e) => setExpiryTime(e.target.value)}
                      style={{ flex: 1, background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "3px", padding: "3px", fontSize: "10.5px", outline: "none" }}
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Trigger Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                border: "none",
                color: "#fff",
                fontWeight: "700",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 3px 8px rgba(37, 99, 235, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontSize: "12px",
                transition: "all 0.2s"
              }}
            >
              {submitting ? (
                <span>Dispatching Broadcast...</span>
              ) : (
                <>
                  <LucideSend size={13} />
                  {isScheduled ? "Schedule Announcement" : "Instant Launch Announcement"}
                </>
              )}
            </button>

          </form>
        </div>

      </div>

      {/* RIGHT COLUMN: Announcement History & Live Tracking */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto", paddingRight: "4px" }}>

        {/* Search, Filter & List Card */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", borderRadius: "12px", padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", minHeight: "300px", overflow: "hidden" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              <LucideArchive size={15} className="text-emerald-600" />
              Communication Registry & Logs
            </h2>

            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>{filteredAnnouncements.length} logs</span>
          </div>

          {/* Search and filter inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.1fr 1.1fr", gap: "6px", marginBottom: "10px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                style={{ width: "100%", background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "6px", padding: "5px 8px 5px 26px", fontSize: "11.5px", outline: "none" }}
              />
              <LucideSearch size={11} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ width: "100%", background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "6px", padding: "5px", fontSize: "11.5px", outline: "none" }}
              >
                <option value="all">All Logs</option>
                <option value="sent">Delivered</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{ width: "100%", background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: "6px", padding: "5px", fontSize: "11.5px", outline: "none" }}
              >
                <option value="all">All Priority</option>
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Announcement list */}
          {loadingAnnouncements ? (
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px" }}>Loading registry...</div>
          ) : filteredAnnouncements.length === 0 ? (
            <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", gap: "8px", padding: "16px" }}>
              <LucideMegaphone size={24} style={{ color: "#cbd5e1" }} />
              <div style={{ fontSize: "12px" }}>No announcements found in team logs.</div>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", paddingRight: "2px" }}>
              {filteredAnnouncements.map((ann) => {
                const isSel = selectedAnnouncement?.id === ann.id;
                const now = new Date();
                const isSched = ann.scheduledAt && new Date(ann.scheduledAt) > now;
                const isExp = ann.expiredAt && new Date(ann.expiredAt) < now;

                // Calculate mini progress
                const tSent = ann.responses?.length || 0;
                const tRes = ann.responses?.filter((r: any) => r.status === "responded").length || 0;
                const progressPct = tSent > 0 ? Math.round((tRes / tSent) * 100) : 0;

                const priorityColors = {
                  normal: { bg: "rgba(37, 99, 235, 0.06)", text: "#2563eb", border: "rgba(37, 99, 235, 0.15)" },
                  important: { bg: "rgba(245, 158, 11, 0.06)", text: "#d97706", border: "rgba(245, 158, 11, 0.15)" },
                  urgent: { bg: "rgba(239, 68, 68, 0.06)", text: "#dc2626", border: "rgba(239, 68, 68, 0.2)" },
                  critical: { bg: "rgba(236, 72, 153, 0.06)", text: "#db2777", border: "rgba(236, 72, 153, 0.2)" }
                };

                const pColor = priorityColors[ann.priority as keyof typeof priorityColors] || priorityColors.normal;

                return (
                  <div
                    key={ann.id}
                    onClick={() => handleSelectAnnouncement(ann)}
                    style={{
                      background: isSel ? "rgba(37, 99, 235, 0.03)" : "#f8fafc",
                      border: `1px solid ${isSel ? "#3b82f6" : "#e2e8f0"}`,
                      borderRadius: "8px",
                      padding: "10px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      transition: "all 0.15s",
                      boxShadow: isSel ? "0 2px 8px rgba(37, 99, 235, 0.08)" : "none"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ background: pColor.bg, border: `1px solid ${pColor.border}`, color: pColor.text, fontSize: "9px", padding: "1px 4px", borderRadius: "3px", textTransform: "capitalize", fontWeight: "700" }}>
                          {ann.priority}
                        </span>

                        {isSched && <span style={{ background: "rgba(124, 58, 237, 0.08)", border: "1px solid rgba(124, 58, 237, 0.15)", color: "#7c3aed", fontSize: "9px", padding: "1px 4px", borderRadius: "3px" }}>Scheduled</span>}
                        {isExp && <span style={{ background: "rgba(100, 116, 139, 0.08)", border: "1px solid rgba(100, 116, 139, 0.15)", color: "#64748b", fontSize: "9px", padding: "1px 4px", borderRadius: "3px" }}>Expired</span>}

                        <span style={{ fontSize: "9.5px", color: "#64748b" }}>
                          {new Date(ann.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(ann.id); }}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "2px", display: "flex" }}
                        title="Delete log"
                      >
                        <LucideTrash2 size={12} />
                      </button>
                    </div>

                    <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#0f172a" }}>{ann.title}</div>
                    <div style={{ fontSize: "11.5px", color: "#475569", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>
                      {ann.message || "No body content."}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: "6px", marginTop: "2px" }}>
                      <span style={{ fontSize: "10.5px", color: "#64748b" }}>
                        Format: <span style={{ color: "#0f172a", textTransform: "capitalize", fontWeight: "600" }}>{ann.type}</span>
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "50px", height: "3px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${progressPct}%`, height: "100%", background: "#10b981" }} />
                        </div>
                        <span style={{ fontSize: "10.5px", color: "#10b981", fontWeight: "700" }}>{tRes}/{tSent} ({progressPct}%)</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Selected Announcement Analytics Drawer */}
        {selectedAnnouncement && (
          <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", borderRadius: "12px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "5px" }}>
                <LucideBarChart3 size={14} className="text-blue-600" />
                Live Response Analytics & Insights
              </h3>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "2px", display: "flex" }}
              >
                <LucideX size={14} />
              </button>
            </div>

            {loadingAnalytics ? (
              <div style={{ fontSize: "11px", color: "#64748b", textAlign: "center", padding: "10px" }}>Compiling metrics telemetry...</div>
            ) : analyticsData ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "9px", color: "#64748b", fontWeight: "600" }}>Sent</div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>{analyticsData.stats.totalSent}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "9px", color: "#64748b", fontWeight: "600" }}>Delivered</div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#2563eb" }}>{analyticsData.stats.totalDelivered}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "9px", color: "#64748b", fontWeight: "600" }}>Viewed</div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#d97706" }}>{analyticsData.stats.totalViewed}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "9px", color: "#64748b", fontWeight: "600" }}>Responded</div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#10b981" }}>{analyticsData.stats.totalResponded}</div>
                  </div>
                </div>

                {/* Poll results distribution */}
                {["poll", "mixed"].includes(analyticsData.announcement.type) && analyticsData.announcement.options.length > 0 && (
                  <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ fontSize: "11px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>Poll Results Distribution</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {analyticsData.announcement.options.map((opt: string, idx: number) => {
                        const count = analyticsData.pollResults[opt] || 0;
                        const total = analyticsData.stats.totalResponded || 1;
                        const percent = Math.round((count / total) * 100);
                        return (
                          <div key={idx}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "#475569", marginBottom: "2px" }}>
                              <span style={{ color: "#0f172a", fontWeight: "600" }}>{opt}</span>
                              <span>{count} votes ({percent}%)</span>
                            </div>
                            <div style={{ width: "100%", height: "5px", background: "#cbd5e1", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${percent}%`, height: "100%", background: "linear-gradient(90deg, #2563eb, #3b82f6)", borderRadius: "2px" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recipient status tracker */}
                <div>
                  <h4 style={{ fontSize: "11px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>Detailed Recipient Status Tracker</h4>
                  <div style={{ maxHeight: "140px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "5px", paddingRight: "2px" }}>
                    {analyticsData.responses.map((res: any) => {
                      const statusMap = {
                        pending: { text: "Pending", bg: "#f1f5f9", color: "#475569" },
                        delivered: { text: "Delivered", bg: "#eff6ff", color: "#2563eb" },
                        seen: { text: "Seen 👀", bg: "#fffbeb", color: "#d97706" },
                        responded: { text: "Responded ✅", bg: "#ecfdf5", color: "#10b981" },
                        ignored: { text: "Ignored 💤", bg: "#fef2f2", color: "#ef4444" }
                      };
                      const stat = statusMap[res.status as keyof typeof statusMap] || statusMap.pending;

                      return (
                        <div key={res.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "11.5px", color: "#0f172a", fontWeight: "600" }}>{res.recruiterName}</span>
                            <span style={{ fontSize: "9.5px", padding: "1px 5px", borderRadius: "3px", background: stat.bg, color: stat.color, fontWeight: "700", border: `1px solid ${stat.color}20` }}>
                              {stat.text}
                            </span>
                          </div>

                          {res.status === "responded" && (
                            <div style={{ fontSize: "10.5px", color: "#475569", background: "#f8fafc", padding: "4px 6px", borderRadius: "3px", marginTop: "2px", border: "1px solid #e2e8f0" }}>
                              {res.selectedOptions && res.selectedOptions.length > 0 && (
                                <div style={{ marginBottom: res.manualText ? "2px" : "0" }}>
                                  <span style={{ color: "#2563eb", fontWeight: "600" }}>Selection:</span> {Array.isArray(res.selectedOptions) ? res.selectedOptions.join(", ") : res.selectedOptions}
                                </div>
                              )}
                              {res.manualText && (
                                <div>
                                  <span style={{ color: "#d97706", fontWeight: "600" }}>Reply:</span> "{res.manualText}"
                                </div>
                              )}
                            </div>
                          )}

                          {res.reaction && (
                            <div style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                              <span>Reaction:</span> <span style={{ fontSize: "13px" }}>{res.reaction}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ fontSize: "11px", color: "#64748b", textAlign: "center" }}>No telemetry logs.</div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
