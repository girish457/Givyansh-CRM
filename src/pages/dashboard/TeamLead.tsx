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
  LucideLoader2,
  LucideRocket,
  LucideCalendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Clients from "@/components/dashboard/Clients";
import "@/styles/Dashboard.css";

export default function TeamLeadDashboard() {
  const { tab = "dashboard" } = useParams();
  const navigate = useNavigate();

  const renderContent = () => {
    switch (tab) {
      case "dashboard": return <DashboardHome />;
      case "crm": return <PlaceholderView title="TL CRM Dashboard" icon={<LucideUsers size={40} />} desc="Manage high-level candidate pipelines and team assignments." />;
      case "tasks": return <PlaceholderView title="Assign Task's" icon={<LucideClipboardList size={40} />} desc="Delegate mandates and daily targets to your recruiters." />;
      case "team": return <PlaceholderView title="Team Hierarchy" icon={<LucideShieldCheck size={40} />} desc="Overview of your active recruiters and their current status." />;
      case "clients": return <Clients role="tl" />;
      case "jobs": return <PlaceholderView title="Job Orders" icon={<LucideBriefcase size={40} />} desc="Active hiring requirements assigned to your team." />;
      case "sourcing": return <PlaceholderView title="Team Sourcing Hub" icon={<LucideSearch size={40} />} desc="Centralized sourcing channels for collective mandates." />;
      case "reports": return <PlaceholderView title="TL Intelligence Reports" icon={<LucideFileBarChart size={40} />} desc="Comprehensive performance analysis of your desk." />;
      case "inbox": return <PlaceholderView title="Team Lead Inbox" icon={<LucideMail size={40} />} desc="Escalated communications and management threads." />;
      case "vendors": return <PlaceholderView title="Vendor Management" icon={<LucideTruck size={40} />} desc="Coordinate with external partners and agencies." />;
      case "team-leads": return <PlaceholderView title="My Peer TLs" icon={<LucideUsers size={40} />} desc="Collaborate with other Team Leads in the organization." />;
      case "announcements": return <PlaceholderView title="Team Announcements" icon={<LucideMegaphone size={40} />} desc="Broadcast updates and targets to your reporting unit." />;
      case "todo": return <PlaceholderView title="TL To-Do List" icon={<LucideCheckCircle2 size={40} />} desc="Personal management tasks and follow-ups." />;
      case "team-data": return <PlaceholderView title="Team Candidate Pool" icon={<LucideDatabase size={40} />} desc="Unified database of all candidates sourced by your team." />;
      default: return <DashboardHome />;
    }
  };

  return (
    <AdminLayout 
      role="tl" 
      userName="Demo Team Lead" 
      activeTab={tab}
      onTabChange={(id) => navigate(`/dashboard/tl/${id}`)}
    >
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
    </AdminLayout>
  );
}

const DashboardHome = () => (
  <div className="dashboard-home">
    <div className="dash-header">
       <div>
         <h1>Team Commander Pulse</h1>
         <p>Global oversight of your recruitment unit and desking metrics.</p>
       </div>
       <div className="dash-actions">
          <button className="btn-primary glass"><LucideRocket size={18} /> Broadcase Announcement</button>
          <button className="btn-primary"><LucidePlus size={18} /> Assign New Task</button>
       </div>
    </div>

    <div className="stats-grid">
       <div className="stat-card glass-card purple">
          <div className="stat-icon"><LucideUsers size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Team Members</span>
             <h2 className="stat-value">8 Active</h2>
             <span className="stat-delta pos">Full Strength</span>
          </div>
       </div>
       <div className="stat-card glass-card blue">
          <div className="stat-icon"><LucideClipboardList size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Active Tasks</span>
             <h2 className="stat-value">42</h2>
             <span className="stat-delta">12 urgent mandates</span>
          </div>
       </div>
       <div className="stat-card glass-card green">
          <div className="stat-icon"><LucideCheckCircle2 size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Team Placements</span>
             <h2 className="stat-value">64</h2>
             <span className="stat-delta pos">+20% vs Last Quarter</span>
          </div>
       </div>
       <div className="stat-card glass-card orange">
          <div className="stat-icon"><LucideFileBarChart size={24} /></div>
          <div className="stat-content">
             <span className="stat-label">Total Revenue</span>
             <h2 className="stat-value">₹12.8M</h2>
             <span className="stat-delta pos">On Target</span>
          </div>
       </div>
    </div>

    <div className="grid-2-1 mt-large">
       <div className="glass-card">
          <div className="card-header">
             <h3>Recruiter Activity Node</h3>
             <button className="btn-text">Manage Team</button>
          </div>
          <div className="activity-list">
             {[
               { user: "Aryan Singh", role: "Junior Recruiter", time: "5 min ago", status: "Sourcing" },
               { user: "Priya Sharma", role: "Senior Recruiter", time: "18 min ago", status: "Interviewing" },
               { user: "Rahul Verma", role: "Mandate Specialist", time: "45 min ago", status: "Offer Stage" },
             ].map((item, i) => (
               <div key={i} className="activity-item glass">
                  <div className="user-initials">{(item.user[0])}</div>
                  <div className="activity-info">
                     <strong>{item.user}</strong>
                     <span>{item.role}</span>
                  </div>
                  <div className="activity-meta">
                     <span className={`status-pill ${item.status.toLowerCase().replace(" ", "-")}`}>{item.status}</span>
                     <span className="time">{item.time}</span>
                  </div>
               </div>
             ))}
          </div>
       </div>
       
       <div className="glass-card">
          <div className="card-header"><LucideCalendar size={18} /><h3>Management Sync</h3></div>
          <div className="p-medium">
             <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Weekly Lead alignment scheduled at 05:00 PM today.</p>
             <button className="btn-primary w-full mt-medium">Join Neural Meeting</button>
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
