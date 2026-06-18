import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LucideUsers, LucideCheckCircle2, LucideCalendar, LucideTrendingUp,
  LucideXCircle, LucideUserCheck, LucideArrowUpRight, LucideBriefcase,
  LucideActivity, LucidePercent, LucideRefreshCw, LucideBarChart3,
  LucideTarget, LucideAward, LucideZap, LucideClock
} from "lucide-react";

interface DashStats {
  total: number;
  active: number;
  interviewScheduled: number;
  selected: number;
  joined: number;
  rejected: number;
  dropped: number;
  pending: number;
  successRate: number;
  joiningRatio: number;
  selectionRatio: number;
  assignedJobsCount: number;
}

interface MonthlyData { month: string; count: number; }

const KPI_CARD = ({ title, value, subtitle, icon, gradient, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    style={{
      background: gradient,
      borderRadius: "16px", padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: "8px",
      position: "relative", overflow: "hidden",
      boxShadow: "0 8px 24px -4px rgba(0,0,0,0.12)"
    }}
  >
    <div style={{ position: "absolute", top: "-20px", right: "-20px", opacity: 0.12, fontSize: "5rem" }}>
      {icon}
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
        {icon}
      </div>
    </div>
    <div>
      <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.65)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div>
      <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "white", lineHeight: 1.1, marginTop: "3px" }}>{value}</div>
      {subtitle && <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", marginTop: "4px", fontWeight: 500 }}>{subtitle}</div>}
    </div>
  </motion.div>
);

const MiniChart = ({ data, color }: { data: MonthlyData[]; color: string }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "60px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <div
            style={{
              width: "100%", borderRadius: "4px 4px 0 0",
              background: color,
              height: `${Math.max((d.count / max) * 100, 8)}%`,
              minHeight: "4px",
              transition: "height 0.5s ease",
              opacity: 0.85 + (i / data.length) * 0.15
            }}
          />
          <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 600 }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
};

const ProgressRing = ({ value, color, size = 80 }: { value: number; color: string; size?: number }) => {
  const r = (size - 14) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>{value}%</text>
    </svg>
  );
};

export default function VendorDashboardHome() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/vendor/dashboard", {
        headers: { "Authorization": `VendorBearer ${localStorage.getItem("vendor_token") || ""}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setMonthlyTrend(data.monthlyTrend || []);
      }
    } catch (err) {
      console.error("Failed to load vendor dashboard", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", color: "#2563eb" }}>
        <LucideRefreshCw className="animate-spin" size={32} />
        <span style={{ fontSize: "1rem", fontWeight: 700 }}>Loading your dashboard...</span>
      </div>
    );
  }

  const s = stats || { total: 0, active: 0, interviewScheduled: 0, selected: 0, joined: 0, rejected: 0, dropped: 0, pending: 0, successRate: 0, joiningRatio: 0, selectionRatio: 0, assignedJobsCount: 0 };

  const kpiCards = [
    { title: "Total Submitted", value: s.total, icon: <LucideUsers size={16} />, gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)", subtitle: "All-time candidates" },
    { title: "Active Candidates", value: s.active, icon: <LucideActivity size={16} />, gradient: "linear-gradient(135deg, #7c3aed, #6d28d9)", subtitle: "Currently in pipeline" },
    { title: "Interview Scheduled", value: s.interviewScheduled, icon: <LucideCalendar size={16} />, gradient: "linear-gradient(135deg, #0891b2, #0e7490)", subtitle: "Upcoming interviews" },
    { title: "Total Selected", value: s.selected, icon: <LucideCheckCircle2 size={16} />, gradient: "linear-gradient(135deg, #059669, #047857)", subtitle: "Cleared evaluation" },
    { title: "Total Joined", value: s.joined, icon: <LucideUserCheck size={16} />, gradient: "linear-gradient(135deg, #16a34a, #15803d)", subtitle: "Successfully onboarded" },
    { title: "Total Rejected", value: s.rejected, icon: <LucideXCircle size={16} />, gradient: "linear-gradient(135deg, #dc2626, #b91c1c)", subtitle: "Not progressed" },
    { title: "Total Dropped", value: s.dropped, icon: <LucideArrowUpRight size={16} />, gradient: "linear-gradient(135deg, #d97706, #b45309)", subtitle: "Candidate withdrawals" },
    { title: "Pending Review", value: s.pending, icon: <LucideClock size={16} />, gradient: "linear-gradient(135deg, #64748b, #475569)", subtitle: "Awaiting action" },
    { title: "Success Rate", value: `${s.successRate}%`, icon: <LucideTarget size={16} />, gradient: "linear-gradient(135deg, #10b981, #059669)", subtitle: "Joined / Total" },
    { title: "Joining Ratio", value: `${s.joiningRatio}%`, icon: <LucideTrendingUp size={16} />, gradient: "linear-gradient(135deg, #6366f1, #4f46e5)", subtitle: "Joined / Selected" },
    { title: "Selection Ratio", value: `${s.selectionRatio}%`, icon: <LucidePercent size={16} />, gradient: "linear-gradient(135deg, #f59e0b, #d97706)", subtitle: "Selected / Total" },
    { title: "Active Jobs", value: s.assignedJobsCount, icon: <LucideBriefcase size={16} />, gradient: "linear-gradient(135deg, #0ea5e9, #0284c7)", subtitle: "Assigned positions" },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Vendor Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
            Your complete candidate pipeline overview
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={refreshing}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 16px", borderRadius: "10px",
            background: "white", border: "1px solid #e2e8f0",
            color: "#475569", fontWeight: 700, fontSize: "0.82rem",
            cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
          }}
        >
          <LucideRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* KPI Grid — 4 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {kpiCards.map((card, i) => (
          <KPI_CARD key={i} {...card} delay={i * 0.04} />
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "24px" }}>

        {/* Monthly Submission Trend */}
        <div style={{ background: "white", borderRadius: "16px", padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 2px" }}>Monthly Submission Trend</h3>
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>Candidates submitted per month</p>
            </div>
            <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 700 }}>
              LAST 6 MONTHS
            </span>
          </div>
          {monthlyTrend.length > 0 ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "100px" }}>
              {monthlyTrend.map((d, i) => {
                const max = Math.max(...monthlyTrend.map(x => x.count), 1);
                const heightPct = Math.max((d.count / max) * 100, 8);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748b" }}>{d.count}</span>
                    <div style={{
                      width: "100%", borderRadius: "6px 6px 0 0",
                      background: `linear-gradient(180deg, #3b82f6, #1d4ed8)`,
                      height: `${heightPct}%`, minHeight: "6px",
                      boxShadow: "0 4px 12px rgba(59,130,246,0.3)"
                    }} />
                    <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>{d.month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
              No submission data yet
            </div>
          )}
        </div>

        {/* Performance Ratios */}
        <div style={{ background: "white", borderRadius: "16px", padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 20px" }}>Performance Ratios</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <ProgressRing value={s.successRate} color="#22c55e" size={72} />
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9rem" }}>Success Rate</div>
                <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{s.joined} joined of {s.total}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <ProgressRing value={s.joiningRatio} color="#6366f1" size={72} />
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9rem" }}>Joining Ratio</div>
                <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{s.joined} joined of {s.selected} selected</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <ProgressRing value={s.selectionRatio} color="#f59e0b" size={72} />
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9rem" }}>Selection Ratio</div>
                <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{s.selected} selected of {s.total}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div style={{ background: "white", borderRadius: "16px", padding: "22px 24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Pipeline Status Breakdown</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
          {[
            { label: "Pending", val: s.pending, color: "#64748b", bg: "#f8fafc" },
            { label: "Active", val: s.active, color: "#2563eb", bg: "#eff6ff" },
            { label: "Interview", val: s.interviewScheduled, color: "#0891b2", bg: "#f0f9ff" },
            { label: "Selected", val: s.selected, color: "#059669", bg: "#f0fdf4" },
            { label: "Joined", val: s.joined, color: "#16a34a", bg: "#dcfce7" },
            { label: "Rejected", val: s.rejected, color: "#dc2626", bg: "#fef2f2" },
            { label: "Dropped", val: s.dropped, color: "#d97706", bg: "#fffbeb" },
          ].map((item, i) => (
            <div key={i} style={{ background: item.bg, borderRadius: "12px", padding: "12px", textAlign: "center", border: `1px solid ${item.color}20` }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: item.color }}>{item.val}</div>
              <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginTop: "4px", letterSpacing: "0.3px" }}>{item.label}</div>
            </div>
          ))}
        </div>
        {/* Visual pipeline bar */}
        <div style={{ marginTop: "16px", display: "flex", height: "8px", borderRadius: "6px", overflow: "hidden" }}>
          {s.total > 0 && [
            { val: s.pending, color: "#94a3b8" },
            { val: s.active - s.interviewScheduled - s.selected - s.joined, color: "#3b82f6" },
            { val: s.interviewScheduled, color: "#0891b2" },
            { val: s.selected - s.joined, color: "#10b981" },
            { val: s.joined, color: "#22c55e" },
            { val: s.rejected, color: "#ef4444" },
            { val: s.dropped, color: "#f59e0b" },
          ].filter(x => x.val > 0).map((seg, i) => (
            <div key={i} style={{
              flex: Math.max(seg.val, 0.1),
              background: seg.color,
              opacity: 0.9
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
