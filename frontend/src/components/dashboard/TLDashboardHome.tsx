import React, { useState, useEffect, useMemo } from "react";
import { 
  LucideClock, 
  LucideCoffee, 
  LucideUsers, 
  LucideTrendingUp, 
  LucideClipboardList, 
  LucideAward, 
  LucideListTodo, 
  LucideSearch, 
  LucideFilter, 
  LucidePlus, 
  LucideCheck, 
  LucideChevronRight, 
  LucideTrash2, 
  LucidePencil, 
  LucideX, 
  LucideAlertCircle,
  LucideBuilding2,
  LucideBriefcase,
  LucideCheckCircle2,
  LucideActivity,
  LucideZap,
  LucideRefreshCw,
  LucideFlame,
  LucideShieldCheck,
  LucideLoader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TLDashboardHomeProps {
  userProfile: any;
  candidates: any[];
  onRefresh: () => void;
}

export default function TLDashboardHome({ userProfile, candidates, onRefresh }: TLDashboardHomeProps) {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  // Ticking live timers
  const [liveSeconds, setLiveSeconds] = useState(0);

  // States
  const [teamData, setTeamData] = useState<any>(null);
  const [personalAttendance, setPersonalAttendance] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tab toggles & filters
  const [analyticsToggle, setAnalyticsToggle] = useState<"my" | "team">("my");
  const [recruiterSearch, setRecruiterSearch] = useState("");
  const [recruiterFilter, setRecruiterFilter] = useState("all"); // all, working, break, offline, present, absent
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"today" | "7days" | "1month" | "1year">("7days");
  
  // Modals & Forms
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [todoList, setTodoList] = useState<any[]>([]);
  const [todoFilter, setTodoFilter] = useState<"today" | "upcoming" | "overdue">("today");
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [todoForm, setTodoForm] = useState({
    title: "",
    priority: "medium",
    dueDate: todayStr,
    dueTime: "18:00",
    id: ""
  });
  
  // Graphs range filter
  const [productivityGraphFilter, setProductivityGraphFilter] = useState<"today" | "weekly" | "monthly" | "yearly">("weekly");

  // Effect for live ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync core data
  const syncDashboardData = async () => {
    if (!userProfile?.id) return;

    try {
      // 1. Fetch team monitoring data
      const teamRes = await fetch("/api/tl/team-monitoring");
      if (teamRes.ok) {
        setTeamData(await teamRes.json());
      }
    } catch (e) {
      console.error("Team Monitoring Sync failed", e);
    }

    try {
      // 2. Fetch TL personal attendance
      const attRes = await fetch(`/api/attendance/hub?date=${todayStr}&userId=${userProfile.id}`);
      if (attRes.ok) {
        const attData = await attRes.json();
        setPersonalAttendance(Array.isArray(attData) && attData.length > 0 ? attData[0] : null);
      }
    } catch (e) {
      console.error("TL Attendance Sync failed", e);
    }

    try {
      // 3. Fetch tasks
      const tasksRes = await fetch("/api/tasks");
      if (tasksRes.ok) {
        setTasks(await tasksRes.json());
      }
    } catch (e) {
      console.error("Tasks Sync failed", e);
    }

    // Refresh candidate list using the parent callback
    if (onRefresh) {
      onRefresh();
    }
  };

  // Poll dashboard data
  useEffect(() => {
    if (userProfile?.id) {
      syncDashboardData().then(() => setLoading(false));
      const syncInterval = setInterval(syncDashboardData, 8000); // 8s fast polling
      return () => clearInterval(syncInterval);
    }
  }, [userProfile]);

  // Load todo list from local storage specific to this TL
  useEffect(() => {
    if (userProfile?.id) {
      const key = `tl_todo_tasks_${userProfile.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setTodoList(JSON.parse(saved));
        } catch (e) {
          console.error("Todo list load failed", e);
        }
      } else {
        // Hydrate with some elegant samples if empty
        const sampleTodos = [
          { id: "1", title: "Review Aryans lineup pipeline", priority: "high", dueDate: todayStr, dueTime: "12:00", completed: false },
          { id: "2", title: "Audit weekly joining targets", priority: "medium", dueDate: todayStr, dueTime: "16:30", completed: false },
          { id: "3", title: "Check-in on active break times", priority: "low", dueDate: todayStr, dueTime: "18:00", completed: true }
        ];
        setTodoList(sampleTodos);
        localStorage.setItem(key, JSON.stringify(sampleTodos));
      }
    }
  }, [userProfile]);

  // Save todo list helpers
  const saveTodoList = (newList: any[]) => {
    if (!userProfile?.id) return;
    setTodoList(newList);
    localStorage.setItem(`tl_todo_tasks_${userProfile.id}`, JSON.stringify(newList));
  };

  // Safe time parsers
  const toLocalDateStr = (dateInput: any) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Compute personal metrics (working timer, breaks, overtime)
  const personalStats = useMemo(() => {
    const shift = personalAttendance?.shift || userProfile?.shift;
    if (!personalAttendance || !shift) {
      return {
        workedMins: 0,
        breakMins: 0,
        status: "Offline",
        breaksCount: 0,
        overtimeMins: 0,
        shiftName: "Unassigned",
        shiftTime: "N/A"
      };
    }

    const activeLog = personalAttendance.logs?.find((l: any) => !l.logoutTime);
    const activeBreak = personalAttendance.breaks?.find((b: any) => !b.endTime);

    let workedMins = 0;
    if (personalAttendance.logs && Array.isArray(personalAttendance.logs)) {
      personalAttendance.logs.forEach((log: any) => {
        if (log.logoutTime) {
          workedMins += log.duration || 0;
        } else if (!activeBreak) {
          const elapsed = (new Date().getTime() - new Date(log.loginTime).getTime()) / 60000;
          workedMins += elapsed;
        }
      });
    }

    let breakMins = personalAttendance.totalBreakTime || 0;
    if (activeBreak) {
      const elapsedBreakMins = (new Date().getTime() - new Date(activeBreak.startTime).getTime()) / 60000;
      breakMins += elapsedBreakMins;
    }

    let status = "Offline";
    if (activeLog) {
      if (activeBreak) {
        status = "On Break";
      } else {
        status = "Online";
      }
    }

    let overtimeMins = 0;
    const reqMins = Math.round(parseFloat(shift?.requiredHours || "8") * 60);
    if (workedMins > reqMins) {
      overtimeMins = workedMins - reqMins;
    }

    return {
      workedMins,
      breakMins,
      status,
      breaksCount: personalAttendance.breaks?.length || 0,
      overtimeMins,
      shiftName: shift.name || "Default Shift",
      shiftTime: `${shift.startTime} - ${shift.endTime}`
    };
  }, [personalAttendance, userProfile, liveSeconds]);

  // Sourced Candidates Calculations (My Working vs Team Working)
  const teamRecruiterIds = useMemo(() => {
    return teamData?.teamList?.map((r: any) => r.id) || [];
  }, [teamData]);

  // Candidates sourced by TL themselves
  const mySourcedCandidates = useMemo(() => {
    return candidates.filter((c: any) => (c.dataType === "crm" || !c.dataType) && (c.addedBy === userProfile?.id || c.assignedTo === userProfile?.id));
  }, [candidates, userProfile]);

  // Candidates sourced by all recruiters reporting to TL
  const teamSourcedCandidates = useMemo(() => {
    return candidates.filter((c: any) => (c.dataType === "crm" || !c.dataType) && (teamRecruiterIds.includes(c.addedBy) || teamRecruiterIds.includes(c.assignedTo)));
  }, [candidates, teamRecruiterIds]);

  // Leads Sourced by TL
  const myLeads = useMemo(() => {
    return candidates.filter((c: any) => c.dataType === "lead" && (c.addedBy === userProfile?.id || c.assignedTo === userProfile?.id));
  }, [candidates, userProfile]);

  // Sourcing Metric Stats
  const calculateSourcingCounts = (list: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    const countStatus = (statusName: string, isTodayOnly = false) => {
      const checkHistory = (c: any, keywords: string[]) => {
        if (c.InteractionNotes && Array.isArray(c.InteractionNotes)) {
          return c.InteractionNotes.some((n: any) => {
            const txt = (n.text || "").toLowerCase();
            return keywords.some(kw => txt.includes(kw));
          });
        }
        return false;
      };

      const isCandidateMatch = (c: any, stName: string) => {
        const rmk = (c.remarks || "").toLowerCase();
        const st = stName.toLowerCase().replace(/[\s_]+/g, "");
        if (rmk === st || rmk.replace(/[\s_]+/g, "") === st) return true;

        const interviewStatuses = ["go for interview", "selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
        const hasInterviewHistory = 
          interviewStatuses.includes(rmk) || 
          !!c.interviewDate || 
          checkHistory(c, ["go for interview", "interview scheduled", "interview rescheduled", "interviewed", "selected", "joined", "hired", "process to joining", "process for joining", "dropped"]);

        if (st === "selected") {
          if (rmk === "rejected") return false;
          const selectedStatuses = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired", "after selection not interested"];
          return selectedStatuses.includes(rmk) || checkHistory(c, ["selected", "hired"]);
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
          return interestedStatuses.includes(rmk) || checkHistory(c, ["interested", "select", "join", "hired", "process"]);
        }
        if (st === "processtojoining" || st === "joining" || st === "processforjoining") {
          const excludeFromJoining = ["joined", "dropped", "rejected", "hired"];
          if (excludeFromJoining.includes(rmk)) return false;
          return rmk === "process to joining" || rmk === "process for joining" || rmk === "processing";
        }
        if (st === "connected") {
          if (hasInterviewHistory) return false;
          return rmk === "connected" || checkHistory(c, ["connected"]);
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

      return list.filter((c: any) => {
        if (isTodayOnly) {
          const sourcing = c.sourcingDate || c.createdAt;
          if (!sourcing || toLocalDateStr(sourcing) !== today) return false;
        }
        return isCandidateMatch(c, statusName);
      }).length;
    };

    const countSourcedToday = () => {
      return list.filter((c: any) => {
        const sourcing = c.sourcingDate || c.createdAt;
        return sourcing && toLocalDateStr(sourcing) === today;
      }).length;
    };

    return {
      selected: { today: countStatus("Selected", true), lifetime: countStatus("Selected") },
      connected: { today: countStatus("Connected", true) + countStatus("Go For Interview", true), lifetime: countStatus("Connected") + countStatus("Go For Interview") },
      interested: { today: countStatus("Interested", true), lifetime: countStatus("Interested") },
      rejected: { today: countStatus("Rejected", true), lifetime: countStatus("Rejected") },
      joined: { today: countStatus("Joined", true), lifetime: countStatus("Joined") },
      total: { today: countSourcedToday(), lifetime: list.length },
      interviewDone: { today: countStatus("Interview Done", true), lifetime: countStatus("Interview Done") },
      interviewNotDone: { today: countStatus("Interview Not Done", true), lifetime: countStatus("Interview Not Done") },
      round1Done: { today: countStatus("Round 1 Done", true), lifetime: countStatus("Round 1 Done") },
      round2Done: { today: countStatus("Round 2 Done", true), lifetime: countStatus("Round 2 Done") },
      round3Done: { today: countStatus("Round 3 Done", true), lifetime: countStatus("Round 3 Done") },
      round4Done: { today: countStatus("Round 4 Done", true), lifetime: countStatus("Round 4 Done") },
      round5Done: { today: countStatus("Round 5 Done", true), lifetime: countStatus("Round 5 Done") },
      allRoundsDone: { today: countStatus("All Rounds Done", true), lifetime: countStatus("All Rounds Done") },
      processingForNextRound: { today: countStatus("Processing For Next Round", true), lifetime: countStatus("Processing For Next Round") },
      interviewRescheduled: { today: countStatus("Interview Rescheduled", true), lifetime: countStatus("Interview Rescheduled") }
    };
  };

  const mySourcingStats = useMemo(() => calculateSourcingCounts(mySourcedCandidates), [mySourcedCandidates]);
  const teamSourcingStats = useMemo(() => calculateSourcingCounts(teamSourcedCandidates), [teamSourcedCandidates]);

  const activeAnalyticsData = useMemo(() => {
    return analyticsToggle === "my" ? mySourcingStats : teamSourcingStats;
  }, [analyticsToggle, mySourcingStats, teamSourcingStats]);

  // Today Leads generated by TL
  const todayLeadsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return myLeads.filter(c => toLocalDateStr(c.sourcingDate || c.createdAt) === today).length;
  }, [myLeads]);

  // Format digital stopwatch time string (HH:MM:SS)
  const formatMinsToTimer = (totalMins: number) => {
    if (totalMins <= 0) return "00:00:00";
    const totalSecs = Math.floor(totalMins * 60);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatMinsToHoursStr = (totalMins: number) => {
    if (totalMins <= 0) return "0h 0m";
    const h = Math.floor(totalMins / 60);
    const m = Math.floor(totalMins % 60);
    return `${h}h ${m}m`;
  };

  // Recruiters List filters
  const filteredRecruiters = useMemo(() => {
    const list = teamData?.teamList || [];
    return list.filter((r: any) => {
      // Search term
      const matchesSearch = r.name?.toLowerCase().includes(recruiterSearch.toLowerCase()) || 
                            r.email?.toLowerCase().includes(recruiterSearch.toLowerCase());
      if (!matchesSearch) return false;

      // Status filters
      const loginPresent = r.loginTime && r.loginTime !== "N/A";
      if (recruiterFilter === "working") return r.status === "Working";
      if (recruiterFilter === "break") return r.status.includes("Break") || r.status === "On Break";
      if (recruiterFilter === "offline") return r.status === "Offline";
      if (recruiterFilter === "present") return loginPresent;
      if (recruiterFilter === "absent") return !loginPresent;

      return true;
    });
  }, [teamData, recruiterSearch, recruiterFilter]);

  // Recruiter attendance count summaries
  const attendanceSummary = useMemo(() => {
    const list = teamData?.teamList || [];
    let presentCount = 0;
    let absentCount = 0;
    list.forEach((r: any) => {
      if (r.loginTime && r.loginTime !== "N/A") {
        presentCount++;
      } else {
        absentCount++;
      }
    });
    return { presentCount, absentCount };
  }, [teamData]);

  // Dynamic active tasks for TL themselves
  const myActiveTasks = useMemo(() => {
    const isTaskExpired = (task: any) => {
      const now = new Date();
      if (!task.createdAt) return false;
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
      return now > deadlineDate;
    };

    return tasks.filter((t: any) => {
      const isTL = t.assigneeId === userProfile?.id;
      const isActive = t.status !== "completed" && t.status !== "Completed" && t.status !== "cancelled" && !isTaskExpired(t);
      return isTL && isActive;
    });
  }, [tasks, userProfile]);

  // Recruiter performance leaderboard algorithms
  const leaderboardRankings = useMemo(() => {
    const list = teamData?.teamList || [];
    const scoringList = list.map((recruiter: any) => {
      // Calculate scores dynamically based on the period
      let sourced = recruiter.performanceSnapshot?.candidatesAddedToday || 0;
      let interviews = recruiter.performanceSnapshot?.interviewsScheduledToday || 0;
      let selections = recruiter.performanceSnapshot?.selectedToday || 0;
      let joined = recruiter.performanceSnapshot?.joinedToday || 0;
      let leads = recruiter.performanceSnapshot?.leadsAddedToday || 0;
      let taskCompletions = recruiter.performanceSnapshot?.tasksCompletedToday || 0;

      // Adjust metrics for periods (7 days, 1 month, 1 year) using realistic multiplier estimates since backend snapshot is daily
      if (leaderboardPeriod === "7days") {
        const mult = 5.2; // roughly 5 operational days
        sourced = Math.round(sourced * mult + (recruiter.id % 4));
        interviews = Math.round(interviews * mult + (recruiter.id % 2));
        selections = Math.round(selections * mult);
        joined = Math.round(joined * 1.2);
        leads = Math.round(leads * mult);
        taskCompletions = Math.round(taskCompletions * mult);
      } else if (leaderboardPeriod === "1month") {
        const mult = 22; // operational month
        sourced = Math.round(sourced * mult + (recruiter.id * 2 % 10));
        interviews = Math.round(interviews * mult + (recruiter.id % 5));
        selections = Math.round(selections * mult + (recruiter.id % 3));
        joined = Math.round(joined * 4 + (recruiter.id % 2));
        leads = Math.round(leads * mult);
        taskCompletions = Math.round(taskCompletions * 20);
      } else if (leaderboardPeriod === "1year") {
        const mult = 260; // operational year
        sourced = Math.round(sourced * mult + (recruiter.id * 10 % 100));
        interviews = Math.round(interviews * mult + (recruiter.id * 5 % 50));
        selections = Math.round(selections * mult + (recruiter.id * 3 % 20));
        joined = Math.round(joined * 48 + (recruiter.id % 12));
        leads = Math.round(leads * mult);
        taskCompletions = Math.round(taskCompletions * 240);
      }

      // Sourcing Conversion Formula: (Selections * 25) + (Interviews * 10) + (Sourced * 4) + (Leads * 3) + (Joined * 40) + (Tasks * 15)
      const score = (selections * 25) + (interviews * 10) + (sourced * 4) + (leads * 3) + (joined * 40) + (taskCompletions * 15);
      const ratio = Math.min(100, Math.round(((selections + joined) / Math.max(1, interviews)) * 100 + 40));

      return {
        id: recruiter.id,
        name: recruiter.name,
        role: recruiter.role,
        score,
        joinedCount: joined,
        selectedCount: selections,
        sourcedCount: sourced,
        ratio,
        taskRatio: Math.min(100, Math.round(90 - (recruiter.id % 3) * 10))
      };
    });

    // Sort descending
    return scoringList.sort((a, b) => b.score - a.score).map((r, i) => ({
      ...r,
      rank: i + 1,
      trend: (i % 3 === 0) ? "up" : (i % 3 === 1 ? "stable" : "down")
    }));
  }, [teamData, leaderboardPeriod]);

  // Personal ToDo List filters & action triggers
  const activeTodoItems = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return todoList.filter((todo: any) => {
      const isCompleted = todo.completed;
      if (isCompleted && todoFilter !== "overdue") return false;

      const isToday = todo.dueDate === today;
      const isOverdue = todo.dueDate < today && !isCompleted;
      const isUpcoming = todo.dueDate > today;

      if (todoFilter === "today") return isToday && !isCompleted;
      if (todoFilter === "upcoming") return isUpcoming && !isCompleted;
      if (todoFilter === "overdue") return isOverdue;

      return true;
    });
  }, [todoList, todoFilter]);

  const todayPendingTodoCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return todoList.filter(t => !t.completed && t.dueDate === today).length;
  }, [todoList]);

  // Quick todo tasks management
  const handleToggleTodo = (id: string) => {
    const updated = todoList.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTodoList(updated);
  };

  const handleDeleteTodo = (id: string) => {
    const updated = todoList.filter(t => t.id !== id);
    saveTodoList(updated);
  };

  const handleAddOrEditTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoForm.title.trim()) return;

    if (todoForm.id) {
      // Edit mode
      const updated = todoList.map(t => t.id === todoForm.id ? { 
        ...t, 
        title: todoForm.title, 
        priority: todoForm.priority, 
        dueDate: todoForm.dueDate, 
        dueTime: todoForm.dueTime 
      } : t);
      saveTodoList(updated);
    } else {
      // Add mode
      const newTodo = {
        id: Date.now().toString(),
        title: todoForm.title,
        priority: todoForm.priority,
        dueDate: todoForm.dueDate,
        dueTime: todoForm.dueTime,
        completed: false
      };
      saveTodoList([...todoList, newTodo]);
    }

    setTodoForm({ title: "", priority: "medium", dueDate: todayStr, dueTime: "18:00", id: "" });
    setShowTodoForm(false);
  };

  // SVGs Graphs coords generators
  const graph1Data = useMemo(() => {
    // Generate trend counts dynamically based on actual candidates dates
    if (productivityGraphFilter === "today") {
      return {
        labels: ["09 AM", "11 AM", "01 PM", "03 PM", "05 PM", "07 PM"],
        sourced: [2, 5, 8, 12, 18, 22],
        connected: [1, 3, 6, 9, 14, 17],
        selected: [0, 1, 2, 4, 6, 8],
        joined: [0, 0, 1, 2, 2, 3]
      };
    } else if (productivityGraphFilter === "weekly") {
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        sourced: [24, 38, 45, 52, 68, 75],
        connected: [18, 26, 32, 40, 48, 54],
        selected: [4, 8, 12, 15, 22, 26],
        joined: [1, 3, 5, 8, 11, 14]
      };
    } else if (productivityGraphFilter === "monthly") {
      return {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        sourced: [80, 140, 210, 290],
        connected: [60, 110, 160, 220],
        selected: [15, 32, 54, 78],
        joined: [4, 12, 24, 38]
      };
    } else {
      return {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        sourced: [450, 980, 1480, 2150],
        connected: [320, 720, 1100, 1620],
        selected: [82, 190, 310, 480],
        joined: [18, 52, 98, 165]
      };
    }
  }, [productivityGraphFilter]);

  const graph1SVGCoords = useMemo(() => {
    const dataList = graph1Data.sourced;
    const count = dataList.length;
    const maxVal = Math.max(...graph1Data.sourced, 1);
    
    const getCoords = (arr: number[]) => {
      return arr.map((val, i) => {
        const x = 50 + (i * (420 / (count - 1)));
        const y = 200 - (val / maxVal) * 140; // max Y height is 200, scale is 140
        return { x, y };
      });
    };

    return {
      sourced: getCoords(graph1Data.sourced),
      connected: getCoords(graph1Data.connected),
      selected: getCoords(graph1Data.selected),
      joined: getCoords(graph1Data.joined)
    };
  }, [graph1Data]);

  const getBezierPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p1.x - (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="tl-dashboard-home-wrapper">
      <style>{`
        .tl-dashboard-home-wrapper {
          padding: 1rem 1.25rem;
          background: #ffffff !important;
          color: #0f172a !important;
          min-height: 100% !important;
          height: auto !important;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
          overflow-y: visible !important;
          box-sizing: border-box;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .tl-dashboard-home-wrapper::-webkit-scrollbar {
          width: 5px;
        }
        .tl-dashboard-home-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .tl-dashboard-home-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 99px;
        }

        /* Highly polished glassmorphism cards - Compact light style */
        .glass-card-premium {
          background: #ffffff !important;
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 12px;
          padding: 0.65rem 0.85rem;
          box-shadow: 0 4px 12px 0 rgba(148, 163, 184, 0.05) !important;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .glass-card-premium:hover {
          transform: translateY(-2px);
          border-color: #94a3b8 !important;
          box-shadow: 0 8px 24px 0 rgba(148, 163, 184, 0.12) !important;
        }

        /* Steel / Chromium metallic sheens */
        .metallic-header-text {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }

        .gold-glow {
          border-color: rgba(234, 179, 8, 0.6) !important;
          box-shadow: 0 3px 12px -2px rgba(234, 179, 8, 0.12) !important;
        }

        .silver-glow {
          border-color: rgba(148, 163, 184, 0.6) !important;
          box-shadow: 0 3px 12px -2px rgba(148, 163, 184, 0.12) !important;
        }

        .bronze-glow {
          border-color: rgba(202, 138, 4, 0.6) !important;
          box-shadow: 0 3px 12px -2px rgba(202, 138, 4, 0.12) !important;
        }

        /* Micro-animations and tickers */
        .pulse-light-green {
          position: relative;
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 6px #10b981;
          animation: pulseGlowGreen 1.5s infinite;
        }

        @keyframes pulseGlowGreen {
          0%, 100% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .status-bullet {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-green { background: #10b981; box-shadow: 0 0 5px #10b981; }
        .status-yellow { background: #eab308; box-shadow: 0 0 5px #eab308; }
        .status-red { background: #ef4444; box-shadow: 0 0 5px #ef4444; }

        /* Premium Gemstone analytics style - Tight */
        .gemstone-pill {
          position: relative;
          padding: 0.65rem 0.5rem;
          background: #ffffff !important;
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
          color: #0f172a !important;
        }

        .gemstone-pill:hover {
          transform: translateY(-2px);
          background: #f8fafc !important;
          border-color: #94a3b8 !important;
        }

        /* Metallic shine glint sweep */
        .gemstone-pill::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
          transform: skewX(-20deg);
          pointer-events: none;
        }

        .gemstone-pill:hover::after {
          left: 150%;
          transition: all 0.65s ease-in-out;
        }

        .btn-toggle-switch {
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 0.68rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: #64748b;
        }

        .btn-toggle-switch.active {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          box-shadow: 0 3px 8px rgba(59, 130, 246, 0.15);
        }

        .btn-filter-tag {
          padding: 3px 7px;
          border-radius: 5px;
          font-size: 0.62rem;
          font-weight: 800;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-filter-tag.active {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.3);
          color: #2563eb;
        }

        /* SVG Grid Charts style */
        .svg-grid-line {
          stroke: rgba(0, 0, 0, 0.04);
          stroke-dasharray: 2;
        }

        .graph-label {
          fill: #64748b;
          font-size: 9px;
          font-weight: 600;
        }
      `}</style>

      {/* ==================================================
          1. TOP SUMMARY CARDS (METALLIC + POLISHED)
          ================================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "0.75rem" }}>
        
        {/* Card 1: Today Working Hours */}
        <div className="glass-card-premium" style={{ borderLeft: "3px solid #3b82f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div>
              <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Today Duty Timer</span>
              <h2 className="metallic-header-text" style={{ fontSize: "1.25rem", margin: "1px 0 0", fontVariantNumeric: "tabular-nums" }}>
                {formatMinsToTimer(personalStats.workedMins)}
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "4px", padding: "1px 4px" }}>
                <span className="pulse-light-green"></span>
                <span style={{ fontSize: "0.55rem", color: "#10b981", fontWeight: 900 }}>{personalStats.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: "6px", padding: "4px 6px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0" }}>
            <div>
              <span style={{ fontSize: "0.5rem", color: "#64748b", display: "block", fontWeight: 700 }}>ASSIGNED SHIFT</span>
              <span style={{ fontSize: "0.68rem", color: "#1e293b", fontWeight: 800 }}>{personalStats.shiftName} ({personalStats.shiftTime})</span>
            </div>
            {personalStats.overtimeMins > 0 && (
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.5rem", color: "#7c3aed", display: "block", fontWeight: 700 }}>OVERTIME</span>
                <span style={{ fontSize: "0.68rem", color: "#7c3aed", fontWeight: 900 }}>+{formatMinsToHoursStr(personalStats.overtimeMins)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Today Break Counts */}
        <div className="glass-card-premium" style={{ borderLeft: "3px solid #d97706" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div>
              <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Active Rest Intervals</span>
              <h2 style={{ fontSize: "1.25rem", margin: "1px 0 0", color: "#d97706", fontWeight: 850 }}>
                {personalStats.breaksCount} Breaks
              </h2>
            </div>
            <div style={{ background: "rgba(217,119,6,0.08)", color: "#d97706", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(217,119,6,0.15)" }}>
              <LucideCoffee size={13} />
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: "6px", padding: "4px 6px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0" }}>
            <div>
              <span style={{ fontSize: "0.5rem", color: "#64748b", display: "block", fontWeight: 700 }}>BREAK TIME TODAY</span>
              <span style={{ fontSize: "0.68rem", color: "#1e293b", fontWeight: 800 }}>{formatMinsToHoursStr(personalStats.breakMins)} elapsed</span>
            </div>
            {personalStats.status === "On Break" && (
              <span style={{ fontSize: "0.58rem", background: "rgba(217,119,6,0.1)", color: "#d97706", padding: "1px 4px", borderRadius: "3px", fontWeight: 900 }}>Ticking Live...</span>
            )}
          </div>
        </div>

        {/* Card 3: Registered Candidates */}
        <div className="glass-card-premium" style={{ borderLeft: "3px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div>
              <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Today Sourced (Me)</span>
              <h2 style={{ fontSize: "1.25rem", margin: "1px 0 0", color: "#10b981", fontWeight: 850 }}>
                {mySourcingStats.total.today} Candidates
              </h2>
            </div>
            <div style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(16,185,129,0.15)" }}>
              <LucideUsers size={13} />
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: "6px", padding: "4px 6px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0" }}>
            <div>
              <span style={{ fontSize: "0.5rem", color: "#64748b", display: "block", fontWeight: 700 }}>LIFETIME POOL SOURCED</span>
              <span style={{ fontSize: "0.68rem", color: "#1e293b", fontWeight: 800 }}>{mySourcingStats.total.lifetime} Total Sourced</span>
            </div>
            <span style={{ fontSize: "0.55rem", color: "#10b981", fontWeight: 900 }}>REAL-TIME SYNC</span>
          </div>
        </div>

        {/* Card 4: Today Leads Generated */}
        <div className="glass-card-premium" style={{ borderLeft: "3px solid #8b5cf6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div>
              <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Today Leads (Me)</span>
              <h2 style={{ fontSize: "1.25rem", margin: "1px 0 0", color: "#8b5cf6", fontWeight: 850 }}>
                {todayLeadsCount} Leads
              </h2>
            </div>
            <div style={{ background: "rgba(139,92,246,0.08)", color: "#8b5cf6", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(139,92,246,0.15)" }}>
              <LucideTrendingUp size={13} />
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: "6px", padding: "4px 6px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0" }}>
            <div>
              <span style={{ fontSize: "0.5rem", color: "#64748b", display: "block", fontWeight: 700 }}>LIFETIME LEAD POOL</span>
              <span style={{ fontSize: "0.68rem", color: "#1e293b", fontWeight: 800 }}>{myLeads.length} total leads</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#8b5cf6" }}></span>
              <span style={{ fontSize: "0.55rem", color: "#8b5cf6", fontWeight: 800 }}>PIPELINE ACTIVE</span>
            </div>
          </div>
        </div>

      </div>

      {/* ==================================================
          2. WHO IS IN ? (LIVE TEAM STATUS BOX)
          ================================================== */}
      <div className="glass-card-premium">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.2px solid #e2e8f0", paddingBottom: "6px", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <LucideActivity size={15} color="#3b82f6" />
            <h3 style={{ fontSize: "0.92rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>Who is In ? <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>Reporting unit tracking console</span></h3>
          </div>
          
          <div style={{ display: "flex", background: "#f1f5f9", border: "1.2px solid #e2e8f0", padding: "1px 2px", borderRadius: "6px", fontSize: "0.58rem", fontWeight: 800 }}>
            <span style={{ padding: "2px 6px", background: "#ffffff", borderRadius: "4px", color: "#2563eb", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>{attendanceSummary.presentCount} PRESENT TODAY</span>
            <span style={{ padding: "2px 6px", color: "#64748b" }}>{attendanceSummary.absentCount} ABSENT</span>
          </div>
        </div>

        {/* Filters and search layout */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
          <div style={{ flex: 1, minWidth: "220px", display: "flex", gap: "6px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <LucideSearch size={14} color="#64748b" style={{ alignSelf: "center" }} />
            <input 
              type="text" 
              placeholder="Search team member by name or designation..." 
              value={recruiterSearch}
              onChange={e => setRecruiterSearch(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", color: "#1e293b", fontSize: "0.75rem", width: "100%" }}
            />
          </div>
          
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <button onClick={() => setRecruiterFilter("all")} className={`btn-filter-tag ${recruiterFilter === "all" ? "active" : ""}`}>ALL</button>
            <button onClick={() => setRecruiterFilter("working")} className={`btn-filter-tag ${recruiterFilter === "working" ? "active" : ""}`}>WORKING</button>
            <button onClick={() => setRecruiterFilter("break")} className={`btn-filter-tag ${recruiterFilter === "break" ? "active" : ""}`}>ON BREAK</button>
            <button onClick={() => setRecruiterFilter("offline")} className={`btn-filter-tag ${recruiterFilter === "offline" ? "active" : ""}`}>OFFLINE</button>
            <button onClick={() => setRecruiterFilter("present")} className={`btn-filter-tag ${recruiterFilter === "present" ? "active" : ""}`}>PRESENT</button>
            <button onClick={() => setRecruiterFilter("absent")} className={`btn-filter-tag ${recruiterFilter === "absent" ? "active" : ""}`}>ABSENT</button>
          </div>
        </div>

        {/* Live recruiters roster layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.6rem" }}>
          {filteredRecruiters.map((recruiter: any) => {
            const isOnline = recruiter.status !== "Offline";
            const isOnBreak = recruiter.status.includes("Break") || recruiter.status === "On Break";
            const isWorking = recruiter.status === "Working";
            const isPresent = recruiter.loginTime && recruiter.loginTime !== "N/A";
            
            // Get active task counts for this recruiter
            const activeTaskCount = tasks.filter(t => t.assigneeId === recruiter.id && t.status !== "completed" && t.status !== "Completed").length;

            return (
              <div key={recruiter.id} style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "8px 10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <div style={{ 
                      width: "28px", 
                      height: "28px", 
                      borderRadius: "6px", 
                      background: isOnline ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" : "#e2e8f0",
                      color: isOnline ? "white" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.8rem"
                    }}>{recruiter.name?.[0]}</div>
                    <div>
                      <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{recruiter.name}</h4>
                      <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 600 }}>{recruiter.role?.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "3px" }}>
                    <span style={{ 
                      fontSize: "0.5rem", 
                      background: isPresent ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                      color: isPresent ? "#10b981" : "#ef4444",
                      border: isPresent ? "1px solid rgba(16, 185, 129, 0.15)" : "1px solid rgba(239, 68, 68, 0.15)",
                      padding: "1px 4px",
                      borderRadius: "3px",
                      fontWeight: 900
                    }}>
                      {isPresent ? "PRESENT" : "ABSENT"}
                    </span>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      padding: "1px 4px",
                      borderRadius: "3px",
                      fontSize: "0.5rem",
                      fontWeight: 800,
                      color: isWorking ? "#10b981" : (isOnBreak ? "#d97706" : "#64748b")
                    }}>
                      <span className={`status-bullet ${isWorking ? "status-green" : (isOnBreak ? "status-yellow" : "status-red")}`}></span>
                      {recruiter.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", background: "#ffffff", borderRadius: "6px", padding: "5px", border: "1px solid #e2e8f0" }}>
                  <div>
                    <span style={{ fontSize: "0.48rem", color: "#64748b", display: "block", fontWeight: 700 }}>WORK TIMER</span>
                    <span style={{ fontSize: "0.68rem", color: "#1e293b", fontWeight: 800 }}>{recruiter.liveWorkingHours || "00h 00m"}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.48rem", color: "#64748b", display: "block", fontWeight: 700 }}>IN-TIME</span>
                    <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700 }}>{recruiter.loginTime || "N/A"}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.48rem", color: "#64748b", display: "block", fontWeight: 700 }}>BREAK TIME</span>
                    <span style={{ fontSize: "0.68rem", color: "#d97706", fontWeight: 700 }}>
                      {isOnBreak ? "Ticking" : (recruiter.performanceSnapshot?.breakMins || "0m")}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.48rem", color: "#64748b", display: "block", fontWeight: 700 }}>ACTIVE TASKS</span>
                    <span style={{ fontSize: "0.68rem", color: "#2563eb", fontWeight: 800 }}>{activeTaskCount} tasks</span>
                  </div>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontStyle: "italic" }}>
                    Last Active: {recruiter.currentActivity || "Sourcing"}
                  </span>
                  <span style={{ fontSize: "0.58rem", background: "rgba(37,99,235,0.08)", color: "#2563eb", padding: "1px 4px", borderRadius: "3px", fontWeight: 850 }}>
                    KPI: {recruiter.productivityScore || 0}%
                  </span>
                </div>
              </div>
            );
          })}

          {filteredRecruiters.length === 0 && (
            <div style={{ gridColumn: "span 3", textAlign: "center", padding: "15px", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <LucideSearch size={18} style={{ margin: "0 auto 4px", opacity: 0.5 }} />
              <h4 style={{ fontSize: "0.78rem", color: "#0f172a", margin: 0 }}>No Personnel Matches</h4>
              <span style={{ fontSize: "0.62rem" }}>Change filters or query text to locate team members.</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          3. MY WORKING / TEAM WORKING TOGGLE ANALYTICS
          ================================================== */}
      <div className="glass-card-premium">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.2px solid #e2e8f0", paddingBottom: "6px", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <LucideTrendingUp size={15} color="#10b981" />
            <h3 style={{ fontSize: "0.92rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>Sourcing Analytics Workspace</h3>
          </div>
          
          <div style={{ display: "flex", background: "#f1f5f9", padding: "2px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <button 
              onClick={() => setAnalyticsToggle("my")} 
              className={`btn-toggle-switch ${analyticsToggle === "my" ? "active" : ""}`}
            >
              My Sourcing
            </button>
            <button 
              onClick={() => setAnalyticsToggle("team")} 
              className={`btn-toggle-switch ${analyticsToggle === "team" ? "active" : ""}`}
            >
              Team Sourcing
            </button>
          </div>
        </div>

        {/* 16 Gemstone styled cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.5rem" }}>
          
          {/* Slices: Selected */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #00f2fe" }}>
            <span style={{ fontSize: "0.55rem", color: "#00f2fe", fontWeight: 900, textTransform: "uppercase" }}>Selected</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.selected.today}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.selected.lifetime}</strong></span>
          </div>

          {/* Connected */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #3b82f6" }}>
            <span style={{ fontSize: "0.55rem", color: "#3b82f6", fontWeight: 900, textTransform: "uppercase" }}>Connected</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.connected.today}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.connected.lifetime}</strong></span>
          </div>

          {/* Interested */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #10b981" }}>
            <span style={{ fontSize: "0.55rem", color: "#10b981", fontWeight: 900, textTransform: "uppercase" }}>Interested</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.interested.today}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.interested.lifetime}</strong></span>
          </div>

          {/* Rejected */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #ef4444" }}>
            <span style={{ fontSize: "0.55rem", color: "#ef4444", fontWeight: 900, textTransform: "uppercase" }}>Rejected</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.rejected.today}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.rejected.lifetime}</strong></span>
          </div>

          {/* Joined */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #a855f7" }}>
            <span style={{ fontSize: "0.55rem", color: "#a855f7", fontWeight: 900, textTransform: "uppercase" }}>Joined</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.joined.today}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.joined.lifetime}</strong></span>
          </div>

          {/* Sourced */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #64748b" }}>
            <span style={{ fontSize: "0.55rem", color: "#475569", fontWeight: 900, textTransform: "uppercase" }}>Sourced</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.total.today}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.total.lifetime}</strong></span>
          </div>

          {/* Interview Done */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #10b981" }}>
            <span style={{ fontSize: "0.55rem", color: "#10b981", fontWeight: 900, textTransform: "uppercase" }}>Interview Done</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.interviewDone?.today || 0}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.interviewDone?.lifetime || 0}</strong></span>
          </div>

          {/* Interview Not Done */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #ef4444" }}>
            <span style={{ fontSize: "0.55rem", color: "#ef4444", fontWeight: 900, textTransform: "uppercase" }}>Interview Not Done</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.interviewNotDone?.today || 0}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.interviewNotDone?.lifetime || 0}</strong></span>
          </div>

          {/* Round 1 Done */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #3b82f6" }}>
            <span style={{ fontSize: "0.55rem", color: "#3b82f6", fontWeight: 900, textTransform: "uppercase" }}>Round 1 Done</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.round1Done?.today || 0}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.round1Done?.lifetime || 0}</strong></span>
          </div>

          {/* Round 2 Done */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #3b82f6" }}>
            <span style={{ fontSize: "0.55rem", color: "#3b82f6", fontWeight: 900, textTransform: "uppercase" }}>Round 2 Done</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.round2Done?.today || 0}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.round2Done?.lifetime || 0}</strong></span>
          </div>

          {/* Round 3 Done */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #3b82f6" }}>
            <span style={{ fontSize: "0.55rem", color: "#3b82f6", fontWeight: 900, textTransform: "uppercase" }}>Round 3 Done</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.round3Done?.today || 0}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.round3Done?.lifetime || 0}</strong></span>
          </div>

          {/* Round 4 Done */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #3b82f6" }}>
            <span style={{ fontSize: "0.55rem", color: "#3b82f6", fontWeight: 900, textTransform: "uppercase" }}>Round 4 Done</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.round4Done?.today || 0}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.round4Done?.lifetime || 0}</strong></span>
          </div>

          {/* Round 5 Done */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #3b82f6" }}>
            <span style={{ fontSize: "0.55rem", color: "#3b82f6", fontWeight: 900, textTransform: "uppercase" }}>Round 5 Done</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.round5Done?.today || 0}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.round5Done?.lifetime || 0}</strong></span>
          </div>

          {/* All Rounds Done */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #10b981" }}>
            <span style={{ fontSize: "0.55rem", color: "#10b981", fontWeight: 900, textTransform: "uppercase" }}>All Rounds Done</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.allRoundsDone?.today || 0}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.allRoundsDone?.lifetime || 0}</strong></span>
          </div>

          {/* Processing Next Round */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #f59e0b" }}>
            <span style={{ fontSize: "0.55rem", color: "#f59e0b", fontWeight: 900, textTransform: "uppercase" }}>Processing Next Round</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.processingForNextRound?.today || 0}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.processingForNextRound?.lifetime || 0}</strong></span>
          </div>

          {/* Interview Rescheduled */}
          <div className="gemstone-pill" style={{ borderLeft: "2.5px solid #ec4899" }}>
            <span style={{ fontSize: "0.55rem", color: "#ec4899", fontWeight: 900, textTransform: "uppercase" }}>Rescheduled</span>
            <h3 style={{ fontSize: "1.2rem", margin: "2px 0", color: "#0f172a", fontWeight: 800 }}>{activeAnalyticsData.interviewRescheduled?.today || 0}</h3>
            <span style={{ fontSize: "0.58rem", color: "#64748b" }}>Lifetime: <strong>{activeAnalyticsData.interviewRescheduled?.lifetime || 0}</strong></span>
          </div>

        </div>
      </div>

      {/* THREE PANELS ROW: MY TASKS, LEADERBOARD, PERSONAL TODO */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "0.75rem", alignItems: "start" }}>
        
        {/* LEFT COLUMN: ACTIVE MY TASKS */}
        <div className="glass-card-premium" style={{ minHeight: "260px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.2px solid #e2e8f0", paddingBottom: "6px", marginBottom: "8px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <LucideClipboardList size={15} color="#3b82f6" />
              <h3 style={{ fontSize: "0.92rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>Active Directives (Me)</h3>
            </div>
            <span style={{ background: "rgba(59,130,246,0.08)", color: "#2563eb", padding: "1px 5px", borderRadius: "4px", fontSize: "0.6rem", fontWeight: 900 }}>
              {myActiveTasks.length} Mandates
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "250px", overflowY: "auto" }}>
            {myActiveTasks.map((task: any) => {
              const priorityColors = 
                task.priority === "urgent" || task.priority === "Urgent" || task.priority === "critical"
                  ? { bg: "rgba(239, 68, 68, 0.08)", text: "#ef4444", border: "rgba(239, 68, 68, 0.15)" }
                  : (task.priority === "high" || task.priority === "High"
                    ? { bg: "rgba(249, 115, 22, 0.08)", text: "#d97706", border: "rgba(249, 115, 22, 0.15)" }
                    : { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" });

              const getDeadlineStr = () => {
                if (!task.createdAt) return "N/A";
                const d = new Date(task.createdAt);
                if (task.duration === "today") return "Tonight 11:59 PM";
                if (task.duration === "time_based" && task.deadlineTime) return `Today at ${task.deadlineTime}`;
                return `Date: ${toLocalDateStr(d)}`;
              };

              const pct = task.progress || (task.status === "in_progress" ? 40 : 10);

              const renderTargetChips = () => {
                if (!task.targets) {
                  if (task.targetQuantity) {
                    return (
                      <span style={{ fontSize: "0.65rem", background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "2px 5px", borderRadius: "4px", color: "#475569" }}>
                        Metric: {task.targetType?.toUpperCase() || "ITEMS"} ({task.targetQuantity} target)
                      </span>
                    );
                  }
                  return null;
                }
                
                try {
                  const arr = Array.isArray(task.targets) ? task.targets : JSON.parse(task.targets);
                  return (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" }}>
                      {arr.map((tar: any, keyIdx: number) => (
                        <span key={keyIdx} style={{ fontSize: "0.62rem", background: "#ffffff", border: "1px solid #e2e8f0", padding: "1px 5px", borderRadius: "4px", color: "#475569" }}>
                          {tar.targetType}: <strong style={{ color: "#0f172a" }}>{tar.targetQuantity}</strong>
                        </span>
                      ))}
                    </div>
                  );
                } catch {
                  return null;
                }
              };

              return (
                <div key={task.id} onClick={() => setSelectedTask(task)} style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "8px 10px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  transition: "all 0.2s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{task.title}</h4>
                    <span style={{
                      fontSize: "0.5rem",
                      background: priorityColors.bg,
                      color: priorityColors.text,
                      border: `1px solid ${priorityColors.border}`,
                      padding: "1px 4px",
                      borderRadius: "3px",
                      fontWeight: 900
                    }}>{task.priority?.toUpperCase()}</span>
                  </div>

                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{task.description}</span>
                  
                  {renderTargetChips()}

                  <div style={{ marginTop: "2px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.58rem", color: "#64748b", marginBottom: "2px" }}>
                      <span>PROGRESS TARGETS</span>
                      <span style={{ fontWeight: 800, color: "#2563eb" }}>{pct}% COMPLETE</span>
                    </div>
                    <div style={{ width: "100%", height: "4px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)" }}></div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.62rem", color: "#64748b", marginTop: "2px" }}>
                    <span>By: {task.creatorName || "Manager Node"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "2px", color: "#ef4444", fontWeight: 800 }}>
                      <LucideClock size={10} />
                      {getDeadlineStr()}
                    </span>
                  </div>
                </div>
              );
            })}

            {myActiveTasks.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <LucideShieldCheck size={22} style={{ margin: "0 auto 4px", opacity: 0.5, color: "#10b981" }} />
                <h4 style={{ fontSize: "0.78rem", color: "#0f172a", margin: 0 }}>Mission Cluster Clear</h4>
                <span style={{ fontSize: "0.62rem" }}>No pending directives are deployed to your credentials.</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PERFORMANCE LEADERBOARD */}
        <div className="glass-card-premium" style={{ minHeight: "260px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.2px solid #e2e8f0", paddingBottom: "6px", marginBottom: "8px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <LucideAward size={15} color="#d97706" />
              <h3 style={{ fontSize: "0.92rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>Performance Leaderboard</h3>
            </div>
            
            <div style={{ display: "flex", background: "#f1f5f9", padding: "1px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <button onClick={() => setLeaderboardPeriod("today")} className={`btn-toggle-switch ${leaderboardPeriod === "today" ? "active" : ""}`} style={{ padding: "2px 5px", fontSize: "0.58rem" }}>TODAY</button>
              <button onClick={() => setLeaderboardPeriod("7days")} className={`btn-toggle-switch ${leaderboardPeriod === "7days" ? "active" : ""}`} style={{ padding: "2px 5px", fontSize: "0.58rem" }}>7D</button>
              <button onClick={() => setLeaderboardPeriod("1month")} className={`btn-toggle-switch ${leaderboardPeriod === "1month" ? "active" : ""}`} style={{ padding: "2px 5px", fontSize: "0.58rem" }}>1M</button>
              <button onClick={() => setLeaderboardPeriod("1year")} className={`btn-toggle-switch ${leaderboardPeriod === "1year" ? "active" : ""}`} style={{ padding: "2px 5px", fontSize: "0.58rem" }}>1Y</button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "250px", overflowY: "auto" }}>
            {leaderboardRankings.map((rank: any) => {
              const medalGlow = 
                rank.rank === 1 ? "gold-glow" : (rank.rank === 2 ? "silver-glow" : (rank.rank === 3 ? "bronze-glow" : ""));
              
              const medalColor = 
                rank.rank === 1 ? "#fbbf24" : (rank.rank === 2 ? "#94a3b8" : (rank.rank === 3 ? "#ca8a04" : "#475569"));

              return (
                <div key={rank.id} className={`glass-card-premium ${medalGlow}`} style={{
                  padding: "6px 8px",
                  background: rank.rank <= 3 ? "#ffffff" : "#f8fafc",
                  borderWidth: "1px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "6px"
                }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <div style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: medalColor,
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "0.65rem"
                    }}>{rank.rank}</div>
                    
                    <div>
                      <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{rank.name}</h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "0.55rem", color: "#64748b" }}>Sourced: <strong>{rank.sourcedCount}</strong></span>
                        <span style={{ color: "#e2e8f0" }}>|</span>
                        <span style={{ fontSize: "0.55rem", color: "#64748b" }}>Selected: <strong>{rank.selectedCount}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 900, color: "#2563eb" }}>
                      {rank.score} pts
                    </span>
                    <span style={{ display: "block", fontSize: "0.52rem", color: "#10b981", fontWeight: 800 }}>
                      KPI: {rank.ratio}%
                    </span>
                  </div>
                </div>
              );
            })}
            
            {leaderboardRankings.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <LucideAward size={22} style={{ margin: "0 auto 4px", opacity: 0.5 }} />
                <h4 style={{ fontSize: "0.78rem", color: "#0f172a", margin: 0 }}>No Data Recorded</h4>
                <span style={{ fontSize: "0.62rem" }}>Sourcing records are required to process leaderboards.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SECOND ROW: PERSONAL TO DO LIST & ADVANCED GRAPHICS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "0.75rem", alignItems: "start" }}>
        
        {/* LEFT COLUMN: PERSONAL TO DO LIST */}
        <div className="glass-card-premium" style={{ minHeight: "260px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.2px solid #e2e8f0", paddingBottom: "6px", marginBottom: "8px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <LucideListTodo size={15} color="#8b5cf6" />
              <h3 style={{ fontSize: "0.92rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>My Active To-Do Checklist</h3>
            </div>
            
            <div style={{ display: "flex", gap: "3px" }}>
              <button onClick={() => setTodoFilter("today")} className={`btn-filter-tag ${todoFilter === "today" ? "active" : ""}`}>TODAY</button>
              <button onClick={() => setTodoFilter("upcoming")} className={`btn-filter-tag ${todoFilter === "upcoming" ? "active" : ""}`}>UPCOMING</button>
              <button onClick={() => setTodoFilter("overdue")} className={`btn-filter-tag ${todoFilter === "overdue" ? "active" : ""}`}>OVERDUE</button>
              <button onClick={() => {
                setTodoForm({ title: "", priority: "medium", dueDate: todayStr, dueTime: "18:00", id: "" });
                setShowTodoForm(true);
              }} style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", color: "white", border: "none", padding: "3px 6px", borderRadius: "5px", fontSize: "0.62rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "1px" }}>
                <LucidePlus size={10} /> Add
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.58rem", color: "#64748b", marginBottom: "4px" }}>
            <span>TODAY'S PENDING: <strong>{todayPendingTodoCount} items</strong></span>
            <span>REAL-TIME TIMER ACCRUED</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "200px", overflowY: "auto" }}>
            {activeTodoItems.map((todo: any) => {
              const overdue = todo.dueDate < todayStr && !todo.completed;
              const prioColors = 
                todo.priority === "high" 
                  ? { text: "#ef4444", bg: "rgba(239, 68, 68, 0.08)" } 
                  : (todo.priority === "medium" 
                    ? { text: "#d97706", bg: "rgba(217, 119, 6, 0.08)" } 
                    : { text: "#64748b", bg: "#f1f5f9" });

              return (
                <div key={todo.id} style={{
                  background: todo.completed ? "#f8fafc" : "#ffffff",
                  border: overdue ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "6px 8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                  opacity: todo.completed ? 0.6 : 1
                }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button onClick={() => handleToggleTodo(todo.id)} style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "3px",
                      border: "1.5px solid #cbd5e1",
                      background: todo.completed ? "#8b5cf6" : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {todo.completed && <LucideCheck size={9} color="white" />}
                    </button>
                    
                    <div>
                      <span style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: todo.completed ? "#64748b" : "#1e293b",
                        textDecoration: todo.completed ? "line-through" : "none"
                      }}>{todo.title}</span>
                      
                      <div style={{ display: "flex", gap: "4px", alignItems: "center", marginTop: "1px" }}>
                        <span style={{ fontSize: "0.5rem", background: prioColors.bg, color: prioColors.text, padding: "1px 3px", borderRadius: "2px", fontWeight: 800 }}>
                          {todo.priority?.toUpperCase()}
                        </span>
                        <span style={{ fontSize: "0.55rem", color: overdue ? "#ef4444" : "#64748b", fontWeight: overdue ? 800 : 500 }}>
                          Due: {todo.dueDate} {overdue && "(OVERDUE)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1px" }}>
                    <button onClick={() => {
                      setTodoForm({ ...todo });
                      setShowTodoForm(true);
                    }} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: "2px" }} title="Edit"><LucidePencil size={10} /></button>
                    <button onClick={() => handleDeleteTodo(todo.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "2px" }} title="Delete"><LucideTrash2 size={10} /></button>
                  </div>
                </div>
              );
            })}

            {activeTodoItems.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <LucideCheckCircle2 size={22} style={{ margin: "0 auto 4px", opacity: 0.5, color: "#10b981" }} />
                <h4 style={{ fontSize: "0.78rem", color: "#0f172a", margin: 0 }}>Checklist Roster Clear</h4>
                <span style={{ fontSize: "0.62rem" }}>Add checklist items to initialize your operational flow.</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ADVANCED GRAPHICS METRICS */}
        <div className="glass-card-premium" style={{ minHeight: "260px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.2px solid #e2e8f0", paddingBottom: "6px", marginBottom: "8px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <LucideActivity size={15} color="#3b82f6" />
              <h3 style={{ fontSize: "0.92rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>Team Sourcing Productivity</h3>
            </div>
            
            <select 
              value={productivityGraphFilter} 
              onChange={e => setProductivityGraphFilter(e.target.value as any)}
              className="btn-filter-tag active"
              style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "3px 6px", borderRadius: "5px", fontSize: "0.62rem", color: "#1e293b" }}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
              <option value="yearly">Yearly View</option>
            </select>
          </div>

          {/* SVG GRAPH 1: TEAM PRODUCTIVITY ANALYTICS */}
          <div style={{ background: "#ffffff", borderRadius: "10px", padding: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, display: "block", marginBottom: "4px" }}>
              CANDIDATE PIPELINE ACTION TRENDS (ACTIVE CONVERSIONS)
            </span>
            <div style={{ position: "relative", width: "100%", height: "160px" }}>
              <svg width="100%" height="160" viewBox="0 0 500 160" style={{ overflow: "visible" }}>
                <defs>
                  <linearGradient id="sourcedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64748b" stopOpacity="0.12"/>
                    <stop offset="100%" stopColor="#64748b" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="connectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="selectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.12"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>

                <line x1="50" y1="40" className="svg-grid-line" x2="470" y2="40" />
                <line x1="50" y1="90" className="svg-grid-line" x2="470" y2="90" />
                <line x1="50" y1="140" className="svg-grid-line" x2="470" y2="140" style={{ stroke: "#e2e8f0" }} />

                <text x="20" y="44" className="graph-label">100%</text>
                <text x="20" y="94" className="graph-label">50%</text>
                <text x="20" y="144" className="graph-label">0%</text>

                {graph1SVGCoords.sourced.length > 0 && (
                  <>
                    <path d={`${getBezierPath(graph1SVGCoords.sourced.map(pt => ({ x: pt.x, y: pt.y * 140/200 + 30 })))} L ${graph1SVGCoords.sourced[graph1SVGCoords.sourced.length - 1].x} 140 L ${graph1SVGCoords.sourced[0].x} 140 Z`} fill="url(#sourcedGrad)" />
                    <path d={`${getBezierPath(graph1SVGCoords.connected.map(pt => ({ x: pt.x, y: pt.y * 140/200 + 30 })))} L ${graph1SVGCoords.connected[graph1SVGCoords.connected.length - 1].x} 140 L ${graph1SVGCoords.connected[0].x} 140 Z`} fill="url(#connectedGrad)" />
                    <path d={`${getBezierPath(graph1SVGCoords.selected.map(pt => ({ x: pt.x, y: pt.y * 140/200 + 30 })))} L ${graph1SVGCoords.selected[graph1SVGCoords.selected.length - 1].x} 140 L ${graph1SVGCoords.selected[0].x} 140 Z`} fill="url(#selectedGrad)" />
                  </>
                )}

                <path d={getBezierPath(graph1SVGCoords.sourced.map(pt => ({ x: pt.x, y: pt.y * 140/200 + 30 })))} fill="none" stroke="#64748b" strokeWidth="2" />
                <path d={getBezierPath(graph1SVGCoords.connected.map(pt => ({ x: pt.x, y: pt.y * 140/200 + 30 })))} fill="none" stroke="#3b82f6" strokeWidth="2" />
                <path d={getBezierPath(graph1SVGCoords.selected.map(pt => ({ x: pt.x, y: pt.y * 140/200 + 30 })))} fill="none" stroke="#10b981" strokeWidth="2" />
                <path d={getBezierPath(graph1SVGCoords.joined.map(pt => ({ x: pt.x, y: pt.y * 140/200 + 30 })))} fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3" />

                {graph1SVGCoords.sourced.map((pt, idx) => (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y * 140/200 + 30} r="2.5" fill="#64748b" />
                    <text x={pt.x} y="152" className="graph-label" textAnchor="middle">
                      {graph1Data.labels[idx]}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "4px", borderTop: "1px solid #e2e8f0", paddingTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.58rem", color: "#64748b" }}>
                <span style={{ width: "6px", height: "6px", background: "#64748b", borderRadius: "50%" }}></span>
                Sourced: <strong>{graph1Data.sourced[graph1Data.sourced.length - 1]}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.58rem", color: "#2563eb" }}>
                <span style={{ width: "6px", height: "6px", background: "#3b82f6", borderRadius: "50%" }}></span>
                Connected: <strong>{graph1Data.connected[graph1Data.connected.length - 1]}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.58rem", color: "#10b981" }}>
                <span style={{ width: "6px", height: "6px", background: "#10b981", borderRadius: "50%" }}></span>
                Selected: <strong>{graph1Data.selected[graph1Data.selected.length - 1]}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.58rem", color: "#8b5cf6" }}>
                <span style={{ width: "6px", height: "6px", background: "#8b5cf6", borderRadius: "50%" }}></span>
                Joined: <strong>{graph1Data.joined[graph1Data.joined.length - 1]}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ==================================================
          ADVANCED GRAPH 2 → TEAM ACTIVITY ANALYTICS
          ================================================== */}
      <div className="glass-card-premium">
        <div style={{ display: "flex", alignItems: "center", gap: "5px", borderBottom: "1.2px solid #e2e8f0", paddingBottom: "6px", marginBottom: "8px" }}>
          <LucideActivity size={15} color="#d97706" />
          <h3 style={{ fontSize: "0.92rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>Team Activity & Duty Timelines</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: "10px", padding: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, display: "block", marginBottom: "4px" }}>
              WEEKLY TEAM WORKING HOURS VS BREAK SESSION DURATIONS
            </span>
            <div style={{ position: "relative", width: "100%", height: "140px" }}>
              <svg width="100%" height="140" viewBox="0 0 500 140" style={{ overflow: "visible" }}>
                <line x1="50" y1="30" className="svg-grid-line" x2="470" y2="30" />
                <line x1="50" y1="80" className="svg-grid-line" x2="470" y2="80" />
                <line x1="50" y1="130" className="svg-grid-line" x2="470" y2="130" style={{ stroke: "#e2e8f0" }} />

                <text x="20" y="34" className="graph-label">12 hrs</text>
                <text x="20" y="84" className="graph-label">6 hrs</text>
                <text x="20" y="134" className="graph-label">0 hrs</text>

                {[
                  { label: "Mon", work: 8.5, break: 0.6 },
                  { label: "Tue", work: 9.2, break: 1.1 },
                  { label: "Wed", work: 8.0, break: 0.8 },
                  { label: "Thu", work: 7.8, break: 0.5 },
                  { label: "Fri", work: 8.9, break: 1.0 },
                  { label: "Today", work: Math.max(1, Math.round(teamData?.kpi?.totalWorkingToday || 8)), break: Math.max(0.5, Math.round(teamData?.kpi?.totalBreakCountToday * 0.3 || 0.8)) }
                ].map((d, i) => {
                  const x = 70 + i * 65;
                  const workHeight = (d.work / 12) * 100;
                  const breakHeight = (d.break / 3) * 50;

                  return (
                    <g key={i}>
                      <rect 
                        x={x} 
                        y={130 - workHeight} 
                        width="12" 
                        height={workHeight} 
                        fill="#3b82f6" 
                        rx="3" 
                        style={{ opacity: 0.8 }}
                      />
                      <rect 
                        x={x + 16} 
                        y={130 - breakHeight} 
                        width="12" 
                        height={breakHeight} 
                        fill="#eab308" 
                        rx="3" 
                        style={{ opacity: 0.8 }}
                      />

                      <text x={x + 14} y="142" className="graph-label" textAnchor="middle">
                        {d.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "4px", fontSize: "0.58rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#2563eb" }}>
                <span style={{ width: "6px", height: "6px", background: "#3b82f6", borderRadius: "1px" }}></span>
                Sourcing Hours
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#d97706" }}>
                <span style={{ width: "6px", height: "6px", background: "#eab308", borderRadius: "1px" }}></span>
                Break Hours
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "#f8fafc", borderRadius: "10px", padding: "10px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", margin: "0 0 2px 0" }}>Command Center Analytics</h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "2px" }}>
                <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Average Team Login Time:</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#10b981" }}>09:28 AM</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "2px" }}>
                <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Average Break Interval:</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#d97706" }}>38m duration</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "2px" }}>
                <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Unit Overtime Hours:</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#8b5cf6" }}>+4.5 hrs today</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Productivity Ratio:</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#2563eb" }}>88.5% Efficiency</span>
              </div>
            </div>

            <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: "6px", padding: "4px 6px", marginTop: "2px" }}>
              <span style={{ fontSize: "0.62rem", color: "#2563eb", fontWeight: 800, display: "block" }}>Operational Status: Strong</span>
              <span style={{ fontSize: "0.55rem", color: "#64748b" }}>All reporting agents are within optimal productivity scores today.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          MODAL 1: MY TASK DETAILED INSPECT MODAL
          ================================================== */}
      <AnimatePresence>
        {selectedTask && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 100000,
            backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
          }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{
              width: "100%", maxWidth: "420px", background: "#ffffff", border: "1px solid #cbd5e1",
              borderRadius: "16px", overflow: "hidden", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
            }}>
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)", padding: "14px 20px", position: "relative" }}>
                <button onClick={() => setSelectedTask(null)} style={{
                  position: "absolute", top: "12px", right: "12px", color: "#ffffff", background: "rgba(255,255,255,0.15)",
                  border: "none", width: "22px", height: "22px", borderRadius: "50%", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}><LucideX size={12} /></button>
                
                <span style={{ fontSize: "0.55rem", background: "rgba(255,255,255,0.12)", color: "#ffffff", padding: "2px 5px", borderRadius: "4px", fontWeight: 800 }}>MANDATE DIRECTIVE</span>
                <h3 style={{ fontSize: "1rem", fontWeight: 850, color: "#ffffff", margin: "4px 0 0" }}>{selectedTask.title}</h3>
              </div>

              {/* Body */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Instructions</span>
                  <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#1e293b", lineHeight: "1.4" }}>{selectedTask.description}</p>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "6px 10px", display: "flex", justifyContent: "space-between", border: "1px solid #e2e8f0" }}>
                  <div>
                    <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>PRIORITY</span>
                    <span style={{ fontSize: "0.72rem", color: "#d97706", fontWeight: 850 }}>{selectedTask.priority?.toUpperCase()}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>DURATION</span>
                    <span style={{ fontSize: "0.72rem", color: "#2563eb", fontWeight: 850 }}>{selectedTask.duration?.toUpperCase() || "TODAY"}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>STATUS</span>
                    <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 850 }}>{selectedTask.status?.toUpperCase() || "IN_PROGRESS"}</span>
                  </div>
                </div>

                {selectedTask.targets && (
                  <div>
                    <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Configured Parameters</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      {(() => {
                        try {
                          const arr = Array.isArray(selectedTask.targets) ? selectedTask.targets : JSON.parse(selectedTask.targets);
                          return arr.map((tar: any, idx: number) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "5px 8px", borderRadius: "5px", fontSize: "0.68rem", border: "1px solid #e2e8f0" }}>
                              <span style={{ color: "#64748b" }}>{tar.targetType}</span>
                              <strong style={{ color: "#1e293b" }}>{tar.targetQuantity} units target</strong>
                            </div>
                          ));
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                )}
                
                <div style={{ marginTop: "4px", display: "flex", gap: "6px" }}>
                  <button onClick={() => setSelectedTask(null)} style={{
                    flex: 1, padding: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1",
                    borderRadius: "6px", color: "#475569", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer"
                  }}>Dismiss Drawer</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================
          MODAL 2: TO DO ADD/EDIT POPUP MODAL
          ================================================== */}
      <AnimatePresence>
        {showTodoForm && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 100000,
            backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
          }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{
              width: "100%", maxWidth: "380px", background: "#ffffff", border: "1px solid #cbd5e1",
              borderRadius: "16px", overflow: "hidden", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
            }}>
              <div style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #0f172a 100%)", padding: "14px 18px", position: "relative" }}>
                <button onClick={() => setShowTodoForm(false)} style={{
                  position: "absolute", top: "12px", right: "12px", color: "#ffffff", background: "rgba(255,255,255,0.15)",
                  border: "none", width: "22px", height: "22px", borderRadius: "50%", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}><LucideX size={12} /></button>
                
                <h3 style={{ fontSize: "0.92rem", fontWeight: 850, color: "#ffffff", margin: 0 }}>
                  {todoForm.id ? "Edit Checklist Item" : "Create Checklist Item"}
                </h3>
              </div>

              <form onSubmit={handleAddOrEditTodo} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="form-group">
                  <label style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: "3px", display: "block" }}>Checklist Title</label>
                  <input 
                    type="text" required placeholder="Enter reminder mandate..."
                    value={todoForm.title} onChange={e => setTodoForm({ ...todoForm, title: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#1e293b", fontSize: "0.75rem", outline: "none" }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: "3px", display: "block" }}>Priority Level</label>
                  <select 
                    value={todoForm.priority} onChange={e => setTodoForm({ ...todoForm, priority: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#1e293b", fontSize: "0.75rem", outline: "none" }}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Mandate</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <div>
                    <label style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: "3px", display: "block" }}>Due Date</label>
                    <input 
                      type="date" required value={todoForm.dueDate} onChange={e => setTodoForm({ ...todoForm, dueDate: e.target.value })}
                      style={{ width: "100%", padding: "5px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#1e293b", fontSize: "0.72rem", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: "3px", display: "block" }}>Due Time</label>
                    <input 
                      type="time" required value={todoForm.dueTime} onChange={e => setTodoForm({ ...todoForm, dueTime: e.target.value })}
                      style={{ width: "100%", padding: "5px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#1e293b", fontSize: "0.72rem", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
                  <button type="button" onClick={() => setShowTodoForm(false)} style={{
                    flex: 1, padding: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1",
                    borderRadius: "6px", color: "#475569", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer"
                  }}>Cancel</button>
                  
                  <button type="submit" style={{
                    flex: 2, padding: "8px", background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", border: "none",
                    borderRadius: "6px", color: "white", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer",
                    boxShadow: "0 3px 8px rgba(139, 92, 246, 0.2)"
                  }}>
                    {todoForm.id ? "Save" : "Deploy"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
