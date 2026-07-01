import React, { useState, useEffect } from "react";
import { 
  LucideCalendar, LucideClock, LucidePlus, LucideCheckCircle2, 
  LucideXCircle, LucideAlertCircle, LucideListTodo, LucideTrendingUp, 
  LucideBarChart2, LucideFilter, LucideSearch, LucidePlay, LucidePause, 
  LucideActivity, LucidePieChart, LucideBell, LucideTag, LucidePaperclip, 
  LucideTrash2, LucideEdit3, LucideLoader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types & Constants ---
type Priority = "Low" | "Medium" | "High" | "Urgent";
type Status = "Pending" | "Completed" | "Skipped" | "In Progress";
type Category = "Interview Follow-up" | "Candidate Call" | "Client Follow-up" | "Joining Follow-up" | "Meeting" | "Daily Target" | "Urgent Task" | "Personal Office Work" | "Pending Callback" | "Documentation";
type RepeatType = "None" | "Daily" | "Weekly" | "Monthly" | "Custom";

interface TimelineEvent {
  id: string;
  action: string;
  timestamp: number;
  details?: string;
}

interface ToDoTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  date: string; 
  time: string; 
  reminderTime: string; 
  repeatType: RepeatType;
  status: Status;
  category: Category;
  notes: string;
  tags: string[];
  history: TimelineEvent[];
  snoozedUntil?: number | null;
  createdAt: number;
  completedAt?: number | null;
}

const STORAGE_KEY = "givyansh_todo_tasks_v1";

const PRIORITY_COLORS = {
  Low: { bg: "#f8fafc", text: "#475569", border: "#cbd5e1", indicator: "#64748b" },
  Medium: { bg: "#fffbeb", text: "#b45309", border: "#fef3c7", indicator: "#d97706" },
  High: { bg: "#faf5ff", text: "#6b21a8", border: "#f3e8ff", indicator: "#7c3aed" },
  Urgent: { bg: "#fff5f5", text: "#991b1b", border: "#fee2e2", indicator: "#ef4444" }
};

const CATEGORIES: Category[] = [
  "Interview Follow-up", "Candidate Call", "Client Follow-up", 
  "Joining Follow-up", "Meeting", "Daily Target", "Urgent Task", 
  "Personal Office Work", "Pending Callback", "Documentation"
];

// --- Main Component ---
export default function MyToDoList() {
  const [tasks, setTasks] = useState<ToDoTask[]>([]);
  const [view, setView] = useState<"dashboard" | "list" | "analytics">("dashboard");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ToDoTask | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterDate, setFilterDate] = useState<string>("All");

  // Reminders
  const [activeReminder, setActiveReminder] = useState<ToDoTask | null>(null);

  // Dynamic user scoping to prevent data syncing across different portals
  const [userId, setUserId] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        if (data && data.id) {
          setUserId(String(data.id));
        } else {
          setUserId("default");
        }
      })
      .catch(() => {
        setUserId("default");
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, []);

  // Load Data
  useEffect(() => {
    if (loadingUser || !userId) return;
    const key = `givyansh_todo_tasks_v1_user_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      // By default, start with an empty list so different portals don't show the same seeded task
      const seed: ToDoTask[] = [];
      setTasks(seed);
      try {
        localStorage.setItem(key, JSON.stringify(seed));
      } catch (e) {
        console.error("Failed to save seed tasks to localStorage:", e);
      }
    }
  }, [userId, loadingUser]);

  const saveTasks = (newTasks: ToDoTask[]) => {
    setTasks(newTasks);
    const key = `givyansh_todo_tasks_v1_user_${userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(newTasks));
    } catch (e) {
      console.error("Failed to save tasks to localStorage:", e);
    }
  };

  // --- Reminder Engine ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeReminder) return; 
      
      const now = new Date();
      const nowTimeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
      const nowDateStr = now.toISOString().split('T')[0];
      const nowTs = now.getTime();

      const dueTask = tasks.find(t => {
        if (t.status === "Completed" || t.status === "Skipped") return false;

        if (t.snoozedUntil && t.snoozedUntil <= nowTs) return true;
        if (t.snoozedUntil && t.snoozedUntil > nowTs) return false;

        if (t.date === nowDateStr) {
          if (t.reminderTime && t.reminderTime === nowTimeStr) return true;
          if (!t.reminderTime && t.time === nowTimeStr) return true;
        }
        return false;
      });

      if (dueTask) {
        const lastTrigger = dueTask.history.find(h => h.action === "Reminder Triggered");
        if (lastTrigger && nowTs - lastTrigger.timestamp < 60000) return;

        logHistory(dueTask.id, "Reminder Triggered", "System popup shown");
        setActiveReminder(dueTask);
      }
    }, 10000); 
    return () => clearInterval(interval);
  }, [tasks, activeReminder]);

  const logHistory = (taskId: string, action: string, details?: string) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId) {
          return { ...t, history: [{ id: Date.now().toString(), action, timestamp: Date.now(), details }, ...t.history] };
        }
        return t;
      });
      const key = `givyansh_todo_tasks_v1_user_${userId}`;
      try {
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to update tasks history in localStorage:", e);
      }
      return updated;
    });
  };

  const handleReminderAction = (action: string, value?: any) => {
    if (!activeReminder) return;
    const tId = activeReminder.id;
    let updatedTasks = [...tasks];
    const taskIdx = updatedTasks.findIndex(t => t.id === tId);
    if (taskIdx === -1) return setActiveReminder(null);

    const task = updatedTasks[taskIdx];

    if (action === "Complete") {
      task.status = "Completed";
      task.completedAt = Date.now();
      task.snoozedUntil = null;
      task.history.unshift({ id: Date.now().toString(), action: "Completed via Popup", timestamp: Date.now() });
    } else if (action === "Snooze") {
      task.snoozedUntil = Date.now() + (value * 60000);
      task.history.unshift({ id: Date.now().toString(), action: `Snoozed for ${value}m`, timestamp: Date.now() });
    } else if (action === "Skip") {
      task.status = "Skipped";
      task.snoozedUntil = null;
      task.history.unshift({ id: Date.now().toString(), action: "Skipped", timestamp: Date.now() });
    } else if (action === "Reschedule") {
      setEditingTask(task);
      setIsFormOpen(true);
    }

    updatedTasks[taskIdx] = task;
    saveTasks(updatedTasks);
    setActiveReminder(null);
  };

  const updateTaskStatus = (id: string, status: Status) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          status, 
          completedAt: status === "Completed" ? Date.now() : t.completedAt,
          history: [{ id: Date.now().toString(), action: `Marked as ${status}`, timestamp: Date.now() }, ...t.history] 
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    if (confirm("Delete this task permanently?")) {
      saveTasks(tasks.filter(t => t.id !== id));
    }
  };

  // --- Filtering Logic ---
  const filteredTasks = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    if (filterCategory !== "All" && t.category !== filterCategory) return false;
    
    if (filterDate !== "All") {
      const tDate = new Date(t.date);
      const now = new Date();
      if (filterDate === "Today" && tDate.toDateString() !== now.toDateString()) return false;
      if (filterDate === "Tomorrow") {
        const tmrw = new Date(); tmrw.setDate(now.getDate() + 1);
        if (tDate.toDateString() !== tmrw.toDateString()) return false;
      }
      if (filterDate === "Overdue" && t.status !== "Completed" && t.status !== "Skipped") {
        if (tDate < new Date(now.toDateString())) return true;
        return false;
      } else if (filterDate === "Overdue") return false;
    }
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const sMap: any = { "In Progress": 1, "Pending": 2, "Completed": 3, "Skipped": 4 };
    if (sMap[a.status] !== sMap[b.status]) return sMap[a.status] - sMap[b.status];
    return new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime();
  });

  if (loadingUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Registry...</span>
      </div>
    );
  }

  return (
    <div className="todo-container">
      
      <style>{`
        .todo-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #f1f5f9;
          padding: 1rem;
          color: #1e293b;
          min-height: 100%;
          font-size: 0.8rem;
        }

        .todo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #cbd5e1;
          padding: 0.75rem 1rem;
          margin-bottom: 0.75rem;
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
        }

        .todo-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .todo-card:hover {
          border-color: #94a3b8;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .todo-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          text-transform: uppercase;
        }

        .todo-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
          outline: none;
        }

        .todo-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #1e293b;
        }

        .todo-btn-primary {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
        }

        .todo-btn-primary:hover {
          background: #1d4ed8;
          border-color: #1d4ed8;
          color: #ffffff;
        }

        .todo-input-mini {
          padding: 4px 8px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.75rem;
          outline: none;
          color: #334155;
          font-weight: 600;
          background: #ffffff;
        }

        .todo-input-mini:focus {
          border-color: #2563eb;
        }

        .todo-grid-dashboard {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 0.75rem;
        }

        @media (max-width: 1024px) {
          .todo-grid-dashboard {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="todo-header">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>My To Do </span>
            <span style={{ color: "#2563eb" }}>List</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>
            Organize, prioritize, and track your daily tasks and operational goals.
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
           <button onClick={() => setView("dashboard")} className="todo-btn" style={{ background: view === "dashboard" ? "#e2e8f0" : "white" }}><LucidePieChart size={13} /> Dashboard</button>
           <button onClick={() => setView("list")} className="todo-btn" style={{ background: view === "list" ? "#e2e8f0" : "white" }}><LucideListTodo size={13} /> Tasks</button>
           <button onClick={() => setView("analytics")} className="todo-btn" style={{ background: view === "analytics" ? "#e2e8f0" : "white" }}><LucideBarChart2 size={13} /> Analytics</button>
           <button onClick={() => { setEditingTask(null); setIsFormOpen(true); }} className="todo-btn todo-btn-primary"><LucidePlus size={13} /> New Task</button>
        </div>
      </div>

      {/* POPUP REMINDER */}
      <AnimatePresence>
        {activeReminder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              style={{ background: "white", width: "420px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", border: "1px solid #cbd5e1" }}
            >
              <div style={{ background: PRIORITY_COLORS[activeReminder.priority].bg, padding: "16px", borderBottom: `1px solid ${PRIORITY_COLORS[activeReminder.priority].border}` }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: PRIORITY_COLORS[activeReminder.priority].text, fontWeight: 800, fontSize: "0.68rem" }}>
                      <LucideBell size={14} /> {activeReminder.priority} PRIORITY REMINDER
                    </div>
                    <span style={{ fontSize: "1rem", fontWeight: 900, color: "#1e293b" }}>{activeReminder.time}</span>
                 </div>
                 <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginTop: "8px", marginBottom: "4px" }}>{activeReminder.title}</h3>
                 <p style={{ color: "#475569", fontSize: "0.75rem", lineHeight: 1.4, margin: 0 }}>{activeReminder.description || "No description provided."}</p>
                 {activeReminder.notes && (
                   <div style={{ background: "white", padding: "8px 10px", borderRadius: "6px", marginTop: "8px", fontSize: "0.72rem", color: "#64748b", fontStyle: "italic", border: "1px solid #e2e8f0" }}>
                     "{activeReminder.notes}"
                   </div>
                 )}
              </div>
              <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                 <button onClick={() => handleReminderAction("Complete")} style={{ background: "#10b981", color: "white", border: "none", padding: "10px", borderRadius: "8px", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                   <LucideCheckCircle2 size={14} /> Mark as Complete
                 </button>
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                   <button onClick={() => handleReminderAction("Snooze", 5)} className="todo-btn" style={{ padding: "6px" }}>Snooze 5m</button>
                   <button onClick={() => handleReminderAction("Snooze", 15)} className="todo-btn" style={{ padding: "6px" }}>Snooze 15m</button>
                   <button onClick={() => handleReminderAction("Snooze", 60)} className="todo-btn" style={{ padding: "6px" }}>Snooze 1h</button>
                 </div>
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                   <button onClick={() => handleReminderAction("Reschedule")} className="todo-btn" style={{ borderColor: "#bfdbfe", color: "#2563eb" }}>Reschedule</button>
                   <button onClick={() => handleReminderAction("Skip")} className="todo-btn" style={{ borderColor: "#fecaca", color: "#dc2626" }}>Skip for Now</button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW/EDIT TASK MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} transition={{ type: "spring", damping: 25 }}
              style={{ background: "white", width: "500px", height: "100%", padding: "2rem", overflowY: "auto", boxShadow: "-10px 0 30px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "12px", borderLeft: "1px solid #cbd5e1" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>{editingTask ? "Edit Task Info" : "Create New Workspace Task"}</h3>
                <button onClick={() => setIsFormOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><LucideXCircle size={18} /></button>
              </div>
              
              {editingTask && editingTask.history && (
                <div style={{ padding: "8px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.72rem" }}>
                  <div style={{ fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase", fontSize: "0.62rem" }}>Activity Timeline</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "100px", overflowY: "auto" }}>
                    {editingTask.history.map((h, i) => (
                      <div key={h.id} style={{ display: "flex", gap: "8px" }}>
                         <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: i === 0 ? "#2563eb" : "#cbd5e1", marginTop: "4px" }} />
                            {i !== editingTask.history.length - 1 && <div style={{ width: "1px", height: "100%", background: "#e2e8f0", marginTop: "2px" }} />}
                         </div>
                         <div>
                            <div style={{ fontWeight: 700, color: i === 0 ? "#0f172a" : "#475569" }}>{h.action}</div>
                            <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{new Date(h.timestamp).toLocaleString()}</div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <TaskForm 
                existingTask={editingTask} 
                onSave={(taskData: any) => {
                  if (editingTask) {
                    saveTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData, history: [{ id: Date.now().toString(), action: "Task Updated", timestamp: Date.now() }, ...t.history] } : t));
                  } else {
                    const newTask: ToDoTask = {
                      ...taskData,
                      id: "T-" + Date.now(),
                      status: "Pending",
                      history: [{ id: Date.now().toString(), action: "Task Created", timestamp: Date.now() }],
                      createdAt: Date.now()
                    };
                    saveTasks([newTask, ...tasks]);
                  }
                  setIsFormOpen(false);
                }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEWS */}
      {view === "dashboard" && (
        <DashboardView 
          tasks={tasks} 
          onUpdate={updateTaskStatus}
          onDelete={deleteTask}
          onEdit={(t: any) => { setEditingTask(t); setIsFormOpen(true); }}
          onQuickAction={(t: any) => { setEditingTask(t); setIsFormOpen(true); }} 
        />
      )}
      
      {view === "list" && (
        <div className="todo-card" style={{ padding: "0.75rem 1rem" }}>
           {/* Filters Bar */}
           <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap", padding: "8px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <div style={{ flex: 1, minWidth: "160px", position: "relative" }}>
                 <LucideSearch size={12} color="#94a3b8" style={{ position: "absolute", left: "8px", top: "7px" }} />
                 <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="todo-input-mini" style={{ width: "100%", paddingLeft: "24px" }} />
              </div>
              <select value={filterDate} onChange={e => setFilterDate(e.target.value)} className="todo-input-mini" style={{ cursor: "pointer" }}>
                 <option value="All">All Dates</option>
                 <option value="Today">Today</option>
                 <option value="Tomorrow">Tomorrow</option>
                 <option value="Overdue">Overdue</option>
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="todo-input-mini" style={{ cursor: "pointer" }}>
                 <option value="All">All Priorities</option>
                 <option value="Low">Low</option>
                 <option value="Medium">Medium</option>
                 <option value="High">High</option>
                 <option value="Urgent">Urgent</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="todo-input-mini" style={{ cursor: "pointer" }}>
                 <option value="All">All Statuses</option>
                 <option value="Pending">Pending</option>
                 <option value="In Progress">In Progress</option>
                 <option value="Completed">Completed</option>
              </select>
           </div>

           {/* List */}
           <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
             {sortedTasks.length === 0 ? (
               <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #e2e8f0" }}>No tasks match your filters.</div>
             ) : sortedTasks.map(t => (
               <TaskRow key={t.id} task={t} onUpdate={updateTaskStatus} onDelete={deleteTask} onEdit={() => { setEditingTask(t); setIsFormOpen(true); }} />
             ))}
           </div>
        </div>
      )}
      
      {view === "analytics" && <AnalyticsView tasks={tasks} />}
    </div>
  );
}

// --- Sub Components ---

const TaskRow = ({ task, onUpdate, onDelete, onEdit }: { task: ToDoTask, onUpdate: any, onDelete: any, onEdit: any }) => {
  const isOverdue = task.status !== "Completed" && task.status !== "Skipped" && new Date(task.date) < new Date(new Date().toDateString());
  const pri = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium;

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "10px", 
      padding: "8px 12px", 
      borderRadius: "8px", 
      border: "1px solid #e2e8f0", 
      background: task.status === "Completed" ? "#f8fafc" : "white", 
      transition: "all 0.15s ease", 
      opacity: task.status === "Completed" ? 0.65 : 1,
      borderLeft: `3.5px solid ${pri.indicator}`
    }}>
       <button onClick={() => onUpdate(task.id, task.status === "Completed" ? "Pending" : "Completed")} style={{ background: "none", border: "none", cursor: "pointer", color: task.status === "Completed" ? "#10b981" : "#cbd5e1", display: "flex", padding: 0 }}>
         <LucideCheckCircle2 size={18} />
       </button>
       
       <div style={{ flex: 1, textDecoration: task.status === "Completed" ? "line-through" : "none" }}>
         <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
           <strong style={{ fontSize: "0.82rem", color: "#1e293b" }}>{task.title}</strong>
           {isOverdue && <span style={{ fontSize: "0.55rem", background: "#fee2e2", color: "#dc2626", padding: "1px 4px", borderRadius: "3px", fontWeight: 800 }}>OVERDUE</span>}
           <span style={{ 
             fontSize: "0.55rem", 
             background: pri.bg, 
             color: pri.text, 
             border: `1px solid ${pri.border}`, 
             padding: "1px 4px", 
             borderRadius: "3px", 
             fontWeight: 800 
           }}>{task.priority}</span>
         </div>
         <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.68rem", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><LucideCalendar size={11} /> {task.date}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><LucideClock size={11} /> {task.time}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><LucideTag size={11} /> {task.category}</span>
         </div>
       </div>
       
       <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {task.status !== "Completed" && (
            <button onClick={() => onUpdate(task.id, task.status === "In Progress" ? "Pending" : "In Progress")} className="todo-btn" style={{ padding: "4px" }} title="Toggle Status">
              {task.status === "In Progress" ? <LucidePause size={12} color="#b45309" /> : <LucidePlay size={12} color="#059669" />}
            </button>
          )}
          <button onClick={onEdit} className="todo-btn" style={{ padding: "4px" }}><LucideEdit3 size={12} /></button>
          <button onClick={() => onDelete(task.id)} className="todo-btn" style={{ padding: "4px", borderColor: "#fecaca" }}><LucideTrash2 size={12} color="#dc2626" /></button>
       </div>
    </div>
  );
};

const DashboardView = ({ tasks, onQuickAction, onUpdate, onDelete, onEdit }: any) => {
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t: any) => t.date === today);
  const completedToday = todayTasks.filter((t: any) => t.status === "Completed").length;
  const progress = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;
  
  const pendingUrgent = tasks.filter((t: any) => t.priority === "Urgent" && t.status !== "Completed");
  const overdueTasks = tasks.filter((t: any) => t.status !== "Completed" && new Date(t.date) < new Date(today));

  // Get all tasks that are not completed (Pending, In Progress)
  const pendingTasks = tasks.filter((t: any) => t.status !== "Completed" && t.status !== "Skipped");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div className="todo-grid-dashboard">
         <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Progress Card */}
            <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "12px", padding: "1rem", color: "white", position: "relative", overflow: "hidden", border: "1px solid #1e293b" }}>
               <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 4px 0", color: "#f8fafc" }}>Daily Target Tracker</h3>
               <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: "0 0 12px 0" }}>Completed {completedToday} out of {todayTasks.length} tasks scheduled for today.</p>
               
               <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", fontSize: "0.72rem" }}>
                     <span style={{ fontWeight: 700, color: "#e2e8f0" }}>Workspace Target Completion</span>
                     <strong style={{ fontWeight: 800, color: "#10b981" }}>{progress}%</strong>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.3)", borderRadius: "4px", overflow: "hidden" }}>
                     <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)", borderRadius: "4px", transition: "width 0.5s ease-out" }} />
                  </div>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
               <div className="todo-card" style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px 12px" }}>
                 <div style={{ color: "#ef4444", background: "#fde8e8", width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideAlertCircle size={14} /></div>
                 <div>
                   <strong style={{ fontSize: "1.1rem", color: "#0f172a", display: "block" }}>{pendingUrgent.length}</strong>
                   <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b" }}>Pending Urgent</span>
                 </div>
               </div>
               <div className="todo-card" style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px 12px" }}>
                 <div style={{ color: "#d97706", background: "#fef3c7", width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideClock size={14} /></div>
                 <div>
                   <strong style={{ fontSize: "1.1rem", color: "#0f172a", display: "block" }}>{overdueTasks.length}</strong>
                   <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b" }}>Overdue Tasks</span>
                 </div>
               </div>
               <div className="todo-card" style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px 12px" }}>
                 <div style={{ color: "#2563eb", background: "#dbeafe", width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideActivity size={14} /></div>
                 <div>
                   <strong style={{ fontSize: "1.1rem", color: "#0f172a", display: "block" }}>{tasks.filter((t:any) => t.status==="Completed").length}</strong>
                   <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b" }}>Completed All</span>
                 </div>
               </div>
            </div>
         </div>

         {/* Sidebar */}
         <div className="todo-card" style={{ display: "flex", flexDirection: "column", padding: "10px 12px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 8px 0", paddingBottom: "4px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "4px", color: "#1f2937" }}>
              <LucideCalendar size={14} color="#2563eb" /> Today's Focus
            </h3>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", maxHeight: "140px" }}>
              {todayTasks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "12px 0", color: "#94a3b8", fontSize: "0.72rem" }}>No tasks today.</div>
              ) : (
                todayTasks.filter((t:any) => t.status !== "Completed").map((t: any) => {
                  const pri = PRIORITY_COLORS[t.priority as Priority] || PRIORITY_COLORS.Medium;
                  return (
                    <div key={t.id} onClick={() => onQuickAction(t)} style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `3px solid ${pri.indicator}` }}>
                       <div>
                         <strong style={{ fontSize: "0.75rem", color: "#1e293b", display: "block" }}>{t.title}</strong>
                         <span style={{ fontSize: "0.62rem", color: "#64748b" }}>{t.time}</span>
                       </div>
                       <span style={{ fontSize: "0.58rem", fontWeight: 800, color: pri.text, textTransform: "uppercase" }}>{t.priority}</span>
                    </div>
                  );
                })
              )}
            </div>
         </div>
      </div>

      {/* Bottom section for pending tasks */}
      <div className="todo-card" style={{ padding: "0.75rem 1rem", marginTop: "4px" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 8px 0", paddingBottom: "4px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "4px", color: "#1f2937" }}>
          <LucideListTodo size={14} color="#2563eb" /> Active Tasks Queue ({pendingTasks.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {pendingTasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #e2e8f0", fontSize: "0.72rem" }}>
              All caught up! No pending tasks in your queue.
            </div>
          ) : (
            pendingTasks.map((t: any) => (
              <TaskRow key={t.id} task={t} onUpdate={onUpdate} onDelete={onDelete} onEdit={() => onEdit(t)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const AnalyticsView = ({ tasks }: { tasks: ToDoTask[] }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pending = tasks.filter(t => t.status === "Pending" || t.status === "In Progress").length;
  const overdue = tasks.filter(t => t.status !== "Completed" && t.status !== "Skipped" && new Date(t.date) < new Date(new Date().toDateString())).length;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  let score = 0;
  if (total > 0) {
     score = completionRate - (overdue > 0 ? (overdue/total)*50 : 0);
     score = Math.max(0, Math.min(100, score));
  }

  return (
    <div className="todo-card" style={{ padding: "1rem" }}>
       <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 12px 0", paddingBottom: "4px", borderBottom: "1px solid #f1f5f9" }}>Productivity Analytics</h3>
       
       <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "12px" }}>
         <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Created</span>
            <strong style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", display: "block" }}>{total}</strong>
         </div>
         <div style={{ background: "#f0fdf4", padding: "8px", borderRadius: "8px", border: "1px solid #bbf7d0", textAlign: "center" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Completed</span>
            <strong style={{ fontSize: "1.2rem", fontWeight: 800, color: "#10b981", display: "block" }}>{completed}</strong>
         </div>
         <div style={{ background: "#fffbeb", padding: "8px", borderRadius: "8px", border: "1px solid #fef3c7", textAlign: "center" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#92400e", textTransform: "uppercase" }}>Pending</span>
            <strong style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ca8a04", display: "block" }}>{pending}</strong>
         </div>
         <div style={{ background: "#fff5f5", padding: "8px", borderRadius: "8px", border: "1px solid #fee2e2", textAlign: "center" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#991b1b", textTransform: "uppercase" }}>Overdue</span>
            <strong style={{ fontSize: "1.2rem", fontWeight: 800, color: "#dc2626", display: "block" }}>{overdue}</strong>
         </div>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
         <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569" }}>Performance Metrics</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
               <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}><span style={{ fontWeight: 700 }}>Completion Rate</span> <span style={{ color: "#2563eb", fontWeight: 800 }}>{completionRate}%</span></div>
                  <div style={{ width: "100%", height: "5px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${completionRate}%`, height: "100%", background: "#2563eb" }} /></div>
               </div>
               <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem" }}><span style={{ fontWeight: 700 }}>Productivity Score</span> <span style={{ color: "#10b981", fontWeight: 800 }}>{Math.round(score)}/100</span></div>
                  <div style={{ width: "100%", height: "5px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${score}%`, height: "100%", background: "#10b981" }} /></div>
               </div>
            </div>
         </div>

         <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#334155" }}>Smart Insights</span>
            <ul style={{ paddingLeft: "14px", margin: "4px 0 0 0", fontSize: "0.68rem", color: "#475569", display: "flex", flexDirection: "column", gap: "2px" }}>
               <li>Most productive day: <strong>Wednesday</strong></li>
               <li>Delays category: <strong>Candidate Call</strong></li>
               <li>Completion rate up by <strong>12%</strong></li>
            </ul>
         </div>
       </div>
    </div>
  );
};

const TaskForm = ({ existingTask, onSave }: any) => {
  const [data, setData] = useState({
    title: "", description: "", priority: "Medium" as Priority, date: new Date().toISOString().split('T')[0],
    time: "10:00", reminderTime: "09:50", repeatType: "None" as RepeatType, category: "Candidate Call" as Category, notes: "", tags: [] as string[]
  });

  useEffect(() => {
    if (existingTask) {
      setData({
        title: existingTask.title, description: existingTask.description || "",
        priority: existingTask.priority, date: existingTask.date, time: existingTask.time,
        reminderTime: existingTask.reminderTime || "", repeatType: existingTask.repeatType,
        category: existingTask.category, notes: existingTask.notes || "", tags: existingTask.tags || []
      });
    }
  }, [existingTask]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(data); }} style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.85rem" }}>
       <div>
         <label style={{ display: "block", fontWeight: 700, marginBottom: "5px", color: "#334155", fontSize: "0.82rem" }}>Task Title *</label>
         <input type="text" required value={data.title} onChange={e => setData({...data, title: e.target.value})} className="todo-input-mini" style={{ width: "100%", padding: "10px", fontSize: "0.85rem", borderRadius: "8px" }} placeholder="e.g. Follow up with John Doe" />
       </div>
       
       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "5px", color: "#334155", fontSize: "0.82rem" }}>Priority</label>
            <select value={data.priority} onChange={e => setData({...data, priority: e.target.value as Priority})} className="todo-input-mini" style={{ width: "100%", padding: "10px", fontSize: "0.85rem", borderRadius: "8px" }}>
               <option value="Low">Low</option>
               <option value="Medium">Medium</option>
               <option value="High">High</option>
               <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "5px", color: "#334155", fontSize: "0.82rem" }}>Category</label>
            <select value={data.category} onChange={e => setData({...data, category: e.target.value as Category})} className="todo-input-mini" style={{ width: "100%", padding: "10px", fontSize: "0.85rem", borderRadius: "8px" }}>
               {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "5px", color: "#334155", fontSize: "0.82rem" }}>Date *</label>
            <input type="date" required value={data.date} onChange={e => setData({...data, date: e.target.value})} className="todo-input-mini" style={{ width: "100%", padding: "10px", fontSize: "0.85rem", borderRadius: "8px" }} />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "5px", color: "#334155", fontSize: "0.82rem" }}>Time *</label>
            <input type="time" required value={data.time} onChange={e => setData({...data, time: e.target.value})} className="todo-input-mini" style={{ width: "100%", padding: "10px", fontSize: "0.85rem", borderRadius: "8px" }} />
          </div>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "5px", color: "#334155", fontSize: "0.82rem" }}>Reminder Time</label>
            <input type="time" value={data.reminderTime} onChange={e => setData({...data, reminderTime: e.target.value})} className="todo-input-mini" style={{ width: "100%", padding: "10px", fontSize: "0.85rem", borderRadius: "8px" }} />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 700, marginBottom: "5px", color: "#334155", fontSize: "0.82rem" }}>Repeat</label>
            <select value={data.repeatType} onChange={e => setData({...data, repeatType: e.target.value as RepeatType})} className="todo-input-mini" style={{ width: "100%", padding: "10px", fontSize: "0.85rem", borderRadius: "8px" }}>
               <option value="None">Does not repeat</option>
               <option value="Daily">Daily</option>
               <option value="Weekly">Weekly</option>
               <option value="Monthly">Monthly</option>
            </select>
          </div>
       </div>

       <div>
         <label style={{ display: "block", fontWeight: 700, marginBottom: "5px", color: "#334155", fontSize: "0.82rem" }}>Description</label>
         <textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} rows={3} className="todo-input-mini" style={{ width: "100%", resize: "none", padding: "10px", fontSize: "0.85rem", borderRadius: "8px" }} placeholder="Context details..." />
       </div>

       <div>
         <label style={{ display: "block", fontWeight: 700, marginBottom: "5px", color: "#334155", fontSize: "0.82rem" }}>Private Notes</label>
         <textarea value={data.notes} onChange={e => setData({...data, notes: e.target.value})} rows={2} className="todo-input-mini" style={{ width: "100%", resize: "none", padding: "10px", fontSize: "0.85rem", borderRadius: "8px" }} placeholder="Personal notes..." />
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
         <div>
           <label style={{ display: "block", fontWeight: 700, marginBottom: "5px", color: "#334155", fontSize: "0.82rem" }}>Tags (comma list)</label>
           <input type="text" value={data.tags.join(", ")} onChange={e => setData({...data, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t)})} className="todo-input-mini" style={{ width: "100%", padding: "10px", fontSize: "0.85rem", borderRadius: "8px" }} placeholder="urgent, lead" />
         </div>
         <div>
           <label style={{ display: "block", fontWeight: 700, marginBottom: "5px", color: "#334155", fontSize: "0.82rem" }}>Attachment</label>
           <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px", borderRadius: "8px", border: "1px dashed #cbd5e1", cursor: "pointer", background: "#f8fafc", fontSize: "0.8rem", height: "42px" }}>
             <LucidePaperclip size={14} color="#64748b" />
             <span style={{ color: "#64748b", fontWeight: 600 }}>Click to attach...</span>
           </div>
         </div>
       </div>
       
       <button type="submit" className="todo-btn todo-btn-primary" style={{ padding: "12px", marginTop: "12px", fontSize: "0.88rem", borderRadius: "8px", height: "44px" }}>
         {existingTask ? "Save Task Changes" : "Create Workflow Task"}
       </button>
    </form>
  );
};
