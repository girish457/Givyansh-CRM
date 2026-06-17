import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LucideBell, 
  LucideClock, 
  LucideAlertCircle, 
  LucideClipboardList, 
  LucideFlag,
  LucideAlertTriangle,
  LucideTrendingUp,
  LucideCheckCircle2,
  LucideXCircle,
  LucideUser,
  LucideHistory
} from "lucide-react";

export default function TaskNotificationOverlay() {
  const [currentAlert, setCurrentAlert] = useState<any>(null); // { type: 'new_assignment' | 'reminder' | 'expired' | 'completed', task: any, reminderType?: string }
  const [allPendingAlerts, setAllPendingAlerts] = useState<any[]>([]);

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

  useEffect(() => {
    const checkTasksAndDeadlines = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) return;
        const data = await res.json();
        const now = new Date();
        const pending: any[] = [];

        data.forEach((t: any) => {
          const deadlineDate = getTaskDeadlineDate(t);
          const isExpired = now > deadlineDate;

          // 1. TASK COMPLETED POPUP
          if (t.status === "completed" && !t.completionPopupSent) {
            pending.push({
              type: "completed",
              task: t,
              key: `completed_${t.id}`
            });
            return;
          }

          if (t.status === "completed" || t.status === "cancelled") return;

          // 2. TASK EXPIRED POPUP
          if (isExpired && !t.expiredPopupSent) {
            pending.push({
              type: "expired",
              task: t,
              key: `expired_${t.id}`
            });
            return;
          }

          if (isExpired) return;

          // 3. FIRST ASSIGNMENT POPUP
          if (!t.popupShown && !t.popupAcknowledged) {
            pending.push({
              type: "new_assignment",
              task: t,
              key: `new_${t.id}`
            });
            return;
          }

          // 4. DEADLINE REMINDER POPUP
          const timeRemainingMs = deadlineDate.getTime() - now.getTime();
          const totalDurationMs = deadlineDate.getTime() - new Date(t.createdAt || now).getTime();
          const totalDurationDays = totalDurationMs / (1000 * 60 * 60 * 24);

          let reminderType: string | null = null;
          if (totalDurationDays > 5) {
            const oneDayMs = 24 * 60 * 60 * 1000;
            if (timeRemainingMs <= oneDayMs && timeRemainingMs > 0) {
              reminderType = "1d";
            }
          } else if (totalDurationDays < 5 && totalDurationDays >= 2) {
            const tenHoursMs = 10 * 60 * 60 * 1000;
            if (timeRemainingMs <= tenHoursMs && timeRemainingMs > 0) {
              reminderType = "10h";
            }
          } else if (totalDurationDays < 2) {
            const threeHoursMs = 3 * 60 * 60 * 1000;
            if (timeRemainingMs <= threeHoursMs && timeRemainingMs > 0) {
              reminderType = "3h";
            }
          }

          if (reminderType) {
            const sentReminders = t.reminderSent ? t.reminderSent.split(",") : [];
            if (!sentReminders.includes(reminderType)) {
              pending.push({
                type: "reminder",
                reminderType,
                task: t,
                key: `reminder_${reminderType}_${t.id}`
              });
            }
          }
        });

        setAllPendingAlerts(pending);

        // Select the first alert to show
        if (pending.length > 0) {
          // Check if we are already displaying a different alert
          if (!currentAlert || !pending.some(p => p.key === currentAlert.key)) {
            setCurrentAlert(pending[0]);
          }
        } else {
          setCurrentAlert(null);
        }
      } catch (err) {
        console.error("Task check failed", err);
      }
    };

    checkTasksAndDeadlines();
    const interval = setInterval(checkTasksAndDeadlines, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [currentAlert]);

  const handleDismiss = async () => {
    if (!currentAlert) return;
    const { type, task, reminderType } = currentAlert;

    try {
      let body: any = {};
      if (type === "new_assignment") {
        body = { popupShown: true, popupAcknowledged: true };
      } else if (type === "reminder" && reminderType) {
        const sent = task.reminderSent ? task.reminderSent.split(",") : [];
        const newSent = [...new Set([...sent, reminderType])].join(",");
        body = { reminderSent: newSent };
      } else if (type === "expired") {
        body = { expiredPopupSent: true };
      } else if (type === "completed") {
        body = { completionPopupSent: true };
      }

      await fetch(`/api/tasks/${task.id}/popup-state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      // Remove from frontend queue
      const remaining = allPendingAlerts.filter(p => p.key !== currentAlert.key);
      setAllPendingAlerts(remaining);

      if (remaining.length > 0) {
        setCurrentAlert(remaining[0]);
      } else {
        setCurrentAlert(null);
      }
    } catch (err) {
      console.error("Failed to acknowledge popup", err);
    }
  };

  if (!currentAlert) return null;

  const { type, task, reminderType } = currentAlert;
  const assignerName = task.assigner?.name || "Command Core";
  const priority = task.priority || "medium";
  const duration = task.duration || "today";
  const description = task.description;
  const deadlineDate = getTaskDeadlineDate(task);
  const completionPct = task.targetQuantity ? Math.min(100, Math.round((task.completedQuantity / task.targetQuantity) * 100)) : 0;

  // Gather list of targets
  const targetMetrics: any[] = [];
  if (task.taskType === "master" && task.subTasks && Array.isArray(task.subTasks)) {
    targetMetrics.push(...task.subTasks.filter((sub: any) => sub.taskType === "target"));
  } else if (task.taskType === "target") {
    targetMetrics.push(task);
  }

  // Visual options based on Alert Type
  const getVisualConfig = () => {
    switch (type) {
      case "completed":
        return {
          bg: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
          border: "1.5px solid #bbf7d0",
          shadowColor: "rgba(22, 163, 74, 0.25)",
          icon: <LucideCheckCircle2 size={18} />,
          title: "Task Completed Successfully",
          accentColor: "#16a34a",
          statusText: "Task completed successfully."
        };
      case "expired":
        return {
          bg: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
          border: "1.5px solid #fca5a5",
          shadowColor: "rgba(239, 68, 68, 0.25)",
          icon: <LucideXCircle size={18} />,
          title: "Task Deadline Expired",
          accentColor: "#ef4444",
          statusText: "Task deadline expired. Remaining targets are still pending."
        };
      case "reminder":
        return {
          bg: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
          border: "1.5px solid #fef3c7",
          shadowColor: "rgba(245, 158, 11, 0.25)",
          icon: <LucideAlertTriangle size={18} />,
          title: `Deadline Approaching (${reminderType === "1d" ? "24 Hour" : reminderType === "10h" ? "10 Hour" : "3 Hour"} Reminder)`,
          accentColor: "#f59e0b",
          statusText: "Task deadline is approaching rapidly. Your remaining targets are still pending."
        };
      case "new_assignment":
      default:
        return {
          bg: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
          border: "1.5px solid #e0f2fe",
          shadowColor: "rgba(14, 165, 233, 0.25)",
          icon: <LucideBell size={18} />,
          title: "Mission Deployed",
          accentColor: "#0ea5e9",
          statusText: "New task assigned."
        };
    }
  };

  const config = getVisualConfig();

  // Aggregate Team Contribution Breakdown (Hierarchical Roll-up) for completed popup
  const getTeamContributionList = () => {
    const list: any[] = [];
    if (task.subTasks && Array.isArray(task.subTasks)) {
      task.subTasks.forEach((sub: any) => {
        if (sub.assignee) {
          list.push({
            name: sub.assignee.name,
            role: sub.assignee.role,
            completed: sub.completedQuantity || 0,
            target: sub.targetQuantity || 0
          });
        }
      });
    }
    return list;
  };
  const teamContributions = getTeamContributionList();

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, x: 100, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        style={{ 
          position: "fixed", 
          bottom: "35px", 
          right: "35px", 
          zIndex: 10000,
          width: "450px",
          background: "rgba(255, 255, 255, 0.99)",
          backdropFilter: "blur(12px)",
          borderRadius: "24px",
          boxShadow: `0 25px 50px -12px ${config.shadowColor}, 0 0 1px ${config.accentColor}`,
          border: config.border,
          overflow: "hidden"
        }}
      >
        {/* Header Section */}
        <div style={{ 
          background: config.bg, 
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "10px", color: "white" }}>
              {config.icon}
            </div>
            <span style={{ fontWeight: 900, fontSize: "0.85rem", letterSpacing: "1.5px", color: "white", textTransform: "uppercase" }}>
              {config.title}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.2)", padding: "4px 8px", borderRadius: "6px" }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 900, color: "white", textTransform: "uppercase" }}>{priority}</span>
          </div>
        </div>
        
        <div style={{ padding: "24px" }}>
          {/* Status highlight banner */}
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            background: type === "completed" ? "#f0fdf4" : (type === "expired" ? "#fef2f2" : "#fef3c7"), 
            color: type === "completed" ? "#15803d" : (type === "expired" ? "#991b1b" : "#b45309"), 
            padding: "10px 14px", 
            borderRadius: "12px", 
            fontSize: "0.85rem", 
            fontWeight: 700, 
            marginBottom: "16px", 
            border: `1px solid ${type === "completed" ? "#bbf7d0" : (type === "expired" ? "#fca5a5" : "#fde68a")}` 
          }}>
            <LucideAlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <span>{config.statusText}</span>
            </div>
          </div>

          {/* Task Name */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
               <LucideClipboardList size={16} color={config.accentColor} />
               <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Task Name</span>
            </div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 950, margin: "0", color: "#0f172a", letterSpacing: "-0.5px", lineHeight: "1.3" }}>
              {task.title}
            </h3>
          </div>
          
          {/* Metadata Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
             <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                   <LucideFlag size={14} color="#f59e0b" />
                   <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Priority</span>
                </div>
                <span style={{ fontSize: "0.88rem", fontWeight: "850", color: "#1e293b", textTransform: "capitalize" }}>
                  {priority}
                </span>
             </div>
             <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                   <LucideClock size={14} color="#0284c7" />
                   <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Deadline / End</span>
                </div>
                <span style={{ fontSize: "0.88rem", fontWeight: "850", color: "#1e293b" }}>
                  {duration === "custom" && task.customEndDate 
                    ? task.customEndDate 
                    : (duration === "time_based" ? `Today ${task.deadlineTime || "18:00"}` : duration?.replace('_', ' ').toUpperCase())
                  }
                </span>
             </div>
          </div>

          {/* Target Metrics or Team contributions */}
          {type === "completed" && teamContributions.length > 0 ? (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", padding: "16px", borderRadius: "18px", marginBottom: "20px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 900, color: "#15803d", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                <LucideUser size={15} /> Team Contribution Summary
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {teamContributions.map((member: any) => (
                  <div key={member.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "8px 12px", borderRadius: "10px", border: "1px solid #dcfce7" }}>
                    <div>
                      <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#1e293b" }}>{member.name}</span>
                      <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: "700", marginLeft: "6px", textTransform: "uppercase" }}>({member.role})</span>
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: "900", color: "#15803d" }}>
                      {member.completed} / {member.target} Completed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : targetMetrics.length > 0 && (
            <div style={{ background: "rgba(240, 249, 255, 0.6)", border: "1.5px solid #e0f2fe", padding: "16px", borderRadius: "18px", marginBottom: "20px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 900, color: "#0369a1", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                <LucideTrendingUp size={15} /> Assigned Target Metrics ({completionPct}% Done)
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px" }}>
                {targetMetrics.map((tMetric: any) => (
                  <div key={tMetric.id} style={{ display: "flex", flexDirection: "column", gap: "4px", background: "white", padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                      {tMetric.targetType || "Metric"}
                    </span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 900, color: config.accentColor }}>
                      {tMetric.completedQuantity} / {tMetric.targetQuantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div style={{ marginBottom: "24px" }}>
               <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <LucideAlertCircle size={16} color={config.accentColor} />
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Directive brief</span>
               </div>
               <p style={{ fontSize: "0.88rem", color: "#475569", margin: 0, lineHeight: "1.5", fontWeight: "500", background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9", maxHeight: "100px", overflowY: "auto" }}>
                 {description}
               </p>
            </div>
          )}
          
          {/* Footer with OK button */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            borderTop: "1.5px solid #f1f5f9", 
            paddingTop: "20px"
          }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "2px" }}>Assigned By</span>
              <span style={{ fontSize: "0.9rem", fontWeight: 900, color: "#0369a1", display: "flex", alignItems: "center", gap: "4px" }}>
                <LucideUser size={14} /> {assignerName}
              </span>
            </div>
            <button 
                onClick={handleDismiss}
                style={{ 
                  background: config.bg, 
                  color: "white", 
                  border: "none", 
                  padding: "12px 36px", 
                  borderRadius: "14px", 
                  fontSize: "0.9rem", 
                  fontWeight: 900, 
                  cursor: "pointer",
                  boxShadow: `0 10px 20px -5px ${config.shadowColor}`,
                  transition: "all 0.3s ease"
                }}
            >
              OK
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
