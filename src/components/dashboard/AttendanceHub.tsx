import React, { useState, useEffect, useRef } from "react";
import { 
  LucideCalendar, 
  LucideClock, 
  LucideLogOut, 
  LucideActivity, 
  LucideChevronDown, 
  LucideChevronUp, 
  LucideSearch, 
  LucideFilter, 
  LucideUserCheck, 
  LucideCoffee, 
  LucideShieldAlert, 
  LucideTrendingUp, 
  LucideEye, 
  LucideX, 
  LucideAlertCircle, 
  LucideInfo, 
  LucideTv,
  LucideMapPin,
  LucideSparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Shift {
  id?: number;
  name: string;
  startTime: string;
  endTime: string;
  requiredHours: string;
  lunchStartTime: string;
  lunchEndTime: string;
  earlyLoginAllowed: number;
  postShiftAllowed: number;
}

interface UserProfile {
  id: number;
  name: string;
  role: string;
  email: string;
  lastSeen?: string;
  shift?: Shift | null;
}

interface AttendanceRecord {
  id?: number;
  userId: number;
  date: string;
  totalWorkingHours?: string;
  totalBreakTime: number;
  totalOvertime: number;
  productivityStatus?: string;
  isIdle?: boolean;
  logoutCount?: number;
  logs?: any[];
  breaks?: any[];
}

interface EmployeeItem {
  id: number;
  user: UserProfile;
  attendance: AttendanceRecord | null;
}

export default function AttendanceHub() {
  const [employeesData, setEmployeesData] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [nowTick, setNowTick] = useState(new Date());
  
  // Filters State
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDatePreset, setFilterDatePreset] = useState<"today" | "custom">("today");
  
  // Drawer Details State
  const [drawerUserId, setDrawerUserId] = useState<number | null>(null);
  const [drawerUserHistory, setDrawerUserHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Tick the clock every second to update working timers live!
  useEffect(() => {
    const t = setInterval(() => setNowTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch Attendance List
  useEffect(() => {
    fetchAttendanceList();
    const interval = setInterval(fetchAttendanceList, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [selectedDate]);

  const fetchAttendanceList = async () => {
    try {
      const res = await fetch(`/api/attendance/hub?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setEmployeesData(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to sync attendance intelligence stream", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Employee History for Detail Drawer
  const fetchEmployeeHistory = async (userId: number) => {
    setLoadingHistory(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/attendance/hub?userId=${userId}&history=true&startDate=2026-01-01&endDate=${todayStr}`);
      if (res.ok) {
        const data = await res.json();
        setDrawerUserHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch employee logs timeline", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (drawerUserId) {
      fetchEmployeeHistory(drawerUserId);
    }
  }, [drawerUserId]);

  // Live calculations
  const getLiveWorkedMins = (record: EmployeeItem) => {
    if (!record.attendance) return 0;
    
    const att = record.attendance;
    const allLogs = att.logs || [];
    let totalMins = 0;

    allLogs.forEach((log: any) => {
      if (log.logoutTime) {
        totalMins += log.duration || 0;
      } else {
        // Active ticking session
        const loginTime = new Date(log.loginTime);
        const diff = Math.max(0, Math.round((nowTick.getTime() - loginTime.getTime()) / 60000));
        totalMins += diff;
      }
    });

    // Deduct active breaks
    const allBreaks = att.breaks || [];
    let breakMins = 0;
    allBreaks.forEach((b: any) => {
      if (b.endTime) {
        // If break occurs entirely within lunch breaks, it was not deducted, so don't add to deductible breaks
        const shift = record.user.shift;
        if (shift && shift.lunchStartTime && shift.lunchEndTime) {
          const bStart = new Date(b.startTime);
          const bEnd = new Date(b.endTime);
          const [lsh, lsm] = shift.lunchStartTime.split(':').map(Number);
          const [leh, lem] = shift.lunchEndTime.split(':').map(Number);
          
          const lunchS = new Date(bStart); lunchS.setHours(lsh, lsm, 0, 0);
          const lunchE = new Date(bStart); lunchE.setHours(leh, lem, 0, 0);

          if (bStart >= lunchS && bEnd <= lunchE) {
            return; // lunch break is exempted from break penalty
          }
        }
        breakMins += b.duration || 0;
      } else {
        // Active ticking break
        const breakStart = new Date(b.startTime);
        const diff = Math.max(0, Math.round((nowTick.getTime() - breakStart.getTime()) / 60000));
        
        // Exclude ticking break if it is inside active lunch break
        const shift = record.user.shift;
        let isLunchExempt = false;
        if (shift && shift.lunchStartTime && shift.lunchEndTime) {
          const [lsh, lsm] = shift.lunchStartTime.split(':').map(Number);
          const [leh, lem] = shift.lunchEndTime.split(':').map(Number);
          const currentMins = nowTick.getHours() * 60 + nowTick.getMinutes();
          const lunchStartMins = lsh * 60 + lsm;
          const lunchEndMins = leh * 60 + lem;
          if (currentMins >= lunchStartMins && currentMins <= lunchEndMins) {
            isLunchExempt = true;
          }
        }
        if (!isLunchExempt) {
          breakMins += diff;
        }
      }
    });

    return Math.max(0, totalMins - breakMins);
  };

  const getLiveBreakMins = (record: EmployeeItem) => {
    if (!record.attendance) return 0;
    
    const att = record.attendance;
    const allBreaks = att.breaks || [];
    let totalBreakMins = 0;

    allBreaks.forEach((b: any) => {
      if (b.endTime) {
        totalBreakMins += b.duration || 0;
      } else {
        const breakStart = new Date(b.startTime);
        const diff = Math.max(0, Math.round((nowTick.getTime() - breakStart.getTime()) / 60000));
        totalBreakMins += diff;
      }
    });

    return totalBreakMins;
  };

  const getLiveStatus = (record: EmployeeItem) => {
    if (!record.attendance) return "Logged Out";
    
    const att = record.attendance;
    const logs = att.logs || [];
    const isActive = logs.some((l: any) => !l.logoutTime);
    if (!isActive) return "Shift Ended";

    // Check if on break
    const breaks = att.breaks || [];
    const activeBreak = breaks.find((b: any) => !b.endTime);
    if (activeBreak) {
      const shift = record.user.shift;
      if (shift && shift.lunchStartTime && shift.lunchEndTime) {
        const [lsh, lsm] = shift.lunchStartTime.split(':').map(Number);
        const [leh, lem] = shift.lunchEndTime.split(':').map(Number);
        
        const currentMins = nowTick.getHours() * 60 + nowTick.getMinutes();
        const lunchStartMins = lsh * 60 + lsm;
        const lunchEndMins = leh * 60 + lem;
        if (currentMins >= lunchStartMins && currentMins <= lunchEndMins) {
          return "Lunch Break";
        }
      }
      return "On Break";
    }

    // Check if idle
    if (att.isIdle) return "Idle";

    // Check if overtime active
    const workedMins = getLiveWorkedMins(record);
    const reqMins = record.user.shift ? parseFloat(record.user.shift.requiredHours) * 60 : 480;
    if (workedMins > reqMins) return "Overtime Active";

    return "Working";
  };

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
  };

  const formatOvertimeDisplay = (record: EmployeeItem) => {
    if (!record.user.shift) return "--";
    const workedMins = getLiveWorkedMins(record);
    const reqMins = Math.round(parseFloat(record.user.shift.requiredHours) * 60);
    const diff = workedMins - reqMins;
    if (diff <= 0) return "--";
    return `+${formatMins(diff)}`;
  };

  const getStatusBorderColor = (record: EmployeeItem) => {
    if (!record.attendance || !record.user.shift) return "#cbd5e1"; // Offline/Unmapped grey
    const workedMins = getLiveWorkedMins(record);
    const reqMins = Math.round(parseFloat(record.user.shift.requiredHours) * 60);
    
    if (workedMins > reqMins) return "#eab308"; // Yellow (Overtime Active)
    if (workedMins === reqMins) return "#2563eb"; // Blue (Exact hours completed)
    return "#ef4444"; // Red (Under required hours)
  };

  // Main KPI counters
  const totalEmployeesCount = employeesData.length;
  const onlineCount = employeesData.filter(r => ["Working", "On Break", "Lunch Break", "Idle", "Overtime Active"].includes(getLiveStatus(r))).length;
  const breakCount = employeesData.filter(r => ["On Break", "Lunch Break"].includes(getLiveStatus(r))).length;
  const overtimeCount = employeesData.filter(r => {
    if (!r.attendance || !r.user.shift) return false;
    return getLiveWorkedMins(r) > (parseFloat(r.user.shift.requiredHours) * 60);
  }).length;
  const activeShiftsCount = Array.from(new Set(employeesData.filter(r => r.user.shift).map(r => r.user.shift?.id))).length;
  const loggedOutCount = employeesData.filter(r => getLiveStatus(r) === "Logged Out").length;

  // Filtered employees checklist
  const filteredRecords = employeesData.filter(r => {
    const matchesSearch = r.user.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          r.user.email.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesRole = filterRole === "all" || r.user.role?.toLowerCase() === filterRole.toLowerCase();
    
    const status = getLiveStatus(r);
    const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "overtime" && overtimeCount > 0 && getLiveWorkedMins(r) > (r.user.shift ? parseFloat(r.user.shift.requiredHours)*60 : 480)) ||
                          (filterStatus === "break" && ["On Break", "Lunch Break"].includes(status)) ||
                          status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getTimelineEvents = (record: EmployeeItem) => {
    if (!record.attendance) return [];
    
    const att = record.attendance;
    const logs = att.logs || [];
    const breaks = att.breaks || [];
    const events: { time: string; type: string; title: string; desc: string; icon: any; color: string }[] = [];

    logs.forEach(log => {
      events.push({
        time: new Date(log.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: "login",
        title: "Session Initiated",
        desc: `Logged in via ${log.deviceInfo || 'Portal'} (IP: ${log.ipAddress || '127.0.0.1'})`,
        icon: <LucideActivity size={12} />,
        color: "#2563eb"
      });

      if (log.logoutTime) {
        events.push({
          time: new Date(log.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: "logout",
          title: "Session Terminated",
          desc: `Logged out. Reason: ${log.logoutReason || 'Manual Exit'}`,
          icon: <LucideLogOut size={12} />,
          color: "#ef4444"
        });
      }
    });

    breaks.forEach(b => {
      const isLunch = b.type === "lunch";
      events.push({
        time: new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: isLunch ? "lunch_start" : "break_start",
        title: isLunch ? "Lunch Interval Started" : "Inactivity Break Started",
        desc: isLunch ? "Entered exempted lunch break window." : `Break timer triggered. ${b.type === "auto" ? "Inactivity detected." : "Manual break."}`,
        icon: <LucideCoffee size={12} />,
        color: isLunch ? "#eab308" : "#f97316"
      });

      if (b.endTime) {
        events.push({
          time: new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: isLunch ? "lunch_end" : "break_end",
          title: isLunch ? "Lunch Interval Finished" : "Inactivity Break Restored",
          desc: isLunch ? "Resumed regular shift operations." : `Resumed. Duration: ${b.duration} mins.`,
          icon: <LucideUserCheck size={12} />,
          color: "#10b981"
        });
      }
    });

    // Check if overtime reached
    if (record.user.shift) {
      const reqMins = parseFloat(record.user.shift.requiredHours) * 60;
      const logsSum = [];
      let runningTotal = 0;
      logs.forEach(log => {
        const loginTime = new Date(log.loginTime);
        const logoutTime = log.logoutTime ? new Date(log.logoutTime) : new Date();
        const duration = Math.round((logoutTime.getTime() - loginTime.getTime()) / 60000);
        runningTotal += duration;
        
        if (runningTotal >= reqMins && runningTotal - duration < reqMins) {
          const otTime = new Date(loginTime.getTime() + (reqMins - (runningTotal - duration)) * 60000);
          events.push({
            time: otTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: "overtime",
            title: "Overtime Activated",
            desc: `Required working hours (${record.user.shift?.requiredHours}H) completed.`,
            icon: <LucideTrendingUp size={12} />,
            color: "#eab308"
          });
        }
      });
    }

    return events.sort((a, b) => a.time.localeCompare(b.time));
  };

  const selectedRecord = employeesData.find(e => e.id === drawerUserId);

  return (
    <div className="attendance-hub p-large" style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
      
      {/* Page Header */}
      <div className="dash-header mb-large flex-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px", marginBottom: "30px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Attendance </span>
            <span style={{ color: "#2563eb" }}>Intelligence</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Live monitoring dashboard for employee shifts compliance, inactivity tracking, and real-time session logs.</p>
        </div>

        {/* Date Selector */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <button 
              onClick={() => { setFilterDatePreset("today"); setSelectedDate(new Date().toISOString().split('T')[0]); }}
              style={{ padding: "8px 14px", borderRadius: "8px", border: "none", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer", transition: "0.15s", background: filterDatePreset === "today" ? "white" : "transparent", color: filterDatePreset === "today" ? "#2563eb" : "#64748b" }}
            >
              Today
            </button>
            <button 
              onClick={() => setFilterDatePreset("custom")}
              style={{ padding: "8px 14px", borderRadius: "8px", border: "none", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer", transition: "0.15s", background: filterDatePreset === "custom" ? "white" : "transparent", color: filterDatePreset === "custom" ? "#2563eb" : "#64748b" }}
            >
              Calendar Date
            </button>
          </div>

          {filterDatePreset === "custom" && (
            <div className="date-picker-wrapper" style={{ display: "flex", alignItems: "center", gap: "8px", background: "white", padding: "4px 12px", borderRadius: "12px", border: "1.5px solid #cbd5e1" }}>
              <LucideCalendar size={16} color="#64748b" />
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)} 
                style={{ border: "none", outline: "none", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
              />
            </div>
          )}

          <button onClick={fetchAttendanceList} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "10px 16px", borderRadius: "12px", cursor: "pointer", fontWeight: 800, fontSize: "0.85rem" }}>
            <LucideActivity size={16} /> Sync Stream
          </button>
        </div>
      </div>

      {/* KPI Stream Counters */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "30px" }}>
        
        {/* Total Logged In */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideUserCheck size={24} /></div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Workforce Online</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1e293b", marginTop: "2px" }}>{onlineCount} <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>/ {totalEmployeesCount}</span></div>
          </div>
        </div>

        {/* On Break */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideCoffee size={24} /></div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Employees On Break</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#d97706", marginTop: "2px" }}>{breakCount}</div>
          </div>
        </div>

        {/* Overtime Active */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideTrendingUp size={24} /></div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Overtime Active</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#16a34a", marginTop: "2px" }}>{overtimeCount}</div>
          </div>
        </div>

        {/* Active Shifts */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideClock size={24} /></div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Active Shifts Mapped</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#7c3aed", marginTop: "2px" }}>{activeShiftsCount}</div>
          </div>
        </div>

        {/* Total Logged Out */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideLogOut size={24} /></div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Offline Nodes</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#475569", marginTop: "2px" }}>{loggedOutCount}</div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Toolbar */}
      <div style={{ background: "#ffffff", padding: "16px 24px", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.01)" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
          
          {/* Search bar */}
          <div style={{ minWidth: "260px", display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", padding: "10px 16px", borderRadius: "14px", border: "1px solid #e2e8f0", flex: 1 }}>
            <LucideSearch size={16} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search employee by name, role or email..." 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ border: "none", background: "none", outline: "none", width: "100%", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}
            />
          </div>

          {/* Role Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#64748b" }}><LucideFilter size={12} style={{ display: "inline", marginRight: "4px" }} /> ROLE:</span>
            <select 
              value={filterRole} 
              onChange={e => setFilterRole(e.target.value)}
              style={{ padding: "10px 16px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "0.82rem", fontWeight: 800, outline: "none", cursor: "pointer" }}
            >
              <option value="all">All Roles</option>
              <option value="manager">Manager</option>
              <option value="tl">Team Lead</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#64748b" }}><LucideActivity size={12} style={{ display: "inline", marginRight: "4px" }} /> STATUS:</span>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: "10px 16px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "0.82rem", fontWeight: 800, outline: "none", cursor: "pointer" }}
            >
              <option value="all">All States</option>
              <option value="working">Working</option>
              <option value="break">On Break</option>
              <option value="idle">Idle</option>
              <option value="logged out">Logged Out</option>
              <option value="shift ended">Shift Ended</option>
              <option value="overtime">Overtime Active</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        {(searchText || filterRole !== "all" || filterStatus !== "all") && (
          <button 
            onClick={() => { setSearchText(""); setFilterRole("all"); setFilterStatus("all"); }}
            style={{ border: "none", background: "#fee2e2", color: "#ef4444", fontSize: "0.78rem", fontWeight: 900, padding: "10px 20px", borderRadius: "14px", cursor: "pointer" }}
          >
            Clear Active Filters
          </button>
        )}
      </div>

      {/* Main Table Directory */}
      <div style={{ background: "#ffffff", borderRadius: "28px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 30px -15px rgba(0,0,0,0.03)" }}>
        <table className="w-full text-left" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "18px 24px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Employee Node</th>
              <th style={{ padding: "18px 24px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Assigned Shift Details</th>
              <th style={{ padding: "18px 24px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Login / Logout Windows</th>
              <th style={{ padding: "18px 24px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Live Work Progress</th>
              <th style={{ padding: "18px 24px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Breaks Taken</th>
              <th style={{ padding: "18px 24px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Overtime Tracker</th>
              <th style={{ padding: "18px 24px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Live Operations Status</th>
              <th style={{ padding: "18px 24px", fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: "60px 0", textAlign: "center", color: "#64748b", fontWeight: 700 }}>
                  <LucideActivity size={32} className="animate-spin" color="#2563eb" style={{ margin: "0 auto 12px" }} />
                  Synchronizing Workforce Data Nodes...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "80px 0", textAlign: "center", color: "#94a3b8", fontWeight: 700 }}>
                  <LucideShieldAlert size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
                  <h3>No Employee Nodes Detected</h3>
                  <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>No workforce records match filters for this cycle.</p>
                </td>
              </tr>
            ) : filteredRecords.map((record) => {
              const liveStatus = getLiveStatus(record);
              const liveWorkedMins = getLiveWorkedMins(record);
              const liveBreakMins = getLiveBreakMins(record);
              const statusColor = getStatusBorderColor(record);
              
              // Get login/logout times
              const logs = record.attendance?.logs || [];
              const firstLoginStr = logs.length > 0 ? new Date(logs[0].loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--";
              const lastLogoutStr = logs.length > 0 && logs[logs.length - 1].logoutTime 
                ? new Date(logs[logs.length - 1].logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : (liveStatus === "Logged Out" ? "--" : "ACTIVE");

              return (
                <tr 
                  key={record.id} 
                  style={{ borderBottom: "1px solid #f1f5f9", background: liveStatus === "Logged Out" ? "rgba(248, 250, 252, 0.4)" : "white", transition: "all 0.15s" }}
                  className="hover-row"
                >
                  {/* User Profile */}
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ 
                        width: "38px", 
                        height: "38px", 
                        borderRadius: "12px", 
                        background: record.user.role === "manager" ? "#fdf2f8" : (record.user.role === "tl" ? "#f5f3ff" : "#f0fdf4"),
                        color: record.user.role === "manager" ? "#db2777" : (record.user.role === "tl" ? "#7c3aed" : "#16a34a"),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: "0.95rem"
                      }}>
                        {record.user.name[0]}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{record.user.name}</strong>
                          <span style={{ 
                            fontSize: "0.58rem", 
                            fontWeight: 900, 
                            background: record.user.role === "manager" ? "#fdf2f8" : (record.user.role === "tl" ? "#f5f3ff" : "#f0fdf4"),
                            color: record.user.role === "manager" ? "#db2777" : (record.user.role === "tl" ? "#7c3aed" : "#16a34a"),
                            padding: "2px 5px",
                            borderRadius: "5px",
                            textTransform: "uppercase"
                          }}>{record.user.role}</span>
                        </div>
                        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{record.user.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Assigned Shift */}
                  <td style={{ padding: "16px 24px" }}>
                    {record.user.shift ? (
                      <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b" }}>{record.user.shift.name}</span>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          <LucideClock size={12} style={{ display: "inline", marginRight: "3px", verticalAlign: "middle" }} /> 
                          {record.user.shift.startTime} - {record.user.shift.endTime}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 800 }}>-- No Shift Assigned --</span>
                    )}
                  </td>

                  {/* Allowed Login/Logout Timings */}
                  <td style={{ padding: "16px 24px" }}>
                    {record.attendance ? (
                      <div>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569", display: "block" }}>
                          IN: <strong style={{ color: "#2563eb" }}>{firstLoginStr}</strong>
                        </span>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569" }}>
                          OUT: <strong style={{ color: lastLogoutStr === "ACTIVE" ? "#16a34a" : "#ef4444" }}>{lastLogoutStr}</strong>
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>Not Checked In</span>
                    )}
                  </td>

                  {/* Live Worked Hours */}
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "inline-flex", flexDirection: "column" }}>
                      <div style={{ 
                        fontSize: "1.1rem", 
                        fontWeight: 950, 
                        color: statusColor, 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px",
                        borderLeft: `3px solid ${statusColor}`,
                        paddingLeft: "8px"
                      }}>
                        {formatMins(liveWorkedMins)}
                      </div>
                      <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", marginTop: "2px" }}>
                        Req: {record.user.shift ? record.user.shift.requiredHours : 8} Hrs
                      </span>
                    </div>
                  </td>

                  {/* Breaks Taken */}
                  <td style={{ padding: "16px 24px" }}>
                    {record.attendance ? (
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#475569", display: "flex", alignItems: "center", gap: "4px" }}>
                          <LucideCoffee size={13} color="#f97316" /> {formatMins(liveBreakMins)}
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700 }}>
                          {record.attendance.breaks?.length || 0} breaks registered
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>--</span>
                    )}
                  </td>

                  {/* Overtime Tracker */}
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      fontSize: "0.88rem", 
                      fontWeight: 900, 
                      color: record.user.shift && liveWorkedMins > (parseFloat(record.user.shift.requiredHours) * 60) ? "#eab308" : "#cbd5e1"
                    }}>
                      {formatOvertimeDisplay(record)}
                    </span>
                  </td>

                  {/* Live Status Badge */}
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      padding: "5px 12px", 
                      borderRadius: "10px", 
                      fontSize: "0.7rem", 
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                      background: 
                        liveStatus === "Working" ? "#dbeafe" :
                        liveStatus === "On Break" ? "#ffedd5" :
                        liveStatus === "Lunch Break" ? "#fef9c3" :
                        liveStatus === "Idle" ? "#f1f5f9" :
                        liveStatus === "Overtime Active" ? "#fef3c7" :
                        liveStatus === "Shift Ended" ? "#fee2e2" : "#f1f5f9",
                      color: 
                        liveStatus === "Working" ? "#1e40af" :
                        liveStatus === "On Break" ? "#c2410c" :
                        liveStatus === "Lunch Break" ? "#a16207" :
                        liveStatus === "Idle" ? "#475569" :
                        liveStatus === "Overtime Active" ? "#a16207" :
                        liveStatus === "Shift Ended" ? "#991b1b" : "#475569",
                      border: `1.5px solid ${
                        liveStatus === "Working" ? "#bfdbfe" :
                        liveStatus === "On Break" ? "#fed7aa" :
                        liveStatus === "Lunch Break" ? "#fef08a" :
                        liveStatus === "Idle" ? "#cbd5e1" :
                        liveStatus === "Overtime Active" ? "#fef08a" :
                        liveStatus === "Shift Ended" ? "#fecaca" : "#cbd5e1"
                      }`
                    }}>
                      {liveStatus}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button 
                      onClick={() => setDrawerUserId(record.id)}
                      className="btn-secondary" 
                      style={{ 
                        padding: "8px 12px", 
                        borderRadius: "10px", 
                        border: "1px solid #cbd5e1", 
                        background: "white", 
                        cursor: "pointer", 
                        fontSize: "0.78rem", 
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s"
                      }}
                    >
                      <LucideEye size={14} /> Audit Profile
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Slide-out Employee Attendance Details Drawer Modal */}
      <AnimatePresence>
        {drawerUserId !== null && selectedRecord && (
          <div className="drawer-overlay" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)", zIndex: 1000000, display: "flex", justifyContent: "flex-end" }} onClick={() => setDrawerUserId(null)}>
            <motion.div 
              initial={{ x: "100%", opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="drawer-container glass-card"
              style={{ width: "100%", maxWidth: "600px", height: "100vh", background: "white", padding: "30px", overflowY: "auto", boxShadow: "-20px 0 50px rgba(0,0,0,0.15)" }}
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Drawer Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px", marginBottom: "24px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.62rem", fontWeight: 900, textTransform: "uppercase", padding: "2px 6px", borderRadius: "6px", background: selectedRecord.user.role === "manager" ? "#fdf2f8" : (selectedRecord.user.role === "tl" ? "#f5f3ff" : "#f0fdf4"), color: selectedRecord.user.role === "manager" ? "#db2777" : (selectedRecord.user.role === "tl" ? "#7c3aed" : "#16a34a") }}>{selectedRecord.user.role}</span>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>•</span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 800 }}>Audit Logs & Activity Profile</span>
                  </div>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 950, letterSpacing: "-0.5px", margin: 0, color: "#0f172a" }}>{selectedRecord.user.name}</h2>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "2px 0 0" }}>{selectedRecord.user.email}</p>
                </div>
                <button 
                  onClick={() => setDrawerUserId(null)}
                  style={{ background: "#f1f5f9", border: "none", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <LucideX size={18} />
                </button>
              </div>

              {selectedRecord.attendance ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  {/* Real-time Analytics Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.62rem", textTransform: "uppercase", fontWeight: 800, color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}><LucideClock size={12} /> Live Workload</span>
                      <div style={{ fontSize: "1.4rem", fontWeight: 900, color: getStatusBorderColor(selectedRecord), marginTop: "6px" }}>
                        {formatMins(getLiveWorkedMins(selectedRecord))}
                      </div>
                      <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, display: "block", marginTop: "2px" }}>
                        Required hours: {selectedRecord.user.shift ? selectedRecord.user.shift.requiredHours : 8} Hrs
                      </span>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.62rem", textTransform: "uppercase", fontWeight: 800, color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}><LucideCoffee size={12} /> Total Inactivity</span>
                      <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f97316", marginTop: "6px" }}>
                        {formatMins(getLiveBreakMins(selectedRecord))}
                      </div>
                      <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, display: "block", marginTop: "2px" }}>
                        {selectedRecord.attendance.breaks?.length || 0} break intervals registered
                      </span>
                    </div>
                  </div>

                  {/* Active Shift details */}
                  {selectedRecord.user.shift && (
                    <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", padding: "18px", borderRadius: "20px", border: "1px solid #bfdbfe", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 900, color: "#1e40af", display: "flex", alignItems: "center", gap: "6px" }}><LucideSparkles size={14} /> Active Shift Specifications</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.78rem" }}>
                        <div>
                          <span style={{ color: "#475569", fontWeight: 600 }}>Shift Name:</span>
                          <strong style={{ color: "#1e3a8a", display: "block" }}>{selectedRecord.user.shift.name}</strong>
                        </div>
                        <div>
                          <span style={{ color: "#475569", fontWeight: 600 }}>Timings:</span>
                          <strong style={{ color: "#1e3a8a", display: "block" }}>{selectedRecord.user.shift.startTime} - {selectedRecord.user.shift.endTime}</strong>
                        </div>
                        <div>
                          <span style={{ color: "#475569", fontWeight: 600 }}>Early Entry Allowed:</span>
                          <strong style={{ color: "#1e3a8a", display: "block" }}>-{selectedRecord.user.shift.earlyLoginAllowed} mins before</strong>
                        </div>
                        <div>
                          <span style={{ color: "#475569", fontWeight: 600 }}>Stay Limit Allowed:</span>
                          <strong style={{ color: "#1e3a8a", display: "block" }}>+{selectedRecord.user.shift.postShiftAllowed} mins after</strong>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <span style={{ color: "#475569", fontWeight: 600 }}>Exempted Lunch Window:</span>
                          <strong style={{ color: "#1e3a8a", display: "block" }}>{selectedRecord.user.shift.lunchStartTime} - {selectedRecord.user.shift.lunchEndTime} (30 mins)</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CSS Vertical Operations Timeline */}
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}><LucideActivity size={18} color="#2563eb" /> Operational Timeline (Today)</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0px", paddingLeft: "10px", borderLeft: "2px solid #e2e8f0", marginLeft: "10px" }}>
                      {getTimelineEvents(selectedRecord).map((ev, i) => (
                        <div key={i} style={{ position: "relative", paddingBottom: "20px", paddingLeft: "20px" }}>
                          {/* Timeline dot */}
                          <div style={{ 
                            position: "absolute", 
                            left: "-18px", 
                            top: "2px", 
                            width: "14px", 
                            height: "14px", 
                            borderRadius: "50%", 
                            background: ev.color, 
                            border: "3px solid white", 
                            boxShadow: "0 0 0 2px #e2e8f0" 
                          }} />
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#1e293b" }}>{ev.title}</span>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "monospace", fontWeight: 800 }}>{ev.time}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>{ev.desc}</p>
                        </div>
                      ))}
                      {getTimelineEvents(selectedRecord).length === 0 && (
                        <div style={{ padding: "10px 0", color: "#94a3b8", fontSize: "0.85rem", fontWeight: 700 }}>No operations logged yet.</div>
                      )}
                    </div>
                  </div>

                  {/* Sessions & Break logs breakdown tabs */}
                  <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "20px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "#0f172a", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}><LucideTv size={18} color="#7c3aed" /> Daily Session Logs breakdown</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {selectedRecord.attendance.logs?.map((log: any, i: number) => {
                        const startStr = new Date(log.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const endStr = log.logoutTime ? new Date(log.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "ACTIVE";
                        
                        return (
                          <div key={i} style={{ background: "#ffffff", padding: "14px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.01)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b" }}>{startStr} → {endStr}</span>
                              <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", color: "#475569", fontWeight: 800 }}>{log.duration || 0} mins</span>
                            </div>
                            <div style={{ display: "flex", gap: "12px", fontSize: "0.72rem", color: "#64748b", flexWrap: "wrap" }}>
                              <span><LucideTv size={12} style={{ verticalAlign: "middle", marginRight: "3px" }} /> {log.deviceInfo || "Portal"}</span>
                              <span><LucideMapPin size={12} style={{ verticalAlign: "middle", marginRight: "3px" }} /> IP: {log.ipAddress || "127.0.0.1"}</span>
                            </div>
                            {log.logoutReason && (
                              <div style={{ 
                                marginTop: "8px", 
                                fontSize: "0.72rem", 
                                color: log.logoutReason.includes("direct logout") ? "#ef4444" : "#475569",
                                background: log.logoutReason.includes("direct logout") ? "#fef2f2" : "#f8fafc",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: `1px solid ${log.logoutReason.includes("direct logout") ? "#fee2e2" : "#f1f5f9"}`,
                                fontWeight: 600
                              }}>
                                <LucideInfo size={12} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                                Reason: {log.logoutReason}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                  <LucideAlertCircle size={40} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
                  <h3 style={{ fontWeight: 800 }}>Employee is Offline</h3>
                  <p style={{ fontSize: "0.85rem" }}>No session checking or operations logged for this employee today.</p>
                  
                  {selectedRecord.user.shift && (
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", marginTop: "24px", textAlign: "left" }}>
                      <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Schedule Specs</span>
                      <strong style={{ fontSize: "0.92rem", color: "#1e293b", display: "block" }}>{selectedRecord.user.shift.name}</strong>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Required Timings: {selectedRecord.user.shift.startTime} - {selectedRecord.user.shift.endTime}</span>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .date-picker-wrapper input::-webkit-calendar-picker-indicator {
          cursor: pointer;
        }
        .hover-row:hover {
          background: #faf5ff !important;
          transform: scale(1.001);
          box-shadow: 0 4px 12px rgba(0,0,0,0.01) inset;
        }
      `}</style>
    </div>
  );
}
