import React, { useState, useEffect } from "react";
import { 
  LucideSearch, LucideFilter, LucideTrendingUp, LucideUsers, 
  LucideBriefcase, LucideCalendar, LucideUserCheck, LucideTag,
  LucideFileText, LucideEye, LucideXCircle, LucideDatabase,
  LucideShare2, LucideArrowRight, LucideChevronLeft, LucideCheck,
  LucideMail, LucideClock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "givyansh_lead_data_v1";
const FORWARD_STORAGE_KEY = "givyansh_forwarded_leads_v1";

export default function LeadDataView({ candidates, currentUser, onViewProfile }: { candidates: any[], currentUser: any, onViewProfile?: (c: any) => void }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [forwardedBatches, setForwardedBatches] = useState<any[]>([]);
  const [sentBatches, setSentBatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"my_leads" | "forwarded_leads" | "forwarded_history">("my_leads");
  
  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  
  // Selection Drawer
  const [selectedLead, setSelectedLead] = useState<any>(null);
  
  // Opened Batch Detail
  const [openedBatch, setOpenedBatch] = useState<any>(null);

  // Lead Forwarding Modal State
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardStep, setForwardStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [leadsCountToForward, setLeadsCountToForward] = useState<string>("");
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  
  // Recruiter Directories
  const [teammates, setTeammates] = useState<any[]>([]);
  const [allRecruiters, setAllRecruiters] = useState<any[]>([]);
  const [showAllCompany, setShowAllCompany] = useState(false);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);

  // Sync Personal Leads, Received Forwarded Leads, and Forwarded History
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const myId = currentUser?.id || currentUser?.userId;
    const myName = currentUser?.name?.toLowerCase();
    
    // Filter candidates to recruiter's personal leads
    const personalCandidates = candidates.filter(c => 
      !myId ||
      c.addedBy === myId ||
      c.assignedTo === myId ||
      (c.recruiterName && c.recruiterName.toLowerCase() === myName)
    );
    
    // Map personal candidates to lead info
    const matchedLeads = personalCandidates
      .filter(c => data[c.id || c._id])
      .map(c => ({
        ...c,
        leadInfo: data[c.id || c._id]
      }));
    setLeads(matchedLeads);
    
    // Load forwarded batches
    const rawBatches = JSON.parse(localStorage.getItem(FORWARD_STORAGE_KEY) || "[]");
    
    // Filter batches where currentUser is a recipient (received)
    const myReceived = rawBatches.filter((b: any) => b.toIds.includes(myId));
    setForwardedBatches(myReceived);

    // Filter batches where currentUser is the sender (sent history)
    const mySent = rawBatches.filter((b: any) => b.fromId === myId);
    setSentBatches(mySent);
  }, [candidates, currentUser]);

  // Fetch team recruiters
  const fetchTeammates = async () => {
    setLoadingRecruiters(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        const myId = currentUser?.id || currentUser?.userId;
        const recs = data.filter((m: any) => m.role === "recruiter" && m.id !== myId);
        setTeammates(recs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecruiters(false);
    }
  };

  // Fetch all company recruiters
  const fetchAllCompanyRecruiters = async () => {
    setLoadingRecruiters(true);
    try {
      const res = await fetch("/api/team?allCompany=true");
      if (res.ok) {
        const data = await res.json();
        const myId = currentUser?.id || currentUser?.userId;
        const recs = data.filter((m: any) => m.role === "recruiter" && m.id !== myId);
        setAllRecruiters(recs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecruiters(false);
    }
  };

  // Lead Analytics (My Leads / Personal)
  const totalLeads = leads.length;
  const categoriesCount = leads.reduce((acc: any, curr: any) => {
    curr.leadInfo?.categories?.forEach((cat: string) => {
      acc[cat] = (acc[cat] || 0) + 1;
    });
    return acc;
  }, {});
  
  const topCategory = Object.keys(categoriesCount).length > 0 
    ? Object.keys(categoriesCount).reduce((a, b) => categoriesCount[a] > categoriesCount[b] ? a : b) 
    : "N/A";
    
  const thisMonthCount = leads.filter(l => {
    if (!l.leadInfo?.movedAt) return false;
    return new Date(l.leadInfo.movedAt).getMonth() === new Date().getMonth();
  }).length;

  // Unique categories in recruiter's leads list
  const uniqueCats = Array.from(new Set(leads.flatMap(l => l.leadInfo?.categories || [])));

  // Filtered Leads (for My Leads list)
  const filteredLeads = leads.filter(l => {
    if (filterCat !== "All" && !l.leadInfo?.categories?.includes(filterCat)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.name?.toLowerCase().includes(q) && 
          !l.phone?.includes(q) && 
          !l.email?.toLowerCase().includes(q) && 
          !l.leadInfo?.remarks?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Calculate leads available for forwarding in selected categories
  const matchingForwardableLeads = leads.filter(l => 
    l.leadInfo?.categories?.some((c: string) => selectedCategories.includes(c))
  );
  const totalForwardableMatching = matchingForwardableLeads.length;

  // Process Forwarding Submission
  const handleForwardLeads = () => {
    if (selectedCategories.length === 0) {
      return alert("Please select at least one category to forward.");
    }
    if (selectedRecipients.length === 0) {
      return alert("Please select at least one recruiter recipient.");
    }
    
    const numToForward = leadsCountToForward === "" 
      ? totalForwardableMatching 
      : Math.min(totalForwardableMatching, parseInt(leadsCountToForward) || 1);
      
    if (numToForward <= 0) {
      return alert("Number of leads must be greater than 0.");
    }

    const leadsToForward = matchingForwardableLeads.slice(0, numToForward);
    const forwardCandidateIds = leadsToForward.map(l => l.id || l._id);

    // Resolve recipient names dynamically
    const recipientNames = selectedRecipients.map(id => {
      const rec = (showAllCompany ? allRecruiters : teammates).find(r => r.id === id);
      return rec ? rec.name : `Recruiter #${id}`;
    });

    const rawBatches = JSON.parse(localStorage.getItem(FORWARD_STORAGE_KEY) || "[]");
    const newBatch = {
      id: "batch_" + Date.now(),
      fromId: currentUser?.id || currentUser?.userId,
      fromName: currentUser?.name || "A Recruiter",
      toIds: selectedRecipients,
      toNames: recipientNames,
      categories: selectedCategories,
      count: numToForward,
      date: new Date().toISOString(),
      candidateIds: forwardCandidateIds
    };

    localStorage.setItem(FORWARD_STORAGE_KEY, JSON.stringify([...rawBatches, newBatch]));

    // Award +10 points for forwarding a lead batch of minimum 20 candidates
    if (numToForward >= 20) {
      fetch("/api/gamification/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "lead_forwarded",
          details: `Forwarded batch of ${numToForward} leads`,
          points: 10,
          uniqueKey: `lead_forward_${newBatch.id}`
        })
      }).catch(err => console.error("Failed to award points for lead forwarding:", err));
    }

    // Reset Modal
    setIsForwardModalOpen(false);
    setForwardStep(1);
    setSelectedCategories([]);
    setLeadsCountToForward("");
    setSelectedRecipients([]);
    setShowAllCompany(false);

    // Dynamic state update
    const myId = currentUser?.id || currentUser?.userId;
    setForwardedBatches([...rawBatches, newBatch].filter((b: any) => b.toIds.includes(myId)));
    setSentBatches([...rawBatches, newBatch].filter((b: any) => b.fromId === myId));
    alert(`Success: Forwarded ${numToForward} leads to selected recruiters.`);
  };

  // Handle tracking read/view status when batch is opened
  const handleOpenBatch = (batch: any) => {
    setOpenedBatch(batch);
    const myId = currentUser?.id || currentUser?.userId;
    if (myId && batch.toIds?.includes(myId)) {
      const currentViews = batch.viewedBy || [];
      if (!currentViews.includes(myId)) {
        const rawBatches = JSON.parse(localStorage.getItem(FORWARD_STORAGE_KEY) || "[]");
        const updatedBatches = rawBatches.map((b: any) => {
          if (b.id === batch.id) {
            return {
              ...b,
              viewedBy: [...(b.viewedBy || []), myId]
            };
          }
          return b;
        });
        localStorage.setItem(FORWARD_STORAGE_KEY, JSON.stringify(updatedBatches));
        
        // Sync local states
        setForwardedBatches(updatedBatches.filter((b: any) => b.toIds.includes(myId)));
        setSentBatches(updatedBatches.filter((b: any) => b.fromId === myId));
      }
    }
  };

  // Get live candidate details for a forwarded batch
  const getBatchCandidates = (batch: any) => {
    if (!batch || !batch.candidateIds) return [];
    const allLeadData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    
    return candidates
      .filter(c => batch.candidateIds.includes(c.id || c._id))
      .map(c => ({
        ...c,
        leadInfo: allLeadData[c.id || c._id] || { 
          categories: batch.categories, 
          remarks: `Forwarded by ${batch.fromName}`, 
          movedBy: batch.fromName, 
          movedAt: batch.date 
        }
      }));
  };

  return (
    <div className="module-container" style={{ position: "relative", height: "100%", overflowY: "auto", background: "#f8fafc", padding: "1.25rem", fontFamily: "'Outfit', 'Inter', sans-serif", userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" }}>
      
      {/* Header section with compact design & dynamic status toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ minWidth: "220px", flex: "1 1 0%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
              <span style={{ color: "#0f172a" }}>Lead Data </span>
              <span style={{ color: "#2563eb" }}>Pipeline</span>
            </h2>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "4px 0 0 0", fontWeight: 500, maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Future hiring pool & candidate interest tracking system.</p>
        </div>

        {/* Status Capsule Toggle - Placed upper middle next to title, centered horizontally */}
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
             onClick={() => { setActiveTab("my_leads"); setOpenedBatch(null); }}
             style={{ 
               padding: "8px 20px", 
               borderRadius: "10px", 
               border: "none", 
               background: activeTab === "my_leads" ? "white" : "transparent",
               color: activeTab === "my_leads" ? "#2563eb" : "#64748b",
               fontWeight: 800,
               fontSize: "0.8rem",
               cursor: "pointer",
               boxShadow: activeTab === "my_leads" ? "0 4px 12px rgba(37, 99, 235, 0.08)" : "none",
               transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
               whiteSpace: "nowrap"
             }}
           >
             My Leads
           </button>
           <button 
             onClick={() => { setActiveTab("forwarded_leads"); setOpenedBatch(null); }}
             style={{ 
               padding: "8px 20px", 
               borderRadius: "10px", 
               border: "none", 
               background: activeTab === "forwarded_leads" ? "white" : "transparent",
               color: activeTab === "forwarded_leads" ? "#2563eb" : "#64748b",
               fontWeight: 800,
               fontSize: "0.8rem",
               cursor: "pointer",
               boxShadow: activeTab === "forwarded_leads" ? "0 4px 12px rgba(37, 99, 235, 0.08)" : "none",
               transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
               whiteSpace: "nowrap"
             }}
           >
             Forwarded Leads
           </button>
           <button 
             onClick={() => { setActiveTab("forwarded_history"); setOpenedBatch(null); }}
             style={{ 
               padding: "8px 20px", 
               borderRadius: "10px", 
               border: "none", 
               background: activeTab === "forwarded_history" ? "white" : "transparent",
               color: activeTab === "forwarded_history" ? "#2563eb" : "#64748b",
               fontWeight: 800,
               fontSize: "0.8rem",
               cursor: "pointer",
               boxShadow: activeTab === "forwarded_history" ? "0 4px 12px rgba(37, 99, 235, 0.08)" : "none",
               transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
               whiteSpace: "nowrap"
             }}
           >
             Forward History
           </button>
        </div>

        <div style={{ flex: "1 1 0%", minWidth: "100px" }} />
      </div>

      {/* Analytics Stats */}
      {activeTab === "my_leads" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
           <div style={{ background: "white", padding: "1rem", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideDatabase size={18} /></div>
              <div>
                 <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>My Personal Leads</div>
                 <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{totalLeads}</div>
              </div>
           </div>
           <div style={{ background: "white", padding: "1rem", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f5f3ff", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideTrendingUp size={18} /></div>
              <div>
                 <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Top Interest Segment</div>
                 <div style={{ fontSize: "1rem", fontWeight: 800, color: "#7c3aed", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px", lineHeight: 1.2 }}>{topCategory}</div>
              </div>
           </div>
           <div style={{ background: "white", padding: "1rem", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideUserCheck size={18} /></div>
              <div>
                 <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Acquired This Month</div>
                 <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#10b981", lineHeight: 1.2 }}>{thisMonthCount}</div>
              </div>
           </div>
        </div>
      )}

      {activeTab === "forwarded_leads" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
           <div style={{ background: "white", padding: "1rem", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f0fdf4", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideShare2 size={18} /></div>
              <div>
                 <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Received Batches</div>
                 <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#15803d", lineHeight: 1.2 }}>{forwardedBatches.length}</div>
              </div>
           </div>
           <div style={{ background: "white", padding: "1rem", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fdf2f8", color: "#db2777", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideUsers size={18} /></div>
              <div>
                 <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Shared Leads</div>
                 <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#db2777", lineHeight: 1.2 }}>
                   {forwardedBatches.reduce((sum, b) => sum + (b.count || 0), 0)}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === "forwarded_history" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
           <div style={{ background: "white", padding: "1rem", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#eff6ff", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideShare2 size={18} /></div>
              <div>
                 <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Batches Sent</div>
                 <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1d4ed8", lineHeight: 1.2 }}>{sentBatches.length}</div>
              </div>
           </div>
           <div style={{ background: "white", padding: "1rem", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fff7ed", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideUsers size={18} /></div>
              <div>
                 <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Sent Leads</div>
                 <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ea580c", lineHeight: 1.2 }}>
                   {sentBatches.reduce((sum, b) => sum + (b.count || 0), 0)}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MY LEADS TAB VIEW */}
      {activeTab === "my_leads" && (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)", padding: "1rem" }}>
           
           {/* Filtering & Action Bar */}
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "10px", flex: 1, minWidth: "280px" }}>
                 <div style={{ flex: 1, position: "relative" }}>
                    <LucideSearch size={14} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "9px" }} />
                    <input 
                      type="text" 
                      placeholder="Search lead name, contact, remarks..." 
                      value={search} 
                      onChange={e => setSearch(e.target.value)} 
                      style={{ 
                        width: "100%", 
                        padding: "6px 10px 6px 30px", 
                        borderRadius: "8px", 
                        border: "1px solid #cbd5e1", 
                        fontSize: "0.8rem", 
                        color: "#334155",
                        outline: "none",
                        background: "#f8fafc"
                      }} 
                    />
                 </div>
                 <div style={{ position: "relative" }}>
                   <select 
                     value={filterCat} 
                     onChange={e => setFilterCat(e.target.value)} 
                     style={{ 
                       padding: "6px 28px 6px 12px", 
                       borderRadius: "8px", 
                       border: "1px solid #cbd5e1", 
                       fontSize: "0.8rem", 
                       fontWeight: 600,
                       color: "#475569", 
                       outline: "none", 
                       background: "#f8fafc", 
                       cursor: "pointer",
                       appearance: "none"
                     }}
                   >
                      <option value="All">All Categories</option>
                      {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                   <LucideFilter size={12} color="#64748b" style={{ position: "absolute", right: "10px", top: "10px", pointerEvents: "none" }} />
                 </div>
              </div>

              {leads.length > 0 && (
                <button 
                  onClick={() => {
                    fetchTeammates();
                    setIsForwardModalOpen(true);
                  }}
                  style={{ 
                    padding: "6px 14px", 
                    background: "#2563eb", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "8px", 
                    fontSize: "0.8rem", 
                    fontWeight: 800, 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 10px rgba(37,99,235,0.15)"
                  }}
                >
                  <LucideShare2 size={13} /> Forward Leads
                </button>
              )}
           </div>

           {filteredLeads.length === 0 ? (
             <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "#94a3b8" }}>
                <LucideDatabase size={48} style={{ opacity: 0.15, margin: "0 auto 0.75rem" }} />
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#475569", margin: "0 0 4px" }}>No Personal Lead Data Found</h3>
                <p style={{ fontSize: "0.8rem", margin: 0 }}>Save interested candidates from your pipeline to populate personal leads.</p>
             </div>
           ) : (
             <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                   <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                         <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Candidate</th>
                         <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Interested Domains</th>
                         <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Contact Details</th>
                         <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Moved On</th>
                         <th style={{ padding: "10px 12px", textAlign: "right", color: "#475569", fontWeight: 700 }}>Action</th>
                      </tr>
                   </thead>
                   <tbody>
                      {filteredLeads.map((l: any, idx: number) => (
                        <tr 
                          key={l.id || l._id} 
                          style={{ 
                            borderBottom: "1px solid #f1f5f9",
                            background: idx % 2 === 0 ? "#ffffff" : "#fdfdfd"
                          }}
                        >
                           <td style={{ padding: "10px 12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ 
                                  width: "28px", 
                                  height: "28px", 
                                  borderRadius: "8px", 
                                  background: idx % 3 === 0 ? "#e0e7ff" : idx % 3 === 1 ? "#ecfdf5" : "#fef3c7",
                                  color: idx % 3 === 0 ? "#4f46e5" : idx % 3 === 1 ? "#059669" : "#d97706",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: "0.8rem"
                                }}>
                                  {l.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div>
                                   <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.85rem" }}>{l.name}</div>
                                   <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>{l.jobRole || "No CRM Role"}</div>
                                </div>
                              </div>
                           </td>
                           <td style={{ padding: "10px 12px" }}>
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                 {l.leadInfo?.categories?.map((c: string) => (
                                   <span key={c} style={{ background: "#e0e7ff", color: "#4f46e5", padding: "2px 6px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 700 }}>{c}</span>
                                 ))}
                              </div>
                           </td>
                           <td style={{ padding: "10px 12px" }}>
                              <div style={{ fontWeight: 650, color: "#334155" }}>{l.phone}</div>
                              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{l.email}</div>
                           </td>
                           <td style={{ padding: "10px 12px" }}>
                              <div style={{ fontWeight: 600, color: "#334155" }}>{l.leadInfo?.movedBy || "System"}</div>
                              <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                                {l.leadInfo?.movedAt ? new Date(l.leadInfo.movedAt).toLocaleDateString() : "---"}
                              </div>
                           </td>
                           <td style={{ padding: "10px 12px", textAlign: "right" }}>
                              <button 
                                onClick={() => setSelectedLead(l)} 
                                style={{ 
                                  background: "#eff6ff", 
                                  color: "#2563eb", 
                                  border: "1px solid #bfdbfe", 
                                  padding: "4px 10px", 
                                  borderRadius: "6px", 
                                  cursor: "pointer", 
                                  fontWeight: 800, 
                                  display: "inline-flex", 
                                  alignItems: "center", 
                                  gap: "4px",
                                  fontSize: "0.75rem"
                                }}
                              >
                                 <LucideEye size={12} /> View Details
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      )}

      {/* FORWARDED LEADS TAB VIEW */}
      {activeTab === "forwarded_leads" && (
        <div>
          {!openedBatch ? (
            /* List of forwarded batches */
            forwardedBatches.length === 0 ? (
              <div style={{ background: "white", padding: "3rem 1.5rem", textAlign: "center", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                 <LucideShare2 size={48} style={{ opacity: 0.15, margin: "0 auto 0.75rem" }} />
                 <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#475569", margin: "0 0 4px" }}>No Forwarded Batches Received</h3>
                 <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>Leads forwarded by other recruiters in your team or company will show up here.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
                {forwardedBatches.map((batch: any) => {
                  const initChar = batch.fromName?.[0]?.toUpperCase() || "?";
                  return (
                    <div 
                      key={batch.id} 
                      onClick={() => handleOpenBatch(batch)}
                      style={{ 
                        background: "white", 
                        padding: "1.25rem", 
                        borderRadius: "16px", 
                        border: "1px solid #cbd5e1", 
                        cursor: "pointer",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.borderColor = "#2563eb";
                        e.currentTarget.style.boxShadow = "0 6px 14px rgba(37,99,235,0.05)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.borderColor = "#cbd5e1";
                        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.02)";
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <div style={{ 
                            width: "36px", 
                            height: "36px", 
                            borderRadius: "10px", 
                            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", 
                            color: "#2563eb", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "0.9rem",
                            border: "1px solid #bfdbfe"
                          }}>
                            {initChar}
                          </div>
                          <div>
                            <strong style={{ fontSize: "0.85rem", color: "#0f172a", display: "block" }}>{batch.fromName}</strong>
                            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Recruiter Forward</span>
                          </div>
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700 }}>
                          {new Date(batch.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "1.25rem" }}>
                        {batch.categories?.map((cat: string) => (
                          <span key={cat} style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", padding: "2px 6px", borderRadius: "5px", fontSize: "0.68rem", fontWeight: 700 }}>
                            {cat}
                          </span>
                        ))}
                      </div>

                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.62rem", color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700 }}>Shared Quantity</span>
                          <strong style={{ fontSize: "1.1rem", color: "#2563eb", fontWeight: 900 }}>{batch.count} leads</strong>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenBatch(batch); }}
                          style={{ padding: "4px 10px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#475569", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer" }}
                        >
                          Open Batch
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Detailed view of the opened batch */
            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button 
                    onClick={() => setOpenedBatch(null)}
                    style={{ 
                      background: "#f1f5f9", border: "none", width: "28px", height: "28px", borderRadius: "6px", 
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" 
                    }}
                  >
                    <LucideChevronLeft size={16} />
                  </button>
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      Leads Batch from {openedBatch.fromName}
                    </h3>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                      Forwarded on {new Date(openedBatch.date).toLocaleDateString()} at {new Date(openedBatch.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>

                <div style={{ background: "#eff6ff", color: "#2563eb", padding: "4px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, border: "1px solid #bfdbfe" }}>
                  {openedBatch.count} Shared Leads
                </div>
              </div>

              {(() => {
                const batchCandidates = getBatchCandidates(openedBatch);
                if (batchCandidates.length === 0) {
                  return (
                    <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
                      The profiles associated with this forwarded batch could not be parsed.
                    </div>
                  );
                }

                return (
                  <div style={{ overflowX: "auto" }}>
                     <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                        <thead>
                           <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                              <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Candidate</th>
                              <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Interested Domains</th>
                              <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Contact Details</th>
                               <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Remarks</th>
                              <th style={{ padding: "10px 12px", textAlign: "right", color: "#475569", fontWeight: 700 }}>Action</th>
                           </tr>
                        </thead>
                        <tbody>
                           {batchCandidates.map((l: any, idx: number) => (
                             <tr 
                               key={l.id || idx} 
                               style={{ 
                                 borderBottom: "1px solid #f1f5f9",
                                 background: idx % 2 === 0 ? "#ffffff" : "#fdfdfd"
                               }}
                             >
                                <td style={{ padding: "10px 12px" }}>
                                   <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                     <div style={{ 
                                       width: "28px", 
                                       height: "28px", 
                                       borderRadius: "8px", 
                                       background: idx % 3 === 0 ? "#ecfdf5" : idx % 3 === 1 ? "#f5f3ff" : "#fff7ed",
                                       color: idx % 3 === 0 ? "#059669" : idx % 3 === 1 ? "#7c3aed" : "#ea580c",
                                       display: "flex",
                                       alignItems: "center",
                                       justifyContent: "center",
                                       fontWeight: 800,
                                       fontSize: "0.8rem"
                                     }}>
                                       {l.name?.[0]?.toUpperCase() || "?"}
                                     </div>
                                     <div>
                                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.85rem" }}>{l.name}</div>
                                        <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>{l.jobRole || "No CRM Role"}</div>
                                     </div>
                                   </div>
                                </td>
                                <td style={{ padding: "10px 12px" }}>
                                   <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                      {l.leadInfo?.categories?.map((c: string) => (
                                        <span key={c} style={{ background: "#ecfdf5", color: "#059669", padding: "2px 6px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 700 }}>{c}</span>
                                      ))}
                                   </div>
                                </td>
                                <td style={{ padding: "10px 12px" }}>
                                   <div style={{ fontWeight: 650, color: "#334155" }}>{l.phone}</div>
                                   <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{l.email}</div>
                                </td>
                                 <td style={{ padding: "10px 12px", color: "#475569" }}>
                                   <span style={{ display: "block", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                     {l.leadInfo?.remarks || "No comments written yet"}
                                   </span>
                                </td>
                                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                                   <button 
                                     onClick={() => setSelectedLead(l)} 
                                     style={{ 
                                       background: "#eff6ff", 
                                       color: "#2563eb", 
                                       border: "1px solid #bfdbfe", 
                                       padding: "4px 10px", 
                                       borderRadius: "6px", 
                                       cursor: "pointer", 
                                       fontWeight: 800, 
                                       fontSize: "0.75rem"
                                     }}
                                   >
                                      <LucideEye size={12} /> View Details
                                   </button>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* FORWARDED HISTORY TAB VIEW */}
      {activeTab === "forwarded_history" && (
        <div>
          {!openedBatch ? (
            /* List of forwarded history batches */
            sentBatches.length === 0 ? (
              <div style={{ background: "white", padding: "3rem 1.5rem", textAlign: "center", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                 <LucideShare2 size={48} style={{ opacity: 0.15, margin: "0 auto 0.75rem" }} />
                 <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#475569", margin: "0 0 4px" }}>No Forwarded History Found</h3>
                 <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>You haven't forwarded any leads to other recruiters yet.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
                {sentBatches.map((batch: any) => {
                  const initChar = batch.toNames?.[0]?.[0]?.toUpperCase() || "?";
                  return (
                    <div 
                      key={batch.id} 
                      onClick={() => setOpenedBatch(batch)}
                      style={{ 
                        background: "white", 
                        padding: "1.25rem", 
                        borderRadius: "16px", 
                        border: "1px solid #cbd5e1", 
                        cursor: "pointer",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.borderColor = "#2563eb";
                        e.currentTarget.style.boxShadow = "0 6px 14px rgba(37,99,235,0.05)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.borderColor = "#cbd5e1";
                        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.02)";
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <div style={{ 
                            width: "36px", 
                            height: "36px", 
                            borderRadius: "10px", 
                            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", 
                            color: "#16a34a", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "0.9rem",
                            border: "1px solid #bbf7d0"
                          }}>
                            {initChar}
                          </div>
                          <div>
                            <strong style={{ fontSize: "0.85rem", color: "#0f172a", display: "block" }}>
                              {batch.toNames ? batch.toNames.join(", ") : "Recruiters"}
                            </strong>
                            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Recipient Recruiter(s)</span>
                          </div>
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700 }}>
                          {new Date(batch.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "1rem" }}>
                        {batch.categories?.map((cat: string) => (
                          <span key={cat} style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "2px 6px", borderRadius: "5px", fontSize: "0.68rem", fontWeight: 700 }}>
                            {cat}
                          </span>
                        ))}
                      </div>

                      {/* Recruiter View Tracking Statuses */}
                      <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "8px 10px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                        <span style={{ fontSize: "0.62rem", color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                          Recipient Read Status
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {batch.toIds?.map((id: number, index: number) => {
                            const name = batch.toNames?.[index] || `Recruiter #${id}`;
                            const hasViewed = batch.viewedBy?.includes(id);
                            return (
                              <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.72rem" }}>
                                <span style={{ color: "#334155", fontWeight: 600 }}>{name}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <div style={{ 
                                    width: "6px", 
                                    height: "6px", 
                                    borderRadius: "50%", 
                                    background: hasViewed ? "#22c55e" : "#94a3b8",
                                    boxShadow: hasViewed ? "0 0 6px #22c55e" : "none"
                                  }} />
                                  <span style={{ color: hasViewed ? "#16a34a" : "#64748b", fontWeight: 700, fontSize: "0.68rem" }}>
                                    {hasViewed ? "Viewed" : "Pending"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.62rem", color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: 700 }}>Leads Sent</span>
                          <strong style={{ fontSize: "1.1rem", color: "#16a34a", fontWeight: 900 }}>{batch.count} leads</strong>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenedBatch(batch); }}
                          style={{ padding: "4px 10px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#475569", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer" }}
                        >
                          View Sent leads
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Detailed view of the opened batch from history */
            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button 
                    onClick={() => setOpenedBatch(null)}
                    style={{ 
                      background: "#f1f5f9", border: "none", width: "28px", height: "28px", borderRadius: "6px", 
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" 
                    }}
                  >
                    <LucideChevronLeft size={16} />
                  </button>
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      Leads Forwarded to {openedBatch.toNames ? openedBatch.toNames.join(", ") : "Recruiters"}
                    </h3>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                      Sent on {new Date(openedBatch.date).toLocaleDateString()} at {new Date(openedBatch.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>

                <div style={{ background: "#e2fbe8", color: "#15803d", padding: "4px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, border: "1px solid #bbf7d0" }}>
                  {openedBatch.count} Sent Leads
                </div>
              </div>

              {(() => {
                const batchCandidates = getBatchCandidates(openedBatch);
                if (batchCandidates.length === 0) {
                  return (
                    <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
                      No active candidates found inside this history record.
                    </div>
                  );
                }

                return (
                  <div style={{ overflowX: "auto" }}>
                     <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                        <thead>
                           <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                              <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Candidate</th>
                              <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Interested Domains</th>
                              <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Contact Details</th>
                               <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Remarks</th>
                              <th style={{ padding: "10px 12px", textAlign: "right", color: "#475569", fontWeight: 700 }}>Action</th>
                           </tr>
                        </thead>
                        <tbody>
                           {batchCandidates.map((l: any, idx: number) => (
                             <tr 
                               key={l.id || idx} 
                               style={{ 
                                 borderBottom: "1px solid #f1f5f9",
                                 background: idx % 2 === 0 ? "#ffffff" : "#fdfdfd"
                               }}
                             >
                                <td style={{ padding: "10px 12px" }}>
                                   <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                     <div style={{ 
                                       width: "28px", 
                                       height: "28px", 
                                       borderRadius: "8px", 
                                       background: idx % 3 === 0 ? "#eff6ff" : idx % 3 === 1 ? "#ecfdf5" : "#fff7ed",
                                       color: idx % 3 === 0 ? "#1d4ed8" : idx % 3 === 1 ? "#047857" : "#c2410c",
                                       display: "flex",
                                       alignItems: "center",
                                       justifyContent: "center",
                                       fontWeight: 800,
                                       fontSize: "0.8rem"
                                     }}>
                                       {l.name?.[0]?.toUpperCase() || "?"}
                                     </div>
                                     <div>
                                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.85rem" }}>{l.name}</div>
                                        <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>{l.jobRole || "No CRM Role"}</div>
                                     </div>
                                   </div>
                                </td>
                                <td style={{ padding: "10px 12px" }}>
                                   <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                      {l.leadInfo?.categories?.map((c: string) => (
                                        <span key={c} style={{ background: "#e0e7ff", color: "#4f46e5", padding: "2px 6px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 700 }}>{c}</span>
                                      ))}
                                   </div>
                                </td>
                                <td style={{ padding: "10px 12px" }}>
                                   <div style={{ fontWeight: 650, color: "#334155" }}>{l.phone}</div>
                                   <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{l.email}</div>
                                </td>
                                 <td style={{ padding: "10px 12px", color: "#475569" }}>
                                   <span style={{ display: "block", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                     {l.leadInfo?.remarks || "No comments written yet"}
                                   </span>
                                </td>
                                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                                   <button 
                                     onClick={() => setSelectedLead(l)} 
                                     style={{ 
                                       background: "#eff6ff", 
                                       color: "#2563eb", 
                                       border: "1px solid #bfdbfe", 
                                       padding: "4px 10px", 
                                       borderRadius: "6px", 
                                       cursor: "pointer", 
                                       fontWeight: 800, 
                                       fontSize: "0.75rem"
                                     }}
                                   >
                                      <LucideEye size={12} /> View Details
                                   </button>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* STEP-BY-STEP LEAD FORWARDING MODAL */}
      <AnimatePresence>
        {isForwardModalOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "white", width: "100%", maxWidth: "480px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}
            >
              
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Forward Lead Pipeline</h3>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Step {forwardStep} of 3</span>
                </div>
                <button 
                  onClick={() => {
                    setIsForwardModalOpen(false);
                    setForwardStep(1);
                    setSelectedCategories([]);
                    setLeadsCountToForward("");
                    setSelectedRecipients([]);
                    setShowAllCompany(false);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: "4px" }}
                >
                  <LucideXCircle size={20} color="#94a3b8" />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: "1.5rem", maxHeight: "360px", overflowY: "auto" }}>
                
                {/* STEP 1: Select Categories */}
                {forwardStep === 1 && (
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", marginBottom: "8px", textTransform: "uppercase" }}>
                      Choose Lead Categories *
                    </h4>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>
                      Select the domains from your personal leads directory you wish to forward.
                    </p>
                    
                    {uniqueCats.length === 0 ? (
                      <div style={{ padding: "1rem", textAlign: "center", border: "1.5px dashed #cbd5e1", borderRadius: "10px", fontSize: "0.8rem", color: "#64748b" }}>
                        No categories found in your leads list.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {uniqueCats.map(cat => (
                          <label 
                            key={cat} 
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "10px", 
                              padding: "10px 12px", 
                              background: selectedCategories.includes(cat) ? "#eff6ff" : "#f8fafc", 
                              borderRadius: "10px", 
                              border: `1.5px solid ${selectedCategories.includes(cat) ? "#2563eb" : "#cbd5e1"}`,
                              cursor: "pointer",
                              transition: "all 0.15s"
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedCategories.includes(cat)} 
                              onChange={() => {
                                setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
                              }} 
                              style={{ cursor: "pointer" }}
                            />
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: selectedCategories.includes(cat) ? "#1e40af" : "#334155" }}>
                              {cat}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: Lead Count */}
                {forwardStep === 2 && (
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", marginBottom: "8px", textTransform: "uppercase" }}>
                      Lead Volume *
                    </h4>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1.25rem" }}>
                      Specify the quantity of matched leads in selected categories to forward.
                    </p>

                    <div style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", padding: "12px", borderRadius: "10px", marginBottom: "1.25rem" }}>
                      <span style={{ fontSize: "0.7rem", color: "#1e40af", fontWeight: 700, display: "block" }}>MATCHED PIPELINE QUANTITY</span>
                      <strong style={{ fontSize: "1.2rem", color: "#1d4ed8", fontWeight: 900 }}>{totalForwardableMatching} Leads Available</strong>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569" }}>Number of leads to forward</label>
                      <input 
                        type="number" 
                        placeholder={`e.g. 50 (Leave blank for ALL)`} 
                        value={leadsCountToForward} 
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "") {
                            setLeadsCountToForward("");
                            return;
                          }
                          const parsed = parseInt(val);
                          if (parsed > totalForwardableMatching) {
                            setLeadsCountToForward(String(totalForwardableMatching));
                          } else if (parsed < 1) {
                            setLeadsCountToForward("1");
                          } else {
                            setLeadsCountToForward(val);
                          }
                        }} 
                        min={1} 
                        max={totalForwardableMatching}
                        style={{ 
                          width: "100%", 
                          padding: "10px 14px", 
                          borderRadius: "10px", 
                          border: "1.5px solid #cbd5e1", 
                          outline: "none", 
                          fontSize: "0.85rem" 
                        }}
                      />
                      <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                        Note: Leads are selected chronologically (oldest saved leads first).
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 3: Choose Recipient */}
                {forwardStep === 3 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", margin: 0, textTransform: "uppercase" }}>
                        Recruiter Recipient *
                      </h4>
                      <button 
                        onClick={() => {
                          if (!showAllCompany) {
                            fetchAllCompanyRecruiters();
                          }
                          setShowAllCompany(!showAllCompany);
                        }}
                        style={{ 
                          background: "none", 
                          border: "none", 
                          color: "#2563eb", 
                          fontSize: "0.72rem", 
                          fontWeight: 800, 
                          cursor: "pointer" 
                        }}
                      >
                        {showAllCompany ? "Show Teammates Only" : "Show All Company"}
                      </button>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>
                      {showAllCompany 
                        ? "Select recipient recruiters from the entire company directory." 
                        : "Select recipient recruiters from your immediate team directory."}
                    </p>

                    {loadingRecruiters ? (
                      <div style={{ padding: "1.5rem", textAlign: "center", fontSize: "0.8rem", color: "#64748b" }}>
                        Loading recruiters list...
                      </div>
                    ) : (
                      (() => {
                        const listToRender = showAllCompany ? allRecruiters : teammates;
                        if (listToRender.length === 0) {
                          return (
                            <div style={{ padding: "1rem", textAlign: "center", border: "1.5px dashed #cbd5e1", borderRadius: "10px", fontSize: "0.8rem", color: "#64748b" }}>
                              No active recruiters found in this view.
                            </div>
                          );
                        }

                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {listToRender.map(rec => (
                              <label 
                                key={rec.id} 
                                style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: "10px", 
                                  padding: "8px 12px", 
                                  background: selectedRecipients.includes(rec.id) ? "#f0fdf4" : "#f8fafc", 
                                  borderRadius: "10px", 
                                  border: `1.5px solid ${selectedRecipients.includes(rec.id) ? "#16a34a" : "#cbd5e1"}`,
                                  cursor: "pointer",
                                  transition: "all 0.15s"
                                }}
                              >
                                <input 
                                  type="checkbox" 
                                  checked={selectedRecipients.includes(rec.id)} 
                                  onChange={() => {
                                    setSelectedRecipients(prev => prev.includes(rec.id) ? prev.filter(id => id !== rec.id) : [...prev, rec.id]);
                                  }} 
                                  style={{ cursor: "pointer" }}
                                />
                                <div>
                                  <strong style={{ fontSize: "0.8rem", color: selectedRecipients.includes(rec.id) ? "#15803d" : "#0f172a", display: "block" }}>{rec.name}</strong>
                                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{rec.email}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>
                )}

              </div>

              {/* Modal Footer Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
                {forwardStep > 1 ? (
                  <button 
                    onClick={() => setForwardStep(prev => prev - 1)}
                    style={{ padding: "6px 16px", background: "white", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {forwardStep < 3 ? (
                  <button 
                    onClick={() => {
                      if (forwardStep === 1 && selectedCategories.length === 0) {
                        return alert("Choose at least one category to proceed.");
                      }
                      if (forwardStep === 2) {
                        const parsed = parseInt(leadsCountToForward);
                        if (!isNaN(parsed) && parsed > totalForwardableMatching) {
                          return alert(`You cannot forward more than the available leads (${totalForwardableMatching})`);
                        }
                      }
                      setForwardStep(prev => prev + 1);
                    }}
                    style={{ padding: "6px 20px", background: "#2563eb", border: "none", color: "white", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    onClick={handleForwardLeads}
                    style={{ padding: "6px 20px", background: "#16a34a", border: "none", color: "white", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}
                  >
                    Forward Now
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern High-Density Profile Sidebar Drawer */}
      <AnimatePresence>
        {selectedLead && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ background: "white", width: "420px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(15, 23, 42, 0.08)", display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: "'Outfit', 'Inter', sans-serif" }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <LucideDatabase size={16} color="#6366f1" />
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Lead Profile Info</h3>
                  </div>
                  <button onClick={() => setSelectedLead(null)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", borderRadius: "50%" }} onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "none"}><LucideXCircle size={20} color="#94a3b8" /></button>
                </div>

                {/* Avatar and Primary Details */}
                <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "1.25rem", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "1.25rem" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, boxShadow: "0 4px 8px rgba(99, 102, 241, 0.2)" }}>
                         {selectedLead.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                         <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{selectedLead.name}</h4>
                         <div style={{ color: "#4f46e5", fontWeight: 700, fontSize: "0.75rem", marginTop: "2px" }}>{selectedLead.jobRole || "No CRM Role"}</div>
                      </div>
                   </div>
                   <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem", color: "#475569", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#64748b", fontWeight: 600 }}>Sourcing Source:</span>
                        <strong style={{ color: "#1e293b" }}>{selectedLead.sourcingBy || "Direct Sourcing"}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#64748b", fontWeight: 600 }}>Location:</span>
                        <strong style={{ color: "#1e293b" }}>{selectedLead.city || "Not Specified"}</strong>
                      </div>
                   </div>
                </div>

                {/* Interested Categories */}
                <div style={{ marginBottom: "1.25rem" }}>
                   <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Interested Domains</h5>
                   <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {selectedLead.leadInfo?.categories?.map((c: string) => (
                         <span key={c} style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "4px 8px", borderRadius: "6px", fontWeight: 700, fontSize: "0.7rem" }}>{c}</span>
                      ))}
                   </div>
                </div>

                {/* Recruiter Remarks with amber note styling */}
                <div style={{ marginBottom: "1.25rem" }}>
                   <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Recruiter Remarks</h5>
                   <div style={{ background: "#fffbeb", padding: "10px 12px", borderRadius: "10px", border: "1px solid #fef3c7", color: "#92400e", fontSize: "0.8rem", lineHeight: 1.4, fontWeight: 500 }}>
                      "{selectedLead.leadInfo?.remarks || "No comments written yet"}"
                   </div>
                </div>

                {/* Meta details grid */}
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
                   <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Lead Metadata</h5>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.75rem", color: "#64748b", background: "#f8fafc", padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div>
                         <span style={{ display: "block", color: "#94a3b8", fontWeight: 600 }}>Moved By:</span>
                         <span style={{ color: "#334155", fontWeight: 700 }}>{selectedLead.leadInfo?.movedBy || "System"}</span>
                      </div>
                      <div>
                         <span style={{ display: "block", color: "#94a3b8", fontWeight: 600 }}>Date Moved:</span>
                         <span style={{ color: "#334155", fontWeight: 700 }}>
                           {selectedLead.leadInfo?.movedAt ? new Date(selectedLead.leadInfo.movedAt).toLocaleDateString() : "---"}
                         </span>
                      </div>
                      <div>
                         <span style={{ display: "block", color: "#94a3b8", fontWeight: 600 }}>Phone:</span>
                         <span style={{ color: "#334155", fontWeight: 700 }}>{selectedLead.phone || "N/A"}</span>
                      </div>
                      <div>
                         <span style={{ display: "block", color: "#94a3b8", fontWeight: 600 }}>Email:</span>
                         <span style={{ color: "#334155", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", maxWidth: "160px" }}>{selectedLead.email || "N/A"}</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* View full profile link callback */}
              {onViewProfile && (
                <div style={{ marginTop: "1.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
                   <button 
                     onClick={() => {
                       onViewProfile(selectedLead);
                       setSelectedLead(null);
                     }}
                     style={{ 
                       width: "100%", 
                       background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)", 
                       color: "#fff", 
                       border: "none", 
                       padding: "10px", 
                       borderRadius: "10px", 
                       fontWeight: 700, 
                       cursor: "pointer", 
                       boxShadow: "0 4px 10px rgba(79, 70, 229, 0.2)",
                       display: "flex",
                       alignItems: "center",
                       justifyContent: "center",
                       gap: "6px",
                       transition: "transform 0.15s, opacity 0.15s",
                       fontSize: "0.8rem"
                     }}
                     onMouseEnter={e => {
                       e.currentTarget.style.transform = "translateY(-1px)";
                       e.currentTarget.style.boxShadow = "0 6px 14px rgba(79, 70, 229, 0.3)";
                     }}
                     onMouseLeave={e => {
                       e.currentTarget.style.transform = "none";
                       e.currentTarget.style.boxShadow = "0 4px 10px rgba(79, 70, 229, 0.2)";
                     }}
                   >
                     <LucideEye size={14} /> Open Full Profile
                   </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        .module-container input, 
        .module-container select, 
        .module-container textarea {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }
      `}</style>
    </div>
  );
}
