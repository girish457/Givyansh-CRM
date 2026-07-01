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
  LucideClock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TeamManagement from "@/components/dashboard/TeamManagement";
import TaskAssignment from "@/components/dashboard/TaskAssignment";
import Clients from "@/components/dashboard/Clients";
import Jobs from "@/components/dashboard/Jobs";
import SourcingHub from "@/components/dashboard/SourcingHub";
import MyAttendance from "@/components/dashboard/MyAttendance";
import MyToDoList from "@/components/dashboard/MyToDoList";
import MyVendors from "@/components/dashboard/MyVendors";
import TeamLeadData from "@/components/dashboard/TeamLeadData";
import TeamCandidatesData from "@/components/dashboard/TeamCandidatesData";
import TeamAnnouncements from "@/components/dashboard/TeamAnnouncements";
import TeamReports from "@/components/dashboard/TeamReports";
import TLReportingAI from "@/components/dashboard/TLReportingAI";
import EarnedGiftsCenter from "@/components/dashboard/EarnedGiftsCenter";
import TLIncentiveView from "@/components/dashboard/TLIncentiveView";
import CandidateReverts from "../../components/dashboard/CandidateReverts";
import { CRMView, ReminderSystem } from "./Recruiter";
import ProfileView from "@/components/dashboard/ProfileView";
import AnnouncementPopupSystem from "@/components/dashboard/AnnouncementPopupSystem";
import SupervisorFeedbackTab from "@/components/dashboard/SupervisorFeedbackTab";
import MyPerformance from "@/components/dashboard/MyPerformance";
import "@/styles/Dashboard.css";
import MeetingDashboard from "@/components/dashboard/MeetingDashboard";

import TLDashboardHome from "@/components/dashboard/TLDashboardHome";

export default function TLDashboard() {
  const { tab = "dashboard" } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
    fetchCandidates();
  }, []);

  // Reset selected candidate whenever the active tab changes
  useEffect(() => {
    setSelectedCandidate(null);
  }, [tab]);

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
    setLoading(tab === "crm" || tab === "vendors" || tab === "team-leads");
    try {
      const res = await fetch("/api/candidates");
      if (!res.ok) throw new Error("Backend Protocol Error");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCandidates(data);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error("Failed to fetch candidates", err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (tab) {
      case "dashboard": return <TLDashboardHome userProfile={userProfile} candidates={candidates} onRefresh={fetchCandidates} />;
      case "crm": return <CRMView candidates={candidates} loading={loading} selectedCandidate={selectedCandidate} setSelectedCandidate={setSelectedCandidate} onRefresh={fetchCandidates} type="crm" currentUser={userProfile} />;
      case "tasks": return <TaskAssignment role="tl" />;
      case "team": return <TeamManagement role="tl" />;
      case "clients": return <Clients role="tl" />;
      case "jobs": return <Jobs role="tl" />;
      case "sourcing": return <SourcingHub role="tl" />;
      case "reports": return <TeamReports />;
      case "inbox": return <TLReportingAI currentUser={userProfile} candidates={candidates} onRefresh={fetchCandidates} />;
      case "vendors": return <MyVendors currentUser={userProfile} candidates={candidates} />;
      case "team-leads": return <TeamLeadData />;
      case "announcements": return <TeamAnnouncements />;
      case "todo": return <MyToDoList />;
      case "team-data": return <TeamCandidatesData />;
      case "earned-gifts": return <EarnedGiftsCenter role="tl" />;
      case "incentives": return <TLIncentiveView />;
      case "feedback": return <SupervisorFeedbackTab role="tl" currentUser={userProfile} />;
      case "attendance": return <MyAttendance userId={userProfile?.id} />;
      case "reverts": return <CandidateReverts candidates={candidates} currentUser={userProfile} onRefresh={fetchCandidates} role="tl" />;
      case "profile": return <ProfileView role="tl" userId={userProfile?.id} />;
      case "performance": return <MyPerformance currentUser={userProfile} candidates={candidates} />;
      case "meetings": return <MeetingDashboard role="tl" currentUser={userProfile} />;
      default: return <TLDashboardHome userProfile={userProfile} candidates={candidates} onRefresh={fetchCandidates} />;
    }
  };

  return (
    <AdminLayout 
      role="tl" 
      userName={userProfile?.name || "Loading..."} 
      activeTab={tab}
      onTabChange={(id) => navigate(`/dashboard/tl/${id}`)}
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
         <h1 style={{ fontSize: "2.2rem", fontWeight: 900 }}>Team Commander Pulse</h1>
         <p style={{ color: "#64748b" }}>Global oversight of your recruitment unit and desking metrics.</p>
       </div>
       <div className="dash-actions flex gap-small">
          <button className="btn-primary glass"><LucideRocket size={18} /> Broadcast</button>
          <button className="btn-primary"><LucidePlus size={18} /> Assign Task</button>
       </div>
    </div>

    <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
       <div className="stat-card glass-card" style={{ borderLeft: "4px solid #a855f7" }}>
          <div className="stat-icon" style={{ background: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}><LucideUsers size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Team Members</span>
             <h2 className="stat-value">8 Active</h2>
             <span className="stat-delta pos">Full Strength</span>
          </div>
       </div>
       <div className="stat-card glass-card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}><LucideClipboardList size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Active Tasks</span>
             <h2 className="stat-value">42</h2>
             <span className="stat-delta">12 urgent mandates</span>
          </div>
       </div>
       <div className="stat-card glass-card" style={{ borderLeft: "4px solid #22c55e" }}>
          <div className="stat-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}><LucideCheckCircle2 size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Placements</span>
             <h2 className="stat-value">64</h2>
             <span className="stat-delta pos">+20% YoY</span>
          </div>
       </div>
       <div className="stat-card glass-card" style={{ borderLeft: "4px solid #f97316" }}>
          <div className="stat-icon" style={{ background: "rgba(249, 115, 22, 0.1)", color: "#f97316" }}><LucideTrendingUp size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Unit Revenue</span>
             <h2 className="stat-value">₹12.8M</h2>
             <span className="stat-delta pos">On Target</span>
          </div>
       </div>
    </div>

    <div className="grid-2-1 mt-large" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
       <div className="glass-card table-section">
          <div className="card-header flex-between p-medium" style={{ borderBottom: "1px solid #f1f5f9" }}>
             <h3 style={{ fontWeight: 800 }}>Recruiter Activity Node</h3>
             <button className="btn-text" style={{ color: "#2563eb", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Manage Team</button>
          </div>
          <div className="activity-list p-medium">
             {[
               { user: "Aryan Singh", role: "Junior Recruiter", time: "5 min ago", status: "Sourcing" },
               { user: "Priya Sharma", role: "Senior Recruiter", time: "18 min ago", status: "Interviewing" },
               { user: "Rahul Verma", role: "Mandate Specialist", time: "45 min ago", status: "Offer Stage" },
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
             <h3 style={{ fontWeight: 800 }}>Management Sync</h3>
          </div>
          <div className="p-medium text-center">
             <div style={{ background: "rgba(37, 99, 235, 0.05)", padding: "20px", borderRadius: "16px", marginBottom: "20px" }}>
                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>Weekly Lead alignment scheduled at 05:00 PM today.</p>
             </div>
             <button className="btn-primary w-full" style={{ width: "100%" }}>Join Neural Meeting</button>
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
// touch to refresh imports

