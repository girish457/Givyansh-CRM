import React, { useState, useEffect, useRef } from "react";
import { 
  LucideX, 
  LucideMinus, 
  LucideMaximize2, 
  LucideMinimize2, 
  LucideUsers, 
  LucideBuilding2, 
  LucideSearch,
  LucideClock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalMatchedLeadsPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom states passed from event
  const [role, setRole] = useState("recruiter");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  // Position and Size states
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 650, height: 460 });
  const prevSize = useRef({ width: 650, height: 460 });
  const prevPosition = useRef({ x: 100, y: 100 });

  // Listen to open event
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { 
        jobTitle: title, 
        candidates: list,
        role: userRole,
        currentUser: user,
        teamMembers: team
      } = customEvent.detail;
      
      setJobTitle(title);
      setCandidates(list || []);
      setRole(userRole || "recruiter");
      setCurrentUser(user);
      setTeamMembers(team || []);
      setSelectedFilter("all"); // Reset to 'All Leads' by default
      setIsOpen(true);
      setIsMinimized(false);
      setSearchQuery("");
      
      // Center the popup upon opening
      const width = isMaximized ? window.innerWidth - 40 : 650;
      const height = isMaximized ? window.innerHeight - 40 : 460;
      const x = Math.max(20, (window.innerWidth - width) / 2);
      const y = Math.max(20, (window.innerHeight - height) / 2);
      
      if (!isMaximized) {
        setSize({ width, height });
        setPosition({ x, y });
      }
    };
    
    window.addEventListener("OPEN_MATCHED_LEADS", handleOpen);
    return () => window.removeEventListener("OPEN_MATCHED_LEADS", handleOpen);
  }, [isMaximized]);

  // Adjust position if viewport sizes change
  useEffect(() => {
    const handleResize = () => {
      setPosition(pos => ({
        x: Math.max(10, Math.min(window.innerWidth - 100, pos.x)),
        y: Math.max(10, Math.min(window.innerHeight - 50, pos.y))
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isOpen) return null;

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    if (isMaximized) return; // Disable dragging when maximized

    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select')) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startXPos = position.x;
    const startYPos = position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, startXPos + deltaX)),
        y: Math.max(0, Math.min(window.innerHeight - (isMinimized ? 50 : size.height), startYPos + deltaY))
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Resizing logic
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newWidth = Math.max(450, Math.min(window.innerWidth - position.x - 10, startWidth + deltaX));
      const newHeight = Math.max(300, Math.min(window.innerHeight - position.y - 10, startHeight + deltaY));
      
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setSize(prevSize.current);
      setPosition(prevPosition.current);
      setIsMaximized(false);
    } else {
      prevSize.current = { ...size };
      prevPosition.current = { ...position };
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 60 });
      setPosition({ x: 20, y: 20 });
      setIsMaximized(true);
      setIsMinimized(false);
    }
  };

  // Helper to match domains
  const isDomainMatch = (domain: string, title: string) => {
    if (!domain || !title) return false;
    const d = domain.toLowerCase().trim();
    const t = title.toLowerCase().trim();
    if (d === t) return true;
    if (d.includes(t) || t.includes(d)) return true;
    
    const dNorm = d.replace("development", "developer").replace("calling", "caller").replace("ing", "").trim();
    const tNorm = t.replace("development", "developer").replace("calling", "caller").replace("ing", "").trim();
    if (dNorm.includes(tNorm) || tNorm.includes(dNorm)) return true;
    return false;
  };

  // Filter candidates based on role, currentUser, selectedFilter, and domain match
  const getFilteredCandidates = () => {
    if (!currentUser) return [];
    const myId = String(currentUser.id || currentUser.userId || "").trim();
    const myName = currentUser.name?.toLowerCase().trim();

    const leadData = (() => {
      try {
        return JSON.parse(localStorage.getItem("givyansh_lead_data_v1") || "{}");
      } catch {
        return {};
      }
    })();

    const forwardedBatches = (() => {
      try {
        return JSON.parse(localStorage.getItem("givyansh_forwarded_leads_v1") || "[]");
      } catch {
        return [];
      }
    })();

    // 1. Filter candidates to only those that exist in leadData AND match the domain/title
    const matchedLeads = candidates.filter(c => {
      if (!leadData[c.id || c._id]) return false;
      const info = leadData[c.id || c._id];
      const categories: string[] = info?.categories || [];
      return categories.some(cat => isDomainMatch(cat, jobTitle));
    }).map(c => ({
      ...c,
      leadInfo: leadData[c.id || c._id]
    }));

    // 2. Classify / filter based on dropdown selection
    if (selectedFilter === "personal") {
      return matchedLeads.filter(c => {
        const isAddedBy = String(c.addedBy || "").trim() === myId;
        const isAssignedTo = String(c.assignedTo || "").trim() === myId;
        const isNameMatch = c.recruiterName && c.recruiterName.toLowerCase().trim() === myName;
        return isAddedBy || isAssignedTo || isNameMatch;
      });
    }

    if (selectedFilter === "forwarded") {
      const forwardedLeadIds = new Set<string>();
      forwardedBatches.forEach((batch: any) => {
        const isRecipient = batch.toIds?.some((id: any) => String(id).trim() === myId);
        if (isRecipient && Array.isArray(batch.candidateIds)) {
          batch.candidateIds.forEach((id: string) => forwardedLeadIds.add(id));
        }
      });
      return matchedLeads.filter(c => forwardedLeadIds.has(c.id || c._id));
    }

    // Check if it's a team member's ID (for TL)
    const isTeamMemberId = teamMembers.some(m => String(m.id || "").trim() === selectedFilter);
    if (isTeamMemberId) {
      const member = teamMembers.find(m => String(m.id || "").trim() === selectedFilter);
      const memberId = String(member.id || "").trim();
      const memberName = member.name?.toLowerCase().trim();

      return matchedLeads.filter(c => {
        const isAddedBy = String(c.addedBy || "").trim() === memberId;
        const isAssignedTo = String(c.assignedTo || "").trim() === memberId;
        const isNameMatch = c.recruiterName && c.recruiterName.toLowerCase().trim() === memberName;
        return isAddedBy || isAssignedTo || isNameMatch;
      });
    }

    // Default "all" (All Leads option)
    if (role === "tl") {
      // TL "All Leads" = TL personal + all team members' leads
      const allowedIds = new Set<string>();
      allowedIds.add(myId);
      teamMembers.forEach(m => allowedIds.add(String(m.id || "").trim()));
      
      const teamNames = teamMembers.map(m => m.name?.toLowerCase().trim());

      return matchedLeads.filter(c => {
        const isOwner = allowedIds.has(String(c.addedBy || "").trim()) || 
                        allowedIds.has(String(c.assignedTo || "").trim()) ||
                        (c.recruiterName && (c.recruiterName.toLowerCase().trim() === myName || teamNames.includes(c.recruiterName.toLowerCase().trim())));
        return isOwner;
      });
    } else {
      // Recruiter "All Leads" = Personal + Forwarded Leads
      const forwardedLeadIds = new Set<string>();
      forwardedBatches.forEach((batch: any) => {
        const isRecipient = batch.toIds?.some((id: any) => String(id).trim() === myId);
        if (isRecipient && Array.isArray(batch.candidateIds)) {
          batch.candidateIds.forEach((id: string) => forwardedLeadIds.add(id));
        }
      });

      return matchedLeads.filter(c => {
        const isAddedBy = String(c.addedBy || "").trim() === myId;
        const isAssignedTo = String(c.assignedTo || "").trim() === myId;
        const isNameMatch = c.recruiterName && c.recruiterName.toLowerCase().trim() === myName;
        const isPersonal = isAddedBy || isAssignedTo || isNameMatch;
        const isForwarded = forwardedLeadIds.has(c.id || c._id);
        return isPersonal || isForwarded;
      });
    }
  };

  const finalFilteredList = getFilteredCandidates().filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.jobRole?.toLowerCase().includes(q) ||
      c.leadInfo?.categories?.some((cat: string) => cat.toLowerCase().includes(q))
    );
  });

  return (
    <AnimatePresence>
      <div 
        style={{
          position: "fixed",
          left: isMaximized ? "20px" : `${position.x}px`,
          top: isMaximized ? "20px" : `${position.y}px`,
          width: isMaximized ? "calc(100vw - 40px)" : `${size.width}px`,
          height: isMinimized ? "auto" : (isMaximized ? "calc(100vh - 40px)" : `${size.height}px`),
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: isMaximized ? "all 0.2s ease-out" : "none",
          fontFamily: "'Outfit', 'Inter', sans-serif"
        }}
      >
        {/* Header Bar */}
        <div 
          onMouseDown={handleMouseDown}
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: isMaximized ? "default" : "move",
            userSelect: "none"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "8px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
              <LucideUsers size={16} />
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, display: "block" }}>Matched Leads: {jobTitle}</span>
              <span style={{ fontSize: "0.68rem", opacity: 0.85, fontWeight: 500 }}>
                {finalFilteredList.length} leads matched
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Minimize button */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "6px",
                width: "26px",
                height: "26px",
                color: "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
              title="Minimize"
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >
              <LucideMinus size={14} />
            </button>

            {/* Maximize button */}
            <button
              onClick={toggleMaximize}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "6px",
                width: "26px",
                height: "26px",
                color: "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
              title={isMaximized ? "Restore Size" : "Maximize"}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >
              {isMaximized ? <LucideMinimize2 size={13} /> : <LucideMaximize2 size={13} />}
            </button>

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(239,68,68,0.2)",
                border: "none",
                borderRadius: "6px",
                width: "26px",
                height: "26px",
                color: "#fca5a5",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
              title="Close"
              onMouseEnter={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "#fca5a5"; }}
            >
              <LucideX size={14} />
            </button>
          </div>
        </div>

        {/* Body content */}
        {!isMinimized && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "16px", minHeight: 0, overflow: "hidden", background: "#f8fafc" }}>
            {/* Filter and Search Row */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <LucideSearch size={14} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "10px" }} />
                <input 
                  type="text" 
                  placeholder="Search candidates by name, contact..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 32px",
                    borderRadius: "8px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.8rem",
                    color: "#334155",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              
              {/* Dropdown Filter */}
              <div style={{ minWidth: "180px" }}>
                <select
                  value={selectedFilter}
                  onChange={e => setSelectedFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#475569",
                    background: "#ffffff",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="all">All Leads</option>
                  <option value="personal">My Personal Leads</option>
                  {role === "tl" ? (
                    teamMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))
                  ) : (
                    <option value="forwarded">Forwarded Leads</option>
                  )}
                </select>
              </div>
            </div>

            {/* Candidates List Area */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0, borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff" }}>
              {finalFilteredList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  <LucideUsers size={36} style={{ opacity: 0.25, margin: "0 auto 10px" }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 650, display: "block" }}>No data found</span>
                  <span style={{ fontSize: "0.72rem", color: "#cbd5e1" }}>No matched leads found under this selection</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {finalFilteredList.map((c, idx) => {
                    const locationStr = [c.state, c.city]
                      .filter(Boolean)
                      .map(s => String(s).toLowerCase().trim())
                      .join(", ");

                    return (
                      <div 
                        key={c.id || c._id || idx}
                        style={{
                          padding: "14px 16px",
                          borderBottom: idx === finalFilteredList.length - 1 ? "none" : "1px solid #f1f5f9",
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "12px"
                        }}
                      >
                        <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            width: "36px", 
                            height: "36px", 
                            borderRadius: "10px", 
                            background: idx % 3 === 0 ? "#e0e7ff" : idx % 3 === 1 ? "#ecfdf5" : "#fef3c7",
                            color: idx % 3 === 0 ? "#4f46e5" : idx % 3 === 1 ? "#059669" : "#d97706",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "0.9rem",
                            flexShrink: 0,
                            marginTop: "2px"
                          }}>
                            {c.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "3px" }}>
                            <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem", display: "block" }}>{c.name}</span>
                            
                            <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                              <LucideBuilding2 size={11} color="#94a3b8" /> {c.jobRole || "No CRM Role"}
                            </span>

                            {/* Candidate Number */}
                            <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 500 }}>
                              <strong style={{ color: "#64748b" }}>Candidate Number: </strong>{c.phone || "N/A"}
                            </span>

                            {/* Location */}
                            {locationStr && (
                              <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 500 }}>
                                <strong style={{ color: "#64748b" }}>Location: </strong>{locationStr}
                              </span>
                            )}

                            {/* Remarks / Notes */}
                            <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 500 }}>
                              <strong style={{ color: "#64748b" }}>Remarks / Notes: </strong>{c.leadInfo?.remarks || "N/A"}
                            </span>
                            

                            {/* Interested domains list */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                              {c.leadInfo?.categories?.map((cat: string) => (
                                <span key={cat} style={{ background: "#e0e7ff", color: "#4f46e5", padding: "2px 6px", borderRadius: "5px", fontSize: "0.65rem", fontWeight: 700 }}>
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right side Date (Action Buttons Removed) */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, minWidth: "90px" }}>
                          <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                            <LucideClock size={12} color="#94a3b8" />
                            {c.leadInfo?.movedAt ? new Date(c.leadInfo.movedAt).toLocaleDateString('en-GB') : "---"}
                          </span>
                          <span style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: "2px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.3px" }}>Moved Date</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resizing Handle (only shown when not minimized and not maximized) */}
        {!isMinimized && !isMaximized && (
          <div 
            onMouseDown={handleResizeMouseDown}
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "15px",
              height: "15px",
              cursor: "se-resize",
              background: "transparent",
              zIndex: 10
            }}
          />
        )}
      </div>
    </AnimatePresence>
  );
}
