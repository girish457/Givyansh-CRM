import React, { useState, useEffect } from "react";
import { 
  LucideActivity, LucideZap, LucideTrendingDown, LucideCheckCircle2, 
  LucideClock, LucideAward, LucideTrophy, LucideChevronUp, LucideLoader2,
  LucideCoins, LucideStar, LucideTrendingUp, LucideTarget, LucideCrosshair, 
  LucideShield, LucideWallet, LucideArrowLeft, LucideFlame, LucideAlertTriangle,
  LucideCheckSquare
} from "lucide-react";
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
      border: `${parsedSize <= 45 ? "2px" : "3.5px"} solid ${color}`,
      boxShadow: `0 4px 12px rgba(0, 0, 0, 0.08), 0 0 16px ${color}33`,
      padding: parsedSize <= 45 ? "3px" : "6px",
      boxSizing: "border-box",
      position: "relative"
    }}>
      <div style={{ width: "100%", height: "100%", color: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {getBadgeSVG(icon, color)}
      </div>
    </div>
  );
};

interface MyPerformanceProps {
  currentUser?: any;
  candidates?: any[];
}

export default function MyPerformance({ currentUser, candidates = [] }: MyPerformanceProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [metrics, setMetrics] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"dashboard" | "wallet">("dashboard");
  const [leaderboardType, setLeaderboardType] = useState<"personal" | "team" | "overall">("personal");

  const isTL = currentUser?.role === "tl" || currentUser?.role === "TL";
  const isManager = currentUser?.role === "manager";
  const userId = currentUser?.id || currentUser?.userId || "unknown";

  // Check URL parameter for initial view mode
  useEffect(() => {
    const checkView = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "wallet") {
        setViewMode("wallet");
      } else {
        setViewMode("dashboard");
      }
    };
    checkView();
    window.addEventListener("popstate", checkView);
    return () => window.removeEventListener("popstate", checkView);
  }, []);

  // Fetch metrics and config
  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        const [meRes, configRes] = await Promise.all([
          fetch("/api/gamification/me"),
          fetch("/api/settings/gamification")
        ]);

        if (meRes.ok) {
          setMetrics(await meRes.json());
        }
        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData && Object.keys(configData).length > 0) {
            setConfig(configData);
          }
        }
      } catch (e) {
        console.error("Gamification error:", e);
        // Fallback metrics to prevent white screen
        setMetrics({
          coins: 0,
          rank: 1,
          teamRank: 1,
          badge: "Newbie",
          nextBadge: "Welcome to Company",
          coinsRequired: 50,
          selections: 0,
          joinings: 0,
          teamSelections: 0,
          teamJoinings: 0,
          sourced: 0,
          history: [],
          avgLateIn: "0.0",
          avgEarlyIn: "0.0",
          totalAbsents: 0,
          completedTasks: 0
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGamificationData();
  }, []);

  // Fetch leaderboard data when view mode or type changes
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`/api/gamification/leaderboard?type=${leaderboardType}`);
        if (res.ok) {
          setLeaderboard(await res.json());
        }
      } catch (e) {
        console.error("Leaderboard error:", e);
      }
    };
    fetchLeaderboard();
  }, [leaderboardType, viewMode]);

  if (loading || !metrics) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Performance Ledger...</span>
      </div>
    );
  }

  const lifetimeCoins = metrics.coins || 0;

  // Resolve dynamic badges from config or fall back to static constants
  const rCoinBadges = config?.recruiterCoinBadges || RecruiterCoinBadges;
  const tCoinBadges = config?.tlCoinBadges || TLTeamCoinBadges;
  const rSelBadges = config?.recruiterSelectionBadges || RecruiterSelectionBadges;
  const tSelBadges = config?.tlTeamSelectionBadges || TLTeamSelectionBadges;
  const rJoinBadges = config?.recruiterJoiningBadges || RecruiterJoiningBadges;
  const tJoinBadges = config?.tlTeamJoiningBadges || TLTeamJoiningBadges;

  const getDynamicTierData = (value: number, tiers: any[]) => {
    let currentBadge = tiers[0] || { min: 0, name: "Newbie", icon: "🌱", color: "#94a3b8" };
    let nextBadge = tiers.length > 1 ? tiers[1] : null;
    for (let i = 0; i < tiers.length; i++) {
      if (value >= tiers[i].min) {
        currentBadge = tiers[i];
        nextBadge = i + 1 < tiers.length ? tiers[i + 1] : null;
      } else {
        break;
      }
    }
    return { currentBadge, nextBadge };
  };

  const getDynamicBadgeForCoins = (val: number, isTLMode: boolean) => {
    const tiers = isTLMode ? tCoinBadges : rCoinBadges;
    return getDynamicTierData(val, tiers);
  };
  const getDynamicBadgeForSelections = (val: number, isTLMode: boolean) => {
    const tiers = isTLMode ? tSelBadges : rSelBadges;
    return getDynamicTierData(val, tiers);
  };
  const getDynamicBadgeForJoinings = (val: number, isTLMode: boolean) => {
    const tiers = isTLMode ? tJoinBadges : rJoinBadges;
    return getDynamicTierData(val, tiers);
  };

  // Badge calculations
  const coinTrack = isTL || isManager ? tCoinBadges : rCoinBadges;
  const { currentBadge, nextBadge } = getDynamicBadgeForCoins(lifetimeCoins, isTL || isManager);
  
  // Selection tracks
  const { currentBadge: selBadge, nextBadge: nextSelBadge } = getDynamicBadgeForSelections(metrics.selections || 0, false);
  const { currentBadge: teamSelBadge, nextBadge: nextTeamSelBadge } = getDynamicBadgeForSelections(metrics.teamSelections || 0, true);

  // Joining tracks
  const { currentBadge: joinBadge, nextBadge: nextJoinBadge } = getDynamicBadgeForJoinings(metrics.joinings || 0, false);
  const { currentBadge: teamJoinBadge, nextBadge: nextTeamJoinBadge } = getDynamicBadgeForJoinings(metrics.teamJoinings || 0, true);

  const coinsForNext = nextBadge ? nextBadge.min - lifetimeCoins : 0;
  const progressPercent = nextBadge ? Math.min(100, Math.max(0, ((lifetimeCoins - currentBadge.min) / (nextBadge.min - currentBadge.min)) * 100)) : 100;

  // Rank and team members
  const selfRank = metrics.rank || 1;
  const totalTeamMembers = leaderboard.length || 1;

  // Growth up/down comparison logic
  const lastSavedBadge = localStorage.getItem(`last_badge_coins_${userId}`);
  let growthAlert = null;
  if (lastSavedBadge && lastSavedBadge !== currentBadge.name) {
    const currentIdx = coinTrack.findIndex(b => b.name === currentBadge.name);
    const lastIdx = coinTrack.findIndex(b => b.name === lastSavedBadge);
    if (currentIdx > lastIdx) {
      growthAlert = { type: "up", text: `Growth Up! Unlocked: "${currentBadge.name}" (Previously: "${lastSavedBadge}")` };
    } else if (currentIdx < lastIdx) {
      growthAlert = { type: "down", text: `Growth Down! Receded to: "${currentBadge.name}" (Previously: "${lastSavedBadge}")` };
    }
  }

  const handleAcknowledgeGrowth = () => {
    localStorage.setItem(`last_badge_coins_${userId}`, currentBadge.name);
    window.location.reload();
  };

  if (!lastSavedBadge) {
    localStorage.setItem(`last_badge_coins_${userId}`, currentBadge.name);
  }

  // Calculate Funnel stages from candidates array
  const totalSourced = candidates.length;
  const totalConnected = candidates.filter(c => ["connected", "interested"].includes((c.remarks || "").toLowerCase().trim())).length;
  const totalInterview = candidates.filter(c => ["goforinterview", "interviewdone", "processingforinterview", "interviewscheduled"].includes((c.remarks || "").toLowerCase().replace(/[\s_]+/g, ""))).length;
  const totalSelected = candidates.filter(c => ["selected", "joined", "hired"].includes((c.remarks || "").toLowerCase().trim()) || ["selected", "joined"].includes((c.cvStatus || "").toLowerCase().trim())).length;

  const funnelSourced = Math.max(totalSourced, metrics.sourced || 25);
  const funnelConnected = Math.max(totalConnected, Math.round(funnelSourced * 0.64));
  const funnelInterview = Math.max(totalInterview, Math.round(funnelSourced * 0.32));
  const funnelSelected = Math.max(totalSelected, metrics.selections || 2);

  // Sourcing Vulnerabilities
  const totalDrops = candidates.filter(c => ["dropped", "fallout"].includes((c.remarks || "").toLowerCase().trim())).length;
  const totalNotInterested = candidates.filter(c => ["notinterested", "notinterestedafterstatus", "not_interested"].includes((c.remarks || "").toLowerCase().replace(/[\s_]+/g, ""))).length;
  const totalNotConnected = candidates.filter(c => ["notconnected", "not_connected"].includes((c.remarks || "").toLowerCase().replace(/[\s_]+/g, ""))).length;

  const vulnerabilities = [];
  if (totalDrops > 3) vulnerabilities.push({ title: "High Drop Rate Warning", desc: `${totalDrops} candidates dropped. Review candidate onboarding transparency.` });
  if (totalNotInterested > 5) vulnerabilities.push({ title: "High Not-Interested Drop-off", desc: `${totalNotInterested} candidates rejected mandates. Sync with client requirement mapping.` });
  if (totalNotConnected > 10) vulnerabilities.push({ title: "Call Connectivity Lag", desc: `${totalNotConnected} dialer reverts unresolved. Check timezone availability lists.` });
  if (vulnerabilities.length === 0) {
    vulnerabilities.push({ title: "Stable Yield Health", desc: "No critical drop-off alerts detected this session. Keep sourcing!" });
  }

  // Core Sourced Strengths
  const strengths = [];
  if (metrics.sourced > 15) strengths.push({ title: "High Sourcing Sprints", desc: `Registered ${metrics.sourced} unique candidates liftime. Strong outreach speed.` });
  if (metrics.selections > 1) strengths.push({ title: "Accurate Matching Rate", desc: `Secured ${metrics.selections} selections. Excellent quality profiling.` });
  if (lifetimeCoins > 200) strengths.push({ title: "Active Coins Earner", desc: `Sustained point accumulation at ${lifetimeCoins} coins. Elite dashboard consistency.` });
  if (strengths.length === 0) {
    strengths.push({ title: "Steady Onboarding", desc: "Build momentum by registering candidates and logging phone follow-ups." });
  }

  // Render Wallet View Mode
  if (viewMode === "wallet") {
    return (
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: "12px", fontFamily: "'Outfit', sans-serif", color: "#1e293b", background: "#f8fafc", minHeight: "100vh" }}>
        
        {/* WALLET HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "10px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px -1px rgba(0,0,0,0.01)" }}>
          <button 
            onClick={() => {
              setViewMode("dashboard");
              window.history.pushState({}, "", window.location.pathname);
            }} 
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#2563eb", fontWeight: 800, cursor: "pointer", fontSize: "0.82rem" }}
          >
            <LucideArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "4px 10px", borderRadius: "12px" }}>
            <LucideWallet size={15} color="#d97706" />
            <span style={{ fontWeight: 900, color: "#b45309", fontSize: "0.9rem" }}>{lifetimeCoins.toFixed(1)} CR</span>
          </div>
        </div>

        {/* TRACKING PROTOCOL */}
        <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "12px", padding: "14px 18px", color: "white" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "6px" }}><LucideAward size={16} color="#f59e0b" /> Badge Unlock Progress</h2>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.75rem", fontWeight: 600 }}>
            <span style={{ color: "#cbd5e1" }}>Current: {currentBadge.name} ({currentBadge.min} CR)</span>
            {nextBadge && <span style={{ color: "#fcd34d" }}>Next: {nextBadge.name} ({nextBadge.min} CR)</span>}
          </div>
          <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ 
              width: `${progressPercent}%`, height: "100%", 
              background: `linear-gradient(90deg, ${currentBadge.color} 0%, ${nextBadge ? nextBadge.color : currentBadge.color} 100%)`,
              borderRadius: "4px"
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>
            <span>Unlocked at: {currentBadge.min} CR</span>
            <span>{coinsForNext > 0 ? `${coinsForNext.toFixed(1)} CR left to unlock next level` : "Highest badge tier reached!"}</span>
          </div>
        </div>

        {/* LEDGER DETAILS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px" }}>
          
          {/* COIN TRANSACTION LOGS */}
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "14px", boxShadow: "0 2px 4px -1px rgba(0,0,0,0.01)" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}><LucideCoins size={16} color="#d97706" /> Coin Earning History</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", color: "#64748b", fontSize: "0.68rem", textTransform: "uppercase" }}>
                    <th style={{ padding: "8px 10px", borderBottom: "1px solid #e2e8f0" }}>Date</th>
                    <th style={{ padding: "8px 10px", borderBottom: "1px solid #e2e8f0" }}>Action type</th>
                    <th style={{ padding: "8px 10px", borderBottom: "1px solid #e2e8f0" }}>Details</th>
                    <th style={{ padding: "8px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>Coins</th>
                  </tr>
                </thead>
                <tbody>
                  {(metrics.history || []).map((h: any) => (
                    <tr key={h.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px 10px", fontSize: "0.75rem", color: "#64748b" }}>{new Date(h.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: "8px 10px", fontSize: "0.75rem", color: "#0f172a", fontWeight: 700 }}>{h.actionType?.toUpperCase()}</td>
                      <td style={{ padding: "8px 10px", fontSize: "0.75rem", color: "#64748b" }}>{h.statusName || h.reason}</td>
                      <td style={{ padding: "8px 10px", fontSize: "0.8rem", fontWeight: 800, textAlign: "right", color: h.pointsAwarded >= 0 ? "#10b981" : "#ef4444" }}>
                        {h.pointsAwarded > 0 ? "+" : ""}{h.pointsAwarded} CR
                      </td>
                    </tr>
                  ))}
                  {(!metrics.history || metrics.history.length === 0) && (
                    <tr><td colSpan={4} style={{ padding: "15px", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>No ledger transactions available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ALL EARNED BADGES CHECKLIST */}
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "14px", boxShadow: "0 2px 4px -1px rgba(0,0,0,0.01)" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}><LucideAward size={16} color="#8b5cf6" /> Earned Badges</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "380px", overflowY: "auto" }}>
              
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Unlocked Coin Levels</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                  {coinTrack.filter(b => lifetimeCoins >= b.min).map(b => (
                    <span 
                      key={b.name} 
                      className="premium-game-badge" 
                      style={{ 
                        '--badge-border': b.color, 
                        '--badge-shadow': b.color + '20',
                        padding: "4px 10px",
                        fontSize: "0.72rem",
                        borderWidth: "1.5px",
                        gap: "6px"
                      } as React.CSSProperties}
                    >
                      <GlowingEmblem icon={b.icon} color={b.color} size="16px" /> {b.name}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Unlocked Selection Levels</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                  {rSelBadges.filter(b => metrics.selections >= b.min).map(b => (
                    <span 
                      key={b.name} 
                      className="premium-game-badge" 
                      style={{ 
                        '--badge-border': b.color, 
                        '--badge-shadow': b.color + '20',
                        padding: "4px 10px",
                        fontSize: "0.72rem",
                        borderWidth: "1.5px",
                        gap: "6px"
                      } as React.CSSProperties}
                    >
                      <GlowingEmblem icon={b.icon} color={b.color} size="16px" /> {b.name}
                    </span>
                  ))}
                  {isTL && tSelBadges.filter(b => metrics.teamSelections >= b.min).map(b => (
                    <span 
                      key={b.name} 
                      className="premium-game-badge" 
                      style={{ 
                        '--badge-border': b.color, 
                        '--badge-shadow': b.color + '20',
                        padding: "4px 10px",
                        fontSize: "0.72rem",
                        borderWidth: "1.5px",
                        gap: "6px"
                      } as React.CSSProperties}
                    >
                      <GlowingEmblem icon={b.icon} color={b.color} size="16px" /> {b.name} (Team)
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Unlocked Joining Levels</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                  {rJoinBadges.filter(b => metrics.joinings >= b.min).map(b => (
                    <span 
                      key={b.name} 
                      className="premium-game-badge" 
                      style={{ 
                        '--badge-border': b.color, 
                        '--badge-shadow': b.color + '20',
                        padding: "4px 10px",
                        fontSize: "0.72rem",
                        borderWidth: "1.5px",
                        gap: "6px"
                      } as React.CSSProperties}
                    >
                      <GlowingEmblem icon={b.icon} color={b.color} size="16px" /> {b.name}
                    </span>
                  ))}
                  {isTL && tJoinBadges.filter(b => metrics.teamJoinings >= b.min).map(b => (
                    <span 
                      key={b.name} 
                      className="premium-game-badge" 
                      style={{ 
                        '--badge-border': b.color, 
                        '--badge-shadow': b.color + '20',
                        padding: "4px 10px",
                        fontSize: "0.72rem",
                        borderWidth: "1.5px",
                        gap: "6px"
                      } as React.CSSProperties}
                    >
                      <GlowingEmblem icon={b.icon} color={b.color} size="16px" /> {b.name} (Team)
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard View Mode (default)
  return (
    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "8px", fontFamily: "'Outfit', sans-serif", color: "#1e293b", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* GROWTH ALERT BANNER */}
      {growthAlert && (
        <div style={{ 
          background: growthAlert.type === "up" ? "#d1fae5" : "#fee2e2", 
          border: `1px solid ${growthAlert.type === "up" ? "#10b981" : "#ef4444"}`, 
          borderRadius: "8px", 
          padding: "4px 10px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 800, color: growthAlert.type === "up" ? "#065f46" : "#991b1b", fontSize: "0.72rem" }}>
            {growthAlert.type === "up" ? <LucideChevronUp size={14} /> : <LucideTrendingDown size={14} />}
            {growthAlert.text}
          </div>
          <button 
            onClick={handleAcknowledgeGrowth} 
            style={{ 
              background: growthAlert.type === "up" ? "#10b981" : "#ef4444", 
              color: "white", 
              border: "none", 
              padding: "2px 8px", 
              borderRadius: "4px", 
              fontWeight: 800, 
              cursor: "pointer", 
              fontSize: "0.65rem" 
            }}
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* DYNAMIC HEADER */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "10px", padding: "8px 12px", color: "white", boxShadow: "0 4px 15px rgba(15,23,42,0.12)", position: "relative", overflow: "hidden" }}>
        
        {/* Glow rings */}
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%" }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1, flexWrap: "wrap", gap: "8px" }}>
          
          {/* Identity & Rank */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ 
              width: "38px", height: "38px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", 
              border: `1px solid ${currentBadge.color}`, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 10px ${currentBadge.color}30`
            }}>
              <GlowingEmblem icon={currentBadge.icon} color={currentBadge.color} size="30px" />
            </div>
            <div>
              <h1 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 1px 0", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                {currentUser?.name || "Demo Recruiter"}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ background: currentBadge.color, color: "white", padding: "1px 6px", borderRadius: "3px", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {currentBadge.name}
                </span>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "2px" }}>
                  <LucideTarget size={10} /> Rank: #{selfRank} / {totalTeamMembers}
                </span>
              </div>
            </div>
          </div>

          {/* Lifetime Coins */}
          <div 
            onClick={() => setViewMode("wallet")}
            style={{ 
              background: "rgba(0,0,0,0.3)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: "8px", 
              padding: "6px 10px", 
              minWidth: "120px", 
              backdropFilter: "blur(10px)",
              cursor: "pointer"
            }}
          >
            <div style={{ color: "#94a3b8", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "1px", display: "flex", justifyContent: "space-between" }}>
              <span>Total Earnings</span>
              <span style={{ color: "#2563eb", fontWeight: 800 }}>LEDGER</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <LucideCoins size={15} color="#f59e0b" />
              <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#fcd34d", lineHeight: 1 }}>{lifetimeCoins}</span>
              <span style={{ fontSize: "0.7rem", color: "#fbbf24", fontWeight: 800, alignSelf: "flex-end", paddingBottom: "1px" }}>CR</span>
            </div>
          </div>

        </div>

        {/* Level Up progress bar */}
        <div style={{ marginTop: "8px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.62rem", fontWeight: 600 }}>
            <span style={{ color: "#cbd5e1" }}>Current: {currentBadge.name} ({currentBadge.min} CR)</span>
            {nextBadge && <span style={{ color: "#fcd34d" }}>Next: {nextBadge.name} ({nextBadge.min} CR)</span>}
          </div>
          <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ 
              width: `${progressPercent}%`, height: "100%", 
              background: `linear-gradient(90deg, ${currentBadge.color} 0%, ${nextBadge ? nextBadge.color : currentBadge.color} 100%)`,
              borderRadius: "2px", transition: "width 1s ease-in-out"
            }} />
          </div>
          <div style={{ textAlign: "right", marginTop: "4px", fontSize: "0.58rem", color: "#94a3b8", fontWeight: 500 }}>
            {coinsForNext > 0 ? `Earn ${coinsForNext.toFixed(1)} more coins to unlock next level!` : "Maximum Badge Tier unlocked!"}
          </div>
        </div>

      </div>

      {/* CORE GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px" }}>
        
        {/* LEFT COLUMN: KPI METRIC GRID */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          
          {/* OPERATIONAL KPI METRICS */}
          <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "8px 10px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: 800 }}><LucideActivity size={13} color="#2563eb" /> Operational KPI Metric Grid</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700 }}>Avg Late In</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: Number(metrics.avgLateIn) > 1 ? "#ef4444" : "#10b981", lineHeight: 1.1 }}>{metrics.avgLateIn} hrs</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700 }}>Avg Early In</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#10b981", lineHeight: 1.1 }}>{metrics.avgEarlyIn} hrs</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700 }}>Total Absents</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: metrics.totalAbsents > 4 ? "#ef4444" : "#f59e0b", lineHeight: 1.1 }}>{metrics.totalAbsents} {metrics.totalAbsents === 1 ? "Day" : "Days"}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "6px" }}>
                <div style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700 }}>Completed Tasks</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#3b82f6", lineHeight: 1.1 }}>{metrics.completedTasks}</div>
              </div>
            </div>
          </div>

          {/* SOURCING VULNERABILITIES */}
          <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "8px 10px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: 800 }}><LucideAlertTriangle size={13} color="#ef4444" /> Sourcing Vulnerabilities</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {vulnerabilities.map((v, i) => (
                <div key={i} style={{ background: "#fef2f2", borderLeft: "3px solid #ef4444", padding: "4px 8px", borderRadius: "5px" }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#991b1b" }}>{v.title}</div>
                  <div style={{ fontSize: "0.6rem", color: "#7f1d1d", marginTop: "1px", lineHeight: 1.2 }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CORE SOURCED STRENGTHS */}
          <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "8px 10px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: 800 }}><LucideFlame size={13} color="#10b981" /> Core Sourced Strengths</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {strengths.map((s, i) => (
                <div key={i} style={{ background: "#ecfdf5", borderLeft: "3px solid #10b981", padding: "4px 8px", borderRadius: "5px" }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#065f46" }}>{s.title}</div>
                  <div style={{ fontSize: "0.6rem", color: "#047857", marginTop: "1px", lineHeight: 1.2 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: BADGES, HEATMAP & FUNNELS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          
          {/* MY PERFORMANCE BADGES & MILESTONES */}
          <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "8px 10px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: 800 }}><LucideShield size={13} color="#8b5cf6" /> Performance Badges & Milestones</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: isTL || isManager ? "repeat(auto-fit, minmax(130px, 1fr))" : "1fr 1fr 1fr", gap: "6px" }}>
              
              {/* COINS */}
              <div style={{ border: `1px solid ${currentBadge.color}`, borderRadius: "8px", padding: "6px 8px", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", boxShadow: `0 4px 12px ${currentBadge.color}20`, color: "white", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", marginBottom: "1px", letterSpacing: "0.5px" }}>COINS</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <GlowingEmblem icon={currentBadge.icon} color={currentBadge.color} size="32px" />
                  <div>
                    <div style={{ fontWeight: 900, color: currentBadge.color, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1.1 }}>{currentBadge.name}</div>
                    <div style={{ fontSize: "0.6rem", color: "#cbd5e1", fontWeight: 600 }}>{lifetimeCoins} CR</div>
                  </div>
                </div>
                {nextBadge && (
                  <div style={{ marginTop: "0px", paddingTop: "4px", borderTop: "1px dashed rgba(255,255,255,0.12)", fontSize: "0.58rem", color: "#94a3b8" }}>
                    Next: <span style={{ color: nextBadge.color, fontWeight: 700 }}>{nextBadge.name}</span> ({coinsForNext.toFixed(1)} left)
                  </div>
                )}
              </div>

              {/* SELECTIONS */}
              <div style={{ border: `1px solid ${selBadge.color}`, borderRadius: "8px", padding: "6px 8px", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", boxShadow: `0 4px 12px ${selBadge.color}20`, color: "white", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", marginBottom: "1px", letterSpacing: "0.5px" }}>SELECTIONS</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <GlowingEmblem icon={selBadge.icon} color={selBadge.color} size="32px" />
                  <div>
                    <div style={{ fontWeight: 900, color: selBadge.color, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1.1 }}>{selBadge.name}</div>
                    <div style={{ fontSize: "0.6rem", color: "#cbd5e1", fontWeight: 600 }}>{metrics.selections || 0} pers</div>
                  </div>
                </div>
                {nextSelBadge && (
                  <div style={{ marginTop: "0px", paddingTop: "4px", borderTop: "1px dashed rgba(255,255,255,0.12)", fontSize: "0.58rem", color: "#94a3b8" }}>
                    Next: <span style={{ color: nextSelBadge.color, fontWeight: 700 }}>{nextSelBadge.name}</span> ({nextSelBadge.min - (metrics.selections || 0)} left)
                  </div>
                )}
              </div>

              {/* TEAM SELECTIONS (TL/Manager only) */}
              {(isTL || isManager) && (
                <div style={{ border: `1px solid ${teamSelBadge.color}`, borderRadius: "8px", padding: "6px 8px", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", boxShadow: `0 4px 12px ${teamSelBadge.color}20`, color: "white", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", marginBottom: "1px", letterSpacing: "0.5px" }}>TEAM SELECTIONS</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <GlowingEmblem icon={teamSelBadge.icon} color={teamSelBadge.color} size="32px" />
                    <div>
                      <div style={{ fontWeight: 900, color: teamSelBadge.color, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1.1 }}>{teamSelBadge.name}</div>
                      <div style={{ fontSize: "0.6rem", color: "#cbd5e1", fontWeight: 600 }}>{metrics.teamSelections || 0} team</div>
                    </div>
                  </div>
                  {nextTeamSelBadge && (
                    <div style={{ marginTop: "0px", paddingTop: "4px", borderTop: "1px dashed rgba(255,255,255,0.12)", fontSize: "0.58rem", color: "#94a3b8" }}>
                      Next: <span style={{ color: nextTeamSelBadge.color, fontWeight: 700 }}>{nextTeamSelBadge.name}</span> ({nextTeamSelBadge.min - (metrics.teamSelections || 0)} left)
                    </div>
                  )}
                </div>
              )}

              {/* JOININGS */}
              <div style={{ border: `1.5px solid ${joinBadge.color}`, borderRadius: "8px", padding: "6px 8px", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", boxShadow: `0 4px 12px ${joinBadge.color}20`, color: "white", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", marginBottom: "1px", letterSpacing: "0.5px" }}>JOININGS</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <GlowingEmblem icon={joinBadge.icon} color={joinBadge.color} size="32px" />
                  <div>
                    <div style={{ fontWeight: 900, color: joinBadge.color, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1.1 }}>{joinBadge.name}</div>
                    <div style={{ fontSize: "0.6rem", color: "#cbd5e1", fontWeight: 600 }}>{metrics.joinings || 0} pers</div>
                  </div>
                </div>
                {nextJoinBadge && (
                  <div style={{ marginTop: "0px", paddingTop: "4px", borderTop: "1px dashed rgba(255,255,255,0.12)", fontSize: "0.58rem", color: "#94a3b8" }}>
                    Next: <span style={{ color: nextJoinBadge.color, fontWeight: 700 }}>{nextJoinBadge.name}</span> ({nextJoinBadge.min - (metrics.joinings || 0)} left)
                  </div>
                )}
              </div>

              {/* TEAM JOININGS (TL/Manager only) */}
              {(isTL || isManager) && (
                <div style={{ border: `1.5px solid ${teamJoinBadge.color}`, borderRadius: "8px", padding: "6px 8px", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", boxShadow: `0 4px 12px ${teamJoinBadge.color}20`, color: "white", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ fontSize: "0.55rem", fontWeight: 900, color: "#94a3b8", marginBottom: "1px", letterSpacing: "0.5px" }}>TEAM JOININGS</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <GlowingEmblem icon={teamJoinBadge.icon} color={teamJoinBadge.color} size="32px" />
                    <div>
                      <div style={{ fontWeight: 900, color: teamJoinBadge.color, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1.1 }}>{teamJoinBadge.name}</div>
                      <div style={{ fontSize: "0.6rem", color: "#cbd5e1", fontWeight: 600 }}>{metrics.teamJoinings || 0} team</div>
                    </div>
                  </div>
                  {nextTeamJoinBadge && (
                    <div style={{ marginTop: "0px", paddingTop: "4px", borderTop: "1px dashed rgba(255,255,255,0.12)", fontSize: "0.58rem", color: "#94a3b8" }}>
                      Next: <span style={{ color: nextTeamJoinBadge.color, fontWeight: 700 }}>{nextTeamJoinBadge.name}</span> ({nextTeamJoinBadge.min - (metrics.teamJoinings || 0)} left)
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* DYNAMIC SOURCING CONVERSION FUNNEL */}
          <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "8px 10px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: 800 }}><LucideTarget size={13} color="#f59e0b" /> Dynamic Sourcing Conversion Funnel</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {[
                { stage: "Sourced Candidates", count: funnelSourced, color: "#3b82f6", width: "100%" },
                { stage: "Connected Outreach", count: funnelConnected, color: "#06b6d4", width: `${(funnelConnected / funnelSourced) * 100}%` },
                { stage: "Mandate Interviews", count: funnelInterview, color: "#8b5cf6", width: `${(funnelInterview / funnelSourced) * 100}%` },
                { stage: "Placements / Selections", count: funnelSelected, color: "#10b981", width: `${(funnelSelected / funnelSourced) * 100}%` }
              ].map((row, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontWeight: 700, marginBottom: "1px" }}>
                    <span>{row.stage}</span>
                    <span style={{ color: row.color }}>{row.count} ({Math.round((row.count / funnelSourced) * 100)}%)</span>
                  </div>
                  <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: row.width, height: "100%", background: row.color, borderRadius: "2px", transition: "width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCTIVITY TICKER HEATMAP */}
          <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "8px 10px" }}>
            <h3 style={{ margin: "0 0 2px 0", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: 800 }}><LucideCheckCircle2 size={13} color="#10b981" /> Productivity Ticker Heatmap</h3>
            <div style={{ fontSize: "0.6rem", color: "#64748b", marginBottom: "6px" }}>Visual representation of your daily points earning transactions across the last 28 days.</div>
            
            <div style={{ display: "flex", gap: "3px", justifyContent: "space-between", flexWrap: "wrap" }}>
              {Array.from({ length: 28 }).map((_, idx) => {
                // Determine color depth based on metrics history index
                const pointsCount = (metrics.history || []).filter((h: any) => {
                  const dayDiff = Math.floor((Date.now() - new Date(h.createdAt).getTime()) / 86400000);
                  return dayDiff === idx;
                }).length;

                const bg = pointsCount > 3 ? "#047857" : pointsCount > 1 ? "#10b981" : pointsCount > 0 ? "#a7f3d0" : "#f1f5f9";
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      width: "18px", 
                      height: "18px", 
                      borderRadius: "3px", 
                      background: bg,
                      border: "1px solid rgba(0,0,0,0.03)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.55rem",
                      fontWeight: 900,
                      color: pointsCount > 1 ? "white" : "#64748b"
                    }}
                    title={`${pointsCount} actions completed ${idx} days ago`}
                  >
                    {pointsCount > 0 ? `+${pointsCount}` : ""}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* LEADERBOARD & ACTIVE MILESTONES ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "8px" }}>
        
        {/* COIN LEADERBOARD */}
        <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "8px 10px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 2px 4px -1px rgba(0,0,0,0.01)" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ background: "#fef3c7", padding: "4px", borderRadius: "6px", color: "#d97706" }}><LucideTrophy size={13} /></div>
              <h2 style={{ fontSize: "0.82rem", fontWeight: 800, margin: 0 }}>
                {leaderboardType === "personal" ? "Coin Leaderboard" : leaderboardType === "team" ? "Team Leaderboard" : "Overall Team Leaderboard"}
              </h2>
            </div>

            {/* Segmented control for TL/Manager */}
            {(isTL || isManager) && (
              <div style={{ display: "flex", background: "#f1f5f9", padding: "2px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                {(["personal", "team", "overall"] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setLeaderboardType(type)}
                    style={{ 
                      padding: "2px 6px", 
                      borderRadius: "4px", 
                      border: "none", 
                      fontSize: "0.6rem", 
                      fontWeight: 800, 
                      cursor: "pointer", 
                      background: leaderboardType === type ? "white" : "transparent",
                      color: leaderboardType === type ? "#2563eb" : "#64748b",
                      boxShadow: leaderboardType === type ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                      textTransform: "capitalize"
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
            {leaderboard.map((member, i) => {
              const isSelf = member.id === userId;
              return (
                <div key={member.id || i} style={{ 
                  display: "flex", alignItems: "center", justifyContent: "space-between", 
                  background: isSelf ? "#eff6ff" : "transparent",
                  border: isSelf ? "1.5px solid #bfdbfe" : "1px solid #f1f5f9",
                  padding: "5px 8px", borderRadius: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "18px", height: "18px", background: i===0?"#fef3c7":i===1?"#f1f5f9":i===2?"#ffedd5":"#f8fafc", color: i===0?"#d97706":i===1?"#475569":i===2?"#c2410c":"#94a3b8", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"4px", fontWeight:900, fontSize: "0.62rem" }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: isSelf ? 800 : 600, color: isSelf ? "#1e40af" : "#334155", fontSize: "0.68rem", lineHeight: 1.1 }}>
                        {member.name}
                      </div>
                      <span style={{ fontSize: "0.55rem", background: "#f1f5f9", color: "#64748b", padding: "0.5px 3px", borderRadius: "2px", fontWeight: 700 }}>{member.badge}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px", fontWeight: 800, color: "#f59e0b", fontSize: "0.72rem" }}>
                    <LucideCoins size={10} /> {member.coins}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVE MILESTONES */}
        <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "8px 10px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 2px 4px -1px rgba(0,0,0,0.01)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
            <div style={{ background: "#ecfdf5", padding: "4px", borderRadius: "6px", color: "#059669" }}><LucideStar size={13} /></div>
            <h2 style={{ fontSize: "0.82rem", fontWeight: 800, margin: 0 }}>Active Milestones</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { title: "First 10 Sourced", progress: Math.min(10, metrics.sourced || 0), target: 10, reward: "+10 CR" },
              { title: "Joining Expert", progress: Math.min(2, metrics.joinings || 0), target: 2, reward: "+50 CR" },
              { title: "Selection Master", progress: Math.min(5, metrics.selections || 0), target: 5, reward: "+25 CR" },
            ].map(m => (
              <div key={m.title} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "5px 8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <div style={{ fontWeight: 700, color: "#334155", fontSize: "0.65rem" }}>{m.title}</div>
                  <div style={{ fontSize: "0.55rem", fontWeight: 800, color: "#059669", background: "#d1fae5", padding: "1px 3px", borderRadius: "2px" }}>{m.reward}</div>
                </div>
                <div style={{ height: "3px", background: "#e2e8f0", borderRadius: "1.5px", overflow: "hidden" }}>
                  <div style={{ width: `${(m.progress / m.target) * 100}%`, height: "100%", background: m.progress >= m.target ? "#10b981" : "#3b82f6", borderRadius: "1.5px" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px", fontSize: "0.55rem", color: "#64748b", fontWeight: 600 }}>
                  <span>{m.progress >= m.target ? "Completed!" : `${m.target - m.progress} left`}</span>
                  <span>{m.progress} / {m.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
