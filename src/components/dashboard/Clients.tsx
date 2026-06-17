import { useState, useEffect } from "react";
import { 
  LucideBuilding2, 
  LucidePlus, 
  LucideTrash2, 
  LucideSearch,
  LucidePhone,
  LucideMail,
  LucideMapPin,
  LucideBriefcase,
  LucideLoader2,
  LucideChevronLeft,
  LucideBuilding,
  LucideUser,
  LucideRefreshCw,
  LucideTrendingUp,
  LucideActivity,
  LucideCalendar,
  LucideFilter,
  LucideCheckCircle2,
  LucideXCircle,
  LucideClock,
  LucideUserX,
  LucideAward,
  LucideInfo,
  LucideUserCheck,
  LucidePercent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Client {
  id: number;
  name: string;
  industry: string;
  location: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: string;
  billingDays?: string;
  joinings?: string | number;
  closingDate?: string;
  isHold?: boolean;
  gstNo?: string;
  address?: string;
  paymentConfig?: string;
}

export default function Clients({ role, candidatesProp }: { role: string; candidatesProp?: any[] }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"list" | "add" | "profile">("list");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [activeProfileView, setActiveProfileView] = useState<"tracking" | "billing">("tracking");
  
  // Auth and profile tracking
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Analytics filters
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "7days" | "monthly" | "yearly" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string>("all");
  const [candidateSearchQuery, setCandidateSearchQuery] = useState("");
  const [activeProfileTab, setActiveProfileTab] = useState<"pipeline" | "timeline">("pipeline");

  const [newClient, setNewClient] = useState({
    name: "",
    industry: "",
    location: "",
    contactPerson: "",
    email: "",
    phone: "",
    billingDays: "",
    joinings: "",
    closingDate: ""
  });
  const [gstNo, setGstNo] = useState("");
  const [address, setAddress] = useState("");
  const [paymentType, setPaymentType] = useState<"per_joining" | "per_selection" | "milestone">("per_joining");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [milestoneTarget, setMilestoneTarget] = useState("");
  const [milestoneType, setMilestoneType] = useState<"joining" | "selection">("joining");
  const [selectedJobs, setSelectedJobs] = useState<any[]>([]); // { jobId, jobTitle, type, amount, milestoneTarget, milestoneType }
  const [jobs, setJobs] = useState<any[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [clientStatusTab, setClientStatusTab] = useState<"opened" | "closed">("opened");
  const [candidates, setCandidates] = useState<any[]>(candidatesProp || []);
  const [syncing, setSyncing] = useState(false);

  const [billingSearch, setBillingSearch] = useState("");
  const [billingStatusFilter, setBillingStatusFilter] = useState<"all" | "earned" | "pending">("all");
  const [useTestData, setUseTestData] = useState(false);
  const [jdWarningMsg, setJdWarningMsg] = useState<string | null>(null);
  const canEdit = role === "boss" || role === "manager";

  useEffect(() => {
    fetchClients();
    fetchJobs();
    if (!candidatesProp) fetchCandidates();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (candidatesProp) setCandidates(candidatesProp);
  }, [candidatesProp]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  const fetchCandidates = async (isManualSync = false) => {
    if (candidatesProp && !isManualSync) return;
    try {
      if (isManualSync) setSyncing(true);
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      if (isManualSync) setSyncing(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/clients", {
        headers: { "Accept": "application/json" }
      });
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const config = {
        paymentType,
        paymentAmount: Number(paymentAmount) || 0,
        milestoneTarget: Number(milestoneTarget) || 0,
        milestoneType,
        jobs: selectedJobs
      };
      const payload = {
        ...newClient,
        gstNo,
        address,
        paymentConfig: JSON.stringify(config),
        joinings: Number(newClient.joinings) || 0
      };

      const url = editingClientId ? `/api/clients/${editingClientId}` : "/api/clients";
      const method = editingClientId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        const clientObj = result.client;
        const targetClientId = editingClientId || (clientObj && clientObj.id);

        if (targetClientId) {
          // If we are editing, let's dissociate jobs that are no longer selected
          if (editingClientId) {
            const currentlyAssociatedJobs = jobs.filter(j => String(j.clientId) === String(editingClientId));
            const jobsToClear = currentlyAssociatedJobs.filter(j => !selectedJobs.some((x: any) => x.jobId === j.id));
            await Promise.all(jobsToClear.map(job => 
              fetch(`/api/jobs/${job.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId: null })
              })
            ));
          }

          // Link selected jobs to this client
          if (selectedJobs.length > 0) {
            await Promise.all(selectedJobs.map(job => 
              fetch(`/api/jobs/${job.jobId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId: targetClientId })
              })
            ));
          }
        }

        setView("list");
        setEditingClientId(null);
        setNewClient({ name: "", industry: "", location: "", contactPerson: "", email: "", phone: "", billingDays: "", joinings: "", closingDate: "" });
        setGstNo("");
        setAddress("");
        setPaymentType("per_joining");
        setPaymentAmount("");
        setMilestoneTarget("");
        setMilestoneType("joining");
        setSelectedJobs([]);
        fetchClients();
        fetchJobs();
      } else {
        const errorData = await res.json();
        alert("Error: " + (errorData.error || "Failed to save client"));
      }
    } catch (err) {
      console.error("Error saving client:", err);
      alert("System Error: Could not connect to the neural uplink.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEditClient = (client: any) => {
    setEditingClientId(client.id);
    setNewClient({
      name: client.name || "",
      industry: client.industry || "",
      location: client.location || "",
      contactPerson: client.contactPerson || "",
      email: client.email || "",
      phone: client.phone || "",
      billingDays: client.billingDays || "",
      joinings: client.joinings ? String(client.joinings) : "",
      closingDate: client.closingDate ? client.closingDate.substring(0, 10) : ""
    });
    setGstNo(client.gstNo || "");
    setAddress(client.address || "");
    
    if (client.paymentConfig) {
      try {
        const config = JSON.parse(client.paymentConfig);
        setPaymentType(config.paymentType || "per_joining");
        setPaymentAmount(config.paymentAmount ? String(config.paymentAmount) : "");
        setMilestoneTarget(config.milestoneTarget ? String(config.milestoneTarget) : "");
        setMilestoneType(config.milestoneType || "joining");
        setSelectedJobs(config.jobs || []);
      } catch (e) {
        console.error("Error parsing payment config:", e);
      }
    } else {
      setPaymentType("per_joining");
      setPaymentAmount("");
      setMilestoneTarget("");
      setMilestoneType("joining");
      setSelectedJobs([]);
    }
    setView("add");
  };

  const handleToggleHoldClient = async (client: any) => {
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHold: !client.isHold })
      });
      if (res.ok) {
        fetchClients();
      } else {
        alert("Failed to toggle hold status.");
      }
    } catch (err) {
      console.error("Error toggling hold status:", err);
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchClients();
    } catch (err) {
      console.error("Error deleting client:", err);
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (clientStatusTab === "opened") {
      return matchesSearch && c.status === "active";
    } else {
      return matchesSearch && c.status !== "active";
    }
  });

  // History-Based status checker
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
    const rmk = (c.remarks || "").toLowerCase();
    const cv = (c.cvStatus || "").toLowerCase();
    const st = stName.toLowerCase().replace(/[\s_]+/g, "");
    
    if (rmk === st || rmk.replace(/[\s_]+/g, "") === st) return true;
    
    const interviewStatuses = ["go for interview", "selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
    const hasInterviewHistory = interviewStatuses.includes(rmk) || !!c.interviewDate || checkCandidateStatusHistory(c, ["go for interview", "interview scheduled", "interview rescheduled", "interviewed"]);

    if (st === "selected") {
      if (rmk === "rejected") return false;
      const selectedStatuses = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
      return selectedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["selected", "hired"]);
    }
    if (st === "joined" || st === "hired") {
      if (rmk === "dropped") return false;
      return rmk === "joined" || rmk === "hired";
    }
    if (st === "rejected") {
      const excludeFromRejected = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
      if (excludeFromRejected.includes(rmk)) return false;
      return rmk === "rejected";
    }
    if (st === "interested") {
      if (rmk === "not connected") return false;
      const interestedStatuses = ["interested", "selected", "joined", "dropped", "process to joining", "process for joining", "hired", "rejected"];
      return interestedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["interested", "select", "join", "hired", "process"]);
    }
    if (st === "joining" || st === "process to joining" || st === "process for joining") {
      const excludeFromJoining = ["joined", "dropped", "rejected", "hired"];
      if (excludeFromJoining.includes(rmk)) return false;
      return rmk === "process to joining" || rmk === "process for joining";
    }
    if (st === "connected") {
      if (hasInterviewHistory) return false;
      return rmk === "connected" || checkCandidateStatusHistory(c, ["connected"]);
    }
    if (st === "not interested") {
      return rmk === "not interested";
    }
    if (st === "go for interview") {
      return hasInterviewHistory;
    }
    return rmk === st || cv === st;
  };

  const hasStatusInHistory = (cand: any, statusKeywords: string[]) => {
    const kws = statusKeywords.map(k => k.toLowerCase());
    
    const currentRemarks = (cand.remarks || "").toLowerCase();
    const currentStatus = (cand.status || "").toLowerCase();
    const matchesCurrent = kws.some(kw => 
      currentRemarks.includes(kw) || currentStatus.includes(kw) || isCandidateMatch(cand, kw)
    );
    if (matchesCurrent) return true;
    
    return checkCandidateStatusHistory(cand, kws);
  };

  // Get candidates associated with selected client
  const clientCandidates = selectedClient ? [
    ...candidates.filter(cand => 
      cand.clientName && cand.clientName.toLowerCase() === selectedClient.name.toLowerCase()
    ),
    ...(useTestData ? (() => {
      const clientJobs = jobs.filter(j => String(j.clientId) === String(selectedClient?.id));
      return [
        {
          id: 999901,
          name: "Aarav Mehta",
          clientName: selectedClient.name,
          status: "Joined",
          remarks: "Joined",
          jobRole: clientJobs[0]?.title || "Senior Software Engineer",
          createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
          InteractionNotes: [
            { text: "Selected candidate", createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString() },
            { text: "yes (joined)", createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        },
        {
          id: 999902,
          name: "Isha Sharma",
          clientName: selectedClient.name,
          status: "Joined",
          remarks: "Joined",
          jobRole: clientJobs[1]?.title || clientJobs[0]?.title || "UI/UX Designer",
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          InteractionNotes: [
            { text: "Selected candidate", createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString() },
            { text: "yes (joined)", createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        },
        {
          id: 999903,
          name: "Rohan Verma",
          clientName: selectedClient.name,
          status: "Selected",
          remarks: "Selected",
          jobRole: clientJobs[2]?.title || clientJobs[0]?.title || "Business Analyst",
          createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
          InteractionNotes: [
            { text: "Selected candidate", createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        },
        {
          id: 999904,
          name: "Neha Gupta",
          clientName: selectedClient.name,
          status: "Joined",
          remarks: "Joined",
          jobRole: clientJobs[0]?.title || "Data Scientist",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          InteractionNotes: [
            { text: "yes (joined)", createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        }
      ];
    })() : [])
  ] : [];

  // Filter recruiters list from client candidates
  const clientRecruiters = Array.from(
    new Map(
      clientCandidates
        .filter(cand => cand.assignedTo || cand.recruiterName)
        .map(cand => [
          cand.assignedTo || cand.recruiterName, 
          { id: cand.assignedTo, name: cand.recruiterName || cand.recruiter?.name || "Unknown Recruiter" }
        ])
    ).values()
  );

  // Recruiter-wise tracking security filter
  const filteredByRecruiter = clientCandidates.filter(cand => {
    // If logged-in user is a Recruiter, strictly restrict access to their own data
    if (currentUser && currentUser.role === "recruiter") {
      return cand.assignedTo === currentUser.id || cand.addedBy === currentUser.id || cand.recruiterName?.toLowerCase() === currentUser.name?.toLowerCase();
    }
    
    // Permitted roles (Boss, Manager, TL, Superadmin) can apply dropdown filters
    if (selectedRecruiterId === "all") {
      return true;
    }
    return String(cand.assignedTo) === String(selectedRecruiterId) || cand.recruiterName === selectedRecruiterId;
  });

  // Date range filters
  const filteredByDate = filteredByRecruiter.filter(cand => {
    const candDate = cand.createdAt ? new Date(cand.createdAt) : null;
    if (!candDate) return false;
    
    const candTime = candDate.getTime();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;
    
    switch (dateFilter) {
      case "today":
        return candTime >= todayStart && candTime <= todayEnd;
      case "yesterday": {
        const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
        const yesterdayEnd = todayStart - 1;
        return candTime >= yesterdayStart && candTime <= yesterdayEnd;
      }
      case "7days": {
        const sevenDaysAgoStart = todayStart - 7 * 24 * 60 * 60 * 1000;
        return candTime >= sevenDaysAgoStart && candTime <= todayEnd;
      }
      case "monthly": {
        const thirtyDaysAgoStart = todayStart - 30 * 24 * 60 * 60 * 1000;
        return candTime >= thirtyDaysAgoStart && candTime <= todayEnd;
      }
      case "yearly": {
        const oneYearAgoStart = todayStart - 365 * 24 * 60 * 60 * 1000;
        return candTime >= oneYearAgoStart && candTime <= todayEnd;
      }
      case "custom": {
        if (!customStartDate || !customEndDate) return true;
        const startLimit = new Date(customStartDate).getTime();
        const endLimit = new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000 - 1;
        return candTime >= startLimit && candTime <= endLimit;
      }
      default:
        return true;
    }
  });

  // Calculate 12 Advanced Client Analytics counts
  const calcMetrics = () => {
    const added = filteredByDate.length;
    const connected = filteredByDate.filter(c => (c.remarks && c.remarks.toLowerCase() !== "new") || c.InteractionNotes?.length > 0).length;
    const interested = filteredByDate.filter(c => hasStatusInHistory(c, ["interested", "go for interview", "going for interview", "selected", "joined", "process to joining"])).length;
    const scheduled = filteredByDate.filter(c => hasStatusInHistory(c, ["scheduled", "go for interview", "going for interview", "rescheduled"])).length;
    const attended = filteredByDate.filter(c => hasStatusInHistory(c, ["attended", "went for interview", "attended interview", "selected", "rejected", "joined", "process to joining", "dropped"])).length;
    const selected = filteredByDate.filter(c => hasStatusInHistory(c, ["selected", "joined", "process to joining"])).length;
    const rejected = filteredByDate.filter(c => hasStatusInHistory(c, ["rejected", "reject"])).length;
    const joined = filteredByDate.filter(c => hasStatusInHistory(c, ["joined", "join", "yes (joined)"])).length;
    const process = filteredByDate.filter(c => hasStatusInHistory(c, ["process to joining", "process to join"])).length;
    const dropped = filteredByDate.filter(c => hasStatusInHistory(c, ["dropped", "drop", "no (dropped)"])).length;
    const notInterested = filteredByDate.filter(c => hasStatusInHistory(c, ["not interested", "not_interested"])).length;
    const callNotPick = filteredByDate.filter(c => hasStatusInHistory(c, ["not pick", "not picked", "no response", "call not pick"])).length;

    const interviewDone = filteredByDate.filter(c => hasStatusInHistory(c, ["interview done", "round", "all rounds done", "processing for next round", "selected", "joined", "process to joining", "process for joining", "hired"])).length;
    const interviewNotDone = filteredByDate.filter(c => hasStatusInHistory(c, ["interview not done"]) || (c.remarks || "").toLowerCase() === "interview not done").length;
    const processingForNextRound = filteredByDate.filter(c => hasStatusInHistory(c, ["processing for next round", "processing for interview", "process for interview"])).length;

    return { added, connected, interested, scheduled, attended, selected, rejected, joined, process, dropped, notInterested, callNotPick, interviewDone, interviewNotDone, processingForNextRound };
  };

  const metrics = calcMetrics();

  // Interview tracking stats
  const interviewScheduledCount = metrics.scheduled;
  const interviewAttendedCount = metrics.attended;
  const interviewPendingCount = Math.max(0, metrics.scheduled - metrics.attended);
  const interviewConvertedToSelectionCount = metrics.selected;

  // Client conversion ratios
  const selectionRatio = Math.round((metrics.selected / (metrics.attended || 1)) * 100);
  const joiningRatio = Math.round((metrics.joined / (metrics.added || 1)) * 100);
  const rejectionRatio = Math.round((metrics.rejected / (metrics.attended || 1)) * 100);
  const interviewConversionRatio = Math.round((metrics.selected / (metrics.attended || 1)) * 100);
  const offerToJoinRatio = Math.round((metrics.joined / (metrics.selected || 1)) * 100);
  const candidateInterestRatio = Math.round((metrics.interested / (metrics.connected || 1)) * 100);

  // Recruiter performance insights for selected client
  const conversionEfficiency = Math.round(((metrics.selected + metrics.joined) / (metrics.added || 1)) * 100);
  const rawProductivityScore = metrics.added > 0 ? (
    (metrics.connected * 10 + metrics.scheduled * 20 + metrics.selected * 30 + metrics.joined * 50 - metrics.rejected * 5 - metrics.dropped * 5) / metrics.added
  ) : 0;
  const productivityScore = Math.min(100, Math.max(0, Math.round(rawProductivityScore * 10)));

  // Candidate multi-column search inside Client Profile
  const searchedCandidates = filteredByDate.filter(cand => {
    const q = candidateSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (cand.name || "").toLowerCase().includes(q) ||
      (cand.jobRole || cand.designation || "").toLowerCase().includes(q) ||
      (cand.phone || "").toLowerCase().includes(q) ||
      (cand.recruiterName || cand.recruiter?.name || "").toLowerCase().includes(q) ||
      (cand.remarks || cand.status || "").toLowerCase().includes(q)
    );
  });

  // Client activity timeline log aggregation
  const timelineEvents = filteredByDate.reduce((acc: any[], cand) => {
    if (cand.InteractionNotes && Array.isArray(cand.InteractionNotes)) {
      cand.InteractionNotes.forEach((note: any) => {
        acc.push({
          id: note.id,
          candidateName: cand.name,
          candidateRole: cand.jobRole || cand.designation || "General",
          text: note.text,
          createdAt: note.createdAt,
          authorName: note.author?.name || cand.recruiterName || "Recruiter"
        });
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Modern SVG donut rendering
  const renderDonutChart = () => {
    const data = [
      { label: "Joined", value: metrics.joined, color: "#22c55e" },
      { label: "Selected", value: Math.max(0, metrics.selected - metrics.joined), color: "#4ade80" },
      { label: "Interview Done", value: metrics.interviewDone, color: "#059669" },
      { label: "Interview Not Done", value: metrics.interviewNotDone, color: "#dc2626" },
      { label: "Processing for Int.", value: metrics.processingForNextRound, color: "#d97706" },
      { label: "Interviewing", value: metrics.scheduled, color: "#eab308" },
      { label: "Connected", value: metrics.connected, color: "#2563eb" },
      { label: "Rejected/Dropped", value: metrics.rejected + metrics.dropped, color: "#ef4444" }
    ].filter(d => d.value > 0);

    const total = data.reduce((acc, d) => acc + d.value, 0);
    if (total === 0) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748b", fontSize: "0.85rem", padding: "20px" }}>
          <LucideActivity size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
          No status distribution data available.
        </div>
      );
    }

    let accumulatedPercent = 0;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: "130px", height: "130px", flexShrink: 0 }}>
          <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
            {data.map((d, index) => {
              const percent = (d.value / total) * 100;
              const strokeDash = `${percent} ${100 - percent}`;
              const strokeOffset = 100 - accumulatedPercent;
              accumulatedPercent += percent;
              return (
                <circle
                  key={index}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={d.color}
                  strokeWidth="3.5"
                  strokeDasharray={strokeDash}
                  strokeDashoffset={strokeOffset}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              );
            })}
          </svg>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a" }}>{total}</div>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sourced</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "120px" }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontWeight: 700, color: "#475569" }}>{d.label}</span>
              <strong style={{ fontWeight: 900, color: "#1e293b" }}>{d.value}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Modern stacked Funnel chart
  const renderFunnelChart = () => {
    const stages = [
      { label: "Sourced", value: metrics.added, color: "linear-gradient(90deg, #3b82f6, #2563eb)", percent: 100 },
      { label: "Connected", value: metrics.connected, color: "linear-gradient(90deg, #60a5fa, #3b82f6)", percent: metrics.added ? Math.round((metrics.connected / metrics.added) * 100) : 0 },
      { label: "Interested", value: metrics.interested, color: "linear-gradient(90deg, #fbbf24, #f59e0b)", percent: metrics.added ? Math.round((metrics.interested / metrics.added) * 100) : 0 },
      { label: "Interviewed", value: metrics.attended, color: "linear-gradient(90deg, #f59e0b, #d97706)", percent: metrics.added ? Math.round((metrics.attended / metrics.added) * 100) : 0 },
      { label: "Selected", value: metrics.selected, color: "linear-gradient(90deg, #4ade80, #22c55e)", percent: metrics.added ? Math.round((metrics.selected / metrics.added) * 100) : 0 },
      { label: "Joined", value: metrics.joined, color: "linear-gradient(90deg, #22c55e, #16a34a)", percent: metrics.added ? Math.round((metrics.joined / metrics.added) * 100) : 0 }
    ];

    const maxVal = metrics.added || 1;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {stages.map((stage, idx) => {
          const funnelWidth = maxVal > 0 ? `${20 + (stage.value / maxVal) * 80}%` : "20%";
          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ width: "80px", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textAlign: "right" }}>{stage.label}</span>
              <div style={{ flex: 1, height: "30px", background: "#f8fafc", borderRadius: "8px", overflow: "hidden", border: "1px solid #f1f5f9" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: funnelWidth }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: stage.color,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 12px",
                    color: "white"
                  }}
                >
                  <strong style={{ fontSize: "0.8rem", fontWeight: 900 }}>{stage.value}</strong>
                  {stage.value > 0 && <span style={{ fontSize: "0.65rem", fontWeight: 700, opacity: 0.9 }}>{stage.percent}%</span>}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (view === "add") {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ padding: "1.25rem", maxWidth: "800px", margin: "0 auto" }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <button 
            onClick={() => { setView("list"); setEditingClientId(null); }}
            style={{ 
              display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", 
              color: "#64748b", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", marginBottom: "1rem", padding: 0 
            }}
          >
            <LucideChevronLeft size={18} strokeWidth={3} /> Back to Clients
          </button>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
            {editingClientId ? "Edit" : "Add New"} <span style={{ color: "#2563eb" }}>Client Partner</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 500, marginTop: "4px" }}>
            {editingClientId ? "Modify structural parameters of an existing partner." : "Register a new organizational partnership in the system."}
          </p>
        </div>

        <div style={{ background: "white", padding: "2rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
           <form onSubmit={handleAddClient} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                 <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.8rem", color: "#1e293b" }}>CLIENT NAME</label>
                 <div style={{ position: "relative" }}>
                    <input 
                      required 
                      className="form-input" 
                      style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px 10px 40px", fontSize: "0.9rem", outline: "none" }}
                      placeholder="e.g. Acme Corp"
                      value={newClient.name}
                      onChange={e => setNewClient({...newClient, name: e.target.value})}
                    />
                    <LucideBuilding size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                 </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                 <div className="form-group">
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.8rem", color: "#1e293b" }}>INDUSTRY</label>
                    <div style={{ position: "relative" }}>
                       <input 
                         className="form-input" 
                         style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px 10px 40px", fontSize: "0.9rem", outline: "none" }}
                         placeholder="e.g. Fintech"
                         value={newClient.industry}
                         onChange={e => setNewClient({...newClient, industry: e.target.value})}
                       />
                       <LucideBriefcase size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    </div>
                 </div>
                 <div className="form-group">
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.8rem", color: "#1e293b" }}>LOCATION</label>
                    <div style={{ position: "relative" }}>
                       <input 
                         className="form-input" 
                         style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px 10px 40px", fontSize: "0.9rem", outline: "none" }}
                         placeholder="e.g. Mumbai"
                         value={newClient.location}
                         onChange={e => setNewClient({...newClient, location: e.target.value})}
                       />
                       <LucideMapPin size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    </div>
                 </div>
              </div>

              <div className="form-group">
                 <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.8rem", color: "#1e293b" }}>CONTACT PERSON</label>
                 <div style={{ position: "relative" }}>
                    <input 
                      className="form-input" 
                      style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px 10px 40px", fontSize: "0.9rem", outline: "none" }}
                      placeholder="Full Name"
                      value={newClient.contactPerson}
                      onChange={e => setNewClient({...newClient, contactPerson: e.target.value})}
                    />
                    <LucideUser size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                 </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                 <div className="form-group">
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.8rem", color: "#1e293b" }}>EMAIL</label>
                    <div style={{ position: "relative" }}>
                       <input 
                         type="email"
                         className="form-input" 
                         style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px 10px 40px", fontSize: "0.9rem", outline: "none" }}
                         placeholder="email@company.com"
                         value={newClient.email}
                         onChange={e => setNewClient({...newClient, email: e.target.value})}
                       />
                       <LucideMail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    </div>
                 </div>
                 <div className="form-group">
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.8rem", color: "#1e293b" }}>PHONE</label>
                    <div style={{ position: "relative" }}>
                       <input 
                         className="form-input" 
                         style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px 10px 40px", fontSize: "0.9rem", outline: "none" }}
                         placeholder="+91..."
                         value={newClient.phone}
                         onChange={e => setNewClient({...newClient, phone: e.target.value})}
                       />
                       <LucidePhone size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    </div>
                 </div>
               </div>
               
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  <div className="form-group">
                     <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.8rem", color: "#1e293b" }}>GST NO.</label>
                     <input 
                       className="form-input" 
                       style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px", fontSize: "0.9rem", outline: "none" }}
                       placeholder="e.g. 22AAAAA0000A1Z5"
                       value={gstNo}
                       onChange={e => setGstNo(e.target.value)}
                     />
                  </div>
                  <div className="form-group">
                     <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.8rem", color: "#1e293b" }}>ADDRESS</label>
                     <input 
                       className="form-input" 
                       style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px", fontSize: "0.9rem", outline: "none" }}
                       placeholder="Enter Client Office Address..."
                       value={address}
                       onChange={e => setAddress(e.target.value)}
                     />
                  </div>
               </div>

               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
                  <div className="form-group">
                     <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.8rem", color: "#1e293b" }}>Target NO. OF JOININGS <span style={{ color: "#ef4444" }}>*</span></label>
                     <input 
                       required
                       type="number"
                       min="1"
                       className="form-input" 
                       style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px", fontSize: "0.9rem", outline: "none" }}
                       placeholder="e.g. 5"
                       value={newClient.joinings}
                       onChange={e => setNewClient({...newClient, joinings: e.target.value})}
                     />
                  </div>
                  <div className="form-group">
                     <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.8rem", color: "#1e293b" }}>BILLING DAYS</label>
                     <input 
                       className="form-input" 
                       style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px", fontSize: "0.9rem", outline: "none" }}
                       placeholder="e.g. 30 Days"
                       value={newClient.billingDays}
                       onChange={e => setNewClient({...newClient, billingDays: e.target.value})}
                     />
                  </div>
                  <div className="form-group">
                     <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.8rem", color: "#1e293b" }}>CLOSING DATE <span style={{ color: "#94a3b8", fontWeight: 600 }}>(Optional)</span></label>
                     <input 
                       type="date"
                       className="form-input" 
                       style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px", fontSize: "0.9rem", outline: "none" }}
                       value={newClient.closingDate}
                       onChange={e => setNewClient({...newClient, closingDate: e.target.value})}
                     />
                  </div>
               </div>

               {/* GLOBAL PAYMENT CONFIGURATION */}
               <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 900, color: "#1e293b" }}>💸 GLOBAL CLIENT PAYMENT CONFIGURATION</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                     <div className="form-group">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.75rem", color: "#475569" }}>PAYMENT MODEL</label>
                        <select 
                          value={paymentType}
                          onChange={e => setPaymentType(e.target.value as any)}
                          style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px", fontSize: "0.9rem", outline: "none", background: "white" }}
                        >
                           <option value="per_joining">Per Successful Joining</option>
                           <option value="per_selection">Per Candidate Selection</option>
                           <option value="milestone">Milestone Target Based</option>
                        </select>
                     </div>

                     {paymentType === "milestone" ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                           <div className="form-group">
                              <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.75rem", color: "#475569" }}>TARGET TYPE</label>
                              <select 
                                value={milestoneType}
                                onChange={e => setMilestoneType(e.target.value as any)}
                                style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px", fontSize: "0.9rem", outline: "none", background: "white" }}
                              >
                                 <option value="joining">Joining</option>
                                 <option value="selection">Selection</option>
                              </select>
                           </div>
                           <div className="form-group">
                              <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.75rem", color: "#475569" }}>TARGET COUNT</label>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px", fontSize: "0.9rem", outline: "none" }}
                                placeholder="e.g. 5"
                                value={milestoneTarget}
                                onChange={e => setMilestoneTarget(e.target.value)}
                              />
                           </div>
                        </div>
                     ) : null}

                     <div className="form-group">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.75rem", color: "#475569" }}>
                           {paymentType === "milestone" ? "MILESTONE REWARD (INR)" : "PAYMENT AMOUNT (INR)"}
                        </label>
                        <input 
                          type="number"
                          className="form-input" 
                          style={{ border: "1px solid #e2e8f0", borderRadius: "10px", width: "100%", padding: "10px 12px", fontSize: "0.9rem", outline: "none" }}
                          placeholder="e.g. 15000"
                          value={paymentAmount}
                          onChange={e => setPaymentAmount(e.target.value)}
                        />
                     </div>
                  </div>
               </div>

               {/* MULTIPLE JD SELECT & CUSTOM JD PAYMENTS */}
               <div style={{ background: "#eff6ff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #bfdbfe", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 900, color: "#1e3a8a" }}>💼 SELECT ASSOCIATED JDs (JOBS) & CUSTOM JD PAYMENTS</h3>
                  
                  <div className="form-group">
                     <label style={{ display: "block", marginBottom: "6px", fontWeight: 800, fontSize: "0.75rem", color: "#1e3a8a" }}>SELECT ACTIVE JOBS UNDER CLIENT</label>
                     <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "150px", overflowY: "auto", background: "white", padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        {jobs.map((job) => {
                           const isSelected = selectedJobs.some(x => x.jobId === job.id);
                           const alreadyAssignedClient = job.clientId && String(job.clientId) !== String(editingClientId)
                             ? clients.find(c => String(c.id) === String(job.clientId))
                             : null;

                           return (
                              <button
                                key={job.id}
                                type="button"
                                onClick={() => {
                                   if (alreadyAssignedClient) {
                                      setJdWarningMsg(`This job is already in this ${alreadyAssignedClient.name}`);
                                      setTimeout(() => setJdWarningMsg(null), 4000);
                                      return;
                                   }
                                   if (isSelected) {
                                      setSelectedJobs(selectedJobs.filter(x => x.jobId !== job.id));
                                   } else {
                                      setSelectedJobs([...selectedJobs, { jobId: job.id, jobTitle: job.title, type: "global", amount: "", milestoneTarget: "", milestoneType: "joining" }]);
                                   }
                                }}
                                style={{
                                   padding: "6px 12px",
                                   borderRadius: "8px",
                                   border: `1.5px solid ${isSelected ? "#2563eb" : (alreadyAssignedClient ? "#f8fafc" : "#cbd5e1")}`,
                                   background: isSelected ? "#eff6ff" : (alreadyAssignedClient ? "#f1f5f9" : "white"),
                                   color: isSelected ? "#2563eb" : (alreadyAssignedClient ? "#94a3b8" : "#475569"),
                                   fontWeight: 700,
                                   fontSize: "0.75rem",
                                   cursor: alreadyAssignedClient ? "not-allowed" : "pointer",
                                   opacity: alreadyAssignedClient ? 0.35 : 1,
                                   transition: "all 0.1s"
                                }}
                              >
                                 {job.title}
                              </button>
                           );
                        })}
                     </div>
                     {jdWarningMsg && (
                        <div style={{
                           color: "#dc2626",
                           fontSize: "0.75rem",
                           fontWeight: 700,
                           marginTop: "8px",
                           padding: "8px 12px",
                           background: "#fef2f2",
                           border: "1px solid #fee2e2",
                           borderLeft: "4px solid #dc2626",
                           borderRadius: "6px",
                           display: "flex",
                           alignItems: "center",
                           gap: "6px",
                           boxShadow: "0 1px 2px rgba(220, 38, 38, 0.05)"
                        }}>
                           <span style={{ fontSize: "0.9rem" }}>⚠️</span> {jdWarningMsg}
                        </div>
                     )}
                  </div>

                  {selectedJobs.length > 0 && (
                     <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#1e3a8a" }}>CUSTOMIZE PAYMENT RULE PER JOB:</span>
                        {selectedJobs.map((selJob, i) => (
                           <div key={selJob.jobId} style={{ display: "flex", gap: "10px", background: "white", padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", alignItems: "center", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", flex: 1, minWidth: "120px" }}>{selJob.jobTitle}</span>
                              
                              <select
                                value={selJob.type}
                                onChange={e => {
                                   const copy = [...selectedJobs];
                                   copy[i].type = e.target.value;
                                   setSelectedJobs(copy);
                                }}
                                style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.75rem", fontWeight: 700 }}
                              >
                                 <option value="global">Use Global Rule</option>
                                 <option value="per_joining">Per Joining</option>
                                 <option value="per_selection">Per Selection</option>
                                 <option value="milestone">Milestone Based</option>
                              </select>

                              {selJob.type === "milestone" && (
                                 <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                    <input 
                                      type="number"
                                      placeholder="Target"
                                      value={selJob.milestoneTarget}
                                      onChange={e => {
                                         const copy = [...selectedJobs];
                                         copy[i].milestoneTarget = e.target.value;
                                         setSelectedJobs(copy);
                                      }}
                                      style={{ width: "60px", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }}
                                    />
                                    <select
                                      value={selJob.milestoneType}
                                      onChange={e => {
                                         const copy = [...selectedJobs];
                                         copy[i].milestoneType = e.target.value;
                                         setSelectedJobs(copy);
                                      }}
                                      style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }}
                                    >
                                       <option value="joining">Joining</option>
                                       <option value="selection">Selection</option>
                                    </select>
                                 </div>
                              )}

                              {selJob.type !== "global" && (
                                 <input 
                                   type="number"
                                   placeholder="Amount (INR)"
                                   value={selJob.amount}
                                   onChange={e => {
                                      const copy = [...selectedJobs];
                                      copy[i].amount = e.target.value;
                                      setSelectedJobs(copy);
                                   }}
                                   style={{ width: "110px", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }}
                                 />
                              )}
                           </div>
                        ))}
                     </div>
                  )}
               </div>

              <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                 <button 
                   type="button" 
                   onClick={() => { setView("list"); setEditingClientId(null); }} 
                   className="btn-secondary" 
                   style={{ flex: 1, padding: "12px", borderRadius: "10px", fontWeight: 800, fontSize: "0.9rem", background: "#f1f5f9", border: "none" }}
                 >
                    Discard
                 </button>
                 <button 
                   type="submit" 
                   disabled={submitting} 
                   className="btn-primary" 
                   style={{ flex: 2, padding: "12px", borderRadius: "10px", fontWeight: 800, fontSize: "0.9rem" }}
                 >
                    {submitting ? <LucideLoader2 size={18} className="animate-spin" /> : (editingClientId ? "Update Partnership" : "Authorize Partnership")}
                 </button>
              </div>
           </form>
        </div>
        <style>{`
          .form-input:focus { border-color: #2563eb !important; }
        `}</style>
      </motion.div>
    );
  }

  // PROFESSIONAL CLIENT PROFILE / VIEW DASHBOARD
  if (view === "profile" && selectedClient) {
    const getStatusDate = (cand: any, statusKeywords: string[]) => {
      if (cand.InteractionNotes && Array.isArray(cand.InteractionNotes)) {
        const note = cand.InteractionNotes.find((n: any) => {
          const txt = (n.text || "").toLowerCase();
          return statusKeywords.some(kw => txt.includes(kw));
        });
        if (note) return new Date(note.createdAt);
      }
      return cand.createdAt ? new Date(cand.createdAt) : new Date();
    };

    const getBillingMetrics = () => {
      const billingDays = parseInt(selectedClient?.billingDays as string) || 30;
      let globalPaymentType = "per_joining";
      let globalPaymentAmount = 0;
      let globalMilestoneTarget = 0;
      let globalMilestoneType = "joining";
      let jobPaymentRules: any[] = [];
      
      try {
        if (selectedClient?.paymentConfig) {
          const config = JSON.parse(selectedClient.paymentConfig);
          globalPaymentType = config.paymentType || "per_joining";
          globalPaymentAmount = config.paymentAmount || 0;
          globalMilestoneTarget = config.milestoneTarget || 0;
          globalMilestoneType = config.milestoneType || "joining";
          jobPaymentRules = config.jobs || [];
        }
      } catch (e) {
        console.error("Error parsing payment config:", e);
      }

      const clientJobs = jobs.filter(j => String(j.clientId) === String(selectedClient?.id));
      const now = new Date();
      
      const processedCandidates = clientCandidates.map(cand => {
        const isJoined = hasStatusInHistory(cand, ["joined", "yes (joined)"]);
        const isSelected = hasStatusInHistory(cand, ["selected"]);
        
        const selectDate = getStatusDate(cand, ["selected"]);
        const joinDate = getStatusDate(cand, ["joined", "yes (joined)"]);
        
        const jobTitle = cand.jobRole || cand.designation || "";
        const linkedJob = clientJobs.find(j => j.title === jobTitle);
        const customRule = linkedJob ? jobPaymentRules.find(x => x.jobId === linkedJob.id) : null;
        
        let payoutType = globalPaymentType;
        let payoutAmount = globalPaymentAmount;
        let milestoneTarget = globalMilestoneTarget;
        let milestoneType = globalMilestoneType;
        let isCustom = false;
        
        if (customRule && customRule.type !== "global") {
          payoutType = customRule.type;
          payoutAmount = Number(customRule.amount) || 0;
          milestoneTarget = Number(customRule.milestoneTarget) || 0;
          milestoneType = customRule.milestoneType || "joining";
          isCustom = true;
        }
        
        let activeDate = null;
        let statusLabel = "Processing";
        let isEligible = false;
        
        if (payoutType === "per_selection" || (payoutType === "milestone" && milestoneType === "selection")) {
          activeDate = selectDate;
          isEligible = isSelected || isJoined;
          statusLabel = "Selected";
        } else {
          activeDate = joinDate;
          isEligible = isJoined;
          statusLabel = "Joined";
        }
        
        let daysRemaining = 0;
        let isCompleted = false;
        let payoutDate = null;
        
        if (isEligible && activeDate) {
          payoutDate = new Date(activeDate.getTime() + billingDays * 24 * 60 * 60 * 1000);
          const diffTime = payoutDate.getTime() - now.getTime();
          daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          isCompleted = daysRemaining <= 0;
        }
        
        return {
          id: cand.id,
          name: cand.name,
          jobRole: jobTitle,
          jobId: linkedJob?.id || null,
          statusLabel,
          isEligible,
          activeDate,
          payoutDate,
          daysRemaining,
          isCompleted,
          payoutType,
          payoutAmount,
          milestoneTarget,
          milestoneType,
          isCustom
        };
      });

      let totalIndividualEarned = 0;
      let totalIndividualPending = 0;
      
      const individualCandidates = processedCandidates.filter(c => c.isEligible && c.payoutType !== "milestone");
      individualCandidates.forEach(c => {
        if (c.isCompleted) {
          totalIndividualEarned += c.payoutAmount;
        } else {
          totalIndividualPending += c.payoutAmount;
        }
      });

      const milestoneSummaryMap = new Map<string, any>();
      
      if (globalPaymentType === "milestone") {
        milestoneSummaryMap.set("global", {
          jobTitle: "Global Client Contract Milestone",
          target: globalMilestoneTarget,
          type: globalMilestoneType,
          amount: globalPaymentAmount,
          completedCandidates: [],
          pendingCandidates: []
        });
      }
      
      jobPaymentRules.forEach(rule => {
        if (rule.type === "milestone") {
          milestoneSummaryMap.set(String(rule.jobId), {
            jobTitle: rule.jobTitle,
            target: Number(rule.milestoneTarget) || 0,
            type: rule.milestoneType || "joining",
            amount: Number(rule.amount) || 0,
            completedCandidates: [],
            pendingCandidates: []
          });
        }
      });

      processedCandidates.filter(c => c.isEligible && c.payoutType === "milestone").forEach(c => {
        const ruleKey = c.isCustom ? String(c.jobId) : "global";
        const summary = milestoneSummaryMap.get(ruleKey);
        if (summary) {
          if (c.isCompleted) {
            summary.completedCandidates.push(c);
          } else {
            summary.pendingCandidates.push(c);
          }
        }
      });

      let totalMilestonesEarned = 0;
      let totalMilestonesPending = 0;
      const bulkMilestones = Array.from(milestoneSummaryMap.values()).map(m => {
        const completedCount = m.completedCandidates.length;
        const isMilestoneEarned = completedCount >= m.target;
        if (isMilestoneEarned) {
          totalMilestonesEarned += m.amount;
        } else {
          totalMilestonesPending += m.amount;
        }
        return {
          ...m,
          completedCount,
          isMilestoneEarned
        };
      });

      const totalClientEarned = totalIndividualEarned + totalMilestonesEarned;
      const totalClientPending = totalIndividualPending + totalMilestonesPending;

      const jobsCalculated = clientJobs.map(job => {
        const jobCands = processedCandidates.filter(c => c.jobId === job.id && c.isEligible);
        const selectionsCount = jobCands.filter(c => c.statusLabel === "Selected" || c.statusLabel === "Joined").length;
        const joiningsCount = jobCands.filter(c => c.statusLabel === "Joined").length;
        
        let jobEarned = 0;
        let jobPending = 0;
        
        const isMilestoneRuleForJob = jobPaymentRules.some(r => r.jobId === job.id && r.type === "milestone") || (globalPaymentType === "milestone" && !jobPaymentRules.some(r => r.jobId === job.id && r.type !== "global"));
        
        if (!isMilestoneRuleForJob) {
          const indJobCands = jobCands.filter(c => c.payoutType !== "milestone");
          indJobCands.forEach(c => {
            if (c.isCompleted) {
              jobEarned += c.payoutAmount;
            } else {
              jobPending += c.payoutAmount;
            }
          });
        } else {
          const mKey = jobPaymentRules.some(r => r.jobId === job.id && r.type === "milestone") ? String(job.id) : "global";
          const mObj = bulkMilestones.find(x => x.jobId === mKey || (mKey === "global" && x.jobTitle.includes("Global")));
          if (mObj && mObj.isMilestoneEarned) {
            jobEarned = mObj.amount;
          } else if (mObj) {
            jobPending = mObj.amount;
          }
        }

        return {
          id: job.id,
          title: job.title,
          selectionsCount,
          joiningsCount,
          jobEarned,
          jobPending
        };
      });

      return {
        processedCandidates: processedCandidates.filter(c => c.isEligible),
        bulkMilestones,
        jobsCalculated,
        totalClientEarned,
        totalClientPending,
        billingDays
      };
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: "1.25rem", background: "transparent", minHeight: "100%", width: "100%" }}
      >
        {/* Header Panel */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "2rem" }}>
          <div>
            <button 
              onClick={() => { setView("list"); setSelectedRecruiterId("all"); setDateFilter("all"); setActiveProfileView("tracking"); }}
              style={{ 
                display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", 
                color: "#64748b", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", marginBottom: "0.75rem", padding: 0 
              }}
            >
              <LucideChevronLeft size={16} strokeWidth={3} /> Return to Partners List
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LucideBuilding2 size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                  {selectedClient.name}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <LucideBriefcase size={12} /> {selectedClient.industry || "General"}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <LucideMapPin size={12} /> {selectedClient.location || "Global"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle buttons for Sourcing & Tracking vs Billing & Payouts (Boss/Manager only) */}
          {canEdit && (
            <div style={{ display: "flex", background: "#f8fafc", padding: "4px", borderRadius: "14px", border: "1px solid #e2e8f0", gap: "2px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <button
                onClick={() => setActiveProfileView("tracking")}
                style={{
                  padding: "8px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: activeProfileView === "tracking" ? "white" : "transparent",
                  color: activeProfileView === "tracking" ? "#2563eb" : "#64748b",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  boxShadow: activeProfileView === "tracking" ? "0 4px 12px rgba(37, 99, 235, 0.1)" : "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                📊 Sourcing & Tracking
              </button>
              <button
                onClick={() => setActiveProfileView("billing")}
                style={{
                  padding: "8px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: activeProfileView === "billing" ? "white" : "transparent",
                  color: activeProfileView === "billing" ? "#10b981" : "#64748b",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  boxShadow: activeProfileView === "billing" ? "0 4px 12px rgba(16, 185, 129, 0.1)" : "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                💳 Billing & Payouts
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => fetchCandidates(true)}
              disabled={syncing}
              style={{
                display: "flex", alignItems: "center", gap: "8px", background: "white", border: "1px solid #e2e8f0",
                padding: "8px 16px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 800, color: "#475569",
                cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              <LucideRefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing Grid..." : "Refresh CRM"}
            </button>
            <div style={{
              fontSize: "0.7rem", fontWeight: 800, padding: "6px 12px", borderRadius: "8px",
              background: selectedClient.status === "active" ? "#dcfce7" : "#f1f5f9",
              color: selectedClient.status === "active" ? "#166534" : "#64748b"
            }}>
              {selectedClient.status.toUpperCase()}
            </div>
          </div>
        </div>



        {(!canEdit || activeProfileView === "tracking") ? (
          <>
            {/* Global Analytics Filters Bar */}
            <div style={{ display: "flex", gap: "16px", background: "white", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Recruiter Selector (Permitted roles only) */}
          {currentUser && currentUser.role !== "recruiter" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>RECRUITER:</span>
              <select
                value={selectedRecruiterId}
                onChange={(e) => setSelectedRecruiterId(e.target.value)}
                style={{
                  padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none",
                  fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", background: "#f8fafc", cursor: "pointer"
                }}
              >
                <option value="all">📊 All Recruiters Combined</option>
                {clientRecruiters.map(r => (
                  <option key={r.id || r.name} value={r.id || r.name}>👤 {r.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 800, color: "#475569" }}>
              <span style={{ color: "#94a3b8" }}>TRACKING:</span>
              <span>🔒 Private Performance View ({currentUser?.name})</span>
            </div>
          )}

          <div style={{ height: "24px", width: "1px", background: "#e2e8f0" }} />

          {/* Date range filter pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["all", "today", "yesterday", "7days", "monthly", "yearly", "custom"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                style={{
                  padding: "6px 12px", borderRadius: "8px", border: "none", fontSize: "0.75rem", fontWeight: 800,
                  cursor: "pointer", transition: "all 0.2s ease",
                  background: dateFilter === filter ? "#2563eb" : "#f1f5f9",
                  color: dateFilter === filter ? "white" : "#475569"
                }}
              >
                {filter === "all" && "All Time"}
                {filter === "today" && "Today"}
                {filter === "yesterday" && "Yesterday"}
                {filter === "7days" && "Last 7 Days"}
                {filter === "monthly" && "Monthly"}
                {filter === "yearly" && "Yearly"}
                {filter === "custom" && "Custom Range"}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {dateFilter === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.75rem", fontWeight: 700 }}
              />
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 800 }}>TO</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.75rem", fontWeight: 700 }}
              />
            </div>
          )}
        </div>

        {/* 12 ADVANCED CLIENT ANALYTICS - KPI Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {/* Card 1: Pipeline Volume */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.01)" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>Pipeline Volume</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{metrics.added}</h2>
                <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Total Sourced Candidates</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end", fontSize: "0.7rem" }}>
                <span style={{ color: "#2563eb", fontWeight: 800 }}>☎ Connected: {metrics.connected}</span>
                <span style={{ color: "#d97706", fontWeight: 800 }}>★ Interested: {metrics.interested}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Interview Velocity */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.01)" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>Interview Activity</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#eab308", margin: 0 }}>{interviewScheduledCount}</h2>
                <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Scheduled Interviews</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end", fontSize: "0.7rem" }}>
                <span style={{ color: "#16a34a", fontWeight: 800 }}>✔ Attended: {interviewAttendedCount}</span>
                <span style={{ color: "#64748b", fontWeight: 800 }}>⌛ Pending: {interviewPendingCount}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Selections */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.01)" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>Selection Ratio</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#22c55e", margin: 0 }}>{metrics.selected}</h2>
                <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Total Selected Profile Nodes</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end", fontSize: "0.7rem" }}>
                <span style={{ color: "#16a34a", fontWeight: 800 }}>Ratio: {selectionRatio}%</span>
                <span style={{ color: "#ef4444", fontWeight: 800 }}>✖ Rejected: {metrics.rejected}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Successful Joins */}
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.01)" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>Mandate Completion</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#10b981", margin: 0 }}>
                  {metrics.joined} <span style={{ fontSize: "0.95rem", color: "#94a3b8", fontWeight: 700 }}>/ {selectedClient.joinings || 1}</span>
                </h2>
                <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Successful Placements</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end", fontSize: "0.7rem" }}>
                <span style={{ color: "#059669", fontWeight: 800 }}>⌛ Process: {metrics.process}</span>
                <span style={{ color: "#ef4444", fontWeight: 800 }}>✖ Dropped: {metrics.dropped}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Panel (12 total metrics in professional grid) */}
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "12px" }}>Complete Pipeline Funnel Auditing (15 Standard Metrics)</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
            {[
              { label: "1. Total Candidates Added", value: metrics.added, color: "#3b82f6" },
              { label: "2. Total Candidates Connected", value: metrics.connected, color: "#2563eb" },
              { label: "3. Total Interested", value: metrics.interested, color: "#fbbf24" },
              { label: "4. Total Interview Scheduled", value: metrics.scheduled, color: "#eab308" },
              { label: "5. Total Attended Interview", value: metrics.attended, color: "#f59e0b" },
              { label: "6. Total Selected Candidates", value: metrics.selected, color: "#10b981" },
              { label: "7. Total Rejected Candidates", value: metrics.rejected, color: "#ef4444" },
              { label: "8. Total Joined Candidates", value: metrics.joined, color: "#22c55e" },
              { label: "9. Total Process to Joining", value: metrics.process, color: "#84cc16" },
              { label: "10. Total Dropped Candidates", value: metrics.dropped, color: "#dc2626" },
              { label: "11. Total Not Interested", value: metrics.notInterested, color: "#94a3b8" },
              { label: "12. Total Call Not Pick", value: metrics.callNotPick, color: "#475569" },
              { label: "13. Interview Done", value: metrics.interviewDone, color: "#059669" },
              { label: "14. Interview Not Done", value: metrics.interviewNotDone, color: "#dc2626" },
              { label: "15. Processing for Interview", value: metrics.processingForNextRound, color: "#d97706" }
            ].map((m, idx) => (
              <div key={idx} style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", maxWidth: "130px" }}>{m.label}</span>
                <strong style={{ fontSize: "1.1rem", fontWeight: 900, color: m.color }}>{m.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Analytics Sections & Ratios */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* Left panel: SVG Funnel & Donut Charts */}
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#1e293b" }}>Pipeline Yield Funnel</h3>
              <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "2px 0 15px" }}>Visual candidate flow tracking throughout structural milestones.</p>
              {renderFunnelChart()}
            </div>
            
            <hr style={{ border: 0, borderTop: "1px solid #f1f5f9" }} />

            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#1e293b", marginBottom: "12px" }}>Candidate Status Distribution</h3>
              {renderDonutChart()}
            </div>
          </div>

          {/* Right panel: Ratios, Recruiter Insights & Client Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Conversion Ratios Grid */}
            <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#1e293b", marginBottom: "12px" }}>Client Conversion Ratios</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  { label: "Selection Ratio", value: `${selectionRatio}%`, desc: "Selections / Interviews", color: "#22c55e" },
                  { label: "Joining Ratio", value: `${joiningRatio}%`, desc: "Joins / Total Added", color: "#10b981" },
                  { label: "Rejection Ratio", value: `${rejectionRatio}%`, desc: "Rejections / Interviews", color: "#ef4444" },
                  { label: "Interview Conv.", value: `${interviewConversionRatio}%`, desc: "Selected / Attended", color: "#eab308" },
                  { label: "Offer-to-Join", value: `${offerToJoinRatio}%`, desc: "Joins / Selections", color: "#84cc16" },
                  { label: "Interest Yield", value: `${candidateInterestRatio}%`, desc: "Interested / Connected", color: "#2563eb" }
                ].map((r, i) => (
                  <div key={i} style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", display: "block" }}>{r.label}</span>
                    <strong style={{ fontSize: "1.3rem", fontWeight: 900, color: r.color, margin: "4px 0", display: "block" }}>{r.value}</strong>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 600 }}>{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruiter Insights panel */}
            <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#1e293b" }}>Recruiter Desk Insights</h3>
                <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#2563eb" }}>Productivity Dashboard</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>Total Candidates Handled</span>
                  <strong style={{ color: "#1e293b", fontWeight: 900 }}>{metrics.added}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>Total Successful Joins</span>
                  <strong style={{ color: "#16a34a", fontWeight: 900 }}>{metrics.joined}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>Conversion Efficiency</span>
                  <strong style={{ color: "#2563eb", fontWeight: 900 }}>{conversionEfficiency}%</strong>
                </div>

                <div style={{ borderTop: "1px dashed #e2e8f0", margin: "6px 0" }} />

                <div style={{ background: "#eff6ff", padding: "12px", borderRadius: "12px", border: "1px solid #dbeafe" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#1e3a8a", display: "flex", alignItems: "center", gap: "4px" }}>
                      <LucideAward size={14} /> Productivity Score
                    </span>
                    <strong style={{ fontSize: "0.95rem", fontWeight: 900, color: "#2563eb" }}>{productivityScore} / 100</strong>
                  </div>
                  <div style={{ height: "6px", background: "white", borderRadius: "100px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${productivityScore}%`, background: "linear-gradient(90deg, #2563eb, #3b82f6)", borderRadius: "100px" }} />
                  </div>
                  <p style={{ fontSize: "0.6rem", color: "#1e3a8a", fontWeight: 600, marginTop: "4px", marginBlockEnd: 0 }}>
                    Score mapped recruiter weightage algorithms (+50 Join, +30 Select, +20 Interview, +10 Connection).
                  </p>
                </div>
              </div>
            </div>

            {/* Client Info Card */}
            {role !== "tl" && (
              <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "10px" }}>Partner Information</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem" }}>
                  <div style={{ display: "flex", gap: "8px", color: "#475569" }}>
                    <LucideUser size={14} color="#94a3b8" style={{ marginTop: "2px" }} />
                    <div>
                      <strong style={{ color: "#334155" }}>{selectedClient.contactPerson || "N/A"}</strong>
                      <span style={{ fontSize: "0.65rem", display: "block", color: "#94a3b8" }}>CONTACT PERSON</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", color: "#475569" }}>
                    <LucideMail size={14} color="#94a3b8" style={{ marginTop: "2px" }} />
                    <div>
                      <a href={`mailto:${selectedClient.email}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 700 }}>{selectedClient.email || "N/A"}</a>
                      <span style={{ fontSize: "0.65rem", display: "block", color: "#94a3b8" }}>EMAIL</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", color: "#475569" }}>
                    <LucidePhone size={14} color="#94a3b8" style={{ marginTop: "2px" }} />
                    <div>
                      <a href={`tel:${selectedClient.phone}`} style={{ color: "#334155", textDecoration: "none", fontWeight: 700 }}>{selectedClient.phone || "N/A"}</a>
                      <span style={{ fontSize: "0.65rem", display: "block", color: "#94a3b8" }}>PHONE NUMBER</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", color: "#475569" }}>
                    <LucideCalendar size={14} color="#94a3b8" style={{ marginTop: "2px" }} />
                    <div>
                      <span style={{ color: "#334155", fontWeight: 700 }}>
                        {selectedClient.closingDate ? new Date(selectedClient.closingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "Open Mandate"}
                      </span>
                      <span style={{ fontSize: "0.65rem", display: "block", color: "#94a3b8" }}>CONTRACT DEADLINE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Associated Jobs / JDs (Show always to Recruiter, TL, Manager, Boss) */}
            <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", marginTop: "1rem" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "10px" }}>Active JDs / Jobs</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(() => {
                  const clientJobs = jobs.filter(j => String(j.clientId) === String(selectedClient.id));
                  if (clientJobs.length === 0) {
                    return <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No active jobs assigned to this client.</div>;
                  }
                  return clientJobs.map((job) => (
                    <div key={job.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                      <div>
                        <strong style={{ fontSize: "0.85rem", color: "#0f172a", display: "block" }}>{job.title}</strong>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                          Openings: {job.openings || "N/A"} | Exp: {job.minExp || 0}-{job.maxExp || 0} Yrs
                        </span>
                      </div>
                      <span style={{ fontSize: "0.65rem", padding: "3px 8px", borderRadius: "6px", background: "#eff6ff", color: "#2563eb", fontWeight: 800, textTransform: "uppercase" }}>
                        {job.jobType || "Full-Time"}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Sensitive Billing & Payment Config Card (Show ONLY to Boss and Managers, hidden from Recruiter and TL) */}
            {canEdit && (
              <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", marginTop: "1rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "10px" }}>Sensitive Billing & Payment</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
                  <div>
                    <span style={{ fontSize: "0.65rem", display: "block", color: "#94a3b8" }}>GST NO.</span>
                    <strong style={{ color: "#334155" }}>{selectedClient.gstNo || "N/A"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.65rem", display: "block", color: "#94a3b8" }}>ADDRESS</span>
                    <strong style={{ color: "#334155" }}>{selectedClient.address || "N/A"}</strong>
                  </div>
                  <div style={{ borderTop: "1px dashed #e2e8f0", margin: "4px 0" }} />
                  <div>
                    <span style={{ fontSize: "0.65rem", display: "block", color: "#94a3b8" }}>PAYMENT CONFIGURATION</span>
                    {selectedClient.paymentConfig ? (() => {
                      try {
                        const config = JSON.parse(selectedClient.paymentConfig);
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                            {config.paymentType === "milestone" ? (
                              <div>
                                💰 Milestone Target: <strong>{config.milestoneTarget}</strong> {config.milestoneType}(s) for <strong>₹{config.paymentAmount}</strong>
                              </div>
                            ) : (
                              <div>
                                💰 Per {config.paymentType === "per_joining" ? "Joining" : "Selection"}: <strong>₹{config.paymentAmount}</strong>
                              </div>
                            )}
                            
                            {config.jobs && config.jobs.length > 0 && (
                              <div style={{ marginTop: "6px" }}>
                                <span style={{ fontSize: "0.65rem", display: "block", color: "#2563eb", fontWeight: 800, marginBottom: "4px" }}>CUSTOM JOB PAYMENTS:</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", background: "#f8fafc", padding: "6px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                  {config.jobs.map((j: any, idx: number) => (
                                    <div key={idx} style={{ fontSize: "0.75rem", color: "#475569" }}>
                                      • {j.jobTitle}: {j.type === "milestone" ? (
                                        <span>Target <strong>{j.milestoneTarget}</strong> for <strong>₹{j.amount}</strong></span>
                                      ) : j.type === "global" ? (
                                        <span>Use Global Rule</span>
                                      ) : (
                                        <span>Per {j.type === "per_joining" ? "Joining" : "Selection"}: <strong>₹{j.amount}</strong></span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      } catch (e) {
                        return <span style={{ color: "#ef4444" }}>Error parsing configuration</span>;
                      }
                    })() : "No custom billing set."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabbed candidates & activity pipeline */}
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.02)", overflow: "hidden" }}>
          {/* Tab Selector */}
          <div style={{ display: "flex", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "0 1rem" }}>
            <button
              onClick={() => setActiveProfileTab("pipeline")}
              style={{
                padding: "16px 20px", border: "none", background: "none", fontSize: "0.85rem", fontWeight: 800,
                color: activeProfileTab === "pipeline" ? "#2563eb" : "#64748b",
                borderBottom: activeProfileTab === "pipeline" ? "3px solid #2563eb" : "3px solid transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
              }}
            >
              <LucideUserCheck size={16} />
              Candidate Pipeline ({searchedCandidates.length})
            </button>
            <button
              onClick={() => setActiveProfileTab("timeline")}
              style={{
                padding: "16px 20px", border: "none", background: "none", fontSize: "0.85rem", fontWeight: 800,
                color: activeProfileTab === "timeline" ? "#2563eb" : "#64748b",
                borderBottom: activeProfileTab === "timeline" ? "3px solid #2563eb" : "3px solid transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
              }}
            >
              <LucideActivity size={16} />
              Client Activity Feed ({timelineEvents.length})
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: "1.5rem" }}>
            {/* Candidate List Pipeline */}
            {activeProfileTab === "pipeline" && (
              <div>
                {/* Advanced Search Filter */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "1.25rem" }}>
                  <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                    <LucideSearch size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      placeholder="Search candidates by name, job role, phone, recruiter, or status..."
                      value={candidateSearchQuery}
                      onChange={(e) => setCandidateSearchQuery(e.target.value)}
                      style={{
                        padding: "10px 12px 10px 40px", width: "100%", borderRadius: "10px", border: "1px solid #e2e8f0",
                        fontSize: "0.85rem", outline: "none", background: "#f8fafc"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
                    Showing {searchedCandidates.length} of {filteredByDate.length} Candidates
                  </span>
                </div>

                {/* Candidate grid/table */}
                {searchedCandidates.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "#64748b", border: "1px dashed #e2e8f0", borderRadius: "12px" }}>
                    <LucideUserX size={32} style={{ opacity: 0.5, marginBottom: "8px", marginInlineStart: "auto", marginInlineEnd: "auto" }} />
                    <strong style={{ display: "block", fontSize: "0.9rem" }}>No candidates found</strong>
                    <span style={{ fontSize: "0.75rem" }}>Try a different search query or expand date filters.</span>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
                          <th style={{ padding: "10px", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Candidate Name</th>
                          <th style={{ padding: "10px", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Job Role</th>
                          <th style={{ padding: "10px", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Contact Number</th>
                          <th style={{ padding: "10px", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Recruiter</th>
                          <th style={{ padding: "10px", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Interview Status</th>
                          <th style={{ padding: "10px", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Joined/Rejected State</th>
                          <th style={{ padding: "10px", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Current Status</th>
                          <th style={{ padding: "10px", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Last Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchedCandidates.map((cand) => {
                          // Extract last activity note
                          const latestNoteText = cand.InteractionNotes && cand.InteractionNotes.length > 0 
                            ? cand.InteractionNotes[cand.InteractionNotes.length - 1].text 
                            : "Candidate registered in system";
                          
                          // Determine interview status
                          const isScheduled = hasStatusInHistory(cand, ["scheduled", "going for interview", "go for interview"]);
                          const isAttended = hasStatusInHistory(cand, ["attended", "went for interview", "selected", "rejected", "joined"]);
                          const isSelected = hasStatusInHistory(cand, ["selected", "joined"]);
                          
                          let interviewBadge = { text: "No Schedule", bg: "#f1f5f9", color: "#64748b" };
                          if (isSelected) {
                            interviewBadge = { text: "Converted (Selected)", bg: "#dcfce7", color: "#15803d" };
                          } else if (isAttended) {
                            interviewBadge = { text: "Attended Interview", bg: "#fef9c3", color: "#a16207" };
                          } else if (isScheduled) {
                            interviewBadge = { text: "Scheduled (Pending)", bg: "#dbeafe", color: "#1d4ed8" };
                          }

                          // Determine joined/rejected state
                          const isJoined = hasStatusInHistory(cand, ["joined", "yes (joined)"]);
                          const isRejected = hasStatusInHistory(cand, ["rejected", "dropped"]);
                          let finalStateBadge = { text: "Processing", bg: "#eff6ff", color: "#2563eb" };
                          if (isJoined) {
                            finalStateBadge = { text: "Successful Join", bg: "#dcfce7", color: "#166534" };
                          } else if (isRejected) {
                            finalStateBadge = { text: "Rejected / Dropped", bg: "#fee2e2", color: "#991b1b" };
                          }

                          // Current status badge color matching
                          const currentRem = (cand.remarks || cand.status || "New").toLowerCase();
                          let statusBadgeColor = { bg: "#f1f5f9", color: "#475569" }; // default Neutral grey
                          if (currentRem.includes("joined") || currentRem.includes("selected")) {
                            statusBadgeColor = { bg: "#dcfce7", color: "#166534" }; // Green
                          } else if (currentRem.includes("reject") || currentRem.includes("drop")) {
                            statusBadgeColor = { bg: "#fee2e2", color: "#ef4444" }; // Red
                          } else if (currentRem.includes("interview") || currentRem.includes("process")) {
                            statusBadgeColor = { bg: "#fef9c3", color: "#ca8a04" }; // Yellow
                          } else if (currentRem.includes("connected") || currentRem.includes("interested")) {
                            statusBadgeColor = { bg: "#dbeafe", color: "#2563eb" }; // Blue
                          }

                          return (
                            <tr key={cand.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "0.8rem" }} className="cand-row">
                              <td style={{ padding: "10px", fontWeight: 800, color: "#1e293b" }}>{cand.name}</td>
                              <td style={{ padding: "10px", fontWeight: 600, color: "#475569" }}>{cand.jobRole || cand.designation || "N/A"}</td>
                              <td style={{ padding: "10px", fontWeight: 700, color: "#475569" }}>
                                <a href={`tel:${cand.phone}`} style={{ color: "inherit", textDecoration: "none" }}>☎ {cand.phone}</a>
                              </td>
                              <td style={{ padding: "10px", fontWeight: 700, color: "#64748b" }}>{cand.recruiterName || cand.recruiter?.name || "System"}</td>
                              <td style={{ padding: "10px" }}>
                                <span style={{ fontSize: "0.65rem", padding: "4px 8px", borderRadius: "6px", background: interviewBadge.bg, color: interviewBadge.color, fontWeight: 800 }}>
                                  {interviewBadge.text}
                                </span>
                              </td>
                              <td style={{ padding: "10px" }}>
                                <span style={{ fontSize: "0.65rem", padding: "4px 8px", borderRadius: "6px", background: finalStateBadge.bg, color: finalStateBadge.color, fontWeight: 800 }}>
                                  {finalStateBadge.text}
                                </span>
                              </td>
                              <td style={{ padding: "10px" }}>
                                <span style={{ fontSize: "0.65rem", padding: "4px 8px", borderRadius: "6px", background: statusBadgeColor.bg, color: statusBadgeColor.color, fontWeight: 800, whiteSpace: "nowrap" }}>
                                  {(cand.remarks || cand.status || "New").toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: "10px", color: "#64748b", maxWidth: "200px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={latestNoteText}>
                                {latestNoteText}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Timeline feed */}
            {activeProfileTab === "timeline" && (
              <div>
                {timelineEvents.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "#64748b", border: "1px dashed #e2e8f0", borderRadius: "12px" }}>
                    <LucideActivity size={32} style={{ opacity: 0.5, marginBottom: "8px", marginInlineStart: "auto", marginInlineEnd: "auto" }} />
                    <strong style={{ display: "block", fontSize: "0.9rem" }}>No activity timeline registered</strong>
                    <span style={{ fontSize: "0.75rem" }}>Updates will appear dynamically as recruiters process candidate profiles.</span>
                  </div>
                ) : (
                  <div style={{ position: "relative", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Vertical line indicator */}
                    <div style={{ position: "absolute", left: "6px", top: "10px", bottom: "10px", width: "2px", background: "#e2e8f0" }} />
                    
                    {timelineEvents.map((event, idx) => {
                      const lowerText = event.text.toLowerCase();
                      
                      // Highlight matching icons/backgrounds for timeline items
                      let timelineColor = "#64748b"; // default grey
                      let IconComponent = LucideInfo;
                      
                      if (lowerText.includes("joined") || lowerText.includes("yes (joined)")) {
                        timelineColor = "#22c55e"; // Green
                        IconComponent = LucideUserCheck;
                      } else if (lowerText.includes("selected")) {
                        timelineColor = "#4ade80"; // Light Green
                        IconComponent = LucideAward;
                      } else if (lowerText.includes("rejected") || lowerText.includes("dropped")) {
                        timelineColor = "#ef4444"; // Red
                        IconComponent = LucideXCircle;
                      } else if (lowerText.includes("interview") || lowerText.includes("schedule")) {
                        timelineColor = "#eab308"; // Yellow
                        IconComponent = LucideCalendar;
                      } else if (lowerText.includes("connected") || lowerText.includes("interested")) {
                        timelineColor = "#2563eb"; // Blue
                        IconComponent = LucidePhone;
                      }

                      return (
                        <div key={idx} style={{ position: "relative" }}>
                          {/* Circle Dot Icon */}
                          <div style={{
                            position: "absolute", left: "-30px", top: "2px", width: "14px", height: "14px", borderRadius: "50%",
                            background: "white", border: `3px solid ${timelineColor}`, display: "flex", alignItems: "center", justifyContent: "center"
                          }} />
                          
                          <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1e293b" }}>
                                {event.candidateName} <span style={{ color: "#64748b", fontWeight: 500 }}>({event.candidateRole})</span>
                              </span>
                              <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 700 }}>
                                {new Date(event.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.8rem", color: "#475569", margin: "2px 0 6px" }}>
                              {event.text}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8" }}>
                              <LucideUser size={10} /> Sourced/Managed by {event.authorName}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </>
        ) : (
          (() => {
            const { processedCandidates, bulkMilestones, jobsCalculated, totalClientEarned, totalClientPending, billingDays } = getBillingMetrics();
            
            const totalPayout = totalClientEarned + totalClientPending;
            const progressPct = totalPayout > 0 ? Math.round((totalClientEarned / totalPayout) * 100) : 0;

            const filteredCandidates = processedCandidates.filter(cand => {
              const query = billingSearch.toLowerCase();
              const matchesSearch = (cand.name || "").toLowerCase().includes(query) ||
                                    (cand.jobRole || "").toLowerCase().includes(query);
              if (billingStatusFilter === "earned") return matchesSearch && cand.isCompleted;
              if (billingStatusFilter === "pending") return matchesSearch && !cand.isCompleted;
              return matchesSearch;
            });

            const countAll = processedCandidates.length;
            const countEarned = processedCandidates.filter(c => c.isCompleted).length;
            const countPending = processedCandidates.filter(c => !c.isCompleted).length;

            const exportToExcel = () => {
              if (!selectedClient) return;
              const invoiceNo = `INV-${selectedClient.id}-${Date.now().toString().slice(-6)}`;
              const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
              
              let html = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                    .invoice-title { font-size: 16pt; font-weight: bold; color: #1e3a8a; text-align: center; }
                    .section-header { font-size: 11pt; font-weight: bold; background-color: #f1f5f9; color: #1e293b; padding: 6px; border: 1px solid #cbd5e1; }
                    .table-header { background-color: #1e3a8a; color: white; font-weight: bold; text-align: left; }
                    td { padding: 6px; border: 0.5pt solid #cbd5e1; font-size: 9.5pt; }
                    .meta-label { font-weight: bold; color: #475569; }
                    .amount-cell { text-align: right; font-weight: bold; }
                    .earned-badge { color: #16a34a; font-weight: bold; }
                    .pending-badge { color: #b45309; font-weight: bold; }
                  </style>
                </head>
                <body>
                  <table>
                    <tr><td colspan="7" class="invoice-title">FAST RMS - LEGAL COMPANY BILL & PAYOUT STATEMENT</td></tr>
                    <tr><td colspan="7" style="text-align: center; font-size: 9pt; color: #64748b;">Generated on: ${dateStr} | Invoice Ref: ${invoiceNo}</td></tr>
                    <tr><td colspan="7"></td></tr>
                    
                    <tr>
                      <td colspan="3" class="section-header">BILLED TO (CLIENT DETAILS)</td>
                      <td colspan="4" class="section-header">BILL FROM (PARTNER PORTAL)</td>
                    </tr>
                    <tr>
                      <td class="meta-label">Client Name:</td><td colspan="2">${selectedClient.name}</td>
                      <td class="meta-label">Agency:</td><td colspan="3">FAST RMS PORTAL INC.</td>
                    </tr>
                    <tr>
                      <td class="meta-label">Client GST No:</td><td colspan="2">${selectedClient.gstNo || "N/A"}</td>
                      <td class="meta-label">GSTIN:</td><td colspan="3">08AABCF1234F1ZX</td>
                    </tr>
                    <tr>
                      <td class="meta-label">Address:</td><td colspan="2">${selectedClient.address || "N/A"}</td>
                      <td class="meta-label">Registered Office:</td><td colspan="3">Technology Hub, DLF Phase 3, Cyber City, Jaipur</td>
                    </tr>
                    <tr>
                      <td class="meta-label">Location:</td><td colspan="2">${selectedClient.location || "Global"}</td>
                      <td class="meta-label">Billing Cycle:</td><td colspan="3">${billingDays} Days Lock-in Term</td>
                    </tr>
                    
                    <tr><td colspan="7"></td></tr>
                    
                    <tr>
                      <td colspan="7" class="section-header">PAYOUT METRICS SUMMARY</td>
                    </tr>
                    <tr>
                      <td colspan="2" class="meta-label" style="background-color: #f0fdf4; color: #166534;">TOTAL EARNED PAYOUT:</td>
                      <td colspan="1" style="color: #166534; font-weight: bold; background-color: #f0fdf4; text-align: right;">₹${totalClientEarned.toLocaleString("en-IN")}</td>
                      <td colspan="2" class="meta-label" style="background-color: #fffbeb; color: #92400e;">TOTAL PENDING PAYOUT:</td>
                      <td colspan="2" style="color: #92400e; font-weight: bold; background-color: #fffbeb; text-align: right;">₹${totalClientPending.toLocaleString("en-IN")}</td>
                    </tr>
                    
                    <tr><td colspan="7"></td></tr>
                    
                    <tr><td colspan="7" class="section-header">PART 1: JOB-LEVEL PAYOUT STRUCTURE</td></tr>
                    <tr class="table-header" style="background-color: #1e3a8a; color: white;">
                      <td colspan="3" style="color: white; font-weight: bold;">Job Designation</td>
                      <td style="color: white; font-weight: bold; text-align: center;">Selections</td>
                      <td style="color: white; font-weight: bold; text-align: center;">Joinings</td>
                      <td style="color: white; font-weight: bold; text-align: right;">Earned Payout</td>
                      <td style="color: white; font-weight: bold; text-align: right;">Pending Payout</td>
                    </tr>
              `;
              
              jobsCalculated.forEach(j => {
                html += `
                    <tr>
                      <td colspan="3">${j.title}</td>
                      <td style="text-align: center;">${j.selectionsCount}</td>
                      <td style="text-align: center;">${j.joiningsCount}</td>
                      <td class="amount-cell" style="color: #16a34a;">₹${j.jobEarned.toLocaleString("en-IN")}</td>
                      <td class="amount-cell" style="color: #d97706;">₹${j.jobPending.toLocaleString("en-IN")}</td>
                    </tr>
                `;
              });
              
              html += `
                    <tr><td colspan="7"></td></tr>
                    <tr><td colspan="7" class="section-header">PART 2: ITEMIZED CANDIDATE AUDIT TRAIL</td></tr>
                    <tr class="table-header" style="background-color: #1e3a8a; color: white;">
                      <td style="color: white; font-weight: bold;">Candidate Name</td>
                      <td style="color: white; font-weight: bold;">Associated Job</td>
                      <td style="color: white; font-weight: bold; text-align: center;">Maturity Date</td>
                      <td style="color: white; font-weight: bold; text-align: center;">Maturity State</td>
                      <td style="color: white; font-weight: bold; text-align: center;">Base Status</td>
                      <td colspan="2" style="color: white; font-weight: bold; text-align: right;">Payout Amount</td>
                    </tr>
              `;
              
              processedCandidates.forEach(c => {
                const isCompStr = c.isCompleted ? "EARNED" : `PENDING (${c.daysRemaining} days left)`;
                const amtStr = c.payoutType === "milestone" ? "Milestone Model" : `₹${c.payoutAmount.toLocaleString("en-IN")}`;
                html += `
                    <tr>
                      <td style="font-weight: bold;">${c.name}</td>
                      <td>${c.jobRole}</td>
                      <td style="text-align: center;">${c.payoutDate ? new Date(c.payoutDate).toLocaleDateString("en-IN") : "-"}</td>
                      <td style="text-align: center;" class="${c.isCompleted ? 'earned-badge' : 'pending-badge'}">${isCompStr}</td>
                      <td style="text-align: center;">${c.statusLabel}</td>
                      <td colspan="2" class="amount-cell">${amtStr}</td>
                    </tr>
                `;
              });
              
              if (bulkMilestones.length > 0) {
                html += `
                    <tr><td colspan="7"></td></tr>
                    <tr><td colspan="7" class="section-header">PART 3: BULK MILESTONE SCHEME METRICS</td></tr>
                    <tr class="table-header" style="background-color: #1e3a8a; color: white;">
                      <td colspan="2" style="color: white; font-weight: bold;">Milestone Designation Scheme</td>
                      <td style="color: white; font-weight: bold; text-align: center;">Target Required</td>
                      <td style="color: white; font-weight: bold; text-align: center;">Current Completed</td>
                      <td style="color: white; font-weight: bold; text-align: center;">Maturity Status</td>
                      <td colspan="2" style="color: white; font-weight: bold; text-align: right;">Reward Value</td>
                    </tr>
                `;
                bulkMilestones.forEach(m => {
                  html += `
                    <tr>
                      <td colspan="2" style="font-weight: bold;">${m.jobTitle}</td>
                      <td style="text-align: center;">${m.target}</td>
                      <td style="text-align: center;">${m.completedCount}</td>
                      <td style="text-align: center;">${m.isMilestoneEarned ? "UNLOCKED" : "PROGRESSING"}</td>
                      <td colspan="2" class="amount-cell">₹${m.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  `;
                });
              }
              
              html += `
                    <tr><td colspan="7"></td></tr>
                    <tr><td colspan="7" style="font-size: 8.5pt; color: #64748b; font-style: italic; text-align: center; border: none; padding-top: 15px;">"This statement is a legally binding payment document generated dynamically in accordance with bilateral service agreements and verified recruiting milestones. All payouts are computed based on the specified ${billingDays} Days contract terms."</td></tr>
                  </table>
                </body>
                </html>
              `;
              
              const blob = new Blob([html], { type: "application/vnd.ms-excel" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `BillStatement_${selectedClient.name.replace(/\s+/g, "_")}_${invoiceNo}.xls`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            };

            const exportToPDF = () => {
              if (!selectedClient) return;
              const invoiceNo = `INV-${selectedClient.id}-${Date.now().toString().slice(-6)}`;
              const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
              
              const printWindow = window.open("", "_blank");
              if (!printWindow) return;
              
              const clientGST = selectedClient.gstNo || "Not Specified";
              const clientAddr = selectedClient.address || "Not Specified";
              
              const jobsRows = jobsCalculated.map(j => `
                <tr>
                  <td>${j.title}</td>
                  <td style="text-align: center;">${j.selectionsCount}</td>
                  <td style="text-align: center;">${j.joiningsCount}</td>
                  <td style="text-align: right; color: #16a34a; font-weight: 700;">₹${j.jobEarned.toLocaleString("en-IN")}</td>
                  <td style="text-align: right; color: #d97706; font-weight: 700;">₹${j.jobPending.toLocaleString("en-IN")}</td>
                </tr>
              `).join("");
              
              const candidateRows = processedCandidates.map(c => `
                <tr>
                  <td style="font-weight: 800; color: #0f172a;">${c.name}</td>
                  <td style="color: #475569;">${c.jobRole}</td>
                  <td style="text-align: center; color: #64748b;">${c.payoutDate ? new Date(c.payoutDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                  <td style="text-align: center;">
                    <span style="font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 800; ${c.isCompleted ? 'background: #dcfce7; color: #15803d;' : 'background: #fff9db; color: #b27b00;'}">
                      ${c.isCompleted ? 'EARNED (COMPLETED)' : `PENDING (${c.daysRemaining}d left)`}
                    </span>
                  </td>
                  <td style="text-align: right; font-weight: 800; color: #0f172a;">
                    ${c.payoutType === "milestone" ? '<span style="color:#64748b; font-style:italic; font-size:0.65rem">Milestone Model</span>' : `₹${c.payoutAmount.toLocaleString("en-IN")}`}
                  </td>
                </tr>
              `).join("");

              const milestonesRows = bulkMilestones.map(m => `
                <tr>
                  <td style="font-weight: 800; color: #0f172a;">${m.jobTitle}</td>
                  <td style="text-align: center;">${m.target}</td>
                  <td style="text-align: center;">${m.completedCount}</td>
                  <td style="text-align: center;">
                    <span style="font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 800; ${m.isMilestoneEarned ? 'background: #dcfce7; color: #15803d;' : 'background: #eff6ff; color: #1e40af;'}">
                      ${m.isMilestoneEarned ? '✔ UNLOCKED' : '⌛ INCOMPLETE'}
                    </span>
                  </td>
                  <td style="text-align: right; font-weight: 800; color: #0f172a;">₹${m.amount.toLocaleString("en-IN")}</td>
                </tr>
              `).join("");

              const milestoneSection = bulkMilestones.length > 0 ? `
                <div class="section-title">PART 3: BULK MILESTONE SCHEMES AUDIT</div>
                <table>
                  <thead>
                    <tr>
                      <th>Milestone Job Scheme</th>
                      <th style="text-align: center;">Target Required</th>
                      <th style="text-align: center;">Current Completed</th>
                      <th style="text-align: center;">Maturity State</th>
                      <th style="text-align: right;">Reward Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${milestonesRows}
                  </tbody>
                </table>
              ` : "";

              printWindow.document.write(`
                <html>
                <head>
                  <title>Invoice Statement - ${selectedClient.name}</title>
                  <style>
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                    * { box-sizing: border-box; }
                    body {
                      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
                      margin: 0;
                      padding: 40px;
                      color: #1e293b;
                      background: #ffffff;
                    }
                    .header-table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-bottom: 30px;
                    }
                    .header-table td {
                      border: none !important;
                      padding: 0 !important;
                    }
                    .brand-name {
                      font-size: 24px;
                      font-weight: 800;
                      color: #1e3a8a;
                      letter-spacing: -0.5px;
                    }
                    .brand-sub {
                      font-size: 11px;
                      color: #64748b;
                      font-weight: 600;
                      margin-top: 2px;
                    }
                    .invoice-banner {
                      text-align: right;
                      font-size: 28px;
                      font-weight: 900;
                      color: #0f172a;
                      letter-spacing: -1px;
                    }
                    .invoice-ref {
                      text-align: right;
                      font-size: 11px;
                      color: #64748b;
                      font-weight: 700;
                      margin-top: 4px;
                    }
                    .details-grid {
                      display: grid;
                      grid-template-columns: 1.2fr 1fr;
                      gap: 40px;
                      margin-bottom: 35px;
                      padding-bottom: 25px;
                      border-bottom: 1.5px dashed #e2e8f0;
                    }
                    .details-block h4 {
                      font-size: 11px;
                      color: #94a3b8;
                      text-transform: uppercase;
                      margin: 0 0 10px 0;
                      letter-spacing: 0.5px;
                      font-weight: 800;
                    }
                    .details-block p {
                      margin: 0 0 6px 0;
                      font-size: 13px;
                      font-weight: 600;
                      color: #334155;
                    }
                    .details-block p strong {
                      color: #0f172a;
                    }
                    .metrics-bar {
                      display: grid;
                      grid-template-columns: repeat(3, 1fr);
                      gap: 15px;
                      margin-bottom: 35px;
                    }
                    .metric-card {
                      padding: 15px;
                      border-radius: 8px;
                      border: 1px solid #e2e8f0;
                    }
                    .metric-card-earned {
                      background: #f0fdf4;
                      border-color: #bfeecb;
                    }
                    .metric-card-pending {
                      background: #fffbeb;
                      border-color: #fef3c7;
                    }
                    .metric-card-term {
                      background: #eff6ff;
                      border-color: #dbeafe;
                    }
                    .metric-label {
                      font-size: 9px;
                      font-weight: 800;
                      color: #64748b;
                      text-transform: uppercase;
                      margin-bottom: 6px;
                    }
                    .metric-card-earned .metric-label { color: #16a34a; }
                    .metric-card-pending .metric-label { color: #d97706; }
                    .metric-card-term .metric-label { color: #2563eb; }
                    
                    .metric-val {
                      font-size: 20px;
                      font-weight: 800;
                      color: #0f172a;
                    }
                    .metric-card-earned .metric-val { color: #166534; }
                    .metric-card-pending .metric-val { color: #92400e; }
                    .metric-card-term .metric-val { color: #1e40af; }

                    .section-title {
                      font-size: 11px;
                      font-weight: 800;
                      color: #475569;
                      text-transform: uppercase;
                      letter-spacing: 0.8px;
                      margin: 25px 0 10px 0;
                      background: #f8fafc;
                      padding: 6px 10px;
                      border-radius: 4px;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-bottom: 30px;
                    }
                    th {
                      font-size: 10px;
                      font-weight: 800;
                      color: #475569;
                      text-transform: uppercase;
                      text-align: left;
                      padding: 8px 10px;
                      border-bottom: 1.5px solid #cbd5e1;
                    }
                    td {
                      font-size: 11px;
                      padding: 10px;
                      border-bottom: 1px solid #e2e8f0;
                      font-weight: 600;
                      color: #475569;
                    }
                    .legal-footer {
                      margin-top: 50px;
                      border-top: 1px solid #e2e8f0;
                      padding-top: 20px;
                      font-size: 9px;
                      color: #94a3b8;
                      text-align: center;
                      line-height: 1.5;
                    }
                    .declaration-text {
                      font-style: italic;
                      margin-bottom: 30px;
                    }
                    .sign-grid {
                      display: grid;
                      grid-template-columns: 1fr 1fr;
                      gap: 100px;
                      margin-top: 60px;
                      margin-bottom: 20px;
                    }
                    .sign-block {
                      border-top: 1px solid #cbd5e1;
                      padding-top: 8px;
                      text-align: center;
                      font-size: 11px;
                      font-weight: 700;
                      color: #475569;
                    }
                  </style>
                </head>
                <body>
                  <table class="header-table">
                    <tr>
                      <td>
                        <div class="brand-name">FAST RMS PORTAL INC.</div>
                        <div class="brand-sub">Organizational Partnership & Mandate Billing Invoice</div>
                      </td>
                      <td>
                        <div class="invoice-banner">LEGAL INVOICE STATEMENT</div>
                        <div class="invoice-ref">Reference: ${invoiceNo} | Date: ${dateStr}</div>
                      </td>
                    </tr>
                  </table>

                  <div class="details-grid">
                    <div class="details-block">
                      <h4>BILLED TO (CLIENT PARTNERSHIP)</h4>
                      <p style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">${selectedClient.name}</p>
                      <p><strong>GSTIN:</strong> ${clientGST}</p>
                      <p><strong>Address:</strong> ${clientAddr}</p>
                      <p><strong>Sector:</strong> ${selectedClient.location || "Global"} | ${selectedClient.industry || "General"}</p>
                    </div>
                    <div class="details-block">
                      <h4>BILL FROM (PARTNER DETAILS)</h4>
                      <p style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">FAST RMS PORTAL INC.</p>
                      <p><strong>GSTIN:</strong> 08AABCF1234F1ZX</p>
                      <p><strong>Registered Office:</strong> Technology Hub, DLF Phase 3, Cyber City, Jaipur</p>
                      <p><strong>Support & Billing:</strong> billing@fastrms.com</p>
                    </div>
                  </div>

                  <div class="metrics-bar">
                    <div class="metric-card metric-card-earned">
                      <div class="metric-label">TOTAL MATURED EARNED PAYOUT</div>
                      <div class="metric-val">₹${totalClientEarned.toLocaleString("en-IN")}</div>
                    </div>
                    <div class="metric-card metric-card-pending">
                      <div class="metric-label">IN-PROGRESS UNMATURED PAYOUT</div>
                      <div class="metric-val">₹${totalClientPending.toLocaleString("en-IN")}</div>
                    </div>
                    <div class="metric-card metric-card-term">
                      <div class="metric-label">BILLING CYCLE TERMS</div>
                      <div class="metric-val">${billingDays} Days lock-in</div>
                    </div>
                  </div>

                  <div class="section-title">PART 1: JOB-LEVEL RESOURCE OUTCOMES</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Job Designation</th>
                        <th style="text-align: center;">Selections</th>
                        <th style="text-align: center;">Joinings</th>
                        <th style="text-align: right;">Realized Earned Payout</th>
                        <th style="text-align: right;">Unmatured Pending Cycle</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${jobsRows}
                    </tbody>
                  </table>

                  <div class="section-title">PART 2: ITEMIZED CANDIDATE AUDIT TRAIL</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Candidate Placement Name</th>
                        <th>Job designation</th>
                        <th style="text-align: center;">Maturity Target Date</th>
                        <th style="text-align: center;">Billing State</th>
                        <th style="text-align: right;">Payout Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${candidateRows}
                    </tbody>
                  </table>

                  ${milestoneSection}

                  <div class="sign-grid">
                    <div class="sign-block">Authorized Signatory (Client Partner)</div>
                    <div class="sign-block">Accounts Division (FAST RMS Portal)</div>
                  </div>

                  <div class="legal-footer">
                    <div class="declaration-text">"This invoice is a legally binding payment document generated dynamically in accordance with bilateral service agreements and verified recruiting milestones. All payouts are computed based on the specified ${billingDays} Days contract terms."</div>
                    <div>FAST RMS Inc. | This is a computer generated billing statement and requires no physical signatures to be valid under Information Technology Act, 2000.</div>
                  </div>

                  <script>
                    window.onload = function() {
                      setTimeout(function() {
                        window.print();
                      }, 500);
                    };
                  </script>
                </body>
                </html>
              `);
              printWindow.document.close();
            };

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {/* Sleek Top Metrics Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
                  
                  {/* Earned Card */}
                  <div style={{ 
                    background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "10px", 
                    border: "1px solid #bfeecb", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    transition: "transform 0.2s"
                  }}>
                    <div>
                      <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.4px", display: "block" }}>Total Earned</span>
                      <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#166534", margin: "2px 0 0" }}>₹{totalClientEarned.toLocaleString("en-IN")}</h2>
                      <span style={{ fontSize: "0.55rem", color: "#65a30d", fontWeight: 700 }}>Days completed payouts</span>
                    </div>
                    <div style={{ background: "#dcfce7", color: "#166534", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LucideTrendingUp size={14} strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Pending Card */}
                  <div style={{ 
                    background: "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "10px", 
                    border: "1px solid #fef3c7", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                  }}>
                    <div>
                      <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.4px", display: "block" }}>In-Progress Lock</span>
                      <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#92400e", margin: "2px 0 0" }}>₹{totalClientPending.toLocaleString("en-IN")}</h2>
                      <span style={{ fontSize: "0.55rem", color: "#b45309", fontWeight: 700 }}>Active days countdown</span>
                    </div>
                    <div style={{ background: "#fef3c7", color: "#92400e", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LucideClock size={14} strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Contract Days Card */}
                  <div style={{ 
                    background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "10px", 
                    border: "1px solid #dbeafe", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                  }}>
                    <div>
                      <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.4px", display: "block" }}>Billing Term</span>
                      <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#1e40af", margin: "2px 0 0" }}>{billingDays} Days</h2>
                      <span style={{ fontSize: "0.55rem", color: "#3b82f6", fontWeight: 700 }}>Contract lock-in duration</span>
                    </div>
                    <div style={{ background: "#dbeafe", color: "#1e40af", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LucideCalendar size={14} strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Achievements Efficiency Card */}
                  <div style={{ 
                    background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)", 
                    padding: "0.5rem 0.75rem", 
                    borderRadius: "10px", 
                    border: "1px solid #f3e8ff", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                  }}>
                    <div>
                      <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.4px", display: "block" }}>Realized Rate</span>
                      <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#5b21b6", margin: "2px 0 0" }}>{progressPct}%</h2>
                      <span style={{ fontSize: "0.55rem", color: "#8b5cf6", fontWeight: 700 }}>Earned vs potential payout</span>
                    </div>
                    <div style={{ background: "#f3e8ff", color: "#5b21b6", padding: "6px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LucidePercent size={14} strokeWidth={2.5} />
                    </div>
                  </div>

                </div>

                {/* Sub-grid: Associated Jobs + Milestone Targets */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: bulkMilestones.length > 0 ? "1.2fr 1fr" : "1fr", 
                  gap: "0.5rem" 
                }}>
                  
                  {/* Associated Jobs */}
                  <div style={{ background: "white", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <h3 style={{ margin: 0, fontSize: "0.75rem", fontWeight: 900, color: "#1e293b", display: "flex", alignItems: "center", gap: "4px" }}>
                        💼 Job-Level Payout Summary
                      </h3>
                      <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>Calculated from candidate logs</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                          <tr style={{ borderBottom: "1.5px solid #f1f5f9", fontSize: "0.6rem", color: "#64748b", textTransform: "uppercase", fontWeight: 800 }}>
                            <th style={{ padding: "4px 6px" }}>Designation</th>
                            <th style={{ padding: "4px 6px", textAlign: "center" }}>Sels</th>
                            <th style={{ padding: "4px 6px", textAlign: "center" }}>Joins</th>
                            <th style={{ padding: "4px 6px", textAlign: "right" }}>Earned</th>
                            <th style={{ padding: "4px 6px", textAlign: "right" }}>Pending</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobsCalculated.map(job => (
                            <tr key={job.id} style={{ borderBottom: "1px solid #f8fafc", fontSize: "0.7rem", fontWeight: 700, color: "#475569" }}>
                              <td style={{ padding: "4px 6px", color: "#0f172a", fontWeight: 800 }}>{job.title}</td>
                              <td style={{ padding: "4px 6px", textAlign: "center", color: "#334155" }}>{job.selectionsCount}</td>
                              <td style={{ padding: "4px 6px", textAlign: "center", color: "#334155" }}>{job.joiningsCount}</td>
                              <td style={{ padding: "4px 6px", textAlign: "right", color: "#16a34a" }}>₹{job.jobEarned.toLocaleString("en-IN")}</td>
                              <td style={{ padding: "4px 6px", textAlign: "right", color: "#d97706" }}>₹{job.jobPending.toLocaleString("en-IN")}</td>
                            </tr>
                          ))}
                          {jobsCalculated.length === 0 && (
                            <tr>
                              <td colSpan={5} style={{ padding: "10px", textAlign: "center", color: "#94a3b8", fontSize: "0.65rem", fontWeight: 700 }}>
                                No jobs associated with this client.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Milestones Targets Progress */}
                  {bulkMilestones.length > 0 && (
                    <div style={{ background: "white", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
                      <h3 style={{ margin: 0, fontSize: "0.75rem", fontWeight: 900, color: "#1e293b", marginBottom: "6px" }}>
                        🏆 Milestone Achievements
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {bulkMilestones.map((m, idx) => {
                          const progress = Math.min((m.completedCount / m.target) * 100, 100);
                          const isComplete = m.completedCount >= m.target;
                          return (
                            <div key={idx} style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px", marginBottom: "4px" }}>
                                <div style={{ maxWidth: "60%" }}>
                                  <strong style={{ fontSize: "0.7rem", color: "#0f172a", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={m.jobTitle}>
                                    {m.jobTitle}
                                  </strong>
                                  <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 700 }}>
                                    Need {m.target} {m.type}s
                                  </span>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <span style={{ fontSize: "0.65rem", fontWeight: 800, color: isComplete ? "#16a34a" : "#2563eb" }}>
                                    {m.completedCount}/{m.target}
                                  </span>
                                  <strong style={{ display: "block", fontSize: "0.65rem", color: "#475569" }}>₹{m.amount.toLocaleString("en-IN")}</strong>
                                </div>
                              </div>
                              
                              <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "100px", overflow: "hidden", marginBottom: "2px" }}>
                                <div style={{ 
                                  height: "100%", 
                                  width: `${progress}%`, 
                                  background: isComplete ? "linear-gradient(90deg, #16a34a, #22c55e)" : "linear-gradient(90deg, #2563eb, #60a5fa)", 
                                  borderRadius: "100px", 
                                  transition: "width 0.4s ease" 
                                }} />
                              </div>

                              <span style={{ fontSize: "0.55rem", fontWeight: 700, color: isComplete ? "#16a34a" : "#64748b", display: "block" }}>
                                {isComplete ? "✔ Completed & Unlocked!" : `⌛ Pending: ${m.target - m.completedCount} more candidates`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

                {/* Candidate Billing Tracking table (Full Width) */}
                <div style={{ background: "white", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
                  
                  {/* Interactive Header & Toolbar */}
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    gap: "10px", 
                    marginBottom: "8px",
                    flexWrap: "wrap" 
                  }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "0.75rem", fontWeight: 900, color: "#1e293b" }}>
                        👥 Candidate Billing Tracking & Countdown
                      </h3>
                      <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700 }}>
                        Monitoring payout maturity from selection/joining dates
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      
                      {/* Interactive Custom Search */}
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <LucideSearch size={12} style={{ position: "absolute", left: "8px", color: "#94a3b8" }} />
                        <input 
                          type="text"
                          placeholder="Search cand..."
                          value={billingSearch}
                          onChange={e => setBillingSearch(e.target.value)}
                          style={{
                            padding: "4px 8px 4px 24px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "0.65rem",
                            outline: "none",
                            width: "120px",
                            background: "#f8fafc",
                            fontWeight: 700,
                            color: "#334155",
                            transition: "all 0.2s"
                          }}
                          className="billing-search-input"
                        />
                      </div>

                      {/* Filter Pills */}
                      <div style={{ display: "flex", background: "#f1f5f9", padding: "2px", borderRadius: "8px", border: "1px solid #e2e8f0", gap: "2px" }}>
                        <button
                          onClick={() => setBillingStatusFilter("all")}
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "none",
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            background: billingStatusFilter === "all" ? "#fff" : "transparent",
                            color: billingStatusFilter === "all" ? "#0f172a" : "#64748b",
                            boxShadow: billingStatusFilter === "all" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                            transition: "all 0.15s"
                          }}
                        >
                          All ({countAll})
                        </button>
                        <button
                          onClick={() => setBillingStatusFilter("earned")}
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "none",
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            background: billingStatusFilter === "earned" ? "#dcfce7" : "transparent",
                            color: billingStatusFilter === "earned" ? "#166534" : "#64748b",
                            boxShadow: billingStatusFilter === "earned" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                            transition: "all 0.15s"
                          }}
                        >
                          Earned ({countEarned})
                        </button>
                        <button
                          onClick={() => setBillingStatusFilter("pending")}
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "none",
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            background: billingStatusFilter === "pending" ? "#fffbeb" : "transparent",
                            color: billingStatusFilter === "pending" ? "#b45309" : "#64748b",
                            boxShadow: billingStatusFilter === "pending" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                            transition: "all 0.15s"
                          }}
                        >
                          Pending ({countPending})
                        </button>
                      </div>

                      {/* Test Data Toggle */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", padding: "3px 8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.58rem", fontWeight: 800, color: useTestData ? "#4f46e5" : "#64748b" }}>
                          🧪 Test Data
                        </span>
                        <button
                          onClick={() => setUseTestData(!useTestData)}
                          style={{
                            width: "30px",
                            height: "16px",
                            borderRadius: "100px",
                            background: useTestData ? "#4f46e5" : "#cbd5e1",
                            border: "none",
                            position: "relative",
                            cursor: "pointer",
                            transition: "background 0.2s",
                            padding: 0,
                            display: "flex",
                            alignItems: "center"
                          }}
                          title="Toggle fake mock candidates for invoice testing"
                        >
                          <div style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: "white",
                            position: "absolute",
                            left: useTestData ? "15px" : "3px",
                            transition: "left 0.2s",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.15)"
                          }} />
                        </button>
                      </div>

                      {/* Export Actions */}
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={exportToExcel}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "8px",
                            border: "1px solid #16a34a",
                            background: "#f0fdf4",
                            color: "#166534",
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                            transition: "all 0.2s"
                          }}
                          className="export-btn-excel"
                          title="Download Legal Excel Bill"
                        >
                          <span style={{ fontSize: "0.7rem" }}>🟢</span> Excel Bill
                        </button>
                        <button
                          onClick={exportToPDF}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "8px",
                            border: "1px solid #ef4444",
                            background: "#fef2f2",
                            color: "#991b1b",
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                            transition: "all 0.2s"
                          }}
                          className="export-btn-pdf"
                          title="Print/Save Legal PDF Invoice"
                        >
                          <span style={{ fontSize: "0.7rem" }}>📄</span> PDF Invoice
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Clean Grid Table */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1.5px solid #f1f5f9", fontSize: "0.6rem", color: "#64748b", textTransform: "uppercase", fontWeight: 800 }}>
                          <th style={{ padding: "4px 6px" }}>Candidate</th>
                          <th style={{ padding: "4px 6px" }}>Job Role</th>
                          <th style={{ padding: "4px 6px", textAlign: "center" }}>Status</th>
                          <th style={{ padding: "4px 6px" }}>Maturity Date</th>
                          <th style={{ padding: "4px 6px", textAlign: "right" }}>Amount</th>
                          <th style={{ padding: "4px 6px", textAlign: "center" }}>Billing State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCandidates.map(cand => (
                          <tr key={cand.id} style={{ borderBottom: "1px solid #f8fafc", fontSize: "0.68rem", color: "#334155" }} className="cand-row">
                            <td style={{ padding: "4px 6px", fontWeight: 800, color: "#0f172a" }}>{cand.name}</td>
                            <td style={{ padding: "4px 6px", fontWeight: 700, color: "#475569" }}>{cand.jobRole}</td>
                            <td style={{ padding: "4px 6px", textAlign: "center" }}>
                              <span style={{ 
                                fontSize: "0.55rem", 
                                padding: "1px 4px", 
                                borderRadius: "4px", 
                                background: cand.statusLabel === "Joined" ? "#e6fbf4" : "#eff6ff", 
                                color: cand.statusLabel === "Joined" ? "#047857" : "#2563eb", 
                                fontWeight: 800 
                              }}>
                                {cand.statusLabel.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: "4px 6px", fontWeight: 700, color: "#64748b" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                <LucideCalendar size={10} style={{ opacity: 0.6 }} />
                                {cand.payoutDate ? new Date(cand.payoutDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                              </span>
                            </td>
                            <td style={{ padding: "4px 6px", fontWeight: 800, color: "#0f172a", textAlign: "right" }}>
                              {cand.payoutType === "milestone" ? (
                                <span style={{ color: "#64748b", fontStyle: "italic", fontSize: "0.6rem" }}>Milestone Model</span>
                              ) : (
                                `₹${cand.payoutAmount.toLocaleString("en-IN")}`
                              )}
                            </td>
                            <td style={{ padding: "4px 6px", textAlign: "center" }}>
                              {cand.isCompleted ? (
                                <span style={{ 
                                  fontSize: "0.58rem", 
                                  padding: "2px 6px", 
                                  borderRadius: "6px", 
                                  background: "#dcfce7", 
                                  color: "#15803d", 
                                  fontWeight: 800,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}>
                                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#16a34a" }} />
                                  EARNED
                                </span>
                              ) : (
                                <span style={{ 
                                  fontSize: "0.58rem", 
                                  padding: "2px 6px", 
                                  borderRadius: "6px", 
                                  background: "#fff9db", 
                                  color: "#b27b00", 
                                  fontWeight: 800, 
                                  display: "inline-flex", 
                                  alignItems: "center", 
                                  gap: "4px"
                                }}>
                                  <span className="blinking-dot-amber" />
                                  PENDING ({cand.daysRemaining}d left)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredCandidates.length === 0 && (
                          <tr>
                            <td colSpan={6} style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontWeight: 700, fontSize: "0.68rem" }}>
                              No billing records match the filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        <style>{`
          .cand-row:hover { background-color: #f8fafc !important; }
          .blinking-dot-amber {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #d97706;
            animation: pulse-amber 1.5s infinite ease-in-out;
          }
          @keyframes pulse-amber {
            0% {
              transform: scale(0.85);
              box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.6);
            }
            70% {
              transform: scale(1.1);
              box-shadow: 0 0 0 4px rgba(217, 119, 6, 0);
            }
            100% {
              transform: scale(0.85);
              box-shadow: 0 0 0 0 rgba(217, 119, 6, 0);
            }
          }
          .billing-search-input:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
            background: white !important;
          }
          .export-btn-excel:hover {
            background-color: #16a34a !important;
            color: white !important;
            transform: translateY(-1px);
          }
          .export-btn-pdf:hover {
            background-color: #ef4444 !important;
            color: white !important;
            transform: translateY(-1px);
          }
        `}</style>
      </motion.div>
    );
  }
  return (
    <div className="clients-container" style={{ padding: "1.25rem", height: "100%", background: "transparent" }}>
      {/* Header Section */}
      <div className="flex-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
          <div className="header-text">
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
              <span style={{ color: "#0f172a" }}>Our </span>
              <span style={{ color: "#2563eb" }}>Clients</span>
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Management of organizational partnerships and mandates.</p>
          </div>

          {/* Client Status Toggle */}
          <div style={{ display: "flex", background: "#f8fafc", padding: "4px", borderRadius: "14px", border: "1px solid #e2e8f0", gap: "2px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
            <button 
              onClick={() => setClientStatusTab("opened")}
              style={{ 
                padding: "8px 20px", 
                borderRadius: "10px", 
                border: "none", 
                background: clientStatusTab === "opened" ? "white" : "transparent",
                color: clientStatusTab === "opened" ? "#2563eb" : "#64748b",
                fontWeight: 800,
                fontSize: "0.8rem",
                cursor: "pointer",
                boxShadow: clientStatusTab === "opened" ? "0 4px 12px rgba(37, 99, 235, 0.1)" : "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap"
              }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }}></div>
              Client Opened
            </button>
            <button 
              onClick={() => setClientStatusTab("closed")}
              style={{ 
                padding: "8px 20px", 
                borderRadius: "10px", 
                border: "none", 
                background: clientStatusTab === "closed" ? "white" : "transparent",
                color: clientStatusTab === "closed" ? "#ef4444" : "#64748b",
                fontWeight: 800,
                fontSize: "0.8rem",
                cursor: "pointer",
                boxShadow: clientStatusTab === "closed" ? "0 4px 12px rgba(239, 68, 68, 0.1)" : "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap"
              }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }}></div>
              Client Closed
            </button>
          </div>
        </div>
        {canEdit && (
          <button 
            className="btn-primary" 
            onClick={() => setView("add")}
            style={{ 
              padding: "0 15px", 
              borderRadius: "10px", 
              height: "36px", 
              fontSize: "0.85rem", 
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap"
            }}
          >
            <LucidePlus size={16} strokeWidth={3} /> Add Client
          </button>
        )}
      </div>

      {/* Search Row */}
      <div style={{ background: "white", padding: "0.5rem 0.75rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", marginBottom: "1.5rem", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <LucideSearch size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input 
            type="text" 
            placeholder="Filter clients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: "100%",
              padding: "8px 12px 8px 36px", 
              borderRadius: "10px", 
              border: "1px solid #cbd5e1", 
              outline: "none",
              fontSize: "0.85rem",
              transition: "all 0.2s ease",
              background: "white"
            }}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: "300px" }}>
          <LucideLoader2 className="animate-spin" size={32} color="#2563eb" />
        </div>
      ) : filteredClients.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card flex-center flex-column p-large" 
          style={{ height: "300px", background: "white", borderRadius: "16px", border: "1px solid #f1f5f9" }}
        >
          <LucideBuilding2 size={48} color="#e2e8f0" style={{ marginBottom: "15px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>No Clients Found</h3>
          <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", marginTop: "5px" }}>{searchQuery ? "Try a different search query." : "Initialize your first client partnership."}</p>
        </motion.div>
      ) : (
        <div className="clients-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          <AnimatePresence>
            {filteredClients.map((client) => (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => {
                  if (role !== "recruiter") {
                    setSelectedClient(client);
                    setView("profile");
                  }
                }}
                className="client-node-card-compact"
                style={{ 
                  background: "white",
                  borderRadius: "16px",
                  padding: "1rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  border: "1px solid #f1f5f9",
                  transition: "all 0.2s ease",
                  position: "relative",
                  cursor: role === "recruiter" ? "default" : "pointer"
                }}
              >
                <div className="card-top flex-between mb-small" style={{ alignItems: "flex-start" }}>
                  <div className="flex gap-small">
                    <div className="client-icon flex-center" style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f8fafc", color: "#2563eb", border: "1px solid #eff6ff" }}>
                      <LucideBuilding2 size={20} strokeWidth={2.5} />
                    </div>
                    <div className="client-titles">
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#1e293b" }}>{client.name}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, marginTop: "2px" }}>
                        <LucideBriefcase size={12} strokeWidth={3} /> {client.industry || "General"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {canEdit && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartEditClient(client); }}
                          style={{
                            padding: "5px 10px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "white",
                            color: "#475569",
                            fontWeight: 800,
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            whiteSpace: "nowrap",
                            transition: "all 0.2s ease"
                          }}
                          className="edit-client-btn"
                        >
                          ✏ Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleHoldClient(client); }}
                          style={{
                            padding: "5px 10px",
                            borderRadius: "8px",
                            border: client.isHold ? "1px solid #fee2e2" : "1px solid #e2e8f0",
                            background: client.isHold ? "#fee2e2" : "white",
                            color: client.isHold ? "#ef4444" : "#475569",
                            fontWeight: 800,
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            whiteSpace: "nowrap",
                            transition: "all 0.2s ease"
                          }}
                          className="hold-client-btn"
                        >
                          {client.isHold ? "⏸ On Hold" : "▶ Hold"}
                        </button>
                      </>
                    )}
                    {role !== "recruiter" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedClient(client); setView("profile"); }}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "8px",
                          border: "1px solid #dbeafe",
                          background: "#eff6ff",
                          color: "#2563eb",
                          fontWeight: 800,
                          fontSize: "0.7rem",
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          whiteSpace: "nowrap"
                        }}
                        className="view-more-btn"
                      >
                        View More
                      </button>
                    )}
                    {canEdit && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }}
                        className="delete-node-btn"
                        style={{ 
                          background: "none", 
                          border: "none", 
                          color: "#94a3b8", 
                          cursor: "pointer", 
                          width: "30px", 
                          height: "30px", 
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <LucideTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="client-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "6px", marginBottom: "12px" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "0.8rem" }}>
                      <LucideMapPin size={14} color="#94a3b8" /> {client.location || "N/A"}
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "0.8rem" }}>
                      <LucidePhone size={14} color="#94a3b8" /> {role === "recruiter" || role === "tl" ? (client.phone ? client.phone.replace(/.(?=.{4})/g, '*') : "N/A") : (client.phone || "N/A")}
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "0.8rem", overflow: "hidden" }}>
                      <LucideMail size={14} color="#94a3b8" /> <span style={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>{role === "recruiter" || role === "tl" ? (client.email ? client.email.split("@")[0].replace(/.(?=.{2})/g, '*') + "@" + client.email.split("@")[1] : "N/A") : (client.email || "N/A")}</span>
                   </div>
                </div>

                <div className="card-footer flex-between" style={{ paddingTop: "10px", borderTop: "1px solid #f8fafc" }}>
                   <div className="contact-person">
                      <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", display: "block", fontWeight: 700 }}>Contact</span>
                      <strong style={{ fontSize: "0.85rem", color: "#334155" }}>{client.contactPerson || "-"}</strong>
                   </div>
                   <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {client.isHold && (
                        <div 
                          className="hold-status-chip" 
                          style={{ 
                            fontSize: "0.65rem", 
                            padding: "3px 8px", 
                            borderRadius: "6px", 
                            background: '#fee2e2', 
                            color: '#ef4444', 
                            fontWeight: 800
                          }}
                        >
                           HOLDED
                        </div>
                      )}
                      <div 
                        className="status-chip" 
                        style={{ 
                          fontSize: "0.65rem", 
                          padding: "3px 8px", 
                          borderRadius: "6px", 
                          background: client.status === 'active' ? '#dcfce7' : '#f1f5f9', 
                          color: client.status === 'active' ? '#166534' : '#64748b', 
                          fontWeight: 800
                        }}
                      >
                         {client.status.toUpperCase()}
                      </div>
                    </div>
                </div>

                {/* Joining Progress System */}
                {(() => {
                  const joined = candidates.filter(cand => {
                    const isCorrectClient = cand.clientName === client.name;
                    if (!isCorrectClient) return false;
                    
                    // Direct history status checks
                    const currentMatch = cand.remarks?.toLowerCase().includes("joined");
                    const historyMatch = cand.InteractionNotes?.some((n: any) => n.text?.toLowerCase().includes("joined"));
                    return currentMatch || historyMatch;
                  }).length;
                  const target = parseInt(client.joinings as string) || 1;
                  const progress = Math.min((joined / target) * 100, 100);
                  const isCompleted = joined >= target;

                  return (
                    <div style={{ marginTop: "12px", padding: "12px", background: "#fbfcfd", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Joining Progress</span>
                          <span style={{ fontSize: "0.75rem", fontWeight: 900, color: isCompleted ? "#16a34a" : "#2563eb" }}>
                            {joined} / {target} Joined
                          </span>
                       </div>
                       <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "100px", overflow: "hidden", marginBottom: "8px" }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ 
                              height: "100%", 
                              background: isCompleted ? "linear-gradient(90deg, #22c55e, #16a34a)" : "linear-gradient(90deg, #2563eb, #3b82f6)",
                              borderRadius: "100px"
                            }}
                          />
                       </div>
                       <div style={{ display: "flex", gap: "12px", fontSize: "0.65rem", fontWeight: 700 }}>
                          {client.billingDays && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748b" }}>
                               <span style={{ color: "#94a3b8" }}>BILLING:</span> {client.billingDays}
                            </div>
                          )}
                          {client.closingDate && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#2563eb" }}>
                               <span style={{ color: "#94a3b8" }}>DEADLINE:</span> {new Date(client.closingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </div>
                          )}
                       </div>
                    </div>
                  );
                })()}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <style>{`
        .client-node-card-compact:hover {
          border-color: #2563eb !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          transform: translateY(-2px);
        }
        .search-input:focus {
          border-color: #2563eb !important;
          width: 240px !important;
        }
        .delete-node-btn:hover {
          background: #fee2e2 !important;
          color: #ef4444 !important;
        }
        .edit-client-btn:hover {
          background-color: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
          color: #1e293b !important;
        }
        .hold-client-btn:hover {
          background-color: #fee2e2 !important;
          border-color: #fca5a5 !important;
          color: #ef4444 !important;
        }
        .view-more-btn:hover {
          background-color: #2563eb !important;
          color: white !important;
          border-color: #2563eb !important;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15) !important;
          transform: translateY(-1px);
        }
        .view-more-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
