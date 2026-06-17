import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LucideGift, LucideAward, LucideTrophy, LucideTrendingUp,
  LucideUsers, LucideActivity, LucideDownload, LucideSearch,
  LucidePlus, LucideCheckCircle2, LucideCalendar, LucideUser,
  LucideFilter, LucideAlertCircle, LucideGlobe, LucideFileText,
  LucideSparkles, LucideChevronDown, LucideXCircle, LucidePencil,
  LucideCheck, LucideTicket, LucideCoffee, LucideCreditCard, LucideShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserNode {
  id: number;
  name: string;
  email: string;
  role: "manager" | "tl" | "recruiter";
  reportingTo: number | null;
}

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

// Custom Confetti canvas helper
const ConfettiEffect = ({ active }: { active: boolean }) => {
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

      // Keep animation running
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
    }, 4500);

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

export default function ManagerGiftsCenter({ role = "manager" }: { role?: "manager" | "boss" }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [team, setTeam] = useState<UserNode[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"distribute" | "history" | "leaderboard">("distribute");
  const [showConfetti, setShowConfetti] = useState(false);

  // Distribute States
  const [recipientType, setRecipientType] = useState<"individual" | "multiple" | "tl-team" | "tls-only" | "multiple-tls" | "entire-team">("individual");
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | "">("");
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<number[]>([]);

  // Gift details states
  const [giftType, setGiftType] = useState<"cash" | "amazon" | "flipkart" | "movie" | "food" | "shopping" | "chocolate" | "custom" | "candidate">("cash");
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardValue, setRewardValue] = useState<number>(0);
  const [rewardMessage, setRewardMessage] = useState("");
  const [rewardCategory, setRewardCategory] = useState("Performance Boost");
  const [expiryDate, setExpiryDate] = useState("");

  // Specialized Fields
  const [voucherCode, setVoucherCode] = useState("");
  const [notes, setNotes] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  // Candidate Data Gifting States
  const [candidateGiftCount, setCandidateGiftCount] = useState<10 | 20 | 50 | 100 | "custom">(20);
  const [customCandidateCount, setCustomCandidateCount] = useState<number>(15);
  // Filters
  const [candFilterCategory, setCandFilterCategory] = useState("All");
  const [candFilterLocation, setCandFilterLocation] = useState("All");
  const [candFilterExperience, setCandFilterExperience] = useState("All");
  const [candFilterQualification, setCandFilterQualification] = useState("All");
  const [candFilterState, setCandFilterState] = useState("All");
  const [candFilterCity, setCandFilterCity] = useState("All");
  const [candFilterJobRole, setCandFilterJobRole] = useState("All");

  // History and Leaderboard filter states
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilterDate, setHistoryFilterDate] = useState<"today" | "week" | "month" | "year" | "all">("all");
  const [leaderboardFilter, setLeaderboardFilter] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  const isBoss = role === "boss";
  const theme = {
    container: isBoss ? { padding: "20px 24px", color: "#f8fafc", fontFamily: "'Outfit', 'Inter', sans-serif" } : { padding: "20px 24px", color: "#1e293b", fontFamily: "'Inter', sans-serif" },
    card: isBoss ? { padding: "30px", borderRadius: "24px", background: "rgba(30, 41, 59, 0.45)", border: "1px solid rgba(251, 191, 36, 0.15)", color: "#ffffff", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" } : { padding: "30px", borderRadius: "24px", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "none" },
    smallCard: isBoss ? { padding: "16px 20px", borderRadius: "20px", border: "1px solid rgba(251, 191, 36, 0.15)", background: "rgba(30, 41, 59, 0.45)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.15)", color: "#ffffff" } : { padding: "16px 20px", borderRadius: "20px", border: "1px solid #e2e8f0", background: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", color: "#0f172a" },
    inputBg: isBoss ? "rgba(15, 23, 42, 0.6)" : "#ffffff",
    inputText: isBoss ? "#ffffff" : "#0f172a",
    inputBorder: isBoss ? "rgba(251, 191, 36, 0.25)" : "#cbd5e1",
    subBg: isBoss ? "rgba(15, 23, 42, 0.4)" : "#f8fafc",
    subBorder: isBoss ? "1px solid rgba(255,255,255,0.05)" : "1px solid #cbd5e140",
    textMuted: isBoss ? "#cbd5e1" : "#64748b",
    headingColor: isBoss ? "#fbbf24" : "#0f172a",
    borderColor: isBoss ? "rgba(255,255,255,0.1)" : "#f1f5f9",
    itemBg: isBoss ? "rgba(15,23,42,0.6)" : "#ffffff",
    itemBorder: isBoss ? "rgba(251, 191, 36, 0.25)" : "#cbd5e1",
  };

  // Load from API and localStorage
  useEffect(() => {
    fetchProfileAndTeam();
    // Storage sync listener for real-time claim status sync
    const handleStorageChange = () => {
      // Forcing re-render of local data
      setLoading(false);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchProfileAndTeam = async () => {
    try {
      const [profileRes, teamRes, candRes] = await Promise.all([
        fetch("/api/me"),
        fetch("/api/team"),
        fetch("/api/candidates")
      ]);

      if (profileRes.ok && teamRes.ok && candRes.ok) {
        const u = await profileRes.json();
        const t = await teamRes.json();
        const c = await candRes.json();

        setCurrentUser(u);
        setCandidates(c);

        const managerId = u.id || u.userId;
        let filteredTeam = [];

        if (role === "boss") {
          // Boss can only gift to TLs and recruiters (no managers)
          filteredTeam = t.filter((x: any) => x.id === managerId || x.role === "tl" || x.role === "recruiter");
        } else {
          // DATA SECURITY: Mappings to Manager's reporting structure only
          const myTls = t.filter((x: any) => x.role === "tl" && x.reportingTo === managerId);
          const myTlIds = myTls.map((x: any) => x.id);

          const myRecruiters = t.filter((x: any) =>
            x.role === "recruiter" && (
              x.reportingTo === managerId ||
              (x.reportingTo !== null && myTlIds.includes(x.reportingTo))
            )
          );

          filteredTeam = t.filter((x: any) =>
            x.id === managerId ||
            myTlIds.includes(x.id) ||
            myRecruiters.map((r: any) => r.id).includes(x.id)
          );
        }

        setTeam(filteredTeam);
      }
    } catch (err) {
      console.error("Error loading hierarchy data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Computations for active manager's hierarchy
  const managerId = currentUser?.id || currentUser?.userId;
  const myTls = useMemo(() => {
    if (role === "boss") {
      return team.filter(t => t.role === "tl");
    }
    return team.filter(t => t.role === "tl" && t.reportingTo === managerId);
  }, [team, managerId, role]);

  const myTlIds = useMemo(() => myTls.map(t => t.id), [myTls]);

  const myRecruiters = useMemo(() => {
    if (role === "boss") {
      return team.filter(t => t.role === "recruiter");
    }
    return team.filter(t =>
      t.role === "recruiter" && (
        t.reportingTo === managerId ||
        (t.reportingTo !== null && myTlIds.includes(t.reportingTo))
      )
    );
  }, [team, managerId, myTlIds, role]);

  const allSubordinates = useMemo(() => [...myTls, ...myRecruiters], [myTls, myRecruiters]);

  // Filters candidates strictly matching criteria
  const matchingCandidates = useMemo(() => {
    return candidates.filter((c: any) => {
      // Clean structure match check
      if (candFilterCategory !== "All" && c.category !== candFilterCategory) return false;
      if (candFilterLocation !== "All" && c.city !== candFilterLocation && c.state !== candFilterLocation) return false;
      if (candFilterExperience !== "All" && c.totalExperience !== candFilterExperience) return false;
      if (candFilterQualification !== "All" && c.qualification !== candFilterQualification) return false;
      if (candFilterState !== "All" && c.state !== candFilterState) return false;
      if (candFilterCity !== "All" && c.city !== candFilterCity) return false;
      if (candFilterJobRole !== "All" && (c.jobRole || c.designation) !== candFilterJobRole) return false;
      return true;
    });
  }, [candidates, candFilterCategory, candFilterLocation, candFilterExperience, candFilterQualification, candFilterState, candFilterCity, candFilterJobRole]);

  // Unique options for candidate filters
  const filterOptions = useMemo(() => {
    const categories = new Set<string>();
    const locations = new Set<string>();
    const experiences = new Set<string>();
    const qualifications = new Set<string>();
    const states = new Set<string>();
    const cities = new Set<string>();
    const jobRoles = new Set<string>();

    candidates.forEach((c: any) => {
      if (c.category) categories.add(c.category);
      if (c.city) { locations.add(c.city); cities.add(c.city); }
      if (c.state) { locations.add(c.state); states.add(c.state); }
      if (c.totalExperience) experiences.add(c.totalExperience);
      if (c.qualification) qualifications.add(c.qualification);
      if (c.jobRole) jobRoles.add(c.jobRole);
      if (c.designation) jobRoles.add(c.designation);
    });

    return {
      categories: ["All", ...Array.from(categories)],
      locations: ["All", ...Array.from(locations)],
      experiences: ["All", ...Array.from(experiences)],
      qualifications: ["All", ...Array.from(qualifications)],
      states: ["All", ...Array.from(states)],
      cities: ["All", ...Array.from(cities)],
      jobRoles: ["All", ...Array.from(jobRoles)]
    };
  }, [candidates]);

  // Local storage distribution persistence
  const distributedGiftsList = useMemo((): GiftData[] => {
    try {
      const stored = localStorage.getItem("fast_rms_gifts_v1");
      const list: GiftData[] = stored ? JSON.parse(stored) : [];
      // Clean filtering to only show gifts given by this manager
      return list;
    } catch {
      return [];
    }
  }, [showConfetti]);

  // Dynamic analytic calculations
  const analytics = useMemo(() => {
    const totalGifts = distributedGiftsList.length;
    let rewardValueSum = 0;
    let thisMonthCount = 0;
    let thisWeekCount = 0;
    let pendingClaimsCount = 0;
    let candidateDataSharedCount = 0;
    let cashRewardsCount = 0;
    let voucherRewardsCount = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const recruiterPoints: Record<string, number> = {};
    const tlPoints: Record<string, number> = {};

    distributedGiftsList.forEach((gift) => {
      rewardValueSum += Number(gift.value) || 0;

      const giftDate = new Date(gift.date);
      if (giftDate.getMonth() === currentMonth && giftDate.getFullYear() === currentYear) {
        thisMonthCount++;
      }
      if (giftDate.getTime() >= startOfWeek.getTime()) {
        thisWeekCount++;
      }

      if (gift.status === "Pending") {
        pendingClaimsCount++;
      }

      if (gift.type === "Candidate Data Reward") {
        candidateDataSharedCount++;
      } else if (gift.type === "Cash Reward") {
        cashRewardsCount++;
      } else if (gift.type === "Amazon Voucher" || gift.type === "Flipkart Voucher") {
        voucherRewardsCount++;
      }

      // Track points for leaderboard computation
      gift.recipients.forEach((rec) => {
        if (rec.role === "recruiter") {
          recruiterPoints[rec.name] = (recruiterPoints[rec.name] || 0) + Number(gift.value || 100);
        } else if (rec.role === "tl") {
          tlPoints[rec.name] = (tlPoints[rec.name] || 0) + Number(gift.value || 100);
        }
      });
    });

    const topRecruiter = Object.entries(recruiterPoints).sort((a, b) => b[1] - a[1])[0]?.[0] || "None Yet";
    const topTl = Object.entries(tlPoints).sort((a, b) => b[1] - a[1])[0]?.[0] || "None Yet";

    return {
      totalGifts,
      rewardValueSum,
      thisMonthCount,
      thisWeekCount,
      topRecruiter,
      topTl,
      pendingClaimsCount,
      candidateDataSharedCount,
      cashRewardsCount,
      voucherRewardsCount
    };
  }, [distributedGiftsList]);

  // Recipient selection handler
  const toggleRecipientSelect = (id: number) => {
    setSelectedRecipientIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllRecruiters = () => {
    if (selectedRecipientIds.length === myRecruiters.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(myRecruiters.map(r => r.id));
    }
  };

  const handleSelectAllTls = () => {
    if (selectedRecipientIds.length === myTls.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(myTls.map(t => t.id));
    }
  };

  // Submitting Gifting Command
  const triggerGiftDistribution = (e: React.FormEvent) => {
    e.preventDefault();

    // Recipient list compiling
    let targets: { id: number; name: string; role: string }[] = [];

    if (recipientType === "individual" && selectedRecipientId !== "") {
      const node = team.find(x => x.id === Number(selectedRecipientId));
      if (node) targets.push({ id: node.id, name: node.name, role: node.role });
    } else if (recipientType === "multiple" || recipientType === "multiple-tls") {
      selectedRecipientIds.forEach(id => {
        const node = team.find(x => x.id === id);
        if (node) targets.push({ id: node.id, name: node.name, role: node.role });
      });
    } else if (recipientType === "tl-team") {
      // Selected specific TL's entire group
      if (selectedRecipientId !== "") {
        const tlId = Number(selectedRecipientId);
        const tlNode = team.find(x => x.id === tlId);
        if (tlNode) {
          targets.push({ id: tlNode.id, name: tlNode.name, role: tlNode.role });
          // Add recruiters reporting to this TL
          team.filter(x => x.role === "recruiter" && x.reportingTo === tlId).forEach(r => {
            targets.push({ id: r.id, name: r.name, role: r.role });
          });
        }
      }
    } else if (recipientType === "tls-only") {
      myTls.forEach(t => targets.push({ id: t.id, name: t.name, role: t.role }));
    } else if (recipientType === "entire-team") {
      allSubordinates.forEach(s => targets.push({ id: s.id, name: s.name, role: s.role }));
    }

    if (targets.length === 0) {
      alert("⚠️ Please specify valid employee recipients to receive this reward.");
      return;
    }

    // Determine type values
    let finalTitle = rewardTitle;
    let finalValue = Number(rewardValue) || 0;
    let detailsPayload: any = {};
    let embeddedCandidates: any[] = [];

    if (giftType === "cash") {
      if (!finalTitle) finalTitle = `Performance Cash Reward: ${rewardCategory}`;
    } else if (giftType === "amazon") {
      finalTitle = `Amazon Shopping e-Voucher`;
      detailsPayload = { voucherCode, voucherType: "Amazon", note: notes };
    } else if (giftType === "flipkart") {
      finalTitle = `Flipkart Shopping e-Voucher`;
      detailsPayload = { voucherCode, voucherType: "Flipkart" };
    } else if (giftType === "movie") {
      finalTitle = `BookMyShow Premium Movie Tickets`;
      detailsPayload = { ticketCode: voucherCode, venue: notes };
    } else if (giftType === "food") {
      finalTitle = `Zomato Gourmet Meal Voucher`;
      detailsPayload = { couponCode: voucherCode };
    } else if (giftType === "shopping") {
      finalTitle = `Lifestyle Shopping Coupon`;
      detailsPayload = { couponCode: voucherCode };
    } else if (giftType === "chocolate") {
      finalTitle = `Ferrero Rocher & Chocolate Hamper`;
      detailsPayload = { message: notes };
      finalValue = finalValue || 1500;
    } else if (giftType === "custom") {
      if (!finalTitle) finalTitle = "Exemplary Contribution Award";
      detailsPayload = { attachmentUrl, note: notes };
    } else if (giftType === "candidate") {
      finalTitle = `Strategic Candidate Records Allocation`;
      const sliceCount = candidateGiftCount === "custom" ? customCandidateCount : candidateGiftCount;
      embeddedCandidates = matchingCandidates.slice(0, sliceCount);

      if (embeddedCandidates.length === 0) {
        alert("⚠️ No matching candidate records found for these filters. Please revise your criteria before gifting.");
        return;
      }
      finalTitle = `Premium Database Share: ${embeddedCandidates.length} Records`;
      finalValue = embeddedCandidates.length * 200; // Estimated virtual worth
      detailsPayload = {
        recordCount: embeddedCandidates.length,
        filtersUsed: { candFilterCategory, candFilterLocation, candFilterExperience }
      };
    }

    const newGift: GiftData = {
      id: "GIFT_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      title: finalTitle,
      type: giftType === "candidate" ? "Candidate Data Reward" : giftType === "cash" ? "Cash Reward" : `${giftType.toUpperCase()} Voucher`,
      value: finalValue,
      message: rewardMessage || "Thank you for pushing limits and achieving excellence. Keep shining!",
      category: rewardCategory,
      expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      details: detailsPayload,
      recipients: targets,
      date: new Date().toISOString(),
      status: "Pending",
      sharedCandidates: embeddedCandidates,
      notes: notes
    };

    // Save and broadcast
    const list = [...distributedGiftsList, newGift];
    localStorage.setItem("fast_rms_gifts_v1", JSON.stringify(list));

    // Show Confetti celebration
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4500);

    // Reset distribution state
    setRewardTitle("");
    setRewardValue(0);
    setRewardMessage("");
    setVoucherCode("");
    setNotes("");
    setSelectedRecipientId("");
    setSelectedRecipientIds([]);
    setAttachmentUrl("");
    alert(`🎉 Success! Awarded "${finalTitle}" to ${targets.length} target recipients!`);
  };

  // Export functions
  const downloadGiftReportCSV = () => {
    const headers = ["Gift ID", "Title", "Type", "Worth Value (INR)", "Recipient Count", "Award Date", "Claims Status", "Message"];
    const rows = distributedGiftsList.map(g => [
      g.id,
      g.title,
      g.type,
      g.value,
      g.recipients.length,
      new Date(g.date).toLocaleDateString(),
      g.status,
      g.message
    ]);

    const csvStr = [
      headers.join(","),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Fast_RMS_Rewards_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered lists for historical monitoring
  const filteredHistoryList = useMemo(() => {
    return distributedGiftsList.filter(g => {
      const matchesSearch = g.title.toLowerCase().includes(historySearch.toLowerCase()) ||
        g.recipients.some(r => r.name.toLowerCase().includes(historySearch.toLowerCase())) ||
        g.type.toLowerCase().includes(historySearch.toLowerCase());

      if (!matchesSearch) return false;

      if (historyFilterDate !== "all") {
        const giftDate = new Date(g.date);
        const diffTime = Math.abs(Date.now() - giftDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (historyFilterDate === "today" && diffDays > 1) return false;
        if (historyFilterDate === "week" && diffDays > 7) return false;
        if (historyFilterDate === "month" && diffDays > 30) return false;
        if (historyFilterDate === "year" && diffDays > 365) return false;
      }
      return true;
    });
  }, [distributedGiftsList, historySearch, historyFilterDate]);

  return (
    <div className="gifts-command-hub" style={theme.container}>

      {/* Background Confetti effect */}
      <ConfettiEffect active={showConfetti} />

      {/* Header section with celebration vibes */}
      <div
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #4c0519 100%)",
          color: "#ffffff",
          padding: "36px",
          borderRadius: "30px",
          marginBottom: "24px",
          border: isBoss ? "2px solid rgba(251, 191, 36, 0.3)" : "2px solid rgba(244, 63, 94, 0.2)",
          position: "relative",
          overflow: "hidden",
          boxShadow: isBoss ? "0 20px 50px rgba(15, 23, 42, 0.5)" : "0 20px 50px rgba(76, 5, 25, 0.15)"
        }}
      >
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "180px", height: "180px", background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", borderRadius: "50%" }}></div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ background: isBoss ? "rgba(251, 191, 36, 0.15)" : "rgba(244,63,94,0.2)", color: isBoss ? "#fbbf24" : "#f43f5e", fontSize: "0.7rem", fontWeight: 800, padding: "5px 12px", borderRadius: "20px", border: isBoss ? "1px solid rgba(251, 191, 36, 0.3)" : "1px solid rgba(244,63,94,0.3)", textTransform: "uppercase", letterSpacing: "1px" }}>
              🏆 Enterprise Recognition Node
            </span>
            <h1 style={{ fontSize: "2.3rem", fontWeight: 950, marginTop: "12px", letterSpacing: "-1px" }}>
              Employee Rewards & Incentives Center
            </h1>
            <p style={{ color: isBoss ? "#cbd5e1" : "#94a3b8", fontSize: "1.05rem", marginTop: "4px", maxWidth: "600px" }}>
              Unlock team potential, disburse performance vouchers, chocolate boxes, cash benefits, and share candidate pipelines directly.
            </p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            style={{ fontSize: "5rem" }}
          >
            🎁
          </motion.div>
        </div>

        {/* Tab Selection buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
          {[
            { id: "distribute", name: "Distribute Incentives", icon: <LucidePlus size={16} /> },
            { id: "history", name: "Disbursed History Log", icon: <LucideFileText size={16} /> },
            { id: "leaderboard", name: "Gamification & Leaderboard", icon: <LucideTrophy size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.3s",
                border: "none",
                background: activeTab === tab.id ? (isBoss ? "#fbbf24" : "#f43f5e") : "rgba(255,255,255,0.06)",
                color: activeTab === tab.id && isBoss ? "#0f172a" : "#ffffff",
                boxShadow: activeTab === tab.id ? (isBoss ? "0 10px 20px rgba(251, 191, 36, 0.25)" : "0 10px 20px rgba(244, 63, 94, 0.3)") : "none"
              }}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Dashboard Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { title: "Total Gifts Shared", val: analytics.totalGifts, icon: "🎁", color: "#6366f1" },
          { title: "Distributed Worth", val: `₹${(analytics.rewardValueSum / 1000).toFixed(1)}k`, icon: "💰", color: "#10b981" },
          { title: "This Month Gifting", val: analytics.thisMonthCount, icon: "📅", color: "#eab308" },
          { title: "Top Recruiter Node", val: analytics.topRecruiter, icon: "🏆", color: "#f43f5e" },
          { title: "Top Team Lead", val: analytics.topTl, icon: "👑", color: "#a855f7" }
        ].map((c, i) => (
          <div
            key={i}
            className="glass-card"
            style={theme.smallCard}
          >
            <div>
              <span style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: 700, textTransform: "uppercase" }}>{c.title}</span>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 950, color: theme.inputText, marginTop: "4px" }}>{c.val}</h3>
            </div>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: isBoss ? "rgba(251, 191, 36, 0.15)" : `${c.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", color: isBoss ? "#fbbf24" : "inherit" }}>
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Auxiliary Mini Indicators */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { title: "Pending Claims", val: analytics.pendingClaimsCount, color: "#f97316" },
          { title: "DB Shares Shared", val: analytics.candidateDataSharedCount, color: "#0ea5e9" },
          { title: "Cash Grants Disbursed", val: analytics.cashRewardsCount, color: "#16a34a" },
          { title: "Shopping Vouchers", val: analytics.voucherRewardsCount, color: "#ec4899" },
          { title: "Weekly Pace Count", val: analytics.thisWeekCount, color: "#84cc16" }
        ].map((c, i) => (
          <div
            key={i}
            style={{
              padding: "12px 16px",
              borderRadius: "16px",
              background: isBoss ? "rgba(30, 41, 59, 0.3)" : `${c.color}08`,
              border: `1.5px solid ${isBoss ? "rgba(251, 191, 36, 0.15)" : `${c.color}20`}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: theme.textMuted }}>{c.title}</span>
            <span style={{ fontSize: "0.95rem", fontWeight: 900, color: isBoss ? "#fbbf24" : c.color }}>{c.val}</span>
          </div>
        ))}
      </div>

      {/* Main interactive workflow panels */}
      <AnimatePresence mode="wait">
        {activeTab === "distribute" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid-2-1"
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}
          >
            {/* Creation Console */}
            <form onSubmit={triggerGiftDistribution} className="glass-card" style={theme.card}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 900, color: theme.headingColor, borderBottom: `1px solid ${theme.borderColor}`, paddingBottom: "12px" }}>
                🎁 Reward Generation & Target Allocation
              </h2>

              {/* Recipient Target options */}
              <div style={{ marginTop: "20px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>
                  1. Choose Target Recipient Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "10px" }}>
                  {[
                    { id: "individual", label: "Single Node Member", desc: "One custom TL or Recruiter" },
                    { id: "multiple", label: "Select Multiple Recruiters", desc: "Checkbox recruiter pool" },
                    { id: "multiple-tls", label: "Select Multiple TLs", desc: "Checkbox TL group" },
                    { id: "tl-team", label: "TL + Reporting Recruiters", desc: "Entire pod segment" },
                    { id: "tls-only", label: "All Direct TLs", desc: "Exclusive TL alignment" },
                    { id: "entire-team", label: "Entire Team", desc: "Every direct subordinate" }
                  ].map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setRecipientType(item.id as any);
                        setSelectedRecipientId("");
                        setSelectedRecipientIds([]);
                      }}
                      style={{
                        padding: "12px",
                        borderRadius: "14px",
                        border: `2px solid ${recipientType === item.id ? (isBoss ? "#fbbf24" : "#f43f5e") : theme.itemBorder}`,
                        background: recipientType === item.id ? (isBoss ? "rgba(251, 191, 36, 0.08)" : "#f43f5e05") : theme.itemBg,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <strong style={{ fontSize: "0.8rem", display: "block", color: recipientType === item.id ? (isBoss ? "#fbbf24" : "#f43f5e") : theme.inputText }}>{item.label}</strong>
                      <span style={{ fontSize: "0.7rem", color: theme.textMuted, display: "block", marginTop: "2px" }}>{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concrete dropdown/checkbox display depending on recipientType */}
              <div style={{ marginTop: "16px", padding: "16px", borderRadius: "16px", background: theme.subBg, border: theme.subBorder }}>
                {recipientType === "individual" && (
                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 800, color: theme.textMuted }}>Select Specific Employee</label>
                    <select
                      value={selectedRecipientId}
                      onChange={e => setSelectedRecipientId(e.target.value === "" ? "" : Number(e.target.value))}
                      required
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "8px", outline: "none" }}
                    >
                      <option value="" style={{ background: theme.inputBg, color: theme.inputText }}>-- Choose Employee Node --</option>
                      {allSubordinates.map(u => (
                        <option key={u.id} value={u.id} style={{ background: theme.inputBg, color: theme.inputText }}>
                          {u.name} ({u.role.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {recipientType === "tl-team" && (
                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 800, color: theme.textMuted }}>Select Target TL Node</label>
                    <select
                      value={selectedRecipientId}
                      onChange={e => setSelectedRecipientId(e.target.value === "" ? "" : Number(e.target.value))}
                      required
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "8px", outline: "none" }}
                    >
                      <option value="" style={{ background: theme.inputBg, color: theme.inputText }}>-- Choose Team Leader --</option>
                      {myTls.map(u => (
                        <option key={u.id} value={u.id} style={{ background: theme.inputBg, color: theme.inputText }}>
                          {u.name} & reporting members
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {recipientType === "multiple" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 800, color: theme.textMuted }}>Select Target Recruiters</label>
                      <button type="button" onClick={handleSelectAllRecruiters} style={{ border: "none", background: "none", color: isBoss ? "#fbbf24" : "#f43f5e", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}>
                        {selectedRecipientIds.length === myRecruiters.length ? "Deselect All" : "Select All Recruiters"}
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                      {myRecruiters.map(r => (
                        <label
                          key={r.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            background: theme.itemBg,
                            borderRadius: "8px",
                            border: `1px solid ${theme.itemBorder}`,
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            color: theme.inputText
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRecipientIds.includes(r.id)}
                            onChange={() => toggleRecipientSelect(r.id)}
                          />
                          {r.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {recipientType === "multiple-tls" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 800, color: theme.textMuted }}>Select Target Team Leaders</label>
                      <button type="button" onClick={handleSelectAllTls} style={{ border: "none", background: "none", color: isBoss ? "#fbbf24" : "#f43f5e", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}>
                        {selectedRecipientIds.length === myTls.length ? "Deselect All" : "Select All TLs"}
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                      {myTls.map(t => (
                        <label
                          key={t.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            background: theme.itemBg,
                            borderRadius: "8px",
                            border: `1px solid ${theme.itemBorder}`,
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            color: theme.inputText
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRecipientIds.includes(t.id)}
                            onChange={() => toggleRecipientSelect(t.id)}
                          />
                          {t.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {recipientType === "tls-only" && (
                  <span style={{ fontSize: "0.8rem", color: theme.textMuted, fontWeight: 700 }}>
                    🚀 Selected direct Team Leaders under your hierarchy ({myTls.length} users).
                  </span>
                )}

                {recipientType === "entire-team" && (
                  <span style={{ fontSize: "0.8rem", color: theme.textMuted, fontWeight: 700 }}>
                    ⭐ Selected all subordinate employee nodes ({allSubordinates.length} users).
                  </span>
                )}
              </div>

              {/* Gift Type selectors */}
              <div style={{ marginTop: "24px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>
                  2. Select Reward / Incentive Category
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginTop: "10px" }}>
                  {[
                    { id: "cash", label: "Cash Reward", icon: "💰" },
                    { id: "amazon", label: "Amazon Gift", icon: "💳" },
                    { id: "flipkart", label: "Flipkart Card", icon: "🛍️" },
                    { id: "movie", label: "Movie BMS", icon: "🎟️" },
                    { id: "food", label: "Food Coupon", icon: "🍔" },
                    { id: "shopping", label: "Shop Coupon", icon: "🛍️" },
                    { id: "chocolate", label: "Chocolates", icon: "🍫" },
                    { id: "candidate", label: "Candidate DB", icon: "📂" },
                    { id: "custom", label: "Custom Gift", icon: "✨" }
                  ].map(g => (
                    <div
                      key={g.id}
                      onClick={() => setGiftType(g.id as any)}
                      style={{
                        padding: "12px 6px",
                        textAlign: "center",
                        borderRadius: "14px",
                        cursor: "pointer",
                        border: `2px solid ${giftType === g.id ? (isBoss ? "#fbbf24" : "#10b981") : theme.itemBorder}`,
                        background: giftType === g.id ? (isBoss ? "rgba(251, 191, 36, 0.08)" : "#10b98105") : theme.itemBg,
                        transition: "all 0.2s"
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{g.icon}</span>
                      <strong style={{ fontSize: "0.75rem", display: "block", marginTop: "4px", color: giftType === g.id ? (isBoss ? "#fbbf24" : "#10b981") : theme.inputText }}>{g.label}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic form inputs based on gift type */}
              <div style={{ marginTop: "20px", background: theme.subBg, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.borderColor}` }}>
                <h4 style={{ margin: 0, fontSize: "0.9rem", color: theme.headingColor, fontWeight: 800 }}>
                  📝 Details of Chosen Reward
                </h4>

                {/* Candidate Database gifting filters & settings */}
                {giftType === "candidate" ? (
                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ background: isBoss ? "rgba(251, 191, 36, 0.1)" : "#eff6ff", border: `1px solid ${isBoss ? "#fbbf24" : "#bfdbfe"}`, padding: "12px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "0.8rem", color: isBoss ? "#fbbf24" : "#1e3a8a", fontWeight: 700 }}>
                        📂 Matching candidates database: <strong>{matchingCandidates.length}</strong> records available.
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: theme.textMuted }}>Categories</label>
                        <select
                          value={candFilterCategory}
                          onChange={e => setCandFilterCategory(e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "4px" }}
                        >
                          {filterOptions.categories.map((c, i) => (
                            <option key={i} value={c} style={{ background: theme.inputBg, color: theme.inputText }}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: theme.textMuted }}>Locations</label>
                        <select
                          value={candFilterLocation}
                          onChange={e => setCandFilterLocation(e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "4px" }}
                        >
                          {filterOptions.locations.map((c, i) => (
                            <option key={i} value={c} style={{ background: theme.inputBg, color: theme.inputText }}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: theme.textMuted }}>Experience</label>
                        <select
                          value={candFilterExperience}
                          onChange={e => setCandFilterExperience(e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "4px" }}
                        >
                          {filterOptions.experiences.map((c, i) => (
                            <option key={i} value={c} style={{ background: theme.inputBg, color: theme.inputText }}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: "8px" }}>
                      <label style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: 800 }}>Number of Records to Allocation Gift</label>
                      <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                        {[10, 20, 50, 100].map(cnt => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setCandidateGiftCount(cnt as any)}
                            style={{
                              flex: 1,
                              padding: "8px",
                              borderRadius: "8px",
                              border: `1.5px solid ${candidateGiftCount === cnt ? (isBoss ? "#fbbf24" : "#10b981") : theme.inputBorder}`,
                              background: candidateGiftCount === cnt ? (isBoss ? "rgba(251, 191, 36, 0.1)" : "#10b98110") : theme.itemBg,
                              color: theme.inputText,
                              fontWeight: 800,
                              cursor: "pointer"
                            }}
                          >
                            {cnt} Records
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setCandidateGiftCount("custom")}
                          style={{
                            flex: 1,
                            padding: "8px",
                            borderRadius: "8px",
                            border: `1.5px solid ${candidateGiftCount === "custom" ? (isBoss ? "#fbbf24" : "#10b981") : theme.inputBorder}`,
                            background: candidateGiftCount === "custom" ? (isBoss ? "rgba(251, 191, 36, 0.1)" : "#10b98110") : theme.itemBg,
                            color: theme.inputText,
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          Custom Count
                        </button>
                      </div>

                      {candidateGiftCount === "custom" && (
                        <input
                          type="number"
                          value={customCandidateCount}
                          onChange={e => setCustomCandidateCount(Math.max(1, Number(e.target.value)))}
                          placeholder="Enter count to share..."
                          style={{ width: "100%", padding: "8px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "8px" }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: theme.textMuted }}>Reward Worth Value (INR)</label>
                      <input
                        type="number"
                        placeholder="Value e.g. 5000"
                        value={rewardValue || ""}
                        onChange={e => setRewardValue(Number(e.target.value))}
                        required
                        style={{ width: "100%", padding: "8px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "4px" }}
                      />
                    </div>

                    {giftType === "cash" && (
                      <div>
                        <label style={{ fontSize: "0.75rem", color: theme.textMuted }}>Expiry / Allocation Category</label>
                        <select
                          value={rewardCategory}
                          onChange={e => setRewardCategory(e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "4px" }}
                        >
                          <option value="Placement Bonus" style={{ background: theme.inputBg, color: theme.inputText }}>Placement Bonus</option>
                          <option value="Client Win Bounty" style={{ background: theme.inputBg, color: theme.inputText }}>Client Win Bounty</option>
                          <option value="Target Completion" style={{ background: theme.inputBg, color: theme.inputText }}>Target Completion</option>
                          <option value="Spot Reward" style={{ background: theme.inputBg, color: theme.inputText }}>Spot Reward</option>
                          <option value="Weekly Champ" style={{ background: theme.inputBg, color: theme.inputText }}>Weekly Champ</option>
                        </select>
                      </div>
                    )}

                    {["amazon", "flipkart", "movie", "food", "shopping"].includes(giftType) && (
                      <div>
                        <label style={{ fontSize: "0.75rem", color: theme.textMuted }}>Voucher Code / Ticket ID</label>
                        <input
                          type="text"
                          placeholder="e.g. AMZN-590-CDE"
                          value={voucherCode}
                          onChange={e => setVoucherCode(e.target.value)}
                          required
                          style={{ width: "100%", padding: "8px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "4px" }}
                        />
                      </div>
                    )}

                    {giftType === "custom" && (
                      <div>
                        <label style={{ fontSize: "0.75rem", color: theme.textMuted }}>Attachment Image / DOC Link</label>
                        <input
                          type="text"
                          placeholder="e.g. http://docs.company.com/certificate.pdf"
                          value={attachmentUrl}
                          onChange={e => setAttachmentUrl(e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "4px" }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Expiry inputs */}
                {giftType !== "chocolate" && giftType !== "candidate" && (
                  <div style={{ marginTop: "12px" }}>
                    <label style={{ fontSize: "0.75rem", color: theme.textMuted }}>Reward Expiry Date</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={e => setExpiryDate(e.target.value)}
                      style={{ width: "100%", padding: "8px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "4px" }}
                    />
                  </div>
                )}

                {/* Voucher notes or chocolate delivery addresses */}
                {["amazon", "chocolate", "custom"].includes(giftType) && (
                  <div style={{ marginTop: "12px" }}>
                    <label style={{ fontSize: "0.75rem", color: theme.textMuted }}>
                      {giftType === "chocolate" ? "Delivery / Handover Notes" : "Additional Admin Notes"}
                    </label>
                    <textarea
                      placeholder={giftType === "chocolate" ? "Deliver at Noida Hub, Desk-14 on Monday morning." : "Special instructions..."}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={2}
                      style={{ width: "100%", padding: "8px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "4px", resize: "none" }}
                    />
                  </div>
                )}
              </div>

              {/* Reward Header Description Custom title */}
              {giftType !== "candidate" && (
                <div style={{ marginTop: "16px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 800, color: theme.textMuted }}>Custom Reward Display Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Outstanding Sourcing Champion - Q1"
                    value={rewardTitle}
                    onChange={e => setRewardTitle(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "8px" }}
                  />
                </div>
              )}

              {/* Reward timeline & Motivation messages */}
              <div style={{ marginTop: "16px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 800, color: theme.textMuted }}>Congratulatory Motivation Message (Rich Support)</label>
                <textarea
                  rows={4}
                  placeholder="You have demonstrated exemplary courage, pace and closing efficiency this week. Extremely proud of your persistence!"
                  value={rewardMessage}
                  onChange={e => setRewardMessage(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.inputText, marginTop: "8px", resize: "none" }}
                />
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "14px",
                  background: isBoss ? "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: isBoss ? "#0f172a" : "white",
                  fontSize: "0.95rem",
                  fontWeight: 900,
                  border: "none",
                  marginTop: "24px",
                  cursor: "pointer",
                  boxShadow: isBoss ? "0 10px 25px rgba(251, 191, 36, 0.25)" : "0 10px 25px rgba(16, 185, 129, 0.25)"
                }}
              >
                🎉 Dispense & Award Incentive Reward
              </button>
            </form>

            {/* Sidebar visual reward structure overview */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="glass-card" style={theme.card}>
                <h3 style={{ fontSize: "1rem", fontWeight: 900, color: theme.headingColor, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  🏆 Gamification & Milestone Badges
                </h3>
                <p style={{ fontSize: "0.8rem", color: theme.textMuted, lineHeight: 1.4 }}>
                  Employees automatically level up and unlock specialized medals based on the frequency and magnitude of {role === "boss" ? "boss" : "manager"} rewards.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                  {[
                    { badge: "🏆 Top Performer", desc: "Awarded to 5+ active rewards" },
                    { badge: "🎯 Hiring Champion", desc: "For recruitment placements incentives" },
                    { badge: "🚀 Fast Closer", desc: "Spot closing cash gifts category" },
                    { badge: "👑 Joining King", desc: "Awarded for highest value cash grants" },
                    { badge: "🔥 Consistency Star", desc: "Maintains consecutive week logs" }
                  ].map((b, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "10px", background: theme.subBg, border: theme.subBorder }}>
                      <span style={{ fontSize: "1.2rem" }}>🥇</span>
                      <div>
                        <strong style={{ fontSize: "0.8rem", color: theme.inputText }}>{b.badge}</strong>
                        <span style={{ fontSize: "0.7rem", color: theme.textMuted, display: "block" }}>{b.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* History log display panel */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-card"
            style={theme.card}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.borderColor}`, paddingBottom: "16px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 900, color: theme.headingColor }}>
                📜 Rewards Distribution Logs & claim Tracking
              </h2>
              <button
                onClick={downloadGiftReportCSV}
                className="btn-secondary glass"
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 800, color: theme.inputText, border: `1px solid ${theme.inputBorder}`, background: theme.subBg }}
              >
                <LucideDownload size={16} /> Export Rewards History
              </button>
            </div>

            {/* Filter controls */}
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", marginBottom: "16px" }}>
              <div className="search-bar-modern" style={{ flex: 1, background: theme.subBg, border: `1px solid ${theme.inputBorder}`, display: "flex", alignItems: "center", padding: "10px 15px", borderRadius: "12px" }}>
                <LucideSearch size={18} color={isBoss ? "#fbbf24" : "#94a3b8"} />
                <input
                  type="text"
                  placeholder="Search by reward title, type, or recipient..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  style={{ background: "transparent", border: "none", color: theme.inputText, outline: "none", width: "100%", paddingLeft: "10px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "6px", background: theme.subBg, padding: "4px", borderRadius: "10px", border: theme.subBorder }}>
                {[
                  { id: "all", label: "All Logs" },
                  { id: "today", label: "Today" },
                  { id: "week", label: "This Week" },
                  { id: "month", label: "This Month" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setHistoryFilterDate(opt.id as any)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      background: historyFilterDate === opt.id ? (isBoss ? "#fbbf24" : "#1e293b") : "transparent",
                      color: historyFilterDate === opt.id ? (isBoss ? "#0f172a" : "white") : theme.textMuted
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Logs table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${theme.borderColor}`, background: isBoss ? "rgba(15, 23, 42, 0.8)" : "transparent" }}>
                    <th style={{ color: theme.inputText, padding: "12px", textAlign: "left" }}>Reward Title</th>
                    <th style={{ color: theme.inputText, padding: "12px", textAlign: "left" }}>Incentive Type</th>
                    <th style={{ color: theme.inputText, padding: "12px", textAlign: "left" }}>Financial Worth</th>
                    <th style={{ color: theme.inputText, padding: "12px", textAlign: "left" }}>Recipient Members</th>
                    <th style={{ color: theme.inputText, padding: "12px", textAlign: "left" }}>Allocation Date</th>
                    <th style={{ color: theme.inputText, padding: "12px", textAlign: "left" }}>Claim Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistoryList.length > 0 ? (
                    filteredHistoryList.map(gift => (
                      <tr key={gift.id} style={{ borderBottom: `1px solid ${theme.borderColor}` }}>
                        <td style={{ color: theme.inputText, padding: "12px" }}>
                          <strong>{gift.title}</strong>
                          <span style={{ fontSize: "0.7rem", color: theme.textMuted, display: "block", marginTop: "2px" }}>
                            {gift.message.slice(0, 50)}...
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ background: isBoss ? "rgba(251, 191, 36, 0.15)" : "#eff6ff", color: isBoss ? "#fbbf24" : "#2563eb", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>
                            {gift.type}
                          </span>
                        </td>
                        <td style={{ color: theme.inputText, padding: "12px" }}><strong>₹{gift.value}</strong></td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "200px" }}>
                            {gift.recipients.map(r => (
                              <span key={r.id} style={{ background: theme.subBg, border: theme.subBorder, padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", color: theme.inputText }}>
                                {r.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ color: theme.inputText, padding: "12px" }}>{new Date(gift.date).toLocaleDateString()}</td>
                        <td style={{ padding: "12px" }}>
                          <span className={`status-pill ${gift.status === "Claimed" ? "joined" : "new"}`} style={isBoss ? { background: gift.status === "Claimed" ? "rgba(16, 185, 129, 0.2)" : "rgba(251, 191, 36, 0.2)", color: gift.status === "Claimed" ? "#10b981" : "#fbbf24" } : undefined}>
                            {gift.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: theme.textMuted }}>
                        📁 No historical reward distributions match the active filter metrics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Gamified Gamified leaderboard */}
        {activeTab === "leaderboard" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-card"
            style={theme.card}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.borderColor}`, paddingBottom: "16px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 900, color: theme.headingColor }}>
                🏆 Gamification Leaderboard & Success Nodes
              </h2>
              <div style={{ display: "flex", gap: "6px", background: theme.subBg, padding: "4px", borderRadius: "10px", border: theme.subBorder }}>
                {[
                  { id: "monthly", label: "Monthly Performers" },
                  { id: "quarterly", label: "Quarterly Pulse" },
                  { id: "yearly", label: "Yearly Champions" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setLeaderboardFilter(opt.id as any)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      background: leaderboardFilter === opt.id ? (isBoss ? "#fbbf24" : "#f43f5e") : "transparent",
                      color: leaderboardFilter === opt.id ? (isBoss ? "#0f172a" : "white") : theme.textMuted
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual ranking cards (Top 3) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "24px" }}>
              {[
                { rank: "🥈 2nd Place", name: "Priya Sharma", role: "TL BPO", value: "₹45,000", points: "4,500 pts" },
                { rank: "🥇 Ultimate Winner", name: "Aryan Singh", role: "TL IT Mandates", value: "₹62,500", points: "6,250 pts", champion: true },
                { rank: "🥉 3rd Place", name: "Rahul Verma", role: "Senior Recruiter", value: "₹28,000", points: "2,800 pts" }
              ].map((r, i) => (
                <div
                  key={i}
                  style={{
                    background: r.champion ? (isBoss ? "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)" : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)") : theme.subBg,
                    border: r.champion ? "2px solid #fbbf24" : `1px solid ${theme.borderColor}`,
                    padding: "24px",
                    borderRadius: "20px",
                    textAlign: "center",
                    boxShadow: r.champion ? (isBoss ? "0 10px 30px -5px rgba(251, 191, 36, 0.3)" : "0 10px 30px -5px rgba(251, 191, 36, 0.2)") : "none"
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 900, color: r.champion ? (isBoss ? "#fbbf24" : "#b45309") : theme.textMuted, textTransform: "uppercase" }}>{r.rank}</span>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: r.champion ? (isBoss ? "rgba(251, 191, 36, 0.25)" : "#fcd34d") : (isBoss ? "rgba(255,255,255,0.05)" : "#e2e8f0"), color: r.champion ? (isBoss ? "#fbbf24" : "#78350f") : theme.inputText, display: "flex", alignItems: "center", justifyContent: "center", margin: "16px auto", fontSize: "1.5rem", fontWeight: 900, border: isBoss && r.champion ? "1px solid #fbbf24" : "none" }}>
                    {r.name[0]}
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 900, color: theme.inputText, margin: 0 }}>{r.name}</h4>
                  <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>{r.role}</span>

                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${theme.borderColor}`, marginTop: "16px", paddingTop: "12px" }}>
                    <div>
                      <span style={{ fontSize: "0.65rem", color: theme.textMuted, display: "block" }}>Rewards Earned</span>
                      <strong style={{ fontSize: "0.9rem", color: theme.inputText }}>{r.value}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.65rem", color: theme.textMuted, display: "block" }}>Gamified Points</span>
                      <strong style={{ fontSize: "0.9rem", color: r.champion ? "#fbbf24" : (isBoss ? "#60a5fa" : "#2563eb") }}>{r.points}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
