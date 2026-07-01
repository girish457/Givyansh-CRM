import React, { useState, useEffect } from "react";
import { 
  LucideUsers, LucidePlus, LucideSearch, LucideFilter, LucideTrendingUp, 
  LucideBriefcase, LucidePhone, LucideMail, LucideMapPin, LucideTag, 
  LucideFileText, LucideCheckCircle, LucideXCircle, LucideAlertCircle, 
  LucideArrowRight, LucideTrendingDown, LucideCalendar, LucideUserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Vendor {
  id: string;
  name: string;
  company: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  specialization: string;
  type: string; // Agency, Individual, Portal, Referral
  notes: string;
  createdAt: string;
  recruiterId: string;
  recruiterName: string;
}

export default function MyVendors({ currentUser, candidates }: { currentUser: any, candidates: any[] }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formVendor, setFormVendor] = useState<any>({
    name: "", company: "", contactPerson: "", phone: "", 
    email: "", location: "", specialization: "", type: "Agency", notes: "", portalPassword: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [duplicatePopup, setDuplicatePopup] = useState<{ show: boolean; existing?: any; message?: string }>({ show: false });

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterSpec, setFilterSpec] = useState("All");
  const [filterLoc, setFilterLoc] = useState("All");
  
  // Analytics Filter (Today, 7Days, Monthly, Yearly, Custom)
  const [analyticsFilter, setAnalyticsFilter] = useState<"Today" | "7Days" | "Monthly" | "Yearly" | "Custom">("7Days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Team & Organization Vendor Hierarchy Scopes
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedTlId, setSelectedTlId] = useState<string>("all");
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"my_vendors" | "team_vendors">(
    (currentUser?.role === "tl" || currentUser?.role === "manager" || currentUser?.role === "boss") ? "team_vendors" : "my_vendors"
  );

  const STORAGE_KEY = `givyansh_vendors_v1_${currentUser?.id || currentUser?.userId || currentUser?.role || 'recruiter'}`;
  const MAPPINGS_KEY = `givyansh_candidate_vendor_v1_${currentUser?.id || currentUser?.userId || currentUser?.role || 'recruiter'}`;

  // Fetch team directory for hierarchy filtering
  useEffect(() => {
    if (currentUser?.role === "tl" || currentUser?.role === "manager" || currentUser?.role === "boss") {
      fetchTeamMembers();
    }
  }, [currentUser]);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data);
      }
    } catch (err) {
      console.error("Failed to load team members for vendor tracking:", err);
    }
  };

  // Load Vendors
  useEffect(() => {
    loadVendors();
  }, [currentUser]);

  const loadVendors = async () => {
    let dbVendorsMapped: Vendor[] = [];
    try {
      const res = await fetch("/api/vendors");
      if (res.ok) {
        const data = await res.json();
        dbVendorsMapped = data.map((v: any) => ({
          id: String(v.id),
          name: v.name,
          company: v.company,
          contactPerson: v.contactPerson || "",
          phone: v.phone || "",
          email: v.email || "",
          location: v.location || "",
          specialization: v.specialization || "",
          type: v.type || "Agency",
          notes: v.notes || "",
          createdAt: v.createdAt,
          recruiterId: String(v.addedBy),
          recruiterName: v.creator?.name || currentUser?.name || "Recruiter"
        }));
      }
    } catch (err) {
      console.error("Failed to load vendors from DB:", err);
    }

    // Load from localStorage as fallback/merge
    const stored = localStorage.getItem(STORAGE_KEY);
    let localVendors: Vendor[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localVendors = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const merged = [...dbVendorsMapped];
    const unsyncedLocals: Vendor[] = [];

    localVendors.forEach((lv) => {
      const alreadyInDb = dbVendorsMapped.some(
        (dv) => dv.name.toLowerCase() === lv.name.toLowerCase() && dv.company.toLowerCase() === lv.company.toLowerCase()
      );
      if (!alreadyInDb) {
        merged.push(lv);
        unsyncedLocals.push(lv);
      }
    });

    // Auto-migrate unsynced local vendors to DB in background
    if (unsyncedLocals.length > 0) {
      console.log(`Auto-migrating ${unsyncedLocals.length} local vendors to DB...`);
      for (const lv of unsyncedLocals) {
        try {
          await fetch("/api/vendors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: lv.name,
              company: lv.company,
              contactPerson: lv.contactPerson,
              phone: lv.phone,
              email: lv.email,
              location: lv.location,
              type: lv.type,
              specialization: lv.specialization,
              notes: lv.notes
            })
          });
        } catch (e) {
          console.error("Failed to auto-migrate vendor:", lv.name, e);
        }
      }
      setTimeout(() => {
        loadVendors();
      }, 1000);
      return;
    }

    // Dynamic scoping hierarchy filters:
    // Allow TL, Manager, Boss to load all company vendors so we can dynamically filter them in React
    const allowed = merged.filter((v: any) => {
      if (currentUser?.role === "tl" || currentUser?.role === "manager" || currentUser?.role === "boss") {
        return true;
      }
      return String(v.recruiterId) === String(currentUser?.id || currentUser?.userId) || 
             v.recruiterName?.toLowerCase() === currentUser?.name?.toLowerCase();
    });

    setVendors(allowed);
  };

  // Add/Edit Save
  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    if (!formVendor.name || !formVendor.company) {
      setSaveError("Vendor Name and Company Name are mandatory.");
      return;
    }

    const savePayload = {
      id: editingId && !isNaN(Number(editingId)) ? parseInt(editingId) : undefined,
      name: formVendor.name,
      company: formVendor.company,
      contactPerson: formVendor.contactPerson,
      phone: formVendor.phone,
      email: formVendor.email,
      location: formVendor.location,
      type: formVendor.type,
      specialization: formVendor.specialization,
      notes: formVendor.notes,
      portalPassword: formVendor.portalPassword || undefined
    };

    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload)
      });
      const responseData = await res.json();
      if (res.ok) {
        const stored = localStorage.getItem(STORAGE_KEY);
        let allVendors: Vendor[] = stored ? JSON.parse(stored) : [];
        const savedVendor = responseData.vendor;

        const newOrUpdatedVendor: Vendor = {
          id: String(savedVendor.id),
          name: savedVendor.name,
          company: savedVendor.company,
          contactPerson: savedVendor.contactPerson || "",
          phone: savedVendor.phone || "",
          email: savedVendor.email || "",
          location: savedVendor.location || "",
          specialization: savedVendor.specialization || "",
          type: savedVendor.type || "Agency",
          notes: savedVendor.notes || "",
          createdAt: savedVendor.createdAt,
          recruiterId: String(savedVendor.addedBy),
          recruiterName: currentUser?.name || "Recruiter"
        };

        if (editingId) {
          allVendors = allVendors.map(v => v.id === editingId ? newOrUpdatedVendor : v);
        } else {
          allVendors.push(newOrUpdatedVendor);
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allVendors));
        } catch (e) {
          console.error("Failed to save vendors to localStorage:", e);
        }
        
        setIsFormOpen(false);
        setEditingId(null);
        setSaveError("");
        setFormVendor({
          name: "", company: "", contactPerson: "", phone: "", 
          email: "", location: "", specialization: "", type: "Agency", notes: "", portalPassword: ""
        });
        loadVendors();
      } else if (res.status === 409 && responseData.code === "DUPLICATE_VENDOR") {
        // Show centered duplicate popup
        setDuplicatePopup({ show: true, existing: responseData.existingVendor, message: responseData.error });
      } else {
        setSaveError(responseData.error || "Failed to save vendor to database.");
      }
    } catch (err) {
      console.error("Error saving vendor:", err);
      setSaveError("Network error: Failed to save vendor to database.");
    }
  };

  // Trigger Edit Form
  const handleEditTrigger = (v: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormVendor(v);
    setEditingId(v.id);
    setIsFormOpen(true);
  };

  // Delete Vendor
  const handleDeleteVendor = async (v: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete vendor "${v.name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/vendors/${v.id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete vendor error:", err);
    }
    // Remove from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const arr = JSON.parse(stored).filter((lv: Vendor) => lv.id !== v.id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      } catch (e) {
        console.error("Failed to delete vendor from localStorage:", e);
      }
    }
    loadVendors();
  };

  // Vendor Mapping cache
  const getMappedCandidates = (vendorId: string) => {
    const mappings = JSON.parse(localStorage.getItem(MAPPINGS_KEY) || "{}");
    return candidates.filter(c => 
      String(c.vendorId) === String(vendorId) || 
      String(mappings[c.id || c._id]) === String(vendorId)
    );
  };

  // Filter Mapped Candidates by analytics dates
  const getFilteredCandidates = (vendorId: string) => {
    const base = getMappedCandidates(vendorId);
    
    return base.filter(c => {
      const cDate = new Date(c.createdAt || c.sourcingDate || Date.now());
      const today = new Date();
      today.setHours(0,0,0,0);

      if (analyticsFilter === "Today") {
        return cDate.toDateString() === today.toDateString();
      } else if (analyticsFilter === "7Days") {
        const diff = (today.getTime() - cDate.getTime()) / (1000 * 3600 * 24);
        return diff <= 7;
      } else if (analyticsFilter === "Monthly") {
        return cDate.getMonth() === today.getMonth() && cDate.getFullYear() === today.getFullYear();
      } else if (analyticsFilter === "Yearly") {
        return cDate.getFullYear() === today.getFullYear();
      } else if (analyticsFilter === "Custom" && customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        return cDate >= start && cDate <= end;
      }
      return true;
    });
  };

  // Advanced Vendor Analytics (Req 204 & 205)
  const getVendorMetrics = (vendorId: string) => {
    const referred = getFilteredCandidates(vendorId);
    
    let totalReferred = referred.length;
    let connected = 0;
    let interested = 0;
    let notConnected = 0;
    let selected = 0;
    let rejected = 0;
    let joined = 0;
    let notInterested = 0;
    let interviewScheduled = 0;
    let processToJoining = 0;
    let dropped = 0;

    referred.forEach((c: any) => {
      const status = (c.remarks || "New").toLowerCase();

      // Only count as "connected" if explicitly connected (not "not connected")
      if (status === "connected" || (status.includes("connected") && !status.includes("not"))) connected++;
      
      if (status.includes("interested") && !status.includes("not")) interested++;
      if (status.includes("not connected")) notConnected++;
      if (status.includes("not interested")) notInterested++;
      if (status.includes("rejected")) rejected++;
      if (status.includes("dropped")) dropped++;

      if (status.includes("interview") || status.includes("scheduled")) interviewScheduled++;
      
      if (status.includes("selected") || status.includes("joined") || status.includes("hired") || status.includes("process to joining")) {
        selected++;
      }

      if (status.includes("process to joining") || status.includes("joining") || status.includes("joined") || status.includes("hired")) {
        processToJoining++;
      }

      if (status.includes("joined") || status.includes("hired")) {
        joined++;
      }
    });

    // Ratios
    const selectionRatio = totalReferred > 0 ? Math.round((selected / totalReferred) * 100) : 0;
    const joiningRatio = totalReferred > 0 ? Math.round((joined / totalReferred) * 100) : 0;
    const rejectionRatio = totalReferred > 0 ? Math.round((rejected / totalReferred) * 100) : 0;
    const conversionRate = selected > 0 ? Math.round((joined / selected) * 100) : 0;

    // Productivity Score: meaningful — rewards real outcomes, 0 if no referrals
    const productivityScore = totalReferred === 0 ? 0 : Math.min(
      Math.round(
        (joined * 50 + selected * 25 + processToJoining * 20 + interviewScheduled * 10 + interested * 5 + connected * 2) / totalReferred
      ),
      100
    );

    return {
      totalReferred, connected, interested, notConnected, selected, rejected, 
      joined, notInterested, interviewScheduled, processToJoining, dropped,
      selectionRatio, joiningRatio, rejectionRatio, conversionRate, productivityScore
    };
  };


  // Search & Filter Logic on Grid list
  const filteredVendors = vendors.filter(v => {
    // 1. Tab & Organization scoping hierarchy filters:
    const myId = currentUser?.id || currentUser?.userId;
    if (activeTab === "my_vendors") {
      if (String(v.recruiterId) !== String(myId) && v.recruiterName?.toLowerCase() !== currentUser?.name?.toLowerCase()) {
        return false;
      }
    } else if (activeTab === "team_vendors") {
      // TL Scope: recruiters reporting to this TL
      if (currentUser?.role === "tl") {
        const myTeammateIds = teamMembers.filter(m => String(m.reportingTo) === String(myId)).map(m => String(m.id));
        if (!myTeammateIds.includes(String(v.recruiterId))) return false;
        if (selectedRecruiterId !== "all" && String(v.recruiterId) !== String(selectedRecruiterId)) return false;
      }
      
      // Manager & Boss Scope: TL team filter & Recruiter 1-1 filter
      if (currentUser?.role === "manager" || currentUser?.role === "boss") {
        if (selectedTlId !== "all") {
          const recruitersUnderTl = teamMembers.filter(m => String(m.reportingTo) === String(selectedTlId)).map(m => String(m.id));
          const allIds = [String(selectedTlId), ...recruitersUnderTl];
          if (!allIds.includes(String(v.recruiterId))) {
            return false;
          }
        }
        if (selectedRecruiterId !== "all") {
          if (String(v.recruiterId) !== String(selectedRecruiterId)) {
            return false;
          }
        }
      }
    }

    // 2. Search
    if (search) {
      const q = search.toLowerCase();
      const match = 
        v.name.toLowerCase().includes(q) ||
        v.company.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.specialization.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 3. Filters
    if (filterType !== "All" && v.type !== filterType) return false;
    if (filterSpec !== "All" && v.specialization !== filterSpec) return false;
    if (filterLoc !== "All" && v.location !== filterLoc) return false;

    return true;
  });

  // KPI calculations for all vendors
  const totalReferredAll = filteredVendors.reduce((acc, curr) => acc + getMappedCandidates(curr.id).length, 0);
  const bestPerforming = filteredVendors.reduce((best: any, v) => {
    const score = getVendorMetrics(v.id).productivityScore;
    if (!best || score > best.score) return { vendor: v, score };
    return best;
  }, null);

  const highestJoining = filteredVendors.reduce((highest: any, v) => {
    const joined = getVendorMetrics(v.id).joined;
    if (!highest || joined > highest.joined) return { vendor: v, joined };
    return highest;
  }, null);

  const uniqueSpecializations = Array.from(new Set(vendors.map(v => v.specialization))).filter(Boolean);
  const uniqueLocations = Array.from(new Set(vendors.map(v => v.location))).filter(Boolean);

  return (
    <div className="module-container" style={{ padding: "1rem", background: "#f8fafc", height: "100%", overflowY: "auto" }}>
      {/* Top Header */}
      <div className="flex-between mb-medium" style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ minWidth: "220px", flex: "1 1 0%" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>My Vendor </span>
            <span style={{ color: "#2563eb" }}>Network</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Add agencies, coordinate candidate mappings, and analyze outcome metrics.</p>
        </div>

        {/* Status Capsule Toggle - Placed upper middle next to title, centered horizontally */}
        {(currentUser?.role === "tl" || currentUser?.role === "manager" || currentUser?.role === "boss") && (
          <div style={{ 
            display: "flex", 
            background: "#f1f5f9", 
            padding: "4px", 
            borderRadius: "14px", 
            border: "1px solid #cbd5e1", 
            gap: "2px", 
            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            zIndex: 10
          }}>
             <button 
               onClick={() => setActiveTab("my_vendors")}
               style={{ 
                 padding: "8px 20px", 
                 borderRadius: "10px", 
                 border: "none", 
                 background: activeTab === "my_vendors" ? "white" : "transparent",
                 color: activeTab === "my_vendors" ? "#2563eb" : "#64748b",
                 fontWeight: 800,
                 fontSize: "0.8rem",
                 cursor: "pointer",
                 boxShadow: activeTab === "my_vendors" ? "0 4px 12px rgba(37, 99, 235, 0.08)" : "none",
                 transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                 whiteSpace: "nowrap"
               }}
             >
               My Vendors
             </button>
             <button 
               onClick={() => setActiveTab("team_vendors")}
               style={{ 
                 padding: "8px 20px", 
                 borderRadius: "10px", 
                 border: "none", 
                 background: activeTab === "team_vendors" ? "white" : "transparent",
                 color: activeTab === "team_vendors" ? "#2563eb" : "#64748b",
                 fontWeight: 800,
                 fontSize: "0.8rem",
                 cursor: "pointer",
                 boxShadow: activeTab === "team_vendors" ? "0 4px 12px rgba(37, 99, 235, 0.08)" : "none",
                 transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                 whiteSpace: "nowrap"
               }}
             >
               Team Vendors
             </button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", minWidth: "150px", flex: "1 1 0%" }}>
          <button 
            className="btn-primary" 
            onClick={() => {
              setEditingId(null);
              setFormVendor({
                name: "", company: "", contactPerson: "", phone: "", 
                email: "", location: "", specialization: "", type: "Agency", notes: "", portalPassword: ""
              });
              setIsFormOpen(true);
            }}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", background: "#2563eb", fontWeight: 700, fontSize: "0.8rem", border: "none", color: "white", cursor: "pointer" }}
          >
            <LucidePlus size={14} /> Add Vendor Node
          </button>
        </div>
      </div>

      {/* Network KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
         <div style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Total Vendors Linked</span>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: "2px 0" }}>{filteredVendors.length}</h3>
            <span style={{ fontSize: "0.65rem", color: "#2563eb", fontWeight: 700 }}>Your active agency roster</span>
         </div>
         <div style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Cumulative Referrals</span>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#7c3aed", margin: "2px 0" }}>{totalReferredAll}</h3>
            <span style={{ fontSize: "0.65rem", color: "#7c3aed", fontWeight: 700 }}>Candidates processed till date</span>
         </div>
         <div style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Best Vendor (Score)</span>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#10b981", margin: "4px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {bestPerforming?.vendor ? `${bestPerforming.vendor.name} (${bestPerforming.score} pts)` : "N/A"}
            </h3>
            <span style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: 700 }}>Highest efficiency node</span>
         </div>
         <div style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Highest Joining Vendor</span>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#f59e0b", margin: "4px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {highestJoining?.vendor ? `${highestJoining.vendor.name} (${highestJoining.joined} Joined)` : "N/A"}
            </h3>
            <span style={{ fontSize: "0.65rem", color: "#f59e0b", fontWeight: 700 }}>Max onboarding output</span>
         </div>
      </div>

      {/* Search and Filters Bar */}
      <div style={{ background: "white", padding: "0.5rem 0.75rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>
         <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <LucideSearch size={14} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "9px" }} />
            <input 
               type="text" 
               placeholder="Search by vendor, company..." 
               value={search} 
               onChange={e => setSearch(e.target.value)} 
               style={{ width: "100%", padding: "6px 10px 6px 30px", border: "1px solid #cbd5e1", borderRadius: "8px", outline: "none", fontSize: "0.8rem" }} 
            />
         </div>

         {/* Recruiter filter for TL */}
         {activeTab === "team_vendors" && currentUser?.role === "tl" && (
           <select
             value={selectedRecruiterId}
             onChange={e => setSelectedRecruiterId(e.target.value)}
             style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.8rem", outline: "none", cursor: "pointer", fontWeight: 600, color: "#475569" }}
           >
             <option value="all">All Recruiters</option>
             {teamMembers.filter(m => m.role === "recruiter" && String(m.reportingTo) === String(currentUser?.id || currentUser?.userId)).map(r => (
               <option key={r.id} value={r.id}>{r.name}</option>
             ))}
           </select>
         )}

         {/* TL and Recruiter Scoping Dropdown Selectors inside the Search and Filters Bar */}
         {activeTab === "team_vendors" && (currentUser?.role === "manager" || currentUser?.role === "boss") && (
           <div style={{ display: "flex", gap: "6px" }}>
             <select 
               value={selectedTlId} 
               onChange={e => {
                 setSelectedTlId(e.target.value);
                 setSelectedRecruiterId("all");
               }} 
               style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.8rem", outline: "none", cursor: "pointer", fontWeight: 600, color: "#475569" }}
             >
                <option value="all">All TLs</option>
                {teamMembers.filter(m => m.role === "tl").map((tl) => (
                  <option key={tl.id} value={tl.id}>{tl.name}</option>
                ))}
             </select>

             <select 
               value={selectedRecruiterId} 
               onChange={e => setSelectedRecruiterId(e.target.value)} 
               style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.8rem", outline: "none", cursor: "pointer", fontWeight: 600, color: "#475569" }}
             >
                <option value="all">All Recruiters</option>
                {(() => {
                  let filteredRecs = teamMembers.filter(m => m.role === "recruiter");
                  if (selectedTlId !== "all") {
                    filteredRecs = filteredRecs.filter(m => String(m.reportingTo) === String(selectedTlId));
                  }
                  return filteredRecs.map((rec) => (
                    <option key={rec.id} value={rec.id}>{rec.name}</option>
                  ));
                })()}
             </select>
           </div>
         )}

         <div style={{ display: "flex", gap: "6px" }}>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.8rem", outline: "none", cursor: "pointer" }}>
               <option value="All">All Types</option>
               <option value="Agency">Agency</option>
               <option value="Individual">Individual</option>
               <option value="Portal">Portal</option>
               <option value="Referral">Referral</option>
            </select>

            <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)} style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.8rem", outline: "none", cursor: "pointer" }}>
               <option value="All">All Specializations</option>
               {uniqueSpecializations.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>

            <select value={filterLoc} onChange={e => setFilterLoc(e.target.value)} style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.8rem", outline: "none", cursor: "pointer" }}>
               <option value="All">All Locations</option>
               {uniqueLocations.map((l, i) => <option key={i} value={l}>{l}</option>)}
            </select>
         </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
         <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <LucideUsers size={48} style={{ opacity: 0.1, margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>No Vendors Enlisted</h3>
            <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "6px 0 16px" }}>Start building your collaborative vendor pipeline by enlisting a partner.</p>
            <button 
              className="btn-primary" 
              onClick={() => setIsFormOpen(true)}
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "0.8rem", background: "#2563eb", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}
            >
              Register New Vendor
            </button>
         </div>
      ) : (
         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
            {filteredVendors.map(v => {
              const metrics = getVendorMetrics(v.id);
              return (
                <motion.div 
                  key={v.id}
                  whileHover={{ y: -2, boxShadow: "0 6px 18px -4px rgba(0,0,0,0.06)" }}
                  onClick={() => setSelectedVendor(v)}
                  style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "0.75rem 1rem", cursor: "pointer", transition: "all 0.2s" }}
                >
                  <div className="flex-between" style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <span style={{ fontSize: "0.6rem", background: "#f3e8ff", color: "#7e22ce", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                        {v.type.toUpperCase()}
                     </span>
                     <div style={{ display: "flex", gap: "4px" }}>
                       <button
                         onClick={(e) => handleEditTrigger(v, e)}
                         style={{ border: "none", background: "#eff6ff", color: "#2563eb", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer" }}
                       >
                         Edit
                       </button>
                       {currentUser?.role !== "recruiter" && (String(v.recruiterId) === String(currentUser?.id || currentUser?.userId) || v.recruiterName?.toLowerCase() === currentUser?.name?.toLowerCase()) && (
                         <button
                           onClick={(e) => handleDeleteVendor(v, e)}
                           style={{ border: "none", background: "#fef2f2", color: "#dc2626", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer" }}
                         >
                           Delete
                         </button>
                       )}
                     </div>
                  </div>

                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>{v.name}</h4>
                  <p style={{ margin: "1px 0 8px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}>{v.company}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.75rem", color: "#475569", marginBottom: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                     <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><LucideBriefcase size={12} color="#64748b" /> {v.specialization || "Generalist"}</span>
                     <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><LucideMapPin size={12} color="#64748b" /> {v.location || "N/A"}</span>
                     <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><LucidePhone size={12} color="#64748b" /> {v.phone}</span>
                  </div>

                  {/* Core Conversion Ratios */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", textAlign: "center" }}>
                     <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.6rem", color: "#64748b", display: "block" }}>Referrals</span>
                        <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>{metrics.totalReferred}</strong>
                     </div>
                     <div style={{ background: "#f0fdf4", padding: "6px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.6rem", color: "#16a34a", display: "block" }}>Joined</span>
                        <strong style={{ fontSize: "0.85rem", color: "#16a34a" }}>{metrics.joined}</strong>
                     </div>
                     <div style={{ background: "#eff6ff", padding: "6px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.6rem", color: "#2563eb", display: "block" }}>Score</span>
                        <strong style={{ fontSize: "0.85rem", color: "#2563eb" }}>{metrics.productivityScore}</strong>
                     </div>
                  </div>
                </motion.div>
              );
            })}
         </div>
      )}

      {/* Add / Edit Vendor Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
             <motion.div 
               initial={{ scale: 0.97, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.97, opacity: 0 }}
               style={{ background: "white", width: "420px", borderRadius: "16px", padding: "1.25rem 1.5rem", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)" }}
             >
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.75rem", color: "#0f172a" }}>{editingId ? "Edit Vendor Node" : "Register New Vendor Agency"}</h3>
                <form onSubmit={handleSaveVendor} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div className="input-group">
                         <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "2px" }}>Vendor Name *</label>
                         <input type="text" value={formVendor.name} onChange={e => setFormVendor({...formVendor, name: e.target.value})} required style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }} />
                      </div>
                      <div className="input-group">
                         <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "2px" }}>Company Name *</label>
                         <input type="text" value={formVendor.company} onChange={e => setFormVendor({...formVendor, company: e.target.value})} required style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }} />
                      </div>
                   </div>

                   <div className="input-group">
                      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "2px" }}>Contact Person</label>
                      <input type="text" value={formVendor.contactPerson} onChange={e => setFormVendor({...formVendor, contactPerson: e.target.value})} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }} />
                   </div>

                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div className="input-group">
                         <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "2px" }}>Phone Number</label>
                         <input type="text" value={formVendor.phone} onChange={e => setFormVendor({...formVendor, phone: e.target.value})} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }} />
                      </div>
                      <div className="input-group">
                         <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "2px" }}>Email ID</label>
                         <input type="email" value={formVendor.email} onChange={e => setFormVendor({...formVendor, email: e.target.value})} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }} />
                      </div>
                   </div>

                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div className="input-group">
                         <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "2px" }}>Location</label>
                         <input type="text" value={formVendor.location} onChange={e => setFormVendor({...formVendor, location: e.target.value})} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }} />
                      </div>
                      <div className="input-group">
                         <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "2px" }}>Vendor Type</label>
                         <select value={formVendor.type} onChange={e => setFormVendor({...formVendor, type: e.target.value})} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none", cursor: "pointer" }}>
                            <option value="Agency">Agency</option>
                            <option value="Individual">Individual</option>
                            <option value="Portal">Portal</option>
                            <option value="Referral">Referral</option>
                         </select>
                      </div>
                   </div>

                   <div className="input-group">
                      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "2px" }}>Specialization</label>
                      <input type="text" placeholder="e.g. IT, Sales, BPO" value={formVendor.specialization} onChange={e => setFormVendor({...formVendor, specialization: e.target.value})} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }} />
                   </div>

                   <div className="input-group">
                      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "2px" }}>Remarks/Notes</label>
                      <textarea value={formVendor.notes} onChange={e => setFormVendor({...formVendor, notes: e.target.value})} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "50px", fontSize: "0.8rem", outline: "none", resize: "vertical" }} />
                   </div>

                   <div className="input-group">
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "2px" }}>
                            Portal Password *
                        </label>
                        <input 
                            type="password" 
                            placeholder="Set vendor portal login password" 
                            value={formVendor.portalPassword || ""} 
                            onChange={e => setFormVendor({...formVendor, portalPassword: e.target.value})} 
                            required
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }} 
                        />
                        <span style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: "2px", display: "block" }}>Vendor can log into Vendor Portal at /vendor-login using their email + this password</span>
                    </div>

                   {/* Save Error inline */}
                   {saveError && (
                     <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", color: "#dc2626", padding: "8px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600 }}>
                       ⚠️ {saveError}
                     </div>
                   )}

                   <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                      <button type="button" onClick={() => { setIsFormOpen(false); setSaveError(""); }} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Cancel</button>
                      <button type="submit" style={{ padding: "6px 16px", borderRadius: "6px", background: "#2563eb", color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}>Save Agency</button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Duplicate Vendor Popup — centered full screen */}
      {duplicatePopup.show && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}>
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ background: "white", borderRadius: "20px", padding: "32px", width: "420px", maxWidth: "94vw", boxShadow: "0 24px 60px -12px rgba(0,0,0,0.3)", textAlign: "center" }}
          >
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#fef2f2", border: "2px solid #fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "1.6rem" }}>⚠️</div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Duplicate Vendor Found!</h3>
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 20px", lineHeight: 1.5 }}>
              {duplicatePopup.message}
            </p>
            {duplicatePopup.existing && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px 16px", textAlign: "left", marginBottom: "20px" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>Existing Vendor Details</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{duplicatePopup.existing.name}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{duplicatePopup.existing.company}</div>
                {duplicatePopup.existing.email && <div style={{ fontSize: "0.75rem", color: "#2563eb", marginTop: "4px" }}>📧 {duplicatePopup.existing.email}</div>}
                {duplicatePopup.existing.phone && <div style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "2px" }}>📞 {duplicatePopup.existing.phone}</div>}
              </div>
            )}
            <button
              onClick={() => setDuplicatePopup({ show: false })}
              style={{ width: "100%", padding: "11px", borderRadius: "10px", border: "none", background: "#2563eb", color: "white", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}
            >
              Got It
            </button>
          </motion.div>
        </div>
      )}

      {/* Vendor Deep Profile Drawer */}
      <AnimatePresence>
        {selectedVendor && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "flex-end" }}>
             {/* Backdrop */}
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedVendor(null)}
               style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", backdropFilter: "blur(1px)" }}
             />

             {/* Slide drawer */}
             <motion.div
               initial={{ x: "100%" }}
               animate={{ x: 0 }}
               exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 30, stiffness: 220 }}
               style={{ position: "relative", width: "480px", height: "100%", background: "white", boxShadow: "-8px 0 40px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", zIndex: 10000 }}
             >
                {/* Header */}
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
                   <div>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{selectedVendor.name}</h3>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{selectedVendor.company}</span>
                   </div>
                   <button 
                     onClick={() => setSelectedVendor(null)} 
                     style={{ border: "1px solid #cbd5e1", background: "white", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "#64748b", fontWeight: 700 }}
                   >
                     ×
                   </button>
                </div>

                {/* Drawer scroll content */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
                   {/* Info Grid */}
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "1.25rem" }}>
                      <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                         <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block" }}>Contact Person</span>
                         <strong style={{ color: "#334155", fontSize: "0.8rem" }}>{selectedVendor.contactPerson || "N/A"}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                         <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block" }}>Type / Specialization</span>
                         <strong style={{ color: "#334155", fontSize: "0.8rem" }}>{selectedVendor.type} / {selectedVendor.specialization || "General"}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                         <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block" }}>Phone Call Node</span>
                         <strong style={{ color: "#334155", fontSize: "0.8rem" }}>{selectedVendor.phone}</strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                         <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block" }}>Email Channel</span>
                         <strong style={{ color: "#334155", fontSize: "0.8rem" }}>{selectedVendor.email || "N/A"}</strong>
                      </div>
                   </div>

                    {/* Vendor Portal Access Link */}
                    {selectedVendor.email && (
                      <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#eff6ff", border: "1px solid #bfdbfe", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1d4ed8", display: "block" }}>🔗 Vendor Portal Access</span>
                          <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Login: {selectedVendor.email}</span>
                        </div>
                        <a href="/vendor-login" target="_blank" rel="noopener noreferrer" style={{ padding: "5px 12px", borderRadius: "7px", background: "#2563eb", color: "white", fontSize: "0.72rem", fontWeight: 700, textDecoration: "none" }}>Open Portal →</a>
                      </div>
                    )}

                   {/* Date / Timeline analytics Filter */}
                   <div style={{ background: "#f8fafc", padding: "0.5rem 0.75rem", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569" }}><LucideFilter size={14} style={{ verticalAlign: "middle", marginRight: "2px" }} /> Timeline:</span>
                      <select value={analyticsFilter} onChange={e => setAnalyticsFilter(e.target.value as any)} style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem", outline: "none" }}>
                         <option value="Today">Today</option>
                         <option value="7Days">Last 7 Days</option>
                         <option value="Monthly">This Month</option>
                         <option value="Yearly">This Year</option>
                         <option value="Custom">Custom Date Range</option>
                      </select>

                      {analyticsFilter === "Custom" && (
                        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                           <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ padding: "2px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.7rem" }} />
                           <span style={{ fontSize: "0.65rem", color: "#64748b" }}>to</span>
                           <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ padding: "2px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.7rem" }} />
                        </div>
                      )}
                   </div>

                   {/* Deep Vendor Analytics Metrics Grid */}
                   {(() => {
                     const m = getVendorMetrics(selectedVendor.id);
                     return (
                       <>
                          <div style={{ marginBottom: "1.25rem" }}>
                             <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px", marginTop: 0 }}>Conversion & Quality Metrics</h4>
                             <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                                <div style={{ padding: "0.6rem", background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", borderRadius: "10px", border: "1px solid #bfdbfe", textAlign: "center" }}>
                                   <span style={{ fontSize: "0.6rem", color: "#1e3a8a", fontWeight: 700 }}>Conversion Rate</span>
                                   <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1e3a8a", margin: "2px 0" }}>{m.conversionRate}%</h3>
                                   <span style={{ fontSize: "0.55rem", color: "#1e3a8a", display: "block" }}>Joined / Selected</span>
                                </div>
                                <div style={{ padding: "0.6rem", background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", borderRadius: "10px", border: "1px solid #bbf7d0", textAlign: "center" }}>
                                   <span style={{ fontSize: "0.6rem", color: "#14532d", fontWeight: 700 }}>Joining Ratio</span>
                                   <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#14532d", margin: "2px 0" }}>{m.joiningRatio}%</h3>
                                   <span style={{ fontSize: "0.55rem", color: "#14532d", display: "block" }}>Joined / Referred</span>
                                </div>
                                <div style={{ padding: "0.6rem", background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)", borderRadius: "10px", border: "1px solid #fbcfe8", textAlign: "center" }}>
                                   <span style={{ fontSize: "0.6rem", color: "#9d174d", fontWeight: 700 }}>Rejection Ratio</span>
                                   <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#9d174d", margin: "2px 0" }}>{m.rejectionRatio}%</h3>
                                   <span style={{ fontSize: "0.55rem", color: "#9d174d", display: "block" }}>Rejected / Referred</span>
                                </div>
                             </div>
                          </div>

                          {/* Status Count Logic Metrics */}
                          <div style={{ marginBottom: "1.25rem" }}>
                             <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px", marginTop: 0 }}>Candidate Funnel Breakdown</h4>
                             <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", background: "#f8fafc", padding: "0.75rem", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                <div style={{ borderRight: "1px solid #e2e8f0", paddingRight: "4px" }}>
                                   <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Total Referred</span>
                                   <strong style={{ fontSize: "1rem", color: "#0f172a" }}>{m.totalReferred}</strong>
                                </div>
                                <div style={{ borderRight: "1px solid #e2e8f0", paddingRight: "4px" }}>
                                   <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Connected</span>
                                   <strong style={{ fontSize: "1rem", color: "#2563eb" }}>{m.connected}</strong>
                                </div>
                                <div style={{ borderRight: "1px solid #e2e8f0", paddingRight: "4px" }}>
                                   <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Not Connected</span>
                                   <strong style={{ fontSize: "1rem", color: "#64748b" }}>{m.notConnected}</strong>
                                </div>
                                <div>
                                   <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Interested</span>
                                   <strong style={{ fontSize: "1rem", color: "#2563eb" }}>{m.interested}</strong>
                                </div>
                             </div>

                             <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", background: "#f8fafc", padding: "0.75rem", borderRadius: "12px", border: "1px solid #f1f5f9", marginTop: "6px" }}>
                                <div style={{ borderRight: "1px solid #e2e8f0", paddingRight: "4px" }}>
                                   <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Selected</span>
                                   <strong style={{ fontSize: "1rem", color: "#10b981" }}>{m.selected}</strong>
                                </div>
                                <div style={{ borderRight: "1px solid #e2e8f0", paddingRight: "4px" }}>
                                   <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Interviewed</span>
                                   <strong style={{ fontSize: "1rem", color: "#f59e0b" }}>{m.interviewScheduled}</strong>
                                </div>
                                <div style={{ borderRight: "1px solid #e2e8f0", paddingRight: "4px" }}>
                                   <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Rejected</span>
                                   <strong style={{ fontSize: "1rem", color: "#ef4444" }}>{m.rejected}</strong>
                                </div>
                                <div>
                                   <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block" }}>Joined</span>
                                   <strong style={{ fontSize: "1rem", color: "#10b981" }}>{m.joined}</strong>
                                </div>
                             </div>
                          </div>

                          {/* Candidate List */}
                          <div>
                             <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px", marginTop: 0 }}>Candidate Logs ({getFilteredCandidates(selectedVendor.id).length})</h4>
                             <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                                {getFilteredCandidates(selectedVendor.id).length === 0 ? (
                                  <div style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8", fontSize: "0.8rem" }}>No candidates referred in this range.</div>
                                ) : (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                     {getFilteredCandidates(selectedVendor.id).map((c: any) => (
                                       <div key={c.id || c._id} style={{ padding: "8px 10px", border: "1px solid #f1f5f9", borderRadius: "8px", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                          <div>
                                             <strong style={{ fontSize: "0.8rem", color: "#1e293b", display: "block" }}>{c.name}</strong>
                                             <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{c.jobRole} | Call: {c.phone}</span>
                                          </div>
                                          <span className={`status-pill ${(c.remarks || "New").toLowerCase().replace(" ", "-")}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                                             {c.remarks || "New"}
                                          </span>
                                       </div>
                                     ))}
                                  </div>
                                )}
                             </div>
                          </div>
                       </>
                     );
                   })()}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
