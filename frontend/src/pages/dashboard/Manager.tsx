import { useState, useEffect } from "react";
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
  LucideClock,
  LucideGift,
  LucideBanknote,
  LucideFileText,
  LucideCheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TeamManagement from "@/components/dashboard/TeamManagement";
import TaskAssignment from "@/components/dashboard/TaskAssignment";
import Clients from "@/components/dashboard/Clients";
import Jobs from "@/components/dashboard/Jobs";
import SourcingHub from "@/components/dashboard/SourcingHub";
import MyToDoList from "@/components/dashboard/MyToDoList";
import MyVendors from "@/components/dashboard/MyVendors";
import MyAttendance from "@/components/dashboard/MyAttendance";
import ManagerLeadIntelligence from "@/components/dashboard/ManagerLeadIntelligence";
import ManagerAnnouncements from "@/components/dashboard/ManagerAnnouncements";
import ManagerCandidateDataCenter from "@/components/dashboard/ManagerCandidateDataCenter";
import ManagerGiftsCenter from "@/components/dashboard/ManagerGiftsCenter";
import ManagerReportsCenter from "@/components/dashboard/ManagerReportsCenter";
import ManagerIncentiveHub from "@/components/dashboard/ManagerIncentiveHub";
import ManagerDashboardHome from "@/components/dashboard/ManagerDashboardHome";
import MyPerformance from "@/components/dashboard/MyPerformance";
import CandidateReverts from "../../components/dashboard/CandidateReverts";
import { ReminderSystem } from "./Recruiter";
import ProfileView from "@/components/dashboard/ProfileView";
import AnnouncementPopupSystem from "@/components/dashboard/AnnouncementPopupSystem";
import SupervisorFeedbackTab from "@/components/dashboard/SupervisorFeedbackTab";
import SupervisorPolicyTab from "@/components/dashboard/SupervisorPolicyTab";
import "@/styles/Dashboard.css";
import MeetingDashboard from "@/components/dashboard/MeetingDashboard";

export default function ManagerDashboard() {
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
      } else {
        throw new Error("API failed");
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      const active = localStorage.getItem("crm_active_user") || localStorage.getItem("givyansh_active_user");
      if (active) {
        try {
          setUserProfile(JSON.parse(active));
        } catch (e) {
          console.error("Failed to parse active user JSON", e);
        }
      }
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
      case "dashboard": return <ManagerDashboardHome userProfile={userProfile} />;
      case "team": return <TeamManagement role="manager" />;
      case "tasks": return <TaskAssignment role="manager" />;
      case "clients": return <Clients role="manager" />;
      case "jobs": return <Jobs role="manager" />;
      case "sourcing": return <SourcingHub role="manager" />;
      case "vendors": return <MyVendors currentUser={userProfile} candidates={candidates} />;
      case "reports": return <ManagerReportsCenter />;
      case "inbox": return <PlaceholderView title="Manager Inbox" icon={<LucideMail size={40} />} desc="High-level stakeholders and corporate communication." />;
      case "leads": return <ManagerLeadIntelligence />;
      case "gifts": return <ManagerGiftsCenter />;
      case "announcements": return <ManagerAnnouncements />;
      case "candidate-data": return <ManagerCandidateDataCenter />;
      case "attendance": return <MyAttendance userId={userProfile?.id} />;
      case "performance": return <MyPerformance candidates={candidates} currentUser={userProfile} />;
      case "incentive": return <ManagerIncentiveHub />;
      case "todo": return <MyToDoList />;
      case "policy": return <SupervisorPolicyTab role="manager" currentUser={userProfile} />;
      case "feedback": return <SupervisorFeedbackTab role="manager" currentUser={userProfile} />;
      case "reverts": return <CandidateReverts candidates={candidates} currentUser={userProfile} onRefresh={fetchCandidates} role="manager" />;
      case "profile": return <ProfileView role="manager" userId={userProfile?.id} />;
      case "meetings": return <MeetingDashboard role="manager" currentUser={userProfile} />;
      default: return <DashboardHome shift={userProfile?.shift} />;
    }
  };

  return (
    <AdminLayout 
      role="manager" 
      userName={userProfile?.name || "Loading..."} 
      activeTab={tab}
      onTabChange={(id) => navigate(`/dashboard/manager/${id}`)}
    >
      <ReminderSystem candidates={candidates} onRefresh={fetchCandidates} />
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          style={{ height: "100%" }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      <AnnouncementPopupSystem />
    </AdminLayout>
  );
}

const EmployeeShiftCard = ({ shift }: { shift: any }) => {
  if (!shift) return null;

  // Calculate Running Status
  const getStatusLabel = () => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = shift.startTime.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const [eh, em] = shift.endTime.split(":").map(Number);
    const endMins = eh * 60 + em;

    const isRunning = endMins < startMins 
      ? (currentMins >= startMins || currentMins <= endMins)
      : (currentMins >= startMins && currentMins <= endMins);

    return isRunning ? "Active (Running Now)" : "Inactive / Outside Window";
  };

  const getEarlyLoginTime = () => {
    const [sh, sm] = shift.startTime.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const buffer = shift.earlyLoginAllowed !== undefined ? shift.earlyLoginAllowed : 60;
    const targetMins = (startMins - buffer + 1440) % 1440;
    const h = Math.floor(targetMins / 60);
    const m = targetMins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const getLateLogOutTime = () => {
    const [eh, em] = shift.endTime.split(":").map(Number);
    const endMins = eh * 60 + em;
    const buffer = shift.postShiftAllowed !== undefined ? shift.postShiftAllowed : 120;
    const targetMins = (endMins + buffer) % 1440;
    const h = Math.floor(targetMins / 60);
    const m = targetMins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card" style={{ 
      padding: "20px 24px", 
      borderRadius: "24px", 
      border: "1.5px solid #e0f2fe", 
      background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)", 
      marginBottom: "24px",
      boxShadow: "0 10px 25px -15px rgba(37,99,235,0.08)",
      position: "relative"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <span style={{ fontSize: "0.65rem", background: "#dbeafe", color: "#2563eb", padding: "4px 8px", borderRadius: "6px", fontWeight: 800, textTransform: "uppercase" }}>Workforce Timing Allocation</span>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 950, margin: "6px 0 2px", color: "#0f172a", letterSpacing: "-0.5px" }}>{shift.name}</h2>
          <span style={{ fontSize: "0.8rem", color: getStatusLabel().includes("Active") ? "#16a34a" : "#64748b", fontWeight: 700 }}>
             ● {getStatusLabel()}
          </span>
        </div>
        <div style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb", width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <LucideClock size={20} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
         <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>SHIFT HOUR WINDOW</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#1e293b", marginTop: "2px", display: "block" }}>{shift.startTime} - {shift.endTime}</span>
         </div>
         <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>LUNCH BREAK</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#0369a1", marginTop: "2px", display: "block" }}>{shift.lunchStartTime || "N/A"} - {shift.lunchEndTime || "N/A"}</span>
         </div>
         <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>ALLOWED LOGIN ENTRY</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#16a34a", marginTop: "2px", display: "block" }}>After {getEarlyLoginTime()}</span>
         </div>
         <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>FORCE AUTO-LOGOUT</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#ef4444", marginTop: "2px", display: "block" }}>At {getLateLogOutTime()}</span>
         </div>
      </div>
    </div>
  );
};

const DashboardHome = ({ shift }: { shift: any }) => (
  <div className="dashboard-home p-large">
    {/* Shift card removed from main dashboard and moved to My Attendance tab */}
    <div className="dash-header mb-large flex-between">
       <div>
         <h1 style={{ fontSize: "2.2rem", fontWeight: 900 }}>Managerial Command Center</h1>
         <p style={{ color: "#64748b" }}>Strategy, performance, and talent velocity oversight.</p>
       </div>
       <div className="dash-actions flex gap-small">
          <button className="btn-primary glass"><LucideRocket size={18} /> Global Target</button>
          <button className="btn-primary"><LucidePlus size={18} /> Add Strategic Job</button>
       </div>
    </div>

    <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
       <div className="stat-card glass-card" style={{ borderLeft: "4px solid #6366f1" }}>
          <div className="stat-icon" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}><LucideUsers size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Total Professional Nodes</span>
             <h2 className="stat-value">52</h2>
             <span className="stat-delta pos">4 TLs Reporting</span>
          </div>
       </div>
       <div className="stat-card glass-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}><LucideTrendingUp size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Unit Efficiency</span>
             <h2 className="stat-value">84.2%</h2>
             <span className="stat-delta pos">+5% vs Last Mo</span>
          </div>
       </div>
       <div className="stat-card glass-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}><LucideBriefcase size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Active Mandates</span>
             <h2 className="stat-value">128</h2>
             <span className="stat-delta">15 Critical Clients</span>
          </div>
       </div>
       <div className="stat-card glass-card" style={{ borderLeft: "4px solid #ec4899" }}>
          <div className="stat-icon" style={{ background: "rgba(236, 72, 153, 0.1)", color: "#ec4899" }}><LucideGift size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Bonus Disbursed</span>
             <h2 className="stat-value">₹4.2M</h2>
             <span className="stat-delta pos">Cycle Complete</span>
          </div>
       </div>
    </div>

    <div className="grid-2-1 mt-large" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
       <div className="glass-card table-section">
          <div className="card-header flex-between p-medium" style={{ borderBottom: "1px solid #f1f5f9" }}>
             <h3 style={{ fontWeight: 800 }}>Unit Leader Pulse</h3>
             <button className="btn-text" style={{ color: "#2563eb", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Analytics</button>
          </div>
          <div className="activity-list p-medium">
             {[
               { user: "Aryan Singh", role: "Team Lead - IT", time: "Connected", status: "Target Hit" },
               { user: "Priya Sharma", role: "Team Lead - BPO", time: "Away", status: "On Track" },
               { user: "Rahul Verma", role: "Team Lead - Sales", time: "Offline", status: "Urgent Revise" },
             ].map((item, i) => (
               <div key={i} className="activity-item flex-between p-small mb-small glass" style={{ borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                  <div className="flex gap-medium">
                     <div className="avatar flex-center" style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f8fafc", fontWeight: 800, color: "#2563eb" }}>{(item.user[0])}</div>
                     <div className="activity-info flex flex-column">
                        <strong style={{ fontSize: "0.95rem" }}>{item.user}</strong>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{item.role}</span>
                     </div>
                  </div>
                  <div className="activity-meta text-right">
                     <span className={`status-pill ${item.status.toLowerCase().replace(" ", "-")}`} style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 800, padding: "4px 10px", borderRadius: "6px", background: "#f1f5f9", marginBottom: "4px" }}>{item.status}</span>
                     <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{item.time}</div>
                  </div>
               </div>
             ))}
          </div>
       </div>
       
       <div className="glass-card">
          <div className="card-header p-medium flex-center gap-small" style={{ borderBottom: "1px solid #f1f5f9" }}>
             <LucideCalendar size={18} color="#2563eb" />
             <h3 style={{ fontWeight: 800 }}>Global Ops Sync</h3>
          </div>
          <div className="p-medium text-center">
             <div style={{ background: "rgba(37, 99, 235, 0.05)", padding: "20px", borderRadius: "16px", marginBottom: "20px" }}>
                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>Quarterly strategy alignment with Boss at 10:00 AM Monday.</p>
             </div>
             <button className="btn-primary w-full" style={{ width: "100%" }}>Strategic Hub</button>
          </div>
       </div>
    </div>
  </div>
);

const PlaceholderView = ({ title, icon, desc }: any) => (
  <div className="placeholder-view glass-card flex-center" style={{ height: "calc(100vh - 120px)" }}>
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="placeholder-inner text-center"
    >
      <div className="placeholder-icon glass flex-center" style={{ width: "100px", height: "100px", margin: "0 auto 20px", color: "#2563eb", borderRadius: "30px" }}>
        {icon}
      </div>
      <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>{title}</h1>
      <p style={{ color: "#64748b", maxWidth: "450px", margin: "0 auto", fontSize: "1.1rem" }}>{desc}</p>
      
      <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "center" }}>
        <button className="btn-primary glass">Initiate Protocol</button>
        <button className="btn-secondary glass">View Documentation</button>
      </div>
    </motion.div>
  </div>
);
