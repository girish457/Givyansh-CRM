import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  LucideFilter
} from "lucide-react";
import MyTasks from "./MyTasks";

interface EligibleAssignee {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function TaskAssignment({ role }: { role: string }) {
  const [showForm, setShowForm] = useState(false);
  const [assignees, setAssignees] = useState<EligibleAssignee[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inspectingTask, setInspectingTask] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<number[] | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    duration: "today",
    assigneeIds: [] as number[]
  });

  const [taskMode, setTaskMode] = useState<"basic" | "target">("basic");
  const [targetType, setTargetType] = useState("interviews");
  const [targetQuantity, setTargetQuantity] = useState("10");
  const [targets, setTargets] = useState<{ targetType: string; targetQuantity: string }[]>([
    { targetType: "interviews", targetQuantity: "10" }
  ]);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("18:00");

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);
  const [taskType, setTaskType] = useState("Lineup's");
  const [customTask, setCustomTask] = useState("");
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [durationFilter, setDurationFilter] = useState("all");
  const [assigneeFilterList, setAssigneeFilterList] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState("all");
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [expandedFilterRoles, setExpandedFilterRoles] = useState<string[]>([]);
  const [repositoryMode, setRepositoryMode] = useState("assigned_by_me");

  const fetchAssignees = async () => {
    try {
      const res = await fetch("/api/tasks/eligible-assignees");
      if (!res.ok) throw new Error("Failed to fetch assignees");
      const data = await res.json();
      setAssignees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setAssignees([]);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const endpoint = repositoryMode === "assigned_by_me" 
        ? "/api/tasks?assignedByMe=true" 
        : "/api/tasks?assignedByMe=false"; // This assumes the API returns tasks assigned to the user when assignedByMe is false or not provided
      const res = await fetch(endpoint);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignees();
    fetchHistory();
  }, [repositoryMode]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setFormData({ ...formData, assigneeIds: assignees.map(a => a.id) });
    } else {
      setFormData({ ...formData, assigneeIds: [] });
    }
  };

  const handleToggleAssignee = (id: number) => {
    const updated = formData.assigneeIds.includes(id)
      ? formData.assigneeIds.filter(aid => aid !== id)
      : [...formData.assigneeIds, id];
    setFormData({ ...formData, assigneeIds: updated });
  };

  const handleBatchDelete = async (ids: number[]) => {
    if (!window.confirm("Are you sure you want to terminate this task cluster?")) return;
    setIsDeleting(ids);
    try {
      const res = await fetch("/api/tasks/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      console.log("Delete Response:", res.status);
      if (res.ok) {
        fetchHistory();
      } else {
        const errorData = await res.json();
        console.error("Delete Error:", errorData);
        alert(`Error: ${errorData.error || "Uplink failed"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Neural uplink failed during termination.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleAssigneeFilter = (value: string) => {
    setAssigneeFilterList(prev => {
      const isSelected = prev.includes(value);
      let updated = isSelected ? prev.filter(v => v !== value) : [...prev, value];
      
      // Get the agent we're toggling
      const agentId = parseInt(value.replace('id_', ''));
      const agent = assignees.find(a => a.id === agentId);
      
      if (agent) {
         const role = agent.role.toLowerCase();
         const roleKey = `role_${role}`;
         const roleMemberIds = assignees.filter(a => a.role.toLowerCase() === role).map(a => `id_${a.id}`);
         
         // Fix role checkbox state based on member selection
         const allMembersSelected = roleMemberIds.every(id => updated.includes(id));
         if (allMembersSelected) {
            if (!updated.includes(roleKey)) updated.push(roleKey);
         } else {
            updated = updated.filter(v => v !== roleKey);
         }
      }
      
      return updated;
    });
  };

  const handleToggleRoleFilter = (role: string) => {
    const roleKey = `role_${role}`;
    const roleMemberIds = assignees.filter(a => a.role.toLowerCase() === role).map(a => `id_${a.id}`);
    
    setAssigneeFilterList(prev => {
       const isSelected = prev.includes(roleKey);
       if (isSelected) {
         // Deselect role and all its members
         return prev.filter(v => v !== roleKey && !roleMemberIds.includes(v));
       } else {
         // Select role and all its members
         return [...new Set([...prev, roleKey, ...roleMemberIds])];
       }
    });
  };

  const handleSelectAllFilters = () => {
     const allRoles = roles.map(r => `role_${r}`);
     const allMemberIds = assignees.map(a => `id_${a.id}`);
     setAssigneeFilterList([...allRoles, ...allMemberIds]);
  };

  const toggleExpandFilterRole = (role: string) => {
     setExpandedFilterRoles(prev => 
        prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
     );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = taskMode === "target" 
      ? "Numeric Target"
      : (taskType === "other" ? customTask : taskType);
    
    if (!finalTitle) {
      setError("Please specify a task name.");
      return;
    }

    if (formData.assigneeIds.length === 0) {
      setError("Please Select a team member whom you want to assign the task");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        title: finalTitle,
        description: formData.description,
        priority: formData.priority,
        duration: formData.duration,
        assigneeIds: formData.assigneeIds,
        taskType: taskMode,
        targetType: taskMode === "target" ? targets[0].targetType : null,
        targetQuantity: taskMode === "target" ? parseInt(targets[0].targetQuantity) || 1 : null,
        targets: taskMode === "target" ? targets.map(t => ({ targetType: t.targetType, targetQuantity: parseInt(t.targetQuantity) || 1 })) : null,
        customStartDate: formData.duration === "custom" ? customStartDate : null,
        customEndDate: formData.duration === "custom" ? customEndDate : null,
        deadlineTime: formData.duration === "time_based" ? deadlineTime : null
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Uplink failed");
      
      setSuccess(`Directives initiated! ${formData.assigneeIds.length} agents notified.`);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        duration: "today",
        assigneeIds: []
      });
      setTaskMode("basic");
      setTargetType("interviews");
      setTargetQuantity("10");
      setTargets([{ targetType: "interviews", targetQuantity: "10" }]);
      setCustomStartDate("");
      setCustomEndDate("");
      setDeadlineTime("18:00");
      
      // Refresh history & go back
      setTimeout(() => {
        fetchHistory();
        setShowForm(false);
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAssignees = assignees.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedAssignees = filteredAssignees.reduce((acc, a) => {
    const role = a.role.toLowerCase();
    if (!acc[role]) acc[role] = [];
    acc[role].push(a);
    return acc;
  }, {} as Record<string, EligibleAssignee[]>);

  const roles = ["manager", "tl", "recruiter"];

  const handleToggleRole = (role: string) => {
    const roleAssignees = groupedAssignees[role] || [];
    const roleIds = roleAssignees.map(a => a.id);
    const allSelected = roleIds.every(id => formData.assigneeIds.includes(id));

    if (allSelected) {
      setFormData({ ...formData, assigneeIds: formData.assigneeIds.filter(id => !roleIds.includes(id)) });
    } else {
      const newIds = [...new Set([...formData.assigneeIds, ...roleIds])];
      setFormData({ ...formData, assigneeIds: newIds });
    }
  };

  const toggleExpand = (role: string) => {
    setExpandedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  if (loading && !showForm) return <div className="flex-center p-xlarge"><LucideLoader2 className="animate-spin" size={30} /></div>;

  return (
    <div className="task-assignment-container" style={{ padding: "0.5rem 0.75rem", fontFamily: "'Outfit', 'Inter', sans-serif", background: "#f8fafc" }}>
      <div className="dash-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", flexWrap: "wrap", gap: "6px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            {showForm ? (
              <>
                <span style={{ color: "#0f172a" }}>Deploy </span>
                <span style={{ color: "#2563eb" }}>Directive</span>
              </>
            ) : repositoryMode === "assigned_by_me" ? (
              <>
                <span style={{ color: "#0f172a" }}>Task </span>
                <span style={{ color: "#2563eb" }}>Registry</span>
              </>
            ) : (
              <>
                <span style={{ color: "#0f172a" }}>My Assigned </span>
                <span style={{ color: "#2563eb" }}>Tasks</span>
              </>
            )}
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>
            {showForm ? "Deploy target metrics or basic mandates to reporting nodes." : (repositoryMode === "assigned_by_me" ? "Overview of active operational targets deployed to team." : "Review and update daily targets and mandates assigned to you.")}
          </p>
        </div>

        {/* Central Switch Toggle */}
        {!showForm && (role === "manager" || role === "tl") && (
          <div style={{ 
            display: "flex", 
            background: "#f1f5f9", 
            padding: "3px", 
            borderRadius: "8px", 
            border: "1px solid #e2e8f0"
          }}>
             <button 
               onClick={() => setRepositoryMode("assigned_to_me")}
               style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, border: "none", cursor: "pointer", transition: "all 0.2s", background: repositoryMode === "assigned_to_me" ? "white" : "transparent", color: repositoryMode === "assigned_to_me" ? "#2563eb" : "#64748b", boxShadow: repositoryMode === "assigned_to_me" ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}
             >
               My Tasks
             </button>
             <button 
               onClick={() => setRepositoryMode("assigned_by_me")}
               style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, border: "none", cursor: "pointer", transition: "all 0.2s", background: repositoryMode === "assigned_by_me" ? "white" : "transparent", color: repositoryMode === "assigned_by_me" ? "#2563eb" : "#64748b", boxShadow: repositoryMode === "assigned_by_me" ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}
             >
               Assign Task
             </button>
          </div>
        )}

        {/* Action Button */}
        <div>
          {(!showForm && repositoryMode === "assigned_by_me") && (
            <button 
              onClick={() => setShowForm(true)}
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", fontWeight: "800", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", boxShadow: "0 2px 6px rgba(59, 130, 246, 0.2)" }}
            >
              <LucidePlus size={12} /> Assign Task
            </button>
          )}
          {showForm && (
             <button 
              onClick={() => setShowForm(false)}
              style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "6px 10px", borderRadius: "6px", fontWeight: "800", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
            >
              <LucideChevronLeft size={12} /> Back to List
            </button>
          )}
        </div>
      </div>

      {showForm ? (
        <div className="grid-2-1" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "0.6rem" }}>
          
          {/* LEFT: Task Details Form */}
          <div className="glass-card" style={{ padding: "10px 14px", background: "white", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
            <h3 style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", fontWeight: 800, color: "#0f172a" }}>
              <LucideClipboardList style={{ color: "#3b82f6" }} size={14} /> Mandate Details
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              
              <div className="form-group">
                <label style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "3px", display: "block", textTransform: "uppercase" }}>Mission Mode</label>
                <div style={{ display: "flex", background: "#f1f5f9", padding: "2px", borderRadius: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setTaskMode("basic")}
                    style={{ flex: 1, padding: "5px", border: "none", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "800", cursor: "pointer", background: taskMode === "basic" ? "white" : "transparent", color: taskMode === "basic" ? "#2563eb" : "#64748b" }}
                  >
                    Basic Mission
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskMode("target")}
                    style={{ flex: 1, padding: "5px", border: "none", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "800", cursor: "pointer", background: taskMode === "target" ? "white" : "transparent", color: taskMode === "target" ? "#2563eb" : "#64748b" }}
                  >
                    Numeric Target
                  </button>
                </div>
              </div>

              {taskMode === "basic" ? (
                <div className="form-group">
                  <label style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "3px", display: "block", textTransform: "uppercase" }}>Task Category</label>
                  <select 
                    value={taskType} 
                    onChange={e => setTaskType(e.target.value)}
                    style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", outline: "none" }}
                  >
                    <option value="Lineup's">Lineup's</option>
                    <option value="Calling Target">Calling Target</option>
                    <option value="Assignments">Assignments</option>
                    <option value="Reports">Reports</option>
                    <option value="other">Other</option>
                  </select>
                  
                  {taskType === "other" && (
                    <motion.input 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="text" required placeholder="Enter custom task..."
                      value={customTask} onChange={e => setCustomTask(e.target.value)}
                      style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", marginTop: "4px", outline: "none" }}
                    />
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Target Metric Config</label>
                  {targets.map((target, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 28px", gap: "4px", alignItems: "end" }}>
                      <div>
                        {idx === 0 && <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 700 }}>METRIC</span>}
                        <select 
                          value={target.targetType} 
                          onChange={e => {
                            const updated = [...targets];
                            updated[idx].targetType = e.target.value;
                            setTargets(updated);
                          }}
                          style={{ width: "100%", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem", fontWeight: 700, outline: "none" }}
                        >
                          {role !== "tl" && <option value="clients">New Clients</option>}
                          {role !== "tl" && <option value="jobs">New Jobs</option>}
                          <option value="vendors">New Vendors</option>
                          <option value="interviews">Interviews Conducted</option>
                          <option value="selections">Selections Gained</option>
                          <option value="joined">Joined Candidates</option>
                          <option value="connected">Connected Candidates</option>
                          <option value="interested">Interested Candidates</option>
                        </select>
                      </div>
                      <div>
                        {idx === 0 && <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 700 }}>QTY</span>}
                        <input 
                          type="number" 
                          min="1" 
                          required 
                          value={target.targetQuantity} 
                          onChange={e => {
                            const updated = [...targets];
                            updated[idx].targetQuantity = e.target.value;
                            setTargets(updated);
                          }}
                          style={{ width: "100%", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem", fontWeight: 700, outline: "none" }}
                        />
                      </div>
                      {targets.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => setTargets(targets.filter((_, i) => i !== idx))}
                          style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2", borderRadius: "6px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        >
                          <LucideX size={12} />
                        </button>
                      ) : (
                        <div style={{ width: "28px" }} />
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTargets([...targets, { targetType: "interviews", targetQuantity: "10" }])}
                    style={{ padding: "4px 8px", background: "#f0f9ff", color: "#0ea5e9", border: "1px dashed #0ea5e9", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "3px" }}
                  >
                    <LucidePlus size={11} /> Add Target Metric
                  </button>
                </div>
              )}

              <div className="form-group">
                <label style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "3px", display: "block", textTransform: "uppercase" }}>Description / Directives</label>
                <textarea 
                  required placeholder="Enter daily mandate instructions..."
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", minHeight: "50px", color: "#0f172a", outline: "none", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <div className="form-group">
                  <label style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "3px", display: "block", textTransform: "uppercase" }}>Priority</label>
                  <select 
                    value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: "100%", padding: "5px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem", fontWeight: 700, outline: "none" }}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b", marginBottom: "3px", display: "block", textTransform: "uppercase" }}>Duration</label>
                  <select 
                    value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    style={{ width: "100%", padding: "5px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem", fontWeight: 700, outline: "none" }}
                  >
                    <option value="today">Today</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="this_year">This Year</option>
                    <option value="custom">Custom Range</option>
                    <option value="time_based">Time Deadline</option>
                  </select>
                </div>
              </div>

              {formData.duration === "custom" && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}
                >
                  <div>
                    <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800 }}>START</span>
                    <input 
                      type="date" required value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} 
                      style={{ width: "100%", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem" }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800 }}>END</span>
                    <input 
                      type="date" required value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} 
                      style={{ width: "100%", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem" }}
                    />
                  </div>
                </motion.div>
              )}

              {formData.duration === "time_based" && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  <span style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 800 }}>DEADLINE TIME</span>
                  <input 
                    type="time" required value={deadlineTime} onChange={e => setDeadlineTime(e.target.value)} 
                    style={{ width: "100%", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.72rem" }}
                  />
                </motion.div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                style={{ 
                  marginTop: "4px", 
                  padding: "8px", 
                  borderRadius: "6px", 
                  background: (formData.assigneeIds.length > 0 && isButtonHovered) ? "#10b981" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                  color: "white", 
                  fontSize: "0.75rem", 
                  fontWeight: 800, 
                  opacity: isSubmitting ? 0.6 : 1, 
                  border: "none", 
                  cursor: isSubmitting ? "not-allowed" : "pointer", 
                  boxShadow: "0 2px 6px rgba(59, 130, 246, 0.15)",
                  transition: "all 0.2s"
                }}
              >
                {isSubmitting ? <LucideLoader2 className="animate-spin" size={12} /> : "Send Mandate"}
              </button>
              
              {error && formData.assigneeIds.length === 0 && (
                <p style={{ color: "#ef4444", fontSize: "0.68rem", marginTop: "4px", fontWeight: 600, textAlign: "center" }}>
                   {error}
                </p>
              )}
              {error && <div style={{ padding: "4px 8px", background: "rgba(239, 68, 68, 0.05)", color: "#ef4444", borderRadius: "4px", fontSize: "0.68rem", display: "flex", alignItems: "center", gap: "3px" }}><LucideAlertCircle size={11} /> {error}</div>}
              {success && <div style={{ padding: "4px 8px", background: "rgba(16, 185, 129, 0.05)", color: "#10b981", borderRadius: "4px", fontSize: "0.68rem", display: "flex", alignItems: "center", gap: "3px" }}><LucideCheckCircle2 size={11} /> {success}</div>}
            </form>
          </div>

          {/* Selection Side - Smaller Rows */}
          {/* RIGHT: Select Team Members */}
          <div className="glass-card" style={{ padding: "10px 14px", background: "white", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
            <div className="flex-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <h3 style={{ fontSize: "0.8rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px", color: "#0f172a" }}><LucideUsers style={{ color: "#3b82f6" }} size={14} /> Recipient Target Nodes</h3>
              <div style={{ background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "4px", fontSize: "0.6rem", fontWeight: 800 }}>{formData.assigneeIds.length} SELECTED</div>
            </div>
            <div style={{ background: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", display: "flex", gap: "4px", marginBottom: "8px", alignItems: "center" }}>
              <LucideSearch size={14} color="#64748b" />
              <input 
                type="text" placeholder="Find by name or role..." 
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ border: "none", background: "none", outline: "none", width: "100%", fontSize: "0.75rem", color: "#0f172a" }}
              />
            </div>
            
            <div style={{ position: "relative" }}>
              <AnimatePresence>
                {error && formData.assigneeIds.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: "10px",
                      marginBottom: "6px",
                      zIndex: 10,
                      background: "white",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                      border: "1px solid #ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <div style={{ background: "#ef4444", color: "white", width: "14px", height: "14px", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 900 }}>!</div>
                    <span style={{ fontSize: "0.68rem", color: "#1e293b", fontWeight: 600 }}>Please select target recruiter</span>
                    <div style={{ position: "absolute", top: "100%", left: "15px", width: "0", height: "0", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #ef4444" }}></div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div 
                onClick={() => {
                  const areAllSelected = formData.assigneeIds.length === assignees.length && assignees.length > 0;
                  if (areAllSelected) {
                    setFormData({ ...formData, assigneeIds: [] });
                  } else {
                    setFormData({ ...formData, assigneeIds: assignees.map(a => a.id) });
                  }
                  if (error) setError(null);
                }}
                style={{ 
                  background: "linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)", 
                  color: "white", 
                  borderRadius: "6px", 
                  padding: "6px 10px", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  marginBottom: "6px", 
                  fontSize: "0.72rem", 
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                <span>Select All Active Team</span>
                <input 
                  type="checkbox" 
                  checked={formData.assigneeIds.length === assignees.length && assignees.length > 0} 
                  readOnly
                  style={{ width: "12px", height: "12px", accentColor: "#3b82f6" }} 
                />
              </div>
            </div>
            
            <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
              {roles.map(role => {
                const members = groupedAssignees[role] || [];
                if (members.length === 0) return null;

                const isExpanded = expandedRoles.includes(role);
                const roleIds = members.map(a => a.id);
                const allRoleSelected = roleIds.length > 0 && roleIds.every(id => formData.assigneeIds.includes(id));
                const someRoleSelected = roleIds.some(id => formData.assigneeIds.includes(id)) && !allRoleSelected;

                return (
                  <div key={role} style={{ border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "white" }}>
                    <div style={{ padding: "6px 8px", background: allRoleSelected ? "#f0f9ff" : "white", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderBottom: isExpanded ? "1px solid #cbd5e1" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }} onClick={() => toggleExpand(role)}>
                        {isExpanded ? <LucideChevronLeft size={12} style={{ transform: "rotate(-90deg)", color: "#3b82f6" }} /> : <LucideChevronLeft size={12} style={{ color: "#3b82f6" }} />}
                        <div style={{ width: "18px", height: "18px", borderRadius: "4px", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 800 }}>
                           {role[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "0.72rem", color: "#0f172a", textTransform: "uppercase" }}>{role === 'tl' ? 'Team Lead' : role}s <span style={{ color: "#64748b", fontWeight: 500 }}>({members.length})</span></span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                         {someRoleSelected && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6" }}></div>}
                         <input 
                           type="checkbox" 
                           checked={allRoleSelected} 
                           onChange={(e) => { e.stopPropagation(); handleToggleRole(role); }}
                           style={{ width: "12px", height: "12px", accentColor: "#3b82f6" }} 
                         />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ background: "#f8fafc", overflow: "hidden" }}
                        >
                          <div style={{ padding: "6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                            {members.map(a => (
                              <div key={a.id} onClick={() => handleToggleAssignee(a.id)} style={{ border: "1px solid #e2e8f0", borderRadius: "6px", padding: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", background: formData.assigneeIds.includes(a.id) ? "white" : "transparent" }}>
                                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                  <div style={{ width: "18px", height: "18px", borderRadius: "3px", background: "#f1f5f9", fontWeight: 800, fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}>{a.name[0]}</div>
                                  <div style={{ fontWeight: 600, fontSize: "0.68rem", color: "#0f172a" }}>{a.name}</div>
                                </div>
                                <input type="checkbox" checked={formData.assigneeIds.includes(a.id)} readOnly style={{ width: "10px", height: "10px", accentColor: "#3b82f6" }} />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : repositoryMode === "assigned_to_me" ? (
        <MyTasks hideHeader={true} />
      ) : (
        <>
          {/* Advanced Search & Filter Bar */}
          <div style={{ background: "white", padding: "6px 12px", borderRadius: "10px", border: "1.5px solid #e0f2fe", display: "flex", gap: "8px", marginBottom: "0.6rem", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
             <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", padding: "4px 10px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <LucideSearch size={14} color="#64748b" />
                <input 
                  type="text" placeholder="Search by task title or description..." 
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  style={{ border: "none", background: "none", outline: "none", width: "100%", fontSize: "0.75rem", color: "#1e293b" }}
                />
             </div>
             
             <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                   <select 
                     value={priorityFilter}
                     onChange={(e) => setPriorityFilter(e.target.value)}
                     style={{ padding: "4px 20px 4px 8px", borderRadius: "6px", background: "#f8fafc", border: "1px solid #f1f5f9", fontSize: "0.72rem", fontWeight: "750", color: "#475569", cursor: "pointer", appearance: "none" }}
                   >
                     <option value="all">Priority</option>
                     <option value="urgent">Urgent</option>
                     <option value="high">High</option>
                     <option value="medium">Medium</option>
                     <option value="low">Low Priority</option>
                   </select>
                   <LucideAlertCircle size={10} style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                </div>

                <div style={{ position: "relative" }}>
                   <select 
                     value={taskCategoryFilter}
                     onChange={(e) => setTaskCategoryFilter(e.target.value)}
                     style={{ padding: "4px 20px 4px 8px", borderRadius: "6px", background: "#f8fafc", border: "1px solid #f1f5f9", fontSize: "0.72rem", fontWeight: "750", color: "#475569", cursor: "pointer", appearance: "none" }}
                   >
                     <option value="all">Task Category</option>
                     <option value="Lineup's">Lineup's</option>
                     <option value="Calling Target">Calling Target</option>
                     <option value="Assigments">Assigments</option>
                     <option value="Reports">Reports</option>
                     <option value="Other">Other Tasks</option>
                   </select>
                   <LucideClipboardList size={10} style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                </div>

                <div style={{ position: "relative" }}>
                   <select 
                     value={durationFilter}
                     onChange={(e) => setDurationFilter(e.target.value)}
                     style={{ padding: "4px 20px 4px 8px", borderRadius: "6px", background: "#f8fafc", border: "1px solid #f1f5f9", fontSize: "0.72rem", fontWeight: "750", color: "#475569", cursor: "pointer", appearance: "none" }}
                   >
                     <option value="all">Time Period</option>
                     <option value="today">Today</option>
                     <option value="this_week">This Week</option>
                     <option value="this_month">This Month</option>
                     <option value="this_year">This Year</option>
                   </select>
                   <LucideFilter size={10} style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                </div>

                 {repositoryMode === "assigned_by_me" && (
                   <div style={{ position: "relative" }}>
                     <button 
                       onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                       style={{ padding: "4px 8px", borderRadius: "6px", background: "#f8fafc", border: "1px solid #f1f5f9", fontSize: "0.72rem", fontWeight: "750", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                     >
                       <LucideUsers size={12} /> 
                       {assigneeFilterList.length === 0 ? "Assignee / Role" : `${assigneeFilterList.length} Selected`}
                     </button>
                     
                     <AnimatePresence>
                        {showAssigneePicker && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            style={{ position: "absolute", right: 0, top: "100%", marginTop: "4px", background: "white", borderRadius: "10px", border: "1.5px solid #e0f2fe", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", zIndex: 100, width: "200px", maxHeight: "300px", overflowY: "auto", padding: "8px" }}
                          >
                             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
                                <span style={{ fontSize: "0.68rem", fontWeight: "800", color: "#0369a1" }}>FILTERS</span>
                                <div style={{ display: "flex", gap: "8px" }}>
                                   <button onClick={handleSelectAllFilters} style={{ border: "none", background: "none", fontSize: "0.65rem", color: "#10b981", fontWeight: "700", cursor: "pointer" }}>All</button>
                                   <button onClick={() => setAssigneeFilterList([])} style={{ border: "none", background: "none", fontSize: "0.65rem", color: "#ef4444", fontWeight: "700", cursor: "pointer" }}>Reset</button>
                                </div>
                             </div>
                             
                             {roles.map(role => {
                                const roleKey = `role_${role}`;
                                const isRoleSelected = assigneeFilterList.includes(roleKey);
                                const isExpanded = expandedFilterRoles.includes(role);
                                return (
                                  <div key={role} style={{ marginBottom: "8px" }}>
                                     <div 
                                       style={{ display: "flex", alignItems: "center", gap: "6px", background: isRoleSelected ? "#f0f9ff" : "transparent", padding: "4px 6px", borderRadius: "6px", marginBottom: "3px" }}
                                     >
                                        <input 
                                          type="checkbox" 
                                          checked={isRoleSelected} 
                                          onChange={(e) => { e.stopPropagation(); handleToggleRoleFilter(role); }}
                                          style={{ accentColor: "#0ea5e9", cursor: "pointer", width: "11px", height: "11px" }} 
                                        />
                                        <div 
                                          onClick={() => toggleExpandFilterRole(role)}
                                          style={{ flex: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                                        >
                                           <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#1e293b", textTransform: "capitalize" }}>{role}s</span>
                                           <LucideChevronLeft size={11} style={{ transform: isExpanded ? "rotate(-90deg)" : "rotate(0deg)", color: "#94a3b8", transition: "transform 0.2s" }} />
                                        </div>
                                     </div>
                                     
                                     <AnimatePresence>
                                       {isExpanded && (
                                         <motion.div 
                                           initial={{ height: 0, opacity: 0 }}
                                           animate={{ height: "auto", opacity: 1 }}
                                           exit={{ height: 0, opacity: 0 }}
                                           style={{ overflow: "hidden" }}
                                         >
                                           <div style={{ marginLeft: "20px", display: "flex", flexDirection: "column", gap: "4px", paddingTop: "2px" }}>
                                              {assignees.filter(a => a.role.toLowerCase() === role).map(a => {
                                                 const idKey = `id_${a.id}`;
                                                 const isAgentSelected = assigneeFilterList.includes(idKey);
                                                 return (
                                                    <div 
                                                       key={a.id} 
                                                       onClick={(e) => { e.stopPropagation(); handleToggleAssigneeFilter(idKey); }}
                                                       style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                                                    >
                                                       <input type="checkbox" checked={isAgentSelected} readOnly style={{ accentColor: "#0ea5e9", width: "10px", height: "10px" }} />
                                                       <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: "600" }}>{a.name}</span>
                                                    </div>
                                                 );
                                              })}
                                           </div>
                                         </motion.div>
                                       )}
                                     </AnimatePresence>
                                  </div>
                                );
                             })}
                          </motion.div>
                        )}
                     </AnimatePresence>
                   </div>
                 )}
             </div>
          </div>

          {/* Table Implementation */}
          <div style={{ background: "white", borderRadius: "8px", border: "1px solid #cbd5e1", overflow: "hidden", boxShadow: "0 4px 15px -5px rgba(0,0,0,0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "linear-gradient(90deg, #0369a1 0%, #0ea5e9 100%)", height: "32px" }}>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Task</th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Priority</th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Description</th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Schedule</th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>
                    {repositoryMode === "assigned_by_me" ? "Assign To" : "Assigned By"}
                  </th>
                  <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredHistory = history.filter(task => {
                    const matchesSearch = 
                      task.title.toLowerCase().includes(historySearchTerm.toLowerCase()) || 
                      task.description.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                      task.assignees?.some((a: any) => a.name.toLowerCase().includes(historySearchTerm.toLowerCase()));
                    
                    const matchesDuration = durationFilter === 'all' || task.duration === durationFilter;
                    
                    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

                    const matchesCategory = taskCategoryFilter === 'all' || (
                      taskCategoryFilter === 'Other' 
                      ? !["Lineup's", "Calling Target", "Assigments", "Reports"].includes(task.title)
                      : task.title === taskCategoryFilter
                    );

                    let matchesRole = true;
                    if (assigneeFilterList.length > 0) {
                      matchesRole = task.assignees?.some((a: any) => {
                         const roleKey = `role_${a.role?.toLowerCase()}`;
                         const idKey = `id_${a.id}`;
                         return assigneeFilterList.includes(roleKey) || assigneeFilterList.includes(idKey);
                      });
                    }

                    return matchesSearch && matchesDuration && matchesRole && matchesPriority && matchesCategory;
                  });

                  if (filteredHistory.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>No matching tasks found.</td>
                      </tr>
                    );
                  }

                  return filteredHistory.map((task, index) => {
                    const taskId = task.ids?.[0] || task.id;
                    const assigneesList = task.assignees || (task.assignee ? [task.assignee] : []);
                    return (
                      <tr key={taskId} style={{ borderBottom: index === filteredHistory.length - 1 ? "none" : "1px solid #f1f5f9", transition: "background 0.2s" }}>
                        <td style={{ padding: "6px 10px" }}>
                          <span style={{ fontWeight: "800", color: "#000000", fontSize: "0.75rem" }}>{task.title}</span>
                        </td>
                        <td style={{ padding: "6px 10px" }}>
                          <div style={{ 
                             display: "inline-flex", padding: "2px 6px", borderRadius: "4px", fontSize: "0.62rem", fontWeight: 900, textTransform: "uppercase",
                             background: task.priority === 'urgent' ? '#fef2f2' : task.priority === 'critical' ? '#faf5ff' : task.priority === 'high' ? '#fffbeb' : task.priority === 'medium' ? '#f0f9ff' : '#f0fdf4',
                             color: task.priority === 'urgent' ? '#ef4444' : task.priority === 'critical' ? '#7c3aed' : task.priority === 'high' ? '#f59e0b' : task.priority === 'medium' ? '#0ea5e9' : '#10b981',
                             border: `1px solid ${task.priority === 'urgent' ? '#fee2e2' : task.priority === 'critical' ? '#e9d5ff' : task.priority === 'high' ? '#fef3c7' : task.priority === 'medium' ? '#e0f2fe' : '#dcfce7'}`
                          }}>
                             {task.priority || 'MEDIUM'}
                          </div>
                        </td>
                        <td style={{ padding: "6px 10px", maxWidth: "180px" }}>
                          <p style={{ margin: 0, fontSize: "0.72rem", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {task.description}
                          </p>
                        </td>
                        <td style={{ padding: "6px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#0ea5e9", fontSize: "0.7rem", fontWeight: "800" }}>
                             <LucideClock size={12} /> {task.duration?.toUpperCase().replace('_', ' ') || 'TODAY'}
                          </div>
                        </td>
                        <td style={{ padding: "6px 10px" }}>
                           <div style={{ display: "flex", flexDirection: "column" }}>
                              {repositoryMode === "assigned_by_me" ? (
                                <>
                                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#0369a1" }}>{assigneesList.length} Agents</span>
                                  <span style={{ fontSize: "0.58rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>{assigneesList[0]?.role || 'Team'} Deployed</span>
                                </>
                              ) : (
                                <>
                                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#0369a1" }}>
                                    {task.assigner?.role === 'boss' ? 'Boss' : `${task.assigner?.role === 'tl' ? 'TL' : (task.assigner?.role === 'manager' ? 'Manager' : task.assigner?.role || 'System')}: ${task.assigner?.name || 'System'}`}
                                  </span>
                                  <span style={{ fontSize: "0.58rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>Command Origin</span>
                                </>
                              )}
                           </div>
                        </td>
                        <td style={{ padding: "4px 10px" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            <button 
                              onClick={() => setInspectingTask({ ...task, assignees: assigneesList })}
                              style={{ background: "#f0f9ff", color: "#0ea5e9", border: "none", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
                            >
                              <LucideEye size={12} />
                            </button>
                            <button 
                              onClick={() => handleBatchDelete(task.ids || [task.id])}
                              disabled={isDeleting?.includes(taskId)}
                              style={{ background: "#fef2f2", color: "#ef4444", border: "none", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
                            >
                              {isDeleting?.includes(taskId) ? <LucideLoader2 size={12} className="animate-spin" /> : <LucideTrash2 size={12} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MISSION INSPECTOR MODAL */}
      <AnimatePresence>
        {inspectingTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px"
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: "white",
                width: "100%",
                maxWidth: "340px",
                borderRadius: "12px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
                overflow: "hidden"
              }}
            >
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #e0f2fe", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)", color: "white" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", letterSpacing: "-0.3px" }}>Task Recipients</h3>
                    <p style={{ margin: 0, fontSize: "0.58rem", opacity: 0.9, textTransform: "uppercase", fontWeight: 700 }}>Participant Node Overview</p>
                </div>
                <button onClick={() => setInspectingTask(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", color: "white", width: "22px", height: "22px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                  <LucideX size={12} />
                </button>
              </div>
              
              <div style={{ padding: "10px 14px", maxHeight: "300px", overflowY: "auto", background: "white" }}>
                <div style={{ marginBottom: "10px", background: "#f0f9ff", padding: "10px", borderRadius: "8px", border: "1.5px solid #e0f2fe" }}>
                  <p style={{ margin: 0, fontSize: "0.6rem", color: "#0ea5e9", fontWeight: "800", textTransform: "uppercase" }}>Current Task</p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.9rem", fontWeight: "900", color: "#0369a1", letterSpacing: "-0.3px" }}>{inspectingTask.title}</p>
                  <p style={{ margin: "6px 0 0", fontSize: "0.72rem", color: "#475569", lineHeight: 1.4, fontWeight: 500 }}>{inspectingTask.description}</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <p style={{ margin: 0, fontSize: "0.68rem", color: "#000000", fontWeight: "900", letterSpacing: "0.5px" }}>ASSIGNED TEAM ({inspectingTask.assignees.length})</p>
                  {inspectingTask.assignees.map((a: any) => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: "white", borderRadius: "8px", border: "1.5px solid #f1f5f9", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                      <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "linear-gradient(135deg, #e0f2fe 0%, #38bdf820 100%)", color: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "900" }}>
                        {a.name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "800", color: "#000000" }}>{a.name}</p>
                        <p style={{ margin: 0, fontSize: "0.6rem", color: "#0ea5e9", fontWeight: "800" }}>{a.role.toUpperCase()}</p>
                      </div>
                      <div style={{ padding: "2px 6px", background: "#ecfdf5", color: "#10b981", borderRadius: "4px", fontSize: "0.58rem", fontWeight: "900", border: "1px solid #10b98120" }}>
                         {inspectingTask.status?.toUpperCase() || "ACTIVE"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "10px 14px", background: "#f8fafc", textAlign: "center", borderTop: "1px solid #f1f5f9" }}>
                 <button 
                  onClick={() => setInspectingTask(null)}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", border: "none", fontWeight: "900", fontSize: "0.75rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}
                 >
                   CLOSE INSPECTOR
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
