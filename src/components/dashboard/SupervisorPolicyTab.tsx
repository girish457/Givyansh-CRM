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
  LucideHistory
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PolicyTabProps {
  role: "boss" | "manager";
  currentUser: any;
}

const CATEGORIES = [
  "HR Policy", "Attendance Policy", "Leave Policy", "Work From Home Policy",
  "Recruitment Policy", "Employee Conduct Policy", "IT Security Policy",
  "Data Privacy Policy", "Confidentiality Policy", "Anti-Harassment Policy",
  "POSH Policy", "Compensation Policy", "Incentive Policy", "Asset Usage Policy",
  "Internet Usage Policy", "Company Rules", "Dress Code Policy", "Performance Policy",
  "Termination Policy", "Client Data Protection Policy", "Candidate Data Protection Policy", "Other"
];

const SEVERITIES = ["Informational", "Mandatory", "Critical"];

const ASSIGNMENT_TYPES = [
  { id: "All", label: "All Employees" },
  { id: "Managers", label: "All Managers" },
  { id: "TLs", label: "All TLs" },
  { id: "Recruiters", label: "All Recruiters" },
  { id: "Individual", label: "Individual Employees" },
  { id: "Custom", label: "Custom Groups" }
];

export default function SupervisorPolicyTab({ role, currentUser }: PolicyTabProps) {
  // Navigation State
  const [subTab, setSubTab] = useState<"policies" | "matrix" | "analytics" | "logs">("policies");

  // Data States
  const [policies, setPolicies] = useState<any[]>([]);
  const [complianceMatrix, setComplianceMatrix] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalPolicies: 0,
    activePoliciesCount: 0,
    pendingAcknowledgements: 0,
    acceptedPolicies: 0,
    changesThisMonth: 0,
    complianceRate: 0,
    mostViewed: "N/A",
    leastViewed: "N/A"
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal / Slide-over States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<any>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<any>(null);
  const [policyAnalyticsData, setPolicyAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("HR Policy");
  const [formDescription, setFormDescription] = useState("");
  const [formEffectiveDate, setFormEffectiveDate] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formSeverity, setFormSeverity] = useState("Informational");
  const [formStatus, setFormStatus] = useState("Draft");
  const [formAssignedType, setFormAssignedType] = useState("All");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [formDocuments, setFormDocuments] = useState<any[]>([]);
  const [incrementVersion, setIncrementVersion] = useState(false);
  
  // Upload States
  const [uploading, setUploading] = useState(false);
  const [docNameInput, setDocNameInput] = useState("");
  const [docTypeInput, setDocTypeInput] = useState("Main Policy Document");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPolicies(),
        fetchStats(),
        fetchComplianceMatrix(),
        fetchAuditLogs()
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    const res = await fetch("/api/policies");
    if (res.ok) {
      const data = await res.json();
      setPolicies(data);
    }
  };

  const fetchStats = async () => {
    const res = await fetch("/api/policies/dashboard-stats");
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  };

  const fetchComplianceMatrix = async () => {
    const res = await fetch("/api/policies/compliance-matrix");
    if (res.ok) {
      const data = await res.json();
      setComplianceMatrix(data);
    }
  };

  const fetchAuditLogs = async () => {
    const res = await fetch("/api/policies/audit-logs");
    if (res.ok) {
      const data = await res.json();
      setAuditLogs(data);
    }
  };

  const fetchPolicyAnalytics = async (policyId: number) => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/policies/${policyId}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setPolicyAnalyticsData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingPolicy(null);
    setFormTitle("");
    setFormCategory("HR Policy");
    setFormDescription("");
    setFormEffectiveDate(new Date().toISOString().split("T")[0]);
    setFormExpiryDate("");
    setFormSeverity("Informational");
    setFormStatus("Draft");
    setFormAssignedType("All");
    setSelectedUserIds([]);
    setFormDocuments([]);
    setIncrementVersion(false);
    setShowFormModal(true);
  };

  const handleOpenEditForm = (policy: any) => {
    setEditingPolicy(policy);
    setFormTitle(policy.title);
    setFormCategory(policy.category);
    setFormDescription(policy.description || "");
    setFormEffectiveDate(policy.effectiveDate ? policy.effectiveDate.split("T")[0] : "");
    setFormExpiryDate(policy.expiryDate ? policy.expiryDate.split("T")[0] : "");
    setFormSeverity(policy.severityLevel);
    setFormStatus(policy.status);
    setFormAssignedType(policy.assignedToType);
    
    let ids: number[] = [];
    try {
      ids = JSON.parse(policy.assignedToIds || "[]");
    } catch (e) {
      ids = [];
    }
    setSelectedUserIds(ids);

    let docs: any[] = [];
    try {
      docs = JSON.parse(policy.documents || "[]");
    } catch (e) {
      docs = [];
    }
    setFormDocuments(docs);
    setIncrementVersion(false);
    setShowFormModal(true);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64Data
          })
        });

        if (res.ok) {
          const data = await res.json();
          const docName = docNameInput.trim() || file.name;
          const newDoc = {
            id: Date.now(),
            name: docName,
            url: data.url,
            docType: docTypeInput
          };
          setFormDocuments(prev => [...prev, newDoc]);
          setDocNameInput("");
        } else {
          const errText = await res.text();
          alert("File upload failed! Status: " + res.status + " - " + errText);
        }
      } catch (err: any) {
        console.error(err);
        alert("Upload error occurred: " + err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (docId: number) => {
    setFormDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCategory) {
      alert("Policy Title and Category are required!");
      return;
    }

    const payload = {
      title: formTitle,
      category: formCategory,
      description: formDescription,
      effectiveDate: formEffectiveDate || null,
      expiryDate: formExpiryDate || null,
      severityLevel: formSeverity,
      status: formStatus,
      assignedToType: formAssignedType,
      assignedToIds: JSON.stringify(selectedUserIds),
      documents: formDocuments,
      incrementVersion
    };

    try {
      let res;
      if (editingPolicy) {
        res = await fetch(`/api/policies/${editingPolicy.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/policies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setShowFormModal(false);
        fetchInitialData();
      } else {
        const error = await res.json();
        alert("Error: " + error.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save policy.");
    }
  };

  const handleArchivePolicy = async (policyId: number) => {
    if (!confirm("Are you sure you want to archive this policy?")) return;
    try {
      const res = await fetch(`/api/policies/${policyId}/archive`, { method: "POST" });
      if (res.ok) fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReactivatePolicy = async (policyId: number) => {
    if (!confirm("Are you sure you want to reactivate this policy?")) return;
    try {
      const res = await fetch(`/api/policies/${policyId}/reactivate`, { method: "POST" });
      if (res.ok) fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePolicy = async (policyId: number) => {
    if (!confirm("Are you sure you want to delete this draft policy permanently?")) return;
    try {
      const res = await fetch(`/api/policies/${policyId}`, { method: "DELETE" });
      if (res.ok) fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogDownload = async (policyId: number, documentName: string) => {
    try {
      await fetch(`/api/policies/${policyId}/download-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName })
      });
      fetchAuditLogs();
    } catch (e) {
      console.error(e);
    }
  };

  // Filters calculation
  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchesSeverity = severityFilter ? p.severityLevel === severityFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "24px", boxSizing: "border-box" }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        borderRadius: "24px",
        padding: "30px",
        color: "white",
        boxShadow: "0 10px 35px rgba(37, 99, 235, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "1.8rem", fontWeight: 800 }}>Corporate Governance & Compliance Center</h2>
          <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.9 }}>
            Design, assign, and audit company policy compliance across your corporate branches.
          </p>
        </div>
        <button
          onClick={handleOpenCreateForm}
          style={{
            background: "white",
            color: "#1e3a8a",
            border: "none",
            borderRadius: "14px",
            padding: "12px 24px",
            fontSize: "0.9rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 15px rgba(255,255,255,0.2)",
            transition: "all 0.2s"
          }}
        >
          <LucidePlus size={18} />
          Create Policy
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        
        {[
          { title: "Total Policies", value: stats.totalPolicies, icon: <LucideFileLock size={20} />, color: "#3b82f6" },
          { title: "Active Policies", value: stats.activePoliciesCount, icon: <LucideCheckCircle2 size={20} />, color: "#10b981" },
          { title: "Pending Acks", value: stats.pendingAcknowledgements, icon: <LucideAlertTriangle size={20} />, color: "#f59e0b" },
          { title: "Compliance Rate", value: `${stats.complianceRate}%`, icon: <LucideActivity size={20} />, color: "#8b5cf6" },
          { title: "Changes This Month", value: stats.changesThisMonth, icon: <LucideClock size={20} />, color: "#ec4899" },
          { title: "Most Viewed Policy", value: stats.mostViewed || "N/A", icon: <LucideEye size={20} />, color: "#06b6d4", full: true }
        ].map((s, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              gridColumn: s.full ? "span 1" : "auto"
            }}
          >
            <div style={{
              background: `${s.color}15`,
              color: s.color,
              padding: "12px",
              borderRadius: "14px"
            }}>
              {s.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{s.title}</span>
              <span style={{ display: "block", fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", gap: "24px" }}>
        {[
          { id: "policies", label: "Policies Registry", icon: <LucideFileText size={18} /> },
          { id: "matrix", label: "Compliance Matrix", icon: <LucideUsers size={18} /> },
          { id: "analytics", label: "Engagement Analytics", icon: <LucideActivity size={18} /> },
          { id: "logs", label: "Governance Audit Logs", icon: <LucideDatabase size={18} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            style={{
              background: "none",
              border: "none",
              padding: "12px 4px",
              fontSize: "0.95rem",
              fontWeight: subTab === tab.id ? 800 : 600,
              color: subTab === tab.id ? "#2563eb" : "#64748b",
              borderBottom: subTab === tab.id ? "3px solid #2563eb" : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab View Workspace */}
      <div style={{ minHeight: "400px" }}>
        
        {/* TAB 1: POLICIES REGISTRY */}
        {subTab === "policies" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Filters Row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
                <LucideSearch size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search policies by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 40px",
                    borderRadius: "14px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "14px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.88rem",
                  background: "white"
                }}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "14px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.88rem",
                  background: "white"
                }}
              >
                <option value="">All Severities</option>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "14px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.88rem",
                  background: "white"
                }}
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("");
                  setSeverityFilter("");
                  setStatusFilter("");
                }}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: 600
                }}
              >
                Reset
              </button>
            </div>

            {/* Policies List */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {filteredPolicies.map((p) => {
                let docCount = 0;
                try {
                  docCount = JSON.parse(p.documents || "[]").length;
                } catch (e) {
                  docCount = 0;
                }
                const isOwnPolicy = p.createdBy === currentUser?.id;
                const tagColor = p.severityLevel === "Critical" ? "#ef4444" : (p.severityLevel === "Mandatory" ? "#f59e0b" : "#3b82f6");

                return (
                  <div
                    key={p.id}
                    className="glass-card"
                    style={{
                      background: "white",
                      borderRadius: "20px",
                      border: "1px solid #e2e8f0",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "16px",
                      position: "relative",
                      transition: "transform 0.2s"
                    }}
                  >
                    {/* Top Severity Tag & Source badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{
                        background: `${tagColor}15`,
                        color: tagColor,
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "0.72rem",
                        fontWeight: 800
                      }}>
                        {p.severityLevel}
                      </span>
                      <span style={{
                        background: p.createdByRole === "boss" ? "#eff6ff" : "#f0fdf4",
                        color: p.createdByRole === "boss" ? "#2563eb" : "#16a34a",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "0.72rem",
                        fontWeight: 700
                      }}>
                        {p.createdByRole === "boss" ? "Boss Policy" : "Manager Policy"}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", fontWeight: 800, color: "#1e293b" }}>{p.title}</h3>
                      <span style={{ display: "block", fontSize: "0.76rem", color: "#94a3b8", fontWeight: 700, marginBottom: "8px" }}>
                        Category: {p.category} | v{p.version}
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#475569",
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>
                        {p.description || "No description provided."}
                      </p>
                    </div>

                    {/* Assignment & Doc stats */}
                    <div style={{ display: "flex", gap: "16px", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <LucideUsers size={14} />
                        <span>{p.assignedToType}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <LucideFileText size={14} />
                        <span>{docCount} docs</span>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "14px",
                      marginTop: "4px"
                    }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700 }}>OWNER</span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b" }}>{p.createdByName}</span>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        
                        {/* Audit Details */}
                        <button
                          onClick={() => {
                            setShowAnalyticsModal(p);
                            fetchPolicyAnalytics(p.id);
                          }}
                          title="View Engagement Analytics"
                          style={{
                            background: "#eff6ff",
                            color: "#2563eb",
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px",
                            cursor: "pointer"
                          }}
                        >
                          <LucideEye size={16} />
                        </button>

                        <button
                          onClick={() => setShowHistoryModal(p)}
                          title="Version History"
                          style={{
                            background: "#f8fafc",
                            color: "#475569",
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px",
                            cursor: "pointer"
                          }}
                        >
                          <LucideHistory size={16} />
                        </button>

                        {/* Edit & Archive (Only Creator / Boss) */}
                        {(isOwnPolicy || role === "boss") && (
                          <>
                            <button
                              onClick={() => handleOpenEditForm(p)}
                              title="Edit Policy"
                              style={{
                                background: "#f8fafc",
                                color: "#475569",
                                border: "none",
                                borderRadius: "10px",
                                padding: "8px",
                                cursor: "pointer"
                              }}
                            >
                              <LucideEdit size={16} />
                            </button>

                            {p.status === "Active" ? (
                              <button
                                onClick={() => handleArchivePolicy(p.id)}
                                title="Archive Policy"
                                style={{
                                  background: "#fef3c7",
                                  color: "#d97706",
                                  border: "none",
                                  borderRadius: "10px",
                                  padding: "8px",
                                  cursor: "pointer"
                                }}
                              >
                                <LucideArchive size={16} />
                              </button>
                            ) : p.status === "Archived" ? (
                              <button
                                onClick={() => handleReactivatePolicy(p.id)}
                                title="Reactivate Policy"
                                style={{
                                  background: "#ecfdf5",
                                  color: "#059669",
                                  border: "none",
                                  borderRadius: "10px",
                                  padding: "8px",
                                  cursor: "pointer"
                                }}
                              >
                                <LucideRefreshCw size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeletePolicy(p.id)}
                                title="Delete Draft"
                                style={{
                                  background: "#fee2e2",
                                  color: "#dc2626",
                                  border: "none",
                                  borderRadius: "10px",
                                  padding: "8px",
                                  cursor: "pointer"
                                }}
                              >
                                <LucideTrash2 size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: COMPLIANCE MATRIX */}
        {subTab === "matrix" && (
          <div className="glass-card" style={{ background: "white", borderRadius: "24px", padding: "24px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: 800, color: "#1e293b" }}>Employee Compliance Status</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    <th style={{ padding: "14px 16px", color: "#64748b", fontWeight: 700, fontSize: "0.85rem" }}>Employee Name</th>
                    <th style={{ padding: "14px 16px", color: "#64748b", fontWeight: 700, fontSize: "0.85rem" }}>Role</th>
                    <th style={{ padding: "14px 16px", color: "#64748b", fontWeight: 700, fontSize: "0.85rem" }}>Assigned Policies</th>
                    <th style={{ padding: "14px 16px", color: "#64748b", fontWeight: 700, fontSize: "0.85rem" }}>Accepted</th>
                    <th style={{ padding: "14px 16px", color: "#64748b", fontWeight: 700, fontSize: "0.85rem" }}>Pending</th>
                    <th style={{ padding: "14px 16px", color: "#64748b", fontWeight: 700, fontSize: "0.85rem" }}>Compliance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceMatrix.map((row, idx) => {
                    const statusColor = row.compliancePct === 100 ? "#10b981" : (row.compliancePct >= 80 ? "#f59e0b" : "#ef4444");
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "#1e293b", fontSize: "0.88rem" }}>{row.name}</td>
                        <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>{row.role}</td>
                        <td style={{ padding: "14px 16px", color: "#1e293b", fontWeight: 600, fontSize: "0.88rem" }}>{row.assignedCount}</td>
                        <td style={{ padding: "14px 16px", color: "#10b981", fontWeight: 700, fontSize: "0.88rem" }}>{row.acceptedCount}</td>
                        <td style={{ padding: "14px 16px", color: row.pendingCount > 0 ? "#ef4444" : "#64748b", fontWeight: 700, fontSize: "0.88rem" }}>{row.pendingCount}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "10px", minWidth: "80px", position: "relative" }}>
                              <div style={{ height: "100%", width: `${row.compliancePct}%`, background: statusColor, borderRadius: "10px" }}></div>
                            </div>
                            <span style={{ fontWeight: 800, color: statusColor, fontSize: "0.85rem" }}>{row.compliancePct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ENGAGEMENT ANALYTICS */}
        {subTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div className="glass-card" style={{ background: "white", borderRadius: "24px", padding: "24px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: 800, color: "#1e293b" }}>Engagement & Analytics Tracking</h3>
              <p style={{ margin: "0 0 20px 0", fontSize: "0.85rem", color: "#64748b" }}>
                Select a policy card below to view detailed per-employee tracking, read duration stats, and page scroll metrics.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                {policies.filter(p => p.status === "Active").map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setShowAnalyticsModal(p);
                      fetchPolicyAnalytics(p.id);
                    }}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      padding: "16px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      transition: "transform 0.1s"
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>{p.category}</span>
                    <strong style={{ fontSize: "0.95rem", color: "#1e293b", display: "block" }}>{p.title}</strong>
                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Version: {p.version} | Severity: {p.severityLevel}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GOVERNANCE AUDIT LOGS */}
        {subTab === "logs" && (
          <div className="glass-card" style={{ background: "white", borderRadius: "24px", padding: "24px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: 800, color: "#1e293b" }}>Governance Audit Timeline</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "600px", overflowY: "auto" }}>
              {auditLogs.map((log) => {
                let statusColor = "#3b82f6";
                if (log.action === "Accept") statusColor = "#10b981";
                if (log.action === "Create") statusColor = "#8b5cf6";
                if (log.action === "Delete") statusColor = "#ef4444";
                if (log.action === "Archive") statusColor = "#d97706";

                return (
                  <div
                    key={log.id}
                    style={{
                      borderLeft: `4px solid ${statusColor}`,
                      background: "#f8fafc",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "16px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{
                          background: `${statusColor}15`,
                          color: statusColor,
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          textTransform: "uppercase"
                        }}>
                          {log.action}
                        </span>
                        <strong style={{ fontSize: "0.85rem", color: "#1e293b" }}>{log.userName}</strong>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>({log.userRole})</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>{log.details}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      <span style={{ display: "block", fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>
                        IP: {log.ipAddress || "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE / EDIT POLICY SLIDER */}
      <AnimatePresence>
        {showFormModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(15, 23, 42, 0.4)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-end"
          }}>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              style={{
                width: "550px",
                maxWidth: "95%",
                height: "100%",
                background: "white",
                boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box"
              }}
            >
              {/* Slider Header */}
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#1e293b" }}>
                  {editingPolicy ? "Edit Policy Configurations" : "Establish New Corporate Policy"}
                </h3>
                <button
                  onClick={() => setShowFormModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                >
                  <LucideX size={20} />
                </button>
              </div>

              {/* Slider Body Form */}
              <form onSubmit={handleSavePolicy} style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>POLICY TITLE *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Enter short descriptive title..."
                    style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>CATEGORY *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", background: "white" }}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>SEVERITY LEVEL *</label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value)}
                      style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", background: "white" }}
                    >
                      {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>DESCRIPTION & PURPOSE</label>
                  <textarea
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Summarize the core requirements and scope of the policy..."
                    style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>EFFECTIVE DATE</label>
                    <input
                      type="date"
                      value={formEffectiveDate}
                      onChange={(e) => setFormEffectiveDate(e.target.value)}
                      style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>EXPIRY DATE (OPTIONAL)</label>
                    <input
                      type="date"
                      value={formExpiryDate}
                      onChange={(e) => setFormExpiryDate(e.target.value)}
                      style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>STATUS *</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", background: "white" }}
                    >
                      <option value="Draft">Draft (Private)</option>
                      <option value="Active">Active (Publish)</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>ASSIGNMENT TARGET *</label>
                    <select
                      value={formAssignedType}
                      onChange={(e) => setFormAssignedType(e.target.value)}
                      style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", background: "white" }}
                    >
                      {ASSIGNMENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Individual/Custom assignment ID picking */}
                {["Individual", "Custom"].includes(formAssignedType) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>SELECT TARGET EMPLOYEES</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "120px", overflowY: "auto" }}>
                      {complianceMatrix.map(user => {
                        const isChecked = selectedUserIds.includes(user.userId);
                        return (
                          <button
                            type="button"
                            key={user.userId}
                            onClick={() => {
                              setSelectedUserIds(prev =>
                                isChecked ? prev.filter(id => id !== user.userId) : [...prev, user.userId]
                              );
                            }}
                            style={{
                              background: isChecked ? "#2563eb" : "white",
                              color: isChecked ? "white" : "#475569",
                              border: "1px solid #cbd5e1",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            {user.name} ({user.role.toUpperCase()})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Documents Management */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800, color: "#1e293b" }}>Document Management & SOPs</h4>
                  
                  {/* File Upload Selector Block */}
                  <div style={{ display: "flex", gap: "10px", background: "#f8fafc", padding: "14px", borderRadius: "12px" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <input
                        type="text"
                        placeholder="Document Display Name (e.g. Attendance Guide)"
                        value={docNameInput}
                        onChange={(e) => setDocNameInput(e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                      />
                      <select
                        value={docTypeInput}
                        onChange={(e) => setDocTypeInput(e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.8rem", background: "white", marginTop: "4px" }}
                      >
                        <option value="Main Policy Document">Main Policy Document</option>
                        <option value="Supporting Documents">Supporting Documents</option>
                        <option value="SOP Documents">SOP Documents</option>
                        <option value="Process Guides">Process Guides</option>
                        <option value="Attachments">Attachments</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={handleFileUpload}
                      style={{
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        padding: "0 18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.85rem",
                        fontWeight: 700
                      }}
                    >
                      <LucideUpload size={14} />
                      {uploading ? "Uploading..." : "Upload File"}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
                      style={{ display: "none" }}
                    />
                  </div>

                  {/* Documents List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {formDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          background: "#f1f5f9",
                          borderRadius: "10px",
                          padding: "10px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.8rem"
                        }}
                      >
                        <div>
                          <strong style={{ color: "#1e293b" }}>{doc.name}</strong>
                          <span style={{ display: "block", fontSize: "0.7rem", color: "#64748b" }}>{doc.docType}</span>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              background: "white",
                              color: "#475569",
                              padding: "6px",
                              borderRadius: "8px",
                              border: "1px solid #cbd5e1"
                            }}
                          >
                            <LucideDownload size={12} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(doc.id)}
                            style={{
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "none",
                              padding: "6px",
                              borderRadius: "8px",
                              cursor: "pointer"
                            }}
                          >
                            <LucideTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Version bump choice */}
                {editingPolicy && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fffbeb", padding: "14px", borderRadius: "12px", border: "1px solid #fde68a" }}>
                    <input
                      type="checkbox"
                      id="incVersion"
                      checked={incrementVersion}
                      onChange={(e) => setIncrementVersion(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="incVersion" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#b45309", cursor: "pointer" }}>
                      Increment policy version (Force re-acceptance for employees)
                    </label>
                  </div>
                )}

              </form>

              {/* Slider Footer */}
              <div style={{
                padding: "20px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                background: "#f8fafc"
              }}>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  style={{
                    background: "white",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePolicy}
                  style={{
                    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 24px",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(37, 99, 235, 0.2)"
                  }}
                >
                  Save Policy Setup
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: VERSION HISTORY TIMELINE */}
      <AnimatePresence>
        {showHistoryModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(15, 23, 42, 0.4)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "white",
                borderRadius: "24px",
                width: "600px",
                maxWidth: "95%",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                boxSizing: "border-box"
              }}
            >
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#1e293b" }}>
                  Policy Version History: {showHistoryModal.title}
                </h3>
                <button
                  onClick={() => setShowHistoryModal(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                >
                  <LucideX size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Active/Current Version */}
                <div style={{
                  border: "1px solid #2563eb",
                  background: "#eff6ff",
                  padding: "16px",
                  borderRadius: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ background: "#2563eb", color: "white", padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800 }}>CURRENT ACTIVE</span>
                    <strong style={{ fontSize: "0.9rem", color: "#1e293b" }}>Version {showHistoryModal.version}</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>{showHistoryModal.description}</p>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginTop: "8px", fontWeight: 600 }}>
                    Effective Date: {showHistoryModal.effectiveDate ? new Date(showHistoryModal.effectiveDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>

                {/* Timeline list of previous versions */}
                {(() => {
                  let history: any[] = [];
                  try {
                    history = JSON.parse(showHistoryModal.versionHistory || "[]");
                  } catch (e) {
                    history = [];
                  }

                  if (history.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                        <LucideInfo size={24} style={{ marginBottom: "8px" }} />
                        <p style={{ margin: 0, fontSize: "0.85rem" }}>No previous versions recorded.</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Archive timeline</h4>
                      {history.reverse().map((h, idx) => (
                        <div
                          key={idx}
                          style={{
                            borderLeft: "2px solid #cbd5e1",
                            paddingLeft: "16px",
                            position: "relative"
                          }}
                        >
                          <div style={{
                            width: "8px",
                            height: "8px",
                            background: "#94a3b8",
                            borderRadius: "50%",
                            position: "absolute",
                            left: "-5px",
                            top: "6px"
                          }}></div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <strong style={{ fontSize: "0.88rem", color: "#1e293b" }}>Version {h.version}</strong>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              {new Date(h.modifiedAt || h.createdAt || "").toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>{h.description}</p>
                          <span style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", marginTop: "4px" }}>
                            Modified By: {h.modifiedByName}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ENGAGEMENT & READING ANALYTICS DETAILED SHEET */}
      <AnimatePresence>
        {showAnalyticsModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(15, 23, 42, 0.4)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "white",
                borderRadius: "24px",
                width: "900px",
                maxWidth: "95%",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                boxSizing: "border-box"
              }}
            >
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#1e293b" }}>
                    Policy Reading Analytics: {showAnalyticsModal.title}
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Category: {showAnalyticsModal.category} | Version: {showAnalyticsModal.version}</span>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                >
                  <LucideX size={20} />
                </button>
              </div>

              {analyticsLoading ? (
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "50px" }}>
                  <LucideRefreshCw className="spin" size={32} style={{ color: "#2563eb" }} />
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  {/* Summary row */}
                  {policyAnalyticsData && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", background: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                      <div>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>TOTAL ASSIGNED</span>
                        <strong style={{ fontSize: "1.4rem", color: "#1e293b" }}>{policyAnalyticsData.summary.totalAssigned}</strong>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>TOTAL OPENED</span>
                        <strong style={{ fontSize: "1.4rem", color: "#2563eb" }}>{policyAnalyticsData.summary.totalOpened}</strong>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>COMPLETED READS</span>
                        <strong style={{ fontSize: "1.4rem", color: "#a855f7" }}>{policyAnalyticsData.summary.totalRead}</strong>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>ACCEPTANCE RATE</span>
                        <strong style={{ fontSize: "1.4rem", color: "#10b981" }}>{policyAnalyticsData.summary.acceptanceRate}%</strong>
                      </div>
                    </div>
                  )}

                  {/* Employees Detailed Table */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                          <th style={{ padding: "12px 14px", color: "#64748b", fontWeight: 700 }}>Employee Name</th>
                          <th style={{ padding: "12px 14px", color: "#64748b", fontWeight: 700 }}>Role</th>
                          <th style={{ padding: "12px 14px", color: "#64748b", fontWeight: 700 }}>Opened Date</th>
                          <th style={{ padding: "12px 14px", color: "#64748b", fontWeight: 700 }}>Read Time</th>
                          <th style={{ padding: "12px 14px", color: "#64748b", fontWeight: 700 }}>Scroll progress</th>
                          <th style={{ padding: "12px 14px", color: "#64748b", fontWeight: 700 }}>Accepted Date</th>
                          <th style={{ padding: "12px 14px", color: "#64748b", fontWeight: 700 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policyAnalyticsData?.employeeRows.map((row: any, idx: number) => {
                          let statusColor = "#ef4444";
                          if (row.acceptedStatus === "Accepted") statusColor = "#10b981";
                          if (row.acceptedStatus === "Opened") statusColor = "#3b82f6";

                          return (
                            <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1e293b" }}>{row.name}</td>
                              <td style={{ padding: "12px 14px", color: "#64748b", textTransform: "uppercase" }}>{row.role}</td>
                              <td style={{ padding: "12px 14px", color: "#475569" }}>
                                {row.openedDate ? new Date(row.openedDate).toLocaleString() : "Never Opened"}
                              </td>
                              <td style={{ padding: "12px 14px", color: "#475569", fontWeight: 600 }}>{row.readDuration}s</td>
                              <td style={{ padding: "12px 14px", color: "#475569" }}>
                                {row.scrollProgress ? `${Math.round(row.scrollProgress)}%` : "0%"}
                              </td>
                              <td style={{ padding: "12px 14px", color: "#475569" }}>
                                {row.acceptedDate ? new Date(row.acceptedDate).toLocaleString() : "-"}
                              </td>
                              <td style={{ padding: "12px 14px" }}>
                                <span style={{
                                  background: `${statusColor}15`,
                                  color: statusColor,
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  fontWeight: 800,
                                  fontSize: "0.7rem"
                                }}>
                                  {row.acceptedStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
