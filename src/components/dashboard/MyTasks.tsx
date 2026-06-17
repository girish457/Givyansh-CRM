import React, { useState, useEffect } from "react";
import {
  LucideClipboardList,
  LucideClock,
  LucideCheckCircle2,
  LucideLoader2,
  LucideXCircle,
  LucideActivity,
  LucideSearch,
  LucideFilter,
  LucideAlertCircle,
  LucidePlay,
  LucideCheck,
  LucideRefreshCw,
  LucideTrendingUp,
  LucideMessageSquare,
  LucidePaperclip,
  LucideHistory,
  LucideGitFork,
  LucideEye,
  LucideUser,
  LucideLayoutGrid,
  LucideList,
  LucideChevronRight,
  LucidePlus,
  LucideTrash2,
  LucideX,
  LucideSliders,
  LucideCalendar,
  LucidePercent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EligibleAssignee {
  id: number;
  name: string;
  email: string;
  role: string;
}

const safeParseArray = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "object") return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("safeParseArray failed for value:", val, e);
    return [];
  }
};

const CACHE_KEY = "givyansh_tasks_cache_v1";

export default function MyTasks({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const [tasks, setTasks] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const cached = localStorage.getItem("crm_active_user") || localStorage.getItem("givyansh_active_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem(CACHE_KEY);
    } catch {
      return true;
    }
  });
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  // Filters & State
  const [activeTab, setActiveTab] = useState<string>("active"); // active, completed, expired
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");

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
    } else if (duration === "time_based") {
      if (task.deadlineTime) {
        const [h, m] = task.deadlineTime.split(":");
        deadlineDate.setHours(parseInt(h) || 18, parseInt(m) || 0, 0, 0);
      } else {
        deadlineDate.setHours(18, 0, 0, 0);
      }
    } else {
      deadlineDate.setHours(23, 59, 59, 999);
    }
    return deadlineDate;
  };

  const isTaskExpired = (task: any) => {
    const deadline = getTaskDeadlineDate(task);
    return new Date() > deadline;
  };

  const isCompletedBeforeDeadline = (task: any) => {
    if (task.status !== "completed") return false;
    const deadline = getTaskDeadlineDate(task);
    const completedTime = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt || Date.now());
    return completedTime <= deadline;
  };

  const isExpiredOrEnded = (task: any) => {
    if (task.status === "cancelled") return true;
    const expired = isTaskExpired(task);
    const completed = task.status === "completed";
    return expired && !completed;
  };

  const isActiveTask = (task: any) => {
    return !isTaskExpired(task) && task.status !== "completed" && task.status !== "cancelled";
  };

  // Inspector & Split Drawer / Modals
  const [inspectingTask, setInspectingTask] = useState<any | null>(null);
  const [inspectorTab, setInspectorTab] = useState<"directives" | "distribute" | "collaboration">("directives");
  const [showSplitModal, setShowSplitModal] = useState<any | null>(null);
  const [eligibleAssignees, setEligibleAssignees] = useState<EligibleAssignee[]>([]);
  const [loadingAssignees, setLoadingAssignees] = useState(false);

  // Split Form State (Inline & Modal)
  const [splits, setSplits] = useState<{ assigneeId: string; targetQuantity: string; percentage: string; notes: string; deadline: string }[]>([
    { assigneeId: "", targetQuantity: "", percentage: "", notes: "", deadline: "" }
  ]);
  const [splitPriority, setSplitPriority] = useState("");
  const [splitDuration, setSplitDuration] = useState("");
  const [isSplitting, setIsSplitting] = useState(false);

  // Inspector Form State
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isSubmittingAttachment, setIsSubmittingAttachment] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false,
    msg: "",
    type: "success"
  });

  useEffect(() => {
    fetchProfile();
    fetchTasks();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    if (inspectingTask) {
      fetchEligibleAssignees();
      // Reset splits form inside inspector
      setSplits([{ assigneeId: "", targetQuantity: "", percentage: "", notes: "", deadline: "" }]);
      setSplitPriority(inspectingTask.priority || "medium");
      setSplitDuration(inspectingTask.duration || "today");
    }
  }, [inspectingTask]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      const loadedTasks = Array.isArray(data) ? data : [];
      setTasks(loadedTasks);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(loadedTasks));
      } catch (cacheErr) {
        console.error("Failed to update local cache:", cacheErr);
      }

      if (inspectingTask) {
        const updated = loadedTasks.find(t => t.id === inspectingTask.id);
        if (updated) setInspectingTask(updated);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      showToast("Failed to fetch operational tasks.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleAssignees = async () => {
    setLoadingAssignees(true);
    try {
      const res = await fetch("/api/tasks/eligible-assignees");
      const data = await res.json();
      setEligibleAssignees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch team hierarchy:", err);
    } finally {
      setLoadingAssignees(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    setUpdatingId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();

      if (res.ok) {
        await fetchTasks();
        let statusFriendly = newStatus.replace("_", " ");
        showToast(`Task status successfully updated to ${statusFriendly}! 🚀`, "success");
      } else {
        throw new Error(data.error || "Failed to update status");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Uplink failed during update.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !inspectingTask) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/tasks/${inspectingTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");

      setCommentText("");
      showToast("Comment successfully appended to timeline.", "success");
      await fetchTasks();
    } catch (err: any) {
      showToast(err.message || "Failed to add comment.", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const submitAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentName.trim() || !attachmentUrl.trim() || !inspectingTask) return;
    setIsSubmittingAttachment(true);
    try {
      const res = await fetch(`/api/tasks/${inspectingTask.id}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: attachmentName, url: attachmentUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add attachment");

      setAttachmentName("");
      setAttachmentUrl("");
      showToast("Document/Resource linked successfully.", "success");
      await fetchTasks();
    } catch (err: any) {
      showToast(err.message || "Failed to add attachment.", "error");
    } finally {
      setIsSubmittingAttachment(false);
    }
  };

  const openSplitModal = async (task: any) => {
    setShowSplitModal(task);
    setSplitPriority(task.priority || "medium");
    setSplitDuration(task.duration || "today");
    setSplits([{ assigneeId: "", targetQuantity: "", percentage: "", notes: "", deadline: "" }]);
    setLoadingAssignees(true);
    try {
      const res = await fetch("/api/tasks/eligible-assignees");
      const data = await res.json();
      setEligibleAssignees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch reporting team hierarchy.", "error");
    } finally {
      setLoadingAssignees(false);
    }
  };

  const addSplitRow = () => {
    setSplits(prev => [...prev, { assigneeId: "", targetQuantity: "", percentage: "", notes: "", deadline: "" }]);
  };

  const removeSplitRow = (index: number) => {
    setSplits(prev => prev.filter((_, i) => i !== index));
  };

  const handleSplitChange = (index: number, field: string, value: string) => {
    setSplits(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSplitQtyChange = (index: number, val: string) => {
    const qty = parseInt(val) || 0;
    const totalQty = (inspectingTask || showSplitModal)?.targetQuantity || 1;
    const pct = Math.round((qty / totalQty) * 100);
    setSplits(prev => prev.map((s, i) => i === index ? { ...s, targetQuantity: val, percentage: pct.toString() } : s));
  };

  const handleSplitPctChange = (index: number, val: string) => {
    const pct = parseInt(val) || 0;
    const totalQty = (inspectingTask || showSplitModal)?.targetQuantity || 0;
    const qty = Math.round((pct / 100) * totalQty);
    setSplits(prev => prev.map((s, i) => i === index ? { ...s, percentage: val, targetQuantity: qty.toString() } : s));
  };

  const submitSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskToSplit = inspectingTask || showSplitModal;
    if (!taskToSplit) return;

    // Filter valid splits
    const validSplits = splits.filter(s => s.assigneeId && s.targetQuantity);
    if (validSplits.length === 0) {
      showToast("Please configure at least one subtask split.", "error");
      return;
    }

    setIsSplitting(true);
    try {
      const payload = {
        splits: validSplits.map(s => ({
          assigneeId: parseInt(s.assigneeId),
          targetQuantity: parseInt(s.targetQuantity),
          notes: s.notes,
          deadline: s.deadline || null
        })),
        priority: splitPriority,
        duration: splitDuration
      };

      const res = await fetch(`/api/tasks/${taskToSplit.id}/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Splitting failed");

      showToast(`Target successfully split into ${validSplits.length} team subtasks!`, "success");
      setShowSplitModal(null);
      await fetchTasks();

      // Keep inspecting and switch tab back to directives
      setInspectorTab("directives");
    } catch (err: any) {
      showToast(err.message || "Failed to split task targets.", "error");
    } finally {
      setIsSplitting(false);
    }
  };

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, msg, type });
  };

  // Helper metrics calculations
  const getCount = (status: string) => {
    if (status === "all") return tasks.length;
    if (status === "active") return tasks.filter(t => isActiveTask(t)).length;
    if (status === "completed") return tasks.filter(t => isCompletedBeforeDeadline(t)).length;
    if (status === "expired") return tasks.filter(t => isExpiredOrEnded(t)).length;
    return 0;
  };

  const getHighPriorityCount = () => {
    return tasks.filter(t => ["high", "critical", "urgent"].includes(t.priority?.toLowerCase())).length;
  };

  const getOverallCompletionRate = () => {
    const total = tasks.length;
    if (total === 0) return 0;
    const completed = tasks.filter(t => isCompletedBeforeDeadline(t)).length;
    return Math.round((completed / total) * 100);
  };

  // Filter Logic
  const filteredTasks = tasks.filter(task => {
    const priority = task.priority?.toLowerCase() || "medium";
    const duration = task.duration?.toLowerCase() || "today";

    let matchesTab = true;
    if (activeTab === "active") {
      matchesTab = isActiveTask(task);
    } else if (activeTab === "completed") {
      matchesTab = isCompletedBeforeDeadline(task);
    } else if (activeTab === "expired") {
      matchesTab = isExpiredOrEnded(task);
    }

    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.assigner?.name && task.assigner.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority = priorityFilter === "all" || priority === priorityFilter.toLowerCase();
    const matchesDuration = durationFilter === "all" || duration === durationFilter.toLowerCase();

    return matchesTab && matchesSearch && matchesPriority && matchesDuration;
  });

  const getColumnTasks = (status: string) => {
    return filteredTasks.filter(t => {
      const s = t.status?.toLowerCase() || "pending";
      if (status === "overdue_delayed") {
        return s === "overdue" || s === "delayed";
      }
      return s === status;
    });
  };

  if (loading) return (
    <div className="flex-center" style={{ height: "450px", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <LucideLoader2 className="animate-spin" size={42} color="#0ea5e9" style={{ margin: "0 auto 15px" }} />
        <p style={{ color: "#475569", fontWeight: 700, fontSize: "0.95rem" }}>Synchronizing Operations Grid...</p>
      </div>
    </div>
  );

  const userCanDistribute = currentUser && ["boss", "manager", "tl"].includes(currentUser.role);

  return (
    <div className="my-tasks-container dashboard-home p-large" style={{ padding: "12px 16px", maxWidth: "1600px", margin: "0 auto", paddingLeft: "1rem", paddingTop: "1rem" }}>

      {/* Toast Notification */}
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

      {/* Header Block */}
      {!hideHeader && (
        <div className="dash-header mb-large" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-0.5px", margin: 0 }}>
              <span style={{ color: "#0f172a" }}>My Task </span>
              <span style={{ color: "#2563eb" }}>Manager</span>
            </h1>
            <p style={{ color: "#475569", fontSize: "0.85rem", margin: "2px 0 0", fontWeight: 500 }}>Track, split, and complete directives. Target updates sync automatically from candidates, clients, jobs, and vendors.</p>
          </div>

          {/* View Switcher */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: "3px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <button
              onClick={() => setViewMode("list")}
              style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", borderRadius: "8px", border: "none", fontSize: "0.78rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", background: viewMode === "list" ? "white" : "transparent", color: viewMode === "list" ? "#0369a1" : "#64748b", boxShadow: viewMode === "list" ? "0 2px 6px rgba(0,0,0,0.04)" : "none" }}
            >
              <LucideList size={13} /> Grid List
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", borderRadius: "8px", border: "none", fontSize: "0.78rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", background: viewMode === "kanban" ? "white" : "transparent", color: viewMode === "kanban" ? "#0369a1" : "#64748b", boxShadow: viewMode === "kanban" ? "0 2px 6px rgba(0,0,0,0.04)" : "none" }}
            >
              <LucideLayoutGrid size={13} /> Kanban Columns
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "16px" }}>

        {/* Total Cards */}
        <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.01)" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg, #e0f2fe 0%, #38bdf820 100%)", color: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideClipboardList size={16} /></div>
          <div>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Allocated Directives</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#000000", marginTop: "1px" }}>{getCount("all")}</div>
          </div>
        </div>

        {/* Active Cards */}
        <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.01)" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg, #e0f2fe 0%, #0ea5e920 100%)", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}><LucidePlay size={15} /></div>
          <div>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Active / In Progress</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0284c7", marginTop: "1px" }}>{getCount("active")}</div>
          </div>
        </div>

        {/* Completed Cards */}
        <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.01)" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg, #dcfce7 0%, #4ade8020 100%)", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideCheckCircle2 size={16} /></div>
          <div>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Completed Missions</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#16a34a", marginTop: "1px" }}>{getCount("completed")}</div>
          </div>
        </div>

        {/* High priority */}
        <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.01)" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg, #fdf2f8 0%, #f472b620 100%)", color: "#db2777", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideAlertCircle size={16} /></div>
          <div>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Critical & Urgent</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#db2777", marginTop: "1px" }}>{getHighPriorityCount()}</div>
          </div>
        </div>

        {/* Dynamic completion rate */}
        <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.01)" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg, #f5f3ff 0%, #a78bfa20 100%)", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideTrendingUp size={16} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Completion Rate</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#7c3aed" }}>{getOverallCompletionRate()}%</div>
              <div style={{ flex: 1, height: "4px", background: "#f3e8ff", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${getOverallCompletionRate()}%`, height: "100%", background: "#7c3aed", borderRadius: "2px" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "16px", border: "1.5px solid #e0f2fe", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>

        {/* Search */}
        <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", padding: "6px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <LucideSearch size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search operational title, directives or assigner node..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", background: "none", outline: "none", width: "100%", fontSize: "0.8rem", fontWeight: 600, color: "#000000" }}
          />
        </div>

        {/* Priority Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}><LucideFilter size={11} style={{ display: "inline", marginRight: "2px" }} /> PRIORITY:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "0.75rem", fontWeight: 800, color: "#000000", cursor: "pointer", outline: "none" }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Duration Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}><LucideClock size={11} style={{ display: "inline", marginRight: "2px" }} /> TIME FRAME:</span>
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "0.75rem", fontWeight: 800, color: "#000000", cursor: "pointer", outline: "none" }}
          >
            <option value="all">All Schedules</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Date Range</option>
            <option value="time_based">Deadline Time Based</option>
          </select>
        </div>
      </div>

      {viewMode === "list" ? (
        <>
          {/* Tabs Navigation */}
          <div style={{ display: "flex", gap: "6px", borderBottom: "2px solid #f1f5f9", paddingBottom: "1px", marginBottom: "16px", overflowX: "auto" }}>
            {[
              { id: "active", label: "Active Tasks", count: getCount("active"), color: "#0284c7" },
              { id: "completed", label: "Completed Tasks", count: getCount("completed"), color: "#16a34a" },
              { id: "expired", label: "Expired / Ended Tasks", count: getCount("expired"), color: "#ef4444" },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "8px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: isActive ? tab.color : "#64748b",
                    position: "relative",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap"
                  }}
                >
                  {tab.label}
                  <span style={{
                    fontSize: "0.65rem",
                    fontWeight: 900,
                    padding: "1px 6px",
                    borderRadius: "14px",
                    background: isActive ? `${tab.color}15` : "#f1f5f9",
                    color: isActive ? tab.color : "#64748b"
                  }}>
                    {tab.count}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      style={{ position: "absolute", bottom: "-2px", left: 0, right: 0, height: "2.5px", background: tab.color, borderRadius: "2px" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* List Display */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <AnimatePresence mode="popLayout">
              {filteredTasks.map(task => {
                const isUpdating = updatingId === task.id;
                const priority = task.priority?.toLowerCase() || "medium";
                const status = task.status?.toLowerCase() || "pending";

                const getPriorityStyles = () => {
                  if (priority === 'urgent') return { border: '#ef4444', bg: '#fef2f2', text: '#ef4444' };
                  if (priority === 'critical') return { border: '#7c3aed', bg: '#faf5ff', text: '#7c3aed' };
                  if (priority === 'high') return { border: '#f59e0b', bg: '#fffbeb', text: '#d97706' };
                  if (priority === 'low') return { border: '#10b981', bg: '#f0fdf4', text: '#16a34a' };
                  return { border: '#0284c7', bg: '#f0f9ff', text: '#0369a1' }; // medium
                };
                const pStyle = getPriorityStyles();

                const getCardStatusStyles = () => {
                  if (isCompletedBeforeDeadline(task)) {
                    return { border: '#16a34a', bg: '#f0fdf4', text: '#16a34a', label: 'Completed' };
                  } else if (isExpiredOrEnded(task)) {
                    return { border: '#ef4444', bg: '#fff1f2', text: '#ef4444', label: 'Expired / Ended' };
                  } else {
                    return { border: '#0ea5e9', bg: '#f0f9ff', text: '#0284c7', label: 'Active' };
                  }
                };
                const cardStyle = getCardStatusStyles();

                const isTarget = task.taskType === "target";
                const completionPct = isTarget && task.targetQuantity ? Math.min(100, Math.round((task.completedQuantity / task.targetQuantity) * 100)) : 0;

                return (
                  <motion.div
                    layout
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: "#ffffff",
                      padding: "16px 20px",
                      borderRadius: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid #e2e8f0",
                      borderLeft: `4px solid ${cardStyle.border}`,
                      boxShadow: "0 4px 12px rgba(148, 163, 184, 0.05)",
                      position: "relative",
                      flexWrap: "wrap",
                      gap: "16px",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(148, 163, 184, 0.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(148, 163, 184, 0.05)";
                    }}
                  >
                    {isUpdating && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                        <LucideLoader2 className="animate-spin" size={24} color="#0ea5e9" />
                      </div>
                    )}

                    {/* Content Block */}
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flex: 1, minWidth: "300px" }}>
                      <div
                        onClick={() => { setInspectingTask(task); setInspectorTab("directives"); }}
                        style={{
                          background: cardStyle.bg,
                          padding: "10px",
                          borderRadius: "10px",
                          border: `1px solid ${cardStyle.border}20`,
                          color: cardStyle.border,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s"
                        }}
                      >
                        <LucideClipboardList size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                          <h3
                            onClick={() => { setInspectingTask(task); setInspectorTab("directives"); }}
                            style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.2px", cursor: "pointer" }}
                          >
                            {task.title}
                          </h3>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            background: pStyle.bg,
                            color: pStyle.text,
                            textTransform: "uppercase",
                            border: `1px solid ${pStyle.border}15`,
                            letterSpacing: "0.2px"
                          }}>{priority}</span>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            background: cardStyle.bg,
                            color: cardStyle.text,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            border: `1px solid ${cardStyle.border}15`,
                            letterSpacing: "0.2px"
                          }}>
                            {isCompletedBeforeDeadline(task) ? <LucideCheckCircle2 size={10} /> : (isExpiredOrEnded(task) ? <LucideXCircle size={10} /> : <LucidePlay size={10} />)}
                            {cardStyle.label}
                          </span>
                        </div>

                        <p style={{ margin: "4px 0 10px", color: "#475569", fontSize: "0.82rem", lineHeight: "1.4", fontWeight: 500 }}>{task.description || "No mission description provided."}</p>

                        {/* Target Meter section */}
                        {isTarget && (
                          <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "10px", maxWidth: "600px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", fontSize: "0.72rem", fontWeight: "800" }}>
                              <span style={{ color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.3px" }}>Auto Track: {task.targetType?.toUpperCase()}</span>
                              <span style={{ color: "#334155" }}>{task.completedQuantity} / {task.targetQuantity} ({completionPct}%)</span>
                            </div>
                            <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden", display: "flex" }}>
                              <div style={{ width: `${completionPct}%`, height: "100%", background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", borderRadius: "3px", transition: "width 0.4s ease" }}></div>
                            </div>

                            {/* Hierarchy Subtask Contribution Badges */}
                            {task.subTasks && task.subTasks.length > 0 && (
                              <div style={{ marginTop: "8px", borderTop: "1px solid #e2e8f0", paddingTop: "6px" }}>
                                <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Team Contributions:</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                  {task.subTasks.map((sub: any) => (
                                    <div key={sub.id} style={{ background: "#ffffff", padding: "2px 6px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.65rem", fontWeight: "700", color: "#1e293b", display: "flex", gap: "4px" }}>
                                      <span style={{ fontWeight: 800, color: "#0284c7" }}>{sub.assignee?.name || "Agent"}</span>
                                      <span>{sub.completedQuantity}/{sub.targetQuantity}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", alignItems: "center" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748b" }}>
                            <LucideClock size={12} />
                            {task.duration === "custom" && task.customStartDate
                              ? `${task.customStartDate} → ${task.customEndDate}`
                              : (task.duration === "time_based" ? `Time limit: ${task.deadlineTime || "18:00"} Today` : task.duration?.toUpperCase().replace('_', ' ') || "TODAY")
                            }
                          </span>
                          <span>•</span>
                          <span>By: <span style={{ color: "#0284c7", fontWeight: 800 }}>{task.assigner?.name || "Command"}</span></span>

                          {/* Split Trigger button for Boss / Manager / TL */}
                          {isTarget && userCanDistribute && (
                            <>
                              <span>•</span>
                              <button
                                onClick={() => { setInspectingTask(task); setInspectorTab("distribute"); }}
                                style={{ background: "none", border: "none", padding: 0, color: "#7c3aed", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", fontSize: "0.72rem" }}
                              >
                                <LucideGitFork size={11} /> Distribute Task
                              </button>
                            </>
                          )}

                          {task.completedAt && (
                            <>
                              <span>•</span>
                              <span style={{ color: "#16a34a" }}>Completed: {new Date(task.completedAt).toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "flex-end", minWidth: "80px" }}>
                      <button
                        onClick={() => { setInspectingTask(task); setInspectorTab("directives"); }}
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          border: "1px solid #e2e8f0",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#e2e8f0";
                          e.currentTarget.style.color = "#0f172a";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "#f1f5f9";
                          e.currentTarget.style.color = "#334155";
                        }}
                      >
                        <LucideEye size={13} /> View
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredTasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center", padding: "80px 40px", background: "#ffffff", borderRadius: "32px", border: "2px dashed #e2e8f0" }}
              >
                <div style={{ width: "70px", height: "70px", background: "#f0f9ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid #e0f2fe" }}>
                  <LucideCheckCircle2 size={36} color="#0284c7" style={{ opacity: 0.7 }} />
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#000000", margin: "0 0 6px" }}>No Tasks Found</h3>
                <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "450px", margin: "0 auto", lineHeight: 1.5, fontWeight: 500 }}>
                  There are no operational directives matching your selected filters. You're completely clear!
                </p>
              </motion.div>
            )}
          </div>
        </>
      ) : (
        /* KANBAN BOARD VIEW - Accept Flow Removed (Pending -> treated as In Progress) */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", overflowX: "auto", paddingBottom: "30px", alignItems: "start" }}>

          {[
            { id: "active", title: "Active Tasks", bg: "#e0f2fe30", border: "#7dd3fc", color: "#0284c7" },
            { id: "completed", title: "Completed Tasks", bg: "#dcfce730", border: "#86efac", color: "#16a34a" },
            { id: "expired", title: "Expired / Ended Tasks", bg: "#fff1f230", border: "#fecdd3", color: "#ef4444" }
          ].map(col => {
            const colTasks = filteredTasks.filter(t => {
              if (col.id === "active") return isActiveTask(t);
              if (col.id === "completed") return isCompletedBeforeDeadline(t);
              if (col.id === "expired") return isExpiredOrEnded(t);
              return false;
            });

            return (
              <div
                key={col.id}
                style={{
                  background: "#fafafa",
                  borderRadius: "20px",
                  border: `1.5px solid ${col.border}40`,
                  padding: "16px",
                  minHeight: "500px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.01)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${col.border}50`, paddingBottom: "10px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color }}></div>
                    <span style={{ fontSize: "0.9rem", fontWeight: "900", color: "#1e293b", textTransform: "uppercase" }}>{col.title}</span>
                  </div>
                  <span style={{ background: "#ffffff", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800", color: col.color, border: `1.5px solid ${col.border}40` }}>
                    {colTasks.length}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                  {colTasks.map(task => {
                    const priority = task.priority?.toLowerCase() || "medium";
                    const isTarget = task.taskType === "target";
                    const completionPct = isTarget && task.targetQuantity ? Math.min(100, Math.round((task.completedQuantity / task.targetQuantity) * 100)) : 0;

                    const getPriorityColors = () => {
                      if (priority === 'urgent') return { text: '#ef4444', bg: '#fef2f2' };
                      if (priority === 'critical') return { text: '#7c3aed', bg: '#faf5ff' };
                      if (priority === 'high') return { text: '#d97706', bg: '#fffbeb' };
                      return { text: '#0284c7', bg: '#f0f9ff' };
                    };
                    const pColors = getPriorityColors();

                    return (
                      <div
                        key={task.id}
                        onClick={() => { setInspectingTask(task); setInspectorTab("directives"); }}
                        style={{ background: "#ffffff", padding: "14px", borderRadius: "16px", border: "1.5px solid #e2e8f0", cursor: "pointer", display: "flex", flexDirection: "column", gap: "8px", transition: "all 0.2s", boxShadow: "0 2px 5px rgba(0,0,0,0.01)" }}
                        className="kanban-task-card"
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 900, color: "#1e293b", lineHeight: 1.3 }}>{task.title}</h4>
                        </div>

                        {task.description && (
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
                            {task.description}
                          </p>
                        )}

                        {isTarget && (
                          <div style={{ margin: "4px 0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: "800", color: "#0369a1", marginBottom: "3px" }}>
                              <span>{task.targetType?.toUpperCase()}</span>
                              <span>{completionPct}%</span>
                            </div>
                            <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${completionPct}%`, height: "100%", background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)" }}></div>
                            </div>
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "8px", fontSize: "0.7rem" }}>
                          <span style={{ background: pColors.bg, color: pColors.text, padding: "2px 6px", borderRadius: "6px", fontWeight: "800", textTransform: "uppercase" }}>{priority}</span>
                          <span style={{ color: "#94a3b8", fontWeight: 700 }}>By: {task.assigner?.name?.split(" ")[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED TASK INSPECTOR DRAWER WITH INTEGRATED TASK BREAKDOWN */}
      <AnimatePresence>
        {inspectingTask && (() => {
          const comments = safeParseArray(inspectingTask.comments);
          const attachments = safeParseArray(inspectingTask.attachments);
          const historyList = safeParseArray(inspectingTask.history);
          const completionPct = inspectingTask.targetQuantity ? Math.min(100, Math.round((inspectingTask.completedQuantity / inspectingTask.targetQuantity) * 100)) : 0;

          // Target split calculations
          const totalDistributed = inspectingTask.subTasks ? inspectingTask.subTasks.reduce((sum: number, s: any) => sum + (s.targetQuantity || 0), 0) : 0;
          const remainingTarget = Math.max(0, inspectingTask.targetQuantity - totalDistributed);
          const distributedPct = inspectingTask.targetQuantity ? Math.round((totalDistributed / inspectingTask.targetQuantity) * 100) : 0;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingTask(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.3)",
                backdropFilter: "blur(4px)",
                zIndex: 9999,
                display: "flex",
                justifyContent: "flex-end"
              }}
            >
              {/* Drawer Container */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "white",
                  width: "100%",
                  maxWidth: "580px",
                  height: "100vh",
                  boxShadow: "-10px 0 40px -15px rgba(0,0,0,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  borderLeft: "1px solid #e0f2fe",
                  overflowY: "auto"
                }}
              >
                {/* Drawer Header */}
                <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.9 }}>
                      <LucideClipboardList size={14} /> Operational Directive Profile
                    </div>
                    <h3 style={{ margin: "6px 0 0", fontSize: "1.1rem", fontWeight: "900", letterSpacing: "-0.5px" }}>{inspectingTask.title}</h3>
                  </div>
                  <button onClick={() => setInspectingTask(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", color: "white", width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <LucideX size={18} />
                  </button>
                </div>

                {/* Drawer Tab Switcher */}
                <div style={{ display: "flex", borderBottom: "1.5px solid #f1f5f9", padding: "0 10px", background: "#f8fafc" }}>
                  {[
                    { id: "directives", label: "Directives & Analytics" },
                    ...(userCanDistribute && inspectingTask.taskType === "target" ? [{ id: "distribute", label: "Distribute Task" }] : []),
                    { id: "collaboration", label: "Collaboration & History" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setInspectorTab(tab.id as any)}
                      style={{
                        padding: "14px 20px",
                        background: "transparent",
                        border: "none",
                        borderBottom: inspectorTab === tab.id ? "3px solid #0284c7" : "3px solid transparent",
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: inspectorTab === tab.id ? "#0284c7" : "#64748b",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Drawer Contents */}
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>

                  {inspectorTab === "directives" && (
                    <>
                      {(() => {
                        // --- Recursive Helpers and Calculations local to this view ---
                        const getAllDescendants = (task: any): any[] => {
                          const list: any[] = [];
                          if (task.subTasks && Array.isArray(task.subTasks)) {
                            task.subTasks.forEach((sub: any) => {
                              list.push(sub);
                              list.push(...getAllDescendants(sub));
                            });
                          }
                          return list;
                        };

                        const descendants = getAllDescendants(inspectingTask);

                        // Remaining & Deadline Calculation
                        const now = new Date();
                        let deadlineDate = new Date(inspectingTask.createdAt || now);
                        if (inspectingTask.duration === "today") {
                          deadlineDate.setHours(23, 59, 59, 999);
                        } else if (inspectingTask.duration === "this_week") {
                          const first = now.getDate() - now.getDay() + 1;
                          deadlineDate = new Date(now.setDate(first + 6));
                          deadlineDate.setHours(23, 59, 59, 999);
                        } else if (inspectingTask.duration === "this_month") {
                          deadlineDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                        } else if (inspectingTask.duration === "this_year") {
                          deadlineDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                        } else if (inspectingTask.duration === "custom" && inspectingTask.customEndDate) {
                          deadlineDate = new Date(inspectingTask.customEndDate);
                          deadlineDate.setHours(23, 59, 59, 999);
                        } else if (inspectingTask.duration === "time_based" && inspectingTask.deadlineTime) {
                          const [h, m] = inspectingTask.deadlineTime.split(":");
                          deadlineDate.setHours(parseInt(h) || 18, parseInt(m) || 0, 0, 0);
                        } else {
                          deadlineDate.setHours(18, 0, 0, 0);
                        }

                        const diffMs = deadlineDate.getTime() - now.getTime();
                        const isOverdue = diffMs < 0;
                        const absDiff = Math.abs(diffMs);
                        const diffDays = Math.floor(absDiff / (1000 * 60 * 60 * 24));
                        const diffHours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                        let countdownText = "";
                        let countdownColor = "#16a34a"; // green
                        let isNearDeadline = false;

                        if (isOverdue) {
                          countdownText = `OVERDUE BY ${diffDays}d ${diffHours}h`;
                          countdownColor = "#ef4444"; // red
                        } else {
                          if (diffDays === 0) {
                            countdownText = `${diffHours}h remaining`;
                            isNearDeadline = diffHours <= 3;
                            countdownColor = isNearDeadline ? "#ef4444" : "#f59e0b"; // red / yellow
                          } else {
                            countdownText = `${diffDays}d ${diffHours}h remaining`;
                            countdownColor = diffDays <= 1 ? "#f59e0b" : "#16a34a";
                          }
                        }

                        // Determine final logical status
                        let calculatedStatus = inspectingTask.status || "pending";
                        if (calculatedStatus !== "completed" && calculatedStatus !== "cancelled") {
                          if (isOverdue) {
                            calculatedStatus = "overdue";
                          } else if (isNearDeadline) {
                            calculatedStatus = "near_deadline";
                          }
                        }

                        const getStatusLabelAndBg = (statusStr: string) => {
                          const s = statusStr.toLowerCase();
                          if (s === "completed") return { text: "Completed", bg: "#dcfce7", color: "#16a34a" };
                          if (s === "near_deadline") return { text: "Near Deadline", bg: "#fef2f2", color: "#ef4444" };
                          if (s === "overdue") return { text: "Overdue", bg: "#fee2e2", color: "#dc2626" };
                          if (s === "delayed") return { text: "Delayed", bg: "#fffbeb", color: "#d97706" };
                          if (s === "blocked") return { text: "Blocked / Issue", bg: "#fdf2f8", color: "#db2777" };
                          if (s === "under_review") return { text: "Under Review", bg: "#f5f3ff", color: "#7c3aed" };
                          return { text: "In Progress", bg: "#e0f2fe", color: "#0284c7" };
                        };
                        const statusIndicator = getStatusLabelAndBg(calculatedStatus);

                        // Gather list of targets for multi-target tracking section
                        // If it's a master task, targets are the direct children ('subTasks' where taskType === 'target')
                        // If it's a target task itself, it's just the single target task
                        const targetMetrics = [];
                        if (inspectingTask.taskType === "master") {
                          if (inspectingTask.subTasks && Array.isArray(inspectingTask.subTasks)) {
                            targetMetrics.push(...inspectingTask.subTasks.filter((t: any) => t.taskType === "target"));
                          }
                        } else if (inspectingTask.taskType === "target") {
                          targetMetrics.push(inspectingTask);
                        }

                        // Aggregate Team Contribution Breakdown (Hierarchical Roll-up)
                        const teamContributionsMap: Record<string, { name: string; role: string; assigned: number; completed: number; status: string; count: number; delayedCount: number }> = {};

                        descendants.forEach((sub: any) => {
                          if (sub.assignee) {
                            const uName = sub.assignee.name;
                            if (!teamContributionsMap[uName]) {
                              teamContributionsMap[uName] = {
                                name: uName,
                                role: sub.assignee.role,
                                assigned: 0,
                                completed: 0,
                                status: sub.status,
                                count: 0,
                                delayedCount: 0
                              };
                            }
                            teamContributionsMap[uName].assigned += sub.targetQuantity || 0;
                            teamContributionsMap[uName].completed += sub.completedQuantity || 0;
                            teamContributionsMap[uName].count += 1;
                            if (sub.status === "delayed" || sub.status === "overdue") {
                              teamContributionsMap[uName].delayedCount += 1;
                              teamContributionsMap[uName].status = sub.status;
                            }
                          }
                        });
                        const teamContributionsList = Object.values(teamContributionsMap);

                        // Aggregate counts
                        const totalAssignedSubtasks = teamContributionsList.reduce((sum, member) => sum + member.assigned, 0);
                        const totalCompletedSubtasks = teamContributionsList.reduce((sum, member) => sum + member.completed, 0);
                        const teamPerformanceRatio = totalAssignedSubtasks > 0
                          ? Math.round((totalCompletedSubtasks / totalAssignedSubtasks) * 100)
                          : 100;
                        const pendingSubtargetsCount = teamContributionsList.reduce((sum, member) => sum + (member.assigned - member.completed), 0);
                        const delayedSubtargetsCount = teamContributionsList.reduce((sum, member) => sum + member.delayedCount, 0);

                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                            {/* --- MASTER KPI DASHBOARD CARD (Glassmorphism & premium details) --- */}
                            <div style={{
                              background: "rgba(255, 255, 255, 0.9)",
                              border: "1.5px solid #e0f2fe",
                              borderRadius: "24px",
                              padding: "20px 24px",
                              boxShadow: "0 10px 30px -10px rgba(14, 165, 233, 0.12), 0 1px 2px rgba(14, 165, 233, 0.05)",
                              display: "flex",
                              gap: "24px",
                              alignItems: "center",
                              position: "relative",
                              overflow: "hidden"
                            }}>
                              {/* Left side: Circular Progress */}
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                <svg width="90" height="90" viewBox="0 0 100 100">
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="#f1f5f9"
                                    strokeWidth="8"
                                  />
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="url(#inspectorProgressGrad)"
                                    strokeWidth="8"
                                    strokeDasharray={251.2}
                                    strokeDashoffset={251.2 - (completionPct / 100) * 251.2}
                                    strokeLinecap="round"
                                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                                  />
                                  <defs>
                                    <linearGradient id="inspectorProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor="#0ea5e9" />
                                      <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                  </defs>
                                  <text
                                    x="50"
                                    y="56"
                                    textAnchor="middle"
                                    fontSize="18"
                                    fontWeight="900"
                                    fill="#1e293b"
                                  >
                                    {completionPct}%
                                  </text>
                                </svg>
                                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Overall Completion</span>
                              </div>

                              {/* Right side: Summary Details */}
                              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                                  <span style={{
                                    background: statusIndicator.bg,
                                    color: statusIndicator.color,
                                    padding: "4px 10px",
                                    borderRadius: "8px",
                                    fontSize: "0.72rem",
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    border: `1px solid ${statusIndicator.color}15`
                                  }}>
                                    {statusIndicator.text}
                                  </span>
                                  <span style={{
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    padding: "4px 8px",
                                    borderRadius: "8px",
                                    fontSize: "0.72rem",
                                    fontWeight: 800,
                                    textTransform: "capitalize"
                                  }}>
                                    {inspectingTask.priority} Priority
                                  </span>
                                </div>

                                <div style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 500, lineHeight: 1.4 }}>
                                  Assigned by <strong style={{ color: "#0369a1" }}>{inspectingTask.assigner?.name}</strong> • Origin: <span style={{ textTransform: "uppercase", fontSize: "0.72rem", fontWeight: 800, color: "#0ea5e9" }}>{inspectingTask.assigner?.role} node</span>
                                </div>

                                {/* Countdown tracker */}
                                <div style={{
                                  background: isOverdue ? "#fff1f2" : "#f0fdf4",
                                  border: `1px solid ${isOverdue ? "#fee2e2" : "#dcfce7"}`,
                                  padding: "8px 12px",
                                  borderRadius: "12px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}>
                                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isOverdue ? "#e11d48" : "#16a34a", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <LucideClock size={14} /> {countdownText.toUpperCase()}
                                  </span>
                                  <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>
                                    Deadline: {inspectingTask.duration === "custom" && inspectingTask.customEndDate
                                      ? inspectingTask.customEndDate
                                      : (inspectingTask.duration === "time_based" ? `Today at ${inspectingTask.deadlineTime || "18:00"}` : inspectingTask.duration?.toUpperCase().replace('_', ' '))
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* --- Directive Profile Metadata Grid --- */}
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                              gap: "12px",
                              background: "#f8fafc",
                              padding: "16px",
                              borderRadius: "20px",
                              border: "1px solid #e2e8f0"
                            }}>
                              <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>CURRENT STATUS</div>
                                <div style={{ fontSize: "0.85rem", fontWeight: 950, color: statusIndicator.color, textTransform: "uppercase", marginTop: "4px" }}>{statusIndicator.text}</div>
                              </div>
                              <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>COMPLETION %</div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 950, color: "#7c3aed", marginTop: "4px" }}>{completionPct}%</div>
                              </div>
                              <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>DEADLINE</div>
                                <div style={{ fontSize: "0.8rem", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>
                                  {inspectingTask.duration === "custom" && inspectingTask.customEndDate
                                    ? inspectingTask.customEndDate
                                    : (inspectingTask.duration === "time_based" ? `Today at ${inspectingTask.deadlineTime || "18:00"}` : inspectingTask.duration?.toUpperCase().replace('_', ' '))
                                  }
                                </div>
                              </div>
                              <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>REMAINING TIME</div>
                                <div style={{ fontSize: "0.8rem", fontWeight: 900, color: countdownColor, marginTop: "4px" }}>{countdownText}</div>
                              </div>
                              <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>COMPLETED TARGETS</div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 950, color: "#16a34a", marginTop: "4px" }}>
                                  {inspectingTask.taskType === "master" ? totalCompletedSubtasks : (inspectingTask.completedQuantity || 0)}
                                </div>
                              </div>
                              <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>PENDING TARGETS</div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 950, color: "#ef4444", marginTop: "4px" }}>
                                  {inspectingTask.taskType === "master"
                                    ? Math.max(0, totalAssignedSubtasks - totalCompletedSubtasks)
                                    : Math.max(0, (inspectingTask.targetQuantity || 0) - (inspectingTask.completedQuantity || 0))
                                  }
                                </div>
                              </div>
                              <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>EXPIRED STATE</div>
                                <div style={{ fontSize: "0.85rem", fontWeight: 950, color: isOverdue ? "#ef4444" : "#16a34a", marginTop: "4px" }}>
                                  {isOverdue ? "EXPIRED" : "ACTIVE"}
                                </div>
                              </div>
                            </div>

                            {/* --- MULTI-TARGET TRACKING SECTION (Grid of target items) --- */}
                            {targetMetrics.length > 0 && (
                              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "20px", borderRadius: "24px" }}>
                                <h4 style={{ margin: "0 0 14px", fontSize: "0.85rem", fontWeight: "900", color: "#1e293b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <LucideTrendingUp size={16} color="#0ea5e9" /> Multi-Target Tracking Metrics
                                </h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                  {targetMetrics.map((task: any) => {
                                    const taskCompPct = task.targetQuantity ? Math.min(100, Math.round((task.completedQuantity / task.targetQuantity) * 100)) : 0;
                                    const remaining = Math.max(0, task.targetQuantity - task.completedQuantity);

                                    return (
                                      <div key={task.id} style={{
                                        background: "white",
                                        padding: "16px",
                                        borderRadius: "18px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.01)"
                                      }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: taskCompPct >= 100 ? "#16a34a" : "#0ea5e9" }}></div>
                                            <span style={{ fontSize: "0.9rem", fontWeight: "900", color: "#0f172a", textTransform: "uppercase" }}>
                                              {task.targetType || "Metric Target"}
                                            </span>
                                            {task.assignee && (
                                              <span style={{ fontSize: "0.7rem", fontWeight: "800", background: "#f0f9ff", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", marginLeft: "8px", border: "1px solid #bae6fd" }}>
                                                {task.assignee.name.toUpperCase()}
                                              </span>
                                            )}
                                          </div>
                                          <span style={{ fontSize: "0.82rem", fontWeight: "900", color: taskCompPct >= 100 ? "#16a34a" : "#0284c7" }}>
                                            {taskCompPct}% Achieved
                                          </span>
                                        </div>

                                        {/* Quantities Row */}
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px", textAlign: "center" }}>
                                          <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                                            <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b" }}>ASSIGNED</div>
                                            <div style={{ fontSize: "0.95rem", fontWeight: 900, color: "#1e293b" }}>{task.targetQuantity}</div>
                                          </div>
                                          <div style={{ background: "#f0fdf4", padding: "6px", borderRadius: "8px", border: "1px solid #dcfce7" }}>
                                            <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#16a34a" }}>COMPLETED</div>
                                            <div style={{ fontSize: "0.95rem", fontWeight: 900, color: "#16a34a" }}>{task.completedQuantity}</div>
                                          </div>
                                          <div style={{ background: remaining > 0 ? "#fef2f2" : "#f0fdf4", padding: "6px", borderRadius: "8px", border: `1px solid ${remaining > 0 ? "#fee2e2" : "#dcfce7"}` }}>
                                            <div style={{ fontSize: "0.58rem", fontWeight: 800, color: remaining > 0 ? "#ef4444" : "#16a34a" }}>REMAINING</div>
                                            <div style={{ fontSize: "0.95rem", fontWeight: 900, color: remaining > 0 ? "#ef4444" : "#16a34a" }}>{remaining}</div>
                                          </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                                          <div style={{
                                            width: `${taskCompPct}%`,
                                            height: "100%",
                                            background: "linear-gradient(90deg, #0ea5e9 0%, #10b981 100%)",
                                            borderRadius: "4px",
                                            transition: "width 0.4s ease"
                                          }}></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* --- BOSS TASK TRACKING GRID & TEAM OVERVIEW (Visible to Boss role) --- */}
                            {currentUser && currentUser.role === "boss" && (
                              <div style={{ background: "#f5f3ff", border: "1.5px solid #e9d5ff", padding: "20px", borderRadius: "24px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                  <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "#6d28d9", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <LucideUser size={16} color="#7c3aed" /> Boss High-Level Team Analytics
                                  </h4>
                                  <span style={{ background: "white", padding: "4px 10px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "900", color: "#7c3aed", border: "1px solid #e9d5ff" }}>
                                    Performance Ratio: {teamPerformanceRatio}%
                                  </span>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px", textAlign: "center" }}>
                                  <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #e9d5ff" }}>
                                    <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b" }}>TOTAL DEPLOYED</div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: 950, color: "#6d28d9" }}>{totalAssignedSubtasks} <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Qty</span></div>
                                  </div>
                                  <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #e9d5ff" }}>
                                    <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b" }}>PENDING TARGETS</div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: 950, color: pendingSubtargetsCount > 0 ? "#d97706" : "#16a34a" }}>{pendingSubtargetsCount}</div>
                                  </div>
                                  <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #e9d5ff" }}>
                                    <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b" }}>DELAYED METRICS</div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: 950, color: delayedSubtargetsCount > 0 ? "#ef4444" : "#16a34a" }}>{delayedSubtargetsCount}</div>
                                  </div>
                                </div>

                                {/* Team Members list aggregated */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  <div style={{ fontSize: "0.72rem", fontWeight: 900, color: "#6d28d9", textTransform: "uppercase" }}>Team Contribution Aggregate Breakdown</div>
                                  {teamContributionsList.map((member) => {
                                    const sharePct = totalAssignedSubtasks ? Math.round((member.assigned / totalAssignedSubtasks) * 100) : 0;
                                    const compPct = member.assigned ? Math.round((member.completed / member.assigned) * 100) : 0;
                                    return (
                                      <div key={member.name} style={{ background: "white", padding: "12px", borderRadius: "14px", border: "1.5px solid #f3e8ff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                          <div style={{ fontWeight: 850, fontSize: "0.82rem", color: "#1e293b" }}>{member.name}</div>
                                          <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{member.role} node ({member.count} tasks)</div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                          <div style={{ fontSize: "0.8rem", fontWeight: 900, color: "#1e293b" }}>
                                            {member.completed} / {member.assigned} <span style={{ color: "#94a3b8", fontSize: "0.65rem" }}>({compPct}%)</span>
                                          </div>
                                          <div style={{ fontSize: "0.65rem", color: member.delayedCount > 0 ? "#ef4444" : "#16a34a", fontWeight: 800, textTransform: "uppercase", marginTop: "2px" }}>
                                            {member.delayedCount > 0 ? `${member.delayedCount} Delayed Targets` : "All Targets Safe"}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {teamContributionsList.length === 0 && (
                                    <div style={{ background: "white", padding: "16px", borderRadius: "14px", border: "1px dashed #d8b4fe", textAlign: "center", color: "#64748b", fontSize: "0.78rem", fontWeight: 700 }}>
                                      No team subtask distribution has been initialized.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* --- MANAGER & TL DISTRIBUTION TRACKING PANEL (Visible to Manager / TL) --- */}
                            {currentUser && (currentUser.role === "manager" || currentUser.role === "tl") && (
                              <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", padding: "20px", borderRadius: "24px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                  <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "#15803d", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <LucideGitFork size={16} color="#16a34a" /> Deployed Subtask Hierarchy Progress
                                  </h4>
                                  <span style={{ background: "white", padding: "4px 10px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "900", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                                    {teamContributionsList.length} Team Nodes Active
                                  </span>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                  {teamContributionsList.map((member) => {
                                    const sharePct = inspectingTask.targetQuantity ? Math.round((member.assigned / inspectingTask.targetQuantity) * 100) : 0;
                                    const compPct = member.assigned ? Math.round((member.completed / member.assigned) * 100) : 0;
                                    return (
                                      <div key={member.name} style={{ background: "white", padding: "12px", borderRadius: "16px", border: "1.5px solid #dcfce7" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                                          <div>
                                            <span style={{ fontWeight: 900, fontSize: "0.85rem", color: "#1e293b" }}>{member.name}</span>
                                            <span style={{ fontSize: "0.62rem", fontWeight: 800, background: "#f0fdf4", padding: "2px 6px", borderRadius: "4px", color: "#16a34a", marginLeft: "6px", textTransform: "uppercase" }}>{member.role}</span>
                                          </div>
                                          <span style={{ fontSize: "0.72rem", fontWeight: 900, color: member.delayedCount > 0 ? "#ef4444" : "#16a34a" }}>
                                            {member.delayedCount > 0 ? `${member.delayedCount} DELAYED` : "STABLE"}
                                          </span>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "10px", alignItems: "center" }}>
                                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
                                            Share: <strong>{member.assigned} Qty</strong> <span style={{ color: "#94a3b8" }}>({sharePct}%)</span>
                                          </div>
                                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                                              <div style={{ width: `${compPct}%`, height: "100%", background: member.delayedCount > 0 ? "#ef4444" : "#16a34a" }} />
                                            </div>
                                            <span style={{ fontSize: "0.75rem", fontWeight: 850, color: "#1e293b" }}>{member.completed}/{member.assigned} ({compPct}%)</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {teamContributionsList.length === 0 && (
                                    <div style={{ background: "white", padding: "16px", borderRadius: "14px", border: "1px dashed #bbf7d0", textAlign: "center", color: "#64748b", fontSize: "0.78rem", fontWeight: 700 }}>
                                      No subtasks splits have been allocated to your reporting nodes yet.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* --- RECRUITER TARGET PROGRESS AND PERFORMANCE CARD (Recruiter role) --- */}
                            {currentUser && currentUser.role === "recruiter" && (
                              <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", padding: "20px", borderRadius: "24px" }}>
                                <h4 style={{ margin: "0 0 12px", fontSize: "0.85rem", fontWeight: "900", color: "#0369a1", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <LucideActivity size={16} color="#0ea5e9" /> Recruiter Personalized Performance Card
                                </h4>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px", textAlign: "center" }}>
                                  <div style={{ background: "white", padding: "8px", borderRadius: "12px", border: "1px solid #bae6fd" }}>
                                    <div style={{ fontSize: "0.55rem", fontWeight: 800, color: "#64748b" }}>MY TARGET</div>
                                    <div style={{ fontSize: "1rem", fontWeight: 950, color: "#0369a1" }}>{inspectingTask.targetQuantity || 0}</div>
                                  </div>
                                  <div style={{ background: "white", padding: "8px", borderRadius: "12px", border: "1px solid #bae6fd" }}>
                                    <div style={{ fontSize: "0.55rem", fontWeight: 800, color: "#64748b" }}>MY COMPLETED</div>
                                    <div style={{ fontSize: "1rem", fontWeight: 950, color: "#16a34a" }}>{inspectingTask.completedQuantity || 0}</div>
                                  </div>
                                  <div style={{ background: "white", padding: "8px", borderRadius: "12px", border: "1px solid #bae6fd" }}>
                                    <div style={{ fontSize: "0.55rem", fontWeight: 800, color: "#64748b" }}>MY REMAINING</div>
                                    <div style={{ fontSize: "1rem", fontWeight: 950, color: (inspectingTask.targetQuantity - inspectingTask.completedQuantity) > 0 ? "#ef4444" : "#16a34a" }}>{Math.max(0, inspectingTask.targetQuantity - inspectingTask.completedQuantity)}</div>
                                  </div>
                                  <div style={{ background: "white", padding: "8px", borderRadius: "12px", border: "1px solid #bae6fd" }}>
                                    <div style={{ fontSize: "0.55rem", fontWeight: 800, color: "#64748b" }}>PERFORMANCE</div>
                                    <div style={{ fontSize: "1rem", fontWeight: 950, color: "#7c3aed" }}>{completionPct}%</div>
                                  </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "10px 14px", borderRadius: "14px", border: "1.5px solid #e0f2fe", fontSize: "0.78rem" }}>
                                  <span style={{ fontWeight: 800, color: "#64748b" }}>Countdown Timer:</span>
                                  <span style={{ fontWeight: 900, color: countdownColor, display: "flex", alignItems: "center", gap: "4px" }}>
                                    <LucideClock size={12} /> {countdownText.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* --- REAL-TIME VISUAL EVENT TIMELINE --- */}
                            {historyList.length > 0 && (
                              <div style={{ background: "#ffffff", border: "1.5px solid #f1f5f9", padding: "20px", borderRadius: "24px" }}>
                                <h4 style={{ margin: "0 0 16px", fontSize: "0.85rem", fontWeight: "900", color: "#1e293b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <LucideHistory size={16} color="#64748b" /> Operational Event & Audit Timeline
                                </h4>

                                <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingLeft: "8px", position: "relative" }}>
                                  {historyList.map((log: any, idx: number) => {
                                    const getTimelineIcon = (action: string) => {
                                      const act = action.toLowerCase();
                                      if (act === "created") return <LucidePlus size={10} color="white" />;
                                      if (act === "subtask_created") return <LucideGitFork size={10} color="white" />;
                                      if (act === "comment_added") return <LucideMessageSquare size={10} color="white" />;
                                      if (act === "attachment_added") return <LucidePaperclip size={10} color="white" />;
                                      return <LucideActivity size={10} color="white" />;
                                    };

                                    const getTimelineColor = (action: string) => {
                                      const act = action.toLowerCase();
                                      if (act === "created") return "#16a34a"; // green
                                      if (act === "subtask_created") return "#7c3aed"; // purple
                                      if (act === "status_changed") return "#0ea5e9"; // blue
                                      return "#64748b"; // gray
                                    };

                                    return (
                                      <div key={idx} style={{ display: "flex", gap: "14px", alignItems: "flex-start", position: "relative" }}>
                                        {idx !== historyList.length - 1 && (
                                          <div style={{ position: "absolute", left: "9px", top: "20px", bottom: "-16px", width: "2px", background: "#f1f5f9" }}></div>
                                        )}
                                        <div style={{
                                          width: "20px",
                                          height: "20px",
                                          borderRadius: "50%",
                                          background: getTimelineColor(log.action),
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          zIndex: 1,
                                          marginTop: "2px",
                                          boxShadow: "0 0 0 4px #fff"
                                        }}>
                                          {getTimelineIcon(log.action)}
                                        </div>
                                        <div style={{ flex: 1, background: "#f8fafc", padding: "10px 14px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                                          <div style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: "750", lineHeight: 1.3 }}>{log.text}</div>
                                          <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: "800", marginTop: "4px" }}>
                                            Triggered by: {log.user} • {new Date(log.time).toLocaleDateString()} {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })()}
                    </>
                  )}

                  {inspectorTab === "distribute" && (
                    <div style={{ background: "#faf5ff", padding: "20px", borderRadius: "20px", border: "1.5px solid #f3e8ff" }}>
                      <h4 style={{ margin: "0 0 6px", fontSize: "0.85rem", fontWeight: "900", color: "#7c3aed", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                        <LucideGitFork size={16} /> Deploy & Distribute Team Subtasks
                      </h4>
                      <p style={{ margin: "0 0 16px 0", fontSize: "0.78rem", color: "#64748b", fontWeight: 700 }}>
                        Parent Target: {inspectingTask.targetQuantity} • Allocated: {totalDistributed} • Remaining: {remainingTarget}
                      </p>

                      <form onSubmit={submitSplit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div className="form-group">
                            <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "#64748b", marginBottom: "4px", display: "block" }}>SUBTASK PRIORITY</label>
                            <select
                              value={splitPriority}
                              onChange={e => setSplitPriority(e.target.value)}
                              style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", fontSize: "0.82rem", fontWeight: 800 }}
                            >
                              <option value="low">Low Priority</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "#64748b", marginBottom: "4px", display: "block" }}>SUBTASK TIMEFRAME</label>
                            <select
                              value={splitDuration}
                              onChange={e => setSplitDuration(e.target.value)}
                              style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", fontSize: "0.82rem", fontWeight: 800 }}
                            >
                              <option value="today">Today</option>
                              <option value="this_week">This Week</option>
                              <option value="this_month">This Month</option>
                            </select>
                          </div>
                        </div>

                        {/* Inline distribution rows */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <label style={{ fontSize: "0.68rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Subtask Allocations & Targets</label>
                            <button
                              type="button"
                              onClick={addSplitRow}
                              style={{ background: "white", border: "1px solid #d8b4fe", color: "#7c3aed", fontSize: "0.7rem", fontWeight: "800", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              <LucidePlus size={12} /> Add Assignee
                            </button>
                          </div>

                          {loadingAssignees ? (
                            <div style={{ textAlign: "center", padding: "20px" }}><LucideLoader2 size={20} className="animate-spin" color="#7c3aed" /></div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "250px", overflowY: "auto", paddingRight: "5px" }}>
                              {splits.map((split, index) => (
                                <div key={index} style={{ background: "white", padding: "12px", borderRadius: "14px", border: "1.5px solid #f3e8ff", display: "flex", flexDirection: "column", gap: "10px" }}>
                                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <select
                                      required
                                      value={split.assigneeId}
                                      onChange={e => handleSplitChange(index, "assigneeId", e.target.value)}
                                      style={{ flex: 1.5, padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.8rem", fontWeight: 700 }}
                                    >
                                      <option value="">Select Team Member...</option>
                                      {eligibleAssignees.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()})</option>
                                      ))}
                                    </select>

                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "100px" }}>
                                      <input
                                        type="number"
                                        min="1"
                                        required
                                        placeholder="Qty"
                                        value={split.targetQuantity}
                                        onChange={e => handleSplitQtyChange(index, e.target.value)}
                                        style={{ width: "100%", padding: "8px 4px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.8rem", fontWeight: 800, textAlign: "center" }}
                                      />
                                      <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>qty</span>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "90px" }}>
                                      <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        placeholder="%"
                                        value={split.percentage}
                                        onChange={e => handleSplitPctChange(index, e.target.value)}
                                        style={{ width: "100%", padding: "8px 4px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.8rem", fontWeight: 800, textAlign: "center" }}
                                      />
                                      <LucidePercent size={10} color="#94a3b8" />
                                    </div>

                                    {splits.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeSplitRow(index)}
                                        style={{ border: "none", background: "#fee2e2", color: "#ef4444", width: "28px", height: "28px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                      >
                                        <LucideTrash2 size={12} />
                                      </button>
                                    )}
                                  </div>

                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                    <input
                                      type="text"
                                      placeholder="Subtask Directive notes (e.g. Pune sector lineup)..."
                                      value={split.notes}
                                      onChange={e => handleSplitChange(index, "notes", e.target.value)}
                                      style={{ padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.75rem", fontWeight: 500 }}
                                    />
                                    <input
                                      type="date"
                                      value={split.deadline}
                                      onChange={e => handleSplitChange(index, "deadline", e.target.value)}
                                      style={{ padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.75rem", fontWeight: 550 }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "10px", marginTop: "10px", borderTop: "1.5px solid #e2e8f0", paddingTop: "16px" }}>
                          <button
                            type="button"
                            onClick={() => setInspectorTab("directives")}
                            style={{ flex: 1, padding: "12px", border: "1.5px solid #e2e8f0", color: "#475569", background: "white", borderRadius: "12px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "800" }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSplitting || loadingAssignees}
                            style={{ flex: 1, padding: "12px", border: "none", background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)", color: "white", borderRadius: "12px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)" }}
                          >
                            {isSplitting ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideGitFork size={16} />}
                            Deploy Subtasks
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {inspectorTab === "collaboration" && (
                    <>
                      {/* Comments Box */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: "0.85rem", fontWeight: "900", color: "#1e293b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                          <LucideMessageSquare size={16} /> Comments & Notes ({comments.length})
                        </h4>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "180px", overflowY: "auto", padding: "6px", background: "#fafafa", borderRadius: "12px", border: "1px solid #f1f5f9", marginBottom: "10px" }}>
                          {comments.map((comment: any, idx: number) => (
                            <div key={idx} style={{ background: "white", padding: "8px 12px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", marginBottom: "4px" }}>
                                <span style={{ color: "#0284c7" }}>{comment.author}</span>
                                <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: "0.8rem", color: "#334155", fontWeight: 500 }}>{comment.text}</p>
                            </div>
                          ))}
                          {comments.length === 0 && (
                            <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "700" }}>
                              No comments posted yet.
                            </div>
                          )}
                        </div>

                        <form onSubmit={submitComment} style={{ display: "flex", gap: "8px" }}>
                          <input
                            type="text"
                            placeholder="Add updates or progress notes..."
                            required
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.82rem", fontWeight: 600 }}
                          />
                          <button
                            type="submit"
                            disabled={isSubmittingComment}
                            style={{ border: "none", background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)", color: "white", padding: "0 16px", borderRadius: "10px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "800" }}
                          >
                            {isSubmittingComment ? <LucideLoader2 size={14} className="animate-spin" /> : "Post"}
                          </button>
                        </form>
                      </div>

                      {/* Attachments Section */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: "0.85rem", fontWeight: "900", color: "#1e293b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                          <LucidePaperclip size={16} /> Attachments / Files ({attachments.length})
                        </h4>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto", padding: "6px", background: "#fafafa", borderRadius: "12px", border: "1px solid #f1f5f9", marginBottom: "10px" }}>
                          {attachments.map((file: any, idx: number) => (
                            <a
                              key={idx}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ background: "white", padding: "8px 12px", borderRadius: "10px", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none" }}
                            >
                              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#0369a1" }}>{file.name}</span>
                              <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{new Date(file.createdAt).toLocaleDateString()}</span>
                            </a>
                          ))}
                          {attachments.length === 0 && (
                            <div style={{ textAlign: "center", padding: "16px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "700" }}>
                              No files attached.
                            </div>
                          )}
                        </div>

                        <form onSubmit={submitAttachment} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "10px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <input
                              type="text"
                              placeholder="File Name (e.g. Resume)"
                              required
                              value={attachmentName}
                              onChange={e => setAttachmentName(e.target.value)}
                              style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.78rem", background: "white" }}
                            />
                            <input
                              type="text"
                              placeholder="https://..."
                              required
                              value={attachmentUrl}
                              onChange={e => setAttachmentUrl(e.target.value)}
                              style={{ flex: 1.5, padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.78rem", background: "white" }}
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmittingAttachment}
                            style={{ border: "none", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", padding: "8px", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "800" }}
                          >
                            {isSubmittingAttachment ? <LucideLoader2 size={14} className="animate-spin" /> : "Attach File"}
                          </button>
                        </form>
                      </div>

                      {/* History Timeline */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: "0.85rem", fontWeight: "900", color: "#1e293b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                          <LucideHistory size={16} /> Activity History Log
                        </h4>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px", background: "#fafafa", borderRadius: "12px", border: "1px solid #f1f5f9", maxHeight: "150px", overflowY: "auto" }}>
                          {historyList.map((log: any, idx: number) => (
                            <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start", position: "relative" }}>
                              {idx !== historyList.length - 1 && (
                                <div style={{ position: "absolute", left: "6px", top: "16px", bottom: "-12px", width: "2px", background: "#e2e8f0" }}></div>
                              )}
                              <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#0ea5e9", border: "3px solid white", boxShadow: "0 0 4px rgba(0,0,0,0.1)", zIndex: 1, marginTop: "2px" }}></div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.72rem", color: "#1e293b", fontWeight: "700" }}>{log.text}</div>
                                <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: "800", marginTop: "2px" }}>
                                  By: {log.user} • {new Date(log.time).toLocaleDateString()} {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
