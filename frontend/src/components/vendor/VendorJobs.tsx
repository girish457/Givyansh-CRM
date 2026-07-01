import { useState, useEffect } from "react";
import { LucideBriefcase, LucideMapPin, LucideUsers, LucideRefreshCw, LucideClock } from "lucide-react";
import { motion } from "framer-motion";

export default function VendorJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeader = { "Authorization": `VendorBearer ${localStorage.getItem("vendor_token") || ""}` };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/jobs", { headers: authHeader });
      if (res.ok) setJobs(await res.json());
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, any> = {
      "Open": { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
      "Closed": { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
      "On Hold": { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
    };
    return styles[status] || { bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" };
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1300px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Assigned Jobs</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>Job requirements assigned to your agency</p>
        </div>
        <button onClick={fetchJobs} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
          <LucideRefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <LucideRefreshCw className="animate-spin" size={28} style={{ margin: "0 auto 12px" }} />
          <p>Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 40px", background: "white", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
          <LucideBriefcase size={48} style={{ margin: "0 auto 16px", opacity: 0.2, display: "block" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>No Jobs Assigned</h3>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>Your recruitment manager will assign job requirements to your agency.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {jobs.map((job, i) => {
            const statusStyle = getStatusBadge(job.status);
            return (
              <motion.div
                key={job.id || i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.2s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#2563eb"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(37,99,235,0.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <LucideBriefcase size={20} color="#2563eb" />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "20px", background: statusStyle.bg }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: statusStyle.dot }} />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: statusStyle.color }}>{job.status || "Open"}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{job.title || job.jobTitle || "Job Opening"}</h3>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 14px", fontWeight: 500 }}>{job.clientName || job.client || "Client"}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                  {job.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "0.8rem", color: "#475569" }}>
                      <LucideMapPin size={13} color="#94a3b8" /> {job.location}
                    </div>
                  )}
                  {(job.openings || job.vacancies) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "0.8rem", color: "#475569" }}>
                      <LucideUsers size={13} color="#94a3b8" /> {job.openings || job.vacancies} openings
                    </div>
                  )}
                  {(job.salaryMin || job.salaryMax) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "0.8rem", color: "#475569" }}>
                      <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>₹</span>
                      {job.salaryMin && job.salaryMax ? `${job.salaryMin} – ${job.salaryMax} LPA` : `${job.salaryMin || job.salaryMax} LPA`}
                    </div>
                  )}
                  {job.createdAt && (
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "0.75rem", color: "#94a3b8" }}>
                      <LucideClock size={12} /> Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {job.description && (
                  <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0 0 14px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
                    {job.description}
                  </p>
                )}

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {job.skills && job.skills.split(",").slice(0, 4).map((skill: string, si: number) => (
                    <span key={si} style={{ padding: "3px 9px", borderRadius: "6px", background: "#f1f5f9", color: "#475569", fontSize: "0.7rem", fontWeight: 600 }}>{skill.trim()}</span>
                  ))}
                  {job.employmentType && (
                    <span style={{ padding: "3px 9px", borderRadius: "6px", background: "#eff6ff", color: "#2563eb", fontSize: "0.7rem", fontWeight: 700 }}>{job.employmentType}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
