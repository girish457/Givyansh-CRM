import React, { useState, useEffect, useMemo } from "react";
import { 
  LucideCalendar, LucidePlus, LucideClock, LucideAlertTriangle, 
  LucideCheckCircle2, LucideUsers, LucidePlay, LucideX, LucideEdit, 
  LucideBarChart, LucideLock, LucideBookOpen, LucideArrowRight, LucideInfo, LucideLoader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MeetingRoom from "./MeetingRoom";

interface MeetingDashboardProps {
  currentUser: {
    id: number;
    name: string;
    role: string;
    companyId: number;
  } | null;
  role: "superadmin" | "boss" | "manager" | "tl" | "recruiter";
}

export default function MeetingDashboard({ currentUser, role }: MeetingDashboardProps) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [directory, setDirectory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Live Meeting Room ID
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Tabs: "list" | "calendar" | "schedule" | "analytics"
  const [activeTab, setActiveTab] = useState<"list" | "calendar" | "schedule" | "analytics">("list");
  
  // Calendar Sub-views: "month" | "week" | "day"
  const [calView, setCalView] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Scheduler Form
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<"scheduled" | "instant">("scheduled");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState("normal");
  const [selectedInvites, setSelectedInvites] = useState<number[]>([]);

  // Cancel / Reschedule modals
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleTarget, setRescheduleTarget] = useState<any | null>(null);
  const [reschDate, setReschDate] = useState("");
  const [reschTime, setReschTime] = useState("");
  const [reschReason, setReschReason] = useState("");

  // Search/Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Participant list filters
  const [inviteRoleFilter, setInviteRoleFilter] = useState("all");
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meetRes, dirRes] = await Promise.all([
        fetch("/api/meetings"),
        fetch("/api/meetings/participants-directory")
      ]);
      if (meetRes.ok) setMeetings(await meetRes.json());
      if (dirRes.ok) setDirectory(await dirRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check if query parameter has direct join room request
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      localStorage.setItem("current_active_meeting_id", room);
      window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));
      window.history.pushState(null, "", window.location.pathname);
    }
  }, [window.location.search]);

  // Invite selection directory mapping
  // Boss invites Manager, TL, Recruiter.
  // Manager invites Boss, Manager, TL, Recruiter.
  // TL invites Boss, Manager, TL, Recruiter.
  const filteredDirectory = useMemo(() => {
    return directory.filter(u => Number(u.id) !== Number(currentUser?.id));
  }, [directory, currentUser]);

  const displayedDirectory = useMemo(() => {
    return filteredDirectory.filter(u => {
      const matchesRole = inviteRoleFilter === "all" || u.role?.toLowerCase() === inviteRoleFilter.toLowerCase();
      const matchesSearch = !inviteSearchQuery ||
                            u.name?.toLowerCase().includes(inviteSearchQuery.toLowerCase()) ||
                            u.email?.toLowerCase().includes(inviteSearchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [filteredDirectory, inviteRoleFilter, inviteSearchQuery]);

  const isAllDisplayedSelected = useMemo(() => {
    if (displayedDirectory.length === 0) return false;
    return displayedDirectory.every(u => selectedInvites.includes(u.id));
  }, [displayedDirectory, selectedInvites]);

  const handleSelectAllToggle = () => {
    if (isAllDisplayedSelected) {
      const displayedIds = displayedDirectory.map(u => u.id);
      setSelectedInvites(prev => prev.filter(id => !displayedIds.includes(id)));
    } else {
      const displayedIds = displayedDirectory.map(u => u.id);
      setSelectedInvites(prev => {
        const unique = new Set([...prev, ...displayedIds]);
        return Array.from(unique);
      });
    }
  };

  const handleToggleInvite = (uId: number) => {
    setSelectedInvites(prev => 
      prev.includes(uId) ? prev.filter(id => id !== uId) : [...prev, uId]
    );
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          agenda,
          description: desc,
          meetingType: type,
          scheduledDate: date || null,
          scheduledTime: time || null,
          duration,
          priority,
          participants: selectedInvites
        })
      });

      if (res.ok) {
        const result = await res.json();
        alert(type === "instant" ? "Instant meeting started!" : "Meeting successfully scheduled!");
        
        // Reset scheduler form
        setTitle("");
        setAgenda("");
        setDesc("");
        setDate("");
        setTime("");
        setSelectedInvites([]);
        setType("scheduled");

        await fetchData();

        if (type === "instant" && result.meeting?.id) {
          localStorage.setItem("current_active_meeting_id", result.meeting.id.toString());
          window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));
        } else {
          setActiveTab("list");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelMeeting = async () => {
    if (!cancelReason.trim() || !cancelTargetId) return;

    try {
      const res = await fetch(`/api/meetings/${cancelTargetId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (res.ok) {
        setCancelTargetId(null);
        setCancelReason("");
        await fetchData();
      }
    } catch (e) {}
  };

  const handleRescheduleMeeting = async () => {
    if (!reschDate || !reschTime || !reschReason || !rescheduleTarget) return;

    try {
      const res = await fetch(`/api/meetings/${rescheduleTarget.id}/reschedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newDate: reschDate,
          newTime: reschTime,
          reason: reschReason
        })
      });

      if (res.ok) {
        setRescheduleTarget(null);
        setReschDate("");
        setReschTime("");
        setReschReason("");
        await fetchData();
      }
    } catch (e) {}
  };

  const handleJoinRoom = async (mId: number) => {
    try {
      const res = await fetch(`/api/meetings/${mId}/join`, { method: "POST" });
      if (res.ok) {
        localStorage.setItem("current_active_meeting_id", mId.toString());
        window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));
      }
    } catch (e) {}
  };

  // Filtered lists
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      const matchesSearch = m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.agenda?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.host?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [meetings, statusFilter, searchQuery]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const total = meetings.length;
    const upcoming = meetings.filter(m => m.status === "scheduled" || m.status === "rescheduled").length;
    const completed = meetings.filter(m => m.status === "completed").length;
    const active = meetings.filter(m => m.status === "live").length;
    const cancelled = meetings.filter(m => m.status === "cancelled").length;
    
    // Average attendance rate
    let totalAttendance = 0;
    let countedCompleted = 0;
    meetings.forEach(m => {
      if (m.status === "completed" && m.participants) {
        try {
          const totalInvited = JSON.parse(m.participants).length;
          const joinedCount = m.attendances?.filter((a: any) => a.status !== "absent").length || 0;
          if (totalInvited > 0) {
            totalAttendance += (joinedCount / totalInvited) * 100;
            countedCompleted++;
          }
        } catch (e) {}
      }
    });

    const avgAttendance = countedCompleted > 0 ? Math.round(totalAttendance / countedCompleted) : 100;

    return { total, upcoming, completed, active, cancelled, avgAttendance };
  }, [meetings]);

  // Dynamic Analytics Calculation
  const analyticsData = useMemo(() => {
    let totalAttendancesCount = 0;
    let joinedCount = 0;
    let lateJoinedCount = 0;
    let absentCount = 0;

    let hostMicSum = 0;
    let participantMicSum = 0;
    let speakingRecordsCount = 0;

    meetings.forEach(m => {
      if (m.status === "completed" && m.attendances && m.attendances.length > 0) {
        m.attendances.forEach((a: any) => {
          totalAttendancesCount++;
          if (a.status === "joined" || a.status === "completed" || a.status === "left_early") {
            joinedCount++;
          } else if (a.status === "late_joined" || a.status === "rejoined") {
            lateJoinedCount++;
          } else if (a.status === "absent") {
            absentCount++;
          }

          // speaking ratio calculations (based on micUsage)
          const isHost = Number(a.userId) === Number(m.hostId);
          if (isHost) {
            hostMicSum += a.micUsage || 0;
          } else {
            participantMicSum += a.micUsage || 0;
          }
          speakingRecordsCount++;
        });
      }
    });

    // Default fallbacks if no data exists
    let earlyJoinedRate = 82;
    let lateJoinedRate = 12;
    let absentRate = 6;

    if (totalAttendancesCount > 0) {
      earlyJoinedRate = Math.round((joinedCount / totalAttendancesCount) * 100);
      lateJoinedRate = Math.round((lateJoinedCount / totalAttendancesCount) * 100);
      absentRate = Math.round((absentCount / totalAttendancesCount) * 100);
      
      // Ensure they sum to 100
      const totalPct = earlyJoinedRate + lateJoinedRate + absentRate;
      if (totalPct !== 100 && totalPct > 0) {
        earlyJoinedRate = earlyJoinedRate + (100 - totalPct);
      }
    }

    let hostSpeakingRatio = 64;
    let participantSpeakingRatio = 36;

    const totalMic = hostMicSum + participantMicSum;
    if (totalMic > 0) {
      hostSpeakingRatio = Math.round((hostMicSum / totalMic) * 100);
      participantSpeakingRatio = 100 - hostSpeakingRatio;
    } else if (speakingRecordsCount > 0) {
      hostSpeakingRatio = 60;
      participantSpeakingRatio = 40;
    }

    return {
      earlyJoinedRate,
      lateJoinedRate,
      absentRate,
      hostSpeakingRatio,
      participantSpeakingRatio
    };
  }, [meetings]);

  // CUSTOM REACT CALENDAR BUILD (Month View Generator)
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Pad initial days
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const calendarDays = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Meetings...</span>
      </div>
    );
  }

  return (
    <div className="meeting-dashboard-container" style={{ padding: "10px", color: "#1e293b", minHeight: "100%", background: "#f8fafc", fontSize: "0.72rem" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .meeting-dashboard-container {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .meeting-row {
          transition: all 0.15s ease;
        }
        .meeting-row:hover {
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
        }
        .metric-card {
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
        }
        .metric-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
          border-color: #cbd5e1 !important;
        }
        .btn-hover {
          transition: all 0.15s ease;
        }
        .btn-hover:hover {
          opacity: 0.9;
          transform: translateY(-0.5px);
        }
        .btn-hover:active {
          transform: translateY(0);
        }
        .tab-btn {
          transition: all 0.15s ease;
        }
        .tab-btn:hover:not(.active) {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
        }
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
        .live-indicator {
          animation: pulse-live 1.2s infinite;
        }
      `}} />

      {/* Top Title Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span>Schedule Meet & </span>
            <span style={{ color: "#2563eb" }}>Live Collaboration</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>
            Schedule video conferences, track desking attendance metrics, and analyze productivity.
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", background: "#ffffff", padding: "3px", borderRadius: "6px", border: "1px solid #e2e8f0", gap: "4px" }}>
          <button
            onClick={() => setActiveTab("list")}
            className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
            style={{
              padding: "8px 16px",
              border: "none",
              background: activeTab === "list" ? "#2563eb" : "transparent",
              color: activeTab === "list" ? "white" : "#475569",
              borderRadius: "4px",
              fontSize: "0.8rem",
              fontWeight: 650,
              cursor: "pointer"
            }}
          >
            All Meetings
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`tab-btn ${activeTab === "calendar" ? "active" : ""}`}
            style={{
              padding: "8px 16px",
              border: "none",
              background: activeTab === "calendar" ? "#2563eb" : "transparent",
              color: activeTab === "calendar" ? "white" : "#475569",
              borderRadius: "4px",
              fontSize: "0.8rem",
              fontWeight: 650,
              cursor: "pointer"
            }}
          >
            Calendar View
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`tab-btn ${activeTab === "schedule" ? "active" : ""}`}
            style={{
              padding: "8px 16px",
              border: "none",
              background: activeTab === "schedule" ? "#2563eb" : "transparent",
              color: activeTab === "schedule" ? "white" : "#475569",
              borderRadius: "4px",
              fontSize: "0.8rem",
              fontWeight: 650,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <LucidePlus size={12} /> Schedule New
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            style={{
              padding: "8px 16px",
              border: "none",
              background: activeTab === "analytics" ? "#2563eb" : "transparent",
              color: activeTab === "analytics" ? "white" : "#475569",
              borderRadius: "4px",
              fontSize: "0.8rem",
              fontWeight: 650,
              cursor: "pointer"
            }}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* OVERVIEW METRICS BLOCK */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "16px" }}>
        {/* Total Meetings */}
        <div className="metric-card" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(37, 99, 235, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LucideCalendar size={15} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2px", lineHeight: 1.1 }}>Total Meets</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", marginTop: "2px", lineHeight: 1 }}>{metrics.total}</div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="metric-card" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LucideClock size={15} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2px", lineHeight: 1.1 }}>Upcoming</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#3b82f6", marginTop: "2px", lineHeight: 1 }}>{metrics.upcoming}</div>
          </div>
        </div>

        {/* Active Now */}
        <div className="metric-card" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LucidePlay size={15} color="#ef4444" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2px", lineHeight: 1.1, display: "flex", alignItems: "center", gap: "3px" }}>
              Live Now
              {metrics.active > 0 && <span className="live-indicator" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ef4444" }}></span>}
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ef4444", marginTop: "2px", lineHeight: 1 }}>{metrics.active}</div>
          </div>
        </div>

        {/* Completed */}
        <div className="metric-card" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LucideCheckCircle2 size={15} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2px", lineHeight: 1.1 }}>Completed</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981", marginTop: "2px", lineHeight: 1 }}>{metrics.completed}</div>
          </div>
        </div>

        {/* Attendance */}
        <div className="metric-card" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(245, 158, 11, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LucideUsers size={15} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2px", lineHeight: 1.1 }}>Avg Attnd %</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f59e0b", marginTop: "2px", lineHeight: 1 }}>{metrics.avgAttendance}%</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 0", fontSize: "0.75rem" }}>
          Loading meeting schedules...
        </div>
      ) : (
        <>
          {/* TAB 1: LIST VIEW */}
          {activeTab === "list" && (
            <div style={{ background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
              {/* Filters Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", gap: "16px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Search by host, agenda, title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 16px", fontSize: "0.88rem", outline: "none", width: "280px", fontWeight: 500 }}
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 16px", fontSize: "0.88rem", outline: "none", background: "white", fontWeight: 500 }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>
              </div>

              {/* Grid of Meetings */}
              {filteredMeetings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", color: "#64748b", fontSize: "0.78rem" }}>
                  No meetings found matching parameters.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {filteredMeetings.map((m) => {
                    const hostName = m.host?.name || "Self";
                    const isHost = Number(m.hostId) === Number(currentUser?.id);

                    return (
                      <div
                        className="meeting-row"
                        key={m.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          padding: "18px 24px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <strong style={{ fontSize: "1.05rem", color: "#0f172a", fontWeight: 650 }}>{m.title}</strong>
                            <span style={{
                              fontSize: "0.72rem",
                              background: m.status === "live" ? "#fee2e2" : m.status === "completed" ? "#dcfce7" : m.status === "cancelled" ? "#fee2e2" : "#f1f5f9",
                              color: m.status === "live" ? "#ef4444" : m.status === "completed" ? "#10b981" : m.status === "cancelled" ? "#ef4444" : "#475569",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.2px"
                            }}>
                              {m.status}
                            </span>
                          </div>

                          <div style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "14px", marginTop: "4px", flexWrap: "wrap" }}>
                            <span><strong style={{ fontWeight: 600, color: "#475569" }}>Host:</strong> {hostName}</span>
                            <span style={{ color: "#cbd5e1" }}>•</span>
                            <span><strong style={{ fontWeight: 600, color: "#475569" }}>Agenda:</strong> {m.agenda || "N/A"}</span>
                            <span style={{ color: "#cbd5e1" }}>•</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><LucideCalendar size={14} style={{ opacity: 0.7 }} /> {m.scheduledDate}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><LucideClock size={14} style={{ opacity: 0.7 }} /> {m.scheduledTime} ({m.duration} mins)</span>
                          </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          {(m.status === "scheduled" || m.status === "rescheduled" || m.status === "live") && (
                            <button
                              onClick={() => handleJoinRoom(m.id)}
                              className="btn-hover"
                              style={{
                                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "10px 18px",
                                fontSize: "0.88rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                            >
                              <LucidePlay size={14} /> {Number(m.hostId) === Number(currentUser?.id) ? "Start Room" : "Join"}
                            </button>
                          )}

                          {isHost && (m.status === "scheduled" || m.status === "rescheduled") && (
                            <>
                              <button
                                onClick={() => {
                                  setRescheduleTarget(m);
                                  setReschDate(m.scheduledDate || "");
                                  setReschTime(m.scheduledTime || "");
                                }}
                                className="btn-hover"
                                style={{ background: "none", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px 18px", color: "#475569", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => setCancelTargetId(m.id)}
                                className="btn-hover"
                                style={{ background: "none", border: "1px solid #fee2e2", borderRadius: "6px", padding: "10px 18px", color: "#ef4444", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CALENDAR VIEW */}
          {activeTab === "calendar" && (
            <div style={{ background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
              {/* Month Selector header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                </h2>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => changeMonth(-1)} className="btn-hover" style={{ background: "none", border: "1px solid #cbd5e1", borderRadius: "4px", width: "28px", height: "28px", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>&lt;</button>
                  <button onClick={() => setCurrentDate(new Date())} className="btn-hover" style={{ background: "none", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "0 10px", height: "28px", cursor: "pointer", fontWeight: 700, fontSize: "0.78rem" }}>Today</button>
                  <button onClick={() => changeMonth(1)} className="btn-hover" style={{ background: "none", border: "1px solid #cbd5e1", borderRadius: "4px", width: "28px", height: "28px", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>&gt;</button>
                </div>
              </div>

              {/* Day header */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontWeight: 700, fontSize: "0.78rem", color: "#64748b", paddingBottom: "8px", borderBottom: "1px solid #e2e8f0" }}>
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Calendar Days Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "95px", borderBottom: "1px solid #e2e8f0" }}>
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={`pad-${idx}`} style={{ borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", background: "#f8fafc" }} />;
                  
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  // Construct timezone-independent local YYYY-MM-DD
                  const year = day.getFullYear();
                  const month = String(day.getMonth() + 1).padStart(2, "0");
                  const dateNum = String(day.getDate()).padStart(2, "0");
                  const dateStr = `${year}-${month}-${dateNum}`;
                  
                  // Filter meetings scheduled for this date (show all statuses)
                  const dayMeetings = meetings.filter(m => m.scheduledDate === dateStr);

                  return (
                    <div
                      key={dateStr}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        borderRight: "1px solid #f1f5f9",
                        padding: "6px",
                        position: "relative",
                        background: isToday ? "rgba(37, 99, 235, 0.03)" : "white"
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: isToday ? 900 : 600,
                          color: isToday ? "#2563eb" : "#475569",
                          background: isToday ? "rgba(37,99,235,0.12)" : "transparent",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {day.getDate()}
                      </span>

                      {/* Display small meeting tags */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px", overflow: "hidden", maxHeight: "68px" }}>
                        {dayMeetings.map(m => (
                          <div
                            key={m.id}
                            onClick={() => handleJoinRoom(m.id)}
                            title={`${m.title} (${m.scheduledTime}) - Status: ${m.status}`}
                            style={{
                              fontSize: "0.58rem",
                              background: m.status === "live" ? "#fee2e2" : m.status === "completed" ? "#dcfce7" : m.status === "cancelled" ? "#f1f5f9" : "#dbeafe",
                              color: m.status === "live" ? "#ef4444" : m.status === "completed" ? "#10b981" : m.status === "cancelled" ? "#64748b" : "#2563eb",
                              padding: "2px 4px",
                              borderRadius: "3px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "pointer",
                              fontWeight: 700
                            }}
                          >
                            {m.scheduledTime} - {m.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SCHEDULER FORM */}
          {activeTab === "schedule" && (
            <div style={{ background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Schedule Meeting Session</h2>
              <form onSubmit={handleCreateMeeting} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>Meeting Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Weekly Conversion Sync"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "9px 12px", fontSize: "0.78rem", outline: "none", fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>Agenda Target</label>
                    <input
                      type="text"
                      placeholder="e.g. Candidate drops review"
                      value={agenda}
                      onChange={(e) => setAgenda(e.target.value)}
                      style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "9px 12px", fontSize: "0.78rem", outline: "none", fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>Meeting Type</label>
                    <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                        <input type="radio" checked={type === "scheduled"} onChange={() => setType("scheduled")} style={{ width: "14px", height: "14px" }} /> Scheduled
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                        <input type="radio" checked={type === "instant"} onChange={() => setType("instant")} style={{ width: "14px", height: "14px" }} /> Instant Live
                      </label>
                    </div>
                  </div>

                  {type === "scheduled" && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>Date</label>
                        <input
                          type="date"
                          required={type === "scheduled"}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 10px", fontSize: "0.78rem", outline: "none", fontWeight: 600 }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>Start Time</label>
                        <input
                          type="time"
                          required={type === "scheduled"}
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 10px", fontSize: "0.78rem", outline: "none", fontWeight: 600 }}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>Duration (Mins)</label>
                      <input
                        type="number"
                        min="5" max="300"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "9px 12px", fontSize: "0.78rem", outline: "none", fontWeight: 600 }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>Priority Code</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "9px 12px", fontSize: "0.78rem", outline: "none", background: "white", fontWeight: 600 }}
                      >
                        <option value="normal">Normal</option>
                        <option value="important">Important</option>
                        <option value="critical">Critical</option>
                        <option value="mandatory">Mandatory</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right side: Participant Invite Checklist */}
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <label style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>Invite Participants</label>
                  
                  {/* Participant Filter controls */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Search name/email..."
                      value={inviteSearchQuery}
                      onChange={(e) => setInviteSearchQuery(e.target.value)}
                      style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: "6px", padding: "7px 10px", fontSize: "0.75rem", outline: "none", fontWeight: 500 }}
                    />
                    <select
                      value={inviteRoleFilter}
                      onChange={(e) => setInviteRoleFilter(e.target.value)}
                      style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "7px 10px", fontSize: "0.75rem", outline: "none", background: "white", fontWeight: 500 }}
                    >
                      <option value="all">All Roles</option>
                      <option value="manager">Manager</option>
                      <option value="tl">TL</option>
                      <option value="recruiter">Recruiter</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleSelectAllToggle}
                      className="btn-hover"
                      style={{
                        background: isAllDisplayedSelected ? "#f1f5f9" : "#2563eb",
                        color: isAllDisplayedSelected ? "#475569" : "white",
                        border: isAllDisplayedSelected ? "1px solid #cbd5e1" : "none",
                        borderRadius: "6px",
                        padding: "7px 12px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {isAllDisplayedSelected ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "10px",
                      overflowY: "auto",
                      minHeight: "260px",
                      maxHeight: "310px",
                      background: "#f8fafc",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px"
                    }}
                  >
                    {displayedDirectory.map((user) => (
                      <label
                        key={user.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          background: selectedInvites.includes(user.id) ? "#dbeafe" : "#ffffff",
                          border: selectedInvites.includes(user.id) ? "1px solid #2563eb" : "1px solid #e2e8f0",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="checkbox"
                            checked={selectedInvites.includes(user.id)}
                            onChange={() => handleToggleInvite(user.id)}
                            style={{ width: "13px", height: "13px" }}
                          />
                          <div>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1e293b" }}>{user.name}</span>
                            <span style={{ fontSize: "0.58rem", color: "#64748b", display: "block", fontWeight: 500 }}>{user.email}</span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: "0.58rem",
                          background: "rgba(0,0,0,0.05)",
                          color: "#475569",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          fontWeight: 700
                        }}>
                          {user.role.toUpperCase()}
                        </span>
                      </label>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="btn-hover"
                    style={{
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "11px 0",
                      fontSize: "0.78rem",
                      fontWeight: 750,
                      cursor: "pointer",
                      marginTop: "12px",
                      boxShadow: "0 2px 8px rgba(37,99,235,0.15)"
                    }}
                  >
                    {type === "instant" ? "Launch Live Instant Room" : "Publish Scheduled Meeting"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: ANALYTICS */}
          {activeTab === "analytics" && (
            <div style={{ background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Meeting Productivity Analytics</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "16px", background: "#f8fafc" }}>
                  <h3 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", margin: "0 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>Historical Attendance Quality</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                      <span>Early Joined Rate</span>
                      <strong style={{ color: "#10b981", fontSize: "0.82rem" }}>{analyticsData.earlyJoinedRate}%</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                      <span>Late Joined Rate</span>
                      <strong style={{ color: "#f59e0b", fontSize: "0.82rem" }}>{analyticsData.lateJoinedRate}%</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                      <span>Unexcused Absences</span>
                      <strong style={{ color: "#ef4444", fontSize: "0.82rem" }}>{analyticsData.absentRate}%</strong>
                    </div>
                  </div>
                </div>

                <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "16px", background: "#f8fafc" }}>
                  <h3 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", margin: "0 0 10px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>Average Speaking Analytics</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                      <span>Host speaking ratio</span>
                      <strong style={{ fontSize: "0.82rem" }}>{analyticsData.hostSpeakingRatio}%</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                      <span>Participant feedback ratio</span>
                      <strong style={{ fontSize: "0.82rem" }}>{analyticsData.participantSpeakingRatio}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* OVERLAY MODAL: CANCEL MEETING */}
      {cancelTargetId && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(15, 23, 42, 0.3)",
            backdropFilter: "blur(3px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div style={{ background: "white", borderRadius: "6px", padding: "12px", width: "100%", maxWidth: "300px", border: "1px solid #cbd5e1" }}>
            <h3 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#ef4444", margin: "0 0 6px 0" }}>Cancel Meeting</h3>
            <p style={{ fontSize: "0.68rem", color: "#475569", margin: "0 0 6px 0", fontWeight: 500 }}>
              Provide a reason for cancellation. All participants will be notified.
            </p>
            <textarea
              required
              placeholder="Reason for cancellation (mandatory)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                padding: "6px",
                fontSize: "0.68rem",
                outline: "none",
                resize: "none",
                fontWeight: 500,
                marginBottom: "8px"
              }}
            />
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={handleCancelMeeting}
                className="btn-hover"
                style={{ flex: 1, background: "#ef4444", color: "white", border: "none", borderRadius: "4px", padding: "5px", fontSize: "0.68rem", fontWeight: 750, cursor: "pointer" }}
              >
                Confirm Cancel
              </button>
              <button
                onClick={() => { setCancelTargetId(null); setCancelReason(""); }}
                className="btn-hover"
                style={{ flex: 1, background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "5px", fontSize: "0.68rem", fontWeight: 750, cursor: "pointer" }}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: RESCHEDULE MEETING */}
      {rescheduleTarget && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(15, 23, 42, 0.3)",
            backdropFilter: "blur(3px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div style={{ background: "white", borderRadius: "6px", padding: "12px", width: "100%", maxWidth: "320px", border: "1px solid #cbd5e1" }}>
            <h3 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#2563eb", margin: "0 0 6px 0" }}>Reschedule Meeting</h3>
            
            <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.52rem", color: "#64748b", fontWeight: 700, display: "block", marginBottom: "2px" }}>New Date</label>
                <input
                  type="date"
                  required
                  value={reschDate}
                  onChange={(e) => setReschDate(e.target.value)}
                  style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 6px", fontSize: "0.68rem", outline: "none", fontWeight: 600 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.52rem", color: "#64748b", fontWeight: 700, display: "block", marginBottom: "2px" }}>New Time</label>
                <input
                  type="time"
                  required
                  value={reschTime}
                  onChange={(e) => setReschTime(e.target.value)}
                  style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 6px", fontSize: "0.68rem", outline: "none", fontWeight: 600 }}
                />
              </div>
            </div>

            <textarea
              placeholder="Reason for reschedule..."
              value={reschReason}
              onChange={(e) => setReschReason(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                padding: "6px",
                fontSize: "0.68rem",
                outline: "none",
                resize: "none",
                fontWeight: 500,
                marginBottom: "8px"
              }}
            />

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={handleRescheduleMeeting}
                className="btn-hover"
                style={{ flex: 1, background: "#2563eb", color: "white", border: "none", borderRadius: "4px", padding: "5px", fontSize: "0.68rem", fontWeight: 750, cursor: "pointer" }}
              >
                Confirm Reschedule
              </button>
              <button
                onClick={() => { setRescheduleTarget(null); setReschDate(""); setReschTime(""); setReschReason(""); }}
                className="btn-hover"
                style={{ flex: 1, background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "5px", fontSize: "0.68rem", fontWeight: 750, cursor: "pointer" }}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
