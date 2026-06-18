import { useState, useEffect } from "react";
import { LucideTrendingUp, LucideRefreshCw, LucideBarChart3 } from "lucide-react";

interface Candidate { remarks?: string; status?: string; createdAt?: string; }

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function VendorReports() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  const authHeader = { "Authorization": `VendorBearer ${localStorage.getItem("vendor_token") || ""}` };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/candidates", { headers: authHeader });
      if (res.ok) setCandidates(await res.json());
    } catch (err) {
      console.error("Fetch candidates error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidates(); }, []);

  const getStatus = (c: Candidate) => (c.remarks || c.status || "new").toLowerCase();

  // Monthly data for charts
  const now = new Date();
  const currentYear = now.getFullYear();

  const buildMonthly = () => {
    const data = MONTHS.map((m, i) => {
      const mCands = candidates.filter(c => {
        const d = new Date(c.createdAt || "");
        return d.getMonth() === i && d.getFullYear() === currentYear;
      });
      const submitted = mCands.length;
      const selected = mCands.filter(c => getStatus(c).includes("selected") || getStatus(c).includes("hired")).length;
      const joined = mCands.filter(c => getStatus(c).includes("joined")).length;
      const rejected = mCands.filter(c => getStatus(c).includes("rejected")).length;
      return { label: m, submitted, selected, joined, rejected };
    });
    return data;
  };

  const buildQuarterly = () => {
    return [
      { label: "Q1 (Jan–Mar)", months: [0, 1, 2] },
      { label: "Q2 (Apr–Jun)", months: [3, 4, 5] },
      { label: "Q3 (Jul–Sep)", months: [6, 7, 8] },
      { label: "Q4 (Oct–Dec)", months: [9, 10, 11] },
    ].map(q => {
      const mCands = candidates.filter(c => {
        const d = new Date(c.createdAt || "");
        return q.months.includes(d.getMonth()) && d.getFullYear() === currentYear;
      });
      return {
        label: q.label,
        submitted: mCands.length,
        selected: mCands.filter(c => getStatus(c).includes("selected") || getStatus(c).includes("hired")).length,
        joined: mCands.filter(c => getStatus(c).includes("joined")).length,
        rejected: mCands.filter(c => getStatus(c).includes("rejected")).length,
      };
    });
  };

  const buildYearly = () => {
    const years = [...new Set(candidates.map(c => new Date(c.createdAt || "").getFullYear()))].filter(y => !isNaN(y)).sort();
    return years.map(yr => {
      const mCands = candidates.filter(c => new Date(c.createdAt || "").getFullYear() === yr);
      return {
        label: String(yr),
        submitted: mCands.length,
        selected: mCands.filter(c => getStatus(c).includes("selected") || getStatus(c).includes("hired")).length,
        joined: mCands.filter(c => getStatus(c).includes("joined")).length,
        rejected: mCands.filter(c => getStatus(c).includes("rejected")).length,
      };
    });
  };

  const data = period === "monthly" ? buildMonthly() : period === "quarterly" ? buildQuarterly() : buildYearly();
  const maxVal = Math.max(...data.map(d => d.submitted), 1);

  // Overall stats
  const totalSubmitted = candidates.length;
  const totalSelected = candidates.filter(c => getStatus(c).includes("selected") || getStatus(c).includes("hired")).length;
  const totalJoined = candidates.filter(c => getStatus(c).includes("joined")).length;
  const totalRejected = candidates.filter(c => getStatus(c).includes("rejected")).length;
  const selRate = totalSubmitted > 0 ? Math.round((totalSelected / totalSubmitted) * 100) : 0;
  const joinRate = totalSubmitted > 0 ? Math.round((totalJoined / totalSubmitted) * 100) : 0;
  const convRate = totalSelected > 0 ? Math.round((totalJoined / totalSelected) * 100) : 0;

  const CHART_BARS = [
    { key: "submitted", label: "Submitted", color: "#3b82f6" },
    { key: "selected", label: "Selected", color: "#10b981" },
    { key: "joined", label: "Joined", color: "#22c55e" },
    { key: "rejected", label: "Rejected", color: "#ef4444" },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "1300px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Performance Reports</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>Analyze your recruitment performance trends</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ display: "flex", background: "#f1f5f9", padding: "3px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            {(["monthly", "quarterly", "yearly"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: "7px 14px", borderRadius: "7px", border: "none", background: period === p ? "white" : "transparent", color: period === p ? "#2563eb" : "#64748b", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", textTransform: "capitalize", boxShadow: period === p ? "0 2px 6px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={fetchCandidates} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
            <LucideRefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Submitted", val: totalSubmitted, color: "#2563eb", bg: "#eff6ff" },
          { label: "Total Selected", val: totalSelected, color: "#059669", bg: "#f0fdf4" },
          { label: "Total Joined", val: totalJoined, color: "#16a34a", bg: "#dcfce7" },
          { label: "Total Rejected", val: totalRejected, color: "#dc2626", bg: "#fef2f2" },
          { label: "Selection Rate", val: `${selRate}%`, color: "#7c3aed", bg: "#faf5ff" },
          { label: "Joining Rate", val: `${joinRate}%`, color: "#d97706", bg: "#fffbeb" },
        ].map((item, i) => (
          <div key={i} style={{ background: "white", borderRadius: "14px", padding: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: item.color }}>{item.val}</div>
            <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginTop: "4px", letterSpacing: "0.3px" }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div style={{ background: "white", borderRadius: "18px", padding: "24px", border: "1px solid #e2e8f0", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 2px" }}>Submission vs Selection vs Joining Trend</h3>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, textTransform: "capitalize" }}>{period} breakdown — {currentYear}</p>
          </div>
          <div style={{ display: "flex", gap: "14px" }}>
            {CHART_BARS.map(b => (
              <div key={b.key} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", fontWeight: 600, color: "#64748b" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: b.color }} />{b.label}
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
            <LucideRefreshCw className="animate-spin" size={24} />
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "220px", paddingBottom: "28px", borderBottom: "1px solid #f1f5f9" }}>
            {data.map((d: any, i: number) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0", height: "100%", justifyContent: "flex-end" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "180px", width: "100%", justifyContent: "center" }}>
                  {CHART_BARS.map(b => {
                    const val = d[b.key] || 0;
                    const h = Math.max((val / maxVal) * 160, val > 0 ? 6 : 0);
                    return (
                      <div key={b.key} title={`${b.label}: ${val}`} style={{ flex: 1, maxWidth: "20px", height: `${h}px`, background: b.color, borderRadius: "4px 4px 0 0", transition: "height 0.5s ease", opacity: 0.9, cursor: "pointer" }} />
                    );
                  })}
                </div>
                <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 600, textAlign: "center", marginTop: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conversion Funnel */}
      <div style={{ background: "white", borderRadius: "18px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 20px" }}>Conversion Funnel</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            { label: "Submitted", val: totalSubmitted, max: totalSubmitted, color: "#3b82f6" },
            { label: "Selected", val: totalSelected, max: totalSubmitted, color: "#10b981" },
            { label: "Joined", val: totalJoined, max: totalSubmitted, color: "#22c55e" },
            { label: "Conversion Rate (Joined/Selected)", val: convRate, max: 100, color: "#7c3aed", isPercent: true },
          ].map((row, i) => {
            const pct = row.max > 0 ? Math.round((row.val / row.max) * 100) : 0;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "200px", fontSize: "0.8rem", fontWeight: 600, color: "#475569", flexShrink: 0 }}>{row.label}</div>
                <div style={{ flex: 1, height: "10px", background: "#f1f5f9", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: `${row.isPercent ? row.val : pct}%`, height: "100%", background: row.color, borderRadius: "5px", transition: "width 1s ease" }} />
                </div>
                <div style={{ width: "60px", textAlign: "right", fontSize: "0.85rem", fontWeight: 800, color: row.color }}>{row.isPercent ? `${row.val}%` : row.val}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
