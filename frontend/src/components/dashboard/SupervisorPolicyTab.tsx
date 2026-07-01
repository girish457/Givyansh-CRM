import React, { useState, useEffect, useRef } from "react";
import {
  LucideFileText,
  LucidePlus,
  LucideEdit,
  LucideArchive,
  LucideRefreshCw,
  LucideTrash2,
  LucideUpload,
  LucideDownload,
  LucideFileLock,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucideInfo,
  LucideUsers,
  LucideCalendar,
  LucideSearch,
  LucideClock,
  LucideDatabase,
  LucideFilter,
  LucideX,
  LucideEye,
  LucideCheck,
  LucideActivity,
  LucideFileSpreadsheet,
  LucideShield,
  LucideEyeOff,
  LucideHistory,
  LucideLoader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SupervisorPolicyTabProps {
  role: "tl" | "manager" | "boss" | "superadmin";
  currentUser: any;
}

interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  severityLevel: "Low" | "Medium" | "High" | "Critical";
  status: "Active" | "Archived" | "Draft";
  effectiveDate: string;
  lastUpdated: string;
  createdBy: string;
  acknowledgements: string[];
  documentUrl?: string;
  visibility: "All" | "TL" | "Recruiter" | "Manager";
  tags: string[];
  version: string;
}

const POLICY_STORAGE_KEY = "givyansh_policies_v2";

const CATEGORY_OPTIONS = [
  "HR Policy", "Code of Conduct", "Leave Policy", "Attendance Policy",
  "Recruitment Policy", "Performance Policy", "Compensation Policy",
  "Data Security", "Anti-Harassment", "Remote Work", "General"
];

const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"] as const;
const VISIBILITY_OPTIONS = ["All", "TL", "Recruiter", "Manager"] as const;

function generateId() {
  return `pol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function SupervisorPolicyTab({ role, currentUser }: SupervisorPolicyTabProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeView, setActiveView] = useState<"list" | "create" | "detail" | "history">("list");
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    severityLevel: "Medium" as Policy["severityLevel"],
    visibility: "All" as Policy["visibility"],
    effectiveDate: new Date().toISOString().split("T")[0],
    tags: "",
    version: "1.0",
    documentUrl: "",
    status: "Active" as Policy["status"]
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      // Try to load from API
      const res = await fetch("/api/policies");
      if (res.ok) {
        const data = await res.json();
        setPolicies(data);
        setLoading(false);
        return;
      }
    } catch {}
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(POLICY_STORAGE_KEY);
      if (stored) {
        setPolicies(JSON.parse(stored));
      } else {
        setPolicies(getSeedPolicies());
      }
    } catch {
      setPolicies(getSeedPolicies());
    }
    setLoading(false);
  };

  const getSeedPolicies = (): Policy[] => [
    {
      id: generateId(),
      title: "Attendance & Punctuality Policy",
      description: "All employees are required to maintain 90%+ monthly attendance. Unplanned absences must be reported to the TL by 9:00 AM on the day of absence. Three consecutive unplanned absences without notification will be treated as Absence Without Leave (AWOL).",
      category: "Attendance Policy",
      severityLevel: "High",
      status: "Active",
      effectiveDate: "2025-01-01",
      lastUpdated: new Date().toISOString().split("T")[0],
      createdBy: "HR Department",
      acknowledgements: [],
      visibility: "All",
      tags: ["attendance", "punctuality", "AWOL"],
      version: "2.1"
    },
    {
      id: generateId(),
      title: "Code of Professional Conduct",
      description: "All team members must maintain professional behaviour in client calls, team meetings, and internal communications. Use of disrespectful language, personal attacks, or unprofessional conduct will result in disciplinary action.",
      category: "Code of Conduct",
      severityLevel: "Critical",
      status: "Active",
      effectiveDate: "2024-06-01",
      lastUpdated: new Date().toISOString().split("T")[0],
      createdBy: "HR Department",
      acknowledgements: [],
      visibility: "All",
      tags: ["conduct", "professional", "disciplinary"],
      version: "3.0"
    },
    {
      id: generateId(),
      title: "Data Privacy & Candidate Confidentiality",
      description: "Candidate data including CV, contact details, salary expectations, and interview feedback must not be shared outside authorised channels. Sharing candidate data without consent is a terminable offence.",
      category: "Data Security",
      severityLevel: "Critical",
      status: "Active",
      effectiveDate: "2024-01-01",
      lastUpdated: new Date().toISOString().split("T")[0],
      createdBy: "Compliance Team",
      acknowledgements: [],
      visibility: "All",
      tags: ["data", "privacy", "confidentiality"],
      version: "1.5"
    }
  ];

  const savePolicies = (updated: Policy[]) => {
    setPolicies(updated);
    try {
      localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const canEdit = role === "manager" || role === "boss" || role === "superadmin";

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchesSeverity = severityFilter ? p.severityLevel === severityFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Company Policy...</span>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    const now = new Date().toISOString().split("T")[0];
    if (isEditing && selectedPolicy) {
      const updated = policies.map(p =>
        p.id === selectedPolicy.id
          ? { ...p, ...formData, tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean), lastUpdated: now }
          : p
      );
      savePolicies(updated);
    } else {
      const newPolicy: Policy = {
        id: generateId(),
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        lastUpdated: now,
        createdBy: currentUser?.name || "Admin",
        acknowledgements: []
      };
      savePolicies([newPolicy, ...policies]);
    }
    resetForm();
    setActiveView("list");
  };

  const resetForm = () => {
    setFormData({
      title: "", description: "", category: "General",
      severityLevel: "Medium", visibility: "All",
      effectiveDate: new Date().toISOString().split("T")[0],
      tags: "", version: "1.0", documentUrl: "", status: "Active"
    });
    setIsEditing(false);
    setSelectedPolicy(null);
  };

  const handleEdit = (policy: Policy) => {
    setFormData({
      title: policy.title,
      description: policy.description,
      category: policy.category,
      severityLevel: policy.severityLevel,
      visibility: policy.visibility,
      effectiveDate: policy.effectiveDate,
      tags: policy.tags.join(", "),
      version: policy.version,
      documentUrl: policy.documentUrl || "",
      status: policy.status
    });
    setSelectedPolicy(policy);
    setIsEditing(true);
    setActiveView("create");
  };

  const handleDelete = (id: string) => {
    savePolicies(policies.filter(p => p.id !== id));
    setShowDeleteConfirm(null);
    if (selectedPolicy?.id === id) {
      setActiveView("list");
      setSelectedPolicy(null);
    }
  };

  const handleAcknowledge = (policyId: string) => {
    const userName = currentUser?.name || "User";
    const updated = policies.map(p =>
      p.id === policyId && !p.acknowledgements.includes(userName)
        ? { ...p, acknowledgements: [...p.acknowledgements, userName] }
        : p
    );
    savePolicies(updated);
    if (selectedPolicy?.id === policyId) {
      setSelectedPolicy(updated.find(p => p.id === policyId) || null);
    }
  };

  const handleArchive = (id: string) => {
    const updated = policies.map(p =>
      p.id === id ? { ...p, status: p.status === "Archived" ? "Active" : "Archived" as Policy["status"] } : p
    );
    savePolicies(updated);
  };

  const getSeverityColor = (s: string) => {
    if (s === "Critical") return { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" };
    if (s === "High") return { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" };
    if (s === "Medium") return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" };
    return { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" };
  };

  const getStatusColor = (s: string) => {
    if (s === "Active") return { bg: "#f0fdf4", text: "#15803d" };
    if (s === "Archived") return { bg: "#f1f5f9", text: "#64748b" };
    return { bg: "#fefce8", text: "#a16207" };
  };

  const activeCount = policies.filter(p => p.status === "Active").length;
  const criticalCount = policies.filter(p => p.severityLevel === "Critical" && p.status === "Active").length;
  const userName = currentUser?.name || "";
  const acknowledgedCount = policies.filter(p => p.acknowledgements.includes(userName)).length;

  // ---- DETAIL VIEW ----
  if (activeView === "detail" && selectedPolicy) {
    const pol = selectedPolicy;
    const sev = getSeverityColor(pol.severityLevel);
    const hasAcknowledged = pol.acknowledgements.includes(userName);

    return (
      <div style={{ padding: "20px", background: "#f8fafc", minHeight: "100%", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={() => { setActiveView("list"); setSelectedPolicy(null); }}
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>
            ← Back
          </button>
          <span style={{ fontSize: "0.7rem", background: sev.bg, color: sev.text, border: `1px solid ${sev.border}`, padding: "3px 10px", borderRadius: "20px", fontWeight: 800 }}>{pol.severityLevel}</span>
          <span style={{ fontSize: "0.7rem", background: getStatusColor(pol.status).bg, color: getStatusColor(pol.status).text, padding: "3px 10px", borderRadius: "20px", fontWeight: 800, border: "1px solid #e2e8f0" }}>{pol.status}</span>
        </div>

        <div className="glass-card" style={{ background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "28px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>{pol.title}</h1>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "0.75rem", color: "#64748b" }}>
                <span><LucideCalendar size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />Effective: {pol.effectiveDate}</span>
                <span><LucideClock size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />Updated: {pol.lastUpdated}</span>
                <span><LucideUsers size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />By: {pol.createdBy}</span>
                <span>v{pol.version}</span>
              </div>
            </div>
            {canEdit && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleEdit(pol)}
                  style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "7px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <LucideEdit size={13} /> Edit
                </button>
                <button onClick={() => handleArchive(pol.id)}
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", padding: "7px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <LucideArchive size={13} /> {pol.status === "Archived" ? "Unarchive" : "Archive"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
          <div>
            <div className="glass-card" style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#0f172a", margin: "0 0 14px" }}>Policy Details</h3>
              <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.7, margin: 0 }}>{pol.description}</p>
            </div>

            {pol.tags.length > 0 && (
              <div className="glass-card" style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px" }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Tags</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {pol.tags.map(t => (
                    <span key={t} style={{ background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700 }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="glass-card" style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Your Acknowledgement</h3>
              {hasAcknowledged ? (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                  <LucideCheckCircle2 size={28} color="#15803d" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#15803d" }}>Acknowledged</div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0 0 12px" }}>By clicking below, you confirm you have read and understood this policy.</p>
                  <button onClick={() => handleAcknowledge(pol.id)}
                    style={{ width: "100%", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700 }}>
                    Acknowledge Policy
                  </button>
                </div>
              )}
            </div>

            <div className="glass-card" style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>
                Acknowledgements ({pol.acknowledgements.length})
              </h3>
              {pol.acknowledgements.length === 0 ? (
                <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>No acknowledgements yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {pol.acknowledgements.map(name => (
                    <div key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", color: "#475569" }}>
                      <LucideCheck size={13} color="#15803d" />
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- CREATE / EDIT VIEW ----
  if (activeView === "create") {
    return (
      <div style={{ padding: "20px", background: "#f8fafc", minHeight: "100%", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={() => { resetForm(); setActiveView("list"); }}
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>
            ← Back
          </button>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
            {isEditing ? "Edit Policy" : "Create New Policy"}
          </h2>
        </div>

        <div className="glass-card" style={{ background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Policy Title *</label>
              <input
                value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder="Enter policy title..."
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.88rem", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Description *</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder="Write the full policy details..."
                rows={5}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.85rem", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Category</label>
              <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}>
                {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Severity Level</label>
              <select value={formData.severityLevel} onChange={e => setFormData(f => ({ ...f, severityLevel: e.target.value as Policy["severityLevel"] }))}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}>
                {SEVERITY_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Visibility</label>
              <select value={formData.visibility} onChange={e => setFormData(f => ({ ...f, visibility: e.target.value as Policy["visibility"] }))}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}>
                {VISIBILITY_OPTIONS.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Status</label>
              <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value as Policy["status"] }))}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}>
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Effective Date</label>
              <input type="date" value={formData.effectiveDate} onChange={e => setFormData(f => ({ ...f, effectiveDate: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Version</label>
              <input value={formData.version} onChange={e => setFormData(f => ({ ...f, version: e.target.value }))}
                placeholder="e.g. 1.0"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Tags (comma separated)</label>
              <input value={formData.tags} onChange={e => setFormData(f => ({ ...f, tags: e.target.value }))}
                placeholder="e.g. attendance, leave, HR"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <button onClick={() => { resetForm(); setActiveView("list"); }}
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700 }}>
              Cancel
            </button>
            <button onClick={handleSubmit}
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "10px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700 }}>
              {isEditing ? "Save Changes" : "Publish Policy"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- LIST VIEW (default) ----
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", background: "#f8fafc", minHeight: "100%", overflowY: "auto", boxSizing: "border-box" }}>

      {/* Header Banner */}
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        borderRadius: "24px", padding: "28px", color: "white",
        boxShadow: "0 10px 35px rgba(37, 99, 235, 0.15)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px"
      }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: "1.6rem", fontWeight: 800 }}>Corporate Governance &amp; Compliance Center</h2>
          <p style={{ margin: 0, fontSize: "0.88rem", opacity: 0.9 }}>
            View, manage, and acknowledge company-wide policies and compliance directives.
          </p>
        </div>
        {canEdit && (
          <button onClick={() => { resetForm(); setActiveView("create"); }}
            style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", padding: "10px 20px", borderRadius: "12px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <LucidePlus size={16} /> New Policy
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
        {[
          { label: "Active Policies", value: activeCount, icon: <LucideFileText size={20} />, color: "#2563eb", bg: "#eff6ff" },
          { label: "Critical Policies", value: criticalCount, icon: <LucideAlertTriangle size={20} />, color: "#dc2626", bg: "#fef2f2" },
          { label: "Acknowledged by You", value: acknowledgedCount, icon: <LucideCheckCircle2 size={20} />, color: "#16a34a", bg: "#f0fdf4" },
          { label: "Total Policies", value: policies.length, icon: <LucideDatabase size={20} />, color: "#7c3aed", bg: "#f5f3ff" },
        ].map((card, i) => (
          <div key={i} className="glass-card" style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{card.label}</span>
              <div style={{ background: card.bg, color: card.color, borderRadius: "8px", padding: "6px" }}>{card.icon}</div>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a" }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "16px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 200px", position: "relative" }}>
          <LucideSearch size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search policies..."
            style={{ width: "100%", paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.82rem", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.82rem", outline: "none" }}>
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.82rem", outline: "none" }}>
          <option value="">All Severity</option>
          {SEVERITY_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "0.82rem", outline: "none" }}>
          <option value="">All Status</option>
          <option>Active</option>
          <option>Archived</option>
          <option>Draft</option>
        </select>
        {(searchQuery || categoryFilter || severityFilter || statusFilter) && (
          <button onClick={() => { setSearchQuery(""); setCategoryFilter(""); setSeverityFilter(""); setStatusFilter(""); }}
            style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "8px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>
            Clear
          </button>
        )}
      </div>

      {/* Policy List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredPolicies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <LucideFileText size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
            <h3 style={{ fontWeight: 800, color: "#475569", margin: "0 0 6px" }}>No policies found</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
              {canEdit ? "Create your first policy using the button above." : "No policies have been published yet."}
            </p>
          </div>
        ) : (
          filteredPolicies.map(policy => {
            const sev = getSeverityColor(policy.severityLevel);
            const stat = getStatusColor(policy.status);
            const hasAck = policy.acknowledgements.includes(userName);

            return (
              <motion.div key={policy.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", cursor: "pointer" }}
                onClick={() => { setSelectedPolicy(policy); setActiveView("detail"); }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: "#0f172a" }}>{policy.title}</h3>
                    <span style={{ fontSize: "0.65rem", background: sev.bg, color: sev.text, border: `1px solid ${sev.border}`, padding: "2px 8px", borderRadius: "12px", fontWeight: 800 }}>{policy.severityLevel}</span>
                    <span style={{ fontSize: "0.65rem", background: stat.bg, color: stat.text, padding: "2px 8px", borderRadius: "12px", fontWeight: 800, border: "1px solid #e2e8f0" }}>{policy.status}</span>
                    {hasAck && <span style={{ fontSize: "0.65rem", background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: "12px", fontWeight: 800, border: "1px solid #bbf7d0" }}>✓ Acknowledged</span>}
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5 }}>{policy.description.substring(0, 120)}{policy.description.length > 120 ? "..." : ""}</p>
                  <div style={{ display: "flex", gap: "12px", fontSize: "0.72rem", color: "#94a3b8" }}>
                    <span>{policy.category}</span>
                    <span>v{policy.version}</span>
                    <span>Effective: {policy.effectiveDate}</span>
                    <span>{policy.acknowledgements.length} acknowledgements</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setSelectedPolicy(policy); setActiveView("detail"); }}
                    style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700 }}>
                    View
                  </button>
                  {canEdit && (
                    <>
                      <button onClick={() => handleEdit(policy)}
                        style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700 }}>
                        <LucideEdit size={12} />
                      </button>
                      <button onClick={() => setShowDeleteConfirm(policy.id)}
                        style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700 }}>
                        <LucideTrash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "380px", width: "90%", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <LucideAlertTriangle size={40} color="#dc2626" style={{ marginBottom: 10 }} />
                <h3 style={{ margin: "0 0 8px", fontWeight: 800, color: "#0f172a" }}>Delete Policy?</h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>This action cannot be undone. The policy and all acknowledgements will be permanently deleted.</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowDeleteConfirm(null)}
                  style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", padding: "10px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(showDeleteConfirm)}
                  style={{ flex: 1, background: "#dc2626", border: "none", color: "#fff", padding: "10px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
