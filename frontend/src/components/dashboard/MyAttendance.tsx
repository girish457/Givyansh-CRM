import React, { useState, useEffect } from "react";
import { 
  LucideCalendar, LucideClock, LucideActivity, LucideBriefcase, LucideTrendingUp, 
  LucideSearch, LucideClock3, LucideDatabase, LucideAlertCircle, LucideUser, 
  LucideCheckCircle2, LucideXCircle, LucideX, LucideZap, LucideCoffee, LucideTimer, 
  LucideAward, LucideChevronRight, LucideFilter, LucideChevronLeft, LucideLoader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MyAttendance({ userId, userCreatedAt }: { userId: number, userCreatedAt?: string }) {
  const [attendance, setAttendance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // selectedDate is strictly locked to today's date for live tracking on the main page
  const selectedDate = new Date().toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"Today" | "Weekly" | "Monthly" | "Custom">("Weekly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [liveSeconds, setLiveSeconds] = useState(0);

  // Resume Workout pop-up states for Point 9
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [hasCheckedResume, setHasCheckedResume] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [pausedSeconds, setPausedSeconds] = useState<number | null>(null);

  // Calendar states for Point 7
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // Details Modal states for Point 10
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [modalAttendance, setModalAttendance] = useState<any>(null);
  const [loadingModal, setLoadingModal] = useState(false);

  // Custom Popups for Duty Accruals Today
  const [showBreaksPopup, setShowBreaksPopup] = useState(false);
  const [showOvertimePopup, setShowOvertimePopup] = useState(false);

  // SAFE INDEXING Safeguard (cures crash on empty history)
  const assignedShift = attendance?.user?.shift || attendance?.shift || (history && history.length > 0 ? (history[0]?.user?.shift || history[0]?.shift) : null);
  const activeLogs = assignedShift ? (attendance?.logs || []) : [];

  // Poll current day's check-in status every 15 seconds
  useEffect(() => {
    if (userId) {
      fetchMyAttendance();
      const interval = setInterval(fetchMyAttendance, 15000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Fetch full history logs when user changes, or when today's attendance updates
  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId, attendance?.loginTime, attendance?.logoutTime, attendance?.totalOvertime]);

  // Keep live ticking clock alive every second to update durations in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch modal details when modalDate is set
  useEffect(() => {
    if (modalDate && userId) {
      fetchModalAttendance(modalDate);
    } else {
      setModalAttendance(null);
    }
  }, [modalDate, userId]);

  // Set resume pop-up states on attendance fetch (Point 9)
  useEffect(() => {
    if (attendance && !hasCheckedResume) {
      const hasAcknowledgedToday = sessionStorage.getItem(`resumed_session_${userId}_${selectedDate}`);
      if (assignedShift && !hasAcknowledgedToday) {
        const activeLog = attendance.logs?.find((l: any) => !l.logoutTime);
        const completedLogs = attendance.logs?.filter((l: any) => l.logoutTime) || [];
        if (activeLog && completedLogs.length > 0) {
          setShowResumePopup(true);
          setIsTimerPaused(true);
          
          let completedMins = 0;
          completedLogs.forEach((log: any) => {
            completedMins += log.duration || 0;
          });
          setPausedSeconds(completedMins * 60);
        }
      }
      setHasCheckedResume(true);
    }
  }, [attendance, hasCheckedResume, assignedShift, userId, selectedDate]);

  const fetchMyAttendance = async () => {
    try {
      const res = await fetch(`/api/attendance/hub?date=${selectedDate}&userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAttendance(Array.isArray(data) && data.length > 0 ? data[0] : null);
      }
    } catch (err) {
      console.error("Failed to fetch my attendance for today", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModalAttendance = async (dateStr: string) => {
    setLoadingModal(true);
    try {
      const res = await fetch(`/api/attendance/hub?date=${dateStr}&userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setModalAttendance(Array.isArray(data) && data.length > 0 ? data[0] : null);
      }
    } catch (err) {
      console.error("Failed to fetch modal attendance", err);
    } finally {
      setLoadingModal(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const url = `/api/attendance/hub?userId=${userId}&history=true`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setHistory(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch attendance history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Safe time parser (HH:MM:SS or HH:MM -> minutes)
  const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 0;
    return parts[0] * 60 + parts[1];
  };

  // Format minutes to short string
  const formatMins = (mins: number) => {
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.floor(Math.abs(mins) % 60);
    return `${h > 0 ? `${h}h ` : ""}${m}m`;
  };

  // Convert minutes to digital tick (HH:MM:SS)
  const formatMinsToSecondsStr = (mins: number) => {
    const totalSecs = Math.round(mins * 60);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // Format 24hr string to 12hr AM/PM string
  const formatMinsTo12Hr = (timeStr: string | null) => {
    if (!timeStr) return "N/A";
    const parts = timeStr.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return timeStr;
    const sh = parts[0];
    const sm = parts[1];
    const ampm = sh >= 12 ? 'PM' : 'AM';
    const hours12 = sh % 12 || 12;
    const minsStr = sm < 10 ? `0${sm}` : sm;
    return `${hours12}:${minsStr} ${ampm}`;
  };

  // Convert Javascript Date or ISO string to standard 12hr format
  const formatDateTo12Hr = (dateObj: string | Date | null) => {
    if (!dateObj) return "N/A";
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return "N/A";
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const mStr = m < 10 ? `0${m}` : m;
    const hStr = h12 < 10 ? `0${h12}` : h12;
    return `${hStr}:${mStr} ${ampm}`;
  };

  // Format dynamic minutes of day (e.g. 580 mins -> 09:40 AM)
  const formatMinutesToTimeStr = (totalMins: number) => {
    if (isNaN(totalMins) || totalMins < 0) return "N/A";
    const hours24 = Math.floor(totalMins / 60) % 24;
    const minutes = Math.floor(totalMins % 60);
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    const minsStr = minutes < 10 ? `0${minutes}` : minutes;
    const hrsStr = hours12 < 10 ? `0${hours12}` : hours12;
    return `${hrsStr}:${minsStr} ${ampm}`;
  };

  // Calculate Check-In Punctuality
  const getLoginPunctuality = (loginTime: string | Date | null, shiftStartStr: string | null) => {
    if (!loginTime) {
      if (shiftStartStr) {
        return { text: "Not Logged In", status: "Offline", diffMins: 0, color: "#64748b" };
      }
      return { text: "No shift", status: "Neutral", diffMins: 0, color: "#64748b" };
    }
    if (!shiftStartStr) return { text: "No shift", status: "Neutral", diffMins: 0, color: "#64748b" };
    
    const loginDate = new Date(loginTime);
    const loginMins = loginDate.getHours() * 60 + loginDate.getMinutes();
    
    const shiftMins = parseTimeToMinutes(shiftStartStr);
    const diffMins = loginMins - shiftMins;
    
    if (Math.abs(diffMins) <= 2) {
      return { text: "On Time", status: "OnTime", diffMins, color: "#10b981" };
    } else if (diffMins < 0) {
      const absDiff = Math.abs(diffMins);
      const timeText = formatMins(absDiff);
      return { text: `Early (+${timeText})`, status: "Early", diffMins, color: "#2563eb" };
    } else {
      const absDiff = Math.abs(diffMins);
      const timeText = formatMins(absDiff);
      return { text: `Late (-${timeText})`, status: "Late", diffMins, color: "#ef4444" };
    }
  };

  // Calculate Check-Out Punctuality
  const getLogoutPunctuality = (logoutTime: string | Date | null, shiftEndStr: string | null) => {
    if (!logoutTime || !shiftEndStr) return { text: "Active", status: "Neutral", diffMins: 0, color: "#64748b" };
    
    const logoutDate = new Date(logoutTime);
    const logoutMins = logoutDate.getHours() * 60 + logoutDate.getMinutes();
    
    const shiftMins = parseTimeToMinutes(shiftEndStr);
    const diffMins = logoutMins - shiftMins;
    
    if (diffMins < -5) {
      const absDiff = Math.abs(diffMins);
      const timeText = formatMins(absDiff);
      return { text: `Early (-${timeText})`, status: "Early", diffMins, color: "#ef4444" };
    } else if (diffMins > 5) {
      const absDiff = Math.abs(diffMins);
      const timeText = formatMins(absDiff);
      return { text: `Overtime (+${timeText})`, status: "Overtime", diffMins, color: "#d97706" };
    } else {
      return { text: "Proper Out", status: "Proper", diffMins, color: "#10b981" };
    }
  };



  const firstLogin = assignedShift ? (attendance?.loginTime || (activeLogs.length > 0 ? activeLogs[0].loginTime : null)) : null;
  const lastLogin = assignedShift ? (activeLogs.length > 0 ? activeLogs[activeLogs.length - 1].loginTime : null) : null;
  const allLoginTimes = assignedShift ? (activeLogs.map((l: any) => l.loginTime)) : [];
  
  const lastLogout = assignedShift ? (attendance?.logoutTime || (activeLogs.length > 0 ? [...activeLogs].reverse().find(l => l.logoutTime)?.logoutTime : null)) : null;
  const allLogoutTimes = assignedShift ? (activeLogs.filter((l: any) => l.logoutTime).map((l: any) => l.logoutTime)) : [];
  const totalLogoutCount = allLogoutTimes.length;

  const todayLoginPunctuality = assignedShift 
    ? getLoginPunctuality(firstLogin, assignedShift?.startTime) 
    : { text: "No shift", status: "Neutral", diffMins: 0, color: "#64748b" };
  const todayLogoutPunctuality = assignedShift 
    ? getLogoutPunctuality(lastLogout, assignedShift?.endTime) 
    : { text: "No shift", status: "Neutral", diffMins: 0, color: "#64748b" };

  // Early Login calculation
  let earlyLoginMins = 0;
  if (firstLogin && assignedShift?.startTime) {
    const loginD = new Date(firstLogin);
    const checkInMins = loginD.getHours() * 60 + loginD.getMinutes();
    const shiftStartMins = parseTimeToMinutes(assignedShift.startTime);
    if (checkInMins < shiftStartMins) {
      earlyLoginMins = shiftStartMins - checkInMins;
    }
  }

  // Late Logout calculation
  let lateLogoutMins = 0;
  if (lastLogout && assignedShift?.endTime) {
    const logoutD = new Date(lastLogout);
    const checkOutMins = logoutD.getHours() * 60 + logoutD.getMinutes();
    const shiftEndMins = parseTimeToMinutes(assignedShift.endTime);
    if (checkOutMins > shiftEndMins) {
      lateLogoutMins = checkOutMins - shiftEndMins;
    }
  }

  const getLiveStats = () => {
    if (!attendance || !assignedShift) {
      return { 
        workedMins: 0, 
        breakMins: 0, 
        overtimeMins: 0, 
        status: "Offline", 
        currentSessionMins: 0, 
        activeLoginTime: null, 
        lastBreakDuration: 0 
      };
    }

    const activeLog = attendance.logs?.find((l: any) => !l.logoutTime);
    const activeBreak = attendance.breaks?.find((b: any) => !b.endTime);

    let activeLoginTime = activeLog ? new Date(activeLog.loginTime) : null;
    let currentSessionMins = 0;
    if (activeLoginTime) {
      currentSessionMins = (new Date().getTime() - activeLoginTime.getTime()) / 60000;
    }

    // ACCURATE SUMMING LOGIC
    let workedMins = 0;
    if (attendance.logs && Array.isArray(attendance.logs)) {
      attendance.logs.forEach((log: any) => {
        if (log.logoutTime) {
          workedMins += log.duration || 0;
        } else if (!activeBreak) {
          const elapsed = (new Date().getTime() - new Date(log.loginTime).getTime()) / 60000;
          workedMins += elapsed;
        }
      });
    }

    let breakMins = 0;
    if (attendance.breaks && Array.isArray(attendance.breaks)) {
      attendance.breaks.forEach((b: any) => {
        let bStart = new Date(b.startTime);
        let bEnd = b.endTime ? new Date(b.endTime) : new Date();

        let breakDuration = 0;
        if (assignedShift && assignedShift.startTime) {
          const [sh, sm] = assignedShift.startTime.split(':').map(Number);
          const shiftStartDate = new Date(bStart);
          shiftStartDate.setHours(sh, sm, 0, 0);

          if (bStart < shiftStartDate) {
            if (bEnd > shiftStartDate) {
              breakDuration = Math.max(0, (bEnd.getTime() - shiftStartDate.getTime()) / 60000);
            } else {
              breakDuration = 0;
            }
          } else {
            breakDuration = (bEnd.getTime() - bStart.getTime()) / 60000;
          }
        } else {
          breakDuration = (bEnd.getTime() - bStart.getTime()) / 60000;
        }

        breakMins += breakDuration;
      });
    }

    let lastBreakDuration = 0;
    if (attendance.breaks?.length > 0) {
      const filteredBreaks = attendance.breaks.map((b: any) => {
        let bStart = new Date(b.startTime);
        let bEnd = b.endTime ? new Date(b.endTime) : new Date();
        let duration = 0;
        if (assignedShift && assignedShift.startTime) {
          const [sh, sm] = assignedShift.startTime.split(':').map(Number);
          const shiftStartDate = new Date(bStart);
          shiftStartDate.setHours(sh, sm, 0, 0);
          if (bStart < shiftStartDate) {
            if (bEnd > shiftStartDate) {
              duration = Math.max(0, (bEnd.getTime() - shiftStartDate.getTime()) / 60000);
            }
          } else {
            duration = (bEnd.getTime() - bStart.getTime()) / 60000;
          }
        } else {
          duration = (bEnd.getTime() - bStart.getTime()) / 60000;
        }
        return { ...b, duration };
      }).filter((b: any) => b.duration > 0);

      if (filteredBreaks.length > 0) {
        lastBreakDuration = Math.round(filteredBreaks[filteredBreaks.length - 1].duration);
      }
    }

    const reqMins = Math.round(parseFloat(assignedShift.requiredHours || "8") * 60);
    let overtimeMins = 0;
    if (assignedShift && assignedShift.startTime && assignedShift.endTime) {
      let earlyMins = 0;
      let lateMins = 0;

      const [sh, sm] = assignedShift.startTime.split(':').map(Number);
      const [eh, em] = assignedShift.endTime.split(':').map(Number);
      const now = new Date();

      if (attendance.logs && Array.isArray(attendance.logs)) {
        attendance.logs.forEach((log: any) => {
          const logStart = new Date(log.loginTime);
          const logEnd = log.logoutTime ? new Date(log.logoutTime) : now;

          const shiftStartDate = new Date(logStart);
          shiftStartDate.setHours(sh, sm, 0, 0);

          const shiftEndDate = new Date(logStart);
          shiftEndDate.setHours(eh, em, 0, 0);

          if (shiftEndDate < shiftStartDate) {
            shiftEndDate.setDate(shiftEndDate.getDate() + 1);
          }

          // Portions before shiftStartDate (Early Login Overtime)
          if (logStart < shiftStartDate) {
            const earlyEnd = logEnd < shiftStartDate ? logEnd : shiftStartDate;
            earlyMins += Math.max(0, (earlyEnd.getTime() - logStart.getTime()) / 60000);
          }

          // Portions after shiftEndDate (Late Logout Overtime)
          if (logEnd > shiftEndDate) {
            const lateStart = logStart > shiftEndDate ? logStart : shiftEndDate;
            lateMins += Math.max(0, (logEnd.getTime() - lateStart.getTime()) / 60000);
          }
        });
      }

      const overallDiff = workedMins > reqMins ? workedMins - reqMins : 0;
      overtimeMins = Math.max(earlyMins + lateMins, overallDiff);
    }

    let regularShiftMins = workedMins;
    if (assignedShift && assignedShift.startTime) {
      const [sh, sm] = assignedShift.startTime.split(':').map(Number);
      const now = new Date();
      let regularWorkedMins = 0;

      attendance.logs?.forEach((log: any) => {
        const logStart = new Date(log.loginTime);
        const logEnd = log.logoutTime ? new Date(log.logoutTime) : now;

        const shiftStartDate = new Date(logStart);
        shiftStartDate.setHours(sh, sm, 0, 0);

        if (logEnd > shiftStartDate) {
          const start = logStart > shiftStartDate ? logStart : shiftStartDate;
          regularWorkedMins += (logEnd.getTime() - start.getTime()) / 60000;
        }
      });

      regularShiftMins = Math.max(0, regularWorkedMins - breakMins);
    }

    let status = "Offline";
    if (activeLog) {
      if (activeBreak) {
        status = "On Break";
      } else if (attendance.isIdle) {
        status = "Idle";
      } else if (workedMins >= reqMins) {
        status = "Overtime Running";
      } else {
        status = "Working";
      }
    } else if (attendance.loginTime) {
      status = "Shift Completed";
    }

    return { workedMins, breakMins, overtimeMins, status, currentSessionMins, activeLoginTime, lastBreakDuration, regularShiftMins };
  };

  const live = getLiveStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Working": return "#2563eb";
      case "On Break": return "#d97706";
      case "Idle": return "#475569";
      case "Overtime Running": return "#059669";
      case "Shift Completed": return "#7c3aed";
      default: return "#dc2626";
    }
  };

  // DEFENSIVE Safeguards to prevent runtime error on filter
  const filteredHistory = (history || []).filter(h => {
    if (!h || !h.date) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        h.date.includes(q) || 
        (h.shift?.name || "").toLowerCase().includes(q) ||
        (h.productivityStatus || "").toLowerCase().includes(q);
      if (!match) return false;
    }

    const hDate = new Date(h.date);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (dateFilter === "Today") {
      return h.date === new Date().toISOString().split('T')[0];
    } else if (dateFilter === "Weekly") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0,0,0,0);
      return hDate >= sevenDaysAgo;
    } else if (dateFilter === "Monthly") {
      return hDate.getMonth() === today.getMonth() && hDate.getFullYear() === today.getFullYear();
    } else if (dateFilter === "Custom") {
      if (customStart && customEnd) {
        const start = new Date(customStart);
        start.setHours(0,0,0,0);
        const end = new Date(customEnd);
        end.setHours(23,59,59,999);
        return hDate >= start && hDate <= end;
      }
    }

    return true;
  });

  let onTimeDays = 0;
  let lateLoginDays = 0;
  let earlyLogoutDays = 0;
  let overtimeDays = 0;

  filteredHistory.forEach(h => {
    if (!h) return;
    const loginP = getLoginPunctuality(h.loginTime, h.shift?.startTime);
    if (loginP.status === "OnTime" || loginP.status === "Early") onTimeDays++;
    if (loginP.status === "Late") lateLoginDays++;

    if (h.logoutTime) {
      const logoutP = getLogoutPunctuality(h.logoutTime, h.shift?.endTime);
      if (logoutP.status === "Early") earlyLogoutDays++;
    }
    if (h.totalOvertime > 0) overtimeDays++;
  });

  const totalWorkingDays = filteredHistory.length;
  const rangeOvertimeMins = filteredHistory.reduce((acc, curr) => acc + (curr?.totalOvertime || 0), 0);
  const rangeBreakMins = filteredHistory.reduce((acc, curr) => acc + (curr?.totalBreakTime || 0), 0);

  let loginMinsSum = 0;
  let loginMinsCount = 0;
  let logoutMinsSum = 0;
  let logoutMinsCount = 0;

  filteredHistory.forEach(h => {
    if (!h) return;
    if (h.loginTime) {
      const d = new Date(h.loginTime);
      loginMinsSum += d.getHours() * 60 + d.getMinutes();
      loginMinsCount++;
    }
    if (h.logoutTime) {
      const d = new Date(h.logoutTime);
      logoutMinsSum += d.getHours() * 60 + d.getMinutes();
      logoutMinsCount++;
    }
  });

  const avgLoginMins = loginMinsCount > 0 ? loginMinsSum / loginMinsCount : -1;
  const avgLogoutMins = logoutMinsCount > 0 ? logoutMinsSum / logoutMinsCount : -1;

  const avgLoginStr = avgLoginMins >= 0 ? formatMinutesToTimeStr(avgLoginMins) : "N/A";
  const avgLogoutStr = avgLogoutMins >= 0 ? formatMinutesToTimeStr(avgLogoutMins) : "N/A";

  // Selected Calendar Month Stats Calculation
  let presentCount = 0;
  let absentCount = 0;
  let holidayCount = 0;
  let lateInCount = 0;
  let lateOutCount = 0;
  let earlyInCount = 0;
  let earlyOutCount = 0;

  let totalWorkMins = 0;
  let totalBreakMinsSum = 0;
  let totalOvertimeMinsSum = 0;

  let lateInMinsSum = 0;
  let lateInDaysCount = 0;
  let earlyInMinsSum = 0;
  let earlyInDaysCount = 0;

  let totalMonthAssignedMins = 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const midnightToday = new Date();
  midnightToday.setHours(23, 59, 59, 999);

  let startLimit = null;
  if (userCreatedAt) {
    startLimit = new Date(userCreatedAt);
  } else if (history && history.length > 0) {
    const oldestRecord = history[history.length - 1];
    if (oldestRecord && oldestRecord.date) {
      startLimit = new Date(oldestRecord.date);
    }
  }
  if (!startLimit) {
    startLimit = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }
  startLimit.setHours(0, 0, 0, 0);

  const allRecords = [...(history || [])];
  if (attendance && attendance.date) {
    if (!allRecords.some(r => r.date === attendance.date)) {
      allRecords.push(attendance);
    }
  }
  const monthRecords = allRecords.filter(h => {
    if (!h || !h.date) return false;
    const d = new Date(h.date);
    return d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
  });

  const totalDaysInSelectedMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const daysOfThisMonth = [];
  for (let d = 1; d <= totalDaysInSelectedMonth; d++) {
    daysOfThisMonth.push(new Date(calendarYear, calendarMonth, d));
  }

  daysOfThisMonth.forEach(day => {
    if (day > midnightToday) return;
    if (day < startLimit) return;

    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const record = monthRecords.find(r => r.date === dateStr);
    const isSunday = day.getDay() === 0;

    if (record) {
      if (record.loginTime) {
        presentCount++;
        
        const shiftStart = record.shift?.startTime || null;
        const shiftEnd = record.shift?.endTime || null;

        const loginP = getLoginPunctuality(record.loginTime, shiftStart);
        if (loginP.status === "Late") {
          lateInCount++;
          lateInMinsSum += Math.abs(loginP.diffMins);
          lateInDaysCount++;
        } else if (loginP.status === "Early") {
          earlyInCount++;
          earlyInMinsSum += Math.abs(loginP.diffMins);
          earlyInDaysCount++;
        }

        if (record.logoutTime) {
          const logoutP = getLogoutPunctuality(record.logoutTime, shiftEnd);
          if (logoutP.status === "Early") {
            earlyOutCount++;
          } else if (logoutP.status === "Overtime") {
            lateOutCount++;
          }
        }

        totalWorkMins += Math.round(parseFloat(record.totalWorkingHours || "0") * 60);
        totalBreakMinsSum += (record.totalBreakTime || 0);
        totalOvertimeMinsSum += (record.totalOvertime || 0);

        if (record.shift && record.shift.requiredHours) {
          totalMonthAssignedMins += parseFloat(record.shift.requiredHours) * 60;
        }
      } else {
        absentCount++;
      }
    } else {
      if (isSunday) {
        holidayCount++;
      } else {
        absentCount++;
      }
    }
  });

  const avgWorkMins = presentCount > 0 ? totalWorkMins / presentCount : 0;
  const avgBreakMins = presentCount > 0 ? totalBreakMinsSum / presentCount : 0;
  const avgOvertimeMins = presentCount > 0 ? totalOvertimeMinsSum / presentCount : 0;
  const avgLateInMins = lateInDaysCount > 0 ? lateInMinsSum / lateInDaysCount : 0;
  const avgEarlyInMins = earlyInDaysCount > 0 ? earlyInMinsSum / earlyInDaysCount : 0;
  const totalMonthAssignedHrs = totalMonthAssignedMins / 60;

  // DEFENSIVE optional chaining inside Set mapping
  const logoutReasons = Array.from(new Set([
    ...(attendance?.logs?.map((l: any) => l?.logoutReason).filter(Boolean) || []),
    ...(history ? history.flatMap((h: any) => h?.logs?.map((l: any) => l?.logoutReason) || []).filter(Boolean) : [])
  ]));

  // Calendar render functions (Point 7)
  const getDaysInMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    let startDay = date.getDay();
    // Adjust start day so Mon is 0, Sun is 6
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };

  const getCalendarDayState = (day: Date | null) => {
    if (!day) return { type: "empty", color: "transparent", bg: "transparent", label: "" };
    
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Future Date Check
    const midnightToday = new Date();
    midnightToday.setHours(23, 59, 59, 999);
    if (day > midnightToday) {
      return { type: "future", color: "#cbd5e1", bg: "transparent", label: "Future" };
    }

    // Pre-shift Assignment Check
    let startLimit: Date | null = null;
    if (userCreatedAt) {
      startLimit = new Date(userCreatedAt);
    } else if (history && history.length > 0) {
      const oldestRecord = history[history.length - 1];
      if (oldestRecord && oldestRecord.date) {
        startLimit = new Date(oldestRecord.date);
      }
    }
    if (!startLimit) {
      startLimit = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    startLimit.setHours(0, 0, 0, 0);
    if (day < startLimit) {
      return { type: "pre-shift", color: "#cbd5e1", bg: "transparent", label: "Shift Not Started" };
    }

    const isSunday = day.getDay() === 0;
    
    // Check if in history (with safe optional chaining)
    const record = history?.find(h => h && h.date === dateStr);
    
    if (record) {
      if (record.loginTime) {
        return { type: "present", color: "#10b981", bg: "#d1fae5", label: "Present" };
      } else {
        return { type: "absent", color: "#ef4444", bg: "#fee2e2", label: "Absent" };
      }
    }
    
    if (dateStr === todayStr) {
      if (attendance?.loginTime) {
        return { type: "present", color: "#10b981", bg: "#d1fae5", label: "Present" };
      }
      return { type: "today", color: "#3b82f6", bg: "#eff6ff", label: "Today (No login)" };
    }
    
    if (isSunday) {
      return { type: "holiday", color: "#64748b", bg: "#f1f5f9", label: "Weekly Off" };
    }
    
    // Past day with no record -> Absent
    return { type: "absent", color: "#ef4444", bg: "#fee2e2", label: "Absent" };
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const calendarDays = getDaysInMonth(calendarMonth, calendarYear);

  const handleStartResume = () => {
    sessionStorage.setItem(`resumed_session_${userId}_${selectedDate}`, "true");
    setShowResumePopup(false);
    setIsTimerPaused(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading My Attendance...</span>
      </div>
    );
  }

  return (
    <div className="compact-attendance-container">
      
      {/* High density compact corporate styling */}
      <style>{`
        .compact-attendance-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #f1f5f9;
          padding: 1rem;
          color: #1e293b;
          min-height: 100%;
          font-size: 0.8rem;
        }

        .compact-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .compact-card:hover {
          border-color: #94a3b8;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .cyber-clock-box {
          background: #0f172a;
          color: #ffffff;
          border: 1px solid #1e293b;
        }

        .digital-clock-face {
          font-family: "Courier New", Courier, monospace;
          font-weight: 700;
          font-size: 2.2rem;
          letter-spacing: 1px;
          color: #10b981;
          margin: 0.25rem 0;
          text-shadow: 0 0 6px rgba(16, 185, 129, 0.3);
        }

        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .compact-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* Compact Data table */
        .compact-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
        }

        .compact-table th {
          background: #f8fafc;
          border-bottom: 2px solid #cbd5e1;
          color: #475569;
          font-weight: 700;
          padding: 6px 10px;
          text-align: left;
        }

        .compact-table td {
          padding: 6px 10px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }

        .compact-table tr:hover {
          background: #f8fafc;
        }

        /* Header overrides */
        .compact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 0.5rem;
          margin-bottom: 0.75rem;
          background: #ffffff;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
        }

        /* Small progress bar */
        .bar-wrap {
          width: 100%;
          height: 6px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 0.35rem;
        }

        .bar-inner {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .input-mini {
          padding: 3px 6px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.75rem;
          outline: none;
          color: #334155;
          font-weight: 600;
        }

        /* Interactive Calendar styles */
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-top: 8px;
          text-align: center;
        }

        .calendar-day-header {
          font-weight: 800;
          font-size: 0.65rem;
          color: #64748b;
          padding-bottom: 4px;
        }

        .calendar-cell {
          aspect-ratio: 1;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.72rem;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
          border: 1.5px solid transparent;
        }

        .calendar-cell:hover {
          transform: scale(1.08);
          filter: brightness(0.95);
        }

        .calendar-cell.active-selected {
          border-color: #2563eb !important;
          box-shadow: 0 0 6px rgba(37, 99, 235, 0.4);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Resume Pop-up Modal */
        .resume-popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(6px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .resume-popup-card {
          background: #ffffff;
          padding: 24px;
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          text-align: center;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
          border: 1px solid #e2e8f0;
        }
      `}</style>

      {/* Point 9: Resume workout warning popup */}
      <AnimatePresence>
        {showResumePopup && (
          <div className="resume-popup-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="resume-popup-card"
            >
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <LucideZap size={28} color="#2563eb" />
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 8px 0", color: "#0f172a" }}>Welcome Back!</h2>
              <p style={{ color: "#475569", fontSize: "0.85rem", margin: "0 0 20px 0", lineHeight: "1.4" }}>
                You logged out during your shift and have now returned. We saved your previous session progress.
              </p>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px", textAlign: "left", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="flex-between">
                  <span style={{ color: "#64748b", fontWeight: 600 }}>Last Logout Time:</span>
                  <strong style={{ color: "#1e293b" }}>{lastLogout ? formatDateTo12Hr(lastLogout) : "N/A"}</strong>
                </div>
                <div className="flex-between">
                  <span style={{ color: "#64748b", fontWeight: 600 }}>Worked Time Accrued:</span>
                  <strong style={{ color: "#059669" }}>{pausedSeconds ? formatMins(pausedSeconds / 60) : "0m"}</strong>
                </div>
              </div>

              <button 
                onClick={handleStartResume}
                style={{ 
                  background: "#2563eb", 
                  color: "#ffffff", 
                  border: "none", 
                  padding: "10px 20px", 
                  borderRadius: "10px", 
                  fontWeight: 700, 
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  width: "100%",
                  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
                }}
              >
                RESUME WORK NOW
              </button>
            </motion.div>
          </div>
        )}

        {/* Breaks Accrued Popup */}
        {showBreaksPopup && (
          <div className="resume-popup-overlay" onClick={() => setShowBreaksPopup(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="resume-popup-card"
              style={{ maxWidth: "460px", textAlign: "left" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex-between" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                  <LucideCoffee size={18} color="#d97706" /> Breaks Accrued Today
                </h3>
                <button onClick={() => setShowBreaksPopup(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><LucideX size={18} /></button>
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                {(() => {
                  if (!attendance?.breaks) return (
                    <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                      No breaks taken today.
                    </div>
                  );
                  const filtered = attendance.breaks.map((b: any, index: number) => {
                    let bStart = new Date(b.startTime);
                    let bEnd = b.endTime ? new Date(b.endTime) : new Date();
                    let breakDuration = 0;
                    if (assignedShift && assignedShift.startTime) {
                      const [sh, sm] = assignedShift.startTime.split(':').map(Number);
                      const shiftStartDate = new Date(bStart);
                      shiftStartDate.setHours(sh, sm, 0, 0);

                      if (bStart < shiftStartDate) {
                        if (bEnd > shiftStartDate) {
                          breakDuration = Math.max(0, (bEnd.getTime() - shiftStartDate.getTime()) / 60000);
                        }
                      } else {
                        breakDuration = (bEnd.getTime() - bStart.getTime()) / 60000;
                      }
                    } else {
                      breakDuration = (bEnd.getTime() - bStart.getTime()) / 60000;
                    }
                    return { ...b, duration: breakDuration, origIndex: index };
                  }).filter((b: any) => b.duration > 0);

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                        No breaks taken today.
                      </div>
                    );
                  }

                  return filtered.map((b: any, i: number) => (
                    <div key={b.id || i} style={{ padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ fontSize: "0.82rem", color: "#1e293b" }}>Break #{b.origIndex + 1}</strong>
                        <span style={{ fontSize: "0.65rem", background: b.type === "lunch" ? "#eff6ff" : "#f1f5f9", color: b.type === "lunch" ? "#2563eb" : "#475569", padding: "2px 6px", borderRadius: "4px", marginLeft: "8px", fontWeight: 700, textTransform: "uppercase" }}>
                          {b.type || "auto"}
                        </span>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "4px" }}>
                          {formatDateTo12Hr(b.startTime)} - {b.endTime ? formatDateTo12Hr(b.endTime) : <span style={{ color: "#ef4444", fontWeight: 700 }}>On Break Now</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", fontWeight: 800, color: "#d97706", fontSize: "0.85rem" }}>
                        {formatMins(b.duration)}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        )}

        {/* Overtime Details Popup */}
        {showOvertimePopup && (
          <div className="resume-popup-overlay" onClick={() => setShowOvertimePopup(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="resume-popup-card"
              style={{ maxWidth: "460px", textAlign: "left" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex-between" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                  <LucideClock size={18} color="#059669" /> Overtime & Punctuality Details
                </h3>
                <button onClick={() => setShowOvertimePopup(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><LucideX size={18} /></button>
              </div>

              {assignedShift ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  
                  {/* Shift rules */}
                  <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "#64748b", fontWeight: 800, marginBottom: "4px" }}>Assigned Shift Protocol</div>
                    <div className="flex-between">
                      <strong style={{ color: "#1e293b", fontSize: "0.88rem" }}>{assignedShift.name}</strong>
                      <span style={{ fontWeight: 800, color: "#2563eb" }}>{formatMinsTo12Hr(assignedShift.startTime)} - {formatMinsTo12Hr(assignedShift.endTime)}</span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "4px" }}>
                      Required hours: <strong>{assignedShift.requiredHours}h</strong>
                    </div>
                  </div>

                  {/* Worked & Overtime summary */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ background: "#f0fdf4", padding: "10px", borderRadius: "10px", border: "1px solid #bbf7d0", textAlign: "center" }}>
                      <span style={{ fontSize: "0.62rem", color: "#16a34a", textTransform: "uppercase", fontWeight: 800, display: "block" }}>Worked Today</span>
                      <strong style={{ fontSize: "1.1rem", color: "#15803d" }}>{formatMins(live.workedMins)}</strong>
                    </div>
                    <div style={{ background: live.overtimeMins > 0 ? "#ecfdf5" : "#fafafa", padding: "10px", borderRadius: "10px", border: `1px solid ${live.overtimeMins > 0 ? "#a7f3d0" : "#e5e5e5"}`, textAlign: "center" }}>
                      <span style={{ fontSize: "0.62rem", color: live.overtimeMins > 0 ? "#059669" : "#737373", textTransform: "uppercase", fontWeight: 800, display: "block" }}>Overtime Met</span>
                      <strong style={{ fontSize: "1.1rem", color: live.overtimeMins > 0 ? "#047857" : "#404040" }}>
                        {live.overtimeMins > 0 ? `+${formatMins(live.overtimeMins)}` : "0m"}
                      </strong>
                    </div>
                  </div>

                  {/* Early Check-In details */}
                  <div style={{ padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "0.82rem", color: "#1e293b" }}>Early Check-In</strong>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                        First Check-In: {firstLogin ? formatDateTo12Hr(firstLogin) : "N/A"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontWeight: 800, color: earlyLoginMins > 0 ? "#2563eb" : "#64748b", fontSize: "0.82rem" }}>
                      {earlyLoginMins > 0 ? `+${formatMins(earlyLoginMins)} early` : "0m"}
                    </div>
                  </div>

                  {/* Late Check-Out details */}
                  <div style={{ padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "0.82rem", color: "#1e293b" }}>Late Check-Out</strong>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                        Last Check-Out: {lastLogout ? formatDateTo12Hr(lastLogout) : <span style={{ color: "#2563eb", fontWeight: 600 }}>Active session ticking...</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontWeight: 800, color: lateLogoutMins > 0 ? "#059669" : "#64748b", fontSize: "0.82rem" }}>
                      {lateLogoutMins > 0 ? `+${formatMins(lateLogoutMins)} late` : "0m"}
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#b45309" }}>
                  No shift protocol assigned to calculate overtime timings.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Navigation Header */}
      <div className="compact-header">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Personal Work </span>
            <span style={{ color: "#2563eb" }}>logs</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>
            View your shift logs, duty timing statistics, and monthly attendance breakdown.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div className="compact-badge" style={{ 
            background: getStatusColor(live.status) + "12", 
            color: getStatusColor(live.status), 
            border: `1px solid ${getStatusColor(live.status)}20`
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: getStatusColor(live.status) }}></span>
            {live.status}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <LucideCalendar size={14} color="#475569" />
            <input 
              type="date" 
              value={selectedDate} 
              readOnly
              className="input-mini"
            />
          </div>
        </div>
      </div>

      {!assignedShift && (
        <div style={{ 
          background: "#fffbeb", 
          border: "1px solid #fef3c7", 
          color: "#b45309", 
          padding: "8px 12px", 
          borderRadius: "8px", 
          marginBottom: "0.75rem", 
          fontWeight: 700, 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          fontSize: "0.75rem"
        }}>
          <LucideAlertCircle size={14} color="#b45309" />
          <span>There is no Shift assigned to you yet</span>
        </div>
      )}

      {/* 2. 4-Column KPI Grid */}
      <div className="kpi-grid">
        
        {/* KPI 1: Live Ticker Clock */}
        <div className="compact-card cyber-clock-box flex-between" style={{ flexDirection: "column", alignItems: "stretch", padding: "0.75rem 1rem" }}>
          <div className="flex-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "4px", marginBottom: "4px" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideTimer size={12} color="#10b981" />
              LIVE SESSION TRACKER
            </span>
            <span style={{ fontSize: "0.62rem", color: isTimerPaused ? "#eab308" : (live.status === "Offline" ? "#ef4444" : "#10b981"), fontWeight: 800 }}>
              {isTimerPaused ? "PAUSED" : (live.status === "Offline" ? "OFFLINE" : "TICKING")}
            </span>
          </div>

          <div className="digital-clock-face">
            {isTimerPaused && pausedSeconds !== null
              ? formatMinsToSecondsStr(pausedSeconds / 60)
              : formatMinsToSecondsStr(live.workedMins)
            }
          </div>

          <div className="flex-between" style={{ fontSize: "0.68rem", color: "#94a3b8", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "4px", marginTop: "4px" }}>
            <span>In: <strong>{live.activeLoginTime ? formatDateTo12Hr(live.activeLoginTime) : "Offline"}</strong></span>
            <span style={{ color: "#10b981" }}>Session: <strong>{live.status !== "Offline" ? formatMins(live.currentSessionMins) : "0m"}</strong></span>
          </div>
        </div>

        {/* KPI 2: Assigned Shift */}
        <div className="compact-card flex-between" style={{ flexDirection: "column", alignItems: "stretch", padding: "0.75rem 1rem" }}>
          <div className="flex-between" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideBriefcase size={12} color="#2563eb" />
              ASSIGNED SHIFT
            </span>
            <span style={{ fontSize: "0.62rem", color: "#2563eb", fontWeight: 700 }}>RULESET</span>
          </div>

          {assignedShift ? (
            <div>
              <div className="flex-between">
                <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>{assignedShift.name}</strong>
                <span style={{ color: "#475569", fontWeight: 600 }}>
                  {formatMinsTo12Hr(assignedShift.startTime)} - {formatMinsTo12Hr(assignedShift.endTime)}
                </span>
              </div>
              <div style={{ marginTop: "4px" }}>
                <div className="flex-between" style={{ fontSize: "0.65rem", color: "#64748b", marginBottom: "2px" }}>
                  <span>Shift Target Completion</span>
                  <span>{formatMins(live.regularShiftMins)} / {assignedShift.requiredHours}h</span>
                </div>
                <div className="bar-wrap">
                  <div 
                    className="bar-inner" 
                    style={{ 
                      width: `${Math.min(100, Math.round((live.regularShiftMins / (parseFloat(assignedShift.requiredHours || "8") * 60)) * 100))}%`, 
                      background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" 
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "8px 12px", textAlign: "center", color: "#b45309", background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 700 }}>
              There is no Shift assigned to you yet
            </div>
          )}
        </div>

        {/* KPI 3: Duty Accruals Today */}
        <div className="compact-card flex-between" style={{ flexDirection: "column", alignItems: "stretch", padding: "0.75rem 1rem" }}>
          <div className="flex-between" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideClock size={12} color="#059669" />
              DUTY ACCRUALS TODAY
            </span>
            <span style={{ fontSize: "0.62rem", color: "#059669", fontWeight: 700 }}>MEASURED</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", textAlign: "center" }}>
            <div style={{ background: "#f8fafc", padding: "4px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "0.6" + "rem", color: "#64748b", display: "block" }}>Worked</span>
              <strong style={{ fontSize: "0.8rem", color: "#1e293b" }}>{formatMins(live.workedMins)}</strong>
            </div>
            <div 
              onClick={() => setShowBreaksPopup(true)}
              style={{ background: "#f8fafc", padding: "4px", borderRadius: "8px", border: "1px solid #f1f5f9", cursor: "pointer", transition: "transform 0.1s", transform: "scale(1)" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <span style={{ fontSize: "0.6" + "rem", color: "#64748b", display: "block" }}>Breaks</span>
              <strong style={{ fontSize: "0.8rem", color: "#d97706" }}>{formatMins(live.breakMins)}</strong>
            </div>
            <div 
              onClick={() => setShowOvertimePopup(true)}
              style={{ background: "#f8fafc", padding: "4px", borderRadius: "8px", border: "1px solid #f1f5f9", cursor: "pointer", transition: "transform 0.1s", transform: "scale(1)" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <span style={{ fontSize: "0.6" + "rem", color: "#64748b", display: "block" }}>Overtime</span>
              <strong style={{ fontSize: "0.8rem", color: "#059669" }}>{live.overtimeMins > 0 ? `+${formatMins(live.overtimeMins)}` : "0m"}</strong>
            </div>
          </div>
        </div>

        {/* KPI 4: Today's Arrival Punctuality Badges */}
        <div className="compact-card flex-between" style={{ flexDirection: "column", alignItems: "stretch", padding: "0.75rem 1rem" }}>
          <div className="flex-between" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideActivity size={12} color="#7c3aed" />
              Login Tracker
            </span>
            <span style={{ fontSize: "0.62rem", color: "#7c3aed", fontWeight: 700 }}>Tracker</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div className="flex-between" style={{ background: "#f8fafc", padding: "3px 6px", borderRadius: "6px", border: "1px solid rgba(226,232,240,0.5)", fontSize: "0.72rem" }}>
              <span>Last Check In: <strong>{lastLogin ? formatDateTo12Hr(lastLogin) : "N/A"}</strong></span>
              <span style={{ fontWeight: 800, fontSize: "0.65rem", color: todayLoginPunctuality.color }}>{todayLoginPunctuality.text}</span>
            </div>
            <div className="flex-between" style={{ background: "#f8fafc", padding: "3px 6px", borderRadius: "6px", border: "1px solid rgba(226,232,240,0.5)", fontSize: "0.72rem" }}>
              <span>Last Check Out: <strong>{lastLogout ? formatDateTo12Hr(lastLogout) : "Active"}</strong></span>
              <span style={{ fontWeight: 800, fontSize: "0.65rem", color: todayLogoutPunctuality.color }}>{todayLogoutPunctuality.text}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Session Splits & Breaks Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
        
        {/* Full-width splits card */}
        <div className="compact-card" style={{ padding: "0.75rem 1rem" }}>
          <div className="flex-between" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", marginBottom: "8px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
              <LucideClock3 size={14} color="#2563eb" />
              Active Work Interval Splits ({activeLogs.length})
            </h3>
            <span style={{ fontSize: "0.65rem", color: "#64748b" }}>SESSION SHIELD</span>
          </div>

          {(activeLogs.length === 0) ? (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px" }}>
              No splits recorded.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "6px", maxHeight: "170px", overflowY: "auto" }}>
              {activeLogs.map((log: any, index: number) => {
                const durationMins = log.logoutTime
                  ? log.duration
                  : Math.round((new Date().getTime() - new Date(log.loginTime).getTime()) / 60000);
                
                return (
                  <div key={log.id || index} style={{ 
                    padding: "8px", 
                    borderRadius: "8px", 
                    border: "1px solid #e2e8f0",
                    background: log.logoutTime ? "#f8fafc" : "linear-gradient(135deg, rgba(37,99,235,0.01) 0%, rgba(37,99,235,0.05) 100%)",
                    borderLeft: `3px solid ${log.logoutTime ? "#64748b" : "#2563eb"}`
                  }}>
                    <div className="flex-between" style={{ marginBottom: "4px", fontSize: "0.72rem" }}>
                      <strong>Block #{index + 1}</strong>
                      <span style={{ 
                        fontSize: "0.6rem", 
                        fontWeight: 800, 
                        color: log.logoutTime ? "#475569" : "#2563eb",
                        background: log.logoutTime ? "#e2e8f0" : "#dbeafe",
                        padding: "1px 4px",
                        borderRadius: "4px"
                      }}>
                        {log.logoutTime ? "COMPLETED" : "ACTIVE"}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.68rem", color: "#475569" }}>
                      In: {formatDateTo12Hr(log.loginTime)}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#475569" }}>
                      Out: {log.logoutTime ? formatDateTo12Hr(log.logoutTime) : "Ticking..."}
                    </div>

                    <div style={{ fontSize: "0.7rem", color: "#1e293b", fontWeight: 700, marginTop: "6px", borderTop: "1px dashed #e2e8f0", paddingTop: "4px", display: "flex", justifyContent: "space-between" }}>
                      <span>Duration:</span>
                      <span>{formatMins(durationMins)}</span>
                    </div>

                    {log.logoutTime && (
                      <div style={{ 
                        fontSize: "0.6rem", 
                        color: "#ef4444", 
                        fontWeight: 700, 
                        background: "rgba(239, 68, 68, 0.03)",
                        padding: "4px 8px", 
                        borderRadius: "4px", 
                        marginTop: "6px",
                        display: "flex", 
                        alignItems: "center", 
                        gap: "3px",
                        border: "1px solid rgba(239,68,68,0.08)"
                      }}>
                        <LucideAlertCircle size={10} />
                        Reason: {log.logoutReason || "direct logout (tab/browser closed)"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 4. Interactive Monthly Attendance Calendar Grid & Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
        
        {/* Left side: Interactive Monthly Calendar */}
        <div className="compact-card" style={{ padding: "0.75rem 1rem" }}>
          <div className="flex-between" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", marginBottom: "6px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
              <LucideCalendar size={14} color="#2563eb" />
              Interactive Attendance Calendar
            </h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button onClick={handlePrevMonth} className="input-mini" style={{ padding: "1px 4px", display: "flex", alignItems: "center" }}><LucideChevronLeft size={12} /></button>
              <strong style={{ fontSize: "0.75rem", color: "#1e293b", minWidth: "80px", textAlign: "center" }}>
                {monthNames[calendarMonth]} {calendarYear}
              </strong>
              <button onClick={handleNextMonth} className="input-mini" style={{ padding: "1px 4px", display: "flex", alignItems: "center" }}><LucideChevronRight size={12} /></button>
            </div>
          </div>

          <div className="calendar-grid">
            <span className="calendar-day-header">Mon</span>
            <span className="calendar-day-header">Tue</span>
            <span className="calendar-day-header">Wed</span>
            <span className="calendar-day-header">Thu</span>
            <span className="calendar-day-header">Fri</span>
            <span className="calendar-day-header">Sat</span>
            <span className="calendar-day-header">Sun</span>

            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="calendar-cell" style={{ background: "transparent", cursor: "default" }}></div>;
              
              const dayState = getCalendarDayState(day);
              const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
              const isDisabled = dayState.type === "future" || dayState.type === "pre-shift";
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div 
                  key={idx} 
                  className={`calendar-cell ${isToday ? 'active-selected' : ''}`}
                  style={{ 
                    background: dayState.bg, 
                    color: dayState.color,
                    opacity: isDisabled ? 0.35 : 1,
                    cursor: isDisabled ? "not-allowed" : (isToday ? "default" : "pointer"),
                    pointerEvents: isDisabled ? "none" : "auto"
                  }}
                  onClick={() => {
                    if (!isDisabled && !isToday) {
                      setModalDate(dateStr);
                    }
                  }}
                  title={`${dateStr} (${dayState.label})`}
                >
                  {day.getDate()}
                  
                  {dayState.type === "present" && (
                    <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#059669", position: "absolute", bottom: "3px" }} />
                  )}
                  {dayState.type === "absent" && (
                    <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#dc2626", position: "absolute", bottom: "3px" }} />
                  )}
                  {dayState.type === "holiday" && (
                    <span style={{ fontSize: "0.55rem", opacity: 0.6, position: "absolute", bottom: "1px", transform: "scale(0.85)" }}>Off</span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px", fontSize: "0.68rem", justifyContent: "center", borderTop: "1px solid #f1f5f9", paddingTop: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}></span>Present</div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }}></span>Absent</div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#64748b" }}></span>Weekly Off (Sunday)</div>
          </div>
        </div>

        {/* Right side: Compliance performance indicators */}
        <div className="compact-card" style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", marginBottom: "8px", margin: 0 }}>
              <LucideTrendingUp size={14} color="#059669" />
              Compliance Performance Metrics
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px", marginBottom: "8px" }}>
              <div style={{ background: "#f8fafc", padding: "5px 6px", borderRadius: "8px", border: "1px solid rgba(226,232,240,0.6)" }}>
                <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block", fontWeight: 700 }}>PRESENT</span>
                <strong style={{ fontSize: "0.95rem", color: "#10b981", fontWeight: 800 }}>{presentCount} d</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "5px 6px", borderRadius: "8px", border: "1px solid rgba(226,232,240,0.6)" }}>
                <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block", fontWeight: 700 }}>ABSENT</span>
                <strong style={{ fontSize: "0.95rem", color: "#ef4444", fontWeight: 800 }}>{absentCount} d</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "5px 6px", borderRadius: "8px", border: "1px solid rgba(226,232,240,0.6)" }}>
                <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block", fontWeight: 700 }}>LATE ARRIVALS</span>
                <strong style={{ fontSize: "0.95rem", color: "#dc2626", fontWeight: 800 }}>{lateInCount} d</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "5px 6px", borderRadius: "8px", border: "1px solid rgba(226,232,240,0.6)" }}>
                <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block", fontWeight: 700 }}>EARLY ARRIVALS</span>
                <strong style={{ fontSize: "0.95rem", color: "#2563eb", fontWeight: 800 }}>{earlyInCount} d</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "5px 6px", borderRadius: "8px", border: "1px solid rgba(226,232,240,0.6)" }}>
                <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block", fontWeight: 700 }}>EARLY EXITS</span>
                <strong style={{ fontSize: "0.95rem", color: "#d97706", fontWeight: 800 }}>{earlyOutCount} d</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: "5px 6px", borderRadius: "8px", border: "1px solid rgba(226,232,240,0.6)" }}>
                <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block", fontWeight: 700 }}>LATE LOGOUTS</span>
                <strong style={{ fontSize: "0.95rem", color: "#7c3aed", fontWeight: 800 }}>{lateOutCount} d</strong>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.72rem", borderTop: "1px solid #f1f5f9", paddingTop: "6px" }}>
            <div className="flex-between"><span>Avg Work Hours:</span> <strong>{formatMins(avgWorkMins)}</strong></div>
            <div className="flex-between"><span>Avg Break Hours:</span> <strong>{formatMins(avgBreakMins)}</strong></div>
            <div className="flex-between"><span>Avg Overtime:</span> <strong>{formatMins(avgOvertimeMins)}</strong></div>
            <div className="flex-between"><span>Avg Late In Duration:</span> <strong style={{ color: "#dc2626" }}>{formatMins(avgLateInMins)}</strong></div>
            <div className="flex-between"><span>Avg Early In Duration:</span> <strong style={{ color: "#2563eb" }}>{formatMins(avgEarlyInMins)}</strong></div>
            <div className="flex-between"><span>Month Assigned Hours:</span> <strong>{totalMonthAssignedHrs.toFixed(1)}h</strong></div>
          </div>
        </div>

      </div>

      {/* 5. Historical Logs Table */}
      <div className="compact-card" style={{ padding: "0.75rem 1rem" }}>
        
        {/* Table filter row */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          flexWrap: "wrap", 
          gap: "8px", 
          padding: "6px 10px", 
          background: "#f8fafc", 
          borderRadius: "8px", 
          border: "1px solid #cbd5e1",
          marginBottom: "0.75rem" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <LucideDatabase size={14} color="#475569" />
            <strong style={{ fontSize: "0.80rem", color: "#1e293b" }}>Detailed Historical Logs</strong>
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            
            <div style={{ position: "relative" }}>
              <LucideSearch size={12} color="#94a3b8" style={{ position: "absolute", left: "6px", top: "7px" }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="input-mini"
                style={{ paddingLeft: "20px", width: "130px" }} 
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideFilter size={12} color="#64748b" />
              <select 
                value={dateFilter} 
                onChange={e => setDateFilter(e.target.value as any)} 
                className="input-mini"
                style={{ cursor: "pointer" }}
              >
                <option value="Today">Today</option>
                <option value="Weekly">Weekly (7 Days)</option>
                <option value="Monthly">This Month</option>
                <option value="Custom">Custom Scope</option>
              </select>
            </div>

            {dateFilter === "Custom" && (
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={e => setCustomStart(e.target.value)} 
                  className="input-mini"
                />
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>-</span>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={e => setCustomEnd(e.target.value)} 
                  className="input-mini"
                />
              </div>
            )}

          </div>
        </div>

        {/* Data list view */}
        {loadingHistory ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#cbd5e1" }}>
            No records found.
          </div>
        ) : filteredHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#cbd5e1" }}>
            No records found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="compact-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shift Profile</th>
                  <th>First In</th>
                  <th>In Punctuality</th>
                  <th>Last Out</th>
                  <th>Out Status</th>
                  <th style={{ textAlign: "right" }}>Duty Mins</th>
                  <th style={{ textAlign: "right" }}>Breaks</th>
                  <th style={{ textAlign: "right" }}>Overtime</th>
                  <th style={{ textAlign: "right" }}>Splits</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((h: any) => {
                  const workedMins = Math.round(parseFloat(h?.totalWorkingHours || "0") * 60);
                  const shiftStart = h?.shift?.startTime || null;
                  const shiftEnd = h?.shift?.endTime || null;
                  
                  const loginP = getLoginPunctuality(h?.loginTime, shiftStart);
                  const logoutP = getLogoutPunctuality(h?.logoutTime, shiftEnd);

                  return (
                    <tr key={h.id} style={{ cursor: "pointer" }} onClick={() => setModalDate(h.date)}>
                      <td style={{ fontWeight: 700, color: "#0f172a" }}>{h.date}</td>
                      <td>{h.shift?.name || "Standard Shift"}</td>
                      <td>{h.loginTime ? formatDateTo12Hr(h.loginTime) : "N/A"}</td>
                      <td>
                        <span style={{ 
                          fontSize: "0.68rem", 
                          fontWeight: 700, 
                          color: loginP.color,
                          background: loginP.color + "12",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          border: `1px solid ${loginP.color}18`
                        }}>
                          {loginP.text}
                        </span>
                      </td>
                      <td>{h.logoutTime ? formatDateTo12Hr(h.logoutTime) : <span style={{ color: "#2563eb", fontWeight: 700 }}>Active</span>}</td>
                      <td>
                        <span style={{ 
                          fontSize: "0.68rem", 
                          fontWeight: 700, 
                          color: logoutP.color,
                          background: logoutP.color + "12",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          border: `1px solid ${logoutP.color}18`
                        }}>
                          {logoutP.text}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{formatMins(workedMins)}</td>
                      <td style={{ textAlign: "right" }}>{formatMins(h.totalBreakTime || 0)}</td>
                      <td style={{ textAlign: "right", color: h.totalOvertime > 0 ? "#059669" : "#64748b", fontWeight: h.totalOvertime > 0 ? 700 : 500 }}>
                        {h.totalOvertime > 0 ? `+${formatMins(h.totalOvertime)}` : "0m"}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{h.logs?.length || 1}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 6. Point 10: Attendance Details Modal Popup */}
      <AnimatePresence>
        {modalDate && (
          <div className="resume-popup-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="resume-popup-card"
              style={{ maxWidth: "560px", padding: "20px", textAlign: "left" }}
            >
              {/* Header */}
              <div className="flex-between" style={{ borderBottom: "1px solid #cbd5e1", paddingBottom: "10px", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#2563eb", textTransform: "uppercase" }}>HISTORICAL BREAKDOWN</div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: "2px 0 0" }}>Logs for {modalDate}</h2>
                </div>
                <button 
                  onClick={() => setModalDate(null)}
                  style={{ 
                    border: "none", 
                    background: "#f1f5f9", 
                    color: "#64748b", 
                    width: "28px", 
                    height: "28px", 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    cursor: "pointer", 
                    fontSize: "0.9rem",
                    fontWeight: "bold"
                  }}
                >
                  ✕
                </button>
              </div>

              {loadingModal ? (
                <div style={{ textAlign: "center", padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <LucideLoader2 className="animate-spin" size={28} color="#2563eb" />
                  <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>Fetching logs...</p>
                </div>
              ) : !modalAttendance ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8" }}>
                  No attendance records found for this day.
                </div>
              ) : (() => {
                const shift = modalAttendance.shift || modalAttendance.user?.shift || assignedShift;
                const logs = modalAttendance.logs || [];
                const breaks = modalAttendance.breaks || [];

                // Math calculations
                let workedMins = 0;
                logs.forEach((l: any) => {
                  workedMins += l.duration || 0;
                });

                let breakMins = modalAttendance.totalBreakTime || 0;
                let overtimeMins = modalAttendance.totalOvertime || 0;

                const firstIn = logs.length > 0 ? logs[0].loginTime : modalAttendance.loginTime;
                const lastOut = modalAttendance.logoutTime || (logs.length > 0 ? [...logs].reverse().find(l => l.logoutTime)?.logoutTime : null);

                const loginP = getLoginPunctuality(firstIn, shift?.startTime);
                const logoutP = getLogoutPunctuality(lastOut, shift?.endTime);

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    
                    {/* Shift & Summary Card */}
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                      <div>
                        <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700 }}>SHIFT SCHEDULING</span>
                        <div style={{ fontWeight: 800, color: "#1e293b", fontSize: "0.85rem" }}>{shift?.name || "Standard Shift"}</div>
                        <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600, marginTop: "2px" }}>
                          {shift ? `${formatMinsTo12Hr(shift.startTime)} - ${formatMinsTo12Hr(shift.endTime)}` : "No Schedule"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, display: "block" }}>DAY STATUS</span>
                        <span style={{ 
                          fontSize: "0.7rem", 
                          fontWeight: 800, 
                          color: modalAttendance.status === "absent" ? "#ef4444" : "#10b981",
                          background: modalAttendance.status === "absent" ? "#fee2e2" : "#d1fae5",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          display: "inline-block",
                          marginTop: "2px"
                        }}>
                          {(modalAttendance.status || "Present").toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Accruals metrics */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                      <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", padding: "6px 10px", borderRadius: "8px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.6rem", color: "#64748b", display: "block", fontWeight: 700 }}>WORKED</span>
                        <strong style={{ fontSize: "0.85rem", color: "#1e293b" }}>{formatMins(workedMins)}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", padding: "6px 10px", borderRadius: "8px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.6rem", color: "#64748b", display: "block", fontWeight: 700 }}>BREAKS</span>
                        <strong style={{ fontSize: "0.85rem", color: "#d97706" }}>{formatMins(breakMins)}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", padding: "6px 10px", borderRadius: "8px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.6rem", color: "#64748b", display: "block", fontWeight: 700 }}>OVERTIME</span>
                        <strong style={{ fontSize: "0.85rem", color: overtimeMins > 0 ? "#059669" : "#64748b" }}>
                          {overtimeMins > 0 ? `+${formatMins(overtimeMins)}` : "0m"}
                        </strong>
                      </div>
                    </div>

                    {/* Login/Logout Tracker */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      <div style={{ background: "#f8fafc", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.6rem", color: "#64748b", display: "block", fontWeight: 700 }}>FIRST CHECK IN</span>
                        <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1e293b" }}>{firstIn ? formatDateTo12Hr(firstIn) : "N/A"}</div>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: loginP.color, marginTop: "2px", display: "inline-block" }}>{loginP.text}</span>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.6rem", color: "#64748b", display: "block", fontWeight: 700 }}>LAST CHECK OUT</span>
                        <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1e293b" }}>{lastOut ? formatDateTo12Hr(lastOut) : "N/A"}</div>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: logoutP.color, marginTop: "2px", display: "inline-block" }}>{logoutP.text}</span>
                      </div>
                    </div>

                    {/* Splits List */}
                    <div>
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "4px" }}>
                        Work Interval Splits ({logs.length})
                      </span>
                      {logs.length === 0 ? (
                        <div style={{ padding: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.72rem", color: "#94a3b8", textAlign: "center" }}>
                          No splits recorded on this date.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "140px", overflowY: "auto" }}>
                          {logs.map((log: any, idx: number) => (
                            <div key={idx} style={{ padding: "6px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem" }}>
                              <div>
                                <strong style={{ color: "#334155" }}>Block #{idx + 1}</strong>
                                <span style={{ color: "#64748b", marginLeft: "8px" }}>
                                  {formatDateTo12Hr(log.loginTime)} - {log.logoutTime ? formatDateTo12Hr(log.logoutTime) : "Active"}
                                </span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                <span style={{ fontWeight: 800, color: "#059669" }}>{formatMins(log.duration || 0)}</span>
                                {log.logoutReason && (
                                  <span style={{ fontSize: "0.55rem", color: "#ef4444", fontWeight: 700 }}>
                                    Reason: {log.logoutReason}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
