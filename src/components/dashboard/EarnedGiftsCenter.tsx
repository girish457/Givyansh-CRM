import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LucideGift, LucideAward, LucideTrophy, LucideTrendingUp,
  LucideUsers, LucideActivity, LucideDownload, LucideSearch,
  LucidePlus, LucideCheckCircle2, LucideCalendar, LucideUser,
  LucideFilter, LucideAlertCircle, LucideGlobe, LucideFileText,
  LucideSparkles, LucideChevronDown, LucideXCircle, LucidePencil,
  LucideCheck, LucideTicket, LucideCoffee, LucideCreditCard, LucideShoppingBag,
  LucideClock, LucidePartyPopper, LucideFileSpreadsheet, LucidePrinter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GiftData {
  id: string;
  title: string;
  type: string;
  value: number;
  message: string;
  category: string;
  expiryDate?: string;
  details?: any; // Voucher codes, booking details, coupon codes
  recipients: { id: number; name: string; role: string }[];
  date: string;
  status: "Pending" | "Claimed";
  sharedCandidates?: any[];
  notes?: string;
}

// Confetti canvas helper
const ConfettiCanvas = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#f43f5e", "#3b82f6", "#10b981", "#eab308", "#a855f7", "#ff7849"];
    const particles = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const timer = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
    }, 4000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 999999
      }}
    />
  );
};

export default function EarnedGiftsCenter({ role }: { role: "tl" | "recruiter" }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [giftsList, setGiftsList] = useState<GiftData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<GiftData | null>(null);
  const [activeNotificationGift, setActiveNotificationGift] = useState<GiftData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "timeline">("dashboard");

  // Database search / filters for candidate data card
  const [candSearch, setCandSearch] = useState("");
  const [candLocationFilter, setCandLocationFilter] = useState("All");
  const [candExperienceFilter, setCandExperienceFilter] = useState("All");

  // History search / filters
  const [historySearch, setHistorySearch] = useState("");
  const [historyDateFilter, setHistoryDateFilter] = useState<"all" | "today" | "week" | "month" | "year">("all");

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    loadGifts();

    // Live Polling checks for real-time notifications when manager issues rewards
    const pollInterval = setInterval(() => {
      loadGifts();
    }, 4000); // Poll every 4 seconds

    // Storage sync listener for real-time claim status sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fast_rms_gifts_v1") {
        loadGifts();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        setCurrentUser(await res.json());
      }
    } catch (err) {
      console.error("Failed to load active profile:", err);
    }
  };

  const loadGifts = () => {
    try {
      const activeUser = currentUser || JSON.parse(localStorage.getItem("crm_active_user") || "{}");
      const activeId = activeUser?.id || activeUser?.userId;
      if (!activeId) return;

      const stored = localStorage.getItem("fast_rms_gifts_v1");
      const allGifts: GiftData[] = stored ? JSON.parse(stored) : [];

      // Filter rewards where this employee is in the recipient list
      const myGifts = allGifts.filter(g =>
        g.recipients.some(r => Number(r.id) === Number(activeId))
      );

      // Real-time Popup trigger: Check if there's any new un-acknowledged gift
      const acknowledgedKey = `fast_rms_acknowledged_gifts_${activeId}`;
      const ackList: string[] = JSON.parse(localStorage.getItem(acknowledgedKey) || "[]");

      const unacknowledged = myGifts.find(g => !ackList.includes(g.id));
      if (unacknowledged && !activeNotificationGift) {
        setActiveNotificationGift(unacknowledged);
        setShowConfetti(true);
        // Mark as acknowledged so it doesn't pop up again
        ackList.push(unacknowledged.id);
        localStorage.setItem(acknowledgedKey, JSON.stringify(ackList));
      }

      setGiftsList(myGifts);
    } catch (err) {
      console.error("Error reading gifts log:", err);
    } finally {
      setLoading(false);
    }
  };

  // Analytics Computation
  const stats = useMemo(() => {
    const totalCount = giftsList.length;
    let totalValue = 0;
    let pendingClaimCount = 0;

    giftsList.forEach(g => {
      totalValue += Number(g.value) || 0;
      if (g.status === "Pending") pendingClaimCount++;
    });

    return {
      totalCount,
      totalValue,
      pendingClaimCount
    };
  }, [giftsList]);

  // Automatic Badge Recognition System
  const earnedBadges = useMemo(() => {
    const badges: { badge: string; desc: string; icon: string }[] = [];
    const totalVal = stats.totalValue;

    // Badges computation rules
    if (stats.totalCount >= 5) {
      badges.push({ badge: "🏆 Top Performer", desc: "Awarded for earning 5+ recognition gifts", icon: "🏆" });
    }
    if (giftsList.some(g => g.category?.toLowerCase().includes("placement") || g.category?.toLowerCase().includes("hiring"))) {
      badges.push({ badge: "🎯 Hiring Champion", desc: "For direct hiring closure milestones", icon: "🎯" });
    }
    if (giftsList.some(g => g.value >= 10000)) {
      badges.push({ badge: "👑 Joining King", desc: "Earned a bounty worth ₹10,000+", icon: "👑" });
    }
    if (giftsList.some(g => g.type?.toLowerCase().includes("cash"))) {
      badges.push({ badge: "🚀 Fast Closer", desc: "Spot closure cash award earned", icon: "🚀" });
    }
    if (stats.totalCount >= 3) {
      badges.push({ badge: "🔥 Consistency Star", desc: "Maintains strong consecutive logs", icon: "🔥" });
    }
    if (giftsList.some(g => g.type === "Candidate Data Reward")) {
      badges.push({ badge: "⭐ Lead Generator", desc: "Earned pipeline database support", icon: "⭐" });
    }
    if (giftsList.some(g => g.title?.toLowerCase().includes("month"))) {
      badges.push({ badge: "🥇 Monthly Winner", desc: "Awarded Monthly Performer reward", icon: "🥇" });
    }

    // Fallback default starter badge
    if (badges.length === 0 && stats.totalCount > 0) {
      badges.push({ badge: "🌟 Rising Talent", desc: "Registered first recognition milestone", icon: "🌟" });
    }

    return badges;
  }, [giftsList, stats]);

  // Filtered candidate records inside selected Candidate Database card
  const filteredSharedCandidates = useMemo(() => {
    if (!selectedGift || !selectedGift.sharedCandidates) return [];
    return selectedGift.sharedCandidates.filter(c => {
      const matchesSearch = c.name?.toLowerCase().includes(candSearch.toLowerCase()) ||
        c.phone?.includes(candSearch) ||
        c.email?.toLowerCase().includes(candSearch.toLowerCase()) ||
        c.jobRole?.toLowerCase().includes(candSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (candLocationFilter !== "All" && c.city !== candLocationFilter && c.state !== candLocationFilter) return false;
      if (candExperienceFilter !== "All" && c.totalExperience !== candExperienceFilter) return false;

      return true;
    });
  }, [selectedGift, candSearch, candLocationFilter, candExperienceFilter]);

  // Unique options inside shared candidates table
  const sharedCandFilters = useMemo(() => {
    if (!selectedGift || !selectedGift.sharedCandidates) return { locations: ["All"], experiences: ["All"] };
    const locations = new Set<string>();
    const experiences = new Set<string>();

    selectedGift.sharedCandidates.forEach(c => {
      if (c.city) locations.add(c.city);
      if (c.state) locations.add(c.state);
      if (c.totalExperience) experiences.add(c.totalExperience);
    });

    return {
      locations: ["All", ...Array.from(locations)],
      experiences: ["All", ...Array.from(experiences)]
    };
  }, [selectedGift]);

  // Historical lists mapping
  const filteredHistory = useMemo(() => {
    return giftsList.filter(g => {
      const matchesSearch = g.title.toLowerCase().includes(historySearch.toLowerCase()) ||
        g.category.toLowerCase().includes(historySearch.toLowerCase());

      if (!matchesSearch) return false;

      if (historyDateFilter !== "all") {
        const giftDate = new Date(g.date);
        const diffTime = Math.abs(Date.now() - giftDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (historyDateFilter === "today" && diffDays > 1) return false;
        if (historyDateFilter === "week" && diffDays > 7) return false;
        if (historyDateFilter === "month" && diffDays > 30) return false;
        if (historyDateFilter === "year" && diffDays > 365) return false;
      }
      return true;
    });
  }, [giftsList, historySearch, historyDateFilter]);

  // Export functions
  const exportHistoryCSV = () => {
    const headers = ["Reward Title", "Category", "Worth Value", "Received Date", "Status"];
    const rows = giftsList.map(g => [
      g.title,
      g.category,
      `INR ${g.value}`,
      new Date(g.date).toLocaleDateString(),
      g.status
    ]);

    const csvStr = [
      headers.join(","),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Fast_RMS_My_Earned_Gifts_${currentUser?.name || "Employee"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Gifted Candidates to CSV
  const exportGiftedCandidatesCSV = (gift: GiftData) => {
    if (!gift.sharedCandidates || gift.sharedCandidates.length === 0) return;
    const headers = ["Name", "Phone", "Email", "Qualification", "Experience", "Category", "City", "State"];
    const rows = gift.sharedCandidates.map(c => [
      c.name,
      c.phone,
      c.email || "N/A",
      c.qualification || "N/A",
      c.totalExperience || "N/A",
      c.category || "N/A",
      c.city || "N/A",
      c.state || "N/A"
    ]);

    const csvStr = [
      headers.join(","),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Shared_Candidates_Database_${gift.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable HTML popups for printing specific rewards
  const triggerPrintReceipt = (gift: GiftData) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Fast RMS Recognition Incentive Voucher</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .voucher { border: 3px double #cbd5e1; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; text-align: center; }
            .badge { display: inline-block; font-weight: 850; text-transform: uppercase; background: #fef3c7; color: #b45309; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; margin-bottom: 20px; }
            .value { font-size: 2.5rem; font-weight: 900; color: #10b981; margin: 15px 0; }
            h2 { margin: 0 0 10px 0; font-size: 1.5rem; }
            p { color: #64748b; line-height: 1.6; }
            .footer { border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; font-size: 0.75rem; color: #94a3b8; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="voucher">
            <div class="badge">OFFICIAL RECOGNITION VOUCHER</div>
            <h2>🏆 ${gift.title}</h2>
            <p>${gift.category}</p>
            <div class="value">₹${gift.value}</div>
            <p>" ${gift.message} "</p>
            <div class="footer">
              FAST RMS RECRUITMENT SYSTEMS &bull; ISSUED ON ${new Date(gift.date).toLocaleDateString()} &bull; EXPIRES ${gift.expiryDate || "N/A"}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const claimVoucher = (giftId: string) => {
    const stored = localStorage.getItem("fast_rms_gifts_v1");
    if (!stored) return;
    const list: GiftData[] = JSON.parse(stored);
    const updated = list.map(g => g.id === giftId ? { ...g, status: "Claimed" as const } : g);
    localStorage.setItem("fast_rms_gifts_v1", JSON.stringify(updated));

    // Update local state
    setGiftsList(prev => prev.map(g => g.id === giftId ? { ...g, status: "Claimed" } : g));
    if (selectedGift && selectedGift.id === giftId) {
      setSelectedGift(prev => prev ? { ...prev, status: "Claimed" } : null);
    }
    alert("🎉 Voucher claimed successfully! Details unlocked.");
  };

  return (
    <div className="gifts-command-hub" style={{ padding: "12px 16px", color: "#1e293b", fontFamily: "'Inter', sans-serif" }}>

      {/* Background Confetti when new gift pops up */}
      <ConfettiCanvas active={showConfetti} />

      {/* Real-time interactive Gift Popup */}
      <AnimatePresence>
        {activeNotificationGift && (
          <div style={{ position: "fixed", inset: 0, zIndex: 999999, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              style={{
                background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)",
                borderRadius: "20px",
                border: "2px solid #fbbf24",
                padding: "20px 24px",
                width: "100%",
                maxWidth: "380px",
                color: "#ffffff",
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 4, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: "3rem", marginBottom: "8px" }}
              >
                🎁
              </motion.div>

              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.5px", color: "#fbbf24", margin: 0 }}>
                🎉 New Reward Allocated!
              </h2>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "6px", margin: "6px 0 0" }}>
                {activeNotificationGift.title}
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "0.8rem", margin: "10px 0", lineHeight: 1.4 }}>
                " {activeNotificationGift.message} "
              </p>

              <div style={{ background: "rgba(255,255,255,0.08)", padding: "8px", borderRadius: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "0.65rem", color: "#94a3b8", display: "block" }}>ESTIMATED WORTH VALUE</span>
                <strong style={{ fontSize: "1.1rem", color: "#10b981" }}>₹{activeNotificationGift.value}</strong>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    setSelectedGift(activeNotificationGift);
                    setActiveNotificationGift(null);
                    setShowConfetti(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                >
                  🔓 Open Card
                </button>
                <button
                  onClick={() => {
                    setActiveNotificationGift(null);
                    setShowConfetti(false);
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Header banner */}
      <div
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, #090514 0%, #1e1b4b 100%)",
          color: "#ffffff",
          padding: "1.25rem 1.5rem",
          borderRadius: "14px",
          marginBottom: "1rem",
          border: "1px solid rgba(251, 191, 36, 0.2)",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)"
        }}
      >
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)", borderRadius: "50%" }}></div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontSize: "0.6rem", fontWeight: 800, padding: "3px 8px", borderRadius: "12px", border: "1px solid rgba(251,191,36,0.25)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              🏆 My Reward Console
            </span>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginTop: "8px", letterSpacing: "-0.5px", margin: "8px 0 0 0" }}>
              <span style={{ color: "#ffffff" }}>My Earned </span>
              <span style={{ color: "#fbbf24" }}>Recognition & Gifts</span>
            </h1>
            <p style={{ color: "#cbd5e1", fontSize: "0.8rem", marginTop: "3px", margin: "3px 0 0 0" }}>
              Review lifetime closure bonuses, shopping vouchers, spot rewards, and candidate pipeline databases.
            </p>
          </div>
          <div style={{ fontSize: "3rem" }}>
            🏆
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: "8px", marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
          {[
            { id: "dashboard", name: "Rewards Dashboard", icon: <LucideActivity size={14} /> },
            { id: "history", name: "Incentives History", icon: <LucideFileText size={14} /> },
            { id: "timeline", name: "Milestone Timeline", icon: <LucideClock size={14} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                border: "none",
                background: activeTab === t.id ? "#fbbf24" : "rgba(255,255,255,0.05)",
                color: activeTab === t.id ? "#1e1b4b" : "#ffffff",
                boxShadow: activeTab === t.id ? "0 4px 12px rgba(251, 191, 36, 0.2)" : "none"
              }}
            >
              {t.icon}
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main interactive layouts based on tabs */}
      <AnimatePresence mode="wait">
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid-2-1"
            style={{ display: "grid", gridTemplateColumns: "2.3fr 1fr", gap: "1rem" }}
          >
            {/* Left Main Cards Section */}
            <div>
              {/* Personal Analytics overview row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                {[
                  { title: "Gifts Earned", val: stats.totalCount, icon: "🎁", color: "#6366f1" },
                  { title: "Total Value Earned", val: `₹${stats.totalValue.toLocaleString()}`, icon: "💰", color: "#10b981" },
                  { title: "Unclaimed Vouchers", val: stats.pendingClaimCount, icon: "🔑", color: "#f59e0b" }
                ].map((s, i) => (
                  <div key={i} className="glass-card" style={{ padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0", background: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{s.title}</span>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginTop: "2px", margin: "2px 0 0 0" }}>{s.val}</h3>
                    </div>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${s.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
                      {s.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Earned Gift Card pool */}
              <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>
                💌 My Unlocked Gift Cards
              </h2>

              {giftsList.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {giftsList.map(gift => (
                    <div
                      key={gift.id}
                      onClick={() => setSelectedGift(gift)}
                      className="glass-card"
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "14px",
                        cursor: "pointer",
                        border: "1px solid #e2e8f0",
                        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                        transition: "all 0.2s",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      {gift.status === "Pending" && (
                        <div style={{ position: "absolute", top: "8px", right: "8px", background: "#f59e0b15", color: "#d97706", fontSize: "0.6rem", fontWeight: 800, padding: "2px 6px", borderRadius: "12px", textTransform: "uppercase" }}>
                          Unclaimed
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fbbf2415", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                          {gift.type === "Candidate Data Reward" ? "📂" : "🎁"}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                          <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                            {gift.type}
                          </span>
                          <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", margin: "1px 0 0 0", lineHeight: 1.2, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {gift.title}
                          </h4>
                          <span style={{ fontSize: "0.65rem", color: "#94a3b8", display: "block", marginTop: "2px" }}>
                            {new Date(gift.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid #cbd5e120", marginTop: "10px", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Reward Value:</span>
                        <strong style={{ fontSize: "0.9rem", color: "#10b981" }}>₹{gift.value}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card" style={{ padding: "2rem", textAlign: "center", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "2rem" }}>📁</span>
                  <h3 style={{ marginTop: "8px", fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: "8px 0 0 0" }}>No earned gifts found yet</h3>
                  <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "4px", margin: "4px 0 0 0" }}>
                    Complete closures, achieve targets, and keep performance high. Your manager's rewards will show up here immediately!
                  </p>
                </div>
              )}
            </div>

            {/* Right Badges Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="glass-card" style={{ padding: "1rem", borderRadius: "14px", background: "white", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  🏆 Milestone Medals
                </h3>
                <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px", margin: "2px 0 0 0", lineHeight: 1.3 }}>
                  Automatic recognition levels based on rewards received.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                  {earnedBadges.length > 0 ? (
                    earnedBadges.map((b, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "10px", background: "#fffbeb", border: "1px solid #fef3c7" }}>
                        <span style={{ fontSize: "1.2rem" }}>{b.icon}</span>
                        <div style={{ overflow: "hidden" }}>
                          <strong style={{ fontSize: "0.75rem", color: "#b45309", display: "block" }}>{b.badge}</strong>
                          <span style={{ fontSize: "0.65rem", color: "#78350f", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{b.desc}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      No milestone medals earned yet.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Incentive Logs Panel */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card"
            style={{ padding: "1.25rem", borderRadius: "14px", background: "#ffffff", border: "1px solid #e2e8f0" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                📜 Rewards History Logs & Claim Registry
              </h2>
              <button
                onClick={exportHistoryCSV}
                className="btn-secondary glass"
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, border: "1px solid #cbd5e1", background: "none", cursor: "pointer" }}
              >
                <LucideDownload size={14} /> Export History
              </button>
            </div>

            {/* Filter controls */}
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", marginBottom: "10px" }}>
              <div className="search-bar-modern" style={{ flex: 1, background: "#f8fafc", padding: "4px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", display: "flex", alignItems: "center", gap: "6px" }}>
                <LucideSearch size={14} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search reward logs..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "0.8rem", width: "100%", background: "transparent" }}
                />
              </div>

              <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
                {[
                  { id: "all", label: "All Logs" },
                  { id: "today", label: "Today" },
                  { id: "week", label: "Week" },
                  { id: "month", label: "Month" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setHistoryDateFilter(opt.id as any)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: historyDateFilter === opt.id ? "#1e293b" : "transparent",
                      color: historyDateFilter === opt.id ? "white" : "#475569"
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* History Table */}
            <div style={{ overflowX: "auto" }}>
              <table className="crm-table-v3" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #cbd5e1", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>Reward Title</th>
                    <th style={{ padding: "8px" }}>Category</th>
                    <th style={{ padding: "8px" }}>Financial Worth</th>
                    <th style={{ padding: "8px" }}>Date Received</th>
                    <th style={{ padding: "8px" }}>Claim Status</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map(gift => (
                      <tr key={gift.id} className="candidate-row-v3" style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px" }}>
                          <strong>{gift.title}</strong>
                          <span style={{ fontSize: "0.7rem", color: "#64748b", display: "block" }}>{gift.message.slice(0, 50)}...</span>
                        </td>
                        <td style={{ padding: "8px" }}>{gift.category}</td>
                        <td style={{ padding: "8px" }}><strong>₹{gift.value}</strong></td>
                        <td style={{ padding: "8px" }}>{new Date(gift.date).toLocaleDateString()}</td>
                        <td style={{ padding: "8px" }}>
                          <span className={`status-pill ${gift.status === "Claimed" ? "joined" : "new"}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                            {gift.status}
                          </span>
                        </td>
                        <td style={{ padding: "8px", textAlign: "right" }}>
                          <button
                            onClick={() => setSelectedGift(gift)}
                            className="btn-profile-view"
                            title="Open Card"
                            style={{ padding: "4px 8px", borderRadius: "6px", background: "#f1f5f9", border: "1px solid #cbd5e1", cursor: "pointer" }}
                          >
                            <LucideSearch size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                        📁 No history logs found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Milestone Timeline panel */}
        {activeTab === "timeline" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card"
            style={{ padding: "1.25rem", borderRadius: "14px", background: "#ffffff", border: "1px solid #e2e8f0" }}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "16px", margin: "0 0 16px 0" }}>
              ⏳ Lifetime Reward Milestones Timeline
            </h2>

            {giftsList.length > 0 ? (
              <div style={{ position: "relative", paddingLeft: "24px", borderLeft: "2px solid #cbd5e1", marginLeft: "10px" }}>
                {giftsList.map((gift, i) => (
                  <div key={gift.id} style={{ position: "relative", marginBottom: "20px" }}>
                    <div style={{ position: "absolute", left: "-31px", top: "2px", width: "12px", height: "12px", borderRadius: "50%", background: "#fbbf24", border: "3px solid #ffffff", display: "flex", alignItems: "center", justifyContent: "center" }} />

                    <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 800 }}>
                      {new Date(gift.date).toLocaleDateString()}
                    </span>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#0f172a", marginTop: "2px", margin: "2px 0 0 0" }}>
                      {gift.title}
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "#475569", marginTop: "2px", margin: "2px 0 0 0" }}>
                      " {gift.message} "
                    </p>
                    <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                      <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", color: "#334155", fontWeight: 700 }}>
                        {gift.category}
                      </span>
                      <span style={{ background: "#e0f2fe", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", color: "#0369a1", fontWeight: 700 }}>
                        Value Worth: ₹{gift.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "0.8rem" }}>
                ⏳ Timeline is empty. Earn your first milestone!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared Candidate Database or Voucher details popup */}
      <AnimatePresence>
        {selectedGift && (
          <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <motion.div
              initial={{ scale: 0.97, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 15 }}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: selectedGift.type === "Candidate Data Reward" ? "820px" : "480px",
                maxHeight: "85vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)"
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)",
                  padding: "12px 20px",
                  color: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <span style={{ fontSize: "0.6rem", color: "#fbbf24", fontWeight: 800, textTransform: "uppercase" }}>
                    {selectedGift.type}
                  </span>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, marginTop: "2px", margin: "2px 0 0 0" }}>
                    {selectedGift.title}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedGift(null);
                    setCandSearch("");
                    setCandLocationFilter("All");
                    setCandExperienceFilter("All");
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}
                >
                  <LucideXCircle size={20} />
                </button>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

                {/* Motivation messages */}
                <div style={{ background: "#f8fafc", borderLeft: "3px solid #fbbf24", padding: "10px 14px", borderRadius: "0 8px 8px 0", marginBottom: "16px" }}>
                  <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 800, display: "block", textTransform: "uppercase" }}>
                    Manager Motivation Note
                  </span>
                  <p style={{ margin: "2px 0 0", fontStyle: "italic", fontSize: "0.8rem", color: "#334155", lineHeight: 1.4 }}>
                    " {selectedGift.message} "
                  </p>
                </div>

                {/* Details layout depending on type */}
                {selectedGift.type === "Candidate Data Reward" ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        📂 Shared Candidates List ({selectedGift.sharedCandidates?.length || 0} Records)
                      </h4>
                      <button
                        onClick={() => exportGiftedCandidatesCSV(selectedGift)}
                        className="btn-secondary glass"
                        style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, border: "1px solid #cbd5e1", background: "none", cursor: "pointer" }}
                      >
                        <LucideFileSpreadsheet size={12} /> Export CSV
                      </button>
                    </div>

                    {/* Shared candidates search and filtering */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "6px", marginBottom: "10px" }}>
                      <div className="search-bar-modern" style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", display: "flex", alignItems: "center", gap: "4px" }}>
                        <LucideSearch size={12} color="#94a3b8" />
                        <input
                          type="text"
                          placeholder="Search database..."
                          value={candSearch}
                          onChange={e => setCandSearch(e.target.value)}
                          style={{ border: "none", outline: "none", fontSize: "0.75rem", width: "100%", background: "transparent" }}
                        />
                      </div>

                      <select
                        value={candLocationFilter}
                        onChange={e => setCandLocationFilter(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", outline: "none" }}
                      >
                        <option value="All">All Locations</option>
                        {sharedCandFilters.locations.filter(x => x !== "All").map((l, i) => (
                          <option key={i} value={l}>{l}</option>
                        ))}
                      </select>

                      <select
                        value={candExperienceFilter}
                        onChange={e => setCandExperienceFilter(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", outline: "none" }}
                      >
                        <option value="All">All Experiences</option>
                        {sharedCandFilters.experiences.filter(x => x !== "All").map((exp, i) => (
                          <option key={i} value={exp}>{exp}</option>
                        ))}
                      </select>
                    </div>

                    {/* Candidates Database Table */}
                    <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                      <table className="crm-table-v3" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid #cbd5e1", textAlign: "left", background: "#f8fafc" }}>
                            <th style={{ padding: "6px" }}>Candidate</th>
                            <th style={{ padding: "6px" }}>Job Role</th>
                            <th style={{ padding: "6px" }}>Phone</th>
                            <th style={{ padding: "6px" }}>Email</th>
                            <th style={{ padding: "6px" }}>Location</th>
                            <th style={{ padding: "6px" }}>Experience</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSharedCandidates.length > 0 ? (
                            filteredSharedCandidates.map((c, idx) => (
                              <tr key={idx} className="candidate-row-v3" style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "6px" }}><strong>{c.name}</strong></td>
                                <td style={{ padding: "6px" }}>{c.jobRole || c.designation || "N/A"}</td>
                                <td style={{ padding: "6px" }}>{c.phone}</td>
                                <td style={{ padding: "6px" }}>{c.email || "N/A"}</td>
                                <td style={{ padding: "6px" }}>{c.city && c.state ? `${c.city}, ${c.state}` : c.city || c.state || "N/A"}</td>
                                <td style={{ padding: "6px" }}>{c.totalExperience || "Fresher"}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} style={{ textAlign: "center", padding: "12px", color: "#64748b" }}>
                                No candidates match the search/filters.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* General Voucher codes / ticket IDs */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block" }}>Voucher Category</span>
                        <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>{selectedGift.category}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block" }}>Worth Value</span>
                        <strong style={{ fontSize: "1rem", color: "#10b981" }}>₹{selectedGift.value}</strong>
                      </div>

                      <div style={{ gridColumn: "span 2", background: "#f1f5f9", padding: "10px 14px", borderRadius: "10px", marginTop: "8px" }}>
                        {selectedGift.status === "Pending" ? (
                          <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "8px" }}>
                              Voucher is locked. Click below to claim and reveal coupon details.
                            </p>
                            <button
                              onClick={() => claimVoucher(selectedGift.id)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "none",
                                background: "#fbbf24",
                                color: "#1e1b4b",
                                fontWeight: 800,
                                fontSize: "0.75rem",
                                cursor: "pointer"
                              }}
                            >
                              🔑 Claim & Unlock Details
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 800 }}>
                              Claimed Voucher Details
                            </span>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                              <strong style={{ fontSize: "1.1rem", color: "#2563eb", fontFamily: "monospace" }}>
                                {selectedGift.details?.voucherCode || selectedGift.details?.couponCode || selectedGift.details?.ticketCode || "COMPLETED"}
                              </strong>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedGift.details?.voucherCode || selectedGift.details?.couponCode || selectedGift.details?.ticketCode || "");
                                  alert("Copied code to clipboard!");
                                }}
                                style={{
                                  border: "none",
                                  background: "#e0f2fe",
                                  color: "#0369a1",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontSize: "0.7rem",
                                  fontWeight: 800,
                                  cursor: "pointer"
                                }}
                              >
                                Copy
                              </button>
                            </div>

                            {selectedGift.details?.note && (
                              <p style={{ fontSize: "0.75rem", color: "#475569", marginTop: "6px", margin: "6px 0 0 0" }}>
                                <strong>Admin Note:</strong> {selectedGift.details.note}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Printer claim receipt trigger */}
                    {selectedGift.status === "Claimed" && (
                      <button
                        onClick={() => triggerPrintReceipt(selectedGift)}
                        className="btn-secondary glass"
                        style={{ width: "100%", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800, border: "1px solid #cbd5e1", background: "none", cursor: "pointer" }}
                      >
                        <LucidePrinter size={14} /> Print Claim Receipt
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
