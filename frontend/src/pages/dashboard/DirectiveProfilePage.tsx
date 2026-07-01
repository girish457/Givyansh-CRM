import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { 
  LucideClipboardList, 
  LucideClock, 
  LucideAlertCircle, 
  LucideCheckCircle2, 
  LucideLoader2,
  LucideUsers,
  LucidePlus, 
  LucideChevronLeft, 
  LucideSearch,
  LucideEye,
  LucideTrash2,
  LucideX,
  LucideFilter,
  LucideAward,
  LucideBriefcase,
  LucideBuilding2,
  LucidePhoneCall,
  LucideRefreshCw,
  LucideChevronRight,
  LucideDownload,
  LucideEdit,
  LucideTarget,
  LucideMessageSquare,
  LucideGitBranch,
  LucideFileText,
  LucideChevronUp,
  LucideChevronDown,
  LucideGitFork,
  LucidePercent,
  LucidePaperclip,
  LucideExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/Dashboard.css";

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

export default function DirectiveProfilePage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [task, setTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"directives" | "distribute" | "collaboration">("directives");

  // Comments / Attachments state
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isSubmittingAttachment, setIsSubmittingAttachment] = useState(false);

  // Split Task State
  const [splits, setSplits] = useState<{ assigneeId: string; targetQuantity: string; percentage: string; notes: string; deadline: string }[]>([
    { assigneeId: "", targetQuantity: "", percentage: "", notes: "", deadline: "" }
  ]);
  const [splitPriority, setSplitPriority] = useState("medium");
  const [splitDuration, setSplitDuration] = useState("today");
  const [isSplitting, setIsSplitting] = useState(false);
  const [eligibleAssignees, setEligibleAssignees] = useState<EligibleAssignee[]>([]);
  const [loadingAssignees, setLoadingAssignees] = useState(false);

  // Status updating state
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // Notification system toast
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false,
    msg: "",
    type: "success"
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, msg, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch user profile
      const profileRes = await fetch("/api/me");
      if (!profileRes.ok) {
        if (profileRes.status === 403) {
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to authenticate session");
      }
      const profileData = await profileRes.json();
      setUserProfile(profileData);

      // 2. Fetch all tasks to find the requested task ID
      // Fetch both roles to guarantee finding it
      const [assignedByMeRes, assignedToMeRes] = await Promise.all([
        fetch("/api/tasks?assignedByMe=true"),
        fetch("/api/tasks?assignedByMe=false")
      ]);

      const assignedByMe = assignedByMeRes.ok ? await assignedByMeRes.json() : [];
      const assignedToMe = assignedToMeRes.ok ? await assignedToMeRes.json() : [];

      const allTasks = [...(Array.isArray(assignedByMe) ? assignedByMe : []), ...(Array.isArray(assignedToMe) ? assignedToMe : [])];
      
      // Find matching task by checking single ID or items in the task cluster (ids)
      const targetId = parseInt(taskId || "0");
      const foundTask = allTasks.find((t: any) => t.id === targetId || (t.ids && t.ids.includes(targetId)));

      if (!foundTask) {
        throw new Error("Task profile not found or access denied.");
      }

      setTask(foundTask);
      setSplitPriority(foundTask.priority || "medium");
      setSplitDuration(foundTask.duration || "today");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed loading task information.");
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

  useEffect(() => {
    fetchData();
  }, [taskId]);

  useEffect(() => {
    if (task) {
      fetchEligibleAssignees();
    }
  }, [task?.id]);

  if (loading) {
    return (
      <AdminLayout role="recruiter" userName="Loading..." activeTab="tasks">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh", flexDirection: "column", gap: "14px" }}>
          <LucideLoader2 size={36} className="animate-spin" color="#0284c7" />
          <p style={{ fontWeight: 800, color: "#64748b", fontSize: "0.9rem" }}>Decoding Directive Datastream...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !task) {
    return (
      <AdminLayout role="recruiter" userName="Error" activeTab="tasks">
        <div style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
          <div style={{ background: "#fef2f2", padding: "16px", borderRadius: "50%", border: "1.5px solid #fee2e2" }}>
            <LucideAlertCircle size={40} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a" }}>Uplink Failed</h2>
          <p style={{ color: "#64748b", fontWeight: 700, fontSize: "0.95rem", textAlign: "center", maxWidth: "450px" }}>{error || "We could not fetch the details for this directive."}</p>
          <button 
            onClick={() => navigate(-1)} 
            style={{ padding: "10px 20px", background: "#64748b", color: "white", border: "none", borderRadius: "10px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <LucideChevronLeft size={16} /> Go Back
          </button>
        </div>
      </AdminLayout>
    );
  }

  // --- Calculations for metrics ---
  const isTarget = task.taskType === "target" || (task.subTasks && task.subTasks.length > 0);
  
  const stats = (() => {
    if (isTarget) {
      let completed = 0;
      let target = 0;
      if (task.subTasks && task.subTasks.length > 0) {
        task.subTasks.forEach((s: any) => {
          completed += s.completedQuantity || 0;
          target += s.targetQuantity || 0;
        });
      } else {
        completed = task.completedQuantity || 0;
        target = task.targetQuantity || 0;
      }
      const percent = target > 0 ? Math.round((completed / target) * 100) : 0;
      return { completed, target, percent: Math.min(100, percent), isTarget: true };
    } else {
      const tasksInCluster = task.tasks || [task];
      const total = tasksInCluster.length;
      const completedTasks = tasksInCluster.filter((t: any) => t.status === "completed").length;
      const percent = total > 0 ? Math.round((completedTasks / total) * 100) : 0;
      return { completed: completedTasks, target: total, percent, isTarget: false };
    }
  })();

  const timeInfo = (() => {
    const now = new Date();
    let deadlineDate = new Date(task.createdAt || now);
    
    if (task.duration === "today") {
      deadlineDate.setHours(23, 59, 59, 999);
    } else if (task.duration === "this_week") {
      const day = deadlineDate.getDay();
      const diff = deadlineDate.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(deadlineDate.setDate(diff));
      const sunday = new Date(monday.setDate(monday.getDate() + 6));
      sunday.setHours(23, 59, 59, 999);
      deadlineDate = sunday;
    } else if (task.duration === "this_month") {
      deadlineDate = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (task.duration === "this_year") {
      deadlineDate = new Date(deadlineDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (task.duration === "custom" && task.customEndDate) {
      deadlineDate = new Date(task.customEndDate);
      deadlineDate.setHours(23, 59, 59, 999);
    } else if (task.duration === "time_based") {
      if (task.deadlineTime) {
        const [h, m] = task.deadlineTime.split(":");
        deadlineDate.setHours(parseInt(h) || 18, parseInt(m) || 0, 0, 0);
      } else {
        deadlineDate.setHours(18, 0, 0, 0);
      }
    } else {
      deadlineDate.setHours(23, 59, 59, 999);
    }

    const diffMs = deadlineDate.getTime() - now.getTime();
    if (diffMs < 0) {
      return { text: "EXPIRED", expired: true };
    }

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 24) {
      return { text: `${diffHrs}H REMAINING`, expired: false };
    } else {
      const diffDays = Math.floor(diffHrs / 24);
      const remHrs = diffHrs % 24;
      return { text: `${diffDays}D ${remHrs}H REMAINING`, expired: false };
    }
  })();

  const activeNodes = task.tasks?.filter((t: any) => t.status !== "completed" && t.status !== "cancelled").length || 0;
  
  const comments = safeParseArray(task.comments);
  const attachments = safeParseArray(task.attachments);
  const historyList = safeParseArray(task.history);

  const totalDistributed = task.subTasks ? task.subTasks.reduce((sum: number, s: any) => sum + (s.targetQuantity || 0), 0) : 0;
  const remainingTarget = Math.max(0, task.targetQuantity - totalDistributed);
  const userCanDistribute = userProfile && ["boss", "manager", "tl"].includes(userProfile.role);

  const circleRadius = 35;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (stats.percent / 100) * circleCircumference;

  // Comments / attachments submissions
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      
      setCommentText("");
      showToast("Comment successfully added to timeline.", "success");
      await fetchData();
    } catch (err: any) {
      showToast(err.message || "Failed to add comment.", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentName.trim() || !attachmentUrl.trim()) return;
    setIsSubmittingAttachment(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: attachmentName, url: attachmentUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add attachment");

      setAttachmentName("");
      setAttachmentUrl("");
      showToast("Attachment linked to sync profile.", "success");
      await fetchData();
    } catch (err: any) {
      showToast(err.message || "Failed to link attachment.", "error");
    } finally {
      setIsSubmittingAttachment(false);
    }
  };

  // Split task methods
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
    const totalQty = task.targetQuantity || 1;
    const pct = Math.round((qty / totalQty) * 100);
    setSplits(prev => prev.map((s, i) => i === index ? { ...s, targetQuantity: val, percentage: pct.toString() } : s));
  };

  const handleSplitPctChange = (index: number, val: string) => {
    const pct = parseInt(val) || 0;
    const totalQty = task.targetQuantity || 0;
    const qty = Math.round((pct / 100) * totalQty);
    setSplits(prev => prev.map((s, i) => i === index ? { ...s, percentage: val, targetQuantity: qty.toString() } : s));
  };

  const submitSplit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const res = await fetch(`/api/tasks/${task.id}/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Splitting failed");

      showToast(`Target successfully split into ${validSplits.length} team subtasks!`, "success");
      setSplits([{ assigneeId: "", targetQuantity: "", percentage: "", notes: "", deadline: "" }]);
      await fetchData();
      setActiveTab("directives");
    } catch (err: any) {
      showToast(err.message || "Failed to split task targets.", "error");
    } finally {
      setIsSplitting(false);
    }
  };

  // Status updating logic
  const handleUpdateStatus = async (targetTaskId: number, newStatus: string) => {
    setUpdatingStatus(targetTaskId);
    try {
      const res = await fetch(`/api/tasks/${targetTaskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      
      showToast(`Status updated to ${newStatus.replace('_', ' ')}!`, "success");
      await fetchData();
    } catch (err: any) {
      showToast(err.message || "Failed to update status.", "error");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTargetType = (type: string) => {
    const mapping: Record<string, string> = {
      clients: "Clients", jobs: "Jobs", vendors: "Vendors",
      interviews: "Interviews", selections: "Selections",
      joined: "Joined", connected: "Connected", interested: "Interested"
    };
    return mapping[(type||"").toLowerCase()] || type;
  };

  return (
    <AdminLayout 
      role={userProfile?.role || "recruiter"} 
      userName={userProfile?.name || "Loading Profile"} 
      activeTab="tasks"
      onTabChange={(id) => navigate(`/dashboard/${userProfile?.role || "recruiter"}/${id}`)}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              background: toast.type === "success" ? "#10b981" : "#ef4444",
              color: "white",
              padding: "12px 24px",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
              fontWeight: 800,
              fontSize: "0.85rem",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {toast.type === "success" ? <LucideCheckCircle2 size={16} /> : <LucideAlertCircle size={16} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "16px", background: "#f8fafc", minHeight: "100vh" }}>
        
        {/* Header section with back button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{
                background: "white",
                border: "1.5px solid #e2e8f0",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                color: "#64748b",
                transition: "all 0.2s"
              }}
              title="Go Back"
            >
              <LucideChevronLeft size={16} />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  padding: "1px 6px",
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  color: "white",
                  fontSize: "0.58rem",
                  fontWeight: "950",
                  textTransform: "uppercase",
                  borderRadius: "4px",
                  letterSpacing: "0.5px"
                }}>
                  <LucideClipboardList size={8} style={{ display: "inline", marginRight: "3px", verticalAlign: "middle" }} />
                  DIRECTIVE PROFILE
                </span>
                <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 800 }}>ID: #{task.id}</span>
              </div>
              <h1 style={{ margin: "3px 0 0", fontSize: "1.45rem", fontWeight: "950", color: "#0f172a", letterSpacing: "-0.5px" }}>
                {task.title}
              </h1>
            </div>
          </div>

          {/* Quick status controls */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{
              padding: "4px 10px", borderRadius: "8px", fontSize: "0.68rem", fontWeight: "900", textTransform: "uppercase",
              background: task.status === "completed" ? "#ecfdf5" : "#eff6ff",
              color: task.status === "completed" ? "#10b981" : "#0284c7",
              border: `1.5px solid ${task.status === "completed" ? "#a7f3d0" : "#bae6fd"}`
            }}>
              {(task.status || "IN PROGRESS").replace('_', ' ').toUpperCase()}
            </span>
            <span style={{
              padding: "4px 10px", borderRadius: "8px", fontSize: "0.68rem", fontWeight: "900", textTransform: "uppercase",
              background: task.priority === "urgent" || task.priority === "critical" ? "#fef2f2" : "#f1f5f9",
              color: task.priority === "urgent" || task.priority === "critical" ? "#ef4444" : "#475569",
              border: `1.5px solid ${task.priority === "urgent" || task.priority === "critical" ? "#fca5a5" : "#e2e8f0"}`
            }}>
              {task.priority || "MEDIUM"} PRIORITY
            </span>
          </div>
        </div>

        {/* Master analytics details */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "16px", alignItems: "start" }}>
          
          {/* Left card: Circular completion progress and core info */}
          <div style={{ 
            background: "white",
            border: "1.5px solid #e2e8f0",
            borderRadius: "16px",
            padding: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px"
          }}>
            {(() => {
              const localRadius = 26;
              const localCircumference = 2 * Math.PI * localRadius;
              const localDashoffset = localCircumference - (stats.percent / 100) * localCircumference;
              return (
                <div style={{ position: "relative", width: "90px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg style={{ transform: "rotate(-90deg)", width: "90px", height: "90px" }}>
                    <circle cx="45" cy="45" r={localRadius} stroke="#f1f5f9" strokeWidth="6" fill="none" />
                    <circle 
                      cx="45" 
                      cy="45" 
                      r={localRadius} 
                      stroke="#0284c7" 
                      strokeWidth="6" 
                      fill="none" 
                      strokeDasharray={localCircumference} 
                      strokeDashoffset={localDashoffset} 
                      strokeLinecap="round" 
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: "950", color: "#0f172a" }}>{stats.percent}%</span>
                    <span style={{ fontSize: "0.5rem", color: "#64748b", fontWeight: "900", textTransform: "uppercase" }}>Completed</span>
                  </div>
                </div>
              );
            })()}

            <div style={{ textAlign: "center" }}>
              <h3 style={{ margin: "0 0 3px", fontSize: "0.9rem", fontWeight: 900, color: "#0f172a" }}>Overall Progress</h3>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>
                {isTarget ? `${stats.completed}/${stats.target} targets achieved` : `${stats.completed}/${stats.target} tasks completed`}
              </p>
            </div>

            <div style={{ width: "100%", height: "1px", background: "#f1f5f9" }} />

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                <span style={{ color: "#64748b", fontWeight: 700 }}>Assigned By:</span>
                <span style={{ color: "#0f172a", fontWeight: 900 }}>{task.assigner?.name || "System"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                <span style={{ color: "#64748b", fontWeight: 700 }}>Origin Node:</span>
                <span style={{ color: "#0284c7", fontWeight: 900, textTransform: "uppercase" }}>
                  {task.assigner?.role === "boss" ? "BOSS" : (task.assigner?.role || "SYSTEM")} NODE
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                <span style={{ color: "#64748b", fontWeight: 700 }}>Created Date:</span>
                <span style={{ color: "#1e293b", fontWeight: 800 }}>{formatDateStr(task.createdAt)}</span>
              </div>
            </div>

            {/* Time remaining banner */}
            <div style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "10px",
              background: timeInfo.expired ? "#fef2f2" : "#f0fdf4",
              border: `1.5px solid ${timeInfo.expired ? "#fee2e2" : "#bbf7d0"}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: timeInfo.expired ? "#ef4444" : "#16a34a", fontSize: "0.72rem", fontWeight: "900" }}>
                <LucideClock size={12} />
                {timeInfo.text}
              </span>
              <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 850 }}>
                Deadline: <strong style={{ color: "#0f172a" }}>{task.duration?.replace("_", " ").toUpperCase() || "TODAY"}</strong>
              </span>
            </div>
          </div>

          {/* Right card: Description and 7 Summary Tiles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Description details card */}
            <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: "16px", padding: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "0.78rem", fontWeight: "950", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Directive Description</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569", lineHeight: 1.45, fontWeight: 550, whiteSpace: "pre-line" }}>
                {task.description || "No description parameters registered for this task cluster."}
              </p>
            </div>

            {/* Summary details metrics tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px" }}>
              {[
                { label: "Current Status", value: (task.status || "IN PROGRESS").replace('_', ' ').toUpperCase(), color: task.status === "completed" ? "#10b981" : "#0284c7" },
                { label: "Completion %", value: `${stats.percent}%`, color: "#0f172a" },
                { label: "Deadline", value: task.duration?.toUpperCase().replace('_', ' ') || "TODAY", color: "#0f172a" },
                { label: "Remaining Time", value: timeInfo.text.toLowerCase(), color: timeInfo.expired ? "#ef4444" : "#e28743" },
                { label: "Completed Targets", value: stats.completed, color: "#10b981" },
                { label: "Pending Targets", value: Math.max(0, stats.target - stats.completed), color: "#dc2626" },
                { label: "Expired State", value: timeInfo.expired ? "EXPIRED" : "ACTIVE", color: timeInfo.expired ? "#ef4444" : "#10b981" }
              ].map((tile, idx) => (
                <div key={idx} style={{ border: "1px solid #e2e8f0", background: "white", padding: "8px 12px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "2px", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
                  <span style={{ fontSize: "0.58rem", color: "#94a3b8", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.3px" }}>{tile.label}</span>
                  <span style={{ fontSize: "0.9rem", color: tile.color, fontWeight: "950" }}>{tile.value}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Tab Selector bar */}
        <div style={{ display: "flex", borderBottom: "1.5px solid #e2e8f0", background: "white", padding: "0 16px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.01)" }}>
          {[
            { id: "directives", label: "Directives & Analytics" },
            ...(userCanDistribute && task.taskType === "target" ? [{ id: "distribute", label: "Deploy Subtasks" }] : []),
            { id: "collaboration", label: "Collaboration Workspace" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "3px solid #0284c7" : "3px solid transparent",
                fontSize: "0.78rem",
                fontWeight: 900,
                color: activeTab === tab.id ? "#0284c7" : "#64748b",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content renderer */}
        <div style={{ minHeight: "400px" }}>
          
          {/* Tab 1: Directives & Analytics (Agent list) */}
          {activeTab === "directives" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                
                {/* Agent Breakdown Header */}
                <div style={{ padding: "16px 24px", background: "linear-gradient(to right, #f8fafc, #ffffff)", borderBottom: "1.5px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", fontWeight: "950", color: "#0f172a" }}>
                    <LucideGitBranch size={16} style={{ color: "#0284c7" }} /> AGENT-BY-AGENT PROGRESS BREAKDOWN
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: "10px", fontSize: "0.68rem", fontWeight: "900" }}>
                      {activeNodes} Active
                    </span>
                    <span style={{ background: "#eff6ff", color: "#0284c7", border: "1px solid #bae6fd", padding: "4px 10px", borderRadius: "10px", fontSize: "0.68rem", fontWeight: "900" }}>
                      {task.assignees?.length || 0} Total Agents
                    </span>
                  </div>
                </div>

                {/* Subtasks / Assignees List */}
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(!task.assignees || task.assignees.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8", fontWeight: 700, fontSize: "0.85rem" }}>
                      No recruiters or agents have been allocated to this directive.
                    </div>
                  ) : (
                    task.assignees.map((a: any, idx: number) => {
                      const aTask = task.tasks?.find((t: any) => t.assigneeId === a.id) || {};
                      const aStatus = aTask.status || task.status || "pending";
                      
                      const bgColors = ["#3b82f6","#10b981","#8b5cf6","#f59e0b","#ef4444","#0ea5e9","#ec4899"];
                      const avatarBg = bgColors[(a.id || idx) % bgColors.length];

                      const aStats = (() => {
                        if (isTarget) {
                          const subTasksForAssignee = (task.subTasks || []).filter((s: any) => s.assigneeId === a.id);
                          let completed = 0, target = 0;
                          subTasksForAssignee.forEach((s: any) => { completed += s.completedQuantity || 0; target += s.targetQuantity || 0; });
                          const pct = target > 0 ? Math.round((completed / target) * 100) : 0;
                          return { completed, target, pct: Math.min(100, pct), isTarget: true, subTasks: subTasksForAssignee };
                        } else {
                          const pct = aStatus === "completed" ? 100 : aStatus === "in_progress" ? 50 : 0;
                          return { completed: aStatus === "completed" ? 1 : 0, target: 1, pct, isTarget: false, subTasks: [] };
                        }
                      })();

                      const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                        completed:   { bg: "#ecfdf5", text: "#10b981", border: "#a7f3d0" },
                        in_progress: { bg: "#eff6ff", text: "#0284c7", border: "#bae6fd" },
                        pending:     { bg: "#fefce8", text: "#ca8a04", border: "#fde68a" },
                        overdue:     { bg: "#fef2f2", text: "#ef4444", border: "#fca5a5" },
                        cancelled:   { bg: "#f8fafc", text: "#64748b", border: "#cbd5e1" }
                      };
                      const color = statusColors[aStatus] || statusColors["pending"];
                      const pctColor = aStats.pct >= 100 ? "#10b981" : aStats.pct >= 60 ? "#0ea5e9" : aStats.pct >= 30 ? "#f59e0b" : "#ef4444";

                      // Allow updating assignee task status if boss/manager/TL OR if it's the recruiter's own task!
                      const canUpdate = userCanDistribute || (userProfile && userProfile.id === a.id);

                      return (
                        <div key={a.id} style={{ border: `1.5px solid ${color.border}`, borderRadius: "16px", background: "white", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                          
                          {/* Agent Header Card */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: color.bg, borderBottom: `1px solid ${color.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: avatarBg, color: "white", fontSize: "0.82rem", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", textTransform: "uppercase", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                                {a.name ? a.name.split(" ").map((n: string) => n[0]).join("").substring(0,2) : "A"}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "#0f172a" }}>{a.name}</p>
                                <p style={{ margin: 0, fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                  {a.role || "Recruiter"} · Agent #{idx + 1}
                                </p>
                              </div>
                            </div>

                            {/* Status controls */}
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span style={{ 
                                padding: "4px 8px", 
                                borderRadius: "6px", 
                                fontSize: "0.68rem", 
                                fontWeight: "900", 
                                textTransform: "uppercase", 
                                background: color.bg, 
                                color: color.text, 
                                border: `1px solid ${color.border}` 
                              }}>
                                {aStatus.replace("_", " ")}
                              </span>
                            </div>
                          </div>

                          {/* Agent metrics section */}
                          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "#475569", fontWeight: "800" }}>
                              <span>
                                {aStats.isTarget
                                  ? `${aStats.completed} of ${aStats.target} targets completed`
                                  : aStatus === "completed" ? "✓ Task fully completed" : aStatus === "in_progress" ? "Task in progress" : "Task not started"}
                              </span>
                              <span style={{ fontWeight: 950, color: pctColor, fontSize: "0.85rem" }}>{aStats.pct}%</span>
                            </div>

                            <div style={{ width: "100%", height: "6px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                              <div style={{ width: `${aStats.pct}%`, height: "100%", background: pctColor, borderRadius: "10px", transition: "width 0.5s ease" }} />
                            </div>

                            {/* Subtasks metrics list grid */}
                            {aStats.isTarget && aStats.subTasks.length > 0 && (
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "8px", marginTop: "8px" }}>
                                {aStats.subTasks.map((sub: any) => {
                                  const subPct = sub.targetQuantity > 0 ? Math.min(100, Math.round(((sub.completedQuantity||0) / sub.targetQuantity) * 100)) : 0;
                                  const isDone = (sub.completedQuantity||0) >= sub.targetQuantity;
                                  return (
                                    <div key={sub.id} style={{ background: isDone ? "#f0fdf4" : "#f8fafc", border: `1.5px solid ${isDone ? "#bbf7d0" : "#e2e8f0"}`, borderRadius: "10px", padding: "8px 10px" }}>
                                      <div style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: "900", textTransform: "uppercase", marginBottom: "4px" }}>{formatTargetType(sub.targetType || "")}</div>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <span style={{ fontSize: "0.8rem", fontWeight: "950", color: isDone ? "#10b981" : "#0f172a" }}>
                                          {sub.completedQuantity||0}<span style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 800 }}>/{sub.targetQuantity||0}</span>
                                        </span>
                                        <span style={{ fontSize: "0.68rem", fontWeight: 900, color: isDone ? "#10b981" : "#0ea5e9" }}>{subPct}%</span>
                                      </div>
                                      <div style={{ width: "100%", height: "3px", background: "#e2e8f0", borderRadius: "4px", marginTop: "5px" }}>
                                        <div style={{ width: `${subPct}%`, height: "100%", background: isDone ? "#10b981" : "#0ea5e9", borderRadius: "4px" }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Tab 2: Deploy / Split Subtasks */}
          {activeTab === "distribute" && userCanDistribute && (
            <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: "16px", padding: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: "950", color: "#7c3aed", display: "flex", alignItems: "center", gap: "6px", textTransform: "uppercase" }}>
                    <LucideGitFork size={18} /> Deploy & Distribute Subtasks
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b", fontWeight: 700 }}>
                    Allocate subtask splits to recruiters and track their completion individually.
                  </p>
                </div>
                
                <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "6px 12px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900", color: "#7c3aed" }}>
                  Parent Target: {task.targetQuantity} • Allocated: {totalDistributed} • Remaining: {remainingTarget}
                </div>
              </div>

              <form onSubmit={submitSplit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "0.68rem", fontWeight: "900", color: "#64748b", marginBottom: "6px", display: "block" }}>SUBTASK PRIORITY</label>
                    <select
                      value={splitPriority}
                      onChange={e => setSplitPriority(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", background: "white", fontSize: "0.82rem", fontWeight: 800 }}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.68rem", fontWeight: "900", color: "#64748b", marginBottom: "6px", display: "block" }}>SUBTASK TIMEFRAME</label>
                    <select
                      value={splitDuration}
                      onChange={e => setSplitDuration(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", background: "white", fontSize: "0.82rem", fontWeight: 800 }}
                    >
                      <option value="today">Today</option>
                      <option value="this_week">This Week</option>
                      <option value="this_month">This Month</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "0.72rem", fontWeight: "950", color: "#64748b", textTransform: "uppercase", margin: 0 }}>Allocation Targets</h4>
                  <button
                    type="button"
                    onClick={addSplitRow}
                    style={{ background: "white", border: "1px solid #7c3aed", color: "#7c3aed", fontSize: "0.72rem", fontWeight: "800", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.2s" }}
                  >
                    <LucidePlus size={14} /> Add Assignee
                  </button>
                </div>

                {loadingAssignees ? (
                  <div style={{ textAlign: "center", padding: "20px" }}><LucideLoader2 size={24} className="animate-spin" color="#7c3aed" /></div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {splits.map((split, index) => (
                      <div key={index} style={{ background: "#faf9fe", padding: "16px", borderRadius: "16px", border: "1.5px solid #e9d5ff", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <select
                            required
                            value={split.assigneeId}
                            onChange={e => handleSplitChange(index, "assigneeId", e.target.value)}
                            style={{ flex: 1.5, padding: "8px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "0.8rem", fontWeight: 700 }}
                          >
                            <option value="">Select Team Member...</option>
                            {eligibleAssignees.map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()})</option>
                            ))}
                          </select>

                          <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "110px" }}>
                            <input
                              type="number"
                              min="1"
                              required
                              placeholder="Qty"
                              value={split.targetQuantity}
                              onChange={e => handleSplitQtyChange(index, e.target.value)}
                              style={{ width: "100%", padding: "8px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "0.8rem", fontWeight: 800, textAlign: "center" }}
                            />
                            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 800 }}>qty</span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "100px" }}>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="%"
                              value={split.percentage}
                              onChange={e => handleSplitPctChange(index, e.target.value)}
                              style={{ width: "100%", padding: "8px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "0.8rem", fontWeight: 800, textAlign: "center" }}
                            />
                            <LucidePercent size={12} color="#64748b" />
                          </div>

                          {splits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSplitRow(index)}
                              style={{ border: "none", background: "#fee2e2", color: "#ef4444", width: "32px", height: "32px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <LucideTrash2 size={14} />
                            </button>
                          )}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <input
                            type="text"
                            placeholder="Subtask Directive notes (e.g. Pune sector lineup)..."
                            value={split.notes}
                            onChange={e => handleSplitChange(index, "notes", e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem", fontWeight: 550 }}
                          />
                          <input
                            type="date"
                            value={split.deadline}
                            onChange={e => handleSplitChange(index, "deadline", e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem", fontWeight: 700 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px", borderTop: "1.5px solid #e2e8f0", paddingTop: "16px" }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab("directives")}
                    style={{ flex: 1, padding: "12px", border: "1.5px solid #e2e8f0", color: "#64748b", background: "white", borderRadius: "12px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "800" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSplitting || loadingAssignees}
                    style={{ flex: 1, padding: "12px", border: "none", background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)", color: "white", borderRadius: "12px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 4px 14px rgba(124, 58, 237, 0.2)" }}
                  >
                    {isSplitting ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideGitFork size={16} />}
                    Deploy Subtasks
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: Collaboration Workspace */}
          {activeTab === "collaboration" && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
              
              {/* Left Side: Comments Feed Thread */}
              <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <div style={{ padding: "16px 24px", background: "linear-gradient(to right, #f8fafc, #ffffff)", borderBottom: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", fontWeight: "950", color: "#0ea5e9" }}>
                  <LucideMessageSquare size={16} /> COORDINATION TIMELINE & FEEDBACK
                </div>

                {/* Comment lists */}
                <div style={{ maxHeight: "350px", overflowY: "auto", background: "#f8fafc", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {comments.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "#94a3b8", gap: "8px" }}>
                      <LucideMessageSquare size={32} style={{ opacity: 0.5 }} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>No coordination timeline updates registered yet.</span>
                      <span style={{ fontSize: "0.68rem" }}>Add a sync report or coordinate below.</span>
                    </div>
                  ) : (
                    comments.map((c: any, idx: number) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px", alignSelf: "flex-start", maxWidth: "85%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.65rem", color: "#64748b", fontWeight: "900", paddingLeft: "8px" }}>
                          <span style={{ color: "#0f172a", fontWeight: "950" }}>{c.author}</span>
                          <span>•</span>
                          <span>{formatDateStr(c.createdAt)}</span>
                        </div>
                        <div style={{ background: "white", padding: "10px 14px", borderRadius: "16px", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.01)", fontSize: "0.8rem", color: "#1e293b", lineHeight: 1.4, fontWeight: 550 }}>
                          {c.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment input textarea */}
                <div style={{ padding: "16px 20px", borderTop: "1.5px solid #e2e8f0" }}>
                  <form onSubmit={handleAddComment} style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                    <textarea
                      rows={3}
                      placeholder="Post a coordination update, directive feedback, or sync memo..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #cbd5e1", borderRadius: "12px", fontSize: "0.8rem", resize: "none", outline: "none", fontFamily: "inherit", fontWeight: 500 }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !commentText.trim()}
                      style={{
                        padding: "12px 20px",
                        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "900",
                        fontSize: "0.78rem",
                        cursor: isSubmittingComment || !commentText.trim() ? "not-allowed" : "pointer",
                        opacity: isSubmittingComment || !commentText.trim() ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {isSubmittingComment ? <LucideLoader2 size={14} className="animate-spin" /> : "Post update"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Side: Attachments List and Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Linked attachments view list */}
                <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: "16px", padding: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                  <h3 style={{ margin: "0 0 14px 0", fontSize: "0.85rem", fontWeight: "950", color: "#0f172a", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                    <LucidePaperclip size={14} /> Linked Attachments
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {attachments.length === 0 ? (
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center", padding: "10px", fontWeight: 700 }}>
                        No files or links associated.
                      </div>
                    ) : (
                      attachments.map((file: any, index: number) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            background: "#f8fafc",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "10px",
                            textDecoration: "none",
                            fontSize: "0.75rem",
                            color: "#0f172a",
                            fontWeight: 800,
                            transition: "all 0.2s"
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "6px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            <LucideFileText size={14} style={{ color: "#64748b" }} />
                            {file.name}
                          </span>
                          <LucideExternalLink size={12} style={{ color: "#0284c7" }} />
                        </a>
                      ))
                    )}
                  </div>

                  <div style={{ width: "100%", height: "1px", background: "#f1f5f9", margin: "16px 0" }} />

                  {/* Add Attachment Form */}
                  <form onSubmit={handleAddAttachment} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <h4 style={{ margin: 0, fontSize: "0.72rem", fontWeight: "950", color: "#64748b", textTransform: "uppercase" }}>Link New Resource</h4>
                    <input
                      type="text"
                      required
                      placeholder="Attachment name (e.g. CV Doc, Lead Sheet)"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      style={{ padding: "8px 10px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 550 }}
                    />
                    <input
                      type="url"
                      required
                      placeholder="Resource Link URL (https://...)"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      style={{ padding: "8px 10px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 550 }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingAttachment || !attachmentName.trim() || !attachmentUrl.trim()}
                      style={{
                        padding: "8px 12px",
                        background: "white",
                        border: "1.5px solid #0284c7",
                        color: "#0284c7",
                        borderRadius: "8px",
                        fontWeight: "900",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}
                    >
                      {isSubmittingAttachment ? <LucideLoader2 size={12} className="animate-spin" /> : <LucidePlus size={12} />}
                      Link Resource
                    </button>
                  </form>
                </div>

                {/* History tracker */}
                <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: "16px", padding: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: "950", color: "#0f172a", textTransform: "uppercase" }}>Directive History Timeline</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                    {historyList.length === 0 ? (
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", textAlign: "center", padding: "10px", fontWeight: 700 }}>
                        No protocol audit logs.
                      </div>
                    ) : (
                      historyList.map((log: any, index: number) => (
                        <div key={index} style={{ padding: "8px", borderLeft: "2px solid #0284c7", background: "#f8fafc", fontSize: "0.7rem" }}>
                          <div style={{ color: "#64748b", fontWeight: "950" }}>{formatDateStr(log.time || log.date)}</div>
                          <div style={{ color: "#0f172a", fontWeight: "750", marginTop: "2px" }}>{log.action}</div>
                          {log.by && <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 750 }}>By: {log.by}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </AdminLayout>
  );
}
