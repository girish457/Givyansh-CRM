import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  LucideBuilding2,
  LucideUsers,
  LucideTrendingUp,
  LucidePlus,
  LucideLoader2,
  LucideLayoutGrid,
  LucideCreditCard,
  LucideMessageSquare,
  LucideSettings,
  LucideCheckCircle2,
  LucideTrash2,
  LucideEdit,
  LucideSave,
  LucideXCircle,
  LucideShieldCheck,
  LucideShieldAlert,
  LucideActivity,
  LucideDatabase,
  LucideHardDrive,
  LucideCpu,
  LucideClock,
  LucideSearch,
  LucideUserCheck,
  LucideServer,
  LucideInfo,
  LucideLock,
  LucideGlobe,
  LucideMail,
  LucideCalendar,
  LucidePhone,
  LucideMapPin,
  LucideCheck,
  LucideAlertCircle,
  LucideChevronRight,
  LucideArrowUpRight,
  LucideDollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import "@/styles/Dashboard.css";

export default function SuperAdminDashboard() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "dashboard";

  const setActiveTab = (t: string) => navigate(`/superadmin/${t}`);

  // LOADING STATE
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Configuration successfully synced.");

  // ORIGINAL TABS STATE (Untouched & working)
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [yearlyDiscount, setYearlyDiscount] = useState("20");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // NEW ADVANCED TABS STATE
  const [companies, setCompanies] = useState<any[]>([]);
  const [health, setHealth] = useState<any>({
    cpuLoad: 24,
    ramUsage: 4.2,
    dbStatus: "Healthy",
    apiResponseStatus: "Normal",
    responseTime: "42ms",
    errorRate: "0.01%",
    systemStatus: "Operational"
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters for Company Directory
  const [companySearch, setCompanySearch] = useState("");
  const [companyStatusFilter, setCompanyStatusFilter] = useState("all");
  const [companyUsageFilter, setCompanyUsageFilter] = useState("all");

  // Form State for Boss Account Creation
  const [createForm, setCreateForm] = useState({
    companyName: "",
    companyLogo: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    industryType: "",
    plan: "Starter",
    monthlyPricing: "99",
    billingCycle: "Monthly",
    accountExpiryDate: "",
    bossName: "",
    bossEmail: "",
    bossPassword: "",
    maxManagers: "5",
    maxTls: "20",
    maxRecruiters: "100"
  });

  // Form State for Subscription/Limits Edit
  const [editForm, setEditForm] = useState<any>({
    id: "",
    name: "",
    logo: "",
    phone: "",
    address: "",
    industryType: "",
    plan: "Starter",
    monthlyPricing: "99",
    billingCycle: "Monthly",
    accountExpiryDate: "",
    status: "active",
    maxManagers: 5,
    maxTls: 20,
    maxRecruiters: 100
  });

  // --- API FETCH LOGIC ---
  const authFetch = async (url: string, options: any = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      ...options.headers,
    };
    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      ...options,
      headers
    });
    if (res.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      throw new Error("Unauthorized");
    }
    return res;
  };

  const fetchSettings = async () => {
    try {
      const res = await authFetch("/api/settings/yearly_discount");
      const data: any = await res.json();
      setYearlyDiscount(data.value || "20");
    } catch (err) { console.error(err); }
  };

  const fetchPricing = async () => {
    try {
      const res = await authFetch("/api/pricing");
      const data = await res.json();
      setPricingPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Pricing fetch failed", err);
      setPricingPlans([]);
    }
  };

  const fetchInquiries = async () => {
    try {
      const res = await authFetch("/api/superadmin/inquiries");
      const data = await res.json();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Inquiry fetch failed", err);
      setInquiries([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await authFetch("/api/superadmin/companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error("Companies fetch failed", err); }
  };

  const fetchHealth = async () => {
    try {
      const res = await authFetch("/api/superadmin/system-health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) { console.error("Health fetch failed", err); }
  };

  const fetchAlerts = async () => {
    try {
      const res = await authFetch("/api/superadmin/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error("Alerts fetch failed", err); }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await authFetch("/api/superadmin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error("Audit logs fetch failed", err); }
  };

  const fetchLiveActivity = async () => {
    try {
      const res = await authFetch("/api/superadmin/live-activity");
      if (res.ok) {
        const data = await res.json();
        setLiveActivity(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error("Live activity fetch failed", err); }
  };

  // INITIAL SEED & REFRESH TIMERS WITH SESSION GUARD
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const meRes = await fetch("/api/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!meRes.ok) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const user = await meRes.json();
        if (user.role !== "superadmin") {
          navigate("/login");
          return;
        }

        await Promise.all([
          fetchPricing(),
          fetchInquiries(),
          fetchSettings(),
          fetchCompanies(),
          fetchHealth(),
          fetchAlerts(),
          fetchAuditLogs(),
          fetchLiveActivity()
        ]);
      } catch (err) {
        console.error("Session verification failed", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    init();

    // Polling interval for real-time synchronization (compulsory real-time sync)
    const pollInterval = setInterval(() => {
      fetchCompanies();
      fetchHealth();
      fetchAlerts();
      fetchAuditLogs();
      fetchLiveActivity();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, []);

  // --- ACTIONS & HANDLERS ---

  // Create Boss Account & Corporate Tenant
  const handleCreateCompany = async (e: any) => {
    e.preventDefault();
    try {
      const res = await authFetch("/api/superadmin/company", {
        method: "POST",
        body: JSON.stringify(createForm)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setCreateForm({
          companyName: "",
          companyLogo: "",
          companyEmail: "",
          companyPhone: "",
          companyAddress: "",
          industryType: "",
          plan: "Starter",
          monthlyPricing: "99",
          billingCycle: "Monthly",
          accountExpiryDate: "",
          bossName: "",
          bossEmail: "",
          bossPassword: "",
          maxManagers: "5",
          maxTls: "20",
          maxRecruiters: "100"
        });
        await fetchCompanies();
        await fetchAuditLogs();
        setSuccessMessage("Genesis Seeding Complete. Boss Account and limits successfully established!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const err = await res.json();
        alert(`Creation failed: ${err.error || "Unknown server error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Uplink failed. Network issue.");
    }
  };

  // Edit Company Details (Subscription and Limits)
  const openEditModal = (comp: any) => {
    setEditForm({
      id: comp.id,
      name: comp.name,
      logo: comp.logo || "",
      phone: comp.phone || "",
      address: comp.address || "",
      industryType: comp.industryType || "",
      plan: comp.plan || "Starter",
      monthlyPricing: comp.monthlyPricing || "0",
      billingCycle: comp.billingCycle || "Monthly",
      accountExpiryDate: comp.accountExpiryDate || "",
      status: comp.status || "active",
      maxManagers: comp.maxManagers || 5,
      maxTls: comp.maxTls || 20,
      maxRecruiters: comp.maxRecruiters || 100
    });
    setShowEditModal(true);
  };

  const handleUpdateCompany = async (e: any) => {
    e.preventDefault();
    try {
      const res = await authFetch(`/api/superadmin/company/${editForm.id}`, {
        method: "PUT",
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setShowEditModal(false);
        // Refresh detail view if it's currently opened
        if (selectedCompany && selectedCompany.company.id === editForm.id) {
          const updatedList = await authFetch("/api/superadmin/companies").then(r => r.json());
          const match = updatedList.find((x: any) => x.company.id === editForm.id);
          if (match) setSelectedCompany(match);
        }
        await fetchCompanies();
        await fetchAuditLogs();
        setSuccessMessage("Company settings and operational limits successfully deployed!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const err = await res.json();
        alert(`Upgrade/Update failed: ${err.error || "Unknown server error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Uplink failed. Network issue.");
    }
  };

  // ORIGINAL TABS ACTIONS (Pricing & Inquiries - untouched)
  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    try {
      const cleanedFeatures = Array.isArray(editingPlan.features)
        ? editingPlan.features.filter((f: string) => f.trim() !== "")
        : [];

      const payload = { ...editingPlan, features: cleanedFeatures };

      const res = await authFetch(`/api/superadmin/pricing/${editingPlan.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingPlan(null);
        fetchPricing();
        setSuccessMessage("Pricing configuration successfully synced to Givyansh Node.");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const error: any = await res.json();
        alert(`Uplink failed: ${error.error || "Unknown server error"}`);
      }
    } catch (err) {
      console.error("Plan update failed", err);
      alert("Network failure: Could not reach the Givyansh terminal.");
    }
  };

  const handleDeleteInquiry = async (id: number) => {
    if (!confirm("Are you sure you want to delete this signal from Givyansh?")) return;
    try {
      const res = await authFetch(`/api/superadmin/inquiries/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchInquiries();
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const res = await authFetch(`/api/superadmin/inquiries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchInquiries();
    } catch (err) { console.error(err); }
  };

  const handleUpdateDiscount = async (val: string) => {
    setYearlyDiscount(val);
    try {
      await authFetch("/api/superadmin/settings/yearly_discount", {
        method: "PUT",
        body: JSON.stringify({ value: val })
      });
    } catch (err) { console.error(err); }
  };

  // --- FILTERS LOGIC ---
  const filteredInquiries = inquiries.filter(i => {
    const matchesSearch =
      i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCompanies = companies.filter(item => {
    const c = item.company;
    const b = item.boss;
    const matchesSearch =
      c.name?.toLowerCase().includes(companySearch.toLowerCase()) ||
      b?.name?.toLowerCase().includes(companySearch.toLowerCase()) ||
      b?.email?.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.industryType?.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.plan?.toLowerCase().includes(companySearch.toLowerCase());
      
    const matchesStatus =
      companyStatusFilter === "all" ||
      (companyStatusFilter === "active" && c.status === "active") ||
      (companyStatusFilter === "expired" && c.status === "expired") ||
      (companyStatusFilter === "suspended" && c.status === "suspended");

    const matchesUsage =
      companyUsageFilter === "all" ||
      (companyUsageFilter === "high_usage" && item.usage?.serverLoad > 60) ||
      (companyUsageFilter === "high_revenue" && c.monthlyPricing >= 200) ||
      (companyUsageFilter === "low_activity" && item.onlineCount === 0);

    return matchesSearch && matchesStatus && matchesUsage;
  });

  // Calculate MRR and Subscriptions breakdown
  const totalMRR = companies.reduce((sum, c) => sum + (c.company.monthlyPricing || 0), 0);
  const activeSubsCount = companies.filter(c => c.company.status === "active").length;
  const expiredSubsCount = companies.filter(c => c.company.status === "expired").length;
  const suspendedSubsCount = companies.filter(c => c.company.status === "suspended").length;

  const pendingRenewals = companies.filter(c => {
    if (!c.company.accountExpiryDate) return false;
    const exp = new Date(c.company.accountExpiryDate);
    const diff = exp.getTime() - Date.now();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000; // expiring in 7 days
  });

  const upcomingRenewals = companies.filter(c => {
    if (!c.company.accountExpiryDate) return false;
    const exp = new Date(c.company.accountExpiryDate);
    return exp.getTime() > Date.now(); // future renewals
  });

  // Online status totals
  let totalOnline = 0;
  let totalOffline = 0;
  let workingCount = 0;
  let breakCount = 0;
  let idleCount = 0;

  liveActivity.forEach(c => {
    c.users.forEach((u: any) => {
      if (u.isOnline) {
        totalOnline++;
        if (u.status === "Working") workingCount++;
        else if (u.status === "Break") breakCount++;
        else if (u.status === "Idle") idleCount++;
      } else {
        totalOffline++;
      }
    });
  });

  if (loading) return (
    <AdminLayout role="superadmin" activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="flex-center" style={{ minHeight: "80vh", display: "flex", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 size={40} className="animate-spin" color="#2563eb" />
        <p style={{ color: "#64748b", fontWeight: "700" }}>Securing Givyansh Cryptographic Session...</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout role="superadmin" activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="dash-v5-container" style={{ padding: "15px 24px" }}>
        <AnimatePresence mode="wait">

          {/* ==================================================== */}
          {/* TAB 1: MASTER DASHBOARD & REVENUE ANALYTICS */}
          {/* ==================================================== */}
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: "100%" }}>
              
              {/* TOP HEADER */}
              <div className="flex-between mb-large" style={{ marginBottom: "25px" }}>
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#1e293b", letterSpacing: "-0.5px" }}>Platform Control Grid</h2>
                  <p style={{ color: "#64748b", marginTop: "4px" }}>Real-time telemetry, subscription revenue, and cloud container health.</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ background: "#f0fdf4", color: "#166534", padding: "10px 20px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "800", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="pulse-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                    CORE_NODE_OPERATIONAL
                  </div>
                </div>
              </div>

              {/* KPI METRICS (METALLIC PREMIUM LOOK) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                
                {/* MRR */}
                <div className="premium-kpi-card" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white", padding: "24px", borderRadius: "20px", border: "1px solid #334155", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: "15px", right: "15px", color: "rgba(255,255,255,0.1)" }}><LucideDollarSign size={64} /></div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1.5px" }}>MONTHLY REVENUE (MRR)</span>
                  <h3 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "10px 0 5px 0" }}>${totalMRR.toLocaleString()}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#34d399" }}>
                    <LucideTrendingUp size={14} /> <span>Live dynamic invoicing</span>
                  </div>
                </div>

                {/* TENANTS */}
                <div className="premium-kpi-card" style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: "15px", right: "15px", color: "#e2e8f0" }}><LucideBuilding2 size={64} /></div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px" }}>CORPORATE TENANTS</span>
                  <h3 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "10px 0 5px 0", color: "#0f172a" }}>{companies.length}</h3>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    <span style={{ color: "#22c55e", fontWeight: "700" }}>{activeSubsCount} Active</span> | <span style={{ color: "#ef4444", fontWeight: "700" }}>{expiredSubsCount} Expired</span>
                  </div>
                </div>

                {/* RECRUITERS */}
                <div className="premium-kpi-card" style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: "15px", right: "15px", color: "#e2e8f0" }}><LucideUsers size={64} /></div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px" }}>RECRUITERS ECOSYSTEM</span>
                  <h3 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "10px 0 5px 0", color: "#0f172a" }}>
                    {companies.reduce((sum, c) => sum + (c.recruitersCount || 0), 0)}
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    Across all managers and organizational charts
                  </div>
                </div>

                {/* NETWORK TRAFFIC */}
                <div className="premium-kpi-card" style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: "15px", right: "15px", color: "#e2e8f0" }}><LucideActivity size={64} /></div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px" }}>LIVE NETWORK TRAFFIC</span>
                  <h3 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "10px 0 5px 0", color: "#0f172a" }}>
                    {totalOnline} <span style={{ fontSize: "1rem", color: "#94a3b8", fontWeight: "500" }}>Online</span>
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", gap: "10px" }}>
                    <span style={{ color: "#22c55e", fontWeight: "700" }}>● {workingCount} Working</span>
                    <span style={{ color: "#f97316", fontWeight: "700" }}>● {breakCount} Break</span>
                  </div>
                </div>

              </div>

              {/* TWO COLUMN GRID FOR REVENUE & TELEMETRY */}
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "25px" }}>

                {/* COLUMN 1: REVENUE DASHBOARD & SUBSCRIPTION BREAKDOWN */}
                <div className="glass-card" style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "24px" }}>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#0f172a", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <LucideCreditCard color="#2563eb" size={20} /> Subscription & Invoicing Pipeline
                  </h4>

                  {/* Subscriptions Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "24px" }}>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b" }}>ACTIVE CLUSTERS</span>
                      <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#22c55e", marginTop: "4px" }}>{activeSubsCount} Companies</div>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b" }}>EXPIRED / SUSPENDED</span>
                      <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#ef4444", marginTop: "4px" }}>
                        {expiredSubsCount + suspendedSubsCount} Companies
                      </div>
                    </div>
                  </div>

                  {/* Company Revenue Contribution */}
                  <h5 style={{ fontSize: "0.85rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "12px" }}>Company-wise MRR Contribution</h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }} className="scrollbar-thin">
                    {companies.length === 0 ? (
                      <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>No companies registered.</p>
                    ) : (
                      companies.map(c => {
                        const mrrShare = totalMRR > 0 ? Math.round(((c.company.monthlyPricing || 0) / totalMRR) * 100) : 0;
                        return (
                          <div key={c.company.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "12px 16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                            <div>
                              <strong style={{ fontSize: "0.9rem", color: "#1e293b" }}>{c.company.name}</strong>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Plan: {c.company.plan} | Cycle: {c.company.billingCycle}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <strong style={{ fontSize: "1rem", color: "#0f172a" }}>${c.company.monthlyPricing}/mo</strong>
                              <span style={{ fontSize: "0.75rem", color: "#2563eb", display: "block", fontWeight: "700" }}>{mrrShare}% share</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* COLUMN 2: SERVER & HEALTH STATUS */}
                <div className="glass-card" style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#0f172a", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <LucideServer color="#2563eb" size={20} /> System Health & Telemetry
                    </h4>

                    {/* Cpu load */}
                    <div style={{ marginBottom: "15px" }}>
                      <div className="flex-between" style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                        <span>Server CPU Load</span>
                        <span style={{ color: health.cpuLoad > 80 ? "#ef4444" : "#10b981" }}>{health.cpuLoad}%</span>
                      </div>
                      <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "100px", overflow: "hidden" }}>
                        <div style={{ width: `${health.cpuLoad}%`, height: "100%", background: health.cpuLoad > 80 ? "#ef4444" : "#2563eb", borderRadius: "100px", transition: "all 0.5s ease" }} />
                      </div>
                    </div>

                    {/* Ram usage */}
                    <div style={{ marginBottom: "15px" }}>
                      <div className="flex-between" style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                        <span>RAM Utilization</span>
                        <span>{health.ramUsage} GB / 16.0 GB</span>
                      </div>
                      <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "100px", overflow: "hidden" }}>
                        <div style={{ width: `${(health.ramUsage / 16) * 100}%`, height: "100%", background: "#2563eb", borderRadius: "100px", transition: "all 0.5s ease" }} />
                      </div>
                    </div>

                    {/* DB status */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>MySQL DB Nodes</span>
                      <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: "900" }}>{health.dbStatus?.toUpperCase()}</span>
                    </div>

                    {/* API response */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>API Response Latency</span>
                      <strong style={{ fontSize: "0.85rem", color: "#1e293b" }}>{health.responseTime}</strong>
                    </div>

                    {/* Error rate */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>Platform Error Rate</span>
                      <strong style={{ fontSize: "0.85rem", color: "#10b981" }}>{health.errorRate}</strong>
                    </div>
                  </div>

                  {/* ALERTS QUICK SNAPSHOT */}
                  <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "900", color: "#0f172a" }}>Critical Node Warnings</span>
                      <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: "8px", fontSize: "0.65rem", fontWeight: "900" }}>{alerts.length} ALERTS</span>
                    </div>
                    {alerts.length === 0 ? (
                      <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>No operational alerts detected.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {alerts.slice(0, 2).map((a, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", background: "#fff5f5", border: "1px solid #fee2e2", padding: "8px 12px", borderRadius: "8px", fontSize: "0.75rem", color: "#c53030" }}>
                            <LucideAlertCircle size={14} style={{ marginTop: "1px" }} />
                            <span>{a.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: COMPANY DIRECTORY (BOSS & LIMIT CONTROL) */}
          {/* ==================================================== */}
          {activeTab === "companies" && (
            <motion.div key="companies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: "100%" }}>
              
              {/* HEADER ACTIONS */}
              <div className="flex-between mb-large" style={{ marginBottom: "25px" }}>
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#1e293b" }}>Company Directory Hub</h2>
                  <p style={{ color: "#64748b", marginTop: "4px" }}>Register new tenants, upgrade subscription plans, and hardcode team limits.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{ background: "#2563eb", color: "white", padding: "12px 20px", borderRadius: "12px", border: "none", fontWeight: "900", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}
                >
                  <LucidePlus size={18} /> Register Corporate Tenant
                </button>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div style={{ display: "flex", gap: "15px", marginBottom: "25px", background: "white", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <LucideSearch size={18} style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="Search by company, boss email, plan, or industry..."
                    style={{ width: "100%", padding: "12px 12px 12px 45px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                  />
                </div>
                
                {/* Status Filter */}
                <select
                  style={{ padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", fontSize: "0.85rem", fontWeight: "700" }}
                  value={companyStatusFilter}
                  onChange={(e) => setCompanyStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Companies</option>
                  <option value="expired">Expired Subscriptions</option>
                  <option value="suspended">Suspended Accounts</option>
                </select>

                {/* Usage Filter */}
                <select
                  style={{ padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", fontSize: "0.85rem", fontWeight: "700" }}
                  value={companyUsageFilter}
                  onChange={(e) => setCompanyUsageFilter(e.target.value)}
                >
                  <option value="all">All Activities</option>
                  <option value="high_usage">High Server Load (&gt;60%)</option>
                  <option value="high_revenue">High Revenue (&gt;=$200/mo)</option>
                  <option value="low_activity">Low Activity (0 Users Online)</option>
                </select>
              </div>

              {/* COMPANY GRID LIST */}
              {filteredCompanies.length === 0 ? (
                <div className="flex-center flex-column" style={{ padding: "100px 0", background: "#f8fafc", borderRadius: "24px", border: "1px dashed #cbd5e1" }}>
                  <LucideBuilding2 size={48} color="#cbd5e1" />
                  <p style={{ marginTop: "15px", color: "#94a3b8", fontWeight: "700" }}>No corporate tenants match your criteria.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
                  {filteredCompanies.map(item => {
                    const c = item.company;
                    const boss = item.boss;
                    const limits = item.limits;
                    
                    return (
                      <div key={c.id} className="company-grid-card" style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "20px", boxShadow: "0 4px 10px rgba(0,0,0,0.01)", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                        
                        {/* Status bar */}
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: c.status === "active" ? "#22c55e" : c.status === "suspended" ? "#f97316" : "#ef4444" }} />

                        {/* Top Info */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                              {c.logo ? (
                                <img src={c.logo} alt="Company Logo" style={{ width: "45px", height: "45px", borderRadius: "10px", objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: "45px", height: "45px", borderRadius: "10px", background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "1.2rem" }}>
                                  {c.name?.[0]?.toUpperCase()}
                                </div>
                              )}
                              <div>
                                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>{c.name}</h4>
                                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{c.industryType || "General Recruiter"}</span>
                              </div>
                            </div>

                            <span style={{
                              padding: "4px 10px",
                              borderRadius: "100px",
                              fontSize: "0.6rem",
                              fontWeight: "900",
                              background: c.status === "active" ? "#e0f2fe" : c.status === "suspended" ? "#ffedd5" : "#fee2e2",
                              color: c.status === "active" ? "#0369a1" : c.status === "suspended" ? "#c2410c" : "#991b1b"
                            }}>
                              {c.status?.toUpperCase()}
                            </span>
                          </div>

                          {/* Boss Account Details */}
                          <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "12px", border: "1px solid #f1f5f9", marginBottom: "15px" }}>
                            <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#94a3b8", display: "block" }}>BOSS ACCOUNT</span>
                            <strong style={{ fontSize: "0.8rem", color: "#1e293b" }}>{boss ? boss.name : "Unassigned"}</strong>
                            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>{boss ? boss.email : ""}</span>
                          </div>

                          {/* Role Limits Tracking Bar */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "15px" }}>
                            <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#94a3b8" }}>OPERATIONAL CAPACITY LIMITS</span>
                            
                            {/* Managers limit */}
                            <div>
                              <div className="flex-between" style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569" }}>
                                <span>Managers Limit</span>
                                <span>{limits.managers.used} / {limits.managers.max}</span>
                              </div>
                              <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                                <div style={{ width: `${limits.managers.percent}%`, height: "100%", background: limits.managers.percent > 90 ? "#ef4444" : "#2563eb", borderRadius: "10px" }} />
                              </div>
                            </div>

                            {/* TLs limit */}
                            <div>
                              <div className="flex-between" style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569" }}>
                                <span>Team Leads Limit</span>
                                <span>{limits.tls.used} / {limits.tls.max}</span>
                              </div>
                              <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                                <div style={{ width: `${limits.tls.percent}%`, height: "100%", background: limits.tls.percent > 90 ? "#ef4444" : "#2563eb", borderRadius: "10px" }} />
                              </div>
                            </div>

                            {/* Recruiters limit */}
                            <div>
                              <div className="flex-between" style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569" }}>
                                <span>Recruiter Ecosystem</span>
                                <span>{limits.recruiters.used} / {limits.recruiters.max}</span>
                              </div>
                              <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                                <div style={{ width: `${limits.recruiters.percent}%`, height: "100%", background: limits.recruiters.percent > 90 ? "#ef4444" : "#2563eb", borderRadius: "10px" }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div style={{ display: "flex", gap: "10px", marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #f1f5f9" }}>
                          <button
                            onClick={() => setSelectedCompany(item)}
                            style={{ flex: 1, padding: "10px", background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: "10px", fontWeight: "800", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
                          >
                            <LucideInfo size={14} /> Enterprise Profile
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            style={{ padding: "10px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "10px", cursor: "pointer" }}
                            title="Edit Plan & Limits"
                          >
                            <LucideEdit size={16} />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </motion.div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: LIVE TRACKING HUB (USER STATES & SESSIONS) */}
          {/* ==================================================== */}
          {activeTab === "live-tracking" && (
            <motion.div key="live-tracking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: "100%" }}>
              
              {/* TOP HEADER */}
              <div className="flex-between mb-large" style={{ marginBottom: "25px" }}>
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#1e293b" }}>Live Tracking Hub</h2>
                  <p style={{ color: "#64748b", marginTop: "4px" }}>Real-time surveillance of user sessions, connection protocols, and terminal status.</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <span style={{ background: "#dcfce7", color: "#166534", padding: "8px 12px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                    {workingCount} Working
                  </span>
                  <span style={{ background: "#ffedd5", color: "#c2410c", padding: "8px 12px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316", display: "inline-block" }}></span>
                    {breakCount} Break
                  </span>
                  <span style={{ background: "#fef9c3", color: "#854d0e", padding: "8px 12px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#eab308", display: "inline-block" }}></span>
                    {idleCount} Idle
                  </span>
                </div>
              </div>

              {/* LIVE REGISTRY LIST */}
              {liveActivity.length === 0 ? (
                <div className="flex-center flex-column" style={{ padding: "100px 0", background: "#f8fafc", borderRadius: "24px", border: "1px dashed #cbd5e1" }}>
                  <LucideUsers size={48} color="#cbd5e1" />
                  <p style={{ marginTop: "15px", color: "#94a3b8", fontWeight: "700" }}>No registered connections detected.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                  {liveActivity.map((compItem, index) => {
                    const onlineCount = compItem.users.filter((u: any) => u.isOnline).length;
                    return (
                      <div key={index} className="glass-card" style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "15px" }}>
                          <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>
                            {compItem.companyName}
                          </h4>
                          <span style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: "800" }}>
                            {onlineCount} OF {compItem.users.length} AGENTS ACTIVE
                          </span>
                        </div>

                        {/* Users Table */}
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                              <tr style={{ borderBottom: "1.5px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", fontWeight: "900" }}>
                                <th style={{ padding: "10px 8px" }}>AGENT</th>
                                <th style={{ padding: "10px 8px" }}>ROLE</th>
                                <th style={{ padding: "10px 8px" }}>DYNAMIC STATUS</th>
                                <th style={{ padding: "10px 8px" }}>DEVICE / BROWSER</th>
                                <th style={{ padding: "10px 8px" }}>CONNECTION IP</th>
                                <th style={{ padding: "10px 8px" }}>PUNCH TIME</th>
                              </tr>
                            </thead>
                            <tbody>
                              {compItem.users.length === 0 ? (
                                <tr>
                                  <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "0.8rem" }}>
                                    No agents created inside this corporate directory.
                                  </td>
                                </tr>
                              ) : (
                                compItem.users.map((u: any, uIdx: number) => {
                                  let statusBg = "#f1f5f9";
                                  let statusColor = "#64748b";
                                  if (u.status === "Working") { statusBg = "#dcfce7"; statusColor = "#166534"; }
                                  else if (u.status === "Break") { statusBg = "#ffedd5"; statusColor = "#c2410c"; }
                                  else if (u.status === "Idle") { statusBg = "#fef9c3"; statusColor = "#854d0e"; }
                                  
                                  return (
                                    <tr key={uIdx} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "0.85rem" }}>
                                      <td style={{ padding: "12px 8px" }}>
                                        <strong style={{ color: "#1e293b", display: "block" }}>{u.name}</strong>
                                        <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{u.email}</span>
                                      </td>
                                      <td style={{ padding: "12px 8px", textTransform: "capitalize", fontWeight: "700" }}>
                                        {u.role}
                                      </td>
                                      <td style={{ padding: "12px 8px" }}>
                                        <span style={{ padding: "4px 10px", borderRadius: "100px", fontSize: "0.65rem", fontWeight: "900", background: statusBg, color: statusColor }}>
                                          {u.status?.toUpperCase()}
                                        </span>
                                      </td>
                                      <td style={{ padding: "12px 8px" }}>
                                        {u.session ? (
                                          <div>
                                            <span style={{ fontWeight: "700", color: "#475569" }}>{u.session.device}</span>
                                            <span style={{ fontSize: "0.7rem", color: "#94a3b8", display: "block" }}>{u.session.browser}</span>
                                          </div>
                                        ) : "—"}
                                      </td>
                                      <td style={{ padding: "12px 8px", fontFamily: "monospace", color: "#475569" }}>
                                        {u.session?.ip || "—"}
                                      </td>
                                      <td style={{ padding: "12px 8px", color: "#64748b" }}>
                                        {u.session?.loginTime ? new Date(u.session.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </motion.div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: AUDIT LOGS & ALERTS */}
          {/* ==================================================== */}
          {activeTab === "audit-logs" && (
            <motion.div key="audit-logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: "100%" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "25px" }}>
                
                {/* ALERTS CONTROL CENTER (LEFT PANEL) */}
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#0f172a", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <LucideShieldAlert color="#ef4444" size={20} /> System Security Alerts
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {alerts.length === 0 ? (
                      <div className="glass-card flex-center flex-column" style={{ padding: "40px 20px", textAlign: "center", background: "#f8fafc", border: "1px dashed #e2e8f0", borderRadius: "16px" }}>
                        <LucideShieldCheck size={32} color="#22c55e" style={{ marginBottom: "10px" }} />
                        <h5 style={{ margin: 0, color: "#1e293b" }}>Integrity Check Passed</h5>
                        <p style={{ margin: "5px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>No active warning triggers on platform.</p>
                      </div>
                    ) : (
                      alerts.map((a, i) => (
                        <div key={i} style={{ padding: "16px", borderRadius: "16px", background: a.type === "danger" ? "#fff5f5" : "#fffbeb", border: `1px solid ${a.type === "danger" ? "#fee2e2" : "#fef3c7"}`, color: a.type === "danger" ? "#9b2c2c" : "#92400e" }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <LucideAlertCircle size={18} style={{ marginTop: "1px", flexShrink: 0 }} />
                            <div>
                              <strong style={{ display: "block", fontSize: "0.85rem" }}>{a.title}</strong>
                              <p style={{ margin: "3px 0 0", fontSize: "0.75rem", lineHeight: "1.4" }}>{a.message}</p>
                              <span style={{ display: "block", fontSize: "0.65rem", marginTop: "8px", opacity: 0.8 }}>
                                Triggered: {new Date(a.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* PLATFORM AUDIT REGISTRY (RIGHT PANEL) */}
                <div className="glass-card" style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "24px" }}>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#0f172a", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <LucideShieldCheck color="#2563eb" size={20} /> Platform Audit Trail Registry
                  </h4>
                  
                  <div style={{ overflowY: "auto", maxHeight: "550px" }} className="scrollbar-thin">
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1.5px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", fontWeight: "900" }}>
                          <th style={{ padding: "10px 8px" }}>OPERATIONAL TRANSACTION</th>
                          <th style={{ padding: "10px 8px" }}>PERFORMED BY</th>
                          <th style={{ padding: "10px 8px" }}>TIMELOG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={3} style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "0.85rem" }}>
                              No transaction logs found.
                            </td>
                          </tr>
                        ) : (
                          auditLogs.map((l, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "0.8rem" }}>
                              <td style={{ padding: "12px 8px" }}>
                                <strong style={{ color: "#2563eb", display: "block", textTransform: "uppercase", fontSize: "0.7rem" }}>{l.action}</strong>
                                <span style={{ color: "#475569", fontSize: "0.75rem", lineHeight: "1.4" }}>{l.details}</span>
                              </td>
                              <td style={{ padding: "12px 8px", fontWeight: "700", color: "#1e293b" }}>
                                {l.performedBy}
                              </td>
                              <td style={{ padding: "12px 8px", color: "#64748b", fontSize: "0.75rem" }}>
                                {new Date(l.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: PRICING CONSOLE (Untouched & Fully Working) */}
          {/* ==================================================== */}
          {activeTab === "pricing" && (
            <motion.div key="pricing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: "100%" }}>
              <div className="glass-card" style={{ padding: "24px", background: "white", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
                <div className="flex-between mb-large" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "25px", marginBottom: "30px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#1e293b", letterSpacing: "-0.5px" }}>Global Pricing Console</h2>
                    <p style={{ color: "#64748b", marginTop: "4px" }}>Manage architectural plans, pricing, and neural features for all tenants.</p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ background: "white", padding: "8px 15px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b" }}>YEARLY DISCOUNT (%)</span>
                      <input
                        type="number"
                        value={yearlyDiscount}
                        onChange={(e: any) => handleUpdateDiscount(e.target.value)}
                        style={{ width: "60px", padding: "5px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center", fontWeight: "900", color: "#10b981" }}
                      />
                    </div>
                    <div style={{ background: "#f0f9ff", color: "#0369a1", padding: "10px 20px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "800", border: "1px solid #bae6fd" }}>LIVE_SYNC_ENABLED</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                  {pricingPlans.slice(0, 3).map(p => (
                    <div key={p.id} className="plan-card-admin" style={{
                      padding: "20px",
                      borderRadius: "20px",
                      border: "1px solid #e2e8f0",
                      background: "white",
                      boxShadow: "0 3px 5px -1px rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.3s ease"
                    }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "12px", color: "#2563eb" }}><LucideCreditCard size={22} /></div>
                          {p.isNeuralChoice && <span style={{ background: "#2563eb", color: "white", padding: "4px 10px", borderRadius: "100px", fontSize: "0.6rem", fontWeight: "900" }}>NEURAL CHOICE</span>}
                        </div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: "900", marginBottom: "8px" }}>{p.title}</h3>
                        <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#0f172a", marginBottom: "12px" }}>${p.price} <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "500" }}>/ month</span></div>
                        <p style={{ color: "#64748b", fontSize: "0.85rem", lineHeight: "1.5", marginBottom: "15px" }}>{p.description}</p>

                        <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "12px" }}>
                          <p style={{ fontWeight: "800", fontSize: "0.7rem", color: "#475569", marginBottom: "8px", textTransform: "uppercase" }}>Key Benefits</p>
                          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {(() => {
                              let fList = [];
                              try {
                                fList = typeof p.features === "string" ? JSON.parse(p.features) : (Array.isArray(p.features) ? p.features : []);
                              } catch (e) {
                                fList = Array.isArray(p.features) ? p.features : [];
                              }
                              return fList.map((f: string, i: number) => (
                                <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#475569", marginBottom: "6px" }}>
                                  <LucideCheckCircle2 size={14} color="#22c55e" /> {f}
                                </li>
                              ));
                            })()}
                          </ul>
                        </div>
                      </div>

                      <button
                        onClick={() => setEditingPlan({ ...p })}
                        style={{ width: "100%", marginTop: "20px", padding: "12px", background: "#0f172a", color: "white", borderRadius: "10px", border: "none", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "0.85rem" }}
                      >
                        <LucideEdit size={16} /> Modify Plan
                      </button>
                    </div>
                  ))}
                </div>

                {/* EDITING OVERLAY */}
                {editingPlan && (
                  <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: "100%", maxWidth: "700px", background: "white", padding: "45px", borderRadius: "32px", boxShadow: "0 25px 70px rgba(0,0,0,0.2)" }}>
                      <div className="flex-between mb-large">
                        <h2 style={{ fontSize: "1.6rem", fontWeight: "900" }}>Update Plan Node: {editingPlan.title}</h2>
                        <button onClick={() => setEditingPlan(null)} style={{ background: "#f1f5f9", border: "none", padding: "10px", borderRadius: "50%", cursor: "pointer" }}><LucideXCircle size={24} color="#64748b" /></button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", marginBottom: "8px" }}>Protocol Name</label>
                          <input type="text" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }} value={editingPlan.title} onChange={(e: any) => setEditingPlan({ ...editingPlan, title: e.target.value })} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", marginBottom: "8px" }}>Monthly Credits ($)</label>
                          <input type="text" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }} value={editingPlan.price} onChange={(e: any) => setEditingPlan({ ...editingPlan, price: e.target.value })} />
                        </div>
                      </div>

                      <div style={{ marginBottom: "25px" }}>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", marginBottom: "8px" }}>Mission Objective (Description)</label>
                        <textarea rows={2} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }} value={editingPlan.description} onChange={(e: any) => setEditingPlan({ ...editingPlan, description: e.target.value })} />
                      </div>

                      <div style={{ marginBottom: "25px" }}>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", marginBottom: "8px" }}>Operational Benefits (One per line)</label>
                        <textarea
                          rows={4}
                          style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                          value={(() => {
                            if (!editingPlan.features) return "";
                            if (Array.isArray(editingPlan.features)) return editingPlan.features.join("\n");
                            try {
                              const parsed = typeof editingPlan.features === "string" ? JSON.parse(editingPlan.features) : editingPlan.features;
                              return Array.isArray(parsed) ? parsed.join("\n") : "";
                            } catch (e) {
                              return typeof editingPlan.features === "string" ? editingPlan.features : "";
                            }
                          })()}
                          onChange={(e: any) => setEditingPlan({ ...editingPlan, features: e.target.value.split("\n") })}
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "20px", borderRadius: "16px", marginBottom: "30px" }}>
                        <input type="checkbox" checked={editingPlan.isNeuralChoice} onChange={(e: any) => setEditingPlan({ ...editingPlan, isNeuralChoice: e.target.checked })} style={{ width: "20px", height: "20px" }} />
                        <label style={{ fontWeight: "800", fontSize: "0.95rem" }}>Promote as "NEURAL CHOICE" recommendation</label>
                      </div>

                      <div style={{ display: "flex", gap: "15px" }}>
                        <button onClick={() => setEditingPlan(null)} style={{ flex: 1, padding: "16px", borderRadius: "14px", background: "#f1f5f9", border: "none", fontWeight: "800", cursor: "pointer" }}>Abort</button>
                        <button onClick={handleUpdatePlan} style={{ flex: 2, padding: "16px", borderRadius: "14px", background: "#2563eb", color: "white", border: "none", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><LucideSave size={20} /> Deploy Changes</button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: CONTACT QUERIES (Untouched & Fully Working) */}
          {/* ==================================================== */}
          {activeTab === "inquiry" && (
            <motion.div key="inquiry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: "100%" }}>
              <div className="glass-card" style={{ padding: "24px", background: "white", border: "1px solid #e2e8f0", borderRadius: "24px" }}>
                <div className="flex-between mb-large" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "25px", marginBottom: "30px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#1e293b" }}>Contact Queries Hub</h2>
                    <p style={{ color: "#64748b" }}>Manage inbound communications from the public portal.</p>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ display: "flex", background: "#f1f5f9", padding: "5px", borderRadius: "10px" }}>
                      {["all", "new", "resolved"].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "6px 15px", borderRadius: "8px", border: "none", cursor: "pointer", background: statusFilter === s ? "white" : "transparent", color: statusFilter === s ? "#0f172a" : "#64748b", fontWeight: "800", fontSize: "0.75rem", boxShadow: statusFilter === s ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}>{s.toUpperCase()}</button>
                      ))}
                    </div>
                    <button onClick={fetchInquiries} style={{ padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><LucideTrendingUp size={16} /> Sync</button>
                  </div>
                </div>

                <div style={{ marginBottom: "30px", display: "flex", gap: "15px" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <LucideUsers size={18} style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="text" placeholder="Search inquiries by name, email or subject..." style={{ width: "100%", padding: "15px 15px 15px 45px", borderRadius: "15px", border: "1px solid #e2e8f0", fontSize: "0.95rem" }} value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} />
                  </div>
                </div>

                <div className="query-grid" style={{ display: "grid", gap: "20px" }}>
                  {filteredInquiries.length === 0 ? (
                    <div className="flex-center flex-column" style={{ padding: "100px 0", background: "#f8fafc", borderRadius: "24px", border: "1px dashed #cbd5e1" }}>
                      <LucideMessageSquare size={50} color="#cbd5e1" />
                      <p style={{ marginTop: "15px", color: "#94a3b8", fontWeight: "600" }}>No signals match your current filters.</p>
                    </div>
                  ) : (
                    filteredInquiries.map(i => (
                      <div key={i.id} style={{
                        padding: "30px",
                        borderRadius: "24px",
                        border: "1px solid #e2e8f0",
                        background: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden"
                      }}>
                        <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "4px", background: i.status === "new" ? "#2563eb" : i.status === "resolved" ? "#22c55e" : "#94a3b8" }} />

                        <div className="flex-between mb-medium">
                          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                            <div style={{ width: "55px", height: "55px", borderRadius: "18px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "1.2rem" }}>{i.name?.[0] || "?"}</div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "900", color: "#0f172a" }}>{i.name}</h4>
                              <div style={{ display: "flex", gap: "15px", marginTop: "4px" }}>
                                <span style={{ fontSize: "0.85rem", color: "#2563eb", fontWeight: "700" }}>{i.email}</span>
                                <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>| {i.phone || "No Phone"}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "800", marginBottom: "8px" }}>{i.createdAt ? new Date(i.createdAt).toLocaleString() : ""}</div>
                            <span style={{ padding: "6px 14px", borderRadius: "100px", fontSize: "0.65rem", fontWeight: "900", background: i.status === "new" ? "#ebf5ff" : i.status === "resolved" ? "#f0fdf4" : "#f1f5f9", color: i.status === "new" ? "#2563eb" : i.status === "resolved" ? "#166534" : "#475569", textTransform: "uppercase", border: `1px solid ${i.status === "new" ? "#bfdbfe" : i.status === "resolved" ? "#bbf7d0" : "#e2e8f0"}` }}>{i.status || "NEW"}</span>
                          </div>
                        </div>

                        <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #f1f5f9", marginBottom: "25px" }}>
                          <h5 style={{ fontSize: "0.95rem", fontWeight: "900", marginBottom: "10px", color: "#0f172a" }}>Subject: {i.subject}</h5>
                          <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{i.message}</p>
                        </div>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                          {i.status !== "resolved" && (
                            <button onClick={() => handleStatusUpdate(i.id, "resolved")} style={{ padding: "10px 20px", background: "#22c55e", color: "white", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}><LucideCheckCircle2 size={16} /> Mark Resolved</button>
                          )}
                          {i.status === "resolved" && (
                            <button onClick={() => handleStatusUpdate(i.id, "new")} style={{ padding: "10px 20px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem" }}>Re-open Signal</button>
                          )}
                          <button onClick={() => handleDeleteInquiry(i.id)} style={{ padding: "10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "10px", cursor: "pointer" }}><LucideTrash2 size={18} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ==================================================== */}
        {/* MODAL: CREATE BOSS ACCOUNT SYSTEM */}
        {/* ==================================================== */}
        <AnimatePresence>
          {showCreateModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ width: "100%", maxWidth: "800px", background: "white", padding: "35px", borderRadius: "24px", boxShadow: "0 25px 70px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }}
                className="scrollbar-thin"
              >
                <div className="flex-between mb-large" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "15px", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "#0f172a" }}>Register Tenant & Generate Boss Account</h3>
                  <button onClick={() => setShowCreateModal(false)} style={{ background: "#f1f5f9", border: "none", padding: "8px", borderRadius: "50%", cursor: "pointer" }}><LucideXCircle size={22} color="#64748b" /></button>
                </div>

                <form onSubmit={handleCreateCompany}>
                  
                  {/* SECTION 1: Company Profile details */}
                  <h4 style={{ fontSize: "0.8rem", fontWeight: "900", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", borderBottom: "1px dashed #e2e8f0", paddingBottom: "5px" }}>Corporate Registry Details</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Company Name *</label>
                      <input type="text" required placeholder="e.g. Acme Agency" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.companyName} onChange={e => setCreateForm({...createForm, companyName: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Company Logo URL</label>
                      <input type="text" placeholder="https://logo.url/logo.png" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.companyLogo} onChange={e => setCreateForm({...createForm, companyLogo: e.target.value})} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Company Email</label>
                      <input type="email" placeholder="contact@company.com" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.companyEmail} onChange={e => setCreateForm({...createForm, companyEmail: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Company Phone</label>
                      <input type="text" placeholder="+1234567890" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.companyPhone} onChange={e => setCreateForm({...createForm, companyPhone: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Industry Type</label>
                      <input type="text" placeholder="e.g. IT, Healthcare" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.industryType} onChange={e => setCreateForm({...createForm, industryType: e.target.value})} />
                    </div>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Company Address</label>
                    <textarea placeholder="Full corporate address..." rows={2} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.companyAddress} onChange={e => setCreateForm({...createForm, companyAddress: e.target.value})} />
                  </div>

                  {/* SECTION 2: Subscription terms & limits */}
                  <h4 style={{ fontSize: "0.8rem", fontWeight: "900", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", borderBottom: "1px dashed #e2e8f0", paddingBottom: "5px" }}>Billing & Operational Limit Control</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "15px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Subscription Plan</label>
                      <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.plan} onChange={e => setCreateForm({...createForm, plan: e.target.value})}>
                        <option value="Starter">Starter Cluster</option>
                        <option value="Essentials">Essentials Cluster</option>
                        <option value="Business">Business Ecosystem</option>
                        <option value="Enterprise">Enterprise Grid</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Monthly Price ($)</label>
                      <input type="number" placeholder="99" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.monthlyPricing} onChange={e => setCreateForm({...createForm, monthlyPricing: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Billing Cycle</label>
                      <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.billingCycle} onChange={e => setCreateForm({...createForm, billingCycle: e.target.value})}>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Trial">Trial / Free</option>
                        <option value="Enterprise Custom">Enterprise Custom</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Account Expiry</label>
                      <input type="date" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.accountExpiryDate} onChange={e => setCreateForm({...createForm, accountExpiryDate: e.target.value})} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Max Managers Limit *</label>
                      <input type="number" required placeholder="5" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.maxManagers} onChange={e => setCreateForm({...createForm, maxManagers: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Max TLs Limit *</label>
                      <input type="number" required placeholder="20" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.maxTls} onChange={e => setCreateForm({...createForm, maxTls: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Max Recruiters Limit *</label>
                      <input type="number" required placeholder="100" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.maxRecruiters} onChange={e => setCreateForm({...createForm, maxRecruiters: e.target.value})} />
                    </div>
                  </div>

                  {/* SECTION 3: Boss User Account parameters */}
                  <h4 style={{ fontSize: "0.8rem", fontWeight: "900", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", borderBottom: "1px dashed #e2e8f0", paddingBottom: "5px" }}>Boss Account Credentials</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "25px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Boss Full Name *</label>
                      <input type="text" required placeholder="e.g. Girish Goswami" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.bossName} onChange={e => setCreateForm({...createForm, bossName: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Boss Email *</label>
                      <input type="email" required placeholder="boss@company.com" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.bossEmail} onChange={e => setCreateForm({...createForm, bossEmail: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Boss Password *</label>
                      <input type="password" required placeholder="••••••••" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={createForm.bossPassword} onChange={e => setCreateForm({...createForm, bossPassword: e.target.value})} />
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: "flex", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
                    <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "#f1f5f9", border: "none", fontWeight: "800", cursor: "pointer" }}>Cancel</button>
                    <button type="submit" style={{ flex: 2, padding: "12px", borderRadius: "10px", background: "#2563eb", color: "white", border: "none", fontWeight: "900", cursor: "pointer", boxShadow: "0 4px 10px rgba(37,99,235,0.2)" }}>Deploy Enterprise Node</button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==================================================== */}
        {/* MODAL: EDIT SUBSCRIPTION PLAN & LIMIT CONTROL */}
        {/* ==================================================== */}
        <AnimatePresence>
          {showEditModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ width: "100%", maxWidth: "700px", background: "white", padding: "35px", borderRadius: "24px", boxShadow: "0 25px 70px rgba(0,0,0,0.15)" }}
              >
                <div className="flex-between mb-large" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "15px", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "#0f172a" }}>Subscription Control & Team Limits</h3>
                  <button onClick={() => setShowEditModal(false)} style={{ background: "#f1f5f9", border: "none", padding: "8px", borderRadius: "50%", cursor: "pointer" }}><LucideXCircle size={22} color="#64748b" /></button>
                </div>

                <form onSubmit={handleUpdateCompany}>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Corporate Status</label>
                      <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                        <option value="active">Active (Full Access)</option>
                        <option value="suspended">Suspended (Lockout)</option>
                        <option value="expired">Expired (Lockout)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Subscription Plan</label>
                      <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editForm.plan} onChange={e => setEditForm({...editForm, plan: e.target.value})}>
                        <option value="Starter">Starter Cluster</option>
                        <option value="Essentials">Essentials Cluster</option>
                        <option value="Business">Business Ecosystem</option>
                        <option value="Enterprise">Enterprise Grid</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Monthly Pricing ($)</label>
                      <input type="number" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editForm.monthlyPricing} onChange={e => setEditForm({...editForm, monthlyPricing: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Billing Cycle</label>
                      <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editForm.billingCycle} onChange={e => setEditForm({...editForm, billingCycle: e.target.value})}>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Trial">Trial / Free</option>
                        <option value="Enterprise Custom">Enterprise Custom</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Expiry Date</label>
                      <input type="date" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editForm.accountExpiryDate} onChange={e => setEditForm({...editForm, accountExpiryDate: e.target.value})} />
                    </div>
                  </div>

                  <h5 style={{ fontSize: "0.8rem", fontWeight: "900", color: "#2563eb", textTransform: "uppercase", marginTop: "20px", marginBottom: "12px", borderBottom: "1px dashed #e2e8f0", paddingBottom: "5px" }}>Hardcoded Capacity Limits</h5>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "25px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Managers Limit</label>
                      <input type="number" required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editForm.maxManagers} onChange={e => setEditForm({...editForm, maxManagers: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>TL Limit</label>
                      <input type="number" required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editForm.maxTls} onChange={e => setEditForm({...editForm, maxTls: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "5px" }}>Recruiters Limit</label>
                      <input type="number" required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={editForm.maxRecruiters} onChange={e => setEditForm({...editForm, maxRecruiters: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
                    <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "#f1f5f9", border: "none", fontWeight: "800", cursor: "pointer" }}>Cancel</button>
                    <button type="submit" style={{ flex: 2, padding: "12px", borderRadius: "10px", background: "#2563eb", color: "white", border: "none", fontWeight: "900", cursor: "pointer" }}>Deploy Limit Upgrades</button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==================================================== */}
        {/* MODAL: DETAILED ADVANCED COMPANY PROFILE MODAL */}
        {/* ==================================================== */}
        <AnimatePresence>
          {selectedCompany && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ width: "100%", maxWidth: "880px", background: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 25px 70px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }}
                className="scrollbar-thin"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                    <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "1.4rem" }}>
                      {selectedCompany.company.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "#0f172a" }}>{selectedCompany.company.name}</h3>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Registered: {new Date(selectedCompany.company.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCompany(null)} style={{ background: "#f1f5f9", border: "none", padding: "8px", borderRadius: "50%", cursor: "pointer" }}><LucideXCircle size={22} color="#64748b" /></button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "25px" }}>
                  
                  {/* LEFT DETAILED COL: RESOURCE USAGE & CUSTOM PIPELINES */}
                  <div>
                    {/* Server telemetry */}
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "900", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                      Server & Resource Telemetry
                    </h4>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                      
                      {/* Server usage */}
                      <div>
                        <div className="flex-between" style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                          <span>Tenant Container Load</span>
                          <strong>{selectedCompany.usage?.serverLoad}%</strong>
                        </div>
                        <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                          <div style={{ width: `${selectedCompany.usage?.serverLoad}%`, height: "100%", background: "#2563eb", borderRadius: "10px" }} />
                        </div>
                      </div>

                      {/* Storage */}
                      <div className="flex-between" style={{ fontSize: "0.8rem", color: "#475569" }}>
                        <span>Database Storage</span>
                        <strong>{selectedCompany.usage?.dbStorage} MB / 500 MB</strong>
                      </div>

                      {/* Api usage */}
                      <div className="flex-between" style={{ fontSize: "0.8rem", color: "#475569" }}>
                        <span>API Payload Calls</span>
                        <strong>{selectedCompany.usage?.apiUsage} calls/hr</strong>
                      </div>

                      {/* File storage */}
                      <div className="flex-between" style={{ fontSize: "0.8rem", color: "#475569" }}>
                        <span>Candidate File Logs</span>
                        <strong>{selectedCompany.usage?.fileStorage} GB</strong>
                      </div>

                      {/* Bandwidth */}
                      <div className="flex-between" style={{ fontSize: "0.8rem", color: "#475569" }}>
                        <span>Network Bandwidth</span>
                        <strong>{selectedCompany.usage?.bandwidth} GB</strong>
                      </div>

                    </div>

                    {/* Dependency Analytics */}
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "900", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                      Company Dependency Analytics
                    </h4>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "10px" }}>
                      
                      {/* CRM */}
                      <div>
                        <div className="flex-between" style={{ fontSize: "0.75rem", color: "#475569", marginBottom: "2px" }}>
                          <span>CRM Integration</span>
                          <span>{selectedCompany.usage?.crm}%</span>
                        </div>
                        <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "10px" }}>
                          <div style={{ width: `${selectedCompany.usage?.crm}%`, height: "100%", background: "#10b981", borderRadius: "10px" }} />
                        </div>
                      </div>

                      {/* Lead data */}
                      <div>
                        <div className="flex-between" style={{ fontSize: "0.75rem", color: "#475569", marginBottom: "2px" }}>
                          <span>Lead Data System</span>
                          <span>{selectedCompany.usage?.leadData}%</span>
                        </div>
                        <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "10px" }}>
                          <div style={{ width: `${selectedCompany.usage?.leadData}%`, height: "100%", background: "#10b981", borderRadius: "10px" }} />
                        </div>
                      </div>

                      {/* Vendors */}
                      <div>
                        <div className="flex-between" style={{ fontSize: "0.75rem", color: "#475569", marginBottom: "2px" }}>
                          <span>Vendor Hub</span>
                          <span>{selectedCompany.usage?.vendors}%</span>
                        </div>
                        <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "10px" }}>
                          <div style={{ width: `${selectedCompany.usage?.vendors}%`, height: "100%", background: "#10b981", borderRadius: "10px" }} />
                        </div>
                      </div>

                      {/* Attendance */}
                      <div>
                        <div className="flex-between" style={{ fontSize: "0.75rem", color: "#475569", marginBottom: "2px" }}>
                          <span>Attendance Integration</span>
                          <span>{selectedCompany.usage?.attendance}%</span>
                        </div>
                        <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "10px" }}>
                          <div style={{ width: `${selectedCompany.usage?.attendance}%`, height: "100%", background: "#10b981", borderRadius: "10px" }} />
                        </div>
                      </div>

                      {/* AI integration */}
                      <div>
                        <div className="flex-between" style={{ fontSize: "0.75rem", color: "#475569", marginBottom: "2px" }}>
                          <span>AI Sourcing Pipeline</span>
                          <span>{selectedCompany.usage?.aiSystem}%</span>
                        </div>
                        <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "10px" }}>
                          <div style={{ width: `${selectedCompany.usage?.aiSystem}%`, height: "100%", background: "#8b5cf6", borderRadius: "10px" }} />
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* RIGHT DETAILED COL: HIRING METRICS & ACTION OVERVIEWS */}
                  <div>
                    {/* Subscription status */}
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "900", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                      Subscription Plan Overview
                    </h4>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                      <div className="flex-between">
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Current Plan:</span>
                        <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>{selectedCompany.company.plan}</strong>
                      </div>
                      <div className="flex-between">
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Monthly Invoicing:</span>
                        <strong style={{ fontSize: "0.9rem", color: "#22c55e" }}>${selectedCompany.company.monthlyPricing || 0}</strong>
                      </div>
                      <div className="flex-between">
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Billing Cycle:</span>
                        <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>{selectedCompany.company.billingCycle}</strong>
                      </div>
                      <div className="flex-between">
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Account Expiry:</span>
                        <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>
                          {selectedCompany.company.accountExpiryDate ? new Date(selectedCompany.company.accountExpiryDate).toLocaleDateString() : "Lifetime / Custom"}
                        </strong>
                      </div>
                    </div>

                    {/* Hiring KPIs */}
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "900", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                      Hiring & Ecosystem Metrics
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9", textAlign: "center" }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#94a3b8" }}>TOTAL CANDIDATES</span>
                        <strong style={{ display: "block", fontSize: "1.4rem", color: "#1e293b", marginTop: "4px" }}>{selectedCompany.candidatesCount}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9", textAlign: "center" }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#94a3b8" }}>PARTNER CLIENTS</span>
                        <strong style={{ display: "block", fontSize: "1.4rem", color: "#1e293b", marginTop: "4px" }}>{selectedCompany.clientsCount}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9", textAlign: "center" }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#94a3b8" }}>ACTIVE JOBS</span>
                        <strong style={{ display: "block", fontSize: "1.4rem", color: "#1e293b", marginTop: "4px" }}>{selectedCompany.jobsCount}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9", textAlign: "center" }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#94a3b8" }}>INTERVIEWS SCHEDULED</span>
                        <strong style={{ display: "block", fontSize: "1.4rem", color: "#1e293b", marginTop: "4px" }}>{selectedCompany.interviewsCount}</strong>
                      </div>
                      <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "12px", border: "1px solid #bbf7d0", textAlign: "center", gridColumn: "span 2" }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#166534" }}>TOTAL COMMITTED JOININGS (COMMISSIONS ACCRUED)</span>
                        <strong style={{ display: "block", fontSize: "1.5rem", color: "#15803d", marginTop: "4px" }}>
                          {selectedCompany.joinedCount} Joined <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "#166534" }}>({selectedCompany.selectedCount} Selected)</span>
                        </strong>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Controls */}
                <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      openEditModal(selectedCompany.company);
                    }}
                    style={{ flex: 1, padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer" }}
                  >
                    Adjust Operational Limits & Subscription
                  </button>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    style={{ padding: "12px 24px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer" }}
                  >
                    Close Profile Drawer
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SUCCESS NOTIFICATION POPUP */}
        <AnimatePresence>
          {showSuccess && (
            <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, pointerEvents: "none" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                style={{
                  background: "white",
                  padding: "40px 60px",
                  borderRadius: "32px",
                  boxShadow: "0 25px 90px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  border: "1px solid #f1f5f9",
                  pointerEvents: "auto"
                }}
              >
                <motion.div
                  initial={{ rotate: -45, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#dcfce7",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#22c55e",
                    marginBottom: "20px"
                  }}
                >
                  <LucideCheckCircle2 size={48} strokeWidth={3} />
                </motion.div>
                <h3 style={{ fontSize: "1.6rem", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>Deployed!</h3>
                <p style={{ color: "#64748b", fontWeight: "600", maxWidth: "300px" }}>{successMessage}</p>

                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  style={{ height: "4px", background: "#22c55e", position: "absolute", bottom: 0, left: 0, borderBottomLeftRadius: "32px", borderBottomRightRadius: "32px" }}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}