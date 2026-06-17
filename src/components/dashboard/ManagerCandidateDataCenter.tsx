import React, { useState, useEffect, useMemo } from "react";
import { 
  LucideUsers, LucideDatabase, LucideUserCheck, LucideActivity, 
  LucideTrendingUp, LucideArrowRight, LucideTrendingDown, LucideCalendar, 
  LucideSearch, LucideFilter, LucideDownload, LucideCheckCircle, 
  LucideXCircle, LucideAlertCircle, LucideBriefcase, LucideEye, 
  LucideClock, LucideGlobe, LucideFileText, LucideBuilding2,
  LucidePieChart, LucideAward, LucideZap, LucideListTodo,
  LucideChevronLeft, LucideChevronRight, LucideShare2, LucideBarChart3,
  LucideSparkles, LucideLayers, LucideGauge, LucidePencil, LucideChevronDown
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

interface InteractionNote {
  id: number;
  text: string;
  createdAt: string;
  author?: {
    name: string;
    role: string;
  };
}

interface CandidateData {
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
  dob?: string;
  age?: string;
  gender?: string;
  coldCalling?: string;
  clientName?: string;
  qualification?: string;
  totalExperience?: string;
  sector?: string;
  currentOrg?: string;
  currentCtc?: string;
  expectedCtc?: string;
  noticePeriod?: string;
  cvStatus?: string;
  offeredSalary?: string;
  cvSharedWith?: string;
  vendor?: string;
  cvUrl?: string;
  addedBy: number;
  recruiterName: string;
  reportingPerson: string;
  dataType?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewType?: string;
  status?: string;
  InteractionNotes?: InteractionNote[];
}

const checkCandidateStatusHistory = (c: any, keywords: string[]) => {
  if (c.InteractionNotes && Array.isArray(c.InteractionNotes)) {
    return c.InteractionNotes.some((n: any) => {
      const txt = (n.text || "").toLowerCase();
      return keywords.some(kw => txt.includes(kw));
    });
  }
  return false;
};

const isCandidateMatch = (c: any, stName: string) => {
  if (!c) return false;
  const rmk = (c.remarks || "").toLowerCase();
  const st = stName.toLowerCase().replace(/[\s_]+/g, "");
  
  if (rmk === st || rmk.replace(/[\s_]+/g, "") === st) return true;
  
  const interviewStatuses = ["go for interview", "selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
  const hasInterviewHistory = interviewStatuses.includes(rmk) || !!c.interviewDate || checkCandidateStatusHistory(c, ["go for interview", "interview scheduled", "interview rescheduled", "interviewed", "selected", "joined", "hired", "process to joining", "process for joining", "dropped"]);

  if (st === "selected") {
    if (rmk === "rejected") return false;
    const selectedStatuses = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired", "after selection not interested"];
    return selectedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["selected", "hired"]);
  }
  if (st === "joined" || st === "hired") {
    if (rmk === "dropped" || rmk === "rejected") return false;
    return rmk === "joined" || rmk === "hired";
  }
  if (st === "rejected") {
    const excludeFromRejected = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
    if (excludeFromRejected.includes(rmk)) return false;
    return rmk === "rejected";
  }
  if (st === "notinterested") {
    return rmk === "not interested";
  }
  if (st === "interested") {
    if (rmk === "not connected") return false;
    const interestedStatuses = ["interested", "selected", "joined", "dropped", "process to joining", "process for joining", "hired", "rejected"];
    return interestedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["interested", "select", "join", "hired", "process"]);
  }
  if (st === "processtojoining" || st === "joining" || st === "processforjoining") {
    const excludeFromJoining = ["joined", "dropped", "rejected", "hired"];
    if (excludeFromJoining.includes(rmk)) return false;
    return rmk === "process to joining" || rmk === "process for joining" || rmk === "processing";
  }
  if (st === "connected") {
    if (hasInterviewHistory) return false;
    return rmk === "connected" || checkCandidateStatusHistory(c, ["connected"]);
  }
  if (st === "notconnected") {
    return rmk === "not connected";
  }
  if (st === "revertlater") {
    return rmk === "revert later" || rmk === "call later";
  }
  if (st === "callnotpick") {
    return rmk === "call not pick" || rmk === "no response" || rmk === "busy";
  }
  if (st === "dropped") {
    return rmk === "dropped";
  }
  if (st === "goforinterview" || st === "interviewscheduled") {
    return hasInterviewHistory;
  }
  return false;
};

export default function ManagerCandidateDataCenter() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [team, setTeam] = useState<UserNode[]>([]);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);

  // View States
  const [activeTab, setActiveTab] = useState<"all" | "recruiter" | "tl" | "combined" | "analytics">("all");
  const [selectedRecruiterProfile, setSelectedRecruiterProfile] = useState<UserNode | null>(null);
  const [selectedTlProfile, setSelectedTlProfile] = useState<UserNode | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);
  
  // Drill-down filters from dashboard clickable KPI cards
  const [drilldownStatus, setDrilldownStatus] = useState<string | null>(null);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTls, setSelectedTls] = useState<number[]>([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState<number[]>([]);
  
  // Custom Filter Dropdowns
  const [filterClient, setFilterClient] = useState("All");
  const [filterDesignation, setFilterDesignation] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterCity, setFilterCity] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [filterAge, setFilterAge] = useState("All");
  const [filterQualification, setFilterQualification] = useState("All");
  const [filterExperience, setFilterExperience] = useState("All");
  const [filterSector, setFilterSector] = useState("All");
  const [filterCurrentOrg, setFilterCurrentOrg] = useState("All");
  const [filterCvStatus, setFilterCvStatus] = useState("All");
  const [filterSourcingBy, setFilterSourcingBy] = useState("All");
  const [filterVendor, setFilterVendor] = useState("All");
  const [filterCandidateStatus, setFilterCandidateStatus] = useState("All");

  // Date Range Options
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

        // DATA SECURITY: Mappings to Manager's reporting structure only
        const managerNode = teamData.find(t => t.role === "manager");
        const managerId = managerNode?.id || currentUser?.id || currentUser?.userId;

        // TLs under Manager
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

        // Filter Candidate Database to reporting structure only (Prevent Data Leakage)
        const filteredCands = candData.filter((c: any) => {
          const addedById = Number(c.addedBy);
          const recruiterMatch = c.recruiterName && allowedNames.has(c.recruiterName.toLowerCase());
          const reporterMatch = c.reportingPerson && allowedNames.has(c.reportingPerson.toLowerCase());
          const idMatch = allowedUserIds.has(addedById);

          return idMatch || recruiterMatch || reporterMatch;
        });

        setCandidates(filteredCands);
      }
    } catch (err) {
      console.error("Failed to load candidate base:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. DASHBOARD OVERVIEW SECTION KPI CALCULATIONS
  const stats = useMemo(() => {
    const total = candidates.length;
    const now = new Date();
    const todayStr = now.toDateString();

    const getDaysAgo = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      date.setHours(0,0,0,0);
      return date;
    };

    const registeredToday = candidates.filter(c => {
      const date = new Date(c.createdAt);
      return date.toDateString() === todayStr;
    }).length;

    const registeredLast7Days = candidates.filter(c => new Date(c.createdAt) >= getDaysAgo(7)).length;
    const registeredLast30Days = candidates.filter(c => new Date(c.createdAt) >= getDaysAgo(30)).length;
    const registeredLast12Months = candidates.filter(c => new Date(c.createdAt) >= getDaysAgo(365)).length;

    // Status distributions
    let connected = 0;
    let interested = 0;
    let selected = 0;
    let joined = 0;
    let rejected = 0;
    let notInterested = 0;
    let processToJoining = 0;

    candidates.forEach(c => {
      if (isCandidateMatch(c, "joined")) joined++;
      if (isCandidateMatch(c, "rejected")) rejected++;
      if (isCandidateMatch(c, "interested")) interested++;
      if (isCandidateMatch(c, "not interested")) notInterested++;
      if (isCandidateMatch(c, "selected")) selected++;
      if (isCandidateMatch(c, "joining")) processToJoining++;
      if (isCandidateMatch(c, "connected")) connected++;
    });

    return {
      total,
      registeredToday,
      registeredLast7Days,
      registeredLast30Days,
      registeredLast12Months,
      connected,
      interested,
      selected,
      joined,
      rejected,
      notInterested,
      processToJoining
    };
  }, [candidates]);

  // Unified dynamic Filter Lists from Candidate Data
  const filterLists = useMemo(() => {
    const tls = team.filter(t => t.role === "tl");
    const recruiters = team.filter(t => t.role === "recruiter");

    const clients = new Set<string>();
    const designations = new Set<string>();
    const states = new Set<string>();
    const cities = new Set<string>();
    const qualifications = new Set<string>();
    const experiences = new Set<string>();
    const sectors = new Set<string>();
    const currentOrgs = new Set<string>();
    const cvStatuses = new Set<string>();
    const sourcingByOptions = new Set<string>();
    const vendors = new Set<string>();
    const statuses = new Set<string>();

    candidates.forEach(c => {
      if (c.clientName) clients.add(c.clientName);
      if (c.designation || c.jobRole) designations.add(c.designation || c.jobRole);
      if (c.state) states.add(c.state);
      if (c.city) cities.add(c.city);
      if (c.qualification) qualifications.add(c.qualification);
      if (c.totalExperience) experiences.add(c.totalExperience);
      if (c.sector) sectors.add(c.sector);
      if (c.currentOrg) currentOrgs.add(c.currentOrg);
      if (c.cvStatus) cvStatuses.add(c.cvStatus);
      if (c.sourcingBy) sourcingByOptions.add(c.sourcingBy);
      if (c.vendor) vendors.add(c.vendor);
      if (c.remarks) statuses.add(c.remarks);
    });

    return {
      tls,
      recruiters,
      clients: Array.from(clients).sort(),
      designations: Array.from(designations).sort(),
      states: Array.from(states).sort(),
      cities: Array.from(cities).sort(),
      qualifications: Array.from(qualifications).sort(),
      experiences: Array.from(experiences).sort(),
      sectors: Array.from(sectors).sort(),
      currentOrgs: Array.from(currentOrgs).sort(),
      cvStatuses: Array.from(cvStatuses).sort(),
      sourcingByOptions: Array.from(sourcingByOptions).sort(),
      vendors: Array.from(vendors).sort(),
      statuses: Array.from(statuses).sort()
    };
  }, [team, candidates]);

  // 2. SEARCH & 3. ADVANCED INTEGRATED FILTER LOGIC
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      // 2. Global Search Matcher
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          (c.name || "").toLowerCase().includes(query) ||
          (c.phone || "").includes(query) ||
          (c.email || "").toLowerCase().includes(query) ||
          (c.clientName || "").toLowerCase().includes(query) ||
          (c.designation || c.jobRole || "").toLowerCase().includes(query) ||
          (c.recruiterName || "").toLowerCase().includes(query) ||
          (c.reportingPerson || "").toLowerCase().includes(query) ||
          (c.city || "").toLowerCase().includes(query) ||
          (c.state || "").toLowerCase().includes(query) ||
          (c.qualification || "").toLowerCase().includes(query) ||
          (c.totalExperience || "").toLowerCase().includes(query) ||
          (c.sourcingBy || "").toLowerCase().includes(query) ||
          (c.vendor || "").toLowerCase().includes(query) ||
          (c.remarks || "").toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // 3. Drilldown KPI Status Filter
      if (drilldownStatus) {
        if (!isCandidateMatch(c, drilldownStatus)) return false;
      }

      // Advanced Filter Selections
      // Hierarchy: TL
      if (selectedTls.length > 0) {
        const reportingTL = team.find(t => t.name.toLowerCase() === (c.reportingPerson || "").toLowerCase());
        const tlMatched = reportingTL && selectedTls.includes(reportingTL.id);
        const nameMatch = c.reportingPerson && team.some(t => selectedTls.includes(t.id) && t.name.toLowerCase() === c.reportingPerson.toLowerCase());
        if (!tlMatched && !nameMatch) return false;
      }

      // Hierarchy: Recruiter
      if (selectedRecruiters.length > 0) {
        const matchedRec = team.find(t => 
          t.id === Number(c.addedBy) || 
          t.name.toLowerCase() === (c.recruiterName || "").toLowerCase()
        );
        if (!matchedRec || !selectedRecruiters.includes(matchedRec.id)) return false;
      }

      // Advanced Dropdown criteria
      if (filterClient !== "All" && c.clientName !== filterClient) return false;
      if (filterDesignation !== "All" && c.designation !== filterDesignation && c.jobRole !== filterDesignation) return false;
      if (filterState !== "All" && c.state !== filterState) return false;
      if (filterCity !== "All" && c.city !== filterCity) return false;
      if (filterGender !== "All" && c.gender !== filterGender) return false;
      if (filterAge !== "All" && c.age !== filterAge) return false;
      if (filterQualification !== "All" && c.qualification !== filterQualification) return false;
      if (filterExperience !== "All" && c.totalExperience !== filterExperience) return false;
      if (filterSector !== "All" && c.sector !== filterSector) return false;
      if (filterCurrentOrg !== "All" && c.currentOrg !== filterCurrentOrg) return false;
      if (filterCvStatus !== "All" && c.cvStatus !== filterCvStatus) return false;
      if (filterSourcingBy !== "All" && c.sourcingBy !== filterSourcingBy) return false;
      if (filterVendor !== "All" && c.vendor !== filterVendor) return false;
      if (filterCandidateStatus !== "All" && c.remarks !== filterCandidateStatus) return false;

      // Temporal Presets
      if (dateRangeOption !== "all") {
        const date = new Date(c.createdAt);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (dateRangeOption === "today") {
          return date.toDateString() === today.toDateString();
        } else if (dateRangeOption === "yesterday") {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return date.toDateString() === yesterday.toDateString();
        } else if (dateRangeOption === "7days") {
          const diff = today.getTime() - date.getTime();
          return Math.ceil(diff / (1000 * 3600 * 24)) <= 7;
        } else if (dateRangeOption === "30days") {
          const diff = today.getTime() - date.getTime();
          return Math.ceil(diff / (1000 * 3600 * 24)) <= 30;
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
  }, [candidates, team, searchQuery, drilldownStatus, selectedTls, selectedRecruiters, filterClient, filterDesignation, filterState, filterCity, filterGender, filterAge, filterQualification, filterExperience, filterSector, filterCurrentOrg, filterCvStatus, filterSourcingBy, filterVendor, filterCandidateStatus, dateRangeOption, customStartDate, customEndDate]);

  // Combined metrics from filtered candidates
  const filteredMetrics = useMemo(() => {
    let hired = 0;
    let selected = 0;
    let interested = 0;

    filteredCandidates.forEach(c => {
      if (isCandidateMatch(c, "joined")) hired++;
      if (isCandidateMatch(c, "selected")) selected++;
      if (isCandidateMatch(c, "interested")) interested++;
    });

    return { total: filteredCandidates.length, hired, selected, interested };
  }, [filteredCandidates]);

  // Paginated Database
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCandidates, currentPage]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  // Recruiter Summary Roster
  const recruiterSummary = useMemo(() => {
    const recruiters = team.filter(t => t.role === "recruiter");

    return recruiters.map(rec => {
      const recCands = candidates.filter(c => 
        Number(c.addedBy) === rec.id || 
        c.recruiterName?.toLowerCase() === rec.name.toLowerCase()
      );

      const now = new Date();
      const getDaysAgo = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
      };

      const todayCands = recCands.filter(c => new Date(c.createdAt).toDateString() === now.toDateString()).length;
      const weeklyCands = recCands.filter(c => new Date(c.createdAt) >= getDaysAgo(7)).length;
      const monthlyCands = recCands.filter(c => {
        const date = new Date(c.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;

      let interested = 0;
      let selected = 0;
      let joined = 0;

      recCands.forEach(c => {
        if (isCandidateMatch(c, "joined")) joined++;
        if (isCandidateMatch(c, "selected")) selected++;
        if (isCandidateMatch(c, "interested")) interested++;
      });

      return {
        recruiter: rec,
        total: recCands.length,
        todayCands,
        weeklyCands,
        monthlyCands,
        interested,
        selected,
        joined
      };
    });
  }, [team, candidates]);

  // TL Summary Roster
  const tlSummary = useMemo(() => {
    const tls = team.filter(t => t.role === "tl");

    return tls.map(tl => {
      const subordinates = team.filter(t => t.reportingTo === tl.id);
      const subIds = subordinates.map(s => s.id);
      const subNames = new Set(subordinates.map(s => s.name.toLowerCase()));

      const tlCands = candidates.filter(c => {
        const reportingTLMatch = c.reportingPerson && c.reportingPerson.toLowerCase() === tl.name.toLowerCase();
        const addedBySub = subIds.includes(Number(c.addedBy));
        const nameMatch = c.recruiterName && subNames.has(c.recruiterName.toLowerCase());
        return reportingTLMatch || addedBySub || nameMatch;
      });

      const now = new Date();
      const getDaysAgo = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
      };

      const todayCands = tlCands.filter(c => new Date(c.createdAt).toDateString() === now.toDateString()).length;
      const weeklyCands = tlCands.filter(c => new Date(c.createdAt) >= getDaysAgo(7)).length;
      const monthlyCands = tlCands.filter(c => {
        const date = new Date(c.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;

      let selected = 0;
      let joined = 0;

      tlCands.forEach(c => {
        if (isCandidateMatch(c, "joined")) joined++;
        if (isCandidateMatch(c, "selected")) selected++;
      });

      return {
        tl,
        recruiterCount: subordinates.length,
        total: tlCands.length,
        todayCands,
        weeklyCands,
        monthlyCands,
        selected,
        joined
      };
    });
  }, [team, candidates]);

  // 9. POWERFUL REPORT EXPORT SYSTEM (Excel/CSV, PDF audit report)
  const triggerExport = (format: "csv" | "pdf") => {
    if (filteredCandidates.length === 0) {
      alert("No matching records found to compile export.");
      return;
    }

    if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const rowsHtml = filteredCandidates.map((c, idx) => `
        <tr style="background: ${idx % 2 === 0 ? "#f8fafc" : "#ffffff"}; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 8px; font-weight: bold;">${c.name}</td>
          <td style="padding: 8px;">${c.phone}</td>
          <td style="padding: 8px; font-size: 11px;">${c.email || "N/A"}</td>
          <td style="padding: 8px;">${c.clientName || "N/A"}</td>
          <td style="padding: 8px; font-weight: 500;">${c.jobRole || c.designation || "N/A"}</td>
          <td style="padding: 8px; font-weight: bold; color: #16a34a;">${c.remarks || "New"}</td>
          <td style="padding: 8px;">${c.recruiterName || "N/A"}</td>
          <td style="padding: 8px;">${c.reportingPerson || "Manager Direct"}</td>
          <td style="padding: 8px;">${new Date(c.createdAt).toLocaleDateString()}</td>
        </tr>
      `).join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Candidate Database Audit Report</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #0f172a; margin: 30px; }
            h1 { font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 0 0 5px; }
            p { font-size: 11px; color: #64748b; margin: 0 0 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background: #1e3a8a; color: white; padding: 10px; text-align: left; font-weight: 700; }
            td { border-bottom: 1px solid #cbd5e1; padding: 8px; }
            .kpi-row { display: flex; gap: 15px; margin-bottom: 20px; }
            .kpi-box { flex: 1; padding: 12px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; }
            .kpi-box h3 { font-size: 10px; text-transform: uppercase; color: #1d4ed8; margin: 0 0 4px; }
            .kpi-box p { font-size: 18px; font-weight: 900; color: #0f172a; margin: 0; }
          </style>
        </head>
        <body>
          <h1>Candidate Database Audit Report</h1>
          <p>Generated: ${new Date().toLocaleString()} | Managerial Data Scope | Filtered Match Size: ${filteredCandidates.length}</p>
          
          <div class="kpi-row">
            <div class="kpi-box"><h3>Total Candidates</h3><p>${filteredCandidates.length}</p></div>
            <div class="kpi-box"><h3>Selections Mapped</h3><p>${filteredMetrics.selected}</p></div>
            <div class="kpi-box"><h3>Joined Node Placements</h3><p>${filteredMetrics.hired}</p></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Client Name</th>
                <th>Job Title</th>
                <th>Current Status</th>
                <th>Recruiter</th>
                <th>TL Name</th>
                <th>Registration Date</th>
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

    // CSV format
    const headers = [
      "Candidate Name", "Phone", "Email", "Client Name", "Job Title", "Recruiter",
      "TL Name", "City", "State", "Gender", "Age", "Qualification", "Experience",
      "Sector", "Current Org", "Current CTC", "Expected CTC", "Notice Period", "CV Status",
      "Offered Salary", "Sourcing By", "Vendor", "Remarks", "Registration Date"
    ];

    const rows = filteredCandidates.map(c => [
      c.name,
      c.phone,
      c.email || "N/A",
      c.clientName || "N/A",
      c.designation || c.jobRole || "N/A",
      c.recruiterName || "N/A",
      c.reportingPerson || "Manager Direct",
      c.city || "N/A",
      c.state || "N/A",
      c.gender || "N/A",
      c.age || "N/A",
      c.qualification || "N/A",
      c.totalExperience || "N/A",
      c.sector || "N/A",
      c.currentOrg || "N/A",
      c.currentCtc || "N/A",
      c.expectedCtc || "N/A",
      c.noticePeriod || "N/A",
      c.cvStatus || "N/A",
      c.offeredSalary || "N/A",
      c.sourcingBy || "N/A",
      c.vendor || "N/A",
      c.remarks || "New",
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Manager_Candidate_Base_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedTls([]);
    setSelectedRecruiters([]);
    setFilterClient("All");
    setFilterDesignation("All");
    setFilterState("All");
    setFilterCity("All");
    setFilterGender("All");
    setFilterAge("All");
    setFilterQualification("All");
    setFilterExperience("All");
    setFilterSector("All");
    setFilterCurrentOrg("All");
    setFilterCvStatus("All");
    setFilterSourcingBy("All");
    setFilterVendor("All");
    setFilterCandidateStatus("All");
    setDateRangeOption("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setDrilldownStatus(null);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: "1.5rem", background: "#f8fafc", minHeight: "100%", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Candidate Intelligence & </span>
            <span style={{ color: "#2563eb" }}>Monitoring Center</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Oversight repository of all registered talent nodes.</p>
        </div>

        {/* Global Exports */}
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <button 
            onClick={() => triggerExport("csv")}
            style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", color: "#334155", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <LucideDownload size={14} /> Export CSV
          </button>
          <button 
            onClick={() => triggerExport("pdf")}
            style={{ padding: "8px 14px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }}
          >
            <LucideShare2 size={14} /> Generate Report (PDF)
          </button>
        </div>
      </div>

      {/* 1. DASHBOARD OVERVIEW CLICKABLE KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Candidates", val: stats.total, color: "#0f172a", bg: "#f1f5f9", bColor: "#cbd5e1", slug: null },
          { label: "Today Registered", val: stats.registeredToday, color: "#2563eb", bg: "#eff6ff", bColor: "#bfdbfe", slug: null },
          { label: "Last 7 Days", val: stats.registeredLast7Days, color: "#7c3aed", bg: "#f5f3ff", bColor: "#ddd6fe", slug: null },
          { label: "Last 30 Days", val: stats.registeredLast30Days, color: "#db2777", bg: "#fdf2f8", bColor: "#fbcfe8", slug: null },
          { label: "Last 12 Months", val: stats.registeredLast12Months, color: "#0d9488", bg: "#f0fdfa", bColor: "#99f6e4", slug: null },
          { label: "Connected Leads", val: stats.connected, color: "#0284c7", bg: "#f0f9ff", bColor: "#bae6fd", slug: "connected" },
          { label: "Interested Leads", val: stats.interested, color: "#8b5cf6", bg: "#f5f3ff", bColor: "#ddd6fe", slug: "interested" },
          { label: "Selected Nodes", val: stats.selected, color: "#d97706", bg: "#fffbeb", bColor: "#fef08a", slug: "selected" },
          { label: "Joined Nodes", val: stats.joined, color: "#16a34a", bg: "#f0fdf4", bColor: "#bbf7d0", slug: "joined" },
          { label: "Rejected Node", val: stats.rejected, color: "#dc2626", bg: "#fef2f2", bColor: "#fecaca", slug: "rejected" },
          { label: "Not Interested", val: stats.notInterested, color: "#94a3b8", bg: "#f8fafc", bColor: "#e2e8f0", slug: "not interested" },
          { label: "Process To Joining", val: stats.processToJoining, color: "#0d9488", bg: "#f0fdfa", bColor: "#99f6e4", slug: "joining" }
        ].map((card, i) => (
          <div 
            key={i} 
            onClick={() => {
              setDrilldownStatus(card.slug);
              setCurrentPage(1);
            }}
            style={{ 
              background: card.bg, 
              border: `1.5px solid ${drilldownStatus === card.slug ? card.color : card.bColor}`,
              padding: "10px 14px", 
              borderRadius: "14px", 
              cursor: "pointer", 
              boxShadow: "0 2px 5px rgba(0,0,0,0.01)",
              transition: "all 0.15s ease",
              position: "relative"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>{card.label}</span>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 900, color: card.color, marginTop: "2px", marginBottom: 0 }}>{card.val}</h3>
            {drilldownStatus === card.slug && (
              <span style={{ position: "absolute", right: "8px", bottom: "8px", width: "6px", height: "6px", borderRadius: "50%", background: card.color }} />
            )}
          </div>
        ))}
      </div>

      {/* 2. GLOBAL SEARCH & 3. FILTERS SYSTEM */}
      <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", marginBottom: "1.5rem" }}>
        
        {/* Search Header controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
          
          {/* Main search box */}
          <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <LucideSearch size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "10px" }} />
            <input 
              type="text" 
              placeholder="Search candidate name, mobile number, email, client name, job title, recruiter, TL, location, vendor, sourcing..." 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ width: "100%", padding: "8px 12px 8px 38px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.85rem", color: "#1e293b" }}
            />
          </div>

          {/* Preset Dates Dropdown */}
          <div>
            <select 
              value={dateRangeOption} 
              onChange={e => { setDateRangeOption(e.target.value as any); setCurrentPage(1); }}
              style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.82rem", fontWeight: 700, color: "#475569", background: "#f8fafc", cursor: "pointer" }}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <button 
            onClick={resetAllFilters}
            style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px dashed #e2e8f0", background: "transparent", color: "#ef4444", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer" }}
          >
            Clear Filters
          </button>
        </div>

        {/* Custom Range boxes */}
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

        {/* HIERARCHY & CANDIDATE ADVANCED FILTER DRAWERS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
          
          {/* TL multiselect checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>TL-wise filters</span>
            <div style={{ maxHeight: "95px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px", background: "#fafafa" }}>
              {filterLists.tls.map(t => (
                <label key={t.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", padding: "2px 0", cursor: "pointer", fontWeight: 500 }}>
                  <input type="checkbox" checked={selectedTls.includes(t.id)} onChange={() => handleToggleTl(t.id)} style={{ accentColor: "#10b981" }} />
                  {t.name}
                </label>
              ))}
            </div>
          </div>

          {/* Recruiter checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Recruiter-wise filters</span>
            <div style={{ maxHeight: "95px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px", background: "#fafafa" }}>
              {filterLists.recruiters.map(r => (
                <label key={r.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", padding: "2px 0", cursor: "pointer", fontWeight: 500 }}>
                  <input type="checkbox" checked={selectedRecruiters.includes(r.id)} onChange={() => handleToggleRecruiter(r.id)} style={{ accentColor: "#10b981" }} />
                  {r.name}
                </label>
              ))}
            </div>
          </div>

          {/* Client Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Client Name</span>
            <select value={filterClient} onChange={e => { setFilterClient(e.target.value); setCurrentPage(1); }} style={{ padding: "5px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.78rem", background: "white" }}>
              <option value="All">All Clients</option>
              {filterLists.clients.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Job Role Designation */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Job Designation</span>
            <select value={filterDesignation} onChange={e => { setFilterDesignation(e.target.value); setCurrentPage(1); }} style={{ padding: "5px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.78rem", background: "white" }}>
              <option value="All">All Designations</option>
              {filterLists.designations.map((d, i) => <option key={i} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Location details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Location State</span>
            <select value={filterState} onChange={e => { setFilterState(e.target.value); setCurrentPage(1); }} style={{ padding: "5px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.78rem", background: "white" }}>
              <option value="All">All States</option>
              {filterLists.states.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Sourcing by */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Sourcing Platforms</span>
            <select value={filterSourcingBy} onChange={e => { setFilterSourcingBy(e.target.value); setCurrentPage(1); }} style={{ padding: "5px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.78rem", background: "white" }}>
              <option value="All">All Sourcing</option>
              {filterLists.sourcingByOptions.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Candidate Current Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Current Candidate Status</span>
            <select value={filterCandidateStatus} onChange={e => { setFilterCandidateStatus(e.target.value); setCurrentPage(1); }} style={{ padding: "5px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.78rem", background: "white" }}>
              <option value="All">All Statuses</option>
              {filterLists.statuses.map((st, i) => <option key={i} value={st}>{st}</option>)}
            </select>
          </div>

        </div>

      </div>

      {/* 4. VIEW MODE TOGGLE BUTTONS */}
      <div style={{ display: "flex", borderBottom: "2px solid #cbd5e1", marginBottom: "1.5rem", gap: "16px", flexWrap: "wrap" }}>
        {[
          { id: "all", label: "All Candidates", icon: <LucideFileText size={16} /> },
          { id: "recruiter", label: "Recruiter-Wise View", icon: <LucideUsers size={16} /> },
          { id: "tl", label: "TL-Wise View", icon: <LucideBuilding2 size={16} /> },
          { id: "combined", label: "Team Combined View", icon: <LucideLayers size={16} /> },
          { id: "analytics", label: "Candidate Analytics Graphs", icon: <LucideBarChart3 size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
            style={{ padding: "10px 16px", border: "none", background: "none", borderBottom: activeTab === tab.id ? "3px solid #10b981" : "3px solid transparent", color: activeTab === tab.id ? "#10b981" : "#64748b", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB SWITCH CONTENTS */}
      
      {/* 4.A ALL CANDIDATES POOL VIEW */}
      {activeTab === "all" && (
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>Registered Candidate Base ({filteredCandidates.length} Node matches)</h3>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Showing {Math.min(filteredCandidates.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredCandidates.length, currentPage * itemsPerPage)} of {filteredCandidates.length}</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Candidate Name</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Mobile Number</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Email</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Client Name</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Job Title</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Recruiter</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>TL Oversight</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Location</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Sourcing</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Current Status</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Registration Date</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCandidates.map((c, idx) => {
                  const remarks = c.remarks || "New Prospect";
                  const isSelect = remarks.toLowerCase().includes("select");
                  const isHired = remarks.toLowerCase().includes("joined") || remarks.toLowerCase().includes("hired");
                  return (
                    <tr key={c.id || c._id} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "white" : "#fafdfd" }}>
                      <td style={{ padding: "10px 12px", fontWeight: "bold", color: "#1e293b" }}>{c.name}</td>
                      <td style={{ padding: "10px 12px" }}>{c.phone}</td>
                      <td style={{ padding: "10px 12px" }}>{c.email || "N/A"}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.clientName || "N/A"}</td>
                      <td style={{ padding: "10px 12px" }}>{c.jobRole || c.designation || "N/A"}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.recruiterName}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.reportingPerson || "Manager Direct"}</td>
                      <td style={{ padding: "10px 12px" }}>{c.city ? `${c.city}, ${c.state}` : c.state || "N/A"}</td>
                      <td style={{ padding: "10px 12px" }}>{c.sourcingBy || "N/A"}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ background: isHired ? "#ecfdf5" : isSelect ? "#fffbeb" : "#f1f5f9", color: isHired ? "#10b981" : isSelect ? "#d97706" : "#475569", padding: "2px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800, border: `1px solid ${isHired ? "#bbf7d0" : isSelect ? "#fef08a" : "#cbd5e1"}` }}>
                          {remarks}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <button 
                          onClick={() => setSelectedCandidate(c)}
                          style={{ padding: "4px 8px", borderRadius: "6px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "2px" }}
                        >
                          <LucideEye size={12} /> View Profile
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={12} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontWeight: 600 }}>No candidates matched current parameters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
                    style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: currentPage === i + 1 ? "#10b981" : "transparent", color: currentPage === i + 1 ? "white" : "#64748b", fontWeight: 700, cursor: "pointer" }}
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

      {/* 4.B RECRUITER WISE VIEW */}
      {activeTab === "recruiter" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
          {recruiterSummary.map(stats => (
            <div 
              key={stats.recruiter.id} 
              onClick={() => setSelectedRecruiterProfile(stats.recruiter)}
              style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.01)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#10b981"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900, color: "#1e293b" }}>{stats.recruiter.name}</h4>
                <span style={{ background: "#e6f4ea", color: "#137333", padding: "2px 8px", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 800 }}>Recruiter</span>
              </div>
              <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 12px" }}>{stats.recruiter.email}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", background: "#f8fafc", padding: "8px", borderRadius: "10px", marginBottom: "10px", fontSize: "0.78rem" }}>
                <div>Total: <strong>{stats.total}</strong></div>
                <div>Today's: <strong>{stats.todayCands}</strong></div>
                <div>Weekly: <strong>{stats.weeklyCands}</strong></div>
                <div>Monthly: <strong>{stats.monthlyCands}</strong></div>
              </div>

              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px", fontSize: "0.72rem", textAlign: "center" }}>
                <div>
                  <span style={{ display: "block", color: "#7c3aed", fontWeight: 600 }}>Interested</span>
                  <strong style={{ color: "#7c3aed" }}>{stats.interested}</strong>
                </div>
                <div>
                  <span style={{ display: "block", color: "#d97706", fontWeight: 600 }}>Selected</span>
                  <strong style={{ color: "#d97706" }}>{stats.selected}</strong>
                </div>
                <div>
                  <span style={{ display: "block", color: "#10b981", fontWeight: 600 }}>Joined</span>
                  <strong style={{ color: "#10b981" }}>{stats.joined}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4.C TL WISE VIEW */}
      {activeTab === "tl" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {tlSummary.map(stats => (
            <div 
              key={stats.tl.id} 
              onClick={() => setSelectedTlProfile(stats.tl)}
              style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.01)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#10b981"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900, color: "#1e293b" }}>{stats.tl.name}</h4>
                <span style={{ background: "#f3e8ff", color: "#6b21a8", padding: "2px 8px", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 800 }}>Team Lead</span>
              </div>
              <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 12px" }}>Reporters Reporting: {stats.recruiterCount} Recruiters</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", background: "#f8fafc", padding: "8px", borderRadius: "10px", marginBottom: "10px", fontSize: "0.78rem" }}>
                <div>Total Candidates: <strong>{stats.total}</strong></div>
                <div>Today's: <strong>{stats.todayCands}</strong></div>
                <div>Weekly Sourced: <strong>{stats.weeklyCands}</strong></div>
                <div>Monthly Sourced: <strong>{stats.monthlyCands}</strong></div>
              </div>

              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.72rem", textAlign: "center" }}>
                <div>
                  <span style={{ display: "block", color: "#d97706", fontWeight: 600 }}>Team Selections</span>
                  <strong style={{ color: "#d97706" }}>{stats.selected}</strong>
                </div>
                <div>
                  <span style={{ display: "block", color: "#10b981", fontWeight: 600 }}>Team Joined</span>
                  <strong style={{ color: "#10b981" }}>{stats.joined}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4.D TEAM COMBINED VIEW */}
      {activeTab === "combined" && (
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: "0 0 10px" }}>Combined Team Sandbox Selector</h3>
            <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "0 0 15px" }}>Select multiple recruiters and team leads to generate live merged pool audits.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {filterLists.tls.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleToggleTl(t.id)}
                    style={{ padding: "5px 12px", borderRadius: "8px", border: `1.5px solid ${selectedTls.includes(t.id) ? "#10b981" : "#cbd5e1"}`, background: selectedTls.includes(t.id) ? "#ecfdf5" : "white", color: selectedTls.includes(t.id) ? "#10b981" : "#475569", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    TL: {t.name}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {filterLists.recruiters.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleToggleRecruiter(r.id)}
                    style={{ padding: "5px 12px", borderRadius: "8px", border: `1.5px solid ${selectedRecruiters.includes(r.id) ? "#0d9488" : "#cbd5e1"}`, background: selectedRecruiters.includes(r.id) ? "#f0fdfa" : "white", color: selectedRecruiters.includes(r.id) ? "#0d9488" : "#475569", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    Recruiter: {r.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sandbox metrics display */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: "1rem", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #bfdbfe", marginBottom: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800 }}>Combined Sourced</span>
              <h4 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", margin: "2px 0 0" }}>{filteredMetrics.total}</h4>
            </div>
            <div>
              <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800 }}>Combined Selections</span>
              <h4 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#d97706", margin: "2px 0 0" }}>{filteredMetrics.selected}</h4>
            </div>
            <div>
              <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800 }}>Combined Placements</span>
              <h4 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#16a34a", margin: "2px 0 0" }}>{filteredMetrics.hired}</h4>
            </div>
            <div>
              <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800 }}>Combined Interested</span>
              <h4 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#8b5cf6", margin: "2px 0 0" }}>{filteredMetrics.interested}</h4>
            </div>
          </div>

          {/* Merged candidates table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Candidate Name</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Client Mapped</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Job Role</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Sourced Recruiter</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>TL Lead</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Current Status</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 800 }}>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.slice(0, 50).map((c, idx) => (
                  <tr key={c.id || c._id} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "white" : "#fafafa" }}>
                    <td style={{ padding: "10px 12px", fontWeight: "bold", color: "#0f172a" }}>{c.name}</td>
                    <td style={{ padding: "10px 12px" }}>{c.clientName || "N/A"}</td>
                    <td style={{ padding: "10px 12px" }}>{c.jobRole || c.designation || "N/A"}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{c.recruiterName}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.reportingPerson || "Direct"}</td>
                    <td style={{ padding: "10px 12px" }}>{c.remarks}</td>
                    <td style={{ padding: "10px 12px" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Select recruiters or TLs above to load the Sandbox pool.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. CANDIDATE ANALYTICS GRAPHS */}
      {activeTab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          
          {/* Trend */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>Candidate Registration trend</h4>
            <div style={{ height: "200px", width: "100%", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-end", padding: "10px" }}>
              <div style={{ display: "flex", width: "100%", justifyContent: "space-around", alignItems: "flex-end", height: "100%" }}>
                {[20, 35, 55, 30, 75, 90, 85, 45, 60, 80, 70, 95].map((pct, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "8%" }}>
                    <div style={{ height: `${pct}%`, width: "100%", background: "linear-gradient(to top, #10b981, #34d399)", borderRadius: "4px" }} />
                    <span style={{ fontSize: "0.58rem", color: "#94a3b8", marginTop: "4px" }}>M{idx+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recruiter */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>Recruiter contribution Breakdown</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recruiterSummary.slice(0, 5).map((r, i) => {
                const pct = stats.total > 0 ? Math.round((r.total / stats.total) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                      <span>{r.recruiter.name}</span>
                      <span>{r.total} ({pct}%)</span>
                    </div>
                    <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginTop: "3px" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#0ea5e9", borderRadius: "4px" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* TL */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>TL Contribution breakdown</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tlSummary.map((t, i) => {
                const pct = stats.total > 0 ? Math.round((t.total / stats.total) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                      <span>{t.tl.name}</span>
                      <span>{t.total} ({pct}%)</span>
                    </div>
                    <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginTop: "3px" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#8b5cf6", borderRadius: "4px" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Status */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>Status distribution volume</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Joined Node", val: stats.joined, col: "#10b981" },
                { label: "Selected Node", val: stats.selected, col: "#f59e0b" },
                { label: "Interested", val: stats.interested, col: "#8b5cf6" },
                { label: "Rejected Node", val: stats.rejected, col: "#ef4444" }
              ].map((item, i) => {
                const pct = stats.total > 0 ? Math.round((item.val / stats.total) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                      <span>{item.label}</span>
                      <span>{item.val} ({pct}%)</span>
                    </div>
                    <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginTop: "3px" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: item.col, borderRadius: "4px" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Client-wise Distribution */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>Client-wise Candidate Volume</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(() => {
                const clientCounts: { [key: string]: number } = {};
                candidates.forEach(c => { if (c.clientName) clientCounts[c.clientName] = (clientCounts[c.clientName] || 0) + 1; });
                return Object.entries(clientCounts).sort((a,b)=>b[1]-a[1]).slice(0, 5).map(([name, count], i) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                        <span>{name}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginTop: "3px" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "#ec4899", borderRadius: "4px" }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Job-wise Distribution */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.01)" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 900, color: "#1e293b" }}>Job Designation Distribution</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(() => {
                const jobCounts: { [key: string]: number } = {};
                candidates.forEach(c => {
                  const job = c.designation || c.jobRole;
                  if (job) jobCounts[job] = (jobCounts[job] || 0) + 1;
                });
                return Object.entries(jobCounts).sort((a,b)=>b[1]-a[1]).slice(0, 5).map(([name, count], i) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                        <span>{name}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginTop: "3px" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: "4px" }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

        </div>
      )}

      {/* 5. RECRUITER PROFILE DETAIL DRAWER */}
      <AnimatePresence>
        {selectedRecruiterProfile && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ background: "white", width: "480px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Recruiter Candidate base</h3>
                <button onClick={() => setSelectedRecruiterProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
              </div>

              {(() => {
                const recStats = recruiterSummary.find(s => s.recruiter.id === selectedRecruiterProfile.id);
                if (!recStats) return null;

                const recCands = candidates.filter(c => 
                  Number(c.addedBy) === selectedRecruiterProfile.id || 
                  c.recruiterName?.toLowerCase() === selectedRecruiterProfile.name.toLowerCase()
                );

                // Detailed metrics
                let connected = 0;
                let notConnected = 0;
                let interested = 0;
                let notInterested = 0;
                let interview = 0;
                let pick = 0;
                let select = 0;
                let reject = 0;
                let joined = 0;
                let interviewDone = 0;
                let interviewNotDone = 0;
                let processingForNextRound = 0;

                recCands.forEach(c => {
                  const s = (c.remarks || "").toLowerCase();
                  if (s.includes("joined") || s.includes("hired")) joined++;
                  else if (s.includes("select")) select++;
                  else if (s.includes("reject")) reject++;
                  else if (s.includes("not interested")) notInterested++;
                  else if (s.includes("interested")) interested++;
                  else if (s.includes("interview done")) interviewDone++;
                  else if (s.includes("interview not done")) interviewNotDone++;
                  else if (s.includes("process for interview") || s.includes("processing for next round") || s.includes("processing")) processingForNextRound++;
                  else if (s.includes("interview")) interview++;
                  else if (s.includes("not pick") || s.includes("not answer")) pick++;
                  else if (s.includes("connect") && !s.includes("not")) connected++;
                  else notConnected++;
                });

                // Client-wise, Job-wise, Sourcing distributions
                const clientsMap: { [key: string]: number } = {};
                const jobsMap: { [key: string]: number } = {};
                const sourcingMap: { [key: string]: number } = {};

                recCands.forEach(c => {
                  if (c.clientName) clientsMap[c.clientName] = (clientsMap[c.clientName] || 0) + 1;
                  const job = c.designation || c.jobRole;
                  if (job) jobsMap[job] = (jobsMap[job] || 0) + 1;
                  if (c.sourcingBy) sourcingMap[c.sourcingBy] = (sourcingMap[c.sourcingBy] || 0) + 1;
                });

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    
                    {/* Header */}
                    <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "14px", border: "1px solid #cbd5e1" }}>
                      <h4 style={{ margin: "0 0 2px", fontSize: "1.1rem", fontWeight: 900 }}>{selectedRecruiterProfile.name}</h4>
                      <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 10px" }}>Reporting TL: <strong>{selectedRecruiterProfile.manager_tl?.name || "Direct to Manager"}</strong></p>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", fontSize: "0.75rem", borderTop: "1px solid #cbd5e1", paddingTop: "8px" }}>
                        <div>Lifetime: <strong>{recStats.total}</strong></div>
                        <div>Today: <strong>{recStats.todayCands}</strong></div>
                        <div>Weekly: <strong>{recStats.weeklyCands}</strong></div>
                      </div>
                    </div>

                    {/* STATUS ANALYTICS */}
                    <div>
                      <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Detailed Status mapping</h5>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "0.78rem" }}>
                        <div style={{ padding: "6px", background: "#f1f5f9", borderRadius: "6px" }}>Connected: <strong>{connected}</strong></div>
                        <div style={{ padding: "6px", background: "#f1f5f9", borderRadius: "6px" }}>Not Connected: <strong>{notConnected}</strong></div>
                        <div style={{ padding: "6px", background: "#e0f2fe", borderRadius: "6px" }}>Interested: <strong>{interested}</strong></div>
                        <div style={{ padding: "6px", background: "#fef2f2", borderRadius: "6px" }}>Not Interested: <strong>{notInterested}</strong></div>
                        <div style={{ padding: "6px", background: "#f5f3ff", borderRadius: "6px" }}>Interview: <strong>{interview}</strong></div>
                        <div style={{ padding: "6px", background: "#ecfdf5", borderRadius: "6px" }}>Interview Done: <strong>{interviewDone}</strong></div>
                        <div style={{ padding: "6px", background: "#fef2f2", borderRadius: "6px" }}>Interview Not Done: <strong>{interviewNotDone}</strong></div>
                        <div style={{ padding: "6px", background: "#fffbeb", borderRadius: "6px" }}>Processing for Int: <strong>{processingForNextRound}</strong></div>
                        <div style={{ padding: "6px", background: "#fffbeb", borderRadius: "6px" }}>Selections: <strong>{select}</strong></div>
                        <div style={{ padding: "6px", background: "#fef2f2", borderRadius: "6px" }}>Rejected: <strong>{reject}</strong></div>
                        <div style={{ padding: "6px", background: "#ecfdf5", borderRadius: "6px" }}>Joined: <strong>{joined}</strong></div>
                      </div>
                    </div>

                    {/* CLIENTS ANALYTICS */}
                    <div>
                      <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Client mappings</h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {Object.entries(clientsMap).map(([name, count]) => (
                          <div 
                            key={name} 
                            onClick={() => {
                              setFilterClient(name);
                              setSelectedRecruiterProfile(null);
                              setActiveTab("all");
                            }}
                            style={{ display: "flex", justifyContent: "space-between", background: "#fafafa", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.78rem", cursor: "pointer" }}
                          >
                            <span>{name}</span>
                            <strong>{count} Candidates</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* JOBS ANALYTICS */}
                    <div>
                      <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Job Designation volumes</h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {Object.entries(jobsMap).map(([name, count]) => (
                          <div 
                            key={name}
                            onClick={() => {
                              setFilterDesignation(name);
                              setSelectedRecruiterProfile(null);
                              setActiveTab("all");
                            }}
                            style={{ display: "flex", justifyContent: "space-between", background: "#fafafa", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.78rem", cursor: "pointer" }}
                          >
                            <span>{name}</span>
                            <strong>{count} Candidates</strong>
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

      {/* 6. TL CANDIDATE PROFILE DRAWER */}
      <AnimatePresence>
        {selectedTlProfile && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ background: "white", width: "500px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Team Lead Candidate Base</h3>
                <button onClick={() => setSelectedTlProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
              </div>

              {(() => {
                const tlStats = tlSummary.find(s => s.tl.id === selectedTlProfile.id);
                if (!tlStats) return null;

                const subordinates = team.filter(t => t.reportingTo === selectedTlProfile.id);
                const subIds = subordinates.map(s => s.id);
                const subNames = new Set(subordinates.map(s => s.name.toLowerCase()));

                const tlCands = candidates.filter(c => {
                  const reportingTLMatch = c.reportingPerson && c.reportingPerson.toLowerCase() === selectedTlProfile.name.toLowerCase();
                  const addedBySub = subIds.includes(Number(c.addedBy));
                  const nameMatch = c.recruiterName && subNames.has(c.recruiterName.toLowerCase());
                  return reportingTLMatch || addedBySub || nameMatch;
                });

                // Recruiter Contribution Table mapping
                const contributionList = subordinates.map(rec => {
                  const recCands = tlCands.filter(c => 
                    Number(c.addedBy) === rec.id || 
                    c.recruiterName?.toLowerCase() === rec.name.toLowerCase()
                  );

                  let interested = 0;
                  let selected = 0;
                  let joined = 0;
                  let rejected = 0;

                  recCands.forEach(c => {
                    if (isCandidateMatch(c, "joined")) joined++;
                    if (isCandidateMatch(c, "selected")) selected++;
                    if (isCandidateMatch(c, "rejected")) rejected++;
                    if (isCandidateMatch(c, "interested")) interested++;
                  });

                  return {
                    name: rec.name,
                    total: recCands.length,
                    interested,
                    selected,
                    joined,
                    rejected
                  };
                }).sort((a,b)=>b.total - a.total);

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    
                    {/* Header */}
                    <div style={{ background: "linear-gradient(135deg, #e6f4ea 0%, #ecfdf5 100%)", padding: "1rem", borderRadius: "14px", border: "1px solid #a7f3d0" }}>
                      <h4 style={{ margin: "0 0 2px", fontSize: "1.1rem", fontWeight: 900 }}>TL Name: {selectedTlProfile.name}</h4>
                      <p style={{ color: "#0d9488", fontSize: "0.78rem", margin: "0 0 10px" }}>Hierarchy Level: Team Lead Node</p>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", fontSize: "0.75rem", borderTop: "1px dashed #6ee7b7", paddingTop: "8px" }}>
                        <div>Recruiters: <strong>{tlStats.recruiterCount}</strong></div>
                        <div>Lifetime: <strong>{tlStats.total}</strong></div>
                        <div>Monthly: <strong>{tlStats.monthlyCands}</strong></div>
                      </div>
                    </div>

                    {/* RECRUITER CONTRIBUTION TABLE */}
                    <div>
                      <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>Recruiter contribution roster</h5>
                      <div style={{ overflowX: "auto", border: "1px solid #cbd5e1", borderRadius: "10px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                          <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
                              <th style={{ padding: "8px" }}>Recruiter Name</th>
                              <th style={{ padding: "8px" }}>Total</th>
                              <th style={{ padding: "8px" }}>Interested</th>
                              <th style={{ padding: "8px" }}>Selected</th>
                              <th style={{ padding: "8px" }}>Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contributionList.map((row, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "8px", fontWeight: "bold" }}>{row.name}</td>
                                <td style={{ padding: "8px" }}>{row.total}</td>
                                <td style={{ padding: "8px" }}>{row.interested}</td>
                                <td style={{ padding: "8px", color: "#d97706", fontWeight: 600 }}>{row.selected}</td>
                                <td style={{ padding: "8px", color: "#10b981", fontWeight: 600 }}>{row.joined}</td>
                              </tr>
                            ))}
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

      {/* 7. CANDIDATE FULL DETAILED PROFILE DRAWER */}
      <AnimatePresence>
        {selectedCandidate && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ background: "white", width: "500px", height: "100%", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 25px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}
            >
              
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                  <LucideDatabase size={20} color="#10b981" /> Candidate Comprehensive Profile
                </h3>
                <button onClick={() => setSelectedCandidate(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={20} color="#94a3b8" /></button>
              </div>

              {/* Complete details panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                
                {/* Visual Header */}
                <div style={{ background: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)", padding: "1.25rem", borderRadius: "14px", color: "white" }}>
                  <h4 style={{ fontSize: "1.25rem", fontWeight: 900, margin: "0 0 2px" }}>{selectedCandidate.name}</h4>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>{selectedCandidate.jobRole || selectedCandidate.designation || "Prospect Node"}</div>
                  <div style={{ marginTop: "10px", fontSize: "0.78rem", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                    <div>📞 {selectedCandidate.phone}</div>
                    <div>✉ {selectedCandidate.email || "N/A"}</div>
                  </div>
                </div>

                {/* Candidate fields mapping */}
                <div style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "10px", background: "#f8fafc", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.78rem" }}>
                  <div>Sourcing Date: <strong>{selectedCandidate.createdAt ? new Date(selectedCandidate.createdAt).toLocaleDateString() : "N/A"}</strong></div>
                  <div>Recruiter Name: <strong>{selectedCandidate.recruiterName || "N/A"}</strong></div>
                  <div>TL Oversight: <strong>{selectedCandidate.reportingPerson || "Manager Direct"}</strong></div>
                  <div>Cold Calling: <strong>{selectedCandidate.coldCalling || "N/A"}</strong></div>
                  <div>Client Mapped: <strong>{selectedCandidate.clientName || "N/A"}</strong></div>
                  <div>Gender: <strong>{selectedCandidate.gender || "N/A"}</strong></div>
                  <div>Age: <strong>{selectedCandidate.age || "N/A"}</strong></div>
                  <div>Qualification: <strong>{selectedCandidate.qualification || "N/A"}</strong></div>
                  <div>Experience: <strong>{selectedCandidate.totalExperience || "N/A"}</strong></div>
                  <div>Industry Sector: <strong>{selectedCandidate.sector || "N/A"}</strong></div>
                  <div>Current Org: <strong>{selectedCandidate.currentOrg || "N/A"}</strong></div>
                  <div>Notice Period: <strong>{selectedCandidate.noticePeriod || "N/A"}</strong></div>
                  <div>CV Status: <strong>{selectedCandidate.cvStatus || "N/A"}</strong></div>
                  <div>Vendor Mapped: <strong>{selectedCandidate.vendor || "N/A"}</strong></div>
                </div>

                {/* INTERVIEW HISTORY */}
                <div style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "10px" }}>
                  <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <LucideCalendar size={12} /> Interview History & Schedule
                  </h5>
                  {selectedCandidate.interviewDate ? (
                    <div style={{ fontSize: "0.78rem" }}>
                      <div>Scheduled Date: <strong>{selectedCandidate.interviewDate}</strong></div>
                      <div>Scheduled Time: <strong>{selectedCandidate.interviewTime || "N/A"}</strong></div>
                      <div>Format Mode: <strong>{selectedCandidate.interviewType || "N/A"}</strong></div>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>No interview scheduled yet.</div>
                  )}
                </div>

                {/* STATUS HISTORY TIMELINE */}
                <div style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "10px" }}>
                  <h5 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <LucideClock size={12} /> Activity Logs & Status History
                  </h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ padding: "6px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.75rem" }}>
                      <strong>{selectedCandidate.remarks || "Prospect Registered"}</strong>
                      <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>
                        Updated: {new Date(selectedCandidate.createdAt).toLocaleString()} | By: {selectedCandidate.recruiterName}
                      </div>
                    </div>
                    {selectedCandidate.InteractionNotes?.map((note, idx) => (
                      <div key={idx} style={{ padding: "6px", background: "#fafafa", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.75rem" }}>
                        <strong>{note.text}</strong>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>
                          Updated: {new Date(note.createdAt).toLocaleString()} | By: {note.author?.name || "System"}
                        </div>
                      </div>
                    ))}
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
