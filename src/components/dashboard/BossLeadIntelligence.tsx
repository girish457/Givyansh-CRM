import React, { useState, useEffect, useMemo } from "react";
import { 
  LucideUsers, LucideDatabase, LucideUserCheck, LucideActivity, 
  LucideTrendingUp, LucideArrowRight, LucideTrendingDown, LucideCalendar, 
  LucideSearch, LucideFilter, LucideDownload, LucideCheckCircle, 
  LucideXCircle, LucideAlertCircle, LucideBriefcase, LucideEye, 
  LucideClock, LucideGlobe, LucideFileText, LucideBuilding2,
  LucidePieChart, LucideAward, LucideZap, LucideListTodo,
  LucideChevronLeft, LucideChevronRight, LucideShare2, LucideBarChart3,
  LucideSparkles, LucideLayers, LucideGauge
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "givyansh_lead_data_v1";

interface UserNode {
  id: number;
  name: string;
  email: string;
  role: "manager" | "tl" | "recruiter";
  reportingTo: number | null;
  manager_tl?: {
    id: number;
    name: string;
    role: string;
  };
}

interface CandidateLead {
  id: number;
  _id?: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  jobRole: string;
  designation: string;
  remarks: string;
  remarkReason: string;
  sourcingBy: string;
  createdAt: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  addedBy: number;
  recruiterName: string;
  reportingPerson: string;
  sector: string;
  qualification: string;
  totalExperience: string;
  currentOrg: string;
  cvSharedWith: string;
  dataType: string;
  leadInfo: {
    categories: string[];
    remarks: string;
    movedAt: number;
    movedBy: string;
  };
  resolvedHierarchy?: {
    recruiterId: number | null;
    recruiterName: string | null;
    tlId: number | null;
    tlName: string | null;
    managerId: number | null;
    managerName: string | null;
  };
}

export default function BossLeadIntelligence() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [team, setTeam] = useState<UserNode[]>([]);
  const [candidates, setCandidates] = useState<CandidateLead[]>([]);
  const [loading, setLoading] = useState(true);

  // View States
  const [activeTab, setActiveTab] = useState<"all" | "manager" | "tl" | "recruiter" | "combined" | "categories" | "analytics">("all");
  const [selectedManagerProfile, setSelectedManagerProfile] = useState<UserNode | null>(null);
  const [selectedTlProfile, setSelectedTlProfile] = useState<UserNode | null>(null);
  const [selectedRecruiterProfile, setSelectedRecruiterProfile] = useState<UserNode | null>(null);
  const [selectedLead, setSelectedLead] = useState<CandidateLead | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManagers, setSelectedManagers] = useState<number[]>([]);
  const [selectedTls, setSelectedTls] = useState<number[]>([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState<number[]>([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterExperience, setFilterExperience] = useState("All");
  const [filterQualification, setFilterQualification] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All");
  
  // Date Filters
  const [dateRangeOption, setDateRangeOption] = useState<
    "all" | "today" | "yesterday" | "7days" | "30days" | "monthly" | "yearly" | "custom"
  >("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Real-Time Polling for live updates
  useEffect(() => {
    fetchProfile();
    fetchTeamAndData();
    const interval = setInterval(fetchTeamAndData, 8000); // 8 seconds poll
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        setCurrentUser(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const fetchTeamAndData = async () => {
    try {
      const [teamRes, candRes] = await Promise.all([
        fetch("/api/team"),
        fetch("/api/candidates")
      ]);

      if (teamRes.ok && candRes.ok) {
        const teamData: UserNode[] = await teamRes.json();
        const candData: any[] = await candRes.json();
        
        setTeam(teamData);

        const leadDataMap = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

        // Map and resolve candidates' hierarchy
        const resolvedLeads = candData
          .filter((c: any) => {
            const isLead = c.dataType === "lead" || leadDataMap[c.id || c._id];
            return isLead;
          })
          .map((c: any) => {
            const localDetails = leadDataMap[c.id || c._id] || {
              categories: [c.jobRole || c.designation || "General"],
              remarks: c.remarks || "No remarks written",
              movedAt: c.createdAt ? new Date(c.createdAt).getTime() : Date.now(),
              movedBy: c.recruiterName || "Recruiter"
            };

            // Resolve recruiter
            let recNode = teamData.find(t => 
              t.id === Number(c.addedBy) || 
              t.name.toLowerCase() === (c.recruiterName || "").toLowerCase()
            );

            let recruiterId = null;
            let recruiterName = c.recruiterName || null;
            if (recNode && recNode.role === "recruiter") {
              recruiterId = recNode.id;
              recruiterName = recNode.name;
            }

            // Resolve TL
            let tlId = null;
            let tlName = c.reportingPerson || null;
            if (recNode && recNode.role === "tl") {
              tlId = recNode.id;
              tlName = recNode.name;
            } else if (recNode && recNode.role === "recruiter") {
              const sup = teamData.find(t => t.id === recNode.reportingTo);
              if (sup && sup.role === "tl") {
                tlId = sup.id;
                tlName = sup.name;
              }
            } else {
              const tlNode = teamData.find(t => 
                t.role === "tl" && 
                t.name.toLowerCase() === (c.reportingPerson || "").toLowerCase()
              );
              if (tlNode) {
                tlId = tlNode.id;
                tlName = tlNode.name;
              }
            }

            // Resolve Manager
            let managerId = null;
            let managerName = null;
            if (recNode && recNode.role === "manager") {
              managerId = recNode.id;
              managerName = recNode.name;
            } else if (tlId) {
              const tlNode = teamData.find(t => t.id === tlId);
              if (tlNode && tlNode.reportingTo) {
                const mgrNode = teamData.find(t => t.id === tlNode.reportingTo && t.role === "manager");
                if (mgrNode) {
                  managerId = mgrNode.id;
                  managerName = mgrNode.name;
                }
              }
            } else if (recNode && recNode.role === "recruiter" && recNode.reportingTo) {
              const sup = teamData.find(t => t.id === recNode.reportingTo);
              if (sup && sup.role === "manager") {
                managerId = sup.id;
                managerName = sup.name;
              }
            }

            return {
              ...c,
              leadInfo: localDetails,
              resolvedHierarchy: {
                recruiterId,
                recruiterName,
                tlId,
                tlName,
                managerId,
                managerName
              }
            };
          });

        setCandidates(resolvedLeads);
      }
    } catch (err) {
      console.error("Failed to sync leads & hierarchy:", err);
    } finally {
      setLoading(false);
    }
  };

  // DASHBOARD OVERVIEW SECTION CALCULATIONS
  const stats = useMemo(() => {
    const totalPool = candidates.length;
    const now = new Date();
    const todayStr = now.toDateString();

    const getWeekRange = () => {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0,0,0,0);
      return start;
    };
    const weekStart = getWeekRange();

    const leadsAddedToday = candidates.filter(c => {
      const date = new Date(c.createdAt || c.leadInfo.movedAt);
      return date.toDateString() === todayStr;
    }).length;

    const leadsAddedThisWeek = candidates.filter(c => {
      const date = new Date(c.createdAt || c.leadInfo.movedAt);
      return date >= weekStart;
    }).length;

    const leadsAddedThisMonth = candidates.filter(c => {
      const date = new Date(c.createdAt || c.leadInfo.movedAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    // Categories
    const categoriesSet = new Set<string>();
    candidates.forEach(c => {
      c.leadInfo.categories?.forEach(cat => categoriesSet.add(cat));
    });
    const activeCategoriesCount = categoriesSet.size;

    // Contributors
    const recruitersContributing = new Set(candidates.map(c => c.resolvedHierarchy?.recruiterId || String(c.addedBy))).size;
    const tlsContributing = new Set(candidates.map(c => c.resolvedHierarchy?.tlId || "Direct")).size;
    const managersContributing = new Set(candidates.map(c => c.resolvedHierarchy?.managerId || "Direct")).size;

    // Most Popular Category
    const categoryFreq: { [key: string]: number } = {};
    candidates.forEach(c => {
      c.leadInfo.categories?.forEach(cat => {
        categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;
      });
    });
    let popularCategory = "N/A";
    let maxCatFreq = 0;
    Object.entries(categoryFreq).forEach(([cat, count]) => {
      if (count > maxCatFreq) {
        maxCatFreq = count;
        popularCategory = cat;
      }
    });

    // Most Active Recruiter
    const recFreq: { [key: string]: number } = {};
    candidates.forEach(c => {
      const name = c.resolvedHierarchy?.recruiterName || c.recruiterName || "Unknown";
      recFreq[name] = (recFreq[name] || 0) + 1;
    });
    let activeRecruiter = "N/A";
    let maxRecFreq = 0;
    Object.entries(recFreq).forEach(([name, count]) => {
      if (count > maxRecFreq) {
        maxRecFreq = count;
        activeRecruiter = name;
      }
    });

    // Most Active TL
    const tlFreq: { [key: string]: number } = {};
    candidates.forEach(c => {
      const name = c.resolvedHierarchy?.tlName || c.reportingPerson || "Direct";
      tlFreq[name] = (tlFreq[name] || 0) + 1;
    });
    let activeTl = "N/A";
    let maxTlFreq = 0;
    Object.entries(tlFreq).forEach(([name, count]) => {
      if (count > maxTlFreq) {
        maxTlFreq = count;
        activeTl = name;
      }
    });

    return {
      totalPool,
      leadsAddedToday,
      leadsAddedThisWeek,
      leadsAddedThisMonth,
      activeCategoriesCount,
      recruitersContributing,
      tlsContributing,
      managersContributing,
      popularCategory,
      activeRecruiter,
      activeTl
    };
  }, [candidates]);

  // Hierarchy filters lists
  const hierarchyLists = useMemo(() => {
    const managers = team.filter(t => t.role === "manager");
    const tls = team.filter(t => t.role === "tl");
    const recruiters = team.filter(t => t.role === "recruiter");

    // Unique items from lead dataset
    const categoriesSet = new Set<string>();
    const locationsSet = new Set<string>();
    const experiencesSet = new Set<string>();
    const qualificationsSet = new Set<string>();

    candidates.forEach(c => {
      c.leadInfo.categories?.forEach(cat => categoriesSet.add(cat));
      if (c.city) locationsSet.add(c.city);
      if (c.state) locationsSet.add(c.state);
      if (c.totalExperience) experiencesSet.add(c.totalExperience);
      if (c.qualification) qualificationsSet.add(c.qualification);
    });

    return {
      managers,
      tls,
      recruiters,
      categories: Array.from(categoriesSet).sort(),
      locations: Array.from(locationsSet).sort(),
      experiences: Array.from(experiencesSet).sort(),
      qualifications: Array.from(qualificationsSet).sort()
    };
  }, [team, candidates]);

  // ADVANCED INTEGRATED FILTER & SEARCH SYSTEM
  const filteredLeads = useMemo(() => {
    return candidates.filter(c => {
      // Search Box
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          (c.name || "").toLowerCase().includes(query) ||
          (c.phone || "").includes(query) ||
          (c.email || "").toLowerCase().includes(query) ||
          (c.resolvedHierarchy?.recruiterName || c.recruiterName || "").toLowerCase().includes(query) ||
          (c.resolvedHierarchy?.tlName || c.reportingPerson || "").toLowerCase().includes(query) ||
          (c.resolvedHierarchy?.managerName || "").toLowerCase().includes(query) ||
          (c.city || "").toLowerCase().includes(query) ||
          (c.state || "").toLowerCase().includes(query) ||
          (c.qualification || "").toLowerCase().includes(query) ||
          (c.totalExperience || "").toLowerCase().includes(query) ||
          (c.currentOrg || "").toLowerCase().includes(query) ||
          c.leadInfo.categories?.some(cat => cat.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Advanced Filters
      // Manager (Multi-select)
      if (selectedManagers.length > 0) {
        if (!c.resolvedHierarchy?.managerId || !selectedManagers.includes(c.resolvedHierarchy.managerId)) {
          return false;
        }
      }

      // TL (Multi-select)
      if (selectedTls.length > 0) {
        if (!c.resolvedHierarchy?.tlId || !selectedTls.includes(c.resolvedHierarchy.tlId)) {
          return false;
        }
      }

      // Recruiter (Multi-select)
      if (selectedRecruiters.length > 0) {
        if (!c.resolvedHierarchy?.recruiterId || !selectedRecruiters.includes(c.resolvedHierarchy.recruiterId)) {
          return false;
        }
      }

      // Category
      if (filterCategory !== "All" && !c.leadInfo.categories?.includes(filterCategory)) return false;

      // Experience
      if (filterExperience !== "All" && c.totalExperience !== filterExperience) return false;

      // Qualification
      if (filterQualification !== "All" && c.qualification !== filterQualification) return false;

      // Location
      if (filterLocation !== "All" && c.city !== filterLocation && c.state !== filterLocation) return false;

      // Date Range Options
      if (dateRangeOption !== "all") {
        const date = new Date(c.createdAt || c.leadInfo.movedAt);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (dateRangeOption === "today") {
          return date.toDateString() === today.toDateString();
        } else if (dateRangeOption === "yesterday") {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return date.toDateString() === yesterday.toDateString();
        } else if (dateRangeOption === "7days") {
          const diffTime = today.getTime() - date.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        } else if (dateRangeOption === "30days") {
          const diffTime = today.getTime() - date.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 30;
        } else if (dateRangeOption === "monthly") {
          return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        } else if (dateRangeOption === "yearly") {
          return date.getFullYear() === today.getFullYear();
        } else if (dateRangeOption === "custom") {
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            start.setHours(0,0,0,0);
            const end = new Date(customEndDate);
            end.setHours(23,59,59,999);
            return date >= start && date <= end;
          }
        }
      }

      return true;
    });
  }, [candidates, searchQuery, selectedManagers, selectedTls, selectedRecruiters, filterCategory, filterExperience, filterQualification, filterLocation, dateRangeOption, customStartDate, customEndDate]);

  // Paginated Leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeads, currentPage]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  // Manager wise summary lists
  const managerWiseSummary = useMemo(() => {
    const managers = team.filter(t => t.role === "manager");

    return managers.map(mgr => {
      const directTls = team.filter(t => t.role === "tl" && t.reportingTo === mgr.id);
      const directTlIds = directTls.map(t => t.id);
      const subordinates = team.filter(t => 
        t.role === "recruiter" && (
          t.reportingTo === mgr.id || 
          (t.reportingTo !== null && directTlIds.includes(t.reportingTo))
        )
      );

      const mgrLeads = candidates.filter(c => c.resolvedHierarchy?.managerId === mgr.id);

      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0,0,0,0);

      const weeklyLeads = mgrLeads.filter(c => new Date(c.createdAt || c.leadInfo.movedAt) >= weekStart).length;
      const monthlyLeads = mgrLeads.filter(c => {
        const date = new Date(c.createdAt || c.leadInfo.movedAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;

      const catFreq: { [key: string]: number } = {};
      mgrLeads.forEach(c => {
        c.leadInfo.categories?.forEach(cat => {
          catFreq[cat] = (catFreq[cat] || 0) + 1;
        });
      });
      const topCategories = Object.entries(catFreq)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

      return {
        manager: mgr,
        tlCount: directTls.length,
        recruiterCount: subordinates.length,
        totalLeads: mgrLeads.length,
        weeklyLeads,
        monthlyLeads,
        topCategories: topCategories.length > 0 ? topCategories.join(", ") : "N/A"
      };
    });
  }, [team, candidates]);

  // TL wise summary lists
  const tlWiseSummary = useMemo(() => {
    const tls = team.filter(t => t.role === "tl");

    return tls.map(tl => {
      const subordinates = team.filter(t => t.reportingTo === tl.id);
      const tlLeads = candidates.filter(c => c.resolvedHierarchy?.tlId === tl.id);

      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0,0,0,0);

      const weeklyLeads = tlLeads.filter(c => new Date(c.createdAt || c.leadInfo.movedAt) >= weekStart).length;
      const monthlyLeads = tlLeads.filter(c => {
        const date = new Date(c.createdAt || c.leadInfo.movedAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;

      const catFreq: { [key: string]: number } = {};
      tlLeads.forEach(c => {
        c.leadInfo.categories?.forEach(cat => {
          catFreq[cat] = (catFreq[cat] || 0) + 1;
        });
      });
      const topCategories = Object.entries(catFreq)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

      return {
        tl,
        recruiterCount: subordinates.length,
        totalLeads: tlLeads.length,
        weeklyLeads,
        monthlyLeads,
        topCategories: topCategories.length > 0 ? topCategories.join(", ") : "N/A"
      };
    });
  }, [team, candidates]);

  // Recruiter wise summary lists
  const recruiterWiseSummary = useMemo(() => {
    const recruiters = team.filter(t => t.role === "recruiter");
    
    return recruiters.map(rec => {
      const recLeads = candidates.filter(c => c.resolvedHierarchy?.recruiterId === rec.id);
      
      const now = new Date();
      const todayStr = now.toDateString();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0,0,0,0);

      const todayLeads = recLeads.filter(c => new Date(c.createdAt || c.leadInfo.movedAt).toDateString() === todayStr).length;
      const weeklyLeads = recLeads.filter(c => new Date(c.createdAt || c.leadInfo.movedAt) >= weekStart).length;
      const monthlyLeads = recLeads.filter(c => {
        const date = new Date(c.createdAt || c.leadInfo.movedAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;

      const catFreq: { [key: string]: number } = {};
      recLeads.forEach(c => {
        c.leadInfo.categories?.forEach(cat => {
          catFreq[cat] = (catFreq[cat] || 0) + 1;
        });
      });
      let topCategory = "N/A";
      let maxCat = 0;
      Object.entries(catFreq).forEach(([cat, count]) => {
        if (count > maxCat) {
          maxCat = count;
          topCategory = cat;
        }
      });

      let lastAddedTime = "Never";
      if (recLeads.length > 0) {
        const sorted = [...recLeads].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        lastAddedTime = new Date(sorted[0].createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      }

      return {
        recruiter: rec,
        totalLeads: recLeads.length,
        todayLeads,
        weeklyLeads,
        monthlyLeads,
        topCategory,
        lastAddedTime
      };
    });
  }, [team, candidates]);

  // Export functions
  const triggerExport = (format: "csv" | "pdf") => {
    if (filteredLeads.length === 0) {
      alert("No data to export based on current filters.");
      return;
    }

    if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const rowsHtml = filteredLeads.map((c, idx) => `
        <tr style="background: ${idx % 2 === 0 ? "#f8fafc" : "#ffffff"}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: bold; color: #1e293b;">${c.name}</td>
          <td style="padding: 10px;">${c.phone}</td>
          <td style="padding: 10px; font-size: 11px;">${c.email || "N/A"}</td>
          <td style="padding: 10px;">${c.city || c.state || "N/A"}</td>
          <td style="padding: 10px; font-weight: bold; color: #4f46e5;">${c.leadInfo.categories?.join(", ") || "General"}</td>
          <td style="padding: 10px; font-weight: 500;">${c.resolvedHierarchy?.recruiterName || "N/A"}</td>
          <td style="padding: 10px; font-weight: 500;">${c.resolvedHierarchy?.tlName || "Direct"}</td>
          <td style="padding: 10px; font-weight: 500;">${c.resolvedHierarchy?.managerName || "Direct"}</td>
          <td style="padding: 10px;">${new Date(c.createdAt || c.leadInfo.movedAt).toLocaleDateString()}</td>
          <td style="padding: 10px; font-size: 11px; color: #475569;">${c.leadInfo.remarks || "N/A"}</td>
        </tr>
      `).join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Lead Intelligence Audit Report</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #0f172a; margin: 30px; }
            h1 { font-size: 24px; font-weight: 800; color: #1e3a8a; margin: 0 0 5px; }
            p { font-size: 12px; color: #64748b; margin: 0 0 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { background: #1e3a8a; color: white; padding: 12px 10px; text-align: left; font-weight: 700; }
            td { border-bottom: 1px solid #e2e8f0; padding: 10px; }
            .kpi-container { display: flex; gap: 20px; margin-bottom: 25px; }
            .kpi-card { flex: 1; padding: 15px; background: #f0f9ff; border: 1.5px solid #e0f2fe; border-radius: 12px; }
            .kpi-card h3 { font-size: 11px; text-transform: uppercase; color: #0369a1; margin: 0 0 5px; }
            .kpi-card p { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; }
          </style>
        </head>
        <body>
          <h1>Lead Intelligence Audit Report (CEO View)</h1>
          <p>Generated on ${new Date().toLocaleString()} | Enterprise Scope | Total leads: ${filteredLeads.length}</p>
          
          <div class="kpi-container">
            <div class="kpi-card"><h3>Total Exported</h3><p>${filteredLeads.length} Leads</p></div>
            <div class="kpi-card"><h3>Total Pool Size</h3><p>${candidates.length} Pool</p></div>
            <div class="kpi-card"><h3>Active Categories</h3><p>${stats.activeCategoriesCount}</p></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Location</th>
                <th>Category</th>
                <th>Recruiter</th>
                <th>TL Name</th>
                <th>Manager Name</th>
                <th>Added Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
      return;
    }

    const headers = [
      "Candidate Name", "Phone", "Email", "City", "State", "Lead Category",
      "Sourcing Recruiter", "Reporting TL", "Reporting Manager", "Experience", "Qualification", "Current Org", "Sourcing By", "Remarks", "Added Date"
    ];

    const rows = filteredLeads.map(c => [
      c.name,
      c.phone,
      c.email || "N/A",
      c.city || "N/A",
      c.state || "N/A",
      c.leadInfo.categories?.join(", ") || "General",
      c.resolvedHierarchy?.recruiterName || "N/A",
      c.resolvedHierarchy?.tlName || "Direct",
      c.resolvedHierarchy?.managerName || "Direct",
      c.totalExperience || "N/A",
      c.qualification || "N/A",
      c.currentOrg || "N/A",
      c.sourcingBy || "N/A",
      c.leadInfo.remarks || "N/A",
      new Date(c.createdAt || c.leadInfo.movedAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Boss_Lead_Intelligence_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle helpers
  const handleToggleManager = (id: number) => {
    setSelectedManagers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setCurrentPage(1);
  };

  const handleToggleTl = (id: number) => {
    setSelectedTls(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setCurrentPage(1);
  };

  const handleToggleRecruiter = (id: number) => {
    setSelectedRecruiters(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setCurrentPage(1);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedManagers([]);
    setSelectedTls([]);
    setSelectedRecruiters([]);
    setFilterCategory("All");
    setFilterExperience("All");
    setFilterQualification("All");
    setFilterLocation("All");
    setDateRangeOption("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: "1.5rem", background: "#f8fafc", minHeight: "100%", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* HEADER CONTROLS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Enterprise Lead Bank & </span>
            <span style={{ color: "#2563eb" }}>Command Center</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Master tracking board for all business and talent acquisition leads.</p>
        </div>

        {/* Global Action controls */}
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <button 
            onClick={() => triggerExport("csv")}
            style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", color: "#334155", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.background = "white"}
          >
            <LucideDownload size={14} /> Export CSV
          </button>
          <button 
            onClick={() => triggerExport("pdf")}
            style={{ padding: "8px 14px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", color: "white", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(30,41,59,0.15)", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            <LucideShare2 size={14} /> Audit Report (PDF)
          </button>
        </div>
      </div>

      {/* BANNER ACCESS GUARD */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(30, 41, 59, 0.05)", border: "1px solid rgba(30, 41, 59, 0.2)", padding: "10px 14px", borderRadius: "12px", marginBottom: "1.5rem" }}>
        <LucideSparkles size={16} color="#1e293b" />
        <span style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: 700 }}>
          CEO GLOBAL HIERARCHY ACTIVE: Direct lookup visibility across all Managers, Team Leads, and Recruiters.
        </span>
      </div>

      {/* DASHBOARD KPI CARDS SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "1.5rem" }}>
        
        {/* Total leads card */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideDatabase size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Total Lead Pool</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", margin: "2px 0 0" }}>{stats.totalPool}</h2>
          </div>
        </div>

        {/* Added Today */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideZap size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Today's Sourced</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#10b981", margin: "2px 0 0" }}>{stats.leadsAddedToday}</h2>
          </div>
        </div>

        {/* Added Week */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideCalendar size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Weekly Addition</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#7c3aed", margin: "2px 0 0" }}>{stats.leadsAddedThisWeek}</h2>
          </div>
        </div>

        {/* Added Month */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideActivity size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Monthly Total</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#d97706", margin: "2px 0 0" }}>{stats.leadsAddedThisMonth}</h2>
          </div>
        </div>

        {/* Managers count */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#eff6ff", color: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideBuilding2 size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Managers Act.</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#1e3a8a", margin: "2px 0 0" }}>{stats.managersContributing}</h2>
          </div>
        </div>

        {/* Contributing TLs */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#faf5ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideGauge size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Active TLs</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#7c3aed", margin: "2px 0 0" }}>{stats.tlsContributing}</h2>
          </div>
        </div>

        {/* Contributing recruiters */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#f0fdfa", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideUsers size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Recruiters Sourcing</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0d9488", margin: "2px 0 0" }}>{stats.recruitersContributing}</h2>
          </div>
        </div>

        {/* Popular category */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#faf5ff", color: "#6b21a8", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideAward size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Top Lead Domain</span>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 900, color: "#6b21a8", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px" }} title={stats.popularCategory}>{stats.popularCategory}</h2>
          </div>
        </div>

      </div>

      {/* GLOBAL SEARCH & INTEGRATED FILTERS PANEL */}
      <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", marginBottom: "1.5rem" }}>
        
        {/* Search & Mode Header */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
          
          {/* Main searchbox */}
          <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <LucideSearch size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "10px" }} />
            <input 
              type="text" 
              placeholder="Search candidate name, mobile, email, category, recruiter, TL, manager, location..." 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ width: "100%", padding: "8px 12px 8px 38px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.85rem", color: "#1e293b", transition: "all 0.15s" }}
            />
          </div>

          {/* Quick Dates dropdown */}
          <div>
            <select 
              value={dateRangeOption} 
              onChange={e => { setDateRangeOption(e.target.value as any); setCurrentPage(1); }}
              style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.82rem", fontWeight: 700, color: "#475569", background: "#f8fafc", cursor: "pointer" }}
            >
              <option value="all">All Date Ranges</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">7 Days</option>
              <option value="30days">30 Days</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button 
            onClick={handleResetFilters}
            style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px dashed #cbd5e1", background: "transparent", color: "#e11d48", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer" }}
          >
            Clear Filters
          </button>
        </div>

        {/* Custom date range option expand panel */}
        {dateRangeOption === "custom" && (
          <div style={{ display: "flex", gap: "10px", padding: "10px", background: "#f8fafc", borderRadius: "10px", marginBottom: "1rem", border: "1px solid #e2e8f0", width: "fit-content", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800 }}>Start Date</span>
              <input type="date" value={customStartDate} onChange={e => { setCustomStartDate(e.target.value); setCurrentPage(1); }} style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800 }}>End Date</span>
              <input type="date" value={customEndDate} onChange={e => { setCustomEndDate(e.target.value); setCurrentPage(1); }} style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }} />
            </div>
          </div>
        )}

        {/* Dropdowns panel for advanced filters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
          
          {/* Manager list checkboxes list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Manager-wise filter</span>
            <div style={{ maxHeight: "100px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px", background: "#fafafa" }}>
              {hierarchyLists.managers.map(m => (
                <label key={m.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", padding: "2px 0", cursor: "pointer", fontWeight: 500 }}>
                  <input type="checkbox" checked={selectedManagers.includes(m.id)} onChange={() => handleToggleManager(m.id)} style={{ accentColor: "#1e293b" }} />
                  {m.name}
                </label>
              ))}
              {hierarchyLists.managers.length === 0 && <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>No Managers found</span>}
            </div>
          </div>

          {/* TL list checkboxes list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>TL-wise filter</span>
            <div style={{ maxHeight: "100px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px", background: "#fafafa" }}>
              {hierarchyLists.tls.map(t => (
                <label key={t.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", padding: "2px 0", cursor: "pointer", fontWeight: 500 }}>
                  <input type="checkbox" checked={selectedTls.includes(t.id)} onChange={() => handleToggleTl(t.id)} style={{ accentColor: "#1e293b" }} />
                  {t.name}
                </label>
              ))}
              {hierarchyLists.tls.length === 0 && <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>No TLs found</span>}
            </div>
          </div>

          {/* Recruiter list checkboxes list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Recruiter-wise filter</span>
            <div style={{ maxHeight: "100px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px", background: "#fafafa" }}>
              {hierarchyLists.recruiters.map(r => (
                <label key={r.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", padding: "2px 0", cursor: "pointer", fontWeight: 500 }}>
                  <input type="checkbox" checked={selectedRecruiters.includes(r.id)} onChange={() => handleToggleRecruiter(r.id)} style={{ accentColor: "#1e293b" }} />
                  {r.name}
                </label>
              ))}
              {hierarchyLists.recruiters.length === 0 && <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>No recruiters found</span>}
            </div>
          </div>

          {/* Category Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Category</span>
            <select 
              value={filterCategory} 
              onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              style={{ padding: "6px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.8rem", color: "#334155", background: "white" }}
            >
              <option value="All">All Categories</option>
              {hierarchyLists.categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Location Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Location</span>
            <select 
              value={filterLocation} 
              onChange={e => { setFilterLocation(e.target.value); setCurrentPage(1); }}
              style={{ padding: "6px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.8rem", color: "#334155", background: "white" }}
            >
              <option value="All">All Locations</option>
              {hierarchyLists.locations.map((l, i) => <option key={i} value={l}>{l}</option>)}
            </select>
          </div>

        </div>

      </div>

      {/* NAVIGATION VIEW MODE TOGGLES */}
      <div style={{ display: "flex", borderBottom: "2px solid #cbd5e1", marginBottom: "1.5rem", gap: "16px", flexWrap: "wrap" }}>
        {[
          { id: "all", label: "All Leads", icon: <LucideFileText size={16} /> },
          { id: "manager", label: "Manager-Wise Leads", icon: <LucideBuilding2 size={16} /> },
          { id: "tl", label: "TL-Wise Leads", icon: <LucideGauge size={16} /> },
          { id: "recruiter", label: "Recruiter-Wise Leads", icon: <LucideUsers size={16} /> },
          { id: "combined", label: "Team Combined Leads", icon: <LucideLayers size={16} /> },
          { id: "categories", label: "Lead Category Analytics", icon: <LucideSparkles size={16} /> },
          { id: "analytics", label: "Advanced Lead Analytics", icon: <LucideBarChart3 size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
            style={{ padding: "10px 16px", border: "none", background: "none", borderBottom: activeTab === tab.id ? "3px solid #1e293b" : "3px solid transparent", color: activeTab === tab.id ? "#1e293b" : "#64748b", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER DYNAMIC TAB VIEWS */}
      
      {/* ALL LEADS VIEW */}
      {activeTab === "all" && (
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>Combined Enterprise Lead Pool ({filteredLeads.length} items matched)</h3>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Showing {Math.min(filteredLeads.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredLeads.length, currentPage * itemsPerPage)} of {filteredLeads.length}</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Candidate Name</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Phone</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Email</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Location</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Lead Category</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Recruiter</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>TL Oversight</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Manager Oversight</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Added Date</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Experience</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Qualification</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Remarks</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((c, idx) => (
                  <tr key={c.id || c._id} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "white" : "#fafdfd" }}>
                    <td style={{ padding: "10px 12px", fontWeight: "bold", color: "#1e293b" }}>{c.name}</td>
                    <td style={{ padding: "10px 12px" }}>{c.phone}</td>
                    <td style={{ padding: "10px 12px" }}>{c.email || "N/A"}</td>
                    <td style={{ padding: "10px 12px" }}>{c.city ? `${c.city}, ${c.state}` : c.state || "N/A"}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {c.leadInfo.categories?.map((cat, i) => (
                          <span key={i} style={{ background: "#f5f3ff", color: "#7c3aed", padding: "2px 6px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 800 }}>{cat}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.resolvedHierarchy?.recruiterName || "N/A"}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.resolvedHierarchy?.tlName || "Direct"}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.resolvedHierarchy?.managerName || "Direct"}</td>
                    <td style={{ padding: "10px 12px" }}>{new Date(c.createdAt || c.leadInfo.movedAt).toLocaleDateString()}</td>
                    <td style={{ padding: "10px 12px" }}>{c.totalExperience || "N/A"}</td>
                    <td style={{ padding: "10px 12px" }}>{c.qualification || "N/A"}</td>
                    <td style={{ padding: "10px 12px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.leadInfo.remarks}>{c.leadInfo.remarks}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <button 
                        onClick={() => setSelectedLead(c)}
                        style={{ padding: "4px 8px", borderRadius: "6px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#1e293b", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "2px" }}
                      >
                        <LucideEye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={13} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontWeight: 600 }}>No leads match the filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <LucideChevronLeft size={14} /> Previous
              </button>
              <div style={{ display: "flex", gap: "6px" }}>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentPage(i + 1)}
                    style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: currentPage === i + 1 ? "#1e293b" : "transparent", color: currentPage === i + 1 ? "white" : "#64748b", fontWeight: 700, cursor: "pointer" }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                Next <LucideChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MANAGER WISE LEADS VIEW */}
      {activeTab === "manager" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {managerWiseSummary.map(stats => (
              <div 
                key={stats.manager.id} 
                onClick={() => setSelectedManagerProfile(stats.manager)}
                style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.01)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.01)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900, color: "#1e293b" }}>{stats.manager.name}</h4>
                  <span style={{ background: "#eff6ff", color: "#1e3a8a", padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800 }}>Manager</span>
                </div>
                <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 12px" }}>TLs: {stats.tlCount} | Recruiters: {stats.recruiterCount}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "#f8fafc", padding: "8px", borderRadius: "10px", marginBottom: "10px" }}>
                  <div>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800 }}>TOTAL LEADS</span>
                    <strong style={{ display: "block", fontSize: "1rem", color: "#0f172a" }}>{stats.totalLeads}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800 }}>WEEKLY LEADS</span>
                    <strong style={{ display: "block", fontSize: "1rem", color: "#7c3aed" }}>{stats.weeklyLeads}</strong>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800 }}>MONTHLY LEADS</span>
                    <strong style={{ display: "block", fontSize: "0.95rem", color: "#d97706" }}>{stats.monthlyLeads}</strong>
                  </div>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#475569" }}>
                  <span style={{ display: "block", color: "#64748b" }}>Dominant Domains: <strong style={{ color: "#1e293b" }}>{stats.topCategories}</strong></span>
                </div>
              </div>
            ))}
            {managerWiseSummary.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", width: "100%" }}>No managers found in the database.</div>
            )}
          </div>
        </div>
      )}

      {/* TL WISE LEADS VIEW */}
      {activeTab === "tl" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {tlWiseSummary.map(stats => (
              <div 
                key={stats.tl.id} 
                onClick={() => setSelectedTlProfile(stats.tl)}
                style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.01)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.01)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900, color: "#1e293b" }}>{stats.tl.name}</h4>
                  <span style={{ background: "#f5f3ff", color: "#7c3aed", padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800 }}>Team Lead</span>
                </div>
                <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 12px" }}>Reports Reporting: {stats.recruiterCount} Recruiters</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "#f8fafc", padding: "8px", borderRadius: "10px", marginBottom: "10px" }}>
                  <div>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800 }}>TOTAL TEAM LEADS</span>
                    <strong style={{ display: "block", fontSize: "1rem", color: "#0f172a" }}>{stats.totalLeads}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800 }}>WEEKLY LEADS</span>
                    <strong style={{ display: "block", fontSize: "1rem", color: "#7c3aed" }}>{stats.weeklyLeads}</strong>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800 }}>MONTHLY LEADS</span>
                    <strong style={{ display: "block", fontSize: "0.95rem", color: "#d97706" }}>{stats.monthlyLeads}</strong>
                  </div>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#475569" }}>
                  <span style={{ display: "block", color: "#64748b" }}>Dominating Categories: <strong style={{ color: "#2563eb" }}>{stats.topCategories}</strong></span>
                </div>
              </div>
            ))}
            {tlWiseSummary.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", width: "100%" }}>No TLs found in the database.</div>
            )}
          </div>
        </div>
      )}

      {/* RECRUITER WISE LEADS VIEW */}
      {activeTab === "recruiter" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {recruiterWiseSummary.map(stats => (
              <div 
                key={stats.recruiter.id} 
                onClick={() => setSelectedRecruiterProfile(stats.recruiter)}
                style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.01)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.01)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900, color: "#1e293b" }}>{stats.recruiter.name}</h4>
                  <span style={{ background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800 }}>Recruiter</span>
                </div>
                <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 12px" }}>{stats.recruiter.email}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "#f8fafc", padding: "8px", borderRadius: "10px", marginBottom: "10px" }}>
                  <div>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800 }}>TOTAL LEADS</span>
                    <strong style={{ display: "block", fontSize: "1rem", color: "#0f172a" }}>{stats.totalLeads}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800 }}>TODAY'S ADDED</span>
                    <strong style={{ display: "block", fontSize: "1rem", color: "#10b981" }}>{stats.todayLeads}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800 }}>WEEKLY LEADS</span>
                    <strong style={{ display: "block", fontSize: "0.95rem", color: "#7c3aed" }}>{stats.weeklyLeads}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800 }}>MONTHLY LEADS</span>
                    <strong style={{ display: "block", fontSize: "0.95rem", color: "#d97706" }}>{stats.monthlyLeads}</strong>
                  </div>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#475569" }}>
                  <span style={{ display: "block", color: "#64748b" }}>Top Lead Category: <strong style={{ color: "#7c3aed" }}>{stats.topCategory}</strong></span>
                  <span style={{ display: "block", color: "#64748b", marginTop: "2px" }}>Last Lead Added: <strong style={{ color: "#0f172a" }}>{stats.lastAddedTime}</strong></span>
                </div>
              </div>
            ))}
            {recruiterWiseSummary.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", width: "100%" }}>No recruiters found in the database.</div>
            )}
          </div>
        </div>
      )}

      {/* TEAM COMBINED LEADS VIEW */}
      {activeTab === "combined" && (
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: "0 0 10px" }}>Combined Hierarchy Sandbox Selector</h3>
            <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "0 0 15px" }}>Select multiple managers, recruiters, and team leads to generate a live, aggregated combined lead pool.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {hierarchyLists.managers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleToggleManager(m.id)}
                    style={{ padding: "5px 12px", borderRadius: "8px", border: `1.5px solid ${selectedManagers.includes(m.id) ? "#1e3a8a" : "#cbd5e1"}`, background: selectedManagers.includes(m.id) ? "#eff6ff" : "white", color: selectedManagers.includes(m.id) ? "#1e3a8a" : "#475569", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    Manager: {m.name}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {hierarchyLists.tls.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleToggleTl(t.id)}
                    style={{ padding: "5px 12px", borderRadius: "8px", border: `1.5px solid ${selectedTls.includes(t.id) ? "#4f46e5" : "#cbd5e1"}`, background: selectedTls.includes(t.id) ? "#f5f3ff" : "white", color: selectedTls.includes(t.id) ? "#4f46e5" : "#475569", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    TL: {t.name}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {hierarchyLists.recruiters.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleToggleRecruiter(r.id)}
                    style={{ padding: "5px 12px", borderRadius: "8px", border: `1.5px solid ${selectedRecruiters.includes(r.id) ? "#0ea5e9" : "#cbd5e1"}`, background: selectedRecruiters.includes(r.id) ? "#e0f2fe" : "white", color: selectedRecruiters.includes(r.id) ? "#0369a1" : "#475569", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    Recruiter: {r.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Candidate Name</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Contact Details</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Category</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Sourced By</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>TL Oversight</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Manager Oversight</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Added Date</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.slice(0, 50).map((c, idx) => (
                  <tr key={c.id || c._id} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "white" : "#fafafa" }}>
                    <td style={{ padding: "10px 12px", fontWeight: "bold", color: "#0f172a" }}>{c.name}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <strong>{c.phone}</strong>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{c.email}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ background: "#eff6ff", color: "#2563eb", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 700 }}>{c.leadInfo.categories?.join(", ")}</span>
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{c.resolvedHierarchy?.recruiterName || "N/A"}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.resolvedHierarchy?.tlName || "Direct"}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.resolvedHierarchy?.managerName || "Direct"}</td>
                    <td style={{ padding: "10px 12px" }}>{new Date(c.createdAt || c.leadInfo.movedAt).toLocaleDateString()}</td>
                    <td style={{ padding: "10px 12px", fontStyle: "italic" }}>"{c.leadInfo.remarks}"</td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>No leads combined. Select team members above to aggregate their nodes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAD CATEGORY ANALYTICS dedicated tab */}
      {activeTab === "categories" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
            {(() => {
              const catCounts: { [key: string]: { leads: number; recruiters: Set<string>; tls: Set<string>; managers: Set<string> } } = {};
              
              candidates.forEach(c => {
                c.leadInfo.categories?.forEach(cat => {
                  if (!catCounts[cat]) {
                    catCounts[cat] = { leads: 0, recruiters: new Set(), tls: new Set(), managers: new Set() };
                  }
                  catCounts[cat].leads++;
                  if (c.resolvedHierarchy?.recruiterName) catCounts[cat].recruiters.add(c.resolvedHierarchy.recruiterName);
                  if (c.resolvedHierarchy?.tlName) catCounts[cat].tls.add(c.resolvedHierarchy.tlName);
                  if (c.resolvedHierarchy?.managerName) catCounts[cat].managers.add(c.resolvedHierarchy.managerName);
                });
              });

              return Object.entries(catCounts).map(([catName, data]) => (
                <div 
                  key={catName} 
                  onClick={() => setSelectedCategoryName(catName)}
                  style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#1e293b"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900, color: "#1e293b" }}>{catName}</h4>
                    <LucideLayers size={18} color="#1e293b" />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#f8fafc", padding: "10px", borderRadius: "12px", marginBottom: "10px" }}>
                    <div>
                      <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800 }}>LEADS</span>
                      <strong style={{ display: "block", fontSize: "1.1rem", color: "#0f172a" }}>{data.leads}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800 }}>RECRUITERS</span>
                      <strong style={{ display: "block", fontSize: "1.1rem", color: "#10b981" }}>{data.recruiters.size}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800 }}>TLS ACTIVE</span>
                      <strong style={{ display: "block", fontSize: "0.95rem", color: "#7c3aed" }}>{data.tls.size}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800 }}>TREND</span>
                      <strong style={{ display: "block", fontSize: "0.85rem", color: data.leads > 5 ? "#10b981" : "#d97706" }}>
                        {data.leads > 10 ? "▲ High" : data.leads > 4 ? "● Mid" : "▼ Low"}
                      </strong>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#1e293b", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>Click to open all leads in this category →</span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* ADVANCED LEAD ANALYTICS */}
      {activeTab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", flexWrap: "wrap" }}>
          
          {/* Graph 1: Lead Growth trend */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>Lead Generation Timeline Trend</h4>
            <div style={{ height: "200px", width: "100%", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-end", padding: "10px", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px", pointerEvents: "none" }}>
                <span style={{ fontSize: "0.62rem", color: "#cbd5e1", borderBottom: "1px dashed #e2e8f0", paddingBottom: "2px" }}>Peak Generation</span>
                <span style={{ fontSize: "0.62rem", color: "#cbd5e1", borderBottom: "1px dashed #e2e8f0", paddingBottom: "2px" }}>Average Node</span>
                <span style={{ fontSize: "0.62rem", color: "#cbd5e1" }}>Baselines</span>
              </div>

              <div style={{ display: "flex", width: "100%", justifyContent: "space-around", alignItems: "flex-end", height: "100%", zIndex: 1 }}>
                {[30, 45, 60, 25, 80, 95, 65, 40, 55, 75, 90, 100].map((pct, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "8%" }}>
                    <div style={{ height: `${pct}%`, width: "100%", background: "linear-gradient(to top, #1e293b, #475569)", borderRadius: "4px" }} />
                    <span style={{ fontSize: "0.58rem", color: "#94a3b8", marginTop: "4px" }}>M{idx+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Graph 2: Recruiter contribution chart */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>Recruiter Contribution Breakdown</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recruiterWiseSummary.slice(0, 5).map((r, i) => {
                const pct = stats.totalPool > 0 ? Math.round((r.totalLeads / stats.totalPool) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                      <span>{r.recruiter.name}</span>
                      <span>{r.totalLeads} Leads ({pct}%)</span>
                    </div>
                    <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginTop: "3px" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#06b6d4", borderRadius: "4px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph 3: TL Contribution Chart */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>TL Contribution breakdown</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tlWiseSummary.slice(0, 5).map((t, i) => {
                const pct = stats.totalPool > 0 ? Math.round((t.totalLeads / stats.totalPool) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                      <span>{t.tl.name}</span>
                      <span>{t.totalLeads} Leads ({pct}%)</span>
                    </div>
                    <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginTop: "3px" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#7c3aed", borderRadius: "4px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph 4: Manager Contribution Chart */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>Manager Contribution breakdown</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {managerWiseSummary.slice(0, 5).map((m, i) => {
                const pct = stats.totalPool > 0 ? Math.round((m.totalLeads / stats.totalPool) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                      <span>{m.manager.name}</span>
                      <span>{m.totalLeads} Leads ({pct}%)</span>
                    </div>
                    <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginTop: "3px" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#1e293b", borderRadius: "4px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* DETAIL MANAGER LEAD PROFILE MODAL DRAWER */}
      <AnimatePresence>
        {selectedManagerProfile && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ background: "white", width: "500px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Manager Lead Analytics</h3>
                <button onClick={() => setSelectedManagerProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
              </div>

              {(() => {
                const mgrStats = managerWiseSummary.find(s => s.manager.id === selectedManagerProfile.id);
                if (!mgrStats) return null;

                const directTls = team.filter(t => t.role === "tl" && t.reportingTo === selectedManagerProfile.id);
                const directTlIds = directTls.map(t => t.id);
                
                const subordinates = team.filter(t => 
                  t.role === "recruiter" && (
                    t.reportingTo === selectedManagerProfile.id || 
                    (t.reportingTo !== null && directTlIds.includes(t.reportingTo))
                  )
                );

                const mgrLeads = candidates.filter(c => c.resolvedHierarchy?.managerId === selectedManagerProfile.id);

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "1rem", borderRadius: "14px", border: "1px solid #cbd5e1" }}>
                      <h4 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 900, color: "#0f172a" }}>Manager: {selectedManagerProfile.name}</h4>
                      <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "0 0 10px" }}>{selectedManagerProfile.email}</p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", borderTop: "1px dashed #cbd5e1", paddingTop: "8px", fontSize: "0.75rem" }}>
                        <div>TLs Managed: <strong>{mgrStats.tlCount}</strong></div>
                        <div>Recruiters: <strong>{mgrStats.recruiterCount}</strong></div>
                        <div>Total Leads: <strong>{mgrStats.totalLeads}</strong></div>
                      </div>
                    </div>

                    <div>
                      <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px" }}>Team Composition</h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ background: "#fafafa", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.78rem" }}>
                          <strong>Direct Team Leads:</strong>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                            {directTls.map(t => <span key={t.id} style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>{t.name}</span>)}
                            {directTls.length === 0 && <span style={{ color: "#94a3b8" }}>None</span>}
                          </div>
                        </div>
                        <div style={{ background: "#fafafa", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.78rem" }}>
                          <strong>Recruiters under Branch:</strong>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                            {subordinates.map(r => <span key={r.id} style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>{r.name}</span>)}
                            {subordinates.length === 0 && <span style={{ color: "#94a3b8" }}>None</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL TL LEAD PROFILE MODAL DRAWER */}
      <AnimatePresence>
        {selectedTlProfile && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ background: "white", width: "500px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Team Lead Lead Analytics</h3>
                <button onClick={() => setSelectedTlProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
              </div>

              {(() => {
                const tlStats = tlWiseSummary.find(s => s.tl.id === selectedTlProfile.id);
                if (!tlStats) return null;

                const subordinates = team.filter(t => t.reportingTo === selectedTlProfile.id);
                const tlLeads = candidates.filter(c => c.resolvedHierarchy?.tlId === selectedTlProfile.id);

                const contributorTable = subordinates.map(rec => {
                  const recLeads = tlLeads.filter(c => c.resolvedHierarchy?.recruiterId === rec.id);
                  return {
                    name: rec.name,
                    total: recLeads.length,
                    today: recLeads.filter(c => new Date(c.createdAt || c.leadInfo.movedAt).toDateString() === new Date().toDateString()).length,
                    monthly: recLeads.filter(c => new Date(c.createdAt || c.leadInfo.movedAt).getMonth() === new Date().getMonth()).length
                  };
                }).sort((a,b) => b.total - a.total);

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #edd8ff 100%)", padding: "1rem", borderRadius: "14px", border: "1px solid #ddd6fe" }}>
                      <h4 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 900, color: "#1e1b4b" }}>TL: {selectedTlProfile.name}</h4>
                      <p style={{ color: "#4f46e5", fontSize: "0.8rem", margin: "0 0 10px" }}>Hierarchy Level: Team Lead Node</p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", borderTop: "1px dashed #c084fc", paddingTop: "8px", fontSize: "0.75rem", color: "#1e1b4b" }}>
                        <div>Recruiters: <strong>{tlStats.recruiterCount}</strong></div>
                        <div>Total Leads: <strong>{tlStats.totalLeads}</strong></div>
                        <div>Monthly Sourced: <strong>{tlStats.monthlyLeads}</strong></div>
                      </div>
                    </div>

                    <div>
                      <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px" }}>Recruiter Contribution roster</h5>
                      <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.75rem" }}>
                          <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
                              <th style={{ padding: "8px", fontWeight: 700 }}>Recruiter</th>
                              <th style={{ padding: "8px", fontWeight: 700 }}>Total</th>
                              <th style={{ padding: "8px", fontWeight: 700 }}>Today</th>
                              <th style={{ padding: "8px", fontWeight: 700 }}>Monthly</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contributorTable.map((row, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "8px", fontWeight: "bold" }}>{row.name}</td>
                                <td style={{ padding: "8px" }}>{row.total}</td>
                                <td style={{ padding: "8px", color: "#10b981", fontWeight: 600 }}>{row.today}</td>
                                <td style={{ padding: "8px" }}>{row.monthly}</td>
                              </tr>
                            ))}
                            {contributorTable.length === 0 && (
                              <tr>
                                <td colSpan={4} style={{ textAlign: "center", padding: "10px", color: "#94a3b8" }}>No recruiters mapped to this TL.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL RECRUITER LEAD PROFILE MODAL DRAWER */}
      <AnimatePresence>
        {selectedRecruiterProfile && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ background: "white", width: "480px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Recruiter Lead Profile</h3>
                <button onClick={() => setSelectedRecruiterProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
              </div>

              {(() => {
                const recStats = recruiterWiseSummary.find(s => s.recruiter.id === selectedRecruiterProfile.id);
                if (!recStats) return null;

                const recLeads = candidates.filter(c => c.resolvedHierarchy?.recruiterId === selectedRecruiterProfile.id);

                const catCounts: { [key: string]: number } = {};
                recLeads.forEach(c => {
                  c.leadInfo.categories?.forEach(cat => catCounts[cat] = (catCounts[cat] || 0) + 1);
                });

                let convertedCount = 0;
                let activeCount = 0;
                let followUpCount = 0;
                recLeads.forEach(c => {
                  const status = (c.remarks || "").toLowerCase();
                  if (status.includes("joined") || status.includes("hired")) convertedCount++;
                  else if (status.includes("rejected") || status.includes("not interested")) {}
                  else {
                    activeCount++;
                    if (status.includes("call") || status.includes("pending") || status.includes("later")) followUpCount++;
                  }
                });

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "1rem", borderRadius: "14px", border: "1px solid #cbd5e1" }}>
                      <h4 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 900, color: "#0f172a" }}>{selectedRecruiterProfile.name}</h4>
                      <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 10px" }}>Supervisor: <strong style={{ color: "#4f46e5" }}>{selectedRecruiterProfile.manager_tl?.name || "Direct to Manager"}</strong></p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.75rem", borderTop: "1px solid #cbd5e1", paddingTop: "8px" }}>
                        <div>Total Leads: <strong style={{ color: "#0f172a" }}>{recStats.totalLeads}</strong></div>
                        <div>Today's Added: <strong style={{ color: "#10b981" }}>{recStats.todayLeads}</strong></div>
                        <div>Weekly Sourced: <strong style={{ color: "#7c3aed" }}>{recStats.weeklyLeads}</strong></div>
                        <div>Monthly Sourced: <strong style={{ color: "#d97706" }}>{recStats.monthlyLeads}</strong></div>
                        <div style={{ gridColumn: "span 2" }}>Last Lead added: <strong style={{ color: "#334155" }}>{recStats.lastAddedTime}</strong></div>
                      </div>
                    </div>

                    <div>
                      <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px" }}>Category lead distribution</h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {Object.entries(catCounts).map(([cat, count]) => (
                          <div key={cat} style={{ background: "#fafafa", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                            <span style={{ fontWeight: 600, color: "#475569" }}>{cat}</span>
                            <strong style={{ color: "#1e293b" }}>{count} leads</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC CATEGORY VIEWS MODAL DRAWER */}
      <AnimatePresence>
        {selectedCategoryName && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ background: "white", width: "500px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Category: {selectedCategoryName}</h3>
                <button onClick={() => setSelectedCategoryName(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {candidates.filter(c => c.leadInfo.categories?.includes(selectedCategoryName)).map(c => (
                  <div key={c.id || c._id} style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#0f172a", fontSize: "0.85rem" }}>{c.name}</strong>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{c.phone}</span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "4px" }}>
                      Sourced by: <strong>{c.resolvedHierarchy?.recruiterName || c.recruiterName}</strong> under <strong>{c.resolvedHierarchy?.tlName || "Direct"}</strong>
                    </div>
                    <div style={{ fontSize: "0.72rem", fontStyle: "italic", background: "#fffbeb", padding: "4px 8px", borderRadius: "6px", marginTop: "6px", color: "#92400e" }}>
                      "{c.leadInfo.remarks}"
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE DETAILED LEAD SIDEBAR PROFILE DRAWERS */}
      <AnimatePresence>
        {selectedLead && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ background: "white", width: "420px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #cbd5e1", paddingBottom: "10px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    <LucideDatabase size={18} color="#1e293b" />
                    Lead Profile Details
                  </h3>
                  <button onClick={() => setSelectedLead(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
                </div>

                <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "1rem", borderRadius: "14px", border: "1px solid #cbd5e1", marginBottom: "1rem" }}>
                  <h4 style={{ margin: "0 0 2px", fontSize: "1.1rem", fontWeight: 800 }}>{selectedLead.name}</h4>
                  <div style={{ color: "#1e293b", fontWeight: 700, fontSize: "0.75rem" }}>{selectedLead.jobRole || selectedLead.designation || "Prospect lead"}</div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.75rem", borderTop: "1px solid #cbd5e1", marginTop: "8px", paddingTop: "8px", color: "#334155" }}>
                    <div>Phone: <strong>{selectedLead.phone}</strong></div>
                    <div>Email: <strong>{selectedLead.email || "N/A"}</strong></div>
                    <div>Location: <strong>{selectedLead.city ? `${selectedLead.city}, ${selectedLead.state}` : selectedLead.state || "N/A"}</strong></div>
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <h5 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Lead Category Mappings</h5>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {selectedLead.leadInfo.categories?.map((cat, i) => (
                      <span key={i} style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "3px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800 }}>{cat}</span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <h5 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Recruiter Remarks</h5>
                  <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "10px", borderRadius: "10px", color: "#92400e", fontSize: "0.78rem", fontStyle: "italic" }}>
                    "{selectedLead.leadInfo.remarks}"
                  </div>
                </div>

                <div>
                  <h5 style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>System Audit Metadata</h5>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "10px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.72rem" }}>
                    <div>Sourced Recruiter: <strong style={{ display: "block" }}>{selectedLead.resolvedHierarchy?.recruiterName || selectedLead.recruiterName || "N/A"}</strong></div>
                    <div>Reporting TL: <strong style={{ display: "block" }}>{selectedLead.resolvedHierarchy?.tlName || selectedLead.reportingPerson || "Direct"}</strong></div>
                    <div>Reporting Manager: <strong style={{ display: "block" }}>{selectedLead.resolvedHierarchy?.managerName || "Direct"}</strong></div>
                    <div>Date Added: <strong style={{ display: "block" }}>{new Date(selectedLead.createdAt || selectedLead.leadInfo.movedAt).toLocaleDateString()}</strong></div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
