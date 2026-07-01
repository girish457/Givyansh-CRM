import React, { useState, useEffect } from "react";
import { 
  LucidePlus, 
  LucideTrash2, 
  LucidePencil, 
  LucideClock, 
  LucideSave, 
  LucideX, 
  LucideUsers, 
  LucideCpu, 
  LucideCheckCircle2, 
  LucideActivity, 
  LucideAward,
  LucideAlertCircle, 
  LucideShieldCheck, 
  LucideSliders, 
  LucideCoffee, 
  LucideChevronRight, 
  LucideFilter,
  LucideVideo,
  LucideLogIn,
  LucideLogOut,
  LucideLoader2
} from "lucide-react";
import BossMeetingControlCenter from "./BossMeetingControlCenter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RecruiterCoinBadges, RecruiterSelectionBadges, RecruiterJoiningBadges,
  TLTeamCoinBadges, TLTeamSelectionBadges, TLTeamJoiningBadges
} from "../../utils/gamification";

// Glowing game badge emblem
const GlowingEmblem = ({ icon, color, size = "80px" }: { icon: string; color: string; size?: string }) => {
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

interface Shift {
  id?: number;
  name: string;
  startTime: string;
  endTime: string;
  requiredHours: string;
  lunchStartTime: string;
  lunchEndTime: string;
  earlyLoginAllowed: number; // stored in minutes
  postShiftAllowed: number;  // stored in minutes
  startDate?: string;
  endDate?: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  shiftId: number | null;
  shift?: Shift | null;
}

export default function ControlCenter() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceToday, setAttendanceToday] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"shifts" | "allotment" | "gamification" | "meetings">("shifts");

  // Modal / Shift Form State
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState<Shift>({
    name: "",
    startTime: "10:00",
    endTime: "18:00",
    requiredHours: "8",
    lunchStartTime: "13:30",
    lunchEndTime: "14:00",
    earlyLoginAllowed: 60, // 1 hour
    postShiftAllowed: 120, // 2 hours
    startDate: "",
    endDate: ""
  });

  // Modal Employee Assignment State
  const [modalSelectedEmployeeIds, setModalSelectedEmployeeIds] = useState<number[]>([]);
  const [modalSearchText, setModalSearchText] = useState("");
  const [modalRoleFilter, setModalRoleFilter] = useState<"all" | "manager" | "tl" | "recruiter">("all");

  // Allotment Form State
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchEmployee, setSearchEmployee] = useState<string>("");

  // Gamification Economy Config State
  const [economyConfig, setEconomyConfig] = useState<any>({
    register: 0.30,
    connected: 0.2,
    notConnected: -0.3,
    interested: 0.3,
    notInterested: 0.1,
    statusNotInterested: -5,
    goForInterview: 7,
    interviewDone: 8,
    interviewNotDone: -0.5,
    callNotPick: -0.5,
    selected: 10,
    rejected: -7,
    joined: 18,
    dropped: -20,
    vendorCreated: 10,
    leadCreated: 2,
    leadForwarded: 10,
    taskCompleted: 10,

    // Monthly Recruiter
    monthly26DaysPresent: 30,
    monthlyAvgWorkHours: 40,
    monthlyOvertime: 10,
    monthlyAbsentPenalty: -10,
    monthlyLatePenalty: -10,
    monthlyEarlyBonus: 10,

    // TL / Manager
    teamSelection: 5,
    teamJoining: 8,
    teamDropped: -10,
    activeRecruiterDay: 1,
    eightyPercentActive: 1,
    teamTaskCompletion: 10,
    teamAvgLatePenalty: -20,
    teamPoorAttendancePenalty: -20,

    enableCoins: true,
    enablePenalties: true,

    // Badge lists
    recruiterCoinBadges: RecruiterCoinBadges,
    tlCoinBadges: TLTeamCoinBadges,
    recruiterSelectionBadges: RecruiterSelectionBadges,
    recruiterJoiningBadges: RecruiterJoiningBadges,
    tlTeamSelectionBadges: TLTeamSelectionBadges,
    tlTeamJoiningBadges: TLTeamJoiningBadges
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/settings/gamification", {
      headers: {
        "Authorization": `Bearer ${token || ""}`
      }
    })
      .then(r => r.json())
      .then((data: any) => {
        if (data && Object.keys(data).length > 0) {
          setEconomyConfig((prev: any) => ({
            ...prev,
            ...data,
            recruiterCoinBadges: data.recruiterCoinBadges || prev.recruiterCoinBadges,
            tlCoinBadges: data.tlCoinBadges || prev.tlCoinBadges,
            recruiterSelectionBadges: data.recruiterSelectionBadges || prev.recruiterSelectionBadges,
            recruiterJoiningBadges: data.recruiterJoiningBadges || prev.recruiterJoiningBadges,
            tlTeamSelectionBadges: data.tlTeamSelectionBadges || prev.tlTeamSelectionBadges,
            tlTeamJoiningBadges: data.tlTeamJoiningBadges || prev.tlTeamJoiningBadges
          }));
        }
      })
      .catch(e => console.error(e));
  }, []);

  const saveEconomyConfig = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/settings/gamification", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`
        },
        body: JSON.stringify(economyConfig)
      });
      if (!res.ok) {
        throw new Error("Failed to save: " + res.statusText);
      }
      showToast("Gamification economy variables synchronized across all active nodes.", "success");
    } catch(e) {
      showToast("Failed to save gamification economy", "error");
    }
  };

  // Gamification milestone configurator state & helpers
  const [selectedMilestoneTrack, setSelectedMilestoneTrack] = useState<string>("recruiterCoinBadges");
  const [newMilestoneForm, setNewMilestoneForm] = useState({
    name: "",
    min: 0,
    icon: "🏆",
    color: "#f59e0b"
  });

  const handleAddMilestone = () => {
    if (!newMilestoneForm.name) return alert("Please specify a badge name.");
    const trackList = [...(economyConfig[selectedMilestoneTrack] || [])];
    trackList.push({
      name: newMilestoneForm.name,
      min: Number(newMilestoneForm.min) || 0,
      icon: newMilestoneForm.icon || "🏆",
      color: newMilestoneForm.color || "#cbd5e1"
    });
    trackList.sort((a: any, b: any) => a.min - b.min);
    setEconomyConfig({
      ...economyConfig,
      [selectedMilestoneTrack]: trackList
    });
    setNewMilestoneForm({ name: "", min: 0, icon: "🏆", color: "#f59e0b" });
  };

  const handleDeleteMilestone = (trackKey: string, badgeName: string) => {
    if (!window.confirm(`Are you sure you want to delete badge: "${badgeName}"?`)) return;
    const trackList = (economyConfig[trackKey] || []).filter((b: any) => b.name !== badgeName);
    setEconomyConfig({
      ...economyConfig,
      [trackKey]: trackList
    });
  };

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false,
    msg: "",
    type: "success"
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, msg, type });
  };

  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  useEffect(() => {
    syncAllData();
    const interval = setInterval(syncAllData, 15000);
    return () => clearInterval(interval);
  }, []);

  const syncAllData = async () => {
    try {
      const [shiftsRes, employeesRes, attendanceRes] = await Promise.all([
        fetch("/api/shifts").catch(e => null),
        fetch("/api/shifts/employees").catch(e => null),
        fetch(`/api/attendance/hub?date=${new Date().toISOString().split('T')[0]}`).catch(e => null)
      ]);

      if (shiftsRes && shiftsRes.ok) {
        const shiftsData = await shiftsRes.json();
        setShifts(Array.isArray(shiftsData) ? shiftsData : []);
      } else {
        console.warn("Failed to fetch shifts", shiftsRes?.status);
      }

      if (employeesRes && employeesRes.ok) {
        const employeesData = await employeesRes.json();
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      } else {
        console.warn("Failed to fetch employees", employeesRes?.status);
      }

      if (attendanceRes && attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendanceToday(Array.isArray(attendanceData) ? attendanceData : []);
      } else {
        console.warn("Failed to fetch attendance today", attendanceRes?.status);
      }
    } catch (err) {
      console.error("Failed to sync Control Center datasets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingShift ? "PUT" : "POST";
    const url = editingShift ? `/api/shifts/${editingShift.id}` : "/api/shifts";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          earlyLoginAllowed: parseInt(formData.earlyLoginAllowed as any) || 60,
          postShiftAllowed: parseInt(formData.postShiftAllowed as any) || 120,
          employeeIds: modalSelectedEmployeeIds
        })
      });
      if (res.ok) {
        showToast(editingShift ? "Shift timings altered successfully!" : "New enterprise shift established!", "success");
        setShowModal(false);
        setEditingShift(null);
        syncAllData();
      } else {
        const data = await res.json();
        showToast(data.error || "Uplink failed.", "error");
      }
    } catch (err) {
      showToast("Timing save aborted due to connection loss.", "error");
    }
  };

  const handleDeleteShift = async (id: number) => {
    if (!window.confirm("CRITICAL WARNING: Deleting this shift will instantly de-assign all mapped employees. Proceed?")) return;
    try {
      const res = await fetch(`/api/shifts/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Shift deleted and associated workforce unmapped.", "success");
        syncAllData();
      } else {
        showToast("Access denied or transaction failed.", "error");
      }
    } catch (err) {
      showToast("Network failure.", "error");
    }
  };

  const handleAllotShift = async () => {
    if (selectedEmployeeIds.length === 0) {
      return showToast("Please select at least one employee node.", "error");
    }

    try {
      const res = await fetch("/api/shifts/allot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeIds: selectedEmployeeIds,
          shiftId: selectedShiftId ? parseInt(selectedShiftId) : null
        })
      });

      if (res.ok) {
        showToast(`Workforce shifts reassigned for ${selectedEmployeeIds.length} employees!`, "success");
        setSelectedEmployeeIds([]);
        syncAllData();
      } else {
        showToast("Bulk allotment process failed.", "error");
      }
    } catch (err) {
      showToast("Could not contact server.", "error");
    }
  };

  // Helper calculation functions
  const getShiftStatus = (shift: Shift) => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const [sh, sm] = shift.startTime.split(":").map(Number);
    const startMins = sh * 60 + sm;

    const [eh, em] = shift.endTime.split(":").map(Number);
    let endMins = eh * 60 + em;

    if (endMins < startMins) {
      // Overnight shift
      if (currentMins >= startMins || currentMins <= endMins) return "running";
      const upcomingDiff = startMins - currentMins;
      if (upcomingDiff > 0 && upcomingDiff < 180) return "upcoming";
      return "completed";
    } else {
      if (currentMins >= startMins && currentMins <= endMins) return "running";
      if (currentMins < startMins && startMins - currentMins < 180) return "upcoming";
      return "completed";
    }
  };

  const formatBufferTime = (mins: number) => {
    const hours = mins / 60;
    if (hours === 1) return "1 Hour";
    if (hours % 1 === 0) return `${hours} Hours`;
    return `${hours.toFixed(1)} Hours`;
  };

  const calculateWorkingHours = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return "8";
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return "8";

    const startMins = sh * 60 + sm;
    let endMins = eh * 60 + em;
    if (endMins < startMins) {
      endMins += 24 * 60; // Overnight shift
    }
    const diffMins = endMins - startMins;
    const hours = diffMins / 60;
    return parseFloat(hours.toFixed(2)).toString();
  };

  // Online count check
  const getOnlineCount = () => {
    return employees.filter(emp => {
      const att = attendanceToday.find(a => String(a.userId) === String(emp.id));
      if (!att) return false;
      // If there is an active log session without logoutTime
      return att.logs && att.logs.some((l: any) => !l.logoutTime);
    }).length;
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesRole = filterRole === "all" || emp.role?.toLowerCase() === filterRole.toLowerCase();
    const matchesSearch = emp.name.toLowerCase().includes(searchEmployee.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchEmployee.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const modalFilteredEmployees = employees.filter(emp => {
    const roleMatches = modalRoleFilter === "all" || emp.role?.toLowerCase() === modalRoleFilter.toLowerCase();
    const searchMatches = emp.name.toLowerCase().includes(modalSearchText.toLowerCase()) || 
                          emp.email.toLowerCase().includes(modalSearchText.toLowerCase());
    const isEmployeeRole = emp.role && ["manager", "tl", "recruiter"].includes(emp.role.toLowerCase());
    return isEmployeeRole && roleMatches && searchMatches;
  });

  const getEmployeesForShift = (shiftId?: number) => {
    return employees.filter(e => e.shiftId === shiftId);
  };

  const isEmployeeOnline = (empId: number) => {
    const att = attendanceToday.find(a => String(a.userId) === String(empId));
    if (!att) return false;
    return att.logs && att.logs.some((l: any) => !l.logoutTime);
  };

  if (loading) {
    return (
      <div style={{ height: "450px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 700 }}>Synchronizing Shift Governance Node...</span>
      </div>
    );
  }

  const onlineCount = getOnlineCount();
  const totalEmployeesWithShift = employees.filter(e => e.shiftId !== null).length;
  const shiftUtilization = employees.length > 0 ? Math.round((totalEmployeesWithShift / employees.length) * 100) : 0;

  return (
    <div className="control-center p-large" style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{ 
              position: "fixed", 
              bottom: "24px", 
              right: "24px", 
              zIndex: 100000, 
              background: toast.type === "success" ? "#10b981" : "#ef4444", 
              color: "#fff", 
              padding: "12px 24px", 
              borderRadius: "16px", 
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: 800
            }}
          >
            {toast.type === "success" ? <LucideCheckCircle2 size={20} /> : <LucideAlertCircle size={20} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="dash-header mb-large flex-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px", marginBottom: "30px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Shift & Security </span>
            <span style={{ color: "#2563eb" }}>Command</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Create timed shifts, define strict early/post buffers, bulk assign workforce, and force real-time session autologouts.</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "14px", border: "1.5px solid #e2e8f0" }}>
          <button
            onClick={() => setActiveTab("shifts")}
            style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "10px", border: "none", fontSize: "0.88rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", background: activeTab === "shifts" ? "white" : "transparent", color: activeTab === "shifts" ? "#2563eb" : "#64748b", boxShadow: activeTab === "shifts" ? "0 4px 10px rgba(0,0,0,0.06)" : "none" }}
          >
            <LucideSliders size={16} /> Shifts Governance
          </button>
          <button
            onClick={() => setActiveTab("allotment")}
            style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "10px", border: "none", fontSize: "0.88rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", background: activeTab === "allotment" ? "white" : "transparent", color: activeTab === "allotment" ? "#2563eb" : "#64748b", boxShadow: activeTab === "allotment" ? "0 4px 10px rgba(0,0,0,0.06)" : "none" }}
          >
            <LucideUsers size={16} /> Workforce Allotment
          </button>
          <button
            onClick={() => setActiveTab("gamification")}
            style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "10px", border: "none", fontSize: "0.88rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", background: activeTab === "gamification" ? "white" : "transparent", color: activeTab === "gamification" ? "#2563eb" : "#64748b", boxShadow: activeTab === "gamification" ? "0 4px 10px rgba(0,0,0,0.06)" : "none" }}
          >
            <LucideActivity size={16} /> Gamification Engine
          </button>
          <button
            onClick={() => setActiveTab("meetings")}
            style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "10px", border: "none", fontSize: "0.88rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", background: activeTab === "meetings" ? "white" : "transparent", color: activeTab === "meetings" ? "#2563eb" : "#64748b", boxShadow: activeTab === "meetings" ? "0 4px 10px rgba(0,0,0,0.06)" : "none" }}
          >
            <LucideVideo size={16} /> Meetings Config
          </button>
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "30px" }}>
        {/* Shifts Count */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #e0f2fe 0%, #38bdf820 100%)", color: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideCpu size={24} /></div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Configured Shifts</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1e293b", marginTop: "2px" }}>{shifts.length}</div>
          </div>
        </div>

        {/* Active Shifts */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #f5f3ff 0%, #a78bfa20 100%)", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideClock size={24} /></div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Active Shifts Mapped</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#7c3aed", marginTop: "2px" }}>{shifts.filter(s => getEmployeesForShift(s.id).length > 0).length}</div>
          </div>
        </div>

        {/* Online Count */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #dcfce7 0%, #4ade8020 100%)", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideActivity size={22} /></div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Workforce Online</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#16a34a", marginTop: "2px" }}>{onlineCount} <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>/ {employees.length}</span></div>
          </div>
        </div>

        {/* Shift Utilization */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #fffbeb 0%, #fde04720 100%)", color: "#eab308", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideShieldCheck size={24} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Workforce Allocated</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#eab308" }}>{shiftUtilization}%</div>
              <div style={{ flex: 1, height: "6px", background: "#fef9c3", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${shiftUtilization}%`, height: "100%", background: "#eab308", borderRadius: "3px" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTab === "shifts" ? (
        /* SHIFTS GOVERNANCE VIEW */
        <div>
          <div className="flex-between mb-medium" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.5px", color: "#1e293b", margin: 0 }}>Operational Shift Directory</h2>
            <button className="btn-primary" onClick={() => { setEditingShift(null); setFormData({ name: "", startTime: "10:00", endTime: "18:00", requiredHours: "8", lunchStartTime: "13:30", lunchEndTime: "14:00", earlyLoginAllowed: 60, postShiftAllowed: 120, startDate: "", endDate: "" }); setModalSelectedEmployeeIds([]); setModalSearchText(""); setModalRoleFilter("all"); setShowModal(true); }}>
              <LucidePlus size={18} /> Establish New Shift
            </button>
          </div>

          <div className="shifts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.5rem" }}>
            {shifts.map((shift) => {
              const assigned = getEmployeesForShift(shift.id);
              const runningState = getShiftStatus(shift);
              const activeOnline = assigned.filter(e => isEmployeeOnline(e.id)).length;

              return (
                <motion.div 
                  key={shift.id} 
                  className="glass-card" 
                  style={{ 
                    padding: "24px", 
                    borderRadius: "24px",
                    border: "1px solid #e2e8f0", 
                    position: "relative",
                    background: "#ffffff",
                    boxShadow: "0 10px 25px -15px rgba(0,0,0,0.03)"
                  }}
                  layout
                >
                  {/* Status Indicator Pill */}
                  <div style={{ position: "absolute", top: "24px", right: "24px", display: "flex", gap: "8px" }}>
                    <span style={{ 
                      padding: "4px 10px", 
                      borderRadius: "8px", 
                      fontSize: "0.68rem", 
                      fontWeight: 900,
                      textTransform: "uppercase",
                      background: runningState === "running" ? "#dcfce7" : (runningState === "upcoming" ? "#fef3c7" : "#f1f5f9"),
                      color: runningState === "running" ? "#15803d" : (runningState === "upcoming" ? "#b45309" : "#64748b"),
                      border: `1.5px solid ${runningState === "running" ? "#86efac20" : (runningState === "upcoming" ? "#fde04720" : "#cbd5e120")}`
                    }}>
                      {runningState === "running" ? "● Running Now" : (runningState === "upcoming" ? "Upcoming" : "Finished")}
                    </span>
                  </div>

                  <div style={{ marginBottom: "18px", paddingRight: "100px" }}>
                    <h3 style={{ fontWeight: 950, fontSize: "1.25rem", margin: "0 0 4px", letterSpacing: "-0.5px", color: "#0f172a" }}>{shift.name}</h3>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>{assigned.length} Employees assigned • <strong style={{ color: "#16a34a" }}>{activeOnline} Online</strong></span>
                    {shift.startDate && (
                      <div style={{ fontSize: "0.74rem", color: "#475569", fontWeight: 700, marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6" }}></span>
                        <span>
                          Active From: <strong>{new Date(shift.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                          {shift.endDate ? ` to ` : " (Lifetime)"}
                          {shift.endDate && <strong>{new Date(shift.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.62rem", textTransform: "uppercase", fontWeight: 800, color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><LucideClock size={12} /> Shift Timing</span>
                      <div style={{ fontWeight: 900, color: "#1e293b", fontSize: "0.92rem" }}>{shift.startTime} - {shift.endTime}</div>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.62rem", textTransform: "uppercase", fontWeight: 800, color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><LucideSave size={12} /> Workload Req.</span>
                      <div style={{ fontWeight: 900, color: "#2563eb", fontSize: "0.92rem" }}>{shift.requiredHours} Hours</div>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "14px", border: "1px solid #f1f5f9", gridColumn: "span 2" }}>
                      <span style={{ fontSize: "0.62rem", textTransform: "uppercase", fontWeight: 800, color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><LucideCoffee size={12} /> Intermission (Lunch Break)</span>
                      <div style={{ fontWeight: 900, color: "#1e293b", fontSize: "0.88rem" }}>{shift.lunchStartTime} - {shift.lunchEndTime}</div>
                    </div>
                  </div>

                  {/* Access Windows config */}
                  <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: "14px", marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 900, textTransform: "uppercase", margin: "0 0 10px", letterSpacing: "0.5px" }}>Security Access Control Windows</h4>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.75rem", background: "#eff6ff", color: "#2563eb", padding: "6px 12px", borderRadius: "10px", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                        <LucideLogIn size={12} /> Early Login: -{formatBufferTime(shift.earlyLoginAllowed)}
                      </span>
                      <span style={{ fontSize: "0.75rem", background: "#fef2f2", color: "#ef4444", padding: "6px 12px", borderRadius: "10px", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                        <LucideLogOut size={12} /> Buffer Exit: +{formatBufferTime(shift.postShiftAllowed)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
                    <button 
                      onClick={() => { setEditingShift(shift); setFormData({ ...shift, startDate: shift.startDate || "", endDate: shift.endDate || "" }); setModalSelectedEmployeeIds(getEmployeesForShift(shift.id).map(e => e.id)); setModalSearchText(""); setModalRoleFilter("all"); setShowModal(true); }}
                      style={{ 
                        flex: 1, 
                        padding: "10px", 
                        borderRadius: "12px", 
                        border: "1px solid #e2e8f0", 
                        background: "white", 
                        color: "#475569", 
                        fontWeight: 800, 
                        fontSize: "0.82rem",
                        cursor: "pointer", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: "6px",
                        transition: "all 0.2s"
                      }}
                    >
                      <LucidePencil size={14} /> Adjust Timing
                    </button>
                    <button 
                      onClick={() => handleDeleteShift(shift.id!)}
                      style={{ 
                        padding: "10px", 
                        borderRadius: "12px", 
                        border: "none", 
                        background: "#fee2e2", 
                        color: "#ef4444", 
                        fontWeight: 800, 
                        fontSize: "0.82rem",
                        cursor: "pointer", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        width: "44px",
                        transition: "all 0.2s"
                      }}
                    >
                      <LucideTrash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
            
            {shifts.length === 0 && (
              <div style={{ gridColumn: "span 3", textAlign: "center", padding: "80px 40px", border: "2px dashed #cbd5e1", borderRadius: "24px", color: "#64748b" }}>
                <LucideAlertCircle size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
                <h3>No Active Shifts Configured</h3>
                <p>Please establish a shift timings framework for your corporate workforce.</p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "allotment" ? (
        /* WORKFORCE ALLOTMENT SYSTEM VIEW */
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "2rem" }}>
          
          {/* Assignment Panel */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -15px rgba(0,0,0,0.03)", height: "fit-content" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(37,99,235,0.08)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideShieldCheck size={20} /></div>
              <h3 style={{ fontWeight: 950, fontSize: "1.2rem", letterSpacing: "-0.5px", margin: 0 }}>Allocation Protocols</h3>
            </div>
            
            <p style={{ color: "#64748b", fontSize: "0.82rem", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              Choose an operational shift configuration. Mapped employees will instantly inherit access permissions, login restrictions, and attendance constraints.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>TARGET SHIFT TIMINGS</label>
                <select
                  value={selectedShiftId}
                  onChange={e => setSelectedShiftId(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "white", fontSize: "0.88rem", fontWeight: 800, outline: "none", cursor: "pointer" }}
                >
                  <option value="">-- REMOVE SHIFT (DE-ALLOCATE ACCESS) --</option>
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                  ))}
                </select>
              </div>

              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 900, textTransform: "uppercase", marginBottom: "8px" }}>Selected Nodes:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedEmployeeIds.map(id => {
                    const emp = employees.find(e => e.id === id);
                    if (!emp) return null;
                    return (
                      <span key={id} style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#1e293b", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {emp.name}
                        <LucideX size={12} style={{ cursor: "pointer", color: "#ef4444" }} onClick={() => setSelectedEmployeeIds(prev => prev.filter(x => x !== id))} />
                      </span>
                    );
                  })}
                  {selectedEmployeeIds.length === 0 && (
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>Select workforce nodes on the right checklist...</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAllotShift}
                disabled={selectedEmployeeIds.length === 0}
                style={{ 
                  width: "100%", 
                  padding: "16px", 
                  borderRadius: "16px", 
                  border: "none", 
                  background: selectedEmployeeIds.length === 0 ? "#cbd5e1" : "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", 
                  color: "white", 
                  fontWeight: 900, 
                  fontSize: "1rem",
                  cursor: selectedEmployeeIds.length === 0 ? "not-allowed" : "pointer",
                  boxShadow: selectedEmployeeIds.length === 0 ? "none" : "0 8px 20px -6px rgba(37,99,235,0.4)"
                }}
              >
                Allot Shift Protocol ({selectedEmployeeIds.length} Nodes)
              </button>
            </div>
          </div>

          {/* Workforce Checklist Directory */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -15px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Search & Filters */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", padding: "10px 16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                <LucidePlus size={16} style={{ transform: "rotate(45deg)", color: "#64748b" }} />
                <input 
                  type="text" 
                  placeholder="Search name, credentials or email..." 
                  value={searchEmployee}
                  onChange={e => setSearchEmployee(e.target.value)}
                  style={{ border: "none", background: "none", outline: "none", width: "100%", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#64748b" }}><LucideFilter size={12} style={{ display: "inline", marginRight: "4px" }} /> SYSTEM ROLE:</span>
                <select 
                  value={filterRole} 
                  onChange={e => setFilterRole(e.target.value)}
                  style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "0.82rem", fontWeight: 800, outline: "none", cursor: "pointer" }}
                >
                  <option value="all">All Roles</option>
                  <option value="manager">Manager</option>
                  <option value="tl">Team Lead</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>

              {/* Bulk Select Control */}
              <button 
                type="button" 
                onClick={() => {
                  if (selectedEmployeeIds.length === filteredEmployees.length) {
                    setSelectedEmployeeIds([]);
                  } else {
                    setSelectedEmployeeIds(filteredEmployees.map(e => e.id));
                  }
                }}
                style={{ background: "#f1f5f9", border: "none", color: "#475569", fontWeight: 800, fontSize: "0.75rem", padding: "8px 14px", borderRadius: "10px", cursor: "pointer" }}
              >
                {selectedEmployeeIds.length === filteredEmployees.length ? "Deselect All" : "Select All Filtered"}
              </button>
            </div>

            {/* Workforce list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "450px", overflowY: "auto", paddingRight: "6px" }}>
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmployeeIds.includes(emp.id);
                const online = isEmployeeOnline(emp.id);

                return (
                  <div 
                    key={emp.id} 
                    onClick={() => {
                      if (isSelected) {
                        setSelectedEmployeeIds(prev => prev.filter(id => id !== emp.id));
                      } else {
                        setSelectedEmployeeIds(prev => [...prev, emp.id]);
                      }
                    }}
                    style={{ 
                      background: isSelected ? "#eff6ff" : "#ffffff", 
                      border: `1.5px solid ${isSelected ? "#93c5fd" : "#f1f5f9"}`, 
                      borderRadius: "16px", 
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      {/* Checkbox input */}
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}} // handled by click
                        style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563eb" }}
                      />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{emp.name}</strong>
                          <span style={{ 
                            fontSize: "0.62rem", 
                            fontWeight: 800, 
                            background: emp.role === "manager" ? "#fdf2f8" : (emp.role === "tl" ? "#f5f3ff" : "#f0fdf4"),
                            color: emp.role === "manager" ? "#db2777" : (emp.role === "tl" ? "#7c3aed" : "#16a34a"),
                            padding: "2px 6px",
                            borderRadius: "6px",
                            textTransform: "uppercase"
                          }}>{emp.role}</span>
                          
                          <span style={{ 
                            width: "8px", 
                            height: "8px", 
                            borderRadius: "50%", 
                            background: online ? "#22c55e" : "#cbd5e1"
                          }} title={online ? "Online Now" : "Offline"} />
                        </div>
                        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{emp.email}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      {emp.shift ? (
                        <div style={{ background: "#f8fafc", padding: "6px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1e293b", display: "block" }}>{emp.shift.name}</span>
                          <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}>{emp.shift.startTime} - {emp.shift.endTime}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 800 }}>-- No Shift Assigned --</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredEmployees.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  <LucideUsers size={32} style={{ opacity: 0.3, marginBottom: "8px" }} />
                  <p>No workforce nodes detected matching search filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "gamification" ? (
        /* GAMIFICATION ECONOMY CONTROL VIEW */
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -15px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245,158,11,0.08)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideActivity size={20} /></div>
              <div>
                <h3 style={{ fontWeight: 950, fontSize: "1.2rem", letterSpacing: "-0.5px", margin: 0 }}>Gamification Point Economy</h3>
                <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "2px 0 0" }}>Control how coins are distributed for performance metrics.</p>
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}><LucideUsers size={16} /> Recruiter Coin Economy</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "350px", overflowY: "auto", paddingRight: "10px" }}>
                  {[
                    { label: "Register Candidate", key: "register" },
                    { label: "Connected Call", key: "connected" },
                    { label: "Not Connected Call", key: "notConnected" },
                    { label: "Call Not Picked", key: "callNotPick" },
                    { label: "Interested Candidate", key: "interested" },
                    { label: "Not Interested", key: "notInterested" },
                    { label: "Dropped after status", key: "statusNotInterested" },
                    { label: "Processing For Interview", key: "processingForInterview" },
                    { label: "Go For Interview", key: "goForInterview" },
                    { label: "Interview Done", key: "interviewDone" },
                    { label: "Interview Not Done", key: "interviewNotDone" },
                    { label: "Selected", key: "selected" },
                    { label: "Rejected", key: "rejected" },
                    { label: "Processing For Joining", key: "processingForJoining" },
                    { label: "Joined", key: "joined" },
                    { label: "Dropped / Fall out", key: "dropped" },
                    { label: "Vendor Added Reward", key: "vendorCreated" },
                    { label: "Lead Created Reward", key: "leadCreated" },
                    { label: "Lead Forward Batch (>=20)", key: "leadForwarded" },
                    { label: "Completed Task Reward", key: "taskCompleted" },
                    { label: "Monthly 26+ Days Present Bonus", key: "monthly26DaysPresent" },
                    { label: "Monthly Avg Work Hours >=80% Bonus", key: "monthlyAvgWorkHours" },
                    { label: "Monthly Avg Overtime >1.5h Bonus", key: "monthlyOvertime" },
                    { label: "Monthly Absent >4 Days Penalty", key: "monthlyAbsentPenalty" },
                    { label: "Monthly Avg Late >1h Penalty", key: "monthlyLatePenalty" },
                    { label: "Monthly Avg Early >1h Bonus", key: "monthlyEarlyBonus" }
                  ].map(item => (
                    <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{item.label}</span>
                      <input type="number" step="0.1" value={(economyConfig as any)[item.key] || 0} onChange={e => setEconomyConfig({ ...economyConfig, [item.key]: Number(e.target.value) })} style={{ width: "60px", padding: "6px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center", fontWeight: 800 }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 15px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}><LucideShieldCheck size={16} /> Manager/TL Coin Economy</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "250px", overflowY: "auto", paddingRight: "10px" }}>
                    {[
                      { label: "Team Selection", key: "teamSelection" },
                      { label: "Team Joining", key: "teamJoining" },
                      { label: "Team Dropped Penalty", key: "teamDropped" },
                      { label: "Active Recruiter (per day)", key: "activeRecruiterDay" },
                      { label: "80% Team Active Bonus", key: "eightyPercentActive" },
                      { label: "Team completes task Bonus", key: "teamTaskCompletion" },
                      { label: "Team Avg Late Penalty", key: "teamAvgLatePenalty" },
                      { label: "Team Poor Attendance Penalty", key: "teamPoorAttendancePenalty" }
                    ].map(item => (
                      <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{item.label}</span>
                        <input type="number" step="0.1" value={(economyConfig as any)[item.key] || 0} onChange={e => setEconomyConfig({ ...economyConfig, [item.key]: Number(e.target.value) })} style={{ width: "60px", padding: "6px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center", fontWeight: 800 }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: "20px", background: "#fffbeb", borderRadius: "16px", border: "1px solid #fde68a" }}>
                  <h4 style={{ margin: "0 0 15px 0", color: "#d97706", display: "flex", alignItems: "center", gap: "8px" }}><LucideSliders size={16} /> Global Event Toggles</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { label: "Enable Gamification Economy", key: "enableCoins" },
                      { label: "Enable Penalties", key: "enablePenalties" }
                    ].map(item => (
                      <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{item.label}</span>
                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                          <input type="checkbox" checked={!!(economyConfig as any)[item.key]} onChange={e => setEconomyConfig({ ...economyConfig, [item.key]: e.target.checked })} style={{ width: "16px", height: "16px", accentColor: "#d97706" }} />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC MILESTONE BADGES CONFIGURATOR */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -15px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px", fontWeight: 950, letterSpacing: "-0.5px" }}><LucideAward size={22} color="#8b5cf6" /> Milestone Badges & Designations Configurator</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "20px" }}>
              
              {/* Add Badge Form */}
              <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 15px 0", fontSize: "0.95rem", fontWeight: 800 }}>Create New Milestone Badge</h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>SELECT MILESTONE TRACK</label>
                    <select
                      value={selectedMilestoneTrack}
                      onChange={e => setSelectedMilestoneTrack(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", outline: "none", marginTop: "4px" }}
                    >
                      <option value="recruiterCoinBadges">Recruiter Coin Badges</option>
                      <option value="tlCoinBadges">TL Team Coin Badges</option>
                      <option value="recruiterSelectionBadges">Recruiter Selection Badges</option>
                      <option value="recruiterJoiningBadges">Recruiter Joining Badges</option>
                      <option value="tlTeamSelectionBadges">TL Team Selection Badges</option>
                      <option value="tlTeamJoiningBadges">TL Team Joining Badges</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>BADGE / DESIGNATION NAME</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Master Sourcing Specialist" 
                      value={newMilestoneForm.name} 
                      onChange={e => setNewMilestoneForm({...newMilestoneForm, name: e.target.value})}
                      style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.85rem", marginTop: "4px" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>THRESHOLD VALUE</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 500" 
                        value={newMilestoneForm.min} 
                        onChange={e => setNewMilestoneForm({...newMilestoneForm, min: parseInt(e.target.value) || 0})}
                        style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.85rem", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>COLOR HEX</label>
                      <input 
                        type="color" 
                        value={newMilestoneForm.color} 
                        onChange={e => setNewMilestoneForm({...newMilestoneForm, color: e.target.value})}
                        style={{ width: "100%", height: "40px", padding: "2px", borderRadius: "10px", border: "1px solid #cbd5e1", marginTop: "4px", cursor: "pointer" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>BADGE EMOJI ICON</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 👑" 
                      value={newMilestoneForm.icon} 
                      onChange={e => setNewMilestoneForm({...newMilestoneForm, icon: e.target.value})}
                      style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.85rem", marginTop: "4px" }}
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={handleAddMilestone}
                    style={{ padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", color: "white", fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 12px rgba(139,92,246,0.2)", marginTop: "10px" }}
                  >
                    Add Milestone Badge
                  </button>
                </div>
              </div>

              {/* Milestone badges List view */}
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "16px", padding: "16px", maxHeight: "400px", overflowY: "auto" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>Active Badges in Selected Track</span>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(economyConfig[selectedMilestoneTrack] || []).map((b: any) => (
                    <div key={b.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#f8fafc" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <GlowingEmblem icon={b.icon} color={b.color} size="24px" />
                        <div>
                          <strong style={{ fontSize: "0.85rem", color: b.color }}>{b.name}</strong>
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Threshold: {b.min} units</div>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteMilestone(selectedMilestoneTrack, b.name)}
                        style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                      >
                        <LucideTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {(!economyConfig[selectedMilestoneTrack] || economyConfig[selectedMilestoneTrack].length === 0) && (
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>No badges defined in this track.</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "10px" }}>
            <button onClick={saveEconomyConfig} style={{ padding: "14px 28px", borderRadius: "16px", background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white", fontWeight: 900, border: "none", cursor: "pointer", boxShadow: "0 8px 20px -6px rgba(37,99,235,0.4)" }}>Deploy Global Economy Settings</button>
          </div>

        </div>
      ) : activeTab === "meetings" ? (
        <BossMeetingControlCenter currentUser={null} />
      ) : null}

      {/* SHIFT CREATION / MODIFY DRAWER MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay flex-center" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="glass-card" 
              style={{ width: "100%", maxWidth: "560px", padding: "30px", background: "white", borderRadius: "28px", boxShadow: "0 50px 100px -20px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="flex-between mb-large" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontWeight: 950, fontSize: "1.4rem", letterSpacing: "-0.5px", margin: 0 }}>{editingShift ? "Modify Shift Timings" : "Establish New Workforce Shift"}</h2>
                  <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "2px 0 0" }}>Update timings, break hours, and login limits.</p>
                </div>
                <button className="icon-btn" onClick={() => setShowModal(false)} style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideX size={16} /></button>
              </div>

              <form onSubmit={handleSaveShift} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Shift Name */}
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "6px", display: "block" }}>SHIFT NAME / DESIGNATION *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Night Shift, Recruitment Team, Morning Shift" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none" }}
                  />
                </div>

                {/* Validity Dates */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "6px", display: "block" }}>SHIFT START FROM (DATE) *</label>
                    <input 
                      type="date" 
                      value={formData.startDate || ""} 
                      onChange={e => setFormData({...formData, startDate: e.target.value})} 
                      required 
                      style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none" }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "6px", display: "block" }}>VALID TILL (DATE)</label>
                    <input 
                      type="date" 
                      value={formData.endDate || ""} 
                      onChange={e => setFormData({...formData, endDate: e.target.value})} 
                      style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none" }}
                    />
                  </div>
                </div>

                {/* Timings */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "6px", display: "block" }}>SHIFT START TIME *</label>
                    <input 
                      type="time" 
                      value={formData.startTime} 
                      onChange={e => {
                        const newStartTime = e.target.value;
                        setFormData({
                          ...formData,
                          startTime: newStartTime,
                          requiredHours: calculateWorkingHours(newStartTime, formData.endTime)
                        });
                      }} 
                      required 
                      style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none" }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "6px", display: "block" }}>SHIFT END TIME *</label>
                    <input 
                      type="time" 
                      value={formData.endTime} 
                      onChange={e => {
                        const newEndTime = e.target.value;
                        setFormData({
                          ...formData,
                          endTime: newEndTime,
                          requiredHours: calculateWorkingHours(formData.startTime, newEndTime)
                        });
                      }} 
                      required 
                      style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none" }}
                    />
                  </div>
                </div>

                {/* Working hours */}
                <div className="form-group">
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "6px", display: "block" }}>TOTAL WORKING HOURS REQUIRED *</label>
                  <input 
                    type="number" 
                    step="any" 
                    min="0.1"
                    max="24"
                    value={formData.requiredHours} 
                    onChange={e => setFormData({...formData, requiredHours: e.target.value})} 
                    required 
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none" }}
                  />
                </div>

                {/* Lunch break */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "6px", display: "block" }}>LUNCH BREAK START</label>
                    <input 
                      type="time" 
                      value={formData.lunchStartTime} 
                      onChange={e => setFormData({...formData, lunchStartTime: e.target.value})} 
                      style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none" }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", marginBottom: "6px", display: "block" }}>LUNCH BREAK END</label>
                    <input 
                      type="time" 
                      value={formData.lunchEndTime} 
                      onChange={e => setFormData({...formData, lunchEndTime: e.target.value})} 
                      style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "0.9rem", outline: "none" }}
                    />
                  </div>
                </div>

                {/* Permissions timing buffer config */}
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "18px", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Access Timing Control Settings</div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="form-group">
                      <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>EARLY LOGIN BUFFER (MINS)</label>
                      <select 
                        value={formData.earlyLoginAllowed}
                        onChange={e => setFormData({...formData, earlyLoginAllowed: parseInt(e.target.value)})}
                        style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", fontSize: "0.82rem", fontWeight: 800 }}
                      >
                        <option value={15}>15 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={60}>1 Hour</option>
                        <option value={120}>2 Hours</option>
                        <option value={180}>3 Hours</option>
                        <option value={0}>Strictly No Early Login</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "#475569", marginBottom: "4px" }}>POST-SHIFT EXIT BUFFER (MINS)</label>
                      <select 
                        value={formData.postShiftAllowed}
                        onChange={e => setFormData({...formData, postShiftAllowed: parseInt(e.target.value)})}
                        style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", fontSize: "0.82rem", fontWeight: 800 }}
                      >
                        <option value={15}>15 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={60}>1 Hour</option>
                        <option value={120}>2 Hours (Default)</option>
                        <option value={180}>3 Hours</option>
                        <option value={240}>4 Hours</option>
                        <option value={0}>Instantly (No Buffer)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Employee Assignment Checklist */}
                <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "18px", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>Allot Shift to Workforce Nodes</div>
                    
                    {/* Select All currently visible employees */}
                    <button 
                      type="button"
                      onClick={() => {
                        const visibleIds = modalFilteredEmployees.map(e => e.id);
                        const allSelected = visibleIds.every(id => modalSelectedEmployeeIds.includes(id));
                        if (allSelected) {
                          // Deselect only the currently visible ones
                          setModalSelectedEmployeeIds(prev => prev.filter(id => !visibleIds.includes(id)));
                        } else {
                          // Select all currently visible ones
                          setModalSelectedEmployeeIds(prev => Array.from(new Set([...prev, ...visibleIds])));
                        }
                      }}
                      style={{ background: "#eff6ff", border: "none", color: "#2563eb", fontWeight: 800, fontSize: "0.68rem", padding: "4px 8px", borderRadius: "6px", cursor: "pointer" }}
                    >
                      {modalFilteredEmployees.map(e => e.id).every(id => modalSelectedEmployeeIds.includes(id)) && modalFilteredEmployees.length > 0 ? "Deselect All Filtered" : "Select All Filtered"}
                    </button>
                  </div>

                  {/* Search Bar inside Modal Checklist */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "white", padding: "8px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1" }}>
                    <input 
                      type="text" 
                      placeholder="Search employee by name/email..." 
                      value={modalSearchText}
                      onChange={e => setModalSearchText(e.target.value)}
                      style={{ border: "none", background: "none", outline: "none", width: "100%", fontSize: "0.78rem", fontWeight: 700 }}
                    />
                  </div>

                  {/* Position Filter Tabs inside Modal */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    {(["all", "manager", "tl", "recruiter"] as const).map(roleOption => {
                      const isActive = modalRoleFilter === roleOption;
                      return (
                        <button
                          key={roleOption}
                          type="button"
                          onClick={() => setModalRoleFilter(roleOption)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            border: "none",
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            background: isActive ? "#2563eb" : "#cbd5e1",
                            color: isActive ? "white" : "#475569"
                          }}
                        >
                          {roleOption.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Scrollable Checklist */}
                  <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", background: "white", padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                    {modalFilteredEmployees.map(emp => {
                      const isSelected = modalSelectedEmployeeIds.includes(emp.id);
                      return (
                        <label key={emp.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer", color: "#1e293b", userSelect: "none" }}>
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => {}} // handled by click
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelected) {
                                setModalSelectedEmployeeIds(prev => prev.filter(id => id !== emp.id));
                              } else {
                                setModalSelectedEmployeeIds(prev => [...prev, emp.id]);
                              }
                            }}
                            style={{ accentColor: "#2563eb", cursor: "pointer" }}
                          />
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => {
                            if (isSelected) {
                              setModalSelectedEmployeeIds(prev => prev.filter(id => id !== emp.id));
                            } else {
                              setModalSelectedEmployeeIds(prev => [...prev, emp.id]);
                            }
                          }}>
                            {emp.name} 
                            <span style={{ fontSize: "0.62rem", fontWeight: 900, textTransform: "uppercase", padding: "2px 6px", borderRadius: "6px", background: emp.role === "manager" ? "#fdf2f8" : (emp.role === "tl" ? "#f5f3ff" : "#f0fdf4"), color: emp.role === "manager" ? "#db2777" : (emp.role === "tl" ? "#7c3aed" : "#16a34a") }}>{emp.role}</span>
                          </span>
                        </label>
                      );
                    })}
                    {modalFilteredEmployees.length === 0 && (
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, textAlign: "center", padding: "20px 0" }}>No employees match filters.</span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1, padding: "14px", border: "1.5px solid #cbd5e1", color: "#475569", background: "white", borderRadius: "14px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 800 }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{ flex: 1.5, padding: "14px", border: "none", background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white", borderRadius: "14px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 900, boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}
                  >
                    {editingShift ? "Apply Modified Profile" : "Authorize System Protocol"}
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
