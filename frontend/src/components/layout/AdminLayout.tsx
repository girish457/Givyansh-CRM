import { useState, useEffect, ReactNode, useRef } from "react";

import { Link, useLocation } from "react-router-dom";
import {
  LucideLayoutDashboard,
  LucideUsers,
  LucideSettings,
  LucideLogOut,
  LucideChevronLeft,
  LucideChevronRight,
  LucideBell,
  LucideSearch,
  LucideShieldCheck,
  LucideLayoutGrid,
  LucideBuilding2,
  LucideCreditCard,
  LucideMessageSquare,
  LucideBriefcase,
  LucideGlobe,
  LucideMail,
  LucideDatabase,
  LucideFileText,
  LucideCheckSquare,
  LucideClipboardList,
  LucideCalendarDays,
  LucideTrendingUp,
  LucideTruck,
  LucideFileBarChart,
  LucideMegaphone,
  LucideCheckCircle2,
  LucideCoins,
  LucideGift,
  LucideBanknote,
  LucideFileLock,
  LucideCpu,
  LucideRefreshCw
} from "lucide-react";
import TaskNotificationOverlay from "@/components/dashboard/TaskNotificationOverlay";
import AttendanceTracker from "@/components/attendance/AttendanceTracker";
import PolicyAcknowledgementPopup from "@/components/dashboard/PolicyAcknowledgementPopup";
import GlobalChat from "@/components/dashboard/GlobalChat";
import FloatingChat from "@/components/dashboard/FloatingChat";
import InstantMeetingOverlay from "@/components/dashboard/InstantMeetingOverlay";
import MeetingRoom from "@/components/dashboard/MeetingRoom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import "@/styles/Admin.css";
import { 
  RecruiterCoinBadges, RecruiterSelectionBadges, RecruiterJoiningBadges,
  TLTeamCoinBadges, TLTeamSelectionBadges, TLTeamJoiningBadges 
} from "../../utils/gamification";

// Glowing game badge emblem
const GlowingEmblem = ({ icon, color, size = "120px" }: { icon: string; color: string; size?: string }) => {
  const getBadgeSVG = (emoji: string, strokeColor: string) => {
    const fillVal = `${strokeColor}15`;
    const strokeVal = strokeColor;
    
    // Check medal levels
    const isBronze = emoji.includes("🥉") || emoji.includes("Bronze");
    const isSilver = emoji.includes("🥈") || emoji.includes("Silver");
    const isGold = emoji.includes("🥇") || emoji.includes("Gold");
    const textToShow = isBronze ? "3" : isSilver ? "2" : isGold ? "1" : "";
    
    if (emoji === "🌱" || emoji.includes("🌱")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 20h10M10 20c5.5-3 5.5-10 5.5-17" />
          <path d="M12 10c-3-2-6-1-7-4 3 0 6 1 7 4z" fill={fillVal} />
          <path d="M12 12c3-2 6-1 7-4-3 0-6 1-7 4z" fill={fillVal} />
        </svg>
      );
    }
    if (emoji === "🏢" || emoji.includes("🏢") || emoji.includes("🏛️")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" fill={fillVal} />
          <path d="M9 22v-4h6v4M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2" />
        </svg>
      );
    }
    if (isBronze || isSilver || isGold || emoji.includes("🎖️") || emoji.includes("🏅")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" fill={fillVal} />
          <path d="M15.47 12.8A10 10 0 0 1 12 22a10 10 0 0 1-3.47-9.2M8 10l-2 8M16 10l2 8" />
          {textToShow && <text x="12" y="10.5" fill={strokeVal} fontSize="7.5" fontWeight="900" textAnchor="middle" style={{ fontFamily: "sans-serif" }}>{textToShow}</text>}
        </svg>
      );
    }
    if (emoji === "⭐" || emoji === "🌟" || emoji === "✨" || emoji.includes("⭐") || emoji.includes("🌟") || emoji.includes("✨") || emoji.includes("🏆")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={fillVal} />
        </svg>
      );
    }
    if (emoji === "💸" || emoji === "💰" || emoji.includes("💸") || emoji.includes("💰")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" fill={fillVal} />
          <circle cx="12" cy="12" r="3" fill={fillVal} />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    }
    if (emoji === "💎" || emoji.includes("💎")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z" fill={fillVal} />
          <path d="M11 3 8 9l4 12 4-12-3-6M2 9h20" style={{ opacity: 0.3 }} />
        </svg>
      );
    }
    if (emoji === "👔" || emoji === "🧑‍💼" || emoji.includes("👔") || emoji.includes("🧑‍💼") || emoji.includes("😎")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" fill={fillVal} />
          <path d="M17 11l2 2 4-4" />
        </svg>
      );
    }
    if (emoji === "👑" || emoji === "🤴" || emoji.includes("👑") || emoji.includes("🤴")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm1 16h18" fill={fillVal} />
        </svg>
      );
    }
    if (emoji === "🛡️" || emoji.includes("🛡️")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={fillVal} />
        </svg>
      );
    }
    if (emoji === "🚀" || emoji.includes("🚀")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.2-2.5 3.5-2.5 5.5C4 22 6.2 21 7.5 19.5M12 12l9-9M9 15l-3-3M13.5 6.5l3.5 3.5" />
          <path d="M9 15c4.5 0 9.5-3 12.5-6s-6-8-12.5-6c0 0-2.5 1.5-3.5 3.5" fill={fillVal} />
        </svg>
      );
    }
    if (emoji === "⚡" || emoji.includes("⚡")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={fillVal} />
        </svg>
      );
    }
    if (emoji === "🔍" || emoji.includes("🔍")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" fill={fillVal} />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    }
    if (emoji === "⚔️" || emoji.includes("⚔️")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 3l8 8-3.5 3.5-8-8M3 21l8-8" fill={fillVal} />
        </svg>
      );
    }
    if (emoji === "🧠" || emoji.includes("🧠")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5a5 5 0 0 0-8 0c-2 1.1-3 3-3 5a7 7 0 0 0 7 7z" fill={fillVal} />
        </svg>
      );
    }
    if (emoji.includes("🔥")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill={fillVal} />
        </svg>
      );
    }
    if (emoji.includes("⚙️")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" fill={fillVal} />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    }
    if (emoji.includes("🔮") || emoji.includes("🌌")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" fill={fillVal} />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
      );
    }
    if (emoji.includes("♟️")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="6" r="3" fill={fillVal} />
          <path d="M19 21H5a1 1 0 0 1-1-1v-2c0-2.8 2.2-5 5-5h6c2.8 0 5 2.2 5 5v2a1 1 0 0 1-1 1z" fill={fillVal} />
        </svg>
      );
    }
    if (emoji.includes("📊") || emoji.includes("📈") || emoji.includes("📉")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <path d="M3 20h18" />
        </svg>
      );
    }
    if (emoji.includes("🎓") || emoji.includes("📜")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill={fillVal} />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      );
    }
    if (emoji.includes("🌏") || emoji.includes("🌍") || emoji.includes("🌎")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" fill={fillVal} />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
        </svg>
      );
    }
    if (emoji.includes("👹")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" fill={fillVal} />
          <path d="M12 14c-1.5 0-3-.5-4-1.5m8 0C15 13.5 13.5 14 12 14z" />
          <path d="M9 10h.01M15 10h.01M6 5l2 3M18 5l-2 3" />
        </svg>
      );
    }
    if (emoji.includes("🎭")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 0 0-10 10c0 5.5 4.5 10 10 10s10-4.5 10-10A10 10 0 0 0 12 2z" fill={fillVal} />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <circle cx="9" cy="9" r="1.5" fill={strokeVal} />
          <circle cx="15" cy="9" r="1.5" fill={strokeVal} />
        </svg>
      );
    }
    if (emoji.includes("🏗️") || emoji.includes("🧱") || emoji.includes("🗿") || emoji.includes("🦾")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22V8M5 12h14M2 17h20" />
          <rect x="9" y="2" width="6" height="6" fill={fillVal} />
        </svg>
      );
    }
    if (emoji.includes("🗺️")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" fill={fillVal} />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
      );
    }
    if (emoji.includes("🎯")) {
      return (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" fill={fillVal} />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill={strokeVal} />
        </svg>
      );
    }

    return (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={strokeVal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill={fillVal} />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill={strokeVal} />
      </svg>
    );
  };

  const parsedSize = parseInt(size);
  const isMini = !isNaN(parsedSize) && parsedSize <= 30;

  if (isMini) {
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#ffffff",
        border: `1.5px solid ${color}`,
        boxShadow: `0 2px 6px ${color}20`,
        padding: "2px",
        boxSizing: "border-box"
      }}>
        <span style={{ display: "block", width: "100%", height: "100%", color }}>
          {getBadgeSVG(icon, color)}
        </span>
      </span>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#ffffff",
      border: `3.5px solid ${color}`,
      boxShadow: `0 4px 12px rgba(0, 0, 0, 0.08), 0 0 16px ${color}33`,
      padding: "6px",
      boxSizing: "border-box",
      position: "relative"
    }}>
      <div style={{ width: "100%", height: "100%", color: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {getBadgeSVG(icon, color)}
      </div>
    </div>
  );
};

interface AdminLayoutProps {
  children: ReactNode;
  role: "superadmin" | "boss" | "manager" | "tl" | "recruiter";
  userName?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function AdminLayout({ children, role, userName = "Girish G.", activeTab, onTabChange }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState<{ [key: string]: boolean }>({});
  const [user, setUser] = useState<any>(null);
  const userRef = useRef<any>(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!role || role === "superadmin" || !user) return;
    
    const syncDashboardNotifications = async () => {
      try {
        const fetchJobs = fetch("/api/jobs").then(r => r.ok ? r.json() : null).catch(() => null);
        const fetchClients = fetch("/api/clients").then(r => r.ok ? r.json() : null).catch(() => null);
        const fetchSourcing = fetch("/api/sourcing/platforms").then(r => r.ok ? r.json() : null).catch(() => null);
        const fetchReverts = fetch("/api/revert-queries").then(r => r.ok ? r.json() : null).catch(() => null);
        const fetchTasks = fetch("/api/tasks").then(r => r.ok ? r.json() : null).catch(() => null);
        const fetchMeetings = fetch("/api/meetings").then(r => r.ok ? r.json() : null).catch(() => null);
        const fetchMe = fetch("/api/me").then(r => r.ok ? r.json() : null).catch(() => null);
        const fetchCandidates = fetch("/api/candidates").then(r => r.ok ? r.json() : null).catch(() => null);
        const fetchFeedback = fetch(role === "recruiter" ? "/api/feedback/history" : "/api/feedback/list")
          .then(r => r.ok ? r.json() : null).catch(() => null);
        const fetchTeam = (role === "tl" || role === "manager") ? fetch("/api/team").then(r => r.ok ? r.json() : null).catch(() => null) : Promise.resolve(null);
        const fetchVendors = (role === "tl" || role === "manager" || role === "boss") ? fetch("/api/vendors").then(r => r.ok ? r.json() : null).catch(() => null) : Promise.resolve(null);

        const [
          jobs, clients, sourcing, reverts, tasks, meetings, me, candidates, feedback, team, vendors
        ] = await Promise.all([
          fetchJobs, fetchClients, fetchSourcing, fetchReverts, fetchTasks, fetchMeetings, fetchMe, fetchCandidates, fetchFeedback, fetchTeam, fetchVendors
        ]);

        const updates: { [key: string]: boolean } = {};

        const checkAndUpdate = (key: string, currentData: any) => {
          try {
            const currentUserId = user?.id || user?.email || role || "default";
            if (currentData !== null && currentData !== undefined) {
              localStorage.setItem(`givyansh_latest_data_${currentUserId}_${key}`, JSON.stringify(currentData));
            }
            const lastSeenStr = localStorage.getItem(`givyansh_seen_time_${currentUserId}_${key}`);
            if (!lastSeenStr) {
              localStorage.setItem(`givyansh_seen_time_${currentUserId}_${key}`, new Date().toISOString());
              updates[key] = false;
              localStorage.setItem(`givyansh_unread_${currentUserId}_${key}`, "false");
              if (Array.isArray(currentData)) {
                localStorage.setItem(`givyansh_seen_len_${currentUserId}_${key}`, String(currentData.length));
              }
              return;
            }
            
            const lastSeenTime = new Date(lastSeenStr);
            let hasNew = false;
            let hasTimestamp = false;
            
            if (Array.isArray(currentData)) {
              hasNew = currentData.some(item => {
                const itemTimeStr = item.updatedAt || item.createdAt || item.created_at || item.updated_at;
                if (itemTimeStr) {
                  hasTimestamp = true;
                  return new Date(itemTimeStr) > lastSeenTime;
                }
                return false;
              });
              
              if (!hasTimestamp && currentData.length > 0) {
                const savedLenStr = localStorage.getItem(`givyansh_seen_len_${currentUserId}_${key}`);
                if (savedLenStr) {
                  hasNew = currentData.length !== parseInt(savedLenStr, 10);
                } else {
                  localStorage.setItem(`givyansh_seen_len_${currentUserId}_${key}`, String(currentData.length));
                }
              }
            } else if (currentData && typeof currentData === "object") {
              const itemTimeStr = (currentData as any).updatedAt || (currentData as any).createdAt || (currentData as any).created_at || (currentData as any).updated_at;
              if (itemTimeStr) {
                hasNew = new Date(itemTimeStr) > lastSeenTime;
              }
            }
            
            if (hasNew) {
              updates[key] = true;
              localStorage.setItem(`givyansh_unread_${currentUserId}_${key}`, "true");
            } else {
              updates[key] = localStorage.getItem(`givyansh_unread_${currentUserId}_${key}`) === "true";
            }
          } catch (err) {
            console.error(`Error in checkAndUpdate for ${key}:`, err);
            updates[key] = false;
          }
        };

        // 1. Jobs
        if (jobs) {
          checkAndUpdate("jobs", jobs);
        }

        // 2. Clients
        if (clients) {
          checkAndUpdate("clients", clients);
        }

        // 3. Sourcing
        if (sourcing) {
          checkAndUpdate("sourcing", sourcing);
        }

        // 4. Reverts
        if (reverts) {
          const currentUserId = user?.id || user?.email || role || "default";
          const lastSeenStr = localStorage.getItem(`givyansh_seen_time_${currentUserId}_reverts`);
          
          let hasNew = false;
          if (!lastSeenStr) {
            if (role === "recruiter") {
              hasNew = reverts.some((r: any) => r.status !== "Pending");
            } else {
              hasNew = reverts.some((r: any) => r.status === "Pending");
            }
            localStorage.setItem(`givyansh_seen_time_${currentUserId}_reverts`, new Date().toISOString());
            localStorage.setItem(`givyansh_unread_${currentUserId}_reverts`, hasNew ? "true" : "false");
          } else {
            const lastSeenTime = new Date(lastSeenStr);
            if (role === "recruiter") {
              hasNew = reverts.some((r: any) => r.status !== "Pending" && new Date(r.updatedAt || r.createdAt) > lastSeenTime);
            } else {
              hasNew = reverts.some((r: any) => r.status === "Pending" && new Date(r.createdAt) > lastSeenTime);
            }
            if (hasNew) {
              localStorage.setItem(`givyansh_unread_${currentUserId}_reverts`, "true");
            }
          }
          updates["reverts"] = localStorage.getItem(`givyansh_unread_${currentUserId}_reverts`) === "true";
        }

        // 5. Tasks & Todo
        if (tasks) {
          const currentUserId = user?.id || user?.email || role || "default";
          const lastSeenStr = localStorage.getItem(`givyansh_seen_time_${currentUserId}_tasks`);
          
          let hasNew = false;
          if (!lastSeenStr) {
            if (role === "recruiter") {
              hasNew = tasks.some((t: any) => t.status !== "Completed");
            } else {
              hasNew = tasks.some((t: any) => t.status === "Completed");
            }
            localStorage.setItem(`givyansh_seen_time_${currentUserId}_tasks`, new Date().toISOString());
            localStorage.setItem(`givyansh_unread_${currentUserId}_tasks`, hasNew ? "true" : "false");
          } else {
            const lastSeenTime = new Date(lastSeenStr);
            if (role === "recruiter") {
              hasNew = tasks.some((t: any) => t.status !== "Completed" && new Date(t.updatedAt || t.createdAt) > lastSeenTime);
            } else {
              hasNew = tasks.some((t: any) => (t.status === "Completed" && new Date(t.updatedAt || t.createdAt) > lastSeenTime));
            }
            if (hasNew) {
              localStorage.setItem(`givyansh_unread_${currentUserId}_tasks`, "true");
            }
          }
          updates["tasks"] = localStorage.getItem(`givyansh_unread_${currentUserId}_tasks`) === "true";

          const todoSummary = tasks.filter((t: any) => t.isCompleted === false || t.status !== "Completed").map((t: any) => ({ id: t.id || t._id, deadline: t.deadline }));
          const unreadTodo = todoSummary.some((t: any) => {
            if (!t.deadline) return false;
            return new Date(t.deadline) <= new Date();
          });
          if (unreadTodo) {
            updates["todo"] = true;
            localStorage.setItem(`givyansh_unread_${currentUserId}_todo`, "true");
          } else {
            updates["todo"] = localStorage.getItem(`givyansh_unread_${currentUserId}_todo`) === "true";
          }
        }

        // 6. Meetings
        if (meetings) {
          checkAndUpdate("meetings", meetings);
        }

        // 7. Performance & Gifts
        if (me) {
          const currentUserId = user?.id || user?.email || role || "default";
          const lastCoinsStr = localStorage.getItem(`givyansh_seen_coins_${currentUserId}`);
          if (!lastCoinsStr) {
            localStorage.setItem(`givyansh_seen_coins_${currentUserId}`, String(me.coins || 0));
            updates["performance"] = false;
            localStorage.setItem(`givyansh_unread_${currentUserId}_performance`, "false");
          } else {
            const lastCoins = Number(lastCoinsStr);
            if (me.coins && me.coins !== lastCoins) {
              updates["performance"] = true;
              localStorage.setItem(`givyansh_unread_${currentUserId}_performance`, "true");
            } else {
              updates["performance"] = localStorage.getItem(`givyansh_unread_${currentUserId}_performance`) === "true";
            }
          }
          
          checkAndUpdate("earned-gifts", me.gifts || []);
          checkAndUpdate("gifts", me.gifts || []);
        }

        // 8. Candidates / Leads / Incentives
        if (candidates) {
          const currentUserId = user?.id || user?.email || role || "default";
          
          if (role === "recruiter") {
            const lastSeenStr = localStorage.getItem(`givyansh_seen_time_${currentUserId}_leads`);
            const rawBatchesStr = localStorage.getItem("givyansh_forwarded_leads_v1") || "[]";
            let rawBatches = [];
            try {
              rawBatches = JSON.parse(rawBatchesStr);
            } catch {}
            
            const myReceived = rawBatches.filter((b: any) => b.toIds && (b.toIds.includes(currentUserId) || b.toIds.includes(Number(currentUserId))));
            
            let hasNew = false;
            if (!lastSeenStr) {
              hasNew = myReceived.length > 0;
              localStorage.setItem(`givyansh_seen_time_${currentUserId}_leads`, new Date().toISOString());
              localStorage.setItem(`givyansh_unread_${currentUserId}_leads`, hasNew ? "true" : "false");
            } else {
              const lastSeenTime = new Date(lastSeenStr);
              hasNew = myReceived.some((b: any) => new Date(b.date) > lastSeenTime);
              if (hasNew) {
                localStorage.setItem(`givyansh_unread_${currentUserId}_leads`, "true");
              }
            }
            updates["leads"] = localStorage.getItem(`givyansh_unread_${currentUserId}_leads`) === "true";
          } else {
            checkAndUpdate("leads", candidates);
            checkAndUpdate("team-leads", candidates);
            checkAndUpdate("team-data", candidates);
          }
          
          checkAndUpdate("incentives", candidates);
          checkAndUpdate("incentive", candidates);
        }

        // 9. Feedback
        if (feedback) {
          const currentUserId = user?.id || user?.email || role || "default";
          const lastSeenStr = localStorage.getItem(`givyansh_seen_time_${currentUserId}_feedback`);
          
          let hasNew = false;
          if (!lastSeenStr) {
            if (role === "recruiter") {
              hasNew = feedback.some((f: any) => (f.replies || []).length > 0);
            } else {
              hasNew = feedback.some((f: any) => f.status === "Sent");
            }
            localStorage.setItem(`givyansh_seen_time_${currentUserId}_feedback`, new Date().toISOString());
            localStorage.setItem(`givyansh_unread_${currentUserId}_feedback`, hasNew ? "true" : "false");
          } else {
            const lastSeenTime = new Date(lastSeenStr);
            if (role === "recruiter") {
              hasNew = feedback.some((f: any) => (f.replies || []).length > 0 && new Date(f.updatedAt || f.createdAt) > lastSeenTime);
            } else {
              hasNew = feedback.some((f: any) => (f.status === "Sent" && new Date(f.createdAt) > lastSeenTime));
            }
            if (hasNew) {
              localStorage.setItem(`givyansh_unread_${currentUserId}_feedback`, "true");
            }
          }
          updates["feedback"] = localStorage.getItem(`givyansh_unread_${currentUserId}_feedback`) === "true";
        }

        // 10. Team
        if (team) {
          checkAndUpdate("team", team);
        }

        // 11. Vendors
        if (vendors) {
          checkAndUpdate("vendors", vendors);
        }

        setHasUnread(updates);
      } catch (err) {
        console.error("Failed to sync dashboard notifications:", err);
      }
    };

    syncDashboardNotifications();
    const interval = setInterval(syncDashboardNotifications, 12000);
    
    const handleForceUpdate = () => {
      const updates: { [key: string]: boolean } = {};
      const keys = ["jobs", "clients", "sourcing", "reverts", "tasks", "todo", "meetings", "performance", "earned-gifts", "gifts", "leads", "team-leads", "team-data", "incentives", "incentive", "feedback", "team", "vendors"];
      const currentUserId = user?.id || user?.email || role || "default";
      keys.forEach(k => {
        updates[k] = localStorage.getItem(`givyansh_unread_${currentUserId}_${k}`) === "true";
      });
      setHasUnread(updates);
    };

    window.addEventListener("givyansh_notifications_updated", handleForceUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("givyansh_notifications_updated", handleForceUpdate);
    };
  }, [role, user]);

  useEffect(() => {
    if (!user) return;
    (window as any).hasUnreadSection = (key: string) => {
      const currentUserId = user?.id || user?.email || role || "default";
      return localStorage.getItem(`givyansh_unread_${currentUserId}_${key}`) === "true";
    };
    (window as any).markSectionSeen = (key: string) => {
      const currentUserId = user?.id || user?.email || role || "default";
      localStorage.setItem(`givyansh_unread_${currentUserId}_${key}`, "false");
      localStorage.setItem(`givyansh_seen_time_${currentUserId}_${key}`, new Date().toISOString());
      
      const latestDataStr = localStorage.getItem(`givyansh_latest_data_${currentUserId}_${key}`);
      if (latestDataStr) {
        try {
          const parsed = JSON.parse(latestDataStr);
          if (Array.isArray(parsed)) {
            localStorage.setItem(`givyansh_seen_len_${currentUserId}_${key}`, String(parsed.length));
          }
        } catch {}
      }
      
      if (key === "performance") {
        fetch("/api/me").then(r => r.json()).then(me => {
          if (me && me.coins !== undefined) {
            localStorage.setItem(`givyansh_seen_coins_${currentUserId}`, String(me.coins));
          }
        }).catch(() => null);
      }
      window.dispatchEvent(new Event("givyansh_notifications_updated"));
    };
  }, [user]);


  const fetchEarningsRef = useRef<any>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);
  const lifetimeEarningsRef = useRef(0);
  useEffect(() => {
    lifetimeEarningsRef.current = lifetimeEarnings;
  }, [lifetimeEarnings]);
  const location = useLocation();
  const attendanceRef = useRef<any>(null);

  const [pendingPolicies, setPendingPolicies] = useState<any[]>([]);

  // Gamification celebration state
  const [celebrationBadge, setCelebrationBadge] = useState<any>(null);
  const [celebrationTrack, setCelebrationTrack] = useState<string>("");
  const [celebratingUserId, setCelebratingUserId] = useState<string>("");
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // Active Floating Meeting Room ID state
  const [activeMeetingRoomId, setActiveMeetingRoomId] = useState<string | null>(
    localStorage.getItem("current_active_meeting_id")
  );
  const [isSharingCRM, setIsSharingCRM] = useState(
    localStorage.getItem("is_sharing_crm") === "true"
  );
  const [isMeetingPip, setIsMeetingPip] = useState(
    localStorage.getItem("is_meeting_pip") === "true"
  );
  const [isMeetingExpanded, setIsMeetingExpanded] = useState(
    localStorage.getItem("is_meeting_expanded") === "true"
  );
  const [meetingWidth, setMeetingWidth] = useState("780px");
  const [meetingHeight, setMeetingHeight] = useState("540px");
  const floatingWindowRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    const handleMeetingStateChanged = () => {
      setActiveMeetingRoomId(localStorage.getItem("current_active_meeting_id"));
      setIsSharingCRM(localStorage.getItem("is_sharing_crm") === "true");
      setIsMeetingPip(localStorage.getItem("is_meeting_pip") === "true");
      setIsMeetingExpanded(localStorage.getItem("is_meeting_expanded") === "true");
    };
    window.addEventListener("MEETING_STATE_CHANGED", handleMeetingStateChanged);
    window.addEventListener("storage", handleMeetingStateChanged);

    // Periodically poll storage in case of cross-tab changes
    const checkMeetingStorage = setInterval(() => {
      const storedRoom = localStorage.getItem("current_active_meeting_id");
      const storedSharing = localStorage.getItem("is_sharing_crm") === "true";
      const storedPip = localStorage.getItem("is_meeting_pip") === "true";
      const storedExpanded = localStorage.getItem("is_meeting_expanded") === "true";
      if (storedRoom !== activeMeetingRoomId) {
        setActiveMeetingRoomId(storedRoom);
      }
      if (storedSharing !== isSharingCRM) {
        setIsSharingCRM(storedSharing);
      }
      if (storedPip !== isMeetingPip) {
        setIsMeetingPip(storedPip);
      }
      if (storedExpanded !== isMeetingExpanded) {
        setIsMeetingExpanded(storedExpanded);
      }
    }, 1500);

    return () => {
      window.removeEventListener("MEETING_STATE_CHANGED", handleMeetingStateChanged);
      window.removeEventListener("storage", handleMeetingStateChanged);
      clearInterval(checkMeetingStorage);
    };
  }, [activeMeetingRoomId, isSharingCRM, isMeetingPip, isMeetingExpanded]);

  // Synchronize presenter's active tab when screen sharing is active
  useEffect(() => {
    if (isSharingCRM && activeMeetingRoomId && activeTab) {
      fetch(`/api/meetings/${activeMeetingRoomId}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          micActive: true,
          cameraActive: false,
          screenshareActive: true,
          sharedModule: activeTab,
          disconnected: false
        })
      }).catch(err => console.error("Error broadcasting shared module:", err));
    }
  }, [activeTab, isSharingCRM, activeMeetingRoomId]);

  // Synchronize stop sharing with backend when isSharingCRM is toggled off
  useEffect(() => {
    if (!isSharingCRM && activeMeetingRoomId) {
      fetch(`/api/meetings/${activeMeetingRoomId}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          micActive: true,
          cameraActive: true,
          screenshareActive: false,
          sharedModule: null,
          disconnected: false
        })
      }).catch(err => console.error("Error sync stop share:", err));
    }
  }, [isSharingCRM, activeMeetingRoomId]);



  const getBadgeIndexAndDetails = (value: number, tiers: any[]) => {
    let index = 0;
    let currentBadge = tiers[0] || { min: 0, name: "Newbie", icon: "🌱", color: "#94a3b8" };
    for (let i = 0; i < tiers.length; i++) {
      if (value >= tiers[i].min) {
        index = i;
        currentBadge = tiers[i];
      } else {
        break;
      }
    }
    return { index, badge: currentBadge };
  };

  const triggerCelebration = (badge: any, track: string, activeUserId: string) => {
    setIsScreenShaking(true);
    document.body.classList.add("gaming-screen-shake");

    // Save badge to local storage immediately to prevent duplicate trigger during active animation
    if (activeUserId && badge) {
      const lowerTrack = track.toLowerCase();
      if (lowerTrack.includes("coin")) {
        localStorage.setItem(`last_badge_coins_${activeUserId}`, badge.name);
      } else if (lowerTrack.includes("select")) {
        localStorage.setItem(`last_badge_selections_${activeUserId}`, badge.name);
      } else if (lowerTrack.includes("join")) {
        localStorage.setItem(`last_badge_joinings_${activeUserId}`, badge.name);
      }
    }

    // Phase 1: Screen Shake for 3.5 seconds
    setTimeout(() => {
      document.body.classList.remove("gaming-screen-shake");
      setIsScreenShaking(false);

      // Phase 2: Show Badge Celebration Modal
      setCelebrationBadge(badge);
      setCelebrationTrack(track);
      setCelebratingUserId(activeUserId);

      // Phase 3: Auto-close after 6 seconds
      setTimeout(() => {
        setCelebrationBadge(null);
        setCelebrationTrack("");
        setCelebratingUserId("");
      }, 6000);
    }, 3500);
  };

  const fetchEarnings = async (activeUser?: any) => {
    if (role === "superadmin" || role === "boss") return;
    try {
      const res = await fetch("/api/gamification/me");
      if (res.ok) {
         const data = await res.json();
         setLifetimeEarnings(data.coins || 0);
         
         const resolvedUser = activeUser || userRef.current;
         const activeUserId = resolvedUser?.id || resolvedUser?.userId;
         if (activeUserId) {
           const isTLMode = role === "tl";
           const coinTiers = isTLMode ? TLTeamCoinBadges : RecruiterCoinBadges;
           const selectionTiers = isTLMode ? TLTeamSelectionBadges : RecruiterSelectionBadges;
           const joiningTiers = isTLMode ? TLTeamJoiningBadges : RecruiterJoiningBadges;

           const currentCoins = data.coins || 0;
           const currentSelections = data.selections || 0;
           const currentJoinings = data.joinings || 0;

           const coinInfo = getBadgeIndexAndDetails(currentCoins, coinTiers);
           const selectionInfo = getBadgeIndexAndDetails(currentSelections, selectionTiers);
           const joiningInfo = getBadgeIndexAndDetails(currentJoinings, joiningTiers);

           const lastSavedCoinBadge = localStorage.getItem(`last_badge_coins_${activeUserId}`);
           const lastSavedSelectionBadge = localStorage.getItem(`last_badge_selections_${activeUserId}`);
           const lastSavedJoiningBadge = localStorage.getItem(`last_badge_joinings_${activeUserId}`);

           let upgradedBadge: any = null;
           let upgradeTrack = "";

           // 1. Check Coins
           if (lastSavedCoinBadge) {
             const oldIndex = coinTiers.findIndex(b => b.name === lastSavedCoinBadge);
             if (coinInfo.index > oldIndex && oldIndex !== -1) {
               upgradedBadge = coinInfo.badge;
               upgradeTrack = "Coins & Points Economy";
             }
           } else {
             localStorage.setItem(`last_badge_coins_${activeUserId}`, coinInfo.badge.name);
           }

           // 2. Check Selections
           if (lastSavedSelectionBadge) {
             const oldIndex = selectionTiers.findIndex(b => b.name === lastSavedSelectionBadge);
             if (selectionInfo.index > oldIndex && oldIndex !== -1) {
               upgradedBadge = selectionInfo.badge;
               upgradeTrack = "Selected Candidate Milestones";
             }
           } else {
             localStorage.setItem(`last_badge_selections_${activeUserId}`, selectionInfo.badge.name);
           }

           // 3. Check Joinings
           if (lastSavedJoiningBadge) {
             const oldIndex = joiningTiers.findIndex(b => b.name === lastSavedJoiningBadge);
             if (joiningInfo.index > oldIndex && oldIndex !== -1) {
               upgradedBadge = joiningInfo.badge;
               upgradeTrack = "Joined Candidate Milestones";
             }
           } else {
             localStorage.setItem(`last_badge_joinings_${activeUserId}`, joiningInfo.badge.name);
           }

           if (upgradedBadge) {
             triggerCelebration(upgradedBadge, upgradeTrack, activeUserId);
           }
         }
      }
    } catch (e) {
      console.error("fetchEarnings error:", e);
    }
  };

  fetchEarningsRef.current = fetchEarnings;

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        // We have user! Now fetch gamification details to check for upgrades
        setTimeout(() => {
          fetchEarningsRef.current?.(data);
        }, 100);
      } else if (res.status === 403) {
        const data = await res.json();
        alert(data.error || "Your shift access timing is currently unavailable. Please login during your assigned shift window.");
        await fetch("/api/logout", { method: "POST" });
        window.location.href = "/login";
      } else {
        throw new Error("API failed");
      }
    } catch (err) {
      console.error(err);
      const active = localStorage.getItem("crm_active_user") || localStorage.getItem("givyansh_active_user");
      if (active) {
        try {
          setUser(JSON.parse(active));
        } catch (e) {
          console.error("Failed to parse active user JSON in AdminLayout", e);
        }
      }
    }
  };

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingPolicies = async () => {
    if (role === "superadmin" || role === "boss") return;
    try {
      const res = await fetch("/api/policies/pending");
      if (res.ok) {
        setPendingPolicies(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchNotifs();
    fetchPendingPolicies();

    const intervalNotifs = setInterval(fetchNotifs, 2000);
    const intervalUser = setInterval(fetchUser, 30000);
    
    const handleRefreshGamification = () => {
      fetchEarningsRef.current?.();
    };
    window.addEventListener("REFRESH_GAMIFICATION", handleRefreshGamification);

    const handleTestBadgeCelebration = () => {
      const resolvedUser = userRef.current;
      if (!resolvedUser) return;
      const isTLMode = role === "tl";
      const coinTiers = isTLMode ? TLTeamCoinBadges : RecruiterCoinBadges;
      const currentCoins = lifetimeEarningsRef.current || 0;
      const coinInfo = getBadgeIndexAndDetails(currentCoins, coinTiers);
      triggerCelebration(coinInfo.badge, "Coins & Points Economy (Test Run)", resolvedUser.id || resolvedUser.userId);
    };
    window.addEventListener("TEST_BADGE_CELEBRATION", handleTestBadgeCelebration);

    return () => {
      clearInterval(intervalNotifs);
      clearInterval(intervalUser);
      window.removeEventListener("REFRESH_GAMIFICATION", handleRefreshGamification);
      window.removeEventListener("TEST_BADGE_CELEBRATION", handleTestBadgeCelebration);
    };
  }, []);

  // Check badges again on tab change to capture immediate clicks
  useEffect(() => {
    if (user) {
      fetchEarningsRef.current?.(user);
    }
  }, [activeTab]);

  const handleNotifClick = async (notif: any) => {
    if (notif.type === 'meeting_invite') {
      try {
        let mId = null;
        if (notif.data) {
          const parsed = typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data;
          mId = parsed.meetingId;
        }
        if (mId) {
          const res = await fetch(`/api/meetings/${mId}/join`, { method: "POST" });
          if (res.ok) {
            localStorage.setItem("current_active_meeting_id", mId.toString());
            window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));
            await clearNotifs();
            fetchNotifs();
          }
        }
      } catch (e) {
        console.error("Error joining meeting from notification:", e);
      }
    }
  };

  const clearNotifs = async () => {
    try {
      await fetch("/api/notifications/clear", { method: "PUT" });
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = {
    superadmin: [
      { id: "dashboard", name: "Master Dashboard", icon: <LucideLayoutGrid size={18} />, href: "/superadmin/dashboard" },
      { id: "companies", name: "Company Directory", icon: <LucideBuilding2 size={18} />, href: "/superadmin/companies" },
      { id: "live-tracking", name: "Live Tracking Hub", icon: <LucideUsers size={18} />, href: "/superadmin/live-tracking" },
      { id: "audit-logs", name: "Audit Logs & Alerts", icon: <LucideShieldCheck size={18} />, href: "/superadmin/audit-logs" },
      { id: "pricing", name: "Pricing Console", icon: <LucideCreditCard size={18} />, href: "/superadmin/pricing" },
      { id: "inquiry", name: "Contact Queries", icon: <LucideMessageSquare size={18} />, href: "/superadmin/inquiry" },
    ],
    boss: [
      { id: "dashboard", name: "Dashboard", icon: <LucideLayoutDashboard size={18} />, href: "/dashboard/boss/dashboard" },
      { id: "meetings", name: "Schedule Meet", icon: <LucideCalendarDays size={18} />, href: "/dashboard/boss/meetings" },
      { id: "feedback", name: "Daily Feedback's", icon: <LucideMessageSquare size={18} />, href: "/dashboard/boss/feedback" },
      { id: "team", name: "Team", icon: <LucideShieldCheck size={18} />, href: "/dashboard/boss/team" },
      { id: "tasks", name: "Assign Task", icon: <LucideClipboardList size={18} />, href: "/dashboard/boss/tasks" },
      { id: "clients", name: "Clients", icon: <LucideBuilding2 size={18} />, href: "/dashboard/boss/clients" },
      { id: "jobs", name: "Job's", icon: <LucideBriefcase size={18} />, href: "/dashboard/boss/jobs" },
      { id: "sourcing", name: "Sourcing Hub", icon: <LucideSearch size={18} />, href: "/dashboard/boss/sourcing" },
      { id: "vendors", name: "Vendor's", icon: <LucideTruck size={18} />, href: "/dashboard/boss/vendors" },
      { id: "reports", name: "Report's", icon: <LucideFileBarChart size={18} />, href: "/dashboard/boss/reports" },
      { id: "reverts", name: "Candidate Reverts", icon: <LucideRefreshCw size={18} />, href: "/dashboard/boss/reverts" },
      { id: "leads", name: "Total Lead's", icon: <LucideFileText size={18} />, href: "/dashboard/boss/leads" },
      { id: "gifts", name: "Assign Gift's", icon: <LucideGift size={18} />, href: "/dashboard/boss/gifts" },
      { id: "announcements", name: "Annoucment's", icon: <LucideMegaphone size={18} />, href: "/dashboard/boss/announcements" },
      { id: "candidate-data", name: "Candidate's Data", icon: <LucideDatabase size={18} />, href: "/dashboard/boss/candidate-data" },
      { id: "attendance", name: "Attendance Hub", icon: <LucideCalendarDays size={18} />, href: "/dashboard/boss/attendance" },
      { id: "incentive", name: "Insentive Hub", icon: <LucideBanknote size={18} />, href: "/dashboard/boss/incentive" },
      { id: "todo", name: "My to do list", icon: <LucideCheckSquare size={18} />, href: "/dashboard/boss/todo" },
      { id: "policy", name: "Company Policy", icon: <LucideFileLock size={18} />, href: "/dashboard/boss/policy" },
      { id: "control", name: "Control Center", icon: <LucideCpu size={18} />, href: "/dashboard/boss/control" },
      { id: "settings", name: "Settings", icon: <LucideSettings size={18} />, href: "/dashboard/boss/settings" }
    ],
    recruiter: [
      { id: "dashboard", name: "Dashboard", icon: <LucideLayoutDashboard size={18} />, href: "/dashboard/recruiter/dashboard" },
      { id: "crm", name: "Add Candidate", icon: <LucideUsers size={18} />, href: "/dashboard/recruiter/crm" },
      { id: "jobs", name: "Job's", icon: <LucideBriefcase size={18} />, href: "/dashboard/recruiter/jobs" },
      { id: "clients", name: "Client's", icon: <LucideBuilding2 size={18} />, href: "/dashboard/recruiter/clients" },
      { id: "sourcing", name: "Sourcing Hub", icon: <LucideGlobe size={18} />, href: "/dashboard/recruiter/sourcing" },
      { id: "inbox", name: "Reporting AI", icon: <LucideMail size={18} />, href: "/dashboard/recruiter/inbox" },
      { id: "reverts", name: "Candidate Reverts", icon: <LucideRefreshCw size={18} />, href: "/dashboard/recruiter/reverts" },
      { id: "leads", name: "Lead Data", icon: <LucideDatabase size={18} />, href: "/dashboard/recruiter/leads" },
      { id: "my-data", name: "My Data", icon: <LucideFileText size={18} />, href: "/dashboard/recruiter/my-data" },
      { id: "todo", name: "My To Do List", icon: <LucideCheckSquare size={18} />, href: "/dashboard/recruiter/todo" },
      { id: "tasks", name: "My Task's", icon: <LucideClipboardList size={18} />, href: "/dashboard/recruiter/tasks" },
      { id: "attendance", name: "My Attendance", icon: <LucideCalendarDays size={18} />, href: "/dashboard/recruiter/attendance" },
      { id: "performance", name: "My Performance", icon: <LucideTrendingUp size={18} />, href: "/dashboard/recruiter/performance" },
      { id: "vendors", name: "My Vendor's", icon: <LucideTruck size={18} />, href: "/dashboard/recruiter/vendors" },
      { id: "earned-gifts", name: "Earned Gifts", icon: <LucideGift size={18} />, href: "/dashboard/recruiter/earned-gifts" },
      { id: "incentives", name: "Incentives", icon: <LucideBanknote size={18} />, href: "/dashboard/recruiter/incentives" },
      { id: "meetings", name: "Meeting's", icon: <LucideCalendarDays size={18} />, href: "/dashboard/recruiter/meetings" },
      { id: "feedback", name: "Feedback", icon: <LucideMessageSquare size={18} />, href: "/dashboard/recruiter/feedback" }
    ],
    tl: [
      { id: "dashboard", name: "Dashboard", icon: <LucideLayoutDashboard size={18} />, href: "/dashboard/tl/dashboard" },
      { id: "meetings", name: "Schedule Meet", icon: <LucideCalendarDays size={18} />, href: "/dashboard/tl/meetings" },
      { id: "crm", name: "Add Candidate", icon: <LucideUsers size={18} />, href: "/dashboard/tl/crm" },
      { id: "tasks", name: "Assign Task's", icon: <LucideClipboardList size={18} />, href: "/dashboard/tl/tasks" },
      { id: "team", name: "Team", icon: <LucideShieldCheck size={18} />, href: "/dashboard/tl/team" },
      { id: "clients", name: "Client", icon: <LucideBuilding2 size={18} />, href: "/dashboard/tl/clients" },
      { id: "jobs", name: "Job's", icon: <LucideBriefcase size={18} />, href: "/dashboard/tl/jobs" },
      { id: "sourcing", name: "Sourcing Hub", icon: <LucideGlobe size={18} />, href: "/dashboard/tl/sourcing" },
      { id: "reports", name: "Report's", icon: <LucideFileBarChart size={18} />, href: "/dashboard/tl/reports" },
      { id: "inbox", name: "Reporting AI", icon: <LucideMail size={18} />, href: "/dashboard/tl/inbox" },
      { id: "reverts", name: "Candidate Reverts", icon: <LucideRefreshCw size={18} />, href: "/dashboard/tl/reverts" },
      { id: "vendors", name: "Vendor's Managment", icon: <LucideTruck size={18} />, href: "/dashboard/tl/vendors" },
      { id: "team-leads", name: "Team Lead Data", icon: <LucideUsers size={18} />, href: "/dashboard/tl/team-leads" },
      { id: "announcements", name: "Team Annauncment's", icon: <LucideMegaphone size={18} />, href: "/dashboard/tl/announcements" },
      { id: "todo", name: "My to do List", icon: <LucideCheckCircle2 size={18} />, href: "/dashboard/tl/todo" },
      { id: "team-data", name: "Team Candidate's Data", icon: <LucideDatabase size={18} />, href: "/dashboard/tl/team-data" },
      { id: "attendance", name: "My Attendance", icon: <LucideCalendarDays size={18} />, href: "/dashboard/tl/attendance" },
      { id: "performance", name: "My Performance", icon: <LucideTrendingUp size={18} />, href: "/dashboard/tl/performance" },
      { id: "earned-gifts", name: "Earned Gifts", icon: <LucideGift size={18} />, href: "/dashboard/tl/earned-gifts" },
      { id: "incentives", name: "Incentives", icon: <LucideBanknote size={18} />, href: "/dashboard/tl/incentives" },
      { id: "feedback", name: "Daily Feedbacks", icon: <LucideMessageSquare size={18} />, href: "/dashboard/tl/feedback" }
    ],
    manager: [
      { id: "dashboard", name: "Dashboard", icon: <LucideLayoutDashboard size={18} />, href: "/dashboard/manager/dashboard" },
      { id: "meetings", name: "Schedule Meet", icon: <LucideCalendarDays size={18} />, href: "/dashboard/manager/meetings" },
      { id: "team", name: "Team", icon: <LucideShieldCheck size={18} />, href: "/dashboard/manager/team" },
      { id: "tasks", name: "Assign Task", icon: <LucideClipboardList size={18} />, href: "/dashboard/manager/tasks" },
      { id: "clients", name: "Clients", icon: <LucideBuilding2 size={18} />, href: "/dashboard/manager/clients" },
      { id: "jobs", name: "Job's", icon: <LucideBriefcase size={18} />, href: "/dashboard/manager/jobs" },
      { id: "sourcing", name: "Sourcing Hub", icon: <LucideSearch size={18} />, href: "/dashboard/manager/sourcing" },
      { id: "vendors", name: "Vendor's", icon: <LucideTruck size={18} />, href: "/dashboard/manager/vendors" },
      { id: "reports", name: "Report's", icon: <LucideFileBarChart size={18} />, href: "/dashboard/manager/reports" },
      { id: "inbox", name: "Reporting AI", icon: <LucideMail size={18} />, href: "/dashboard/manager/inbox" },
      { id: "reverts", name: "Candidate Reverts", icon: <LucideRefreshCw size={18} />, href: "/dashboard/manager/reverts" },
      { id: "leads", name: "Total Lead's", icon: <LucideFileText size={18} />, href: "/dashboard/manager/leads" },
      { id: "gifts", name: "Gift's", icon: <LucideGift size={18} />, href: "/dashboard/manager/gifts" },
      { id: "announcements", name: "Annoucment's", icon: <LucideMegaphone size={18} />, href: "/dashboard/manager/announcements" },
      { id: "candidate-data", name: "Candidate's Data", icon: <LucideDatabase size={18} />, href: "/dashboard/manager/candidate-data" },
      { id: "attendance", name: "My Attendance", icon: <LucideCalendarDays size={18} />, href: "/dashboard/manager/attendance" },
      { id: "performance", name: "My Performance", icon: <LucideTrendingUp size={18} />, href: "/dashboard/manager/performance" },
      { id: "incentive", name: "Insentive Hub", icon: <LucideBanknote size={18} />, href: "/dashboard/manager/incentive" },
      { id: "todo", name: "My to do list", icon: <LucideCheckSquare size={18} />, href: "/dashboard/manager/todo" },
      { id: "policy", name: "Company Policy", icon: <LucideFileLock size={18} />, href: "/dashboard/manager/policy" },
      { id: "feedback", name: "Daily Feedbacks", icon: <LucideMessageSquare size={18} />, href: "/dashboard/manager/feedback" }
    ]
  };

  const navItems = menuItems[role as keyof typeof menuItems] || menuItems.recruiter;
  const isLightTheme = role === "superadmin" || role === "boss" || role === "recruiter" || role === "tl" || role === "manager";

  const dashboardLink = role === "superadmin" ? "/superadmin/dashboard" : `/dashboard/${role}/dashboard`;

  return (
    <div className={`admin-layout ${isLightTheme ? "light-theme" : ""}`}>
      <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""} ${isLightTheme ? "light" : ""}`}>
        <div className="sidebar-header" style={{ padding: "20px 16px" }}>
          <Link to={dashboardLink} className="sidebar-logo" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isCollapsed ? (
              <img
                src="/images/favicon_sidebar.png"
                alt="Icon Logo"
                style={{
                  height: "38px",
                  width: "auto",
                  objectFit: "contain",
                  transition: "all 0.3s ease"
                }}
              />
            ) : (
              <img
                src="/images/crm_logo.png"
                alt="Full CRM Logo"
                style={{
                  height: "50px",
                  width: "auto",
                  objectFit: "contain",
                  transition: "all 0.3s ease"
                }}
              />
            )}
          </Link>
          <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <LucideChevronRight size={18} /> : <LucideChevronLeft size={18} />}
          </button>
        </div>

        <div style={{ padding: "0 20px", marginBottom: "10px" }}>
          {!isCollapsed && role === "superadmin" && (
            <>
              <h3 style={{ fontSize: "0.8rem", fontWeight: "900", color: "#0f172a", marginBottom: "4px" }}>Master Modules</h3>
              <p style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: "600", letterSpacing: "1px" }}>PLATFORM_CONTROL_NODE</p>
            </>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = activeTab ? activeTab === item.id : location.pathname === item.href;

            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => {
                  if (onTabChange && item.id) {
                    onTabChange(item.id);
                  }
                  if ((window as any).markSectionSeen) {
                    (window as any).markSectionSeen(item.id);
                  }
                }}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                style={{ position: "relative" }}
              >
                <span className="link-icon-wrap">{item.icon}</span>
                {!isCollapsed && <span>{item.name}</span>}
                {hasUnread[item.id] && (
                  <span style={{
                    position: "absolute",
                    top: "50%",
                    right: isCollapsed ? "8px" : "16px",
                    transform: "translateY(-50%)",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#ef4444",
                    boxShadow: "0 0 8px #ef4444",
                    zIndex: 10
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={(e) => {
              if (role !== "boss" && role !== "superadmin") {
                e.preventDefault();
                attendanceRef.current?.initiateLogout();
              } else {
                window.location.href = "/login";
              }
            }} 
            className="sidebar-link logout-btn"
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            <span className="link-icon-wrap" style={{ background: "rgba(239,68,68,0.08)" }}><LucideLogOut size={18} /></span>
            {!isCollapsed && <span>System Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN COMMAND INTERFACE */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <div className="search-bar">
              <LucideSearch size={18} color="#64748b" />
              <input type="text" placeholder="Global Candidate Search..." />
            </div>
          </div>

          <div className="header-right" style={{ position: "relative", display: "flex", alignItems: "center", gap: "15px" }}>
            
            {/* GAMIFICATION COINS BUBBLE */}
            {(role === "recruiter" || role === "tl" || role === "manager") && (
              <div 
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "6px 12px", borderRadius: "20px", cursor: "pointer" }}
                onClick={() => {
                  if (onTabChange) {
                    onTabChange("performance");
                    setTimeout(() => {
                      window.history.pushState(null, "", window.location.pathname + "?view=wallet");
                      window.dispatchEvent(new Event("popstate"));
                    }, 50);
                  } else {
                    window.location.href = `/dashboard/${role}/performance?view=wallet`;
                  }
                }}
              >
                <LucideCoins size={16} color="#d97706" />
                <span style={{ fontWeight: 800, color: "#b45309", fontSize: "0.9rem" }}>{lifetimeEarnings.toFixed(1)} CR</span>
              </div>
            )}

            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", position: "relative", padding: "8px" }}
            >
                <LucideBell size={20} />
                {unreadCount > 0 && (
                    <span style={{ 
                        position: "absolute", 
                        top: "2px", 
                        right: "2px", 
                        background: "#ef4444", 
                        color: "white", 
                        fontSize: "0.6rem", 
                        fontWeight: "900", 
                        borderRadius: "50%", 
                        width: "14px", 
                        height: "14px", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        border: "2px solid white" 
                    }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* NOTIFICATION PANEL */}
            <AnimatePresence>
                {isNotifOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            marginTop: "12px",
                            width: "320px",
                            background: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(12px)",
                            borderRadius: "16px",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                            border: "1px solid rgba(255,255,255,0.5)",
                            zIndex: 1000,
                            padding: "16px",
                            maxHeight: "450px",
                            overflowY: "auto"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#0f172a", fontWeight: "800" }}>Command Alerts</h4>
                            <button 
                                onClick={clearNotifs}
                                style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer" }}
                            >
                                Mark all as read
                            </button>
                        </div>

                        {notifications.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8", fontSize: "0.8rem" }}>
                                <LucideCheckCircle2 size={32} style={{ opacity: 0.3, marginBottom: "8px" }} />
                                <p>No critical alerts detected.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {notifications.map((notif: any) => {
                                    const isMeetInvite = notif.type === 'meeting_invite';
                                    return (
                                        <div 
                                            key={notif.id}
                                            onClick={() => handleNotifClick(notif)}
                                            style={{ 
                                                padding: "10px", 
                                                borderRadius: "10px", 
                                                background: isMeetInvite ? "rgba(37, 99, 235, 0.08)" : "rgba(255,255,255,0.5)", 
                                                border: isMeetInvite ? "1px solid rgba(37, 99, 235, 0.2)" : "1px solid #f1f5f9",
                                                cursor: isMeetInvite ? "pointer" : "default"
                                            }}
                                        >
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <div style={{ 
                                                width: "8px", 
                                                height: "8px", 
                                                borderRadius: "50%", 
                                                background: notif.type === 'task_assigned' ? '#2563eb' : '#10b981',
                                                marginTop: "4px"
                                            }}></div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "700", color: "#1e293b" }}>{notif.title}</p>
                                                <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#64748b", lineHeight: 1.3 }}>{notif.message}</p>
                                                <span style={{ fontSize: "0.6rem", color: "#94a3b8", display: "block", marginTop: "4px" }}>
                                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <Link to={role === "superadmin" ? "/superadmin/dashboard" : `/dashboard/${role}/profile`} className="user-profile" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="user-avatar">{(userName?.[0] || 'U')}</div>
              <div className="user-info">
                <strong>{userName}</strong>
                <span>{role.toUpperCase()}</span>
              </div>
            </Link>
          </div>
        </header>

        <section className="admin-content">
          {children}
        </section>
      </main>
      <TaskNotificationOverlay />
      <InstantMeetingOverlay currentUser={user} role={role} />
      <AttendanceTracker ref={attendanceRef} role={role} userId={user?.id} shift={user?.shift} />
      {pendingPolicies.length > 0 && (
        <PolicyAcknowledgementPopup
          pendingPolicies={pendingPolicies}
          onComplete={() => setPendingPolicies([])}
        />
      )}

      {/* Screen Stuck Blocker during shake */}
      {isScreenShaking && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999999,
          cursor: "wait",
          background: "transparent",
          pointerEvents: "auto"
        }} />
      )}

      {/* Achievement unlocked celebration modal */}
      <AnimatePresence>
        {celebrationBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setCelebrationBadge(null);
              setCelebrationTrack("");
              setCelebratingUserId("");
            }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(6px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999999,
              fontFamily: "'Outfit', sans-serif",
              color: "white",
              cursor: "pointer"
            }}
          >
            {/* Glowing particle lights */}
            <div style={{ 
              position: "absolute", 
              width: "500px", 
              height: "500px", 
              background: `radial-gradient(circle, ${celebrationBadge.color}33 0%, rgba(0,0,0,0) 70%)`, 
              borderRadius: "50%", 
              zIndex: 0 
            }} />

            <div style={{ zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <div 
                className="gaming-glow-text" 
                style={{ 
                  fontSize: "1.8rem", 
                  fontWeight: 950, 
                  letterSpacing: "-1px", 
                  textTransform: "uppercase",
                  color: "#eab308",
                  lineHeight: "1.2",
                  textShadow: `0 0 8px ${celebrationBadge.color}`
                }}
              >
                Congratulation!!<br />
                <span style={{ fontSize: "1.2rem", color: "white", fontWeight: 800 }}>New Achievment Earned</span>
              </div>

              {/* Dynamic Gaming Badge Card */}
              <div 
                className="gaming-badge-card" 
                style={{ 
                  '--badge-color': celebrationBadge.color,
                  '--glow-color': celebrationBadge.color,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                } as React.CSSProperties}
              >
                <div className="celebration-neon-glow-emblem">
                  <GlowingEmblem icon={celebrationBadge.icon} color={celebrationBadge.color} size="82px" />
                </div>
                <span className="gaming-badge-title" style={{ marginTop: "12px", fontSize: "0.95rem" }}>{celebrationBadge.name}</span>
              </div>

              <div style={{ maxWidth: "340px" }}>
                <p style={{ fontSize: "0.75rem", color: "#cbd5e1", marginTop: "4px", fontWeight: 500 }}>Unlocks at milestone: {celebrationBadge.min} units</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeMeetingRoomId && (
        <>
          <style>{`
            .fullscreen-meeting-window {
              transform: none !important;
              top: 0px !important;
              left: 0px !important;
              right: 0px !important;
              bottom: 0px !important;
              width: 100vw !important;
              height: 100vh !important;
              border-radius: 0px !important;
              border: none !important;
            }
          `}</style>
          {/* Floating meeting window is always mounted, draggable and resizable */}
          <motion.div
            key="floating-meeting-window"
            ref={floatingWindowRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            drag={!isMeetingExpanded}
            dragMomentum={false}
            dragControls={dragControls}
            dragListener={false}
            className={isMeetingExpanded ? "fullscreen-meeting-window" : ""}
            style={{
              position: "fixed",
              top: isMeetingExpanded ? "0px" : "auto",
              left: isMeetingExpanded ? "0px" : "auto",
              bottom: isMeetingExpanded ? "0px" : "20px",
              right: isMeetingExpanded ? "0px" : "20px",
              width: isMeetingPip ? "340px" : isMeetingExpanded ? "100vw" : meetingWidth,
              height: isMeetingPip ? "250px" : isMeetingExpanded ? "100vh" : meetingHeight,
              transform: isMeetingExpanded ? "none" : undefined,
              background: "#020617",
              borderRadius: isMeetingExpanded ? "0px" : "16px",
              border: isMeetingExpanded ? "none" : "2px solid #334155",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
              zIndex: 99999,
              opacity: 1,
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* Floating Header */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              style={{
                background: "#0f172a",
                padding: "10px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "grab",
                borderBottom: "1px solid #1e293b",
                userSelect: "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1.2s infinite" }}></span>
                <span style={{ fontSize: "0.78rem", fontWeight: 800 }}>Live Meeting Screen</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={() => {
                    const nextPip = !isMeetingPip;
                    setIsMeetingPip(nextPip);
                    localStorage.setItem("is_meeting_pip", String(nextPip));
                    setIsMeetingExpanded(false);
                    localStorage.setItem("is_meeting_expanded", "false");
                  }}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "4px 8px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  {isMeetingPip ? "Expand" : "PIP (Min)"}
                </button>

                <button
                  onClick={() => {
                    const nextExpanded = !isMeetingExpanded;
                    setIsMeetingExpanded(nextExpanded);
                    localStorage.setItem("is_meeting_expanded", String(nextExpanded));
                    setIsMeetingPip(false);
                    localStorage.setItem("is_meeting_pip", "false");
                  }}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "4px 8px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  {isMeetingExpanded ? "Normal" : "Full Screen"}
                </button>
              </div>
            </div>

            {/* Floating Body */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              <MeetingRoom
                meetingId={activeMeetingRoomId}
                currentUser={user}
                role={role}
                isPip={isMeetingPip}
                crmActiveTab={activeTab}
                isSharingCRM={isSharingCRM}
                onLeave={() => {
                  localStorage.removeItem("current_active_meeting_id");
                  localStorage.removeItem("is_sharing_crm");
                  localStorage.removeItem("is_meeting_pip");
                  localStorage.removeItem("is_meeting_expanded");
                  setIsMeetingPip(false);
                  setIsMeetingExpanded(false);
                  setActiveMeetingRoomId(null);
                  setIsSharingCRM(false);
                  window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));
                }}
              />
            </div>

            {/* Draggable Resize Handle */}
            {!isMeetingPip && !isMeetingExpanded && (
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startW = floatingWindowRef.current?.offsetWidth || 780;
                  const startH = floatingWindowRef.current?.offsetHeight || 540;
                  const onMouseMove = (me: MouseEvent) => {
                    const newW = Math.max(420, startW + (me.clientX - startX));
                    const newH = Math.max(300, startH + (me.clientY - startY));
                    setMeetingWidth(`${newW}px`);
                    setMeetingHeight(`${newH}px`);
                  };
                  const onMouseUp = () => {
                    window.removeEventListener("mousemove", onMouseMove);
                    window.removeEventListener("mouseup", onMouseUp);
                  };
                  window.addEventListener("mousemove", onMouseMove);
                  window.addEventListener("mouseup", onMouseUp);
                }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "20px",
                  height: "20px",
                  cursor: "se-resize",
                  background: "transparent",
                  zIndex: 10
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ position: "absolute", bottom: "3px", right: "3px" }}>
                  <path d="M 2 12 L 12 2 M 6 12 L 12 6 M 10 12 L 12 10" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </motion.div>
        </>
      )}

      {role !== "superadmin" && (
        <FloatingChat user={user} role={role} />
      )}
    </div>
  );
}
