import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { 
  LucideLayoutDashboard,
  LucideUsers,
  LucideBriefcase,
  LucideBuilding2,
  LucideSearch,
  LucideMail,
  LucideFileBarChart,
  LucideTruck,
  LucideClipboardList,
  LucideMegaphone,
  LucideCheckCircle2,
  LucideDatabase,
  LucidePlus,
  LucideShieldCheck,
  LucideRocket,
  LucideCalendar,
  LucideTrendingUp,
  LucideGift,
  LucideBanknote,
  LucideFileText,
  LucideCheckSquare,
  LucideMessageSquare,
  LucideFileLock,
  LucideCpu,
  LucideSettings,
  LucideTarget,
  LucideActivity,
  LucideRefreshCw,
  LucideClock,
  LucideUserCheck,
  LucideAlertTriangle,
  LucideArrowUpRight,
  LucideArrowDownRight,
  LucidePhoneCall,
  LucideUserX,
  LucideAward,
  LucideFilter,
  LucideChevronDown,
  LucideChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TeamManagement from "@/components/dashboard/TeamManagement";
import TaskAssignment from "@/components/dashboard/TaskAssignment";
import Clients from "@/components/dashboard/Clients";
import Jobs from "@/components/dashboard/Jobs";
import SourcingHub from "@/components/dashboard/SourcingHub";
import ControlCenter from "@/components/dashboard/ControlCenter";
import AttendanceHub from "@/components/dashboard/AttendanceHub";
import MyToDoList from "@/components/dashboard/MyToDoList";
import BossReports from "@/components/dashboard/BossReports";
import MyVendors from "@/components/dashboard/MyVendors";
import CandidateReverts from "../../components/dashboard/CandidateReverts";
import { ReminderSystem } from "./Recruiter";
import BossLeadIntelligence from "@/components/dashboard/BossLeadIntelligence";
import BossAnnouncements from "@/components/dashboard/BossAnnouncements";
import BossCandidateDataCenter from "@/components/dashboard/BossCandidateDataCenter";
import BossIncentiveHub from "@/components/dashboard/BossIncentiveHub";
import SupervisorFeedbackTab from "@/components/dashboard/SupervisorFeedbackTab";
import SupervisorPolicyTab from "@/components/dashboard/SupervisorPolicyTab";
import ManagerGiftsCenter from "@/components/dashboard/ManagerGiftsCenter";
import "@/styles/Dashboard.css";

export default function BossDashboard() {
  const { tab = "dashboard" } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchCandidates();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/candidates");
      if (res.ok) {
        setCandidates(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch candidates", err);
    }
  };

  const renderContent = () => {
    switch (tab) {
      case "dashboard": return <DashboardHome candidates={candidates} userProfile={userProfile} navigate={navigate} />;
      case "feedback": return <SupervisorFeedbackTab role="boss" currentUser={userProfile} />;
      case "team": return <TeamManagement role="boss" />;
      case "tasks": return <TaskAssignment role="boss" />;
      case "clients": return <Clients role="boss" />;
      case "jobs": return <Jobs role="boss" />;
      case "sourcing": return <SourcingHub role="boss" />;
      case "vendors": return <MyVendors currentUser={userProfile} candidates={candidates} />;
      case "reports": return <BossReports />;
      case "inbox": return <PlaceholderView title="CEO Inbox" icon={<LucideMail size={40} />} desc="Confidential communications and corporate escalations." />;
      case "leads": return <BossLeadIntelligence />;
      case "gifts": return <ManagerGiftsCenter role="boss" />;
      case "announcements": return <BossAnnouncements />;
      case "candidate-data": return <BossCandidateDataCenter />;
      case "attendance": return <AttendanceHub />;
      case "incentive": return <BossIncentiveHub />;
      case "todo": return <MyToDoList />;
      case "policy": return <SupervisorPolicyTab role="boss" currentUser={userProfile} />;
      case "control": return <ControlCenter />;
      case "settings": return <PlaceholderView title="Boss Configurations" icon={<LucideSettings size={40} />} desc="Personalized executive dashboard and secure settings." />;
      case "reverts": return <CandidateReverts candidates={candidates} currentUser={userProfile} onRefresh={fetchCandidates} role="boss" />;
      default: return <DashboardHome candidates={candidates} userProfile={userProfile} navigate={navigate} />;
    }
  };

  return (
    <AdminLayout 
      role="boss" 
      userName={userProfile?.name || "The Boss"} 
      activeTab={tab}
      onTabChange={(id) => navigate(`/dashboard/boss/${id}`)}
    >
      <ReminderSystem candidates={candidates} onRefresh={fetchCandidates} />
      <div style={{ height: "100%" }}>
        {renderContent()}
      </div>
    </AdminLayout>
  );
}

// Reusable collapsible card for boss dashboard
const DashboardCard = ({ 
  title, 
  icon, 
  sectionKey, 
  collapsedSections, 
  toggleSection, 
  children, 
  style = {},
  headerRight = null
}: { 
  title: string; 
  icon: React.ReactNode; 
  sectionKey: string; 
  collapsedSections: Record<string, boolean>; 
  toggleSection: (key: string) => void; 
  children: React.ReactNode; 
  style?: React.CSSProperties;
  headerRight?: React.ReactNode;
}) => {
  const isCollapsible = sectionKey === "orgTree";
  const isCollapsed = isCollapsible && !!collapsedSections[sectionKey];

  return (
    <div 
      style={{ 
        background: "#ffffff", 
        borderRadius: "8px", 
        border: "1px solid #e2e8f0", 
        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
        overflow: "hidden",
        transition: "all 0.15s ease",
        ...style 
      }}
    >
      {/* Card Header */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "8px 12px", 
          borderBottom: isCollapsed ? "none" : "1px solid #f1f5f9",
          background: "#f8fafc",
          cursor: isCollapsible ? "pointer" : "default",
          userSelect: "none"
        }}
        onClick={isCollapsible ? () => toggleSection(sectionKey) : undefined}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "flex", alignItems: "center", color: "#475569" }}>{icon}</span>
          <h3 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {title}
          </h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
          {headerRight}
          {isCollapsible && (
            <button
              onClick={() => toggleSection(sectionKey)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                padding: "2px",
                borderRadius: "4px"
              }}
            >
              {isCollapsed ? <LucideChevronDown size={12} /> : <LucideChevronUp size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div 
        style={{ 
          display: isCollapsed ? "none" : "block",
          padding: "8px 10px"
        }}
      >
        {children}
      </div>
    </div>
  );
};

const DashboardHome = ({ candidates = [], userProfile = null, navigate }: { candidates: any[]; userProfile: any; navigate: any }) => {
  const [monitoring, setMonitoring] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [complianceMatrix, setComplianceMatrix] = useState<any[]>([]);
  const [giftsList, setGiftsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [teamRoleFilter, setTeamRoleFilter] = useState<string>("All");
  const [teamStatusFilter, setTeamStatusFilter] = useState<string>("All");
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>("");

  const [scoreboardTab, setScoreboardTab] = useState<"recruiter" | "tl" | "manager">("recruiter");
  const [scoreboardTimeFilter, setScoreboardTimeFilter] = useState<"today" | "weekly" | "monthly" | "yearly">("monthly");

  const [drillDown, setDrillDown] = useState<any | null>(null);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem("fast_rms_boss_collapsed_sections_v3");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse collapsed sections config", e);
    }
    return {
      orgTree: true, // Section 2: Live Corporate Hierarchy Nodes is collapsed by default
      deskingTelemetry: false,
      performanceScoreboard: false,
      funnelPipeline: false,
      candidateStatus: false,
      clientAnalytics: false,
      jobAnalytics: false,
      sourcingPlatform: false,
      leadCategories: false,
      attendanceTelemetry: false,
      taskControl: false,
      performanceComparison: false,
      incentiveBoard: false,
      giftAnalytics: false,
      feedbackPolicy: false,
      policyAcknowledgment: false,
      systemUsage: false,
      growthTrends: false,
      quickActions: false,
    };
  });

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("fast_rms_boss_collapsed_sections_v3", JSON.stringify(updated));
      return updated;
    });
  };

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      const [monRes, repRes, feedRes, polRes, compRes] = await Promise.all([
        fetch("/api/boss/team-monitoring"),
        fetch("/api/boss/reports-hub"),
        fetch("/api/feedback/list"),
        fetch("/api/policies"),
        fetch("/api/policies/compliance-matrix").catch(() => null)
      ]);

      if (monRes.ok) setMonitoring(await monRes.json());
      if (repRes.ok) setReports(await repRes.json());
      if (feedRes && feedRes.ok) setFeedbacks(await feedRes.json());
      if (polRes && polRes.ok) setPolicies(await polRes.json());
      if (compRes && compRes.ok) setComplianceMatrix(await compRes.json());

      const storedGifts = localStorage.getItem("fast_rms_gifts_v1");
      if (storedGifts) {
        setGiftsList(JSON.parse(storedGifts));
      }
    } catch (err) {
      console.error("Failed to load Executive Dashboard telemetry", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const productivityScore = useMemo(() => {
    if (reports?.summary?.averageTeamProductivity) return reports.summary.averageTeamProductivity;
    if (monitoring?.kpi?.averageTeamProductivity) return monitoring.kpi.averageTeamProductivity;
    return 0;
  }, [monitoring, reports]);

  // Clickable handlers for Drills
  const handleWorkforceClick = () => {
    const list = monitoring?.userList || [];
    setDrillDown({
      title: "Organization Human Resources Directory",
      description: "Personnel registry of all active corporate nodes.",
      columns: ["Name", "Email", "Designation", "Shift Timings", "Current Live Status"],
      rows: list.map((u: any) => [
        u.name,
        u.email,
        (u.designation || u.role || "N/A").toUpperCase(),
        u.shiftTiming || "General Shift",
        u.status === "active" ? "🟢 Online" : u.status === "break" ? "🟡 Break" : "⚫ Offline"
      ])
    });
  };

  const handleOnlineUsersClick = (statusType?: string) => {
    let list = monitoring?.userList || [];
    if (statusType) {
      list = list.filter((u: any) => u.status === statusType);
    }
    setDrillDown({
      title: `Live Desk Telemetry: ${statusType ? statusType.toUpperCase() : "ALL"}`,
      description: "Real-time active status tracking of workstation logins.",
      columns: ["Name", "Designation", "Check-in", "Today Working Time", "Break count"],
      rows: list.map((u: any) => [
        u.name,
        (u.designation || u.role || "N/A").toUpperCase(),
        u.checkInTime || "N/A",
        u.workingHours || "0.0 hrs",
        u.breakCount || 0
      ])
    });
  };

  const filterCandidatesByStatus = (statusName: string) => {
    const list = candidates.filter((c: any) => {
      const remarks = (c.remarks || "").toLowerCase();
      const status = (c.status || "").toLowerCase();
      switch (statusName) {
        case "connected": return remarks === "connected" || status === "connected";
        case "notconnected": return remarks === "not connected" || status === "not connected";
        case "interested": return remarks === "interested" || status === "interested";
        case "notinterested": return remarks === "not interested" || status === "not interested";
        case "callnotpick": return remarks === "call not pick" || status === "call not pick" || remarks.includes("no answer");
        case "scheduled": return remarks.includes("schedule") || status.includes("schedule");
        case "goforinterview": return remarks === "go for interview" || status === "go for interview" || c.interviewDate;
        case "selected": return remarks === "selected" || status === "hired" || status === "selected";
        case "rejected": return remarks === "rejected" || status === "rejected";
        case "processtojoining": return remarks === "process to joining" || status === "process to joining";
        case "joined": return remarks.includes("join") || status === "joined";
        case "dropped": return remarks === "dropped" || status === "dropped";
        default: return true;
      }
    });
    setDrillDown({
      title: `Candidates - Status: ${statusName.toUpperCase()}`,
      description: `List of candidate records currently marked as ${statusName}.`,
      columns: ["Name", "Email", "Phone", "Designation", "Current Status", "Sourced By"],
      rows: list.map((c: any) => [
        c.name,
        c.email || "N/A",
        c.phone || "N/A",
        c.designation || c.jobRole || "N/A",
        c.remarks || c.status || "N/A",
        c.sourcingBy || "Direct"
      ])
    });
  };

  const handleEmployeeDrillDown = (emp: any) => {
    if (!emp) return;
    const stats = monitoring?.userList?.find((u: any) => u.id === emp.id) || emp;
    setDrillDown({
      title: `Employee Focus: ${emp.name}`,
      description: `Detailed operational metrics and status logs for ${emp.name}.`,
      columns: ["Metric Name", "Value"],
      rows: [
        ["Designation / Role", stats.designation || stats.role?.toUpperCase() || "CEO"],
        ["Shift Allocation", stats.shiftName ? `${stats.shiftName} (${stats.shiftTiming})` : "General Shift"],
        ["Working Compliance", stats.status === "active" ? "🟢 ONLINE / ACTIVE" : stats.status === "break" ? "🟡 BREAK" : "⚫ OFFLINE"],
        ["Check-In Time", stats.checkInTime || "N/A"],
        ["Today's Working Hours", stats.workingHours || "0.0 hrs"],
        ["Break Duration & Count", `${stats.breakTime || '0m'} (${stats.breakCount || 0} breaks)`],
        ["Productivity Scoring Today", `${stats.performance?.productivityScore || 0}%`],
        ["Selections Today", `${stats.performance?.selections || 0} candidates`],
        ["Joinings Today", `${stats.performance?.joinings || 0} candidates`],
        ["Leads Added Today", `${stats.performance?.leads || 0} leads`],
        ["Active Tasks In Progress", `${stats.tasks?.activeTasks || 0} tasks`]
      ]
    });
  };

  const handleClientClick = (client: any) => {
    const list = candidates.filter((c: any) => c.clientName === client.clientName);
    setDrillDown({
      title: `Client Profile: ${client.clientName}`,
      description: `Candidate pipelines associated with ${client.clientName}.`,
      columns: ["Candidate Name", "Designation", "Stage", "Recruiter", "Date Sourced"],
      rows: list.map((c: any) => [
        c.name,
        c.designation || c.jobRole || "N/A",
        c.remarks || c.status || "New",
        c.addedByName || `User #${c.addedBy}`,
        new Date(c.createdAt).toLocaleDateString()
      ])
    });
  };

  const handleJobClick = (job: any) => {
    const list = candidates.filter((c: any) => c.jobRole === job.jobTitle || c.designation === job.jobTitle);
    setDrillDown({
      title: `Job Title: ${job.jobTitle}`,
      description: `Active candidates mapped to the ${job.jobTitle} vacancy.`,
      columns: ["Candidate Name", "Client Mapped", "Pipeline Status", "Recruiter"],
      rows: list.map((c: any) => [
        c.name,
        c.clientName || "N/A",
        c.remarks || c.status || "New",
        c.addedByName || `User #${c.addedBy}`
      ])
    });
  };

  const handleSourceClick = (source: string) => {
    const list = candidates.filter((c: any) => c.sourcingBy && c.sourcingBy.toLowerCase().includes(source.toLowerCase()));
    setDrillDown({
      title: `Sourcing Analytics: ${source}`,
      description: `Performance metrics for candidates acquired via ${source}.`,
      columns: ["Candidate Name", "Email", "Designation", "Status", "Joined"],
      rows: list.map((c: any) => [
        c.name,
        c.email || "N/A",
        c.designation || c.jobRole || "N/A",
        c.remarks || c.status || "N/A",
        (c.remarks && c.remarks.toLowerCase().includes("join")) ? "Yes" : "No"
      ])
    });
  };

  const handleLateLoginsClick = () => {
    const list = (reports?.attendance || []).filter((a: any) => a.lateLogin === "Yes");
    setDrillDown({
      title: "Today's Late Check-Ins",
      description: "List of staff members who checked in after shift start timings.",
      columns: ["Employee Name", "Role", "Check-In Time", "Working Hours"],
      rows: list.map((a: any) => [
        a.employeeName,
        a.role.toUpperCase(),
        a.checkInTime,
        a.workingHours
      ])
    });
  };

  const handleOvertimeClick = () => {
    const list = (reports?.attendance || []).filter((a: any) => parseFloat(a.overtime || "0") > 0);
    setDrillDown({
      title: "Today's Overtime Telemetry",
      description: "Employees logged working over shift duration hours.",
      columns: ["Employee Name", "Check-In Time", "Check-Out Time", "Overtime Duration"],
      rows: list.map((a: any) => [
        a.employeeName,
        a.checkInTime,
        a.checkOutTime,
        a.overtime
      ])
    });
  };

  const handleTasksClick = (statusFilter: string) => {
    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => {
        const filtered = statusFilter === "all" ? data : data.filter((t: any) => t.status === statusFilter);
        setDrillDown({
          title: `Task Registry - Status: ${statusFilter.toUpperCase()}`,
          description: "Details of assigned tasks.",
          columns: ["Task Title", "Assigned To", "Assigned By", "Deadline", "Status", "Completion %"],
          rows: filtered.map((t: any) => [
            t.title,
            t.assigneeName || `User #${t.assigneeId}`,
            t.creatorName || `User #${t.createdBy}`,
            new Date(t.deadline).toLocaleDateString(),
            t.status.toUpperCase(),
            `${t.completionProgress || 0}%`
          ])
        });
      })
      .catch(err => console.error("Drill-down tasks load failed", err));
  };

  const handleFeedbackClick = (type: string) => {
    const filtered = type === "all" ? feedbacks : feedbacks.filter((f: any) => f.feedbackType?.toLowerCase() === type.toLowerCase());
    setDrillDown({
      title: `Daily Feedbacks - Category: ${type.toUpperCase()}`,
      description: "Confidential supervisor feedback logs.",
      columns: ["Recruiter", "Subject", "Category", "Priority", "Anonymous", "Submitted Date"],
      rows: filtered.map((f: any) => [
        f.isAnonymous ? "Anonymous" : (f.recruiter?.name || "Recruiter"),
        f.subject,
        f.feedbackType,
        f.priority,
        f.isAnonymous ? "Yes" : "No",
        new Date(f.createdAt).toLocaleDateString()
      ])
    });
  };

  const handlePolicyComplianceClick = (accepted: boolean) => {
    const list = complianceMatrix.filter((item: any) => item.accepted === accepted);
    setDrillDown({
      title: accepted ? "Policy Compliant Employees" : "Pending Policy Acknowledgements",
      description: accepted ? "Staff members who have reviewed and accepted company directives." : "Staff members who have not accepted active directives.",
      columns: ["Employee Name", "Email", "Role", "Last Interaction Time", "Documents Reviewed"],
      rows: list.map((item: any) => [
        item.user?.name || item.userName || "N/A",
        item.user?.email || item.userEmail || "N/A",
        (item.user?.role || item.userRole || "N/A").toUpperCase(),
        item.acceptedDate ? new Date(item.acceptedDate).toLocaleString() : "N/A",
        item.documentsViewed || "None"
      ])
    });
  };

  const handleGiftsDrillDown = () => {
    setDrillDown({
      title: "Gifts & Vouchers Disbursement History",
      description: "Audit trail of incentives shared across target recruiters and TL nodes.",
      columns: ["Gift Title", "Type", "Financial Worth", "Allocation Date", "Claim Status"],
      rows: giftsList.map((g: any) => [
        g.title,
        g.type,
        `₹${g.value}`,
        new Date(g.date).toLocaleDateString(),
        g.status
      ])
    });
  };

  // Live team monitoring status center filters
  const filteredTeamList = useMemo(() => {
    let list = monitoring?.userList || [];
    if (teamRoleFilter !== "All") {
      list = list.filter((u: any) => u.role?.toLowerCase() === teamRoleFilter.toLowerCase());
    }
    if (teamStatusFilter !== "All") {
      list = list.filter((u: any) => u.status?.toLowerCase() === teamStatusFilter.toLowerCase());
    }
    if (teamSearchQuery) {
      list = list.filter((u: any) => u.name?.toLowerCase().includes(teamSearchQuery.toLowerCase()));
    }
    return list;
  }, [monitoring, teamRoleFilter, teamStatusFilter, teamSearchQuery]);

  // Section 2 - Visual Org Tree Render (Compact Version)
  const renderOrgTree = () => {
    const managers = monitoring?.tree || [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)" }}>
        {/* Boss Node */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", perspective: "1000px" }}>
          <div 
            onClick={() => handleEmployeeDrillDown({ id: userProfile?.id, name: userProfile?.name || "CEO", role: "boss" })}
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "12px",
              padding: "8px 24px",
              textAlign: "center",
              boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.25), 0 4px 12px -2px rgba(15, 23, 42, 0.15), inset 0 1px 1px 0 rgba(255,255,255,0.1)",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.03) rotateX(3deg)";
              e.currentTarget.style.boxShadow = "0 20px 35px -8px rgba(15, 23, 42, 0.4), 0 10px 20px -6px rgba(15, 23, 42, 0.25), 0 0 12px rgba(245, 158, 11, 0.2)";
              e.currentTarget.style.borderColor = "#fbbf24";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1) rotateX(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px -4px rgba(15, 23, 42, 0.25), 0 4px 12px -2px rgba(15, 23, 42, 0.15), inset 0 1px 1px 0 rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.4)";
            }}
          >
            <strong style={{ color: "#ffffff", fontSize: "0.88rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>👑 {userProfile?.name || "Ultimate CEO"}</strong>
            <span style={{ 
              display: "inline-block", 
              fontSize: "0.6rem", 
              background: "rgba(245, 158, 11, 0.15)", 
              color: "#fbbf24", 
              padding: "2px 8px", 
              borderRadius: "20px", 
              border: "1px solid rgba(245, 158, 11, 0.3)", 
              marginTop: "4px", 
              fontWeight: 800, 
              letterSpacing: "0.5px"
            }}>BOSS (CEO)</span>
          </div>
        </div>

        {/* Tree level connector line */}
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #cbd5e1 20%, #cbd5e1 80%, transparent)", width: "60%", margin: "0 auto 12px" }}></div>

        {/* Managers list */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
          {managers.map((m: any) => (
            <div 
              key={m.id} 
              style={{ 
                flex: "1", 
                minWidth: "220px", 
                background: "#ffffff", 
                borderRadius: "14px", 
                padding: "14px", 
                border: "1px solid #e2e8f0", 
                borderLeft: "5px solid #2563eb",
                boxShadow: "0 10px 20px -8px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.03), inset 0 1px 1px 0 rgba(255,255,255,1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.015)";
                e.currentTarget.style.boxShadow = "0 18px 28px -8px rgba(37, 99, 235, 0.12), 0 8px 12px -4px rgba(37, 99, 235, 0.06)";
                e.currentTarget.style.borderColor = "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 10px 20px -8px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.03), inset 0 1px 1px 0 rgba(255,255,255,1)";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              <div 
                onClick={() => handleEmployeeDrillDown(m)}
                style={{
                  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  textAlign: "center",
                  marginBottom: "12px",
                  cursor: "pointer",
                  boxShadow: "inset 0 1px 0 0 #ffffff"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <span style={{ color: m.status === "active" ? "#10b981" : m.status === "break" ? "#d97706" : "#64748b", fontSize: "0.85rem" }}>●</span>
                  <strong style={{ fontSize: "0.82rem", color: "#1e3a8a" }}>💼 {m.name}</strong>
                </div>
                <div style={{ fontSize: "0.62rem", color: "#64748b", marginTop: "2px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Manager</div>
              </div>

              {/* TLs level */}
              {m.tls && m.tls.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderLeft: "2px solid #cbd5e1", paddingLeft: "14px", marginLeft: "6px", marginTop: "4px" }}>
                  {m.tls.map((t: any) => (
                    <div key={t.id} style={{ position: "relative" }}>
                      {/* Horizontal tree connector branch */}
                      <div style={{ position: "absolute", left: "-16px", top: "18px", width: "14px", height: "2px", background: "#cbd5e1" }}></div>
                      
                      <div 
                        style={{ 
                          background: "#ffffff", 
                          borderRadius: "10px", 
                          padding: "8px 10px", 
                          border: "1px solid #e2e8f0",
                          borderLeft: "4px solid #f97316",
                          boxShadow: "0 4px 10px -4px rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.02)",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px) scale(1.01)";
                          e.currentTarget.style.boxShadow = "0 12px 20px -6px rgba(249, 115, 22, 0.15), 0 4px 8px -3px rgba(249, 115, 22, 0.08)";
                          e.currentTarget.style.borderColor = "#f97316";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0) scale(1)";
                          e.currentTarget.style.boxShadow = "0 4px 10px -4px rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.02)";
                          e.currentTarget.style.borderColor = "#e2e8f0";
                        }}
                      >
                        <div 
                          onClick={() => handleEmployeeDrillDown(t)}
                          style={{ 
                            fontSize: "0.76rem", 
                            color: "#1e293b", 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between",
                            borderBottom: "1px solid #f1f5f9",
                            paddingBottom: "4px",
                            marginBottom: "6px"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <span style={{ color: t.status === "active" ? "#10b981" : t.status === "break" ? "#d97706" : "#64748b", fontSize: "0.75rem" }}>●</span>
                            <strong style={{ color: "#334155" }}>⚡ {t.name}</strong>
                          </div>
                          <span style={{ fontSize: "0.58rem", color: "#f97316", background: "rgba(249, 115, 22, 0.1)", padding: "1px 5px", borderRadius: "10px", fontWeight: 700 }}>TL</span>
                        </div>

                        {/* Recruiters level */}
                        {t.recruiters && t.recruiters.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderLeft: "2px solid #cbd5e1", paddingLeft: "14px", marginLeft: "6px", marginTop: "6px" }}>
                            {t.recruiters.map((r: any) => (
                              <div key={r.id} style={{ position: "relative" }}>
                                {/* Horizontal tree connector branch */}
                                <div style={{ position: "absolute", left: "-16px", top: "14px", width: "14px", height: "2px", background: "#cbd5e1" }}></div>
                                
                                <div 
                                  onClick={() => handleEmployeeDrillDown(r)}
                                  style={{
                                    fontSize: "0.7rem",
                                    color: "#475569",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderLeft: `3px solid ${r.status === "active" ? "#10b981" : r.status === "break" ? "#f59e0b" : "#94a3b8"}`,
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    cursor: "pointer",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                                    transition: "all 0.2s ease"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateX(4px)";
                                    e.currentTarget.style.background = "#f1f5f9";
                                    e.currentTarget.style.borderColor = "#cbd5e1";
                                    e.currentTarget.style.boxShadow = "0 3px 8px -3px rgba(0,0,0,0.08)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateX(0)";
                                    e.currentTarget.style.background = "#f8fafc";
                                    e.currentTarget.style.borderColor = "#e2e8f0";
                                    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.01)";
                                  }}
                                >
                                  <span style={{ color: r.status === "active" ? "#10b981" : r.status === "break" ? "#f59e0b" : "#94a3b8", fontSize: "0.55rem" }}>●</span>
                                  <span style={{ fontWeight: 600 }}>👤 {r.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", color: "#2563eb", background: "#f8fafc" }}>
        <LucideRefreshCw className="animate-spin" size={48} />
        <span style={{ marginLeft: "16px", fontSize: "1.2rem", fontWeight: 800 }}>Initializing Executive Command Console...</span>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100%", padding: "10px 14px", color: "#1e293b", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      


      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        
        {/* SECTION 1: EXECUTIVE OVERVIEW (TOP KPI STRIP) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            
            {/* Workforce Summary Card */}
            <motion.div 
              onClick={handleWorkforceClick}
              whileHover={{ y: -1, scale: 1.005 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #2563eb, #3b82f6)" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Workforce Summary</span>
                <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: "rgba(37, 99, 235, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideUsers color="#2563eb" size={10} /></div>
              </div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#2563eb", marginTop: "4px", marginBottom: "2px", letterSpacing: "-0.5px" }}>
                {monitoring?.kpi?.totalEmployees || 0} <span style={{ fontSize: "0.74rem", color: "#475569", fontWeight: 700 }}>Employees</span>
              </h2>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", borderTop: "1px solid #f1f5f9", paddingTop: "4px", color: "#64748b" }}>
                <span>MGR: <strong style={{ color: "#0f172a" }}>{monitoring?.kpi?.totalManagers || 0}</strong></span>
                <span>TL: <strong style={{ color: "#0f172a" }}>{monitoring?.kpi?.totalTls || 0}</strong></span>
                <span>REC: <strong style={{ color: "#0f172a" }}>{monitoring?.kpi?.totalRecruiters || 0}</strong></span>
              </div>
            </motion.div>

            {/* Live Online Users Card */}
            <motion.div 
              onClick={() => handleOnlineUsersClick()}
              whileHover={{ y: -1, scale: 1.005 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #10b981, #059669)" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Live Activity Log</span>
                <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: "rgba(16, 185, 129, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideActivity color="#10b981" size={10} /></div>
              </div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#10b981", marginTop: "4px", marginBottom: "2px", letterSpacing: "-0.5px" }}>
                {monitoring?.kpi?.currentlyOnline || 0} <span style={{ fontSize: "0.74rem", color: "#475569", fontWeight: 700 }}>Online</span>
              </h2>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", borderTop: "1px solid #f1f5f9", paddingTop: "4px", color: "#64748b" }}>
                <span>Work: <strong style={{ color: "#10b981" }}>{monitoring?.kpi?.currentlyWorking || 0}</strong></span>
                <span>Break: <strong style={{ color: "#d97706" }}>{monitoring?.kpi?.currentlyOnBreak || 0}</strong></span>
                <span>Offline: <strong style={{ color: "#64748b" }}>{monitoring?.kpi?.currentlyOffline || 0}</strong></span>
              </div>
            </motion.div>

            {/* Today's Productivity Score Card */}
            <motion.div 
              onClick={() => handleOnlineUsersClick("active")}
              whileHover={{ y: -1, scale: 1.005 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #f59e0b, #ea580c)" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Productivity Pulse</span>
                <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: "rgba(245, 158, 11, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideTrendingUp color="#d97706" size={10} /></div>
              </div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#d97706", marginTop: "4px", marginBottom: "2px", letterSpacing: "-0.5px" }}>
                {productivityScore}% <span style={{ fontSize: "0.74rem", color: "#475569", fontWeight: 700 }}>Today</span>
              </h2>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", borderTop: "1px solid #f1f5f9", paddingTop: "4px", color: "#64748b" }}>
                <span>Reg: <strong style={{ color: "#0f172a" }}>{monitoring?.kpi?.todayRegistrations || 0}</strong></span>
                <span>Int: <strong style={{ color: "#0f172a" }}>{monitoring?.kpi?.todayInterviews || 0}</strong></span>
                <span>Joined: <strong style={{ color: "#10b981" }}>{monitoring?.kpi?.todayJoinings || 0}</strong></span>
              </div>
            </motion.div>

            {/* Today's Snapshot Card */}
            <motion.div 
              onClick={() => handleOnlineUsersClick()}
              whileHover={{ y: -1, scale: 1.005 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #6366f1, #818cf8)" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Today's Snapshot</span>
                <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: "rgba(99, 102, 241, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideClock color="#6366f1" size={10} /></div>
              </div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#6366f1", marginTop: "4px", marginBottom: "2px", letterSpacing: "-0.5px" }}>
                {monitoring?.kpi?.todayJoinings || 0} <span style={{ fontSize: "0.74rem", color: "#475569", fontWeight: 700 }}>Joined Today</span>
              </h2>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", borderTop: "1px solid #f1f5f9", paddingTop: "4px", color: "#64748b" }}>
                <span>Sourced: <strong style={{ color: "#0f172a" }}>{monitoring?.kpi?.todayRegistrations || 0}</strong></span>
                <span>Interviews: <strong style={{ color: "#0f172a" }}>{monitoring?.kpi?.todayInterviews || 0}</strong></span>
                <span>Selected: <strong style={{ color: "#10b981" }}>{monitoring?.kpi?.todaySelectedToday || reports?.recruitment?.selected || 0}</strong></span>
              </div>
            </motion.div>

        </div>

          {/* SECTION 2: LIVE ORGANIZATION MAP */}
          <DashboardCard
            title="Section 2: Live Corporate Hierarchy Nodes"
            icon={<span style={{ fontSize: "0.9rem" }}>🌐</span>}
            sectionKey="orgTree"
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
          >
            {renderOrgTree()}
          </DashboardCard>

          {/* LIVE TELEMETRY & SCOREBOARD GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {/* SECTION 3: LIVE TEAM STATUS CENTER */}
            <DashboardCard
            title="Section 3: Live desking status telemetry"
            icon={<span style={{ fontSize: "0.85rem" }}>📋</span>}
            sectionKey="deskingTelemetry"
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
            headerRight={
              <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                <input 
                  type="text" 
                  placeholder="Filter name..." 
                  value={teamSearchQuery} 
                  onChange={e => setTeamSearchQuery(e.target.value)}
                  style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 6px", color: "#0f172a", fontSize: "0.72rem", outline: "none", width: "90px" }}
                />
                <select 
                  value={teamRoleFilter} 
                  onChange={e => setTeamRoleFilter(e.target.value)}
                  style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 6px", color: "#0f172a", fontSize: "0.72rem", outline: "none" }}
                >
                  <option value="All">All Roles</option>
                  <option value="manager">Managers</option>
                  <option value="tl">TLs</option>
                  <option value="recruiter">Recruiters</option>
                </select>
                <select 
                  value={teamStatusFilter} 
                  onChange={e => setTeamStatusFilter(e.target.value)}
                  style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 6px", color: "#0f172a", fontSize: "0.72rem", outline: "none" }}
                >
                  <option value="All">All Statuses</option>
                  <option value="active">🟢 Online</option>
                  <option value="break">🟡 Break</option>
                  <option value="offline">⚫ Offline</option>
                </select>
              </div>
            }
          >
            <div style={{ overflowY: "auto", maxHeight: "180px", border: "1px solid #f1f5f9", borderRadius: "4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.72rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 }}>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem" }}>Employee</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem" }}>Role</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem" }}>Login</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem" }}>Status</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem" }}>Working Hrs</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem" }}>Break Time</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem" }}>Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeamList.map((u: any) => {
                    const status = u.status === "active" ? "active" : u.status === "break" ? "break" : "offline";
                    const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                      active: { bg: "#ecfdf5", text: "#10b981", border: "#a7f3d0" },
                      break: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
                      offline: { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" }
                    };
                    const sColor = statusColors[status];
                    return (
                      <tr 
                        key={u.id} 
                        onClick={() => handleEmployeeDrillDown(u)}
                        style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "5px 8px" }}><strong style={{ color: "#1e293b" }}>{u.name}</strong></td>
                        <td style={{ padding: "5px 8px" }}><span style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", padding: "1px 4px", borderRadius: "3px", fontSize: "0.65rem", fontWeight: 700 }}>{u.role?.toUpperCase()}</span></td>
                        <td style={{ padding: "5px 8px", color: "#475569" }}>{u.checkInTime || "N/A"}</td>
                        <td style={{ padding: "5px 8px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "1px 5px", borderRadius: "10px", background: sColor.bg, color: sColor.text, border: `1px solid ${sColor.border}`, fontSize: "0.65rem", fontWeight: 700 }}>
                            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: sColor.text }}></span>
                            {status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "5px 8px", color: "#475569" }}>{u.workingHours || "0.0 hrs"}</td>
                        <td style={{ padding: "5px 8px", color: "#475569" }}>{u.breakTime || "0m"}</td>
                        <td style={{ padding: "5px 8px", color: "#1e293b" }}><strong style={{ color: "#2563eb" }}>{u.tasks?.activeTasks || 0} active</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {/* SECTION 4: COMPANY PERFORMANCE SCOREBOARD */}
          <DashboardCard
            title="Section 4: Gamified Performance Scoreboard"
            icon={<span style={{ fontSize: "0.85rem" }}>🏆</span>}
            sectionKey="performanceScoreboard"
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
            headerRight={
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", background: "#e2e8f0", borderRadius: "4px", padding: "1px" }}>
                  {["recruiter", "tl", "manager"].map((roleOpt) => (
                    <button
                      key={roleOpt}
                      onClick={() => setScoreboardTab(roleOpt as any)}
                      style={{
                        background: scoreboardTab === roleOpt ? "#ffffff" : "transparent",
                        color: scoreboardTab === roleOpt ? "#0f172a" : "#475569",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: scoreboardTab === roleOpt ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
                      }}
                    >
                      {roleOpt.toUpperCase()}
                    </button>
                  ))}
                </div>
                <select 
                  value={scoreboardTimeFilter} 
                  onChange={e => setScoreboardTimeFilter(e.target.value as any)}
                  style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 6px", color: "#0f172a", fontSize: "0.72rem", outline: "none" }}
                >
                  <option value="today">Today</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            }
          >
            <div style={{ overflowY: "auto", maxHeight: "180px", border: "1px solid #f1f5f9", borderRadius: "4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.72rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 }}>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem" }}>Rank</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem" }}>Employee</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem", textAlign: "center" }}>Reg</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem", textAlign: "center" }}>Sel</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem", textAlign: "center" }}>Join</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem", textAlign: "center" }}>Leads</th>
                    <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, fontSize: "0.72rem", textAlign: "center" }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(reports?.leaderboards?.[scoreboardTab === "recruiter" ? "recruiters" : scoreboardTab === "tl" ? "tls" : "managers"] || []).slice(0, 5).map((u: any, idx: number) => {
                    const rank = idx + 1;
                    let rankBg = "#f1f5f9";
                    let rankColor = "#475569";
                    let rankBorder = "#cbd5e1";
                    if (rank === 1) {
                      rankBg = "#fef3c7"; rankColor = "#b45309"; rankBorder = "#fde68a";
                    } else if (rank === 2) {
                      rankBg = "#f1f5f9"; rankColor = "#475569"; rankBorder = "#e2e8f0";
                    } else if (rank === 3) {
                      rankBg = "#ffedd5"; rankColor = "#ca8a04"; rankBorder = "#fed7aa";
                    }
                    return (
                      <tr 
                        key={u.id}
                        onClick={() => handleEmployeeDrillDown(u)}
                        style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "5px 8px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: rankBg, color: rankColor, border: `1px solid ${rankBorder}`, fontWeight: 800, fontSize: "0.65rem" }}>
                            {rank}
                          </span>
                        </td>
                        <td style={{ padding: "5px 8px" }}><strong style={{ color: "#1e293b" }}>{u.name}</strong></td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#475569" }}>{u.registrations || 0}</td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#475569" }}>{u.selected || 0}</td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#475569" }}>{u.joined || 0}</td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#475569" }}>{u.leadsGenerated || 0}</td>
                        <td style={{ padding: "5px 8px", textAlign: "center", fontWeight: 800, color: "#2563eb" }}>{u.performanceScore}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>

        {/* SECTION 5 & 6: PIPELINE ANALYTICS */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
          
          {/* Section 5: Funnel Pipeline */}
          <DashboardCard
            title="Section 5: Dynamic Executive Funnel Pipeline"
            icon={<span style={{ fontSize: "0.9rem" }}>📊</span>}
            sectionKey="funnelPipeline"
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {[
                { stage: "Registered", count: reports?.recruitment?.regCandidates || 0, color: "#4f46e5", p: "100%", desc: "Initial Entry" },
                { stage: "Connected", count: reports?.recruitment?.connected || 0, color: "#2563eb", p: `${reports?.recruitment?.connectedToInterested || 0}%`, desc: "First Contact" },
                { stage: "Interested", count: reports?.recruitment?.interested || 0, color: "#0d9488", p: `${reports?.recruitment?.interestedToInterview || 0}%`, desc: "Lead Warmup" },
                { stage: "Interviews", count: reports?.recruitment?.goForInterview || 0, color: "#b45309", p: `${reports?.recruitment?.interviewToSelected || 0}%`, desc: "Evaluation" },
                { stage: "Selected", count: reports?.recruitment?.selected || 0, color: "#db2777", p: `${reports?.recruitment?.selectedToJoined || 0}%`, desc: "Offer Issued" },
                { stage: "Joined", count: reports?.recruitment?.joined || 0, color: "#16a34a", p: `${reports?.recruitment?.overallConversion || 0}%`, desc: "Placed" }
              ].map((step, idx) => (
                <motion.div 
                  key={idx}
                  onClick={() => filterCandidatesByStatus(step.stage.toLowerCase())}
                  whileHover={{ y: -1, scale: 1.005 }}
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "6px",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: step.color }} />
                  <span style={{ fontSize: "0.68rem", color: "#64748b", display: "block", fontWeight: 700, textTransform: "uppercase" }}>{step.stage}</span>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: step.color, margin: "2px 0", letterSpacing: "-0.5px" }}>{step.count}</h2>
                  <div style={{ fontSize: "0.58rem", color: "#94a3b8", fontWeight: 600, marginBottom: "2px" }}>{step.desc}</div>
                  <span style={{ fontSize: "0.65rem", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "1px 4px", borderRadius: "6px", color: "#334155", fontWeight: 700 }}>Conv: {step.p}</span>
                </motion.div>
              ))}
            </div>
          </DashboardCard>

          {/* Section 6: Candidate Status */}
          <DashboardCard
            title="Section 6: Candidate Status Nodes"
            icon={<span style={{ fontSize: "0.9rem" }}>📁</span>}
            sectionKey="candidateStatus"
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px" }}>
              {[
                { label: "Connected", status: "connected", val: reports?.recruitment?.connected || 0 },
                { label: "Not Connected", status: "notconnected", val: reports?.recruitment?.notConnected || 0 },
                { label: "Interested", status: "interested", val: reports?.recruitment?.interested || 0 },
                { label: "Not Interested", status: "notinterested", val: reports?.recruitment?.notInterested || 0 },
                { label: "Call Not Pick", status: "callnotpick", val: reports?.recruitment?.callNotPick || 0 },
                { label: "Scheduled", status: "scheduled", val: reports?.recruitment?.goForInterview || 0 },
                { label: "Selected", status: "selected", val: reports?.recruitment?.selected || 0 },
                { label: "Rejected", status: "rejected", val: reports?.recruitment?.rejected || 0 },
                { label: "Joining Process", status: "processtojoining", val: reports?.recruitment?.processToJoining || 0 },
                { label: "Joined", status: "joined", val: reports?.recruitment?.joined || 0 }
              ].map((c, idx) => (
                <div 
                  key={idx}
                  onClick={() => filterCandidatesByStatus(c.status)}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "6px",
                    borderRadius: "6px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f1f5f9";
                    e.currentTarget.style.borderColor = "#cbd5e1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  <span style={{ fontSize: "0.68rem", color: "#64748b", display: "block", fontWeight: 600 }}>{c.label}</span>
                  <strong style={{ fontSize: "0.95rem", color: "#1e293b", marginTop: "2px", display: "block" }}>{c.val}</strong>
                </div>
              ))}
            </div>
          </DashboardCard>

        </div>

          {/* SECTION 7 & 8: LIVE CLIENT & JOB ANALYTICS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            
            {/* Section 7: Live Client Analytics */}
            <DashboardCard
              title="Section 7: Live Client Leaderboard"
              icon={<span style={{ fontSize: "0.9rem" }}>💼</span>}
              sectionKey="clientAnalytics"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: "0.78rem", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700 }}>Client</th>
                      <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, textAlign: "center" }}>Mapped</th>
                      <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, textAlign: "center" }}>Joined</th>
                      <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, textAlign: "center" }}>Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reports?.clients || []).slice(0, 5).map((cl: any, idx: number) => (
                      <tr 
                        key={idx} 
                        onClick={() => handleClientClick(cl)}
                        style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "5px 8px" }}><strong style={{ color: "#1e293b" }}>{cl.clientName}</strong></td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#475569" }}>{cl.totalCandidates || 0}</td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#475569" }}>{cl.joined || 0}</td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#2563eb", fontWeight: 700 }}>{cl.conversionRate || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>

            {/* Section 8: Live Job Analytics */}
            <DashboardCard
              title="Section 8: Top Job Openings Table"
              icon={<span style={{ fontSize: "0.9rem" }}>💼</span>}
              sectionKey="jobAnalytics"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: "0.78rem", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700 }}>Job Designation</th>
                      <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, textAlign: "center" }}>Interested</th>
                      <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, textAlign: "center" }}>Selected</th>
                      <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, textAlign: "center" }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reports?.jobs || []).slice(0, 5).map((jb: any, idx: number) => (
                      <tr 
                        key={idx} 
                        onClick={() => handleJobClick(jb)}
                        style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "5px 8px" }}><strong style={{ color: "#1e293b" }}>{jb.jobTitle}</strong></td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#475569" }}>{jb.interested || 0}</td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#475569" }}>{jb.selected || 0}</td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#10b981", fontWeight: 700 }}>{jb.joined || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>

          </div>

          {/* SECTION 9 & 10: SOURCING & LEAD DATA ANALYTICS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            
            {/* Section 9: Sourcing Analytics */}
            <DashboardCard
              title="Section 9: Sourcing Platform Aggregation"
              icon={<span style={{ fontSize: "0.9rem" }}>📊</span>}
              sectionKey="sourcingPlatform"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {(reports?.sources || []).map((src: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => handleSourceClick(src.sourceName)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "5px 8px", borderRadius: "5px", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                  >
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#1e293b" }}>{src.sourceName}</span>
                    <div style={{ display: "flex", gap: "6px", fontSize: "0.68rem", color: "#64748b" }}>
                      <span>Sourced: <strong style={{ color: "#1e293b" }}>{src.candidatesGenerated || 0}</strong></span>
                      <span style={{ color: "#2563eb", fontWeight: 700 }}>Qual: {src.sourceQualityScore || 80}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* Section 10: Lead Data Analytics */}
            <DashboardCard
              title="Section 10: Lead Categories & Verticals"
              icon={<span style={{ fontSize: "0.9rem" }}>🎯</span>}
              sectionKey="leadCategories"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {(reports?.leads?.categoryBreakdown || []).slice(0, 6).map((cat: any, idx: number) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      const list = candidates.filter((c: any) => c.dataType === "lead" && (c.sector === cat.category || c.remarks === cat.category));
                      setDrillDown({
                        title: `Leads Sector Focus: ${cat.category}`,
                        description: `Available active lead profiles mapped inside the ${cat.category} industry.`,
                        columns: ["Lead Name", "Organization", "Acquisition Source", "Conversion Value"],
                        rows: list.map((l: any) => [
                          l.name,
                          l.clientName || "N/A",
                          l.sourcingBy || "Vendor Upload",
                          l.status || "Uncontacted"
                        ])
                      });
                    }}
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "5px 6px", borderRadius: "5px", textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                  >
                    <span style={{ fontSize: "0.68rem", color: "#64748b", display: "block" }}>{cat.category}</span>
                    <strong style={{ fontSize: "0.82rem", color: "#2563eb", display: "block", marginTop: "1px" }}>{cat.count} Leads</strong>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* SECTION 11 & 12: ATTENDANCE & TASK CONTROL */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            
            {/* Section 11: Attendance Telemetry */}
            <DashboardCard
              title="Section 11: Attendance Telemetry"
              icon={<span style={{ fontSize: "0.9rem" }}>📅</span>}
              sectionKey="attendanceTelemetry"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
              headerRight={
                <span onClick={handleLateLoginsClick} style={{ fontSize: "0.72rem", color: "#2563eb", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }}>
                  Late ({reports?.summary?.lateLoginCount || 0})
                </span>
              }
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <div onClick={handleLateLoginsClick} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 8px", borderRadius: "5px", cursor: "pointer" }}>
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Avg Hours</span>
                  <h4 style={{ margin: "1px 0 0 0", color: "#0f172a", fontSize: "0.88rem", fontWeight: 800 }}>{reports?.summary?.avgWorkingHours || "8.5"} hrs</h4>
                </div>
                <div onClick={handleOvertimeClick} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 8px", borderRadius: "5px", cursor: "pointer" }}>
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Compliance</span>
                  <h4 style={{ margin: "1px 0 0 0", color: "#10b981", fontSize: "0.88rem", fontWeight: 800 }}>92%</h4>
                </div>
              </div>
            </DashboardCard>

            {/* Section 12: Task Control Center */}
            <DashboardCard
              title="Section 12: Corporate Task Control"
              icon={<span style={{ fontSize: "0.9rem" }}>📋</span>}
              sectionKey="taskControl"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
              headerRight={
                <span onClick={() => handleTasksClick("overdue")} style={{ fontSize: "0.75rem", color: "#ec4899", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }}>
                  Overdue ({reports?.tasks?.delayedTasks || 0})
                </span>
              }
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                <div onClick={() => handleTasksClick("pending")} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px", borderRadius: "6px", textAlign: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Pending</span>
                  <strong style={{ fontSize: "0.92rem", display: "block", color: "#d97706", marginTop: "2px" }}>{reports?.tasks?.pendingTasks || 0}</strong>
                </div>
                <div onClick={() => handleTasksClick("completed")} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px", borderRadius: "6px", textAlign: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Done</span>
                  <strong style={{ fontSize: "0.92rem", display: "block", color: "#10b981", marginTop: "2px" }}>{reports?.tasks?.completedTasks || 0}</strong>
                </div>
                <div onClick={() => handleTasksClick("all")} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px", borderRadius: "6px", textAlign: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Total</span>
                  <strong style={{ fontSize: "0.92rem", display: "block", color: "#1e293b", marginTop: "2px" }}>{reports?.tasks?.assignedTasks || 0}</strong>
                </div>
              </div>
            </DashboardCard>

          </div>

          {/* INCENTIVES, GIFTS & FEEDBACKS TRIPLE GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            
            {/* Section 14: Incentive Analytics */}
            <DashboardCard
              title="Section 14: Live Incentive Board"
              icon={<span style={{ fontSize: "0.85rem" }}>💰</span>}
              sectionKey="incentiveBoard"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: "0.72rem", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700 }}>Recruiter</th>
                      <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, textAlign: "center" }}>Joinings</th>
                      <th style={{ padding: "5px 8px", color: "#475569", fontWeight: 700, textAlign: "right" }}>Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reports?.incentives?.incentiveEarners || []).slice(0, 4).map((earn: any, idx: number) => (
                      <tr 
                        key={idx}
                        onClick={() => handleEmployeeDrillDown({ id: earn.recruiterId, name: earn.recruiterName, role: earn.role })}
                        style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "5px 8px" }}><strong style={{ color: "#1e293b" }}>{earn.recruiterName}</strong></td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#475569" }}>{earn.joinedCount || 0}</td>
                        <td style={{ padding: "5px 8px", textAlign: "right", color: "#16a34a", fontWeight: 700 }}>₹{earn.amountEarned || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>

            {/* Section 15: Gift Analytics */}
            <DashboardCard
              title="Section 15: Corporate Gift Analytics"
              icon={<span style={{ fontSize: "0.85rem" }}>🎁</span>}
              sectionKey="giftAnalytics"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
              headerRight={
                <span onClick={handleGiftsDrillDown} style={{ fontSize: "0.72rem", color: "#2563eb", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }}>
                  Logs
                </span>
              }
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <div onClick={handleGiftsDrillDown} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px", borderRadius: "4px", cursor: "pointer", textAlign: "center" }}>
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Disbursed</span>
                  <h4 style={{ margin: "1px 0 0 0", color: "#2563eb", fontSize: "0.85rem", fontWeight: 800 }}>{giftsList.length} Items</h4>
                </div>
                <div onClick={handleGiftsDrillDown} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px", borderRadius: "4px", cursor: "pointer", textAlign: "center" }}>
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Total Worth</span>
                  <h4 style={{ margin: "1px 0 0 0", color: "#16a34a", fontSize: "0.85rem", fontWeight: 800 }}>₹{giftsList.reduce((acc, curr) => acc + (curr.value || 0), 0)}</h4>
                </div>
              </div>
            </DashboardCard>

            {/* Section 16: Daily Feedbacks */}
            <DashboardCard
              title="Section 16: Recruiter Daily Feedbacks"
              icon={<span style={{ fontSize: "0.85rem" }}>💬</span>}
              sectionKey="feedbackPolicy"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
              headerRight={
                <span onClick={() => handleFeedbackClick("all")} style={{ fontSize: "0.72rem", color: "#2563eb", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }}>
                  Total ({feedbacks.length})
                </span>
              }
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px" }}>
                <div onClick={() => handleFeedbackClick("Complaint")} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "5px 4px", borderRadius: "4px", textAlign: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Complaint</span>
                  <strong style={{ fontSize: "0.85rem", display: "block", color: "#dc2626", marginTop: "1px" }}>{feedbacks.filter(f => f.feedbackType === "Complaint").length}</strong>
                </div>
                <div onClick={() => handleFeedbackClick("Appreciation")} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "5px 4px", borderRadius: "4px", textAlign: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Appreciate</span>
                  <strong style={{ fontSize: "0.85rem", display: "block", color: "#16a34a", marginTop: "1px" }}>{feedbacks.filter(f => f.feedbackType === "Appreciation").length}</strong>
                </div>
                <div onClick={() => handleFeedbackClick("Suggestion")} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "5px 4px", borderRadius: "4px", textAlign: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Suggest</span>
                  <strong style={{ fontSize: "0.85rem", display: "block", color: "#2563eb", marginTop: "1px" }}>{feedbacks.filter(f => f.feedbackType === "Suggestion").length}</strong>
                </div>
              </div>
            </DashboardCard>

          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "12px" }}>
            
            {/* SECTION 18: SYSTEM USAGE ANALYTICS */}
            <DashboardCard
              title="Section 18: System Usage Analytics & Telemetry"
              icon={<span style={{ fontSize: "0.85rem" }}>🖥</span>}
              sectionKey="systemUsage"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "5px" }}>
                {[
                  { title: "Candidates", val: candidates.length },
                  { title: "Active Jobs", val: reports?.jobs?.length || 0 },
                  { title: "Clients Map", val: reports?.clients?.length || 0 },
                  { title: "Vendors", val: reports?.vendors?.length || 0 },
                  { title: "Task Logs", val: reports?.tasks?.assignedTasks || 0 },
                  { title: "Policies", val: policies.length }
                ].map((c, idx) => (
                  <div 
                    key={idx} 
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "5px 4px", borderRadius: "4px", textAlign: "center" }}
                  >
                    <span style={{ fontSize: "0.68rem", color: "#64748b", display: "block", fontWeight: 600 }}>{c.title}</span>
                    <strong style={{ fontSize: "0.85rem", color: "#1e293b", marginTop: "1px", display: "block" }}>{c.val}</strong>
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* SECTION 19: BUSINESS GROWTH TRENDS */}
            <DashboardCard
              title="Section 19: Monthly Business Growth Trends"
              icon={<span style={{ fontSize: "0.85rem" }}>📈</span>}
              sectionKey="growthTrends"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
              headerRight={
                <div style={{ display: "flex", gap: "6px", fontSize: "0.68rem" }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "1px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}></div>
                    <span style={{ color: "#475569" }}>Reg</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "1px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}></div>
                    <span style={{ color: "#475569" }}>Join</span>
                  </div>
                </div>
              }
            >
              {/* Grid container with background lines */}
              <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "5px", padding: "2px 0" }}>
                {/* Vertical Grid Lines */}
                <div style={{ position: "absolute", top: 0, bottom: 0, left: "55px", right: "55px", display: "flex", justifyContent: "space-between", pointerEvents: "none" }}>
                  {[0, 25, 50, 75, 100].map((val) => (
                    <div key={val} style={{ width: "1px", height: "100%", background: "rgba(0,0,0,0.03)", position: "relative" }}>
                      <span style={{ position: "absolute", bottom: "-10px", transform: "translateX(-50%)", fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>{val}%</span>
                    </div>
                  ))}
                </div>

                {(reports?.trends || []).map((t: any, idx: number) => {
                  const maxReg = Math.max(...(reports?.trends || []).map((x: any) => x.registrations || 1));
                  const maxJoin = Math.max(...(reports?.trends || []).map((x: any) => x.joinings || 1));
                  const maxVal = Math.max(maxReg, maxJoin, 1);

                  const regPercent = Math.max(5, Math.min(100, ((t.registrations || 0) / maxVal) * 100));
                  const joinPercent = Math.max(5, Math.min(100, ((t.joinings || 0) / maxVal) * 100));

                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "5px", zIndex: 1 }}>
                      {/* Month Label */}
                      <span style={{ width: "45px", fontSize: "0.72rem", color: "#1e293b", fontWeight: 700 }}>{t.date}</span>
                      
                      {/* Bars Container */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1px" }}>
                        {/* Registration Bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <div style={{ flex: 1, height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${regPercent}%` }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.03 }}
                              style={{ height: "100%", background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)", borderRadius: "2px" }}
                            />
                          </div>
                          <span style={{ width: "14px", fontSize: "0.68rem", color: "#2563eb", fontWeight: 700, textAlign: "right" }}>{t.registrations}</span>
                        </div>

                        {/* Joining Bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <div style={{ flex: 1, height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${joinPercent}%` }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.03 + 0.01 }}
                              style={{ height: "100%", background: "linear-gradient(90deg, #10b981 0%, #059669 100%)", borderRadius: "2px" }}
                            />
                          </div>
                          <span style={{ width: "14px", fontSize: "0.68rem", color: "#10b981", fontWeight: 700, textAlign: "right" }}>{t.joinings}</span>
                        </div>
                      </div>
                      
                      {/* Growth Indicator */}
                      <div style={{ width: "45px", display: "flex", flexDirection: "column", alignItems: "flex-end", borderLeft: "1px solid #e2e8f0", paddingLeft: "4px" }}>
                        <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 600 }}>Conv</span>
                        <strong style={{ fontSize: "0.72rem", color: "#1e293b", fontWeight: 800 }}>
                          {t.registrations > 0 ? `${Math.round((t.joinings / t.registrations) * 100)}%` : "0%"}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DashboardCard>

            {/* SECTION 20: AI EXECUTIVE INSIGHTS */}
            <DashboardCard
              title="Section 20: AI Telemetry Insights"
              icon={<span style={{ fontSize: "0.85rem" }}>🧠</span>}
              sectionKey="aiInsights"
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {(reports?.insights || []).map((ins: any, idx: number) => (
                  <div 
                    key={idx}
                    style={{
                      background: ins.type === "warning" || ins.type === "danger" ? "#fef2f2" : "#f0fdf4",
                      borderLeft: `2px solid ${ins.type === "warning" || ins.type === "danger" ? "#ef4444" : "#22c55e"}`,
                      padding: "6px 8px",
                      borderRadius: "0 4px 4px 0"
                    }}
                  >
                    <strong style={{ fontSize: "0.72rem", display: "block", color: ins.type === "warning" || ins.type === "danger" ? "#b91c1c" : "#15803d" }}>
                      {ins.title}
                    </strong>
                    <span style={{ fontSize: "0.68rem", color: ins.type === "warning" || ins.type === "danger" ? "#7f1d1d" : "#14532d", marginTop: "1px", display: "block", lineHeight: "1.2" }}>
                      {ins.desc}
                    </span>
                  </div>
                ))}
              </div>
            </DashboardCard>

          </div>

        </div>

      {/* Dynamic Drill Down Modal Popup */}
      {drillDown && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "850px",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            color: "#1e293b",
            fontFamily: "'Outfit', 'Inter', sans-serif"
          }}>
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #cbd5e1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f8fafc"
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>
                  {drillDown.title}
                </h2>
                {drillDown.description && (
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                    {drillDown.description}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setDrillDown(null)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  color: "#475569",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
              >
                Close Dialog
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              {drillDown.rows.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                  No records match this drill-down context.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>
                        {drillDown.columns.map((col: string, idx: number) => (
                          <th key={idx} style={{ padding: "10px 14px", fontWeight: 700, color: "#475569" }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {drillDown.rows.map((row: any[], rowIdx: number) => (
                        <tr 
                          key={rowIdx} 
                          style={{ 
                            borderBottom: "1px solid #e2e8f0",
                            background: rowIdx % 2 === 0 ? "#f8fafc" : "transparent"
                          }}
                        >
                          {row.map((val: any, cellIdx: number) => (
                            <td key={cellIdx} style={{ padding: "10px 14px", color: "#1e293b" }}>
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const PlaceholderView = ({ title, icon, desc }: any) => (
  <div className="placeholder-view glass-card flex-center" style={{ height: "calc(100vh - 120px)" }}>
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="placeholder-inner text-center"
    >
      <div className="placeholder-icon glass flex-center" style={{ width: "100px", height: "100px", margin: "0 auto 20px", color: "#1e293b", borderRadius: "30px" }}>
        {icon}
      </div>
      <h1 style={{ fontSize: "2rem", marginBottom: "10px", color: "#1e293b" }}>{title}</h1>
      <p style={{ color: "#64748b", maxWidth: "450px", margin: "0 auto", fontSize: "1.1rem" }}>{desc}</p>
      
      <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "center" }}>
        <button className="btn-primary" style={{ background: "#1e293b" }}>Authorize Protocol</button>
        <button className="btn-secondary glass" style={{ color: "#1e293b" }}>View Logs</button>
      </div>
    </motion.div>
  </div>
);
