import { useState, useEffect } from "react";
import {
  LucideUsers, LucidePlus, LucideSearch, LucideRefreshCw,
  LucideX, LucideCheckCircle2, LucideLoader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "new": { bg: "#f8fafc", color: "#64748b" },
  "connected": { bg: "#eff6ff", color: "#2563eb" },
  "interested": { bg: "#f0fdf4", color: "#16a34a" },
  "selected": { bg: "#dcfce7", color: "#15803d" },
  "joined": { bg: "#bbf7d0", color: "#166534" },
  "rejected": { bg: "#fef2f2", color: "#dc2626" },
  "dropped": { bg: "#fffbeb", color: "#d97706" },
  "interview scheduled": { bg: "#f0f9ff", color: "#0891b2" },
  "process to joining": { bg: "#faf5ff", color: "#7c3aed" },
};

const getStatusStyle = (status: string) => {
  const key = (status || "new").toLowerCase();
  return STATUS_COLORS[key] || { bg: "#f8fafc", color: "#475569" };
};

const initialForm = {
  name: "", email: "", phone: "", designation: "",
  currentSalary: "", expectedSalary: "", experience: "", location: "", notes: ""
};

export default function VendorCandidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...initialForm, jobId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const authHeader = { "Authorization": `VendorBearer ${localStorage.getItem("vendor_token") || ""}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, jRes] = await Promise.all([
        fetch("/api/vendor/candidates", { headers: authHeader }),
        fetch("/api/vendor/jobs", { headers: authHeader })
      ]);
      if (cRes.ok) setCandidates(await cRes.json());
      if (jRes.ok) setJobs(await jRes.json());
    } catch (err) {
      console.error("Failed to fetch vendor candidates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/vendor/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Candidate submitted successfully!");
        setForm({ ...initialForm, jobId: "" });
        setShowForm(false);
        fetchData();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(data.error || "Failed to submit candidate.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = candidates.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) || c.designation?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "28px", maxWidth: "1300px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>My Submitted Candidates</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>{candidates.length} total submissions</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
            <LucideRefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg, #1d4ed8, #2563eb)", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(29,78,216,0.3)" }}>
            <LucidePlus size={15} /> Submit Candidate
          </button>
        </div>
      </div>

      {/* Success/Error */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 600 }}>
            <LucideCheckCircle2 size={16} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "16px", maxWidth: "400px" }}>
        <LucideSearch size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
        <input
          type="text" placeholder="Search by name, phone, designation..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", outline: "none", background: "white", boxSizing: "border-box" }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}><LucideRefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 12px" }} /><p>Loading candidates...</p></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
            <LucideUsers size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontWeight: 600, color: "#475569" }}>No candidates submitted yet</p>
            <p style={{ fontSize: "0.8rem" }}>Click "Submit Candidate" to add your first candidate.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                  {["Candidate", "Contact", "Designation", "Experience", "Location", "Status", "Submitted On"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const st = getStatusStyle(c.remarks || c.status);
                  return (
                    <tr key={c.id || i} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "white")}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", flexShrink: 0 }}>
                            {(c.name || "?")[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: "0.8rem", color: "#475569" }}>
                        <div>{c.phone}</div>
                        <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{c.email}</div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: "0.82rem", color: "#475569" }}>{c.designation || "—"}</td>
                      <td style={{ padding: "13px 16px", fontSize: "0.82rem", color: "#475569" }}>{c.experience || "—"}</td>
                      <td style={{ padding: "13px 16px", fontSize: "0.82rem", color: "#475569" }}>{c.location || "—"}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ ...st, padding: "3px 10px", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>{c.remarks || c.status || "New"}</span>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: "0.75rem", color: "#94a3b8" }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Candidate Modal */}
      <AnimatePresence>
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "white", width: "520px", maxWidth: "95vw", borderRadius: "20px", padding: "28px", boxShadow: "0 24px 48px -12px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Submit New Candidate</h3>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}><LucideX size={20} /></button>
              </div>
              {errorMsg && <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "0.82rem", fontWeight: 600 }}>{errorMsg}</div>}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { key: "name", label: "Full Name *", type: "text", required: true },
                    { key: "phone", label: "Phone Number *", type: "tel", required: true },
                    { key: "email", label: "Email Address", type: "email", required: false },
                    { key: "designation", label: "Designation / Role", type: "text", required: false },
                    { key: "currentSalary", label: "Current Salary", type: "text", required: false },
                    { key: "expectedSalary", label: "Expected Salary", type: "text", required: false },
                    { key: "experience", label: "Experience", type: "text", required: false },
                    { key: "location", label: "Current Location", type: "text", required: false },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>{f.label}</label>
                      <input type={f.type} required={f.required} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                {jobs.length > 0 && (
                  <div>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Apply For Job (Optional)</label>
                    <select value={form.jobId} onChange={e => setForm({ ...form, jobId: e.target.value })} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.875rem", outline: "none" }}>
                      <option value="">-- Select Job --</option>
                      {jobs.map(j => <option key={j.id} value={j.id}>{j.title || j.jobTitle} — {j.clientName || j.client}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Notes / Remarks</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.875rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 20px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg, #1d4ed8, #2563eb)", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                    {submitting ? <><LucideLoader2 size={14} className="animate-spin" /> Submitting...</> : "Submit Candidate"}
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
