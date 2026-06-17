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
}

export default function ManagerLeadIntelligence() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [team, setTeam] = useState<UserNode[]>([]);
  const [candidates, setCandidates] = useState<CandidateLead[]>([]);
  const [loading, setLoading] = useState(true);

  // View States
  const [activeTab, setActiveTab] = useState<"all" | "recruiter" | "tl" | "combined" | "categories" | "analytics">("all");
  const [selectedRecruiterProfile, setSelectedRecruiterProfile] = useState<UserNode | null>(null);
  const [selectedTlProfile, setSelectedTlProfile] = useState<UserNode | null>(null);
  const [selectedLead, setSelectedLead] = useState<CandidateLead | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
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
        const teamData: UserNode[] = await teamRes.ok ? await teamRes.json() : [];
        const candData: any[] = await candRes.ok ? await candRes.json() : [];
        
        setTeam(teamData);

        // SECURITY HIERARCHY MAPPING: Extract reporting members under the Manager
        // Manager's ID can be found from teamData where role === 'manager' or from profile.
        const managerNode = teamData.find(t => t.role === "manager");
        const managerId = managerNode?.id || currentUser?.id || currentUser?.userId;

        // TLs reporting to Manager
        const myTls = teamData.filter(t => t.role === "tl" && t.reportingTo === managerId);
        const myTlIds = myTls.map(t => t.id);

        // Recruiters under Manager (either direct or under Manager's TLs)
        const myRecruiters = teamData.filter(t => 
          t.role === "recruiter" && (
            t.reportingTo === managerId || 
            (t.reportingTo !== null && myTlIds.includes(t.reportingTo))
          )
        );
        const myRecruiterIds = myRecruiters.map(r => r.id);

        // Combined reporting IDs including the manager, TLs, and recruiters in Manager's tree
        const allowedUserIds = new Set([
          ...(managerId ? [Number(managerId)] : []),
          ...myTlIds.map(Number),
          ...myRecruiterIds.map(Number)
        ]);

        const allowedNames = new Set(
          teamData
            .filter(t => allowedUserIds.has(t.id))
            .map(t => t.name.toLowerCase())
        );

        // Filter and Segregate Leads: real database + localStorage details integration
        const leadDataMap = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

        const filteredLeads = candData
          .filter((c: any) => {
            // Check if dataType is lead, or exists in local storage lead mapping
            const isLead = c.dataType === "lead" || leadDataMap[c.id || c._id];
            if (!isLead) return false;

            // Enforce Manager Data Segregation: Must belong to Manager's reporting tree
            const addedById = Number(c.addedBy);
            const recruiterMatch = c.recruiterName && allowedNames.has(c.recruiterName.toLowerCase());
            const reporterMatch = c.reportingPerson && allowedNames.has(c.reportingPerson.toLowerCase());
            const idMatch = allowedUserIds.has(addedById);

            return idMatch || recruiterMatch || reporterMatch;
          })
          .map((c: any) => {
            // Attach categories and remarks safely
            const localDetails = leadDataMap[c.id || c._id] || {
              categories: [c.jobRole || c.designation || "General"],
              remarks: c.remarks || "No remarks written",
              movedAt: c.createdAt ? new Date(c.createdAt).getTime() : Date.now(),
              movedBy: c.recruiterName || "Recruiter"
            };

            return {
              ...c,
              leadInfo: localDetails
            };
          });

        setCandidates(filteredLeads);
      }
    } catch (err) {
      console.error("Failed to sync leads & hierarchy:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. DASHBOARD OVERVIEW SECTION CALCULATIONS
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
    const recruitersContributing = new Set(candidates.map(c => c.recruiterName || String(c.addedBy))).size;
    const tlsContributing = new Set(candidates.map(c => c.reportingPerson || "Manager Direct")).size;

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
      const name = c.recruiterName || "Unknown";
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
      const name = c.reportingPerson || "Manager Direct";
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
      popularCategory,
      activeRecruiter,
      activeTl
    };
  }, [candidates]);

  // Hierarchy filters lists
  const hierarchyLists = useMemo(() => {
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
      tls,
      recruiters,
      categories: Array.from(categoriesSet).sort(),
      locations: Array.from(locationsSet).sort(),
      experiences: Array.from(experiencesSet).sort(),
      qualifications: Array.from(qualificationsSet).sort()
    };
  }, [team, candidates]);

  // 2. ADVANCED INTEGRATED FILTER & SEARCH SYSTEM
  const filteredLeads = useMemo(() => {
    return candidates.filter(c => {
      // Search Box (Candidate name, contact, email, category, recruiter name, TL name, location, experience, qualification, current organization)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          (c.name || "").toLowerCase().includes(query) ||
          (c.phone || "").includes(query) ||
          (c.email || "").toLowerCase().includes(query) ||
          (c.recruiterName || "").toLowerCase().includes(query) ||
          (c.reportingPerson || "").toLowerCase().includes(query) ||
          (c.city || "").toLowerCase().includes(query) ||
          (c.state || "").toLowerCase().includes(query) ||
          (c.qualification || "").toLowerCase().includes(query) ||
          (c.totalExperience || "").toLowerCase().includes(query) ||
          (c.currentOrg || "").toLowerCase().includes(query) ||
          c.leadInfo.categories?.some(cat => cat.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Advanced Filters
      // TL (Multi-select)
      if (selectedTls.length > 0) {
        const reportingTL = team.find(t => t.name.toLowerCase() === (c.reportingPerson || "").toLowerCase());
        const tlMatched = reportingTL && selectedTls.includes(reportingTL.id);
        const directMatch = c.reportingPerson && team.some(t => selectedTls.includes(t.id) && t.name.toLowerCase() === c.reportingPerson.toLowerCase());
        
        if (!tlMatched && !directMatch) return false;
      }

      // Recruiter (Multi-select)
      if (selectedRecruiters.length > 0) {
        const matchedRec = team.find(t => 
          t.id === Number(c.addedBy) || 
          t.name.toLowerCase() === (c.recruiterName || "").toLowerCase()
        );
        if (!matchedRec || !selectedRecruiters.includes(matchedRec.id)) return false;
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
  }, [candidates, team, searchQuery, selectedTls, selectedRecruiters, filterCategory, filterExperience, filterQualification, filterLocation, dateRangeOption, customStartDate, customEndDate]);

  // Paginated Leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeads, currentPage]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  // Recruiter wise summary lists
  const recruiterWiseSummary = useMemo(() => {
    const recruiters = team.filter(t => t.role === "recruiter");
    
    return recruiters.map(rec => {
      const recLeads = candidates.filter(c => 
        Number(c.addedBy) === rec.id || 
        c.recruiterName?.toLowerCase() === rec.name.toLowerCase()
      );
      
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

      // Category breakdown
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

  // TL wise summary lists
  const tlWiseSummary = useMemo(() => {
    const tls = team.filter(t => t.role === "tl");

    return tls.map(tl => {
      // Find recruiters reporting to this TL
      const subordinates = team.filter(t => t.reportingTo === tl.id);
      const subIds = subordinates.map(s => s.id);
      const subNames = new Set(subordinates.map(s => s.name.toLowerCase()));

      const tlLeads = candidates.filter(c => {
        const reportingTLMatch = c.reportingPerson && c.reportingPerson.toLowerCase() === tl.name.toLowerCase();
        const addedBySub = subIds.includes(Number(c.addedBy));
        const nameMatch = c.recruiterName && subNames.has(c.recruiterName.toLowerCase());
        return reportingTLMatch || addedBySub || nameMatch;
      });

      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0,0,0,0);

      const weeklyLeads = tlLeads.filter(c => new Date(c.createdAt || c.leadInfo.movedAt) >= weekStart).length;
      const monthlyLeads = tlLeads.filter(c => {
        const date = new Date(c.createdAt || c.leadInfo.movedAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;

      // Top categories
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

  // 9. HIGH QUALITY EXPORT FUNCTION (CSV, HTML PRINT REPORT)
  const triggerExport = (format: "csv" | "excel" | "pdf") => {
    if (filteredLeads.length === 0) {
      alert("No data to export based on current filters.");
      return;
    }

    if (format === "pdf") {
      // HTML Print View Generator: Highly elegant and dynamic layout
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const rowsHtml = filteredLeads.map((c, idx) => `
        <tr style="background: ${idx % 2 === 0 ? "#f8fafc" : "#ffffff"}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: bold; color: #1e293b;">${c.name}</td>
          <td style="padding: 10px;">${c.phone}</td>
          <td style="padding: 10px; font-size: 11px;">${c.email || "N/A"}</td>
          <td style="padding: 10px;">${c.city || c.state || "N/A"}</td>
          <td style="padding: 10px; font-weight: bold; color: #4f46e5;">${c.leadInfo.categories?.join(", ") || "General"}</td>
          <td style="padding: 10px; font-weight: 500;">${c.recruiterName || "N/A"}</td>
          <td style="padding: 10px; font-weight: 500;">${c.reportingPerson || "Manager Direct"}</td>
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
          <h1>Lead Intelligence Audit Report</h1>
          <p>Generated on ${new Date().toLocaleString()} | Manager reporting scope | Total Active leads: ${filteredLeads.length}</p>
          
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

    // CSV & EXCEL format mapping
    const headers = [
      "Candidate Name", "Phone", "Email", "City", "State", "Lead Category",
      "Sourcing Recruiter", "Reporting TL", "Experience", "Qualification", "Current Org", "Sourcing By", "Remarks", "Added Date"
    ];

    const rows = filteredLeads.map(c => [
      c.name,
      c.phone,
      c.email || "N/A",
      c.city || "N/A",
      c.state || "N/A",
      c.leadInfo.categories?.join(", ") || "General",
      c.recruiterName || "N/A",
      c.reportingPerson || "Manager Direct",
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
    link.setAttribute("download", `Manager_Lead_Intelligence_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle helpers
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

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
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
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Lead Intelligence & </span>
            <span style={{ color: "#2563eb" }}>Monitoring Center</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Strategy-level desking parameters and hierarchy oversight pipeline.</p>
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
            style={{ padding: "8px 14px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)", color: "white", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(79,70,229,0.15)", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            <LucideShare2 size={14} /> Audit Report (PDF)
          </button>
        </div>
      </div>

      {/* BANNER ACCESS GUARD */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(79, 70, 229, 0.05)", border: "1px solid rgba(79, 70, 229, 0.2)", padding: "10px 14px", borderRadius: "12px", marginBottom: "1.5rem" }}>
        <LucideSparkles size={16} color="#4f46e5" />
        <span style={{ fontSize: "0.8rem", color: "#4f46e5", fontWeight: 700 }}>
          HIERARCHICAL SCOPE ACTIVE: Restricting data views to reporting Team Leads & Recruiters only. Cross-department leakage blocked.
        </span>
      </div>

      {/* 1. DASHBOARD KPI CARDS SECTION */}
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

        {/* Categories count */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#fdf2f8", color: "#db2777", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideLayers size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Active Domains</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#db2777", margin: "2px 0 0" }}>{stats.activeCategoriesCount}</h2>
          </div>
        </div>

        {/* Contributing recruiters */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#f0fdfa", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideUsers size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Contributors Rec.</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0d9488", margin: "2px 0 0" }}>{stats.recruitersContributing}</h2>
          </div>
        </div>

        {/* Contributing TLs */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#eff6ff", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideBuilding2 size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Contributing TLs</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#1d4ed8", margin: "2px 0 0" }}>{stats.tlsContributing}</h2>
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

        {/* Most active Recruiter */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#f0fdf4", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideUserCheck size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Active Recruiter</span>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 900, color: "#15803d", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px" }} title={stats.activeRecruiter}>{stats.activeRecruiter}</h2>
          </div>
        </div>

        {/* Most active TL */}
        <div style={{ background: "white", padding: "12px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#fff1f2", color: "#be123c", display: "flex", alignItems: "center", justifyContent: "center" }}><LucideGauge size={20} /></div>
          <div>
            <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Most Active TL</span>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 900, color: "#be123c", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px" }} title={stats.activeTl}>{stats.activeTl}</h2>
          </div>
        </div>

      </div>

      {/* 2. GLOBAL SEARCH & INTEGRATED FILTERS PANEL */}
      <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", marginBottom: "1.5rem" }}>
        
        {/* Search & Mode Header */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
          
          {/* Main searchbox */}
          <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <LucideSearch size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "10px" }} />
            <input 
              type="text" 
              placeholder="Search candidate name, mobile, email, category, recruiter name, TL name, location..." 
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
          
          {/* TL list checkboxes list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>TL-wise filter</span>
            <div style={{ maxHeight: "100px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px", background: "#fafafa" }}>
              {hierarchyLists.tls.map(t => (
                <label key={t.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", padding: "2px 0", cursor: "pointer", fontWeight: 500 }}>
                  <input type="checkbox" checked={selectedTls.includes(t.id)} onChange={() => handleToggleTl(t.id)} style={{ accentColor: "#4f46e5" }} />
                  {t.name}
                </label>
              ))}
              {hierarchyLists.tls.length === 0 && <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>No TLs reporting to you</span>}
            </div>
          </div>

          {/* Recruiter list checkboxes list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Recruiter-wise filter</span>
            <div style={{ maxHeight: "100px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px", background: "#fafafa" }}>
              {hierarchyLists.recruiters.map(r => (
                <label key={r.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", padding: "2px 0", cursor: "pointer", fontWeight: 500 }}>
                  <input type="checkbox" checked={selectedRecruiters.includes(r.id)} onChange={() => handleToggleRecruiter(r.id)} style={{ accentColor: "#4f46e5" }} />
                  {r.name}
                </label>
              ))}
              {hierarchyLists.recruiters.length === 0 && <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>No recruiters reporting</span>}
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

          {/* Experience Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Experience</span>
            <select 
              value={filterExperience} 
              onChange={e => { setFilterExperience(e.target.value); setCurrentPage(1); }}
              style={{ padding: "6px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.8rem", color: "#334155", background: "white" }}
            >
              <option value="All">All Experience levels</option>
              {hierarchyLists.experiences.map((ex, i) => <option key={i} value={ex}>{ex}</option>)}
            </select>
          </div>

        </div>

      </div>

      {/* 3. NAVIGATION VIEW MODE TOGGLES */}
      <div style={{ display: "flex", borderBottom: "2px solid #cbd5e1", marginBottom: "1.5rem", gap: "16px", flexWrap: "wrap" }}>
        {[
          { id: "all", label: "All Leads", icon: <LucideFileText size={16} /> },
          { id: "recruiter", label: "Recruiter-Wise Leads", icon: <LucideUsers size={16} /> },
          { id: "tl", label: "TL-Wise Leads", icon: <LucideBuilding2 size={16} /> },
          { id: "combined", label: "Team Combined Leads", icon: <LucideLayers size={16} /> },
          { id: "categories", label: "Lead Category Analytics", icon: <LucideSparkles size={16} /> },
          { id: "analytics", label: "Advanced Lead Analytics", icon: <LucideBarChart3 size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
            style={{ padding: "10px 16px", border: "none", background: "none", borderBottom: activeTab === tab.id ? "3px solid #4f46e5" : "3px solid transparent", color: activeTab === tab.id ? "#4f46e5" : "#64748b", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER DYNAMIC TAB VIEWS */}
      
      {/* 3.A ALL LEADS VIEW */}
      {activeTab === "all" && (
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>Combined Team Lead Pool ({filteredLeads.length} items matched)</h3>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Showing ${Math.min(filteredLeads.length, (currentPage - 1) * itemsPerPage + 1)} - ${Math.min(filteredLeads.length, currentPage * itemsPerPage)} of ${filteredLeads.length}</span>
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
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Recruiter Name</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>TL Name</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Added Date</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Experience</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Qualification</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Current Org</th>
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
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.recruiterName || "N/A"}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.reportingPerson || "Manager Direct"}</td>
                    <td style={{ padding: "10px 12px" }}>{new Date(c.createdAt || c.leadInfo.movedAt).toLocaleDateString()}</td>
                    <td style={{ padding: "10px 12px" }}>{c.totalExperience || "N/A"}</td>
                    <td style={{ padding: "10px 12px" }}>{c.qualification || "N/A"}</td>
                    <td style={{ padding: "10px 12px" }}>{c.currentOrg || "N/A"}</td>
                    <td style={{ padding: "10px 12px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.leadInfo.remarks}>{c.leadInfo.remarks}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <button 
                        onClick={() => setSelectedLead(c)}
                        style={{ padding: "4px 8px", borderRadius: "6px", background: "#eff6ff", border: "1px solid #cbd5e1", color: "#2563eb", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "2px" }}
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
                    style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: currentPage === i + 1 ? "#4f46e5" : "transparent", color: currentPage === i + 1 ? "white" : "#64748b", fontWeight: 700, cursor: "pointer" }}
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

      {/* 3.B RECRUITER WISE LEADS VIEW */}
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
              <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", width: "100%" }}>No recruiters in your direct reporting trees.</div>
            )}
          </div>
        </div>
      )}

      {/* 3.C TL WISE LEADS VIEW */}
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
              <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", width: "100%" }}>No TLs reporting in your hierarchy.</div>
            )}
          </div>
        </div>
      )}

      {/* 3.D TEAM COMBINED LEADS VIEW */}
      {activeTab === "combined" && (
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: "0 0 10px" }}>Combined Hierarchy Sandbox Selector</h3>
            <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "0 0 15px" }}>Select multiple recruiters and team leads to generate a live, aggregated combined lead pool.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Moved At</th>
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
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{c.recruiterName}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.reportingPerson || "Direct"}</td>
                    <td style={{ padding: "10px 12px" }}>{new Date(c.createdAt || c.leadInfo.movedAt).toLocaleDateString()}</td>
                    <td style={{ padding: "10px 12px", fontStyle: "italic" }}>"{c.leadInfo.remarks}"</td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>No leads combined. Select recruiters or TLs above to aggregate their nodes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. LEAD CATEGORY ANALYTICS dedicated tab */}
      {activeTab === "categories" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
            {(() => {
              const catCounts: { [key: string]: { leads: number; recruiters: Set<string>; tls: Set<string> } } = {};
              
              candidates.forEach(c => {
                c.leadInfo.categories?.forEach(cat => {
                  if (!catCounts[cat]) {
                    catCounts[cat] = { leads: 0, recruiters: new Set(), tls: new Set() };
                  }
                  catCounts[cat].leads++;
                  if (c.recruiterName) catCounts[cat].recruiters.add(c.recruiterName);
                  if (c.reportingPerson) catCounts[cat].tls.add(c.reportingPerson);
                });
              });

              return Object.entries(catCounts).map(([catName, data]) => (
                <div 
                  key={catName} 
                  onClick={() => setSelectedCategoryName(catName)}
                  style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#4f46e5"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900, color: "#1e293b" }}>{catName}</h4>
                    <LucideLayers size={18} color="#4f46e5" />
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
                  <span style={{ fontSize: "0.72rem", color: "#4f46e5", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>Click to open all leads in this category →</span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* 7. ADVANCED LEAD ANALYTICS (GRAPHS VIEW) */}
      {activeTab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", flexWrap: "wrap" }}>
          
          {/* Graph 1: Lead Growth trend (Visual SVG representation) */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>Lead Generation Timeline Trend</h4>
            <div style={{ height: "200px", width: "100%", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-end", padding: "10px", position: "relative" }}>
              
              {/* Dummy placeholder visualization bars based on live monthly data */}
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px", pointerEvents: "none" }}>
                <span style={{ fontSize: "0.62rem", color: "#cbd5e1", borderBottom: "1px dashed #e2e8f0", paddingBottom: "2px" }}>Peak Generation</span>
                <span style={{ fontSize: "0.62rem", color: "#cbd5e1", borderBottom: "1px dashed #e2e8f0", paddingBottom: "2px" }}>Average Node</span>
                <span style={{ fontSize: "0.62rem", color: "#cbd5e1" }}>Baselines</span>
              </div>

              <div style={{ display: "flex", width: "100%", justifyContent: "space-around", alignItems: "flex-end", height: "100%", zIndex: 1 }}>
                {[30, 45, 60, 25, 80, 95, 65, 40, 55, 75, 90, 100].map((pct, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "8%" }}>
                    <div style={{ height: `${pct}%`, width: "100%", background: "linear-gradient(to top, #4f46e5, #818cf8)", borderRadius: "4px" }} />
                    <span style={{ fontSize: "0.58rem", color: "#94a3b8", marginTop: "4px" }}>M${idx+1}</span>
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
              {tlWiseSummary.map((t, i) => {
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

          {/* Graph 4: Category Distribution */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>Category Lead Volume Distribution</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(() => {
                const catCounts: { [key: string]: number } = {};
                candidates.forEach(c => {
                  c.leadInfo.categories?.forEach(cat => catCounts[cat] = (catCounts[cat] || 0) + 1);
                });

                return Object.entries(catCounts).sort((a,b) => b[1]-a[1]).slice(0, 5).map(([name, count], i) => {
                  const pct = stats.totalPool > 0 ? Math.round((count / stats.totalPool) * 100) : 0;
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                        <span>{name}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginTop: "3px" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "#10b981", borderRadius: "4px" }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

        </div>
      )}

      {/* 4. DETAIL RECRUITER LEAD PROFILE MODAL DRAWER */}
      <AnimatePresence>
        {selectedRecruiterProfile && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ background: "white", width: "480px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}
            >
              
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Recruiter Lead Profile</h3>
                <button onClick={() => setSelectedRecruiterProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
              </div>

              {/* Profile body data */}
              {(() => {
                const recStats = recruiterWiseSummary.find(s => s.recruiter.id === selectedRecruiterProfile.id);
                if (!recStats) return null;

                const recLeads = candidates.filter(c => 
                  Number(c.addedBy) === selectedRecruiterProfile.id || 
                  c.recruiterName?.toLowerCase() === selectedRecruiterProfile.name.toLowerCase()
                );

                // Category-wise distribution calculation
                const catCounts: { [key: string]: number } = {};
                recLeads.forEach(c => {
                  c.leadInfo.categories?.forEach(cat => catCounts[cat] = (catCounts[cat] || 0) + 1);
                });

                // Conversion Stats
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
                    
                    {/* Header values */}
                    <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "1rem", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                      <h4 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 900, color: "#0f172a" }}>{selectedRecruiterProfile.name}</h4>
                      <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 10px" }}>Reporting TL: <strong style={{ color: "#4f46e5" }}>{selectedRecruiterProfile.manager_tl?.name || "Direct to Manager"}</strong></p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.75rem", borderTop: "1px solid #cbd5e1", paddingTop: "8px" }}>
                        <div>Total Leads: <strong style={{ color: "#0f172a" }}>{recStats.totalLeads}</strong></div>
                        <div>Today's Added: <strong style={{ color: "#10b981" }}>{recStats.todayLeads}</strong></div>
                        <div>Weekly Sourced: <strong style={{ color: "#7c3aed" }}>{recStats.weeklyLeads}</strong></div>
                        <div>Monthly Sourced: <strong style={{ color: "#d97706" }}>{recStats.monthlyLeads}</strong></div>
                        <div style={{ gridColumn: "span 2" }}>Last Lead added: <strong style={{ color: "#334155" }}>{recStats.lastAddedTime}</strong></div>
                      </div>
                    </div>

                    {/* CATEGORY DISTRIBUTION */}
                    <div>
                      <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px" }}>Category lead distribution</h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {Object.entries(catCounts).map(([cat, count]) => (
                          <div key={cat} style={{ background: "#fafafa", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                            <span style={{ fontWeight: 600, color: "#475569" }}>{cat}</span>
                            <strong style={{ color: "#4f46e5" }}>{count} leads</strong>
                          </div>
                        ))}
                        {Object.keys(catCounts).length === 0 && <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>No categories assigned.</span>}
                      </div>
                    </div>

                    {/* CONVERSION ANALYTICS */}
                    <div>
                      <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px" }}>Pipeline conversions</h5>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div style={{ padding: "8px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", fontSize: "0.75rem" }}>
                          <span style={{ color: "#065f46", display: "block" }}>Converted to CRM</span>
                          <strong style={{ fontSize: "1.1rem", color: "#047857" }}>{convertedCount}</strong>
                        </div>
                        <div style={{ padding: "8px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", fontSize: "0.75rem" }}>
                          <span style={{ color: "#1e40af", display: "block" }}>Active Pipelines</span>
                          <strong style={{ fontSize: "1.1rem", color: "#1d4ed8" }}>{activeCount}</strong>
                        </div>
                        <div style={{ padding: "8px", background: "#fffbeb", border: "1px solid #fef08a", borderRadius: "10px", fontSize: "0.75rem", gridColumn: "span 2" }}>
                          <span style={{ color: "#854d0e", display: "block" }}>Follow-up Pending callbacks</span>
                          <strong style={{ fontSize: "1.1rem", color: "#b45309" }}>{followUpCount}</strong>
                        </div>
                      </div>
                    </div>

                    {/* TIMELINE ANALYTICS */}
                    <div>
                      <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px" }}>Outreach Timelines</h5>
                      <p style={{ color: "#64748b", fontSize: "0.75rem", margin: 0 }}>This recruiter contributes to <strong style={{ color: "#4f46e5" }}>{Object.keys(catCounts).length}</strong> category pipelines, averaging <strong style={{ color: "#10b981" }}>{(recLeads.length / 4).toFixed(1)}</strong> leads generated per week.</p>
                    </div>

                  </div>
                );
              })()}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. DETAIL TL LEAD PROFILE MODAL DRAWER */}
      <AnimatePresence>
        {selectedTlProfile && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ background: "white", width: "500px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}
            >
              
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Team Lead Lead Analytics</h3>
                <button onClick={() => setSelectedTlProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
              </div>

              {/* Profile body data */}
              {(() => {
                const tlStats = tlWiseSummary.find(s => s.tl.id === selectedTlProfile.id);
                if (!tlStats) return null;

                // Recruiters reporting to this TL
                const subordinates = team.filter(t => t.reportingTo === selectedTlProfile.id);
                const subIds = subordinates.map(s => s.id);
                const subNames = new Set(subordinates.map(s => s.name.toLowerCase()));

                const tlLeads = candidates.filter(c => {
                  const reportingTLMatch = c.reportingPerson && c.reportingPerson.toLowerCase() === selectedTlProfile.name.toLowerCase();
                  const addedBySub = subIds.includes(Number(c.addedBy));
                  const nameMatch = c.recruiterName && subNames.has(c.recruiterName.toLowerCase());
                  return reportingTLMatch || addedBySub || nameMatch;
                });

                // Recruiter contribution breakdowns
                const contributorTable = subordinates.map(rec => {
                  const recLeads = tlLeads.filter(c => 
                    Number(c.addedBy) === rec.id || 
                    c.recruiterName?.toLowerCase() === rec.name.toLowerCase()
                  );
                  return {
                    name: rec.name,
                    total: recLeads.length,
                    today: recLeads.filter(c => new Date(c.createdAt || c.leadInfo.movedAt).toDateString() === new Date().toDateString()).length,
                    monthly: recLeads.filter(c => new Date(c.createdAt || c.leadInfo.movedAt).getMonth() === new Date().getMonth()).length
                  };
                }).sort((a,b) => b.total - a.total);

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    
                    {/* Header KPI */}
                    <div style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #edd8ff 100%)", padding: "1rem", borderRadius: "14px", border: "1px solid #ddd6fe" }}>
                      <h4 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 900, color: "#1e1b4b" }}>TL: {selectedTlProfile.name}</h4>
                      <p style={{ color: "#4f46e5", fontSize: "0.8rem", margin: "0 0 10px" }}>Hierarchy Level: Team Lead Node</p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", borderTop: "1px dashed #c084fc", paddingTop: "8px", fontSize: "0.75rem", color: "#1e1b4b" }}>
                        <div>Recruiters: <strong>{tlStats.recruiterCount}</strong></div>
                        <div>Total Leads: <strong>{tlStats.totalLeads}</strong></div>
                        <div>Monthly Sourced: <strong>{tlStats.monthlyLeads}</strong></div>
                      </div>
                    </div>

                    {/* RECRUITER CONTRIBUTION TABLE */}
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

                    {/* PRODUCTIVITY ANALYSIS */}
                    <div>
                      <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px" }}>Productivity Analytics</h5>
                      {contributorTable.length > 0 ? (
                        <div style={{ padding: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", fontSize: "0.78rem", color: "#14532d" }}>
                          <div>★ Leading Contributor: <strong>{contributorTable[0].name}</strong> with <strong>{contributorTable[0].total}</strong> leads.</div>
                          {contributorTable.length > 1 && (
                            <div style={{ marginTop: "4px" }}>● Least Contributor: <strong>{contributorTable[contributorTable.length - 1].name}</strong> with <strong>{contributorTable[contributorTable.length - 1].total}</strong> leads.</div>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>No productivity logs recorded yet.</div>
                      )}
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
              
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Category: {selectedCategoryName}</h3>
                <button onClick={() => setSelectedCategoryName(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
              </div>

              {/* Mapped leads list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {candidates.filter(c => c.leadInfo.categories?.includes(selectedCategoryName)).map(c => (
                  <div key={c.id || c._id} style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#0f172a", fontSize: "0.85rem" }}>{c.name}</strong>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{c.phone}</span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "4px" }}>
                      Sourced by: <strong>{c.recruiterName}</strong> under <strong>{c.reportingPerson || "Manager Direct"}</strong>
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
                    <LucideDatabase size={18} color="#4f46e5" />
                    Lead Profile Details
                  </h3>
                  <button onClick={() => setSelectedLead(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
                </div>

                <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "1rem", borderRadius: "14px", border: "1px solid #cbd5e1", marginBottom: "1rem" }}>
                  <h4 style={{ margin: "0 0 2px", fontSize: "1.1rem", fontWeight: 800 }}>{selectedLead.name}</h4>
                  <div style={{ color: "#4f46e5", fontWeight: 700, fontSize: "0.75rem" }}>{selectedLead.jobRole || selectedLead.designation || "Prospect lead"}</div>
                  
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
                    <div>Sourced Recruiter: <strong style={{ display: "block" }}>{selectedLead.recruiterName}</strong></div>
                    <div>Reporting TL: <strong style={{ display: "block" }}>{selectedLead.reportingPerson || "Manager Direct"}</strong></div>
                    <div>Sourced Platform: <strong style={{ display: "block" }}>{selectedLead.sourcingBy || "N/A"}</strong></div>
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
